import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab, UserRole } from '../types';
import { QuickAttendanceModal } from './QuickAttendanceModal';
import {
  Users,
  BookOpen,
  CalendarCheck,
  HeartPulse,
  Library as LibraryIcon,
  CircleDollarSign,
  PieChart,
  Grid,
  ChevronRight,
  Sparkles,
  Award,
  QrCode,
  Building2,
  Calendar,
  GraduationCap,
  FileSpreadsheet,
  Tv,
  Bot,
  UserPlus,
  BookOpenCheck,
  ClipboardList,
  Package,
  FileText,
  ShieldCheck,
  ArrowRightLeft,
  School,
  Flame,
  CheckCircle2,
  ArrowUpRight,
  HelpCircle,
  Bell
} from 'lucide-react';

interface MobileAppCenterProps {
  onOpenMenu: () => void;
}

export const MobileAppCenter: React.FC<MobileAppCenterProps> = ({ onOpenMenu }) => {
  const {
    currentUser,
    setActiveTab,
    canAccessTab,
    schoolProfile,
    students,
    teachers,
    classrooms,
    scores,
    libraryBooks,
    teacherDailyTasks,
    budgetTransactions,
    showToast
  } = useSchool();

  // Determine initial role mode
  const initialRole: 'director' | 'teacher' | 'student' =
    currentUser?.role === 'student'
      ? 'student'
      : currentUser?.role === 'teacher'
      ? 'teacher'
      : 'director';

  const [activeRoleView, setActiveRoleView] = useState<'director' | 'teacher' | 'student'>(initialRole);
  const [isQuickAttOpen, setIsQuickAttOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const getRoleLabelKhmer = (role: string | undefined) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'director': return 'នាយកសាលា';
      case 'secretary': return 'លេខាធិការ';
      case 'teacher': return 'គ្រូបង្រៀន';
      case 'student': return 'សិស្ស & មាតាបិតា';
      default: return 'អ្នកប្រើប្រាស់';
    }
  };

  const handleAppClick = (tabId: ActiveTab, label: string) => {
    if (canAccessTab(tabId)) {
      setActiveTab(tabId);
    } else {
      showToast(`អ្នកមិនមានសិទ្ធិចូលប្រើ «${label}» ទេ!`, 'error');
    }
  };

  // Director Apps
  const directorApps = [
    { id: 'students' as ActiveTab, label: 'សិស្ស', sub: 'បញ្ជី & គ្រួសារ', icon: Users, bgIcon: 'bg-blue-600', badge: `${students.length}` },
    { id: 'teachers' as ActiveTab, label: 'បុគ្គលិក-គ្រូ', sub: 'បន្ទុកថ្នាក់', icon: Award, bgIcon: 'bg-purple-600', badge: `${teachers.length}` },
    { id: 'classrooms' as ActiveTab, label: 'ថ្នាក់រៀន', sub: 'បន្ទប់ & វេន', icon: School, bgIcon: 'bg-sky-600', badge: `${classrooms.length}` },
    { id: 'scores' as ActiveTab, label: 'ពិន្ទុ & ចំណាត់ថ្នាក់', sub: 'ប្រចាំខែ', icon: BookOpenCheck, bgIcon: 'bg-indigo-600' },
    { id: 'attendance_health' as ActiveTab, label: 'វត្តមាន', sub: 'ទូទាំងសាលា', icon: CalendarCheck, bgIcon: 'bg-emerald-600', badge: '98%' },
    { id: 'finance' as ActiveTab, label: 'ថវិកាសាលា', sub: 'PB & SIG', icon: CircleDollarSign, bgIcon: 'bg-amber-600' },
    { id: 'reports_qr' as ActiveTab, label: 'របាយការណ៍', sub: 'MoEYS & QR', icon: FileSpreadsheet, bgIcon: 'bg-teal-600' },
    { id: 'transfers' as ActiveTab, label: 'ផ្ទេរសិស្ស', sub: 'លិខិតផ្លូវការ', icon: ArrowRightLeft, bgIcon: 'bg-rose-600' },
    { id: 'official_documents' as ActiveTab, label: 'ឯកសាររដ្ឋបាល', sub: 'ប្រកាស & លិខិត', icon: FileText, bgIcon: 'bg-slate-700' },
    { id: 'telegram_bot' as ActiveTab, label: 'Telegram Bot', sub: 'ជូនដំណឹងស្វ័យប្រវត្តិ', icon: Bot, bgIcon: 'bg-cyan-600' },
    { id: 'accounts' as ActiveTab, label: 'គណនី & សិទ្ធិ', sub: 'RBAC', icon: ShieldCheck, bgIcon: 'bg-violet-600' },
    { id: 'school_admin' as ActiveTab, label: 'កំណត់សាលា', sub: 'Profile', icon: Building2, bgIcon: 'bg-blue-800' },
  ];

  // Teacher Apps
  const teacherApps = [
    { id: 'homeroom_dashboard' as ActiveTab, label: 'បន្ទុកថ្នាក់', sub: 'សិស្សក្នុងបន្ទុក', icon: Award, bgIcon: 'bg-sky-600', badge: 'បន្ទុក' },
    { id: 'scores' as ActiveTab, label: 'បញ្ចូលពិន្ទុ', sub: 'ប្រចាំខែ', icon: BookOpenCheck, bgIcon: 'bg-purple-600' },
    { id: 'attendance_health' as ActiveTab, label: 'វត្តមាន & សុខភាព', sub: 'កត់វត្តមាន', icon: CalendarCheck, bgIcon: 'bg-emerald-600' },
    { id: 'ai_teacher' as ActiveTab, label: 'កិច្ចតែងការ AI', sub: 'AI Planner', icon: Sparkles, bgIcon: 'bg-gradient-to-r from-purple-600 to-indigo-600', badge: 'AI' },
    { id: 'teacher_agenda' as ActiveTab, label: 'របៀបវារៈបង្រៀន', sub: 'កាលវិភាគ', icon: Calendar, bgIcon: 'bg-amber-600', badge: `${teacherDailyTasks.filter(t => !t.isCompleted).length}` },
    { id: 'teacher_meetings' as ActiveTab, label: 'កិច្ចប្រជុំគ្រូ', sub: 'កំណត់ហេតុ', icon: ClipboardList, bgIcon: 'bg-teal-600' },
    { id: 'equipment_loans' as ActiveTab, label: 'ខ្ចីឧបករណ៍', sub: 'សម្ភារៈបង្រៀន', icon: Package, bgIcon: 'bg-orange-600' },
    { id: 'teaching_resources' as ActiveTab, label: 'សម្ភារៈឧបទេស', sub: 'ឯកសារបង្រៀន', icon: BookOpen, bgIcon: 'bg-indigo-600' },
    { id: 'library' as ActiveTab, label: 'បណ្ណាល័យ', sub: 'សៀវភៅអាន', icon: LibraryIcon, bgIcon: 'bg-blue-600', badge: `${libraryBooks.length}` },
    { id: 'learning_resources' as ActiveTab, label: 'ធនធាន MoEYS', sub: 'PLP & Sala', icon: Tv, bgIcon: 'bg-rose-600' },
  ];

  // Student & Guardian Apps
  const studentApps = [
    { id: 'student_portal' as ActiveTab, label: 'លទ្ធផលសិក្សា', sub: 'ពិន្ទុ & ចំណាត់ថ្នាក់', icon: GraduationCap, bgIcon: 'bg-emerald-600', badge: 'ពិន្ទុ' },
    { id: 'calendar' as ActiveTab, label: 'កាលវិភាគរៀន', sub: 'ថ្ងៃឈប់ & ប្រឡង', icon: Calendar, bgIcon: 'bg-rose-600' },
    { id: 'library' as ActiveTab, label: 'បណ្ណាល័យឌីជីថល', sub: 'សៀវភៅរឿងកុមារ', icon: LibraryIcon, bgIcon: 'bg-teal-600', badge: `${libraryBooks.length}` },
    { id: 'learning_resources' as ActiveTab, label: 'ធនធានរៀន', sub: 'វីដេអូ & PLP', icon: Tv, bgIcon: 'bg-purple-600' },
    { id: 'reports_qr' as ActiveTab, label: 'កាតសិស្ស QR', sub: 'ស្កេនវត្តមាន', icon: QrCode, bgIcon: 'bg-blue-600' },
    { id: 'school_admin' as ActiveTab, label: 'ព័ត៌មានសាលា', sub: 'ទំនាក់ទំនង', icon: Building2, bgIcon: 'bg-slate-700' },
  ];

  const currentAppList = activeRoleView === 'director' ? directorApps : (activeRoleView === 'teacher' ? teacherApps : studentApps);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-battambang pb-24 lg:hidden">
      {/* Top Header Section with Cambodia Flag & User Details */}
      <div className="bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 pt-8 pb-16 px-5 rounded-b-[36px] relative overflow-hidden shadow-lg">
        {/* Abstract Glow Effects */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full blur-xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                    {currentUser?.nameKhmer ? currentUser.nameKhmer.charAt(0) : 'ស'}
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white backdrop-blur-xs leading-none">
                  {getRoleLabelKhmer(currentUser?.role)}
                </span>
                <span className="text-[10px] text-blue-200">
                  ឆ្នាំ {schoolProfile.academicYear}
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-tight font-moul tracking-wide mt-1">
                {currentUser?.nameKhmer || 'សាលាបឋមសិក្សា'}
              </h2>
            </div>
          </div>

          {/* Cambodia Flag & Notification Pill */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-md border-2 border-white/40">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg"
                alt="Cambodia"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Role Selector Tabs for Quick Filtering on Mobile */}
        <div className="relative z-10 mt-4 bg-black/20 backdrop-blur-md p-1 rounded-2xl flex items-center justify-between gap-1 border border-white/15 text-xs font-bold text-white">
          <button
            onClick={() => setActiveRoleView('director')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1 text-[11px] ${
              activeRoleView === 'director' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>នាយក</span>
          </button>
          <button
            onClick={() => setActiveRoleView('teacher')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1 text-[11px] ${
              activeRoleView === 'teacher' ? 'bg-white text-sky-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>គ្រូបង្រៀន</span>
          </button>
          <button
            onClick={() => setActiveRoleView('student')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1 text-[11px] ${
              activeRoleView === 'student' ? 'bg-white text-emerald-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>សិស្ស</span>
          </button>
        </div>
      </div>

      {/* Main Floating Content Container */}
      <div className="px-4 -mt-10 relative z-20 space-y-4">
        
        {/* Dynamic Highlight Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-400 rounded-full blur-xl" />
          </div>

          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1 max-w-[80%]">
              <div className="flex items-center gap-1 text-amber-300 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {activeRoleView === 'director'
                    ? 'មជ្ឈមណ្ឌលគ្រប់គ្រងនាយក'
                    : activeRoleView === 'teacher'
                    ? 'មជ្ឈមណ្ឌលគ្រូបង្រៀន'
                    : 'មជ្ឈមណ្ឌលសិស្ស & អាណាព្យាបាល'}
                </span>
              </div>
              <h3 className="text-base font-bold font-moul leading-tight text-white">
                {activeRoleView === 'director'
                  ? 'គ្រប់គ្រងដំណើរការសាលា ១ កន្លែង'
                  : activeRoleView === 'teacher'
                  ? 'កត់វត្តមាន បញ្ចូលពិន្ទុ & AI'
                  : 'ពិនិត្យពិន្ទុ & កាលវិភាគសិក្សា'}
              </h3>
              <p className="text-[11px] text-blue-100/90 leading-relaxed">
                {activeRoleView === 'director'
                  ? `សិស្សសរុប ${students.length} នាក់ • គ្រូ ${teachers.length} រូប • ថ្នាក់ ${classrooms.length}`
                  : activeRoleView === 'teacher'
                  ? 'រៀបចំកិច្ចតែងការ និងពិនិត្យវត្តមានសិស្សរហ័ស'
                  : 'តាមដានការវិវត្តសិក្សារបស់កូនៗបានគ្រប់ពេលវេលា'}
              </p>
            </div>

            <button
              onClick={() => {
                if (activeRoleView === 'director') setActiveTab('students');
                else if (activeRoleView === 'teacher') setIsQuickAttOpen(true);
                else setActiveTab('student_portal');
              }}
              className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white shadow-xs shrink-0"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1-Tap Quick Action Floating Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-xs border border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 whitespace-nowrap">
            សកម្មភាព៖
          </span>

          {activeRoleView === 'director' && (
            <>
              <button
                onClick={() => setActiveTab('students')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-blue-200/60 active:scale-95 transition-transform"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                <span>+ ចុះឈ្មោះសិស្ស</span>
              </button>
              <button
                onClick={() => setIsQuickAttOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-emerald-200/60 active:scale-95 transition-transform"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ ស្កេនវត្តមាន</span>
              </button>
              <button
                onClick={() => setActiveTab('scores')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-purple-200/60 active:scale-95 transition-transform"
              >
                <BookOpenCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>+ បញ្ចូលពិន្ទុ</span>
              </button>
            </>
          )}

          {activeRoleView === 'teacher' && (
            <>
              <button
                onClick={() => setIsQuickAttOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-emerald-200/60 active:scale-95 transition-transform"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ កត់វត្តមាន</span>
              </button>
              <button
                onClick={() => setActiveTab('scores')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-purple-200/60 active:scale-95 transition-transform"
              >
                <BookOpenCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>+ បញ្ចូលពិន្ទុ</span>
              </button>
              <button
                onClick={() => setActiveTab('ai_teacher')}
                className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-violet-200/60 active:scale-95 transition-transform"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>+ កិច្ចតែងការ AI</span>
              </button>
            </>
          )}

          {activeRoleView === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('student_portal')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-emerald-200/60 active:scale-95 transition-transform"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>មើលពិន្ទុ & ចំណាត់ថ្នាក់</span>
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 border border-rose-200/60 active:scale-95 transition-transform"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>កាលវិភាគប្រឡង</span>
              </button>
            </>
          )}
        </div>

        {/* 4-Column Vibrant Mini-App Grid (Matches Reference UI) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-moul">
              កម្មវិធី និងសកម្មភាពរហ័ស
            </h4>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              {currentAppList.length} កម្មវិធី
            </span>
          </div>

          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {currentAppList.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id, app.label)}
                  className="flex flex-col items-center gap-1.5 group text-center focus:outline-none"
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${app.bgIcon} shadow-md group-hover:scale-105 group-active:scale-95 transition-transform duration-200`}>
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    {app.badge && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold shadow-xs">
                        {app.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight line-clamp-1 max-w-[70px]">
                    {app.label}
                  </span>
                </button>
              );
            })}

            {/* "More / ទាំងអស់" Drawer Button */}
            <button
              onClick={onOpenMenu}
              className="flex flex-col items-center gap-1.5 group text-center focus:outline-none"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs border border-slate-200 dark:border-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-active:scale-95 transition-all duration-200">
                <Grid className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">
                ម៉ឺនុយពេញ
              </span>
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            ចុចលើ «ម៉ឺនុយពេញ» ដើម្បីមើលមុខងារ និងរបាយការណ៍ទាំងអស់
          </p>
        </div>

        {/* Live School KPI Cards for Mobile */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>សិស្សសរុប</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{students.length}</span>
              <span className="text-xs text-slate-500">នាក់</span>
            </div>
            <p className="text-[10px] text-slate-400">ស្រី: {students.filter(s => s.gender === 'F').length} នាក់</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>វត្តមានមធ្យម</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-600">98.4%</span>
              <span className="text-xs text-emerald-500">ល្អណាស់</span>
            </div>
            <p className="text-[10px] text-slate-400">ទៀងទាត់ប្រចាំសប្តាហ៍</p>
          </div>
        </div>

      </div>

      {/* Quick Attendance Modal for 1-Tap Trigger on Mobile */}
      <QuickAttendanceModal
        isOpen={isQuickAttOpen}
        onClose={() => setIsQuickAttOpen(false)}
      />
    </div>
  );
};
