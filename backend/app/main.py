# Aplicación principal FastAPI para el portal oficial de la Comunidad GCP
import os
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.config import settings
from app.database import get_firestore_client
from app.seed_data import poblar_datos_iniciales
from app.routers import (
    charlas_router,
    noticias_router,
    newsletters_router,
    eventos_router,
    comentarios_router,
    usuarios_router
)

# Configuración básica de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("comunidadgcp.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Ciclo de vida de la aplicación: se ejecuta al iniciar y detener el servidor.
    """
    logger.info("Iniciando servicio Comunidad GCP...")
    # Inicializa conexión a Firestore y puebla datos iniciales si es necesario
    try:
        get_firestore_client()
        poblar_datos_iniciales()
        logger.info("Base de datos y datos de inicio verificados correctamente.")
    except Exception as e:
        logger.error(f"Advertencia durante el arranque de base de datos: {e}")

    yield

    logger.info("Deteniendo servicio Comunidad GCP...")

# Creación de la instancia de FastAPI
app = FastAPI(
    title="Comunidad GCP - API Oficial",
    description="Plataforma de gestión y colaboración para arquitectos y especialistas técnicos de Google Cloud",
    version="1.0.0",
    lifespan=lifespan
)

# Configuración de middleware CORS para permitir peticiones desde el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de comprobación de salud (Health Check) obligatorio para Google Cloud Run
@app.get("/health", tags=["Salud del Sistema"])
async def health_check():
    """
    Comprobación de salud utilizada por Google Cloud Run y balanceadores de carga.
    """
    return {
        "status": "healthy",
        "service": "comunidadgcp-api",
        "environment": settings.ENVIRONMENT,
        "gcp_project": settings.GCP_PROJECT_ID,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Montaje de los enrutadores bajo el prefijo /api/v1
api_prefix = "/api/v1"
app.include_router(charlas_router, prefix=api_prefix)
app.include_router(noticias_router, prefix=api_prefix)
app.include_router(newsletters_router, prefix=api_prefix)
app.include_router(eventos_router, prefix=api_prefix)
app.include_router(comentarios_router, prefix=api_prefix)
app.include_router(usuarios_router, prefix=api_prefix)

# Montaje de archivos estáticos del Frontend si existe la carpeta de compilación (dist)
posibles_rutas = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist"),
    "/app/frontend/dist",
    os.path.join(os.getcwd(), "frontend", "dist")
]

frontend_dist_path = None
for ruta in posibles_rutas:
    if os.path.exists(ruta) and os.path.isdir(ruta):
        frontend_dist_path = ruta
        break

if frontend_dist_path and os.path.exists(frontend_dist_path):
    logger.info(f"Montando archivos estáticos del frontend desde {frontend_dist_path}")
    # Montar directorio assets
    assets_path = os.path.join(frontend_dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # Fallback para Single Page Application (SPA): redirige rutas no API a index.html
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str, request: Request):
        # Si la petición comienza con api o docs, no interceptarla
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        
        file_path = os.path.join(frontend_dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_file = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        
        return JSONResponse(status_code=404, content={"detail": "Frontend no compilado aún"})
else:
    logger.info("Directorio frontend/dist no encontrado aún. La API funcionará en modo standalone.")
    @app.get("/")
    async def root_info():
        return {
            "mensaje": "Bienvenido al portal oficial de la Comunidad GCP",
            "documentacion": "/docs",
            "health_check": "/health"
        }
