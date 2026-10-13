# Portal Oficial de la Comunidad GCP

Plataforma oficial desarrollada para la **Comunidad Google Cloud Platform**, diseñada para conectar arquitectos, especialistas e ingenieros cloud de diversas empresas.

El sistema cumple con el 100% de los requerimientos especificados en [requerimientos.md](./requerimientos.md) y está preparado para desplegarse de manera nativa en **Google Cloud Run**, utilizando **Cloud Firestore** para almacenamiento y **Firebase Authentication** para el inicio de sesión con cuentas de Google / Gmail.

---

## 🚀 Arquitectura y Tecnologías

- **Plataforma de Cómputo:** [Google Cloud Run](https://cloud.google.com/run) (Arquitectura serverless en contenedor seguro con usuario sin privilegios root, autoescalado de 0 a N instancias y health checks nativos).
- **Base de Datos:** [Google Cloud Firestore](https://cloud.google.com/firestore) (Base de datos NoSQL documental nativa de alta disponibilidad en `us-central1`, colecciones: `charlas`, `noticias`, `newsletters`, `eventos`, `comentarios`, `usuarios`).
- **Autenticación y Perfiles:** [Firebase Authentication](https://firebase.google.com/docs/auth) con Google Identity Provider (OAuth 2.0 / OpenID Connect con cuentas Gmail) y verificación server-side de Firebase ID Tokens.
- **Backend API:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12, Uvicorn ASGI, Pydantic v2, endpoints documentados con OpenAPI en `/docs` y `/health` para Cloud Run).
- **Frontend SPA:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/).
- **Sistema de Diseño:** *Cloud Horizon Developer Console* generado y extraído con **Stitch MCP** (Paleta Google Cloud `#0B1326`, `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`, tipografías *Inter* y *JetBrains Mono*, paneles glassmórficos).

---

## 📋 Módulos y Funcionalidades Implementadas

### 1. Vista Pública de Bienvenida (Usuarios no registrados)
- Explicación de los objetivos y propuesta de valor de la comunidad.
- Métricas dinámicas (+600 miembros, quincenal, 100% práctico).
- Previsualización de próximas charlas y eventos presenciales.
- Botón destacado de registro mediante cuenta de Google / Gmail.

### 2. Autenticación con Google (Gmail)
- Registro e inicio de sesión con ventana emergente oficial de Google OAuth.
- Sincronización automática de perfil con Firestore (`/api/v1/usuarios/sincronizar`).
- Selector de roles de prueba incorporado en desarrollo para alternar entre *Administrador* y *Miembro*.

### 3. Charlas Técnicas y Grabaciones
- **Charlas Pendientes:** Fecha, hora en zona horaria local, expositor y enlace directo a **Google Meet** (protegido para miembros registrados).
- **Charlas Realizadas:** Acceso directo a grabaciones (YouTube / Drive) y enlaces a material de diapositivas o repositorios de GitHub.
- **Panel Administrador:** Crear, editar y eliminar charlas técnicas periódicas.

### 4. Noticias Generales de GCP
- Novedades de productos, lanzamientos, anuncios regionales y actualizaciones.
- Filtros por categoría (IA, Compute, Bases de Datos, Redes, FinOps).
- Acceso al enlace oficial de Google Cloud Blog.
- Publicación y moderación desde el panel de administración.

### 5. Newsletters Periódicos
- Boletines mensuales con análisis arquitectónicos, casos de uso y entrevistas.
- Visor desplegable de notas editoriales y resúmenes en Markdown.
- Botón de descarga directa del documento PDF oficial.
- Creación de nuevas ediciones desde el panel de administración.

### 6. Eventos Presenciales y Summits
- Encuentros en vivo con sede física (ej. Auditorio Google Latam Hub), cupos disponibles y estado.
- Enlace de registro externo (Google Forms / Eventbrite).
- Administración de convocatorias presenciales por administradores.

### 7. Foro Comunitario de Preguntas y Respuestas
- Hilos de preguntas para consultas de arquitectura, migraciones y mejores prácticas.
- Publicación de respuestas tanto por la comunidad como por administradores.
- **Badge Oficial:** Las respuestas del administrador se destacan visualmente con el distintivo *Admin Comunidad GCP*.

### 8. Panel de Administración y Gestión de Usuarios
- Consola centralizada con accesos directos de creación para todas las entidades.
- Tabla de administración de miembros registrados con cuentas de Gmail.
- Capacidad para ascender miembros a *Administrador* o modificar su rol en Firestore.

---

## 💻 Ejecución Local

### Prerrequisitos
- Python 3.11 o superior.
- Node.js 20 o superior y npm.
- Google Cloud SDK (`gcloud`) autenticado.

### Paso 1: Ejecutar el Backend (FastAPI)
```bash
# Activar entorno virtual
source venv/bin/activate

# Iniciar servidor Uvicorn en el puerto 8080
cd backend
python run.py
```
> El backend estará disponible en `http://localhost:8080`. Documentación interactiva en `http://localhost:8080/docs`.

### Paso 2: Ejecutar el Frontend en Modo Desarrollo (Vite)
```bash
cd frontend
npm run dev
```
> El frontend estará disponible en `http://localhost:5173`, con proxy automático hacia el backend en el puerto 8080.

---

## ☁️ Despliegue en Google Cloud Run

La aplicación incluye un `Dockerfile` multi-stage que compila el frontend de React y empaqueta el backend en un único contenedor ligero, sirviendo tanto la API REST como los recursos estáticos.

### Comando de Despliegue Directo:
```bash
gcloud run deploy comunidadgcp-portal \
  --source . \
  --region us-central1 \
  --project comunidadgcp \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=comunidadgcp,FIRESTORE_DATABASE="(default)",ADMIN_EMAILS="haymard@haymard.altostrat.com"
```

El servicio se aprovisionará con HTTPS automático, autoescalado a cero y conexión directa a la base de datos Firestore creada en el proyecto `comunidadgcp`.
