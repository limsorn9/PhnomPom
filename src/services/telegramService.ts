/**
 * Telegram Notification & Confirmation Service
 * Sends automated notifications and handles OTP verification via Telegram Bot API.
 */

export interface TelegramNotificationPayload {
  title: string;
  message: string;
  category?: 'announcement' | 'attendance' | 'event' | 'security' | 'audit' | 'general';
  metadata?: Record<string, any>;
}

export interface TelegramSendResult {
  success: boolean;
  message: string;
  messageId?: number;
  error?: string;
  debugCode?: string;
}

/**
 * Send notification to the configured Telegram chat/group
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

    const res = await fetch('/api/telegram/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        category: payload.category,
        title: payload.title,
        metadata: payload.metadata,
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
