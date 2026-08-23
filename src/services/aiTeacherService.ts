import { 
  AILessonPlan, 
  LessonPlanFormInput, 
  AISlideDeck, 
  SlideTheme, 
  AICurriculumPlan, 
  AITestPaper, 
  TestQuestionItem, 
  BloomLevel, 
  QuestionType,
  AIEducationalGame, 
  GameTemplateType,
  AICreationItem,
  StudentLevel,
  WeeklyLessonPlanFormInput,
  WeeklyLessonDayItem,
  AIWeeklyLessonPlan
} from '../components/ai-teacher/types';
import { 
  getMoEYSSubjectCurriculum, 
  getLessonsBySubjectAndGrade, 
  MOEYS_MODEL_SCHOOL_STANDARDS 
} from '../data/moeysPrimaryCurriculum';

const STORAGE_KEY = 'phnom_pom_ai_teacher_creations_v1';

// Load saved creations from localStorage
export function getSavedAICreations(): AICreationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSeedCreations();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultSeedCreations();
  } catch (err) {
    console.error('Error loading AI creations:', err);
    return getDefaultSeedCreations();
  }
}

// Save creation item
export function saveAICreation(item: AICreationItem): void {
  try {
    const items = getSavedAICreations();
    const existingIndex = items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      items.unshift(item);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving AI creation:', err);
  }
}

// Delete creation item
export function deleteAICreation(id: string): void {
  try {
    const items = getSavedAICreations().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error deleting AI creation:', err);
  }
}

// API Generator Proxy
async function callAIGenerator(prompt: string, systemInstruction?: string): Promise<any> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        jsonMode: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server error');
    }

    const json = await response.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error('Invalid response structure');
  } catch (err: any) {
    console.warn('AI API failed, using intelligent built-in pedagogical generator fallback:', err.message);
    return null;
  }
}

// Generate general AI text or chat response
export async function generateAIChatResponse(prompt: string, systemInstruction?: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction: systemInstruction || 'អ្នកជាអ្នកជំនាញផ្នែកអប់រំ និងការបង្រៀននៅកម្ពុជា។ សូមឆ្លើយតបជាភាសាខ្មែរឱ្យបានក្បោះក្បាយ និងត្រឹមត្រូវ។',
        jsonMode: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Network error');
    }

    const json = await response.json();
    if (json.success && json.text) {
      return json.text;
    }
    return json.text || '';
  } catch (err: any) {
    console.warn('AI API call failed, using smart fallback response:', err);
    return '';
  }
}

/* ==========================================================================
   1. LESSON PLAN GENERATOR
   ========================================================================== */
export async function generateAILessonPlan(input: LessonPlanFormInput): Promise<AILessonPlan> {
  const moeysCurr = getMoEYSSubjectCurriculum(input.subject, input.grade);
  const matchedLessons = moeysCurr ? moeysCurr.chapters.flatMap(c => c.lessons).filter(l => l.title.includes(input.topic) || input.topic.includes(l.title)) : [];
  const matchedLesson = matchedLessons.length > 0 ? matchedLessons[0] : null;

  const moeysContext = moeysCurr ? `
Official MoEYS Textbook: ${moeysCurr.officialTextbookName} (${moeysCurr.academicYear})
Key Subject Objectives: ${moeysCurr.subjectGoals.join('; ')}
${matchedLesson ? `Matching Ministry Lesson: "${matchedLesson.title}" (${matchedLesson.hours} hours). Core Objectives: ${matchedLesson.learningObjectives.join('; ')}. Concepts: ${matchedLesson.keyConcepts.join(', ')}. Sample Exercises: ${matchedLesson.sampleQuestions.join(' | ')}` : ''}
` : '';

  const prompt = `
Generate a comprehensive, structured lesson plan for a Cambodian classroom according to Ministry of Education, Youth and Sport (MoEYS) standards and official curriculum.
${moeysContext}

Details:
- Subject: ${input.subject}
- Grade: ${input.grade}
- Topic: ${input.topic}
- Duration: ${input.durationMinutes} minutes
- Language: ${input.language}
- Student Level: ${input.studentLevel}
- Learning Objective: ${input.learningObjective || (matchedLesson ? matchedLesson.learningObjectives.join(' | ') : 'Auto-generate measurable SMART objectives in 3 domains: ចំណេះដឹង បំណិន ឥរិយាបថ')}
- Student Count: ${input.studentCount}
- Teaching Style: ${input.teachingStyle}
- Available Classroom Materials: ${input.materialsInClass || 'Whiteboard, Textbook, Posters, Slates'}
Include steps: Warm-up (${input.includeWarmup}), Activities (${input.includeActivities}), Q&A (${input.includeQuestions}), Exercises (${input.includeExercises}), Homework (${input.includeHomework}), Assessment (${input.includeAssessment}), Summary (${input.includeSummary}).

Return valid JSON with format:
{
  "title": "កិច្ចតែងការ៖ ...",
  "objectives": ["ចំណេះដឹង៖ ...", "បំណិន៖ ...", "ឥរិយាបថ៖ ..."],
  "materialsList": ["Item 1", "Item 2"],
  "activities": [
    {
      "stepNumber": 1,
      "phase": "warmup",
      "phaseNameKh": "កិច្ចចាប់ផ្តើម និងរំលឹកមេរៀនចាស់ (Warm-up)",
      "durationMinutes": 5,
      "teacherScript": "...",
      "studentActivity": "...",
      "teachingTools": "..."
    }
  ],
  "teacherScriptSummary": "...",
  "studentActivitiesSummary": "...",
  "assessmentRubric": [
    { "criteria": "...", "weight": "30%", "description": "..." }
  ],
  "homework": { "task": "...", "submissionDays": 2, "gradingGuide": "..." },
  "summaryNotes": "..."
}
`;

  const systemInstruction = `You are a certified master pedagogue in the Kingdom of Cambodia specializing in the primary curriculum of the Ministry of Education, Youth and Sport (MoEYS). All outputs must be in fluent, grammatically accurate Khmer language strictly following official MoEYS teaching methodology and textbook vocabulary.`;

  const aiResult = await callAIGenerator(prompt, systemInstruction);
  if (aiResult && aiResult.activities && Array.isArray(aiResult.activities)) {
    const lesson: AILessonPlan = {
      id: `lp-${Date.now()}`,
      title: aiResult.title || `កិច្ចតែងការ៖ ${input.topic} (ថ្នាក់ទី${input.grade})`,
      subject: input.subject,
      grade: input.grade,
      topic: input.topic,
      durationMinutes: input.durationMinutes,
      language: input.language,
      studentLevel: input.studentLevel,
      teachingStyle: input.teachingStyle,
      studentCount: input.studentCount,
      objectives: aiResult.objectives || [
        `សិស្សអាចកំណត់និយមន័យ និងពន្យល់ពី «${input.topic}» បានត្រឹមត្រូវ។`,
        `សិស្សអាចអនុវត្តលំហាត់ និងដោះស្រាយបញ្ហាទាក់ទងនឹងមេរៀនដោយផ្ទាល់។`,
        `បណ្ដុះស្មារតីសហការជាក្រុម និងការគិតបែបស៊ីជម្រៅក្នុងពេលសិក្សា។`
      ],
      materialsList: aiResult.materialsList || [
        `សៀវភៅពុម្ព${input.subject} ថ្នាក់ទី${input.grade} របស់ក្រសួងអប់រំ`,
        `ក្តារខៀន ហ្វឺត/ដីស និងប័ណ្ណរូបភាពបង្ហាញ`,
        `សន្លឹកកិច្ចការបុគ្គល និងសន្លឹកកិច្ចការជាក្រុម`
      ],
      activities: aiResult.activities.map((act: any, idx: number) => ({
        stepNumber: idx + 1,
        phase: act.phase || 'explanation',
        phaseNameKh: act.phaseNameKh || getPhaseNameKh(act.phase),
        durationMinutes: Number(act.durationMinutes) || 5,
        teacherScript: act.teacherScript || 'គ្រូបកស្រាយពន្យល់ និងសួរសំណួរជំរុញការគិត...',
        studentActivity: act.studentActivity || 'សិស្សស្តាប់ដោយយកចិត្តទុកដាក់ និងចូលរួមឆ្លើយ...',
        teachingTools: act.teachingTools || 'សៀវភៅពុម្ព និងក្តារខៀន'
      })),
      teacherScriptSummary: aiResult.teacherScriptSummary || 'ជំរុញសិស្សឱ្យចូលរួមសកម្មភាពដោយភាពក្លាហាន និងរាក់ទាក់។',
      studentActivitiesSummary: aiResult.studentActivitiesSummary || 'សិស្សអនុវត្តជាដៃគូ និងជាក្រុមតូចៗដើម្បីផ្លាស់ប្តូរយោបល់។',
      assessmentRubric: aiResult.assessmentRubric || [
        { criteria: 'ការចូលរួម និងការឆ្លើយសំណួរ', weight: '30%', description: 'ឆ្លើយត្រូវ និងមានភាពសកម្មក្នុងការពិភាក្សា' },
        { criteria: 'ភាពត្រឹមត្រូវនៃលំហាត់អនុវត្ត', weight: '50%', description: 'ដោះស្រាយលំហាត់បានត្រឹមត្រូវតាមលំដាប់លំដោយ' },
        { criteria: 'វិន័យ និងការសហការជាក្រុម', weight: '20%', description: 'គោរពពេលវេលា និងជួយមិត្តរួមក្រុម' }
      ],
      homework: aiResult.homework || {
        task: `ធ្វើលំហាត់បន្ថែមទំព័រទី ${Math.floor(Math.random() * 20) + 10} ក្នុងសៀវភៅលំហាត់ និងកត់ត្រាចំណុចឆ្ងល់។`,
        submissionDays: 2,
        gradingGuide: 'កែរួមគ្នានៅដើមម៉ោងបន្ទាប់'
      },
      summaryNotes: aiResult.summaryNotes || `មេរៀននេះជាមូលដ្ឋានគ្រឹះដ៏សំខាន់សម្រាប់ជំពូកបន្ត។ គ្រូត្រូវតាមដានសិស្សរៀនយឺតឱ្យបានដិតដល់។`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return lesson;
  }

  // Fallback intelligent pedagogical builder
  return createFallbackLessonPlan(input);
}

function getPhaseNameKh(phase: string): string {
  switch (phase) {
    case 'warmup': return 'ជំហានទី១៖ កិច្ចចាប់ផ្តើម និងរំលឹកមេរៀនចាស់ (Warm-up)';
    case 'introduction': return 'ជំហានទី២៖ ការណែនាំមេរៀនថ្មី និងចំណងជើង (Introduction)';
    case 'explanation': return 'ជំហានទី៣៖ ការបង្រៀនខ្លឹមសារមេរៀនផ្ទាល់ (Direct Instruction)';
    case 'guided_practice': return 'ជំហានទី៤៖ ការអនុវត្តដោយមានការណែនាំពីគ្រូ (Guided Practice)';
    case 'group_activity': return 'ជំហានទី៥៖ សកម្មភាពពិភាក្សា និងអនុវត្តជាក្រុម (Group Activity)';
    case 'individual_practice': return 'ជំហានទី៦៖ ការអនុវត្តលំហាត់ផ្ទាល់ខ្លួន (Independent Practice)';
    case 'assessment': return 'ជំហានទី៧៖ ការវាយតម្លៃ និងតេស្តខ្លី (Formative Assessment)';
    case 'summary': return 'ជំហានទី៨៖ សង្ខេបគន្លឹះសំខាន់ៗនៃមេរៀន (Lesson Summary)';
    case 'homework': return 'ជំហានទី៩៖ ការដាក់កិច្ចការផ្ទះ និងការណែនាំ (Homework)';
    default: return 'សកម្មភាពបង្រៀន និងរៀន';
  }
}

function createFallbackLessonPlan(input: LessonPlanFormInput): AILessonPlan {
  const steps: any[] = [];
  let stepIdx = 1;

  if (input.includeWarmup) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'warmup',
      phaseNameKh: 'ជំហានទី១៖ កិច្ចចាប់ផ្តើម និងរំលឹកមេរៀនចាស់ (Warm-up & Review)',
      durationMinutes: 5,
      teacherScript: `«សួស្តីកូនៗទាំងអស់គ្នា! តើកាលពីម៉ោងមុនយើងបានរៀនអំពីអ្វីខ្លះ? តើអ្នកណាអាចចាំបាន?» គ្រូសួរសំណួរខ្លីៗ និងលើកទឹកចិត្តសិស្សឱ្យឆ្លើយ។`,
      studentActivity: `សិស្សក្រោកឡើងឆ្លើយសំណួររំលឹកមេរៀនចាស់ និងបញ្ចេញមតិដោយភាពក្លាហាន។`,
      teachingTools: `ក្តារខៀន និងប័ណ្ណពាក្យគន្លឹះ`
    });
  }

  steps.push({
    stepNumber: stepIdx++,
    phase: 'introduction',
    phaseNameKh: 'ជំហានទី២៖ ការណែនាំមេរៀនថ្មី និងគោលបំណង (Introduction & Hook)',
    durationMinutes: 5,
    teacherScript: `«ថ្ងៃនេះយើងនឹងសិក្សាទាំងអស់គ្នាលើប្រធានបទ ៖ ${input.topic}។ បន្ទាប់ពីរៀនចប់ កូនៗនឹងយល់ច្បាស់ និងអាចអនុវត្តជាក់ស្តែងបាន!»`,
    studentActivity: `សិស្សស្តាប់ ពិនិត្យមើលរូបភាព ឬឧទាហរណ៍លើក្តារខៀន និងកត់ត្រាចំណងជើងមេរៀនចូលសៀវភៅ។`,
    teachingTools: `រូបភាពបង្ហាញ ឬវត្ថុជាក់ស្តែង`
  });

  steps.push({
    stepNumber: stepIdx++,
    phase: 'explanation',
    phaseNameKh: 'ជំហានទី៣៖ ការបង្រៀនខ្លឹមសារមេរៀនផ្ទាល់ (Explanation & Core Concept)',
    durationMinutes: 15,
    teacherScript: `គ្រូពន្យល់លម្អិតអំពីនិយមន័យ គោលការណ៍សំខាន់ៗ និងបង្ហាញឧទាហរណ៍ជាក់ស្តែងចំនួន ៣ លើក្តារខៀន ព្រមទាំងសួរសំណួរត្រួតពិនិត្យការយល់ដឹងជាបន្តបន្ទាប់។`,
    studentActivity: `សិស្សតាមដានការបកស្រាយ សួរនូវចំណុចមិនទាន់ច្បាស់ និងកត់ត្រារូបមន្ត/ទ្រឹស្តីសំខាន់ៗ។`,
    teachingTools: `សៀវភៅពុម្ព ${input.subject} ថ្នាក់ទី${input.grade}, ហ្វឺតសរសេរ`
  });

  if (input.includeActivities) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'guided_practice',
      phaseNameKh: 'ជំហានទី៤៖ ការអនុវត្តរួមគ្នាជាមួយគ្រូ (Guided Practice)',
      durationMinutes: 10,
      teacherScript: `គ្រូនាំសិស្សធ្វើលំហាត់គំរូទី១ រួមគ្នា ដោយហៅសិស្ស ២-៣ នាក់មកសរសេរលើក្តារខៀន និងជួយកែតម្រូវភ្លាមៗ។`,
      studentActivity: `សិស្សចូលរួមគិត រកចម្លើយ និងផ្ទៀងផ្ទាត់លើក្តារខៀន។`,
      teachingTools: `ក្តារខៀន និងសន្លឹកកិច្ចការគំរូ`
    });

    steps.push({
      stepNumber: stepIdx++,
      phase: 'group_activity',
      phaseNameKh: 'ជំហានទី៥៖ សកម្មភាពអនុវត្តជាក្រុម (Collaborative Group Work)',
      durationMinutes: 10,
      teacherScript: `គ្រូបែងចែកសិស្សជាក្រុមតូចៗ (៤-៥ នាក់ក្នុងមួយក្រុម) និងចែកសន្លឹកកិច្ចការពិភាក្សា។ គ្រូដើរសម្របសម្រួល និងណែនាំក្រុមដែលជួបការលំបាក។`,
      studentActivity: `សិស្សក្នុងក្រុមសហការគ្នា ពិភាក្សា រកដំណោះស្រាយ និងចាត់តំណាងក្រុមឡើងរាយការណ៍។`,
      teachingTools: `ក្រដាសផ្ទាំងធំ (Flipchart) និងប៊ិចពណ៌`
    });
  }

  if (input.includeExercises) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'individual_practice',
      phaseNameKh: 'ជំហានទី៦៖ ការអនុវត្តលំហាត់ផ្ទាល់ខ្លួន (Independent Practice)',
      durationMinutes: 8,
      teacherScript: `«ឥឡូវនេះ សូមកូនៗម្នាក់ៗធ្វើលំហាត់លេខ ១ និងលេខ ២ ក្នុងសៀវភៅឱ្យបានស្ងប់ស្ងាត់!» គ្រូដើរពិនិត្យ និងកត់សម្គាល់សិស្សរៀនយឺត។`,
      studentActivity: `សិស្សធ្វើលំហាត់ដោយខ្លួនឯងដើម្បីពង្រឹងសមត្ថភាពផ្ទាល់ខ្លួន។`,
      teachingTools: `សៀវភៅសរសេរសិស្ស`
    });
  }

  if (input.includeAssessment) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'assessment',
      phaseNameKh: 'ជំហានទី៧៖ ការវាយតម្លៃរហ័សចុងម៉ោង (Exit Ticket / Quick Assessment)',
      durationMinutes: 5,
      teacherScript: `គ្រូចោទសួរសំណួរវាយតម្លៃរហ័ស ២ សំណួរ ដើម្បីវាស់ស្ទង់ថាតើសិស្សប៉ុន្មានភាគរយសម្រេចបានតាមគោលបំណងមេរៀន។`,
      studentActivity: `សិស្សសរសេរចម្លើយខ្លីៗលើក្តារឆ្នួន ឬសន្លឹកក្រដាសតូចប្រគល់ជូនគ្រូ។`,
      teachingTools: `ក្តារឆ្នួនសិស្ស ឬកាតវាយតម្លៃ`
    });
  }

  if (input.includeSummary) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'summary',
      phaseNameKh: 'ជំហានទី៨៖ សង្ខេបគន្លឹះមេរៀន (Lesson Recap & Reflection)',
      durationMinutes: 4,
      teacherScript: `គ្រូ និងសិស្សសង្ខេបឡើងវិញនូវចំណុចស្នូលនៃ «${input.topic}» និងសរសើរសិស្សដែលបានខិតខំប្រឹងប្រែង។`,
      studentActivity: `សិស្សឆ្លុះបញ្ចាំងពីអ្វីដែលខ្លួនបានរៀនថ្ងៃនេះ។`,
      teachingTools: `ដ្យាក្រាមសង្ខេបគំនិត`
    });
  }

  if (input.includeHomework) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'homework',
      phaseNameKh: 'ជំហានទី៩៖ ការដាក់កិច្ចការផ្ទះ (Homework Assignment)',
      durationMinutes: 3,
      teacherScript: `«សូមកូនៗកត់កិច្ចការផ្ទះនេះចូលសៀវភៅ ហើយយកមកបង្ហាញលោកគ្រូ/អ្នកគ្រូនៅម៉ោងក្រោយ!»`,
      studentActivity: `សិស្សកត់ត្រាកិច្ចការផ្ទះដោយយកចិត្តទុកដាក់។`,
      teachingTools: `សៀវភៅតាមដានការសិក្សា`
    });
  }

  return {
    id: `lp-${Date.now()}`,
    title: `កិច្ចតែងការបង្រៀន៖ ${input.topic} (ថ្នាក់ទី${input.grade})`,
    subject: input.subject,
    grade: input.grade,
    topic: input.topic,
    durationMinutes: input.durationMinutes,
    language: input.language,
    studentLevel: input.studentLevel,
    teachingStyle: input.teachingStyle,
    studentCount: input.studentCount,
    objectives: [
      `ចំណេះដឹង៖ សិស្សអាចកំណត់និយមន័យ និងពន្យល់ខ្លឹមសារសំខាន់ៗនៃ «${input.topic}» បានត្រឹមត្រូវយ៉ាងតិច ៨០%។`,
      `បំណិន៖ សិស្សចេះអនុវត្ត ដោះស្រាយលំហាត់ និងធ្វើការងារជាក្រុមប្រកបដោយប្រសិទ្ធភាព។`,
      `ឥរិយាបថ៖ បណ្ដុះទម្លាប់សហការ ស្រឡាញ់ការសិក្សា និងមានភាពស្មោះត្រង់ក្នុងការបំពេញកិច្ចការ។`
    ],
    materialsList: [
      `សៀវភៅសិក្សាគោល ${input.subject} ថ្នាក់ទី${input.grade} របស់ក្រសួងអប់រំ យុវជន និងកីឡា`,
      `ក្តារខៀន ហ្វឺតសរសេរ ឬដីសពណ៌`,
      `ប័ណ្ណរូបភាពបង្ហាញ និងសន្លឹកកិច្ចការក្រុម/បុគ្គល`,
      `សម្ភារៈបន្ទប់រៀន៖ ${input.materialsInClass || 'តុ កៅអី ក្តារខៀន'}`
    ],
    activities: steps,
    teacherScriptSummary: `រក្សាបរិយាកាសថ្នាក់រៀនឱ្យមានភាពរីករាយ សកម្ម និងលើកទឹកចិត្តដល់សិស្សគ្រប់កម្រិត។`,
    studentActivitiesSummary: `សិស្សបានចូលរួមឆ្លើយសំណួរ អនុវត្តជាក្រុម និងធ្វើស្វ័យវាយតម្លៃដោយខ្លួនឯង។`,
    assessmentRubric: [
      { criteria: 'ការយល់ដឹងអំពីខ្លឹមសារមេរៀន', weight: '40%', description: 'ឆ្លើយសំណួរ និងពន្យល់ខ្លឹមសារបានត្រឹមត្រូវ' },
      { criteria: 'បំណិនដោះស្រាយលំហាត់', weight: '40%', description: 'ធ្វើលំហាត់បានត្រឹមត្រូវតាមលំដាប់លំដោយ' },
      { criteria: 'ការចូលរួម និងវិន័យ', weight: '20%', description: 'សហការជាមួយមិត្ត និងគោរពបទបញ្ជាក្នុងថ្នាក់' }
    ],
    homework: {
      task: `ធ្វើលំហាត់ពង្រឹងសមត្ថភាពទំព័រទី ${Math.floor(Math.random() * 20) + 15} ក្នុងសៀវភៅលំហាត់ និងកត់ត្រាការសង្កេតជាក់ស្តែង។`,
      submissionDays: 2,
      gradingGuide: 'ពិនិត្យ និងកែរួមគ្នានៅដើមម៉ោងសិក្សាបន្ទាប់'
    },
    summaryNotes: `មេរៀននេះដើរតួយ៉ាងសំខាន់ក្នុងការកសាងមូលដ្ឋានគ្រឹះ។ ត្រូវរៀបចំការបង្រៀនបំប៉នបន្ថែមដល់សិស្សដែលនៅខ្សោយ។`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* ==========================================================================
   2. SLIDE DECK GENERATOR
   ========================================================================== */
export async function generateAISlideDeck(
  topic: string, 
  subject: string, 
  grade: number, 
  theme: SlideTheme = 'modern_blue',
  lessonPlan?: AILessonPlan
): Promise<AISlideDeck> {
  const prompt = `
Generate an engaging, structured classroom Slide Deck (10 slides) for Cambodian students.
Subject: ${subject}, Grade: ${grade}, Topic: ${topic}.
Theme: ${theme}.
Slides to include:
1. Title Slide
2. Learning Objectives
3. Warm-up Hook / Prior Knowledge
4. Key Concept & Theory
5. Real-world Examples & Demonstration
6. Interactive Question (with multiple choice options & answer)
7. Group Activity & Discussion Task
8. Guided Practice Exercises
9. Mini Quiz / Assessment
10. Key Takeaways & Summary

Return valid JSON with format:
{
  "title": "...",
  "slides": [
    {
      "slideNumber": 1,
      "title": "...",
      "subtitle": "...",
      "layout": "title",
      "contentPoints": ["..."],
      "secondaryContent": ["..."],
      "teacherNotes": "...",
      "interactiveQuestion": { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." }
    }
  ]
}
`;

  const aiResult = await callAIGenerator(prompt);
  if (aiResult && aiResult.slides && Array.isArray(aiResult.slides) && aiResult.slides.length > 0) {
    return {
      id: `sd-${Date.now()}`,
      lessonId: lessonPlan?.id,
      title: aiResult.title || `ស្លាយមេរៀន៖ ${topic} (ថ្នាក់ទី${grade})`,
      subject,
      grade,
      theme,
      slides: aiResult.slides.map((s: any, idx: number) => ({
        id: `s-${idx + 1}`,
        slideNumber: idx + 1,
        title: s.title || `ស្លាយទី ${idx + 1}`,
        subtitle: s.subtitle || '',
        layout: s.layout || 'bullets',
        contentPoints: Array.isArray(s.contentPoints) ? s.contentPoints : ['ចំណុចទី១...', 'ចំណុចទី២...'],
        secondaryContent: Array.isArray(s.secondaryContent) ? s.secondaryContent : [],
        teacherNotes: s.teacherNotes || '',
        interactiveQuestion: s.interactiveQuestion
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Fallback intelligent 10-slide builder
  return createFallbackSlideDeck(topic, subject, grade, theme, lessonPlan);
}

function createFallbackSlideDeck(
  topic: string, 
  subject: string, 
  grade: number, 
  theme: SlideTheme,
  lessonPlan?: AILessonPlan
): AISlideDeck {
  const slides: any[] = [
    {
      id: 's-1',
      slideNumber: 1,
      title: topic,
      subtitle: `មុខវិជ្ជា៖ ${subject} • ថ្នាក់ទី${grade} • សាលាបឋមសិក្សាភ្នំពុំ`,
      layout: 'title',
      contentPoints: [
        `ស្វាគមន៍មកកាន់ម៉ោងសិក្សា ${subject}`,
        `រៀបចំសៀវភៅ ប៊ិច និងស្មារតីឱ្យរួចរាល់!`
      ],
      teacherNotes: 'ស្វាគមន៍សិស្ស បង្កើតបរិយាកាសរីករាយ និងណែនាំមេរៀន។'
    },
    {
      id: 's-2',
      slideNumber: 2,
      title: '🎯 គោលបំណងមេរៀន (Learning Objectives)',
      subtitle: 'អ្វីដែលកូនៗនឹងទទួលបានក្រោយរៀនចប់៖',
      layout: 'bullets',
      contentPoints: lessonPlan?.objectives || [
        `យល់ច្បាស់ពីនិយមន័យ និងសារៈសំខាន់នៃ «${topic}»`,
        `ចេះអនុវត្ត និងដោះស្រាយលំហាត់បានត្រឹមត្រូវដោយផ្ទាល់`,
        `ចូលរួមសហការជាក្រុម និងអភិវឌ្ឍការគិតប្រកបដោយភាពច្នៃប្រឌិត`
      ],
      teacherNotes: 'អានគោលបំណងឱ្យសិស្សស្តាប់ និងពន្យល់ពីតម្លៃនៃមេរៀន។'
    },
    {
      id: 's-3',
      slideNumber: 3,
      title: '💡 រំលឹក និងចាប់ផ្តើម (Warm-up & Hook)',
      subtitle: 'តើកូនៗធ្លាប់បានជួបប្រទះរឿងនេះទេ?',
      layout: 'quote',
      contentPoints: [
        `«ចំណេះដឹងគឺជាគ្រឹះនៃភាពជោគជ័យ ចូររៀនដោយការស្វែងយល់ មិនមែនទន្ទេញចាំមាត់!»`,
        `ចូរក្រឡេកមើលជុំវិញខ្លួន និងចែករំលែកនូវអ្វីដែលអ្នកបានសង្កេតឃើញទាក់ទងនឹង ${topic}!`
      ],
      teacherNotes: 'សួរសំណួរជំរុញការគិត និងលើកទឹកចិត្តសិស្សឱ្យឆ្លើយ។'
    },
    {
      id: 's-4',
      slideNumber: 4,
      title: '📖 ខ្លឹមសារស្នូល (Key Concepts)',
      subtitle: 'ចំណុចសំខាន់ៗដែលត្រូវចងចាំ៖',
      layout: 'two_columns',
      contentPoints: [
        `និយមន័យ៖ ${topic} គឺជាផ្នែកមួយដ៏សំខាន់ក្នុងកម្មវិធីសិក្សា ${subject} ថ្នាក់ទី${grade}។`,
        `លក្ខណៈពិសេស៖ ជួយឱ្យយើងយល់ដឹងពីរបៀបដំណើរការ និងទំនាក់ទំនងក្នុងជីវភាពរស់នៅ។`
      ],
      secondaryContent: [
        `រូបមន្ត/ទ្រឹស្តីគន្លឹះ៖ ត្រូវអនុវត្តតាមលំដាប់លំដោយ និងមានហេតុផលត្រឹមត្រូវ។`,
        `ការកត់សម្គាល់៖ ប្រយ័ត្នចំពោះកំហុសឆ្គងទូទៅដែលសិស្សច្រើនតែច្រឡំ។`
      ],
      teacherNotes: 'ពន្យល់យឺតៗ ច្បាស់ៗ និងចង្អុលបង្ហាញឧទាហរណ៍លើស្លាយ។'
    },
    {
      id: 's-5',
      slideNumber: 5,
      title: '🔍 ឧទាហរណ៍ជាក់ស្តែង (Practical Demonstration)',
      subtitle: 'ការអនុវត្តជាក់ស្តែងក្នុងជីវភាពប្រចាំថ្ងៃ៖',
      layout: 'bullets',
      contentPoints: [
        `ឧទាហរណ៍ទី១៖ ការដោះស្រាយបញ្ហាសាមញ្ញជាជំហានៗ`,
        `ឧទាហរណ៍ទី២៖ ការអនុវត្តផ្ទាល់តាមវិធីសាស្ត្រត្រឹមត្រូវ`,
        `ការប្រៀបធៀប៖ ភាពខុសគ្នារវាងវិធីដោះស្រាយលឿន និងវិធីបុរាណ`
      ],
      teacherNotes: 'ធ្វើការបង្ហាញគំរូ និងឱ្យសិស្សផ្ទៀងផ្ទាត់។'
    },
    {
      id: 's-6',
      slideNumber: 6,
      title: '❓ សំណួរអន្តរកម្ម (Interactive Question)',
      subtitle: 'ចូរជ្រើសរើសចម្លើយដែលត្រឹមត្រូវបំផុត៖',
      layout: 'interactive_qa',
      contentPoints: [
        `សំណួរឆ្លើយតបរហ័សក្នុងថ្នាក់ដើម្បីត្រួតពិនិត្យការយល់ដឹង!`
      ],
      interactiveQuestion: {
        question: `តើចំណុចណាជាគោលការណ៍សំខាន់បំផុតក្នុងមេរៀន «${topic}»?`,
        options: [
          `ក. ការអនុវត្តតាមលំដាប់លំដោយត្រឹមត្រូវ`,
          `ខ. ការធ្វើឱ្យលឿនដោយមិនចាំបាច់ពិនិត្យ`,
          `គ. ការរំលងជំហានដោះស្រាយ`,
          `ឃ. គ្មានចម្លើយត្រឹមត្រូវ`
        ],
        correctIndex: 0,
        explanation: `ចម្លើយត្រឹមត្រូវគឺ ក. ព្រោះការអនុវត្តតាមលំដាប់លំដោយត្រឹមត្រូវធានានូវលទ្ធផលត្រឹមត្រូវ និងច្បាស់លាស់។`
      },
      teacherNotes: 'ឱ្យសិស្សលើកដៃ ឬសរសេរលើក្តារឆ្នួនមុននឹងបង្ហាញចម្លើយ។'
    },
    {
      id: 's-7',
      slideNumber: 7,
      title: '👥 សកម្មភាពជាក្រុម (Group Activity)',
      subtitle: 'ការសហការ និងដោះស្រាយបញ្ហារួមគ្នា (១០ នាទី)',
      layout: 'group_work',
      contentPoints: [
        `ភារកិច្ច៖ បែងចែកជា ៤ ក្រុមដើម្បីបំពេញសន្លឹកកិច្ចការពិភាក្សា`,
        `ច្បាប់ក្រុម៖ ម្នាក់ៗត្រូវមានតួនាទី (ប្រធានក្រុម អ្នកកត់ត្រា អ្នករាយការណ៍ អ្នកត្រួតពិនិត្យ)`,
        `លទ្ធផលរំពឹងទុក៖ រៀបចំចម្លើយលើក្រដាសផ្ទាំងធំ និងឡើងធ្វើបទបង្ហាញ`
      ],
      teacherNotes: 'ដើរជួយណែនាំតាមក្រុមនីមួយៗ និងរក្សាកម្រិតសំឡេងសមរម្យ។'
    },
    {
      id: 's-8',
      slideNumber: 8,
      title: '✍️ លំហាត់អនុវត្ត (Practice Exercises)',
      subtitle: 'ពង្រឹងសមត្ថភាពផ្ទាល់ខ្លួន៖',
      layout: 'bullets',
      contentPoints: [
        `លំហាត់ទី១៖ បំពេញចន្លោះ និងដោះស្រាយសំណួរត្រិះរិះ`,
        `លំហាត់ទី២៖ គណនា ឬពន្យល់បាតុភូតតាមបែបវិទ្យាសាស្ត្រ`,
        `សិស្សអាចពិគ្រោះយោបល់ជាមួយមិត្តជិតខាងបានប្រសិនបើជួបការលំបាក`
      ],
      teacherNotes: 'ផ្តល់ពេលវេលា ៧-៨ នាទីដល់សិស្សធ្វើលំហាត់។'
    },
    {
      id: 's-9',
      slideNumber: 9,
      title: '🏆 តេស្តសាកល្បងខ្លី (Mini Quiz)',
      subtitle: 'តេស្តវាយតម្លៃលទ្ធផលសិក្សារហ័ស៖',
      layout: 'bullets',
      contentPoints: [
        `សំណួរទី១៖ ពន្យល់ខ្លឹមសារសំខាន់នៃមេរៀនថ្ងៃនេះក្នុង ១ ប្រយោគ`,
        `សំណួរទី២៖ លើកឡើងនូវឧទាហរណ៍ ១ ដែលអ្នកអាចយកទៅប្រើនៅផ្ទះ`,
        `ចម្លើយត្រឹមត្រូវទទួលបានពិន្ទុលើកទឹកចិត្ត និងផ្កាយសរសើរ!`
      ],
      teacherNotes: 'កត់ត្រាសិស្សដែលយល់បានល្អដើម្បីលើកទឹកចិត្ត។'
    },
    {
      id: 's-10',
      slideNumber: 10,
      title: '🎉 សង្ខេប និងកិច្ចការផ្ទះ (Summary & Homework)',
      subtitle: 'អបអរសាទរ! កូនៗបានបញ្ចប់មេរៀនយ៉ាងល្អប្រសើរ',
      layout: 'summary_box',
      contentPoints: [
        `📌 ចំណុចសំខាន់៖ ចងចាំទ្រឹស្តី និងរូបមន្តគន្លឹះនៃ ${topic}`,
        `📚 កិច្ចការផ្ទះ៖ ធ្វើលំហាត់ទំព័រចុងក្រោយនៃសៀវភៅពុម្ព`,
        `⏰ ជួបគ្នានៅម៉ោងសិក្សាបន្ទាប់! សូមអរគុណកូនៗទាំងអស់គ្នា!`
      ],
      teacherNotes: 'ផ្តាំផ្ញើកិច្ចការផ្ទះ និងថ្លែងអំណរគុណដល់ការខិតខំរបស់សិស្ស។'
    }
  ];

  return {
    id: `sd-${Date.now()}`,
    lessonId: lessonPlan?.id,
    title: `ស្លាយមេរៀន៖ ${topic} (ថ្នាក់ទី${grade})`,
    subject,
    grade,
    theme,
    slides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* ==========================================================================
   3. CURRICULUM GENERATOR
   ========================================================================== */
export async function generateAICurriculumPlan(input: {
  subject: string;
  grade: number;
  semester: 'semester_1' | 'semester_2' | 'full_year';
  academicYear: string;
  totalWeeks: number;
  hoursPerWeek: number;
  topicsGuide?: string;
  studentLevel: StudentLevel;
}): Promise<AICurriculumPlan> {
  const prompt = `
Generate a structured, MoEYS-compliant Curriculum Breakdown Plan (បំណែងចែកកម្មវិធីសិក្សា) for Cambodia.
Subject: ${input.subject}, Grade: ${input.grade}, Semester: ${input.semester}, Total Weeks: ${input.totalWeeks}, Hours/Week: ${input.hoursPerWeek}.
Specific Topics/Guide: ${input.topicsGuide || 'Standard Cambodian primary/secondary curriculum'}.

Return valid JSON with format:
{
  "title": "...",
  "weeks": [
    {
      "weekNumber": 1,
      "lessonNumber": 1,
      "lessonTitle": "...",
      "topic": "...",
      "teachingHours": ${input.hoursPerWeek},
      "learningObjectives": "...",
      "keyActivities": "...",
      "assessmentMethod": "...",
      "materials": "..."
    }
  ]
}
`;

  const aiResult = await callAIGenerator(prompt);
  if (aiResult && aiResult.weeks && Array.isArray(aiResult.weeks) && aiResult.weeks.length > 0) {
    return {
      id: `curr-${Date.now()}`,
      title: aiResult.title || `បំណែងចែកកម្មវិធីសិក្សា ${input.subject} ថ្នាក់ទី${input.grade} (${input.academicYear})`,
      subject: input.subject,
      grade: input.grade,
      semester: input.semester,
      academicYear: input.academicYear,
      totalWeeks: input.totalWeeks,
      hoursPerWeek: input.hoursPerWeek,
      studentLevel: input.studentLevel,
      weeks: aiResult.weeks.map((w: any, idx: number) => ({
        id: `w-${idx + 1}`,
        weekNumber: idx + 1,
        lessonNumber: w.lessonNumber || Math.floor(idx / 2) + 1,
        lessonTitle: w.lessonTitle || `មេរៀនទី ${Math.floor(idx / 2) + 1}`,
        topic: w.topic || `ប្រធានបទសប្តាហ៍ទី ${idx + 1}`,
        teachingHours: Number(w.teachingHours) || input.hoursPerWeek,
        learningObjectives: w.learningObjectives || 'សិស្សយល់ដឹងពីទ្រឹស្តី និងចេះដោះស្រាយលំហាត់',
        keyActivities: w.keyActivities || 'ពន្យល់ បង្ហាញឧទាហរណ៍ និងអនុវត្តជាក្រុម',
        assessmentMethod: w.assessmentMethod || 'សង្កេត ពិនិត្យសៀវភៅ និងសំណួរផ្ទាល់មាត់',
        materials: w.materials || `សៀវភៅពុម្ព ${input.subject} ថ្នាក់ទី${input.grade}`
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Fallback intelligent curriculum builder
  return createFallbackCurriculumPlan(input);
}

function createFallbackCurriculumPlan(input: {
  subject: string;
  grade: number;
  semester: 'semester_1' | 'semester_2' | 'full_year';
  academicYear: string;
  totalWeeks: number;
  hoursPerWeek: number;
  studentLevel: StudentLevel;
}): AICurriculumPlan {
  const weeks: any[] = [];
  const moeysCurr = getMoEYSSubjectCurriculum(input.subject, input.grade);
  const realLessons = moeysCurr ? moeysCurr.chapters.flatMap(c => c.lessons) : [];

  const subjectTopics: Record<string, string[]> = {
    'ភាសាខ្មែរ': [
      'ការអានអត្ថបទ និងស្វែងយល់អត្ថន័យពាក្យ',
      'វេយ្យាករណ៍៖ នាម កិរិយាសព្ទ និងគុណនាម',
      'អក្ខរាវិរុទ្ធ និងការសរសេរតាមអាន',
      'តែងសេចក្តី៖ ការពណ៌នាអំពីមនុស្ស និងសត្វ',
      'កំណាព្យ និងការស្មូត្របែបបទខ្មែរ',
      'ការសន្ទនា និងការបញ្ចេញមតិក្នុងទីសាធារណៈ',
      'តែងសេចក្តី៖ ការពណ៌នាអំពីទេសភាពធម្មជាតិ',
      'ការពិនិត្យឡើងវិញ និងតេស្តពាក់កណ្តាលឆមាស',
      'អំណានអត្ថបទអប់រំ និងសីលធម៌សង្គម',
      'វេយ្យាករណ៍៖ ឃ្លា និងល្បះទោល/ល្បះផ្សំ',
      'តែងសេចក្តី៖ សំបុត្រមិត្តភក្តិ និងលិខិតផ្លូវការ',
      'ការសង្ខេបរឿង និងការទាញរកតម្លៃអប់រំ',
      'ការពិភាក្សាដេញដោល និងការត្រិះរិះពិចារណា',
      'ការរំលឹកមេរៀនទូទៅ និងការត្រៀមប្រឡងឆមាស',
      'ការប្រឡងបញ្ចប់ឆមាស និងការបូកសរុបលទ្ធផល'
    ],
    'គណិតវិទ្យា': [
      'ចំនួនដល់ ១០០ ០០០ និងការប្រៀបធៀបចំនួន',
      'វិធីបូក និងវិធីដកចំនួនធំៗ',
      'វិធីគុណចំនួនមានលេខច្រើនខ្ទង់',
      'វិធីចែក និងការដោះស្រាយចំណោទបឋម',
      'ប្រភាគ៖ និយមន័យ និងការបូកដកប្រភាគភាគបែងដូចគ្នា',
      'ចំនួនទសភាគ និងការបំប្លែងប្រភាគទៅជាទសភាគ',
      'រង្វាស់រង្វាល់៖ ប្រវែង និងទម្ងន់ (ម៉ែត្រ គីឡូក្រាម)',
      'ការរំលឹក និងតេស្តវាយតម្លៃពាក់កណ្តាលឆមាស',
      'រង្វាស់ចំណុះ និងពេលវេលា (លីត្រ ម៉ោង នាទី)',
      'ធរណីមាត្រ៖ បន្ទាត់ កែង ស្រប និងមុំ',
      'ធរណីមាត្រ៖ រូបធរណីមាត្រ ២ វិមាត្រ និងបរិមាត្រ',
      'ក្រឡាផ្ទៃរាងចតុកោណកែង និងការ៉េ',
      'ស្ថិតិបឋម៖ តារាង និងដ្យាក្រាមរូបភាព/បង្គោល',
      'ការដោះស្រាយចំណោទចម្រុះក្នុងជីវភាពរស់នៅ',
      'ការប្រឡងបញ្ចប់ឆមាស និងការវាយតម្លៃចុងក្រោយ'
    ],
    'វិទ្យាសាស្ត្រ': [
      'សារពាង្គកាយមនុស្ស៖ សរីរាង្គវិញ្ញាណទាំង ៥',
      'សុខភាព និងអនាម័យខ្លួនប្រាណ',
      'អាហារូបត្ថម្ភ និងក្រុមអាហារសំខាន់ៗទាំង ៣',
      'រុក្ខជាតិ៖ ផ្នែកសំខាន់ៗ និងមុខងាររបស់រុក្ខជាតិ',
      'សត្វ៖ ការបែងចែកប្រភេទសត្វ និងទីជម្រក',
      'បរិស្ថានជុំវិញខ្លួន និងការថែរក្សាធនធានធម្មជាតិ',
      'ទឹក៖ វដ្តនៃទឹក និងការសន្សំសំចៃទឹកស្អាត',
      'ការរំលឹក និងតេស្តពាក់កណ្តាលឆមាស',
      'ខ្យល់ និងអាកាសធាតុ៖ សារៈសំខាន់នៃខ្យល់បរិសុទ្ធ',
      'ដី៖ ប្រភេទដី និងជីធម្មជាតិសម្រាប់កសិកម្ម',
      'រូបធាតុ និងថាមពល៖ ពន្លឺ កម្ដៅ និងសំឡេង',
      'កម្លាំង និងចលនា៖ កម្លាំងទំនាញ និងកម្លាំងកកិត',
      'អគ្គិសនីសាមញ្ញ និងការប្រើប្រាស់ដោយសុវត្ថិភាព',
      'ការរំលឹកឡើងវិញ និងការធ្វើពិសោធន៍សាមញ្ញ',
      'ការប្រឡងបញ្ចប់ឆមាស និងការវាយតម្លៃលទ្ធផល'
    ]
  };

  const topicsList = subjectTopics[input.subject] || [
    'សេចក្តីផ្តើម និងគោលការណ៍គ្រឹះ',
    'ទ្រឹស្តី និងការយល់ដឹងបឋម',
    'ការអនុវត្ត និងការបង្ហាញគំរូ',
    'ការដោះស្រាយបញ្ហាកម្រិតមធ្យម',
    'ការងារស្រាវជ្រាវ និងការពិភាក្សាជាក្រុម',
    'ការរំលឹក និងតេស្តពាក់កណ្តាលឆមាស',
    'ខ្លឹមសារកម្រិតខ្ពស់ និងការវិភាគ',
    'ការអនុវត្តជាក់ស្តែងក្នុងជីវភាព',
    'ការរំលឹកឡើងវិញទូទាំងឆមាស',
    'ការប្រឡងបញ្ចប់ និងការបូកសរុបពិន្ទុ'
  ];

  for (let i = 1; i <= input.totalWeeks; i++) {
    const realLesson = realLessons.length > 0 ? realLessons[(i - 1) % realLessons.length] : null;
    const topic = realLesson ? realLesson.title : topicsList[(i - 1) % topicsList.length];
    const lessonNum = realLesson ? realLesson.lessonNumber : Math.floor((i - 1) / 2) + 1;
    const objectives = realLesson ? realLesson.learningObjectives.join(' | ') : `សិស្សយល់ដឹងពី ${topic} និងចេះអនុវត្តលំហាត់ជាក់ស្តែងយ៉ាងតិច ៨០%`;

    weeks.push({
      id: `w-${i}`,
      weekNumber: i,
      lessonNumber: lessonNum,
      lessonTitle: `មេរៀនទី ${lessonNum}៖ ${topic.split('៖')[0]}`,
      topic: topic,
      teachingHours: input.hoursPerWeek,
      learningObjectives: objectives,
      keyActivities: `គ្រូពន្យល់ទ្រឹស្តី បង្ហាញឧទាហរណ៍ជាក់ស្តែងតាមសៀវភៅពុម្ព និងដឹកនាំសកម្មភាពអនុវត្តជាក្រុម/បុគ្គល`,
      assessmentMethod: i % 4 === 0 ? 'តេស្តខ្លី និងវាយតម្លៃលើសន្លឹកកិច្ចការ' : 'សង្កេតការចូលរួម និងសំណួរផ្ទាល់មាត់',
      materials: moeysCurr ? `${moeysCurr.officialTextbookName}, ប័ណ្ណរូបភាព និងក្តារខៀន` : `សៀវភៅពុម្ព ${input.subject} ថ្នាក់ទី${input.grade}, ប័ណ្ណរូបភាព និងក្តារខៀន`
    });
  }

  return {
    id: `curr-${Date.now()}`,
    title: `បំណែងចែកកម្មវិធីសិក្សា ${input.subject} ថ្នាក់ទី${input.grade} (${input.academicYear}) - ស្តង់ដារ MoEYS`,
    subject: input.subject,
    grade: input.grade,
    semester: input.semester,
    academicYear: input.academicYear,
    totalWeeks: input.totalWeeks,
    hoursPerWeek: input.hoursPerWeek,
    studentLevel: input.studentLevel,
    weeks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* ==========================================================================
   3.5. WEEKLY LESSON PLAN GENERATOR (MOEYS STANDARD PEDAGOGY)
   ========================================================================== */
export async function generateAIWeeklyLessonPlan(input: WeeklyLessonPlanFormInput): Promise<AIWeeklyLessonPlan> {
  const moeysCurr = getMoEYSSubjectCurriculum(input.subject, input.grade);
  const matchedLessons = moeysCurr ? moeysCurr.chapters.flatMap(c => c.lessons) : [];
  const subjectOverview = moeysCurr ? `
Official MoEYS Textbook: ${moeysCurr.officialTextbookName} (${moeysCurr.academicYear})
Ministry Curriculum Chapters: ${moeysCurr.chapters.map(c => `${c.title} (${c.lessons.map(l => l.title).join(', ')})`).join('; ')}
` : '';

  const prompt = `
Generate an official MoEYS-standard Primary School Weekly Lesson Plan for Cambodia according to the official curriculum and textbook.
${subjectOverview}

Subject: ${input.subject}, Grade: ${input.grade}, Week: ${input.weekNumber}, Semester: ${input.semester}, Academic Year: ${input.academicYear}.
Theme/Topic: ${input.themeUnit}, Teaching Days: ${input.teachingDaysCount} days (Monday to ${input.teachingDaysCount === 6 ? 'Saturday' : 'Friday'}), Periods Per Day: ${input.periodsPerDay}.
Student Level: ${input.studentLevel}, Teaching Style: ${input.teachingStyle}.
Objectives: ${input.coreObjectives || (moeysCurr ? moeysCurr.subjectGoals.join(' | ') : 'MoEYS curriculum mastery in Knowledge, Skills, Attitude')}.
Materials: ${input.materialsInClass || (moeysCurr ? `${moeysCurr.officialTextbookName}, ក្តារខៀន, ក្តារឆ្នួន, ប័ណ្ណរូបភាព` : 'Textbook, whiteboard, flashcards')}.

Each day MUST follow the 5-step pedagogical sequence of Cambodia MoEYS:
1. ជំហានទី១ (រដ្ឋបាលថ្នាក់): Class inspection, attendance, hygiene, discipline (2-3 mins).
2. ជំហានទី២ (រំលឹកមេរៀនចាស់): Review previous day's concept and homework check (5 mins).
3. ជំហានទី៣ (មេរៀនថ្មី): Step-by-step active learning, teacher script & student activities (25-30 mins).
4. ជំហានទី៤ (ពង្រឹងចំណេះដឹង): Fast checking questions, practice exercises on slate/notebook (8-10 mins).
5. ជំហានទី៥ (បណ្តាំផ្ញើ & កិច្ចការផ្ទះ): Moral advice, homework assignment, hygiene reminder (3-5 mins).

Return valid JSON with format:
{
  "title": "កិច្ចតែងការបង្រៀនប្រចាំសប្តាហ៍ទី...",
  "themeUnit": "...",
  "generalObjectives": ["ចំណេះដឹង៖ ...", "បំណិន៖ ...", "ឥរិយាបថ៖ ..."],
  "teachingAidsRequired": ["...", "..."],
  "weeklySummaryNotes": "...",
  "days": [
    {
      "dayIndex": 1,
      "dayOfWeek": "Monday",
      "dayNameKh": "ថ្ងៃចន្ទ",
      "lessonNumber": "មេរៀនទី... (ម៉ោងទី...)",
      "topicTitle": "...",
      "periodsCount": 2,
      "objectives": {
        "knowledge": "...",
        "skills": "...",
        "attitude": "..."
      },
      "teachingSteps": {
        "step1_admin": "...",
        "step2_review": "...",
        "step3_newLesson": "...",
        "step4_consolidation": "...",
        "step5_homework": "..."
      },
      "materials": ["..."],
      "assessmentMethod": "...",
      "differentiatedSupport": {
        "slowLearners": "...",
        "fastLearners": "..."
      },
      "notes": "..."
    }
  ]
}
`;

  const systemInstruction = `You are a certified MoEYS pedagogical inspector in Cambodia. Ensure every single day strictly complies with the 5-step MoEYS primary lesson format and official curriculum textbooks. Write solely in authentic Khmer pedagogical terminology.`;

  const aiResult = await callAIGenerator(prompt, systemInstruction);
  if (aiResult && aiResult.days && Array.isArray(aiResult.days) && aiResult.days.length > 0) {
    return {
      id: `weekly-lesson-${Date.now()}`,
      title: aiResult.title || `កិច្ចតែងការបង្រៀនប្រចាំសប្តាហ៍ទី${input.weekNumber} មុខវិជ្ជា${input.subject} ថ្នាក់ទី${input.grade}`,
      grade: input.grade,
      subject: input.subject,
      weekNumber: input.weekNumber,
      semester: input.semester,
      academicYear: input.academicYear,
      themeUnit: aiResult.themeUnit || input.themeUnit,
      totalPeriods: input.teachingDaysCount * input.periodsPerDay,
      generalObjectives: aiResult.generalObjectives || [
        `ចំណេះដឹង៖ សិស្សយល់ច្បាស់ពីខ្លឹមសារមេរៀន និងក្បួនខ្នាតសំខាន់ៗនៃ${input.subject}`,
        `បំណិន៖ សិស្សចេះអនុវត្ត ដោះស្រាយលំហាត់ និងសហការជាក្រុមបានរលូន`,
        `ឥរិយាបថ៖ បណ្តុះស្មារតីឧស្សាហ៍ព្យាយាម ស្រឡាញ់ការរៀនសូត្រ និងមានសីលធម៌ល្អ`
      ],
      days: aiResult.days.map((d: any, idx: number) => ({
        id: `day-${idx + 1}-${Date.now()}`,
        dayIndex: d.dayIndex || idx + 1,
        dayOfWeek: d.dayOfWeek || (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][idx] as any),
        dayNameKh: d.dayNameKh || (['ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'][idx]),
        lessonNumber: d.lessonNumber || `មេរៀនទី ${input.weekNumber} (ម៉ោងទី ${idx * input.periodsPerDay + 1}-${idx * input.periodsPerDay + input.periodsPerDay})`,
        topicTitle: d.topicTitle || `${input.themeUnit} - ផ្នែកទី ${idx + 1}`,
        periodsCount: d.periodsCount || input.periodsPerDay,
        objectives: d.objectives || {
          knowledge: `សិស្សស្គាល់ និងចងចាំខ្លឹមសារគន្លឹះនៃប្រធានបទ`,
          skills: `សិស្សចេះអនុវត្តលំហាត់ និងឆ្លើយសំណួរបានត្រឹមត្រូវ`,
          attitude: `សិស្សមានទំនុកចិត្ត និងចូលរួមសកម្មភាពដោយស្វាហាប់`
        },
        teachingSteps: d.teachingSteps || {
          step1_admin: 'ពិនិត្យអនាម័យ កាយវិការ វត្តមានសិស្ស និងពង្រឹងវិន័យក្នុងថ្នាក់ (២ នាទី)',
          step2_review: 'ហៅសិស្ស ២ នាក់ឡើងមកកែកិច្ចការផ្ទះ និងសួរសំណួររំលឹកមេរៀនចាស់ (៥ នាទី)',
          step3_newLesson: 'បង្ហាញវត្ថុបំណង ណែនាំប័ណ្ណរូបភាព ពន្យល់ទ្រឹស្តី និងដឹកនាំសកម្មភាពក្រុម (២៥ នាទី)',
          step4_consolidation: 'ដាក់សំណួរពង្រឹងពុទ្ធិ និងឱ្យសិស្សសរសេរលំហាត់លើក្តារឆ្នួន (៨ នាទី)',
          step5_homework: 'ដាក់កិច្ចការផ្ទះ និងផ្តាំផ្ញើឱ្យសិស្សថែរក្សាសុខភាព និងជួយការងារឪពុកម្តាយ (៥ នាទី)'
        },
        materials: Array.isArray(d.materials) ? d.materials : ['សៀវភៅពុម្ព', 'ក្តារខៀន', 'ប័ណ្ណរូបភាព'],
        assessmentMethod: d.assessmentMethod || 'ការសង្កេតកាយវិការ សំណួរផ្ទាល់មាត់ និងការពិនិត្យសន្លឹកកិច្ចការ',
        differentiatedSupport: d.differentiatedSupport || {
          slowLearners: 'ផ្តល់ជំនួយផ្ទាល់ និងប្រើប្រាស់រូបភាពគំនូរបន្ថែម',
          fastLearners: 'ផ្តល់សំណួរត្រិះរិះ និងលើកទឹកចិត្តឱ្យជួយពន្យល់មិត្តភក្តិ'
        },
        notes: d.notes || ''
      })),
      teachingAidsRequired: aiResult.teachingAidsRequired || [
        'សៀវភៅគោលក្រសួងអប់រំ យុវជន និងកីឡា',
        'សៀវភៅណែនាំគ្រូ និងកិច្ចតែងការគំរូ',
        'ប័ណ្ណពាក្យ/ប័ណ្ណរូបភាពគំនូរជីវចល',
        'ក្តារឆ្នួន ប៊ិចហ្វឺត និងក្រដាសផ្ទាំងធំ'
      ],
      weeklySummaryNotes: aiResult.weeklySummaryNotes || `ផែនការបង្រៀនប្រចាំសប្តាហ៍ទី${input.weekNumber} ត្រូវបានរៀបចំស្របតាមស្តង់ដារកម្មវិធីសិក្សាបឋមសិក្សាជាតិ។`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Offline Rich Primary School MoEYS Weekly Lesson Plan Fallback Generator
  return generateOfflineWeeklyLessonPlan(input);
}

function generateOfflineWeeklyLessonPlan(input: WeeklyLessonPlanFormInput): AIWeeklyLessonPlan {
  const dayNamesKh = ['ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'];
  const dayOfWeekList: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const subjectDailyTopics: Record<string, string[]> = {
    'ភាសាខ្មែរ': [
      'អំណានអត្ថបទ និងការពន្យល់ពាក្យពិបាក (Vocab & Reading)',
      'សំណួរស្វែងយល់អត្ថបទ និងការវិភាគគំនិតសំខាន់ (Comprehension)',
      'វេយ្យាករណ៍៖ កិរិយាសព្ទ គុណនាម និងការបង្កើតល្បះ (Grammar)',
      'អក្ខរាវិរុទ្ធ៖ ការសរសេរតាមអាន និងការកែសរសេរខុស (Spelling & Dictation)',
      'តែងសេចក្តី៖ ការរៀបចំគំនិត និងតែងកថាខណ្ឌ (Composition)',
      'ការសង្ខេបមេរៀនប្រចាំសប្តាហ៍ និងការពិភាក្សាជាក្រុម (Review)'
    ],
    'គណិតវិទ្យា': [
      'សញ្ញាណគ្រឹះ និងការស្វែងយល់តាមរយៈរូបភាពជាក់ស្តែង (Concept Intro)',
      'ការបង្ហាញរូបមន្ត និងវិធីសាស្ត្រគណនាជាជំហានៗ (Methodology)',
      'ការអនុវត្តលំហាត់គំរូនាំមុខដោយគ្រូ និងសិស្សចូលរួម (Guided Practice)',
      'លំហាត់អនុវត្តជាដៃគូ និងសកម្មភាពក្រុម (Peer Collaboration)',
      'ការដោះស្រាយចំណោទអនុវត្តក្នុងជីវភាពរស់នៅ (Word Problem Solving)',
      'តេស្តពង្រឹងសមត្ថភាពចុងសប្តាហ៍ និងការកែកំហុសទូទៅ (Weekly Assessment)'
    ],
    'វិទ្យាសាស្ត្រ': [
      'ការសង្កេត និងស្វែងយល់បាតុភូតធម្មជាតិ (Observation)',
      'ការពិសោធន៍សាមញ្ញ និងការកត់ត្រាលទ្ធផល (Simple Experiment)',
      'ការពន្យល់ទ្រឹស្តី និងមូលហេតុវិទ្យាសាស្ត្រ (Scientific Explanation)',
      'ការអនុវត្តការការពារ និងថែរក្សាសុខភាព/បរិស្ថាន (Practical Application)',
      'ការបង្កើតគំរូសាមញ្ញ និងធ្វើបទបង្ហាញ (Project & Presentation)',
      'ការសង្ខេបចំណេះដឹង និងឆ្លើយសំណួរត្រិះរិះ (Summary & Q&A)'
    ]
  };

  const topicPool = subjectDailyTopics[input.subject] || [
    'ការណែនាំគោលគំនិត និងវត្ថុបំណងមេរៀន',
    'ការពន្យល់ខ្លឹមសារលម្អិត និងបង្ហាញឧទាហរណ៍ជាក់ស្តែង',
    'ការអនុវត្តជាក់ស្តែង និងការធ្វើការងារជាក្រុម',
    'ការដោះស្រាយបញ្ហា និងសំណួរត្រិះរិះពិចារណា',
    'ការផលិតស្នាដៃ និងការធ្វើបទបង្ហាញក្នុងថ្នាក់',
    'ការវាយតម្លៃពង្រឹងពុទ្ធិ និងការបូកសរុបសប្តាហ៍'
  ];

  const count = Math.min(input.teachingDaysCount || 5, 6);
  const days: WeeklyLessonDayItem[] = [];

  for (let i = 0; i < count; i++) {
    const dayName = dayNamesKh[i];
    const dayOfWeek = dayOfWeekList[i];
    const subTopic = topicPool[i % topicPool.length];

    days.push({
      id: `day-${i + 1}-${Date.now()}`,
      dayIndex: i + 1,
      dayOfWeek,
      dayNameKh: dayName,
      lessonNumber: `មេរៀនទី ${input.weekNumber} (ម៉ោងទី ${i * input.periodsPerDay + 1}-${i * input.periodsPerDay + input.periodsPerDay})`,
      topicTitle: `${input.themeUnit || input.subject}៖ ${subTopic}`,
      periodsCount: input.periodsPerDay || 2,
      objectives: {
        knowledge: `សិស្សប្រាប់បានច្បាស់លាស់ពីគោលគំនិត និងខ្លឹមសារសំខាន់នៃ ${subTopic}។`,
        skills: `សិស្សអនុវត្តលំហាត់ បំពេញកិច្ចការ និងឆ្លើយសំណួរបានត្រឹមត្រូវយ៉ាងតិច ៨០% នៃខ្លឹមសារ។`,
        attitude: `សិស្សមានទំនួលខុសត្រូវ ស្រឡាញ់ការរៀនសូត្រ សហការល្អជាមួយមិត្តភក្តិ និងគោរពវិន័យ។`
      },
      teachingSteps: {
        step1_admin: 'ពិនិត្យវត្តមាន សណ្តាប់ធ្នាប់ អនាម័យសម្លៀកបំពាក់ ក្រចកដៃ និងពង្រឹងស្មារតីមុនរៀន (២ នាទី)',
        step2_review: 'ហៅសិស្ស ២-៣ នាក់ឡើងមកកែកិច្ចការផ្ទះលើក្តារខៀន និងសួរសំណួររំលឹកមេរៀនពីម្សិលមិញ (៥ នាទី)',
        step3_newLesson: `• បង្ហាញចំណងជើងមេរៀន និងវត្ថុបំណង\n• ប្រើប្រាស់ប័ណ្ណរូបភាព/សម្ភារឧបទេសដើម្បីពន្យល់ទ្រឹស្តី\n• គ្រូធ្វើការបង្ហាញគំរូជាក់ស្តែងមួយជំហានម្តងៗ\n• ឱ្យសិស្សអនុវត្តជាដៃគូ ឬជាក្រុម ៤ នាក់ (២៥ នាទី)`,
        step4_consolidation: 'ដាក់សំណួរត្រួតពិនិត្យការយល់ដឹងឱ្យសិស្សឆ្លើយលើក្តារឆ្នួន និងកែតម្រូវកំហុសរួមគ្នា (៨ នាទី)',
        step5_homework: 'ដាក់កិច្ចការផ្ទះ ២ លំហាត់ក្នុងសៀវភៅលំហាត់ និងផ្តាំផ្ញើឱ្យសិស្សកុំភ្លេចជួយការងារផ្ទះ និងរំលឹកមេរៀន (៥ នាទី)'
      },
      materials: [
        'សៀវភៅពុម្ពសិក្សាគោល',
        'ក្តារខៀន និងដីស/ប៊ិចហ្វឺត',
        'ប័ណ្ណរូបភាព និងផ្ទាំងសន្លឹកកិច្ចការក្រុម',
        'ក្តារឆ្នួន និងសៀវភៅសរសេរសិស្ស'
      ],
      assessmentMethod: 'ការសង្កេតការចូលរួម ការឆ្លើយសំណួរលើក្តារឆ្នួន និងការកែសន្លឹកកិច្ចការបុគ្គល',
      differentiatedSupport: {
        slowLearners: 'គ្រូដើរជួយណែនាំផ្ទាល់ ប្រើសម្ភាររូបភាពបន្ថែម និងផ្គូផ្គងជាមួយមិត្តជួយមិត្ត',
        fastLearners: 'ផ្តល់លំហាត់ប្រឈមបន្ថែម (Bonus Questions) និងឱ្យជួយពន្យល់មិត្តភក្តិក្នុងក្រុម'
      },
      notes: ''
    });
  }

  return {
    id: `weekly-plan-${Date.now()}`,
    title: `កិច្ចតែងការបង្រៀនប្រចាំសប្តាហ៍ទី${input.weekNumber} មុខវិជ្ជា${input.subject} ថ្នាក់ទី${input.grade}`,
    grade: input.grade,
    subject: input.subject,
    weekNumber: input.weekNumber,
    semester: input.semester,
    academicYear: input.academicYear,
    themeUnit: input.themeUnit || `ការបង្រៀនប្រចាំសប្តាហ៍ទី ${input.weekNumber}`,
    totalPeriods: input.teachingDaysCount * input.periodsPerDay,
    generalObjectives: [
      `ចំណេះដឹង៖ សិស្សក្តាប់បាននូវទ្រឹស្តី វិធាន និងក្បួនខ្នាតគន្លឹះនៃមុខវិជ្ជា ${input.subject} ថ្នាក់ទី${input.grade}`,
      `បំណិន៖ សិស្សអភិវឌ្ឍសមត្ថភាពគិតពិចារណា ចេះដោះស្រាយបញ្ហា និងអនុវត្តកិច្ចការជាក់ស្តែងបានស្ទាត់ជំនាញ`,
      `ឥរិយាបថ៖ បណ្តុះស្មារតីស្រឡាញ់ការសិក្សា មានវិន័យ សីលធម៌ និងភាពជាពលរដ្ឋល្អក្នុងសង្គម`
    ],
    days,
    teachingAidsRequired: [
      'សៀវភៅសិក្សាគោល និងសៀវភៅណែនាំគ្រូ របស់ក្រសួងអប់រំ យុវជន និងកីឡា',
      'សម្ភារឧបទេសបង្រៀន៖ ប័ណ្ណពាក្យ ប័ណ្ណរូបភាព វត្ថុជាក់ស្តែង និងផ្ទាំងគំនូសបំព្រួញ',
      'ឧបករណ៍រៀនរបស់សិស្ស៖ ក្តារឆ្នួន សៀវភៅកត់ត្រា ប៊ិច បន្ទាត់'
    ],
    weeklySummaryNotes: `កិច្ចតែងការបង្រៀនសប្តាហ៍ទី${input.weekNumber} នេះត្រូវបានរៀបចំឡើងយ៉ាងហ្មត់ចត់ស្របតាមស្តង់ដារគរុកោសល្យ ៥ ជំហានរបស់ក្រសួងអប់រំ យុវជន និងកីឡា។`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* ==========================================================================
   4. TEST & QUESTION GENERATOR (BLOOM'S TAXONOMY & STANDARDIZED)
   ========================================================================== */
export async function generateAITestPaper(input: {
  subject: string;
  grade: number;
  topic: string;
  questionCount: number;
  totalMarks: number;
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes: QuestionType[];
  isStandardized: boolean;
}): Promise<AITestPaper> {
  const prompt = `
Generate a high quality, balanced test paper according to Bloom's Taxonomy for a Cambodian school.
Subject: ${input.subject}, Grade: ${input.grade}, Topic: ${input.topic}.
Question Count: ${input.questionCount}, Total Marks: ${input.totalMarks}, Duration: ${input.durationMinutes} mins.
Difficulty: ${input.difficulty}, Question Types: ${input.questionTypes.join(', ')}.
Standardized Bloom's Taxonomy Distribution:
- Knowledge (ដឹង/ចងចាំ): 20%
- Understanding (យល់): 25%
- Application (អនុវត្ត): 25%
- Analysis (វិភាគ): 15%
- Evaluation (វាយតម្លៃ): 10%
- Creation (បង្កើតថ្មី/សំយោគ): 5%

Return valid JSON with format:
{
  "title": "...",
  "instructions": ["...", "..."],
  "blueprint": [
    { "bloomLevel": "knowledge", "bloomLevelKh": "កម្រិតចងចាំ (Knowledge)", "questionCount": 2, "marks": 20, "percentage": 20 }
  ],
  "questions": [
    {
      "questionNumber": 1,
      "type": "multiple_choice",
      "questionText": "...",
      "bloomLevel": "knowledge",
      "marks": 5,
      "difficulty": "easy",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A. ...",
      "explanation": "...",
      "markingRubric": "..."
    }
  ]
}
`;

  const aiResult = await callAIGenerator(prompt);
  if (aiResult && aiResult.questions && Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
    return {
      id: `test-${Date.now()}`,
      title: aiResult.title || `តេស្តវាយតម្លៃ៖ ${input.topic} (${input.subject} ថ្នាក់ទី${input.grade})`,
      subject: input.subject,
      grade: input.grade,
      topic: input.topic,
      totalMarks: input.totalMarks,
      durationMinutes: input.durationMinutes,
      difficulty: input.difficulty,
      isStandardized: input.isStandardized,
      blueprint: aiResult.blueprint || getDefaultBlueprint(input.questionCount, input.totalMarks),
      questions: aiResult.questions.map((q: any, idx: number) => ({
        id: `q-${idx + 1}`,
        questionNumber: idx + 1,
        type: q.type || 'multiple_choice',
        questionText: q.questionText || `សំណួរទី ${idx + 1}៖ ...`,
        bloomLevel: q.bloomLevel || 'understanding',
        marks: Number(q.marks) || Math.round(input.totalMarks / input.questionCount),
        difficulty: q.difficulty || 'medium',
        options: q.options || (q.type === 'multiple_choice' ? ['ក. ជម្រើសទី១', 'ខ. ជម្រើសទី២', 'គ. ជម្រើសទី៣', 'ឃ. ជម្រើសទី៤'] : undefined),
        correctAnswer: q.correctAnswer || 'ក. ជម្រើសទី១',
        explanation: q.explanation || 'ការពន្យល់លម្អិតអំពីចម្លើយត្រឹមត្រូវ...',
        markingRubric: q.markingRubric || 'ផ្តល់ពិន្ទុពេញនៅពេលឆ្លើយត្រូវគ្រប់ចំណុច'
      })),
      instructions: aiResult.instructions || [
        `សូមអានសំណួរនីមួយៗឱ្យបានច្បាស់លាស់មុនពេលឆ្លើយ។`,
        `សម្រាប់សំណួរពហុជ្រើសរើស សូមគូសរង្វង់ ឬជ្រើសរើសចម្លើយដែលត្រឹមត្រូវតែមួយគត់។`,
        `ហាមលួចចម្លងគ្នា និងរក្សាសណ្តាប់ធ្នាប់ឱ្យបានល្អក្នុងពេលធ្វើតេស្ត។`
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Fallback intelligent test paper generator
  return createFallbackTestPaper(input);
}

function getDefaultBlueprint(totalQuestions: number, totalMarks: number): any[] {
  const levels: { level: BloomLevel; kh: string; pct: number }[] = [
    { level: 'knowledge', kh: 'កម្រិតចងចាំ (Knowledge)', pct: 20 },
    { level: 'understanding', kh: 'កម្រិតយល់ដឹង (Understanding)', pct: 30 },
    { level: 'application', kh: 'កម្រិតអនុវត្ត (Application)', pct: 25 },
    { level: 'analysis', kh: 'កម្រិតវិភាគ (Analysis)', pct: 15 },
    { level: 'evaluation', kh: 'កម្រិតវាយតម្លៃ (Evaluation)', pct: 10 }
  ];

  return levels.map(l => ({
    bloomLevel: l.level,
    bloomLevelKh: l.kh,
    description: `សំណួរវាស់ស្ទង់សមត្ថភាពផ្នែក ${l.kh}`,
    questionCount: Math.max(1, Math.round((totalQuestions * l.pct) / 100)),
    marks: Math.round((totalMarks * l.pct) / 100),
    percentage: l.pct
  }));
}

function createFallbackTestPaper(input: {
  subject: string;
  grade: number;
  topic: string;
  questionCount: number;
  totalMarks: number;
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes: QuestionType[];
  isStandardized: boolean;
}): AITestPaper {
  const marksPerQuestion = Math.max(1, Math.floor(input.totalMarks / input.questionCount));
  const questions: TestQuestionItem[] = [];

  const sampleQuestionsBySubject: Record<string, { q: string; opt?: string[]; ans: string; type: QuestionType; bloom: BloomLevel }[]> = {
    'ភាសាខ្មែរ': [
      {
        q: `តើពាក្យ «កិច្ចតែងការ» មានថ្នាក់ពាក្យជាអ្វី?`,
        opt: [`ក. នាមនាម`, `ខ. កិរិយាសព្ទ`, `គ. គុណនាម`, `ឃ. គុណកិរិយា`],
        ans: `ក. នាមនាម`,
        type: 'multiple_choice',
        bloom: 'knowledge'
      },
      {
        q: `ចូរជ្រើសរើសពាក្យដែលសរសេរអក្ខរាវិរុទ្ធត្រឹមត្រូវតាមវចនានុក្រមសម្តេចព្រះសង្ឃរាជ ជួន ណាត៖`,
        opt: [`ក. សម្ភារៈ`, `ខ. សម្ភារ`, `គ. សំភារះ`, `ឃ. សំភារ`],
        ans: `ខ. សម្ភារ`,
        type: 'multiple_choice',
        bloom: 'understanding'
      },
      {
        q: `ចូរតែងល្បះទោលចំនួន ១ ដោយប្រើពាក្យ «ការអប់រំ» និងពន្យល់ពីន័យរបស់ល្បះនោះ។`,
        ans: `ល្បះគំរូ៖ «ការអប់រំគឺជាគ្រឹះដ៏រឹងមាំសម្រាប់អនាគតកុមារ។» (ពិន្ទុផ្អែកលើភាពត្រឹមត្រូវនៃវេយ្យាករណ៍ និងអត្ថន័យ)`,
        type: 'short_answer',
        bloom: 'application'
      },
      {
        q: `ចូរប្រៀបធៀបភាពខុសគ្នារវាង «ល្បះទោល» និង «ល្បះផ្សំ» ព្រមទាំងលើកឧទាហរណ៍បញ្ជាក់។`,
        ans: `ល្បះទោលមានកិរិយាសព្ទស្នូលតែមួយ រីឯល្បះផ្សំមានកិរិយាសព្ទស្នូលចាប់ពីពីរឡើងទៅភ្ជាប់ដោយសន្ធានសព្ទ។`,
        type: 'short_answer',
        bloom: 'analysis'
      },
      {
        q: `ចូរបង្ហាញទស្សនៈផ្ទាល់ខ្លួនរបស់អ្នកថា៖ «ហេតុអ្វីបានជាការអានសៀវភៅជារៀងរាល់ថ្ងៃជួយឱ្យការសរសេរតែងសេចក្តីកាន់តែពូកែ?»`,
        ans: `ការអានជួយបង្កើនមូលធនពាក្យ គំនិត ឃ្លោងឃ្លា និងរចនាបថសរសេរល្អៗ។ (វាយតម្លៃលើហេតុផលសមស្រប)`,
        type: 'essay',
        bloom: 'evaluation'
      }
    ],
    'គណិតវិទ្យា': [
      {
        q: `តើតម្លៃលេខ ៧ ក្នុងចំនួន ៧៤ ៥២០ ស្ថិតនៅខ្ទង់ណា?`,
        opt: [`ក. ខ្ទង់រាយ`, `ខ. ខ្ទង់រយ`, `គ. ខ្ទង់ពាន់`, `ឃ. ខ្ទង់ម៉ឺន`],
        ans: `ឃ. ខ្ទង់ម៉ឺន`,
        type: 'multiple_choice',
        bloom: 'knowledge'
      },
      {
        q: `ចូរគណនាផលបូកប្រភាគ៖ ៣/៨ + ២/៨ = ?`,
        opt: [`ក. ៥/១៦`, `ខ. ៥/៨`, `គ. ៦/៨`, `ឃ. ១/៨`],
        ans: `ខ. ៥/៨`,
        type: 'multiple_choice',
        bloom: 'understanding'
      },
      {
        q: `កសិករម្នាក់ប្រមូលផលស្រូវបាន ៤ ៥០០ គីឡូក្រាម។ គាត់លក់អស់ ៣/៥ នៃស្រូវសរុប។ តើគាត់នៅសល់ស្រូវប៉ុន្មានគីឡូក្រាម?`,
        ans: `ចំនួនស្រូវដែលលក់ = ៤ ៥០០ × ៣/៥ = ២ ៧០០ គីឡូក្រាម។ ចំនួនស្រូវដែលនៅសល់ = ៤ ៥០០ - ២ ៧០០ = ១ ៨០០ គីឡូក្រាម។`,
        type: 'problem_solving',
        bloom: 'application'
      },
      {
        q: `ចតុកោណកែងមួយមានបណ្តោយ ១២ សង់ទីម៉ែត្រ និងទទឹង ៨ សង់ទីម៉ែត្រ។ ចូរគណនាបរិមាត្រ និងក្រឡាផ្ទៃរបស់វា។`,
        ans: `បរិមាត្រ = (១២ + ៨) × ២ = ៤០ សង់ទីម៉ែត្រ។ ក្រឡាផ្ទៃ = ១២ × ៨ = ៩៦ សង់ទីម៉ែត្រការ៉េ។`,
        type: 'problem_solving',
        bloom: 'analysis'
      },
      {
        q: `តើវិធីសាស្ត្រមួយណាដែលល្អជាងគេក្នុងការដោះស្រាយចំណោទគណិតវិទ្យាស្មុគស្មាញ? ចូរពន្យល់ពីជំហានទាំង ៤ របស់ Polya។`,
        ans: `ជំហានទាំង ៤៖ ១. ស្វែងយល់បញ្ហា ២. រៀបចំផែនការ ៣. អនុវត្តផែនការ ៤. ពិនិត្យផ្ទៀងផ្ទាត់ឡើងវិញ។`,
        type: 'essay',
        bloom: 'evaluation'
      }
    ]
  };

  const pool = sampleQuestionsBySubject[input.subject] || sampleQuestionsBySubject['ភាសាខ្មែរ'];

  for (let i = 0; i < input.questionCount; i++) {
    const sample = pool[i % pool.length];
    questions.push({
      id: `q-${i + 1}`,
      questionNumber: i + 1,
      type: sample.type,
      questionText: `${sample.q} (${input.topic})`,
      bloomLevel: sample.bloom,
      marks: marksPerQuestion,
      difficulty: input.difficulty === 'mixed' ? (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard') : input.difficulty,
      options: sample.opt,
      correctAnswer: sample.ans,
      explanation: `ចម្លើយ និងដំណោះស្រាយស្តង់ដារសម្រាប់សំណួរទី ${i + 1}`,
      markingRubric: `ផ្តល់ពិន្ទុពេញ ${marksPerQuestion} ពិន្ទុ ប្រសិនបើឆ្លើយត្រូវគ្រប់ចំណុច។`
    });
  }

  return {
    id: `test-${Date.now()}`,
    title: `តេស្តវាយតម្លៃសមត្ថភាព៖ ${input.topic} (${input.subject} ថ្នាក់ទី${input.grade})`,
    subject: input.subject,
    grade: input.grade,
    topic: input.topic,
    totalMarks: input.totalMarks,
    durationMinutes: input.durationMinutes,
    difficulty: input.difficulty,
    isStandardized: input.isStandardized,
    blueprint: getDefaultBlueprint(input.questionCount, input.totalMarks),
    questions,
    instructions: [
      `សូមអានសំណួរនីមួយៗឱ្យបានម៉ត់ចត់ និងសរសេរអក្សរឱ្យបានស្អាតច្បាស់លាស់។`,
      `សម្រាប់សំណួរពហុជ្រើសរើស សូមជ្រើសរើសចម្លើយត្រឹមត្រូវតែមួយគត់។`,
      `រយៈពេលធ្វើតេស្ត៖ ${input.durationMinutes} នាទី។ ពិន្ទុសរុប៖ ${input.totalMarks} ពិន្ទុ។`
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* ==========================================================================
   5. DIGITAL EDUCATIONAL GAME GENERATOR
   ========================================================================== */
export async function generateAIEducationalGame(input: {
  subject: string;
  grade: number;
  topic: string;
  gameType: GameTemplateType;
  difficulty: 'easy' | 'medium' | 'hard';
  cardCount?: number;
  timeLimitSeconds?: number;
}): Promise<AIEducationalGame> {
  const prompt = `
Generate an interactive digital classroom game pack for Cambodian primary/secondary students.
Subject: ${input.subject}, Grade: ${input.grade}, Topic: ${input.topic}.
Game Template: ${input.gameType}, Difficulty: ${input.difficulty}.
Card/Question Count: ${input.cardCount || 8}.

Return valid JSON with format:
{
  "title": "...",
  "instructions": "...",
  "cardsOrQuestions": [
    {
      "id": "1",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "...",
      "hint": "...",
      "points": 100,
      "matchTarget": "..."
    }
  ]
}
`;

  const aiResult = await callAIGenerator(prompt);
  const randomPin = String(Math.floor(100000 + Math.random() * 900000));

  if (aiResult && aiResult.cardsOrQuestions && Array.isArray(aiResult.cardsOrQuestions) && aiResult.cardsOrQuestions.length > 0) {
    return {
      id: `game-${Date.now()}`,
      title: aiResult.title || `ល្បែងសិក្សាឌីជីថល៖ ${input.topic} (${input.subject})`,
      subject: input.subject,
      grade: input.grade,
      topic: input.topic,
      gameType: input.gameType,
      difficulty: input.difficulty,
      timeLimitSeconds: input.timeLimitSeconds || 30,
      cardsOrQuestions: aiResult.cardsOrQuestions.map((c: any, idx: number) => ({
        id: `gq-${idx + 1}`,
        question: c.question || `សំណួរល្បែងទី ${idx + 1}`,
        options: c.options || ['ចម្លើយទី១', 'ចម្លើយទី២', 'ចម្លើយទី៣', 'ចម្លើយទី៤'],
        correctAnswer: c.correctAnswer || (c.options ? c.options[0] : 'ចម្លើយទី១'),
        explanation: c.explanation || 'ការពន្យល់បន្ថែម...',
        hint: c.hint || 'គន្លឹះជំនួយ...',
        points: Number(c.points) || 100,
        matchTarget: c.matchTarget || ''
      })),
      gameCode: randomPin,
      instructions: aiResult.instructions || `សូមជ្រើសរើសចម្លើយឱ្យបានលឿន និងត្រឹមត្រូវដើម្បីទទួលបានពិន្ទុខ្ពស់បំផុត!`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Fallback intelligent game pack builder
  return createFallbackGame(input, randomPin);
}

function createFallbackGame(input: {
  subject: string;
  grade: number;
  topic: string;
  gameType: GameTemplateType;
  difficulty: 'easy' | 'medium' | 'hard';
  cardCount?: number;
  timeLimitSeconds?: number;
}, randomPin: string): AIEducationalGame {
  const cards: any[] = [
    {
      id: 'gq-1',
      question: `តើអ្វីជាគន្លឹះស្នូលនៃមេរៀន «${input.topic}»?`,
      options: [`ក. ការយល់ដឹងពីទ្រឹស្តី និងការអនុវត្តជាក់ស្តែង`, `ខ. ការទន្ទេញចាំមាត់ដោយមិនយល់`, `គ. ការធ្វើលំហាត់ដោយគ្មានការពិចារណា`, `ឃ. ការរំលងជំហានដោះស្រាយ`],
      correctAnswer: `ក. ការយល់ដឹងពីទ្រឹស្តី និងការអនុវត្តជាក់ស្តែង`,
      explanation: `ការយល់ដឹងពីទ្រឹស្តីផ្សារភ្ជាប់ការអនុវត្តជាក់ស្តែងជួយឱ្យចងចាំបានយូរ។`,
      hint: `គិតអំពីការផ្សារភ្ជាប់ការរៀនទៅនឹងជីវភាពរស់នៅ`,
      points: 100,
      matchTarget: `ការយល់ដឹង និងអនុវត្ត`
    },
    {
      id: 'gq-2',
      question: `ពាក្យផ្ទុយ ឬចំណុចផ្ទុយគ្នាសំខាន់ក្នុងមេរៀននេះគឺអ្វី?`,
      options: [`ក. ភាពត្រឹមត្រូវ vs កំហុសឆ្គង`, `ខ. ល្បឿន vs ភាពយឺតយ៉ាវ`, `គ. សាមញ្ញ vs ស្មុគស្មាញ`, `ឃ. ទាំងអស់ខាងលើ`],
      correctAnswer: `ឃ. ទាំងអស់ខាងលើ`,
      explanation: `ការប្រៀបធៀបជួយឱ្យយើងមើលឃើញទិដ្ឋភាពច្បាស់លាស់។`,
      hint: `ពិនិត្យមើលជម្រើសទាំងអស់`,
      points: 100,
      matchTarget: `ការប្រៀបធៀប`
    },
    {
      id: 'gq-3',
      question: `តើឧបករណ៍ណាដែលចាំបាច់បំផុតសម្រាប់ការអនុវត្តមេរៀន «${input.topic}»?`,
      options: [`ក. សៀវភៅពុម្ព និងឧបករណ៍សិក្សាផ្ទាល់ខ្លួន`, `ខ. ទូរស័ព្ទលេងហ្គេម`, `គ. កាសស្តាប់ចម្រៀង`, `ឃ. សៀវភៅគំនូរតុក្កតា`],
      correctAnswer: `ក. សៀវភៅពុម្ព និងឧបករណ៍សិក្សាផ្ទាល់ខ្លួន`,
      explanation: `ឧបករណ៍សិក្សាត្រឹមត្រូវជួយសម្រួលដល់ដំណើរការរៀនសូត្រ។`,
      hint: `ឧបករណ៍ដែលប្រើក្នុងថ្នាក់រៀន`,
      points: 100,
      matchTarget: `ឧបករណ៍សិក្សា`
    },
    {
      id: 'gq-4',
      question: `ប្រសិនបើសិស្សជួបការលំបាកក្នុងការដោះស្រាយ តើគួរធ្វើដូចម្តេច?`,
      options: [`ក. សួរលោកគ្រូ/អ្នកគ្រូ ឬពិភាក្សាជាមួយមិត្តភក្តិ`, `ខ. បោះបង់ចោលភ្លាមៗ`, `គ. លួចចម្លងចម្លើយពីមិត្ត`, `ឃ. មិនធ្វើអ្វីទាំងអស់`],
      correctAnswer: `ក. សួរលោកគ្រូ/អ្នកគ្រូ ឬពិភាក្សាជាមួយមិត្តភក្តិ`,
      explanation: `ការសួរ និងពិភាក្សាគឺជាវិធីសាស្ត្ររៀនសូត្រដ៏ល្អបំផុត។`,
      hint: `ស្មារតីសហការ និងភាពក្លាហាន`,
      points: 100,
      matchTarget: `ការពិភាក្សា និងសួរ`
    },
    {
      id: 'gq-5',
      question: `តើអត្ថប្រយោជន៍ចម្បងនៃ «${input.topic}» គឺអ្វី?`,
      options: [`ក. អភិវឌ្ឍសមត្ថភាពគិត និងដោះស្រាយបញ្ហា`, `ខ. គ្រាន់តែឆ្លងកាត់ការប្រឡង`, `គ. គ្មានអត្ថប្រយោជន៍អ្វីទេ`, `ឃ. សម្រាប់តែសិស្សពូកែប៉ុណ្ណោះ`],
      correctAnswer: `ក. អភិវឌ្ឍសមត្ថភាពគិត និងដោះស្រាយបញ្ហា`,
      explanation: `ចំណេះដឹងជួយអភិវឌ្ឍការគិត និងភាពវៃឆ្លាតសម្រាប់អនាគត។`,
      hint: `ការអភិវឌ្ឍខ្លួនឯង`,
      points: 100,
      matchTarget: `អត្ថប្រយោជន៍ចំណេះដឹង`
    }
  ];

  return {
    id: `game-${Date.now()}`,
    title: `ល្បែងសិក្សាឌីជីថល៖ ${input.topic} (${input.subject} ថ្នាក់ទី${input.grade})`,
    subject: input.subject,
    grade: input.grade,
    topic: input.topic,
    gameType: input.gameType,
    difficulty: input.difficulty,
    timeLimitSeconds: input.timeLimitSeconds || 25,
    cardsOrQuestions: cards,
    gameCode: randomPin,
    instructions: `ជ្រើសរើសចម្លើយត្រឹមត្រូវឱ្យបានលឿនបំផុត ដើម្បីទទួលបានពិន្ទុ និងក្លាយជាជើងឯកក្នុងថ្នាក់!`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* ==========================================================================
   DEFAULT SEED CREATIONS
   ========================================================================== */
function getDefaultSeedCreations(): AICreationItem[] {
  return [
    {
      id: 'seed-lp-1',
      type: 'lesson',
      typeNameKh: 'កិច្ចតែងការបង្រៀន (Lesson Plan)',
      title: 'កិច្ចតែងការ៖ វិធីបូក និងដកប្រភាគ (ថ្នាក់ទី៥)',
      subject: 'គណិតវិទ្យា',
      grade: 5,
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      payload: {
        topic: 'វិធីបូក និងដកប្រភាគ',
        durationMinutes: 45,
        objectives: [
          'សិស្សអាចបូក និងដកប្រភាគដែលមានភាគបែងដូចគ្នាបានត្រឹមត្រូវ ១០០%',
          'សិស្សចេះតម្រូវភាគបែងរួមសម្រាប់ប្រភាគដែលមានភាគបែងខុសគ្នា'
        ]
      }
    },
    {
      id: 'seed-sd-1',
      type: 'slide',
      typeNameKh: 'ស្លាយបង្រៀន (Interactive Slides)',
      title: 'ស្លាយមេរៀន៖ ប្រព័ន្ធរំលាយអាហាររបស់មនុស្ស (ថ្នាក់ទី៦)',
      subject: 'វិទ្យាសាស្ត្រ',
      grade: 6,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      payload: {
        topic: 'ប្រព័ន្ធរំលាយអាហាររបស់មនុស្ស',
        theme: 'forest_emerald'
      }
    },
    {
      id: 'seed-curr-1',
      type: 'curriculum',
      typeNameKh: 'បំណែងចែកកម្មវិធីសិក្សា (Curriculum)',
      title: 'បំណែងចែកកម្មវិធីសិក្សា ភាសាខ្មែរ ថ្នាក់ទី៤ (ឆមាសទី១)',
      subject: 'ភាសាខ្មែរ',
      grade: 4,
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      payload: {
        totalWeeks: 15,
        hoursPerWeek: 6
      }
    },
    {
      id: 'seed-test-1',
      type: 'test',
      typeNameKh: 'តេស្តស្តង់ដារ & សំណួរ (Test Paper)',
      title: 'តេស្តស្តង់ដារ Bloom៖ អក្ខរាវិរុទ្ធ និងវេយ្យាករណ៍ (ថ្នាក់ទី៥)',
      subject: 'ភាសាខ្មែរ',
      grade: 5,
      createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
      payload: {
        totalMarks: 50,
        questionCount: 10
      }
    },
    {
      id: 'seed-game-1',
      type: 'game',
      typeNameKh: 'ល្បែងសិក្សាឌីជីថល (Digital Game)',
      title: 'ល្បែងប្រកួតប្រជែងចំណេះដឹងទូទៅកម្ពុជា (ថ្នាក់ទី៦)',
      subject: 'សិក្សាសង្គម',
      grade: 6,
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      payload: {
        gameType: 'classroom_competition',
        gameCode: '829410'
      }
    }
  ];
}
