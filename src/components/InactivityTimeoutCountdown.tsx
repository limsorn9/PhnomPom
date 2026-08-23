import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Clock, AlertTriangle, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';

export const InactivityTimeoutCountdown: React.FC = () => {
  const { currentUser, logoutApp, showToast, language } = useSchool();

  // Get policy settings
  const isEnabled = () => {
    const saved = localStorage.getItem('moeys_session_timeout_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  };

  const getTimeoutMinutes = () => {
    const saved = localStorage.getItem('moeys_session_timeout_minutes');
    return saved ? Number(saved) : 30; // default 30 minutes
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => getTimeoutMinutes() * 60);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());
  const warningThresholdSeconds = 120; // Show warning during last 2 minutes (120s)

  // Reset activity timestamp
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    const totalSecs = getTimeoutMinutes() * 60;
    setRemainingSeconds(totalSecs);
    setShowWarning(false);
  }, []);

  // Listen to user interactions to refresh timer
  useEffect(() => {
    if (!currentUser || !isEnabled()) return;

    const handleUserActivity = () => {
      // If warning modal/bar is already active, require explicit "Stay Logged In" click
      // to avoid accidental micro-mouse movements dismissing the security alert
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleUserActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [currentUser, showWarning]);

  // Main countdown timer interval
  useEffect(() => {
    if (!currentUser || !isEnabled()) {
      setShowWarning(false);
      return;
    }

    const interval = setInterval(() => {
      if (!isEnabled()) {
        setShowWarning(false);
        return;
      }

      const totalTimeoutMs = getTimeoutMinutes() * 60 * 1000;
      const elapsedMs = Date.now() - lastActivityRef.current;
      const timeLeftSec = Math.max(0, Math.ceil((totalTimeoutMs - elapsedMs) / 1000));

      setRemainingSeconds(timeLeftSec);

      if (timeLeftSec <= warningThresholdSeconds && timeLeftSec > 0) {
        setShowWarning(true);
      } else if (timeLeftSec === 0) {
        // Time expired! Log out safely
        setShowWarning(false);
        showToast(
          language === 'en'
            ? 'Session timed out due to inactivity for security reasons.'
            : 'សម័យកាលត្រូវបានកាត់ផ្តាច់ដោយសារទុកចោលមិនប្រើប្រាស់ (Inactivity Timeout) ដើម្បីធានាសុវត្ថិភាព។',
          'error'
        );
        logoutApp();
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser, logoutApp, showToast, language]);

  const handleStayLoggedIn = () => {
    resetActivity();
    showToast(
      language === 'en' ? 'Session successfully extended!' : 'បានបន្តសម័យកាលប្រើប្រាស់ដោយជោគជ័យ!',
      'success'
    );
  };

  if (!currentUser || !showWarning) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2.5 bg-amber-500/15 dark:bg-amber-950/40 border border-amber-400 dark:border-amber-600/50 px-3 py-1 rounded-xl animate-pulse text-amber-900 dark:text-amber-200 text-xs shadow-xs">
      <div className="flex items-center gap-1.5 font-bold">
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="hidden sm:inline font-battambang">
          {language === 'en' ? 'Inactivity Timeout in:' : 'ចាកចេញស្វ័យប្រវត្តិក្នង:'}
        </span>
        <span className="font-mono text-xs font-black px-1.5 py-0.5 bg-amber-500 text-white rounded-md tracking-wider">
          {formattedTime}
        </span>
      </div>

      <button
        type="button"
        onClick={handleStayLoggedIn}
        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
      >
        <RefreshCw className="w-3 h-3" />
        <span>{language === 'en' ? 'Stay Logged In' : 'បន្តការប្រើប្រាស់'}</span>
      </button>
    </div>
  );
};
