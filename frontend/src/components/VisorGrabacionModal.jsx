import React, { useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  Calendar, 
  User, 
  Tag, 
  ExternalLink, 
  Cloud, 
  Download, 
  Copy, 
  Check, 
  AlertCircle,
  Play
} from 'lucide-react';

export const VisorGrabacionModal = ({ isOpen, onClose, charla }) => {
  const [copiado, setCopiado] = useState(false);
  const [errorVideo, setErrorVideo] = useState(false);

  // Reiniciar estado de error cada vez que se abre el modal o cambia la charla
  useEffect(() => {
    setErrorVideo(false);
  }, [charla?.id, isOpen]);

  if (!isOpen || !charla) return null;

  // Extraer el identificador de video de YouTube si corresponde
  const obtenerYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = obtenerYoutubeId(charla.grabacion_url);
  const esGCS = charla.tipo_grabacion === 'gcs' || 
                (charla.grabacion_url && (charla.grabacion_url.includes('grabaciones') || charla.grabacion_url.startsWith('//') || charla.grabacion_url.startsWith('gs://')));

  // Determinar la URL del video para streaming
  const videoStreamUrl = charla.grabacion_stream_url || `/api/v1/charlas/${charla.id}/video`;

  // Ruta canónica en Cloud Storage
  const rutaGCS = charla.grabacion_gcs || (charla.grabacion_url && charla.grabacion_url.startsWith('//') ? charla.grabacion_url : `//comunidadgcp/grabaciones/${charla.grabacion_archivo || charla.id + '.mp4'}`);
  const uriGCS = `gs://comunidadgcp/grabaciones/${charla.grabacion_archivo || charla.id + '.mp4'}`;

  // Copiar ruta de Cloud Storage al portapapeles
  const copiarRuta = () => {
    navigator.clipboard.writeText(uriGCS);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Formato amigable de fecha
  const formatearFecha = (isoString) => {
    try {
      const fecha = new Date(isoString);
      return fecha.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0E172A] border border-[#2A385B] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#2A385B] bg-[#131D35]/60 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  Grabación Oficial
                </span>
                {esGCS && (
                  <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    <Cloud className="w-3 h-3" />
                    <span>Cloud Storage</span>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 line-clamp-1">
                {charla.titulo}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Área del Reproductor de Video */}
        <div className="bg-black relative flex items-center justify-center min-h-[260px] sm:min-h-[400px] flex-shrink-0">
          {youtubeId ? (
            <div className="w-full h-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={charla.titulo}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : esGCS ? (
            <div className="w-full relative">
              {errorVideo ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">
                    No fue posible transmitir la grabación de video directamente.
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Verifica que el archivo esté presente en la ruta de Cloud Storage <br/>
                    <code className="text-blue-300 font-mono">{rutaGCS}</code>
                  </p>
                  <button
                    onClick={() => setErrorVideo(false)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
                  >
                    Reintentar reproducción
                  </button>
                </div>
              ) : (
                <video
                  key={videoStreamUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    console.error("Error al cargar streaming de video:", e);
                    setErrorVideo(true);
                  }}
                  className="w-full max-h-[58vh] bg-black shadow-inner"
                >
                  <source src={videoStreamUrl} type="video/mp4" />
                  Tu navegador no admite la reproducción de video HTML5.
                </video>
              )}
            </div>
          ) : charla.grabacion_url ? (
            <div className="w-full">
              <video
                controls
                autoPlay
                playsInline
                className="w-full max-h-[58vh] bg-black"
                src={charla.grabacion_url}
              >
                <source src={charla.grabacion_url} type="video/mp4" />
                Tu navegador no admite la reproducción de video.
              </video>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Video className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm">Grabación no disponible actualmente para esta charla.</p>
            </div>
          )}
        </div>

        {/* Información y Metadatos de la Charla */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#0E172A]">
          
          {/* Fila de Ubicación en Cloud Storage */}
          {esGCS && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#131D35] border border-[#2A385B] text-xs">
              <div className="flex items-center space-x-2 text-slate-300 truncate">
                <Cloud className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-400">Almacenamiento:</span>
                <span className="font-mono text-blue-300 truncate">{rutaGCS}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={copiarRuta}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#18223D] hover:bg-[#1E2942] text-slate-300 border border-[#2A385B] text-xs transition-colors"
                  title="Copiar URI de Cloud Storage"
                >
                  {copiado ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar URI</span>
                    </>
                  )}
                </button>
                <a
                  href={videoStreamUrl}
                  download={charla.grabacion_archivo || `${charla.id}.mp4`}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  title="Descargar archivo de video"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
              </div>
            </div>
          )}

          {/* Expositor y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-300 bg-[#131D35]/50 p-2 rounded-lg border border-[#2A385B]/50">
              <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Expositor / Ponente</span>
                <span className="font-semibold text-white">{charla.ponente}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-300 bg-[#131D35]/50 p-2 rounded-lg border border-[#2A385B]/50">
              <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Fecha de la Sesión</span>
                <span className="font-medium text-slate-200 capitalize">{formatearFecha(charla.fecha_hora)}</span>
              </div>
            </div>
          </div>

          {/* Descripción / Temario */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Temario y Descripción Técnica
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#131D35]/30 p-3 rounded-lg border border-[#2A385B]/40">
              {charla.descripcion}
            </p>
          </div>

          {/* Etiquetas y Material Adicional */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {charla.tags && charla.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                {charla.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#131D35] text-slate-300 border border-[#2A385B]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {charla.material_url && (
              <a
                href={charla.material_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#131D35] hover:bg-[#1E2942] text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors ml-auto"
              >
                <span>Material & Código (GitHub)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
