// Componente de bloqueo visual para secciones exclusivas de miembros de la Comunidad GCP
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, UserPlus, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export const BloqueoAcceso = ({ onOpenLogin, onOpenRegister, onGoHome, seccion = "este contenido" }) => {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="max-w-3xl mx-auto my-12 bg-[#18223D] border border-[#2A385B] rounded-2xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
      
      {/* Fondo decorativo con degradado */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-44 bg-gradient-to-b from-blue-600/10 to-transparent blur-2xl pointer-events-none" />

      {/* Ícono de Escudo / Candado */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
        <ShieldAlert className="w-8 h-8 text-amber-400" />
      </div>

      {/* Título y Descripción */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
        Contenido Exclusivo para Miembros
      </h2>
      <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
        Para ver y acceder a {seccion} (charlas técnicas, grabaciones de YouTube, newsletters, noticias de productos y eventos presenciales), debes formar parte de la <span className="text-blue-400 font-semibold">Comunidad Oficial de Google Cloud</span>.
      </p>

      {/* Beneficios de Registrarse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left bg-[#131D35] border border-[#2A385B] rounded-xl p-5 mb-8">
        <div className="flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-slate-300">Acceso a Google Meet en vivo y biblioteca de grabaciones</span>
        </div>
        <div className="flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-slate-300">Descarga de Newsletters mensuales en PDF y novedades</span>
        </div>
        <div className="flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-slate-300">Inscripción prioritaria a Summits presenciales y Networking</span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Acceso Rápido con Google */}
        <button
          onClick={loginWithGoogle}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Acceder con mi cuenta Google</span>
        </button>

        {/* Registro de Miembro */}
        <button
          onClick={onOpenRegister}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrarme como Miembro</span>
        </button>

        {/* Volver a Inicio */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-[#131D35] hover:bg-[#1E2942] text-slate-300 font-semibold text-sm px-4 py-3 rounded-xl border border-[#2A385B] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        )}
      </div>

    </div>
  );
};
export default BloqueoAcceso;
