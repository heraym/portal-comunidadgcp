# Enrutador de API REST para la gestión de Noticias alojadas como archivos Markdown (.md) en Cloud Storage
from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status, Response
from fastapi.responses import PlainTextResponse
from app.database import get_firestore_client
from app.models.noticia import NoticiaCreate, NoticiaUpdate, NoticiaResponse
from app.auth import get_current_user, require_admin
from app.services.storage_noticias import (
    listar_noticias_desde_storage,
    obtener_noticia_desde_storage,
    guardar_noticia_en_storage,
    eliminar_noticia_de_storage
)

router = APIRouter(prefix="/noticias", tags=["Noticias"])

@router.get("", response_model=List[NoticiaResponse])
async def listar_noticias(
    categoria: Optional[str] = Query(None, description="Filtrar por categoría de producto"),
    destacadas: Optional[bool] = Query(None, description="Filtrar noticias destacadas"),
    current_user: dict = Depends(get_current_user)
):
    """
    Lista las noticias de Google Cloud leyendo directamente los archivos Markdown (.md)
    almacenados en el bucket de Google Cloud Storage (comunidadgcp/noticias).
    """
    noticias: List[dict] = []
    ids_procesados = set()

    # 1. Intentar consultar en primer lugar los archivos Markdown (.md) desde Cloud Storage
    try:
        storage_noticias = listar_noticias_desde_storage()
        for item in storage_noticias:
            noticias.append(item)
            ids_procesados.add(item["id"])
    except Exception as e:
        print(f"Advertencia: Error al consultar noticias desde Cloud Storage: {e}")

    # 2. Consultar Firestore para integrar noticias registradas previamente en base de datos
    try:
        db = get_firestore_client()
        docs = db.collection("noticias").stream()
        for doc in docs:
            doc_id = doc.id
            if doc_id not in ids_procesados:
                data = doc.to_dict()
                data["id"] = doc_id
                data["origen"] = "firestore"
                noticias.append(data)
                ids_procesados.add(doc_id)
    except Exception as e:
        print(f"Advertencia: Error al consultar noticias desde Firestore: {e}")

    # 3. Aplicar filtros solicitados
    noticias_filtradas = []
    for data in noticias:
        if categoria and data.get("categoria", "").lower() != categoria.lower():
            continue
        if destacadas is not None and bool(data.get("destacada")) != destacadas:
            continue
        noticias_filtradas.append(data)

    # Ordenar por fecha de publicación descendente
    noticias_filtradas.sort(key=lambda x: x.get("fecha_publicacion", ""), reverse=True)
    return noticias_filtradas

@router.get("/{noticia_id}", response_model=NoticiaResponse)
async def obtener_noticia(
    noticia_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene el detalle y contenido Markdown completo de una noticia.
    """
    # 1. Buscar en Cloud Storage por nombre de archivo o ID
    try:
        item = obtener_noticia_desde_storage(noticia_id)
        if item:
            return item
    except Exception as e:
        print(f"Advertencia al consultar noticia en Cloud Storage: {e}")

    # 2. Buscar como respaldo en Firestore
    try:
        db = get_firestore_client()
        doc_ref = db.collection("noticias").document(noticia_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            data["origen"] = "firestore"
            return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar la noticia: {str(e)}"
        )

    raise HTTPException(status_code=404, detail="Noticia no encontrada.")

@router.get("/{noticia_id}/raw", response_class=PlainTextResponse)
async def descargar_o_ver_raw_markdown(
    noticia_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retorna el contenido crudo en formato Markdown (.md) de la noticia para descarga o lectura.
    """
    item = obtener_noticia_desde_storage(noticia_id)
    if not item:
        db = get_firestore_client()
        doc = db.collection("noticias").document(noticia_id).get()
        if doc.exists:
            item = doc.to_dict()

    if not item:
        raise HTTPException(status_code=404, detail="Archivo Markdown no encontrado.")

    contenido = item.get("contenido_completo", "")
    headers = {
        "Content-Disposition": f'inline; filename="{noticia_id}.md"',
        "Content-Type": "text/markdown; charset=utf-8"
    }
    return Response(content=contenido, media_type="text/markdown", headers=headers)

@router.put("/{noticia_id}", response_model=NoticiaResponse)
async def actualizar_noticia(
    noticia_id: str,
    noticia_update: NoticiaUpdate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Actualiza una noticia y sincroniza su archivo Markdown en Cloud Storage.
    """
    datos_actualizados = {k: v for k, v in noticia_update.model_dump().items() if v is not None}
    datos_actualizados["actualizado_en"] = datetime.now(timezone.utc).isoformat()

    # 1. Actualizar el archivo en Cloud Storage
    try:
        guardar_noticia_en_storage(noticia_id, datos_actualizados)
    except Exception as e:
        print(f"Advertencia al actualizar noticia en Cloud Storage: {e}")

    # 2. Actualizar también en Firestore para mantener coherencia
    try:
        db = get_firestore_client()
        doc_ref = db.collection("noticias").document(noticia_id)
        doc_ref.set(datos_actualizados, merge=True)
        resultado = doc_ref.get().to_dict()
        resultado["id"] = noticia_id
        return resultado
    except Exception as e:
        item_storage = obtener_noticia_desde_storage(noticia_id)
        if item_storage:
            return item_storage
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar noticia: {str(e)}"
        )

@router.post("", response_model=NoticiaResponse, status_code=status.HTTP_201_CREATED)
async def crear_noticia(
    noticia: NoticiaCreate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Publica una nueva noticia, guardando el archivo .md en Cloud Storage.
    """
    slug_titulo = "-".join([w for w in noticia.titulo.lower().split() if w.isalnum()][:6])
    nuevo_id = f"noticia-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{slug_titulo or uuid.uuid4().hex[:6]}"
    
    datos = noticia.model_dump()
    datos["id"] = nuevo_id
    datos["creado_por"] = admin_user.get("email", "admin")
    datos["creado_en"] = datetime.now(timezone.utc).isoformat()
    datos["actualizado_en"] = datos["creado_en"]

    # 1. Almacenar el archivo .md en Google Cloud Storage
    try:
        datos_storage = guardar_noticia_en_storage(nuevo_id, datos)
        datos.update(datos_storage)
    except Exception as e:
        print(f"Error al guardar archivo Markdown de noticia en Cloud Storage: {e}")

    # 2. Registrar en Firestore como índice y metadatos
    try:
        db = get_firestore_client()
        db.collection("noticias").document(nuevo_id).set(datos)
    except Exception as e:
        print(f"Advertencia al guardar en Firestore: {e}")

    return datos

@router.delete("/{noticia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_noticia(
    noticia_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Elimina el archivo Markdown de la noticia en Cloud Storage y Firestore.
    """
    # 1. Eliminar archivo en Cloud Storage
    try:
        eliminar_noticia_de_storage(noticia_id)
    except Exception as e:
        print(f"Advertencia al eliminar noticia de Cloud Storage: {e}")

    # 2. Eliminar de Firestore
    try:
        db = get_firestore_client()
        doc_ref = db.collection("noticias").document(noticia_id)
        if doc_ref.get().exists:
            doc_ref.delete()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar noticia de Firestore: {str(e)}"
        )

    return None
