import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  GraduationCap,
  Award,
  BookOpen,
  CalendarCheck,
  Calendar,
  Heart,
  QrCode,
  Lock,
  User,
  School,
  Sparkles,
  CheckCircle2,
  Printer,
  Search,
  BookMarked,
  MessageSquare,
  FileText,
  ExternalLink,
  Send,
  BookOpenCheck,
  TrendingUp,
  Activity,
  BarChart3,
  Trophy,
  Share2,
  X
} from 'lucide-react';
import { LibraryBookCategory } from '../types';
import { StudentProgressAnalysis } from './StudentProgressAnalysis';
import { StudentRankingSystem } from './StudentRankingSystem';

export const StudentPortal: React.FC = () => {
  const {
    currentUser,
    previousTeacherUser,
    switchToTeacherWithPassword,
    students,
    scores,
    attendanceRecords,
    calendarEvents,
    schoolProfile,
    libraryBooks,
    studentFeedbacks,
    addStudentFeedback,
    updateUser,
    showToast,
    isResultReleased,
    getFormattedGrade
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'overview' | 'ranking' | 'progress' | 'library' | 'feedback'>('overview');
  const [overviewSubView, setOverviewSubView] = useState<'table' | 'chart'>('chart');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTeacherPasswordModal, setShowTeacherPasswordModal] = useState(false);
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');

  // Library browse state in Student Portal (Strictly View-Only)
  const [selectedLibCategory, setSelectedLibCategory] = useState<string>('all');
  const [selectedLibFormat, setSelectedLibFormat] = useState<string>('all');
  const [libSearchQuery, setLibSearchQuery] = useState<string>('');

  // Monthly Feedback Form State
  const [feedbackMonth, setFeedbackMonth] = useState<string>('កុម្ភៈ');
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackAuthor, setFeedbackAuthor] = useState<string>('អាណាព្យាបាលសិស្ស');

  // Find linked student record
  const studentData = students.find(
    s =>
      (currentUser?.studentCode && s.code === currentUser.studentCode) ||
      (currentUser?.studentId && s.id === currentUser.studentId) ||
      s.code === 'STU-2024-001'
  ) || students[0];

  // Find scores for this student
  const studentScores = scores.filter(sc => sc.studentId === studentData?.id);
  const latestScore = studentScores.length > 0 ? studentScores[studentScores.length - 1] : null;

  // Student Attendance
  const studentAttendance = attendanceRecords.filter(a => a.studentId === studentData?.id);
  const presentCount = studentAttendance.filter(a => a.status === 'present').length;
  const permissionCount = studentAttendance.filter(a => a.status === 'permission').length;
  const absentCount = studentAttendance.filter(a => a.status === 'absent').length;

  // Filtered books for View-Only Library in Student Portal
  const filteredLibraryBooks = useMemo(() => {
    return libraryBooks.filter(b => {
      const matchCat = selectedLibCategory === 'all' || b.category === selectedLibCategory;
      const matchFormat = selectedLibFormat === 'all' || b.format === selectedLibFormat;
      const q = libSearchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        b.titleKhmer.toLowerCase().includes(q) ||
        (b.titleLatin && b.titleLatin.toLowerCase().includes(q)) ||
        b.code.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q));
      return matchCat && matchFormat && matchQ;
    });
  }, [libraryBooks, selectedLibCategory, selectedLibFormat, libSearchQuery]);

  // Student's own monthly feedbacks
  const myFeedbacks = useMemo(() => {
    return studentFeedbacks.filter(f => f.studentId === studentData?.id);
  }, [studentFeedbacks, studentData]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      showToast('ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ!', 'error');
      return;
    }
    if (currentUser) {
      updateUser(currentUser.id, { password: newPassword });
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      showToast('បានផ្លាស់ប្តូរពាក្យសម្ងាត់ជោគជ័យ!');
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) {
      showToast('សូមសរសេរមតិផ្តាំផ្ញើរបស់អ្នកជាមុនសិន!', 'error');
      return;
    }
    if (!studentData) return;

    addStudentFeedback({
      studentId: studentData.id,
      studentNameKhmer: studentData.nameKhmer,
      grade: studentData.grade,
      section: studentData.section,
      month: feedbackMonth,
      academicYear: schoolProfile.academicYear,
      comment: feedbackComment.trim(),
      authorName: feedbackAuthor.trim() || 'អាណាព្យាបាល'
    });
    setFeedbackComment('');
  };

  const getCategoryLabel = (cat: LibraryBookCategory) => {
    switch (cat) {
      case 'literature':
        return <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-200">📚 អក្សរសាស្ត្រ</span>;
      case 'science':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-200">🔬 វិទ្យាសាស្ត្រ</span>;
      case 'history':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">🏛️ ប្រវត្តិសាស្ត្រ</span>;
      case 'mathematics':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">📐 គណិតវិទ្យា</span>;
      case 'geography':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">🌍 ភូមិវិទ្យា & សង្គម</span>;
      case 'storybook':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">📖 រឿងនិទានកុមារ</span>;
      case 'core_textbook':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">📘 សៀវភៅពុម្ពគោល</span>;
      case 'reference':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">🔖 ឯកសារយោង</span>;
      case 'magazine':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">📰 ទស្សនាវដ្តី</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">📄 ចំណេះដឹងទូទៅ</span>;
    }
  };

  return (
    <div className="space-y-6 font-battambang">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-2xl bg-white/10 border-2 border-white/20 p-1 backdrop-blur-xs flex items-center justify-center shrink-0">
              {studentData?.avatarUrl ? (
                <img
                  src={studentData.avatarUrl}
                  alt={studentData.nameKhmer}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <GraduationCap className="w-10 h-10 text-white/80" />
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                គណនីសិស្សានុសិស្ស (Student Portal)
              </div>
              <h2 className="font-moul text-xl sm:text-2xl text-white tracking-wide">
                {studentData?.nameKhmer || currentUser?.nameKhmer}
              </h2>
              <p className="text-xs text-blue-200 mt-1 font-times font-medium">
                អត្តលេខ: <span className="font-bold text-white">{studentData?.code}</span> • ថ្នាក់ទី {studentData?.grade}{studentData?.section} • ឆ្នាំសិក្សា {schoolProfile.academicYear}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {previousTeacherUser && currentUser?.role !== 'student' && (
              <button
                type="button"
                onClick={() => setShowTeacherPasswordModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                <span>🔄 ត្រឡប់ទៅគណនីគ្រូវិញ</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>ប្តូរពាក្យសម្ងាត់</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពប័ណ្ណសិស្ស</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Student Portal */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>លទ្ធផលសិក្សា & ព័ត៌មាន</span>
        </button>

        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'ranking'
              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-300'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>ចំណាត់ថ្នាក់ & Telegram (Rankings & Telegram)</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'progress'
              ? 'bg-indigo-900 text-white shadow-sm'
              : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>វិភាគការរីកចម្រើន (Progress Analysis)</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'library'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>បណ្ណាល័យសិស្ស (View-Only)</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-purple-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>មតិផ្តាំផ្ញើប្រចាំខែ (Monthly Feedback)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ACADEMIC RESULTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>និទ្ទេសចុងក្រោយ</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-times font-bold text-slate-800">
                {latestScore ? `និទ្ទេស ${latestScore.gradeLetter}` : 'និទ្ទេស A'}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {latestScore ? `មធ្យមភាគ ${latestScore.averageScore} / 10` : 'មធ្យមភាគ 8.65 / 10'}
              </p>
            </div>

            <div
              onClick={() => setActiveTab('ranking')}
              className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-2">
                <span>ចំណាត់ថ្នាក់ក្នុងថ្នាក់</span>
                <Trophy className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-times font-bold text-amber-700">
                {latestScore ? `លេខ ${latestScore.rank}` : 'លេខ ១'} / {students.filter(s => s.grade === studentData?.grade).length || 32}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center justify-between">
                <span>ថ្នាក់ទី {studentData?.grade}{studentData?.section}</span>
                <span className="text-[10px] underline">មើលចំណាត់ថ្នាក់ & Telegram →</span>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>វត្តមានវត្តមាន</span>
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-times font-bold text-emerald-700">
                {presentCount} ថ្ងៃ
              </p>
              <p className="text-[11px] text-slate-500 mt-1">ច្បាប់: {permissionCount} | អត់ច្បាប់: {absentCount}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                <span>ស្ថានភាពសិក្សា</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xl font-moul font-bold text-blue-800">កំពុងសិក្សា</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">ប្រក្រតី 100%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Academic Results Table & Progress Analysis */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <h3 className="font-moul text-sm text-slate-800">តារាងពិន្ទុ និងលទ្ធផលសិក្សាតាមខែ</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setOverviewSubView('chart')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          overviewSubView === 'chart'
                            ? 'bg-blue-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>គំនូសតាង (Chart)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverviewSubView('table')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          overviewSubView === 'table'
                            ? 'bg-blue-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>តារាងលម្អិត</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('ranking')}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>ចំណាត់ថ្នាក់ & Telegram</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('progress')}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>វិភាគស៊ីជម្រៅ</span>
                    </button>
                  </div>
                </div>

                {overviewSubView === 'chart' ? (
                  <div className="pt-1">
                    <StudentProgressAnalysis
                      student={studentData}
                      scores={scores}
                      dailyAttendance={attendanceRecords}
                      academicYear={schoolProfile.academicYear}
                    />
                  </div>
                ) : studentScores.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់សិស្សរូបនេះទេ។</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentScores.map(sc => (
                      <div key={sc.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900 text-xs px-3 py-1 bg-blue-100 rounded-full">
                            {sc.monthOrSemester || (sc as any).month} ({sc.monthOrSemester?.includes('ឆមាស') ? sc.monthOrSemester : 'ប្រចាំខែ'})
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            មធ្យមភាគ៖ <strong className="text-blue-700 font-times text-sm">{sc.averageScore} / 10</strong> (និទ្ទេស <span className="text-amber-600 font-bold">{sc.gradeLetter}</span>)
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-500 block text-[10px]">ភាសាខ្មែរ៖</span>
                            <span className="font-bold text-slate-800 font-times">
                              {sc.scores?.khmer ?? sc.scores?.khmerReading ?? (sc as any).subjects?.khmer ?? '-'} / 10
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-500 block text-[10px]">គណិតវិទ្យា៖</span>
                            <span className="font-bold text-slate-800 font-times">
                              {sc.scores?.mathematics ?? sc.scores?.math ?? (sc as any).subjects?.math ?? '-'} / 10
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-500 block text-[10px]">វិទ្យាសាស្ត្រ៖</span>
                            <span className="font-bold text-slate-800 font-times">
                              {sc.scores?.science ?? sc.scores?.scienceSocial ?? (sc as any).subjects?.science ?? '-'} / 10
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-200">
                            <span className="text-slate-500 block text-[10px]">សីលធម៌-ពលរដ្ឋ៖</span>
                            <span className="font-bold text-slate-800 font-times">
                              {sc.scores?.moralCivics ?? sc.scores?.ethics ?? (sc as any).subjects?.ethics ?? '-'} / 10
                            </span>
                          </div>
                        </div>

                        {(sc.remarks || (sc as any).teacherComment) && (
                          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                            <strong className="font-moul">មតិយោបល់លោកគ្រូអ្នកគ្រូ៖</strong> {sc.remarks || (sc as any).teacherComment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Exams & Events */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-indigo-700" />
                  <h3 className="font-moul text-sm text-slate-800">កាលវិភាគប្រឡង & ព្រឹត្តិការណ៍សិក្សា</h3>
                </div>

                <div className="space-y-3">
                  {calendarEvents.slice(0, 4).map(evt => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{evt.titleKhmer}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{evt.description || 'ព្រឹត្តិការណ៍តាមប្រតិទិន MoEYS'}</p>
                        <p className="text-[11px] text-blue-700 font-times font-semibold mt-1">
                          កាលបរិច្ឆេទ: {evt.startDate} ដល់ {evt.endDate}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-100 text-blue-800 shrink-0">
                        {evt.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Digital Student ID Card & Guardian */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-bold">
                  <span>ប័ណ្ណសម្គាល់ខ្លួនសិស្ស (Student Card)</span>
                  <QrCode className="w-4 h-4 text-blue-700" />
                </div>

                <div className="border-2 border-blue-900 rounded-2xl p-4 bg-gradient-to-b from-blue-50/50 to-white text-left space-y-3 shadow-inner">
                  <div className="text-center border-b border-blue-200 pb-2">
                    <p className="font-moul text-[10px] text-blue-950">{schoolProfile.nameKhmer}</p>
                    <p className="text-[9px] text-slate-600">ប័ណ្ណសម្គាល់ខ្លួនសិស្ស • Student Card</p>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-20 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shrink-0 flex items-center justify-center">
                      {studentData?.avatarUrl ? (
                        <img
                          src={studentData.avatarUrl}
                          alt={studentData.nameKhmer}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="text-xs space-y-0.5 text-slate-800">
                      <p className="font-bold text-blue-950">{studentData?.nameKhmer}</p>
                      <p className="font-times text-[11px] text-slate-600">{studentData?.nameLatin}</p>
                      <p className="text-[11px]">ភេទ: <span className="font-bold">{studentData?.gender === 'M' ? 'ប្រុស' : 'ស្រី'}</span></p>
                      <p className="text-[11px]">ថ្នាក់ទី: <span className="font-bold text-blue-700">{studentData?.grade}{studentData?.section}</span></p>
                      <p className="font-times text-[10.5px] font-bold text-purple-700">ID: {studentData?.code}</p>
                    </div>
                  </div>

                  <div className="bg-slate-100 rounded-xl p-2.5 flex items-center justify-between border border-slate-200 text-center">
                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-300 p-1 flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-800" />
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <p className="font-times font-bold text-slate-800">{schoolProfile.academicYear}</p>
                      <p>ស្កេនដើម្បីផ្ទៀងផ្ទាត់</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handlePrintCard}
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួន</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs space-y-2 text-slate-700">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">ព័ត៌មានអាណាព្យាបាល</h4>
                <p>ឈ្មោះ: <span className="font-semibold text-slate-900">{studentData?.guardianName}</span> ({studentData?.guardianRelationship})</p>
                <p>លេខទូរស័ព្ទ: <span className="font-times font-semibold text-blue-700">{studentData?.guardianPhone}</span></p>
                <p>មុខរបរ: {studentData?.guardianOccupation}</p>
                <p>អាសយដ្ឋាន: {studentData?.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STUDENT RANKING & TELEGRAM NOTIFICATION */}
      {activeTab === 'ranking' && studentData && (
        <div className="space-y-6">
          <StudentRankingSystem
            student={studentData}
            scores={scores}
            allStudents={students}
            schoolProfile={schoolProfile}
          />
        </div>
      )}

      {/* TAB: STUDENT PROGRESS & PERFORMANCE ANALYSIS */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <StudentProgressAnalysis
            student={studentData}
            scores={scores}
            dailyAttendance={attendanceRecords}
            academicYear={schoolProfile.academicYear}
          />
        </div>
      )}

      {/* TAB 2: LIBRARY VIEW-ONLY CATALOG */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-teal-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpenCheck className="w-6 h-6 text-teal-700" />
              <div>
                <p className="font-moul font-bold text-teal-950">បណ្ណាល័យសិស្ស (View-Only Catalog & E-Books)</p>
                <p className="text-[11px] text-teal-800 mt-0.5">សិស្សានុសិស្សអាចស្វែងរកសៀវភៅ អានសៀវភៅឌីជីថល PDF និងពិនិត្យស្តុកសៀវភៅក្នុងបណ្ណាល័យសាលាដោយសេរី។</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-teal-200 text-teal-900 font-bold rounded-xl text-xs">
              សរុប {libraryBooks.length} កងឯកសារ
            </span>
          </div>

          {/* Library Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedLibCategory}
                onChange={e => setSelectedLibCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold bg-slate-50 cursor-pointer"
              >
                <option value="all">គ្រប់ប្រភេទ / ប្រធានបទទាំងអស់</option>
                <option value="literature">📚 អក្សរសាស្ត្រ</option>
                <option value="science">🔬 វិទ្យាសាស្ត្រ</option>
                <option value="history">🏛️ ប្រវត្តិសាស្ត្រ</option>
                <option value="mathematics">📐 គណិតវិទ្យា</option>
                <option value="geography">🌍 ភូមិវិទ្យា & សង្គម</option>
                <option value="storybook">📖 រឿងនិទានកុមារ</option>
                <option value="core_textbook">📘 សៀវភៅពុម្ពគោល</option>
                <option value="reference">🔖 ឯកសារយោង</option>
                <option value="magazine">📰 ទស្សនាវដ្តី</option>
                <option value="general">📄 ចំណេះដឹងទូទៅ</option>
              </select>

              <select
                value={selectedLibFormat}
                onChange={e => setSelectedLibFormat(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold bg-slate-50 cursor-pointer"
              >
                <option value="all">គ្រប់ទម្រង់ (រូបវន្ត & ឌីជីថល)</option>
                <option value="physical">📖 សៀវភៅរូបវន្ត (Physical)</option>
                <option value="digital">💻 សៀវភៅឌីជីថល (Digital E-Book)</option>
              </select>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកចំណងជើងសៀវភៅ ឬអ្នកនិពន្ធ..."
                value={libSearchQuery}
                onChange={e => setLibSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Library Books Grid */}
          {filteredLibraryBooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">រកមិនឃើញសៀវភៅដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredLibraryBooks.map(book => (
                <div key={book.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={book.coverPhotoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                        alt={book.titleKhmer}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5">
                        {getCategoryLabel(book.category)}
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        {book.format === 'digital' ? (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">ឌីជីថល</span>
                        ) : (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">រូបវន្ត</span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <p className="text-[10px] font-mono text-amber-300 font-bold">{book.code}</p>
                        <p className="text-xs font-bold font-moul leading-tight line-clamp-1">{book.titleKhmer}</p>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">អ្នកនិពន្ធ៖</span>
                        <span className="font-semibold text-slate-800 line-clamp-1">{book.author || 'MoEYS'}</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">ទីតាំង/ទូ៖</span>
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {book.shelfLocation || 'ទូ A-01'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-slate-500">ស្តុកនៅសល់៖</span>
                        <span className="font-bold text-slate-900">
                          <span className="text-emerald-600 font-bold">{book.availableCopies}</span> / {book.totalCopies} ច្បាប់
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    {book.format === 'digital' ? (
                      <a
                        href={book.digitalFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>អានសៀវភៅឌីជីថល (Read E-Book)</span>
                      </a>
                    ) : (
                      <div className="text-center py-1 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-xl">
                        📖 មាននៅក្នុងបណ្ណាល័យសាលា (Physical)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MONTHLY FEEDBACK TO TEACHERS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-indigo-900">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-6 h-6 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-moul text-sm text-indigo-950">មតិផ្តាំផ្ញើ និងមតិយោបល់ប្រចាំខែមកលោកគ្រូអ្នកគ្រូ</h3>
                <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                  អាណាព្យាបាល ឬសិស្សានុសិស្សត្រូវសរសេរមតិផ្តាំផ្ញើ ឬមតិយោបល់លើលទ្ធផលសិក្សាកូនប្រចាំខែ <strong>យ៉ាងហោចណាស់១ខ្តង</strong> ដើម្បីឱ្យលោកគ្រូអ្នកគ្រូប្រចាំខែជ្រាប និងជួយអភិវឌ្ឍការសិក្សារបស់កូនៗបន្តទៀត។
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Feedback Submission Form */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="font-moul text-xs text-slate-800 border-b border-slate-100 pb-2">
                សរសេរមតិផ្តាំផ្ញើថ្មីប្រចាំខែ
              </h4>

              <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ជ្រើសរើសខែសិក្សា *</label>
                    <select
                      value={feedbackMonth}
                      onChange={e => setFeedbackMonth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50 cursor-pointer"
                    >
                      {['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'].map(m => (
                        <option key={m} value={m}>ខែ{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ឈ្មោះអ្នកផ្ញើ (អាណាព្យាបាល/សិស្ស) *</label>
                    <input
                      type="text"
                      required
                      value={feedbackAuthor}
                      onChange={e => setFeedbackAuthor(e.target.value)}
                      placeholder="ឧ. លោក ឆាយ សុផាត (អាណាព្យាបាល)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">មតិផ្តាំផ្ញើ និងការវាយតម្លៃលទ្ធផលសិក្សាកូន *</label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    placeholder="សរសេរមតិយោបល់ សំណូមពរ ឬការកោតសរសើរចំពោះការខិតខំប្រឹងប្រែងរបស់កូន និងការបង្រៀនរបស់លោកគ្រូអ្នកគ្រូប្រចាំខែ..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ផ្ញើមតិយោបល់ជូនលោកគ្រូអ្នកគ្រូប្រចាំខែ</span>
                </button>
              </form>
            </div>

            {/* Submitted Feedback History */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="font-moul text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>ប្រវត្តូមតិយោបល់ដែលបានផ្ញើ ({myFeedbacks.length})</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">បានបំពេញតាមកាតព្វកិច្ច ១ខែ/១ដង</span>
              </h4>

              {myFeedbacks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">មិនទាន់មានប្រវត្តិមតិយោបល់ប្រចាំខែនៅឡើយទេ។ សូមសរសេរមតិថ្មីខាងឆ្វេង។</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {myFeedbacks.map(fb => (
                    <div key={fb.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                          ខែ{fb.month} ({fb.academicYear})
                        </span>
                        <span className="text-[10px] text-slate-500 font-times">{fb.createdAt}</span>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed font-battambang">
                        {fb.comment}
                      </p>

                      {fb.teacherReply ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between text-emerald-900 font-bold">
                            <span className="flex items-center gap-1">
                              <span>💬 ការឆ្លើយតបពីលោកគ្រូ/អ្នកគ្រូ៖</span>
                            </span>
                            {fb.teacherRepliedAt && (
                              <span className="text-[10px] font-times text-emerald-700 font-normal">
                                {fb.teacherRepliedAt}
                              </span>
                            )}
                          </div>
                          <p className="text-emerald-950 font-battambang leading-relaxed">
                            {fb.teacherReply}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                          <span>⏳ កំពុងរង់ចាំលោកគ្រូអ្នកគ្រូប្រចាំខែពិនិត្យ និងវាយតម្លៃត្រឡប់មកវិញ...</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                        <span>អ្នកផ្ញើ៖ <strong className="text-slate-800">{fb.authorName}</strong></span>
                        <span className="text-emerald-700 font-bold">✓ បានបញ្ជូនរួចរាល់</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-moul text-sm text-slate-800">ប្តូរពាក្យសម្ងាត់គណនី</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ពាក្យសម្ងាត់ថ្មី</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="វាយពាក្យសម្ងាត់ម្តងទៀត"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs cursor-pointer"
                >
                  រក្សាទុកពាក្យសម្ងាត់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Password Verification Modal for Switching Back */}
      {showTeacherPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  🔐
                </div>
                <div>
                  <h3 className="font-moul text-sm text-slate-800 dark:text-slate-100">
                    ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់គ្រូ
                  </h3>
                  <p className="text-xs text-slate-500">
                    សូមបញ្ចូលពាក្យសម្ងាត់គណនីគ្រូ ដើម្បីត្រឡប់ទៅគណនីគ្រូវិញ
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTeacherPasswordModal(false);
                  setTeacherPasswordInput('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const res = switchToTeacherWithPassword(teacherPasswordInput);
                if (res.success) {
                  setShowTeacherPasswordModal(false);
                  setTeacherPasswordInput('');
                } else {
                  showToast(res.message || 'ពាក្យសម្ងាត់គ្រូមិនត្រឹមត្រូវទេ', 'error');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ពាក្យសម្ងាត់គណនីគ្រូ (Teacher Password)
                </label>
                <input
                  type="password"
                  placeholder="បញ្ចូលពាក្យសម្ងាត់គ្រូ..."
                  value={teacherPasswordInput}
                  onChange={(e) => setTeacherPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTeacherPasswordModal(false);
                    setTeacherPasswordInput('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  បញ្ជាក់ និងត្រឡប់ទៅគ្រូ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
