/**
 * MoEYS Cambodia Primary Curriculum Standards & sala.moeys.gov.kh Validation Service
 * សេវាកម្មផ្ទៀងផ្ទាត់ស្តង់ដារកម្មវិធីសិក្សា និងសៀវភៅពុម្ពរដ្ឋបឋមសិក្សា (ថ្នាក់ទី១ ដល់ ទី៦)
 * ក្រសួងអប់រំ យុវជន និងកីឡា - គេហទំព័រសាលាឌីជីថល (sala.moeys.gov.kh)
 */

import {
  MOEYS_PRIMARY_CURRICULUM_DATABASE,
  MOEYS_PRIMARY_SUBJECTS,
  MoEYSSubjectCurriculum,
  MoEYSTextbookLesson,
  getMoEYSSubjectCurriculum,
  getLessonsBySubjectAndGrade
} from '../data/moeysPrimaryCurriculum';

export interface MoEYSValidationCriterion {
  id: string;
  category: 'textbook_match' | 'pedagogy_5steps' | 'triad_objectives' | 'pacing_hours' | 'assessment_bloom' | 'materials_safety';
  titleKhmer: string;
  status: 'pass' | 'warning' | 'fail';
  score: number;
  maxScore: number;
  messageKhmer: string;
  evidenceKhmer: string;
}

export interface CurriculumValidationReport {
  id: string;
  isValid: boolean;
  totalScore: number; // 0 to 100
  standardLevel: 'កម្រិត៤ (ស្តង់ដារជាតិ MoEYS ឆ្នើម)' | 'កម្រិត៣ (ស្តង់ដារគំរូ)' | 'កម្រិត២ (ស្តង់ដារមធ្យម)' | 'កម្រិត១ (ត្រូវការកែលម្អ)';
  standardLevelScore: 1 | 2 | 3 | 4;
  subject: string;
  grade: number;
  topic: string;
  matchedSubject: string;
  matchedGrade: number;
  matchedTextbook: string;
  matchedCurriculum: MoEYSSubjectCurriculum | null;
  matchedLesson: MoEYSTextbookLesson | null;
  salaMoeysReference: {
    portalUrl: string;
    portalName: string;
    textbookName: string;
    eLearningsAvailable: boolean;
    digitalLibraryResourceUrl: string;
  };
  domainObjectivesAnalysis: {
    knowledgePresent: boolean;
    skillsPresent: boolean;
    attitudePresent: boolean;
    completenessPercentage: number;
    details: string;
  };
  pedagogy5StepsAnalysis: {
    step1Admin: boolean;       // ជំហានទី១៖ រដ្ឋបាលថ្នាក់ (វត្តមាន អនាម័យ វិន័យ)
    step2Review: boolean;      // ជំហានទី២៖ រំលឹកមេរៀនចាស់ & កែសៀវភៅកិច្ចការ
    step3NewLesson: boolean;   // ជំហានទី៣៖ មេរៀនថ្មី (សកម្មភាពគ្រូ-សិស្ស សកម្មភាពបង្រៀនផ្ទាល់)
    step4Reinforce: boolean;   // ជំហានទី៤៖ ពង្រឹងចំណេះដឹង (លំហាត់ក្ដារឆ្នួន សំណួររហ័ស)
    step5Advice: boolean;      // ជំហានទី៥៖ បណ្តាំផ្ញើ កិច្ចការផ្ទះ & អនាម័យ
    completenessRate: number;  // 0 to 100%
  };
  criteria: MoEYSValidationCriterion[];
  complianceBadges: {
    code: string;
    labelKhmer: string;
    type: 'gold' | 'emerald' | 'blue' | 'purple' | 'amber';
    description: string;
  }[];
  warnings: string[];
  recommendations: string[];
  auditedAt: string;
}

/**
 * Clean & normalize Khmer strings for comparison
 */
function normalizeKhmerText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\s\t\n\r]+/g, ' ')
    .replace(/[៖គកិច្ចតែងការ|មេរៀនទី|ជំពូកទី]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Cross-references any lesson plan against the MoEYS Primary Curriculum database & sala.moeys.gov.kh library
 */
export function validateMoEYSLessonPlan(plan: {
  title?: string;
  topic?: string;
  subject?: string;
  grade?: number;
  durationMinutes?: number;
  objectives?: string[];
  materialsList?: string[];
  activities?: any[];
  homework?: string;
  assessment?: string;
  days?: any[]; // for weekly plan
}): CurriculumValidationReport {
  const subject = plan.subject || 'ភាសាខ្មែរ';
  const grade = Number(plan.grade) || 1;
  const topic = plan.topic || plan.title || '';
  const objectives = plan.objectives || [];
  const activities = plan.activities || [];
  const days = plan.days || [];

  const matchedCurriculum = getMoEYSSubjectCurriculum(subject, grade) || null;
  const allLessons = matchedCurriculum ? matchedCurriculum.chapters.flatMap(c => c.lessons) : [];

  // Match specific textbook lesson
  const normTopic = normalizeKhmerText(topic);
  const matchedLesson = allLessons.find(l => {
    const normL = normalizeKhmerText(l.title);
    return normTopic.includes(normL) || normL.includes(normTopic) || (l.keyConcepts && l.keyConcepts.some(k => normTopic.includes(normalizeKhmerText(k))));
  }) || (allLessons.length > 0 ? allLessons[0] : null);

  const criteria: MoEYSValidationCriterion[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const complianceBadges: CurriculumValidationReport['complianceBadges'] = [];

  // 1. TEXTBOOK & SALA.MOEYS.GOV.KH MATCH CHECK (Max 25 pts)
  let textbookScore = 0;
  if (matchedCurriculum) {
    textbookScore += 15;
    if (matchedLesson) {
      textbookScore += 10;
      criteria.push({
        id: 'crit-textbook-1',
        category: 'textbook_match',
        titleKhmer: '១. ភាពត្រូវគ្នានឹងសៀវភៅពុម្ពរដ្ឋ (MoEYS Standard Textbook)',
        status: 'pass',
        score: 25,
        maxScore: 25,
        messageKhmer: `ខ្លឹមសារត្រូវគ្នានឹងសៀវភៅគោល៖ «${matchedCurriculum.textbookTitle}» និងមេរៀនទី ${matchedLesson.lessonNumber} «${matchedLesson.title}»`,
        evidenceKhmer: `ទំព័រ ${matchedLesson.pageRange} • ម៉ោងបង្រៀនកំណត់៖ ${matchedLesson.recommendedPeriods} ម៉ោង • បណ្ណាល័យឌីជីថល៖ sala.moeys.gov.kh`
      });
      complianceBadges.push({
        code: 'MOEYS_TEXTBOOK_ALIGNED',
        labelKhmer: 'ស្របតាមសៀវភៅពុម្ពជាតិ MoEYS',
        type: 'gold',
        description: `ផ្ទៀងផ្ទាត់ត្រូវ ១០០% ជាមួយសៀវភៅ ${matchedCurriculum.textbookTitle}`
      });
    } else {
      criteria.push({
        id: 'crit-textbook-2',
        category: 'textbook_match',
        titleKhmer: '១. ភាពត្រូវគ្នានឹងសៀវភៅពុម្ពរដ្ឋ (MoEYS Standard Textbook)',
        status: 'warning',
        score: 15,
        maxScore: 25,
        messageKhmer: `មុខវិជ្ជាត្រូវគ្នានឹងកម្រិតថ្នាក់ ប៉ុន្តែចំណងជើងមេរៀនជាប្រធានបទបន្ថែម ឬក្រៅសៀវភៅគោលផ្ទាល់`,
        evidenceKhmer: `សៀវភៅគោលពាក់ព័ន្ធ៖ ${matchedCurriculum.textbookTitle}`
      });
      warnings.push(`ចំណងជើងប្រធានបទមិនទាន់ស៊ីគ្នាលម្អិតនឹងឈ្មោះមេរៀនក្នុងសៀវភៅពុម្ពរដ្ឋ`);
      recommendations.push(`សូមផ្ទៀងផ្ទាត់ចំណងជើងមេរៀន និងទំព័រសៀវភៅពុម្ពជាមួយកម្មវិធីសិក្សាផ្លូវការ`);
    }
  } else {
    criteria.push({
      id: 'crit-textbook-3',
      category: 'textbook_match',
      titleKhmer: '១. ភាពត្រូវគ្នានឹងសៀវភៅពុម្ពរដ្ឋ (MoEYS Standard Textbook)',
      status: 'fail',
      score: 5,
      maxScore: 25,
      messageKhmer: `រកមិនឃើញមុខវិជ្ជាស្នូលក្នុងបញ្ជីកម្មវិធីសិក្សាបឋមសិក្សារបស់ក្រសួង`,
      evidenceKhmer: `មុខវិជ្ជាស្នូលបឋមសិក្សា៖ ${MOEYS_PRIMARY_SUBJECTS.join(', ')}`
    });
    warnings.push(`មុខវិជ្ជានេះមិនស្ថិតក្នុងមុខវិជ្ជាស្នូលទាំង ៨ នៃបឋមសិក្សា`);
  }

  // 2. TRIAD LEARNING OBJECTIVES CHECK (ចំណេះដឹង បំណិន ឥរិយាបថ) (Max 25 pts)
  const fullObjText = (objectives.join(' ') + ' ' + (plan.topic || '')).toLowerCase();
  const knowledgePresent = fullObjText.includes('ចំណេះដឹង') || fullObjText.includes('ស្គាល់') || fullObjText.includes('យល់') || fullObjText.includes('ប្រាប់') || fullObjText.includes('កំណត់');
  const skillsPresent = fullObjText.includes('បំណិន') || fullObjText.includes('ចេះ') || fullObjText.includes('អនុវត្ត') || fullObjText.includes('សរសេរ') || fullObjText.includes('អាន') || fullObjText.includes('គណនា');
  const attitudePresent = fullObjText.includes('ឥរិយាបថ') || fullObjText.includes('ស្រឡាញ់') || fullObjText.includes('សហការ') || fullObjText.includes('យកចិត្តទុកដាក់') || fullObjText.includes('ស្មោះត្រង់') || fullObjText.includes('អនាម័យ') || fullObjText.includes('វិន័យ');

  let triadCount = (knowledgePresent ? 1 : 0) + (skillsPresent ? 1 : 0) + (attitudePresent ? 1 : 0);
  let triadScore = triadCount === 3 ? 25 : triadCount === 2 ? 18 : triadCount === 1 ? 10 : 5;

  criteria.push({
    id: 'crit-triad-obj',
    category: 'triad_objectives',
    titleKhmer: '២. គោលបំណងវិស័យទាំង ៣ តាមគរុកោសល្យ (ចំណេះដឹង បំណិន ឥរិយាបថ)',
    status: triadCount === 3 ? 'pass' : triadCount >= 2 ? 'warning' : 'fail',
    score: triadScore,
    maxScore: 25,
    messageKhmer: triadCount === 3
      ? 'បានបញ្ជាក់ពេញលេញទាំង ៣ វិស័យ៖ ចំណេះដឹង (Knowledge), បំណិន (Skills), និងឥរិយាបថ (Attitude)'
      : `បានបញ្ជាក់តែ ${triadCount}/៣ វិស័យប៉ុណ្ណោះ។ ខ្វះ៖ ${[!knowledgePresent && 'ចំណេះដឹង', !skillsPresent && 'បំណិន', !attitudePresent && 'ឥរិយាបថ'].filter(Boolean).join(', ')}`,
    evidenceKhmer: objectives.length > 0 ? objectives.slice(0, 3).join(' | ') : 'គោលបំណងទូទៅ'
  });

  if (triadCount === 3) {
    complianceBadges.push({
      code: 'TRIAD_OBJECTIVES_CERTIFIED',
      labelKhmer: 'គោលបំណងវិស័យទាំង៣ ពេញលេញ',
      type: 'emerald',
      description: 'បំពេញគ្រប់លក្ខខណ្ឌ ចំណេះដឹង បំណិន និងឥរិយាបថ ស្របតាមគរុកោសល្យកម្ពុជា'
    });
  } else {
    recommendations.push(`សូមបន្ថែមគោលបំណងផ្នែក «${[!knowledgePresent && 'ចំណេះដឹង', !skillsPresent && 'បំណិន', !attitudePresent && 'ឥរិយាបថ'].filter(Boolean).join(', ')}» ឱ្យបានច្បាស់លាស់`);
  }

  // 3. 5-STEP MOEYS PEDAGOGICAL STRUCTURE INTEGRITY (Max 25 pts)
  // Check if 5-step sequence is maintained
  let activitiesText = '';
  if (activities.length > 0) {
    activitiesText = activities.map(a => `${a.stepTitle || ''} ${a.teacherAction || ''} ${a.studentAction || ''} ${a.purpose || ''}`).join(' ');
  } else if (days.length > 0) {
    activitiesText = days.map(d => `${d.dayKhmer || ''} ${d.lessonTitle || ''} ${d.step1Admin || ''} ${d.step2Review || ''} ${d.step3NewLesson || ''} ${d.step4Reinforce || ''} ${d.step5Advice || ''}`).join(' ');
  }

  const sText = activitiesText.toLowerCase();
  const step1Admin = sText.includes('ជំហានទី១') || sText.includes('រដ្ឋបាល') || sText.includes('អវត្តមាន') || sText.includes('អនាម័យ') || sText.includes('វិន័យ');
  const step2Review = sText.includes('ជំហានទី២') || sText.includes('រំលឹក') || sText.includes('មេរៀនចាស់') || sText.includes('កិច្ចការផ្ទះ') || sText.includes('កែសៀវភៅ');
  const step3NewLesson = sText.includes('ជំហានទី៣') || sText.includes('មេរៀនថ្មី') || sText.includes('ពន្យល់') || sText.includes('ឧទាហរណ៍') || sText.includes('សកម្មភាព');
  const step4Reinforce = sText.includes('ជំហានទី៤') || sText.includes('ពង្រឹង') || sText.includes('ក្ដារឆ្នួន') || sText.includes('លំហាត់') || sText.includes('សំណួរ');
  const step5Advice = sText.includes('ជំហានទី៥') || sText.includes('បណ្តាំ') || sText.includes('កិច្ចការផ្ទះ') || sText.includes('អប់រំសីលធម៌') || sText.includes('ដាស់តឿន');

  const stepsFoundCount = (step1Admin ? 1 : 0) + (step2Review ? 1 : 0) + (step3NewLesson ? 1 : 0) + (step4Reinforce ? 1 : 0) + (step5Advice ? 1 : 0);
  const stepScore = Math.round((stepsFoundCount / 5) * 25);

  criteria.push({
    id: 'crit-pedagogy-5step',
    category: 'pedagogy_5steps',
    titleKhmer: '៣. រចនាសម្ព័ន្ធគរុកោសល្យ ៥ ជំហានផ្លូវការ (5-Step MoEYS Sequence)',
    status: stepsFoundCount === 5 ? 'pass' : stepsFoundCount >= 3 ? 'warning' : 'fail',
    score: stepScore,
    maxScore: 25,
    messageKhmer: stepsFoundCount === 5
      ? 'បានអនុវត្តគ្រប់ទាំង ៥ ជំហាន (រដ្ឋបាលថ្នាក់, រំលឹកមេរៀនចាស់, មេរៀនថ្មី, ពង្រឹងចំណេះដឹង, បណ្តាំផ្ញើ)'
      : `បានអនុវត្ត ${stepsFoundCount}/៥ ជំហាន។ ខ្វះ៖ ${[!step1Admin && 'ជំហានទី១ (រដ្ឋបាលថ្នាក់)', !step2Review && 'ជំហានទី២ (រំលឹកមេរៀន)', !step3NewLesson && 'ជំហានទី៣ (មេរៀនថ្មី)', !step4Reinforce && 'ជំហានទី៤ (ពង្រឹង)', !step5Advice && 'ជំហានទី៥ (បណ្តាំផ្ញើ)'].filter(Boolean).join(', ')}`,
    evidenceKhmer: `កម្រិតបំពេញ ៥ ជំហាន៖ ${Math.round((stepsFoundCount / 5) * 100)}%`
  });

  if (stepsFoundCount === 5) {
    complianceBadges.push({
      code: 'MOEYS_5STEPS_COMPLIANT',
      labelKhmer: 'រចនាសម្ព័ន្ធ ៥ ជំហានត្រឹមត្រូវ',
      type: 'blue',
      description: 'អនុវត្តតាមក្បួនគរុកោសល្យបឋមសិក្សាកម្ពុជាពីជំហានទី១ ដល់ទី៥ ឥតចន្លោះ'
    });
  }

  // 4. ACTIVE LEARNING & INCLUSIVE PEDAGOGY / BLOOM TAXONOMY (Max 25 pts)
  let activeScore = 18;
  const hasGame = activitiesText.includes('ល្បែង') || activitiesText.includes('game') || activitiesText.includes('ក្រុម') || activitiesText.includes('ក្ដារឆ្នួន') || activitiesText.includes('ប័ណ្ណ');
  const hasMaterials = (plan.materialsList && plan.materialsList.length > 0) || activitiesText.includes('សៀវភៅពុម្ព') || activitiesText.includes('រូបភាព');
  const hasAssessment = !!plan.assessment || !!plan.homework || step4Reinforce;

  if (hasGame) activeScore += 3;
  if (hasMaterials) activeScore += 2;
  if (hasAssessment) activeScore += 2;
  activeScore = Math.min(25, activeScore);

  criteria.push({
    id: 'crit-active-learning',
    category: 'assessment_bloom',
    titleKhmer: '៤. វិធីសាស្ត្របង្រៀនសកម្ម និងការវាស់វែងសមត្ថភាព (Active Learning & Assessment)',
    status: activeScore >= 20 ? 'pass' : 'warning',
    score: activeScore,
    maxScore: 25,
    messageKhmer: hasGame
      ? 'មានសកម្មភាពរៀនសកម្មតាមរយៈល្បែងសិក្សា ការពិភាក្សាជាក្រុម និងការប្រើក្តារឆ្នួន/ប័ណ្ណរូបភាព'
      : 'មានសកម្មភាពបង្រៀនតាមលំដាប់លំដោយ គួរតែបន្ថែមល្បែងសិក្សា ឬការអនុវត្តជាក្រុមដើម្បីបង្កើនចំណាប់អារម្មណ៍',
    evidenceKhmer: `សម្ភារឧបទេស៖ ${(plan.materialsList || ['សៀវភៅពុម្ព', 'ក្ដារខៀន']).join(', ')}`
  });

  if (hasGame && hasMaterials) {
    complianceBadges.push({
      code: 'ACTIVE_STUDENT_CENTERED',
      labelKhmer: 'សិស្សមជ្ឈមណ្ឌល (Active Learning)',
      type: 'purple',
      description: 'មានបញ្ចូលល្បែងសិក្សា ការសហការជាក្រុម និងការប្រើប្រាស់សម្ភារឧបទេសចម្រុះ'
    });
  }

  // Compute Total Score
  const totalScore = textbookScore + triadScore + stepScore + activeScore;
  let standardLevel: CurriculumValidationReport['standardLevel'] = 'កម្រិត៤ (ស្តង់ដារជាតិ MoEYS ឆ្នើម)';
  let standardLevelScore: 1 | 2 | 3 | 4 = 4;

  if (totalScore >= 90) {
    standardLevel = 'កម្រិត៤ (ស្តង់ដារជាតិ MoEYS ឆ្នើម)';
    standardLevelScore = 4;
  } else if (totalScore >= 75) {
    standardLevel = 'កម្រិត៣ (ស្តង់ដារគំរូ)';
    standardLevelScore = 3;
  } else if (totalScore >= 60) {
    standardLevel = 'កម្រិត២ (ស្តង់ដារមធ្យម)';
    standardLevelScore = 2;
  } else {
    standardLevel = 'កម្រិត១ (ត្រូវការកែលម្អ)';
    standardLevelScore = 1;
  }

  const isValid = totalScore >= 60;

  return {
    id: `val-report-${Date.now()}`,
    isValid,
    totalScore,
    standardLevel,
    standardLevelScore,
    subject,
    grade,
    topic,
    matchedSubject: matchedCurriculum ? matchedCurriculum.subjectNameKh : subject,
    matchedGrade: matchedCurriculum ? matchedCurriculum.grade : grade,
    matchedTextbook: matchedCurriculum ? matchedCurriculum.textbookTitle : `សៀវភៅពុម្ព ${subject} ថ្នាក់ទី${grade}`,
    matchedCurriculum,
    matchedLesson,
    salaMoeysReference: {
      portalUrl: 'https://sala.moeys.gov.kh/index.php',
      portalName: 'សាលាឌីជីថល MoEYS (Sala Digital Portal)',
      textbookName: matchedCurriculum ? matchedCurriculum.textbookTitle : `សៀវភៅសិក្សាគោល ${subject} ថ្នាក់ទី${grade}`,
      eLearningsAvailable: true,
      digitalLibraryResourceUrl: `https://sala.moeys.gov.kh/index.php?subject=${encodeURIComponent(subject)}&grade=${grade}`
    },
    domainObjectivesAnalysis: {
      knowledgePresent,
      skillsPresent,
      attitudePresent,
      completenessPercentage: Math.round((triadCount / 3) * 100),
      details: `ចំណេះដឹង: ${knowledgePresent ? '✓' : '✗'} | បំណិន: ${skillsPresent ? '✓' : '✗'} | ឥរិយាបថ: ${attitudePresent ? '✓' : '✗'}`
    },
    pedagogy5StepsAnalysis: {
      step1Admin,
      step2Review,
      step3NewLesson,
      step4Reinforce,
      step5Advice,
      completenessRate: Math.round((stepsFoundCount / 5) * 100)
    },
    criteria,
    complianceBadges,
    warnings,
    recommendations,
    auditedAt: new Date().toISOString()
  };
}

/**
 * Validate slide deck against MoEYS curriculum standards
 */
export function validateMoEYSSlideDeck(deck: {
  topic?: string;
  subject?: string;
  grade?: number;
  slides?: any[];
}): CurriculumValidationReport {
  const slides = deck.slides || [];
  const fakeActivities = slides.map(s => ({
    stepTitle: s.title || '',
    teacherAction: s.content || '',
    studentAction: (s.bulletPoints || []).join(' '),
    purpose: s.teacherNotes || ''
  }));

  return validateMoEYSLessonPlan({
    title: deck.topic,
    topic: deck.topic,
    subject: deck.subject,
    grade: deck.grade,
    activities: fakeActivities
  });
}
