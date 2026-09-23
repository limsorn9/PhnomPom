import React, { useState, useMemo } from 'react';
import {
  ActivityLogItem
} from '../../types';
import {
  compareTwoLogs,
  formatKhmerFullDateTime,
  formatKhmerRelativeTime
} from '../../utils/activityTracker';
import {
  GitCompare,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Shield,
  Tag,
  Layers,
  FileSpreadsheet,
  ArrowLeftRight,
  Filter,
  Eye,
  Check,
  Building
} from 'lucide-react';

interface ActivityDiffModalProps {
  logA: ActivityLogItem;
  logB: ActivityLogItem;
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternativeLog?: (log: ActivityLogItem) => void;
  allLogs?: ActivityLogItem[];
}

export const ActivityDiffModal: React.FC<ActivityDiffModalProps> = ({
  logA,
  logB,
  isOpen,
  onClose,
  onSelectAlternativeLog,
  allLogs = []
}) => {
  const [showOnlyModified, setShowOnlyModified] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'raw'>('visual');

  // Compute Diff
  const diffResult = useMemo(() => {
    return compareTwoLogs(logA, logB);
  }, [logA, logB]);

  if (!isOpen) return null;

  const displayedFields = showOnlyModified
    ? diffResult.fields.filter(f => f.status !== 'identical')
    : diffResult.fields;

  // Find other logs for same entity to allow quick switching
  const relatedLogs = allLogs.filter(
    l => (l.entityId === logA.entityId || l.entityName === logA.entityName) && l.id !== logA.id && l.id !== logB.id
  );

  return (
    <div
      id="activity-diff-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="activity-diff-modal-container"
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-slate-800/40">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                ប្រៀបធៀបបម្រែបម្រួលទិន្នន័យ (Audit Diff Comparison)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>គំលាតពេលវេលា៖ <strong className="text-indigo-600 dark:text-indigo-400">{diffResult.timeDeltaFormatted}</strong></span>
                <span>•</span>
                <span>{diffResult.sameEntity ? 'ទិន្នន័យលើអង្គភាព/សិស្សតែមួយ' : 'ប្រៀបធៀបទិន្នន័យពីរផ្សេងគ្នា'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              type="button"
              id="btn-toggle-diff-modified-only"
              onClick={() => setShowOnlyModified(!showOnlyModified)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showOnlyModified
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showOnlyModified ? 'បង្ហាញតែវាលដែលកែប្រែ' : 'បង្ហាញវាលទាំងអស់'}</span>
            </button>

            <button
              id="btn-close-diff-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diff Summary Bar */}
        <div className="px-6 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4">
            <span className="text-slate-600 dark:text-slate-400">
              វាលសរុប៖ <strong className="text-slate-800 dark:text-white">{diffResult.changesSummary.totalFields}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              កែប្រែ {diffResult.changesSummary.modifiedCount} វាល
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700">
              ដូចគ្នា {diffResult.changesSummary.identicalCount} វាល
            </span>
          </div>

          {relatedLogs.length > 0 && onSelectAlternativeLog && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>កំណត់ត្រាផ្សេងទៀតរបស់អង្គភាពនេះ៖</span>
              <div className="flex gap-1">
                {relatedLogs.slice(0, 2).map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectAlternativeLog(r)}
                    className="px-2 py-0.5 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 text-indigo-600 dark:text-indigo-400"
                  >
                    {formatKhmerRelativeTime(r.timestamp)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Side-by-Side Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version A Card */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 relative">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  កំណត់ត្រា A (កំណែមុន / ជ្រើសរើស)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatKhmerFullDateTime(logA.timestamp)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                  {logA.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {logA.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">ឈ្មោះទិន្នន័យ</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{logA.entityName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">អ្នកអនុវត្ត</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{logA.actorName} ({logA.actorRole})</span>
                </div>
              </div>
            </div>

            {/* Version B Card */}
            <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3 relative">
              <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-800/60 pb-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                  កំណត់ត្រា B (កំណែក្រោយ / ជ្រើសរើស)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatKhmerFullDateTime(logB.timestamp)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                  {logB.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {logB.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">ឈ្មោះទិន្នន័យ</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{logB.entityName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">អ្នកអនុវត្ត</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{logB.actorName} ({logB.actorRole})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Field Diff Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
              <span>ការប្រៀបធៀបវាលទិន្នន័យជាក់លាក់ (Field-by-Field Matrix):</span>
            </h4>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 w-1/4">ឈ្មោះវាលទិន្នន័យ (Field)</th>
                    <th className="py-3 px-4 w-[35%] bg-slate-50/50 dark:bg-slate-800/40">តម្លៃក្នុងកំណត់ត្រា A</th>
                    <th className="py-3 px-4 w-[35%] bg-indigo-50/30 dark:bg-indigo-950/20">តម្លៃក្នុងកំណត់ត្រា B</th>
                    <th className="py-3 px-3 w-16 text-center">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedFields.map(field => {
                    const isMod = field.status === 'modified';
                    const isAdded = field.status === 'added_in_b';
                    const isRemoved = field.status === 'removed_in_b';

                    return (
                      <tr
                        key={field.key}
                        className={`transition-colors ${
                          isMod
                            ? 'bg-amber-50/40 dark:bg-amber-950/20'
                            : isAdded
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/20'
                            : isRemoved
                            ? 'bg-rose-50/30 dark:bg-rose-950/20'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {field.labelKhmer}
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            {field.key}
                          </span>
                        </td>

                        {/* Value A */}
                        <td className={`py-3 px-4 ${isMod ? 'text-rose-700 dark:text-rose-400 font-medium bg-rose-50/30 dark:bg-rose-950/30' : 'text-slate-600 dark:text-slate-400'}`}>
                          {String(field.valueA)}
                        </td>

                        {/* Value B */}
                        <td className={`py-3 px-4 ${isMod ? 'text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50/30 dark:bg-emerald-950/30' : 'text-slate-600 dark:text-slate-400'}`}>
                          {String(field.valueB)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center">
                          {isMod && (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200">
                              កែប្រែ
                            </span>
                          )}
                          {isAdded && (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200">
                              ថ្មី
                            </span>
                          )}
                          {isRemoved && (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-200">
                              ដកចេញ
                            </span>
                          )}
                          {field.status === 'identical' && (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              ដូចគ្នា
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            ឧបករណ៍សវនកម្មបម្រែបម្រួលទិន្នន័យ (Audit Log Diff Viewer)
          </div>
          <button
            type="button"
            id="btn-dismiss-diff-modal"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
