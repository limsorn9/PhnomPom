import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Send,
  Radio,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Layers,
  Users,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import {
  inspectTelegramChat,
  sendTelegramDirectMessage,
  TelegramChatInspectionData
} from '../../services/telegramService';

interface TelegramChannelValidatorProps {
  onAssignToClassroom?: (chatId: string, classroomId?: string) => void;
}

export const TelegramChannelValidator: React.FC<TelegramChannelValidatorProps> = ({ onAssignToClassroom }) => {
  const { classrooms, showToast, updateClassroom } = useSchool();
  const [chatIdInput, setChatIdInput] = useState('');
  const [customTestMessage, setCustomTestMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedClassToAssign, setSelectedClassToAssign] = useState<string>('');

  const [inspectionResult, setInspectionResult] = useState<{
    tested: boolean;
    success: boolean;
    data?: TelegramChatInspectionData;
    error?: string;
    testMessageSent?: boolean;
    latencyMs?: number;
  } | null>(null);

  const handleVerifyConnection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = chatIdInput.trim();
    if (!cleanId) {
      showToast('សូមបញ្ចូល Telegram Channel ID ឬ Group ID ជាមុនសិន!', 'error');
      return;
    }

    setIsVerifying(true);
    setInspectionResult(null);

    const startTime = Date.now();
    try {
      // Step 1: Live Inspect permissions, title, members & admin status
      const inspectRes = await inspectTelegramChat(cleanId);
      const latency = Date.now() - startTime;

      if (inspectRes.success && inspectRes.data) {
        // Step 2: Send test message to confirm bot has active write permissions
        const messageBody = customTestMessage.trim() ||
          `⚡ *ការផ្ទៀងផ្ទាត់ការតភ្ជាប់ Telegram Channel/Group ជោគជ័យ!*\n\n• ឈ្មោះប៉ុស្តិ៍: *${inspectRes.data.title}*\n• ប្រភេទ: *${inspectRes.data.type}*\n• សមាជិក: *${inspectRes.data.memberCount} នាក់*\n• ស្ថានភាព Bot: *Administrator (សិទ្ធិពេញលេញ)*\n\n🤖 *PPTC_Notify_bot* (@PPTC_Notify_bot) បានតភ្ជាប់ និងមានសិទ្ធិចាក់ផ្សាយដោយជោគជ័យ!`;

        const sendRes = await sendTelegramDirectMessage(cleanId, messageBody);

        setInspectionResult({
          tested: true,
          success: true,
          data: inspectRes.data,
          testMessageSent: sendRes.success,
          latencyMs: latency,
        });

        if (sendRes.success) {
          showToast(`ផ្ទៀងផ្ទាត់ការតភ្ជាប់ ${inspectRes.data.title} ជោគជ័យ ១០០%!`, 'success');
        } else {
          showToast(`បានរកឃើញប៉ុស្តិ៍ ប៉ុន្តែបរាជ័យក្នុងការផ្ញើសារ: ${sendRes.message}`, 'warning');
        }
      } else {
        setInspectionResult({
          tested: true,
          success: false,
          error: inspectRes.error || 'មិនអាចស្វែងរក ឬតភ្ជាប់ទៅកាន់ Channel ID នេះបានទេ',
          latencyMs: latency,
        });
        showToast(inspectRes.error || 'ការផ្ទៀងផ្ទាត់បរាជ័យ! សូមពិនិត្យមើលសិទ្ធិ Bot ក្នុងប៉ុស្តិ៍', 'error');
      }
    } catch (err: any) {
      setInspectionResult({
        tested: true,
        success: false,
        error: err?.message || 'Network error occurred',
        latencyMs: Date.now() - startTime,
      });
      showToast('កំហុសក្នុងការផ្ទៀងផ្ទាត់: ' + err?.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickAssign = (classroomId: string) => {
    if (!classroomId || !chatIdInput.trim()) {
      showToast('សូមជ្រើសរើសថ្នាក់រៀនដើម្បីភ្ជាប់!', 'error');
      return;
    }
    const targetClass = classrooms.find(c => c.id === classroomId);
    if (targetClass) {
      updateClassroom({
        ...targetClass,
        telegramChatId: chatIdInput.trim(),
      });
      showToast(`បានភ្ជាប់ Chat ID ${chatIdInput} ទៅកាន់ "${targetClass.name}" ដោយជោគជ័យ!`, 'success');
      if (onAssignToClassroom) onAssignToClassroom(chatIdInput.trim(), classroomId);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(chatIdInput.trim());
    setCopied(true);
    showToast('បានចម្លង ID!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Card & Verification Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              ផ្ទៀងផ្ទាត់ការតភ្ជាប់ Telegram Channel/Group (Verify Connection)
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Bot Admin Permission Tester
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              បញ្ចូល Channel ID ឬ Group ID និងចុច <b>"Verify Connection"</b> ដើម្បីផ្ទៀងផ្ទាត់សិទ្ធិ Admin របស់ Bot មុនពេលចាត់តាំងទៅថ្នាក់រៀន។
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerifyConnection} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>បញ្ចូល Telegram Channel ID ឬ Group ID:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                ឧទាហរណ៍: <code className="bg-slate-100 px-1 rounded text-indigo-600 font-mono">-1002495819001</code> ឬ <code className="bg-slate-100 px-1 rounded text-indigo-600 font-mono">240224709</code>
              </span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="ឧ. -1002495819001 ឬ @school_channel"
                  value={chatIdInput}
                  onChange={e => setChatIdInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {chatIdInput && (
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-1"
                    title="ចម្លង ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying || !chatIdInput.trim()}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Zap className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Verify Connection'}</span>
              </button>
            </div>
          </div>

          {/* Quick presets for existing classrooms */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
              💡 ជ្រើសរើស Chat ID ពីថ្នាក់រៀនដែលមានស្រាប់ (Quick Fill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {classrooms.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChatIdInput(c.telegramChatId || '')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    chatIdInput === c.telegramChatId
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.telegramChatId && <span className="opacity-70 font-mono ml-1">({c.telegramChatId})</span>}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setChatIdInput('240224709')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50"
              >
                👥 ក្រុមលោកគ្រូ-អ្នកគ្រូ (240224709)
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Diagnostic Inspection Result Card */}
      {inspectionResult && (
        <div
          className={`rounded-3xl border p-6 shadow-sm space-y-5 animate-in fade-in zoom-in duration-150 ${
            inspectionResult.success
              ? 'bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border-emerald-200'
              : 'bg-gradient-to-br from-rose-50/80 via-orange-50/40 to-white border-rose-200'
          }`}
        >
          {/* Diagnostic Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-slate-200/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                  inspectionResult.success ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-rose-600 shadow-rose-600/20'
                }`}
              >
                {inspectionResult.success ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">
                    {inspectionResult.success
                      ? 'លទ្ធផលផ្ទៀងផ្ទាត់: ការតភ្ជាប់ជោគជ័យ (Verified & Ready)'
                      : 'លទ្ធផលផ្ទៀងផ្ទាត់: មិនអាចតភ្ជាប់បាន (Connection Failed)'}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inspectionResult.success ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    Latency: ~{inspectionResult.latencyMs}ms
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {inspectionResult.success
                    ? 'Bot មានសិទ្ធិ Administrator និងអាចចាក់ផ្សាយសារចូលក្នុង Channel/Group នេះបានយ៉ាងរលូន។'
                    : 'សូមពិនិត្យមើលសារកំហុសខាងក្រោម និងធ្វើតាមការណែនាំដើម្បីដោះស្រាយ។'}
                </p>
              </div>
            </div>

            {inspectionResult.success && inspectionResult.testMessageSent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>បានផ្ញើសារសាកល្បងជោគជ័យ</span>
              </span>
            )}
          </div>

          {/* If Success: Show Channel Metadata & Admin Permissions Checklist */}
          {inspectionResult.success && inspectionResult.data && (
            <div className="space-y-4">
              {/* Channel Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-slate-400 block">ឈ្មោះប៉ុស្តិ៍ / ក្រុម (Title):</span>
                  <span className="font-bold text-slate-800 text-sm font-battambang">{inspectionResult.data.title}</span>
                </div>

                <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-slate-400 block">ប្រភេទ Chat (Type):</span>
                  <span className="font-bold text-indigo-700 uppercase">{inspectionResult.data.type}</span>
                </div>

                <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-slate-400 block">ចំនួនសមាជិក (Members):</span>
                  <span className="font-bold text-slate-800 font-mono">{inspectionResult.data.memberCount} នាក់</span>
                </div>
              </div>

              {/* Bot Admin Permissions Checklist */}
              <div className="bg-white/90 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ការផ្ទៀងផ្ទាត់សិទ្ធិ Bot Admin Permissions Checklist:</span>
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Can Post Messages</span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Can Edit Messages</span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Can Pin & Delete</span>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Can Invite Members</span>
                  </div>
                </div>
              </div>

              {/* Quick Assign Section */}
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    ភ្ជាប់ Channel ID នេះទៅកាន់ថ្នាក់រៀនភ្លាមៗ (Quick Assign):
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedClassToAssign}
                    onChange={e => setSelectedClassToAssign(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 font-battambang"
                  >
                    <option value="">-- ជ្រើសរើសថ្នាក់រៀនដើម្បីភ្ជាប់ --</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.telegramChatId ? `(បច្ចុប្បន្ន: ${c.telegramChatId})` : '(មិនទាន់មាន ID)'}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleQuickAssign(selectedClassToAssign)}
                    disabled={!selectedClassToAssign}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>រក្សាទុកភ្ជាប់ទៅថ្នាក់</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* If Failed: Troubleshooting Guidance */}
          {!inspectionResult.success && (
            <div className="space-y-3 bg-white/90 p-4 rounded-2xl border border-rose-200">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>មូលហេតុដែលមិនអាចតភ្ជាប់បាន:</span>
              </div>
              <p className="text-xs font-mono text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {inspectionResult.error || 'Chat not found / Bot not admin'}
              </p>

              <div className="text-xs text-slate-600 space-y-1.5 font-battambang">
                <p className="font-bold text-slate-800">💡 ជំហានដោះស្រាយដើម្បីតភ្ជាប់:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-2">
                  <li>បើកកម្មវិធី Telegram រួចចូលទៅកាន់ Group ឬ Channel របស់អ្នក។</li>
                  <li>ចុចលើឈ្មោះក្រុម &gt; Add Member &gt; ស្វែងរក <b>@PPTC_Notify_bot</b> ហើយ Add ចូល។</li>
                  <li>
                    កំណត់សិទ្ធិ <b>Promote to Administrator</b> ឱ្យ Bot អាចផ្ញើសារបាន (Post Messages: ON)។
                  </li>
                  <li>ផ្ញើសារសាកល្បងមួយម៉ាត់ក្នុងក្រុម (ឧ. "Hello") រួចត្រឡប់មកចុច <b>"Verify Connection"</b> ឡើងវិញ។</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
