# Enrutador de API REST para la gestión de Newsletters alojados como archivos Markdown (.md) en Cloud Storage
from datetime import datetime, timezone
import uuid
import re
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Response
from fastapi.responses import PlainTextResponse
from app.database import get_firestore_client
from app.models.newsletter import NewsletterCreate, NewsletterUpdate, NewsletterResponse
from app.auth import require_admin, get_current_user
from app.services.storage_newsletters import (
    listar_newsletters_desde_storage,
    obtener_newsletter_desde_storage,
    guardar_newsletter_en_storage,
    eliminar_newsletter_de_storage
)

router = APIRouter(prefix="/newsletters", tags=["Newsletters"])

@router.get("", response_model=List[NewsletterResponse])
async def listar_newsletters(
    current_user: dict = Depends(get_current_user)
):
    """
    Lista las ediciones del Newsletter leyendo directamente los archivos Markdown (.md)
    almacenados en el bucket de Google Cloud Storage (comunidadgcp/newsletters).
    """
    newsletters: List[dict] = []
    ids_procesados = set()

    # 1. Intentar consultar en primer lugar los archivos Markdown (.md) desde Cloud Storage
    try:
        storage_newsletters = listar_newsletters_desde_storage()
        for item in storage_newsletters:
            newsletters.append(item)
            ids_procesados.add(item["id"])
    except Exception as e:
        print(f"Advertencia: Error al consultar newsletters desde Cloud Storage: {e}")

    # 2. Consultar Firestore para integrar ediciones registradas previamente que aún no se hayan migrado
    try:
        db = get_firestore_client()
        docs = db.collection("newsletters").stream()
        for doc in docs:
            doc_id = doc.id
            if doc_id not in ids_procesados:
                data = doc.to_dict()
                data["id"] = doc_id
                data["origen"] = "firestore"
                newsletters.append(data)
                ids_procesados.add(doc_id)
    except Exception as e:
        print(f"Advertencia: Error al consultar newsletters desde Firestore: {e}")

    # Ordenar las ediciones por número descendente (la más reciente primero)
    newsletters.sort(key=lambda x: x.get("numero_edicion", 0), reverse=True)
    return newsletters

@router.get("/{newsletter_id}", response_model=NewsletterResponse)
async def obtener_newsletter(
    newsletter_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene los detalles y el contenido Markdown completo de una edición específica del newsletter.
    """
    # 1. Buscar en Cloud Storage por nombre de archivo o ID
    try:
        item = obtener_newsletter_desde_storage(newsletter_id)
        if item:
            return item
    except Exception as e:
        print(f"Advertencia al consultar archivo en Cloud Storage: {e}")

    # 2. Buscar como respaldo en Firestore
    try:
        db = get_firestore_client()
        doc_ref = db.collection("newsletters").document(newsletter_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            data["origen"] = "firestore"
            return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar el newsletter: {str(e)}"
        )

    raise HTTPException(status_code=404, detail="Edición del newsletter no encontrada.")

@router.get("/{newsletter_id}/raw", response_class=PlainTextResponse)
async def descargar_o_ver_raw_markdown(
    newsletter_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retorna el contenido crudo en formato Markdown (.md) para descarga directa o visualización.
    """
    item = obtener_newsletter_desde_storage(newsletter_id)
    if not item:
        # Intentar en Firestore
        db = get_firestore_client()
        doc = db.collection("newsletters").document(newsletter_id).get()
        if doc.exists:
            item = doc.to_dict()

    if not item:
        raise HTTPException(status_code=404, detail="Archivo Markdown no encontrado.")

    contenido = item.get("contenido_markdown", "")
    headers = {
        "Content-Disposition": f'inline; filename="{newsletter_id}.md"',
        "Content-Type": "text/markdown; charset=utf-8"
    }
    return Response(content=contenido, media_type="text/markdown", headers=headers)

@router.put("/{newsletter_id}", response_model=NewsletterResponse)
async def actualizar_newsletter(
    newsletter_id: str,
    newsletter_update: NewsletterUpdate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Actualiza una edición del newsletter y sincroniza el archivo .md en Cloud Storage.
    """
    datos_actualizados = {k: v for k, v in newsletter_update.model_dump().items() if v is not None}
    datos_actualizados["actualizado_en"] = datetime.now(timezone.utc).isoformat()

    # 1. Actualizar el archivo en Cloud Storage
    try:
        guardar_newsletter_en_storage(newsletter_id, datos_actualizados)
    except Exception as e:
        print(f"Advertencia al actualizar archivo en Cloud Storage: {e}")

    # 2. Actualizar también en Firestore para mantener coherencia
    try:
        db = get_firestore_client()
        doc_ref = db.collection("newsletters").document(newsletter_id)
        doc_ref.set(datos_actualizados, merge=True)
        resultado = doc_ref.get().to_dict()
        resultado["id"] = newsletter_id
        return resultado
    except Exception as e:
        # Si falló Firestore pero se guardó en Cloud Storage, recuperar de storage
        item_storage = obtener_newsletter_desde_storage(newsletter_id)
        if item_storage:
            return item_storage
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar newsletter: {str(e)}"
        )

@router.post("", response_model=NewsletterResponse, status_code=status.HTTP_201_CREATED)
async def crear_newsletter(
    newsletter: NewsletterCreate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Publica una nueva edición del Newsletter, guardando el archivo .md en Cloud Storage.
    """
    nuevo_id = f"newsletter-edicion-{newsletter.numero_edicion}"
    datos = newsletter.model_dump()
    datos["id"] = nuevo_id
    datos["creado_por"] = admin_user.get("email", "admin")
    datos["creado_en"] = datetime.now(timezone.utc).isoformat()
    datos["actualizado_en"] = datos["creado_en"]

    # 1. Almacenar el archivo .md en Google Cloud Storage
    try:
        datos_storage = guardar_newsletter_en_storage(nuevo_id, datos)
        datos.update(datos_storage)
    except Exception as e:
        print(f"Error al guardar archivo Markdown en Cloud Storage: {e}")

    # 2. Registrar en Firestore como índice y metadatos
    try:
        db = get_firestore_client()
        db.collection("newsletters").document(nuevo_id).set(datos)
    except Exception as e:
        print(f"Advertencia al guardar en Firestore: {e}")

    return datos

@router.delete("/{newsletter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_newsletter(
    newsletter_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Elimina el archivo Markdown en Cloud Storage y su registro en Firestore.
    """
    # 1. Eliminar archivo en Cloud Storage
    try:
        eliminar_newsletter_de_storage(newsletter_id)
    except Exception as e:
        print(f"Advertencia al eliminar de Cloud Storage: {e}")

    # 2. Eliminar de Firestore
    try:
        db = get_firestore_client()
        doc_ref = db.collection("newsletters").document(newsletter_id)
        if doc_ref.get().exists:
            doc_ref.delete()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar newsletter de Firestore: {str(e)}"
        )

    return None
