import { getAccessToken } from './googleAuth';
import { AcademicCalendarEvent, SchoolProfile, TeacherMeetingRecord, TeacherDailyTask } from '../types';

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
  colorId?: string;
}

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

/**
 * Fetch events from Google Calendar for agenda / dashboard display
 */
export const fetchGoogleCalendarEvents = async (
  timeMinOrMaxResults?: string | number,
  timeMax?: string,
  maxResults: number = 20
): Promise<GoogleCalendarEventItem[]> => {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  let finalTimeMin: string | undefined = undefined;
  let finalMaxResults: number = maxResults;

  if (typeof timeMinOrMaxResults === 'number') {
    finalMaxResults = timeMinOrMaxResults;
  } else if (typeof timeMinOrMaxResults === 'string') {
    finalTimeMin = timeMinOrMaxResults;
  }

  const now = new Date();
  const start = finalTimeMin || new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = timeMax || new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString();

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', start);
  url.searchParams.set('timeMax', end);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', String(finalMaxResults));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    console.warn('Failed to fetch Google Calendar events:', await response.text());
    return [];
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || 'គ្មានចំណងជើង',
    description: item.description || '',
    location: item.location || '',
    start: item.start || {},
    end: item.end || {},
    htmlLink: item.htmlLink,
    colorId: item.colorId
  }));
};

/**
 * Creates/Syncs a Teacher Meeting with full resolutions & agenda to Google Calendar
 */
export const createTeacherMeetingGoogleCalendarEvent = async (
  meeting: TeacherMeetingRecord,
  schoolProfile: SchoolProfile
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const resolutionsText = meeting.resolutions.length > 0
    ? `\n\n📌 សេចក្ដីសម្រេចចិត្តពីការប្រជុំ (Resolutions):\n${meeting.resolutions.map((r, idx) => `  ${idx + 1}. ${r}`).join('\n')}`
    : '';

  const agendaText = meeting.agendas.length > 0
    ? `\n\n📋 របៀបវារៈប្រជុំ (Agenda):\n${meeting.agendas.map((a, idx) => `  ${idx + 1}. ${a}`).join('\n')}`
    : '';

  const actionItemsText = meeting.actionItems.length > 0
    ? `\n\n⚡ ផែនការសកម្មភាពបន្ត (Action Items):\n${meeting.actionItems.map((act, idx) => `  ${idx + 1}. [${act.deadlineDate}] ${act.taskTitle} (អ្នកទទួលបន្ទុក៖ ${act.responsiblePerson})`).join('\n')}`
    : '';

  const attendeesText = `\n\n👥 វត្តមាន៖ ${meeting.totalPresent}/${meeting.totalInvited} នាក់ | ប្រធានអង្គប្រជុំ៖ ${meeting.chairpersonName} | លេខា៖ ${meeting.secretaryName}`;

  const description = `🏫 សាលាបឋមសិក្សា៖ ${schoolProfile.nameKhmer}\n🏷️ ប្រភេទកិច្ចប្រជុំ៖ ${meeting.meetingType === 'monthly' ? 'កិច្ចប្រជុំប្រចាំខែ' : meeting.meetingType === 'pedagogical' ? 'កិច្ចប្រជុំបច្ចេកទេស/គរុកោសល្យ' : 'កិច្ចប្រជុំទូទៅ'}\n⏰ ពេលវេលា៖ ${meeting.meetingTime}\n📍 ទីកន្លែង៖ ${meeting.location}${attendeesText}${agendaText}\n\n📝 សេចក្តីសង្ខេបខ្លឹមសារ៖\n${meeting.discussionSummary || 'គ្មាន'}${resolutionsText}${actionItemsText}`;

  // Next day for all-day or specific date
  const startDateObj = new Date(meeting.meetingDate);
  const inclusiveEndDate = new Date(startDateObj);
  inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
  const endFormatted = inclusiveEndDate.toISOString().split('T')[0];

  const requestBody = {
    summary: `[កិច្ចប្រជុំគ្រូ] ${meeting.title}`,
    description,
    location: meeting.location || `${schoolProfile.nameKhmer}`,
    colorId: '9', // Blueberry / Blue for staff meetings
    start: {
      date: meeting.meetingDate,
      timeZone: 'Asia/Phnom_Penh'
    },
    end: {
      date: endFormatted,
      timeZone: 'Asia/Phnom_Penh'
    }
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
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការ sync កិច្ចប្រជុំទៅ Google Calendar');
  }

  const data = await response.json();
  return {
    success: true,
    eventId: data.id,
    htmlLink: data.htmlLink
  };
};

/**
 * Creates/Syncs a single daily teacher task to Google Calendar
 */
export const createTeacherDailyTaskEvent = async (
  task: TeacherDailyTask,
  schoolName: string
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const startDateObj = new Date(task.date);
  const inclusiveEndDate = new Date(startDateObj);
  inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
  const endFormatted = inclusiveEndDate.toISOString().split('T')[0];

  const priorityLabel = task.priority === 'urgent' ? '🔴 បន្ទាន់' : task.priority === 'high' ? '🟠 សំខាន់' : '🟢 ធម្មតា';

  const requestBody = {
    summary: `[ភារកិច្ចគ្រូ] ${task.title}`,
    description: `${task.description || ''}\n\n🏫 សាលារៀន៖ ${schoolName}\n🎯 អាទិភាព៖ ${priorityLabel}\n👤 គ្រូបន្ទុក៖ ${task.assignedTeacherName || 'គ្រូបង្រៀន'}\n📚 ថ្នាក់៖ ${task.gradeSection || 'ទូទៅ'}`,
    colorId: task.priority === 'urgent' ? '11' : task.priority === 'high' ? '6' : '7',
    start: {
      date: task.date,
      timeZone: 'Asia/Phnom_Penh'
    },
    end: {
      date: endFormatted,
      timeZone: 'Asia/Phnom_Penh'
    }
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
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការ sync ភារកិច្ចទៅ Google Calendar');
  }

  const data = await response.json();
  return {
    success: true,
    eventId: data.id,
    htmlLink: data.htmlLink
  };
};
