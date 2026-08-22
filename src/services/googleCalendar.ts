import { getAccessToken } from './googleAuth';
import { AcademicCalendarEvent, SchoolProfile } from '../types';

/**
 * Maps event types to color IDs in Google Calendar
 * 1: Lavender, 2: Sage, 3: Grape, 4: Flamingo, 5: Banana, 6: Tangerine, 7: Peacock, 8: Graphite, 9: Blueberry, 10: Basil, 11: Tomato
 */
const getGoogleCalendarColorId = (type: AcademicCalendarEvent['type']): string => {
  switch (type) {
    case 'exam':
      return '11'; // Tomato / Red for exams
    case 'holiday':
      return '6'; // Tangerine / Orange for public holidays
    case 'vacation':
      return '10'; // Basil / Green for school vacations
    case 'meeting':
      return '9'; // Blueberry / Blue for staff meetings
    case 'ceremony':
      return '3'; // Grape / Purple for ceremonies & festivals
    default:
      return '7'; // Peacock for general academic
  }
};

/**
 * Creates a single event in Google Calendar API
 */
export const createGoogleCalendarEvent = async (
  event: AcademicCalendarEvent,
  schoolProfile: SchoolProfile
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  // Calculate next day date for end date if all-day event
  const startDateObj = new Date(event.startDate);
  const endDateObj = new Date(event.endDate);
  
  // Google Calendar all-day end dates are exclusive, so add 1 day to end date
  const inclusiveEndDate = new Date(endDateObj);
  inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
  const endFormatted = inclusiveEndDate.toISOString().split('T')[0];

  const requestBody = {
    summary: `[${schoolProfile.nameKhmer}] ${event.titleKhmer}`,
    description: `${event.description || ''}\n\n🏫 សាលារៀន៖ ${schoolProfile.nameKhmer} (${schoolProfile.nameLatin})\n🎯 កម្រិត/ថ្នាក់៖ ${event.targetGrades || 'សាលារៀនទាំងមូល'}\n📍 ទីតាំង៖ ${schoolProfile.village} ${schoolProfile.commune} ${schoolProfile.district} ${schoolProfile.province}\n📞 ទំនាក់ទំនងនាយក៖ ${schoolProfile.principalName} (${schoolProfile.principalPhone})`,
    location: event.location || `${schoolProfile.nameKhmer}, ${schoolProfile.district}, ${schoolProfile.province}`,
    colorId: getGoogleCalendarColorId(event.type),
    start: {
      date: event.startDate,
      timeZone: 'Asia/Phnom_Penh'
    },
    end: {
      date: endFormatted,
      timeZone: 'Asia/Phnom_Penh'
    },
    transparency: event.type === 'holiday' || event.type === 'vacation' ? 'transparent' : 'opaque'
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការបញ្ចូលព្រឹត្តិការណ៍ទៅ Google Calendar');
  }

  const data = await response.json();
  return {
    success: true,
    eventId: data.id,
    htmlLink: data.htmlLink
  };
};

/**
 * Batch syncs multiple academic events to Google Calendar
 */
export const batchSyncEventsToGoogleCalendar = async (
  events: AcademicCalendarEvent[],
  schoolProfile: SchoolProfile,
  onProgress?: (current: number, total: number, eventTitle: string) => void
): Promise<{ syncedCount: number; failedCount: number; results: Array<{ id: string; success: boolean; error?: string }> }> => {
  const results: Array<{ id: string; success: boolean; error?: string }> = [];
  let syncedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (onProgress) {
      onProgress(i + 1, events.length, event.titleKhmer);
    }

    try {
      await createGoogleCalendarEvent(event, schoolProfile);
      syncedCount++;
      results.push({ id: event.id, success: true });
      // Small pause between requests to prevent rate limiting
      await new Promise(res => setTimeout(res, 250));
    } catch (err: any) {
      failedCount++;
      results.push({ id: event.id, success: false, error: err.message });
    }
  }

  return { syncedCount, failedCount, results };
};

/**
 * Generates a 1-click Google Calendar Web template URL
 */
export const generateGoogleCalendarWebUrl = (
  event: AcademicCalendarEvent,
  schoolName: string,
  location?: string
): string => {
  const title = encodeURIComponent(`[${schoolName}] ${event.titleKhmer}`);
  const details = encodeURIComponent(
    `${event.description || ''}\n\nសាលារៀន៖ ${schoolName}\nកម្រិត/ថ្នាក់៖ ${event.targetGrades || 'សិស្សទាំងអស់'}`
  );
  const loc = encodeURIComponent(location || schoolName);

  // Format dates: YYYYMMDD for all-day events
  const startStr = event.startDate.replace(/-/g, '');
  
  // Exclusive end date
  const endD = new Date(event.endDate);
  endD.setDate(endD.getDate() + 1);
  const endStr = endD.toISOString().split('T')[0].replace(/-/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${loc}`;
};

/**
 * Generates and downloads standard .ics iCalendar file for importing
 */
export const exportToICalendarFile = (
  events: AcademicCalendarEvent[],
  schoolProfile: SchoolProfile
) => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Phnom Pom Primary School//MoEYS Academic Calendar//KM',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:កាលវិភាគសិក្សា ${schoolProfile.nameKhmer}`,
    'X-WR-TIMEZONE:Asia/Phnom_Penh'
  ];

  events.forEach((event) => {
    const startStr = event.startDate.replace(/-/g, '');
    const endD = new Date(event.endDate);
    endD.setDate(endD.getDate() + 1);
    const endStr = endD.toISOString().split('T')[0].replace(/-/g, '');
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${event.id}-${Date.now()}@phnompom.edu.kh`);
    icsContent.push(`DTSTAMP:${nowStr}`);
    icsContent.push(`DTSTART;VALUE=DATE:${startStr}`);
    icsContent.push(`DTEND;VALUE=DATE:${endStr}`);
    icsContent.push(`SUMMARY:[${schoolProfile.nameKhmer}] ${event.titleKhmer}`);
    icsContent.push(`DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`);
    icsContent.push(`LOCATION:${schoolProfile.nameKhmer}, ${schoolProfile.district}, ${schoolProfile.province}`);
    icsContent.push(`CATEGORIES:${event.type.toUpperCase()}`);
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Academic_Calendar_${schoolProfile.schoolCode}_${new Date().getFullYear()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
