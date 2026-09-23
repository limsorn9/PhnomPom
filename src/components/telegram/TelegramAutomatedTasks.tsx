import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { sendTelegramNotification, sendTelegramDirectMessage } from '../../services/telegramService';
import {
  Clock,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Sparkles,
  Calendar,
  Bell,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Zap,
  Users,
  Shield,
  Layers,
  ArrowRight,
  BookOpen,
  FileCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export interface AutomatedTask {
  id: string;
  name: string;
  description: string;
  category: 'attendance' | 'exam' | 'meeting' | 'general' | 'cleanup';
  targetAudience: 'teachers' | 'students_parents' | 'admin' | 'custom';
  targetChatId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  scheduledTime: string; // e.g. "07:00"
  daysOfWeek?: string[]; // e.g. ["ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ"]
  dayOfMonth?: number; // e.g. 28
  messageTemplate: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  totalExecutions: number;
}

const PRESET_AUTOMATED_TASKS: AutomatedTask[] = [
  {
    id: 'task-morning-attendance',
    name: '🌅 រំលឹកម៉ោងចូលរៀន និងកត់ត្រាវត្តមានពេលព្រឹក',
    description: 'ផ្ញើសាររំលឹកលោកគ្រូ-អ្នកគ្រូឱ្យជួយកត់ត្រាវត្តមានសិស្សតាមបន្ទប់រៀនឱ្យបានទាន់ពេល',
    category: 'attendance',
    targetAudience: 'teachers',
    targetChatId: '240224709',
    frequency: 'daily',
    scheduledTime: '07:00',
    daysOfWeek: ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'],
    messageTemplate: `🌅 *រំលឹកកត់ត្រាវត្តមានពេលព្រឹក (Morning Check-in Reminder)* 📋
🏫 *សាលាបឋមសិក្សាភ្នំពុំ*

សូមជម្រាបរំលឹកដល់លោកគ្រូ-អ្នកគ្រូប្រចាំថ្នាក់ទាំងអស់៖
🔹 សូមមេត្តាជួយកត់ត្រាវត្តមានសិស្សតាមបន្ទប់រៀនឱ្យបានរួចរាល់មុនម៉ោង *០៧:៣០ ព្រឹក*
🔹 ករណីមានសិស្សសុំច្បាប់ ឬឈឺ សូមកត់សម្គាល់ក្នុងប្រព័ន្ធឱ្យបានច្បាស់លាស់

សូមអរគុណលោកគ្រូ-អ្នកគ្រូ! 🙏✨`,
    enabled: true,
    lastRun: '2026-08-26 07:00 ព្រឹក',
    nextRun: 'ស្អែក 07:00 ព្រឹក',
    totalExecutions: 142
  },
  {
    id: 'task-exam-reminder',
    name: '📝 រំលឹកកាលវិភាគប្រឡង និងការត្រៀមខ្លួនរបស់សិស្ស',
    description: 'ជូនដំណឹងរំលឹកអំពីវិញ្ញាសា និងកាលបរិច្ឆេទប្រឡងឆមាសដល់សិស្ស និងមាតាបិតា',
    category: 'exam',
    targetAudience: 'students_parents',
    targetChatId: '240224709',
    frequency: 'weekly',
    scheduledTime: '16:30',
    daysOfWeek: ['សុក្រ'],
    messageTemplate: `📝 *ការរំលឹកកាលវិភាគប្រឡង និងការរំលឹកមេរៀន* 📚
🏫 *សាលាបឋមសិក្សាភ្នំពុំ*

សូមជម្រាបជូនដំណឹងដល់ប្អូនៗសិស្សានុសិស្ស និងមាតាបិតាទាំងអស់៖
📌 សូមពិនិត្យកាលវិភាគប្រឡងប្រចាំសប្តាហ៍
📌 រៀបចំសម្ភារៈសិក្សា ប៊ិច ខ្មៅដៃ បន្ទាត់ និងឯកសណ្ឋានឱ្យបានត្រឹមត្រូវ
📌 ចូលគេងឱ្យបានលឿនដើម្បីត្រៀមស្មារតីឱ្យបានល្អសម្រាប់ថ្ងៃប្រឡង

ជូនពរប្អូនៗទទួលបាននិទ្ទេសល្អគ្រប់ៗគ្នា! 🌟🏆`,
    enabled: true,
    lastRun: '2026-08-22 16:30 រសៀល',
    nextRun: 'សុក្រសប្តាហ៍នេះ 16:30 រសៀល',
    totalExecutions: 38
  },
  {
    id: 'task-weekly-meeting',
    name: '👨‍🏫 រំលឹកកិច្ចប្រជុំប្រចាំសប្តាហ៍លោកគ្រូ-អ្នកគ្រូ',
    description: 'ជូនដំណឹងកោះប្រជុំគណៈគ្រប់គ្រងសាលា និងលោកគ្រូ-អ្នកគ្រូដើម្បីបូកសរុបការងារ',
    category: 'meeting',
    targetAudience: 'teachers',
    targetChatId: '240224709',
    frequency: 'weekly',
    scheduledTime: '07:15',
    daysOfWeek: ['ចន្ទ'],
    messageTemplate: `🔔 *សេចក្តីរំលឹកកិច្ចប្រជុំប្រចាំសប្តាហ៍* 👥
🏫 *សាលាបឋមសិក្សាភ្នំពុំ*

សូមគោរពអញ្ជើញលោកគ្រូ-អ្នកគ្រូទាំងអស់ ចូលរួមកិច្ចប្រជុំប្រចាំសប្តាហ៍៖
📅 *កាលបរិច្ឆេទ:* ព្រឹកថ្ងៃចន្ទ
⏰ *ម៉ោង:* ០៧:៣០ ព្រឹក
📍 *ទីកន្លែង:* បន្ទប់ប្រជុំធំសាលារៀន

សូមលោកគ្រូ-អ្នកគ្រូមកឱ្យបានទាន់ពេលវេលា។ សូមអរគុណ!`,
    enabled: true,
    lastRun: '2026-08-24 07:15 ព្រឹក',
    nextRun: 'ចន្ទក្រោយ 07:15 ព្រឹក',
    totalExecutions: 52
  },
  {
    id: 'task-monthly-report',
    name: '📊 របាយការណ៍បូកសរុបពិន្ទុ និងវត្តមានប្រចាំខែ',
    description: 'រំលឹកការបញ្ចូលពិន្ទុសិស្ស និងបូកសរុបចំណាត់ថ្នាក់ប្រចាំខែជូននាយកសាលា',
    category: 'general',
    targetAudience: 'admin',
    targetChatId: '240224709',
    frequency: 'monthly',
    scheduledTime: '17:00',
    dayOfMonth: 28,
    messageTemplate: `📊 *រំលឹកការបូកសរុបពិន្ទុ និងវត្តមានប្រចាំខែ* 📑
🏫 *សាលាបឋមសិក្សាភ្នំពុំ*

សូមជម្រាបរំលឹកដល់លោកគ្រូ-អ្នកគ្រូប្រចាំថ្នាក់ទាំងអស់៖
🔹 សូមបញ្ចូលពិន្ទុប្រចាំខែ និងវត្តមានសរុបក្នុងប្រព័ន្ធគ្រប់គ្រងសាលាឱ្យបានមុនថ្ងៃទី ៣០
🔹 ប្រព័ន្ធនឹងទាញយករបាយការណ៍ស្វ័យប្រវត្តិចេញជូននាយកសាលាពិនិត្យ

សូមអរគុណចំពោះកិច្ចសហការ! 🙏`,
    enabled: true,
    lastRun: '2026-07-28 17:00 រសៀល',
    nextRun: '២៨ សីហា 17:00 រសៀល',
    totalExecutions: 12
  }
];

const LOCAL_STORAGE_KEY = 'telegram_automated_tasks_store';

export const TelegramAutomatedTasks: React.FC = () => {
  const { showToast } = useSchool();

  const [tasks, setTasks] = useState<AutomatedTask[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return PRESET_AUTOMATED_TASKS;
  });

  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AutomatedTask | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<'attendance' | 'exam' | 'meeting' | 'general' | 'cleanup'>('attendance');
  const [formTarget, setFormTarget] = useState<'teachers' | 'students_parents' | 'admin' | 'custom'>('teachers');
  const [formChatId, setFormChatId] = useState('240224709');
  const [formFreq, setFormFreq] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [formTime, setFormTime] = useState('07:00');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.enabled;
        showToast(
          nextState ? `បានបើកដំណើរការកាលវិភាគ "${t.name}"` : `បានផ្អាកកាលវិភាគ "${t.name}"`,
          nextState ? 'success' : 'info'
        );
        return { ...t, enabled: nextState };
      }
      return t;
    }));
  };

  const handleRunNow = async (task: AutomatedTask) => {
    setRunningTaskId(task.id);
    try {
      const res = await sendTelegramDirectMessage(task.targetChatId, task.messageTemplate);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === task.id ? {
          ...t,
          lastRun: new Date().toLocaleTimeString('km-KH') + ' (Run Manual)',
          totalExecutions: t.totalExecutions + 1
        } : t));
        showToast(`⚡ បានដំណើរការផ្ញើសារ "${task.name}" ទៅកាន់ Telegram រួចរាល់!`, 'success');
      } else {
        showToast(res.error || 'បរាជ័យក្នុងការផ្ញើសារ', 'error');
      }
    } catch (err: any) {
      showToast('បញ្ហា: ' + err?.message, 'error');
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('attendance');
    setFormTarget('teachers');
    setFormChatId('240224709');
    setFormFreq('daily');
    setFormTime('07:00');
    setFormMessage(`🔔 *សេចក្តីជូនដំណឹងរំលឹកស្វ័យប្រវត្តិ* 🏫\n\nសូមជម្រាបជូនដំណឹងដល់លោកគ្រូ-អ្នកគ្រូ និងសិស្សានុសិស្សថា៖\n...\n\nសូមអរគុណ!`);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: AutomatedTask) => {
    setEditingTask(task);
    setFormName(task.name);
    setFormDesc(task.description);
    setFormCategory(task.category);
    setFormTarget(task.targetAudience);
    setFormChatId(task.targetChatId);
    setFormFreq(task.frequency);
    setFormTime(task.scheduledTime);
    setFormMessage(task.messageTemplate);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMessage.trim()) {
      showToast('សូមបំពេញឈ្មោះភារកិច្ច និងខ្លឹមសារសារ!', 'error');
      return;
    }

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        name: formName,
        description: formDesc,
        category: formCategory,
        targetAudience: formTarget,
        targetChatId: formChatId,
        frequency: formFreq,
        scheduledTime: formTime,
        messageTemplate: formMessage
      } : t));
      showToast('បានកែប្រែភារកិច្ចស្វ័យប្រវត្តិជោគជ័យ!', 'success');
    } else {
      const newTask: AutomatedTask = {
        id: `task-${Date.now()}`,
        name: formName,
        description: formDesc,
        category: formCategory,
        targetAudience: formTarget,
        targetChatId: formChatId,
        frequency: formFreq,
        scheduledTime: formTime,
        messageTemplate: formMessage,
        enabled: true,
        nextRun: `ថ្ងៃបន្ទាប់ ${formTime}`,
        totalExecutions: 0
      };
      setTasks(prev => [newTask, ...prev]);
      showToast('បានបង្កើតកាលវិភាគស្វ័យប្រវត្តិថ្មីជោគជ័យ!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបភារកិច្ចស្វ័យប្រវត្តិនេះមែនទេ?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('បានលុបភារកិច្ចរួចរាល់!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
            <Clock className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/30 text-emerald-200 px-3 py-0.5 rounded-full text-xs font-semibold mb-1 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Automated Telegram Cron & Notification Scheduler
            </div>
            <h2 className="text-xl font-bold font-moul">ភារកិច្ចស្វ័យប្រវត្តិ & កាលវិភាគរំលឹក</h2>
            <p className="text-emerald-100 text-xs">
              កំណត់ម៉ោង និងកាលវិភាគផ្ញើសាររំលឹកម៉ោងចូលរៀន វត្តមាន កាលវិភាគប្រឡង និងកិច្ចប្រជុំដោយស្វ័យប្រវត្តិ
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          បង្កើតកាលវិភាគថ្មី
        </button>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => {
          const isRunning = runningTaskId === task.id;
          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-xs ${
                task.enabled
                  ? 'border-slate-200 hover:border-emerald-300'
                  : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              {/* Top Row: Title & Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                      task.category === 'attendance'
                        ? 'bg-blue-50 text-blue-600'
                        : task.category === 'exam'
                        ? 'bg-amber-50 text-amber-600'
                        : task.category === 'meeting'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {task.category === 'attendance'
                      ? '📋'
                      : task.category === 'exam'
                      ? '📝'
                      : task.category === 'meeting'
                      ? '👥'
                      : '🔔'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{task.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{task.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleTask(task.id)}
                  title={task.enabled ? 'ចុចដើម្បីផ្អាក' : 'ចុចដើម្បីបើកដំណើរការ'}
                  className={`p-1 rounded-lg transition-colors ${
                    task.enabled ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-500'
                  }`}
                >
                  {task.enabled ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Schedule Info Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">កាលវិភាគ:</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {task.frequency === 'daily'
                      ? 'រាល់ថ្ងៃ'
                      : task.frequency === 'weekly'
                      ? 'រៀងរាល់សប្តាហ៍'
                      : 'ប្រចាំខែ'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ម៉ោងអនុវត្ត:</span>
                  <span className="font-bold text-indigo-600 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.scheduledTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">បានដំណើរការ:</span>
                  <span className="font-bold text-slate-700 font-mono">{task.totalExecutions} ដង</span>
                </div>
              </div>

              {/* Message Preview Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-battambang text-slate-700 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {task.messageTemplate}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>បន្ទាប់: </span>
                  <span className="font-semibold text-emerald-700">{task.nextRun}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs transition-colors"
                    title="កែសម្រួលភារកិច្ច"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition-colors"
                    title="លុបភារកិច្ច"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRunNow(task)}
                    disabled={isRunning}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        កំពុងផ្ញើ...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        ដំណើរការភ្លាមៗ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create / Edit Automated Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                {editingTask ? 'កែសម្រួលកាលវិភាគស្វ័យប្រវត្តិ' : 'បង្កើតកាលវិភាគស្វ័យប្រវត្តិថ្មី'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះភារកិច្ច (Task Name):</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="ឧ. រំលឹកម៉ោងចូលរៀនពេលព្រឹក..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ការពិពណ៌នាសង្ខេប:</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="ឧ. ផ្ញើសាររំលឹកលោកគ្រូ-អ្នកគ្រូឱ្យជួយកត់ត្រាវត្តមាន..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទ (Category):</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-battambang"
                  >
                    <option value="attendance">📋 វត្តមានសិស្ស</option>
                    <option value="exam">📝 ការប្រឡង</option>
                    <option value="meeting">👥 កិច្ចប្រជុំ</option>
                    <option value="general">🔔 ដំណឹងទូទៅ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កាលវិភាគ (Frequency):</label>
                  <select
                    value={formFreq}
                    onChange={e => setFormFreq(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-battambang"
                  >
                    <option value="daily">រាល់ថ្ងៃ (Daily)</option>
                    <option value="weekly">រៀងរាល់សប្តាហ៍ (Weekly)</option>
                    <option value="monthly">ប្រចាំខែ (Monthly)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ម៉ោងអនុវត្ត (Time):</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Chat ID:</label>
                  <input
                    type="text"
                    value={formChatId}
                    onChange={e => setFormChatId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    placeholder="240224709"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ខ្លឹមសារសារ (Message Template):</label>
                <textarea
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-battambang leading-relaxed"
                  placeholder="វាយអត្ថបទសាររំលឹកនៅទីនេះ..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  រក្សាទុកកាលវិភាគ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
