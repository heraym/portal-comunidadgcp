import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Cloud, 
  Video, 
  Newspaper, 
  FileText, 
  MapPin, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu,
  X,
  Lock
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenRegister, onOpenLogin }) => {
  // Estado de autenticacion y control del menu movil
  const { currentUser, isAdmin, isRegistered, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Cloud, publico: true },
    { id: 'charlas', label: 'Charlas & Grabaciones', icon: Video, publico: false },
    { id: 'noticias', label: 'Noticias', icon: Newspaper, publico: false },
    { id: 'newsletters', label: 'Newsletters', icon: FileText, publico: false },
    { id: 'eventos', label: 'Eventos', icon: MapPin, publico: false },
    { id: 'foro', label: 'Preguntas', icon: MessageSquare, publico: false },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Panel Admin', icon: ShieldCheck, highlight: true, publico: false });
  }

  // Intercepta la navegación si el usuario no ha iniciado sesión
  const handleNavClick = (item) => {
    if (!isRegistered && !item.publico) {
      onOpenLogin();
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2A385B] bg-[#0E172A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logotipo y Título de la Comunidad */}
        <div 
          onClick={() => setActiveTab('inicio')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4285F4] to-[#1a73e8] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">
                Comunidad GCP
              </span>
            </div>
          </div>
        </div>

        {/* Enlaces de Navegación de Escritorio */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const esBloqueado = !isRegistered && !item.publico;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                title={esBloqueado ? 'Contenido exclusivo para miembros. Inicia sesión para acceder' : item.label}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                  isActive 
                    ? item.highlight 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                      : 'bg-[#18223D] text-blue-400 border border-[#4285F4]/40 shadow-sm' 
                    : item.highlight
                      ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (item.highlight ? 'text-amber-300' : 'text-blue-400') : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {esBloqueado && (
                  <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Acciones de Autenticación / Perfil de Usuario */}
        <div className="flex items-center space-x-3">
          {isRegistered ? (
            <div className="flex items-center space-x-3">
              {/* Badge de Rol y Empresa */}
              <div className="flex items-center space-x-2 bg-[#18223D] border border-[#2A385B] rounded-full pl-2 pr-3 py-1">
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.nombre || 'Miembro')}&background=18223D&color=4285F4`} 
                  alt={currentUser.displayName || currentUser.nombre}
                  className="w-6 h-6 rounded-full border border-blue-400/40 object-cover" 
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[130px]">
                    {currentUser.displayName || `${currentUser.nombre} ${currentUser.apellido || ''}`}
                  </span>
                  <span className={`text-[10px] font-mono leading-none ${isAdmin ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                    {isAdmin ? '★ Administrador' : (currentUser.empresa ? `${currentUser.empresa}` : 'Miembro GCP')}
                  </span>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Botón de Inicio de Sesión (abre modal con Google y Email) */}
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 bg-[#18223D] hover:bg-[#202C4D] text-slate-200 hover:text-white font-medium text-xs px-3 py-2 rounded-md shadow-sm transition-all border border-[#2A385B]"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Ingresar</span>
              </button>

              {/* Botón Registrarme como Miembro */}
              <button
                onClick={onOpenRegister}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-2 rounded-md shadow-sm transition-all shadow-blue-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrarme</span>
              </button>
            </div>
          )}

          {/* Menú Móvil Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable para Móviles */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#2A385B] space-y-1 px-4 pb-4 bg-[#0E172A]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavClick(item);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-[#18223D] text-blue-400 border border-[#4285F4]/40' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {!isRegistered && !item.publico && (
                  <Lock className="w-3.5 h-3.5 text-amber-400/80" />
                )}
              </button>
            );
          })}

          {!isRegistered && (
            <div className="pt-3 border-t border-[#2A385B] flex flex-col space-y-2">
              {/* Botón de Inicio de Sesión para móviles (abre modal general) */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#18223D] hover:bg-[#202C4D] text-slate-200 font-medium text-xs rounded-lg border border-[#2A385B] shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                <span>Ingresar</span>
              </button>
              {/* Botón de Registro de Miembro para móviles */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrarme como Miembro</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
export default Navbar;
