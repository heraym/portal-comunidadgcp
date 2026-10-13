# Esquemas Pydantic para el módulo de Eventos Presenciales
from typing import Optional, List
from pydantic import BaseModel, Field

class EventoBase(BaseModel):
    # Nombre del encuentro presencial
    nombre: str = Field(..., example="GCP Cloud Summit Presencial & Networking")
    # Descripción y agenda del evento
    descripcion: str = Field(..., example="Jornada presencial con charlas técnicas, mesas redondas de arquitectura y networking.")
    # Fecha y hora del evento en formato ISO 8601
    fecha_hora: str = Field(..., example="2026-11-20T18:00:00Z")
    # Dirección física o lugar del evento
    lugar: str = Field(..., example="Auditorio Google Buenos Aires / Latam Hub (Piso 5)")
    # Enlace externo para el registro formal (Google Forms, Eventbrite, etc.)
    link_registro: str = Field(..., example="https://forms.gle/evento-presencial-comunidad-gcp")
    # Capacidad máxima o cupos disponibles
    cupos: Optional[int] = Field(None, example=150)
    # Estado: abierto, completo o finalizado
    estado: str = Field(default="abierto", example="abierto")
    # Etiquetas temáticas
    tags: List[str] = Field(default_factory=list, example=["Presencial", "Networking", "Arquitectura"])

class EventoCreate(EventoBase):
    pass

class EventoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_hora: Optional[str] = None
    lugar: Optional[str] = None
    link_registro: Optional[str] = None
    cupos: Optional[int] = None
    estado: Optional[str] = None
    tags: Optional[List[str]] = None

class EventoResponse(EventoBase):
    id: str
    creado_en: Optional[str] = None
