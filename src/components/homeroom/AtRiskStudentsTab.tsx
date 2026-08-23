import React, { useState, useMemo } from 'react';
import {
  AtRiskStudent,
  AtRiskCategory,
  InterventionStrategy,
  AtRiskProgressStatus,
  InterventionProgressLog,
  Student,
  Teacher,
  DailyAttendanceRecord,
  StudentScoreRecord
} from '../../types';
import {
  Users,
  UserPlus,
  BookOpen,
  Calculator,
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Eye,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  UserCheck,
  CheckCheck,
  RefreshCw,
  X,
  FileSpreadsheet,
  Zap,
  HelpCircle
} from 'lucide-react';

interface AtRiskStudentsTabProps {
  selectedGrade: number;
  selectedSection: string;
  students: Student[];
  currentTeacher?: Teacher;
  atRiskStudents: AtRiskStudent[];
  onAddAtRiskStudent: (student: Omit<AtRiskStudent, 'id' | 'enrolledDate' | 'progressLogs' | 'updatedAt'>) => void;
  onUpdateAtRiskStudent: (id: string, updated: Partial<AtRiskStudent>) => void;
  onAddInterventionLog: (atRiskId: string, log: Omit<InterventionProgressLog, 'id' | 'date'>) => void;
  onDeleteAtRiskStudent: (id: string) => void;
  attendanceRecords: DailyAttendanceRecord[];
  scores: StudentScoreRecord[];
}

const CATEGORY_LABELS: Record<AtRiskCategory, { label: string; icon: string; color: string }> = {
  academic_slow: { label: 'រៀនយឺតទូទៅ', icon: '🐢', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  reading_difficulty: { label: 'ពិបាកអាន/អក្ខរកម្ម', icon: '📖', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  math_difficulty: { label: 'ពិបាកគិតលេខ/គណិត', icon: '🔢', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  attendance_risk: { label: 'អវត្តមានញឹកញាប់', icon: '⚠️', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  behavioral_social: { label: 'ខ្វះការផ្ចង់អារម្មណ៍', icon: '🎯', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  family_hardship: { label: 'ជីវភាពជួបការលំបាក', icon: '🏠', color: 'bg-slate-100 text-slate-800 border-slate-300' }
};

const STRATEGY_LABELS: Record<InterventionStrategy, { label: string; icon: string }> = {
  peer_tutoring: { label: 'ក្មេងជួយក្មេង (Peer Buddy)', icon: '🤝' },
  after_class_remedial: { label: 'បំប៉នបន្ថែមក្រៅម៉ោង', icon: '⏰' },
  special_seat: { label: 'អង្គុយតុមុខក្បែរគ្រូ', icon: '🪑' },
  parent_home_tracking: { label: 'សៀវភៅតាមដានផ្ទះជាមួយមាតាបិតា', icon: '🏡' },
  custom_worksheet: { label: 'សន្លឹកកិច្ចការសម្រួលកម្រិត', icon: '📝' },
  counseling_support: { label: 'ការប្រឹក្សាលើកទឹកចិត្ត', icon: '💬' }
};

const STATUS_LABELS: Record<AtRiskProgressStatus, { label: string; color: string; badge: string }> = {
  critical: { label: 'ត្រូវការជំនួយបន្ទាន់', color: 'text-rose-700 bg-rose-50 border-rose-200', badge: 'bg-rose-600 text-white' },
  improving: { label: 'កំពុងរីកចម្រើន', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'bg-amber-500 text-white' },
  on_track: { label: 'ក្នុងគន្លងល្អ', color: 'text-blue-700 bg-blue-50 border-blue-200', badge: 'bg-blue-600 text-white' },
  achieved: { label: 'សម្រេចគោលដៅ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badge: 'bg-emerald-600 text-white' }
};

export const AtRiskStudentsTab: React.FC<AtRiskStudentsTabProps> = ({
  selectedGrade,
  selectedSection,
  students,
  currentTeacher,
  atRiskStudents,
  onAddAtRiskStudent,
  onUpdateAtRiskStudent,
  onAddInterventionLog,
  onDeleteAtRiskStudent,
  attendanceRecords,
  scores
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<AtRiskStudent | null>(null);
  const [editingStudent, setEditingStudent] = useState<AtRiskStudent | null>(null);

  // Form State for Add / Edit
  const [formStudentId, setFormStudentId] = useState('');
  const [formCategories, setFormCategories] = useState<AtRiskCategory[]>(['academic_slow']);
  const [formSubjects, setFormSubjects] = useState<string[]>(['ភាសាខ្មែរ']);
  const [formBaselineScore, setFormBaselineScore] = useState<number>(3.5);
  const [formTargetScore, setFormTargetScore] = useState<number>(7.0);
  const [formAssignedBuddyId, setFormAssignedBuddyId] = useState('');
  const [formStrategies, setFormStrategies] = useState<InterventionStrategy[]>(['peer_tutoring', 'after_class_remedial']);
  const [formTeacherNotes, setFormTeacherNotes] = useState('');
  const [formOverallStatus, setFormOverallStatus] = useState<AtRiskProgressStatus>('critical');

  // Form State for Progress Log
  const [logTestScore, setLogTestScore] = useState<number>(5.0);
  const [logReadingSpeed, setLogReadingSpeed] = useState<number | ''>('');
  const [logMathAccuracy, setLogMathAccuracy] = useState<number | ''>('');
  const [logStatus, setLogStatus] = useState<AtRiskProgressStatus>('improving');
  const [logNote, setLogNote] = useState('');
  const [logEvaluator, setLogEvaluator] = useState(currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី');

  // Filter students belonging to current class
  const classStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [students, selectedGrade, selectedSection]);

  // Current class at-risk students
  const classAtRiskStudents = useMemo(() => {
    return atRiskStudents.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [atRiskStudents, selectedGrade, selectedSection]);

  // Students not yet enrolled in at-risk list (candidates for enrollment)
  const unenrolledClassStudents = useMemo(() => {
    const enrolledIds = new Set(classAtRiskStudents.map(s => s.studentId));
    return classStudents.filter(s => !enrolledIds.has(s.id));
  }, [classStudents, classAtRiskStudents]);

  // Smart suggestions: detect students with low score average (< 5.0) or high absences (>= 3)
  const suggestedAtRiskStudents = useMemo(() => {
    return unenrolledClassStudents.map(student => {
      // check scores
      const studentScores = scores.filter(sc => sc.studentId === student.id);
      const avgScore =
        studentScores.length > 0
          ? studentScores.reduce((acc, sc) => acc + (sc.totalAverageScore || 0), 0) / studentScores.length
          : null;

      // check absences
      const studentAttendances = attendanceRecords.filter(a => a.studentId === student.id);
      const absentCount = studentAttendances.filter(a => a.status === 'absent_without_permission' || a.status === 'absent_with_permission').length;

      const isLowScore = avgScore !== null && avgScore < 5.0;
      const isHighAbsent = absentCount >= 3;

      return {
        student,
        avgScore: avgScore !== null ? Number(avgScore.toFixed(1)) : 4.0,
        absentCount,
        isLowScore,
        isHighAbsent,
        isSuggested: isLowScore || isHighAbsent
      };
    }).filter(item => item.isSuggested);
  }, [unenrolledClassStudents, scores, attendanceRecords]);

  // Filtered list based on search and dropdown filters
  const filteredAtRiskStudents = useMemo(() => {
    return classAtRiskStudents.filter(item => {
      const matchSearch =
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subjectsNeedingHelp.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.assignedBuddyName && item.assignedBuddyName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategoryFilter === 'all' || item.categories.includes(selectedCategoryFilter as AtRiskCategory);

      const matchStatus =
        selectedStatusFilter === 'all' || item.overallStatus === selectedStatusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [classAtRiskStudents, searchTerm, selectedCategoryFilter, selectedStatusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = classAtRiskStudents.length;
    const critical = classAtRiskStudents.filter(s => s.overallStatus === 'critical').length;
    const improving = classAtRiskStudents.filter(s => s.overallStatus === 'improving').length;
    const onTrack = classAtRiskStudents.filter(s => s.overallStatus === 'on_track').length;
    const achieved = classAtRiskStudents.filter(s => s.overallStatus === 'achieved').length;

    const avgBaseline = total > 0
      ? (classAtRiskStudents.reduce((acc, s) => acc + s.baselineScore, 0) / total).toFixed(1)
      : '0.0';

    const avgCurrent = total > 0
      ? (classAtRiskStudents.reduce((acc, s) => acc + s.currentScore, 0) / total).toFixed(1)
      : '0.0';

    const avgGain = (Number(avgCurrent) - Number(avgBaseline)).toFixed(1);

    return { total, critical, improving, onTrack, achieved, avgBaseline, avgCurrent, avgGain };
  }, [classAtRiskStudents]);

  // Open Add Modal with optional prefilled student
  const handleOpenAddModal = (prefillStudent?: Student, defaultBaseline = 3.5, defaultCategories: AtRiskCategory[] = ['academic_slow']) => {
    setEditingStudent(null);
    if (prefillStudent) {
      setFormStudentId(prefillStudent.id);
      setFormBaselineScore(defaultBaseline);
      setFormCategories(defaultCategories);
    } else {
      setFormStudentId(unenrolledClassStudents[0]?.id || '');
      setFormBaselineScore(3.5);
      setFormCategories(['academic_slow']);
    }
    setFormSubjects(['ភាសាខ្មែរ', 'គណិតវិទ្យា']);
    setFormTargetScore(7.0);
    setFormAssignedBuddyId('');
    setFormStrategies(['peer_tutoring', 'after_class_remedial', 'special_seat']);
    setFormTeacherNotes('');
    setFormOverallStatus('critical');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (student: AtRiskStudent) => {
    setEditingStudent(student);
    setFormStudentId(student.studentId);
    setFormCategories(student.categories);
    setFormSubjects(student.subjectsNeedingHelp);
    setFormBaselineScore(student.baselineScore);
    setFormTargetScore(student.targetScore);
    setFormAssignedBuddyId(student.assignedBuddyId || '');
    setFormStrategies(student.interventionStrategies);
    setFormTeacherNotes(student.teacherNotes);
    setFormOverallStatus(student.overallStatus);
    setIsAddModalOpen(true);
  };

  // Save Add / Edit
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudentObj = students.find(s => s.id === formStudentId);
    if (!targetStudentObj) return;

    const buddyObj = students.find(s => s.id === formAssignedBuddyId);

    if (editingStudent) {
      onUpdateAtRiskStudent(editingStudent.id, {
        categories: formCategories,
        subjectsNeedingHelp: formSubjects,
        baselineScore: formBaselineScore,
        targetScore: formTargetScore,
        assignedBuddyId: formAssignedBuddyId || undefined,
        assignedBuddyName: buddyObj ? buddyObj.nameKhmer : undefined,
        interventionStrategies: formStrategies,
        teacherNotes: formTeacherNotes,
        overallStatus: formOverallStatus
      });
    } else {
      onAddAtRiskStudent({
        studentId: targetStudentObj.id,
        studentName: targetStudentObj.nameKhmer,
        gender: targetStudentObj.gender,
        grade: selectedGrade,
        section: selectedSection,
        academicYear: '២០២៤ - ២០២៥',
        categories: formCategories,
        subjectsNeedingHelp: formSubjects,
        baselineScore: formBaselineScore,
        currentScore: formBaselineScore,
        targetScore: formTargetScore,
        assignedBuddyId: formAssignedBuddyId || undefined,
        assignedBuddyName: buddyObj ? buddyObj.nameKhmer : undefined,
        interventionStrategies: formStrategies,
        teacherNotes: formTeacherNotes,
        overallStatus: formOverallStatus
      });
    }

    setIsAddModalOpen(false);
  };

  // Open Add Progress Log Modal
  const handleOpenLogModal = (student: AtRiskStudent) => {
    setSelectedStudentForAction(student);
    setLogTestScore(student.currentScore);
    setLogReadingSpeed('');
    setLogMathAccuracy('');
    setLogStatus(student.overallStatus === 'critical' ? 'improving' : student.overallStatus);
    setLogNote('');
    setIsLogModalOpen(true);
  };

  // Save Progress Log
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAction) return;

    onAddInterventionLog(selectedStudentForAction.id, {
      evaluatedBy: logEvaluator,
      assessmentNote: logNote || 'បានវាយតម្លៃសមត្ថភាពក្រោយការបង្រៀនបំប៉ន',
      testScore: Number(logTestScore),
      readingSpeedWPM: logReadingSpeed !== '' ? Number(logReadingSpeed) : undefined,
      mathAccuracyPercent: logMathAccuracy !== '' ? Number(logMathAccuracy) : undefined,
      status: logStatus
    });

    setIsLogModalOpen(false);
  };

  // Toggle category in form
  const toggleCategory = (cat: AtRiskCategory) => {
    setFormCategories(prev =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter(c => c !== cat) : prev) : [...prev, cat]
    );
  };

  // Toggle subject in form
  const toggleSubject = (sub: string) => {
    setFormSubjects(prev =>
      prev.includes(sub) ? (prev.length > 1 ? prev.filter(s => s !== sub) : prev) : [...prev, sub]
    );
  };

  // Toggle strategy in form
  const toggleStrategy = (strat: InterventionStrategy) => {
    setFormStrategies(prev =>
      prev.includes(strat) ? (prev.length > 1 ? prev.filter(s => s !== strat) : prev) : [...prev, strat]
    );
  };

  return (
    <div className="space-y-6 font-battambang">
      {/* 1. METRIC & PROGRESS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">សិស្សតាមដានសរុប</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{stats.total}</span>
              <span className="text-xs text-slate-500">នាក់ ({((stats.total / (classStudents.length || 1)) * 100).toFixed(0)}% នៃថ្នាក់)</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">ត្រូវការជំនួយបន្ទាន់</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-rose-600">{stats.critical}</span>
              <span className="text-xs text-rose-700 font-medium">នាក់ (ពិន្ទុ &lt; ៤.៥)</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">កំពុងរីកចម្រើន / ក្នុងគន្លងល្អ</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-blue-600">{stats.improving + stats.onTrack}</span>
              <span className="text-xs text-emerald-600 font-bold">+{stats.avgGain} ពិន្ទុ</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">សម្រេចគោលដៅ</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-600">{stats.achieved}</span>
              <span className="text-xs text-slate-500">នាក់ (ត្រៀមបញ្ចប់បំប៉ន)</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. SMART AUTO-DETECTION CALLOUT (If there are unenrolled students with low score or high absences) */}
      {suggestedAtRiskStudents.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 border border-amber-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-800 text-sm">
                    ការណែនាំ និងអនុសាសន៍ស្វ័យប្រវត្តិតាមទិន្នន័យ
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">
                    រកឃើញ {suggestedAtRiskStudents.length} នាក់
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  ប្រព័ន្ធបានវិភាគពិន្ទុ និងអវត្តមាន ហើយរកឃើញសិស្សដែលមានពិន្ទុក្រោម ៥.០ ឬអវត្តមានលើស ៣ ដង ដែលគួរដាក់បញ្ចូលក្នុងបញ្ជីបំប៉ន៖
                </p>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {suggestedAtRiskStudents.slice(0, 4).map(item => (
                    <div
                      key={item.student.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs shadow-2xs"
                    >
                      <span className="font-bold text-slate-800">{item.student.nameKhmer}</span>
                      {item.isLowScore && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          ពិន្ទុ {item.avgScore}/10
                        </span>
                      )}
                      {item.isHighAbsent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          អវត្តមាន {item.absentCount}ដង
                        </span>
                      )}
                      <button
                        onClick={() =>
                          handleOpenAddModal(
                            item.student,
                            item.avgScore || 3.5,
                            item.isHighAbsent ? ['attendance_risk', 'academic_slow'] : ['academic_slow']
                          )
                        }
                        className="ml-1 px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>ដាក់បញ្ចូល</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTROL TOOLBAR (Search, Filters, Action Buttons) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search & Filter dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកឈ្មោះសិស្ស, មុខវិជ្ជា, មិត្តជួយមិត្ត..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="py-2 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden text-slate-700 font-medium"
            >
              <option value="all">គ្រប់បញ្ហាប្រឈម</option>
              <option value="reading_difficulty">📖 ពិបាកអាន/អក្ខរកម្ម</option>
              <option value="math_difficulty">🔢 ពិបាកគិតលេខ/គណិត</option>
              <option value="academic_slow">🐢 រៀនយឺតទូទៅ</option>
              <option value="attendance_risk">⚠️ អវត្តមានញឹកញាប់</option>
              <option value="behavioral_social">🎯 ខ្វះការផ្ចង់អារម្មណ៍</option>
              <option value="family_hardship">🏠 ជីវភាពលំបាក</option>
            </select>
          </div>

          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="py-2 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden text-slate-700 font-medium"
          >
            <option value="all">គ្រប់ស្ថានភាពវឌ្ឍនភាព</option>
            <option value="critical">🚨 ត្រូវការជំនួយបន្ទាន់</option>
            <option value="improving">📈 កំពុងរីកចម្រើន</option>
            <option value="on_track">🎯 ក្នុងគន្លងល្អ</option>
            <option value="achieved">🏆 សម្រេចគោលដៅ</option>
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">បោះពុម្ពតារាងតាមដាន</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>ដាក់បញ្ចូលសិស្សខ្សោយថ្មី</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN AT-RISK STUDENTS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              {filteredAtRiskStudents.length}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                តារាងតាមដាន និងវាយតម្លៃសិស្សរៀនយឺត/ខ្សោយ ថ្នាក់ទី {selectedGrade}«{selectedSection}»
              </h3>
              <p className="text-xs text-slate-500">
                ឆ្នាំសិក្សា ២០២៤ - ២០២៥ • គ្រូបន្ទុកថ្នាក់៖ {currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី'}
              </p>
            </div>
          </div>
        </div>

        {filteredAtRiskStudents.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">មិនទាន់មានទិន្នន័យសិស្សខ្សោយក្នុងលក្ខខណ្ឌនេះទេ</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              លោកគ្រូ-អ្នកគ្រូអាចចុចប៊ូតុង «ដាក់បញ្ចូលសិស្សខ្សោយថ្មី» ដើម្បីចាប់ផ្តើមកត់ត្រា និងរៀបចំផែនការបំប៉នពិសេស។
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-indigo-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>ដាក់បញ្ចូលសិស្សឥឡូវនេះ</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 text-center w-12">ល.រ</th>
                  <th className="py-3 px-4">ឈ្មោះសិស្ស</th>
                  <th className="py-3 px-4">បញ្ហាប្រឈម & មុខវិជ្ជា</th>
                  <th className="py-3 px-4">វិធីសាស្ត្រជួយ & មិត្តជួយមិត្ត</th>
                  <th className="py-3 px-4 text-center">វឌ្ឍនភាពពិន្ទុ</th>
                  <th className="py-3 px-4 text-center">ស្ថានភាព</th>
                  <th className="py-3 px-4 text-center w-36">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAtRiskStudents.map((item, idx) => {
                  const studentObj = students.find(s => s.id === item.studentId);
                  const statusConf = STATUS_LABELS[item.overallStatus];
                  const scoreGain = (item.currentScore - item.baselineScore).toFixed(1);
                  const progressPercent = Math.min(
                    100,
                    Math.max(
                      0,
                      ((item.currentScore - item.baselineScore) / ((item.targetScore - item.baselineScore) || 1)) * 100
                    )
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Number */}
                      <td className="py-3 px-4 text-center font-bold text-slate-500">{idx + 1}</td>

                      {/* 2. Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {item.studentName ? item.studentName.charAt(0) : 'ស'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{item.studentName}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${item.gender === 'female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                                {item.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {studentObj?.code || 'STU-ID'} • ចុះបញ្ជី៖ {item.enrolledDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Categories & Subjects */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.categories.map(cat => {
                              const conf = CATEGORY_LABELS[cat];
                              return (
                                <span
                                  key={cat}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${conf.color} flex items-center gap-1`}
                                >
                                  <span>{conf.icon}</span>
                                  <span>{conf.label}</span>
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <span className="text-slate-400">មុខវិជ្ជា៖</span>
                            <span className="font-semibold text-indigo-900">
                              {item.subjectsNeedingHelp.join(', ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Strategies & Study Buddy */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {item.assignedBuddyName ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-700">
                              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-slate-500 text-[11px]">មិត្តជួយមិត្ត៖</span>
                              <span className="font-bold text-slate-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                                {item.assignedBuddyName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">មិនទាន់ចាត់តាំងមិត្តជួយ</span>
                          )}

                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {item.interventionStrategies.slice(0, 2).map(st => (
                              <span
                                key={st}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {STRATEGY_LABELS[st]?.label}
                              </span>
                            ))}
                            {item.interventionStrategies.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{item.interventionStrategies.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 5. Score Progression */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-block text-center min-w-[130px]">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-slate-400 text-[11px]">ដើម {item.baselineScore}</span>
                            <span className="text-indigo-700 font-black text-sm px-1.5 py-0.2 rounded bg-indigo-50">
                              {item.currentScore}
                            </span>
                            <span className="text-emerald-600 text-[11px]">ដៅ {item.targetScore}</span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.overallStatus === 'achieved'
                                  ? 'bg-emerald-500'
                                  : item.overallStatus === 'on_track'
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.max(10, progressPercent)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                            <span>រីកចម្រើន៖</span>
                            <span className={`font-bold ${Number(scoreGain) > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                              {Number(scoreGain) > 0 ? `+${scoreGain}` : scoreGain} ពិន្ទុ
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Overall Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.color}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Log Progress */}
                          <button
                            onClick={() => handleOpenLogModal(item)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                            title="កត់ត្រាវឌ្ឍនភាព / វាយតម្លៃថ្មី"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* View Detail History */}
                          <button
                            onClick={() => {
                              setSelectedStudentForAction(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                            title="មើលប្រវត្តិវិវត្តន៍លម្អិត"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="កែប្រែព័ត៌មាន"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`តើលោកគ្រូ-អ្នកគ្រូចង់លុបសិស្ស «${item.studentName}» ចេញពីបញ្ជីតាមដានសិស្សខ្សោយមែនទេ?`)) {
                                onDeleteAtRiskStudent(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="លុបចេញ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. ADD / EDIT STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {editingStudent ? 'កែប្រែព័ត៌មានសិស្សខ្សោយ' : 'ដាក់បញ្ចូលឈ្មោះសិស្សខ្សោយ/រៀនយឺតថ្មី'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ថ្នាក់ទី {selectedGrade}«{selectedSection}» • ផែនការអន្តរាគមន៍ និងការបំប៉នសមត្ថភាព
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ជ្រើសរើសសិស្ស <span className="text-rose-500">*</span>
                </label>
                {editingStudent ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                    {editingStudent.studentName} ({editingStudent.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                  </div>
                ) : (
                  <select
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500 text-slate-800 font-bold"
                  >
                    {unenrolledClassStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} ({s.gender === 'female' ? 'ស្រី' : 'ប្រុស'} • {s.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Risk Categories */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  បញ្ហាប្រឈម និងប្រភេទនៃភាពខ្សោយ (At-risk Categories) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_LABELS) as AtRiskCategory[]).map(cat => {
                    const conf = CATEGORY_LABELS[cat];
                    const isSelected = formCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">{conf.icon}</span>
                        <span className="text-xs">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjects Needing Help */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  មុខវិជ្ជាដែលត្រូវការជំនួយបំប៉ន <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['ភាសាខ្មែរ', 'គណិតវិទ្យា', 'វិទ្យាសាស្ត្រ', 'សិក្សាសង្គម', 'អង់គ្លេស'].map(sub => {
                    const isSelected = formSubjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scores: Baseline and Target */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ពិន្ទុដើមគ្រា (Baseline Score) /10 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formBaselineScore}
                    onChange={e => setFormBaselineScore(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-sm"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">ពិន្ទុតេស្តមុនពេលបំប៉ន</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    គោលដៅពិន្ទុរំពឹងទុក (Target Score) /10 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="10"
                    value={formTargetScore}
                    onChange={e => setFormTargetScore(parseFloat(e.target.value) || 7.0)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-emerald-700 text-sm"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">ពិន្ទុដែលសិស្សត្រូវសម្រេច</span>
                </div>
              </div>

              {/* Assigned Study Buddy */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-rose-500" />
                  <span>ចាត់តាំងមិត្តជួយមិត្ត (Peer Tutor / Study Buddy - សិស្សពូកែក្នុងថ្នាក់)</span>
                </label>
                <select
                  value={formAssignedBuddyId}
                  onChange={e => setFormAssignedBuddyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500 text-slate-800"
                >
                  <option value="">-- មិនទាន់ចាត់តាំង --</option>
                  {classStudents
                    .filter(s => s.id !== formStudentId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} ({s.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                      </option>
                    ))}
                </select>
              </div>

              {/* Intervention Strategies */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  វិធីសាស្ត្រគរុកោសល្យជួយអន្តរាគមន៍ (Intervention Strategies)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(STRATEGY_LABELS) as InterventionStrategy[]).map(st => {
                    const conf = STRATEGY_LABELS[st];
                    const isSelected = formStrategies.includes(st);
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => toggleStrategy(st)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{conf.icon}</span>
                        <span className="text-xs">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Overall Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">ស្ថានភាពបច្ចុប្បន្ន</label>
                <select
                  value={formOverallStatus}
                  onChange={e => setFormOverallStatus(e.target.value as AtRiskProgressStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden font-bold"
                >
                  <option value="critical">🚨 ត្រូវការជំនួយបន្ទាន់ (Critical)</option>
                  <option value="improving">📈 កំពុងរីកចម្រើន (Improving)</option>
                  <option value="on_track">🎯 ក្នុងគន្លងល្អ (On Track)</option>
                  <option value="achieved">🏆 សម្រេចគោលដៅ (Achieved)</option>
                </select>
              </div>

              {/* Teacher Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ការកត់សម្គាល់ និងរោគវិនិច្ឆ័យរបស់គ្រូ
                </label>
                <textarea
                  rows={3}
                  value={formTeacherNotes}
                  onChange={e => setFormTeacherNotes(e.target.value)}
                  placeholder="ពិពណ៌នាអំពីចំណុចខ្សោយជាក់លាក់ ឥរិយាបថ ឬមូលហេតុផ្សេងៗ..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingStudent ? 'រក្សាទុកការកែប្រែ' : 'ដាក់បញ្ចូលសិស្ស'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD PROGRESS LOG MODAL */}
      {isLogModalOpen && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    កត់ត្រាវឌ្ឍនភាពសិក្សា (Log Progress)
                  </h3>
                  <p className="text-xs text-slate-500">
                    សិស្ស៖ <strong className="text-slate-800">{selectedStudentForAction.studentName}</strong> (ពិន្ទុដើម៖ {selectedStudentForAction.baselineScore}/10)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ពិន្ទុតេស្តវាយតម្លៃថ្មី /10 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={logTestScore}
                    onChange={e => setLogTestScore(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ស្ថានភាពវឌ្ឍនភាព</label>
                  <select
                    value={logStatus}
                    onChange={e => setLogStatus(e.target.value as AtRiskProgressStatus)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value="critical">🚨 ត្រូវការជំនួយបន្ទាន់</option>
                    <option value="improving">📈 កំពុងរីកចម្រើន</option>
                    <option value="on_track">🎯 ក្នុងគន្លងល្អ</option>
                    <option value="achieved">🏆 សម្រេចគោលដៅ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ល្បឿនអាន (ពាក្យ/នាទី - WPM)
                  </label>
                  <input
                    type="number"
                    placeholder="ឧ. 45"
                    value={logReadingSpeed}
                    onChange={e => setLogReadingSpeed(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ភាពត្រឹមត្រូវគណិតវិទ្យា (%)
                  </label>
                  <input
                    type="number"
                    placeholder="ឧ. 75%"
                    min="0"
                    max="100"
                    value={logMathAccuracy}
                    onChange={e => setLogMathAccuracy(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ការវាយតម្លៃ និងការកត់សម្គាល់ជាក់ស្តែង <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={logNote}
                  onChange={e => setLogNote(e.target.value)}
                  placeholder="ឧ. សិស្សអាចអានពាក្យគន្លឹះ និងគិតលេខបូកដក ២ ខ្ទង់បានត្រឹមត្រូវច្រើនជាងមុន..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">អ្នកវាយតម្លៃ</label>
                <input
                  type="text"
                  value={logEvaluator}
                  onChange={e => setLogEvaluator(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  កត់ត្រាវឌ្ឍនភាព
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. INDIVIDUAL DETAIL & TIMELINE HISTORY MODAL */}
      {isDetailModalOpen && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedStudentForAction.studentName ? selectedStudentForAction.studentName.charAt(0) : 'ស'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ផែនការអន្តរាគមន៍ & ប្រវត្តិនៃការវិវត្ត៖ {selectedStudentForAction.studentName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ថ្នាក់ទី {selectedGrade}«{selectedSection}» • ចុះបញ្ជី៖ {selectedStudentForAction.enrolledDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">ពិន្ទុដើមគ្រា៖</span>
                <span className="font-bold text-slate-800 text-sm">{selectedStudentForAction.baselineScore}/10</span>
              </div>
              <div>
                <span className="text-slate-500 block">ពិន្ទុបច្ចុប្បន្ន៖</span>
                <span className="font-black text-indigo-700 text-sm">{selectedStudentForAction.currentScore}/10</span>
              </div>
              <div>
                <span className="text-slate-500 block">គោលដៅពិន្ទុ៖</span>
                <span className="font-bold text-emerald-700 text-sm">{selectedStudentForAction.targetScore}/10</span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/80">
                <span className="text-slate-500 block mb-1">មិត្តជួយមិត្ត & វិធីសាស្ត្របំប៉ន៖</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedStudentForAction.assignedBuddyName && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px]">
                      🤝 មិត្ត៖ {selectedStudentForAction.assignedBuddyName}
                    </span>
                  )}
                  {selectedStudentForAction.interventionStrategies.map(st => (
                    <span key={st} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]">
                      {STRATEGY_LABELS[st]?.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Logs Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>ប្រវត្តិនៃការវាយតម្លៃ និងវឌ្ឍនភាពសិក្សា ({selectedStudentForAction.progressLogs.length} លើក)</span>
                </h4>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenLogModal(selectedStudentForAction);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>បន្ថែមការវាយតម្លៃ</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {selectedStudentForAction.progressLogs.map((log, idx) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-700">{log.date}</span>
                        <span className="text-slate-400">• {log.evaluatedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.testScore !== undefined && (
                          <span className="px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 text-xs">
                            ពិន្ទុ {log.testScore}/10
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_LABELS[log.status]?.badge}`}>
                          {STATUS_LABELS[log.status]?.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 bg-slate-50 p-2 rounded-lg text-xs leading-relaxed">
                      {log.assessmentNote}
                    </p>

                    {(log.readingSpeedWPM || log.mathAccuracyPercent) && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                        {log.readingSpeedWPM && (
                          <span>📖 ល្បឿនអាន៖ <strong>{log.readingSpeedWPM} WPM</strong></span>
                        )}
                        {log.mathAccuracyPercent && (
                          <span>🔢 ភាពត្រឹមត្រូវគណិត៖ <strong>{log.mathAccuracyPercent}%</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PRINT OFFICIAL AT-RISK STUDENTS REPORT MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 font-moul text-sm">
                តារាងតាមដាន និងវាយតម្លៃសិស្សរៀនយឺត/ខ្សោយ (គំរូក្រសួងអប់រំ យុវជន និងកីឡា)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ពឯកសារ</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Print Layout */}
            <div className="border border-slate-300 p-6 rounded-xl space-y-5 text-xs text-slate-900 bg-white">
              {/* Header */}
              <div className="text-center space-y-1">
                <p className="font-moul text-xs">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-[11px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="pt-2">
                  <p className="font-moul text-sm text-indigo-950">
                    តារាងតាមដាន និងវាយតម្លៃសិស្សរៀនយឺត/ខ្សោយប្រចាំថ្នាក់
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    ថ្នាក់ទី {selectedGrade} «{selectedSection}» • ឆ្នាំសិក្សា ២០២៤ - ២០២៥
                  </p>
                </div>
              </div>

              {/* Class Info Box */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <p><strong>សាលាបឋមសិក្សា៖</strong> ភ្នំពុំ</p>
                <p><strong>គ្រូបន្ទុកថ្នាក់៖</strong> {currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី'}</p>
                <p><strong>សិស្សក្នុងបញ្ជីបំប៉នសរុប៖</strong> {classAtRiskStudents.length} នាក់</p>
                <p><strong>កាលបរិច្ឆេទរបាយការណ៍៖</strong> {new Date().toLocaleDateString('km-KH')}</p>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-300 p-2 w-10">ល.រ</th>
                    <th className="border border-slate-300 p-2">ឈ្មោះសិស្ស</th>
                    <th className="border border-slate-300 p-2 w-12">ភេទ</th>
                    <th className="border border-slate-300 p-2">បញ្ហាប្រឈម/ខ្សោយ</th>
                    <th className="border border-slate-300 p-2">វិធីសាស្ត្រជួយ/មិត្តជួយ</th>
                    <th className="border border-slate-300 p-2 w-16">ពិន្ទុដើម</th>
                    <th className="border border-slate-300 p-2 w-16">បច្ចុប្បន្ន</th>
                    <th className="border border-slate-300 p-2 w-16">គោលដៅ</th>
                    <th className="border border-slate-300 p-2">ការវាយតម្លៃលទ្ធផល</th>
                  </tr>
                </thead>
                <tbody>
                  {classAtRiskStudents.map((s, idx) => (
                    <tr key={s.id} className="text-left">
                      <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{s.studentName}</td>
                      <td className="border border-slate-300 p-2 text-center">
                        {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                      </td>
                      <td className="border border-slate-300 p-2">
                        {s.categories.map(c => CATEGORY_LABELS[c]?.label).join(', ')} ({s.subjectsNeedingHelp.join(', ')})
                      </td>
                      <td className="border border-slate-300 p-2">
                        {s.assignedBuddyName && `មិត្ត៖ ${s.assignedBuddyName}, `}
                        {s.interventionStrategies.map(st => STRATEGY_LABELS[st]?.label).join(', ')}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{s.baselineScore}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">{s.currentScore}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{s.targetScore}</td>
                      <td className="border border-slate-300 p-2">
                        <span className="font-bold">{STATUS_LABELS[s.overallStatus]?.label}</span>
                        {s.progressLogs.length > 0 && (
                          <span className="text-slate-600 block text-[10px]">
                            {s.progressLogs[s.progressLogs.length - 1].assessmentNote}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs">
                <div>
                  <p className="font-bold">បានឃើញ និងឯកភាព</p>
                  <p className="text-slate-500 text-[11px]">នាយកសាលា</p>
                  <div className="h-16"></div>
                  <p className="font-bold font-moul">លោក លីម សន</p>
                </div>
                <div>
                  <p className="font-bold">ថ្ងៃទី.......ខែ.......ឆ្នាំ២០២...</p>
                  <p className="text-slate-500 text-[11px]">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-16"></div>
                  <p className="font-bold font-moul">{currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
