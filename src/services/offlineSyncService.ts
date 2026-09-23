import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { StudentProgressReport, OfflineSyncQueueItem } from '../types';
import { isFirestoreQuotaExhausted, markFirestoreQuotaExhausted } from './firestoreSync';

const DB_NAME = 'PhnomPomOfflineDB';
const DB_VERSION = 1;
const STORE_REPORTS = 'progress_reports';
const STORE_QUEUE = 'sync_queue';

let dbInstance: IDBDatabase | null = null;
let isSyncingInProgress = false;

/**
 * Open or initialize IndexedDB instance
 */
export function initOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store 1: Student Progress Reports
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        const reportStore = db.createObjectStore(STORE_REPORTS, { keyPath: 'id' });
        reportStore.createIndex('studentId', 'studentId', { unique: false });
        reportStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        reportStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Store 2: Generic Sync Queue for mutations
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('collectionName', 'collectionName', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save or update student progress report in IndexedDB
 */
export async function cacheStudentProgressReport(
  reportData: Partial<StudentProgressReport> & { studentId: string; studentCode: string; nameKhmer: string }
): Promise<StudentProgressReport> {
  const db = await initOfflineDB();
  const now = new Date().toISOString();

  const id = reportData.id || `rep_${reportData.studentId}_${Date.now()}`;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const fullReport: StudentProgressReport = {
    id,
    studentId: reportData.studentId,
    studentCode: reportData.studentCode,
    nameKhmer: reportData.nameKhmer,
    grade: reportData.grade || 1,
    section: reportData.section || 'ក',
    academicYear: reportData.academicYear || '២០២៤-២០២៥',
    evaluationPeriod: reportData.evaluationPeriod || 'ប្រចាំខែ',
    averageScore: reportData.averageScore ?? 0,
    totalScore: reportData.totalScore ?? 0,
    rank: reportData.rank ?? 1,
    attendancePercentage: reportData.attendancePercentage ?? 100,
    conduct: reportData.conduct || 'ល្អប្រសើរ',
    readingWritingSkill: reportData.readingWritingSkill || 'ស្ទាត់ជំនាញ',
    mathCalculationSkill: reportData.mathCalculationSkill || 'ពូកែ',
    socialTeamwork: reportData.socialTeamwork || 'រួសរាយសហការ',
    strengths: reportData.strengths || 'ខិតខំរៀនសូត្រ យកចិត្តទុកដាក់ និងគោរពវិន័យ',
    areasForImprovement: reportData.areasForImprovement || 'ពង្រឹងការអានសៀវភៅបន្ថែម',
    teacherRecommendations: reportData.teacherRecommendations || 'បន្តការខិតខំប្រឹងប្រែងដើម្បីរក្សាលទ្ធផលឆ្នើម',
    evaluatedByTeacherName: reportData.evaluatedByTeacherName || 'លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់',
    createdAt: reportData.createdAt || now,
    updatedAt: now,
    syncStatus: isOnline ? 'synced' : 'pending_sync',
    lastSyncedAt: isOnline ? now : reportData.lastSyncedAt
  };

  // 1. Write to IndexedDB
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_REPORTS], 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);
    const putReq = store.put(fullReport);

    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });

  // 2. If online, sync immediately to Firestore
  if (isOnline) {
    try {
      await syncSingleReportToFirestore(fullReport);
      fullReport.syncStatus = 'synced';
      fullReport.lastSyncedAt = new Date().toISOString();
      
      // Update synced status back in IndexedDB
      const tx = db.transaction([STORE_REPORTS], 'readwrite');
      tx.objectStore(STORE_REPORTS).put(fullReport);
    } catch (err) {
      console.warn('Online sync failed, keeping as pending_sync:', err);
      fullReport.syncStatus = 'pending_sync';
      const tx = db.transaction([STORE_REPORTS], 'readwrite');
      tx.objectStore(STORE_REPORTS).put(fullReport);
    }
  }

  notifySyncStatusChange();
  return fullReport;
}

/**
 * Get all cached progress reports from IndexedDB
 */
export async function getCachedProgressReports(): Promise<StudentProgressReport[]> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_REPORTS], 'readonly');
    const store = tx.objectStore(STORE_REPORTS);
    const getAllReq = store.getAll();

    getAllReq.onsuccess = () => {
      resolve(getAllReq.result || []);
    };
    getAllReq.onerror = () => reject(getAllReq.error);
  });
}

/**
 * Get progress reports for a specific student
 */
export async function getCachedProgressReportsByStudent(studentId: string): Promise<StudentProgressReport[]> {
  const all = await getCachedProgressReports();
  return all.filter(r => r.studentId === studentId);
}

/**
 * Get pending sync count
 */
export async function getPendingReportsCount(): Promise<number> {
  const all = await getCachedProgressReports();
  return all.filter(r => r.syncStatus === 'pending_sync').length;
}

/**
 * Sync single report to Firestore doc
 */
async function syncSingleReportToFirestore(report: StudentProgressReport): Promise<void> {
  if (!db || isFirestoreQuotaExhausted()) return;
  try {
    const reportDocRef = doc(db, 'student_progress_reports', report.id);
    await setDoc(reportDocRef, {
      ...report,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.toLowerCase().includes('quota')) {
      markFirestoreQuotaExhausted(60);
    }
    throw err;
  }
}

/**
 * Sync all pending reports to Firestore
 */
export async function syncPendingReportsToFirestore(): Promise<{
  syncedCount: number;
  errorCount: number;
}> {
  if (isSyncingInProgress || isFirestoreQuotaExhausted()) {
    return { syncedCount: 0, errorCount: 0 };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { syncedCount: 0, errorCount: 0 };
  }

  isSyncingInProgress = true;
  let syncedCount = 0;
  let errorCount = 0;

  try {
    const dbInstance = await initOfflineDB();
    const allReports = await getCachedProgressReports();
    const pendingReports = allReports.filter(r => r.syncStatus === 'pending_sync');

    for (const report of pendingReports) {
      if (isFirestoreQuotaExhausted()) {
        break;
      }
      try {
        await syncSingleReportToFirestore(report);
        
        // Update IndexedDB record
        const updatedReport: StudentProgressReport = {
          ...report,
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString()
        };

        await new Promise<void>((resolve, reject) => {
          const tx = dbInstance.transaction([STORE_REPORTS], 'readwrite');
          const req = tx.objectStore(STORE_REPORTS).put(updatedReport);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });

        syncedCount++;
      } catch (err: any) {
        if (err?.code === 'resource-exhausted' || err?.message?.toLowerCase().includes('quota')) {
          markFirestoreQuotaExhausted(30);
          console.warn('[OfflineSync] Daily Firestore write quota reached. Keeping reports safely in IndexedDB.');
          break;
        }
        console.warn(`[OfflineSync] Notice syncing report ${report.id}:`, err?.message || err);
        errorCount++;
      }
    }

    if (syncedCount > 0) {
      console.log(`[OfflineSync] Synced ${syncedCount} student progress reports to Firestore.`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('offline-sync-success', {
            detail: { syncedCount, timestamp: new Date().toISOString() }
          })
        );
      }
    }
  } catch (err) {
    console.error('[OfflineSync] Overall sync error:', err);
  } finally {
    isSyncingInProgress = false;
    notifySyncStatusChange();
  }

  return { syncedCount, errorCount };
}

/**
 * Broadcast event to UI
 */
function notifySyncStatusChange() {
  if (typeof window === 'undefined') return;
  getPendingReportsCount().then(pendingCount => {
    window.dispatchEvent(
      new CustomEvent('offline-sync-status-change', {
        detail: {
          isOnline: navigator.onLine,
          pendingCount,
          timestamp: new Date().toISOString()
        }
      })
    );
  });
}

/**
 * Setup automatic background sync listeners
 */
export function setupOfflineAutoSync(onSyncCallback?: (synced: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = async () => {
    console.log('[OfflineSync] Connection restored (ONLINE). Triggering automatic background sync...');
    notifySyncStatusChange();
    const { syncedCount } = await syncPendingReportsToFirestore();
    if (syncedCount > 0 && onSyncCallback) {
      onSyncCallback(syncedCount);
    }
  };

  const handleOffline = () => {
    console.log('[OfflineSync] Connection lost (OFFLINE). Data will be stored locally in IndexedDB.');
    notifySyncStatusChange();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial check on boot
  if (navigator.onLine) {
    syncPendingReportsToFirestore().then(({ syncedCount }) => {
      if (syncedCount > 0 && onSyncCallback) {
        onSyncCallback(syncedCount);
      }
    });
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
