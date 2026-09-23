import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Users,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  GraduationCap,
  AlertTriangle,
  Send,
  Eye,
  Settings2,
  ChevronRight,
  Layers
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import {
  GroupNotificationRuleConfig,
  getStoredGroupNotificationRules,
  saveStoredGroupNotificationRules,
  sendTelegramDirectMessage,
  inspectTelegramChat
} from '../../services/telegramService';

interface TelegramGroupConfigurationProps {
  onInspectGroup?: (chatId: string) => void;
}

export const TelegramGroupConfiguration: React.FC<TelegramGroupConfigurationProps> = ({ onInspectGroup }) => {
  const { currentUser, classrooms, teachers, showToast } = useSchool();
  const [rules, setRules] = useState<GroupNotificationRuleConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRuleType, setFilterRuleType] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<GroupNotificationRuleConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifyingGroupId, setVerifyingGroupId] = useState<string | null>(null);

  const isPrincipal = currentUser?.role === 'director' || currentUser?.role === 'super_admin';

  useEffect(() => {
    const loaded = getStoredGroupNotificationRules();
    // Synchronize with any classroom that has a telegramChatId
    const syncedRules = [...loaded];
    classrooms.forEach(cls => {
      if (cls.telegramChatId && !syncedRules.some(r => r.groupId === cls.telegramChatId)) {
        syncedRules.push({
          id: `rule-cls-${cls.id}`,
          groupId: cls.telegramChatId,
          groupTitle: `ថ្នាក់ទី ${cls.grade}${cls.section} (បន្ទុក ${cls.teacherName || 'គ្រូ'})`,
          groupType: 'classroom',
          ruleType: 'Attendance Only',
          allowedRoles: ['teacher', 'director'],
          enabled: true,
          quietHoursEnabled: true,
          quietHoursStart: '21:00',
          quietHoursEnd: '06:00',
          autoSendDailyAttendance: true,
          autoSendMonthlyExamScores: false,
          autoSendFeeReminders: false,
          descriptionKh: `ចាក់ផ្សាយព័ត៌មានថ្នាក់ទី ${cls.grade}${cls.section}`,
          lastUpdated: new Date().toISOString().slice(0, 10)
        });
      }
    });
    setRules(syncedRules);
  }, [classrooms]);

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    if (!editingRule.groupId || !editingRule.groupTitle) {
      showToast('សូមបំពេញ Telegram Group ID និងឈ្មោះក្រុម!', 'error');
      return;
    }

    let updated: GroupNotificationRuleConfig[];
    const exists = rules.some(r => r.id === editingRule.id);

    if (exists) {
      updated = rules.map(r => (r.id === editingRule.id ? { ...editingRule, lastUpdated: new Date().toISOString().slice(0, 10) } : r));
    } else {
      updated = [{ ...editingRule, id: `rule-${Date.now()}`, lastUpdated: new Date().toISOString().slice(0, 10) }, ...rules];
    }

    setRules(updated);
    saveStoredGroupNotificationRules(updated);
    setIsModalOpen(false);
    setEditingRule(null);
    showToast('បានរក្សាទុកការកំណត់ Notification Rule ដោយជោគជ័យ!', 'success');
  };

  const handleDeleteRule = (id: string, groupTitle: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបច្បាប់ជូនដំណឹងសម្រាប់ "${groupTitle}" មែនទេ?`)) {
      const updated = rules.filter(r => r.id !== id);
      setRules(updated);
      saveStoredGroupNotificationRules(updated);
      showToast(`បានលុបការកំណត់សម្រាប់ ${groupTitle}`, 'info');
    }
  };

  const handleToggleEnable = (id: string) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        const nextState = !r.enabled;
        showToast(`${nextState ? 'បើកដំណើរការ' : 'បិទដំណើរការ'} ការជូនដំណឹងសម្រាប់ ${r.groupTitle}`, nextState ? 'success' : 'info');
        return { ...r, enabled: nextState };
      }
      return r;
    });
    setRules(updated);
    saveStoredGroupNotificationRules(updated);
  };

  const handleVerifyGroupConnection = async (rule: GroupNotificationRuleConfig) => {
    setVerifyingGroupId(rule.id);
    showToast(`កំពុងតេស្តផ្ទៀងផ្ទាត់ការតភ្ជាប់ទៅកាន់ ${rule.groupTitle}...`, 'info');

    try {
      const inspectRes = await inspectTelegramChat(rule.groupId);
      const testMsg = `⚡ *ការផ្ទៀងផ្ទាត់ Notification Rule ជោគជ័យ!*\n\n• ក្រុម: *${rule.groupTitle}*\n• ប្រភេទ Rule: *${rule.ruleType}*\n• តួនាទីអនុញ្ញាត: ${rule.allowedRoles.join(', ')}\n• ម៉ោងបញ្ជូន: ${new Date().toLocaleTimeString('km-KH')}\n\n🤖 ប្រព័ន្ធ Bot (@PPTC_Notify_bot) បានកំណត់រចនាសម្ព័ន្ធរួចរាល់ ១០០%!`;

      const sendRes = await sendTelegramDirectMessage(rule.groupId, testMsg);

      if (sendRes.success) {
        showToast(`ផ្ទៀងផ្ទាត់ និងផ្ញើសារសាកល្បងទៅ ${rule.groupTitle} ជោគជ័យ!`, 'success');
      } else {
        showToast(sendRes.message || 'មិនអាចផ្ញើសារបាន សូមឆែកមើលសិទ្ធិ Bot Admin ក្នុងក្រុម', 'error');
      }
    } catch (err: any) {
      showToast('បរាជ័យក្នុងការតេស្ត: ' + err?.message, 'error');
    } finally {
      setVerifyingGroupId(null);
    }
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      r.groupTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.groupId.includes(searchQuery) ||
      (r.descriptionKh && r.descriptionKh.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRuleType = filterRuleType === 'all' || r.ruleType === filterRuleType;
    return matchesSearch && matchesRuleType;
  });

  const getRuleBadge = (ruleType: GroupNotificationRuleConfig['ruleType']) => {
    switch (ruleType) {
      case 'Full Sync':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">🔄 Full Sync (គ្រប់ប្រភេទ)</span>;
      case 'Attendance Only':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">📊 Attendance Only (តែវត្តមាន)</span>;
      case 'Finance Updates':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">💰 Finance Updates (ហិរញ្ញវត្ថុ)</span>;
      case 'Exam & Scores':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">📝 Exam & Scores (ពិន្ទុ & លទ្ធផល)</span>;
      case 'Emergency Alerts':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">🚨 Emergency Alerts (ដំណឹងបន្ទាន់)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Configuration Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                កំណត់ Notification Rules តាម Telegram Group (Group Configuration)
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  {rules.length} ក្រុម
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                កំណត់ប្រភេទសារដែលអនុញ្ញាតឱ្យផ្សាយទៅកាន់ក្រុមនីមួយៗ និងចាត់តាំងសិទ្ធិតួនាទីលោកគ្រូ-អ្នកគ្រូ (Role Mapping)។
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingRule({
                id: '',
                groupId: '',
                groupTitle: '',
                groupType: 'classroom',
                ruleType: 'Attendance Only',
                allowedRoles: ['teacher', 'director'],
                enabled: true,
                quietHoursEnabled: true,
                quietHoursStart: '21:00',
                quietHoursEnd: '06:00',
                autoSendDailyAttendance: true,
                autoSendMonthlyExamScores: false,
                autoSendFeeReminders: false,
                descriptionKh: '',
                lastUpdated: new Date().toISOString().slice(0, 10)
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែម Group Rule ថ្មី</span>
          </button>
        </div>

        {/* Search & Rule Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះក្រុម, Chat ID, ឬការពិពណ៌នា..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-battambang"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={filterRuleType}
              onChange={e => setFilterRuleType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 font-battambang"
            >
              <option value="all">📂 គ្រប់ប្រភេទ Rule (All)</option>
              <option value="Full Sync">🔄 Full Sync (គ្រប់ប្រភេទ)</option>
              <option value="Attendance Only">📊 Attendance Only (តែវត្តមាន)</option>
              <option value="Finance Updates">💰 Finance Updates (ហិរញ្ញវត្ថុ)</option>
              <option value="Exam & Scores">📝 Exam & Scores (ពិន្ទុ & លទ្ធផល)</option>
              <option value="Emergency Alerts">🚨 Emergency Alerts (ដំណឹងបន្ទាន់)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map(rule => (
          <div
            key={rule.id}
            className={`bg-white rounded-3xl border p-5 shadow-xs transition-all space-y-4 ${
              rule.enabled ? 'border-slate-200 hover:shadow-md' : 'border-slate-200/60 bg-slate-50/50 opacity-75'
            }`}
          >
            {/* Header: Title, Type & Toggle */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm font-battambang flex items-center gap-1.5">
                    <span>{rule.groupTitle}</span>
                  </h4>
                  {rule.enabled ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <span>Chat ID:</span>
                  <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{rule.groupId}</span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggleEnable(rule.id)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  rule.enabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
                title={rule.enabled ? 'បិទដំណើរការ' : 'បើកដំណើរការ'}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
              </button>
            </div>

            {/* Rule Type Banner */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Notification Policy:</span>
              <div>{getRuleBadge(rule.ruleType)}</div>
            </div>

            {/* Allowed Roles (Teacher/Staff Role Mapping) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                👥 តួនាទីអនុញ្ញាតឱ្យផ្ញើចូលក្រុម (Role Mapping):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {rule.allowedRoles.includes('teacher') && (
                  <span className="text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>គ្រូបន្ទុកថ្នាក់ / គ្រូមុខវិជ្ជា</span>
                  </span>
                )}
                {rule.allowedRoles.includes('director') && (
                  <span className="text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>នាយកសាលា / Super Admin</span>
                  </span>
                )}
                {rule.allowedRoles.includes('accountant') && (
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>បេឡា / គណនេយ្យករ</span>
                  </span>
                )}
                {rule.allowedRoles.length === 0 && (
                  <span className="text-[11px] text-slate-400 italic">មិនទាន់ចាត់តាំងតួនាទី</span>
                )}
              </div>
            </div>

            {/* Automation Flags Summary */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600">
              <div className={`p-2 rounded-xl border ${rule.autoSendDailyAttendance ? 'bg-blue-50/50 border-blue-200 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                📊 វត្តមានប្រចាំថ្ងៃ: {rule.autoSendDailyAttendance ? 'បើក' : 'បិទ'}
              </div>
              <div className={`p-2 rounded-xl border ${rule.autoSendMonthlyExamScores ? 'bg-purple-50/50 border-purple-200 text-purple-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                📝 ពិន្ទុប្រឡង: {rule.autoSendMonthlyExamScores ? 'បើក' : 'បិទ'}
              </div>
              <div className={`p-2 rounded-xl border ${rule.autoSendFeeReminders ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                💰 វិក្កយបត្រ: {rule.autoSendFeeReminders ? 'បើក' : 'បិទ'}
              </div>
            </div>

            {/* Quiet hours if set */}
            {rule.quietHoursEnabled && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Quiet Hours: <b>{rule.quietHoursStart || '21:00'} - {rule.quietHoursEnd || '06:00'}</b> (បិទសម្លេងរំខាន)</span>
              </div>
            )}

            {/* Card Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleVerifyGroupConnection(rule)}
                disabled={verifyingGroupId === rule.id}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="ផ្ញើសារតេស្តផ្ទៀងផ្ទាត់ការតភ្ជាប់"
              >
                <Zap className={`w-3.5 h-3.5 ${verifyingGroupId === rule.id ? 'animate-spin' : ''}`} />
                <span>{verifyingGroupId === rule.id ? 'កំពុងតេស្ត...' : 'Verify Connection'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRule(rule);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                  title="កែប្រែ Rule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id, rule.groupTitle)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  title="លុប Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Rule Modal */}
      {isModalOpen && editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {editingRule.id ? 'កែសម្រួល Notification Rule សម្រាប់ក្រុម' : 'បន្ថែម Group Notification Rule ថ្មី'}
                  </h3>
                  <p className="text-xs text-slate-400">កំណត់លក្ខខណ្ឌផ្សាយដំណឹង និងសិទ្ធិតួនាទីផ្ញើសារ</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              {/* Group Name & Telegram Chat ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះក្រុម / ថ្នាក់រៀន:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRule.groupTitle}
                    onChange={e => setEditingRule({ ...editingRule, groupTitle: e.target.value })}
                    placeholder="ឧ. ថ្នាក់ទី១ក (បន្ទុកគ្រូ សុខ)"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-battambang"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telegram Chat ID:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRule.groupId}
                    onChange={e => setEditingRule({ ...editingRule, groupId: e.target.value.trim() })}
                    placeholder="ឧ. -1002495819001"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Notification Policy Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ប្រភេទគោលការណ៍ជូនដំណឹង (Notification Rule Policy):
                </label>
                <select
                  value={editingRule.ruleType}
                  onChange={e => setEditingRule({ ...editingRule, ruleType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 font-battambang"
                >
                  <option value="Attendance Only">📊 Attendance Only (តែវត្តមាន និងអវត្តមានសិស្សប្រចាំថ្ងៃ)</option>
                  <option value="Full Sync">🔄 Full Sync (គ្រប់ប្រភេទ: វត្តមាន, ពិន្ទុ, វិក្កយបត្រ, ដំណឹង)</option>
                  <option value="Exam & Scores">📝 Exam & Scores Only (តែតារាងពិន្ទុ និងលទ្ធផលប្រឡង)</option>
                  <option value="Finance Updates">💰 Finance Updates (តែវិក្កយបត្រ បង់ប្រាក់ និងថវិកា)</option>
                  <option value="Emergency Alerts">🚨 Emergency Alerts (តែដំណឹងបន្ទាន់ពីរដ្ឋបាលសាលា)</option>
                </select>
              </div>

              {/* Allowed Roles Multi-Check */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  👥 តួនាទីអនុញ្ញាតឱ្យផ្ញើសារចូលក្រុមនេះ (Allowed Roles Mapping):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.allowedRoles.includes('teacher')}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...editingRule.allowedRoles, 'teacher' as const]
                          : editingRule.allowedRoles.filter(r => r !== 'teacher');
                        setEditingRule({ ...editingRule, allowedRoles: next });
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-700">គ្រូបន្ទុកថ្នាក់</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.allowedRoles.includes('director')}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...editingRule.allowedRoles, 'director' as const]
                          : editingRule.allowedRoles.filter(r => r !== 'director');
                        setEditingRule({ ...editingRule, allowedRoles: next });
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-700">នាយក / Admin</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.allowedRoles.includes('accountant')}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...editingRule.allowedRoles, 'accountant' as const]
                          : editingRule.allowedRoles.filter(r => r !== 'accountant');
                        setEditingRule({ ...editingRule, allowedRoles: next });
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-700">បេឡា / គណនេយ្យ</span>
                  </label>
                </div>
              </div>

              {/* Automation Triggers */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  ⚡ កាលវិភាគបញ្ជូនស្វ័យប្រវត្ត (Automated Broadcast Triggers):
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <span className="text-xs text-slate-700">📊 ផ្ញើរបាយការណ៍វត្តមានពេលព្រឹក និងរសៀលអូតូ</span>
                    <input
                      type="checkbox"
                      checked={editingRule.autoSendDailyAttendance}
                      onChange={e => setEditingRule({ ...editingRule, autoSendDailyAttendance: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <span className="text-xs text-slate-700">📝 ផ្ញើតារាងពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែអូតូ</span>
                    <input
                      type="checkbox"
                      checked={editingRule.autoSendMonthlyExamScores}
                      onChange={e => setEditingRule({ ...editingRule, autoSendMonthlyExamScores: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <span className="text-xs text-slate-700">💰 ផ្ញើការរំលឹកបង់ថ្លៃសិក្សា / វិភាគទានសហគមន៍</span>
                    <input
                      type="checkbox"
                      checked={editingRule.autoSendFeeReminders}
                      onChange={e => setEditingRule({ ...editingRule, autoSendFeeReminders: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    កំណត់ Quiet Hours (ហាមផ្ញើសារពេលយប់):
                  </span>
                  <input
                    type="checkbox"
                    checked={editingRule.quietHoursEnabled}
                    onChange={e => setEditingRule({ ...editingRule, quietHoursEnabled: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                </label>

                {editingRule.quietHoursEnabled && (
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">ចាប់ពីម៉ោង:</span>
                      <input
                        type="time"
                        value={editingRule.quietHoursStart || '21:00'}
                        onChange={e => setEditingRule({ ...editingRule, quietHoursStart: e.target.value })}
                        className="px-2 py-1 border rounded-lg bg-white"
                      />
                    </div>
                    <span>ដល់</span>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">ដល់ម៉ោង:</span>
                      <input
                        type="time"
                        value={editingRule.quietHoursEnd || '06:00'}
                        onChange={e => setEditingRule({ ...editingRule, quietHoursEnd: e.target.value })}
                        className="px-2 py-1 border rounded-lg bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  បោះបង់
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>រក្សាទុក Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
