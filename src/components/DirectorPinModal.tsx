import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Delete,
  CornerDownLeft,
  Info
} from 'lucide-react';

export const DirectorPinModal: React.FC = () => {
  const {
    isDirectorPinModalOpen,
    closeDirectorPinModal,
    switchToDirectorWithPin,
    directorPinModalTargetAction,
    directorPin,
    schoolProfile
  } = useSchool();

  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset when modal opens
  useEffect(() => {
    if (isDirectorPinModalOpen) {
      setPinInput('');
      setErrorMessage('');
      setShowPin(false);
      setSuccessAnimation(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isDirectorPinModalOpen]);

  if (!isDirectorPinModalOpen) return null;

  const handleVerify = () => {
    if (!pinInput.trim()) {
      setErrorMessage('សូមបញ្ចូលលេខកូដសម្ងាត់ ឬពាក្យសម្ងាត់នាយកសាលា!');
      inputRef.current?.focus();
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      const result = switchToDirectorWithPin(pinInput);
      if (result.success) {
        setSuccessAnimation(true);
        setTimeout(() => {
          setIsVerifying(false);
        }, 400);
      } else {
        setIsVerifying(false);
        setErrorMessage(result.message || 'លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ!');
        inputRef.current?.focus();
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    } else if (e.key === 'Escape') {
      closeDirectorPinModal();
    }
  };

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 20) {
      setPinInput(prev => prev + num);
      setErrorMessage('');
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMessage('');
  };

  const handleUseDefaultPin = () => {
    setPinInput(directorPin || '1212');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-200/60 dark:border-amber-900/40 overflow-hidden">
        {/* Top Gold Security Accent Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-wide">
                {directorPinModalTargetAction?.title || 'ផ្ទៀងផ្ទាត់លេខកូដសម្ងាត់នាយក'}
              </h3>
              <p className="text-amber-100 text-xs">
                សិទ្ធិអំណាចពេញលេញទូទាំងប្រព័ន្ធគ្រប់គ្រងសាលារៀន
              </p>
            </div>
          </div>
          <button
            onClick={closeDirectorPinModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="បិទ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Security Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
              <span className="font-bold">មុខងារនាយកសាលា</span> គឺជាតួនាទីកំពូលដែលមានសិទ្ធិចូលមើល និងកែសម្រួលគ្រប់ផ្នែកទាំងអស់ (សិស្ស, គ្រូ, ពិន្ទុ, ថវិកា, និងការកំណត់)។
            </div>
          </div>

          {/* Password / PIN Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>បញ្ចូលលេខកូដ PIN ឬពាក្យសម្ងាត់នាយក</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPin ? 'លាក់' : 'បង្ហាញ'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setErrorMessage('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="បញ្ចូលកូដ PIN ៤ ខ្ទង់ ឬ Password..."
                className={`w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                  errorMessage
                    ? 'border-red-400 focus:ring-red-400/30 text-red-600 dark:text-red-400'
                    : 'border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500/20 text-slate-800 dark:text-slate-100'
                }`}
                autoComplete="off"
              />
              {pinInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
                  title="សម្អាត"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium pt-1 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Virtual Keypad for Touch & Quick Entry */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="h-11 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 font-bold text-base shadow-sm border border-slate-200/70 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-11 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm border border-slate-200 dark:border-slate-600 active:scale-95 transition-all flex items-center justify-center"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-11 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 font-bold text-base shadow-sm border border-slate-200/70 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-11 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm border border-slate-200 dark:border-slate-600 active:scale-95 transition-all flex items-center justify-center"
                title="លុបថយក្រោយ"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Helper Default PIN Hint */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>កូដលំនាំដើម៖ <strong className="font-mono text-amber-700 dark:text-amber-400">1212</strong></span>
            </span>
            <button
              type="button"
              onClick={handleUseDefaultPin}
              className="text-amber-600 dark:text-amber-400 hover:underline font-semibold text-[11px]"
            >
              បញ្ចូលកូដលំនាំដើម
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeDirectorPinModal}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || successAnimation}
              className={`flex-1 py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                successAnimation
                  ? 'bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 shadow-amber-500/20 active:scale-95'
              }`}
            >
              {successAnimation ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                  <span>ត្រឹមត្រូវ! កំពុងចូល...</span>
                </>
              ) : isVerifying ? (
                <span>កំពុងផ្ទៀងផ្ទាត់...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>ផ្ទៀងផ្ទាត់ & ចូលមុខងារនាយក</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
