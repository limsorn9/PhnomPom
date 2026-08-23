/**
 * Official Ministry of Education, Youth and Sport (MoEYS) Cambodia
 * Primary School Curriculum & Model Primary School Standards Database
 * ក្រសួងអប់រំ យុវជន និងកីឡា - កម្មវិធីសិក្សាលម្អិតបឋមសិក្សារដ្ឋ និងស្តង់ដារសាលាបឋមសិក្សាគំរូ (ថ្នាក់ទី១ ដល់ ទី៦)
 */

export interface MoEYSTextbookLesson {
  id: string;
  lessonNumber: number;
  title: string;
  titleEn?: string;
  pageRange: string;
  semester: 1 | 2;
  recommendedPeriods: number;
  objectives: {
    knowledge: string;
    skills: string;
    attitude: string;
  };
  keyConcepts: string[];
  suggestedMaterials: string[];
  suggestedGameTemplate: string;
  gameActivityKh: string;
  sampleQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface MoEYSSubjectCurriculum {
  subjectKey: string;
  subjectNameKh: string;
  grade: number;
  totalAnnualHours: number;
  periodsPerWeek: number;
  textbookTitle: string;
  coreCompetency: string;
  chapters: {
    chapterNumber: number;
    chapterTitle: string;
    lessons: MoEYSTextbookLesson[];
  }[];
}

// MoEYS Model Primary School 5 Standards and 27 Indicators
export interface MoEYSModelSchoolIndicator {
  id: string;
  standardId: number;
  standardNameKh: string;
  indicatorNumber: string;
  indicatorTitle: string;
  description: string;
  criteriaLevel1: string; // កម្រិត១ (មូលដ្ឋាន)
  criteriaLevel2: string; // កម្រិត២ (មធ្យម)
  criteriaLevel3: string; // កម្រិត៣ (ឆ្នើម/គំរូ)
  maxScore: number;
  evidenceRequired: string[];
}

export const MOEYS_MODEL_SCHOOL_STANDARDS: {
  id: number;
  standardNumber: number;
  titleKh: string;
  titleEn: string;
  description: string;
  indicators: MoEYSModelSchoolIndicator[];
}[] = [
  {
    id: 1,
    standardNumber: 1,
    titleKh: 'ស្តង់ដារទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
    titleEn: 'Standard 1: Student Learning Outcomes',
    description: 'វាស់វែងសមត្ថភាពចំណេះដឹង បំណិន ឥរិយាបថ អាហារូបត្ថម្ភ និងអត្រាឡើងថ្នាក់ ត្រួតថ្នាក់ និងបោះបង់ការសិក្សារបស់សិស្ស។',
    indicators: [
      {
        id: 'std1_ind1',
        standardId: 1,
        standardNameKh: 'ស្តង់ដារទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
        indicatorNumber: 'សូចនាករ ១.១',
        indicatorTitle: 'សមត្ថភាពអំណាន និងសំណេរភាសាខ្មែរ (ថ្នាក់ទី១ ដល់ ទី៦)',
        description: 'សិស្សគ្រប់កម្រិតថ្នាក់អាចអាន និងសរសេរបានត្រឹមត្រូវស្របតាមកម្រិតស្តង់ដារជាតិ (Early Grade Reading Assessment - EGRA)។',
        criteriaLevel1: 'សិស្សយ៉ាងតិច ៦០% អាននិងសរសេរបានតាមកម្រិតថ្នាក់',
        criteriaLevel2: 'សិស្សពី ៧០% ទៅ ៨៤% អាននិងសរសេរបានស្ទាត់ជំនាញ',
        criteriaLevel3: 'សិស្សចាប់ពី ៨៥% ឡើងទៅអាននិងសរសេរបានស្ទាត់ជំនាញ និងមានការគាំទ្រសិស្សរៀនយឺតជាប្រចាំ',
        maxScore: 5,
        evidenceRequired: ['លទ្ធផលតេស្តអំណាន EGRA', 'សៀវភៅតាមដានការអានរបស់សិស្ស', 'តារាងពិន្ទុប្រចាំខែ']
      },
      {
        id: 'std1_ind2',
        standardId: 1,
        standardNameKh: 'ស្តង់ដារទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
        indicatorNumber: 'សូចនាករ ១.២',
        indicatorTitle: 'សមត្ថភាពគណិតវិទ្យា (ថ្នាក់ទី១ ដល់ ទី៦)',
        description: 'សិស្សមានជំនាញគណនាលេខ និងដោះស្រាយចំណោទតាមកម្រិតថ្នាក់ (EGMA)។',
        criteriaLevel1: 'សិស្សយ៉ាងតិច ៦០% ទទួលបាននិទ្ទេសមធ្យមឡើងលើ',
        criteriaLevel2: 'សិស្សពី ៧០% ទៅ ៨៤% ចេះដោះស្រាយចំណោទបានត្រឹមត្រូវ',
        criteriaLevel3: 'សិស្សចាប់ពី ៨៥% ឡើងទៅមានពិន្ទុល្អ និងមានក្លឹបគណិតវិទ្យាអនុវត្តជាក់ស្តែង',
        maxScore: 5,
        evidenceRequired: ['លទ្ធផលតេស្ត EGMA', 'សន្លឹកកិច្ចការគណិតវិទ្យា', 'កំណត់ត្រាសិស្សរៀនយឺត']
      },
      {
        id: 'std1_ind3',
        standardId: 1,
        standardNameKh: 'ស្តង់ដារទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
        indicatorNumber: 'សូចនាករ ១.៣',
        indicatorTitle: 'អត្រាឡើងថ្នាក់ និងការបញ្ចប់កម្រិតបឋមសិក្សា',
        description: 'អត្រាសិស្សបានឡើងថ្នាក់ខ្ពស់ និងបញ្ចប់ការសិក្សាថ្នាក់ទី៦ យ៉ាងតិច ៩០%។',
        criteriaLevel1: 'អត្រាឡើងថ្នាក់ពី ៨០% ទៅ ៨៩%',
        criteriaLevel2: 'អត្រាឡើងថ្នាក់ពី ៩០% ទៅ ៩៥%',
        criteriaLevel3: 'អត្រាឡើងថ្នាក់ចាប់ពី ៩៦% ឡើងទៅ និងអត្រាបោះបង់ក្រោម ២%',
        maxScore: 5,
        evidenceRequired: ['ស្ថិតិសិស្សឡើងថ្នាក់', 'បញ្ជីបញ្ចប់ការបឋមសិក្សា', 'សៀវភៅតាមដានអវត្តមាន']
      },
      {
        id: 'std1_ind4',
        standardId: 1,
        standardNameKh: 'ស្តង់ដារទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
        indicatorNumber: 'សូចនាករ ១.៤',
        indicatorTitle: 'ឥរិយាបថ សីលធម៌ វិន័យ និងការគោរពសិទ្ធិមនុស្ស',
        description: 'សិស្សមានសីលធម៌ល្អ ស្រឡាញ់ជាតិ គោរពច្បាប់ មិនមានអំពើហិង្សា និងចេះជួយគ្នាទៅវិញទៅមក។',
        criteriaLevel1: 'មានការណែនាំវិន័យជាប្រចាំ និងគ្មានអំពើហិង្សាធ្ងន់ធ្ងរ',
        criteriaLevel2: 'សិស្សអនុវត្តបទបញ្ជាផ្ទៃក្នុងបានល្អ និងចូលរួមសកម្មភាពមនុស្សធម៌',
        criteriaLevel3: 'សិស្សទាំងអស់គោរពវិន័យខ្ជាប់ខ្ជួន និងបង្កើតបានបរិយាកាសសាលាមិត្តភាពគំរូ',
        maxScore: 5,
        evidenceRequired: ['កំណត់ហេតុកិច្ចប្រជុំក្រុមប្រឹក្សាកុមារ', 'សៀវភៅវិន័យថ្នាក់', 'សកម្មភាពសង្គម']
      },
      {
        id: 'std1_ind5',
        standardId: 1,
        standardNameKh: 'ស្តង់ដារទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
        indicatorNumber: 'សូចនាករ ១.៥',
        indicatorTitle: 'សុខភាព អនាម័យ និងអាហារូបត្ថម្ភរបស់សិស្ស',
        description: 'សិស្សមានសុខភាពល្អ ទទួលបានការពិនិត្យសុខភាព អនាម័យទឹកស្អាត និងការពិសារអាហារមានសុវត្ថិភាព។',
        criteriaLevel1: 'មានកន្លែងលាងដៃ និងបន្ទប់ទឹកស្អាត',
        criteriaLevel2: 'មានការពិនិត្យសុខភាព និងលាងដៃមុនហូបអាហារជាប្រចាំ',
        criteriaLevel3: 'សាលាគ្មានចំណីអាហារហាមឃាត់ មានទឹកស្អាតផឹក ១០០% និងមានសួនបន្លែអាហារូបត្ថម្ភ',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅតាមដានសុខភាពសិស្ស', 'កិច្ចសន្យាអ្នកលក់ដូរក្នុងសាលា', 'រូបភាពសកម្មភាពលាងដៃ']
      },
      {
        id: 'std1_ind6',
        standardId: 1,
        standardNameKh: 'ស្តង់ដារទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
        indicatorNumber: 'សូចនាករ ១.៦',
        indicatorTitle: 'បំណិនសតវត្សរ៍ទី២១ និងការប្រើប្រាស់បច្ចេកវិទ្យាឌីជីថល',
        description: 'សិស្សចេះសហការជាក្រុម គិតពិចារណា និងចេះប្រើប្រាស់ឧបករណ៍ឌីជីថលក្នុងការរៀនសូត្រ។',
        criteriaLevel1: 'សិស្សបានស្គាល់ឧបករណ៍បច្ចេកវិទ្យាខ្លះៗ',
        criteriaLevel2: 'សិស្សប្រើកម្មវិធីរៀនឌីជីថល និងល្បែងសិក្សាជាប្រចាំ',
        criteriaLevel3: 'សិស្សអាចស្រាវជ្រាវ និងផលិតស្នាដៃសិក្សាតាមប្រព័ន្ធឌីជីថលបានស្ទាត់ជំនាញ',
        maxScore: 5,
        evidenceRequired: ['របាយការណ៍ម៉ោងកុំព្យូទ័រ/ថេប្លេត', 'ស្នាដៃឌីជីថលរបស់សិស្ស', 'រូបភាពសកម្មភាព']
      }
    ]
  },
  {
    id: 2,
    standardNumber: 2,
    titleKh: 'ស្តង់ដារទី២៖ ការបង្រៀន និងរៀន',
    titleEn: 'Standard 2: Teaching and Learning Process',
    description: 'វាយតម្លៃលើគុណភាពនៃការរៀបចំកិច្ចតែងការបង្រៀន វិធីសាស្ត្របង្រៀនតាមបែបសកម្ម ការប្រើប្រាស់សម្ភារឧបទេស និងការវាយតម្លៃលទ្ធផលសិក្សា។',
    indicators: [
      {
        id: 'std2_ind1',
        standardId: 2,
        standardNameKh: 'ស្តង់ដារទី២៖ ការបង្រៀន និងរៀន',
        indicatorNumber: 'សូចនាករ ២.១',
        indicatorTitle: 'ការរៀបចំកិច្ចតែងការបង្រៀនតាមស្តង់ដារគរុកោសល្យ ៥ ជំហាន',
        description: 'គ្រូគ្រប់រូបមានកិច្ចតែងការបង្រៀនជាប្រចាំសប្តាហ៍ និងប្រចាំថ្ងៃ ស្របតាមកាលវិភាគ និងកម្មវិធីសិក្សាជាតិ។',
        criteriaLevel1: 'គ្រូមានកិច្ចតែងការយ៉ាងតិច ៧០% នៃម៉ោងបង្រៀន',
        criteriaLevel2: 'គ្រូមានកិច្ចតែងការគ្រប់ម៉ោង និងអនុវត្តតាមលំដាប់លំដោយ',
        criteriaLevel3: 'កិច្ចតែងការមានការច្នៃប្រឌិតខ្ពស់ បែងចែកចំណេះដឹង បំណិន ឥរិយាបថ និងមានផែនការគាំទ្រសិស្សរៀនយឺតជាក់ស្តែង',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅកិច្ចតែងការដែលបានចុះហត្ថលេខាឯកភាពដោយនាយក', 'កាលវិភាគបង្រៀន']
      },
      {
        id: 'std2_ind2',
        standardId: 2,
        standardNameKh: 'ស្តង់ដារទី២៖ ការបង្រៀន និងរៀន',
        indicatorNumber: 'សូចនាករ ២.២',
        indicatorTitle: 'វិធីសាស្ត្របង្រៀនដែលសិស្សជាមជ្ឈមណ្ឌល (Student-Centered)',
        description: 'គ្រូប្រើប្រាស់វិធីសាស្ត្របង្រៀនសកម្ម ការពិភាក្សាជាក្រុម ល្បែងសិក្សា និងការពិសោធន៍ជាក់ស្តែង។',
        criteriaLevel1: 'គ្រូប្រើវិធីសាស្ត្រចម្រុះក្នុងថ្នាក់',
        criteriaLevel2: 'សិស្សបានចូលរួមសកម្មភាពក្រុម និងល្បែងសិក្សាជាប្រចាំ',
        criteriaLevel3: 'ការបង្រៀនមានភាពរស់រវើក សិស្សអនុវត្តដោយផ្ទាល់ និងមានស្មារតីម្ចាស់ការខ្ពស់',
        maxScore: 5,
        evidenceRequired: ['កំណត់ហេតុអធិការកិច្ចផ្ទៃក្នុង', 'រូបភាពសកម្មភាពក្នុងថ្នាក់', 'សន្លឹកកិច្ចការក្រុម']
      },
      {
        id: 'std2_ind3',
        standardId: 2,
        standardNameKh: 'ស្តង់ដារទី២៖ ការបង្រៀន និងរៀន',
        indicatorNumber: 'សូចនាករ ២.៣',
        indicatorTitle: 'ការផលិត និងប្រើប្រាស់សម្ភារឧបទេសបង្រៀន',
        description: 'គ្រូប្រើប្រាស់សម្ភារឧបទេសជាក់ស្តែង ប័ណ្ណពាក្យ ប័ណ្ណរូបភាព និងសម្ភារក្នុងតំបន់មកជំនួយដល់ការបង្រៀន។',
        criteriaLevel1: 'មានសម្ភារឧបទេសប្រើប្រាស់ម្តងម្កាល',
        criteriaLevel2: 'ប្រើប្រាស់សម្ភារឧបទេសស្របតាមមេរៀនជាប្រចាំ',
        criteriaLevel3: 'គ្រូនិងសិស្សបានរួមគ្នាផលិតសម្ភារឧបទេសពីវត្ថុធាតុដើមក្នុងស្រុក និងប្រើប្រាស់ឧបករណ៍ឌីជីថលជំនួយ',
        maxScore: 5,
        evidenceRequired: ['បញ្ជីសារពើភណ្ឌសម្ភារឧបទេស', 'កម្រងរូបភាពសម្ភារច្នៃប្រឌិត']
      },
      {
        id: 'std2_ind4',
        standardId: 2,
        standardNameKh: 'ស្តង់ដារទី២៖ ការបង្រៀន និងរៀន',
        indicatorNumber: 'សូចនាករ ២.៤',
        indicatorTitle: 'ការវាយតម្លៃលទ្ធផលសិក្សាជាប្រចាំ និងទៀងទាត់',
        description: 'គ្រូវាយតម្លៃការសិក្សាតាមរយៈការសង្កេត តេស្តខ្លី កិច្ចការផ្ទះ និងការប្រឡងប្រចាំខែ/ឆមាស។',
        criteriaLevel1: 'មានការដាក់ពិន្ទុប្រចាំខែត្រឹមត្រូវ',
        criteriaLevel2: 'មានការកែកិច្ចការផ្ទះ និងតេស្តពង្រឹងសមត្ថភាពទៀងទាត់',
        criteriaLevel3: 'មានការវិភាគលទ្ធផលពិន្ទុ ដើម្បីកែលម្អការបង្រៀន និងជួយសិស្សទាន់ពេលវេលា',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅបញ្ជីពិន្ទុប្រចាំខែ', 'កម្រងវិញ្ញាសាតេស្ត', 'របាយការណ៍វិភាគលទ្ធផល']
      },
      {
        id: 'std2_ind5',
        standardId: 2,
        standardNameKh: 'ស្តង់ដារទី២៖ ការបង្រៀន និងរៀន',
        indicatorNumber: 'សូចនាករ ២.៥',
        indicatorTitle: 'ការបង្រៀនបំប៉ន និងគាំទ្រសិស្សរៀនយឺត (Remedial Teaching)',
        description: 'មានការកំណត់មុខសញ្ញាសិស្សរៀនយឺត និងរៀបចំកាលវិភាគបង្រៀនបំប៉នបន្ថែមដោយឥតគិតថ្លៃ។',
        criteriaLevel1: 'មានកំណត់សិស្សរៀនយឺតក្នុងថ្នាក់',
        criteriaLevel2: 'មានការបង្រៀនបំប៉នយ៉ាងតិច ១-២ ម៉ោងក្នុងមួយសប្តាហ៍',
        criteriaLevel3: 'សិស្សរៀនយឺតជាង ៨០% មានការរីកចម្រើនគួរឱ្យកត់សម្គាល់ និងឆ្លងផុតកម្រិតគ្រោះថ្នាក់',
        maxScore: 5,
        evidenceRequired: ['បញ្ជីឈ្មោះសិស្សរៀនយឺត', 'កាលវិភាគបង្រៀនបំប៉ន', 'តារាងប្រៀបធៀបលទ្ធផលមុន-ក្រោយ']
      },
      {
        id: 'std2_ind6',
        standardId: 2,
        standardNameKh: 'ស្តង់ដារទី២៖ ការបង្រៀន និងរៀន',
        indicatorNumber: 'សូចនាករ ២.៦',
        indicatorTitle: 'ការអភិវឌ្ឍវិជ្ជាជីវៈជាប្រចាំតាមរយៈកម្រងគរុកោសល្យ (Teacher PLC)',
        description: 'លោកគ្រូ-អ្នកគ្រូបានចូលរួមកិច្ចប្រជុំកម្រង បង្រៀនសាកល្បង និងចែករំលឹកបទពិសោធន៍បង្រៀន។',
        criteriaLevel1: 'ចូលរួមកិច្ចប្រជុំកម្រងតាមការកោះអញ្ជើញ',
        criteriaLevel2: 'ចូលរួមទៀងទាត់ និងមានការបង្រៀនសាកល្បង',
        criteriaLevel3: 'មានការផ្តួចផ្តើមគំនិតច្នៃប្រឌិត និងការកែលម្អការបង្រៀនជាក់ស្តែងជាប្រចាំ',
        maxScore: 5,
        evidenceRequired: ['កំណត់ហេតុកិច្ចប្រជុំកម្រង', 'កាលវិភាគ PLC', 'ឯកសារចែករំលែកបទពិសោធន៍']
      }
    ]
  },
  {
    id: 3,
    standardNumber: 3,
    titleKh: 'ស្តង់ដារទី៣៖ ការចូលរួមរបស់សហគមន៍',
    titleEn: 'Standard 3: Community & Parental Engagement',
    description: 'វាយតម្លៃលើកិច្ចសហការរវាងសាលារៀន គណៈកម្មការទ្រទ្រង់សាលា អាជ្ញាធរមូលដ្ឋាន និងមាតាបិតាសិស្ស។',
    indicators: [
      {
        id: 'std3_ind1',
        standardId: 3,
        standardNameKh: 'ស្តង់ដារទី៣៖ ការចូលរួមរបស់សហគមន៍',
        indicatorNumber: 'សូចនាករ ៣.១',
        indicatorTitle: 'ដំណើរការគណៈកម្មការទ្រទ្រង់សាលារៀន (School Support Committee)',
        description: 'គណៈកម្មការទ្រទ្រង់សាលាត្រូវបានបង្កើត និងដំណើរការប្រជុំត្រួតពិនិត្យការងារជាប្រចាំ។',
        criteriaLevel1: 'មានរចនាសម្ព័ន្ធគណៈកម្មការ',
        criteriaLevel2: 'មានការប្រជុំត្រីមាស និងជួយកិច្ចការសាលា',
        criteriaLevel3: 'គណៈកម្មការដើរតួនាទីយ៉ាងសកម្មក្នុងការកៀរគរធនធាន និងគាំទ្រការអភិវឌ្ឍសាលា',
        maxScore: 5,
        evidenceRequired: ['សេចក្តីសម្រេចស្តីពីការបង្កើតគណៈកម្មការ', 'កំណត់ហេតុកិច្ចប្រជុំ']
      },
      {
        id: 'std3_ind2',
        standardId: 3,
        standardNameKh: 'ស្តង់ដារទី៣៖ ការចូលរួមរបស់សហគមន៍',
        indicatorNumber: 'សូចនាករ ៣.២',
        indicatorTitle: 'កិច្ចប្រជុំមាតាបិតាសិស្ស និងការរាយការណ៍លទ្ធផលសិក្សា',
        description: 'សាលារៀបចំកិច្ចប្រជុំមាតាបិតាយ៉ាងតិច ២ ដងក្នុងមួយឆ្នាំ និងផ្តល់សៀវភៅតាមដានការសិក្សា។',
        criteriaLevel1: 'ប្រជុំមាតាបិតា ១ ដងក្នុងមួយឆ្នាំ',
        criteriaLevel2: 'ប្រជុំ ២ ដងក្នុងមួយឆ្នាំ និងមានមាតាបិតាចូលរួមលើសពី ៧០%',
        criteriaLevel3: 'មាតាបិតាចូលរួមលើសពី ៨៥% និងមានការចុះហត្ថលេខាលើកិច្ចព្រមព្រៀងអប់រំកូន',
        maxScore: 5,
        evidenceRequired: ['បញ្ជីវត្តមានមាតាបិតា', 'រូបភាពកិច្ចប្រជុំ', 'សៀវភៅទំនាក់ទំនង']
      },
      {
        id: 'std3_ind3',
        standardId: 3,
        standardNameKh: 'ស្តង់ដារទី៣៖ ការចូលរួមរបស់សហគមន៍',
        indicatorNumber: 'សូចនាករ ៣.៣',
        indicatorTitle: 'ការកៀរគរធនធានសហគមន៍ និងសប្បុរសជន',
        description: 'សហគមន៍បានបរិច្ចាគថវិកា សម្ភារ ឬកម្លាំងពលកម្មក្នុងការកសាងហេដ្ឋារចនាសម្ព័ន្ធសាលា។',
        criteriaLevel1: 'មានការចូលរួមពីសហគមន៍ខ្លះៗ',
        criteriaLevel2: 'មានការជួយជួសជុលសាលា និងដាំដើមឈើ',
        criteriaLevel3: 'កៀរគរបានធនធានច្បាស់លាស់ តម្លាភាព និងមានរបាយការណ៍ហិរញ្ញវត្ថុជាសាធារណៈ',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅកត់ត្រាការបរិច្ចាគ', 'ប័ណ្ណថ្លែងអំណរគុណ', 'រូបភាពសមិទ្ធផល']
      },
      {
        id: 'std3_ind4',
        standardId: 3,
        standardNameKh: 'ស្តង់ដារទី៣៖ ការចូលរួមរបស់សហគមន៍',
        indicatorNumber: 'សូចនាករ ៣.៤',
        indicatorTitle: 'ការជំរុញកុមារក្នុងវ័យសិក្សាឱ្យចូលរៀន ១០០%',
        description: 'សហការជាមួយអាជ្ញាធរមូលដ្ឋានចុះធ្វើជំរឿនកុមារ និងទប់ស្កាត់ការបោះបង់ការសិក្សា។',
        criteriaLevel1: 'កុមារក្នុងភូមិចូលរៀនបានជាង ៨៥%',
        criteriaLevel2: 'កុមារចូលរៀនបានពី ៩០% ទៅ ៩៧%',
        criteriaLevel3: 'កុមារអាយុ ៦ ឆ្នាំក្នុងភូមិចូលរៀន ១០០% រួមទាំងកុមារមានពិការភាព និងកុមារងាយរងគ្រោះ',
        maxScore: 5,
        evidenceRequired: ['ទិន្នន័យជំរឿនកុមារក្នុងភូមិ', 'បញ្ជីឈ្មោះសិស្សចុះឈ្មោះថ្មី']
      }
    ]
  },
  {
    id: 4,
    standardNumber: 4,
    titleKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
    titleEn: 'Standard 4: School Operations & Leadership',
    description: 'វាយតម្លៃលើប្រសិទ្ធភាពនៃការដឹកនាំ ផែនការអភិវឌ្ឍន៍សាលា បរិស្ថាន សោភ័ណភាព និងការគ្រប់គ្រងរដ្ឋបាល។',
    indicators: [
      {
        id: 'std4_ind1',
        standardId: 4,
        standardNameKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
        indicatorNumber: 'សូចនាករ ៤.១',
        indicatorTitle: 'ផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍សាលារៀន (School Development Plan - SDP)',
        description: 'សាលាមានផែនការ ៣ ឆ្នាំ និងផែនការប្រតិបត្តិការប្រចាំឆ្នាំច្បាស់លាស់ និងមានការឯកភាពពីថ្នាក់លើ។',
        criteriaLevel1: 'មានផែនការសាលាជាលាយលក្ខណ៍អក្សរ',
        criteriaLevel2: 'ផែនការមានការចូលរួមពីគ្រប់ភាគីពាក់ព័ន្ធ',
        criteriaLevel3: 'ផែនការត្រូវបានអនុវត្តតាមដាន និងវាយតម្លៃត្រីមាសប្រកបដោយប្រសិទ្ធភាពខ្ពស់',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅផែនការអភិវឌ្ឍន៍សាលា SDP', 'របាយការណ៍វាយតម្លៃប្រចាំត្រីមាស']
      },
      {
        id: 'std4_ind2',
        standardId: 4,
        standardNameKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
        indicatorNumber: 'សូចនាករ ៤.២',
        indicatorTitle: 'បរិស្ថាន សោភ័ណភាព និងអនាម័យបៃតង (Clean & Green School)',
        description: 'សាលាមានរបងរឹងមាំ សួនច្បារ បន្ទប់ទឹកស្អាត ធុងសំរាមបែងចែកត្រឹមត្រូវ និងបរិស្ថានស្អាតគ្មានសំរាមរាយប៉ាយ។',
        criteriaLevel1: 'សាលាមានរបង និងអនាម័យទូទៅល្អ',
        criteriaLevel2: 'មានសួនច្បារ ដើមឈើម្លប់ និងបន្ទប់ទឹកស្អាតដាច់ដោយឡែកប្រុស-ស្រី',
        criteriaLevel3: 'ជាសាលាបៃតងគំរូ មានសួនជីវចម្រុះ សួនបន្លែ និងប្រព័ន្ធចម្រោះទឹកស្អាតស្តង់ដារ',
        maxScore: 5,
        evidenceRequired: ['កម្រងរូបភាពទិដ្ឋភាពសាលា', 'តារាងបែងចែកវេនអនាម័យ']
      },
      {
        id: 'std4_ind3',
        standardId: 4,
        standardNameKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
        indicatorNumber: 'សូចនាករ ៤.៣',
        indicatorTitle: 'ការគ្រប់គ្រងបណ្ណាល័យ និងការជំរុញវប្បធម៌អាន',
        description: 'បណ្ណាល័យដំណើរការស្តង់ដារ មានសៀវភៅគ្រប់គ្រាន់ កាលវិភាគអាន និងបណ្ណាល័យចល័ត។',
        criteriaLevel1: 'មានបន្ទប់បណ្ណាល័យ និងសៀវភៅអានខ្លះៗ',
        criteriaLevel2: 'បណ្ណាល័យបើកជាប្រចាំ និងមានកាលវិភាគអានតាមថ្នាក់',
        criteriaLevel3: 'បណ្ណាល័យស្តង់ដារ មានសៀវភៅសម្បូរបែប កម្មវិធីខ្ចីសៀវភៅ និងការប្រកួតអានសៀវភៅប្រចាំខែ',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅកត់ត្រាការខ្ចី-សង', 'ស្ថិតិអ្នកអានប្រចាំខែ', 'កាលវិភាគបណ្ណាល័យ']
      },
      {
        id: 'std4_ind4',
        standardId: 4,
        standardNameKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
        indicatorNumber: 'សូចនាករ ៤.៤',
        indicatorTitle: 'ការគ្រប់គ្រងស្ថិតិ និងទិន្នន័យសិស្ស/គ្រូតាមប្រព័ន្ធឌីជីថល (EMIS / SIS)',
        description: 'សាលាមានការគ្រប់គ្រងទិន្នន័យសិស្ស វត្តមាន ពិន្ទុ និងបុគ្គលិកតាមប្រព័ន្ធបច្ចេកវិទ្យាព័ត៌មាន។',
        criteriaLevel1: 'មានសៀវភៅបញ្ជីសិស្សតាមក្រដាសត្រឹមត្រូវ',
        criteriaLevel2: 'ប្រើប្រាស់ប្រព័ន្ធកុំព្យូទ័រគ្រប់គ្រងពិន្ទុ និងវត្តមាន',
        criteriaLevel3: 'ប្រើប្រាស់ប្រព័ន្ធ School Management System ពេញលេញ ជាមួយ QR Code និងរបាយការណ៍ស្វ័យប្រវត្ត',
        maxScore: 5,
        evidenceRequired: ['តារាងស្ថិតិសិស្សក្នុងប្រព័ន្ធ', 'កាត QR Code សិស្ស', 'របាយការណ៍ប្រព័ន្ធ']
      },
      {
        id: 'std4_ind5',
        standardId: 4,
        standardNameKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
        indicatorNumber: 'សូចនាករ ៤.៥',
        indicatorTitle: 'ការដឹកនាំគរុកោសល្យ និងការចុះជួយគ្រូក្នុងថ្នាក់ (Instructional Leadership)',
        description: 'នាយក ឬគ្រូទទួលបន្ទុកបច្ចេកទេសចុះសង្កេតការបង្រៀន និងផ្តល់មតិកែលម្អដល់គ្រូជាប្រចាំ។',
        criteriaLevel1: 'ចុះសង្កេតការបង្រៀន ១ ដងក្នុងមួយឆមាស',
        criteriaLevel2: 'ចុះសង្កេតការបង្រៀន ១ ដងក្នុងមួយខែ និងមានកំណត់ហេតុ',
        criteriaLevel3: 'ចុះសង្កេតការបង្រៀនទៀងទាត់ និងមានការបង្ហាត់បង្ហាញ (Coaching/Mentoring) ច្បាស់លាស់',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅតាមដានការសង្កេតការបង្រៀន', 'កំណត់ហេតុពិភាក្សាក្រោយសង្កេត']
      },
      {
        id: 'std4_ind6',
        standardId: 4,
        standardNameKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
        indicatorNumber: 'សូចនាករ ៤.៦',
        indicatorTitle: 'ការលើកទឹកចិត្ត និងការវាយតម្លៃគុណផលការងារគ្រូ',
        description: 'មានការផ្តល់លិខិតសរសើរ រង្វាន់លើកទឹកចិត្ត និងការវាយតម្លៃតួនាទីគ្រូប្រកបដោយតម្លាភាព។',
        criteriaLevel1: 'មានការវាយតម្លៃមន្ត្រីរាជការប្រចាំឆ្នាំ',
        criteriaLevel2: 'មានការផ្តល់លិខិតសរសើរដល់គ្រូឆ្នើម',
        criteriaLevel3: 'មានយន្តការលើកទឹកចិត្តជាប្រចាំ និងបង្កើតបរិយាកាសការងារសាមគ្គីភាពខ្ពស់',
        maxScore: 5,
        evidenceRequired: ['បញ្ជីឈ្មោះគ្រូឆ្នើមទទួលរង្វាន់', 'លិខិតសរសើរ']
      },
      {
        id: 'std4_ind7',
        standardId: 4,
        standardNameKh: 'ស្តង់ដារទី៤៖ ដំណើរការប្រតិបត្តិការ និងការគ្រប់គ្រងសាលា',
        indicatorNumber: 'សូចនាករ ៤.៧',
        indicatorTitle: 'ការគ្រប់គ្រងទ្រព្យសម្បត្តិ និងសារពើភណ្ឌសាលា',
        description: 'មានបញ្ជីសារពើភណ្ឌច្បាស់លាស់ ថែរក្សាអគារ តុ កៅអី និងសម្ភាររដ្ឋបានគង់វង្ស។',
        criteriaLevel1: 'មានបញ្ជីសារពើភណ្ឌទូទៅ',
        criteriaLevel2: 'មានការធ្វើបច្ចុប្បន្នភាពសារពើភណ្ឌរៀងរាល់ឆ្នាំ',
        criteriaLevel3: 'ទ្រព្យសម្បត្តិទាំងអស់ត្រូវបានថែរក្សាល្អ និងមានការជួសជុលថែទាំទាន់ពេលវេលា',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅបញ្ជីសារពើភណ្ឌរដ្ឋ', 'របាយការណ៍បាត់បង់/ខូចខាត']
      }
    ]
  },
  {
    id: 5,
    standardNumber: 5,
    titleKh: 'ស្តង់ដារទី៥៖ គណនេយ្យភាពរបស់សាលារៀន',
    titleEn: 'Standard 5: School Accountability & Transparency',
    description: 'វាយតម្លៃលើតម្លាភាពនៃការប្រើប្រាស់ថវិកាជាតិ (PB) ថវិកាសហគមន៍ ការរាយការណ៍ និងការឆ្លើយតប។',
    indicators: [
      {
        id: 'std5_ind1',
        standardId: 5,
        standardNameKh: 'ស្តង់ដារទី៥៖ គណនេយ្យភាពរបស់សាលារៀន',
        indicatorNumber: 'សូចនាករ ៥.១',
        indicatorTitle: 'តម្លាភាពក្នុងការគ្រប់គ្រងថវិកាកម្មវិធី (Program Budgeting - PB)',
        description: 'ថវិកាដែលបានទម្លាក់ពីរដ្ឋត្រូវបានបែងចែក និងប្រើប្រាស់ចំគោលដៅ ស្របតាមច្បាប់ហិរញ្ញវត្ថុ។',
        criteriaLevel1: 'មានសៀវភៅកត់ត្រាចំណូល-ចំណាយ',
        criteriaLevel2: 'មានការបិទផ្សាយតារាងថវិកាជាសាធារណៈ',
        criteriaLevel3: 'ការទូទាត់មានវិក្កយបត្រត្រឹមត្រូវ ១០០% និងឆ្លងកាត់ការត្រួតពិនិត្យពីគណៈកម្មការសាលា',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅគណនេយ្យចំណូលចំណាយ', 'រូបភាពផ្ទាំងព័ត៌មានបិទផ្សាយថវិកា']
      },
      {
        id: 'std5_ind2',
        standardId: 5,
        standardNameKh: 'ស្តង់ដារទី៥៖ គណនេយ្យភាពរបស់សាលារៀន',
        indicatorNumber: 'សូចនាករ ៥.២',
        indicatorTitle: 'ការបិទផ្សាយព័ត៌មានជាសាធារណៈ (Public Information Transparency)',
        description: 'សាលាមានក្តារព័ត៌មានបិទផ្សាយកាលវិភាគ ស្ថិតិសិស្ស ថវិកា និងព្រឹត្តិការណ៍ផ្សេងៗ។',
        criteriaLevel1: 'មានក្តារព័ត៌មានទូទៅ',
        criteriaLevel2: 'ព័ត៌មានត្រូវបានធ្វើបច្ចុប្បន្នភាពទៀងទាត់',
        criteriaLevel3: 'ព័ត៌មានគ្រប់ជ្រុងជ្រោយងាយស្រួលមើល ទាំងនៅលើក្តារព័ត៌មាន និងប្រព័ន្ធឌីជីថល',
        maxScore: 5,
        evidenceRequired: ['រូបភាពក្តារព័ត៌មានសាលា', 'តារាងបិទផ្សាយ']
      },
      {
        id: 'std5_ind3',
        standardId: 5,
        standardNameKh: 'ស្តង់ដារទី៥៖ គណនេយ្យភាពរបស់សាលារៀន',
        indicatorNumber: 'សូចនាករ ៥.៣',
        indicatorTitle: 'ប្រអប់សំបុត្រ ឬយន្តការទទួលមតិកែលម្អពីសហគមន៍',
        description: 'សាលាមានប្រអប់ទទួលមតិ និងដោះស្រាយកង្វល់របស់មាតាបិតាប្រកបដោយវិជ្ជាជីវៈ។',
        criteriaLevel1: 'មានប្រអប់ទទួលមតិ',
        criteriaLevel2: 'មានការបើកប្រអប់មតិពិនិត្យជាប្រចាំខែ',
        criteriaLevel3: 'រាល់មតិកែលម្អត្រូវបានពិភាក្សា និងដោះស្រាយជាក់ស្តែងជូនមាតាបិតា',
        maxScore: 5,
        evidenceRequired: ['សៀវភៅកត់ត្រាមតិកែលម្អ', 'កំណត់ហេតុដោះស្រាយ']
      },
      {
        id: 'std5_ind4',
        standardId: 5,
        standardNameKh: 'ស្តង់ដារទី៥៖ គណនេយ្យភាពរបស់សាលារៀន',
        indicatorNumber: 'សូចនាករ ៥.៤',
        indicatorTitle: 'ការរៀបចំទិវាគណនេយ្យភាពសាលារៀន (School Accountability Day)',
        description: 'សាលារៀបចំពិធីជួបជុំសហគមន៍ដើម្បីរាយការណ៍សមិទ្ធផល ចំណូលចំណាយ និងផែនការបន្ទាប់។',
        criteriaLevel1: 'មានការរាយការណ៍សមិទ្ធផលក្នុងកិច្ចប្រជុំទូទៅ',
        criteriaLevel2: 'រៀបចំទិវាគណនេយ្យភាព ១ ដងក្នុងមួយឆ្នាំ',
        criteriaLevel3: 'ទិវាគណនេយ្យភាពត្រូវបានរៀបចំយ៉ាងឱឡារិក ដោយមានការចូលរួមពីអាជ្ញាធរ និងមាតាបិតាយ៉ាងកុះករ',
        maxScore: 5,
        evidenceRequired: ['កម្មវិធីទិវាគណនេយ្យភាព', 'រូបភាពទិដ្ឋភាព', 'របាយការណ៍បូកសរុប']
      }
    ]
  }
];

// Complete Official Primary Textbook Database for Grade 1 to 6
export const MOEYS_PRIMARY_CURRICULUM_DATABASE: MoEYSSubjectCurriculum[] = [
  /* --------------------------------------------------------------------------
     1. ភាសាខ្មែរ (ថ្នាក់ទី ១ ដល់ ទី ៦)
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'khmer_grade_1',
    subjectNameKh: 'ភាសាខ្មែរ',
    grade: 1,
    totalAnnualHours: 360,
    periodsPerWeek: 12,
    textbookTitle: 'ភាសាខ្មែរ ថ្នាក់ទី១ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សស្គាល់ព្យញ្ជនៈ ៣៣ តួ ស្រៈនិស្ស័យ ២៣ តួ ស្រៈពេញតួ ផ្សំប្រកបពាក្យងាយៗ និងអានល្បះខ្លីៗបានស្ទាត់។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'ព្យញ្ជនៈ និងស្រៈនិស្ស័យដំបូង',
        lessons: [
          {
            id: 'kh1_c1_l1',
            lessonNumber: 1,
            title: 'ព្យញ្ជនៈ ក ខ និងស្រៈ ា',
            pageRange: 'ទំព័រ ១-៥',
            semester: 1,
            recommendedPeriods: 4,
            objectives: {
              knowledge: 'សិស្សប្រាប់បានច្បាស់ពីសូរ និងរូបរាងព្យញ្ជនៈ ក ខ និងស្រៈ ា។',
              skills: 'សិស្សសរសេរ និងផ្សំពាក្យ កា ខា បានត្រឹមត្រូវលើក្តារឆ្នួន។',
              attitude: 'សិស្សចូលរួមសកម្មភាពដោយរីករាយ និងស្រឡាញ់អក្សរជាតិ។'
            },
            keyConcepts: ['ព្យញ្ជនៈ ក', 'ព្យញ្ជនៈ ខ', 'ស្រៈ ា', 'ផ្សំសូរ'],
            suggestedMaterials: ['ប័ណ្ណព្យញ្ជនៈ ក ខ', 'ប័ណ្ណស្រៈ ា', 'ក្តារឆ្នួន'],
            suggestedGameTemplate: 'matching',
            gameActivityKh: 'ល្បែងផ្គូផ្គងសូរព្យញ្ជនៈ និងរូបភាព (ក-ក្អែក, ខ-ខ្លា)',
            sampleQuestions: [
              {
                question: 'តើព្យញ្ជនៈ «ក» ផ្សំនឹងស្រៈ «ា» អានថាដូចម្តេច?',
                options: ['កា', 'ខា', 'កៅ', 'កែ'],
                correctIndex: 0,
                explanation: 'ក + ា = កា'
              }
            ]
          },
          {
            id: 'kh1_c1_l2',
            lessonNumber: 2,
            title: 'ព្យញ្ជនៈ គ ឃ ង និងស្រៈ ិ ី',
            pageRange: 'ទំព័រ ៦-១១',
            semester: 1,
            recommendedPeriods: 4,
            objectives: {
              knowledge: 'សិស្សស្គាល់សូរពួក អ៊ូ នៃព្យញ្ជនៈ គ ឃ ង និងស្រៈ ិ ី។',
              skills: 'សិស្សបញ្ចេញសូរ គិ គី ងិ ងី និងសរសេរលើក្តារខៀនបានស្អាត។',
              attitude: 'សិស្សមានទំនុកចិត្តក្នុងការបញ្ចេញសម្លេង និងជួយមិត្តភក្តិ។'
            },
            keyConcepts: ['ពួក អ៊', 'ស្រៈ ិ', 'ស្រៈ ី'],
            suggestedMaterials: ['ប័ណ្ណអក្សរ', 'រូបភាពគោ ឃ្មុំ ងាវ'],
            suggestedGameTemplate: 'flashcards',
            gameActivityKh: 'ល្បែងបង្វិលកង់ស្វែងរកស្រៈ ិ និង ី',
            sampleQuestions: [
              {
                question: 'តើរូបរាងស្រៈ «ិ» និង «ី» ខុសគ្នាយ៉ាងណា?',
                options: ['ស្រៈ ី មានសក់លើ ស្រៈ ិ គ្មានសក់', 'ដូចគ្នាទាំងស្រុង', 'ស្រៈ ិ មានជើងក្រោម', 'គ្មានចម្លើយត្រឹមត្រូវ'],
                correctIndex: 0,
                explanation: 'ស្រៈ «ី» មានត្រេលើ (សក់) ចំណែក «ិ» គ្មានសក់ឡើយ។'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subjectKey: 'khmer_grade_2',
    subjectNameKh: 'ភាសាខ្មែរ',
    grade: 2,
    totalAnnualHours: 330,
    periodsPerWeek: 11,
    textbookTitle: 'ភាសាខ្មែរ ថ្នាក់ទី២ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សចេះផ្សំជើងព្យញ្ជនៈ ព្យាង្គតម្រួត ប្រកបមានសូរចុង និងអានអត្ថបទខ្លីប្រកបដោយអត្ថន័យ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'ជើងព្យញ្ជនៈ និងការប្រកប',
        lessons: [
          {
            id: 'kh2_c1_l1',
            lessonNumber: 1,
            title: 'ជើងព្យញ្ជនៈ ្ក ្ខ ្គ ្ឃ ្ង',
            pageRange: 'ទំព័រ ១-៦',
            semester: 1,
            recommendedPeriods: 3,
            objectives: {
              knowledge: 'សិស្សស្គាល់ទម្រង់ជើងអក្សរ និងរបៀបដាក់ជើងពីក្រោមតួព្យញ្ជនៈ។',
              skills: 'សិស្សសរសេរពាក្យមានជើងអក្សរដូចជា៖ ក្អែក ខ្លា គ្នា ផ្គរ ឆ្លាម។',
              attitude: 'សិស្សមានការយកចិត្តទុកដាក់ខ្ពស់ក្នុងការសរសេរអក្ខរាវិរុទ្ធ។'
            },
            keyConcepts: ['ជើងអក្សរ', 'ព្យាង្គផ្សំ', 'អក្ខរាវិរុទ្ធ'],
            suggestedMaterials: ['ប័ណ្ណជើងអក្សរ', 'ក្តារឆ្នួន'],
            suggestedGameTemplate: 'matching',
            gameActivityKh: 'ល្បែងផ្គូផ្គងតួព្យញ្ជនៈ និងជើងរបស់វា',
            sampleQuestions: [
              {
                question: 'តើពាក្យ «ខ្លា» មានជើងព្យញ្ជនៈអ្វី?',
                options: ['ជើង ល', 'ជើង ខ', 'ជើង ក', 'ជើង គ'],
                correctIndex: 0,
                explanation: 'ព្យញ្ជនៈ «ខ» ផ្ញើជើង «ល» និងស្រៈ ា ផ្សំជាពាក្យ «ខ្លា»។'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subjectKey: 'khmer_grade_3',
    subjectNameKh: 'ភាសាខ្មែរ',
    grade: 3,
    totalAnnualHours: 300,
    periodsPerWeek: 10,
    textbookTitle: 'ភាសាខ្មែរ ថ្នាក់ទី៣ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សអានអត្ថបទរឿងនិទាន ចេះវេយ្យាករណ៍ (នាម កិរិយាសព្ទ) និងសរសេរតាមអានបានត្រឹមត្រូវ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'មេរៀនទី ១៖ សាលារៀន និងមិត្តភាព',
        lessons: [
          {
            id: 'kh3_c1_l1',
            lessonNumber: 1,
            title: 'អំណាន៖ ថ្ងៃចូលរៀនដំបូងរបស់កុមារីចិន្តា',
            pageRange: 'ទំព័រ ១-៤',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សយល់អត្ថន័យអត្ថបទ និងស្គាល់តួអង្គក្នុងរឿង។',
              skills: 'សិស្សអានបានត្រឹមត្រូវតាមសញ្ញាខណ្ឌ សញ្ញាសួរ និងឆ្លើយសំណួរបានត្រឹមត្រូវ។',
              attitude: 'សិស្សស្រឡាញ់សាលារៀន និងមានទំនាក់ទំនងល្អជាមួយមិត្តភក្តិ។'
            },
            keyConcepts: ['សាលារៀន', 'មិត្តភាព', 'សញ្ញាវណ្ណយុត្តិ'],
            suggestedMaterials: ['សៀវភៅពុម្ពភាសាខ្មែរថ្នាក់ទី៣', 'រូបភាពសាលារៀន'],
            suggestedGameTemplate: 'quiz',
            gameActivityKh: 'ល្បែងដណ្តើមជើងឯកឆ្លើយសំណួរអត្ថបទអំណាន',
            sampleQuestions: [
              {
                question: 'តើកុមារីចិន្តាមានអារម្មណ៍យ៉ាងណាពេលថ្ងៃចូលរៀនដំបូង?',
                options: ['សប្បាយរីករាយ និងរំភើប', 'ភ័យខ្លាច និងយំ', 'ខឹងសម្បារ', 'ធុញទ្រាន់'],
                correctIndex: 0,
                explanation: 'ចិន្តាសប្បាយរីករាយណាស់ដែលបានជួបលោកគ្រូ និងមិត្តភក្តិថ្មីៗ។'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subjectKey: 'khmer_grade_4',
    subjectNameKh: 'ភាសាខ្មែរ',
    grade: 4,
    totalAnnualHours: 270,
    periodsPerWeek: 9,
    textbookTitle: 'ភាសាខ្មែរ ថ្នាក់ទី៤ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សស្គាល់ប្រភេទនាម កិរិយាសព្ទ គុណនាម និងចេះសរសេរតែងសេចក្តីពណ៌នាសាមញ្ញ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'មេរៀនទី ១៖ គ្រួសារកក់ក្តៅ និងការគោរពដឹងគុណ',
        lessons: [
          {
            id: 'kh4_c1_l1',
            lessonNumber: 1,
            title: 'អំណាន៖ កតញ្ញូតាធម៌ចំពោះមាតាបិតា',
            pageRange: 'ទំព័រ ១-៥',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សយល់ដឹងពីគុណូបការៈរបស់ឪពុកម្តាយ និងអត្ថន័យពាក្យគន្លឹះ។',
              skills: 'សិស្សអានដោយបញ្ចេញមនោសញ្ចេតនា និងចេះតែងល្បះបង្ហាញការដឹងគុណ។',
              attitude: 'សិស្សមានសេចក្តីកតញ្ញូចំពោះឪពុកម្តាយ និងចាស់ទុំ។'
            },
            keyConcepts: ['កតញ្ញូ', 'គុណូបការៈ', 'សីលធម៌គ្រួសារ'],
            suggestedMaterials: ['សៀវភៅពុម្ពភាសាខ្មែរថ្នាក់ទី៤', 'ប័ណ្ណពាក្យគន្លឹះ'],
            suggestedGameTemplate: 'fill_blank',
            gameActivityKh: 'ល្បែងបំពេញពាក្យកតញ្ញូក្នុងប្រយោគ',
            sampleQuestions: [
              {
                question: 'តើពាក្យ «កតញ្ញូ» មានន័យដូចម្តេច?',
                options: ['ការដឹងគុណ និងតបស្នងសងគុណ', 'ការមិនស្តាប់បង្គាប់', 'ការខ្ជិលច្រអូស', 'ការលេងល្បែង'],
                correctIndex: 0,
                explanation: 'កតញ្ញូ មានន័យថា ការដឹងនូវឧបការគុណដែលអ្នកដទៃបានធ្វើមកលើខ្លួន។'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subjectKey: 'khmer_grade_5',
    subjectNameKh: 'ភាសាខ្មែរ',
    grade: 5,
    totalAnnualHours: 240,
    periodsPerWeek: 8,
    textbookTitle: 'ភាសាខ្មែរ ថ្នាក់ទី៥ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សអានអត្ថបទស្វែងយល់ វិភាគតួអង្គ ស្គាល់ប្រភេទល្បះ កិរិយាសព្ទ គុណនាម និងចេះតែងសេចក្តីពណ៌នាបានល្អ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'មេរៀនទី ១៖ ការរស់នៅប្រកបដោយសីលធម៌ និងបរិស្ថានស្អាត',
        lessons: [
          {
            id: 'kh5_c1_l1',
            lessonNumber: 1,
            title: 'អំណាន៖ ភូមិឋានស្អាត ជីវិតមានសេចក្តីសុខ',
            pageRange: 'ទំព័រ ១-៤',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សយល់ច្បាស់ពីសារៈសំខាន់នៃអនាម័យបរិស្ថាន និងពាក្យពិបាកក្នុងអត្ថបទ។',
              skills: 'សិស្សអានដោយបញ្ចេញសម្លេងច្បាស់ ចេះពន្យល់ពាក្យ និងឆ្លើយសំណួរស្វែងយល់អត្ថបទ។',
              attitude: 'សិស្សស្រឡាញ់បរិស្ថាន និងចូលរួមសម្អាតផ្ទះសម្បែង និងសាលារៀន។'
            },
            keyConcepts: ['អនាម័យបរិស្ថាន', 'សុខភាពសហគមន៍', 'ការបែងចែកសំរាម'],
            suggestedMaterials: ['សៀវភៅពុម្ពភាសាខ្មែរថ្នាក់ទី៥', 'ផ្ទាំងរូបភាពភូមិស្អាត', 'ប័ណ្ណពាក្យគន្លឹះ'],
            suggestedGameTemplate: 'quiz',
            gameActivityKh: 'ល្បែងដណ្តើមជើងឯកពន្យល់ពាក្យពិបាក (Vocabulary Battle)',
            sampleQuestions: [
              {
                question: 'តើពាក្យ «បរិស្ថាន» មានន័យដូចម្តេច?',
                options: ['អ្វីៗទាំងអស់ដែលនៅជុំវិញខ្លួនយើង', 'តែដើមឈើ និងព្រៃឈើ', 'តែផ្ទះសម្បែង', 'ទឹកទន្លេ និងសមុទ្រ'],
                correctIndex: 0,
                explanation: 'បរិស្ថាន សំដៅលើអ្វីៗទាំងអស់ដែលមាននៅជុំវិញខ្លួនមនុស្ស សត្វ និងរុក្ខជាតិ។'
              }
            ]
          },
          {
            id: 'kh5_c1_l2',
            lessonNumber: 2,
            title: 'វេយ្យាករណ៍៖ ប្រភេទនៃគុណនាម និងការបង្កើតល្បះ',
            pageRange: 'ទំព័រ ៥-៧',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សប្រាប់បាននូវនិយមន័យ និងតួនាទីរបស់គុណនាមក្នុងល្បះ។',
              skills: 'សិស្សចង្អុលបង្ហាញគុណនាម និងបង្កើតល្បះពណ៌នាបានត្រឹមត្រូវ។',
              attitude: 'សិស្សមានទម្លាប់ប្រើប្រាស់ពាក្យពេចន៍សមរម្យ និងសរសេរអក្សរផ្ចិតផ្ចង់។'
            },
            keyConcepts: ['គុណនាមបញ្ជាក់លក្ខណៈ', 'គុណនាមចង្អុល', 'ការតែងល្បះ'],
            suggestedMaterials: ['ក្តារខៀន', 'ប័ណ្ណល្បះគំរូ', 'ក្តារឆ្នួន'],
            suggestedGameTemplate: 'word_puzzle',
            gameActivityKh: 'ល្បែងផ្គុំពាក្យបង្កើតល្បះពណ៌នាពីសាលារៀន',
            sampleQuestions: [
              {
                question: 'ក្នុងល្បះ «សាលារៀនយើងមានសួនផ្កាស្រស់ស្អាត» តើពាក្យណាជាគុណនាម?',
                options: ['ស្រស់ស្អាត', 'សាលារៀន', 'សួនផ្កា', 'យើង'],
                correctIndex: 0,
                explanation: 'ពាក្យ «ស្រស់ស្អាត» បញ្ជាក់លក្ខណៈឱ្យនាម «សួនផ្កា»។'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subjectKey: 'khmer_grade_6',
    subjectNameKh: 'ភាសាខ្មែរ',
    grade: 6,
    totalAnnualHours: 240,
    periodsPerWeek: 8,
    textbookTitle: 'ភាសាខ្មែរ ថ្នាក់ទី៦ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សវិភាគរឿងប្រលោមលោកខ្នាតខ្លី សរសេរតែងសេចក្តីពណ៌នា តែងសេចក្តីពន្យល់ និងចេះវេយ្យាករណ៍ស្មុគស្មាញ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'មេរៀនទី ១៖ មរតកវប្បធម៌ និងអក្សរសិល្ប៍ជាតិ',
        lessons: [
          {
            id: 'kh6_c1_l1',
            lessonNumber: 1,
            title: 'អំណាន៖ រឿងកុលាបប៉ៃលិន (ដកស្រង់)',
            pageRange: 'ទំព័រ ១-៦',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សយល់ដឹងពីសាច់រឿង តួអង្គចៅចិត្រ និងបរិបទសង្គមក្នុងរឿង។',
              skills: 'សិស្សវិភាគចរិតលក្ខណៈតួអង្គ និងសរសេរសេចក្តីសង្ខេបរឿងបានខ្លឹមសារល្អ។',
              attitude: 'សិស្សស្រឡាញ់ភាពស្មោះត្រង់ សេចក្តីព្យាយាម និងតម្លៃពលកម្ម។'
            },
            keyConcepts: ['ចៅចិត្រ', 'ភាពស្មោះត្រង់', 'ការតស៊ូ'],
            suggestedMaterials: ['សៀវភៅពុម្ពភាសាខ្មែរថ្នាក់ទី៦', 'រូបភាពតួអង្គចៅចិត្រ'],
            suggestedGameTemplate: 'quiz',
            gameActivityKh: 'ល្បែងវិភាគតួអង្គ និងសីលធម៌ក្នុងរឿងកុលាបប៉ៃលិន',
            sampleQuestions: [
              {
                question: 'តើតួអង្គ «ចៅចិត្រ» ជាមនុស្សដែលមានគុណសម្បត្តិអ្វីខ្លះ?',
                options: ['ស្មោះត្រង់ ឧស្សាហ៍ព្យាយាម និងចេះដឹងគុណ', 'កុហក និងខ្ជិល', 'កំសាក', 'អួតអាង'],
                correctIndex: 0,
                explanation: 'ចៅចិត្រជាគំរូយុវជនខ្មែរដែលមានភាពស្មោះត្រង់ តស៊ូ និងកតញ្ញូ។'
              }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------------
     2. គណិតវិទ្យា (ថ្នាក់ទី ១ ដល់ ទី ៦)
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'math_grade_1',
    subjectNameKh: 'គណិតវិទ្យា',
    grade: 1,
    totalAnnualHours: 210,
    periodsPerWeek: 7,
    textbookTitle: 'គណិតវិទ្យា ថ្នាក់ទី១ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សស្គាល់ចំនួនពី ០ ដល់ ១០០ ប្រមាណវិធីបូកដកគ្មានត្រាទុក និងរូបធរណីមាត្រសាមញ្ញ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'ចំនួនពី ០ ដល់ ១០ និងការបូកដក',
        lessons: [
          {
            id: 'math1_c1_l1',
            lessonNumber: 1,
            title: 'ការរាប់ ការអាន និងសរសេរចំនួនពី ០ ដល់ ៥',
            pageRange: 'ទំព័រ ១-៦',
            semester: 1,
            recommendedPeriods: 3,
            objectives: {
              knowledge: 'សិស្សស្គាល់ចំនួនបរិមាណ និងតួលេខ ០, ១, ២, ៣, ៤, ៥។',
              skills: 'សិស្សរាប់វត្ថុជាក់ស្តែង និងសរសេរលេខខ្មែរ និងអារ៉ាប់បានត្រឹមត្រូវ។',
              attitude: 'សិស្សចូលចិត្តមុខវិជ្ជាគណិតវិទ្យា និងមានភាពរហ័សរហួន។'
            },
            keyConcepts: ['ចំនួន ០-៥', 'ការរាប់វត្ថុ', 'តួលេខខ្មែរ'],
            suggestedMaterials: ['គ្រាប់ឃ្លី ឬគ្រាប់គ្រួស', 'ប័ណ្ណលេខ ០-៥'],
            suggestedGameTemplate: 'matching',
            gameActivityKh: 'ល្បែងផ្គូផ្គងបរិមាណផ្លែឈើ និងតួលេខ',
            sampleQuestions: [
              {
                question: 'តើរូបផ្លែប៉ោមចំនួន ៣ ត្រូវនឹងលេខណា?',
                options: ['លេខ ៣', 'លេខ ២', 'លេខ ៥', 'លេខ ៤'],
                correctIndex: 0,
                explanation: 'ផ្លែប៉ោម ៣ ផ្លែត្រូវនឹងលេខ ៣។'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subjectKey: 'math_grade_5',
    subjectNameKh: 'គណិតវិទ្យា',
    grade: 5,
    totalAnnualHours: 210,
    periodsPerWeek: 7,
    textbookTitle: 'គណិតវិទ្យា ថ្នាក់ទី៥ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សចេះគណនាប្រមាណវិធីទាំង ៤ លើចំនួនគត់ និងចំនួនទសភាគ ចេះដោះស្រាយចំណោទ និងគណនាផ្ទៃក្រឡារូបធរណីមាត្រ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'ជំពូកទី ១៖ ចំនួនគត់ និងប្រមាណវិធី',
        lessons: [
          {
            id: 'math5_c1_l1',
            lessonNumber: 1,
            title: 'ការអាន សរសេរ និងប្រៀបធៀបចំនួនធំជាង ១ ០០០ ០០០',
            pageRange: 'ទំព័រ ១-៥',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សស្គាល់ថ្នាក់ និងខ្ទង់នៃចំនួនធំ (ថ្នាក់រាយ ថ្នាក់ពាន់ ថ្នាក់លាន)។',
              skills: 'សិស្សអាន សរសេរជាតួលេខ ជាអក្សរ និងប្រៀបធៀបចំនួនបានត្រឹមត្រូវ។',
              attitude: 'សិស្សមានភាពផ្ចិតផ្ចង់ និងមានទំនុកចិត្តលើការគណនាលេខ។'
            },
            keyConcepts: ['ថ្នាក់លាន', 'តម្លៃតាមខ្ទង់', 'ការប្រៀបធៀបចំនួន'],
            suggestedMaterials: ['តារាងតម្លៃខ្ទង់', 'ប័ណ្ណលេខធំៗ', 'ក្តារឆ្នួន'],
            suggestedGameTemplate: 'classroom_competition',
            gameActivityKh: 'ល្បែងប្រណាំងរៀបចំលេខតាមតម្លៃខ្ទង់ (Place Value Race)',
            sampleQuestions: [
              {
                question: 'ក្នុងចំនួន ៥ ៤២០ ៦០០ តើលេខ ៤ ស្ថិតនៅខ្ទង់ណា?',
                options: ['ខ្ទង់សែន', 'ខ្ទង់ម៉ឺន', 'ខ្ទង់លាន', 'ខ្ទង់ពាន់'],
                correctIndex: 0,
                explanation: 'លេខ ៤ ស្ថិតនៅខ្ទង់សែន ដែលមានតម្លៃស្មើនឹង ៤០០ ០០០។'
              }
            ]
          },
          {
            id: 'math5_c1_l2',
            lessonNumber: 2,
            title: 'វិធីគុណ និងវិធីចែកចំនួនដែលមានតួលេខច្រើន',
            pageRange: 'ទំព័រ ៦-១២',
            semester: 1,
            recommendedPeriods: 3,
            objectives: {
              knowledge: 'សិស្សចងចាំក្បួនវិធីគុណ និងវិធីចែកចំនួនគត់ដែលមានតួចែកពីរខ្ទង់។',
              skills: 'សិស្សអនុវត្តការគណនា និងដោះស្រាយចំណោទអនុវត្តក្នុងជីវភាពប្រចាំថ្ងៃ។',
              attitude: 'សិស្សមានការអត់ធ្មត់ និងចេះសហការដោះស្រាយលំហាត់ជាក្រុម។'
            },
            keyConcepts: ['មេគុណ', 'តួចែកពីរខ្ទង់', 'សំណល់'],
            suggestedMaterials: ['សៀវភៅពុម្ពគណិតវិទ្យា', 'សន្លឹកកិច្ចការលំហាត់'],
            suggestedGameTemplate: 'picker_duck_race',
            gameActivityKh: 'ល្បែងទាប្រណាំងឆ្លើយសំណួរគណនាល្បឿនលឿន',
            sampleQuestions: [
              {
                question: 'គណនា៖ ២៥ x ៤០ = ?',
                options: ['១ ០០០', '១០០', '១០ ០០០', '៨០០'],
                correctIndex: 0,
                explanation: '២៥ x ៤ = ១០០ រួចបន្ថែមសូន្យមួយទៀត ស្មើនឹង ១ ០០០។'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    subjectKey: 'math_grade_6',
    subjectNameKh: 'គណិតវិទ្យា',
    grade: 6,
    totalAnnualHours: 210,
    periodsPerWeek: 7,
    textbookTitle: 'គណិតវិទ្យា ថ្នាក់ទី៦ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សចេះប្រភាគ ទសភាគ ភាគរយ មាត្រដ្ឋាន ផ្ទៃក្រឡារង្វង់ មាឌព្រីស និងដោះស្រាយចំណោទស្មុគស្មាញ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'ជំពូកទី ១៖ ប្រភាគ និងប្រមាណវិធីលើប្រភាគ',
        lessons: [
          {
            id: 'math6_c1_l1',
            lessonNumber: 1,
            title: 'ការបូក និងដកប្រភាគដែលមានភាគបែងខុសគ្នា',
            pageRange: 'ទំព័រ ១-៨',
            semester: 1,
            recommendedPeriods: 3,
            objectives: {
              knowledge: 'សិស្សចងចាំក្បួនតម្រូវភាគបែងរួមតាមវិធីពហុគុណរួមតូចបំផុត (LCM)។',
              skills: 'សិស្សគណនាប្រភាគ និងសម្រួលលទ្ធផលជាប្រភាគសម្រួលលែងបាន។',
              attitude: 'សិស្សមានភាពម៉ត់ចត់ក្នុងការគិតលេខ និងដោះស្រាយបញ្ហា។'
            },
            keyConcepts: ['ភាគបែងរួម', 'ការសម្រួលប្រភាគ', 'ប្រមាណវិធីបូកដក'],
            suggestedMaterials: ['សៀវភៅពុម្ពគណិតវិទ្យាថ្នាក់ទី៦', 'សន្លឹកកិច្ចការ'],
            suggestedGameTemplate: 'quiz',
            gameActivityKh: 'ល្បែងដណ្តើមជើងឯកគណនាប្រភាគ',
            sampleQuestions: [
              {
                question: 'គណនា៖ 1/2 + 1/4 = ?',
                options: ['3/4', '2/6', '1/6', '2/4'],
                correctIndex: 0,
                explanation: '1/2 = 2/4 ដូច្នេះ 2/4 + 1/4 = 3/4'
              }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------------
     3. វិទ្យាសាស្ត្រ (ថ្នាក់ទី 1 ដល់ ទី 6)
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'science_grade_5',
    subjectNameKh: 'វិទ្យាសាស្ត្រ',
    grade: 5,
    totalAnnualHours: 90,
    periodsPerWeek: 3,
    textbookTitle: 'វិទ្យាសាស្ត្រ ថ្នាក់ទី៥ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សយល់ដឹងពីប្រព័ន្ធសារពាង្គកាយមនុស្ស វដ្តជីវិតសត្វ រុក្ខជាតិ ថាមពលអគ្គិសនី និងការថែរក្សាបរិស្ថាន។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'ជំពូកទី ១៖ ភាវរស់ និងបរិស្ថាន',
        lessons: [
          {
            id: 'sci5_c1_l1',
            lessonNumber: 1,
            title: 'វដ្តជីវិតរបស់រុក្ខជាតិ និងការបន្តពូជ',
            pageRange: 'ទំព័រ ១-៦',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សរៀបរាប់បានពីដំណាក់កាលលូតលាស់របស់រុក្ខជាតិពីគ្រាប់ទៅជារុក្ខជាតិពេញវ័យ។',
              skills: 'សិស្សគូរដ្យាក្រាមវដ្តជីវិត និងដាំគ្រាប់សណ្តែកសង្កេតការលូតលាស់ជាក់ស្តែង។',
              attitude: 'សិស្សស្រឡាញ់ធម្មជាតិ ចូលរួមដាំដើមឈើ និងថែរក្សារុក្ខជាតិ។'
            },
            keyConcepts: ['ការដុះពន្លក', 'លំអងផ្កា', 'ការបង្កើតផ្លែ និងគ្រាប់'],
            suggestedMaterials: ['គ្រាប់សណ្តែក', 'កែវជ័រ', 'ដីមានជីជាតិ', 'ផ្ទាំងរូបភាពវដ្តជីវិត'],
            suggestedGameTemplate: 'matching',
            gameActivityKh: 'ល្បែងរៀបលំដាប់លំដោយដំណាក់កាលលូតលាស់របស់រុក្ខជាតិ',
            sampleQuestions: [
              {
                question: 'តើគ្រាប់រុក្ខជាតិត្រូវការកត្តាសំខាន់អ្វីខ្លះដើម្បីដុះពន្លក?',
                options: ['ទឹក ខ្យល់ និងសីតុណ្ហភាពសមស្រប', 'តែជីគីមី', 'តែពន្លឺថ្ងៃខ្លាំង', 'គ្មានខ្យល់'],
                correctIndex: 0,
                explanation: 'គ្រាប់ត្រូវការទឹក សំណើម ខ្យល់អុកស៊ីសែន និងសីតុណ្ហភាពសមស្របដើម្បីដុះពន្លក។'
              }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------------
     4. សិក្សាសង្គម (ថ្នាក់ទី 1 ដល់ ទី 6)
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'social_grade_5',
    subjectNameKh: 'សិក្សាសង្គម',
    grade: 5,
    totalAnnualHours: 90,
    periodsPerWeek: 3,
    textbookTitle: 'សិក្សាសង្គម ថ្នាក់ទី៥ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សយល់ដឹងពីប្រវត្តិសាស្ត្រជាតិ ភូមិសាស្ត្រប្រទេសកម្ពុជា សីលធម៌ពលរដ្ឋ និងទំនៀមទម្លាប់ប្រពៃណីខ្មែរ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'ជំពូកទី ១៖ ប្រវត្តិសាស្ត្រ និងអារ្យធម៌អង្គរ',
        lessons: [
          {
            id: 'soc5_c1_l1',
            lessonNumber: 1,
            title: 'ប្រាសាទអង្គរវត្ត និងភាពរុងរឿងនៃសម័យអង្គរ',
            pageRange: 'ទំព័រ ១-៨',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សប្រាប់បានពីកាលបរិច្ឆេទកសាង ព្រះមហាក្សត្រស្ថាបនា និងរចនាប័ទ្មប្រាសាទអង្គរវត្ត។',
              skills: 'សិស្សរៀបរាប់ពីតម្លៃបេតិកភណ្ឌពិភពលោក និងចង្អុលបង្ហាញទីតាំងលើផែនទី។',
              attitude: 'សិស្សមានមោទនភាពចំពោះជាតិខ្មែរ និងមានស្មារតីការពារសម្បត្តិវប្បធម៌។'
            },
            keyConcepts: ['ព្រះបាទសូរ្យវរ្ម័នទី២', 'ប្រាសាទអង្គរវត្ត', 'បេតិកភណ្ឌពិភពលោក'],
            suggestedMaterials: ['ផែនទីខេត្តសៀមរាប', 'រូបថតប្រាសាទអង្គរវត្ត', 'វីដេអូខ្លី'],
            suggestedGameTemplate: 'quiz',
            gameActivityKh: 'ល្បែងដណ្តើមជើងឯកស្វែងយល់ប្រវត្តិសាស្ត្រខ្មែរ',
            sampleQuestions: [
              {
                question: 'តើប្រាសាទអង្គរវត្តត្រូវបានកសាងឡើងក្នុងរជ្ជកាលព្រះមហាក្សត្រអង្គណា?',
                options: ['ព្រះបាទសូរ្យវរ្ម័នទី២', 'ព្រះបាទជ័យវរ្ម័នទី៧', 'ព្រះបាទជ័យវរ្ម័នទី២', 'ព្រះបាទនរោត្តម'],
                correctIndex: 0,
                explanation: 'ប្រាសាទអង្គរវត្តត្រូវបានកសាងឡើងនៅដើមសតវត្សរ៍ទី១២ ដោយព្រះបាទសូរ្យវរ្ម័នទី២។'
              }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------------
     5. ភាសាអង់គ្លេសបឋមសិក្សា (English for Cambodia Primary)
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'english_grade_5',
    subjectNameKh: 'ភាសាអង់គ្លេស',
    grade: 5,
    totalAnnualHours: 60,
    periodsPerWeek: 2,
    textbookTitle: 'English for Cambodia - Primary Grade 5 (MoEYS)',
    coreCompetency: 'Students can greet, introduce family members, tell time, describe daily routines, and ask basic questions.',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'Unit 1: Hello Again! & Daily Routines',
        lessons: [
          {
            id: 'eng5_u1_l1',
            lessonNumber: 1,
            title: 'Lesson 1: What time do you wake up?',
            pageRange: 'Pages 1-5',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'Students know daily routine action verbs (wake up, brush teeth, eat breakfast, go to school).',
              skills: 'Students ask and answer about daily time using "What time do you...?" and "I ... at ... o\'clock".',
              attitude: 'Students appreciate punctual habits and practice English actively.'
            },
            keyConcepts: ['Daily routines', 'Telling time', 'Present simple'],
            suggestedMaterials: ['Clock model', 'Action flashcards'],
            suggestedGameTemplate: 'quiz',
            gameActivityKh: 'Speed Time Quiz (ល្បែងប្រណាំងប្រាប់ម៉ោងជាភាសាអង់គ្លេស)',
            sampleQuestions: [
              {
                question: 'How do you say "ខ្ញុំចូលគេងនៅម៉ោង ៩:០០ យប់" in English?',
                options: ['I go to bed at 9:00 PM', 'I wake up at 9:00 PM', 'I eat breakfast at 9:00 PM', 'I go to school at 9:00 PM'],
                correctIndex: 0,
                explanation: '"Go to bed" means ចូលគេង.'
              }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------------
     6. អប់រំសិល្បៈ (គំនូរ ចម្រៀង តន្ត្រី)
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'arts_grade_5',
    subjectNameKh: 'អប់រំសិល្បៈ',
    grade: 5,
    totalAnnualHours: 60,
    periodsPerWeek: 2,
    textbookTitle: 'អប់រំសិល្បៈ ថ្នាក់ទី៥ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សចេះគូរគំនូរទេសភាព ស្គាល់ឧបករណ៍តន្ត្រីប្រពៃណីខ្មែរ និងចេះច្រៀងបទចម្រៀងកុមារជាតិ។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'សិល្បៈទស្សនីយភាព និងតន្ត្រីខ្មែរ',
        lessons: [
          {
            id: 'art5_c1_l1',
            lessonNumber: 1,
            title: 'ការគូរគំនូរទេសភាពស្រុកស្រែ និងការលាយពណ៌',
            pageRange: 'ទំព័រ ១-៦',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សស្គាល់ពណ៌គោល (ក្រហម ខៀវ លឿង) និងការបង្កើតពណ៌បន្ទាប់បន្សំ។',
              skills: 'សិស្សគូរ និងផាត់ពណ៌ទេសភាពស្រុកកំណើតបានស្រស់ស្អាត។',
              attitude: 'សិស្សមានគំនិតច្នៃប្រឌិត និងស្រឡាញ់សោភ័ណភាពធម្មជាតិ។'
            },
            keyConcepts: ['ពណ៌គោល', 'ពណ៌បន្ទាប់បន្សំ', 'គំនូរទេសភាព'],
            suggestedMaterials: ['ក្រដាសគំនូរ', 'ជក់ពណ៌ទឹក ឬដីពណ៌'],
            suggestedGameTemplate: 'matching',
            gameActivityKh: 'ល្បែងផ្គូផ្គងការលាយពណ៌ (Color Mixing Game)',
            sampleQuestions: [
              {
                question: 'តើពណ៌ខៀវ លាយជាមួយពណ៌លឿង ទទួលបានពណ៌អ្វី?',
                options: ['ពណ៌បៃតង', 'ពណ៌ស្វាយ', 'ពណ៌ទឹកក្រូច', 'ពណ៌ត្នោត'],
                correctIndex: 0,
                explanation: 'ខៀវ + លឿង = បៃតង'
              }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------------
     7. អប់រំកាយ និងកីឡា
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'pe_grade_5',
    subjectNameKh: 'អប់រំកាយ និងកីឡា',
    grade: 5,
    totalAnnualHours: 60,
    periodsPerWeek: 2,
    textbookTitle: 'អប់រំកាយ និងកីឡា ថ្នាក់ទី៥ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សមានកាយសម្បទារឹងមាំ ចេះកាយសម្ព័ន្ធមូលដ្ឋាន ការរត់ចម្ងាយខ្លី និងស្គាល់វិន័យកីឡា។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'កាយសម្ព័ន្ធ និងអនាម័យកាយ',
        lessons: [
          {
            id: 'pe5_c1_l1',
            lessonNumber: 1,
            title: 'កាយសម្ព័ន្ធតម្រង់ជួរ និងចលនាដកដង្ហើម ៨ ក្បាច់',
            pageRange: 'ទំព័រ ១-៥',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សយល់ពីសារៈសំខាន់នៃការហាត់ប្រាណដើម្បីសុខភាព និងការដកដង្ហើមវែងៗ។',
              skills: 'សិស្សធ្វើចលនាកាយសម្ព័ន្ធ ៨ ក្បាច់បានស្ទាត់ និងស្មើដៃគ្នា។',
              attitude: 'សិស្សស្រឡាញ់សុខភាព មានវិន័យតម្រង់ជួរ និងសាមគ្គីភាព។'
            },
            keyConcepts: ['កាយសម្ព័ន្ធ ៨ ក្បាច់', 'តម្រង់ជួរ', 'សុខភាពរាងកាយ'],
            suggestedMaterials: ['កញ្ចែ', 'ទីលានកីឡា'],
            suggestedGameTemplate: 'classroom_competition',
            gameActivityKh: 'ការប្រកួតធ្វើចលនាកាយសម្ព័ន្ធស្មើដៃគ្នាតាមក្រុម',
            sampleQuestions: [
              {
                question: 'តើការហាត់ប្រាណពេលព្រឹកផ្តល់ផលប្រយោជន៍អ្វីដល់រាងកាយ?',
                options: ['ធ្វើឱ្យរាងកាយមាំមួន និងខួរក្បាលស្រឡះ', 'ធ្វើឱ្យអស់កម្លាំង និងងងុយគេង', 'ធ្វើឱ្យឈឺក្បាល', 'គ្មានផលប្រយោជន៍'],
                correctIndex: 0,
                explanation: 'ការហាត់ប្រាណជួយឱ្យចរន្តឈាមរត់ស្រួល សួតរីកធំ និងខួរក្បាលឆ្លាតវៃ។'
              }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------------
     8. បំណិនជីវិត
     -------------------------------------------------------------------------- */
  {
    subjectKey: 'lifeskills_grade_5',
    subjectNameKh: 'បំណិនជីវិត',
    grade: 5,
    totalAnnualHours: 60,
    periodsPerWeek: 2,
    textbookTitle: 'បំណិនជីវិតបឋមសិក្សា ថ្នាក់ទី៥ (ក្រសួងអប់រំ យុវជន និងកីឡា)',
    coreCompetency: 'សិស្សចេះដាំបន្លែសួនសាលា ថែរក្សាឧបករណ៍ប្រើប្រាស់ សន្សំប្រាក់ និងធ្វើការងារសហគមន៍។',
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: 'កសិកម្មសាលា និងការដាំដុះបន្លែសរីរាង្គ',
        lessons: [
          {
            id: 'life5_c1_l1',
            lessonNumber: 1,
            title: 'បច្ចេកទេសលើករង និងដាំស្ពៃខៀវ/ត្រកួនក្នុងសួនសាលា',
            pageRange: 'ទំព័រ ១-៦',
            semester: 1,
            recommendedPeriods: 2,
            objectives: {
              knowledge: 'សិស្សស្គាល់របៀបកាប់ដី ហាលដី ដាក់ជីកំប៉ុស្តិ៍ និងសាបគ្រាប់បន្លែ។',
              skills: 'សិស្សលើករងបន្លែ និងស្រោចទឹកថែទាំបន្លែបានត្រឹមត្រូវ។',
              attitude: 'សិស្សស្រឡាញ់កម្លាំងពលកម្ម យល់ដឹងពីតម្លៃម្ហូបអាហារសុវត្ថិភាព។'
            },
            keyConcepts: ['រងបន្លែ', 'ជីកំប៉ុស្តិ៍សរីរាង្គ', 'ការថែទាំ'],
            suggestedMaterials: ['ចបកាប់', 'ធុងស្រោចទឹក', 'គ្រាប់ពូជស្ពៃ'],
            suggestedGameTemplate: 'adventure',
            gameActivityKh: 'ដំណើរផ្សងព្រេងអ្នកដាំបន្លែឆ្លាតវៃ (Green Thumb Quest)',
            sampleQuestions: [
              {
                question: 'ហេតុអ្វីបានជាត្រូវហាលដីមុនពេលដាំបន្លែ?',
                options: ['ដើម្បីសម្លាប់ពពួកផ្សិត និងមេរោគក្នុងដី', 'ដើម្បីឱ្យដីស្ងួតលែងដុះបន្លែ', 'ដើម្បីឱ្យដីរឹង', 'គ្មានមូលហេតុ'],
                correctIndex: 0,
                explanation: 'ការហាលដីជួយសម្លាប់ពងដង្កូវ មេរោគ និងធ្វើឱ្យដីធូរមានជីជាតិ។'
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper to retrieve subject curriculum by subject name and grade
export function getMoEYSSubjectCurriculum(subjectName: string, grade: number): MoEYSSubjectCurriculum | undefined {
  const normSubject = subjectName.trim().toLowerCase();
  return MOEYS_PRIMARY_CURRICULUM_DATABASE.find(
    s => (s.subjectNameKh.toLowerCase().includes(normSubject) || normSubject.includes(s.subjectNameKh.toLowerCase()) || s.subjectKey.includes(normSubject)) && s.grade === grade
  ) || MOEYS_PRIMARY_CURRICULUM_DATABASE.find(s => s.subjectNameKh.toLowerCase().includes(normSubject) || normSubject.includes(s.subjectNameKh.toLowerCase())) || MOEYS_PRIMARY_CURRICULUM_DATABASE.find(s => s.grade === grade);
}

// Get all lessons for a specific subject and grade
export function getLessonsBySubjectAndGrade(subjectName: string, grade: number): MoEYSTextbookLesson[] {
  const cur = getMoEYSSubjectCurriculum(subjectName, grade);
  if (!cur) return [];
  return cur.chapters.flatMap(c => c.lessons);
}

// Get all official primary subjects
export const MOEYS_PRIMARY_SUBJECTS = [
  'ភាសាខ្មែរ',
  'គណិតវិទ្យា',
  'វិទ្យាសាស្ត្រ',
  'សិក្សាសង្គម',
  'ភាសាអង់គ្លេស',
  'អប់រំសិល្បៈ',
  'អប់រំកាយ និងកីឡា',
  'បំណិនជីវិត'
];
