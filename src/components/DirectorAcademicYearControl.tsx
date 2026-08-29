import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  GraduationCap,
  History,
  Layers,
  Printer,
  School,
  Sparkles,
  Users,
  Award,
  CircleDollarSign,
  ArrowRight,
  Check
} from 'lucide-react';
import { toKhmerNum } from '../data/initialData';

export const DirectorAcademicYearControl: React.FC = () => {
  const {
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
    schoolProfile,
    updateSchoolProfile,
    students,
    classrooms,
    scores,
    transfers,
    budgetTransactions,
    setActiveTab,
    language
  } = useSchool();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Find index of currently selected year in list
  const currentIndex = academicYears.indexOf(selectedAcademicYear);
  const isOfficialCurrent = selectedAcademicYear === schoolProfile.academicYear;

  // Previous and Next year handlers
  const handlePrevYear = () => {
    if (currentIndex > 0) {
      setSelectedAcademicYear(academicYears[currentIndex - 1]);
    }
  };

  const handleNextYear = () => {
    if (currentIndex < academicYears.length - 1) {
      setSelectedAcademicYear(academicYears[currentIndex + 1]);
    }
  };

  const handleSetCurrentOfficial = () => {
    setSelectedAcademicYear(schoolProfile.academicYear);
  };

  const handleSaveAsOfficialSchoolYear = () => {
    updateSchoolProfile({ academicYear: selectedAcademicYear });
    showToast(`បានកំណត់ «ឆ្នាំសិក្សា ${selectedAcademicYear}» ជាឆ្នាំសិក្សាផ្លូវការរបស់សាលាដោយជោគជ័យ!`);
  };

  // Filtered academic years by decade groups if requested
  const filteredYears = useMemo(() => {
    if (selectedDecade === 'all') return academicYears;
    if (selectedDecade === '2016-2020') {
      return academicYears.filter(y => {
        const start = parseInt(y.split('-')[0].replace(/[^\d]/g, ''), 10);
        return start >= 2016 && start <= 2020;
      });
    }
    if (selectedDecade === '2021-2025') {
      return academicYears.filter(y => {
        const start = parseInt(y.split('-')[0].replace(/[^\d]/g, ''), 10);
        return start >= 2021 && start <= 2025;
      });
    }
    if (selectedDecade === '2026-2030') {
      return academicYears.filter(y => {
        const start = parseInt(y.split('-')[0].replace(/[^\d]/g, ''), 10);
        return start >= 2026 && start <= 2030;
      });
    }
    if (selectedDecade === '2031-2040') {
      return academicYears.filter(y => {
        const start = parseInt(y.split('-')[0].replace(/[^\d]/g, ''), 10);
        return start >= 2031 && start <= 2040;
      });
    }
    if (selectedDecade === '2041-2050') {
      return academicYears.filter(y => {
        const start = parseInt(y.split('-')[0].replace(/[^\d]/g, ''), 10);
        return start >= 2041 && start <= 2050;
      });
    }
    return academicYears;
  }, [academicYears, selectedDecade]);

  // Data statistics for selected academic year
  const yearScores = useMemo(() => {
    return scores.filter(s => s.academicYear === selectedAcademicYear);
  }, [scores, selectedAcademicYear]);

  const yearTransfers = useMemo(() => {
    return transfers.filter(t => t.academicYear === selectedAcademicYear);
  }, [transfers, selectedAcademicYear]);

  const yearStudents = useMemo(() => {
    // If students have academicYear assigned, match it; otherwise if it's the official active year, count active students
    const directMatch = students.filter(s => s.academicYear === selectedAcademicYear);
    if (directMatch.length > 0) return directMatch;
    if (isOfficialCurrent) return students;
    return [];
  }, [students, selectedAcademicYear, isOfficialCurrent]);

  const yearClassrooms = useMemo(() => {
    const directMatch = classrooms.filter(c => c.academicYear === selectedAcademicYear);
    if (directMatch.length > 0) return directMatch;
    if (isOfficialCurrent) return classrooms;
    return [];
  }, [classrooms, selectedAcademicYear, isOfficialCurrent]);

  // Determine year category: Past / Current / Future
  const yearStatusCategory = useMemo(() => {
    // Extract latin year for numerical comparison
    const rawStartYearStr = selectedAcademicYear.split('-')[0] || '';
    // Map khmer numerals to latin if needed
    const khmerToLatinMap: Record<string, string> = {
      '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
      '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
    };
    const latinStart = parseInt(
      rawStartYearStr.replace(/[០-៩]/g, d => khmerToLatinMap[d] || d).replace(/[^\d]/g, ''),
      10
    );
    const nowYear = new Date().getFullYear();

    if (isOfficialCurrent) {
      return { label: 'ឆ្នាំសិក្សាសកម្មបច្ចុប្បន្ន', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
    }
    if (latinStart < nowYear) {
      return { label: 'ទិន្នន័យបណ្ណសារប្រចាំឆ្នាំ (Archive)', color: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
    }
    return { label: 'ឆ្នាំសិក្សាគ្រោងទុក (Future/Planning)', color: 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' };
  }, [selectedAcademicYear, isOfficialCurrent]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Title and Year Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold font-moul text-slate-900 dark:text-white">
                ផ្ទាំងជ្រើសរើសទិន្នន័យប្រចាំឆ្នាំសិក្សា (Academic Year Selector)
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${yearStatusCategory.color}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>{yearStatusCategory.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ជ្រើសរើសឆ្នាំសិក្សាពី <strong>២០១៦-២០១៧</strong> ដល់ <strong>២០៥០-២០៥១</strong> សម្រាប់ត្រួតពិនិត្យ គ្រប់គ្រង និងបូកសរុបទិន្នន័យសាលា
            </p>
          </div>
        </div>

        {/* Action button to make selected year official if different */}
        <div className="flex items-center gap-2 shrink-0">
          {!isOfficialCurrent ? (
            <button
              id="set-official-year-btn"
              onClick={handleSaveAsOfficialSchoolYear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>កំណត់ជាឆ្នាំសិក្សាផ្លូវការ</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ឆ្នាំសិក្សាផ្លូវការសកម្ម</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Selector & Navigation Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
        {/* Step Prev Year */}
        <div className="lg:col-span-2">
          <button
            onClick={handlePrevYear}
            disabled={currentIndex <= 0}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
            title="ថយក្រោយ ១ ឆ្នាំសិក្សា"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>‹ ឆ្នាំមុន</span>
          </button>
        </div>

        {/* Year Dropdown Selector */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              id="director-academic-year-select"
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border-2 border-blue-500/50 dark:border-blue-500/60 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow-sm transition-all cursor-pointer font-kantumruy"
            >
              {academicYears.map((yr) => {
                const isCur = yr === schoolProfile.academicYear;
                return (
                  <option key={yr} value={yr} className="py-1">
                    {isCur ? `★ ឆ្នាំសិក្សា ${yr} (ផ្លូវការបច្ចុប្បន្ន)` : `ឆ្នាំសិក្សា ${yr}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Jump to Official Current Year */}
          {!isOfficialCurrent && (
            <button
              onClick={handleSetCurrentOfficial}
              className="shrink-0 whitespace-nowrap px-3 py-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors shadow-sm"
              title="ត្រឡប់ទៅឆ្នាំសិក្សាផ្លូវការបច្ចុប្បន្ន"
            >
              ឆ្នាំបច្ចុប្បន្ន
            </button>
          )}
        </div>

        {/* Step Next Year */}
        <div className="lg:col-span-2">
          <button
            onClick={handleNextYear}
            disabled={currentIndex >= academicYears.length - 1}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
            title="ទៅមុខ ១ ឆ្នាំសិក្សា"
          >
            <span>ឆ្នាំបន្ទាប់ ›</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Print / Export Report Shortcut */}
        <div className="lg:col-span-2">
          <button
            onClick={() => setActiveTab('reports_qr')}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>របាយការណ៍ MoEYS</span>
          </button>
        </div>
      </div>

      {/* Decade Quick Filter Tabs (2016-2020, 2021-2025, 2026-2030, 2031-2040, 2041-2050) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>ផ្លូវកាត់ជ្រើសរើសតាមទសវត្សរ៍ និងដំណាក់កាលឆ្នាំ (Quick Decade Filters) ៖</span>
          </span>
          <span className="text-[11px] text-slate-400">
            សរុប {academicYears.length} ឆ្នាំសិក្សា (២០១៦ ដល់ ២០៥០)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedDecade('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDecade === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ទាំងអស់ ({academicYears.length})
          </button>
          <button
            onClick={() => setSelectedDecade('2016-2020')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDecade === '2016-2020'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ២០១៦ - ២០២០
          </button>
          <button
            onClick={() => setSelectedDecade('2021-2025')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDecade === '2021-2025'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ២០២១ - ២០២៥
          </button>
          <button
            onClick={() => setSelectedDecade('2026-2030')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDecade === '2026-2030'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ២០២៦ - ២០៣០
          </button>
          <button
            onClick={() => setSelectedDecade('2031-2040')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDecade === '2031-2040'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ២០៣១ - ២០៤០
          </button>
          <button
            onClick={() => setSelectedDecade('2041-2050')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDecade === '2041-2050'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ២០៤១ - ២០៥០
          </button>
        </div>

        {/* Filtered Year Chips Carousel */}
        {selectedDecade !== 'all' && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {filteredYears.map(yr => {
              const isSelected = yr === selectedAcademicYear;
              const isCur = yr === schoolProfile.academicYear;
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedAcademicYear(yr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : isCur
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isCur && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  <span>{yr}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Year Dynamic Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Year Students */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
            <span>សិស្សក្នុងឆ្នាំសិក្សា</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {yearStudents.length > 0 ? yearStudents.length : students.length} <span className="text-xs font-normal text-slate-500">នាក់</span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 truncate">
            ស្រី: {yearStudents.length > 0 ? yearStudents.filter(s => s.gender === 'F').length : students.filter(s => s.gender === 'F').length} នាក់
          </p>
        </div>

        {/* Year Scores */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
            <span>កំណត់ត្រាពិន្ទុ</span>
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {yearScores.length > 0 ? yearScores.length : scores.length} <span className="text-xs font-normal text-slate-500">កំណត់ត្រា</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {yearScores.length > 0 ? `ទិន្នន័យឆ្នាំ ${selectedAcademicYear}` : 'ទិន្នន័យពិន្ទុសរុប'}
          </p>
        </div>

        {/* Year Classrooms */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
            <span>បន្ទប់ថ្នាក់រៀន</span>
            <School className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {yearClassrooms.length > 0 ? yearClassrooms.length : classrooms.length} <span className="text-xs font-normal text-slate-500">បន្ទប់</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 truncate">
            ថ្នាក់ទី១ ដល់ ទី៦
          </p>
        </div>

        {/* Year Transfers */}
        <div className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
            <span>លិខិតផ្ទេរសិស្ស</span>
            <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {yearTransfers.length} <span className="text-xs font-normal text-slate-500">ករណី</span>
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 truncate">
            ផ្ទេរចូល/ចេញឆ្នាំ {selectedAcademicYear}
          </p>
        </div>
      </div>
    </div>
  );
};
