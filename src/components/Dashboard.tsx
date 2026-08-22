import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  CircleDollarSign,
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  FileSpreadsheet,
  QrCode,
  HeartPulse,
  BookOpenCheck,
  CheckCircle,
  Clock,
  Sparkles,
  PieChart as PieChartIcon,
  MapPin,
  Facebook,
  Phone,
  ExternalLink,
  Building2,
  BadgeCheck,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    calendarEvents,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    setActiveTab,
    schoolProfile
  } = useSchool();

  // Calculations
  const totalStudents = students.length;
  const femaleStudents = students.filter(s => s.gender === 'F').length;
  const maleStudents = students.filter(s => s.gender === 'M').length;
  const femalePercent = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0;

  const totalTeachers = teachers.length;
  const femaleTeachers = teachers.filter(t => t.gender === 'F').length;

  const totalIncomeRiel = getTotalIncome();
  const totalExpenseRiel = getTotalExpense();
  const balanceRiel = getBalance();
  const balanceUsd = Math.round(balanceRiel / 4050);

  // Grade Distribution Data
  const gradeDistribution = [1, 2, 3, 4, 5, 6].map(g => {
    const gradeStudents = students.filter(s => s.grade === g);
    const boys = gradeStudents.filter(s => s.gender === 'M').length;
    const girls = gradeStudents.filter(s => s.gender === 'F').length;
    return {
      name: `ថ្នាក់ទី ${g}`,
      សិស្សប្រុស: boys,
      សិស្សស្រី: girls,
      សរុប: gradeStudents.length
    };
  });

  // Subject Averages Data
  const subjectAverages = [
    { subject: 'ភាសាខ្មែរ (អំណាន)', average: 8.7 },
    { subject: 'ភាសាខ្មែរ (សំណេរ)', average: 8.2 },
    { subject: 'គណិតវិទ្យា', average: 8.5 },
    { subject: 'វិទ្យាសាស្ត្រ-សង្គម', average: 8.6 },
    { subject: 'សីលធម៌-ពលរដ្ឋ', average: 9.1 },
    { subject: 'សិល្បៈ-កាយវិការ', average: 8.8 }
  ];

  // Budget Source Breakdown Data
  const budgetBySourceMap: { [key: string]: number } = {};
  budgetTransactions.forEach(tx => {
    if (tx.type === 'income') {
      budgetBySourceMap[tx.source] = (budgetBySourceMap[tx.source] || 0) + tx.amountRiel;
    }
  });

  const budgetSourceData = Object.keys(budgetBySourceMap).map(source => ({
    name: source,
    value: budgetBySourceMap[source]
  }));

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Top Achievers (Sort by average score descending)
  const topStudents = [...scores]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  // Health / Nutrition status count
  const normalNutrition = students.filter(s => s.health.nutritionStatus === 'normal').length;
  const underweightNutrition = students.filter(s => s.health.nutritionStatus === 'underweight').length;
  const overweightNutrition = students.filter(s => s.health.nutritionStatus === 'overweight').length;

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-indigo-800/60">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm leading-normal">
                <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                <span>ស្តង់ដារសាលាបឋមសិក្សាគំរូ</span>
              </span>
              <span className="text-blue-200">ឆ្នាំសិក្សា {schoolProfile.academicYear}</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-300 font-mono">កូដសាលា: {schoolProfile.schoolCode}</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-moul tracking-wide text-white leading-tight">
                {schoolProfile.nameKhmer}
              </h2>
              <p className="text-amber-200/90 text-sm font-medium">
                {schoolProfile.nameLatin}
              </p>
            </div>

            {/* Geographical and Principal Details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-200 pt-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>{schoolProfile.village} {schoolProfile.commune} {schoolProfile.district} {schoolProfile.province}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>នាយកសាលា: <strong className="text-white">{schoolProfile.principalName}</strong></span>
              </div>
              <a
                href={`tel:${schoolProfile.principalPhone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-mono font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{schoolProfile.principalPhone}</span>
              </a>
            </div>

            {/* Quick External Links Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {schoolProfile.mapUrl && (
                <a
                  href={schoolProfile.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 rounded-lg text-xs text-red-200 hover:text-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>មើលទីតាំង Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
              {schoolProfile.facebookPage && (
                <a
                  href={schoolProfile.facebookPage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 rounded-lg text-xs text-sky-200 hover:text-white transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5 text-sky-400" />
                  <span>ទំព័រ Facebook ផ្លូវការ</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 flex-shrink-0">
            <button
              id="dash-add-student-btn"
              onClick={() => setActiveTab('students')}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-white" />
              ចុះឈ្មោះសិស្សថ្មី
            </button>
            <button
              id="dash-record-score-btn"
              onClick={() => setActiveTab('scores')}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-transform active:scale-95"
            >
              <BookOpenCheck className="w-4 h-4 text-amber-300" />
              បញ្ចូលពិន្ទុប្រចាំខែ
            </button>
            <button
              id="dash-reports-btn"
              onClick={() => setActiveTab('reports_qr')}
              className="flex items-center justify-center gap-2 bg-indigo-800/90 hover:bg-indigo-800 border border-indigo-500/40 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-transform active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              របាយការណ៍ MoEYS
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ចំនួនសិស្សសរុប</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">នាក់</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>ស្រី: <strong className="text-rose-600">{femaleStudents}</strong> ({femalePercent}%)</span>
            <span>ប្រុស: <strong className="text-blue-600">{maleStudents}</strong></span>
          </div>
        </div>

        {/* Teachers and Staff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">គ្រូបង្រៀន និងបុគ្គលិក</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalTeachers}</span>
            <span className="text-xs text-slate-500">រូប</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>គ្រូស្រី: <strong className="text-indigo-700">{femaleTeachers}</strong> រូប</span>
            <span className="text-emerald-600 font-medium">ពេញម៉ោង ១០០%</span>
          </div>
        </div>

        {/* Total Classrooms */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">បន្ទប់ថ្នាក់រៀន (ថ្នាក់ទី១ - ទី៦)</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{classrooms.length}</span>
            <span className="text-xs text-slate-500">បន្ទប់</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>សមាមាត្រសិស្ស/ថ្នាក់: ~{Math.round(totalStudents / (classrooms.length || 1))}</span>
            <span className="text-blue-600 font-medium">គ្រប់គ្រងបានល្អ</span>
          </div>
        </div>

        {/* Budget Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">សមតុល្យថវិកាសាលា</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">
              {(balanceRiel / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs font-medium text-slate-600">រៀល</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>ស្មើនឹង: <strong>~${balanceUsd.toLocaleString()}</strong></span>
            <span className="text-emerald-700 font-semibold">ស្ថិរភាពហិរញ្ញវត្ថុ</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Enrollment by Grade */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-kantumruy">ស្ថិតិសិស្សតាមកម្រិតថ្នាក់ (ថ្នាក់ទី១ ដល់ទី៦)</h3>
              <p className="text-xs text-slate-500">ការបែងចែកសិស្សប្រុស និងសិស្សស្រីតាមកម្រិតថ្នាក់នីមួយៗ</p>
            </div>
            <button
              onClick={() => setActiveTab('students')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              មើលបញ្ជីសិស្ស <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  formatter={(value, name) => [`${value} នាក់`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="សិស្សប្រុស" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="សិស្សស្រី" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Sources Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 font-kantumruy">ប្រភពថវិកាសាលា (Budget by Source)</h3>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-4">សមាមាត្រចំណូលតាមប្រភពថវិការដ្ឋ និងដៃគូអភិវឌ្ឍន៍</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {budgetSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)} លានរៀល`, 'ចំនួន']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5 mt-2 border-t border-slate-100 pt-3">
            {budgetSourceData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {(item.value / 1000000).toFixed(1)}M ៛
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Analytics: Subject Achievement & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Average Scores */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-kantumruy">មធ្យមភាគពិន្ទុសិក្សាតាមមុខវិជ្ជា</h3>
              <p className="text-xs text-slate-500">ការវាយតម្លៃគុណផលសិក្សារបស់សិស្សតាមមុខវិជ្ជាគោល</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ពិន្ទុពេញ ១០
            </span>
          </div>

          <div className="space-y-3">
            {subjectAverages.map((item, idx) => {
              const pct = (item.average / 10) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.subject}</span>
                    <span className="font-bold text-slate-900">{item.average} / 10</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Outstanding Students (សិស្សពូកែប្រចាំខែ) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-kantumruy">តារាងកិត្តិយសសិស្សពូកែ</h3>
                  <p className="text-xs text-slate-500">លទ្ធផលប្រឡងឆ្នើមប្រចាំខែ</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {topStudents.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.studentNameKhmer}</h4>
                      <p className="text-[11px] text-slate-500">
                        ថ្នាក់ទី {item.grade}{item.section} • {item.studentCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700">{item.averageScore}</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">
                      និទ្ទេស {item.gradeLetter}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('scores')}
            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
          >
            មើលតារាងចំណាត់ថ្នាក់ពេញលេញ
          </button>
        </div>
      </div>

      {/* Nutrition, Health & Quick Administrative Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Academic Calendar & Exam Schedule Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">ប្រតិទិនសិក្សា MoEYS</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">កាលវិភាគប្រឡង & ឈប់</h4>
            <p className="text-xs text-blue-600 font-semibold mt-1 font-times">{calendarEvents.length} Events Synced</p>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="w-12 h-12 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
            title="បើកប្រតិទិនសិក្សា"
          >
            <Calendar className="w-6 h-6" />
          </button>
        </div>

        {/* Health & Nutrition Quick Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">ស្ថានភាពអាហារូបត្ថម្ភ (BMI)</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">សុខភាពសិស្សបឋម</h4>
            <div className="flex gap-1.5 mt-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                ធម្មតា: {normalNutrition}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                ស្គម: {underweightNutrition}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('attendance_health')}
            className="w-12 h-12 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors"
          >
            <HeartPulse className="w-6 h-6" />
          </button>
        </div>

        {/* QR Code Identification Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">ប្រព័ន្ធ QR Code</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">បោះពុម្ពកាតសិស្ស & គ្រូ</h4>
            <p className="text-xs text-slate-500 mt-1">ស្កេនពិនិត្យវត្តមាន និងអត្តសញ្ញាណ</p>
          </div>
          <button
            onClick={() => setActiveTab('reports_qr')}
            className="w-12 h-12 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors"
          >
            <QrCode className="w-6 h-6" />
          </button>
        </div>

        {/* MoEYS Official Reports Link */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">ស្តង់ដារក្រសួង MoEYS</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">របាយការណ៍ស្ថិតិដើមឆ្នាំ</h4>
            <p className="text-xs text-slate-500 mt-1">ទាញយកជា Excel / PDF ផ្លូវការ</p>
          </div>
          <button
            onClick={() => setActiveTab('reports_qr')}
            className="w-12 h-12 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
          >
            <FileSpreadsheet className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
