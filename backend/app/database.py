# Inicialización y gestión del cliente Cloud Firestore y Firebase Admin SDK
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as gcp_firestore
from app.config import settings

# Configuración de registros de eventos (logging)
logger = logging.getLogger("comunidadgcp.database")

# Cliente singleton para interactuar con Firestore
db_client = None

def get_firestore_client():
    """
    Inicializa y retorna la instancia del cliente de Cloud Firestore.
    Utiliza Application Default Credentials (ADC) en Google Cloud Run,
    o las credenciales por defecto de Firebase Admin SDK.
    """
    global db_client
    if db_client is not None:
        return db_client

    try:
        # Inicializa Firebase Admin SDK si aún no está inicializado
        if not firebase_admin._apps:
            try:
                # Intenta inicializar con credenciales por defecto del entorno GCP
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.GCP_PROJECT_ID,
                })
                logger.info(f"Firebase Admin inicializado exitosamente con ADC para el proyecto {settings.GCP_PROJECT_ID}")
            except Exception as e_adc:
                logger.warning(f"No se pudieron cargar credenciales ADC por defecto: {e_adc}. Inicializando app por defecto.")
                firebase_admin.initialize_app()

        # Obtiene el cliente de Firestore a través de google-cloud-firestore
        db_client = gcp_firestore.Client(
            project=settings.GCP_PROJECT_ID,
            database=settings.FIRESTORE_DATABASE
        )
        logger.info(f"Cliente de Cloud Firestore conectado a la base de datos: {settings.FIRESTORE_DATABASE} en {settings.GCP_PROJECT_ID}")
        return db_client

    except Exception as e:
        logger.error(f"Error al conectar con Cloud Firestore: {e}. Se utilizará almacén en memoria para desarrollo local.")
        # Fallback para desarrollo local si no hay conexión activa a GCP
        db_client = InMemoryFirestoreMock()
        return db_client

class InMemoryCollectionMock:
    """Simulador en memoria de una colección de Firestore para desarrollo local sin conexión"""
    def __init__(self, name):
        self.name = name
        self.data = {}

    def document(self, doc_id=None):
        if not doc_id:
            import uuid
            doc_id = str(uuid.uuid4())
        return InMemoryDocumentMock(self, doc_id)

    def stream(self):
        # Retorna todos los documentos como generador
        for doc_id, content in list(self.data.items()):
            yield InMemoryDocSnapshot(doc_id, content)

    def order_by(self, field, direction="ASCENDING"):
        return self

    def limit(self, count):
        return self

    def where(self, field, op, val):
        return self

class InMemoryDocumentMock:
    """Simulador en memoria de un documento de Firestore"""
    def __init__(self, collection, doc_id):
        self.collection = collection
        self.id = doc_id

    def get(self):
        exists = self.id in self.collection.data
        data = self.collection.data.get(self.id, {})
        return InMemoryDocSnapshot(self.id, data, exists=exists)

    def set(self, data, merge=False):
        if merge and self.id in self.collection.data:
            self.collection.data[self.id].update(data)
        else:
            self.collection.data[self.id] = dict(data)
        return True

    def update(self, data):
        if self.id in self.collection.data:
            self.collection.data[self.id].update(data)
        else:
            self.collection.data[self.id] = dict(data)
        return True

    def delete(self):
        if self.id in self.collection.data:
            del self.collection.data[self.id]
        return True

class InMemoryDocSnapshot:
    """Simulador de una instantánea de documento de Firestore"""
    def __init__(self, doc_id, data, exists=True):
        self.id = doc_id
        self._data = data
        self.exists = exists

    def to_dict(self):
        return dict(self._data)

class InMemoryFirestoreMock:
    """Simulador de cliente Firestore para desarrollo sin conexión"""
    def __init__(self):
        self.collections = {}

    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = InMemoryCollectionMock(name)
        return self.collections[name]
