import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { Student, StudentScoreRecord, DailyAttendanceRecord } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Sparkles,
  Target,
  BookOpen,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  ChevronRight,
  Printer
} from 'lucide-react';

interface StudentProgressAnalysisProps {
  student: Student;
  scores: StudentScoreRecord[];
  dailyAttendance?: DailyAttendanceRecord[];
  academicYear?: string;
  className?: string;
}

// Canonical Khmer Academic Month Order
const KHMER_MONTHS_ORDER = [
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'ឆមាសទី១',
  'ឆមាសទី២'
];

interface MonthlyDataPoint {
  month: string;
  rawMonth: string;
  averageScore: number;
  totalScore: number;
  rank: number;
  gradeLetter: string;
  attendanceRate: number;
  khmer: number;
  math: number;
  science: number;
  morals: number;
  arts: number;
  growth: number; // Δ vs previous month
  status: 'ជាប់' | 'ធ្លាក់';
  remarks?: string;
}

export const StudentProgressAnalysis: React.FC<StudentProgressAnalysisProps> = ({
  student,
  scores,
  dailyAttendance = [],
  academicYear,
  className = ''
}) => {
  const [activeAnalysisView, setActiveAnalysisView] = useState<
    'overview_trend' | 'subject_comparison' | 'radar_competency' | 'monthly_bars'
  >('overview_trend');
  const [targetGoalGPA, setTargetGoalGPA] = useState<number>(8.0);
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<'all' | 'sem1' | 'sem2'>('all');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');

  // Filter and sort scores for this specific student
  const studentScores = useMemo(() => {
    return scores
      .filter(s => s.studentId === student.id || (student.code && s.studentCode === student.code))
      .sort((a, b) => {
        const idxA = KHMER_MONTHS_ORDER.indexOf(a.monthOrSemester);
        const idxB = KHMER_MONTHS_ORDER.indexOf(b.monthOrSemester);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
  }, [scores, student.id, student.code]);

  // Calculate monthly attendance rates for this student
  const monthlyAttendanceMap = useMemo(() => {
    const map: { [month: string]: { total: number; present: number } } = {};

    dailyAttendance.forEach(record => {
      if (!record.date) return;
      const monthIndex = new Date(record.date).getMonth() + 1; // 1-12
      let kmMonth = 'មករា';
      if (monthIndex === 10) kmMonth = 'តុលា';
      else if (monthIndex === 11) kmMonth = 'វិច្ឆិកា';
      else if (monthIndex === 12) kmMonth = 'ធ្នូ';
      else if (monthIndex === 1) kmMonth = 'មករា';
      else if (monthIndex === 2) kmMonth = 'កុម្ភៈ';
      else if (monthIndex === 3) kmMonth = 'មីនា';
      else if (monthIndex === 4) kmMonth = 'មេសា';
      else if (monthIndex === 5) kmMonth = 'ឧសភា';
      else if (monthIndex === 6) kmMonth = 'មិថុនា';
      else if (monthIndex === 7) kmMonth = 'កក្កដា';

      if (!map[kmMonth]) map[kmMonth] = { total: 0, present: 0 };

      if (record.studentId === student.id) {
        map[kmMonth].total += 1;
        if (record.status === 'present' || record.status === 'permission') {
          map[kmMonth].present += 1;
        }
      }
    });

    return map;
  }, [dailyAttendance, student.id]);

  // Construct structured timeline points
  const processedTrendData: MonthlyDataPoint[] = useMemo(() => {
    if (studentScores.length === 0) {
      // Fallback demo projection if no scores yet
      return [
        {
          month: 'តុលា',
          rawMonth: 'តុលា',
          averageScore: 7.2,
          totalScore: 43.2,
          rank: 5,
          gradeLetter: 'B',
          attendanceRate: 98,
          khmer: 7.5,
          math: 7.0,
          science: 7.2,
          morals: 8.0,
          arts: 8.5,
          growth: 0,
          status: 'ជាប់'
        },
        {
          month: 'វិច្ឆិកា',
          rawMonth: 'វិច្ឆិកា',
          averageScore: 7.6,
          totalScore: 45.6,
          rank: 4,
          gradeLetter: 'B',
          attendanceRate: 95,
          khmer: 7.8,
          math: 7.4,
          science: 7.5,
          morals: 8.2,
          arts: 8.5,
          growth: 0.4,
          status: 'ជាប់'
        },
        {
          month: 'ធ្នូ',
          rawMonth: 'ធ្នូ',
          averageScore: 8.1,
          totalScore: 48.6,
          rank: 3,
          gradeLetter: 'A',
          attendanceRate: 100,
          khmer: 8.2,
          math: 8.0,
          science: 8.0,
          morals: 8.5,
          arts: 9.0,
          growth: 0.5,
          status: 'ជាប់'
        },
        {
          month: 'មករា',
          rawMonth: 'មករា',
          averageScore: 8.45,
          totalScore: 50.7,
          rank: 2,
          gradeLetter: 'A',
          attendanceRate: 96,
          khmer: 8.6,
          math: 8.3,
          science: 8.4,
          morals: 8.8,
          arts: 9.0,
          growth: 0.35,
          status: 'ជាប់'
        },
        {
          month: 'ឆមាសទី១',
          rawMonth: 'ឆមាសទី១',
          averageScore: 8.3,
          totalScore: 49.8,
          rank: 2,
          gradeLetter: 'A',
          attendanceRate: 98,
          khmer: 8.5,
          math: 8.1,
          science: 8.2,
          morals: 8.6,
          arts: 8.9,
          growth: -0.15,
          status: 'ជាប់'
        },
        {
          month: 'កុម្ភៈ',
          rawMonth: 'កុម្ភៈ',
          averageScore: 8.7,
          totalScore: 52.2,
          rank: 1,
          gradeLetter: 'A',
          attendanceRate: 100,
          khmer: 8.9,
          math: 8.6,
          science: 8.7,
          morals: 9.0,
          arts: 9.2,
          growth: 0.4,
          status: 'ជាប់'
        }
      ];
    }

    let prevAvg = 0;
    return studentScores.map((scoreRec, index) => {
      const att = monthlyAttendanceMap[scoreRec.monthOrSemester];
      const attRate = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 96;

      // Extract subject scores with fallback calculations
      const rawScores = scoreRec.scores || {};
      const khmerScore =
        rawScores.khmer ??
        (rawScores.khmerReading !== undefined && rawScores.khmerWriting !== undefined
          ? (rawScores.khmerReading + rawScores.khmerWriting) / 2
          : rawScores.khmerReading ?? rawScores.khmerWriting ?? rawScores.listening ?? scoreRec.averageScore);

      const mathScore =
        rawScores.mathematics ??
        rawScores.math ??
        (rawScores.numbers !== undefined && rawScores.geometry !== undefined
          ? (rawScores.numbers + rawScores.geometry) / 2
          : rawScores.numbers ?? scoreRec.averageScore);

      const scienceScore =
        rawScores.science ??
        rawScores.scienceSocial ??
        rawScores.socialStudies ??
        scoreRec.averageScore;

      const moralsScore =
        rawScores.moralCivics ??
        rawScores.morals ??
        rawScores.ethics ??
        scoreRec.averageScore;

      const artsScore =
        rawScores.artsPhysical ??
        rawScores.homeEconomicsArts ??
        rawScores.physicalHealth ??
        rawScores.lifeSkills ??
        scoreRec.averageScore;

      const currentAvg = scoreRec.averageScore;
      const growth = index === 0 ? 0 : Number((currentAvg - prevAvg).toFixed(2));
      prevAvg = currentAvg;

      return {
        month: scoreRec.monthOrSemester,
        rawMonth: scoreRec.monthOrSemester,
        averageScore: Number(currentAvg.toFixed(2)),
        totalScore: Number(scoreRec.totalScore.toFixed(1)),
        rank: scoreRec.rank || 1,
        gradeLetter: scoreRec.gradeLetter || 'A',
        attendanceRate: attRate,
        khmer: Number(Number(khmerScore).toFixed(1)),
        math: Number(Number(mathScore).toFixed(1)),
        science: Number(Number(scienceScore).toFixed(1)),
        morals: Number(Number(moralsScore).toFixed(1)),
        arts: Number(Number(artsScore).toFixed(1)),
        growth,
        status: scoreRec.resultStatus || 'ជាប់',
        remarks: scoreRec.remarks
      };
    });
  }, [studentScores, monthlyAttendanceMap]);

  // Filter by semester
  const filteredData = useMemo(() => {
    if (selectedPeriodFilter === 'sem1') {
      return processedTrendData.filter(d =>
        ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'ឆមាសទី១'].includes(d.rawMonth)
      );
    }
    if (selectedPeriodFilter === 'sem2') {
      return processedTrendData.filter(d =>
        ['កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី២'].includes(d.rawMonth)
      );
    }
    return processedTrendData;
  }, [processedTrendData, selectedPeriodFilter]);

  // Summary Metrics
  const latestDataPoint = filteredData[filteredData.length - 1] || processedTrendData[0];
  const firstDataPoint = filteredData[0] || processedTrendData[0];
  const overallChange = latestDataPoint && firstDataPoint
    ? Number((latestDataPoint.averageScore - firstDataPoint.averageScore).toFixed(2))
    : 0;

  const highestScorePoint = useMemo(() => {
    if (processedTrendData.length === 0) return null;
    return [...processedTrendData].sort((a, b) => b.averageScore - a.averageScore)[0];
  }, [processedTrendData]);

  const lowestScorePoint = useMemo(() => {
    if (processedTrendData.length === 0) return null;
    return [...processedTrendData].sort((a, b) => a.averageScore - b.averageScore)[0];
  }, [processedTrendData]);

  const averageYearGPA = useMemo(() => {
    if (processedTrendData.length === 0) return 0;
    const sum = processedTrendData.reduce((acc, curr) => acc + curr.averageScore, 0);
    return Number((sum / processedTrendData.length).toFixed(2));
  }, [processedTrendData]);

  // Radar Data (Subject Competencies of Latest Period vs Class Benchmark)
  const radarCompetencyData = useMemo(() => {
    if (!latestDataPoint) return [];
    return [
      {
        subject: 'ភាសាខ្មែរ',
        studentScore: latestDataPoint.khmer,
        benchmark: 7.5,
        fullMark: 10
      },
      {
        subject: 'គណិតវិទ្យា',
        studentScore: latestDataPoint.math,
        benchmark: 7.2,
        fullMark: 10
      },
      {
        subject: 'វិទ្យាសាស្ត្រ-សង្គម',
        studentScore: latestDataPoint.science,
        benchmark: 7.4,
        fullMark: 10
      },
      {
        subject: 'សីលធម៌-ពលរដ្ឋ',
        studentScore: latestDataPoint.morals,
        benchmark: 8.0,
        fullMark: 10
      },
      {
        subject: 'សិល្បៈ & កាយវិការ',
        studentScore: latestDataPoint.arts,
        benchmark: 8.2,
        fullMark: 10
      }
    ];
  }, [latestDataPoint]);

  // Determine Strongest and Growth Areas
  const subjectRankings = useMemo(() => {
    if (!latestDataPoint) return { best: 'ភាសាខ្មែរ', needFocus: 'គណិតវិទ្យា' };
    const subs = [
      { name: 'ភាសាខ្មែរ', score: latestDataPoint.khmer },
      { name: 'គណិតវិទ្យា', score: latestDataPoint.math },
      { name: 'វិទ្យាសាស្ត្រ-សង្គម', score: latestDataPoint.science },
      { name: 'សីលធម៌-ពលរដ្ឋ', score: latestDataPoint.morals },
      { name: 'សិល្បៈ & កាយវិការ', score: latestDataPoint.arts }
    ].sort((a, b) => b.score - a.score);

    return {
      best: subs[0]?.name || 'ភាសាខ្មែរ',
      bestScore: subs[0]?.score || 0,
      needFocus: subs[subs.length - 1]?.name || 'គណិតវិទ្យា',
      focusScore: subs[subs.length - 1]?.score || 0
    };
  }, [latestDataPoint]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-battambang space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
            <span className="font-moul text-amber-300">{label}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              និទ្ទេស {data.gradeLetter}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-200">
            <span>មធ្យមភាគពិន្ទុ៖</span>
            <span className="font-times font-bold text-base text-emerald-400">
              {data.averageScore} / 10
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300 text-[11px]">
            <span>ចំណាត់ថ្នាក់ក្នុងថ្នាក់៖</span>
            <span className="font-bold text-amber-300">លេខ {data.rank}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 text-[11px]">
            <span>អត្រាវត្តមាន៖</span>
            <span className="font-bold text-teal-300">{data.attendanceRate}%</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 grid grid-cols-2 gap-1 text-[10px] text-slate-300">
            <div>ខ្មែរ: <strong className="text-white">{data.khmer}</strong></div>
            <div>គណិត: <strong className="text-white">{data.math}</strong></div>
            <div>វិទ្យាសាស្ត្រ: <strong className="text-white">{data.science}</strong></div>
            <div>សីលធម៌: <strong className="text-white">{data.morals}</strong></div>
          </div>

          {data.growth !== 0 && (
            <div className="pt-1 flex items-center justify-between text-[10.5px]">
              <span className="text-slate-400">កំណើនធៀបខែមុន៖</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  data.growth > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {data.growth > 0 ? `+${data.growth}` : data.growth}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="student-progress-analysis-panel"
      className={`space-y-6 font-battambang ${className}`}
    >
      {/* Header & Quick Analysis Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>ការវិភាគការវិវត្តសមត្ថភាពសិស្ស (Performance Trend Analytics)</span>
              </div>
              <h2 className="font-moul text-lg sm:text-2xl text-white tracking-wide">
                គំនូសតាង និងការវិភាគវឌ្ឍនភាពសិក្សា
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                សិស្ស៖ <strong className="text-white font-semibold">{student.nameKhmer}</strong> ({student.code}) • ថ្នាក់ទី {student.grade}{student.section} • ឆ្នាំសិក្សា {academicYear || '២០២៤-២០២៥'}
              </p>
            </div>

            {/* Target GPA Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <Target className="w-4 h-4 text-amber-400 ml-1" />
              <div className="text-xs">
                <span className="text-slate-400 text-[10px] block">គោលដៅពិន្ទុ (Target GPA)</span>
                <select
                  value={targetGoalGPA}
                  onChange={e => setTargetGoalGPA(Number(e.target.value))}
                  className="bg-slate-900 text-amber-300 font-times font-bold text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value={7.0}>៧.០ (កម្រិតបង្គួរ / B)</option>
                  <option value={8.0}>៨.០ (កម្រិតល្អ / A)</option>
                  <option value={8.5}>៨.៥ (កម្រិតល្អប្រសើរ / A+)</option>
                  <option value={9.0}>៩.០ (កម្រិតឆ្នើម / Honor)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4 Summary Highlight Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold block">មធ្យមភាគប្រចាំឆ្នាំ</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-times font-bold text-white">{averageYearGPA}</span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                {overallChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {overallChange >= 0 ? `+${overallChange} កំណើនសរុប` : `${overallChange} ថយចុះ`}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold block">ខែពិន្ទុខ្ពស់បំផុត</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-moul text-amber-300">
                  {highestScorePoint?.rawMonth || '-'}
                </span>
              </div>
              <span className="text-[10px] text-amber-200/80">
                ពិន្ទុ {highestScorePoint?.averageScore} (លេខ {highestScorePoint?.rank})
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold block">មុខវិជ្ជាខ្លាំងជាងគេ</span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-emerald-300 truncate">
                  {subjectRankings.best}
                </span>
              </div>
              <span className="text-[10px] text-emerald-200/80">
                ពិន្ទុ {subjectRankings.bestScore}/10
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold block">មុខវិជ្ជាត្រូវពង្រឹង</span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-rose-300 truncate">
                  {subjectRankings.needFocus}
                </span>
              </div>
              <span className="text-[10px] text-rose-200/80">
                ពិន្ទុ {subjectRankings.focusScore}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveAnalysisView('overview_trend')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAnalysisView === 'overview_trend'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>និន្នាការមធ្យមភាគ (GPA Trend)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisView('subject_comparison')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAnalysisView === 'subject_comparison'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>និន្នាការតាមមុខវិជ្ជា (By Subject)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisView('radar_competency')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAnalysisView === 'radar_competency'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>រ៉ាដាសមត្ថភាព (Competency Radar)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAnalysisView('monthly_bars')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAnalysisView === 'monthly_bars'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ប្រៀបធៀបប្រចាំខែ (Monthly Bars)</span>
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedPeriodFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPeriodFilter === 'all'
                ? 'bg-white text-blue-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ពេញមួយឆ្នាំ
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeriodFilter('sem1')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPeriodFilter === 'sem1'
                ? 'bg-white text-blue-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ឆមាសទី១
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeriodFilter('sem2')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedPeriodFilter === 'sem2'
                ? 'bg-white text-blue-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ឆមាសទី២
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* VIEW 1: OVERVIEW GPA TREND AREA CHART */}
        {activeAnalysisView === 'overview_trend' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-moul text-sm text-slate-800">
                  ខ្សែកោងវឌ្ឍនភាពមធ្យមភាគពិន្ទុ (GPA Trend vs Goal Line)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  បង្ហាញពីការប្រែប្រួលពិន្ទុមធ្យមភាគធៀបនឹងគោលដៅ {targetGoalGPA}/10 និងកម្រិតជាប់ ៥.០
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span> មធ្យមភាគសិស្ស
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-1 bg-amber-500"></span> គោលដៅ ({targetGoalGPA})
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-1 bg-rose-500 border border-dashed border-rose-500"></span> បន្ទាត់ជាប់ (៥.០)
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="scoreColorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Battambang' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 5, 6, 8, 10]}
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Times New Roman' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={5.0}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'ជាប់ (5.0)',
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'insideBottomRight'
                    }}
                  />
                  <ReferenceLine
                    y={targetGoalGPA}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    label={{
                      value: `គោលដៅ (${targetGoalGPA})`,
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreColorGradient)"
                    activeDot={{ r: 7, stroke: '#1e40af', strokeWidth: 2, fill: '#60a5fa' }}
                    name="មធ្យមភាគពិន្ទុ"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 2: SUBJECT COMPARISON MULTI-LINE CHART */}
        {activeAnalysisView === 'subject_comparison' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-moul text-sm text-slate-800">
                  ការប្រៀបធៀបនិន្នាការតាមមុខវិជ្ជា (Subject Trajectory Analysis)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ពិនិត្យមើលការរីកចម្រើននៃមុខវិជ្ជាស្នូល (ភាសាខ្មែរ, គណិត, វិទ្យាសាស្ត្រ, សីលធម៌, សិល្បៈ)
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Battambang' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Times New Roman' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'Battambang' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="khmer"
                    name="ភាសាខ្មែរ"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="math"
                    name="គណិតវិទ្យា"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="science"
                    name="វិទ្យាសាស្ត្រ-សង្គម"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="morals"
                    name="សីលធម៌-ពលរដ្ឋ"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="arts"
                    name="សិល្បៈ & កាយវិការ"
                    stroke="#7c3aed"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: RADAR COMPETENCY CHART */}
        {activeAnalysisView === 'radar_competency' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  outerRadius={105}
                  data={radarCompetencyData}
                  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                >
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#1e293b', fontSize: 11, fontFamily: 'Battambang', fontWeight: 'bold' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 10]}
                    tick={{ fill: '#64748b', fontSize: 9 }}
                  />
                  <Radar
                    name="សមត្ថភាពសិស្ស"
                    dataKey="studentScore"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="កម្រិតមធ្យមថ្នាក់ (Benchmark)"
                    dataKey="benchmark"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.15}
                    strokeDasharray="3 3"
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontFamily: 'Battambang' }}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-moul text-xs text-slate-800">
                ការវាយតម្លៃសមត្ថភាពពហុវិស័យ
              </h4>
              <div className="space-y-2.5 text-xs">
                {radarCompetencyData.map(item => (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">{item.subject}</span>
                      <span className="font-times font-bold text-blue-900">
                        {item.studentScore} / 10
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.studentScore >= 8.0
                            ? 'bg-emerald-500'
                            : item.studentScore >= 6.5
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${(item.studentScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: MONTHLY BARS & RANK COMPARISON */}
        {activeAnalysisView === 'monthly_bars' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-moul text-sm text-slate-800">
                  ពិន្ទុសរុប & ចំណាត់ថ្នាក់តាមខែនីមួយៗ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ពិនិត្យពិន្ទុមធ្យមភាគ និងចំណាត់ថ្នាក់សិស្សក្នុងថ្នាក់
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Battambang' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Times New Roman' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="averageScore"
                    name="មធ្យមភាគពិន្ទុ"
                    radius={[8, 8, 0, 0]}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.averageScore >= targetGoalGPA
                            ? '#10b981'
                            : entry.averageScore >= 6.5
                            ? '#3b82f6'
                            : '#f59e0b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Smart Learning Recommendations & Study Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="font-moul text-xs font-bold">ភាពខ្លាំងលេចធ្លោ (Strengths)</h4>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            សិស្សទទួលបានលទ្ធផលល្អប្រសើរលើ <strong>{subjectRankings.best}</strong> ({subjectRankings.bestScore}/10) និងរក្សាបាននូវវឌ្ឍនភាពជាប់លាប់ខ្ពស់។
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-amber-950 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
            <h4 className="font-moul text-xs font-bold">គន្លឹះពង្រឹងបន្ថែម (Focus Strategy)</h4>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            គួរចំណាយពេលបន្ថែម ៣០នាទីរៀងរាល់ល្ងាចលើ <strong>{subjectRankings.needFocus}</strong> ដើម្បីជួយជំរុញពិន្ទុមធ្យមភាគឱ្យដល់គោលដៅ <strong>{targetGoalGPA}/10</strong>។
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 text-indigo-950 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-800">
            <Award className="w-5 h-5 text-indigo-600 shrink-0" />
            <h4 className="font-moul text-xs font-bold">ការលើកទឹកចិត្ត (Academic Honors)</h4>
          </div>
          <p className="text-xs text-indigo-900 leading-relaxed">
            រក្សាបាននូវអត្រាវត្តមានល្អ ({latestDataPoint?.attendanceRate || 98}%) និងការខិតខំប្រឹងប្រែងជាប់លាប់ប្រចាំខែ។
          </p>
        </div>
      </div>
    </div>
  );
};
