import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, AlertTriangle, RefreshCw, LogOut, ShieldAlert, UserCheck } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export const SessionExpirationModal: React.FC = () => {
  const {
    currentUser,
    isSessionWarningOpen,
    sessionSecondsRemaining,
    extendSession,
    logoutApp,
    closeSessionWarning
  } = useSchool();

  const formattedTime = useMemo(() => {
    const mins = Math.floor(sessionSecondsRemaining / 60);
    const secs = sessionSecondsRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [sessionSecondsRemaining]);

  const percentage = Math.min(100, Math.max(0, (sessionSecondsRemaining / 120) * 100));
  const isUrgent = sessionSecondsRemaining <= 30;

  if (!isSessionWarningOpen || !currentUser) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden z-10"
          id="session-expiration-warning-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-warning-title"
        >
          {/* Top Status Bar Indicator */}
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              className={`h-full transition-all duration-1000 ${
                isUrgent ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="p-6 sm:p-8">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl flex-shrink-0 ${
                isUrgent
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}>
                {isUrgent ? <ShieldAlert className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>

              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 mb-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  សុវត្ថិភាពគណនី (Session Security)
                </span>
                <h3 id="session-warning-title" className="text-xl font-bold text-slate-900 dark:text-white">
                  ការជូនដំណឹងអំពីការផុតកំណត់នៃ Session
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Session Expiration Warning
                </p>
              </div>
            </div>

            {/* Countdown Badge & Explanation */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
                  isUrgent ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {formattedTime}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">នៅសល់ពេល</div>
                  <div>មុនពេលចាកចេញស្វ័យប្រវត្ត</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-medium truncate max-w-[120px]">{currentUser.nameKhmer}</span>
              </div>
            </div>

            {/* Explanatory Message */}
            <div className="mt-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>
                Session នៃគណនីរបស់អ្នកជិតផុតកំណត់ក្នុងរយៈពេល <strong className="text-amber-600 dark:text-amber-400 font-semibold">២ នាទីទៀត</strong> ដោយសារគ្មានសកម្មភាពថ្មីៗ។
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ដើម្បីរក្សាសុវត្ថិភាពទិន្នន័យសាលារៀន ប្រព័ន្ធនឹងចាកចេញដោយស្វ័យប្រវត្តិនៅពេលអស់ពេលវេលា។ សូមចុច <strong>«បន្តការចូលប្រើ (Extend Session)»</strong> ដើម្បីបន្តការងារដោយមិនបាច់ចូលប្រព័ន្ធម្ដងទៀត។
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                id="btn-logout-session-expired"
                onClick={logoutApp}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <LogOut className="w-4 h-4" />
                <span>ចាកចេញឥឡូវនេះ</span>
              </button>

              <button
                type="button"
                id="btn-extend-session"
                onClick={extendSession}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                autoFocus
              >
                <RefreshCw className="w-4 h-4" />
                <span>បន្តការចូលប្រើ (+១៥ នាទី)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
