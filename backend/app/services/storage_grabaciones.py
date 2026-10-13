# Servicio para la gestión, almacenamiento y transmisión de grabaciones de video en Google Cloud Storage
import os
import re
import urllib.parse
from typing import List, Optional, Dict, Any, Generator, Union
from datetime import datetime, timezone
from google.cloud import storage
from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse, Response
from app.config import settings

# Cliente en memoria caché para evitar reinicializaciones continuas
_storage_client: Optional[storage.Client] = None

def get_storage_client() -> storage.Client:
    """
    Retorna una instancia autenticada del cliente de Google Cloud Storage.
    """
    global _storage_client
    if _storage_client is None:
        # Inicializa utilizando las credenciales predeterminadas de la aplicación (ADC)
        _storage_client = storage.Client(project=settings.GCP_PROJECT_ID)
    return _storage_client

def get_grabaciones_bucket():
    """
    Retorna la referencia al bucket de Cloud Storage configurado para grabaciones.
    """
    client = get_storage_client()
    return client.bucket(settings.GCS_GRABACIONES_BUCKET)

def _formatear_tamano(bytes_count: int) -> str:
    """
    Convierte bytes a un formato legible por humanos (KB, MB, GB).
    """
    if bytes_count < 1024:
        return f"{bytes_count} B"
    elif bytes_count < 1024 * 1024:
        return f"{bytes_count / 1024:.1f} KB"
    elif bytes_count < 1024 * 1024 * 1024:
        return f"{bytes_count / (1024 * 1024):.1f} MB"
    else:
        return f"{bytes_count / (1024 * 1024 * 1024):.2f} GB"

def normalizar_ruta_grabacion(ruta_o_url: str) -> str:
    """
    Normaliza cualquier referencia o nombre de archivo al formato canónico '//comunidadgcp/grabaciones/archivo'.
    """
    if not ruta_o_url:
        return ""
    texto = ruta_o_url.strip()
    
    # Si ya es un enlace externo (como YouTube o Vimeo), se mantiene intacto
    if texto.startswith("http://") or texto.startswith("https://"):
        if "storage.googleapis.com" not in texto and "storage.cloud.google.com" not in texto:
            return texto

    # Remover prefijos de protocolo o barras iniciales
    texto = re.sub(r"^(?:gs:\/\/|https?:\/\/storage\.(?:googleapis|cloud\.google)\.com\/)", "", texto)
    texto = texto.lstrip("/")

    bucket = settings.GCS_GRABACIONES_BUCKET
    prefix = settings.GCS_GRABACIONES_PREFIX.strip("/")

    # Remover nombre de bucket si viene incluido
    if texto.startswith(f"{bucket}/"):
        texto = texto[len(bucket) + 1:]

    # Remover prefijo de grabaciones si viene incluido
    if texto.startswith(f"{prefix}/"):
        texto = texto[len(prefix) + 1:]

    nombre_archivo = os.path.basename(texto)
    return f"//{bucket}/{prefix}/{nombre_archivo}"

def extraer_nombre_archivo(ruta_o_url: str) -> str:
    """
    Extrae únicamente el nombre del archivo a partir de una ruta o URL de Cloud Storage.
    """
    if not ruta_o_url:
        return ""
    
    texto = urllib.parse.unquote(ruta_o_url.strip())
    # Si contiene parámetros de consulta URL, removerlos
    if "?" in texto:
        texto = texto.split("?")[0]
        
    partes = texto.rstrip("/").split("/")
    return partes[-1] if partes else texto

def listar_grabaciones_desde_storage() -> List[Dict[str, Any]]:
    """
    Lista todos los archivos de video disponibles en el bucket y carpeta de grabaciones.
    """
    bucket = get_grabaciones_bucket()
    prefijo = settings.GCS_GRABACIONES_PREFIX
    blobs = bucket.list_blobs(prefix=prefijo)
    grabaciones: List[Dict[str, Any]] = []

    # Extensiones de video y multimedia válidas
    extensiones_validas = (".mp4", ".webm", ".mkv", ".mov", ".m4v", ".avi")

    for blob in blobs:
        # Excluir la carpeta raíz vacía si aparece como blob
        if blob.name == prefijo or blob.name.endswith("/"):
            continue

        nombre_archivo = extraer_nombre_archivo(blob.name)
        if not any(nombre_archivo.lower().endswith(ext) for ext in extensiones_validas):
            # También aceptar si no tiene extensión pero no está vacío
            if not nombre_archivo:
                continue

        tamano = blob.size or 0
        actualizado = blob.updated.isoformat() if blob.updated else datetime.now(timezone.utc).isoformat()
        
        grabaciones.append({
            "nombre_archivo": nombre_archivo,
            "ruta_gcs": f"//{settings.GCS_GRABACIONES_BUCKET}/{prefijo}{nombre_archivo}",
            "gs_url": f"gs://{settings.GCS_GRABACIONES_BUCKET}/{blob.name}",
            "tamano_bytes": tamano,
            "tamano_legible": _formatear_tamano(tamano),
            "content_type": blob.content_type or "video/mp4",
            "actualizado_en": actualizado
        })

    # Ordenar por fecha de actualización descendente (los más recientes primero)
    grabaciones.sort(key=lambda x: x.get("actualizado_en", ""), reverse=True)
    return grabaciones

def obtener_blob_grabacion(identificador_o_ruta: str) -> Optional[storage.Blob]:
    """
    Localiza un blob de grabación en Cloud Storage tolerando múltiples formatos de nombre o ruta.
    """
    if not identificador_o_ruta:
        return None

    bucket = get_grabaciones_bucket()
    prefijo = settings.GCS_GRABACIONES_PREFIX
    identificador_limpio = urllib.parse.unquote(identificador_o_ruta.strip())
    nombre_archivo = extraer_nombre_archivo(identificador_limpio)

    # Posibles rutas relativas dentro del bucket
    candidatos = [
        f"{prefijo}{nombre_archivo}",
        nombre_archivo,
        f"{prefijo}{identificador_limpio}",
        identificador_limpio.lstrip("/"),
        identificador_o_ruta.lstrip("/")
    ]

    for ruta in candidatos:
        blob = bucket.blob(ruta)
        if blob.exists():
            blob.reload()
            return blob

    return None

def subir_grabacion_a_storage(
    nombre_archivo: str,
    contenido_bytes: bytes,
    content_type: str = "video/mp4"
) -> Dict[str, Any]:
    """
    Sube un archivo de video directamente a la carpeta //comunidadgcp/grabaciones/ en Cloud Storage.
    """
    bucket = get_grabaciones_bucket()
    prefijo = settings.GCS_GRABACIONES_PREFIX
    
    # Limpiar caracteres potencialmente inseguros en el nombre del archivo
    nombre_seguro = re.sub(r"[^\w\.\-\_]", "_", nombre_archivo)
    if not any(nombre_seguro.lower().endswith(ext) for ext in (".mp4", ".webm", ".mkv", ".mov")):
        nombre_seguro += ".mp4"

    blob_path = f"{prefijo}{nombre_seguro}"
    blob = bucket.blob(blob_path)
    blob.upload_from_string(contenido_bytes, content_type=content_type)
    blob.reload()

    tamano = blob.size or len(contenido_bytes)
    return {
        "nombre_archivo": nombre_seguro,
        "ruta_gcs": f"//{settings.GCS_GRABACIONES_BUCKET}/{prefijo}{nombre_seguro}",
        "gs_url": f"gs://{settings.GCS_GRABACIONES_BUCKET}/{blob_path}",
        "tamano_bytes": tamano,
        "tamano_legible": _formatear_tamano(tamano),
        "content_type": content_type
    }

# Tamaño máximo de fragmento por respuesta HTTP para Cloud Run (4 MB, para inicio rápido y holgura ante el límite de 32 MiB)
CHUNK_MAX_SIZE = 4 * 1024 * 1024

def generar_streaming_grabacion(
    blob: storage.Blob, 
    range_header: Optional[str] = None,
    is_head: bool = False
) -> Union[Response, StreamingResponse]:
    """
    Genera una respuesta StreamingResponse optimizada para reproductores de video HTML5,
    con soporte completo para solicitudes de rangos de bytes (HTTP 206 Partial Content) y HEAD.
    Limita el bloque devuelto a un máximo de 4 MB para inicio instantáneo y respetar estrictamente los límites de Cloud Run.
    """
    total_size = blob.size
    content_type = blob.content_type or "video/mp4"

    # Soporte nativo para solicitudes HEAD (utilizadas por navegadores para inspeccionar metadatos de video)
    if is_head:
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(total_size),
            "Content-Type": content_type,
            "Cache-Control": "public, max-age=3600"
        }
        return Response(status_code=status.HTTP_200_OK, headers=headers)

    # Si la petición incluye cabecera Range (ej. 'bytes=0-1048575' o 'bytes=0-')
    if range_header and range_header.strip().startswith("bytes="):
        range_val = range_header.strip().replace("bytes=", "")
        partes = range_val.split("-")
        try:
            start = int(partes[0]) if partes[0] else 0
            if len(partes) > 1 and partes[1]:
                solicitado_end = int(partes[1])
                # Limitar el bloque al máximo permitido para no desbordar el búfer de Cloud Run
                end = min(solicitado_end, start + CHUNK_MAX_SIZE - 1, total_size - 1)
            else:
                end = min(start + CHUNK_MAX_SIZE - 1, total_size - 1)
        except ValueError:
            start = 0
            end = min(CHUNK_MAX_SIZE - 1, total_size - 1)

        if start >= total_size:
            raise HTTPException(
                status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
                detail="El rango solicitado excede el tamaño del video",
                headers={"Content-Range": f"bytes */{total_size}"}
            )

        if end >= total_size:
            end = total_size - 1

        longitud_contenido = (end - start) + 1

        def generador_rango(inicio: int, fin: int, tamano_chunk: int = 1024 * 1024) -> Generator[bytes, None, None]:
            # Descarga de forma eficiente en bloques de 1MB desde Cloud Storage
            pos_actual = inicio
            while pos_actual <= fin:
                siguiente_pos = min(pos_actual + tamano_chunk - 1, fin)
                chunk = blob.download_as_bytes(start=pos_actual, end=siguiente_pos)
                if not chunk:
                    break
                yield chunk
                pos_actual = siguiente_pos + 1

        headers = {
            "Content-Range": f"bytes {start}-{end}/{total_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(longitud_contenido),
            "Content-Type": content_type,
            "Cache-Control": "public, max-age=3600"
        }

        return StreamingResponse(
            generador_rango(start, end),
            status_code=status.HTTP_206_PARTIAL_CONTENT,
            headers=headers
        )

    # Si no se solicitó rango pero el video excede el límite seguro de Cloud Run,
    # servir el primer fragmento con 206 Partial Content indicando soporte de rangos
    if total_size > CHUNK_MAX_SIZE:
        start = 0
        end = min(CHUNK_MAX_SIZE - 1, total_size - 1)
        longitud_contenido = (end - start) + 1

        def generador_inicial(fin: int, tamano_chunk: int = 1024 * 1024) -> Generator[bytes, None, None]:
            pos_actual = 0
            while pos_actual <= fin:
                siguiente_pos = min(pos_actual + tamano_chunk - 1, fin)
                chunk = blob.download_as_bytes(start=pos_actual, end=siguiente_pos)
                if not chunk:
                    break
                yield chunk
                pos_actual = siguiente_pos + 1

        headers = {
            "Content-Range": f"bytes 0-{end}/{total_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(longitud_contenido),
            "Content-Type": content_type,
            "Cache-Control": "public, max-age=3600"
        }

        return StreamingResponse(
            generador_inicial(end),
            status_code=status.HTTP_206_PARTIAL_CONTENT,
            headers=headers
        )

    # Si el archivo completo es menor a CHUNK_MAX_SIZE, transmitirlo completo
    def generador_completo(tamano_chunk: int = 512 * 1024) -> Generator[bytes, None, None]:
        pos_actual = 0
        while pos_actual < total_size:
            siguiente_pos = min(pos_actual + tamano_chunk - 1, total_size - 1)
            chunk = blob.download_as_bytes(start=pos_actual, end=siguiente_pos)
            if not chunk:
                break
            yield chunk
            pos_actual = siguiente_pos + 1

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(total_size),
        "Content-Type": content_type,
        "Cache-Control": "public, max-age=3600"
    }

    return StreamingResponse(
        generador_completo(),
        status_code=status.HTTP_200_OK,
        headers=headers
    )
