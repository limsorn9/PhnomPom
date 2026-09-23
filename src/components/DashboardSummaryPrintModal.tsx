import React, { useState, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Printer,
  X,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
  Sparkles,
  Sliders,
  RotateCcw,
  FileText,
  Users,
  GraduationCap,
  School,
  CircleDollarSign,
  HeartPulse,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  MoEYSOfficialDualSignatures,
  SchoolStampCirclePlaceholder,
  getKhmerLunarDate,
  getKhmerSolarDate,
  AngkorPageWatermark
} from './AngkorMotif';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';

interface DashboardSummaryPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSummaryPrintModal: React.FC<DashboardSummaryPrintModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    schoolProfile,
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    currentUser
  } = useSchool();

  const printContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Print display settings
  const [includeRoundStamp, setIncludeRoundStamp] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [redDirectorName, setRedDirectorName] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(true);

  if (!isOpen) return null;

  // Student Metrics
  const totalStudents = students.length;
  const femaleStudents = students.filter(s => s.gender === 'F').length;
  const maleStudents = students.filter(s => s.gender === 'M').length;
  const femalePercent = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0;

  // Teachers Metrics
  const totalTeachers = teachers.length;
  const femaleTeachers = teachers.filter(t => t.gender === 'F').length;
  const maleTeachers = totalTeachers - femaleTeachers;

  // Classrooms
  const totalClassrooms = classrooms.length > 0 ? classrooms.length : 6;
  const studentTeacherRatio = totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : '0';

  // Budget
  const totalIncomeRiel = getTotalIncome();
  const totalExpenseRiel = getTotalExpense();
  const balanceRiel = getBalance();
  const balanceUsd = Math.round(balanceRiel / 4050);

  // Grade Breakdown (1 to 6)
  const gradeData = [1, 2, 3, 4, 5, 6].map(gradeNum => {
    const gradeStudents = students.filter(s => s.grade === gradeNum);
    const fCount = gradeStudents.filter(s => s.gender === 'F').length;
    const mCount = gradeStudents.filter(s => s.gender === 'M').length;
    const total = gradeStudents.length;
    const percent = totalStudents > 0 ? ((total / totalStudents) * 100).toFixed(1) : '0';

    // Homeroom teacher for this grade
    const teacher = teachers.find(t => t.assignedGrade === gradeNum);

    return {
      grade: gradeNum,
      gradeLabel: `ថ្នាក់ទី ${gradeNum}`,
      male: mCount,
      female: fCount,
      total,
      percent,
      teacherName: teacher ? teacher.nameKhmer : 'មិនទាន់ចាត់តាំង'
    };
  });

  // Health / Nutrition Status
  const normalNutrition = students.filter(s => s.health?.nutritionStatus === 'normal').length;
  const underweightNutrition = students.filter(s => s.health?.nutritionStatus === 'underweight').length;
  const overweightNutrition = students.filter(s => s.health?.nutritionStatus === 'overweight').length;

  // Scores Performance
  const passedScores = scores.filter(sc => sc.resultStatus === 'ជាប់' || sc.averageScore >= 5).length;
  const passRate = scores.length > 0 ? Math.round((passedScores / scores.length) * 100) : 100;

  // Grade Letters Distribution
  const gradeADist = scores.filter(sc => sc.gradeLetter === 'A').length;
  const gradeBDist = scores.filter(sc => sc.gradeLetter === 'B').length;
  const gradeCDist = scores.filter(sc => sc.gradeLetter === 'C').length;
  const gradeDDist = scores.filter(sc => sc.gradeLetter === 'D').length;
  const gradeEDist = scores.filter(sc => sc.gradeLetter === 'E' || sc.gradeLetter === 'F').length;

  // Trigger Native Print with Isolated Iframe
  const handlePrint = async () => {
    await printElement('dashboard-summary-print-area', {
      landscape: false,
      pageTitle: `របាយការណ៍សង្ខេបស្ថិតិ_${schoolProfile.nameKhmer}_${schoolProfile.academicYear}`
    });
  };

  // Export PDF
  const handleDownloadPdf = async () => {
    if (!printContainerRef.current) return;
    setIsExportingPdf(true);
    try {
      await downloadElementAsPdf(
        'dashboard-summary-print-area',
        `របាយការណ៍សង្ខេបស្ថិតិសាលា_${schoolProfile.nameKhmer}.pdf`,
        {
          landscape: false,
          format: 'a4'
        }
      );
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-kantumruy text-white">
                បោះពុម្ពរបាយការណ៍សង្ខេបស្ថិតិសាលារៀន (Print Dashboard Summary)
              </h3>
              <p className="text-xs text-slate-300 font-sans">
                ទម្រង់បោះពុម្ពស្តង់ដារ A4 សម្រាប់គណៈគ្រប់គ្រង និងមន្ទីរអប់រំ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dash-print-download-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExportingPdf ? 'កំពុងទាញយក...' : 'ទាញយក PDF'}</span>
            </button>
            <button
              id="dash-print-now-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toggles Bar */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>ជម្រើសបោះពុម្ព:</span>
          </span>

          <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
            <input
              type="checkbox"
              checked={includeRoundStamp}
              onChange={e => setIncludeRoundStamp(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded"
            />
            <span>ត្រាមូលសាលា</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
            <input
              type="checkbox"
              checked={includeSignature}
              onChange={e => setIncludeSignature(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded"
            />
            <span>ហត្ថលេខានាយក</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
            <input
              type="checkbox"
              checked={redDirectorName}
              onChange={e => setRedDirectorName(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded"
            />
            <span>ឈ្មោះនាយកពណ៌ក្រហម</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
            <input
              type="checkbox"
              checked={includeWatermark}
              onChange={e => setIncludeWatermark(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded"
            />
            <span>Watermark អង្គរវត្ត</span>
          </label>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60 dark:bg-slate-950 flex justify-center">
          <div
            id="dashboard-summary-print-area"
            ref={printContainerRef}
            className="w-full max-w-[210mm] bg-white text-slate-900 p-8 sm:p-10 shadow-lg relative border border-slate-300 print:border-none print:shadow-none print:p-6 font-kantumruy"
            style={{ minHeight: '297mm' }}
          >
            {includeWatermark && <AngkorPageWatermark opacity={0.04} />}

            {/* Official Kingdom Header */}
            <div className="relative z-10 flex justify-between items-start mb-4 border-b pb-3 border-slate-300">
              <div className="text-left space-y-0.5 text-xs">
                <p className="font-moul text-slate-800 text-[12px]">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="font-kantumruy font-semibold text-slate-700 text-[11px]">
                  មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}
                </p>
                <p className="font-kantumruy text-slate-600 text-[10px]">
                  ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}
                </p>
                <p className="font-moul text-blue-900 text-[11px] pt-1">
                  {schoolProfile.nameKhmer}
                </p>
                <p className="font-mono text-[9px] text-slate-500">
                  កូដសាលា: {schoolProfile.schoolCode}
                </p>
              </div>

              <div className="text-center space-y-1">
                <p className="font-moul text-amber-900 text-xs tracking-wider">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </p>
                <p className="font-moul text-amber-900 text-[11px]">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </p>
                <div className="flex justify-center items-center gap-1 text-amber-700">
                  <span className="text-[10px]">༄༅</span>
                  <span className="w-12 h-0.5 bg-amber-600 inline-block"></span>
                  <span className="text-[10px]">༅༅</span>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="relative z-10 text-center my-4 space-y-1">
              <h1 className="text-base sm:text-lg font-bold font-moul text-slate-900 leading-snug">
                របាយការណ៍សង្ខេបស្ថិតិទូទៅ និងវឌ្ឍនភាពសាលារៀន
              </h1>
              <p className="text-xs font-serif text-slate-700 font-semibold">
                PRIMARY SCHOOL DASHBOARD SUMMARY REPORT
              </p>
              <p className="text-xs text-blue-800 font-semibold">
                ឆ្នាំសិក្សា {schoolProfile.academicYear} • កាលបរិច្ឆេទបង្កើត: {getKhmerSolarDate(new Date())}
              </p>
            </div>

            {/* 1. Key Statistics Highlights Table / Grid */}
            <div className="relative z-10 my-4">
              <h4 className="text-xs font-bold font-moul text-slate-800 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-700 inline-block"></span>
                <span>១. ស្ថិតិគន្លឹះទូទៅ (Key School Metrics Overview)</span>
              </h4>

              <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="block text-[10px] text-slate-500 font-semibold">សិស្សសរុប</span>
                  <strong className="text-sm text-blue-900 font-bold">{totalStudents} នាក់</strong>
                  <span className="block text-[10px] text-pink-700 font-medium">ស្រី {femaleStudents} នាក់ ({femalePercent}%)</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="block text-[10px] text-slate-500 font-semibold">បុគ្គលិក & គ្រូ</span>
                  <strong className="text-sm text-slate-900 font-bold">{totalTeachers} នាក់</strong>
                  <span className="block text-[10px] text-slate-600 font-medium">ស្រី {femaleTeachers} នាក់</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="block text-[10px] text-slate-500 font-semibold">បន្ទប់ & ថ្នាក់រៀន</span>
                  <strong className="text-sm text-indigo-900 font-bold">{totalClassrooms} ថ្នាក់</strong>
                  <span className="block text-[10px] text-slate-600 font-medium">សមាមាត្រ: {studentTeacherRatio} នាក់/គ្រូ</span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50">
                  <span className="block text-[10px] text-slate-500 font-semibold">សមតុល្យថវិកាសាលា</span>
                  <strong className="text-sm text-emerald-800 font-bold">
                    {balanceRiel.toLocaleString()} រៀល
                  </strong>
                  <span className="block text-[10px] text-emerald-600 font-medium">≈ ${balanceUsd.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            {/* 2. Enrollment Breakdown by Grade Table */}
            <div className="relative z-10 my-4">
              <h4 className="text-xs font-bold font-moul text-slate-800 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-700 inline-block"></span>
                <span>២. ស្ថិតិសិស្សតាមកម្រិតថ្នាក់ (Grade-Level Enrollment Table)</span>
              </h4>

              <table className="w-full text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold text-center">
                    <th className="border border-slate-400 py-1.5 px-2">កម្រិតថ្នាក់</th>
                    <th className="border border-slate-400 py-1.5 px-2">ប្រុស</th>
                    <th className="border border-slate-400 py-1.5 px-2">ស្រី</th>
                    <th className="border border-slate-400 py-1.5 px-2">សរុប</th>
                    <th className="border border-slate-400 py-1.5 px-2">ភាគរយ %</th>
                    <th className="border border-slate-400 py-1.5 px-2">គ្រូបន្ទុកថ្នាក់</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeData.map(item => (
                    <tr key={item.grade} className="text-center hover:bg-slate-50">
                      <td className="border border-slate-400 py-1 px-2 font-bold text-left pl-3">
                        {item.gradeLabel}
                      </td>
                      <td className="border border-slate-400 py-1 px-2">{item.male}</td>
                      <td className="border border-slate-400 py-1 px-2">{item.female}</td>
                      <td className="border border-slate-400 py-1 px-2 font-bold text-blue-900">
                        {item.total}
                      </td>
                      <td className="border border-slate-400 py-1 px-2">{item.percent}%</td>
                      <td className="border border-slate-400 py-1 px-2 text-left pl-2">
                        {item.teacherName}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-center">
                    <td className="border border-slate-400 py-1.5 px-2 font-moul text-left pl-3">
                      សរុបរួម
                    </td>
                    <td className="border border-slate-400 py-1.5 px-2">{maleStudents}</td>
                    <td className="border border-slate-400 py-1.5 px-2">{femaleStudents}</td>
                    <td className="border border-slate-400 py-1.5 px-2 text-blue-950 font-moul">
                      {totalStudents}
                    </td>
                    <td className="border border-slate-400 py-1.5 px-2">100%</td>
                    <td className="border border-slate-400 py-1.5 px-2 text-slate-500 italic">
                      សាលាបឋមសិក្សា
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Academic & Nutrition Status */}
            <div className="relative z-10 my-4 grid grid-cols-2 gap-4">
              {/* Academic Performance Distribution */}
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/50">
                <h4 className="text-[11px] font-bold font-moul text-slate-800 mb-1.5">
                  ៣. លទ្ធផលសិក្សា & និទ្ទេស
                </h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>អត្រាសិស្សប្រឡងជាប់:</span>
                    <strong className="text-emerald-700">{passRate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>និទ្ទេស A (ឆ្នើម):</span>
                    <strong>{gradeADist} នាក់</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>និទ្ទេស B (ល្អណាស់):</span>
                    <strong>{gradeBDist} នាក់</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>និទ្ទេស C (ល្អ):</span>
                    <strong>{gradeCDist} នាក់</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>និទ្ទេស D / E (មធ្យម):</span>
                    <strong>{gradeDDist + gradeEDist} នាក់</strong>
                  </div>
                </div>
              </div>

              {/* Health & Nutrition BMI */}
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/50">
                <h4 className="text-[11px] font-bold font-moul text-slate-800 mb-1.5">
                  ៤. សុខភាព & អាហារូបត្ថម្ភ (BMI)
                </h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>អាហារូបត្ថម្ភធម្មតា (Normal):</span>
                    <strong className="text-emerald-700">{normalNutrition} នាក់</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ខ្វះអាហារូបត្ថម្ភ/ស្គម (Underweight):</span>
                    <strong className="text-amber-700">{underweightNutrition} នាក់</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>លើសទម្ងន់ (Overweight):</span>
                    <strong className="text-rose-700">{overweightNutrition} នាក់</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-600">
                    <span>ការចាក់វ៉ាក់សាំងបង្ការ:</span>
                    <strong className="text-blue-800">១០០% បានចាក់គ្រប់</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Dual Signatures */}
            <div className="relative z-10 mt-6 pt-4">
              <MoEYSOfficialDualSignatures
                locationText={`${schoolProfile.district}, ថ្ងៃទី ${new Date().getDate()} ខែ ${new Date().getMonth() + 1} ឆ្នាំ ${new Date().getFullYear()}`}
                leftRoleTitle="បានឃើញ និងពិនិត្យត្រឹមត្រូវ"
                leftSignerRole="អ្នករៀបចំរបាយការណ៍ / លេខាធិការ"
                leftSignerName={currentUser?.nameKhmer || 'អ្នកគ្រូ ពេជ្រ ធីតា'}
                rightRoleTitle="បានឃើញ និងឯកភាព"
                rightSignerRole="នាយកសាលាបឋមសិក្សា"
                rightSignerName={schoolProfile.principalName}
                showRoundStamp={includeRoundStamp}
                showSignature={includeSignature}
                redDirectorName={redDirectorName}
                stampText={schoolProfile.nameKhmer}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
