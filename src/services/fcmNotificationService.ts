import { SystemNotification, UserRole, ActiveTab } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * FCM & System Push Notification Service
 * Manages browser push permissions, local desktop alerts, and Firestore real-time notification dispatch
 */

export interface SendNotificationPayload {
  title: string;
  message: string;
  type: 'score_deadline' | 'school_event' | 'alert' | 'info' | 'system' | 'fcm_push';
  targetRole?: UserRole | 'all';
  targetTeacherGrade?: number;
  targetTeacherSection?: string;
  priority?: 'normal' | 'high' | 'urgent';
  deadlineDate?: string;
  actionTab?: ActiveTab;
  meta?: Record<string, any>;
}

/**
 * Requests Notification permission from the browser
 */
export const requestPushNotificationPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser does not support desktop notifications');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Checks if browser notifications are currently granted
 */
export const isPushNotificationGranted = (): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
};

/**
 * Displays a native browser desktop/mobile notification if permission is granted
 */
export const showBrowserPushNotification = (
  title: string,
  body: string,
  options?: {
    icon?: string;
    tag?: string;
    data?: any;
    onClickUrl?: string;
  }
) => {
  if (!isPushNotificationGranted()) return;

  try {
    const notification = new Notification(title, {
      body,
      icon: options?.icon || '/apple-touch-icon.png',
      badge: '/apple-touch-icon.png',
      tag: options?.tag || 'phnom-pom-notification',
      requireInteraction: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn('Native notification display failed (may be restricted in iframe):', err);
  }
};

/**
 * Helper to build a standard SystemNotification object
 */
export const buildNotification = (payload: SendNotificationPayload): SystemNotification => {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  // If permission is granted, also show browser push notification
  if (isPushNotificationGranted()) {
    showBrowserPushNotification(payload.title, payload.message);
  }

  return {
    id,
    title: payload.title,
    message: payload.message,
    timestamp,
    type: payload.type,
    targetRole: payload.targetRole || 'all',
    targetTeacherGrade: payload.targetTeacherGrade,
    targetTeacherSection: payload.targetTeacherSection,
    read: false,
    priority: payload.priority || 'normal',
    deadlineDate: payload.deadlineDate,
    actionTab: payload.actionTab,
    meta: {
      ...payload.meta,
      fcmMessageId: `fcm_${Date.now()}`
    }
  };
};

/**
 * Generates automated score entry deadline reminder notifications
 */
export const generateScoreDeadlineReminder = (
  monthOrSemester: string,
  deadlineDate: string,
  targetGrade?: number,
  targetSection?: string
): SystemNotification => {
  const gradeLabel = targetGrade
    ? `ថ្នាក់ទី ${targetGrade}${targetSection || ''}`
    : 'គ្រប់កម្រិតថ្នាក់ (ថ្នាក់ទី១ ដល់ ទី៦)';

  return buildNotification({
    title: `⏰ ការរំលឹកកាលបរិច្ឆេទបញ្ចូលពិន្ទុ (${monthOrSemester})`,
    message: `សូមលោកគ្រូ-អ្នកគ្រូបន្ទុក${gradeLabel} រួសរាន់បញ្ចូល និងត្រួតពិនិត្យពិន្ទុសិស្សសម្រាប់ខែ «${monthOrSemester}» ឱ្យបានមុនថ្ងៃទី ${deadlineDate} ដើម្បីរៀបចំចំណាត់ថ្នាក់ និងចេញព្រឹត្តិបត្រពិន្ទុ។`,
    type: 'score_deadline',
    targetRole: 'teacher',
    targetTeacherGrade: targetGrade,
    targetTeacherSection: targetSection,
    priority: 'urgent',
    deadlineDate,
    actionTab: 'scores',
    meta: {
      monthOrSemester,
      eventDate: deadlineDate
    }
  });
};

/**
 * Generates automated school activity or meeting reminder notifications
 */
export const generateSchoolActivityReminder = (
  activityTitle: string,
  eventDate: string,
  location: string,
  targetRole: UserRole | 'all' = 'all'
): SystemNotification => {
  return buildNotification({
    title: `📢 សេចក្តីជូនដំណឹងសកម្មភាពសាលា៖ ${activityTitle}`,
    message: `សាលារៀនសូមគោរពអញ្ជើញលោកគ្រូ-អ្នកគ្រូ និងបុគ្គលិកទាំងអស់ ចូលរួម «${activityTitle}» នៅថ្ងៃទី ${eventDate} ទីតាំង៖ ${location}។`,
    type: 'school_event',
    targetRole,
    priority: 'high',
    deadlineDate: eventDate,
    actionTab: 'calendar',
    meta: {
      eventDate,
      location
    }
  });
};
