# Configuración de variables de entorno para la aplicación Comunidad GCP
import os
import json
from typing import Union, List
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Identificador del proyecto de Google Cloud
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "comunidadgcp")
    
    # Bucket y prefijo de Cloud Storage donde se alojan los archivos Markdown (.md) de los Newsletters
    GCS_NEWSLETTERS_BUCKET: str = os.getenv("GCS_NEWSLETTERS_BUCKET", "comunidadgcp")
    GCS_NEWSLETTERS_PREFIX: str = os.getenv("GCS_NEWSLETTERS_PREFIX", "newsletters/")

    # Bucket y prefijo de Cloud Storage donde se alojan los archivos Markdown (.md) de las Noticias
    GCS_NOTICIAS_BUCKET: str = os.getenv("GCS_NOTICIAS_BUCKET", "comunidadgcp")
    GCS_NOTICIAS_PREFIX: str = os.getenv("GCS_NOTICIAS_PREFIX", "noticias/")

    # Bucket y prefijo de Cloud Storage donde se alojan las grabaciones de video de las Charlas
    GCS_GRABACIONES_BUCKET: str = os.getenv("GCS_GRABACIONES_BUCKET", "comunidadgcp")
    GCS_GRABACIONES_PREFIX: str = os.getenv("GCS_GRABACIONES_PREFIX", "grabaciones/")

    # Nombre de la base de datos de Firestore
    FIRESTORE_DATABASE: str = os.getenv("FIRESTORE_DATABASE", "(default)")
    
    # Entorno de ejecución: development o production
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Puerto de ejecución (Cloud Run utiliza por defecto 8080)
    PORT: int = int(os.getenv("PORT", "8080"))
    
    # Lista de orígenes permitidos para CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "*"
    ]
    
    # Correos designados automáticamente como administradores iniciales del sistema
    ADMIN_EMAILS: Union[List[str], str] = [
        "admin@comunidadgcp.org",
        "haymard@haymard.altostrat.com",
        "haymard@gmail.com",
        "haymard@google.com"
    ]

    # Validador para procesar listas pasadas como texto separado por comas o JSON
    @field_validator("ADMIN_EMAILS", mode="before")
    @classmethod
    def parse_admin_emails(cls, v):
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    return json.loads(v_str)
                except Exception:
                    pass
            return [email.strip() for email in v_str.split(",") if email.strip()]
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"

# Instancia global de configuración
settings = Settings()
