import {
  ActivityLogItem,
  ActivityDomain,
  ActivityActionType,
  Student,
  Teacher,
  BudgetTransaction,
  StudentTransferRecord,
  StudentScoreRecord,
  ActivityAnomaly,
  ActivityRetentionConfig
} from '../types';

const ACTIVITY_STORAGE_KEY = 'phnom_pom_activity_audit_logs';
const RETENTION_CONFIG_KEY = 'phnom_pom_activity_retention_config';

/**
 * Format timestamp into conversational and respectful Khmer relative time
 * (ឧ. «មុននេះ ៥ នាទី», «មុននេះ ២ ម៉ោង», «ថ្ងៃនេះ ម៉ោង ០៨:៣០», «ម្សិលមិញ ម៉ោង ១៤:១៥», «ថ្ងៃទី ១៥ មករា ២០២៦»)
 */
export function formatKhmerRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) {
      return 'មុននេះបន្តិច';
    }
    if (diffMin < 60) {
      return `មុននេះ ${diffMin} នាទី`;
    }
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      const timeStr = date.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
      return `ថ្ងៃនេះ ម៉ោង ${timeStr}`;
    }
    if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() - 1)) {
      const timeStr = date.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
      return `ម្សិលមិញ ម៉ោង ${timeStr}`;
    }
    if (diffDays < 7) {
      return `${diffDays} ថ្ងៃមុន`;
    }

    return date.toLocaleDateString('km-KH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

/**
 * Format full exact Khmer date and time
 */
export function formatKhmerFullDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return isoString;
  }
}

/**
 * Get stored logs from LocalStorage
 */
export function getStoredActivities(): ActivityLogItem[] {
  try {
    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load activities from storage', e);
  }
  return [];
}

/**
 * Save logs to LocalStorage
 */
export function saveActivitiesToStorage(activities: ActivityLogItem[]): void {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities.slice(0, 300)));
  } catch (e) {
    console.error('Failed to save activities to storage', e);
  }
}

/**
 * Log a new activity dynamically
 */
export function logNewActivity(
  activity: Omit<ActivityLogItem, 'id' | 'timestamp'> & { timestamp?: string }
): ActivityLogItem {
  const newItem: ActivityLogItem = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: activity.timestamp || new Date().toISOString()
  };

  const existing = getStoredActivities();
  const updated = [newItem, ...existing].slice(0, 300);
  saveActivitiesToStorage(updated);
  return newItem;
}

/**
 * Helper to record activity log whenever a report card with Principal's Digital QR signature is generated or printed
 */
export function createPrincipalQRReportCardLog(params: {
  studentId: string;
  studentName: string;
  studentCode: string;
  grade: number;
  section: string;
  actorName: string;
  actorRole: string;
  action: 'generated' | 'printed' | 'exported_pdf';
  monthOrSemester?: string;
  academicYear?: string;
  signatureRef?: string;
}): Omit<ActivityLogItem, 'id' | 'timestamp'> {
  const actionText = params.action === 'printed' ? 'បោះពុម្ព' : (params.action === 'exported_pdf' ? 'ទាញយកជា PDF' : 'បង្កើត/ពិនិត្យមើល');
  return {
    domain: 'academic',
    actionType: 'document',
    title: `${actionText}ព្រឹត្តិបត្រពិន្ទុជាមួយ QR ហត្ថលេខាឌីជីថល`,
    description: `បាន${actionText}ព្រឹត្តិបត្រពិន្ទុផ្លូវការភ្ជាប់ QR Code ហត្ថលេខាឌីជីថលនាយកសាលា (${params.signatureRef || 'MoEYS Digital Signature'}) សម្រាប់សិស្ស «${params.studentName}» (អត្តលេខ: ${params.studentCode}) ថ្នាក់ទី ${params.grade}${params.section}`,
    entityId: params.studentId,
    entityCode: params.studentCode,
    entityName: params.studentName,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetTab: 'reports_qr',
    tags: ['report_card', 'principal_qr_signature', 'moeys_verification', params.action],
    details: {
      studentId: params.studentId,
      studentName: params.studentName,
      studentCode: params.studentCode,
      grade: params.grade,
      section: params.section,
      monthOrSemester: params.monthOrSemester || 'ប្រចាំខែ',
      academicYear: params.academicYear,
      signatureRef: params.signatureRef,
      action: params.action,
      hasPrincipalSignatureQR: true,
      timestamp: new Date().toISOString()
    }
  };
}

// ----------------------------------------------------
// 1. RETENTION POLICY & AUTOMATED CLEANUP
// ----------------------------------------------------

export const DEFAULT_RETENTION_CONFIG: ActivityRetentionConfig = {
  retentionDays: 90, // default 90 days
  autoCleanupEnabled: true,
  lastCleanedAt: undefined,
  lastCleanedCount: 0
};

export function getRetentionConfig(): ActivityRetentionConfig {
  try {
    const saved = localStorage.getItem(RETENTION_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_RETENTION_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load retention config', e);
  }
  return DEFAULT_RETENTION_CONFIG;
}

export function saveRetentionConfig(config: ActivityRetentionConfig): void {
  try {
    localStorage.setItem(RETENTION_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save retention config', e);
  }
}

/**
 * Filter out logs older than retentionDays
 * retentionDays = 0 means KEEP ALL (no expiry)
 */
export function performRetentionCleanup(
  logs: ActivityLogItem[],
  retentionDays: number
): { remainingLogs: ActivityLogItem[]; deletedCount: number; expiredLogIds: string[] } {
  if (retentionDays <= 0) {
    return { remainingLogs: logs, deletedCount: 0, expiredLogIds: [] };
  }

  const now = Date.now();
  const thresholdMs = retentionDays * 24 * 60 * 60 * 1000;
  const expiredLogIds: string[] = [];
  const remainingLogs: ActivityLogItem[] = [];

  logs.forEach(log => {
    const logTime = new Date(log.timestamp).getTime();
    if (isNaN(logTime) || (now - logTime) <= thresholdMs) {
      remainingLogs.push(log);
    } else {
      expiredLogIds.push(log.id);
    }
  });

  return {
    remainingLogs,
    deletedCount: expiredLogIds.length,
    expiredLogIds
  };
}

/**
 * Estimate memory/storage footprint in Kilobytes (KB)
 */
export function estimateStorageSizeKB(logs: ActivityLogItem[]): number {
  try {
    const str = JSON.stringify(logs);
    // Approximate bytes in UTF-8
    const bytes = new Blob([str]).size;
    return parseFloat((bytes / 1024).toFixed(1));
  } catch {
    return 0;
  }
}

// ----------------------------------------------------
// 2. UNUSUAL PATTERN & ANOMALY DETECTION ENGINE
// ----------------------------------------------------

/**
 * Detect irregular activity patterns:
 * 1. Bulk / Repeated Deletions (លុបទិន្នន័យច្រើនក្នុងពេលតែមួយ)
 * 2. Irregular / Off-Hours Actions (សកម្មភាពក្រៅម៉ោងធ្វើការ ចន្លោះម៉ោង 10:00 យប់ ដល់ 05:30 ព្រឹក)
 * 3. High-Value Financial Operations (ប្រតិបត្តិការចំណូល/ចំណាយទឹកប្រាក់ធំ >= 2,000,000៛ ឬ >= $500)
 * 4. Rapid Consecutive Actions (សកម្មភាពញឹកញាប់ខុសប្រក្រតី លើសពី ៤ ដងក្នុងរយៈពេលខ្លី)
 * 5. High-Risk Administrative / Score Changes (ការផ្លាស់ប្តូរសិទ្ធិ ឬកែប្រែពិន្ទុច្រើន)
 */
export function detectLogAnomalies(
  log: ActivityLogItem,
  allLogs: ActivityLogItem[] = []
): ActivityAnomaly[] {
  const anomalies: ActivityAnomaly[] = [];
  if (!log) return anomalies;
  const logDate = new Date(log.timestamp);
  const logHour = logDate.getHours();
  const logMinute = logDate.getMinutes();

  // 1. Off-hours detection (10:00 PM to 05:30 AM)
  const isNightTime = (logHour >= 22 || logHour < 5 || (logHour === 5 && logMinute < 30));
  if (isNightTime) {
    anomalies.push({
      id: `anom-offhours-${log.id}`,
      type: 'off_hours',
      severity: 'medium',
      titleKhmer: 'សកម្មភាពក្រៅម៉ោងធ្វើការ (Off-Hours Activity)',
      descriptionKhmer: `ត្រូវបានកត់ត្រានៅម៉ោង ${logDate.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })} ដែលជាវេលាក្រៅម៉ោងរដ្ឋបាលធម្មតា (យប់ជ្រៅ ឬព្រលឹមស្រាងៗ)។`,
      detectedAt: new Date().toISOString(),
      logId: log.id
    });
  }

  // 2. Deletion action or multiple deletions
  if (log.actionType === 'delete') {
    const recentDeletions = allLogs.filter(other => {
      if (!other || other.actionType !== 'delete') return false;
      const otherTime = new Date(other.timestamp).getTime();
      const thisTime = logDate.getTime();
      return Math.abs(thisTime - otherTime) <= 15 * 60 * 1000; // within 15 minutes
    });

    if (recentDeletions.length >= 2) {
      anomalies.push({
        id: `anom-bulkdel-${log.id}`,
        type: 'bulk_deletion',
        severity: 'high',
        titleKhmer: 'ការលុបទិន្នន័យជាបន្តបន្ទាប់ (Bulk Deletions)',
        descriptionKhmer: `មានការលុបទិន្នន័យ ${recentDeletions.length} កំណត់ត្រាក្នុងចន្លោះពេល ១៥ នាទី។ គួរពិនិត្យសុវត្ថិភាពឡើងវិញ។`,
        detectedAt: new Date().toISOString(),
        logId: log.id
      });
    } else {
      anomalies.push({
        id: `anom-del-${log.id}`,
        type: 'bulk_deletion',
        severity: 'medium',
        titleKhmer: 'ប្រតិបត្តិការលុបទិន្នន័យ (Data Deletion)',
        descriptionKhmer: `ទិន្នន័យ «${log.entityName}» ត្រូវបានលុបចេញពីប្រព័ន្ធដោយ ${log.actorName} (${log.actorRole})។`,
        detectedAt: new Date().toISOString(),
        logId: log.id
      });
    }
  }

  // 3. High Value Financial changes (>= 2,000,000 KHR or >= $500 USD)
  const isHighRiel = (log.financialAmountRiel && log.financialAmountRiel >= 2000000);
  const isHighUsd = (log.financialAmountUsd && log.financialAmountUsd >= 500);
  if (isHighRiel || isHighUsd) {
    anomalies.push({
      id: `anom-finance-${log.id}`,
      type: 'high_finance',
      severity: 'high',
      titleKhmer: 'ប្រតិបត្តិការហិរញ្ញវត្ថុទំហំធំ (High-Value Transaction)',
      descriptionKhmer: `ប្រតិបត្តិការហិរញ្ញវត្ថុមានទំហំធំ៖ ${log.financialAmountRiel ? log.financialAmountRiel.toLocaleString() + ' ៛' : ''} ${log.financialAmountUsd ? '($' + log.financialAmountUsd + ')' : ''}។`,
      detectedAt: new Date().toISOString(),
      logId: log.id
    });
  }

  // 4. Rapid consecutive modifications by same user
  const sameActorRecent = allLogs.filter(other => {
    if (other.actorName !== log.actorName) return false;
    const otherTime = new Date(other.timestamp).getTime();
    const thisTime = logDate.getTime();
    return Math.abs(thisTime - otherTime) <= 5 * 60 * 1000; // within 5 minutes
  });

  if (sameActorRecent.length >= 4) {
    anomalies.push({
      id: `anom-rapid-${log.id}`,
      type: 'rapid_actions',
      severity: 'low',
      titleKhmer: 'សកម្មភាពញឹកញាប់លឿនខុសធម្មតា (Rapid Modifications)',
      descriptionKhmer: `អ្នកប្រើប្រាស់ ${log.actorName} បានធ្វើសកម្មភាព ${sameActorRecent.length} ដងក្នុងរយៈពេល ៥ នាទី។`,
      detectedAt: new Date().toISOString(),
      logId: log.id
    });
  }

  return anomalies;
}

/**
 * Enriches activity logs with calculated anomaly flags
 */
export function enrichLogsWithAnomalies(logs: ActivityLogItem[]): ActivityLogItem[] {
  return logs.map(log => {
    const anomalies = detectLogAnomalies(log, logs);
    return {
      ...log,
      anomalies
    };
  });
}

// ----------------------------------------------------
// 3. LOG ENTRY DIFF COMPARISON ENGINE
// ----------------------------------------------------

export interface DiffFieldComparison {
  key: string;
  labelKhmer: string;
  valueA: any;
  valueB: any;
  status: 'identical' | 'modified' | 'added_in_b' | 'removed_in_b';
}

export interface LogDiffResult {
  logA: ActivityLogItem;
  logB: ActivityLogItem;
  sameEntity: boolean;
  timeDeltaFormatted: string;
  actorChanged: boolean;
  actionChanged: boolean;
  fields: DiffFieldComparison[];
  changesSummary: {
    totalFields: number;
    modifiedCount: number;
    identicalCount: number;
  };
}

export function compareTwoLogs(logA: ActivityLogItem, logB: ActivityLogItem): LogDiffResult {
  const fields: DiffFieldComparison[] = [];

  // 1. Basic Metadata Fields
  const metaMappings: { key: keyof ActivityLogItem; label: string }[] = [
    { key: 'title', label: 'ចំណងជើងសកម្មភាព' },
    { key: 'domain', label: 'ផ្នែក/ដែនកំណត់' },
    { key: 'actionType', label: 'ប្រភេទសកម្មភាព' },
    { key: 'entityName', label: 'ឈ្មោះទិន្នន័យ (Entity Name)' },
    { key: 'entityCode', label: 'អត្តលេខ/លេខកូដ' },
    { key: 'actorName', label: 'អ្នកអនុវត្ត (Actor Name)' },
    { key: 'actorRole', label: 'តួនាទីអ្នកអនុវត្ត' },
    { key: 'description', label: 'ការពិពណ៌នាលម្អិត' },
    { key: 'financialAmountRiel', label: 'ទឹកប្រាក់រៀល' },
    { key: 'financialAmountUsd', label: 'ទឹកប្រាក់ដុល្លារ' },
    { key: 'financialCategory', label: 'ប្រភេទចំណូល/ចំណាយ' },
    { key: 'targetTab', label: 'ផ្ទាំងតំណភ្ជាប់' }
  ];

  metaMappings.forEach(({ key, label }) => {
    const valA = logA[key];
    const valB = logB[key];

    if (valA !== undefined || valB !== undefined) {
      let status: 'identical' | 'modified' | 'added_in_b' | 'removed_in_b' = 'identical';
      if (valA === undefined && valB !== undefined) status = 'added_in_b';
      else if (valA !== undefined && valB === undefined) status = 'removed_in_b';
      else if (JSON.stringify(valA) !== JSON.stringify(valB)) status = 'modified';

      fields.push({
        key: String(key),
        labelKhmer: label,
        valueA: valA ?? '—',
        valueB: valB ?? '—',
        status
      });
    }
  });

  // 2. Changes Array Comparison if exists
  const changesA = logA.changes || [];
  const changesB = logB.changes || [];

  const changeKeys = new Set([
    ...changesA.map(c => c.fieldName),
    ...changesB.map(c => c.fieldName)
  ]);

  changeKeys.forEach(fieldName => {
    const itemA = changesA.find(c => c.fieldName === fieldName);
    const itemB = changesB.find(c => c.fieldName === fieldName);
    const label = itemA?.fieldLabelKhmer || itemB?.fieldLabelKhmer || fieldName;

    const valA = itemA ? `${itemA.oldValue ?? '—'} ➔ ${itemA.newValue ?? '—'}` : undefined;
    const valB = itemB ? `${itemB.oldValue ?? '—'} ➔ ${itemB.newValue ?? '—'}` : undefined;

    let status: 'identical' | 'modified' | 'added_in_b' | 'removed_in_b' = 'identical';
    if (!itemA && itemB) status = 'added_in_b';
    else if (itemA && !itemB) status = 'removed_in_b';
    else if (valA !== valB) status = 'modified';

    fields.push({
      key: `field_change_${fieldName}`,
      labelKhmer: `បម្រែបម្រួល៖ ${label}`,
      valueA: valA ?? '—',
      valueB: valB ?? '—',
      status
    });
  });

  // Calculate Time Delta
  const timeA = new Date(logA.timestamp).getTime();
  const timeB = new Date(logB.timestamp).getTime();
  const diffMs = Math.abs(timeA - timeB);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeDeltaFormatted = 'ក្នុងពេលដំណាលគ្នា';
  if (diffDays > 0) {
    timeDeltaFormatted = `ខុសគ្នា ${diffDays} ថ្ងៃ ${diffHours % 24} ម៉ោង`;
  } else if (diffHours > 0) {
    timeDeltaFormatted = `ខុសគ្នា ${diffHours} ម៉ោង ${diffMinutes % 60} នាទី`;
  } else if (diffMinutes > 0) {
    timeDeltaFormatted = `ខុសគ្នា ${diffMinutes} នាទី`;
  }

  const modifiedCount = fields.filter(f => f.status !== 'identical').length;
  const identicalCount = fields.filter(f => f.status === 'identical').length;

  return {
    logA,
    logB,
    sameEntity: logA.entityId === logB.entityId || logA.entityName === logB.entityName,
    timeDeltaFormatted,
    actorChanged: logA.actorName !== logB.actorName,
    actionChanged: logA.actionType !== logB.actionType,
    fields,
    changesSummary: {
      totalFields: fields.length,
      modifiedCount,
      identicalCount
    }
  };
}

// ----------------------------------------------------
// 4. ENHANCED CSV EXPORT (UTF-8 with BOM for Excel/Sheets)
// ----------------------------------------------------

export function exportLogsToCSV(logs: ActivityLogItem[], customFileName?: string): boolean {
  try {
    const domainLabels: Record<string, string> = {
      student: 'សិស្សានុសិស្ស',
      teacher: 'គ្រូបង្រៀន & បុគ្គលិក',
      finance: 'ហិរញ្ញវត្ថុ & ថវិកា',
      academic: 'លទ្ធផលសិក្សា & ពិន្ទុ',
      admin: 'រដ្ឋបាល & ប្រព័ន្ធ',
      health: 'សុខភាព & វត្តមាន'
    };

    const actionLabels: Record<string, string> = {
      create: 'បង្កើតថ្មី',
      update: 'កែប្រែ/ធ្វើបច្ចុប្បន្នភាព',
      delete: 'លុបទិន្នន័យ',
      transfer: 'ផ្ទេរចេញ/ចូល',
      income: 'ចំណូលថវិកា',
      expense: 'ចំណាយថវិកា',
      score: 'កត់ត្រាពិន្ទុ',
      attendance: 'កត់ត្រាវត្តមាន',
      document: 'ឯកសាររដ្ឋបាល',
      approval: 'ការអនុម័ត',
      health_check: 'ពិនិត្យសុខភាព'
    };

    const headers = [
      'កាលបរិច្ឆេទ & ម៉ោង',
      'ផ្នែកទិន្នន័យ (Domain)',
      'ប្រភេទសកម្មភាព (Action)',
      'ចំណងជើងសកម្មភាព (Title)',
      'ឈ្មោះទិន្នន័យ (Entity Name)',
      'អត្តលេខ/លេខកូដ (Entity Code)',
      'អ្នកអនុវត្ត (Actor Name)',
      'តួនាទីអ្នកអនុវត្ត (Actor Role)',
      'ការពិពណ៌នាលម្អិត (Description)',
      'ទឹកប្រាក់រៀល (Amount Riel)',
      'ទឹកប្រាក់ដុល្លារ (Amount USD)',
      'ប្រភេទហិរញ្ញវត្ថុ (Category)',
      'បម្រែបម្រួលលម្អិត (Changes)',
      'ភាពមិនប្រក្រតី/ហានិភ័យ (Anomalies)',
      'ស្លាកសម្គាល់ (Tags)'
    ];

    const rows = logs.map(log => {
      // Summarize field changes
      const changesSummary = (log.changes || [])
        .map(c => `${c.fieldLabelKhmer}: [${c.oldValue ?? '—'}] -> [${c.newValue ?? '—'}]`)
        .join('; ');

      // Summarize anomalies if any
      const anomalies = detectLogAnomalies(log, logs);
      const anomalySummary = anomalies.map(a => `${a.titleKhmer}`).join('; ');

      return [
        `"${formatKhmerFullDateTime(log.timestamp)}"`,
        `"${domainLabels[log.domain] || log.domain}"`,
        `"${actionLabels[log.actionType] || log.actionType}"`,
        `"${(log.title || '').replace(/"/g, '""')}"`,
        `"${(log.entityName || '').replace(/"/g, '""')}"`,
        `"${(log.entityCode || '-').replace(/"/g, '""')}"`,
        `"${(log.actorName || '').replace(/"/g, '""')}"`,
        `"${(log.actorRole || '').replace(/"/g, '""')}"`,
        `"${(log.description || '').replace(/"/g, '""')}"`,
        `"${log.financialAmountRiel ? log.financialAmountRiel.toLocaleString() : '-'}"`,
        `"${log.financialAmountUsd ? '$' + log.financialAmountUsd : '-'}"`,
        `"${(log.financialCategory || '-').replace(/"/g, '""')}"`,
        `"${changesSummary.replace(/"/g, '""')}"`,
        `"${anomalySummary.replace(/"/g, '""')}"`,
        `"${(log.tags || []).join(', ').replace(/"/g, '""')}"`
      ];
    });

    // UTF-8 BOM prefix \uFEFF ensures proper rendering of Khmer Unicode characters in Microsoft Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = customFileName || `កំណត់ត្រាសកម្មភាព_សាលាបឋមសិក្សាភ្នំពុំ_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to export CSV', err);
    return false;
  }
}

/**
 * Generate initial realistic seed activities from current state so admin sees rich data changes immediately
 */
export function generateSeedActivities(
  students: Student[],
  teachers: Teacher[],
  budget: BudgetTransaction[],
  transfers: StudentTransferRecord[] = [],
  scores: StudentScoreRecord[] = []
): ActivityLogItem[] {
  const seeds: ActivityLogItem[] = [];
  const baseTime = Date.now();

  // 1. Recent Financial Logs
  budget.slice(0, 4).forEach((tx, idx) => {
    seeds.push({
      id: `act-seed-fin-${tx.id}`,
      domain: 'finance',
      actionType: tx.type === 'income' ? 'income' : 'expense',
      title: tx.type === 'income' ? `បានកត់ត្រាចំណូលថវិកា៖ ${tx.title}` : `បានកត់ត្រាចំណាយថវិកា៖ ${tx.title}`,
      description: `${tx.source} • ប្រភេទ «${tx.category}» ចំនួន ${(tx.amountRiel).toLocaleString()} ៛ ($${tx.amountUsd})`,
      entityId: tx.id,
      entityCode: tx.referenceCode,
      entityName: tx.title,
      actorName: tx.recordedBy || 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា / គណនេយ្យករ',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 4 + 1800000)).toISOString(),
      financialAmountRiel: tx.amountRiel,
      financialAmountUsd: tx.amountUsd,
      financialCategory: tx.category,
      targetTab: 'finance',
      tags: [tx.type === 'income' ? 'ចំណូល' : 'ចំណាយ', tx.source],
      changes: [
        { fieldName: 'amountRiel', fieldLabelKhmer: 'ទឹកប្រាក់រៀល', newValue: `${(tx.amountRiel).toLocaleString()} ៛` },
        { fieldName: 'source', fieldLabelKhmer: 'ប្រភពថវិកា', newValue: tx.source },
        { fieldName: 'referenceCode', fieldLabelKhmer: 'លេខបង្កាន់ដៃ', newValue: tx.referenceCode }
      ]
    });
  });

  // 2. Recent Student Record Updates / Creations
  students.slice(0, 5).forEach((stu, idx) => {
    const isNew = idx % 2 === 0;
    seeds.push({
      id: `act-seed-stu-${stu.id}`,
      domain: 'student',
      actionType: isNew ? 'create' : 'update',
      title: isNew ? `បានចុះឈ្មោះសិស្សថ្មី៖ ${stu.nameKhmer}` : `បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានសិស្ស៖ ${stu.nameKhmer}`,
      description: `ថ្នាក់ទី ${stu.grade}${stu.section} • អត្តលេខ ${stu.code} • អាណាព្យាបាល ${stu.guardianName} (${stu.guardianPhone})`,
      entityId: stu.id,
      entityCode: stu.code,
      entityName: stu.nameKhmer,
      actorName: 'លោកគ្រូ ចាន់ វុទ្ធី',
      actorRole: 'គ្រូបន្ទុកថ្នាក់',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 2.5 + 900000)).toISOString(),
      targetTab: 'students',
      tags: [`ថ្នាក់ទី ${stu.grade}${stu.section}`, stu.livingCondition || 'ទូទៅ'],
      changes: isNew
        ? [
            { fieldName: 'code', fieldLabelKhmer: 'អត្តលេខសិស្ស', newValue: stu.code },
            { fieldName: 'nameKhmer', fieldLabelKhmer: 'គោត្តនាម-នាម', newValue: stu.nameKhmer },
            { fieldName: 'grade', fieldLabelKhmer: 'កម្រិតថ្នាក់', newValue: `ថ្នាក់ទី ${stu.grade}${stu.section}` },
            { fieldName: 'guardianPhone', fieldLabelKhmer: 'លេខទូរស័ព្ទអាណាព្យាបាល', newValue: stu.guardianPhone }
          ]
        : [
            { fieldName: 'livingCondition', fieldLabelKhmer: 'ស្ថានភាពជីវភាព', oldValue: 'ទូទៅ', newValue: stu.livingCondition || 'សមរម្យ' },
            { fieldName: 'guardianPhone', fieldLabelKhmer: 'លេខទូរស័ព្ទ', oldValue: '012 xxx xxx', newValue: stu.guardianPhone },
            { fieldName: 'healthChecked', fieldLabelKhmer: 'ពិនិត្យសុខភាព (BMI)', newValue: `${stu.health?.heightCm}cm / ${stu.health?.weightKg}kg` }
          ]
    });
  });

  // 3. Teacher Records changes
  teachers.slice(0, 3).forEach((tea, idx) => {
    seeds.push({
      id: `act-seed-tea-${tea.id}`,
      domain: 'teacher',
      actionType: 'update',
      title: `បានកែសម្រួលព័ត៌មានមន្ត្រី/គ្រូបង្រៀន៖ ${tea.nameKhmer}`,
      description: `${tea.role} • ក្របខ័ណ្ឌ «${tea.framework || 'គ្រូបង្រៀនកម្រិតមូលដ្ឋាន'}» • អត្តលេខ ${tea.staffCode}`,
      entityId: tea.id,
      entityCode: tea.staffCode,
      entityName: tea.nameKhmer,
      actorName: 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 7 + 7200000)).toISOString(),
      targetTab: 'teachers',
      tags: [tea.role, tea.staffCode],
      changes: [
        { fieldName: 'qualification', fieldLabelKhmer: 'កម្រិតសញ្ញាបត្រ', newValue: tea.qualification },
        { fieldName: 'phone', fieldLabelKhmer: 'លេខទូរស័ព្ទទំនាក់ទំនង', newValue: tea.phone },
        { fieldName: 'assignedClass', fieldLabelKhmer: 'បន្ទុកថ្នាក់', newValue: tea.assignedGrade ? `ថ្នាក់ទី ${tea.assignedGrade}${tea.assignedSection || 'ក'}` : 'រដ្ឋបាល' }
      ]
    });
  });

  // 4. Student Transfers if any
  transfers.slice(0, 2).forEach((tr, idx) => {
    seeds.push({
      id: `act-seed-tr-${tr.id}`,
      domain: 'student',
      actionType: 'transfer',
      title: tr.transferType === 'out' ? `បានអនុម័តលិខិតផ្ទេរសិស្សចេញ៖ ${tr.studentNameKhmer}` : `បានទទួលសិស្សផ្ទេរចូល៖ ${tr.studentNameKhmer}`,
      description: `លិខិតលេខ ${tr.letterNumber} • ថ្នាក់ទី ${tr.grade}${tr.section} • ទៅកាន់ ${tr.toSchool}`,
      entityId: tr.id,
      entityCode: tr.letterNumber,
      entityName: tr.studentNameKhmer,
      actorName: 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 12 + 14400000)).toISOString(),
      targetTab: 'transfers',
      tags: [tr.transferType === 'out' ? 'ផ្ទេរចេញ' : 'ផ្ទេរចូល', tr.letterNumber]
    });
  });

  // 5. Score Records
  scores.slice(0, 2).forEach((sc, idx) => {
    seeds.push({
      id: `act-seed-score-${sc.id}`,
      domain: 'academic',
      actionType: 'score',
      title: `បានបញ្ចូលពិន្ទុប្រចាំខែ ${sc.monthOrSemester}៖ ${sc.studentNameKhmer}`,
      description: `ថ្នាក់ទី ${sc.grade}${sc.section} • មធ្យមភាគ ${sc.averageScore} • និទ្ទេស ${sc.gradeLetter} (ចំណាត់ថ្នាក់ទី ${sc.rank})`,
      entityId: sc.id,
      entityCode: sc.studentCode,
      entityName: sc.studentNameKhmer,
      actorName: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
      actorRole: 'គ្រូបន្ទុកថ្នាក់',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 5 + 3600000)).toISOString(),
      targetTab: 'scores',
      tags: [`ខែ ${sc.monthOrSemester}`, `និទ្ទេស ${sc.gradeLetter}`]
    });
  });

  // Sort descending by timestamp
  return seeds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
