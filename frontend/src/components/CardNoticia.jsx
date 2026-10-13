// Componente de Tarjeta para Noticias de Google Cloud en formato Markdown (.md) desde Cloud Storage
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Newspaper, 
  ExternalLink, 
  Calendar, 
  Trash2, 
  Edit, 
  Tag, 
  Bookmark, 
  Cloud, 
  Download, 
  Eye, 
  Code, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Maximize2 
} from 'lucide-react';
import { marked } from 'marked';

// Configuración de marked para listas y saltos limpios
marked.setOptions({
  breaks: true,
  gfm: true
});

export const CardNoticia = ({ noticia, onEdit, onDelete, onVerCompleto }) => {
  const { isAdmin } = useAuth();
  const [expandido, setExpandido] = useState(false);
  const [modoInline, setModoInline] = useState('renderizado'); // 'renderizado' | 'codigo'
  const [copiado, setCopiado] = useState(false);

  const fechaFormateada = new Date(noticia.fecha_publicacion).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const textoMarkdown = noticia.contenido_completo || noticia.resumen || '';
  const htmlRenderizado = marked.parse(textoMarkdown);

  // Manejador para copiar al portapapeles
  const handleCopiarMarkdown = () => {
    navigator.clipboard.writeText(textoMarkdown);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Manejador para descargar el archivo .md original
  const handleDescargarMd = (e) => {
    e.stopPropagation();
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
    <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-sm">
      <div>
        {/* Encabezado con Categoría, Archivo Cloud Storage, Fecha y Acción Admin */}
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
              {noticia.categoria || 'GCP News'}
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
              <Cloud className="w-3 h-3 text-cyan-400" />
              <span>{noticia.archivo_nombre || `${noticia.id}.md`}</span>
            </span>
            {noticia.tamano_bytes && (
              <span className="text-[10px] text-slate-400 font-mono">
                {(noticia.tamano_bytes / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{fechaFormateada}</span>
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-1 ml-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(noticia)}
                    title="Editar Noticia"
                    className="p-1 rounded bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(noticia.id)}
                  title="Eliminar Noticia"
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Título de la Noticia */}
        <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-blue-300 transition-colors">
          {noticia.titulo}
        </h3>

        {/* Resumen */}
        <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
          {noticia.resumen}
        </p>

        {/* Tags */}
        {noticia.tags && noticia.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {noticia.tags.map((t, idx) => (
              <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0E172A] text-slate-400 rounded border border-[#2A385B]">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Botones de acción Markdown */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pt-1">
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all"
          >
            {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expandido ? 'Ocultar .md' : 'Visualizar .md'}</span>
          </button>

          {onVerCompleto && (
            <button
              onClick={() => onVerCompleto(noticia)}
              title="Abrir lector a pantalla completa"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#10192E] hover:bg-slate-800 border border-[#2A385B] text-slate-300 text-xs font-medium transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Modal</span>
            </button>
          )}

          <button
            onClick={handleDescargarMd}
            title="Descargar archivo Markdown"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#10192E] hover:bg-slate-800 border border-[#2A385B] text-slate-300 text-xs font-medium transition-colors ml-auto"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Descargar .md</span>
          </button>
        </div>

        {/* Visor Markdown Inline Desplegable */}
        {expandido && (
          <div className="mt-3 mb-4 bg-[#0F172A] border border-[#2A385B] rounded-xl overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-3 py-2 bg-[#14203B] border-b border-[#2A385B] text-xs">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setModoInline('renderizado')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    modoInline === 'renderizado'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Renderizado</span>
                </button>
                <button
                  onClick={() => setModoInline('codigo')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                    modoInline === 'codigo'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Código .md</span>
                </button>
              </div>

              <button
                onClick={handleCopiarMarkdown}
                className="flex items-center space-x-1 px-2 py-0.5 text-[11px] text-slate-300 hover:text-white bg-[#18223D] border border-[#2A385B] rounded transition-colors"
                title="Copiar contenido Markdown"
              >
                {copiado ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {modoInline === 'renderizado' ? (
                <article 
                  className="newsletter-markdown-body text-xs text-slate-200"
                  dangerouslySetInnerHTML={{ __html: htmlRenderizado }}
                />
              ) : (
                <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {textoMarkdown}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pie de tarjeta con Fuente y Publicador */}
      <div className="pt-3 border-t border-[#2A385B] flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium truncate max-w-[150px]">
          {noticia.publicado_por}
        </span>
        {noticia.fuente_url && (
          <a
            href={noticia.fuente_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium"
          >
            <span>Leer Fuente Oficial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
