import React, { useState } from 'react';
import { Student, StudentScoreRecord, ExamSubject, Teacher, SchoolProfile } from '../types';
import {
  Printer,
  X,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  Sliders,
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  AngkorWatSilhouette,
  AngkorPageWatermark,
  MoEYSRoyalHeader,
  SchoolOfficialStamp
} from './AngkorMotif';

interface ScoreTablePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: number;
  selectedSection: string;
  selectedMonth: string;
  selectedAcademicYear: string;
  classStudents: Student[];
  scores: StudentScoreRecord[];
  examSubjects: ExamSubject[];
  homeroomTeacher?: Teacher;
  schoolProfile: SchoolProfile;
  gradingScaleType: 'khmer_term' | 'letter';
  getFormattedGrade: (avg: number, letter?: string) => string;
  onSelectMonth?: (month: string) => void;
  onSelectGrade?: (grade: number) => void;
  onSelectSection?: (section: string) => void;
}

export const ScoreTablePrintModal: React.FC<ScoreTablePrintModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  selectedSection,
  selectedMonth,
  selectedAcademicYear,
  classStudents,
  scores,
  examSubjects,
  homeroomTeacher,
  schoolProfile,
  gradingScaleType,
  getFormattedGrade,
  onSelectMonth,
  onSelectGrade,
  onSelectSection
}) => {
  // Print Customization Options
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [showHeaderEmblem, setShowHeaderEmblem] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showStatsSummary, setShowStatsSummary] = useState<boolean>(true);
  const [showOfficialStamp, setShowOfficialStamp] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [showRemarksColumn, setShowRemarksColumn] = useState<boolean>(true);
  const [compactFont, setCompactFont] = useState<boolean>(classStudents.length > 30);
  const [customTitle, setCustomTitle] = useState<string>('');

  if (!isOpen) return null;

  // Filter current active scores for this grade, section, month, academic year
  const activeScores = scores.filter(
    s =>
      s.grade === selectedGrade &&
      s.section === selectedSection &&
      s.monthOrSemester === selectedMonth &&
      (!s.academicYear || s.academicYear === selectedAcademicYear)
  );

  const getStudentScore = (studentId: string): StudentScoreRecord | undefined => {
    return activeScores.find(s => s.studentId === studentId);
  };

  // Sort students by Rank if available, otherwise alphabetically
  const sortedStudents = [...classStudents].sort((a, b) => {
    const scoreA = getStudentScore(a.id);
    const scoreB = getStudentScore(b.id);
    if (scoreA?.rank && scoreB?.rank) {
      return scoreA.rank - scoreB.rank;
    }
    return a.nameKhmer.localeCompare(b.nameKhmer, 'km');
  });

  const femaleStudents = classStudents.filter(s => s.gender === 'F');
  const maleStudents = classStudents.filter(s => s.gender === 'M');

  // Compute Statistics
  const enteredScoreRecords = activeScores.filter(s => s.averageScore > 0);
  const passedStudents = enteredScoreRecords.filter(s => s.averageScore >= 5.0);
  const failedStudents = enteredScoreRecords.filter(s => s.averageScore < 5.0);

  const femaleEntered = enteredScoreRecords.filter(s => {
    const stu = classStudents.find(cs => cs.id === s.studentId);
    return stu?.gender === 'F';
  });
  const femalePassed = femaleEntered.filter(s => s.averageScore >= 5.0);
  const femaleFailed = femaleEntered.filter(s => s.averageScore < 5.0);

  // Grade distributions
  const gradeACount = enteredScoreRecords.filter(s => s.gradeLetter === 'A').length;
  const gradeBCount = enteredScoreRecords.filter(s => s.gradeLetter === 'B').length;
  const gradeCCount = enteredScoreRecords.filter(s => s.gradeLetter === 'C').length;
  const gradeDCount = enteredScoreRecords.filter(s => s.gradeLetter === 'D').length;
  const gradeECount = enteredScoreRecords.filter(s => s.gradeLetter === 'E').length;
  const gradeFCount = enteredScoreRecords.filter(s => s.gradeLetter === 'F').length;

  const highestScore = enteredScoreRecords.length > 0
    ? Math.max(...enteredScoreRecords.map(s => s.averageScore))
    : 0;
  const lowestScore = enteredScoreRecords.length > 0
    ? Math.min(...enteredScoreRecords.map(s => s.averageScore))
    : 0;
  const averageClassScore = enteredScoreRecords.length > 0
    ? (enteredScoreRecords.reduce((acc, curr) => acc + curr.averageScore, 0) / enteredScoreRecords.length).toFixed(2)
    : '0.00';

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'ល.រ,អត្តលេខ,គោត្តនាម-នាម,ភេទ,ខ្មែរ(អំណាន),ខ្មែរ(សំណេរ),គណិតវិទ្យា,វិទ្យាសាស្ត្រ-សង្គម,សីលធម៌-ពលរដ្ឋ,សិល្បៈ-កាយវិការ';
    
    // Additional subjects
    const dynamicSubs = examSubjects.filter(sub => !['khmerReading', 'khmerWriting', 'mathematics', 'scienceSocial', 'moralCivics', 'artsPhysical'].includes(sub.code));
    dynamicSubs.forEach(sub => {
      csv += `,${sub.nameKhmer}`;
    });

    csv += ',ពិន្ទុសរុប,មធ្យមភាគ,ចំណាត់ថ្នាក់,និទ្ទេស,ការកត់សម្គាល់\n';

    sortedStudents.forEach((stu, idx) => {
      const rec = getStudentScore(stu.id);
      let row = `${idx + 1},${stu.code},"${stu.nameKhmer}",${stu.gender === 'F' ? 'ស្រី' : 'ប្រុស'},${rec?.scores.khmerReading ?? '-'},${rec?.scores.khmerWriting ?? '-'},${rec?.scores.mathematics ?? '-'},${rec?.scores.scienceSocial ?? '-'},${rec?.scores.moralCivics ?? '-'},${rec?.scores.artsPhysical ?? '-'}`;
      
      dynamicSubs.forEach(sub => {
        row += `,${rec?.scores[sub.code] ?? '-'}`;
      });

      row += `,${rec?.totalScore ?? '-'},${rec?.averageScore ?? '-'},${rec?.rank ?? '-'},"${rec ? getFormattedGrade(rec.averageScore, rec.gradeLetter) : '-'}",${rec?.remarks ? `"${rec.remarks}"` : ''}\n`;
      csv += row;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `តារាងពិន្ទុ_ថ្នាក់ទី${selectedGrade}${selectedSection}_ខែ${selectedMonth}_${selectedAcademicYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentDateFormatted = new Date().toLocaleDateString('km-KH');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-[1320px] w-full max-h-[96vh] flex flex-col overflow-hidden print:max-h-none print:h-auto print:max-w-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Controls Toolbar (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-moul leading-tight text-white flex items-center gap-2">
                <span>ទម្រង់បោះពុម្ពតារាងស្រង់ពិន្ទុផ្លូវការ MoEYS</span>
                <span className="bg-blue-600 text-white text-[11px] px-2 py-0.5 rounded-full font-battambang font-bold">
                  ថ្នាក់ទី {selectedGrade}{selectedSection}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-battambang">
                ប្រចាំខែ {selectedMonth} • ឆ្នាំសិក្សា {selectedAcademicYear} • សិស្សសរុប {classStudents.length} នាក់
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Paper Orientation Selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  orientation === 'landscape' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 ផ្តេក (Landscape)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  orientation === 'portrait' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 បញ្ឈរ (Portrait)
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-colors"
              title="ទាញយកជា Excel (.csv)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ទាញយក Excel</span>
            </button>

            <button
              type="button"
              id="confirm-print-scores-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print Now)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Bar for Print Customization (Hidden on Print) */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-4 text-slate-700 font-medium font-battambang">
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              ជម្រើសបង្ហាញ៖
            </span>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHeaderEmblem}
                onChange={e => setShowHeaderEmblem(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>ក្បាលលិខិតជាតិ (Royal Header)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={e => setShowWatermark(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>រូបសញ្ញាប្រាសាទអង្គរវត្ត (Watermark)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showStatsSummary}
                onChange={e => setShowStatsSummary(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>តារាងស្ថិតិសង្ខេប (Class Summary)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOfficialStamp}
                onChange={e => setShowOfficialStamp(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>ត្រាក្រហមមូល MoEYS</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={e => setShowSignatures(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>ហត្ថលេខានាយិកា & គ្រូ</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showRemarksColumn}
                onChange={e => setShowRemarksColumn(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>ជួរឈរផ្សេងៗ</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={compactFont}
                onChange={e => setCompactFont(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>អក្សរតូចល្មម (Compact Font)</span>
            </label>
          </div>
        </div>

        {/* Printable Score Table Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 print:p-0 print:bg-white print:overflow-visible">
          <div
            className={`bg-white mx-auto p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm relative print:border-none print:shadow-none print:p-2 print:m-0 print:w-full ${
              orientation === 'landscape' ? 'max-w-[1240px] print-landscape-mode' : 'max-w-[900px]'
            }`}
          >
            {/* Optional Angkor Watermark */}
            {showWatermark && <AngkorPageWatermark opacity={0.035} />}

            {/* Official Ministry & Royal Kingdom Header */}
            <div className="relative z-1 mb-4 pb-3 border-b-2 border-slate-800">
              <div className="flex justify-between items-start text-xs font-battambang">
                {/* Left: Administrative School Hierarchy */}
                <div className="space-y-0.5 text-slate-800">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-semibold text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                  <p className="font-semibold text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                  <p className="font-bold text-blue-950 font-moul text-sm sm:text-base pt-0.5">
                    {schoolProfile.nameKhmer}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    កូដសាលា៖ <span className="font-bold">{schoolProfile.schoolCode}</span>
                  </p>
                </div>

                {/* Center / Right: Royal Header & Emblem */}
                {showHeaderEmblem ? (
                  <div className="text-center">
                    <MoEYSRoyalHeader subTitle="ស្តង់ដារសាលាបឋមសិក្សាគំរូ" />
                  </div>
                ) : (
                  <div className="text-right text-xs space-y-1">
                    <p className="font-bold font-moul text-blue-950">{schoolProfile.nameKhmer}</p>
                    <p className="text-slate-600">ឆ្នាំសិក្សា៖ {selectedAcademicYear}</p>
                  </div>
                )}

                {/* Right: Academic Metadata */}
                <div className="text-right text-xs space-y-0.5 text-slate-800">
                  <p className="font-bold text-slate-900 font-moul">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p className="font-bold text-xs text-slate-700">
                    ឆ្នាំសិក្សា៖ <span className="font-bold text-slate-900">{selectedAcademicYear}</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    កាលបរិច្ឆេទស្រង់៖ <span className="font-semibold">{currentDateFormatted}</span>
                  </p>
                </div>
              </div>

              {/* Main Document Title */}
              <div className="text-center mt-4 mb-2 space-y-1">
                <h1 className="font-moul text-base sm:text-lg text-slate-950 tracking-wide">
                  {customTitle || `តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ ${selectedMonth}`}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-800 font-battambang font-medium">
                  <span>
                    កម្រិតថ្នាក់៖ <strong className="font-bold text-blue-950 font-moul text-xs">ថ្នាក់ទី {selectedGrade}{selectedSection}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    គ្រូបន្ទុកថ្នាក់៖ <strong className="font-bold text-slate-900">{homeroomTeacher?.nameKhmer || 'មិនទាន់ចាត់តាំង'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    សិស្សសរុប៖ <strong className="font-bold text-slate-900">{classStudents.length}</strong> នាក់ (ស្រី <strong className="font-bold text-rose-700">{femaleStudents.length}</strong> នាក់)
                  </span>
                  <span>•</span>
                  <span>
                    ប្រព័ន្ធនិទ្ទេស៖ <strong className="font-bold text-slate-900">{gradingScaleType === 'khmer_term' ? 'ខ្មែរ (ល្អណាស់, ល្អ...)' : 'អក្សរ (A, B, C...)'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Official Primary School Score Matrix Table */}
            <div className="relative z-1 overflow-x-auto print:overflow-visible">
              <table className={`w-full text-center border-collapse border border-slate-900 text-slate-950 font-battambang ${
                compactFont ? 'text-[10px] leading-tight' : 'text-xs'
              }`}>
                <thead>
                  <tr className="bg-slate-200 text-slate-950 font-bold border-b border-slate-900">
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1 w-8 text-center font-bold">
                      ល.រ
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1.5 w-16 text-center font-bold font-mono">
                      អត្តលេខ
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-2.5 text-left min-w-[130px] font-bold">
                      គោត្តនាម និងនាម
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1 w-8 text-center font-bold">
                      ភេទ
                    </th>
                    <th colSpan={2} className="border border-slate-800 py-1 px-1 text-center font-bold bg-blue-100/70">
                      ភាសាខ្មែរ
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1 text-center font-bold bg-indigo-100/70">
                      គណិត<br/>វិទ្យា
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1 text-center font-bold bg-amber-100/70">
                      វិទ្យាសាស្ត្រ<br/>&សង្គម
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1 text-center font-bold bg-emerald-100/70">
                      សីលធម៌<br/>&ពលរដ្ឋ
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1 text-center font-bold bg-purple-100/70">
                      សិល្បៈ<br/>&កាយវិការ
                    </th>

                    {/* Dynamic exam subjects */}
                    {examSubjects.filter(sub => !['khmerReading', 'khmerWriting', 'mathematics', 'scienceSocial', 'moralCivics', 'artsPhysical'].includes(sub.code)).map(sub => (
                      <th key={sub.id || sub.code} rowSpan={2} className="border border-slate-800 py-2 px-1 text-center font-bold bg-slate-100">
                        {sub.nameKhmer}
                      </th>
                    ))}

                    <th rowSpan={2} className="border border-slate-800 py-2 px-1.5 font-bold bg-slate-200 text-slate-950 font-moul text-[11px]">
                      សរុប
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1.5 font-bold bg-blue-100 text-blue-950 font-moul text-[11px]">
                      ម.ភាគ
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1.5 font-bold bg-amber-200 text-amber-950 font-moul text-[11px]">
                      ចំណាត់<br/>ថ្នាក់
                    </th>
                    <th rowSpan={2} className="border border-slate-800 py-2 px-1.5 font-bold bg-slate-100 text-slate-950 font-bold">
                      និទ្ទេស
                    </th>
                    {showRemarksColumn && (
                      <th rowSpan={2} className="border border-slate-800 py-2 px-2 text-center font-bold min-w-[90px]">
                        ផ្សេងៗ
                      </th>
                    )}
                  </tr>
                  <tr className="bg-blue-50/80 text-slate-950 text-[10.5px] font-bold border-b border-slate-900">
                    <th className="border border-slate-800 py-1 px-1 text-center">អំណាន</th>
                    <th className="border border-slate-800 py-1 px-1 text-center">សំណេរ</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.length > 0 ? (
                    sortedStudents.map((student, idx) => {
                      const scoreRec = getStudentScore(student.id);
                      const isTopRank = scoreRec && scoreRec.rank <= 3;
                      return (
                        <tr
                          key={student.id}
                          className={`border-b border-slate-700 transition-colors ${
                            idx % 2 === 1 ? 'bg-slate-50/70 print:bg-white' : 'bg-white'
                          } ${scoreRec?.averageScore && scoreRec.averageScore < 5.0 ? 'bg-rose-50/40 print:bg-white' : ''}`}
                        >
                          <td className="border border-slate-800 py-1 px-1 font-semibold text-slate-700">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-mono text-slate-800 text-[10.5px]">
                            {student.code}
                          </td>
                          <td className="border border-slate-800 py-1 px-2 text-left font-bold text-slate-950 whitespace-nowrap">
                            {student.nameKhmer}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-semibold">
                            <span className={student.gender === 'F' ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                              {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                            </span>
                          </td>

                          {/* 6 MoEYS Standard Subject Scores */}
                          <td className="border border-slate-800 py-1 px-1 font-mono text-slate-900">
                            {scoreRec ? scoreRec.scores.khmerReading : '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-mono text-slate-900">
                            {scoreRec ? scoreRec.scores.khmerWriting : '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-mono font-bold text-indigo-900">
                            {scoreRec ? scoreRec.scores.mathematics : '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-mono text-slate-900">
                            {scoreRec ? scoreRec.scores.scienceSocial : '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-mono text-slate-900">
                            {scoreRec ? scoreRec.scores.moralCivics : '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-mono text-slate-900">
                            {scoreRec ? scoreRec.scores.artsPhysical : '-'}
                          </td>

                          {/* Dynamic extra subjects */}
                          {examSubjects.filter(sub => !['khmerReading', 'khmerWriting', 'mathematics', 'scienceSocial', 'moralCivics', 'artsPhysical'].includes(sub.code)).map(sub => (
                            <td key={sub.id || sub.code} className="border border-slate-800 py-1 px-1 font-mono text-slate-900">
                              {scoreRec && scoreRec.scores[sub.code] !== undefined ? scoreRec.scores[sub.code] : '-'}
                            </td>
                          ))}

                          {/* Total Score */}
                          <td className="border border-slate-800 py-1 px-1.5 font-mono font-bold text-slate-950 bg-slate-100/50">
                            {scoreRec ? scoreRec.totalScore : '-'}
                          </td>

                          {/* Average Score */}
                          <td className={`border border-slate-800 py-1 px-1.5 font-mono font-bold ${
                            scoreRec && scoreRec.averageScore >= 5.0 ? 'text-blue-900' : 'text-rose-700'
                          }`}>
                            {scoreRec ? scoreRec.averageScore.toFixed(2) : '-'}
                          </td>

                          {/* Rank */}
                          <td className="border border-slate-800 py-1 px-1 font-bold">
                            {scoreRec?.rank ? (
                              <span className={`inline-block px-1.5 py-0.2 rounded font-bold ${
                                scoreRec.rank === 1
                                  ? 'bg-amber-400 text-amber-950 font-moul print:border print:border-amber-600'
                                  : scoreRec.rank === 2
                                  ? 'bg-slate-300 text-slate-900'
                                  : scoreRec.rank === 3
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'text-slate-800'
                              }`}>
                                {scoreRec.rank}
                              </span>
                            ) : '-'}
                          </td>

                          {/* Grade Letter or Khmer Term */}
                          <td className="border border-slate-800 py-1 px-1 font-bold">
                            {scoreRec ? (
                              <span className={`font-bold ${
                                scoreRec.gradeLetter === 'A' || scoreRec.gradeLetter === 'B'
                                  ? 'text-emerald-800'
                                  : scoreRec.gradeLetter === 'C'
                                  ? 'text-blue-800'
                                  : scoreRec.gradeLetter === 'D' || scoreRec.gradeLetter === 'E'
                                  ? 'text-amber-800'
                                  : 'text-rose-700'
                              }`}>
                                {getFormattedGrade(scoreRec.averageScore, scoreRec.gradeLetter)}
                              </span>
                            ) : '-'}
                          </td>

                          {/* Remarks */}
                          {showRemarksColumn && (
                            <td className="border border-slate-800 py-1 px-1.5 text-left text-[10px] text-slate-700 truncate max-w-[120px]">
                              {scoreRec?.remarks || ''}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={15} className="py-6 text-center text-slate-500 font-battambang">
                        មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់ទី {selectedGrade}{selectedSection} ទេ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Class Statistics Summary Box */}
            {showStatsSummary && (
              <div className="relative z-1 mt-4 pt-2 border-t border-slate-300 text-xs font-battambang">
                <h4 className="font-bold text-slate-900 text-xs font-moul mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  តារាងស្ថិតិ និងបំណែងចែកលទ្ធផលសិក្សារួម
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Table 1: Pass/Fail Breakdown */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-center border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800">
                          <th className="py-1 px-2 border-r border-slate-800 text-left">លទ្ធផលរួម</th>
                          <th className="py-1 px-2 border-r border-slate-800">សរុប</th>
                          <th className="py-1 px-2 border-r border-slate-800">ស្រី</th>
                          <th className="py-1 px-2">ភាគរយ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        <tr>
                          <td className="py-1 px-2 text-left font-bold text-slate-900 border-r border-slate-800">
                            សិស្សសរុបក្នុងបញ្ជី
                          </td>
                          <td className="py-1 px-2 font-bold font-mono border-r border-slate-800">{classStudents.length}</td>
                          <td className="py-1 px-2 font-bold font-mono text-rose-700 border-r border-slate-800">{femaleStudents.length}</td>
                          <td className="py-1 px-2 font-mono">100%</td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-left font-bold text-emerald-800 border-r border-slate-800">
                            សិស្សជាប់ (ម.ភាគ &ge; ៥.០០)
                          </td>
                          <td className="py-1 px-2 font-bold font-mono text-emerald-800 border-r border-slate-800">{passedStudents.length}</td>
                          <td className="py-1 px-2 font-bold font-mono text-emerald-800 border-r border-slate-800">{femalePassed.length}</td>
                          <td className="py-1 px-2 font-mono font-bold text-emerald-800">
                            {classStudents.length > 0 ? ((passedStudents.length / classStudents.length) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-left font-bold text-rose-700 border-r border-slate-800">
                            សិស្សធ្លាក់ (ម.ភាគ &lt; ៥.០០)
                          </td>
                          <td className="py-1 px-2 font-bold font-mono text-rose-700 border-r border-slate-800">{failedStudents.length}</td>
                          <td className="py-1 px-2 font-bold font-mono text-rose-700 border-r border-slate-800">{femaleFailed.length}</td>
                          <td className="py-1 px-2 font-mono font-bold text-rose-700">
                            {classStudents.length > 0 ? ((failedStudents.length / classStudents.length) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table 2: Grade letter distribution */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-center border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-800">
                          <th className="py-1 px-1 border-r border-slate-800">និទ្ទេស A</th>
                          <th className="py-1 px-1 border-r border-slate-800">និទ្ទេស B</th>
                          <th className="py-1 px-1 border-r border-slate-800">និទ្ទេស C</th>
                          <th className="py-1 px-1 border-r border-slate-800">និទ្ទេស D</th>
                          <th className="py-1 px-1 border-r border-slate-800">និទ្ទេស E</th>
                          <th className="py-1 px-1">និទ្ទេស F</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="divide-x divide-slate-700 font-mono font-bold">
                          <td className="py-1 px-1 text-emerald-800">{gradeACount}</td>
                          <td className="py-1 px-1 text-blue-800">{gradeBCount}</td>
                          <td className="py-1 px-1 text-blue-700">{gradeCCount}</td>
                          <td className="py-1 px-1 text-amber-800">{gradeDCount}</td>
                          <td className="py-1 px-1 text-amber-700">{gradeECount}</td>
                          <td className="py-1 px-1 text-rose-700">{gradeFCount}</td>
                        </tr>
                        <tr className="divide-x divide-slate-700 bg-slate-100 text-[10px] text-slate-700">
                          <td className="py-0.5 px-1">ល្អណាស់</td>
                          <td className="py-0.5 px-1">ល្អ</td>
                          <td className="py-0.5 px-1">ល្អបង្គួរ</td>
                          <td className="py-0.5 px-1">មធ្យម</td>
                          <td className="py-0.5 px-1">ខ្សោយ</td>
                          <td className="py-0.5 px-1 text-rose-700">ធ្លាក់</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="bg-slate-50 p-1.5 text-[10.5px] flex items-center justify-around border-t border-slate-700 font-battambang">
                      <span>មធ្យមភាគរួមថ្នាក់៖ <strong className="font-mono font-bold text-blue-900">{averageClassScore}</strong></span>
                      <span>•</span>
                      <span>ពិន្ទុខ្ពស់បំផុត៖ <strong className="font-mono font-bold text-emerald-800">{highestScore.toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>ពិន្ទុទាបបំផុត៖ <strong className="font-mono font-bold text-rose-700">{lowestScore.toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Official Signatures & Round Red Seal */}
            {showSignatures && (
              <div className="relative z-1 mt-8 pt-4 border-t-2 border-slate-800 flex justify-between items-end text-xs font-battambang page-break-inside-avoid">
                {/* Left: School Director Approval & Stamp */}
                <div className="text-center relative min-w-[200px]">
                  <p className="font-semibold text-slate-800">បានឃើញ និងឯកភាព</p>
                  <p className="font-bold text-slate-900 font-moul mt-1 text-xs">
                    នាយិកាសាលាបឋមសិក្សា
                  </p>

                  <div className="h-20 flex items-center justify-center my-1 relative">
                    {showOfficialStamp && (
                      <div className="absolute -top-3">
                        <SchoolOfficialStamp
                          schoolName={schoolProfile.nameKhmer}
                          districtProvince={`${schoolProfile.district}, ${schoolProfile.province}`}
                          principalName=""
                        />
                      </div>
                    )}
                  </div>

                  <p className="font-bold font-moul text-blue-950 text-xs">
                    {schoolProfile.principalName}
                  </p>
                </div>

                {/* Right: Homeroom Teacher Certification */}
                <div className="text-center min-w-[200px]">
                  <p className="font-semibold text-slate-800">
                    {schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {selectedMonth} ឆ្នាំ {new Date().getFullYear()}
                  </p>
                  <p className="font-bold text-slate-900 font-moul mt-1 text-xs">
                    គ្រូបន្ទុកថ្នាក់
                  </p>
                  <div className="h-20" />
                  <p className="font-bold text-slate-900 text-xs">
                    {homeroomTeacher?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
