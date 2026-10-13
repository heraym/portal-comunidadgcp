// Componente Modal para la visualización inmersiva de Noticias de Google Cloud en formato Markdown (.md) desde Cloud Storage
import React, { useState } from 'react';
import { X, Newspaper, Download, Copy, Check, Eye, Code, Cloud, Calendar, User, ExternalLink } from 'lucide-react';
import { marked } from 'marked';

// Configurar marked para saltos de línea limpios
marked.setOptions({
  breaks: true,
  gfm: true
});

export const VisorNoticiaModal = ({ isOpen, onClose, noticia }) => {
  const [modoVista, setModoVista] = useState('renderizado'); // 'renderizado' | 'codigo'
  const [copiado, setCopiado] = useState(false);

  if (!isOpen || !noticia) return null;

  const fechaFormateada = new Date(noticia.fecha_publicacion).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const textoMarkdown = noticia.contenido_completo || noticia.resumen || '';
  const htmlRenderizado = marked.parse(textoMarkdown);

  // Manejar copia del markdown al portapapeles
  const handleCopiar = () => {
    navigator.clipboard.writeText(textoMarkdown);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Manejar descarga directa del archivo .md
  const handleDescargarMd = () => {
    const blob = new Blob([textoMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = noticia.archivo_nombre || `${noticia.id || 'noticia-gcp'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="bg-[#10192E] border border-[#2A385B] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Visor de Noticia */}
        <div className="px-6 py-4 border-b border-[#2A385B] bg-[#14203B] flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Newspaper className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {noticia.categoria || 'Noticia GCP'}
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-800/40">
                  <Cloud className="w-3 h-3 text-cyan-400" />
                  <span>{noticia.archivo_nombre || `${noticia.id}.md`}</span>
                </span>
              </div>
              <h2 className="text-base font-bold text-white truncate max-w-xl mt-0.5">
                {noticia.titulo}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors ml-3"
            title="Cerrar lector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Herramientas y Metadatos */}
        <div className="px-6 py-2.5 bg-[#0D1527] border-b border-[#2A385B] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{fechaFormateada}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{noticia.publicado_por || 'Comunidad GCP'}</span>
            </span>
            {noticia.tamano_bytes && (
              <span className="font-mono text-[11px] text-cyan-400">
                {(noticia.tamano_bytes / 1024).toFixed(1)} KB
              </span>
            )}
            {noticia.fuente_url && (
              <a
                href={noticia.fuente_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
              >
                <span>Fuente oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Selector de modo y botones de acción */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#18223D] border border-[#2A385B] rounded-lg p-0.5">
              <button
                onClick={() => setModoVista('renderizado')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  modoVista === 'renderizado'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Renderizado</span>
              </button>
              <button
                onClick={() => setModoVista('codigo')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  modoVista === 'codigo'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Código .md</span>
              </button>
            </div>

            <button
              onClick={handleCopiar}
              title="Copiar Markdown al portapapeles"
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#18223D] hover:bg-slate-700 text-slate-300 border border-[#2A385B] rounded-lg text-xs transition-colors"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDescargarMd}
              title="Descargar archivo .md"
              className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .md</span>
            </button>
          </div>
        </div>

        {/* Contenedor de Lectura del Markdown */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0B1120]">
          {modoVista === 'renderizado' ? (
            <article 
              className="newsletter-markdown-body max-w-none text-slate-200"
              dangerouslySetInnerHTML={{ __html: htmlRenderizado }}
            />
          ) : (
            <pre className="p-4 bg-[#070C18] border border-[#2A385B] rounded-xl text-xs font-mono text-emerald-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {textoMarkdown}
            </pre>
          )}
        </div>

        {/* Pie del Visor */}
        <div className="px-6 py-3 border-t border-[#2A385B] bg-[#14203B] flex items-center justify-between text-xs text-slate-400">
          <div className="flex flex-wrap gap-1.5">
            {noticia.tags && noticia.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-[#18223D] border border-[#2A385B] text-slate-300 text-[11px] font-mono">
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
