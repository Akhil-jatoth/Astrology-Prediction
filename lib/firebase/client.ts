import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function hasValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** True only when all required Firebase client env vars are set. */
export function isFirebaseConfigured(): boolean {
  return (
    hasValue(firebaseConfig.apiKey) &&
    hasValue(firebaseConfig.authDomain) &&
    hasValue(firebaseConfig.projectId) &&
    hasValue(firebaseConfig.appId)
  );
}

function requireFirebase(): { app: FirebaseApp; auth: Auth } {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local'
    );
  }

  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }

  if (!auth) {
    auth = getAuth(app);
  }

  return { app, auth };
}

export function getFirebaseApp(): FirebaseApp {
  return requireFirebase().app;
}

export function getFirebaseAuth(): Auth {
  return requireFirebase().auth;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}

export async function signOut() {
  return firebaseSignOut(getFirebaseAuth());
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export type { User as FirebaseUser };
