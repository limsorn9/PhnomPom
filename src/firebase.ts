import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Suppress repetitive network backoff warnings in sandbox environments
try {
  setLogLevel('error');
} catch {}

// Initialize Cloud Firestore using the provisioned custom databaseId if present with resilient auto long-polling
const customDbId = (firebaseConfig as any).firestoreDatabaseId || (firebaseConfig as any).databaseId;

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true
    }, customDbId);
  } catch {
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
})();

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;

