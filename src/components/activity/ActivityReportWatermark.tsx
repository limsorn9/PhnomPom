import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export type ActivityWatermarkType = 'official' | 'draft' | 'confidential' | 'none';

interface ActivityReportWatermarkProps {
  type?: ActivityWatermarkType;
  customText?: string;
  opacity?: number;
  printOnly?: boolean;
}

export const ActivityReportWatermark: React.FC<ActivityReportWatermarkProps> = ({
  type = 'official',
  customText,
  opacity = 0.08,
  printOnly = false
}) => {
  if (type === 'none') return null;

  const getWatermarkConfig = () => {
    switch (type) {
      case 'draft':
        return {
          titleKhmer: 'ឯកសារព្រាង (DRAFT)',
          subKhmer: 'សម្រាប់ពិនិត្យផ្ទៃក្នុង • មិនទាន់ជាផ្លូវការ',
          badgeColor: 'border-amber-600/30 text-amber-900',
          sealBg: 'bg-amber-500/10'
        };
      case 'confidential':
        return {
          titleKhmer: 'ឯកសារសម្ងាត់រដ្ឋបាល (CONFIDENTIAL)',
          subKhmer: 'រក្សាការសម្ងាត់ខ្ពស់ • សម្រាប់គណៈគ្រប់គ្រងសាលា',
          badgeColor: 'border-rose-600/30 text-rose-900',
          sealBg: 'bg-rose-500/10'
        };
      case 'official':
      default:
        return {
          titleKhmer: 'ឯកសារផ្លូវការ (OFFICIAL AUDIT)',
          subKhmer: 'សាលាបឋមសិក្សាភ្នំពុំ • ក្រសួងអប់រំ យុវជន និងកីឡា',
          badgeColor: 'border-blue-700/30 text-blue-950',
          sealBg: 'bg-blue-600/10'
        };
    }
  };

  const config = getWatermarkConfig();
  const displayTitle = customText || config.titleKhmer;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 flex flex-col items-center justify-center overflow-hidden select-none transition-opacity ${
        printOnly ? 'hidden print:flex pdf-export-active:flex' : 'flex'
      }`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="transform -rotate-12 border-4 border-dashed rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto backdrop-blur-[0.5px]">
        {/* Large Stamp Symbol */}
        <div className="flex justify-center mb-3">
          <div className={`w-20 h-20 rounded-full border-4 border-current flex items-center justify-center ${config.sealBg}`}>
            {type === 'official' ? (
              <ShieldCheck className="w-12 h-12 stroke-[1.75]" />
            ) : (
              <FileText className="w-12 h-12 stroke-[1.75]" />
            )}
          </div>
        </div>

        {/* Text Title */}
        <div className="font-moul text-xl sm:text-2xl tracking-wide uppercase leading-tight font-extrabold">
          {displayTitle}
        </div>

        {/* Secondary Subtitle */}
        <div className="font-battambang text-xs sm:text-sm font-bold tracking-widest mt-2 uppercase">
          {config.subKhmer}
        </div>

        {/* Audit Verification Timestamp */}
        <div className="font-mono text-[10px] tracking-wider text-slate-700 mt-2 font-bold">
          SECURITY STAMP • MOEYS AUDIT SYSTEM • 2025-2026
        </div>
      </div>
    </div>
  );
};
