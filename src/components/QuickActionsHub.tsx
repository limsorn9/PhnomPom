import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab, UserRole } from '../types';
import { QuickAttendanceModal } from './QuickAttendanceModal';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  CircleDollarSign,
  Award,
  UserPlus,
  FileSpreadsheet,
  QrCode,
  HeartPulse,
  BookOpenCheck,
  Sparkles,
  Search,
  Building2,
  Calendar,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Tv,
  Library as LibraryIcon,
  FileText,
  Bot,
  UserCheck,
  ArrowRightLeft,
  FolderLock,
  Layers,
  Settings,
  Package,
  Clock,
  ClipboardList,
  CheckCircle2,
  Filter,
  Lock
} from 'lucide-react';

interface QuickActionItem {
  id: string;
  titleKhmer: string;
  titleEnglish: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorGradient: string;
  iconBg: string;
  iconColor: string;
  borderHover: string;
  targetTab?: ActiveTab;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
  category: 'admin' | 'academic' | 'teaching' | 'student_service' | 'digital_ai' | 'finance';
  roles: ('director' | 'teacher' | 'student')[];
}

interface QuickActionsHubProps {
  currentMode?: 'director' | 'teacher' | 'student';
  onModeChange?: (mode: 'director' | 'teacher' | 'student') => void;
}

export const QuickActionsHub: React.FC<QuickActionsHubProps> = ({
  currentMode = 'director',
  onModeChange
}) => {
  const {
    currentUser,
    setActiveTab,
    canAccessTab,
    students,
    teachers,
    classrooms,
    scores,
    libraryBooks,
    teacherDailyTasks,
    budgetTransactions,
    showToast,
    openDirectorPinModal
  } = useSchool();

  const [selectedRole, setSelectedRole] = useState<'director' | 'teacher' | 'student'>(currentMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isQuickAttOpen, setIsQuickAttOpen] = useState(false);

  // Sync internal role with external prop if prop changes
  React.useEffect(() => {
    setSelectedRole(currentMode);
  }, [currentMode]);

  const handleRoleSelect = (role: 'director' | 'teacher' | 'student') => {
    if (currentUser?.role === 'student' && role !== 'student') {
      return;
    }
    if (currentUser?.role === 'teacher' && role === 'director') {
      return;
    }
    if (role === 'director' && currentUser?.role !== 'director' && currentUser?.role !== 'super_admin' && currentUser?.role !== 'secretary') {
      return;
    }
    setSelectedRole(role);
    if (onModeChange) {
      onModeChange(role);
    }
  };

  // Dynamic statistics for badges
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classrooms.length;
  const pendingTasksCount = teacherDailyTasks.filter(t => !t.isCompleted).length;
  const totalBooks = libraryBooks.length;
  const recentScoresCount = scores.length;

  // Master List of Quick Actions organized by role and category
  const allActions: QuickActionItem[] = useMemo(() => [
    // ==========================================
    // DIRECTOR & ADMIN ACTIONS
    // ==========================================
    {
      id: 'dir_add_student',
      titleKhmer: 'ចុះឈ្មោះសិស្សថ្មី',
      titleEnglish: 'Add New Student',
      description: 'បញ្ចូលព័ត៌មានសិស្ស កំណត់ត្រាគ្រួសារ និងទីលំនៅ',
      icon: UserPlus,
      colorGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-600 text-white',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
      targetTab: 'students',
      badge: `${totalStudents} សិស្ស`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      category: 'admin',
      roles: ['director']
    },
    {
      id: 'dir_manage_teachers',
      titleKhmer: 'គ្រប់គ្រងបុគ្គលិក-គ្រូ',
      titleEnglish: 'Manage Teachers & Staff',
      description: 'ព័ត៌មានគ្រូ បន្ទុកថ្នាក់ កាំប្រាក់ និងកាលវិភាគ',
      icon: Users,
      colorGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-600 text-white',
      iconColor: 'text-purple-600',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      targetTab: 'teachers',
      badge: `${totalTeachers} រូប`,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      category: 'admin',
      roles: ['director']
    },
    {
      id: 'dir_scores_ranking',
      titleKhmer: 'ពិន្ទុ & ចំណាត់ថ្នាក់',
      titleEnglish: 'Scores & Academic Ranking',
      description: 'ត្រួតពិនិត្យពិន្ទុប្រចាំខែ ឆមាស និងតារាងកិត្តិយស',
      icon: BookOpenCheck,
      colorGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      iconBg: 'bg-indigo-600 text-white',
      iconColor: 'text-indigo-600',
      borderHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      targetTab: 'scores',
      badge: `${recentScoresCount} កំណត់ត្រា`,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      category: 'academic',
      roles: ['director']
    },
    {
      id: 'dir_finance_budget',
      titleKhmer: 'ចំណូល-ចំណាយថវិកា',
      titleEnglish: 'Finance & PB Budget',
      description: 'ថវិការដ្ឋ (PB) មូលនិធិសាលា (SIG) និងរបាយការណ៍ហិរញ្ញវត្ថុ',
      icon: CircleDollarSign,
      colorGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-600 text-white',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      targetTab: 'finance',
      badge: `${budgetTransactions.length} ប្រតិបត្តិការ`,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      category: 'finance',
      roles: ['director']
    },
    {
      id: 'dir_attendance_health',
      titleKhmer: 'វត្តមាន & សុខភាពទូទៅ',
      titleEnglish: 'Schoolwide Attendance & Health',
      description: 'អត្រាវត្តមានសរុប អាហារូបត្ថម្ភ និងការពិនិត្យសុខភាព',
      icon: CalendarCheck,
      colorGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-600 text-white',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      targetTab: 'attendance_health',
      badge: '98.4% វត្តមាន',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      category: 'academic',
      roles: ['director']
    },
    {
      id: 'dir_classrooms',
      titleKhmer: 'រចនាសម្ព័ន្ធថ្នាក់រៀន',
      titleEnglish: 'Classrooms & Sections',
      description: 'បែងចែកថ្នាក់ គ្រូទទួលបន្ទុក និងតារាងអង្គុយសិស្ស',
      icon: School,
      colorGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
      iconBg: 'bg-sky-600 text-white',
      iconColor: 'text-sky-600',
      borderHover: 'hover:border-sky-400 hover:shadow-sky-500/10',
      targetTab: 'classrooms',
      badge: `${totalClasses} បន្ទប់`,
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
      category: 'admin',
      roles: ['director']
    },
    {
      id: 'dir_transfers',
      titleKhmer: 'លិខិតផ្ទេរសិស្ស ចេញ-ចូល',
      titleEnglish: 'Student Transfers',
      description: 'ចេញលិខិតផ្ទេរសិស្សផ្លូវការ និងទទួលសិស្សផ្ទេរចូល',
      icon: ArrowRightLeft,
      colorGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-600 text-white',
      iconColor: 'text-rose-600',
      borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
      targetTab: 'transfers',
      category: 'admin',
      roles: ['director']
    },
    {
      id: 'dir_official_docs',
      titleKhmer: 'ឯកសាររដ្ឋបាល & ប្រកាស',
      titleEnglish: 'Official Documents Center',
      description: 'លិខិតបទដ្ឋាន ប្រកាសក្រសួង MoEYS និងកំណត់ហេតុ',
      icon: FileText,
      colorGradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
      iconBg: 'bg-slate-700 text-white',
      iconColor: 'text-slate-700 dark:text-slate-300',
      borderHover: 'hover:border-slate-400 hover:shadow-slate-500/10',
      targetTab: 'official_documents',
      category: 'admin',
      roles: ['director']
    },
    {
      id: 'dir_moeys_reports',
      titleKhmer: 'របាយការណ៍ MoEYS & QR',
      titleEnglish: 'MoEYS Official Reports & QR',
      description: 'បញ្ជីឈ្មោះផ្លូវការ កាតសិស្ស QR និងស្ថិតិអប់រំគំរូ',
      icon: FileSpreadsheet,
      colorGradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-600 text-white',
      iconColor: 'text-teal-600',
      borderHover: 'hover:border-teal-400 hover:shadow-teal-500/10',
      targetTab: 'reports_qr',
      badge: 'ស្តង់ដារ',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      category: 'academic',
      roles: ['director']
    },
    {
      id: 'dir_telegram_bot',
      titleKhmer: 'Telegram Bot Studio',
      titleEnglish: 'Automated Bot Alerts',
      description: 'ជូនដំណឹងពិន្ទុ វត្តមាន និងព័ត៌មានសាលាទៅមាតាបិតា',
      icon: Bot,
      colorGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-600 text-white',
      iconColor: 'text-cyan-600',
      borderHover: 'hover:border-cyan-400 hover:shadow-cyan-500/10',
      targetTab: 'telegram_bot',
      badge: 'ស្វ័យប្រវត្តិ',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
      category: 'digital_ai',
      roles: ['director']
    },
    {
      id: 'dir_accounts_rbac',
      titleKhmer: 'គណនី & សិទ្ធិប្រើប្រាស់',
      titleEnglish: 'User Accounts & RBAC',
      description: 'គ្រប់គ្រងអ្នកប្រើប្រាស់ សិទ្ធិ និងសុវត្ថិភាពទិន្នន័យ',
      icon: ShieldCheck,
      colorGradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
      iconBg: 'bg-violet-600 text-white',
      iconColor: 'text-violet-600',
      borderHover: 'hover:border-violet-400 hover:shadow-violet-500/10',
      targetTab: 'accounts',
      category: 'admin',
      roles: ['director']
    },
    {
      id: 'dir_school_settings',
      titleKhmer: 'ព័ត៌មាន & កំណត់សាលា',
      titleEnglish: 'School Profile & Settings',
      description: 'ទីតាំង GPS, ឡូហ្គោ, ព័ត៌មាននាយក និងលេខកូដសាលា',
      icon: Building2,
      colorGradient: 'from-blue-600/10 via-blue-600/5 to-transparent',
      iconBg: 'bg-blue-700 text-white',
      iconColor: 'text-blue-700',
      borderHover: 'hover:border-blue-500 hover:shadow-blue-600/10',
      targetTab: 'school_admin',
      category: 'admin',
      roles: ['director']
    },

    // ==========================================
    // TEACHER ACTIONS
    // ==========================================
    {
      id: 'tch_homeroom',
      titleKhmer: 'បន្ទុកថ្នាក់របស់ខ្ញុំ',
      titleEnglish: 'My Homeroom Dashboard',
      description: 'ទិដ្ឋភាពសិស្សក្នុងបន្ទុក ប្លង់តុ និងកិត្តិយសថ្នាក់',
      icon: Award,
      colorGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
      iconBg: 'bg-sky-600 text-white',
      iconColor: 'text-sky-600',
      borderHover: 'hover:border-sky-400 hover:shadow-sky-500/10',
      targetTab: 'homeroom_dashboard',
      badge: 'បន្ទុកថ្នាក់',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
      category: 'teaching',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_quick_att',
      titleKhmer: 'កត់វត្តមានរហ័សថ្ងៃនេះ',
      titleEnglish: 'Quick Daily Attendance',
      description: 'ស្កេនវត្តមាន១ចុច ឬកត់វត្តមានលម្អិតតាមវេន',
      icon: QrCode,
      colorGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-600 text-white',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      onClick: () => setIsQuickAttOpen(true),
      badge: '១ ចុច',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      category: 'teaching',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_health_screening',
      titleKhmer: 'ពិនិត្យសុខភាព & កម្តៅ',
      titleEnglish: 'Daily Health Screening',
      description: 'វាស់កម្តៅ ពិនិត្យអាការៈក្អក-ផ្តាសាយ និងអាហារូបត្ថម្ភ',
      icon: HeartPulse,
      colorGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-600 text-white',
      iconColor: 'text-rose-600',
      borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
      targetTab: 'attendance_health',
      badge: 'សុខភាព',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      category: 'teaching',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_monthly_scores',
      titleKhmer: 'បញ្ចូលពិន្ទុប្រចាំខែ',
      titleEnglish: 'Enter Monthly Scores',
      description: 'បញ្ចូលពិន្ទុតាមមុខវិជ្ជា គណនាចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ',
      icon: BookOpenCheck,
      colorGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-600 text-white',
      iconColor: 'text-purple-600',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      targetTab: 'scores',
      badge: 'ប្រឡង',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      category: 'academic',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_ai_planner',
      titleKhmer: 'កិច្ចតែងការ AI Lesson Planner',
      titleEnglish: 'AI Smart Lesson Plans',
      description: 'បង្កើតកិច្ចតែងការបង្រៀនគំរូតាមកម្មវិធី MoEYS ដោយ AI',
      icon: Sparkles,
      colorGradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
      iconBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
      iconColor: 'text-purple-600',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      targetTab: 'ai_teacher',
      badge: 'AI Smart',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      category: 'digital_ai',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_agenda_schedule',
      titleKhmer: 'របៀបវារៈ & កាលវិភាគបង្រៀន',
      titleEnglish: 'Teacher Daily Agenda',
      description: 'តាមដានម៉ោងបង្រៀន ប្រតិទិនសាលា និងកិច្ចការបន្ទាន់',
      icon: Clock,
      colorGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-600 text-white',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      targetTab: 'teacher_agenda',
      badge: `${pendingTasksCount} កិច្ចការ`,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      category: 'teaching',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_meeting_minutes',
      titleKhmer: 'កំណត់ហេតុកិច្ចប្រជុំគ្រូ',
      titleEnglish: 'Staff Meeting Minutes',
      description: 'កត់ត្រាកិច្ចប្រជុំបច្ចេកទេស គរុកោសល្យ និងសេចក្តីសម្រេច',
      icon: ClipboardList,
      colorGradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-600 text-white',
      iconColor: 'text-teal-600',
      borderHover: 'hover:border-teal-400 hover:shadow-teal-500/10',
      targetTab: 'teacher_meetings',
      category: 'teaching',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_equipment_loans',
      titleKhmer: 'ខ្ចី-សងឧបករណ៍បង្រៀន',
      titleEnglish: 'Equipment & Material Loans',
      description: 'ខ្ចី Projector, ឧបករណ៍ពិសោធន៍, សម្ភារៈកីឡា',
      icon: Package,
      colorGradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
      iconBg: 'bg-orange-600 text-white',
      iconColor: 'text-orange-600',
      borderHover: 'hover:border-orange-400 hover:shadow-orange-500/10',
      targetTab: 'equipment_loans',
      category: 'teaching',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_teaching_hub',
      titleKhmer: 'សម្ភារៈឧបទេសបង្រៀន',
      titleEnglish: 'Teaching Resources Hub',
      description: 'ឯកសារបង្រៀន សន្លឹកកិច្ចការ និងគំនូរបង្ហាញ',
      icon: BookOpen,
      colorGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      iconBg: 'bg-indigo-600 text-white',
      iconColor: 'text-indigo-600',
      borderHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      targetTab: 'teaching_resources',
      category: 'teaching',
      roles: ['teacher', 'director']
    },
    {
      id: 'tch_library',
      titleKhmer: 'បណ្ណាល័យសាលា',
      titleEnglish: 'School Library System',
      description: 'ស្វែងរកសៀវភៅ ខ្ចី-សងសៀវភៅអាន និងឯកសារយោង',
      icon: LibraryIcon,
      colorGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-600 text-white',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
      targetTab: 'library',
      badge: `${totalBooks} ក្បាល`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      category: 'student_service',
      roles: ['teacher', 'director', 'student']
    },

    // ==========================================
    // STUDENT & GUARDIAN ACTIONS
    // ==========================================
    {
      id: 'std_portal',
      titleKhmer: 'គណនីសិស្ស & លទ្ធផលសិក្សា',
      titleEnglish: 'Student Portal & Reports',
      description: 'ពិនិត្យពិន្ទុប្រចាំខែ ព្រឹត្តិបត្រពិន្ទុ និងចំណាត់ថ្នាក់',
      icon: GraduationCap,
      colorGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-600 text-white',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      targetTab: 'student_portal',
      badge: 'ផ្ទាល់ខ្លួន',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      category: 'student_service',
      roles: ['student', 'director']
    },
    {
      id: 'std_academic_calendar',
      titleKhmer: 'កាលវិភាគ & ថ្ងៃឈប់សម្រាក',
      titleEnglish: 'School Calendar & Exams',
      description: 'កាលបរិច្ឆេទប្រឡង ថ្ងៃឈប់សម្រាក MoEYS និងពិធីបុណ្យ',
      icon: Calendar,
      colorGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-600 text-white',
      iconColor: 'text-rose-600',
      borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
      targetTab: 'calendar',
      badge: 'ប្រតិទិន',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      category: 'student_service',
      roles: ['student', 'director', 'teacher']
    },
    {
      id: 'std_library_books',
      titleKhmer: 'បណ្ណាល័យអានសៀវភៅ',
      titleEnglish: 'Digital Books & Stories',
      description: 'សៀវភៅរឿង គំនូរជីវចល និងចំណេះដឹងទូទៅសម្រាប់កុមារ',
      icon: LibraryIcon,
      colorGradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-600 text-white',
      iconColor: 'text-teal-600',
      borderHover: 'hover:border-teal-400 hover:shadow-teal-500/10',
      targetTab: 'library',
      badge: `${totalBooks} សៀវភៅ`,
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
      category: 'student_service',
      roles: ['student', 'director', 'teacher']
    },
    {
      id: 'std_digital_learning',
      titleKhmer: 'ធនធានរៀនឌីជីថល MoEYS',
      titleEnglish: 'Digital Learning Resources',
      description: 'កម្មវិធី PLP, សាលាឌីជីថល Sala, វីដេអូបង្រៀនគំរូ',
      icon: Tv,
      colorGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-600 text-white',
      iconColor: 'text-purple-600',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      targetTab: 'learning_resources',
      badge: 'MoEYS',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      category: 'digital_ai',
      roles: ['student', 'director', 'teacher']
    },
    {
      id: 'std_id_card_qr',
      titleKhmer: 'កាតសិស្ស & QR Code',
      titleEnglish: 'Student ID Card & QR',
      description: 'ទាញយកកាតសិស្សផ្លូវការ និងកូដ QR សម្រាប់ស្កេនវត្តមាន',
      icon: QrCode,
      colorGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-600 text-white',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
      targetTab: 'reports_qr',
      badge: 'QR Code',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      category: 'student_service',
      roles: ['student', 'director']
    },
    {
      id: 'std_school_info',
      titleKhmer: 'ព័ត៌មានសាលារៀន',
      titleEnglish: 'School Profile & Info',
      description: 'ទីតាំង ទំនាក់ទំនងនាយកសាលា និងទំព័រ Facebook ផ្លូវការ',
      icon: Building2,
      colorGradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
      iconBg: 'bg-slate-700 text-white',
      iconColor: 'text-slate-700 dark:text-slate-300',
      borderHover: 'hover:border-slate-400 hover:shadow-slate-500/10',
      targetTab: 'school_admin',
      category: 'student_service',
      roles: ['student', 'director', 'teacher']
    }
  ], [totalStudents, totalTeachers, totalClasses, recentScoresCount, budgetTransactions.length, pendingTasksCount, totalBooks]);

  // Filter actions based on role, search query, and category
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      // Role filter
      const matchesRole = action.roles.includes(selectedRole);
      if (!matchesRole) return false;

      // Category filter
      if (selectedCategory !== 'all' && action.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitleKhmer = action.titleKhmer.toLowerCase().includes(q);
        const matchesTitleEn = action.titleEnglish.toLowerCase().includes(q);
        const matchesDesc = action.description.toLowerCase().includes(q);
        return matchesTitleKhmer || matchesTitleEn || matchesDesc;
      }

      return true;
    });
  }, [allActions, selectedRole, selectedCategory, searchQuery]);

  const handleActionClick = (action: QuickActionItem) => {
    if (action.onClick) {
      action.onClick();
      return;
    }
    if (action.targetTab) {
      if (canAccessTab(action.targetTab)) {
        setActiveTab(action.targetTab);
      } else {
        showToast('អ្នកមិនមានសិទ្ធិចូលប្រើមុខងារនេះទេ!', 'error');
      }
    }
  };

  const categories = [
    { id: 'all', label: 'ទាំងអស់' },
    { id: 'admin', label: 'រដ្ឋបាល & បុគ្គលិក' },
    { id: 'academic', label: 'សិក្សាធិការ & ពិន្ទុ' },
    { id: 'teaching', label: 'ការបង្រៀន & ថ្នាក់រៀន' },
    { id: 'student_service', label: 'សេវាសិស្ស' },
    { id: 'digital_ai', label: 'ឌីជីថល & AI' },
    { id: 'finance', label: 'ថវិកា' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 sm:space-y-6">
      {/* Top Header & Role Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 sm:p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-moul text-slate-900 dark:text-white leading-tight">
                មជ្ឈមណ្ឌលសកម្មភាពរហ័ស (Quick Actions Hub)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ផ្លូវកាត់សំខាន់ៗសម្រាប់គ្រប់គ្រងដំណើរការសាលា បង្រៀន និងសេវាសិស្សប្រចាំថ្ងៃ
              </p>
            </div>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
          {/* Director Tab - Only for director, super_admin, secretary */}
          {(currentUser?.role === 'director' || currentUser?.role === 'super_admin' || currentUser?.role === 'secretary') && (
            <button
              onClick={() => handleRoleSelect('director')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] ${
                selectedRole === 'director'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>នាយកសាលា</span>
            </button>
          )}

          {/* Teacher Tab */}
          {currentUser?.role !== 'student' && currentUser?.role !== 'parent' && (
            <button
              onClick={() => handleRoleSelect('teacher')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] ${
                selectedRole === 'teacher'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>លោកគ្រូ-អ្នកគ្រូ</span>
            </button>
          )}

          {/* Student Tab */}
          <button
            onClick={() => handleRoleSelect('student')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[38px] ${
              selectedRole === 'student'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>សិស្ស & អាណាព្យាបាល</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកសកម្មភាពរហ័ស..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
            >
              សម្អាត
            </button>
          )}
        </div>
      </div>

      {/* 1-Tap Quick Action Floating Pills for Instant Access */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-slate-50 dark:bg-slate-800/40 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>សកម្មភាពផ្ទាល់៖</span>
        </span>
        {selectedRole === 'director' && (
          <>
            <button
              onClick={() => setActiveTab('students')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ ចុះឈ្មោះសិស្ស</span>
            </button>
            <button
              onClick={() => setIsQuickAttOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>+ កត់វត្តមានរហ័ស</span>
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>+ បញ្ចូលពិន្ទុ</span>
            </button>
            <button
              onClick={() => setActiveTab('reports_qr')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>+ របាយការណ៍ MoEYS</span>
            </button>
          </>
        )}

        {selectedRole === 'teacher' && (
          <>
            <button
              onClick={() => setIsQuickAttOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>+ ស្កេនវត្តមានថ្ងៃនេះ</span>
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>+ បញ្ចូលពិន្ទុ</span>
            </button>
            <button
              onClick={() => setActiveTab('ai_teacher')}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ កិច្ចតែងការ AI</span>
            </button>
            <button
              onClick={() => setActiveTab('homeroom_dashboard')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5" />
              <span>ចូលបន្ទុកថ្នាក់</span>
            </button>
          </>
        )}

        {selectedRole === 'student' && (
          <>
            <button
              onClick={() => setActiveTab('student_portal')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>មើលលទ្ធផលសិក្សា</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>កាលវិភាគប្រឡង</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <LibraryIcon className="w-3.5 h-3.5" />
              <span>អានសៀវភៅរឿង</span>
            </button>
          </>
        )}
      </div>

      {/* Grid of Quick Action Cards (Optimized for Mobile Tiles & Desktop Bento) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredActions.map(action => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              onClick={() => handleActionClick(action)}
              role="button"
              tabIndex={0}
              className={`group relative flex flex-col justify-between p-3.5 sm:p-4 md:p-5 rounded-2xl bg-gradient-to-br ${action.colorGradient} bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 ${action.borderHover} shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.98] min-h-[140px] sm:min-h-[170px]`}
            >
              <div>
                {/* Icon & Badge Row */}
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 duration-200 shrink-0 ${action.iconBg}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                  </div>
                  {action.badge && (
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold font-mono truncate max-w-[90px] sm:max-w-none ${action.badgeColor}`}>
                      {action.badge}
                    </span>
                  )}
                </div>

                {/* Titles & Subtitle */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                    {action.titleKhmer}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 font-sans mt-0.5 truncate">
                    {action.titleEnglish}
                  </p>
                </div>

                {/* Description (Visible on tablets & desktop for rich context, concealed on compact phone tiles) */}
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Bottom Action Hint */}
              <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span className="text-[10px] sm:text-[11px]">ដំណើរការ</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredActions.length === 0 && (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">រកមិនឃើញសកម្មភាពរហ័សដែលផ្គូផ្គងនឹងការស្វែងរកទេ</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            សម្អាតការស្វែងរក
          </button>
        </div>
      )}

      {/* Quick Attendance Modal */}
      <QuickAttendanceModal
        isOpen={isQuickAttOpen}
        onClose={() => setIsQuickAttOpen(false)}
      />
    </div>
  );
};
