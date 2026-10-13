// Componente de Tarjeta para Charlas Técnicas (Pendientes con Meet o Realizadas con Grabación)
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  PlayCircle, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle,
  Tag,
  Lock,
  Cloud
} from 'lucide-react';

export const CardCharla = ({ charla, onEdit, onDelete, onVerGrabacion }) => {
  const { isRegistered, isAdmin, loginWithGoogle } = useAuth();
  const esPendiente = charla.estado === 'pendiente';

  // Formato amigable de fecha y hora en español
  const formatearFechaHora = (isoString) => {
    try {
      const fecha = new Date(isoString);
      return {
        fecha: fecha.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        hora: fecha.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZoneName: 'short'
        })
      };
    } catch {
      return { fecha: isoString, hora: '' };
    }
  };

  const { fecha, hora } = formatearFechaHora(charla.fecha_hora);

  return (
    <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-sm relative group">
      <div>
        
        {/* Barra superior con Estado y Acciones de Administrador */}
        <div className="flex items-center justify-between mb-3">
          {esPendiente ? (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Próxima Charla</span>
            </span>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Realizada</span>
              </span>
              {charla.tipo_grabacion === 'gcs' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" title="Grabación alojada en //comunidadgcp/grabaciones/">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>Cloud Storage</span>
                </span>
              )}
            </div>
          )}

          {/* Opciones de Administración */}
          {isAdmin && (
            <div className="flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(charla)}
                title="Editar Charla"
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(charla.id)}
                title="Eliminar Charla"
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Título de la Charla */}
        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-blue-300 transition-colors">
          {charla.titulo}
        </h3>

        {/* Expositor */}
        <div className="flex items-center space-x-2 text-xs text-slate-300 mb-3">
          <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="font-medium truncate">{charla.ponente}</span>
        </div>

        {/* Descripción */}
        <p className="text-xs text-slate-300/90 leading-relaxed mb-4 line-clamp-3">
          {charla.descripcion}
        </p>

        {/* Metadata de Fecha y Hora */}
        <div className="bg-[#131D35] border border-[#2A385B]/60 rounded-lg p-2.5 mb-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="capitalize">{fecha}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{hora}</span>
          </div>
        </div>

        {/* Etiquetas de Tecnología */}
        {charla.tags && charla.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {charla.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0E172A] text-slate-300 border border-[#2A385B]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sección Inferior de Enlaces y Acciones */}
      <div className="pt-3 border-t border-[#2A385B] mt-2">
        {esPendiente ? (
          <div>
            {isRegistered ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-blue-950/40 border border-blue-500/30 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <Video className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-blue-200 truncate">
                      {charla.meet_id || 'meet.google.com/comunidad-gcp'}
                    </span>
                  </div>
                  <a
                    href={charla.meet_id?.startsWith('http') ? charla.meet_id : `https://${charla.meet_id || 'meet.google.com'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded transition-colors flex-shrink-0"
                  >
                    <span>Unirse</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-[#131D35] hover:bg-[#1E2942] text-xs font-semibold text-slate-300 border border-[#2A385B] transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Inicia sesión para ver el ID de Meet</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {(charla.tiene_grabacion || charla.grabacion_url) ? (
              <button
                type="button"
                onClick={() => onVerGrabacion ? onVerGrabacion(charla) : (charla.grabacion_url && window.open(charla.grabacion_url, '_blank'))}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all shadow-sm hover:border-red-400/50"
              >
                <PlayCircle className="w-4 h-4 text-red-400" />
                <span>Ver Grabación</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">Grabación en edición</span>
            )}

            {charla.material_url && (
              <a
                href={charla.material_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 py-2 px-3 rounded-lg bg-[#131D35] hover:bg-[#1E2942] text-slate-300 border border-[#2A385B] text-xs font-medium transition-colors"
                title="Ver Material o Repositorio"
              >
                <span>Material</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
