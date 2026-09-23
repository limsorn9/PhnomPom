import React, { useState, useMemo } from 'react';
import {
  ActivityLogItem,
  ActivityRetentionConfig
} from '../../types';
import {
  getRetentionConfig,
  saveRetentionConfig,
  performRetentionCleanup,
  estimateStorageSizeKB,
  formatKhmerFullDateTime
} from '../../utils/activityTracker';
import {
  Clock,
  Trash2,
  Settings,
  HardDrive,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Calendar,
  X,
  RefreshCw,
  Database
} from 'lucide-react';

interface ActivityRetentionModalProps {
  logs: ActivityLogItem[];
  isOpen: boolean;
  onClose: () => void;
  onLogsUpdated: (newLogs: ActivityLogItem[]) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const RETENTION_OPTIONS = [
  { value: 30, label: '៣០ ថ្ងៃ (១ ខែ)', desc: 'ស័ក្តិសមសម្រាប់សាលាដែលចង់បានល្បឿនលឿនបំផុត' },
  { value: 60, label: '៦០ ថ្ងៃ (២ ខែ)', desc: 'រក្សាទុកទិន្នន័យរយៈពេលខ្លី' },
  { value: 90, label: '៩០ ថ្ងៃ (៣ ខែ - លំនាំដើម)', desc: 'អនុសាសន៍ស្តង់ដារសម្រាប់សវនកម្ម និងសុវត្ថិភាពទិន្នន័យ' },
  { value: 180, label: '១៨០ ថ្ងៃ (៦ ខែ)', desc: 'រក្សាទុកទិន្នន័យរយៈពេល ១ ឆមាសសិក្សា' },
  { value: 365, label: '៣៦៥ ថ្ងៃ (១ ឆ្នាំ)', desc: 'រក្សាទុកទិន្នន័យពេញមួយឆ្នាំសិក្សា' },
  { value: 0, label: 'គ្មានដែនកំណត់ (រក្សាទុកទាំងអស់)', desc: 'មិនលុបស្វ័យប្រវត្តិតាមពេលវេលាឡើយ' }
];

export const ActivityRetentionModal: React.FC<ActivityRetentionModalProps> = ({
  logs,
  isOpen,
  onClose,
  onLogsUpdated,
  showToast
}) => {
  const [config, setConfig] = useState<ActivityRetentionConfig>(() => getRetentionConfig());
  const [isCleaning, setIsCleaning] = useState(false);
  const [confirmWipeAll, setConfirmWipeAll] = useState(false);

  // Storage and Cleanup Analysis
  const stats = useMemo(() => {
    const totalCount = logs.length;
    const totalSizeKB = estimateStorageSizeKB(logs);
    const { deletedCount, expiredLogIds } = performRetentionCleanup(logs, config.retentionDays);

    return {
      totalCount,
      totalSizeKB,
      expiredCount: deletedCount,
      expiredIds: expiredLogIds
    };
  }, [logs, config.retentionDays]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveRetentionConfig(config);
    showToast('បានរក្សាទុកការកំណត់គោលការណ៍រក្សាទុកកំណត់ត្រាដោយជោគជ័យ!', 'success');
    onClose();
  };

  const handleRunCleanupNow = () => {
    if (config.retentionDays === 0) {
      showToast('លោកអ្នកបានជ្រើសរើស «រក្សាទុកទាំងអស់» ដូច្នេះគ្មានកំណត់ត្រាហួសកាលកំណត់ឡើយ។', 'info');
      return;
    }

    setIsCleaning(true);
    setTimeout(() => {
      const { remainingLogs, deletedCount } = performRetentionCleanup(logs, config.retentionDays);
      const updatedConfig: ActivityRetentionConfig = {
        ...config,
        lastCleanedAt: new Date().toISOString(),
        lastCleanedCount: deletedCount
      };

      saveRetentionConfig(updatedConfig);
      setConfig(updatedConfig);
      onLogsUpdated(remainingLogs);
      setIsCleaning(false);

      if (deletedCount > 0) {
        showToast(`បានសម្អាតកំណត់ត្រាដែលចាស់ជាង ${config.retentionDays} ថ្ងៃ ចំនួន ${deletedCount} កំណត់ត្រាដោយជោគជ័យ!`, 'success');
      } else {
        showToast('កំណត់ត្រាទាំងអស់ស្ថិតក្នុងកាលបរិច្ឆេទសុពលភាព (គ្មានកំណត់ត្រាហួសកាលកំណត់)', 'info');
      }
    }, 400);
  };

  const handleWipeAll = () => {
    onLogsUpdated([]);
    const updatedConfig: ActivityRetentionConfig = {
      ...config,
      lastCleanedAt: new Date().toISOString(),
      lastCleanedCount: logs.length
    };
    saveRetentionConfig(updatedConfig);
    setConfig(updatedConfig);
    setConfirmWipeAll(false);
    showToast('បានសម្អាតកំណត់ត្រាសកម្មភាពទាំងអស់រួចរាល់', 'info');
    onClose();
  };

  return (
    <div
      id="activity-retention-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="activity-retention-modal-container"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-slate-800/40">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                កំណត់កាលបរិច្ឆេទសម្អាតស្វ័យប្រវត្តិ (Log Retention & Cleanup)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                គ្រប់គ្រងសុវត្ថិភាពទំហំផ្ទុក និងរក្សាល្បឿនផ្ទាំងព័ត៌មានឱ្យដំណើរការរហ័ស
              </p>
            </div>
          </div>
          <button
            id="btn-close-retention-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Storage Diagnostic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">កំណត់ត្រាសរុប</span>
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                {stats.totalCount.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">កំណត់ត្រាសកម្មភាព</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">ហួសកាលកំណត់ ({config.retentionDays ? `${config.retentionDays} ថ្ងៃ` : 'គ្មាន'})</span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-800 dark:text-amber-300">
                {stats.expiredCount.toLocaleString()}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400">អាចសម្អាតបានភ្លាមៗ</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">ទំហំផ្ទុកប៉ាន់ស្មាន</span>
                <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-indigo-800 dark:text-indigo-300">
                {stats.totalSizeKB} <span className="text-sm font-normal text-indigo-600">KB</span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">ទំហំសតិក្នុង LocalStorage</span>
            </div>
          </div>

          {/* Retention Period Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              ជ្រើសរើសរយៈពេលរក្សាទុកកំណត់ត្រា (Retention Period):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RETENTION_OPTIONS.map(opt => {
                const isSelected = config.retentionDays === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    id={`btn-retention-opt-${opt.value}`}
                    onClick={() => setConfig(prev => ({ ...prev, retentionDays: opt.value }))}
                    className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold flex items-center gap-2">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automated Cleanup Switch */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ដំណើរការសម្អាតស្វ័យប្រវត្តិនៅពេលបើកកម្មវិធី (Auto-Cleanup on Launch)
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ប្រព័ន្ធនឹងលុបកំណត់ត្រាចាស់ៗដែលហួសសុពលភាពដោយស្វ័យប្រវត្តិនៅផ្ទៃខាងក្រោយ
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-auto-cleanup"
                  checked={config.autoCleanupEnabled}
                  onChange={e => setConfig(prev => ({ ...prev, autoCleanupEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {config.lastCleanedAt && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>បានសម្អាតចុងក្រោយ៖ {formatKhmerFullDateTime(config.lastCleanedAt)} ({config.lastCleanedCount || 0} កំណត់ត្រា)</span>
              </div>
            )}
          </div>

          {/* Action Trigger Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              id="btn-run-cleanup-now"
              onClick={handleRunCleanupNow}
              disabled={isCleaning || stats.expiredCount === 0}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                stats.expiredCount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isCleaning ? 'animate-spin' : ''}`} />
              <span>សម្អាតទិន្នន័យហួសកាលកំណត់ឥឡូវនេះ ({stats.expiredCount})</span>
            </button>

            {!confirmWipeAll ? (
              <button
                type="button"
                id="btn-trigger-wipe-all"
                onClick={() => setConfirmWipeAll(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបកំណត់ត្រាទាំងអស់ (Wipe All)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800">
                <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">តើលោកអ្នកពិតជាចង់លុបទាំងអស់?</span>
                <button
                  type="button"
                  id="btn-confirm-wipe-yes"
                  onClick={handleWipeAll}
                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  ពិតជាចង់
                </button>
                <button
                  type="button"
                  id="btn-confirm-wipe-no"
                  onClick={() => setConfirmWipeAll(false)}
                  className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  បោះបង់
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
          <button
            type="button"
            id="btn-cancel-retention-modal"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            បិទផ្ទាំង
          </button>
          <button
            type="button"
            id="btn-save-retention-config"
            onClick={handleSaveConfig}
            className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>រក្សាទុកការកំណត់</span>
          </button>
        </div>
      </div>
    </div>
  );
};
