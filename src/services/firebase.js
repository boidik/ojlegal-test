import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  enableIndexedDbPersistence 
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Default configuration check:
// 1. Checks localStorage for dynamic config set via Software Admin UI (No rebuild required!)
// 2. Checks Vite environment variables (VITE_FIREBASE_API_KEY, etc.)
export const getActiveFirebaseConfig = () => {
  try {
    const customConfig = localStorage.getItem("lex_firebase_custom_config");
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read custom Firebase config from localStorage", e);
  }

  // Fallback to Vite env variables
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

export const initFirebase = (configToUse = null) => {
  const config = configToUse || getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { isReady: false, error: "Firebase credentials not yet configured." };
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });

    return { isReady: true, app, auth, db };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { isReady: false, error: error.message };
  }
};

// Auto-run init
const initialInit = initFirebase();

export { app, auth, db, googleProvider };

export const isFirebaseConfigured = () => {
  return Boolean(getActiveFirebaseConfig());
};

// Test custom configuration validity before saving
export const testFirebaseConfig = async (config) => {
  try {
    const testApp = initializeApp(config, "test-connection-" + Date.now());
    const testDb = getFirestore(testApp);
    // Simple query test to verify credentials & network
    const testCol = collection(testDb, "_connection_test");
    await getDocs(query(testCol, limit(1)));
    return { success: true, message: "Connected successfully to Firestore!" };
  } catch (err) {
    return { success: false, message: err.message || "Failed to connect to Firebase." };
  }
};

// Save config from Software Admin UI
export const saveCustomFirebaseConfig = (config) => {
  localStorage.setItem("lex_firebase_custom_config", JSON.stringify(config));
  window.location.reload();
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem("lex_firebase_custom_config");
  window.location.reload();
};
