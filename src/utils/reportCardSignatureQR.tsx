import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

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
  averageScore?: number;
  gradeLetter?: string;
  rank?: number;
  totalStudents?: number;
  signatureReference?: string;
}

/**
 * Generates a unique, deterministic digital signature verification reference code
 * e.g. "MOEYS-PSIG-2026-6A-STU001-A48F"
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
 */
export const generatePrincipalSignaturePayload = (params: PrincipalSignatureQRParams): string => {
  const sigRef = params.signatureReference || generateUniqueSignatureCode(params);
  const now = params.issueDate || new Date().toISOString().split('T')[0];

  const payload = {
    v: '1.0',
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
    certifiedAt: now,
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
 * Props for the dedicated Principal Signature QR Code Slot component
 */
export interface PrincipalSignatureQRSlotProps {
  params: PrincipalSignatureQRParams;
  size?: number;
  showBorder?: boolean;
  showVerificationText?: boolean;
  className?: string;
}

/**
 * Dedicated React Component: Principal Signature QR Code Slot for Report Cards
 * Renders in pure black and white with high contrast borders and official security text.
 */
export const PrincipalSignatureQRSlot: React.FC<PrincipalSignatureQRSlotProps> = ({
  params,
  size = 80,
  showBorder = true,
  showVerificationText = true,
  className = ''
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const signatureRef = generateUniqueSignatureCode(params);

  useEffect(() => {
    let isMounted = true;
    generatePrincipalSignatureQRDataUrl(params, { size: size * 3, margin: 1 })
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
    size
  ]);

  return (
    <div
      className={`principal-signature-qr-slot inline-flex flex-col items-center justify-center select-none text-center ${
        showBorder ? 'p-1.5 border border-slate-800 rounded bg-white' : 'bg-white'
      } ${className}`}
      data-signature-ref={signatureRef}
      style={{ minWidth: size + 8 }}
    >
      {/* Black and White QR Code Image */}
      <div
        className="qr-image-wrapper flex items-center justify-center bg-white"
        style={{ width: size, height: size }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Principal Signature QR - ${signatureRef}`}
            className="w-full h-full object-contain qr-code-bw-img block"
            style={{
              imageRendering: 'pixelated',
              filter: 'contrast(150%) grayscale(100%)'
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
        </div>
      )}
    </div>
  );
};
