import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, Teacher } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  QrCode,
  School,
  Award,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Eye,
  FileText,
  CreditCard,
  Building,
  Sparkles,
  Layers,
  ExternalLink,
  LogIn
} from 'lucide-react';

export const ReportsAndQR: React.FC = () => {
  const {
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    schoolProfile,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    showToast,
    switchUserRole,
    gradingScaleType,
    getFormattedGrade
  } = useSchool();

  const [activeReportType, setActiveReportType] = useState<
    'census' | 'score_sheet' | 'finance' | 'student_qr_cards' | 'staff_qr_cards'
  >('census');

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('ក');
  const [selectedMonth, setSelectedMonth] = useState<string>('មករា');
  const [cardsPerA4, setCardsPerA4] = useState<6 | 8 | 12>(8);

  // Filter students for active class
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  const activeScores = scores.filter(
    s =>
      s.grade === selectedGrade &&
      s.section === selectedSection &&
      s.monthOrSemester === selectedMonth
  );

  const handlePrint = () => {
    window.print();
  };

  // Helper for downloading CSV/Excel with UTF-8 BOM for Microsoft Excel compatibility
  const downloadExcelFile = (filename: string, csvContent: string) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`បានទាញយកឯកសារ Excel «${filename}.csv» ជោគជ័យ!`);
  };

  // Export 1: Census to Excel
  const exportCensusToExcel = () => {
    let csv = 'កម្រិតថ្នាក់,ចំនួនបន្ទប់,សិស្សសរុប,សិស្សស្រី,សិស្សប្រុស,គ្រូបន្ទុកថ្នាក់\n';
    [1, 2, 3, 4, 5, 6].forEach(g => {
      const gStudents = students.filter(s => s.grade === g);
      const femaleCount = gStudents.filter(s => s.gender === 'F').length;
      const maleCount = gStudents.length - femaleCount;
      const teacher = teachers.find(t => t.assignedGrade === g);
      csv += `ថ្នាក់ទី ${g},១,${gStudents.length},${femaleCount},${maleCount},"${teacher?.nameKhmer || 'មិនទាន់ចាត់តាំង'}"\n`;
    });
    csv += `សរុបរួម,៦,${students.length},${students.filter(s => s.gender === 'F').length},${students.filter(s => s.gender === 'M').length},-\n`;
    downloadExcelFile(`MoEYS_Census_Report_${schoolProfile.academicYear}`, csv);
  };

  // Export 2: Score Sheet to Excel
  const exportScoresToExcel = () => {
    let csv = 'ល.រ,អត្តលេខ,គោត្តនាម-នាម,ភេទ,ខ្មែរ(អំណាន),ខ្មែរ(សំណេរ),គណិតវិទ្យា,វិទ្យាសាស្ត្រ-សង្គម,សីលធម៌,សិល្បៈ-កីឡា,ពិន្ទុសរុប,មធ្យមភាគ,ចំណាត់ថ្នាក់,និទ្ទេស\n';
    classStudents.forEach((st, idx) => {
      const sc = activeScores.find(s => s.studentId === st.id);
      csv += `${idx + 1},${st.code},"${st.nameKhmer}",${st.gender === 'F' ? 'ស្រី' : 'ប្រុស'},${sc?.scores.khmerReading || 0},${sc?.scores.khmerWriting || 0},${sc?.scores.mathematics || 0},${sc?.scores.scienceSocial || 0},${sc?.scores.moralCivics || 0},${sc?.scores.artsPhysical || 0},${sc?.totalScore || 0},${sc?.averageScore || 0},${sc?.rank || '-'},"${getFormattedGrade(sc?.averageScore || 0, sc?.gradeLetter)}"\n`;
    });
    downloadExcelFile(`ScoreSheet_Grade${selectedGrade}${selectedSection}_${selectedMonth}_${schoolProfile.academicYear}`, csv);
  };

  // Export 3: Finance PB to Excel
  const exportFinanceToExcel = () => {
    let csv = 'កូដយោង,បរិយាយ,ប្រភេទ,ប្រភពថវិកា,ចំនួនទឹកប្រាក់(រៀល),កាលបរិច្ឆេទ\n';
    budgetTransactions.forEach(tx => {
      csv += `"${tx.referenceCode}","${tx.title}",${tx.type === 'income' ? 'ចំណូល' : 'ចំណាយ'},"${tx.source}",${tx.amountRiel},"${tx.date}"\n`;
    });
    downloadExcelFile(`MoEYS_Finance_PB_${schoolProfile.academicYear}`, csv);
  };

  // Export 4: Student List to Excel
  const exportStudentsToExcel = () => {
    let csv = 'ល.រ,អត្តលេខ,ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ,ថ្ងៃខែឆ្នាំកំណើត,ថ្នាក់,អាណាព្យាបាល,លេខទូរស័ព្ទ,អាសយដ្ឋាន\n';
    students.forEach((st, idx) => {
      csv += `${idx + 1},${st.code},"${st.nameKhmer}","${st.nameLatin}",${st.gender === 'F' ? 'ស្រី' : 'ប្រុស'},"${st.dob}",${st.grade}${st.section},"${st.guardianName}","${st.guardianPhone}","${st.address || ''}"\n`;
    });
    downloadExcelFile(`MoEYS_Student_Registry_${schoolProfile.academicYear}`, csv);
  };

  // Export 5: Teacher Staff to Excel
  const exportStaffToExcel = () => {
    let csv = 'ល.រ,អត្តលេខមន្ត្រី,ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ,មុខតំណែង,ថ្នាក់ទទួលបន្ទុក,លេខទូរស័ព្ទ,អ៊ីមែល\n';
    teachers.forEach((t, idx) => {
      csv += `${idx + 1},${t.staffCode},"${t.nameKhmer}","${t.nameLatin}",${t.gender === 'F' ? 'ស្រី' : 'ប្រុស'},"${t.role}",${t.assignedGrade ? 'ថ្នាក់ទី ' + t.assignedGrade : '-'},"${t.phone}","${t.email}"\n`;
    });
    downloadExcelFile(`MoEYS_Staff_Directory_${schoolProfile.academicYear}`, csv);
  };

  // Individual Card Download
  const handleDownloadCardImage = (name: string, code: string) => {
    showToast(`កំពុងរៀបចំទាញយកកាតសម្គាល់ «${name} (${code})»...`);
  };

  // Smart QR Login Simulation
  const handleSmartQRLogin = (st: Student) => {
    showToast(`ស្កេនជោគជ័យ! កំពុងចូលទៅកាន់គណនីសិស្ស «${st.nameKhmer}» (${st.code})`);
    switchUserRole('student');
  };

  // Generate SVG QR Code-like visual element
  const renderQRCodeVisual = (value: string, size = 64) => {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-white p-1 rounded-lg border border-slate-300 flex flex-col items-center justify-center shadow-xs shrink-0"
      >
        <QrCode className="w-full h-full text-slate-900" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Report Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-moul">
                ប្រព័ន្ធរបាយការណ៍ MoEYS & QR Code
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                ស្តង់ដារជាតិ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ទាញយកជា Excel, PDF និងបោះពុម្ពកាតសិស្ស-គ្រូជាសន្លឹក A4 ផ្លូវការសម្រាប់បញ្ជូនទៅកាន់ការិយាល័យអប់រំ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Universal Excel Export Action */}
            <button
              onClick={() => {
                if (activeReportType === 'census') exportCensusToExcel();
                else if (activeReportType === 'score_sheet') exportScoresToExcel();
                else if (activeReportType === 'finance') exportFinanceToExcel();
                else if (activeReportType === 'student_qr_cards') exportStudentsToExcel();
                else exportStaffToExcel();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>នាំចេញ Excel</span>
            </button>

            {/* Print / PDF Action */}
            <button
              id="print-report-btn"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព / ទាញយក PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveReportType('census')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportType === 'census'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ១. តារាងស្ថិតិសិស្សដើមឆ្នាំ (Census)
          </button>

          <button
            onClick={() => setActiveReportType('score_sheet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportType === 'score_sheet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ២. តារាងស្រង់ពិន្ទុប្រចាំខែ (Scores)
          </button>

          <button
            onClick={() => setActiveReportType('finance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportType === 'finance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ៣. របាយការណ៍ហិរញ្ញវត្ថុ (PB)
          </button>

          <button
            onClick={() => setActiveReportType('student_qr_cards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportType === 'student_qr_cards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ៤. កាតសិស្សជាមួយ QR Code
          </button>

          <button
            onClick={() => setActiveReportType('staff_qr_cards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportType === 'staff_qr_cards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ៥. ប័ណ្ណសម្គាល់បុគ្គលិក (Staff Badge)
          </button>
        </div>
      </div>

      {/* Official MoEYS Print Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md max-w-5xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Ministry & School Official Heading */}
        <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-6 mb-6">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-slate-800">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p className="text-slate-600">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
            <p className="text-slate-600">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
            <p className="font-bold text-blue-900 font-moul">{schoolProfile.nameKhmer}</p>
            <p className="text-[10px] text-slate-500 font-mono">កូដសាលា: {schoolProfile.schoolCode}</p>
          </div>

          <div className="text-right space-y-1">
            <p className="font-bold text-xs text-blue-950 font-moul">{schoolProfile.nameKhmer}</p>
            <p className="text-xs text-slate-600">ឆ្នាំសិក្សា៖ <span className="font-mono font-bold text-slate-800">{schoolProfile.academicYear}</span></p>
            <p className="text-[10px] text-slate-500">កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}</p>
          </div>
        </div>

        {/* 1. Census Report View */}
        {activeReportType === 'census' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-moul text-slate-900">
                តារាងស្ថិតិសិស្ស និងបុគ្គលិកដើមឆ្នាំសិក្សា {schoolProfile.academicYear}
              </h3>
              <p className="text-xs text-slate-500">
                បញ្ជីស្ថិតិរួមសម្រាប់បញ្ជូនទៅកាន់ការិយាល័យអប់រំ និងមន្ទីរអប់រំ
              </p>
            </div>

            {/* Census Table by Grade */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800">
                    <th className="border border-slate-300 py-2 px-3">កម្រិតថ្នាក់</th>
                    <th className="border border-slate-300 py-2 px-3">ចំនួនបន្ទប់</th>
                    <th className="border border-slate-300 py-2 px-3">សិស្សសរុប</th>
                    <th className="border border-slate-300 py-2 px-3">សិស្សស្រី</th>
                    <th className="border border-slate-300 py-2 px-3">សិស្សប្រុស</th>
                    <th className="border border-slate-300 py-2 px-3">គ្រូបន្ទុកថ្នាក់</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map(g => {
                    const gStudents = students.filter(s => s.grade === g);
                    const femaleCount = gStudents.filter(s => s.gender === 'F').length;
                    const maleCount = gStudents.length - femaleCount;
                    const teacher = teachers.find(t => t.assignedGrade === g);
                    return (
                      <tr key={g} className="hover:bg-slate-50">
                        <td className="border border-slate-300 py-2 px-3 font-bold">ថ្នាក់ទី {g}</td>
                        <td className="border border-slate-300 py-2 px-3">១</td>
                        <td className="border border-slate-300 py-2 px-3 font-mono font-bold text-blue-900">{gStudents.length}</td>
                        <td className="border border-slate-300 py-2 px-3 font-mono text-rose-700">{femaleCount}</td>
                        <td className="border border-slate-300 py-2 px-3 font-mono text-blue-700">{maleCount}</td>
                        <td className="border border-slate-300 py-2 px-3">{teacher?.nameKhmer || 'មិនទាន់ចាត់តាំង'}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-blue-50/60 font-bold">
                    <td className="border border-slate-300 py-2 px-3 font-moul text-blue-950">សរុបរួម</td>
                    <td className="border border-slate-300 py-2 px-3 font-mono">៦</td>
                    <td className="border border-slate-300 py-2 px-3 font-mono text-blue-900">{students.length}</td>
                    <td className="border border-slate-300 py-2 px-3 font-mono text-rose-700">{students.filter(s => s.gender === 'F').length}</td>
                    <td className="border border-slate-300 py-2 px-3 font-mono text-blue-700">{students.filter(s => s.gender === 'M').length}</td>
                    <td className="border border-slate-300 py-2 px-3">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Score Sheet Report View */}
        {activeReportType === 'score_sheet' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-moul text-slate-900">
                តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ {selectedMonth} ថ្នាក់ទី {selectedGrade}{selectedSection}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ឆ្នាំសិក្សា {schoolProfile.academicYear} • ប្រព័ន្ធនិទ្ទេស: {gradingScaleType === 'khmer_term' ? 'ខ្មែរ (ល្អណាស់, ល្អ, ល្អបង្គួរ...)' : 'អក្សរ (A, B, C, D, E)'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                    <th className="border border-slate-300 py-2 px-1">ល.រ</th>
                    <th className="border border-slate-300 py-2 px-2 text-left">ឈ្មោះសិស្ស</th>
                    <th className="border border-slate-300 py-2 px-1">ភេទ</th>
                    <th className="border border-slate-300 py-2 px-1">អំណាន</th>
                    <th className="border border-slate-300 py-2 px-1">សំណេរ</th>
                    <th className="border border-slate-300 py-2 px-1">គណិត</th>
                    <th className="border border-slate-300 py-2 px-1">វិទ្យាសាស្ត្រ</th>
                    <th className="border border-slate-300 py-2 px-1">សីលធម៌</th>
                    <th className="border border-slate-300 py-2 px-1">សិល្បៈ</th>
                    <th className="border border-slate-300 py-2 px-1 font-bold bg-slate-200">សរុប</th>
                    <th className="border border-slate-300 py-2 px-1 font-bold bg-blue-100">មធ្យមភាគ</th>
                    <th className="border border-slate-300 py-2 px-1 font-bold bg-amber-100">ចំណាត់ថ្នាក់</th>
                    <th className="border border-slate-300 py-2 px-1 font-bold">និទ្ទេស</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((st, idx) => {
                    const sc = activeScores.find(s => s.studentId === st.id);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 py-1.5 px-1 font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 py-1.5 px-2 text-left font-bold text-slate-900">{st.nameKhmer}</td>
                        <td className="border border-slate-300 py-1.5 px-1">{st.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono">{sc?.scores.khmerReading || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono">{sc?.scores.khmerWriting || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono font-bold text-blue-700">{sc?.scores.mathematics || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono">{sc?.scores.scienceSocial || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono">{sc?.scores.moralCivics || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono">{sc?.scores.artsPhysical || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono font-bold">{sc?.totalScore || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-mono font-bold text-blue-800">{sc?.averageScore || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-bold text-amber-900">{sc?.rank || '-'}</td>
                        <td className="border border-slate-300 py-1.5 px-1 font-bold">{getFormattedGrade(sc?.averageScore || 0, sc?.gradeLetter)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Finance Report View */}
        {activeReportType === 'finance' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-moul text-slate-900">
                របាយការណ៍តាមដានការអនុវត្តថវិកាកម្មវិធីរដ្ឋ (PB) និងមូលនិធិសាលា
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                គិតត្រឹមថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ២០២៤
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-300 p-3 rounded-lg bg-slate-50 text-center">
                <span className="text-slate-600 block">ចំណូលសរុប</span>
                <strong className="text-base text-emerald-800 font-mono">
                  {getTotalIncome().toLocaleString()} ៛
                </strong>
              </div>
              <div className="border border-slate-300 p-3 rounded-lg bg-slate-50 text-center">
                <span className="text-slate-600 block">ចំណាយសរុប</span>
                <strong className="text-base text-rose-800 font-mono">
                  {getTotalExpense().toLocaleString()} ៛
                </strong>
              </div>
              <div className="border border-slate-300 p-3 rounded-lg bg-slate-50 text-center">
                <span className="text-slate-600 block">សមតុល្យនៅសល់</span>
                <strong className="text-base text-blue-900 font-mono">
                  {getBalance().toLocaleString()} ៛
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800">
                    <th className="border border-slate-300 py-2 px-3">កូដយោង</th>
                    <th className="border border-slate-300 py-2 px-3">បរិយាយ</th>
                    <th className="border border-slate-300 py-2 px-3">ប្រភេទ</th>
                    <th className="border border-slate-300 py-2 px-3">ប្រភព</th>
                    <th className="border border-slate-300 py-2 px-3">ចំនួនទឹកប្រាក់ (រៀល)</th>
                    <th className="border border-slate-300 py-2 px-3">កាលបរិច្ឆេទ</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 py-1.5 px-3 font-mono">{tx.referenceCode}</td>
                      <td className="border border-slate-300 py-1.5 px-3 font-medium">{tx.title}</td>
                      <td className="border border-slate-300 py-1.5 px-3 font-bold">
                        {tx.type === 'income' ? 'ចំណូល' : 'ចំណាយ'}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-3">{tx.source}</td>
                      <td className="border border-slate-300 py-1.5 px-3 font-mono font-bold">
                        {tx.amountRiel.toLocaleString()} ៛
                      </td>
                      <td className="border border-slate-300 py-1.5 px-3">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Student QR Code Cards View with Batch A4 & Dimensions Config */}
        {activeReportType === 'student_qr_cards' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-moul text-slate-900">
                ប័ណ្ណសម្គាល់អត្តសញ្ញាណសិស្ស (Student ID Cards with QR Code)
              </h3>
              <p className="text-xs text-slate-500">
                ទម្រង់បោះពុម្ពកាតសិស្សស្ដង់ដារជាតិ ភ្ជាប់ QR Code សម្រាប់ពិនិត្យវត្តមាន និងព័ត៌មានសិស្ស
              </p>
            </div>

            {/* A4 Batch Layout Selector Toolbar */}
            <div className="no-print bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-700">ប្លង់បោះពុម្ពលើក្រដាស A4 (A4 Batch Layout):</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[6, 8, 12].map(num => (
                  <button
                    key={num}
                    onClick={() => setCardsPerA4(num as 6 | 8 | 12)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      cardsPerA4 === num
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} កាត / សន្លឹក A4
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid gap-4 ${
              cardsPerA4 === 6
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
                : cardsPerA4 === 8
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3'
            }`}>
              {students.map(st => (
                <div
                  key={st.id}
                  className="border-2 border-blue-900 rounded-2xl p-4 bg-gradient-to-br from-white via-blue-50/20 to-slate-50 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="border-b border-blue-200 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                        <School className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold font-moul text-blue-950">
                          {schoolProfile.nameKhmer}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase">
                          ប័ណ្ណសម្គាល់សិស្ស • Student Card
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                      {schoolProfile.academicYear}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="flex items-center gap-3 my-3 text-xs">
                    <img
                      src={st.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                      alt={st.nameKhmer}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-lg object-cover border border-slate-300 shadow-sm flex-shrink-0"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h5 className="font-bold text-xs font-moul text-slate-900 truncate">{st.nameKhmer}</h5>
                      <p className="text-[10px] font-semibold text-slate-600 truncate">{st.nameLatin}</p>
                      <div className="text-[9.5px] text-slate-600 pt-1 leading-tight">
                        <span className="block">
                          អត្តលេខ: <strong className="font-mono text-blue-900">{st.code}</strong>
                        </span>
                        <span className="block">
                          ថ្នាក់: <strong>ថ្នាក់ទី {st.grade}{st.section}</strong> • ភេទ: {st.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                        <span className="block">
                          ថ្ងៃកំណើត: {st.dob}
                        </span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                      {renderQRCodeVisual(st.code, 56)}
                      <span className="text-[8px] font-mono text-slate-500 mt-1">Smart QR</span>
                    </div>
                  </div>

                  {/* Card Footer & Action Buttons */}
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[9px] text-slate-500">
                    <span>ទូរស័ព្ទ: {st.guardianPhone}</span>
                    <span className="font-bold text-blue-950 font-moul">នាយិកាសាលា</span>
                  </div>

                  {/* Interactive Card Toolbar (no-print) */}
                  <div className="no-print mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSmartQRLogin(st)}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                      title="ស្កេនចូលគណនីសិស្សនេះភ្លាមៗ"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>ចូលគណនីសិស្ស</span>
                    </button>

                    <button
                      onClick={() => handleDownloadCardImage(st.nameKhmer, st.code)}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>ទាញយកកាត</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Staff QR Code Badges View */}
        {activeReportType === 'staff_qr_cards' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-moul text-slate-900">
                ប័ណ្ណសម្គាល់មន្ត្រីរាជការ និងបុគ្គលិកអប់រំ (Staff ID Cards)
              </h3>
              <p className="text-xs text-slate-500">
                ប័ណ្ណសម្គាល់ផ្លូវការរបស់លោកគ្រូ អ្នកគ្រូ និងគណៈគ្រប់គ្រងសាលា
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map(t => (
                <div
                  key={t.id}
                  className="border-2 border-indigo-900 rounded-2xl p-4 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="border-b border-indigo-200 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold font-moul text-indigo-950">
                          {schoolProfile.nameKhmer}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase">
                          ប័ណ្ណបុគ្គលិក • Official Staff ID
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                      ក្រសួងអប់រំ
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-3 text-xs">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                      alt={t.nameKhmer}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-lg object-cover border border-slate-300 shadow-sm flex-shrink-0"
                    />
                    <div className="space-y-0.5 flex-1">
                      <h5 className="font-bold text-sm font-moul text-slate-900">{t.nameKhmer}</h5>
                      <p className="text-[11px] font-semibold text-slate-600">{t.nameLatin}</p>
                      <div className="text-[10px] text-slate-600 pt-1">
                        <span className="block">
                          អត្តលេខ: <strong className="font-mono text-indigo-900">{t.staffCode}</strong>
                        </span>
                        <span className="block font-bold text-indigo-800">
                          មុខងារ: {t.role}
                        </span>
                        <span className="block">
                          ទូរស័ព្ទ: {t.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      {renderQRCodeVisual(t.staffCode, 56)}
                      <span className="text-[9px] font-mono text-slate-500 mt-1">Staff QR</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-1 flex justify-between items-center text-[9px] text-slate-500">
                    <span>{schoolProfile.district}, {schoolProfile.province}</span>
                    <span className="font-bold text-indigo-950 font-moul">ក្រសួងអប់រំ យុវជន និងកីឡា</span>
                  </div>

                  {/* Interactive Actions (no-print) */}
                  <div className="no-print mt-2 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDownloadCardImage(t.nameKhmer, t.staffCode)}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>ទាញយកកាតបុគ្គលិក</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Signature Footer */}
        <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-300 text-xs">
          <div className="text-center">
            <p>បានពិនិត្យ និងឯកភាព</p>
            <p className="font-bold text-slate-800 mt-1">ប្រធានការិយាល័យអប់រំ ក្រុង/ស្រុក</p>
            <div className="h-16" />
            <p className="text-slate-400">................................................</p>
          </div>

          <div className="text-center">
            <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ២០២៤</p>
            <p className="font-bold font-moul text-slate-900 mt-1">នាយិកាសាលា</p>
            <div className="h-16" />
            <p className="font-bold text-slate-900">{schoolProfile.principalName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
