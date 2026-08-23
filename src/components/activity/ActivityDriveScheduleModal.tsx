import React, { useState } from 'react';
import {
  ActivityLogItem,
  ActivityDriveScheduleConfig,
  SchoolProfile
} from '../../types';
import {
  HardDrive,
  Cloud,
  CloudUpload,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Settings,
  History,
  ShieldAlert,
  Play,
  Download,
  FolderOpen
} from 'lucide-react';
import {
  getDriveScheduleConfig,
  saveDriveScheduleConfig,
  executeDriveSummaryExport,
  calculateNextRunDate
} from '../../utils/activityDriveExporter';
import { formatKhmerFullDateTime, formatKhmerRelativeTime } from '../../utils/activityTracker';

interface ActivityDriveScheduleModalProps {
  logs: ActivityLogItem[];
  schoolProfile?: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ActivityDriveScheduleModal: React.FC<ActivityDriveScheduleModalProps> = ({
  logs,
  schoolProfile,
  isOpen,
  onClose,
  showToast
}) => {
  const [config, setConfig] = useState<ActivityDriveScheduleConfig>(getDriveScheduleConfig());
  const [isExecutingNow, setIsExecutingNow] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'history'>('settings');

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const nextRun = calculateNextRunDate(
      config.frequency,
      config.dayOfWeek,
      config.dayOfMonth,
      config.timeOfDay
    );
    const updated: ActivityDriveScheduleConfig = {
      ...config,
      nextRunAt: nextRun
    };
    setConfig(updated);
    saveDriveScheduleConfig(updated);
    showToast('បានរក្សាទុកការកំណត់កាលវិភាគ Google Drive ជោគជ័យ!', 'success');
  };

  const handleRunInstantExport = () => {
    setIsExecutingNow(true);
    setTimeout(() => {
      const result = executeDriveSummaryExport(logs, config, schoolProfile);
      setConfig(result.updatedConfig);
      setIsExecutingNow(false);
      showToast(
        `បានបង្កើត និងនាំចេញឯកសារ «${result.fileName}» ទៅកាន់ Google Drive (${config.folderName}) ជោគជ័យ!`,
        'success'
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-moul text-white">
                កាលវិភាគបញ្ជូនរបាយការណ៍ទៅ Google Drive (Scheduled Summaries)
              </h3>
              <p className="text-[11px] text-slate-300">
                បង្កើតរបាយការណ៍សវនកម្មស្វ័យប្រវត្ត ប្រចាំសប្តាហ៍ ឬប្រចាំខែ រក្សាទុកក្នុងថត Google Drive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'settings'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ការកំណត់កាលវិភាគ (Schedule Settings)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ប្រវត្តិនាំចេញស្វ័យប្រវត្ត ({config.runHistory?.length || 0})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeSubTab === 'settings' ? (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Account & Destination Card */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <CloudUpload className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-950">
                      គោលដៅ Google Drive សាលារៀន
                    </div>
                    <div className="text-[11px] text-emerald-800 flex items-center gap-2">
                      <span>គណនី៖ <strong>{config.targetEmail}</strong></span>
                      <span>• ថតឯកសារ៖ <strong>{config.folderName}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      config.enabled
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {config.enabled ? 'ដំណើរការ' : 'បានបិទ'}
                  </span>
                </div>
              </div>

              {/* Enable / Disable Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-xs text-slate-800">
                    បើកដំណើរការបញ្ជូនរបាយការណ៍ស្វ័យប្រវត្ត
                  </span>
                  <p className="text-[11px] text-slate-500">
                    បង្កើត និងផ្ទុកឡើងសេចក្តីសង្ខេបសកម្មភាពទៅ Google Drive តាមកាលវិភាគ
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={e => setConfig({ ...config, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Schedule Timing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ប្រេកង់កាលវិភាគ
                  </label>
                  <select
                    value={config.frequency}
                    onChange={e => setConfig({ ...config, frequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="weekly">ប្រចាំសប្តាហ៍ (Weekly)</option>
                    <option value="biweekly">រៀងរាល់ ២ សប្តាហ៍ (Bi-weekly)</option>
                    <option value="monthly">ប្រចាំខែ (Monthly)</option>
                  </select>
                </div>

                {config.frequency === 'weekly' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ថ្ងៃក្នុងសប្តាហ៍
                    </label>
                    <select
                      value={config.dayOfWeek}
                      onChange={e => setConfig({ ...config, dayOfWeek: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value={1}>រៀងរាល់ ថ្ងៃចន្ទ</option>
                      <option value={2}>រៀងរាល់ ថ្ងៃអង្គារ</option>
                      <option value={3}>រៀងរាល់ ថ្ងៃពុធ</option>
                      <option value={4}>រៀងរាល់ ថ្ងៃព្រហស្បតិ៍</option>
                      <option value={5}>រៀងរាល់ ថ្ងៃសុក្រ</option>
                      <option value={6}>រៀងរាល់ ថ្ងៃសៅរ៍</option>
                      <option value={0}>រៀងរាល់ ថ្ងៃអាទិត្យ</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ថ្ងៃទីក្នុងខែ
                    </label>
                    <select
                      value={config.dayOfMonth}
                      onChange={e => setConfig({ ...config, dayOfMonth: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value={1}>ថ្ងៃទី ១ ដើមខែ</option>
                      <option value={15}>ថ្ងៃទី ១៥ ពាក់កណ្តាលខែ</option>
                      <option value={28}>ថ្ងៃទី ២៨ ចុងខែ</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ម៉ោងដំណើរការ
                  </label>
                  <input
                    type="time"
                    value={config.timeOfDay}
                    onChange={e => setConfig({ ...config, timeOfDay: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Format & Destination Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ទម្រង់ឯកសាររបាយការណ៍
                  </label>
                  <select
                    value={config.format}
                    onChange={e => setConfig({ ...config, format: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="pdf">📄 PDF Report (របាយការណ៍បោះពុម្ព)</option>
                    <option value="html">🌐 HTML Package (ឯកសារកញ្ចប់បណ្តាញ)</option>
                    <option value="csv">📊 CSV Sheet (តារាងទិន្នន័យ)</option>
                    <option value="json">💾 JSON Snapshot (ទិន្នន័យសវនកម្មពេញលេញ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះថត Google Drive (Folder Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={config.folderName}
                    onChange={e => setConfig({ ...config, folderName: e.target.value })}
                    placeholder="PhnomPom_School_Audit_Reports"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkbox Inclusions */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800">ខ្លឹមសារដែលត្រូវរួមបញ្ចូលក្នុងរបាយការណ៍៖</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeAnomalies}
                      onChange={e => setConfig({ ...config, includeAnomalies: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">រួមបញ្ចូលភាពមិនប្រក្រតី</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeComments}
                      onChange={e => setConfig({ ...config, includeComments: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">រួមបញ្ចូលកំណត់សម្គាល់/មតិ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeHighRiskOnly}
                      onChange={e => setConfig({ ...config, includeHighRiskOnly: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-rose-700 font-semibold">កំណត់ត្រាហានិភ័យខ្ពស់តែប៉ុណ្ណោះ</span>
                  </label>
                </div>
              </div>

              {/* Next Scheduled Run Info */}
              {config.nextRunAt && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>កាលវិភាគបន្ទាប់៖ <strong>{formatKhmerFullDateTime(config.nextRunAt)}</strong></span>
                  </div>
                  <span className="text-[11px] text-blue-700 font-mono">
                    ({formatKhmerRelativeTime(config.nextRunAt)})
                  </span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleRunInstantExport}
                  disabled={isExecutingNow}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isExecutingNow ? 'កំពុងបង្កើត និងបញ្ជូន...' : 'ដំណើរការនាំចេញទៅ Drive ឥឡូវនេះ'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>រក្សាទុកកាលវិភាគ</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* History Sub-tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  កំណត់ត្រានាំចេញសង្ខេបស្វ័យប្រវត្ត (Automated Export History)
                </h4>
                <button
                  type="button"
                  onClick={handleRunInstantExport}
                  disabled={isExecutingNow}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  <span>{isExecutingNow ? 'កំពុងនាំចេញ...' : 'បង្កើត និងបញ្ជូនភ្លាមៗ'}</span>
                </button>
              </div>

              {!config.runHistory || config.runHistory.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  មិនទាន់មានប្រវត្តិនាំចេញរបាយការណ៍ស្វ័យប្រវត្តនៅឡើយទេ។
                </div>
              ) : (
                <div className="space-y-2">
                  {config.runHistory.map(run => (
                    <div
                      key={run.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{run.fileName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold text-[9.5px]">
                            {run.status === 'success' ? 'ជោគជ័យ' : 'បរាជ័យ'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatKhmerRelativeTime(run.executedAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{run.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-0.5">
                        <span>ចំនួនកំណត់ត្រា៖ <strong>{run.recordsCount}</strong></span>
                        <span>• ទំហំឯកសារ៖ <strong>{run.fileSizeKb} KB</strong></span>
                        <span>• កាលបរិច្ឆេទ៖ {formatKhmerFullDateTime(run.executedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
