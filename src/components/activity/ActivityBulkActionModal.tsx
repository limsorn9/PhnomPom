import React from 'react';
import { ActivityLogItem } from '../../types';
import { Trash2, Archive, AlertTriangle, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatKhmerRelativeTime } from '../../utils/activityTracker';

interface ActivityBulkActionModalProps {
  isOpen: boolean;
  actionType: 'delete' | 'archive' | 'unarchive';
  selectedLogs: ActivityLogItem[];
  onConfirm: () => void;
  onClose: () => void;
}

export const ActivityBulkActionModal: React.FC<ActivityBulkActionModalProps> = ({
  isOpen,
  actionType,
  selectedLogs,
  onConfirm,
  onClose
}) => {
  if (!isOpen || selectedLogs.length === 0) return null;

  const isDelete = actionType === 'delete';
  const isArchive = actionType === 'archive';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div
          className={`p-4 text-white flex items-center justify-between ${
            isDelete
              ? 'bg-gradient-to-r from-rose-900 to-rose-950'
              : 'bg-gradient-to-r from-slate-900 to-indigo-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDelete
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
              }`}
            >
              {isDelete ? <Trash2 className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold font-moul text-white">
                {isDelete
                  ? 'បញ្ជាក់ការលុបកំណត់ត្រាជាបាច់'
                  : isArchive
                  ? 'បញ្ជាក់ការបណ្ណសារទុកកំណត់ត្រា'
                  : 'ស្រង់កំណត់ត្រាចេញពីបណ្ណសារ'}
              </h3>
              <p className="text-[11px] text-slate-300">
                ចំនួនកំណត់ត្រាដែលបានជ្រើសរើស៖ <strong className="text-white">{selectedLogs.length}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              isDelete
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isDelete ? 'text-rose-600' : 'text-indigo-600'
              }`}
            />
            <div className="space-y-1">
              <p className="font-bold">
                {isDelete
                  ? `តើលោកអ្នកពិតជាចង់លុប ${selectedLogs.length} កំណត់ត្រានេះចេញពីប្រព័ន្ធមែនទេ?`
                  : `តើលោកអ្នកចង់ដាក់ ${selectedLogs.length} កំណត់ត្រានេះទៅក្នុងបណ្ណសារមែនទេ?`}
              </p>
              <p className="text-[11px] opacity-90">
                {isDelete
                  ? 'កំណត់ត្រាដែលបានលុបនឹងត្រូវដកចេញពី Audit Trail។ ដំណើរការនេះមិនអាចត្រឡប់ថយក្រោយវិញបានឡើយ។'
                  : 'កំណត់ត្រានឹងត្រូវលាក់ពីផ្ទាំងសកម្មភាពសកម្ម ប៉ុន្តែនៅតែរក្សាទុកក្នុងប្រព័ន្ធសម្រាប់សវនកម្ម។'}
              </p>
            </div>
          </div>

          {/* Preview of items to act upon */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700">
              បញ្ជីកំណត់ត្រាដែលត្រូវអនុវត្ត ({selectedLogs.length})៖
            </span>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/60 p-1">
              {selectedLogs.slice(0, 8).map((log, idx) => (
                <div key={log.id} className="p-2 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{log.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{log.description}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {formatKhmerRelativeTime(log.timestamp)}
                  </span>
                </div>
              ))}
              {selectedLogs.length > 8 && (
                <div className="p-2 text-center text-xs text-slate-500 font-semibold">
                  ... និង {selectedLogs.length - 8} កំណត់ត្រាផ្សេងទៀត
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            បោះបង់ (Cancel)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              isDelete
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {isDelete ? <Trash2 className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            <span>
              {isDelete
                ? `បញ្ជាក់ការលុប (${selectedLogs.length})`
                : isArchive
                ? `បណ្ណសារទុក (${selectedLogs.length})`
                : `ស្រង់ចេញ (${selectedLogs.length})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
