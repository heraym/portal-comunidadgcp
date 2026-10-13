// Componente Modal para la visualización completa de Newsletters en formato Markdown (.md) desde Cloud Storage
import React, { useState } from 'react';
import { X, FileText, Download, Copy, Check, Eye, Code, Cloud, Calendar, User, ExternalLink } from 'lucide-react';
import { marked } from 'marked';

// Configurar marked para saltos de línea automáticos y enlaces seguros
marked.setOptions({
  breaks: true,
  gfm: true
});

export const VisorNewsletterModal = ({ isOpen, onClose, newsletter }) => {
  const [modoVista, setModoVista] = useState('renderizado'); // 'renderizado' | 'codigo'
  const [copiado, setCopiado] = useState(false);

  if (!isOpen || !newsletter) return null;

  const fechaFormateada = new Date(newsletter.fecha_emision).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Convertir el markdown a HTML formateado
  const htmlRenderizado = marked.parse(newsletter.contenido_markdown || '');

  // Manejar copia del markdown al portapapeles
  const handleCopiar = () => {
    navigator.clipboard.writeText(newsletter.contenido_markdown || '');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Manejar descarga del archivo .md
  const handleDescargarMd = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="bg-[#10192E] border border-[#2A385B] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Visor */}
        <div className="px-6 py-4 border-b border-[#2A385B] bg-[#14203B] flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Edición #{newsletter.numero_edicion}
                </span>
                <span className="inline-flex items-center space-x-1 text-[11px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  <Cloud className="w-3 h-3" />
                  <span>gs://comunidadgcp/newsletters/{newsletter.archivo_nombre || `${newsletter.id}.md`}</span>
                </span>
              </div>
              <h2 className="text-base font-bold text-white truncate mt-1">
                {newsletter.titulo}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Herramientas y Metadatos */}
        <div className="px-6 py-2.5 bg-[#0D1424] border-b border-[#2A385B] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4 text-slate-300">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{fechaFormateada}</span>
            </span>
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{newsletter.autor}</span>
            </span>
            {newsletter.tamano_bytes && (
              <span className="text-slate-400 font-mono">
                {(newsletter.tamano_bytes / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Selector de Modo: Renderizado vs Código Fuente */}
            <div className="flex items-center bg-[#18233C] p-0.5 rounded-lg border border-[#2A385B]">
              <button
                onClick={() => setModoVista('renderizado')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  modoVista === 'renderizado'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Renderizado</span>
              </button>
              <button
                onClick={() => setModoVista('codigo')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  modoVista === 'codigo'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Código .md</span>
              </button>
            </div>

            {/* Copiar Markdown */}
            <button
              onClick={handleCopiar}
              title="Copiar contenido Markdown"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#18233C] hover:bg-[#202D4C] text-slate-300 hover:text-white border border-[#2A385B] transition-colors"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Copiado' : 'Copiar'}</span>
            </button>

            {/* Descargar Archivo .md */}
            <button
              onClick={handleDescargarMd}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .md</span>
            </button>
          </div>
        </div>

        {/* Contenido del Documento Markdown */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0E172A]">
          {modoVista === 'renderizado' ? (
            <div 
              className="newsletter-markdown-body text-slate-200 leading-relaxed text-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlRenderizado }}
            />
          ) : (
            <div className="relative">
              <pre className="bg-[#0A101D] border border-[#1E293B] rounded-xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed selection:bg-blue-600/30">
                {newsletter.contenido_markdown}
              </pre>
            </div>
          )}
        </div>

        {/* Pie de Página */}
        <div className="px-6 py-3 bg-[#14203B] border-t border-[#2A385B] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Fuente: Google Cloud Storage</span>
            <span>•</span>
            <span className="font-mono text-purple-300">gs://comunidadgcp/newsletters/{newsletter.archivo_nombre || `${newsletter.id}.md`}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#18233C] hover:bg-[#223152] text-white border border-[#2A385B] transition-colors"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  );
};
