// Contexto de autenticación para gestionar el estado de sesión y registro de miembros con Firebase Authentication
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut, 
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from '../firebase';
import { syncUsuario, registrarMiembro, getMiPerfil } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('visitante'); // 'visitante', 'miembro', 'admin'

  // Escucha cambios de estado en Firebase Authentication
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('comunidad_gcp_token', token);

          const nombresPartes = (firebaseUser.displayName || '').trim().split(' ');
          const primerNombre = nombresPartes[0] || 'Miembro';
          const apellido = nombresPartes.slice(1).join(' ') || '';

          // Sincroniza datos con la colección 'usuarios' de Cloud Firestore
          const perfil = await syncUsuario({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: primerNombre,
            apellido: apellido,
            foto_url: firebaseUser.photoURL
          });

          const usuarioFinal = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: `${perfil.nombre || primerNombre} ${perfil.apellido || apellido}`.trim(),
            nombre: perfil.nombre || primerNombre,
            apellido: perfil.apellido || apellido,
            empresa: perfil.empresa || 'Comunidad GCP',
            rol_profesional: perfil.rol_profesional || 'Cloud Specialist',
            photoURL: firebaseUser.photoURL,
            role: perfil.rol || 'miembro'
          };

          setCurrentUser(usuarioFinal);
          setUserRole(perfil.rol || 'miembro');
        } catch (error) {
          console.error('Error al sincronizar usuario de Firebase:', error);
          // Si el backend responde 403 Forbidden por cuenta deshabilitada, se cierra la sesion
          if (error.response?.status === 403) {
            try {
              await firebaseSignOut(auth);
            } catch (e) {
              console.warn('Error al cerrar sesion de cuenta inactiva:', e);
            }
            localStorage.removeItem('comunidad_gcp_token');
            setCurrentUser(null);
            setUserRole('visitante');
            setLoading(false);
            return;
          }

          const nombresPartes = (firebaseUser.displayName || '').trim().split(' ');
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email,
            nombre: nombresPartes[0] || 'Miembro',
            apellido: nombresPartes.slice(1).join(' ') || '',
            empresa: 'Comunidad GCP',
            photoURL: firebaseUser.photoURL,
            role: 'miembro'
          });
          setUserRole('miembro');
        }
      } else {
        // Limpia estado si no hay usuario autenticado en Firebase
        localStorage.removeItem('comunidad_gcp_token');
        localStorage.removeItem('comunidad_gcp_demo_user');
        setCurrentUser(null);
        setUserRole('visitante');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Iniciar sesión con cuenta externa Google mediante Firebase Authentication (External OAuth)
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (!auth || !googleProvider) {
        throw new Error('El servicio de autenticación de Firebase no está disponible.');
      }

      // Abre el selector de cuentas externas de Google mediante el popup de Firebase
      const credencial = await signInWithPopup(auth, googleProvider);
      const firebaseUser = credencial.user;
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('comunidad_gcp_token', token);

      const nombresPartes = (firebaseUser.displayName || '').trim().split(' ');
      const primerNombre = nombresPartes[0] || 'Miembro';
      const apellido = nombresPartes.slice(1).join(' ') || '';

      // Sincroniza el perfil del usuario de Google con Cloud Firestore
      const perfil = await syncUsuario({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        nombre: primerNombre,
        apellido: apellido,
        foto_url: firebaseUser.photoURL
      });

      const usuarioLogueado = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: `${perfil.nombre || primerNombre} ${perfil.apellido || apellido}`.trim(),
        nombre: perfil.nombre || primerNombre,
        apellido: perfil.apellido || apellido,
        empresa: perfil.empresa || 'Comunidad GCP',
        rol_profesional: perfil.rol_profesional || 'Cloud Specialist',
        photoURL: firebaseUser.photoURL,
        role: perfil.rol || 'miembro'
      };

      setCurrentUser(usuarioLogueado);
      setUserRole(usuarioLogueado.role);
      setLoading(false);
      return { success: true, user: usuarioLogueado };
    } catch (error) {
      setLoading(false);
      console.error('Error al iniciar sesión con Google en Firebase Auth:', error);
      // Notificacion si la cuenta fue suspendida o deshabilitada
      if (error.response?.status === 403) {
        try {
          await firebaseSignOut(auth);
        } catch (e) {}
        localStorage.removeItem('comunidad_gcp_token');
        throw new Error(error.response?.data?.detail || 'Tu cuenta ha sido deshabilitada por el administrador.');
      }
      if (error.code === 'auth/user-disabled') {
        throw new Error('Esta cuenta de usuario ha sido deshabilitada por el administrador.');
      }
      throw error;
    }
  };

  // Registrar miembro con cuenta externa Google (obtiene nombre y email de Google y solicita empresa)
  const registerMemberWithGoogle = async ({ empresa, rol_profesional }) => {
    setLoading(true);
    try {
      if (!auth || !googleProvider) {
        throw new Error('El servicio de autenticación de Firebase no está disponible.');
      }

      const credencial = await signInWithPopup(auth, googleProvider);
      const firebaseUser = credencial.user;
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('comunidad_gcp_token', token);

      const nombresPartes = (firebaseUser.displayName || '').trim().split(' ');
      const primerNombre = nombresPartes[0] || 'Miembro';
      const apellido = nombresPartes.slice(1).join(' ') || '';

      // Registra en Firestore con su empresa especificada
      const resultado = await registrarMiembro({
        uid: firebaseUser.uid,
        nombre: primerNombre,
        apellido: apellido,
        email: firebaseUser.email,
        empresa: empresa ? empresa.trim() : 'Comunidad GCP',
        rol_profesional: rol_profesional || 'Cloud Specialist',
        foto_url: firebaseUser.photoURL
      });

      const usuarioRegistrado = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: `${primerNombre} ${apellido}`.trim(),
        nombre: primerNombre,
        apellido: apellido,
        empresa: resultado.empresa || empresa || 'Comunidad GCP',
        rol_profesional: resultado.rol_profesional || rol_profesional,
        photoURL: firebaseUser.photoURL,
        role: resultado.rol || 'miembro'
      };

      setCurrentUser(usuarioRegistrado);
      setUserRole(usuarioRegistrado.role);
      setLoading(false);
      return { success: true, user: usuarioRegistrado };
    } catch (error) {
      setLoading(false);
      console.error('Error al registrar miembro con Google y Firebase:', error);
      throw error;
    }
  };

  // Iniciar sesión con Correo Electrónico y Contraseña mediante Firebase Authentication
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('El servicio de Firebase Authentication no está disponible.');
      }

      const credencial = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const user = credencial.user;
      const token = await user.getIdToken();
      localStorage.setItem('comunidad_gcp_token', token);

      const nombresPartes = (user.displayName || '').trim().split(' ');
      const primerNombre = nombresPartes[0] || 'Miembro';
      const apellido = nombresPartes.slice(1).join(' ') || '';

      const perfil = await syncUsuario({
        uid: user.uid,
        email: user.email,
        nombre: primerNombre,
        apellido: apellido,
        foto_url: user.photoURL
      });

      const usuarioLogueado = {
        uid: user.uid,
        email: user.email,
        displayName: `${perfil.nombre || primerNombre} ${perfil.apellido || apellido}`.trim(),
        nombre: perfil.nombre || primerNombre,
        apellido: perfil.apellido || apellido,
        empresa: perfil.empresa || 'Comunidad GCP',
        rol_profesional: perfil.rol_profesional || 'Cloud Specialist',
        photoURL: user.photoURL,
        role: perfil.rol || 'miembro'
      };

      setCurrentUser(usuarioLogueado);
      setUserRole(usuarioLogueado.role);
      setLoading(false);
      return { success: true, user: usuarioLogueado };
    } catch (error) {
      setLoading(false);
      console.error('Error al iniciar sesión con Firebase Auth:', error);
      // Notificacion si la cuenta fue suspendida o deshabilitada
      if (error.response?.status === 403) {
        try {
          await firebaseSignOut(auth);
        } catch (e) {}
        localStorage.removeItem('comunidad_gcp_token');
        throw new Error(error.response?.data?.detail || 'Tu cuenta ha sido deshabilitada por el administrador.');
      }
      if (error.code === 'auth/user-disabled') {
        throw new Error('Esta cuenta de usuario ha sido deshabilitada por el administrador.');
      }
      throw error;
    }
  };

  // Registrar a un nuevo miembro con correo y contraseña en Firebase Authentication
  const registerMember = async ({ 
    nombre, 
    apellido, 
    email, 
    password, 
    empresa, 
    rol_profesional = 'Cloud Specialist' 
  }) => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('El servicio de Firebase Authentication no está disponible.');
      }

      const emailLimpio = email.trim().toLowerCase();
      const nombreLimpio = nombre.trim();
      const apellidoLimpio = apellido.trim();
      const nombreCompleto = `${nombreLimpio} ${apellidoLimpio}`.trim();

      const credencial = await createUserWithEmailAndPassword(auth, emailLimpio, password);
      const firebaseUser = credencial.user;

      await updateProfile(firebaseUser, {
        displayName: nombreCompleto
      });

      const token = await firebaseUser.getIdToken();
      localStorage.setItem('comunidad_gcp_token', token);

      const resultado = await registrarMiembro({
        uid: firebaseUser.uid,
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        email: emailLimpio,
        empresa: empresa.trim(),
        rol_profesional: rol_profesional || 'Cloud Specialist',
        foto_url: null
      });

      const usuarioRegistrado = {
        uid: firebaseUser.uid,
        email: emailLimpio,
        displayName: nombreCompleto,
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        empresa: resultado.empresa || empresa.trim(),
        rol_profesional: resultado.rol_profesional || rol_profesional,
        photoURL: null,
        role: resultado.rol || 'miembro'
      };

      setCurrentUser(usuarioRegistrado);
      setUserRole(usuarioRegistrado.role);
      setLoading(false);
      return { success: true, user: usuarioRegistrado };
    } catch (error) {
      setLoading(false);
      console.error('Error al registrar miembro con Firebase Authentication:', error);
      throw error;
    }
  };

  // Restablecer contraseña mediante correo de Firebase
  const resetPassword = async (email) => {
    if (!auth) {
      throw new Error('El servicio de Firebase Authentication no está disponible.');
    }
    return sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.warn('Error al cerrar sesión de Firebase:', e);
    }
    localStorage.removeItem('comunidad_gcp_token');
    localStorage.removeItem('comunidad_gcp_demo_user');
    setCurrentUser(null);
    setUserRole('visitante');
  };

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === 'admin',
    isRegistered: Boolean(currentUser),
    loading,
    loginWithGoogle,
    registerMemberWithGoogle,
    loginWithEmail,
    registerMember,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
