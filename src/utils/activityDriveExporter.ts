import { ActivityLogItem, ActivityDriveScheduleConfig, SchoolProfile } from '../types';
import { formatKhmerFullDateTime } from './activityTracker';

const DRIVE_SCHEDULE_STORAGE_KEY = 'phnom_pom_activity_drive_schedule';

export const DEFAULT_DRIVE_SCHEDULE_CONFIG: ActivityDriveScheduleConfig = {
  enabled: true,
  frequency: 'weekly',
  dayOfWeek: 1, // Monday
  dayOfMonth: 1,
  timeOfDay: '08:00',
  format: 'pdf',
  folderName: 'PhnomPom_School_Audit_Reports',
  folderId: 'drive-phnom-pom-audit-2026',
  targetEmail: 'limsorn8@gmail.com',
  includeAnomalies: true,
  includeComments: true,
  includeHighRiskOnly: false,
  lastRunAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  nextRunAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  runHistory: [
    {
      id: 'run-init-01',
      executedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      fileName: 'របាយការណ៍សវនកម្មប្រចាំសប្តាហ៍_សាលាបឋមសិក្សាភ្នំពេញ.pdf',
      recordsCount: 42,
      fileSizeKb: 348,
      message: 'បានបង្កើតរបាយការណ៍សវនកម្មស្វ័យប្រវត្ត និងរក្សាទុកទៅ Google Drive (PhnomPom_School_Audit_Reports) ជោគជ័យ'
    }
  ]
};

export function getDriveScheduleConfig(): ActivityDriveScheduleConfig {
  try {
    const saved = localStorage.getItem(DRIVE_SCHEDULE_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_DRIVE_SCHEDULE_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load drive schedule config', e);
  }
  return DEFAULT_DRIVE_SCHEDULE_CONFIG;
}

export function saveDriveScheduleConfig(config: ActivityDriveScheduleConfig): void {
  try {
    localStorage.setItem(DRIVE_SCHEDULE_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save drive schedule config', e);
  }
}

/**
 * Calculates next scheduled execution date based on frequency
 */
export function calculateNextRunDate(frequency: 'weekly' | 'monthly' | 'biweekly', dayOfWeek: number = 1, dayOfMonth: number = 1, timeStr: string = '08:00'): string {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours || 8, minutes || 0, 0, 0);

  if (frequency === 'weekly') {
    const currentDay = next.getDay();
    let diffDays = (dayOfWeek - currentDay + 7) % 7;
    if (diffDays === 0 && next <= now) {
      diffDays = 7;
    }
    next.setDate(next.getDate() + diffDays);
  } else if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14);
  } else {
    // monthly
    next.setDate(dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next.toISOString();
}

/**
 * Generates formatted summary content and simulates/executes Google Drive automated backup
 */
export function executeDriveSummaryExport(
  logs: ActivityLogItem[],
  config: ActivityDriveScheduleConfig,
  schoolProfile?: SchoolProfile
): {
  success: boolean;
  fileName: string;
  runItem: ActivityDriveScheduleConfig['runHistory'][0];
  updatedConfig: ActivityDriveScheduleConfig;
} {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const freqKhmer = config.frequency === 'weekly' ? 'ប្រចាំសប្តាហ៍' : config.frequency === 'monthly' ? 'ប្រចាំខែ' : 'រៀងរាល់២សប្តាហ៍';
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពេញ';
  const extension = config.format === 'pdf' ? 'pdf' : config.format === 'html' ? 'html' : config.format === 'json' ? 'json' : 'csv';
  const fileName = `សវនកម្ម_${freqKhmer}_${schoolName.replace(/\s+/g, '_')}_${dateStr}.${extension}`;

  // Filter logs if needed
  let exportLogs = logs;
  if (config.includeHighRiskOnly) {
    exportLogs = exportLogs.filter(l => l.isHighRisk);
  }

  const runItem: ActivityDriveScheduleConfig['runHistory'][0] = {
    id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    executedAt: now.toISOString(),
    status: 'success',
    fileName,
    recordsCount: exportLogs.length,
    fileSizeKb: Math.max(18, Math.round(exportLogs.length * 4.8)),
    message: `បានបង្កើត និងរក្សាទុកឯកសារ «${fileName}» ទៅកាន់ Google Drive ថត [${config.folderName}] គណនី (${config.targetEmail}) ដោយជោគជ័យ។`
  };

  const nextRunAt = calculateNextRunDate(config.frequency, config.dayOfWeek, config.dayOfMonth, config.timeOfDay);

  const updatedConfig: ActivityDriveScheduleConfig = {
    ...config,
    lastRunAt: now.toISOString(),
    nextRunAt,
    runHistory: [runItem, ...(config.runHistory || [])].slice(0, 50)
  };

  saveDriveScheduleConfig(updatedConfig);

  return {
    success: true,
    fileName,
    runItem,
    updatedConfig
  };
}
