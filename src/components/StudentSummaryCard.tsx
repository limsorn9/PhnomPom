import React from 'react';
import { Users, UserCheck, Percent, TrendingUp, Sparkles, Filter, Award, ShieldAlert } from 'lucide-react';
import { Gender } from '../types';

interface StudentSummaryCardProps {
  totalStudents: number;
  allSchoolStudentsCount: number;
  maleCount: number;
  femaleCount: number;
  malePercent: number;
  femalePercent: number;
  averageAttendanceRate: number;
  permissionRate: number;
  absentRate: number;
  activeCount?: number;
  idPoorCount: number;
  scholarshipCount: number;
  selectedGrade: number | 'all';
  selectedGender: Gender | 'all';
  selectedVulnerability: string;
  onSelectGender?: (gender: Gender | 'all') => void;
  onSelectGrade?: (grade: number | 'all') => void;
  onSelectVulnerability?: (vuln: any) => void;
}

export const StudentSummaryCard: React.FC<StudentSummaryCardProps> = ({
  totalStudents,
  allSchoolStudentsCount,
  maleCount,
  femaleCount,
  malePercent,
  femalePercent,
  averageAttendanceRate,
  permissionRate,
  absentRate,
  activeCount,
  idPoorCount,
  scholarshipCount,
  selectedGrade,
  selectedGender,
  selectedVulnerability,
  onSelectGender,
  onSelectGrade,
  onSelectVulnerability
}) => {
  // SVG Circular Progress Ring Calculation
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius; // ~175.93
  const strokeDashoffset = ringCircumference - (Math.min(100, Math.max(0, averageAttendanceRate)) / 100) * ringCircumference;

  // Determine Attendance Quality Status
  const getAttendanceTheme = (rate: number) => {
    if (rate >= 95) {
      return {
        strokeColor: '#10b981', // emerald-500
        bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        label: 'ល្អប្រសើរ (Excellent)',
        ringTrack: '#d1fae5'
      };
    } else if (rate >= 88) {
      return {
        strokeColor: '#3b82f6', // blue-500
        bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
        badgeBg: 'bg-blue-100 text-blue-800',
        label: 'ល្អបង្គួរ (Good)',
        ringTrack: '#dbeafe'
      };
    } else if (rate >= 75) {
      return {
        strokeColor: '#f59e0b', // amber-500
        bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-800',
        label: 'មធ្យម (Moderate)',
        ringTrack: '#fef3c7'
      };
    } else {
      return {
        strokeColor: '#ef4444', // red-500
        bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
        badgeBg: 'bg-rose-100 text-rose-800',
        label: 'ត្រូវការកែលម្អ (Needs Attention)',
        ringTrack: '#ffe4e6'
      };
    }
  };

  const attendanceTheme = getAttendanceTheme(averageAttendanceRate);
  const isFiltered = totalStudents !== allSchoolStudentsCount || selectedGrade !== 'all' || selectedGender !== 'all' || selectedVulnerability !== 'all';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Total Students Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-blue-300 transition-all">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -z-10 group-hover:bg-blue-100/60 transition-colors pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  ទិន្នន័យសិស្សសរុប
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {selectedGrade === 'all' ? 'គ្រប់កម្រិតថ្នាក់' : `សិស្សថ្នាក់ទី ${selectedGrade}`}
                </span>
              </div>
            </div>

            {isFiltered && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                តម្រងសកម្ម
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-times tracking-tight">
              {totalStudents}
            </span>
            <span className="text-xs font-bold text-slate-600">នាក់</span>
            {totalStudents !== allSchoolStudentsCount && (
              <span className="text-[11px] text-slate-400 font-times">
                (នៃសរុប {allSchoolStudentsCount} នាក់)
              </span>
            )}
          </div>
        </div>

        {/* Breakdown chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>កំពុងរៀន: <strong className="font-times">{activeCount ?? totalStudents}</strong></span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>ក្រីក្រ (IDPoor): <strong className="font-times">{idPoorCount}</strong></span>
          </span>
          {scholarshipCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-100 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>អាហារូបករណ៍: <strong className="font-times">{scholarshipCount}</strong></span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Gender Distribution Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-indigo-300 transition-all">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  សមាមាត្រយេនឌ័រ
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  ការបែងចែកភេទ (Gender Ratio)
                </span>
              </div>
            </div>

            {onSelectGender && (
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => onSelectGender(selectedGender === 'M' ? 'all' : 'M')}
                  className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    selectedGender === 'M' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                  title="ត្រងមើលសិស្សប្រុស"
                >
                  ប្រុស
                </button>
                <button
                  type="button"
                  onClick={() => onSelectGender(selectedGender === 'F' ? 'all' : 'F')}
                  className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    selectedGender === 'F' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                  title="ត្រងមើលសិស្សស្រី"
                >
                  ស្រី
                </button>
              </div>
            )}
          </div>

          {/* Counts & Percentages */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-blue-50/60 rounded-xl p-2 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-xs font-bold text-blue-900">ប្រុស</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-blue-900 font-times">{maleCount}</span>
                <span className="text-[10px] text-blue-600 font-semibold ml-1">({malePercent}%)</span>
              </div>
            </div>

            <div className="bg-rose-50/60 rounded-xl p-2 border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span className="text-xs font-bold text-rose-900">ស្រី</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-rose-900 font-times">{femaleCount}</span>
                <span className="text-[10px] text-rose-600 font-semibold ml-1">({femalePercent}%)</span>
              </div>
            </div>
          </div>

          {/* Segmented Distribution Bar Chart */}
          <div className="mt-3">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/70 shadow-inner">
              <div
                style={{ width: `${totalStudents > 0 ? malePercent : 50}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-l-full transition-all duration-500 relative group/bar"
                title={`សិស្សប្រុស: ${maleCount} នាក់ (${malePercent}%)`}
              />
              <div
                style={{ width: `${totalStudents > 0 ? femalePercent : 50}%` }}
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-r-full transition-all duration-500 relative group/bar"
                title={`សិស្សស្រី: ${femaleCount} នាក់ (${femalePercent}%)`}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>តុល្យភាពយេនឌ័រ៖</span>
          <span className="font-semibold text-slate-700">
            {Math.abs(malePercent - femalePercent) <= 10
              ? 'សមាមាត្រមានតុល្យភាពល្អ (Balanced)'
              : malePercent > femalePercent
                ? `ប្រុសច្រើនជាងស្រី (+${maleCount - femaleCount})`
                : `ស្រីច្រើនជាងប្រុស (+${femaleCount - maleCount})`}
          </span>
        </div>
      </div>

      {/* 3. Average Attendance Rate Card (with Progress Ring) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-emerald-300 transition-all">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  អត្រាវត្តមានមធ្យម
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  ការចូលរួមសិក្សា (Attendance)
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${attendanceTheme.badgeBg}`}>
              {attendanceTheme.label.split(' ')[0]}
            </span>
          </div>

          {/* Progress Ring & Stats Breakdown */}
          <div className="flex items-center gap-3.5 mt-2">
            {/* SVG Progress Ring */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
                {/* Background Track Circle */}
                <circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  stroke={attendanceTheme.ringTrack}
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Active Progress Circle */}
                <circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  stroke={attendanceTheme.strokeColor}
                  strokeWidth="6"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              {/* Center percentage label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-times tracking-tight leading-none">
                  {averageAttendanceRate.toFixed(1)}%
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  វត្តមាន
                </span>
              </div>
            </div>

            {/* Attendance Breakdown Mini-Stats */}
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 text-[11px]">មកទាន់ពេល:</span>
                </div>
                <span className="font-bold text-slate-900 font-times text-xs">
                  {averageAttendanceRate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-600 text-[11px]">មានច្បាប់:</span>
                </div>
                <span className="font-bold text-amber-700 font-times text-xs">
                  {permissionRate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-600 text-[11px]">ឥតច្បាប់:</span>
                </div>
                <span className="font-bold text-rose-700 font-times text-xs">
                  {absentRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">ស្តង់ដារអប់រំ៖</span>
          <span className="font-bold text-emerald-700">
            {averageAttendanceRate >= 95 ? '✓ លើសកម្រិតស្តង់ដារ ៩៥%' : 'ស្ថិតក្នុងកម្រិតធម្មតា'}
          </span>
        </div>
      </div>
    </div>
  );
};
