// Modal de inicio de sesión de miembros con Firebase Authentication (Google External OAuth y Email)
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const ModalLogin = ({ isOpen, onClose, onOpenRegister }) => {
  const { loginWithGoogle, loginWithEmail, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [modoOlvido, setModoOlvido] = useState(false);

  if (!isOpen) return null;

  // Maneja el inicio de sesión con cuenta externa Google mediante Firebase Authentication
  const handleLoginGoogle = async () => {
    setError(null);
    setCargando(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Inicio de sesión cancelado al cerrar la ventana emergente de Google.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('La ventana emergente fue bloqueada por el navegador. Habilita los popups e inténtalo nuevamente.');
      } else if (err.message && err.message.includes('access_denied')) {
        setError('Acceso denegado por Google.');
      } else {
        setError(err.message || 'Error al iniciar sesión con cuenta Google.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Maneja el inicio de sesión tradicional con correo y contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    if (!email || !password) {
      setError('Por favor ingresa tu correo y tu contraseña.');
      return;
    }

    setCargando(true);
    try {
      await loginWithEmail(email, password);
      onClose();
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password'
      ) {
        setError('El correo o la contraseña son incorrectos. Verifica tus datos o regístrate si aún no eres miembro.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico ingresado no es válido.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Acceso bloqueado temporalmente por demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setError(err.message || 'Ocurrió un error al iniciar sesión con Firebase.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Maneja el restablecimiento de contraseña vía correo de Firebase
  const handleOlvidoPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    if (!email) {
      setError('Por favor escribe tu correo electrónico para enviarte las instrucciones.');
      return;
    }

    setCargando(true);
    try {
      await resetPassword(email);
      setMensajeExito('Te hemos enviado un correo de recuperación con instrucciones para restablecer tu contraseña.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No encontramos ninguna cuenta asociada a este correo electrónico.');
      } else {
        setError('No se pudo enviar el correo de recuperación. Intenta nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#111A2E] border border-[#2A385B] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A385B]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {modoOlvido ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs text-slate-400">
                Portal Oficial Comunidad Google Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificaciones de error y éxito */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-start space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {mensajeExito && (
          <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-start space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Botón Principal: Continuar con Google (External OAuth con Firebase) */}
        {!modoOlvido && (
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={handleLoginGoogle}
              disabled={cargando}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md border border-slate-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{cargando ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#2A385B] w-full"></div>
              <span className="bg-[#111A2E] px-3 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                o ingresar con contraseña
              </span>
              <div className="border-t border-[#2A385B] w-full"></div>
            </div>
          </div>
        )}

        {/* Formulario de Login con Contraseña / Olvido */}
        {!modoOlvido ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo Electrónico (Gmail o corporativo)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.usuario@gmail.com"
                  className="w-full bg-[#18223D] border border-[#2A385B] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => { setModoOlvido(true); setError(null); }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#18223D] border border-[#2A385B] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2"
            >
              <span>Ingresar con contraseña</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleOlvidoPassword} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Ingresa tu correo para recibir el enlace de restablecimiento
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.usuario@gmail.com"
                  className="w-full bg-[#18223D] border border-[#2A385B] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setModoOlvido(false); setError(null); setMensajeExito(null); }}
                className="w-1/2 py-2.5 px-4 bg-[#18223D] hover:bg-[#202C4D] text-slate-300 text-sm font-medium rounded-xl border border-[#2A385B] transition-all"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="w-1/2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                {cargando ? 'Enviando...' : 'Enviar correo'}
              </button>
            </div>
          </form>
        )}

        {/* Pie del modal: Enlace al registro */}
        <div className="mt-6 pt-5 border-t border-[#2A385B] text-center">
          <p className="text-xs text-slate-400">
            ¿Aún no tienes una cuenta de miembro?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenRegister) onOpenRegister();
              }}
              className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors ml-1"
            >
              Registrarme aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalLogin;
