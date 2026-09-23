import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  getTelegramEventNotificationSettings,
  saveTelegramEventNotificationSettings,
  notifyTelegramNewStudent,
  notifyTelegramNewTeacher,
  notifyTelegramScoreUpdate,
  TelegramEventNotificationSettings,
  getStoredBotActivityLogs,
  BotActivityLogItem
} from '../../services/telegramService';
import {
  GraduationCap,
  Users,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Send,
  Sliders,
  ShieldCheck,
  Clock,
  Sparkles,
  RefreshCw,
  Info,
  Check,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';

interface TelegramRealtimeEventTriggersProps {
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isPrincipal?: boolean;
}

export const TelegramRealtimeEventTriggers: React.FC<TelegramRealtimeEventTriggersProps> = ({
  onShowToast,
  isPrincipal = true
}) => {
  const { students, teachers, scores, currentUser, showToast } = useSchool();
  const toast = onShowToast || showToast;

  const [settings, setSettings] = useState<TelegramEventNotificationSettings>(() =>
    getTelegramEventNotificationSettings()
  );
  const [testingType, setTestingType] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<BotActivityLogItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'new_student' | 'new_teacher' | 'score_update'>('all');

  const refreshLogs = () => {
    const logs = getStoredBotActivityLogs();
    const eventLogs = logs.filter(l =>
      l.category === 'automated' ||
      l.category === 'exam' ||
      l.category === 'security' ||
      l.category === 'general'
    );
    setRecentLogs(eventLogs.slice(0, 10));
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = (key: keyof TelegramEventNotificationSettings, value: any) => {
    const updated = saveTelegramEventNotificationSettings({ [key]: value });
    setSettings(updated);
    toast(`✅ បានធ្វើបច្ចុប្បន្នភាពការកំណត់ Telegram Notifications`, 'success');
  };

  // Test 1: New Student Notification
  const handleTestNewStudent = async () => {
    setTestingType('student');
    try {
      // Pick a sample or the latest student
      const sampleStudent = students[0] || {
        id: 'sample-s1',
        code: 'STU-2024-001',
        nameKhmer: 'សុខ ចាន់ដារ៉ា',
        nameLatin: 'Sok Chandara',
        gender: 'M',
        grade: 1,
        section: 'ក',
        dob: '2018-04-12',
        guardianName: 'សុខ វាសនា',
        guardianPhone: '012 345 678',
        village: 'ភ្នំពុំ',
        commune: 'ត្រពាំងក្រសាំង',
        district: 'បាទី',
        province: 'តាកែវ'
      };

      const res = await notifyTelegramNewStudent(sampleStudent as any, {
        nameKhmer: currentUser?.nameKhmer || 'លោក លីម សន',
        role: 'នាយកសាលា (តេស្តសាកល្បង)'
      });

      if (res.success) {
        toast(`✅ បានផ្ញើសារជូនដំណឹងសិស្សថ្មីទៅកាន់ Telegram bot រួចរាល់!`, 'success');
      } else {
        toast(`⚠️ បរាជ័យក្នុងការផ្ញើ៖ ${res.message}`, 'error');
      }
      refreshLogs();
    } catch (e: any) {
      toast(`❌ កំហុស៖ ${e?.message || 'Error sending test message'}`, 'error');
    } finally {
      setTestingType(null);
    }
  };

  // Test 2: New Teacher Notification
  const handleTestNewTeacher = async () => {
    setTestingType('teacher');
    try {
      const sampleTeacher = teachers[0] || {
        id: 'sample-t1',
        staffCode: 'MOEYS-10001',
        nameKhmer: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
        nameLatin: 'Sim Sreymom',
        gender: 'F',
        role: 'គ្រូបង្រៀនថ្នាក់ទី១ក',
        assignedGrade: 1,
        assignedSection: 'ក',
        phone: '012 987 654',
        email: 'sreymom.sim@moeys.gov.kh',
        qualification: 'គរុកោសល្យបឋមសិក្សា (១២+២)',
        yearsOfService: 6
      };

      const res = await notifyTelegramNewTeacher(sampleTeacher as any, {
        nameKhmer: currentUser?.nameKhmer || 'លោក លីម សន',
        role: 'នាយកសាលា (តេស្តសាកល្បង)'
      });

      if (res.success) {
        toast(`✅ បានផ្ញើសារជូនដំណឹងគ្រូថ្មីទៅកាន់ Telegram bot រួចរាល់!`, 'success');
      } else {
        toast(`⚠️ បរាជ័យក្នុងការផ្ញើ៖ ${res.message}`, 'error');
      }
      refreshLogs();
    } catch (e: any) {
      toast(`❌ កំហុស៖ ${e?.message || 'Error sending test message'}`, 'error');
    } finally {
      setTestingType(null);
    }
  };

  // Test 3: Outstanding Score Update
  const handleTestTopScore = async () => {
    setTestingType('score_top');
    try {
      const sampleScore = scores.find(s => s.gradeLetter === 'A' || s.rank === 1) || {
        id: 'sc-test-top',
        studentId: 's-1',
        studentCode: 'STU-2024-001',
        studentNameKhmer: 'សុខ ចាន់ដារ៉ា',
        gender: 'M',
        grade: 1,
        section: 'ក',
        monthOrSemester: 'មករា',
        academicYear: '2024-2025',
        scores: {
          khmerReading: 9.5,
          khmerWriting: 9.0,
          mathematics: 9.8,
          scienceSocial: 9.2,
          moralCivics: 9.6,
          artsPhysical: 9.5
        },
        totalScore: 56.6,
        averageScore: 9.43,
        rank: 1,
        gradeLetter: 'A',
        resultStatus: 'ជាប់',
        remarks: 'ខិតខំរៀនសូត្របានល្អប្រសើរណាស់ ចំណាត់ថ្នាក់លេខ១ ប្រចាំថ្នាក់!'
      };

      const res = await notifyTelegramScoreUpdate(sampleScore as any, true, {
        nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
        role: 'គ្រូបន្ទុកថ្នាក់ទី១ក (តេស្តសាកល្បង)'
      });

      if (res.success) {
        toast(`✅ បានផ្ញើសារដំណឹងពិន្ទុឆ្នើម (និទ្ទេស A) ទៅកាន់ Telegram bot!`, 'success');
      } else {
        toast(`⚠️ បរាជ័យក្នុងការផ្ញើ៖ ${res.message}`, 'error');
      }
      refreshLogs();
    } catch (e: any) {
      toast(`❌ កំហុស៖ ${e?.message || 'Error sending test message'}`, 'error');
    } finally {
      setTestingType(null);
    }
  };

  // Test 4: At-Risk Score Update
  const handleTestAtRiskScore = async () => {
    setTestingType('score_risk');
    try {
      const sampleAtRisk = scores.find(s => s.resultStatus === 'ធ្លាក់' || s.averageScore < 5.0) || {
        id: 'sc-test-risk',
        studentId: 's-2',
        studentCode: 'STU-2024-015',
        studentNameKhmer: 'កែវ វិបុល',
        gender: 'M',
        grade: 1,
        section: 'ក',
        monthOrSemester: 'មករា',
        academicYear: '2024-2025',
        scores: {
          khmerReading: 3.5,
          khmerWriting: 3.0,
          mathematics: 4.0,
          scienceSocial: 4.5,
          moralCivics: 4.5,
          artsPhysical: 4.5
        },
        totalScore: 24.0,
        averageScore: 4.0,
        rank: 28,
        gradeLetter: 'F',
        resultStatus: 'ធ្លាក់',
        remarks: 'មធ្យមភាគក្រោម ៥.០ ត្រូវការជួបប្រឹក្សាជាមួយមាតាបិតា និងបំប៉នបន្ទាន់!'
      };

      const res = await notifyTelegramScoreUpdate(sampleAtRisk as any, true, {
        nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
        role: 'គ្រូបន្ទុកថ្នាក់ទី១ក (តេស្តសាកល្បង)'
      });

      if (res.success) {
        toast(`⚠️ បានផ្ញើសារដំណឹងសិស្សរៀនយឺត (Academic Alert) ទៅ Telegram!`, 'warning');
      } else {
        toast(`⚠️ បរាជ័យក្នុងការផ្ញើ៖ ${res.message}`, 'error');
      }
      refreshLogs();
    } catch (e: any) {
      toast(`❌ កំហុស៖ ${e?.message || 'Error sending test message'}`, 'error');
    } finally {
      setTestingType(null);
    }
  };

  const filteredLogs = recentLogs.filter(log => {
    if (filterType === 'all') return true;
    if (filterType === 'new_student') return log.fullMessage?.includes('សិស្សថ្មី') || log.messageSnippet?.includes('សិស្សថ្មី');
    if (filterType === 'new_teacher') return log.fullMessage?.includes('គ្រូថ្មី') || log.messageSnippet?.includes('គ្រូថ្មី');
    if (filterType === 'score_update') return log.fullMessage?.includes('ពិន្ទុ') || log.messageSnippet?.includes('ពិន្ទុ');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>ប្រព័ន្ធជូនដំណឹងស្វ័យប្រវត្តិតាមព្រឹត្តិការណ៍ជាក់ស្តែង (Real-time Event Triggers)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Telegram Bot Automated Triggers & Alerts
            </h2>
            <p className="text-indigo-100 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              ប្រព័ន្ធនឹងបញ្ជូនសារស្វ័យប្រវត្តភ្លាមៗទៅកាន់ Telegram bot នៅពេលដែលមាន <b>សិស្សថ្មី</b>, <b>គ្រូបង្រៀនថ្មី</b> ត្រូវបានបន្ថែមក្នុងប្រព័ន្ធ ឬនៅពេលមាន <b>ការអាប់ដេតពិន្ទុ ឬលទ្ធផលសិក្សាសំខាន់ៗ</b>។
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center w-full sm:w-auto">
              <span className="text-[11px] text-indigo-200 block">Telegram Bot Destination</span>
              <span className="text-xs font-mono font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                @PPTC_Notify_bot
              </span>
            </div>
            <button
              onClick={refreshLogs}
              className="p-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-all text-xs flex items-center gap-1.5"
              title="ទាញយកទិន្នន័យឡើងវិញ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trigger Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trigger 1: New Student */}
        <div className={`bg-white rounded-2xl border transition-all p-5 shadow-sm flex flex-col justify-between ${
          settings.notifyOnNewStudent ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-slate-200 opacity-80'
        }`}>
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewStudent}
                  onChange={e => handleToggle('notifyOnNewStudent', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-slate-800 text-base">ចុះឈ្មោះសិស្សថ្មី</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.notifyOnNewStudent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {settings.notifyOnNewStudent ? 'សកម្ម (Active)' : 'ផ្អាក (Paused)'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              ជូនដំណឹងស្វ័យប្រវត្តភ្លាមៗនៅពេលមានការបញ្ចូលសិស្សថ្មីចូលរៀន រួមមាន៖ ឈ្មោះសិស្ស, អត្តលេខ, ថ្នាក់រៀន, ភេទ, ថ្ងៃខែឆ្នាំកំណើត, អាណាព្យាបាល, ទូរស័ព្ទ និងអាសយដ្ឋាន។
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-4">
              <div className="flex items-center justify-between">
                <span>🎯 ចំណុចកេះ (Trigger Event):</span>
                <span className="font-semibold text-slate-800">addStudent()</span>
              </div>
              <div className="flex items-center justify-between">
                <span>📁 ការនាំចូលច្រើន (Bulk Excel):</span>
                <span className="font-semibold text-indigo-700">សរុបជាកញ្ចប់ (1 Summary)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestNewStudent}
            disabled={testingType === 'student'}
            className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-indigo-200"
          >
            {testingType === 'student' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>កំពុងផ្ញើទៅកាន់ Telegram...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>ធ្វើតេស្តផ្ញើសារសិស្សថ្មី (Test Send)</span>
              </>
            )}
          </button>
        </div>

        {/* Trigger 2: New Teacher */}
        <div className={`bg-white rounded-2xl border transition-all p-5 shadow-sm flex flex-col justify-between ${
          settings.notifyOnNewTeacher ? 'border-purple-200 ring-1 ring-purple-50' : 'border-slate-200 opacity-80'
        }`}>
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewTeacher}
                  onChange={e => handleToggle('notifyOnNewTeacher', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-slate-800 text-base">បន្ថែមលោកគ្រូ-អ្នកគ្រូថ្មី</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.notifyOnNewTeacher ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {settings.notifyOnNewTeacher ? 'សកម្ម (Active)' : 'ផ្អាក (Paused)'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              ជូនដំណឹងស្វ័យប្រវត្តពេលនាយកសាលាបន្ថែមគ្រូបង្រៀន ឬបុគ្គលិកថ្មី រួមមាន៖ គោត្តនាម-នាម, អត្តលេខមន្ត្រី, មុខតំណែង, បន្ទុកថ្នាក់, លេខទូរស័ព្ទ, និងសញ្ញាបត្រ។
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-4">
              <div className="flex items-center justify-between">
                <span>🎯 ចំណុចកេះ (Trigger Event):</span>
                <span className="font-semibold text-slate-800">addTeacher()</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🔑 ការបង្កើតគណនី:</span>
                <span className="font-semibold text-purple-700">អមដោយ Login Sync</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestNewTeacher}
            disabled={testingType === 'teacher'}
            className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-purple-200"
          >
            {testingType === 'teacher' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>កំពុងផ្ញើទៅកាន់ Telegram...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>ធ្វើតេស្តផ្ញើសារគ្រូថ្មី (Test Send)</span>
              </>
            )}
          </button>
        </div>

        {/* Trigger 3: Score Updates */}
        <div className={`bg-white rounded-2xl border transition-all p-5 shadow-sm flex flex-col justify-between ${
          settings.notifyOnSignificantScore ? 'border-amber-200 ring-1 ring-amber-50' : 'border-slate-200 opacity-80'
        }`}>
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnSignificantScore}
                  onChange={e => handleToggle('notifyOnSignificantScore', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-slate-800 text-base">អាប់ដេតពិន្ទុសំខាន់ៗ</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.notifyOnSignificantScore ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {settings.notifyOnSignificantScore ? 'សកម្ម (Active)' : 'ផ្អាក (Paused)'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              ជូនដំណឹងពិន្ទុប្រឡង និងចំណាត់ថ្នាក់តាមលក្ខខណ្ឌកំណត់ (និទ្ទេស A/B, លេខ ១-៣ ក្នុងថ្នាក់, ឬសិស្សរៀនយឺតដែលប្រឈមការធ្លាក់)។
            </p>

            {/* Threshold Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                លក្ខខណ្ឌចម្រោះពិន្ទុ (Filter Criterion):
              </label>
              <select
                value={settings.scoreNotifyThreshold}
                onChange={e => handleToggle('scoreNotifyThreshold', e.target.value)}
                className="w-full text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="significant_only">🌟 សិស្សឆ្នើម (A/B, Top 3) & ⚠️ រៀនយឺត (F/ធ្លាក់)</option>
                <option value="all">📈 គ្រប់ពិន្ទុទាំងអស់ (All Score Records)</option>
                <option value="top_only">🏆 តែសិស្សឆ្នើម (Top-Ranked Only)</option>
                <option value="at_risk_only">🚨 តែសិស្សរៀនយឺត/ប្រឈមធ្លាក់ (At-Risk Only)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTestTopScore}
              disabled={testingType === 'score_top'}
              className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 border border-amber-200"
            >
              {testingType === 'score_top' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 text-amber-600" />
              )}
              <span>តេស្តពិន្ទុឆ្នើម</span>
            </button>

            <button
              onClick={handleTestAtRiskScore}
              disabled={testingType === 'score_risk'}
              className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 border border-rose-200"
            >
              {testingType === 'score_risk' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-600" />
              )}
              <span>តេស្តពិន្ទុរៀនយឺត</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs & Real-time Verification Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              កំណត់ត្រាប្រវត្តិការបញ្ជូនសារស្វ័យប្រវត្ត (Event Notifications Audit)
            </h3>
            <p className="text-xs text-slate-500">
              រាល់សារដែលកេះដោយស្វ័យប្រវត្ត (សិស្សថ្មី, គ្រូថ្មី, ពិន្ទុ) ត្រូវបានកត់ត្រាទុកក្នុង Activity Log ដោយផ្ទាល់
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ទាំងអស់ ({recentLogs.length})
            </button>
            <button
              onClick={() => setFilterType('new_student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'new_student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🎓 សិស្សថ្មី
            </button>
            <button
              onClick={() => setFilterType('new_teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'new_teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              👨‍🏫 គ្រូថ្មី
            </button>
            <button
              onClick={() => setFilterType('score_update')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'score_update'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📊 អាប់ដេតពិន្ទុ
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">មិនទាន់មានកំណត់ត្រាបញ្ជូនសារថ្មីៗឡើយ។ អ្នកអាចចុច "ធ្វើតេស្តផ្ញើសារ" ខាងលើដើម្បីសាកល្បងបាន។</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map(log => {
              const isSuccess = log.status === 'success';
              const isStudent = log.fullMessage?.includes('សិស្សថ្មី') || log.messageSnippet?.includes('សិស្សថ្មី');
              const isTeacher = log.fullMessage?.includes('គ្រូថ្មី') || log.messageSnippet?.includes('គ្រូថ្មី');
              const isScore = log.fullMessage?.includes('ពិន្ទុ') || log.messageSnippet?.includes('ពិន្ទុ');

              return (
                <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2.5 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isStudent ? 'bg-indigo-50 text-indigo-600' :
                      isTeacher ? 'bg-purple-50 text-purple-600' :
                      isScore ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isStudent && <GraduationCap className="w-4 h-4" />}
                      {isTeacher && <Users className="w-4 h-4" />}
                      {isScore && <Award className="w-4 h-4" />}
                      {!isStudent && !isTeacher && !isScore && <Send className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-800">
                          {log.destinationName || `Telegram Chat ID: ${log.destinationChatId}`}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isSuccess ? '✓ ជោគជ័យ' : '✗ បរាជ័យ'}
                        </span>
                        {log.triggeredByName && (
                          <span className="text-[10px] text-slate-400">
                            ដោយ៖ {log.triggeredByName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 font-mono text-[11px] bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                        {log.messageSnippet || log.fullMessage?.slice(0, 120)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px] text-slate-400 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span>{log.timestamp}</span>
                    {log.latencyMs && (
                      <span className="text-[10px] text-emerald-600 font-mono">
                        {log.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
