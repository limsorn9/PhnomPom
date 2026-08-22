import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { StudentScoreRecord, MonthlySubjectScores, Student, ExamSubject } from '../types';
import { exportScoresToGoogleSheets } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import {
  BookOpen,
  School,
  Award,
  Calendar,
  Save,
  CheckCircle2,
  Printer,
  Sparkles,
  Search,
  Filter,
  BarChart2,
  FileSpreadsheet,
  HelpCircle,
  Eye,
  EyeOff,
  X,
  RefreshCw,
  Plus,
  Settings2,
  Lock,
  Unlock,
  Layers,
  UserCheck,
  FileText,
  Download,
  MessageSquare,
  Send,
  Check,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AngkorWatSilhouette,
  KhmerKbachCorner,
  MoEYSRoyalHeader,
  SchoolOfficialStamp,
  AngkorPageWatermark
} from './AngkorMotif';

const MONTHS_LIST = [
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'ឆមាសទី១',
  'ឆមាសទី២'
];

interface SingleScoreFormState {
  khmerReading: number;
  khmerWriting: number;
  mathematics: number;
  scienceSocial: number;
  moralCivics: number;
  artsPhysical: number;
  remarks: string;
  [subjectCode: string]: number | string;
}

export const ClassroomScores: React.FC = () => {
  const {
    students,
    teachers,
    classrooms,
    scores,
    saveStudentScore,
    schoolProfile,
    showToast,
    currentUser,
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
    examSubjects,
    addExamSubject,
    isResultReleased,
    toggleReleaseClassResults,
    gradingScaleType,
    setGradingScaleType,
    getFormattedGrade,
    studentFeedbacks,
    replyStudentFeedback,
    toggleAcknowledgeFeedback,
    deleteStudentFeedback,
    language,
    t,
    isDarkMode
  } = useSchool();

  // If teacher, default to their assigned grade & section
  const initialGrade = currentUser?.role === 'teacher' && currentUser.assignedGrade ? currentUser.assignedGrade : 6;
  const initialSection = currentUser?.role === 'teacher' && currentUser.assignedSection ? currentUser.assignedSection : 'ក';

  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade);
  const [selectedSection, setSelectedSection] = useState<string>(initialSection);
  const [selectedMonth, setSelectedMonth] = useState<string>('មករា');
  const [selectedStudentForReportCard, setSelectedStudentForReportCard] = useState<Student | null>(null);
  const [selectedStudentForHonor, setSelectedStudentForHonor] = useState<StudentScoreRecord | null>(null);
  const [isExportingScores, setIsExportingScores] = useState(false);
  const [showSubjectSettingsModal, setShowSubjectSettingsModal] = useState(false);

  // Scoring Modes: 'by_student' | 'by_subject' | 'matrix' | 'feedback'
  const [scoringMode, setScoringMode] = useState<'by_student' | 'by_subject' | 'matrix' | 'feedback'>('by_student');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('reading');
  const [batchSubjectScores, setBatchSubjectScores] = useState<Record<string, number>>({});

  // Feedback State for Teacher Replying
  const [replyingFeedbackId, setReplyingFeedbackId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [feedbackMonthFilter, setFeedbackMonthFilter] = useState<string>('all');

  // New Subject Form Modal
  const [newSubjectForm, setNewSubjectForm] = useState({
    code: '',
    nameKhmer: '',
    nameLatin: '',
    category: 'khmer' as ExamSubject['category'],
    maxScore: 10,
    weight: 1
  });

  // Filter students in current class
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection && s.status !== 'transferred'
  );

  // Find Homeroom Teacher
  const homeroomTeacher = teachers.find(
    t => t.assignedGrade === selectedGrade && t.assignedSection === selectedSection
  );

  // Score state for active class and month & academic year
  const activeScores = scores.filter(
    s =>
      s.grade === selectedGrade &&
      s.section === selectedSection &&
      s.monthOrSemester === selectedMonth &&
      (!s.academicYear || s.academicYear === selectedAcademicYear)
  );

  // Filter parent/student feedbacks for current grade, section, academic year & month
  const classStudentIds = new Set(classStudents.map(s => s.id));
  const currentClassFeedbacks = studentFeedbacks.filter(f => {
    const isStudentInClass = classStudentIds.has(f.studentId) || (f.grade === selectedGrade && (!f.section || f.section === selectedSection));
    const isYearMatch = !f.academicYear || f.academicYear === selectedAcademicYear;
    const isMonthMatch = feedbackMonthFilter === 'all' || f.month === feedbackMonthFilter;
    return isStudentInClass && isYearMatch && isMonthMatch;
  });

  // Single edit modal state
  const [activeStudentForScoreEdit, setActiveStudentForScoreEdit] = useState<Student | null>(null);
  const [singleScoreForm, setSingleScoreForm] = useState<SingleScoreFormState>({
    khmerReading: 8.5,
    khmerWriting: 8.0,
    mathematics: 8.5,
    scienceSocial: 8.5,
    moralCivics: 9.0,
    artsPhysical: 9.0,
    remarks: ''
  });

  const getStudentScore = (studentId: string): StudentScoreRecord | undefined => {
    return activeScores.find(s => s.studentId === studentId);
  };

  const handleOpenScoreEdit = (student: Student) => {
    const existing = getStudentScore(student.id);
    setActiveStudentForScoreEdit(student);
    if (existing) {
      setSingleScoreForm({
        ...existing.scores,
        remarks: existing.remarks || ''
      });
    } else {
      // populate defaults from active examSubjects
      const initialVals: SingleScoreFormState = {
        khmerReading: 8.0,
        khmerWriting: 8.0,
        mathematics: 8.0,
        scienceSocial: 8.0,
        moralCivics: 8.5,
        artsPhysical: 8.5,
        remarks: 'ការសិក្សាល្អ'
      };
      examSubjects.forEach(sub => {
        if (!(sub.code in initialVals)) {
          initialVals[sub.code] = 8.0;
        }
      });
      setSingleScoreForm(initialVals);
    }
  };

  const handleSaveSingleScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentForScoreEdit) return;

    // clean and prepare scores object
    const numericScores: MonthlySubjectScores = {
      khmerReading: Number(singleScoreForm.khmerReading || 0),
      khmerWriting: Number(singleScoreForm.khmerWriting || 0),
      mathematics: Number(singleScoreForm.mathematics || 0),
      scienceSocial: Number(singleScoreForm.scienceSocial || 0),
      moralCivics: Number(singleScoreForm.moralCivics || 0),
      artsPhysical: Number(singleScoreForm.artsPhysical || 0),
    };

    // Include all dynamic subjects
    examSubjects.forEach(sub => {
      if (singleScoreForm[sub.code] !== undefined) {
        numericScores[sub.code] = Number(singleScoreForm[sub.code]);
      }
    });

    saveStudentScore({
      studentId: activeStudentForScoreEdit.id,
      monthOrSemester: selectedMonth,
      academicYear: selectedAcademicYear,
      scores: numericScores,
      remarks: singleScoreForm.remarks
    });

    setActiveStudentForScoreEdit(null);
  };

  const handleCreateNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectForm.nameKhmer || !newSubjectForm.code) {
      showToast('សូមបំពេញព័ត៌មានមុខវិជ្ជាឱ្យបានគ្រប់គ្រាន់', 'error');
      return;
    }

    addExamSubject({
      code: newSubjectForm.code.trim().toLowerCase().replace(/\s+/g, '_'),
      nameKhmer: newSubjectForm.nameKhmer.trim(),
      nameLatin: newSubjectForm.nameLatin.trim() || newSubjectForm.nameKhmer.trim(),
      category: newSubjectForm.category,
      maxScore: Number(newSubjectForm.maxScore) || 10,
      weight: Number(newSubjectForm.weight) || 1,
      isDefault: false
    });

    setNewSubjectForm({
      code: '',
      nameKhmer: '',
      nameLatin: '',
      category: 'khmer',
      maxScore: 10,
      weight: 1
    });
    setShowSubjectSettingsModal(false);
  };

  // Synchronize batchSubjectScores whenever selectedSubjectCode, class, month or scores change
  useEffect(() => {
    const initialBatch: Record<string, number> = {};
    classStudents.forEach(stu => {
      const existing = getStudentScore(stu.id);
      if (existing && existing.scores[selectedSubjectCode] !== undefined) {
        initialBatch[stu.id] = Number(existing.scores[selectedSubjectCode]);
      } else if (existing) {
        if (selectedSubjectCode === 'reading' || selectedSubjectCode === 'khmerReading') initialBatch[stu.id] = existing.scores.khmerReading ?? 8.0;
        else if (selectedSubjectCode === 'writing' || selectedSubjectCode === 'khmerWriting') initialBatch[stu.id] = existing.scores.khmerWriting ?? 8.0;
        else if (selectedSubjectCode === 'numbers' || selectedSubjectCode === 'mathematics') initialBatch[stu.id] = existing.scores.mathematics ?? 8.0;
        else if (selectedSubjectCode === 'science' || selectedSubjectCode === 'socialStudies' || selectedSubjectCode === 'scienceSocial') initialBatch[stu.id] = existing.scores.scienceSocial ?? 8.0;
        else if (selectedSubjectCode === 'moralCivics') initialBatch[stu.id] = existing.scores.moralCivics ?? 8.5;
        else if (selectedSubjectCode === 'homeEconomicsArts' || selectedSubjectCode === 'physicalHealth' || selectedSubjectCode === 'artsPhysical') initialBatch[stu.id] = existing.scores.artsPhysical ?? 8.5;
        else initialBatch[stu.id] = 8.0;
      } else {
        initialBatch[stu.id] = 8.0;
      }
    });
    setBatchSubjectScores(initialBatch);
  }, [selectedSubjectCode, selectedGrade, selectedSection, selectedMonth, selectedAcademicYear, scores]);

  const handleSaveBatchSubjectScores = () => {
    let savedCount = 0;
    classStudents.forEach(stu => {
      const existing = getStudentScore(stu.id);
      const studentScoreVal = Number(batchSubjectScores[stu.id] ?? 8.0);
      
      const currentScores: MonthlySubjectScores = existing ? { ...existing.scores } : {
        khmerReading: 8.0,
        khmerWriting: 8.0,
        mathematics: 8.0,
        scienceSocial: 8.0,
        moralCivics: 8.5,
        artsPhysical: 8.5,
      };

      currentScores[selectedSubjectCode] = studentScoreVal;
      if (selectedSubjectCode === 'reading' || selectedSubjectCode === 'khmerReading') currentScores.khmerReading = studentScoreVal;
      if (selectedSubjectCode === 'writing' || selectedSubjectCode === 'khmerWriting') currentScores.khmerWriting = studentScoreVal;
      if (selectedSubjectCode === 'numbers' || selectedSubjectCode === 'mathematics') currentScores.mathematics = studentScoreVal;
      if (selectedSubjectCode === 'science' || selectedSubjectCode === 'socialStudies' || selectedSubjectCode === 'scienceSocial') currentScores.scienceSocial = studentScoreVal;
      if (selectedSubjectCode === 'moralCivics') currentScores.moralCivics = studentScoreVal;
      if (selectedSubjectCode === 'homeEconomicsArts' || selectedSubjectCode === 'physicalHealth' || selectedSubjectCode === 'artsPhysical') currentScores.artsPhysical = studentScoreVal;

      saveStudentScore({
        studentId: stu.id,
        monthOrSemester: selectedMonth,
        academicYear: selectedAcademicYear,
        scores: currentScores,
        remarks: existing?.remarks || 'ការសិក្សាល្អ'
      });
      savedCount++;
    });

    const activeSub = examSubjects.find(s => s.code === selectedSubjectCode);
    showToast(`បានរក្សាទុកពិន្ទុមុខវិជ្ជា «${activeSub?.nameKhmer || selectedSubjectCode}» សម្រាប់សិស្ស ${savedCount} នាក់ជោគជ័យ!`);
  };

  const triggerCelebrateConfetti = (record: StudentScoreRecord) => {
    setSelectedStudentForHonor(record);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const isClassReleased = isResultReleased(selectedGrade, selectedSection, selectedMonth, selectedAcademicYear);

  const handleExportScoresToSheets = async () => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        } else {
          return;
        }
      } catch (err: any) {
        showToast(err.message || 'សូមភ្ជាប់គណនី Google ដើម្បីនាំចេញ', 'error');
        return;
      }
    }

    if (!token) return;

    setIsExportingScores(true);
    try {
      const matchedScores = scores.filter(
        s => s.grade === selectedGrade && s.section === selectedSection && s.monthOrSemester === selectedMonth
      );
      const res = await exportScoresToGoogleSheets(schoolProfile, selectedGrade, selectedSection, selectedMonth, matchedScores);
      showToast(`បានបង្កើត Google Sheet «${res.title}» ដោយជោគជ័យ!`);
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការនាំចេញតារាងពិន្ទុ', 'error');
    } finally {
      setIsExportingScores(false);
    }
  };

  return (
    <div className="space-y-6 font-kantumruy">
      {/* Grade and Class Header Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-moul">
                លទ្ធផលពិន្ទុ និងការសិក្សា
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                ថ្នាក់ទី {selectedGrade}{selectedSection}
              </span>
              <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                ឆ្នាំសិក្សា {selectedAcademicYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              បញ្ចូលពិន្ទុ គណនាមធ្យមភាគ ចំណាត់ថ្នាក់ និងនិទ្ទេសស្វ័យប្រវត្តិតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា
            </p>
          </div>

          {/* Quick Classroom & Academic Year Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Academic Year Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                {academicYears.map(yr => (
                  <option key={yr} value={yr}>ឆ្នាំ {yr}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {[1, 2, 3, 4, 5, 6].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedGrade === g
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ថ្នាក់ទី {g}
                </button>
              ))}
            </div>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:bg-white"
            >
              <option value="ក">បន្ទប់ ក</option>
              <option value="ខ">បន្ទប់ ខ</option>
              <option value="គ">បន្ទប់ គ</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-amber-50 border border-amber-200 rounded-xl text-amber-900 focus:bg-white"
            >
              {MONTHS_LIST.map(m => (
                <option key={m} value={m}>
                  ប្រចាំខែ {m}
                </option>
              ))}
            </select>

            {/* Subject Customizer Button */}
            <button
              onClick={() => setShowSubjectSettingsModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>មុខវិជ្ជា ({examSubjects.length})</span>
            </button>
          </div>
        </div>

        {/* Class Details Bar & Release Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">គ្រូបន្ទុកថ្នាក់:</span>
            <span className="font-bold text-slate-900">
              {homeroomTeacher?.nameKhmer || 'មិនទាន់ចាត់តាំង'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">ចំនួនសិស្សក្នុងថ្នាក់:</span>
            <span className="font-bold text-slate-900">
              {classStudents.length} នាក់ (ស្រី {classStudents.filter(s => s.gender === 'F').length})
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">អត្រាបានបញ្ចូលពិន្ទុ:</span>
            <span className="font-bold text-emerald-700">
              {activeScores.length} / {classStudents.length} សិស្ស
            </span>
          </div>

          {/* Release Results to Students Button */}
          <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
            isClassReleased ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-1.5">
              {isClassReleased ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
              <span className="font-bold">{isClassReleased ? 'បានផ្សាយទៅសិស្ស' : 'លទ្ធផលចាក់សោ'}</span>
            </div>
            {(currentUser?.role === 'teacher' || currentUser?.role === 'director' || currentUser?.role === 'secretary') && (
              <button
                onClick={() => toggleReleaseClassResults(selectedGrade, selectedSection, selectedMonth, selectedAcademicYear)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-sm transition-colors ${
                  isClassReleased
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {isClassReleased ? 'បិទការផ្សាយ' : 'ផ្សព្វផ្សាយ'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scoring Mode & Grading Scale Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setScoringMode('by_student')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scoringMode === 'by_student'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>បញ្ចូលតាមសិស្សម្នាក់ៗ (By Student)</span>
          </button>

          <button
            onClick={() => setScoringMode('by_subject')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scoringMode === 'by_subject'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>បញ្ចូលតាមមុខវិជ្ជា (By Subject)</span>
          </button>

          <button
            onClick={() => setScoringMode('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scoringMode === 'matrix'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>តារាងរួម (Full Matrix)</span>
          </button>

          <button
            onClick={() => setScoringMode('feedback')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scoringMode === 'feedback'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>មតិយោបល់អាណាព្យាបាល ({currentClassFeedbacks.length})</span>
          </button>
        </div>

        {/* Grading Scale & Google Sheets Action */}
        <div className="flex items-center gap-2">
          {/* Grading Scale Switch (MoEYS Khmer Terms vs Letter Grades) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-2">ប្រព័ន្ធនិទ្ទេស:</span>
            <button
              onClick={() => setGradingScaleType('khmer_term')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                gradingScaleType === 'khmer_term'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ខ្មែរ (ល្អណាស់, ល្អ...)
            </button>
            <button
              onClick={() => setGradingScaleType('letter')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                gradingScaleType === 'letter'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              អក្សរ (A, B, C...)
            </button>
          </div>

          <button
            id="export-scores-sheets-btn"
            onClick={handleExportScoresToSheets}
            disabled={isExportingScores}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {isExportingScores ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isExportingScores ? 'កំពុងនាំចេញ...' : 'នាំចេញទៅ Google Sheet'}</span>
          </button>

          <button
            id="print-scores-table-btn"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold rounded-xl shadow-sm transition-colors"
            title="បោះពុម្ពតារាងស្រង់ពិន្ទុប្រចាំខែ"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>បោះពុម្ពតារាងពិន្ទុ</span>
          </button>
        </div>
      </div>

      {/* MODE 2: BY SUBJECT ENTRY SHEET */}
      {scoringMode === 'by_subject' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 font-moul">
                  បញ្ចូលពិន្ទុតាមមុខវិជ្ជា: {examSubjects.find(s => s.code === selectedSubjectCode)?.nameKhmer || 'មុខវិជ្ជា'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ជ្រើសរើសមុខវិជ្ជាខាងក្រោម រួចបញ្ចូលពិន្ទុសិស្សទាំងអស់ក្នុងថ្នាក់យ៉ាងរហ័ស (ពិន្ទុអតិបរមា: {examSubjects.find(s => s.code === selectedSubjectCode)?.maxScore || 10})
              </p>
            </div>

            <button
              onClick={handleSaveBatchSubjectScores}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>រក្សាទុកពិន្ទុមុខវិជ្ជានេះ ({classStudents.length} នាក់)</span>
            </button>
          </div>

          {/* Subject Selection Tabs / Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {examSubjects.map(sub => (
              <button
                key={sub.id || sub.code}
                onClick={() => setSelectedSubjectCode(sub.code)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedSubjectCode === sub.code
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div>{sub.nameKhmer}</div>
                <div className="text-[10px] opacity-75 font-normal">/{sub.maxScore} ពិន្ទុ</div>
              </button>
            ))}
          </div>

          {/* Batch Entry Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-indigo-50/70 text-[11px] font-bold text-indigo-950 border-b border-indigo-100 text-center">
                  <th className="py-3 px-3 w-12 text-center">ល.រ</th>
                  <th className="py-3 px-3 text-left">អត្តលេខ</th>
                  <th className="py-3 px-4 text-left">ឈ្មោះសិស្ស</th>
                  <th className="py-3 px-3">ភេទ</th>
                  <th className="py-3 px-4 text-center bg-indigo-100/70">ពិន្ទុ ({examSubjects.find(s => s.code === selectedSubjectCode)?.nameKhmer}) /10</th>
                  <th className="py-3 px-4 text-center">ជម្រើសពិន្ទុរហ័ស</th>
                  <th className="py-3 px-3 text-center">មធ្យមភាគសរុបបច្ចុប្បន្ន</th>
                  <th className="py-3 px-3 text-center">និទ្ទេសបច្ចុប្បន្ន</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {classStudents.map((student, idx) => {
                  const scoreRec = getStudentScore(student.id);
                  const currentScore = batchSubjectScores[student.id] ?? 8.0;
                  return (
                    <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-600">{idx + 1}</td>
                      <td className="py-3 px-3 text-left font-mono text-slate-500">{student.code}</td>
                      <td className="py-3 px-4 text-left font-bold text-slate-900">{student.nameKhmer}</td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          student.gender === 'F' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 bg-indigo-50/30">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max={examSubjects.find(s => s.code === selectedSubjectCode)?.maxScore || 10}
                          value={currentScore}
                          onChange={(e) => setBatchSubjectScores({
                            ...batchSubjectScores,
                            [student.id]: Number(e.target.value)
                          })}
                          className="w-24 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white border-2 border-indigo-300 focus:border-indigo-600 rounded-lg shadow-xs focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {[10, 9, 8.5, 8, 7.5, 7, 6].map(scoreVal => (
                            <button
                              key={scoreVal}
                              type="button"
                              onClick={() => setBatchSubjectScores({
                                ...batchSubjectScores,
                                [student.id]: scoreVal
                              })}
                              className={`px-1.5 py-1 text-[10px] font-bold rounded transition-colors ${
                                currentScore === scoreVal
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {scoreVal}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {scoreRec ? scoreRec.averageScore : '-'}
                      </td>
                      <td className="py-3 px-3">
                        {scoreRec ? (
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            scoreRec.gradeLetter === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : scoreRec.gradeLetter === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : scoreRec.gradeLetter === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {getFormattedGrade(scoreRec.averageScore, scoreRec.gradeLetter)}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 1 & 3: BY STUDENT / FULL MATRIX SCORE SHEET */}
      {(scoringMode === 'by_student' || scoringMode === 'matrix') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-kantumruy">
                តារាងស្រង់ពិន្ទុប្រចាំខែ {selectedMonth} - ថ្នាក់ទី {selectedGrade}{selectedSection} ({selectedAcademicYear})
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>ប្រព័ន្ធនិទ្ទេសសកម្ម: <strong>{gradingScaleType === 'khmer_term' ? 'ខ្មែរ (ល្អណាស់, ល្អ, ល្អបង្គួរ...)' : 'អក្សរ (A, B, C, D, E)'}</strong></span>
            </div>
          </div>

          {/* Official Ministry Heading shown only on Print */}
          <div className="hidden print:block p-6 mb-4 border-b border-slate-300">
            <div className="flex justify-between items-start text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                <p className="text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                <p className="font-bold text-blue-950 font-moul text-sm">{schoolProfile.nameKhmer}</p>
                <p className="text-[10px] text-slate-500 font-mono">កូដសាលា: {schoolProfile.schoolCode}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-xs text-slate-900 font-moul">ស្តង់ដារសាលាបឋមសិក្សាគំរូ</p>
                <p className="text-xs text-slate-700">ឆ្នាំសិក្សា៖ <span className="font-bold">{selectedAcademicYear}</span></p>
                <p className="text-[10px] text-slate-500">កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}</p>
              </div>
            </div>
            <div className="text-center mt-4">
              <h2 className="font-moul text-base text-slate-950">
                តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ {selectedMonth}
              </h2>
              <p className="text-xs text-slate-700 mt-1">
                ថ្នាក់ទី <strong>{selectedGrade}{selectedSection}</strong> • គ្រូបន្ទុកថ្នាក់៖ <strong>{homeroomTeacher?.nameKhmer || 'មិនទាន់ចាត់តាំង'}</strong> • ចំនួនសិស្ស៖ <strong>{classStudents.length}</strong> នាក់
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200 text-center">
                  <th className="py-3 px-2 w-12 text-center">ល.រ</th>
                  <th className="py-3 px-3 text-left">ឈ្មោះសិស្ស</th>
                  <th className="py-3 px-2">ភេទ</th>
                  <th className="py-3 px-2 bg-blue-50/50">ខ្មែរ (អំណាន)</th>
                  <th className="py-3 px-2 bg-blue-50/50">ខ្មែរ (សំណេរ)</th>
                  <th className="py-3 px-2 bg-indigo-50/50">គណិតវិទ្យា</th>
                  <th className="py-3 px-2 bg-amber-50/50">វិទ្យាសាស្ត្រ-សង្គម</th>
                  <th className="py-3 px-2 bg-emerald-50/50">សីលធម៌-ពលរដ្ឋ</th>
                  <th className="py-3 px-2 bg-purple-50/50">សិល្បៈ-កាយវិការ</th>
                  {scoringMode === 'matrix' && examSubjects.filter(sub => !['khmerReading', 'khmerWriting', 'mathematics', 'scienceSocial', 'moralCivics', 'artsPhysical'].includes(sub.code)).map(sub => (
                    <th key={sub.id || sub.code} className="py-3 px-2 bg-slate-200/50">
                      {sub.nameKhmer}
                    </th>
                  ))}
                  <th className="py-3 px-2 font-bold bg-slate-200/70">សរុប</th>
                  <th className="py-3 px-2 font-bold bg-blue-100">មធ្យមភាគ</th>
                  <th className="py-3 px-2 font-bold bg-amber-100">ចំណាត់ថ្នាក់</th>
                  <th className="py-3 px-2 font-bold bg-slate-100">និទ្ទេស</th>
                  <th className="py-3 px-3">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {classStudents.length > 0 ? (
                  classStudents.map((student, idx) => {
                    const scoreRec = getStudentScore(student.id);
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="py-3 px-2 font-semibold text-slate-600">{idx + 1}</td>
                        <td className="py-3 px-3 text-left">
                          <div className="font-bold text-slate-900">{student.nameKhmer}</div>
                          <div className="text-[10px] text-slate-500">{student.code}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              student.gender === 'F'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>

                        {/* Subject Scores */}
                        <td className="py-3 px-2 font-mono">
                          {scoreRec ? scoreRec.scores.khmerReading : '-'}
                        </td>
                        <td className="py-3 px-2 font-mono">
                          {scoreRec ? scoreRec.scores.khmerWriting : '-'}
                        </td>
                        <td className="py-3 px-2 font-mono font-semibold text-indigo-700">
                          {scoreRec ? scoreRec.scores.mathematics : '-'}
                        </td>
                        <td className="py-3 px-2 font-mono">
                          {scoreRec ? scoreRec.scores.scienceSocial : '-'}
                        </td>
                        <td className="py-3 px-2 font-mono">
                          {scoreRec ? scoreRec.scores.moralCivics : '-'}
                        </td>
                        <td className="py-3 px-2 font-mono">
                          {scoreRec ? scoreRec.scores.artsPhysical : '-'}
                        </td>

                        {/* Dynamic Matrix columns if in full matrix mode */}
                        {scoringMode === 'matrix' && examSubjects.filter(sub => !['khmerReading', 'khmerWriting', 'mathematics', 'scienceSocial', 'moralCivics', 'artsPhysical'].includes(sub.code)).map(sub => (
                          <td key={sub.id || sub.code} className="py-3 px-2 font-mono">
                            {scoreRec && scoreRec.scores[sub.code] !== undefined ? scoreRec.scores[sub.code] : '-'}
                          </td>
                        ))}

                        {/* Total & Average */}
                        <td className="py-3 px-2 font-mono font-bold text-slate-900 bg-slate-50">
                          {scoreRec ? scoreRec.totalScore : '-'}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-blue-700 bg-blue-50/50">
                          {scoreRec ? scoreRec.averageScore : '-'}
                        </td>
                        <td className="py-3 px-2">
                          {scoreRec ? (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                scoreRec.rank === 1
                                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                                  : scoreRec.rank === 2
                                  ? 'bg-slate-300 text-slate-800'
                                  : scoreRec.rank === 3
                                  ? 'bg-amber-700 text-amber-100'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {scoreRec.rank}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {scoreRec ? (
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                scoreRec.gradeLetter === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : scoreRec.gradeLetter === 'B'
                                  ? 'bg-blue-100 text-blue-800'
                                  : scoreRec.gradeLetter === 'C'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {getFormattedGrade(scoreRec.averageScore, scoreRec.gradeLetter)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`edit-score-${student.id}`}
                              onClick={() => handleOpenScoreEdit(student)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1 text-xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {scoreRec ? 'កែពិន្ទុ' : 'បញ្ចូល'}
                            </button>

                            <button
                              id={`report-card-${student.id}`}
                              onClick={() => setSelectedStudentForReportCard(student)}
                              title="ព្រឹត្តិបត្រពិន្ទុ & សៀវភៅតាមដានការសិក្សា"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {scoreRec && (
                              <button
                                id={`honor-cert-${student.id}`}
                                onClick={() => triggerCelebrateConfetti(scoreRec)}
                                title="ប័ណ្ណសរសើរ & កិត្តិយស"
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-slate-500">
                      មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់ទី {selectedGrade}{selectedSection} ទេ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Official Signatures on Print */}
          <div className="hidden print:flex justify-between items-end mt-8 text-xs text-slate-800 p-6 pt-2">
            <div className="text-center">
              <p>បានឃើញ និងយល់ព្រម</p>
              <strong className="block mt-1 font-moul text-slate-900">នាយិកាសាលា</strong>
              <div className="h-16" />
              <p className="font-bold">{schoolProfile.principalName}</p>
            </div>

            <div className="text-center">
              <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ២០២៤</p>
              <strong className="block mt-1 font-moul text-slate-900">គ្រូបន្ទុកថ្នាក់</strong>
              <div className="h-16" />
              <p className="font-bold">{homeroomTeacher?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: PARENT & STUDENT MONTHLY FEEDBACK REVIEW */}
      {scoringMode === 'feedback' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-moul">
                    មតិផ្តាំផ្ញើ និងការវាយតម្លៃពីអាណាព្យាបាលប្រចាំខែ
                  </h3>
                  <p className="text-xs text-slate-500">
                    ថ្នាក់ទី {selectedGrade}{selectedSection} • ឆ្នាំសិក្សា {selectedAcademicYear}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold text-slate-600">តម្រងតាមខែ:</span>
                <select
                  value={feedbackMonthFilter}
                  onChange={e => setFeedbackMonthFilter(e.target.value)}
                  className="bg-transparent font-bold text-purple-900 focus:outline-none cursor-pointer"
                >
                  <option value="all">គ្រប់ខែទាំងអស់</option>
                  {MONTHS_LIST.map(m => (
                    <option key={m} value={m}>ខែ {m}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>បោះពុម្ពបញ្ជីមតិ</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
              <span className="text-purple-800 font-medium">មតិយោបល់សរុប:</span>
              <span className="font-bold text-purple-950 text-sm">{currentClassFeedbacks.length} មតិ</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
              <span className="text-emerald-800 font-medium">បានឆ្លើយតប / ពិនិត្យ:</span>
              <span className="font-bold text-emerald-950 text-sm">
                {currentClassFeedbacks.filter(f => f.teacherReply || f.isAcknowledged).length} មតិ
              </span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
              <span className="text-amber-800 font-medium">រង់ចាំឆ្លើយតប:</span>
              <span className="font-bold text-amber-950 text-sm">
                {currentClassFeedbacks.filter(f => !f.teacherReply).length} មតិ
              </span>
            </div>
          </div>

          {/* Feedback Items List */}
          {currentClassFeedbacks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold text-slate-600">
                មិនទាន់មានមតិយោបល់ពីអាណាព្យាបាលសម្រាប់ថ្នាក់ទី {selectedGrade}{selectedSection} នៅក្នុងតម្រងនេះនៅឡើយទេ។
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                អាណាព្យាបាល ឬសិស្សអាចចូលទៅកាន់ "ច្រកចូលសិស្ស & អាណាព្យាបាល (Student Portal)" ដើម្បីផ្ញើមតិប្រចាំខែ។
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentClassFeedbacks.map((fb, idx) => (
                <div
                  key={fb.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    fb.teacherReply
                      ? 'bg-white border-emerald-200/90 shadow-2xs'
                      : 'bg-white border-purple-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[11px]">
                        {idx + 1}
                      </span>
                      <strong className="text-slate-900 font-bold text-sm">{fb.studentNameKhmer}</strong>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded-md text-[11px]">
                        ខែ {fb.month}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 text-[11px]">
                        អ្នកផ្ញើ៖ <strong className="text-slate-800">{fb.authorName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-times">{fb.createdAt}</span>
                      <button
                        onClick={() => toggleAcknowledgeFeedback(fb.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          fb.isAcknowledged
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title="សម្គាល់ថាបានពិនិត្យរួចរាល់"
                      >
                        <Check className="w-3 h-3" />
                        <span>{fb.isAcknowledged ? 'បានពិនិត្យ' : 'មិនទាន់ពិនិត្យ'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('តើអ្នកពិតជាចង់លុបមតិយោបល់នេះមែនទេ?')) {
                            deleteStudentFeedback(fb.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="លុបមតិយោបល់"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Parent Comment Body */}
                  <div className="py-3 text-xs text-slate-800 leading-relaxed font-battambang">
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{fb.comment}"
                    </p>
                  </div>

                  {/* Teacher Reply Section */}
                  {fb.teacherReply ? (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-emerald-950 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ការឆ្លើយតបពីលោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់ ({homeroomTeacher?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'})៖</span>
                        </span>
                        <button
                          onClick={() => {
                            setReplyingFeedbackId(fb.id);
                            setReplyText(fb.teacherReply || '');
                          }}
                          className="text-[10px] text-emerald-700 hover:underline font-semibold"
                        >
                          កែសម្រួលការឆ្លើយតប
                        </button>
                      </div>
                      <p className="text-emerald-900 leading-relaxed font-battambang">
                        {fb.teacherReply}
                      </p>
                      {fb.teacherRepliedAt && (
                        <span className="block text-[10px] text-emerald-700 font-times">
                          កាលបរិច្ឆេទឆ្លើយតប៖ {fb.teacherRepliedAt}
                        </span>
                      )}
                    </div>
                  ) : replyingFeedbackId === fb.id ? (
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-2 text-xs">
                      <label className="block font-bold text-purple-950">
                        សរសេរការឆ្លើយតប និងការលើកទឹកចិត្តជូនអាណាព្យាបាល / សិស្ស៖
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="ឧ. លោកគ្រូបានទទួលការផ្តាំផ្ញើ និងកត់សម្គាល់ឃើញថាប្អូនមានការរីកចម្រើនខ្លាំងលើការអាន និងគណិតវិទ្យា..."
                        className="w-full p-2.5 bg-white border border-purple-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingFeedbackId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                        >
                          បោះបង់
                        </button>
                        <button
                          onClick={() => {
                            if (!replyText.trim()) return;
                            replyStudentFeedback(fb.id, replyText.trim());
                            setReplyingFeedbackId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>រក្សាទុក & ឆ្លើយតប</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setReplyingFeedbackId(fb.id);
                          setReplyText('');
                        }}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>ឆ្លើយតបជូនអាណាព្យាបាល</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Official Signatures on Print for Feedback Report */}
          <div className="hidden print:flex justify-between items-end mt-8 text-xs text-slate-800 p-6 pt-2">
            <div className="text-center">
              <p>បានឃើញ និងយល់ព្រម</p>
              <strong className="block mt-1 font-moul text-slate-900">នាយិកាសាលា</strong>
              <div className="h-16" />
              <p className="font-bold">{schoolProfile.principalName}</p>
            </div>

            <div className="text-center">
              <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ២០២៤</p>
              <strong className="block mt-1 font-moul text-slate-900">គ្រូបន្ទុកថ្នាក់</strong>
              <div className="h-16" />
              <p className="font-bold">{homeroomTeacher?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subject Configuration Modal */}
      {showSubjectSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-700 p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                <h3 className="text-base font-bold font-moul">
                  គ្រប់គ្រងមុខវិជ្ជា និងសមត្ថភាព MoEYS
                </h3>
              </div>
              <button
                onClick={() => setShowSubjectSettingsModal(false)}
                className="p-1.5 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Add New Subject Section */}
              <form onSubmit={handleCreateNewSubject} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Plus className="w-4 h-4 text-blue-600" />
                  បន្ថែមមុខវិជ្ជា ឬសមត្ថភាពថ្មី
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ឈ្មោះមុខវិជ្ជា (ភាសាខ្មែរ)*</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. បច្ចេកវិទ្យា ICT"
                      value={newSubjectForm.nameKhmer}
                      onChange={(e) => setNewSubjectForm({ ...newSubjectForm, nameKhmer: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">កូដសម្គាល់ (Code)*</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. ict_skills"
                      value={newSubjectForm.code}
                      onChange={(e) => setNewSubjectForm({ ...newSubjectForm, code: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ក្រុមមុខវិជ្ជា</label>
                    <select
                      value={newSubjectForm.category}
                      onChange={(e) => setNewSubjectForm({ ...newSubjectForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="khmer">ភាសាខ្មែរ (Khmer Language)</option>
                      <option value="math">គណិតវិទ្យា (Mathematics)</option>
                      <option value="science_social">វិទ្យាសាស្ត្រ និងសង្គម</option>
                      <option value="arts_pe">សិល្បៈ អប់រំកាយ និងកីឡា</option>
                      <option value="skills_language">បំណិនជីវិត & ភាសាបរទេស</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ពិន្ទុអតិបរមា / មេគុណ</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newSubjectForm.maxScore}
                        onChange={(e) => setNewSubjectForm({ ...newSubjectForm, maxScore: Number(e.target.value) })}
                        className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg"
                        placeholder="Max (10)"
                      />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newSubjectForm.weight}
                        onChange={(e) => setNewSubjectForm({ ...newSubjectForm, weight: Number(e.target.value) })}
                        className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg"
                        placeholder="Weight (1)"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    បន្ថែមមុខវិជ្ជា
                  </button>
                </div>
              </form>

              {/* Existing Subject List */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">បញ្ជីមុខវិជ្ជាទាំងអស់ ({examSubjects.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {examSubjects.map((sub) => (
                    <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{sub.nameKhmer}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{sub.code} • Max {sub.maxScore} pts</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.isDefault ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sub.isDefault ? 'MoEYS គោល' : 'បន្ថែមថ្មី'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Edit Modal */}
      {activeStudentForScoreEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold font-moul">
                  បញ្ចូលពិន្ទុ: {activeStudentForScoreEdit.nameKhmer}
                </h3>
                <p className="text-xs text-blue-100">
                  ថ្នាក់ទី {selectedGrade}{selectedSection} • ប្រចាំខែ {selectedMonth} ({selectedAcademicYear})
                </p>
              </div>
              <button
                onClick={() => setActiveStudentForScoreEdit(null)}
                className="p-1.5 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleScore} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ភាសាខ្មែរ (អំណាន) /10
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    value={singleScoreForm.khmerReading || 0}
                    onChange={(e) =>
                      setSingleScoreForm({ ...singleScoreForm, khmerReading: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ភាសាខ្មែរ (សំណេរ) /10
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    value={singleScoreForm.khmerWriting || 0}
                    onChange={(e) =>
                      setSingleScoreForm({ ...singleScoreForm, khmerWriting: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    គណិតវិទ្យា /10
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    value={singleScoreForm.mathematics || 0}
                    onChange={(e) =>
                      setSingleScoreForm({ ...singleScoreForm, mathematics: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    វិទ្យាសាស្ត្រ និងសង្គម /10
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    value={singleScoreForm.scienceSocial || 0}
                    onChange={(e) =>
                      setSingleScoreForm({ ...singleScoreForm, scienceSocial: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    សីលធម៌ និងពលរដ្ឋ /10
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    value={singleScoreForm.moralCivics || 0}
                    onChange={(e) =>
                      setSingleScoreForm({ ...singleScoreForm, moralCivics: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    សិល្បៈ និងកាយវិការ /10
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    value={singleScoreForm.artsPhysical || 0}
                    onChange={(e) =>
                      setSingleScoreForm({ ...singleScoreForm, artsPhysical: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>

                {/* Render any additional dynamic subjects */}
                {examSubjects.filter(sub => !['khmerReading', 'khmerWriting', 'mathematics', 'scienceSocial', 'moralCivics', 'artsPhysical'].includes(sub.code)).map(sub => (
                  <div key={sub.id}>
                    <label className="block text-slate-700 font-bold mb-1">
                      {sub.nameKhmer} /{sub.maxScore}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max={sub.maxScore}
                      value={singleScoreForm[sub.code] ?? 8.0}
                      onChange={(e) =>
                        setSingleScoreForm({ ...singleScoreForm, [sub.code]: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ការកត់សម្គាល់របស់គ្រូបន្ទុកថ្នាក់
                </label>
                <input
                  type="text"
                  value={singleScoreForm.remarks || ''}
                  onChange={(e) =>
                    setSingleScoreForm({ ...singleScoreForm, remarks: e.target.value })
                  }
                  placeholder="ឧ. ការសិក្សាល្អប្រសើរ ខិតខំលើសំណេរ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStudentForScoreEdit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  រក្សាទុកពិន្ទុ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Student Report Card & Academic Transcript Modal */}
      {selectedStudentForReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[96vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Actions Bar (No Print) */}
            <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between no-print sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-xs sm:text-sm font-moul">
                  ព្រឹត្តិបត្រពិន្ទុ & សៀវភៅតាមដានការសិក្សា - {selectedStudentForReportCard.nameKhmer}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព (Print Report)</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForReportCard(null)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Report Card Canvas */}
            <div className="p-6 sm:p-10 text-slate-900 bg-white relative overflow-hidden font-battambang">
              <AngkorPageWatermark opacity={0.035} />

              {/* Department & Royal Header */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-6 relative z-1">
                <div className="space-y-0.5 text-xs sm:text-sm">
                  <p className="font-semibold text-slate-800">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-semibold text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                  <p className="font-semibold text-slate-700">ការិយាល័យអប់រំ {schoolProfile.district}</p>
                  <p className="font-bold text-blue-900 font-moul text-sm sm:text-base pt-0.5">{schoolProfile.nameKhmer}</p>
                  <p className="text-[11px] text-slate-500 font-times">លេខកូដសាលា: {schoolProfile.schoolCode}</p>
                </div>

                <div className="text-center">
                  <MoEYSRoyalHeader />
                </div>

                <div className="w-16 h-20 border border-slate-300 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 text-center">
                  {selectedStudentForReportCard.avatarUrl ? (
                    <img
                      src={selectedStudentForReportCard.avatarUrl}
                      alt={selectedStudentForReportCard.nameKhmer}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>រូបថត 4x6</span>
                  )}
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-4 space-y-1 relative z-1">
                <h1 className="font-moul text-lg sm:text-xl text-blue-950 underline decoration-2 underline-offset-8">
                  ព្រឹត្តិបត្រពិន្ទុ និងសៀវភៅតាមដានការសិក្សា
                </h1>
                <p className="text-xs font-times text-slate-600 tracking-wider">
                  STUDENT ACADEMIC REPORT & PROGRESS RECORD
                </p>
                <p className="text-xs font-bold text-slate-700 pt-1">
                  ឆ្នាំសិក្សា {selectedAcademicYear} • ថ្នាក់ទី {selectedGrade}{selectedSection}
                </p>
              </div>

              {/* Student Metadata Card */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm my-5 relative z-1">
                <div>
                  <span className="text-slate-500 text-xs block">គោត្តនាម-នាមសិស្ស</span>
                  <strong className="font-bold text-slate-900 font-moul">{selectedStudentForReportCard.nameKhmer}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">អក្សរឡាតាំង</span>
                  <strong className="font-bold text-slate-800 font-times">{selectedStudentForReportCard.nameLatin || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">ភេទ & ថ្ងៃខែឆ្នាំកំណើត</span>
                  <strong className="font-medium text-slate-800">
                    {selectedStudentForReportCard.gender === 'F' ? 'ស្រី' : 'ប្រុស'} • <span className="font-times">{selectedStudentForReportCard.dob}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">អត្តលេខសិស្ស</span>
                  <strong className="font-bold text-blue-800 font-times">{selectedStudentForReportCard.code}</strong>
                </div>
              </div>

              {/* Monthly Score Matrix for Selected Student */}
              <div className="my-5 overflow-x-auto relative z-1">
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-400 py-2 px-2 text-center">ខែ/ឆមាស</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">ភាសាខ្មែរ (អាន)</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">ភាសាខ្មែរ (សរសេរ)</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">គណិតវិទ្យា</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">វិទ្យាសាស្ត្រ-សង្គម</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">សីលធម៌-ពលរដ្ឋ</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">សិល្បៈ-កាយ</th>
                      <th className="border border-slate-400 py-2 px-2 text-center bg-blue-50 text-blue-900 font-moul">សរុប</th>
                      <th className="border border-slate-400 py-2 px-2 text-center bg-emerald-50 text-emerald-900 font-moul">ម.ភាគ</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">ចំណាត់ថ្នាក់</th>
                      <th className="border border-slate-400 py-2 px-2 text-center">និទ្ទេស</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHS_LIST.map((month) => {
                      const rec = scores.find(
                        (s) =>
                          s.studentId === selectedStudentForReportCard.id &&
                          s.monthOrSemester === month &&
                          (!s.academicYear || s.academicYear === selectedAcademicYear)
                      );
                      const isSemester = month.includes('ឆមាស');
                      return (
                        <tr
                          key={month}
                          className={`text-center ${isSemester ? 'bg-amber-50/70 font-bold' : 'hover:bg-slate-50'}`}
                        >
                          <td className="border border-slate-400 py-1.5 px-2 font-semibold">{month}</td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times">{rec ? rec.scores.khmerReading : '-'}</td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times">{rec ? rec.scores.khmerWriting : '-'}</td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times">{rec ? rec.scores.mathematics : '-'}</td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times">{rec ? rec.scores.scienceSocial : '-'}</td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times">{rec ? rec.scores.moralCivics : '-'}</td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times">{rec ? rec.scores.artsPhysical : '-'}</td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times font-bold bg-blue-50/40 text-blue-900">
                            {rec ? rec.totalScore : '-'}
                          </td>
                          <td className="border border-slate-400 py-1.5 px-2 font-times font-bold bg-emerald-50/40 text-emerald-800">
                            {rec ? rec.averageScore : '-'}
                          </td>
                          <td className="border border-slate-400 py-1.5 px-2 font-semibold">
                            {rec ? `${rec.rank}/${classStudents.length}` : '-'}
                          </td>
                          <td className="border border-slate-400 py-1.5 px-2 font-bold font-times">
                            {rec ? rec.gradeLetter : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Behavior and Teacher Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 relative z-1 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-800 block">ការវាយតម្លៃអត្តចរិត និងវិន័យ (Conduct & Discipline)</span>
                  <p className="text-slate-700 leading-relaxed">
                    សិស្សមានវិន័យល្អ គោរពបទបញ្ជាផ្ទៃក្នុងសាលា ឧស្សាហ៍ព្យាយាម និងរួសរាយរាក់ទាក់ជាមួយមិត្តរួមថ្នាក់។
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-800 block">យោបល់គ្រូបន្ទុកថ្នាក់ (Teacher Recommendations)</span>
                  <p className="text-slate-700 leading-relaxed">
                    ត្រូវបន្តខិតខំរៀនសូត្របន្ថែមលើមុខវិជ្ជាគណិតវិទ្យា និងអានអត្ថបទភាសាខ្មែរនៅផ្ទះឱ្យបានច្រើន។
                  </p>
                </div>
              </div>

              {/* Dual Signatures & MoEYS Red Stamp on Print */}
              <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs relative z-1">
                <div>
                  <p className="font-semibold text-slate-700">បានឃើញ និងយល់ព្រម</p>
                  <p className="font-bold text-slate-900 font-moul mt-1">អាណាព្យាបាលសិស្ស</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-800">
                    {selectedStudentForReportCard.guardianName || selectedStudentForReportCard.fatherName || '...............................'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">ថ្ងៃទី {new Date().getDate()} ខែ {selectedMonth} ឆ្នាំ២០២៤</p>
                  <p className="font-bold text-slate-900 font-moul mt-1">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-800">{homeroomTeacher?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">បានឃើញ និងឯកភាព</p>
                  <p className="font-bold text-slate-900 font-moul mt-1">នាយិកាសាលា</p>
                  <div className="h-16" />
                  <p className="font-bold font-moul text-blue-950">{schoolProfile.principalName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Honor Certificate Modal Preview with Authentic Angkor Motifs */}
      {selectedStudentForHonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[96vh] overflow-y-auto shadow-2xl border-4 border-amber-500/80 p-6 sm:p-10 text-center relative overflow-hidden print-certificate">
            {/* Angkor Corner Kbach Ornaments */}
            <KhmerKbachCorner position="top-left" className="absolute top-2 left-2 w-16 h-16 sm:w-20 sm:h-20" color="#d97706" />
            <KhmerKbachCorner position="top-right" className="absolute top-2 right-2 w-16 h-16 sm:w-20 sm:h-20" color="#d97706" />
            <KhmerKbachCorner position="bottom-left" className="absolute bottom-2 left-2 w-16 h-16 sm:w-20 sm:h-20" color="#d97706" />
            <KhmerKbachCorner position="bottom-right" className="absolute bottom-2 right-2 w-16 h-16 sm:w-20 sm:h-20" color="#d97706" />

            {/* Center Angkor Silhouette Watermark */}
            <AngkorPageWatermark opacity={0.06} />

            {/* Inner Double Gold Frame */}
            <div className="border-2 border-amber-300/80 p-6 sm:p-8 rounded-xl relative z-1 space-y-4">
              {/* Royal Emblem Header */}
              <div className="space-y-1 mb-3">
                <MoEYSRoyalHeader subTitle="ក្រសួងអប់រំ យុវជន និងកីឡា" />
                <div className="text-xs sm:text-sm font-bold text-blue-900 font-moul pt-1">
                  {schoolProfile.nameKhmer}
                </div>
              </div>

              {/* Certificate Title */}
              <div className="my-3 space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold font-moul text-amber-700 tracking-wider">
                  ប័ណ្ណសរសើរ និងកិត្តិយស
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-times tracking-widest uppercase">
                  CERTIFICATE OF ACADEMIC EXCELLENCE & MERIT
                </p>
              </div>

              {/* Awarded Text */}
              <div className="my-5 p-5 bg-amber-50/70 rounded-2xl border border-amber-200/90 leading-relaxed text-slate-800 text-xs sm:text-sm">
                <p className="font-battambang">
                  គណៈគ្រប់គ្រងសាលាបឋមសិក្សា <strong className="text-blue-950 font-moul">{schoolProfile.nameKhmer}</strong> សូមប្រគល់ប័ណ្ណកិត្តិយសនេះជូនដល់៖
                </p>
                <strong className="text-xl sm:text-2xl font-bold text-blue-900 font-moul block my-2 tracking-wide">
                  {selectedStudentForHonor.studentNameKhmer}
                </strong>
                <p className="font-battambang text-slate-700">
                  ជាសិស្ស <strong className="font-bold text-slate-900">ថ្នាក់ទី {selectedStudentForHonor.grade}{selectedStudentForHonor.section}</strong> ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ និងទទួលបាន៖
                </p>
                <div className="inline-flex items-center gap-2 my-2.5 px-4 py-1.5 bg-amber-500 text-white rounded-full font-moul text-xs sm:text-sm shadow-xs">
                  <span>★</span>
                  <span>ចំណាត់ថ្នាក់លេខ {selectedStudentForHonor.rank} (និទ្ទេស {selectedStudentForHonor.gradeLetter})</span>
                  <span>★</span>
                </div>
                <p className="font-battambang text-slate-700">
                  មធ្យមភាគពិន្ទុ <strong className="text-emerald-700 font-bold font-times text-base">{selectedStudentForHonor.averageScore}</strong> ប្រចាំខែ {selectedStudentForHonor.monthOrSemester} ឆ្នាំសិក្សា {selectedStudentForHonor.academicYear}។
                </p>
              </div>

              {/* Official Signatures & Seal */}
              <div className="flex justify-between items-end mt-8 text-xs text-slate-700 pt-2 px-4">
                <div className="text-center">
                  <p>បានឃើញ និងយល់ព្រម</p>
                  <strong className="block mt-1 font-moul text-slate-900">គ្រូបន្ទុកថ្នាក់</strong>
                  <div className="h-12" />
                  <p className="font-bold text-slate-900">{homeroomTeacher?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}</p>
                </div>

                <div className="text-center">
                  <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {selectedMonth} ឆ្នាំ២០២៤</p>
                  <strong className="block mt-1 font-moul text-slate-900">នាយិកាសាលា</strong>
                  <div className="h-12" />
                  <p className="font-bold font-moul text-blue-950">{schoolProfile.principalName}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls (No Print) */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-center gap-3 no-print relative z-10">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពប័ណ្ណសរសើរ (Print)</span>
              </button>
              <button
                onClick={() => setSelectedStudentForHonor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                <span>បិទផ្ទាំង</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
