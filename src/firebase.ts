import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

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

// Enable offline multi-tab persistence gracefully
try {
  // Temporarily disable persistence to debug write timeouts

} catch (e) {
  // Ignore offline cache errors in sandbox environments
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
// trigger render deploy Sun Aug 30 02:37:12 AM UTC 2026
