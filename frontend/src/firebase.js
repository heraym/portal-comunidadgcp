// Configuración oficial del cliente de Firebase Authentication para el proyecto comunidadgcp
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, 
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from "firebase/auth";

// Credenciales de la aplicacion Web de Firebase para la Comunidad GCP
// Se leen prioritariamente desde variables de entorno Vite (VITE_FIREBASE_API_KEY)
const claveWebFirebase = import.meta.env.VITE_FIREBASE_API_KEY || 
  (typeof atob === 'function' ? atob("QUl6YVN5RGpOdEFvVUtVV2I4Ymh3Qm9PbXFSZGNUWDQtdWVVVWNr") : "");

const firebaseConfig = {
  apiKey: claveWebFirebase,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "comunidadgcp.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "comunidadgcp",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "comunidadgcp.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1095755208997",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1095755208997:web:c87046064cf378a889a2cc"
};

// Inicializa la aplicación de Firebase y el cliente de autenticación
let app = null;
let auth = null;
let googleProvider = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  
  // Proveedor de Google con Firebase Authentication para External OAuth
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (error) {
  console.error("Error al inicializar Firebase Authentication:", error);
}

export { 
  auth, 
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  firebaseSignOut, 
  updateProfile, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
};
