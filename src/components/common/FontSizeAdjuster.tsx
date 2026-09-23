import React, { useState, useEffect } from 'react';
import { Type, ZoomIn, ZoomOut, Check } from 'lucide-react';

export type FontSizeLevel = 'standard' | 'large' | 'xlarge' | 'huge';

export const FontSizeAdjuster: React.FC = () => {
  const [fontSize, setFontSize] = useState<FontSizeLevel>(() => {
    return (localStorage.getItem('phnom_pom_font_size') as FontSizeLevel) || 'large';
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
    localStorage.setItem('phnom_pom_font_size', fontSize);

    // Apply inline style adjustments to ensure root size instantly scales
    if (fontSize === 'standard') {
      root.style.fontSize = '18.5px';
    } else if (fontSize === 'large') {
      root.style.fontSize = '20.5px';
    } else if (fontSize === 'xlarge') {
      root.style.fontSize = '22.5px';
    } else if (fontSize === 'huge') {
      root.style.fontSize = '24.5px';
    }
  }, [fontSize]);

  const levels: { id: FontSizeLevel; label: string; px: string; desc: string }[] = [
    { id: 'standard', label: 'មធ្យម', px: '18.5px', desc: 'ទំហំល្មម' },
    { id: 'large', label: 'ធំ (លំនាំដើម)', px: '20.5px', desc: 'ច្បាស់ល្អ' },
    { id: 'xlarge', label: 'ធំខ្លាំង', px: '22.5px', desc: 'ងាយស្រួលមើល' },
    { id: 'huge', label: 'ធំបំផុត', px: '24.5px', desc: 'សម្រាប់ភ្នែកខ្សោយ' },
  ];

  return (
    <div className="relative inline-block text-left">
      <button
        id="font-size-adjuster-btn"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
        title="កែសម្រួលទំហំអក្សរ (Font Size)"
      >
        <Type className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline font-sans text-xs">A+</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-blue-600" />
                ទំហំអក្សរក្នុងប្រព័ន្ធ
              </span>
            </div>

            <div className="p-1 space-y-1">
              {levels.map((lvl) => {
                const isSelected = fontSize === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setFontSize(lvl.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-times">{lvl.label}</span>
                      <span className="text-[10px] text-slate-400">({lvl.desc})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
