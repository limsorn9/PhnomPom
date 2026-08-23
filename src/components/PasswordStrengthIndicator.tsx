import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck, History, AlertTriangle } from 'lucide-react';
import { AppUser, PasswordPolicyConfig } from '../types';

export const DEFAULT_PASSWORD_POLICY: PasswordPolicyConfig = {
  expirationDays: 90,
  preventRecentPasswordsCount: 3,
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxFailedAttemptsBeforeLock: 5
};

export function getSavedPasswordPolicy(): PasswordPolicyConfig {
  try {
    const saved = localStorage.getItem('moeys_password_policy');
    if (saved) {
      return { ...DEFAULT_PASSWORD_POLICY, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PASSWORD_POLICY;
}

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
  score: number; // 0 to 4
  level: 'very_weak' | 'weak' | 'medium' | 'strong';
}

export function evaluatePassword(
  password: string,
  policy?: Partial<PasswordPolicyConfig>
): PasswordValidationResult {
  const currentPolicy = { ...DEFAULT_PASSWORD_POLICY, ...(policy || getSavedPasswordPolicy()) };
  const minLength = currentPolicy.minLength || 8;

  const hasMinLength = password.length >= minLength;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasLower && hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let level: 'very_weak' | 'weak' | 'medium' | 'strong' = 'very_weak';
  if (score === 4 && password.length >= minLength + 2) {
    level = 'strong';
  } else if (score >= 3) {
    level = 'medium';
  } else if (score >= 2) {
    level = 'weak';
  } else {
    level = 'very_weak';
  }

  // Strict enforcement against policy requirements
  const satisfiesLower = currentPolicy.requireLowercase ? hasLower : true;
  const satisfiesUpper = currentPolicy.requireUppercase ? hasUpper : true;
  const satisfiesNumber = currentPolicy.requireNumbers ? hasNumber : true;
  const satisfiesSpecial = currentPolicy.requireSpecialChars ? hasSpecial : true;

  const isValid = hasMinLength && satisfiesLower && satisfiesUpper && satisfiesNumber && satisfiesSpecial;

  return {
    hasMinLength,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
    isValid,
    score,
    level
  };
}

/**
 * Checks if a new password matches the user's current password or any of their last 3 recorded previous passwords
 */
export function checkPasswordHistoryReuse(
  newPassword: string,
  user: AppUser | null,
  historyLimit: number = 3
): { isReused: boolean; isAllowed: boolean; message: string } {
  if (!newPassword || !user) {
    return { isReused: false, isAllowed: true, message: '' };
  }

  // Check current active password
  if (user.password && user.password === newPassword) {
    return {
      isReused: true,
      isAllowed: false,
      message: 'ពាក្យសម្ងាត់នេះជាពាក្យសម្ងាត់បច្ចុប្បន្នរបស់អ្នក! សូមជ្រើសរើសពាក្យសម្ងាត់ថ្មី។'
    };
  }

  // Check history of last 3 passwords
  const history = user.passwordHistory || [];
  const checkedHistory = history.slice(0, historyLimit);
  const matched = checkedHistory.some(oldPw => oldPw === newPassword);

  if (matched) {
    return {
      isReused: true,
      isAllowed: false,
      message: `ពាក្យសម្ងាត់នេះធ្លាប់បានប្រើរួចហើយនៅក្នុងប្រវត្តិនៃពាក្យសម្ងាត់ ${historyLimit} លើកចុងក្រោយ! ដើម្បីការពារសុវត្ថិភាព មិនអនុញ្ញាតឱ្យប្រើពាក្យសម្ងាត់ចាស់ឡើងវិញទេ។`
    };
  }

  return { isReused: false, isAllowed: true, message: '' };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showRules?: boolean;
  userForHistoryCheck?: AppUser | null;
  policy?: PasswordPolicyConfig;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRules = true,
  userForHistoryCheck = null,
  policy: customPolicy
}) => {
  if (!password) {
    return null;
  }

  const policy = customPolicy || getSavedPasswordPolicy();
  const result = evaluatePassword(password, policy);
  const historyCheck = checkPasswordHistoryReuse(
    password,
    userForHistoryCheck,
    policy.preventRecentPasswordsCount
  );

  const getMeterColor = () => {
    switch (result.score) {
      case 4:
        return 'bg-emerald-500';
      case 3:
        return 'bg-blue-500';
      case 2:
        return 'bg-amber-500';
      default:
        return 'bg-rose-500';
    }
  };

  const getMeterLabel = () => {
    switch (result.score) {
      case 4:
        return {
          text: 'រឹងមាំខ្លាំង (Strong / Secure)',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          percent: '100%'
        };
      case 3:
        return {
          text: 'មធ្យម (Good / Acceptable)',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          percent: '75%'
        };
      case 2:
        return {
          text: 'ខ្សោយ (Weak)',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          percent: '50%'
        };
      default:
        return {
          text: 'ខ្សោយខ្លាំង (Very Weak)',
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          percent: '25%'
        };
    }
  };

  const label = getMeterLabel();

  return (
    <div className="space-y-2.5 mt-2 p-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs transition-all animate-fade-in font-kantumruy">
      {/* Password Reuse in History Alert */}
      {historyCheck.isReused && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2.5 shadow-xs">
          <History className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11.5px] text-rose-900">
              រកឃើញការប្រើពាក្យសម្ងាត់ចាស់ឡើងវិញ (Password History Reuse)
            </p>
            <p className="text-[11px] text-rose-700 leading-relaxed">{historyCheck.message}</p>
          </div>
        </div>
      )}

      {/* Strength Bar Header & Percentage */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5">
            {result.isValid && !historyCheck.isReused ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            )}
            <span>កម្រិតសុវត្ថិភាពពាក្យសម្ងាត់ (Strength Meter):</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold font-mono text-slate-600">{label.percent}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${label.color}`}
            >
              {label.text}
            </span>
          </div>
        </div>

        {/* 4-Step Animated Visual Progress Meter */}
        <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden flex gap-1 p-0.5">
          {[1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                idx <= result.score ? getMeterColor() : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist with Interactive Visual Status */}
      {showRules && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <span>លក្ខខណ្ឌសុវត្ថិភាពកំណត់ (Complexity Requirements):</span>
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              ការពារប្រវត្តិ {policy.preventRecentPasswordsCount} លើកចុងក្រោយ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            {/* Rule 1: Min Length */}
            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
                result.hasMinLength
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-bold'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {result.hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              <span>យ៉ាងតិច {policy.minLength || 8} តួអក្សរ (≥ {policy.minLength || 8} chars)</span>
            </div>

            {/* Rule 2: Upper and Lower Case */}
            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
                result.hasLower && result.hasUpper
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-bold'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {result.hasLower && result.hasUpper ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              <span>អក្សរធំ និងអក្សរតូច (A-Z, a-z)</span>
            </div>

            {/* Rule 3: Numbers */}
            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
                result.hasNumber
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-bold'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {result.hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              <span>លេខយ៉ាងតិច ១ ខ្ទង់ (0-9)</span>
            </div>

            {/* Rule 4: Special Characters */}
            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
                result.hasSpecial
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-bold'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {result.hasSpecial ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              <span>សញ្ញាពិសេស (@, $, !, %, *, #)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
