// Componente Principal de la Aplicación Web Oficial Comunidad GCP
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CardCharla } from './components/CardCharla';
import { ModalCharla } from './components/ModalCharla';
import { CardNoticia } from './components/CardNoticia';
import { ModalNoticia } from './components/ModalNoticia';
import { CardNewsletter } from './components/CardNewsletter';
import { ModalNewsletter } from './components/ModalNewsletter';
import { CardEvento } from './components/CardEvento';
import { ModalEvento } from './components/ModalEvento';
import { ModalRegistro } from './components/ModalRegistro';
import ModalLogin from './components/ModalLogin';
import { ForoComunidad } from './components/ForoComunidad';
import { AdminUsuarios } from './components/AdminUsuarios';
import { Footer } from './components/Footer';

import {
  getCharlas,
  createCharla,
  updateCharla,
  deleteCharla,
  getNoticias,
  createNoticia,
  updateNoticia,
  deleteNoticia,
  getNewsletters,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
  getComentarios,
  createComentario,
  answerComentario
} from './services/api';

import { BloqueoAcceso } from './components/BloqueoAcceso';
import { AdminPanel } from './components/AdminPanel';
import { VisorNewsletterModal } from './components/VisorNewsletterModal';
import { VisorNoticiaModal } from './components/VisorNoticiaModal';
import { VisorGrabacionModal } from './components/VisorGrabacionModal';

import { 
  Video, 
  Newspaper, 
  FileText, 
  MapPin, 
  PlusCircle, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Lock, 
  CheckCircle2
} from 'lucide-react';

function ContenidoPrincipal() {
  const { isAdmin, isRegistered } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');

  // Estados de datos
  const [charlas, setCharlas] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [comentarios, setComentarios] = useState([]);

  // Filtros
  const [filtroCharlas, setFiltroCharlas] = useState('todos'); // 'todos', 'pendiente', 'realizada'
  const [filtroCategoriaNoticia, setFiltroCategoriaNoticia] = useState('todos');

  // Estados para Modales de Administración
  const [modalCharlaOpen, setModalCharlaOpen] = useState(false);
  const [charlaEditar, setCharlaEditar] = useState(null);

  const [modalNoticiaOpen, setModalNoticiaOpen] = useState(false);
  const [noticiaEditar, setNoticiaEditar] = useState(null);
  
  const [modalNewsletterOpen, setModalNewsletterOpen] = useState(false);
  const [newsletterEditar, setNewsletterEditar] = useState(null);

  const [modalEventoOpen, setModalEventoOpen] = useState(false);
  const [eventoEditar, setEventoEditar] = useState(null);

  // Estado para el Visor Modal de Markdown de Newsletters
  const [modalVisorOpen, setModalVisorOpen] = useState(false);
  const [newsletterSeleccionadoVisor, setNewsletterSeleccionadoVisor] = useState(null);

  // Estado para el Visor Modal de Markdown de Noticias
  const [modalVisorNoticiaOpen, setModalVisorNoticiaOpen] = useState(false);
  const [noticiaSeleccionadaVisor, setNoticiaSeleccionadaVisor] = useState(null);

  // Estado para el Visor Modal de Grabaciones de Video (Cloud Storage / YouTube)
  const [modalVisorGrabacionOpen, setModalVisorGrabacionOpen] = useState(false);
  const [charlaSeleccionadaGrabacion, setCharlaSeleccionadaGrabacion] = useState(null);

  const handleAbrirVisorGrabacion = (charla) => {
    setCharlaSeleccionadaGrabacion(charla);
    setModalVisorGrabacionOpen(true);
  };

  // Estado para el Modal de Registro e Inicio de Sesión de Miembros (Firebase Auth)
  const [modalRegistroOpen, setModalRegistroOpen] = useState(false);
  const [modalLoginOpen, setModalLoginOpen] = useState(false);

  // Carga de datos de la plataforma: charlas y eventos públicos o enriquecidos para miembros
  const cargarTodosLosDatos = async () => {
    try {
      const [dataCharlas, dataNoticias, dataNewsletters, dataEventos, dataComentarios] = await Promise.all([
        getCharlas().catch(() => []),
        getNoticias().catch(() => []),
        getNewsletters().catch(() => []),
        getEventos().catch(() => []),
        getComentarios().catch(() => [])
      ]);

      setCharlas(dataCharlas);
      setNoticias(dataNoticias);
      setNewsletters(dataNewsletters);
      setEventos(dataEventos);
      setComentarios(dataComentarios);
    } catch (error) {
      console.error("Error al cargar datos desde el backend:", error);
    }
  };

  useEffect(() => {
    cargarTodosLosDatos();
  }, [isRegistered]);

  // --- Handlers para Charlas ---
  const handleGuardarCharla = async (datos) => {
    try {
      if (charlaEditar) {
        await updateCharla(charlaEditar.id, datos);
      } else {
        await createCharla(datos);
      }
      setModalCharlaOpen(false);
      setCharlaEditar(null);
      const res = await getCharlas();
      setCharlas(res);
    } catch (err) {
      alert("Error al guardar la charla: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEliminarCharla = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta charla?")) {
      await deleteCharla(id);
      const res = await getCharlas();
      setCharlas(res);
    }
  };

  // --- Handlers para Noticias ---
  const handleGuardarNoticia = async (datos, id) => {
    try {
      if (id || noticiaEditar) {
        await updateNoticia(id || noticiaEditar.id, datos);
      } else {
        await createNoticia(datos);
      }
      setModalNoticiaOpen(false);
      setNoticiaEditar(null);
      const res = await getNoticias();
      setNoticias(res);
    } catch (err) {
      alert("Error al guardar la noticia: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEliminarNoticia = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta noticia?")) {
      await deleteNoticia(id);
      const res = await getNoticias();
      setNoticias(res);
    }
  };

  // --- Handlers para Newsletters ---
  const handleGuardarNewsletter = async (datos, id) => {
    try {
      if (id || newsletterEditar) {
        await updateNewsletter(id || newsletterEditar.id, datos);
      } else {
        await createNewsletter(datos);
      }
      setModalNewsletterOpen(false);
      setNewsletterEditar(null);
      const res = await getNewsletters();
      setNewsletters(res);
    } catch (err) {
      alert("Error al guardar el newsletter: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEliminarNewsletter = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este newsletter?")) {
      await deleteNewsletter(id);
      const res = await getNewsletters();
      setNewsletters(res);
    }
  };

  // --- Handlers para Eventos ---
  const handleGuardarEvento = async (datos) => {
    try {
      if (eventoEditar) {
        await updateEvento(eventoEditar.id, datos);
      } else {
        await createEvento(datos);
      }
      setModalEventoOpen(false);
      setEventoEditar(null);
      const res = await getEventos();
      setEventos(res);
    } catch (err) {
      alert("Error al registrar el evento: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEliminarEvento = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este evento presencial?")) {
      await deleteEvento(id);
      const res = await getEventos();
      setEventos(res);
    }
  };

  // --- Handlers para Foro / Preguntas ---
  const handleCrearComentario = async (datos) => {
    try {
      await createComentario(datos);
      const res = await getComentarios();
      setComentarios(res);
    } catch (err) {
      alert("Error al publicar tu pregunta: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleResponderComentario = async (id, contenido) => {
    try {
      await answerComentario(id, contenido);
      const res = await getComentarios();
      setComentarios(res);
    } catch (err) {
      alert("Error al responder: " + (err.response?.data?.detail || err.message));
    }
  };

  // Filtrado de Charlas
  const charlasFiltradas = charlas.filter((c) => {
    if (filtroCharlas === 'todos') return true;
    return c.estado === filtroCharlas;
  });

  const charlasPendientes = charlas.filter((c) => c.estado === 'pendiente');

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1326] text-slate-100">
      
      {/* Barra de Navegación con soporte para inicio de sesión y registro */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenRegister={() => setModalRegistroOpen(true)}
        onOpenLogin={() => setModalLoginOpen(true)}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* VISTA 1: INICIO (LANDING PRINCIPAL) */}
        {activeTab === 'inicio' && (
          <div className="space-y-16 animate-fadeIn">
            {/* Sección Hero para miembros y bienvenida */}
            <HeroSection 
              setActiveTab={setActiveTab} 
              charlasPendientesCount={charlasPendientes.length}
              eventosCount={eventos.length}
              onOpenRegister={() => setModalRegistroOpen(true)}
              onOpenLogin={() => setModalLoginOpen(true)}
            />

            {!isRegistered ? (
              /* Sección Informativa y Bloqueo para Visitantes no Autenticados */
              <div className="bg-[#18223D]/90 border border-[#2A385B] rounded-2xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plataforma Exclusiva de Miembros</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
                  Accede a los contenidos técnicos y eventos de Google Cloud
                </h2>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Para acceder a las sesiones grabadas, descargar newsletters, ver anuncios de GCP y registrarte en Summits presenciales, debes ser miembro de la comunidad oficial.
                </p>

                {/* Pilares de la Comunidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-5xl mx-auto pt-4">
                  <div className="p-4 rounded-xl bg-[#131D35] border border-[#2A385B] flex flex-col justify-between">
                    <div>
                      <Video className="w-6 h-6 text-blue-400 mb-2" />
                      <h4 className="text-xs font-bold text-white mb-1">Charlas Técnicas Periodicas</h4>
                      <p className="text-[11px] text-slate-400">Sesiones en vivo por Google Meet y biblioteca de grabaciones.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#131D35] border border-[#2A385B] flex flex-col justify-between">
                    <div>
                      <Newspaper className="w-6 h-6 text-emerald-400 mb-2" />
                      <h4 className="text-xs font-bold text-white mb-1">Novedades y Lanzamientos</h4>
                      <p className="text-[11px] text-slate-400">Notas técnicas, anuncios de nuevos servicios de GCP y casos reales.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#131D35] border border-[#2A385B] flex flex-col justify-between">
                    <div>
                      <FileText className="w-6 h-6 text-purple-400 mb-2" />
                      <h4 className="text-xs font-bold text-white mb-1">Newsletters Periodicos</h4>
                      <p className="text-[11px] text-slate-400">Novedades de anuncios, blogs y eventos donde aprender nuevas funcionalidades.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#131D35] border border-[#2A385B] flex flex-col justify-between">
                    <div>
                      <MapPin className="w-6 h-6 text-rose-400 mb-2" />
                      <h4 className="text-xs font-bold text-white mb-1">Summits Presenciales</h4>
                      <p className="text-[11px] text-slate-400">Encuentros de networking y sesiones de arquitectura presenciales.</p>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setModalLoginOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Acceder con mi cuenta Google</span>
                  </button>
                  <button
                    onClick={() => setModalRegistroOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Registrarme como Miembro
                  </button>
                </div>
              </div>
            ) : (
              /* Feed Activo para Miembros Autenticados */
              <>
                {/* Bloque: Próximas Charlas Destacadas */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                        <Video className="w-5 h-5 text-blue-400" />
                        <span>Charlas Técnicas en Agenda</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Sesiones en vivo por Google Meet exclusivas para miembros registrados
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('charlas')}
                      className="flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <span>Ver todas ({charlas.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {charlas.slice(0, 3).map((ch) => (
                      <CardCharla
                        key={ch.id}
                        charla={ch}
                        onEdit={(item) => {
                          setCharlaEditar(item);
                          setModalCharlaOpen(true);
                        }}
                        onDelete={handleEliminarCharla}
                        onVerGrabacion={handleAbrirVisorGrabacion}
                      />
                    ))}
                  </div>
                </div>

                {/* Bloque: Noticias Recientes y Edición del Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Noticias Recientes */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
                      <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Newspaper className="w-5 h-5 text-emerald-400" />
                        <span>Novedades Recientes de Google Cloud</span>
                      </h2>
                      <button
                        onClick={() => setActiveTab('noticias')}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                      >
                        <span>Ver más</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {noticias.slice(0, 2).map((noticia) => (
                        <CardNoticia
                          key={noticia.id}
                          noticia={noticia}
                          onEdit={(item) => {
                            setNoticiaEditar(item);
                            setModalNoticiaOpen(true);
                          }}
                          onDelete={handleEliminarNoticia}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Newsletter del Mes */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
                      <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span>Último Newsletter</span>
                      </h2>
                      <button
                        onClick={() => setActiveTab('newsletters')}
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                      >
                        <span>Historial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {newsletters.length > 0 && (
                      <CardNewsletter
                        newsletter={newsletters[0]}
                        onEdit={(item) => {
                          setNewsletterEditar(item);
                          setModalNewsletterOpen(true);
                        }}
                        onDelete={handleEliminarNewsletter}
                      />
                    )}
                  </div>
                </div>

                {/* Bloque: Próximos Summits Presenciales */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2A385B]">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        <span>Eventos Presenciales & Networking</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Conoce a otros ingenieros y arquitectos en vivo en las sedes de Google Cloud
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('eventos')}
                      className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      <span>Ver todos ({eventos.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {eventos.slice(0, 2).map((ev) => (
                      <CardEvento
                        key={ev.id}
                        evento={ev}
                        onEdit={(item) => {
                          setEventoEditar(item);
                          setModalEventoOpen(true);
                        }}
                        onDelete={handleEliminarEvento}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* VISTA 2: CHARLAS & GRABACIONES */}
        {activeTab === 'charlas' && (
          !isRegistered ? (
            <BloqueoAcceso 
              seccion="las Charlas Técnicas y Grabaciones de Google Meet"
              onOpenLogin={() => setModalLoginOpen(true)}
              onOpenRegister={() => setModalRegistroOpen(true)}
              onGoHome={() => setActiveTab('inicio')}
            />
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Encabezado y Filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18223D] border border-[#2A385B] p-4 rounded-xl">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Video className="w-5 h-5 text-blue-400" />
                    <span>Charlas Técnicas Periódicas & Grabaciones</span>
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Accede a las grabaciones de charlas pasadas.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Selector de Filtros */}
                  <div className="flex items-center bg-[#131D35] border border-[#2A385B] rounded-lg p-1 text-xs">
                    <button
                      onClick={() => setFiltroCharlas('todos')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        filtroCharlas === 'todos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Todas ({charlas.length})
                    </button>
                    <button
                      onClick={() => setFiltroCharlas('pendiente')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        filtroCharlas === 'pendiente' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Próximas (Meet)
                    </button>
                    <button
                      onClick={() => setFiltroCharlas('realizada')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        filtroCharlas === 'realizada' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Grabaciones
                    </button>
                  </div>

                  {/* Botón de Creación para Administradores */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setCharlaEditar(null);
                        setModalCharlaOpen(true);
                      }}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Nueva Charla</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cuadrícula de Charlas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {charlasFiltradas.length > 0 ? (
                  charlasFiltradas.map((ch) => (
                    <CardCharla
                      key={ch.id}
                      charla={ch}
                      onEdit={(item) => {
                        setCharlaEditar(item);
                        setModalCharlaOpen(true);
                      }}
                      onDelete={handleEliminarCharla}
                      onVerGrabacion={handleAbrirVisorGrabacion}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-[#18223D] rounded-xl border border-[#2A385B]">
                    <Video className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-300">No se encontraron charlas con este criterio de filtro.</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* VISTA 3: NOTICIAS GENERALES GCP */}
        {activeTab === 'noticias' && (
          !isRegistered ? (
            <BloqueoAcceso 
              seccion="las Noticias Generales y Anuncios de GCP"
              onOpenLogin={() => setModalLoginOpen(true)}
              onOpenRegister={() => setModalRegistroOpen(true)}
              onGoHome={() => setActiveTab('inicio')}
            />
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18223D] border border-[#2A385B] p-4 rounded-xl">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Newspaper className="w-5 h-5 text-emerald-400" />
                    <span>Noticias Generales y Anuncios de Google Cloud</span>
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Actualizaciones oficiales, nuevos lanzamientos y notas de arquitectura seleccionadas.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setNoticiaEditar(null);
                      setModalNoticiaOpen(true);
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publicar Noticia</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {noticias.map((noticia) => (
                  <CardNoticia
                    key={noticia.id}
                    noticia={noticia}
                    onVerCompleto={(item) => {
                      setNoticiaSeleccionadaVisor(item);
                      setModalVisorNoticiaOpen(true);
                    }}
                    onEdit={(item) => {
                      setNoticiaEditar(item);
                      setModalNoticiaOpen(true);
                    }}
                    onDelete={handleEliminarNoticia}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {/* VISTA 4: NEWSLETTERS */}
        {activeTab === 'newsletters' && (
          !isRegistered ? (
            <BloqueoAcceso 
              seccion="las Ediciones y Documentos del Newsletter Oficial"
              onOpenLogin={() => setModalLoginOpen(true)}
              onOpenRegister={() => setModalRegistroOpen(true)}
              onGoHome={() => setActiveTab('inicio')}
            />
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18223D] border border-[#2A385B] p-4 rounded-xl">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>Newsletters Oficiales </span>
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Boletines periódicos con informacion de nuevos releases, blogs y eventos donde aprender nuevas funcionalidades.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setNewsletterEditar(null);
                      setModalNewsletterOpen(true);
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publicar Newsletter</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsletters.map((nl) => (
                  <CardNewsletter
                    key={nl.id}
                    newsletter={nl}
                    onVerCompleto={(item) => {
                      setNewsletterSeleccionadoVisor(item);
                      setModalVisorOpen(true);
                    }}
                    onEdit={(item) => {
                      setNewsletterEditar(item);
                      setModalNewsletterOpen(true);
                    }}
                    onDelete={handleEliminarNewsletter}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {/* VISTA 5: EVENTOS PRESENCIALES */}
        {activeTab === 'eventos' && (
          !isRegistered ? (
            <BloqueoAcceso 
              seccion="los Eventos Presenciales y Summits de la Comunidad"
              onOpenLogin={() => setModalLoginOpen(true)}
              onOpenRegister={() => setModalRegistroOpen(true)}
              onGoHome={() => setActiveTab('inicio')}
            />
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18223D] border border-[#2A385B] p-4 rounded-xl">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span>Eventos Presenciales & Summits</span>
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Encuentros cara a cara en sedes y auditorios con sesiones de arquitectura y dinámicas de networking.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setEventoEditar(null);
                      setModalEventoOpen(true);
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publicar Evento</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventos.map((ev) => (
                  <CardEvento
                    key={ev.id}
                    evento={ev}
                    onEdit={(item) => {
                      setEventoEditar(item);
                      setModalEventoOpen(true);
                    }}
                    onDelete={handleEliminarEvento}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {/* VISTA 6: FORO & PREGUNTAS */}
        {activeTab === 'foro' && (
          !isRegistered ? (
            <BloqueoAcceso 
              seccion="el Foro de Preguntas y Consultas de Arquitectura"
              onOpenLogin={() => setModalLoginOpen(true)}
              onOpenRegister={() => setModalRegistroOpen(true)}
              onGoHome={() => setActiveTab('inicio')}
            />
          ) : (
            <div className="animate-fadeIn">
              <ForoComunidad
                comentarios={comentarios}
                onCrearComentario={handleCrearComentario}
                onResponderComentario={handleResponderComentario}
              />
            </div>
          )
        )}

        {/* VISTA 7: PANEL DE ADMINISTRACION */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            charlas={charlas}
            noticias={noticias}
            newsletters={newsletters}
            eventos={eventos}
            onOpenModalCharla={() => {
              setCharlaEditar(null);
              setModalCharlaOpen(true);
            }}
            onOpenModalNoticia={() => {
              setNoticiaEditar(null);
              setModalNoticiaOpen(true);
            }}
            onOpenModalNewsletter={() => {
              setNewsletterEditar(null);
              setModalNewsletterOpen(true);
            }}
            onOpenModalEvento={() => {
              setEventoEditar(null);
              setModalEventoOpen(true);
            }}
            onEditCharla={(c) => {
              setCharlaEditar(c);
              setModalCharlaOpen(true);
            }}
            onEditNoticia={(n) => {
              setNoticiaEditar(n);
              setModalNoticiaOpen(true);
            }}
            onEditNewsletter={(nl) => {
              setNewsletterEditar(nl);
              setModalNewsletterOpen(true);
            }}
            onEditEvento={(ev) => {
              setEventoEditar(ev);
              setModalEventoOpen(true);
            }}
            onDeleteCharla={handleEliminarCharla}
            onDeleteNoticia={handleEliminarNoticia}
            onDeleteNewsletter={handleEliminarNewsletter}
            onDeleteEvento={handleEliminarEvento}
            onVerGrabacion={handleAbrirVisorGrabacion}
          />
        )}

      </main>

      {/* Pie de Página */}
      <Footer />

      {/* Modales de Administración */}
      <ModalCharla
        isOpen={modalCharlaOpen}
        onClose={() => setModalCharlaOpen(false)}
        onSave={handleGuardarCharla}
        charlaEditar={charlaEditar}
      />

      <ModalNoticia
        isOpen={modalNoticiaOpen}
        onClose={() => {
          setModalNoticiaOpen(false);
          setNoticiaEditar(null);
        }}
        onSave={handleGuardarNoticia}
        noticiaEditar={noticiaEditar}
      />

      <ModalNewsletter
        isOpen={modalNewsletterOpen}
        onClose={() => {
          setModalNewsletterOpen(false);
          setNewsletterEditar(null);
        }}
        onSave={handleGuardarNewsletter}
        newsletterEditar={newsletterEditar}
      />

      {/* Modal para Visualización Completa de Newsletters en Formato Markdown (.md) */}
      <VisorNewsletterModal
        isOpen={modalVisorOpen}
        onClose={() => {
          setModalVisorOpen(false);
          setNewsletterSeleccionadoVisor(null);
        }}
        newsletter={newsletterSeleccionadoVisor}
      />

      {/* Modal para Visualización Completa de Noticias en Formato Markdown (.md) */}
      <VisorNoticiaModal
        isOpen={modalVisorNoticiaOpen}
        onClose={() => {
          setModalVisorNoticiaOpen(false);
          setNoticiaSeleccionadaVisor(null);
        }}
        noticia={noticiaSeleccionadaVisor}
      />

      {/* Modal para Visualización y Reproducción Directa de Grabaciones (Cloud Storage y YouTube) */}
      <VisorGrabacionModal
        isOpen={modalVisorGrabacionOpen}
        onClose={() => {
          setModalVisorGrabacionOpen(false);
          setCharlaSeleccionadaGrabacion(null);
        }}
        charla={charlaSeleccionadaGrabacion}
      />

      <ModalEvento
        isOpen={modalEventoOpen}
        onClose={() => setModalEventoOpen(false)}
        onSave={handleGuardarEvento}
        eventoEditar={eventoEditar}
      />

      {/* Modal de Registro de Nuevo Miembro con Firebase Authentication */}
      <ModalRegistro
        isOpen={modalRegistroOpen}
        onClose={() => setModalRegistroOpen(false)}
        onSuccess={cargarTodosLosDatos}
        onOpenLogin={() => {
          setModalRegistroOpen(false);
          setModalLoginOpen(true);
        }}
      />

      {/* Modal de Inicio de Sesión con Firebase Authentication */}
      <ModalLogin
        isOpen={modalLoginOpen}
        onClose={() => setModalLoginOpen(false)}
        onOpenRegister={() => {
          setModalLoginOpen(false);
          setModalRegistroOpen(true);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ContenidoPrincipal />
    </AuthProvider>
  );
}
