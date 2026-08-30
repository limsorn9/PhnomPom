import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export type ConfirmActionType = 'delete' | 'save' | 'approve' | 'confirm' | 'reject' | 'info' | 'primary' | 'warning';

export interface ConfirmActionConfig {
  isOpen?: boolean;
  type?: ConfirmActionType;
  intent?: ConfirmActionType | 'primary' | 'warning';
  title: string;
  message?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  dangerBadge?: string;
}

interface ConfirmActionModalProps {
  config: ConfirmActionConfig | null;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ config, onClose }) => {
  const isOpen = !!config && config.isOpen !== false;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !config?.isLoading) {
        if (config?.onCancel) config.onCancel();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, config, onClose]);

  if (!isOpen || !config) return null;

  const type = config.type || (config.intent === 'primary' ? 'save' : config.intent === 'warning' ? 'reject' : 'confirm');
  const defaultConfirmText =
    type === 'delete'
      ? 'យល់ព្រមលុប'
      : type === 'save'
      ? 'យល់ព្រមរក្សាទុក'
      : type === 'approve'
      ? 'យល់ព្រមអនុម័ត'
      : 'យល់ព្រមបន្ត';

  const defaultCancelText = 'បោះបង់ / មិនយល់ព្រម';
  const messageText = config.message || config.description || '';
  const confirmButtonText = config.confirmText || config.confirmLabel || defaultConfirmText;
  const cancelButtonText = config.cancelText || config.cancelLabel || defaultCancelText;

  // Determine theme styles based on action type
  const getTheme = () => {
    switch (type) {
      case 'delete':
      case 'reject':
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-600 animate-pulse" />,
          headerBg: 'bg-gradient-to-r from-rose-50 to-red-100 dark:from-rose-950/40 dark:to-red-950/20 border-rose-200 dark:border-rose-900/40',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          titleColor: 'text-rose-950 dark:text-rose-200',
          btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30',
          boxBorder: 'border-rose-200 dark:border-rose-900/50',
          iconBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
        };
      case 'save':
        return {
          icon: <Save className="w-6 h-6 text-blue-600" />,
          headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/40',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          titleColor: 'text-blue-950 dark:text-blue-200',
          btnConfirm: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30',
          boxBorder: 'border-blue-200 dark:border-blue-900/50',
          iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'
        };
      case 'approve':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          headerBg: 'bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-900/40',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          titleColor: 'text-emerald-950 dark:text-emerald-200',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
          boxBorder: 'border-emerald-200 dark:border-emerald-900/50',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300'
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
          headerBg: 'bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/40',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          titleColor: 'text-amber-950 dark:text-amber-200',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30',
          boxBorder: 'border-amber-200 dark:border-amber-900/50',
          iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300'
        };
    }
  };

  const theme = getTheme();

  const handleConfirmClick = async () => {
    try {
      await config.onConfirm();
    } finally {
      onClose();
    }
  };

  const handleCancelClick = () => {
    if (config.onCancel) config.onCancel();
    onClose();
  };

  return (
    <div
      id="confirm-action-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-battambang"
      onClick={(e) => {
        if (e.target === e.currentTarget && !config.isLoading) {
          handleCancelClick();
        }
      }}
    >
      <div
        id="confirm-action-dialog"
        className={`bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border ${theme.boxBorder} overflow-hidden flex flex-col transition-all transform animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${theme.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${theme.iconBg}`}>
              {theme.icon}
            </div>
            <div>
              <h3 className={`text-base font-bold font-moul ${theme.titleColor}`}>
                {config.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                ការផ្ទៀងផ្ទាត់សកម្មភាព • Confirmation Required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={config.isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-sm">
            <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="leading-relaxed font-medium">
                {messageText}
              </p>
              {config.itemName && (
                <div className="inline-block mt-2 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100">
                  {config.itemName}
                </div>
              )}
            </div>
          </div>

          {type === 'delete' && (
            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ចំណាំ៖ ទិន្នន័យដែលបានលុបនឹងត្រូវកត់ត្រាក្នុងប្រវត្តិសវនកម្ម (Audit Log) របស់សាលា។</span>
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={config.isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={config.isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${theme.btnConfirm}`}
          >
            {config.isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              theme.icon
            )}
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
