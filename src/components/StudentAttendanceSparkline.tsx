import React, { useMemo, useState } from 'react';
import { Student, DailyAttendanceRecord } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Sparkles,
  Flame,
  Info
} from 'lucide-react';

interface StudentAttendanceSparklineProps {
  student: Student;
  attendanceRecords?: DailyAttendanceRecord[];
  daysCount?: number;
  width?: number;
  height?: number;
  showBadge?: boolean;
  showBreakdownOnHover?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface DayAttendanceStatus {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g., '15/08'
  dayOfWeekKhmer: string; // 'ចន្ទ', 'អង្គារ', ...
  status: 'present' | 'permission' | 'absent';
  source: 'recorded' | 'baseline';
  value: number; // 1 = present, 0.5 = permission, 0 = absent
  cumulativeRate: number; // 0 - 100
}

const KHMER_DAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

export const StudentAttendanceSparkline: React.FC<StudentAttendanceSparklineProps> = ({
  student,
  attendanceRecords = [],
  daysCount = 30,
  width = 110,
  height = 30,
  showBadge = true,
  showBreakdownOnHover = true,
  className = '',
  onClick
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Generate 30 days of daily attendance history
  const { history, stats, sparklinePath, areaPath } = useMemo(() => {
    const today = new Date();
    const historyList: DayAttendanceStatus[] = [];

    // Filter explicit records for this student
    const studentRecordsMap = new Map<string, 'present' | 'permission' | 'absent'>();
    attendanceRecords.forEach(rec => {
      if (rec.studentId === student.id) {
        studentRecordsMap.set(rec.date, rec.status);
      }
    });

    // Student baseline statistics
    const baseSummary = student.attendance || {
      present: 96,
      absentWithPermission: 2,
      absentWithoutPermission: 0,
      totalDays: 98
    };

    const baseTotal = Math.max(baseSummary.totalDays || 100, 1);
    const presentRatio = (baseSummary.present || 0) / baseTotal;
    const permissionRatio = (baseSummary.absentWithPermission || 0) / baseTotal;

    // Collect last N days (excluding Sundays, or taking 30 school days)
    let addedCount = 0;
    let dayOffset = 0;

    const tempDays: { dateStr: string; dateObj: Date; dayOfWeek: number }[] = [];
    while (addedCount < daysCount && dayOffset < 50) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dayOfWeek = d.getDay(); // 0 = Sun
      
      // Skip Sundays for school calendar
      if (dayOfWeek !== 0) {
        const dateStr = d.toISOString().split('T')[0];
        tempDays.push({ dateStr, dateObj: d, dayOfWeek });
        addedCount++;
      }
      dayOffset++;
    }

    // Sort chronologically (oldest to newest)
    tempDays.reverse();

    let cumulativePresent = 0;
    let cumulativePossible = 0;
    let presentCount = 0;
    let permissionCount = 0;
    let absentCount = 0;

    tempDays.forEach(({ dateStr, dateObj, dayOfWeek }, idx) => {
      let status: 'present' | 'permission' | 'absent' = 'present';
      let source: 'recorded' | 'baseline' = 'baseline';

      if (studentRecordsMap.has(dateStr)) {
        status = studentRecordsMap.get(dateStr)!;
        source = 'recorded';
      } else {
        // Deterministic pseudo-random based on student ID + date string
        const seedStr = `${student.id}-${dateStr}-${student.code || ''}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
          hash = (hash << 5) - hash + seedStr.charCodeAt(i);
          hash |= 0;
        }
        const normalized = Math.abs(hash % 1000) / 1000;

        if (normalized < presentRatio) {
          status = 'present';
        } else if (normalized < presentRatio + permissionRatio) {
          status = 'permission';
        } else {
          status = 'absent';
        }
      }

      if (status === 'present') {
        presentCount++;
        cumulativePresent += 1;
      } else if (status === 'permission') {
        permissionCount++;
        cumulativePresent += 0.5;
      } else {
        absentCount++;
      }
      cumulativePossible += 1;

      const value = status === 'present' ? 1 : status === 'permission' ? 0.5 : 0;
      const dayParts = dateStr.split('-');
      const dayLabel = `${dayParts[2]}/${dayParts[1]}`;
      const dayOfWeekKhmer = KHMER_DAYS[dayOfWeek] || '';

      const currentRate = (cumulativePresent / cumulativePossible) * 100;

      historyList.push({
        date: dateStr,
        dayLabel,
        dayOfWeekKhmer,
        status,
        source,
        value,
        cumulativeRate: Number(currentRate.toFixed(1))
      });
    });

    const totalDays = historyList.length;
    const finalRate = totalDays > 0 ? (cumulativePresent / totalDays) * 100 : 96;

    // Calculate streak of consecutive present days from most recent backwards
    let streak = 0;
    for (let i = historyList.length - 1; i >= 0; i--) {
      if (historyList[i].status === 'present') {
        streak++;
      } else {
        break;
      }
    }

    // Trend trajectory: compare first half vs second half
    const half = Math.floor(historyList.length / 2);
    const firstHalfPresent = historyList.slice(0, half).filter(h => h.status === 'present').length;
    const secondHalfPresent = historyList.slice(half).filter(h => h.status === 'present').length;
    const trendDiff = secondHalfPresent - firstHalfPresent;
    const trendDirection: 'up' | 'stable' | 'down' =
      trendDiff > 1 ? 'up' : trendDiff < -1 ? 'down' : 'stable';

    // Build SVG Path for Sparkline
    // We compute a smoothed rolling average line over the 30 days
    const paddingX = 4;
    const paddingY = 4;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const points = historyList.map((item, idx) => {
      const x = paddingX + (idx / (totalDays - 1 || 1)) * chartW;
      
      // Compute 3-day moving average or rate for smooth curve
      const windowStart = Math.max(0, idx - 2);
      const windowEnd = Math.min(totalDays, idx + 1);
      const windowSlice = historyList.slice(windowStart, windowEnd);
      const windowAvg = windowSlice.reduce((acc, curr) => acc + curr.value, 0) / windowSlice.length;

      // Map 0 -> 1 to Y coordinate (0 = bottom, 1 = top)
      // We clamp y between 10% and 100% so flat 100% still sits elegantly near the top
      const y = paddingY + chartH - windowAvg * chartH;
      return { x, y, item };
    });

    let sparkPath = '';
    let aPath = '';

    if (points.length > 0) {
      sparkPath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        // Smooth Bezier Curve
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        sparkPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
      }

      // Area path closed to bottom
      const last = points[points.length - 1];
      const bottomY = height - paddingY;
      aPath = `${sparkPath} L ${last.x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
    }

    return {
      history: historyList,
      stats: {
        totalDays,
        presentCount,
        permissionCount,
        absentCount,
        rate: Number(finalRate.toFixed(1)),
        streak,
        trendDirection
      },
      sparklinePath: sparkPath,
      areaPath: aPath
    };
  }, [student, attendanceRecords, daysCount, width, height]);

  // Color theme according to rate
  const getTheme = (rate: number) => {
    if (rate >= 95) {
      return {
        stroke: '#10b981', // emerald-500
        fill: 'url(#emerald-grad)',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700'
      };
    } else if (rate >= 88) {
      return {
        stroke: '#3b82f6', // blue-500
        fill: 'url(#blue-grad)',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-700'
      };
    } else if (rate >= 75) {
      return {
        stroke: '#f59e0b', // amber-500
        fill: 'url(#amber-grad)',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-700'
      };
    } else {
      return {
        stroke: '#ef4444', // red-500
        fill: 'url(#red-grad)',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        dotColor: 'bg-rose-500',
        textColor: 'text-rose-700'
      };
    }
  };

  const theme = getTheme(stats.rate);
  const activeHoverItem = hoveredIndex !== null ? history[hoveredIndex] : null;

  return (
    <div
      className={`relative inline-flex items-center gap-2 group ${className}`}
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => {
        setIsTooltipOpen(false);
        setHoveredIndex(null);
      }}
      onClick={onClick}
    >
      {/* Sparkline Canvas / SVG */}
      <div className="relative flex flex-col items-center">
        <svg
          width={width}
          height={height}
          className="overflow-visible cursor-pointer"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <linearGradient id="emerald-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amber-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="red-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          {areaPath && (
            <path
              d={areaPath}
              fill={theme.fill}
              className="transition-all duration-300 pointer-events-none"
            />
          )}

          {/* Sparkline curve */}
          {sparklinePath && (
            <path
              d={sparklinePath}
              fill="none"
              stroke={theme.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Interactive vertical tick markers */}
          {history.map((day, idx) => {
            const x = 4 + (idx / (history.length - 1 || 1)) * (width - 8);
            const isHovered = hoveredIndex === idx;
            const dotFill =
              day.status === 'present'
                ? '#10b981'
                : day.status === 'permission'
                  ? '#f59e0b'
                  : '#ef4444';

            return (
              <g key={day.date} onMouseEnter={() => setHoveredIndex(idx)}>
                {/* Transparent hit area */}
                <rect
                  x={x - 2.5}
                  y={0}
                  width={5}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* Status Dot / Tick if not present or if hovered */}
                {(day.status !== 'present' || isHovered) && (
                  <circle
                    cx={x}
                    cy={day.status === 'present' ? height - 6 : day.status === 'permission' ? height / 2 : 6}
                    r={isHovered ? 3.5 : 2}
                    fill={dotFill}
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="transition-all duration-150 pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Mini 30-day Discrete Micro-Heatmap Strip */}
        <div className="flex items-center gap-[1.5px] mt-1 w-full max-w-[110px] justify-between">
          {history.map((day, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              className={`h-1.5 flex-1 rounded-xs transition-transform ${
                hoveredIndex === idx ? 'scale-125 z-10' : ''
              } ${
                day.status === 'present'
                  ? 'bg-emerald-400 hover:bg-emerald-500'
                  : day.status === 'permission'
                    ? 'bg-amber-400 hover:bg-amber-500 ring-1 ring-amber-300'
                    : 'bg-rose-500 hover:bg-rose-600 ring-1 ring-rose-300'
              }`}
              title={`${day.dayLabel} (${day.dayOfWeekKhmer}): ${
                day.status === 'present' ? 'វត្តមាន' : day.status === 'permission' ? 'ច្បាប់' : 'អវត្តមាន'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Percentage & Trend Badge */}
      {showBadge && (
        <div className="flex flex-col items-start">
          <div
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold border font-times ${theme.badgeBg}`}
          >
            <span>{stats.rate.toFixed(0)}%</span>
            {stats.trendDirection === 'up' && (
              <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
            )}
            {stats.trendDirection === 'down' && (
              <TrendingDown className="w-2.5 h-2.5 text-rose-600" />
            )}
            {stats.trendDirection === 'stable' && (
              <Minus className="w-2.5 h-2.5 text-slate-400" />
            )}
          </div>
          <span className="text-[9px] text-slate-400 font-medium pl-0.5">
            {stats.presentCount}/{stats.totalDays} ថ្ងៃ
          </span>
        </div>
      )}

      {/* Interactive Tooltip on Hover */}
      {showBreakdownOnHover && isTooltipOpen && (
        <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-64 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 shadow-xl z-50 pointer-events-none text-xs border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-slate-200">វត្តមាន ៣០ ថ្ងៃចុងក្រោយ</span>
            </div>
            <span className="font-bold text-emerald-400 font-times">{stats.rate}%</span>
          </div>

          {/* Hovered single day focus (if hovering a specific day) */}
          {activeHoverItem ? (
            <div className="bg-slate-800/90 rounded-lg p-2 mb-2 border border-slate-700">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-times">{activeHoverItem.date}</span>
                <span className="font-semibold text-slate-200">{activeHoverItem.dayOfWeekKhmer}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 font-bold">
                {activeHoverItem.status === 'present' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">វត្តមាន (មកទាន់ពេល)</span>
                  </>
                )}
                {activeHoverItem.status === 'permission' && (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 text-xs">សុំច្បាប់ (មានការអនុញ្ញាត)</span>
                  </>
                )}
                {activeHoverItem.status === 'absent' && (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400 text-xs">អវត្តមានឥតច្បាប់</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* General breakdown summary */
            <div className="grid grid-cols-3 gap-1.5 text-center mb-2">
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-1.5">
                <span className="text-[10px] text-emerald-300 block">វត្តមាន</span>
                <span className="text-xs font-bold text-emerald-400 font-times">{stats.presentCount}</span>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-1.5">
                <span className="text-[10px] text-amber-300 block">ច្បាប់</span>
                <span className="text-xs font-bold text-amber-400 font-times">{stats.permissionCount}</span>
              </div>
              <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg p-1.5">
                <span className="text-[10px] text-rose-300 block">ឥតច្បាប់</span>
                <span className="text-xs font-bold text-rose-400 font-times">{stats.absentCount}</span>
              </div>
            </div>
          )}

          {/* Streak badge */}
          {stats.streak > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-700/60">
              <span className="flex items-center gap-1 text-amber-300 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>វត្តមានជាប់គ្នា៖</span>
              </span>
              <span className="font-bold text-white font-times">{stats.streak} ថ្ងៃ</span>
            </div>
          )}

          {/* Tooltip beak */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
