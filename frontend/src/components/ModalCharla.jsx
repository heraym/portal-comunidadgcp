// Modal para que el Administrador cree o edite una Charla técnica periódica con grabaciones en Cloud Storage
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Video, 
  Calendar, 
  User, 
  Link, 
  FileText, 
  Tag, 
  Cloud, 
  Upload, 
  CheckCircle, 
  Film, 
  Loader2 
} from 'lucide-react';
import { getGrabacionesDisponibles, uploadGrabacion } from '../services/api';

export const ModalCharla = ({ isOpen, onClose, onSave, charlaEditar }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    ponente: '',
    fecha_hora: '',
    estado: 'pendiente',
    meet_id: '',
    grabacion_archivo: '',
    material_url: '',
    tags: ''
  });

  const [grabacionesStorage, setGrabacionesStorage] = useState([]);
  const [cargandoGrabaciones, setCargandoGrabaciones] = useState(false);
  const [subiendoVideo, setSubiendoVideo] = useState(false);
  const [mensajeSubida, setMensajeSubida] = useState('');

  // Cargar lista de grabaciones alojadas en //comunidadgcp/grabaciones/
  useEffect(() => {
    if (isOpen) {
      cargarGrabacionesGCS();
    }
  }, [isOpen]);

  const cargarGrabacionesGCS = async () => {
    try {
      setCargandoGrabaciones(true);
      const grabaciones = await getGrabacionesDisponibles();
      setGrabacionesStorage(grabaciones || []);
    } catch (err) {
      console.warn("Advertencia al consultar grabaciones de Cloud Storage:", err);
    } finally {
      setCargandoGrabaciones(false);
    }
  };

  useEffect(() => {
    if (charlaEditar) {
      // Extraer únicamente el nombre del archivo si viene como ruta completa o URL
      const rawGrabacion = charlaEditar.grabacion_archivo || charlaEditar.grabacion_url || '';
      const soloNombre = rawGrabacion ? rawGrabacion.split('/').pop().trim() : '';

      setFormData({
        titulo: charlaEditar.titulo || '',
        descripcion: charlaEditar.descripcion || '',
        ponente: charlaEditar.ponente || '',
        fecha_hora: charlaEditar.fecha_hora ? charlaEditar.fecha_hora.slice(0, 16) : '',
        estado: charlaEditar.estado || 'pendiente',
        meet_id: charlaEditar.meet_id || '',
        grabacion_archivo: soloNombre,
        material_url: charlaEditar.material_url || '',
        tags: charlaEditar.tags ? charlaEditar.tags.join(', ') : ''
      });
    } else {
      // Valores iniciales para una nueva charla técnica
      const manana = new Date();
      manana.setDate(manana.getDate() + 7);
      manana.setHours(19, 0, 0, 0);

      setFormData({
        titulo: '',
        descripcion: '',
        ponente: '',
        fecha_hora: manana.toISOString().slice(0, 16),
        estado: 'pendiente',
        meet_id: 'meet.google.com/gcp-com-arch',
        grabacion_archivo: '', // Campo opcional: solo nombre del archivo en //comunidadgcp/grabaciones/
        material_url: '',
        tags: 'Cloud Run, Vertex AI, Arquitectura'
      });
    }
    setMensajeSubida('');
  }, [charlaEditar, isOpen]);

  if (!isOpen) return null;

  // Manejar la subida directa de archivo de video a Cloud Storage
  const handleSubirArchivoVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendoVideo(true);
      setMensajeSubida(`Subiendo ${file.name} a //comunidadgcp/grabaciones/...`);
      const resultado = await uploadGrabacion(file);
      
      // Asignar exclusivamente el nombre del archivo en Cloud Storage
      setFormData(prev => ({
        ...prev,
        grabacion_archivo: resultado.nombre_archivo,
        estado: 'realizada' // Si se carga grabación, marcar charla como realizada
      }));

      setMensajeSubida(`¡Grabación subida exitosamente! (${resultado.tamano_legible})`);
      // Refrescar lista de grabaciones disponibles
      cargarGrabacionesGCS();
    } catch (err) {
      alert("Error al subir video a Cloud Storage: " + (err.response?.data?.detail || err.message));
      setMensajeSubida('');
    } finally {
      setSubiendoVideo(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.ponente.trim() || !formData.fecha_hora) {
      alert("Por favor completa los campos obligatorios: Título, Ponente y Fecha.");
      return;
    }
    // Limpiar nombre del archivo de cualquier ruta accidental
    const nombreLimpio = formData.grabacion_archivo ? formData.grabacion_archivo.split('/').pop().trim() : null;

    const payload = {
      ...formData,
      // Solo el nombre de archivo (opcional)
      grabacion_archivo: nombreLimpio || null,
      // Ruta canónica en Cloud Storage para retrocompatibilidad
      grabacion_url: nombreLimpio ? `//comunidadgcp/grabaciones/${nombreLimpio}` : null,
      fecha_hora: new Date(formData.fecha_hora).toISOString(),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0E172A] border border-[#2A385B] rounded-2xl w-full max-w-xl p-6 shadow-2xl my-8">
        
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A385B] mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {charlaEditar ? 'Editar Charla Técnica' : 'Nueva Charla Periódica'}
              </h3>
              <p className="text-xs text-slate-400">
                Gestión de agenda, Google Meet y grabaciones en Cloud Storage
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título de la Charla *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej: Arquitecturas Resilientes con Cloud Spanner y Cloud Run"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expositor / Ponente *
              </label>
              <input
                type="text"
                required
                value={formData.ponente}
                onChange={(e) => setFormData({ ...formData, ponente: e.target.value })}
                placeholder="Ej: Ing. Laura Gómez (GCP Innovator)"
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estado de la Charla
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pendiente">Pendiente (Por Realizarse con Google Meet)</option>
                <option value="realizada">Realizada (Grabación disponible)</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha y Hora *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.fecha_hora}
              onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción / Agenda Técnica
            </label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Temario a cubrir, requisitos previos, casos de estudio..."
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ID o Enlace de Google Meet (para charlas pendientes)
            </label>
            <input
              type="text"
              value={formData.meet_id}
              onChange={(e) => setFormData({ ...formData, meet_id: e.target.value })}
              placeholder="meet.google.com/xyz-abcd-efg"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          {/* Bloque Destacado de Grabación en Google Cloud Storage */}
          <div className="bg-[#131D35] border border-blue-500/30 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
                <Cloud className="w-4 h-4 text-blue-400" />
                <span>Grabación en Cloud Storage (//comunidadgcp/grabaciones/)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Bucket: comunidadgcp</span>
            </div>

            {/* Selector de grabaciones existentes en Cloud Storage */}
            {grabacionesStorage.length > 0 && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Seleccionar archivo disponible en Cloud Storage:
                </label>
                <select
                  value={formData.grabacion_archivo || ''}
                  onChange={(e) => {
                    const nombre = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      grabacion_archivo: nombre,
                      estado: nombre ? 'realizada' : prev.estado
                    }));
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#0E172A] border border-[#2A385B] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="">-- Sin archivo / Seleccionar de la lista --</option>
                  {grabacionesStorage.map((g) => (
                    <option key={g.nombre_archivo} value={g.nombre_archivo}>
                      {g.nombre_archivo} ({g.tamano_legible})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campo para ingresar o modificar el nombre del archivo */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-slate-300">
                  Nombre del archivo de grabación <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                {formData.grabacion_archivo && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, grabacion_archivo: '' })}
                    className="text-[10px] text-red-400 hover:text-red-300"
                  >
                    Quitar archivo
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.grabacion_archivo}
                onChange={(e) => {
                  // Si el usuario pega una ruta con diagonales, conservar solo el nombre del archivo
                  const limpio = e.target.value.split('/').pop().trim();
                  setFormData({ ...formData, grabacion_archivo: limpio });
                }}
                placeholder="ej: charla-cloudrun-demo.mp4"
                className="w-full px-3 py-2 bg-[#0E172A] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Ingresa solo el nombre del archivo (ej: <code className="text-blue-300 font-mono">charla-cloudrun-demo.mp4</code>). Todos los videos se cargan desde <span className="text-blue-400 font-mono">//comunidadgcp/grabaciones/</span>. No ingresar URLs.
              </p>
            </div>

            {/* Subida directa de archivo de video */}
            <div className="pt-2 border-t border-[#2A385B]/60 flex items-center justify-between">
              <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer transition-colors">
                {subiendoVideo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Subiendo archivo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Video a Cloud Storage</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/mkv,video/quicktime"
                  disabled={subiendoVideo}
                  onChange={handleSubirArchivoVideo}
                  className="hidden"
                />
              </label>

              {mensajeSubida && (
                <span className="text-[11px] text-emerald-400 font-medium truncate max-w-[240px]">
                  {mensajeSubida}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enlace a Material / Diapositivas (GitHub)
              </label>
              <input
                type="text"
                value={formData.material_url}
                onChange={(e) => setFormData({ ...formData, material_url: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="GKE, Cloud Run, Vertex AI"
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#2A385B] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#18223D] hover:bg-[#1E2942] text-sm text-slate-300 border border-[#2A385B] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={subiendoVideo}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{charlaEditar ? 'Guardar Cambios' : 'Crear Charla'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
