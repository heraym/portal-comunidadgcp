# Servicio para la gestión y visualización de Noticias de Google Cloud en Cloud Storage (.md)
import os
import re
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import yaml
from google.cloud import storage
from app.config import settings

# Cliente en caché para evitar sobrecargar conexiones
_storage_client: Optional[storage.Client] = None

def get_storage_client() -> storage.Client:
    """
    Retorna una instancia autenticada del cliente de Google Cloud Storage.
    """
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=settings.GCP_PROJECT_ID)
    return _storage_client

def get_noticias_bucket():
    """
    Retorna la referencia al bucket de Cloud Storage configurado para Noticias.
    """
    client = get_storage_client()
    return client.bucket(settings.GCS_NOTICIAS_BUCKET)

def _extraer_metadatos_y_cuerpo_markdown_noticia(contenido: str, nombre_archivo: str, blob_updated: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Parsea un archivo Markdown (.md) de noticia con o sin frontmatter YAML y extrae sus propiedades.
    """
    meta: Dict[str, Any] = {}
    cuerpo = contenido

    # Detectar y procesar frontmatter YAML delimitado por ---
    if contenido.startswith("---"):
        partes = contenido.split("---", 2)
        if len(partes) >= 3:
            try:
                parsed_yaml = yaml.safe_load(partes[1])
                if isinstance(parsed_yaml, dict):
                    meta = parsed_yaml
                cuerpo = partes[2].strip()
            except Exception as err:
                print(f"Advertencia: No se pudo parsear frontmatter YAML en {nombre_archivo}: {err}")

    # Determinar el título de la noticia
    titulo = meta.get("titulo")
    if not titulo:
        for linea in cuerpo.splitlines():
            linea_limpia = linea.strip()
            if linea_limpia.startswith("# "):
                titulo = linea_limpia[2:].strip()
                break
    if not titulo:
        base = nombre_archivo.replace(".md", "").replace(".markdown", "").replace("-", " ")
        titulo = base.title()

    # Determinar el resumen de la noticia (ignorando comentarios HTML)
    resumen = meta.get("resumen")
    if not resumen:
        for parrafo in cuerpo.split("\n\n"):
            p_strip = parrafo.strip()
            if p_strip.startswith("<!--"):
                continue
            if p_strip and not p_strip.startswith("#") and not p_strip.startswith("---") and not p_strip.startswith(">"):
                limpio = re.sub(r"\s+", " ", p_strip)
                resumen = limpio[:280] + ("..." if len(limpio) > 280 else "")
                break

    # Si aún no hay resumen, verificar si había un comentario explicativo HTML <!-- ... -->
    if not resumen:
        for parrafo in cuerpo.split("\n\n"):
            p_strip = parrafo.strip()
            if p_strip.startswith("<!--") and p_strip.endswith("-->"):
                resumen = p_strip[4:-3].strip()
                break

    if not resumen:
        resumen = "Novedades y anuncios oficiales del ecosistema Google Cloud Platform."

    # Fecha de publicación
    fecha_publicacion = meta.get("fecha_publicacion")
    if not fecha_publicacion:
        if blob_updated:
            fecha_publicacion = blob_updated.isoformat()
        else:
            fecha_publicacion = datetime.now(timezone.utc).isoformat()

    categoria = meta.get("categoria", "General")
    fuente_url = meta.get("fuente_url")
    publicado_por = meta.get("publicado_por", "Equipo Editorial Comunidad GCP")
    destacada = bool(meta.get("destacada", False))

    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    # Si no se especificaron tags, extraer secciones secundarias (## )
    if not tags:
        for linea in cuerpo.splitlines():
            l_strip = linea.strip()
            if l_strip.startswith("## "):
                tag_candidato = l_strip[3:].strip()
                tag_limpio = re.sub(r"[^\w\s\-\/\.]", "", tag_candidato).strip()
                if tag_limpio and len(tag_limpio) < 35 and tag_limpio not in tags:
                    tags.append(tag_limpio)
        tags = tags[:4]

    id_limpio = nombre_archivo.replace(".md", "").replace(".markdown", "").strip()

    return {
        "id": id_limpio,
        "titulo": str(titulo),
        "resumen": str(resumen),
        "contenido_completo": cuerpo,
        "categoria": str(categoria),
        "fuente_url": fuente_url,
        "publicado_por": str(publicado_por),
        "fecha_publicacion": str(fecha_publicacion),
        "destacada": destacada,
        "tags": tags,
        "archivo_nombre": nombre_archivo,
        "archivo_url": f"gs://{settings.GCS_NOTICIAS_BUCKET}/{settings.GCS_NOTICIAS_PREFIX}{nombre_archivo}",
        "origen": "cloud_storage"
    }

def listar_noticias_desde_storage() -> List[Dict[str, Any]]:
    """
    Obtiene y procesa todos los archivos Markdown (.md) alojados en la carpeta de Noticias de Cloud Storage.
    """
    bucket = get_noticias_bucket()
    prefijo = settings.GCS_NOTICIAS_PREFIX
    blobs = bucket.list_blobs(prefix=prefijo)
    noticias: List[Dict[str, Any]] = []

    for blob in blobs:
        if not (blob.name.endswith(".md") or blob.name.endswith(".markdown")):
            continue

        try:
            contenido_md = blob.download_as_text(encoding="utf-8")
            nombre_archivo = blob.name.split("/")[-1]
            data = _extraer_metadatos_y_cuerpo_markdown_noticia(
                contenido=contenido_md,
                nombre_archivo=nombre_archivo,
                blob_updated=blob.updated
            )
            data["tamano_bytes"] = blob.size
            noticias.append(data)
        except Exception as err:
            print(f"Error al leer la noticia {blob.name} desde Cloud Storage: {err}")

    # Ordenar por fecha de publicación descendente
    noticias.sort(key=lambda x: x.get("fecha_publicacion", ""), reverse=True)
    return noticias

def obtener_noticia_desde_storage(noticia_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene una noticia específica desde Cloud Storage por su identificador.
    """
    bucket = get_noticias_bucket()
    prefijo = settings.GCS_NOTICIAS_PREFIX

    candidatos = [
        f"{prefijo}{noticia_id}.md",
        f"{prefijo}{noticia_id}.markdown",
        f"{prefijo}{noticia_id}"
    ]

    for nombre_blob in candidatos:
        blob = bucket.blob(nombre_blob)
        if blob.exists():
            contenido_md = blob.download_as_text(encoding="utf-8")
            nombre_archivo = blob.name.split("/")[-1]
            data = _extraer_metadatos_y_cuerpo_markdown_noticia(
                contenido=contenido_md,
                nombre_archivo=nombre_archivo,
                blob_updated=blob.updated
            )
            data["tamano_bytes"] = blob.size
            return data

    return None

def guardar_noticia_en_storage(noticia_id: str, datos: Dict[str, Any]) -> Dict[str, Any]:
    """
    Genera y almacena un archivo Markdown (.md) en el bucket de Noticias con frontmatter YAML.
    """
    bucket = get_noticias_bucket()
    prefijo = settings.GCS_NOTICIAS_PREFIX
    nombre_archivo = f"{noticia_id}.md"
    blob = bucket.blob(f"{prefijo}{nombre_archivo}")

    # Preparar el encabezado YAML frontmatter
    meta_dict = {
        "titulo": datos.get("titulo", "Noticia Sin Título"),
        "fecha_publicacion": datos.get("fecha_publicacion", datetime.now(timezone.utc).isoformat()),
        "categoria": datos.get("categoria", "General"),
        "publicado_por": datos.get("publicado_por", "Equipo Editorial Comunidad GCP"),
        "destacada": bool(datos.get("destacada", False)),
        "resumen": datos.get("resumen", ""),
        "tags": datos.get("tags", [])
    }
    if datos.get("fuente_url"):
        meta_dict["fuente_url"] = datos.get("fuente_url")

    yaml_frontmatter = yaml.dump(meta_dict, allow_unicode=True, sort_keys=False)
    cuerpo_md = datos.get("contenido_completo", "").strip()

    documento_completo = f"---\n{yaml_frontmatter}---\n\n{cuerpo_md}\n"
    blob.upload_from_string(documento_completo, content_type="text/markdown; charset=utf-8")

    datos_retorno = dict(datos)
    datos_retorno["id"] = noticia_id
    datos_retorno["archivo_nombre"] = nombre_archivo
    datos_retorno["archivo_url"] = f"gs://{settings.GCS_NOTICIAS_BUCKET}/{prefijo}{nombre_archivo}"
    datos_retorno["tamano_bytes"] = len(documento_completo.encode("utf-8"))
    datos_retorno["origen"] = "cloud_storage"

    return datos_retorno

def eliminar_noticia_de_storage(noticia_id: str) -> bool:
    """
    Elimina el archivo Markdown de la noticia en Cloud Storage.
    """
    bucket = get_noticias_bucket()
    prefijo = settings.GCS_NOTICIAS_PREFIX

    candidatos = [
        f"{prefijo}{noticia_id}.md",
        f"{prefijo}{noticia_id}.markdown",
        f"{prefijo}{noticia_id}"
    ]

    for nombre_blob in candidatos:
        blob = bucket.blob(nombre_blob)
        if blob.exists():
            blob.delete()
            return True

    return False
