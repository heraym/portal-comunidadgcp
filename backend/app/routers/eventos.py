# Enrutador de API REST para la gestión de Eventos Presenciales y Summits
from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.database import get_firestore_client
from app.models.evento import EventoCreate, EventoUpdate, EventoResponse
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/eventos", tags=["Eventos Presenciales"])

@router.get("", response_model=List[EventoResponse])
async def listar_eventos(
    estado: Optional[str] = Query(None, description="Filtrar por estado: 'abierto', 'completo' o 'finalizado'"),
    current_user: dict = Depends(get_current_user)
):
    """
    Lista los eventos presenciales organizados por la Comunidad GCP.
    Incluye nombre, fecha, lugar físico y enlace de registro.
    """
    db = get_firestore_client()
    coleccion = db.collection("eventos")
    eventos = []

    try:
        docs = coleccion.stream()
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id

            if estado and data.get("estado") != estado:
                continue

            eventos.append(data)

        # Ordenar por fecha_hora ascendente
        eventos.sort(key=lambda x: x.get("fecha_hora", ""))
        return eventos

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar eventos en Firestore: {str(e)}"
        )

@router.get("/{evento_id}", response_model=EventoResponse)
async def obtener_evento(
    evento_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene los detalles de un evento presencial específico.
    """
    db = get_firestore_client()
    doc_ref = db.collection("eventos").document(evento_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Evento presencial no encontrado.")

    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.post("", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
async def crear_evento(
    evento: EventoCreate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Crea la convocatoria de un evento presencial.
    """
    db = get_firestore_client()
    nuevo_id = f"evento-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}"
    datos = evento.model_dump()
    datos["creado_por"] = admin_user.get("email", "admin")
    datos["creado_en"] = datetime.now(timezone.utc).isoformat()

    try:
        db.collection("eventos").document(nuevo_id).set(datos)
        datos["id"] = nuevo_id
        return datos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar evento presencial en Firestore: {str(e)}"
        )

@router.put("/{evento_id}", response_model=EventoResponse)
async def actualizar_evento(
    evento_id: str,
    evento_update: EventoUpdate,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Actualiza los datos de un evento presencial (cupos, estado, sede).
    """
    db = get_firestore_client()
    doc_ref = db.collection("eventos").document(evento_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Evento presencial no encontrado.")

    datos_actualizados = {k: v for k, v in evento_update.model_dump().items() if v is not None}

    try:
        doc_ref.set(datos_actualizados, merge=True)
        resultado = doc_ref.get().to_dict()
        resultado["id"] = evento_id
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar evento: {str(e)}"
        )

@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_evento(
    evento_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Elimina un evento presencial.
    """
    db = get_firestore_client()
    doc_ref = db.collection("eventos").document(evento_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Evento presencial no encontrado.")

    try:
        doc_ref.delete()
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar evento: {str(e)}"
        )
