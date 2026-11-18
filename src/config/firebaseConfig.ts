/// <reference types="vite/client" />
// ============================================================
// src/config/firebaseConfig.ts
// Public client configuration for optional cloud synchronization
// Per SECURITY.md: Client variables must never hold private secrets
// ============================================================

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY ?? 'AIzaSyDemoAirGuardPublicDummyKey',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ?? 'airguard-ai.firebaseapp.com',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID ?? 'airguard-ai',
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ?? 'airguard-ai.appspot.com',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '100000000000',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID ?? '1:100000000000:web:abcdef123456',
};
