import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  ActivityLogItem,
  ActivityDomain,
  ActivityActionType,
  ActiveTab
} from '../types';
import {
  formatKhmerRelativeTime,
  formatKhmerFullDateTime,
  enrichLogsWithAnomalies
} from '../utils/activityTracker';
import {
  generateOperationalImpactSummary
} from '../utils/activityImpactAnalyzer';
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
  AlertCircle,
  Printer,
  Zap,
  BarChart2,
  GitCompare,
  ShieldAlert,
  AlertTriangle,
  HardDrive,
  Settings,
  CheckSquare,
  Square,
  Check,
  Keyboard,
  Archive,
  ArchiveRestore,
  Table as TableIcon,
  List as ListIcon,
  MessageSquare,
  AlertOctagon,
  CloudUpload,
  Bookmark
} from 'lucide-react';
import { Activity7DayChart } from './activity/Activity7DayChart';
import { ActivityQuickActionModal } from './activity/ActivityQuickActionModal';
import { ActivityPrintReportModal } from './activity/ActivityPrintReportModal';
import { ActivityRetentionModal } from './activity/ActivityRetentionModal';
import { ActivityDiffModal } from './activity/ActivityDiffModal';
import { ActivityAnomalySidePanel } from './activity/ActivityAnomalySidePanel';
import { PrintOptimizedBadge } from './activity/PrintOptimizedBadge';
import { LastSynchronizedBadge } from './activity/LastSynchronizedBadge';
import { ActivityTableView } from './activity/ActivityTableView';
import { ActivityBulkActionModal } from './activity/ActivityBulkActionModal';
import { ActivityKeyboardShortcutsModal } from './activity/ActivityKeyboardShortcutsModal';
import { ActivitySavedViewsBar } from './activity/ActivitySavedViewsBar';
import { ActivityCommentsModal } from './activity/ActivityCommentsModal';
import { ActivityHealthMonitorWidget } from './activity/ActivityHealthMonitorWidget';
import { ActivityDriveScheduleModal } from './activity/ActivityDriveScheduleModal';
import { ActivitySavedView } from '../types';
import { getSavedViews } from '../utils/activitySavedViews';
import { enrichLogsWithHealthAndRisk } from '../utils/activityHealthMonitor';
import { enrichLogsWithComments } from '../utils/activityCommentManager';

interface RecentActivityDashboardProps {
  embedded?: boolean;
  maxItems?: number;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenStudentAnalytics?: (studentId: string) => void;
}

export const RecentActivityDashboard: React.FC<RecentActivityDashboardProps> = ({
  embedded = false,
  maxItems,
  onNavigateTab,
  onOpenStudentAnalytics
}) => {
  const {
    activityLogs,
    addActivityLog,
    updateActivityLogs,
    clearActivityLogs,
    setActiveTab,
    currentUser,
    students,
    teachers,
    budgetTransactions,
    schoolProfile,
    isCloudSyncing,
    lastCloudSyncTime,
    syncAllToCloud
  } = useSchool();

  // View Mode: 'table' vs 'list'
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');

  // Filters State
  const [selectedDomain, setSelectedDomain] = useState<ActivityDomain | 'all'>('all');
  const [selectedAction, setSelectedAction] = useState<ActivityActionType | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'last_month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ActivityLogItem | null>(null);
  const [selectedItemForQuickAction, setSelectedItemForQuickAction] = useState<ActivityLogItem | null>(null);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);

  // New Features State: Retention Modal, Diff Modal, Anomaly Panel, Diff Selection
  const [isRetentionModalOpen, setIsRetentionModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isAnomalyPanelOpen, setIsAnomalyPanelOpen] = useState(false);
  const [diffLogA, setDiffLogA] = useState<ActivityLogItem | null>(null);
  const [diffLogB, setDiffLogB] = useState<ActivityLogItem | null>(null);
  const [isDiffSelectMode, setIsDiffSelectMode] = useState(false);
  const [selectedDiffIds, setSelectedDiffIds] = useState<string[]>([]);
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [showReportCardOnly, setShowReportCardOnly] = useState(false);
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Keyboard Navigation, Bulk Selection & Shortcuts
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [bulkModalAction, setBulkModalAction] = useState<'delete' | 'archive' | 'unarchive' | null>(null);
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Saved Views, Health Monitor, Drive Schedule, Comments States
  const [savedViewsList, setSavedViewsList] = useState<ActivitySavedView[]>(getSavedViews());
  const [activeViewId, setActiveViewId] = useState<string | null>('sys_all');
  const [showHighRiskOnly, setShowHighRiskOnly] = useState<boolean>(false);
  const [isDriveScheduleModalOpen, setIsDriveScheduleModalOpen] = useState<boolean>(false);
  const [selectedItemForComments, setSelectedItemForComments] = useState<ActivityLogItem | null>(null);

  // Enriched Logs with Anomaly Detection, Health Risk Scoring, and Comments
  const enrichedLogs = useMemo(() => {
    const withAnomalies = enrichLogsWithAnomalies(activityLogs);
    const withHealth = enrichLogsWithHealthAndRisk(withAnomalies);
    const withComments = enrichLogsWithComments(withHealth);
    return withComments;
  }, [activityLogs]);

  // Total Anomalies Count across all logs
  const totalAnomaliesCount = useMemo(() => {
    return enrichedLogs.reduce((acc, log) => acc + (log.anomalies?.length || 0), 0);
  }, [enrichedLogs]);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setLocalToast({ message, type });
    setTimeout(() => {
      setLocalToast(null);
    }, 4000);
  };

  // Toggle Diff Selection for comparing 2 items
  const toggleDiffSelect = (logId: string) => {
    setSelectedDiffIds(prev => {
      if (prev.includes(logId)) {
        return prev.filter(id => id !== logId);
      }
      if (prev.length < 2) {
        return [...prev, logId];
      }
      // If already 2 selected, replace the second one
      return [prev[0], logId];
    });
  };

  // Launch Diff Modal from selection
  const handleLaunchDiffFromSelection = () => {
    if (selectedDiffIds.length === 2) {
      const itemA = enrichedLogs.find(l => l.id === selectedDiffIds[0]);
      const itemB = enrichedLogs.find(l => l.id === selectedDiffIds[1]);
      if (itemA && itemB) {
        setDiffLogA(itemA);
        setDiffLogB(itemB);
        setIsDiffModalOpen(true);
      }
    }
  };

  // Launch Diff Modal for an individual row
  const handleOpenDiffForRow = (item: ActivityLogItem) => {
    const matchingLog = enrichedLogs.find(
      l => l.id !== item.id && (l.entityId === item.entityId || (l.entityCode && l.entityCode === item.entityCode))
    );
    const fallbackLog = enrichedLogs.find(l => l.id !== item.id) || item;
    setDiffLogA(item);
    setDiffLogB(matchingLog || fallbackLog);
    setIsDiffModalOpen(true);
  };

  // Manual Log Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualDomain, setManualDomain] = useState<ActivityDomain>('admin');
  const [manualDescription, setManualDescription] = useState('');
  const [manualEntityName, setManualEntityName] = useState('');

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = enrichedLogs.length;
    const studentEvents = enrichedLogs.filter(a => a.domain === 'student').length;
    const teacherEvents = enrichedLogs.filter(a => a.domain === 'teacher').length;
    const financeEvents = enrichedLogs.filter(a => a.domain === 'finance').length;
    const academicEvents = enrichedLogs.filter(a => a.domain === 'academic').length;
    const reportCardEvents = enrichedLogs.filter(a => a.tags?.includes('report_card') || a.tags?.includes('principal_qr_signature') || a.title?.includes('ព្រឹត្តិបត្រពិន្ទុ')).length;

    const totalMoneyFlow = enrichedLogs
      .filter(a => a.domain === 'finance' && a.financialAmountRiel)
      .reduce((sum, a) => sum + (a.financialAmountRiel || 0), 0);

    return {
      total,
      studentEvents,
      teacherEvents,
      financeEvents,
      academicEvents,
      reportCardEvents,
      totalMoneyFlow
    };
  }, [enrichedLogs]);

  // Extract unique actors for filtering
  const uniqueActors = useMemo(() => {
    const actorsSet = new Set<string>();
    enrichedLogs.forEach(log => {
      if (log.actorName) actorsSet.add(log.actorName);
    });
    return Array.from(actorsSet);
  }, [enrichedLogs]);

  // Filtered Activities
  const filteredLogs = useMemo(() => {
    return enrichedLogs.filter(log => {
      // Archive Filter
      if (archiveFilter === 'active' && log.isArchived) return false;
      if (archiveFilter === 'archived' && !log.isArchived) return false;

      // Anomalies Only filter
      if (showAnomaliesOnly && (!log.anomalies || log.anomalies.length === 0)) {
        return false;
      }

      // High Risk Only filter
      if (showHighRiskOnly && !log.isHighRisk) {
        return false;
      }

      // Report Card & QR Signature Only filter
      if (showReportCardOnly) {
        const isReportCard = log.tags?.includes('report_card') || log.tags?.includes('principal_qr_signature') || log.title?.includes('ព្រឹត្តិបត្រពិន្ទុ');
        if (!isReportCard) return false;
      }

      // Domain filter
      if (selectedDomain !== 'all' && log.domain !== selectedDomain) return false;

      // Action type filter
      if (selectedAction !== 'all' && log.actionType !== selectedAction) return false;

      // User role filter
      if (selectedRole !== 'all') {
        const roleLower = (log.actorRole || '').toLowerCase();
        if (selectedRole === 'director' && !roleLower.includes('នាយក') && !roleLower.includes('director')) return false;
        if (selectedRole === 'teacher' && !roleLower.includes('គ្រូ') && !roleLower.includes('teacher')) return false;
        if (selectedRole === 'secretary' && !roleLower.includes('លេខា') && !roleLower.includes('secretary')) return false;
        if (selectedRole === 'librarian' && !roleLower.includes('បណ្ណារក្ស') && !roleLower.includes('librarian')) return false;
        if (selectedRole === 'student' && !roleLower.includes('សិស្ស') && !roleLower.includes('student')) return false;
        if (selectedRole === 'system' && !roleLower.includes('ប្រព័ន្ធ') && !roleLower.includes('system')) return false;
      }

      // Actor filter
      if (selectedActor !== 'all' && log.actorName !== selectedActor) return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = log.title?.toLowerCase().includes(query);
        const matchDesc = log.description?.toLowerCase().includes(query);
        const matchEntity = log.entityName?.toLowerCase().includes(query);
        const matchActor = log.actorName?.toLowerCase().includes(query);
        const matchCode = log.entityCode?.toLowerCase().includes(query);
        const matchCategory = log.financialCategory?.toLowerCase().includes(query);
        const matchTags = log.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchEntity && !matchActor && !matchCode && !matchCategory && !matchTags) {
          return false;
        }
      }

      // Date Range filter
      if (dateFilter !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();

        if (dateFilter === 'today') {
          const isToday =
            logDate.getDate() === now.getDate() &&
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === 'yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const isYesterday =
            logDate.getDate() === yesterday.getDate() &&
            logDate.getMonth() === yesterday.getMonth() &&
            logDate.getFullYear() === yesterday.getFullYear();
          if (!isYesterday) return false;
        } else if (dateFilter === '7days') {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7 || diffDays < 0) return false;
        } else if (dateFilter === '30days') {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30 || diffDays < 0) return false;
        } else if (dateFilter === 'month') {
          const isThisMonth =
            logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
          if (!isThisMonth) return false;
        } else if (dateFilter === 'last_month') {
          const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          const isLastMonth =
            logDate.getMonth() === lastMonth && logDate.getFullYear() === lastMonthYear;
          if (!isLastMonth) return false;
        } else if (dateFilter === 'custom') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (logDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (logDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [enrichedLogs, archiveFilter, showAnomaliesOnly, showHighRiskOnly, selectedDomain, selectedAction, selectedRole, selectedActor, searchQuery, dateFilter, customStartDate, customEndDate]);

  // Saved View Selection Handler
  const handleSelectSavedView = (view: ActivitySavedView) => {
    setActiveViewId(view.id);
    if (view.filters.searchQuery !== undefined) setSearchQuery(view.filters.searchQuery);
    if (view.filters.selectedDomain !== undefined) setSelectedDomain(view.filters.selectedDomain);
    if (view.filters.selectedAction !== undefined) setSelectedAction(view.filters.selectedAction);
    if (view.filters.selectedRole !== undefined) setSelectedRole(view.filters.selectedRole);
    if (view.filters.selectedActor !== undefined) setSelectedActor(view.filters.selectedActor);
    if (view.filters.dateFilter !== undefined) setDateFilter(view.filters.dateFilter);
    if (view.filters.customStartDate !== undefined) setCustomStartDate(view.filters.customStartDate);
    if (view.filters.customEndDate !== undefined) setCustomEndDate(view.filters.customEndDate);
    if (view.filters.showAnomaliesOnly !== undefined) setShowAnomaliesOnly(view.filters.showAnomaliesOnly);
    if (view.filters.showHighRiskOnly !== undefined) setShowHighRiskOnly(view.filters.showHighRiskOnly);
    if (view.filters.archiveFilter !== undefined) setArchiveFilter(view.filters.archiveFilter);
    if (view.filters.viewMode !== undefined) setViewMode(view.filters.viewMode);
    showToast(`បានអនុវត្ត View «${view.name}» រួចរាល់`, 'info');
  };

  const handleRefreshSavedViews = () => {
    setSavedViewsList(getSavedViews());
  };

  const displayedLogs = maxItems ? filteredLogs.slice(0, maxItems) : filteredLogs;

  // Selection Handlers
  const toggleSelectLog = (id: string) => {
    setSelectedLogIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllLogs = () => {
    const currentIds = displayedLogs.map(l => l.id);
    const allSelected = currentIds.length > 0 && currentIds.every(id => selectedLogIds.includes(id));
    if (allSelected) {
      setSelectedLogIds(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      setSelectedLogIds(prev => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  // Bulk Execution Handler
  const handleExecuteBulkAction = () => {
    if (!bulkModalAction || selectedLogIds.length === 0) return;
    const count = selectedLogIds.length;

    if (bulkModalAction === 'delete') {
      const updated = activityLogs.filter(l => !selectedLogIds.includes(l.id));
      updateActivityLogs(updated);
      showToast(`បានលុប ${count} កំណត់ត្រាដោយជោគជ័យ!`, 'success');
    } else if (bulkModalAction === 'archive') {
      const updated = activityLogs.map(l =>
        selectedLogIds.includes(l.id) ? { ...l, isArchived: true } : l
      );
      updateActivityLogs(updated);
      showToast(`បានបណ្ណសារទុក ${count} កំណត់ត្រាដោយជោគជ័យ!`, 'success');
    } else if (bulkModalAction === 'unarchive') {
      const updated = activityLogs.map(l =>
        selectedLogIds.includes(l.id) ? { ...l, isArchived: false } : l
      );
      updateActivityLogs(updated);
      showToast(`បានស្រង់ចេញពីបណ្ណសារ ${count} កំណត់ត្រាដោយជោគជ័យ!`, 'success');
    }

    setSelectedLogIds([]);
    setBulkModalAction(null);
  };

  // Keyboard Shortcuts Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = Math.min(displayedLogs.length - 1, prev + 1);
          const el = document.getElementById(`activity-row-${displayedLogs[next]?.id}`) || document.getElementById(`activity-item-${displayedLogs[next]?.id}`);
          el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return next;
        });
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = Math.max(0, prev - 1);
          const el = document.getElementById(`activity-row-${displayedLogs[next]?.id}`) || document.getElementById(`activity-item-${displayedLogs[next]?.id}`);
          el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedDiffIds.length === 2) {
          handleLaunchDiffFromSelection();
        } else if (displayedLogs[focusedIndex]) {
          handleOpenDiffForRow(displayedLogs[focusedIndex]);
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (displayedLogs[focusedIndex]) {
          toggleSelectLog(displayedLogs[focusedIndex].id);
        }
      } else if (e.key === 'Delete') {
        if (selectedLogIds.length > 0) {
          e.preventDefault();
          setBulkModalAction('delete');
        }
      } else if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        } else if (bulkModalAction) {
          setBulkModalAction(null);
        } else if (selectedLogIds.length > 0) {
          setSelectedLogIds([]);
        } else if (isDiffSelectMode) {
          setIsDiffSelectMode(false);
          setSelectedDiffIds([]);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if (e.key === 'v' || e.key === 'V') {
        if (displayedLogs[focusedIndex]) {
          e.preventDefault();
          setSelectedItemForDetail(displayedLogs[focusedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedLogs, focusedIndex, selectedDiffIds, selectedLogIds, isShortcutsModalOpen, bulkModalAction, isDiffSelectMode]);

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
    showToast('បានកត់ត្រាសកម្មភាពដោយជោគជ័យ!', 'success');
  };

  // Export to CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const headers = ['កាលបរិច្ឆេទ', 'ប្រភេទផ្នែក', 'សកម្មភាព', 'ចំណងជើង', 'ឈ្មោះទិន្នន័យ', 'អត្តលេខ/កូដ', 'អ្នកកែប្រែ', 'ព័ត៌មានលម្អិត', 'ទឹកប្រាក់ (រៀល)', 'សញ្ញាមិនប្រក្រតី'];
        const rows = filteredLogs.map(log => [
          `"${formatKhmerFullDateTime(log.timestamp)}"`,
          `"${getDomainLabel(log.domain)}"`,
          `"${getActionLabel(log.actionType)}"`,
          `"${log.title.replace(/"/g, '""')}"`,
          `"${log.entityName.replace(/"/g, '""')}"`,
          `"${log.entityCode || '-'}"`,
          `"${log.actorName} (${log.actorRole})"`,
          `"${log.description.replace(/"/g, '""')}"`,
          `"${log.financialAmountRiel ? log.financialAmountRiel.toLocaleString() : '-'}"`,
          `"${log.anomalies && log.anomalies.length > 0 ? log.anomalies.map(a => a.titleKhmer).join('; ') : '-'}"`
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
        showToast('បានទាញយកទិន្នន័យជាឯកសារ Excel/CSV ដោយជោគជ័យ', 'success');
      } catch (err) {
        console.error('Export error:', err);
        showToast('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ CSV', 'error');
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
      {/* Toast Notification Alert */}
      {localToast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
            localToast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : localToast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-800 text-white border-slate-700'
          }`}
        >
          {localToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
          {localToast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-200" />}
          {localToast.type === 'info' && <Sparkles className="w-4 h-4 text-amber-300" />}
          <span>{localToast.message}</span>
        </div>
      )}

      {/* Component Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>កំណត់ត្រាសវនកម្មផ្ទៃក្នុង (Audit Trail)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ផ្សាយផ្ទាល់ Real-Time
              </span>
              <LastSynchronizedBadge
                lastSyncTime={lastCloudSyncTime}
                isSyncing={isCloudSyncing}
                onManualSync={syncAllToCloud}
              />
              <PrintOptimizedBadge />
              {totalAnomaliesCount > 0 && (
                <button
                  id="activity-header-anomalies-badge"
                  onClick={() => setIsAnomalyPanelOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="ចុចដើម្បីពិនិត្យសញ្ញាមិនប្រក្រតីដែលបានរកឃើញ"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                  <span>រកឃើញសញ្ញាមិនប្រក្រតី {totalAnomaliesCount}</span>
                </button>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-moul tracking-wide text-white">
              កំណត់ត្រាសកម្មភាព & ការកែប្រែទិន្នន័យថ្មីៗ
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              តាមដានរាល់ការបង្កើតថ្មី កែសម្រួលព័ត៌មានសិស្ស គ្រូបង្រៀន ចរាចរណ៍ថវិកា និងពិន្ទុសិក្សាទូទាំងសាលារៀន
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {/* Keyboard Shortcuts Trigger Button */}
            <button
              id="activity-shortcuts-guide-btn"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer"
              title="ពិនិត្យបញ្ជីគ្រាប់ចុចកាត់ (Keyboard Shortcuts) [ចុច ?]"
            >
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>គ្រាប់ចុចកាត់ (?)</span>
            </button>

            {/* Anomaly Alerts Button */}
            <button
              id="activity-anomalies-btn"
              onClick={() => setIsAnomalyPanelOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer relative ${
                totalAnomaliesCount > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-2 ring-rose-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="ពិនិត្យសញ្ញាមិនប្រក្រតី & ការប្រកាសអាសន្នសន្តិសុខទិន្នន័យ"
            >
              <ShieldAlert className="w-4 h-4 text-rose-300" />
              <span>សញ្ញាមិនប្រក្រតី</span>
              {totalAnomaliesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-rose-700 font-extrabold text-[11px] flex items-center justify-center">
                  {totalAnomaliesCount}
                </span>
              )}
            </button>

            {/* Diff Comparison Mode Button */}
            <button
              id="activity-diff-mode-btn"
              onClick={() => {
                setIsDiffSelectMode(!isDiffSelectMode);
                if (isDiffSelectMode) {
                  setSelectedDiffIds([]);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer ${
                isDiffSelectMode
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="បើក/បិទ មុខងារជ្រើសរើសប្រៀបធៀបកំណែទិន្នន័យ ២ ចំហៀងគ្នា (Diff View)"
            >
              <GitCompare className="w-4 h-4 text-indigo-300" />
              <span>{isDiffSelectMode ? 'បិទរបៀប Diff' : 'ប្រៀបធៀប Diff'}</span>
            </button>

            {/* Google Drive Automated Summaries Schedule Button */}
            <button
              id="activity-drive-schedule-btn"
              onClick={() => setIsDriveScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/80 text-emerald-100 hover:text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
              title="កាលវិភាគបញ្ជូនរបាយការណ៍សង្ខេបស្វ័យប្រវត្តទៅ Google Drive សាលា"
            >
              <CloudUpload className="w-4 h-4 text-emerald-300" />
              <span>កាលវិភាគ Drive</span>
            </button>

            {/* Retention & Cleanup Settings (Director / Admin) */}
            {currentUser?.role === 'director' && (
              <button
                id="activity-retention-settings-btn"
                onClick={() => setIsRetentionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer"
                title="កំណត់ការសម្អាតស្វ័យប្រវត្តិតាមអាយុកាលទិន្នន័យ (Retention Policy)"
              >
                <Settings className="w-4 h-4 text-slate-300" />
                <span>កំណត់អាយុកាល</span>
              </button>
            )}

            <button
              id="activity-print-pdf-btn"
              onClick={() => setIsPrintReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
              title="បោះពុម្ព ឬទាញយករបាយការណ៍ជា PDF"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព / PDF</span>
            </button>

            <button
              id="activity-email-principal-btn"
              onClick={() => {
                const summaryText = `របាយការណ៍សកម្មភាពប្រចាំសប្តាហ៍ (${schoolProfile.nameKhmer})\n- សកម្មភាពសរុប: ${metrics.total} កំណត់ត្រា\n- សិស្ស: ${metrics.studentEvents} | គ្រូ: ${metrics.teacherEvents} | ហិរញ្ញវត្ថុ: ${metrics.financeEvents}\n- ទឹកប្រាក់សរុប: ${metrics.totalMoneyFlow.toLocaleString()} រៀល\n- បញ្ជូនជូន: ${schoolProfile.principalName} (នាយកសាលា)`;
                const subject = encodeURIComponent(`របាយការណ៍សកម្មភាពសាលាប្រចាំសប្តាហ៍ - ${schoolProfile.nameKhmer}`);
                const body = encodeURIComponent(summaryText);
                window.open(`mailto:principal@school.edu.kh?subject=${subject}&body=${body}`, '_blank');
                showToast(`បានត្រៀមសារអ៊ីម៉ែលផ្ញើជូនលោកនាយក (${schoolProfile.principalName}) ដោយជោគជ័យ!`, 'success');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
              title="សង្ខេបសកម្មភាពប្រចាំសប្តាហ៍ និងផ្ញើជូននាយកសាលាភ្លាមៗតាមអ៊ីម៉ែល (1-Click Email)"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>អ៊ីម៉ែលរបាយការណ៍សប្តាហ៍</span>
            </button>

            <button
              id="activity-manual-log-btn"
              onClick={() => setIsManualLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>កត់ត្រាសកម្មភាព</span>
            </button>

            <button
              id="activity-export-csv-btn"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExporting ? 'កំពុងទាញយក...' : 'ទាញយក CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Automated Health Monitor Diagnostic Bar / Widget */}
      <ActivityHealthMonitorWidget
        logs={enrichedLogs}
        onToggleHighRiskFilter={(active) => setShowHighRiskOnly(active)}
        isHighRiskFilterActive={showHighRiskOnly}
      />

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

      {/* 7-Day Activity Trend & Frequency Diagnostic Chart (Recharts) */}
      <Activity7DayChart
        activityLogs={enrichedLogs}
        onSelectDate={(dateStr) => {
          setDateFilter('custom');
          setCustomStartDate(dateStr);
          setCustomEndDate(dateStr);
        }}
        selectedDateFilter={dateFilter === 'custom' ? customStartDate : undefined}
      />

      {/* Main Content Area: Search, Filters & Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Filters and Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3.5">
          {/* Saved Views Quick Access Bar */}
          <ActivitySavedViewsBar
            savedViews={savedViewsList}
            activeViewId={activeViewId}
            onSelectView={handleSelectSavedView}
            onSaveCurrentView={() => {}}
            currentFilters={{
              selectedDomain,
              selectedAction,
              selectedRole,
              selectedActor,
              searchQuery,
              dateFilter,
              customStartDate,
              customEndDate,
              showAnomaliesOnly,
              showHighRiskOnly,
              archiveFilter,
              viewMode
            }}
            onRefreshSavedViews={handleRefreshSavedViews}
          />

          {/* Domain Tabs & Quick Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => {
                  setSelectedDomain('all');
                  setShowAnomaliesOnly(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedDomain === 'all' && !showAnomaliesOnly
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ទាំងអស់ ({enrichedLogs.length})
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

              {/* Report Card & QR Signatures Quick Toggle Tab */}
              {metrics.reportCardEvents > 0 && (
                <button
                  id="activity-report-cards-filter-btn"
                  onClick={() => setShowReportCardOnly(!showReportCardOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    showReportCardOnly
                      ? 'bg-blue-700 text-white shadow-sm ring-2 ring-blue-300'
                      : 'text-blue-700 hover:bg-blue-100/80 bg-blue-50/50'
                  }`}
                  title="បង្ហាញតែកំណត់ត្រាព្រឹត្តិបត្រពិន្ទុ & QR ហត្ថលេខានាយក"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ព្រឹត្តិបត្រពិន្ទុ & QR ({metrics.reportCardEvents})</span>
                </button>
              )}
              
              {/* Anomalies Quick Toggle Tab */}
              {totalAnomaliesCount > 0 && (
                <button
                  onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    showAnomaliesOnly
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-rose-600 hover:bg-rose-100/70'
                  }`}
                  title="បង្ហាញតែកំណត់ត្រាដែលមានសញ្ញាមិនប្រក្រតី"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>សញ្ញាមិនប្រក្រតី ({totalAnomaliesCount})</span>
                </button>
              )}
            </div>

            {/* Retention Settings & Clear Logs */}
            <div className="flex items-center gap-2">
              {currentUser?.role === 'director' && (
                <button
                  onClick={() => setIsRetentionModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="គ្រប់គ្រងការសម្អាតទិន្នន័យស្វ័យប្រវត្តិ"
                >
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>គ្រប់គ្រងទំហំផ្ទុក</span>
                </button>
              )}

              {currentUser?.role === 'director' && enrichedLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('តើលោកអ្នកពិតជាចង់សម្អាតកំណត់ត្រាសកម្មភាពចាស់ៗទាំងអស់មែនទេ?')) {
                      clearActivityLogs();
                      showToast('បានសម្អាតកំណត់ត្រាសកម្មភាពទាំងអស់ដោយជោគជ័យ', 'info');
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="សម្អាតកំណត់ត្រាសកម្មភាពទាំងអស់"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>សម្អាតទាំងអស់</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Dropdown Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
            {/* Search Input */}
            <div className="sm:col-span-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="activity-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកតាមចំណងជើង ឈ្មោះ អត្តលេខ..."
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

            {/* User Role Dropdown */}
            <div className="sm:col-span-2">
              <select
                id="activity-role-filter"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="all">👑 គ្រប់តួនាទី (All Roles)</option>
                <option value="director">👑 នាយកសាលា (Director)</option>
                <option value="teacher">👨‍🏫 គ្រូបង្រៀន (Teacher)</option>
                <option value="secretary">📋 លេខាធិការ (Secretary)</option>
                <option value="librarian">📚 បណ្ណារក្ស (Librarian)</option>
                <option value="student">🎓 សិស្សានុសិស្ស (Student)</option>
                <option value="system">🤖 ប្រព័ន្ធស្វ័យប្រវត្តិ (System)</option>
              </select>
            </div>

            {/* Action Type Dropdown */}
            <div className="sm:col-span-2">
              <select
                id="activity-action-type-filter"
                value={selectedAction}
                onChange={e => setSelectedAction(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="all">⚡ គ្រប់សកម្មភាព (All Actions)</option>
                <option value="create">➕ បង្កើតថ្មី (Create)</option>
                <option value="update">✏️ កែប្រែព័ត៌មាន (Update)</option>
                <option value="delete">🗑️ លុបទិន្នន័យ (Delete)</option>
                <option value="attendance">📋 កត់ត្រាវត្តមាន (Attendance)</option>
                <option value="score">📝 បញ្ចូលពិន្ទុ (Scores)</option>
                <option value="income">💵 ចំណូលថវិកា (Income)</option>
                <option value="expense">💳 ចំណាយថវិកា (Expense)</option>
                <option value="transfer">🔄 ផ្ទេរសិស្ស (Transfer)</option>
                <option value="document">📑 ឯកសារ (Document)</option>
                <option value="approval">✅ ការអនុម័ត (Approval)</option>
              </select>
            </div>

            {/* Date Range Dropdown */}
            <div className="sm:col-span-3">
              <select
                id="activity-date-range-filter"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="all">🕒 គ្រប់ពេលវេលា (All Time)</option>
                <option value="today">📅 ថ្ងៃនេះ (Today)</option>
                <option value="yesterday">⏮️ ម្សិលមិញ (Yesterday)</option>
                <option value="7days">🗓️ ៧ ថ្ងៃចុងក្រោយ (Last 7 Days)</option>
                <option value="30days">🗓️ ៣០ ថ្ងៃចុងក្រោយ (Last 30 Days)</option>
                <option value="month">📆 ខែនេះ (This Month)</option>
                <option value="last_month">⏪ ខែមុន (Last Month)</option>
                <option value="custom">⚙️ កំណត់កាលបរិច្ឆេទផ្ទាល់ខ្លួន (Custom)...</option>
              </select>
            </div>

            {/* Specific Actor / User Filter */}
            <div className="sm:col-span-2">
              <select
                id="activity-actor-filter"
                value={selectedActor}
                onChange={e => setSelectedActor(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
              >
                <option value="all">👤 អ្នកប្រតិបត្តិ (All)</option>
                {uniqueActors.map(actor => (
                  <option key={actor} value={actor}>
                    {actor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range Picker Row (Appears when 'custom' is selected) */}
          {dateFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>ចន្លោះកាលបរិច្ឆេទកំណត់ផ្ទាល់ខ្លួន៖</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">ចាប់ពីថ្ងៃ៖</span>
                <input
                  id="activity-custom-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">ដល់ថ្ងៃ៖</span>
                <input
                  id="activity-custom-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setCustomStartDate(today);
                    setCustomEndDate(today);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-bold transition-colors"
                >
                  ថ្ងៃនេះ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                    const today = now.toISOString().split('T')[0];
                    setCustomStartDate(firstDay);
                    setCustomEndDate(today);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] font-bold transition-colors"
                >
                  ដើមខែដល់ថ្ងៃនេះ
                </button>
                {(customStartDate || customEndDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-bold transition-colors"
                  >
                    សម្អាតកាលបរិច្ឆេទ
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Controls Bar: View Mode Switcher, Archive Status, Active Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* View Mode & Archive Filters */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200">
                <button
                  type="button"
                  id="activity-viewmode-table-btn"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="ប្តូរទៅទិដ្ឋភាពតារាងពិស្តារ រួមមាន AI Impact Summary (Table View)"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>តារាង (Table)</span>
                </button>
                <button
                  type="button"
                  id="activity-viewmode-list-btn"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="ប្តូរទៅទិដ្ឋភាពបញ្ជីបណ្ណ (Card List View)"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>បញ្ជី (List)</span>
                </button>
              </div>

              {/* Archive Status Selector */}
              <select
                id="activity-archive-status-filter"
                value={archiveFilter}
                onChange={e => setArchiveFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="active">📁 កំណត់ត្រាសកម្ម (Active)</option>
                <option value="archived">📦 បានបណ្ណសារទុក (Archived)</option>
                <option value="all">🌐 ទាំងអស់ (All)</option>
              </select>

              {/* Master Checkbox Toggle */}
              <button
                type="button"
                onClick={toggleSelectAllLogs}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ជ្រើសរើស ឬដកជម្រើសទាំងអស់ក្នុងបញ្ជីនេះ [ចុច Space សម្រាប់ជួរនីមួយៗ]"
              >
                {displayedLogs.length > 0 && displayedLogs.every(l => selectedLogIds.includes(l.id)) ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>ជ្រើសទាំងអស់ ({selectedLogIds.length})</span>
              </button>
            </div>

            {/* Total Results & Export */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] font-bold text-slate-600">
                បង្ហាញ {filteredLogs.length} ក្នុងចំណោម {enrichedLogs.length} កំណត់ត្រា
              </span>
              <button
                type="button"
                id="export-filtered-csv-btn"
                onClick={handleExportCSV}
                disabled={isExporting || filteredLogs.length === 0}
                className="px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="ទាញយកកំណត់ត្រាដែលកំពុងបង្ហាញជាឯកសារ CSV/Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>ទាញយក CSV ({filteredLogs.length})</span>
              </button>
              {(searchQuery || selectedDomain !== 'all' || selectedAction !== 'all' || selectedRole !== 'all' || dateFilter !== 'all' || selectedActor !== 'all' || showAnomaliesOnly || archiveFilter !== 'active') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDomain('all');
                    setSelectedAction('all');
                    setSelectedRole('all');
                    setSelectedActor('all');
                    setDateFilter('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setShowAnomaliesOnly(false);
                    setArchiveFilter('active');
                  }}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  សម្អាតតម្រង
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Badges Bar */}
          {(searchQuery || selectedDomain !== 'all' || selectedAction !== 'all' || selectedRole !== 'all' || dateFilter !== 'all' || selectedActor !== 'all' || showAnomaliesOnly || archiveFilter !== 'active') && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-slate-500 text-[11px] font-bold">តម្រងកំពុងប្រើ៖</span>
              {showAnomaliesOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-[11px]">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  សញ្ញាមិនប្រក្រតី
                  <button onClick={() => setShowAnomaliesOnly(false)} className="hover:text-rose-950 font-bold ml-1">×</button>
                </span>
              )}
              {archiveFilter !== 'active' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[11px]">
                  បណ្ណសារ: {archiveFilter === 'archived' ? 'បានបណ្ណសារទុក' : 'ទាំងអស់'}
                  <button onClick={() => setArchiveFilter('active')} className="hover:text-slate-950 font-bold ml-1">×</button>
                </span>
              )}
              {selectedDomain !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[11px]">
                  ផ្នែក: {getDomainLabel(selectedDomain)}
                  <button onClick={() => setSelectedDomain('all')} className="hover:text-blue-950 font-bold ml-1">×</button>
                </span>
              )}
              {selectedRole !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                  តួនាទី: {selectedRole === 'director' ? 'នាយក' : selectedRole === 'teacher' ? 'គ្រូបង្រៀន' : selectedRole === 'secretary' ? 'លេខា' : selectedRole === 'librarian' ? 'បណ្ណារក្ស' : selectedRole === 'student' ? 'សិស្ស' : 'ស្វ័យប្រវត្តិ'}
                  <button onClick={() => setSelectedRole('all')} className="hover:text-amber-950 font-bold ml-1">×</button>
                </span>
              )}
              {selectedAction !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-[11px]">
                  សកម្មភាព: {getActionLabel(selectedAction)}
                  <button onClick={() => setSelectedAction('all')} className="hover:text-indigo-950 font-bold ml-1">×</button>
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                  កាលបរិច្ឆេទ: {dateFilter === 'custom' ? `${customStartDate || '...'} ដល់ ${customEndDate || '...'}` : dateFilter}
                  <button onClick={() => { setDateFilter('all'); setCustomStartDate(''); setCustomEndDate(''); }} className="hover:text-emerald-950 font-bold ml-1">×</button>
                </span>
              )}
              {selectedActor !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold text-[11px]">
                  អ្នកធ្វើ: {selectedActor}
                  <button onClick={() => setSelectedActor('all')} className="hover:text-purple-950 font-bold ml-1">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                  ពាក្យគន្លឹះ: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-amber-950 font-bold ml-1">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dynamic View: Table View vs Card List View */}
        {viewMode === 'table' ? (
          <ActivityTableView
            logs={displayedLogs}
            selectedIds={selectedLogIds}
            focusedIndex={focusedIndex}
            onToggleSelect={toggleSelectLog}
            onToggleSelectAll={toggleSelectAllLogs}
            onSelectRow={setFocusedIndex}
            onOpenDetail={setSelectedItemForDetail}
            onOpenQuickAction={setSelectedItemForQuickAction}
            onOpenDiff={handleOpenDiffForRow}
            onOpenComments={(item) => setSelectedItemForComments(item)}
            onNavigate={handleNavigate}
            onOpenAnomalyPanel={() => setIsAnomalyPanelOpen(true)}
            getDomainBadgeStyles={getDomainBadgeStyles}
            getDomainLabel={getDomainLabel}
            getActionLabel={getActionLabel}
          />
        ) : (
          /* Card Feed List View */
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
                {(searchQuery || selectedDomain !== 'all' || selectedAction !== 'all' || dateFilter !== 'all' || showAnomaliesOnly || showHighRiskOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDomain('all');
                      setSelectedAction('all');
                      setDateFilter('all');
                      setShowAnomaliesOnly(false);
                      setShowHighRiskOnly(false);
                    }}
                    className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    សម្អាតតម្រងទាំងអស់
                  </button>
                )}
              </div>
            ) : (
              displayedLogs.map((item, idx) => {
                const isIncome = item.actionType === 'income';
                const isExpense = item.actionType === 'expense';
                const isDelete = item.actionType === 'delete';
                const hasAnomalies = item.anomalies && item.anomalies.length > 0;
                const isDiffSelected = selectedDiffIds.includes(item.id);
                const isRowSelected = selectedLogIds.includes(item.id);
                const isFocused = idx === focusedIndex;
                const isBreakAfter = (idx + 1) % 20 === 0 && idx + 1 < displayedLogs.length;
                const impactSummary = generateOperationalImpactSummary(item);

                return (
                  <div
                    key={item.id}
                    id={`activity-item-${item.id}`}
                    onClick={() => {
                      setFocusedIndex(idx);
                      if (isDiffSelectMode) {
                        toggleDiffSelect(item.id);
                      }
                    }}
                    className={`p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                      isBreakAfter ? 'print-break-after-20 print-page-break' : ''
                    } ${
                      isFocused ? 'ring-2 ring-blue-500/70 bg-blue-50/40' : ''
                    } ${
                      isRowSelected
                        ? 'bg-blue-50/60 border-l-4 border-blue-600'
                        : isDiffSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : hasAnomalies
                        ? 'bg-rose-50/30 hover:bg-rose-50/60 border-l-4 border-rose-400'
                        : item.isHighRisk
                        ? 'bg-rose-50/20 hover:bg-rose-50/50 border-l-4 border-rose-500'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Checkbox for Bulk Actions & Diff Selection */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDiffSelectMode) {
                            toggleDiffSelect(item.id);
                          } else {
                            toggleSelectLog(item.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-colors flex-shrink-0 self-center cursor-pointer ${
                          isRowSelected || isDiffSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-300 text-slate-400 hover:border-blue-400'
                        }`}
                        title={
                          isDiffSelectMode
                            ? 'ជ្រើសរើសសម្រាប់ប្រៀបធៀប Diff'
                            : isRowSelected
                            ? 'ដកការជ្រើសរើស'
                            : 'ជ្រើសរើសកំណត់ត្រានេះសម្រាប់ Bulk Actions'
                        }
                      >
                        {isRowSelected || isDiffSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

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
                      <div className="min-w-0 space-y-1.5 flex-1">
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

                          {/* High Risk Health Monitor Flag Badge */}
                          {item.isHighRisk && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-rose-600 text-white border-rose-700 flex items-center gap-1 shadow-2xs"
                              title={item.riskReasonKhmer || 'ហានិភ័យសវនកម្មខ្ពស់'}
                            >
                              <AlertOctagon className="w-3 h-3 text-rose-200 animate-pulse" />
                              <span>ហានិភ័យខ្ពស់ {item.riskScore ? `(${item.riskScore}%)` : ''}</span>
                            </span>
                          )}

                          {/* Entity Code if exists */}
                          {item.entityCode && (
                            <span className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-100/90 border border-slate-200 px-1.5 py-0.5 rounded">
                              {item.entityCode}
                            </span>
                          )}

                          {/* Archive Tag if archived */}
                          {item.isArchived && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                              <Archive className="w-3 h-3 text-slate-500" />
                              <span>បណ្ណសារ</span>
                            </span>
                          )}

                          {/* Comments Badge if any */}
                          {item.comments && item.comments.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItemForComments(item);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors shadow-2xs"
                              title="ចុចដើម្បីពិនិត្យ ឬបន្ថែមមតិយោបល់សវនកម្ម"
                            >
                              <MessageSquare className="w-3 h-3 text-blue-600" />
                              <span>{item.comments.length} មតិ</span>
                            </button>
                          )}

                          {/* Anomalies Flag Badges */}
                          {hasAnomalies && item.anomalies!.map((ano, aIdx) => (
                            <span
                              key={aIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsAnomalyPanelOpen(true);
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 shadow-2xs ${
                                ano.severity === 'critical'
                                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                                  : ano.severity === 'high'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border-amber-300'
                              }`}
                              title={ano.descriptionKhmer}
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>{ano.titleKhmer}</span>
                            </span>
                          ))}

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
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>

                        {/* AI Operational Impact Summary Card */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>ផលប៉ះពាល់ប្រតិបត្តិការសាលា (AI Impact):</span>
                              <span className="text-[10px] font-semibold text-slate-500">[{impactSummary.categoryKhmer}]</span>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                                impactSummary.impactLevel === 'high'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : impactSummary.impactLevel === 'medium'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {impactSummary.impactLevel === 'high' ? 'កម្រិតខ្ពស់' : impactSummary.impactLevel === 'medium' ? 'កម្រិតមធ្យម' : 'កម្រិតទាប'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            {impactSummary.summaryKhmer}
                          </p>
                          {impactSummary.recommendedAction && (
                            <div className="text-[10px] text-blue-800 bg-blue-50/70 p-1.5 rounded-lg border border-blue-200/60 font-medium">
                              💡 <strong>អនុសាសន៍៖</strong> {impactSummary.recommendedAction}
                            </div>
                          )}
                        </div>

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
                        {/* Diff Compare Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDiffForRow(item);
                          }}
                          className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="ប្រៀបធៀប Diff ជាមួយកំណត់ត្រាផ្សេងទៀត"
                        >
                          <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden sm:inline">Diff</span>
                        </button>

                        {/* Comments Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForComments(item);
                          }}
                          className={`px-2.5 py-1.5 border text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                            item.comments && item.comments.length > 0
                              ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800 font-bold'
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                          }`}
                          title="កំណត់សម្គាល់ & មតិយោបល់សវនកម្ម"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>មតិ {item.comments && item.comments.length > 0 ? `(${item.comments.length})` : ''}</span>
                        </button>

                        {/* Quick Action Button */}
                        <button
                          id={`quick-action-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForQuickAction(item);
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer"
                          title="សកម្មភាពរហ័ស & ស្វែងរកកំណត់ត្រាដែលពាក់ព័ន្ធ (Quick Actions)"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          <span>សកម្មភាពរហ័ស</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForDetail(item);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="មើលព័ត៌មានលម្អិត [ចុច v]"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>លម្អិត</span>
                        </button>

                        {item.targetTab && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(item.targetTab);
                            }}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
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
        )}

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

      {/* Floating Diff Selection Toolbar when in diff selection mode */}
      {isDiffSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold font-kantumruy">
              ជ្រើសរើសបាន {selectedDiffIds.length}/2 កំណត់ត្រា
            </span>
          </div>
          {selectedDiffIds.length === 2 ? (
            <button
              onClick={handleLaunchDiffFromSelection}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>បើកផ្ទាំងប្រៀបធៀប Diff</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-300">
              សូមជ្រើសរើសកំណត់ត្រា {2 - selectedDiffIds.length} ទៀតដើម្បីប្រៀបធៀប
            </span>
          )}
          <button
            onClick={() => {
              setIsDiffSelectMode(false);
              setSelectedDiffIds([]);
            }}
            className="text-xs text-slate-400 hover:text-white ml-2 font-semibold cursor-pointer"
          >
            បោះបង់
          </button>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between flex-shrink-0">
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
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
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

              {/* High Risk warning in modal if present */}
              {selectedItemForDetail.isHighRisk && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>ការវិនិច្ឆ័យហានិភ័យខ្ពស់ (Health Monitor): ពិន្ទុ {selectedItemForDetail.riskScore || 85}%</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                    {selectedItemForDetail.riskReasonKhmer || 'សកម្មភាពនេះមានឥទ្ធិពលខ្លាំងលើទិន្នន័យ ឬស្ថិតក្នុងភាពមិនប្រក្រតីនៃប្រព័ន្ធ។'}
                  </p>
                </div>
              )}

              {/* Anomaly warning in modal if present */}
              {selectedItemForDetail.anomalies && selectedItemForDetail.anomalies.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>សញ្ញាមិនប្រក្រតីដែលបានរកឃើញ ({selectedItemForDetail.anomalies.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedItemForDetail.anomalies.map((ano, idx) => (
                      <div key={idx} className="text-xs bg-white p-2.5 rounded-lg border border-rose-200 space-y-1">
                        <div className="flex items-center justify-between font-bold text-rose-800">
                          <span>{ano.titleKhmer}</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 bg-rose-100 rounded">
                            {ano.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{ano.descriptionKhmer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenDiffForRow(selectedItemForDetail);
                    setSelectedItemForDetail(null);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  <span>ប្រៀបធៀប Diff</span>
                </button>

                <button
                  onClick={() => {
                    const item = selectedItemForDetail;
                    setSelectedItemForDetail(null);
                    setSelectedItemForComments(item);
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>មតិ & កំណត់សម្គាល់ ({selectedItemForDetail.comments?.length || 0})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItemForDetail(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>ចូលទៅកាន់ទិន្នន័យ</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
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
                className="text-slate-400 hover:text-white cursor-pointer"
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  រក្សាទុកកំណត់ត្រា
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Action Modal (Record Resolver & Direct Navigation) */}
      {selectedItemForQuickAction && (
        <ActivityQuickActionModal
          logItem={selectedItemForQuickAction}
          onClose={() => setSelectedItemForQuickAction(null)}
          onNavigateTab={handleNavigate}
          onOpenAnalytics={onOpenStudentAnalytics}
        />
      )}

      {/* Printable / PDF Report Generator Modal */}
      {isPrintReportModalOpen && (
        <ActivityPrintReportModal
          logs={filteredLogs}
          appliedFilters={{
            domain: selectedDomain,
            action: selectedAction,
            role: selectedRole,
            date: dateFilter,
            search: searchQuery
          }}
          onClose={() => setIsPrintReportModalOpen(false)}
        />
      )}

      {/* Retention Policy & Storage Management Modal */}
      {isRetentionModalOpen && (
        <ActivityRetentionModal
          logs={enrichedLogs}
          isOpen={isRetentionModalOpen}
          onClose={() => setIsRetentionModalOpen(false)}
          onLogsUpdated={(newLogs) => {
            updateActivityLogs(newLogs);
          }}
          showToast={showToast}
        />
      )}

      {/* Floating Bulk Selection Toolbar when items are selected */}
      {selectedLogIds.length > 0 && !isDiffSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {selectedLogIds.length}
            </span>
            <span className="text-xs font-medium text-slate-200">បានជ្រើសរើស</span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            {/* Archive / Unarchive Button */}
            {archiveFilter === 'archived' ? (
              <button
                type="button"
                onClick={() => setBulkModalAction('unarchive')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ស្រង់ចេញពីបណ្ណសារទៅកាន់សកម្មភាពធម្មតាវិញ"
              >
                <ArchiveRestore className="w-3.5 h-3.5" />
                <span>ស្រង់ចេញ ({selectedLogIds.length})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBulkModalAction('archive')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="បណ្ណសារទុកកំណត់ត្រាដែលបានជ្រើស [ចុច a]"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>បណ្ណសារទុក ({selectedLogIds.length})</span>
              </button>
            )}

            {/* Delete Selected Button */}
            <button
              type="button"
              onClick={() => setBulkModalAction('delete')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              title="លុបកំណត់ត្រាដែលបានជ្រើសចេញជាស្ថាពរ [ចុច Delete]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>លុបចោល ({selectedLogIds.length})</span>
            </button>

            {/* Diff Compare if 2 selected */}
            {selectedLogIds.length === 2 && (
              <button
                type="button"
                onClick={() => {
                  const logA = enrichedLogs.find(l => l.id === selectedLogIds[0]);
                  const logB = enrichedLogs.find(l => l.id === selectedLogIds[1]);
                  if (logA && logB) {
                    setDiffLogA(logA);
                    setDiffLogB(logB);
                    setIsDiffModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ប្រៀបធៀប Diff រវាងកំណត់ត្រាទាំងពីរ [ចុច d]"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>ប្រៀបធៀប Diff (២)</span>
              </button>
            )}

            {/* Clear Selection Button */}
            <button
              type="button"
              onClick={() => setSelectedLogIds([])}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="ដកការជ្រើសរើសទាំងអស់ [ចុច Escape]"
            >
              សម្អាត
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Diff Modal */}
      {isDiffModalOpen && diffLogA && diffLogB && (
        <ActivityDiffModal
          logA={diffLogA}
          logB={diffLogB}
          isOpen={isDiffModalOpen}
          allLogs={enrichedLogs}
          onClose={() => {
            setIsDiffModalOpen(false);
            setDiffLogA(null);
            setDiffLogB(null);
          }}
          onSelectAlternativeLog={(log) => {
            setDiffLogB(log);
          }}
        />
      )}

      {/* Bulk Action Confirmation Modal */}
      {bulkModalAction && (
        <ActivityBulkActionModal
          isOpen={bulkModalAction !== null}
          actionType={bulkModalAction}
          selectedLogs={enrichedLogs.filter(l => selectedLogIds.includes(l.id))}
          onConfirm={handleExecuteBulkAction}
          onClose={() => setBulkModalAction(null)}
        />
      )}

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      <ActivityKeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Anomaly Alerts Side Panel */}
      {isAnomalyPanelOpen && (
        <ActivityAnomalySidePanel
          logs={enrichedLogs}
          isOpen={isAnomalyPanelOpen}
          onClose={() => setIsAnomalyPanelOpen(false)}
          onSelectLog={(log) => {
            setIsAnomalyPanelOpen(false);
            setSelectedItemForDetail(log);
          }}
          onFilterAnomaliesOnly={() => {
            setShowAnomaliesOnly(true);
            setIsAnomalyPanelOpen(false);
          }}
        />
      )}

      {/* Audit Comments & Notes Modal */}
      {selectedItemForComments && (
        <ActivityCommentsModal
          logItem={selectedItemForComments}
          isOpen={selectedItemForComments !== null}
          onClose={() => setSelectedItemForComments(null)}
          onCommentsUpdated={(updatedComments) => {
            // Update local state if needed or show feedback
            showToast('បានកត់ត្រាមតិយោបល់សវនកម្មដោយជោគជ័យ', 'success');
          }}
        />
      )}

      {/* Google Drive Automated Summary Schedule Modal */}
      {isDriveScheduleModalOpen && (
        <ActivityDriveScheduleModal
          isOpen={isDriveScheduleModalOpen}
          onClose={() => setIsDriveScheduleModalOpen(false)}
          allLogs={enrichedLogs}
          schoolName={schoolProfile?.name || 'សាលាបឋមសិក្សាភ្នំពុំ'}
          showToast={showToast}
        />
      )}
    </div>
  );
};
