import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  X,
  Eye,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Phone,
  User,
  School,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';
import { generateStudentQRDataUrl, getStudentLookupUrl, downloadStudentQRImage } from '../utils/qrUtils';
import { AngkorPageWatermark, MoEYSRoyalHeader } from './AngkorMotif';

interface StudentQRModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullProfile?: (student: Student) => void;
}

export const StudentQRModal: React.FC<StudentQRModalProps> = ({
  student,
  isOpen,
  onClose,
  onViewFullProfile
}) => {
  const { schoolProfile, showToast } = useSchool();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState<number>(280);
  const [themeColor, setThemeColor] = useState<string>('#1e3a8a'); // MoEYS deep blue
  const cardPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (student && isOpen) {
      setIsGenerating(true);
      generateStudentQRDataUrl(student, { width: qrSize, color: { dark: themeColor, light: '#ffffff' } })
        .then(url => {
          setQrDataUrl(url);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
          showToast('មានបញ្ហាក្នុងការបង្កើត QR Code!', 'error');
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [student, isOpen, qrSize, themeColor, showToast]);

  if (!isOpen || !student) return null;

  const directUrl = getStudentLookupUrl(student);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directUrl);
      } else {
        const input = document.createElement('input');
        input.value = directUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      showToast('បានចម្លងតំណភ្ជាប់ស្វែងរកសិស្សជោគជ័យ!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('បរាជ័យក្នុងការចម្លងតំណភ្ជាប់!', 'error');
    }
  };

  const handleDownloadImage = () => {
    if (!qrDataUrl) return;
    downloadStudentQRImage(student, qrDataUrl, schoolProfile.nameKhmer);
    showToast(`បានទាញយករូបភាព QR Code សិស្ស «${student.nameKhmer}» រួចរាល់!`);
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `កាត QR សិស្ស៖ ${student.nameKhmer} (${student.code})`,
          text: `ព័ត៌មានសិស្ស ${student.nameKhmer} - ថ្នាក់ទី ${student.grade}${student.section} សាលា ${schoolProfile.nameKhmer}`,
          url: directUrl,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200/80 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between rounded-t-3xl sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-moul text-white">
                ប័ណ្ណសម្គាល់ QR Code សិស្ស
              </h3>
              <p className="text-xs text-blue-200">
                ស្កេនដើម្បីមើលព័ត៌មានលម្អិត & ផ្ទៀងផ្ទាត់អត្តសញ្ញាណ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="ចែករំលែក"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Printable Student Card Container */}
          <div
            id="student-printable-qr-card"
            ref={cardPrintRef}
            className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 rounded-2xl border-2 border-blue-900/40 p-5 shadow-md relative overflow-hidden text-slate-800"
          >
            {/* Watermark in background */}
            <AngkorPageWatermark opacity={0.04} />

            {/* School / Ministry Header Badge */}
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
                  <School className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-moul text-blue-950">
                    {schoolProfile.nameKhmer || 'សាលាបឋមសិក្សា'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
                    Student ID Pass • ក្រសួងអប់រំ យុវជន និងកីឡា
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block text-[11px] font-bold font-times px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {schoolProfile.academicYear || '២០២៤-២០២៥'}
                </span>
              </div>
            </div>

            {/* Student Photo, QR Code & Info Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Left/Top: Photo & Quick Meta */}
              <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
                <div className="relative group">
                  <img
                    src={student.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                    alt={student.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-xl border-2 border-white shadow-md ring-2 ring-blue-900/20"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-blue-900 text-white p-1 rounded-lg shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">អត្តលេខសិស្ស</span>
                  <div className="font-mono font-bold text-xs text-blue-900 tracking-wider">
                    {student.code}
                  </div>
                </div>
              </div>

              {/* Middle: Key details */}
              <div className="sm:col-span-4 space-y-2 text-xs">
                <div>
                  <h5 className="font-bold text-base font-moul text-slate-900 leading-snug">
                    {student.nameKhmer}
                  </h5>
                  <p className="text-xs font-semibold text-slate-600 font-times">
                    {student.nameLatin || '-'}
                  </p>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ថ្នាក់/បន្ទប់៖</span>
                    <span className="font-bold text-slate-900 bg-blue-50 px-2 py-0.5 rounded text-blue-950 border border-blue-100">
                      ថ្នាក់ទី {student.grade}{student.section}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ភេទ៖</span>
                    <span className="font-bold text-slate-800">
                      {student.gender === 'F' ? 'ស្រី (Female)' : 'ប្រុស (Male)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ថ្ងៃកំណើត៖</span>
                    <span className="font-bold font-times text-slate-800">{student.dob}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">អាណាព្យាបាល៖</span>
                    <span className="font-medium text-slate-900 truncate max-w-[110px]">
                      {student.guardianName || student.fatherName || 'អាណាព្យាបាល'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">លេខទូរស័ព្ទ៖</span>
                    <span className="font-bold font-times text-blue-700">
                      {student.guardianPhone || student.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: The Unique Generated QR Code */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative">
                {isGenerating ? (
                  <div className="w-32 h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px]">កំពុងបង្កើត QR...</span>
                  </div>
                ) : qrDataUrl ? (
                  <div className="relative group">
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${student.nameKhmer}`}
                      className="w-32 h-32 object-contain rounded-lg transition-transform group-hover:scale-105"
                    />
                    <div className="text-center mt-1">
                      <span className="text-[9px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Smart MoEYS QR
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-slate-400">
                    <QrCode className="w-12 h-12 opacity-40" />
                  </div>
                )}
              </div>
            </div>

            {/* Micro verification strip */}
            <div className="mt-4 pt-2.5 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
              <span>ស្កេនជាមួយកាមេរ៉ាទូរស័ព្ទ ឬឧបករណ៍ស្កេន</span>
              <span className="font-mono text-blue-900 font-semibold">{student.code}</span>
            </div>
          </div>

          {/* Deep link direct URL preview & copy bar */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-slate-600 block mb-0.5">
                តំណភ្ជាប់ស្វែងរកសិស្សផ្ទាល់ (Direct Profile Link)
              </span>
              <p className="text-xs text-slate-500 font-mono truncate bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 select-all">
                {directUrl}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap self-end"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">បានចម្លង</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>ចម្លងតំណ</span>
                </>
              )}
            </button>
          </div>

          {/* Styling & Color Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">ពណ៌ QR Code:</span>
              {[
                { color: '#1e3a8a', label: 'ខៀវ MoEYS' },
                { color: '#0f172a', label: 'ខ្មៅបុរាណ' },
                { color: '#047857', label: 'បៃតង' },
                { color: '#7c3aed', label: 'ស្វាយ' }
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => setThemeColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    themeColor === c.color ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>

            {onViewFullProfile && (
              <button
                onClick={() => {
                  onClose();
                  onViewFullProfile(student);
                }}
                className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>មើលប្រវត្តិរូបពេញលេញ</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            បិទ
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadImage}
              disabled={!qrDataUrl || isGenerating}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយក QR (PNG)</span>
            </button>

            <button
              onClick={handlePrintCard}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពកាត QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
