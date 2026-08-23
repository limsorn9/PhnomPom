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
  FileSpreadsheet,
  Trash2,
  Tag,
  ShieldCheck,
  Building,
  Layers,
  FileText,
  AlertCircle,
  X,
  Printer,
  Cloud,
  Check
} from 'lucide-react';
import { AngkorPageWatermark, MoEYSRoyalHeader } from './AngkorMotif';
import { printElement } from '../utils/printUtils';

interface ActivityLogProps {
  embedded?: boolean;
  maxItems?: number;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  embedded = false,
  maxItems,
  onNavigateTab
}) => {
  const {
    activityLogs,
    isCloudSyncing,
    lastCloudSyncTime,
    pullAllFromCloud,
    syncAllToCloud,
    schoolProfile,
    showToast,
    setActiveTab
  } = useSchool();

  // Filter States
  const [selectedDomain, setSelectedDomain] = useState<ActivityDomain | 'all'>('all');
  const [selectedAction, setSelectedAction] = useState<ActivityActionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ActivityLogItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    let result = [...activityLogs];

    // Filter by Domain
    if (selectedDomain !== 'all') {
      result = result.filter(item => item.domain === selectedDomain);
    }

    // Filter by Action Type
    if (selectedAction !== 'all') {
      result = result.filter(item => item.actionType === selectedAction);
    }

    // Filter by Date
    if (dateFilter !== 'all') {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      result = result.filter(item => {
        const itemDate = new Date(item.timestamp);
        const itemDateStr = item.timestamp.split('T')[0];

        if (dateFilter === 'today') {
          return itemDateStr === todayStr;
        } else if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= sevenDaysAgo;
        } else if (dateFilter === 'month') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= thirtyDaysAgo;
        }
        return true;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.entityName && item.entityName.toLowerCase().includes(q)) ||
        (item.entityCode && item.entityCode.toLowerCase().includes(q)) ||
        item.actorName.toLowerCase().includes(q) ||
        item.actorRole.toLowerCase().includes(q)
      );
    }

    // Limit if needed
    if (maxItems && maxItems > 0) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [activityLogs, selectedDomain, selectedAction, dateFilter, searchQuery, maxItems]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = activityLogs.length;
    const studentCount = activityLogs.filter(a => a.domain === 'student').length;
    const teacherCount = activityLogs.filter(a => a.domain === 'teacher').length;
    const scoreCount = activityLogs.filter(a => a.domain === 'academic' || a.actionType === 'score').length;
    const attendanceCount = activityLogs.filter(a => a.actionType === 'attendance').length;
    const financeCount = activityLogs.filter(a => a.domain === 'finance').length;

    return {
      total,
      studentCount,
      teacherCount,
      scoreCount,
      attendanceCount,
      financeCount
    };
  }, [activityLogs]);

  const handleRefreshCloud = async () => {
    setIsRefreshing(true);
    try {
      await pullAllFromCloud();
      showToast('បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាសកម្មភាពពី Cloud Firestore រួចរាល់!', 'success');
    } catch (err) {
      showToast('បរាជ័យក្នុងការទាញយកពី Cloud', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrintAudit = () => {
    printElement('printable-activity-audit', {
      pageTitle: `កំណត់ត្រាសកម្មភាពនិងគណនេយ្យភាព_${schoolProfile.academicYear}`,
      landscape: false
    });
  };

  const getDomainBadge = (domain: ActivityDomain) => {
    switch (domain) {
      case 'student':
        return { label: 'សិស្សានុសិស្ស', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Users };
      case 'teacher':
        return { label: 'បុគ្គលិក-គ្រូ', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: GraduationCap };
      case 'academic':
        return { label: 'សិក្សាធិការ-ពិន្ទុ', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Layers };
      case 'finance':
        return { label: 'ហិរញ្ញវត្ថុ-ថវិកា', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: CircleDollarSign };
      case 'admin':
        return { label: 'រដ្ឋបាល-ទូទៅ', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Building };
      default:
        return { label: 'ប្រព័ន្ធ', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: ShieldCheck };
    }
  };

  const getActionBadge = (action: ActivityActionType) => {
    switch (action) {
      case 'create':
        return { label: 'បន្ថែមថ្មី', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'update':
        return { label: 'កែប្រែទិន្នន័យ', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'delete':
        return { label: 'លុបចេញ', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'attendance':
        return { label: 'កត់ត្រាវត្តមាន / Check-in', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'score':
        return { label: 'បញ្ចូលពិន្ទុ', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'transfer':
        return { label: 'ផ្ទេរសិស្ស', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'income':
      case 'expense':
        return { label: 'ប្រតិបត្តិការថវិកា', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'approval':
        return { label: 'អនុម័ត', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: 'ប្រតិបត្តិការ', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Cloud Sync Status */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <AngkorPageWatermark />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold font-moul text-slate-900">
                  កំណត់ត្រាសកម្មភាពនិងគណនេយ្យភាព (Activity Audit Log)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-indigo-500" />
                  <span>Firestore Synced</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                តារាងតាមដានរាល់ការកែប្រែទិន្នន័យ ការបន្ថែមសិស្ស ការកត់ត្រាពិន្ទុ និងវត្តមានក្នុងប្រព័ន្ធ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleRefreshCloud}
              disabled={isRefreshing || isCloudSyncing}
              className="px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-xs flex items-center gap-2 transition-all"
              title="ទាញយកកំណែចុងក្រោយពី Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isRefreshing ? 'កំពុងទាញយក...' : 'ផ្ទុកឡើងវិញពី Cloud'}</span>
            </button>

            <button
              onClick={handlePrintAudit}
              className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ពកំណត់ត្រា</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-slate-100 relative z-10 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-500 font-medium">សកម្មភាពសរុប</span>
            <p className="text-base font-bold text-slate-900 font-times mt-0.5">{stats.total}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[10px] text-blue-700 font-medium">ទិន្នន័យសិស្ស</span>
            <p className="text-base font-bold text-blue-950 font-times mt-0.5">{stats.studentCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-[10px] text-indigo-700 font-medium">បុគ្គលិក-គ្រូ</span>
            <p className="text-base font-bold text-indigo-950 font-times mt-0.5">{stats.teacherCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
            <span className="text-[10px] text-purple-700 font-medium">ពិន្ទុនិងលទ្ធផល</span>
            <p className="text-base font-bold text-purple-950 font-times mt-0.5">{stats.scoreCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-medium">វត្តមាន & Check-in</span>
            <p className="text-base font-bold text-emerald-950 font-times mt-0.5">{stats.attendanceCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="text-[10px] text-amber-700 font-medium">ហិរញ្ញវត្ថុ</span>
            <p className="text-base font-bold text-amber-950 font-times mt-0.5">{stats.financeCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមចំណងជើង អ្នកកែប្រែ អត្តលេខ..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">គ្រប់ផ្នែកទាំងអស់ (All Domains)</option>
              <option value="student">សិស្សានុសិស្ស (Students)</option>
              <option value="teacher">បុគ្គលិក-គ្រូបង្រៀន (Teachers)</option>
              <option value="academic">ពិន្ទុនិងការប្រឡង (Academic)</option>
              <option value="finance">ហិរញ្ញវត្ថុ-ថវិកា (Finance)</option>
              <option value="admin">រដ្ឋបាលទូទៅ (Admin)</option>
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">គ្រប់ប្រភេទសកម្មភាព (All Actions)</option>
              <option value="create">បន្ថែមថ្មី (Create)</option>
              <option value="update">កែប្រែ (Update)</option>
              <option value="delete">លុបចេញ (Delete)</option>
              <option value="attendance">កត់ត្រាវត្តមាន / Check-in</option>
              <option value="score">បញ្ចូលពិន្ទុ (Score)</option>
              <option value="transfer">ផ្ទេរសិស្ស (Transfer)</option>
              <option value="approval">អនុម័ត (Approval)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">កាលបរិច្ឆេទទាំងអស់</option>
              <option value="today">ថ្ងៃនេះ (Today)</option>
              <option value="7days">៧ ថ្ងៃចុងក្រោយ (Last 7 Days)</option>
              <option value="month">៣០ ថ្ងៃចុងក្រោយ (Last 30 Days)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            បង្ហាញចំនួន <strong className="text-slate-900 font-bold font-times">{filteredLogs.length}</strong> នៃសកម្មភាពសរុប {activityLogs.length}
          </span>
          {lastCloudSyncTime && (
            <span className="text-[11px] text-slate-400">
              Cloud Sync ចុងក្រោយ៖ {new Date(lastCloudSyncTime).toLocaleTimeString('km-KH')}
            </span>
          )}
        </div>
      </div>

      {/* Activity Log List (Read-Only) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">មិនមានកំណត់ត្រាសកម្មភាពត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ</p>
            <p className="text-xs text-slate-400 mt-1">រាល់ការកែប្រែទិន្នន័យនឹងត្រូវកត់ត្រាដោយស្វ័យប្រវត្តិក្នុងប្រព័ន្ធ</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map(item => {
              const domainInfo = getDomainBadge(item.domain);
              const actionInfo = getActionBadge(item.actionType);
              const DomainIcon = domainInfo.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForDetail(item)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border mt-0.5 ${domainInfo.bg}`}>
                      <DomainIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${domainInfo.bg}`}>
                          {domainInfo.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${actionInfo.bg}`}>
                          {actionInfo.label}
                        </span>
                        {item.entityCode && (
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.entityCode}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{item.actorName} ({item.actorRole})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatKhmerRelativeTime(item.timestamp)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  ព័ត៌មានលម្អិតនៃសកម្មភាព
                </span>
                <h3 className="text-base font-bold font-moul text-slate-900 mt-0.5">
                  {selectedItemForDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">បរិយាយ (Description):</span>
                <p className="text-slate-800 text-xs leading-relaxed">{selectedItemForDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">ផ្នែក (Domain)</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{getDomainBadge(selectedItemForDetail.domain).label}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">ប្រភេទសកម្មភាព (Action)</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{getActionBadge(selectedItemForDetail.actionType).label}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">អ្នកប្រតិបត្តិ (Actor)</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedItemForDetail.actorName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold block">តួនាទី (Role)</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedItemForDetail.actorRole}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold block">កាលបរិច្ឆេទនិងម៉ោងពិតប្រាកដ</span>
                  <span className="font-times font-bold text-indigo-950 mt-0.5 block">
                    {formatKhmerFullDateTime(selectedItemForDetail.timestamp)}
                  </span>
                </div>
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>

              {selectedItemForDetail.targetTab && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab && selectedItemForDetail.targetTab) {
                      onNavigateTab(selectedItemForDetail.targetTab);
                    } else if (setActiveTab && selectedItemForDetail.targetTab) {
                      setActiveTab(selectedItemForDetail.targetTab);
                    }
                    setSelectedItemForDetail(null);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងទាក់ទង</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Container for Official Audit Sheet */}
      <div id="printable-activity-audit" className="hidden print:block p-8 space-y-6">
        <MoEYSRoyalHeader
          schoolName={schoolProfile.nameKhmer}
          academicYear={schoolProfile.academicYear}
          documentTitle="កំណត់ត្រាគណនេយ្យភាពនិងសកម្មភាពប្រព័ន្ធ (System Audit & Activity Log)"
        />

        <div className="text-xs text-slate-600 flex justify-between border-b pb-2">
          <span>កាលបរិច្ឆេទទាញចេញ៖ {new Date().toLocaleDateString('km-KH')}</span>
          <span>ចំនួនកំណត់ត្រាសរុប៖ {filteredLogs.length} ករណី</span>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-[10px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 p-1.5 text-center">ល.រ</th>
              <th className="border border-slate-400 p-1.5 text-left">កាលបរិច្ឆេទ & ម៉ោង</th>
              <th className="border border-slate-400 p-1.5 text-left">ផ្នែក</th>
              <th className="border border-slate-400 p-1.5 text-left">សកម្មភាព</th>
              <th className="border border-slate-400 p-1.5 text-left">បរិយាយសង្ខេប</th>
              <th className="border border-slate-400 p-1.5 text-left">អ្នកប្រតិបត្តិ</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice(0, 50).map((log, idx) => (
              <tr key={log.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-400 p-1.5 text-center font-mono">{idx + 1}</td>
                <td className="border border-slate-400 p-1.5 font-mono">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                <td className="border border-slate-400 p-1.5">{getDomainBadge(log.domain).label}</td>
                <td className="border border-slate-400 p-1.5">{log.title}</td>
                <td className="border border-slate-400 p-1.5">{log.description}</td>
                <td className="border border-slate-400 p-1.5">{log.actorName} ({log.actorRole})</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between pt-8 text-xs">
          <div className="text-center">
            <p className="font-bold">អ្នករៀបចំ</p>
            <div className="h-16" />
            <p>លេខាធិការដ្ឋាន</p>
          </div>
          <div className="text-center">
            <p className="font-bold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
            <p className="font-bold font-moul mt-1">នាយកសាលា</p>
            <div className="h-16" />
            <p className="font-bold">{schoolProfile.directorName || 'លោក លីម សន'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
