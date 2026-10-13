// Modal para que el Administrador publique o edite una Noticia de Google Cloud en formato Markdown (.md)
import React, { useState, useEffect } from 'react';
import { X, Save, Newspaper, Eye, Code, Upload, Cloud } from 'lucide-react';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

export const ModalNoticia = ({ isOpen, onClose, onSave, noticiaEditar = null }) => {
  const [pestana, setPestana] = useState('editor'); // 'editor' | 'preview'
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    contenido_completo: '',
    categoria: 'Compute & Serverless',
    fuente_url: '',
    publicado_por: 'Equipo Editorial GCP',
    destacada: false,
    tags: 'Cloud Run, Vertex AI, Anuncio'
  });

  useEffect(() => {
    if (noticiaEditar) {
      setFormData({
        titulo: noticiaEditar.titulo || '',
        resumen: noticiaEditar.resumen || '',
        contenido_completo: noticiaEditar.contenido_completo || '',
        categoria: noticiaEditar.categoria || 'Compute & Serverless',
        fuente_url: noticiaEditar.fuente_url || '',
        publicado_por: noticiaEditar.publicado_por || 'Equipo Editorial GCP',
        destacada: Boolean(noticiaEditar.destacada),
        tags: Array.isArray(noticiaEditar.tags) ? noticiaEditar.tags.join(', ') : (noticiaEditar.tags || '')
      });
    } else {
      setFormData({
        titulo: '',
        resumen: '',
        contenido_completo: '# Novedades de Google Cloud\n\nDetalles del anuncio técnico, arquitectura y disponibilidad...',
        categoria: 'Compute & Serverless',
        fuente_url: '',
        publicado_por: 'Equipo Editorial GCP',
        destacada: false,
        tags: 'Cloud Run, Vertex AI, Anuncio'
      });
    }
    setPestana('editor');
  }, [noticiaEditar, isOpen]);

  if (!isOpen) return null;

  // Manejar importación de archivo Markdown (.md) desde el explorador local
  const handleImportarArchivoMd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const texto = event.target?.result;
      if (typeof texto === 'string') {
        let contenidoLimpio = texto;
        let tituloDetectado = '';

        // Detectar título en la primera línea con #
        for (const line of texto.split('\n')) {
          const l = line.trim();
          if (l.startsWith('# ')) {
            tituloDetectado = l.replace('# ', '').trim();
            break;
          }
        }

        setFormData(prev => ({
          ...prev,
          titulo: prev.titulo || tituloDetectado || file.name.replace('.md', ''),
          contenido_completo: contenidoLimpio,
          resumen: prev.resumen || contenidoLimpio.slice(0, 180) + '...'
        }));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      fecha_publicacion: noticiaEditar?.fecha_publicacion || new Date().toISOString(),
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags
    }, noticiaEditar?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0E172A] border border-[#2A385B] rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A385B] mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">
                  {noticiaEditar ? 'Editar Noticia GCP' : 'Publicar Noticia GCP'}
                </h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  <Cloud className="w-3 h-3 text-cyan-400" />
                  <span>Cloud Storage .md</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Se guardará y versionará como archivo Markdown en Google Cloud Storage.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Noticia *</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej: Nueva región de Google Cloud inaugurada con soporte GKE"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Categoría y Publicador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="IA & Machine Learning">IA & Machine Learning</option>
                <option value="Compute & Serverless">Compute & Serverless</option>
                <option value="Bases de Datos & Analytics">Bases de Datos & Analytics</option>
                <option value="Networking & Seguridad">Networking & Seguridad</option>
                <option value="FinOps & Arquitectura">FinOps & Arquitectura</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Publicado Por</label>
              <input
                type="text"
                value={formData.publicado_por}
                onChange={(e) => setFormData({ ...formData, publicado_por: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Resumen Corto */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resumen Corto para Tarjetas *</label>
            <textarea
              rows={2}
              required
              value={formData.resumen}
              onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
              placeholder="Breve introducción para mostrar en la vista general..."
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Pestañas del Editor Markdown y Vista Previa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300">
                Contenido del Archivo Markdown (.md)
              </label>

              <div className="flex items-center space-x-2">
                <label className="cursor-pointer flex items-center space-x-1 px-2.5 py-1 rounded bg-[#131D35] hover:bg-slate-700 text-xs text-cyan-300 border border-cyan-800/50 transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Importar .md</span>
                  <input
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    onChange={handleImportarArchivoMd}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center bg-[#131D35] border border-[#2A385B] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setPestana('editor')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      pestana === 'editor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPestana('preview')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      pestana === 'preview' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Vista Previa</span>
                  </button>
                </div>
              </div>
            </div>

            {pestana === 'editor' ? (
              <textarea
                rows={8}
                value={formData.contenido_completo}
                onChange={(e) => setFormData({ ...formData, contenido_completo: e.target.value })}
                placeholder="# Título de la noticia&#10;&#10;Escribe o pega aquí el contenido técnico en sintaxis Markdown..."
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            ) : (
              <div className="p-4 bg-[#070C18] border border-[#2A385B] rounded-lg max-h-56 overflow-y-auto">
                <article
                  className="newsletter-markdown-body text-xs text-slate-200"
                  dangerouslySetInnerHTML={{ __html: marked.parse(formData.contenido_completo || '') }}
                />
              </div>
            )}
          </div>

          {/* Enlace a Fuente Oficial */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Enlace a la Fuente Oficial (URL)</label>
            <input
              type="url"
              value={formData.fuente_url}
              onChange={(e) => setFormData({ ...formData, fuente_url: e.target.value })}
              placeholder="https://cloud.google.com/blog/..."
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Etiquetas (separadas por coma)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Vertex AI, Gemini, BigQuery"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Destacada */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="destacada-noticia"
              checked={formData.destacada}
              onChange={(e) => setFormData({ ...formData, destacada: e.target.checked })}
              className="w-4 h-4 rounded bg-[#131D35] border-[#2A385B] text-blue-600 focus:ring-0"
            />
            <label htmlFor="destacada-noticia" className="text-xs text-slate-300 select-none">
              Marcar como noticia destacada en la página de inicio
            </label>
          </div>

          {/* Botones de acción */}
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
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-md shadow-blue-500/30"
            >
              <Save className="w-4 h-4" />
              <span>{noticiaEditar ? 'Guardar Cambios' : 'Publicar Noticia en Storage'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
