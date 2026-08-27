import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Download,
  AlertTriangle,
  Users,
  Eye,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  ExternalLink,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import {
  BotActivityLogItem,
  getStoredBotActivityLogs,
  addBotActivityLog,
  clearStoredBotActivityLogs,
  sendTelegramDirectMessage
} from '../../services/telegramService';

interface TelegramBotActivityLogProps {
  onSelectGroup?: (groupId: string) => void;
}

export const TelegramBotActivityLog: React.FC<TelegramBotActivityLogProps> = ({ onSelectGroup }) => {
  const { showToast } = useSchool();
  const [logs, setLogs] = useState<BotActivityLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed' | 'queued'>('all');
  const [selectedLogForModal, setSelectedLogForModal] = useState<BotActivityLogItem | null>(null);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = () => {
    try {
      const items = getStoredBotActivityLogs();
      setLogs(items);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      fetchLogs();
      setIsRefreshing(false);
      showToast('បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រា Bot Activity Log!', 'success');
    }, 400);
  };

  const handleCopyChatId = (chatId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(chatId));
    setCopiedId(String(chatId));
    showToast(`បានចម្លង Chat ID: ${chatId}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetryTransmission = async (logItem: BotActivityLogItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRetryingLogId(logItem.id);
    showToast(`កំពុងផ្ញើសារឡើងវិញទៅកាន់ ${logItem.destinationName}...`, 'info');

    try {
      const messageToSend = logItem.fullMessage || logItem.messageSnippet;
      const res = await sendTelegramDirectMessage(logItem.destinationChatId, messageToSend);

      if (res.success) {
        // Record retry success into logs
        addBotActivityLog({
          destinationChatId: logItem.destinationChatId,
          destinationName: logItem.destinationName,
          category: logItem.category,
          triggeredByName: logItem.triggeredByName + ' (Retry)',
          triggeredByRole: logItem.triggeredByRole,
          messageSnippet: `[ផ្ញើឡើងវិញជោគជ័យ] ${logItem.messageSnippet}`,
          fullMessage: messageToSend,
          status: 'success',
          latencyMs: 40,
        });

        showToast(`ផ្ញើសារឡើងវិញទៅ ${logItem.destinationName} ជោគជ័យ!`, 'success');
        fetchLogs();
        if (selectedLogForModal?.id === logItem.id) {
          setSelectedLogForModal(prev => prev ? { ...prev, status: 'success', errorMessage: undefined } : null);
        }
      } else {
        showToast(res.message || 'ការផ្ញើសារឡើងវិញបរាជ័យ', 'error');
      }
    } catch (err: any) {
      showToast('កំហុសក្នុងការផ្ញើសារឡើងវិញ: ' + err?.message, 'error');
    } finally {
      setRetryingLogId(null);
    }
  };

  const handleClearLogs = () => {
    if (window.confirm('តើអ្នកពិតជាចង់សម្អាតបញ្ជីកំណត់ត្រា Bot Activity Log ទាំងអស់មែនទេ?')) {
      clearStoredBotActivityLogs();
      setLogs([]);
      showToast('បានសម្អាតកំណត់ត្រា Bot Activity Log រួចរាល់!', 'info');
    }
  };

  const handleExportLogs = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `telegram_bot_activity_logs_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('បានទាញយកឯកសារកំណត់ត្រាជា JSON!', 'success');
    } catch (err) {
      showToast('បរាជ័យក្នុងការទាញយកឯកសារ', 'error');
    }
  };

  // Filter logs based on search query, category, and status
  const filteredLogs = logs.filter(item => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.destinationChatId).includes(searchQuery) ||
      item.triggeredByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.messageSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'attendance':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">📊 វត្តមាន</span>;
      case 'finance':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">💰 ហិរញ្ញវត្ថុ</span>;
      case 'exam':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">📝 ពិន្ទុ & លទ្ធផល</span>;
      case 'announcement':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">📢 ដំណឹងផ្លូវការ</span>;
      case 'security':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">🔐 សុវត្ថិភាព/OTP</span>;
      case 'automated':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">⏰ កាលវិភាគអូតូ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">🏫 ទូទៅ</span>;
    }
  };

  const getStatusBadge = (status: 'success' | 'failed' | 'queued', errorMsg?: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ជោគជ័យ (200 OK)</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200" title={errorMsg}>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>បរាជ័យ (Failed)</span>
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>ក្នុង Queue</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls & Filter Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                កំណត់ត្រាសកម្មភាពបញ្ជូនសារ Bot (Bot Activity Log)
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {filteredLogs.length} កំណត់ត្រា
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                កត់ត្រារាល់សារស្វ័យប្រវត្ត និងការចាក់ផ្សាយដំណឹង ព្រមទាំងជួយដោះស្រាយបញ្ហា (Troubleshoot) នៅពេលផ្ញើមិនចេញ។
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="ផ្ទុកឡើងវិញ"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExportLogs}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleClearLogs}
              className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors"
              title="សម្អាតកំណត់ត្រាទាំងអស់"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះក្រុម, Chat ID, ឈ្មោះគ្រូ, ឬខ្លឹមសារ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-battambang"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 font-battambang"
            >
              <option value="all">📁 គ្រប់ប្រភេទសារ (All)</option>
              <option value="attendance">📊 វត្តមានសិស្ស</option>
              <option value="finance">💰 ហិរញ្ញវត្ថុ & វិក្កយបត្រ</option>
              <option value="exam">📝 ពិន្ទុ & លទ្ធផលតេស្ត</option>
              <option value="announcement">📢 ដំណឹងផ្លូវការ</option>
              <option value="security">🔐 សុវត្ថិភាព & OTP</option>
              <option value="automated">⏰ កាលវិភាគអូតូ</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 font-battambang"
            >
              <option value="all">⚡ គ្រប់ស្ថានភាព (All Status)</option>
              <option value="success">✅ ជោគជ័យ (Success Only)</option>
              <option value="failed">❌ បរាជ័យ (Failed / Troubleshooting)</option>
              <option value="queued">⏳ ក្នុង Queue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Activity Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">🕒 ពេលវេលា</th>
                <th className="py-3 px-4">🎯 គោលដៅ (Destination Group)</th>
                <th className="py-3 px-4">👤 អ្នកបញ្ជូន (Triggered By)</th>
                <th className="py-3 px-4">📝 ប្រភេទ & ខ្លឹមសារ</th>
                <th className="py-3 px-4">⚡ ស្ថានភាព</th>
                <th className="py-3 px-4 text-center">⚙️ សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-sm">មិនមានទិន្នន័យ Bot Activity Log ស្របតាមការស្វែងរកឡើយ</p>
                      <p className="text-xs text-slate-400">រាល់សារដែលផ្ញើចេញពីប្រព័ន្ធ នឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedLogForModal(item)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium font-battambang">
                      {item.timestamp}
                    </td>

                    {/* Destination Group / Chat ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{item.destinationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>ID: {item.destinationChatId}</span>
                        <button
                          type="button"
                          onClick={e => handleCopyChatId(item.destinationChatId, e)}
                          className="hover:text-indigo-600 transition-colors p-0.5"
                          title="ចម្លង Chat ID"
                        >
                          {copiedId === String(item.destinationChatId) ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Triggered By (Teacher/Admin) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{item.triggeredByName}</div>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">
                        {item.triggeredByRole}
                      </span>
                    </td>

                    {/* Message Snippet & Category */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="mb-1">{getCategoryBadge(item.category)}</div>
                      <p className="text-slate-600 truncate font-battambang" title={item.messageSnippet}>
                        {item.messageSnippet}
                      </p>
                    </td>

                    {/* Status & Error Reason if any */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>{getStatusBadge(item.status, item.errorMessage)}</div>
                      {item.errorMessage && (
                        <p className="text-[10px] text-rose-600 truncate max-w-[160px] mt-1 font-mono" title={item.errorMessage}>
                          ⚠️ {item.errorMessage}
                        </p>
                      )}
                    </td>

                    {/* Actions: Retry / View Details */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {item.status === 'failed' ? (
                          <button
                            type="button"
                            onClick={e => handleRetryTransmission(item, e)}
                            disabled={retryingLogId === item.id}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all animate-pulse"
                            title="ផ្ញើសារឡើងវិញភ្លាមៗ (Retry)"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingLogId === item.id ? 'animate-spin' : ''}`} />
                            <span>{retryingLogId === item.id ? 'កំពុង Retry...' : 'Retry ផ្ញើ'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedLogForModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>មើលលម្អិត</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>
            បង្ហាញ <b>{filteredLogs.length}</b> ក្នុងចំណោម <b>{logs.length}</b> សារដែលបានបញ្ជូន
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {logs.filter(l => l.status === 'success').length} ជោគជ័យ
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-bold">
              <XCircle className="w-3.5 h-3.5" />
              {logs.filter(l => l.status === 'failed').length} បរាជ័យ
            </span>
          </div>
        </div>
      </div>

      {/* Detail Modal for troubleshooting */}
      {selectedLogForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  📋
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    ព័ត៌មានលម្អិតនៃការបញ្ជូនសារ (Transmission Diagnostics)
                  </h3>
                  <p className="text-xs text-slate-400">{selectedLogForModal.timestamp}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLogForModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Diagnostic Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">គោលដៅ (Destination):</span>
                <span className="font-bold text-slate-800">{selectedLogForModal.destinationName}</span>
                <span className="block font-mono text-slate-500 text-[11px] mt-0.5">
                  ID: {selectedLogForModal.destinationChatId}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">អ្នកផ្ញើ / អ្នកទទួលខុសត្រូវ:</span>
                <span className="font-bold text-slate-800">{selectedLogForModal.triggeredByName}</span>
                <span className="block text-indigo-600 font-semibold text-[11px] mt-0.5">
                  តួនាទី: {selectedLogForModal.triggeredByRole}
                </span>
              </div>
            </div>

            {/* Status box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block mb-1">ស្ថានភាពបញ្ជូន (Status):</span>
                {getStatusBadge(selectedLogForModal.status, selectedLogForModal.errorMessage)}
              </div>

              {selectedLogForModal.latencyMs && (
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Latency:</span>
                  <span className="font-mono font-bold text-slate-700">~{selectedLogForModal.latencyMs}ms</span>
                </div>
              )}
            </div>

            {/* Troubleshooting message if failed */}
            {selectedLogForModal.status === 'failed' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>មូលហេតុដែលមិនអាចផ្ញើសារបាន (Troubleshooting Guide):</span>
                </div>
                <p className="text-xs font-mono bg-white/80 p-2 rounded-xl border border-rose-200 text-rose-800">
                  {selectedLogForModal.errorMessage || 'Unknown transmission error'}
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed font-battambang">
                  💡 <b>ដំណោះស្រាយ:</b> សូមប្រាកដថាបាន Add Telegram Bot (<b>@TGPPTC_Notify_bot</b>) ចូលក្នុងក្រុមនេះ និងផ្តល់សិទ្ធិជា <b>Administrator</b> រួចចុចប៊ូតុង Retry ខាងក្រោម។
                </p>
              </div>
            )}

            {/* Message Payload Box */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">ខ្លឹមសារសារពេញលេញ (Message Body):</span>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-slate-800">
                {selectedLogForModal.fullMessage || selectedLogForModal.messageSnippet}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLogForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                បិទផ្ទាំង
              </button>

              <button
                type="button"
                onClick={() => handleRetryTransmission(selectedLogForModal)}
                disabled={retryingLogId === selectedLogForModal.id}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${retryingLogId === selectedLogForModal.id ? 'animate-spin' : ''}`} />
                <span>{retryingLogId === selectedLogForModal.id ? 'កំពុងផ្ញើឡើងវិញ...' : 'ផ្ញើសារឡើងវិញ (Retry Send)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
