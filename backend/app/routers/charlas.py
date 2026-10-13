# Enrutador de API REST para la gestión de Charlas técnicas y Grabaciones en Cloud Storage
from datetime import datetime, timezone
import uuid
import re
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status, Request, UploadFile, File
from app.database import get_firestore_client
from app.models.charla import CharlaCreate, CharlaUpdate, CharlaResponse
from app.auth import get_current_user_optional, require_admin
from app.services.storage_grabaciones import (
    listar_grabaciones_desde_storage,
    obtener_blob_grabacion,
    subir_grabacion_a_storage,
    generar_streaming_grabacion,
    normalizar_ruta_grabacion,
    extraer_nombre_archivo
)

router = APIRouter(prefix="/charlas", tags=["Charlas"])

def _enriquecer_datos_charla(data: dict) -> dict:
    """
    Enriquece el diccionario de una charla con metadatos sobre la grabación en Cloud Storage o YouTube.
    """
    charla_id = data.get("id", "")
    grabacion_archivo = (data.get("grabacion_archivo") or "").strip()
    grabacion_url = (data.get("grabacion_url") or "").strip()

    tipo_grabacion = None
    grabacion_gcs = None
    grabacion_stream_url = None
    tiene_grabacion = False

    # Identificador ingresado (puede ser solo el nombre del archivo o una URL externa)
    identificador = grabacion_archivo or grabacion_url

    if identificador:
        # Detectar si es un video de YouTube
        if "youtube.com" in identificador or "youtu.be" in identificador:
            tipo_grabacion = "youtube"
            tiene_grabacion = True
            grabacion_url = identificador
            grabacion_archivo = None
        # Detectar si es un archivo de Cloud Storage (nombre de archivo simple o ruta en Cloud Storage)
        elif not identificador.startswith("http"):
            tipo_grabacion = "gcs"
            archivo_limpio = extraer_nombre_archivo(identificador)
            grabacion_archivo = archivo_limpio
            grabacion_gcs = f"//comunidadgcp/grabaciones/{archivo_limpio}"
            grabacion_url = grabacion_gcs
            grabacion_stream_url = f"/api/v1/charlas/{charla_id}/video"
            tiene_grabacion = True
        else:
            tipo_grabacion = "externo"
            tiene_grabacion = True
            grabacion_url = identificador
    else:
        # Si no tiene archivo configurado explícitamente, verificar si existe un archivo con el ID de la charla en Cloud Storage
        blob_candidato = obtener_blob_grabacion(f"{charla_id}.mp4")
        if blob_candidato:
            tipo_grabacion = "gcs"
            grabacion_archivo = f"{charla_id}.mp4"
            grabacion_gcs = f"//comunidadgcp/grabaciones/{charla_id}.mp4"
            grabacion_url = grabacion_gcs
            grabacion_stream_url = f"/api/v1/charlas/{charla_id}/video"
            tiene_grabacion = True

    data["tipo_grabacion"] = tipo_grabacion
    data["grabacion_gcs"] = grabacion_gcs
    data["grabacion_archivo"] = grabacion_archivo if grabacion_archivo else None
    data["grabacion_stream_url"] = grabacion_stream_url
    data["tiene_grabacion"] = tiene_grabacion
    data["grabacion_url"] = grabacion_url if grabacion_url else None

    return data

@router.get("/grabaciones", summary="Listar grabaciones en Cloud Storage")
async def listar_grabaciones():
    """
    Lista todos los archivos de video almacenados en //comunidadgcp/grabaciones/ de Google Cloud Storage.
    Permite a los administradores y usuarios ver las grabaciones disponibles.
    """
    try:
        return listar_grabaciones_desde_storage()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar grabaciones de Cloud Storage: {str(e)}"
        )

@router.post("/grabaciones/upload", summary="Subir grabación a Cloud Storage")
async def subir_grabacion(
    archivo: UploadFile = File(...),
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Sube una nueva grabación de video directamente a //comunidadgcp/grabaciones/.
    """
    try:
        contenido = await archivo.read()
        resultado = subir_grabacion_a_storage(
            nombre_archivo=archivo.filename,
            contenido_bytes=contenido,
            content_type=archivo.content_type or "video/mp4"
        )
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir grabación a Cloud Storage: {str(e)}"
        )

@router.api_route("/grabaciones/stream/{nombre_archivo:path}", methods=["GET", "HEAD"], summary="Streaming directo de grabación por archivo")
async def stream_archivo_grabacion(
    nombre_archivo: str,
    request: Request
):
    """
    Transmite cualquier archivo de video alojado en //comunidadgcp/grabaciones/ de Cloud Storage.
    Soporta solicitudes de rango de bytes (HTTP 206 Partial Content) para adelantar o retroceder el video,
    y peticiones HEAD para compatibilidad con reproductores HTML5.
    """
    blob = obtener_blob_grabacion(nombre_archivo)
    if not blob:
        raise HTTPException(status_code=404, detail="Archivo de grabación no encontrado en Cloud Storage.")

    range_header = request.headers.get("range")
    return generar_streaming_grabacion(blob, range_header, is_head=(request.method == "HEAD"))

@router.api_route("/{charla_id}/video", methods=["GET", "HEAD"], summary="Streaming de video de una charla técnica")
async def stream_video_charla(
    charla_id: str,
    request: Request
):
    """
    Endpoint de streaming para reproducir la grabación de una charla técnica directamente en el navegador.
    Lee el archivo de video desde Google Cloud Storage (//comunidadgcp/grabaciones/) con soporte de rangos.
    Cualquier usuario puede ver las grabaciones desde la página.
    """
    db = get_firestore_client()
    doc_ref = db.collection("charlas").document(charla_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Charla técnica no encontrada.")

    data = doc.to_dict()
    grabacion_archivo = data.get("grabacion_archivo")
    grabacion_url = data.get("grabacion_url", "")

    # Determinar el blob asociado en Cloud Storage
    blob = None
    if grabacion_archivo:
        blob = obtener_blob_grabacion(grabacion_archivo)
    elif grabacion_url:
        blob = obtener_blob_grabacion(grabacion_url)

    # Si no se encuentra con la URL o archivo directo, intentar buscar por el ID de la charla
    if not blob:
        blob = obtener_blob_grabacion(f"{charla_id}.mp4")

    if not blob:
        raise HTTPException(
            status_code=404, 
            detail=f"La grabación en video para esta charla no está disponible o aún no se ha subido a //comunidadgcp/grabaciones/."
        )

    range_header = request.headers.get("range")
    return generar_streaming_grabacion(blob, range_header, is_head=(request.method == "HEAD"))

@router.get("", response_model=List[CharlaResponse])
async def listar_charlas(
    estado: Optional[str] = Query(None, description="Filtrar por estado: 'pendiente' o 'realizada'"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Lista las charlas técnicas organizadas por la Comunidad GCP.
    Permite filtrar por charlas pendientes o realizadas.
    Enriquece automáticamente las grabaciones alojadas en Google Cloud Storage.
    """
    db = get_firestore_client()
    coleccion = db.collection("charlas")
    charlas = []

    try:
        docs = coleccion.stream()
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            
            # Filtro opcional por estado
            if estado and data.get("estado") != estado:
                continue

            # Ocultar enlace de Google Meet para visitantes no autenticados
            if not current_user and data.get("meet_id"):
                data["meet_id"] = "Inicia sesión con Google para ver el enlace de Meet"

            # Enriquecer datos con enlaces y streaming de grabaciones
            data = _enriquecer_datos_charla(data)
            charlas.append(data)

        # Ordenar por fecha_hora de manera descendente
        charlas.sort(key=lambda x: x.get("fecha_hora", ""), reverse=True)
        return charlas

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar charlas en Firestore: {str(e)}"
        )

@router.get("/{charla_id}", response_model=CharlaResponse)
async def obtener_charla(
    charla_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Obtiene los detalles específicos de una charla técnica por su ID.
    """
    db = get_firestore_client()
    doc_ref = db.collection("charlas").document(charla_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Charla técnica no encontrada.")

    data = doc.to_dict()
    data["id"] = doc.id

    if not current_user and data.get("meet_id"):
        data["meet_id"] = "Inicia sesión con Google para ver el enlace de Meet"

    data = _enriquecer_datos_charla(data)
    return data

@router.post("", response_model=CharlaResponse, status_code=status.HTTP_201_CREATED)
async def crear_charla(
    charla: CharlaCreate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Crea una nueva charla técnica periódica.
    Las grabaciones de Cloud Storage se normalizan automáticamente a //comunidadgcp/grabaciones/.
    """
    db = get_firestore_client()
    nuevo_id = f"charla-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}"
    datos = charla.model_dump()
    datos["creado_en"] = datetime.now(timezone.utc).isoformat()
    datos["creado_por"] = admin_user.get("email", "admin")

    # Procesar campo opcional de grabación (únicamente nombre del archivo en //comunidadgcp/grabaciones/)
    archivo_grabacion = datos.get("grabacion_archivo") or datos.get("grabacion_url")
    if archivo_grabacion and str(archivo_grabacion).strip():
        archivo_strip = str(archivo_grabacion).strip()
        if "youtube.com" not in archivo_strip and "youtu.be" not in archivo_strip and not archivo_strip.startswith("http"):
            # Extraer y almacenar exclusivamente el nombre del archivo
            nombre_archivo = extraer_nombre_archivo(archivo_strip)
            datos["grabacion_archivo"] = nombre_archivo
            datos["grabacion_url"] = f"//comunidadgcp/grabaciones/{nombre_archivo}"
        else:
            datos["grabacion_archivo"] = None
            datos["grabacion_url"] = archivo_strip
    else:
        datos["grabacion_archivo"] = None
        datos["grabacion_url"] = None

    try:
        db.collection("charlas").document(nuevo_id).set(datos)
        datos["id"] = nuevo_id
        datos = _enriquecer_datos_charla(datos)
        return datos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar la charla en Firestore: {str(e)}"
        )

@router.put("/{charla_id}", response_model=CharlaResponse)
async def actualizar_charla(
    charla_id: str,
    charla_update: CharlaUpdate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Actualiza una charla existente (ej. marcar como realizada y cargar grabación en Cloud Storage).
    """
    db = get_firestore_client()
    doc_ref = db.collection("charlas").document(charla_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Charla técnica no encontrada.")

    datos_actualizados = {k: v for k, v in charla_update.model_dump().items() if v is not None}
    datos_actualizados["actualizado_en"] = datetime.now(timezone.utc).isoformat()

    # Procesar campo opcional de grabación por nombre de archivo
    if "grabacion_archivo" in datos_actualizados or "grabacion_url" in datos_actualizados:
        archivo_grabacion = datos_actualizados.get("grabacion_archivo") or datos_actualizados.get("grabacion_url")
        if archivo_grabacion and str(archivo_grabacion).strip():
            archivo_strip = str(archivo_grabacion).strip()
            if "youtube.com" not in archivo_strip and "youtu.be" not in archivo_strip and not archivo_strip.startswith("http"):
                nombre_archivo = extraer_nombre_archivo(archivo_strip)
                datos_actualizados["grabacion_archivo"] = nombre_archivo
                datos_actualizados["grabacion_url"] = f"//comunidadgcp/grabaciones/{nombre_archivo}"
            else:
                datos_actualizados["grabacion_archivo"] = None
                datos_actualizados["grabacion_url"] = archivo_strip
        else:
            datos_actualizados["grabacion_archivo"] = None
            datos_actualizados["grabacion_url"] = None

    try:
        doc_ref.set(datos_actualizados, merge=True)
        resultado = doc_ref.get().to_dict()
        resultado["id"] = charla_id
        resultado = _enriquecer_datos_charla(resultado)
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la charla: {str(e)}"
        )

@router.delete("/{charla_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_charla(
    charla_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Elimina una charla del sistema.
    """
    db = get_firestore_client()
    doc_ref = db.collection("charlas").document(charla_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Charla técnica no encontrada.")

    try:
        doc_ref.delete()
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la charla: {str(e)}"
        )
