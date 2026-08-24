import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActivityLogItem, ActivityDomain, ActiveTab } from '../types';
import {
  Sparkles,
  Users,
  CircleDollarSign,
  FileText,
  GraduationCap,
  HeartPulse,
  HardDrive,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ChevronRight,
  Calendar,
  Cloud,
  FileCode2,
  ShieldCheck,
  Tag,
  ExternalLink
} from 'lucide-react';
import { formatKhmerRelativeTime, formatKhmerFullDateTime } from '../utils/activityTracker';

interface SchoolActivityFeedProps {
  maxItems?: number;
  onNavigateTab?: (tab: ActiveTab) => void;
  compact?: boolean;
}

export const SchoolActivityFeed: React.FC<SchoolActivityFeedProps> = ({
  maxItems = 10,
  onNavigateTab,
  compact = false
}) => {
  const {
    activityLogs,
    addActivityLog,
    setActiveTab,
    currentUser,
    language
  } = useSchool();

  const [activeCategory, setActiveCategory] = useState<'all' | 'student' | 'finance' | 'document' | 'teacher'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<ActivityLogItem | null>(null);

  const isKhmer = language === 'km';

  // Navigate handler
  const handleNavigate = (tab?: ActiveTab) => {
    if (!tab) return;
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      // Category filter
      if (activeCategory === 'student' && log.domain !== 'student') return false;
      if (activeCategory === 'finance' && log.domain !== 'finance') return false;
      if (activeCategory === 'document' && log.domain !== 'admin' && !log.title.includes('ឯកសារ') && !log.title.includes('Sync') && !log.title.includes('Google')) return false;
      if (activeCategory === 'teacher' && log.domain !== 'teacher' && log.domain !== 'academic') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = log.title?.toLowerCase().includes(query);
        const matchDesc = log.description?.toLowerCase().includes(query);
        const matchEntity = log.entityName?.toLowerCase().includes(query);
        const matchActor = log.actorName?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchEntity && !matchActor) return false;
      }

      return true;
    });
  }, [activityLogs, activeCategory, searchQuery]);

  const displayedLogs = maxItems ? filteredLogs.slice(0, maxItems) : filteredLogs;

  // Add quick simulated activity log for demonstration/testing
  const handleAddSampleActivity = (type: 'student' | 'finance' | 'document') => {
    const now = new Date().toISOString();
    const actor = currentUser?.name || 'លោកនាយក សុខ សំណាង';
    const role = currentUser?.role || 'director';

    if (type === 'student') {
      addActivityLog({
        domain: 'student',
        actionType: 'create',
        title: 'បានចុះឈ្មោះសិស្សថ្មីចូលរៀន',
        description: 'បានចុះឈ្មោះសិស្សថ្មី «កែវ មុនីនាថ» ចូលរៀនថ្នាក់ទី ៥ក សម្រាប់ឆ្នាំសិក្សាថ្មី',
        entityId: `st-new-${Date.now()}`,
        entityCode: `ST-2026-${Math.floor(100 + Math.random() * 900)}`,
        entityName: 'កែវ មុនីនាថ',
        actorName: actor,
        actorRole: role,
        targetTab: 'students',
        tags: ['ចុះឈ្មោះថ្មី', 'ថ្នាក់ទី៥ក']
      });
    } else if (type === 'finance') {
      const amount = 350000;
      addActivityLog({
        domain: 'finance',
        actionType: 'expense',
        title: 'បានកត់ត្រាការចំណាយថវិកាសាលា',
        description: 'ចំណាយទិញសម្ភារការិយាល័យ និងដីសសសម្រាប់គ្រូបង្រៀន',
        entityId: `tx-${Date.now()}`,
        entityCode: `EXP-${Date.now().toString().slice(-4)}`,
        entityName: 'ទិញសម្ភារការិយាល័យ និងដីសស',
        actorName: actor,
        actorRole: role,
        financialAmountRiel: amount,
        financialCategory: 'PB',
        targetTab: 'finance',
        tags: ['ថវិការដ្ឋ PB', 'ចំណាយ']
      });
    } else {
      addActivityLog({
        domain: 'admin',
        actionType: 'document',
        title: 'បាន Sync ឯកសារទៅ Google Drive',
        description: 'បានធ្វើសមកាលកម្មកំណត់ហេតុប្រជុំគ្រូប្រចាំខែទៅ Folder Google Drive សាលា',
        entityId: `doc-${Date.now()}`,
        entityName: 'កំណត់ហេតុកិច្ចប្រជុំគ្រូ_មករា.html',
        actorName: actor,
        actorRole: role,
        targetTab: 'workspace',
        tags: ['Google Drive', 'Sync ជោគជ័យ']
      });
    }
  };

  const getDomainIcon = (domain: ActivityDomain, title: string) => {
    if (title.includes('Google') || title.includes('Drive') || title.includes('Sync')) {
      return <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
    switch (domain) {
      case 'student':
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'finance':
        return <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'teacher':
      case 'academic':
        return <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'admin':
      default:
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getActionBadge = (log: ActivityLogItem) => {
    switch (log.actionType) {
      case 'create':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">ចុះឈ្មោះ / បញ្ចូលថ្មី</span>;
      case 'update':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">កែប្រែទិន្នន័យ</span>;
      case 'expense':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">ចំណាយ</span>;
      case 'income':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">ចំណូល</span>;
      case 'document':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">ឯកសារ / Sync</span>;
      case 'delete':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">លុបទិន្នន័យ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">សកម្មភាព</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-moul leading-tight">
                {isKhmer ? 'សកម្មភាពសាលារៀនទាន់ហេតុការណ៍ (Activity Feed)' : 'Real-Time School Activity Feed'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKhmer ? 'កត់ត្រារាល់ការចុះឈ្មោះសិស្ស បច្ចុប្បន្នភាពថវិកា និងការបញ្ជូនឯកសារ' : 'Real-time feed of registrations, budget transactions, and uploads'}
            </p>
          </div>
        </div>

        {/* Quick Add Log Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAddSampleActivity('student')}
            className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-all cursor-pointer flex items-center gap-1"
            title="កត់ត្រាសកម្មភាពចុះឈ្មោះសិស្សថ្មី"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ សិស្ស</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddSampleActivity('finance')}
            className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer flex items-center gap-1"
            title="កត់ត្រាសកម្មភាពថវិកាថ្មី"
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ ថវិកា</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddSampleActivity('document')}
            className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer flex items-center gap-1"
            title="កត់ត្រាសកម្មភាព Sync ឯកសារ"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Sync</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {isKhmer ? 'ទាំងអស់' : 'All'} ({activityLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'student'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'សិស្ស' : 'Students'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('finance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'finance'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'ថវិកា' : 'Budget'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('document')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'document'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'ឯកសារ & Sync' : 'Docs & Sync'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('teacher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'teacher'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'គ្រូ & កិច្ចប្រជុំ' : 'Teachers'}</span>
          </button>
        </div>

        {/* Search inside Feed */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKhmer ? 'ស្វែងរកសកម្មភាព...' : 'Search activity...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Activity Logs Stream */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto max-h-[460px]">
        {displayedLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-semibold">{isKhmer ? 'មិនមានសកម្មភាពត្រូវគ្នានឹងការស្វែងរកឡើយ' : 'No activities matching the criteria'}</p>
            <p className="text-xs mt-1 text-slate-400">{isKhmer ? 'រាល់សកម្មភាពចុះឈ្មោះ ថវិកា និង Sync នឹងបង្ហាញនៅទីនេះ' : 'All registrations, budget updates, and sync actions will appear here.'}</p>
          </div>
        ) : (
          displayedLogs.map((log) => {
            const timeAgo = formatKhmerRelativeTime(log.timestamp);
            const fullDate = formatKhmerFullDateTime(log.timestamp);

            return (
              <div
                key={log.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3 group"
              >
                {/* Left side: Domain Icon & Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200/60 dark:border-slate-700">
                    {getDomainIcon(log.domain, log.title)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {log.title}
                      </span>
                      {getActionBadge(log)}
                      {log.financialAmountRiel && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono">
                          {log.financialAmountRiel.toLocaleString()} រៀល
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-1.5 leading-relaxed">
                      {log.description}
                    </p>

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span title={fullDate} className="font-medium text-slate-500 dark:text-slate-400">
                          {timeAgo}
                        </span>
                      </span>

                      <span>•</span>

                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {log.actorName} <span className="text-slate-400 font-normal">({log.actorRole})</span>
                      </span>

                      {log.entityCode && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {log.entityCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Action navigation button */}
                {log.targetTab && (
                  <button
                    type="button"
                    onClick={() => handleNavigate(log.targetTab)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 text-slate-400 transition-all flex-shrink-0 cursor-pointer"
                    title={isKhmer ? `បើកទៅកាន់ផ្ទាំង ${log.targetTab}` : `Go to ${log.targetTab}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer link to full activity logs */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {isKhmer ? `បង្ហាញ ${displayedLogs.length} ក្នុងចំណោម ${filteredLogs.length} សកម្មភាព` : `Showing ${displayedLogs.length} of ${filteredLogs.length} activities`}
        </span>
        <button
          type="button"
          onClick={() => handleNavigate('activity_logs')}
          className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>{isKhmer ? 'មើលកំណត់ត្រាសវនកម្មពេញលេញ' : 'View Full Audit Trail'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
