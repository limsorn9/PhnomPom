import React, { useState } from 'react';
import { AppUser } from '../types';
import {
  Trash2,
  AlertTriangle,
  X,
  Clock,
  ShieldAlert,
  Check,
  User,
  Info
} from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  onConfirmDelete: (userId: string, reason: string) => void;
}

const PRESET_REASONS = [
  'ផ្ទេរទៅបង្រៀននៅសាលាផ្សេង',
  'ចូលនិវត្តន៍ ឬឈប់បង្រៀន',
  'គណនីស្ទួន ឬបង្កើតច្រឡំ',
  'ចប់កិច្ចសន្យាការងារ',
  'កែសម្រួលរចនាសម្ព័ន្ធបុគ្គលិក',
  'ផ្អាកការបង្រៀនបណ្តោះអាសន្ន'
];

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmDelete
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const handlePresetClick = (preset: string) => {
    setReason(preset);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('សូមបញ្ជាក់មូលហេតុនៃការលុបគណនីជាមុនសិន!');
      return;
    }
    setIsSubmitting(true);
    onConfirmDelete(user.id, reason.trim());
    setIsSubmitting(false);
    onClose();
  };

  const getRoleBadgeLabel = (role: string) => {
    switch (role) {
      case 'director': return 'នាយកសាលា';
      case 'teacher': return 'គ្រូបង្រៀន';
      case 'secretary': return 'លេខាធិការ';
      case 'librarian': return 'បណ្ណារក្ស';
      case 'student': return 'សិស្ស';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-sm text-rose-950">
                បញ្ជាក់ការលុបគណនី (Confirm Deletion)
              </h3>
              <p className="text-xs text-rose-700">
                ការលុបនឹងត្រូវកត់ត្រាក្នុង Audit Log និងរក្សាទុកក្នុងធុងសំរាម ៣០ ថ្ងៃ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Target Account Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3.5">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={user.nameKhmer}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm truncate">{user.nameKhmer}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {getRoleBadgeLabel(user.role)}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email || user.phone || user.username}</p>
              {user.staffCode && (
                <p className="text-[11px] text-slate-400">អត្តលេខ: {user.staffCode}</p>
              )}
            </div>
          </div>

          {/* Soft Delete Retention Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold">ការរក្សាសុវត្ថិភាពទិន្នន័យ (30-Day Soft Delete):</p>
              <p className="leading-relaxed text-[11px]">
                គណនីនេះនឹងមិនបាត់បង់ទិន្នន័យភ្លាមៗឡើយ ដោយត្រូវបានរក្សាទុកក្នុង <b>«ធុងសំរាម (Recently Deleted)»</b> រយៈពេល <b>៣០ ថ្ងៃ</b>។ លោកអ្នកអាចចុច «ស្តារឡើងវិញ (Restore)» មកវិញបានគ្រប់ពេលវេលា។
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              មូលហេតុនៃការលុបគណនី (Reason for Deletion) <span className="text-rose-500">*</span>:
            </label>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                    reason === preset
                      ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              rows={3}
              placeholder="សូមបញ្ជាក់មូលហេតុលម្អិតសម្រាប់ការកត់ត្រាក្នុងសវនកម្ម (Audit Log)..."
              className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 focus:outline-none placeholder:text-slate-400"
              required
            />
            {errorMsg && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>លុប & ផ្លាស់ទីទៅធុងសំរាម</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
