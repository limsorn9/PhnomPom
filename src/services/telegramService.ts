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
    return data;
  } catch (err: any) {
    console.error('sendTelegramNotification failed:', err);
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
    return await res.json();
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

