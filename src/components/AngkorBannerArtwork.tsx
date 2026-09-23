import React, { useState } from 'react';

export interface AngkorBannerArtworkProps {
  bannerUrl?: string;
  bannerType?: 'angkor_twilight' | 'angkor_sunrise' | 'angkor_golden' | 'angkor_monument' | 'angkor_vector' | 'custom' | 'gradient';
  className?: string;
  overlayOpacity?: number; // 0 to 100
}

// Curated high-resolution genuine photographs of Angkor Wat
export const ANGKOR_PHOTO_PRESETS = {
  angkor_twilight: {
    id: 'angkor_twilight',
    title: 'ប្រាសាទអង្គរវត្តពេលថ្ងៃលិច (Angkor Twilight Sunset)',
    description: 'រូបថតប្រាសាទអង្គរវត្តពេលថ្ងៃរៀបលិច ពន្លឺព្រះអាទិត្យពណ៌មាស និងឆ្លុះផ្ទៃទឹកត្រកាល',
    url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2000&q=85'
  },
  angkor_sunrise: {
    id: 'angkor_sunrise',
    title: 'ប្រាសាទអង្គរវត្តពេលថ្ងៃរះ (Angkor Wat Sunrise)',
    description: 'រូបថតកំពូលប្រាសាទទាំង៥ ឆ្លុះស្រះស្រង់ និងពន្លឺថ្ងៃរះពណ៌ស្វាយ-ផ្កាឈូក',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85'
  },
  angkor_golden: {
    id: 'angkor_golden',
    title: 'ប្រាសាទអង្គរវត្តពន្លឺមាស (Golden Hour Angkor Reflection)',
    description: 'រូបថតអង្គរវត្តឆ្លុះផ្ទៃទឹកត្រកាល បង្ហាញភាពរុងរឿងនៃវប្បធម៌ខ្មែរ',
    url: 'https://images.unsplash.com/photo-1561571994-3c61c554181a?auto=format&fit=crop&w=2000&q=85'
  },
  angkor_monument: {
    id: 'angkor_monument',
    title: 'ទិដ្ឋភាពមុខប្រាសាទអង្គរវត្ត (Classic Angkor Wat Panorama)',
    description: 'ទិដ្ឋភាពខាងមុខពេញលេញនៃប្រាសាទអង្គរវត្ត ស្ថាបត្យកម្មកំពូលពិភពលោក',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2000&q=85'
  }
};

/**
 * Cultural Angkor Wat Vector Artwork (Five Lotus Towers & Reflection)
 * Built with pure SVG paths for crisp vector rendering at any resolution or offline fallback.
 */
export const AngkorWatVectorIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 1600 600"
    className={className}
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      {/* Sky Gradient: Rich Twilight Sunset into Deep Royal Blue */}
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0a1329" />
        <stop offset="40%" stopColor="#1e295d" />
        <stop offset="70%" stopColor="#833ab4" />
        <stop offset="85%" stopColor="#fd1d1d" />
        <stop offset="100%" stopColor="#fcb045" />
      </linearGradient>

      {/* Sun Glow Behind Angkor Towers */}
      <radialGradient id="sunGlow" cx="62%" cy="65%" r="35%">
        <stop offset="0%" stopColor="#ffe680" stopOpacity="0.95" />
        <stop offset="35%" stopColor="#ff9900" stopOpacity="0.7" />
        <stop offset="70%" stopColor="#e52d27" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0a1329" stopOpacity="0" />
      </radialGradient>

      {/* Water Reflection Gradient */}
      <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5c1d42" />
        <stop offset="30%" stopColor="#1e1842" />
        <stop offset="70%" stopColor="#0c102a" />
        <stop offset="100%" stopColor="#050814" />
      </linearGradient>

      {/* Temple Silhouette Gradients */}
      <linearGradient id="templeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e1b38" />
        <stop offset="50%" stopColor="#121324" />
        <stop offset="100%" stopColor="#070811" />
      </linearGradient>

      <linearGradient id="templeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffb03a" stopOpacity="0.25" />
        <stop offset="50%" stopColor="#ffdf70" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ff8c00" stopOpacity="0.1" />
      </linearGradient>

      {/* Traditional Khmer Kbach Motif for decorative pattern */}
      <pattern id="lotusKbach" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path
          d="M40 10 C32 25 28 36 40 50 C52 36 48 25 40 10 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeOpacity="0.08"
        />
        <path
          d="M40 40 C28 36 16 42 12 55 C26 56 34 50 40 40 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeOpacity="0.08"
        />
        <path
          d="M40 40 C52 36 64 42 68 55 C54 56 46 50 40 40 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeOpacity="0.08"
        />
      </pattern>
    </defs>

    {/* 1. Sky & Sun */}
    <rect width="1600" height="420" fill="url(#skyGrad)" />
    <circle cx="980" cy="270" r="180" fill="url(#sunGlow)" />

    {/* Subtle Cloud Layers */}
    <path
      d="M0 240 Q400 200 800 240 T1600 230 L1600 350 L0 350 Z"
      fill="#43184d"
      fillOpacity="0.35"
    />
    <path
      d="M0 280 Q350 250 750 285 T1600 270 L1600 360 L0 360 Z"
      fill="#ff6b6b"
      fillOpacity="0.18"
    />

    {/* 2. Distant Jungle Silhouette */}
    <path
      d="M0 380 Q80 360 160 375 T320 365 T480 375 T640 360 T800 370 T960 360 T1120 375 T1280 365 T1440 375 T1600 365 L1600 420 L0 420 Z"
      fill="#0d0e1a"
    />

    {/* 3. The 5 Iconic Angkor Wat Temple Towers & Galleries (Centered on right side for banner balance) */}
    {/* Base Gallery Platform */}
    <g transform="translate(680, 70)">
      {/* Outer Causeway & Base Levels */}
      <rect x="0" y="275" width="620" height="25" rx="2" fill="url(#templeGrad)" />
      <rect x="30" y="260" width="560" height="18" fill="url(#templeGrad)" />
      <rect x="70" y="245" width="480" height="18" fill="url(#templeGrad)" />
      <rect x="120" y="230" width="380" height="18" fill="url(#templeGrad)" />

      {/* Central Terrace Platform with Decorative Battlements */}
      <path
        d="M10 275 L610 275 L590 295 L30 295 Z"
        fill="#080912"
      />

      {/* Tower 1 (Far Left Flanking Tower - Prang) */}
      <g transform="translate(90, 140)">
        {/* Tiered Lotus Sanctuary Base */}
        <rect x="15" y="80" width="40" height="25" fill="url(#templeGrad)" />
        <rect x="18" y="65" width="34" height="18" fill="url(#templeGrad)" />
        <rect x="22" y="50" width="26" height="18" fill="url(#templeGrad)" />
        {/* Curved Lotus Bud Crown */}
        <path
          d="M24 50 C24 35 28 20 35 5 C42 20 46 35 46 50 Z"
          fill="url(#templeGrad)"
        />
        {/* Spire Pinnacle (Trishula/Kalas) */}
        <line x1="35" y1="5" x2="35" y2="-5" stroke="#ffdf70" strokeWidth="1.5" strokeOpacity="0.8" />
        <circle cx="35" cy="-5" r="1.5" fill="#ffe680" />
      </g>

      {/* Tower 2 (Inner Left Tower) */}
      <g transform="translate(190, 85)">
        <rect x="15" y="125" width="50" height="35" fill="url(#templeGrad)" />
        <rect x="18" y="100" width="44" height="28" fill="url(#templeGrad)" />
        <rect x="22" y="75" width="36" height="28" fill="url(#templeGrad)" />
        <rect x="26" y="55" width="28" height="22" fill="url(#templeGrad)" />
        {/* Lotus Bud */}
        <path
          d="M28 55 C28 35 34 15 40 0 C46 15 52 35 52 55 Z"
          fill="url(#templeGrad)"
        />
        <line x1="40" y1="0" x2="40" y2="-12" stroke="#ffdf70" strokeWidth="2" strokeOpacity="0.9" />
        <circle cx="40" cy="-12" r="2" fill="#ffe680" />
      </g>

      {/* Tower 3 (CENTRAL PRINCIPAL TOWER - Mt. Meru Peak) */}
      <g transform="translate(275, 10)">
        {/* Multi-tiered Mount Meru Sanctuary Base */}
        <rect x="10" y="195" width="70" height="40" fill="url(#templeGrad)" />
        <rect x="15" y="160" width="60" height="38" fill="url(#templeGrad)" />
        <rect x="20" y="125" width="50" height="38" fill="url(#templeGrad)" />
        <rect x="25" y="90" width="40" height="38" fill="url(#templeGrad)" />
        <rect x="30" y="60" width="30" height="32" fill="url(#templeGrad)" />
        {/* Iconic Lotus Bud Apex */}
        <path
          d="M32 60 C32 35 40 10 45 -15 C50 10 58 35 58 60 Z"
          fill="url(#templeGrad)"
        />
        {/* Golden Pinnacle Spire */}
        <line x1="45" y1="-15" x2="45" y2="-32" stroke="#ffdf70" strokeWidth="2.5" />
        <circle cx="45" cy="-32" r="3" fill="#ffffff" />
        {/* Golden Sun Edge Highlight on Central Sanctuary */}
        <path
          d="M45 -15 C50 10 58 35 58 60 L50 60 C50 35 45 10 45 -15 Z"
          fill="url(#templeHighlight)"
        />
      </g>

      {/* Tower 4 (Inner Right Tower) */}
      <g transform="translate(380, 85)">
        <rect x="15" y="125" width="50" height="35" fill="url(#templeGrad)" />
        <rect x="18" y="100" width="44" height="28" fill="url(#templeGrad)" />
        <rect x="22" y="75" width="36" height="28" fill="url(#templeGrad)" />
        <rect x="26" y="55" width="28" height="22" fill="url(#templeGrad)" />
        {/* Lotus Bud */}
        <path
          d="M28 55 C28 35 34 15 40 0 C46 15 52 35 52 55 Z"
          fill="url(#templeGrad)"
        />
        <line x1="40" y1="0" x2="40" y2="-12" stroke="#ffdf70" strokeWidth="2" strokeOpacity="0.9" />
        <circle cx="40" cy="-12" r="2" fill="#ffe680" />
      </g>

      {/* Tower 5 (Far Right Flanking Tower) */}
      <g transform="translate(490, 140)">
        <rect x="15" y="80" width="40" height="25" fill="url(#templeGrad)" />
        <rect x="18" y="65" width="34" height="18" fill="url(#templeGrad)" />
        <rect x="22" y="50" width="26" height="18" fill="url(#templeGrad)" />
        <path
          d="M24 50 C24 35 28 20 35 5 C42 20 46 35 46 50 Z"
          fill="url(#templeGrad)"
        />
        <line x1="35" y1="5" x2="35" y2="-5" stroke="#ffdf70" strokeWidth="1.5" strokeOpacity="0.8" />
        <circle cx="35" cy="-5" r="1.5" fill="#ffe680" />
      </g>

      {/* Connecting Galleries and Decorative Roofs */}
      <path
        d="M130 230 L195 210 L205 210 L275 205 L350 205 L420 210 L430 210 L495 230 Z"
        fill="url(#templeGrad)"
      />
    </g>

    {/* 4. Moat / Srah Srang Water Basin & Inverted Temple Reflections */}
    <rect y="370" width="1600" height="230" fill="url(#waterGrad)" />

    {/* Gentle Water Ripple Highlights reflecting the Sunset and Temple */}
    <g opacity="0.4" stroke="#ffb03a" strokeWidth="1.2">
      <line x1="900" y1="385" x2="1050" y2="385" />
      <line x1="850" y1="395" x2="1120" y2="395" strokeWidth="1.8" stroke="#ffd166" />
      <line x1="780" y1="410" x2="1180" y2="410" strokeWidth="2.2" stroke="#ff9f43" />
      <line x1="700" y1="430" x2="1250" y2="430" strokeWidth="1.5" />
      <line x1="620" y1="455" x2="1320" y2="455" strokeWidth="1.8" />
      <line x1="550" y1="485" x2="1400" y2="485" strokeWidth="1.2" />
      <line x1="480" y1="520" x2="1480" y2="520" strokeWidth="0.8" />
    </g>

    {/* Lilypads / Lotus flowers on the moat waters */}
    <g opacity="0.7">
      <ellipse cx="750" cy="460" rx="22" ry="5" fill="#1b4d3e" />
      <circle cx="752" cy="457" r="3" fill="#ff758c" />
      <ellipse cx="1200" cy="490" rx="30" ry="6" fill="#1b4d3e" />
      <circle cx="1203" cy="486" r="4" fill="#ff758c" />
      <ellipse cx="880" cy="530" rx="35" ry="7" fill="#1b4d3e" />
      <circle cx="882" cy="525" r="4.5" fill="#fca311" />
    </g>

    {/* 5. Traditional Khmer Lotus Border Motif Overlay */}
    <rect width="100%" height="100%" fill="url(#lotusKbach)" pointerEvents="none" />
  </svg>
);

export const AngkorBannerArtwork: React.FC<AngkorBannerArtworkProps> = ({
  bannerUrl,
  bannerType = 'angkor_twilight',
  className = 'absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none',
  overlayOpacity = 80
}) => {
  const [imageError, setImageError] = useState(false);

  // Pure Gradient Mode (if explicitly requested)
  if (bannerType === 'gradient') {
    return (
      <div className={className} aria-hidden="true">
        <div className="w-full h-full bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900" />
      </div>
    );
  }

  // Pure Vector Artwork Mode
  if (bannerType === 'angkor_vector') {
    return (
      <div className={className} aria-hidden="true">
        <AngkorWatVectorIllustration className="w-full h-full object-cover" />
        {/* Dark legibility gradient for text overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 via-45% to-slate-950/20"
          style={{ opacity: overlayOpacity / 100 }}
        />
      </div>
    );
  }

  // Determine the photo URL to display
  let photoUrl = '';

  if (bannerType === 'custom' && bannerUrl) {
    photoUrl = bannerUrl;
  } else if (bannerType && ANGKOR_PHOTO_PRESETS[bannerType as keyof typeof ANGKOR_PHOTO_PRESETS]) {
    photoUrl = ANGKOR_PHOTO_PRESETS[bannerType as keyof typeof ANGKOR_PHOTO_PRESETS].url;
  } else if (bannerUrl) {
    photoUrl = bannerUrl;
  } else {
    // Default fallback to Iconic Angkor Wat Twilight Photo
    photoUrl = ANGKOR_PHOTO_PRESETS.angkor_twilight.url;
  }

  return (
    <div className={className} aria-hidden="true">
      {/* 1. If photo fails to load or while loading, Vector Illustration provides zero-downtime cultural backdrop */}
      {imageError ? (
        <AngkorWatVectorIllustration className="w-full h-full object-cover" />
      ) : (
        <img
          src={photoUrl}
          alt="Angkor Wat Temple Banner"
          className="w-full h-full object-cover object-[center_35%] transform scale-102 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          loading="eager"
          onError={() => setImageError(true)}
        />
      )}

      {/* 2. Deep Dark Navy Gradient from Left for crisp high-contrast white text legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 via-45% to-slate-950/25"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* 3. Deep Twilight Tint overlay unifying tone */}
      <div className="absolute inset-0 bg-blue-950/25 mix-blend-multiply pointer-events-none" />

      {/* 4. Traditional Khmer Kbach Watermark (Stylized Khmer Lotus Motif on Left) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-15"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="khmerBannerKbach" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
            <g stroke="#ffffff" strokeWidth="1.2" fill="none">
              <path d="M70 40 C60 55 55 70 70 85 C85 70 80 55 70 40 Z" />
              <path d="M70 75 C55 70 40 75 35 90 C50 92 62 85 70 75 Z" />
              <path d="M70 75 C85 70 100 75 105 90 C90 92 78 85 70 75 Z" />
              <circle cx="70" cy="75" r="2.5" fill="#ffffff" fillOpacity="0.4" />
            </g>
          </pattern>
        </defs>
        <rect width="60%" height="100%" fill="url(#khmerBannerKbach)" />
      </svg>
    </div>
  );
};
