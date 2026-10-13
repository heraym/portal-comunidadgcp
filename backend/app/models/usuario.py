# Esquemas Pydantic para el módulo de Gestión y Registro de Usuarios
from typing import Optional
from pydantic import BaseModel, Field

class UsuarioRegistro(BaseModel):
    # Nombre del miembro
    nombre: str = Field(..., example="Martín", min_length=2)
    # Apellido del miembro
    apellido: str = Field(..., example="Morales", min_length=2)
    # Correo electrónico (Gmail o corporativo)
    email: str = Field(..., example="martin.morales@gmail.com")
    # Empresa u organización donde se desempeña
    empresa: str = Field(..., example="Mercado Libre", min_length=2)
    # Cargo o especialidad opcional en Google Cloud
    rol_profesional: Optional[str] = Field(default="Cloud Architect", example="Cloud Architect / DevOps")
    # Identificador opcional de Firebase UID (si ya inició sesión con Google)
    uid: Optional[str] = None
    # URL opcional de fotografía de perfil de Google
    foto_url: Optional[str] = None

class UsuarioSync(BaseModel):
    # Identificador emitido por Firebase Authentication
    uid: str = Field(..., example="firebase_auth_uid_123")
    # Correo electrónico del usuario de Google / Gmail
    email: str = Field(..., example="usuario@gmail.com")
    # Nombre visible del usuario
    nombre: Optional[str] = Field(default="Miembro", example="Juan")
    # Apellido del usuario
    apellido: Optional[str] = Field(default="", example="Pérez")
    # URL de avatar o foto de perfil
    foto_url: Optional[str] = Field(None, example="https://lh3.googleusercontent.com/...")
    # Empresa u organización donde trabaja
    empresa: Optional[str] = Field(default="Independiente", example="Fintech Global")
    # Cargo o rol profesional en Google Cloud
    rol_profesional: Optional[str] = Field(default="Cloud Specialist", example="Lead Cloud Architect")

class UsuarioUpdateRol(BaseModel):
    # Rol del usuario en el portal: "admin" o "miembro"
    rol: str = Field(..., example="admin")

class UsuarioUpdateEstado(BaseModel):
    # Estado del usuario en la plataforma: True para habilitado, False para deshabilitado
    activo: bool = Field(..., example=False)

class UsuarioResponse(BaseModel):
    uid: str
    email: str
    nombre: str
    apellido: Optional[str] = ""
    foto_url: Optional[str] = None
    empresa: Optional[str] = "Comunidad GCP"
    rol_profesional: Optional[str] = None
    rol: str = "miembro"
    activo: bool = True
    fecha_registro: Optional[str] = None
    ultimo_acceso: Optional[str] = None
