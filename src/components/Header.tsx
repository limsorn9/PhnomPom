import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab, UserRole } from '../types';
import { User } from 'firebase/auth';
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
  FileSpreadsheet as FileSpreadsheetIcon
} from 'lucide-react';
import { NotificationsModal } from './NotificationsModal';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSettings: () => void;
  googleUser: User | null;
  onGoogleAuthClick: () => void;
  isAuthLoading: boolean;
  onExportStandaloneHtml?: () => void;
  onOpenBulkImport?: () => void;
  onOpenDriveSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSettings,
  googleUser,
  onGoogleAuthClick,
  isAuthLoading,
  onExportStandaloneHtml,
  onOpenBulkImport,
  onOpenDriveSync
}) => {
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    schoolProfile,
    toastMessage,
    currentUser,
    logoutApp,
    switchUserRole,
    unreadNotifCount,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
    t
  } = useSchool();

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
    dashboard: {
      title: language === 'en' ? 'Dashboard Overview' : 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
      subtitle: language === 'en' ? 'School statistics and overview' : 'ទិន្នន័យស្ថិតិ និងសមិទ្ធផលសាលារៀន',
      icon: LayoutDashboard
    },
    homeroom_dashboard: {
      title: language === 'en' ? 'Homeroom Teacher Hub' : 'ផ្ទាំងការងារគ្រូបន្ទុកថ្នាក់',
      subtitle: language === 'en' ? 'Unified homeroom class, attendance, grades, lesson plans & parent meetings' : 'ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀន វត្តមាន ពិន្ទុ កិច្ចតែងការ និងប្រជុំមាតាបិតា',
      icon: Award
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
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-white text-[11px] py-1 px-4 sm:px-6 flex flex-wrap justify-between items-center border-b border-indigo-900/60">
        <div className="flex items-center gap-2">
          <span className="font-moul tracking-wide text-amber-300">
            {language === 'en' ? schoolProfile.nameLatin || schoolProfile.nameKhmer : schoolProfile.nameKhmer}
          </span>
          <span className="text-slate-300 hidden sm:inline">
            • {language === 'en' ? `Academic Year ${schoolProfile.academicYear}` : `ឆ្នាំសិក្សា ${schoolProfile.academicYear}`}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-slate-300">
          {/* Location link to Maps */}
          {schoolProfile.mapUrl && (
            <a
              href={schoolProfile.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 hover:underline transition-colors"
              title={language === 'en' ? 'View location on Google Maps' : 'មើលទីតាំងលើ Google Maps'}
            >
              <MapPin className="w-3 h-3 text-red-400" />
              <span className="hidden md:inline">{schoolProfile.commune}, {schoolProfile.district}, {schoolProfile.province}</span>
              <span className="md:hidden">Maps</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          )}

          {/* Facebook Link */}
          {schoolProfile.facebookPage && (
            <a
              href={schoolProfile.facebookPage}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 text-sky-300 hover:text-sky-200 hover:underline transition-colors"
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
            className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-times font-medium"
            title={language === 'en' ? `Principal: ${schoolProfile.principalName}` : `នាយកសាលា: ${schoolProfile.principalName}`}
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>{schoolProfile.principalPhone}</span>
          </a>
        </div>
      </div>

      {/* Main Top Bar Controls */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Left Side: Mobile Menu Button & Active Tab Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            aria-label={language === 'en' ? 'Open Sidebar Menu' : 'បើកម៉ឺនុយចំហៀង'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 hidden sm:flex border border-blue-100 dark:border-blue-900/40">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate font-moul leading-tight">
                {currentTabInfo.title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden md:block">
                {language === 'en' ? schoolProfile.nameLatin || schoolProfile.nameKhmer : schoolProfile.nameKhmer} • {currentTabInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Search, Role Switcher, Notifications & Auth Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Global Search Input */}
          <div className="relative hidden xl:block w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input-top"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search...' : 'ស្វែងរក...'}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-100/90 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Google Drive Cloud Sync Quick Button */}
          {onOpenDriveSync && (
            <button
              type="button"
              onClick={onOpenDriveSync}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all"
              title="Google Drive Cloud Sync (limsorn9@gmail.com)"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Drive Sync</span>
            </button>
          )}

          {/* Bulk Import/Export Hub Button */}
          {onOpenBulkImport && (
            <button
              type="button"
              onClick={onOpenBulkImport}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-xl transition-all"
              title={language === 'en' ? 'Bulk Data CSV / Excel Import & Export Hub' : 'នាំចូល និងនាំចេញទិន្នន័យធំ (Bulk Data CSV / Excel)'}
            >
              <FileSpreadsheetIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Bulk Hub</span>
            </button>
          )}

          {/* Standalone HTML Exporter Button */}
          {onExportStandaloneHtml && (
            <button
              type="button"
              onClick={onExportStandaloneHtml}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-xl transition-all"
              title={language === 'en' ? 'Download Standalone Single-File HTML' : 'ទាញយកជា Single-File HTML Standalone'}
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>HTML Standalone</span>
            </button>
          )}

          {/* Language Switcher (KM / EN) */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95"
            title={language === 'km' ? 'ប្តូរទៅភាសាអង់គ្លេស (Switch to English)' : 'Switch to Khmer (ប្តូរទៅភាសាខ្មែរ)'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-[11px] font-bold">
              {language === 'km' ? 'ខ្មែរ (KM)' : 'English (EN)'}
            </span>
          </button>

          {/* Dark Mode Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95"
            title={isDarkMode ? (language === 'en' ? 'Switch to Light Mode' : 'ប្តូរទៅពន្លឺថ្ងៃ (Light Mode)') : (language === 'en' ? 'Switch to Night / Dark Mode' : 'ប្តូរទៅផ្ទៃងងឹត (Night / Dark Mode)')}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setShowNotifModal(true)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95"
            title={language === 'en' ? 'System Notifications' : 'សារដំណឹងប្រព័ន្ធ'}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Role Switcher & User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                {currentUser?.nameKhmer ? currentUser.nameKhmer.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[110px]">
                  {currentUser?.nameKhmer || (language === 'en' ? 'User' : 'អ្នកប្រើប្រាស់')}
                </p>
                <span className={`inline-block mt-0.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${currentRoleMeta.bg}`}>
                  {currentRoleMeta.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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
                  <p className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                    {language === 'en' ? 'Switch Role (RBAC Demo)' : 'សាកល្បងប្តូរតួនាទី (Role Demo)'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      switchUserRole('director');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'en' ? 'School Director' : 'នាយកសាលា (Director)'}</span>
                  </button>
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
                  <button
                    type="button"
                    onClick={() => {
                      switchUserRole('teacher');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'en' ? 'Teacher' : 'គ្រូបង្រៀន (Teacher)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchUserRole('student');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>{language === 'en' ? 'Student (STU-001)' : 'សិស្ស (Student STU-001)'}</span>
                  </button>
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

          {/* Quick Settings Button */}
          <button
            id="top-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            title={language === 'en' ? 'Edit School Settings' : 'កែប្រែព័ត៌មានសាលារៀន'}
          >
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden lg:inline">{language === 'en' ? 'Settings' : 'កំណត់ព័ត៌មាន'}</span>
          </button>
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
      />
    </header>
  );
};
