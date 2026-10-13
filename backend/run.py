# Script de arranque directo del servidor Uvicorn para desarrollo y producción
import uvicorn
import os
import sys

# Agrega el directorio backend al PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    puerto = int(os.getenv("PORT", "8080"))
    host = os.getenv("HOST", "0.0.0.0")
    # En Cloud Run o en producción desactivamos la recarga automática
    es_produccion = os.getenv("ENVIRONMENT") == "production" or "K_SERVICE" in os.environ
    recarga = not es_produccion

    uvicorn.run("app.main:app", host=host, port=puerto, reload=recarga)
