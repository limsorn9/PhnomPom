import React, { useEffect } from 'react';
import { Student } from '../../types';
import {
  AlertTriangle,
  Trash2,
  X,
  GraduationCap,
  Calendar,
  User,
  Phone,
  ShieldAlert,
  Hash
} from 'lucide-react';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  student?: Student | null;
  itemName?: string;
  itemDescription?: string;
  warningMessage?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'បញ្ជាក់ការលុបទិន្នន័យសិស្ស',
  student,
  itemName,
  itemDescription,
  warningMessage = 'តើលោកអ្នកពិតជាចង់លុបទិន្នន័យនេះចេញពីប្រព័ន្ធមែនឬទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។',
  confirmText = 'បញ្ជាក់ការលុប',
  cancelText = 'បោះបង់ / រក្សាទុក',
  isLoading = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="confirm-delete-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        id="confirm-delete-modal"
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/50 overflow-hidden flex flex-col transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Header with Danger Accent */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/20 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950 dark:text-rose-200 font-moul">
                {title}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                ការផ្ទៀងផ្ទាត់សុវត្ថិភាពទិន្នន័យ • Permanent Record Removal
              </p>
            </div>
          </div>
          <button
            id="close-confirm-delete-btn"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Main Warning Text */}
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              {warningMessage}
            </p>
          </div>

          {/* Student Profile Card (if student provided) */}
          {student && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 space-y-3">
              <div className="flex items-center gap-3.5">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.nameKhmer}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-lg flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-xs">
                    {student.nameKhmer.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {student.nameKhmer}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      student.gender === 'F'
                        ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}>
                      {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                    </span>
                  </div>
                  {student.nameLatin && (
                    <p className="text-xs font-times text-slate-500 dark:text-slate-400">
                      {student.nameLatin}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 font-mono font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300">
                      <Hash className="w-3 h-3" /> {student.code || student.id}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      <GraduationCap className="w-3 h-3" /> ថ្នាក់ទី {student.grade}{student.section}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra Details Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>ថ្ងៃកំណើត: <strong>{student.dob}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">អាណាព្យាបាល: <strong>{student.guardianName || student.fatherName || student.motherName || 'N/A'}</strong></span>
                </div>
                {(student.guardianPhone || student.phone) && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>ទូរស័ព្ទ: <strong className="font-mono">{student.guardianPhone || student.phone}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Item Name / Description if custom non-student */}
          {!student && itemName && (
            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">ទិន្នន័យដែលត្រូវលុប៖</p>
              <p className="font-bold text-slate-800 dark:text-white text-sm">{itemName}</p>
              {itemDescription && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{itemDescription}</p>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            * ការបញ្ជាក់នេះធ្វើឡើងដើម្បីការពារការបាត់បង់ទិន្នន័យសិស្សដែលបានបញ្ចូលដោយដៃដោយអចេតនា។
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-end gap-3">
          <button
            id="cancel-delete-action-btn"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            {cancelText}
          </button>
          <button
            id="confirm-delete-action-btn"
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
