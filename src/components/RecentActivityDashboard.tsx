import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  ActivityLogItem,
  ActivityDomain,
  ActivityActionType,
  ActiveTab
} from '../types';
import {
  formatKhmerRelativeTime,
  formatKhmerFullDateTime
} from '../utils/activityTracker';
import {
  History,
  Users,
  GraduationCap,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Download,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  Trash2,
  Tag,
  ChevronRight,
  ShieldCheck,
  Building,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';

interface RecentActivityDashboardProps {
  embedded?: boolean;
  maxItems?: number;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const RecentActivityDashboard: React.FC<RecentActivityDashboardProps> = ({
  embedded = false,
  maxItems,
  onNavigateTab
}) => {
  const {
    activityLogs,
    addActivityLog,
    clearActivityLogs,
    setActiveTab,
    currentUser,
    students,
    teachers,
    budgetTransactions
  } = useSchool();

  // Filters State
  const [selectedDomain, setSelectedDomain] = useState<ActivityDomain | 'all'>('all');
  const [selectedAction, setSelectedAction] = useState<ActivityActionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ActivityLogItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);

  // Manual Log Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualDomain, setManualDomain] = useState<ActivityDomain>('admin');
  const [manualDescription, setManualDescription] = useState('');
  const [manualEntityName, setManualEntityName] = useState('');

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = activityLogs.length;
    const studentEvents = activityLogs.filter(a => a.domain === 'student').length;
    const teacherEvents = activityLogs.filter(a => a.domain === 'teacher').length;
    const financeEvents = activityLogs.filter(a => a.domain === 'finance').length;
    const academicEvents = activityLogs.filter(a => a.domain === 'academic').length;

    const totalMoneyFlow = activityLogs
      .filter(a => a.domain === 'finance' && a.financialAmountRiel)
      .reduce((sum, a) => sum + (a.financialAmountRiel || 0), 0);

    return {
      total,
      studentEvents,
      teacherEvents,
      financeEvents,
      academicEvents,
      totalMoneyFlow
    };
  }, [activityLogs]);

  // Filtered Activities
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      // Domain filter
      if (selectedDomain !== 'all' && log.domain !== selectedDomain) return false;

      // Action type filter
      if (selectedAction !== 'all' && log.actionType !== selectedAction) return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = log.title?.toLowerCase().includes(query);
        const matchDesc = log.description?.toLowerCase().includes(query);
        const matchEntity = log.entityName?.toLowerCase().includes(query);
        const matchActor = log.actorName?.toLowerCase().includes(query);
        const matchCode = log.entityCode?.toLowerCase().includes(query);
        const matchCategory = log.financialCategory?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchEntity && !matchActor && !matchCode && !matchCategory) {
          return false;
        }
      }

      // Date filter
      if (dateFilter !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (dateFilter === 'today') {
          const isToday =
            logDate.getDate() === now.getDate() &&
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === '7days') {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (dateFilter === 'month') {
          const isThisMonth =
            logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
          if (!isThisMonth) return false;
        }
      }

      return true;
    });
  }, [activityLogs, selectedDomain, selectedAction, searchQuery, dateFilter]);

  const displayedLogs = maxItems ? filteredLogs.slice(0, maxItems) : filteredLogs;

  const handleNavigate = (tab?: ActiveTab) => {
    if (!tab) return;
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const handleCreateManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    addActivityLog({
      domain: manualDomain,
      actionType: 'document',
      title: manualTitle.trim(),
      description: manualDescription.trim() || 'កំណត់ត្រារដ្ឋបាល និងការត្រួតពិនិត្យផ្ទៃក្នុង',
      entityId: `manual-${Date.now()}`,
      entityName: manualEntityName.trim() || 'ការត្រួតពិនិត្យរដ្ឋបាលទូទៅ',
      actorName: currentUser?.nameKhmer || 'លោក លីម សន (នាយកសាលា)',
      actorRole: currentUser?.role === 'director' ? 'នាយកសាលា' : 'មន្ត្រីរដ្ឋបាល',
      targetTab: manualDomain === 'student' ? 'students' : manualDomain === 'teacher' ? 'teachers' : manualDomain === 'finance' ? 'finance' : 'dashboard',
      tags: ['កំណត់ត្រាផ្ទាល់ដៃ', 'ការត្រួតពិនិត្យ']
    });

    setManualTitle('');
    setManualDescription('');
    setManualEntityName('');
    setIsManualLogModalOpen(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const headers = ['កាលបរិច្ឆេទ', 'ប្រភេទផ្នែក', 'សកម្មភាព', 'ចំណងជើង', 'ឈ្មោះទិន្នន័យ', 'អត្តលេខ/កូដ', 'អ្នកកែប្រែ', 'ព័ត៌មានលម្អិត', 'ទឹកប្រាក់ (រៀល)'];
        const rows = filteredLogs.map(log => [
          `"${formatKhmerFullDateTime(log.timestamp)}"`,
          `"${getDomainLabel(log.domain)}"`,
          `"${getActionLabel(log.actionType)}"`,
          `"${log.title.replace(/"/g, '""')}"`,
          `"${log.entityName.replace(/"/g, '""')}"`,
          `"${log.entityCode || '-'}"`,
          `"${log.actorName} (${log.actorRole})"`,
          `"${log.description.replace(/"/g, '""')}"`,
          `"${log.financialAmountRiel ? log.financialAmountRiel.toLocaleString() : '-'}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `កំណត់ត្រាសកម្មភាព_សាលាបឋមសិក្សាភ្នំពុំ_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Export error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  function getDomainLabel(domain: ActivityDomain): string {
    switch (domain) {
      case 'student':
        return 'សិស្សានុសិស្ស';
      case 'teacher':
        return 'គ្រូបង្រៀន & បុគ្គលិក';
      case 'finance':
        return 'ហិរញ្ញវត្ថុ & ថវិកា';
      case 'academic':
        return 'លទ្ធផលសិក្សា & ពិន្ទុ';
      case 'admin':
        return 'រដ្ឋបាល & ប្រព័ន្ធ';
      default:
        return domain;
    }
  }

  function getActionLabel(action: ActivityActionType): string {
    switch (action) {
      case 'create':
        return 'បង្កើតថ្មី';
      case 'update':
        return 'កែប្រែព័ត៌មាន';
      case 'delete':
        return 'លុបទិន្នន័យ';
      case 'transfer':
        return 'ផ្ទេរសិស្ស';
      case 'income':
        return 'ចំណូលថវិកា';
      case 'expense':
        return 'ចំណាយថវិកា';
      case 'score':
        return 'បញ្ចូលពិន្ទុ';
      case 'attendance':
        return 'កត់ត្រាវត្តមាន';
      case 'document':
        return 'ឯកសាររដ្ឋបាល';
      case 'approval':
        return 'ការអនុម័ត';
      default:
        return action;
    }
  }

  function getDomainIcon(domain: ActivityDomain, actionType?: ActivityActionType) {
    if (actionType === 'income') {
      return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    }
    if (actionType === 'expense') {
      return <TrendingDown className="w-4 h-4 text-rose-600" />;
    }

    switch (domain) {
      case 'student':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'finance':
        return <CircleDollarSign className="w-4 h-4 text-emerald-600" />;
      case 'academic':
        return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      case 'admin':
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  }

  function getDomainBadgeStyles(domain: ActivityDomain) {
    switch (domain) {
      case 'student':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'teacher':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'finance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'academic':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'admin':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  return (
    <div id="recent-activity-dashboard" className="space-y-5">
      {/* Component Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>កំណត់ត្រាសវនកម្មផ្ទៃក្នុង (Audit Trail)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ផ្សាយផ្ទាល់ Real-Time
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-moul tracking-wide text-white">
              កំណត់ត្រាសកម្មភាព & ការកែប្រែទិន្នន័យថ្មីៗ
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              តាមដានរាល់ការបង្កើតថ្មី កែសម្រួលព័ត៌មានសិស្ស គ្រូបង្រៀន ចរាចរណ៍ថវិកា និងពិន្ទុសិក្សាទូទាំងសាលារៀន
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              id="activity-manual-log-btn"
              onClick={() => setIsManualLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>កត់ត្រាសកម្មភាព</span>
            </button>
            <button
              id="activity-export-csv-btn"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl shadow transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExporting ? 'កំពុងទាញយក...' : 'ទាញយក Excel/CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Activity */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">សកម្មភាពសរុប</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</div>
            <span className="text-[11px] text-slate-400">កំណត់ត្រាក្នុងប្រព័ន្ធ</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
        </div>

        {/* Student Records Changes */}
        <div
          onClick={() => setSelectedDomain(selectedDomain === 'student' ? 'all' : 'student')}
          className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all ${
            selectedDomain === 'student'
              ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
              : 'border-slate-200/90 hover:border-blue-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">បច្ចុប្បន្នភាពសិស្ស</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{metrics.studentEvents}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
            <span>ចុះឈ្មោះ & កែប្រែ</span>
            <span className="text-blue-600 font-semibold">{students.length} សិស្សសរុប</span>
          </div>
        </div>

        {/* Teacher Records Changes */}
        <div
          onClick={() => setSelectedDomain(selectedDomain === 'teacher' ? 'all' : 'teacher')}
          className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all ${
            selectedDomain === 'teacher'
              ? 'border-purple-500 ring-2 ring-purple-100 shadow-md'
              : 'border-slate-200/90 hover:border-purple-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">បច្ចុប្បន្នភាពគ្រូ</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{metrics.teacherEvents}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
            <span>ក្របខ័ណ្ឌ & បន្ទុកថ្នាក់</span>
            <span className="text-purple-600 font-semibold">{teachers.length} គ្រូសរុប</span>
          </div>
        </div>

        {/* Financial Logs */}
        <div
          onClick={() => setSelectedDomain(selectedDomain === 'finance' ? 'all' : 'finance')}
          className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all ${
            selectedDomain === 'finance'
              ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md'
              : 'border-slate-200/90 hover:border-emerald-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ប្រតិបត្តិការថវិកា</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {(metrics.totalMoneyFlow / 1000000).toFixed(1)}M <span className="text-xs font-normal text-slate-500">៛</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
            <span>{metrics.financeEvents} ប្រតិបត្តិការ</span>
            <span className="text-emerald-700 font-semibold">{budgetTransactions.length} បង្កាន់ដៃ</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Search, Filters & Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Filters and Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3.5">
          {/* Domain Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setSelectedDomain('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedDomain === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ទាំងអស់ ({activityLogs.length})
              </button>
              <button
                onClick={() => setSelectedDomain('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  selectedDomain === 'student'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>កំណត់ត្រាសិស្ស ({metrics.studentEvents})</span>
              </button>
              <button
                onClick={() => setSelectedDomain('teacher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  selectedDomain === 'teacher'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>កំណត់ត្រាគ្រូ ({metrics.teacherEvents})</span>
              </button>
              <button
                onClick={() => setSelectedDomain('finance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  selectedDomain === 'finance'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <CircleDollarSign className="w-3.5 h-3.5" />
                <span>ចរាចរណ៍ថវិកា ({metrics.financeEvents})</span>
              </button>
              <button
                onClick={() => setSelectedDomain('academic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  selectedDomain === 'academic'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>ពិន្ទុ & លទ្ធផល ({metrics.academicEvents})</span>
              </button>
            </div>

            {/* Clear Logs Button (Director only) */}
            {currentUser?.role === 'director' && activityLogs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('តើលោកអ្នកពិតជាចង់សម្អាតកំណត់ត្រាសកម្មភាពចាស់ៗទាំងអស់មែនទេ?')) {
                    clearActivityLogs();
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="សម្អាតកំណត់ត្រាសកម្មភាព"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>សម្អាតកំណត់ត្រា</span>
              </button>
            )}
          </div>

          {/* Search and Dropdown Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះសិស្ស គ្រូ បង្កាន់ដៃថវិកា អត្តលេខ ឬអ្នកកែប្រែ..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action Type Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedAction}
                onChange={e => setSelectedAction(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់ប្រភេទសកម្មភាព (All Actions)</option>
                <option value="create">➕ បង្កើតថ្មី (Created)</option>
                <option value="update">✏️ កែប្រែព័ត៌មាន (Updated)</option>
                <option value="delete">🗑️ លុបទិន្នន័យ (Deleted)</option>
                <option value="income">💵 ចំណូលថវិកា (Income)</option>
                <option value="expense">💳 ចំណាយថវិកា (Expense)</option>
                <option value="transfer">🔄 ផ្ទេរសិស្ស (Transfers)</option>
                <option value="score">📝 បញ្ចូលពិន្ទុ (Scores)</option>
              </select>
            </div>

            {/* Date Range Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់ពេលវេលា (All Time)</option>
                <option value="today">ថ្ងៃនេះ (Today)</option>
                <option value="7days">៧ ថ្ងៃចុងក្រោយ (Last 7 Days)</option>
                <option value="month">ខែនេះ (This Month)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Feed List */}
        <div className="divide-y divide-slate-100">
          {displayedLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 font-kantumruy">ពុំមានកំណត់ត្រាសកម្មភាពដែលត្រូវគ្នានឹងតម្រងស្វែងរកឡើយ</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬជ្រើសរើសតម្រងប្រភេទសកម្មភាពផ្សេងទៀត។
              </p>
              {(searchQuery || selectedDomain !== 'all' || selectedAction !== 'all' || dateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDomain('all');
                    setSelectedAction('all');
                    setDateFilter('all');
                  }}
                  className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors"
                >
                  សម្អាតតម្រងទាំងអស់
                </button>
              )}
            </div>
          ) : (
            displayedLogs.map((item, index) => {
              const isIncome = item.actionType === 'income';
              const isExpense = item.actionType === 'expense';
              const isDelete = item.actionType === 'delete';

              return (
                <div
                  key={item.id}
                  id={`activity-item-${item.id}`}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Domain Avatar / Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-xs ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : isExpense
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : isDelete
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : getDomainBadgeStyles(item.domain)
                      }`}
                    >
                      {getDomainIcon(item.domain, item.actionType)}
                    </div>

                    {/* Information Content */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Domain Tag */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getDomainBadgeStyles(
                            item.domain
                          )}`}
                        >
                          {getDomainLabel(item.domain)}
                        </span>

                        {/* Action Badge */}
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {getActionLabel(item.actionType)}
                        </span>

                        {/* Entity Code if exists */}
                        {item.entityCode && (
                          <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100/90 border border-slate-200 px-1.5 py-0.5 rounded">
                            {item.entityCode}
                          </span>
                        )}

                        {/* Relative Time */}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span title={formatKhmerFullDateTime(item.timestamp)}>
                            {formatKhmerRelativeTime(item.timestamp)}
                          </span>
                        </span>
                      </div>

                      {/* Main Title */}
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Diff Preview / Change Badges if available */}
                      {item.changes && item.changes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.changes.slice(0, 3).map((ch, cIdx) => (
                            <span
                              key={cIdx}
                              className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <strong className="text-slate-900">{ch.fieldLabelKhmer}:</strong>
                              {ch.oldValue ? (
                                <>
                                  <span className="line-through text-slate-400">{String(ch.oldValue)}</span>
                                  <span>➔</span>
                                  <span className="text-blue-700 font-semibold">{String(ch.newValue)}</span>
                                </>
                              ) : (
                                <span className="text-emerald-700 font-semibold">{String(ch.newValue)}</span>
                              )}
                            </span>
                          ))}
                          {item.changes.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{item.changes.length - 3} កែប្រែទៀត
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actor footer */}
                      <div className="text-[11px] text-slate-500 pt-0.5 flex items-center gap-1.5">
                        <span>ដំណើរការដោយ៖</span>
                        <strong className="text-slate-800 font-semibold">{item.actorName}</strong>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{item.actorRole}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Financial Badges & Action Buttons */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    {item.financialAmountRiel !== undefined && (
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold font-mono ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{item.financialAmountRiel.toLocaleString()} ៛
                        </div>
                        {item.financialAmountUsd !== undefined && (
                          <div className="text-[11px] text-slate-500">
                            ~${item.financialAmountUsd.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedItemForDetail(item)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        title="មើលព័ត៌មានលម្អិត"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>លម្អិត</span>
                      </button>

                      {item.targetTab && (
                        <button
                          onClick={() => handleNavigate(item.targetTab)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                          title="ចូលទៅកាន់ផ្នែកនេះផ្ទាល់"
                        >
                          <span>ចូលមើល</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & view all / load more */}
        {maxItems && filteredLogs.length > maxItems && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center justify-center gap-1 mx-auto"
            >
              <span>មើលកំណត់ត្រាសកម្មភាពទាំងអស់ ({filteredLogs.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Activity Detail Modal */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-moul text-white">
                    ព័ត៌មានលម្អិតនៃសកម្មភាព
                  </h3>
                  <span className="text-xs text-slate-300 font-mono">
                    ID: {selectedItemForDetail.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getDomainBadgeStyles(
                      selectedItemForDetail.domain
                    )}`}
                  >
                    {getDomainLabel(selectedItemForDetail.domain)}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {getActionLabel(selectedItemForDetail.actionType)}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 pt-1">
                  {selectedItemForDetail.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedItemForDetail.description}
                </p>
              </div>

              {/* Data Properties Table */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ឈ្មោះទិន្នន័យ / សំណុំឯកសារ:</span>
                  <strong className="text-slate-900 font-semibold">{selectedItemForDetail.entityName}</strong>
                </div>

                {selectedItemForDetail.entityCode && (
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">អត្តលេខ / លេខកូដបង្កាន់ដៃ:</span>
                    <strong className="text-blue-700 font-mono font-bold">{selectedItemForDetail.entityCode}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">អ្នកទទួលខុសត្រូវ / កែប្រែ:</span>
                  <span className="text-slate-900 font-medium">
                    {selectedItemForDetail.actorName} ({selectedItemForDetail.actorRole})
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">កាលបរិច្ឆេទ & ម៉ោងជាក់ស្តែង:</span>
                  <span className="text-slate-800 font-mono">
                    {formatKhmerFullDateTime(selectedItemForDetail.timestamp)}
                  </span>
                </div>

                {selectedItemForDetail.financialAmountRiel !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ទំហំទឹកប្រាក់ហិរញ្ញវត្ថុ:</span>
                    <strong
                      className={`text-sm font-mono ${
                        selectedItemForDetail.actionType === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {selectedItemForDetail.actionType === 'income' ? '+' : '-'}
                      {selectedItemForDetail.financialAmountRiel.toLocaleString()} ៛
                      {selectedItemForDetail.financialAmountUsd && ` (~$${selectedItemForDetail.financialAmountUsd})`}
                    </strong>
                  </div>
                )}
              </div>

              {/* Changes / Diff section */}
              {selectedItemForDetail.changes && selectedItemForDetail.changes.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>ព័ត៌មានលម្អិតនៃការផ្លាស់ប្តូរ (Change Differences)</span>
                  </h5>
                  <div className="space-y-1.5">
                    {selectedItemForDetail.changes.map((ch, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex flex-col gap-1"
                      >
                        <span className="font-semibold text-slate-700">{ch.fieldLabelKhmer} ({ch.fieldName})</span>
                        <div className="flex items-center gap-2 text-[11px]">
                          {ch.oldValue !== undefined && (
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 line-through">
                              {String(ch.oldValue || 'គ្មាន')}
                            </span>
                          )}
                          {ch.oldValue !== undefined && <span className="text-slate-400">➔</span>}
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            {String(ch.newValue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                បិទផ្ទាំង
              </button>

              {selectedItemForDetail.targetTab && (
                <button
                  onClick={() => {
                    const tab = selectedItemForDetail.targetTab;
                    setSelectedItemForDetail(null);
                    handleNavigate(tab);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <span>ចូលទៅកាន់ទិន្នន័យជាក់ស្តែង</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Activity Log Creation Modal */}
      {isManualLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold font-moul text-white">
                  កត់ត្រាសកម្មភាពរដ្ឋបាលថ្មី
                </h3>
              </div>
              <button
                onClick={() => setIsManualLogModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualLog} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ចំណងជើងសកម្មភាព <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="ឧ. បានចុះពិនិត្យសៀវភៅតាមដាន និងបន្ទប់រៀនថ្នាក់ទី៦..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ប្រភេទផ្នែក
                  </label>
                  <select
                    value={manualDomain}
                    onChange={e => setManualDomain(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="admin">រដ្ឋបាលទូទៅ</option>
                    <option value="student">សិស្សានុសិស្ស</option>
                    <option value="teacher">គ្រូបង្រៀន</option>
                    <option value="finance">ហិរញ្ញវត្ថុ</option>
                    <option value="academic">លទ្ធផលសិក្សា</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ឈ្មោះកម្មវត្ថុ / ទិន្នន័យ
                  </label>
                  <input
                    type="text"
                    value={manualEntityName}
                    onChange={e => setManualEntityName(e.target.value)}
                    placeholder="ឧ. ថ្នាក់ទី៦ក / អគារ A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ព័ត៌មានលម្អិត
                </label>
                <textarea
                  rows={3}
                  value={manualDescription}
                  onChange={e => setManualDescription(e.target.value)}
                  placeholder="ពិពណ៌នាអំពីលទ្ធផល ឬការកែសម្រួលបន្ថែម..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow"
                >
                  រក្សាទុកកំណត់ត្រា
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
