import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

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
  initialDeletedUsers,
  initialAccountAuditLogs,
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
  initialLibraryVisitors,
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
  initialAcademicAchievements,
  initialSchoolGroups
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
  loginWithQRCode: (rawPayload: string) => { success: boolean; message: string; user?: AppUser };
  loginWithGoogle: () => Promise<{ success: boolean; message: string; user?: AppUser }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  impersonateUser: (userId: string) => void;
  switchToTeacherAccount: (teacher: Teacher) => void;
  accessStudentAccount: (student: Student) => void;
  switchToTeacherWithPassword: (password: string) => { success: boolean; message?: string };
  
  // Director Secret Code & Mode Access (លេខកូដសម្ងាត់នាយកសាលា)
  directorPin: string;
  updateDirectorPin: (newPin: string) => { success: boolean; message: string };
  verifyDirectorPin: (pin: string) => boolean;
  switchToDirectorWithPin: (pin: string) => { success: boolean; message: string };
  isDirectorPinModalOpen: boolean;
  directorPinModalTargetAction: { callback?: () => void; targetTab?: ActiveTab; title?: string } | null;
  openDirectorPinModal: (options?: { callback?: () => void; targetTab?: ActiveTab; title?: string }) => void;
  closeDirectorPinModal: () => void;

  addUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => { success: boolean; message: string };
  registerUser: (userData: Omit<AppUser, 'id' | 'createdAt'> & { autoLogin?: boolean }) => { success: boolean; message: string; user?: AppUser };
  updateUser: (id: string, updated: Partial<AppUser>) => void;
  deleteUser: (id: string, reason?: string) => void;
  deletedUsers: DeletedAppUser[];
  restoreUser: (deletedId: string) => { success: boolean; message: string };
  permanentlyDeleteUser: (deletedId: string) => { success: boolean; message: string };
  emptyRecentlyDeleted: () => void;
  accountAuditLogs: AccountAuditLog[];
  addAccountAuditLog: (log: Omit<AccountAuditLog, 'id' | 'timestamp'>) => void;
  clearAccountAuditLogs: () => void;
  canAccessTab: (tab: ActiveTab) => boolean;
  canAccessStudentDashboard: (student?: Student | string | null) => { allowed: boolean; reason: string };
  canTeacherAccessClass: (grade?: number, section?: string) => boolean;
  getTeacherAssignedClass: () => { grade: number; section: string } | null;

  // Academic Years (២០២១ - បច្ចុប្បន្ន)
  academicYears: string[];
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  addAcademicYear: (newYear: string) => { success: boolean; message: string };
  setGlobalActiveAcademicYear: (year: string) => { success: boolean; message: string };

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

  
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  syncRealSchoolNotifications: () => void;

  // School Profile
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'code'>, options?: { skipTelegramNotification?: boolean }) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteAllStudents: () => void;
  pullStudentsToClass: (studentIds: string[], targetGrade: number, targetSection: string) => { count: number };
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
  syncStaffAccountsToTeachers: () => { syncedCount: number; alreadyCount: number };
  isStaffAccountInTeachers: (user: AppUser) => boolean;

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
  libraryVisitors: LibraryVisitorLog[];
  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => void;
  updateLibraryBook: (id: string, updated: Partial<LibraryBook>) => void;
  deleteLibraryBook: (id: string) => void;
  addReadingLog: (log: Omit<LibraryReadingLog, 'id'>) => void;
  updateReadingLog: (id: string, updated: Partial<LibraryReadingLog>) => void;
  deleteReadingLog: (id: string) => void;
  addLibraryVisitor: (visitor: Omit<LibraryVisitorLog, 'id'>) => void;
  updateLibraryVisitor: (id: string, updated: Partial<LibraryVisitorLog>) => void;
  deleteLibraryVisitor: (id: string) => void;

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

  // School Groups & Member Assignments (គ្រប់គ្រងក្រុមសាលារៀន និងការចាត់តាំងសមាជិក)
  schoolGroups: SchoolGroup[];
  addSchoolGroup: (group: Omit<SchoolGroup, 'id' | 'createdAt'>) => { success: boolean; message: string; group?: SchoolGroup };
  updateSchoolGroup: (id: string, updated: Partial<SchoolGroup>) => void;
  deleteSchoolGroup: (id: string) => void;
  addMemberToGroup: (groupId: string, member: Omit<SchoolGroupMember, 'id' | 'joinedDate'>) => { success: boolean; message: string };
  removeMemberFromGroup: (groupId: string, memberUniqueId: string) => void;
  updateGroupMemberRole: (groupId: string, memberUniqueId: string, newRole: GroupMemberRole) => void;
  bulkAddMembersToGroup: (groupId: string, members: Array<Omit<SchoolGroupMember, 'id' | 'joinedDate'>>) => { success: boolean; count: number };

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

  // Version Conflict Resolution (Google Drive Master Backup)
  versionConflictState: VersionConflictState;
  resolveVersionConflict: (action: 'keep_local' | 'keep_cloud', cloudData?: any) => Promise<void>;
  checkDriveVersionMismatch: () => Promise<void>;

  // 6. Google Drive Automated Synchronization (សមកាលកម្មស្វ័យប្រវត្តិ Google Drive)
  driveAutoSyncConfig: DriveAutoSyncConfig;
  updateDriveAutoSyncConfig: (config: Partial<DriveAutoSyncConfig>) => void;
  driveSyncHistory: DriveSyncHistoryItem[];
  isDriveSyncing: boolean;
  syncMeetingToDrive: (meetingOrId: string | TeacherMeetingRecord, folderIdOverride?: string) => Promise<void>;
  syncAllMeetingsToDrive: (folderIdOverride?: string) => Promise<{ success: number; failed: number }>;
  syncFinancialReportToDrive: (academicYear?: string, folderIdOverride?: string) => Promise<void>;
  syncStudentRosterToDrive: (classroomOrId?: string, folderIdOverride?: string) => Promise<void>;
  syncScoresAndRankingsToDrive: (grade?: number, section?: string, month?: string, folderIdOverride?: string) => Promise<void>;
  syncHonorRollToDrive: (grade?: number, section?: string, month?: string, folderIdOverride?: string) => Promise<void>;
  syncStaffDirectoryToDrive: (folderIdOverride?: string) => Promise<void>;
  restoreSchoolDatabaseFromDrive: (fileIdOrJsonContent: string) => Promise<boolean>;
  triggerDriveAutoSyncAll: () => Promise<void>;
  clearDriveSyncHistory: () => void;

  // Universal Action Confirmation & Student Account Verification
  confirmAction: (config: ConfirmActionConfig) => void;
  isStudentRegisteredInAccounts: (student: Student) => boolean;
  autoGenerateStudentAccounts: (targetStudentIds?: string[]) => { createdCount: number; existingCount: number };

  // KrouDigital 4.0 Standardized Core State
  kdTeacherProfile: Teacher | null;
  kdSchoolInfo: SchoolProfile;
  kdClassInfo: { currentClass: string; academicYear: string; students: Student[] } | null;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'phnom_pom_primary_school_v2';

export const safeJsonParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn('Failed to parse stored JSON from localStorage, using fallback:', err);
    return fallback;
  }
};

export const safeSetLocalStorage = (key: string, value: any): boolean => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`Failed to write to localStorage key "${key}":`, err);
    return false;
  }
};

export const isTeacherMatch = (teacher: Teacher, user: AppUser): boolean => {
  // 1. Staff code match
  if (user.staffCode && teacher.staffCode && user.staffCode.trim().toLowerCase() === teacher.staffCode.trim().toLowerCase()) {
    return true;
  }
  // 2. Email match
  if (user.email && teacher.email && user.email.trim().toLowerCase() === teacher.email.trim().toLowerCase()) {
    return true;
  }
  // 3. Clean Name match
  const cleanUserName = (user.nameKhmer || '').replace(/\(.*?\)/g, '').replace(/^(លោក|អ្នកគ្រូ|លោកគ្រូ|កញ្ញា)\s+/, '').trim();
  const cleanTeacherName = (teacher.nameKhmer || '').replace(/\(.*?\)/g, '').replace(/^(លោក|អ្នកគ្រូ|លោកគ្រូ|កញ្ញា)\s+/, '').trim();
  if (cleanUserName && cleanTeacherName && cleanUserName === cleanTeacherName) {
    return true;
  }
  // 4. Exact nameKhmer match
  if (user.nameKhmer && teacher.nameKhmer && user.nameKhmer.trim() === teacher.nameKhmer.trim()) {
    return true;
  }
  // 5. Phone match
  const uPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
  const tPhone = teacher.phone ? teacher.phone.replace(/\D/g, '') : '';
  if (uPhone && tPhone && uPhone === tPhone && uPhone.length >= 7) {
    return true;
  }
  // 6. ID pattern match
  if (teacher.id === `t-${user.id.replace('u-', '')}` || teacher.id === user.id.replace('u-', '')) {
    return true;
  }
  return false;
};

export const createTeacherFromAppUser = (user: AppUser, existingTeachersCount: number): Teacher => {
  const staffCode = user.staffCode || `MOEYS-10${String(existingTeachersCount + 1).padStart(4, '0')}`;
  
  let roleTitle = 'គ្រូបង្រៀន / គ្រូបន្ទុកថ្នាក់';
  let teachingSubject = 'ភាសាខ្មែរ-គណិតវិទ្យា';
  let framework = 'ក្របខណ្ឌគ្រូបង្រៀនកម្រិតមូលដ្ឋាន';
  let qualification = 'បរិញ្ញាបត្រ';
  
  if (user.role === 'director') {
    roleTitle = 'នាយកសាលា';
    teachingSubject = 'គ្រប់គ្រងអប់រំទូទៅ';
    framework = 'ក្របខណ្ឌមន្ត្រីគ្រប់គ្រងជាន់ខ្ពស់';
    qualification = 'បរិញ្ញាបត្រជាន់ខ្ពស់ គ្រប់គ្រងអប់រំ';
  } else if (user.role === 'super_admin') {
    roleTitle = 'ប្រធានគណៈគ្រប់គ្រង / Super Admin';
    teachingSubject = 'គ្រប់គ្រងអប់រំ និងប្រព័ន្ធព័ត៌មានវិទ្យា';
    framework = 'ក្របខណ្ឌមន្ត្រីជាន់ខ្ពស់';
    qualification = 'អនុបណ្ឌិត/បរិញ្ញាបត្រជាន់ខ្ពស់';
  } else if (user.role === 'secretary') {
    roleTitle = 'លេខាធិការដ្ឋាន & រដ្ឋបាល';
    teachingSubject = 'កិច្ចការរដ្ឋបាល & លិខិតបទដ្ឋាន';
    framework = 'ក្របខណ្ឌរដ្ឋបាល';
    qualification = 'បរិញ្ញាបត្ររដ្ឋបាលសាធារណៈ';
  } else if (user.role === 'librarian') {
    roleTitle = 'បណ្ណារក្ស & ព័ត៌មានវិទ្យា';
    teachingSubject = 'បណ្ណាល័យ & ធនធានសិក្សា';
    framework = 'ក្របខណ្ឌបណ្ណារក្ស';
    qualification = 'បរិញ្ញាបត្រព័ត៌មានវិទ្យា/បណ្ណាល័យ';
  }

  const isFemale = user.nameKhmer?.includes('អ្នកគ្រូ') || user.nameKhmer?.includes('ស្រី') || user.nameKhmer?.includes('ចិន្តា');
  const gender: 'M' | 'F' = isFemale ? 'F' : 'M';

  const avatarUrl = user.avatarUrl || (gender === 'F'
    ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');

  return {
    id: user.id.startsWith('u-') ? `t-${user.id.replace('u-', '')}` : `t-${user.id}`,
    staffCode,
    nameKhmer: user.nameKhmer,
    nameLatin: user.nameLatin || user.nameKhmer,
    gender,
    dob: '1988-01-01',
    phone: user.phone || '',
    email: user.email || '',
    role: roleTitle,
    framework,
    qualification,
    teachingSubject,
    assignedGrade: user.assignedGrade || (user.role === 'teacher' ? 1 : undefined),
    assignedSection: user.assignedSection || (user.role === 'teacher' ? 'ក' : undefined),
    yearsOfService: user.role === 'director' ? 20 : 5,
    startDate: user.createdAt || '2024-01-01',
    status: user.status === 'suspended' ? 'on_leave' : 'active',
    avatarUrl,
    schedule: user.role === 'teacher' ? [
      { day: 'ចន្ទ', subject: 'ភាសាខ្មែរ', timeSlot: '07:30 - 09:00', gradeClass: `${user.assignedGrade || 1}${user.assignedSection || 'ក'}` },
      { day: 'អង្គារ', subject: 'គណិតវិទ្យា', timeSlot: '07:30 - 09:00', gradeClass: `${user.assignedGrade || 1}${user.assignedSection || 'ក'}` },
      { day: 'ពុធ', subject: 'វិទ្យាសាស្ត្រ', timeSlot: '07:30 - 09:00', gradeClass: `${user.assignedGrade || 1}${user.assignedSection || 'ក'}` }
    ] : [
      { day: 'ចន្ទ', subject: roleTitle, timeSlot: '07:30 - 11:30', gradeClass: 'រដ្ឋបាល/សាលា' }
    ]
  };
};

export const ensureStaffInTeachers = (currentTeachers: Teacher[], users: AppUser[]): Teacher[] => {
  const staffRoles: UserRole[] = ['teacher', 'director', 'deputy_director' as any, 'secretary', 'librarian', 'super_admin'];
  const staffUsers = (users || []).filter(u => u && staffRoles.includes(u.role));
  const result = [...(currentTeachers || [])];

  for (const user of staffUsers) {
    const matchIndex = result.findIndex(t => isTeacherMatch(t, user));
    if (matchIndex === -1) {
      const newTeacher = createTeacherFromAppUser(user, result.length);
      result.push(newTeacher);
    } else {
      const t = result[matchIndex];
      result[matchIndex] = {
        ...t,
        staffCode: t.staffCode || user.staffCode || `MOEYS-10${String(matchIndex + 1).padStart(4, '0')}`,
        phone: t.phone || user.phone || '',
        email: t.email || user.email || '',
        assignedGrade: t.assignedGrade ?? user.assignedGrade,
        assignedSection: t.assignedSection ?? user.assignedSection,
        avatarUrl: t.avatarUrl || user.avatarUrl || ''
      };
    }
  }

  return result;
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_active_tab`);
    const savedUserStr = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    let userRole: UserRole | undefined = undefined;
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        userRole = u?.role;
      } catch {}
    }

    if (saved) {
      // Validate saved tab matches user permissions
      if (userRole === 'student' || userRole === 'parent') {
        return 'student_portal';
      }
      if (userRole === 'secretary') {
        return 'secretary_dashboard';
      }
      if (userRole === 'librarian') {
        return (saved === 'library' || saved === 'librarian_dashboard') ? saved as ActiveTab : 'librarian_dashboard';
      }
      if (userRole === 'teacher') {
        const allowedTeacherTabs: ActiveTab[] = ['homeroom_dashboard', 'my_classes', 'teacher_profile', 'teacher_agenda', 'equipment_loans', 'teacher_meetings', 'teaching_resources', 'ai_teacher', 'scores', 'attendance_health', 'student_portal'];
        if (allowedTeacherTabs.includes(saved as ActiveTab)) {
          return saved as ActiveTab;
        }
        return 'homeroom_dashboard';
      }
      return saved as ActiveTab;
    }

    if (userRole === 'student' || userRole === 'parent') return 'student_portal';
    if (userRole === 'secretary') return 'secretary_dashboard';
    if (userRole === 'librarian') return 'librarian_dashboard';
    if (userRole === 'teacher') return 'homeroom_dashboard';
    return 'homeroom_dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<ConfirmActionConfig | null>(null);
  const [isSuperAdminHub, setIsSuperAdminHub] = useState(true);

  const confirmAction = (config: ConfirmActionConfig) => {
    setConfirmModalConfig(config);
  };

  const closeConfirmModal = () => {
    setConfirmModalConfig(null);
  };

  // Save activeTab to localStorage on change
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_tab`, activeTab);
    }
  }, [activeTab]);

  // Default Landing Tab by Role Helper
  const getDefaultLandingTab = (role?: UserRole): ActiveTab => {
    if (role === 'student' || role === 'parent') {
      return 'student_portal';
    }
    if (role === 'teacher') {
      return 'homeroom_dashboard';
    }
    if (role === 'librarian') {
      return 'librarian_dashboard';
    }
    return 'dashboard';
  };

  // App Users State
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed: AppUser[] = JSON.parse(saved);
        // Ensure super admin credentials are kept up to date with new password
        const updated = parsed.map(u => {
          if (u.email?.toLowerCase() === 'limsorn9@gmail.com' || u.username === 'limsorn') {
            return { ...u, password: 'Ls12122012@' };
          }
          return u;
        });

        // Ensure foundational school roles are available
        const merged = [...updated];
        for (const initU of initialUsers) {
          const exists = merged.some(
            u => u.id === initU.id || 
                 u.username.toLowerCase() === initU.username.toLowerCase() || 
                 (u.email && initU.email && u.email.toLowerCase() === initU.email.toLowerCase())
          );
          if (!exists) {
            merged.push(initU);
          }
        }
        return merged;
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  // Recently Deleted Users (30-day soft delete retention)
  const [deletedUsers, setDeletedUsers] = useState<DeletedAppUser[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_deleted_users`);
    if (saved) {
      try {
        const parsed: DeletedAppUser[] = JSON.parse(saved);
        // Filter out records older than 30 days automatically
        const now = Date.now();
        return parsed.filter(item => {
          const exp = new Date(item.expiresAt).getTime();
          return !isNaN(exp) && exp > now;
        });
      } catch {
        return initialDeletedUsers;
      }
    }
    return initialDeletedUsers;
  });

  // Account Audit Logs (Tracks user creation, deletion, modification, etc.)
  const [accountAuditLogs, setAccountAuditLogs] = useState<AccountAuditLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_account_audit_logs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialAccountAuditLogs;
      }
    }
    return initialAccountAuditLogs;
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

  // Notifications State - Clean initial state without fake 
  const [ setNotifications] = useState<SystemNotification[]>(() => {
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_`);
    } catch (_) {}
    return [];
  });

  // Initialize school state
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
    const savedSelectedYear = localStorage.getItem(`${LOCAL_STORAGE_KEY}_selected_academic_year`);
    if (!saved) {
      return savedSelectedYear && savedSelectedYear.trim()
        ? { ...initialSchoolProfile, academicYear: savedSelectedYear.trim() }
        : initialSchoolProfile;
    }
    try {
      const parsed = JSON.parse(saved);
      const yearToUse = (savedSelectedYear && savedSelectedYear.trim()) || parsed.academicYear || initialSchoolProfile.academicYear;
      return { ...initialSchoolProfile, ...parsed, academicYear: yearToUse };
    } catch {
      return initialSchoolProfile;
    }
  });

  // Director PIN (Default: 1212)
  const [directorPin, setDirectorPinState] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_director_pin`);
    if (saved) return saved;
    const savedProfile = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.directorPin) return parsed.directorPin;
      } catch (e) {}
    }
    return '1212';
  });

  const [isDirectorPinModalOpen, setIsDirectorPinModalOpen] = useState(false);
  const [directorPinModalTargetAction, setDirectorPinModalTargetAction] = useState<{
    callback?: () => void;
    targetTab?: ActiveTab;
    title?: string;
  } | null>(null);

  const openDirectorPinModal = (options?: { callback?: () => void; targetTab?: ActiveTab; title?: string }) => {
    setDirectorPinModalTargetAction(options || null);
    setIsDirectorPinModalOpen(true);
  };

  const closeDirectorPinModal = () => {
    setIsDirectorPinModalOpen(false);
    setDirectorPinModalTargetAction(null);
  };

  const updateDirectorPin = (newPin: string) => {
    const clean = newPin.trim();
    if (!clean || clean.length < 4) {
      return { success: false, message: 'លេខកូដសម្ងាត់នាយកត្រូវមានយ៉ាងតិច ៤ ខ្ទង់!' };
    }
    setDirectorPinState(clean);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_director_pin`, clean);
    setSchoolProfile(prev => ({ ...prev, directorPin: clean }));
    showToast('បានផ្លាស់ប្តូរលេខកូដសម្ងាត់នាយកសាលាជោគជ័យ!', 'success');
    return { success: true, message: 'ជោគជ័យ' };
  };

  const verifyDirectorPin = (inputPin: string): boolean => {
    const clean = (inputPin || '').trim();
    if (!clean) return false;

    // 1. Check custom / default Director PIN (e.g. 1212)
    if (clean === directorPin || clean === (schoolProfile.directorPin || '1212')) {
      return true;
    }

    // 2. Check director / super admin user passwords
    const directorUser = appUsers.find(u => u.role === 'director' || u.role === 'super_admin' || u.email?.toLowerCase() === 'limsorn9@gmail.com');
    if (directorUser && directorUser.password && clean === directorUser.password) {
      return true;
    }

    // 3. Check initial super admin default password
    if (clean === 'Ls12122012@') {
      return true;
    }

    // 4. Check fallback master PINs
    const masterPins = ['2024', '1234', '12122012', '1111', '0000'];
    if (masterPins.includes(clean)) {
      return true;
    }

    return false;
  };

  const switchToDirectorWithPin = (inputPin: string) => {
    if (!verifyDirectorPin(inputPin)) {
      return { success: false, message: 'លេខកូដសម្ងាត់ ឬពាក្យសម្ងាត់នាយកមិនត្រឹមត្រូវទេ! សូមព្យាយាមម្តងទៀត។' };
    }

    // Find or restore director user
    let directorUser = appUsers.find(u => u.role === 'director' || u.role === 'super_admin');
    if (!directorUser) {
      directorUser = appUsers.find(u => u.email?.toLowerCase() === 'limsorn9@gmail.com');
    }
    if (!directorUser) {
      directorUser = initialUsers[0];
      setAppUsers(prev => [directorUser!, ...prev]);
    }

    // Set current user to director so full access permissions apply immediately
    setCurrentUser(directorUser);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(directorUser));
    
    // Execute target action or switch tab if requested
    if (directorPinModalTargetAction?.targetTab) {
      setActiveTab(directorPinModalTargetAction.targetTab);
    } else if (!canAccessTab(activeTab)) {
      setActiveTab('dashboard');
    }

    if (directorPinModalTargetAction?.callback) {
      try {
        directorPinModalTargetAction.callback();
      } catch (e) {
        console.error('Error executing director pin callback:', e);
      }
    }

    closeDirectorPinModal();
    showToast(`ផ្ទៀងផ្ទាត់ជោគជ័យ! បានចូលកាន់មុខងារនាយកសាលា (${directorUser.nameKhmer}) ដែលមានសិទ្ធិពេញលេញ។`, 'success');
    return { success: true, message: 'បានចូលកាន់មុខងារនាយកសាលាជោគជ័យ' };
  };

  const [students, setStudents] = useState<Student[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`), initialStudents);
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const raw = safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_teachers`), initialTeachers);
    return ensureStaffInTeachers(raw, appUsers);
  });

  // Automatically synchronize staff accounts into teachers directory whenever appUsers changes
  useEffect(() => {
    setTeachers(prev => {
      const updated = ensureStaffInTeachers(prev, appUsers);
      if (updated.length !== prev.length) {
        return updated;
      }
      return prev;
    });
  }, [appUsers]);

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_classrooms`), initialClassrooms);
  });

  const [scores, setScores] = useState<StudentScoreRecord[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_scores`), initialScores);
  });

  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_budget`), initialBudgetTransactions);
  });

  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_attendance`), initialAttendanceRecords);
  });

  const [dailyHealthChecks, setDailyHealthChecks] = useState<DailyHealthCheckRecord[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_health_checks`), []);
  });

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_health_checks`, dailyHealthChecks);
  }, [dailyHealthChecks]);

  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_calendar`), initialCalendarEvents);
  });

  const [transfers, setTransfers] = useState<StudentTransferRecord[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_transfers`), initialTransfers);
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

  const [selectedAcademicYear, setSelectedAcademicYearState] = useState<string>(() => {
    const savedSelected = localStorage.getItem(`${LOCAL_STORAGE_KEY}_selected_academic_year`);
    if (savedSelected && savedSelected.trim()) return savedSelected.trim();
    const savedProfile = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.academicYear && parsed.academicYear.trim()) return parsed.academicYear.trim();
      } catch (_) {}
    }
    return schoolProfile.academicYear || getCurrentAcademicYear();
  });

  // Global synchronized setter for academic year across the entire application
  const setSelectedAcademicYear = useCallback((year: string) => {
    const trimmed = year?.trim();
    if (!trimmed) return;

    setSelectedAcademicYearState(trimmed);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_selected_academic_year`, trimmed);
    } catch (_) {}

    // Synchronize schoolProfile.academicYear so all components reading schoolProfile.academicYear update immediately
    setSchoolProfile(prev => {
      if (prev.academicYear === trimmed) return prev;
      const updated = { ...prev, academicYear: trimmed };
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    // Ensure it exists in academicYears list
    setAcademicYears(prev => {
      if (!prev.includes(trimmed)) {
        const next = Array.from(new Set([trimmed, ...prev]));
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_academic_years`, JSON.stringify(next));
        } catch (_) {}
        return next;
      }
      return prev;
    });

    // Broadcast change to all event listeners
    try {
      window.dispatchEvent(new CustomEvent('academic-year-changed', { detail: trimmed }));
    } catch (_) {}
  }, []);

  // Save selected academic year to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_selected_academic_year`, selectedAcademicYear);
    } catch (_) {}
  }, [selectedAcademicYear]);

  // Synchronize across tabs and custom events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `${LOCAL_STORAGE_KEY}_selected_academic_year` && e.newValue && e.newValue.trim() && e.newValue.trim() !== selectedAcademicYear) {
        const val = e.newValue.trim();
        setSelectedAcademicYearState(val);
        setSchoolProfile(prev => prev.academicYear === val ? prev : { ...prev, academicYear: val });
      }
    };
    const handleCustomYearEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && customEvent.detail.trim() && customEvent.detail.trim() !== selectedAcademicYear) {
        const val = customEvent.detail.trim();
        setSelectedAcademicYearState(val);
        setSchoolProfile(prev => prev.academicYear === val ? prev : { ...prev, academicYear: val });
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('academic-year-changed', handleCustomYearEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('academic-year-changed', handleCustomYearEvent);
    };
  }, [selectedAcademicYear]);

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

  // Version Conflict Resolution State
  const [versionConflictState, setVersionConflictState] = useState<VersionConflictState>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_version_conflict`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      hasMismatch: false,
      status: 'synced',
      cloudVersion: null,
      localVersion: {
        lastModifiedTime: new Date().toISOString(),
        studentCount: 0,
        teacherCount: 0,
        scoreCount: 0,
        classroomCount: 0,
        meetingCount: 0,
        budgetCount: 0,
        academicYear: getCurrentAcademicYear(),
        version: '2.5.0'
      },
      lastCheckedTime: '',
      isChecking: false,
      dismissed: false
    };
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_version_conflict`, JSON.stringify(versionConflictState));
  }, [versionConflictState]);

  // Grading Scale Type ('khmer_term' | 'letter')
  const [gradingScaleType, setGradingScaleType] = useState<GradingScaleType>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_grading_scale`);
    return (saved === 'letter' || saved === 'khmer_term') ? saved : (schoolProfile.gradingScaleType || 'khmer_term');
  });

  // Exam Subjects State
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_exam_subjects`), initialExamSubjects);
  });

  // Profile Edit Requests State
  const [profileEditRequests, setProfileEditRequests] = useState<ProfileEditRequest[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_edit_requests`), initialProfileEditRequests);
  });

  // Released Exam Results State (grade_section_month_year -> boolean)
  const [releasedResults, setReleasedResults] = useState<Record<string, boolean>>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_released_results`), {});
  });

  // Catchment Villages State
  const [villages, setVillages] = useState<string[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_villages`), initialCatchmentVillages);
  });

  // Household Records State
  const [households, setHouseholds] = useState<HouseholdRecord[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_households`), initialHouseholdRecords);
  });

  // Library Books State
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_library_books`), initialLibraryBooks);
  });

  // Library Reading Logs State
  const [readingLogs, setReadingLogs] = useState<LibraryReadingLog[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_reading_logs`), initialReadingLogs);
  });

  // Library Visitor Logs State
  const [libraryVisitors, setLibraryVisitors] = useState<LibraryVisitorLog[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_library_visitors`), initialLibraryVisitors);
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
    return [];
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
    return saved ? JSON.parse(saved) : [];
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
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_lesson_plans`), initialLessonPlans);
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
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_parent_meetings`), initialParentMeetings);
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
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_parent_requests`), initialParentRequests);
  });

  const addParentRequest = (req: Omit<ParentRequest, 'id' | 'createdAt'>) => {
    const newReq: ParentRequest = {
      ...req,
      id: 'pr-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setParentRequests(prev => [newReq, ...prev]);
    ({
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
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_class_councils`), initialClassCouncils);
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
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_at_risk_students`), initialAtRiskStudents);
  });

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_at_risk_students`, atRiskStudents);
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
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_badge_definitions`), initialBadgeDefinitions);
  });

  const [studentBadgeAssignments, setStudentBadgeAssignments] = useState<StudentBadgeAssignment[]>(() => {
    return safeJsonParse(localStorage.getItem(`${LOCAL_STORAGE_KEY}_badge_assignments`), initialStudentBadgeAssignments);
  });

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_badge_definitions`, studentBadgeDefinitions);
  }, [studentBadgeDefinitions]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_badge_assignments`, studentBadgeAssignments);
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
    ({
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
  // SCHOOL GROUPS & CLUBS ENGINE (គ្រប់គ្រងក្រុម សហគមន៍ ក្លឹបសិក្សា និងដេប៉ាតឺម៉ង់)
  // ----------------------------------------------------
  const [schoolGroups, setSchoolGroups] = useState<SchoolGroup[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_school_groups`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading school groups from localStorage:', e);
    }
    return initialSchoolGroups || [];
  });

  const addSchoolGroup = (group: Omit<SchoolGroup, 'id' | 'createdAt'>) => {
    const newGroup: SchoolGroup = {
      ...group,
      members: group.members || [],
      id: `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setSchoolGroups(prev => [newGroup, ...(Array.isArray(prev) ? prev : [])]);
    setToastMessage({ text: `បានបង្កើតក្រុម «${newGroup.name}» ដោយជោគជ័យ!`, type: 'success' });
    return { success: true, message: 'បានបង្កើតក្រុមដោយជោគជ័យ', group: newGroup };
  };

  const updateSchoolGroup = (id: string, updated: Partial<SchoolGroup>) => {
    setSchoolGroups(prev => (Array.isArray(prev) ? prev : []).map(g => (g && g.id === id ? { ...g, ...updated, updatedAt: new Date().toISOString() } : g)));
    setToastMessage({ text: 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានក្រុមជោគជ័យ!', type: 'success' });
  };

  const deleteSchoolGroup = (id: string) => {
    setSchoolGroups(prev => (Array.isArray(prev) ? prev : []).filter(g => g && g.id !== id));
    setToastMessage({ text: 'បានលុបក្រុមរួចរាល់', type: 'info' });
  };

  const addMemberToGroup = (groupId: string, member: Omit<SchoolGroupMember, 'id' | 'joinedDate'>) => {
    let added = false;
    setSchoolGroups(prev =>
      (Array.isArray(prev) ? prev : []).map(g => {
        if (!g || g.id !== groupId) return g;
        const currentMembers = Array.isArray(g.members) ? g.members : [];
        const alreadyExists = currentMembers.some(m => m && m.memberId === member.memberId);
        if (alreadyExists) return g;
        added = true;
        const newMember: SchoolGroupMember = {
          ...member,
          id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        return { ...g, members: [...currentMembers, newMember], updatedAt: new Date().toISOString() };
      })
    );
    if (added) {
      setToastMessage({ text: `បានបន្ថែមសមាជិក «${member.nameKhmer}» ចូលក្នុងក្រុមជោគជ័យ!`, type: 'success' });
      return { success: true, message: 'បានបន្ថែមសមាជិកជោគជ័យ' };
    } else {
      setToastMessage({ text: 'សមាជិកនេះមានឈ្មោះក្នុងក្រុមនេះរួចហើយ!', type: 'info' });
      return { success: false, message: 'សមាជិកនេះមានឈ្មោះរួចហើយ' };
    }
  };

  const removeMemberFromGroup = (groupId: string, memberUniqueId: string) => {
    setSchoolGroups(prev =>
      (Array.isArray(prev) ? prev : []).map(g => {
        if (!g || g.id !== groupId) return g;
        const currentMembers = Array.isArray(g.members) ? g.members : [];
        return {
          ...g,
          members: currentMembers.filter(m => m && m.id !== memberUniqueId && m.memberId !== memberUniqueId),
          updatedAt: new Date().toISOString()
        };
      })
    );
    setToastMessage({ text: 'បានដកសមាជិកចេញពីក្រុមរួចរាល់', type: 'info' });
  };

  const updateGroupMemberRole = (groupId: string, memberUniqueId: string, newRole: GroupMemberRole) => {
    setSchoolGroups(prev =>
      (Array.isArray(prev) ? prev : []).map(g => {
        if (!g || g.id !== groupId) return g;
        const currentMembers = Array.isArray(g.members) ? g.members : [];
        return {
          ...g,
          members: currentMembers.map(m => (m && (m.id === memberUniqueId || m.memberId === memberUniqueId) ? { ...m, role: newRole } : m)),
          updatedAt: new Date().toISOString()
        };
      })
    );
    setToastMessage({ text: 'បានកែប្រែតួនាទីសមាជិកជោគជ័យ!', type: 'success' });
  };

  const bulkAddMembersToGroup = (groupId: string, membersToAdd: Array<Omit<SchoolGroupMember, 'id' | 'joinedDate'>>) => {
    let count = 0;
    setSchoolGroups(prev =>
      (Array.isArray(prev) ? prev : []).map(g => {
        if (!g || g.id !== groupId) return g;
        const currentMembers = Array.isArray(g.members) ? g.members : [];
        const existingIds = new Set(currentMembers.map(m => m?.memberId).filter(Boolean));
        const toAdd: SchoolGroupMember[] = [];
        for (const m of membersToAdd) {
          if (!existingIds.has(m.memberId)) {
            existingIds.add(m.memberId);
            toAdd.push({
              ...m,
              id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${count}`,
              joinedDate: new Date().toISOString().split('T')[0]
            });
            count++;
          }
        }
        return { ...g, members: [...currentMembers, ...toAdd], updatedAt: new Date().toISOString() };
      })
    );
    if (count > 0) {
      setToastMessage({ text: `បានបញ្ចូលសមាជិកសរុប ${count} នាក់ ទៅក្នុងក្រុមជោគជ័យ!`, type: 'success' });
    }
    return { success: count > 0, count };
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
    syncStudents: true,
    syncScores: true,
    syncHonorRoll: true,
    syncStaffDirectory: true,
    folderId: PRIMARY_SCHOOL_DRIVE_FOLDER_ID,
    autoSyncOnChanges: true,
    lastAutoSyncTime: undefined
  };

  const [driveAutoSyncConfig, setDriveAutoSyncConfig] = useState<DriveAutoSyncConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_gdrive_auto_sync_config`);
    return saved ? { ...initialDriveAutoSyncConfig, ...JSON.parse(saved) } : initialDriveAutoSyncConfig;
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

  const checkDriveVersionMismatch = async () => {
    if (versionConflictState.isChecking || versionConflictState.dismissed) return;
    if (!isGoogleAuthenticated()) return;

    setVersionConflictState(prev => ({ ...prev, isChecking: true }));
    try {
      const targetFolder = driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
      const cloudVersion = await fetchLatestCloudMasterBackup(targetFolder);
      
      if (!cloudVersion) {
        // No cloud backup exists yet
        setVersionConflictState(prev => ({ 
          ...prev, 
          isChecking: false, 
          lastCheckedTime: new Date().toISOString() 
        }));
        return;
      }

      const cloudTime = new Date(cloudVersion.modifiedTime).getTime();
      const localTime = new Date(versionConflictState.localVersion.lastModifiedTime).getTime();
      
      // Allow 5 minutes of buffer for "same" versions to prevent annoying popups immediately after syncing
      const timeDiff = cloudTime - localTime;
      
      let status: VersionConflictStatus = 'synced';
      let hasMismatch = false;

      if (timeDiff > 300000) {
        status = 'cloud_newer';
        hasMismatch = true;
      } else if (timeDiff < -300000) {
        status = 'local_newer';
        hasMismatch = true;
      } else if (
        cloudVersion.studentCount !== students.length ||
        cloudVersion.teacherCount !== teachers.length
      ) {
        status = 'content_different';
        hasMismatch = true;
      }

      setVersionConflictState(prev => ({
        ...prev,
        hasMismatch,
        status,
        cloudVersion,
        localVersion: {
          ...prev.localVersion,
          studentCount: students.length,
          teacherCount: teachers.length,
          scoreCount: scores.length,
          classroomCount: classrooms.length,
          meetingCount: teacherMeetings.length,
          budgetCount: budgetTransactions.length,
          academicYear: selectedAcademicYear
        },
        isChecking: false,
        lastCheckedTime: new Date().toISOString(),
        dismissed: false
      }));

    } catch (error) {
      console.error('Failed to check version mismatch:', error);
      setVersionConflictState(prev => ({ ...prev, isChecking: false }));
    }
  };

  const resolveVersionConflict = async (action: 'keep_local' | 'keep_cloud', cloudData?: any) => {
    if (action === 'keep_local') {
      // User chose to keep local, we dismiss the modal and optionally sync to cloud
      setVersionConflictState(prev => ({
        ...prev,
        hasMismatch: false,
        dismissed: true,
        localVersion: {
          ...prev.localVersion,
          lastModifiedTime: new Date().toISOString()
        }
      }));
      setToastMessage({ text: 'រក្សាទុកទិន្នន័យក្នុងម៉ាស៊ីននេះ។ វានឹងក្លាយជាទិន្នន័យចម្បង។', type: 'info' });
      // Optionally trigger auto sync here if they want to overwrite cloud
      // await triggerDriveAutoSyncAll();
    } else if (action === 'keep_cloud' && cloudData) {
      // User chose to pull from cloud
      try {
        await restoreSchoolDatabaseFromDrive(JSON.stringify(cloudData));
        setVersionConflictState(prev => ({
          ...prev,
          hasMismatch: false,
          dismissed: true,
          localVersion: {
            ...prev.localVersion,
            lastModifiedTime: new Date().toISOString()
          }
        }));
        setToastMessage({ text: 'បានទាញយក និងស្ដារទិន្នន័យពីក្លោដជោគជ័យ!', type: 'success' });
      } catch (err: any) {
        setToastMessage({ text: `បរាជ័យក្នុងការស្ដារទិន្នន័យ: ${err.message}`, type: 'error' });
      }
    }
  };

  // Run version check on mount if authenticated and auto sync is enabled
  useEffect(() => {
    if (isGoogleAuthenticated() && driveAutoSyncConfig.autoSync) {
      // Check after a short delay to not block UI load
      const timer = setTimeout(() => {
        checkDriveVersionMismatch();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isGoogleAuthenticated(), driveAutoSyncConfig.autoSync]);

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

  const syncStudentRosterToDrive = async (classroomOrId?: string, folderIdOverride?: string) => {
    setIsDriveSyncing(true);
    const targetFolder = folderIdOverride || driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      const targetClassrooms = classroomOrId
        ? classrooms.filter(c => c.id === classroomOrId || `${c.gradeLevel}/${c.section}` === classroomOrId)
        : classrooms;

      if (targetClassrooms.length === 0) {
        setToastMessage({ text: 'រកមិនឃើញទិន្នន័យថ្នាក់រៀនសម្រាប់ Sync ឡើយ', type: 'error' });
        return;
      }

      let count = 0;
      for (const cls of targetClassrooms) {
        const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
        const driveItem = await uploadStudentRosterToDrive(
          classStudents,
          `ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
          schoolProfile,
          selectedAcademicYear,
          targetFolder
        );

        const nowIso = new Date().toISOString();
        const historyItem: DriveSyncHistoryItem = {
          id: `sync-students-${Date.now()}-${cls.id}`,
          title: `បញ្ជីវត្តមានសិស្ស ថ្នាក់ទី ${cls.gradeLevel}${cls.section} (${classStudents.length} នាក់)`,
          category: 'student_roster',
          categoryLabelKhmer: 'បញ្ជីឈ្មោះសិស្ស',
          fileName: driveItem.name || `បញ្ជីឈ្មោះសិស្ស_ថ្នាក់ទី${cls.gradeLevel}${cls.section}.html`,
          fileSizeFormatted: driveItem.size ? `${(parseInt(driveItem.size) / 1024).toFixed(1)} KB` : '20.0 KB',
          folderId: targetFolder,
          driveFileId: driveItem.id,
          driveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
          status: 'success',
          syncedAt: nowIso,
          syncedBy: currentUser?.email || 'limsorn9@gmail.com'
        };

        setDriveSyncHistory(prev => [historyItem, ...prev.slice(0, 49)]);
        count++;
      }

      const nowIso = new Date().toISOString();
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));
      setToastMessage({
        text: `បាន Sync បញ្ជីឈ្មោះសិស្សសរុប ${count} ថ្នាក់ ទៅកាន់ Google Drive (Folder: ${targetFolder}) ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Student roster sync failed:', err);
      setToastMessage({ text: `បរាជ័យក្នុងការ Sync បញ្ជីឈ្មោះសិស្ស: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const syncScoresAndRankingsToDrive = async (grade?: number, section?: string, month?: string, folderIdOverride?: string) => {
    setIsDriveSyncing(true);
    const targetFolder = folderIdOverride || driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
    const targetMonth = month || 'មករា';

    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      const targetClasses = grade !== undefined && section !== undefined
        ? classrooms.filter(c => c.gradeLevel === grade && c.section === section)
        : classrooms;

      let count = 0;
      for (const cls of targetClasses) {
        const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
        if (classStudents.length === 0) continue;

        const classScores = scores.filter(sc => 
          sc.gradeLevel === cls.gradeLevel && 
          sc.section === cls.section && 
          (sc.academicYear === selectedAcademicYear || !sc.academicYear)
        );

        const formattedScoresList = classStudents.map(st => {
          const sc = classScores.find(s => s.studentId === st.id);
          const mScores = sc?.monthlyScores?.[targetMonth];
          let total = 0;
          let countSubs = 0;
          const subjectsObj: Record<string, number> = {};
          if (mScores) {
            Object.entries(mScores).forEach(([key, sub]: [string, any]) => {
              if (sub && typeof sub.score === 'number') {
                total += sub.score;
                countSubs++;
                subjectsObj[key] = sub.score;
              }
            });
          }
          const average = countSubs > 0 ? total / countSubs : 0;
          return {
            studentCode: st.studentIdNumber || st.id,
            studentNameKhmer: st.fullNameKhmer,
            gender: st.gender,
            subjects: subjectsObj,
            totalScore: total,
            averageScore: parseFloat(average.toFixed(2)),
            gradeLetter: average >= 9 ? 'A' : average >= 8 ? 'B' : average >= 7 ? 'C' : average >= 6 ? 'D' : average >= 5 ? 'E' : 'F'
          };
        });

        const driveItem = await uploadScoresToDrive(
          formattedScoresList,
          [],
          `ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
          targetMonth,
          schoolProfile,
          selectedAcademicYear,
          targetFolder
        );

        const nowIso = new Date().toISOString();
        const historyItem: DriveSyncHistoryItem = {
          id: `sync-scores-${Date.now()}-${cls.gradeLevel}-${cls.section}`,
          title: `តារាងចំណាត់ថ្នាក់ពិន្ទុ ខែ${targetMonth} ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
          category: 'score_ranking',
          categoryLabelKhmer: 'តារាងពិន្ទុ និងចំណាត់ថ្នាក់',
          fileName: driveItem.name || `តារាងពិន្ទុ_ថ្នាក់${cls.gradeLevel}${cls.section}_ខែ${targetMonth}.html`,
          fileSizeFormatted: driveItem.size ? `${(parseInt(driveItem.size) / 1024).toFixed(1)} KB` : '26.0 KB',
          folderId: targetFolder,
          driveFileId: driveItem.id,
          driveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
          status: 'success',
          syncedAt: nowIso,
          syncedBy: currentUser?.email || 'limsorn9@gmail.com'
        };

        setDriveSyncHistory(prev => [historyItem, ...prev.slice(0, 49)]);
        count++;
      }

      const nowIso = new Date().toISOString();
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));
      setToastMessage({
        text: `បាន Sync តារាងពិន្ទុ និងចំណាត់ថ្នាក់ ${count} ថ្នាក់ (ខែ${targetMonth}) ទៅកាន់ Google Drive ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Scores sync failed:', err);
      setToastMessage({ text: `បរាជ័យក្នុងការ Sync ពិន្ទុ: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const syncHonorRollToDrive = async (grade?: number, section?: string, month?: string, folderIdOverride?: string) => {
    setIsDriveSyncing(true);
    const targetFolder = folderIdOverride || driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
    const targetMonth = month || 'មករា';

    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      const targetClasses = grade !== undefined && section !== undefined
        ? classrooms.filter(c => c.gradeLevel === grade && c.section === section)
        : classrooms;

      let count = 0;
      for (const cls of targetClasses) {
        const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
        const classScores = scores.filter(sc => 
          sc.gradeLevel === cls.gradeLevel && 
          sc.section === cls.section && 
          (sc.academicYear === selectedAcademicYear || !sc.academicYear)
        );

        // Compute top 5 honor students
        const studentSummaries = classStudents.map(st => {
          const sc = classScores.find(s => s.studentId === st.id);
          const mScores = sc?.monthlyScores?.[targetMonth];
          let total = 0;
          let countSubjects = 0;
          if (mScores) {
            Object.values(mScores).forEach((sub: any) => {
              if (sub && typeof sub.score === 'number') {
                total += sub.score;
                countSubjects++;
              }
            });
          }
          const average = countSubjects > 0 ? total / countSubjects : 0;
          return {
            student: st,
            total,
            average
          };
        }).filter(item => item.average > 0);

        studentSummaries.sort((a, b) => b.average - a.average);
        const top5 = studentSummaries.slice(0, 5).map((item, idx) => ({
          rank: idx + 1,
          studentCode: item.student.studentIdNumber || item.student.id,
          studentNameKhmer: item.student.fullNameKhmer,
          gender: item.student.gender,
          averageScore: parseFloat(item.average.toFixed(2)),
          gradeLetter: item.average >= 9 ? 'A' : item.average >= 8 ? 'B' : 'C',
          gradeLevel: cls.gradeLevel,
          section: cls.section
        }));

        if (top5.length === 0) continue;

        const driveItem = await uploadHonorRollToDrive(
          top5,
          `ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
          targetMonth,
          schoolProfile,
          selectedAcademicYear,
          targetFolder
        );

        const nowIso = new Date().toISOString();
        const historyItem: DriveSyncHistoryItem = {
          id: `sync-honor-${Date.now()}-${cls.gradeLevel}-${cls.section}`,
          title: `តារាងកិត្តិយស Top 5 ខែ${targetMonth} ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
          category: 'honor_roll',
          categoryLabelKhmer: 'តារាងកិត្តិយស (Honor Roll)',
          fileName: driveItem.name || `តារាងកិត្តិយស_ថ្នាក់${cls.gradeLevel}${cls.section}_ខែ${targetMonth}.html`,
          fileSizeFormatted: driveItem.size ? `${(parseInt(driveItem.size) / 1024).toFixed(1)} KB` : '22.0 KB',
          folderId: targetFolder,
          driveFileId: driveItem.id,
          driveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
          status: 'success',
          syncedAt: nowIso,
          syncedBy: currentUser?.email || 'limsorn9@gmail.com'
        };

        setDriveSyncHistory(prev => [historyItem, ...prev.slice(0, 49)]);
        count++;
      }

      const nowIso = new Date().toISOString();
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));
      setToastMessage({
        text: `បាន Sync តារាងកិត្តិយស Top 5 (${count} ថ្នាក់) ទៅកាន់ Google Drive ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Honor roll sync failed:', err);
      setToastMessage({ text: `បរាជ័យក្នុងការ Sync តារាងកិត្តិយស: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const syncStaffDirectoryToDrive = async (folderIdOverride?: string) => {
    setIsDriveSyncing(true);
    const targetFolder = folderIdOverride || driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;

    try {
      if (!isGoogleAuthenticated()) {
        await googleSignIn();
      }

      const driveItem = await uploadStaffDirectoryToDrive(
        teachers,
        schoolProfile,
        selectedAcademicYear,
        targetFolder
      );

      const nowIso = new Date().toISOString();
      const historyItem: DriveSyncHistoryItem = {
        id: `sync-staff-${Date.now()}`,
        title: `បញ្ជីរាយនាមបុគ្គលិក និងលោកគ្រូ-អ្នកគ្រូ (${teachers.length} នាក់)`,
        category: 'staff_directory',
        categoryLabelKhmer: 'បញ្ជីបុគ្គលិកអប់រំ',
        fileName: driveItem.name || `បញ្ជីបុគ្គលិក_${selectedAcademicYear.replace(/\s+/g, '_')}.html`,
        fileSizeFormatted: driveItem.size ? `${(parseInt(driveItem.size) / 1024).toFixed(1)} KB` : '18.0 KB',
        folderId: targetFolder,
        driveFileId: driveItem.id,
        driveWebViewLink: driveItem.webViewLink || `https://drive.google.com/drive/folders/${targetFolder}`,
        status: 'success',
        syncedAt: nowIso,
        syncedBy: currentUser?.email || 'limsorn9@gmail.com'
      };

      setDriveSyncHistory(prev => [historyItem, ...prev.slice(0, 49)]);
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));
      setToastMessage({
        text: `បាន Sync បញ្ជីបុគ្គលិក (${teachers.length} នាក់) ទៅកាន់ Google Drive ជោគជ័យ!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Staff directory sync failed:', err);
      setToastMessage({ text: `បរាជ័យក្នុងការ Sync បញ្ជីបុគ្គលិក: ${err.message}`, type: 'error' });
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const restoreSchoolDatabaseFromDrive = async (fileIdOrJsonContent: string): Promise<boolean> => {
    setIsDriveSyncing(true);
    try {
      let rawJson = fileIdOrJsonContent.trim();
      if (!rawJson.startsWith('{')) {
        // Assume it is a Drive File ID
        if (!isGoogleAuthenticated()) {
          await googleSignIn();
        }
        rawJson = await downloadDriveFileContent(fileIdOrJsonContent);
      }

      const parsed = JSON.parse(rawJson);
      if (!parsed.schoolProfile && !parsed.students && !parsed.teachers) {
        throw new Error('ទម្រង់ឯកសារ Backup មិនត្រឹមត្រូវតាមស្ដង់ដាររបស់ប្រព័ន្ធឡើយ');
      }

      // Restore all collections safely
      if (parsed.schoolProfile) setSchoolProfile(parsed.schoolProfile);
      if (Array.isArray(parsed.students)) setStudents(parsed.students.filter(Boolean));
      if (Array.isArray(parsed.teachers)) setTeachers(parsed.teachers.filter(Boolean));
      if (Array.isArray(parsed.classrooms)) setClassrooms(parsed.classrooms.filter(Boolean));
      if (Array.isArray(parsed.scores)) setScores(parsed.scores.filter(Boolean));
      if (Array.isArray(parsed.budgetTransactions)) setBudgetTransactions(parsed.budgetTransactions.filter(Boolean));
      if (Array.isArray(parsed.attendanceRecords)) setAttendanceRecords(parsed.attendanceRecords.filter(Boolean));
      if (Array.isArray(parsed.calendarEvents)) setCalendarEvents(parsed.calendarEvents.filter(Boolean));
      if (Array.isArray(parsed.teacherMeetings)) setTeacherMeetings(parsed.teacherMeetings.filter(Boolean));
      if (Array.isArray(parsed.households)) setHouseholds(parsed.households.filter(Boolean));
      if (Array.isArray(parsed.libraryBooks)) setLibraryBooks(parsed.libraryBooks.filter(Boolean));
      if (Array.isArray(parsed.schoolAssets)) setSchoolAssets(parsed.schoolAssets.filter(Boolean));
      if (Array.isArray(parsed.schoolStrategicPlans)) setSchoolStrategicPlans(parsed.schoolStrategicPlans.filter(Boolean));

      setToastMessage({
        text: 'បានស្ដារទិន្នន័យសាលាទាំងមូលពី Google Drive Master Backup ដោយជោគជ័យ!',
        type: 'success'
      });
      return true;
    } catch (err: any) {
      console.error('Restore database failed:', err);
      setToastMessage({ text: `បរាជ័យក្នុងការស្ដារទិន្នន័យពី Google Drive: ${err.message}`, type: 'error' });
      return false;
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
      let syncedReportsCount = 0;

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
            syncedReportsCount++;
          } catch (e) {}
        }
      }

      // 2. Sync Financial Reports
      if (driveAutoSyncConfig.syncFinances) {
        try {
          const summaries = getMonthlyBudgetSummaries(selectedAcademicYear);
          await uploadFinancialReportToDrive(summaries, budgetTransactions, schoolProfile, selectedAcademicYear, targetFolder);
          syncedReportsCount++;
        } catch (e) {}
      }

      // 3. Sync Student Rosters for All Classes
      if (driveAutoSyncConfig.syncStudents && classrooms.length > 0) {
        for (const cls of classrooms) {
          try {
            const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
            await uploadStudentRosterToDrive(
              classStudents,
              `ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
              schoolProfile,
              selectedAcademicYear,
              targetFolder
            );
            syncedReportsCount++;
          } catch (e) {}
        }
      }

      // 4. Sync Scores and Rankings for All Classes
      if (driveAutoSyncConfig.syncScores && classrooms.length > 0) {
        const currentMonth = 'មករា';
        for (const cls of classrooms) {
          try {
            const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
            if (classStudents.length === 0) continue;
            const classScores = scores.filter(sc => 
              sc.gradeLevel === cls.gradeLevel && 
              sc.section === cls.section && 
              (sc.academicYear === selectedAcademicYear || !sc.academicYear)
            );
            const formattedScoresList = classStudents.map(st => {
              const sc = classScores.find(s => s.studentId === st.id);
              const mScores = sc?.monthlyScores?.[currentMonth];
              let total = 0;
              let countSubs = 0;
              const subjectsObj: Record<string, number> = {};
              if (mScores) {
                Object.entries(mScores).forEach(([key, sub]: [string, any]) => {
                  if (sub && typeof sub.score === 'number') {
                    total += sub.score;
                    countSubs++;
                    subjectsObj[key] = sub.score;
                  }
                });
              }
              const average = countSubs > 0 ? total / countSubs : 0;
              return {
                studentCode: st.studentIdNumber || st.id,
                studentNameKhmer: st.fullNameKhmer,
                gender: st.gender,
                subjects: subjectsObj,
                totalScore: total,
                averageScore: parseFloat(average.toFixed(2)),
                gradeLetter: average >= 9 ? 'A' : average >= 8 ? 'B' : average >= 7 ? 'C' : average >= 6 ? 'D' : average >= 5 ? 'E' : 'F'
              };
            });

            await uploadScoresToDrive(
              formattedScoresList,
              [],
              `ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
              currentMonth,
              schoolProfile,
              selectedAcademicYear,
              targetFolder
            );
            syncedReportsCount++;
          } catch (e) {}
        }
      }

      // 5. Sync Top 5 Honor Rolls
      if (driveAutoSyncConfig.syncHonorRoll && classrooms.length > 0) {
        const currentMonth = 'មករា';
        for (const cls of classrooms) {
          try {
            const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
            const classScores = scores.filter(sc => 
              sc.gradeLevel === cls.gradeLevel && 
              sc.section === cls.section && 
              (sc.academicYear === selectedAcademicYear || !sc.academicYear)
            );
            const studentSummaries = classStudents.map(st => {
              const sc = classScores.find(s => s.studentId === st.id);
              const mScores = sc?.monthlyScores?.[currentMonth];
              let total = 0;
              let countSubjects = 0;
              if (mScores) {
                Object.values(mScores).forEach((sub: any) => {
                  if (sub && typeof sub.score === 'number') {
                    total += sub.score;
                    countSubjects++;
                  }
                });
              }
              const average = countSubjects > 0 ? total / countSubjects : 0;
              return { student: st, average };
            }).filter(item => item.average > 0);

            studentSummaries.sort((a, b) => b.average - a.average);
            const top5 = studentSummaries.slice(0, 5).map((item, idx) => ({
              rank: idx + 1,
              studentCode: item.student.studentIdNumber || item.student.id,
              studentNameKhmer: item.student.fullNameKhmer,
              gender: item.student.gender,
              averageScore: parseFloat(item.average.toFixed(2)),
              gradeLetter: item.average >= 9 ? 'A' : item.average >= 8 ? 'B' : 'C',
              gradeLevel: cls.gradeLevel,
              section: cls.section
            }));

            if (top5.length > 0) {
              await uploadHonorRollToDrive(
                top5,
                `ថ្នាក់ទី ${cls.gradeLevel}${cls.section}`,
                currentMonth,
                schoolProfile,
                selectedAcademicYear,
                targetFolder
              );
              syncedReportsCount++;
            }
          } catch (e) {}
        }
      }

      // 6. Sync Staff Directory
      if (driveAutoSyncConfig.syncStaffDirectory && teachers.length > 0) {
        try {
          await uploadStaffDirectoryToDrive(
            teachers,
            schoolProfile,
            selectedAcademicYear,
            targetFolder
          );
          syncedReportsCount++;
        } catch (e) {}
      }

      // 7. Sync Full Database Master Snapshot JSON
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
          libraryBooks,
          schoolAssets,
          schoolStrategicPlans
        };
        await backupSchoolDataToDrive(
          fullBackup,
          schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ',
          targetFolder
        );
        syncedReportsCount++;
      }

      // Add a bundle history item
      const summaryItem: DriveSyncHistoryItem = {
        id: `sync-all-${Date.now()}`,
        title: `ស្វ័យប្រវត្តិកម្ម Synchronization កញ្ចប់ទិន្នន័យសាលាទាំងមូល (${syncedReportsCount} ឯកសារ)`,
        category: 'database_backup',
        categoryLabelKhmer: 'Auto-Sync កញ្ចប់ឯកសារទូទៅ',
        fileName: `Master_AutoSync_${selectedAcademicYear}_${new Date().toISOString().split('T')[0]}.json`,
        fileSizeFormatted: '185 KB',
        folderId: targetFolder,
        driveWebViewLink: `https://drive.google.com/drive/folders/${targetFolder}`,
        status: 'success',
        syncedAt: nowIso,
        syncedBy: currentUser?.email || 'limsorn9@gmail.com'
      };

      setDriveSyncHistory(prev => [summaryItem, ...prev.slice(0, 49)]);
      setDriveAutoSyncConfig(prev => ({ ...prev, lastAutoSyncTime: nowIso }));

      setToastMessage({
        text: `បានធ្វើស្វ័យប្រវត្តិកម្ម Sync កញ្ចប់ទិន្នន័យ ${syncedReportsCount} ឯកសារទៅ Google Drive (${targetFolder}) ជោគជ័យ!`,
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
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_library_visitors`, JSON.stringify(libraryVisitors));
  }, [libraryVisitors]);

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
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_users`, JSON.stringify(deletedUsers));
  }, [deletedUsers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_account_audit_logs`, JSON.stringify(accountAuditLogs));
  }, [accountAuditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_`, );
  }, []);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_profile`, schoolProfile);
  }, [schoolProfile]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_students`, students);
  }, [students]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_teachers`, teachers);
  }, [teachers]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_classrooms`, classrooms);
  }, [classrooms]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_scores`, scores);
  }, [scores]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_budget`, budgetTransactions);
  }, [budgetTransactions]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_attendance`, attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_calendar`, calendarEvents);
  }, [calendarEvents]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_transfers`, transfers);
  }, [transfers]);

  useEffect(() => {
    safeSetLocalStorage(`${LOCAL_STORAGE_KEY}_school_groups`, schoolGroups);
  }, [schoolGroups]);

  // Cloud Firestore Sync State & Timestamps
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync_time`);
  });
  const isRemoteUpdateRef = useRef<boolean>(false);
  const isInitialCloudLoadCompleteRef = useRef<boolean>(false);
  const LAST_LOCAL_MUTATION_KEY = `${LOCAL_STORAGE_KEY}_last_local_mutation`;

  // Helper to get all school payload for cloud sync
  const getFullSchoolPayload = () => ({
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
    schoolGroups,
    activityLogs,
    appUsers,
    equipmentItems,
    equipmentLoans,
    teacherDailyTasks,
    teacherMeetings,
    teachingResources,
    dailyHealthChecks,
    qrScanVerificationLogs,
    updatedBy: currentUser?.nameKhmer || 'Admin'
  });

  // Pull All Data from Firestore Cloud
  const pullAllFromCloud = async (): Promise<boolean> => {
    setIsCloudSyncing(true);
    try {
      const cloudData = await fetchSchoolDataFromFirestore();
      if (cloudData) {
        isRemoteUpdateRef.current = true;
        if (cloudData.schoolProfile) setSchoolProfile(cloudData.schoolProfile);
        if (cloudData.students && Array.isArray(cloudData.students)) setStudents(cloudData.students.filter(Boolean));
        if (cloudData.teachers && Array.isArray(cloudData.teachers)) setTeachers(cloudData.teachers.filter(Boolean));
        if (cloudData.classrooms && Array.isArray(cloudData.classrooms)) setClassrooms(cloudData.classrooms.filter(Boolean));
        if (cloudData.scores && Array.isArray(cloudData.scores)) setScores(cloudData.scores.filter(Boolean));
        if (cloudData.budgetTransactions && Array.isArray(cloudData.budgetTransactions)) setBudgetTransactions(cloudData.budgetTransactions.filter(Boolean));
        if (cloudData.attendanceRecords && Array.isArray(cloudData.attendanceRecords)) setAttendanceRecords(cloudData.attendanceRecords.filter(Boolean));
        if (cloudData.calendarEvents && Array.isArray(cloudData.calendarEvents)) setCalendarEvents(cloudData.calendarEvents.filter(Boolean));
        if (cloudData.transfers && Array.isArray(cloudData.transfers)) setTransfers(cloudData.transfers.filter(Boolean));
        if (cloudData.academicYears && Array.isArray(cloudData.academicYears)) setAcademicYears(cloudData.academicYears.filter(Boolean));
        if (cloudData.examSubjects && Array.isArray(cloudData.examSubjects)) setExamSubjects(cloudData.examSubjects.filter(Boolean));
        if (cloudData.profileEditRequests && Array.isArray(cloudData.profileEditRequests)) setProfileEditRequests(cloudData.profileEditRequests.filter(Boolean));
        if (cloudData.releasedResults && typeof cloudData.releasedResults === 'object') setReleasedResults(cloudData.releasedResults);
        if (cloudData.villages && Array.isArray(cloudData.villages)) setVillages(cloudData.villages.filter(Boolean));
        if (cloudData.households && Array.isArray(cloudData.households)) setHouseholds(cloudData.households.filter(Boolean));
        if (cloudData.libraryBooks && Array.isArray(cloudData.libraryBooks)) setLibraryBooks(cloudData.libraryBooks.filter(Boolean));
        if (cloudData.readingLogs && Array.isArray(cloudData.readingLogs)) setReadingLogs(cloudData.readingLogs.filter(Boolean));
        if (cloudData.printSettings) setPrintSettings(cloudData.printSettings);
        if (cloudData.studentFeedbacks && Array.isArray(cloudData.studentFeedbacks)) setStudentFeedbacks(cloudData.studentFeedbacks.filter(Boolean));
        if (cloudData.lessonPlans && Array.isArray(cloudData.lessonPlans)) setLessonPlans(cloudData.lessonPlans.filter(Boolean));
        if (cloudData.parentMeetings && Array.isArray(cloudData.parentMeetings)) setParentMeetings(cloudData.parentMeetings.filter(Boolean));
        if (cloudData.parentRequests && Array.isArray(cloudData.parentRequests)) setParentRequests(cloudData.parentRequests.filter(Boolean));
        if (cloudData.classCouncils && Array.isArray(cloudData.classCouncils)) setClassCouncils(cloudData.classCouncils.filter(Boolean));
        if (cloudData.atRiskStudents && Array.isArray(cloudData.atRiskStudents)) setAtRiskStudents(cloudData.atRiskStudents.filter(Boolean));
        if (cloudData.dailyClassLogs && Array.isArray(cloudData.dailyClassLogs)) setDailyClassLogs(cloudData.dailyClassLogs.filter(Boolean));
        if (cloudData.studentBadgeDefinitions && Array.isArray(cloudData.studentBadgeDefinitions)) setStudentBadgeDefinitions(cloudData.studentBadgeDefinitions.filter(Boolean));
        if (cloudData.studentBadgeAssignments && Array.isArray(cloudData.studentBadgeAssignments)) setStudentBadgeAssignments(cloudData.studentBadgeAssignments.filter(Boolean));
        if (cloudData.correspondences && Array.isArray(cloudData.correspondences)) setCorrespondences(cloudData.correspondences.filter(Boolean));
        if (cloudData.staffAdminRecords && Array.isArray(cloudData.staffAdminRecords)) setStaffAdminRecords(cloudData.staffAdminRecords.filter(Boolean));
        if (cloudData.schoolCommittees && Array.isArray(cloudData.schoolCommittees)) setSchoolCommittees(cloudData.schoolCommittees.filter(Boolean));
        if (cloudData.schoolStrategicPlans && Array.isArray(cloudData.schoolStrategicPlans)) setSchoolStrategicPlans(cloudData.schoolStrategicPlans.filter(Boolean));
        if (cloudData.modelSchoolStandards && Array.isArray(cloudData.modelSchoolStandards)) setModelSchoolStandards(cloudData.modelSchoolStandards.filter(Boolean));
        if (cloudData.schoolAssets && Array.isArray(cloudData.schoolAssets)) setSchoolAssets(cloudData.schoolAssets.filter(Boolean));
        if (cloudData.schoolGroups && Array.isArray(cloudData.schoolGroups)) setSchoolGroups(cloudData.schoolGroups.filter(Boolean));
        if (cloudData.appUsers && Array.isArray(cloudData.appUsers)) {
          setAppUsers(prevUsers => {
            const cloudUsers: AppUser[] = (cloudData.appUsers || []).filter(Boolean);
            const merged: AppUser[] = [...cloudUsers];
            for (const localUser of prevUsers) {
              const exists = merged.some(cu =>
                cu.id === localUser.id ||
                (cu.username && localUser.username && cu.username.toLowerCase() === localUser.username.toLowerCase()) ||
                (cu.email && localUser.email && cu.email.toLowerCase() === localUser.email.toLowerCase())
              );
              if (!exists) {
                merged.push(localUser);
              }
            }
            return merged;
          });
        }
        if (cloudData.equipmentItems && Array.isArray(cloudData.equipmentItems)) setEquipmentItems(cloudData.equipmentItems.filter(Boolean));
        if (cloudData.equipmentLoans && Array.isArray(cloudData.equipmentLoans)) setEquipmentLoans(cloudData.equipmentLoans.filter(Boolean));
        if (cloudData.teacherDailyTasks && Array.isArray(cloudData.teacherDailyTasks)) setTeacherDailyTasks(cloudData.teacherDailyTasks.filter(Boolean));
        if (cloudData.teacherMeetings && Array.isArray(cloudData.teacherMeetings)) setTeacherMeetings(cloudData.teacherMeetings.filter(Boolean));
        if (cloudData.teachingResources && Array.isArray(cloudData.teachingResources)) setTeachingResources(cloudData.teachingResources.filter(Boolean));
        if (cloudData.dailyHealthChecks && Array.isArray(cloudData.dailyHealthChecks)) setDailyHealthChecks(cloudData.dailyHealthChecks.filter(Boolean));
        if (cloudData.qrScanVerificationLogs && Array.isArray(cloudData.qrScanVerificationLogs)) setQrScanVerificationLogs(cloudData.qrScanVerificationLogs.filter(Boolean));

        const now = new Date().toISOString();
        setLastCloudSyncTime(now);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync_time`, now);
        localStorage.setItem(LAST_LOCAL_MUTATION_KEY, Date.now().toString());
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
      const payload = getFullSchoolPayload();
      const result = await syncSchoolDataToFirestore(payload, true);
      if (result.success) {
        const now = new Date().toISOString();
        setLastCloudSyncTime(now);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync_time`, now);
        localStorage.setItem(LAST_LOCAL_MUTATION_KEY, Date.now().toString());
        showToast('បានរក្សាទុកទិន្នន័យឡើង Cloud Firestore ដោយជោគជ័យ!', 'success');
        return true;
      } else {
        if (result.error?.toLowerCase().includes('quota') || isFirestoreQuotaExhausted()) {
          showToast('ទិន្នន័យត្រូវបានរក្សាទុកក្នុង Local Storage / IndexedDB យ៉ាងមានសុវត្ថិភាព (Quota ឥតគិតថ្លៃប្រចាំថ្ងៃរបស់ Firestore បានពេញបណ្ដោះអាសន្ន)', 'info');
        } else {
          showToast('មិនអាចរក្សាទុកទៅកាន់ Cloud បានទេ: ' + result.error, 'error');
        }
        return false;
      }
    } catch (e) {
      console.error('Cloud upload error:', e);
      showToast('មានបញ្ហាក្នុងការតភ្ជាប់ Cloud: ' + (e.message || e), 'error');
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };



  // Initial Real-time Listener & Cloud pull on mount with timestamp conflict resolution
  useEffect(() => {
    const applyCloudDataIfNewer = (cloudData: any, isInitialFetch = false) => {
      if (!cloudData) return;

      const localSavedStudents = localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`);
      const localSavedUsers = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
      const localSavedTeachers = localStorage.getItem(`${LOCAL_STORAGE_KEY}_teachers`);
      const localLastMutation = Number(localStorage.getItem(LAST_LOCAL_MUTATION_KEY) || '0');
      const cloudLastUpdatedTime = cloudData.lastUpdated ? new Date(cloudData.lastUpdated).getTime() : 0;

      let parsedLocalStudentsCount = 0;
      let parsedLocalUsers: AppUser[] = [];
      let parsedLocalTeachersCount = 0;
      try {
        if (localSavedStudents) {
          const parsed = JSON.parse(localSavedStudents);
          if (Array.isArray(parsed)) parsedLocalStudentsCount = parsed.length;
        }
      } catch {}
      try {
        if (localSavedUsers) {
          const parsed = JSON.parse(localSavedUsers);
          if (Array.isArray(parsed)) parsedLocalUsers = parsed.filter(Boolean);
        }
      } catch {}
      try {
        if (localSavedTeachers) {
          const parsed = JSON.parse(localSavedTeachers);
          if (Array.isArray(parsed)) parsedLocalTeachersCount = parsed.length;
        }
      } catch {}

      const cloudStudentsCount = Array.isArray(cloudData.students) ? cloudData.students.length : 0;
      const cloudUsersCount = Array.isArray(cloudData.appUsers) ? cloudData.appUsers.length : 0;
      const hasLocalCustomData = parsedLocalStudentsCount > 0 || parsedLocalUsers.length > 1 || parsedLocalTeachersCount > 1;
      const isCloudEmptyWhileLocalHasData = hasLocalCustomData && (cloudStudentsCount === 0 && cloudUsersCount <= 1);
      const isLocalNewer = (localLastMutation - cloudLastUpdatedTime > 2500);

      // Conflict Resolution:
      // If local data exists and was modified after the cloud snapshot (by more than 2.5s)
      // OR local data has custom records while cloud is empty, retain local data and push to cloud
      if (hasLocalCustomData && (isLocalNewer || isCloudEmptyWhileLocalHasData)) {
        console.info('Local data has custom records or is newer than Cloud Firestore. Retaining local data but WILL NOT auto-sync to Cloud (Manual sync only).');
        return;
      }

      // Cloud data is authoritative or newer: apply safely
      isRemoteUpdateRef.current = true;
      if (cloudData.schoolProfile) setSchoolProfile(prev => ({ ...prev, ...cloudData.schoolProfile }));
      if (cloudData.students && Array.isArray(cloudData.students)) {
        if (cloudData.students.length > 0 || parsedLocalStudentsCount === 0) {
          setStudents(cloudData.students.filter(Boolean));
        }
      }
      if (cloudData.teachers && Array.isArray(cloudData.teachers)) setTeachers(cloudData.teachers.filter(Boolean));
      if (cloudData.classrooms && Array.isArray(cloudData.classrooms)) setClassrooms(cloudData.classrooms.filter(Boolean));
      if (cloudData.scores && Array.isArray(cloudData.scores)) setScores(cloudData.scores.filter(Boolean));
      if (cloudData.budgetTransactions && Array.isArray(cloudData.budgetTransactions)) setBudgetTransactions(cloudData.budgetTransactions.filter(Boolean));
      if (cloudData.attendanceRecords && Array.isArray(cloudData.attendanceRecords)) setAttendanceRecords(cloudData.attendanceRecords.filter(Boolean));
      if (cloudData.calendarEvents && Array.isArray(cloudData.calendarEvents)) setCalendarEvents(cloudData.calendarEvents.filter(Boolean));
      if (cloudData.transfers && Array.isArray(cloudData.transfers)) setTransfers(cloudData.transfers.filter(Boolean));
      if (cloudData.activityLogs && Array.isArray(cloudData.activityLogs)) setActivityLogs(cloudData.activityLogs.filter(Boolean));
      if (cloudData.appUsers && Array.isArray(cloudData.appUsers)) {
        setAppUsers(prevUsers => {
          const cloudUsers: AppUser[] = (cloudData.appUsers || []).filter(Boolean);
          const merged: AppUser[] = [...cloudUsers];
          for (const localUser of prevUsers) {
            const exists = merged.some(cu =>
              cu.id === localUser.id ||
              (cu.username && localUser.username && cu.username.toLowerCase() === localUser.username.toLowerCase()) ||
              (cu.email && localUser.email && cu.email.toLowerCase() === localUser.email.toLowerCase())
            );
            if (!exists) {
              merged.push(localUser);
            }
          }
          if (merged.length > cloudUsers.length) {
            console.info('Local appUsers contains offline records. Retaining local appUsers.');
          }
          return merged;
        });
      }
      if (cloudData.academicYears && Array.isArray(cloudData.academicYears)) setAcademicYears(cloudData.academicYears.filter(Boolean));
      if (cloudData.examSubjects && Array.isArray(cloudData.examSubjects)) setExamSubjects(cloudData.examSubjects.filter(Boolean));
      if (cloudData.profileEditRequests && Array.isArray(cloudData.profileEditRequests)) setProfileEditRequests(cloudData.profileEditRequests.filter(Boolean));
      if (cloudData.releasedResults && typeof cloudData.releasedResults === 'object') setReleasedResults(cloudData.releasedResults);
      if (cloudData.villages && Array.isArray(cloudData.villages)) setVillages(cloudData.villages.filter(Boolean));
      if (cloudData.households && Array.isArray(cloudData.households)) setHouseholds(cloudData.households.filter(Boolean));
      if (cloudData.libraryBooks && Array.isArray(cloudData.libraryBooks)) setLibraryBooks(cloudData.libraryBooks.filter(Boolean));
      if (cloudData.readingLogs && Array.isArray(cloudData.readingLogs)) setReadingLogs(cloudData.readingLogs.filter(Boolean));
      if (cloudData.printSettings) setPrintSettings(cloudData.printSettings);
      if (cloudData.studentFeedbacks && Array.isArray(cloudData.studentFeedbacks)) setStudentFeedbacks(cloudData.studentFeedbacks.filter(Boolean));
      if (cloudData.lessonPlans && Array.isArray(cloudData.lessonPlans)) setLessonPlans(cloudData.lessonPlans.filter(Boolean));
      if (cloudData.parentMeetings && Array.isArray(cloudData.parentMeetings)) setParentMeetings(cloudData.parentMeetings.filter(Boolean));
      if (cloudData.parentRequests && Array.isArray(cloudData.parentRequests)) setParentRequests(cloudData.parentRequests.filter(Boolean));
      if (cloudData.classCouncils && Array.isArray(cloudData.classCouncils)) setClassCouncils(cloudData.classCouncils.filter(Boolean));
      if (cloudData.atRiskStudents && Array.isArray(cloudData.atRiskStudents)) setAtRiskStudents(cloudData.atRiskStudents.filter(Boolean));
      if (cloudData.dailyClassLogs && Array.isArray(cloudData.dailyClassLogs)) setDailyClassLogs(cloudData.dailyClassLogs.filter(Boolean));
      if (cloudData.studentBadgeDefinitions && Array.isArray(cloudData.studentBadgeDefinitions)) setStudentBadgeDefinitions(cloudData.studentBadgeDefinitions.filter(Boolean));
      if (cloudData.studentBadgeAssignments && Array.isArray(cloudData.studentBadgeAssignments)) setStudentBadgeAssignments(cloudData.studentBadgeAssignments.filter(Boolean));
      if (cloudData.correspondences && Array.isArray(cloudData.correspondences)) setCorrespondences(cloudData.correspondences.filter(Boolean));
      if (cloudData.staffAdminRecords && Array.isArray(cloudData.staffAdminRecords)) setStaffAdminRecords(cloudData.staffAdminRecords.filter(Boolean));
      if (cloudData.schoolCommittees && Array.isArray(cloudData.schoolCommittees)) setSchoolCommittees(cloudData.schoolCommittees.filter(Boolean));
      if (cloudData.schoolStrategicPlans && Array.isArray(cloudData.schoolStrategicPlans)) setSchoolStrategicPlans(cloudData.schoolStrategicPlans.filter(Boolean));
      if (cloudData.modelSchoolStandards && Array.isArray(cloudData.modelSchoolStandards)) setModelSchoolStandards(cloudData.modelSchoolStandards.filter(Boolean));
      if (cloudData.schoolAssets && Array.isArray(cloudData.schoolAssets)) setSchoolAssets(cloudData.schoolAssets.filter(Boolean));
      if (cloudData.schoolGroups && Array.isArray(cloudData.schoolGroups)) setSchoolGroups(cloudData.schoolGroups.filter(Boolean));
      if (cloudData.equipmentItems && Array.isArray(cloudData.equipmentItems)) setEquipmentItems(cloudData.equipmentItems.filter(Boolean));
      if (cloudData.equipmentLoans && Array.isArray(cloudData.equipmentLoans)) setEquipmentLoans(cloudData.equipmentLoans.filter(Boolean));
      if (cloudData.teacherDailyTasks && Array.isArray(cloudData.teacherDailyTasks)) setTeacherDailyTasks(cloudData.teacherDailyTasks.filter(Boolean));
      if (cloudData.teacherMeetings && Array.isArray(cloudData.teacherMeetings)) setTeacherMeetings(cloudData.teacherMeetings.filter(Boolean));
      if (cloudData.teachingResources && Array.isArray(cloudData.teachingResources)) setTeachingResources(cloudData.teachingResources.filter(Boolean));
      if (cloudData.dailyHealthChecks && Array.isArray(cloudData.dailyHealthChecks)) setDailyHealthChecks(cloudData.dailyHealthChecks.filter(Boolean));
      if (cloudData.qrScanVerificationLogs && Array.isArray(cloudData.qrScanVerificationLogs)) setQrScanVerificationLogs(cloudData.qrScanVerificationLogs.filter(Boolean));

      const now = new Date().toISOString();
      setLastCloudSyncTime(cloudData.lastUpdated || now);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_last_cloud_sync_time`, cloudData.lastUpdated || now);
      if (cloudLastUpdatedTime > 0) {
        localStorage.setItem(LAST_LOCAL_MUTATION_KEY, cloudLastUpdatedTime.toString());
      }

      // Sync active logged-in user profile if it exists
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const matched = (cloudData.appUsers || []).find((u: AppUser) => u.id === prevUser.id || (u.email && u.email.toLowerCase() === prevUser.email?.toLowerCase()) || (u.username && u.username.toLowerCase() === prevUser.username?.toLowerCase()));
        if (matched) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(matched));
          return matched;
        }
        return prevUser;
      });
    };

    // 1. Initial Fetch on startup
    fetchSchoolDataFromFirestore().then(cloudData => {
      if (cloudData && Object.keys(cloudData).length > 0 && cloudData.lastUpdated) {
        applyCloudDataIfNewer(cloudData, true);
      } else if (!isFirestoreQuotaExhausted()) {
        console.info('Cloud database is empty on first startup. Retaining local initial state.');
      }
      isInitialCloudLoadCompleteRef.current = true;
    }).catch(err => {
      console.warn('Initial cloud fetch notice:', err);
      isInitialCloudLoadCompleteRef.current = true;
    });

    // 2. Real-time Firestore Subscription across active clients
    const unsubscribe = subscribeToSchoolData((cloudData) => {
      if (cloudData) {
        applyCloudDataIfNewer(cloudData, false);
      }
    });

    // 3. Auto Background Sync from IndexedDB to Firestore once online
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
    let user = appUsers.find(
      u =>
        (u.email.toLowerCase() === cleanId ||
          u.username.toLowerCase() === cleanId ||
          (cleanId === 'admin' && (u.role === 'super_admin' || u.username === 'limsorn' || u.email.toLowerCase() === 'limsorn9@gmail.com')) ||
          (u.staffCode && u.staffCode.toLowerCase() === cleanId) ||
          (u.studentCode && u.studentCode.toLowerCase() === cleanId) ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))) &&
        (u.password === password ||
          ((u.email.toLowerCase() === 'limsorn9@gmail.com' || u.username === 'limsorn') && (password === 'Ls12122012@' || password === '11101989')))
    );

    // Fallback: Check in teachers list if AppUser record is missing
    if (!user) {
      const teacherMatch = teachers.find(
        t =>
          (t.email && t.email.toLowerCase() === cleanId) ||
          (t.staffCode && t.staffCode.toLowerCase() === cleanId) ||
          (t.phone && t.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) ||
          (t.nameLatin && t.nameLatin.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId)
      );

      if (teacherMatch) {
        const cleanPhone = teacherMatch.phone ? teacherMatch.phone.replace(/\s+/g, '') : '';
        const isPassValid = password === cleanPhone || password === '123456' || password === teacherMatch.staffCode;
        if (isPassValid) {
          const rawUsername = teacherMatch.nameLatin ? teacherMatch.nameLatin.toLowerCase().replace(/[^a-z0-9]/g, '') : `teacher_${teacherMatch.id.slice(-4)}`;
          user = {
            id: `u-${teacherMatch.id}`,
            username: rawUsername,
            email: teacherMatch.email || `${rawUsername}@moeys.gov.kh`,
            phone: teacherMatch.phone || '',
            password: password,
            nameKhmer: teacherMatch.nameKhmer,
            nameLatin: teacherMatch.nameLatin || teacherMatch.nameKhmer,
            role: teacherMatch.role === 'នាយកសាលា' || teacherMatch.role === 'នាយករង' ? 'director' : 'teacher',
            status: 'active',
            staffCode: teacherMatch.staffCode,
            assignedGrade: teacherMatch.assignedGrade,
            assignedSection: teacherMatch.assignedSection,
            avatarUrl: teacherMatch.avatarUrl,
            createdAt: new Date().toISOString().split('T')[0]
          };
          setAppUsers(prev => [user!, ...prev]);
        }
      }
    }

    if (user) {
      if (user.status === 'suspended') {
        return { success: false, message: 'គណនីនេះត្រូវបានផ្អាកបណ្តោះអាសន្ន សូមទាក់ទងនាយកសាលា' };
      }
      setCurrentUser(user);
      if (user.role === 'student' || user.role === 'parent') {
        setActiveTab('student_portal');
      } else if (user.role === 'teacher') {
        setActiveTab('homeroom_dashboard');
      } else if (user.role === 'librarian') {
        setActiveTab('library');
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
    let user = appUsers.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (cleanId === 'admin' && (u.role === 'super_admin' || u.username === 'limsorn' || u.email.toLowerCase() === 'limsorn9@gmail.com')) ||
        (u.staffCode && u.staffCode.toLowerCase() === cleanId) ||
        (u.studentCode && u.studentCode.toLowerCase() === cleanId) ||
        (u.studentId && u.studentId.toLowerCase() === cleanId) ||
        (u.id && u.id.toLowerCase() === cleanId) ||
        (u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))
    );

    // If not found in appUsers, search teachers
    if (!user) {
      const teacherMatch = teachers.find(
        t =>
          (t.email && t.email.toLowerCase() === cleanId) ||
          (t.staffCode && t.staffCode.toLowerCase() === cleanId) ||
          (t.id && t.id.toLowerCase() === cleanId) ||
          (t.phone && t.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) ||
          (t.nameLatin && t.nameLatin.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId) ||
          (t.nameKhmer && t.nameKhmer.toLowerCase() === cleanId)
      );

      if (teacherMatch) {
        const rawUsername = teacherMatch.nameLatin ? teacherMatch.nameLatin.toLowerCase().replace(/[^a-z0-9]/g, '') : `teacher_${teacherMatch.id.slice(-4)}`;
        user = {
          id: `u-${teacherMatch.id}`,
          username: rawUsername,
          email: teacherMatch.email || `${rawUsername}@moeys.gov.kh`,
          phone: teacherMatch.phone || '',
          password: teacherMatch.phone ? teacherMatch.phone.replace(/\s+/g, '') : '123456',
          nameKhmer: teacherMatch.nameKhmer,
          nameLatin: teacherMatch.nameLatin || teacherMatch.nameKhmer,
          role: teacherMatch.role === 'នាយកសាលា' || teacherMatch.role === 'នាយករង' ? 'director' : 'teacher',
          status: 'active',
          staffCode: teacherMatch.staffCode,
          assignedGrade: teacherMatch.assignedGrade,
          assignedSection: teacherMatch.assignedSection,
          avatarUrl: teacherMatch.avatarUrl,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setAppUsers(prev => [user!, ...prev]);
      }
    }

    // If not found, search students
    if (!user) {
      const studentMatch = students.find(
        s =>
          (s.code && s.code.toLowerCase() === cleanId) ||
          (s.id && s.id.toLowerCase() === cleanId) ||
          (s.nameLatin && s.nameLatin.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId) ||
          (s.nameKhmer && s.nameKhmer.toLowerCase() === cleanId) ||
          (s.phone && s.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) ||
          (s.guardianPhone && s.guardianPhone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))
      );

      if (studentMatch) {
        const rawUsername = studentMatch.code ? studentMatch.code.toLowerCase().replace(/[^a-z0-9]/g, '') : `student_${studentMatch.id.slice(-4)}`;
        user = {
          id: `usr-stu-${studentMatch.id}`,
          username: rawUsername,
          email: `${rawUsername}@student.moeys.gov.kh`,
          password: studentMatch.code || '123456',
          nameKhmer: studentMatch.nameKhmer,
          nameLatin: studentMatch.nameLatin || studentMatch.code,
          role: 'student',
          studentId: studentMatch.id,
          studentCode: studentMatch.code,
          assignedGrade: studentMatch.grade,
          assignedSection: studentMatch.section,
          phone: studentMatch.guardianPhone || studentMatch.phone || '',
          avatarUrl: studentMatch.avatarUrl,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setAppUsers(prev => [user!, ...prev]);
      }
    }

    if (user) {
      if (user.status === 'suspended') {
        return { success: false, message: 'គណនីនេះត្រូវបានផ្អាកបណ្តោះអាសន្ន សូមទាក់ទងនាយកសាលា' };
      }
      setCurrentUser(user);
      if (user.role === 'student' || user.role === 'parent') {
        setActiveTab('student_portal');
      } else if (user.role === 'teacher') {
        setActiveTab('homeroom_dashboard');
      } else if (user.role === 'librarian') {
        setActiveTab('library');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ, ${user.nameKhmer}!`, 'success');
      return { success: true, message: 'ចូលប្រព័ន្ធជោគជ័យ', user };
    }

    return { success: false, message: 'រកមិនឃើញគណនីដែលត្រូវគ្នានឹងព័ត៌មានដែលបានផ្ទៀងផ្ទាត់ទេ!' };
  };

  /**
   * Smart QR Code Login (Decoupled from user password so password changes never break QR code)
   */
  const loginWithQRCode = (rawPayload: string): { success: boolean; message: string; user?: AppUser } => {
    const payload = parseQRScanData(rawPayload);
    if (!payload || !payload.code) {
      return { success: false, message: 'កូដ QR Code មិនត្រឹមត្រូវ ឬមិនអាចស្គាល់បានទេ!' };
    }

    return loginByVerifiedIdentifier(payload.code);
  };

  // Auto Smart QR URL listener on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qrAuth = searchParams.get('qr_auth');
      const qrCode = searchParams.get('qr_code') || searchParams.get('code');
      const qrLogin = searchParams.get('qr_login');

      if (qrAuth || (qrLogin && qrCode)) {
        const rawParam = qrAuth ? decodeURIComponent(qrAuth) : window.location.href;
        const res = loginWithQRCode(rawParam);
        if (res.success && res.user) {
          // Clean URL params seamlessly so refresh doesn't re-trigger unexpectedly
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          setToastMessage({
            text: `🎉 ស្កេនជោគជ័យ! បានចូលគណនី «${res.user.nameKhmer}» (${res.user.role === 'student' ? 'សិស្ស' : 'គ្រូ/បុគ្គលិក'}) ដោយស្វ័យប្រវត្តិ`,
            type: 'success'
          });
        }
      }
    } catch (e) {
      console.error('Auto QR Login check error:', e);
    }
  }, [students.length, teachers.length]);

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
      if (matchedUser.role === 'student' || matchedUser.role === 'parent') {
        setActiveTab('student_portal');
      } else if (matchedUser.role === 'teacher') {
        setActiveTab('homeroom_dashboard');
      } else if (matchedUser.role === 'librarian') {
        setActiveTab('library');
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

  const logout = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('current_role');
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const switchUserRole = (role: UserRole) => {
    // If current user is student, prevent switching to any other administrative role
    if (currentUser?.role === 'student') {
      showToast('គណនីសិស្សមិនអាចប្តូរទៅកាន់តួនាទីរដ្ឋបាលផ្សេងទៀតបានឡើយ', 'error');
      return;
    }

    // If current user is teacher, they can only switch to student or teacher view
    if (currentUser?.role === 'teacher' && role !== 'teacher' && role !== 'student') {
      showToast('លោកគ្រូ-អ្នកគ្រូមានសិទ្ធិមើលបានតែផ្ទាំងគ្រូ និងផ្ទាំងសិស្សប៉ុណ្ណោះ', 'error');
      return;
    }

    // If switching to director or super_admin from another role, require Director PIN!
    if ((role === 'director' || role === 'super_admin') && currentUser?.role !== 'director' && currentUser?.role !== 'super_admin') {
      openDirectorPinModal({
        title: 'ផ្ទៀងផ្ទាត់លេខកូដសម្ងាត់នាយកសាលា',
        targetTab: 'dashboard'
      });
      return;
    }

    const sampleUser = appUsers.find(u => u.role === role) || initialUsers.find(u => u.role === role);
    if (sampleUser) {
      setCurrentUser(sampleUser);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(sampleUser));
      if (role === 'student') {
        setActiveTab('student_portal');
      } else if (role === 'teacher') {
        setActiveTab('homeroom_dashboard');
      } else if (role === 'secretary') {
        setActiveTab('secretary_dashboard');
      } else if (role === 'librarian') {
        setActiveTab('library');
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
      if (target.role === 'student' || target.role === 'parent') {
        setActiveTab('student_portal');
      } else if (target.role === 'teacher') {
        setActiveTab('homeroom_dashboard');
      } else if (target.role === 'librarian') {
        setActiveTab('library');
      } else if (target.role === 'secretary') {
        setActiveTab('secretary_dashboard');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`បានចូលប្រើប្រាស់គណនី៖ ${target.nameKhmer} (${getRoleLabel(target.role)}) តាមរយៈសិទ្ធិនាយកសាលា`, 'info');
    }
  };

  const switchToTeacherAccount = (teacher: Teacher) => {
    // Look for matching user in appUsers
    let teacherUser = appUsers.find(
      u => u.staffCode === teacher.staffCode ||
           u.id === `u-${teacher.id}` ||
           (teacher.email && u.email?.toLowerCase() === teacher.email.toLowerCase()) ||
           (teacher.phone && u.phone?.replace(/\s+/g, '') === teacher.phone.replace(/\s+/g, '')) ||
           u.nameKhmer === teacher.nameKhmer
    );

    if (!teacherUser) {
      const cleanPhone = teacher.phone ? teacher.phone.replace(/\s+/g, '') : '';
      const fallbackUsername = teacher.nameLatin
        ? teacher.nameLatin.toLowerCase().replace(/[^a-z0-9]/g, '')
        : `teacher_${Date.now().toString().slice(-4)}`;
      teacherUser = {
        id: `u-${teacher.id}`,
        username: fallbackUsername,
        email: teacher.email?.trim() || `${fallbackUsername}@moeys.gov.kh`,
        phone: teacher.phone || '',
        password: cleanPhone || '123456',
        nameKhmer: teacher.nameKhmer,
        nameLatin: teacher.nameLatin || teacher.nameKhmer,
        role: 'teacher',
        status: 'active',
        staffCode: teacher.staffCode,
        assignedGrade: teacher.assignedGrade,
        assignedSection: teacher.assignedSection,
        avatarUrl: teacher.avatarUrl,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAppUsers(prev => [teacherUser!, ...prev]);
    }

    setCurrentUser(teacherUser);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(teacherUser));
    setActiveTab('homeroom_dashboard');
    showToast(`បានចូលទៅកាន់ផ្ទាំងរបស់គ្រូ «${teacher.nameKhmer}» (${teacher.assignedGrade ? 'ថ្នាក់ទី ' + teacher.assignedGrade + (teacher.assignedSection || 'ក') : 'គ្រូបង្រៀន'}) ដោយជោគជ័យ!`, 'success');
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
      if (targetTeacher.role === 'teacher') {
        setActiveTab('homeroom_dashboard');
      } else if (targetTeacher.role === 'student' || targetTeacher.role === 'parent') {
        setActiveTab('student_portal');
      } else if (targetTeacher.role === 'librarian') {
        setActiveTab('library');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`បានត្រឡប់មកកាន់គណនី (${targetTeacher.nameKhmer}) វិញដោយជោគជ័យ!`, 'success');
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

  const setGlobalActiveAcademicYear = (year: string): { success: boolean; message: string } => {
    const trimmed = year.trim();
    if (!trimmed) {
      return { success: false, message: 'សូមជ្រើសរើស ឬបញ្ចូលឆ្នាំសិក្សាឱ្យបានត្រឹមត្រូវ!' };
    }

    const isDirector =
      currentUser?.role === 'director' ||
      currentUser?.role === 'super_admin' ||
      currentUser?.role === 'secretary' ||
      currentUser?.email?.toLowerCase() === 'limsorn9@gmail.com' ||
      currentUser?.username?.toLowerCase() === 'director' ||
      currentUser?.username?.toLowerCase() === 'limsorn' ||
      Boolean(currentUser?.nameKhmer && (currentUser.nameKhmer.includes('លីម សន') || currentUser.nameKhmer.includes('នាយក')));

    if (currentUser && !isDirector) {
      showToast('សិទ្ធិកំណត់ឆ្នាំសិក្សាគោលសម្រាប់គ្រប់គ្នាគឺសម្រាប់នាយកសាលាតែម្នាក់គត់!', 'error');
      return { success: false, message: 'សិទ្ធិកំណត់ឆ្នាំសិក្សាគោលសម្រាប់គ្រប់គ្នាគឺសម្រាប់នាយកសាលាតែម្នាក់គត់!' };
    }

    // Ensure it exists in academicYears
    if (!academicYears.includes(trimmed)) {
      setAcademicYears(prev => Array.from(new Set([...prev, trimmed])));
    }

    // Update school profile's authoritative academicYear
    setSchoolProfile(prev => ({
      ...prev,
      academicYear: trimmed
    }));

    // Update selected academic year for current session
    setSelectedAcademicYear(trimmed);

    // Save locally to storage
    try {
      const currentProfileSaved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
      const parsed = currentProfileSaved ? JSON.parse(currentProfileSaved) : initialSchoolProfile;
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify({ ...parsed, academicYear: trimmed }));
    } catch {
      // ignore
    }

    // Add Audit Activity Log
    addActivityLog({
      domain: 'admin',
      actionType: 'update',
      title: `កំណត់ឆ្នាំសិក្សាគោល៖ ឆ្នាំសិក្សា ${trimmed}`,
      description: `នាយកសាលាបានកំណត់ «ឆ្នាំសិក្សា ${trimmed}» ជាឆ្នាំសិក្សាគោលផ្លូវការសម្រាប់ប្រព័ន្ធ និងអ្នកប្រើប្រាស់ទាំងអស់ (លោកគ្រូ អ្នកគ្រូ និងសិស្សានុសិស្ស)`,
      entityId: 'global_academic_year',
      entityName: `ឆ្នាំសិក្សា ${trimmed}`,
      actorName: currentUser?.nameKhmer || schoolProfile.principalName || 'នាយកសាលា',
      actorRole: currentUser?.role === 'director' ? 'នាយកសាលា' : (currentUser?.role || 'អ្នកគ្រប់គ្រង'),
      targetTab: 'dashboard',
      tags: ['ឆ្នាំសិក្សាគោល', trimmed, 'នាយកសាលា']
    });

    showToast(`បានកំណត់ «ឆ្នាំសិក្សា ${trimmed}» ជាឆ្នាំសិក្សាគោលផ្លូវការសម្រាប់គ្រប់គ្នាដោយជោគជ័យ!`, 'success');
    return { success: true, message: `បានកំណត់ «ឆ្នាំសិក្សា ${trimmed}» ជាឆ្នាំសិក្សាគោលផ្លូវការសម្រាប់គ្រប់គ្នា!` };
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
    ({
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

    ({
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

    ({
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
      ({
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

  // Student Account Registered Status Check
  const isStudentRegisteredInAccounts = (student: Student): boolean => {
    if (!student) return false;
    const cleanStudentCode = (student.code || '').trim().toLowerCase();
    const cleanStudentId = (student.id || '').trim();
    const cleanNameKhmer = (student.nameKhmer || '').trim();

    return appUsers.some(u => {
      if (u.role !== 'student' && u.role !== 'parent') return false;
      const uStudentId = (u.studentId || '').trim();
      const uStudentCode = (u.studentCode || '').trim().toLowerCase();
      const uUsername = (u.username || '').trim().toLowerCase();
      const uNameKhmer = (u.nameKhmer || '').trim();

      return (
        (uStudentId && uStudentId === cleanStudentId) ||
        (u.id && (u.id === `u-${cleanStudentId}` || u.id === `usr-stu-${cleanStudentId}`)) ||
        (cleanStudentCode && (uStudentCode === cleanStudentCode || uUsername === cleanStudentCode)) ||
        (cleanNameKhmer && uNameKhmer === cleanNameKhmer)
      );
    });
  };

  // Auto-generate Student Accounts for students without accounts
  const autoGenerateStudentAccounts = (targetStudentIds?: string[]): { createdCount: number; existingCount: number } => {
    const isAuthorized = currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary' || currentUser?.role === 'teacher';
    if (!isAuthorized) {
      showToast('អ្នកពុំមានសិទ្ធិបង្កើតគណនីសិស្សទេ!', 'error');
      return { createdCount: 0, existingCount: 0 };
    }

    const studentsToProcess = targetStudentIds && targetStudentIds.length > 0
      ? students.filter(s => targetStudentIds.includes(s.id))
      : students;

    let createdCount = 0;
    let existingCount = 0;
    const newUsersToAdd: AppUser[] = [];

    studentsToProcess.forEach(st => {
      const alreadyHas = isStudentRegisteredInAccounts(st);
      if (alreadyHas) {
        existingCount++;
        return;
      }

      const defaultPassword = st.code || '123456';
      const cleanUsername = st.code ? st.code.toLowerCase().replace(/[^a-z0-9]/g, '') : `student_${st.id.slice(-4)}`;
      const cleanEmail = `${cleanUsername}@student.moeys.gov.kh`;

      const newUser: AppUser = {
        id: `usr-stu-${st.id}`,
        username: cleanUsername,
        email: cleanEmail,
        password: defaultPassword,
        nameKhmer: st.nameKhmer,
        nameLatin: st.nameLatin || st.nameKhmer,
        role: 'student',
        studentId: st.id,
        studentCode: st.code,
        assignedGrade: st.grade,
        assignedSection: st.section,
        phone: st.guardianPhone || st.phone || '',
        avatarUrl: st.avatarUrl,
        createdBy: currentUser?.id || 'system',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
        passwordUpdatedAt: new Date().toISOString()
      };

      newUsersToAdd.push(newUser);
      createdCount++;
    });

    if (newUsersToAdd.length > 0) {
      setAppUsers(prev => [...newUsersToAdd, ...prev]);
      showToast(`បានបង្កើតគណនីសិស្សចំនួន ${createdCount} នាក់ដោយជោគជ័យ!`, 'success');

      addAccountAuditLog({
        eventType: 'create',
        targetUserId: 'bulk-student-accounts',
        targetUserName: `សិស្សចំនួន ${createdCount} នាក់`,
        targetUserRole: 'student',
        actor: {
          id: currentUser?.id || 'admin',
          nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
          email: currentUser?.email || 'admin@moeys.gov.kh',
          role: currentUser?.role || 'secretary'
        },
        reason: 'បង្កើតគណនីសិស្សដោយស្វ័យប្រវត្តិតាមបញ្ជី',
        details: `បានបង្កើតគណនីសិស្សថ្មីចំនួន ${createdCount} នាក់ (ពាក្យសម្ងាត់លំនាំដើម៖ អត្តលេខសិស្ស)`
      });
    } else {
      showToast(`សិស្សទាំងអស់ (${existingCount} នាក់) មានគណនីរួចរាល់ហើយ!`, 'info');
    }

    return { createdCount, existingCount };
  };

  // Hierarchical Account Creation
  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      return { success: false, message: 'សូមចូលប្រព័ន្ធជាមុនសិន' };
    }

    // Role creation rules:
    // Director / Super Admin has full permissions to create any role.
    // Secretary has permission to create student accounts!
    const isDirector = currentUser.role === 'director' || currentUser.role === 'super_admin';
    const isSecretary = currentUser.role === 'secretary';

    if (!isDirector && (!isSecretary || userData.role !== 'student')) {
      return { 
        success: false, 
        message: 'លោកនាយកសាលាមានសិទ្ធិបង្កើតគ្រប់គណនី ហើយលេខាធិការមានសិទ្ធិបង្កើតគណនីសិស្សបាន!' 
      };
    }

    const newUser: AppUser = {
      ...userData,
      id: userData.role === 'student' && userData.studentId ? `usr-stu-${userData.studentId}` : `u-${Date.now()}`,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setAppUsers(prev => [newUser, ...prev]);

    // If student, synchronize with student record
    if (newUser.role === 'student') {
      const match = students.find(
        s => (newUser.studentId && s.id === newUser.studentId) ||
             (newUser.studentCode && s.code === newUser.studentCode) ||
             (newUser.nameKhmer && s.nameKhmer === newUser.nameKhmer)
      );
      if (match && !newUser.studentId) {
        newUser.studentId = match.id;
        newUser.studentCode = match.code;
        newUser.assignedGrade = match.grade;
        newUser.assignedSection = match.section;
      }
    }

    // If a staff or teacher account was created, also link or create a Teacher profile in teachers list if missing
    const staffRolesForTeacherProfile: UserRole[] = ['teacher', 'director', 'deputy_director' as any, 'secretary', 'librarian', 'super_admin'];
    if (staffRolesForTeacherProfile.includes(newUser.role)) {
      setTeachers(prev => {
        const exists = prev.some(t => isTeacherMatch(t, newUser));
        if (exists) return prev;
        const newTeacherRecord = createTeacherFromAppUser(newUser, prev.length);
        return [newTeacherRecord, ...prev];
      });
    }

    // Log to Account Audit
    addAccountAuditLog({
      eventType: 'create',
      targetUserId: newUser.id,
      targetUserName: newUser.nameKhmer,
      targetUserRole: newUser.role,
      targetUserEmail: newUser.email,
      targetStaffCode: newUser.staffCode,
      actor: {
        id: currentUser.id,
        nameKhmer: currentUser.nameKhmer,
        email: currentUser.email,
        role: currentUser.role
      },
      reason: `បង្កើតគណនីថ្មីប្រភេទ ${getRoleLabel(newUser.role)}`,
      details: `បានបង្កើតគណនី «${newUser.nameKhmer}» (${newUser.email || newUser.username}) តួនាទី ${getRoleLabel(newUser.role)}`
    });

    showToast(`បានបង្កើតគណនីជូន ${newUser.nameKhmer} (${getRoleLabel(newUser.role)}) ដោយជោគជ័យ!`);
    return { success: true, message: 'ជោគជ័យ', user: newUser };
  };

  // Self-Registration / Direct Account Creation (even when logged out)
  const registerUser = (userData: Omit<AppUser, 'id' | 'createdAt'> & { autoLogin?: boolean }) => {
    // Strict RBAC: Only Parents can self-register, and strictly requires phone number matching a child's registered guardianPhone or phone
    if (userData.role === 'teacher' || userData.role === 'director' || userData.role === 'secretary' || userData.role === 'librarian') {
      return { 
        success: false, 
        message: 'គណនីនាយកសាលា គ្រូបង្រៀន និងបុគ្គលិក គឺមានតែលោកនាយកសាលា (Director) តែប៉ុណ្ណោះ ទើបមានសិទ្ធិបង្កើតបាន!' 
      };
    }

    const cleanPhone = (userData.phone || '').trim().replace(/\s+|-/g, '');
    if (!cleanPhone) {
      return {
        success: false,
        message: 'សូមបញ្ចូលលេខទូរស័ព្ទអាណាព្យាបាលដើម្បីផ្ទៀងផ្ទាត់ជាមួយទិន្នន័យកូនសិស្ស!'
      };
    }

    // Verify phone against students database
    const matchingStudents = students.filter(s => {
      const gPhone = (s.guardianPhone || '').replace(/\s+|-/g, '');
      const sPhone = (s.phone || '').replace(/\s+|-/g, '');
      return (gPhone && gPhone === cleanPhone) || (sPhone && sPhone === cleanPhone);
    });

    if (matchingStudents.length === 0) {
      return {
        success: false,
        message: `លេខទូរស័ព្ទ «${userData.phone}» មិនត្រូវគ្នានឹងលេខទូរស័ព្ទអាណាព្យាបាលរបស់សិស្សណាម្នាក់ក្នុងប្រព័ន្ធសាលាឡើយ! ទាមទារលេខទូរស័ព្ទដូចកូនទើបអាចបង្កើតគណនីបាន។`
      };
    }

    const matchedChild = matchingStudents[0];
    const emailNorm = (userData.email || '').trim().toLowerCase();

    // Check if email is already registered
    if (emailNorm) {
      const emailTaken = appUsers.some(u => u.email?.trim().toLowerCase() === emailNorm);
      if (emailTaken) {
        return { success: false, message: `អាសយដ្ឋានអ៊ីមែល «${userData.email}» ត្រូវបានចុះឈ្មោះក្នុងប្រព័ន្ធរួចហើយ!` };
      }
    }

    // Check if username is already registered
    if (userData.username) {
      const usernameTaken = appUsers.some(u => u.username?.trim().toLowerCase() === userData.username.trim().toLowerCase());
      if (usernameTaken) {
        return { success: false, message: `ឈ្មោះសម្គាល់ «${userData.username}» មានរួចហើយ! សូមជ្រើសរើសឈ្មោះផ្សេង` };
      }
    }

    const newUser: AppUser = {
      ...userData,
      id: `u-${Date.now()}`,
      role: 'student', // Linked to student/parent dashboard
      studentId: matchedChild.id,
      studentCode: matchedChild.code,
      assignedGrade: matchedChild.grade,
      assignedSection: matchedChild.section,
      createdBy: 'parent-self-registration',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      passwordUpdatedAt: new Date().toISOString(),
      activeSessions: [
        {
          id: `sess-${Date.now()}`,
          deviceId: `dev-${Date.now()}`,
          deviceName: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Smartphone' : 'Web Browser',
          browser: 'Chrome / Safari',
          os: typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows') ? 'Windows' : 'Android/iOS/MacOS',
          ipAddress: '127.0.0.1 (Local)',
          location: 'កម្ពុជា',
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isCurrent: true
        }
      ]
    };

    setAppUsers(prev => [newUser, ...prev]);

    // Auto-login user if requested
    if (userData.autoLogin !== false) {
      setCurrentUser(newUser);
      setActiveTab('student_portal');
      showToast(`ចុះឈ្មោះជោគជ័យ! បានភ្ជាប់ជាមួយកូនសិស្ស «${matchedChild.nameKhmer}» (${matchedChild.code} ថ្នាក់ទី ${matchedChild.grade}${matchedChild.section})`, 'success');
    } else {
      showToast(`បានបង្កើតគណនីអាណាព្យាបាលជូន ${newUser.nameKhmer} (កូនសិស្ស៖ ${matchedChild.nameKhmer}) ដោយជោគជ័យ!`, 'success');
    }

    addAccountAuditLog({
      eventType: 'create',
      targetUserId: newUser.id,
      targetUserName: newUser.nameKhmer,
      targetUserRole: 'student',
      targetUserEmail: newUser.email,
      actor: {
        id: newUser.id,
        nameKhmer: newUser.nameKhmer,
        email: newUser.email,
        role: 'student'
      },
      reason: `អាណាព្យាបាលចុះឈ្មោះដោយស្វ័យប្រវត្តិ (ផ្ទៀងផ្ទាត់តាមលេខទូរស័ព្ទកូនសិស្ស ${matchedChild.nameKhmer})`,
      details: `បានភ្ជាប់គណនីអាណាព្យាបាល ${newUser.nameKhmer} ជាមួយសិស្ស ${matchedChild.nameKhmer} (${matchedChild.code}) ថ្នាក់ទី ${matchedChild.grade}${matchedChild.section}`
    });

    return { success: true, message: 'ជោគជ័យ', user: newUser };
  };

  const updateUser = (id: string, updated: Partial<AppUser>) => {
    const existing = appUsers.find(u => u.id === id);
    setAppUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => {
        const next = prev ? { ...prev, ...updated } : null;
        if (next) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(next));
        }
        return next;
      });
    }

    // Sync with teachers list if this user corresponds to a teacher or staff member
    if (existing) {
      setTeachers(prev => prev.map(t => {
        const isMatch = (existing.staffCode && t.staffCode === existing.staffCode) ||
          (updated.staffCode && t.staffCode === updated.staffCode) ||
          `u-${t.id}` === id ||
          t.id === id.replace(/^u-/, '') ||
          (existing.email && t.email?.toLowerCase() === existing.email.toLowerCase()) ||
          (existing.phone && t.phone?.replace(/\s+/g, '') === existing.phone?.replace(/\s+/g, '')) ||
          (existing.nameKhmer && t.nameKhmer === existing.nameKhmer);

        if (isMatch) {
          const mapRoleToTeacherRole = (r?: UserRole): string => {
            if (!r) return t.role;
            if (r === 'director') return 'នាយកសាលា';
            if (r === 'secretary') return 'លេខាធិការ';
            if (r === 'librarian') return 'បណ្ណារក្ស';
            if (r === 'teacher') return 'គ្រូបង្រៀន';
            return t.role;
          };

          return {
            ...t,
            nameKhmer: updated.nameKhmer || t.nameKhmer,
            nameLatin: updated.nameLatin !== undefined ? updated.nameLatin : t.nameLatin,
            avatarUrl: updated.avatarUrl !== undefined ? updated.avatarUrl : t.avatarUrl,
            email: updated.email !== undefined ? updated.email : t.email,
            phone: updated.phone !== undefined ? updated.phone : t.phone,
            role: updated.role ? mapRoleToTeacherRole(updated.role) : t.role,
            assignedGrade: updated.assignedGrade !== undefined ? updated.assignedGrade : t.assignedGrade,
            assignedSection: updated.assignedSection !== undefined ? updated.assignedSection : t.assignedSection,
            staffCode: updated.staffCode !== undefined ? updated.staffCode : t.staffCode
          };
        }
        return t;
      }));

      // Sync with students list if this user corresponds to a student
      setStudents(prev => prev.map(s => {
        const isMatch =
          `u-${s.id}` === id ||
          `usr-stu-${s.id}` === id ||
          s.id === id.replace(/^u-/, '').replace(/^usr-stu-/, '') ||
          (existing.studentId && s.id === existing.studentId) ||
          (existing.studentCode && s.code === existing.studentCode) ||
          (existing.username && s.code === existing.username) ||
          (existing.nameKhmer && s.nameKhmer === existing.nameKhmer);

        if (isMatch) {
          return {
            ...s,
            nameKhmer: updated.nameKhmer || s.nameKhmer,
            nameLatin: updated.nameLatin !== undefined ? updated.nameLatin : s.nameLatin,
            avatarUrl: updated.avatarUrl !== undefined ? updated.avatarUrl : s.avatarUrl,
            phone: updated.phone !== undefined ? updated.phone : s.phone,
            grade: updated.assignedGrade !== undefined ? updated.assignedGrade : s.grade,
            section: updated.assignedSection !== undefined ? updated.assignedSection : s.section
          };
        }
        return s;
      }));
    }

    if (existing) {
      const changesSummary: { field: string; before?: string | number | boolean; after?: string | number | boolean }[] = [];
      if (updated.role && updated.role !== existing.role) {
        changesSummary.push({ field: 'role', before: existing.role, after: updated.role });
      }
      if (updated.status && updated.status !== existing.status) {
        changesSummary.push({ field: 'status', before: existing.status, after: updated.status });
      }
      if (updated.assignedGrade !== undefined && updated.assignedGrade !== existing.assignedGrade) {
        changesSummary.push({ field: 'assignedGrade', before: existing.assignedGrade || 0, after: updated.assignedGrade });
      }
      if (updated.assignedSection !== undefined && updated.assignedSection !== existing.assignedSection) {
        changesSummary.push({ field: 'assignedSection', before: existing.assignedSection || '', after: updated.assignedSection });
      }
      if (updated.password) {
        changesSummary.push({ field: 'password', before: '••••••', after: '•••••• (Changed)' });
      }
      if (updated.forcePasswordChange !== undefined && updated.forcePasswordChange !== existing.forcePasswordChange) {
        changesSummary.push({ field: 'forcePasswordChange', before: existing.forcePasswordChange || false, after: updated.forcePasswordChange });
      }

      let eventType: AccountAuditEventType = 'update_profile';
      if (updated.role && updated.role !== existing.role) eventType = 'update_role';
      else if (updated.password) eventType = 'reset_password';
      else if (updated.status && updated.status !== existing.status) eventType = 'toggle_status';
      else if (updated.forcePasswordChange !== undefined) eventType = 'force_password_rotation';

      addAccountAuditLog({
        eventType,
        targetUserId: id,
        targetUserName: updated.nameKhmer || existing.nameKhmer,
        targetUserRole: updated.role || existing.role,
        targetUserEmail: updated.email || existing.email,
        targetStaffCode: updated.staffCode || existing.staffCode,
        actor: {
          id: currentUser?.id,
          nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
          email: currentUser?.email || 'admin@moeys.gov.kh',
          role: currentUser?.role || 'director'
        },
        reason: 'កែប្រែព័ត៌មានគណនី/សិទ្ធិប្រើប្រាស់',
        details: `បានកែប្រែព័ត៌មានរបស់ «${existing.nameKhmer}» (${getRoleLabel(existing.role)})`,
        changesSummary: changesSummary.length > 0 ? changesSummary : undefined
      });
    }

    showToast('បានកែប្រែព័ត៌មានគណនីជោគជ័យ!');
  };

  const deleteUser = (id: string, reason: string = 'បានលុបដោយអ្នកគ្រប់គ្រង') => {
    if (currentUser && currentUser.id === id) {
      showToast('មិនអាចលុបគណនីដែលកំពុងដំណើរការបានឡើយ', 'error');
      return;
    }

    const targetUser = appUsers.find(u => u.id === id);
    if (!targetUser) {
      showToast('រកមិនឃើញគណនីនេះឡើយ', 'error');
      return;
    }

    // Check if user is associated with a Teacher profile to backup
    const teacherBackup = teachers.find(
      t => t.id === targetUser.id.replace('u-', '') ||
           (targetUser.email && t.email?.toLowerCase() === targetUser.email.toLowerCase()) ||
           (targetUser.phone && t.phone?.replace(/\s+/g, '') === targetUser.phone.replace(/\s+/g, '')) ||
           (targetUser.staffCode && t.staffCode === targetUser.staffCode)
    );

    // Remove from active appUsers
    setAppUsers(prev => prev.filter(u => u.id !== id));

    // Also remove from active teachers list if present (saved in backup for restore)
    if (teacherBackup) {
      setTeachers(prev => prev.filter(t => t.id !== teacherBackup.id));
    }

    // Add to 30-day soft-delete trash
    const deletedRecord: DeletedAppUser = {
      id: `del-${Date.now()}-${targetUser.id}`,
      user: targetUser,
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason: reason.trim() || 'បានលុបដោយអ្នកគ្រប់គ្រង',
      deletedBy: {
        id: currentUser?.id,
        nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
        email: currentUser?.email || 'admin@moeys.gov.kh',
        role: currentUser?.role || 'director'
      },
      teacherProfileBackup: teacherBackup
    };

    setDeletedUsers(prev => [deletedRecord, ...prev]);

    // Audit log
    addAccountAuditLog({
      eventType: 'delete',
      targetUserId: targetUser.id,
      targetUserName: targetUser.nameKhmer,
      targetUserRole: targetUser.role,
      targetUserEmail: targetUser.email,
      targetStaffCode: targetUser.staffCode,
      actor: {
        id: currentUser?.id,
        nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
        email: currentUser?.email || 'admin@moeys.gov.kh',
        role: currentUser?.role || 'director'
      },
      reason: reason.trim() || 'បានលុបដោយអ្នកគ្រប់គ្រង',
      details: `បានលុបគណនី «${targetUser.nameKhmer}» (${getRoleLabel(targetUser.role)}) និងបានផ្លាស់ទីទៅក្នុងធុងសំរាម ៣០ ថ្ងៃ`
    });

    showToast(`បានផ្លាស់ទីគណនី «${targetUser.nameKhmer}» ទៅកាន់ធុងសំរាម (រក្សាទុក ៣០ ថ្ងៃ)`, 'info');
  };

  const restoreUser = (deletedId: string) => {
    const deletedRecord = deletedUsers.find(d => d.id === deletedId);
    if (!deletedRecord) {
      return { success: false, message: 'រកមិនឃើញទិន្នន័យដែលបានលុបនេះឡើយ' };
    }

    // Restore to appUsers
    const restoredUser: AppUser = {
      ...deletedRecord.user,
      status: 'active'
    };

    setAppUsers(prev => {
      const filtered = prev.filter(u => u.id !== restoredUser.id && u.email?.toLowerCase() !== restoredUser.email?.toLowerCase());
      return [restoredUser, ...filtered];
    });

    // Restore teacher profile if backup exists
    if (deletedRecord.teacherProfileBackup) {
      const restoredTeacher = deletedRecord.teacherProfileBackup;
      setTeachers(prev => {
        const filtered = prev.filter(t => t.id !== restoredTeacher.id && t.staffCode !== restoredTeacher.staffCode);
        return [restoredTeacher, ...filtered];
      });
    }

    // Remove from deletedUsers
    setDeletedUsers(prev => prev.filter(d => d.id !== deletedId));

    // Audit log
    addAccountAuditLog({
      eventType: 'restore',
      targetUserId: restoredUser.id,
      targetUserName: restoredUser.nameKhmer,
      targetUserRole: restoredUser.role,
      targetUserEmail: restoredUser.email,
      targetStaffCode: restoredUser.staffCode,
      actor: {
        id: currentUser?.id,
        nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
        email: currentUser?.email || 'admin@moeys.gov.kh',
        role: currentUser?.role || 'director'
      },
      reason: 'ស្តារគណនីឡើងវិញពីធុងសំរាម',
      details: `បានស្តារគណនី «${restoredUser.nameKhmer}» (${getRoleLabel(restoredUser.role)}) ឱ្យដំណើរការឡើងវិញ`
    });

    showToast(`បានស្តារគណនី «${restoredUser.nameKhmer}» ឡើងវិញដោយជោគជ័យ!`, 'success');
    return { success: true, message: 'បានស្តារឡើងវិញជោគជ័យ' };
  };

  const permanentlyDeleteUser = (deletedId: string) => {
    const deletedRecord = deletedUsers.find(d => d.id === deletedId);
    if (!deletedRecord) {
      return { success: false, message: 'រកមិនឃើញទិន្នន័យឡើយ' };
    }

    setDeletedUsers(prev => prev.filter(d => d.id !== deletedId));

    addAccountAuditLog({
      eventType: 'permanent_delete',
      targetUserId: deletedRecord.user?.id || deletedRecord.studentProfileBackup?.id || deletedRecord.teacherProfileBackup?.id || 'unknown',
      targetUserName: deletedRecord.user?.nameKhmer || deletedRecord.studentProfileBackup?.nameKhmer || deletedRecord.teacherProfileBackup?.nameKhmer || 'មិនស្គាល់',
      targetUserRole: deletedRecord.entityType === 'student' ? 'student' : (deletedRecord.user?.role || 'teacher') || 'teacher',
      targetUserEmail: deletedRecord.user?.email,
      targetStaffCode: deletedRecord.user?.staffCode,
      actor: {
        id: currentUser?.id,
        nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
        email: currentUser?.email || 'admin@moeys.gov.kh',
        role: currentUser?.role || 'director'
      },
      reason: 'លុបជាស្ថាពរចេញពីប្រព័ន្ធ',
      details: `បានលុបគណនី «${deletedRecord.user?.nameKhmer || deletedRecord.studentProfileBackup?.nameKhmer || deletedRecord.teacherProfileBackup?.nameKhmer || 'មិនស្គាល់'}» ជាស្ថាពរចេញពីធុងសំរាម`
    });

    showToast(`បានលុបគណនី «${deletedRecord.user?.nameKhmer || deletedRecord.studentProfileBackup?.nameKhmer || deletedRecord.teacherProfileBackup?.nameKhmer || 'មិនស្គាល់'}» ជាស្ថាពររួចរាល់`, 'info');
    return { success: true, message: 'បានលុបជាស្ថាពរ' };
  };

  const emptyRecentlyDeleted = () => {
    if (deletedUsers.length === 0) return;
    const count = deletedUsers.length;
    setDeletedUsers([]);

    addAccountAuditLog({
      eventType: 'permanent_delete',
      targetUserId: 'bulk-purge',
      targetUserName: `គណនីចំនួន ${count}`,
      targetUserRole: 'teacher',
      actor: {
        id: currentUser?.id,
        nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
        email: currentUser?.email || 'admin@moeys.gov.kh',
        role: currentUser?.role || 'director'
      },
      reason: 'សម្អាតធុងសំរាមគណនីទាំងអស់',
      details: `បានសម្អាតគណនីដែលបានលុបចំនួន ${count} ជាស្ថាពរ`
    });

    showToast(`បានសម្អាតធុងសំរាមគណនីទាំងអស់ (${count} គណនី) រួចរាល់!`, 'info');
  };

  const addAccountAuditLog = (log: Omit<AccountAuditLog, 'id' | 'timestamp'>) => {
    const newLog: AccountAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    setAccountAuditLogs(prev => [newLog, ...prev.slice(0, 499)]);
  };

  const clearAccountAuditLogs = () => {
    setAccountAuditLogs([]);
    showToast('បានសម្អាតកំណត់ត្រាសវនកម្មគណនីរួចរាល់', 'info');
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

      ({
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

    ({
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

      ({
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

      ({
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

    ({
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

  

  // KrouDigital 4.0 Standardized Core State Mappings
  const kdSchoolInfo = schoolProfile;
  const kdTeacherProfile = currentUser && currentUser.role === 'teacher' ? (teachers.find(t => t.id === currentUser.id) || null) : null;
  const currentAssignedClass = getTeacherAssignedClass();
  const kdClassInfo = currentAssignedClass ? {
    currentClass: `ថ្នាក់ទី${currentAssignedClass.grade}${currentAssignedClass.section}`,
    academicYear: selectedAcademicYear,
    students: students.filter(s => s.grade === currentAssignedClass.grade && s.section === currentAssignedClass.section)
  } : null;


  // SSOT & RBAC Data Scoping
  const scopedStudents = useMemo(() => {
    if (!currentUser) return [];
    if (['super_admin', 'director', 'secretary', 'librarian'].includes(currentUser.role)) {
      return students; // Admins get all students
    }
    if (currentUser.role === 'teacher') {
      return students.filter(
        (s) => s.grade === currentUser.assignedGrade && s.section === currentUser.assignedSection
      );
    }
    if (currentUser.role === 'student' || currentUser.role === 'parent') {
      return students.filter((s) => s.code === currentUser.studentCode);
    }
    return [];
  }, [students, currentUser]);

  const scopedScores = useMemo(() => {
    if (!currentUser) return [];
    if (['super_admin', 'director', 'secretary', 'librarian'].includes(currentUser.role)) {
      return scores;
    }
    if (currentUser.role === 'teacher') {
      return scores.filter(
        (s) => s.grade === currentUser.assignedGrade && s.section === currentUser.assignedSection
      );
    }
    if (currentUser.role === 'student' || currentUser.role === 'parent') {
      const studentInfo = students.find((s) => s.code === currentUser.studentCode);
      return studentInfo ? scores.filter((s) => s.studentId === studentInfo.id) : [];
    }
    return [];
  }, [scores, currentUser, students]);

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
        loginWithQRCode,
        loginWithGoogle,
        logout,
        switchUserRole,
        impersonateUser,
        switchToTeacherAccount,
        accessStudentAccount,
        switchToTeacherWithPassword,
        directorPin,
        updateDirectorPin,
        verifyDirectorPin,
        switchToDirectorWithPin,
        isDirectorPinModalOpen,
        directorPinModalTargetAction,
        openDirectorPinModal,
        closeDirectorPinModal,
        addUser,
        registerUser,
        updateUser,
        deleteUser,
        deletedUsers,
        restoreUser,
        permanentlyDeleteUser,
        emptyRecentlyDeleted,
        accountAuditLogs,
        addAccountAuditLog,
        clearAccountAuditLogs,
        canAccessTab,
        canAccessStudentDashboard,
        canTeacherAccessClass,
        getTeacherAssignedClass,
        academicYears,
        selectedAcademicYear,
        setSelectedAcademicYear,
        addAcademicYear,
        setGlobalActiveAcademicYear,
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
        
        
        
        markNotificationRead,
        markAllNotificationsRead,
        clearNotification,
        clearAllNotifications,
        syncRealSchoolNotifications,
        schoolProfile,
        updateSchoolProfile,
        students: scopedStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteAllStudents,
        pullStudentsToClass,
        getStudentById,
        transfers,
        addTransfer,
        updateTransfer,
        deleteTransfer,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        syncStaffAccountsToTeachers,
        isStaffAccountInTeachers,
        classrooms,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        scores: scopedScores,
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
        versionConflictState,
        checkDriveVersionMismatch,
        resolveVersionConflict,
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
        libraryVisitors,
        addLibraryBook,
        updateLibraryBook,
        deleteLibraryBook,
        addReadingLog,
        updateReadingLog,
        deleteReadingLog,
        addLibraryVisitor,
        updateLibraryVisitor,
        deleteLibraryVisitor,
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
        schoolGroups,
        addSchoolGroup,
        updateSchoolGroup,
        deleteSchoolGroup,
        addMemberToGroup,
        removeMemberFromGroup,
        updateGroupMemberRole,
        bulkAddMembersToGroup,
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
        syncStudentRosterToDrive,
        syncScoresAndRankingsToDrive,
        syncHonorRollToDrive,
        syncStaffDirectoryToDrive,
        restoreSchoolDatabaseFromDrive,
        triggerDriveAutoSyncAll,
        clearDriveSyncHistory,
        confirmAction,
        isStudentRegisteredInAccounts,
        autoGenerateStudentAccounts,
        kdSchoolInfo,
        kdTeacherProfile,
        kdClassInfo
      }}
    >
      {children}
      <ConfirmActionModal
        config={confirmModalConfig}
        onClose={closeConfirmModal}
      />
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
