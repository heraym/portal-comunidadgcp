# Servicio para la gestión y visualización de Newsletters en Google Cloud Storage (.md)
import os
import re
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import yaml
from google.cloud import storage
from app.config import settings

# Cliente en caché para evitar reinicializaciones continuas
_storage_client: Optional[storage.Client] = None

def get_storage_client() -> storage.Client:
    """
    Retorna una instancia autenticada del cliente de Google Cloud Storage.
    """
    global _storage_client
    if _storage_client is None:
        # Se inicializa utilizando las credenciales predeterminadas de la aplicación (ADC)
        _storage_client = storage.Client(project=settings.GCP_PROJECT_ID)
    return _storage_client

def get_newsletters_bucket():
    """
    Retorna la referencia al bucket de Cloud Storage donde se alojan los newsletters.
    """
    client = get_storage_client()
    return client.bucket(settings.GCS_NEWSLETTERS_BUCKET)

def _extraer_metadatos_y_cuerpo_markdown(contenido: str, nombre_archivo: str, blob_updated: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Parsea un archivo Markdown con o sin frontmatter YAML y extrae los metadatos estructurados.
    """
    meta: Dict[str, Any] = {}
    cuerpo = contenido

    # Detectar bloque de metadatos YAML frontmatter (delimitado por ---)
    if contenido.startswith("---"):
        partes = contenido.split("---", 2)
        if len(partes) >= 3:
            try:
                parsed_yaml = yaml.safe_load(partes[1])
                if isinstance(parsed_yaml, dict):
                    meta = parsed_yaml
                cuerpo = partes[2].strip()
            except Exception as err:
                print(f"Advertencia: No se pudo parsear frontmatter YAML en {nombre_archivo}: {err}")

    # Determinar el título del newsletter
    titulo = meta.get("titulo")
    if not titulo:
        for linea in cuerpo.splitlines():
            linea_limpia = linea.strip()
            if linea_limpia.startswith("# "):
                titulo = linea_limpia[2:].strip()
                break
    if not titulo:
        # Nombre de respaldo derivado del nombre de archivo
        base = nombre_archivo.replace(".md", "").replace(".markdown", "").replace("-", " ")
        titulo = base.title()

    # Determinar el número secuencial de edición
    numero_edicion = meta.get("numero_edicion")
    if numero_edicion is None:
        # Intentar extraer mediante expresión regular del nombre de archivo o título
        coincidencia = re.search(r"(?:edicion[-_#\s]*|ed[-_#\s]*|#)(\d+)", nombre_archivo, re.IGNORECASE)
        if not coincidencia:
            coincidencia = re.search(r"(?:edicion[-_#\s]*|ed[-_#\s]*|#)(\d+)", titulo, re.IGNORECASE)
        
        if coincidencia:
            try:
                numero_edicion = int(coincidencia.group(1))
            except ValueError:
                numero_edicion = 1
        else:
            numero_edicion = 1

    # Determinar el resumen ejecutivo
    resumen = meta.get("resumen")
    if not resumen:
        # Extraer el primer párrafo significativo que no sea un encabezado, separador ni comentario HTML
        for parrafo in cuerpo.split("\n\n"):
            p_strip = parrafo.strip()
            if p_strip.startswith("<!--"):
                continue
            if p_strip and not p_strip.startswith("#") and not p_strip.startswith("---") and not p_strip.startswith(">"):
                # Limpiar saltos de línea internos
                limpio = re.sub(r"\s+", " ", p_strip)
                resumen = limpio[:280] + ("..." if len(limpio) > 280 else "")
                break

    # Si aún no hay resumen, verificar si existía un comentario explicativo HTML <!-- ... -->
    if not resumen:
        for parrafo in cuerpo.split("\n\n"):
            p_strip = parrafo.strip()
            if p_strip.startswith("<!--") and p_strip.endswith("-->"):
                resumen = p_strip[4:-3].strip()
                break

    if not resumen:
        resumen = "Boletín técnico mensual con análisis y mejores prácticas de Google Cloud."

    # Fecha de emisión
    fecha_emision = meta.get("fecha_emision")
    if not fecha_emision:
        if blob_updated:
            fecha_emision = blob_updated.isoformat()
        else:
            fecha_emision = datetime.now(timezone.utc).isoformat()

    autor = meta.get("autor", "Equipo Editorial Comunidad GCP")
    temas_clave = meta.get("temas_clave", [])
    if isinstance(temas_clave, str):
        temas_clave = [t.strip() for t in temas_clave.split(",") if t.strip()]

    # Si no se definieron temas clave en los metadatos, extraerlos a partir de las secciones Markdown (## )
    if not temas_clave:
        for linea in cuerpo.splitlines():
            l_strip = linea.strip()
            if l_strip.startswith("## "):
                tema = l_strip[3:].strip()
                # Limpiar emojis o caracteres especiales de adorno
                tema_limpio = re.sub(r"[^\w\s\-\/\.]", "", tema).strip()
                if tema_limpio and len(tema_limpio) < 40 and tema_limpio not in temas_clave:
                    temas_clave.append(tema_limpio)
        temas_clave = temas_clave[:5]

    # URL pública o de descarga si existiese
    documento_url = meta.get("documento_url")
    if not documento_url:
        documento_url = f"https://storage.cloud.google.com/{settings.GCS_NEWSLETTERS_BUCKET}/{settings.GCS_NEWSLETTERS_PREFIX}{nombre_archivo}"

    id_limpio = nombre_archivo.replace(".md", "").replace(".markdown", "").strip()

    return {
        "id": id_limpio,
        "numero_edicion": int(numero_edicion),
        "titulo": str(titulo),
        "resumen": str(resumen),
        "contenido_markdown": cuerpo,
        "documento_url": documento_url,
        "autor": str(autor),
        "fecha_emision": str(fecha_emision),
        "temas_clave": temas_clave,
        "archivo_nombre": nombre_archivo,
        "archivo_url": f"gs://{settings.GCS_NEWSLETTERS_BUCKET}/{settings.GCS_NEWSLETTERS_PREFIX}{nombre_archivo}",
        "origen": "cloud_storage"
    }

def listar_newsletters_desde_storage() -> List[Dict[str, Any]]:
    """
    Obtiene y procesa todos los archivos Markdown (.md) alojados en la carpeta de Cloud Storage.
    """
    bucket = get_newsletters_bucket()
    prefijo = settings.GCS_NEWSLETTERS_PREFIX
    blobs = bucket.list_blobs(prefix=prefijo)
    newsletters: List[Dict[str, Any]] = []

    for blob in blobs:
        # Filtrar solo archivos con extensión .md o .markdown (ignorar carpetas o marcadores vacíos)
        if not (blob.name.endswith(".md") or blob.name.endswith(".markdown")):
            continue

        try:
            contenido_md = blob.download_as_text(encoding="utf-8")
            nombre_archivo = blob.name.split("/")[-1]
            data = _extraer_metadatos_y_cuerpo_markdown(
                contenido=contenido_md,
                nombre_archivo=nombre_archivo,
                blob_updated=blob.updated
            )
            data["tamano_bytes"] = blob.size
            newsletters.append(data)
        except Exception as err:
            print(f"Error al leer el archivo {blob.name} desde Cloud Storage: {err}")

    # Ordenar por número de edición descendente
    newsletters.sort(key=lambda x: x.get("numero_edicion", 0), reverse=True)
    return newsletters

def obtener_newsletter_desde_storage(newsletter_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene un archivo Markdown específico desde Cloud Storage por su identificador.
    """
    bucket = get_newsletters_bucket()
    prefijo = settings.GCS_NEWSLETTERS_PREFIX

    # Posibles nombres del archivo
    candidatos = [
        f"{prefijo}{newsletter_id}.md",
        f"{prefijo}{newsletter_id}.markdown",
        f"{prefijo}{newsletter_id}"
    ]

    for nombre_blob in candidatos:
        blob = bucket.blob(nombre_blob)
        if blob.exists():
            contenido_md = blob.download_as_text(encoding="utf-8")
            nombre_archivo = blob.name.split("/")[-1]
            data = _extraer_metadatos_y_cuerpo_markdown(
                contenido=contenido_md,
                nombre_archivo=nombre_archivo,
                blob_updated=blob.updated
            )
            data["tamano_bytes"] = blob.size
            return data

    return None

def guardar_newsletter_en_storage(newsletter_id: str, datos: Dict[str, Any]) -> Dict[str, Any]:
    """
    Genera y almacena un archivo Markdown (.md) en el bucket de Cloud Storage con frontmatter YAML.
    """
    bucket = get_newsletters_bucket()
    prefijo = settings.GCS_NEWSLETTERS_PREFIX
    nombre_archivo = f"{newsletter_id}.md"
    blob = bucket.blob(f"{prefijo}{nombre_archivo}")

    # Preparar el encabezado YAML frontmatter
    meta_dict = {
        "numero_edicion": datos.get("numero_edicion", 1),
        "titulo": datos.get("titulo", "Newsletter Sin Título"),
        "fecha_emision": datos.get("fecha_emision", datetime.now(timezone.utc).isoformat()),
        "autor": datos.get("autor", "Equipo Editorial Comunidad GCP"),
        "resumen": datos.get("resumen", ""),
        "temas_clave": datos.get("temas_clave", [])
    }
    if datos.get("documento_url"):
        meta_dict["documento_url"] = datos.get("documento_url")

    yaml_frontmatter = yaml.dump(meta_dict, allow_unicode=True, sort_keys=False)
    cuerpo_md = datos.get("contenido_markdown", "").strip()

    documento_completo = f"---\n{yaml_frontmatter}---\n\n{cuerpo_md}\n"
    blob.upload_from_string(documento_completo, content_type="text/markdown; charset=utf-8")

    datos_retorno = dict(datos)
    datos_retorno["id"] = newsletter_id
    datos_retorno["archivo_nombre"] = nombre_archivo
    datos_retorno["archivo_url"] = f"gs://{settings.GCS_NEWSLETTERS_BUCKET}/{prefijo}{nombre_archivo}"
    datos_retorno["tamano_bytes"] = len(documento_completo.encode("utf-8"))
    datos_retorno["origen"] = "cloud_storage"

    return datos_retorno

def eliminar_newsletter_de_storage(newsletter_id: str) -> bool:
    """
    Elimina el archivo Markdown correspondiente en el bucket de Cloud Storage.
    """
    bucket = get_newsletters_bucket()
    prefijo = settings.GCS_NEWSLETTERS_PREFIX

    candidatos = [
        f"{prefijo}{newsletter_id}.md",
        f"{prefijo}{newsletter_id}.markdown",
        f"{prefijo}{newsletter_id}"
    ]

    for nombre_blob in candidatos:
        blob = bucket.blob(nombre_blob)
        if blob.exists():
            blob.delete()
            return True

    return False
