import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  BellRing,
  ShieldAlert,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2,
  Activity,
  Zap,
  Sliders,
  Trash2,
  Info,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  AdminAlertConfig,
  BotAlertLogRecord,
  BotErrorCategory,
  getAdminAlertConfig,
  saveAdminAlertConfig,
  getBotAlertHistory,
  clearBotAlertHistory,
  triggerBotErrorAlert,
  getConsecutiveApiFailures,
} from '../../services/telegramService';

interface TelegramBotAlertSystemProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isPrincipal?: boolean;
}

export const TelegramBotAlertSystem: React.FC<TelegramBotAlertSystemProps> = ({
  onShowToast,
  isPrincipal = true,
}) => {
  const [config, setConfig] = useState<AdminAlertConfig>(() => getAdminAlertConfig());
  const [alertHistory, setAlertHistory] = useState<BotAlertLogRecord[]>(() => getBotAlertHistory());
  const [isSendingTestAlert, setIsSendingTestAlert] = useState(false);
  const [testScenario, setTestScenario] = useState<BotErrorCategory>('initialization_failure');
  const [testCustomMessage, setTestCustomMessage] = useState('');
  const [currentFailures, setCurrentFailures] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setConfig(getAdminAlertConfig());
    setAlertHistory(getBotAlertHistory());
    setCurrentFailures(getConsecutiveApiFailures());

    const interval = setInterval(() => {
      setAlertHistory(getBotAlertHistory());
      setCurrentFailures(getConsecutiveApiFailures());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateConfig = (partial: Partial<AdminAlertConfig>) => {
    if (!isPrincipal) {
      onShowToast('🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចកែប្រែប្រព័ន្ធប្រកាសអាសន្នបាន!', 'error');
      return;
    }
    const updated = saveAdminAlertConfig(partial);
    setConfig(updated);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onShowToast('✅ បានរក្សាទុកការកំណត់ប្រព័ន្ធប្រកាសអាសន្នស្វ័យប្រវត្ត!', 'success');
    }, 300);
  };

  const handleSendTestAlert = async () => {
    setIsSendingTestAlert(true);
    try {
      const errorMsg =
        testCustomMessage.trim() ||
        (testScenario === 'initialization_failure'
          ? 'Bot Initialization Failed: Invalid Telegram Bot Token or Unauthorized Handshake (401 Unauthorized)'
          : testScenario === 'persistent_api_error'
          ? 'Persistent Telegram Gateway Error: Failed to dispatch 3 consecutive notification payloads'
          : testScenario === 'webhook_sync_error'
          ? 'Webhook Ingress Timeout: SSL certificate mismatch or unreachable reverse proxy endpoint'
          : testScenario === 'rate_limit_error'
          ? 'Telegram API HTTP 429: Too Many Requests. Flood prevention triggered for target channel'
          : 'Network Socket Closed: Connection reset by peer after 15000ms');

      const res = await triggerBotErrorAlert({
        category: testScenario,
        errorMessage: errorMsg,
        affectedChatId: config.adminChatId,
        isForced: true,
        details: {
          testMode: true,
          triggeredBy: 'Manual Test Diagnostic',
          serverTime: new Date().toISOString(),
        },
      });

      setAlertHistory(getBotAlertHistory());

      if (res.success) {
        onShowToast(`🚨 បានផ្ញើសារប្រកាសអាសន្នតេស្តទៅកាន់ Telegram ID (${config.adminChatId}) ជោគជ័យ!`, 'success');
      } else {
        onShowToast(`បរាជ័យក្នុងការផ្ញើ Alert: ${res.message}`, 'error');
      }
    } catch (err: any) {
      onShowToast(`កំហុសបច្ចេកទេស: ${err?.message || 'Network error'}`, 'error');
    } finally {
      setIsSendingTestAlert(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('តើអ្នកពិតជាចង់សម្អាតប្រវត្តិនៃការប្រកាសអាសន្នទាំងអស់មែនទេ?')) {
      clearBotAlertHistory();
      setAlertHistory([]);
      onShowToast('បានសម្អាតប្រវត្តិ Alert រួចរាល់!', 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Status Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-rose-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                ប្រព័ន្ធប្រកាសអាសន្នស្វ័យប្រវត្តិ (Automatic Error Alert System)
              </h2>
            </div>
            <p className="text-xs text-rose-200/80 max-w-2xl leading-relaxed">
              ប្រព័ន្ធនឹងចាប់យកបញ្ហាកំហុសបច្ចេកទេសពេល Bot ចាប់ផ្តើមមិនដំណើរការ (Initialization Failure) ឬពេលមានកំហុសបណ្តាញ API ជាប់ៗគ្នា រួចផ្ញើសារអាសន្នបន្ទាន់ទៅកាន់ Telegram Administrator ឬ Channel គ្រប់គ្រងបច្ចេកទេសភ្លាមៗ។
            </p>
          </div>

          {/* Master Toggle & State Badge */}
          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-rose-500/30 shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-300">ស្ថានភាពប្រព័ន្ធ Alert:</div>
              <div className={`text-xs font-black flex items-center justify-end gap-1.5 ${config.enabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                {config.enabled ? 'សកម្ម (Active)' : 'បិទដំណើរការ (Disabled)'}
              </div>
            </div>

            <button
              type="button"
              id="toggle-admin-alert-system-btn"
              onClick={() => handleUpdateConfig({ enabled: !config.enabled })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quick Diagnostic Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-rose-800/30">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-rose-700/20">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Admin គោលដៅ</div>
            <div className="text-xs font-bold text-rose-300 font-mono mt-0.5 truncate">{config.adminChatId}</div>
            <div className="text-[10px] text-slate-400 truncate">{config.adminName}</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-rose-700/20">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">កម្រិតកំណត់ (Threshold)</div>
            <div className="text-xs font-bold text-amber-300 mt-0.5">{config.failureThreshold} លើកជាប់គ្នា</div>
            <div className="text-[10px] text-slate-400">បច្ចុប្បន្ន: {currentFailures} បរាជ័យ</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-rose-700/20">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">គម្លាតផ្អាក (Cooldown)</div>
            <div className="text-xs font-bold text-sky-300 mt-0.5">{config.cooldownMinutes} នាទី</div>
            <div className="text-[10px] text-slate-400">ការពារ Spam Alert</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-rose-700/20">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">ចំនួន Alert បានផ្ញើ</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">{alertHistory.filter(h => h.status === 'sent').length} លើក</div>
            <div className="text-[10px] text-slate-400">{alertHistory.length} កំណត់ត្រាសរុប</div>
          </div>
        </div>
      </div>

      {/* 2. Configuration Settings & Trigger Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Admin Destination & Parameters */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Settings2 className="w-4 h-4 text-indigo-600" />
                ការកំណត់អ្នកទទួលដំណឹងអាសន្ន (Recipient & Thresholds)
              </h3>
              {isSaving && (
                <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> កំពុងរក្សាទុក...
                </span>
              )}
            </div>

            {/* Target Admin Chat ID / Channel */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Telegram Chat ID ឬ Channel ទទួលដំណឹងកំហុស (Admin Error Channel)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="admin-alert-chat-id-input"
                  value={config.adminChatId}
                  onChange={(e) => handleUpdateConfig({ adminChatId: e.target.value.trim() })}
                  placeholder="ឧ. 240224709 ឬ -1001234567890"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateConfig({ adminChatId: '240224709', adminName: 'លោក លឹម សន (Super Admin)' })}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    config.adminChatId === '240224709'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  👑 លោក លឹម សន (@limsorn - 240224709)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateConfig({ adminChatId: '-1002495819004', adminName: 'ប៉ុស្តិ៍ប្រកាសអាសន្នសាលា' })}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    config.adminChatId === '-1002495819004'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📢 ប៉ុស្តិ៍ប្រកាសអាសន្ន (-1002495819004)
                </button>
              </div>
            </div>

            {/* Threshold & Cooldown Slider Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>កម្រិតបរាជ័យជាប់គ្នា (Failure Threshold)</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-mono">
                    {config.failureThreshold} លើក
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={config.failureThreshold}
                  onChange={(e) => handleUpdateConfig({ failureThreshold: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[10px] text-slate-500">
                  {config.failureThreshold === 1
                    ? '⚡ ផ្ញើ Alert ភ្លាមៗពេលមានកំហុស ១ លើកដំបូង'
                    : `⚠️ រង់ចាំបរាជ័យ ${config.failureThreshold} លើកជាប់គ្នាមុននឹងផ្ញើសារអាសន្ន`}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>គម្លាតផ្អាកសារស្ទួន (Cooldown Throttle)</span>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md font-mono">
                    {config.cooldownMinutes} នាទី
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={config.cooldownMinutes}
                  onChange={(e) => handleUpdateConfig({ cooldownMinutes: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <p className="text-[10px] text-slate-500">
                  ការពារការបាញ់សារ Alert ផ្ទួនៗគ្នាច្រើនពេកពេលប្រព័ន្ធបណ្តាញខ្សោយ
                </p>
              </div>
            </div>

            {/* Trigger Conditions Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-800">
                លក្ខខណ្ឌកំណត់ការបញ្ជូនដំណឹងអាសន្ន (Trigger Rules):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.alertOnInitializationFailure}
                    onChange={(e) => handleUpdateConfig({ alertOnInitializationFailure: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">🚨 បរាជ័យពេលចាប់ផ្តើម Bot</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Invalid Token, Token Revoked, ឬមិនអាចទាក់ទង Telegram API
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.alertOnPersistentErrors}
                    onChange={(e) => handleUpdateConfig({ alertOnPersistentErrors: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">⚠️ កំហុសបញ្ជូនសារ API ជាប់ៗគ្នា</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      បរាជ័យលើសពីចំនួន Threshold ដែលបានកំណត់
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.alertOnWebhookFailure}
                    onChange={(e) => handleUpdateConfig({ alertOnWebhookFailure: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 accent-sky-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">📡 កំហុស Webhook / SSL Ingress</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Webhook ត្រូវបានដាច់ ឬខុស URL Endpoint
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={config.alertOnRateLimit}
                    onChange={(e) => handleUpdateConfig({ alertOnRateLimit: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">⏳ លើសកម្រិតកំណត់ Rate-Limit (429)</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Telegram Flood control error
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Testing Playground */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-rose-50 to-white p-5 rounded-3xl border border-rose-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-200 pb-3">
              <div className="p-1.5 bg-rose-600 text-white rounded-lg">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">តេស្តផ្ញើសារប្រកាសអាសន្ន (Test Alert)</h3>
                <p className="text-[10px] text-slate-500">ធ្វើតេស្តផ្ញើកំហុសក្លែងបន្លំទៅកាន់ Telegram Admin</p>
              </div>
            </div>

            {/* Error Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">ជ្រើសរើសសេណារីយ៉ូកំហុសតេស្ត៖</label>
              <select
                value={testScenario}
                onChange={(e) => setTestScenario(e.target.value as BotErrorCategory)}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="initialization_failure">🚨 Bot Initialization Failure (Handshake 401)</option>
                <option value="persistent_api_error">⚠️ Persistent Transmission Errors (500)</option>
                <option value="webhook_sync_error">📡 Webhook Ingress Endpoint Timeout</option>
                <option value="rate_limit_error">⏳ HTTP 429 Too Many Requests</option>
                <option value="network_timeout">🔌 Network Socket Reset</option>
              </select>
            </div>

            {/* Optional Custom Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">សារបន្ថែម (Optional Custom Detail):</label>
              <textarea
                value={testCustomMessage}
                onChange={(e) => setTestCustomMessage(e.target.value)}
                placeholder="បញ្ចូលសារកំហុសបន្ថែមសម្រាប់តេស្ត..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Action Trigger Button */}
            <button
              type="button"
              id="send-test-admin-error-alert-btn"
              onClick={handleSendTestAlert}
              disabled={isSendingTestAlert}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSendingTestAlert ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងបញ្ជូនសារអាសន្ន...</span>
                </>
              ) : (
                <>
                  <BellRing className="w-4 h-4" />
                  <span>🚨 ផ្ញើសារតេស្តទៅ Admin ({config.adminChatId})</span>
                </>
              )}
            </button>

            <div className="p-3 bg-rose-100/60 rounded-xl border border-rose-200 text-[10px] text-rose-900 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-rose-700" />
                របៀបដែលប្រព័ន្ធដំណើរការ៖
              </div>
              <p>
                នៅពេលមានបញ្ហាជាក់ស្តែងកើតឡើង (ដូចជា Bot Token ខុស ឬម៉ាស៊ីនបម្រើ Telegram ដាច់ការតភ្ជាប់) ប្រព័ន្ធនឹងធ្វើការបញ្ជូន Alert នេះដោយស្វ័យប្រវត្ត ១០០% មិនចាំបាច់មានការចុចដៃឡើយ។
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Alert History Log Table & Telemetry */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              កំណត់ត្រាប្រវត្តិនៃការប្រកាសអាសន្ន (Alert History Log)
            </h3>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {alertHistory.length}
            </span>
          </div>

          {alertHistory.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              សម្អាតប្រវត្តិ Alert
            </button>
          )}
        </div>

        {alertHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/60" />
            <p className="text-xs font-medium text-slate-600">មិនទាន់មានកំណត់ត្រាប្រកាសអាសន្នណាមួយនៅឡើយទេ</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              ប្រព័ន្ធកំពុងតាមដានកំហុសស្វ័យប្រវត្ត។ ប្រសិនបើមានបញ្ហាបច្ចេកទេស ព័ត៌មាននឹងបង្ហាញនៅទីនេះ។
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">ម៉ោង</th>
                  <th className="py-2.5 px-3">ប្រភេទកំហុស</th>
                  <th className="py-2.5 px-3">សេចក្តីលម្អិតកំហុស</th>
                  <th className="py-2.5 px-3">Chat គោលដៅ</th>
                  <th className="py-2.5 px-3">បរាជ័យ</th>
                  <th className="py-2.5 px-3">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block text-[11px]">{item.titleKh}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] text-rose-600 bg-rose-50/80 p-1.5 rounded-lg max-w-xs sm:max-w-md truncate border border-rose-100" title={item.errorMessage}>
                        {item.errorMessage}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {item.adminChatId}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                        {item.consecutiveFailures}x
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.status === 'sent' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          បានផ្ញើទៅ Admin
                        </span>
                      ) : item.status === 'throttled' ? (
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-600" />
                          ផ្អាកស្ទួន (Throttled)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          បរាជ័យ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
