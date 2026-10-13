# Esquemas Pydantic para el módulo de Noticias generales de Google Cloud alojadas en Cloud Storage (.md)
from typing import Optional, List
from pydantic import BaseModel, Field

class NoticiaBase(BaseModel):
    # Título de la noticia o actualización de producto
    titulo: str = Field(..., example="Google Cloud anuncia soporte nativo para modelos Gemini 3.8")
    # Resumen breve para tarjetas visuales
    resumen: str = Field(..., example="Mejoras significativas en rendimiento de inferencia y soporte multirregión.")
    # Contenido completo de la noticia (en formato Markdown)
    contenido_completo: str = Field(..., example="En el marco del Cloud Next, Google ha anunciado...")
    # Categoría del producto (Compute, Storage, IA, Networking, Seguridad)
    categoria: str = Field(default="General", example="IA & Machine Learning")
    # Enlace a la fuente oficial (blog de Google Cloud, release notes)
    fuente_url: Optional[str] = Field(None, example="https://cloud.google.com/blog")
    # Nombre del autor o publicador
    publicado_por: str = Field(default="Comunidad GCP", example="Comité Editorial")
    # Fecha de publicación
    fecha_publicacion: str = Field(..., example="2026-10-06T15:00:00Z")
    # Bandera para destacar en la página de inicio
    destacada: bool = Field(default=False)
    # Etiquetas temáticas
    tags: List[str] = Field(default_factory=list, example=["Vertex AI", "Gemini", "Lanzamientos"])
    
    # Campos opcionales para integración con Google Cloud Storage (.md)
    archivo_nombre: Optional[str] = Field(None, description="Nombre del archivo Markdown en Cloud Storage", example="spanner-graph-ga.md")
    archivo_url: Optional[str] = Field(None, description="URI de Google Cloud Storage", example="gs://comunidadgcp/noticias/spanner-graph-ga.md")
    tamano_bytes: Optional[int] = Field(None, description="Tamaño del archivo en bytes")
    origen: Optional[str] = Field(default="cloud_storage", description="Origen de los datos: cloud_storage o firestore")

class NoticiaCreate(NoticiaBase):
    pass

class NoticiaUpdate(BaseModel):
    titulo: Optional[str] = None
    resumen: Optional[str] = None
    contenido_completo: Optional[str] = None
    categoria: Optional[str] = None
    fuente_url: Optional[str] = None
    destacada: Optional[bool] = None
    tags: Optional[List[str]] = None
    archivo_nombre: Optional[str] = None
    archivo_url: Optional[str] = None
    tamano_bytes: Optional[int] = None

class NoticiaResponse(NoticiaBase):
    id: str
