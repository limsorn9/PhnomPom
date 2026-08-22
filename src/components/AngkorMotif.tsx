import React from 'react';

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
