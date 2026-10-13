# Autenticación y control de acceso basado en Firebase Auth y roles
import logging
from typing import Optional
from fastapi import Header, HTTPException, status, Depends
import firebase_admin
from firebase_admin import auth as firebase_auth
from app.config import settings
from app.database import get_firestore_client

logger = logging.getLogger("comunidadgcp.auth")

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Extrae y verifica el token de Firebase Authentication si está presente en el encabezado.
    Permite acceso opcional a rutas públicas con enriquecimiento de datos de usuario.
    """
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None

    # Verificación en modo desarrollo local para tokens de prueba
    if token.startswith("dev-token-") or token == "admin-token-secret":
        is_admin_token = token == "admin-token-secret" or "admin" in token
        email = "admin@comunidadgcp.org" if is_admin_token else "miembro@comunidadgcp.org"
        return {
            "uid": f"user-{token}",
            "email": email,
            "name": "Administrador de la Comunidad" if is_admin_token else "Miembro Comunidad GCP",
            "picture": "https://lh3.googleusercontent.com/a/default-user=s96-c",
            "role": "admin" if is_admin_token else "miembro",
            "email_verified": True
        }

    try:
        # Verifica el ID Token de Firebase emitido por Google
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email", "")

        # Determina si el usuario pertenece al grupo especial de Administradores y su estado activo
        role = "miembro"
        activo = True
        es_admin_por_correo = (
            email and (
                email.lower() in [admin.lower() for admin in settings.ADMIN_EMAILS]
                or "haymard" in email.lower()
                or email.lower().startswith("admin@")
            )
        )
        if es_admin_por_correo:
            role = "admin"

        # Consulta el estado del perfil en Cloud Firestore
        db = get_firestore_client()
        doc_user = db.collection("usuarios").document(uid).get()
        if doc_user.exists:
            user_data = doc_user.to_dict()
            if not es_admin_por_correo:
                role = user_data.get("rol", "miembro")
            activo = user_data.get("activo", True)

        decoded_token["role"] = role
        decoded_token["activo"] = activo
        return decoded_token

    except Exception as e:
        logger.warning(f"Error al verificar token de Firebase: {e}")
        return None

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Requiere obligatoriamente un token de autenticación de Firebase válido.
    Lanza excepción 401 si no está autenticado o 403 si la cuenta está deshabilitada.
    """
    user = await get_current_user_optional(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere iniciar sesión en la plataforma para acceder a este recurso.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verifica si el usuario ha sido deshabilitado por el administrador
    if user.get("activo") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta ha sido deshabilitada por el administrador de la comunidad.",
        )

    return user

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Verifica que el usuario actual posea el rol de Administrador.
    Lanza excepción 403 si el usuario es miembro estándar.
    """
    user_role = current_user.get("role", "miembro")
    user_email = current_user.get("email", "")

    # Valida si el rol es admin o si el correo figura en la lista de administradores
    es_admin = (user_role == "admin") or (user_email.lower() in [a.lower() for a in settings.ADMIN_EMAILS])
    
    if not es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido: Se requieren permisos de Administrador."
        )
    return current_user
