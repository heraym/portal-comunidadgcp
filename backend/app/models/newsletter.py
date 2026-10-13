# Esquemas Pydantic para el módulo de Newsletters periódicos
from typing import Optional, List
from pydantic import BaseModel, Field

class NewsletterBase(BaseModel):
    # Número secuencial de la edición
    numero_edicion: int = Field(..., example=12)
    # Título temático del boletín
    titulo: str = Field(..., example="Newsletter Edición #12 - Octubre 2026: Novedades Cloud Next y FinOps")
    # Resumen ejecutivo de la entrega
    resumen: str = Field(..., example="Resumen técnico mensual de novedades, análisis de arquitectura y mejores prácticas.")
    # Contenido estructurado en Markdown o texto enriquecido
    contenido_markdown: Optional[str] = Field(None, example="## Novedades del Mes\n- Actualización de Spanner...")
    # Enlace de descarga del documento PDF oficial (Cloud Storage / Drive)
    documento_url: Optional[str] = Field(None, example="https://storage.googleapis.com/comunidadgcp-docs/newsletter-12.pdf")
    # Nombre del editor responsable
    autor: str = Field(default="Equipo Editorial Comunidad GCP", example="Comité de Contenidos")
    # Fecha de emisión del boletín
    fecha_emision: str = Field(..., example="2026-10-01T09:00:00Z")
    # Nombre del archivo Markdown en Cloud Storage (ej: newsletter-edicion-12.md)
    archivo_nombre: Optional[str] = Field(None, example="newsletter-edicion-12.md")
    # URI de Cloud Storage (ej: gs://comunidadgcp/newsletters/newsletter-edicion-12.md)
    archivo_url: Optional[str] = Field(None, example="gs://comunidadgcp/newsletters/newsletter-edicion-12.md")
    # Tamaño en bytes del archivo Markdown
    tamano_bytes: Optional[int] = Field(None, example=2669)
    # Fuente de origen de la edición (cloud_storage o firestore)
    origen: Optional[str] = Field(default="cloud_storage", example="cloud_storage")

class NewsletterCreate(NewsletterBase):
    pass

class NewsletterUpdate(BaseModel):
    numero_edicion: Optional[int] = None
    titulo: Optional[str] = None
    resumen: Optional[str] = None
    contenido_markdown: Optional[str] = None
    documento_url: Optional[str] = None
    autor: Optional[str] = None
    temas_clave: Optional[List[str]] = None
    archivo_nombre: Optional[str] = None
    archivo_url: Optional[str] = None

class NewsletterResponse(NewsletterBase):
    id: str
