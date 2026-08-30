import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab, UserRole } from '../types';
import { User } from 'firebase/auth';
import { UserProfileSettingsModal } from './UserProfileSettingsModal';
import {
  Menu,
  Search,
  School,
  Phone,
  MapPin,
  Facebook,
  ExternalLink,
  Settings,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Info,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Calendar,
  CircleDollarSign,
  FileSpreadsheet,
  Bell,
  LogOut,
  Shield,
  User as UserIcon,
  ChevronDown,
  Building2,
  FileCode2,
  ArrowRightLeft,
  Award,
  Sun,
  Moon,
  Languages,
  Globe,
  Home,
  Library as LibraryIcon,
  Cloud,
  FileSpreadsheet as FileSpreadsheetIcon,
  History,
  Sparkles,
  Tv,
  CalendarDays,
  Laptop,
  Users2,
  FolderKanban,
  ShieldCheck,
  Bot,
  UserPlus,
  Lock
} from 'lucide-react';
import { NotificationsModal } from './NotificationsModal';
import { OfflineSyncStatusBadge } from './OfflineSyncStatusBadge';
import { InactivityTimeoutCountdown } from './InactivityTimeoutCountdown';
import { ThemeToggleSwitch } from './common/ThemeToggleSwitch';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSettings: () => void;
  googleUser: User | null;
  onGoogleAuthClick: () => void;
  isAuthLoading: boolean;
  onExportStandaloneHtml?: () => void;
  onOpenBulkImport?: () => void;
  onOpenDriveSync?: () => void;
  onOpenSpotlightSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSettings,
  googleUser,
  onGoogleAuthClick,
  isAuthLoading,
  onExportStandaloneHtml,
  onOpenBulkImport,
  onOpenDriveSync,
  onOpenSpotlightSearch
}) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    schoolProfile,
    toastMessage,
    currentUser,
    teachers,
    switchToTeacherAccount,
    logoutApp,
    switchUserRole,
    openDirectorPinModal,
    unreadNotifCount,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
    t,
    isCloudSyncing,
    lastCloudSyncTime,
    syncAllToCloud
  } = useSchool();

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
    dashboard: {
      title: language === 'en' ? 'Dashboard Overview' : 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
      subtitle: language === 'en' ? 'School statistics and overview' : 'ទិន្នន័យស្ថិតិ និងសមិទ្ធផលសាលារៀន',
      icon: LayoutDashboard
    },
    secretary_dashboard: {
      title: language === 'en' ? 'Secretary Dashboard' : '📑 ផ្ទាំងគ្រប់គ្រងលេខាធិការ',
      subtitle: language === 'en' ? 'Administrative records, student admissions & census overview' : 'គ្រប់គ្រងកិច្ចការរដ្ឋបាល ចុះឈ្មោះសិស្ស ជំរឿន និងលិខិតស្នាម',
      icon: FileSpreadsheet
    },
    librarian_dashboard: {
      title: language === 'en' ? 'Librarian Dashboard' : '📚 ផ្ទាំងគ្រប់គ្រងបណ្ណារក្ស',
      subtitle: language === 'en' ? 'Library management, book circulation & digital resources' : 'គ្រប់គ្រងបណ្ណាល័យ ចរាចរណ៍សៀវភៅ និងធនធានសិក្សា',
      icon: BookOpen
    },
    ai_teacher: {
      title: language === 'en' ? 'AI Teaching Assistant' : '🤖 AI សម្រាប់គ្រូបង្រៀន',
      subtitle: language === 'en' ? 'AI Lesson Plan, Slides, Curriculum, Test Generator & Educational Games' : 'បង្កើតកិច្ចតែងការ ស្លាយ កម្មវិធីសិក្សា វិញ្ញាសាតេស្ត និងល្បែងសិក្សាឌីជីថល',
      icon: Sparkles
    },
    activity_logs: {
      title: language === 'en' ? 'Audit Trail & Activity Logs' : 'កំណត់ត្រាសកម្មភាព & សវនកម្មប្រព័ន្ធ',
      subtitle: language === 'en' ? 'Real-time audit log of all creations, updates, and deletes' : 'តាមដានការកែប្រែទិន្នន័យសិស្ស គ្រូ ថវិកា និងរដ្ឋបាលក្នុងប្រព័ន្ធ',
      icon: History
    },
    homeroom_dashboard: {
      title: language === 'en' ? 'Homeroom Teacher Hub' : 'ផ្ទាំងការងារគ្រូបន្ទុកថ្នាក់',
      subtitle: language === 'en' ? 'Unified homeroom class, attendance, grades, lesson plans & parent meetings' : 'ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀន វត្តមាន ពិន្ទុ កិច្ចតែងការ និងប្រជុំមាតាបិតា',
      icon: Award
    },
    teacher_agenda: {
      title: language === 'en' ? 'Teacher Daily Agenda' : 'របៀបវារៈប្រចាំថ្ងៃរបស់គ្រូ',
      subtitle: language === 'en' ? 'Daily teaching schedule, tasks and Google Calendar reminders' : 'កាលវិភាគបង្រៀនប្រចាំថ្ងៃ ភារកិច្ច និងការរំលឹកតាម Google Calendar',
      icon: CalendarDays
    },
    equipment_loans: {
      title: language === 'en' ? 'School Equipment Check-in/out' : 'បញ្ជីត្រួតពិនិត្យឧបករណ៍សាលា',
      subtitle: language === 'en' ? 'Borrowing/returning tech equipment with Google Sheets sync' : 'ចុះឈ្មោះខ្ចី-ប្រើប្រាស់ឧបករណ៍បច្ចេកវិទ្យា និង sync ទៅ Google Sheets',
      icon: Laptop
    },
    teacher_meetings: {
      title: language === 'en' ? 'Teacher Meeting Minutes' : 'កំណត់ត្រាការប្រជុំគ្រូ',
      subtitle: language === 'en' ? 'Meeting agenda, attendee list, resolutions and Google Calendar sync' : 'កត់ត្រារបៀបវារៈ សេចក្តីសម្រេច វត្តមាន និង sync ទៅ Google Calendar',
      icon: Users2
    },
    teaching_resources: {
      title: language === 'en' ? 'Teaching Resource Center' : 'មជ្ឈមណ្ឌលធនធានបង្រៀន',
      subtitle: language === 'en' ? 'Lesson plans, exam templates and educational materials in Google Drive' : 'ចែករំលែកកិច្ចតែងការ វិញ្ញាសា និងឯកសារបង្រៀនក្នុង Google Drive',
      icon: FolderKanban
    },
    school_admin: {
      title: language === 'en' ? 'School Administration' : 'រដ្ឋបាល & លិខិតស្នាមសាលា',
      subtitle: language === 'en' ? 'Inward/Outward logbook, mission orders & committees' : 'សៀវភៅលិខិតចូល-ចេញ លិខិតបញ្ជាបេសកកម្ម និងគណៈកម្មការសាលា',
      icon: FileSpreadsheet
    },
    school_management: {
      title: language === 'en' ? 'School Management & MoEYS Standards' : 'ការគ្រប់គ្រង & ស្តង់ដាសាលារៀន',
      subtitle: language === 'en' ? '5 MoEYS Model School Standards, Strategic Plan & Inventory' : 'ស្ដង់ដាសាលារៀនគំរូ ៥ ស្តង់ដា ផែនការយុទ្ធសាស្ត្រ និងសារពើភ័ណ្ឌ',
      icon: School
    },
    official_documents: {
      title: language === 'en' ? 'Official Documents & Print Center' : 'ទម្រង់ឯកសាររដ្ឋបាល & បោះពុម្ព',
      subtitle: language === 'en' ? 'Official MoEYS administrative document templates & certificates' : 'ទម្រង់លិខិតផ្លូវការ លិខិតបញ្ជាក់ការសិក្សា និងបោះពុម្ពត្រាមូល',
      icon: FileSpreadsheet
    },
    students: {
      title: language === 'en' ? 'Student Management' : 'គ្រប់គ្រងសិស្សានុសិស្ស',
      subtitle: language === 'en' ? 'Student records, history & health data' : 'បញ្ជីឈ្មោះ ប្រវត្តិរូប និងសុខភាពសិស្ស',
      icon: Users
    },
    transfers: {
      title: language === 'en' ? 'Student Transfers (MoEYS)' : 'ការផ្ទេរសិស្សចេញ/ចូល',
      subtitle: language === 'en' ? 'Official MoEYS student transfer letters' : 'លិខិតផ្ទេរសិស្សចេញ-ចូលតាមស្តង់ដារ MoEYS',
      icon: ArrowRightLeft
    },
    household_census: {
      title: language === 'en' ? 'Household Census & Map' : 'ជំរឿនផែនទីខ្នងផ្ទះ',
      subtitle: language === 'en' ? 'GPS mapping & catchment family census' : 'ផែនទី GPS ភូមិសាស្ត្រ និងទិន្នន័យគ្រួសារតាមខ្នងផ្ទះ',
      icon: Home
    },
    library: {
      title: language === 'en' ? 'Library & Reading' : 'បណ្ណាល័យ & សៀវភៅ',
      subtitle: language === 'en' ? 'Textbooks, book loans & reading logs' : 'គ្រប់គ្រងសៀវភៅសិក្សា និងការខ្ចី-សង',
      icon: LibraryIcon
    },
    learning_resources: {
      title: language === 'en' ? 'Other Learning Resources & MoEYS' : 'ការសិក្សាផ្សេងៗ & ថ្នាលឌីជីថល',
      subtitle: language === 'en' ? 'Grade 1-6 video lessons, PLP & Sala Digital MoEYS' : 'បណ្ដុំវីដេអូបង្រៀនថ្នាក់ទី១-៦ ថ្នាលបឋម PLP និងសាលាឌីជីថល',
      icon: Tv
    },
    teachers: {
      title: language === 'en' ? 'Teachers & Staff' : 'គ្រូបង្រៀន & បុគ្គលិក',
      subtitle: language === 'en' ? 'Civil service records and teaching timetable' : 'ទិន្នន័យមន្ត្រីរាជការ និងកាលវិភាគបង្រៀន',
      icon: GraduationCap
    },
    classrooms: {
      title: language === 'en' ? 'Classrooms' : 'បន្ទប់ & ថ្នាក់រៀន',
      subtitle: language === 'en' ? 'Class list and homeroom teachers' : 'បញ្ជីថ្នាក់រៀន និងគ្រូបន្ទុកថ្នាក់',
      icon: School
    },
    scores: {
      title: language === 'en' ? 'Scores & Rankings' : 'ស្រង់ពិន្ទុ & ចំណាត់ថ្នាក់',
      subtitle: language === 'en' ? 'MoEYS monthly & semester exam marks' : 'ពិន្ទុប្រចាំខែ និងឆមាសតាមស្តង់ដារ MoEYS',
      icon: BookOpen
    },
    attendance_health: {
      title: language === 'en' ? 'Attendance & Health (BMI)' : 'វត្តមាន & សុខភាព (BMI)',
      subtitle: language === 'en' ? 'Daily attendance and student nutrition' : 'ស្រង់វត្តមានប្រចាំថ្ងៃ និងតាមដានអាហារូបត្ថម្ភ',
      icon: CalendarCheck
    },
    calendar: {
      title: language === 'en' ? 'Academic Calendar & Exams' : 'ប្រតិទិនសិក្សា & ការប្រឡង',
      subtitle: language === 'en' ? 'Exam schedules, holidays & Google Sync' : 'កាលវិភាគប្រឡង ថ្ងៃឈប់សម្រាក និង Google Calendar Sync',
      icon: Calendar
    },
    finance: {
      title: language === 'en' ? 'Budget & Finance' : 'ថវិកា & ហិរញ្ញវត្ថុ',
      subtitle: language === 'en' ? 'Income-Expense PB, SIG and community funds' : 'ចំណូល-ចំណាយ PB, SIG និងសហគមន៍',
      icon: CircleDollarSign
    },
    reports_qr: {
      title: language === 'en' ? 'Reports & QR Cards' : 'របាយការណ៍ & QR កាត',
      subtitle: language === 'en' ? 'Administrative reports & student/teacher ID cards' : 'របាយការណ៍រដ្ឋបាល និងបោះពុម្ពប័ណ្ណសម្គាល់ខ្លួន',
      icon: FileSpreadsheet
    },
    accounts: {
      title: language === 'en' ? 'Accounts & RBAC' : 'គ្រប់គ្រងគណនី & RBAC',
      subtitle: language === 'en' ? 'Hierarchical access control and security' : 'បង្កើតគណនីតាមឋានានុក្រម និងសុវត្ថិភាពប្រព័ន្ធ',
      icon: Shield
    },
    student_portal: {
      title: language === 'en' ? 'Student Portal' : 'គណនីសិស្សានុសិស្ស',
      subtitle: language === 'en' ? 'Personal score report, attendance & QR student ID' : 'ព្រឹត្តិបត្រពិន្ទុផ្ទាល់ខ្លួន វត្តមាន និងប័ណ្ណសិស្ស QR',
      icon: GraduationCap
    },
    workspace: {
      title: language === 'en' ? 'Google Workspace Hub' : 'Google Workspace Hub',
      subtitle: language === 'en' ? 'Export Google Sheets & Google Drive backup' : 'នាំចេញ Google Sheets & ផ្ទុកឯកសារ Google Drive',
      icon: HardDrive
    },
    settings: {
      title: language === 'en' ? 'School Settings' : 'ការកំណត់ព័ត៌មានសាលា',
      subtitle: language === 'en' ? 'School profile and administrative settings' : 'កែប្រែព័ត៌មានរដ្ឋបាល និងទីតាំងសាលារៀន',
      icon: Settings
    },
    super_admin_hub: {
      title: 'Super Admin Hub',
      subtitle: 'ការគ្រប់គ្រងស្ថាប័ន និងនាយកសាលាទូទាំងប្រទេស (@limsorn - 240224709)',
      icon: ShieldCheck
    },
    telegram_bot: {
      title: 'Telegram Bot Studio',
      subtitle: 'តេលេក្រាមឆាតបតផ្ទាល់ក្នុងកម្មវិធី (@SornBot - 240224709)',
      icon: Bot
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;
  const CurrentIcon = currentTabInfo.icon;

  const getRoleBadge = (role?: UserRole) => {
    if (language === 'en') {
      switch (role) {
        case 'director': return { label: 'Director', bg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800' };
        case 'secretary': return { label: 'Secretary', bg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800' };
        case 'librarian': return { label: 'Librarian', bg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800' };
        case 'teacher': return { label: 'Teacher', bg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' };
        case 'student': return { label: 'Student', bg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800' };
        default: return { label: 'User', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700' };
      }
    }
    switch (role) {
      case 'director': return { label: 'នាយកសាលា', bg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800' };
      case 'secretary': return { label: 'លេខាធិការ', bg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800' };
      case 'librarian': return { label: 'បណ្ណារក្ស', bg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800' };
      case 'teacher': return { label: 'គ្រូបង្រៀន', bg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' };
      case 'student': return { label: 'សិស្ស', bg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800' };
      default: return { label: 'អ្នកប្រើប្រាស់', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700' };
    }
  };

  const currentRoleMeta = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print font-battambang">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          id="toast-notification"
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white font-medium transition-all duration-300 transform translate-y-0 ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 shadow-rose-200'
              : toastMessage.type === 'info'
              ? 'bg-sky-600 shadow-sky-200'
              : 'bg-emerald-600 shadow-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <Info className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-battambang">{toastMessage.text}</span>
        </div>
      )}

      {/* Royal Government & School Quick Bar (Compact) */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-white text-[11px] py-1.5 px-3 sm:px-6 flex flex-wrap justify-between items-center gap-y-1 border-b border-indigo-900/60 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-shrink truncate">
          <span className="font-moul tracking-wide text-amber-300 truncate">
            {language === 'en' ? schoolProfile.nameLatin || schoolProfile.nameKhmer : schoolProfile.nameKhmer}
          </span>
          <span className="text-slate-300 hidden md:inline truncate">
            • {language === 'en' ? `Academic Year ${schoolProfile.academicYear}` : `ឆ្នាំសិក្សា ${schoolProfile.academicYear}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 text-slate-300 flex-wrap">
          {/* Location link to Maps */}
          {schoolProfile.mapUrl && (
            <a
              href={schoolProfile.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 hover:underline transition-colors truncate max-w-[150px] sm:max-w-none"
              title={language === 'en' ? 'View location on Google Maps' : 'មើលទីតាំងលើ Google Maps'}
            >
              <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
              <span className="truncate">{schoolProfile.commune || 'ភូមិ/ឃុំ'}, {schoolProfile.district || 'ស្រុក'}, {schoolProfile.province || 'ខេត្ត'}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
            </a>
          )}

          {/* Facebook Link */}
          {schoolProfile.facebookPage && (
            <a
              href={schoolProfile.facebookPage}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 text-sky-300 hover:text-sky-200 hover:underline transition-colors"
              title={language === 'en' ? 'Official School Facebook Page' : 'ទំព័រ Facebook ផ្លូវការរបស់សាលា'}
            >
              <Facebook className="w-3 h-3 text-sky-400" />
              <span>Facebook</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          )}

          {/* Principal Contact Phone */}
          <a
            href={`tel:${schoolProfile.principalPhone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-times font-medium flex-shrink-0"
            title={language === 'en' ? `Principal: ${schoolProfile.principalName}` : `នាយកសាលា: ${schoolProfile.principalName}`}
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>{schoolProfile.principalPhone}</span>
          </a>
        </div>
      </div>

      {/* Main Top Bar Controls */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-x-4 gap-y-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors flex-wrap">
        {/* Left Side: Mobile Menu Button & Active Tab Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex-shrink-0"
            aria-label={language === 'en' ? 'Open Sidebar Menu' : 'បើកម៉ឺនុយចំហៀង'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 hidden sm:flex border border-blue-100 dark:border-blue-900/40">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate font-moul leading-tight">
                {currentTabInfo.title}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden xl:block">
                {language === 'en' ? schoolProfile.nameLatin || schoolProfile.nameKhmer : schoolProfile.nameKhmer} • {currentTabInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Search, Role Switcher, Notifications & Auth Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 flex-wrap justify-end">
          {/* Visual Inactivity Timeout Warning & Countdown Timer */}
          <div className="hidden xl:block">
            <InactivityTimeoutCountdown />
          </div>

          {/* Global Search Input & Quick Spotlight Search Trigger */}
          <div className="relative hidden md:block w-36 lg:w-48">
            <button
              type="button"
              onClick={onOpenSpotlightSearch}
              className="w-full flex items-center justify-between pl-7 pr-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-all text-left group shadow-2xs"
              title="ស្វែងរកសិស្ស និងគ្រូ (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors" />
              <span className="truncate">{language === 'en' ? 'Search...' : 'ស្វែងរក...'}</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Offline Sync / IndexedDB Status Badge */}
          <div className="hidden sm:block">
            <OfflineSyncStatusBadge />
          </div>

          {true && (
            <>
              {/* Firebase Cloud Firestore Real-time Sync Status Indicator */}
              <button
                type="button"
                onClick={() => syncAllToCloud()}
                disabled={isCloudSyncing}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  isCloudSyncing
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300 animate-pulse'
                    : 'bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200'
                }`}
                title={
                  lastCloudSyncTime
                    ? `Cloud Firestore ភ្ជាប់ជាប់លាប់! ធ្វើសមកាលកម្មចុងក្រោយ៖ ${new Date(lastCloudSyncTime).toLocaleTimeString('km-KH')}`
                    : 'ចុចដើម្បី Sync ទិន្នន័យឡើង Cloud Firestore ឥឡូវនេះ'
                }
              >
                <div className={`w-2 h-2 rounded-full ${isCloudSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                <Cloud className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin text-amber-600' : 'text-teal-700 dark:text-teal-400'}`} />
                <span className="inline">
                  {isCloudSyncing ? 'Syncing...' : 'Cloud Online'}
                </span>
              </button>

              {/* Google Drive Cloud Sync Quick Button */}
              {onOpenDriveSync && (
                <button
                  type="button"
                  onClick={onOpenDriveSync}
                  className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all"
                  title="Google Drive Cloud Sync"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Drive</span>
                </button>
              )}

              {/* Bulk Import/Export Hub Button */}
              {onOpenBulkImport && (
                <button
                  type="button"
                  onClick={onOpenBulkImport}
                  className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-xl transition-all"
                  title={language === 'en' ? 'Bulk Data CSV / Excel Import & Export Hub' : 'នាំចូល និងនាំចេញទិន្នន័យធំ (Bulk Data CSV / Excel)'}
                >
                  <FileSpreadsheetIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Bulk</span>
                </button>
              )}
            </>
          )}

          {/* Standalone HTML Exporter Button */}
          {onExportStandaloneHtml && (
            <button
              type="button"
              onClick={onExportStandaloneHtml}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-xl transition-all"
              title={language === 'en' ? 'Download Standalone Single-File HTML' : 'ទាញយកជា Single-File HTML Standalone'}
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>HTML</span>
            </button>
          )}

          {/* Language Switcher (KM / EN) */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95"
            title={language === 'km' ? 'ប្តូរទៅភាសាអង់គ្លេស' : 'Switch to Khmer'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-[11px] font-bold">
              {language === 'km' ? 'KM' : 'EN'}
            </span>
          </button>

          {/* Dark / Light Mode Theme Toggle Switch */}
          <div className="flex items-center px-0.5">
            <ThemeToggleSwitch showLabel={false} size="sm" />
          </div>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setShowNotifModal(true)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95"
            title={language === 'en' ? 'System Notifications' : 'សារដំណឹងប្រព័ន្ធ'}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Role Switcher & User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.nameKhmer ? currentUser.nameKhmer.charAt(0) : 'U'
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[95px]">
                  {currentUser?.nameKhmer || (language === 'en' ? 'User' : 'អ្នកប្រើប្រាស់')}
                </p>
                <span className={`inline-block mt-0.5 text-[9px] font-bold px-1 py-0.2 rounded border ${currentRoleMeta.bg}`}>
                  {currentRoleMeta.label}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in duration-100">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{currentUser?.nameKhmer}</p>
                  <p className="font-times text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${currentRoleMeta.bg}`}>
                    {language === 'en' ? `Role: ${currentRoleMeta.label}` : `តួនាទី: ${currentRoleMeta.label}`}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-1 border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'en' ? 'My Account Settings' : '⚙️ ការកំណត់គណនី និងប្រវត្តិរូប'}</span>
                  </button>

                  {/* Create & Manage Accounts: ONLY for director, super_admin, secretary */}
                  {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleMenu(false);
                        setActiveTab('accounts');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'en' ? 'Create & Manage Accounts' : '👥 គ្រប់គ្រង & បង្កើតគណនីថ្មី'}</span>
                    </button>
                  )}

                  {/* Role Switcher Section:
                      - For Student/Parent: Hidden entirely (សិស្សមិនអាចឃើញផ្ទាំងទៅណាក្រៅពីខ្លួនឯងឡើយ)
                      - For Teacher: Can view teacher options
                      - For Director/SuperAdmin/Secretary: Can switch across administrative roles & specific teachers by name
                  */}
                  {currentUser?.role !== 'student' && currentUser?.role !== 'parent' && (
                    <>
                      <p className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                        {language === 'en' ? 'Switch Role' : 'ប្តូរតួនាទី / គណនី'}
                      </p>

                      {(currentUser?.role === 'director' || currentUser?.role === 'super_admin') && (
                        <button
                          type="button"
                          onClick={() => {
                            switchUserRole('director');
                            setShowRoleMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center justify-between text-slate-700 dark:text-slate-300 group"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-semibold">{language === 'en' ? 'School Director' : 'នាយកសាលា (Director)'}</span>
                          </div>
                        </button>
                      )}

                      {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              switchUserRole('secretary');
                              setShowRoleMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                          >
                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{language === 'en' ? 'Secretary' : 'លេខាធិការ (Secretary)'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              switchUserRole('librarian');
                              setShowRoleMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                            <span>{language === 'en' ? 'Librarian' : 'បណ្ណារក្ស (Librarian)'}</span>
                          </button>
                        </>
                      )}

                      {/* Direct Switch to Any Teacher by Name */}
                      {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && teachers.length > 0 && (
                        <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 px-2 py-0.5 mb-1 flex items-center justify-between">
                            <span>ចូលមើលតាមឈ្មោះគ្រូ</span>
                            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded font-bold">{teachers.length} នាក់</span>
                          </p>
                          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                            {teachers.map(teacher => (
                              <button
                                key={teacher.id}
                                type="button"
                                onClick={() => {
                                  switchToTeacherAccount(teacher);
                                  setShowRoleMenu(false);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-between group text-slate-700 dark:text-slate-200 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 overflow-hidden">
                                    {teacher.avatarUrl ? (
                                      <img src={teacher.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      teacher.nameKhmer.charAt(0)
                                    )}
                                  </div>
                                  <div className="truncate">
                                    <p className="font-semibold text-[11px] truncate leading-tight">{teacher.nameKhmer}</p>
                                    <p className="text-[9px] text-slate-400 truncate leading-tight">
                                      {teacher.assignedGrade ? `ថ្នាក់ទី ${teacher.assignedGrade}${teacher.assignedSection || 'ក'}` : (teacher.role || 'គ្រូបង្រៀន')}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 shrink-0">
                                  ចូលមើល →
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      logoutApp();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Log Out' : 'ចាកចេញពីប្រព័ន្ធ (Logout)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Button - ONLY for director and super_admin */}
          {(currentUser?.role === 'director' || currentUser?.role === 'super_admin') && (
            <button
              id="top-settings-btn"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              title={language === 'en' ? 'Edit School Settings' : 'កែប្រែព័ត៌មានសាលារៀន'}
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden lg:inline">{language === 'en' ? 'Settings' : 'កំណត់ព័ត៌មាន'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
      />

      {/* User Profile & Account Settings Modal */}
      <UserProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
};
