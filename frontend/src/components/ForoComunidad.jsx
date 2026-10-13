// Componente del Foro de Preguntas y Respuestas Técnicas de la Comunidad GCP
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  User, 
  PlusCircle, 
  Calendar, 
  Tag, 
  HelpCircle,
  CornerDownRight,
  Lock
} from 'lucide-react';

export const ForoComunidad = ({ comentarios, onCrearComentario, onResponderComentario }) => {
  const { isRegistered, isAdmin, currentUser, loginWithGoogle } = useAuth();
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Arquitectura General');
  const [nuevosTags, setNuevosTags] = useState('Cloud Run, Arquitectura');
  const [mostrarFormPregunta, setMostrarFormPregunta] = useState(false);

  // Estados locales para los campos de respuesta por hilo
  const [textosRespuesta, setTextosRespuesta] = useState({});

  const handleCrearPregunta = (e) => {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) return;

    onCrearComentario({
      titulo: nuevoTitulo,
      contenido: nuevoContenido,
      categoria: nuevaCategoria,
      tags: nuevosTags.split(',').map(t => t.trim()).filter(Boolean)
    });

    setNuevoTitulo('');
    setNuevoContenido('');
    setMostrarFormPregunta(false);
  };

  const handleEnviarRespuesta = (comentarioId) => {
    const texto = textosRespuesta[comentarioId];
    if (!texto || !texto.trim()) return;

    onResponderComentario(comentarioId, texto);
    setTextosRespuesta({ ...textosRespuesta, [comentarioId]: '' });
  };

  const formatearFecha = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Barra superior de acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18223D] border border-[#2A385B] p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span>Foro Técnico y Consultas de Arquitectura</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Espacio colaborativo para resolver desafíos de diseño, debatir patrones y recibir orientación de los administradores.
          </p>
        </div>

        {isRegistered ? (
          <button
            onClick={() => setMostrarFormPregunta(!mostrarFormPregunta)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{mostrarFormPregunta ? 'Cerrar Formulario' : 'Hacer una Pregunta'}</span>
          </button>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#131D35] hover:bg-[#1E2942] text-slate-200 text-xs font-semibold border border-[#2A385B] transition-all flex-shrink-0"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Inicia sesión para preguntar</span>
          </button>
        )}
      </div>

      {/* Formulario para publicar una nueva consulta */}
      {mostrarFormPregunta && isRegistered && (
        <form onSubmit={handleCrearPregunta} className="bg-[#131D35] border border-blue-500/40 rounded-xl p-5 shadow-lg space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Nueva Consulta de la Comunidad</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Título o Pregunta Resumida *</label>
            <input
              type="text"
              required
              value={nuevoTitulo}
              onChange={(e) => setNuevoTitulo(e.target.value)}
              placeholder="Ej: ¿Cómo estructurar VPC Service Controls para aislar buckets de BigQuery?"
              className="w-full px-3 py-2 bg-[#0E172A] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
              <select
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E172A] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Arquitectura General">Arquitectura General</option>
                <option value="Compute & Contenedores (Cloud Run / GKE)">Compute & Contenedores (Cloud Run / GKE)</option>
                <option value="Bases de Datos (AlloyDB / Spanner)">Bases de Datos (AlloyDB / Spanner)</option>
                <option value="Redes & Seguridad">Redes & Seguridad</option>
                <option value="IA & Vertex AI">IA & Vertex AI</option>
                <option value="FinOps & Costos">FinOps & Costos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Etiquetas (separadas por coma)</label>
              <input
                type="text"
                value={nuevosTags}
                onChange={(e) => setNuevosTags(e.target.value)}
                placeholder="Cloud Run, AlloyDB, Networking"
                className="w-full px-3 py-2 bg-[#0E172A] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detalle o Contexto Técnico *</label>
            <textarea
              rows={3}
              required
              value={nuevoContenido}
              onChange={(e) => setNuevoContenido(e.target.value)}
              placeholder="Describe el contexto de tu arquitectura, los errores encontrados o las alternativas consideradas..."
              className="w-full px-3 py-2 bg-[#0E172A] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setMostrarFormPregunta(false)}
              className="px-4 py-2 rounded-lg bg-[#18223D] text-xs text-slate-300 border border-[#2A385B]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/30"
            >
              Publicar Pregunta
            </button>
          </div>
        </form>
      )}

      {/* Lista de Hilos y Consultas */}
      <div className="space-y-5">
        {comentarios && comentarios.length > 0 ? (
          comentarios.map((hilo) => (
            <div key={hilo.id} className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 shadow-sm hover:border-[#384a75] transition-all">
              
              {/* Encabezado del Hilo */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={hilo.foto_autor || `https://ui-avatars.com/api/?name=${encodeURIComponent(hilo.nombre_autor)}&background=0E172A&color=4285F4`}
                    alt={hilo.nombre_autor}
                    className="w-9 h-9 rounded-full border border-blue-500/30 object-cover"
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{hilo.nombre_autor}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        • {formatearFecha(hilo.fecha_creacion)}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-400 font-medium">
                      {hilo.categoria || 'Consulta General'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {hilo.tags && hilo.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0E172A] text-slate-300 border border-[#2A385B]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Título y Contenido */}
              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {hilo.titulo}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed mb-4 whitespace-pre-line bg-[#131D35]/50 p-3 rounded-lg border border-[#2A385B]/50">
                {hilo.contenido}
              </p>

              {/* Respuestas del Hilo */}
              {hilo.respuestas && hilo.respuestas.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#2A385B] space-y-3 pl-2 sm:pl-4">
                  <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-blue-400" />
                    <span>Respuestas ({hilo.respuestas.length}):</span>
                  </div>

                  {hilo.respuestas.map((resp) => (
                    <div
                      key={resp.id_respuesta}
                      className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                        resp.es_admin
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-100 shadow-sm'
                          : 'bg-[#131D35] border-[#2A385B] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{resp.nombre_autor}</span>
                          {resp.es_admin && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              <span>Admin Comunidad</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatearFecha(resp.fecha)}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{resp.contenido}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar una respuesta */}
              <div className="mt-4 pt-3 border-t border-[#2A385B]/60">
                {isRegistered ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={textosRespuesta[hilo.id] || ''}
                      onChange={(e) => setTextosRespuesta({ ...textosRespuesta, [hilo.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEnviarRespuesta(hilo.id);
                        }
                      }}
                      placeholder={isAdmin ? "Responder como Administrador de la Comunidad..." : "Escribe una respuesta técnica..."}
                      className="flex-1 px-3 py-2 bg-[#0E172A] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleEnviarRespuesta(hilo.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors flex-shrink-0 ${
                        isAdmin ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Responder</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <button
                      onClick={loginWithGoogle}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Inicia sesión para participar y responder a este hilo
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#18223D] rounded-xl border border-[#2A385B]">
            <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300">No hay preguntas publicadas aún.</p>
            <p className="text-xs text-slate-400 mt-1">¡Sé el primero en iniciar un debate técnico en la comunidad!</p>
          </div>
        )}
      </div>

    </div>
  );
};
