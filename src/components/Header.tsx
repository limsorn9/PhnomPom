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
  Lock,
  Check,
  Plus,
  RefreshCw,
  Database,
  X
} from 'lucide-react';
import { NotificationsModal } from './NotificationsModal';
import { OfflineSyncStatusBadge } from './OfflineSyncStatusBadge';
import { InactivityTimeoutCountdown } from './InactivityTimeoutCountdown';
import { ThemeToggleSwitch } from './common/ThemeToggleSwitch';
import { FontSizeAdjuster } from './common/FontSizeAdjuster';

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
    showToast,
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
    syncAllToCloud,
    pullAllFromCloud,
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
    setGlobalActiveAcademicYear,
    addAcademicYear
  } = useSchool();

  const isDirectorOrAdmin =
    currentUser?.role === 'director' ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'secretary' ||
    currentUser?.email?.toLowerCase() === 'limsorn9@gmail.com' ||
    Boolean(currentUser?.nameKhmer && (currentUser.nameKhmer.includes('លីម សន') || currentUser.nameKhmer.includes('នាយក')));

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showMobileSyncModal, setShowMobileSyncModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAcademicYearModal, setShowAcademicYearModal] = useState(false);
  const [modalSelectedYear, setModalSelectedYear] = useState(selectedAcademicYear);
  const [newYearInput, setNewYearInput] = useState('');
  const [isAddingNewYearInline, setIsAddingNewYearInline] = useState(false);

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
      subtitle: 'ការគ្រប់គ្រងស្ថាប័ន និងគណៈគ្រប់គ្រង សាលាបឋមសិក្សាភ្នំពុំ (@limsorn - 240224709)',
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
          <button
            type="button"
            onClick={() => {
              setModalSelectedYear(selectedAcademicYear);
              setShowAcademicYearModal(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-amber-200 hover:text-amber-100 border border-blue-700/60 transition-all text-[11px] font-bold cursor-pointer shrink-0 shadow-xs"
            title={isDirectorOrAdmin ? 'ចុចដើម្បីកំណត់ឆ្នាំសិក្សាគោល ឬប្ដូរឆ្នាំសិក្សា' : 'ព័ត៌មានឆ្នាំសិក្សា'}
          >
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{language === 'en' ? `Year: ${schoolProfile.academicYear}` : `ឆ្នាំសិក្សា ${schoolProfile.academicYear}`}</span>
            {isDirectorOrAdmin && <Sparkles className="w-2.5 h-2.5 text-amber-300 ml-0.5" />}
          </button>
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
      <div className="px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Left Side: Mobile Menu Button & Active Tab Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileSidebar}
            className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
            aria-label={language === 'en' ? 'Open Sidebar Menu' : 'បើកម៉ឺនុយចំហៀង'}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 hidden sm:flex border border-blue-100 dark:border-blue-900/40">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate font-moul leading-tight">
                {currentTabInfo.title}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden xl:block">
                {language === 'en' ? schoolProfile.nameLatin || schoolProfile.nameKhmer : schoolProfile.nameKhmer} • {currentTabInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop-Only Utilities (Search, Sync badges, Language, Theme, Font Size) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Visual Inactivity Timeout Warning & Countdown Timer */}
          <div className="hidden xl:block">
            <InactivityTimeoutCountdown />
          </div>

          {/* Global Search Input & Quick Spotlight Search Trigger */}
          <div className="relative hidden md:block w-36 lg:w-44">
            <button
              type="button"
              onClick={onOpenSpotlightSearch}
              className="w-full flex items-center justify-between pl-7 pr-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-all text-left group shadow-2xs cursor-pointer"
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

          {/* Firebase Cloud Firestore Real-time Sync Status Indicator */}
          <button
            type="button"
            onClick={async () => {
              await pullAllFromCloud();
              await syncAllToCloud();
            }}
            disabled={isCloudSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isCloudSyncing
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300 animate-pulse'
                : 'bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200'
            }`}
            title={
              lastCloudSyncTime
                ? `Cloud Firestore ភ្ជាប់ជាប់លាប់! ធ្វើសមកាលកម្មចុងក្រោយ៖ ${new Date(lastCloudSyncTime).toLocaleTimeString('km-KH')} (ចុចដើម្បី Sync ទៅ-មក)`
                : 'ចុចដើម្បី Sync ទិន្នន័យទៅ-មកជាមួយ Cloud Firestore ឥឡូវនេះ'
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer ${
                googleUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
              }`}
              title={googleUser ? `Google Drive ភ្ជាប់រួច (${googleUser.email}) - ចុចដើម្បី Sync/Backup/Restore` : 'ភ្ជាប់ជាមួយ Google Drive API ដើម្បី Backup/Sync ទិន្នន័យអនឡាញ'}
            >
              <HardDrive className={`w-3.5 h-3.5 ${googleUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
              <span className="hidden lg:inline">Drive Sync</span>
              <span className="lg:hidden">Drive</span>
              {googleUser && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </button>
          )}

          {/* Bulk Import/Export Hub Button */}
          {onOpenBulkImport && (
            <button
              type="button"
              onClick={onOpenBulkImport}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              title={language === 'en' ? 'Bulk Data CSV / Excel Import & Export Hub' : 'នាំចូល និងនាំចេញទិន្នន័យធំ (Bulk Data CSV / Excel)'}
            >
              <FileSpreadsheetIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Bulk</span>
            </button>
          )}

          {/* Standalone HTML Exporter Button */}
          {onExportStandaloneHtml && (
            <button
              type="button"
              onClick={onExportStandaloneHtml}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95 cursor-pointer"
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

          {/* Quick Font Size Adjuster (A+) */}
          <div className="flex items-center px-0.5">
            <FontSizeAdjuster />
          </div>
        </div>

        {/* ALWAYS VISIBLE CONTROLS ON TOP-RIGHT (Notifications, Settings, Profile) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setShowNotifModal(true)}
            className="relative w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center"
            title={language === 'en' ? 'System Notifications' : 'សារដំណឹងប្រព័ន្ធ'}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-rose-600 text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center ring-1.5 ring-white dark:ring-slate-900 animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Quick Settings Button & Dropdown (Always visible on Top Right for Mobile & Desktop) */}
          <div className="relative">
            <button
              id="top-settings-btn"
              type="button"
              onClick={() => {
                setShowSettingsMenu(!showSettingsMenu);
                setShowRoleMenu(false);
              }}
              className={`flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all border shadow-2xs active:scale-95 cursor-pointer ${
                showSettingsMenu
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title={language === 'en' ? 'Settings' : 'ការកំណត់ (Settings)'}
              aria-label="Settings"
            >
              <Settings className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${showSettingsMenu ? 'rotate-90' : ''}`} />
              <span className="hidden sm:inline text-xs font-bold">{language === 'en' ? 'Settings' : 'កំណត់'}</span>
            </button>

            {/* Quick Settings Dropdown */}
            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in duration-100 font-battambang">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{language === 'en' ? 'Settings & Preferences' : 'ការកំណត់ប្រព័ន្ធ'}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'en' ? 'Manage school & personal account' : 'គ្រប់គ្រងព័ត៌មានសាលា និងគណនី'}
                  </p>
                </div>

                <div className="py-1 space-y-1">
                  {/* Account / User Profile Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="leading-tight text-blue-900 dark:text-blue-200 font-bold">{language === 'en' ? 'My Profile & Account' : '👤 ប្រវត្តិរូប និងគណនីខ្ញុំ'}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">រូបថត, លេខទូរសព្ទ, ពាក្យសម្ងាត់</p>
                    </div>
                  </button>

                  {/* School Profile / Settings (For director / super_admin / secretary) */}
                  {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <School className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight text-amber-950 dark:text-amber-200 font-bold">{language === 'en' ? 'School Profile & Settings' : '🏫 ការកំណត់ព័ត៌មានសាលា'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">ឈ្មោះសាលា, នាយក, ត្រា, ឡូហ្គោ</p>
                      </div>
                    </button>
                  )}

                  {/* Manage Accounts (For Director / Admin) */}
                  {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setActiveTab('accounts');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight text-emerald-950 dark:text-emerald-200 font-bold">{language === 'en' ? 'Create & Manage Accounts' : '👥 គ្រប់គ្រងគណនី & សិទ្ធិ'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">បង្កើតគណនីគ្រូ និងបុគ្គលិក</p>
                      </div>
                    </button>
                  )}

                  {/* Academic Year Settings */}
                  {isDirectorOrAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setModalSelectedYear(selectedAcademicYear);
                        setShowAcademicYearModal(true);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight text-indigo-950 dark:text-indigo-200 font-bold">{language === 'en' ? 'Academic Year' : '📅 ឆ្នាំសិក្សាគោល'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">បច្ចុប្បន្ន៖ {schoolProfile.academicYear}</p>
                      </div>
                    </button>
                  )}

                  {/* Sync Center Shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowMobileSyncModal(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="leading-tight text-teal-950 dark:text-teal-200 font-bold">{language === 'en' ? 'Data Sync Center' : '🔄 មជ្ឈមណ្ឌល Sync ទិន្នន័យ'}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">Cloud, Drive, Offline Storage</p>
                    </div>
                  </button>

                  {/* Quick Theme & Language inside settings dropdown */}
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">ពន្លឺ / ភាសា៖</span>
                    <div className="flex items-center gap-2">
                      <ThemeToggleSwitch showLabel={false} size="sm" />
                      <button
                        type="button"
                        onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {language === 'km' ? 'EN' : 'KM'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher & User Profile Menu (Always visible on Top Right for Mobile & Desktop) */}
          <div className="relative">
            <button
              id="top-user-profile-btn"
              type="button"
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowSettingsMenu(false);
              }}
              className="flex items-center gap-1.5 p-0.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title={language === 'en' ? 'User Profile & Role' : 'គណនី និងតួនាទី (Profile)'}
              aria-label="User Profile"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs ring-2 ring-white dark:ring-slate-800">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.nameKhmer ? currentUser.nameKhmer.charAt(0) : 'U'
                  )}
                </div>
                {/* Active online green dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800"></span>
              </div>

              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[95px]">
                  {currentUser?.nameKhmer || (language === 'en' ? 'User' : 'អ្នកប្រើប្រាស់')}
                </p>
                <span className={`inline-block mt-0.5 text-[9px] font-bold px-1 py-0.2 rounded border ${currentRoleMeta.bg}`}>
                  {currentRoleMeta.label}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in duration-100 font-battambang">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{currentUser?.nameKhmer}</p>
                  <p className="font-times text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${currentRoleMeta.bg}`}>
                    {language === 'en' ? `Role: ${currentRoleMeta.label}` : `តួនាទី: ${currentRoleMeta.label}`}
                  </span>
                </div>

                <div className="py-1">
                  {/* Account Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-1 border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'en' ? 'My Account Settings' : '⚙️ ការកំណត់គណនី និងប្រវត្តិរូប'}</span>
                  </button>

                  {/* School Profile Settings (for director & super_admin) */}
                  {(currentUser?.role === 'director' || currentUser?.role === 'super_admin') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold mb-1 border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer"
                    >
                      <School className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{language === 'en' ? 'School Profile & Settings' : '🏫 ការកំណត់ព័ត៌មានសាលារៀន'}</span>
                    </button>
                  )}

                  {/* Create & Manage Accounts: ONLY for director, super_admin, secretary */}
                  {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleMenu(false);
                        setActiveTab('accounts');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'en' ? 'Create & Manage Accounts' : '👥 គ្រប់គ្រង & បង្កើតគណនីថ្មី'}</span>
                    </button>
                  )}

                  {/* Role Switcher Section */}
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
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center justify-between text-slate-700 dark:text-slate-300 group cursor-pointer"
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
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
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
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
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
                                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-between group text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Log Out' : 'ចាកចេញពីប្រព័ន្ធ (Logout)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside overlay to close dropdowns */}
      {(showRoleMenu || showSettingsMenu) && (
        <div
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => {
            setShowRoleMenu(false);
            setShowSettingsMenu(false);
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MOBILE-OPTIMIZED SYNC BAR (របារសមកាលកម្មទិន្នន័យលើទូរសព្ទ) */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-2.5 py-1.5 select-none">
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {/* 1. Cloud Firestore Button */}
          <button
            type="button"
            onClick={async () => {
              showToast('កំពុងធ្វើសមកាលកម្មឡើង Cloud Firestore...', 'info');
              await syncAllToCloud();
              showToast('បានធ្វើសមកាលកម្មទិន្នន័យឡើង Firestore ជោគជ័យ!', 'success');
            }}
            disabled={isCloudSyncing}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all border shadow-2xs active:scale-95 cursor-pointer w-full min-w-0 ${
              isCloudSyncing
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-300 animate-pulse'
                : 'bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border-teal-200/80 dark:border-teal-800/80 text-teal-900 dark:text-teal-200'
            }`}
            title={lastCloudSyncTime ? 'Cloud Firestore ភ្ជាប់ជាប់លាប់! ចុចដើម្បី Sync ឥឡូវ' : 'ចុចដើម្បី Sync ឡើង Cloud'}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {isCloudSyncing ? (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              )}
            </span>
            <Cloud className={`w-3.5 h-3.5 shrink-0 ${isCloudSyncing ? 'animate-spin text-amber-600' : 'text-teal-600 dark:text-teal-400'}`} />
            <span className="truncate">
              {isCloudSyncing ? 'Sync...' : 'Cloud'}
            </span>
          </button>

          {/* 2. Google Drive Status & Link Button */}
          {onOpenDriveSync ? (
            <button
              type="button"
              onClick={onOpenDriveSync}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all border shadow-2xs active:scale-95 cursor-pointer w-full min-w-0 ${
                googleUser
                  ? 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-200'
                  : 'bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-300/80 dark:border-amber-700/80 text-amber-800 dark:text-amber-200'
              }`}
              title={googleUser ? `Drive Sync: ${googleUser.email}` : 'ចុចដើម្បីភ្ជាប់ Google Drive'}
            >
              <HardDrive className={`w-3.5 h-3.5 shrink-0 ${googleUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
              <span className="truncate">Drive</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${googleUser ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </button>
          ) : (
            <div className="w-full" />
          )}

          {/* 3. Sync Details (ព័ត៌មាន Sync) Button */}
          <button
            type="button"
            onClick={() => setShowMobileSyncModal(true)}
            className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-[11px] font-bold active:scale-95 transition-all shadow-2xs cursor-pointer w-full min-w-0"
            title="ពិនិត្យមើលព័ត៌មាន Sync ទាំងអស់ និងធ្វើសមកាលកម្ម"
          >
            <RefreshCw className={`w-3 h-3 shrink-0 text-blue-600 dark:text-blue-400 ${isCloudSyncing ? 'animate-spin' : ''}`} />
            <span className="truncate">ព័ត៌មាន Sync</span>
          </button>
        </div>
      </div>

      {/* Mobile Data Sync Center Modal */}
      {showMobileSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-battambang animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/10">
                  <Cloud className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight font-moul">មជ្ឈមណ្ឌល Sync ទិន្នន័យ</h3>
                  <p className="text-[10px] text-blue-200">Data Synchronization Center</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileSyncModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 overflow-y-auto">
              {/* Card 1: Cloud Firestore */}
              <div className="p-3 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-teal-950 dark:text-teal-200">Firebase Cloud Firestore</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ភ្ជាប់ជាប់លាប់ (Cloud Online)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      showToast('កំពុង Sync ទិន្នន័យឡើង Firestore...', 'info');
                      await syncAllToCloud();
                      showToast('បានធ្វើសមកាលកម្មទិន្នន័យឡើង Firestore ជោគជ័យ!', 'success');
                    }}
                    disabled={isCloudSyncing}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                    <span>{isCloudSyncing ? 'កំពុង Sync...' : 'Sync ឥឡូវ'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  ទិន្នន័យសិស្ស គ្រូ ពិន្ទុ វត្តមាន និងថវិកា ត្រូវបានរក្សាទុកនៅលើ Cloud ដាតាបេសសុវត្ថិភាព។
                </p>
                <div className="mt-2 pt-2 border-t border-teal-100 dark:border-teal-800/40 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Sync ចុងក្រោយ៖</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {lastCloudSyncTime ? new Date(lastCloudSyncTime).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'ទើប Sync រួច'}
                  </span>
                </div>
              </div>

              {/* Card 2: Google Drive API */}
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-950 dark:text-blue-200">Google Drive Backup & Sync</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${googleUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${googleUser ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {googleUser ? 'ភ្ជាប់រួច' : 'មិនទាន់ភ្ជាប់ Google'}
                      </span>
                    </div>
                  </div>
                  {onOpenDriveSync && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileSyncModal(false);
                        onOpenDriveSync();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>{googleUser ? 'បើកផ្ទាំង Drive' : 'ភ្ជាប់ Drive'}</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {googleUser
                    ? `បានភ្ជាប់ជាមួយគណនី Google៖ ${googleUser.email} (អាចទាញយក Backup ឬនាំចេញ Google Sheets បានភ្លាមៗ)`
                    : 'ភ្ជាប់គណនី Google Drive ផ្ទាល់ខ្លួនដើម្បីស្វ័យប្រវត្តិនាំចេញ Backup និងសន្លឹកកិច្ចការ Google Sheets។'}
                </p>
              </div>

              {/* Card 3: Offline Storage & Local Cache */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">អង្គចងចាំក្នុងទូរសព្ទ (Offline Cache)</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      ដំណើរការរលូនទោះគ្មាន Internet
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  រាល់ទិន្នន័យទាំងអស់ត្រូវបានរក្សាទុកក្នុងទូរសព្ទរបស់អ្នកដោយស្វ័យប្រវត្តិតាមរយៈ IndexedDB ដូច្នេះលោកគ្រូអ្នកគ្រូអាចបញ្ចូលពិន្ទុ និងវត្តមានទោះបីគ្មានសេវាអ៊ីនធឺណិត។
                </p>
              </div>
            </div>

            {/* Modal Footer with Master Sync Button */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowMobileSyncModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                បិទ
              </button>
              <button
                type="button"
                onClick={async () => {
                  showToast('កំពុងធ្វើសមកាលកម្មទិន្នន័យទាំងអស់...', 'info');
                  await syncAllToCloud();
                  showToast('បានធ្វើសមកាលកម្មទិន្នន័យគ្រប់ប្រព័ន្ធជោគជ័យ!', 'success');
                  setShowMobileSyncModal(false);
                }}
                disabled={isCloudSyncing}
                className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                <span>{isCloudSyncing ? 'កំពុង Sync ទិន្នន័យ...' : 'ធ្វើសមកាលកម្មទិន្នន័យទាំងអស់ឥឡូវនេះ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Director & Global Academic Year Control Modal */}
      {showAcademicYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm sm:text-base text-white">
                    {isDirectorOrAdmin ? 'កំណត់ឆ្នាំសិក្សាគោល (Director)' : 'ព័ត៌មានឆ្នាំសិក្សា'}
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    ឆ្នាំសិក្សាគោលបច្ចុប្បន្ន៖ <strong className="text-amber-300">« {schoolProfile.academicYear} »</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAcademicYearModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-kantumruy">
              {/* Official Base Year Info Box */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
                  <p className="font-bold">
                    ឆ្នាំសិក្សាគោលផ្លូវការទូទាំងសាលា៖ <span className="underline text-emerald-700 dark:text-emerald-300">{schoolProfile.academicYear}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    នេះជាឆ្នាំសិក្សាលំនាំដើមសម្រាប់គ្រូបង្រៀនទាំងអស់ សិស្សានុសិស្ស ការបញ្ចូលពិន្ទុ និងរបាយការណ៍បឋមសិក្សា។
                  </p>
                </div>
              </div>

              {/* Year Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  ជ្រើសរើសឆ្នាំសិក្សាដែលចង់កំណត់ ឬមើល៖
                </label>
                <select
                  value={modalSelectedYear}
                  onChange={(e) => setModalSelectedYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border-2 border-blue-500/40 focus:border-blue-600 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow-xs"
                >
                  {academicYears.map((yr) => {
                    const isBase = yr === schoolProfile.academicYear;
                    return (
                      <option key={yr} value={yr}>
                        ឆ្នាំសិក្សា {yr} {isBase ? '★ (ឆ្នាំគោលបច្ចុប្បន្ន)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quick Year Badges */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-semibold">ចុចជ្រើសរើសរហ័ស៖</span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {academicYears.map((yr) => {
                    const isSelected = yr === modalSelectedYear;
                    const isBase = yr === schoolProfile.academicYear;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setModalSelectedYear(yr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isBase
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isBase && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        <span>{yr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inline Add New Academic Year Option */}
              {isDirectorOrAdmin && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  {!isAddingNewYearInline ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewYearInline(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ បន្ថែមឆ្នាំសិក្សាថ្មីក្រៅពីបញ្ជី</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        បញ្ចូលឈ្មោះឆ្នាំសិក្សាថ្មី៖
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newYearInput}
                          onChange={(e) => setNewYearInput(e.target.value)}
                          placeholder="ឧ. ២០២៦ - ២០២៧"
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newYearInput.trim()) {
                              const trimmed = newYearInput.trim();
                              addAcademicYear(trimmed);
                              setModalSelectedYear(trimmed);
                              setNewYearInput('');
                              setIsAddingNewYearInline(false);
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95"
                        >
                          បន្ថែម
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewYearInline(false)}
                          className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                        >
                          បោះបង់
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedAcademicYear(modalSelectedYear);
                  setShowAcademicYearModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                ប្ដូរមើលឆ្នាំនេះ (View Only)
              </button>

              {isDirectorOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalActiveAcademicYear(modalSelectedYear);
                    setShowAcademicYearModal(false);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>★ កំណត់ជាឆ្នាំសិក្សាគោលសម្រាប់គ្រប់គ្នា</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
