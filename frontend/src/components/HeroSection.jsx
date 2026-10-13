// Componente Hero Section para la presentación pública de la Comunidad GCP
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Cloud, 
  Users, 
  Video, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Terminal,
  Sparkles
} from 'lucide-react';

export const HeroSection = ({ setActiveTab, charlasPendientesCount, eventosCount, onOpenRegister, onOpenLogin }) => {
  const { isRegistered, loginWithGoogle } = useAuth();

  return (
    <div className="relative overflow-hidden pt-8 pb-16">
      {/* Luces de fondo y resplandor estilo Google Cloud Next */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado y Badge de Bienvenida */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18223D] border border-blue-500/30 text-blue-400 text-xs font-mono mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Comunidad de Google Cloud Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Un espacio para{' '}
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
              Compartir Informacion
            </span>{' '}
            sobre como usar la mejor tecnologia.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            Somos una red de arquitectos de soluciones, líderes de ingeniería y especialistas cloud de diversas empresas que diseñan, implementan y operan sobre Google Cloud. Compartimos casos reales, novedades exclusivas de producto, sesiones técnicas y encuentros presenciales.
          </p>

          {/* Botones de Llamada a la Acción (CTA) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            {!isRegistered ? (
              <>
                {/* Botón de Acceso con Cuenta Externa Google vía Firebase */}
                <button
                  onClick={loginWithGoogle}
                  className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 py-3.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-lg shadow-white/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 border border-slate-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Acceder con cuenta Google</span>
                </button>

                {/* Botón de Registro de Miembro */}
                <button
                  onClick={onOpenRegister}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Users className="w-5 h-5" />
                  <span>Registrarme como Miembro</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('charlas')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Ir a Charlas Pendientes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('eventos')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg bg-[#18223D] hover:bg-[#1E2942] text-slate-200 border border-[#2A385B] font-semibold text-sm transition-all"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Ver Proximos Eventos Presenciales</span>
            </button>
          </div>

          {/* Tarjetas de Métricas de la Comunidad */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="bg-[#131D35]/80 border border-[#2A385B] p-4 rounded-xl text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-blue-400 font-mono">Compartir</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">con tus pares</div>
            </div>
            <div className="bg-[#131D35]/80 border border-[#2A385B] p-4 rounded-xl text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-emerald-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Contenido Práctico</div>
            </div>
            <div className="bg-[#131D35]/80 border border-[#2A385B] p-4 rounded-xl text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-amber-400 font-mono">Charlas</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Periodicas</div>
            </div>
            <div className="bg-[#131D35]/80 border border-[#2A385B] p-4 rounded-xl text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-purple-400 font-mono">Novedades</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">sobre como aprender mas</div>
            </div>
          </div>
        </div>

        {/* Pilares y Beneficios para el Miembro */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#18223D]/60 border border-[#2A385B] p-6 rounded-2xl hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Charlas & Google Meet</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sesiones exclusivas sobre GKE Enterprise, Cloud Run, Vertex AI, FinOps y Seguridad. Al registrarte obtienes el enlace directo de Meet y acceso a la biblioteca de grabaciones.
            </p>
          </div>

          <div className="bg-[#18223D]/60 border border-[#2A385B] p-6 rounded-2xl hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Encuentros Presenciales</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Summits periódicos, workshops de arquitectura y networking en oficinas de Google y centros de innovación con los principales referentes técnicos de la región.
            </p>
          </div>

          <div className="bg-[#18223D]/60 border border-[#2A385B] p-6 rounded-2xl hover:border-amber-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Novedades & Foro Técnico</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Boletines mensuales con resumen de novedades, lanzamientos de productos en Google Cloud y un foro para plantear consultas complejas de arquitectura y diseño.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
