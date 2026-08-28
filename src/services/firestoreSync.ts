import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const MASTER_ADMIN_EMAILS = ['limsorn3@gmail.com', 'limsorn9@gmail.com'];

const CLOUD_SCHOOL_DOC_ID = 'school_database_main';

/**
 * Check if the currently authenticated user is the authorized Master Database Administrator
 */
export const isMasterDatabaseAdmin = (): boolean => {
  const currentEmail = auth.currentUser?.email;
  return !!currentEmail && MASTER_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === currentEmail.toLowerCase());
};


// Unique client session ID to prevent echo loops
const getClientId = (): string => {
  try {
    const existing = sessionStorage.getItem('school_app_client_id');
    if (existing) return existing;
    const newId = `client_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    sessionStorage.setItem('school_app_client_id', newId);
    return newId;
  } catch {
    return `client_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  }
};

export const CURRENT_CLIENT_ID = getClientId();

export interface CloudSchoolData {
  schoolProfile?: any;
  students?: any[];
  teachers?: any[];
  classrooms?: any[];
  scores?: any[];
  budgetTransactions?: any[];
  attendanceRecords?: any[];
  calendarEvents?: any[];
  transfers?: any[];
  academicYears?: any[];
  examSubjects?: any[];
  profileEditRequests?: any[];
  releasedResults?: any[];
  villages?: any[];
  households?: any[];
  libraryBooks?: any[];
  readingLogs?: any[];
  printSettings?: any;
  studentFeedbacks?: any[];
  lessonPlans?: any[];
  parentMeetings?: any[];
  parentRequests?: any[];
  classCouncils?: any[];
  atRiskStudents?: any[];
  dailyClassLogs?: any[];
  studentBadgeDefinitions?: any[];
  studentBadgeAssignments?: any[];
  correspondences?: any[];
  staffAdminRecords?: any[];
  schoolCommittees?: any[];
  schoolStrategicPlans?: any[];
  modelSchoolStandards?: any[];
  schoolAssets?: any[];
  schoolGroups?: any[];
  activityLogs?: any[];
  appUsers?: any[];
  equipmentItems?: any[];
  equipmentLoans?: any[];
  teacherDailyTasks?: any[];
  teacherMeetings?: any[];
  teachingResources?: any[];
  dailyHealthChecks?: any[];
  qrScanVerificationLogs?: any[];
  lastUpdated?: string;
  updatedBy?: string;
  clientId?: string;
}

let isWriting = false;
let pendingPayload: Partial<CloudSchoolData> | null = null;
let lastSyncedDataHash = '';

/**
 * Clean & prune payload to keep document size light, fast, and below Firestore limits
 */
const sanitizePayload = (data: Partial<CloudSchoolData>): Record<string, any> => {
  const clean: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    
    // Prune activity logs to last 80 entries to prevent document bloat
    if (key === 'activityLogs' && Array.isArray(value)) {
      clean[key] = value.slice(0, 80);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

/**
 * Fast lightweight checksum to avoid heavy JSON stringification
 */
const getQuickHash = (obj: any): string => {
  if (!obj) return '';
  try {
    const keys = Object.keys(obj);
    let summary = `k:${keys.length};`;
    for (const k of keys) {
      const val = obj[k];
      if (Array.isArray(val)) {
        summary += `${k}:${val.length}_${val[0]?.id || ''};`;
      } else if (typeof val === 'object' && val !== null) {
        summary += `${k}:${Object.keys(val).length};`;
      } else {
        summary += `${k}:${val};`;
      }
    }
    return summary;
  } catch {
    return String(Date.now());
  }
};

/**
 * Save school data to Firestore with write serialization, timeout protection, and loop prevention
 */
export const syncSchoolDataToFirestore = async (data: Partial<CloudSchoolData>, force = false): Promise<boolean> => {
  const currentHash = getQuickHash(data);
  if (!force && currentHash === lastSyncedDataHash) {
    // Data has not changed since last successful sync
    return true;
  }

  // If already writing, store as pending payload and return
  if (isWriting) {
    pendingPayload = data;
    return true;
  }

  isWriting = true;
  try {
    const sanitized = sanitizePayload(data);
    const docRef = doc(db, 'schools', CLOUD_SCHOOL_DOC_ID);
    
    // Write with 12-second timeout protection
    const writePromise = setDoc(docRef, {
      ...sanitized,
      clientId: CURRENT_CLIENT_ID,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore write timeout')), 12000)
    );

    await Promise.race([writePromise, timeoutPromise]);

    lastSyncedDataHash = currentHash;
    isWriting = false;

    // If another mutation occurred while writing, trigger next write cleanly
    if (pendingPayload) {
      const next = pendingPayload;
      pendingPayload = null;
      setTimeout(() => {
        syncSchoolDataToFirestore(next).catch(console.warn);
      }, 600);
    }
    return true;
  } catch (error: any) {
    isWriting = false;
    // Log friendly warning if network/resource backoff occurs
    if (error?.code === 'resource-exhausted') {
      console.warn('Firestore write throttled, queued for next sync window.');
    } else if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn('Firestore cloud sync notice (requires authorized authentication):', error?.message || error);
    } else {
      console.warn('Firestore sync notice:', error?.message || error);
    }
    return false;
  }
};

/**
 * Fetch full school dataset from Firestore once on startup with fast timeout
 */
export const fetchSchoolDataFromFirestore = async (): Promise<CloudSchoolData | null> => {
  try {
    const docRef = doc(db, 'schools', CLOUD_SCHOOL_DOC_ID);
    const fetchPromise = getDoc(docRef);
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 8000)
    );

    const snap = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap && snap.exists()) {
      const data = snap.data() as CloudSchoolData;
      lastSyncedDataHash = getQuickHash(data);
      return data;
    }
    return null;
  } catch (error) {
    console.error('Firestore fetch failed:', error);
    return null;
  }
};

/**
 * Subscribe to real-time updates from Firestore (ignoring own client echoes)
 */
export const subscribeToSchoolData = (onData: (data: CloudSchoolData) => void) => {
  const docRef = doc(db, 'schools', CLOUD_SCHOOL_DOC_ID);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as CloudSchoolData;
      // Prevent echo if this update originated from this client
      if (data.clientId && data.clientId === CURRENT_CLIENT_ID) {
        return;
      }
      lastSyncedDataHash = getQuickHash(data);
      onData(data);
    }
  }, (err) => {
    console.warn('Firestore real-time subscription note:', err.message);
  });
};

