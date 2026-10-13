# Esquemas Pydantic para el foro comunitario de preguntas y comentarios
from typing import Optional, List
from pydantic import BaseModel, Field

class RespuestaBase(BaseModel):
    # Identificador único de la respuesta
    id_respuesta: str
    # Identificador del autor de la respuesta
    uid_autor: str
    # Nombre del autor
    nombre_autor: str
    # Correo del autor
    email_autor: Optional[str] = None
    # Foto de perfil
    foto_autor: Optional[str] = None
    # Contenido de la respuesta
    contenido: str
    # Indica si la respuesta proviene de un administrador de la comunidad
    es_admin: bool = False
    # Fecha de la respuesta
    fecha: str

class RespuestaCreate(BaseModel):
    contenido: str = Field(..., example="Recomendamos utilizar Private Service Connect (PSC) junto con Cloud DNS.")

class ComentarioBase(BaseModel):
    # Título de la consulta o tema
    titulo: str = Field(..., example="¿Cómo configurar Private Service Connect entre diferentes organizaciones de GCP?")
    # Detalle o cuerpo de la pregunta
    contenido: str = Field(..., example="Estamos implementando una arquitectura multitenant y necesitamos aislar VPCs...")
    # Categoría temática
    categoria: str = Field(default="Arquitectura General", example="Networking & Seguridad")
    # Etiquetas asociadas
    tags: List[str] = Field(default_factory=list, example=["VPC", "PSC", "Multi-Project"])

class ComentarioCreate(ComentarioBase):
    pass

class ComentarioResponse(ComentarioBase):
    id: str
    uid_autor: str
    nombre_autor: str
    email_autor: Optional[str] = None
    foto_autor: Optional[str] = None
    fecha_creacion: str
    respuestas: List[RespuestaBase] = Field(default_factory=list)
