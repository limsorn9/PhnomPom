import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { RecentActivityDashboard } from './RecentActivityDashboard';
import { TeacherDailyAgendaPanel } from './TeacherDailyAgendaPanel';
import { SchoolActivityFeed } from './SchoolActivityFeed';
import { TeacherDailyTasks } from './TeacherDailyTasks';
import { QuickAttendanceModal } from './QuickAttendanceModal';
import { NewClassroomWizardModal } from './NewClassroomWizardModal';
import { AcademicTrendAnalysis } from './AcademicTrendAnalysis';
import { DirectorAcademicYearControl } from './DirectorAcademicYearControl';
import { QuickActionsHub } from './QuickActionsHub';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  CircleDollarSign,
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  FileSpreadsheet,
  QrCode,
  HeartPulse,
  BookOpenCheck,
  CheckCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  PieChart as PieChartIcon,
  MapPin,
  Facebook,
  Phone,
  ExternalLink,
  Building2,
  BadgeCheck,
  Calendar,
  ShieldCheck,
  Briefcase,
  BookOpen,
  ArrowRight,
  BookMarked,
  Tv,
  Library as LibraryIcon,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    students,
    teachers,
    classrooms,
    scores,
    attendanceRecords,
    budgetTransactions,
    calendarEvents,
    libraryBooks,
    teacherDailyTasks,
    currentUser,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    setActiveTab,
    schoolProfile,
    language,
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
    setGlobalActiveAcademicYear,
    openDirectorPinModal
  } = useSchool();

  // Determine initial dashboard mode based on current user role
  const isTeacherUser = currentUser?.role === 'teacher';
  const isStudentUser = currentUser?.role === 'student';
  const initialMode: 'director' | 'teacher' | 'student' = isStudentUser ? 'student' : (isTeacherUser ? 'teacher' : 'director');

  const [dashboardMode, setDashboardMode] = useState<'director' | 'teacher' | 'student'>(initialMode);
  const [isQuickAttOpen, setIsQuickAttOpen] = useState(false);
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);

  const handleRequestDashboardMode = (targetMode: 'director' | 'teacher' | 'student') => {
    if (currentUser?.role === 'student' && targetMode !== 'student') {
      return;
    }
    if (currentUser?.role === 'teacher' && targetMode === 'director') {
      return;
    }
    if (targetMode === 'director' && currentUser?.role !== 'director' && currentUser?.role !== 'super_admin' && currentUser?.role !== 'secretary') {
      return;
    }
    setDashboardMode(targetMode);
  };

  // Teacher-specific data filtering
  const teacherGrade = currentUser?.assignedGrade;
  const teacherSection = currentUser?.assignedSection;
  const assignedClassStudents = students.filter(s => {
    if (teacherGrade && s.grade !== teacherGrade) return false;
    if (teacherSection && s.section !== teacherSection) return false;
    return true;
  });
  const classFemaleStudents = assignedClassStudents.filter(s => s.gender === 'F').length;
  const classMaleStudents = assignedClassStudents.filter(s => s.gender === 'M').length;

  // Calculations for Director overview
  const totalStudents = students.length;
  const femaleStudents = students.filter(s => s.gender === 'F').length;
  const maleStudents = students.filter(s => s.gender === 'M').length;
  const femalePercent = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0;

  const totalTeachers = teachers.length;
  const femaleTeachers = teachers.filter(t => t.gender === 'F').length;

  const totalIncomeRiel = getTotalIncome();
  const totalExpenseRiel = getTotalExpense();
  const balanceRiel = getBalance();
  const balanceUsd = Math.round(balanceRiel / 4050);

  // Grade Distribution Data
  const gradeDistribution = [1, 2, 3, 4, 5, 6].map(g => {
    const gradeStudents = students.filter(s => s.grade === g);
    const boys = gradeStudents.filter(s => s.gender === 'M').length;
    const girls = gradeStudents.filter(s => s.gender === 'F').length;
    return {
      name: `ថ្នាក់ទី ${g}`,
      សិស្សប្រុស: boys,
      សិស្សស្រី: girls,
      សរុប: gradeStudents.length
    };
  });

  // Subject Averages Data
  const subjectAverages = [
    { subject: 'ភាសាខ្មែរ (អំណាន)', average: 8.7 },
    { subject: 'ភាសាខ្មែរ (សំណេរ)', average: 8.2 },
    { subject: 'គណិតវិទ្យា', average: 8.5 },
    { subject: 'វិទ្យាសាស្ត្រ-សង្គម', average: 8.6 },
    { subject: 'សីលធម៌-ពលរដ្ឋ', average: 9.1 },
    { subject: 'សិល្បៈ-កាយវិការ', average: 8.8 }
  ];

  // Weekly Attendance Trend Data
  const attendanceTrendData = [
    { day: 'ចន្ទ', វត្តមាន: 98.4, ច្បាប់: 1.2, ឥតច្បាប់: 0.4 },
    { day: 'អង្គារ', វត្តមាន: 97.8, ច្បាប់: 1.6, ឥតច្បាប់: 0.6 },
    { day: 'ពុធ', វត្តមាន: 99.1, ច្បាប់: 0.7, ឥតច្បាប់: 0.2 },
    { day: 'ព្រហស្បតិ៍', វត្តមាន: 98.0, ច្បាប់: 1.5, ឥតច្បាប់: 0.5 },
    { day: 'សុក្រ', វត្តមាន: 96.9, ច្បាប់: 2.3, ឥតច្បាប់: 0.8 },
    { day: 'សៅរ៍', វត្តមាន: 98.6, ច្បាប់: 1.1, ឥតច្បាប់: 0.3 },
  ];

  // Academic Score Distribution Data (A, B, C, D, E, F)
  const scoreDistributionData = [
    { grade: 'និទ្ទេស A (9-10)', count: scores.filter(s => s.averageScore >= 9).length || 28, fill: '#10b981' },
    { grade: 'និទ្ទេស B (8-8.9)', count: scores.filter(s => s.averageScore >= 8 && s.averageScore < 9).length || 45, fill: '#3b82f6' },
    { grade: 'និទ្ទេស C (7-7.9)', count: scores.filter(s => s.averageScore >= 7 && s.averageScore < 8).length || 38, fill: '#6366f1' },
    { grade: 'និទ្ទេស D (6-6.9)', count: scores.filter(s => s.averageScore >= 6 && s.averageScore < 7).length || 22, fill: '#f59e0b' },
    { grade: 'និទ្ទេស E (5-5.9)', count: scores.filter(s => s.averageScore >= 5 && s.averageScore < 6).length || 14, fill: '#ea580c' },
    { grade: 'និទ្ទេស F (<5.0)', count: scores.filter(s => s.averageScore < 5).length || 6, fill: '#ef4444' },
  ];

  // Budget Source Breakdown Data
  const budgetBySourceMap: { [key: string]: number } = {};
  budgetTransactions.forEach(tx => {
    if (tx.type === 'income') {
      budgetBySourceMap[tx.source] = (budgetBySourceMap[tx.source] || 0) + tx.amountRiel;
    }
  });

  const budgetSourceData = Object.keys(budgetBySourceMap).map(source => ({
    name: source,
    value: budgetBySourceMap[source]
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Health / Nutrition status count
  const normalNutrition = students.filter(s => s.health.nutritionStatus === 'normal').length;
  const underweightNutrition = students.filter(s => s.health.nutritionStatus === 'underweight').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Top Role-based Dashboard Mode Switcher Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Director Tab - Only for director, super_admin, secretary */}
          {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
            <button
              onClick={() => handleRequestDashboardMode('director')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                dashboardMode === 'director'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{language === 'en' ? 'Director Dashboard' : 'ដាស់បតនាយកសាលា'}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                dashboardMode === 'director' ? 'bg-blue-500/40 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {totalStudents} សិស្ស
              </span>
            </button>
          )}

          {/* Teacher Tab - for teacher, director, super_admin, secretary */}
          {currentUser?.role !== 'student' && currentUser?.role !== 'parent' && (
            <button
              onClick={() => handleRequestDashboardMode('teacher')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                dashboardMode === 'teacher'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{language === 'en' ? 'Teacher Hub' : 'ដាស់បតលោកគ្រូ-អ្នកគ្រូ'}</span>
              {currentUser?.assignedGrade && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${
                  dashboardMode === 'teacher' ? 'bg-sky-500/40 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  ថ្នាក់ទី {currentUser.assignedGrade}{currentUser.assignedSection ? `«${currentUser.assignedSection}»` : ''}
                </span>
              )}
            </button>
          )}

          {/* Student/Guardian Tab */}
          <button
            onClick={() => handleRequestDashboardMode('student')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              dashboardMode === 'student'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{language === 'en' ? 'Student & Guardian' : 'ដាស់បតសិស្ស & អាណាព្យាបាល'}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              dashboardMode === 'student' ? 'bg-emerald-500/40 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              សង្ខេប
            </span>
          </button>
        </div>

        {/* Academic Year Selector in Top Bar */}
        <div className="flex items-center flex-wrap gap-2 text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-xs">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ឆ្នាំសិក្សា៖</span>
          </div>
          <select
            id="dashboard-top-academic-year-select"
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            title="ជ្រើសរើសឆ្នាំសិក្សាដើម្បីមើលទិន្នន័យបណ្ណសារប្រវត្តិ និងស្ថិតិសាលា"
          >
            {academicYears.map((yr) => {
              const isOfficial = yr === schoolProfile.academicYear;
              return (
                <option key={yr} value={yr}>
                  {yr} {isOfficial ? '★ (ឆ្នាំគោលបច្ចុប្បន្ន)' : ''}
                </option>
              );
            })}
          </select>

          {selectedAcademicYear === schoolProfile.academicYear ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-md border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ឆ្នាំគោលសកម្ម</span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>ទិន្នន័យបណ្ណសារ</span>
              </span>

              {/* Director / Admin Button to set selected year as Global Active Base Year */}
              {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
                <button
                  type="button"
                  onClick={() => setGlobalActiveAcademicYear(selectedAcademicYear)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] rounded-lg shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="កំណត់ឆ្នាំសិក្សានេះជាឆ្នាំគោលសម្រាប់ប្រព័ន្ធ និងអ្នកប្រើប្រាស់ទាំងអស់"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>★ កំណត់ជាឆ្នាំគោល</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DIRECTOR DASHBOARD VIEW (Full school overview and administrative tools) */}
      {/* ========================================================================= */}
      {dashboardMode === 'director' && (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome & Overview Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-indigo-800/60">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                  <span className="bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm leading-normal">
                    <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                    <span>ស្តង់ដារសាលាបឋមសិក្សាគំរូ</span>
                  </span>
                  <span className="text-blue-200">ឆ្នាំសិក្សា {schoolProfile.academicYear}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-amber-300 font-mono">កូដសាលា: {schoolProfile.schoolCode}</span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-moul tracking-wide text-white leading-tight">
                    {schoolProfile.nameKhmer}
                  </h2>
                  <p className="text-amber-200/90 text-sm font-medium">
                    {schoolProfile.nameLatin}
                  </p>
                </div>

                {/* Geographical and Principal Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-200 pt-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>{schoolProfile.village} {schoolProfile.commune} {schoolProfile.district} {schoolProfile.province}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>នាយកសាលា: <strong className="text-white">{schoolProfile.principalName}</strong></span>
                  </div>
                  <a
                    href={`tel:${schoolProfile.principalPhone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-mono font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{schoolProfile.principalPhone}</span>
                  </a>
                </div>

                {/* Quick External Links Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {schoolProfile.mapUrl && (
                    <a
                      href={schoolProfile.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 rounded-lg text-xs text-red-200 hover:text-white transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>មើលទីតាំង Google Maps</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}
                  {schoolProfile.facebookPage && (
                    <a
                      href={schoolProfile.facebookPage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 rounded-lg text-xs text-sky-200 hover:text-white transition-colors"
                    >
                      <Facebook className="w-3.5 h-3.5 text-sky-400" />
                      <span>ទំព័រ Facebook ផ្លូវការ</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col gap-2 flex-shrink-0">
                <button
                  id="dash-add-student-btn"
                  onClick={() => setActiveTab('students')}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  ចុះឈ្មោះសិស្សថ្មី
                </button>
                <button
                  id="dash-record-score-btn"
                  onClick={() => setActiveTab('scores')}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-transform active:scale-95"
                >
                  <BookOpenCheck className="w-4 h-4 text-amber-300" />
                  បញ្ចូលពិន្ទុប្រចាំខែ
                </button>
                <button
                  id="dash-reports-btn"
                  onClick={() => setActiveTab('reports_qr')}
                  className="flex items-center justify-center gap-2 bg-indigo-800/90 hover:bg-indigo-800 border border-indigo-500/40 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-transform active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                  របាយការណ៍ MoEYS
                </button>
              </div>
            </div>
          </div>

          {/* Director Academic Year Data Selector (2016-2017 to 2050-2051) */}
          <DirectorAcademicYearControl />

          {/* Comprehensive Responsive Quick Actions Hub */}
          <QuickActionsHub currentMode={dashboardMode} onModeChange={handleRequestDashboardMode} />

          {/* Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Students */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">ចំនួនសិស្សសរុប</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</span>
                <span className="text-xs text-slate-500">នាក់</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>ស្រី: <strong className="text-rose-600">{femaleStudents}</strong> ({femalePercent}%)</span>
                <span>ប្រុស: <strong className="text-blue-600">{maleStudents}</strong></span>
              </div>
            </div>

            {/* Teachers and Staff */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">គ្រូបង្រៀន និងបុគ្គលិក</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalTeachers}</span>
                <span className="text-xs text-slate-500">រូប</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>គ្រូស្រី: <strong className="text-indigo-700">{femaleTeachers}</strong> រូប</span>
                <span className="text-emerald-600 font-medium">ពេញម៉ោង ១០០%</span>
              </div>
            </div>

            {/* Total Classrooms */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">បន្ទប់ថ្នាក់រៀន (ថ្នាក់ទី១ - ទី៦)</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{classrooms.length}</span>
                <span className="text-xs text-slate-500">បន្ទប់</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>សមាមាត្រសិស្ស/ថ្នាក់: ~{Math.round(totalStudents / (classrooms.length || 1))}</span>
                <span className="text-blue-600 font-medium">គ្រប់គ្រងបានល្អ</span>
              </div>
            </div>

            {/* Budget Balance */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">សមតុល្យថវិកាសាលា</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700">
                  {(balanceRiel / 1000000).toFixed(1)}M
                </span>
                <span className="text-xs font-medium text-slate-600">រៀល</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>ស្មើនឹង: <strong>~${balanceUsd.toLocaleString()}</strong></span>
                <span className="text-emerald-700 font-semibold">ស្ថិរភាពហិរញ្ញវត្ថុ</span>
              </div>
            </div>
          </div>

          {/* Main Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Enrollment by Grade */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">ស្ថិតិសិស្សតាមកម្រិតថ្នាក់ (ថ្នាក់ទី១ ដល់ទី៦)</h3>
                  <p className="text-xs text-slate-500">ការបែងចែកសិស្សប្រុស និងសិស្សស្រីតាមកម្រិតថ្នាក់នីមួយៗ</p>
                </div>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  មើលបញ្ជីសិស្ស <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip
                      formatter={(value, name) => [`${value} នាក់`, name]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="សិស្សប្រុស" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="សិស្សស្រី" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget Sources Pie Chart */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">ប្រភពថវិកាសាលា (Budget by Source)</h3>
                  <PieChartIcon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mb-4">សមាមាត្រចំណូលតាមប្រភពថវិការដ្ឋ និងដៃគូអភិវឌ្ឍន៍</p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {budgetSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)} លានរៀល`, 'ចំនួន']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-1.5 mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                {budgetSourceData.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {(item.value / 1000000).toFixed(1)}M ៛
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* School-wide Academic Trend Analysis Across 3 Trimesters (Recharts) */}
          <AcademicTrendAnalysis />

          {/* Attendance & Academic Performance Graphical Summary (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Weekly Attendance Trend (AreaChart) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">និន្នាការវត្តមានសិស្សប្រចាំសប្តាហ៍ (%)</h3>
                    <p className="text-xs text-slate-500">ការតាមដានអត្រាវត្តមាន ច្បាប់ និងអវត្តមានឥតច្បាប់</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  មធ្យម ៩៨.១%
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="excusedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} stroke="#64748b" unit="%" />
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}%`, name]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="វត្តមាន" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#attendanceGradient)" />
                    <Area type="monotone" dataKey="ច្បាប់" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#excusedGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Academic Score Breakdown by Grade Band (BarChart) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">ការបែងចែកនិទ្ទេសពិន្ទុរួម (Academic Grades)</h3>
                    <p className="text-xs text-slate-500">ចំនួនសិស្សទទួលបាននិទ្ទេស A ដល់ F ប្រចាំឆមាស</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('scores')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  តារាងពិន្ទុ <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="grade" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip
                      formatter={(value: any) => [`${value} នាក់`, 'ចំនួនសិស្ស']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {scoreDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Real-time School Activity Feed */}
          <SchoolActivityFeed maxItems={8} />

          {/* Recent Activity Tracking & Data Changes Audit Feed */}
          <RecentActivityDashboard />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEACHER DASHBOARD VIEW (Classroom, Attendance, Scores & Teaching Tools) */}
      {/* ========================================================================= */}
      {dashboardMode === 'teacher' && (
        <div className="space-y-6 animate-fade-in">
          {/* Teacher Welcome Banner */}
          <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-sky-800/60">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-sky-500/30 text-sky-200 border border-sky-400/40 px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-sky-300" />
                    <span>កន្លែងការងារលោកគ្រូ-អ្នកគ្រូ (Teacher Hub)</span>
                  </span>
                  {teacherGrade ? (
                    <span className="bg-amber-400 text-slate-950 font-bold px-3 py-0.5 rounded-full text-xs">
                      ទទួលបន្ទុកថ្នាក់ទី {teacherGrade} {teacherSection ? `«${teacherSection}»` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-300">គ្រូបង្រៀនមុខវិជ្ជា</span>
                  )}
                </div>

                <h2 className="text-2xl font-bold font-moul text-white">
                  សូមស្វាគមន៍, {currentUser?.nameKhmer || 'លោកគ្រូ / អ្នកគ្រូ'}
                </h2>
                <p className="text-sky-200 text-xs">
                  គ្រប់គ្រងវត្តមាន សិស្សក្នុងបន្ទុក បញ្ចូលពិន្ទុ និងរៀបចំកិច្ចតែងការបង្រៀនងាយស្រួល
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('homeroom_dashboard')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-transform active:scale-95 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  ចូលបន្ទុកថ្នាក់
                </button>
                <button
                  onClick={() => setIsQuickAttOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-transform active:scale-95 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  កត់វត្តមានថ្ងៃនេះ
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Quick Actions Hub */}
          <QuickActionsHub currentMode={dashboardMode} onModeChange={handleRequestDashboardMode} />

          {/* Teacher Class Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">សិស្សក្នុងបន្ទុក</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{assignedClassStudents.length}</span>
                <span className="text-xs text-slate-500">នាក់</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
                <span>ស្រី: <strong className="text-rose-600">{classFemaleStudents}</strong></span>
                <span>ប្រុស: <strong className="text-blue-600">{classMaleStudents}</strong></span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">កិច្ចការមិនទាន់បញ្ចប់</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-600">
                  {teacherDailyTasks.filter(t => !t.isCompleted).length}
                </span>
                <span className="text-xs text-slate-500">កិច្ចការ</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>កិច្ចការបន្ទាន់ត្រូវបញ្ចប់សប្តាហ៍នេះ</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">វត្តមានមធ្យម</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">98.4%</span>
                <span className="text-xs text-slate-500">អត្រាល្អ</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>វត្តមានទៀងទាត់ក្នុងថ្នាក់</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">ជំនួយការ AI</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-bold text-purple-700">AI Teacher Ready</span>
              </div>
              <button
                onClick={() => setActiveTab('ai_teacher')}
                className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 border-t border-slate-100 dark:border-slate-800 pt-2 w-full"
              >
                <span>បង្កើតកិច្ចតែងការ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Teacher Daily Tasks - Priority Sorted */}
          <TeacherDailyTasks />

          {/* Teacher Daily Agenda & Google Calendar Schedule */}
          <TeacherDailyAgendaPanel />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STUDENT & GUARDIAN DASHBOARD VIEW (Clean, lightweight & student-focused) */}
      {/* ========================================================================= */}
      {dashboardMode === 'student' && (
        <div className="space-y-6 animate-fade-in">
          {/* Student Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-emerald-800/60">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                    <span>ព័ត៌មានសិស្ស & អាណាព្យាបាល (Student & Guardian Portal)</span>
                  </span>
                </div>

                <h2 className="text-2xl font-bold font-moul text-white">
                  សាលាបឋមសិក្សា {schoolProfile.nameKhmer}
                </h2>
                <p className="text-emerald-200 text-xs">
                  «ការសិក្សាដើម្បីអភិវឌ្ឍចំណេះដឹង ជំនាញ វិន័យ និងគុណធម៌» • ឆ្នាំសិក្សា {schoolProfile.academicYear}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('student_portal')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 shrink-0"
              >
                <GraduationCap className="w-4 h-4" />
                ចូលគណនីសិស្សផ្ទាល់ខ្លួន
              </button>
            </div>
          </div>

          {/* Student & Guardian Quick Actions Hub */}
          <QuickActionsHub currentMode={dashboardMode} onModeChange={handleRequestDashboardMode} />

          {/* Student Highlights & Notices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Academic Events */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">កាលបរិច្ឆេទសំខាន់ៗបន្ទាប់</h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                >
                  មើលប្រតិទិនពេញ
                </button>
              </div>

              <div className="space-y-2">
                {calendarEvents.slice(0, 3).map((event, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">{event.title}</h5>
                      <p className="text-slate-500 text-[11px] mt-0.5">{event.description || 'ព្រឹត្តិការណ៍សាលា'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold font-mono text-[10px] whitespace-nowrap">
                      {event.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* School Conduct & Good Student Guidelines */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">គោលការណ៍សិស្សល្អ និងវិន័យសាលា</h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>មកសាលារៀនឱ្យបានទៀងទាត់មុនម៉ោង ៧:០០ ព្រឹក និងម៉ោង ១:០០ រសៀល។</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>ស្លៀកពាក់ឯកសណ្ឋានសិស្សឱ្យបានត្រឹមត្រូវ និងរក្សាអនាម័យខ្លួនប្រាណ។</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>ខិតខំរៀនសូត្រ ធ្វើកិច្ចការផ្ទះ និងគោរពលោកគ្រូអ្នកគ្រូ និងមិត្តភក្តិ។</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Attendance Modal */}
      <QuickAttendanceModal isOpen={isQuickAttOpen} onClose={() => setIsQuickAttOpen(false)} />

      {/* New Classroom Setup Wizard Modal */}
      <NewClassroomWizardModal isOpen={isNewClassOpen} onClose={() => setIsNewClassOpen(false)} />
    </div>
  );
};

