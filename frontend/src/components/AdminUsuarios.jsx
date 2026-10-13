// Componente de Administracion de Usuarios, Asignacion de Roles, Habilitacion y Eliminacion
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getUsuarios, 
  updateRolUsuario, 
  updateEstadoUsuario, 
  deleteUsuario 
} from '../services/api';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Mail, 
  Building, 
  Search, 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Power,
  RotateCcw
} from 'lucide-react';

export const AdminUsuarios = () => {
  const { currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'activos', 'deshabilitados'
  const [mensaje, setMensaje] = useState(null);
  
  // Estado para el modal de confirmacion de eliminacion
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  // Carga la lista completa de miembros desde Firestore
  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      mostrarMensaje('error', 'No se pudo cargar la lista de usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Muestra notificaciones temporales de feedback
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4500);
  };

  // Maneja el cambio de rol entre miembro y administrador
  const handleCambiarRol = async (uid, nuevoRol) => {
    setProcesandoAccion(true);
    try {
      await updateRolUsuario(uid, nuevoRol);
      mostrarMensaje('exito', `Rol actualizado correctamente a ${nuevoRol}.`);
      await cargarUsuarios();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'No se pudo actualizar el rol del usuario.';
      mostrarMensaje('error', errorMsg);
    } finally {
      setProcesandoAccion(false);
    }
  };

  // Maneja la deshabilitacion o rehabilitacion de un usuario
  const handleCambiarEstado = async (usuario, nuevoEstado) => {
    // Validacion previa: impedir que el admin se deshabilite a si mismo
    if (usuario.uid === currentUser?.uid && !nuevoEstado) {
      mostrarMensaje('error', 'No puedes deshabilitar tu propia cuenta de administrador.');
      return;
    }

    setProcesandoAccion(true);
    try {
      await updateEstadoUsuario(usuario.uid, nuevoEstado);
      const accionTexto = nuevoEstado ? 'habilitado' : 'deshabilitado';
      mostrarMensaje('exito', `El usuario ${usuario.nombre} fue ${accionTexto} exitosamente.`);
      await cargarUsuarios();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al modificar el estado del usuario.';
      mostrarMensaje('error', errorMsg);
    } finally {
      setProcesandoAccion(false);
    }
  };

  // Ejecuta la eliminacion definitiva del usuario seleccionado
  const handleConfirmarEliminar = async () => {
    if (!usuarioAEliminar) return;

    if (usuarioAEliminar.uid === currentUser?.uid) {
      mostrarMensaje('error', 'No puedes eliminar tu propia cuenta de administrador.');
      setUsuarioAEliminar(null);
      return;
    }

    setProcesandoAccion(true);
    try {
      await deleteUsuario(usuarioAEliminar.uid);
      mostrarMensaje('exito', `Usuario ${usuarioAEliminar.nombre} (${usuarioAEliminar.email}) eliminado definitivamente.`);
      setUsuarioAEliminar(null);
      await cargarUsuarios();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al eliminar el usuario.';
      mostrarMensaje('error', errorMsg);
    } finally {
      setProcesandoAccion(false);
    }
  };

  // Filtra los miembros segun termino de busqueda y estado seleccionado
  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase().trim();
    const coincideTexto = 
      (u.nombre && u.nombre.toLowerCase().includes(q)) ||
      (u.apellido && u.apellido.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.empresa && u.empresa.toLowerCase().includes(q));

    const estaActivo = u.activo !== false;
    const coincideEstado = 
      filtroEstado === 'todos' ||
      (filtroEstado === 'activos' && estaActivo) ||
      (filtroEstado === 'deshabilitados' && !estaActivo);

    return coincideTexto && coincideEstado;
  });

  return (
    <div className="space-y-6">
      
      {/* Encabezado y Barra de Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#18223D] border border-[#2A385B] p-5 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Gestión de Usuarios de la Comunidad</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Supervisa miembros, cambia roles, deshabilita accesos o elimina cuentas de la plataforma.
          </p>
        </div>

        {/* Buscador y Selector de Filtro de Estado */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Selector de filtro por estado */}
          <div className="w-full sm:w-auto flex items-center space-x-1.5 bg-[#131D35] border border-[#2A385B] rounded-lg p-1 text-xs">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filtroEstado === 'todos' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({usuarios.length})
            </button>
            <button
              onClick={() => setFiltroEstado('activos')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filtroEstado === 'activos' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFiltroEstado('deshabilitados')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filtroEstado === 'deshabilitados' 
                  ? 'bg-red-600/80 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Deshabilitados
            </button>
          </div>

          {/* Campo de busqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email o empresa..."
              className="w-full pl-9 pr-3 py-2 bg-[#131D35] border border-[#2A385B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Alerta de feedback */}
      {mensaje && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          mensaje.tipo === 'exito' 
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
            : 'bg-red-950/60 border-red-500/50 text-red-300'
        }`}>
          <div className="flex items-center space-x-2">
            {mensaje.tipo === 'exito' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{mensaje.texto}</span>
          </div>
          <button 
            onClick={() => setMensaje(null)} 
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabla de Miembros */}
      <div className="bg-[#18223D] border border-[#2A385B] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#131D35] text-slate-400 border-b border-[#2A385B] font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Empresa / Rol Profesional</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Rol en Portal</th>
                <th className="py-3.5 px-4">Último Acceso</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A385B]">
              {cargando ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando usuarios desde Cloud Firestore...</span>
                    </div>
                  </td>
                </tr>
              ) : usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((u) => {
                  const esAdmin = u.rol === 'admin';
                  const estaActivo = u.activo !== false;
                  const esUsuarioActual = u.uid === currentUser?.uid;

                  return (
                    <tr 
                      key={u.uid} 
                      className={`transition-colors ${
                        !estaActivo 
                          ? 'bg-red-950/15 hover:bg-red-950/25 opacity-80' 
                          : 'hover:bg-[#1E2942]/60'
                      }`}
                    >
                      {/* Columna Usuario */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre || u.email)}&background=0E172A&color=4285F4`}
                            alt={u.nombre}
                            className={`w-9 h-9 rounded-full border object-cover ${
                              estaActivo ? 'border-blue-500/40' : 'border-red-500/40 grayscale'
                            }`}
                          />
                          <div>
                            <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                              <span>{u.nombre} {u.apellido || ''}</span>
                              {esUsuarioActual && (
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-[180px] sm:max-w-none">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna Empresa y Rol Profesional */}
                      <td className="py-3.5 px-4">
                        <div className="text-blue-300 font-semibold flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{u.empresa || 'Empresa Externa'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {u.rol_profesional || 'Cloud Specialist'}
                        </div>
                      </td>

                      {/* Columna Estado (Activo / Deshabilitado) */}
                      <td className="py-3.5 px-4">
                        {estaActivo ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Activo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/40">
                            <UserX className="w-3.5 h-3.5 text-red-400" />
                            <span>Deshabilitado</span>
                          </span>
                        )}
                      </td>

                      {/* Columna Rol en Portal */}
                      <td className="py-3.5 px-4">
                        {esAdmin ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Administrador</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            <span>Miembro</span>
                          </span>
                        )}
                      </td>

                      {/* Columna Ultimo Acceso */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleDateString('es-ES') : 'Reciente'}
                      </td>

                      {/* Columna Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          
                          {/* Selector de Rol */}
                          <select
                            value={u.rol}
                            disabled={procesandoAccion || esUsuarioActual}
                            onChange={(e) => handleCambiarRol(u.uid, e.target.value)}
                            title={esUsuarioActual ? 'No puedes cambiar tu propio rol' : 'Modificar rol del usuario'}
                            className={`bg-[#131D35] border border-[#2A385B] text-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-medium ${
                              esUsuarioActual ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-500'
                            }`}
                          >
                            <option value="miembro">Miembro</option>
                            <option value="admin">Administrador</option>
                          </select>

                          {/* Boton para Deshabilitar / Habilitar */}
                          {estaActivo ? (
                            <button
                              onClick={() => handleCambiarEstado(u, false)}
                              disabled={procesandoAccion || esUsuarioActual}
                              title={esUsuarioActual ? 'No puedes deshabilitar tu propia cuenta' : 'Deshabilitar acceso al usuario'}
                              className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1 text-xs font-medium ${
                                esUsuarioActual
                                  ? 'opacity-40 cursor-not-allowed border-slate-700 text-slate-500'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Deshabilitar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCambiarEstado(u, true)}
                              disabled={procesandoAccion}
                              title="Reactivar cuenta de usuario"
                              className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all flex items-center space-x-1 text-xs font-medium"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">Habilitar</span>
                            </button>
                          )}

                          {/* Boton para Eliminar Usuario */}
                          <button
                            onClick={() => setUsuarioAEliminar(u)}
                            disabled={procesandoAccion || esUsuarioActual}
                            title={esUsuarioActual ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario permanentemente'}
                            className={`p-1.5 rounded-lg border transition-all ${
                              esUsuarioActual
                                ? 'opacity-40 cursor-not-allowed border-slate-700 text-slate-500'
                                : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    No se encontraron miembros coincidentes con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmacion para Eliminar Usuario */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-md bg-[#111A2E] border border-red-500/40 rounded-2xl shadow-2xl p-6 overflow-hidden text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div className="flex items-start space-x-3 pb-4 border-b border-[#2A385B]">
              <div className="p-2.5 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  ¿Eliminar usuario definitivamente?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta acción es irreversible y eliminará el perfil de la base de datos.
                </p>
              </div>
              <button
                onClick={() => setUsuarioAEliminar(null)}
                disabled={procesandoAccion}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha de datos del usuario a eliminar */}
            <div className="my-5 p-3.5 bg-[#18223D] border border-[#2A385B] rounded-xl flex items-center space-x-3">
              <img
                src={usuarioAEliminar.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioAEliminar.nombre || usuarioAEliminar.email)}&background=0E172A&color=4285F4`}
                alt={usuarioAEliminar.nombre}
                className="w-10 h-10 rounded-full border border-red-400/30 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate">
                  {usuarioAEliminar.nombre} {usuarioAEliminar.apellido || ''}
                </div>
                <div className="text-xs text-slate-400 font-mono truncate">
                  {usuarioAEliminar.email}
                </div>
                <div className="text-[11px] text-blue-300 mt-0.5">
                  {usuarioAEliminar.empresa || 'Empresa Externa'} · {usuarioAEliminar.rol === 'admin' ? 'Administrador' : 'Miembro'}
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300 leading-relaxed mb-6">
              ⚠️ <strong>Advertencia:</strong> Al confirmar, se eliminará el registro de este miembro en Cloud Firestore y se cancelará su acceso en Firebase Authentication.
            </div>

            {/* Botones de accion del modal */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setUsuarioAEliminar(null)}
                disabled={procesandoAccion}
                className="px-4 py-2 bg-[#18223D] hover:bg-[#202C4D] text-slate-300 text-xs font-semibold rounded-xl border border-[#2A385B] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={procesandoAccion}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center space-x-2"
              >
                {procesandoAccion ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, eliminar definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsuarios;
