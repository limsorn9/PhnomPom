import React from 'react';
import { SignatureQRStyle } from '../types';
import {
  PrincipalSignatureQRParams,
  PrincipalSignatureQRSlot
} from '../utils/reportCardSignatureQR';

export type { PrincipalSignatureQRParams };
export { PrincipalSignatureQRSlot };

/**
 * Angkor Wat Vector Silhouette
 */
export const AngkorWatSilhouette: React.FC<{
  className?: string;
  opacity?: number;
  color?: string;
}> = ({ className = 'w-32 h-20', opacity = 0.15, color = 'currentColor' }) => {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      {/* Central Highest Tower */}
      <path
        d="M200 15 L208 45 L204 47 L212 80 L207 82 L216 125 L184 125 L193 82 L188 80 L196 47 L192 45 Z"
        fill={color}
      />
      <circle cx="200" cy="12" r="3" fill={color} />

      {/* Flanking Mid Towers */}
      {/* Left Mid Tower */}
      <path
        d="M150 40 L156 65 L153 67 L160 95 L156 97 L163 125 L137 125 L144 97 L140 95 L147 67 L144 65 Z"
        fill={color}
      />
      <circle cx="150" cy="37" r="2.5" fill={color} />

      {/* Right Mid Tower */}
      <path
        d="M250 40 L256 65 L253 67 L260 95 L256 97 L263 125 L237 125 L244 97 L240 95 L247 67 L244 65 Z"
        fill={color}
      />
      <circle cx="250" cy="37" r="2.5" fill={color} />

      {/* Outer Towers */}
      {/* Outer Left Tower */}
      <path
        d="M100 65 L105 85 L103 87 L108 108 L105 110 L110 125 L90 125 L95 110 L92 108 L97 87 L95 85 Z"
        fill={color}
      />
      <circle cx="100" cy="62" r="2" fill={color} />

      {/* Outer Right Tower */}
      <path
        d="M300 65 L305 85 L303 87 L308 108 L305 110 L310 125 L290 125 L295 110 L292 108 L297 87 L295 85 Z"
        fill={color}
      />
      <circle cx="300" cy="62" r="2" fill={color} />

      {/* Stepped Terraces & Galleries Base */}
      <rect x="75" y="125" width="250" height="10" rx="1" fill={color} />
      <rect x="50" y="135" width="300" height="12" rx="1" fill={color} />
      <rect x="30" y="147" width="340" height="15" rx="1" fill={color} />
      <rect x="15" y="162" width="370" height="18" rx="2" fill={color} />

      {/* Porticos and Colonnades details */}
      <line x1="85" y1="125" x2="85" y2="135" stroke={color} strokeWidth="2" />
      <line x1="115" y1="125" x2="115" y2="135" stroke={color} strokeWidth="2" />
      <line x1="145" y1="125" x2="145" y2="135" stroke={color} strokeWidth="2" />
      <line x1="175" y1="125" x2="175" y2="135" stroke={color} strokeWidth="2" />
      <line x1="225" y1="125" x2="225" y2="135" stroke={color} strokeWidth="2" />
      <line x1="255" y1="125" x2="255" y2="135" stroke={color} strokeWidth="2" />
      <line x1="285" y1="125" x2="285" y2="135" stroke={color} strokeWidth="2" />
      <line x1="315" y1="125" x2="315" y2="135" stroke={color} strokeWidth="2" />

      {/* Lotus Pool Water Reflection Ripple Lines */}
      <line x1="50" y1="186" x2="350" y2="186" stroke={color} strokeWidth="1.5" strokeDasharray="12 6" />
      <line x1="80" y1="192" x2="320" y2="192" stroke={color} strokeWidth="1" strokeDasharray="8 8" />
    </svg>
  );
};

/**
 * Traditional Khmer Kbach (Lotus Corner Flourish)
 */
export const KhmerKbachCorner: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  color?: string;
}> = ({ position, className = 'w-16 h-16', color = '#d97706' }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scaleX(-1)';
      case 'bottom-left':
        return 'scaleY(-1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: getTransform() }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Outer Corner Frame */}
        <path d="M4 96 L4 20 Q4 4 20 4 L96 4" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M12 96 L12 24 Q12 12 24 12 L96 12" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Traditional Khmer Kbach Lotus Flame Curves */}
        <path
          d="M20 20 C24 10 36 6 48 10 C38 18 36 28 42 38 C32 34 26 36 20 46 C20 36 16 26 20 20 Z"
          fill={color}
          opacity="0.85"
        />
        <path
          d="M14 42 C16 36 22 34 28 36 C24 42 24 48 28 54 C20 50 16 52 14 58 Z"
          fill={color}
          opacity="0.75"
        />
        <path
          d="M42 14 C36 16 34 22 36 28 C42 24 48 24 54 28 C50 20 52 16 58 14 Z"
          fill={color}
          opacity="0.75"
        />
        <circle cx="28" cy="28" r="4" fill={color} />
        <circle cx="16" cy="16" r="2.5" fill={color} />
      </svg>
    </div>
  );
};

/**
 * MoEYS Royal Emblem Header with Traditional Divider
 */
export const MoEYSRoyalHeader: React.FC<{
  className?: string;
  subTitle?: string;
}> = ({ className = '', subTitle }) => {
  return (
    <div className={`text-center space-y-1 ${className}`}>
      <h3 className="font-moul text-sm sm:text-base text-blue-950 tracking-wider">
        ព្រះរាជាណាចក្រកម្ពុជា
      </h3>
      <h4 className="font-moul text-xs sm:text-sm text-blue-900 tracking-wide">
        ជាតិ សាសនា ព្រះមហាក្សត្រ
      </h4>

      {/* Royal Curvature Divider */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        <div className="w-12 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent to-amber-500" />
        <div className="flex items-center gap-1 text-amber-600">
          <span className="text-[10px]">❖</span>
          <span className="text-xs">៚</span>
          <span className="text-[10px]">❖</span>
        </div>
        <div className="w-12 sm:w-16 h-[1.5px] bg-gradient-to-l from-transparent to-amber-500" />
      </div>

      {subTitle && (
        <p className="text-[11px] sm:text-xs font-semibold text-slate-600 font-battambang">
          {subTitle}
        </p>
      )}
    </div>
  );
};

/**
 * Official MoEYS Red Circular School Stamp for Print Verification
 */
export const SchoolOfficialStamp: React.FC<{
  schoolName: string;
  districtProvince: string;
  principalName: string;
  date?: string;
  className?: string;
}> = ({
  schoolName,
  districtProvince,
  principalName,
  date,
  className = ''
}) => {
  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Red Circular Stamp graphic */}
      <div className="w-32 h-32 rounded-full border-2 border-red-600/80 p-1 flex items-center justify-center relative rotate-[-6deg] shadow-xs">
        <div className="w-full h-full rounded-full border border-dashed border-red-500/70 p-2 flex flex-col items-center justify-between text-center text-red-600">
          <div className="text-[7.5px] font-bold font-moul leading-tight text-red-700">
            ក្រសួងអប់រំ យុវជន និងកីឡា
          </div>
          <div className="my-auto text-[8px] font-bold font-moul leading-tight text-red-800 px-1">
            {schoolName}
          </div>
          <div className="flex items-center justify-center gap-1 text-[7px]">
            <span>★</span>
            <span className="font-semibold text-red-700 font-battambang">{districtProvince}</span>
            <span>★</span>
          </div>
        </div>
      </div>

      {/* Signature & Principal Name underneath */}
      <div className="text-center mt-2 space-y-0.5">
        <p className="text-xs font-bold font-moul text-slate-900">{principalName}</p>
        {date && <p className="text-[10px] text-slate-500 font-battambang">{date}</p>}
      </div>
    </div>
  );
};

/**
 * Full Page Angkor Wat Watermark Background for Official Documents
 */
export const AngkorPageWatermark: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
      style={{ opacity }}
    >
      <AngkorWatSilhouette className="w-[85%] max-w-2xl h-auto text-blue-950" opacity={1} />
    </div>
  );
};

/**
 * Traditional Cambodian Khmer Decorative Corner Borders for Certificates
 */
export const AngkorBorderOrnament: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Top Left Corner */}
      <div className="absolute top-2 left-2 w-8 h-8 text-amber-600/70 border-t-2 border-l-2 border-amber-600/70 flex items-center justify-center">
        <span className="text-xs -translate-x-0.5 -translate-y-0.5">❖</span>
      </div>
      {/* Top Right Corner */}
      <div className="absolute top-2 right-2 w-8 h-8 text-amber-600/70 border-t-2 border-r-2 border-amber-600/70 flex items-center justify-center">
        <span className="text-xs translate-x-0.5 -translate-y-0.5">❖</span>
      </div>
      {/* Bottom Left Corner */}
      <div className="absolute bottom-2 left-2 w-8 h-8 text-amber-600/70 border-b-2 border-l-2 border-amber-600/70 flex items-center justify-center">
        <span className="text-xs -translate-x-0.5 translate-y-0.5">❖</span>
      </div>
      {/* Bottom Right Corner */}
      <div className="absolute bottom-2 right-2 w-8 h-8 text-amber-600/70 border-b-2 border-r-2 border-amber-600/70 flex items-center justify-center">
        <span className="text-xs translate-x-0.5 translate-y-0.5">❖</span>
      </div>
    </div>
  );
};

/**
 * Converts Arabic numerals to Khmer numerals (e.g. 2026 -> ២០២៦)
 */
export const toKhmerNumber = (val: number | string): string => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(val).replace(/[0-9]/g, match => khmerDigits[parseInt(match, 10)]);
};

/**
 * Returns formatted Khmer Solar Date (កាលបរិច្ឆេទសុរិយគតិ)
 * e.g., "ភ្នំពេញ, ថ្ងៃទី២២ ខែសីហា ឆ្នាំ២០២៦"
 */
export const getKhmerSolarDate = (date = new Date(), location = 'ភ្នំពេញ'): string => {
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const day = toKhmerNumber(date.getDate());
  const month = khmerMonths[date.getMonth()];
  const year = toKhmerNumber(date.getFullYear());
  return `${location}, ថ្ងៃទី${day} ខែ${month} ឆ្នាំ${year}`;
};

/**
 * Returns formatted Khmer Lunar Date (កាលបរិច្ឆេទចន្ទគតិ)
 * e.g., "ថ្ងៃព្រហស្បតិ៍ ១៤កើត ខែស្រាពណ៍ ឆ្នាំមមែ អដ្ឋស័ក ព.ស.២៥៧០"
 */
export const getKhmerLunarDate = (date = new Date()): string => {
  const daysOfWeek = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'];
  const dayName = daysOfWeek[date.getDay()];
  
  // Buddhist Era (ព.ស.)
  const buddhistEra = toKhmerNumber(date.getFullYear() + 544);
  
  const lunarMonths = [
    'បុស្ស', 'មាឃ', 'ផល្គុន', 'ចេត្រ', 'ពិសាខ', 'ជេស្ឋ',
    'អាសាឍ', 'ស្រាពណ៍', 'ភទ្របទ', 'អស្សុជ', 'កត្តិក', 'មិគសិរ'
  ];
  const lunarMonth = lunarMonths[date.getMonth()] || 'ស្រាពណ៍';

  // Day of lunar cycle (approximate 1-15 keut / roch)
  const dayOfMonth = date.getDate();
  const isKeut = dayOfMonth <= 15;
  const lunarDayNum = isKeut ? dayOfMonth : (dayOfMonth - 15);
  const lunarPhase = `${toKhmerNumber(lunarDayNum)}${isKeut ? 'កើត' : 'រោច'}`;

  // Animal zodiac & era for standard Cambodian school administrative forms
  const zodiac = 'ឆ្នាំមមែ';
  const era = 'អដ្ឋស័ក';

  return `${dayName} ${lunarPhase} ខែ${lunarMonth} ${zodiac} ${era} ព.ស.${buddhistEra}`;
};

/**
 * Clean Circular Stamp Placeholder for Physical School Seal (ត្រាសាលារៀន)
 * "ចំណែកត្រាសាលារៀន គ្រាន់តែដាក់រង្វង់ទុក ឱ្យដាក់ត្រាទៅបានហើយ"
 */
export const SchoolStampCirclePlaceholder: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}> = ({ className = '', size = 'md', label = 'ទីតាំងបោះត្រា' }) => {
  const sizeClass = size === 'sm' ? 'w-20 h-20' : size === 'lg' ? 'w-32 h-32' : 'w-26 h-26';
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <div className={`${sizeClass} rounded-full border-2 border-dashed border-red-500/80 p-1 flex items-center justify-center transition-all bg-red-50/10`}>
        <div className="w-full h-full rounded-full border border-dotted border-red-400/60 flex items-center justify-center text-center">
          <span className="text-[9px] font-battambang text-red-500/80 font-medium px-1 leading-tight">
            ( {label} )
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Standard MoEYS Dual Administrative Signature Block (ទម្រង់រដ្ឋបាលសាលារៀនផ្លូវការ)
 * - Left: "បានឃើញ និងឯកភាព" (font-moul blue), "នាយកសាលា" (font-moul blue), Stamp Circle Placeholder, Director Name (font-moul red)
 * - Right: Lunar Date + Solar Date, "គ្រូបន្ទុកថ្នាក់" (font-moul blue), Signature space, Teacher Name (font-moul blue)
 */
export const MoEYSOfficialDualSignatures: React.FC<{
  schoolLocation?: string;
  principalTitle?: string;
  principalName?: string;
  reviewerTitle?: string; // e.g. "បានឃើញ និងឯកភាព"
  teacherRoleTitle?: string; // e.g. "គ្រូបន្ទុកថ្នាក់" or "ប្រធានគណៈកម្មការ"
  teacherName?: string;
  teacherNameColor?: 'blue' | 'red' | 'dark';
  lunarDate?: string;
  solarDate?: string;
  showStampPlaceholder?: boolean;
  signatureQRParams?: PrincipalSignatureQRParams;
  showPrincipalQR?: boolean;
  className?: string;
}> = ({
  schoolLocation = 'ភ្នំពេញ',
  principalTitle = 'នាយកសាលា',
  principalName = 'ស៊ុន ពិសិដ្ឋ',
  reviewerTitle = 'បានឃើញ និងឯកភាព',
  teacherRoleTitle = 'គ្រូបន្ទុកថ្នាក់',
  teacherName = 'សែម ស្រីភឿន',
  teacherNameColor = 'blue',
  lunarDate,
  solarDate,
  showStampPlaceholder = true,
  signatureQRParams,
  showPrincipalQR = false,
  className = ''
}) => {
  const formattedLunar = lunarDate || getKhmerLunarDate();
  const formattedSolar = solarDate || getKhmerSolarDate(new Date(), schoolLocation);

  const teacherColorClass =
    teacherNameColor === 'red'
      ? 'text-red-600'
      : teacherNameColor === 'dark'
      ? 'text-slate-900'
      : 'text-blue-700';

  return (
    <div className={`w-full flex justify-between items-start text-xs font-battambang leading-relaxed pt-6 select-none ${className}`}>
      {/* LEFT: Approving Authority / School Principal with Dedicated Signature QR Slot */}
      <div className="text-center w-72 space-y-1">
        <p className="font-moul text-blue-700 text-xs sm:text-sm font-bold tracking-wide">
          {reviewerTitle}
        </p>
        <p className="font-moul text-blue-700 text-xs sm:text-sm font-bold">
          {principalTitle}
        </p>

        {/* Circular Stamp Placement & Signature QR Code Area */}
        <div className="min-h-28 flex items-center justify-center gap-2 my-1 relative">
          {showStampPlaceholder && (
            <SchoolStampCirclePlaceholder label="ទីតាំងបោះត្រា" />
          )}

          {showPrincipalQR && signatureQRParams && (
            <PrincipalSignatureQRSlot
              params={signatureQRParams}
              size={68}
              showBorder={true}
              showVerificationText={true}
              className="z-10 shadow-xs"
            />
          )}
        </div>

        {/* Principal Name in RED color and Khmer OS Muol Light */}
        <p className="font-moul text-red-600 font-bold text-xs sm:text-sm tracking-wide pt-1">
          {principalName}
        </p>
      </div>

      {/* RIGHT: Homeroom Teacher / Committee / Creator */}
      <div className="text-center w-72 space-y-1">
        {/* Lunar Date (កាលបរិច្ឆេទចន្ទគតិ) */}
        <p className="text-xs text-blue-900 font-medium leading-tight">
          {formattedLunar}
        </p>
        {/* Solar Date (កាលបរិច្ឆេទសុរិយគតិ) */}
        <p className="text-xs text-blue-900 font-medium leading-tight">
          {formattedSolar}
        </p>

        {/* Teacher Role in Blue & Khmer OS Muol Light */}
        <p className="font-moul text-blue-700 text-xs sm:text-sm font-bold mt-1">
          {teacherRoleTitle}
        </p>

        {/* Manual Signature Blank Space */}
        <div className="min-h-28 flex items-center justify-center">
          <span className="text-slate-300 italic text-[11px]"></span>
        </div>

        {/* Teacher Name in BLUE color and Khmer OS Muol Light */}
        <p className={`font-moul ${teacherColorClass} font-bold text-xs sm:text-sm tracking-wide pt-1`}>
          {teacherName}
        </p>
      </div>
    </div>
  );
};

/**
 * Standard MoEYS 3-Column Report Card Signatures (Guardian, Homeroom Teacher, Principal)
 * Includes a dedicated slot for the unique Principal Signature QR Code in pure Black & White for printing.
 */
export const MoEYSReportCardSignatures: React.FC<{
  guardianName?: string;
  teacherName?: string;
  principalName?: string;
  schoolLocation?: string;
  currentMonthName?: string;
  signatureQRParams?: PrincipalSignatureQRParams;
  showSignatureQR?: boolean;
  signatureQRStyle?: SignatureQRStyle;
  onRegenerateNewSignature?: () => void;
  className?: string;
}> = ({
  guardianName = '...............................',
  teacherName = 'គ្រូបន្ទុកថ្នាក់',
  principalName = 'នាយកសាលា',
  schoolLocation = 'បាត់ដំបង',
  currentMonthName = 'មករា',
  signatureQRParams,
  showSignatureQR = true,
  signatureQRStyle,
  onRegenerateNewSignature,
  className = ''
}) => {
  const day = new Date().getDate();
  const year = new Date().getFullYear();

  return (
    <div
      className={`signatures-container mt-6 pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs relative z-1 ${className}`}
    >
      {/* 1. Parent / Guardian Column */}
      <div className="flex flex-col justify-between items-center space-y-1">
        <div>
          <p className="font-semibold text-slate-700">បានឃើញ និងយល់ព្រម</p>
          <p className="font-bold text-slate-900 font-moul mt-1">អាណាព្យាបាលសិស្ស</p>
        </div>
        <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
          (ហត្ថលេខា ឬស្នាមមេដៃ)
        </div>
        <p className="font-bold text-slate-800 border-t border-dotted border-slate-400 pt-1 px-4">
          {guardianName}
        </p>
      </div>

      {/* 2. Homeroom Teacher Column */}
      <div className="flex flex-col justify-between items-center space-y-1">
        <div>
          <p className="font-semibold text-slate-700">
            {schoolLocation}, ថ្ងៃទី {day} ខែ {currentMonthName} ឆ្នាំ{year}
          </p>
          <p className="font-bold text-slate-900 font-moul mt-1">គ្រូបន្ទុកថ្នាក់</p>
        </div>
        <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
          (ហត្ថលេខា)
        </div>
        <p className="font-bold text-slate-800 border-t border-dotted border-slate-400 pt-1 px-4">
          {teacherName}
        </p>
      </div>

      {/* 3. Principal / Director Column with Dedicated Black & White QR Slot */}
      <div className="flex flex-col justify-between items-center space-y-1">
        <div>
          <p className="font-semibold text-slate-700">បានឃើញ និងឯកភាព</p>
          <p className="font-bold text-blue-950 font-moul mt-1">នាយកសាលា</p>
        </div>

        {/* Dedicated QR Code Slot for Principal Signature & Stamp */}
        <div className="min-h-20 py-1 flex items-center justify-center gap-2">
          {showSignatureQR && signatureQRParams ? (
            <div className="flex items-center justify-center">
              <PrincipalSignatureQRSlot
                params={signatureQRParams}
                size={74}
                showBorder={true}
                showVerificationText={true}
                style={signatureQRStyle || signatureQRParams.style}
                onRegenerateNewSignature={onRegenerateNewSignature}
              />
            </div>
          ) : (
            <div className="w-20 h-20 border border-dashed border-slate-400 rounded flex items-center justify-center text-[9px] text-slate-400">
              (ត្រា និងហត្ថលេខា)
            </div>
          )}
        </div>

        <p className="font-bold font-moul text-blue-950 pt-1">
          {principalName}
        </p>
      </div>
    </div>
  );
};



