// Modal para que el Administrador cree o edite un Evento Presencial
import React, { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';

export const ModalEvento = ({ isOpen, onClose, onSave, eventoEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_hora: '',
    lugar: '',
    link_registro: '',
    cupos: 100,
    estado: 'abierto',
    tags: 'Presencial, Networking, Arquitectura'
  });

  useEffect(() => {
    if (eventoEditar) {
      setFormData({
        nombre: eventoEditar.nombre || '',
        descripcion: eventoEditar.descripcion || '',
        fecha_hora: eventoEditar.fecha_hora ? eventoEditar.fecha_hora.slice(0, 16) : '',
        lugar: eventoEditar.lugar || '',
        link_registro: eventoEditar.link_registro || '',
        cupos: eventoEditar.cupos || 100,
        estado: eventoEditar.estado || 'abierto',
        tags: eventoEditar.tags ? eventoEditar.tags.join(', ') : ''
      });
    } else {
      const proximoMes = new Date();
      proximoMes.setDate(proximoMes.getDate() + 25);
      proximoMes.setHours(18, 0, 0, 0);

      setFormData({
        nombre: '',
        descripcion: '',
        fecha_hora: proximoMes.toISOString().slice(0, 16),
        lugar: 'Auditorio Google Latam Hub',
        link_registro: 'https://forms.gle/...',
        cupos: 120,
        estado: 'abierto',
        tags: 'Presencial, Networking, Workshop'
      });
    }
  }, [eventoEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      cupos: parseInt(formData.cupos, 10),
      fecha_hora: new Date(formData.fecha_hora).toISOString(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0E172A] border border-[#2A385B] rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-[#2A385B] mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {eventoEditar ? 'Editar Evento Presencial' : 'Nuevo Evento Presencial'}
              </h3>
              <p className="text-xs text-slate-400">Summits, talleres en persona y networking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Evento *</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: GCP Architecture Summit Presencial 2026"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lugar Físico / Sede *</label>
            <input
              type="text"
              required
              value={formData.lugar}
              onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
              placeholder="Ej: Auditorio Google Argentina - Av. Corrientes 300, Piso 5"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha y Hora *</label>
              <input
                type="datetime-local"
                required
                value={formData.fecha_hora}
                onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cupos Estimados</label>
              <input
                type="number"
                value={formData.cupos}
                onChange={(e) => setFormData({ ...formData, cupos: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción del Evento</label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Agenda técnica, dinámicas de networking y requisitos de ingreso..."
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Enlace de Registro (Google Forms / Eventbrite) *</label>
            <input
              type="url"
              required
              value={formData.link_registro}
              onChange={(e) => setFormData({ ...formData, link_registro: e.target.value })}
              placeholder="https://forms.gle/evento-presencial-gcp"
              className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="abierto">Inscripciones Abiertas</option>
                <option value="completo">Cupos Completos</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Etiquetas</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Presencial, Summit, Networking"
                className="w-full px-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
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
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-500/30"
            >
              <Save className="w-4 h-4" />
              <span>{eventoEditar ? 'Guardar Cambios' : 'Publicar Evento'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
