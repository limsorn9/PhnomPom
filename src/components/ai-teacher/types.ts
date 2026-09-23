export type AITeacherSubTab = 
  | 'dashboard'
  | 'moeys_standards'
  | 'weekly_lesson'
  | 'lesson_slide'
  | 'curriculum'
  | 'test_generator'
  | 'educational_game'
  | 'saved_resources';

export type StudentLevel = 'beginner' | 'average' | 'advanced' | 'mixed';
export type TeachingStyle = 'visual' | 'interactive' | 'discussion' | 'project_based' | 'game_based' | 'traditional';

export interface WeeklyLessonPlanFormInput {
  subject: string;
  grade: number;
  weekNumber: number;
  semester: 'semester_1' | 'semester_2';
  academicYear: string;
  themeUnit: string;
  teachingDaysCount: number; // 5 days (Mon-Fri) or 6 days (Mon-Sat)
  periodsPerDay: number;
  studentLevel: StudentLevel;
  teachingStyle: TeachingStyle;
  curriculumReference?: string;
  coreObjectives: string;
  materialsInClass: string;
}

export interface WeeklyLessonDayItem {
  id: string;
  dayIndex: number;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  dayNameKh: string;
  lessonNumber: string;
  topicTitle: string;
  periodsCount: number;
  objectives: {
    knowledge: string;
    skills: string;
    attitude: string;
  };
  teachingSteps: {
    step1_admin: string;
    step2_review: string;
    step3_newLesson: string;
    step4_consolidation: string;
    step5_homework: string;
  };
  materials: string[];
  assessmentMethod: string;
  differentiatedSupport: {
    slowLearners: string;
    fastLearners: string;
  };
  notes?: string;
}

export interface AIWeeklyLessonPlan {
  id: string;
  title: string;
  grade: number;
  subject: string;
  weekNumber: number;
  semester: 'semester_1' | 'semester_2';
  academicYear: string;
  themeUnit: string;
  totalPeriods: number;
  generalObjectives: string[];
  days: WeeklyLessonDayItem[];
  teachingAidsRequired: string[];
  weeklySummaryNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonPlanFormInput {
  subject: string;
  grade: number;
  topic: string;
  durationMinutes: number;
  language: 'khmer' | 'english';
  studentLevel: StudentLevel;
  learningObjective: string;
  studentCount: number;
  teachingStyle: TeachingStyle;
  materialsInClass: string;
  includeWarmup: boolean;
  includeActivities: boolean;
  includeQuestions: boolean;
  includeExercises: boolean;
  includeHomework: boolean;
  includeAssessment: boolean;
  includeSummary: boolean;
}

export interface LessonActivityStep {
  stepNumber: number;
  phase: 'warmup' | 'introduction' | 'explanation' | 'guided_practice' | 'group_activity' | 'individual_practice' | 'assessment' | 'homework' | 'summary';
  phaseNameKh: string;
  durationMinutes: number;
  teacherScript: string;
  studentActivity: string;
  teachingTools: string;
}

export interface AILessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  durationMinutes: number;
  language: 'khmer' | 'english';
  studentLevel: StudentLevel;
  teachingStyle: TeachingStyle;
  studentCount: number;
  objectives: string[];
  materialsList: string[];
  activities: LessonActivityStep[];
  teacherScriptSummary: string;
  studentActivitiesSummary: string;
  assessmentRubric: { criteria: string; weight: string; description: string }[];
  homework: { task: string; submissionDays: number; gradingGuide: string };
  summaryNotes: string;
  createdAt: string;
  updatedAt: string;
}

export type SlideTheme = 
  | 'modern_blue'
  | 'forest_emerald'
  | 'warm_amber'
  | 'royal_purple'
  | 'slate_dark'
  | 'clean_minimal';

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  layout: 'title' | 'bullets' | 'two_columns' | 'quote' | 'interactive_qa' | 'group_work' | 'summary_box';
  contentPoints: string[];
  secondaryContent?: string[];
  teacherNotes?: string;
  interactiveQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface AISlideDeck {
  id: string;
  lessonId?: string;
  title: string;
  subject: string;
  grade: number;
  theme: SlideTheme;
  slides: SlideItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumWeekItem {
  id: string;
  weekNumber: number;
  lessonNumber: number | string;
  lessonTitle: string;
  topic: string;
  teachingHours: number;
  learningObjectives: string;
  keyActivities: string;
  assessmentMethod: string;
  materials: string;
}

export interface AICurriculumPlan {
  id: string;
  title: string;
  subject: string;
  grade: number;
  semester: 'semester_1' | 'semester_2' | 'full_year';
  academicYear: string;
  totalWeeks: number;
  hoursPerWeek: number;
  studentLevel: StudentLevel;
  weeks: CurriculumWeekItem[];
  createdAt: string;
  updatedAt: string;
}

export type BloomLevel = 
  | 'knowledge' 
  | 'understanding' 
  | 'application' 
  | 'analysis' 
  | 'evaluation' 
  | 'creation';

export type QuestionType = 
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'matching'
  | 'short_answer'
  | 'essay'
  | 'problem_solving';

export interface TestBlueprintItem {
  bloomLevel: BloomLevel;
  bloomLevelKh: string;
  description: string;
  questionCount: number;
  marks: number;
  percentage: number;
}

export interface TestQuestionItem {
  id: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  bloomLevel: BloomLevel;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  correctAnswer: string;
  matchingPairs?: { left: string; right: string }[];
  explanation: string;
  markingRubric?: string;
}

export interface AITestPaper {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  totalMarks: number;
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  isStandardized: boolean;
  blueprint: TestBlueprintItem[];
  questions: TestQuestionItem[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

export type GameTemplateType = 
  | 'quiz'
  | 'matching'
  | 'memory'
  | 'word_puzzle'
  | 'flashcards'
  | 'true_false'
  | 'fill_blank'
  | 'classroom_competition'
  | 'adventure'
  | 'picker_wheel'
  | 'picker_duck_race'
  | 'picker_car_race'
  | 'picker_moto_race'
  | 'picker_horse_race'
  | 'picker_airplane_race'
  | 'picker_fish_race'
  | 'picker_rocket_race'
  | 'picker_mystery_box'
  | 'picker_lottery_ball'
  | 'picker_custom_ai';

export type PickerGameMode = 
  | 'wheel'
  | 'duck_race'
  | 'car_race'
  | 'moto_race'
  | 'airplane_race'
  | 'fish_race'
  | 'rocket_race'
  | 'mystery_box'
  | 'lottery_ball'
  | 'custom_ai';

export interface PickerCandidate {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  eliminated?: boolean;
  score?: number;
  grade?: number;
  classGroup?: string;
}

export interface AICustomGameTheme {
  id: string;
  themeNameKh: string;
  themeNameEn: string;
  description: string;
  characterEmoji: string;
  runnerEmojis: string[];
  trackType: 'water' | 'road' | 'dirt' | 'grass' | 'sky' | 'space' | 'coral';
  bgGradient: string;
  soundType: 'splash' | 'engine' | 'gallop' | 'whoosh' | 'tick';
  sampleQuestions: string[];
}

export interface GameQuestionCard {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  points: number;
  matchTarget?: string; // For matching / memory
}

export interface AIEducationalGame {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  gameType: GameTemplateType;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitSeconds: number;
  cardsOrQuestions: GameQuestionCard[];
  gameCode: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPlayer {
  id: string;
  name: string;
  score: number;
  answeredCount: number;
  streak: number;
  avatar: string;
  isOnline: boolean;
}

export interface AICreationItem {
  id: string;
  type: 'lesson' | 'slide' | 'curriculum' | 'test' | 'game' | 'weekly_lesson';
  typeNameKh: string;
  title: string;
  subject: string;
  grade: number;
  createdAt: string;
  updatedAt: string;
  payload: any;
}
