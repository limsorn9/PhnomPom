import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TelegramTransmissionTimelineChart } from './TelegramTransmissionTimelineChart';
import {
  TrendingUp,
  Activity,
  Send,
  MessageSquare,
  Zap,
  ShieldCheck,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface DailyStat {
  date: string;
  dayKhmer: string;
  incoming: number;
  outgoing: number;
  total: number;
}

const LAST_7_DAYS_DATA: DailyStat[] = [
  { date: '2026-08-20', dayKhmer: 'ព្រហស្បតិ៍', incoming: 48, outgoing: 62, total: 110 },
  { date: '2026-08-21', dayKhmer: 'សុក្រ', incoming: 65, outgoing: 88, total: 153 },
  { date: '2026-08-22', dayKhmer: 'សៅរ៍', incoming: 34, outgoing: 42, total: 76 },
  { date: '2026-08-23', dayKhmer: 'អាទិត្យ', incoming: 18, outgoing: 25, total: 43 },
  { date: '2026-08-24', dayKhmer: 'ចន្ទ', incoming: 82, outgoing: 115, total: 197 },
  { date: '2026-08-25', dayKhmer: 'អង្គារ', incoming: 94, outgoing: 128, total: 222 },
  { date: '2026-08-26', dayKhmer: 'ពុធ (ថ្ងៃនេះ)', incoming: 112, outgoing: 145, total: 257 }
];

const LAST_14_DAYS_DATA: DailyStat[] = [
  { date: '2026-08-13', dayKhmer: '១៣ សីហា', incoming: 38, outgoing: 52, total: 90 },
  { date: '2026-08-14', dayKhmer: '១៤ សីហា', incoming: 44, outgoing: 58, total: 102 },
  { date: '2026-08-15', dayKhmer: '១៥ សីហា', incoming: 28, outgoing: 35, total: 63 },
  { date: '2026-08-16', dayKhmer: '១៦ សីហា', incoming: 15, outgoing: 22, total: 37 },
  { date: '2026-08-17', dayKhmer: '១៧ សីហា', incoming: 68, outgoing: 85, total: 153 },
  { date: '2026-08-18', dayKhmer: '១៨ សីហា', incoming: 74, outgoing: 92, total: 166 },
  { date: '2026-08-19', dayKhmer: '១៩ សីហា', incoming: 80, outgoing: 104, total: 184 },
  ...LAST_7_DAYS_DATA
];

const COMMANDS_USAGE_DATA = [
  { command: '/status', count: 342, label: 'ស្ថានភាពសាលា', color: '#6366f1' },
  { command: '/students', count: 285, label: 'បញ្ជីសិស្ស', color: '#0ea5e9' },
  { command: '/attendance', count: 248, label: 'របាយការណ៍វត្តមាន', color: '#10b981' },
  { command: '/start', count: 194, label: 'ចាប់ផ្តើម Bot', color: '#f59e0b' },
  { command: '/teachers', count: 142, label: 'បញ្ជីគ្រូ', color: '#8b5cf6' },
  { command: '/resetpassword', count: 86, label: 'ប្តូរពាក្យសម្ងាត់', color: '#ec4899' },
  { command: '/help', count: 72, label: 'ជំនួយប្រព័ន្ធ', color: '#64748b' }
];

const CATEGORY_DISTRIBUTION = [
  { name: 'វត្តមាន & វិន័យ (Attendance)', value: 38, color: '#10b981' },
  { name: 'ព័ត៌មានសិក្សា & ប្រឡង (Academic)', value: 28, color: '#6366f1' },
  { name: 'សេចក្តីប្រកាស & ដំណឹង (Announcements)', value: 18, color: '#0ea5e9' },
  { name: 'សុវត្ថិភាព & OTP (Security)', value: 10, color: '#f59e0b' },
  { name: 'ប្រព័ន្ធបច្ចេកទេស (System & Ping)', value: 6, color: '#8b5cf6' }
];

const HOURLY_PEAK_DATA = [
  { timeSlot: '06:00-08:00', count: 185, label: 'ចូលរៀនពេលព្រឹក' },
  { timeSlot: '08:00-10:00', count: 120, label: 'ម៉ោងបង្រៀនទី១' },
  { timeSlot: '10:00-12:00', count: 210, label: 'ចេញលេង & វត្តមាន' },
  { timeSlot: '12:00-14:00', count: 95, label: 'ពេលសម្រាកថ្ងៃត្រង់' },
  { timeSlot: '14:00-16:00', count: 175, label: 'ម៉ោងបង្រៀនរសៀល' },
  { timeSlot: '16:00-18:00', count: 245, label: 'ចេញពីរៀន & របាយការណ៍' },
  { timeSlot: '18:00-21:00', count: 115, label: 'ការប្រកាសយប់' }
];

export const TelegramBotAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '14days'>('7days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeData = useMemo(() => {
    return timeRange === '7days' ? LAST_7_DAYS_DATA : LAST_14_DAYS_DATA;
  }, [timeRange]);

  const totalIncoming = useMemo(() => {
    return activeData.reduce((acc, d) => acc + d.incoming, 0);
  }, [activeData]);

  const totalOutgoing = useMemo(() => {
    return activeData.reduce((acc, d) => acc + d.outgoing, 0);
  }, [activeData]);

  const totalAllMessages = totalIncoming + totalOutgoing;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-indigo-400/30 shadow-inner shrink-0">
            <TrendingUp className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 px-3 py-0.5 rounded-full text-xs font-semibold mb-1 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Telegram Bot Usage & Webhook Performance Analytics
            </div>
            <h2 className="text-xl font-bold font-moul">ស្ថិតិវិភាគការប្រើប្រាស់បត</h2>
            <p className="text-slate-300 text-xs">
              តាមដានបរិមាណសារចូល/ចេញ ប្រជាប្រិយភាពនៃពាក្យបញ្ជា (Commands) និងល្បឿនឆ្លើយតបក្នុងពេលជាក់ស្តែង
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700 text-xs">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeRange === '7days' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ៧ ថ្ងៃចុងក្រោយ
            </button>
            <button
              onClick={() => setTimeRange('14days')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeRange === '14days' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ១៤ ថ្ងៃចុងក្រោយ
            </button>
          </div>

          <button
            onClick={handleRefresh}
            title="ធ្វើបច្ចុប្បន្នភាពស្ថិតិ"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Handled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">សារសរុបទាំងអស់ (Total)</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalAllMessages.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              +១៨.៤%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">សារចូល & សារផ្ញើចេញសរុប</p>
        </div>

        {/* Outgoing Notifications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">សារផ្ញើចេញ (Outgoing)</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-sky-700">{totalOutgoing.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">{(totalOutgoing / totalAllMessages * 100).toFixed(0)}% នៃសារសរុប</span>
          </div>
          <p className="text-[11px] text-slate-400">ដំណឹង, វត្តមាន, OTP & សេចក្តីប្រកាស</p>
        </div>

        {/* Incoming Commands */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">សារចូល & ពាក្យបញ្ជា (Incoming)</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-purple-700">{totalIncoming.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">{(totalIncoming / totalAllMessages * 100).toFixed(0)}% នៃសារសរុប</span>
          </div>
          <p className="text-[11px] text-slate-400">Webhook Commands & Query Chats</p>
        </div>

        {/* Latency & Success */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">ល្បឿន & ភាពជោគជ័យ</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-700">~៣៤ ms</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              ៩៩.៨% Success
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Real-time Webhook API Latency</p>
        </div>
      </div>

      {/* Main Chart 1: Daily Message Volume Trend (AreaChart) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              និន្នាការនៃចំនួនសារចូល និងសារផ្ញើចេញប្រចាំថ្ងៃ (Daily Message Flow)
            </h3>
            <p className="text-xs text-slate-500">
              ប្រៀបធៀបរវាងសារដែល Bot ឆ្លើយតប/ផ្ញើចេញ (Outgoing) និងសារដែលបានទទួលពីអ្នកប្រើប្រាស់ (Incoming)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-500"></span>
              <span className="text-slate-600 font-medium">សារផ្ញើចេញ (Outgoing)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-sky-400"></span>
              <span className="text-slate-600 font-medium">សារចូល (Incoming)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="dayKhmer" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'Battambang, sans-serif'
                }}
                formatter={(value: any, name: any) => [
                  `${value} សារ`,
                  name === 'outgoing' ? '📤 សារផ្ញើចេញ' : '📥 សារចូល'
                ]}
                labelFormatter={(label) => `កាលបរិច្ឆេទ: ${label}`}
              />
              <Area type="monotone" dataKey="outgoing" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutgoing)" />
              <Area type="monotone" dataKey="incoming" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncoming)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Charts 2 & 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Command Popularity (BarChart) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              ប្រជាប្រិយភាពនៃពាក្យបញ្ជា (Command Usage Distribution)
            </h3>
            <p className="text-xs text-slate-500">ចំនួនដងដែលសិស្ស និងគ្រូបានចុច ឬវាយពាក្យបញ្ជា</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMMANDS_USAGE_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="command" type="category" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'Battambang, sans-serif'
                  }}
                  formatter={(val: any, _name: any, item: any) => [`${val} ដង (${item.payload.label})`, 'ចំនួនប្រើប្រាស់']}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {COMMANDS_USAGE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Category Breakdown (PieChart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              ចំណែកប្រភេទសារ (Category Breakdown)
            </h3>
            <p className="text-xs text-slate-500">ភាគរយនៃសារតាមផ្នែកនីមួយៗ</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'Battambang, sans-serif'
                  }}
                  formatter={(val: any) => [`${val}%`, 'ចំណែក']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Mini Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {CATEGORY_DISTRIBUTION.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-[11px] truncate max-w-[170px]">{cat.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-800 text-[11px]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Activity Hours Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              ចន្លោះម៉ោងដែលមានសកម្មភាពច្រើនបំផុត (Peak Activity Hours)
            </h3>
            <p className="text-xs text-slate-500">ជួយកំណត់ពេលវេលាសមស្របសម្រាប់ផ្ញើការប្រកាស និងសារស្វ័យប្រវត្តិ</p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            🔥 ម៉ោងសកម្មខ្លាំង: 06:00-08:00 & 16:00-18:00
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURLY_PEAK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timeSlot" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'Battambang, sans-serif'
                }}
                formatter={(val: any, _name: any, item: any) => [`${val} សារ (${item.payload.label})`, 'បរិមាណសារ']}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Telegram Transmission & Delay Interval History Timeline */}
      <TelegramTransmissionTimelineChart />
    </div>
  );
};
