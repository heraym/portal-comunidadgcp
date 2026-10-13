// Cliente de peticiones HTTP para comunicarse con el Backend FastAPI
import axios from 'axios';

// Instancia base de Axios
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el Bearer Token de Firebase
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('comunidad_gcp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Servicios de Registro y Usuarios ---
export const registrarMiembro = async (datos) => {
  const response = await api.post('/usuarios/registro', datos);
  return response.data;
};

export const syncUsuario = async (datos) => {
  const response = await api.post('/usuarios/sincronizar', datos);
  return response.data;
};

export const getMiPerfil = async () => {
  const response = await api.get('/usuarios/me');
  return response.data;
};

export const getUsuarios = async () => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const updateRolUsuario = async (uid, rol) => {
  const response = await api.patch(`/usuarios/${uid}/rol`, { rol });
  return response.data;
};

// Habilitar o deshabilitar cuenta de usuario
export const updateEstadoUsuario = async (uid, activo) => {
  const response = await api.patch(`/usuarios/${uid}/estado`, { activo });
  return response.data;
};

// Eliminar definitivamente un usuario de la comunidad
export const deleteUsuario = async (uid) => {
  const response = await api.delete(`/usuarios/${uid}`);
  return response.data;
};

// --- Servicios de Charlas Técnicas ---
export const getCharlas = async (estado = null) => {
  const params = estado ? { estado } : {};
  const response = await api.get('/charlas', { params });
  return response.data;
};

export const createCharla = async (datos) => {
  const response = await api.post('/charlas', datos);
  return response.data;
};

export const updateCharla = async (id, datos) => {
  const response = await api.put(`/charlas/${id}`, datos);
  return response.data;
};

export const deleteCharla = async (id) => {
  await api.delete(`/charlas/${id}`);
};

// Servicios para grabaciones de Cloud Storage en //comunidadgcp/grabaciones/
export const getGrabacionesDisponibles = async () => {
  const response = await api.get('/charlas/grabaciones');
  return response.data;
};

export const uploadGrabacion = async (archivo) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const response = await api.post('/charlas/grabaciones/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCharlaVideoUrl = (charlaId) => {
  return `/api/v1/charlas/${charlaId}/video`;
};

// --- Servicios de Noticias GCP ---
export const getNoticias = async (categoria = null, destacadas = null) => {
  const params = {};
  if (categoria) params.categoria = categoria;
  if (destacadas !== null) params.destacadas = destacadas;
  const response = await api.get('/noticias', { params });
  return response.data;
};

export const createNoticia = async (datos) => {
  const response = await api.post('/noticias', datos);
  return response.data;
};

export const updateNoticia = async (id, datos) => {
  const response = await api.put(`/noticias/${id}`, datos);
  return response.data;
};

export const deleteNoticia = async (id) => {
  await api.delete(`/noticias/${id}`);
};

// --- Servicios de Newsletters ---
export const getNewsletters = async () => {
  const response = await api.get('/newsletters');
  return response.data;
};

export const createNewsletter = async (datos) => {
  const response = await api.post('/newsletters', datos);
  return response.data;
};

export const updateNewsletter = async (id, datos) => {
  const response = await api.put(`/newsletters/${id}`, datos);
  return response.data;
};

export const deleteNewsletter = async (id) => {
  await api.delete(`/newsletters/${id}`);
};

// --- Servicios de Eventos Presenciales ---
export const getEventos = async (estado = null) => {
  const params = estado ? { estado } : {};
  const response = await api.get('/eventos', { params });
  return response.data;
};

export const createEvento = async (datos) => {
  const response = await api.post('/eventos', datos);
  return response.data;
};

export const updateEvento = async (id, datos) => {
  const response = await api.put(`/eventos/${id}`, datos);
  return response.data;
};

export const deleteEvento = async (id) => {
  await api.delete(`/eventos/${id}`);
};

// --- Servicios de Foro y Comentarios ---
export const getComentarios = async () => {
  const response = await api.get('/comentarios');
  return response.data;
};

export const createComentario = async (datos) => {
  const response = await api.post('/comentarios', datos);
  return response.data;
};

export const answerComentario = async (id, contenido) => {
  const response = await api.post(`/comentarios/${id}/respuestas`, { contenido });
  return response.data;
};

export const deleteComentario = async (id) => {
  await api.delete(`/comentarios/${id}`);
};

// --- Comprobación de Salud ---
export const getHealth = async () => {
  const response = await axios.get('/health');
  return response.data;
};

export default api;
