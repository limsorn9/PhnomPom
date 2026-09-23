import React, { useState } from 'react';
import { ActivityLogItem, ActivityHealthMetric } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  HeartPulse,
  Clock,
  Trash2,
  Zap,
  CircleDollarSign,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { calculateSchoolActivityHealth } from '../../utils/activityHealthMonitor';

interface ActivityHealthMonitorWidgetProps {
  logs: ActivityLogItem[];
  onFilterHighRisk: () => void;
  isHighRiskActive: boolean;
}

export const ActivityHealthMonitorWidget: React.FC<ActivityHealthMonitorWidgetProps> = ({
  logs,
  onFilterHighRisk,
  isHighRiskActive
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const health: ActivityHealthMetric = calculateSchoolActivityHealth(logs);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-300 ring-emerald-400';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-300 ring-blue-400';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-300 ring-amber-400';
    return 'text-rose-600 bg-rose-50 border-rose-300 ring-rose-400';
  };

  const getBadgeGradient = (status: string) => {
    if (status === 'critical') return 'from-rose-600 to-red-700 text-white';
    if (status === 'warning') return 'from-amber-500 to-orange-600 text-white';
    if (status === 'good') return 'from-blue-600 to-indigo-700 text-white';
    return 'from-emerald-600 to-teal-700 text-white';
  };

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-md mb-4 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Health Score & Title */}
          <div className="flex items-center gap-4">
            {/* Score Ring Badge */}
            <div
              className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-mono shadow-inner ${getScoreColor(
                health.healthScore
              )}`}
            >
              <span className="text-lg font-black leading-none">{health.healthScore}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">/100</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold font-moul text-white">
                  ប្រព័ន្ធតាមដានសុវត្ថិភាពសវនកម្ម (Automated Health Monitor)
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gradient-to-r ${getBadgeGradient(
                    health.healthStatus
                  )}`}
                >
                  {health.healthStatusKhmer}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 max-w-2xl font-kantumruy">
                {health.systemHealthAssessment}
              </p>
            </div>
          </div>

          {/* Metrics Pill Indicators & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* High Risk Count Chip */}
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                health.highRiskCount > 0
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>ហានិភ័យខ្ពស់៖</span>
              <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-md font-mono text-[11px]">
                {health.highRiskCount}
              </span>
            </div>

            {/* Off-Hours Count Chip */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>ក្រៅម៉ោង៖</span>
              <span className="font-mono font-bold text-white">{health.offHoursCount}</span>
            </div>

            {/* Bulk Deletions Count Chip */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-medium">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>លុបទិន្នន័យ៖</span>
              <span className="font-mono font-bold text-white">{health.bulkDeletionsCount}</span>
            </div>

            {/* Toggle High Risk Filter Button */}
            <button
              type="button"
              onClick={onFilterHighRisk}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer ${
                isHighRiskActive
                  ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isHighRiskActive ? 'បង្ហាញសកម្មភាពទាំងអស់' : 'បង្ហាញតែកំណត់ត្រាហានិភ័យ'}</span>
            </button>

            {/* Details Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(true)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="ពិនិត្យលម្អិតអំពីក្បួនវាយតម្លៃសុវត្ថិភាពសវនកម្ម"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Health Monitor Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-moul text-white">
                  ការវិភាគសុវត្ថិភាពសវនកម្ម (Audit Health Diagnostics)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Score breakdown banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-mono shadow-inner ${getScoreColor(
                    health.healthScore
                  )}`}
                >
                  <span className="text-2xl font-black">{health.healthScore}</span>
                  <span className="text-[10px] font-bold">/100</span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      ស្ថានភាព៖ {health.healthStatusKhmer}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-kantumruy">
                    {health.systemHealthAssessment}
                  </p>
                </div>
              </div>

              {/* Thresholds Evaluated */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>ក្បួនវាយតម្លៃហានិភ័យតាមកម្រិត (Threshold Criteria)៖</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-900">
                      <span>ការលុបទិន្នន័យជាដុំ</span>
                      <span className="font-mono">{health.bulkDeletionsCount} ករណី</span>
                    </div>
                    <p className="text-[11px] text-rose-700">ការលុបសិស្ស គ្រូ ឬពិន្ទុច្រើនក្នុងពេលតែមួយ</p>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span>សកម្មភាពក្រៅម៉ោង (22:00 - 05:00)</span>
                      <span className="font-mono">{health.offHoursCount} ករណី</span>
                    </div>
                    <p className="text-[11px] text-amber-700">ប្រតិបត្តិការកែប្រែប្រព័ន្ធនៅពេលយប់ជ្រៅ</p>
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span>ហិរញ្ញវត្ថុទំហំធំ (&gt; 1,000,000៛)</span>
                      <span className="font-mono">{health.highFinanceCount} ករណី</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">ចំណូល-ចំណាយថវិកាដែលត្រូវការការយល់ព្រម</p>
                  </div>

                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-indigo-900">
                      <span>ប្រេកង់សកម្មភាពញឹកញាប់</span>
                      <span className="font-mono">{health.unusualFrequencyCount} ករណី</span>
                    </div>
                    <p className="text-[11px] text-indigo-700">&gt; ៤ សកម្មភាព ក្នុងរយៈពេលក្រោម ១០ នាទី</p>
                  </div>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>អនុសាសន៍រដ្ឋបាលសម្រាប់សាលារៀន៖</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-800">
                  {health.recommendationsKhmer.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
