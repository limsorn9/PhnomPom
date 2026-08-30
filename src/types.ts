export type Gender = 'M' | 'F';
export type LivingCondition = 'ទូទៅ' | 'ក្រ១' | 'ក្រ២' | string;
export type AcademicHistoryStatus = 'ឡើងថ្នាក់' | 'ត្រួតថ្នាក់' | 'ចូលរៀនឡើងវិញ' | 'ផ្ទេរចូល' | string;
export type OrphanStatus = 'មិនកំព្រា' | 'កំព្រាឪពុក' | 'កំព្រាម្តាយ' | 'កំព្រាទាំងពីរ' | string;

export interface VaccinationItem {
  id: string;
  vaccineName: string; // e.g. វ៉ាក់សាំងកញ្ជ្រឹល-ស្អូច (MR), វ៉ាក់សាំងស្វិតដៃជើង (Polio), វ៉ាក់សាំងកូវីដ-១៩, វ៉ាក់សាំងតេតាណូស (Tetanus), វ៉ាក់សាំងថ្លើមប្រភេទ B (Hep B)
  doseNumber: string; // e.g. ដូសទី១, ដូសទី២, ដូសជំរុញ (Booster)
  administeredDate: string; // YYYY-MM-DD
  administeredPlace?: string; // e.g. មណ្ឌលសុខភាពភ្នំព្រឹក, យុទ្ធនាការសាលារៀន
  batchNumber?: string; // លេខឡូត៍
  status: 'completed' | 'scheduled' | 'overdue';
  verifiedByDoctor?: string; // ឈ្មោះគ្រូពេទ្យ/បុគ្គលិកសុខាភិបាល
}

export interface ChronicHealthCondition {
  id: string;
  conditionName: string; // e.g. ជំងឺហឺត (Asthma), អាឡែកហ្ស៊ីចំណីអាហារ/ថ្នាំ (Allergy), បេះដូងពីកំណើត (Congenital Heart), ប្រកាច់ (Epilepsy), ទឹកនោមផ្អែមប្រភេទ១ (Type 1 Diabetes)
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedDate?: string;
  symptomsAndTriggers?: string; // រោគសញ្ញា ឬកត្តាជំរុញ
  emergencyMedication?: string; // ថ្នាំសង្គ្រោះបន្ទាន់ (e.g. ថ្នាំបាញ់ហឺត Inhaler, ថ្នាំលេប)
  careInstructions?: string; // ការណែនាំសម្រាប់លោកគ្រូអ្នកគ្រូពេលមានអាសន្ន
  hospitalContact?: string; // ទំនាក់ទំនងមន្ទីរពេទ្យ/គ្រូពេទ្យផ្ទាល់
}

export interface PhysicalExaminationRecord {
  id: string;
  examDate: string; // YYYY-MM-DD
  examinerName: string; // គ្រូពេទ្យពិនិត្យ ឬបុគ្គលិកសុខាភិបាល
  examinerRole?: string; // វេជ្ជបណ្ឌិត, គិលានុបដ្ឋាក, គ្រូទទួលបន្ទុកសុខភាព
  heightCm: number;
  weightKg: number;
  bmi: number;
  visionLeft?: string; // ភ្នែកឆ្វេង (e.g. 10/10, 6/10)
  visionRight?: string; // ភ្នែកស្តាំ (e.g. 10/10, 8/10)
  hearingStatus?: 'normal' | 'impaired_mild' | 'impaired_severe'; // សោតវិញ្ញាណ/ការស្តាប់
  dentalHealth?: 'good' | 'cavities' | 'inflamed_gums' | 'needs_treatment'; // សុខភាពមាត់ធ្មេញ
  postureAndSpine?: 'normal' | 'scoliosis_risk' | 'abnormal'; // ឆ្អឹងខ្នង និងឥរិយាបថ
  skinAndHygiene?: 'clean' | 'rash' | 'fungal' | 'pediculosis'; // ស្បែក និងអនាម័យទូទៅ
  generalNotes?: string;
  followUpRequired?: boolean;
  followUpPlan?: string;
}

export interface HealthRecord {
  heightCm: number;
  weightKg: number;
  bmi: number;
  nutritionStatus: 'normal' | 'underweight' | 'overweight' | 'wasted';
  vaccinated: boolean;
  bloodType: string;
  notes?: string;
  lastCheckedDate: string;
  // Extended Clinical Health Record Attributes
  vaccinations?: VaccinationItem[]; // ប្រវត្តិការចាក់វ៉ាក់សាំងលម្អិត
  chronicConditions?: ChronicHealthCondition[]; // ជំងឺរ៉ាំរ៉ៃ និងអាឡែកហ្ស៊ី
  physicalExams?: PhysicalExaminationRecord[]; // ប្រវត្តិពិនិត្យកាយសម្បទា និងសុខភាពតាមកាលកំណត់
  allergies?: string[]; // អាឡែកហ្ស៊ីចំណីអាហារ/ថ្នាំ
  hasGlasses?: boolean; // ពាក់វ៉ែនតា
  hasHearingAid?: boolean; // ឧបករណ៍ជំនួយការស្តាប់
  emergencyContactName?: string; // ទំនាក់ទំនងសង្គ្រោះបន្ទាន់
  emergencyContactPhone?: string;
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
  assignedGrade?: number; // ថ្នាក់បង្រៀនទី១
  assignedSection?: string; // បន្ទប់ទី១
  assignedGrade2?: number; // ថ្នាក់បង្រៀនទី២ (បើមាន)
  assignedSection2?: string; // បន្ទប់ទី២ (បើមាន)
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
  academicYear?: string; // ឆ្នាំសិក្សា
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
  telegramChatId?: string; // Telegram Group Chat ID e.g. "-10023456789"
  telegramGroupName?: string; // e.g. "ក្រុមតេលេក្រាម ថ្នាក់ទី១ក"
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

export interface MonthlyBudgetSourceBreakdown {
  income: number;
  expense: number;
}

export interface MonthlyBudgetSummary {
  monthName: string;
  monthNumber?: number;
  academicYear?: string;
  incomeRiel: number;
  expenseRiel: number;
  balanceRiel: number;
  incomeUsd: number;
  expenseUsd: number;
  balanceUsd: number;
  transactionCount: number;
  bySource: {
    pbStateBudget: MonthlyBudgetSourceBreakdown;
    sigImprovementGrant: MonthlyBudgetSourceBreakdown;
    communityParents: MonthlyBudgetSourceBreakdown;
    ngoPartner: MonthlyBudgetSourceBreakdown;
  };
  byCategory: Record<string, number>;
  transactions?: BudgetTransaction[];
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
  principalSignatureUrl?: string; // Digital signature image file URL or data URL
  principalStampUrl?: string; // Official stamp image file URL
  mapUrl?: string;
  facebookPage?: string;
  gradingScaleType?: GradingScaleType; // 'khmer_term' (ល្អណាស់, ល្អ, ល្អបង្គួរ...) vs 'letter' (A, B, C...)
  sessionRememberDays?: string; // '1_day' | '7_days' | '14_days' | '30_days' | '90_days' | 'forever' | 'session_only'
  lastDatabaseBackup?: string; // ISO Timestamp of last manual database snapshot
  directorPin?: string; // លេខកូដសម្ងាត់នាយកសាលា (Default: 1212)
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
  | 'super_admin' // ស៊ុបទែអបមីន (Super Administrator)
  | 'director'    // នាយកសាលារៀន
  | 'secretary'   // លេខាធិការ
  | 'librarian'   // បណ្ណារក្ស
  | 'teacher'     // គ្រូបង្រៀន / គ្រូបន្ទុកថ្នាក់
  | 'student'     // សិស្ស
  | 'parent';     // អាណាព្យាបាល

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
  passwordHistory?: string[]; // History of last 3+ previous passwords to prevent reuse
  lastSecurityReviewDate?: string; // ISO Date when user last reviewed their security logs / active sessions
  forcePasswordChange?: boolean; // When true, forces mandatory password change on login/session
  mfaConfig?: UserMfaConfig;
  activeSessions?: UserSessionInfo[];
  securityLogs?: SecurityLoginLog[];
}

export interface PasswordPolicyConfig {
  expirationDays: number; // e.g. 30, 60, 90, 180, or 0 (never)
  preventRecentPasswordsCount: number; // e.g. 3
  minLength: number; // e.g. 8
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxFailedAttemptsBeforeLock: number;
}

export interface SuspiciousActivityAlert {
  id: string;
  userId: string;
  userEmail: string;
  userNameKhmer: string;
  userRole: UserRole;
  reason: string;
  detectedAt: string;
  severity: 'high' | 'critical' | 'medium';
  ipAddresses: string[];
  locations: string[];
  failedAttemptsCount: number;
  dismissed?: boolean;
}

export interface DeletedAppUser {
  id: string;
  entityType?: 'appUser' | 'student' | 'teacher';
  user?: AppUser;
  studentProfileBackup?: Student;
  teacherProfileBackup?: Teacher;
  deletedAt: string; // ISO string
  deletedBy: {
    id?: string;
    nameKhmer: string;
    email: string;
    role: string;
  };
  reason: string;
  expiresAt: string; // ISO string (30 days from deletedAt)
}

export type AccountAuditEventType =
  | 'create'
  | 'delete'
  | 'restore'
  | 'permanent_delete'
  | 'update_role'
  | 'update_profile'
  | 'reset_password'
  | 'toggle_status'
  | 'force_password_rotation'
  | 'permission_override';

export interface AccountAuditLog {
  id: string;
  timestamp: string; // ISO string
  eventType: AccountAuditEventType;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: UserRole;
  targetUserEmail?: string;
  targetStaffCode?: string;
  actor: {
    id?: string;
    nameKhmer: string;
    email: string;
    role: string;
  };
  reason?: string;
  details: string;
  changesSummary?: {
    field: string;
    before?: string | number | boolean;
    after?: string | number | boolean;
  }[];
}

export type PermissionAccessLevel = 'full' | 'scoped' | 'view_only' | 'restricted';

export interface FeatureAccessDetail {
  id: string;
  category: string;
  name: string;
  description: string;
  accessLevel: PermissionAccessLevel;
  scopeNote?: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
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
  type: 'password_reset' | 'info' | 'alert' | 'system' | 'score_deadline' | 'school_event' | 'fcm_push';
  targetRole?: UserRole | 'all';
  targetUserId?: string;
  targetTeacherGrade?: number;
  targetTeacherSection?: string;
  read: boolean;
  priority?: 'normal' | 'high' | 'urgent';
  deadlineDate?: string;
  actionTab?: ActiveTab;
  meta?: {
    studentId?: string;
    studentName?: string;
    actionTime?: string;
    monthOrSemester?: string;
    eventDate?: string;
    fcmMessageId?: string;
    requesterUserId?: string;
    requesterName?: string;
    requesterRole?: string;
    reason?: string;
    proposedNewPassword?: string;
    [key: string]: any;
  };
}

export type ActiveTab = 
  | 'super_admin_hub'
  | 'telegram_bot'
  | 'dashboard'
  | 'secretary_dashboard'
  | 'librarian_dashboard'
  | 'homeroom_dashboard'
  | 'teacher_agenda'
  | 'equipment_loans'
  | 'teacher_meetings'
  | 'teaching_resources'
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
  | 'learning_resources'
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
  code: string; // កូដសៀវភៅ ឧ. BK-2024-001
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
  isbnBarcode?: string; // លេខ ISBN / Barcode
  bookCondition?: 'good' | 'fair' | 'damaged' | 'lost'; // ស្ថានភាពសៀវភៅ
  description?: string;
  notes?: string;
  createdAt?: string;
}

export type LibraryVisitPurpose = 'reading' | 'borrow_return' | 'research' | 'homework' | 'library_class' | 'storytelling';

export interface LibraryVisitorLog {
  id: string;
  studentId?: string;
  studentCode?: string;
  studentNameKhmer: string;
  grade: number;
  section: string;
  visitDate: string; // YYYY-MM-DD
  timeIn: string; // HH:mm
  timeOut?: string; // HH:mm
  purpose: LibraryVisitPurpose;
  notes?: string;
  librarianName?: string;
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
  // Compatibility helpers
  studentGrade?: number;
  studentSection?: string;
  bookId: string;
  bookCode?: string;
  bookTitle: string;
  bookCategory: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  pagesRead?: number;
  readingSummary?: string; // សង្ខេបខ្លឹមសាររឿងដែលបានអាន
  summaryOrImpression?: string;
  rating?: number; // 1 to 5 stars
  comprehensionScore?: number; // 1-10
  conditionOnReturn?: 'good' | 'damaged' | 'lost';
  librarianName?: string;
  teacherLibrarianSign?: string;
  notes?: string;
}

export type SignatureQRStyle = 'classic_square' | 'rounded_modern' | 'dot_pattern' | 'framed_seal' | 'bordered_moeys';

export interface QRScanVerificationLog {
  id: string;
  scannedAt: string; // ISO string
  signatureRef: string;
  studentId?: string;
  studentCode: string;
  studentNameKhmer: string;
  studentNameLatin?: string;
  grade: number;
  section: string;
  academicYear: string;
  monthOrSemester?: string;
  schoolCode: string;
  schoolNameKhmer: string;
  principalName: string;
  issueDate?: string;
  expiresAt?: string;
  verificationStatus: 'valid' | 'expired' | 'invalid' | 'tampered';
  statusReason?: string;
  deviceInfo: {
    deviceType: 'mobile' | 'desktop' | 'tablet' | 'scanner';
    os?: string;
    browser?: string;
    userAgent?: string;
    ipOrLocationHint?: string;
  };
  verifierName?: string;
  verifierRole?: string;
  scanMethod: 'webcam_scanner' | 'file_upload' | 'manual_input' | 'direct_url';
  averageScore?: number;
  rank?: number;
  totalStudents?: number;
}

export interface PrintSettings {
  includeRoundStamp: boolean; // ត្រាមូលសាលា
  includeDirectorSignature: boolean; // ហត្ថលេខានាយក
  redDirectorName: boolean; // ឈ្មោះនាយកពណ៌ក្រហម
  showRoundStamp?: boolean;
  showDirectorSignature?: boolean;
  showDirectorRedName?: boolean;
  showRoyalHeader?: boolean;
  showWatermark?: boolean;
  showPrincipalSignatureQR?: boolean; // បង្ហាញ QR Code ហត្ថលេខាឌីជីថលរបស់នាយកសាលា
  includePrincipalSignatureQR?: boolean;
  signatureQRStyle?: SignatureQRStyle; // រចនាប័ទ្ម QR Code ហត្ថលេខាឌីជីថល (ការ៉េ, ជ្រុងមូល, គ្រាប់ចុច, ត្រាសុវត្ថិភាព)
  signatureExpiryDays?: number; // ចំនួនថ្ងៃសុពលភាព QR Code ហត្ថលេខា (ឧ. ៣០, ៦០, ៩០, ១៨០, ៣៦៥ ថ្ងៃ)
  paperSize?: 'A4' | 'A5' | 'Letter';
  orientation?: 'portrait' | 'landscape';
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
  actorId?: string;
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

// ----------------------------------------------------
// 1. SCHOOL EQUIPMENT & TECH LOAN CHECKLIST (បញ្ជីឧបករណ៍ និងការខ្ចី)
// ----------------------------------------------------
export type EquipmentCategory =
  | 'projector'       // ម៉ាស៊ីនបញ្ចាំង (Projector)
  | 'laptop'          // កុំព្យូទ័រយួរដៃ (Laptop)
  | 'tablet'          // ថេប្លេត (Tablet / iPad)
  | 'speaker_mic'     // ធុងបាស និងមីក្រូហ្វូនឥតខ្សែ (Wireless Speaker & Mic)
  | 'smart_tv'        // ទូរទស្សន៍ឆ្លាតវៃ / អេក្រង់ (Smart TV / Interactive Display)
  | 'document_camera' // ម៉ាស៊ីនស្កេនឯកសារបង្រៀន (Document Visualizer)
  | 'solar_power'     // ផ្ទាំងសូឡា / អាគុយផ្ទុកថាមពល (Solar Inverter / Power Bank)
  | 'science_kit'     // ឧបករណ៍ពិសោធន៍វិទ្យាសាស្ត្រ (Science Lab Kit)
  | 'other';

export type LoanStatus = 'borrowed' | 'returned' | 'overdue' | 'damaged';

export interface SchoolEquipmentItem {
  id: string;
  code: string; // ឧ. TECH-PRJ-01, TECH-LAP-03
  nameKhmer: string; // ម៉ាស៊ីនបញ្ចាំង Epson EB-X06
  category: EquipmentCategory;
  brandModel: string;
  serialNumber?: string;
  locationRoom: string; // បន្ទប់កុំព្យូទ័រ, ការិយាល័យ, បណ្ណាល័យ
  condition: 'good' | 'fair' | 'maintenance' | 'broken';
  totalQuantity: number;
  availableQuantity: number;
  statusNotes?: string;
}

export interface EquipmentLoanRecord {
  id: string;
  loanNumber: string; // ឧ. LN-2024-001
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentCategory: EquipmentCategory;
  teacherId?: string;
  teacherName: string; // ឈ្មោះគ្រូខ្ចី
  teacherPhone?: string;
  gradeSection: string; // ឧ. ថ្នាក់ទី៥ក, បន្ទប់កុំព្យូទ័រ
  purposeOfUse: string; // គោលបំណង ឧ. បញ្ចាំងស្លាយមេរៀនវិទ្យាសាស្ត្រ, ប្រជុំគ្រូ
  borrowDate: string; // YYYY-MM-DD
  borrowTime?: string; // HH:mm
  expectedReturnDate: string; // YYYY-MM-DD
  expectedReturnTime?: string;
  actualReturnDate?: string;
  status: LoanStatus;
  conditionBefore: string; // ដំណើរការល្អ
  conditionAfter?: string; // ដំណើរការល្អ ឬ មានបញ្ហា
  recordedBy: string; // អ្នកកត់ត្រា/បណ្ណារក្ស
  syncedToGoogleSheets?: boolean;
  googleSheetRowIndex?: number;
  notes?: string;
  createdAt: string;
}

// ----------------------------------------------------
// 2. TEACHER DAILY AGENDA & TASKS (របៀបវារៈប្រចាំថ្ងៃរបស់គ្រូ)
// ----------------------------------------------------
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskCategory = 'teaching' | 'exam_grading' | 'meeting' | 'attendance' | 'admin' | 'google_calendar';

export interface TeacherDailyTask {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;
  category: TaskCategory;
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt?: string;
  assignedTeacherName?: string;
  gradeSection?: string;
  googleCalendarEventId?: string;
  googleCalendarHtmlLink?: string;
  isSyncedToGoogleCalendar?: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// 3. TEACHER MEETING MINUTES & RESOLUTIONS (កំណត់ត្រាការប្រជុំគ្រូ)
// ----------------------------------------------------
export type TeacherMeetingType =
  | 'monthly'          // កិច្ចប្រជុំប្រចាំខែ (Monthly General Staff Meeting)
  | 'pedagogical'      // កិច្ចប្រជុំបច្ចេកទេស/គរុកោសល្យ (Technical & Pedagogical Meeting)
  | 'exam_review'      // កិច្ចប្រជុំបូកសរុបលទ្ធផលប្រឡង (Exam & Score Evaluation)
  | 'emergency'        // កិច្ចប្រជុំបន្ទាន់ (Emergency / Ad-hoc Meeting)
  | 'semester_opening' // កិច្ចប្រជុំបើកបវេសនកាល/ឆមាស (Semester Kickoff)
  | 'community_school';// កិច្ចប្រជុំជាមួយគណៈកម្មការទ្រទ្រង់សាលា

export interface MeetingAttendee {
  id: string;
  name: string;
  role: string;
  present: boolean;
  permissionReason?: string;
}

export interface MeetingActionItem {
  id: string;
  taskTitle: string;
  responsiblePerson: string;
  deadlineDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface TeacherMeetingRecord {
  id: string;
  meetingCode: string; // ឧ. MT-2024-10
  title: string; // កិច្ចប្រជុំប្រចាំខែតុលា បូកសរុបការបង្រៀន និងផែនការប្រឡងឆមាសទី១
  meetingType: TeacherMeetingType;
  academicYear: string;
  meetingDate: string; // YYYY-MM-DD
  meetingTime: string; // ឧ. 08:30 - 11:30 ព្រឹក
  location: string; // ឧ. បន្ទប់ប្រជុំធំ សាលាបឋមសិក្សាភ្នំពុំ
  chairpersonName: string; // ប្រធានអង្គប្រជុំ (លោកនាយក)
  secretaryName: string; // លេខាអង្គប្រជុំ
  totalInvited: number;
  totalPresent: number;
  attendees: MeetingAttendee[];
  agendas: string[]; // របៀបវារៈប្រជុំ
  discussionSummary: string; // សង្ខេបខ្លឹមសារពិភាក្សា
  resolutions: string[]; // សេចក្ដីសម្រេចចិត្តពីការប្រជុំ (Decisions & Agreed Points)
  actionItems: MeetingActionItem[]; // ផែនការសកម្មភាពបន្ត និងអ្នកទទួលបន្ទុក
  googleCalendarEventId?: string;
  googleCalendarHtmlLink?: string;
  isSyncedToGoogleCalendar?: boolean;
  syncedAt?: string;
  // Google Drive synchronization fields
  isSyncedToGoogleDrive?: boolean;
  googleDriveFileId?: string;
  googleDriveWebViewLink?: string;
  driveSyncedAt?: string;
  status: 'draft' | 'approved' | 'published';
  creatorId?: string;
  creatorRole?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// 4. GOOGLE DRIVE AUTOMATED SYNC STATE & LOGS
// ----------------------------------------------------
export interface DriveAutoSyncConfig {
  enabled: boolean;
  intervalMinutes: number; // e.g. 15, 30, 60, 1440
  syncMeetings: boolean;
  syncFinances: boolean;
  syncFullBackup: boolean;
  syncStudents: boolean;
  syncScores: boolean;
  syncHonorRoll: boolean;
  syncStaffDirectory: boolean;
  folderId: string;
  lastAutoSyncTime?: string;
  autoSyncOnChanges: boolean;
}

export interface DriveSyncHistoryItem {
  id: string;
  title: string;
  category: 'meeting_minutes' | 'financial_report' | 'database_backup' | 'student_roster' | 'score_ranking' | 'honor_roll' | 'staff_directory' | 'custom_file';
  categoryLabelKhmer: string;
  fileName: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  folderId: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  status: 'success' | 'syncing' | 'failed' | 'pending';
  errorMessage?: string;
  syncedAt: string;
  syncedBy: string;
}

// ----------------------------------------------------
// 5. VERSION MISMATCH & CONFLICT RESOLUTION TYPES
// ----------------------------------------------------
export interface CloudVersionMetadata {
  fileId: string;
  fileName: string;
  fileSizeBytes?: number;
  fileSizeFormatted: string;
  modifiedTime: string;
  syncedBy?: string;
  studentCount?: number;
  teacherCount?: number;
  scoreCount?: number;
  classroomCount?: number;
  meetingCount?: number;
  budgetCount?: number;
  academicYear?: string;
  version?: string;
  snapshotData?: any;
}

export interface LocalVersionMetadata {
  lastModifiedTime: string;
  studentCount: number;
  teacherCount: number;
  scoreCount: number;
  classroomCount: number;
  meetingCount: number;
  budgetCount: number;
  academicYear: string;
  version: string;
}

export type VersionConflictStatus = 'cloud_newer' | 'local_newer' | 'content_different' | 'synced';

export interface VersionConflictState {
  hasMismatch: boolean;
  status: VersionConflictStatus;
  cloudVersion: CloudVersionMetadata | null;
  localVersion: LocalVersionMetadata;
  lastCheckedTime: string;
  isChecking: boolean;
  dismissed: boolean;
  conflictReason?: string;
}

// ----------------------------------------------------
// 4. TEACHING RESOURCE HUB & GOOGLE DRIVE SHARING (មជ្ឈមណ្ឌលធនធានបង្រៀន)
// ----------------------------------------------------
export type ResourceSubject =
  | 'khmer'            // ភាសាខ្មែរ
  | 'math'             // គណិតវិទ្យា
  | 'science'          // វិទ្យាសាស្ត្រ
  | 'social'           // សិក្សាសង្គម
  | 'arts_music'       // សិល្បៈ-តន្ត្រី
  | 'physical_health'  // អប់រំកាយ និងសុខភាព
  | 'english'          // ភាសាអង់គ្លេស
  | 'pedagogy_guide'   // ឯកសារគរុកោសល្យ/វិធីសាស្ត្របង្រៀន
  | 'general_knowledge';

export type ResourceFileType = 'pdf' | 'slide' | 'doc' | 'sheet' | 'image' | 'video' | 'zip' | 'link';

export interface TeachingResourceFile {
  id: string;
  titleKhmer: string;
  description?: string;
  gradeLevel: number; // 0=ទូទៅ, 1 to 6
  subject: ResourceSubject;
  fileType: ResourceFileType;
  fileSizeBytes?: number;
  fileSizeFormatted?: string; // ឧ. 2.4 MB
  originalFileName: string;
  downloadUrl?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveDownloadLink?: string;
  authorTeacherName: string;
  isSharedWithAllTeachers: boolean;
  tags?: string[];
  viewsCount: number;
  downloadsCount: number;
  syncedToGoogleDrive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// ----------------------------------------------------
// 6. ACADEMIC ACHIEVEMENTS & HONOR ROLL AWARDS MODULE
// ----------------------------------------------------
export type AchievementAwardType = 
  | 'honor_roll_first'       // តារាងកិត្តិយសលេខ១ ប្រចាំឆមាស
  | 'honor_roll_second'      // តារាងកិត្តិយសលេខ២ ប្រចាំឆមាស
  | 'honor_roll_third'       // តារាងកិត្តិយសលេខ៣ ប្រចាំឆមាស
  | 'honor_roll_distinction' // សិស្សឆ្នើមប្រចាំឆមាស (Outstanding Academic Distinction)
  | 'subject_khmer_star'     // ឆ្នើមមុខវិជ្ជាភាសាខ្មែរ (Khmer Language Excellence)
  | 'subject_math_master'    // ឆ្នើមមុខវិជ្ជាគណិតវិទ្យា (Mathematics Master)
  | 'subject_science_whiz'   // ឆ្នើមមុខវិជ្ជាវិទ្យាសាស្ត្រ និងសង្គម (Science & Social Excellence)
  | 'subject_english_champ'  // ឆ្នើមមុខវិជ្ជាភាសាអង់គ្លេស (English Champion)
  | 'subject_arts_creativity'// ឆ្នើមសិល្បៈ និងគំនូរច្នៃប្រឌិត (Arts & Creativity)
  | 'perfect_attendance'     // វត្តមានពេញលេញឥតឈប់ (100% Attendance Award)
  | 'morality_civics_model'  // គំរូសីលធម៌ វិន័យ និងចរិយាសម្បត្តិ (Model Civics & Conduct)
  | 'sports_athletics'       // ឆ្នើមកីឡា និងកាយសម្បទា (Athletics & Sports Star)
  | 'reading_advocate'       // ឆ្នើមការអានសៀវភៅបណ្ណាល័យ (Reading Advocate)
  | 'custom_special';        // ពានរង្វាន់/ការលើកសរសើរពិសេស

export interface AcademicAchievement {
  id: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  grade: number;
  section: string;
  academicYear: string;
  semester: 'semester_1' | 'semester_2' | 'full_year'; // ឆមាសទី១, ឆមាសទី២, ពេញមួយឆ្នាំ
  awardType: AchievementAwardType;
  awardTitleKhmer: string; // ឈ្មោះពានរង្វាន់/កិត្តិយស e.g. "តារាងកិត្តិយសលេខ១ ប្រចាំឆមាសទី១"
  awardTitleEnglish?: string;
  subjectTarget?: string; // មុខវិជ្ជាជាក់លាក់ (ប្រសិនបើជា Subject Award)
  rankPosition?: number; // ចំណាត់ថ្នាក់ (បើមាន ឧ. ១, ២, ៣)
  gpaScore?: number; // ពិន្ទុមធ្យមភាគ
  awardedDate: string; // YYYY-MM-DD
  awardedByTeacherName: string; // គ្រូបង្រៀន/នាយកសាលាដែលប្រគល់
  remarksOrPraise?: string; // សេចក្តីសរសើរ ឬការលើកទឹកចិត្ត
  certificateNumber?: string; // លេខសំបុត្រសរសើរផ្លូវការ
  status: 'published' | 'draft';
  createdAt: string;
}

// ----------------------------------------------------
// 7. SCHOOL GROUP MANAGEMENT & MEMBER ASSIGNMENTS (គ្រប់គ្រងក្រុមសាលារៀន និងការចាត់តាំងសមាជិក)
// ----------------------------------------------------
export type SchoolGroupCategory = 
  | 'academic_year'        // ឆ្នាំសិក្សា / កម្រិតថ្នាក់ (Academic Year / Cohort)
  | 'extracurricular_club' // ក្លឹបសិក្សា & សកម្មភាពក្រៅម៉ោង (Clubs - STEM, Sports, Arts, Reading, Scouts)
  | 'internal_department'  // ផ្នែក / ការិយាល័យផ្ទៃក្នុង (Internal Departments - Management, Admin, IT, Sanitation)
  | 'study_tutoring'       // ក្រុមសិក្សាជំនួយ / បំប៉ន (Tutoring & Peer Study)
  | 'school_committee'     // គណៈកម្មការ & ក្រុមការងារពិសេស (Taskforce & Committees)
  | 'other';               // ផ្សេងៗ

export type GroupMemberRole = 
  | 'leader'        // ប្រធានក្រុម (Leader / President)
  | 'deputy_leader' // អនុប្រធានក្រុម (Vice Leader / VP)
  | 'secretary'     // លេខាធិការ (Secretary)
  | 'treasurer'     // ហិរញ្ញិក (Treasurer)
  | 'advisor'       // គ្រូទីប្រឹក្សា / គ្រូបង្វឹក (Teacher Advisor / Coach)
  | 'member';       // សមាជិក (Member)

export interface SchoolGroupMember {
  id: string; // generated ID or memberId
  memberType: 'student' | 'teacher';
  memberId: string; // student.id or teacher.id
  nameKhmer: string;
  nameLatin?: string;
  codeOrStaffId?: string; // student.code or teacher.staffCode
  gradeOrPosition?: string; // e.g. "ថ្នាក់ទី ៦ ក" or "គ្រូបង្រៀនគណិត"
  gender?: 'male' | 'female' | 'M' | 'F' | 'ប្រុស' | 'ស្រី';
  role: GroupMemberRole;
  joinedDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface SchoolGroup {
  id: string;
  name: string; // e.g. "ក្លឹបបច្ចេកវិទ្យា និង STEM"
  nameEnglish?: string;
  code: string; // e.g. "CLUB-STEM-01"
  category: SchoolGroupCategory;
  description?: string;
  academicYear: string; // e.g. "២០២៤ - ២០២៥"
  meetingSchedule?: string; // e.g. "រៀងរាល់រសៀលថ្ងៃព្រហស្បតិ៍ ម៉ោង 2:00 - 4:00"
  locationRoom?: string; // e.g. "បន្ទប់កុំព្យូទ័រ / បណ្ណាល័យ"
  colorTheme?: 'emerald' | 'sky' | 'indigo' | 'purple' | 'amber' | 'rose' | 'teal';
  iconName?: string;
  status: 'active' | 'archived';
  members: SchoolGroupMember[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}
