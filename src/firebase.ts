import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore, FirestoreSettings, setLogLevel } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import appletConfig from "../firebase-applet-config.json";

// Silence internal connection retry/timeout logs in sandboxed preview environments
try {
  setLogLevel("debug");
} catch {
  // Ignore
}

interface CustomFirestoreSettings extends FirestoreSettings {
  useFetchStreams?: boolean;
}

// Sanitize function to strip any literal quotes and trailing commas from environment variables
const sanitize = (val: unknown): string => {
  if (typeof val !== "string") return "";
  let s = val.trim();
  s = s.replace(/^['"]+/, "");
  s = s.replace(/['",]+$/, "");
  return s.trim();
};

// Safely resolve env vars across Vite and Node runtimes
const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : (process.env as any) || {};

// Helper to extract the best valid configuration value, rejecting mock placeholders
const getBestConfigValue = (envVal: unknown, configVal: unknown, fallback: string): string => {
  const envClean = sanitize(envVal);
  const configClean = sanitize(configVal);

  const isValidKey = (k: string) =>
    !!k &&
    k !== "YOUR_API_KEY" &&
    !k.includes("Mock") &&
    !k.includes("Enterprise_Key_Mock") &&
    !k.startsWith("remixed-") &&
    !k.startsWith("YOUR_");

  if (isValidKey(configClean)) return configClean;
  if (isValidKey(envClean)) return envClean;
  return fallback;
};

// Support fully dynamic Firebase initialization falling back to the configured project properties
const firebaseConfig = {
  apiKey: getBestConfigValue(env.VITE_FIREBASE_API_KEY, (appletConfig as any).apiKey, "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM"),
  authDomain: getBestConfigValue(env.VITE_FIREBASE_AUTH_DOMAIN, (appletConfig as any).authDomain, "urjaflux-ai-os.firebaseapp.com"),
  projectId: getBestConfigValue(env.VITE_FIREBASE_PROJECT_ID, (appletConfig as any).projectId, "urjaflux-ai-os"),
  storageBucket: getBestConfigValue(env.VITE_FIREBASE_STORAGE_BUCKET, (appletConfig as any).storageBucket, "urjaflux-ai-os.firebasestorage.app"),
  messagingSenderId: getBestConfigValue(env.VITE_FIREBASE_MESSAGING_SENDER_ID, (appletConfig as any).messagingSenderId, "407931415113"),
  appId: getBestConfigValue(env.VITE_FIREBASE_APP_ID, (appletConfig as any).appId, "1:407931415113:web:25a94382a60aa807192d98"),
  measurementId: getBestConfigValue(env.VITE_FIREBASE_MEASUREMENT_ID, (appletConfig as any).measurementId, "G-18VF8F7N3D"),
};

// Check if basic real credentials are provided
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !firebaseConfig.apiKey.startsWith("remixed-") &&
  !firebaseConfig.projectId.startsWith("remixed-") &&
  !firebaseConfig.appId.startsWith("remixed-")
);

let app: any = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let rawDbId = sanitize(
  env.VITE_FIREBASE_DATABASE_ID || 
  (appletConfig as any).databaseId || 
  (appletConfig as any).firestoreDatabaseId || 
  "(default)"
);
if (!rawDbId || rawDbId.startsWith("remixed-") || rawDbId.includes(":")) {
  rawDbId = "(default)";
}
const databaseId = rawDbId;

if (isFirebaseConfigured && typeof window !== "undefined") {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    try {
      const settings = {
        experimentalForceLongPolling: true,
        useFetchStreams: false
      };
      
      if (databaseId && databaseId !== "(default)") {
        db = initializeFirestore(app, settings, databaseId);
      } else {
        db = initializeFirestore(app, settings);
      }
    } catch (initErr) {
      console.warn("[FIRESTORE INITIALIZATION] initializeFirestore failed, falling back to getFirestore(app):", initErr);
      db = getFirestore(app);
    }

    storage = getStorage(app);

  } catch (error) {
    console.error("[URJAFLUX AI OS] Failed to initialize Firebase/Firestore/Storage:", error);
  }
} else {
  console.warn(
    "[URJAFLUX AI OS] Firebase environment variables are missing. Running in local fallback mode. Please configure VITE_FIREBASE_* in your environment settings for Cloud syncing."
  );
}

export { app, db, storage, isFirebaseConfigured, firebaseConfig, databaseId };

