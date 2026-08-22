import React, { useState, useMemo } from 'react';
import {
  DailyClassLog,
  ClassLogCategory,
  ClassAtmosphereMood,
  Teacher,
  Student
} from '../../types';
import {
  BookOpen,
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  Smile,
  Zap,
  ShieldAlert,
  HeartHandshake,
  Users,
  Eye,
  FileText,
  X,
  ChevronRight,
  Sun,
  Sunrise,
  Sunset,
  LayoutGrid,
  ListFilter,
  CalendarDays,
  Bookmark,
  Check
} from 'lucide-react';

interface DailyClassLogsTabProps {
  selectedGrade: number;
  selectedSection: string;
  currentTeacher?: Teacher;
  dailyClassLogs: DailyClassLog[];
  onAddDailyClassLog: (log: Omit<DailyClassLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDailyClassLog: (id: string, updated: Partial<DailyClassLog>) => void;
  onDeleteDailyClassLog: (id: string) => void;
  onToggleArchiveDailyClassLog: (id: string) => void;
}

const CATEGORY_CONFIG: Record<ClassLogCategory, { label: string; icon: string; bg: string; text: string; border: string }> = {
  academic: {
    label: 'ការរៀននិងបង្រៀន/តេស្ត',
    icon: '📚',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  discipline: {
    label: 'វិន័យ & សណ្តាប់ធ្នាប់',
    icon: '🛡️',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  hygiene_cleaning: {
    label: 'អនាម័យ & ពលកម្មថ្នាក់',
    icon: '🧹',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  event_celebration: {
    label: 'ព្រឹត្តិការណ៍ & ពិធីបុណ្យ',
    icon: '🎉',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200'
  },
  health_incident: {
    label: 'សុខភាព & សង្គ្រោះបឋម',
    icon: '💊',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200'
  },
  parent_contact: {
    label: 'ទំនាក់ទំនងអាណាព្យាបាល',
    icon: '🤝',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200'
  },
  inspection_visit: {
    label: 'ការចុះត្រួតពិនិត្យ/ទស្សនកិច្ច',
    icon: '🔍',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200'
  },
  general: {
    label: 'សកម្មភាពទូទៅ',
    icon: '📝',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300'
  }
};

const ATMOSPHERE_CONFIG: Record<ClassAtmosphereMood, { label: string; icon: string; badgeClass: string }> = {
  excellent: {
    label: 'ល្អប្រសើរខ្លាំង & សាមគ្គី',
    icon: '🌟',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  calm_focused: {
    label: 'ស្ងប់ស្ងាត់ & ផ្ចង់អារម្មណ៍',
    icon: '🧘',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  energetic: {
    label: 'រស់រវើក & សកម្មខ្លាំង',
    icon: '⚡',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  needs_attention: {
    label: 'ត្រូវបង្កើនការយកចិត្តទុកដាក់',
    icon: '⚠️',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
  }
};

const SHIFT_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  morning: { label: 'វេនព្រឹក', icon: <Sunrise className="w-3.5 h-3.5 text-amber-500" /> },
  afternoon: { label: 'វេនរសៀល', icon: <Sunset className="w-3.5 h-3.5 text-orange-500" /> },
  full_day: { label: 'ពេញមួយថ្ងៃ', icon: <Sun className="w-3.5 h-3.5 text-yellow-500" /> }
};

export const DailyClassLogsTab: React.FC<DailyClassLogsTabProps> = ({
  selectedGrade,
  selectedSection,
  currentTeacher,
  dailyClassLogs,
  onAddDailyClassLog,
  onUpdateDailyClassLog,
  onDeleteDailyClassLog,
  onToggleArchiveDailyClassLog
}) => {
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [atmosphereFilter, setAtmosphereFilter] = useState<string>('all');
  const [dateFilterRange, setDateFilterRange] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [viewLayout, setViewLayout] = useState<'timeline' | 'table'>('timeline');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<DailyClassLog | null>(null);
  const [editingLog, setEditingLog] = useState<DailyClassLog | null>(null);

  // Form states for Add / Edit
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formShift, setFormShift] = useState<'morning' | 'afternoon' | 'full_day'>('morning');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ClassLogCategory>('academic');
  const [formAtmosphere, setFormAtmosphere] = useState<ClassAtmosphereMood>('calm_focused');
  const [formNotes, setFormNotes] = useState('');
  const [formAbsentCount, setFormAbsentCount] = useState<number | ''>(0);
  const [formHighlightInput, setFormHighlightInput] = useState('');
  const [formHighlights, setFormHighlights] = useState<string[]>([]);
  const [formRecordedBy, setFormRecordedBy] = useState(currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី');

  // Filter logs by current grade and section
  const classLogs = useMemo(() => {
    return dailyClassLogs.filter(
      l => l.grade === selectedGrade && l.section === selectedSection
    );
  }, [dailyClassLogs, selectedGrade, selectedSection]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    return classLogs.filter(log => {
      // Archive filter
      if (archiveFilter === 'active' && log.isArchived) return false;
      if (archiveFilter === 'archived' && !log.isArchived) return false;

      // Category filter
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;

      // Atmosphere filter
      if (atmosphereFilter !== 'all' && log.atmosphere !== atmosphereFilter) return false;

      // Date range filter
      if (dateFilterRange === 'today') {
        if (log.date !== todayStr) return false;
      } else if (dateFilterRange === 'this_week') {
        const logDate = new Date(log.date);
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < -1) return false;
      } else if (dateFilterRange === 'this_month') {
        const logDate = new Date(log.date);
        if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = log.title.toLowerCase().includes(query);
        const matchNotes = log.notes.toLowerCase().includes(query);
        const matchHighlights = log.highlights?.some(h => h.toLowerCase().includes(query));
        const matchTeacher = log.recordedBy.toLowerCase().includes(query);
        if (!matchTitle && !matchNotes && !matchHighlights && !matchTeacher) return false;
      }

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [classLogs, archiveFilter, categoryFilter, atmosphereFilter, dateFilterRange, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = classLogs.length;
    const active = classLogs.filter(l => !l.isArchived).length;
    const archived = classLogs.filter(l => l.isArchived).length;

    const now = new Date();
    const thisMonthLogs = classLogs.filter(l => {
      const d = new Date(l.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const categoryCounts = classLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      archived,
      thisMonthCount: thisMonthLogs.length,
      categoryCounts
    };
  }, [classLogs]);

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingLog(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormShift('morning');
    setFormTitle('');
    setFormCategory('academic');
    setFormAtmosphere('calm_focused');
    setFormNotes('');
    setFormAbsentCount(0);
    setFormHighlightInput('');
    setFormHighlights([]);
    setFormRecordedBy(currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី');
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (log: DailyClassLog) => {
    setEditingLog(log);
    setFormDate(log.date);
    setFormShift(log.shift);
    setFormTitle(log.title);
    setFormCategory(log.category);
    setFormAtmosphere(log.atmosphere);
    setFormNotes(log.notes);
    setFormAbsentCount(log.absentCount !== undefined ? log.absentCount : 0);
    setFormHighlightInput('');
    setFormHighlights(log.highlights || []);
    setFormRecordedBy(log.recordedBy);
    setIsAddModalOpen(true);
  };

  // Add highlight tag
  const handleAddHighlight = () => {
    if (formHighlightInput.trim() && !formHighlights.includes(formHighlightInput.trim())) {
      setFormHighlights(prev => [...prev, formHighlightInput.trim()]);
      setFormHighlightInput('');
    }
  };

  // Remove highlight tag
  const handleRemoveHighlight = (index: number) => {
    setFormHighlights(prev => prev.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formNotes.trim()) return;

    if (editingLog) {
      onUpdateDailyClassLog(editingLog.id, {
        date: formDate,
        shift: formShift,
        title: formTitle.trim(),
        category: formCategory,
        atmosphere: formAtmosphere,
        notes: formNotes.trim(),
        highlights: formHighlights,
        absentCount: formAbsentCount !== '' ? Number(formAbsentCount) : 0,
        recordedBy: formRecordedBy.trim()
      });
    } else {
      onAddDailyClassLog({
        grade: selectedGrade,
        section: selectedSection,
        academicYear: '២០២៤ - ២០២៥',
        date: formDate,
        shift: formShift,
        title: formTitle.trim(),
        category: formCategory,
        atmosphere: formAtmosphere,
        notes: formNotes.trim(),
        highlights: formHighlights,
        absentCount: formAbsentCount !== '' ? Number(formAbsentCount) : 0,
        recordedBy: formRecordedBy.trim(),
        isArchived: false
      });
    }

    setIsAddModalOpen(false);
  };

  // Format Khmer Date
  const formatKhmerDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const days = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
      const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return {
        dayName,
        dayNum,
        monthName,
        year,
        full: `ថ្ងៃ${dayName} ទី${dayNum} ខែ${monthName} ឆ្នាំ${year}`
      };
    } catch {
      return { dayName: '', dayNum: 1, monthName: '', year: 2024, full: dateStr };
    }
  };

  return (
    <div className="space-y-6 font-battambang">
      {/* 1. METRICS & SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">កំណត់ហេតុសរុបក្នុងថ្នាក់</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-800">{stats.total}</span>
              <span className="text-xs text-slate-500">កាលប្រវត្តិ</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">កត់ត្រាក្នុងខែនេះ</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-blue-600">{stats.thisMonthCount}</span>
              <span className="text-xs text-slate-500">ព្រឹត្តិការណ៍</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">សកម្មភាពសកម្មបច្ចុប្បន្ន</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-600">{stats.active}</span>
              <span className="text-xs text-slate-500">កំណត់ហេតុ</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">បានដាក់ចូលបណ្ណសារ</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-600">{stats.archived}</span>
              <span className="text-xs text-slate-500">រក្សាទុក (Archived)</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR (Search, Filter, Quick Ranges, View Layout, Action Buttons) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកចំណងជើង, សកម្មភាព, សម្គាល់ពិសេស, គ្រូកត់ត្រា..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Quick Date filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'ទាំងអស់' },
              { id: 'today', label: 'ថ្ងៃនេះ' },
              { id: 'this_week', label: 'សប្តាហ៍នេះ' },
              { id: 'this_month', label: 'ខែនេះ' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setDateFilterRange(pill.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  dateFilterRange === pill.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Action Buttons & Layout Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewLayout('timeline')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewLayout === 'timeline'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="ទិដ្ឋភាពកាលប្បវត្តិ (Timeline Cards)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewLayout === 'table'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="ទិដ្ឋភាពតារាង (Table Ledger)"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">បោះពុម្ពសៀវភៅតាមដាន</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាកំណត់ហេតុថ្មី</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">ប្រភេទសកម្មភាព៖</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">គ្រប់ប្រភេទសកម្មភាព</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                <option key={key} value={key}>
                  {conf.icon} {conf.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">បរិយាកាសថ្នាក់៖</span>
            <select
              value={atmosphereFilter}
              onChange={e => setAtmosphereFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">គ្រប់បរិយាកាស</option>
              {Object.entries(ATMOSPHERE_CONFIG).map(([key, conf]) => (
                <option key={key} value={key}>
                  {conf.icon} {conf.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500 font-medium">បណ្ណសារ៖</span>
            <select
              value={archiveFilter}
              onChange={e => setArchiveFilter(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="active">សកម្មបច្ចុប្បន្ន</option>
              <option value="archived">បណ្ណសារ (Archived)</option>
              <option value="all">បង្ហាញទាំងអស់</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: TIMELINE / CARD VIEW OR TABLE VIEW */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">មិនទាន់មានកំណត់ហេតុប្រចាំថ្ងៃក្នុងលក្ខខណ្ឌនេះទេ</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            លោកគ្រូ-អ្នកគ្រូអាចកត់ត្រាព្រឹត្តិការណ៍ សកម្មភាពសិក្សា វិន័យ អនាម័យ ឬចំណាំសំខាន់ៗប្រចាំថ្ងៃសម្រាប់ថ្នាក់ទី {selectedGrade}«{selectedSection}»។
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>កត់ត្រាកំណត់ហេតុថ្ងៃនេះ</span>
          </button>
        </div>
      ) : viewLayout === 'timeline' ? (
        /* TIMELINE CARD VIEW */
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const dateInfo = formatKhmerDate(log.date);
            const catConf = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.general;
            const moodConf = ATMOSPHERE_CONFIG[log.atmosphere] || ATMOSPHERE_CONFIG.calm_focused;
            const shiftConf = SHIFT_CONFIG[log.shift] || SHIFT_CONFIG.morning;

            return (
              <div
                key={log.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden ${
                  log.isArchived
                    ? 'border-slate-200 bg-slate-50/50 opacity-80'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row gap-4 items-start">
                  {/* Left: Date Badge Box */}
                  <div className="flex md:flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-950 shrink-0 w-full md:w-28 text-center gap-1.5 md:gap-0">
                    <span className="text-[11px] font-bold text-indigo-600 block">{dateInfo.dayName}</span>
                    <span className="text-2xl font-black text-indigo-900 leading-tight block">{dateInfo.dayNum}</span>
                    <span className="text-[11px] font-semibold text-slate-500 block">ខែ {dateInfo.monthName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{dateInfo.year}</span>
                  </div>

                  {/* Center: Main details */}
                  <div className="flex-1 space-y-2.5 w-full">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {/* Category Badge */}
                      <span className={`px-2.5 py-0.5 rounded-lg font-bold border flex items-center gap-1 ${catConf.bg} ${catConf.text} ${catConf.border}`}>
                        <span>{catConf.icon}</span>
                        <span>{catConf.label}</span>
                      </span>

                      {/* Shift Badge */}
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200 flex items-center gap-1">
                        {shiftConf.icon}
                        <span>{shiftConf.label}</span>
                      </span>

                      {/* Atmosphere Mood */}
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${moodConf.badgeClass}`}>
                        <span>{moodConf.icon}</span>
                        <span>{moodConf.label}</span>
                      </span>

                      {/* Absent counter if > 0 */}
                      {log.absentCount !== undefined && log.absentCount > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                          អវត្តមាន {log.absentCount} នាក់
                        </span>
                      )}

                      {/* Archive Status */}
                      {log.isArchived && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1">
                          <Archive className="w-3 h-3" />
                          <span>បណ្ណសារ</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug">
                      {log.title}
                    </h3>

                    {/* Notes Narrative */}
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {log.notes}
                    </p>

                    {/* Key Highlights Chips */}
                    {log.highlights && log.highlights.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>ចំណុចសំខាន់ៗ៖</span>
                        </span>
                        {log.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/60"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer / Teacher stamp */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                        <span>កត់ត្រាដោយ៖ <strong className="text-slate-800">{log.recordedBy}</strong></span>
                      </div>
                      <span className="font-mono text-[10px]">កាលបរិច្ឆេទបង្កើត៖ {log.createdAt}</span>
                    </div>
                  </div>

                  {/* Right / Actions Buttons */}
                  <div className="flex md:flex-col items-center gap-1 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedLogForDetail(log);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                      title="ពិនិត្យលម្អិត"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(log)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="កែសម្រួល"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleArchiveDailyClassLog(log.id)}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                      title={log.isArchived ? 'ដកចេញពីបណ្ណសារ' : 'ដាក់ចូលបណ្ណសារ (Archive)'}
                    >
                      {log.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`តើលោកគ្រូ-អ្នកគ្រូចង់លុបកំណត់ហេតុ «${log.title}» មែនទេ?`)) {
                          onDeleteDailyClassLog(log.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="លុបចេញ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 text-center w-12">ល.រ</th>
                  <th className="py-3 px-4 w-32">កាលបរិច្ឆេទ & វេន</th>
                  <th className="py-3 px-4 w-40">ប្រភេទសកម្មភាព</th>
                  <th className="py-3 px-4">ចំណងជើង & សកម្មភាពសង្ខេប</th>
                  <th className="py-3 px-4 w-32 text-center">បរិយាកាស</th>
                  <th className="py-3 px-4 w-36">អ្នកកត់ត្រា</th>
                  <th className="py-3 px-4 text-center w-28">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log, idx) => {
                  const dateInfo = formatKhmerDate(log.date);
                  const catConf = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.general;
                  const moodConf = ATMOSPHERE_CONFIG[log.atmosphere] || ATMOSPHERE_CONFIG.calm_focused;
                  const shiftConf = SHIFT_CONFIG[log.shift] || SHIFT_CONFIG.morning;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{log.date}</div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {shiftConf.icon} {shiftConf.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-flex items-center gap-1 ${catConf.bg} ${catConf.text} ${catConf.border}`}>
                          <span>{catConf.icon}</span>
                          <span>{catConf.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{log.title}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{log.notes}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${moodConf.badgeClass}`}>
                          <span>{moodConf.icon}</span>
                          <span>{moodConf.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {log.recordedBy}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedLogForDetail(log);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                            title="មើលលម្អិត"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(log)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                            title="កែសម្រួល"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`តើលោកគ្រូ-អ្នកគ្រូចង់លុបកំណត់ហេតុ «${log.title}» មែនទេ?`)) {
                                onDeleteDailyClassLog(log.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="លុប"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: ADD / EDIT DAILY CLASS LOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {editingLog ? 'កែប្រែកំណត់ហេតុថ្នាក់រៀនប្រចាំថ្ងៃ' : 'កត់ត្រាកំណត់ហេតុថ្នាក់រៀនប្រចាំថ្ងៃថ្មី (Daily Class Log)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ថ្នាក់ទី {selectedGrade}«{selectedSection}» • ឆ្នាំសិក្សា ២០២៤ - ២០២៥
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
              {/* Row 1: Date & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    កាលបរិច្ឆេទកត់ត្រា <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    វេនសិក្សា <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formShift}
                    onChange={e => setFormShift(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value="morning">🌅 វេនព្រឹក (07:00 - 11:00)</option>
                    <option value="afternoon">🌇 វេនរសៀល (13:00 - 17:00)</option>
                    <option value="full_day">☀️ ពេញមួយថ្ងៃ</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ចំណងជើងព្រឹត្តិការណ៍ ឬសកម្មភាពចម្បង <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ការរៀបចំតុបតែងបន្ទប់រៀន និងការធ្វើតេស្តរហ័សគណិតវិទ្យា"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  ប្រភេទសកម្មភាព/ព្រឹត្តិការណ៍ <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => {
                    const isSelected = formCategory === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setFormCategory(key as ClassLogCategory)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? `${conf.bg} ${conf.border} font-bold text-slate-900 ring-2 ring-indigo-500/20`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">{conf.icon}</span>
                        <span className="text-[11px] leading-tight">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Atmosphere / Climate */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  បរិយាកាស និងស្មារតីរបស់ថ្នាក់រៀន <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(ATMOSPHERE_CONFIG).map(([key, conf]) => {
                    const isSelected = formAtmosphere === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setFormAtmosphere(key as ClassAtmosphereMood)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? `${conf.badgeClass} ring-2 ring-indigo-500/20 font-bold`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base block mb-0.5">{conf.icon}</span>
                        <span className="text-[11px] leading-tight block">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ខ្លឹមសារសកម្មភាព និងកំណត់សម្គាល់លម្អិត <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="រៀបរាប់ពីដំណើរការរៀននិងបង្រៀន សកម្មភាពសិស្ស ឧបទ្ទវហេតុ ឬព្រឹត្តិការណ៍សំខាន់ៗដែលបានកើតឡើងក្នុងថ្ងៃនេះ..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 leading-relaxed focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Key Highlights / Bullet Points */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ចំណុចលេចធ្លោ / ស្លាកចំណាំពិសេស (Key Highlights)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="បញ្ចូលចំណុចសំខាន់ (ឧ. វត្តមាន ១០០%, តេស្តជាប់ ៩០%)..."
                    value={formHighlightInput}
                    onChange={e => setFormHighlightInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
                  >
                    បន្ថែម
                  </button>
                </div>

                {formHighlights.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {formHighlights.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs flex items-center gap-1.5 font-medium"
                      >
                        <span>✓ {tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Row: Absent Count & Recorded By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ចំនួនសិស្សអវត្តមានក្នុងថ្ងៃនេះ (នាក់)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formAbsentCount}
                    onChange={e => setFormAbsentCount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    គ្រូបន្ទុកថ្នាក់កត់ត្រា <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formRecordedBy}
                    onChange={e => setFormRecordedBy(e.target.value)}
                    required
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLog ? 'រក្សាទុកការកែប្រែ' : 'កត់ត្រាទុកក្នុងបណ្ណសារ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: VIEW FULL DETAIL */}
      {isDetailModalOpen && selectedLogForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ព័ត៌មានលម្អិតនៃកំណត់ហេតុថ្នាក់រៀន</h3>
                  <span className="text-[11px] text-slate-400">កាលបរិច្ឆេទ៖ {selectedLogForDetail.date}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">ចំណងជើង៖</span>
                <h4 className="font-bold text-slate-800 text-base">{selectedLogForDetail.title}</h4>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  {CATEGORY_CONFIG[selectedLogForDetail.category]?.icon} {CATEGORY_CONFIG[selectedLogForDetail.category]?.label}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  {SHIFT_CONFIG[selectedLogForDetail.shift]?.label}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  {ATMOSPHERE_CONFIG[selectedLogForDetail.atmosphere]?.icon} {ATMOSPHERE_CONFIG[selectedLogForDetail.atmosphere]?.label}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">ខ្លឹមសារ និងកំណត់សម្គាល់៖</span>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedLogForDetail.notes}
                </div>
              </div>

              {selectedLogForDetail.highlights && selectedLogForDetail.highlights.length > 0 && (
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">ចំណុចលេចធ្លោ៖</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedLogForDetail.highlights.map((h, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px]">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                <span>កត់ត្រាដោយ៖ <strong className="text-slate-800">{selectedLogForDetail.recordedBy}</strong></span>
                <span>អវត្តមាន៖ <strong className="text-slate-800">{selectedLogForDetail.absentCount || 0} នាក់</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: PRINT OFFICIAL CLASS LOGBOOK */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Actions Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  ទម្រង់បោះពុម្ពសៀវភៅតាមដាន និងកំណត់ហេតុថ្នាក់រៀនប្រចាំថ្ងៃ
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ពឥឡូវនេះ</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-6 font-battambang text-slate-900 print:border-none print:p-0">
              {/* MoEYS Official Header */}
              <div className="text-center space-y-1">
                <h3 className="font-moul text-sm text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</h3>
                <h4 className="font-moul text-xs text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
                <div className="w-24 h-0.5 bg-slate-800 mx-auto mt-1 mb-2"></div>
                <div className="text-xs font-bold text-slate-700">
                  <p>មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង</p>
                  <p>ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកភ្នំព្រឹក</p>
                  <p className="font-moul text-indigo-900 text-sm mt-1">សាលាបឋមសិក្សាភ្នំពុំ</p>
                </div>
              </div>

              {/* Title of Document */}
              <div className="text-center space-y-1 pt-2">
                <h2 className="font-moul text-base text-slate-900">
                  សៀវភៅតាមដានព្រឹត្តិការណ៍ និងកំណត់ហេតុថ្នាក់រៀនប្រចាំថ្ងៃ
                </h2>
                <p className="text-xs text-slate-600">
                  ថ្នាក់ទី {selectedGrade} «{selectedSection}» • ឆ្នាំសិក្សា ២០២៤ - ២០២៥
                </p>
                <p className="text-[11px] text-slate-500">
                  គ្រូបន្ទុកថ្នាក់៖ {currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី'}
                </p>
              </div>

              {/* Table of Logs */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-[11px] font-bold text-slate-800 border-b border-slate-400">
                      <th className="py-2.5 px-3 text-center border-r border-slate-300 w-12">ល.រ</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-28">កាលបរិច្ឆេទ</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-32">ប្រភេទសកម្មភាព</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">ខ្លឹមសារសកម្មភាព & ព្រឹត្តិការណ៍</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center">អវត្តមាន</th>
                      <th className="py-2.5 px-3 text-center w-28">ហត្ថលេខា</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {filteredLogs.map((log, idx) => (
                      <tr key={log.id} className="border-b border-slate-300">
                        <td className="py-2.5 px-3 text-center font-bold border-r border-slate-300">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-mono text-[11px]">
                          {log.date}
                          <span className="block text-[10px] text-slate-500">{SHIFT_CONFIG[log.shift]?.label}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-bold text-[11px]">
                          {CATEGORY_CONFIG[log.category]?.label}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 space-y-1">
                          <div className="font-bold text-slate-900">{log.title}</div>
                          <p className="text-[11px] text-slate-600 leading-snug">{log.notes}</p>
                          {log.highlights && log.highlights.length > 0 && (
                            <div className="text-[10px] text-indigo-900 font-medium">
                              ចំណាំ៖ {log.highlights.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-center font-bold">
                          {log.absentCount || 0} នាក់
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400 italic text-[10px]">
                          {log.recordedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-700">បានឃើញ និងឯកភាព</p>
                  <p className="font-moul text-xs mt-1">នាយកសាលា</p>
                  <div className="h-20"></div>
                  <p className="font-bold text-slate-900">លោក លីម សន</p>
                </div>

                <div>
                  <p className="text-slate-600">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០២...</p>
                  <p className="font-moul text-xs mt-1">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-20"></div>
                  <p className="font-bold text-slate-900">{currentTeacher?.nameKhmer || 'លោក ចាន់ វុទ្ធី'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
