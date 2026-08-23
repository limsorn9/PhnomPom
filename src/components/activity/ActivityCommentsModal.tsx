import React, { useState } from 'react';
import { ActivityLogItem, ActivityLogComment } from '../../types';
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  X,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  Tag,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { formatKhmerRelativeTime, formatKhmerFullDateTime } from '../../utils/activityTracker';
import { addCommentToLog, deleteCommentFromLog, getCommentsForLog } from '../../utils/activityCommentManager';

interface ActivityCommentsModalProps {
  item: ActivityLogItem;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onLogsUpdated: (updatedLogs: ActivityLogItem[]) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ActivityCommentsModal: React.FC<ActivityCommentsModalProps> = ({
  item,
  isOpen,
  onClose,
  currentUser,
  onLogsUpdated,
  showToast
}) => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState(
    currentUser?.nameKhmer || currentUser?.nameLatin || 'គណៈគ្រប់គ្រងសាលា'
  );
  const [authorRole, setAuthorRole] = useState(
    currentUser?.role === 'director' ? 'នាយកសាលារៀន' : 'រដ្ឋបាល/សវនករ'
  );

  const comments = getCommentsForLog(item.id, item);

  if (!isOpen) return null;

  const quickTemplates = [
    'បានពិនិត្យ និងផ្ទៀងផ្ទាត់ជាមួយនាយកសាលារួចរាល់',
    'ជាការកែសម្រួលទិន្នន័យស្របតាមសំណើសុំច្បាប់របស់សិស្ស/អាណាព្យាបាល',
    'បានផ្ទៀងផ្ទាត់ឯកសារយោង និងបង្កាន់ដៃហិរញ្ញវត្ថុត្រឹមត្រូវ',
    'សកម្មភាពចាំបាច់ក្នុងកិច្ចការរដ្ឋបាលបន្ទាន់',
    'បានពិនិត្យផ្ទៀងផ្ទាត់បញ្ជីពិន្ទុជាមួយគ្រូបន្ទុកថ្នាក់',
    'បានណែនាំបុគ្គលិកកុំឱ្យធ្វើប្រតិបត្តិការក្រៅម៉ោងបន្តទៀត'
  ];

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;

    const { updatedLogs } = addCommentToLog(
      item.id,
      commentText.trim(),
      authorName.trim(),
      authorRole.trim()
    );

    onLogsUpdated(updatedLogs);
    setCommentText('');
    showToast('បានបន្ថែមមតិយោបល់/កំណត់សម្គាល់សវនកម្មជោគជ័យ!', 'success');
  };

  const handleDeleteComment = (commentId: string) => {
    const { updatedLogs } = deleteCommentFromLog(item.id, commentId);
    onLogsUpdated(updatedLogs);
    showToast('បានលុបមតិយោបល់រួចរាល់', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <MessageSquare className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-moul text-white">
                កំណត់សម្គាល់ & មតិយោបល់សវនកម្ម (Audit Notes)
              </h3>
              <p className="text-[11px] text-slate-300">
                បន្ថែមបរិបទ និងកំណត់ត្រាបញ្ជាក់លើសកម្មភាពរដ្ឋបាល
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Target Activity Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">{item.title}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {formatKhmerRelativeTime(item.timestamp)}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80 text-[10.5px] text-slate-500">
              <span>អ្នកធ្វើ៖ <strong className="text-slate-700">{item.actorName}</strong> ({item.actorRole})</span>
              {item.entityName && (
                <span>• គោលដៅ៖ <strong className="text-slate-700">{item.entityName}</strong></span>
              )}
              {item.financialAmountRiel && (
                <span>• ទឹកប្រាក់៖ <strong className="text-emerald-700 font-mono font-bold">{item.financialAmountRiel.toLocaleString()} ៛</strong></span>
              )}
            </div>
          </div>

          {/* Quick Note Templates */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>គំរូកំណត់សម្គាល់រហ័ស (Quick Templates)៖</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCommentText(tpl)}
                  className="px-2.5 py-1 bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 border border-blue-200/70 rounded-lg text-[10.5px] text-left transition-colors cursor-pointer"
                >
                  + {tpl}
                </button>
              ))}
            </div>
          </div>

          {/* New Comment Input Form */}
          <form onSubmit={handleAddComment} className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                  ឈ្មោះអ្នកកត់ត្រា
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                  តួនាទី / មុខងារ
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ខ្លឹមសារមតិយោបល់ / កំណត់សម្គាល់ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="សរសេរមូលហេតុ បរិបទបន្ថែម ឬលេខយោងឯកសារសម្រាប់សវនកម្មថ្ងៃក្រោយ..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>បន្ថែមមតិយោបល់</span>
              </button>
            </div>
          </form>

          {/* Existing Comments Timeline */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>ប្រវត្តិកំណត់សម្គាល់ ({comments.length})</span>
              </div>
            </h4>

            {comments.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                មិនទាន់មានមតិយោបល់ ឬកំណត់សម្គាល់បន្ថែមនៅឡើយទេ។
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map(c => (
                  <div
                    key={c.id}
                    className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{c.authorName}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                          {c.authorRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatKhmerRelativeTime(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11.5px] bg-white p-2 rounded-lg border border-blue-200/50">
                        {c.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="លុបកំណត់សម្គាល់នេះ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
