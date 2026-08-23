import React from 'react';
import { AppUser } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getSavedPasswordPolicy } from './PasswordStrengthIndicator';

interface SecurityHealthBadgeProps {
  user: AppUser | null;
  variant?: 'badge' | 'card' | 'compact';
  onOpenMfa?: () => void;
  onChangePassword?: () => void;
  onReviewSecurityLogs?: () => void;
}

export interface SecurityHealthScore {
  score: number; // 0 - 100
  level: 'excellent' | 'good' | 'risk';
  labelKhmer: string;
  hasMfa: boolean;
  isPasswordFresh: boolean;
  hasReviewedLogs: boolean;
  daysSincePasswordChange: number;
}

export function calculateSecurityHealth(user: AppUser | null): SecurityHealthScore {
  if (!user) {
    return {
      score: 0,
      level: 'risk',
      labelKhmer: 'មិនទាន់វាយតម្លៃ (Unrated)',
      hasMfa: false,
      isPasswordFresh: false,
      hasReviewedLogs: false,
      daysSincePasswordChange: 999
    };
  }

  const policy = getSavedPasswordPolicy();
  const maxDays = policy.expirationDays > 0 ? policy.expirationDays : 90;

  // 1. MFA Evaluation (+35 points)
  const hasMfa = !!user.mfaConfig?.enabled;

  // 2. Password Freshness Evaluation (+35 points)
  const pwDateStr = user.passwordUpdatedAt || user.createdAt;
  let daysSincePasswordChange = 95;
  if (pwDateStr) {
    const diffMs = Date.now() - new Date(pwDateStr).getTime();
    daysSincePasswordChange = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
  const isPasswordFresh = daysSincePasswordChange <= maxDays && !user.forcePasswordChange;

  // 3. Security Review Evaluation (+30 points)
  // Check if user reviewed security logs within the last 30 days
  let hasReviewedLogs = false;
  if (user.lastSecurityReviewDate) {
    const diffMs = Date.now() - new Date(user.lastSecurityReviewDate).getTime();
    const daysSinceReview = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    hasReviewedLogs = daysSinceReview <= 30;
  } else {
    // If user has active verified session today
    hasReviewedLogs = false;
  }

  let score = 0;
  if (hasMfa) score += 35;
  if (isPasswordFresh) score += 35;
  if (hasReviewedLogs) score += 30;

  let level: 'excellent' | 'good' | 'risk' = 'risk';
  let labelKhmer = 'ប្រឈមហានិភ័យ (At Risk)';

  if (score >= 90) {
    level = 'excellent';
    labelKhmer = 'សុវត្ថិភាពល្អឥតខ្ចោះ (Excellent)';
  } else if (score >= 60) {
    level = 'good';
    labelKhmer = 'សុវត្ថិភាពមធ្យម (Good / Moderate)';
  }

  return {
    score,
    level,
    labelKhmer,
    hasMfa,
    isPasswordFresh,
    hasReviewedLogs,
    daysSincePasswordChange
  };
}

export const SecurityHealthBadge: React.FC<SecurityHealthBadgeProps> = ({
  user,
  variant = 'badge',
  onOpenMfa,
  onChangePassword,
  onReviewSecurityLogs
}) => {
  const health = calculateSecurityHealth(user);

  const getBadgeStyles = () => {
    switch (health.level) {
      case 'excellent':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
          dot: 'bg-emerald-500',
          progressColor: 'bg-emerald-500'
        };
      case 'good':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <Shield className="w-3.5 h-3.5 text-blue-600" />,
          dot: 'bg-blue-500',
          progressColor: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
          dot: 'bg-rose-500',
          progressColor: 'bg-rose-500'
        };
    }
  };

  const style = getBadgeStyles();

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg}`}
        title={`ពិន្ទុសុវត្ថិភាព Security Health: ${health.score}/100`}
      >
        {style.icon}
        <span>{health.score}%</span>
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border shadow-xs ${style.bg}`}
      >
        <div className="flex items-center gap-1.5">
          {style.icon}
          <span>Security Health:</span>
          <span className="font-mono">{health.score}/100</span>
        </div>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      </div>
    );
  }

  // Expanded Dashboard Profile Card Variant
  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 font-kantumruy">
      {/* Top Header with Score Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.bg}`}>
            {style.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                កម្រិតសុវត្ថិភាពគណនី (Security Health Score)
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${style.bg}`}>
                {health.labelKhmer}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              វាយតម្លៃលើកត្តា 3FA/MFA, ភាពថ្មីនៃពាក្យសម្ងាត់ និងការត្រួតពិនិត្យកំណត់ត្រា
            </p>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="flex items-baseline gap-1 self-start sm:self-auto">
          <span className="text-2xl font-black font-mono text-slate-800">{health.score}</span>
          <span className="text-xs text-slate-500 font-bold">/100</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-500 ${style.progressColor}`}
          style={{ width: `${health.score}%` }}
        />
      </div>

      {/* 3 Verification Pillars Checklist & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
        {/* Pillar 1: MFA / 2FA */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
          health.hasMfa ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11.5px] text-slate-800 flex items-center gap-1.5">
                {health.hasMfa ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                1. កិច្ចការពារ 2FA / MFA
              </span>
              <span className="text-[10px] font-bold font-mono text-slate-600">+35%</span>
            </div>
            <p className="text-[10.5px] text-slate-600 mt-1">
              {health.hasMfa
                ? 'បានបើកដំណើរការផ្ទៀងផ្ទាត់ ២ ជំហាន (Active)'
                : 'មិនទាន់បានបើកដំណើរការ 2FA (TOTP/SMS) នៅឡើយទេ'}
            </p>
          </div>

          {!health.hasMfa && onOpenMfa && (
            <button
              type="button"
              onClick={onOpenMfa}
              className="mt-1 text-[10.5px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <span>បើកដំណើរការ 2FA ឥឡូវនេះ</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pillar 2: Password Freshness */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
          health.isPasswordFresh ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11.5px] text-slate-800 flex items-center gap-1.5">
                {health.isPasswordFresh ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                )}
                2. ពាក្យសម្ងាត់ទើបប្តូរថ្មី
              </span>
              <span className="text-[10px] font-bold font-mono text-slate-600">+35%</span>
            </div>
            <p className="text-[10.5px] text-slate-600 mt-1">
              {health.isPasswordFresh
                ? `បានផ្លាស់ប្តូរ ${health.daysSincePasswordChange} ថ្ងៃមុន (បំពេញតាមគោលការណ៍)`
                : `មិនបានផ្លាស់ប្តូរជាង ${health.daysSincePasswordChange} ថ្ងៃ ឬដល់ពេលផ្លាស់ប្តូរ`}
            </p>
          </div>

          {!health.isPasswordFresh && onChangePassword && (
            <button
              type="button"
              onClick={onChangePassword}
              className="mt-1 text-[10.5px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pillar 3: Security Review Logs */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
          health.hasReviewedLogs ? 'bg-emerald-50/60 border-emerald-200' : 'bg-blue-50/60 border-blue-200'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11.5px] text-slate-800 flex items-center gap-1.5">
                {health.hasReviewedLogs ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                )}
                3. ពិនិត្យកំណត់ត្រា & សម័យកាល
              </span>
              <span className="text-[10px] font-bold font-mono text-slate-600">+30%</span>
            </div>
            <p className="text-[10.5px] text-slate-600 mt-1">
              {health.hasReviewedLogs
                ? 'បានត្រួតពិនិត្យកំណត់ត្រាចូលប្រើ និង Sessions ក្នុងរយៈពេល 30 ថ្ងៃ'
                : 'មិនទាន់បានពិនិត្យមើល Logs សុវត្ថិភាព និងឧបករណ៍ដែលបានចូល'}
            </p>
          </div>

          {onReviewSecurityLogs && (
            <button
              type="button"
              onClick={onReviewSecurityLogs}
              className="mt-1 text-[10.5px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{health.hasReviewedLogs ? 'ពិនិត្យកំណត់ត្រាម្តងទៀត' : 'ពិនិត្យមើល Logs ឥឡូវនេះ'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
