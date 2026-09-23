/**
 * Telegram Notification & Confirmation Service
 * Sends automated notifications and handles OTP verification via Telegram Bot API.
 */

export interface TelegramNotificationPayload {
  title: string;
  message: string;
  category?: 'announcement' | 'attendance' | 'event' | 'security' | 'audit' | 'general';
  chatId?: string | number;
  metadata?: Record<string, any>;
  delayMs?: number;
}

export interface TelegramSendResult {
  success: boolean;
  message: string;
  messageId?: number;
  error?: string;
  debugCode?: string;
  antiSpam?: {
    delayAppliedMs: number;
    queueRemaining: number;
    retries: number;
  };
}

export interface TelegramAntiSpamStatus {
  success: boolean;
  queueLength: number;
  isProcessing: boolean;
  defaultDelayMs: number;
  recommendation: string;
  stats: {
    totalSent: number;
    totalFailed: number;
    totalRetries: number;
    totalQueued: number;
    lastSentAt: string | null;
    currentDelayMs: number;
  };
}

export interface TelegramTransmissionRecord {
  id: string;
  seq: number;
  sentAt: string;
  timestamp: number;
  timeLabel: string;
  chatId: string | number;
  targetDelayMs: number;
  targetDelaySec: number;
  actualIntervalMs: number;
  actualIntervalSec: number;
  status: 'success' | 'failed' | 'retry';
  retries: number;
  messagePreview: string;
}

export interface TelegramTransmissionHistoryResponse {
  success: boolean;
  history: TelegramTransmissionRecord[];
  summary: {
    avgIntervalMs: number;
    avgIntervalSec: number;
    minIntervalMs: number;
    minIntervalSec: number;
    maxIntervalMs: number;
    maxIntervalSec: number;
    targetDelayMs: number;
    targetDelaySec: number;
    complianceRate: number;
    totalCount: number;
  };
}

export const DEFAULT_TELEGRAM_DELAY_MS = 1500;
export const TELEGRAM_DELAY_STORAGE_KEY = 'telegram_bot_delay_interval_ms';

/**
 * Get configured Telegram transmission delay interval in milliseconds (from localStorage or default)
 */
export function getTelegramDelayMs(): number {
  try {
    const saved = localStorage.getItem(TELEGRAM_DELAY_STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 300 && parsed <= 30000) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read telegram delay from localStorage', e);
  }
  return DEFAULT_TELEGRAM_DELAY_MS;
}

/**
 * Save configured Telegram transmission delay interval in milliseconds
 */
export function saveTelegramDelayMs(delayMs: number): void {
  try {
    const clamped = Math.max(300, Math.min(30000, Math.round(delayMs)));
    localStorage.setItem(TELEGRAM_DELAY_STORAGE_KEY, clamped.toString());
  } catch (e) {
    console.warn('Failed to save telegram delay to localStorage', e);
  }
}

/**
 * Send notification to the configured Telegram chat/group or custom chatId
 */
export async function sendTelegramNotification(payload: TelegramNotificationPayload): Promise<TelegramSendResult> {
  try {
    const iconMap: Record<string, string> = {
      announcement: '📢',
      attendance: '📊',
      event: '📅',
      security: '🔐',
      audit: '🛡️',
      general: '🏫',
    };

    const icon = iconMap[payload.category || 'general'] || '🏫';
    const text = `${icon} *សាលាបឋមសិក្សាភ្នំពុំ - ដំណឹងផ្លូវការ*\n\n📌 *${payload.title}*\n${payload.message}\n\n🕒 _${new Date().toLocaleString('km-KH')}_`;
    const effectiveDelay = payload.delayMs ?? getTelegramDelayMs();

    const res = await fetch('/api/telegram/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        chatId: payload.chatId,
        category: payload.category,
        title: payload.title,
        metadata: payload.metadata,
        delayMs: effectiveDelay,
      }),
    });

    const data = await res.json();
    
    // Automatically log transmission to Bot Activity Log
    try {
      addBotActivityLog({
        destinationChatId: payload.chatId || '240224709',
        destinationName: payload.metadata?.groupName || (payload.chatId ? `Group/Chat ${payload.chatId}` : 'ក្រុមសាលាផ្លូវការ'),
        category: (payload.category as any) || 'general',
        triggeredByName: payload.metadata?.triggeredByName || 'ប្រព័ន្ធគ្រប់គ្រងសាលារៀន',
        triggeredByRole: payload.metadata?.triggeredByRole || 'Admin',
        messageSnippet: `📌 ${payload.title}: ${payload.message.substring(0, 75)}...`,
        fullMessage: text,
        status: data.success ? 'success' : 'failed',
        errorMessage: data.success ? undefined : (data.error || data.message),
        latencyMs: 38,
        messageId: data.messageId,
      });
    } catch (logErr) {
      // Non-blocking log recording
    }

    if (data.success) {
      recordApiSuccess();
    } else {
      recordApiFailure(
        'persistent_api_error',
        data.error || data.message || 'Transmission failed',
        String(payload.chatId || '240224709'),
        { title: payload.title }
      );
    }

    return data;
  } catch (err: any) {
    console.error('sendTelegramNotification failed:', err);
    recordApiFailure(
      'network_timeout',
      err?.message || 'Network error',
      String(payload.chatId || '240224709')
    );
    return {
      success: false,
      message: 'ការតភ្ជាប់បណ្តាញ Telegram បរាជ័យ',
      error: err?.message || 'Network error',
    };
  }
}

/**
 * Send custom markdown message directly to any Telegram chat ID with optional anti-spam delay
 */
export async function sendTelegramDirectMessage(
  chatId: string | number,
  text: string,
  options?: { delayMs?: number; parseMode?: string }
): Promise<TelegramSendResult> {
  try {
    const effectiveDelay = options?.delayMs ?? getTelegramDelayMs();
    const res = await fetch('/api/telegram/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        chatId,
        delayMs: effectiveDelay,
        parseMode: options?.parseMode || 'Markdown',
      }),
    });
    const data = await res.json();
    try {
      addBotActivityLog({
        destinationChatId: chatId,
        destinationName: `Chat / Group ${chatId}`,
        category: 'general',
        triggeredByName: 'អ្នកប្រើប្រាស់ / Administrator',
        triggeredByRole: 'Admin',
        messageSnippet: text.substring(0, 80) + (text.length > 80 ? '...' : ''),
        fullMessage: text,
        status: data.success ? 'success' : 'failed',
        errorMessage: data.success ? undefined : (data.error || data.message),
        latencyMs: 35,
        messageId: data.messageId,
      });
    } catch {}
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: 'បរាជ័យក្នុងការផ្ញើសារផ្ទាល់',
      error: err?.message || 'Network error',
    };
  }
}

/**
 * Get current Telegram Anti-Spam Queue status and rate limiting metrics
 */
export async function getTelegramAntiSpamStatus(): Promise<TelegramAntiSpamStatus | null> {
  try {
    const res = await fetch('/api/telegram/anti-spam-status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Update server-side Anti-Spam default delay configuration
 */
export async function updateTelegramAntiSpamConfig(delayMs: number): Promise<{ success: boolean; message: string }> {
  try {
    saveTelegramDelayMs(delayMs);
    const res = await fetch('/api/telegram/anti-spam-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delayMs }),
    });
    if (!res.ok) {
      return { success: false, message: 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពកម្រិតពន្យាពេលលើ Server' };
    }
    const data = await res.json();
    return { success: true, message: data.message || 'បានកែប្រែដោយជោគជ័យ' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error' };
  }
}

/**
 * Request 6-digit confirmation code via Telegram Bot
 */
export async function generateTelegramVerificationCode(identifier: string, actionDescription?: string): Promise<{ success: boolean; message: string; debugCode?: string }> {
  try {
    const res = await fetch('/api/telegram/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, actionDescription }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'បរាជ័យក្នុងការបង្កើតកូដ' };
  }
}

/**
 * Verify 6-digit confirmation code
 */
export async function verifyTelegramCode(identifier: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/telegram/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'បរាជ័យក្នុងការផ្ទៀងផ្ទាត់កូដ' };
  }
}

/**
 * Fetch historical Telegram message transmissions with actual intervals achieved
 */
export async function getTelegramTransmissionHistory(): Promise<TelegramTransmissionHistoryResponse | null> {
  try {
    const res = await fetch('/api/telegram/transmission-history');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch telegram transmission history:', err);
    return null;
  }
}

/**
 * Trigger simulated test transmission burst to verify delay settings on the timeline chart
 */
export async function simulateTestTransmissionBurst(
  count: number = 5,
  delayMs?: number
): Promise<{ success: boolean; message: string; count?: number; delayMs?: number }> {
  try {
    const effectiveDelay = delayMs ?? getTelegramDelayMs();
    const res = await fetch('/api/telegram/simulate-burst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, delayMs: effectiveDelay }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error' };
  }
}

export interface DetectedTelegramGroup {
  chatId: string;
  title: string;
  type: 'group' | 'supergroup' | 'channel' | 'private';
  username?: string;
  lastActive: string;
  lastMessageSnippet?: string;
  memberCount?: number;
  isBotAdmin?: boolean;
  canSendMessages?: boolean;
  discoveredVia: 'webhook' | 'polling' | 'manual_check';
}

export interface TelegramChatInspectionData {
  chatId: string;
  title: string;
  type: 'group' | 'supergroup' | 'channel' | 'private';
  username?: string;
  description?: string;
  memberCount?: number;
  isBotAdmin: boolean;
  botStatus: string;
  canSendMessages: boolean;
  permissions?: {
    canPostMessages?: boolean;
    canEditMessages?: boolean;
    canDeleteMessages?: boolean;
    canInviteUsers?: boolean;
    canPinMessages?: boolean;
  };
  inviteLink?: string;
  lastInspectedAt: string;
  statusAssessment: string;
}

/**
 * Fetch all automatically detected/discovered Telegram groups & channels
 */
export async function getDetectedTelegramGroups(): Promise<{ success: boolean; groups: DetectedTelegramGroup[]; total: number }> {
  try {
    const res = await fetch('/api/telegram/detected-groups');
    if (!res.ok) throw new Error('Failed to fetch detected groups');
    return await res.json();
  } catch (err: any) {
    return { success: false, groups: [], total: 0 };
  }
}

/**
 * Actively scan Telegram API updates for newly joined groups or incoming messages
 */
export async function scanTelegramGroupUpdates(): Promise<{ success: boolean; message: string; groups: DetectedTelegramGroup[]; total: number }> {
  try {
    const res = await fetch('/api/telegram/scan-updates', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to scan telegram updates');
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Scan failed', groups: [], total: 0 };
  }
}

export interface BotActivityLogItem {
  id: string;
  timestamp: string;
  timestampMs: number;
  destinationChatId: string | number;
  destinationName: string;
  category: 'announcement' | 'attendance' | 'finance' | 'exam' | 'security' | 'automated' | 'general';
  triggeredByName: string;
  triggeredByRole: string;
  messageSnippet: string;
  fullMessage?: string;
  status: 'success' | 'failed' | 'queued';
  errorMessage?: string;
  retries?: number;
  latencyMs?: number;
  messageId?: number;
}

export const BOT_ACTIVITY_LOGS_KEY = 'phnom_pom_telegram_bot_activity_logs_v2';
export const GROUP_NOTIFICATION_RULES_KEY = 'phnom_pom_telegram_group_notification_rules_v2';

export interface GroupNotificationRuleConfig {
  id: string;
  groupId: string; // Chat ID or classroom id
  groupTitle: string;
  groupType: 'classroom' | 'staff' | 'management' | 'committee' | 'public_channel';
  ruleType: 'Full Sync' | 'Attendance Only' | 'Finance Updates' | 'Exam & Scores' | 'Emergency Alerts';
  allowedRoles: ('director' | 'teacher' | 'accountant' | 'admin' | 'all')[];
  enabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  autoSendDailyAttendance: boolean;
  autoSendMonthlyExamScores: boolean;
  autoSendFeeReminders: boolean;
  descriptionKh?: string;
  lastUpdated: string;
}

export function getStoredBotActivityLogs(): BotActivityLogItem[] {
  try {
    const raw = localStorage.getItem(BOT_ACTIVITY_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load bot activity logs from localStorage:', e);
  }

  // Return initial mock seed data for demonstration if empty
  const initialSeed: BotActivityLogItem[] = [
    {
      id: 'act-log-1',
      timestamp: 'ថ្ងៃនេះ ម៉ោង ០២:១៥ រសៀល',
      timestampMs: Date.now() - 1000 * 60 * 25,
      destinationChatId: '-1002495819001',
      destinationName: 'ថ្នាក់ទី១ក (បន្ទុកគ្រូ សុខ)',
      category: 'attendance',
      triggeredByName: 'អ្នកគ្រូ សុខ ម៉ាលី',
      triggeredByRole: 'គ្រូបន្ទុកថ្នាក់',
      messageSnippet: '📊 របាយការណ៍វត្តមានសិស្សប្រចាំថ្ងៃ: វត្តមាន ៣២/៣២ នាក់ (១០០%)',
      fullMessage: '📊 *សាលាបឋមសិក្សាភ្នំពុំ - ដំណឹងវត្តមាន*\n\n📌 *របាយការណ៍វត្តមានប្រចាំថ្ងៃ*\n• ថ្នាក់ទី១ក\n• សិស្សសរុប: ៣២ នាក់\n• វត្តមាន: ៣២ នាក់ (១០០%)\n\n🕒 ថ្ងៃទី ២៦ សីហា ២០២៦',
      status: 'success',
      latencyMs: 38,
      messageId: 88412
    },
    {
      id: 'act-log-2',
      timestamp: 'ថ្ងៃនេះ ម៉ោង ០១:៤៥ រសៀល',
      timestampMs: Date.now() - 1000 * 60 * 55,
      destinationChatId: '240224709',
      destinationName: 'ក្រុមលោកគ្រូ-អ្នកគ្រូ (@limsorn)',
      category: 'announcement',
      triggeredByName: 'នាយកសាលា លីម សន',
      triggeredByRole: 'នាយកសាលា / Super Admin',
      messageSnippet: '📢 សេចក្តីជូនដំណឹងស្តីពីកិច្ចប្រជុំប្រចាំខែសីហា ម៉ោង ០៤:០០ រសៀល',
      status: 'success',
      latencyMs: 42,
      messageId: 88411
    },
    {
      id: 'act-log-3',
      timestamp: 'ថ្ងៃនេះ ម៉ោង ១១:៣០ ព្រឹក',
      timestampMs: Date.now() - 1000 * 60 * 180,
      destinationChatId: '-1002495819002',
      destinationName: 'ថ្នាក់ទី២ក (បន្ទុកគ្រូ ចាន់ណា)',
      category: 'exam',
      triggeredByName: 'លោកគ្រូ ចាន់ណា',
      triggeredByRole: 'គ្រូបន្ទុកថ្នាក់',
      messageSnippet: '📝 លទ្ធផលតេស្តប្រចាំខែ: មធ្យមភាគថ្នាក់ ៨.៦/១០',
      status: 'success',
      latencyMs: 45,
      messageId: 88409
    },
    {
      id: 'act-log-4',
      timestamp: 'ថ្ងៃនេះ ម៉ោង ០៩:១០ ព្រឹក',
      timestampMs: Date.now() - 1000 * 60 * 320,
      destinationChatId: '-1002495819099',
      destinationName: 'ប៉ុស្តិ៍សាលាថ្មី (Channel ID សាកល្បង)',
      category: 'automated',
      triggeredByName: 'ប្រព័ន្ធស្វ័យប្រវត្តិ (Cron Scheduler)',
      triggeredByRole: 'System Bot',
      messageSnippet: '⏰ ការត្រួតពិនិត្យប្រព័ន្ធប្រចាំព្រឹក (System Diagnostic Ping)',
      status: 'failed',
      errorMessage: 'Bad Request: chat not found / Bot not admin in target channel',
      retries: 2
    },
    {
      id: 'act-log-5',
      timestamp: 'ថ្ងៃនេះ ម៉ោង ០៨:០០ ព្រឹក',
      timestampMs: Date.now() - 1000 * 60 * 390,
      destinationChatId: '-1002495819003',
      destinationName: 'ថ្នាក់ទី៣ក (បន្ទុកគ្រូ គឹមស៊ន)',
      category: 'finance',
      triggeredByName: 'អ្នកស្រី កែវ ចិន្តា',
      triggeredByRole: 'បេឡា / គណនេយ្យករ',
      messageSnippet: '💰 បញ្ជីបង់វិភាគទានសមាគមមាតាបិតាខែសីហា',
      status: 'success',
      latencyMs: 39,
      messageId: 88405
    }
  ];

  try {
    localStorage.setItem(BOT_ACTIVITY_LOGS_KEY, JSON.stringify(initialSeed));
  } catch (e) {
    // Ignore storage write fail
  }
  return initialSeed;
}

export function addBotActivityLog(item: Omit<BotActivityLogItem, 'id' | 'timestamp' | 'timestampMs'>): BotActivityLogItem {
  const fullItem: BotActivityLogItem = {
    ...item,
    id: `act-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleString('km-KH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
    timestampMs: Date.now(),
  };

  try {
    const current = getStoredBotActivityLogs();
    const updated = [fullItem, ...current].slice(0, 100); // keep last 100 records
    localStorage.setItem(BOT_ACTIVITY_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save bot activity log item:', e);
  }

  return fullItem;
}

export function clearStoredBotActivityLogs(): void {
  try {
    localStorage.removeItem(BOT_ACTIVITY_LOGS_KEY);
  } catch (e) {
    console.warn('Failed to clear bot activity logs:', e);
  }
}

/**
 * Get Group Notification Rules configuration from localStorage
 */
export function getStoredGroupNotificationRules(): GroupNotificationRuleConfig[] {
  try {
    const raw = localStorage.getItem(GROUP_NOTIFICATION_RULES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read group notification rules from localStorage:', e);
  }

  const defaultRules: GroupNotificationRuleConfig[] = [
    {
      id: 'rule-cls-1a',
      groupId: '-1002495819001',
      groupTitle: 'ថ្នាក់ទី១ក (បន្ទុកគ្រូ សុខ ម៉ាលី)',
      groupType: 'classroom',
      ruleType: 'Attendance Only',
      allowedRoles: ['teacher', 'director'],
      enabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '21:00',
      quietHoursEnd: '06:00',
      autoSendDailyAttendance: true,
      autoSendMonthlyExamScores: false,
      autoSendFeeReminders: false,
      descriptionKh: 'ផ្ញើតែវត្តមានសិស្សប្រចាំថ្ងៃ និងដំណឹងបន្ទាន់ពីគ្រូបន្ទុកថ្នាក់',
      lastUpdated: '2026-08-26'
    },
    {
      id: 'rule-cls-2a',
      groupId: '-1002495819002',
      groupTitle: 'ថ្នាក់ទី២ក (បន្ទុកគ្រូ ចាន់ណា)',
      groupType: 'classroom',
      ruleType: 'Full Sync',
      allowedRoles: ['teacher', 'director', 'accountant'],
      enabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '20:30',
      quietHoursEnd: '06:30',
      autoSendDailyAttendance: true,
      autoSendMonthlyExamScores: true,
      autoSendFeeReminders: true,
      descriptionKh: 'ផ្ញើគ្រប់ប្រភេទជូនដំណឹងរួមមាន វត្តមាន, ពិន្ទុប្រឡង និងវិក្កយបត្រ',
      lastUpdated: '2026-08-26'
    },
    {
      id: 'rule-cls-3a',
      groupId: '-1002495819003',
      groupTitle: 'ថ្នាក់ទី៣ក (បន្ទុកគ្រូ គឹមស៊ន)',
      groupType: 'classroom',
      ruleType: 'Exam & Scores',
      allowedRoles: ['teacher', 'director'],
      enabled: true,
      quietHoursEnabled: false,
      autoSendDailyAttendance: false,
      autoSendMonthlyExamScores: true,
      autoSendFeeReminders: false,
      descriptionKh: 'ផ្ញើតែតារាងពិន្ទុ មធ្យមភាគប្រចាំខែ និងចំណាត់ថ្នាក់សិស្ស',
      lastUpdated: '2026-08-26'
    },
    {
      id: 'rule-cls-4a',
      groupId: '-1002495819004',
      groupTitle: 'ថ្នាក់ទី៤ក (បន្ទុកគ្រូ វ៉ាន់នី)',
      groupType: 'classroom',
      ruleType: 'Attendance Only',
      allowedRoles: ['teacher', 'director'],
      enabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '21:00',
      quietHoursEnd: '06:00',
      autoSendDailyAttendance: true,
      autoSendMonthlyExamScores: false,
      autoSendFeeReminders: false,
      descriptionKh: 'ផ្ញើវត្តមានពេលព្រឹក និងរសៀលដោយស្វ័យប្រវត្តិ',
      lastUpdated: '2026-08-26'
    },
    {
      id: 'rule-staff-general',
      groupId: '240224709',
      groupTitle: 'ក្រុមលោកគ្រូ-អ្នកគ្រូ និងគណៈគ្រប់គ្រងសាលា',
      groupType: 'staff',
      ruleType: 'Emergency Alerts',
      allowedRoles: ['director', 'admin'],
      enabled: true,
      quietHoursEnabled: false,
      autoSendDailyAttendance: false,
      autoSendMonthlyExamScores: false,
      autoSendFeeReminders: false,
      descriptionKh: 'ដំណឹងបន្ទាន់ពីរដ្ឋបាលសាលា កាលវិភាគប្រជុំ និងកិច្ចការនាយកដ្ឋាន',
      lastUpdated: '2026-08-26'
    },
    {
      id: 'rule-finance-dept',
      groupId: '-1002495819010',
      groupTitle: 'ផ្នែកហិរញ្ញវត្ថុ និងគណនេយ្យសាលា',
      groupType: 'management',
      ruleType: 'Finance Updates',
      allowedRoles: ['accountant', 'director'],
      enabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
      autoSendDailyAttendance: false,
      autoSendMonthlyExamScores: false,
      autoSendFeeReminders: true,
      descriptionKh: 'របាយការណ៍ចំណូល-ចំណាយ វិក្កយបត្រ និងថវិកាសហគមន៍',
      lastUpdated: '2026-08-26'
    }
  ];

  try {
    localStorage.setItem(GROUP_NOTIFICATION_RULES_KEY, JSON.stringify(defaultRules));
  } catch (e) {}

  return defaultRules;
}

export function saveStoredGroupNotificationRules(rules: GroupNotificationRuleConfig[]): void {
  try {
    localStorage.setItem(GROUP_NOTIFICATION_RULES_KEY, JSON.stringify(rules));
  } catch (e) {
    console.warn('Failed to save group notification rules to localStorage:', e);
  }
}

/**
 * Live Inspect and Diagnose any Telegram Chat ID (Checks permissions, title, members, admin status)
 */
export async function inspectTelegramChat(chatId: string | number): Promise<{ success: boolean; isLiveTelegramVerified?: boolean; data?: TelegramChatInspectionData; error?: string }> {
  try {
    const res = await fetch('/api/telegram/inspect-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Chat inspection failed' };
  }
}

// ---------------------------------------------------------------------------
// Automatic Admin Error Alert System (Bot Initialization & Persistent API Errors)
// ---------------------------------------------------------------------------

export type BotErrorCategory =
  | 'initialization_failure'
  | 'persistent_api_error'
  | 'webhook_sync_error'
  | 'rate_limit_error'
  | 'auth_token_error'
  | 'network_timeout';

export interface AdminAlertConfig {
  enabled: boolean;
  adminChatId: string;
  adminName: string;
  failureThreshold: number; // e.g. 2 consecutive failures
  cooldownMinutes: number; // e.g. 5 minutes throttle
  alertOnInitializationFailure: boolean;
  alertOnWebhookFailure: boolean;
  alertOnPersistentErrors: boolean;
  alertOnRateLimit: boolean;
  lastAlertSentAt?: number;
}

export interface BotAlertLogRecord {
  id: string;
  timestamp: string;
  timeMs: number;
  category: BotErrorCategory;
  titleKh: string;
  errorMessage: string;
  affectedChatId: string;
  consecutiveFailures: number;
  status: 'sent' | 'throttled' | 'failed';
  adminChatId: string;
  details?: Record<string, any>;
}

export const ADMIN_ALERT_CONFIG_KEY = 'telegram_bot_admin_alert_config';
export const BOT_ALERT_HISTORY_KEY = 'telegram_bot_alert_history';

let inMemoryConsecutiveFailures = 0;
let inMemoryLastAlertSentAt = 0;

export function getAdminAlertConfig(): AdminAlertConfig {
  const defaultConfig: AdminAlertConfig = {
    enabled: true,
    adminChatId: '240224709',
    adminName: 'លោក លឹម សន (Super Admin)',
    failureThreshold: 2,
    cooldownMinutes: 5,
    alertOnInitializationFailure: true,
    alertOnWebhookFailure: true,
    alertOnPersistentErrors: true,
    alertOnRateLimit: true,
    lastAlertSentAt: 0,
  };

  try {
    const raw = localStorage.getItem(ADMIN_ALERT_CONFIG_KEY);
    if (!raw) return defaultConfig;
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return defaultConfig;
  }
}

export function saveAdminAlertConfig(config: Partial<AdminAlertConfig>): AdminAlertConfig {
  try {
    const current = getAdminAlertConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(ADMIN_ALERT_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save admin alert config:', e);
    return getAdminAlertConfig();
  }
}

export function getBotAlertHistory(): BotAlertLogRecord[] {
  try {
    const raw = localStorage.getItem(BOT_ALERT_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBotAlertHistory(logs: BotAlertLogRecord[]): void {
  try {
    // Keep last 50 logs
    const trimmed = logs.slice(0, 50);
    localStorage.setItem(BOT_ALERT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save bot alert history:', e);
  }
}

export function clearBotAlertHistory(): void {
  try {
    localStorage.removeItem(BOT_ALERT_HISTORY_KEY);
  } catch {}
}

export function getConsecutiveApiFailures(): number {
  return inMemoryConsecutiveFailures;
}

export function recordApiSuccess(): void {
  inMemoryConsecutiveFailures = 0;
}

function getCategoryKhmerTitle(category: BotErrorCategory): string {
  switch (category) {
    case 'initialization_failure':
      return 'បរាជ័យក្នុងការចាប់ផ្តើម Bot (Initialization Failure)';
    case 'persistent_api_error':
      return 'កំហុសបណ្តាញ/API ជាប់ៗគ្នា (Persistent API Error)';
    case 'webhook_sync_error':
      return 'កំហុស Webhook / SSL Sync';
    case 'rate_limit_error':
      return 'កំហុស Telegram Rate-Limit (429)';
    case 'auth_token_error':
      return 'Bot Token មិនត្រឹមត្រូវ';
    case 'network_timeout':
      return 'ដាច់ការតភ្ជាប់ Network Timeout';
    default:
      return 'កំហុស Bot API';
  }
}

/**
 * Triggers an immediate or rate-limited error notification to the administrator
 */
export async function triggerBotErrorAlert(params: {
  category: BotErrorCategory;
  errorMessage: string;
  affectedChatId?: string;
  details?: Record<string, any>;
  isForced?: boolean;
  consecutiveFailures?: number;
}): Promise<{ success: boolean; throttled?: boolean; message: string }> {
  const config = getAdminAlertConfig();
  const failuresCount = params.consecutiveFailures ?? Math.max(1, inMemoryConsecutiveFailures);

  if (!config.enabled && !params.isForced) {
    return { success: false, message: 'ប្រព័ន្ធប្រកាសអាសន្នត្រូវបានបិទ (Alerts Disabled)' };
  }

  // Check specific condition flags
  if (!params.isForced) {
    if (params.category === 'initialization_failure' && !config.alertOnInitializationFailure) {
      return { success: false, message: 'Initialization failure alerts disabled' };
    }
    if (params.category === 'webhook_sync_error' && !config.alertOnWebhookFailure) {
      return { success: false, message: 'Webhook failure alerts disabled' };
    }
    if (params.category === 'persistent_api_error' && !config.alertOnPersistentErrors) {
      return { success: false, message: 'Persistent error alerts disabled' };
    }
    if (params.category === 'rate_limit_error' && !config.alertOnRateLimit) {
      return { success: false, message: 'Rate-limit alerts disabled' };
    }
  }

  // Throttle cooldown check (except when forced for testing)
  const now = Date.now();
  const cooldownMs = config.cooldownMinutes * 60 * 1000;
  const lastAlertTime = config.lastAlertSentAt || inMemoryLastAlertSentAt;

  if (!params.isForced && lastAlertTime && (now - lastAlertTime < cooldownMs)) {
    const remainingSec = Math.ceil((cooldownMs - (now - lastAlertTime)) / 1000);
    const throttledLog: BotAlertLogRecord = {
      id: `alert-throt-${now}`,
      timestamp: new Date().toLocaleTimeString('km-KH'),
      timeMs: now,
      category: params.category,
      titleKh: 'ដំណឹងកំហុស (ផ្អាកបណ្តោះអាសន្ន Throttled)',
      errorMessage: params.errorMessage,
      affectedChatId: params.affectedChatId || config.adminChatId,
      consecutiveFailures: failuresCount,
      status: 'throttled',
      adminChatId: config.adminChatId,
      details: params.details,
    };
    const history = getBotAlertHistory();
    saveBotAlertHistory([throttledLog, ...history]);
    return {
      success: false,
      throttled: true,
      message: `សារប្រកាសអាសន្នត្រូវបានពន្យាពេលដោយស្វ័យប្រវត្តិ (នៅសល់ ${remainingSec} វិនាទី ក្នុង Cooldown)`
    };
  }

  try {
    const res = await fetch('/api/telegram/admin-error-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errorCategory: params.category,
        errorMessage: params.errorMessage,
        adminChatId: config.adminChatId,
        consecutiveFailures: failuresCount,
        details: {
          ...params.details,
          affectedChatId: params.affectedChatId,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const data = await res.json();
    const isSuccess = data.success === true;

    // Update timestamps
    if (isSuccess) {
      inMemoryLastAlertSentAt = now;
      saveAdminAlertConfig({ lastAlertSentAt: now });
    }

    const alertLog: BotAlertLogRecord = {
      id: `alert-${now}`,
      timestamp: new Date().toLocaleTimeString('km-KH'),
      timeMs: now,
      category: params.category,
      titleKh: getCategoryKhmerTitle(params.category),
      errorMessage: params.errorMessage,
      affectedChatId: params.affectedChatId || config.adminChatId,
      consecutiveFailures: failuresCount,
      status: isSuccess ? 'sent' : 'failed',
      adminChatId: config.adminChatId,
      details: params.details,
    };

    const history = getBotAlertHistory();
    saveBotAlertHistory([alertLog, ...history]);

    // Also record in bot activity log
    try {
      addBotActivityLog({
        destinationChatId: config.adminChatId,
        destinationName: `Admin Alert Channel (${config.adminName})`,
        category: 'security',
        triggeredByName: 'ប្រព័ន្ធតាមដានកំហុសស្វ័យប្រវត្ត (Alert System)',
        triggeredByRole: 'System',
        messageSnippet: `🚨 [ALERT] ${alertLog.titleKh}: ${params.errorMessage.substring(0, 60)}...`,
        fullMessage: `Critical Error Alert dispatched to admin: ${params.errorMessage}`,
        status: isSuccess ? 'success' : 'failed',
        errorMessage: isSuccess ? undefined : data.error,
        latencyMs: 40,
      });
    } catch {}

    return {
      success: isSuccess,
      message: isSuccess
        ? `បានបញ្ជូនសារដំណឹងអាសន្នទៅកាន់ Telegram Admin (${config.adminChatId}) ដោយជោគជ័យ!`
        : (data.error || 'បរាជ័យក្នុងការផ្ញើ Alert ទៅកាន់ Admin'),
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'បរាជ័យក្នុងការតភ្ជាប់ទៅកាន់ Alert Endpoint: ' + (err?.message || 'Network error'),
    };
  }
}

/**
 * Records an API transmission failure and automatically triggers an alert if the threshold is exceeded
 */
export async function recordApiFailure(
  category: BotErrorCategory,
  errorMessage: string,
  affectedChatId?: string,
  details?: Record<string, any>
): Promise<{ triggeredAlert: boolean; alertResult?: { success: boolean; throttled?: boolean; message: string } }> {
  inMemoryConsecutiveFailures++;
  const config = getAdminAlertConfig();

  if (config.enabled && inMemoryConsecutiveFailures >= config.failureThreshold) {
    const alertResult = await triggerBotErrorAlert({
      category,
      errorMessage,
      affectedChatId,
      details,
      consecutiveFailures: inMemoryConsecutiveFailures,
    });
    return { triggeredAlert: true, alertResult };
  }

  return { triggeredAlert: false };
}

// =========================================================================
// Real-time Event Notification Triggers (សិស្សថ្មី, គ្រូថ្មី, ពិន្ទុសំខាន់ៗ)
// =========================================================================

export const EVENT_NOTIFICATIONS_CONFIG_KEY = 'phnom_pom_telegram_event_notifications_v1';

export interface TelegramEventNotificationSettings {
  notifyOnNewStudent: boolean;
  notifyOnNewTeacher: boolean;
  notifyOnSignificantScore: boolean;
  scoreNotifyThreshold: 'significant_only' | 'all' | 'top_only' | 'at_risk_only';
  customChatId?: string;
}

export const DEFAULT_EVENT_NOTIFICATION_SETTINGS: TelegramEventNotificationSettings = {
  notifyOnNewStudent: true,
  notifyOnNewTeacher: true,
  notifyOnSignificantScore: true,
  scoreNotifyThreshold: 'significant_only',
};

export function getTelegramEventNotificationSettings(): TelegramEventNotificationSettings {
  try {
    const raw = localStorage.getItem(EVENT_NOTIFICATIONS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_EVENT_NOTIFICATION_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load telegram event notification settings:', e);
  }
  return DEFAULT_EVENT_NOTIFICATION_SETTINGS;
}

export function saveTelegramEventNotificationSettings(
  partial: Partial<TelegramEventNotificationSettings>
): TelegramEventNotificationSettings {
  try {
    const current = getTelegramEventNotificationSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(EVENT_NOTIFICATIONS_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save telegram event notification settings:', e);
    return getTelegramEventNotificationSettings();
  }
}

/**
 * Send Telegram notification when a new student is registered
 */
export async function notifyTelegramNewStudent(
  student: {
    id?: string;
    code?: string;
    nameKhmer: string;
    nameLatin?: string;
    gender: 'M' | 'F';
    grade: number;
    section: string;
    dob?: string;
    guardianName?: string;
    guardianPhone?: string;
    phone?: string;
    village?: string;
    commune?: string;
    district?: string;
    province?: string;
    isTransferIn?: boolean;
    previousSchool?: string;
  },
  actor?: { nameKhmer?: string; role?: string },
  customChatId?: string | number
): Promise<TelegramSendResult> {
  const config = getTelegramEventNotificationSettings();
  if (!config.notifyOnNewStudent) {
    return { success: true, message: 'មុខងារជូនដំណឹងសិស្សថ្មីត្រូវបានបិទ (Disabled in settings)' };
  }

  const targetChatId = customChatId || (config.customChatId?.trim() ? config.customChatId.trim() : undefined);
  const genderKh = student.gender === 'F' ? 'ស្រី (F)' : 'ប្រុស (M)';
  const addressParts = [student.village, student.commune, student.district, student.province].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'មិនបានបញ្ជាក់';
  const guardianPhone = student.guardianPhone || student.phone || 'គ្មានលេខ';
  const guardianName = student.guardianName || 'មិនបានបញ្ជាក់';
  const dobText = student.dob || 'មិនបានបញ្ជាក់';
  const actorName = actor?.nameKhmer || 'គណៈគ្រប់គ្រងសាលា';
  const actorRole = actor?.role ? `(${actor.role})` : '';
  const transferNote = student.isTransferIn && student.previousSchool 
    ? `\n🔄 *ផ្ទេរមកពី៖* ${student.previousSchool}` 
    : '';

  const message = 
`🎓 *សិស្សថ្មីត្រូវបានចុះឈ្មោះចូលរៀនក្នុងប្រព័ន្ធ*
━━━━━━━━━━━━━━━━━━━━━━
👤 *ឈ្មោះសិស្ស៖* *${student.nameKhmer}* ${student.nameLatin ? `(${student.nameLatin})` : ''}
🆔 *អត្តលេខសិស្ស៖* \`${student.code || 'ទើបបង្កើត'}\`
🏫 *ថ្នាក់រៀន៖* ថ្នាក់ទី *${student.grade}«${student.section}»*
🚻 *ភេទ៖* ${genderKh}
🎂 *ថ្ងៃខែឆ្នាំកំណើត៖* ${dobText}
👨‍👩‍👦 *អាណាព្យាបាល៖* ${guardianName}
📞 *ទូរស័ព្ទអាណាព្យាបាល៖* ${guardianPhone}
📍 *អាសយដ្ឋាន/ទីលំនៅ៖* ${address}${transferNote}
━━━━━━━━━━━━━━━━━━━━━━
✍️ *អ្នកកត់ត្រា៖* ${actorName} ${actorRole}
🕒 *កាលបរិច្ឆេទ៖* _${new Date().toLocaleString('km-KH')}_`;

  return await sendTelegramNotification({
    title: `ចុះឈ្មោះសិស្សថ្មី៖ ${student.nameKhmer} (ថ្នាក់ទី ${student.grade}${student.section})`,
    message,
    category: 'announcement',
    chatId: targetChatId,
    metadata: {
      eventType: 'new_student',
      studentId: student.id,
      studentCode: student.code,
      grade: student.grade,
      section: student.section,
      nameKhmer: student.nameKhmer,
      guardianPhone,
      triggeredByName: actorName,
      triggeredByRole: actor?.role || 'Admin'
    }
  });
}

/**
 * Send Telegram notification when a new teacher is added to the system
 */
export async function notifyTelegramNewTeacher(
  teacher: {
    id?: string;
    staffCode?: string;
    nameKhmer: string;
    nameLatin?: string;
    gender?: 'M' | 'F';
    role?: string;
    assignedGrade?: number;
    assignedSection?: string;
    phone?: string;
    email?: string;
    qualification?: string;
    yearsOfService?: number;
  },
  actor?: { nameKhmer?: string; role?: string },
  customChatId?: string | number
): Promise<TelegramSendResult> {
  const config = getTelegramEventNotificationSettings();
  if (!config.notifyOnNewTeacher) {
    return { success: true, message: 'មុខងារជូនដំណឹងគ្រូថ្មីត្រូវបានបិទ (Disabled in settings)' };
  }

  const targetChatId = customChatId || (config.customChatId?.trim() ? config.customChatId.trim() : undefined);
  const genderKh = teacher.gender === 'F' ? 'ស្រី (F)' : 'ប្រុស (M)';
  const phoneText = teacher.phone || 'គ្មានលេខ';
  const emailText = teacher.email || 'គ្មាន';
  const roleText = teacher.role || 'គ្រូបង្រៀន';
  const classText = teacher.assignedGrade 
    ? `ថ្នាក់ទី ${teacher.assignedGrade}«${teacher.assignedSection || 'ក'}»` 
    : 'គ្មានបន្ទុកថ្នាក់ជាក់លាក់';
  const qualificationText = teacher.qualification || 'គរុកោសល្យបឋមសិក្សា';
  const experienceText = typeof teacher.yearsOfService === 'number' && teacher.yearsOfService > 0
    ? `\n⏳ *បទពិសោធន៍បង្រៀន៖* ${teacher.yearsOfService} ឆ្នាំ`
    : '';
  const actorName = actor?.nameKhmer || 'លោកនាយកសាលា';
  const actorRole = actor?.role ? `(${actor.role})` : '';

  const message = 
`👨‍🏫 *លោកគ្រូ-អ្នកគ្រូថ្មីត្រូវបានបន្ថែមក្នុងប្រព័ន្ធ*
━━━━━━━━━━━━━━━━━━━━━━
👤 *គោត្តនាម-នាម៖* *${teacher.nameKhmer}* ${teacher.nameLatin ? `(${teacher.nameLatin})` : ''}
🆔 *អត្តលេខមន្ត្រី (Staff Code)៖* \`${teacher.staffCode || 'ទើបបង្កើត'}\`
💼 *មុខតំណែង/តួនាទី៖* *${roleText}*
🏫 *បន្ទុកថ្នាក់៖* ${classText}
🚻 *ភេទ៖* ${genderKh}
📞 *លេខទូរស័ព្ទ៖* ${phoneText}
📧 *អ៊ីម៉ែល៖* \`${emailText}\`
🎓 *កម្រិតវប្បធម៌/សញ្ញាបត្រ៖* ${qualificationText}${experienceText}
━━━━━━━━━━━━━━━━━━━━━━
✍️ *អ្នកបញ្ចូលទិន្នន័យ៖* ${actorName} ${actorRole}
🕒 *កាលបរិច្ឆេទ៖* _${new Date().toLocaleString('km-KH')}_`;

  return await sendTelegramNotification({
    title: `បន្ថែមលោកគ្រូ/អ្នកគ្រូថ្មី៖ ${teacher.nameKhmer} (${roleText})`,
    message,
    category: 'general',
    chatId: targetChatId,
    metadata: {
      eventType: 'new_teacher',
      teacherId: teacher.id,
      staffCode: teacher.staffCode,
      nameKhmer: teacher.nameKhmer,
      role: teacher.role,
      triggeredByName: actorName,
      triggeredByRole: actor?.role || 'Director'
    }
  });
}

/**
 * Send Telegram notification when significant score updates occur (A, B, Top 3, or At-Risk/Fail)
 */
export async function notifyTelegramScoreUpdate(
  record: {
    id: string;
    studentId: string;
    studentCode: string;
    studentNameKhmer: string;
    gender: 'M' | 'F';
    grade: number;
    section: string;
    monthOrSemester: string;
    academicYear: string;
    scores: {
      khmerReading?: number;
      khmerWriting?: number;
      mathematics?: number;
      scienceSocial?: number;
      moralCivics?: number;
      artsPhysical?: number;
      [key: string]: number | undefined;
    };
    totalScore: number;
    averageScore: number;
    rank: number;
    gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    resultStatus: 'ជាប់' | 'ធ្លាក់';
    remarks?: string;
  },
  forceSend: boolean = false,
  actor?: { nameKhmer?: string; role?: string },
  customChatId?: string | number
): Promise<TelegramSendResult> {
  const config = getTelegramEventNotificationSettings();
  if (!config.notifyOnSignificantScore && !forceSend) {
    return { success: true, message: 'មុខងារជូនដំណឹងពិន្ទុត្រូវបានបិទ (Disabled in settings)' };
  }

  const isTopRank = record.rank <= 3 || record.gradeLetter === 'A' || record.gradeLetter === 'B';
  const isAtRisk = record.resultStatus === 'ធ្លាក់' || record.gradeLetter === 'F' || record.averageScore < 5.0;

  // Filter based on threshold unless forceSend
  if (!forceSend) {
    if (config.scoreNotifyThreshold === 'top_only' && !isTopRank) {
      return { success: true, message: 'មិនមែនសិស្សឆ្នើម (Top-Ranked) មិនបានផ្ញើ' };
    }
    if (config.scoreNotifyThreshold === 'at_risk_only' && !isAtRisk) {
      return { success: true, message: 'មិនមែនសិស្សរៀនយឺត (At-Risk) មិនបានផ្ញើ' };
    }
    if (config.scoreNotifyThreshold === 'significant_only' && !isTopRank && !isAtRisk) {
      return { success: true, message: 'ពិន្ទុមធ្យមធម្មតា មិនស្ថិតក្នុងលក្ខខណ្ឌសំខាន់ៗ (A, B, Top 3 ឬធ្លាក់)' };
    }
  }

  const targetChatId = customChatId || (config.customChatId?.trim() ? config.customChatId.trim() : undefined);
  let headerIcon = '📊';
  let badgeTitle = 'អាប់ដេតពិន្ទុ & លទ្ធផលសិក្សា';
  if (record.gradeLetter === 'A' || record.rank === 1) {
    headerIcon = '🏆🌟';
    badgeTitle = 'លទ្ធផលសិក្សាឆ្នើមលេខ១ (Top 1 Outstanding Score)';
  } else if (isTopRank) {
    headerIcon = '🌟';
    badgeTitle = `លទ្ធផលសិក្សាល្អប្រសើរ (ចំណាត់ថ្នាក់លេខ ${record.rank})`;
  } else if (isAtRisk) {
    headerIcon = '⚠️🚨';
    badgeTitle = 'ដំណឹងសិស្សរៀនយឺត / ត្រូវការជំនួយបំប៉នបន្ទាន់ (Academic Alert)';
  }

  const actorName = actor?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់';
  const actorRole = actor?.role ? `(${actor.role})` : '';

  const reading = record.scores.khmerReading ?? 0;
  const writing = record.scores.khmerWriting ?? 0;
  const math = record.scores.mathematics ?? 0;
  const science = record.scores.scienceSocial ?? 0;
  const moral = record.scores.moralCivics ?? 0;
  const arts = record.scores.artsPhysical ?? 0;

  const defaultRemark = record.resultStatus === 'ជាប់' 
    ? (isTopRank ? 'ខិតខំរៀនសូត្របានល្អប្រសើរណាស់ សូមបន្តរក្សាលទ្ធផលនេះ!' : 'ការសិក្សាបានជាប់តាមកម្រិតស្តង់ដារ')
    : 'លទ្ធផលក្រោមមធ្យមភាគ ៥.០ ត្រូវការជួបប្រឹក្សាជាមួយមាតាបិតា និងបំប៉នបន្ថែម';

  const remarksText = record.remarks?.trim() ? record.remarks.trim() : defaultRemark;

  const message =
`${headerIcon} *${badgeTitle}*
━━━━━━━━━━━━━━━━━━━━━━
👤 *ឈ្មោះសិស្ស៖* *${record.studentNameKhmer}* (អត្តលេខ៖ \`${record.studentCode}\`)
🏫 *ថ្នាក់រៀន៖* ថ្នាក់ទី *${record.grade}«${record.section}»*
🗓️ *ការវាយតម្លៃ៖* ខែ *${record.monthOrSemester}* (ឆ្នាំ ${record.academicYear})
━━━━━━━━━━━━━━━━━━━━━━
🏆 *ចំណាត់ថ្នាក់ក្នុងថ្នាក់៖* *លេខ ${record.rank}*
📈 *ពិន្ទុមធ្យមភាគ៖* *${record.averageScore.toFixed(2)} / 10*
🎖️ *និទ្ទេសរួម៖* *និទ្ទេស ${record.gradeLetter}* (${record.resultStatus === 'ជាប់' ? '✅ ជាប់' : '❌ ធ្លាក់'})
📊 *ពិន្ទុសរុប៖* ${record.totalScore.toFixed(1)} / 60

📝 *ពិន្ទុតាមមុខវិជ្ជា៖*
• ភាសាខ្មែរ (អាន): *${reading}* | (សរសេរ): *${writing}*
• គណិតវិទ្យា: *${math}*
• វិទ្យាសាស្ត្រ & សិក្សាសង្គម: *${science}*
• សីលធម៌ & ពលរដ្ឋ: *${moral}*
• សិល្បៈ & អប់រំកាយ: *${arts}*

💬 *ការកត់សម្គាល់៖* ${remarksText}
━━━━━━━━━━━━━━━━━━━━━━
👨‍🏫 *គ្រូបន្ទុកថ្នាក់៖* ${actorName} ${actorRole}
🕒 *កាលបរិច្ឆេទ៖* _${new Date().toLocaleString('km-KH')}_`;

  return await sendTelegramNotification({
    title: `${headerIcon} ពិន្ទុខែ ${record.monthOrSemester}៖ ${record.studentNameKhmer} (លេខ ${record.rank} - និទ្ទេស ${record.gradeLetter})`,
    message,
    category: isAtRisk ? 'security' : 'audit',
    chatId: targetChatId,
    metadata: {
      eventType: 'score_update',
      studentId: record.studentId,
      studentCode: record.studentCode,
      grade: record.grade,
      section: record.section,
      month: record.monthOrSemester,
      rank: record.rank,
      averageScore: record.averageScore,
      gradeLetter: record.gradeLetter,
      resultStatus: record.resultStatus,
      isTopRank,
      isAtRisk,
      triggeredByName: actorName,
      triggeredByRole: actor?.role || 'Teacher'
    }
  });
}

/**
 * Send Telegram notification when bulk students are imported
 */
export async function notifyTelegramBulkStudents(
  count: number,
  grade?: number,
  section?: string,
  actor?: { nameKhmer?: string; role?: string },
  customChatId?: string | number
): Promise<TelegramSendResult> {
  const config = getTelegramEventNotificationSettings();
  if (!config.notifyOnNewStudent) {
    return { success: true, message: 'មុខងារជូនដំណឹងសិស្សថ្មីត្រូវបានបិទ' };
  }

  const targetChatId = customChatId || (config.customChatId?.trim() ? config.customChatId.trim() : undefined);
  const classText = grade ? `ថ្នាក់ទី ${grade}«${section || 'ក'}»` : 'គ្រប់កម្រិតថ្នាក់';
  const actorName = actor?.nameKhmer || 'គណៈគ្រប់គ្រងសាលា';
  const actorRole = actor?.role ? `(${actor.role})` : '';

  const message =
`🎓 *ការនាំចូលបញ្ជីសិស្សថ្មីជាដុំ (Bulk Students Registration)*
━━━━━━━━━━━━━━━━━━━━━━
📊 *ចំនួនសិស្សសរុប៖* *${count} នាក់*
🏫 *គោលដៅថ្នាក់៖* *${classText}*
📁 *ប្រភពទិន្នន័យ៖* នាំចូលតាមឯកសារ Excel / CSV
━━━━━━━━━━━━━━━━━━━━━━
✍️ *អ្នកកត់ត្រា៖* ${actorName} ${actorRole}
🕒 *កាលបរិច្ឆេទ៖* _${new Date().toLocaleString('km-KH')}_`;

  return await sendTelegramNotification({
    title: `នាំចូលសិស្សថ្មីជាដុំ៖ ${count} នាក់ (${classText})`,
    message,
    category: 'announcement',
    chatId: targetChatId,
    metadata: {
      eventType: 'bulk_students',
      count,
      grade,
      section,
      triggeredByName: actorName,
      triggeredByRole: actor?.role || 'Admin'
    }
  });
}



