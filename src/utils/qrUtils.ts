import QRCode from 'qrcode';
import { Student } from '../types';

/**
 * Constructs the direct web link for a student profile lookup
 */
export const getStudentLookupUrl = (student: Student): string => {
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' && window.location?.pathname ? window.location.pathname : '';
  
  // Format: URL with query parameters that deep-links to this student
  return `${origin}${pathname}?studentId=${encodeURIComponent(student.id)}&studentCode=${encodeURIComponent(student.code)}`;
};

/**
 * Constructs structured JSON or rich text payload for student QR code
 */
export const getStudentQRPayload = (student: Student): string => {
  // We use the direct web URL as the primary payload so any camera phone scanning it
  // opens the web app directly to their profile.
  return getStudentLookupUrl(student);
};

/**
 * Generates a high-quality Data URL (PNG) for the student's QR code
 */
export const generateStudentQRDataUrl = async (
  student: Student,
  options: {
    width?: number;
    margin?: number;
    color?: { dark: string; light: string };
  } = {}
): Promise<string> => {
  const payload = getStudentQRPayload(student);
  
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      width: options.width || 320,
      margin: options.margin !== undefined ? options.margin : 2,
      errorCorrectionLevel: 'H', // High error tolerance
      color: {
        dark: options.color?.dark || '#0f172a', // Slate 900
        light: options.color?.light || '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Data URL:', err);
    throw err;
  }
};

/**
 * Generates an SVG string for the student's QR code
 */
export const generateStudentQRSvg = async (
  student: Student,
  options: {
    width?: number;
    margin?: number;
    color?: { dark: string; light: string };
  } = {}
): Promise<string> => {
  const payload = getStudentQRPayload(student);
  
  try {
    const svgString = await QRCode.toString(payload, {
      type: 'svg',
      width: options.width || 256,
      margin: options.margin !== undefined ? options.margin : 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: options.color?.dark || '#0f172a',
        light: options.color?.light || '#ffffff',
      },
    });
    return svgString;
  } catch (err) {
    console.error('Failed to generate QR SVG:', err);
    throw err;
  }
};

/**
 * Downloads a generated QR code image file (PNG)
 */
export const downloadStudentQRImage = (
  student: Student,
  dataUrl: string,
  schoolName = 'សាលាបឋមសិក្សា'
) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `QR_${student.code}_${student.nameKhmer.replace(/\s+/g, '_')}_${schoolName.replace(/\s+/g, '_')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Parses scanned QR text and attempts to match with a student in the directory
 */
export const parseStudentQRData = (
  scannedText: string,
  students: Student[]
): {
  student: Student | null;
  matchedBy: 'id' | 'code' | 'url' | 'json' | 'name' | 'none';
  extractedCode?: string;
  extractedId?: string;
} => {
  if (!scannedText || typeof scannedText !== 'string') {
    return { student: null, matchedBy: 'none' };
  }

  const trimmed = scannedText.trim();

  // 1. Check if it's a URL with query params
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('?')) {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://dummy.org/${trimmed}`);
      const studentId = url.searchParams.get('studentId') || url.searchParams.get('id');
      const studentCode = url.searchParams.get('studentCode') || url.searchParams.get('code');

      if (studentId) {
        const found = students.find(s => s.id.toLowerCase() === studentId.toLowerCase());
        if (found) return { student: found, matchedBy: 'url', extractedId: studentId };
      }
      if (studentCode) {
        const found = students.find(s => s.code.toLowerCase() === studentCode.toLowerCase());
        if (found) return { student: found, matchedBy: 'url', extractedCode: studentCode };
      }
    }
  } catch {
    // Ignore URL parse errors
  }

  // 2. Check if it's a JSON payload
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.id) {
        const found = students.find(s => s.id.toLowerCase() === String(parsed.id).toLowerCase());
        if (found) return { student: found, matchedBy: 'json', extractedId: parsed.id };
      }
      if (parsed.code) {
        const found = students.find(s => s.code.toLowerCase() === String(parsed.code).toLowerCase());
        if (found) return { student: found, matchedBy: 'json', extractedCode: parsed.code };
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  // 3. Match by direct Student Code (exact or case-insensitive)
  const byCode = students.find(
    s => s.code.toLowerCase() === trimmed.toLowerCase() ||
         trimmed.toLowerCase().includes(s.code.toLowerCase())
  );
  if (byCode) {
    return { student: byCode, matchedBy: 'code', extractedCode: byCode.code };
  }

  // 4. Match by direct Student ID
  const byId = students.find(
    s => s.id.toLowerCase() === trimmed.toLowerCase() ||
         trimmed.toLowerCase().includes(s.id.toLowerCase())
  );
  if (byId) {
    return { student: byId, matchedBy: 'id', extractedId: byId.id };
  }

  // 5. Match by Student Khmer Name or Latin Name
  const byName = students.find(
    s => s.nameKhmer.trim() === trimmed ||
         s.nameLatin.toLowerCase().trim() === trimmed.toLowerCase()
  );
  if (byName) {
    return { student: byName, matchedBy: 'name' };
  }

  return { student: null, matchedBy: 'none' };
};
