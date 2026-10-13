// Componente de Tarjeta para Ediciones del Newsletter en Markdown (.md) desde Cloud Storage
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit, 
  Calendar, 
  BookOpen, 
  Cloud, 
  Maximize2, 
  Copy, 
  Check, 
  Code, 
  Eye 
} from 'lucide-react';
import { marked } from 'marked';

// Configuración de marked para listas y saltos limpios
marked.setOptions({
  breaks: true,
  gfm: true
});

export const CardNewsletter = ({ newsletter, onEdit, onDelete, onVerCompleto }) => {
  const { isAdmin } = useAuth();
  const [expandido, setExpandido] = useState(false);
  const [modoInline, setModoInline] = useState('renderizado'); // 'renderizado' | 'codigo'
  const [copiado, setCopiado] = useState(false);

  const fechaFormateada = new Date(newsletter.fecha_emision).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  // Generar HTML a partir del Markdown
  const htmlRenderizado = marked.parse(newsletter.contenido_markdown || '');

  // Manejador para copiar al portapapeles
  const handleCopiarMarkdown = () => {
    navigator.clipboard.writeText(newsletter.contenido_markdown || '');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Manejador para descargar el archivo .md original
  const handleDescargarMd = (e) => {
    e.stopPropagation();
    const blob = new Blob([newsletter.contenido_markdown || ''], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = newsletter.archivo_nombre || `${newsletter.id || 'newsletter'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-sm">
      <div>
        
        {/* Encabezado: Edición, Origen Cloud Storage y Acciones Admin */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Edición #{newsletter.numero_edicion}
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
              <Cloud className="w-3 h-3 text-cyan-400" />
              <span>{newsletter.archivo_nombre || `${newsletter.id}.md`}</span>
            </span>
            {newsletter.tamano_bytes && (
              <span className="text-[10px] text-slate-400 font-mono">
                {(newsletter.tamano_bytes / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {isAdmin && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(newsletter)}
                    title="Editar Newsletter"
                    className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(newsletter.id)}
                  title="Eliminar Newsletter"
                  className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Título de la Edición */}
        <h3 className="text-base font-bold text-white mb-2 leading-snug">
          {newsletter.titulo}
        </h3>

        {/* Fecha y Autor */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize">{fechaFormateada}</span>
          <span>•</span>
          <span>{newsletter.autor}</span>
        </div>

        {/* Resumen del boletín */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {newsletter.resumen}
        </p>

        {/* Temas Clave del Markdown */}
        {newsletter.temas_clave && newsletter.temas_clave.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {newsletter.temas_clave.map((tema, idx) => (
              <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-[#0E172A] text-purple-300 rounded border border-[#2A385B]">
                • {tema}
              </span>
            ))}
          </div>
        )}

        {/* Visualizador de Contenido Markdown Desplegable Inline */}
        {expandido && newsletter.contenido_markdown && (
          <div className="bg-[#10192E] border border-[#2A385B] rounded-xl p-4 mb-4 text-xs text-slate-200 animate-fadeIn space-y-3">
            {/* Barra de herramientas interna */}
            <div className="flex items-center justify-between border-b border-[#2A385B] pb-2">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setModoInline('renderizado')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
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
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    modoInline === 'codigo'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Código .md</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopiarMarkdown}
                  className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {copiado ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                </button>
                {onVerCompleto && (
                  <button
                    onClick={() => onVerCompleto(newsletter)}
                    className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Maximizar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Contenido según modo */}
            {modoInline === 'renderizado' ? (
              <div 
                className="newsletter-markdown-body max-h-96 overflow-y-auto pr-2"
                dangerouslySetInnerHTML={{ __html: htmlRenderizado }}
              />
            ) : (
              <pre className="bg-[#0A101D] border border-[#1E293B] rounded-lg p-3 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                {newsletter.contenido_markdown}
              </pre>
            )}
          </div>
        )}

      </div>

      {/* Botones de Acción de la Tarjeta */}
      <div className="pt-3 border-t border-[#2A385B] flex flex-wrap items-center justify-between gap-2 mt-2">
        <div className="flex items-center space-x-2">
          {/* Botón para expandir/plegar visualizador de Markdown */}
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium py-1.5 px-2.5 rounded bg-[#131D35] hover:bg-[#1E2942] border border-[#2A385B] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{expandido ? 'Ocultar Markdown' : 'Visualizar .md'}</span>
            {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Botón para abrir en modal de lectura a pantalla completa */}
          {onVerCompleto && (
            <button
              onClick={() => onVerCompleto(newsletter)}
              title="Abrir en modal a pantalla completa"
              className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white py-1.5 px-2.5 rounded bg-[#131D35] hover:bg-[#1E2942] border border-[#2A385B] transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Modal</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Descarga directa del archivo .md */}
          <button
            onClick={handleDescargarMd}
            title="Descargar archivo original .md"
            className="flex items-center space-x-1.5 text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 py-1.5 px-3 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Descargar .md</span>
          </button>

          {/* Descarga de PDF si existe */}
          {newsletter.documento_url && newsletter.documento_url.endsWith('.pdf') && (
            <a
              href={newsletter.documento_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 py-1.5 px-3 rounded-lg shadow-sm transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
};
