import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleSwitchProps {
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  showLabel = false,
  className = '',
  size = 'md'
}) => {
  const { isDarkMode, toggleDarkMode, language } = useSchool();

  const isKhmer = language === 'km';

  const sizeClasses = {
    sm: 'w-12 h-6.5 p-0.5',
    md: 'w-15 h-8 p-1',
    lg: 'w-18 h-9.5 p-1'
  };

  const thumbSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7.5 h-7.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const translateClasses = {
    sm: isDarkMode ? 'translate-x-5.5' : 'translate-x-0',
    md: isDarkMode ? 'translate-x-7' : 'translate-x-0',
    lg: isDarkMode ? 'translate-x-8.5' : 'translate-x-0'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        id="theme-toggle-switch"
        type="button"
        role="switch"
        aria-checked={isDarkMode}
        aria-label={
          isDarkMode
            ? isKhmer ? 'ប្តូរទៅពន្លឺថ្ងៃ (Light Mode)' : 'Switch to Light Mode'
            : isKhmer ? 'ប្តូរទៅផ្ទៃងងឹត (Night / Dark Mode)' : 'Switch to Dark Mode'
        }
        onClick={toggleDarkMode}
        className={`relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          sizeClasses[size]
        } ${
          isDarkMode
            ? 'bg-slate-800 border border-slate-700 shadow-inner'
            : 'bg-amber-100/90 border border-amber-300 shadow-xs'
        }`}
        title={
          isDarkMode
            ? isKhmer ? 'ប្តូរទៅទម្រង់ពន្លឺ (Light Mode)' : 'Switch to Light Mode'
            : isKhmer ? 'ប្តូរទៅទម្រង់ងងឹត (Dark Mode)' : 'Switch to Dark Mode'
        }
      >
        {/* Background icon indicator */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 text-xs pointer-events-none">
          <Sun
            className={`${iconSizes[size]} text-amber-500 transition-opacity duration-300 ${
              isDarkMode ? 'opacity-30' : 'opacity-100'
            }`}
          />
          <Moon
            className={`${iconSizes[size]} text-indigo-400 transition-opacity duration-300 ${
              isDarkMode ? 'opacity-100' : 'opacity-30'
            }`}
          />
        </div>

        {/* Sliding Thumb Knob */}
        <span
          className={`pointer-events-none transform rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center transition-transform duration-300 ease-spring ${
            thumbSizeClasses[size]
          } ${translateClasses[size]}`}
        >
          {isDarkMode ? (
            <Moon className={`${iconSizes[size]} text-indigo-400`} />
          ) : (
            <Sun className={`${iconSizes[size]} text-amber-500`} />
          )}
        </span>
      </button>

      {showLabel && (
        <span
          onClick={toggleDarkMode}
          className="text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200 hidden sm:inline"
        >
          {isDarkMode
            ? isKhmer ? 'ផ្ទៃងងឹត (Dark)' : 'Dark'
            : isKhmer ? 'ពន្លឺ (Light)' : 'Light'}
        </span>
      )}
    </div>
  );
};
