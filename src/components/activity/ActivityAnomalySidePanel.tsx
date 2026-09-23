import React, { useState, useMemo } from 'react';
import {
  ActivityLogItem,
  ActivityAnomaly,
  AnomalySeverity
} from '../../types';
import {
  formatKhmerFullDateTime,
  formatKhmerRelativeTime,
  detectLogAnomalies
} from '../../utils/activityTracker';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Clock,
  Trash2,
  CircleDollarSign,
  Zap,
  ShieldCheck,
  ChevronRight,
  Eye,
  Filter,
  X,
  Sparkles,
  Info
} from 'lucide-react';

interface ActivityAnomalySidePanelProps {
  logs: ActivityLogItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLog: (log: ActivityLogItem) => void;
  onFilterAnomaliesOnly: () => void;
}

export const ActivityAnomalySidePanel: React.FC<ActivityAnomalySidePanelProps> = ({
  logs,
  isOpen,
  onClose,
  onSelectLog,
  onFilterAnomaliesOnly
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<AnomalySeverity | 'all'>('all');

  // Collect all anomalies across all logs
  const allAnomalies = useMemo(() => {
    const list: { anomaly: ActivityAnomaly; log: ActivityLogItem }[] = [];
    logs.forEach(log => {
      const detected = detectLogAnomalies(log, logs);
      detected.forEach(anom => {
        list.push({ anomaly: anom, log });
      });
    });
    return list;
  }, [logs]);

  const filteredAnomalies = useMemo(() => {
    if (selectedSeverity === 'all') return allAnomalies;
    return allAnomalies.filter(item => item.anomaly.severity === selectedSeverity);
  }, [allAnomalies, selectedSeverity]);

  const severityCounts = useMemo(() => {
    return {
      total: allAnomalies.length,
      high: allAnomalies.filter(a => a.anomaly.severity === 'high').length,
      medium: allAnomalies.filter(a => a.anomaly.severity === 'medium').length,
      low: allAnomalies.filter(a => a.anomaly.severity === 'low').length
    };
  }, [allAnomalies]);

  if (!isOpen) return null;

  return (
    <div
      id="activity-anomaly-panel-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="activity-anomaly-panel-container"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-slideLeft"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-slate-50 dark:from-slate-800/90 dark:to-slate-800/40">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                មជ្ឈមណ្ឌលត្រួតពិនិត្យភាពមិនប្រក្រតី
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                រកឃើញសញ្ញាហានិភ័យ & ភាពមិនប្រក្រតី <strong className="text-amber-600 dark:text-amber-400">{allAnomalies.length}</strong>
              </p>
            </div>
          </div>
          <button
            id="btn-close-anomaly-panel"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              id="filter-anom-all"
              onClick={() => setSelectedSeverity('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <span>ទាំងអស់ ({severityCounts.total})</span>
            </button>
            <button
              type="button"
              id="filter-anom-high"
              onClick={() => setSelectedSeverity('high')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'high'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-400 dark:border-rose-800/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>កម្រិតខ្ពស់ ({severityCounts.high})</span>
            </button>
            <button
              type="button"
              id="filter-anom-medium"
              onClick={() => setSelectedSeverity('medium')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'medium'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-400 dark:border-amber-800/50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>មធ្យម ({severityCounts.medium})</span>
            </button>
            <button
              type="button"
              id="filter-anom-low"
              onClick={() => setSelectedSeverity('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedSeverity === 'low'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:border-blue-800/50'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>ព័ត៌មាន ({severityCounts.low})</span>
            </button>
          </div>

          <button
            type="button"
            id="btn-filter-main-table-anomalies"
            onClick={() => {
              onFilterAnomaliesOnly();
              onClose();
            }}
            className="w-full py-2 px-3 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>បង្ហាញតែសកម្មភាពមិនប្រក្រតីក្នុងតារាងធំ</span>
          </button>
        </div>

        {/* Anomaly Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAnomalies.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                គ្មានភាពមិនប្រក្រតីត្រូវកត់ត្រាទេ
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                សកម្មភាពទាំងអស់ក្នុងប្រព័ន្ធដំណើរការស្របតាមបទដ្ឋានរដ្ឋបាលធម្មតា។
              </p>
            </div>
          ) : (
            filteredAnomalies.map(({ anomaly, log }) => {
              const isHigh = anomaly.severity === 'high';
              const isMed = anomaly.severity === 'medium';

              return (
                <div
                  key={anomaly.id}
                  id={`anomaly-card-${anomaly.id}`}
                  className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                    isHigh
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                      : isMed
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                  }`}
                >
                  {/* Top Badge & Time */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                          : isMed
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                      }`}
                    >
                      {isHigh && <AlertTriangle className="w-3 h-3" />}
                      {isMed && <AlertCircle className="w-3 h-3" />}
                      {!isHigh && !isMed && <Info className="w-3 h-3" />}
                      <span>{anomaly.titleKhmer}</span>
                    </span>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatKhmerRelativeTime(log.timestamp)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {anomaly.descriptionKhmer}
                  </p>

                  {/* Log Context Info */}
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 space-y-1 text-[11px]">
                    <div className="font-semibold text-slate-800 dark:text-white line-clamp-1">
                      {log.title}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>អ្នកអនុវត្ត៖ <strong>{log.actorName}</strong> ({log.actorRole})</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      id={`btn-inspect-anomaly-${anomaly.id}`}
                      onClick={() => {
                        onSelectLog(log);
                        onClose();
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>ពិនិត្យមើលកំណត់ត្រា</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex justify-end">
          <button
            type="button"
            id="btn-close-anomaly-bottom"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
