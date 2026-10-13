# Etapa 1: Compilación de la interfaz de usuario con Node.js
FROM node:22-alpine AS builder-frontend

# Establece el directorio de trabajo del frontend
WORKDIR /build

# Copia los manifiestos de dependencias
COPY frontend/package.json ./

# Instala paquetes de npm
RUN npm install

# Copia el código fuente del frontend y compila el bundle estático para producción
COPY frontend/ ./
RUN npm run build

# Etapa 2: Imagen final optimizada para Google Cloud Run con Python y Uvicorn
FROM python:3.12-slim

# Metadatos del contenedor
LABEL maintainer="Comunidad Google Cloud Platform"
LABEL description="Portal oficial de la Comunidad GCP desplegado en Google Cloud Run"

# Variables de entorno para ejecución en Python y Cloud Run
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    HOST=0.0.0.0 \
    ENVIRONMENT=production

# Instala certificados CA y utilidades mínimas del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crea un usuario sin privilegios de root para cumplir con las mejores prácticas de seguridad de Google Cloud
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

# Crea y configura el directorio de la aplicación
WORKDIR /app

# Copia e instala las dependencias de Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia el código del backend
COPY backend/app ./app
COPY backend/run.py ./

# Copia los artefactos estáticos compilados en la Etapa 1
COPY --from=builder-frontend /build/dist /app/frontend/dist

# Asigna la propiedad de los archivos al usuario no privilegiado
RUN chown -R appuser:appuser /app

# Cambia al usuario seguro
USER appuser

# Expone el puerto predeterminado de Cloud Run
EXPOSE 8080

# Comprobación de salud nativa del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicio del servidor ASGI Uvicorn
CMD ["python", "run.py"]
