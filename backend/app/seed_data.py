# Carga de datos iniciales (Seed Data) para la Comunidad GCP en Cloud Firestore
import logging
from datetime import datetime, timezone
from app.database import get_firestore_client

logger = logging.getLogger("comunidadgcp.seed")

def poblar_datos_iniciales():
    """
    Inserta datos de demostración en las colecciones de Firestore
    si aún no cuentan con registros, garantizando una experiencia completa.
    """
    db = get_firestore_client()

    # 1. Charlas Técnicas (Pendientes y Realizadas)
    charlas_col = db.collection("charlas")
    if not list(charlas_col.limit(1).stream()):
        logger.info("Poblando colección 'charlas' con datos iniciales...")
        charlas_iniciales = [
            {
                "id": "charla-01-vertex-gemini",
                "titulo": "Implementación de Agentes con Vertex AI y Gemini 3.8",
                "descripcion": "Análisis profundo de la nueva generación de modelos Gemini, arquitecturas de llamadas a herramientas (MCP) y optimización de latencia en Vertex AI Agent Builder.",
                "ponente": "Ing. Martín Morales (Google Developer Expert & Solutions Architect)",
                "fecha_hora": "2026-10-22T19:00:00Z",
                "estado": "pendiente",
                "meet_id": "meet.google.com/gcp-com-arch",
                "grabacion_url": None,
                "material_url": "https://github.com/comunidadgcp/vertex-agents-demo",
                "tags": ["Vertex AI", "Gemini", "Agentes", "IA Generativa"],
                "creado_en": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "charla-02-gke-enterprise",
                "titulo": "GKE Autopilot y GKE Enterprise a Escala Global",
                "descripcion": "Estrategias de despliegue multirregional, Service Mesh, políticas de red Cilium y observabilidad avanzada con Google Cloud Managed Service for Prometheus.",
                "ponente": "Arq. Valeria Castro (Lead Cloud DevOps Specialist)",
                "fecha_hora": "2026-11-05T18:30:00Z",
                "estado": "pendiente",
                "meet_id": "meet.google.com/gke-deep-dive",
                "grabacion_url": None,
                "material_url": "https://github.com/comunidadgcp/gke-enterprise-templates",
                "tags": ["Kubernetes", "GKE Autopilot", "DevOps", "Networking"],
                "creado_en": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "charla-03-cloud-run-serverless",
                "titulo": "Cloud Run Serverless: Patrones Avanzados y VPC Access",
                "descripcion": "Sesión técnica donde revisamos microservicios de alto tráfico en Cloud Run, conexión segura mediante Serverless VPC Access hacia Cloud SQL y AlloyDB.",
                "ponente": "Ing. Lucas Benítez (Cloud Infrastructure Lead)",
                "fecha_hora": "2026-09-18T19:00:00Z",
                "estado": "realizada",
                "meet_id": "meet.google.com/cloudrun-past",
                "grabacion_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "material_url": "https://github.com/comunidadgcp/cloudrun-enterprise-architecture",
                "tags": ["Cloud Run", "Serverless", "AlloyDB", "VPC"],
                "creado_en": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "charla-04-finops-bigquery",
                "titulo": "FinOps en BigQuery: Optimización de Costos y Slots Editions",
                "descripcion": "Cómo reducir hasta un 50% los costos de analítica en BigQuery utilizando particionado por tiempo, clústeres, BI Engine y reservas Standard/Enterprise Slots.",
                "ponente": "Lic. Mariana Rivas (Data & FinOps Architect)",
                "fecha_hora": "2026-08-28T18:30:00Z",
                "estado": "realizada",
                "meet_id": "meet.google.com/bigquery-finops-past",
                "grabacion_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "material_url": "https://github.com/comunidadgcp/bigquery-finops-guide",
                "tags": ["BigQuery", "FinOps", "Data Analytics", "Cost Optimization"],
                "creado_en": datetime.now(timezone.utc).isoformat()
            }
        ]
        for c in charlas_iniciales:
            cid = c.pop("id")
            charlas_col.document(cid).set(c)

    # 2. Noticias Generales de GCP
    noticias_col = db.collection("noticias")
    if not list(noticias_col.limit(1).stream()):
        logger.info("Poblando colección 'noticias'...")
        noticias_iniciales = [
            {
                "id": "noticia-01-gemini",
                "titulo": "Disponibilidad General de Gemini 3.8 en Google Cloud Vertex AI",
                "resumen": "Google Cloud ha liberado globalmente los nuevos endpoints de inferencia ultrarrápida para Gemini 3.8 con soporte extendido de contexto.",
                "contenido_completo": "Los arquitectos ahora pueden desplegar cargas de trabajo con ventanas de contexto ampliadas, menor latencia y precios competitivos en us-central1 y southamerica-west1.",
                "categoria": "IA & Machine Learning",
                "fuente_url": "https://cloud.google.com/blog/products/ai-machine-learning",
                "publicado_por": "Comité Editorial GCP",
                "fecha_publicacion": "2026-10-06T14:00:00Z",
                "destacada": True,
                "tags": ["Vertex AI", "Gemini", "IA Generativa"]
            },
            {
                "id": "noticia-02-cloud-run-gpus",
                "titulo": "Cloud Run añade soporte para Aceleración con GPUs NVIDIA L4",
                "resumen": "Ejecuta microservicios de IA y renderizado con escalamiento a cero y aceleración de hardware bajo demanda.",
                "contenido_completo": "Cloud Run ahora permite acoplar GPUs NVIDIA L4 directamente a tus contenedores, pagando únicamente por los segundos que la inferencia esté en ejecución.",
                "categoria": "Compute & Contenedores",
                "fuente_url": "https://cloud.google.com/blog/products/serverless",
                "publicado_por": "Comité Editorial GCP",
                "fecha_publicacion": "2026-10-04T10:30:00Z",
                "destacada": True,
                "tags": ["Cloud Run", "GPU", "Serverless"]
            },
            {
                "id": "noticia-03-alloydb-omni",
                "titulo": "AlloyDB Omni 2026: Novedades en Indexación Vectorial ScaNN",
                "resumen": "Aceleración de búsquedas por similitud vectorial hasta 10 veces más rápida que extensiones convencionales de PostgreSQL.",
                "contenido_completo": "La base de datos compatible con PostgreSQL de Google introduce mejoras sustanciales en su motor vectorial ScaNN para aplicaciones RAG de gran escala.",
                "categoria": "Bases de Datos",
                "fuente_url": "https://cloud.google.com/alloydb",
                "publicado_por": "Comunidad GCP",
                "fecha_publicacion": "2026-09-29T16:00:00Z",
                "destacada": False,
                "tags": ["AlloyDB", "PostgreSQL", "Vectores", "RAG"]
            }
        ]
        for n in noticias_iniciales:
            nid = n.pop("id")
            noticias_col.document(nid).set(n)

    # 3. Newsletters Periódicos
    newsletters_col = db.collection("newsletters")
    if not list(newsletters_col.limit(1).stream()):
        logger.info("Poblando colección 'newsletters'...")
        newsletters_iniciales = [
            {
                "id": "newsletter-edicion-12",
                "numero_edicion": 12,
                "titulo": "Newsletter Octubre 2026: Resumen Cloud Next, FinOps & Vertex Agents",
                "resumen": "En esta entrega mensual exploramos las últimas novedades de arquitectura en GCP, plantillas de Terraform recomendadas y entrevistas a arquitectos de la comunidad.",
                "contenido_markdown": "### Editorial\nBienvenidas y bienvenidos a la edición 12 de nuestro boletín mensual de la Comunidad GCP.\n\n#### 1. Arquitecturas Modernas en GKE\nCómo diseñar clústeres multitenant con aislamiento de recursos y Network Policies.\n\n#### 2. FinOps en la Práctica\nEstrategias para presupuestación con Cloud Billing APIs y exportación a BigQuery.\n\n#### 3. Recomendación del Mes\nExplora el repositorio oficial de GCP Architecture Framework.",
                "documento_url": "https://storage.googleapis.com/cloud-training/community/newsletter_edicion_12_octubre_2026.pdf",
                "autor": "Equipo de Redacción Comunidad GCP",
                "fecha_emision": "2026-10-01T09:00:00Z",
                "temas_clave": ["Cloud Next", "FinOps", "GKE", "Terraform"]
            },
            {
                "id": "newsletter-edicion-11",
                "numero_edicion": 11,
                "titulo": "Newsletter Septiembre 2026: Seguridad Zero Trust con BeyondCorp y PSC",
                "resumen": "Guía práctica de diseño para conectividad privada entre múltiples organizaciones de GCP mediante Private Service Connect.",
                "contenido_markdown": "### En Portada: Seguridad de Redes en GCP\nRepasamos la configuración de Identity-Aware Proxy (IAP) y Cloud Armor para mitigar ataques DDoS.",
                "documento_url": "https://storage.googleapis.com/cloud-training/community/newsletter_edicion_11_septiembre_2026.pdf",
                "autor": "Equipo de Redacción Comunidad GCP",
                "fecha_emision": "2026-09-01T09:00:00Z",
                "temas_clave": ["Seguridad", "Zero Trust", "Private Service Connect", "IAP"]
            }
        ]
        for nl in newsletters_iniciales:
            nlid = nl.pop("id")
            newsletters_col.document(nlid).set(nl)

    # 4. Eventos Presenciales
    eventos_col = db.collection("eventos")
    if not list(eventos_col.limit(1).stream()):
        logger.info("Poblando colección 'eventos'...")
        eventos_iniciales = [
            {
                "id": "evento-summit-2026",
                "nombre": "GCP Architecture Summit & Networking Presencial 2026",
                "descripcion": "Encuentro presencial exclusivo para arquitectos e ingenieros cloud. Mesas redondas de arquitectura, revisión de casos de estudio reales de migración y cóctel de networking.",
                "fecha_hora": "2026-11-20T17:30:00Z",
                "lugar": "Google Argentina Hub - Auditorio Principal (Av. Corrientes 300, Piso 5)",
                "link_registro": "https://forms.gle/evento-presencial-gcp-arquitectura-2026",
                "cupos": 120,
                "estado": "abierto",
                "tags": ["Presencial", "Arquitectura", "Networking", "Summit"],
                "creado_en": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "evento-hackathon-2026",
                "nombre": "GCP Cloud Challenge & Hackathon de Agentes de IA",
                "descripcion": "Competencia práctica de desarrollo de agentes empresariales utilizando Vertex AI y Cloud Run. Premios oficiales de Google Cloud para los equipos ganadores.",
                "fecha_hora": "2026-12-04T10:00:00Z",
                "lugar": "Centro de Innovación Tecnológica (Sede Puerto Madero)",
                "link_registro": "https://forms.gle/hackathon-gcp-agentes-2026",
                "cupos": 80,
                "estado": "abierto",
                "tags": ["Hackathon", "Vertex AI", "Cloud Run", "Competencia"],
                "creado_en": datetime.now(timezone.utc).isoformat()
            }
        ]
        for ev in eventos_iniciales:
            evid = ev.pop("id")
            eventos_col.document(evid).set(ev)

    # 5. Foro Comunitario y Preguntas Técnicas
    comentarios_col = db.collection("comentarios")
    if not list(comentarios_col.limit(1).stream()):
        logger.info("Poblando colección 'comentarios'...")
        comentarios_iniciales = [
            {
                "id": "pregunta-01-psc",
                "titulo": "¿Cuál es la mejor práctica para conectar Cloud Run con AlloyDB de forma privada?",
                "contenido": "Hola comunidad, estamos migrando una API en Cloud Run hacia AlloyDB PostgreSQL. ¿Recomiendan utilizar Direct VPC Egress o Serverless VPC Access Connector con IP privada?",
                "categoria": "Redes & Bases de Datos",
                "tags": ["Cloud Run", "AlloyDB", "Direct VPC Egress"],
                "uid_autor": "user-demo-architect",
                "nombre_autor": "Santiago Giménez",
                "email_autor": "santiago.gimenez@techcloud.io",
                "foto_autor": "https://lh3.googleusercontent.com/a/default-user=s96-c",
                "fecha_creacion": "2026-10-06T11:20:00Z",
                "respuestas": [
                    {
                        "id_respuesta": "resp-01",
                        "uid_autor": "admin-haymard",
                        "nombre_autor": "Comité Admin GCP",
                        "email_autor": "admin@comunidadgcp.org",
                        "foto_autor": "https://lh3.googleusercontent.com/a/default-user=s96-c",
                        "contenido": "¡Excelente consulta Santiago! Actualmente la recomendación oficial de Google Cloud es utilizar Direct VPC Egress, ya que ofrece menor latencia, no requiere aprovisionar instancias de conector e-2 y soporta mayor rendimiento de red sin costo adicional de infraestructura de conector.",
                        "es_admin": True,
                        "fecha": "2026-10-06T12:05:00Z"
                    }
                ]
            },
            {
                "id": "pregunta-02-finops",
                "titulo": "Recomendación para alertas de presupuesto granulares en proyectos de desarrollo",
                "contenido": "¿Existe alguna forma automatizada de detener instancias de GKE o Cloud SQL cuando un equipo supera el presupuesto asignado mediante Pub/Sub y Cloud Functions?",
                "categoria": "FinOps & Automatización",
                "tags": ["FinOps", "Budgets", "Cloud Functions", "Cost Control"],
                "uid_autor": "user-demo-devops",
                "nombre_autor": "Florencia Rossi",
                "email_autor": "florencia.rossi@enterprise.com",
                "foto_autor": "https://lh3.googleusercontent.com/a/default-user=s96-c",
                "fecha_creacion": "2026-10-05T16:45:00Z",
                "respuestas": [
                    {
                        "id_respuesta": "resp-02",
                        "uid_autor": "admin-haymard",
                        "nombre_autor": "Comité Admin GCP",
                        "email_autor": "admin@comunidadgcp.org",
                        "foto_autor": "https://lh3.googleusercontent.com/a/default-user=s96-c",
                        "contenido": "Sí, es un patrón común: puedes conectar la notificación del Cloud Billing Budget a un tópico de Pub/Sub y disparar una Cloud Function o Cloud Run Job que pause temporalmente las cargas de trabajo no críticas o reduzca los replicas del clúster a cero.",
                        "es_admin": True,
                        "fecha": "2026-10-05T17:30:00Z"
                    }
                ]
            }
        ]
        for com in comentarios_iniciales:
            comid = com.pop("id")
            comentarios_col.document(comid).set(com)

    # 6. Usuarios Iniciales
    usuarios_col = db.collection("usuarios")
    if not list(usuarios_col.limit(1).stream()):
        logger.info("Poblando colección 'usuarios'...")
        usuarios_iniciales = [
            {
                "uid": "admin-haymard-seed",
                "email": "haymard@haymard.altostrat.com",
                "nombre": "Administrador Principal GCP",
                "foto_url": "https://lh3.googleusercontent.com/a/default-user=s96-c",
                "empresa": "Google Cloud Architecture Community",
                "rol_profesional": "Head Cloud Architect",
                "rol": "admin",
                "activo": True,
                "fecha_registro": "2026-10-01T10:00:00Z",
                "ultimo_acceso": datetime.now(timezone.utc).isoformat()
            },
            {
                "uid": "admin-general-seed",
                "email": "admin@comunidadgcp.org",
                "nombre": "Coordinador de la Comunidad",
                "foto_url": "https://lh3.googleusercontent.com/a/default-user=s96-c",
                "empresa": "Comunidad GCP Latam",
                "rol_profesional": "Community Lead & Solutions Architect",
                "rol": "admin",
                "activo": True,
                "fecha_registro": "2026-10-01T10:00:00Z",
                "ultimo_acceso": datetime.now(timezone.utc).isoformat()
            }
        ]
        for u in usuarios_iniciales:
            uid = u.pop("uid")
            usuarios_col.document(uid).set(u)

    logger.info("Poblado de datos iniciales completado con éxito.")
