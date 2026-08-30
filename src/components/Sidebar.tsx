import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab, UserRole } from '../types';
import { ALL_LEARNING_RESOURCES } from '../data/learningResourcesData';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  Calendar,
  CircleDollarSign,
  FileSpreadsheet,
  HardDrive,
  Settings,
  MapPin,
  Phone,
  Facebook,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  User as UserIcon,
  ShieldCheck,
  LogIn,
  LogOut,
  Shield,
  Award,
  ArrowRightLeft,
  Home,
  Library as LibraryIcon,
  BookMarked,
  FileText,
  Building2,
  Printer,
  History,
  Sparkles,
  Tv,
  Bookmark,
  CalendarDays,
  Laptop,
  FolderKanban,
  Users2,
  Bot,
  Lock
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ThemeToggleSwitch } from './common/ThemeToggleSwitch';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenSettings: () => void;
  googleUser: User | null;
  onGoogleAuthClick: () => void;
  isAuthLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  onOpenSettings,
  googleUser,
  onGoogleAuthClick,
  isAuthLoading,
}) => {
  const {
    activeTab,
    setActiveTab,
    schoolProfile,
    students,
    teachers,
    classrooms,
    transfers,
    households,
    libraryBooks,
    correspondences,
    currentUser,
    canAccessTab,
    appUsers,
    activityLogs,
    equipmentLoans,
    teacherDailyTasks,
    teacherMeetings,
    teachingResources,
    language,
    openDirectorPinModal
  } = useSchool();

  // State to track favorite/pinned MoEYS learning resources
  const [savedFavoriteIds, setSavedFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('school_favorite_learning_resources');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : ['plp', 'sala', 'g1-khmer', 'g1-math'];
    } catch {
      return ['plp', 'sala', 'g1-khmer', 'g1-math'];
    }
  });

  const [allResourcesList, setAllResourcesList] = useState(() => {
    try {
      const custom = localStorage.getItem('school_custom_learning_resources');
      const parsedCustom = custom ? JSON.parse(custom) : [];
      return [...(ALL_LEARNING_RESOURCES || []), ...(Array.isArray(parsedCustom) ? parsedCustom : [])];
    } catch {
      return ALL_LEARNING_RESOURCES || [];
    }
  });

  useEffect(() => {
    const handleSyncFavorites = () => {
      try {
        const saved = localStorage.getItem('school_favorite_learning_resources');
        const parsed = saved ? JSON.parse(saved) : [];
        setSavedFavoriteIds(Array.isArray(parsed) ? parsed : []);

        const custom = localStorage.getItem('school_custom_learning_resources');
        const parsedCustom = custom ? JSON.parse(custom) : [];
        setAllResourcesList([...(ALL_LEARNING_RESOURCES || []), ...(Array.isArray(parsedCustom) ? parsedCustom : [])]);
      } catch {
        // ignore
      }
    };

    window.addEventListener('school_favorites_updated', handleSyncFavorites);
    window.addEventListener('storage', handleSyncFavorites);
    return () => {
      window.removeEventListener('school_favorites_updated', handleSyncFavorites);
      window.removeEventListener('storage', handleSyncFavorites);
    };
  }, []);

  const savedFavoriteItems = (allResourcesList || []).filter(item => item && (savedFavoriteIds || []).includes(item.id));

  // Categorized Navigation definition
  interface NavItem {
    id: ActiveTab;
    labelKh: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  interface NavCategory {
    id: 'director' | 'teacher' | 'student';
    titleKh: string;
    titleEn: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    badgeBg: string;
    items: NavItem[];
  }

  const navCategories: NavCategory[] = [
    {
      id: 'director',
      titleKh: 'រដ្ឋបាល & នាយកសាលា',
      titleEn: 'Administration & Director',
      icon: Building2,
      colorClass: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      items: [
        {
          id: 'dashboard',
          labelKh: 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
          labelEn: 'Dashboard',
          icon: LayoutDashboard,
        },
        ...(currentUser?.role === 'super_admin' ? [{
          id: 'super_admin_hub' as ActiveTab,
          labelKh: '👑 Super Admin Hub',
          labelEn: 'Super Admin Hub',
          icon: ShieldCheck,
          badge: 'Admin',
          badgeColor: 'bg-purple-100 text-purple-800 font-bold border border-purple-300'
        }] : []),
        {
          id: 'school_admin',
          labelKh: 'រដ្ឋបាលសាលា (លិខិត/បុគ្គលិក)',
          labelEn: 'School Administration',
          icon: FileText,
          badge: correspondences.length,
          badgeColor: 'bg-blue-100 text-blue-700 font-semibold',
        },
        {
          id: 'school_management',
          labelKh: 'ការគ្រប់គ្រង & ស្តង់ដាសាលា',
          labelEn: 'School Management & Standards',
          icon: Building2,
          badge: 'MoEYS',
          badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
        },
        {
          id: 'teachers',
          labelKh: 'គ្រូបង្រៀន & បុគ្គលិក',
          labelEn: 'Teaching Staff',
          icon: GraduationCap,
          badge: teachers.length,
          badgeColor: 'bg-indigo-100 text-indigo-700 font-semibold',
        },
        {
          id: 'classrooms',
          labelKh: 'បន្ទប់ & ថ្នាក់រៀន',
          labelEn: 'Classrooms',
          icon: School,
          badge: classrooms.length,
          badgeColor: 'bg-slate-100 text-slate-700',
        },
        {
          id: 'finance',
          labelKh: 'ថវិកា & ហិរញ្ញវត្ថុ',
          labelEn: 'Budget & Finance',
          icon: CircleDollarSign,
        },
        {
          id: 'activity_logs',
          labelKh: 'កំណត់ត្រាសកម្មភាព & សវនកម្ម',
          labelEn: 'Audit Trail & Activity Logs',
          icon: History,
          badge: activityLogs.length > 0 ? `${activityLogs.length}` : 'ថ្មី',
          badgeColor: 'bg-indigo-100 text-indigo-700 font-bold',
        },
        {
          id: 'accounts',
          labelKh: 'គ្រប់គ្រងគណនី & RBAC',
          labelEn: 'Accounts & Security',
          icon: Shield,
          badge: appUsers.length,
          badgeColor: 'bg-emerald-100 text-emerald-700 font-bold',
        },
        {
          id: 'workspace',
          labelKh: 'Google Workspace Hub',
          labelEn: 'Sheets & Drive Sync',
          icon: HardDrive,
          badge: googleUser ? 'ភ្ជាប់រួច' : 'Google',
          badgeColor: googleUser ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'bg-amber-100 text-amber-800',
        },
      ]
    },
    {
      id: 'teacher',
      titleKh: 'កិច្ចការលោកគ្រូ-អ្នកគ្រូ',
      titleEn: 'Teacher Workspace',
      icon: Award,
      colorClass: 'text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      items: [
        {
          id: 'homeroom_dashboard',
          labelKh: 'ការងារគ្រូបន្ទុកថ្នាក់',
          labelEn: 'Homeroom Teacher Hub',
          icon: Award,
          badge: 'Hub',
          badgeColor: 'bg-indigo-100 text-indigo-700 font-bold',
        },
        {
          id: 'scores',
          labelKh: 'ស្រង់ពិន្ទុ & ចំណាត់ថ្នាក់',
          labelEn: 'Academic Scores',
          icon: BookOpen,
        },
        {
          id: 'attendance_health',
          labelKh: 'វត្តមាន & សុខភាព (BMI)',
          labelEn: 'Attendance & Health',
          icon: CalendarCheck,
        },
        {
          id: 'teacher_agenda',
          labelKh: 'របៀបវារៈប្រចាំថ្ងៃ (Calendar)',
          labelEn: 'Teacher Daily Agenda',
          icon: CalendarDays,
          badge: teacherDailyTasks.filter(t => !t.isCompleted).length > 0 ? `${teacherDailyTasks.filter(t => !t.isCompleted).length}` : undefined,
          badgeColor: 'bg-blue-100 text-blue-700 font-bold',
        },
        {
          id: 'ai_teacher',
          labelKh: '🤖 AI សម្រាប់គ្រូបង្រៀន',
          labelEn: 'AI Teaching Assistant',
          icon: Sparkles,
          badge: 'AI ✨',
          badgeColor: 'bg-amber-100 text-amber-800 font-bold border border-amber-300',
        },
        {
          id: 'teaching_resources',
          labelKh: 'ធនធានបង្រៀន (Google Drive)',
          labelEn: 'Teaching Resource Center',
          icon: FolderKanban,
          badge: teachingResources.length,
          badgeColor: 'bg-sky-100 text-sky-700 font-semibold',
        },
        {
          id: 'teacher_meetings',
          labelKh: 'កំណត់ត្រាការប្រជុំគ្រូ (Minutes)',
          labelEn: 'Teacher Meeting Minutes',
          icon: Users2,
          badge: teacherMeetings.length,
          badgeColor: 'bg-purple-100 text-purple-700 font-semibold',
        },
        {
          id: 'equipment_loans',
          labelKh: 'ត្រួតពិនិត្យឧបករណ៍សាលា (Sheets)',
          labelEn: 'Equipment Loans (Sheets)',
          icon: Laptop,
          badge: equipmentLoans.filter(l => l.status === 'borrowed').length > 0 ? `${equipmentLoans.filter(l => l.status === 'borrowed').length}` : 'New',
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
        },
      ]
    },
    {
      id: 'student',
      titleKh: 'សិស្ស & ការសិក្សា & អាណាព្យាបាល',
      titleEn: 'Students & Academics',
      icon: Users,
      colorClass: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      items: [
        {
          id: 'student_portal',
          labelKh: 'គណនីសិស្ស & អាណាព្យាបាល',
          labelEn: 'Student Portal',
          icon: GraduationCap,
          badge: 'STU',
          badgeColor: 'bg-purple-100 text-purple-700 font-bold',
        },
        {
          id: 'students',
          labelKh: 'គ្រប់គ្រងសិស្សានុសិស្ស',
          labelEn: 'Student Directory',
          icon: Users,
          badge: students.length,
          badgeColor: 'bg-blue-100 text-blue-700 font-semibold',
        },
        {
          id: 'transfers',
          labelKh: 'ការផ្ទេរសិស្ស (MoEYS)',
          labelEn: 'Student Transfers',
          icon: ArrowRightLeft,
          badge: transfers.length,
          badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
        },
        {
          id: 'household_census',
          labelKh: 'ជំរឿនផែនទីខ្នងផ្ទះ',
          labelEn: 'Household Census & Map',
          icon: Home,
          badge: households.length,
          badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold',
        },
        {
          id: 'library',
          labelKh: 'បណ្ណាល័យ & សៀវភៅ',
          labelEn: 'Library & Reading',
          icon: LibraryIcon,
          badge: libraryBooks.length,
          badgeColor: 'bg-teal-100 text-teal-800 font-semibold',
        },
        {
          id: 'learning_resources',
          labelKh: 'ការសិក្សាផ្សេងៗ (MoEYS)',
          labelEn: 'Other Learning & MoEYS',
          icon: Tv,
          badge: 'MoEYS',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
        },
        {
          id: 'calendar',
          labelKh: 'ប្រតិទិនសិក្សា & ការប្រឡង',
          labelEn: 'Academic Calendar',
          icon: Calendar,
          badge: 'MoEYS',
          badgeColor: 'bg-rose-100 text-rose-700 font-semibold',
        },
        {
          id: 'reports_qr',
          labelKh: 'របាយការណ៍ & QR កាត',
          labelEn: 'MoEYS Reports & QR',
          icon: FileSpreadsheet,
        },
        {
          id: 'official_documents',
          labelKh: 'ទម្រង់ឯកសារ & បោះពុម្ព',
          labelEn: 'Document Center & Print',
          icon: Printer,
          badge: 'Print',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
        },
        {
          id: 'telegram_bot' as ActiveTab,
          labelKh: '🤖 Telegram Bot Studio',
          labelEn: 'Telegram Bot',
          icon: Bot,
          badge: 'Bot 💬',
          badgeColor: 'bg-sky-100 text-sky-800 font-bold border border-sky-300'
        },
      ]
    }
  ];

  // Category collapsed/expanded state
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({
    director: false,
    teacher: false,
    student: false
  });

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Filter navigation items strictly based on currentUser's RBAC permissions
  const filteredCategories = navCategories
    .filter(cat => {
      if (currentUser?.role === 'student' || currentUser?.role === 'parent') {
        return cat.id === 'student';
      }
      if (currentUser?.role === 'teacher') {
        return cat.id === 'teacher' || cat.id === 'student';
      }
      if (currentUser?.role === 'librarian') {
        return cat.id === 'student';
      }
      return true; // director, super_admin, secretary
    })
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item => canAccessTab(item.id))
    }))
    .filter(cat => cat.items.length > 0);

  // Auto-expand category containing activeTab
  useEffect(() => {
    filteredCategories.forEach(cat => {
      if (cat.items.some(it => it.id === activeTab)) {
        setCollapsedCategories(prev => ({
          ...prev,
          [cat.id]: false
        }));
      }
    });
  }, [activeTab]);

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const getRoleLabel = (role?: UserRole) => {
    if (language === 'en') {
      switch (role) {
        case 'director': return 'Director';
        case 'secretary': return 'Secretary';
        case 'librarian': return 'Librarian';
        case 'teacher': return 'Teacher';
        case 'student': return 'Student';
        default: return 'User';
      }
    }
    switch (role) {
      case 'director': return 'នាយកសាលា';
      case 'secretary': return 'លេខាធិការ';
      case 'librarian': return 'បណ្ណារក្ស';
      case 'teacher': return 'គ្រូបង្រៀន';
      case 'student': return 'សិស្សានុសិស្ស';
      default: return 'អ្នកប្រើប្រាស់';
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none font-battambang">
      {/* Top Emblem & Brand */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center text-white">
              <School className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold font-moul text-amber-300 leading-snug break-words">
                  {language === 'en' ? (schoolProfile.nameLatin || schoolProfile.nameKhmer) : schoolProfile.nameKhmer}
                </h1>
                <p className="text-[11px] text-slate-400 font-medium break-words font-times mt-0.5">
                  {language === 'en' ? schoolProfile.nameKhmer : schoolProfile.nameLatin}
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile / Collapse on desktop */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label={language === 'en' ? 'Close Menu' : 'បិទម៉ឺនុយ'}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? (language === 'en' ? 'Expand sidebar' : 'ពង្រីកម៉ឺនុយ') : (language === 'en' ? 'Collapse sidebar' : 'បង្រួមម៉ឺនុយ')}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Academic year badge */}
        {!isCollapsed && (
          <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-800/70 rounded-lg px-2.5 py-1 text-slate-300 border border-slate-700/50">
            <span className="text-amber-400 font-semibold">
              {language === 'en' ? `Academic Year ${schoolProfile.academicYear}` : `ឆ្នាំសិក្សា ${schoolProfile.academicYear}`}
            </span>
            <span className="text-slate-400 font-times">
              {language === 'en' ? `Code: ${schoolProfile.schoolCode}` : `កូដ: ${schoolProfile.schoolCode}`}
            </span>
          </div>
        )}
      </div>

      {/* School Contact & Links Card (Expanded view) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="text-slate-200 font-medium">{schoolProfile.village}, {schoolProfile.commune}</span>
              <p className="text-slate-400">{schoolProfile.district}, {schoolProfile.province}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/50 text-[11px]">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {language === 'en' ? 'Principal: ' : 'នាយក: '}
                <strong className="text-white font-medium">{schoolProfile.principalName}</strong>
              </span>
            </div>
            <a
              href={`tel:${schoolProfile.principalPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-times font-medium"
              title={language === 'en' ? 'Click to call' : 'ចុចដើម្បីទូរស័ព្ទ'}
            >
              <Phone className="w-3 h-3" />
              <span>{schoolProfile.principalPhone}</span>
            </a>
          </div>

          {/* Social & Maps Action Links */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {schoolProfile.mapUrl && (
              <a
                href={schoolProfile.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 rounded-lg text-[10px] text-blue-300 hover:text-white transition-colors"
              >
                <MapPin className="w-3 h-3 text-red-400" />
                <span>Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {schoolProfile.facebookPage && (
              <a
                href={schoolProfile.facebookPage}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 px-2 py-1 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 rounded-lg text-[10px] text-sky-300 hover:text-white transition-colors"
              >
                <Facebook className="w-3 h-3 text-sky-400" />
                <span>Facebook</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Categorized Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-3 custom-scrollbar">
        <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{!isCollapsed ? (language === 'en' ? `Role: ${getRoleLabel(currentUser?.role)}` : `សិទ្ធិ: ${getRoleLabel(currentUser?.role)}`) : '•••'}</span>
        </div>

        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isCategoryCollapsed = isCollapsed ? false : (collapsedCategories[category.id] ?? false);
          const hasActiveChild = category.items.some(item => item.id === activeTab);

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header (collapsible on expanded view) */}
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${
                    hasActiveChild ? 'bg-slate-800/80 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CategoryIcon className={`w-3.5 h-3.5 ${category.colorClass}`} />
                    <span className="truncate">{language === 'en' ? category.titleEn : category.titleKh}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded-md font-mono text-[9px] font-semibold border ${category.badgeBg}`}>
                      {category.items.length}
                    </span>
                    {isCategoryCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>
              ) : (
                <div className="h-px bg-slate-800 my-2 mx-1" />
              )}

              {/* Category Items List */}
              {!isCategoryCollapsed && (
                <div className="space-y-0.5 animate-fade-in pl-0.5">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const primaryTitle = language === 'en' ? item.labelEn : item.labelKh;
                    const secondaryTitle = language === 'en' ? item.labelKh : item.labelEn;

                    return (
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        title={isCollapsed ? primaryTitle : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 relative ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
                        } ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {!isCollapsed && (
                            <div className="text-left min-w-0 truncate">
                              <span className="truncate block leading-tight font-medium">{primaryTitle}</span>
                              <span className="text-[10px] text-slate-400 font-normal block leading-none font-times">{secondaryTitle}</span>
                            </div>
                          )}
                        </div>

                        {!isCollapsed && item.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-times ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {item.badge}
                          </span>
                        )}

                        {/* Active Indicator Bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-r-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Saved Resources (Pinned MoEYS links) Section */}
        {savedFavoriteItems.length > 0 && !isCollapsed && (
          <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Bookmark className="w-3 h-3 fill-amber-400" />
                <span>{language === 'en' ? 'Saved Resources' : 'ធនធានបានរក្សាទុក'}</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                {savedFavoriteItems.length}
              </span>
            </div>

            {savedFavoriteItems.map(fav => (
              <div
                key={fav.id}
                className="group flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700/40"
              >
                <button
                  type="button"
                  onClick={() => handleNavClick('learning_resources')}
                  className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer"
                  title={fav.titleKhmer}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate text-[11px] font-medium text-slate-200 group-hover:text-amber-300">
                    {fav.titleKhmer}
                  </span>
                </button>

                <a
                  href={fav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-white shrink-0 hover:bg-slate-700/60 rounded-md transition-colors"
                  title={language === 'en' ? 'Open link in new tab' : 'បើកមើលតំណភ្ជាប់'}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer Section: Google Workspace Auth & Settings */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        {/* Google Workspace Quick Status (Only for director, super_admin, secretary) */}
        {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
          !isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${googleUser ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-200 truncate">
                    {googleUser ? (googleUser.displayName || 'Google Account') : 'Google Workspace'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {googleUser ? (googleUser.email || (language === 'en' ? 'Connected' : 'ភ្ជាប់រួចរាល់')) : 'Drive & Sheets Sync'}
                  </p>
                </div>
              </div>
              <button
                onClick={onGoogleAuthClick}
                disabled={isAuthLoading}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  googleUser
                    ? 'text-rose-400 hover:bg-rose-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1 text-[11px]'
                }`}
                title={googleUser ? (language === 'en' ? 'Disconnect Google Account' : 'ផ្ដាច់គណនី Google') : (language === 'en' ? 'Connect Google Account' : 'ភ្ជាប់ Google Account')}
              >
                {isAuthLoading ? (
                  '...'
                ) : googleUser ? (
                  <LogOut className="w-3.5 h-3.5" />
                ) : (
                  <span className="flex items-center gap-1"><LogIn className="w-3 h-3" /> {language === 'en' ? 'Connect' : 'ភ្ជាប់'}</span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleAuthClick}
              className={`w-full py-2 flex items-center justify-center rounded-xl transition-colors ${googleUser ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-800'}`}
              title={googleUser ? `Google: ${googleUser.email}` : (language === 'en' ? 'Connect Google' : 'ភ្ជាប់ Google')}
            >
              <HardDrive className="w-4 h-4" />
            </button>
          )
        )}

        {/* Dark Mode Theme Toggle in Sidebar */}
        <div className={`flex items-center py-1.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 ${
          isCollapsed ? 'justify-center px-1' : 'justify-between'
        }`}>
          {!isCollapsed && (
            <span className="text-[11px] font-medium text-slate-400">
              {language === 'en' ? 'Theme Mode' : 'ទម្រង់ផ្ទៃ (Theme)'}
            </span>
          )}
          <ThemeToggleSwitch />
        </div>

        {/* User Profile & System Settings trigger */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pt-1`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden flex-shrink-0">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : currentUser?.nameKhmer ? (
                  currentUser.nameKhmer.charAt(0)
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.nameKhmer || 'អ្នកប្រើប្រាស់'}
                </p>
                <p className="text-[10px] text-amber-400 font-medium">
                  {getRoleLabel(currentUser?.role)}
                </p>
              </div>
            </div>
          )}

          {(currentUser?.role === 'director' || currentUser?.role === 'super_admin') && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title={language === 'en' ? 'School Settings' : 'ការកំណត់ប្រព័ន្ធ'}
              aria-label={language === 'en' ? 'School Settings' : 'ការកំណត់ប្រព័ន្ធ'}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col h-full ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {content}
      </aside>
    </>
  );
};
