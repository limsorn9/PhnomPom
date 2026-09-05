import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { RecentActivityDashboard } from './RecentActivityDashboard';
import { TeacherDailyAgendaPanel } from './TeacherDailyAgendaPanel';
import { SchoolActivityFeed } from './SchoolActivityFeed';
import { TeacherDailyTasks } from './TeacherDailyTasks';
import { QuickAttendanceModal } from './QuickAttendanceModal';
import { NewClassroomWizardModal } from './NewClassroomWizardModal';
import { AcademicTrendAnalysis } from './AcademicTrendAnalysis';
import { DirectorAcademicYearControl } from './DirectorAcademicYearControl';
import { toKhmerNum } from '../data/initialData';
import { ActiveTab } from '../types';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  CircleDollarSign,
  TrendingUp,
  Award,
  ArrowUpRight,
  UserPlus,
  FileSpreadsheet,
  QrCode,
  HeartPulse,
  BookOpenCheck,
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
  BookOpen,
  ArrowRight,
  FileText,
  AlertCircle,
  Check,
  Layers,
  ChevronRight,
  Activity,
  BarChart3,
  SlidersHorizontal,
  BookmarkCheck,
  Zap,
  Flame,
  ArrowRightLeft,
  Tv,
  Library as LibraryIcon,
  Home,
  Bot
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

interface DashboardProps {
  onOpenMobileMenu?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenMobileMenu }) => {
  const {
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    calendarEvents,
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
    setGlobalActiveAcademicYear
  } = useSchool();

  // Role modes: Director, Teacher, Student
  const isTeacherUser = currentUser?.role === 'teacher';
  const isStudentUser = currentUser?.role === 'student' || currentUser?.role === 'parent';
  const initialMode: 'director' | 'teacher' | 'student' = isStudentUser
    ? 'student'
    : isTeacherUser
    ? 'teacher'
    : 'director';

  const [dashboardMode, setDashboardMode] = useState<'director' | 'teacher' | 'student'>(initialMode);
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics' | 'tools' | 'activity' | 'academic_years'>('overview');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'enrollment' | 'attendance' | 'grades' | 'budget' | 'trimesters'>('enrollment');
  const [isQuickAttOpen, setIsQuickAttOpen] = useState(false);
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);

  // Role mode switcher handler with permission check
  const handleRequestDashboardMode = (targetMode: 'director' | 'teacher' | 'student') => {
    if (currentUser?.role === 'student' && targetMode !== 'student') return;
    if (currentUser?.role === 'teacher' && targetMode === 'director') return;
    if (
      targetMode === 'director' &&
      currentUser?.role !== 'director' &&
      currentUser?.role !== 'super_admin' &&
      currentUser?.role !== 'secretary'
    ) {
      return;
    }
    setDashboardMode(targetMode);
  };

  // Teacher-specific data
  const teacherGrade = currentUser?.assignedGrade;
  const teacherSection = currentUser?.assignedSection;
  const assignedClassStudents = useMemo(() => {
    return students.filter(s => {
      if (teacherGrade && s.grade !== teacherGrade) return false;
      if (teacherSection && s.section !== teacherSection) return false;
      return true;
    });
  }, [students, teacherGrade, teacherSection]);

  const classFemaleStudents = assignedClassStudents.filter(s => s.gender === 'F').length;
  const classMaleStudents = assignedClassStudents.filter(s => s.gender === 'M').length;

  // Director KPI statistics
  const totalStudents = students.length;
  const femaleStudents = students.filter(s => s.gender === 'F').length;
  const maleStudents = students.filter(s => s.gender === 'M').length;
  const femalePercent = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0;

  const totalTeachers = teachers.length;
  const femaleTeachers = teachers.filter(t => t.gender === 'F').length;
  const femaleTeacherPercent = totalTeachers > 0 ? Math.round((femaleTeachers / totalTeachers) * 100) : 0;

  const totalClassrooms = classrooms.length;
  const balanceRiel = getBalance();
  const balanceUsd = Math.round(balanceRiel / 4050);

  // Grade Distribution Data
  const gradeDistribution = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map(g => {
      const gradeStudents = students.filter(s => s.grade === g);
      const boys = gradeStudents.filter(s => s.gender === 'M').length;
      const girls = gradeStudents.filter(s => s.gender === 'F').length;
      return {
        name: `ថ្នាក់ទី ${toKhmerNum(g)}`,
        សិស្សប្រុស: boys,
        សិស្សស្រី: girls,
        សរុប: gradeStudents.length
      };
    });
  }, [students]);

  // Weekly Attendance Trend Data
  const attendanceTrendData = useMemo(() => [
    { day: 'ចន្ទ', វត្តមាន: 98.4, ច្បាប់: 1.2, ឥតច្បាប់: 0.4 },
    { day: 'អង្គារ', វត្តមាន: 97.8, ច្បាប់: 1.6, ឥតច្បាប់: 0.6 },
    { day: 'ពុធ', វត្តមាន: 99.1, ច្បាប់: 0.7, ឥតច្បាប់: 0.2 },
    { day: 'ព្រហស្បតិ៍', វត្តមាន: 98.0, ច្បាប់: 1.5, ឥតច្បាប់: 0.5 },
    { day: 'សុក្រ', វត្តមាន: 96.9, ច្បាប់: 2.3, ឥតច្បាប់: 0.8 },
    { day: 'សៅរ៍', វត្តមាន: 98.6, ច្បាប់: 1.1, ឥតច្បាប់: 0.3 },
  ], []);

  // Academic Score Distribution Data (A to F)
  const scoreDistributionData = useMemo(() => [
    { grade: 'និទ្ទេស A (៩-១០)', count: scores.filter(s => s.averageScore >= 9).length || 28, fill: '#10b981' },
    { grade: 'និទ្ទេស B (៨-៨.៩)', count: scores.filter(s => s.averageScore >= 8 && s.averageScore < 9).length || 45, fill: '#3b82f6' },
    { grade: 'និទ្ទេស C (៧-៧.៩)', count: scores.filter(s => s.averageScore >= 7 && s.averageScore < 8).length || 38, fill: '#6366f1' },
    { grade: 'និទ្ទេស D (៦-៦.៩)', count: scores.filter(s => s.averageScore >= 6 && s.averageScore < 7).length || 22, fill: '#f59e0b' },
    { grade: 'និទ្ទេស E (៥-៥.៩)', count: scores.filter(s => s.averageScore >= 5 && s.averageScore < 6).length || 14, fill: '#ea580c' },
    { grade: 'និទ្ទេស F (< ៥.០)', count: scores.filter(s => s.averageScore < 5).length || 6, fill: '#ef4444' },
  ], [scores]);

  // Budget Source Breakdown Data
  const budgetSourceData = useMemo(() => {
    const map: { [key: string]: number } = {};
    budgetTransactions.forEach(tx => {
      if (tx.type === 'income') {
        map[tx.source] = (map[tx.source] || 0) + tx.amountRiel;
      }
    });
    return Object.keys(map).map(source => ({
      name: source,
      value: map[source]
    }));
  }, [budgetTransactions]);

  const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  // Categorized Quick Actions for Professional School Management
  const quickActionGroups = [
    {
      category: 'admin',
      title: 'ការងាររដ្ឋបាល & សិស្ស',
      description: 'គ្រប់គ្រងបញ្ជីឈ្មោះ ផ្ទេរសិស្ស និងលិខិតរដ្ឋបាល',
      color: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      actions: [
        { id: 'students', label: 'ចុះឈ្មោះ & បញ្ជីសិស្ស', sub: `${totalStudents} នាក់`, icon: UserPlus, tab: 'students' as ActiveTab },
        { id: 'transfers', label: 'លិខិតផ្ទេរសិស្ស MoEYS', sub: 'ចេញ-ចូល', icon: ArrowRightLeft, tab: 'transfers' as ActiveTab },
        { id: 'official_documents', label: 'ឯកសាររដ្ឋបាល & បោះពុម្ព', sub: 'លិខិតផ្លូវការ', icon: FileSpreadsheet, tab: 'official_documents' as ActiveTab },
        { id: 'household_census', label: 'ជំរឿនខ្នងផ្ទះ & ផែនទី', sub: 'តំបន់សាលា', icon: Home, tab: 'household_census' as ActiveTab }
      ]
    },
    {
      category: 'academic',
      title: 'ការបង្រៀន & លទ្ធផលសិក្សា',
      description: 'បញ្ចូលពិន្ទុ កិច្ចតែងការ AI និងបន្ទុកថ្នាក់រៀន',
      color: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
      actions: [
        { id: 'scores', label: 'បញ្ចូលពិន្ទុ & ចំណាត់ថ្នាក់', sub: 'ប្រចាំខែ/ឆមាស', icon: BookOpenCheck, tab: 'scores' as ActiveTab },
        { id: 'homeroom', label: 'បន្ទុកថ្នាក់រៀន (Homeroom)', sub: `${totalClassrooms} ថ្នាក់`, icon: Award, tab: 'homeroom_dashboard' as ActiveTab },
        { id: 'ai_teacher', label: 'ជំនួយការបង្រៀន AI', sub: 'កិច្ចតែងការ & ស្លាយ', icon: Sparkles, tab: 'ai_teacher' as ActiveTab },
        { id: 'teaching_resources', label: 'មជ្ឈមណ្ឌលធនធានបង្រៀន', sub: 'Drive ឯកសារ', icon: BookOpen, tab: 'teaching_resources' as ActiveTab }
      ]
    },
    {
      category: 'attendance',
      title: 'វត្តមាន សុខភាព & បណ្ណាល័យ',
      description: 'ស្កេន QR វត្តមានប្រចាំថ្ងៃ និងសៀវភៅបណ្ណាល័យ',
      color: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      actions: [
        { id: 'quick_att', label: 'ស្កេន QR / កត់វត្តមាន', sub: '១-Tap រហ័ស', icon: QrCode, onClick: () => setIsQuickAttOpen(true) },
        { id: 'attendance_health', label: 'វត្តមាន & សុខភាពសិស្ស', sub: 'អាហារូបត្ថម្ភ', icon: HeartPulse, tab: 'attendance_health' as ActiveTab },
        { id: 'library', label: 'បណ្ណាល័យ & សៀវភៅ', sub: 'ចរាចរណ៍សៀវភៅ', icon: LibraryIcon, tab: 'library' as ActiveTab },
        { id: 'equipment_loans', label: 'ខ្ចី-សង ឧបករណ៍សាលា', sub: 'Tablet / TV', icon: Tv, tab: 'equipment_loans' as ActiveTab }
      ]
    },
    {
      category: 'finance',
      title: 'ហិរញ្ញវត្ថុ & របាយការណ៍ MoEYS',
      description: 'តាមដានថវិការដ្ឋ កម្មវិធី PB និងការជូនដំណឹង',
      color: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20',
      badgeColor: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300',
      actions: [
        { id: 'finance', label: 'ថវិកាសាលា & ចំណូល-ចំណាយ', sub: `${(balanceRiel / 1000000).toFixed(1)}M ៛`, icon: CircleDollarSign, tab: 'finance' as ActiveTab },
        { id: 'reports_qr', label: 'តារាងស្ថិតិ & MoEYS EMIS', sub: 'ទម្រង់ស្តង់ដារ', icon: FileSpreadsheet, tab: 'reports_qr' as ActiveTab },
        { id: 'school_management', label: 'ស្តង់ដារសាលាគំរូទាំង ៥', sub: '២៧ សូចនាករ', icon: School, tab: 'school_management' as ActiveTab },
        { id: 'telegram_bot', label: 'ប្រព័ន្ធ Telegram Alert', sub: 'ផ្ញើទៅអាណាព្យាបាល', icon: Bot, tab: 'telegram_bot' as ActiveTab }
      ]
    }
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 font-battambang">
      {/* 1. TOP DIGNIFIED SCHOOL IDENTITY BANNER (Cambodian MoEYS Standard) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white shadow-md border border-indigo-900/50 p-4 sm:p-6">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* School Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[11px] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                <span>ស្តង់ដារសាលាបឋមសិក្សាគំរូ</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-700/60 font-medium text-[11px]">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>ឆ្នាំសិក្សា {selectedAcademicYear}</span>
                {selectedAcademicYear === schoolProfile.academicYear && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                )}
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 text-[11px]">
                <span>កូដសាលា៖</span>
                <strong className="text-amber-300 font-mono">{schoolProfile.schoolCode}</strong>
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-moul tracking-wide text-white leading-snug">
                {schoolProfile.nameKhmer}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/90 font-medium">
                {schoolProfile.nameLatin} • {schoolProfile.commune || 'ឃុំ'}, {schoolProfile.district || 'ស្រុក'}, {schoolProfile.province || 'ខេត្ត'}
              </p>
            </div>

            {/* Principal & Quick Contact */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-0.5">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>នាយកសាលា៖ <strong className="text-white">{schoolProfile.principalName}</strong></span>
              </div>
              <a
                href={`tel:${schoolProfile.principalPhone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-mono font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{schoolProfile.principalPhone}</span>
              </a>
              {schoolProfile.mapUrl && (
                <a
                  href={schoolProfile.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-red-300 hover:text-red-200 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Direct Shortcut Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={() => setActiveTab('students')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ចុះឈ្មោះសិស្ស</span>
            </button>

            <button
              onClick={() => setIsQuickAttOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer min-h-[44px]"
            >
              <QrCode className="w-4 h-4" />
              <span>កត់វត្តមាន</span>
            </button>

            <button
              onClick={() => setActiveTab('scores')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer min-h-[44px]"
            >
              <BookOpenCheck className="w-4 h-4 text-amber-300" />
              <span>បញ្ចូលពិន្ទុ</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. ORDERLY ROLE VIEW & SECTION SELECTOR TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
        {/* Row 1: Role Persona Switcher (Director, Teacher, Student) */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {/* Director Button */}
            {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
              <button
                onClick={() => handleRequestDashboardMode('director')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dashboardMode === 'director'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>នាយកសាលា</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  dashboardMode === 'director' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {totalStudents}
                </span>
              </button>
            )}

            {/* Teacher Button */}
            {currentUser?.role !== 'student' && currentUser?.role !== 'parent' && (
              <button
                onClick={() => handleRequestDashboardMode('teacher')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dashboardMode === 'teacher'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>លោកគ្រូ-អ្នកគ្រូ</span>
                {teacherGrade && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    dashboardMode === 'teacher' ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-700'
                  }`}>
                    ថ្នាក់ទី {toKhmerNum(teacherGrade)}
                  </span>
                )}
              </button>
            )}

            {/* Student & Guardian Button */}
            <button
              onClick={() => handleRequestDashboardMode('student')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dashboardMode === 'student'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>សិស្ស & អាណាព្យាបាល</span>
            </button>
          </div>

          {/* Quick Academic Year Pill with Switch Action */}
          <div className="hidden md:flex items-center gap-2 text-xs pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <span className="text-slate-500 text-[11px]">ឆ្នាំសិក្សា៖</span>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              {academicYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr} {yr === schoolProfile.academicYear ? '★ (ឆ្នាំគោល)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Sub-view Tab Navigation (Overview, Analytics, Tools, Activity, Academic Years) */}
        {dashboardMode === 'director' && (
          <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSection('overview')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSection === 'overview'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>ទិដ្ឋភាពទូទៅ (Overview)</span>
            </button>

            <button
              onClick={() => setActiveSection('analytics')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSection === 'analytics'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>ស្ថិតិ & ក្រាហ្វិក (Analytics)</span>
            </button>

            <button
              onClick={() => setActiveSection('tools')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSection === 'tools'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>ឧបករណ៍ & សកម្មភាព (Tools)</span>
            </button>

            <button
              onClick={() => setActiveSection('activity')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSection === 'activity'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>សកម្មភាពថ្មីៗ (Activity)</span>
            </button>

            <button
              onClick={() => setActiveSection('academic_years')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSection === 'academic_years'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>បណ្ណសារឆ្នាំសិក្សា (Archives)</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. DIRECTOR DASHBOARD - TABBED WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      {dashboardMode === 'director' && (
        <div className="space-y-6">
          {/* SECTION A: OVERVIEW (Key Metric Cards + Fast Categorized Hub + Snapshot) */}
          {activeSection === 'overview' && (
            <div className="space-y-5 animate-fade-in">
              {/* 4 Executive KPI Cards (Optimized 2x2 on mobile, 4-col on desktop) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Students */}
                <div
                  onClick={() => setActiveTab('students')}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">សិស្សសរុប</span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{totalStudents}</span>
                    <span className="text-xs text-slate-500">នាក់</span>
                  </div>
                  {/* Progress bar of gender ratio */}
                  <div className="mt-2.5">
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div style={{ width: `${femalePercent}%` }} className="bg-rose-500 h-full" title={`ស្រី ${femalePercent}%`} />
                      <div style={{ width: `${100 - femalePercent}%` }} className="bg-blue-600 h-full" title={`ប្រុស ${100 - femalePercent}%`} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>ស្រី៖ <strong className="text-rose-600">{femaleStudents}</strong> ({femalePercent}%)</span>
                      <span>ប្រុស៖ <strong className="text-blue-600">{maleStudents}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 2. Teachers & Staff */}
                <div
                  onClick={() => setActiveTab('teachers')}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">គ្រូបង្រៀន</span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{totalTeachers}</span>
                    <span className="text-xs text-slate-500">នាក់</span>
                  </div>
                  <div className="mt-2.5 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span>ស្រី៖ <strong className="text-emerald-700 dark:text-emerald-400">{femaleTeachers} នាក់</strong></span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-[9px]">
                      ១០០% ពេញម៉ោង
                    </span>
                  </div>
                </div>

                {/* 3. Classrooms */}
                <div
                  onClick={() => setActiveTab('classrooms')}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ថ្នាក់រៀនសរុប</span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <School className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{totalClassrooms}</span>
                    <span className="text-xs text-slate-500">ថ្នាក់</span>
                  </div>
                  <div className="mt-2.5 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span>ថ្នាក់ទី១ ដល់ទី៦</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">~{Math.round(totalStudents / (totalClassrooms || 1))} សិស្ស/ថ្នាក់</span>
                  </div>
                </div>

                {/* 4. Attendance Rate & Finance Balance */}
                <div
                  onClick={() => setActiveTab('finance')}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">វត្តមាន & ថវិកា</span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CircleDollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">៩៨.៤%</span>
                    <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50">
                      វត្តមានល្អ
                    </span>
                  </div>
                  <div className="mt-2.5 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span>សមតុល្យថវិកា៖</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {(balanceRiel / 1000000).toFixed(1)}M ៛
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorized Professional Quick Action Hub (Organized into 4 clean cards) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-moul flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>សកម្មភាព និងការងារប្រចាំថ្ងៃ</span>
                  </h3>
                  <button
                    onClick={() => setActiveSection('tools')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>មើលឧបករណ៍ទាំងអស់</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                  {quickActionGroups.map((grp) => (
                    <div
                      key={grp.category}
                      className={`rounded-2xl p-4 border ${grp.color} bg-white dark:bg-slate-900 shadow-2xs space-y-3`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-kantumruy">
                          {grp.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${grp.badgeColor}`}>
                          ៤ មុខងារ
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {grp.actions.map((act) => {
                          const IconComponent = act.icon;
                          return (
                            <button
                              key={act.id}
                              onClick={() => {
                                if (act.onClick) {
                                  act.onClick();
                                } else if (act.tab) {
                                  setActiveTab(act.tab);
                                }
                              }}
                              className="flex flex-col items-start p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left border border-slate-200/60 dark:border-slate-700/60 active:scale-95 transition-all group cursor-pointer min-h-[58px]"
                            >
                              <div className="flex items-center gap-1.5 w-full">
                                <IconComponent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                  {act.label}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                                {act.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fast Visual Snapshot: Enrollment Chart + Today's School Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Enrollment preview bar chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-kantumruy">
                        ស្ថិតិសិស្សតាមកម្រិតថ្នាក់ (ថ្នាក់ទី១ ដល់ទី៦)
                      </h4>
                      <p className="text-[11px] text-slate-500">ការបែងចែកសិស្សប្រុស និងសិស្សស្រី</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSection('analytics');
                        setAnalyticsSubTab('enrollment');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>មើលលម្អិត</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                        <Tooltip
                          formatter={(value, name) => [`${value} នាក់`, name]}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                        <Bar dataKey="សិស្សប្រុស" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="សិស្សស្រី" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Upcoming Events & Operational Checklist */}
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-kantumruy">
                          កាលវិភាគ & ព្រឹត្តិការណ៍
                        </h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('calendar')}
                        className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        ប្រតិទិន
                      </button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {calendarEvents.slice(0, 3).map((ev, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-2 text-xs">
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ev.title}</h5>
                            <p className="text-slate-400 text-[10px] mt-0.5">{ev.description || 'ព្រឹត្តិការណ៍សាលា'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold shrink-0">
                            {ev.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveSection('activity')}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>មើលប្រវត្តិសកម្មភាពសាលា</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION B: ANALYTICS HUB (Interactive Segmented Charts) */}
          {activeSection === 'analytics' && (
            <div className="space-y-4 animate-fade-in">
              {/* Sub-tabs for Analytics */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setAnalyticsSubTab('enrollment')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    analyticsSubTab === 'enrollment'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  ស្ថិតិសិស្សតាមកម្រិតថ្នាក់
                </button>

                <button
                  onClick={() => setAnalyticsSubTab('attendance')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    analyticsSubTab === 'attendance'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  និន្នាការវត្តមានប្រចាំសប្តាហ៍
                </button>

                <button
                  onClick={() => setAnalyticsSubTab('grades')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    analyticsSubTab === 'grades'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  ការបែងចែកនិទ្ទេសពិន្ទុ (A-F)
                </button>

                <button
                  onClick={() => setAnalyticsSubTab('budget')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    analyticsSubTab === 'budget'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  ប្រភពថវិកាសាលា
                </button>

                <button
                  onClick={() => setAnalyticsSubTab('trimesters')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    analyticsSubTab === 'trimesters'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  ការវិភាគនិន្នាការ ៣ ត្រីមាស
                </button>
              </div>

              {/* Tab 1: Enrollment */}
              {analyticsSubTab === 'enrollment' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">
                        ស្ថិតិសិស្សតាមកម្រិតថ្នាក់ (ថ្នាក់ទី១ ដល់ទី៦)
                      </h3>
                      <p className="text-xs text-slate-500">ការបែងចែកសិស្សប្រុស សិស្សស្រី និងចំនួនថ្នាក់រៀនសរុប</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('students')}
                      className="text-xs text-blue-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      មើលបញ្ជីសិស្សពេញ <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-72 w-full">
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
              )}

              {/* Tab 2: Attendance Weekly Trend */}
              {analyticsSubTab === 'attendance' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">
                        និន្នាការវត្តមានសិស្សប្រចាំសប្តាហ៍ (%)
                      </h3>
                      <p className="text-xs text-slate-500">ការតាមដានអត្រាវត្តមាន ច្បាប់ និងអវត្តមានឥតច្បាប់</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      មធ្យម ៩៨.១%
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="excusedGrad" x1="0" y1="0" x2="0" y2="1">
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
                        <Area type="monotone" dataKey="វត្តមាន" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#attGrad)" />
                        <Area type="monotone" dataKey="ច្បាប់" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#excusedGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tab 3: Grades Distribution */}
              {analyticsSubTab === 'grades' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">
                        ការបែងចែកនិទ្ទេសពិន្ទុរួម (Academic Grades A-F)
                      </h3>
                      <p className="text-xs text-slate-500">ចំនួនសិស្សទទួលបាននិទ្ទេស A ដល់ F ប្រចាំឆមាស</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('scores')}
                      className="text-xs text-indigo-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      តារាងពិន្ទុ <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-72 w-full">
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
              )}

              {/* Tab 4: Budget */}
              {analyticsSubTab === 'budget' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-kantumruy">
                        ប្រភពថវិកាសាលា (Budget by Source)
                      </h3>
                      <PieChartIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mb-4">សមាមាត្រចំណូលតាមប្រភពថវិការដ្ឋ និងដៃគូអភិវឌ្ឍន៍</p>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={budgetSourceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {budgetSourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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

                  <div className="flex flex-col justify-center space-y-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">បញ្ជីប្រភពថវិកា</h4>
                    <div className="space-y-2">
                      {budgetSourceData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {(item.value / 1000000).toFixed(1)}M ៛
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab('finance')}
                      className="mt-3 w-full py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 cursor-pointer"
                    >
                      គ្រប់គ្រងបញ្ជីថវិកាពេញលេញ
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 5: Trimester Analysis */}
              {analyticsSubTab === 'trimesters' && (
                <div className="space-y-4">
                  <AcademicTrendAnalysis />
                </div>
              )}
            </div>
          )}

          {/* SECTION C: ALL TOOLS & ACTIONS (Categorized, Comprehensive & Clean) */}
          {activeSection === 'tools' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-moul">
                  ឧបករណ៍ និងប្រព័ន្ធគ្រប់គ្រងសាលារៀនកម្រិតអាជីព
                </h3>
                <p className="text-xs text-slate-500">
                  ជ្រើសរើសផ្នែកការងាររដ្ឋបាល ការបង្រៀន វត្តមាន និងហិរញ្ញវត្ថុដើម្បីចូលប្រើប្រាស់ដោយផ្ទាល់
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {quickActionGroups.map((grp) => (
                  <div
                    key={grp.category}
                    className={`rounded-2xl p-5 border ${grp.color} bg-white dark:bg-slate-900 shadow-xs space-y-4`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-moul">
                          {grp.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{grp.description}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${grp.badgeColor}`}>
                        ៤ មុខងារ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {grp.actions.map((act) => {
                        const Icon = act.icon;
                        return (
                          <button
                            key={act.id}
                            onClick={() => {
                              if (act.onClick) act.onClick();
                              else if (act.tab) setActiveTab(act.tab);
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 text-left transition-all active:scale-95 group cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-2xs border border-slate-200 dark:border-slate-600 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                {act.label}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                                {act.sub}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION D: ACTIVITY & AUDIT TRAILS */}
          {activeSection === 'activity' && (
            <div className="space-y-6 animate-fade-in">
              <SchoolActivityFeed />
              <RecentActivityDashboard />
            </div>
          )}

          {/* SECTION E: ACADEMIC YEAR CONTROLS & ARCHIVES */}
          {activeSection === 'academic_years' && (
            <div className="space-y-6 animate-fade-in">
              <DirectorAcademicYearControl />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TEACHER HUB DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {dashboardMode === 'teacher' && (
        <div className="space-y-6 animate-fade-in">
          {/* Teacher Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-sky-900/60">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-sky-500/30 text-sky-200 border border-sky-400/40 px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-sky-300" />
                    <span>កន្លែងការងារលោកគ្រូ-អ្នកគ្រូ (Teacher Hub)</span>
                  </span>
                  {teacherGrade && (
                    <span className="bg-amber-400 text-slate-950 font-bold px-3 py-0.5 rounded-full text-xs">
                      ទទួលបន្ទុកថ្នាក់ទី {toKhmerNum(teacherGrade)} {teacherSection ? `«${teacherSection}»` : ''}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-moul text-white">
                  សូមស្វាគមន៍, {currentUser?.nameKhmer || 'លោកគ្រូ / អ្នកគ្រូ'}
                </h2>
                <p className="text-sky-200 text-xs">
                  គ្រប់គ្រងវត្តមាន សិស្សក្នុងបន្ទុក បញ្ចូលពិន្ទុ និងរៀបចំកិច្ចតែងការបង្រៀន AI ដោយភាពងាយស្រួល
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('homeroom_dashboard')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>ចូលបន្ទុកថ្នាក់</span>
                </button>
                <button
                  onClick={() => setIsQuickAttOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>កត់វត្តមានថ្ងៃនេះ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Class Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">សិស្សក្នុងបន្ទុក</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{assignedClassStudents.length}</span>
                <span className="text-xs text-slate-500">នាក់</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
                <span>ស្រី៖ <strong className="text-rose-600">{classFemaleStudents}</strong></span>
                <span>ប្រុស៖ <strong className="text-blue-600">{classMaleStudents}</strong></span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">កិច្ចការមិនទាន់ចប់</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-600 font-mono">
                  {teacherDailyTasks.filter(t => !t.isCompleted).length}
                </span>
                <span className="text-xs text-slate-500">កិច្ចការ</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>កិច្ចការបន្ទាន់ត្រូវបញ្ចប់សប្តាហ៍នេះ</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">វត្តមានមធ្យម</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600 font-mono">៩៨.៤%</span>
                <span className="text-xs text-emerald-500 font-bold">ល្អណាស់</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>វត្តមានទៀងទាត់ក្នុងថ្នាក់</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">ជំនួយការ AI</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-sm font-bold text-purple-700">AI Teacher Ready</span>
              </div>
              <button
                onClick={() => setActiveTab('ai_teacher')}
                className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 border-t border-slate-100 dark:border-slate-800 pt-2 w-full cursor-pointer"
              >
                <span>បង្កើតកិច្ចតែងការ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Teacher Daily Tasks & Agenda */}
          <TeacherDailyTasks />
          <TeacherDailyAgendaPanel />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STUDENT & GUARDIAN DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {dashboardMode === 'student' && (
        <div className="space-y-6 animate-fade-in">
          {/* Student Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-900/60">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                    <span>ព័ត៌មានសិស្ស & អាណាព្យាបាល (Student & Guardian Portal)</span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-moul text-white">
                  សាលាបឋមសិក្សា {schoolProfile.nameKhmer}
                </h2>
                <p className="text-emerald-200 text-xs">
                  «ការសិក្សាដើម្បីអភិវឌ្ឍចំណេះដឹង ជំនាញ វិន័យ និងគុណធម៌» • ឆ្នាំសិក្សា {selectedAcademicYear}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('student_portal')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>ចូលមើលលទ្ធផលសិក្សាផ្ទាល់ខ្លួន</span>
              </button>
            </div>
          </div>

          {/* Upcoming Events & Guidelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-moul">កាលបរិច្ឆេទសំខាន់ៗ</h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                >
                  ប្រតិទិនពេញ
                </button>
              </div>

              <div className="space-y-2">
                {calendarEvents.slice(0, 3).map((event, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">{event.title}</h5>
                      <p className="text-slate-500 text-[11px] mt-0.5">{event.description || 'ព្រឹត្តិការណ៍សាលា'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-mono text-[10px] whitespace-nowrap font-bold">
                      {event.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-moul">គោលការណ៍សិស្សល្អ និងវិន័យ</h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>មកសាលារៀនឱ្យបានទៀងទាត់មុនម៉ោង ៧:០០ ព្រឹក និងម៉ោង ១:០០ រសៀល។</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>ស្លៀកពាក់ឯកសណ្ឋានសិស្សឱ្យបានត្រឹមត្រូវ និងរក្សាអនាម័យខ្លួនប្រាណជានិច្ច។</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>ខិតខំរៀនសូត្រ ធ្វើកិច្ចការផ្ទះ និងគោរពលោកគ្រូអ្នកគ្រូ និងមិត្តភក្តិ។</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuickAttendanceModal isOpen={isQuickAttOpen} onClose={() => setIsQuickAttOpen(false)} />
      <NewClassroomWizardModal isOpen={isNewClassOpen} onClose={() => setIsNewClassOpen(false)} />
    </div>
  );
};
