import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  getDetectedTelegramGroups,
  scanTelegramGroupUpdates,
  inspectTelegramChat,
  sendTelegramDirectMessage,
  DetectedTelegramGroup,
  TelegramChatInspectionData
} from '../../services/telegramService';
import {
  Search,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  Send,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Plus,
  HelpCircle,
  Sliders,
  ChevronRight,
  Radio,
  Building2,
  GraduationCap,
  MessageSquare
} from 'lucide-react';

interface TelegramGroupIdInspectorProps {
  onAssignChatId?: (chatId: string, groupTitle: string) => void;
  inlineMode?: boolean;
}

export const TelegramGroupIdInspector: React.FC<TelegramGroupIdInspectorProps> = ({
  onAssignChatId,
  inlineMode = false,
}) => {
  const { classrooms, updateClassroom, teachers, showToast, currentUser } = useSchool();
  const isPrincipal = currentUser?.role === 'director' || currentUser?.role === 'super_admin';

  // Detected Groups
  const [detectedGroups, setDetectedGroups] = useState<DetectedTelegramGroup[]>([]);
  const [isLoadingDetected, setIsLoadingDetected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inspector State
  const [inputChatId, setInputChatId] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<TelegramChatInspectionData | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  // Test Ping State
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string; time: string } | null>(null);

  // Quick Assignment Modal
  const [assigningGroup, setAssigningGroup] = useState<{ chatId: string; title: string } | null>(null);
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedSpecialTarget, setSelectedSpecialTarget] = useState<string>('teachers');
  const [assignMode, setAssignMode] = useState<'class' | 'special'>('class');

  // Load detected groups on mount
  useEffect(() => {
    loadDetected();
  }, []);

  const loadDetected = async () => {
    setIsLoadingDetected(true);
    try {
      const res = await getDetectedTelegramGroups();
      if (res.success && res.groups) {
        setDetectedGroups(res.groups);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetected(false);
    }
  };

  const handleScanUpdates = async () => {
    setIsScanning(true);
    try {
      const res = await scanTelegramGroupUpdates();
      if (res.success) {
        setDetectedGroups(res.groups);
        showToast(`🔍 ${res.message}`, 'success');
      } else {
        showToast('មិនអាចស្កេនទិន្នន័យពី Telegram API បានទេ', 'warning');
      }
    } catch (err: any) {
      showToast('កំហុសក្នុងការស្កេន៖ ' + err.message, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleInspectChat = async (targetId?: string) => {
    const idToInspect = (targetId || inputChatId).trim();
    if (!idToInspect) {
      showToast('សូមបញ្ចូល Telegram Chat ID ឬ @username ដើម្បីឆែក!', 'warning');
      return;
    }

    setIsInspecting(true);
    setInspectionError(null);
    setInspectionResult(null);
    setPingResult(null);

    try {
      const res = await inspectTelegramChat(idToInspect);
      if (res.success && res.data) {
        setInspectionResult(res.data);
        setInputChatId(res.data.chatId);
        showToast(`✅ បានឆែកព័ត៌មានក្រុម «${res.data.title}» ជោគជ័យ!`, 'success');
      } else {
        setInspectionError(res.error || 'រកមិនឃើញព័ត៌មានក្រុមនេះទេ សូមពិនិត្យមើល Chat ID ឡើងវិញ');
      }
    } catch (err: any) {
      setInspectionError(err?.message || 'កំហុសបច្ចេកទេសក្នុងការទាក់ទង Telegram API');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`📋 បានចម្លង Chat ID: ${id}`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestPing = async (chatIdToTest: string, groupTitle?: string) => {
    setIsTestingPing(true);
    setPingResult(null);
    try {
      const pingMsg = `🔔 *តេស្តសាកល្បងការតភ្ជាប់ (Connection Ping Test)*\n\n🏫 *សាលាបឋមសិក្សាភ្នំពុំ*\n🎯 គោលដៅ៖ ${groupTitle || 'ក្រុម Telegram'}\n🆔 Chat ID: \`${chatIdToTest}\`\n⚡ ស្ថានភាព៖ *ដំណើរការល្អឥតខ្ចោះ 100%*\n🕒 ម៉ោង៖ _${new Date().toLocaleTimeString('km-KH')}_`;
      
      const res = await sendTelegramDirectMessage(chatIdToTest, pingMsg);
      if (res.success) {
        setPingResult({
          success: true,
          message: 'បានផ្ញើសារតេស្ត Ping ទៅកាន់ក្រុមជោគជ័យ!',
          time: new Date().toLocaleTimeString('km-KH'),
        });
        showToast(`✅ បានផ្ញើសារ Ping ទៅកាន់ ${groupTitle || chatIdToTest} ជោគជ័យ!`, 'success');
      } else {
        setPingResult({
          success: false,
          message: res.error || 'ការផ្ញើសារ Ping បរាជ័យ (សូមប្រាកដថា Bot ជា Admin ក្នុងក្រុម)',
          time: new Date().toLocaleTimeString('km-KH'),
        });
        showToast(`❌ បរាជ័យ៖ ${res.error || 'មិនអាចផ្ញើសារបានទេ'}`, 'error');
      }
    } catch (err: any) {
      setPingResult({
        success: false,
        message: err.message || 'កំហុសបណ្តាញ',
        time: new Date().toLocaleTimeString('km-KH'),
      });
      showToast('❌ កំហុសបណ្តាញ៖ ' + err.message, 'error');
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleExecuteAssign = () => {
    if (!assigningGroup) return;

    if (onAssignChatId) {
      onAssignChatId(assigningGroup.chatId, assigningGroup.title);
      setAssigningGroup(null);
      return;
    }

    if (assignMode === 'class') {
      const cls = classrooms.find(c => c.id === selectedTargetClassId);
      if (cls) {
        updateClassroom(cls.id, {
          telegramChatId: assigningGroup.chatId,
          telegramGroupName: assigningGroup.title,
        });
        showToast(`🎉 បានកំណត់ Chat ID ទៅកាន់ «ថ្នាក់ទី ${cls.grade}${cls.section}» ជោគជ័យ!`, 'success');
      }
    } else {
      // Special group
      const saved = localStorage.getItem('phnom_pom_special_telegram_groups');
      let list: any[] = [];
      if (saved) {
        try { list = JSON.parse(saved); } catch {}
      }
      const matchIndex = list.findIndex(g => g.category === selectedSpecialTarget || g.id === selectedSpecialTarget);
      if (matchIndex >= 0) {
        list[matchIndex].chatId = assigningGroup.chatId;
        list[matchIndex].nameKhmer = assigningGroup.title;
      } else {
        list.push({
          id: `grp-${selectedSpecialTarget}`,
          nameKhmer: assigningGroup.title,
          category: selectedSpecialTarget,
          chatId: assigningGroup.chatId,
          description: 'ក្រុមតេលេក្រាមដែលបានភ្ជាប់ថ្មី',
          memberCountNote: 'សមាជិកទូទៅ'
        });
      }
      localStorage.setItem('phnom_pom_special_telegram_groups', JSON.stringify(list));
      showToast(`🎉 បានកំណត់ Chat ID ទៅកាន់ក្រុមពិសេសជោគជ័យ!`, 'success');
    }

    setAssigningGroup(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Telegram Group ID Inspector & Diagnostic Hub
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>🔍 ឧបករណ៍ស្កេន & ឆែកអាយឌីក្រុម Telegram</span>
            </h2>
            <p className="text-blue-100/90 text-sm mt-1 max-w-2xl">
              ស្វែងរក Chat ID នៃគ្រប់ក្រុមថ្នាក់រៀន ក្រុមលោកគ្រូ-អ្នកគ្រូ និងប៉ុស្តិ៍សាលាដោយស្វ័យប្រវត្តិ 
              ព្រមទាំងពិនិត្យមើលសិទ្ធិ Bot និងស្ថានភាពដំណើរការក្នុងពេលជាក់ស្តែង។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleScanUpdates}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'កំពុងស្កេន...' : '🔄 ស្កេនរកក្រុមស្វ័យប្រវត្តិ'}</span>
            </button>

            <button
              onClick={loadDetected}
              disabled={isLoadingDetected}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition-all text-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDetected ? 'animate-spin' : ''}`} />
              <span>ផ្ទុកឡើងវិញ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left (Inspector Form) & Right (Detected Groups List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Chat ID Inspector Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>ឆែកអាយឌីក្រុមផ្ទាល់ (Inspect Chat ID)</span>
              </h3>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium border border-blue-200">
                Live Verification
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              បញ្ចូល Telegram Chat ID (ឧ. <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-[11px]">-1002495819001</code>) ឬ @username ប៉ុស្តិ៍ ដើម្បីពិនិត្យមើលឈ្មោះក្រុម សមាជិក និងសិទ្ធិ Bot៖
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={inputChatId}
                  onChange={(e) => setInputChatId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInspectChat()}
                  placeholder="ឧ. -1002495819001 ឬ 240224709 ឬ @channel"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
                {inputChatId && (
                  <button
                    onClick={() => setInputChatId('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleInspectChat()}
                  disabled={isInspecting || !inputChatId.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Search className={`w-4 h-4 ${isInspecting ? 'animate-spin' : ''}`} />
                  <span>{isInspecting ? 'កំពុងឆែកព័ត៌មាន...' : '🔍 ឆែកមើលព័ត៌មានក្រុម'}</span>
                </button>

                {inputChatId && (
                  <button
                    onClick={() => handleTestPing(inputChatId)}
                    disabled={isTestingPing}
                    title="តេស្តផ្ញើសារ Ping"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-medium rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isTestingPing ? 'animate-pulse' : ''}`} />
                    <span>Ping</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {inspectionError && (
              <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">ពិនិត្យមិនបានសម្រេច៖</span>
                  <span>{inspectionError}</span>
                </div>
              </div>
            )}

            {/* Ping Result Banner */}
            {pingResult && (
              <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                pingResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {pingResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between font-semibold mb-0.5">
                    <span>{pingResult.success ? 'តេស្ត Ping ជោគជ័យ' : 'តេស្ត Ping បរាជ័យ'}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{pingResult.time}</span>
                  </div>
                  <span>{pingResult.message}</span>
                </div>
              </div>
            )}

            {/* Inspection Result Detailed Card */}
            {inspectionResult && (
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl p-4 border border-blue-100 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {inspectionResult.title}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-semibold uppercase">
                          {inspectionResult.type}
                        </span>
                      </div>
                      {inspectionResult.username && (
                        <span className="text-xs text-blue-600 font-mono block mt-0.5">
                          @{inspectionResult.username}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopy(inspectionResult.chatId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      {copiedId === inspectionResult.chatId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{copiedId === inspectionResult.chatId ? 'ចម្លងរួច' : 'Copy ID'}</span>
                    </button>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">លេខសម្គាល់ (Chat ID)</span>
                      <span className="font-mono font-bold text-slate-800 text-xs truncate block">
                        {inspectionResult.chatId}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 block text-[11px] mb-0.5">ចំនួនសមាជិក (Members)</span>
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {inspectionResult.memberCount ?? 'មិនបញ្ជាក់'} នាក់
                      </span>
                    </div>
                  </div>

                  {/* Status Assessment */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${inspectionResult.isBotAdmin ? 'text-emerald-600' : 'text-amber-500'}`} />
                      <span className="font-semibold text-slate-800">
                        {inspectionResult.isBotAdmin ? 'ស្ថានភាព Bot៖ Administrator (គ្រប់គ្រងពេញលេញ)' : `ស្ថានភាព Bot៖ ${inspectionResult.botStatus}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                      {inspectionResult.statusAssessment}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setAssigningGroup({ chatId: inspectionResult.chatId, title: inspectionResult.title })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ភ្ជាប់ទៅកាន់ថ្នាក់/ក្រុម</span>
                    </button>

                    <button
                      onClick={() => handleTestPing(inspectionResult.chatId, inspectionResult.title)}
                      disabled={isTestingPing}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTestingPing ? 'កំពុង Ping...' : 'តេស្ត Ping'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Khmer Guide: How to Get Chat ID */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>របៀបស្វែងរក Telegram Chat ID ងាយៗ</span>
            </h4>

            <ol className="space-y-2.5 text-xs text-slate-600 leading-relaxed list-decimal list-inside pl-1">
              <li className="text-slate-700">
                <span className="font-semibold text-slate-800">Add Bot ចូលក្រុម៖</span> អញ្ជើញ <a href="https://t.me/PPTC_Notify_bot" target="_blank" rel="noreferrer" className="bg-white border px-1 py-0.5 rounded text-blue-600 font-mono font-semibold hover:underline">@PPTC_Notify_bot</a> (PPTC_Notify_bot) ចូលក្នុង Telegram Group ហើយកែប្រែសិទ្ធិជា <strong className="text-emerald-700">Admin</strong>។
              </li>
              <li className="text-slate-700">
                <span className="font-semibold text-slate-800">ផ្ញើសារសាកល្បង៖</span> វាយសារមួយម៉ាត់ក្នុងក្រុម (ឧ. «/start» ឬ «សួស្ដី»)។
              </li>
              <li className="text-slate-700">
                <span className="font-semibold text-slate-800">ចុចស្កេនស្វ័យប្រវត្ត៖</span> ចុចលើប៊ូតុង <strong className="text-blue-700">«🔄 ស្កេនរកក្រុមស្វ័យប្រវត្ត»</strong> ខាងលើ នោះ Chat ID នឹងបង្ហាញមកភ្លាម!
              </li>
              <li className="text-slate-700">
                <span className="font-semibold text-slate-800">ប្រើ Bot ជំនួយ៖</span> ឬ Forward សារពីក្រុមទៅកាន់ <code className="bg-white border px-1 py-0.5 rounded text-slate-800 font-mono">@userinfobot</code> ឬ <code className="bg-white border px-1 py-0.5 rounded text-slate-800 font-mono">@GetIDsBot</code> ដើម្បីចម្លង Chat ID។
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Detected / Discovered Groups List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>បញ្ជីក្រុម Telegram ដែលបានរកឃើញ (Detected Groups)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ក្រុម និងប៉ុស្តិ៍ដែល Bot បានចូលរួម ឬធ្លាប់មានការបញ្ជូនសារ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
                  រកឃើញ {detectedGroups.length} ក្រុម
                </span>
              </div>
            </div>

            {/* List of Detected Groups */}
            {isLoadingDetected ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium">កំពុងទាញយកទិន្នន័យក្រុមពី Server...</p>
              </div>
            ) : detectedGroups.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">មិនទាន់រកឃើញក្រុម Telegram ថ្មីនៅឡើយទេ</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  សូម Add Bot ចូលក្នុង Telegram Group ឬផ្ញើសារសាកល្បង រួចចុច «ស្កេនរកក្រុមស្វ័យប្រវត្ត»។
                </p>
                <button
                  onClick={handleScanUpdates}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ស្កេនរកក្រុមឥឡូវនេះ</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {detectedGroups.map((group) => {
                  const isAssigned = classrooms.some(c => c.telegramChatId === group.chatId);
                  const assignedClass = classrooms.find(c => c.telegramChatId === group.chatId);

                  return (
                    <div
                      key={group.chatId}
                      className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {group.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              group.type === 'channel'
                                ? 'bg-purple-100 text-purple-700'
                                : group.type === 'supergroup'
                                ? 'bg-blue-100 text-blue-700'
                                : group.type === 'private'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {group.type}
                            </span>

                            {isAssigned && assignedClass && (
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                ថ្នាក់ទី {assignedClass.grade}{assignedClass.section}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold text-[11px]">
                              ID: {group.chatId}
                            </span>

                            {group.memberCount && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Users className="w-3 h-3 text-slate-400" />
                                {group.memberCount} នាក់
                              </span>
                            )}

                            {group.lastMessageSnippet && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                «{group.lastMessageSnippet}»
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleCopy(group.chatId)}
                            title="ចម្លង Chat ID"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            {copiedId === group.chatId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className="hidden sm:inline">
                              {copiedId === group.chatId ? 'ចម្លងរួច' : 'Copy'}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setInputChatId(group.chatId);
                              handleInspectChat(group.chatId);
                            }}
                            title="ឆែកព័ត៌មានលម្អិត"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ឆែក</span>
                          </button>

                          <button
                            onClick={() => handleTestPing(group.chatId, group.title)}
                            disabled={isTestingPing}
                            title="តេស្តផ្ញើសារ Ping"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ping</span>
                          </button>

                          <button
                            onClick={() => setAssigningGroup({ chatId: group.chatId, title: group.title })}
                            title="កំណត់ភ្ជាប់ទៅថ្នាក់ ឬក្រុមគ្រូ"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ភ្ជាប់</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 1-Click Assignment Modal Dialog */}
      {assigningGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">ភ្ជាប់ Telegram Group ទៅកាន់ថ្នាក់ ឬគ្រូ</h3>
                  <p className="text-xs text-slate-500 font-mono">Chat ID: {assigningGroup.chatId}</p>
                </div>
              </div>
              <button
                onClick={() => setAssigningGroup(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span className="font-bold block mb-0.5">ឈ្មោះក្រុម Telegram៖</span>
              <span>{assigningGroup.title}</span>
            </div>

            {/* Choose Target Type */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">ជ្រើសរើសប្រភេទគោលដៅភ្ជាប់៖</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignMode('class')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    assignMode === 'class'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>ក្រុមតាមថ្នាក់រៀន</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignMode('special')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    assignMode === 'special'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>ក្រុមលោកគ្រូ-អ្នកគ្រូ / សាលា</span>
                </button>
              </div>

              {assignMode === 'class' ? (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-medium text-slate-600">ជ្រើសរើសថ្នាក់រៀនគោលដៅ៖</label>
                  <select
                    value={selectedTargetClassId}
                    onChange={(e) => setSelectedTargetClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {classrooms.map(c => {
                      const t = teachers.find(tch => tch.id === c.homeroomTeacherId);
                      return (
                        <option key={c.id} value={c.id}>
                          ថ្នាក់ទី {c.grade}{c.section} {t ? `(គ្រូបន្ទុក៖ ${t.nameKhmer})` : ''} {c.telegramChatId ? '• [មាន ID រួច]' : '• [ទទេ]'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-medium text-slate-600">ជ្រើសរើសក្រុមគ្រូ ឬប៉ុស្តិ៍សាលា៖</label>
                  <select
                    value={selectedSpecialTarget}
                    onChange={(e) => setSelectedSpecialTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="teachers">👨‍🏫 ក្រុមតេលេក្រាម លោកគ្រូ-អ្នកគ្រូ & បុគ្គលិកសាលា</option>
                    <option value="committee">🏛️ ក្រុមតេលេក្រាម គណៈកម្មការទ្រទ្រង់សាលា & សហគមន៍</option>
                    <option value="general_channel">📢 ប៉ុស្តិ៍ផ្លូវការសាលារៀន (School Public Channel)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssigningGroup(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                បោះបង់
              </button>

              <button
                type="button"
                onClick={handleExecuteAssign}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
              >
                រក្សាទុកការភ្ជាប់ (Save Assignment)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
