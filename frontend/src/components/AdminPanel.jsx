// Panel de Control Centralizado para Administradores de la Comunidad GCP
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminUsuarios } from './AdminUsuarios';
import { 
  ShieldCheck, 
  Users, 
  Video, 
  Newspaper, 
  FileText, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Calendar,
  Sparkles,
  Cloud,
  Play
} from 'lucide-react';

export const AdminPanel = ({
  charlas = [],
  noticias = [],
  newsletters = [],
  eventos = [],
  onOpenModalCharla,
  onOpenModalNoticia,
  onOpenModalNewsletter,
  onOpenModalEvento,
  onEditCharla,
  onEditNoticia,
  onEditNewsletter,
  onEditEvento,
  onDeleteCharla,
  onDeleteNoticia,
  onDeleteNewsletter,
  onDeleteEvento,
  onVerGrabacion
}) => {
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState('usuarios');

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Encabezado del Panel de Administración */}
      <div className="bg-gradient-to-r from-[#18223D] via-[#1E2942] to-[#18223D] border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Consola de Administración Oficial
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Grupo Administradores
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Bienvenido, <span className="text-amber-400 font-semibold">{currentUser?.displayName || currentUser?.nombre || 'Administrador'}</span>. Acceso habilitado para ver usuarios y gestionar todos los contenidos de la comunidad.
              </p>
            </div>
          </div>

          {/* Accesos rápidos para crear contenido */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenModalCharla()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Charla</span>
            </button>
            <button
              onClick={() => onOpenModalNoticia()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Noticia</span>
            </button>
            <button
              onClick={() => onOpenModalNewsletter()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Newsletter</span>
            </button>
            <button
              onClick={() => onOpenModalEvento()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Evento</span>
            </button>
          </div>
        </div>

        {/* Resumen de contadores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#2A385B]">
          <div className="bg-[#131D35]/80 border border-[#2A385B] rounded-xl p-3 flex items-center space-x-3">
            <Video className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-white leading-none">{charlas.length}</div>
              <div className="text-[11px] text-slate-400">Charlas Registradas</div>
            </div>
          </div>
          <div className="bg-[#131D35]/80 border border-[#2A385B] rounded-xl p-3 flex items-center space-x-3">
            <Newspaper className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-lg font-bold text-white leading-none">{noticias.length}</div>
              <div className="text-[11px] text-slate-400">Noticias Publicadas</div>
            </div>
          </div>
          <div className="bg-[#131D35]/80 border border-[#2A385B] rounded-xl p-3 flex items-center space-x-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-lg font-bold text-white leading-none">{newsletters.length}</div>
              <div className="text-[11px] text-slate-400">Ediciones Newsletter</div>
            </div>
          </div>
          <div className="bg-[#131D35]/80 border border-[#2A385B] rounded-xl p-3 flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-lg font-bold text-white leading-none">{eventos.length}</div>
              <div className="text-[11px] text-slate-400">Eventos Presenciales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Sub-pestañas de Gestión */}
      <div className="flex border-b border-[#2A385B] space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSubTab('usuarios')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 ${
            subTab === 'usuarios'
              ? 'border-amber-400 text-amber-300 bg-[#18223D]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-[#18223D]/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>a) Usuarios Registrados</span>
        </button>

        <button
          onClick={() => setSubTab('charlas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 ${
            subTab === 'charlas'
              ? 'border-blue-400 text-blue-300 bg-[#18223D]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-[#18223D]/50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>b) Gestionar Charlas ({charlas.length})</span>
        </button>

        <button
          onClick={() => setSubTab('noticias')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 ${
            subTab === 'noticias'
              ? 'border-emerald-400 text-emerald-300 bg-[#18223D]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-[#18223D]/50'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>b) Gestionar Noticias ({noticias.length})</span>
        </button>

        <button
          onClick={() => setSubTab('newsletters')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 ${
            subTab === 'newsletters'
              ? 'border-purple-400 text-purple-300 bg-[#18223D]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-[#18223D]/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>b) Gestionar Newsletters ({newsletters.length})</span>
        </button>

        <button
          onClick={() => setSubTab('eventos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold transition-all border-b-2 ${
            subTab === 'eventos'
              ? 'border-rose-400 text-rose-300 bg-[#18223D]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-[#18223D]/50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>b) Gestionar Eventos ({eventos.length})</span>
        </button>
      </div>

      {/* Contenido de la Sub-Pestaña Activa */}
      <div className="pt-2">
        {/* SUBTAB 1: USUARIOS REGISTRADOS */}
        {subTab === 'usuarios' && (
          <div className="space-y-4">
            <AdminUsuarios />
          </div>
        )}

        {/* SUBTAB 2: GESTION DE CHARLAS */}
        {subTab === 'charlas' && (
          <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span>Listado de Charlas y Grabaciones</span>
                </h3>
                <p className="text-xs text-slate-400">Carga nuevas charlas técnicas, actualiza enlaces de Meet o videos de YouTube.</p>
              </div>
              <button
                onClick={() => onOpenModalCharla()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Charla</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131D35] text-slate-400 border-b border-[#2A385B] font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Título / Orador</th>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Enlace Meet / Video</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A385B]">
                  {charlas.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1E2942]/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{c.titulo}</div>
                        <div className="text-[11px] text-slate-400">{c.ponente || c.orador || 'Comunidad GCP'}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                        {new Date(c.fecha_hora).toLocaleDateString('es-ES')} {new Date(c.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.estado === 'realizada' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {c.estado === 'realizada' ? 'Realizada' : 'Próxima'}
                          </span>
                          {c.tipo_grabacion === 'gcs' && (
                            <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Alojado en //comunidadgcp/grabaciones/">
                              <Cloud className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-[200px] font-mono">
                        {c.grabacion_archivo || (c.grabacion_url ? c.grabacion_url.split('/').pop() : c.meet_id || 'Sin grabación')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {(c.tiene_grabacion || c.grabacion_url) && (
                            <button
                              onClick={() => onVerGrabacion && onVerGrabacion(c)}
                              className="p-1 rounded bg-[#131D35] text-red-400 hover:text-white hover:bg-red-600/40 transition-colors"
                              title="Reproducir Grabación"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditCharla(c)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                            title="Editar Charla"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCharla(c.id)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Eliminar Charla"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: GESTION DE NOTICIAS */}
        {subTab === 'noticias' && (
          <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Newspaper className="w-4 h-4 text-emerald-400" />
                  <span>Listado de Noticias de Google Cloud</span>
                </h3>
                <p className="text-xs text-slate-400">Publica avisos técnicos, lanzamientos y enlaces oficiales de Google Cloud.</p>
              </div>
              <button
                onClick={() => onOpenModalNoticia()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Noticia</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131D35] text-slate-400 border-b border-[#2A385B] font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Título / Categoría</th>
                    <th className="py-2.5 px-3">Archivo Cloud Storage</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Publicado Por</th>
                    <th className="py-2.5 px-3">Destacada</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A385B]">
                  {noticias.map((n) => (
                    <tr key={n.id} className="hover:bg-[#1E2942]/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{n.titulo}</div>
                        <div className="text-[11px] text-blue-400">{n.categoria}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                          <Cloud className="w-3 h-3 text-cyan-400" />
                          <span>{n.archivo_nombre || `${n.id}.md`}</span>
                        </div>
                        {n.tamano_bytes && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {(n.tamano_bytes / 1024).toFixed(1)} KB
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                        {new Date(n.fecha_publicacion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {n.publicado_por}
                      </td>
                      <td className="py-3 px-3">
                        {n.destacada ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ★ Sí
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">No</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onEditNoticia(n)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                            title="Editar Noticia"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteNoticia(n.id)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Eliminar Noticia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 4: GESTION DE NEWSLETTERS */}
        {subTab === 'newsletters' && (
          <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Listado de Newsletters Periódicos</span>
                </h3>
                <p className="text-xs text-slate-400">Carga ediciones mensuales con sumario y enlaces a documentos PDF.</p>
              </div>
              <button
                onClick={() => onOpenModalNewsletter()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Cargar Newsletter</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131D35] text-slate-400 border-b border-[#2A385B] font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Edición / Título</th>
                    <th className="py-2.5 px-3">Archivo Cloud Storage</th>
                    <th className="py-2.5 px-3">Fecha de Emisión</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A385B]">
                  {newsletters.map((nl) => (
                    <tr key={nl.id} className="hover:bg-[#1E2942]/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">Edición #{nl.numero_edicion}: {nl.titulo}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{nl.resumen}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                          <Cloud className="w-3 h-3 text-cyan-400" />
                          <span>{nl.archivo_nombre || `${nl.id}.md`}</span>
                        </div>
                        {nl.tamano_bytes && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {(nl.tamano_bytes / 1024).toFixed(1)} KB
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                        {new Date(nl.fecha_emision).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onEditNewsletter(nl)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-purple-400 hover:bg-slate-700 transition-colors"
                            title="Editar Newsletter"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteNewsletter(nl.id)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Eliminar Newsletter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 5: GESTION DE EVENTOS */}
        {subTab === 'eventos' && (
          <div className="bg-[#18223D] border border-[#2A385B] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Listado de Eventos Presenciales</span>
                </h3>
                <p className="text-xs text-slate-400">Publica conferencias presenciales, sedes, cupos e inscripciones.</p>
              </div>
              <button
                onClick={() => onOpenModalEvento()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Evento</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131D35] text-slate-400 border-b border-[#2A385B] font-mono uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Título / Sede</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Cupos / Registrados</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A385B]">
                  {eventos.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#1E2942]/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{ev.titulo}</div>
                        <div className="text-[11px] text-slate-400">{ev.lugar_fisico}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                        {new Date(ev.fecha_hora).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                        {ev.cupo_maximo ? `${ev.registrados_count || 0} / ${ev.cupo_maximo}` : 'Ilimitado'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ev.estado === 'abierto' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                        }`}>
                          {ev.estado}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onEditEvento(ev)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                            title="Editar Evento"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEvento(ev.id)}
                            className="p-1 rounded bg-[#131D35] text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Eliminar Evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default AdminPanel;
