import { getAccessToken } from './googleAuth';

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  subject: string;
  from: string;
  to: string;
  date: string;
  timestamp: number;
  bodyHtml?: string;
  bodyText?: string;
  isUnread: boolean;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  bodyHtml: string;
  cc?: string;
  bcc?: string;
  senderName?: string;
  inReplyTo?: string;
  references?: string;
}

// Convert unicode string to URL-safe Base64
function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Decode URL-safe Base64 to unicode string
function decodeBase64Url(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('Failed to decode base64url message payload:', e);
    return '';
  }
}

// Format RFC 2822 email message with proper UTF-8 encoded Subject
function createEmailRaw(payload: SendEmailPayload): string {
  // UTF-8 subject header encoding =?UTF-8?B?...?=
  const utf8Subject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`;
  const fromHeader = payload.senderName
    ? `=?UTF-8?B?${btoa(unescape(encodeURIComponent(payload.senderName)))}?= <me>`
    : 'me';

  const headers = [
    `To: ${payload.to}`,
    `From: ${fromHeader}`,
    payload.cc ? `Cc: ${payload.cc}` : '',
    payload.bcc ? `Bcc: ${payload.bcc}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    payload.inReplyTo ? `In-Reply-To: ${payload.inReplyTo}` : '',
    payload.references ? `References: ${payload.references}` : ''
  ].filter(Boolean).join('\r\n');

  const rawContent = `${headers}\r\n\r\n${payload.bodyHtml}`;
  return encodeBase64Url(rawContent);
}

// Fetch user's Gmail profile
export async function getGmailProfile(): Promise<GmailProfile> {
  const token = await getAccessToken();
  if (!token) throw new Error('ពុំមាន Google Access Token សម្រាប់ Gmail ទេ');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'បរាជ័យក្នុងការទាញយកព័ត៌មាន Gmail Profile');
  }

  return res.json();
}

// Parse email parts to extract HTML/Plain text
function extractBodyFromPayload(payload: any): { html: string; text: string } {
  let html = '';
  let text = '';

  if (!payload) return { html, text };

  if (payload.body && payload.body.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      html = decoded;
    } else {
      text = decoded;
    }
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        html = decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/plain' && part.body?.data) {
        text = decodeBase64Url(part.body.data);
      } else if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (nested.html) html = nested.html;
        if (nested.text && !text) text = nested.text;
      }
    }
  }

  return { html: html || text, text };
}

// Parse single message payload into summary
function parseMessageDetails(msg: any): GmailMessageSummary {
  const headers: GmailMessageHeader[] = msg.payload?.headers || [];
  const getHeader = (name: string) => {
    const h = headers.find(item => item.name.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  const subject = getHeader('Subject') || '(គ្មានចំណងជើង / No Subject)';
  const from = getHeader('From') || '';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || '';
  const timestamp = msg.internalDate ? parseInt(msg.internalDate, 10) : Date.now();
  const labelIds: string[] = msg.labelIds || [];
  const isUnread = labelIds.includes('UNREAD');

  const { html, text } = extractBodyFromPayload(msg.payload);

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet || '',
    labelIds,
    subject,
    from,
    to,
    date,
    timestamp,
    bodyHtml: html,
    bodyText: text,
    isUnread
  };
}

// List Gmail Messages
export async function listGmailMessages(options: {
  query?: string;
  labelIds?: string[];
  maxResults?: number;
  pageToken?: string;
} = {}): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('សូមភ្ជាប់គណនី Google ជាមុនសិន');

  const params = new URLSearchParams();
  if (options.query) params.append('q', options.query);
  if (options.labelIds && options.labelIds.length > 0) {
    options.labelIds.forEach(l => params.append('labelIds', l));
  }
  params.append('maxResults', String(options.maxResults || 20));
  if (options.pageToken) params.append('pageToken', options.pageToken);

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'បរាជ័យក្នុងការទាញយកបញ្ជីសារ Gmail');
  }

  const data = await res.json();
  const rawList = data.messages || [];

  if (rawList.length === 0) {
    return { messages: [], nextPageToken: undefined };
  }

  // Fetch full details for the top items concurrently
  const fetchPromises = rawList.slice(0, 20).map(async (item: { id: string }) => {
    try {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (msgRes.ok) {
        const fullMsg = await msgRes.json();
        return parseMessageDetails(fullMsg);
      }
    } catch (e) {
      console.error('Error fetching message details for', item.id, e);
    }
    return null;
  });

  const detailedMessages = (await Promise.all(fetchPromises)).filter(Boolean) as GmailMessageSummary[];

  return {
    messages: detailedMessages,
    nextPageToken: data.nextPageToken
  };
}

// Get Single Message Details
export async function getGmailMessage(messageId: string): Promise<GmailMessageSummary> {
  const token = await getAccessToken();
  if (!token) throw new Error('សូមភ្ជាប់គណនី Google ជាមុនសិន');

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'បរាជ័យក្នុងការទាញយកព័ត៌មានសារ');
  }

  const data = await res.json();
  return parseMessageDetails(data);
}

// Send Email via Gmail API
export async function sendGmailEmail(payload: SendEmailPayload): Promise<{ id: string; threadId: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('សូមភ្ជាប់គណនី Google ជាមុនសិន');

  if (!payload.to || !payload.to.trim()) {
    throw new Error('សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលអ្នកទទួល (To Email)');
  }
  if (!payload.subject || !payload.subject.trim()) {
    throw new Error('សូមបញ្ចូលចំណងជើងអ៊ីមែល (Subject)');
  }

  const raw = createEmailRaw(payload);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'បរាជ័យក្នុងការផ្ញើសារ Gmail');
  }

  return res.json();
}

// Save Draft Email
export async function createGmailDraft(payload: SendEmailPayload): Promise<{ id: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('សូមភ្ជាប់គណនី Google ជាមុនសិន');

  const raw = createEmailRaw(payload);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: { raw } })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'បរាជ័យក្នុងការរក្សាទុកសារព្រាង (Draft)');
  }

  return res.json();
}

// Delete Message (MANDATORY explicit confirmation must be handled in UI before calling this)
export async function deleteGmailMessage(messageId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('សូមភ្ជាប់គណនី Google ជាមុនសិន');

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'បរាជ័យក្នុងការលុបសារ Gmail');
  }
}

// Mark Message as Read / Unread / Starred
export async function modifyGmailLabels(
  messageId: string,
  addLabelIds: string[] = [],
  removeLabelIds: string[] = []
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('សូមភ្ជាប់គណនី Google ជាមុនសិន');

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ addLabelIds, removeLabelIds })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'បរាជ័យក្នុងការកែប្រែស្លាកសារ (Labels)');
  }
}

// Built-in Official School Email Templates Generator (Khmer/MoEYS Standard)
export function generateSchoolEmailTemplate(options: {
  templateType: 'student_score' | 'parent_meeting' | 'attendance_warning' | 'teacher_announcement';
  schoolName: string;
  studentName?: string;
  grade?: number;
  section?: string;
  month?: string;
  totalScore?: number;
  average?: number;
  rank?: number;
  meetingDate?: string;
  meetingTime?: string;
  meetingLocation?: string;
  announcementTitle?: string;
  announcementContent?: string;
  teacherName?: string;
  contactPhone?: string;
}): { subject: string; bodyHtml: string } {
  const {
    templateType,
    schoolName,
    studentName,
    grade,
    section,
    month,
    totalScore,
    average,
    rank,
    meetingDate,
    meetingTime,
    meetingLocation,
    announcementTitle,
    announcementContent,
    teacherName,
    contactPhone
  } = options;

  if (templateType === 'student_score') {
    const subject = `[${schoolName}] របាយការណ៍លទ្ធផលការសិក្សាប្រចាំខែ ${month} - សិស្ស៖ ${studentName || ''} (ថ្នាក់ទី ${grade}${section})`;
    const bodyHtml = `
      <div style="font-family: 'Khmer OS Battambang', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0 0 6px 0; font-size: 20px;">${schoolName}</h2>
          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: bold;">របាយការណ៍លទ្ធផលការសិក្សា និងពិន្ទុប្រចាំខែ ${month}</p>
        </div>

        <p style="font-size: 14px;"><strong>សូមគោរពជម្រាបជូន លោក/លោកស្រី អាណាព្យាបាលសិស្ស ${studentName}</strong></p>
        <p style="font-size: 13px; color: #334155;">
          សាលារៀនសូមផ្ញើជូននូវលទ្ធផលនៃការសិក្សា និងការវាយតម្លៃលទ្ធផលប្រចាំខែ <strong>${month}</strong> របស់សិស្ស <strong>${studentName}</strong> រៀននៅថ្នាក់ទី <strong>${grade}${section}</strong> ដូចខាងក្រោម៖
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; color: #64748b;">ឈ្មោះសិស្ស៖</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">${studentName || '-'}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; color: #64748b;">កម្រិតថ្នាក់៖</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">ថ្នាក់ទី ${grade}${section}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; color: #64748b;">ពិន្ទុសរុប៖</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2563eb; font-size: 15px;">${totalScore !== undefined ? totalScore : '-'}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; color: #64748b;">មធ្យមភាគ៖</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #059669; font-size: 15px;">${average !== undefined ? average.toFixed(2) : '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">ចំណាត់ថ្នាក់ក្នុងថ្នាក់៖</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #d97706; font-size: 16px;">លេខ ${rank !== undefined ? rank : '-'}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #334155;">
          សូមលោក/លោកស្រី បន្តលើកទឹកចិត្ត និងតាមដានការរៀនសូត្ររបស់កូននៅផ្ទះបន្ថែមទៀត។ ប្រសិនបើមានចម្ងល់ ឬសំណូមពរ សូមទាក់ទងមកកាន់គ្រូបន្ទុកថ្នាក់ដោយក្ដីរីករាយ។
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 2px 0;"><strong>គ្រូបន្ទុកថ្នាក់៖</strong> ${teacherName || 'លោកគ្រូ/អ្នកគ្រូ'}</p>
          <p style="margin: 2px 0;"><strong>លេខទូរស័ព្ទទំនាក់ទំនង៖</strong> ${contactPhone || '(ទំនាក់ទំនងសាលា)'}</p>
          <p style="margin: 2px 0;"><strong>ស្ថាប័ន៖</strong> ${schoolName}</p>
        </div>
      </div>
    `;
    return { subject, bodyHtml };
  }

  if (templateType === 'parent_meeting') {
    const subject = `[${schoolName}] លិខិតអញ្ជើញចូលរួមកិច្ចប្រជុំអាណាព្យាបាលសិស្សថ្នាក់ទី ${grade}${section}`;
    const bodyHtml = `
      <div style="font-family: 'Khmer OS Battambang', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0 0 6px 0; font-size: 20px;">${schoolName}</h2>
          <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: bold;">លិខិតអញ្ជើញចូលរួមកិច្ចប្រជុំអាណាព្យាបាលសិស្ស</p>
        </div>

        <p style="font-size: 14px;"><strong>សូមគោរពអញ្ជើញ លោក/លោកស្រី អាណាព្យាបាលសិស្ស ${studentName ? `«${studentName}»` : `ថ្នាក់ទី ${grade}${section}`}</strong></p>
        <p style="font-size: 13px; color: #334155;">
          គណៈគ្រប់គ្រងសាលា និងលោកគ្រូអ្នកគ្រូបន្ទុកថ្នាក់ មានកិត្តិយសសូមគោរពអញ្ជើញលោក/លោកស្រី ចូលរួមកិច្ចប្រជុំអាណាព្យាបាលសិស្ស ដើម្បីពិភាក្សាអំពីវឌ្ឍនភាពនៃការសិក្សា វិន័យ សីលធម៌ និងការចូលរួមលើកកម្ពស់គុណភាពអប់រំរបស់សិស្សានុសិស្ស។
        </p>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">📅 កាលវិភាគ និងទីកន្លែងកិច្ចប្រជុំ៖</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e3a8a;">
            <li style="margin-bottom: 6px;"><strong>កាលបរិច្ឆេទ៖</strong> ${meetingDate || 'ថ្ងៃសៅរ៍ ចុងសប្តាហ៍នេះ'}</li>
            <li style="margin-bottom: 6px;"><strong>ពេលវេលា៖</strong> ${meetingTime || 'វេលាម៉ោង ០៨:០០ ព្រឹក'}</li>
            <li style="margin-bottom: 6px;"><strong>ទីកន្លែង៖</strong> ${meetingLocation || `បន្ទប់រៀនទី ${grade}${section}`} (${schoolName})</li>
          </ul>
        </div>

        <p style="font-size: 13px; color: #334155;">
          វត្តមានដ៏ខ្ពង់ខ្ពស់របស់លោក/លោកស្រី គឺជាការរួមចំណែកដ៏មានតម្លៃសម្រាប់អនាគត និងភាពជោគជ័យនៃការសិក្សារបស់កូនៗ។
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 2px 0;"><strong>ទំនាក់ទំនង៖</strong> ${contactPhone || '(លេខទូរស័ព្ទសាលា)'}</p>
          <p style="margin: 2px 0;"><strong>ដោយក្ដីគោរពរាប់អានពី៖</strong> គណៈគ្រប់គ្រង ${schoolName}</p>
        </div>
      </div>
    `;
    return { subject, bodyHtml };
  }

  if (templateType === 'attendance_warning') {
    const subject = `[${schoolName}] សេចក្ដីជូនដំណឹងអំពីអវត្តមានរបស់សិស្ស ${studentName || ''} (ថ្នាក់ទី ${grade}${section})`;
    const bodyHtml = `
      <div style="font-family: 'Khmer OS Battambang', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #fecdd3; border-radius: 16px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #e11d48; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #9f1239; margin: 0 0 6px 0; font-size: 20px;">${schoolName}</h2>
          <p style="margin: 0; color: #be123c; font-size: 13px; font-weight: bold;">សេចក្ដីជូនដំណឹងអំពីវត្តមានសិស្ស</p>
        </div>

        <p style="font-size: 14px;"><strong>សូមគោរពជម្រាបជូន លោក/លោកស្រី អាណាព្យាបាលសិស្ស ${studentName}</strong></p>
        <p style="font-size: 13px; color: #334155;">
          សាលារៀនសូមជម្រាបជូនថាសិស្ស <strong>${studentName}</strong> រៀននៅថ្នាក់ទី <strong>${grade}${section}</strong> បានអវត្តមានពីការសិក្សាដោយពុំមានច្បាប់អនុញ្ញាតត្រឹមត្រូវ។
        </p>

        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #9f1239; font-weight: 500;">
            ⚠️ ការអវត្តមានញឹកញាប់អាចប៉ះពាល់ដល់លទ្ធផលសិក្សា និងការយល់ដឹងមេរៀនរបស់សិស្ស។
          </p>
        </div>

        <p style="font-size: 13px; color: #334155;">
          សូមលោក/លោកស្រី មេត្តាទំនាក់ទំនងមកកាន់គ្រូបន្ទុកថ្នាក់ ឬការិយាល័យរដ្ឋបាលសាលា ដើម្បីបញ្ជាក់ពីមូលហេតុនៃការអវត្តមានរបស់កូន។
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 2px 0;"><strong>គ្រូបន្ទុកថ្នាក់៖</strong> ${teacherName || 'លោកគ្រូ/អ្នកគ្រូ'}</p>
          <p style="margin: 2px 0;"><strong>លេខទូរស័ព្ទ៖</strong> ${contactPhone || '(ទំនាក់ទំនងសាលា)'}</p>
        </div>
      </div>
    `;
    return { subject, bodyHtml };
  }

  // Teacher / Staff Announcement
  const subject = `[${schoolName}] សេចក្ដីជូនដំណឹងផ្ទៃក្នុង៖ ${announcementTitle || 'សេចក្តីជូនដំណឹងថ្មី'}`;
  const bodyHtml = `
    <div style="font-family: 'Khmer OS Battambang', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0369a1; margin: 0 0 6px 0; font-size: 20px;">${schoolName}</h2>
        <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: bold;">សេចក្ដីជូនដំណឹងផ្ទៃក្នុងសម្រាប់លោកគ្រូ អ្នកគ្រូ និងបុគ្គលិក</p>
      </div>

      <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 12px 0;">${announcementTitle || 'សេចក្ដីជូនដំណឹង'}</h3>
      <div style="font-size: 13px; color: #334155; line-height: 1.7; white-space: pre-wrap;">
        ${announcementContent || 'សូមលោកគ្រូ អ្នកគ្រូទាំងអស់ពិនិត្យព័ត៌មានលម្អិត...'}
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <p style="margin: 2px 0;"><strong>នាយិកាសាលា / គណៈគ្រប់គ្រង</strong></p>
        <p style="margin: 2px 0;">${schoolName}</p>
      </div>
    </div>
  `;
  return { subject, bodyHtml };
}
