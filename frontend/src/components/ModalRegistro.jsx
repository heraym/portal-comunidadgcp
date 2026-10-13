// Modal de registro de nuevos miembros con Firebase Authentication (Google External OAuth y Email)
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  X, 
  Building2, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  Lock
} from 'lucide-react';

export const ModalRegistro = ({ isOpen, onClose, onSuccess, onOpenLogin }) => {
  const { registerMember, registerMemberWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    empresa: '',
    rol_profesional: 'Cloud Architect'
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Registro con cuenta externa Google usando Firebase Authentication (External OAuth)
  const handleRegistroGoogle = async () => {
    setError(null);
    setCargando(true);
    try {
      // Registra usando Firebase Auth con Google y asocia la empresa ingresada o por defecto
      await registerMemberWithGoogle({
        empresa: formData.empresa.trim() || 'Comunidad GCP',
        rol_profesional: formData.rol_profesional || 'Cloud Specialist'
      });

      setExito(true);
      setTimeout(() => {
        setExito(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error en registro con Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Registro cancelado al cerrar la ventana emergente de Google.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('La ventana emergente fue bloqueada por el navegador. Permite las ventanas emergentes para continuar.');
      } else {
        setError(err.message || 'Error al autenticar con Google en Firebase.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Registro tradicional con correo y contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones de campos obligatorios
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa tu nombre.');
      return;
    }
    if (!formData.apellido.trim()) {
      setError('Por favor ingresa tu apellido.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Por favor ingresa tu correo electrónico (Gmail o corporativo).');
      return;
    }
    if (!formData.empresa.trim()) {
      setError('Por favor especifica tu empresa u organización.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('La contraseña debe contener al menos 6 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setCargando(true);
    try {
      await registerMember({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        empresa: formData.empresa,
        rol_profesional: formData.rol_profesional
      });

      setExito(true);
      setTimeout(() => {
        setExito(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error en registro con Firebase:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado. Por favor inicia sesión con tu contraseña.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico ingresado no es válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Error al completar el registro.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0E172A] border border-[#2A385B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Encabezado del Modal con branding GCP */}
        <div className="relative bg-gradient-to-r from-[#18223D] via-[#10182E] to-[#18223D] p-6 border-b border-[#2A385B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Registro de Nuevo Miembro</h2>
                <p className="text-xs text-slate-400">Comunidad Oficial Google Cloud Platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {exito ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">¡Bienvenido a la Comunidad GCP!</h3>
            <p className="text-sm text-slate-300">
              Tu cuenta de <strong>Miembro</strong> ha sido creada exitosamente mediante Firebase Authentication y registrada en Cloud Firestore.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            
            {/* Banner de error */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Opción 1: Registro rápido con cuenta Google externa (OAuth con Firebase) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-200">
                Opción 1: Registro con cuenta Google externa
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Empresa u Organización (Requerido para el perfil de Miembro)
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Ej. Mercado Libre, Globant, Banco, Startup..."
                      className="w-full pl-9 pr-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRegistroGoogle}
                  disabled={cargando}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold py-2.5 px-4 rounded-lg text-xs transition-all shadow-md border border-slate-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{cargando ? 'Conectando con Google...' : 'Registrarme con mi cuenta Google'}</span>
                </button>
              </div>
            </div>

            {/* Separador */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#2A385B] w-full"></div>
              <span className="bg-[#0E172A] px-3 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                o registrarme con correo y contraseña
              </span>
              <div className="border-t border-[#2A385B] w-full"></div>
            </div>

            {/* Opción 2: Formulario tradicional con correo y contraseña */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Fila: Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Martín"
                      className="w-full pl-9 pr-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Apellido <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Ej. Morales"
                      className="w-full pl-9 pr-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Correo Electrónico (Gmail o corporativo) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu.cuenta@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Contraseña y Confirmar Contraseña */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Contraseña (mín. 6 caracteres) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Confirmar Contraseña <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de envío tradicional */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25"
              >
                <UserPlus className="w-4 h-4" />
                <span>{cargando ? 'Registrando...' : 'Registrarme con correo y contraseña'}</span>
              </button>
            </form>

            {/* Enlace al login */}
            <div className="pt-3 border-t border-[#2A385B] text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                ¿Ya eres miembro? Iniciar sesión aquí
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
export default ModalRegistro;
