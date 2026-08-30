import {
  SchoolProfile,
  Teacher,
  Classroom,
  Student,
  StudentScoreRecord,
  BudgetTransaction,
  DailyAttendanceRecord,
  AcademicCalendarEvent,
  ExamSubject,
  StudentTransferRecord,
  ProfileEditRequest,
  LessonPlan,
  ParentMeeting,
  ParentRequest,
  ClassCouncil,
  OfficialCorrespondence,
  StaffAdministrativeRecord,
  SchoolCommittee,
  SchoolStrategicPlanItem,
  ModelSchoolStandardGroup,
  SchoolAssetItem,
  AtRiskStudent,
  DailyClassLog,
  BadgeDefinition,
  StudentBadgeAssignment,
  SchoolEquipmentItem,
  EquipmentLoanRecord,
  TeacherDailyTask,
  TeacherMeetingRecord,
  TeachingResourceFile,
  AcademicAchievement,
  SchoolGroup,
  LibraryBook,
  LibraryReadingLog,
  LibraryVisitorLog
} from '../types';

export const toKhmerNum = (num: number | string): string => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  if (month >= 11) {
    return `${toKhmerNum(year)} - ${toKhmerNum(year + 1)}`;
  } else {
    return `${toKhmerNum(year - 1)} - ${toKhmerNum(year)}`;
  }
};

export const getDynamicAcademicYears = () => {
  const years: string[] = [];
  // Generate academic years from 2016-2017 to 2050-2051
  for (let y = 2016; y <= 2050; y++) {
    years.push(`${toKhmerNum(y)} - ${toKhmerNum(y + 1)}`);
  }
  return years;
};

export const initialSchoolProfile: SchoolProfile = {
  nameKhmer: 'សាលាបឋមសិក្សាភ្នំពុំ',
  nameLatin: 'Phnom Pom Primary School',
  schoolCode: '02100108027',
  province: 'ខេត្តបាត់ដំបង',
  district: 'ស្រុកភ្នំព្រឹក',
  commune: 'ឃុំបារាំងធ្លាក់',
  village: 'ភូមិអូរគល់សំយ៉ុង',
  principalName: 'លោក លីម សន',
  principalPhone: '087 99 19 77',
  deputyPrincipalName: 'លោក ឈិន សុផល',
  academicYear: getCurrentAcademicYear(),
  establishedYear: '២០០៥',
  cluster: 'កម្រងសាលាបឋមសិក្សាភ្នំពុំ',
  email: 'phnompom.primary@moeys.gov.kh',
  logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
  mapUrl: 'https://maps.app.goo.gl/ackTYSYsd7t54vGP6',
  facebookPage: 'https://www.facebook.com/share/1EZeRXioNB/',
  directorPin: '1212'
};

export const initialTeachers: Teacher[] = [
  {
    id: 't-1',
    staffCode: 'MOEYS-104921',
    nameKhmer: 'លោក លីម សន',
    nameLatin: 'Lim Sorn',
    gender: 'M',
    dob: '1980-05-12',
    phone: '087 99 19 77',
    email: 'limsorn9@gmail.com',
    qualification: 'បរិញ្ញាបត្រជាន់ខ្ពស់ គ្រប់គ្រងអប់រំ',
    role: 'នាយកសាលា',
    yearsOfService: 20,
    startDate: '2004-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'ប្រជុំគណៈគ្រប់គ្រង & ផែនការសាលា', timeSlot: '07:30 - 08:30', gradeClass: 'រដ្ឋបាល' }
    ]
  }
];

export const initialClassrooms: Classroom[] = [];

export const initialStudents: Student[] = [];

export const initialScores: StudentScoreRecord[] = [];

export const initialBudgetTransactions: BudgetTransaction[] = [];

export const initialAttendanceRecords: DailyAttendanceRecord[] = [];

export const initialCalendarEvents: AcademicCalendarEvent[] = [];

export const initialUsers = [
  {
    id: 'u-super-admin',
    username: 'limsorn',
    email: 'limsorn9@gmail.com',
    password: 'Ls12122012@',
    nameKhmer: 'លោក លីម សន (Super Admin)',
    nameLatin: 'Lim Sorn',
    role: 'super_admin' as const,
    phone: '087 99 19 77',
    staffCode: 'MOEYS-SUPER-001',
    createdAt: '2024-01-01',
    status: 'active' as const
  }
];

export const initialDeletedUsers: any[] = [];

export const initialAccountAuditLogs: any[] = [];

export const initialNotifications: any[] = [];

export const initialTransfers: StudentTransferRecord[] = [];

export const initialAcademicYears: string[] = getDynamicAcademicYears();

export const initialExamSubjects: ExamSubject[] = [
  { id: 'sub-1', code: 'listening', nameKhmer: 'សមត្ថភាពស្តាប់', nameLatin: 'Listening Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-2', code: 'writing', nameKhmer: 'សមត្ថភាពសរសេរ', nameLatin: 'Writing Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-3', code: 'reading', nameKhmer: 'សមត្ថភាពអាន', nameLatin: 'Reading Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-4', code: 'speaking', nameKhmer: 'សមត្ថភាពនិយាយ', nameLatin: 'Speaking Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-5', code: 'numbers', nameKhmer: 'ចំនួន', nameLatin: 'Numbers & Operations', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-6', code: 'measurement', nameKhmer: 'រង្វាស់រង្វាល់', nameLatin: 'Measurement', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-7', code: 'geometry', nameKhmer: 'ធរណីមាត្រ', nameLatin: 'Geometry', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-8', code: 'algebra', nameKhmer: 'ពីជគណិត', nameLatin: 'Algebra / Patterns', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-9', code: 'statistics', nameKhmer: 'ស្ថិតិ', nameLatin: 'Statistics & Probability', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-10', code: 'science', nameKhmer: 'វិទ្យាសាស្ត្រ', nameLatin: 'Science', category: 'science_social', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-11', code: 'socialStudies', nameKhmer: 'សិក្សាសង្គម', nameLatin: 'Social Studies', category: 'science_social', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-12', code: 'moralCivics', nameKhmer: 'សីលធម៌', nameLatin: 'Moral & Civics', category: 'science_social', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-13', code: 'homeEconomicsArts', nameKhmer: 'គេហកិច្ច-អប់រំសិល្បៈ', nameLatin: 'Home Economics & Arts', category: 'arts_pe', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-14', code: 'physicalHealth', nameKhmer: 'អប់រំកាយ-កីឡាសុខភាព-អនាម័យ', nameLatin: 'Physical Ed, Sports & Health', category: 'arts_pe', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-15', code: 'lifeSkills', nameKhmer: 'អប់រំបំណិនជីវិត', nameLatin: 'Life Skills Education', category: 'skills_language', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-16', code: 'foreignLanguage', nameKhmer: 'ភាសាបរទេស', nameLatin: 'Foreign Language (English/French)', category: 'skills_language', maxScore: 10, weight: 1, isDefault: true }
];

export const initialCatchmentVillages: string[] = [
  'ភូមិអូរគល់សំយ៉ុង',
  'ភូមិទួលខ្វាវ',
  'ភូមិចំការស្រូវ',
  'ភូមិបារាំងធ្លាក់',
  'ភូមិអូរធំ',
  'ភូមិទួលកកោះ'
];

export const initialHouseholdRecords: any[] = [];

export const initialLibraryBooks: LibraryBook[] = [
  {
    id: 'bk-1',
    code: 'BK-2024-001',
    titleKhmer: 'រឿងកូនទន្សាយឈ្លាសវៃ និងតោ',
    titleLatin: 'The Clever Rabbit and the Lion',
    category: 'storybook',
    format: 'physical',
    author: 'នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា MoEYS',
    publisher: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publishedYear: '2023',
    gradeLevel: 2,
    totalCopies: 12,
    availableCopies: 10,
    shelfLocation: 'ទូ A-01 (រឿងនិទាន)',
    isbnBarcode: '978-99950-1-001-2',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    description: 'រឿងនិទានបង្កប់ការអប់រំប្រាជ្ញាស្មារតី ភាពវៃឆ្លាត និងការដោះស្រាយបញ្ហាសម្រាប់កុមារបឋមសិក្សា។'
  },
  {
    id: 'bk-2',
    code: 'BK-2024-002',
    titleKhmer: 'ភាសាខ្មែរ ថ្នាក់ទី១ (សៀវភៅពុម្ពគោល)',
    titleLatin: 'Khmer Language Grade 1',
    category: 'core_textbook',
    format: 'physical',
    author: 'គណៈកម្មការរៀបចំសៀវភៅពុម្ព MoEYS',
    publisher: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publishedYear: '2024',
    gradeLevel: 1,
    totalCopies: 35,
    availableCopies: 30,
    shelfLocation: 'ទូ B-01 (សៀវភៅពុម្ព)',
    isbnBarcode: '978-99950-2-101-5',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'សៀវភៅពុម្ពគោលភាសាខ្មែរថ្នាក់ទី១ ផ្តោតលើការប្រកបព្យញ្ជនៈ ស្រៈ និងពាក្យគន្លឹះតាមវិធីសាស្ត្រ EGRA។'
  },
  {
    id: 'bk-3',
    code: 'BK-2024-003',
    titleKhmer: 'គណិតវិទ្យា ថ្នាក់ទី២ (សៀវភៅពុម្ពគោល)',
    titleLatin: 'Mathematics Grade 2',
    category: 'core_textbook',
    format: 'physical',
    author: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publisher: 'MoEYS',
    publishedYear: '2024',
    gradeLevel: 2,
    totalCopies: 30,
    availableCopies: 27,
    shelfLocation: 'ទូ B-02 (គណិតវិទ្យា)',
    isbnBarcode: '978-99950-2-202-9',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1632571401005-458e9d244591?w=400&auto=format&fit=crop&q=80',
    description: 'មេរៀនលេខនព្វន្ត ការបូក ដក គុណ ចែក លេខធរណីមាត្រ និងការដោះស្រាយចំណោទសាមញ្ញ។'
  },
  {
    id: 'bk-4',
    code: 'BK-2024-004',
    titleKhmer: 'រឿងសុភាទន្សាយ និងក្រពើកំហូច',
    titleLatin: 'Judge Rabbit and the Wicked Crocodile',
    category: 'storybook',
    format: 'physical',
    author: 'អង្គការស៊ីប៉ា (SIPAR) & MoEYS',
    publisher: 'SIPAR Books',
    publishedYear: '2022',
    gradeLevel: 3,
    totalCopies: 10,
    availableCopies: 7,
    shelfLocation: 'ទូ A-02 (រឿងព្រេងបុរាណ)',
    isbnBarcode: '978-99950-3-404-1',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
    description: 'រឿងព្រេងប្រជាប្រិយខ្មែរអប់រំអំពីយុត្តិធម៌ និងការកុំរមិលគុណអ្នកដទៃ។'
  },
  {
    id: 'bk-5',
    code: 'BK-2024-005',
    titleKhmer: 'វិទ្យាសាស្ត្រ និងការអនុវត្ត ថ្នាក់ទី៤',
    titleLatin: 'Science and Application Grade 4',
    category: 'science',
    format: 'physical',
    author: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publisher: 'MoEYS',
    publishedYear: '2023',
    gradeLevel: 4,
    totalCopies: 25,
    availableCopies: 21,
    shelfLocation: 'ទូ C-01 (វិទ្យាសាស្ត្រ)',
    isbnBarcode: '978-99950-4-005-3',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80',
    description: 'ចំណេះដឹងអំពីពិភពរុក្ខជាតិ សត្វ បរិស្ថាន និងបាតុភូតធម្មជាតិនានា។'
  },
  {
    id: 'bk-6',
    code: 'BK-2024-006',
    titleKhmer: 'វចនានុក្រមខ្មែរ សម្តេចព្រះសង្ឃរាជ ជួន ណាត',
    titleLatin: 'Choun Nath Khmer Dictionary',
    category: 'reference',
    format: 'physical',
    author: 'សម្តេចព្រះសង្ឃរាជ ជួន ណាត',
    publisher: 'ពុទ្ធសាសនបណ្ឌិត្យ',
    publishedYear: '2020',
    gradeLevel: 6,
    totalCopies: 6,
    availableCopies: 5,
    shelfLocation: 'ទូ D-01 (ឯកសារយោង & វចនានុក្រម)',
    isbnBarcode: '978-99950-0-100-9',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80',
    description: 'វចនានុក្រមស្តង់ដាជាតិខ្មែរ សម្រាប់ស្រាវជ្រាវអក្ខរាវិរុទ្ធ និយមន័យ និងប្រភពពាក្យ។'
  },
  {
    id: 'bk-7',
    code: 'BK-2024-007',
    titleKhmer: 'ប្រវត្តិសាស្ត្រខ្មែរសង្ខេបសម្រាប់កុមារបឋម',
    titleLatin: 'Brief History of Cambodia for Kids',
    category: 'history',
    format: 'physical',
    author: 'នាយកដ្ឋានស្រាវជ្រាវគរុកោសល្យ MoEYS',
    publisher: 'MoEYS',
    publishedYear: '2023',
    gradeLevel: 5,
    totalCopies: 15,
    availableCopies: 12,
    shelfLocation: 'ទូ C-02 (ប្រវត្តិសាស្ត្រ)',
    isbnBarcode: '978-99950-5-007-8',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80',
    description: 'ប្រវត្តិសម័យអង្គរ សម័យឧដុង្គ និងវីរបុរសជាតិខ្មែរដែលបានកសាងប្រាង្គប្រាសាទ។'
  },
  {
    id: 'bk-8',
    code: 'BK-2024-008',
    titleKhmer: 'សៀវភៅឌីជីថល (E-Book)៖ មគ្គុទ្ទេសក៍សុខភាពកុមារ & សុវត្ថិភាព',
    titleLatin: 'E-Book: Child Health and Safety Guide',
    category: 'general',
    format: 'digital',
    digitalFileUrl: 'https://moeys.gov.kh',
    author: 'ក្រសួងសុខាភិបាល និង MoEYS',
    publisher: 'MoEYS E-Library',
    publishedYear: '2024',
    gradeLevel: 3,
    totalCopies: 100,
    availableCopies: 100,
    shelfLocation: 'តំណភ្ជាប់ឌីជីថល (Digital Cloud)',
    isbnBarcode: 'E-BOOK-2024-889',
    bookCondition: 'good',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
    description: 'សៀវភៅ E-Book ណែនាំការថែទាំអនាម័យខ្លួនប្រាណ ការលាងដៃ និងសុវត្ថិភាពចរាចរណ៍។'
  }
];

export const initialReadingLogs: LibraryReadingLog[] = [
  {
    id: 'rl-1',
    studentId: 'stu-sample-1',
    studentCode: 'STU-001',
    studentNameKhmer: 'សុខ ចាន់ដារ៉ា',
    grade: 3,
    section: 'ក',
    bookId: 'bk-1',
    bookCode: 'BK-2024-001',
    bookTitle: 'រឿងកូនទន្សាយឈ្លាសវៃ និងតោ',
    bookCategory: 'storybook',
    borrowDate: '2026-08-20',
    dueDate: '2026-08-27',
    returnDate: '2026-08-26',
    status: 'returned',
    pagesRead: 28,
    readingSummary: 'រឿងនេះអប់រំកុំឱ្យមើលងាយអ្នកតូចតាច ហើយទន្សាយបានប្រើប្រាជ្ញាដើម្បីសង្គ្រោះសត្វព្រៃពីតោកាច។',
    rating: 5,
    conditionOnReturn: 'good',
    librarianName: 'បណ្ណារក្ស'
  },
  {
    id: 'rl-2',
    studentId: 'stu-sample-2',
    studentCode: 'STU-002',
    studentNameKhmer: 'ចាន់ មុនីរ័ត្ន',
    grade: 4,
    section: 'ក',
    bookId: 'bk-4',
    bookCode: 'BK-2024-004',
    bookTitle: 'រឿងសុភាទន្សាយ និងក្រពើកំហូច',
    bookCategory: 'storybook',
    borrowDate: '2026-08-22',
    dueDate: '2026-08-29',
    returnDate: '2026-08-28',
    status: 'returned',
    pagesRead: 34,
    readingSummary: 'បានយល់ដឹងពីភាពស្មោះត្រង់ និងយុត្តិធម៌ ព្រមទាំងការកុំក្បត់ទំនុកចិត្តអ្នកដទៃ។',
    rating: 5,
    conditionOnReturn: 'good',
    librarianName: 'បណ្ណារក្ស'
  },
  {
    id: 'rl-3',
    studentId: 'stu-sample-3',
    studentCode: 'STU-003',
    studentNameKhmer: 'ហេង ពិសិដ្ឋ',
    grade: 5,
    section: 'ខ',
    bookId: 'bk-5',
    bookCode: 'BK-2024-005',
    bookTitle: 'វិទ្យាសាស្ត្រ និងការអនុវត្ត ថ្នាក់ទី៤',
    bookCategory: 'science',
    borrowDate: '2026-08-25',
    dueDate: '2026-09-01',
    status: 'borrowed',
    pagesRead: 18,
    readingSummary: 'កំពុងអានមេរៀនអំពីការដុះលូតលាស់នៃគ្រាប់ពូជ និងការធ្វើរស្មីសំយោគរបស់រុក្ខជាតិ។',
    librarianName: 'បណ្ណារក្ស'
  },
  {
    id: 'rl-4',
    studentId: 'stu-sample-4',
    studentCode: 'STU-004',
    studentNameKhmer: 'គង់ ស្រីនី',
    grade: 2,
    section: 'ក',
    bookId: 'bk-1',
    bookCode: 'BK-2024-001',
    bookTitle: 'រឿងកូនទន្សាយឈ្លាសវៃ និងតោ',
    bookCategory: 'storybook',
    borrowDate: '2026-08-15',
    dueDate: '2026-08-22',
    status: 'overdue',
    pagesRead: 15,
    notes: 'ហួសកាលកំណត់ ៧ ថ្ងៃ - បណ្ណារក្សបានផ្ញើដំណឹងរំលឹកតាមរយៈគ្រូបន្ទុកថ្នាក់',
    librarianName: 'បណ្ណារក្ស'
  }
];

export const initialLibraryVisitors: LibraryVisitorLog[] = [
  {
    id: 'vis-1',
    studentCode: 'STU-001',
    studentNameKhmer: 'សុខ ចាន់ដារ៉ា',
    grade: 3,
    section: 'ក',
    visitDate: '2026-08-29',
    timeIn: '08:30',
    timeOut: '09:15',
    purpose: 'reading',
    notes: 'អានសៀវភៅរឿងនិទាន',
    librarianName: 'បណ្ណារក្ស'
  },
  {
    id: 'vis-2',
    studentCode: 'STU-002',
    studentNameKhmer: 'ចាន់ មុនីរ័ត្ន',
    grade: 4,
    section: 'ក',
    visitDate: '2026-08-29',
    timeIn: '09:00',
    timeOut: '09:45',
    purpose: 'borrow_return',
    notes: 'សងសៀវភៅ និងខ្ចីសៀវភៅវិទ្យាសាស្ត្រថ្មី',
    librarianName: 'បណ្ណារក្ស'
  },
  {
    id: 'vis-3',
    studentCode: 'STU-003',
    studentNameKhmer: 'ហេង ពិសិដ្ឋ',
    grade: 5,
    section: 'ខ',
    visitDate: '2026-08-30',
    timeIn: '10:15',
    timeOut: '11:00',
    purpose: 'research',
    notes: 'ស្រាវជ្រាវមេរៀនប្រវត្តិសាស្ត្រអង្គរ',
    librarianName: 'បណ្ណារក្ស'
  }
];

export const initialProfileEditRequests: ProfileEditRequest[] = [];

export const initialLessonPlans: LessonPlan[] = [];

export const initialParentMeetings: ParentMeeting[] = [];

export const initialParentRequests: ParentRequest[] = [];

export const initialClassCouncils: ClassCouncil[] = [];

export const initialCorrespondences: OfficialCorrespondence[] = [];

export const initialStaffAdministrativeRecords: StaffAdministrativeRecord[] = [];

export const initialSchoolCommittees: SchoolCommittee[] = [];

export const initialSchoolStrategicPlans: SchoolStrategicPlanItem[] = [];

export const initialModelSchoolStandards: ModelSchoolStandardGroup[] = [
  {
    standardNumber: 1,
    standardTitleKhmer: 'ស្តង់ដាទី១៖ លទ្ធផលសិក្សារបស់សិស្ស (Student Learning Outcomes)',
    description: 'ការវាយតម្លៃលើលទ្ធផលនៃការរៀនសូត្រ ចំណេះដឹង បំណិន និងឥរិយាបថសីលធម៌របស់សិស្សានុសិស្ស',
    criteria: [
      { id: 'crit-1-1', criterionNumber: '១.១', nameKhmer: 'អត្រាឡើងថ្នាក់ និងអត្រាបញ្ចប់ការសិក្សា', description: 'សិស្សឡើងថ្នាក់ខ្ពស់ជាង ៩០% និងអត្រាបោះបង់តិចជាង ៣%', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-1-2', criterionNumber: '១.២', nameKhmer: 'សមត្ថភាពអាន-សរសេរ និងគណិតវិទ្យាថ្នាក់ដំបូង', description: 'លទ្ធផលតេស្ត EGRA/EGMA ស្របតាមស្តង់ដាកំណត់របស់ MoEYS', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-1-3', criterionNumber: '១.៣', nameKhmer: 'ការអប់រំសីលធម៌ គុណធម៌ និងវិន័យសិស្ស', description: 'សិស្សមានសុជីវធម៌ គោរពទង់ជាតិ ស្រឡាញ់មិត្តភក្តិ និងចេះជួយគ្នា', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' }
    ]
  },
  {
    standardNumber: 2,
    standardTitleKhmer: 'ស្តង់ដាទី២៖ ដំណើរការបង្រៀន និងរៀន (Teaching and Learning Process)',
    description: 'ការអនុវត្តវិធីសាស្ត្របង្រៀនបែបសកម្ម ការប្រើប្រាស់កិច្ចតែងការ និងសម្ភារៈឧបទេសបង្រៀន',
    criteria: [
      { id: 'crit-2-1', criterionNumber: '២.១', nameKhmer: 'ការរៀបចំកិច្ចតែងការបង្រៀន ៥ ជំហាន', description: 'គ្រូមានកិច្ចតែងការទៀងទាត់ និងត្រឹមត្រូវតាមកម្រិតថ្នាក់', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-2-2', criterionNumber: '២.២', nameKhmer: 'ការប្រើប្រាស់សម្ភារៈឧបទេស និងបច្ចេកវិទ្យា', description: 'មានសម្ភារៈរូបវន្ត និងបច្ចេកវិទ្យាឌីជីថលជំនួយដល់ការយល់ដឹង', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-2-3', criterionNumber: '២.៣', nameKhmer: 'ការជួយគាំទ្រសិស្សរៀនយឺត និងសិស្សមានតម្រូវការពិសេស', description: 'មានកម្មវិធីបំប៉នបន្ថែម និងការយកចិត្តទុកដាក់លើសិស្សពិការ', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' }
    ]
  },
  {
    standardNumber: 3,
    standardTitleKhmer: 'ស្តង់ដាទី៣៖ ការចូលរួមរបស់សហគមន៍ (Community & Parent Engagement)',
    description: 'កិច្ចសហការជិតស្និទ្ធរវាងសាលារៀន អាជ្ញាធរដែនដី មាតាបិតាសិស្ស និងអង្គការដៃគូ',
    criteria: [
      { id: 'crit-3-1', criterionNumber: '៣.១', nameKhmer: 'ដំណើរការគណៈកម្មការគ្រប់គ្រងសាលារៀន (គ.ក.ស.)', description: 'មានកិច្ចប្រជុំទៀងទាត់ និងមានសេចក្តីសម្រេចគាំទ្រជាក់ស្តែង', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-3-2', criterionNumber: '៣.២', nameKhmer: 'ការចូលរួមរបស់មាតាបិតាសិស្ស', description: 'មាតាបិតាចូលរួមប្រជុំ គាំទ្រសម្ភារៈ និងតាមដានកូននៅផ្ទះ', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-3-3', criterionNumber: '៣.៣', nameKhmer: 'ការកៀរគរធនធានសង្គមដើម្បីអភិវឌ្ឍន៍សាលា', description: 'ទទួលបានការឧបត្ថម្ភពីសប្បុរសជន និងអាជ្ញាធរឃុំ-ស្រុក', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' }
    ]
  },
  {
    standardNumber: 4,
    standardTitleKhmer: 'ស្តង់ដាទី៤៖ ប្រតិបត្តិការ និងអភិបាលកិច្ចសាលារៀន (School Operations & Management)',
    description: 'បរិស្ថានសាលារៀនស្អាត បៃតង សុវត្ថិភាព ហេដ្ឋារចនាសម្ព័ន្ធ និងការគ្រប់គ្រងធនធានមនុស្ស',
    criteria: [
      { id: 'crit-4-1', criterionNumber: '៤.១', nameKhmer: 'បរិស្ថានសាលារៀនបៃតង ស្អាត និងគ្មានសំរាម', description: 'មានសួនផ្កា ដើមឈើម្លប់ ធុងសំរាមបែងចែក និងគ្មានថង់ប្លាស្ទិក', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-4-2', criterionNumber: '៤.២', nameKhmer: 'ប្រព័ន្ធទឹកស្អាត និងបង្គន់អនាម័យ', description: 'មានទឹកស្អាតពិសារគ្រប់គ្រាន់ និងបង្គន់អនាម័យមានអនាម័យល្អ', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-4-3', criterionNumber: '៤.៣', nameKhmer: 'ការគ្រប់គ្រងរដ្ឋបាល និងប្រព័ន្ធព័ត៌មានវិទ្យា', description: 'មានសៀវភៅលិខិតចូល-ចេញ បញ្ជីស្ថិតិ និងការប្រើប្រាស់ Software', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' }
    ]
  },
  {
    standardNumber: 5,
    standardTitleKhmer: 'ស្តង់ដាទី៥៖ គណនេយ្យភាព និងតម្លាភាពសាលារៀន (Accountability & Transparency)',
    description: 'ការបើកចំហព័ត៌មានថវិកា ការវាយតម្លៃលទ្ធផលការងារ និងការឆ្លើយតបចំពោះសហគមន៍',
    criteria: [
      { id: 'crit-5-1', criterionNumber: '៥.១', nameKhmer: 'តម្លាភាពនៃការប្រើប្រាស់ថវិកាដំណើរការសាលា (PB/SIG)', description: 'មានបិទផ្សាយតារាងចំណូល-ចំណាយជាសាធារណៈលើក្តារព័ត៌មាន', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' },
      { id: 'crit-5-2', criterionNumber: '៥.២', nameKhmer: 'ការឆ្លើយតបនឹងមតិយោបល់របស់មាតាបិតា និងសិស្ស', description: 'មានប្រអប់សំបុត្រ ឬប្រព័ន្ធផ្តល់មតិយោបល់ត្រឡប់ទៀងទាត់', maxScore: 5, currentScore: 0, status: 'needs_improvement', evidenceDocument: '' }
    ]
  }
];

export const initialSchoolAssets: SchoolAssetItem[] = [];

export const initialAtRiskStudents: AtRiskStudent[] = [];

export const initialDailyClassLogs: DailyClassLog[] = [];

export const initialBadgeDefinitions: BadgeDefinition[] = [
  {
    id: 'bdg-acad-01',
    code: 'BDG-ACAD-01',
    titleKhmer: 'ជើងឯកឆ្នើមប្រចាំខែ',
    titleEnglish: 'Monthly Honor Scholar',
    description: 'ទទួលបានចំណាត់ថ្នាក់លេខ ១ ដល់លេខ ៣ ប្រចាំខែ ឬមានពិន្ទុសរុបខ្ពស់បំផុត',
    category: 'academic',
    tier: 'gold',
    points: 50,
    iconName: 'Trophy',
    criteria: 'ទទួលបានមធ្យមភាគពិន្ទុចាប់ពី ៨.៥ ឡើង និងស្ថិតក្នុងចំណាត់ថ្នាក់កំពូល Top 3',
    colorScheme: {
      bgLight: 'bg-amber-50',
      bgBadge: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      ringColor: 'ring-amber-400',
      gradient: 'from-amber-400 via-yellow-500 to-amber-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-acad-02',
    code: 'BDG-ACAD-02',
    titleKhmer: 'សរសេរស្អាត & អក្សរផ្ចង់',
    titleEnglish: 'Calligraphy & Neat Work',
    description: 'កត់ត្រាមេរៀនបានស្អាត អក្សរផ្ចិតផ្ចង់ និងគ្មានកំហុសអក្ខរាវិរុទ្ធ',
    category: 'academic',
    tier: 'silver',
    points: 35,
    iconName: 'Award',
    criteria: 'សរសេរសៀវភៅស្អាតគ្មានស្នាមលុប និងជាប់ជយលាភីអក្សរផ្ចង់ប្រចាំថ្នាក់',
    colorScheme: {
      bgLight: 'bg-blue-50',
      bgBadge: 'bg-blue-600',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      ringColor: 'ring-blue-400',
      gradient: 'from-slate-400 via-blue-500 to-cyan-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-att-01',
    code: 'BDG-ATT-01',
    titleKhmer: 'វត្តមានពេញលេញ ១០០%',
    titleEnglish: '100% Attendance Hero',
    description: 'មិនដែលអវត្តមាន និងមិនដែលមកយឺតក្នុងអំឡុងពេលមួយខែ ឬមួយឆមាស',
    category: 'attendance',
    tier: 'gold',
    points: 50,
    iconName: 'ShieldCheck',
    criteria: 'មានអត្រាវត្តមាន ១០០% គ្មានច្បាប់ និងគ្មានអវត្តមានឥតច្បាប់',
    colorScheme: {
      bgLight: 'bg-emerald-50',
      bgBadge: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
      ringColor: 'ring-emerald-400',
      gradient: 'from-emerald-400 via-teal-500 to-green-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-att-02',
    code: 'BDG-ATT-02',
    titleKhmer: 'ទៀងទាត់ពេលវេលា',
    titleEnglish: 'Punctuality Champion',
    description: 'មកដល់សាលាមុនម៉ោង និងត្រៀមសម្ភារៈសិក្សាបានរួចរាល់ជានិច្ច',
    category: 'attendance',
    tier: 'silver',
    points: 25,
    iconName: 'Zap',
    criteria: 'មកដល់ថ្នាក់រៀនមុនម៉ោងកណ្តឹងបន្លឺយ៉ាងហោច ១៥នាទីជាប់ៗគ្នា',
    colorScheme: {
      bgLight: 'bg-sky-50',
      bgBadge: 'bg-sky-600',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-300',
      ringColor: 'ring-sky-400',
      gradient: 'from-sky-400 via-blue-500 to-indigo-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-mor-01',
    code: 'BDG-MOR-01',
    titleKhmer: 'សីលធម៌ និងការគោរពវិន័យ',
    titleEnglish: 'Ethics & Good Citizen',
    description: 'គោរពគ្រូ មិត្តភក្តិ មានសុជីវធម៌ក្នុងការនិយាយស្តី និងគោរពបទបញ្ជាផ្ទៃក្នុង',
    category: 'behavior_discipline',
    tier: 'platinum',
    points: 60,
    iconName: 'HeartHandshake',
    criteria: 'គ្មានកំណត់ត្រាវិន័យអវិជ្ជមាន និងតែងតែជួយការងារថ្នាក់ និងសាលារៀន',
    colorScheme: {
      bgLight: 'bg-purple-50',
      bgBadge: 'bg-purple-600',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
      ringColor: 'ring-purple-400',
      gradient: 'from-purple-400 via-indigo-500 to-pink-500'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-act-01',
    code: 'BDG-ACT-01',
    titleKhmer: 'អ្នកអានឆ្នើមប្រចាំបណ្ណាល័យ',
    titleEnglish: 'Library Reading Star',
    description: 'អានសៀវភៅបានច្រើនជាងគេ និងសរសេរប័ណ្ណសង្ខេបសៀវភៅទៀងទាត់',
    category: 'reading_literacy',
    tier: 'gold',
    points: 40,
    iconName: 'BookOpen',
    criteria: 'ខ្ចី និងអានសៀវភៅបណ្ណាល័យចាប់ពី ១០ ក្បាលឡើងក្នុងមួយខែ',
    colorScheme: {
      bgLight: 'bg-rose-50',
      bgBadge: 'bg-rose-600',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-300',
      ringColor: 'ring-rose-400',
      gradient: 'from-rose-400 via-pink-500 to-red-500'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-env-01',
    code: 'BDG-ENV-01',
    titleKhmer: 'ទូតបៃតង និងអនាម័យ',
    titleEnglish: 'Eco & Green Warrior',
    description: 'ចូលរួមថែរក្សាបរិស្ថាន ស្រឡាញ់រុក្ខជាតិ និងចោលសំរាមក្នុងធុងបានត្រឹមត្រូវ',
    category: 'environmental_hygiene',
    tier: 'bronze',
    points: 30,
    iconName: 'Leaf',
    criteria: 'សកម្មក្នុងចលនាសាលាស្អាត គ្មានថង់ប្លាស្ទិក និងថែសួនផ្កាក្នុងថ្នាក់',
    colorScheme: {
      bgLight: 'bg-green-50',
      bgBadge: 'bg-green-600',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      ringColor: 'ring-green-400',
      gradient: 'from-green-400 via-emerald-500 to-teal-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-lead-01',
    code: 'BDG-LEAD-01',
    titleKhmer: 'ប្រធានក្រុម និងអ្នកដឹកនាំគំរូ',
    titleEnglish: 'Star Student Leader',
    description: 'មានស្មារតីទទួលខុសត្រូវខ្ពស់ ជួយសម្របសម្រួលមិត្តភក្តិ និងដឹកនាំក្រុមបានល្អ',
    category: 'leadership_cooperation',
    tier: 'platinum',
    points: 50,
    iconName: 'Crown',
    criteria: 'ជាប្រធានថ្នាក់ ឬអនុប្រធានថ្នាក់ដែលបំពេញភារកិច្ចបានល្អឥតខ្ចោះ',
    colorScheme: {
      bgLight: 'bg-indigo-50',
      bgBadge: 'bg-indigo-600',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-300',
      ringColor: 'ring-indigo-400',
      gradient: 'from-indigo-400 via-purple-500 to-blue-600'
    },
    isSystemDefault: true
  }
];

export const initialStudentBadgeAssignments: StudentBadgeAssignment[] = [];

export const initialSchoolEquipment: SchoolEquipmentItem[] = [];

export const initialEquipmentLoans: EquipmentLoanRecord[] = [];

export const initialTeacherDailyTasks: TeacherDailyTask[] = [];

export const initialTeacherMeetings: TeacherMeetingRecord[] = [];

export const initialTeachingResources: TeachingResourceFile[] = [];

export const initialAcademicAchievements: AcademicAchievement[] = [];

export const initialSchoolGroups: SchoolGroup[] = [];

export const initialLibraryBooks: LibraryBook[] = [
  {
    id: 'bk-1',
    code: 'BK-ST-001',
    isbn: '978-99950-1-001-2',
    title: 'ដំណើរផ្សងព្រេងរបស់សូផាត និងកូនឆ្មាវេទមន្ត',
    author: 'អង្គការស៊ីប៉ា (SIPAR)',
    publisher: 'គ្រឹះស្ថានបោះពុម្ព និងចែកផ្សាយ',
    publishYear: '២០២២',
    category: 'storybook',
    gradeLevel: 3,
    totalCopies: 15,
    availableCopies: 13,
    shelfLocation: 'ធ្នើ A1 - រឿងនិទានកុមារ',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    language: 'khmer',
    condition: 'good',
    description: 'រឿងនិទានអប់រំចិត្តកុមារអំពីភាពស្មោះត្រង់ មិត្តភាព និងការស្រឡាញ់សត្វ',
    addedDate: '2024-01-15',
    academicYear: '២០២៤ - ២០២៥'
  },
  {
    id: 'bk-2',
    code: 'BK-TB-G5-KH',
    isbn: '978-99950-2-501-4',
    title: 'សៀវភៅពុម្ពភាសាខ្មែរ ថ្នាក់ទី៥ (ភាគ១)',
    author: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publisher: 'នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា',
    publishYear: '២០២៣',
    category: 'textbook',
    gradeLevel: 5,
    totalCopies: 45,
    availableCopies: 42,
    shelfLocation: 'ធ្នើ B2 - សៀវភៅពុម្ពគោល',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80',
    language: 'khmer',
    condition: 'good',
    description: 'សៀវភៅសិក្សាគោលមុខវិជ្ជាភាសាខ្មែរ កម្រិតបឋមសិក្សាថ្នាក់ទី៥',
    addedDate: '2023-11-01',
    academicYear: '២០២៤ - ២០២៥'
  },
  {
    id: 'bk-3',
    code: 'BK-TB-G6-MTH',
    isbn: '978-99950-2-601-1',
    title: 'សៀវភៅពុម្ពគណិតវិទ្យា ថ្នាក់ទី៦',
    author: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publisher: 'នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា',
    publishYear: '២០២៣',
    category: 'textbook',
    gradeLevel: 6,
    totalCopies: 40,
    availableCopies: 38,
    shelfLocation: 'ធ្នើ B2 - សៀវភៅពុម្ពគោល',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&auto=format&fit=crop&q=80',
    language: 'khmer',
    condition: 'good',
    description: 'លំហាត់ និងមេរៀនគណិតវិទ្យាប្រចាំថ្នាក់ទី៦ ត្រៀមប្រឡងបញ្ចប់ភូមិសិក្សា',
    addedDate: '2023-11-01',
    academicYear: '២០២៤ - ២០២៥'
  },
  {
    id: 'bk-4',
    code: 'BK-SCI-002',
    isbn: '978-99950-3-102-8',
    title: 'អាថ៌កំបាំងនៃប្រព័ន្ធព្រះអាទិត្យ និងភពផែនដី',
    author: 'អង្គការបន្ទប់អាន (Room to Read)',
    publisher: 'Room to Read Cambodia',
    publishYear: '២០២១',
    category: 'comic_science',
    gradeLevel: 4,
    totalCopies: 12,
    availableCopies: 10,
    shelfLocation: 'ធ្នើ C1 - វិទ្យាសាស្ត្រកុមារ',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80',
    language: 'khmer',
    condition: 'good',
    description: 'រូបភាពគំនូរជីវចលពណ៌ធម្មជាតិ ពន្យល់ពីគន្លងភព ព្រះចន្ទ និងផ្កាយ',
    addedDate: '2024-01-20',
    academicYear: '២០២៤ - ២០២៥'
  },
  {
    id: 'bk-5',
    code: 'BK-MOR-005',
    isbn: '978-99950-4-005-3',
    title: 'កុមារគំរូ និងការគោរពសីលធម៌ក្នុងសង្គម',
    author: 'លោកគ្រូ អ៊ុំ សារ៉ន',
    publisher: 'គ្រឹះស្ថានបោះពុម្ពផ្កាយព្រឹក',
    publishYear: '២០២០',
    category: 'morality_civics',
    gradeLevel: 2,
    totalCopies: 20,
    availableCopies: 19,
    shelfLocation: 'ធ្នើ D1 - សីលធម៌ និងអប់រំចិត្ត',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
    language: 'khmer',
    condition: 'good',
    description: 'អត្ថបទអប់រំខ្លីៗស្តីពីការដឹងគុណមាតាបិតា គ្រូបង្រៀន និងចាស់ទុំ',
    addedDate: '2024-02-01',
    academicYear: '២០២៤ - ២០២៥'
  },
  {
    id: 'bk-6',
    code: 'BK-ENG-001',
    isbn: '978-01940-1-008-9',
    title: 'My First English Picture Dictionary for Kids',
    author: 'Oxford University Press',
    publisher: 'Oxford Primary',
    publishYear: '២០២១',
    category: 'foreign_language',
    gradeLevel: 3,
    totalCopies: 10,
    availableCopies: 9,
    shelfLocation: 'ធ្នើ E1 - ភាសាបរទេស',
    coverUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=80',
    language: 'bilingual',
    condition: 'good',
    description: 'វចនានុក្រមរូបភាពអង់គ្លេស-ខ្មែរ បង្រៀនពាក្យសាមញ្ញប្រចាំថ្ងៃជាង ៥០០ ពាក្យ',
    addedDate: '2024-02-10',
    academicYear: '២០២៤ - ២០២៥'
  },
  {
    id: 'bk-7',
    code: 'BK-REF-001',
    isbn: '978-99950-0-001-0',
    title: 'វចនានុក្រមខ្មែរ សម្តេចព្រះសង្ឃរាជ ជួន ណាត (ភាគ១ & ភាគ២)',
    author: 'សម្តេចព្រះសង្ឃរាជ ជួន ណាត',
    publisher: 'ពុទ្ធសាសនបណ្ឌិត្យ',
    publishYear: '២០១៨',
    category: 'reference',
    gradeLevel: 0,
    totalCopies: 4,
    availableCopies: 4,
    shelfLocation: 'ធ្នើ R1 - ឯកសារយោង & វចនានុក្រម',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&auto=format&fit=crop&q=80',
    language: 'khmer',
    condition: 'good',
    description: 'ក្បួនវចនានុក្រមភាសាខ្មែរពេញលេញសម្រាប់លោកគ្រូ អ្នកគ្រូ និងសិស្សស្រាវជ្រាវ',
    addedDate: '2023-10-15',
    academicYear: '២០២៤ - ២០២៥'
  }
];

export const initialBookBorrowRecords: BookBorrowRecord[] = [
  {
    id: 'bor-1',
    borrowNumber: 'LN-2024-001',
    bookId: 'bk-1',
    bookTitle: 'ដំណើរផ្សងព្រេងរបស់សូផាត និងកូនឆ្មាវេទមន្ត',
    bookCode: 'BK-ST-001',
    borrowerType: 'student',
    borrowerId: 'stu-1',
    borrowerName: 'សុខ គឹមហួរ',
    borrowerCode: 'STU-2024-001',
    gradeSection: 'ថ្នាក់ទី ៥ ក',
    borrowDate: '2024-03-01',
    dueDate: '2024-03-08',
    status: 'borrowing',
    librarianName: 'អ្នកគ្រូ បណ្ណារក្ស សុខា',
    notes: 'ខ្ចីយកទៅអាននៅផ្ទះរយៈពេល ១ សប្តាហ៍',
    createdAt: '2024-03-01T08:30:00.000Z'
  },
  {
    id: 'bor-2',
    borrowNumber: 'LN-2024-002',
    bookId: 'bk-4',
    bookTitle: 'អាថ៌កំបាំងនៃប្រព័ន្ធព្រះអាទិត្យ និងភពផែនដី',
    bookCode: 'BK-SCI-002',
    borrowerType: 'student',
    borrowerId: 'stu-2',
    borrowerName: 'ចាន់ ពិសិដ្ឋ',
    borrowerCode: 'STU-2024-002',
    gradeSection: 'ថ្នាក់ទី ៤ ក',
    borrowDate: '2024-02-15',
    dueDate: '2024-02-22',
    status: 'overdue',
    librarianName: 'អ្នកគ្រូ បណ្ណារក្ស សុខា',
    notes: 'បានរំលឹកតាមរយៈគ្រូបន្ទុកថ្នាក់',
    createdAt: '2024-02-15T09:15:00.000Z'
  },
  {
    id: 'bor-3',
    borrowNumber: 'LN-2024-003',
    bookId: 'bk-2',
    bookTitle: 'សៀវភៅពុម្ពភាសាខ្មែរ ថ្នាក់ទី៥ (ភាគ១)',
    bookCode: 'BK-TB-G5-KH',
    borrowerType: 'teacher',
    borrowerId: 't-2',
    borrowerName: 'លោក ឈិន សុផល',
    borrowerCode: 'MOEYS-104922',
    gradeSection: 'គ្រូបង្រៀនថ្នាក់ទី៥',
    borrowDate: '2024-02-10',
    dueDate: '2024-02-24',
    returnDate: '2024-02-23',
    status: 'returned',
    conditionOnReturn: 'good',
    librarianName: 'អ្នកគ្រូ បណ្ណារក្ស សុខា',
    notes: 'សងទាន់ពេលវេលា សៀវភៅស្ថិតក្នុងស្ថានភាពល្អ',
    createdAt: '2024-02-10T10:00:00.000Z'
  }
];

export const initialStudentLibraryActivities: StudentLibraryActivity[] = [
  {
    id: 'act-1',
    studentId: 'stu-1',
    studentName: 'សុខ គឹមហួរ',
    studentCode: 'STU-2024-001',
    grade: 5,
    section: 'ក',
    date: new Date().toISOString().split('T')[0],
    timeIn: '09:30',
    timeOut: '10:15',
    activityType: 'reading',
    bookReadTitle: 'ដំណើរផ្សងព្រេងរបស់សូផាត និងកូនឆ្មាវេទមន្ត',
    bookReadCategory: 'storybook',
    pagesRead: 24,
    readingSummary: 'រឿងនេះល្អមើលណាស់ តួអង្គចេះជួយទុក្ខធុរៈគ្នា និងស្រឡាញ់មិត្តភក្តិ។',
    ratingStars: 5,
    verifiedByLibrarian: true,
    academicYear: '២០២៤ - ២០២៥',
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-2',
    studentId: 'stu-3',
    studentName: 'កែវ ធីតា',
    studentCode: 'STU-2024-003',
    grade: 6,
    section: 'ក',
    date: new Date().toISOString().split('T')[0],
    timeIn: '10:00',
    timeOut: '10:45',
    activityType: 'study_group',
    bookReadTitle: 'សៀវភៅពុម្ពគណិតវិទ្យា ថ្នាក់ទី៦',
    bookReadCategory: 'textbook',
    pagesRead: 15,
    readingSummary: 'បានស្រាវជ្រាវរូបមន្តគណនាក្រឡាផ្ទៃរង្វង់ និងធ្វើលំហាត់រួមគ្នាជាមួយមិត្ត។',
    ratingStars: 5,
    verifiedByLibrarian: true,
    academicYear: '២០២៤ - ២០២៥',
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-3',
    studentId: 'stu-2',
    studentName: 'ចាន់ ពិសិដ្ឋ',
    studentCode: 'STU-2024-002',
    grade: 4,
    section: 'ក',
    date: new Date().toISOString().split('T')[0],
    timeIn: '14:00',
    timeOut: '14:30',
    activityType: 'digital_learning',
    bookReadTitle: 'អាថ៌កំបាំងនៃប្រព័ន្ធព្រះអាទិត្យ និងភពផែនដី',
    bookReadCategory: 'comic_science',
    pagesRead: 18,
    readingSummary: 'បានមើលវីដេអូបន្ថែមតាមថេប្លេតបណ្ណាល័យស្តីពីដំណើរគោចរនៃភពផែនដី។',
    ratingStars: 4,
    verifiedByLibrarian: true,
    academicYear: '២០២៤ - ២០២៥',
    createdAt: new Date().toISOString()
  }
];

