import QRCode from 'qrcode';
import { Student, Teacher, AppUser, UserRole } from '../types';

export interface QRLoginPayload {
  version: '1.0' | '2.0';
  type: 'smart_qr_login';
  role: UserRole;
  code: string; // student.code or staffCode
  id: string; // student.id or teacher.id or user.id
  nameKhmer?: string;
  nameLatin?: string;
  grade?: number;
  section?: string;
  schoolCode?: string;
  issuedAt?: string;
  durableQrKey: string; // Fixed durable key decoupled from password
}

/**
 * Generate a deterministic durable QR key for student or staff.
 * This key is permanent and does NOT change when the password is changed.
 */
export function generateDurableQrKey(id: string, code: string, schoolCode: string = '020401015'): string {
  const seed = `${schoolCode}_${code}_${id}_DURABLE_MOEYS_QR`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `QRAUTH_${Math.abs(hash).toString(36).toUpperCase()}_${code.replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Get the current base URL for generating scannable QR URLs.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    return `${window.location.origin}${window.location.pathname || ''}`;
  }
  return 'https://ais-dev-cdklwpjzizlxa3q3oyplhh-314724079068.asia-east1.run.app';
}

/**
 * Build a full web app URL encoded with Smart QR Login payload.
 * When scanned by phone camera, this opens the browser and triggers auto-login.
 */
export function buildStudentQRLoginUrl(student: Student, schoolCode: string = '020401015'): string {
  const payload: QRLoginPayload = {
    version: '2.0',
    type: 'smart_qr_login',
    role: 'student',
    code: student.code,
    id: student.id,
    nameKhmer: student.nameKhmer,
    nameLatin: student.nameLatin,
    grade: student.grade,
    section: student.section,
    schoolCode,
    issuedAt: new Date().toISOString().split('T')[0],
    durableQrKey: generateDurableQrKey(student.id, student.code, schoolCode)
  };

  const jsonStr = JSON.stringify(payload);
  // Safe Unicode base64 encode
  const b64 = btoa(encodeURIComponent(jsonStr));
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}?qr_auth=${encodeURIComponent(b64)}&role=student&code=${encodeURIComponent(student.code)}`;
}

/**
 * Build a full web app URL encoded with Smart QR Login payload for teachers and staff.
 */
export function buildStaffQRLoginUrl(teacher: Teacher, schoolCode: string = '020401015'): string {
  const staffRole: UserRole =
    teacher.role === 'នាយកសាលា' || teacher.role === 'នាយករង'
      ? 'director'
      : teacher.role === 'លេខាធិការ'
      ? 'secretary'
      : teacher.role === 'បណ្ណារក្ស'
      ? 'librarian'
      : 'teacher';

  const staffCode = teacher.staffCode || `STAFF-${teacher.id}`;
  const payload: QRLoginPayload = {
    version: '2.0',
    type: 'smart_qr_login',
    role: staffRole,
    code: staffCode,
    id: teacher.id,
    nameKhmer: teacher.nameKhmer,
    nameLatin: teacher.nameLatin,
    grade: teacher.assignedGrade,
    section: teacher.assignedSection,
    schoolCode,
    issuedAt: new Date().toISOString().split('T')[0],
    durableQrKey: generateDurableQrKey(teacher.id, staffCode, schoolCode)
  };

  const jsonStr = JSON.stringify(payload);
  const b64 = btoa(encodeURIComponent(jsonStr));
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}?qr_auth=${encodeURIComponent(b64)}&role=${staffRole}&code=${encodeURIComponent(staffCode)}`;
}

/**
 * Parse any raw QR scan result (URL string, JSON string, or plain code) into a QRLoginPayload.
 */
export function parseQRScanData(rawInput: string): QRLoginPayload | null {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const input = rawInput.trim();

  // Case 1: Full URL with query params
  try {
    if (input.startsWith('http://') || input.startsWith('https://') || input.includes('?qr_auth=') || input.includes('&qr_auth=')) {
      const url = new URL(input.startsWith('http') ? input : `https://dummy.local/${input}`);
      const qrAuthParam = url.searchParams.get('qr_auth');
      if (qrAuthParam) {
        try {
          const decodedJson = decodeURIComponent(atob(qrAuthParam));
          const parsed = JSON.parse(decodedJson) as QRLoginPayload;
          if (parsed && (parsed.type === 'smart_qr_login' || parsed.code || parsed.id)) {
            return parsed;
          }
        } catch (e) {
          console.warn('Failed to parse base64 qr_auth param:', e);
        }
      }

      // Fallback query parameters: ?qr_login=1&role=...&code=...
      const roleParam = (url.searchParams.get('role') || 'student') as UserRole;
      const codeParam = url.searchParams.get('code') || url.searchParams.get('studentCode') || url.searchParams.get('staffCode');
      const idParam = url.searchParams.get('id') || url.searchParams.get('studentId') || url.searchParams.get('teacherId');
      if (codeParam || idParam) {
        return {
          version: '2.0',
          type: 'smart_qr_login',
          role: roleParam,
          code: codeParam || idParam || '',
          id: idParam || codeParam || '',
          durableQrKey: generateDurableQrKey(idParam || '', codeParam || '')
        };
      }
    }
  } catch (err) {
    // Continue to next parsers
  }

  // Case 2: JSON payload
  if (input.startsWith('{') && input.endsWith('}')) {
    try {
      const obj = JSON.parse(input);
      if (obj.type === 'smart_qr_login' || obj.code || obj.id || obj.studentCode || obj.staffCode) {
        return {
          version: obj.version || '2.0',
          type: 'smart_qr_login',
          role: obj.role || (obj.staffCode ? 'teacher' : 'student'),
          code: obj.code || obj.studentCode || obj.staffCode || obj.id,
          id: obj.id || obj.studentId || obj.teacherId || obj.code,
          nameKhmer: obj.nameKhmer || obj.name,
          nameLatin: obj.nameLatin,
          grade: obj.grade ? parseInt(obj.grade, 10) : undefined,
          section: obj.section,
          schoolCode: obj.schoolCode,
          durableQrKey: obj.durableQrKey || generateDurableQrKey(obj.id || '', obj.code || '')
        };
      }
    } catch (e) {
      // Continue
    }
  }

  // Case 3: Plain text code (e.g. "020401015-001" or "MOEYS-10001" or "STU-001")
  const cleanCode = input.replace(/['"]/g, '').trim();
  if (cleanCode.length >= 3) {
    const isTeacherCode = cleanCode.toUpperCase().startsWith('MOEYS') || cleanCode.toUpperCase().startsWith('STAFF') || cleanCode.toUpperCase().startsWith('T-');
    return {
      version: '2.0',
      type: 'smart_qr_login',
      role: isTeacherCode ? 'teacher' : 'student',
      code: cleanCode,
      id: cleanCode,
      durableQrKey: generateDurableQrKey(cleanCode, cleanCode)
    };
  }

  return null;
}

/**
 * Generate a High-Resolution PNG Data URL for any QR string.
 */
export async function generateQRCodeDataUrl(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width || 256,
      margin: options?.margin !== undefined ? options.margin : 1,
      color: {
        dark: options?.color?.dark || '#0f172a',
        light: options?.color?.light || '#ffffff'
      },
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
    });
  } catch (err) {
    console.error('Error generating QR Code Data URL:', err);
    return '';
  }
}
