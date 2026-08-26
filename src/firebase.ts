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
  ? initializeFirestore(app, {}, customDbId)
  : getFirestore(app);

// Enable offline multi-tab persistence gracefully
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.');
    }
  });
} catch (e) {
  // Ignore offline cache errors in sandbox environments
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
