export const MASTER_ADMIN_EMAILS = ['limsorn3@gmail.com', 'limsorn9@gmail.com'];
export const CLOUD_DOCS = {
  MAIN: '02100108027_main',
  STUDENTS: '02100108027_students',
  STAFF_USERS: '02100108027_staff_users',
  ACADEMICS: '02100108027_academics',
  RESOURCES: '02100108027_resources'
} as const;

export const isMasterDatabaseAdmin = (): boolean => {
  return true;
};

export const CURRENT_CLIENT_ID = 'offline_client';
export const OFFLINE_CACHE_KEY = 'krou_digital_offline_cache';

export interface CloudSchoolData {
  students?: any[];
  staffUsers?: any[];
  academics?: any;
  resources?: any;
  [key: string]: any;
}

export const isFirestoreQuotaExhausted = (): boolean => true;
export const markFirestoreQuotaExhausted = (_durationMinutes?: number) => {};
export const clearFirestoreQuotaCooldown = () => {};

export const syncSchoolDataToFirestore = async (data: Partial<CloudSchoolData>, force = false): Promise<{success: boolean, error?: string}> => {
  try {
    const existingCache = JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || '{}');
    const newCache = { ...existingCache, ...data, lastUpdated: new Date().toISOString() };
    localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(newCache));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const fetchSchoolDataFromFirestore = async (): Promise<CloudSchoolData | null> => {
  try {
    const cached = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const subscribeToSchoolData = (
  onData: (data: CloudSchoolData) => void,
  onError?: (error: any) => void
): (() => void) => {
  const cached = localStorage.getItem(OFFLINE_CACHE_KEY);
  if (cached) {
    try {
      onData(JSON.parse(cached));
    } catch (err) {
      console.error(err);
    }
  }
  return () => {};
};
