import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { generateTelegramVerificationCode, verifyTelegramCode } from '../services/telegramService';

interface VerifyActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionTitle: string;
  actionDescription: string;
  userEmail?: string;
}

export const VerifyActionsModal: React.FC<VerifyActionsModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  actionTitle,
  actionDescription,
  userEmail = 'limsorn9@gmail.com',
}) => {
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRequestCode = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateTelegramVerificationCode(userEmail, `${actionTitle} (${actionDescription})`);
      if (res.success) {
        setStep('verify');
        if (res.debugCode) {
          setDebugCode(res.debugCode);
        }
      } else {
        setErrorMsg(res.message || 'បរាជ័យក្នុងការស្នើសុំកូដ');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'កំហុសក្នុងការតភ្ជាប់');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length !== 6) {
      setErrorMsg('សូមបញ្ចូលលេខកូដសម្ងាត់ ៦ ខ្ទង់ឱ្យបានត្រឹមត្រូវ');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await verifyTelegramCode(userEmail, code.trim());
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.message || 'កូដសម្ងាត់មិនត្រឹមត្រូវ ឬផុតកំណត់');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'កំហុសក្នុងការផ្ទៀងផ្ទាត់');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="verify-actions-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-moul">ផ្ទៀងផ្ទាត់សិទ្ធិរដ្ឋបាល</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">ទាមទារកូដបញ្ជាក់ Telegram OTP សម្រាប់សកម្មភាពនេះ</p>
          </div>
        </div>

        {/* Action Info Card */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>សកម្មភាពរសើប (Sensitive Action):</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{actionTitle}</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">{actionDescription}</p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-600 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Debug code notice */}
        {debugCode && (
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl text-center space-y-1">
            <p className="text-xs text-sky-700 dark:text-sky-300 font-bold">🔐 កូដបញ្ជាក់ Telegram (Demo Mode):</p>
            <p className="text-2xl font-mono font-bold tracking-widest text-sky-600 dark:text-sky-400">{debugCode}</p>
          </div>
        )}

        {/* Body content */}
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-moul">ផ្ទៀងផ្ទាត់ជោគជ័យ!</p>
            <p className="text-xs text-slate-500">កំពុងអនុវត្តប្រតិបត្តិការរដ្ឋបាល...</p>
          </div>
        ) : step === 'request' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ដើម្បីការពារសុវត្ថិភាពទិន្នន័យសាលា ប្រព័ន្ធនឹងផ្ញើសារកូដសម្ងាត់ ៦ ខ្ទង់ ទៅកាន់គណនី Telegram Bot របស់នាយកសាលា (<span className="font-semibold text-slate-900 dark:text-white">{userEmail}</span>)។
            </p>
            <div className="flex gap-2">
              <button
                id="verify-modal-cancel-btn"
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                បោះបង់
              </button>
              <button
                id="verify-modal-send-code-btn"
                type="button"
                onClick={handleRequestCode}
                disabled={loading}
                className="w-1/2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>ផ្ញើកូដ Telegram</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                បញ្ចូលកូដសម្ងាត់ ៦ ខ្ទង់ (OTP Code)
              </label>
              <input
                id="verify-actions-code-input"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="------"
                autoFocus
                className="w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 text-center mt-1">កូដមានសុពលភាពរយៈពេល ៥ នាទី</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                ផ្ញើកូដម្តងទៀត
              </button>
              <button
                id="verify-actions-confirm-btn"
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>ផ្ទៀងផ្ទាត់ & អនុវត្ត</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
