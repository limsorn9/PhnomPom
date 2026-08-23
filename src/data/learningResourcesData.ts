export type ResourceTag =
  | 'Interactive'
  | 'Video'
  | 'Worksheet'
  | 'Reading'
  | 'Math Practice'
  | 'Exam Prep';

export interface VideoLessonItem {
  number: number;
  title: string;
}

export interface LearningResourceItem {
  id: string;
  type: 'platform' | 'video';
  grade?: number; // 1 to 6 or undefined for platforms
  subject?: 'khmer' | 'math' | 'all';
  titleKhmer: string;
  titleEnglish: string;
  subjectNameKhmer: string;
  url: string;
  descriptionKhmer: string;
  badgeColor: string;
  gradientBg: string;
  iconBg: string;
  category: 'primary_platform' | 'digital_school' | 'grade_video';
  tags: ResourceTag[];
  totalLessons?: number;
  lessonsList?: VideoLessonItem[];
  isCustomImported?: boolean;
}

export interface TeacherPrivateNote {
  resourceId: string;
  title?: string;
  strategyCategory: 'វិធីសាស្ត្របង្រៀន' | 'សកម្មភាពសិស្ស' | 'កិច្ចការផ្ទះ & រង្វាយតម្លៃ' | 'ការសម្រួលសិស្សខ្សោយ' | 'ទូទៅ';
  noteContent: string;
  targetClass?: string;
  nextLessonDate?: string;
  keyPoints?: string[];
  updatedAt: string;
}

export interface ResourceProgressTracker {
  resourceId: string;
  completedCount: number;
  totalLessons: number;
  completedLessonNumbers?: number[];
  lastTopicCovered?: string;
  updatedAt: string;
}

export interface ResourceComment {
  id: string;
  resourceId: string;
  authorName: string;
  authorRole: string;
  gradeOrClass?: string;
  content: string;
  tag: 'គន្លឹះបង្រៀន' | 'សកម្មភាពក្នុងថ្នាក់' | 'កិច្ចការផ្ទះ' | 'ល្បែងសិក្សា' | 'មតិទូទៅ';
  createdAt: string;
  likes: number;
}

export interface ResourceRatingData {
  resourceId: string;
  totalVotes: number;
  sumScore: number;
  userVote?: number; // Current user's vote if cast
}

export const ALL_LEARNING_RESOURCES: LearningResourceItem[] = [
  {
    id: 'plp',
    type: 'platform',
    subject: 'all',
    titleKhmer: 'ថ្នាលបឋម (Primary Learning Platform)',
    titleEnglish: 'MoEYS Primary Learning Platform (PLP)',
    subjectNameKhmer: 'ថ្នាលជាតិបឋមសិក្សា',
    url: 'https://plp.moeys.gov.kh/',
    descriptionKhmer: 'កម្មវិធីអំណាន និងគណិតវិទ្យាថ្នាក់ដំបូង របស់ក្រសួងអប់រំ យុវជន និងកីឡា សម្រាប់គាំទ្រការរៀននិងបង្រៀនកម្រិតបឋមសិក្សា រួមមានសៀវភៅជំនួយ កញ្ចប់សម្ភារៈ និងវិធីសាស្ត្របង្រៀនស្តង់ដារ។',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    gradientBg: 'from-emerald-50/90 via-white to-teal-50/40',
    iconBg: 'bg-emerald-600 text-white',
    category: 'primary_platform',
    tags: ['Interactive', 'Worksheet', 'Reading', 'Math Practice'],
    totalLessons: 40
  },
  {
    id: 'sala',
    type: 'platform',
    subject: 'all',
    titleKhmer: 'សាលាឌីជីថល (Sala Digital MoEYS)',
    titleEnglish: 'Sala Digital Platform MoEYS',
    subjectNameKhmer: 'ថ្នាលស្វ័យសិក្សាជាតិ',
    url: 'https://sala.moeys.gov.kh/kh',
    descriptionKhmer: 'ថ្នាលអប់រំឌីជីថលស្វ័យសិក្សា និងសៀវភៅសិក្សាអេឡិចត្រូនិក វិញ្ញាសា និងវីដេអូការរៀនបង្រៀនទូទាំងប្រទេស សម្រាប់សិស្សានុសិស្សគ្រប់កម្រិតថ្នាក់ និងគ្រូបង្រៀន។',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gradientBg: 'from-indigo-50/90 via-white to-blue-50/40',
    iconBg: 'bg-indigo-600 text-white',
    category: 'digital_school',
    tags: ['Interactive', 'Video', 'Exam Prep', 'Worksheet'],
    totalLessons: 50
  },
  {
    id: 'g1-khmer',
    type: 'video',
    grade: 1,
    subject: 'khmer',
    titleKhmer: 'វីដេអូបង្រៀន ភាសាខ្មែរ ថ្នាក់ទី១',
    titleEnglish: 'Grade 1 Khmer Video Lessons',
    subjectNameKhmer: 'ភាសាខ្មែរ',
    url: 'https://link.moeys.gov.kh/Grade1khmer',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនអំណាន ព្យញ្ជនៈ ស្រៈ ព្យាង្គ និងសំណេរភាសាខ្មែរថ្នាក់ដំបូង តាមកម្មវិធីសិក្សាគោល MoEYS។',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    gradientBg: 'from-rose-50/90 via-white to-pink-50/30',
    iconBg: 'bg-rose-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Reading', 'Interactive'],
    totalLessons: 32,
    lessonsList: [
      { number: 1, title: 'ព្យញ្ជនៈពួក (អ) ក ខ គ ឃ ង' },
      { number: 2, title: 'ព្យញ្ជនៈពួក (អ៊) ច ឆ ជ ឈ ញ' },
      { number: 3, title: 'ស្រៈនិស្ស័យ អា អិ អី អក្សរផ្ចង់' },
      { number: 4, title: 'ការផ្សំប្រកបព្យាង្គស្រៈ' },
      { number: 5, title: 'ការអានពាក្យពីរព្យាង្គ' },
      { number: 6, title: 'ការតែងល្បះខ្លីៗ' }
    ]
  },
  {
    id: 'g1-math',
    type: 'video',
    grade: 1,
    subject: 'math',
    titleKhmer: 'វីដេអូបង្រៀន គណិតវិទ្យា ថ្នាក់ទី១',
    titleEnglish: 'Grade 1 Mathematics Video Lessons',
    subjectNameKhmer: 'គណិតវិទ្យា',
    url: 'https://link.moeys.gov.kh/Grade1Math',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនគណិតវិទ្យាថ្នាក់ដំបូង ការរាប់ចំនួនពី ១ ដល់ ១០០ លេខបូក ដក និងរូបធរណីមាត្រមូលដ្ឋាន។',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    gradientBg: 'from-blue-50/90 via-white to-indigo-50/30',
    iconBg: 'bg-blue-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Math Practice', 'Interactive'],
    totalLessons: 28,
    lessonsList: [
      { number: 1, title: 'ចំនួនពី ១ ដល់ ១០ និងការរាប់វត្ថុ' },
      { number: 2, title: 'ការប្រៀបធៀបធំជាង តូចជាង ឬស្មើ' },
      { number: 3, title: 'ប្រមាណវិធីបូកត្រឹម ១០ តាមរូបភាព' },
      { number: 4, title: 'ប្រមាណវិធីដកត្រឹម ១០' },
      { number: 5, title: 'ចំនួនដល់ ២០ និងខ្ទង់ដប់' }
    ]
  },
  {
    id: 'g2-khmer',
    type: 'video',
    grade: 2,
    subject: 'khmer',
    titleKhmer: 'វីដេអូបង្រៀន ភាសាខ្មែរ ថ្នាក់ទី២',
    titleEnglish: 'Grade 2 Khmer Video Lessons',
    subjectNameKhmer: 'ភាសាខ្មែរ',
    url: 'https://link.moeys.gov.kh/Grade2khmer',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនភាសាខ្មែរថ្នាក់ទី២ ពាក្យផ្សំ ព្យាង្គតម្រួត ជើងអក្សរ លំហាត់អំណាន និងកថាខណ្ឌខ្លីៗ។',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    gradientBg: 'from-rose-50/90 via-white to-pink-50/30',
    iconBg: 'bg-rose-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Reading', 'Worksheet'],
    totalLessons: 30
  },
  {
    id: 'g2-math',
    type: 'video',
    grade: 2,
    subject: 'math',
    titleKhmer: 'វីដេអូបង្រៀន គណិតវិទ្យា ថ្នាក់ទី២',
    titleEnglish: 'Grade 2 Mathematics Video Lessons',
    subjectNameKhmer: 'គណិតវិទ្យា',
    url: 'https://link.moeys.gov.kh/Grade2Math',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនគណិតវិទ្យាថ្នាក់ទី២ ការបូកដកលេខដល់ខ្ទង់រយ មេលេខ និងប្រមាណវិធីគុណចែកបឋម។',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    gradientBg: 'from-blue-50/90 via-white to-indigo-50/30',
    iconBg: 'bg-blue-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Math Practice'],
    totalLessons: 26
  },
  {
    id: 'g3-khmer',
    type: 'video',
    grade: 3,
    subject: 'khmer',
    titleKhmer: 'វីដេអូបង្រៀន ភាសាខ្មែរ ថ្នាក់ទី៣',
    titleEnglish: 'Grade 3 Khmer Video Lessons',
    subjectNameKhmer: 'ភាសាខ្មែរ',
    url: 'https://link.moeys.gov.kh/Grade3khmer',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនភាសាខ្មែរថ្នាក់ទី៣ អំណានស្វែងយល់ន័យ វេយ្យាករណ៍ សញ្ញាវណ្ណយុត្តិ និងការតែងល្បះ។',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    gradientBg: 'from-rose-50/90 via-white to-pink-50/30',
    iconBg: 'bg-rose-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Reading', 'Worksheet'],
    totalLessons: 30
  },
  {
    id: 'g3-math',
    type: 'video',
    grade: 3,
    subject: 'math',
    titleKhmer: 'វីដេអូបង្រៀន គណិតវិទ្យា ថ្នាក់ទី៣',
    titleEnglish: 'Grade 3 Mathematics Video Lessons',
    subjectNameKhmer: 'គណិតវិទ្យា',
    url: 'https://link.moeys.gov.kh/Grade3Math',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនគណិតវិទ្យាថ្នាក់ទី៣ ចំនួនដល់ខ្ទង់ម៉ឺន ប្រមាណវិធីគុណ ចែក ប្រភាគមូលដ្ឋាន និងទម្ងន់។',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    gradientBg: 'from-blue-50/90 via-white to-indigo-50/30',
    iconBg: 'bg-blue-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Math Practice'],
    totalLessons: 28
  },
  {
    id: 'g4-khmer',
    type: 'video',
    grade: 4,
    subject: 'khmer',
    titleKhmer: 'វីដេអូបង្រៀន ភាសាខ្មែរ ថ្នាក់ទី៤',
    titleEnglish: 'Grade 4 Khmer Video Lessons',
    subjectNameKhmer: 'ភាសាខ្មែរ',
    url: 'https://link.moeys.gov.kh/Grade4khmer',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនភាសាខ្មែរថ្នាក់ទី៤ ការអានអត្ថបទ ការសរសេរតាមអាន វេយ្យាករណ៍ និងការតែងសេចក្តី។',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    gradientBg: 'from-rose-50/90 via-white to-pink-50/30',
    iconBg: 'bg-rose-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Reading', 'Worksheet'],
    totalLessons: 32
  },
  {
    id: 'g4-math',
    type: 'video',
    grade: 4,
    subject: 'math',
    titleKhmer: 'វីដេអូបង្រៀន គណិតវិទ្យា ថ្នាក់ទី៤',
    titleEnglish: 'Grade 4 Mathematics Video Lessons',
    subjectNameKhmer: 'គណិតវិទ្យា',
    url: 'https://link.moeys.gov.kh/Grade4Math',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនគណិតវិទ្យាថ្នាក់ទី៤ ប្រភាគ ចំនួនទសភាគ រង្វាស់រង្វាល់ ពេលវេលា និងធរណីមាត្រ។',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    gradientBg: 'from-blue-50/90 via-white to-indigo-50/30',
    iconBg: 'bg-blue-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Math Practice', 'Worksheet'],
    totalLessons: 30
  },
  {
    id: 'g5-khmer',
    type: 'video',
    grade: 5,
    subject: 'khmer',
    titleKhmer: 'វីដេអូបង្រៀន ភាសាខ្មែរ ថ្នាក់ទី៥',
    titleEnglish: 'Grade 5 Khmer Video Lessons',
    subjectNameKhmer: 'ភាសាខ្មែរ',
    url: 'https://link.moeys.gov.kh/Grade5khmer',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនភាសាខ្មែរថ្នាក់ទី៥ អក្សរសិល្ប៍ វេយ្យាករណ៍កម្រិតខ្ពស់ និងការសរសេរតែងសេចក្តីពិពណ៌នា។',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    gradientBg: 'from-rose-50/90 via-white to-pink-50/30',
    iconBg: 'bg-rose-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Reading', 'Exam Prep'],
    totalLessons: 34
  },
  {
    id: 'g5-math',
    type: 'video',
    grade: 5,
    subject: 'math',
    titleKhmer: 'វីដេអូបង្រៀន គណិតវិទ្យា ថ្នាក់ទី៥',
    titleEnglish: 'Grade 5 Mathematics Video Lessons',
    subjectNameKhmer: 'គណិតវិទ្យា',
    url: 'https://link.moeys.gov.kh/Grade5Math',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនគណិតវិទ្យាថ្នាក់ទី៥ ផលធៀប ភាគរយ ផ្ទៃក្រឡា និងមាឌរូបធរណីមាត្រ។',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    gradientBg: 'from-blue-50/90 via-white to-indigo-50/30',
    iconBg: 'bg-blue-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Math Practice', 'Exam Prep'],
    totalLessons: 32
  },
  {
    id: 'g6-khmer',
    type: 'video',
    grade: 6,
    subject: 'khmer',
    titleKhmer: 'វីដេអូបង្រៀន ភាសាខ្មែរ ថ្នាក់ទី៦',
    titleEnglish: 'Grade 6 Khmer Video Lessons',
    subjectNameKhmer: 'ភាសាខ្មែរ',
    url: 'https://link.moeys.gov.kh/Grade6khmer',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនភាសាខ្មែរថ្នាក់ទី៦ ត្រៀមប្រឡងបញ្ចប់ភូមិសិក្សាបឋមសិក្សា អត្ថបទវិភាគ និងវេយ្យាករណ៍។',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    gradientBg: 'from-rose-50/90 via-white to-pink-50/30',
    iconBg: 'bg-rose-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Reading', 'Exam Prep', 'Worksheet'],
    totalLessons: 36
  },
  {
    id: 'g6-math',
    type: 'video',
    grade: 6,
    subject: 'math',
    titleKhmer: 'វីដេអូបង្រៀន គណិតវិទ្យា ថ្នាក់ទី៦',
    titleEnglish: 'Grade 6 Mathematics Video Lessons',
    subjectNameKhmer: 'គណិតវិទ្យា',
    url: 'https://link.moeys.gov.kh/Grade6Math',
    descriptionKhmer: 'បណ្ដុំវីដេអូបង្រៀនគណិតវិទ្យាថ្នាក់ទី៦ គណិតវិទ្យាអនុវត្ត ចំណោទស្មុគស្មាញ ស្ថិតិ និងត្រៀមប្រឡងបញ្ចប់ភូមិសិក្សា។',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    gradientBg: 'from-blue-50/90 via-white to-indigo-50/30',
    iconBg: 'bg-blue-600 text-white',
    category: 'grade_video',
    tags: ['Video', 'Math Practice', 'Exam Prep', 'Worksheet'],
    totalLessons: 36
  }
];

export const AVAILABLE_TAGS: { id: ResourceTag; labelKh: string; labelEn: string; color: string }[] = [
  { id: 'Interactive', labelKh: 'អន្តរកម្ម (Interactive)', labelEn: 'Interactive', color: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100' },
  { id: 'Video', labelKh: 'វីដេអូ (Video)', labelEn: 'Video', color: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' },
  { id: 'Worksheet', labelKh: 'សន្លឹកកិច្ចការ (Worksheet)', labelEn: 'Worksheet', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
  { id: 'Reading', labelKh: 'អំណាន (Reading)', labelEn: 'Reading', color: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100' },
  { id: 'Math Practice', labelKh: 'លំហាត់គណិត (Math)', labelEn: 'Math Practice', color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100' },
  { id: 'Exam Prep', labelKh: 'ត្រៀមប្រឡង (Exam Prep)', labelEn: 'Exam Prep', color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' }
];

export const INITIAL_RESOURCE_RATINGS: Record<string, ResourceRatingData> = {
  plp: { resourceId: 'plp', totalVotes: 28, sumScore: 137 },
  sala: { resourceId: 'sala', totalVotes: 22, sumScore: 106 },
  'g1-khmer': { resourceId: 'g1-khmer', totalVotes: 19, sumScore: 94 },
  'g1-math': { resourceId: 'g1-math', totalVotes: 16, sumScore: 78 },
  'g2-khmer': { resourceId: 'g2-khmer', totalVotes: 14, sumScore: 68 },
  'g2-math': { resourceId: 'g2-math', totalVotes: 15, sumScore: 73 },
  'g3-khmer': { resourceId: 'g3-khmer', totalVotes: 12, sumScore: 58 },
  'g3-math': { resourceId: 'g3-math', totalVotes: 14, sumScore: 68 },
  'g4-khmer': { resourceId: 'g4-khmer', totalVotes: 11, sumScore: 53 },
  'g4-math': { resourceId: 'g4-math', totalVotes: 13, sumScore: 64 },
  'g5-khmer': { resourceId: 'g5-khmer', totalVotes: 15, sumScore: 74 },
  'g5-math': { resourceId: 'g5-math', totalVotes: 17, sumScore: 84 },
  'g6-khmer': { resourceId: 'g6-khmer', totalVotes: 24, sumScore: 118 },
  'g6-math': { resourceId: 'g6-math', totalVotes: 26, sumScore: 128 }
};

export const INITIAL_RESOURCE_COMMENTS: ResourceComment[] = [
  {
    id: 'c-plp-1',
    resourceId: 'plp',
    authorName: 'អ្នកគ្រូ សែម ស្រីអឿន',
    authorRole: 'គ្រូបង្រៀនថ្នាក់ទី១',
    gradeOrClass: 'ថ្នាក់ទី ១ក',
    content: 'ខ្ញុំតែងតែទាញយកកាតពាក្យ និងសៀវភៅជំនួយពីថ្នាលបឋម PLP មកបោះពុម្ពបិទជញ្ជាំងថ្នាក់រៀន សិស្សចូលចិត្ត និងឆាប់ចាំស្រៈ ព្យញ្ជនៈណាស់!',
    tag: 'គន្លឹះបង្រៀន',
    createdAt: '2026-03-12 09:30',
    likes: 12
  },
  {
    id: 'c-sala-1',
    resourceId: 'sala',
    authorName: 'លោកគ្រូ ចាន់ ណារិទ្ធ',
    authorRole: 'គ្រូបង្រៀនថ្នាក់ទី៦',
    gradeOrClass: 'ថ្នាក់ទី ៦ក',
    content: 'សម្រាប់សិស្សត្រៀមប្រឡងបញ្ចប់ភូមិសិក្សា ខ្ញុំបានណែនាំអាណាព្យាបាលឱ្យកូនៗចូលសាលាឌីជីថលធ្វើវិញ្ញាសាសាកល្បងនៅផ្ទះ ល្អខ្លាំងណាស់។',
    tag: 'កិច្ចការផ្ទះ',
    createdAt: '2026-03-15 14:10',
    likes: 9
  },
  {
    id: 'c-g1-khmer-1',
    resourceId: 'g1-khmer',
    authorName: 'អ្នកគ្រូ អ៊ុក សោភា',
    authorRole: 'គ្រូបង្រៀនថ្នាក់ទី១',
    gradeOrClass: 'ថ្នាក់ទី ១ខ',
    content: 'បើកវីដេអូអក្សរចម្រៀង ៥នាទីដំបូងមុនចាប់ផ្តើមមេរៀន ធ្វើឱ្យសិស្សរំភើប និងមានស្មារតីចង់រៀនខ្លាំង។',
    tag: 'សកម្មភាពក្នុងថ្នាក់',
    createdAt: '2026-03-18 08:15',
    likes: 7
  },
  {
    id: 'c-g1-math-1',
    resourceId: 'g1-math',
    authorName: 'លោកគ្រូ សុខ វិទ្យា',
    authorRole: 'គ្រូបង្រៀនថ្នាក់ទី១',
    gradeOrClass: 'ថ្នាក់ទី ១ក',
    content: 'វីដេអូគណិតទី១ មានចលនារាប់ផ្លែឈើ និងសត្វគួរឱ្យស្រឡាញ់ សិស្សយល់ពីការបូកដកតាមរូបភាពបានរហ័ស។',
    tag: 'ល្បែងសិក្សា',
    createdAt: '2026-03-19 11:20',
    likes: 5
  },
  {
    id: 'c-g6-math-1',
    resourceId: 'g6-math',
    authorName: 'លោកគ្រូ កែវ សំណាង',
    authorRole: 'គ្រូបង្រៀនថ្នាក់ទី៦',
    gradeOrClass: 'ថ្នាក់ទី ៦ខ',
    content: 'គន្លឹះដោះស្រាយចំណោទស្មុគស្មាញលើផ្ទៃក្រឡា និងមាឌក្នុងវីដេអូនេះ ពន្យល់ក្បោះក្បាយណាស់ សិស្សខ្សោយក៏អាចតាមទាន់ដែរ។',
    tag: 'គន្លឹះបង្រៀន',
    createdAt: '2026-03-20 16:45',
    likes: 11
  }
];

export const INITIAL_TEACHER_NOTES: Record<string, TeacherPrivateNote> = {
  plp: {
    resourceId: 'plp',
    title: 'ផែនការប្រើប្រាស់សម្ភារៈអំណាន PLP សម្រាប់កុមាររៀនយឺត',
    strategyCategory: 'ការសម្រួលសិស្សខ្សោយ',
    noteContent: '• ទាញយកកាតពាក្យ និងសន្លឹកកិច្ចការគូសភ្ជាប់រូបភាពជាមួយព្យញ្ជនៈ\n• ប្រើវិធីសាស្ត្រ «រៀនផង លេងផង» ក្នុងម៉ោងស្វ័យសិក្សា ១៥នាទីរៀងរាល់រសៀល\n• លើកទឹកចិត្តសិស្សដោយផ្តល់ផ្កាយលើសៀវភៅតាមដាន',
    targetClass: 'ថ្នាក់ទី ១ក & ១ខ',
    nextLessonDate: '2026-03-25',
    keyPoints: ['បោះពុម្ពកាតពាក្យ', 'បែងចែកក្រុមសិស្ស ៤នាក់/ក្រុម', 'តាមដានការបញ្ចេញសំឡេងស្រៈ'],
    updatedAt: '2026-03-20 14:30'
  },
  'g1-khmer': {
    resourceId: 'g1-khmer',
    title: 'យុទ្ធសាស្ត្របង្រៀនព្យញ្ជនៈ តាមវីដេអូចម្រៀង MoEYS',
    strategyCategory: 'វិធីសាស្ត្របង្រៀន',
    noteContent: '• បើកវីដេអូភាគទី ៣ រយៈពេល ៣ នាទីដំបូង\n• ឱ្យសិស្សទះដៃតាមចង្វាក់ និងបញ្ចេញសំឡេងព្យញ្ជនៈ (ក ខ គ ឃ ង)\n• ឱ្យសិស្សឡើងសរសេរលើក្តារខៀនតូចរៀងៗខ្លួន',
    targetClass: 'ថ្នាក់ទី ១ក',
    nextLessonDate: '2026-03-26',
    keyPoints: ['ត្រៀមក្តារខៀនតូច', 'រៀបចំចាក់វីដេអូតាមទូរទស្សន៍ឆ្លាតវៃ'],
    updatedAt: '2026-03-21 09:15'
  }
};

export const INITIAL_PLAYLIST_PROGRESS: Record<string, ResourceProgressTracker> = {
  'g1-khmer': {
    resourceId: 'g1-khmer',
    totalLessons: 32,
    completedCount: 12,
    completedLessonNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    lastTopicCovered: 'មេរៀនទី១២: ស្រៈផ្សំ អៀ អឿ អួ',
    updatedAt: '2026-03-22 10:00'
  },
  'g1-math': {
    resourceId: 'g1-math',
    totalLessons: 28,
    completedCount: 14,
    completedLessonNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    lastTopicCovered: 'មេរៀនទី១៤: ការបូកលេខត្រឹម ២០',
    updatedAt: '2026-03-21 11:30'
  },
  'g6-math': {
    resourceId: 'g6-math',
    totalLessons: 36,
    completedCount: 22,
    completedLessonNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    lastTopicCovered: 'មេរៀនទី២២: ផ្ទៃក្រឡាត្រីកោណ និងចតុកោណកែង',
    updatedAt: '2026-03-19 16:20'
  },
  plp: {
    resourceId: 'plp',
    totalLessons: 40,
    completedCount: 18,
    completedLessonNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    lastTopicCovered: 'កញ្ចប់សកម្មភាពអំណានកម្រិតទី២',
    updatedAt: '2026-03-20 15:00'
  }
};

