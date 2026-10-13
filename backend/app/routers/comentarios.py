# Enrutador de API REST para el foro comunitario de Preguntas, Comentarios y Respuestas
from datetime import datetime, timezone
import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_firestore_client
from app.models.comentario import ComentarioCreate, RespuestaCreate, ComentarioResponse, RespuestaBase
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/comentarios", tags=["Foro y Comentarios"])

@router.get("", response_model=List[ComentarioResponse])
async def listar_comentarios(
    current_user: dict = Depends(get_current_user)
):
    """
    Lista todos los hilos de preguntas, dudas de arquitectura y comentarios comunitarios.
    """
    db = get_firestore_client()
    coleccion = db.collection("comentarios")
    comentarios = []

    try:
        docs = coleccion.stream()
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            if "respuestas" not in data:
                data["respuestas"] = []
            comentarios.append(data)

        # Ordenar por fecha_creacion descendente
        comentarios.sort(key=lambda x: x.get("fecha_creacion", ""), reverse=True)
        return comentarios

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar comentarios en Firestore: {str(e)}"
        )

@router.post("", response_model=ComentarioResponse, status_code=status.HTTP_201_CREATED)
async def crear_comentario(
    comentario: ComentarioCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    [Usuarios Registrados] Publica una nueva consulta o comentario en la comunidad.
    """
    db = get_firestore_client()
    nuevo_id = f"comentario-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}"
    
    datos = comentario.model_dump()
    datos["uid_autor"] = current_user.get("uid", "anon")
    datos["nombre_autor"] = current_user.get("name") or current_user.get("email", "Miembro").split("@")[0]
    datos["email_autor"] = current_user.get("email")
    datos["foto_autor"] = current_user.get("picture")
    datos["fecha_creacion"] = datetime.now(timezone.utc).isoformat()
    datos["respuestas"] = []

    try:
        db.collection("comentarios").document(nuevo_id).set(datos)
        datos["id"] = nuevo_id
        return datos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar comentario en Firestore: {str(e)}"
        )

@router.post("/{comentario_id}/respuestas", response_model=ComentarioResponse)
async def responder_comentario(
    comentario_id: str,
    respuesta: RespuestaCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    [Usuarios Registrados y Administradores] Responde a un hilo o consulta comunitaria existente.
    """
    db = get_firestore_client()
    doc_ref = db.collection("comentarios").document(comentario_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="El tema o pregunta no existe.")

    data = doc.to_dict()
    respuestas_existentes = data.get("respuestas", [])

    es_admin = current_user.get("role") == "admin"
    nombre_autor = current_user.get("name") or current_user.get("email", "Miembro").split("@")[0]
    if es_admin:
        nombre_autor = f"{nombre_autor} (Admin Comunidad GCP)"

    nueva_respuesta = {
        "id_respuesta": f"resp-{uuid.uuid4().hex[:8]}",
        "uid_autor": current_user.get("uid"),
        "nombre_autor": nombre_autor,
        "email_autor": current_user.get("email"),
        "foto_autor": current_user.get("picture"),
        "contenido": respuesta.contenido,
        "es_admin": es_admin,
        "fecha": datetime.now(timezone.utc).isoformat()
    }

    respuestas_existentes.append(nueva_respuesta)

    try:
        doc_ref.set({"respuestas": respuestas_existentes}, merge=True)
        data["id"] = comentario_id
        data["respuestas"] = respuestas_existentes
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar respuesta en Firestore: {str(e)}"
        )

@router.delete("/{comentario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_comentario(
    comentario_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Elimina un hilo o consulta del foro para fines de moderación.
    """
    db = get_firestore_client()
    doc_ref = db.collection("comentarios").document(comentario_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="El tema no existe.")

    try:
        doc_ref.delete()
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar comentario: {str(e)}"
        )
