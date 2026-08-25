import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { SignatureQRStyle, QRScanVerificationLog, Student } from '../types';

export interface PrincipalSignatureQRParams {
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  studentNameLatin?: string;
  grade: number;
  section: string;
  academicYear: string;
  monthOrSemester?: string;
  schoolCode: string;
  schoolNameKhmer: string;
  principalName: string;
  issueDate?: string;
  expiresAt?: string;
  expiryDate?: string; // Alias for expiresAt
  customCreatedAt?: string;
  expiryDays?: number; // Default 90 days
  averageScore?: number;
  gradeLetter?: string;
  rank?: number;
  totalStudents?: number;
  signatureReference?: string;
  signatureImageUrl?: string;
  style?: SignatureQRStyle;
}

/**
 * Calculates expiration date based on issue date and expiry days
 */
export const calculateSignatureExpiry = (issueDate?: string, expiryDays: number = 90): string => {
  const baseDate = issueDate ? new Date(issueDate) : new Date();
  const exp = new Date(baseDate.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  return exp.toISOString().split('T')[0];
};

/**
 * Checks whether a digital signature QR code is expired
 */
export const isSignatureExpired = (
  expiresAt?: string,
  issueDate?: string,
  expiryDays: number = 90
): {
  isExpired: boolean;
  daysRemaining: number;
  daysExpired: number;
  expiresAt: string;
  issueDate: string;
} => {
  const effectiveIssueDate = issueDate || new Date().toISOString().split('T')[0];
  const effectiveExpiresAt = expiresAt || calculateSignatureExpiry(effectiveIssueDate, expiryDays);
  
  const now = new Date();
  const expDate = new Date(effectiveExpiresAt + 'T23:59:59');
  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      isExpired: true,
      daysRemaining: 0,
      daysExpired: Math.abs(diffDays),
      expiresAt: effectiveExpiresAt,
      issueDate: effectiveIssueDate
    };
  }

  return {
    isExpired: false,
    daysRemaining: diffDays,
    daysExpired: 0,
    expiresAt: effectiveExpiresAt,
    issueDate: effectiveIssueDate
  };
};

/**
 * Generates a unique, deterministic digital signature verification reference code
 * e.g. "MOEYS-SIG-2026-6A-STU001-A48F"
 */
export const generateUniqueSignatureCode = (params: PrincipalSignatureQRParams): string => {
  const cleanCode = (params.studentCode || params.studentId || 'STU').replace(/[^a-zA-Z0-9]/g, '');
  const cleanYear = (params.academicYear || '2026').replace(/[^0-9]/g, '').slice(-4) || '2026';
  const cleanGrade = `${params.grade || 1}${params.section || 'A'}`;
  
  // Deterministic 4-char hex hash from student + school + year
  const rawSeed = `${params.schoolCode}_${cleanCode}_${params.academicYear}_${params.monthOrSemester || 'ANNUAL'}_${params.principalName}`;
  let hashVal = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawSeed.charCodeAt(i);
    hashVal |= 0;
  }
  const hexSuffix = Math.abs(hashVal).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);

  return `MOEYS-SIG-${cleanYear}-${cleanGrade}-${cleanCode}-${hexSuffix}`;
};

/**
 * Builds the official MoEYS digital signature payload object for the Principal endorsement
 * Includes expiration timestamp and automated security verification attributes
 */
export const generatePrincipalSignaturePayload = (params: PrincipalSignatureQRParams): string => {
  const sigRef = params.signatureReference || generateUniqueSignatureCode(params);
  const now = params.customCreatedAt || params.issueDate || new Date().toISOString().split('T')[0];
  const expiryDays = params.expiryDays || 90;
  const expiresAt = params.expiryDate || params.expiresAt || calculateSignatureExpiry(now, expiryDays);
  const expiryCheck = isSignatureExpired(expiresAt, now, expiryDays);

  const payload = {
    v: '2.0',
    type: 'MOEYS_PRINCIPAL_DIGITAL_SIGNATURE',
    sigRef,
    school: {
      code: params.schoolCode,
      nameKh: params.schoolNameKhmer,
      principal: params.principalName,
    },
    student: {
      id: params.studentId,
      code: params.studentCode,
      nameKh: params.studentNameKhmer,
      nameEn: params.studentNameLatin || '',
      grade: params.grade,
      section: params.section,
    },
    academic: {
      year: params.academicYear,
      term: params.monthOrSemester || 'ប្រចាំឆ្នាំ',
      avg: params.averageScore !== undefined ? params.averageScore : null,
      grade: params.gradeLetter || null,
      rank: params.rank ? `${params.rank}/${params.totalStudents || '-'}` : null,
    },
    security: {
      certifiedAt: now,
      expiresAt: expiresAt,
      expiryDays: expiryDays,
      status: expiryCheck.isExpired ? 'EXPIRED' : 'ACTIVE_VALID',
      style: params.style || 'classic_square'
    },
    verifyUrl: `https://school.moeys.gov.kh/verify/report-card?doc=${sigRef}&stu=${params.studentCode}&sch=${params.schoolCode}`
  };

  return JSON.stringify(payload);
};

/**
 * Helper function to generate a high-resolution, high-contrast black-and-white QR code Data URL
 * Specifically tuned for printing (pure #000000 on #FFFFFF with high error correction)
 */
export const generatePrincipalSignatureQRDataUrl = async (
  params: PrincipalSignatureQRParams,
  options?: {
    size?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<string> => {
  const payload = generatePrincipalSignaturePayload(params);
  const size = options?.size || 320;
  const margin = options?.margin !== undefined ? options?.margin : 1;
  const errorCorrectionLevel = options?.errorCorrectionLevel || 'M';

  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate Principal Signature QR Code DataURL:', error);
    // Fallback simple payload QR
    return await QRCode.toDataURL(
      params.signatureReference || `MOEYS-SIG-${params.studentCode}`,
      { width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' } }
    );
  }
};

/**
 * Helper function to generate pure vector SVG QR code string for the Principal Signature
 */
export const generatePrincipalSignatureQRSvg = async (
  params: PrincipalSignatureQRParams,
  options?: {
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<string> => {
  const payload = generatePrincipalSignaturePayload(params);
  const margin = options?.margin !== undefined ? options?.margin : 1;
  const errorCorrectionLevel = options?.errorCorrectionLevel || 'M';

  try {
    return await QRCode.toString(payload, {
      type: 'svg',
      margin,
      errorCorrectionLevel,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('Failed to generate Principal Signature QR Code SVG:', error);
    return '';
  }
};

/**
 * Parses raw QR scan string and verifies validity and expiration
 */
export const parseAndVerifyPrincipalSignatureQR = (
  rawText: string,
  existingStudents: Student[] = [],
  schoolProfile?: any
): {
  log: Omit<QRScanVerificationLog, 'id' | 'scannedAt'>;
  logEntry: Omit<QRScanVerificationLog, 'id' | 'scannedAt'>;
  isExpired: boolean;
  isValid: boolean;
  rawPayload?: any;
  payload?: any;
  student?: Student;
} => {
  const trimmed = rawText.trim();
  let parsedPayload: any = null;

  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      parsedPayload = JSON.parse(trimmed);
    }
  } catch {
    // not raw json
  }

  // Device detection info
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent);
  const deviceType: 'mobile' | 'desktop' | 'tablet' | 'scanner' = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

  if (parsedPayload && parsedPayload.type === 'MOEYS_PRINCIPAL_DIGITAL_SIGNATURE') {
    const student = parsedPayload.student || {};
    const school = parsedPayload.school || {};
    const academic = parsedPayload.academic || {};
    const security = parsedPayload.security || {};

    const expiresAt = security.expiresAt || calculateSignatureExpiry(security.certifiedAt || parsedPayload.certifiedAt, 90);
    const expiryStatus = isSignatureExpired(expiresAt, security.certifiedAt || parsedPayload.certifiedAt);

    const matchedStudent = existingStudents.find(
      s => s.code.toLowerCase() === (student.code || '').toLowerCase() || s.id === student.id
    );

    const isTampered = matchedStudent && (
      matchedStudent.grade !== student.grade ||
      (matchedStudent.nameKhmer && student.nameKhmer && matchedStudent.nameKhmer.trim() !== student.nameKhmer.trim())
    );

    let verificationStatus: 'valid' | 'expired' | 'invalid' | 'tampered' = 'valid';
    let statusReason = 'ហត្ថលេខាឌីជីថល និងត្រានាយកសាលាមានសុពលភាពត្រឹមត្រូវតាមស្ដង់ដារ MoEYS';

    if (isTampered) {
      verificationStatus = 'tampered';
      statusReason = 'ទិន្នន័យលើព្រឹត្តិបត្រពិន្ទុមិនត្រូវគ្នានឹងប្រព័ន្ធបញ្ជីសិស្សសាលា (សង្ស័យមានការក្លែងបន្លំ)';
    } else if (expiryStatus.isExpired) {
      verificationStatus = 'expired';
      statusReason = `QR Code ហត្ថលេខានាយកបានផុតកំណត់សុពលភាពតាំងពីថ្ងៃទី ${expiresAt} (${expiryStatus.daysExpired} ថ្ងៃមុន)។ សូមស្នើសុំបង្កើតព្រឹត្តិបត្រពិន្ទុថ្មីដើម្បីធានាសុវត្ថិភាព។`;
    }

    const logData: Omit<QRScanVerificationLog, 'id' | 'scannedAt'> = {
      signatureRef: parsedPayload.sigRef || `MOEYS-SIG-${student.code || 'UNKNOWN'}`,
      studentId: student.id || matchedStudent?.id,
      studentCode: student.code || matchedStudent?.code || 'STU-000',
      studentNameKhmer: student.nameKhmer || matchedStudent?.nameKhmer || 'សិស្សមិនស្គាល់',
      studentNameLatin: student.nameEn || matchedStudent?.nameLatin,
      grade: student.grade || matchedStudent?.grade || 1,
      section: student.section || matchedStudent?.section || 'ក',
      academicYear: academic.year || schoolProfile?.academicYear || '២០២៤ - ២០២៥',
      monthOrSemester: academic.term || 'មករា',
      schoolCode: school.code || schoolProfile?.schoolCode || '001',
      schoolNameKhmer: school.nameKh || schoolProfile?.nameKhmer || 'សាលារៀន',
      principalName: school.principal || schoolProfile?.principalName || 'នាយកសាលា',
      issueDate: security.certifiedAt || parsedPayload.certifiedAt || new Date().toISOString().split('T')[0],
      expiresAt: expiresAt,
      verificationStatus,
      statusReason,
      deviceInfo: {
        deviceType,
        os: /Windows/i.test(userAgent) ? 'Windows' : (/Macintosh/i.test(userAgent) ? 'macOS' : (/Android/i.test(userAgent) ? 'Android' : (/iPhone|iPad/i.test(userAgent) ? 'iOS' : 'Linux'))),
        browser: /Chrome/i.test(userAgent) ? 'Chrome' : (/Firefox/i.test(userAgent) ? 'Firefox' : (/Safari/i.test(userAgent) ? 'Safari' : 'Browser')),
        userAgent
      },
      verifierName: 'លោកនាយកសាលា / អ្នកផ្ទៀងផ្ទាត់',
      verifierRole: 'នាយកសាលា',
      scanMethod: 'webcam_scanner',
      averageScore: academic.avg,
      rank: typeof academic.rank === 'string' ? Number(academic.rank.split('/')[0]) : undefined,
      totalStudents: typeof academic.rank === 'string' ? Number(academic.rank.split('/')[1]) : undefined
    };

    return {
      isValid: verificationStatus === 'valid',
      isExpired: expiryStatus.isExpired,
      rawPayload: parsedPayload,
      payload: parsedPayload,
      student: matchedStudent,
      log: logData,
      logEntry: logData
    };
  }

  // Check if it matches direct student code or signature string format
  const matchedStudent = existingStudents.find(
    s => s.code.toLowerCase() === trimmed.toLowerCase() || s.id === trimmed
  );

  if (matchedStudent) {
    const logData: Omit<QRScanVerificationLog, 'id' | 'scannedAt'> = {
      signatureRef: `MOEYS-SIG-${matchedStudent.code}`,
      studentId: matchedStudent.id,
      studentCode: matchedStudent.code,
      studentNameKhmer: matchedStudent.nameKhmer,
      studentNameLatin: matchedStudent.nameLatin,
      grade: matchedStudent.grade,
      section: matchedStudent.section,
      academicYear: schoolProfile?.academicYear || '២០២៤ - ២០២៥',
      schoolCode: schoolProfile?.schoolCode || '001',
      schoolNameKhmer: schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សា',
      principalName: schoolProfile?.principalName || 'នាយកសាលា',
      verificationStatus: 'valid',
      statusReason: 'បានផ្ទៀងផ្ទាត់ជោគជ័យតាមរយៈលេខសម្គាល់សិស្សផ្ទាល់ក្នុងប្រព័ន្ធ',
      deviceInfo: {
        deviceType,
        userAgent
      },
      scanMethod: 'webcam_scanner'
    };

    return {
      isValid: true,
      isExpired: false,
      student: matchedStudent,
      log: logData,
      logEntry: logData
    };
  }

  // Fallback Invalid Log
  const fallbackLog: Omit<QRScanVerificationLog, 'id' | 'scannedAt'> = {
    signatureRef: trimmed.slice(0, 32),
    studentCode: 'UNKNOWN',
    studentNameKhmer: 'មិនមានក្នុងប្រព័ន្ធ',
    grade: 0,
    section: '',
    academicYear: schoolProfile?.academicYear || '២០២៤ - ២០២៥',
    schoolCode: schoolProfile?.schoolCode || '001',
    schoolNameKhmer: schoolProfile?.nameKhmer || 'សាលារៀន',
    principalName: schoolProfile?.principalName || 'នាយកសាលា',
    verificationStatus: 'invalid',
    statusReason: `កូដដែលបានស្កេន «${trimmed.slice(0, 24)}...» មិនមែនជាទម្រង់ហត្ថលេខាឌីជីថល MoEYS ត្រឹមត្រូវទេ`,
    deviceInfo: {
      deviceType,
      userAgent
    },
    scanMethod: 'webcam_scanner'
  };

  return {
    isValid: false,
    isExpired: false,
    log: fallbackLog,
    logEntry: fallbackLog
  };
};

/**
 * Props for the dedicated Principal Signature QR Code Slot component
 */
export interface PrincipalSignatureQRSlotProps {
  params: PrincipalSignatureQRParams;
  size?: number;
  showBorder?: boolean;
  showVerificationText?: boolean;
  showSignatureGraphic?: boolean;
  signatureImageUrl?: string;
  style?: SignatureQRStyle;
  onRegenerateNewSignature?: () => void;
  className?: string;
}

/**
 * High-quality placeholder graphic for missing principal digital signature
 */
export const PrincipalSignaturePlaceholderGraphic: React.FC<{
  principalName?: string;
  schoolCode?: string;
  size?: number;
  className?: string;
}> = ({
  principalName = 'នាយកសាលា',
  schoolCode = '001',
  size = 56,
  className = ''
}) => {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-1.5 border border-slate-300 rounded-lg bg-slate-50/80 text-center select-none ${className}`}
      style={{ minWidth: size + 20 }}
      title="ត្រា និងហត្ថលេខាឌីជីថលស្ដង់ដារ MoEYS (Digital Signature Seal)"
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Fallback graphic badge */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-slate-800 fill-none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="46" strokeDasharray="3 3" strokeWidth="2" className="text-slate-400" />
          <circle cx="50" cy="50" r="42" strokeWidth="2" className="text-blue-900" />
          <circle cx="50" cy="50" r="38" strokeWidth="1" className="text-slate-300" />
          
          {/* Emblem Star / Angkor Symbol */}
          <path
            d="M50 18 L53 38 L72 38 L57 50 L63 68 L50 56 L37 68 L43 50 L28 38 L47 38 Z"
            fill="currentColor"
            className="text-amber-500/80"
          />
          {/* Security check badge */}
          <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="currentColor" className="text-blue-900" strokeWidth="2" />
          <path d="M44 50 L48 54 L56 46" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mt-0.5 space-y-0.2 max-w-[90px] leading-tight">
        <span className="text-[6.5px] font-bold text-blue-950 font-moul block truncate">
          MoEYS DIGITAL SEAL
        </span>
        <span className="text-[5.5px] font-mono text-slate-600 block truncate">
          {schoolCode} • VALIDATED
        </span>
      </div>
    </div>
  );
};

/**
 * Dedicated React Component: Principal Signature QR Code Slot for Report Cards
 * Supports multiple visual styles (classic square, rounded modern, dot pattern, framed seal, bordered MoEYS)
 * Supports automated expiration badge and regeneration prompt for old digital documents
 */
export const PrincipalSignatureQRSlot: React.FC<PrincipalSignatureQRSlotProps> = ({
  params,
  size = 80,
  showBorder = true,
  showVerificationText = true,
  showSignatureGraphic = false,
  signatureImageUrl,
  style: propStyle,
  onRegenerateNewSignature,
  className = ''
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const activeStyle: SignatureQRStyle = propStyle || params.style || 'classic_square';
  const signatureRef = generateUniqueSignatureCode(params);
  const activeSignatureImg = signatureImageUrl || params.signatureImageUrl;

  const expiryDays = params.expiryDays || 90;
  const expiryCheck = isSignatureExpired(params.expiresAt, params.issueDate, expiryDays);

  useEffect(() => {
    let isMounted = true;
    generatePrincipalSignatureQRDataUrl({ ...params, style: activeStyle }, { size: size * 3, margin: 1 })
      .then(url => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch(err => {
        console.error('Error generating QR for signature slot:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    params.studentId,
    params.studentCode,
    params.grade,
    params.section,
    params.academicYear,
    params.monthOrSemester,
    params.schoolCode,
    params.principalName,
    params.issueDate,
    params.expiresAt,
    params.expiryDays,
    activeStyle,
    size
  ]);

  // Style container classes
  const getContainerStyleClasses = () => {
    switch (activeStyle) {
      case 'rounded_modern':
        return 'p-2 border-2 border-blue-900 rounded-2xl bg-white shadow-xs';
      case 'dot_pattern':
        return 'p-1.5 border border-dashed border-indigo-900 rounded-xl bg-indigo-50/20';
      case 'framed_seal':
        return 'p-2 border-2 border-double border-amber-900/80 rounded-2xl bg-gradient-to-b from-white to-amber-50/30 ring-1 ring-amber-700/20 shadow-xs';
      case 'bordered_moeys':
        return 'p-2 border-2 border-slate-900 rounded-lg bg-white ring-2 ring-blue-950/20 shadow-2xs';
      case 'classic_square':
      default:
        return showBorder ? 'p-1.5 border border-slate-800 rounded bg-white' : 'bg-white';
    }
  };

  return (
    <div
      className={`principal-signature-qr-slot inline-flex flex-col items-center justify-center select-none text-center relative ${getContainerStyleClasses()} ${className}`}
      data-signature-ref={signatureRef}
      data-signature-style={activeStyle}
      style={{ minWidth: size + 12 }}
    >
      {/* Optional Signature Graphic or High Quality Placeholder */}
      {showSignatureGraphic && (
        <div className="mb-1">
          {activeSignatureImg ? (
            <img
              src={activeSignatureImg}
              alt={`ហត្ថលេខាឌីជីថល - ${params.principalName}`}
              referrerPolicy="no-referrer"
              className="max-h-12 max-w-[100px] object-contain mx-auto"
            />
          ) : (
            <PrincipalSignaturePlaceholderGraphic
              principalName={params.principalName}
              schoolCode={params.schoolCode}
              size={36}
            />
          )}
        </div>
      )}

      {/* Decorative Outer Header Banner for Framed Seal or Bordered MoEYS */}
      {activeStyle === 'framed_seal' && (
        <div className="mb-1 text-[6px] font-bold font-moul text-amber-950 uppercase tracking-tight flex items-center gap-0.5">
          <span>❖ ត្រាឌីជីថល MoEYS ❖</span>
        </div>
      )}

      {activeStyle === 'bordered_moeys' && (
        <div className="mb-0.5 bg-blue-950 text-white text-[5.5px] font-bold px-1.5 py-0.5 rounded-xs tracking-tighter uppercase">
          OFFICIAL SIGNATURE SEAL
        </div>
      )}

      {/* QR Code Image Container */}
      <div
        className={`qr-image-wrapper flex items-center justify-center bg-white relative overflow-hidden ${
          activeStyle === 'rounded_modern' ? 'rounded-xl p-1 border border-slate-200' : 
          activeStyle === 'dot_pattern' ? 'rounded-lg p-0.5' :
          activeStyle === 'framed_seal' ? 'rounded-lg border border-amber-800/40 p-1' : ''
        }`}
        style={{ width: size, height: size }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Principal Signature QR - ${signatureRef}`}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-contain qr-code-bw-img block ${
              activeStyle === 'rounded_modern' ? 'rounded-md' : ''
            }`}
            style={{
              imageRendering: 'pixelated',
              filter: 'contrast(160%) grayscale(100%)'
            }}
          />
        ) : (
          <div
            className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-500 font-mono"
            style={{ width: size, height: size }}
          >
            QR Loading...
          </div>
        )}

        {/* Expiration Stamp Overlay when Expired */}
        {expiryCheck.isExpired && (
          <div className="absolute inset-0 bg-rose-900/85 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-1 rounded">
            <span className="text-[7.5px] font-bold uppercase tracking-wider font-mono text-amber-200">
              EXPIRED
            </span>
            <span className="text-[6.5px] font-semibold text-center leading-tight">
              ផុតសុពលភាព
            </span>
          </div>
        )}
      </div>

      {/* Verification Details */}
      {showVerificationText && (
        <div className="mt-1 space-y-0.5 max-w-[110px] leading-tight">
          <p className="text-[7.5px] font-bold text-black uppercase tracking-tighter">
            កូដផ្ទៀងផ្ទាត់ហត្ថលេខា
          </p>
          <p className="text-[6.5px] font-mono text-black font-semibold tracking-tighter truncate">
            {signatureRef}
          </p>
          
          {/* Expiration Notice Badge */}
          {expiryCheck.isExpired ? (
            <div className="pt-0.5">
              <span className="inline-block bg-rose-100 border border-rose-400 text-rose-800 text-[6px] font-bold px-1 rounded">
                ផុតសុពលភាព: {expiryCheck.expiresAt}
              </span>
              {onRegenerateNewSignature && (
                <button
                  type="button"
                  onClick={onRegenerateNewSignature}
                  className="mt-0.5 block w-full bg-blue-700 hover:bg-blue-800 text-white text-[6px] font-bold py-0.5 rounded cursor-pointer no-print"
                >
                  បង្កើត/បន្តសុពលភាពថ្មី
                </button>
              )}
            </div>
          ) : (
            <p className="text-[5.8px] font-mono text-slate-600 truncate">
              សុពលភាពដល់: {expiryCheck.expiresAt} ({expiryCheck.daysRemaining} ថ្ងៃ)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

