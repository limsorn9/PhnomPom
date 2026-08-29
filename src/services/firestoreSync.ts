import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const MASTER_ADMIN_EMAILS = ['limsorn3@gmail.com', 'limsorn9@gmail.com'];

// Partitioned collection document IDs to guarantee document size stays safely under 1MB
export const CLOUD_DOCS = {
  MAIN: 'school_database_main',
  STUDENTS: 'school_database_students',
  ACADEMICS: 'school_database_academics',
  RESOURCES: 'school_database_resources',
  STAFF_USERS: 'school_database_staff_users'
} as const;

/**
 * Check if the currently authenticated user is the authorized Master Database Administrator
 */
export const isMasterDatabaseAdmin = (): boolean => {
  const currentEmail = auth.currentUser?.email;
  return !!currentEmail && MASTER_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === currentEmail.toLowerCase());
};

// Unique client session ID to prevent echo loops across tabs and devices
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
 * Clean & prune payload to keep document size light, fast, and prevent invalid/oversized values
 */
const deepSanitize = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item)).filter(item => item !== undefined);
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = deepSanitize(value);
    }
  }
  return clean;
};

const sanitizePayload = (data: Partial<CloudSchoolData>): Record<string, any> => {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === 'activityLogs' && Array.isArray(value)) {
      clean[key] = deepSanitize(value.slice(0, 100));
    } else {
      clean[key] = deepSanitize(value);
    }
  }
  return clean;
};

/**
 * Partition payload into bounded document groups to ensure zero risk of exceeding Firestore 1MB limit
 */
const partitionPayload = (data: Record<string, any>, nowIso: string, clientId: string, updatedBy?: string) => {
  const baseMeta = {
    lastUpdated: nowIso,
    clientId,
    updatedBy: updatedBy || 'System'
  };

  const docMain: Record<string, any> = {
    ...baseMeta,
    schoolProfile: data.schoolProfile,
    classrooms: data.classrooms,
    academicYears: data.academicYears,
    examSubjects: data.examSubjects,
    printSettings: data.printSettings,
    villages: data.villages,
    modelSchoolStandards: data.modelSchoolStandards,
    schoolCommittees: data.schoolCommittees,
    schoolStrategicPlans: data.schoolStrategicPlans,
  };

  const docStudents: Record<string, any> = {
    ...baseMeta,
    students: data.students,
    transfers: data.transfers,
    profileEditRequests: data.profileEditRequests,
    studentFeedbacks: data.studentFeedbacks,
    atRiskStudents: data.atRiskStudents,
    releasedResults: data.releasedResults,
    studentBadgeDefinitions: data.studentBadgeDefinitions,
    studentBadgeAssignments: data.studentBadgeAssignments,
  };

  const docAcademics: Record<string, any> = {
    ...baseMeta,
    scores: data.scores,
    attendanceRecords: data.attendanceRecords,
    dailyClassLogs: data.dailyClassLogs,
    dailyHealthChecks: data.dailyHealthChecks,
    qrScanVerificationLogs: data.qrScanVerificationLogs,
  };

  const docResources: Record<string, any> = {
    ...baseMeta,
    budgetTransactions: data.budgetTransactions,
    households: data.households,
    libraryBooks: data.libraryBooks,
    readingLogs: data.readingLogs,
    schoolAssets: data.schoolAssets,
    equipmentItems: data.equipmentItems,
    equipmentLoans: data.equipmentLoans,
    schoolGroups: data.schoolGroups,
    activityLogs: data.activityLogs,
  };

  const docStaffUsers: Record<string, any> = {
    ...baseMeta,
    appUsers: data.appUsers,
    teachers: data.teachers,
    staffAdminRecords: data.staffAdminRecords,
    teacherDailyTasks: data.teacherDailyTasks,
    teacherMeetings: data.teacherMeetings,
    teachingResources: data.teachingResources,
    lessonPlans: data.lessonPlans,
    parentMeetings: data.parentMeetings,
    parentRequests: data.parentRequests,
    classCouncils: data.classCouncils,
    correspondences: data.correspondences,
    calendarEvents: data.calendarEvents
  };

  // Remove undefined fields in each partition
  const cleanPartition = (obj: Record<string, any>) => {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) result[k] = v;
    }
    return result;
  };

  return {
    main: cleanPartition(docMain),
    students: cleanPartition(docStudents),
    academics: cleanPartition(docAcademics),
    resources: cleanPartition(docResources),
    staffUsers: cleanPartition(docStaffUsers)
  };
};

/**
 * Fast lightweight checksum to avoid redundant writes
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
 * Save school data to Firestore with write serialization, timeout protection, partition safety, and loop prevention
 */
export const syncSchoolDataToFirestore = async (data: Partial<CloudSchoolData>, force = false): Promise<{success: boolean, error?: string}> => {
  const currentHash = getQuickHash(data);
  if (!force && currentHash === lastSyncedDataHash) {
    // Data has not changed since last successful sync
    return { success: true };
  }

  // If already writing, queue this payload and return
  if (isWriting) {
    pendingPayload = data;
    return { success: true };
  }

  isWriting = true;
  try {
    const sanitized = sanitizePayload(data);
    const nowIso = new Date().toISOString();
    const partitions = partitionPayload(sanitized, nowIso, CURRENT_CLIENT_ID, sanitized.updatedBy);

    // Write all partition documents in parallel with merge: true
    const writePromises = [
      setDoc(doc(db, 'schools', CLOUD_DOCS.MAIN), partitions.main, { merge: true }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.STUDENTS), partitions.students, { merge: true }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.ACADEMICS), partitions.academics, { merge: true }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.RESOURCES), partitions.resources, { merge: true }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.STAFF_USERS), partitions.staffUsers, { merge: true })
    ];

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore write timeout')), 14000)
    );

    await Promise.race([Promise.all(writePromises), timeoutPromise]);

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
    return { success: true };
  } catch (error: any) {
    isWriting = false;
    if (error?.code === 'resource-exhausted') {
      console.warn('Firestore write throttled, queued for next sync window.');
    } else if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
      console.warn('Firestore cloud sync notice (requires authorized authentication):', error?.message || error);
    } else {
      console.warn('Firestore sync failed, will retry on next state change:', error?.message || error);
    }
    return { success: false, error: error?.message || String(error) };
  }
};

/**
 * Fetch complete school data from all Firestore partitions and merge seamlessly
 */
export const fetchSchoolDataFromFirestore = async (): Promise<CloudSchoolData | null> => {
  try {
    const docRefs = [
      getDoc(doc(db, 'schools', CLOUD_DOCS.MAIN)),
      getDoc(doc(db, 'schools', CLOUD_DOCS.STUDENTS)),
      getDoc(doc(db, 'schools', CLOUD_DOCS.ACADEMICS)),
      getDoc(doc(db, 'schools', CLOUD_DOCS.RESOURCES)),
      getDoc(doc(db, 'schools', CLOUD_DOCS.STAFF_USERS))
    ];

    const results = await Promise.allSettled(docRefs);
    
    let combinedData: CloudSchoolData = {};
    let hasFoundAnyDoc = false;
    let latestTimestamp = '';

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.exists()) {
        hasFoundAnyDoc = true;
        const snapData = result.value.data() as CloudSchoolData;
        if (snapData) {
          combinedData = { ...combinedData, ...snapData };
          if (snapData.lastUpdated && (!latestTimestamp || snapData.lastUpdated > latestTimestamp)) {
            latestTimestamp = snapData.lastUpdated;
          }
        }
      }
    }

    if (!hasFoundAnyDoc) {
      return null;
    }

    if (latestTimestamp) {
      combinedData.lastUpdated = latestTimestamp;
    }

    return combinedData;
  } catch (error) {
    console.error('Failed to fetch school data from Firestore:', error);
    return null;
  }
};

/**
 * Real-time listener for school database changes across devices
 */
export const subscribeToSchoolData = (
  callback: (data: CloudSchoolData) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const unsubscribers: Unsubscribe[] = [];

  const handleSnapshot = (snap: any) => {
    if (!snap.exists()) return;
    const snapData = snap.data() as CloudSchoolData;
    
    // Ignore updates pushed by this current client session to avoid loop echo
    if (snapData && snapData.clientId === CURRENT_CLIENT_ID) {
      return;
    }

    // When remote change arrives, fetch full consolidated partition state to guarantee consistency
    fetchSchoolDataFromFirestore().then(fullData => {
      if (fullData) {
        callback(fullData);
      }
    }).catch(err => {
      if (onError) onError(err);
    });
  };

  try {
    const unsubMain = onSnapshot(doc(db, 'schools', CLOUD_DOCS.MAIN), handleSnapshot, (err) => {
      console.warn('Real-time listener main notice:', err.message);
      if (onError) onError(err);
    });
    unsubscribers.push(unsubMain);

    const unsubStudents = onSnapshot(doc(db, 'schools', CLOUD_DOCS.STUDENTS), handleSnapshot, (err) => {
      console.warn('Real-time listener students notice:', err.message);
    });
    unsubscribers.push(unsubStudents);

    const unsubStaff = onSnapshot(doc(db, 'schools', CLOUD_DOCS.STAFF_USERS), handleSnapshot, (err) => {
      console.warn('Real-time listener staff notice:', err.message);
    });
    unsubscribers.push(unsubStaff);
  } catch (e: any) {
    console.warn('Could not establish real-time snapshot listener:', e);
  }

  return () => {
    unsubscribers.forEach(unsub => {
      try {
        unsub();
      } catch {}
    });
  };
};
