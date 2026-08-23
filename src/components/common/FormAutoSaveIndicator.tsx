import React from 'react';
import { Save, CheckCircle2, RotateCcw, AlertCircle, Clock } from 'lucide-react';

interface FormAutoSaveIndicatorProps {
  hasSavedDraft: boolean;
  lastSavedTime: Date | null;
  isSaving?: boolean;
  onDiscardDraft?: () => void;
  className?: string;
  isEditing?: boolean;
}

export const FormAutoSaveIndicator: React.FC<FormAutoSaveIndicatorProps> = ({
  hasSavedDraft,
  lastSavedTime,
  isSaving = false,
  onDiscardDraft,
  className = '',
  isEditing = false
}) => {
  if (isEditing) {
    return null; // Don't show new draft indicator during existing entity editing
  }

  const formatSavedTime = (date: Date | null): string => {
    if (!date) return '';
    try {
      return date.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl border text-xs transition-all ${
      hasSavedDraft
        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400'
    } ${className}`}>
      <div className="flex items-center gap-2">
        {isSaving ? (
          <>
            <Save className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              កំពុងរក្សាទុកព្រាងស្វ័យប្រវត្តិ (Auto-saving)...
            </span>
          </>
        ) : hasSavedDraft ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-amber-950 dark:text-amber-100">
                បានរក្សាទុកព្រាងស្វ័យប្រវត្តិក្នុង Local Storage
              </span>
              {lastSavedTime && (
                <span className="text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  ម៉ោង {formatSavedTime(lastSavedTime)}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>ប្រព័ន្ធការពារការបាត់បង់ទិន្នន័យ (Auto-save) កំពុងដំណើរការ</span>
          </>
        )}
      </div>

      {hasSavedDraft && onDiscardDraft && (
        <button
          type="button"
          onClick={onDiscardDraft}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:text-rose-800 bg-white dark:bg-slate-800 rounded-lg border border-rose-200 dark:border-rose-800 shadow-2xs hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
          title="លុបទិន្នន័យព្រាង និងចាប់ផ្តើមបំពេញឡើងវិញ"
        >
          <RotateCcw className="w-3 h-3" />
          <span>សម្អាតទិន្នន័យព្រាង (Discard Draft)</span>
        </button>
      )}
    </div>
  );
};
