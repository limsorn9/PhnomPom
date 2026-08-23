import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

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

export function evaluatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
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
  if (score === 4 && password.length >= 10) {
    level = 'strong';
  } else if (score >= 3) {
    level = 'medium';
  } else if (score >= 2) {
    level = 'weak';
  } else {
    level = 'very_weak';
  }

  // Strict enforcement: minimum length >= 8, numbers, special characters, and both upper & lower case
  const isValid = hasMinLength && (hasLower && hasUpper) && hasNumber && hasSpecial;

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

interface PasswordStrengthIndicatorProps {
  password: string;
  showRules?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRules = true
}) => {
  if (!password) {
    return null;
  }

  const result = evaluatePassword(password);

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
        return { text: 'រឹងមាំខ្លាំង (Strong / Secure)', color: 'text-emerald-700' };
      case 3:
        return { text: 'មធ្យម (Good / Acceptable)', color: 'text-blue-700' };
      case 2:
        return { text: 'ខ្សោយ (Weak)', color: 'text-amber-700' };
      default:
        return { text: 'ខ្សោយខ្លាំង (Very Weak)', color: 'text-rose-700' };
    }
  };

  const label = getMeterLabel();

  return (
    <div className="space-y-2.5 mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            {result.isValid ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            )}
            កម្រិតសុវត្ថិភាពពាក្យសម្ងាត់ (Strength):
          </span>
          <span className={`text-[11px] font-bold ${label.color}`}>{label.text}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
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

      {/* Rules Checklist */}
      {showRules && (
        <div className="space-y-1 pt-1 border-t border-slate-200/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            លក្ខខណ្ឌសុវត្ថិភាពជាកាតព្វកិច្ច (Requirements):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
            <div
              className={`flex items-center gap-1.5 ${
                result.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              {result.hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>យ៉ាងតិច ៨ តួអក្សរ (≥ 8 chars)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                result.hasLower && result.hasUpper
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-500'
              }`}
            >
              {result.hasLower && result.hasUpper ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>អក្សរធំ និងអក្សរតូច (A-Z, a-z)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                result.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              {result.hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>លេខយ៉ាងតិច ១ ខ្ទង់ (0-9)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                result.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              {result.hasSpecial ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>សញ្ញាពិសេស (@, $, !, %, *, #)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
