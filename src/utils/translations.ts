export type AppLanguage = 'km' | 'en';

export interface TranslationDictionary {
  [key: string]: {
    km: string;
    en: string;
  };
}

export const translations: TranslationDictionary = {
  // App General
  appName: {
    km: 'ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សារដ្ឋ',
    en: 'State Primary School Management System'
  },
  moeysTitle: {
    km: 'ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)',
    en: 'Ministry of Education, Youth and Sport (MoEYS)'
  },
  academicYear: {
    km: 'ឆ្នាំសិក្សា',
    en: 'Academic Year'
  },
  schoolCode: {
    km: 'កូដសាលា',
    en: 'School Code'
  },
  directorName: {
    km: 'នាយកសាលា',
    en: 'School Director'
  },
  
  // Navigation Tabs
  dashboard: { km: 'ផ្ទាំងគ្រប់គ្រងទូទៅ', en: 'Dashboard' },
  dashboardSub: { km: 'ទិន្នន័យស្ថិតិ និងសមិទ្ធផលសាលារៀន', en: 'School statistics and overview' },
  homeroom_dashboard: { km: 'ផ្ទាំងការងារគ្រូបន្ទុកថ្នាក់', en: 'Homeroom Teacher Hub' },
  homeroom_dashboardSub: { km: 'ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀន វត្តមាន ពិន្ទុ កិច្ចតែងការ និងប្រជុំមាតាបិតា', en: 'Unified homeroom class, attendance, grades, lesson plans & parent meetings' },
  students: { km: 'គ្រប់គ្រងសិស្សានុសិស្ស', en: 'Student Management' },
  studentsSub: { km: 'បញ្ជីឈ្មោះ ប្រវត្តិរូប និងសុខភាពសិស្ស', en: 'Student records and health data' },
  transfers: { km: 'ការផ្ទេរសិស្សចេញ/ចូល', en: 'Student Transfers' },
  transfersSub: { km: 'លិខិតផ្ទេរសិស្សចេញ-ចូលតាមស្តង់ដារ MoEYS', en: 'Official MoEYS transfer letters' },
  household_census: { km: 'ជំរឿនផែនទីខ្នងផ្ទះ', en: 'Household Census & Map' },
  household_censusSub: { km: 'ផែនទី GPS ភូមិសាស្ត្រ និងទិន្នន័យគ្រួសារតាមខ្នងផ្ទះ', en: 'Catchment GIS mapping and family census' },
  library: { km: 'បណ្ណាល័យ & សៀវភៅ', en: 'Library & Reading' },
  librarySub: { km: 'គ្រប់គ្រងសៀវភៅសិក្សា និងការខ្ចី-សង', en: 'Textbooks, book loans & reading logs' },
  teachers: { km: 'គ្រូបង្រៀន & បុគ្គលិក', en: 'Teachers & Staff' },
  teachersSub: { km: 'ទិន្នន័យមន្ត្រីរាជការ និងកាលវិភាគបង្រៀន', en: 'Civil service records and teaching timetable' },
  classrooms: { km: 'បន្ទប់ & ថ្នាក់រៀន', en: 'Classrooms' },
  classroomsSub: { km: 'បញ្ជីថ្នាក់រៀន និងគ្រូបន្ទុកថ្នាក់', en: 'Classes and homeroom teachers' },
  scores: { km: 'ស្រង់ពិន្ទុ & ចំណាត់ថ្នាក់', en: 'Scores & Rankings' },
  scoresSub: { km: 'ពិន្ទុប្រចាំខែ និងឆមាសតាមស្តង់ដារ MoEYS', en: 'Monthly & semester exams' },
  attendance_health: { km: 'វត្តមាន & សុខភាព (BMI)', en: 'Attendance & Health' },
  attendance_healthSub: { km: 'ស្រង់វត្តមានប្រចាំថ្ងៃ និងតាមដានអាហារូបត្ថម្ភ', en: 'Daily attendance and BMI nutrition' },
  calendar: { km: 'ប្រតិទិនសិក្សា & ការប្រឡង', en: 'Academic Calendar' },
  calendarSub: { km: 'កាលវិភាគប្រឡង ថ្ងៃឈប់សម្រាក និង Google Sync', en: 'Exams, holidays and Google Sync' },
  finance: { km: 'ថវិកា & ហិរញ្ញវត្ថុ', en: 'Budget & Finance' },
  financeSub: { km: 'ចំណូល-ចំណាយ PB, SIG និងសហគមន៍', en: 'PB, SIG and Community budget' },
  reports_qr: { km: 'របាយការណ៍ & QR កាត', en: 'Reports & QR Cards' },
  reports_qrSub: { km: 'របាយការណ៍រដ្ឋបាល និងបោះពុម្ពប័ណ្ណសម្គាល់ខ្លួន', en: 'Administrative reports and ID cards' },
  accounts: { km: 'គ្រប់គ្រងគណនី & RBAC', en: 'Accounts & RBAC' },
  accountsSub: { km: 'បង្កើតគណនីតាមឋានានុក្រម និងសុវត្ថិភាពប្រព័ន្ធ', en: 'Role-based access & profile approvals' },
  student_portal: { km: 'គណនីសិស្សានុសិស្ស', en: 'Student Portal' },
  student_portalSub: { km: 'ព្រឹត្តិបត្រពិន្ទុផ្ទាល់ខ្លួន វត្តមាន និងប័ណ្ណសិស្ស QR', en: 'Personal score report and QR student ID' },
  workspace: { km: 'Google Workspace Hub', en: 'Google Workspace Hub' },
  workspaceSub: { km: 'នាំចេញ Google Sheets & ផ្ទុកឯកសារ Google Drive', en: 'Google Sheets and Drive backup' },
  settings: { km: 'ការកំណត់ព័ត៌មានសាលា', en: 'School Settings' },
  settingsSub: { km: 'កែប្រែព័ត៌មានរដ្ឋបាល និងទីតាំងសាលារៀន', en: 'School profile and administrative settings' },

  // RBAC Roles
  director: { km: 'នាយកសាលារៀន', en: 'School Director' },
  secretary: { km: 'លេខាធិការ', en: 'Secretary' },
  librarian: { km: 'បណ្ណារក្ស', en: 'Librarian' },
  teacher: { km: 'គ្រូបង្រៀន', en: 'Teacher' },
  student: { km: 'សិស្សានុសិស្ស', en: 'Student' },

  // Scoring Modes & Grading Scale
  scoringMode: { km: 'របៀបបញ្ចូលពិន្ទុ', en: 'Scoring Mode' },
  scoringModeByStudent: { km: 'តាមសិស្សម្នាក់ៗ (គ្រប់មុខវិជ្ជា)', en: 'By Student (All Subjects)' },
  scoringModeBySubject: { km: 'តាមមុខវិជ្ជានីមួយៗ (សិស្សទាំងអស់)', en: 'By Subject (All Students)' },
  gradingScale: { km: 'ប្រព័ន្ធកំណត់និទ្ទេស', en: 'Grading Scale' },
  khmerGradingScale: { km: 'និទ្ទេសភាសាខ្មែរ (ល្អណាស់, ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ)', en: 'Khmer Terms (Very Good, Good, Fairly Good, Average, Weak)' },
  letterGradingScale: { km: 'និទ្ទេសអក្សរអង់គ្លេស (A, B, C, D, E, F)', en: 'Letter Grades (A, B, C, D, E, F)' },
  
  // Grade Terminology
  gradeA: { km: 'ល្អណាស់', en: 'Very Good (A)' },
  gradeB: { km: 'ល្អ', en: 'Good (B)' },
  gradeC: { km: 'ល្អបង្គួរ', en: 'Fairly Good (C)' },
  gradeD: { km: 'មធ្យម', en: 'Average (D)' },
  gradeE: { km: 'ខ្សោយ', en: 'Weak (E/F)' },

  // Common UI Actions
  search: { km: 'ស្វែងរក...', en: 'Search...' },
  filter: { km: 'ច្រោះទិន្នន័យ', en: 'Filter' },
  save: { km: 'រក្សាទុក', en: 'Save' },
  cancel: { km: 'បោះបង់', en: 'Cancel' },
  edit: { km: 'កែប្រែ', en: 'Edit' },
  delete: { km: 'លុប', en: 'Delete' },
  add: { km: 'បន្ថែមថ្មី', en: 'Add New' },
  print: { km: 'បោះពុម្ព', en: 'Print' },
  exportExcel: { km: 'នាំចេញ Excel / Sheet', en: 'Export Sheet' },
  exportHtml: { km: 'ទាញយក Single-File HTML', en: 'Download Standalone HTML' },
  darkMode: { km: 'រចនាប័ទ្មងងឹត (Night Mode)', en: 'Night Mode' },
  lightMode: { km: 'រចនាប័ទ្មភ្លឺ (Light Mode)', en: 'Light Mode' },
  language: { km: 'ភាសា', en: 'Language' },
  khmer: { km: 'ភាសាខ្មែរ', en: 'Khmer' },
  english: { km: 'English', en: 'English' },
  status: { km: 'ស្ថានភាព', en: 'Status' },
  active: { km: 'សកម្ម', en: 'Active' },
  locked: { km: 'ចាក់សោ', en: 'Locked' },
  unlocked: { km: 'ដោះសោ', en: 'Unlocked' },
  approved: { km: 'បានអនុម័ត', en: 'Approved' },
  pending: { km: 'រង់ចាំអនុម័ត', en: 'Pending' },
  rejected: { km: 'បដិសេធ', en: 'Rejected' },
  released: { km: 'បានផ្សព្វផ្សាយ', en: 'Released' },
  unreleased: { km: 'មិនទាន់ផ្សាយ', en: 'Unreleased' },
  impersonate: { km: 'ចូលប្រើផ្ទាល់ (Master Access)', en: 'Impersonate / Log in as' },
  logout: { km: 'ចាកចេញ', en: 'Log Out' },
  gradeLabel: { km: 'ថ្នាក់ទី', en: 'Grade' },
  sectionLabel: { km: 'បន្ទប់', en: 'Section' },
  genderMale: { km: 'ប្រុស', en: 'Male' },
  genderFemale: { km: 'ស្រី', en: 'Female' },
  totalStudents: { km: 'សិស្សសរុប', en: 'Total Students' },
  femaleCount: { km: 'ស្រី', en: 'Female' },
  averageScore: { km: 'មធ្យមភាគ', en: 'Average Score' },
  totalScore: { km: 'ពិន្ទុសរុប', en: 'Total Score' },
  rank: { km: 'ចំណាត់ថ្នាក់', en: 'Rank' },
  honorRoll: { km: 'តារាងកិត្តិយស', en: 'Honor Roll' },
  passed: { km: 'ជាប់', en: 'Passed' },
  failed: { km: 'ធ្លាក់', en: 'Failed' },
  phone: { km: 'ទូរស័ព្ទ', en: 'Phone' },
  email: { km: 'អ៊ីមែល', en: 'Email' },
  address: { km: 'អាសយដ្ឋាន', en: 'Address' },
  date: { km: 'កាលបរិច្ឆេទ', en: 'Date' },
  month: { km: 'ខែ', en: 'Month' },
  all: { km: 'ទាំងអស់', en: 'All' },
  actions: { km: 'សកម្មភាព', en: 'Actions' },
  close: { km: 'បិទ', en: 'Close' },
  details: { km: 'ព័ត៌មានលម្អិត', en: 'Details' },
  syncSuccess: { km: 'សមកាលកម្មជោគជ័យ!', en: 'Sync Successful!' }
};

export const getTranslation = (key: string, lang: AppLanguage = 'km'): string => {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key;
};
