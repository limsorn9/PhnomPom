import React, { useMemo, useState } from 'react';
import { AppUser, SecurityLoginLog } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  Bot,
  Globe,
  Calendar,
  KeyRound,
  Lock,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface SecurityPatternsDashboardProps {
  logs?: SecurityLoginLog[];
  users?: AppUser[];
  onFilterByStatus?: (status: 'all' | 'success' | 'failed') => void;
  onFilterByMethod?: (method: string) => void;
}

export const SecurityPatternsDashboard: React.FC<SecurityPatternsDashboardProps> = ({
  logs = [],
  users = [],
  onFilterByStatus,
  onFilterByMethod
}) => {
  const [activeTimeRange, setActiveTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter logs according to active time range
  const filteredLogs = useMemo(() => {
    const safeLogs = Array.isArray(logs) ? logs : [];
    const now = Date.now();
    return safeLogs.filter(log => {
      if (!log || !log.timestamp) return false;
      const logTime = new Date(log.timestamp).getTime();
      if (activeTimeRange === '7d') {
        return now - logTime <= 7 * 24 * 60 * 60 * 1000;
      }
      if (activeTimeRange === '30d') {
        return now - logTime <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }, [logs, activeTimeRange]);

  // 1. Group failed vs success login attempts by day
  const dailyPatterns = useMemo(() => {
    const dayMap: Record<string, { dateStr: string; label: string; success: number; failed: number; total: number }> = {};
    
    // Generate last 7 days keys
    const daysToGenerate = activeTimeRange === '30d' ? 14 : 7;
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      const dayNameKhmer = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'][d.getDay()];
      const label = `${dayNameKhmer} (${d.getDate()}/${d.getMonth() + 1})`;
      dayMap[dateKey] = { dateStr: dateKey, label, success: 0, failed: 0, total: 0 };
    }

    filteredLogs.forEach(log => {
      const dateKey = log.timestamp.split('T')[0];
      if (!dayMap[dateKey]) {
        const d = new Date(log.timestamp);
        const dayNameKhmer = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'][d.getDay()];
        dayMap[dateKey] = {
          dateStr: dateKey,
          label: `${dayNameKhmer} (${d.getDate()}/${d.getMonth() + 1})`,
          success: 0,
          failed: 0,
          total: 0
        };
      }
      if (log.status === 'success') {
        dayMap[dateKey].success += 1;
      } else {
        dayMap[dateKey].failed += 1;
      }
      dayMap[dateKey].total += 1;
    });

    return Object.values(dayMap).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [filteredLogs, activeTimeRange]);

  // Max daily count for chart scaling
  const maxDailyCount = useMemo(() => {
    const max = Math.max(...dailyPatterns.map(d => d.total), 1);
    return max;
  }, [dailyPatterns]);

  // 2. Group by Device Type
  const deviceBreakdown = useMemo(() => {
    const counts: { desktop: number; mobile: number; tablet: number; bot: number } = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      bot: 0
    };

    filteredLogs.forEach(l => {
      const dev = (l.device || '').toLowerCase();
      const browser = (l.browser || '').toLowerCase();
      const os = (l.os || '').toLowerCase();

      if (dev.includes('bot') || browser.includes('bot') || browser.includes('okhttp') || browser.includes('headless')) {
        counts.bot += 1;
      } else if (dev.includes('tab') || dev.includes('ipad') || browser.includes('tablet')) {
        counts.tablet += 1;
      } else if (dev.includes('phone') || dev.includes('iphone') || dev.includes('android') || os.includes('ios')) {
        counts.mobile += 1;
      } else {
        counts.desktop += 1;
      }
    });

    const total = filteredLogs.length || 1;
    return [
      {
        type: 'desktop',
        label: 'កុំព្យូទ័រលើតុ / Laptop (Desktop)',
        count: counts.desktop,
        percentage: Math.round((counts.desktop / total) * 100),
        icon: Laptop,
        color: 'bg-blue-600',
        textColor: 'text-blue-700',
        bgLight: 'bg-blue-50'
      },
      {
        type: 'mobile',
        label: 'ទូរស័ព្ទដៃ (Smartphone)',
        count: counts.mobile,
        percentage: Math.round((counts.mobile / total) * 100),
        icon: Smartphone,
        color: 'bg-emerald-600',
        textColor: 'text-emerald-700',
        bgLight: 'bg-emerald-50'
      },
      {
        type: 'tablet',
        label: 'ថេបប្លែត (Tablet / iPad)',
        count: counts.tablet,
        percentage: Math.round((counts.tablet / total) * 100),
        icon: Tablet,
        color: 'bg-purple-600',
        textColor: 'text-purple-700',
        bgLight: 'bg-purple-50'
      },
      {
        type: 'bot',
        label: 'ឧបករណ៍ស្វ័យប្រវត្តិ / Bot / Proxy',
        count: counts.bot,
        percentage: Math.round((counts.bot / total) * 100),
        icon: Bot,
        color: 'bg-rose-600',
        textColor: 'text-rose-700',
        bgLight: 'bg-rose-50'
      }
    ];
  }, [filteredLogs]);

  // 3. Group by Auth Method
  const authMethodBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      password: 0,
      mfa_totp: 0,
      mfa_sms: 0,
      google: 0
    };

    filteredLogs.forEach(l => {
      const method = l.method || 'password';
      counts[method] = (counts[method] || 0) + 1;
    });

    const total = filteredLogs.length || 1;
    return [
      {
        key: 'password',
        label: 'ពាក្យសម្ងាត់ធម្មតា (Password)',
        count: counts.password || 0,
        percentage: Math.round(((counts.password || 0) / total) * 100),
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
      },
      {
        key: 'mfa_totp',
        label: 'ផ្ទៀងផ្ទាត់ ២ ជាន់ (2FA TOTP App)',
        count: counts.mfa_totp || 0,
        percentage: Math.round(((counts.mfa_totp || 0) / total) * 100),
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      },
      {
        key: 'mfa_sms',
        label: 'សារ SMS ផ្ទៀងផ្ទាត់ (2FA SMS)',
        count: counts.mfa_sms || 0,
        percentage: Math.round(((counts.mfa_sms || 0) / total) * 100),
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
      },
      {
        key: 'google',
        label: 'Google Workspace SSO',
        count: counts.google || 0,
        percentage: Math.round(((counts.google || 0) / total) * 100),
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }
    ];
  }, [filteredLogs]);

  // 4. Security Health & Anomaly Summary
  const totalEvents = filteredLogs.length;
  const failedEvents = filteredLogs.filter(l => l.status === 'failed').length;
  const successEvents = filteredLogs.filter(l => l.status === 'success').length;
  const failureRate = totalEvents > 0 ? Math.round((failedEvents / totalEvents) * 100) : 0;

  // Suspicious Foreign or Bot logins
  const suspiciousLogs = filteredLogs.filter(
    l => l.status === 'failed' || l.ipAddress.includes('Proxy') || l.ipAddress.includes('Tor') || (l.location && !l.location.includes('Cambodia'))
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-moul text-base text-slate-900">
                ផ្ទាំងវិភាគទិន្នន័យសុវត្ថិភាព & គំរូហានិភ័យ (Security Patterns Dashboard)
              </h3>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full text-[10.5px]">
                Real-time Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ការតាមដានគំរូនៃការប៉ុនប៉ងចូលប្រើប្រាស់, ឧបករណ៍ (Device Types), និងការវិភាគហានិភ័យ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          {[
            { id: '7d', label: '៧ ថ្ងៃចុងក្រោយ' },
            { id: '30d', label: '៣០ ថ្ងៃ' },
            { id: 'all', label: 'ទាំងអស់' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveTimeRange(r.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTimeRange === r.id
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 block">ព្រឹត្តិការណ៍សរុប (Total Events)</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-slate-800 font-mono">{totalEvents}</span>
            <span className="text-xs text-slate-400 font-bold">កំណត់ត្រា</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-slate-700 h-full rounded-full w-full" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/80">
          <span className="text-[11px] font-bold text-emerald-700 block">ចូលជោគជ័យ (Successful Logins)</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-emerald-800 font-mono">{successEvents}</span>
            <span className="text-xs text-emerald-600 font-bold">{totalEvents > 0 ? Math.round((successEvents / totalEvents) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalEvents > 0 ? (successEvents / totalEvents) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/80">
          <span className="text-[11px] font-bold text-rose-700 block">ការប៉ុនប៉ងបរាជ័យ (Failed Attempts)</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-rose-800 font-mono">{failedEvents}</span>
            <span className="text-xs text-rose-600 font-bold font-mono">{failureRate}% ហានិភ័យ</span>
          </div>
          <div className="w-full bg-rose-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-rose-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(failureRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/80">
          <span className="text-[11px] font-bold text-amber-800 block">ចរាចរណ៍គួរឱ្យសង្ស័យ (Suspicious)</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-black text-amber-900 font-mono">{suspiciousLogs.length}</span>
            <span className="text-xs text-amber-700 font-bold">Threat Alerts</span>
          </div>
          <div className="w-full bg-amber-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((suspiciousLogs.length / (totalEvents || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Visual Graphs & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Pattern: Failed vs Successful Logins Bar Chart */}
        <div className="lg:col-span-2 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-700" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  គំរូការចូលប្រើប្រាស់តាមថ្ងៃ (Daily Login Patterns: Success vs Failed)
                </h4>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> ជោគជ័យ
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> បរាជ័យ
                </span>
              </div>
            </div>

            {/* Custom SVG/Bar Chart */}
            <div className="space-y-3 pt-2">
              {dailyPatterns.map((day) => {
                const successPercent = (day.success / maxDailyCount) * 100;
                const failedPercent = (day.failed / maxDailyCount) * 100;

                return (
                  <div key={day.dateStr} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 w-32 truncate">{day.label}</span>
                      <div className="flex items-center gap-2 font-mono text-[10.5px]">
                        {day.failed > 0 && (
                          <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.2 rounded">
                            {day.failed} បរាជ័យ
                          </span>
                        )}
                        <span className="text-emerald-700 font-bold">
                          {day.success} ជោគជ័យ
                        </span>
                      </div>
                    </div>

                    {/* Dual Stacked / Comparative Bar */}
                    <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${successPercent}%` }}
                        title={`${day.success} logins succeeded`}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-500"
                        style={{ width: `${failedPercent}%` }}
                        title={`${day.failed} logins failed`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>* ទិន្នន័យប្រមូលដោយស្វ័យប្រវត្តិតាមរយៈ Security Event Logger</span>
            <span className="font-bold text-indigo-700">អត្រាជោគជ័យមធ្យម៖ {100 - failureRate}%</span>
          </div>
        </div>

        {/* Device Type Breakdown */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-indigo-700" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                ចំណាត់ថ្នាក់តាមឧបករណ៍ (Device Types)
              </h4>
            </div>

            <div className="space-y-3.5">
              {deviceBreakdown.map((dev) => {
                const IconComponent = dev.icon;
                return (
                  <div key={dev.type} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${dev.bgLight} ${dev.textColor} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{dev.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {dev.count} ({dev.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`${dev.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${dev.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authentication Method Distribution */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h5 className="text-[11px] font-bold text-slate-600 mb-2">វិធីសាស្ត្រផ្ទៀងផ្ទាត់ (Auth Methods):</h5>
            <div className="flex flex-wrap gap-1.5">
              {authMethodBreakdown.map(m => (
                <span
                  key={m.key}
                  onClick={() => onFilterByMethod && onFilterByMethod(m.key)}
                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${m.badgeColor}`}
                >
                  {m.label}: {m.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
