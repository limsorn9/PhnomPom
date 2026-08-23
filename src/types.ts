export type Gender = 'M' | 'F';
export type LivingCondition = 'ទូទៅ' | 'ក្រ១' | 'ក្រ២' | string;
export type AcademicHistoryStatus = 'ឡើងថ្នាក់' | 'ត្រួតថ្នាក់' | 'ចូលរៀនឡើងវិញ' | 'ផ្ទេរចូល' | string;
export type OrphanStatus = 'មិនកំព្រា' | 'កំព្រាឪពុក' | 'កំព្រាម្តាយ' | 'កំព្រាទាំងពីរ' | string;

export interface HealthRecord {
  heightCm: number;
  weightKg: number;
  bmi: number;
  nutritionStatus: 'normal' | 'underweight' | 'overweight' | 'wasted';
  vaccinated: boolean;
  bloodType: string;
  notes?: string;
  lastCheckedDate: string;
}

export interface AttendanceSummary {
  present: number;
  absentWithPermission: number;
  absentWithoutPermission: number;
  totalDays: number;
}

export interface Student {
  id: string;
  code: string; // អត្តលេខសិស្ស e.g., "STU-2024-001"
  nameKhmer: string; // គោត្តនាម-នាម
  lastNameKhmer?: string; // គោត្តនាម
  firstNameKhmer?: string; // នាម
  nameLatin: string; // គោត្តនាមឡាតាំង-នាមឡាតាំង
  lastNameLatin?: string; // គោត្តនាមឡាតាំង
  firstNameLatin?: string; // នាមឡាតាំង
  gender: Gender; // ភេទ
  dob: string; // ថ្ងៃខែឆ្នាំកំណើត (YYYY-MM-DD)
  age?: number; // អាយុ
  pob: string; // ទីកន្លែងកំណើតរួម
  pobVillage?: string; // ភូមិកំណើត
  pobCommune?: string; // ឃុំកំណើត
  pobDistrict?: string; // ស្រុកកំណើត
  pobProvince?: string; // ខេត្តកំណើត
  grade: number; // 1 to 6 (ថ្នាក់ទី)
  section: string; // 'ក' | 'ខ' | 'គ' (បន្ទប់)
  
  // Family Details (ព័ត៌មានគ្រួសារ)
  fatherLastName?: string; // គោត្តនាមឪពុក
  fatherFirstName?: string; // នាមឪពុក
  fatherName?: string; // ឈ្មោះឪពុកពេញ
  fatherOccupation?: string; // មុខរបរឪពុក
  motherLastName?: string; // គោត្តនាមម្តាយ
  motherFirstName?: string; // នាមម្តាយ
  motherName?: string; // ឈ្មោះម្តាយពេញ
  motherOccupation?: string; // មុខរបរម្តាយ
  guardianLastName?: string; // គោត្តនាមអាណាព្យាបាល
  guardianFirstName?: string; // នាមអាណាព្យាបាល
  guardianName: string; // គោត្តនាមអាណាព្យាបាល-នាមអាណាព្យាបាល
  guardianRelationship: string; // ទំនាក់ទំនង (ឪពុក ម្តាយ ជីដូន ជីតា អាណាព្យាបាល)
  guardianPhone: string; // លេខទូរស័ព្ទអាណាព្យាបាល
  guardianOccupation: string; // មុខរបរអាណាព្យាបាល
  
  // Current Address & Status (អាសយដ្ឋានបច្ចុប្បន្ន និងស្ថានភាព)
  address: string; // អាសយដ្ឋានបច្ចុប្បន្នរួម
  currentHouseNumber?: string; // ផ្ទះលេខ
  currentStreetNumber?: string; // ផ្លូវលេខ
  currentVillage?: string; // ភូមិបច្ចុប្បន្ន
  currentCommune?: string; // ឃុំបច្ចុប្បន្ន
  currentDistrict?: string; // ស្រុកបច្ចុប្បន្ន
  currentProvince?: string; // ខេត្តបច្ចុប្បន្ន
  academicHistory?: string; // ប្រវត្តិសិក្សា (ឡើងថ្នាក់, ត្រួតថ្នាក់, ចូលរៀនឡើងវិញ...)
  livingCondition?: string; // ជីវភាព (ក្រ១ / ក្រ២ / សមរម្យ / ទូទៅ)
  idPoorCardNumber?: string; // លេខប័ណ្ណក្រីក្រ
  isOrphan?: string; // កំព្រា (គ្មាន / កំព្រាឪពុក / កំព្រាម្តាយ / កំព្រាទាំងពីរ)
  orphanStatus?: string; // ស្ថានភាពកំព្រា
  isDisability?: boolean | string; // ពិការ
  disability?: string; // ពិការភាពលម្អិត
  disabilityDetail?: string; // ព័ត៌មានលម្អិតពិការភាព
  hasScholarship?: boolean | string; // អាហារូបករណ៍
  scholarship?: string; // អាហារូបករណ៍
  scholarshipDetail?: string;
  isEthnicMinority?: boolean | string; // ជនជាតិដើមភាគតិច
  ethnicMinority?: string; // ជនជាតិ
  ethnicGroup?: string;
  specialCharacteristics?: string; // លក្ខណៈពិសេស / ទេពកោសល្យ
  phone?: string; // លេខទូរស័ព្ទផ្ទាល់
  previousSchool?: string; // មកពីសាលា
  academicYear?: string; // ឆ្នាំសិក្សា
  admissionDate: string; // ថ្ងៃចូលរៀន
  status: 'active' | 'transferred' | 'dropped' | 'graduated'; // ស្ថានភាពសិស្ស
  remarks?: string; // ផ្សេងៗ
  fatherAlive?: boolean; // ឪពុកនៅរស់
  motherAlive?: boolean; // ម្តាយនៅរស់
  avatarUrl?: string; // រូបថតសិស្ស
  health: HealthRecord;
  attendance: AttendanceSummary;
}

export interface DutyScheduleItem {
  day: 'ចន្ទ' | 'អង្គារ' | 'ពុធ' | 'ព្រហស្បតិ៍' | 'សុក្រ' | 'សៅរ៍';
  subject: string;
  timeSlot: string;
  gradeClass: string;
}

export interface Teacher {
  id: string;
  staffCode: string; // អត្តលេខមន្ត្រីរាជការ
  nameKhmer: string; // គោត្តនាម និងនាម
  lastNameKhmer?: string; // គោត្តនាម
  firstNameKhmer?: string; // នាម
  nameLatin: string; // គោត្តនាមឡាតាំង និងនាមឡាតាំង
  gender: Gender; // ភេទ
  dob: string; // ថ្ងៃខែឆ្នាំកំណើត
  nationality?: string; // សញ្ជាតិ (ខ្មែរ)
  ethnicity?: string; // ជនជាតិ (ខ្មែរ / ផ្សេងៗ)
  disabilityStatus?: string; // ពិការភាព
  
  // Addresses & Contacts (ទីលំនៅ និងទំនាក់ទំនង)
  phone: string; // លេខទូរស័ព្ទ
  email: string; // អ៊ីម៉ែល
  nationalId?: string; // លេខអត្តសញ្ញាណប័ណ្ណ
  telegramPhone?: string; // លេខតេលេក្រាម
  pob?: string; // ទីកន្លែងកំណើត
  pobVillage?: string; // ភូមិកំណើត
  pobCommune?: string; // ឃុំកំណើត
  pobDistrict?: string; // ស្រុកកំណើត
  pobProvince?: string; // ខេត្តកំណើត
  currentAddress?: string; // អាសយដ្ឋានបច្ចុប្បន្ន
  currentHouseNumber?: string; // ផ្ទះលេខ
  currentStreetNumber?: string; // ផ្លូវលេខ
  currentVillage?: string; // ភូមិបច្ចុប្បន្ន
  currentCommune?: string; // ឃុំបច្ចុប្បន្ន
  currentDistrict?: string; // ស្រុកបច្ចុប្បន្ន
  currentProvince?: string; // ខេត្តបច្ចុប្បន្ន
  distanceToSchoolKm?: number; // ចម្ងាយទៅសាលា (គ.ម)
  
  // National ID Card (អត្តសញ្ញាណប័ណ្ណ)
  nationalIdNumber?: string; // លេខអត្តសញ្ញាណប័ណ្ណ
  nationalIdIssueDate?: string; // ថ្ងៃចេញ
  nationalIdExpiryDate?: string; // ថ្ងៃអស់សុពលភាព
  nationalIdPhotoUrl?: string; // រូបថតអត្តសញ្ញាណប័ណ្ណ
  
  // Professional Details (ព័ត៌មានវិជ្ជាជីវៈ និងក្របខ័ណ្ឌ)
  role: string; // តួនាទី (នាយក, នាយករង, គ្រូបន្ទុកថ្នាក់, គ្រូឯកទេស, បណ្ណារក្ស, លេខាធិការ)
  responsibilities?: string; // ភារកិច្ច
  startDate: string; // ថ្ងៃខែចូលបម្រើការងារ
  civilServiceEntryDate?: string; // ថ្ងៃតាំងស៊ប់ក្នុងក្របខណ្ឌ
  yearsOfService: number; // ចំនួនឆ្នាំបម្រើការងារ
  framework?: string; // ក្របខណ្ឌ
  civilServiceFramework?: string; // ក្របខ័ណ្ឌ (ឧ. ក្របខ័ណ្ឌគ្រូបឋម, ក្របខ័ណ្ឌមន្ត្រីរដ្ឋបាល)
  frameworkLevel?: string; // កម្រិតក្របខ័ណ្ឌ (ឧ. ក.១.១, ក.២, ខ.១)
  qualification: string; // សញ្ញាបត្រគ្រូ / គរុកោសល្យ
  specialization?: string; // ឯកទេស
  teachingSubject?: string; // មុខវិជ្ជាបង្រៀន
  appointmentLetterRef?: string; // លិខិតតែងតាំង / ប្រកាសលេខ
  salaryIndex?: string; // កាំប្រាក់
  specializedDegreeLevel?: string; // កម្រិតសញ្ញាបត្រឯកទេស
  schoolPostingDate?: string; // ថ្ងៃខែឆ្នាំទទួលគ្រឹះស្ថានសិក្សា
  pedagogicalTrainingCourse?: string; // វគ្គបណ្តុះបណ្តាលគរុកោសល្យ
  trainingCohort?: string; // វគ្គសិក្សា
  certificateDate?: string; // ថ្ងៃខែទទួលបាន
  schoolCode?: string; // លេខកូដសាលា
  assignedGrade?: number; // ថ្នាក់បង្រៀន
  assignedSection?: string; // បន្ទប់
  teachingShift?: string; // វេនបង្រៀន (ព្រឹក / រសៀល / ពេញមួយថ្ងៃ)
  totalClassesTaught?: number; // ថ្នាក់សរុប
  totalStudentsFemaleTaught?: number; // ស្រី (ស្ថិតិសិស្សស្រីបង្រៀន)
  
  // Banking, Health & Family (ធនាគារ សុខភាព និងគ្រួសារ)
  nssfNumber?: string; // បណ្ណ ស.ប.ស.ក (NSSF)
  bankAccountNumber?: string; // គណនីបៀវត្ស
  bankName?: string; // ឈ្មោះធនាគារ (កាណាឌីយ៉ា / អេស៊ីលីដា / វីង)
  parentsInfo?: string; // ឈ្មោះ និងមុខរបរឪពុកម្តាយ
  status: 'active' | 'on_leave' | 'transferred'; // ស្ថានភាពបច្ចុប្បន្ន
  vaccinated?: boolean; // បានចាក់វ៉ាក់សាំង
  vaccineName?: string; // ឈ្មោះវ៉ាក់សាំង
  lastVaccinatedDate?: string; // ថ្ងៃខែចាក់លើកចុងក្រោយ
  maritalStatus?: string; // ស្ថានភាពគ្រួសារ (នៅលីវ / រៀបការ / មេម៉ាយ / ពោះម៉ាយ)
  spouseName?: string; // ឈ្មោះប្តី/ប្រពន្ធ
  spouseOccupation?: string; // មុខរបរប្តី/ប្រពន្ធ
  spousePhone?: string; // លេខទូរស័ព្ទប្តី/ប្រពន្ធ
  spousePob?: string; // ទីកន្លែងកំណើតប្តី/ប្រពន្ធ
  spouseAddress?: string; // អាសយដ្ឋានបច្ចុប្បន្នប្តី/ប្រពន្ធ
  childrenCount?: number; // ចំនួនកូនក្នុងបន្ទុក
  child1Name?: string; // ឈ្មោះកូនទី១
  child2Name?: string; // ឈ្មោះកូនទី២
  child3Name?: string; // ឈ្មោះកូនទី៣
  documentsNote?: string; // ឯកសារ និងប្រភេទបណ្ណផ្សេងៗ
  avatarUrl?: string; // រូបថត
  schedule: DutyScheduleItem[];
}

export type TransferType = 'out' | 'in'; // ផ្ទេរចេញ | ផ្ទេរចូល
export type TransferStatus = 'approved' | 'pending' | 'completed' | 'rejected';

export interface ExamSubject {
  id: string;
  code: string;
  nameKhmer: string;
  nameLatin?: string;
  category: 'khmer' | 'math' | 'science_social' | 'arts_pe' | 'skills_language';
  maxScore: number;
  weight: number;
  isDefault?: boolean;
}

export interface ProfileEditRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  targetType: 'teacher' | 'student' | 'user';
  targetId: string;
  requestedFields: Record<string, any>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  oneTimeToken?: string;
  isUsed?: boolean;
}

export interface StudentTransferRecord {
  id: string;
  transferType: TransferType; // 'out' (លិខិតផ្ទេរសិស្សចេញ) | 'in' (បន្ថែមសិស្សចូល)
  letterNumber: string; // លេខលិខិតផ្ទេរ e.g. "លខ.០៤២/២០២៤"
  transferDate: string; // ថ្ងៃខែឆ្នាំផ្ទេរ
  studentId?: string;
  studentCode: string;
  studentNameKhmer: string;
  studentNameLatin: string;
  gender: Gender;
  dob: string;
  grade: number;
  section: string;
  academicYear: string;
  
  // School details
  fromSchool: string; // ផ្ទេរមកពីសាលា / សាលាដើម
  fromSchoolCode?: string;
  toSchool: string; // ផ្ទេរទៅកាន់សាលា
  toSchoolCode?: string;
  toDistrictProvince?: string; // ស្រុក/ខេត្ត គោលដៅ
  
  // Reason & Family
  reason: string; // មូលហេតុផ្ទេរ
  guardianName: string;
  guardianPhone: string;
  
  // Official approvals
  principalApprovalName: string; // នាយកសាលាអនុម័ត
  officerName: string; // មន្ត្រីរៀបចំ/លេខាធិការ
  status: TransferStatus;
  notes?: string;
}

export interface Classroom {
  id: string;
  grade: number;
  section: string;
  roomNumber: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  academicYear: string;
  capacity: number;
}

export interface MonthlySubjectScores {
  // Khmer language competencies
  listening?: number; // សមត្ថភាពស្តាប់
  writing?: number; // សមត្ថភាពសរសេរ
  reading?: number; // សមត្ថភាពអាន
  speaking?: number; // សមត្ថភាពនិយាយ
  khmerReading?: number; // អំណាន (Legacy compatibility)
  khmerWriting?: number; // សំណេរ (Legacy compatibility)

  // Mathematics competencies
  numbers?: number; // ចំនួន
  measurement?: number; // រង្វាស់រង្វាល់
  geometry?: number; // ធរណីមាត្រ
  algebra?: number; // ពីជគណិត
  statistics?: number; // ស្ថិតិ
  mathematics?: number; // គណិតវិទ្យា (Legacy compatibility)

  // Sciences, Social & Morals
  science?: number; // វិទ្យាសាស្ត្រ
  socialStudies?: number; // សិក្សាសង្គម
  moralCivics?: number; // សីលធម៌-ពលរដ្ឋវិជ្ជា
  scienceSocial?: number; // វិទ្យាសាស្ត្រ និងសិក្សាសង្គម (Legacy)

  // Arts, PE & Life Skills
  homeEconomicsArts?: number; // គេហកិច្ច-អប់រំសិល្បៈ
  physicalHealth?: number; // អប់រំកាយ-កីឡាសុខភាព-អនាម័យ
  lifeSkills?: number; // អប់រំបំណិនជីវិត
  foreignLanguage?: number; // ភាសាបរទេស
  artsPhysical?: number; // សិល្បៈ និងកាយវិការ (Legacy)

  // Dynamic custom subjects
  [key: string]: number | undefined;
}

export interface StudentScoreRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  gender: Gender;
  grade: number;
  section: string;
  monthOrSemester: string; // 'តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី១', 'ឆមាសទី២'
  academicYear: string;
  scores: MonthlySubjectScores;
  totalScore: number;
  averageScore: number;
  rank: number;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  resultStatus: 'ជាប់' | 'ធ្លាក់';
  remarks?: string;
}

export interface DailyAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  grade: number;
  section: string;
  studentId: string;
  studentNameKhmer: string;
  status: 'present' | 'permission' | 'absent';
  session: 'morning' | 'afternoon';
  notes?: string;
}

export type HealthScreeningStatus = 'normal' | 'monitor' | 'warning' | 'isolate';

export interface DailyHealthCheckRecord {
  id: string;
  date: string; // YYYY-MM-DD
  grade: number;
  section: string;
  studentId: string;
  studentNameKhmer: string;
  temperature: number; // e.g. 36.5
  status: HealthScreeningStatus; // 'normal' (🟢), 'monitor' (🟡), 'warning' (🟠), 'isolate' (🔴)
  symptoms: string[]; // ['ក្តៅខ្លួន', 'ក្អក', 'ហៀរសំបោរ', 'ឈឺក្បាល', 'ឈឺពោះ', 'ភ្នែកក្រហម']
  session: 'morning' | 'afternoon';
  checkedAt?: string;
  notes?: string;
}

export interface StudentRiskAlert {
  studentId: string;
  hasConsecutiveAbsenceAlert: boolean;
  consecutiveAbsenceCount: number;
  consecutiveAbsenceDates: string[];
  hasScoreDropAlert: boolean;
  scoreDropAmount: number; // e.g. 1.25 points
  previousPeriodScore: {
    period: string;
    average: number;
  } | null;
  latestPeriodScore: {
    period: string;
    average: number;
  } | null;
  alertSummary: string;
}

export type BudgetSource = 
  | 'ថវិការដ្ឋ (PB)'
  | 'សហគមន៍/សមាគមមាតាបិតា'
  | 'ដៃគូអភិវឌ្ឍន៍/NGO'
  | 'មូលនិធិកែលម្អសាលា (SIG)'
  | 'ចំណូលផ្សេងៗ';

export interface BudgetTransaction {
  id: string;
  title: string;
  type: 'income' | 'expense';
  source: BudgetSource;
  category: string; // e.g., 'សម្ភារៈឧបទេស', 'ជួសជុលអគារ', 'អនាម័យនិងទឹកស្អាត', 'បណ្ណាល័យ', 'កីឡា'
  amountRiel: number;
  amountUsd: number;
  date: string;
  referenceCode: string;
  recordedBy: string;
  description?: string;
  status: 'approved' | 'pending';
}

export type GradingScaleType = 'khmer_term' | 'letter';

export interface SchoolProfile {
  nameKhmer: string;
  nameLatin: string;
  schoolCode: string;
  province: string;
  district: string;
  commune: string;
  village: string;
  principalName: string;
  principalPhone: string;
  deputyPrincipalName: string;
  academicYear: string;
  establishedYear: string;
  cluster: string;
  email: string;
  logoUrl?: string;
  mapUrl?: string;
  facebookPage?: string;
  gradingScaleType?: GradingScaleType; // 'khmer_term' (ល្អណាស់, ល្អ, ល្អបង្គួរ...) vs 'letter' (A, B, C...)
  sessionRememberDays?: string; // '1_day' | '7_days' | '14_days' | '30_days' | '90_days' | 'forever' | 'session_only'
  lastDatabaseBackup?: string; // ISO Timestamp of last manual database snapshot
}

export type CalendarEventType = 'exam' | 'holiday' | 'vacation' | 'meeting' | 'ceremony' | 'academic';

export interface AcademicCalendarEvent {
  id: string;
  titleKhmer: string;
  titleLatin?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: CalendarEventType;
  description?: string;
  targetGrades?: string; // e.g. "ថ្នាក់ទី១ ដល់ ទី៦", "ថ្នាក់ទី៦", "លោកគ្រូ-អ្នកគ្រូ"
  isOfficialHoliday?: boolean;
  location?: string;
  googleCalendarEventId?: string;
  isSyncedToGoogle?: boolean;
}

export type UserRole = 
  | 'director'    // នាយកសាលារៀន
  | 'secretary'   // លេខាធិការ
  | 'librarian'   // បណ្ណារក្ស
  | 'teacher'     // គ្រូបង្រៀន / គ្រូបន្ទុកថ្នាក់
  | 'student';    // សិស្ស

export interface UserSessionInfo {
  id: string;
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress?: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface SecurityLoginLog {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  status: 'success' | 'failed';
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  method?: 'password' | 'google' | 'mfa_totp' | 'mfa_sms';
}

export interface UserMfaConfig {
  enabled: boolean;
  type: 'sms' | 'totp' | 'email';
  phoneNumber?: string;
  backupCodesCount?: number;
  enrolledAt?: string;
  lastVerifiedAt?: string;
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  password?: string;
  nameKhmer: string;
  nameLatin?: string;
  role: UserRole;
  phone?: string;
  staffCode?: string; // For teachers/staff
  studentId?: string; // For students
  studentCode?: string; // For students STU-2024-xxx
  assignedGrade?: number;
  assignedSection?: string;
  avatarUrl?: string;
  createdBy?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  passwordUpdatedAt?: string; // ISO Date of last password update
  forcePasswordChange?: boolean; // When true, forces mandatory password change on login/session
  mfaConfig?: UserMfaConfig;
  activeSessions?: UserSessionInfo[];
  securityLogs?: SecurityLoginLog[];
}

export interface SecurityPolicySettings {
  sessionTimeoutEnabled: boolean;
  sessionTimeoutMinutes: number; // e.g. 15, 30, 60, 120, 240
  enforcePasswordRotation: boolean;
  passwordRotationDays: number; // e.g. 90 days
  enforceStrongPassword: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'password_reset' | 'info' | 'alert' | 'system';
  targetRole?: UserRole | 'all';
  targetUserId?: string;
  targetTeacherGrade?: number;
  targetTeacherSection?: string;
  read: boolean;
  meta?: {
    studentId?: string;
    studentName?: string;
    actionTime?: string;
  };
}

export type ActiveTab = 
  | 'dashboard'
  | 'homeroom_dashboard'
  | 'ai_teacher'
  | 'activity_logs'
  | 'school_admin'
  | 'school_management'
  | 'official_documents'
  | 'students'
  | 'transfers'
  | 'household_census'
  | 'teachers'
  | 'classrooms'
  | 'scores'
  | 'attendance_health'
  | 'library'
  | 'calendar'
  | 'finance'
  | 'reports_qr'
  | 'accounts'
  | 'student_portal'
  | 'workspace'
  | 'settings';

export interface LessonPlan {
  id: string;
  grade: number;
  section: string;
  academicYear: string;
  subject: string;
  lessonNumber: number | string;
  lessonTitle: string;
  teachingDate: string;
  durationMinutes: number;
  objectives: {
    knowledge: string;
    skills: string;
    attitude: string;
  };
  teachingAids: string;
  steps: {
    step1ClassManagement: string; // ជំហានទី១: រដ្ឋបាលថ្នាក់ (វត្តមាន អនាម័យ វិន័យ)
    step2ReviewOldLesson: string; // ជំហានទី២: រំលឹកមេរៀនចាស់ / ត្រួតពិនិត្យកិច្ចការផ្ទះ
    step3NewLesson: string; // ជំហានទី៣: មេរៀនថ្មី (ខ្លឹមសារ បង្ហាញ ពិភាក្សាក្រុម)
    step4Consolidation: string; // ជំហានទី៤: ពង្រឹងពុទ្ធិ / សួរសំណួរវាយតម្លៃ
    step5HomeworkAndAdvice: string; // ជំហានទី៥: បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ
  };
  teacherReflection?: string; // ការឆ្លុះបញ្ចាំងពីការបង្រៀន
  status: 'draft' | 'completed' | 'approved';
  approvedBy?: string;
  createdAt: string;
}

export interface ParentRepresentative {
  role: 'president' | 'vice_president' | 'treasurer' | 'member';
  roleTitleKhmer: string;
  name: string;
  phone: string;
  occupation?: string;
  studentName: string;
  studentId?: string;
}

export interface ParentMeeting {
  id: string;
  grade: number;
  section: string;
  academicYear: string;
  meetingTitle: string; // e.g., "កិច្ចប្រជុំមាតាបិតាដើមឆ្នាំសិក្សា ២០២៤-២០២៥"
  meetingType: 'beginning_year' | 'mid_year' | 'end_year' | 'emergency' | 'monthly';
  meetingDate: string;
  meetingTime: string;
  location: string;
  agenda: string[];
  objectives: string;
  totalParentsInvited: number;
  totalParentsAttended: number;
  minutes: string; // កំណត់ហេតុ
  resolutions: string[]; // សេចក្តីសម្រេច / កិច្ចព្រមព្រៀង
  parentRepresentatives?: ParentRepresentative[];
  status: 'upcoming' | 'completed' | 'draft';
  createdAt: string;
}

export type ParentRequestType =
  | 'leave_request'        // សំណើសុំច្បាប់ឈប់សម្រាក
  | 'consultation'         // សំណើសុំជួបពិគ្រោះផ្ទាល់
  | 'academic_support'     // សំណើសុំជំនួយបំប៉នការសិក្សា
  | 'profile_update'       // សំណើកែសម្រួលព័ត៌មានទំនាក់ទំនង
  | 'health_alert'         // ដំណឹងបញ្ហាសុខភាព/អាឡែកហ្ស៊ី
  | 'general_inquiry';     // សំណួរ និងមតិយោបល់ទូទៅ

export type ParentRequestUrgency = 'normal' | 'urgent' | 'immediate';

export interface ParentRequest {
  id: string;
  studentId: string;
  studentName: string;
  grade: number;
  section: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: string; // ឪពុក, ម្តាយ, អាណាព្យាបាល
  requestType: ParentRequestType;
  title: string;
  details: string;
  urgency: ParentRequestUrgency;
  targetDate?: string; // ថ្ងៃសុំច្បាប់ ឬថ្ងៃណាត់ជួប
  durationDays?: number; // ចំនួនថ្ងៃឈប់សម្រាក (ប្រសិនបើសុំច្បាប់)
  status: 'pending' | 'acknowledged' | 'approved' | 'rejected' | 'resolved';
  teacherReply?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type AtRiskCategory =
  | 'academic_slow'       // រៀនយឺត/ខ្សោយមុខវិជ្ជា
  | 'reading_difficulty'  // ពិបាកអាន/សរសេរតាមអាន (អក្ខរកម្ម)
  | 'math_difficulty'     // ពិបាកគិតលេខ/គណិតវិទ្យា
  | 'attendance_risk'     // ហានិភ័យបោះបង់/អវត្តមានញឹកញាប់
  | 'behavioral_social'   // ឥរិយាបថ/ខ្វះការផ្ចង់អារម្មណ៍
  | 'family_hardship';    // ជីវភាពគ្រួសារជួបការលំបាក

export type InterventionStrategy =
  | 'peer_tutoring'        // ក្មេងជួយក្មេង (Peer Tutor / Study Buddy)
  | 'after_class_remedial' // បង្រៀនបំប៉នបន្ថែមក្រៅម៉ោង
  | 'special_seat'         // អង្គុយតុមុខក្បែរគ្រូ
  | 'parent_home_tracking' // សៀវភៅតាមដានកិច្ចការផ្ទះជាមួយមាតាបិតា
  | 'custom_worksheet'     // ផ្តល់សន្លឹកកិច្ចការសម្រួលកម្រិត
  | 'counseling_support';  // ការប្រឹក្សាលើកទឹកចិត្ត

export type AtRiskProgressStatus = 'critical' | 'improving' | 'achieved' | 'on_track';

export interface InterventionProgressLog {
  id: string;
  date: string;
  evaluatedBy: string;
  assessmentNote: string;
  testScore?: number; // e.g. 6.5/10
  readingSpeedWPM?: number; // ពាក្យក្នុង១នាទី
  mathAccuracyPercent?: number; // %
  status: AtRiskProgressStatus;
}

export interface AtRiskStudent {
  id: string;
  studentId: string;
  studentName: string;
  gender: Gender;
  grade: number;
  section: string;
  academicYear: string;
  enrolledDate: string;
  categories: AtRiskCategory[];
  subjectsNeedingHelp: string[]; // e.g. ['ភាសាខ្មែរ', 'គណិតវិទ្យា']
  baselineScore: number; // ពិន្ទុដើមគ្រា (e.g. 3.5)
  currentScore: number;  // ពិន្ទុបច្ចុប្បន្ន (e.g. 5.8)
  targetScore: number;   // គោលដៅពិន្ទុ (e.g. 7.0)
  assignedBuddyId?: string;
  assignedBuddyName?: string;
  interventionStrategies: InterventionStrategy[];
  teacherNotes: string;
  progressLogs: InterventionProgressLog[];
  overallStatus: AtRiskProgressStatus;
  updatedAt: string;
}

export interface ClassCouncilOfficer {
  role: 'president' | 'vice_president' | 'study_officer' | 'discipline_officer' | 'hygiene_officer' | 'sports_arts_officer';
  roleTitleKhmer: string;
  studentId: string;
  studentName: string;
  gender?: Gender;
  phone?: string;
  notes?: string;
}

export interface ClassManagementCommitteeMember {
  id: string;
  order: number;
  honorific: string; // នាមស័ព្ទ (លោកស្រី, លោក, ក្រុមប្រឹក្សាកុមារ, etc.)
  fullName: string; // នាមត្រកូល និងនាមខ្លួន
  gender: 'ស្រី' | 'ប្រុស' | Gender;
  workplace: string; // អង្គភាពឬស្ថាប័ន( ទីកន្លែងធ្វើការ )
  occupation: string; // មុខរបរបច្ចុប្បន្ន
  role: 'president' | 'deputy_president_1' | 'deputy_president_2' | 'member'; // តួនាទីក្នុងគណៈកម្មការ (ប្រធាន, អនុប្រធាន, សមាជិក)
  roleTitleKhmer: string;
  phone: string; // លេខទូរស័ព្ទ
  gradeSection: string; // ថ្នាក់ទី (e.g. 3ក, 6ក)
  livelihoodStatus: string; // ស្ថានភាពជីវភាព (ជីវភាពមធ្យម, ជីវភាពធូរធារ, ជីវភាពក្រីក្រ, etc.)
  occupationCategory: string; // សូមជ្រើសរើសមុខរបរ (កសិករ, សិស្ស, អាជីវករ, etc.)
  photoUrl?: string; // រូបថតផ្លូវការ
}

export interface ClassManagementCommitteeDoc {
  id: string;
  grade: number;
  section: string;
  academicYear: string;
  schoolNameKhmer: string;
  districtOfficeKhmer: string;
  provinceKhmer: string;
  lunarDateKhmer: string;
  solarDateKhmer: string;
  homeroomTeacherName: string;
  principalName: string;
  members: ClassManagementCommitteeMember[];
}

export interface ClassCouncil {
  grade: number;
  section: string;
  academicYear: string;
  motto?: string;
  officers: ClassCouncilOfficer[];
}

export interface ClassSeatingGroup {
  groupId: number;
  groupName: string; // ក្រុមទី១, ក្រុមទី២, ...
  leaderStudentId?: string;
  memberStudentIds: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  dob: string;
  age: number;
  relationship: string; // កូន, ឪពុក, ម្តាយ, ជីដូន, ជីតា, ក្មួយ, ...
  occupation: string;
  nationalId?: string;
  civilStatusDoc?: string; // សំបុត្រកំណើត / សំបុត្រអាពាហ៍ពិពាហ៍ / សៀវភៅស្នាក់នៅ
  otherDoc?: string;
  isStudentAtSchool?: boolean;
  studentGrade?: number;
  studentSection?: string;
  studentCode?: string;
}

export interface HouseholdRecord {
  id: string;
  houseNumber: string; // លេខខ្នងផ្ទះ
  village: string; // ភូមិ
  commune: string; // ឃុំ
  district: string; // ស្រុក
  province: string; // ខេត្ត
  censusDate: string; // កាលបរិច្ឆេទជំរឿន (YYYY-MM-DD)
  academicYear: string; // ឆ្នាំសិក្សា
  
  // GPS Coordinates (ទីតាំងផ្ទះ)
  lat: number;
  lng: number;
  gpsAccuracy?: number;
  
  // Photos
  housePhotoUrl?: string; // រូបថតផ្ទះ
  familyBookPhotoUrl?: string; // រូបថតសៀវភៅគ្រួសារ
  equityCardPhotoUrl?: string; // រូបថតបណ្ណសមធម៌
  
  // Head of Family & Spouse
  headName: string; // ឈ្មោះមេគ្រួសារ
  headGender: Gender;
  headOccupation: string;
  headNationalId?: string;
  
  spouseName?: string; // ឈ្មោះសហព័ទ្ធ
  spouseGender?: Gender;
  spouseOccupation?: string;
  
  // House characteristics & social status
  houseType: string; // ប្រភេទផ្ទះ (ផ្ទះឈើលើថ្មក្រោម, ផ្ទះថ្ម, ផ្ទះឈើប្រក់ក្បឿង, ផ្ទះស័ង្កសី...)
  currentAddress: string; // លំនៅបច្ចុប្បន្ន
  familyStatus: 'ទូទៅ' | 'ក្រ១' | 'ក្រ២' | 'ងាយរងគ្រោះ'; // ស្ថានភាពគ្រួសារ
  equityCardNumber?: string; // លេខបណ្ណសមធម៌
  phoneNumber: string; // លេខទូរស័ព្ទ
  
  // Members List (Up to 10 members)
  members: FamilyMember[];
  
  remarks?: string; // ផ្សេងៗ
  recordedBy?: string; // អ្នកកត់ត្រា
}

export type FamilyPovertyStatus = 'ទូទៅ' | 'ក្រ១' | 'ក្រ២' | 'ងាយរងគ្រោះ' | 'ងាយរងហានិភ័យ';

export type LibraryBookCategory = 
  | 'literature'    // អក្សរសាស្ត្រ
  | 'science'       // វិទ្យាសាស្ត្រ
  | 'history'       // ប្រវត្តិសាស្ត្រ
  | 'mathematics'   // គណិតវិទ្យា
  | 'geography'     // ភូមិវិទ្យា & សង្គម
  | 'storybook'     // រឿងនិទានកុមារ
  | 'core_textbook' // សៀវភៅពុម្ពគោល
  | 'reference'     // ឯកសារយោង & វចនានុក្រម
  | 'magazine'      // ទស្សនាវដ្តី
  | 'general';      // ចំណេះដឹងទូទៅ

export type LibraryBookFormat = 'physical' | 'digital';

export type StudentScore = StudentScoreRecord;

export interface LibraryBook {
  id: string;
  code: string; // កូដសៀវភៅ
  titleKhmer: string; // ចំណងជើងសៀវភៅ
  titleLatin?: string;
  category: LibraryBookCategory; 
  format?: LibraryBookFormat; // 'physical' (សៀវភៅរូបវន្ត) ឬ 'digital' (សៀវភៅឌីជីថល E-Book/PDF)
  digitalFileUrl?: string; // តំណភ្ជាប់ PDF/E-Book សម្រាប់សៀវភៅឌីជីថល
  author: string; // អ្នកនិពន្ធ / ក្រសួងអប់រំ
  publisher?: string;
  publishedYear?: string;
  targetGrade?: number; // សម្រាប់ថ្នាក់ទី ១-៦
  gradeLevel?: number;
  totalCopies: number; // ចំនួនសរុប
  availableCopies: number; // ចំនួននៅសល់
  coverUrl?: string;
  coverPhotoUrl?: string;
  shelfLocation?: string; // ទីតាំងទូ/ធ្នើ ឬ "តំណភ្ជាប់ឌីជីថល"
  description?: string;
  notes?: string;
}

export interface StudentMonthlyFeedback {
  id: string;
  studentId: string;
  studentNameKhmer: string;
  grade?: number;
  section?: string;
  month: string; // 'មករា', 'កុម្ភៈ', etc.
  academicYear: string;
  comment: string;
  authorName: string; // Parent or Student name
  teacherReply?: string;
  teacherRepliedAt?: string;
  isAcknowledged?: boolean;
  createdAt: string;
}

export interface LibraryReadingLog {
  id: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  grade: number;
  section: string;
  bookId: string;
  bookTitle: string;
  bookCategory: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  pagesRead?: number;
  readingSummary?: string; // សង្ខេបខ្លឹមសាររឿងដែលបានអាន
  teacherLibrarianSign?: string;
}

export interface PrintSettings {
  includeRoundStamp: boolean; // ត្រាមូលសាលា
  includeDirectorSignature: boolean; // ហត្ថលេខានាយក
  redDirectorName: boolean; // ឈ្មោះនាយកពណ៌ក្រហម
  showRoundStamp?: boolean;
  showDirectorSignature?: boolean;
  showDirectorRedName?: boolean;
  showWatermark?: boolean;
}

export interface GoogleUserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

// ----------------------------------------------------
// SCHOOL ADMINISTRATION & CORRESPONDENCE (រដ្ឋបាលសាលា)
// ----------------------------------------------------
export type CorrespondenceType = 'inward' | 'outward'; // លិខិតចូល / លិខិតចេញ
export type CorrespondenceUrgency = 'normal' | 'urgent' | 'most_urgent'; // ធម្មតា / ប្រញាប់ / ប្រញាប់ណាស់
export type CorrespondenceClassification = 
  | 'ministerial_directive' // សារាចរ / សេចក្តីណែនាំក្រសួង
  | 'administrative_decision' // សេចក្តីសម្រេច / បង្គាប់ការ
  | 'official_letter' // លិខិតផ្លូវការ / លិខិតអញ្ជើញ
  | 'report_document' // របាយការណ៍បូកសរុប
  | 'mission_order' // លិខិតបញ្ជាបេសកកម្ម
  | 'transfer_document' // លិខិតផ្ទេរសិស្ស/បុគ្គលិក
  | 'general_memo'; // លិខិតផ្ទៃក្នុង / កំណត់បង្ហាញ

export interface OfficialCorrespondence {
  id: string;
  type: CorrespondenceType;
  logNumber: string; // លេខកត់ត្រាក្នុងសៀវភៅ (ឧ. ០៤៥ រប/សបក)
  referenceNumber?: string; // លេខលិខិតយោង
  docDate: string; // កាលបរិច្ឆេទលើលិខិត (YYYY-MM-DD)
  receivedOrSentDate: string; // ថ្ងៃខែចូល ឬ ចេញ
  subject: string; // កម្មវត្ថុ / ខ្លឹមសារសង្ខេប
  senderOrRecipient: string; // ស្ថាប័នផ្ញើមក ឬ ស្ថាប័នទទួល (ឧ. មន្ទីរអប់រំយុវជននិងកីឡាខេត្ត, ការិយាល័យអប់រំស្រុក)
  urgency: CorrespondenceUrgency;
  classification: CorrespondenceClassification;
  responsibleStaffName?: string; // មន្ត្រីទទួលបន្ទុកអនុវត្ត
  attachedFileUrl?: string;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  academicYear: string;
}

export type StaffActionType = 'leave_request' | 'mission_order' | 'commendation' | 'appraisal';

export interface StaffAdministrativeRecord {
  id: string;
  type: StaffActionType;
  staffId: string;
  staffName: string;
  staffRole: string;
  title: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reasonOrMission: string;
  destinationOrLocation?: string;
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  documentRefNumber?: string;
  remarks?: string;
  createdAt: string;
}

export interface SchoolCommitteeMember {
  id: string;
  name: string;
  roleInCommittee: string; // ប្រធាន, អនុប្រធាន, សមាជិកអចិន្ត្រៃយ៍, លេខា...
  organizationOrPosition: string; // នាយកសាលា, មេឃុំ, មេភូមិ, តំណាងមាតាបិតា, គ្រូបង្រៀន
  phone: string;
  notes?: string;
}

export interface SchoolCommittee {
  id: string;
  committeeName: string; // ឧ. គណៈកម្មការគ្រប់គ្រងសាលារៀន (គ.ក.ស.), គណៈកម្មការអភិវឌ្ឍន៍សាលារៀន
  decisionNumber: string; // លេខសេចក្តីសម្រេចបង្កើត
  establishedDate: string;
  mandateYears: string;
  members: SchoolCommitteeMember[];
  mainResponsibilities: string[];
}

// ----------------------------------------------------
// SCHOOL MANAGEMENT & MODEL SCHOOL STANDARDS (ការគ្រប់គ្រងសាលា)
// ----------------------------------------------------
export interface SchoolStrategicPlanItem {
  id: string;
  programArea: 'គុណភាពអប់រំ' | 'ហេដ្ឋារចនាសម្ព័ន្ធ&បរិស្ថាន' | 'ការចូលរួមសហគមន៍' | 'អភិបាលកិច្ច&រដ្ឋបាល' | 'បណ្ណាល័យ&បច្ចេកវិទ្យា';
  objective: string; // គោលបំណងយុទ្ធសាស្ត្រ
  keyActivity: string; // សកម្មភាពគន្លឹះ
  kpiTarget: string; // សូចនាករវាស់វែង (KPI)
  targetYear: string; // ឆ្នាំគោលដៅ ឧ. ២០២៤-២០២៥
  estimatedBudgetRiel: number;
  budgetSource: BudgetSource;
  responsibleLead: string; // អ្នកទទួលបន្ទុកចម្បង
  progressPercent: number; // 0 - 100%
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  notes?: string;
}

export interface ModelSchoolStandardCriterion {
  id: string;
  criterionNumber: string; // ឧ. ១.១, ១.២, ២.១
  nameKhmer: string;
  description: string;
  maxScore: number; // 1-5
  currentScore: number; // 1-5
  status: 'excellent' | 'good' | 'average' | 'needs_improvement';
  evidenceDocument?: string; // ឯកសារភស្តុតាង
  actionToImprove?: string; // សកម្មភាពកែលម្អ
}

export interface ModelSchoolStandardGroup {
  standardNumber: number; // 1 to 5
  standardTitleKhmer: string;
  description: string;
  criteria: ModelSchoolStandardCriterion[];
}

export interface SchoolAssetItem {
  id: string;
  assetCode: string; // ឧ. AST-BLD-01, AST-DSK-024
  assetNameKhmer: string; // តុ-កៅអីសិស្ស, អគារសិក្សា ២ជាន់, បន្ទះសូឡា, កុំព្យូទ័រ
  category: 'អគារ&ហេដ្ឋារចនាសម្ព័ន្ធ' | 'តុ-កៅអី&គ្រឿងសង្ហារិម' | 'បរិក្ខារបច្ចេកវិទ្យា/IT' | 'សម្ភារៈពិសោធន៍&ឧបទេស' | 'បរិក្ខារកីឡា' | 'បរិក្ខារទឹកស្អាត&អនាម័យ';
  quantity: number;
  unit: string; // ខ្នង, បន្ទប់, គ្រឿង, ឈុត, កំប្លេ
  locationRoom: string; // បន្ទប់រៀនទី១, បណ្ណាល័យ, ការិយាល័យ
  condition: 'good' | 'fair' | 'damaged' | 'unusable'; // ល្អ / មធ្យម / ខូចខាត / ប្រើលែងកើត
  sourceOfFunding: string; // ថវិការដ្ឋ / អំណោយសហគមន៍ / អង្គការដៃគូ
  acquiredYear: string;
  estimatedValueRiel: number;
  notes?: string;
}

export type ClassLogCategory =
  | 'general'
  | 'academic'
  | 'discipline'
  | 'hygiene_cleaning'
  | 'event_celebration'
  | 'health_incident'
  | 'parent_contact'
  | 'inspection_visit';

export type ClassAtmosphereMood = 'excellent' | 'calm_focused' | 'energetic' | 'needs_attention';

export interface DailyClassLog {
  id: string;
  grade: number;
  section: string;
  academicYear: string;
  date: string; // YYYY-MM-DD
  shift: 'morning' | 'afternoon' | 'full_day';
  title: string;
  category: ClassLogCategory;
  atmosphere: ClassAtmosphereMood;
  notes: string;
  highlights?: string[];
  absentCount?: number;
  recordedBy: string; // Teacher name
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// STUDENT DIGITAL BADGES & ACHIEVEMENT MARKERS (ផ្លាកសញ្ញា និងមេដាយឌីជីថល)
// ----------------------------------------------------
export type StudentBadgeCategory =
  | 'academic'                // ឆ្នើមការសិក្សា (Academic Excellence)
  | 'attendance'              // វត្តមានទៀងទាត់ (Perfect Attendance)
  | 'behavior_discipline'     // វិន័យ និងសីលធម៌ (Discipline & Morality)
  | 'leadership_cooperation'  // ភាពជាអ្នកដឹកនាំ និងសាមគ្គីភាព (Leadership & Teamwork)
  | 'sports_arts'             // កីឡា និងសិល្បៈ (Sports & Arts)
  | 'environmental_hygiene'   // បរិស្ថាន និងអនាម័យ (Eco & Hygiene Champion)
  | 'reading_literacy'        // អំណាន និងអក្ខរកម្ម (Reading & Literacy Star)
  | 'improvement_progress';   // វឌ្ឍនភាពលេចធ្លោ (Notable Progress & Improvement)

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface BadgeDefinition {
  id: string;
  code: string;
  titleKhmer: string;
  titleEnglish: string;
  description: string;
  category: StudentBadgeCategory;
  tier: BadgeTier;
  points: number;
  iconName: string;
  criteria: string;
  colorScheme: {
    bgLight: string;
    bgBadge: string;
    textColor: string;
    borderColor: string;
    ringColor: string;
    gradient: string;
  };
  isSystemDefault?: boolean;
}

export interface StudentBadgeAssignment {
  id: string;
  studentId: string;
  studentName: string;
  studentGender: Gender;
  studentCode: string;
  grade: number;
  section: string;
  badgeId: string;
  badge: BadgeDefinition;
  awardedDate: string;
  academicYear: string;
  term?: 'ឆមាសទី១' | 'ឆមាសទី២' | 'ប្រចាំខែ' | 'ពេញមួយឆ្នាំ' | string;
  awardedBy: string;
  reasonOrEvidence: string;
  progressMetricSnapshot?: {
    scoreAvg?: number;
    attendanceRate?: number;
    readingBooksCount?: number;
    improvedPoints?: number;
  };
  certificateNumber?: string;
  createdAt: string;
}

// Activity & Data Change Audit Log Types
export type ActivityDomain = 'student' | 'teacher' | 'finance' | 'academic' | 'admin' | 'health';
export type ActivityActionType = 'create' | 'update' | 'delete' | 'transfer' | 'income' | 'expense' | 'score' | 'attendance' | 'document' | 'approval' | 'health_check';

export interface ActivityChangeField {
  fieldName: string;
  fieldLabelKhmer: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
}

export interface ActivityLogComment {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLogItem {
  id: string;
  domain: ActivityDomain;
  actionType: ActivityActionType;
  title: string;
  description: string;
  entityId: string;
  entityCode?: string;
  entityName: string;
  actorName: string;
  actorRole: string;
  actorAvatar?: string;
  timestamp: string; // ISO 8601 string
  financialAmountRiel?: number;
  financialAmountUsd?: number;
  financialCategory?: string;
  changes?: ActivityChangeField[];
  targetTab?: ActiveTab;
  tags?: string[];
  details?: Record<string, any>;
  anomalies?: ActivityAnomaly[];
  isArchived?: boolean;
  aiImpactSummary?: string;
  aiImpactLevel?: 'high' | 'medium' | 'low';
  comments?: ActivityLogComment[];
  isHighRisk?: boolean;
  riskScore?: number; // 0 - 100
  riskReasons?: string[];
  riskLevel?: 'critical' | 'high' | 'medium' | 'low';
}

export type ActivityAnomalyType = 'bulk_deletion' | 'off_hours' | 'high_finance' | 'rapid_actions' | 'sensitive_admin';
export type AnomalySeverity = 'high' | 'medium' | 'low';

export interface ActivityAnomaly {
  id: string;
  type: ActivityAnomalyType;
  severity: AnomalySeverity;
  titleKhmer: string;
  descriptionKhmer: string;
  detectedAt: string;
  logId: string;
}

export interface ActivitySavedView {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  badgeColor?: string;
  isSystem?: boolean;
  filters: {
    searchQuery?: string;
    selectedDomain?: ActivityDomain | 'all';
    selectedAction?: ActivityActionType | 'all';
    selectedRole?: string;
    selectedActor?: string;
    dateFilter?: 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'last_month' | 'custom';
    customStartDate?: string;
    customEndDate?: string;
    showAnomaliesOnly?: boolean;
    showHighRiskOnly?: boolean;
    archiveFilter?: 'active' | 'archived' | 'all';
    viewMode?: 'table' | 'list';
  };
  createdAt: string;
}

export interface ActivityDriveScheduleConfig {
  enabled: boolean;
  frequency: 'weekly' | 'monthly' | 'biweekly';
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dayOfMonth: number; // 1-31
  timeOfDay: string; // "08:00"
  format: 'pdf' | 'html' | 'csv' | 'json';
  folderName: string;
  folderId?: string;
  targetEmail: string;
  includeAnomalies: boolean;
  includeComments: boolean;
  includeHighRiskOnly: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  runHistory: Array<{
    id: string;
    executedAt: string;
    status: 'success' | 'failed';
    fileName: string;
    recordsCount: number;
    fileSizeKb: number;
    message: string;
    downloadUrl?: string;
  }>;
}

export interface ActivityHealthMetric {
  totalLogs: number;
  healthScore: number; // 0 - 100
  healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
  healthStatusKhmer: string;
  highRiskCount: number;
  bulkDeletionsCount: number;
  offHoursCount: number;
  rapidActionCount: number;
  highFinanceCount: number;
  unusualFrequencyCount: number;
  systemHealthAssessment: string;
  recommendationsKhmer: string[];
}

export interface ActivityRetentionConfig {
  retentionDays: number; // e.g. 30, 60, 90, 180, 365, 0 (0 = keep forever)
  autoCleanupEnabled: boolean;
  lastCleanedAt?: string;
  lastCleanedCount?: number;
}

// Student Progress Report & Offline Sync Types
export interface StudentProgressReport {
  id: string;
  studentId: string;
  studentCode: string;
  nameKhmer: string;
  grade: number;
  section: string;
  academicYear: string;
  evaluationPeriod: string; // e.g. 'ខែមករា' or 'ឆមាសទី១'
  averageScore: number;
  totalScore?: number;
  rank?: number;
  attendancePercentage: number;
  conduct: 'ល្អប្រសើរ' | 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ត្រូវការពង្រឹង';
  readingWritingSkill?: 'ស្ទាត់ជំនាញ' | 'មធ្យម' | 'នៅខ្សោយ' | 'មិនទាន់ចេះអាន';
  mathCalculationSkill?: 'ពូកែ' | 'មធ្យម' | 'ត្រូវការពង្រឹង';
  socialTeamwork?: 'រួសរាយសហការ' | 'ស្ងៀមស្ងាត់' | 'ត្រូវការជំរុញ';
  strengths: string;
  areasForImprovement: string;
  teacherRecommendations: string;
  evaluatedByTeacherName: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending_sync' | 'error';
  lastSyncedAt?: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  collectionName: string;
  docId: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  createdAt: string;
  retryCount: number;
  error?: string;
}

