// Modal para que el Administrador cargue o edite una edición del Newsletter alojado en Cloud Storage (.md)
import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Cloud, Upload, Eye, Edit3 } from 'lucide-react';
import { marked } from 'marked';

export const ModalNewsletter = ({ isOpen, onClose, onSave, newsletterEditar = null }) => {
  const [formData, setFormData] = useState({
    numero_edicion: 13,
    titulo: '',
    resumen: '',
    contenido_markdown: '',
    documento_url: '',
    autor: 'Equipo Editorial Comunidad GCP',
    temas_clave: 'GKE Autopilot, Vertex AI, FinOps'
  });

  const [pestañaActiva, setPestañaActiva] = useState('editor'); // 'editor' | 'previa'

  useEffect(() => {
    if (newsletterEditar) {
      setFormData({
        numero_edicion: newsletterEditar.numero_edicion || 1,
        titulo: newsletterEditar.titulo || '',
        resumen: newsletterEditar.resumen || '',
        contenido_markdown: newsletterEditar.contenido_markdown || '',
        documento_url: newsletterEditar.documento_url || '',
        autor: newsletterEditar.autor || 'Equipo Editorial Comunidad GCP',
        temas_clave: Array.isArray(newsletterEditar.temas_clave) ? newsletterEditar.temas_clave.join(', ') : (newsletterEditar.temas_clave || '')
      });
    } else {
      setFormData({
        numero_edicion: 13,
        titulo: '',
        resumen: '',
        contenido_markdown: '# Boletín de Novedades y Actualizaciones\n\n## 🚀 Novedades del Mes\n- Anuncio importante 1...\n- Anuncio importante 2...\n\n## 💡 Guías de Arquitectura\nDetalles técnicos...',
        documento_url: '',
        autor: 'Equipo Editorial Comunidad GCP',
        temas_clave: 'GKE Autopilot, Vertex AI, FinOps'
      });
    }
    setPestañaActiva('editor');
  }, [newsletterEditar, isOpen]);

  if (!isOpen) return null;

  // Manejar carga de archivo .md desde la máquina local
  const handleCargarArchivoLocal = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const texto = event.target.result;
      let tituloSugerido = file.name.replace('.md', '').replace('.markdown', '').replace(/-/g, ' ');
      let cuerpo = texto;

      // Extraer título si hay encabezado #
      for (const linea of texto.split('\n')) {
        if (linea.trim().startsWith('# ')) {
          tituloSugerido = linea.trim().substring(2);
          break;
        }
      }

      setFormData(prev => ({
        ...prev,
        titulo: prev.titulo || tituloSugerido,
        contenido_markdown: texto
      }));
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      numero_edicion: parseInt(formData.numero_edicion, 10),
      fecha_emision: newsletterEditar?.fecha_emision || new Date().toISOString(),
      temas_clave: typeof formData.temas_clave === 'string' ? formData.temas_clave.split(',').map(t => t.trim()).filter(Boolean) : formData.temas_clave
    }, newsletterEditar?.id);
  };

  const previewHtml = marked.parse(formData.contenido_markdown || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0E172A] border border-[#2A385B] rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A385B] mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {newsletterEditar ? 'Editar Newsletter en Cloud Storage (.md)' : 'Publicar Newsletter en Cloud Storage (.md)'}
              </h3>
              <p className="text-xs text-slate-400">
                Almacena el archivo Markdown directamente en <code className="text-cyan-300 font-mono">gs://comunidadgcp/newsletters/</code>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Carga rápida de archivo .md */}
          <div className="flex items-center justify-between bg-[#14203B] border border-[#2A385B] p-2.5 rounded-lg text-xs">
            <span className="text-slate-300">¿Tienes un archivo <code className="text-purple-300 font-mono">.md</code> listo?</span>
            <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-md transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar archivo .md</span>
              <input type="file" accept=".md,.markdown" onChange={handleCargarArchivoLocal} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">N° Edición *</label>
              <input
                type="number"
                required
                value={formData.numero_edicion}
                onChange={(e) => setFormData({ ...formData, numero_edicion: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Autor / Responsable</label>
              <input
                type="text"
                value={formData.autor}
                onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Newsletter *</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej: Newsletter Octubre 2026: Novedades Cloud Next y FinOps"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resumen Ejecutivo *</label>
            <textarea
              rows={2}
              required
              value={formData.resumen}
              onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
              placeholder="Breve sumario de lo que contiene este boletín..."
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Editor Markdown con Pestaña de Vista Previa */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Contenido en Markdown (.md) *</label>
              <div className="flex items-center space-x-1 bg-[#131D35] p-0.5 rounded border border-[#2A385B]">
                <button
                  type="button"
                  onClick={() => setPestañaActiva('editor')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] ${
                    pestañaActiva === 'editor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPestañaActiva('previa')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] ${
                    pestañaActiva === 'previa' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Vista Previa</span>
                </button>
              </div>
            </div>

            {pestañaActiva === 'editor' ? (
              <textarea
                rows={8}
                required
                value={formData.contenido_markdown}
                onChange={(e) => setFormData({ ...formData, contenido_markdown: e.target.value })}
                placeholder="Escribe en Markdown: ## Encabezado, - Lista, `codigo`..."
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
              />
            ) : (
              <div 
                className="w-full h-48 overflow-y-auto px-4 py-3 bg-[#0A101D] border border-[#2A385B] rounded-lg text-xs newsletter-markdown-body"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Temas Clave (separados por coma)</label>
            <input
              type="text"
              value={formData.temas_clave}
              onChange={(e) => setFormData({ ...formData, temas_clave: e.target.value })}
              placeholder="Spanner, FinOps, Gemini, VPC"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#2A385B] mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#18223D] hover:bg-[#1E2942] text-sm text-slate-300 border border-[#2A385B]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white shadow-md shadow-purple-500/30"
            >
              <Save className="w-4 h-4" />
              <span>{newsletterEditar ? 'Guardar Cambios en Storage' : 'Publicar .md en Cloud Storage'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
