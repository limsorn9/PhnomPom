import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Loader2 } from 'lucide-react';
import { Student, Teacher, AppUser } from '../types';
import { buildStudentQRLoginUrl, buildStaffQRLoginUrl } from '../utils/qrAuthService';

interface SmartQRCodeProps {
  student?: Student;
  teacher?: Teacher | AppUser;
  customValue?: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
  schoolCode?: string;
  allowClickToEnlarge?: boolean;
  altTitle?: string;
}

export const SmartQRCode: React.FC<SmartQRCodeProps> = ({
  student,
  teacher,
  customValue,
  size = 64,
  className = '',
  showBorder = true,
  schoolCode = '020401015',
  allowClickToEnlarge = true,
  altTitle
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final QR content value
  let qrContent = customValue || '';
  if (!qrContent && student) {
    qrContent = buildStudentQRLoginUrl(student, schoolCode);
  } else if (!qrContent && teacher) {
    qrContent = buildStaffQRLoginUrl(teacher as Teacher, schoolCode);
  }

  useEffect(() => {
    let isMounted = true;
    if (!qrContent) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    QRCode.toDataURL(qrContent, {
      width: Math.max(size * 3, 200), // high res for crisp scaling & printing
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => {
        if (isMounted) {
          setDataUrl(url);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Error generating Smart QR Code:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [qrContent, size]);

  const displayName =
    altTitle ||
    (student ? `សិស្ស «${student.nameKhmer}» (${student.code})` : teacher ? `គ្រូ «${teacher.nameKhmer}»` : 'QR Code');

  return (
    <>
      <div
        style={{ width: size, height: size }}
        className={`relative inline-flex items-center justify-center bg-white shrink-0 select-none ${
          showBorder ? 'border border-slate-300 rounded-lg p-0.5 shadow-xs' : ''
        } ${allowClickToEnlarge ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all' : ''} ${className}`}
        onClick={allowClickToEnlarge ? () => setIsModalOpen(true) : undefined}
        title={allowClickToEnlarge ? `ចុចដើម្បីពង្រីក ឬទាញយក Smart QR របស់ ${displayName}` : displayName}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          </div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt={`Smart QR Code for ${displayName}`}
            className="w-full h-full object-contain block rounded"
            referrerPolicy="no-referrer"
          />
        ) : (
          <QrCode className="w-full h-full text-slate-900" />
        )}
      </div>

      {/* Enlarged QR Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-left">
                <h4 className="text-sm font-bold font-moul text-slate-900">Smart QR Code Login</h4>
                <p className="text-xs text-slate-500">{displayName}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gradient-to-b from-blue-50/50 to-slate-50 rounded-2xl border-2 border-blue-600/20 flex flex-col items-center">
              {dataUrl && (
                <img
                  src={dataUrl}
                  alt={displayName}
                  className="w-56 h-56 object-contain rounded-xl bg-white p-2 border border-slate-300 shadow-md"
                />
              )}
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-blue-950">ស្កេនតាមកាមេរ៉ាទូរស័ព្ទដើម្បីចូលគណនីភ្លាមៗ</p>
                <p className="text-[11px] text-slate-500">
                  QR នេះនៅតែអាចប្រើប្រាស់បានជានិច្ច ទោះបីជាមានការផ្លាស់ប្តូរពាក្យសម្ងាត់ក៏ដោយ។
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <a
                href={dataUrl}
                download={`QR_Login_${(student?.code || teacher?.nameKhmer || 'card').replace(/\s+/g, '_')}.png`}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>ទាញយកជារូបភាព (PNG)</span>
              </a>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
