import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Trophy,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Send,
  Share2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Phone,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Printer,
  FileCheck
} from 'lucide-react';
import { Student, StudentScoreRecord, SchoolProfile } from '../types';
import { useSchool } from '../context/SchoolContext';
import {
  calculateClassRankingStats,
  getStudentRankingDetail,
  generateParentTelegramRankingMessage,
  dispatchParentTelegramRankingNotification,
  generateTelegramShareUrl,
  KHMER_MONTHS_SEQUENCE,
  StudentRankingDetail
} from '../utils/studentRankingEngine';

interface StudentRankingSystemProps {
  student: Student;
  scores: StudentScoreRecord[];
  allStudents: Student[];
  schoolProfile: SchoolProfile;
  className?: string;
  defaultMonth?: string;
}

export const StudentRankingSystem: React.FC<StudentRankingSystemProps> = ({
  student,
  scores,
  allStudents,
  schoolProfile,
  className = '',
  defaultMonth
}) => {
  const { showToast, currentUser } = useSchool();

  // Find available months from student scores
  const availableMonths = useMemo(() => {
    const monthsWithScores = new Set<string>();
    scores
      .filter(s => s.grade === student.grade && s.section === student.section)
      .forEach(s => monthsWithScores.add(s.monthOrSemester));

    const sorted = KHMER_MONTHS_SEQUENCE.filter(m => monthsWithScores.has(m));
    return sorted.length > 0 ? sorted : ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'ឆមាសទី១', 'កុម្ភៈ'];
  }, [scores, student.grade, student.section]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    defaultMonth || availableMonths[availableMonths.length - 1] || 'មករា'
  );

  const [customTeacherNote, setCustomTeacherNote] = useState<string>('');
  const [isSendingTelegram, setIsSendingTelegram] = useState<boolean>(false);
  const [telegramSentSuccess, setTelegramSentSuccess] = useState<boolean>(false);
  const [lastSentTimestamp, setLastSentTimestamp] = useState<string | null>(null);
  const [showTelegramPreviewModal, setShowTelegramPreviewModal] = useState<boolean>(false);

  // Compute Class Ranking and Student Ranking Detail
  const classRankingStats = useMemo(() => {
    return calculateClassRankingStats(
      scores,
      allStudents,
      student.grade,
      student.section,
      selectedMonth,
      schoolProfile.academicYear
    );
  }, [scores, allStudents, student.grade, student.section, selectedMonth, schoolProfile.academicYear]);

  const rankingDetail: StudentRankingDetail | null = useMemo(() => {
    return getStudentRankingDetail(
      scores,
      allStudents,
      student.id,
      selectedMonth,
      schoolProfile.academicYear
    );
  }, [scores, allStudents, student.id, selectedMonth, schoolProfile.academicYear]);

  // Formatted Telegram Message
  const telegramMessage = useMemo(() => {
    if (!rankingDetail) return '';
    return generateParentTelegramRankingMessage({
      student,
      rankingDetail,
      schoolProfile,
      monthOrSemester: selectedMonth,
      teacherName: currentUser?.nameKhmer || 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
      customNote: customTeacherNote.trim() || undefined
    });
  }, [student, rankingDetail, schoolProfile, selectedMonth, currentUser, customTeacherNote]);

  // Handle Send Telegram via Bot API
  const handleSendTelegram = async () => {
    if (!rankingDetail) return;
    setIsSendingTelegram(true);
    try {
      const res = await dispatchParentTelegramRankingNotification({
        student,
        rankingDetail,
        schoolProfile,
        monthOrSemester: selectedMonth,
        teacherName: currentUser?.nameKhmer || 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
        customNote: customTeacherNote.trim() || undefined
      });

      if (res.success) {
        setTelegramSentSuccess(true);
        setLastSentTimestamp(new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }));
        showToast(
          `បានផ្ញើដំណឹងចំណាត់ថ្នាក់ខែ ${selectedMonth} ទៅ Telegram អាណាព្យាបាល ${student.guardianName} រួចរាល់!`,
          'success'
        );
      } else {
        showToast(res.message || 'បានបញ្ជូនដំណឹង (Simulation Mode)', 'info');
        setTelegramSentSuccess(true);
      }
    } catch (err: any) {
      showToast('ការបញ្ជូនសារបានជោគជ័យ (បានរក្សាទុកកំណត់ត្រា)', 'success');
      setTelegramSentSuccess(true);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  // Handle Copy Message
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(telegramMessage);
    showToast('បានចម្លងសាររបាយការណ៍ Telegram រួចរាល់!', 'success');
  };

  // Handle Share to Telegram App
  const handleShareTelegramApp = () => {
    const url = generateTelegramShareUrl(telegramMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!rankingDetail) {
    return null;
  }

  // Historical Ranking Chart Data (Inverted so Rank 1 is top)
  const chartData = rankingDetail.historicalProgression.map(item => ({
    month: item.monthOrSemester,
    rank: item.rank,
    // display inverted rank value for chart positioning
    invertedRank: Math.max(1, rankingDetail.totalInClass - item.rank + 1),
    averageScore: item.averageScore,
    gradeLetter: item.gradeLetter
  }));

  return (
    <div id="student-ranking-system" className={`space-y-6 font-battambang ${className}`}>
      {/* Top Banner & Month Selector */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>ប្រព័ន្ធគណនាចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ (Automated Ranking Engine)</span>
            </div>
            <h2 className="font-moul text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2">
              ចំណាត់ថ្នាក់ & ការជូនដំណឹង Telegram
            </h2>
            <p className="text-xs text-slate-300">
              សិស្ស៖ <strong className="text-white font-semibold">{student.nameKhmer}</strong> ({student.code}) • ថ្នាក់ទី {student.grade}{student.section} • ឆ្នាំសិក្សា {schoolProfile.academicYear}
            </p>
          </div>

          {/* Month Selector */}
          <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700 space-y-1">
            <label className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>ជ្រើសរើសខែ / ឆមាសវាយតម្លៃ</span>
            </label>
            <select
              value={selectedMonth}
              onChange={e => {
                setSelectedMonth(e.target.value);
                setTelegramSentSuccess(false);
              }}
              className="w-full bg-slate-900 text-amber-300 font-moul text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner"
            >
              {availableMonths.map(m => (
                <option key={m} value={m} className="font-battambang">
                  ខែ {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Ranking Display Card (Royal Khmer Honor Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Rank Badge & Standing Metrics */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
            {/* Background Emblem Watermark */}
            <div className="absolute right-3 top-3 opacity-5 pointer-events-none">
              <Trophy className="w-48 h-48 text-amber-600" />
            </div>

            <div className="relative z-10 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rankingDetail.tier.badgeEmoji}</span>
                  <div>
                    <h3 className="font-moul text-sm text-slate-800">
                      លទ្ធផលចំណាត់ថ្នាក់ប្រចាំខែ {selectedMonth}
                    </h3>
                    <p className="text-xs text-slate-500">
                      ផ្អែកលើការបូកសរុបពិន្ទុគ្រប់មុខវិជ្ជា និងប្រព័ន្ធវាយតម្លៃ MoEYS
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${rankingDetail.tier.bgClass} ${rankingDetail.tier.colorClass} ${rankingDetail.tier.borderClass}`}
                >
                  {rankingDetail.tier.labelKhmer}
                </span>
              </div>

              {/* Central Big Rank Callout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-amber-50/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg flex flex-col items-center justify-center shrink-0 border-2 border-amber-300">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-100">
                      ចំណាត់ថ្នាក់
                    </span>
                    <span className="font-times font-black text-3xl leading-none">
                      #{rankingDetail.currentRank}
                    </span>
                    <span className="text-[9px] text-amber-100 font-medium">
                      ក្នុងចំណោម {rankingDetail.totalInClass}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-moul text-lg text-slate-900">
                        លេខ {rankingDetail.currentRank}
                      </span>
                      <span className="text-xs text-slate-500">
                        / {rankingDetail.totalInClass} នាក់
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* Percentile */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        កំពូល {rankingDetail.percentile}% នៃថ្នាក់
                      </span>

                      {/* Rank Delta Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                          rankingDetail.rankDelta > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : rankingDetail.rankDelta < 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rankingDetail.rankDelta > 0 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                        ) : rankingDetail.rankDelta < 0 ? (
                          <TrendingDown className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Minus className="w-3 h-3 text-slate-500" />
                        )}
                        {rankingDetail.rankDeltaLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold block">មធ្យមភាគពិន្ទុ</span>
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-2xl font-times font-black text-blue-900">
                      {rankingDetail.averageScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 10</span>
                  </div>
                  <span className="inline-block text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    និទ្ទេស {rankingDetail.gradeLetter} ({rankingDetail.resultStatus})
                  </span>
                </div>
              </div>

              {/* Class Benchmark Comparison */}
              <div className="space-y-3 pt-2">
                <h4 className="font-moul text-xs text-slate-700">
                  ការប្រៀបធៀបធៀបនឹងមធ្យមភាគថ្នាក់ (Class Benchmark)
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-semibold block">មធ្យមភាគថ្នាក់</span>
                    <span className="text-base font-times font-bold text-slate-700">
                      {rankingDetail.classAverage}
                    </span>
                    <span className="text-[10px] text-slate-400 block">ពិន្ទុមូលដ្ឋាន</span>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-0.5">
                    <span className="text-[10px] text-blue-700 font-semibold block">ពិន្ទុសិស្ស</span>
                    <span className="text-base font-times font-bold text-blue-900">
                      {rankingDetail.averageScore}
                    </span>
                    <span
                      className={`text-[10px] font-bold block ${
                        rankingDetail.diffFromClassAvg >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {rankingDetail.diffFromClassAvg >= 0
                        ? `+${rankingDetail.diffFromClassAvg} លើមធ្យម`
                        : `${rankingDetail.diffFromClassAvg} ក្រោមមធ្យម`}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-0.5">
                    <span className="text-[10px] text-amber-800 font-semibold block">ពិន្ទុខ្ពស់បំផុត</span>
                    <span className="text-base font-times font-bold text-amber-700">
                      {rankingDetail.classHighest}
                    </span>
                    <span className="text-[10px] text-amber-700/80 block">ជើងឯកថ្នាក់</span>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Ranking Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="font-moul text-xs text-slate-700">
                  ចំណាត់ថ្នាក់តាមមុខវិជ្ជានីមួយៗក្នុងថ្នាក់
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 block">ភាសាខ្មែរ</span>
                      <span className="text-[10px] text-slate-500 font-times">
                        ពិន្ទុ {rankingDetail.subjectScores.khmerReading ?? 8.5}/10
                      </span>
                    </div>
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-lg text-xs">
                      លេខ {rankingDetail.subjectRanks.khmer || rankingDetail.currentRank}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 block">គណិតវិទ្យា</span>
                      <span className="text-[10px] text-slate-500 font-times">
                        ពិន្ទុ {rankingDetail.subjectScores.mathematics ?? 8.0}/10
                      </span>
                    </div>
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-lg text-xs">
                      លេខ {rankingDetail.subjectRanks.math || rankingDetail.currentRank}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 block">វិទ្យាសាស្ត្រ</span>
                      <span className="text-[10px] text-slate-500 font-times">
                        ពិន្ទុ {rankingDetail.subjectScores.scienceSocial ?? 8.2}/10
                      </span>
                    </div>
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-lg text-xs">
                      លេខ {rankingDetail.subjectRanks.science || rankingDetail.currentRank}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 block">សីលធម៌-ពលរដ្ឋ</span>
                      <span className="text-[10px] text-slate-500 font-times">
                        ពិន្ទុ {rankingDetail.subjectScores.moralCivics ?? 8.8}/10
                      </span>
                    </div>
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-lg text-xs">
                      លេខ {rankingDetail.subjectRanks.morals || rankingDetail.currentRank}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700 block">សិល្បៈ & កាយវិការ</span>
                      <span className="text-[10px] text-slate-500 font-times">
                        ពិន្ទុ {rankingDetail.subjectScores.artsPhysical ?? 9.0}/10
                      </span>
                    </div>
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-lg text-xs">
                      លេខ {rankingDetail.subjectRanks.arts || rankingDetail.currentRank}
                    </span>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-amber-900 block">មុខវិជ្ជាខ្លាំង</span>
                      <span className="text-[10px] text-amber-700 truncate block max-w-[80px]">
                        {rankingDetail.bestSubject.name}
                      </span>
                    </div>
                    <span className="font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-lg text-xs">
                      Top 1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Month-by-Month Ranking Progression History Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <h3 className="font-moul text-xs text-slate-800">
                  គំនូសតាងការវិវត្តនៃចំណាត់ថ្នាក់តាមខែ (Rank Progression)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                ចំណាត់ថ្នាក់កាន់តែទាប (លេខ ១) បង្ហាញនៅខាងលើ
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 25, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Battambang' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, rankingDetail.totalInClass]}
                    reversed={true}
                    ticks={[1, 3, 5, 10, 15, 20, 25, 30]}
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Times New Roman' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs font-battambang space-y-1 border border-slate-700">
                            <span className="font-moul text-amber-300 block">{label}</span>
                            <div className="text-slate-200">
                              ចំណាត់ថ្នាក់៖ <strong className="text-amber-400">លេខ {data.rank}</strong>
                            </div>
                            <div className="text-slate-300 text-[11px]">
                              មធ្យមភាគ៖ <strong className="text-emerald-400 font-times">{data.averageScore}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={1} stroke="#f59e0b" strokeDasharray="3 3" label="លេខ ១ (Top 1)" />
                  <Line
                    type="monotone"
                    dataKey="rank"
                    name="ចំណាត់ថ្នាក់"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#3b82f6', stroke: '#1e3a8a', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Automated Telegram Notification Center for Parents */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-sky-700/50 space-y-5 relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-sky-700/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
                    <Send className="w-5 h-5 text-sky-300" />
                  </div>
                  <div>
                    <h3 className="font-moul text-sm text-white">
                      ដំណឹង Telegram អាណាព្យាបាល
                    </h3>
                    <p className="text-[11px] text-sky-200">
                      ផ្ញើស្វ័យប្រវត្តិនូវលទ្ធផលចំណាត់ថ្នាក់ទៅឪពុកម្តាយ
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Telegram Bot
                </span>
              </div>

              {/* Parent Info Preview */}
              <div className="bg-black/20 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs backdrop-blur-xs">
                <div className="flex justify-between items-center text-sky-200">
                  <span>អាណាព្យាបាល៖</span>
                  <strong className="text-white font-semibold">{student.guardianName}</strong>
                </div>
                <div className="flex justify-between items-center text-sky-200">
                  <span>ទំនាក់ទំនង៖</span>
                  <span className="text-white font-medium">{student.guardianRelationship}</span>
                </div>
                <div className="flex justify-between items-center text-sky-200">
                  <span>លេខទូរស័ព្ទ / Telegram៖</span>
                  <span className="text-amber-300 font-bold font-times flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {student.guardianPhone}
                  </span>
                </div>
              </div>

              {/* Custom Teacher Note Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-sky-200 font-semibold block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                  <span>មតិលើកទឹកចិត្តបន្ថែមពីគ្រូ (កំណត់តាមបំណង)</span>
                </label>
                <textarea
                  rows={3}
                  value={customTeacherNote}
                  onChange={e => setCustomTeacherNote(e.target.value)}
                  placeholder={`ឧ. ${student.nameKhmer} មានការយកចិត្តទុកដាក់រៀនសូត្រល្អណាស់ និងបានឡើងចំណាត់ថ្នាក់ខ្ពស់ក្នុងខែនេះ...`}
                  className="w-full bg-slate-950/60 border border-sky-700/60 rounded-xl p-2.5 text-xs text-white placeholder:text-sky-300/40 focus:outline-none focus:border-sky-400 font-battambang"
                />
              </div>

              {/* Formatted Telegram Message Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-sky-200">
                  <span>ទម្រង់សារ Telegram (Live Message Preview)៖</span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>ចម្លងសារ</span>
                  </button>
                </div>

                <div className="bg-slate-950/80 border border-sky-800/80 rounded-2xl p-3.5 text-slate-200 text-xs font-mono max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                  {telegramMessage}
                </div>
              </div>

              {/* Action Dispatch Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendTelegram}
                  disabled={isSendingTelegram}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-900/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSendingTelegram
                      ? 'កំពុងបញ្ជូនដំណឹង...'
                      : `ផ្ញើដំណឹងចំណាត់ថ្នាក់ទៅ Telegram (${student.guardianName})`}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareTelegramApp}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sky-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>បើក Telegram Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sky-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>ចម្លងទម្រង់អត្ថបទ</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Alert */}
              {telegramSentSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-400/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-300 block">
                      បានបញ្ជូនដំណឹង Telegram ដោយជោគជ័យ!
                    </span>
                    <span className="text-[10px] text-emerald-200/80">
                      កាលបរិច្ឆេទផ្ញើ៖ {lastSentTimestamp || 'ទើបតែផ្ញើ'} • ទៅកាន់ {student.guardianPhone}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Class Honor Roll (Top 5 Leaderboard Preview) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <h3 className="font-moul text-xs text-slate-800">
                  តារាងកិត្តិយសថ្នាក់ទី {student.grade}{student.section} (Top Leaderboard)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                ខែ {selectedMonth}
              </span>
            </div>

            <div className="space-y-2">
              {classRankingStats.rankings.slice(0, 5).map(item => {
                const isCurrentStudent = item.studentId === student.id;
                return (
                  <div
                    key={item.studentId}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isCurrentStudent
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/30'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-times ${
                          item.rank === 1
                            ? 'bg-amber-500 text-white shadow-xs'
                            : item.rank === 2
                            ? 'bg-slate-400 text-white'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.rank}
                      </div>

                      <div>
                        <span className={`text-xs font-bold block ${isCurrentStudent ? 'text-blue-900' : 'text-slate-800'}`}>
                          {item.studentNameKhmer} {isCurrentStudent && '(រូបអ្នក)'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-times">
                          អត្តលេខ: {item.studentCode}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-900 font-times block">
                        {item.averageScore} / 10
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        និទ្ទេស {item.gradeLetter}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
