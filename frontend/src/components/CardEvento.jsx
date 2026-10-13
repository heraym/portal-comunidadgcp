// Componente de Tarjeta para Eventos Presenciales y Summits
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, ExternalLink, Users, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

export const CardEvento = ({ evento, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();

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
          minute: '2-digit' 
        })
      };
    } catch {
      return { fecha: isoString, hora: '' };
    }
  };

  const { fecha, hora } = formatearFechaHora(evento.fecha_hora);

  return (
    <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-sm group">
      <div>
        
        {/* Encabezado con Estado y Acciones Admin */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="capitalize">{evento.estado || 'Abierto'}</span>
          </span>

          {isAdmin && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onEdit(evento)}
                title="Editar Evento"
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(evento.id)}
                title="Eliminar Evento"
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Nombre del Evento */}
        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-emerald-300 transition-colors">
          {evento.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
          {evento.descripcion}
        </p>

        {/* Metadata de Ubicación, Fecha y Cupos */}
        <div className="bg-[#131D35] border border-[#2A385B]/60 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex items-start space-x-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium text-slate-200">{evento.lugar}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="capitalize">{fecha} - {hora} hs</span>
          </div>

          {evento.cupos && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Cupo estimado: {evento.cupos} participantes</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {evento.tags && evento.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {evento.tags.map((t, idx) => (
              <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-[#0E172A] text-slate-300 rounded border border-[#2A385B]">
                #{t}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Botón de Registro */}
      <div className="pt-3 border-t border-[#2A385B]">
        {evento.link_registro ? (
          <a
            href={evento.link_registro}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <span>Inscribirme al Evento Presencial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-slate-500 italic block text-center">Inscripción pronto disponible</span>
        )}
      </div>

    </div>
  );
};
