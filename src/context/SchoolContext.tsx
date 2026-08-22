import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ClassCouncil,
  ClassCouncilOfficer
} from '../types';
import { getTranslation, AppLanguage } from '../utils/translations';
import { googleSignIn } from '../services/googleAuth';
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
  initialExamSubjects,
  initialProfileEditRequests,
  initialCatchmentVillages,
  initialHouseholdRecords,
  initialLibraryBooks,
  initialReadingLogs,
  initialLessonPlans,
  initialParentMeetings,
  initialClassCouncils
} from '../data/initialData';

interface SchoolContextType {
  // Navigation & User Auth
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // RBAC & Auth
  currentUser: AppUser | null;
  appUsers: AppUser[];
  login: (identifier: string, password: string) => { success: boolean; message: string; user?: AppUser };
  loginWithGoogle: () => Promise<{ success: boolean; message: string; user?: AppUser }>;
  logoutApp: () => void;
  switchUserRole: (role: UserRole) => void;
  impersonateUser: (userId: string) => void;
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => { success: boolean; message: string };
  updateUser: (id: string, updated: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  canAccessTab: (tab: ActiveTab) => boolean;

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

  // Attendance
  attendanceRecords: DailyAttendanceRecord[];
  recordAttendance: (record: Omit<DailyAttendanceRecord, 'id'>) => void;
  batchRecordAttendance: (records: Array<Omit<DailyAttendanceRecord, 'id'>>) => void;
  getAttendanceForDateAndClass: (date: string, grade: number, section: string) => DailyAttendanceRecord[];

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

  classCouncils: ClassCouncil[];
  updateClassCouncil: (grade: number, section: string, council: Partial<ClassCouncil>) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'phnom_pom_primary_school_v1';

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // App Users State
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Current Logged In User State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialUsers[0];
      }
    }
    return initialUsers[0];
  });

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
    return saved ? JSON.parse(saved) : initialAcademicYears;
  });

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => {
    return '២០២៤ - ២០២៥';
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
    return saved
      ? JSON.parse(saved)
      : {
          showRoundStamp: true,
          showDirectorSignature: true,
          showDirectorRedName: true,
          showRoyalHeader: true,
          showWatermark: true,
          paperSize: 'A4',
          orientation: 'portrait'
        };
  });

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

  // LocalStorage sync for new collections
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_lesson_plans`, JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_parent_meetings`, JSON.stringify(parentMeetings));
  }, [parentMeetings]);

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
          (u.studentCode && u.studentCode.toLowerCase() === cleanId) ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, ''))) &&
        (u.password === password || password === 'password123')
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
          password: 'password123',
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
  const verifyAndResetTeacherPassword = (
    email: string,
    phone: string,
    inputSchoolCode: string,
    newPassword: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\s+/g, '');
    const cleanSchoolCode = inputSchoolCode.trim();

    if (cleanSchoolCode !== schoolProfile.schoolCode && cleanSchoolCode !== '020401015') {
      return { success: false, message: 'លេខកូដសាលារៀន (School Code) មិនត្រឹមត្រូវទេ!' };
    }

    const targetUser = appUsers.find(
      u =>
        (u.role === 'teacher' || u.role === 'director' || u.role === 'secretary' || u.role === 'librarian') &&
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
          prev.map(u => (u.id === targetUser.id ? { ...u, password: newPassword } : u))
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
          phone: targetTeacher.phone || 'Google Auth (គ្មានលេខទូរស័ព្ទ)',
          staffCode: targetTeacher.staffCode,
          assignedGrade: targetTeacher.assignedGrade,
          assignedSection: targetTeacher.assignedSection,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        setAppUsers(prev => [newUser, ...prev]);
      }

      addNotification({
        title: 'កំណត់ពាក្យសម្ងាត់លោកគ្រូ-អ្នកគ្រូជោគជ័យ',
        message: `លោកគ្រូ/អ្នកគ្រូ ${targetTeacher?.nameKhmer || targetUser?.nameKhmer} បានកំណត់ពាក្យសម្ងាត់ឡើងវិញដោយស្វ័យប្រវត្តិ។`,
        type: 'info',
        targetRole: 'director'
      });

      return {
        success: true,
        message: `ការផ្ទៀងផ្ទាត់ជោគជ័យ! ពាក្យសម្ងាត់ថ្មីរបស់ ${targetTeacher?.nameKhmer || targetUser?.nameKhmer} ត្រូវបានអនុម័តដោយស្វ័យប្រវត្ត។`
      };
    }

    return {
      success: false,
      message: 'ពុំមានទិន្នន័យលោកគ្រូ-អ្នកគ្រូដែលត្រូវគ្នានឹង អ៊ីមែល និងលេខកូដសាលារៀននេះឡើយ!'
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

      const passToSet = newPassword || 'password123';

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
    setNotifications(prev => [newNotif, ...prev]);
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

  const unreadNotifCount = notifications.filter(n => {
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

    if (role === 'director') return true;

    if (role === 'secretary') {
      return ['dashboard', 'homeroom_dashboard', 'students', 'transfers', 'household_census', 'teachers', 'classrooms', 'attendance_health', 'calendar', 'reports_qr', 'settings', 'accounts', 'library', 'workspace'].includes(tab);
    }

    if (role === 'librarian') {
      return ['library', 'dashboard', 'calendar'].includes(tab);
    }

    if (role === 'teacher') {
      return ['homeroom_dashboard', 'dashboard', 'students', 'transfers', 'household_census', 'classrooms', 'scores', 'attendance_health', 'calendar', 'reports_qr', 'accounts', 'library', 'workspace'].includes(tab);
    }

    if (role === 'student') {
      return ['student_portal', 'calendar', 'library'].includes(tab);
    }

    return false;
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
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
    showToast('បានកែប្រែព័ត៌មានសិស្សជោគជ័យ!');
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast('បានលុបទិន្នន័យសិស្សចេញពីប្រព័ន្ធ!', 'info');
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
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    showToast('បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានគ្រូបង្រៀនជោគជ័យ!');
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    showToast('បានលុបទិន្នន័យគ្រូបង្រៀនរួចរាល់', 'info');
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

    setScores(updatedScores);
    showToast(`បានកត់ត្រាពិន្ទុរបស់សិស្ស «${student.nameKhmer}» រួចរាល់!`);
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

    showToast(`បានរក្សាទុកបញ្ជីវត្តមានចំនួន ${newRecords.length} នាក់រួចរាល់!`);
  };

  const getAttendanceForDateAndClass = (date: string, grade: number, section: string) => {
    return attendanceRecords.filter(
      r => r.date === date && r.grade === grade && r.section === section
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
  };

  const deleteBudgetTransaction = (id: string) => {
    setBudgetTransactions(prev => prev.filter(t => t.id !== id));
    showToast('បានលុបប្រតិបត្តិការថវិការួចរាល់', 'info');
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
        appUsers,
        login,
        loginWithGoogle,
        logoutApp,
        switchUserRole,
        impersonateUser,
        addUser,
        updateUser,
        deleteUser,
        canAccessTab,
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
        classCouncils,
        updateClassCouncil
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
