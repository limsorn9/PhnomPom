import React, { useState, useMemo, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  MoEYSRoyalHeader,
  AngkorPageWatermark,
  SchoolOfficialStamp,
  SchoolStampCirclePlaceholder,
  MoEYSOfficialDualSignatures,
  getKhmerLunarDate,
  getKhmerSolarDate
} from './AngkorMotif';
import { ClassCommitteePrintModal } from './ClassCommitteePrintModal';
import { StudentHealthBookletModal } from './StudentHealthBookletModal';
import { ClassStudentStatisticsPriModal } from './ClassStudentStatisticsPriModal';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';
import {
  Printer,
  FileText,
  Award,
  Calendar,
  User,
  Users,
  Building2,
  CheckCircle,
  Settings,
  ChevronRight,
  Download,
  Eye,
  Sliders,
  Send,
  ArrowRightLeft,
  FileSpreadsheet,
  Handshake,
  Mail,
  Search,
  Filter,
  Layers,
  Sparkles,
  Check,
  Share2,
  BookOpen,
  ClipboardList,
  AlertCircle,
  HeartPulse
} from 'lucide-react';

export type DocumentCategory = 'all' | 'students' | 'agreements_invitations' | 'staff_admin' | 'school_reports' | 'class_governance';

export type DocumentType =
  // 1. សិស្ស & ការសិក្សា (Student Academic)
  | 'study_certificate'
  | 'transfer_letter'
  | 'commendation_letter'
  | 'student_scorecard'
  | 'primary_completion_cert'
  // 2. កិច្ចព្រមព្រៀង & លិខិតអញ្ជើញ (Agreements, Compacts & Invitations)
  | 'parent_agreement'
  | 'parent_invitation'
  | 'student_code_of_conduct_agreement'
  | 'parent_meeting_minutes'
  | 'remedial_support_agreement'
  // 3. រដ្ឋបាល & បុគ្គលិក (Staff & Administration)
  | 'mission_order'
  | 'leave_request'
  | 'employment_certificate'
  | 'teacher_duty_appointment'
  // 4. របាយការណ៍សាលា & ស្ដង់ដា (School Reports & Standards)
  | 'model_school_report'
  | 'asset_inventory_report'
  | 'school_development_plan_summary'
  // 5. គណៈកម្មការ & ការគ្រប់គ្រងថ្នាក់ (Class Governance & Council)
  | 'class_committee_doc'
  | 'class_council_structure'
  | 'classroom_inspection_checklist'
  | 'class_student_statistics_pri'
  | 'student_health_booklet';

interface DocumentTemplateMeta {
  id: DocumentType;
  titleKhmer: string;
  titleLatin: string;
  category: DocumentCategory;
  categoryNameKhmer: string;
  targetType: 'student' | 'teacher' | 'classroom' | 'school';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  isVerifiedMoEYS: boolean;
}

export const DOCUMENT_TEMPLATES: DocumentTemplateMeta[] = [
  // Category: students
  {
    id: 'study_certificate',
    titleKhmer: '១. លិខិតបញ្ជាក់ការសិក្សា',
    titleLatin: 'Certificate of Enrollment / Study',
    category: 'students',
    categoryNameKhmer: 'សិស្ស & ការសិក្សា',
    targetType: 'student',
    description: 'បញ្ជាក់អំពីស្ថានភាពសិក្សាផ្លូវការរបស់សិស្សក្នុងឆ្នាំសិក្សាបច្ចុប្បន្ន',
    icon: FileText,
    accentColor: 'text-blue-600 bg-blue-50 border-blue-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'transfer_letter',
    titleKhmer: '២. លិខិតផ្ទេរការសិក្សាសិស្ស',
    titleLatin: 'Student Transfer Certificate',
    category: 'students',
    categoryNameKhmer: 'សិស្ស & ការសិក្សា',
    targetType: 'student',
    description: 'លិខិតផ្លូវការផ្ទេរសិស្សចេញទៅកាន់សាលារៀន ឬរាជធានី-ខេត្តផ្សេង',
    icon: ArrowRightLeft,
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'commendation_letter',
    titleKhmer: '៣. លិខិតសរសើរ & លើកទឹកចិត្ត',
    titleLatin: 'Certificate of Commendation',
    category: 'students',
    categoryNameKhmer: 'សិស្ស & ការសិក្សា',
    targetType: 'student',
    description: 'ប័ណ្ណសរសើរលើកទឹកចិត្តសិស្សឆ្នើម ពូកែ និងមានវិន័យថ្លៃថ្នូរ',
    icon: Award,
    accentColor: 'text-amber-500 bg-amber-50 border-amber-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'student_scorecard',
    titleKhmer: '៤. ព្រឹត្តិបត្រពិន្ទុសិស្សប្រចាំខែ/ឆមាស',
    titleLatin: 'Student Monthly/Semester Report Card',
    category: 'students',
    categoryNameKhmer: 'សិស្ស & ការសិក្សា',
    targetType: 'student',
    description: 'សន្លឹករបាយការណ៍ពិន្ទុគ្រប់មុខវិជ្ជា ចំណាត់ថ្នាក់ មធ្យមភាគ និងមតិយោបល់គ្រូ',
    icon: FileSpreadsheet,
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'primary_completion_cert',
    titleKhmer: '៥. វិញ្ញាបនបត្របឋមសិក្សាភូមិ',
    titleLatin: 'Primary Education Completion Certificate',
    category: 'students',
    categoryNameKhmer: 'សិស្ស & ការសិក្សា',
    targetType: 'student',
    description: 'លិខិតបញ្ជាក់ការបញ្ចប់ការសិក្សាកម្រិតបឋមសិក្សា (ថ្នាក់ទី៦)',
    icon: Award,
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    isVerifiedMoEYS: true
  },

  // Category: agreements_invitations
  {
    id: 'parent_agreement',
    titleKhmer: '៦. កិច្ចសន្យា/កិច្ចព្រមព្រៀងមាតាបិតា',
    titleLatin: 'Parent Responsibility Agreement / Compact',
    category: 'agreements_invitations',
    categoryNameKhmer: 'កិច្ចព្រមព្រៀង & លិខិតអញ្ជើញ',
    targetType: 'student',
    description: 'កិច្ចព្រមព្រៀងរវាងអាណាព្យាបាល និងសាលារៀនក្នុងការតាមដានការរៀនសូត្រ និងវិន័យ',
    icon: Handshake,
    accentColor: 'text-teal-600 bg-teal-50 border-teal-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'parent_invitation',
    titleKhmer: '៧. លិខិតអញ្ជើញមាតាបិតាប្រជុំ',
    titleLatin: 'Parent-Teacher Meeting Invitation',
    category: 'agreements_invitations',
    categoryNameKhmer: 'កិច្ចព្រមព្រៀង & លិខិតអញ្ជើញ',
    targetType: 'student',
    description: 'លិខិតអញ្ជើញផ្លូវការជូនឪពុកម្តាយចូលរួមប្រជុំពិភាក្សាការសិក្សាកូន',
    icon: Mail,
    accentColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'student_code_of_conduct_agreement',
    titleKhmer: '៨. កិច្ចសន្យាវិន័យ និងក្រមសីលធម៌សិស្ស',
    titleLatin: 'Student Discipline & Code of Conduct Agreement',
    category: 'agreements_invitations',
    categoryNameKhmer: 'កិច្ចព្រមព្រៀង & លិខិតអញ្ជើញ',
    targetType: 'student',
    description: 'កិច្ចសន្យារបស់សិស្សក្នុងការគោរពបទបញ្ជាផ្ទៃក្នុង វិន័យ និងអនាម័យសាលា',
    icon: CheckCircle,
    accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'parent_meeting_minutes',
    titleKhmer: '៩. កំណត់ហេតុអង្គប្រជុំមាតាបិតាសិស្ស',
    titleLatin: 'Parent-Teacher Meeting Minutes',
    category: 'agreements_invitations',
    categoryNameKhmer: 'កិច្ចព្រមព្រៀង & លិខិតអញ្ជើញ',
    targetType: 'classroom',
    description: 'កំណត់ហេតុផ្លូវការកត់ត្រាដំណើរការ មតិយោបល់ និងសេចក្តីសម្រេចចិត្តនៃអង្គប្រជុំ',
    icon: ClipboardList,
    accentColor: 'text-sky-600 bg-sky-50 border-sky-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'remedial_support_agreement',
    titleKhmer: '១០. កិច្ចព្រមព្រៀងបំប៉នសិស្សរៀនយឺត',
    titleLatin: 'Remedial Learning Intervention Agreement',
    category: 'agreements_invitations',
    categoryNameKhmer: 'កិច្ចព្រមព្រៀង & លិខិតអញ្ជើញ',
    targetType: 'student',
    description: 'កិច្ចព្រមព្រៀងរៀបចំម៉ោងបំប៉នបន្ថែមសម្រាប់សិស្សដែលជួបការលំបាកផ្នែកអំណាន ឬគណិតវិទ្យា',
    icon: BookOpen,
    accentColor: 'text-purple-600 bg-purple-50 border-purple-200',
    isVerifiedMoEYS: true
  },

  // Category: staff_admin
  {
    id: 'mission_order',
    titleKhmer: '១១. លិខិតបញ្ជាបេសកកម្ម',
    titleLatin: 'Official Mission Order',
    category: 'staff_admin',
    categoryNameKhmer: 'រដ្ឋបាល & បុគ្គលិក',
    targetType: 'teacher',
    description: 'លិខិតចាត់តាំងលោកគ្រូ-អ្នកគ្រូចុះបំពេញការងារ ឬចូលរួមវគ្គបណ្តុះបណ្តាល',
    icon: Send,
    accentColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'leave_request',
    titleKhmer: '១២. ពាក្យសុំច្បាប់ឈប់សម្រាក',
    titleLatin: 'Staff Leave Request Form',
    category: 'staff_admin',
    categoryNameKhmer: 'រដ្ឋបាល & បុគ្គលិក',
    targetType: 'teacher',
    description: 'ទម្រង់សុំអនុញ្ញាតច្បាប់ឈប់សម្រាកការងាររបស់លោកគ្រូ-អ្នកគ្រូ និងបុគ្គលិក',
    icon: Calendar,
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'employment_certificate',
    titleKhmer: '១៣. លិខិតបញ្ជាក់ការបម្រើការងារ',
    titleLatin: 'Certificate of Employment',
    category: 'staff_admin',
    categoryNameKhmer: 'រដ្ឋបាល & បុគ្គលិក',
    targetType: 'teacher',
    description: 'បញ្ជាក់អំពីតួនាទី ក្របខ័ណ្ឌ និងកាលបរិច្ឆេទបម្រើការងាររបស់គ្រូបង្រៀន',
    icon: User,
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'teacher_duty_appointment',
    titleKhmer: '១៤. លិខិតចាត់តាំងភារកិច្ចគ្រូបន្ទុកថ្នាក់',
    titleLatin: 'Homeroom Teacher Duty Assignment Letter',
    category: 'staff_admin',
    categoryNameKhmer: 'រដ្ឋបាល & បុគ្គលិក',
    targetType: 'teacher',
    description: 'សេចក្តីសម្រេចចាត់តាំងគ្រូបន្ទុកថ្នាក់ និងការបែងចែកបន្ទុកម៉ោងបង្រៀន',
    icon: Building2,
    accentColor: 'text-blue-700 bg-blue-50 border-blue-200',
    isVerifiedMoEYS: true
  },

  // Category: school_reports
  {
    id: 'model_school_report',
    titleKhmer: '១៥. របាយការណ៍សាលាគំរូ ៥ ស្តង់ដា',
    titleLatin: '5 Model School Standards Evaluation Report',
    category: 'school_reports',
    categoryNameKhmer: 'របាយការណ៍សាលា & ស្ដង់ដា',
    targetType: 'school',
    description: 'តារាងវាយតម្លៃសូចនាករស្ដង់ដាសាលារៀនគំរូទាំង ៥ របស់ក្រសួងអប់រំ យុវជន និងកីឡា',
    icon: Building2,
    accentColor: 'text-blue-800 bg-blue-50 border-blue-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'asset_inventory_report',
    titleKhmer: '១៦. តារាងសារពើភ័ណ្ឌ និងទ្រព្យសម្បត្តិរដ្ឋ',
    titleLatin: 'School Asset & Property Inventory Ledger',
    category: 'school_reports',
    categoryNameKhmer: 'របាយការណ៍សាលា & ស្ដង់ដា',
    targetType: 'school',
    description: 'បញ្ជីរាយនាមសម្ភាររូបវន្ត តុ កៅអី កុំព្យូទ័រ និងសម្ភារឧបទេសក្នុងសាលា',
    icon: Sliders,
    accentColor: 'text-purple-600 bg-purple-50 border-purple-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'school_development_plan_summary',
    titleKhmer: '១៧. សេចក្តីសង្ខេបផែនការអភិវឌ្ឍន៍សាលារៀន',
    titleLatin: 'School Development Strategic Plan Summary',
    category: 'school_reports',
    categoryNameKhmer: 'របាយការណ៍សាលា & ស្ដង់ដា',
    targetType: 'school',
    description: 'ទម្រង់សង្ខេបចក្ខុវិស័យ យុទ្ធសាស្ត្រ និងសកម្មភាពអាទិភាពប្រចាំឆ្នាំរបស់សាលា',
    icon: Layers,
    accentColor: 'text-amber-700 bg-amber-50 border-amber-200',
    isVerifiedMoEYS: true
  },

  // Category: class_governance
  {
    id: 'class_committee_doc',
    titleKhmer: '១៨. គណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន (គ.ក.ថ.)',
    titleLatin: 'Classroom Management Committee (Landscape & Org Chart)',
    category: 'class_governance',
    categoryNameKhmer: 'ការគ្រប់គ្រងថ្នាក់ & គណៈកម្មការ',
    targetType: 'classroom',
    description: 'តារាងសមាសភាពផ្លូវការ (Landscape) និងរចនាសម្ព័ន្ធរូបថត (Portrait Org Chart) គ.ក.ថ.',
    icon: Award,
    accentColor: 'text-blue-800 bg-blue-50 border-blue-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'class_council_structure',
    titleKhmer: '១៩. រចនាសម្ព័ន្ធក្រុមប្រឹក្សាកុមារថ្នាក់រៀន',
    titleLatin: 'Classroom Children Council Leadership Structure',
    category: 'class_governance',
    categoryNameKhmer: 'ការគ្រប់គ្រងថ្នាក់ & គណៈកម្មការ',
    targetType: 'classroom',
    description: 'តារាងបញ្ជីរាយនាមប្រធានថ្នាក់ អនុប្រធាន ប្រធានក្រុមអនាម័យ វិន័យ សិក្សា និងកីឡា',
    icon: Users,
    accentColor: 'text-teal-700 bg-teal-50 border-teal-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'classroom_inspection_checklist',
    titleKhmer: '២០. បញ្ជីត្រួតពិនិត្យអធិការកិច្ចថ្នាក់រៀន',
    titleLatin: 'Classroom Inspection & Environment Audit',
    category: 'class_governance',
    categoryNameKhmer: 'ការគ្រប់គ្រងថ្នាក់ & គណៈកម្មការ',
    targetType: 'classroom',
    description: 'តារាងវាយតម្លៃការតុបតែងបន្ទប់រៀន បរិស្ថានអនាម័យ ជ្រុងអំណាន និងកិច្ចតែងការបង្រៀន',
    icon: CheckCircle,
    accentColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'class_student_statistics_pri',
    titleKhmer: '២១. តារាងស្ថិតិសិស្សតាមថ្នាក់ (MoEYS PRI)',
    titleLatin: 'Official Primary Student Statistics Ledger (PRI Form)',
    category: 'class_governance',
    categoryNameKhmer: 'ការគ្រប់គ្រងថ្នាក់ & គណៈកម្មការ',
    targetType: 'classroom',
    description: 'តារាងស្ថិតិផ្លូវការ MoEYS PRI បែងចែកតាមអាយុ (៦-១១+ ឆ្នាំ) ពិការភាព សុខភាព និងជនជាតិដើមភាគតិច',
    icon: FileSpreadsheet,
    accentColor: 'text-blue-700 bg-blue-50 border-blue-200',
    isVerifiedMoEYS: true
  },
  {
    id: 'student_health_booklet',
    titleKhmer: '២២. សៀវភៅសុខភាពសិស្ស (៣ទំព័រពេញលេញ)',
    titleLatin: 'Student Health & Medical History Record Booklet (3 Pages)',
    category: 'students',
    categoryNameKhmer: 'សិស្ស & ការសិក្សា',
    targetType: 'student',
    description: 'សៀវភៅសុខភាព ៣ ទំព័រ៖ គម្របមុខ ប្រវត្តិជំងឺឆ្លងកាត់ និងតារាងពិនិត្យសុខភាពប្រចាំឆ្នាំ',
    icon: HeartPulse,
    accentColor: 'text-rose-600 bg-rose-50 border-rose-200',
    isVerifiedMoEYS: true
  }
];

export const OfficialDocumentCenter: React.FC = () => {
  const {
    schoolProfile,
    students,
    teachers,
    classrooms,
    scores,
    printSettings,
    setPrintSettings,
    modelSchoolStandards,
    schoolAssets,
    selectedAcademicYear,
    parentMeetings,
    classCouncils,
    atRiskStudents
  } = useSchool();

  const printCanvasRef = useRef<HTMLDivElement>(null);

  // Active Category Filter & Active Document Type
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>('parent_agreement');

  // Selected Entities for dynamic database binding
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('ក');
  const [selectedMonth, setSelectedMonth] = useState<string>('ឆមាសទី១');
  const [showCommitteeModal, setShowCommitteeModal] = useState<boolean>(false);
  const [showPriModal, setShowPriModal] = useState<boolean>(false);
  const [showHealthBookletModal, setShowHealthBookletModal] = useState<boolean>(false);

  // Paper & Print configuration
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [paperOrientation, setPaperOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Form custom editable fields
  const [customFields, setCustomFields] = useState({
    purpose: 'ដើម្បីយកទៅប្រើប្រាស់តាមការគួរ',
    destination: 'រាជធានីភ្នំពេញ',
    durationDays: '០៣ ថ្ងៃ',
    reason: 'មានធុរៈចាំបាច់ក្នុងគ្រួសារ',
    meetingDate: new Date().toISOString().split('T')[0],
    meetingTime: '០៨:០០ ព្រឹក',
    meetingTopic: 'ការពិភាក្សាអំពីលទ្ធផលសិក្សារបស់សិស្ស និងកិច្ចសហការលើកកម្ពស់អំណាន',
    honorReason: 'ទទួលបានចំណាត់ថ្នាក់លេខ១ ប្រចាំឆមាសទី១ ឆ្នាំសិក្សា ' + selectedAcademicYear,
    letterNumber: '១០៨/២៤ អយក.សប',
    dateKhmer: 'ថ្ងៃសុក្រ ៥កើត ខែចេត្រ ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៨',
    agreementCommitment1: 'ជួយដាស់តឿន និងរៀបចំឱ្យកូនរៀនបន្ថែមនៅផ្ទះយ៉ាងតិច ១ ទៅ ២ម៉ោងជារៀងរាល់ថ្ងៃ',
    agreementCommitment2: 'បញ្ជូនកូនមកសាលារៀនឱ្យបានទៀងទាត់ មិនឱ្យអវត្តមានដោយគ្មានមូលហេតុត្រឹមត្រូវ',
    agreementCommitment3: 'ចូលរួមកិច្ចប្រជុំមាតាបិតាសិស្ស និងសហការជិតស្និទ្ធជាមួយលោកគ្រូ-អ្នកគ្រូបន្ទុកថ្នាក់',
    schoolCommitment: 'យកចិត្តទុកដាក់បង្ហាត់បង្រៀន និងតាមដានការលូតលាស់ចំណេះដឹង សីលធម៌ និងសុខភាពរបស់សិស្សឱ្យអស់ពីលទ្ធភាព',
    remedialFocusArea: 'ការពង្រឹងសមត្ថភាពអំណាន និងការគិតលេខបូកដកគុណចែក',
    remedialSchedule: 'រៀងរាល់រសៀលថ្ងៃព្រហស្បតិ៍ និងថ្ងៃសុក្រ ម៉ោង ៤:០០ ដល់ ៥:០០ ល្ងាច'
  });

  // Current entity lookups
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  const selectedTeacher = useMemo(() => {
    return teachers.find(t => t.id === selectedTeacherId) || teachers[0];
  }, [teachers, selectedTeacherId]);

  const selectedClassroom = useMemo(() => {
    return classrooms.find(c => c.grade === selectedGrade && c.section === selectedSection) || {
      grade: selectedGrade,
      section: selectedSection,
      homeroomTeacherName: selectedTeacher?.nameKhmer || 'លោកគ្រូ អ្នកគ្រូ',
      roomNumber: `បន្ទប់ ${selectedGrade}${selectedSection}`
    };
  }, [classrooms, selectedGrade, selectedSection, selectedTeacher]);

  const currentClassStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [students, selectedGrade, selectedSection]);

  const selectedStudentScore = useMemo(() => {
    return scores.find(
      s => s.studentId === selectedStudent?.id && s.monthOrSemester === selectedMonth
    );
  }, [scores, selectedStudent, selectedMonth]);

  const activeTemplateMeta = useMemo(() => {
    return DOCUMENT_TEMPLATES.find(t => t.id === selectedDoc) || DOCUMENT_TEMPLATES[0];
  }, [selectedDoc]);

  // Filtered Templates for Catalog
  const filteredTemplates = useMemo(() => {
    return DOCUMENT_TEMPLATES.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        template.titleKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.titleLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Print / PDF Handlers
  const handlePrint = () => {
    if (printCanvasRef.current) {
      printElement(printCanvasRef.current, {
        landscape: paperOrientation === 'landscape',
        pageTitle: activeTemplateMeta.titleKhmer
      });
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!printCanvasRef.current) return;
    setIsExportingPdf(true);
    try {
      const filename = `${activeTemplateMeta.titleKhmer}_${schoolProfile.nameKhmer || 'សាលារៀន'}.pdf`;
      await downloadElementAsPdf(printCanvasRef.current, filename, {
        landscape: paperOrientation === 'landscape'
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Bar (no-print) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm no-print">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Printer className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-moul text-blue-950">
                  មជ្ឈមណ្ឌលទម្រង់ឯកសារផ្លូវការ & បោះពុម្ព
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  MoEYS Standard
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                ជ្រើសរើសទម្រង់បែបបទផ្លូវការ បំពេញទិន្នន័យស្វ័យប្រវត្តិពីមូលដ្ឋានទិន្នន័យ និងទាញយកជា PDF / បោះពុម្ព (A4 / Letter)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'កំពុងរៀបចំ...' : 'ទាញយកជា PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>
          </div>
        </div>

        {/* Category Filters & Search Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Categories Tab */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ទម្រង់ទាំងអស់ ({DOCUMENT_TEMPLATES.length})
            </button>
            <button
              onClick={() => setSelectedCategory('agreements_invitations')}
              className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'agreements_invitations'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🤝 កិច្ចព្រមព្រៀង & លិខិតអញ្ជើញ
            </button>
            <button
              onClick={() => setSelectedCategory('students')}
              className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'students'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🎓 សិស្ស & ការសិក្សា
            </button>
            <button
              onClick={() => setSelectedCategory('staff_admin')}
              className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'staff_admin'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📋 រដ្ឋបាល & បុគ្គលិក
            </button>
            <button
              onClick={() => setSelectedCategory('school_reports')}
              className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'school_reports'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🏫 របាយការណ៍សាលា & ស្ដង់ដា
            </button>
            <button
              onClick={() => setSelectedCategory('class_governance')}
              className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'class_governance'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🏛️ គណៈកម្មការ & ការគ្រប់គ្រងថ្នាក់
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកទម្រង់ឯកសារ..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Template Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-100 max-h-56 overflow-y-auto p-1 scrollbar-thin">
          {filteredTemplates.map(template => {
            const isSelected = selectedDoc === template.id;
            const IconComp = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedDoc(template.id)}
                className={`p-3 rounded-xl text-left border transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${template.accentColor}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-950 font-moul' : 'text-slate-800'}`}>
                      {template.titleKhmer}
                    </p>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-times">{template.titleLatin}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (Col 4): Context Controls & Settings (no-print) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          {/* Active Document Badge Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ទម្រង់កំពុងជ្រើសរើស</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {activeTemplateMeta.categoryNameKhmer}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-sm font-moul text-blue-950">{activeTemplateMeta.titleKhmer}</h2>
              <p className="text-xs text-slate-500 mt-1 font-times">{activeTemplateMeta.titleLatin}</p>
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {activeTemplateMeta.description}
              </p>

              {selectedDoc === 'class_committee_doc' && (
                <button
                  onClick={() => setShowCommitteeModal(true)}
                  className="w-full mt-3 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Award className="w-4 h-4 text-blue-200" />
                  <span>បើកទម្រង់ពេញលេញ (Landscape & Org Chart)</span>
                </button>
              )}

              {selectedDoc === 'class_student_statistics_pri' && (
                <button
                  onClick={() => setShowPriModal(true)}
                  className="w-full mt-3 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-200" />
                  <span>បើកផ្ទាំងបោះពុម្ពតារាងស្ថិតិ PRI ពេញលេញ</span>
                </button>
              )}

              {selectedDoc === 'student_health_booklet' && (
                <button
                  onClick={() => setShowHealthBookletModal(true)}
                  className="w-full mt-3 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <HeartPulse className="w-4 h-4 text-rose-200" />
                  <span>បើកសៀវភៅសុខភាព ៣ ទំព័រពេញលេញ (PDF)</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Data Selector based on Template Target */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>បំពេញទិន្នន័យស្វ័យប្រវត្តិពីមូលដ្ឋានទិន្នន័យ</span>
            </h3>

            {/* Target 1: Student Selection */}
            {activeTemplateMeta.targetType === 'student' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ជ្រើសរើសសិស្សគោលដៅ *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={e => {
                      setSelectedStudentId(e.target.value);
                      const s = students.find(item => item.id === e.target.value);
                      if (s) {
                        setSelectedGrade(s.grade);
                        setSelectedSection(s.section);
                      }
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} ({s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}) - ថ្នាក់ទី{s.grade}{s.section} [{s.code}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-filled Student Details Pill */}
                {selectedStudent && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1 text-slate-700">
                    <p className="font-bold text-blue-950">
                      ឪពុក៖ <span className="font-normal">{selectedStudent.fatherName || '—'}</span> | ម្តាយ៖ <span className="font-normal">{selectedStudent.motherName || '—'}</span>
                    </p>
                    <p>
                      អាណាព្យាបាល៖ <span className="font-semibold">{selectedStudent.guardianName || selectedStudent.fatherName || '—'}</span> ({selectedStudent.guardianPhone || 'គ្មានលេខ'})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      ទីលំនៅ៖ {selectedStudent.currentAddress || selectedStudent.address || 'មិនបានបញ្ជាក់'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Target 2: Teacher Selection */}
            {activeTemplateMeta.targetType === 'teacher' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ជ្រើសរើសគ្រូបង្រៀន / បុគ្គលិក *
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nameKhmer} ({t.position || 'គ្រូបង្រៀន'}) - អត្តលេខ: {t.staffCode}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTeacher && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1 text-slate-700">
                    <p className="font-bold text-indigo-950">
                      ក្របខ័ណ្ឌ៖ <span className="font-normal">{selectedTeacher.civilServiceFramework || 'គ្រូបឋមសិក្សា'}</span>
                    </p>
                    <p>
                      កាំប្រាក់/កម្រិត៖ <span className="font-semibold">{selectedTeacher.salaryIndex || 'ក.២.១'}</span> | ទូរស័ព្ទ៖ {selectedTeacher.phone}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Target 3: Classroom / Grade Selection */}
            {(activeTemplateMeta.targetType === 'classroom' || activeTemplateMeta.id === 'student_scorecard') && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
                  <select
                    value={selectedGrade}
                    onChange={e => setSelectedGrade(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">បន្ទប់</label>
                  <select
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    {['ក', 'ខ', 'គ', 'A', 'B'].map(s => (
                      <option key={s} value={s}>បន្ទប់ «{s}»</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Target: Month/Semester for Scorecards */}
            {activeTemplateMeta.id === 'student_scorecard' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ជ្រើសរើសខែ / ឆមាស</label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  {['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី១', 'ឆមាសទី២'].map(m => (
                    <option key={m} value={m}>{m.startsWith('ឆមាស') ? m : `ប្រចាំខែ ${m}`}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Contextual Custom Fields Editor */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>កែសម្រួលខ្លឹមសារបន្ថែម (Custom Overrides)</span>
            </h3>

            {/* Template: parent_agreement */}
            {selectedDoc === 'parent_agreement' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ការសន្យារបស់អាណាព្យាបាល (ចំណុចទី១)</label>
                  <textarea
                    rows={2}
                    value={customFields.agreementCommitment1}
                    onChange={e => setCustomFields({ ...customFields, agreementCommitment1: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ការសន្យារបស់អាណាព្យាបាល (ចំណុចទី២)</label>
                  <textarea
                    rows={2}
                    value={customFields.agreementCommitment2}
                    onChange={e => setCustomFields({ ...customFields, agreementCommitment2: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ការប្តេជ្ញាចិត្តរបស់សាលារៀន</label>
                  <textarea
                    rows={2}
                    value={customFields.schoolCommitment}
                    onChange={e => setCustomFields({ ...customFields, schoolCommitment: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Template: parent_invitation */}
            {selectedDoc === 'parent_invitation' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">កាលបរិច្ឆេទប្រជុំ</label>
                    <input
                      type="date"
                      value={customFields.meetingDate}
                      onChange={e => setCustomFields({ ...customFields, meetingDate: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ម៉ោងប្រជុំ</label>
                    <input
                      type="text"
                      value={customFields.meetingTime}
                      onChange={e => setCustomFields({ ...customFields, meetingTime: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កម្មវត្ថុ / របៀបវារៈ</label>
                  <textarea
                    rows={2}
                    value={customFields.meetingTopic}
                    onChange={e => setCustomFields({ ...customFields, meetingTopic: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Template: remedial_support_agreement */}
            {selectedDoc === 'remedial_support_agreement' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">មុខវិជ្ជា/សមត្ថភាពត្រូវបំប៉ន</label>
                  <input
                    type="text"
                    value={customFields.remedialFocusArea}
                    onChange={e => setCustomFields({ ...customFields, remedialFocusArea: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កាលវិភាគម៉ោងបំប៉ន</label>
                  <input
                    type="text"
                    value={customFields.remedialSchedule}
                    onChange={e => setCustomFields({ ...customFields, remedialSchedule: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Template: mission_order */}
            {selectedDoc === 'mission_order' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ទីកន្លែងបេសកកម្ម</label>
                  <input
                    type="text"
                    value={customFields.destination}
                    onChange={e => setCustomFields({ ...customFields, destination: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">រយៈពេលបេសកកម្ម</label>
                  <input
                    type="text"
                    value={customFields.durationDays}
                    onChange={e => setCustomFields({ ...customFields, durationDays: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Template: leave_request */}
            {selectedDoc === 'leave_request' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">មូលហេតុសុំច្បាប់</label>
                  <input
                    type="text"
                    value={customFields.reason}
                    onChange={e => setCustomFields({ ...customFields, reason: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ចំនួនថ្ងៃឈប់សម្រាក</label>
                  <input
                    type="text"
                    value={customFields.durationDays}
                    onChange={e => setCustomFields({ ...customFields, durationDays: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            )}

            {/* Common Header Info: Letter Number & Date */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">លេខលិខិត</label>
                <input
                  type="text"
                  value={customFields.letterNumber}
                  onChange={e => setCustomFields({ ...customFields, letterNumber: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">កាលបរិច្ឆេទ (ខ្មែរ)</label>
                <input
                  type="text"
                  value={customFields.dateKhmer}
                  onChange={e => setCustomFields({ ...customFields, dateKhmer: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Print & Official Seal Options */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">ជម្រើសទំហំក្រដាស & ការបោះត្រា</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">ទំហំក្រដាស</label>
                <select
                  value={paperSize}
                  onChange={e => setPaperSize(e.target.value as 'a4' | 'letter')}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5"
                >
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">Letter (8.5 × 11 in)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">ទិសដៅក្រដាស</label>
                <select
                  value={paperOrientation}
                  onChange={e => setPaperOrientation(e.target.value as 'portrait' | 'landscape')}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5"
                >
                  <option value="portrait">បញ្ឈរ (Portrait)</option>
                  <option value="landscape">ផ្ដេក (Landscape)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printSettings.showRoundStamp}
                  onChange={e => setPrintSettings(prev => ({ ...prev, showRoundStamp: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>បង្ហាញត្រាមូលក្រហមសាលារៀន (Round Stamp)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printSettings.showDirectorSignature}
                  onChange={e => setPrintSettings(prev => ({ ...prev, showDirectorSignature: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>បង្ហាញហត្ថលេខានាយក (Director Signature)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printSettings.showRoyalHeader}
                  onChange={e => setPrintSettings(prev => ({ ...prev, showRoyalHeader: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>បង្ហាញក្បាលលិខិតជាតិ (Royal Kingdom Header)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side (Col 8): High-Precision Printable Canvas */}
        <div className="lg:col-span-8 flex justify-center">
          <div
            ref={printCanvasRef}
            className={`w-full ${
              paperOrientation === 'landscape' ? 'max-w-[297mm] min-h-[210mm]' : 'max-w-[210mm] min-h-[297mm]'
            } bg-white text-slate-900 p-8 sm:p-12 md:p-14 shadow-lg border border-slate-200 rounded-sm relative flex flex-col justify-between font-battambang leading-relaxed text-sm print:shadow-none print:border-none print:p-8 print:m-0 print:w-full print:max-w-full`}
          >
            {/* Background Watermark */}
            <AngkorPageWatermark opacity={0.035} />

            {/* DOCUMENT CONTENT */}
            <div className="space-y-5 relative z-10">
              {/* Royal Kingdom Header */}
              {printSettings.showRoyalHeader && (
                <MoEYSRoyalHeader className="pb-1" />
              )}

              {/* School Header & Letter Number */}
              <div className="flex justify-between items-start pt-1 text-xs leading-relaxed">
                <div>
                  <p className="font-bold text-slate-800 uppercase">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-semibold text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-moul text-xs text-blue-950 mt-0.5">{schoolProfile.nameKhmer}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">លេខ: {customFields.letterNumber}</p>
                </div>

                <div className="text-right text-xs">
                  <p className="text-slate-600">{schoolProfile.addressKhmer || 'រាជធានីភ្នំពេញ'}</p>
                  <p className="text-slate-600">{customFields.dateKhmer}</p>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 1: PARENT RESPONSIBILITY AGREEMENT (កិច្ចសន្យា/កិច្ចព្រមព្រៀងមាតាបិតា) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'parent_agreement' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base sm:text-lg text-blue-950">
                      កិច្ចព្រមព្រៀង និងការសន្យារបស់មាតាបិតា ឬអាណាព្យាបាលសិស្ស
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 uppercase font-times">
                      PARENT - SCHOOL COLLABORATION COMPACT & RESPONSIBILITY AGREEMENT
                    </p>
                  </div>

                  <div className="space-y-3 text-justify text-slate-800 text-sm leading-loose pt-1">
                    <p className="indent-8">
                      ដើម្បីចូលរួមលើកកម្ពស់គុណភាពនៃការអប់រំ អាកប្បកិរិយា សីលធម៌ និងការសិក្សារបស់សិស្សានុសិស្សឱ្យកាន់តែប្រសើរឡើង រវាងគណៈគ្រប់គ្រងសាលារៀន និងអាណាព្យាបាលសិស្ស បានព្រមព្រៀងគ្នាក្នុងកិច្ចសន្យានេះដូចខាងក្រោម៖
                    </p>

                    {/* Parties involved */}
                    <div className="pl-4 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                      <p>
                        <b>ភាគី «ក» (សាលារៀន)៖</b> {schoolProfile.nameKhmer} តំណាងដោយលោក/លោកស្រី <b>{schoolProfile.principalName}</b> នាយកសាលា។
                      </p>
                      <p>
                        <b>ភាគី «ខ» (អាណាព្យាបាល)៖</b> ឈ្មោះ <b>{selectedStudent?.guardianName || selectedStudent?.fatherName || '................................'}</b> ត្រូវជា <b>{selectedStudent?.guardianRelationship || 'ឪពុក/ម្តាយ'}</b> របស់សិស្សឈ្មោះ <span className="font-bold font-moul text-blue-950">{selectedStudent?.nameKhmer}</span> ភេទ <b>{selectedStudent?.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</b> រៀននៅថ្នាក់ទី <b>{selectedStudent?.grade}{selectedStudent?.section}</b>។
                      </p>
                      <p>
                        លេខទូរស័ព្ទទំនាក់ទំនង៖ <b>{selectedStudent?.guardianPhone || '........................'}</b> អាសយដ្ឋានបច្ចុប្បន្ន៖ <b>{selectedStudent?.currentAddress || selectedStudent?.address || '........................'}</b>
                      </p>
                    </div>

                    {/* Commitments */}
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-slate-900">ប្រការ ១៖ ការប្តេជ្ញាចិត្តរបស់មាតាបិតា ឬអាណាព្យាបាល (ភាគី ខ)</p>
                      <ul className="list-disc pl-6 space-y-1 text-slate-700">
                        <li>{customFields.agreementCommitment1}</li>
                        <li>{customFields.agreementCommitment2}</li>
                        <li>{customFields.agreementCommitment3}</li>
                        <li>មិនអនុញ្ញាតឱ្យកូនយកសម្ភារៈគ្មានប្រយោជន៍ ឬល្បែងអេឡិចត្រូនិកមកសាលារៀនឡើយ។</li>
                      </ul>

                      <p className="font-bold text-slate-900 pt-2">ប្រការ ២៖ ការទទួលខុសត្រូវរបស់សាលារៀន (ភាគី ក)</p>
                      <ul className="list-disc pl-6 space-y-1 text-slate-700">
                        <li>{customFields.schoolCommitment}</li>
                        <li>ផ្តល់ព័ត៌មានទាន់ពេលវេលាអំពីអវត្តមាន និងលទ្ធផលសិក្សារបស់សិស្សជូនអាណាព្យាបាល។</li>
                      </ul>
                    </div>

                    <p className="indent-8 text-xs text-slate-600 pt-2">
                      កិច្ចព្រមព្រៀងនេះធ្វើឡើងដោយស្ម័គ្រចិត្ត និងមានការឯកភាពគ្នាយ៉ាងពេញលេញរវាងភាគីទាំងពីរ ដោយមានប្រសិទ្ធភាពចាប់ពីថ្ងៃចុះហត្ថលេខានេះតទៅ។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 2: PARENT MEETING INVITATION (លិខិតអញ្ជើញមាតាបិតា) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'parent_invitation' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base sm:text-lg text-blue-950">
                      លិខិតអញ្ជើញមាតាបិតា ឬអាណាព្យាបាលសិស្ស
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 font-times">PARENT - TEACHER MEETING INVITATION</p>
                  </div>

                  <div className="space-y-3 text-justify text-slate-800 text-sm leading-loose pt-2">
                    <p className="font-bold">
                      សូមគោរពអញ្ជើញ៖ មាតាបិតា ឬអាណាព្យាបាលសិស្សឈ្មោះ <span className="font-moul text-blue-950 text-base">{selectedStudent?.nameKhmer}</span>
                    </p>

                    <p className="indent-8">
                      គណៈគ្រប់គ្រង{schoolProfile.nameKhmer} និងលោកគ្រូ-អ្នកគ្រូបន្ទុកថ្នាក់ទី <b>{selectedStudent?.grade}{selectedStudent?.section}</b> មានកិត្តិយសសូមគោរពអញ្ជើញលោក-លោកស្រី ចូលរួមក្នុង <b>កិច្ចប្រជុំមាតាបិតាសិស្ស</b> ដែលនឹងប្រព្រឹត្តទៅតាមកាលវិភាគដូចខាងក្រោម៖
                    </p>

                    <div className="pl-6 space-y-2 font-semibold bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                      <p>🗓️ កាលបរិច្ឆេទ៖ <span className="font-bold text-blue-950">{customFields.meetingDate}</span></p>
                      <p>⏰ វេលាម៉ោង៖ <span className="font-bold text-blue-950">{customFields.meetingTime}</span></p>
                      <p>📍 ទីកន្លែង៖ <span className="font-bold text-blue-950">បន្ទប់រៀនថ្នាក់ទី {selectedStudent?.grade} «{selectedStudent?.section}» នៃ{schoolProfile.nameKhmer}</span></p>
                      <p>📝 កម្មវត្ថុ / របៀបវារៈ៖ <span className="font-bold text-blue-950">{customFields.meetingTopic}</span></p>
                    </div>

                    <p className="indent-8">
                      វត្តមានដ៏ខ្ពង់ខ្ពស់របស់លោក-លោកស្រី ពិតជាមានតម្លៃយ៉ាងខ្លាំងចំពោះអនាគត និងការរីកចម្រើននៃការសិក្សារបស់បុត្រធីតា។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 3: REMEDIAL SUPPORT AGREEMENT (កិច្ចព្រមព្រៀងបំប៉នសិស្សរៀនយឺត) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'remedial_support_agreement' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base sm:text-lg text-blue-950">
                      កិច្ចព្រមព្រៀងស្តីពីការរៀបចំកម្មវិធីបំប៉នបន្ថែមសម្រាប់សិស្ស
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 font-times">REMEDIAL LEARNING INTERVENTION AGREEMENT</p>
                  </div>

                  <div className="space-y-3 text-justify text-slate-800 text-sm leading-loose pt-2">
                    <p className="indent-8">
                      យោងតាមលទ្ធផលនៃការវាយតម្លៃសមត្ថភាព និងការតាមដានការរៀនសូត្ររបស់សិស្សឈ្មោះ <span className="font-bold font-moul text-blue-950">{selectedStudent?.nameKhmer}</span> ភេទ <b>{selectedStudent?.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</b> ថ្នាក់ទី <b>{selectedStudent?.grade}{selectedStudent?.section}</b> សាលារៀនសូមស្នើសុំកិច្ចសហការជាមួយអាណាព្យាបាល ដើម្បីរៀបចំការបង្រៀនបំប៉នដូចខាងក្រោម៖
                    </p>

                    <div className="pl-6 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                      <p>🎯 <b>ផ្នែកដែលត្រូវពង្រឹងបន្ថែម៖</b> {customFields.remedialFocusArea}</p>
                      <p>⏰ <b>កាលវិភាគម៉ោងបំប៉ន៖</b> {customFields.remedialSchedule}</p>
                      <p>👨‍🏫 <b>គ្រូទទួលបន្ទុកបំប៉ន៖</b> {selectedClassroom.homeroomTeacherName}</p>
                    </div>

                    <p className="indent-8 text-xs">
                      អាណាព្យាបាលសិស្សសូមសន្យាថានឹងបញ្ជូនកូនមកចូលរៀនម៉ោងបំប៉នឱ្យបានទៀងទាត់ និងជួយតាមដានការធ្វើកិច្ចការបន្ថែមនៅផ្ទះ ដើម្បីឱ្យកូនអាចតាមទាន់កម្មវិធីសិក្សាបានឆាប់រហ័ស។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 4: CERTIFICATE OF STUDY (លិខិតបញ្ជាក់ការសិក្សា) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'study_certificate' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base sm:text-lg text-blue-950">
                      លិខិតបញ្ជាក់ការសិក្សា
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 font-times">CERTIFICATE OF ENROLLMENT</p>
                  </div>

                  <div className="space-y-3 text-justify text-slate-800 text-sm leading-loose pt-2">
                    <p className="indent-8">
                      នាយក{schoolProfile.nameKhmer} សូមបញ្ជាក់ថា៖
                    </p>

                    <div className="pl-6 space-y-2 font-medium">
                      <p>
                        សិស្សឈ្មោះ៖ <span className="font-bold text-base font-moul text-slate-950">{selectedStudent?.nameKhmer}</span> អក្សរឡាតាំង៖ <span className="font-bold uppercase font-times">{selectedStudent?.nameLatin || '—'}</span>
                      </p>
                      <p>
                        ភេទ៖ <span className="font-bold">{selectedStudent?.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</span> ថ្ងៃខែឆ្នាំកំណើត៖ <span className="font-bold">{selectedStudent?.dob}</span>
                      </p>
                      <p>
                        ទីកន្លែងកំណើត៖ <span className="font-bold">{selectedStudent?.pob || 'មិនបានបញ្ជាក់'}</span>
                      </p>
                      <p>
                        ឪពុកឈ្មោះ៖ <span className="font-bold">{selectedStudent?.fatherName || '—'}</span> ម្តាយឈ្មោះ៖ <span className="font-bold">{selectedStudent?.motherName || '—'}</span>
                      </p>
                      <p>
                        បច្ចុប្បន្នរស់នៅភូមិ៖ <span className="font-bold">{selectedStudent?.currentAddress || selectedStudent?.address || '—'}</span>
                      </p>
                    </div>

                    <p className="indent-8">
                      ពិតជាបានចុះឈ្មោះ និងកំពុងសិក្សានៅ <b>ថ្នាក់ទី{selectedStudent?.grade}{selectedStudent?.section}</b> នៃ{schoolProfile.nameKhmer} ក្នុងឆ្នាំសិក្សា <b>{selectedAcademicYear}</b> នេះពិតប្រាកដមែន។
                    </p>

                    <p className="indent-8">
                      លិខិតបញ្ជាក់នេះចេញជូនសាមីខ្លួន <b>{customFields.purpose}</b>។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 5: STUDENT TRANSFER (លិខិតផ្ទេរសិស្ស) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'transfer_letter' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base sm:text-lg text-blue-950">
                      លិខិតផ្ទេរការសិក្សាសិស្ស
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 font-times">STUDENT TRANSFER CERTIFICATE</p>
                  </div>

                  <div className="space-y-3 text-justify text-slate-800 text-sm leading-loose pt-2">
                    <p className="indent-8">
                      នាយក{schoolProfile.nameKhmer} សូមបញ្ជាក់ថា៖
                    </p>

                    <div className="pl-6 space-y-2 font-medium">
                      <p>
                        សិស្សឈ្មោះ៖ <span className="font-bold font-moul text-slate-950">{selectedStudent?.nameKhmer}</span> ភេទ៖ <span className="font-bold">{selectedStudent?.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</span>
                      </p>
                      <p>
                        ថ្ងៃខែឆ្នាំកំណើត៖ <span className="font-bold">{selectedStudent?.dob}</span> អត្តលេខសិស្ស៖ <span className="font-bold font-mono">{selectedStudent?.code}</span>
                      </p>
                      <p>
                        ជាសិស្សរៀននៅថ្នាក់ទី៖ <span className="font-bold">{selectedStudent?.grade}{selectedStudent?.section}</span> នៃ{schoolProfile.nameKhmer}។
                      </p>
                    </div>

                    <p className="indent-8">
                      ត្រូវបានអនុញ្ញាតឱ្យផ្ទេរការសិក្សាទៅកាន់សាលារៀនថ្មី ស្របតាមការស្នើសុំរបស់អាណាព្យាបាលសិស្ស ដោយសារមូលហេតុផ្លាស់ប្តូរទីលំនៅ។
                    </p>
                    <p className="indent-8">
                      សាលារៀនសូមប្រគល់សៀវភៅតាមដានការសិក្សា និងឯកសារពាក់ព័ន្ធជូនសាមីខ្លួនយកទៅចុះឈ្មោះបន្ត។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 6: COMMENDATION (លិខិតសរសើរ) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'commendation_letter' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-lg sm:text-xl text-amber-900">
                      លិខិតសរសើរ
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 uppercase font-times tracking-widest">CERTIFICATE OF COMMENDATION</p>
                  </div>

                  <div className="space-y-4 text-center text-slate-800 text-sm leading-loose pt-2">
                    <p className="text-base font-semibold">
                      នាយក{schoolProfile.nameKhmer} សូមសម្តែងនូវការកោតសរសើរចំពោះ៖
                    </p>

                    <div className="py-2">
                      <span className="font-moul text-xl text-blue-950 block">{selectedStudent?.nameKhmer}</span>
                      <span className="text-xs font-semibold text-slate-500 font-times uppercase tracking-wider">{selectedStudent?.nameLatin}</span>
                    </div>

                    <p className="max-w-xl mx-auto text-slate-700">
                      សិស្សថ្នាក់ទី <b>{selectedStudent?.grade}{selectedStudent?.section}</b> ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ មានវិន័យសីលធម៌ថ្លៃថ្នូរ និង <b>{customFields.honorReason}</b>។
                    </p>

                    <p className="text-xs text-slate-500 pt-2">
                      សូមជូនពរឱ្យទទួលបានជោគជ័យកាន់តែត្រចះត្រចង់ក្នុងការសិក្សា និងក្លាយជាកូនល្អ សិស្សល្អ មិត្តល្អ និងពលរដ្ឋល្អក្នុងសង្គម។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 7: STUDENT SCORECARD (ព្រឹត្តិបត្រពិន្ទុ) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'student_scorecard' && (
                <div className="space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base text-blue-950">
                      ព្រឹត្តិបត្រពិន្ទុ និងលទ្ធផលសិក្សាសិស្ស ({selectedMonth})
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 font-times">STUDENT ACADEMIC PERFORMANCE REPORT</p>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <p>សិស្សឈ្មោះ៖ <b className="font-moul text-blue-950">{selectedStudent?.nameKhmer}</b> [{selectedStudent?.code}]</p>
                      <p>ភេទ៖ <b>{selectedStudent?.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</b> | ថ្នាក់ទី៖ <b>{selectedStudent?.grade}{selectedStudent?.section}</b></p>
                    </div>
                    <div className="text-right">
                      <p>ចំណាត់ថ្នាក់៖ <b className="text-base text-blue-900">លេខ {selectedStudentScore?.rank || 1}</b></p>
                      <p>មធ្យមភាគ៖ <b className="text-blue-900">{selectedStudentScore?.averageScore?.toFixed(2) || '8.50'}</b>/10</p>
                    </div>
                  </div>

                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800">
                        <th className="border border-slate-300 p-2 text-center w-10">ល.រ</th>
                        <th className="border border-slate-300 p-2">មុខវិជ្ជា / សមត្ថភាពសិក្សា</th>
                        <th className="border border-slate-300 p-2 text-center w-24">ពិន្ទុទទួលបាន</th>
                        <th className="border border-slate-300 p-2 text-center w-24">និទ្ទេស</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">១</td>
                        <td className="border border-slate-300 p-2 font-semibold">ភាសាខ្មែរ (អំណាន សំណេរ ស្តាប់ និយាយ)</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{selectedStudentScore?.scores?.reading || 8.5}</td>
                        <td className="border border-slate-300 p-2 text-center text-emerald-700 font-semibold">ល្អ</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">២</td>
                        <td className="border border-slate-300 p-2 font-semibold">គណិតវិទ្យា (ចំនួន រង្វាស់រង្វាល់ ធរណីមាត្រ)</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{selectedStudentScore?.scores?.numbers || 9.0}</td>
                        <td className="border border-slate-300 p-2 text-center text-emerald-700 font-semibold">ល្អណាស់</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">៣</td>
                        <td className="border border-slate-300 p-2 font-semibold">វិទ្យាសាស្ត្រ និងសិក្សាសង្គម</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{selectedStudentScore?.scores?.science || 8.0}</td>
                        <td className="border border-slate-300 p-2 text-center text-blue-700 font-semibold">ល្អបង្គួរ</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center">៤</td>
                        <td className="border border-slate-300 p-2 font-semibold">អប់រំសិល្បៈ កាយវិការ និងកីឡា</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{selectedStudentScore?.scores?.physicalHealth || 8.5}</td>
                        <td className="border border-slate-300 p-2 text-center text-emerald-700 font-semibold">ល្អ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 8: MISSION ORDER (លិខិតបញ្ជាបេសកកម្ម) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'mission_order' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base sm:text-lg text-blue-950">
                      លិខិតបញ្ជាបេសកកម្ម
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 font-times">OFFICIAL MISSION ORDER</p>
                  </div>

                  <div className="space-y-3 text-justify text-slate-800 text-sm leading-loose pt-2">
                    <p className="indent-8">
                      នាយក{schoolProfile.nameKhmer} បញ្ជាឱ្យ៖
                    </p>

                    <div className="pl-6 space-y-2 font-medium">
                      <p>
                        លោក/លោកស្រី៖ <span className="font-bold font-moul text-slate-950">{selectedTeacher?.nameKhmer}</span>
                      </p>
                      <p>
                        តួនាទី៖ <span className="font-bold">{selectedTeacher?.position || 'គ្រូបង្រៀន'}</span> ក្របខ័ណ្ឌ/អត្តលេខ៖ <span className="font-bold font-mono">{selectedTeacher?.staffCode}</span>
                      </p>
                      <p>
                        ទីកន្លែងត្រូវទៅ៖ <span className="font-bold text-blue-900">{customFields.destination}</span>
                      </p>
                      <p>
                        រយៈពេលបេសកកម្ម៖ <span className="font-bold">{customFields.durationDays}</span>
                      </p>
                    </div>

                    <p className="indent-8">
                      ដើម្បីបំពេញបេសកកម្មការងារអប់រំ និងចូលរួមសកម្មភាពបណ្តុះបណ្តាលគរុកោសល្យ។
                    </p>
                    <p className="indent-8">
                      អាជ្ញាធរដែនដី និងស្ថាប័នពាក់ព័ន្ធមេត្តាជួយសម្របសម្រួល និងបង្កលក្ខណៈងាយស្រួលដល់សាមីខ្លួន ដើម្បីបំពេញភារកិច្ចឱ្យទទួលបានជោគជ័យ។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 9: LEAVE REQUEST (ពាក្យសុំច្បាប់) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'leave_request' && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base sm:text-lg text-blue-950">
                      ពាក្យសុំច្បាប់ឈប់សម្រាក
                    </h1>
                    <p className="text-xs font-semibold text-slate-600 font-times">STAFF LEAVE REQUEST FORM</p>
                  </div>

                  <div className="space-y-3 text-justify text-slate-800 text-sm leading-loose pt-2">
                    <p className="font-bold">
                      សូមគោរពជូន៖ លោកនាយក{schoolProfile.nameKhmer}
                    </p>

                    <p className="indent-8">
                      ខ្ញុំបាទ/នាងខ្ញុំឈ្មោះ <span className="font-bold font-moul">{selectedTeacher?.nameKhmer}</span> តួនាទីជា <span className="font-bold">{selectedTeacher?.position || 'គ្រូបង្រៀន'}</span> បង្រៀននៅ{schoolProfile.nameKhmer}។
                    </p>

                    <p className="indent-8">
                      សូមគោរពស្នើសុំច្បាប់ឈប់សម្រាកការងារចំនួន <b>{customFields.durationDays}</b> ដោយសារ <b>{customFields.reason}</b>។
                    </p>

                    <p className="indent-8">
                      អាស្រ័យហេតុនេះ សូមលោកនាយកមេត្តាពិនិត្យ និងអនុញ្ញាតដោយក្តីអនុគ្រោះ។
                    </p>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 18: CLASSROOM MANAGEMENT COMMITTEE (គ.ក.ថ.) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'class_committee_doc' && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <div>
                      <p className="font-bold text-xs text-blue-950 font-moul">ឯកសារគណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន (គ.ក.ថ.)</p>
                      <p className="text-[11px] text-blue-800 font-battambang">មានទាំងទម្រង់តារាងផ្លូវការ (Landscape) និងរចនាសម្ព័ន្ធរូបថត (Portrait Org Chart)</p>
                    </div>
                    <button
                      onClick={() => setShowCommitteeModal(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>បើកផ្ទាំងបោះពុម្ព & កែសម្រួលរូបថត</span>
                    </button>
                  </div>

                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base text-blue-950">
                      សមាសភាពគណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន ( គ.ក.ថ. )
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">ថ្នាក់ទី {selectedGrade}«{selectedSection}» ឆ្នាំសិក្សា {selectedAcademicYear}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse border border-slate-900 mt-2">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-900 text-center font-battambang">
                          <th className="border border-slate-900 p-1.5 w-8">ល.រ</th>
                          <th className="border border-slate-900 p-1.5 w-16">នាមស័ព្ទ</th>
                          <th className="border border-slate-900 p-1.5 min-w-24">នាមត្រកូល និងនាមខ្លួន</th>
                          <th className="border border-slate-900 p-1.5 w-12">ភេទ</th>
                          <th className="border border-slate-900 p-1.5">អង្គភាព/ទីកន្លែងធ្វើការ</th>
                          <th className="border border-slate-900 p-1.5">មុខរបរ</th>
                          <th className="border border-slate-900 p-1.5">តួនាទី</th>
                          <th className="border border-slate-900 p-1.5">លេខទូរស័ព្ទ</th>
                          <th className="border border-slate-900 p-1.5 w-14">ថ្នាក់ទី</th>
                          <th className="border border-slate-900 p-1.5">ស្ថានភាពជីវភាព</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { no: '១', hon: 'លោកស្រី', name: 'ហៀម ម៉ុំ', sex: 'ស្រី', work: 'ភូមិភ្នំពុំ', occ: 'កសិករ', role: 'ប្រធាន', tel: '097 538 5753', cls: `${selectedGrade}${selectedSection}`, liv: 'ជីវភាពមធ្យម' },
                          { no: '២', hon: 'លោកស្រី', name: 'មាស សុខុម', sex: 'ស្រី', work: 'ភូមិភ្នំពុំ', occ: 'កសិករ', role: 'អនុប្រធាន', tel: '097 5555 001', cls: `${selectedGrade}${selectedSection}`, liv: 'ជីវភាពមធ្យម' },
                          { no: '៣', hon: 'លោកស្រី', name: 'លៀវ សុខណា', sex: 'ស្រី', work: 'ភូមិភ្នំពុំ', occ: 'កសិករ', role: 'អនុប្រធាន', tel: '070 314 043', cls: `${selectedGrade}${selectedSection}`, liv: 'ជីវភាពមធ្យម' },
                          { no: '៤', hon: 'លោកស្រី', name: 'ផន យាន', sex: 'ស្រី', work: 'ភូមិភ្នំពុំ', occ: 'កសិករ', role: 'សមាជិក', tel: '012 889 921', cls: `${selectedGrade}${selectedSection}`, liv: 'ជីវភាពមធ្យម' },
                          { no: '៥', hon: 'លោក', name: 'ឃី ចាន់ថា', sex: 'ប្រុស', work: 'ភូមិភ្នំពុំ', occ: 'កសិករ', role: 'សមាជិក', tel: '015 298 995', cls: `${selectedGrade}${selectedSection}`, liv: 'ជីវភាពមធ្យម' },
                          { no: '៦', hon: 'លោកស្រី', name: 'លាប ឡៃ', sex: 'ស្រី', work: 'ភូមិភ្នំពុំ', occ: 'កសិករ', role: 'សមាជិក', tel: '015 445 573', cls: `${selectedGrade}${selectedSection}`, liv: 'ជីវភាពមធ្យម' },
                          { no: '៧', hon: 'កុមារ', name: 'ផៃ សំអាត', sex: 'ស្រី', work: 'ភូមិភ្នំពុំ', occ: 'សិស្ស', role: 'សមាជិក', tel: '096 272 0170', cls: `${selectedGrade}${selectedSection}`, liv: 'ជីវភាពមធ្យម' }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="border border-slate-900 p-1.5 text-center font-bold">{row.no}</td>
                            <td className="border border-slate-900 p-1.5 text-center">{row.hon}</td>
                            <td className="border border-slate-900 p-1.5 font-bold font-moul text-xs">{row.name}</td>
                            <td className="border border-slate-900 p-1.5 text-center">{row.sex}</td>
                            <td className="border border-slate-900 p-1.5 text-center">{row.work}</td>
                            <td className="border border-slate-900 p-1.5 text-center">{row.occ}</td>
                            <td className="border border-slate-900 p-1.5 text-center font-bold text-blue-950">{row.role}</td>
                            <td className="border border-slate-900 p-1.5 text-center font-times font-bold">{row.tel}</td>
                            <td className="border border-slate-900 p-1.5 text-center font-semibold">{row.cls}</td>
                            <td className="border border-slate-900 p-1.5 text-center">{row.liv}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 10: CLASS COUNCIL STRUCTURE (រចនាសម្ព័ន្ធគណៈកម្មការថ្នាក់) */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'class_council_structure' && (
                <div className="space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base text-blue-950">
                      រចនាសម្ព័ន្ធគណៈកម្មការស្វ័យគ្រប់គ្រងថ្នាក់រៀន ទី{selectedGrade} «{selectedSection}»
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">ឆ្នាំសិក្សា {selectedAcademicYear}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-center">
                    <p className="font-bold text-blue-950">គ្រូបន្ទុកថ្នាក់៖ {selectedClassroom.homeroomTeacherName}</p>
                    <p className="text-slate-500">ចំនួនសិស្សសរុប៖ {currentClassStudents.length} នាក់ (ស្រី {currentClassStudents.filter(s => s.gender === 'female').length} នាក់)</p>
                  </div>

                  <table className="w-full text-xs text-left border-collapse border border-slate-300 mt-2">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800">
                        <th className="border border-slate-300 p-2 text-center w-12">ល.រ</th>
                        <th className="border border-slate-300 p-2">តួនាទីក្នុងគណៈកម្មការ</th>
                        <th className="border border-slate-300 p-2">ឈ្មោះសិស្សទទួលខុសត្រូវ</th>
                        <th className="border border-slate-300 p-2 text-center w-16">ភេទ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center font-bold">១</td>
                        <td className="border border-slate-300 p-2 font-bold text-blue-950">ប្រធានថ្នាក់ (Class Leader)</td>
                        <td className="border border-slate-300 p-2 font-semibold">{currentClassStudents[0]?.nameKhmer || 'សុខ វិបុល'}</td>
                        <td className="border border-slate-300 p-2 text-center">ប្រុស</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center font-bold">២</td>
                        <td className="border border-slate-300 p-2 font-bold text-blue-950">អនុប្រធានថ្នាក់ទទួលបន្ទុកសិក្សា</td>
                        <td className="border border-slate-300 p-2 font-semibold">{currentClassStudents[1]?.nameKhmer || 'ចាន់ រស្មី'}</td>
                        <td className="border border-slate-300 p-2 text-center">ស្រី</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center font-bold">៣</td>
                        <td className="border border-slate-300 p-2 font-bold text-blue-950">អនុប្រធានទទួលបន្ទុកអនាម័យ & បរិស្ថាន</td>
                        <td className="border border-slate-300 p-2 font-semibold">{currentClassStudents[2]?.nameKhmer || 'ហេង ពិសិដ្ឋ'}</td>
                        <td className="border border-slate-300 p-2 text-center">ប្រុស</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 text-center font-bold">៤</td>
                        <td className="border border-slate-300 p-2 font-bold text-blue-950">ប្រធានផ្នែកវិន័យ និងសណ្តាប់ធ្នាប់</td>
                        <td className="border border-slate-300 p-2 font-semibold">{currentClassStudents[3]?.nameKhmer || 'កែវ មុន្នី'}</td>
                        <td className="border border-slate-300 p-2 text-center">ស្រី</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 11: MODEL SCHOOL REPORT TABLE */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'model_school_report' && (
                <div className="space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base text-blue-950">
                      របាយការណ៍វាយតម្លៃស្ដង់ដាសាលារៀនគំរូ (MoEYS)
                    </h1>
                    <p className="text-xs text-slate-600">ឆ្នាំសិក្សា {selectedAcademicYear}</p>
                  </div>

                  <table className="w-full text-xs text-left border-collapse border border-slate-300 mt-2">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800">
                        <th className="border border-slate-300 p-2 text-center w-12">ល.រ</th>
                        <th className="border border-slate-300 p-2">ស្ដង់ដា & សូចនាករគន្លឹះ</th>
                        <th className="border border-slate-300 p-2 text-center w-28">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelSchoolStandards.map(group => (
                        <React.Fragment key={group.standardNumber}>
                          <tr className="bg-slate-50 font-bold text-blue-900">
                            <td colSpan={3} className="border border-slate-300 p-2">
                              ស្តង់ដាទី {group.standardNumber}: {group.titleKhmer}
                            </td>
                          </tr>
                          {group.criteria.map((c, cIdx) => (
                            <tr key={c.id}>
                              <td className="border border-slate-300 p-2 text-center font-mono">{group.standardNumber}.{cIdx + 1}</td>
                              <td className="border border-slate-300 p-2">{c.title}</td>
                              <td className="border border-slate-300 p-2 text-center font-semibold">
                                {c.status === 'fully_met' && <span className="text-emerald-700">សម្រេចពេញលេញ</span>}
                                {c.status === 'partially_met' && <span className="text-amber-700">សម្រេចមធ្យម</span>}
                                {c.status === 'not_met' && <span className="text-rose-700">មិនទាន់សម្រេច</span>}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TEMPLATE 12: ASSET INVENTORY TABLE */}
              {/* ---------------------------------------------------- */}
              {selectedDoc === 'asset_inventory_report' && (
                <div className="space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <h1 className="font-moul text-base text-blue-950">
                      បញ្ជីសារពើភ័ណ្ឌ និងទ្រព្យសម្បត្តិរដ្ឋ
                    </h1>
                    <p className="text-xs text-slate-600">សរុបចំនួន {schoolAssets.length} មុខទំនិញ</p>
                  </div>

                  <table className="w-full text-xs text-left border-collapse border border-slate-300 mt-2">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800">
                        <th className="border border-slate-300 p-2 text-center">កូដ</th>
                        <th className="border border-slate-300 p-2">ឈ្មោះសម្ភារៈ/ទ្រព្យសម្បត្តិ</th>
                        <th className="border border-slate-300 p-2">ទីតាំង</th>
                        <th className="border border-slate-300 p-2 text-center">ចំនួន</th>
                        <th className="border border-slate-300 p-2">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolAssets.map(a => (
                        <tr key={a.id}>
                          <td className="border border-slate-300 p-2 font-mono font-bold text-slate-800">{a.assetCode}</td>
                          <td className="border border-slate-300 p-2 font-semibold">{a.assetNameKhmer}</td>
                          <td className="border border-slate-300 p-2">{a.locationOrRoom}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold">{a.quantity} {a.unit}</td>
                          <td className="border border-slate-300 p-2">
                            {a.condition === 'good' ? 'ល្អ' : a.condition === 'repair_needed' ? 'ជួសជុល' : 'ខូច'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* DOCUMENT FOOTER & DUAL-SIGNATURES */}
            <div className="pt-8 mt-6 relative z-10 border-t border-slate-200">
              <div className="flex justify-between items-start text-xs font-battambang">
                {/* Left Seal / Parent / Reviewer Area */}
                <div className="text-center w-72 space-y-1">
                  <p className="font-moul text-blue-700 text-xs font-bold">
                    {selectedDoc.includes('parent') ? 'ហត្ថលេខាអាណាព្យាបាលសិស្ស' : 'បានឃើញ និងឯកភាព'}
                  </p>
                  <p className="font-moul text-blue-700 text-xs font-bold">
                    {selectedDoc.includes('parent') ? '(ស្នាមមេដៃ ឬហត្ថលេខា)' : 'នាយកសាលា'}
                  </p>
                  
                  <div className="h-28 flex items-center justify-center my-1 relative">
                    {printSettings.showRoundStamp && !selectedDoc.includes('parent') ? (
                      <SchoolStampCirclePlaceholder label="ទីតាំងបោះត្រា" />
                    ) : (
                      <div className="h-20" />
                    )}
                  </div>

                  <p className="font-moul text-xs text-red-600 font-bold pt-1">
                    {selectedDoc.includes('parent')
                      ? (selectedStudent?.guardianName || selectedStudent?.fatherName || 'អាណាព្យាបាល')
                      : (schoolProfile.principalName || 'ស៊ុន ពិសិដ្ឋ')}
                  </p>
                </div>

                {/* Right Seal & Teacher / Signee Signature Area with Lunar and Solar dates */}
                <div className="text-center w-72 space-y-1 relative">
                  <p className="text-xs text-blue-900 font-medium">
                    {customFields.dateKhmer || getKhmerLunarDate()}
                  </p>
                  <p className="text-xs text-blue-900 font-medium">
                    {getKhmerSolarDate(new Date(), schoolProfile.district || schoolProfile.addressKhmer || 'ភ្នំពេញ')}
                  </p>
                  <p className="font-moul text-blue-700 text-xs font-bold mt-1">
                    {selectedDoc === 'teacher_duty_appointment' ? 'សាមីខ្លួនទទួលភារកិច្ច' : 'គ្រូបន្ទុកថ្នាក់'}
                  </p>

                  {/* Signature Space */}
                  <div className="h-28 flex items-end justify-center pb-2">
                    <span className="text-slate-300 italic text-[11px]">( ហត្ថលេខា )</span>
                  </div>

                  {printSettings.showDirectorSignature && (
                    <p className="font-moul text-xs text-blue-700 font-bold pt-1">
                      {teachers.find(t => t.id === selectedTeacherId)?.nameKhmer || 'សែម ស្រីភឿន'}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Classroom Management Committee Full Print Modal */}
      {showCommitteeModal && (
        <ClassCommitteePrintModal
          isOpen={showCommitteeModal}
          onClose={() => setShowCommitteeModal(false)}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          selectedAcademicYear={selectedAcademicYear}
          schoolProfile={schoolProfile}
          homeroomTeacher={teachers.find(t => t.id === selectedTeacherId)}
          classStudents={students.filter(s => s.grade === selectedGrade && s.section === selectedSection)}
        />
      )}

      {/* Primary Student Statistics (PRI) Full Modal */}
      {showPriModal && (
        <ClassStudentStatisticsPriModal
          isOpen={showPriModal}
          onClose={() => setShowPriModal(false)}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          academicYear={selectedAcademicYear}
          schoolProfile={schoolProfile}
          homeroomTeacher={teachers.find(t => t.id === selectedTeacherId || (t.assignedGrade === selectedGrade && t.assignedSection === selectedSection))}
          students={students}
        />
      )}

      {/* Student Health Booklet (3 Pages) Full Modal */}
      {showHealthBookletModal && (
        <StudentHealthBookletModal
          isOpen={showHealthBookletModal}
          onClose={() => setShowHealthBookletModal(false)}
          student={selectedStudent}
          schoolProfile={schoolProfile}
          academicYear={selectedAcademicYear}
          allStudents={students.filter(s => s.grade === selectedGrade && s.section === selectedSection)}
        />
      )}
    </div>
  );
};
