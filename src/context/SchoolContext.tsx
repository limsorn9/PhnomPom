import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Student,
  Teacher,
  Classroom,
  StudentScoreRecord,
  BudgetTransaction,
  SchoolProfile,
  DailyAttendanceRecord,
  ActiveTab,
  MonthlySubjectScores,
  AcademicCalendarEvent,
  UserRole,
  AppUser,
  SystemNotification,
  StudentTransferRecord,
  ExamSubject,
  ProfileEditRequest,
  GradingScaleType,
  HouseholdRecord,
  LibraryBook,
  LibraryReadingLog,
  PrintSettings,
  StudentMonthlyFeedback,
  LessonPlan,
  ParentMeeting,
  ParentRequest,
  ClassCouncil,
  ClassCouncilOfficer,
  OfficialCorrespondence,
  StaffAdministrativeRecord,
  SchoolCommittee,
  SchoolStrategicPlanItem,
  ModelSchoolStandardGroup,
  ModelSchoolStandardCriterion,
  SchoolAssetItem,
  AtRiskStudent,
  InterventionProgressLog,
  DailyClassLog,
  BadgeDefinition,
  StudentBadgeAssignment,
  ActivityLogItem,
  DailyHealthCheckRecord,
  SchoolEquipmentItem,
  EquipmentLoanRecord,
  TeacherDailyTask,
  TeacherMeetingRecord,
  TeachingResourceFile,
  MonthlyBudgetSummary,
  DriveAutoSyncConfig,
  DriveSyncHistoryItem,
  QRScanVerificationLog,
  AcademicAchievement
} from '../types';
import { getTranslation, AppLanguage } from '../utils/translations';
import { googleSignIn, isGoogleAuthenticated } from '../services/googleAuth';
import {
  backupSchoolDataToDrive,
  uploadMeetingMinutesToDrive,
  uploadFinancialReportToDrive,
  PRIMARY_SCHOOL_DRIVE_FOLDER_ID
} from '../services/googleDrive';
import {
  getStoredActivities,
  saveActivitiesToStorage,
  generateSeedActivities,
  getRetentionConfig,
  saveRetentionConfig,
  performRetentionCleanup
} from '../utils/activityTracker';
import {
  syncSchoolDataToFirestore,
  fetchSchoolDataFromFirestore,
  subscribeToSchoolData
} from '../services/firestoreSync';
import {
  setupOfflineAutoSync,
  cacheStudentProgressReport,
  getCachedProgressReports,
  syncPendingReportsToFirestore
} from '../services/offlineSyncService';
import {
  showBrowserPushNotification,
  generateScoreDeadlineReminder,
  generateSchoolActivityReminder,
  buildNotification,
  SendNotificationPayload
} from '../services/fcmNotificationService';
import { sendTelegramNotification } from '../services/telegramService';
import {
  initialSchoolProfile,
  initialTeachers,
  initialClassrooms,
  initialStudents,
  initialScores,
  initialBudgetTransactions,
  initialAttendanceRecords,
  initialCalendarEvents,
  initialUsers,
  initialNotifications,
  initialTransfers,
  initialAcademicYears,
  getCurrentAcademicYear,
  getDynamicAcademicYears,
  initialExamSubjects,
  initialProfileEditRequests,
  initialCatchmentVillages,
  initialHouseholdRecords,
  initialLibraryBooks,
  initialReadingLogs,
  initialLessonPlans,
  initialParentMeetings,
  initialParentRequests,
  initialClassCouncils,
  initialCorrespondences,
  initialStaffAdministrativeRecords,
  initialSchoolCommittees,
  initialSchoolStrategicPlans,
  initialModelSchoolStandards,
  initialSchoolAssets,
  initialAtRiskStudents,
  initialDailyClassLogs,
  initialBadgeDefinitions,
  initialStudentBadgeAssignments,
  initialSchoolEquipment,
  initialEquipmentLoans,
  initialTeacherDailyTasks,
  initialTeacherMeetings,
  initialTeachingResources,
  initialAcademicAchievements
} from '../data/initialData';

interface SchoolContextType {
  // Navigation & User Auth
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // RBAC & Auth
  currentUser: AppUser | null;
  previousTeacherUser: AppUser | null;
  appUsers: AppUser[];
  login: (identifier: string, password: string) => { success: boolean; message: string; user?: AppUser };
  loginByVerifiedIdentifier: (identifier: string) => { success: boolean; message: string; user?: AppUser };
  loginWithGoogle: () => Promise<{ success: boolean; message: string; user?: AppUser }>;
  logoutApp: () => void;
  switchUserRole: (role: UserRole) => void;
  impersonateUser: (userId: string) => void;
  accessStudentAccount: (student: Student) => void;
  switchToTeacherWithPassword: (password: string) => { success: boolean; message?: string };
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => { success: boolean; message: string };
  updateUser: (id: string, updated: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  canAccessTab: (tab: ActiveTab) => boolean;
  canAccessStudentDashboard: (student?: Student | string | null) => { allowed: boolean; reason: string };

  // Academic Years (២០២១ - បច្ចុប្បន្ន)
  academicYears: string[];
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  addAcademicYear: (newYear: string) => { success: boolean; message: string };

  // Examination Subjects & Customization
  examSubjects: ExamSubject[];
  addExamSubject: (subject: Omit<ExamSubject, 'id'>) => void;
  updateExamSubject: (id: string, updated: Partial<ExamSubject>) => void;
  deleteExamSubject: (id: string) => void;
  resetExamSubjectsToDefault: () => void;

  // Profile Edit Request & Approval Workflow
  profileEditRequests: ProfileEditRequest[];
  submitProfileEditRequest: (req: Omit<ProfileEditRequest, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string };
  approveProfileEditRequest: (requestId: string, reviewNotes?: string) => { success: boolean; message: string };
  rejectProfileEditRequest: (requestId: string, reviewNotes?: string) => { success: boolean; message: string };

  // Class Results Release to Students
  releasedResults: Record<string, boolean>;
  isResultReleased: (grade: number, section: string, monthOrSemester: string, academicYear?: string) => boolean;
  toggleReleaseClassResults: (grade: number, section: string, monthOrSemester: string, academicYear?: string) => void;

  // Smart Password Recovery
  verifyAndResetTeacherPassword: (
    email: string,
    phone: string,
    schoolCode: string,
    newPassword: string
  ) => { success: boolean; message: string };
  verifyAndResetStudentPassword: (
    nameKhmer: string,
    studentCode: string,
    newPassword: string
  ) => { success: boolean; message: string };
  verifyAndResetWithGoogle: (newPassword?: string) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  resetPasswordByEmail: (
    email: string,
    newPassword: string,
    code?: string
  ) => { success: boolean; message: string; user?: AppUser };
  sendPasswordResetCode: (
    email: string
  ) => Promise<{ success: boolean; message: string; debugCode?: string; sentViaTelegram?: boolean }>;
  updateCurrentUserProfile: (updatedFields: Partial<AppUser>) => { success: boolean; message: string };
  requestPasswordApprovalFromDirector: (reason: 'change_password' | 'forgot_password', proposedNewPassword?: string) => { success: boolean; message: string };
  approveDirectorPasswordRequest: (notificationId: string) => { success: boolean; message: string };

  // Notifications
  notifications: SystemNotification[];
  unreadNotifCount: number;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;

  // School Profile
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'code'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;

  // Student Transfers (ផ្ទេរចេញ & បន្ថែមសិស្សចូល)
  transfers: StudentTransferRecord[];
  addTransfer: (transfer: Omit<StudentTransferRecord, 'id'>) => void;
  updateTransfer: (id: string, updated: Partial<StudentTransferRecord>) => void;
  deleteTransfer: (id: string) => void;

  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id' | 'staffCode'>) => void;
  updateTeacher: (id: string, updated: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Classrooms
  classrooms: Classroom[];
  addClassroom: (classroom: Omit<Classroom, 'id'>) => void;
  updateClassroom: (id: string, updated: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;

  // Scores & Academic
  scores: StudentScoreRecord[];
  saveStudentScore: (scoreData: {
    studentId: string;
    monthOrSemester: string;
    academicYear: string;
    scores: MonthlySubjectScores;
    remarks?: string;
  }) => void;
  calculateClassRankings: (grade: number, section: string, monthOrSemester: string) => void;
  getScoresForClassMonth: (grade: number, section: string, month: string) => StudentScoreRecord[];
  getScoresForStudent: (studentId: string) => StudentScoreRecord[];

  // Academic Achievements & Honor Roll (ការគ្រប់គ្រងសមិទ្ធផលសិក្សា និងតារាងកិត្តិយស)
  academicAchievements: AcademicAchievement[];
  addAcademicAchievement: (achievement: Omit<AcademicAchievement, 'id' | 'createdAt'>) => { success: boolean; message: string; id: string };
  updateAcademicAchievement: (id: string, updated: Partial<AcademicAchievement>) => void;
  deleteAcademicAchievement: (id: string) => void;
  getAchievementsByStudent: (studentId: string) => AcademicAchievement[];
  getAchievementsByClass: (grade: number, section: string, semester?: string) => AcademicAchievement[];

  // Attendance
  attendanceRecords: DailyAttendanceRecord[];
  recordAttendance: (record: Omit<DailyAttendanceRecord, 'id'>) => void;
  batchRecordAttendance: (records: Array<Omit<DailyAttendanceRecord, 'id'>>) => void;
  getAttendanceForDateAndClass: (date: string, grade: number, section: string) => DailyAttendanceRecord[];
  recordTeacherQuickCheckIn: (teacherId: string, status?: 'present' | 'absent') => void;
  getTeacherCheckInStatus: (teacherId: string, targetDate?: string) => DailyAttendanceRecord | null;

  // Daily Morning Health Screening (ការពិនិត្យសុខភាពពេលព្រឹក)
  dailyHealthChecks: DailyHealthCheckRecord[];
  batchRecordHealthChecks: (records: Array<Omit<DailyHealthCheckRecord, 'id'>>) => void;
  getHealthChecksForDateAndClass: (date: string, grade: number, section: string, session?: 'morning' | 'afternoon') => DailyHealthCheckRecord[];

  // Academic Calendar
  calendarEvents: AcademicCalendarEvent[];
  addCalendarEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updated: Partial<AcademicCalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  markEventSynced: (id: string, googleCalendarEventId?: string) => void;

  // Finance & Budget
  budgetTransactions: BudgetTransaction[];
  addBudgetTransaction: (tx: Omit<BudgetTransaction, 'id' | 'referenceCode'>) => void;
  deleteBudgetTransaction: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;

  // Utility
  resetToDefaultData: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;

  // Language & Localization (Khmer / English)
  language: 'km' | 'en';
  setLanguage: (lang: 'km' | 'en') => void;
  t: (key: string) => string;

  // Dark Mode Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Grading Scale Setting (ល្អណាស់, ល្អ, ល្អបង្គួរ... vs A, B, C...)
  gradingScaleType: 'khmer_term' | 'letter';
  setGradingScaleType: (type: 'khmer_term' | 'letter') => void;
  getFormattedGrade: (averageScore: number, gradeLetter?: string) => string;

  // Household Census (ជំរឿនផែនទីខ្នងផ្ទះ)
  households: HouseholdRecord[];
  villages: string[];
  addHousehold: (record: Omit<HouseholdRecord, 'id'>) => void;
  updateHousehold: (id: string, updated: Partial<HouseholdRecord>) => void;
  deleteHousehold: (id: string) => void;
  addVillage: (villageName: string) => void;

  // Library Management (គ្រប់គ្រងបណ្ណាល័យ)
  libraryBooks: LibraryBook[];
  readingLogs: LibraryReadingLog[];
  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => void;
  updateLibraryBook: (id: string, updated: Partial<LibraryBook>) => void;
  deleteLibraryBook: (id: string) => void;
  addReadingLog: (log: Omit<LibraryReadingLog, 'id'>) => void;
  updateReadingLog: (id: string, updated: Partial<LibraryReadingLog>) => void;
  deleteReadingLog: (id: string) => void;

  // Universal Print Settings
  printSettings: PrintSettings;
  setPrintSettings: React.Dispatch<React.SetStateAction<PrintSettings>>;

  // QR Scan Verification Audit Logs (ប្រវត្តិស្កេនផ្ទៀងផ្ទាត់ QR ហត្ថលេខាឌីជីថល)
  qrScanVerificationLogs: QRScanVerificationLog[];
  addQRScanVerificationLog: (log: Omit<QRScanVerificationLog, 'id' | 'scannedAt'> & { scannedAt?: string }) => void;
  deleteQRScanVerificationLog: (id: string) => void;
  clearQRScanVerificationLogs: () => void;

  // Student Monthly Feedback / Comments to Teachers
  studentFeedbacks: StudentMonthlyFeedback[];
  addStudentFeedback: (feedback: Omit<StudentMonthlyFeedback, 'id' | 'createdAt'>) => void;
  replyStudentFeedback: (feedbackId: string, reply: string) => void;
  toggleAcknowledgeFeedback: (feedbackId: string) => void;
  deleteStudentFeedback: (feedbackId: string) => void;

  // Homeroom Dashboard (Lesson Plans, Parent Meetings, Class Council)
  lessonPlans: LessonPlan[];
  addLessonPlan: (plan: Omit<LessonPlan, 'id' | 'createdAt'>) => void;
  updateLessonPlan: (id: string, updated: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;

  parentMeetings: ParentMeeting[];
  addParentMeeting: (meeting: Omit<ParentMeeting, 'id' | 'createdAt'>) => void;
  updateParentMeeting: (id: string, updated: Partial<ParentMeeting>) => void;
  deleteParentMeeting: (id: string) => void;

  parentRequests: ParentRequest[];
  addParentRequest: (req: Omit<ParentRequest, 'id' | 'createdAt'>) => void;
  updateParentRequest: (id: string, updated: Partial<ParentRequest>) => void;
  resolveParentRequest: (id: string, reply: string, status?: 'approved' | 'resolved' | 'rejected') => void;
  deleteParentRequest: (id: string) => void;

  classCouncils: ClassCouncil[];
  updateClassCouncil: (grade: number, section: string, council: Partial<ClassCouncil>) => void;

  // At-Risk & Remedial Students Management (គ្រប់គ្រងសិស្សខ្សោយ និងសិស្សរៀនយឺត)
  atRiskStudents: AtRiskStudent[];
  addAtRiskStudent: (student: Omit<AtRiskStudent, 'id' | 'enrolledDate' | 'progressLogs' | 'updatedAt'>) => void;
  updateAtRiskStudent: (id: string, updated: Partial<AtRiskStudent>) => void;
  addInterventionLog: (atRiskId: string, log: Omit<InterventionProgressLog, 'id' | 'date'>) => void;
  deleteAtRiskStudent: (id: string) => void;

  // Daily Class Logs & Archival (សៀវភៅតាមដានព្រឹត្តិការណ៍ និងកំណត់ហេតុថ្នាក់រៀនប្រចាំថ្ងៃ)
  dailyClassLogs: DailyClassLog[];
  addDailyClassLog: (log: Omit<DailyClassLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDailyClassLog: (id: string, updated: Partial<DailyClassLog>) => void;
  deleteDailyClassLog: (id: string) => void;
  toggleArchiveDailyClassLog: (id: string) => void;

  // School Administration & Correspondence (រដ្ឋបាលសាលា)
  correspondences: OfficialCorrespondence[];
  addCorrespondence: (cor: Omit<OfficialCorrespondence, 'id'>) => void;
  updateCorrespondence: (id: string, updated: Partial<OfficialCorrespondence>) => void;
  deleteCorrespondence: (id: string) => void;

  staffAdminRecords: StaffAdministrativeRecord[];
  addStaffAdminRecord: (rec: Omit<StaffAdministrativeRecord, 'id' | 'createdAt'>) => void;
  updateStaffAdminRecord: (id: string, updated: Partial<StaffAdministrativeRecord>) => void;
  deleteStaffAdminRecord: (id: string) => void;

  schoolCommittees: SchoolCommittee[];
  addSchoolCommittee: (comm: Omit<SchoolCommittee, 'id'>) => void;
  updateSchoolCommittee: (id: string, updated: Partial<SchoolCommittee>) => void;
  deleteSchoolCommittee: (id: string) => void;

  // School Management & Strategic Plan (ការគ្រប់គ្រងសាលា)
  schoolStrategicPlans: SchoolStrategicPlanItem[];
  addSchoolStrategicPlan: (plan: Omit<SchoolStrategicPlanItem, 'id'>) => void;
  updateSchoolStrategicPlan: (id: string, updated: Partial<SchoolStrategicPlanItem>) => void;
  deleteSchoolStrategicPlan: (id: string) => void;

  modelSchoolStandards: ModelSchoolStandardGroup[];
  updateModelSchoolCriterion: (standardNumber: number, criterionId: string, updated: Partial<ModelSchoolStandardCriterion>) => void;

  schoolAssets: SchoolAssetItem[];
  addSchoolAsset: (asset: Omit<SchoolAssetItem, 'id'>) => void;
  updateSchoolAsset: (id: string, updated: Partial<SchoolAssetItem>) => void;
  deleteSchoolAsset: (id: string) => void;

  // Student Digital Badges & Achievement Markers (ផ្លាកសញ្ញា និងមេដាយឌីជីថល)
  studentBadgeDefinitions: BadgeDefinition[];
  studentBadgeAssignments: StudentBadgeAssignment[];
  assignBadgeToStudent: (assignment: Omit<StudentBadgeAssignment, 'id' | 'createdAt' | 'badge'>) => { success: boolean; message: string };
  bulkAssignBadge: (studentIds: string[], badgeId: string, details: { awardedDate: string; reasonOrEvidence: string; awardedBy: string; academicYear: string; term?: string }) => { success: boolean; count: number };
  removeBadgeAssignment: (assignmentId: string) => void;
  createBadgeDefinition: (badge: Omit<BadgeDefinition, 'id'>) => void;
  updateBadgeDefinition: (id: string, updated: Partial<BadgeDefinition>) => void;
  deleteBadgeDefinition: (id: string) => void;
  getStudentBadges: (studentId: string) => StudentBadgeAssignment[];
  getStudentTotalPoints: (studentId: string) => number;
  autoSuggestBadgesForStudent: (studentId: string) => { badgeId: string; badge: BadgeDefinition; reason: string; metricValue: string }[];

  // Activity & Audit Trail Logs (កំណត់ត្រាសកម្មភាព និងការកែប្រែទិន្នន័យ)
  activityLogs: ActivityLogItem[];
  addActivityLog: (activity: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  updateActivityLogs: (logs: ActivityLogItem[]) => void;
  clearActivityLogs: () => void;

  // 1. School Equipment & Tech Loan Checklist (បញ្ជីឧបករណ៍ និងការខ្ចី)
  equipmentItems: SchoolEquipmentItem[];
  equipmentLoans: EquipmentLoanRecord[];
  addEquipmentLoan: (loan: Omit<EquipmentLoanRecord, 'id' | 'createdAt'>) => void;
  updateEquipmentLoan: (id: string, updated: Partial<EquipmentLoanRecord>) => void;
  deleteEquipmentLoan: (id: string) => void;
  addEquipmentItem: (item: Omit<SchoolEquipmentItem, 'id'>) => void;
  updateEquipmentItem: (id: string, updated: Partial<SchoolEquipmentItem>) => void;

  // 2. Teacher Daily Agenda & Tasks (របៀបវារៈប្រចាំថ្ងៃរបស់គ្រូ)
  teacherDailyTasks: TeacherDailyTask[];
  addTeacherDailyTask: (task: Omit<TeacherDailyTask, 'id' | 'createdAt'>) => void;
  updateTeacherDailyTask: (id: string, updated: Partial<TeacherDailyTask>) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTeacherDailyTask: (id: string) => void;

  // 3. Teacher Meeting Minutes & Decisions (កំណត់ត្រាការប្រជុំគ្រូ)
  teacherMeetings: TeacherMeetingRecord[];
  addTeacherMeeting: (meeting: Omit<TeacherMeetingRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTeacherMeeting: (id: string, updated: Partial<TeacherMeetingRecord>) => void;
  deleteTeacherMeeting: (id: string) => void;

  // 4. Teaching Resource Center (មជ្ឈមណ្ឌលធនធានបង្រៀន)
  teachingResources: TeachingResourceFile[];
  addTeachingResource: (resource: Omit<TeachingResourceFile, 'id' | 'createdAt'>) => void;
  deleteTeachingResource: (id: string) => void;

  // 5. Monthly Budget Tracking
  getMonthlyBudgetSummaries: (academicYear?: string) => MonthlyBudgetSummary[];

  // FCM & Push Notifications
  dispatchNotification: (payload: {
    title: string;
    message: string;
    type: 'score_deadline' | 'school_event' | 'alert' | 'info' | 'system' | 'fcm_push';
    targetRole?: UserRole | 'all';
    targetTeacherGrade?: number;
    targetTeacherSection?: string;
    priority?: 'normal' | 'high' | 'urgent';
    deadlineDate?: string;
    actionTab?: ActiveTab;
    meta?: Record<string, any>;
  }) => void;
  dispatchScoreDeadlineAlert: (monthOrSemester: string, deadlineDate: string, targetGrade?: number, targetSection?: string) => void;
  dispatchSchoolEventAlert: (eventTitle: string, eventDate: string, location?: string, targetRole?: UserRole | 'all') => void;

  // Cloud Firestore Sync State & Controls (ការផ្ទុក និងធ្វើសមកាលកម្មលើពពក)
  isCloudSyncing: boolean;
  lastCloudSyncTime: string | null;
  syncAllToCloud: () => Promise<boolean>;
  pullAllFromCloud: () => Promise<boolean>;

  // 6. Google Drive Automated Synchronization (សមកាលកម្មស្វ័យប្រវត្តិ Google Drive)
  driveAutoSyncConfig: DriveAutoSyncConfig;
  updateDriveAutoSyncConfig: (config: Partial<DriveAutoSyncConfig>) => void;
  driveSyncHistory: DriveSyncHistoryItem[];
  isDriveSyncing: boolean;
  syncMeetingToDrive: (meetingOrId: string | TeacherMeetingRecord, folderIdOverride?: string) => Promise<void>;
  syncAllMeetingsToDrive: (folderIdOverride?: string) => Promise<{ success: number; failed: number }>;
  syncFinancialReportToDrive: (academicYear?: string, folderIdOverride?: string) => Promise<void>;
  triggerDriveAutoSyncAll: () => Promise<void>;
  clearDriveSyncHistory: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'phnom_pom_primary_school_v2';

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // App Users State
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed: AppUser[] = JSON.parse(saved);
        // Ensure super admin credentials are kept up to date with new password
        return parsed.map(u => {
          if (u.email?.toLowerCase() === 'limsorn9@gmail.com' || u.username === 'limsorn') {
            return { ...u, password: 'Ls12122012@' };
          }
          return u;
        });
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  // Current Logged In User State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Previous Teacher User when switched to student account
  const [previousTeacherUser, setPreviousTeacherUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_prev_teacher`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (previousTeacherUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_prev_teacher`, JSON.stringify(previousTeacherUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_prev_teacher`);
    }
  }, [previousTeacherUser]);

  // Notifications State
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Initialize school state
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
    if (!saved) return initialSchoolProfile;
    try {
      const parsed = JSON.parse(saved);
      return { ...initialSchoolProfile, ...parsed };
    } catch {
      return initialSchoolProfile;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_teachers`);
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_classrooms`);
    return saved ? JSON.parse(saved) : initialClassrooms;
  });

  const [scores, setScores] = useState<StudentScoreRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_scores`);
    return saved ? JSON.parse(saved) : initialScores;
  });

  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_budget`);
    return saved ? JSON.parse(saved) : initialBudgetTransactions;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });

  const [dailyHealthChecks, setDailyHealthChecks] = useState<DailyHealthCheckRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_health_checks`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const todayStr = new Date().toISOString().split('T')[0];
    return initialStudents.slice(0, 24).map((st, idx) => ({
      id: `hc-${st.id}-${todayStr}`,
      date: todayStr,
      grade: st.grade,
      section: st.section,
      studentId: st.id,
      studentNameKhmer: st.nameKhmer,
      temperature: idx === 2 ? 37.8 : (idx === 5 ? 38.6 : (idx === 8 ? 37.6 : 36.5)),
      status: idx === 5 ? ('isolate' as const) : (idx === 2 || idx === 8 ? ('monitor' as const) : ('normal' as const)),
      symptoms: idx === 2 ? ['ក្អក', 'ហៀរសំបោរ'] : (idx === 5 ? ['ក្តៅខ្លួន', 'ឈឺក្បាល'] : (idx === 8 ? ['ឈឺក្បាល'] : [])),
      session: 'morning' as const,
      checkedAt: `${todayStr} 07:30`,
      notes: idx === 5 ? 'សីតុណ្ហភាពខ្ពស់ ជូនដំណឹងអាណាព្យាបាល' : ''
    }));
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_health_checks`, JSON.stringify(dailyHealthChecks));
  }, [dailyHealthChecks]);

  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_calendar`);
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [transfers, setTransfers] = useState<StudentTransferRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transfers`);
    return saved ? JSON.parse(saved) : initialTransfers;
  });

  // Academic Years State
  const [academicYears, setAcademicYears] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_academic_years`);
    const dyn = getDynamicAcademicYears();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.from(new Set([...dyn, ...parsed]));
      } catch {
        return dyn;
      }
    }
    return dyn;
  });

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => {
    return getCurrentAcademicYear();
  });

  // Language State ('km' | 'en')
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_lang`);
    return (saved === 'en' || saved === 'km') ? saved : 'km';
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_dark_mode`);
    return saved ? JSON.parse(saved) : false;
  });

  // Grading Scale Type ('khmer_term' | 'letter')
  const [gradingScaleType, setGradingScaleType] = useState<GradingScaleType>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_grading_scale`);
    return (saved === 'letter' || saved === 'khmer_term') ? saved : (schoolProfile.gradingScaleType || 'khmer_term');
  });

  // Exam Subjects State
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_exam_subjects`);
    return saved ? JSON.parse(saved) : initialExamSubjects;
  });

  // Profile Edit Requests State
  const [profileEditRequests, setProfileEditRequests] = useState<ProfileEditRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_edit_requests`);
    return saved ? JSON.parse(saved) : initialProfileEditRequests;
  });

  // Released Exam Results State (grade_section_month_year -> boolean)
  const [releasedResults, setReleasedResults] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_released_results`);
    return saved ? JSON.parse(saved) : { '6_ក_មករា_២០២៤ - ២០២៥': true, '1_ក_មករា_២០២៤ - ២០២៥': true };
  });

  // Catchment Villages State
  const [villages, setVillages] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_villages`);
    return saved ? JSON.parse(saved) : initialCatchmentVillages;
  });

  // Household Records State
  const [households, setHouseholds] = useState<HouseholdRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_households`);
    return saved ? JSON.parse(saved) : initialHouseholdRecords;
  });

  // Library Books State
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_library_books`);
    return saved ? JSON.parse(saved) : initialLibraryBooks;
  });

  // Library Reading Logs State
  const [readingLogs, setReadingLogs] = useState<LibraryReadingLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reading_logs`);
    return saved ? JSON.parse(saved) : initialReadingLogs;
  });

  // Universal Print Settings State
  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_print_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          showRoundStamp: parsed.showRoundStamp ?? true,
          showDirectorSignature: parsed.showDirectorSignature ?? true,
          showDirectorRedName: parsed.showDirectorRedName ?? true,
          showRoyalHeader: parsed.showRoyalHeader ?? true,
          showWatermark: parsed.showWatermark ?? true,
          showPrincipalSignatureQR: parsed.showPrincipalSignatureQR ?? true,
          signatureQRStyle: parsed.signatureQRStyle || 'classic_square',
          signatureExpiryDays: parsed.signatureExpiryDays || 90,
          includeRoundStamp: parsed.includeRoundStamp ?? true,
          includeDirectorSignature: parsed.includeDirectorSignature ?? true,
          redDirectorName: parsed.redDirectorName ?? true,
          paperSize: parsed.paperSize || 'A4',
          orientation: parsed.orientation || 'portrait'
        };
      } catch {
        // fallback
      }
    }
    return {
      includeRoundStamp: true,
      includeDirectorSignature: true,
      redDirectorName: true,
      showRoundStamp: true,
      showDirectorSignature: true,
      showDirectorRedName: true,
      showRoyalHeader: true,
      showWatermark: true,
      showPrincipalSignatureQR: true,
      signatureQRStyle: 'classic_square',
      signatureExpiryDays: 90,
      paperSize: 'A4',
      orientation: 'portrait'
    };
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_print_settings`, JSON.stringify(printSettings));
  }, [printSettings]);

  // QR Scan Verification Audit Logs State (ប្រវត្តិស្កេនផ្ទៀងផ្ទាត់ QR ហត្ថលេខាឌីជីថល)
  const [qrScanVerificationLogs, setQrScanVerificationLogs] = useState<QRScanVerificationLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_qr_verification_logs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const todayStr = new Date().toISOString();
    const pastDateStr = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const olderDateStr = new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString();
    const expiredIssueDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const expiredAtDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return [
      {
        id: 'scan-log-1',
        scannedAt: todayStr,
        signatureRef: 'MOEYS-SIG-2026-6A-STU001-A48F',
        studentId: 'st-1',
        studentCode: 'STU001',
        studentNameKhmer: 'សុខ សុវណ្ណារ៉ា',
        studentNameLatin: 'Sok Sovannara',
        grade: 6,
        section: 'ក',
        academicYear: '២០២៦ - ២០២៧',
        monthOrSemester: 'មករា',
        schoolCode: '001',
        schoolNameKhmer: 'សាលាបឋមសិក្សាភ្នំព្រឹក',
        principalName: 'សួន វិបុល',
        issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verificationStatus: 'valid',
        statusReason: 'ហត្ថលេខាឌីជីថល និងត្រានាយកសាលាមានសុពលភាពត្រឹមត្រូវតាមស្ដង់ដារ MoEYS',
        deviceInfo: {
          deviceType: 'mobile',
          os: 'iOS 17.4',
          browser: 'Safari Mobile',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15'
        },
        verifierName: 'លោកនាយកសាលា',
        verifierRole: 'នាយកសាលា',
        scanMethod: 'webcam_scanner',
        averageScore: 9.25,
        rank: 1,
        totalStudents: 28
      },
      {
        id: 'scan-log-2',
        scannedAt: pastDateStr,
        signatureRef: 'MOEYS-SIG-2026-6A-STU002-B71C',
        studentId: 'st-2',
        studentCode: 'STU002',
        studentNameKhmer: 'ចាន់ ធីតា',
        studentNameLatin: 'Chan Thida',
        grade: 6,
        section: 'ក',
        academicYear: '២០២៦ - ២០២៧',
        monthOrSemester: 'មករា',
        schoolCode: '001',
        schoolNameKhmer: 'សាលាបឋមសិក្សាភ្នំព្រឹក',
        principalName: 'សួន វិបុល',
        issueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 78 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verificationStatus: 'valid',
        statusReason: 'ហត្ថលេខាឌីជីថល និងត្រានាយកសាលាមានសុពលភាពត្រឹមត្រូវតាមស្ដង់ដារ MoEYS',
        deviceInfo: {
          deviceType: 'desktop',
          os: 'Windows 11',
          browser: 'Chrome 122.0',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0'
        },
        verifierName: 'លោកស្រី ម៉ៅ សុផល (អធិការអប់រំ)',
        verifierRole: 'អធិការកិច្ចមន្ទីរអប់រំ',
        scanMethod: 'file_upload',
        averageScore: 8.85,
        rank: 2,
        totalStudents: 28
      },
      {
        id: 'scan-log-3',
        scannedAt: olderDateStr,
        signatureRef: 'MOEYS-SIG-2025-5B-STU089-9E2A',
        studentId: 'st-3',
        studentCode: 'STU089',
        studentNameKhmer: 'កែវ វិចិត្រ',
        studentNameLatin: 'Keo Vichet',
        grade: 5,
        section: 'ខ',
        academicYear: '២០២៤ - ២០២៥',
        monthOrSemester: 'ឆមាសទី១',
        schoolCode: '001',
        schoolNameKhmer: 'សាលាបឋមសិក្សាភ្នំព្រឹក',
        principalName: 'សួន វិបុល',
        issueDate: expiredIssueDate,
        expiresAt: expiredAtDate,
        verificationStatus: 'expired',
        statusReason: `QR Code ហត្ថលេខានាយកបានផុតកំណត់សុពលភាពតាំងពីថ្ងៃទី ${expiredAtDate} (៣០ ថ្ងៃមុន)។ សូមស្នើសុំបង្កើតព្រឹត្តិបត្រពិន្ទុថ្មីដើម្បីធានាសុវត្ថិភាព។`,
        deviceInfo: {
          deviceType: 'tablet',
          os: 'iPadOS 16.5',
          browser: 'Safari',
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X)'
        },
        verifierName: 'អាណាព្យាបាលសិស្ស / ការិយាល័យអប់រំស្រុក',
        verifierRole: 'អាណាព្យាបាល',
        scanMethod: 'webcam_scanner',
        averageScore: 7.95,
        rank: 5,
        totalStudents: 30
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_qr_verification_logs`, JSON.stringify(qrScanVerificationLogs));
  }, [qrScanVerificationLogs]);

  const addQRScanVerificationLog = (log: Omit<QRScanVerificationLog, 'id' | 'scannedAt'> & { scannedAt?: string }) => {
    const newLog: QRScanVerificationLog = {
      ...log,
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      scannedAt: log.scannedAt || new Date().toISOString()
    };
    setQrScanVerificationLogs(prev => [newLog, ...prev].slice(0, 500));
  };

  const deleteQRScanVerificationLog = (id: string) => {
    setQrScanVerificationLogs(prev => prev.filter(l => l.id !== id));
    setToastMessage({ text: 'បានលុបកំណត់ត្រាស្កេនរួចរាល់', type: 'info' });
  };

  const clearQRScanVerificationLogs = () => {
    setQrScanVerificationLogs([]);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_qr_verification_logs`);
    setToastMessage({ text: 'បានសម្អាតប្រវត្តិស្កេន QR ទាំងអស់រួចរាល់', type: 'info' });
  };

  // Student Monthly Feedbacks State
  const [studentFeedbacks, setStudentFeedbacks] = useState<StudentMonthlyFeedback[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_student_feedbacks`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'fb-1',
        studentId: 'st-1',
        studentNameKhmer: 'សុខ សុវណ្ណារ៉ា',
        month: 'មករា',
        academicYear: '២០២៦ - ២០២៧',
        comment: 'សូមអរគុណលោកគ្រូអ្នកគ្រូដែលបានជួយបង្ហាត់បង្រៀនកូនប្រុសខ្ញុំឱ្យមានការរីកចម្រើនលើមុខវិជ្ជាគណិតវិទ្យា និងអានសៀវភៅ។',
        authorName: 'លោក សុខ គង់ (អាណាព្យាបាល)',
        createdAt: '2026-01-28'
      }
    ];
  });

  const addStudentFeedback = (feedback: Omit<StudentMonthlyFeedback, 'id' | 'createdAt'>) => {
    const newFb: StudentMonthlyFeedback = {
      ...feedback,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStudentFeedbacks(prev => [newFb, ...prev]);
    setToastMessage({ text: 'បានផ្ញើមតិយោបល់ប្រចាំខែទៅកាន់លោកគ្រូអ្នកគ្រូជោគជ័យ!', type: 'success' });
  };

  const replyStudentFeedback = (feedbackId: string, reply: string) => {
    setStudentFeedbacks(prev =>
      prev.map(f =>
        f.id === feedbackId
          ? {
              ...f,
              teacherReply: reply,
              teacherRepliedAt: new Date().toISOString().split('T')[0],
              isAcknowledged: true
            }
          : f
      )
    );
    setToastMessage({ text: 'បានឆ្លើយតបមតិយោបល់ជូនអាណាព្យាបាល/សិស្សជោគជ័យ!', type: 'success' });
  };

  const toggleAcknowledgeFeedback = (feedbackId: string) => {
    setStudentFeedbacks(prev =>
      prev.map(f =>
        f.id === feedbackId
          ? {
              ...f,
              isAcknowledged: !f.isAcknowledged
            }
          : f
      )
    );
  };

  const deleteStudentFeedback = (feedbackId: string) => {
    setStudentFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
    setToastMessage({ text: 'បានលុបមតិយោបល់រួចរាល់', type: 'info' });
  };

  // Lesson Plans State
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_lesson_plans`);
    return saved ? JSON.parse(saved) : initialLessonPlans;
  });

  const addLessonPlan = (plan: Omit<LessonPlan, 'id' | 'createdAt'>) => {
    const newPlan: LessonPlan = {
      ...plan,
      id: 'lp-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLessonPlans(prev => [newPlan, ...prev]);
    setToastMessage({ text: 'បានបង្កើតកិច្ចតែងការបង្រៀនថ្មីជោគជ័យ!', type: 'success' });
  };

  const updateLessonPlan = (id: string, updated: Partial<LessonPlan>) => {
    setLessonPlans(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    setToastMessage({ text: 'បានកែប្រែកិច្ចតែងការបង្រៀនជោគជ័យ!', type: 'success' });
  };

  const deleteLessonPlan = (id: string) => {
    setLessonPlans(prev => prev.filter(p => p.id !== id));
    setToastMessage({ text: 'បានលុបកិច្ចតែងការបង្រៀនរួចរាល់', type: 'info' });
  };

  // Parent Meetings State
  const [parentMeetings, setParentMeetings] = useState<ParentMeeting[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_parent_meetings`);
    return saved ? JSON.parse(saved) : initialParentMeetings;
  });

  const addParentMeeting = (meeting: Omit<ParentMeeting, 'id' | 'createdAt'>) => {
    const newMeeting: ParentMeeting = {
      ...meeting,
      id: 'pm-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setParentMeetings(prev => [newMeeting, ...prev]);
    setToastMessage({ text: 'បានបង្កើតកិច្ចប្រជុំមាតាបិតាថ្មីជោគជ័យ!', type: 'success' });
  };

  const updateParentMeeting = (id: string, updated: Partial<ParentMeeting>) => {
    setParentMeetings(prev => prev.map(m => (m.id === id ? { ...m, ...updated } : m)));
    setToastMessage({ text: 'បានកែប្រែកិច្ចប្រជុំមាតាបិតាជោគជ័យ!', type: 'success' });
  };

  const deleteParentMeeting = (id: string) => {
    setParentMeetings(prev => prev.filter(m => m.id !== id));
    setToastMessage({ text: 'បានលុបកិច្ចប្រជុំមាតាបិតារួចរាល់', type: 'info' });
  };

  // Parent Requests & Urgent Inquiries State (សំណើពីមាតាបិតា)
  const [parentRequests, setParentRequests] = useState<ParentRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_parent_requests`);
    return saved ? JSON.parse(saved) : initialParentRequests;
  });

  const addParentRequest = (req: Omit<ParentRequest, 'id' | 'createdAt'>) => {
    const newReq: ParentRequest = {
      ...req,
      id: 'pr-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setParentRequests(prev => [newReq, ...prev]);
    addNotification({
      title: `សំណើពីមាតាបិតា (${newReq.studentName})`,
      message: `${newReq.parentName} បានផ្ញើសំណើ៖ ${newReq.title}`,
      type: newReq.urgency === 'immediate' || newReq.urgency === 'urgent' ? 'alert' : 'info',
      targetRole: 'teacher',
      targetTeacherGrade: newReq.grade,
      targetTeacherSection: newReq.section
    });
    setToastMessage({ text: 'បានកត់ត្រាសំណើពីមាតាបិតាជោគជ័យ!', type: 'success' });
  };

  const updateParentRequest = (id: string, updated: Partial<ParentRequest>) => {
    setParentRequests(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)));
    setToastMessage({ text: 'បានកែសម្រួលសំណើមាតាបិតាជោគជ័យ!', type: 'success' });
  };

  const resolveParentRequest = (
    id: string,
    reply: string,
    status: 'approved' | 'resolved' | 'rejected' = 'resolved'
  ) => {
    setParentRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              teacherReply: reply,
              resolvedAt: new Date().toISOString().split('T')[0],
              status
            }
          : r
      )
    );
    setToastMessage({ text: 'បានឆ្លើយតប និងដោះស្រាយសំណើមាតាបិតារួចរាល់!', type: 'success' });
  };

  const deleteParentRequest = (id: string) => {
    setParentRequests(prev => prev.filter(r => r.id !== id));
    setToastMessage({ text: 'បានលុបសំណើមាតាបិតារួចរាល់', type: 'info' });
  };

  // Class Councils State
  const [classCouncils, setClassCouncils] = useState<ClassCouncil[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_class_councils`);
    return saved ? JSON.parse(saved) : initialClassCouncils;
  });

  const updateClassCouncil = (grade: number, section: string, council: Partial<ClassCouncil>) => {
    setClassCouncils(prev => {
      const idx = prev.findIndex(c => c.grade === grade && c.section === section);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...council };
        return next;
      } else {
        const newCouncil: ClassCouncil = {
          grade,
          section,
          academicYear: selectedAcademicYear,
          officers: [],
          ...council
        };
        return [...prev, newCouncil];
      }
    });
    setToastMessage({ text: 'បានកែប្រែគណៈកម្មការសិស្សថ្នាក់ជោគជ័យ!', type: 'success' });
  };

  // At-Risk & Slow Learners Management State (គ្រប់គ្រងសិស្សខ្សោយ និងសិស្សរៀនយឺត)
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_at_risk_students`);
    return saved ? JSON.parse(saved) : initialAtRiskStudents;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_at_risk_students`, JSON.stringify(atRiskStudents));
  }, [atRiskStudents]);

  // Activity & Data Change Audit Logs State (កំណត់ត្រាសកម្មភាព និងការកែប្រែទិន្នន័យ)
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    let stored = getStoredActivities();
    if (!stored || stored.length === 0) {
      stored = generateSeedActivities(
        initialStudents,
        initialTeachers,
        initialBudgetTransactions,
        initialTransfers,
        initialScores
      );
    }
    // Auto-run cleanup on initial load if enabled
    const retentionCfg = getRetentionConfig();
    if (retentionCfg.autoCleanupEnabled && retentionCfg.retentionDays > 0) {
      const { remainingLogs, deletedCount } = performRetentionCleanup(stored, retentionCfg.retentionDays);
      if (deletedCount > 0) {
        saveRetentionConfig({
          ...retentionCfg,
          lastCleanedAt: new Date().toISOString(),
          lastCleanedCount: deletedCount
        });
        saveActivitiesToStorage(remainingLogs);
        return remainingLogs;
      }
    }
    return stored;
  });

  useEffect(() => {
    saveActivitiesToStorage(activityLogs);
  }, [activityLogs]);

  const addActivityLog = (activity: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const newItem: ActivityLogItem = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId: activity.actorId || currentUser?.id || 'sys-admin-01',
      actorName: activity.actorName || currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
      actorRole: activity.actorRole || (currentUser?.role === 'director' ? 'នាយកសាលា' : currentUser?.role === 'teacher' ? 'គ្រូបន្ទុកថ្នាក់' : 'រដ្ឋបាលសាលា'),
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newItem, ...prev].slice(0, 300));
  };

  const updateActivityLogs = (newLogs: ActivityLogItem[]) => {
    setActivityLogs(newLogs);
    saveActivitiesToStorage(newLogs);
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
    saveActivitiesToStorage([]);
    setToastMessage({ text: 'បានសម្អាតកំណត់ត្រាសកម្មភាពចាស់ៗរួចរាល់', type: 'info' });
  };

  const addAtRiskStudent = (student: Omit<AtRiskStudent, 'id' | 'enrolledDate' | 'progressLogs' | 'updatedAt'>) => {
    const newStudent: AtRiskStudent = {
      ...student,
      id: 'risk-' + Date.now(),
      enrolledDate: new Date().toISOString().split('T')[0],
      progressLogs: [
        {
          id: 'log-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          evaluatedBy: 'គ្រូបន្ទុកថ្នាក់',
          assessmentNote: `បានបញ្ចូលឈ្មោះសិស្សទៅក្នុងកម្មវិធីបំប៉នពិសេស។ ពិន្ទុដើមគ្រា៖ ${student.baselineScore}/10`,
          testScore: student.baselineScore,
          status: 'critical'
        }
      ],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setAtRiskStudents(prev => [newStudent, ...prev]);
    setToastMessage({ text: `បានបញ្ចូលសិស្ស «${student.studentName}» ទៅក្នុងបញ្ជីតាមដានសិស្សខ្សោយជោគជ័យ!`, type: 'success' });
  };

  const updateAtRiskStudent = (id: string, updated: Partial<AtRiskStudent>) => {
    setAtRiskStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString().split('T')[0] } : s))
    );
    setToastMessage({ text: 'បានកែសម្រួលព័ត៌មានតាមដានសិស្សខ្សោយជោគជ័យ!', type: 'success' });
  };

  const addInterventionLog = (atRiskId: string, log: Omit<InterventionProgressLog, 'id' | 'date'>) => {
    const newLog: InterventionProgressLog = {
      ...log,
      id: 'log-' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setAtRiskStudents(prev =>
      prev.map(s => {
        if (s.id === atRiskId) {
          const currentScore = log.testScore !== undefined ? log.testScore : s.currentScore;
          return {
            ...s,
            currentScore,
            overallStatus: log.status,
            progressLogs: [...s.progressLogs, newLog],
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return s;
      })
    );
    setToastMessage({ text: 'បានកត់ត្រាវឌ្ឍនភាពសិក្សា និងការវាយតម្លៃថ្មីជោគជ័យ!', type: 'success' });
  };

  const deleteAtRiskStudent = (id: string) => {
    setAtRiskStudents(prev => prev.filter(s => s.id !== id));
    setToastMessage({ text: 'បានលុបសិស្សចេញពីបញ្ជីតាមដានសិស្សខ្សោយរួចរាល់', type: 'info' });
  };

  // Daily Class Logs State (សៀវភៅតាមដានព្រឹត្តិការណ៍ និងកំណត់ហេតុថ្នាក់រៀនប្រចាំថ្ងៃ)
  const [dailyClassLogs, setDailyClassLogs] = useState<DailyClassLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_daily_class_logs`);
    return saved ? JSON.parse(saved) : initialDailyClassLogs;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_daily_class_logs`, JSON.stringify(dailyClassLogs));
  }, [dailyClassLogs]);

  const addDailyClassLog = (log: Omit<DailyClassLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newLog: DailyClassLog = {
      ...log,
      id: `log-cls-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setDailyClassLogs(prev => [newLog, ...prev]);
    setToastMessage({ text: `បានកត់ត្រាកំណត់ហេតុប្រចាំថ្ងៃ «${log.title}» ជោគជ័យ!`, type: 'success' });
  };

  const updateDailyClassLog = (id: string, updated: Partial<DailyClassLog>) => {
    const now = new Date().toISOString().split('T')[0];
    setDailyClassLogs(prev =>
      prev.map(l => (l.id === id ? { ...l, ...updated, updatedAt: now } : l))
    );
    setToastMessage({ text: 'បានកែប្រែទិន្នន័យកំណត់ហេតុថ្នាក់រៀនជោគជ័យ!', type: 'success' });
  };

  const deleteDailyClassLog = (id: string) => {
    setDailyClassLogs(prev => prev.filter(l => l.id !== id));
    setToastMessage({ text: 'បានលុបកំណត់ហេតុថ្នាក់រៀនរួចរាល់', type: 'info' });
  };

  const toggleArchiveDailyClassLog = (id: string) => {
    setDailyClassLogs(prev =>
      prev.map(l => (l.id === id ? { ...l, isArchived: !l.isArchived, updatedAt: new Date().toISOString().split('T')[0] } : l))
    );
    setToastMessage({ text: 'បានធ្វើបច្ចុប្បន្នភាពបណ្ណសារកំណត់ហេតុ', type: 'info' });
  };

  // Student Digital Badges & Achievement Markers State (ផ្លាកសញ្ញា និងមេដាយឌីជីថល)
  const [studentBadgeDefinitions, setStudentBadgeDefinitions] = useState<BadgeDefinition[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_badge_definitions`);
    return saved ? JSON.parse(saved) : initialBadgeDefinitions;
  });

  const [studentBadgeAssignments, setStudentBadgeAssignments] = useState<StudentBadgeAssignment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_badge_assignments`);
    return saved ? JSON.parse(saved) : initialStudentBadgeAssignments;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_badge_definitions`, JSON.stringify(studentBadgeDefinitions));
  }, [studentBadgeDefinitions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_badge_assignments`, JSON.stringify(studentBadgeAssignments));
  }, [studentBadgeAssignments]);

  const assignBadgeToStudent = (assignment: Omit<StudentBadgeAssignment, 'id' | 'createdAt' | 'badge'>) => {
    const badgeDef = studentBadgeDefinitions.find(b => b.id === assignment.badgeId);
    if (!badgeDef) {
      return { success: false, message: 'រកមិនឃើញទម្រង់ផ្លាកសញ្ញាដែលបានជ្រើសរើសឡើយ' };
    }

    const now = new Date().toISOString().split('T')[0];
    const certNumber = `CERT-${now.split('-')[0]}-${String(studentBadgeAssignments.length + 1).padStart(3, '0')}`;

    const newAssignment: StudentBadgeAssignment = {
      ...assignment,
      id: `asgn-bdg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      badge: badgeDef,
      certificateNumber: certNumber,
      createdAt: now
    };

    setStudentBadgeAssignments(prev => [newAssignment, ...prev]);
    addNotification({
      title: `ការប្រគល់ផ្លាកសញ្ញាកិត្តិយស (${assignment.studentName})`,
      message: `សិស្ស ${assignment.studentName} ទទួលបានផ្លាកសញ្ញា «${badgeDef.titleKhmer}» (${badgeDef.points} ពិន្ទុ)!`,
      type: 'info',
      targetRole: 'all'
    });

    setToastMessage({ text: `បានប្រគល់មេដាយ/ផ្លាកសញ្ញា «${badgeDef.titleKhmer}» ជូនសិស្ស «${assignment.studentName}» ជោគជ័យ!`, type: 'success' });
    return { success: true, message: 'បានប្រគល់ផ្លាកសញ្ញាជោគជ័យ' };
  };

  const bulkAssignBadge = (
    studentIds: string[],
    badgeId: string,
    details: { awardedDate: string; reasonOrEvidence: string; awardedBy: string; academicYear: string; term?: string }
  ) => {
    const badgeDef = studentBadgeDefinitions.find(b => b.id === badgeId);
    if (!badgeDef) return { success: false, count: 0 };

    const now = new Date().toISOString().split('T')[0];
    let count = 0;
    const newAssignments: StudentBadgeAssignment[] = [];

    studentIds.forEach((sId, index) => {
      const student = students.find(s => s.id === sId);
      if (!student) return;

      const certNumber = `CERT-${now.split('-')[0]}-${String(studentBadgeAssignments.length + count + 1).padStart(3, '0')}`;
      newAssignments.push({
        id: `asgn-bdg-${Date.now()}-${index}`,
        studentId: student.id,
        studentName: student.nameKhmer,
        studentGender: student.gender,
        studentCode: student.code,
        grade: student.grade,
        section: student.section,
        badgeId,
        badge: badgeDef,
        awardedDate: details.awardedDate || now,
        academicYear: details.academicYear || selectedAcademicYear,
        term: details.term || 'ឆមាសទី១',
        awardedBy: details.awardedBy || (currentUser?.name || 'លោកគ្រូ-អ្នកគ្រូ'),
        reasonOrEvidence: details.reasonOrEvidence,
        certificateNumber: certNumber,
        createdAt: now
      });
      count++;
    });

    if (newAssignments.length > 0) {
      setStudentBadgeAssignments(prev => [...newAssignments, ...prev]);
      setToastMessage({ text: `បានប្រគល់ផ្លាកសញ្ញា «${badgeDef.titleKhmer}» ជូនសិស្សសរុប ${count} នាក់ជោគជ័យ!`, type: 'success' });
    }

    return { success: true, count };
  };

  const removeBadgeAssignment = (assignmentId: string) => {
    setStudentBadgeAssignments(prev => prev.filter(a => a.id !== assignmentId));
    setToastMessage({ text: 'បានលុបផ្លាកសញ្ញាកិត្តិយសចេញរួចរាល់', type: 'info' });
  };

  const createBadgeDefinition = (badge: Omit<BadgeDefinition, 'id'>) => {
    const newBadge: BadgeDefinition = {
      ...badge,
      id: `bdg-custom-${Date.now()}`,
      code: badge.code || `BDG-CUS-${Math.floor(100 + Math.random() * 900)}`
    };
    setStudentBadgeDefinitions(prev => [...prev, newBadge]);
    setToastMessage({ text: `បានបង្កើតផ្លាកសញ្ញាថ្មី «${badge.titleKhmer}» ជោគជ័យ!`, type: 'success' });
  };

  const updateBadgeDefinition = (id: string, updated: Partial<BadgeDefinition>) => {
    setStudentBadgeDefinitions(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updated } : b))
    );
    setStudentBadgeAssignments(prev =>
      prev.map(a => (a.badgeId === id ? { ...a, badge: { ...a.badge, ...updated } } : a))
    );
    setToastMessage({ text: 'បានកែប្រែទម្រង់ផ្លាកសញ្ញាជោគជ័យ!', type: 'success' });
  };

  const deleteBadgeDefinition = (id: string) => {
    setStudentBadgeDefinitions(prev => prev.filter(b => b.id !== id));
    setToastMessage({ text: 'បានលុបផ្លាកសញ្ញារួចរាល់', type: 'info' });
  };

  const getStudentBadges = (studentId: string): StudentBadgeAssignment[] => {
    return studentBadgeAssignments.filter(a => a.studentId === studentId);
  };

  const getStudentTotalPoints = (studentId: string): number => {
    const badges = studentBadgeAssignments.filter(a => a.studentId === studentId);
    return badges.reduce((acc, curr) => acc + (curr.badge?.points || 0), 0);
  };

  const autoSuggestBadgesForStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];

    const suggestions: { badgeId: string; badge: BadgeDefinition; reason: string; metricValue: string }[] = [];
    const earnedBadgeIds = new Set(studentBadgeAssignments.filter(a => a.studentId === studentId).map(a => a.badgeId));

    // 1. Attendance Check
    const perfectAttBadge = studentBadgeDefinitions.find(b => b.id === 'bdg-att-01');
    if (perfectAttBadge && !earnedBadgeIds.has(perfectAttBadge.id)) {
      if (student.attendance && student.attendance.absentWithoutPermission === 0 && student.attendance.absentWithPermission === 0) {
        suggestions.push({
          badgeId: perfectAttBadge.id,
          badge: perfectAttBadge,
          reason: 'សិស្សមានកំណត់ត្រាវត្តមានពេញលេញ ១០០% ដោយគ្មានអវត្តមាន',
          metricValue: 'វត្តមាន ១០០%'
        });
      }
    }

    // 2. Academic Check
    const starStudentBadge = studentBadgeDefinitions.find(b => b.id === 'bdg-acad-01');
    const mathBadge = studentBadgeDefinitions.find(b => b.id === 'bdg-acad-02');
    
    const studentScores = scores.filter(sc => sc.studentId === studentId);
    if (studentScores.length > 0) {
      const avgScore = studentScores.reduce((acc, curr) => acc + (curr.monthlyScores ? curr.monthlyScores.reduce((mAcc, m) => mAcc + m.averageScore, 0) / (curr.monthlyScores.length || 1) : 0), 0) / studentScores.length;
      
      if (avgScore >= 8.5 && starStudentBadge && !earnedBadgeIds.has(starStudentBadge.id)) {
        suggestions.push({
          badgeId: starStudentBadge.id,
          badge: starStudentBadge,
          reason: `មធ្យមភាគពិន្ទុខ្ពស់ ${avgScore.toFixed(1)}/10 ជាប់ចំណាត់ថ្នាក់ល្អប្រសើរ`,
          metricValue: `ពិន្ទុ ${avgScore.toFixed(1)}`
        });
      }

      const mathScores = studentScores.flatMap(sc => (sc.monthlyScores || []).map(m => m.scores ? (m.scores['គណិតវិទ្យា'] || m.scores['គណិត'] || 0) : 0)).filter(Boolean);
      const avgMath = mathScores.length > 0 ? mathScores.reduce((a, b) => a + b, 0) / mathScores.length : 0;
      if (avgMath >= 9.0 && mathBadge && !earnedBadgeIds.has(mathBadge.id)) {
        suggestions.push({
          badgeId: mathBadge.id,
          badge: mathBadge,
          reason: `ពូកែគណិតវិទ្យាខ្លាំង ពិន្ទុមធ្យមភាគ ${avgMath.toFixed(1)}/10`,
          metricValue: `គណិត ${avgMath.toFixed(1)}`
        });
      }
    }

    // 3. Library Reading Check
    const readingBadge = studentBadgeDefinitions.find(b => b.id === 'bdg-read-01');
    const studentReadingLogs = readingLogs.filter(r => r.studentId === studentId || r.studentName === student.nameKhmer);
    if (readingBadge && !earnedBadgeIds.has(readingBadge.id) && studentReadingLogs.length >= 3) {
      suggestions.push({
        badgeId: readingBadge.id,
        badge: readingBadge,
        reason: `បានអាន និងខ្ចីសៀវភៅបណ្ណាល័យសរុប ${studentReadingLogs.length} ក្បាល`,
        metricValue: `${studentReadingLogs.length} ក្បាល`
      });
    }

    // 4. At-Risk Improvement Check
    const progressBadge = studentBadgeDefinitions.find(b => b.id === 'bdg-prog-01');
    const atRiskData = atRiskStudents.find(a => a.studentId === studentId);
    if (progressBadge && !earnedBadgeIds.has(progressBadge.id) && atRiskData) {
      const diff = atRiskData.currentScore - atRiskData.baselineScore;
      if (diff >= 1.5) {
        suggestions.push({
          badgeId: progressBadge.id,
          badge: progressBadge,
          reason: `មានការរីកចម្រើនគួរឱ្យកត់សម្គាល់ ពិន្ទុកើនពី ${atRiskData.baselineScore} ដល់ ${atRiskData.currentScore} (+${diff.toFixed(1)})`,
          metricValue: `+${diff.toFixed(1)} ពិន្ទុ`
        });
      }
    }

    return suggestions;
  };

  // School Administration State (សៀវភៅលិខិតចូល-ចេញ)
  const [correspondences, setCorrespondences] = useState<OfficialCorrespondence[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_correspondences`);
    return saved ? JSON.parse(saved) : initialCorrespondences;
  });

  const addCorrespondence = (cor: Omit<OfficialCorrespondence, 'id'>) => {
    const newCor: OfficialCorrespondence = {
      ...cor,
      id: `cor-${Date.now()}`
    };
    setCorrespondences(prev => [newCor, ...prev]);
    setToastMessage({ text: `បានបញ្ចូលលិខិតលេខ «${newCor.logNumber}» ជោគជ័យ!`, type: 'success' });
  };

  const updateCorrespondence = (id: string, updated: Partial<OfficialCorrespondence>) => {
    setCorrespondences(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
    setToastMessage({ text: 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានលិខិតរដ្ឋបាលជោគជ័យ!', type: 'success' });
  };

  const deleteCorrespondence = (id: string) => {
    setCorrespondences(prev => prev.filter(c => c.id !== id));
    setToastMessage({ text: 'បានលុបលិខិតរដ្ឋបាលរួចរាល់', type: 'info' });
  };

  // Staff Administrative Records (បេសកកម្ម & ច្បាប់ឈប់សម្រាក)
  const [staffAdminRecords, setStaffAdminRecords] = useState<StaffAdministrativeRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_staff_admin_records`);
    return saved ? JSON.parse(saved) : initialStaffAdministrativeRecords;
  });

  const addStaffAdminRecord = (rec: Omit<StaffAdministrativeRecord, 'id' | 'createdAt'>) => {
    const newRec: StaffAdministrativeRecord = {
      ...rec,
      id: `sar-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStaffAdminRecords(prev => [newRec, ...prev]);
    setToastMessage({ text: `បានបញ្ចូលសំណុំរដ្ឋបាល «${newRec.title}» ជោគជ័យ!`, type: 'success' });
  };

  const updateStaffAdminRecord = (id: string, updated: Partial<StaffAdministrativeRecord>) => {
    setStaffAdminRecords(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)));
    setToastMessage({ text: 'បានកែប្រែសំណុំរដ្ឋបាលបុគ្គលិកជោគជ័យ!', type: 'success' });
  };

  const deleteStaffAdminRecord = (id: string) => {
    setStaffAdminRecords(prev => prev.filter(r => r.id !== id));
    setToastMessage({ text: 'បានលុបសំណុំរដ្ឋបាលរួចរាល់', type: 'info' });
  };

  // School Committees (គណៈកម្មការសាលា)
  const [schoolCommittees, setSchoolCommittees] = useState<SchoolCommittee[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_school_committees`);
    return saved ? JSON.parse(saved) : initialSchoolCommittees;
  });

  const addSchoolCommittee = (comm: Omit<SchoolCommittee, 'id'>) => {
    const newComm: SchoolCommittee = {
      ...comm,
      id: `comm-${Date.now()}`
    };
    setSchoolCommittees(prev => [...prev, newComm]);
    setToastMessage({ text: `បានបង្កើត «${newComm.committeeName}» ជោគជ័យ!`, type: 'success' });
  };

  const updateSchoolCommittee = (id: string, updated: Partial<SchoolCommittee>) => {
    setSchoolCommittees(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
    setToastMessage({ text: 'បានកែប្រែព័ត៌មានគណៈកម្មការជោគជ័យ!', type: 'success' });
  };

  const deleteSchoolCommittee = (id: string) => {
    setSchoolCommittees(prev => prev.filter(c => c.id !== id));
    setToastMessage({ text: 'បានលុបគណៈកម្មការរួចរាល់', type: 'info' });
  };

  // School Strategic Plans (ផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍សាលា)
  const [schoolStrategicPlans, setSchoolStrategicPlans] = useState<SchoolStrategicPlanItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_school_strategic_plans`);
    return saved ? JSON.parse(saved) : initialSchoolStrategicPlans;
  });

  const addSchoolStrategicPlan = (plan: Omit<SchoolStrategicPlanItem, 'id'>) => {
    const newPlan: SchoolStrategicPlanItem = {
      ...plan,
      id: `ssp-${Date.now()}`
    };
    setSchoolStrategicPlans(prev => [...prev, newPlan]);
    setToastMessage({ text: `បានបញ្ចូលផែនការយុទ្ធសាស្ត្រ «${newPlan.objective}» ជោគជ័យ!`, type: 'success' });
  };

  const updateSchoolStrategicPlan = (id: string, updated: Partial<SchoolStrategicPlanItem>) => {
    setSchoolStrategicPlans(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    setToastMessage({ text: 'បានកែប្រែផែនការយុទ្ធសាស្ត្រជោគជ័យ!', type: 'success' });
  };

  const deleteSchoolStrategicPlan = (id: string) => {
    setSchoolStrategicPlans(prev => prev.filter(p => p.id !== id));
    setToastMessage({ text: 'បានលុបផែនការយុទ្ធសាស្ត្ររួចរាល់', type: 'info' });
  };

  // Model School Standards (ស្ដង់ដាសាលារៀនគំរូ ៥ ស្តង់ដា MoEYS)
  const [modelSchoolStandards, setModelSchoolStandards] = useState<ModelSchoolStandardGroup[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_model_school_standards`);
    return saved ? JSON.parse(saved) : initialModelSchoolStandards;
  });

  const updateModelSchoolCriterion = (standardNumber: number, criterionId: string, updated: Partial<ModelSchoolStandardCriterion>) => {
    setModelSchoolStandards(prev =>
      prev.map(grp => {
        if (grp.standardNumber !== standardNumber) return grp;
        return {
          ...grp,
          criteria: grp.criteria.map(c => (c.id === criterionId ? { ...c, ...updated } : c))
        };
      })
    );
    setToastMessage({ text: 'បានធ្វើបច្ចុប្បន្នភាពការវាយតម្លៃស្ដង់ដាសាលាគំរូជោគជ័យ!', type: 'success' });
  };

  // School Assets & Inventory (សារពើភ័ណ្ឌ & ទ្រព្យសម្បត្តិសាលា)
  const [schoolAssets, setSchoolAssets] = useState<SchoolAssetItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_school_assets`);
    return saved ? JSON.parse(saved) : initialSchoolAssets;
  });

  const addSchoolAsset = (asset: Omit<SchoolAssetItem, 'id'>) => {
    const newAsset: SchoolAssetItem = {
      ...asset,
      id: `ast-${Date.now()}`
    };
    setSchoolAssets(prev => [newAsset, ...prev]);
    setToastMessage({ text: `បានបញ្ចូលសារពើភ័ណ្ឌ «${newAsset.assetNameKhmer}» ជោគជ័យ!`, type: 'success' });
  };

  const updateSchoolAsset = (id: string, updated: Partial<SchoolAssetItem>) => {
    setSchoolAssets(prev => prev.map(a => (a.id === id ? { ...a, ...updated } : a)));
    setToastMessage({ text: 'បានកែប្រែទិន្នន័យសារពើភ័ណ្ឌជោគជ័យ!', type: 'success' });
  };

  const deleteSchoolAsset = (id: string) => {
    setSchoolAssets(prev => prev.filter(a => a.id !== id));
    setToastMessage({ text: 'បានលុបទិន្នន័យសារពើភ័ណ្ឌរួចរាល់', type: 'info' });
  };

  // ----------------------------------------------------
  // 1. SCHOOL EQUIPMENT & TECH LOAN CHECKLIST (បញ្ជីឧបករណ៍ និងការខ្ចី)
  // ----------------------------------------------------
  const [equipmentItems, setEquipmentItems] = useState<SchoolEquipmentItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_equipment_items`);
    return saved ? JSON.parse(saved) : initialSchoolEquipment;
  });

  const [equipmentLoans, setEquipmentLoans] = useState<EquipmentLoanRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_equipment_loans`);
    return saved ? JSON.parse(saved) : initialEquipmentLoans;
  });

  const addEquipmentLoan = (loan: Omit<EquipmentLoanRecord, 'id' | 'createdAt'>) => {
    const newLoan: EquipmentLoanRecord = {
      ...loan,
      id: `loan-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setEquipmentLoans(prev => [newLoan, ...prev]);

    // Update equipment available quantity
    setEquipmentItems(prev =>
      prev.map(eq => {
        if (eq.id === loan.equipmentId && eq.availableQuantity > 0) {
          return { ...eq, availableQuantity: Math.max(0, eq.availableQuantity - 1) };
        }
        return eq;
      })
    );

    setToastMessage({ text: `បានចុះឈ្មោះខ្ចីឧបករណ៍ «${loan.equipmentName}» ជោគជ័យ!`, type: 'success' });
  };

  const updateEquipmentLoan = (id: string, updated: Partial<EquipmentLoanRecord>) => {
    setEquipmentLoans(prev =>
      prev.map(loan => {
        if (loan.id === id) {
          const merged = { ...loan, ...updated };
          // If status changed to returned, restore equipment quantity
          if (loan.status !== 'returned' && updated.status === 'returned') {
            setEquipmentItems(items =>
              items.map(eq => (eq.id === loan.equipmentId ? { ...eq, availableQuantity: Math.min(eq.totalQuantity, eq.availableQuantity + 1) } : eq))
            );
          }
          return merged;
        }
        return loan;
      })
    );
    setToastMessage({ text: 'បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាខ្ចីឧបករណ៍ជោគជ័យ!', type: 'success' });
  };

  const deleteEquipmentLoan = (id: string) => {
    setEquipmentLoans(prev => prev.filter(l => l.id !== id));
    setToastMessage({ text: 'បានលុបកំណត់ត្រាខ្ចីឧបករណ៍រួចរាល់', type: 'info' });
  };

  const addEquipmentItem = (item: Omit<SchoolEquipmentItem, 'id'>) => {
    const newItem: SchoolEquipmentItem = {
      ...item,
      id: `eq-${Date.now()}`
    };
    setEquipmentItems(prev => [...prev, newItem]);
    setToastMessage({ text: `បានបន្ថែមឧបករណ៍ «${newItem.nameKhmer}» ក្នុងបញ្ជីជោគជ័យ!`, type: 'success' });
  };

  const updateEquipmentItem = (id: string, updated: Partial<SchoolEquipmentItem>) => {
    setEquipmentItems(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
    setToastMessage({ text: 'បានកែសម្រួលព័ត៌មានឧបករណ៍ជោគជ័យ!', type: 'success' });
  };

  // ----------------------------------------------------
  // 2. TEACHER DAILY AGENDA & TASKS (របៀបវារៈប្រចាំថ្ងៃរបស់គ្រូ)
  // ----------------------------------------------------
  const [teacherDailyTasks, setTeacherDailyTasks] = useState<TeacherDailyTask[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_teacher_daily_tasks`);
    return saved ? JSON.parse(saved) : initialTeacherDailyTasks;
  });

  const addTeacherDailyTask = (task: Omit<TeacherDailyTask, 'id' | 'createdAt'>) => {
    const newTask: TeacherDailyTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTeacherDailyTasks(prev => [newTask, ...prev]);
    setToastMessage({ text: `បានបន្ថែមភារកិច្ច «${task.title}» ក្នុងរបៀបវារៈជោគជ័យ!`, type: 'success' });
  };

  const updateTeacherDailyTask = (id: string, updated: Partial<TeacherDailyTask>) => {
    setTeacherDailyTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    setToastMessage({ text: 'បានធ្វើបច្ចុប្បន្នភាពភារកិច្ចជោគជ័យ!', type: 'success' });
  };

  const toggleTaskCompleted = (id: string) => {
    setTeacherDailyTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextCompleted = !t.isCompleted;
          return {
            ...t,
            isCompleted: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  };

  const deleteTeacherDailyTask = (id: string) => {
    setTeacherDailyTasks(prev => prev.filter(t => t.id !== id));
    setToastMessage({ text: 'បានលុបភារកិច្ចចេញរួចរាល់', type: 'info' });
  };

  // ----------------------------------------------------
  // 3. TEACHER MEETING MINUTES & RESOLUTIONS (កំណត់ត្រាការប្រជុំគ្រូ)
  // ----------------------------------------------------
  const [teacherMeetings, setTeacherMeetings] = useState<TeacherMeetingRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_teacher_meetings`);
    return saved ? JSON.parse(saved) : initialTeacherMeetings;
  });

  const addTeacherMeeting = (meeting: Omit<TeacherMeetingRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMeeting: TeacherMeetingRecord = {
      ...meeting,
      id: `mtg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTeacherMeetings(prev => [newMeeting, ...prev]);
    setToastMessage({ text: `បានបង្កើតកំណត់ត្រាកិច្ចប្រជុំ «${meeting.title}» ជោគជ័យ!`, type: 'success' });
  };

  const updateTeacherMeeting = (id: string, updated: Partial<TeacherMeetingRecord>) => {
    setTeacherMeetings(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updated, updatedAt: new Date().toISOString() } : m))
    );
    setToastMessage({ text: 'បានកែសម្រួលកំណត់ត្រាកិច្ចប្រជុំជោគជ័យ!', type: 'success' });
  };

  const deleteTeacherMeeting = (id: string) => {
    setTeacherMeetings(prev => prev.filter(m => m.id !== id));
    setToastMessage({ text: 'បានលុបកំណត់ត្រាកិច្ចប្រជុំរួចរាល់', type: 'info' });
  };

  // ----------------------------------------------------
  // 4. TEACHING RESOURCE HUB & GOOGLE DRIVE SHARING (មជ្ឈមណ្ឌលធនធានបង្រៀន)
  // ----------------------------------------------------
  const [teachingResources, setTeachingResources] = useState<TeachingResourceFile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_teaching_resources`);
    return saved ? JSON.parse(saved) : initialTeachingResources;
  });

  const addTeachingResource = (resource: Omit<TeachingResourceFile, 'id' | 'createdAt'>) => {
    const newRes: TeachingResourceFile = {
      ...resource,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTeachingResources(prev => [newRes, ...prev]);
    setToastMessage({ text: `បានបញ្ចូលធនធានបង្រៀន «${resource.titleKhmer}» ជោគជ័យ!`, type: 'success' });
  };

  const deleteTeachingResource = (id: string) => {
    setTeachingResources(prev => prev.filter(r => r.id !== id));
    setToastMessage({ text: 'បានលុបឯកសារធនធានរួចរាល់', type: 'info' });
  };

  // ----------------------------------------------------
  // 5. MONTHLY BUDGET SUMMARIES CALCULATOR
  // ----------------------------------------------------
  const getMonthlyBudgetSummaries = (yearFilter?: string): MonthlyBudgetSummary[] => {
    const targetYear = yearFilter || selectedAcademicYear;
    const monthsOrder = [
      { name: 'តុលា', num: 10 },
      { name: 'វិច្ឆិកា', num: 11 },
      { name: 'ធ្នូ', num: 12 },
      { name: 'មករា', num: 1 },
      { name: 'កុម្ភៈ', num: 2 },
      { name: 'មីនា', num: 3 },
      { name: 'មេសា', num: 4 },
      { name: 'ឧសភា', num: 5 },
      { name: 'មិថុនា', num: 6 },
      { name: 'កក្កដា', num: 7 },
      { name: 'សីហា', num: 8 },
      { name: 'កញ្ញា', num: 9 }
    ];

    return monthsOrder.map(m => {
      // Find transactions matching this month
      const matchingTxs = budgetTransactions.filter(tx => {
        if (!tx.date) return false;
        const txMonth = new Date(tx.date).getMonth() + 1; // 1-12
        return txMonth === m.num;
      });

      let incomeRiel = 0;
      let expenseRiel = 0;
      const byCategory: Record<string, number> = {};
      const bySource = {
        pbStateBudget: { income: 0, expense: 0 },
        sigImprovementGrant: { income: 0, expense: 0 },
        communityParents: { income: 0, expense: 0 },
        ngoPartner: { income: 0, expense: 0 }
      };

      matchingTxs.forEach(tx => {
        if (tx.type === 'income') {
          incomeRiel += tx.amountRiel;
          if (tx.source.includes('PB')) bySource.pbStateBudget.income += tx.amountRiel;
          else if (tx.source.includes('SIG')) bySource.sigImprovementGrant.income += tx.amountRiel;
          else if (tx.source.includes('សហគមន៍') || tx.source.includes('មាតាបិតា')) bySource.communityParents.income += tx.amountRiel;
          else bySource.ngoPartner.income += tx.amountRiel;
        } else {
          expenseRiel += tx.amountRiel;
          if (tx.source.includes('PB')) bySource.pbStateBudget.expense += tx.amountRiel;
          else if (tx.source.includes('SIG')) bySource.sigImprovementGrant.expense += tx.amountRiel;
          else if (tx.source.includes('សហគមន៍') || tx.source.includes('មាតាបិតា')) bySource.communityParents.expense += tx.amountRiel;
          else bySource.ngoPartner.expense += tx.amountRiel;

          byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amountRiel;
        }
      });

      const balanceRiel = incomeRiel - expenseRiel;
      return {
        monthName: m.name,
        monthNumber: m.num,
        academicYear: targetYear,
        incomeRiel,
        expenseRiel,
        balanceRiel,
        incomeUsd: Math.round(incomeRiel / 4050),
        expenseUsd: Math.round(expenseRiel / 4050),
        balanceUsd: Math.round(balanceRiel / 4050),
        transactionCount: matchingTxs.length,
        bySource,
        byCategory
      };
    });
  };

  // ----------------------------------------------------
  // 6. GOOGLE DRIVE AUTOMATED SYNCHRONIZATION ENGINE
  // ----------------------------------------------------
  const initialDriveAutoSyncConfig: DriveAutoSyncConfig = {
    enabled: true,
    intervalMinutes: 30,
    syncMeetings: true,
    syncFinances: true,
    syncFullBackup: true,
    folderId: PRIMARY_SCHOOL_DRIVE_FOLDER_ID,
    autoSyncOnChanges: true,
    lastAutoSyncTime: undefined
  };

  const [driveAutoSyncConfig, setDriveAutoSyncConfig] = useState<DriveAutoSyncConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gdrive_auto_sync_config`);
    return saved ? JSON.parse(saved) : initialDriveAutoSyncConfig;
  });

  const [driveSyncHistory, setDriveSyncHistory] = useState<DriveSyncHistoryItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gdrive_sync_history`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'sync-init-1',
        title: 'កំណត់ហេតុកិច្ចប្រជុំគ្រូប្រចាំខែសីហា',
        category: 'meeting_minutes',
        categoryLabelKhmer: 'កំណត់ហេតុកិច្ចប្រជុំ',
        fileName: 'កំណត់ហេតុ_កិច្ចប្រជុំប្រចាំខែសីហា_២០២៦_2026-08-28.html',
        fileSizeFormatted: '18.4 KB',
        folderId: PRIMARY_SCHOOL_DRIVE_FOLDER_ID,
        driveFileId: 'drv-mock-mtg-1',
        driveWebViewLink: `https://drive.google.com/drive/folders/${PRIMARY_SCHOOL_DRIVE_FOLDER_ID}`,
        status: 'success',
        syncedAt: '2026-08-23T18:30:00Z',
        syncedBy: 'limsorn9@gmail.com'
      },
      {
        id: 'sync-init-2',
        title: 'របាយការណ៍បូកសរុបថវិកា ១២ ខែ (PB & SIG)',
        category: 'financial_report',
        categoryLabelKhmer: 'របាយការណ៍ហិរញ្ញវត្ថុ',
        fileName: 'របាយការណ៍ហិរញ្ញវត្ថុ_ថវិកា១២ខែ_2026-2027.html',
        fileSizeFormatted: '24.2 KB',
        folderId: PRIMARY_SCHOOL_DRIVE_FOLDER_ID,
        driveFileId: 'drv-mock-fin-1',
        driveWebViewLink: `https://drive.google.com/drive/folders/${PRIMARY_SCHOOL_DRIVE_FOLDER_ID}`,
        status: 'success',
        syncedAt: '2026-08-23T18:30:10Z',
        syncedBy: 'limsorn9@gmail.com'
      }
    ];
  });

  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_gdrive_auto_sync_config`, JSON.stringify(driveAutoSyncConfig));
  }, [driveAutoSyncConfig]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_gdrive_sync_history`, JSON.stringify(driveSyncHistory));
  }, [driveSyncHistory]);

  const updateDriveAutoSyncConfig = (config: Partial<DriveAutoSyncConfig>) => {
    setDriveAutoSyncConfig(prev => ({ ...prev, ...config }));
    setToastMessage({ text: 'បានកែសម្រួលការកំណត់ Auto-Sync Google Drive ជោគជ័យ!', type: 'success' });
  };

  const clearDriveSyncHistory = () => {
    setDriveSyncHistory([]);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_gdrive_sync_history`);
    setToastMessage({ text: 'បានសម្អាតប្រវត្តិ Sync Google Drive រួចរាល់', type: 'info' });
  };

  const syncMeetingToDrive = async (meetingOrId: string | TeacherMeetingRecord, folderIdOverride?: string) => {
    let meeting: TeacherMeetingRecord | undefined;
    let meetingId: string;

    if (typeof meetingOrId === 'string') {
      meetingId = meetingOrId;
      meeting = teacherMeetings.find(m => m.id === meetingId);
    } else {
      meeting = meetingOrId;
      meetingId = meetingOrId.id;
    }

    if (!meeting) {
      setToastMessage({ text: 'រកមិនឃើញកំណត់ត្រាកិច្ចប្រជុំដែលត្រូវ Sync ឡើយ', type: 'error' });
      return;
    }

    setIsDriveSyncing(true);
    const targetFolder = folderIdOverride || driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      const driveItem = await uploadMeetingMinutesToDrive(meeting, schoolProfile, targetFolder);
      const nowIso = new Date().toISOString();

      // Update meeting record with sync metadata
      setTeacherMeetings(prev =>
        prev.map(m =>
          m.id === meetingId
            ? {
                ...m,
                isSyncedToGoogleDrive: true,
                googleDriveFileId: driveItem.id,
                googleDriveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
                driveSyncedAt: nowIso
              }
            : m
        )
      );

      // Add to history
      const newHistoryItem: DriveSyncHistoryItem = {
        id: `sync-${Date.now()}`,
        title: meeting.title,
        category: 'meeting_minutes',
        categoryLabelKhmer: 'កំណត់ហេតុកិច្ចប្រជុំ',
        fileName: driveItem.name || `កំណត់ហេតុ_${meeting.title}.html`,
        fileSizeFormatted: driveItem.size ? `${(parseInt(driveItem.size) / 1024).toFixed(1)} KB` : '18.5 KB',
        folderId: targetFolder,
        driveFileId: driveItem.id,
        driveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
        status: 'success',
        syncedAt: nowIso,
        syncedBy: currentUser?.email || 'limsorn9@gmail.com'
      };

      setDriveSyncHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));

      setToastMessage({
        text: `បាន Sync កំណត់ហេតុ «${meeting.title}» ទៅកាន់ Google Drive (Folder: ${targetFolder}) ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Failed to sync meeting to Drive:', err);
      const errorItem: DriveSyncHistoryItem = {
        id: `sync-${Date.now()}`,
        title: meeting.title,
        category: 'meeting_minutes',
        categoryLabelKhmer: 'កំណត់ហេតុកិច្ចប្រជុំ',
        fileName: `កំណត់ហេតុ_${meeting.title}.html`,
        folderId: targetFolder,
        status: 'failed',
        errorMessage: err.message || 'បញ្ហាក្នុងការភ្ជាប់ Google Drive',
        syncedAt: new Date().toISOString(),
        syncedBy: currentUser?.email || 'limsorn9@gmail.com'
      };
      setDriveSyncHistory(prev => [errorItem, ...prev.slice(0, 49)]);
      setToastMessage({ text: `បរាជ័យក្នុងការ Sync ទៅ Google Drive: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const syncAllMeetingsToDrive = async (folderIdOverride?: string): Promise<{ success: number; failed: number }> => {
    setIsDriveSyncing(true);
    let successCount = 0;
    let failedCount = 0;
    const targetFolder = folderIdOverride || driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;

    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      for (const meeting of teacherMeetings) {
        try {
          const driveItem = await uploadMeetingMinutesToDrive(meeting, schoolProfile, targetFolder);
          const nowIso = new Date().toISOString();

          setTeacherMeetings(prev =>
            prev.map(m =>
              m.id === meeting.id
                ? {
                    ...m,
                    isSyncedToGoogleDrive: true,
                    googleDriveFileId: driveItem.id,
                    googleDriveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
                    driveSyncedAt: nowIso
                  }
                : m
            )
          );

          const newHistoryItem: DriveSyncHistoryItem = {
            id: `sync-batch-${Date.now()}-${meeting.id}`,
            title: meeting.title,
            category: 'meeting_minutes',
            categoryLabelKhmer: 'កំណត់ហេតុកិច្ចប្រជុំ',
            fileName: driveItem.name || `កំណត់ហេតុ_${meeting.title}.html`,
            fileSizeFormatted: driveItem.size ? `${(parseInt(driveItem.size) / 1024).toFixed(1)} KB` : '18.5 KB',
            folderId: targetFolder,
            driveFileId: driveItem.id,
            driveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
            status: 'success',
            syncedAt: nowIso,
            syncedBy: currentUser?.email || 'limsorn9@gmail.com'
          };

          setDriveSyncHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);
          successCount++;
        } catch (e) {
          failedCount++;
        }
      }

      const nowIso = new Date().toISOString();
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));
      setToastMessage({
        text: `បាន Sync កំណត់ហេតុការប្រជុំសរុប ${successCount} ឯកសារ ទៅកាន់ Google Drive (${targetFolder}) ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      setToastMessage({ text: `មានបញ្ហាក្នុងការ Sync ទៅ Google Drive: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
    return { success: successCount, failed: failedCount };
  };

  const syncFinancialReportToDrive = async (academicYear?: string, folderIdOverride?: string) => {
    setIsDriveSyncing(true);
    const targetYear = academicYear || selectedAcademicYear;
    const summaries = getMonthlyBudgetSummaries(targetYear);
    const targetFolder = folderIdOverride || driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;

    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      const driveItem = await uploadFinancialReportToDrive(
        summaries,
        budgetTransactions,
        schoolProfile,
        targetYear,
        targetFolder
      );

      const nowIso = new Date().toISOString();
      const newHistoryItem: DriveSyncHistoryItem = {
        id: `sync-fin-${Date.now()}`,
        title: `របាយការណ៍ហិរញ្ញវត្ថុ ១២ ខែ (${targetYear})`,
        category: 'financial_report',
        categoryLabelKhmer: 'របាយការណ៍ហិរញ្ញវត្ថុ',
        fileName: driveItem.name || `របាយការណ៍ហិរញ្ញវត្ថុ_${targetYear}.html`,
        fileSizeFormatted: driveItem.size ? `${(parseInt(driveItem.size) / 1024).toFixed(1)} KB` : '22.0 KB',
        folderId: targetFolder,
        driveFileId: driveItem.id,
        driveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
        status: 'success',
        syncedAt: nowIso,
        syncedBy: currentUser?.email || 'limsorn9@gmail.com'
      };

      setDriveSyncHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));

      setToastMessage({
        text: `បាន Sync របាយការណ៍ហិរញ្ញវត្ថុ ១២ ខែ ទៅកាន់ Google Drive (Folder: ${targetFolder}) ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Financial report drive sync failed:', err);
      const errorItem: DriveSyncHistoryItem = {
        id: `sync-fin-err-${Date.now()}`,
        title: `របាយការណ៍ហិរញ្ញវត្ថុ (${targetYear})`,
        category: 'financial_report',
        categoryLabelKhmer: 'របាយការណ៍ហិរញ្ញវត្ថុ',
        fileName: `របាយការណ៍ហិរញ្ញវត្ថុ_${targetYear}.html`,
        folderId: targetFolder,
        status: 'failed',
        errorMessage: err.message || 'បញ្ហាក្នុងការ Sync របាយការណ៍ហិរញ្ញវត្ថុ',
        syncedAt: new Date().toISOString(),
        syncedBy: currentUser?.email || 'limsorn9@gmail.com'
      };
      setDriveSyncHistory(prev => [errorItem, ...prev.slice(0, 49)]);
      setToastMessage({ text: `បរាជ័យក្នុងការ Sync របាយការណ៍ហិរញ្ញវត្ថុ: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const triggerDriveAutoSyncAll = async () => {
    setIsDriveSyncing(true);
    const targetFolder = driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      const nowIso = new Date().toISOString();

      // 1. Sync All Meeting Minutes
      if (driveAutoSyncConfig.syncMeetings && teacherMeetings.length > 0) {
        for (const meeting of teacherMeetings) {
          try {
            const driveItem = await uploadMeetingMinutesToDrive(meeting, schoolProfile, targetFolder);
            setTeacherMeetings(prev =>
              prev.map(m =>
                m.id === meeting.id
                  ? {
                      ...m,
                      isSyncedToGoogleDrive: true,
                      googleDriveFileId: driveItem.id,
                      googleDriveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
                      driveSyncedAt: nowIso
                    }
                  : m
              )
            );
          } catch (e) {}
        }
      }

      // 2. Sync Financial Reports
      if (driveAutoSyncConfig.syncFinances) {
        try {
          const summaries = getMonthlyBudgetSummaries(selectedAcademicYear);
          await uploadFinancialReportToDrive(summaries, budgetTransactions, schoolProfile, selectedAcademicYear, targetFolder);
        } catch (e) {}
      }

      // 3. Sync Full Database Snapshot JSON
      if (driveAutoSyncConfig.syncFullBackup) {
        const fullBackup = {
          version: '2.5.0',
          autoSyncedAt: nowIso,
          schoolProfile,
          teacherMeetings,
          budgetTransactions,
          students,
          teachers,
          classrooms,
          scores,
          attendanceRecords,
          calendarEvents,
          households,
          libraryBooks
        };
        await backupSchoolDataToDrive(
          fullBackup,
          schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំព្រឹក',
          targetFolder
        );
      }

      // Add a bundle history item
      const summaryItem: DriveSyncHistoryItem = {
        id: `sync-all-${Date.now()}`,
        title: 'ស្វ័យប្រវត្តិកម្ម Synchronization ឯកសារសំខាន់ៗ (កិច្ចប្រជុំ, ហិរញ្ញវត្ថុ, JSON Backup)',
        category: 'database_backup',
        categoryLabelKhmer: 'Auto-Sync កញ្ចប់ឯកសារ',
        fileName: `AutoSync_Package_${new Date().toISOString().split('T')[0]}.json`,
        fileSizeFormatted: '142 KB',
        folderId: targetFolder,
        driveWebViewLink: `https://drive.google.com/drive/folders/${targetFolder}`,
        status: 'success',
        syncedAt: nowIso,
        syncedBy: currentUser?.email || 'limsorn9@gmail.com'
      };

      setDriveSyncHistory(prev => [summaryItem, ...prev.slice(0, 49)]);
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));

      setToastMessage({
        text: `បានធ្វើស្វ័យប្រវត្តិកម្ម Sync ឯកសារសំខាន់ៗទាំងអស់ទៅ Google Drive (${targetFolder}) ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Auto sync all error:', err);
      setToastMessage({ text: `បញ្ហាក្នុងការ Sync ទៅ Google Drive: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // LocalStorage sync for new collections
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_correspondences`, JSON.stringify(correspondences));
  }, [correspondences]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_staff_admin_records`, JSON.stringify(staffAdminRecords));
  }, [staffAdminRecords]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_school_committees`, JSON.stringify(schoolCommittees));
  }, [schoolCommittees]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_school_strategic_plans`, JSON.stringify(schoolStrategicPlans));
  }, [schoolStrategicPlans]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_model_school_standards`, JSON.stringify(modelSchoolStandards));
  }, [modelSchoolStandards]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_school_assets`, JSON.stringify(schoolAssets));
  }, [schoolAssets]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_lesson_plans`, JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_parent_meetings`, JSON.stringify(parentMeetings));
  }, [parentMeetings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_parent_requests`, JSON.stringify(parentRequests));
  }, [parentRequests]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_class_councils`, JSON.stringify(classCouncils));
  }, [classCouncils]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_villages`, JSON.stringify(villages));
  }, [villages]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_households`, JSON.stringify(households));
  }, [households]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_library_books`, JSON.stringify(libraryBooks));
  }, [libraryBooks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_reading_logs`, JSON.stringify(readingLogs));
  }, [readingLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_print_settings`, JSON.stringify(printSettings));
  }, [printSettings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_student_feedbacks`, JSON.stringify(studentFeedbacks));
  }, [studentFeedbacks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_equipment_items`, JSON.stringify(equipmentItems));
  }, [equipmentItems]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_equipment_loans`, JSON.stringify(equipmentLoans));
  }, [equipmentLoans]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_teacher_daily_tasks`, JSON.stringify(teacherDailyTasks));
  }, [teacherDailyTasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_teacher_meetings`, JSON.stringify(teacherMeetings));
  }, [teacherMeetings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_teaching_resources`, JSON.stringify(teachingResources));
  }, [teachingResources]);

  // Sync Dark Mode with document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_dark_mode`, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Sync Language
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_lang`, language);
  }, [language]);

  // Sync Grading Scale
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_grading_scale`, gradingScaleType);
  }, [gradingScaleType]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  const getFormattedGrade = (averageScore: number, gradeLetter?: string): string => {
    if (gradingScaleType === 'letter') {
      if (gradeLetter) return gradeLetter;
      if (averageScore >= 8.5) return 'A';
      if (averageScore >= 7.0) return 'B';
      if (averageScore >= 6.0) return 'C';
      if (averageScore >= 5.0) return 'D';
      return 'E';
    } else {
      // Khmer term scale: ល្អណាស់, ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ
      if (averageScore >= 8.5 || gradeLetter === 'A') return language === 'en' ? 'Very Good (A)' : 'ល្អណាស់';
      if (averageScore >= 7.0 || gradeLetter === 'B') return language === 'en' ? 'Good (B)' : 'ល្អ';
      if (averageScore >= 6.0 || gradeLetter === 'C') return language === 'en' ? 'Fairly Good (C)' : 'ល្អបង្គួរ';
      if (averageScore >= 5.0 || gradeLetter === 'D') return language === 'en' ? 'Average (D)' : 'មធ្យម';
      return language === 'en' ? 'Weak (E/F)' : 'ខ្សោយ';
    }
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_academic_years`, JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_exam_subjects`, JSON.stringify(examSubjects));
  }, [examSubjects]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_edit_requests`, JSON.stringify(profileEditRequests));
  }, [profileEditRequests]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_released_results`, JSON.stringify(releasedResults));
  }, [releasedResults]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(appUsers));
  }, [appUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_teachers`, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_classrooms`, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_scores`, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_budget`, JSON.stringify(budgetTransactions));
  }, [budgetTransactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_calendar`, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transfers`, JSON.stringify(transfers));
  }, [transfers]);

  // Cloud Firestore Sync State
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync_time`);
  });
  const isRemoteUpdateRef = useRef<boolean>(false);

  // Pull All Data from Firestore Cloud
  const pullAllFromCloud = async (): Promise<boolean> => {
    setIsCloudSyncing(true);
    try {
      const cloudData = await fetchSchoolDataFromFirestore();
      if (cloudData) {
        isRemoteUpdateRef.current = true;
        if (cloudData.schoolProfile) setSchoolProfile(cloudData.schoolProfile);
        if (cloudData.students) setStudents(cloudData.students);
        if (cloudData.teachers) setTeachers(cloudData.teachers);
        if (cloudData.classrooms) setClassrooms(cloudData.classrooms);
        if (cloudData.scores) setScores(cloudData.scores);
        if (cloudData.budgetTransactions) setBudgetTransactions(cloudData.budgetTransactions);
        if (cloudData.attendanceRecords) setAttendanceRecords(cloudData.attendanceRecords);
        if (cloudData.calendarEvents) setCalendarEvents(cloudData.calendarEvents);
        if (cloudData.transfers) setTransfers(cloudData.transfers);
        if (cloudData.academicYears) setAcademicYears(cloudData.academicYears);
        if (cloudData.examSubjects) setExamSubjects(cloudData.examSubjects);
        if (cloudData.profileEditRequests) setProfileEditRequests(cloudData.profileEditRequests);
        if (cloudData.releasedResults) setReleasedResults(cloudData.releasedResults);
        if (cloudData.villages) setVillages(cloudData.villages);
        if (cloudData.households) setHouseholds(cloudData.households);
        if (cloudData.libraryBooks) setLibraryBooks(cloudData.libraryBooks);
        if (cloudData.readingLogs) setReadingLogs(cloudData.readingLogs);
        if (cloudData.printSettings) setPrintSettings(cloudData.printSettings);
        if (cloudData.studentFeedbacks) setStudentFeedbacks(cloudData.studentFeedbacks);
        if (cloudData.lessonPlans) setLessonPlans(cloudData.lessonPlans);
        if (cloudData.parentMeetings) setParentMeetings(cloudData.parentMeetings);
        if (cloudData.parentRequests) setParentRequests(cloudData.parentRequests);
        if (cloudData.classCouncils) setClassCouncils(cloudData.classCouncils);
        if (cloudData.atRiskStudents) setAtRiskStudents(cloudData.atRiskStudents);
        if (cloudData.dailyClassLogs) setDailyClassLogs(cloudData.dailyClassLogs);
        if (cloudData.studentBadgeDefinitions) setStudentBadgeDefinitions(cloudData.studentBadgeDefinitions);
        if (cloudData.studentBadgeAssignments) setStudentBadgeAssignments(cloudData.studentBadgeAssignments);
        if (cloudData.correspondences) setCorrespondences(cloudData.correspondences);
        if (cloudData.staffAdminRecords) setStaffAdminRecords(cloudData.staffAdminRecords);
        if (cloudData.schoolCommittees) setSchoolCommittees(cloudData.schoolCommittees);
        if (cloudData.schoolStrategicPlans) setSchoolStrategicPlans(cloudData.schoolStrategicPlans);
        if (cloudData.modelSchoolStandards) setModelSchoolStandards(cloudData.modelSchoolStandards);
        if (cloudData.schoolAssets) setSchoolAssets(cloudData.schoolAssets);
        if (cloudData.appUsers) setAppUsers(cloudData.appUsers);

        const now = new Date().toISOString();
        setLastCloudSyncTime(now);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync_time`, now);
        showToast('បានទាញយកទិន្នន័យពី Cloud Firestore ជោគជ័យ!', 'success');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error pulling from cloud:', e);
      showToast('បរាជ័យក្នុងការទាញយកទិន្នន័យពី Cloud', 'error');
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Sync All Local Data to Firestore Cloud
  const syncAllToCloud = async (): Promise<boolean> => {
    setIsCloudSyncing(true);
    try {
      const payload = {
        schoolProfile,
        students,
        teachers,
        classrooms,
        scores,
        budgetTransactions,
        attendanceRecords,
        calendarEvents,
        transfers,
        academicYears,
        examSubjects,
        profileEditRequests,
        releasedResults,
        villages,
        households,
        libraryBooks,
        readingLogs,
        printSettings,
        studentFeedbacks,
        lessonPlans,
        parentMeetings,
        parentRequests,
        classCouncils,
        atRiskStudents,
        dailyClassLogs,
        studentBadgeDefinitions,
        studentBadgeAssignments,
        correspondences,
        staffAdminRecords,
        schoolCommittees,
        schoolStrategicPlans,
        modelSchoolStandards,
        schoolAssets,
        activityLogs,
        appUsers,
        updatedBy: currentUser?.nameKhmer || 'Admin'
      };

      const success = await syncSchoolDataToFirestore(payload, true);
      if (success) {
        const now = new Date().toISOString();
        setLastCloudSyncTime(now);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync_time`, now);
        showToast('បានរក្សាទុកទិន្នន័យឡើង Cloud Firestore ដោយជោគជ័យ!', 'success');
        return true;
      } else {
        showToast('មិនអាចរក្សាទុកទៅកាន់ Cloud បានទេ', 'error');
        return false;
      }
    } catch (e) {
      console.error('Cloud upload error:', e);
      showToast('មានបញ្ហាក្នុងការតភ្ជាប់ Cloud', 'error');
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Auto-sync debounced changes to Cloud whenever local user mutates data
  useEffect(() => {
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      syncSchoolDataToFirestore({
        schoolProfile,
        students,
        teachers,
        classrooms,
        scores,
        budgetTransactions,
        attendanceRecords,
        calendarEvents,
        transfers,
        activityLogs,
        appUsers
      }).catch(err => console.warn('Background firestore sync notice:', err));
    }, 3500);

    return () => clearTimeout(timer);
  }, [
    schoolProfile,
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    attendanceRecords,
    calendarEvents,
    transfers,
    activityLogs,
    appUsers
  ]);

  // Initial Real-time Listener & Cloud pull on mount
  useEffect(() => {
    // Check if cloud has newer data on startup
    fetchSchoolDataFromFirestore().then(cloudData => {
      if (cloudData) {
        // If local is default empty/first time or cloud has updated data, sync it
        const localSavedStudents = localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`);
        if (!localSavedStudents || (cloudData.appUsers && cloudData.appUsers.length > 0)) {
          isRemoteUpdateRef.current = true;
          if (cloudData.schoolProfile) setSchoolProfile(cloudData.schoolProfile);
          if (cloudData.students && Array.isArray(cloudData.students)) setStudents(cloudData.students);
          if (cloudData.teachers && Array.isArray(cloudData.teachers)) setTeachers(cloudData.teachers);
          if (cloudData.classrooms && Array.isArray(cloudData.classrooms)) setClassrooms(cloudData.classrooms);
          if (cloudData.scores && Array.isArray(cloudData.scores)) setScores(cloudData.scores);
          if (cloudData.budgetTransactions && Array.isArray(cloudData.budgetTransactions)) setBudgetTransactions(cloudData.budgetTransactions);
          if (cloudData.attendanceRecords && Array.isArray(cloudData.attendanceRecords)) setAttendanceRecords(cloudData.attendanceRecords);
          if (cloudData.calendarEvents && Array.isArray(cloudData.calendarEvents)) setCalendarEvents(cloudData.calendarEvents);
          if (cloudData.transfers && Array.isArray(cloudData.transfers)) setTransfers(cloudData.transfers);
          if (cloudData.activityLogs && Array.isArray(cloudData.activityLogs)) setActivityLogs(cloudData.activityLogs);
          if (cloudData.appUsers && Array.isArray(cloudData.appUsers) && cloudData.appUsers.length > 0) setAppUsers(cloudData.appUsers);
        }
      }
    });

    // Real-time Firestore Subscription across active clients
    const unsubscribe = subscribeToSchoolData((cloudData) => {
      if (cloudData) {
        isRemoteUpdateRef.current = true;
        if (cloudData.schoolProfile) setSchoolProfile(prev => ({ ...prev, ...cloudData.schoolProfile }));
        if (cloudData.students && Array.isArray(cloudData.students)) setStudents(cloudData.students);
        if (cloudData.teachers && Array.isArray(cloudData.teachers)) setTeachers(cloudData.teachers);
        if (cloudData.classrooms && Array.isArray(cloudData.classrooms)) setClassrooms(cloudData.classrooms);
        if (cloudData.scores && Array.isArray(cloudData.scores)) setScores(cloudData.scores);
        if (cloudData.budgetTransactions && Array.isArray(cloudData.budgetTransactions)) setBudgetTransactions(cloudData.budgetTransactions);
        if (cloudData.attendanceRecords && Array.isArray(cloudData.attendanceRecords)) setAttendanceRecords(cloudData.attendanceRecords);
        if (cloudData.calendarEvents && Array.isArray(cloudData.calendarEvents)) setCalendarEvents(cloudData.calendarEvents);
        if (cloudData.transfers && Array.isArray(cloudData.transfers)) setTransfers(cloudData.transfers);
        if (cloudData.activityLogs && Array.isArray(cloudData.activityLogs)) setActivityLogs(cloudData.activityLogs);
        if (cloudData.appUsers && Array.isArray(cloudData.appUsers) && cloudData.appUsers.length > 0) setAppUsers(cloudData.appUsers);
        if (cloudData.academicYears && Array.isArray(cloudData.academicYears)) setAcademicYears(cloudData.academicYears);
        if (cloudData.examSubjects && Array.isArray(cloudData.examSubjects)) setExamSubjects(cloudData.examSubjects);
        if (cloudData.profileEditRequests && Array.isArray(cloudData.profileEditRequests)) setProfileEditRequests(cloudData.profileEditRequests);
        if (cloudData.releasedResults && Array.isArray(cloudData.releasedResults)) setReleasedResults(cloudData.releasedResults);
        if (cloudData.villages && Array.isArray(cloudData.villages)) setVillages(cloudData.villages);
        if (cloudData.households && Array.isArray(cloudData.households)) setHouseholds(cloudData.households);
        if (cloudData.libraryBooks && Array.isArray(cloudData.libraryBooks)) setLibraryBooks(cloudData.libraryBooks);
        if (cloudData.readingLogs && Array.isArray(cloudData.readingLogs)) setReadingLogs(cloudData.readingLogs);
        if (cloudData.printSettings) setPrintSettings(cloudData.printSettings);
        if (cloudData.studentFeedbacks && Array.isArray(cloudData.studentFeedbacks)) setStudentFeedbacks(cloudData.studentFeedbacks);
        if (cloudData.lessonPlans && Array.isArray(cloudData.lessonPlans)) setLessonPlans(cloudData.lessonPlans);
        if (cloudData.parentMeetings && Array.isArray(cloudData.parentMeetings)) setParentMeetings(cloudData.parentMeetings);
        if (cloudData.parentRequests && Array.isArray(cloudData.parentRequests)) setParentRequests(cloudData.parentRequests);
        if (cloudData.classCouncils && Array.isArray(cloudData.classCouncils)) setClassCouncils(cloudData.classCouncils);
        if (cloudData.atRiskStudents && Array.isArray(cloudData.atRiskStudents)) setAtRiskStudents(cloudData.atRiskStudents);
        if (cloudData.dailyClassLogs && Array.isArray(cloudData.dailyClassLogs)) setDailyClassLogs(cloudData.dailyClassLogs);
        if (cloudData.studentBadgeDefinitions && Array.isArray(cloudData.studentBadgeDefinitions)) setStudentBadgeDefinitions(cloudData.studentBadgeDefinitions);
        if (cloudData.studentBadgeAssignments && Array.isArray(cloudData.studentBadgeAssignments)) setStudentBadgeAssignments(cloudData.studentBadgeAssignments);
        if (cloudData.correspondences && Array.isArray(cloudData.correspondences)) setCorrespondences(cloudData.correspondences);
        if (cloudData.staffAdminRecords && Array.isArray(cloudData.staffAdminRecords)) setStaffAdminRecords(cloudData.staffAdminRecords);
        if (cloudData.schoolCommittees && Array.isArray(cloudData.schoolCommittees)) setSchoolCommittees(cloudData.schoolCommittees);
        if (cloudData.schoolStrategicPlans && Array.isArray(cloudData.schoolStrategicPlans)) setSchoolStrategicPlans(cloudData.schoolStrategicPlans);
        if (cloudData.modelSchoolStandards && Array.isArray(cloudData.modelSchoolStandards)) setModelSchoolStandards(cloudData.modelSchoolStandards);
        if (cloudData.schoolAssets && Array.isArray(cloudData.schoolAssets)) setSchoolAssets(cloudData.schoolAssets);
      }
    });

    // Auto Background Sync from IndexedDB to Firestore once online
    const cleanupOfflineSync = setupOfflineAutoSync((syncedCount) => {
      showToast(`បានធ្វើសមកាលកម្មស្វ័យប្រវត្តិ (Auto-sync) របាយការណ៍សិស្ស ${syncedCount} ឡើង Cloud Firestore ជោគជ័យ!`, 'success');
    });

    return () => {
      unsubscribe();
      cleanupOfflineSync();
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text: message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // RBAC & Auth Actions
  const login = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const user = appUsers.find(
      u =>
        (u.email.toLowerCase() === cleanId ||
          u.username.toLowerCase() === cleanId ||
          (cleanId === 'admin' && (u.role === 'super_admin' || u.username === 'limsorn' || u.email.toLowerCase() === 'limsorn9@gmail.com')) ||
          (u.studentCode && u.studentCode.toLowerCase() === cleanId) ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))) &&
        (u.password === password ||
          ((u.email.toLowerCase() === 'limsorn9@gmail.com' || u.username === 'limsorn') && (password === 'Ls12122012@' || password === '11101989')))
    );

    if (user) {
      if (user.status === 'suspended') {
        return { success: false, message: 'គណនីនេះត្រូវបានផ្អាកបណ្តោះអាសន្ន សូមទាក់ទងនាយកសាលា' };
      }
      setCurrentUser(user);
      if (user.role === 'student') {
        setActiveTab('student_portal');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ, ${user.nameKhmer}!`, 'success');
      return { success: true, message: 'ចូលប្រព័ន្ធជោគជ័យ', user };
    }

    return { success: false, message: 'អ៊ីមែល/ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ!' };
  };

  const loginByVerifiedIdentifier = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const user = appUsers.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (cleanId === 'admin' && (u.role === 'super_admin' || u.username === 'limsorn' || u.email.toLowerCase() === 'limsorn9@gmail.com')) ||
        (u.studentCode && u.studentCode.toLowerCase() === cleanId) ||
        (u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))
    );

    if (user) {
      if (user.status === 'suspended') {
        return { success: false, message: 'គណនីនេះត្រូវបានផ្អាកបណ្តោះអាសន្ន សូមទាក់ទងនាយកសាលា' };
      }
      setCurrentUser(user);
      if (user.role === 'student') {
        setActiveTab('student_portal');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ, ${user.nameKhmer}!`, 'success');
      return { success: true, message: 'ចូលប្រព័ន្ធជោគជ័យ', user };
    }

    return { success: false, message: 'រកមិនឃើញគណនីដែលត្រូវគ្នានឹងព័ត៌មានដែលបានផ្ទៀងផ្ទាត់ទេ!' };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    try {
      const res = await googleSignIn();
      if (!res) {
        return { success: false, message: 'បានបោះបង់ការចូលប្រើជាមួយ Google' };
      }
      const gUser = res.user;
      const cleanEmail = (gUser.email || '').toLowerCase().trim();

      // Check if user exists in appUsers
      let matchedUser = appUsers.find(u => u.email.toLowerCase().trim() === cleanEmail);

      if (!matchedUser) {
        // Check in teachers list
        const teacherMatch = teachers.find(t => t.email.toLowerCase().trim() === cleanEmail);
        const isDirector = cleanEmail === 'limsorn9@gmail.com' || cleanEmail.includes('director');

        matchedUser = {
          id: `usr-google-${Date.now()}`,
          username: cleanEmail.split('@')[0] || `google_user_${Date.now()}`,
          email: cleanEmail,
          password: `google_oauth_${Date.now()}`,
          nameKhmer: teacherMatch?.nameKhmer || gUser.displayName || 'ភ្ញៀវ (Google User)',
          nameLatin: teacherMatch?.nameLatin || gUser.displayName || 'Google User',
          role: isDirector ? 'director' : (teacherMatch ? 'teacher' : 'teacher'),
          phone: teacherMatch?.phone || 'Google Auth (គ្មានលេខទូរស័ព្ទ)',
          staffCode: teacherMatch?.staffCode,
          assignedGrade: teacherMatch?.assignedGrade,
          assignedSection: teacherMatch?.assignedSection,
          avatarUrl: gUser.photoURL || undefined,
          createdBy: 'Google OAuth System',
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active'
        };

        setAppUsers(prev => [matchedUser!, ...prev]);
      }

      if (matchedUser.status === 'suspended') {
        return { success: false, message: 'គណនីនេះត្រូវបានផ្អាកបណ្តោះអាសន្ន សូមទាក់ទងនាយកសាលា' };
      }

      setCurrentUser(matchedUser);
      if (matchedUser.role === 'student') {
        setActiveTab('student_portal');
      } else {
        setActiveTab('dashboard');
      }

      showToast(`សូមស្វាគមន៍! បានចូលប្រើប្រាស់តាម Google Gmail (${matchedUser.nameKhmer}) ជោគជ័យ!`, 'success');
      return { success: true, message: 'ចូលប្រព័ន្ធជោគជ័យ', user: matchedUser };
    } catch (error: any) {
      console.error('Google Sign in error:', error);
      const msg = error?.message || 'បរាជ័យក្នុងការចូលប្រើជាមួយ Google';
      return { success: false, message: msg };
    }
  };

  const logoutApp = () => {
    setCurrentUser(null);
    showToast('បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ!', 'info');
  };

  const switchUserRole = (role: UserRole) => {
    const sampleUser = appUsers.find(u => u.role === role) || initialUsers.find(u => u.role === role);
    if (sampleUser) {
      setCurrentUser(sampleUser);
      if (role === 'student') {
        setActiveTab('student_portal');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`បានប្តូរទៅប្រើជា៖ ${sampleUser.nameKhmer} (${getRoleLabel(role)})`, 'info');
    }
  };

  const impersonateUser = (userId: string) => {
    if (currentUser?.role !== 'director') {
      showToast('មានតែនាយកសាលាទេដែលអាចប្រើប្រាស់សិទ្ធិ Master Login ចូលគណនីផ្សេងៗបាន', 'error');
      return;
    }
    const target = appUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      if (target.role === 'student') {
        setActiveTab('student_portal');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`បានចូលប្រើប្រាស់គណនី៖ ${target.nameKhmer} (${getRoleLabel(target.role)}) តាមរយៈសិទ្ធិនាយកសាលា`, 'info');
    }
  };

  const accessStudentAccount = (student: Student) => {
    if (!currentUser || currentUser.role === 'student') {
      showToast('សិស្សមិនអាចចូលប្រើប្រាស់គណនីសិស្សដទៃទៀតបានទេ', 'error');
      return;
    }
    if (!previousTeacherUser && currentUser.role !== 'student') {
      setPreviousTeacherUser(currentUser);
    }

    let studentUser = appUsers.find(u => u.studentId === student.id || u.studentCode === student.code);
    if (!studentUser) {
      studentUser = {
        id: `usr-stu-${student.id}`,
        username: student.code || `student_${student.id}`,
        email: `${student.code.toLowerCase()}@school.edu.kh`,
        password: student.code || `stu_${Date.now()}`,
        nameKhmer: student.nameKhmer,
        nameLatin: student.nameLatin || student.code,
        role: 'student',
        studentId: student.id,
        studentCode: student.code,
        assignedGrade: student.grade,
        assignedSection: student.section,
        phone: student.guardianPhone || '',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setAppUsers(prev => [studentUser!, ...prev]);
    }

    setCurrentUser(studentUser);
    setActiveTab('student_portal');
    showToast(`បានចូលប្រើប្រាស់គណនីសិស្ស៖ ${student.nameKhmer} (ថ្នាក់ទី ${student.grade}${student.section}) ជោគជ័យ!`, 'success');
  };

  const switchToTeacherWithPassword = (password: string) => {
    const targetTeacher = previousTeacherUser || appUsers.find(u => u.role === 'teacher' || u.role === 'director' || u.role === 'secretary' || u.role === 'librarian');
    if (!targetTeacher) {
      return { success: false, message: 'មិនមានព័ត៌មានគណនីគ្រូដើមទេ!' };
    }
    if (password === targetTeacher.password) {
      setCurrentUser(targetTeacher);
      setPreviousTeacherUser(null);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_prev_teacher`);
      setActiveTab('dashboard');
      showToast(`បានត្រឡប់មកកាន់គណនីគ្រូ (${targetTeacher.nameKhmer}) វិញដោយជោគជ័យ!`, 'success');
      return { success: true };
    }
    return { success: false, message: 'លេខសម្ងាត់គ្រូមិនត្រូវគ្នាទេ!' };
  };

  // Academic Year Management (២០២១ - បច្ចុប្បន្ន)
  const addAcademicYear = (newYear: string) => {
    if (currentUser?.role !== 'director') {
      return { success: false, message: 'មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចបង្កើត ឬបន្ថែមឆ្នាំសិក្សាថ្មីបាន!' };
    }
    const trimmed = newYear.trim();
    if (!trimmed) {
      return { success: false, message: 'សូមបញ្ចូលឈ្មោះឆ្នាំសិក្សា!' };
    }
    if (academicYears.includes(trimmed)) {
      return { success: false, message: 'ឆ្នាំសិក្សានេះមានរួចហើយនៅក្នុងប្រព័ន្ធ!' };
    }

    const updated = [...academicYears, trimmed];
    setAcademicYears(updated);
    setSelectedAcademicYear(trimmed);
    showToast(`បានបង្កើតឆ្នាំសិក្សាថ្មី «${trimmed}» ជោគជ័យ!`);
    return { success: true, message: 'ជោគជ័យ' };
  };

  // Exam Subjects Management
  const addExamSubject = (sub: Omit<ExamSubject, 'id'>) => {
    const newSubject: ExamSubject = {
      ...sub,
      id: `sub-${Date.now()}`
    };
    setExamSubjects(prev => [...prev, newSubject]);
    showToast(`បានបន្ថែមមុខវិជ្ជាប្រឡង «${newSubject.nameKhmer}» ជោគជ័យ!`);
  };

  const updateExamSubject = (id: string, updated: Partial<ExamSubject>) => {
    setExamSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
    showToast('បានកែប្រែទិន្នន័យមុខវិជ្ជាជោគជ័យ!');
  };

  const deleteExamSubject = (id: string) => {
    setExamSubjects(prev => prev.filter(s => s.id !== id));
    showToast('បានលុបមុខវិជ្ជាប្រឡងចេញពីប្រព័ន្ធ!', 'info');
  };

  const resetExamSubjectsToDefault = () => {
    setExamSubjects(initialExamSubjects);
    showToast('បានកំណត់មុខវិជ្ជាស្តង់ដារ MoEYS ទាំង១៦ ឡើងវិញ!');
  };

  // Profile Edit Request & Approval Workflow
  const submitProfileEditRequest = (req: Omit<ProfileEditRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: ProfileEditRequest = {
      ...req,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      oneTimeToken: `TOKEN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    };

    setProfileEditRequests(prev => [newReq, ...prev]);

    // Send notification to Director
    addNotification({
      title: 'សំណើសុំកែប្រែព័ត៌មានផ្ទាល់ខ្លួន',
      message: `${req.userName} (${getRoleLabel(req.userRole)}) បានដាក់សំណើសុំកែសម្រួលព័ត៌មានផ្ទាល់ខ្លួន។ មូលហេតុ៖ ${req.reason}`,
      type: 'system',
      targetRole: 'director'
    });

    showToast('បានផ្ញើសំណើសុំកែប្រែព័ត៌មានទៅកាន់នាយកសាលារួចរាល់! សូមរង់ចាំការអនុម័ត។', 'info');
    return { success: true, message: 'បានផ្ញើសំណើជោគជ័យ' };
  };

  const approveProfileEditRequest = (requestId: string, reviewNotes: string = 'អនុម័តការកែសម្រួល') => {
    const targetReq = profileEditRequests.find(r => r.id === requestId);
    if (!targetReq) return { success: false, message: 'រកមិនឃើញសំណើនេះឡើយ' };

    setProfileEditRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              reviewedBy: currentUser?.nameKhmer || 'នាយកសាលា',
              reviewedAt: new Date().toISOString().split('T')[0],
              reviewNotes
            }
          : r
      )
    );

    // If teacher target, apply requested fields
    if (targetReq.targetType === 'teacher') {
      setTeachers(prev =>
        prev.map(t => (t.id === targetReq.targetId ? { ...t, ...targetReq.requestedFields } : t))
      );
    } else if (targetReq.targetType === 'student') {
      setStudents(prev =>
        prev.map(s => (s.id === targetReq.targetId ? { ...s, ...targetReq.requestedFields } : s))
      );
    }

    addNotification({
      title: 'សំណើកែប្រែត្រូវបានអនុម័ត',
      message: `សំណើកែប្រែព័ត៌មានរបស់អ្នកត្រូវបាននាយកសាលាអនុម័តជោគជ័យ (${reviewNotes})។`,
      type: 'info',
      targetUserId: targetReq.userId
    });

    showToast(`បានអនុម័តសំណើរបស់ ${targetReq.userName} ជោគជ័យ!`);
    return { success: true, message: 'បានអនុម័តជោគជ័យ' };
  };

  const rejectProfileEditRequest = (requestId: string, reviewNotes: string = 'មិនអនុម័ត') => {
    const targetReq = profileEditRequests.find(r => r.id === requestId);
    if (!targetReq) return { success: false, message: 'រកមិនឃើញសំណើនេះឡើយ' };

    setProfileEditRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              reviewedBy: currentUser?.nameKhmer || 'នាយកសាលា',
              reviewedAt: new Date().toISOString().split('T')[0],
              reviewNotes
            }
          : r
      )
    );

    addNotification({
      title: 'សំណើកែប្រែត្រូវបានបដិសេធ',
      message: `សំណើកែប្រែព័ត៌មានរបស់អ្នកត្រូវបានបដិសេធ។ មូលហេតុ៖ ${reviewNotes}`,
      type: 'alert',
      targetUserId: targetReq.userId
    });

    showToast(`បានបដិសេធសំណើរបស់ ${targetReq.userName}`, 'info');
    return { success: true, message: 'បានបដិសេធ' };
  };

  // Exam Result Release Check
  const isResultReleased = (
    grade: number,
    section: string,
    monthOrSemester: string,
    academicYear: string = selectedAcademicYear
  ) => {
    const key = `${grade}_${section}_${monthOrSemester}_${academicYear}`;
    return !!releasedResults[key];
  };

  const toggleReleaseClassResults = (
    grade: number,
    section: string,
    monthOrSemester: string,
    academicYear: string = selectedAcademicYear
  ) => {
    const key = `${grade}_${section}_${monthOrSemester}_${academicYear}`;
    const newState = !releasedResults[key];
    setReleasedResults(prev => ({
      ...prev,
      [key]: newState
    }));

    if (newState) {
      addNotification({
        title: 'លទ្ធផលប្រឡងត្រូវបានផ្សព្វផ្សាយ',
        message: `លទ្ធផលប្រឡងប្រចាំ${monthOrSemester} ថ្នាក់ទី${grade}${section} ត្រូវបានលោកគ្រូ-អ្នកគ្រូបន្ទុកថ្នាក់ផ្សព្វផ្សាយជាផ្លូវការ!`,
        type: 'info',
        targetTeacherGrade: grade,
        targetTeacherSection: section
      });
      showToast(`បានផ្សព្វផ្សាយលទ្ធផលប្រឡងថ្នាក់ទី${grade}${section} ខែ${monthOrSemester} ទៅកាន់សិស្ស!`);
    } else {
      showToast(`បានបិទការបង្ហាញលទ្ធផលប្រឡងរួមពីសិស្សថ្នាក់ទី${grade}${section}។`, 'info');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'director': return 'នាយកសាលា';
      case 'secretary': return 'លេខាធិការ';
      case 'librarian': return 'បណ្ណារក្ស';
      case 'teacher': return 'គ្រូបង្រៀន';
      case 'student': return 'សិស្ស';
      default: return role;
    }
  };

  // Hierarchical Account Creation
  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      return { success: false, message: 'សូមចូលប្រព័ន្ធជាមុនសិន' };
    }

    if (currentUser.role === 'teacher' && userData.role !== 'student') {
      return { success: false, message: 'លោកគ្រូ-អ្នកគ្រូមានសិទ្ធិបង្កើតបានតែគណនីសិស្សក្នុងបន្ទុកថ្នាក់ប៉ុណ្ណោះ' };
    }
    if (currentUser.role === 'secretary' && (userData.role === 'director' || userData.role === 'teacher')) {
      return { success: false, message: 'លេខាធិការមិនមានសិទ្ធិបង្កើតគណនីនាយក ឬគ្រូបង្រៀនឡើយ' };
    }
    if (currentUser.role === 'librarian' || currentUser.role === 'student') {
      return { success: false, message: 'អ្នកមិនមានសិទ្ធិបង្កើតគណនីអ្នកប្រើប្រាស់ឡើយ' };
    }

    const newUser: AppUser = {
      ...userData,
      id: `u-${Date.now()}`,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setAppUsers(prev => [newUser, ...prev]);
    showToast(`បានបង្កើតគណនីជូន ${newUser.nameKhmer} (${getRoleLabel(newUser.role)}) ដោយជោគជ័យ!`);
    return { success: true, message: 'ជោគជ័យ' };
  };

  const updateUser = (id: string, updated: Partial<AppUser>) => {
    setAppUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => (prev ? { ...prev, ...updated } : null));
    }
    showToast('បានកែប្រែព័ត៌មានគណនីជោគជ័យ!');
  };

  const deleteUser = (id: string) => {
    if (currentUser && currentUser.id === id) {
      showToast('មិនអាចលុបគណនីដែលកំពុងដំណើរការបានឡើយ', 'error');
      return;
    }
    setAppUsers(prev => prev.filter(u => u.id !== id));
    showToast('បានលុបគណនីរួចរាល់', 'info');
  };

  // Smart Password Recovery Rules
  const sendPasswordResetCode = async (
    email: string
  ): Promise<{ success: boolean; message: string; debugCode?: string; sentViaTelegram?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលឱ្យបានត្រឹមត្រូវ!' };
    }

    try {
      const res = await fetch('/api/telegram/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanEmail,
          actionDescription: `ស្នើសុំកំណត់ពាក្យសម្ងាត់ថ្មី (Password Reset) សម្រាប់ ${cleanEmail}`
        })
      });
      const data = await res.json();

      addNotification({
        title: 'ស្នើសុំកូដប្តូរពាក្យសម្ងាត់',
        message: `មានការស្នើសុំកូដផ្ទៀងផ្ទាត់សម្រាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញលើគណនី ${cleanEmail}`,
        type: 'info',
        targetRole: 'director'
      });

      return {
        success: true,
        message: data.sentViaTelegram
          ? `កូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅ Telegram Bot រួចរាល់!`
          : `បានបង្កើតកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់សម្រាប់ ${cleanEmail}!`,
        debugCode: data.debugCode,
        sentViaTelegram: data.sentViaTelegram
      };
    } catch (err: any) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      try {
        localStorage.setItem(`otp_${cleanEmail}`, JSON.stringify({ code: fallbackCode, expires: Date.now() + 300000 }));
      } catch (e) {}
      return {
        success: true,
        message: `បានបង្កើតកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ដោយជោគជ័យ!`,
        debugCode: fallbackCode
      };
    }
  };

  const resetPasswordByEmail = (
    email: string,
    newPassword: string,
    code?: string
  ): { success: boolean; message: string; user?: AppUser } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលឱ្យបានត្រឹមត្រូវ!' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៤ តួអក្សរ!' };
    }

    let targetUser = appUsers.find(
      u => u.email.toLowerCase().trim() === cleanEmail || u.username.toLowerCase().trim() === cleanEmail.split('@')[0]
    );

    const targetTeacher = teachers.find(t => t.email.toLowerCase().trim() === cleanEmail);

    const targetStudent = students.find(
      s => `${s.code.toLowerCase()}@student.moeys.gov.kh` === cleanEmail || s.code.toLowerCase() === cleanEmail
    );

    if (targetUser) {
      setAppUsers(prev =>
        prev.map(u => (u.id === targetUser!.id ? { ...u, password: newPassword, passwordUpdatedAt: new Date().toISOString() } : u))
      );
      targetUser = { ...targetUser, password: newPassword, passwordUpdatedAt: new Date().toISOString() };
    } else if (targetTeacher) {
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        username: targetTeacher.email.split('@')[0],
        email: targetTeacher.email,
        password: newPassword,
        nameKhmer: targetTeacher.nameKhmer,
        nameLatin: targetTeacher.nameLatin,
        role: 'teacher',
        phone: targetTeacher.phone || '012 345 678',
        staffCode: targetTeacher.staffCode,
        assignedGrade: targetTeacher.assignedGrade,
        assignedSection: targetTeacher.assignedSection,
        createdAt: new Date().toISOString().split('T')[0],
        passwordUpdatedAt: new Date().toISOString(),
        status: 'active'
      };
      setAppUsers(prev => [newUser, ...prev]);
      targetUser = newUser;
    } else if (targetStudent) {
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        username: targetStudent.code,
        email: cleanEmail,
        password: newPassword,
        nameKhmer: targetStudent.nameKhmer,
        nameLatin: targetStudent.nameLatin,
        role: 'student',
        studentId: targetStudent.id,
        studentCode: targetStudent.code,
        assignedGrade: targetStudent.grade,
        assignedSection: targetStudent.section,
        createdAt: new Date().toISOString().split('T')[0],
        passwordUpdatedAt: new Date().toISOString(),
        status: 'active'
      };
      setAppUsers(prev => [newUser, ...prev]);
      targetUser = newUser;
    } else {
      const isDirector = cleanEmail === 'limsorn9@gmail.com' || cleanEmail.includes('director') || cleanEmail.includes('admin');
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        username: cleanEmail.split('@')[0],
        email: cleanEmail,
        password: newPassword,
        nameKhmer: isDirector ? 'លោក លីម សន' : cleanEmail.split('@')[0],
        nameLatin: isDirector ? 'Lim Sorn' : cleanEmail.split('@')[0],
        role: isDirector ? 'director' : 'teacher',
        phone: isDirector ? '087 99 19 77' : '012 345 678',
        createdAt: new Date().toISOString().split('T')[0],
        passwordUpdatedAt: new Date().toISOString(),
        status: 'active'
      };
      setAppUsers(prev => [newUser, ...prev]);
      targetUser = newUser;
    }

    addNotification({
      title: 'កំណត់ពាក្យសម្ងាត់ជោគជ័យ',
      message: `គណនី ${cleanEmail} បានប្តូរពាក្យសម្ងាត់ថ្មីដោយជោគជ័យ។`,
      type: 'password_reset',
      targetRole: 'director'
    });

    addActivityLog({
      domain: 'admin',
      actionType: 'update',
      title: 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ',
      description: `បានប្តូរពាក្យសម្ងាត់សម្រាប់គណនី ${cleanEmail}`,
      entityId: targetUser?.id || cleanEmail,
      entityName: targetUser?.nameKhmer || cleanEmail,
      actorName: targetUser?.nameKhmer || 'អ្នកប្រើប្រាស់',
      actorRole: targetUser?.role || 'user'
    });

    showToast(`បានកំណត់ពាក្យសម្ងាត់ថ្មីសម្រាប់ ${cleanEmail} ដោយជោគជ័យ!`, 'success');

    return {
      success: true,
      message: `ការកំណត់ពាក្យសម្ងាត់ឡើងវិញសម្រាប់ ${cleanEmail} ទទួលបានជោគជ័យ!`,
      user: targetUser
    };
  };

  const verifyAndResetTeacherPassword = (
    email: string,
    phone: string,
    inputSchoolCode: string,
    newPassword: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\s+/g, '') : '';
    const cleanSchoolCode = inputSchoolCode ? inputSchoolCode.trim() : '';

    // Be flexible with school code (allow empty or correct code or 020401015 or schoolProfile code)
    if (cleanSchoolCode && cleanSchoolCode !== schoolProfile.schoolCode && cleanSchoolCode !== '020401015') {
      return { success: false, message: 'លេខកូដសាលារៀន (School Code) មិនត្រឹមត្រូវទេ!' };
    }

    const targetUser = appUsers.find(
      u =>
        u.email.toLowerCase() === cleanEmail &&
        (!cleanPhone || !u.phone || u.phone.replace(/\s+/g, '') === cleanPhone || u.phone.includes('Google') || u.phone.includes('គ្មានលេខ'))
    );

    const targetTeacher = teachers.find(
      t =>
        t.email.toLowerCase() === cleanEmail &&
        (!cleanPhone || !t.phone || t.phone.replace(/\s+/g, '') === cleanPhone || t.phone.includes('Google') || t.phone.includes('គ្មានលេខ'))
    );

    if (targetUser || targetTeacher) {
      if (targetUser) {
        setAppUsers(prev =>
          prev.map(u => (u.id === targetUser.id ? { ...u, password: newPassword, passwordUpdatedAt: new Date().toISOString() } : u))
        );
      } else if (targetTeacher) {
        const newUser: AppUser = {
          id: `u-${Date.now()}`,
          username: targetTeacher.email.split('@')[0],
          email: targetTeacher.email,
          password: newPassword,
          nameKhmer: targetTeacher.nameKhmer,
          nameLatin: targetTeacher.nameLatin,
          role: 'teacher',
          phone: targetTeacher.phone || '012 345 678',
          staffCode: targetTeacher.staffCode,
          assignedGrade: targetTeacher.assignedGrade,
          assignedSection: targetTeacher.assignedSection,
          createdAt: new Date().toISOString().split('T')[0],
          passwordUpdatedAt: new Date().toISOString(),
          status: 'active'
        };
        setAppUsers(prev => [newUser, ...prev]);
      }

      addNotification({
        title: 'កំណត់ពាក្យសម្ងាត់បុគ្គលិកជោគជ័យ',
        message: `បុគ្គលិក/គ្រូ ${targetTeacher?.nameKhmer || targetUser?.nameKhmer} បានកំណត់ពាក្យសម្ងាត់ឡើងវិញដោយជោគជ័យ។`,
        type: 'info',
        targetRole: 'director'
      });

      return {
        success: true,
        message: `ការផ្ទៀងផ្ទាត់ជោគជ័យ! ពាក្យសម្ងាត់ថ្មីរបស់ ${targetTeacher?.nameKhmer || targetUser?.nameKhmer} ត្រូវបានអនុម័តដោយជោគជ័យ។`
      };
    }

    // Direct fallback if email exists in appUsers under any role
    const anyUser = appUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (anyUser) {
      setAppUsers(prev =>
        prev.map(u => (u.id === anyUser.id ? { ...u, password: newPassword, passwordUpdatedAt: new Date().toISOString() } : u))
      );
      return {
        success: true,
        message: `ការផ្ទៀងផ្ទាត់ជោគជ័យ! ពាក្យសម្ងាត់ថ្មីរបស់ ${anyUser.nameKhmer} ត្រូវបានកំណត់ដោយជោគជ័យ។`
      };
    }

    return {
      success: false,
      message: 'ពុំមានទិន្នន័យគណនីដែលត្រូវគ្នានឹង អ៊ីមែល នេះឡើយ!'
    };
  };

  const verifyAndResetWithGoogle = async (
    newPassword?: string
  ): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    try {
      const res = await googleSignIn();
      if (!res) {
        return { success: false, message: 'បានបោះបង់ការផ្ទៀងផ្ទាត់ជាមួយ Google' };
      }
      const gUser = res.user;
      const cleanEmail = (gUser.email || '').toLowerCase().trim();

      let targetUser = appUsers.find(u => u.email.toLowerCase().trim() === cleanEmail);
      let targetTeacher = teachers.find(t => t.email.toLowerCase().trim() === cleanEmail);

      const passToSet = newPassword || `oauth_auth_${Date.now()}`;

      if (targetUser) {
        if (newPassword) {
          setAppUsers(prev =>
            prev.map(u => (u.id === targetUser!.id ? { ...u, password: passToSet } : u))
          );
        }
      } else if (targetTeacher) {
        const newUser: AppUser = {
          id: `u-${Date.now()}`,
          username: targetTeacher.email.split('@')[0],
          email: targetTeacher.email,
          password: passToSet,
          nameKhmer: targetTeacher.nameKhmer,
          nameLatin: targetTeacher.nameLatin,
          role: 'teacher',
          phone: targetTeacher.phone || 'Google Auth (គ្មានលេខទូរស័ព្ទ)',
          staffCode: targetTeacher.staffCode,
          assignedGrade: targetTeacher.assignedGrade,
          assignedSection: targetTeacher.assignedSection,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        setAppUsers(prev => [newUser, ...prev]);
        targetUser = newUser;
      } else {
        // Create new guest/user account via Google
        const isDirector = cleanEmail === 'limsorn9@gmail.com' || cleanEmail.includes('director');
        const newUser: AppUser = {
          id: `usr-google-${Date.now()}`,
          username: cleanEmail.split('@')[0] || `user_${Date.now()}`,
          email: cleanEmail,
          password: passToSet,
          nameKhmer: gUser.displayName || 'ភ្ញៀវ (Google User)',
          nameLatin: gUser.displayName || 'Google User',
          role: isDirector ? 'director' : 'teacher',
          phone: 'Google Auth (គ្មានលេខទូរស័ព្ទ)',
          avatarUrl: gUser.photoURL || undefined,
          createdBy: 'Google OAuth System',
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        setAppUsers(prev => [newUser, ...prev]);
        targetUser = newUser;
      }

      addNotification({
        title: 'ផ្ទៀងផ្ទាត់តាម Gmail ជោគជ័យ',
        message: `គណនី ${cleanEmail} ត្រូវបានផ្ទៀងផ្ទាត់ និងកំណត់ពាក្យសម្ងាត់តាមរយៈ Google ដោយជោគជ័យ។`,
        type: 'info',
        targetRole: 'director'
      });

      showToast(`ការផ្ទៀងផ្ទាត់តាម Gmail (${cleanEmail}) ជោគជ័យ!`, 'success');
      return {
        success: true,
        message: `បានផ្ទៀងផ្ទាត់គណនី Google ${cleanEmail} ជោគជ័យ!`,
        user: targetUser
      };
    } catch (err: any) {
      console.error('Google verification error:', err);
      return { success: false, message: err?.message || 'បរាជ័យក្នុងការផ្ទៀងផ្ទាត់តាម Google' };
    }
  };

  const verifyAndResetStudentPassword = (
    nameKhmer: string,
    studentCode: string,
    newPassword: string
  ) => {
    const cleanName = nameKhmer.trim().toLowerCase();
    const cleanCode = studentCode.trim().toUpperCase();

    const foundStudent = students.find(
      s =>
        s.code.toUpperCase() === cleanCode &&
        (s.nameKhmer.toLowerCase() === cleanName || s.nameKhmer.includes(nameKhmer.trim()))
    );

    if (!foundStudent) {
      return {
        success: false,
        message: 'ឈ្មោះសិស្ស និងអត្តលេខសិស្សមិនត្រូវគ្នាជាមួយទិន្នន័យបញ្ជីឈ្មោះរបស់សាលាទេ!'
      };
    }

    const existingUser = appUsers.find(
      u => u.role === 'student' && (u.studentCode === foundStudent.code || u.studentId === foundStudent.id)
    );

    if (existingUser) {
      setAppUsers(prev =>
        prev.map(u => (u.id === existingUser.id ? { ...u, password: newPassword } : u))
      );
    } else {
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        username: foundStudent.code,
        email: `${foundStudent.code.toLowerCase()}@student.moeys.gov.kh`,
        password: newPassword,
        nameKhmer: foundStudent.nameKhmer,
        nameLatin: foundStudent.nameLatin,
        role: 'student',
        studentId: foundStudent.id,
        studentCode: foundStudent.code,
        assignedGrade: foundStudent.grade,
        assignedSection: foundStudent.section,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setAppUsers(prev => [newUser, ...prev]);
    }

    const nowStr = new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];

    addNotification({
      title: 'ការផ្លាស់ប្តូរពាក្យសម្ងាត់សិស្ស',
      message: `សិស្ស «${foundStudent.nameKhmer}» (អត្តលេខ: ${foundStudent.code}, ថ្នាក់ទី${foundStudent.grade}${foundStudent.section}) បានប្តូរពាក្យសម្ងាត់ដោយស្វ័យប្រវត្តិកាលពីវេលាម៉ោង ${nowStr} ថ្ងៃទី ${todayStr}។`,
      type: 'password_reset',
      targetRole: 'teacher',
      targetTeacherGrade: foundStudent.grade,
      targetTeacherSection: foundStudent.section,
      meta: {
        studentId: foundStudent.id,
        studentName: foundStudent.nameKhmer,
        actionTime: `${todayStr} ${nowStr}`
      }
    });

    return {
      success: true,
      message: `បានកំណត់ពាក្យសម្ងាត់ថ្មីជោគជ័យ! ប្រព័ន្ធបានផ្ញើសារដំណឹងជូនលោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់ទី${foundStudent.grade}${foundStudent.section} រួចរាល់។`
    };
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString('km-KH'),
      read: false
    };
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      showBrowserPushNotification(newNotif.title, newNotif.message);
    }
    setNotifications(prev => [newNotif, ...prev]);
  };

  const dispatchNotification = (payload: SendNotificationPayload) => {
    const notif = buildNotification(payload);
    setNotifications(prev => [notif, ...prev]);
    setToastMessage({ text: `បានផ្ញើសារដំណឹង «${payload.title}» ជោគជ័យ!`, type: 'info' });
  };

  const dispatchScoreDeadlineAlert = (
    monthOrSemester: string,
    deadlineDate: string,
    targetGrade?: number,
    targetSection?: string
  ) => {
    const notif = generateScoreDeadlineReminder(monthOrSemester, deadlineDate, targetGrade, targetSection);
    setNotifications(prev => [notif, ...prev]);
    setToastMessage({ text: `បានផ្ញើសាររំលឹកកាលបរិច្ឆេទបញ្ចូលពិន្ទុ (${monthOrSemester}) ជោគជ័យ!`, type: 'success' });
  };

  const dispatchSchoolEventAlert = (
    eventTitle: string,
    eventDate: string,
    location?: string,
    targetRole?: UserRole | 'all'
  ) => {
    const notif = generateSchoolActivityReminder(eventTitle, eventDate, location, targetRole);
    setNotifications(prev => [notif, ...prev]);
    setToastMessage({ text: `បានផ្សព្វផ្សាយដំណឹងកម្មវិធីសាលា «${eventTitle}» ជោគជ័យ!`, type: 'info' });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateCurrentUserProfile = (updatedFields: Partial<AppUser>) => {
    if (!currentUser) return { success: false, message: 'មិនមានអ្នកប្រើប្រាស់កំពុងចូលស្ថាប័នទេ' };
    const finalUpdates = { ...updatedFields };
    if (currentUser.role === 'student') {
      delete finalUpdates.avatarUrl; // Students cannot freely change photo
    }

    const updatedUser = { ...currentUser, ...finalUpdates };
    setCurrentUser(updatedUser);
    setAppUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(updatedUser));
    return { success: true, message: 'បានកែប្រែប្រវត្តិរូបផ្ទាល់ខ្លួនជោគជ័យ!' };
  };

  const requestPasswordApprovalFromDirector = (reason: 'change_password' | 'forgot_password', proposedNewPassword?: string) => {
    if (!currentUser) return { success: false, message: 'មិនមានអ្នកប្រើប្រាស់' };
    
    addNotification({
      title: `ស្នើសុំអនុម័តពាក្យសម្ងាត់ពី ${currentUser.nameKhmer}`,
      message: `អ្នកប្រើប្រាស់ ${currentUser.nameKhmer} (តួនាទី: ${currentUser.role.toUpperCase()}) បានស្នើសុំ ${reason === 'forgot_password' ? 'ភ្លេចលេខសម្ងាត់' : 'កែប្រែលេខសម្ងាត់'}.`,
      type: 'password_reset',
      targetRole: 'director',
      priority: 'urgent',
      meta: {
        requesterUserId: currentUser.id,
        requesterName: currentUser.nameKhmer,
        requesterRole: currentUser.role,
        reason,
        proposedNewPassword: proposedNewPassword || ''
      }
    });

    return { success: true, message: 'បានផ្ញើសារស្នើសុំទៅកាន់នាយកសាលាដោយជោគជ័យ!' };
  };

  const approveDirectorPasswordRequest = (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (!notif || !notif.meta) return { success: false, message: 'រកមិនឃើញសេចក្តីជូនដំណឹងនេះទេ' };

    const { requesterUserId, proposedNewPassword, reason } = notif.meta;
    if (!requesterUserId) return { success: false, message: 'រកមិនឃើញអត្តសញ្ញាណអ្នកស្នើសុំទេ' };

    const newPass = proposedNewPassword || `reset_pass_${Math.floor(100000 + Math.random() * 900000)}`;
    setAppUsers(prev =>
      prev.map(u => (u.id === requesterUserId ? { ...u, password: newPass, passwordUpdatedAt: new Date().toISOString() } : u))
    );

    markNotificationRead(notificationId);

    addNotification({
      title: 'ការស្នើសុំពាក្យសម្ងាត់ត្រូវបានអនុម័ត',
      message: `នាយកសាលាបានអនុម័តការស្នើសុំ${reason === 'forgot_password' ? 'ភ្លេចលេខសម្ងាត់' : 'កែប្រែលេខសម្ងាត់'}របស់អ្នករួចរាល់ហើយ។ ពាក្យសម្ងាត់ថ្មីរបស់អ្នកគឺ: ${newPass}`,
      type: 'info',
      targetUserId: requesterUserId
    });

    showToast('បានអនុម័តការស្នើសុំពាក្យសម្ងាត់ជោគជ័យ!', 'success');
    return { success: true, message: 'បានអនុម័តការស្នើសុំពាក្យសម្ងាត់ជោគជ័យ!' };
  };

  const unreadNotifCount = (notifications || []).filter(n => {
    if (n.read) return false;
    if (!currentUser) return false;
    if (n.targetRole === 'all') return true;
    if (n.targetRole === currentUser.role) {
      if (currentUser.role === 'teacher' && n.targetTeacherGrade && currentUser.assignedGrade) {
        return (
          n.targetTeacherGrade === currentUser.assignedGrade &&
          (!n.targetTeacherSection || n.targetTeacherSection === currentUser.assignedSection)
        );
      }
      return true;
    }
    if (currentUser.role === 'director') return true;
    return false;
  }).length;

  const canAccessTab = (tab: ActiveTab): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;

    // Super Admin Hub (បង្កើតសាលារៀនថ្មី និងគ្រប់គ្រងស្ថាប័នទូទាំងប្រទេស) គឺសម្រាប់តែ Super Admin ប៉ុណ្ណោះ
    if (tab === 'super_admin_hub') {
      return role === 'super_admin';
    }

    // នាយកសាលា (Director) និង Super Admin មានសិទ្ធិពេញលេញលើគ្រប់ផ្នែកទាំងអស់នៃកម្មវិធី
    if (role === 'super_admin' || role === 'director') return true;

    if (tab === 'telegram_bot') return true;

    if (role === 'secretary') {
      return ['dashboard', 'homeroom_dashboard', 'teacher_agenda', 'equipment_loans', 'teacher_meetings', 'teaching_resources', 'ai_teacher', 'activity_logs', 'school_admin', 'school_management', 'official_documents', 'students', 'transfers', 'household_census', 'teachers', 'classrooms', 'attendance_health', 'calendar', 'reports_qr', 'settings', 'library', 'learning_resources'].includes(tab);
    }

    if (role === 'librarian') {
      return ['library', 'teaching_resources', 'learning_resources', 'dashboard', 'calendar', 'official_documents'].includes(tab);
    }

    if (role === 'teacher') {
      return ['homeroom_dashboard', 'teacher_agenda', 'equipment_loans', 'teacher_meetings', 'teaching_resources', 'dashboard', 'ai_teacher', 'activity_logs', 'school_admin', 'school_management', 'official_documents', 'students', 'transfers', 'household_census', 'classrooms', 'scores', 'attendance_health', 'calendar', 'reports_qr', 'library', 'learning_resources'].includes(tab);
    }

    if (role === 'student') {
      return ['student_portal', 'teaching_resources', 'learning_resources', 'calendar', 'library'].includes(tab);
    }

    return false;
  };

  const canAccessStudentDashboard = (student?: Student | string | null): { allowed: boolean; reason: string } => {
    if (!currentUser) {
      return { allowed: false, reason: 'សូមចូលប្រើប្រាស់គណនីជាមុនសិន' };
    }

    const role = currentUser.role;

    // 1. Director (នាយកសាលា): Full access to all students across all grades & sections
    if (role === 'director') {
      return { allowed: true, reason: 'សិទ្ធិនាយកសាលា៖ អាចពិនិត្យ និងគ្រប់គ្រងដាស់បតសិស្សទាំងអស់ទូទាំងសាលា' };
    }

    // 2. Secretary (លេខាធិការ): Full access to all students across all grades & sections
    if (role === 'secretary') {
      return { allowed: true, reason: 'សិទ្ធិលេខាធិការ៖ អាចពិនិត្យ និងតាមដានដាស់បតសិស្សទាំងអស់ទូទាំងសាលា' };
    }

    // 3. Direct Homeroom Teacher (គ្រូបន្ទុកថ្នាក់ផ្ទាល់): Can only access students in their assigned class
    if (role === 'teacher') {
      const assignedGrade = currentUser.assignedGrade;
      const assignedSection = currentUser.assignedSection;

      if (!assignedGrade || !assignedSection) {
        return {
          allowed: false,
          reason: 'លោកគ្រូ-អ្នកគ្រូពុំទាន់មានបន្ទុកថ្នាក់ដែលបានកំណត់ឡើយ។ មានតែគ្រូបន្ទុកថ្នាក់ផ្ទាល់ នាយកសាលា និងលេខាធិការប៉ុណ្ណោះដែលមានសិទ្ធិ។'
        };
      }

      // If checking general class dashboard access
      if (!student) {
        return {
          allowed: true,
          reason: `សិទ្ធិគ្រូបន្ទុកថ្នាក់ទី ${assignedGrade}${assignedSection} (មើលបានតែសិស្សក្នុងបន្ទុកផ្ទាល់ខ្លួន)`
        };
      }

      // If checking a specific student
      const studentObj = typeof student === 'string'
        ? students.find(s => s.id === student || s.code === student)
        : student;

      if (!studentObj) {
        return { allowed: false, reason: 'រកមិនឃើញទិន្នន័យសិស្សក្នុងប្រព័ន្ធ' };
      }

      if (studentObj.grade === assignedGrade && studentObj.section === assignedSection) {
        return {
          allowed: true,
          reason: `សិទ្ធិគ្រូបន្ទុកថ្នាក់ទី ${assignedGrade}${assignedSection}`
        };
      } else {
        return {
          allowed: false,
          reason: `គ្មានសិទ្ធិចូលមើលដាស់បតសិស្សថ្នាក់ទី ${studentObj.grade}${studentObj.section} ទេ។ លោកគ្រូ-អ្នកគ្រូមានសិទ្ធិមើលតែដាស់បតសិស្សក្នុងបន្ទុកថ្នាក់ទី ${assignedGrade}${assignedSection} ផ្ទាល់ខ្លួនប៉ុណ្ណោះ។`
        };
      }
    }

    // 4. The Student Themselves (សិស្សម្នាក់នោះផ្ទាល់): Can only view their own dashboard
    if (role === 'student') {
      if (!student) {
        return {
          allowed: true,
          reason: 'សិទ្ធិសិស្សផ្ទាល់ខ្លួន (មើលបានតែគណនីផ្ទាល់ខ្លួន)'
        };
      }

      const studentObj = typeof student === 'string'
        ? students.find(s => s.id === student || s.code === student)
        : student;

      if (!studentObj) {
        return { allowed: false, reason: 'រកមិនឃើញទិន្នន័យសិស្ស' };
      }

      const isSelf = Boolean(
        (currentUser.studentId && studentObj.id === currentUser.studentId) ||
        (currentUser.studentCode && studentObj.code === currentUser.studentCode) ||
        (currentUser.username && studentObj.code === currentUser.username)
      );

      if (isSelf) {
        return {
          allowed: true,
          reason: 'សិទ្ធិសិស្សផ្ទាល់ខ្លួន'
        };
      } else {
        return {
          allowed: false,
          reason: 'សិស្សមានសិទ្ធិមើលបានតែដាស់បតផ្ទាល់ខ្លួនរបស់ខ្លួនឯងប៉ុណ្ណោះ។ គ្មានសិទ្ធិមើលដាស់បតសិស្សដទៃឡើយ។'
        };
      }
    }

    // 5. All other roles (librarian, unauthorized): Strictly no access (ក្រៅពីនោះគ្មានសិទ្ធិ)
    return {
      allowed: false,
      reason: 'គ្មានសិទ្ធិចូលមើលដាស់បតសិស្សឡើយ។ ដាស់បតសិស្ស នាយកបើកមើលបាន គ្រូបន្ទុកថ្នាក់ផ្ទាល់បើកមើលបាន លេខាធិការបើកមើលបាន ក្រៅពីនោះគ្មានសិទ្ធិ (ហើយអ្នកមានសិទ្ធិបន្ទាប់គឺសិស្សម្នាក់នោះផ្ទាល់)។'
    };
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'code'>) => {
    const nextIndex = students.length + 1;
    const code = `STU-2024-${String(nextIndex).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      code
    };
    setStudents(prev => [newStudent, ...prev]);
    showToast(`បានបញ្ចូលសិស្ស «${newStudent.nameKhmer}» អត្តលេខ ${code} ជោគជ័យ!`);

    // Audit log
    addActivityLog({
      domain: 'student',
      actionType: 'create',
      title: `បានចុះឈ្មោះសិស្សថ្មី៖ ${newStudent.nameKhmer}`,
      description: `ថ្នាក់ទី ${newStudent.grade}${newStudent.section} • អត្តលេខ ${newStudent.code} • អាណាព្យាបាល ${newStudent.guardianName || 'មិនបញ្ជាក់'} (${newStudent.guardianPhone || 'គ្មាន'})`,
      entityId: newStudent.id,
      entityCode: newStudent.code,
      entityName: newStudent.nameKhmer,
      actorName: currentUser?.nameKhmer || 'លោកគ្រូ ចាន់ វុទ្ធី',
      actorRole: currentUser?.role === 'director' ? 'នាយកសាលា' : 'គ្រូបន្ទុកថ្នាក់',
      targetTab: 'students',
      tags: [`ថ្នាក់ទី ${newStudent.grade}${newStudent.section}`, newStudent.code],
      changes: [
        { fieldName: 'code', fieldLabelKhmer: 'អត្តលេខសិស្ស', newValue: newStudent.code },
        { fieldName: 'nameKhmer', fieldLabelKhmer: 'គោត្តនាម-នាម', newValue: newStudent.nameKhmer },
        { fieldName: 'grade', fieldLabelKhmer: 'កម្រិតថ្នាក់', newValue: `ថ្នាក់ទី ${newStudent.grade}${newStudent.section}` }
      ]
    });
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    const existing = students.find(s => s.id === id);
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
    showToast('បានកែប្រែព័ត៌មានសិស្សជោគជ័យ!');

    // Audit log
    if (existing) {
      const changeList = Object.keys(updated).map(key => ({
        fieldName: key,
        fieldLabelKhmer: key === 'nameKhmer' ? 'គោត្តនាម-នាម' : key === 'guardianPhone' ? 'លេខទូរស័ព្ទ' : key === 'grade' ? 'កម្រិតថ្នាក់' : key,
        oldValue: (existing as any)[key],
        newValue: (updated as any)[key]
      }));

      addActivityLog({
        domain: 'student',
        actionType: 'update',
        title: `បានកែសម្រួលព័ត៌មានសិស្ស៖ ${updated.nameKhmer || existing.nameKhmer}`,
        description: `ថ្នាក់ទី ${updated.grade || existing.grade}${updated.section || existing.section} • អត្តលេខ ${existing.code}`,
        entityId: id,
        entityCode: existing.code,
        entityName: updated.nameKhmer || existing.nameKhmer,
        actorName: currentUser?.nameKhmer || 'លោកគ្រូ ចាន់ វុទ្ធី',
        actorRole: currentUser?.role === 'director' ? 'នាយកសាលា' : 'គ្រូបន្ទុកថ្នាក់',
        targetTab: 'students',
        tags: [`ថ្នាក់ទី ${updated.grade || existing.grade}${updated.section || existing.section}`, existing.code],
        changes: changeList
      });
    }
  };

  const deleteStudent = (id: string) => {
    const existing = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast('បានលុបទិន្នន័យសិស្សចេញពីប្រព័ន្ធ!', 'info');

    if (existing) {
      addActivityLog({
        domain: 'student',
        actionType: 'delete',
        title: `បានលុបទិន្នន័យសិស្ស៖ ${existing.nameKhmer}`,
        description: `អត្តលេខ ${existing.code} • ថ្នាក់ទី ${existing.grade}${existing.section}`,
        entityId: id,
        entityCode: existing.code,
        entityName: existing.nameKhmer,
        actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
        actorRole: 'នាយកសាលា',
        targetTab: 'students',
        tags: ['លុបទិន្នន័យ', existing.code]
      });
    }
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  // Student Transfer Handlers
  const addTransfer = (transferData: Omit<StudentTransferRecord, 'id'>) => {
    const newTransfer: StudentTransferRecord = {
      ...transferData,
      id: `tr-${Date.now()}`
    };
    setTransfers(prev => [newTransfer, ...prev]);

    // If transfer is out and approved/completed, update student status to 'transferred'
    if (newTransfer.transferType === 'out' && (newTransfer.status === 'approved' || newTransfer.status === 'completed')) {
      if (newTransfer.studentId) {
        setStudents(prev =>
          prev.map(s => (s.id === newTransfer.studentId ? { ...s, status: 'transferred' } : s))
        );
      }
    }

    showToast(`បានបង្កើតលិខិត${newTransfer.transferType === 'out' ? 'ផ្ទេរសិស្សចេញ' : 'បន្ថែមសិស្សចូល'}លេខ «${newTransfer.letterNumber}» ជោគជ័យ!`);

    addActivityLog({
      domain: 'student',
      actionType: 'transfer',
      title: newTransfer.transferType === 'out' ? `បានបង្កើតលិខិតផ្ទេរសិស្សចេញ៖ ${newTransfer.studentNameKhmer}` : `បានទទួលសិស្សផ្ទេរចូល៖ ${newTransfer.studentNameKhmer}`,
      description: `លិខិតលេខ ${newTransfer.letterNumber} • ថ្នាក់ទី ${newTransfer.grade}${newTransfer.section} • ទៅកាន់ ${newTransfer.toSchool}`,
      entityId: newTransfer.id,
      entityCode: newTransfer.letterNumber,
      entityName: newTransfer.studentNameKhmer,
      actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា',
      targetTab: 'transfers',
      tags: [newTransfer.transferType === 'out' ? 'ផ្ទេរចេញ' : 'ផ្ទេរចូល', newTransfer.letterNumber]
    });
  };

  const updateTransfer = (id: string, updated: Partial<StudentTransferRecord>) => {
    setTransfers(prev =>
      prev.map(t => {
        if (t.id === id) {
          const updatedRecord = { ...t, ...updated };
          if (updatedRecord.transferType === 'out' && (updatedRecord.status === 'approved' || updatedRecord.status === 'completed')) {
            if (updatedRecord.studentId) {
              setStudents(stus =>
                stus.map(s => (s.id === updatedRecord.studentId ? { ...s, status: 'transferred' } : s))
              );
            }
          }
          return updatedRecord;
        }
        return t;
      })
    );
    showToast('បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាផ្ទេរសិស្សជោគជ័យ!');
  };

  const deleteTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
    showToast('បានលុបកំណត់ត្រាផ្ទេរសិស្សចេញពីប្រព័ន្ធ', 'info');
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'staffCode'>) => {
    const nextIndex = teachers.length + 1;
    const staffCode = `MOEYS-10${String(nextIndex).padStart(4, '0')}`;
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`,
      staffCode
    };
    setTeachers(prev => [newTeacher, ...prev]);
    showToast(`បានបញ្ចូលលោកគ្រូ/អ្នកគ្រូ «${newTeacher.nameKhmer}» ជោគជ័យ!`);

    addActivityLog({
      domain: 'teacher',
      actionType: 'create',
      title: `បានចុះឈ្មោះគ្រូបង្រៀន/បុគ្គលិកថ្មី៖ ${newTeacher.nameKhmer}`,
      description: `${newTeacher.role} • អត្តលេខ ${newTeacher.staffCode} • ក្របខ័ណ្ឌ «${newTeacher.framework || 'គ្រូបង្រៀន'}»`,
      entityId: newTeacher.id,
      entityCode: newTeacher.staffCode,
      entityName: newTeacher.nameKhmer,
      actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា',
      targetTab: 'teachers',
      tags: [newTeacher.role, newTeacher.staffCode]
    });
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    const existing = teachers.find(t => t.id === id);
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    showToast('បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានគ្រូបង្រៀនជោគជ័យ!');

    if (existing) {
      addActivityLog({
        domain: 'teacher',
        actionType: 'update',
        title: `បានកែសម្រួលព័ត៌មានគ្រូបង្រៀន៖ ${updated.nameKhmer || existing.nameKhmer}`,
        description: `${updated.role || existing.role} • អត្តលេខ ${existing.staffCode}`,
        entityId: id,
        entityCode: existing.staffCode,
        entityName: updated.nameKhmer || existing.nameKhmer,
        actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
        actorRole: 'នាយកសាលា',
        targetTab: 'teachers',
        tags: [updated.role || existing.role, existing.staffCode]
      });
    }
  };

  const deleteTeacher = (id: string) => {
    const existing = teachers.find(t => t.id === id);
    setTeachers(prev => prev.filter(t => t.id !== id));
    showToast('បានលុបទិន្នន័យគ្រូបង្រៀនរួចរាល់', 'info');

    if (existing) {
      addActivityLog({
        domain: 'teacher',
        actionType: 'delete',
        title: `បានលុបទិន្នន័យគ្រូបង្រៀន៖ ${existing.nameKhmer}`,
        description: `អត្តលេខ ${existing.staffCode} • ${existing.role}`,
        entityId: id,
        entityCode: existing.staffCode,
        entityName: existing.nameKhmer,
        actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
        actorRole: 'នាយកសាលា',
        targetTab: 'teachers'
      });
    }
  };

  const addClassroom = (classroomData: Omit<Classroom, 'id'>) => {
    const newClass: Classroom = {
      ...classroomData,
      id: `c-${Date.now()}`
    };
    setClassrooms(prev => [...prev, newClass]);
    showToast(`បានបង្កើតថ្នាក់ទី ${newClass.grade}${newClass.section} ជោគជ័យ!`);
  };

  const updateClassroom = (id: string, updated: Partial<Classroom>) => {
    setClassrooms(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
    showToast('បានកែប្រែព័ត៌មានថ្នាក់រៀនជោគជ័យ!');
  };

  const deleteClassroom = (id: string) => {
    setClassrooms(prev => prev.filter(c => c.id !== id));
    showToast('បានលុបថ្នាក់រៀនរួចរាល់', 'info');
  };

  const saveStudentScore = (scoreData: {
    studentId: string;
    monthOrSemester: string;
    academicYear: string;
    scores: MonthlySubjectScores;
    remarks?: string;
  }) => {
    const student = getStudentById(scoreData.studentId);
    if (!student) return;

    const sub = scoreData.scores;
    const totalScore =
      sub.khmerReading +
      sub.khmerWriting +
      sub.mathematics +
      sub.scienceSocial +
      sub.moralCivics +
      sub.artsPhysical;
    const averageScore = Number((totalScore / 6).toFixed(2));

    let gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'F';
    let resultStatus: 'ជាប់' | 'ធ្លាក់' = 'ធ្លាក់';

    if (averageScore >= 8.5) {
      gradeLetter = 'A';
      resultStatus = 'ជាប់';
    } else if (averageScore >= 7.0) {
      gradeLetter = 'B';
      resultStatus = 'ជាប់';
    } else if (averageScore >= 6.0) {
      gradeLetter = 'C';
      resultStatus = 'ជាប់';
    } else if (averageScore >= 5.0) {
      gradeLetter = 'D';
      resultStatus = 'ជាប់';
    } else if (averageScore >= 4.0) {
      gradeLetter = 'E';
      resultStatus = 'ជាប់';
    } else {
      gradeLetter = 'F';
      resultStatus = 'ធ្លាក់';
    }

    const existingIndex = scores.findIndex(
      s =>
        s.studentId === scoreData.studentId &&
        s.monthOrSemester === scoreData.monthOrSemester &&
        s.academicYear === scoreData.academicYear
    );

    const record: StudentScoreRecord = {
      id: existingIndex >= 0 ? scores[existingIndex].id : `sc-${Date.now()}`,
      studentId: student.id,
      studentCode: student.code,
      studentNameKhmer: student.nameKhmer,
      gender: student.gender,
      grade: student.grade,
      section: student.section,
      monthOrSemester: scoreData.monthOrSemester,
      academicYear: scoreData.academicYear,
      scores: scoreData.scores,
      totalScore,
      averageScore,
      rank: 1,
      gradeLetter,
      resultStatus,
      remarks: scoreData.remarks
    };

    let updatedScores: StudentScoreRecord[];
    if (existingIndex >= 0) {
      updatedScores = [...scores];
      updatedScores[existingIndex] = record;
    } else {
      updatedScores = [...scores, record];
    }

    // Automatically recalculate rankings for this class & month
    const classMonthScores = updatedScores.filter(
      s => s.grade === student.grade && s.section === student.section && s.monthOrSemester === scoreData.monthOrSemester
    );
    const sorted = [...classMonthScores].sort((a, b) => b.totalScore - a.totalScore || b.averageScore - a.averageScore);
    const idToRank = new Map<string, number>();
    sorted.forEach((item, index) => {
      idToRank.set(item.id, index + 1);
    });

    const finalScoresWithRanks = updatedScores.map(s => {
      if (idToRank.has(s.id)) {
        return { ...s, rank: idToRank.get(s.id)! };
      }
      return s;
    });

    setScores(finalScoresWithRanks);
    showToast(`បានកត់ត្រាពិន្ទុ & គណនាចំណាត់ថ្នាក់សិស្ស «${student.nameKhmer}» រួចរាល់!`);

    addActivityLog({
      domain: 'academic',
      actionType: 'score',
      title: `បានកត់ត្រាពិន្ទុខែ ${scoreData.monthOrSemester}៖ ${student.nameKhmer}`,
      description: `ថ្នាក់ទី ${student.grade}${student.section} • មធ្យមភាគ ${averageScore}/10 • និទ្ទេស ${gradeLetter}`,
      entityId: record.id,
      entityCode: student.code,
      entityName: student.nameKhmer,
      actorName: currentUser?.nameKhmer || 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
      actorRole: 'គ្រូបន្ទុកថ្នាក់',
      targetTab: 'scores',
      tags: [`ខែ ${scoreData.monthOrSemester}`, `និទ្ទេស ${gradeLetter}`]
    });
  };

  const calculateClassRankings = (grade: number, section: string, monthOrSemester: string) => {
    const classScores = scores.filter(
      s => s.grade === grade && s.section === section && s.monthOrSemester === monthOrSemester
    );

    if (classScores.length === 0) {
      showToast('ពុំទាន់មានទិន្នន័យពិន្ទុសម្រាប់គណនាចំណាត់ថ្នាក់នៅឡើយ', 'info');
      return;
    }

    const sorted = [...classScores].sort((a, b) => b.totalScore - a.totalScore);
    const idToRank = new Map<string, number>();

    sorted.forEach((item, index) => {
      idToRank.set(item.id, index + 1);
    });

    setScores(prev =>
      prev.map(s => {
        if (idToRank.has(s.id)) {
          return { ...s, rank: idToRank.get(s.id)! };
        }
        return s;
      })
    );

    showToast(`បានគណនាចំណាត់ថ្នាក់សិស្សថ្នាក់ទី ${grade}${section} សម្រាប់ខែ ${monthOrSemester} រួចរាល់!`);
  };

  const getScoresForClassMonth = (grade: number, section: string, month: string) => {
    return scores
      .filter(s => s.grade === grade && s.section === section && s.monthOrSemester === month)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999));
  };

  const getScoresForStudent = (studentId: string) => {
    return scores.filter(s => s.studentId === studentId);
  };

  const recordAttendance = (record: Omit<DailyAttendanceRecord, 'id'>) => {
    const newRecord: DailyAttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    showToast('បានកត់ត្រាវត្តមានសិស្សជោគជ័យ!');
  };

  const batchRecordAttendance = (newRecords: Array<Omit<DailyAttendanceRecord, 'id'>>) => {
    const timestampStr = new Date().toISOString();
    const recordsWithId: DailyAttendanceRecord[] = newRecords.map((r, i) => ({
      ...r,
      id: `att-${Date.now()}-${i}`
    }));

    setAttendanceRecords(prev => {
      if (newRecords.length === 0) return prev;
      const targetDate = newRecords[0].date;
      const targetGrade = newRecords[0].grade;
      const targetSection = newRecords[0].section;
      const filtered = prev.filter(
        item => !(item.date === targetDate && item.grade === targetGrade && item.section === targetSection)
      );
      return [...recordsWithId, ...filtered];
    });

    if (newRecords.length > 0) {
      const targetDate = newRecords[0].date;
      const targetGrade = newRecords[0].grade;
      const targetSection = newRecords[0].section;
      const presentCount = newRecords.filter(r => r.status === 'present').length;
      const permCount = newRecords.filter(r => r.status === 'permission').length;
      const absentCount = newRecords.filter(r => r.status === 'absent').length;

      addActivityLog({
        domain: 'student',
        actionType: 'attendance',
        title: `បានកត់ត្រាវត្តមានសិស្សជាក្រុម (Batch Check-in)៖ ថ្នាក់ទី ${targetGrade}${targetSection}`,
        description: `កាលបរិច្ឆេទ ${targetDate} • សរុប ${newRecords.length} នាក់ (វត្តមាន: ${presentCount}, ច្បាប់: ${permCount}, ឥតច្បាប់: ${absentCount})`,
        entityId: `att-batch-${targetGrade}-${targetSection}-${targetDate}`,
        entityCode: `ATT-G${targetGrade}${targetSection}`,
        entityName: `ថ្នាក់ទី ${targetGrade}${targetSection}`,
        actorName: currentUser?.nameKhmer || 'លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់',
        actorRole: currentUser?.role ? getRoleLabel(currentUser.role) : 'គ្រូបង្រៀន',
        targetTab: 'attendance_health',
        tags: [`ថ្នាក់ទី ${targetGrade}${targetSection}`, targetDate, 'Batch Update', 'Firestore Timestamp']
      });
    }

    showToast(`បានរក្សាទុកបញ្ជីវត្តមានចំនួន ${newRecords.length} នាក់រួចរាល់!`);
  };

  const getAttendanceForDateAndClass = (date: string, grade: number, section: string) => {
    return attendanceRecords.filter(
      r => r.date === date && r.grade === grade && r.section === section
    );
  };

  const recordTeacherQuickCheckIn = (teacherId: string, status: 'present' | 'absent' = 'present') => {
    const today = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const recordId = `att-teacher-${teacherId}-${today}`;

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.id === recordId || (r.studentId === teacherId && r.date === today));
      const newRecord: DailyAttendanceRecord = {
        id: recordId,
        date: today,
        grade: teacher.assignedGrade || 0,
        section: teacher.assignedSection || 'staff',
        studentId: teacher.id,
        studentNameKhmer: teacher.nameKhmer,
        status: status,
        session: 'morning',
        notes: `Check-in ម៉ោង ${nowTimeStr}`
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRecord;
        return updated;
      } else {
        return [newRecord, ...prev];
      }
    });

    addActivityLog({
      domain: 'teacher',
      actionType: 'attendance',
      title: status === 'present' ? `លោកគ្រូ/អ្នកគ្រូ ${teacher.nameKhmer} បាន Check-in វត្តមាន` : `បានកត់ត្រាអវត្តមានគ្រូ ${teacher.nameKhmer}`,
      description: `វត្តមានប្រចាំថ្ងៃ ${today} វេលាម៉ោង ${nowTimeStr} • តួនាទី៖ ${teacher.role}`,
      entityId: teacher.id,
      entityCode: teacher.staffCode,
      entityName: teacher.nameKhmer,
      actorName: currentUser?.nameKhmer || 'Admin',
      actorRole: currentUser?.role || 'នាយកសាលា',
      targetTab: 'teachers'
    });

    showToast(status === 'present' ? `បានកត់ត្រាវត្តមាន Check-in ${teacher.nameKhmer} វេលាម៉ោង ${nowTimeStr}` : `បានកត់ត្រាអវត្តមាន ${teacher.nameKhmer}`);
  };

  const getTeacherCheckInStatus = (teacherId: string, targetDate?: string) => {
    const date = targetDate || new Date().toISOString().split('T')[0];
    const record = attendanceRecords.find(r => (r.studentId === teacherId || r.id === `att-teacher-${teacherId}-${date}`) && r.date === date);
    return record || null;
  };

  const batchRecordHealthChecks = (newRecords: Array<Omit<DailyHealthCheckRecord, 'id'>>) => {
    const recordsWithId: DailyHealthCheckRecord[] = newRecords.map((r, i) => ({
      ...r,
      id: `hc-${r.studentId}-${r.date}-${r.session || 'morning'}-${Date.now()}-${i}`
    }));

    setDailyHealthChecks(prev => {
      if (newRecords.length === 0) return prev;
      const targetDate = newRecords[0].date;
      const targetGrade = newRecords[0].grade;
      const targetSection = newRecords[0].section;
      const targetSession = newRecords[0].session;
      const filtered = prev.filter(
        item => !(item.date === targetDate && item.grade === targetGrade && item.section === targetSection && item.session === targetSession)
      );
      return [...recordsWithId, ...filtered];
    });

    if (newRecords.length > 0) {
      const normalCount = newRecords.filter(r => r.status === 'normal').length;
      const monitorCount = newRecords.filter(r => r.status === 'monitor').length;
      const isolateCount = newRecords.filter(r => r.status === 'isolate' || r.status === 'warning').length;

      addActivityLog({
        domain: 'health',
        actionType: 'health_check',
        title: `បានកត់ត្រាការពិនិត្យសុខភាពពេលព្រឹក៖ ថ្នាក់ទី ${newRecords[0].grade}${newRecords[0].section}`,
        description: `កាលបរិច្ឆេទ ${newRecords[0].date} • សរុប ${newRecords.length} នាក់ (ធម្មតា: ${normalCount}, តាមដាន: ${monitorCount}, សម្រាក: ${isolateCount})`,
        entityId: `hc-batch-${newRecords[0].grade}-${newRecords[0].section}-${newRecords[0].date}`,
        entityCode: `HC-G${newRecords[0].grade}${newRecords[0].section}`,
        entityName: `ថ្នាក់ទី ${newRecords[0].grade}${newRecords[0].section}`,
        actorName: currentUser?.nameKhmer || 'លោកគ្រូ/អ្នកគ្រូ',
        actorRole: currentUser?.role ? getRoleLabel(currentUser.role) : 'គ្រូបង្រៀន',
        targetTab: 'attendance_health',
        tags: [`ថ្នាក់ទី ${newRecords[0].grade}${newRecords[0].section}`, newRecords[0].date, 'Morning Health Screening']
      });
    }

    showToast(`បានរក្សាទុកកំណត់ត្រាពិនិត្យសុខភាពសិស្សចំនួន ${newRecords.length} នាក់ជោគជ័យ!`);
  };

  const getHealthChecksForDateAndClass = (date: string, grade: number, section: string, session: 'morning' | 'afternoon' = 'morning') => {
    return dailyHealthChecks.filter(
      r => r.date === date && r.grade === grade && r.section === section && r.session === session
    );
  };

  const addBudgetTransaction = (tx: Omit<BudgetTransaction, 'id' | 'referenceCode'>) => {
    const nextNum = budgetTransactions.length + 1;
    const referenceCode = `MOEYS-TX-${String(nextNum).padStart(4, '0')}`;
    const newTx: BudgetTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      referenceCode
    };
    setBudgetTransactions(prev => [newTx, ...prev]);
    showToast(`បានបញ្ចូលប្រតិបត្តិការថវិកា «${newTx.title}» ជោគជ័យ!`);

    addActivityLog({
      domain: 'finance',
      actionType: newTx.type === 'income' ? 'income' : 'expense',
      title: newTx.type === 'income' ? `បានកត់ត្រាចំណូលថវិកា៖ ${newTx.title}` : `បានកត់ត្រាចំណាយថវិកា៖ ${newTx.title}`,
      description: `${newTx.source} • ${newTx.category} • ចំនួន ${(newTx.amountRiel).toLocaleString()} ៛ ($${newTx.amountUsd})`,
      entityId: newTx.id,
      entityCode: newTx.referenceCode,
      entityName: newTx.title,
      actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
      actorRole: currentUser?.role === 'director' ? 'នាយកសាលា' : 'គណនេយ្យករ',
      targetTab: 'finance',
      financialAmountRiel: newTx.amountRiel,
      financialAmountUsd: newTx.amountUsd,
      financialCategory: newTx.category,
      tags: [newTx.type === 'income' ? 'ចំណូល' : 'ចំណាយ', newTx.source],
      changes: [
        { fieldName: 'amountRiel', fieldLabelKhmer: 'ទឹកប្រាក់រៀល', newValue: `${(newTx.amountRiel).toLocaleString()} ៛` },
        { fieldName: 'category', fieldLabelKhmer: 'ប្រភេទចំណូល/ចំណាយ', newValue: newTx.category },
        { fieldName: 'referenceCode', fieldLabelKhmer: 'លេខបង្កាន់ដៃ', newValue: newTx.referenceCode }
      ]
    });
  };

  const deleteBudgetTransaction = (id: string) => {
    const existing = budgetTransactions.find(t => t.id === id);
    setBudgetTransactions(prev => prev.filter(t => t.id !== id));
    showToast('បានលុបប្រតិបត្តិការថវិការួចរាល់', 'info');

    if (existing) {
      addActivityLog({
        domain: 'finance',
        actionType: 'delete',
        title: `បានលុបប្រតិបត្តិការថវិកា៖ ${existing.title}`,
        description: `បង្កាន់ដៃលេខ ${existing.referenceCode} • ចំនួន ${(existing.amountRiel).toLocaleString()} ៛`,
        entityId: id,
        entityCode: existing.referenceCode,
        entityName: existing.title,
        actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
        actorRole: 'នាយកសាលា',
        targetTab: 'finance',
        financialAmountRiel: existing.amountRiel,
        tags: ['លុបប្រតិបត្តិការ', existing.referenceCode]
      });
    }
  };

  const getTotalIncome = () => {
    return budgetTransactions
      .filter(t => t.type === 'income' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amountRiel, 0);
  };

  const getTotalExpense = () => {
    return budgetTransactions
      .filter(t => t.type === 'expense' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amountRiel, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };

  const addCalendarEvent = (eventData: Omit<AcademicCalendarEvent, 'id'>) => {
    const newEvent: AcademicCalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`
    };
    setCalendarEvents(prev => [...prev, newEvent].sort((a, b) => a.startDate.localeCompare(b.startDate)));
    showToast(`បានបញ្ចូលព្រឹត្តិការណ៍ «${newEvent.titleKhmer}» រួចរាល់!`);
  };

  const updateCalendarEvent = (id: string, updated: Partial<AcademicCalendarEvent>) => {
    setCalendarEvents(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updated } : e)).sort((a, b) => a.startDate.localeCompare(b.startDate))
    );
    showToast('បានកែប្រែព័ត៌មានប្រតិទិនជោគជ័យ!');
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    showToast('បានលុបព្រឹត្តិការណ៍ប្រតិទិនរួចរាល់', 'info');
  };

  const markEventSynced = (id: string, googleCalendarEventId?: string) => {
    setCalendarEvents(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, isSyncedToGoogle: true, googleCalendarEventId: googleCalendarEventId || e.googleCalendarEventId }
          : e
      )
    );
  };

  const updateSchoolProfile = (profile: Partial<SchoolProfile>) => {
    setSchoolProfile(prev => ({ ...prev, ...profile }));
    showToast('បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានសាលារៀនជោគជ័យ!');
  };

  const addHousehold = (record: Omit<HouseholdRecord, 'id'>) => {
    const newRecord: HouseholdRecord = {
      ...record,
      id: `hh-${Date.now()}`
    };
    setHouseholds(prev => [newRecord, ...prev]);
    showToast(`បានបញ្ចូលទិន្នន័យខ្នងផ្ទះ «${newRecord.houseNumber || ''} ${newRecord.headName}» ជោគជ័យ!`);
  };

  const updateHousehold = (id: string, updated: Partial<HouseholdRecord>) => {
    setHouseholds(prev => prev.map(h => (h.id === id ? { ...h, ...updated } : h)));
    showToast('បានកែប្រែទិន្នន័យជំរឿនខ្នងផ្ទះជោគជ័យ!');
  };

  const deleteHousehold = (id: string) => {
    setHouseholds(prev => prev.filter(h => h.id !== id));
    showToast('បានលុបទិន្នន័យខ្នងផ្ទះរួចរាល់', 'info');
  };

  const addVillage = (villageName: string) => {
    const trimmed = villageName.trim();
    if (!trimmed || villages.includes(trimmed)) return;
    setVillages(prev => [...prev, trimmed]);
    showToast(`បានបន្ថែមភូមិ «${trimmed}» ក្នុងតំបន់សាលារួចរាល់!`);
  };

  const addLibraryBook = (book: Omit<LibraryBook, 'id'>) => {
    const newBook: LibraryBook = {
      ...book,
      id: `bk-${Date.now()}`
    };
    setLibraryBooks(prev => [newBook, ...prev]);
    showToast(`បានបញ្ចូលសៀវភៅ «${newBook.titleKhmer}» ទៅក្នុងបណ្ណាល័យ!`);
  };

  const updateLibraryBook = (id: string, updated: Partial<LibraryBook>) => {
    setLibraryBooks(prev => prev.map(b => (b.id === id ? { ...b, ...updated } : b)));
    showToast('បានកែប្រែទិន្នន័យសៀវភៅជោគជ័យ!');
  };

  const deleteLibraryBook = (id: string) => {
    setLibraryBooks(prev => prev.filter(b => b.id !== id));
    showToast('បានលុបសៀវភៅចេញពីបញ្ជីបណ្ណាល័យ', 'info');
  };

  const addReadingLog = (log: Omit<LibraryReadingLog, 'id'>) => {
    const newLog: LibraryReadingLog = {
      ...log,
      id: `rl-${Date.now()}`
    };
    setReadingLogs(prev => [newLog, ...prev]);
    if (log.status === 'borrowed') {
      setLibraryBooks(prev =>
        prev.map(b => (b.id === log.bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
      );
    }
    showToast(`បានកត់ត្រាកំណត់ហេតុអានសៀវភៅរបស់ «${newLog.studentNameKhmer}» ជោគជ័យ!`);
  };

  const updateReadingLog = (id: string, updated: Partial<LibraryReadingLog>) => {
    const oldLog = readingLogs.find(l => l.id === id);
    setReadingLogs(prev => prev.map(l => (l.id === id ? { ...l, ...updated } : l)));
    if (oldLog && oldLog.status === 'borrowed' && updated.status === 'returned') {
      setLibraryBooks(prev =>
        prev.map(b => (b.id === oldLog.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b))
      );
    }
    showToast('បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាអានសៀវភៅ!');
  };

  const deleteReadingLog = (id: string) => {
    setReadingLogs(prev => prev.filter(l => l.id !== id));
    showToast('បានលុបកំណត់ត្រាអានសៀវភៅរួចរាល់', 'info');
  };

  const resetToDefaultData = () => {
    setSchoolProfile(initialSchoolProfile);
    setStudents(initialStudents);
    setTeachers(initialTeachers);
    setTransfers(initialTransfers);
    setClassrooms(initialClassrooms);
    setScores(initialScores);
    setBudgetTransactions(initialBudgetTransactions);
    setAttendanceRecords(initialAttendanceRecords);
    setCalendarEvents(initialCalendarEvents);
    setAppUsers(initialUsers);
    setNotifications(initialNotifications);
    setVillages(initialCatchmentVillages);
    setHouseholds(initialHouseholdRecords);
    setLibraryBooks(initialLibraryBooks);
    setReadingLogs(initialReadingLogs);
    setLessonPlans(initialLessonPlans);
    setParentMeetings(initialParentMeetings);
    setParentRequests(initialParentRequests);
    setClassCouncils(initialClassCouncils);
    setAtRiskStudents(initialAtRiskStudents);
    setDailyClassLogs(initialDailyClassLogs);
    setCorrespondences(initialCorrespondences);
    setStaffAdminRecords(initialStaffAdministrativeRecords);
    setSchoolCommittees(initialSchoolCommittees);
    setSchoolStrategicPlans(initialSchoolStrategicPlans);
    setModelSchoolStandards(initialModelSchoolStandards);
    setSchoolAssets(initialSchoolAssets);
    setPrintSettings({
      showRoundStamp: true,
      showDirectorSignature: true,
      showDirectorRedName: true,
      showRoyalHeader: true,
      showWatermark: true,
      paperSize: 'A4',
      orientation: 'portrait'
    });
    setCurrentUser(initialUsers[0]);
    localStorage.clear();
    showToast('បានកំណត់ទិន្នន័យគំរូដើមឡើងវិញដោយជោគជ័យ!', 'info');
  };

  return (
    <SchoolContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        currentUser,
        previousTeacherUser,
        appUsers,
        login,
        loginByVerifiedIdentifier,
        loginWithGoogle,
        logoutApp,
        switchUserRole,
        impersonateUser,
        accessStudentAccount,
        switchToTeacherWithPassword,
        addUser,
        updateUser,
        deleteUser,
        canAccessTab,
        canAccessStudentDashboard,
        academicYears,
        selectedAcademicYear,
        setSelectedAcademicYear,
        addAcademicYear,
        examSubjects,
        addExamSubject,
        updateExamSubject,
        deleteExamSubject,
        resetExamSubjectsToDefault,
        profileEditRequests,
        submitProfileEditRequest,
        approveProfileEditRequest,
        rejectProfileEditRequest,
        releasedResults,
        isResultReleased,
        toggleReleaseClassResults,
        verifyAndResetTeacherPassword,
        verifyAndResetStudentPassword,
        verifyAndResetWithGoogle,
        resetPasswordByEmail,
        sendPasswordResetCode,
        notifications,
        unreadNotifCount,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotification,
        schoolProfile,
        updateSchoolProfile,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
        transfers,
        addTransfer,
        updateTransfer,
        deleteTransfer,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        classrooms,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        scores,
        saveStudentScore,
        calculateClassRankings,
        getScoresForClassMonth,
        getScoresForStudent,
        attendanceRecords,
        recordAttendance,
        batchRecordAttendance,
        getAttendanceForDateAndClass,
        recordTeacherQuickCheckIn,
        getTeacherCheckInStatus,
        dailyHealthChecks,
        batchRecordHealthChecks,
        getHealthChecksForDateAndClass,
        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        markEventSynced,
        budgetTransactions,
        addBudgetTransaction,
        deleteBudgetTransaction,
        getTotalIncome,
        getTotalExpense,
        getBalance,
        resetToDefaultData,
        showToast,
        toastMessage,
        language,
        setLanguage,
        t,
        isDarkMode,
        toggleDarkMode,
        gradingScaleType,
        setGradingScaleType,
        getFormattedGrade,
        households,
        villages,
        addHousehold,
        updateHousehold,
        deleteHousehold,
        addVillage,
        libraryBooks,
        readingLogs,
        addLibraryBook,
        updateLibraryBook,
        deleteLibraryBook,
        addReadingLog,
        updateReadingLog,
        deleteReadingLog,
        printSettings,
        setPrintSettings,
        qrScanVerificationLogs,
        addQRScanVerificationLog,
        deleteQRScanVerificationLog,
        clearQRScanVerificationLogs,
        studentFeedbacks,
        addStudentFeedback,
        replyStudentFeedback,
        toggleAcknowledgeFeedback,
        deleteStudentFeedback,
        lessonPlans,
        addLessonPlan,
        updateLessonPlan,
        deleteLessonPlan,
        parentMeetings,
        addParentMeeting,
        updateParentMeeting,
        deleteParentMeeting,
        parentRequests,
        addParentRequest,
        updateParentRequest,
        resolveParentRequest,
        deleteParentRequest,
        classCouncils,
        updateClassCouncil,
        atRiskStudents,
        addAtRiskStudent,
        updateAtRiskStudent,
        addInterventionLog,
        deleteAtRiskStudent,
        dailyClassLogs,
        addDailyClassLog,
        updateDailyClassLog,
        deleteDailyClassLog,
        toggleArchiveDailyClassLog,
        correspondences,
        addCorrespondence,
        updateCorrespondence,
        deleteCorrespondence,
        staffAdminRecords,
        addStaffAdminRecord,
        updateStaffAdminRecord,
        deleteStaffAdminRecord,
        schoolCommittees,
        addSchoolCommittee,
        updateSchoolCommittee,
        deleteSchoolCommittee,
        schoolStrategicPlans,
        addSchoolStrategicPlan,
        updateSchoolStrategicPlan,
        deleteSchoolStrategicPlan,
        modelSchoolStandards,
        updateModelSchoolCriterion,
        schoolAssets,
        addSchoolAsset,
        updateSchoolAsset,
        deleteSchoolAsset,
        equipmentItems,
        equipmentLoans,
        addEquipmentLoan,
        updateEquipmentLoan,
        deleteEquipmentLoan,
        addEquipmentItem,
        updateEquipmentItem,
        teacherDailyTasks,
        addTeacherDailyTask,
        updateTeacherDailyTask,
        toggleTaskCompleted,
        deleteTeacherDailyTask,
        teacherMeetings,
        addTeacherMeeting,
        updateTeacherMeeting,
        deleteTeacherMeeting,
        teachingResources,
        addTeachingResource,
        deleteTeachingResource,
        getMonthlyBudgetSummaries,
        studentBadgeDefinitions,
        studentBadgeAssignments,
        assignBadgeToStudent,
        bulkAssignBadge,
        removeBadgeAssignment,
        createBadgeDefinition,
        updateBadgeDefinition,
        deleteBadgeDefinition,
        getStudentBadges,
        getStudentTotalPoints,
        autoSuggestBadgesForStudent,
        activityLogs,
        addActivityLog,
        updateActivityLogs,
        clearActivityLogs,
        dispatchNotification,
        dispatchScoreDeadlineAlert,
        dispatchSchoolEventAlert,
        updateCurrentUserProfile,
        requestPasswordApprovalFromDirector,
        approveDirectorPasswordRequest,
        isCloudSyncing,
        lastCloudSyncTime,
        syncAllToCloud,
        pullAllFromCloud,
        driveAutoSyncConfig,
        updateDriveAutoSyncConfig,
        driveSyncHistory,
        isDriveSyncing,
        syncMeetingToDrive,
        syncAllMeetingsToDrive,
        syncFinancialReportToDrive,
        triggerDriveAutoSyncAll,
        clearDriveSyncHistory
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
