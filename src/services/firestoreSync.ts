import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const MASTER_ADMIN_EMAIL = 'limsorn9@gmail.com';

const CLOUD_SCHOOL_DOC_ID = 'school_database_main';

/**
 * Check if the currently authenticated user is the authorized Master Database Administrator
 */
export const isMasterDatabaseAdmin = (): boolean => {
  const currentEmail = auth.currentUser?.email;
  return !!currentEmail && currentEmail.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
};


// Unique client session ID to prevent echo loops
export const CURRENT_CLIENT_ID = `client_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

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
  activityLogs?: any[];
  appUsers?: any[];
  lastUpdated?: string;
  updatedBy?: string;
  clientId?: string;
}

let isWriting = false;
let pendingPayload: Partial<CloudSchoolData> | null = null;
let lastSyncedDataHash = '';

/**
 * Helper to generate simple hash string to avoid redundant writes
 */
const getHash = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '';
  }
};

/**
 * Save school data to Firestore with write serialization and loop prevention
 */
export const syncSchoolDataToFirestore = async (data: Partial<CloudSchoolData>, force = false): Promise<boolean> => {
  const currentHash = getHash(data);
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
    const docRef = doc(db, 'schools', CLOUD_SCHOOL_DOC_ID);
    await setDoc(docRef, {
      ...data,
      clientId: CURRENT_CLIENT_ID,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    lastSyncedDataHash = currentHash;
    isWriting = false;

    // If another mutation occurred while writing, trigger next write cleanly
    if (pendingPayload) {
      const next = pendingPayload;
      pendingPayload = null;
      setTimeout(() => {
        syncSchoolDataToFirestore(next).catch(console.warn);
      }, 500);
    }
    return true;
  } catch (error: any) {
    isWriting = false;
    // Log friendly warning if network/resource backoff occurs
    if (error?.code === 'resource-exhausted') {
      console.warn('Firestore write throttled, queued for next sync window.');
    } else {
      console.error('Firestore save failed:', error);
    }
    return false;
  }
};

/**
 * Fetch full school dataset from Firestore once on startup
 */
export const fetchSchoolDataFromFirestore = async (): Promise<CloudSchoolData | null> => {
  try {
    const docRef = doc(db, 'schools', CLOUD_SCHOOL_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CloudSchoolData;
      lastSyncedDataHash = getHash(data);
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
      lastSyncedDataHash = getHash(data);
      onData(data);
    }
  }, (err) => {
    console.warn('Firestore real-time subscription note:', err.message);
  });
};

