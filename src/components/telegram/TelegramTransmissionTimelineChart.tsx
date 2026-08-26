import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  BarChart2,
  Table,
  Sparkles,
  Info
} from 'lucide-react';
import {
  TelegramTransmissionRecord,
  TelegramTransmissionHistoryResponse,
  getTelegramTransmissionHistory,
  simulateTestTransmissionBurst,
  getTelegramDelayMs
} from '../../services/telegramService';

interface Props {
  currentSliderDelayMs?: number;
  onRefreshParent?: () => void;
  className?: string;
}

export const TelegramTransmissionTimelineChart: React.FC<Props> = ({
  currentSliderDelayMs,
  className = ''
}) => {
  const [data, setData] = useState<TelegramTransmissionRecord[]>([]);
  const [summary, setSummary] = useState<TelegramTransmissionHistoryResponse['summary'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [displayMode, setDisplayMode] = useState<'chart' | 'table'>('chart');
  const [messageLimit, setMessageLimit] = useState<10 | 20 | 50>(10);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const targetDelayMs = currentSliderDelayMs ?? getTelegramDelayMs();
  const targetDelaySec = Number((targetDelayMs / 1000).toFixed(2));

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationToast({ message, type });
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await getTelegramTransmissionHistory();
      if (res && res.success) {
        setData(res.history || []);
        setSummary(res.summary || null);
      }
    } catch (err) {
      console.warn('Failed to fetch transmission history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Periodic light polling to keep timeline fresh
    const timer = setInterval(() => {
      fetchHistory();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Filtered dataset according to selected limit
  const visibleData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(-messageLimit).map((item, index) => {
      const diffSec = Number((item.actualIntervalSec - item.targetDelaySec).toFixed(2));
      return {
        ...item,
        displayIndex: `#${item.seq || index + 1}`,
        diffSec,
        diffSecLabel: diffSec >= 0 ? `+${diffSec}s` : `${diffSec}s`,
        // Formatted seconds for clean chart plotting
        actualSec: item.actualIntervalSec,
        targetSec: item.targetDelaySec || targetDelaySec,
      };
    });
  }, [data, messageLimit, targetDelaySec]);

  // Handle simulated test burst
  const handleSimulateBurst = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateTestTransmissionBurst(5, targetDelayMs);
      if (res.success) {
        showNotification(`⚡ បានបញ្ជូនសារសាកល្បង ៥ សារ ជាមួយនឹងគម្លាត ${(targetDelayMs / 1000).toFixed(1)} វិនាទី!`, 'success');
        await fetchHistory();
      } else {
        showNotification(res.message || 'បរាជ័យក្នុងការតេស្ត', 'error');
      }
    } catch (err: any) {
      showNotification('កំហុស៖ ' + err?.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Calculate live stats from visible data if summary not available
  const computedStats = useMemo(() => {
    if (visibleData.length === 0) {
      return {
        avgSec: targetDelaySec,
        minSec: targetDelaySec,
        maxSec: targetDelaySec,
        complianceRate: 100,
        count: 0
      };
    }
    let total = 0;
    let min = visibleData[0].actualSec;
    let max = visibleData[0].actualSec;
    let compliant = 0;

    visibleData.forEach(d => {
      total += d.actualSec;
      if (d.actualSec < min) min = d.actualSec;
      if (d.actualSec > max) max = d.actualSec;
      if (d.actualSec >= (d.targetSec * 0.9)) compliant++;
    });

    return {
      avgSec: Number((total / visibleData.length).toFixed(2)),
      minSec: Number(min.toFixed(2)),
      maxSec: Number(max.toFixed(2)),
      complianceRate: Number(((compliant / visibleData.length) * 100).toFixed(1)),
      count: visibleData.length
    };
  }, [visibleData, targetDelaySec]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 ${className}`}>
      {/* Toast alert */}
      {notificationToast && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
          notificationToast.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : notificationToast.type === 'error'
            ? 'bg-rose-50 text-rose-900 border-rose-200'
            : 'bg-indigo-50 text-indigo-900 border-indigo-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>បន្ទាត់ពេលវេលា & គម្លាតបញ្ជូនសារជាក់ស្តែង (Transmission Interval Timeline)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Recharts Live
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-battambang mt-0.5">
              ផ្ទៀងផ្ទាត់ប្រសិទ្ធភាពគម្លាតពន្យាពេលជាក់ស្តែង (Actual Spacing vs Target Delay Slider)
            </p>
          </div>
        </div>

        {/* View mode toggle & Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Limit selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            {[10, 20, 50].map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => setMessageLimit(limit as any)}
                className={`px-2 py-1 rounded-md text-[11px] transition-all ${
                  messageLimit === limit
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {limit} សារ
              </button>
            ))}
          </div>

          {/* Display Mode: Chart vs Table */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setDisplayMode('chart')}
              className={`p-1.5 rounded-md transition-all ${
                displayMode === 'chart'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="បង្ហាញជាក្រាហ្វ (Line Chart)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                displayMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="បង្ហាញជាតារាង (Log Table)"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Test Burst simulation button */}
          <button
            type="button"
            onClick={handleSimulateBurst}
            disabled={isSimulating}
            className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            title="សាកល្បងបញ្ជូន 5 សារ ដើម្បីផ្ទៀងផ្ទាត់ក្រាហ្វគម្លាតពន្យាពេល"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-300 ${isSimulating ? 'animate-bounce' : ''}`} />
            <span>{isSimulating ? 'កំពុងតេស្ត...' : 'តេស្តផ្ទៀងផ្ទាត់ (5 សារ)'}</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-all disabled:opacity-40"
            title="ទាញយកទិន្នន័យចុងក្រោយ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" />
            <span>គម្លាតមធ្យមជាក់ស្តែង</span>
          </div>
          <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
            {computedStats.avgSec.toFixed(2)}s
          </div>
          <div className="text-[10px] text-slate-400 font-battambang">
            (ប្រែប្រួល ±{Math.abs(computedStats.avgSec - targetDelaySec).toFixed(2)}s)
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-amber-500" />
            <span>គោលដៅកំណត់ (Slider)</span>
          </div>
          <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
            {targetDelaySec.toFixed(2)}s
          </div>
          <div className="text-[10px] text-slate-400 font-battambang">
            ({targetDelayMs} ms)
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>អត្រាអនុលោមភាពសុវត្ថិភាព</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
            {computedStats.complianceRate}%
          </div>
          <div className="text-[10px] text-emerald-600 font-battambang">
            ✓ គ្មានការជាប់ Spam/429
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-500" />
            <span>សារបានវិភាគ</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
            {computedStats.count} <span className="text-xs font-normal text-slate-500">សារ</span>
          </div>
          <div className="text-[10px] text-slate-400 font-battambang">
            ចន្លោះ {computedStats.minSec}s - {computedStats.maxSec}s
          </div>
        </div>
      </div>

      {/* Main visualization area */}
      {displayMode === 'chart' ? (
        <div className="space-y-2">
          <div className="h-64 sm:h-72 w-full pt-2">
            {visibleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={visibleData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="intervalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="displayIndex"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.3), Math.ceil(targetDelaySec * 1.5))]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}s`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs font-sans">
                            <div className="flex items-center justify-between border-b border-slate-700 pb-1 text-slate-300">
                              <span className="font-bold font-mono text-indigo-300">សារ {item.displayIndex}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.timeLabel}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                              <div>
                                <span className="text-slate-400 block text-[10px]">គម្លាតជាក់ស្តែង៖</span>
                                <span className="font-mono font-bold text-emerald-400 text-sm">{item.actualSec}s</span>
                                <span className="text-[10px] text-slate-400 block">({item.actualIntervalMs} ms)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">គោលដៅកំណត់៖</span>
                                <span className="font-mono font-bold text-amber-400 text-sm">{item.targetSec}s</span>
                                <span className="text-[10px] text-slate-400 block">({item.targetDelayMs} ms)</span>
                              </div>
                            </div>
                            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">គម្លាតខុសគ្នា៖</span>
                              <span className={`font-mono font-bold ${
                                Math.abs(item.diffSec) <= 0.2 ? 'text-emerald-300' : 'text-amber-300'
                              }`}>
                                {item.diffSecLabel}
                              </span>
                            </div>
                            {item.messagePreview && (
                              <div className="text-[10px] text-slate-300 bg-slate-800/80 p-1.5 rounded-lg line-clamp-2 italic font-battambang">
                                "{item.messagePreview}"
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }}
                    formatter={(value) => {
                      if (value === 'actualSec') return <span className="text-indigo-900 font-semibold">គម្លាតជាក់ស្តែង (Actual Interval Achieved)</span>;
                      if (value === 'targetSec') return <span className="text-amber-800 font-semibold">គោលដៅកំណត់ (Target Setting)</span>;
                      return value;
                    }}
                  />
                  {/* Reference line for current target delay slider */}
                  <ReferenceLine
                    y={targetDelaySec}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `Target: ${targetDelaySec}s`,
                      position: 'insideTopRight',
                      fill: '#d97706',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actualSec"
                    fill="url(#intervalGradient)"
                    stroke="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="actualSec"
                    name="actualSec"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Activity className="w-8 h-8 opacity-40 animate-pulse text-indigo-400" />
                <p className="text-xs">មិនទាន់មានទិន្នន័យបញ្ជូនសារនៅឡើយ</p>
                <button
                  type="button"
                  onClick={handleSimulateBurst}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                >
                  ⚡ បង្កើតសារតេស្តដំបូង
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-battambang bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                បន្ទាត់ពណ៌ស្វាយ <span className="font-bold text-indigo-700">(Actual Interval)</span> បង្ហាញពីគម្លាតវិនាទីជាក់ស្តែងដែលប្រព័ន្ធបានផ្អាករវាងសារនីមួយៗ ដោយធៀបនឹងបន្ទាត់ដាច់ពណ៌លឿង <span className="font-bold text-amber-700">(Target Slider)</span>។
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Log Table */
        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">ល.រ</th>
                <th className="py-2.5 px-3">ម៉ោងបញ្ជូន</th>
                <th className="py-2.5 px-3">Chat ID / គោលដៅ</th>
                <th className="py-2.5 px-3 text-right">គោលដៅ (Target)</th>
                <th className="py-2.5 px-3 text-right">ជាក់ស្តែង (Actual)</th>
                <th className="py-2.5 px-3 text-right">គម្លាតខុសគ្នា</th>
                <th className="py-2.5 px-3 text-center">ស្ថានភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {visibleData.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-700">{item.displayIndex}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans">{item.timeLabel}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans truncate max-w-[140px]" title={item.messagePreview}>
                    {item.messagePreview || String(item.chatId)}
                  </td>
                  <td className="py-2 px-3 text-right text-amber-700 font-bold">{item.targetSec}s</td>
                  <td className="py-2 px-3 text-right text-emerald-700 font-bold">{item.actualSec}s</td>
                  <td className="py-2 px-3 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      Math.abs(item.diffSec) <= 0.1
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.diffSec > 0
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.diffSecLabel}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {item.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ជោគជ័យ
                      </span>
                    ) : item.status === 'retry' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Throttled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
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
  );
};
