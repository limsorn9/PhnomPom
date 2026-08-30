import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore using the provisioned custom databaseId if present
const customDbId = (firebaseConfig as any).firestoreDatabaseId || (firebaseConfig as any).databaseId;
export const db = customDbId
  ? getFirestore(app, customDbId)
  : getFirestore(app);

// Enable offline multi-tab persistence gracefully
try {
  // Temporarily disable persistence to debug write timeouts

} catch (e) {
  // Ignore offline cache errors in sandbox environments
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
