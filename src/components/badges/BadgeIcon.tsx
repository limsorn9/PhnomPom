import React from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Heart,
  Users,
  TreePine,
  Flame,
  Medal,
  Target,
  Star,
  Compass,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { BadgeTier } from '../../types';

interface BadgeIconProps {
  iconName: string;
  tier?: BadgeTier | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTierGlow?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Heart,
  Users,
  TreePine,
  Flame,
  Medal,
  Target,
  Star,
  Compass,
  CheckCircle2
};

export const getTierStyle = (tier: BadgeTier | string = 'gold') => {
  switch (tier) {
    case 'diamond':
      return {
        tierNameKhmer: 'ពេជ្រ (Diamond)',
        border: 'border-cyan-400',
        bgGradient: 'from-cyan-400 via-sky-500 to-blue-600',
        ring: 'ring-cyan-300 ring-offset-1',
        text: 'text-cyan-800',
        pillBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.45)]'
      };
    case 'platinum':
      return {
        tierNameKhmer: 'ផ្លាទីន (Platinum)',
        border: 'border-purple-300',
        bgGradient: 'from-purple-400 via-indigo-500 to-fuchsia-600',
        ring: 'ring-purple-300 ring-offset-1',
        text: 'text-purple-800',
        pillBg: 'bg-purple-100 text-purple-900 border-purple-300',
        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.35)]'
      };
    case 'gold':
      return {
        tierNameKhmer: 'មាស (Gold)',
        border: 'border-amber-400',
        bgGradient: 'from-amber-300 via-amber-500 to-yellow-600',
        ring: 'ring-amber-300 ring-offset-1',
        text: 'text-amber-900',
        pillBg: 'bg-amber-100 text-amber-900 border-amber-300',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]'
      };
    case 'silver':
      return {
        tierNameKhmer: 'ប្រាក់ (Silver)',
        border: 'border-slate-300',
        bgGradient: 'from-slate-300 via-slate-400 to-slate-600',
        ring: 'ring-slate-300 ring-offset-1',
        text: 'text-slate-800',
        pillBg: 'bg-slate-100 text-slate-900 border-slate-300',
        glow: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]'
      };
    case 'bronze':
    default:
      return {
        tierNameKhmer: 'សំរឹទ្ធ (Bronze)',
        border: 'border-orange-300',
        bgGradient: 'from-orange-300 via-amber-700 to-orange-800',
        ring: 'ring-orange-300 ring-offset-1',
        text: 'text-orange-950',
        pillBg: 'bg-orange-100 text-orange-900 border-orange-300',
        glow: 'shadow-[0_0_8px_rgba(234,88,12,0.25)]'
      };
  }
};

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  iconName,
  tier = 'gold',
  size = 'md',
  className = '',
  showTierGlow = false
}) => {
  const IconComponent = iconMap[iconName] || Trophy;
  const tierStyle = getTierStyle(tier);

  const sizeClasses = {
    xs: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5', ring: 'ring-1' },
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', ring: 'ring-2' },
    md: { box: 'w-11 h-11', icon: 'w-5.5 h-5.5', ring: 'ring-2' },
    lg: { box: 'w-14 h-14', icon: 'w-7 h-7', ring: 'ring-4' },
    xl: { box: 'w-20 h-20', icon: 'w-10 h-10', ring: 'ring-4' }
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr ${tierStyle.bgGradient} text-white shadow-md ${
        sizeClasses.box
      } ${sizeClasses.ring} ${tierStyle.ring} ${showTierGlow ? tierStyle.glow : ''} ${className}`}
    >
      <IconComponent className={`${sizeClasses.icon} drop-shadow-xs`} />
      {tier === 'diamond' && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-200 rounded-full animate-ping" />
      )}
    </div>
  );
};
