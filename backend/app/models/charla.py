# Esquemas Pydantic para el módulo de Charlas técnicas y Grabaciones
from typing import Optional, List
from pydantic import BaseModel, Field

class CharlaBase(BaseModel):
    # Título temático de la sesión técnica
    titulo: str = Field(..., example="Arquitecturas Serverless y Cloud Run a Escala")
    # Descripción detallada de la charla
    descripcion: str = Field(..., example="Patrones de resiliencia, VPC access y observabilidad en Cloud Run.")
    # Nombre y cargo del expositor
    ponente: str = Field(..., example="Ing. Carlos Mendoza (Cloud Solutions Architect)")
    # Fecha y hora en formato ISO 8601
    fecha_hora: str = Field(..., example="2026-10-25T19:00:00Z")
    # Estado: pendiente, realizada o cancelada
    estado: str = Field(default="pendiente", example="pendiente")
    # Identificador o enlace directo a Google Meet (opcional)
    meet_id: Optional[str] = Field(None, example="meet.google.com/abc-defg-hij")
    # Nombre del archivo de grabación en //comunidadgcp/grabaciones/ (opcional, ej: mi-video.mp4)
    grabacion_archivo: Optional[str] = Field(None, example="charla-cloudrun-demo.mp4")
    # Ruta canónica o URL de la grabación (opcional, ej: //comunidadgcp/grabaciones/charla-cloudrun.mp4)
    grabacion_url: Optional[str] = Field(None, example="//comunidadgcp/grabaciones/charla-cloudrun-demo.mp4")
    # Material adicional como diapositivas o repositorios de código
    material_url: Optional[str] = Field(None, example="https://github.com/comunidadgcp/charla-cloudrun")
    # Etiquetas de tecnologías asociadas (GKE, BigQuery, Vertex AI, etc.)
    tags: List[str] = Field(default_factory=list, example=["Cloud Run", "Serverless", "DevOps"])

class CharlaCreate(CharlaBase):
    pass

class CharlaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    ponente: Optional[str] = None
    fecha_hora: Optional[str] = None
    estado: Optional[str] = None
    meet_id: Optional[str] = None
    # Nombre del archivo en //comunidadgcp/grabaciones/
    grabacion_archivo: Optional[str] = None
    grabacion_url: Optional[str] = None
    material_url: Optional[str] = None
    tags: Optional[List[str]] = None

class CharlaResponse(CharlaBase):
    id: str
    creado_en: Optional[str] = None
    # Tipo de origen del video: 'gcs' (Cloud Storage), 'youtube' o 'externo'
    tipo_grabacion: Optional[str] = None
    # Ruta canónica en Cloud Storage (ej. //comunidadgcp/grabaciones/video.mp4)
    grabacion_gcs: Optional[str] = None
    # URL del endpoint de streaming interno con soporte de reproducción directa
    grabacion_stream_url: Optional[str] = None
    # Indicador de si el contenido multimedia está disponible para visualización
    tiene_grabacion: bool = False
