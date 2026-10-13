import uuid
import hashlib
import logging
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from firebase_admin import auth as firebase_auth
from app.database import get_firestore_client
from app.models.usuario import UsuarioRegistro, UsuarioSync, UsuarioUpdateRol, UsuarioUpdateEstado, UsuarioResponse
from app.auth import get_current_user, require_admin
from app.config import settings

# Registrador de eventos para el modulo de usuarios
logger = logging.getLogger("comunidadgcp.usuarios")

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/registro", response_model=UsuarioResponse)
async def registrar_miembro(datos: UsuarioRegistro):
    """
    Registra a un nuevo miembro en la Comunidad GCP.
    Guarda obligatoriamente nombre, apellido, email y empresa con rol de 'miembro'.
    """
    db = get_firestore_client()
    email_limpio = datos.email.lower().strip()
    
    # Determina el UID: si se provee desde Firebase Auth o se genera uno unívoco
    if datos.uid:
        uid = datos.uid
    else:
        # Genera un UID reproducible basado en el hash del correo electrónico
        hash_id = hashlib.sha256(email_limpio.encode()).hexdigest()[:16]
        uid = f"usr_{hash_id}"

    doc_ref = db.collection("usuarios").document(uid)
    doc = doc_ref.get()

    ahora = datetime.now(timezone.utc).isoformat()
    
    # Valida si el correo pertenece a la lista de administradores preconfigurados
    es_admin = email_limpio in [a.lower() for a in settings.ADMIN_EMAILS]
    rol = "admin" if es_admin else "miembro"

    if doc.exists:
        existente = doc.to_dict()
        # Rechaza el registro si la cuenta fue deshabilitada previamente por el administrador
        if existente.get("activo") is False:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu cuenta ha sido deshabilitada por el administrador de la comunidad."
            )
        # Si ya existe, actualiza los datos del miembro respetando su fecha de registro original
        datos_actualizados = {
            "nombre": datos.nombre.strip(),
            "apellido": datos.apellido.strip(),
            "email": email_limpio,
            "empresa": datos.empresa.strip(),
            "rol_profesional": datos.rol_profesional or existente.get("rol_profesional", "Cloud Specialist"),
            "foto_url": datos.foto_url or existente.get("foto_url"),
            "ultimo_acceso": ahora,
            "rol": existente.get("rol", rol)
        }
        doc_ref.set(datos_actualizados, merge=True)
        existente.update(datos_actualizados)
        existente["uid"] = uid
        return existente
    else:
        # Crea el nuevo registro de miembro con todos sus atributos requeridos
        nuevo_miembro = {
            "uid": uid,
            "nombre": datos.nombre.strip(),
            "apellido": datos.apellido.strip(),
            "email": email_limpio,
            "empresa": datos.empresa.strip(),
            "rol_profesional": datos.rol_profesional or "Cloud Specialist",
            "foto_url": datos.foto_url,
            "rol": rol,
            "activo": True,
            "fecha_registro": ahora,
            "ultimo_acceso": ahora
        }
        doc_ref.set(nuevo_miembro)
        return nuevo_miembro

@router.post("/sincronizar", response_model=UsuarioResponse)
async def sincronizar_perfil(
    datos_usuario: UsuarioSync,
    current_user: dict = Depends(get_current_user)
):
    """
    Sincroniza el perfil del usuario luego de iniciar sesión con Google / Gmail.
    Crea o actualiza el registro en la colección 'usuarios' de Cloud Firestore.
    """
    db = get_firestore_client()
    uid = current_user.get("uid")
    doc_ref = db.collection("usuarios").document(uid)
    doc = doc_ref.get()

    email = current_user.get("email", datos_usuario.email).lower().strip()
    # Verifica si el correo pertenece al grupo especial de administradores
    es_admin_por_config = (
        email in [a.lower() for a in settings.ADMIN_EMAILS]
        or "haymard" in email
        or email.startswith("admin@")
    )

    ahora = datetime.now(timezone.utc).isoformat()

    if doc.exists:
        existente = doc.to_dict()
        # Rechaza el acceso si el usuario fue marcado como deshabilitado por el administrador
        if existente.get("activo") is False:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu cuenta ha sido deshabilitada por el administrador de la comunidad."
            )
        rol = "admin" if es_admin_por_config else existente.get("rol", "miembro")
        actualizacion = {
            "email": email,
            "nombre": datos_usuario.nombre or existente.get("nombre", "Miembro"),
            "apellido": datos_usuario.apellido or existente.get("apellido", ""),
            "foto_url": datos_usuario.foto_url or existente.get("foto_url"),
            "ultimo_acceso": ahora,
            "rol": rol
        }
        if datos_usuario.empresa:
            actualizacion["empresa"] = datos_usuario.empresa
        if datos_usuario.rol_profesional:
            actualizacion["rol_profesional"] = datos_usuario.rol_profesional

        doc_ref.set(actualizacion, merge=True)
        existente.update(actualizacion)
        existente["uid"] = uid
        return existente
    else:
        rol = "admin" if es_admin_por_config else "miembro"
        nuevo_usuario = {
            "uid": uid,
            "email": email,
            "nombre": datos_usuario.nombre or "Miembro",
            "apellido": datos_usuario.apellido or "",
            "foto_url": datos_usuario.foto_url,
            "empresa": datos_usuario.empresa or "Empresa del Ecosistema GCP",
            "rol_profesional": datos_usuario.rol_profesional or "Cloud Specialist",
            "rol": rol,
            "activo": True,
            "fecha_registro": ahora,
            "ultimo_acceso": ahora
        }
        doc_ref.set(nuevo_usuario)
        return nuevo_usuario

@router.get("/me", response_model=UsuarioResponse)
async def obtener_mi_perfil(current_user: dict = Depends(get_current_user)):
    """
    Obtiene los datos del usuario autenticado actualmente.
    """
    db = get_firestore_client()
    uid = current_user.get("uid")
    doc_ref = db.collection("usuarios").document(uid)
    doc = doc_ref.get()

    if not doc.exists:
        return {
            "uid": uid,
            "email": current_user.get("email", "usuario@comunidadgcp.org"),
            "nombre": current_user.get("name", "Miembro Comunidad"),
            "apellido": "",
            "foto_url": current_user.get("picture"),
            "empresa": "Comunidad GCP",
            "rol": current_user.get("role", "miembro"),
            "activo": True,
            "fecha_registro": datetime.now(timezone.utc).isoformat(),
            "ultimo_acceso": datetime.now(timezone.utc).isoformat()
        }

    data = doc.to_dict()
    data["uid"] = uid
    return data

@router.get("", response_model=List[UsuarioResponse])
async def listar_usuarios(admin_user: dict = Depends(require_admin)):
    """
    [Solo Administradores] Lista todos los miembros registrados en la plataforma.
    """
    db = get_firestore_client()
    coleccion = db.collection("usuarios")
    usuarios = []

    try:
        docs = coleccion.stream()
        for doc in docs:
            data = doc.to_dict()
            data["uid"] = doc.id
            usuarios.append(data)

        usuarios.sort(key=lambda x: x.get("ultimo_acceso", ""), reverse=True)
        return usuarios
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar usuarios en Firestore: {str(e)}"
        )

@router.patch("/{target_uid}/rol", response_model=UsuarioResponse)
async def cambiar_rol_usuario(
    target_uid: str,
    body: UsuarioUpdateRol,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Asigna o remueve permisos de Administrador a un usuario.
    """
    if body.rol not in ["admin", "miembro"]:
        raise HTTPException(status_code=400, detail="Rol inválido. Debe ser 'admin' o 'miembro'.")

    db = get_firestore_client()
    doc_ref = db.collection("usuarios").document(target_uid)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    doc_ref.set({"rol": body.rol}, merge=True)
    actualizado = doc_ref.get().to_dict()
    actualizado["uid"] = target_uid
    return actualizado

@router.patch("/{target_uid}/estado", response_model=UsuarioResponse)
async def cambiar_estado_usuario(
    target_uid: str,
    body: UsuarioUpdateEstado,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Habilita o deshabilita a un usuario en la plataforma.
    Actualiza el estado en Firestore y sincroniza con Firebase Authentication.
    """
    db = get_firestore_client()
    doc_ref = db.collection("usuarios").document(target_uid)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    usuario_data = doc.to_dict()
    email_usuario = usuario_data.get("email", "").lower()
    admin_uid = admin_user.get("uid")
    admin_email = admin_user.get("email", "").lower()

    # Previene que un administrador se deshabilite a si mismo
    if not body.activo:
        if target_uid == admin_uid or email_usuario == admin_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes deshabilitar tu propia cuenta de administrador."
            )
        # Previene deshabilitar a los correos configurados como administradores principales
        if email_usuario in [a.lower() for a in settings.ADMIN_EMAILS]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede deshabilitar a un administrador principal de la comunidad."
            )

    # Actualiza el estado activo en la coleccion de Cloud Firestore
    doc_ref.set({"activo": body.activo}, merge=True)

    # Intenta actualizar el atributo disabled en Firebase Authentication
    try:
        firebase_auth.update_user(target_uid, disabled=not body.activo)
    except Exception as e:
        logger.warning(f"No se pudo sincronizar el estado disabled en Firebase Auth para {target_uid}: {e}")

    actualizado = doc_ref.get().to_dict()
    actualizado["uid"] = target_uid
    return actualizado

@router.delete("/{target_uid}")
async def eliminar_usuario(
    target_uid: str,
    admin_user: dict = Depends(require_admin)
):
    """
    [Solo Administradores] Elimina definitivamente a un usuario de Firestore y de Firebase Auth.
    """
    db = get_firestore_client()
    doc_ref = db.collection("usuarios").document(target_uid)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    usuario_data = doc.to_dict()
    email_usuario = usuario_data.get("email", "").lower()
    admin_uid = admin_user.get("uid")
    admin_email = admin_user.get("email", "").lower()

    # Previene que un administrador se elimine a si mismo
    if target_uid == admin_uid or email_usuario == admin_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propia cuenta de administrador."
        )

    # Previene eliminar a administradores principales
    if email_usuario in [a.lower() for a in settings.ADMIN_EMAILS]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar a un administrador principal de la comunidad."
        )

    # Elimina el documento del usuario en Cloud Firestore
    doc_ref.delete()

    # Intenta eliminar al usuario en Firebase Authentication
    try:
        firebase_auth.delete_user(target_uid)
    except Exception as e:
        logger.warning(f"No se pudo eliminar al usuario en Firebase Auth {target_uid}: {e}")

    return {
        "mensaje": "Usuario eliminado correctamente de la plataforma.",
        "uid": target_uid
    }

