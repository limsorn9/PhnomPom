import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { ActivityLogItem, ActivityDomain } from '../../types';
import {
  TrendingUp,
  Activity,
  Calendar,
  Zap,
  BarChart2,
  Sparkles,
  AlertCircle,
  Filter
} from 'lucide-react';

interface Activity7DayChartProps {
  activityLogs: ActivityLogItem[];
  onSelectDate?: (dateStr: string) => void;
  selectedDateFilter?: string;
}

export const Activity7DayChart: React.FC<Activity7DayChartProps> = ({
  activityLogs,
  onSelectDate,
  selectedDateFilter
}) => {
  const [chartViewMode, setChartViewMode] = useState<'stacked' | 'area'>('stacked');
  const [daysRange, setDaysRange] = useState<7 | 14>(7);

  // Compute daily activity frequency over the past 7 (or 14) days
  const { chartData, metrics } = useMemo(() => {
    const now = new Date();
    const days: {
      dateStr: string; // YYYY-MM-DD
      dayNameKhmer: string;
      fullDateLabel: string;
      total: number;
      student: number;
      teacher: number;
      finance: number;
      academic: number;
      admin: number;
    }[] = [];

    const khmerDayNames = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    const khmerMonths = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];

    // Generate date series backwards from today
    for (let i = daysRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayIndex = d.getDay();
      const dayNum = d.getDate();
      const monthName = khmerMonths[d.getMonth()];
      const dayName = khmerDayNames[dayIndex];

      days.push({
        dateStr,
        dayNameKhmer: i === 0 ? 'ថ្ងៃនេះ' : i === 1 ? 'ម្សិលមិញ' : dayName,
        fullDateLabel: `${dayName}, ${dayNum} ${monthName}`,
        total: 0,
        student: 0,
        teacher: 0,
        finance: 0,
        academic: 0,
        admin: 0
      });
    }

    // Populate data from activity logs
    activityLogs.forEach(log => {
      if (!log.timestamp) return;
      const logDateStr = log.timestamp.split('T')[0];
      const targetDay = days.find(d => d.dateStr === logDateStr);
      if (targetDay) {
        targetDay.total += 1;
        const dom = log.domain as ActivityDomain;
        if (dom === 'student') targetDay.student += 1;
        else if (dom === 'teacher') targetDay.teacher += 1;
        else if (dom === 'finance') targetDay.finance += 1;
        else if (dom === 'academic') targetDay.academic += 1;
        else targetDay.admin += 1;
      }
    });

    // Calculate Insights & Spikes
    const totalPeriodActivities = days.reduce((sum, d) => sum + d.total, 0);
    const averageDaily = days.length > 0 ? (totalPeriodActivities / days.length).toFixed(1) : '0';
    
    // Find peak activity day
    let peakDay = days[0];
    days.forEach(d => {
      if (d.total > (peakDay?.total || 0)) {
        peakDay = d;
      }
    });

    const isSpikeDetected = peakDay && peakDay.total > Math.max(4, Number(averageDaily) * 1.6);

    return {
      chartData: days,
      metrics: {
        totalPeriodActivities,
        averageDaily,
        peakDay,
        isSpikeDetected
      }
    };
  }, [activityLogs, daysRange]);

  // Custom Khmer Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 backdrop-blur-md min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {data.fullDateLabel}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-bold font-mono">
              សរុប {data.total}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-blue-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                សិស្សានុសិស្ស៖
              </span>
              <strong className="font-mono">{data.student}</strong>
            </div>
            <div className="flex items-center justify-between text-purple-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                គ្រូបង្រៀន & បុគ្គលិក៖
              </span>
              <strong className="font-mono">{data.teacher}</strong>
            </div>
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ហិរញ្ញវត្ថុ & ថវិកា៖
              </span>
              <strong className="font-mono">{data.finance}</strong>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                ពិន្ទុ & លទ្ធផលសិក្សា៖
              </span>
              <strong className="font-mono">{data.academic}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                រដ្ឋបាល & ប្រព័ន្ធ៖
              </span>
              <strong className="font-mono">{data.admin}</strong>
            </div>
          </div>

          {onSelectDate && (
            <div className="pt-1 border-t border-slate-800 text-[10px] text-blue-300 text-center font-medium">
              💡 ចុចលើក្រាហ្វដើម្បីចម្រាញ់កំណត់ត្រាថ្ងៃនេះ
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-moul">
              ក្រាហ្វិកប្រេកង់សកម្មភាព & ការបញ្ចូលទិន្នន័យ ({daysRange} ថ្ងៃចុងក្រោយ)
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            វិភាគនិន្នាការប្រែប្រួល និងកំណត់ថ្ងៃដែលមានការកែប្រែទិន្នន័យខ្ពស់ (Activity Spikes)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Days Range Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDaysRange(7)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                daysRange === 7
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ៧ ថ្ងៃចុងក្រោយ
            </button>
            <button
              type="button"
              onClick={() => setDaysRange(14)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                daysRange === 14
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ១៤ ថ្ងៃ
            </button>
          </div>

          {/* Chart Style Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setChartViewMode('stacked')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                chartViewMode === 'stacked'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="ក្រាហ្វបង្គោលជង់ (Stacked Bar)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('area')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                chartViewMode === 'area'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="ក្រាហ្វផ្ទៃតំបន់ (Area Trend)"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
          <span className="text-[11px] text-slate-500 font-medium block">សកម្មភាពសរុប ({daysRange}ថ្ងៃ)</span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
            {metrics.totalPeriodActivities} <span className="text-xs font-normal text-slate-500">កំណត់ត្រា</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
          <span className="text-[11px] text-slate-500 font-medium block">មធ្យមភាគប្រចាំថ្ងៃ</span>
          <div className="text-lg font-bold text-indigo-600 font-mono mt-0.5">
            {metrics.averageDaily} <span className="text-xs font-normal text-slate-500">សកម្មភាព/ថ្ងៃ</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
          <span className="text-[11px] text-slate-500 font-medium block">ថ្ងៃសកម្មបំផុត (Peak)</span>
          <div className="text-sm font-bold text-slate-800 truncate mt-0.5">
            {metrics.peakDay ? `${metrics.peakDay.dayNameKhmer} (${metrics.peakDay.total})` : '-'}
          </div>
        </div>

        <div className={`rounded-xl p-2.5 border flex items-center gap-2 ${
          metrics.isSpikeDetected
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
        }`}>
          {metrics.isSpikeDetected ? (
            <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              {metrics.isSpikeDetected ? 'កម្រិតសកម្មភាពខ្ពស់' : 'សភាពធម្មតា'}
            </span>
            <span className="text-[11px] font-semibold truncate block">
              {metrics.isSpikeDetected
                ? `មានកំណើនទិន្នន័យ ${metrics.peakDay?.total} សកម្មភាព`
                : 'ចរាចរណ៍ទិន្នន័យមានស្ថិរភាពល្អ'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartViewMode === 'stacked' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length && onSelectDate) {
                  onSelectDate(e.activePayload[0].payload.dateStr);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayNameKhmer"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    student: 'សិស្ស',
                    teacher: 'គ្រូ',
                    finance: 'ថវិកា',
                    academic: 'ពិន្ទុ',
                    admin: 'រដ្ឋបាល'
                  };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="student" name="student" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="teacher" name="teacher" stackId="a" fill="#9333ea" radius={[0, 0, 0, 0]} />
              <Bar dataKey="finance" name="finance" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="academic" name="academic" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="admin" name="admin" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length && onSelectDate) {
                  onSelectDate(e.activePayload[0].payload.dateStr);
                }
              }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayNameKhmer"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាពផ្ទាល់ Real-Time ស្របពេលមានសកម្មភាពថ្មីៗ
        </span>
        <span className="text-slate-400">
          ចុចលើបង្គោលក្រាហ្វដើម្បីចម្រាញ់តាមថ្ងៃ
        </span>
      </div>
    </div>
  );
};
