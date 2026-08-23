import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle2, FileCheck } from 'lucide-react';

interface PrintOptimizedBadgeProps {
  className?: string;
  isPrintModalActive?: boolean;
}

export const PrintOptimizedBadge: React.FC<PrintOptimizedBadgeProps> = ({
  className = '',
  isPrintModalActive = false
}) => {
  const [isPrintMedia, setIsPrintMedia] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQueryList = window.matchMedia('print');
    
    // Initial check
    setIsPrintMedia(mediaQueryList.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPrintMedia(e.matches);
    };

    // Modern and fallback listeners
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // @ts-ignore
      mediaQueryList.addListener(handleChange);
    }

    // Window beforeprint & afterprint listeners
    const handleBeforePrint = () => setIsPrintMedia(true);
    const handleAfterPrint = () => setIsPrintMedia(false);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore
        mediaQueryList.removeListener(handleChange);
      }
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const isOptimized = isPrintMedia || isPrintModalActive;

  return (
    <div
      id="activity-print-ready-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-xs border ${
        isOptimized
          ? 'bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-300/60 animate-pulse'
          : 'bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
      } ${className}`}
      title={
        isOptimized
          ? 'ប្រព័ន្ធបានកំណត់រចនាប័ទ្មសមស្របសម្រាប់ទំហំក្រដាស A4 រួចរាល់ (Print & PDF Optimized)'
          : 'ទិដ្ឋភាពនេះត្រូវបានរៀបចំរួចជាស្រេចសម្រាប់ការបោះពុម្ព & នាំចេញជា PDF (Print Ready)'
      }
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isOptimized ? 'bg-white' : 'bg-emerald-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOptimized ? 'bg-white' : 'bg-emerald-500'
          }`}
        />
      </span>

      <Printer className="w-3.5 h-3.5" />

      <span>
        {isOptimized ? 'Print Ready (A4 Optimized)' : 'A4 Ready'}
      </span>

      {isOptimized && (
        <CheckCircle2 className="w-3 h-3 text-white" />
      )}
    </div>
  );
};
