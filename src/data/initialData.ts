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
  SchoolGroup
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
  facebookPage: 'https://www.facebook.com/share/1EZeRXioNB/'
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

export const initialLibraryBooks: any[] = [];

export const initialReadingLogs: any[] = [];

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
