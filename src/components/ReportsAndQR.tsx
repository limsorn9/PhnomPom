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
  LogIn,
  MapPin,
  Phone,
  Mail,
  Globe,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Heart,
  Droplets,
  Check,
  Filter,
  CheckSquare,
  Camera,
  ScanLine
} from 'lucide-react';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';
import { WebcamQRScannerModal } from './WebcamQRScannerModal';
import { ExportStudentIdBadgeModal } from './ExportStudentIdBadgeModal';

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
    'census' | 'score_sheet' | 'finance' | 'student_qr_cards' | 'student_qr_grid' | 'staff_qr_cards' | 'school_profile'
  >('census');

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('ក');
  const [selectedMonth, setSelectedMonth] = useState<string>('មករា');
  const [cardsPerA4, setCardsPerA4] = useState<6 | 8 | 12>(8);
  const [gridDensityPerA4, setGridDensityPerA4] = useState<12 | 16 | 20 | 24 | 30>(24);
  const [selectedStudentBatchIds, setSelectedStudentBatchIds] = useState<string[]>([]);
  const [batchGradeFilter, setBatchGradeFilter] = useState<string>('all');
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');

  // Filter students for active class
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  // Filter students for batch QR code grid
  const filteredBatchStudents = students.filter(st => {
    if (batchGradeFilter !== 'all') {
      const g = Number(batchGradeFilter);
      if (st.grade !== g) return false;
    }
    if (batchSearchQuery.trim()) {
      const q = batchSearchQuery.toLowerCase().trim();
      const matchName = st.nameKhmer.toLowerCase().includes(q) || (st.nameLatin && st.nameLatin.toLowerCase().includes(q));
      const matchCode = st.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  const studentsForQRGrid = selectedStudentBatchIds.length > 0
    ? students.filter(st => selectedStudentBatchIds.includes(st.id))
    : filteredBatchStudents;

  const activeScores = scores.filter(
    s =>
      s.grade === selectedGrade &&
      s.section === selectedSection &&
      s.monthOrSemester === selectedMonth
  );

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isWebcamScannerOpen, setIsWebcamScannerOpen] = useState(false);
  const [isSingleIdBadgeModalOpen, setIsSingleIdBadgeModalOpen] = useState(false);
  const [selectedStudentForBadgeId, setSelectedStudentForBadgeId] = useState<string | undefined>(undefined);

  const getReportTitle = () => {
    switch (activeReportType) {
      case 'census': return `ស្ថិតិសិស្សដើមឆ្នាំ_${schoolProfile.academicYear}`;
      case 'score_sheet': return `តារាងពិន្ទុ_ថ្នាក់ទី${selectedGrade}${selectedSection}_ខែ${selectedMonth}`;
      case 'finance': return `របាយការណ៍ហិរញ្ញវត្ថុ_${schoolProfile.academicYear}`;
      case 'student_qr_cards': return `កាតសិស្ស_ថ្នាក់ទី${selectedGrade}${selectedSection}`;
      case 'student_qr_grid': return `តារាងក្រឡា_QR_Code_សិស្ស_${schoolProfile.academicYear}`;
      case 'staff_qr_cards': return `ប័ណ្ណសម្គាល់បុគ្គលិក_${schoolProfile.academicYear}`;
      case 'school_profile': return `កម្រងប្រវត្តិរូបសាលារៀន_${schoolProfile.nameLatin || 'School_Profile'}_${schoolProfile.academicYear}`;
      default: return 'របាយការណ៍_MoEYS';
    }
  };

  const handlePrint = () => {
    printElement('reports-printable-container', {
      landscape: activeReportType === 'census' || activeReportType === 'score_sheet',
      pageTitle: getReportTitle()
    });
  };

  const handleDownloadPdf = async (customReportName?: string) => {
    setIsExportingPdf(true);
    try {
      const filename = customReportName 
        ? `${customReportName}.pdf` 
        : `${getReportTitle()}_${schoolProfile.nameKhmer || 'សាលារៀន'}.pdf`;
      await downloadElementAsPdf('reports-printable-container', filename, {
        landscape: activeReportType === 'census' || activeReportType === 'score_sheet'
      });
      showToast(`បានទាញយកឯកសារ PDF «${filename}» ជោគជ័យ!`);
    } catch (err) {
      console.error('Failed to export report PDF:', err);
      showToast('មានបញ្ហាក្នុងការបង្កើតឯកសារ PDF សូមព្យាយាមម្តងទៀត', 'error');
    } finally {
      setIsExportingPdf(false);
    }
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

  // Export 6: School Profile to Excel
  const exportSchoolProfileToExcel = () => {
    let csv = 'ផ្នែកព័ត៌មាន,សូចនាករ/ធាតុព័ត៌មាន,តម្លៃទិន្នន័យ\n';
    csv += `ព័ត៌មានទូទៅ,ឈ្មោះសាលារៀន (ខ្មែរ),"${schoolProfile.nameKhmer}"\n`;
    csv += `ព័ត៌មានទូទៅ,ឈ្មោះសាលារៀន (ឡាតាំង),"${schoolProfile.nameLatin}"\n`;
    csv += `ព័ត៌មានទូទៅ,លេខកូដសាលា,"${schoolProfile.schoolCode}"\n`;
    csv += `ព័ត៌មានទូទៅ,ឆ្នាំបង្កើត,"${schoolProfile.establishedYear}"\n`;
    csv += `ព័ត៌មានទូទៅ,ឆ្នាំសិក្សា,"${schoolProfile.academicYear}"\n`;
    csv += `ព័ត៌មានទូទៅ,សម្ព័ន្ធសាលា,"${schoolProfile.cluster}"\n`;
    csv += `ទីតាំងភូមិសាស្ត្រ,ភូមិ,"${schoolProfile.village}"\n`;
    csv += `ទីតាំងភូមិសាស្ត្រ,ឃុំ,"${schoolProfile.commune}"\n`;
    csv += `ទីតាំងភូមិសាស្ត្រ,ស្រុក,"${schoolProfile.district}"\n`;
    csv += `ទីតាំងភូមិសាស្ត្រ,ខេត្ត,"${schoolProfile.province}"\n`;
    csv += `គណៈគ្រប់គ្រង,នាយកសាលា,"${schoolProfile.principalName}"\n`;
    csv += `គណៈគ្រប់គ្រង,ទូរស័ព្ទនាយក,"${schoolProfile.principalPhone}"\n`;
    csv += `គណៈគ្រប់គ្រង,នាយករង,"${schoolProfile.deputyPrincipalName || 'មិនមាន'}"\n`;
    csv += `ស្ថិតិបុគ្គលិក,បុគ្គលិកសរុប,${teachers.length}\n`;
    csv += `ស្ថិតិបុគ្គលិក,គ្រូស្រី,${teachers.filter(t => t.gender === 'F').length}\n`;
    csv += `ស្ថិតិសិស្ស,សិស្សសរុប,${students.length}\n`;
    csv += `ស្ថិតិសិស្ស,សិស្សស្រី,${students.filter(s => s.gender === 'F').length}\n`;
    csv += `ស្ថិតិសិស្ស,សិស្សក្រីក្រ (IDPoor),${students.filter(s => s.livingCondition?.includes('ក្រ')).length}\n`;
    csv += `ស្ថិតិសិស្ស,សិស្សកំព្រា,${students.filter(s => s.orphanStatus && s.orphanStatus !== 'មិនកំព្រា').length}\n`;
    csv += `ស្ថិតិសិស្ស,សិស្សពិការ,${students.filter(s => s.disability && s.disability !== 'មិនពិការ').length}\n`;
    csv += `ថ្នាក់រៀន,ចំនួនបន្ទប់សរុប,${classrooms.length || 6}\n`;
    downloadExcelFile(`MoEYS_School_Profile_${schoolProfile.nameLatin || 'School'}_${schoolProfile.academicYear}`, csv);
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
            {/* Export High-Res Student ID Badge Card Action Button */}
            <button
              id="open-export-student-id-card-btn"
              onClick={() => {
                setSelectedStudentForBadgeId(classStudents[0]?.id || students[0]?.id);
                setIsSingleIdBadgeModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-amber-400/30"
              title="បង្កើត និងនាំចេញប័ណ្ណសម្គាល់ខ្លួនសិស្សម្នាក់ៗ (High-Resolution Student ID Badge Card)"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>នាំចេញកាតសិស្សម្នាក់ៗ (ID Card)</span>
            </button>

            {/* Webcam QR Scanner Action Button */}
            <button
              id="open-webcam-qr-scanner-btn"
              onClick={() => setIsWebcamScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-blue-400/30"
              title="បើកម៉ាស៊ីនស្កេន QR Code តាម Webcam សម្រាប់ Check-in វត្តមាន និងផ្ទៀងផ្ទាត់សិស្ស"
            >
              <Camera className="w-4 h-4 text-white animate-pulse" />
              <span>ស្កេន QR តាម Camera</span>
            </button>

            {/* Universal Excel Export Action */}
            <button
              onClick={() => {
                if (activeReportType === 'census') exportCensusToExcel();
                else if (activeReportType === 'score_sheet') exportScoresToExcel();
                else if (activeReportType === 'finance') exportFinanceToExcel();
                else if (activeReportType === 'student_qr_cards') exportStudentsToExcel();
                else if (activeReportType === 'staff_qr_cards') exportStaffToExcel();
                else exportSchoolProfileToExcel();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>នាំចេញ Excel</span>
            </button>

            {/* Download PDF Action */}
            <button
              onClick={() => handleDownloadPdf()}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              title="ទាញយកជារូបរាង PDF"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'កំពុងបង្កើត...' : 'ទាញយកជា PDF'}</span>
            </button>

            {/* Quick Export School Profile PDF */}
            {activeReportType !== 'school_profile' && (
              <button
                onClick={() => {
                  setActiveReportType('school_profile');
                  setTimeout(() => {
                    handleDownloadPdf(`កម្រងប្រវត្តិរូបសាលារៀន_${schoolProfile.nameLatin || 'School'}_${schoolProfile.academicYear}`);
                  }, 250);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                title="ទាញយកកម្រងប្រវត្តិរូបសាលារៀនជា PDF ដោយផ្ទាល់"
              >
                <School className="w-4 h-4 text-indigo-600" />
                <span>PDF ប្រវត្តិរូបសាលា</span>
              </button>
            )}

            {/* Print Action */}
            <button
              id="print-report-btn"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
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
            onClick={() => setActiveReportType('student_qr_grid')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReportType === 'student_qr_grid'
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>៥. តារាងក្រឡា QR Code សុទ្ធ (Printable Sheet)</span>
          </button>

          <button
            onClick={() => setActiveReportType('staff_qr_cards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportType === 'staff_qr_cards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ៦. ប័ណ្ណសម្គាល់បុគ្គលិក (Staff Badge)
          </button>

          <button
            onClick={() => setActiveReportType('school_profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReportType === 'school_profile'
                ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900/30'
                : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>៧. កម្រងប្រវត្តិរូបសាលារៀន (School Profile)</span>
          </button>

          <button
            id="tab-webcam-qr-scanner-btn"
            onClick={() => setIsWebcamScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xs hover:from-indigo-600 hover:to-blue-700"
          >
            <Camera className="w-3.5 h-3.5 animate-pulse" />
            <span>៨. ស្កេន QR តាម Webcam (Live Scanner)</span>
          </button>
        </div>
      </div>

      {/* Official MoEYS Print Document Container */}
      <div
        id="reports-printable-container"
        className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md max-w-5xl mx-auto print:shadow-none print:border-none print:p-0"
      >
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

        {/* 5. Printable Batch QR Grid Sheet View */}
        {activeReportType === 'student_qr_grid' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-moul text-slate-900">
                តារាងក្រឡា QR Code សិស្សលើសន្លឹក A4 (Printable Student QR Sheet)
              </h3>
              <p className="text-xs text-slate-500">
                ជ្រើសរើសសិស្សជាក្រុម (Batch Selection) និងបោះពុម្ព QR Code ជាក្រឡាក្នុងមួយសន្លឹក A4 ដោយផ្ទាល់តាមរយៈ Browser Print
              </p>
            </div>

            {/* Batch Selection & Density Control Toolbar (no-print) */}
            <div className="no-print bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-800">ចម្រោះសិស្សតាមកម្រិតថ្នាក់៖</span>
                  <select
                    value={batchGradeFilter}
                    onChange={e => setBatchGradeFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">គ្រប់ថ្នាក់ទាំងអស់ ({students.length} នាក់)</option>
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>
                        ថ្នាក់ទី {g} ({students.filter(s => s.grade === g).length} នាក់)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">ដង់ស៊ីតេលើក្រដាស A4៖</span>
                  <div className="flex items-center gap-1">
                    {[12, 16, 20, 24, 30].map(density => (
                      <button
                        key={density}
                        onClick={() => setGridDensityPerA4(density as 12 | 16 | 20 | 24 | 30)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                          gridDensityPerA4 === density
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Batch Select Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedStudentBatchIds.length === filteredBatchStudents.length) {
                        setSelectedStudentBatchIds([]);
                      } else {
                        setSelectedStudentBatchIds(filteredBatchStudents.map(s => s.id));
                      }
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      {selectedStudentBatchIds.length === filteredBatchStudents.length
                        ? 'ដោះការជ្រើសរើសទាំងអស់ (Clear All)'
                        : `ជ្រើសរើសសិស្សទាំងអស់ (${filteredBatchStudents.length})`}
                    </span>
                  </button>

                  <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 font-bold text-xs">
                    បានជ្រើសរើស៖ {studentsForQRGrid.length} សិស្ស
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      printElement('reports-printable-container', {
                        pageTitle: `តារាងក្រឡា_QR_Code_សិស្ស_${schoolProfile.academicYear}`,
                        landscape: false
                      });
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>បោះពុម្ពតារាង QR លើក្រដាស A4</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Student Selection Chip List (no-print) */}
            <div className="no-print bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs max-h-44 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                ជ្រើសរើសសិស្សនីមួយៗ (ចុចដើម្បីជ្រើសរើស/ដោះចេញ)៖
              </span>
              <div className="flex flex-wrap gap-1.5">
                {filteredBatchStudents.map(st => {
                  const isSelected = selectedStudentBatchIds.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentBatchIds(prev =>
                          prev.includes(st.id) ? prev.filter(id => id !== st.id) : [...prev, st.id]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-purple-50 text-purple-900 border-purple-300 font-bold shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-600' : 'bg-slate-300'}`} />
                      <span>{st.nameKhmer}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-normal">({st.code})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Printable QR Grid Container */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold font-moul text-slate-900">{schoolProfile.nameKhmer}</h4>
                  <p className="text-[11px] text-slate-500">តារាងលេខកូដសម្គាល់ QR Code សម្រាប់សិស្សានុសិស្ស • ឆ្នាំសិក្សា {schoolProfile.academicYear}</p>
                </div>
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                  សរុប៖ {studentsForQRGrid.length} ប័ណ្ណ
                </span>
              </div>

              {/* Dynamic Grid Density Styling */}
              <div
                className={`grid gap-3 ${
                  gridDensityPerA4 === 12
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                    : gridDensityPerA4 === 16
                    ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-4'
                    : gridDensityPerA4 === 20
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
                    : gridDensityPerA4 === 24
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'
                    : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-6'
                }`}
              >
                {studentsForQRGrid.map((st, idx) => (
                  <div
                    key={st.id}
                    className="border-2 border-slate-800 rounded-xl p-2.5 bg-white flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xs hover:border-purple-600 transition-colors"
                  >
                    {/* Tiny header */}
                    <div className="w-full flex items-center justify-between text-[8px] text-slate-500 font-bold border-b border-slate-100 pb-1 mb-1.5">
                      <span className="truncate max-w-[70px]">{schoolProfile.nameKhmer}</span>
                      <span className="font-mono text-purple-700">#{idx + 1}</span>
                    </div>

                    {/* QR Code */}
                    <div className="my-1 flex flex-col items-center">
                      <div className="p-1 bg-white border border-slate-300 rounded-md">
                        <QrCode className="w-16 h-16 text-slate-950" />
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="w-full space-y-0.5 mt-1">
                      <h5 className="text-[11px] font-bold font-moul text-slate-900 truncate" title={st.nameKhmer}>
                        {st.nameKhmer}
                      </h5>
                      <p className="text-[9px] font-semibold text-slate-600 truncate font-times">
                        {st.nameLatin || st.code}
                      </p>
                      <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-700 bg-slate-50 rounded px-1.5 py-0.5 mt-1 border border-slate-200/60">
                        <span className="font-mono text-indigo-900">{st.code}</span>
                        <span>ថ្នាក់ទី {st.grade}{st.section || 'ក'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. Staff QR Code Badges View */}
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

        {/* 6. School Profile Comprehensive MoEYS Report */}
        {activeReportType === 'school_profile' && (
          <div className="space-y-8">
            {/* Header Title */}
            <div className="text-center space-y-1 pb-2 border-b border-slate-200">
              <div className="inline-flex items-center justify-center p-2.5 bg-blue-50 text-blue-900 rounded-full mb-2">
                <School className="w-6 h-6 text-blue-800" />
              </div>
              <h3 className="text-xl font-bold font-moul text-blue-950">
                កម្រងប្រវត្តិរូប និងរបាយការណ៍សង្ខេបសាលារៀន (School Profile & Overview)
              </h3>
              <p className="text-xs text-slate-600">
                ព័ត៌មានលម្អិតស្ដីពីអត្តសញ្ញាណ ហេដ្ឋារចនាសម្ព័ន្ធ បុគ្គលិកអប់រំ និងស្ថិតិសិស្សានុសិស្ស ឆ្នាំសិក្សា {schoolProfile.academicYear}
              </p>
            </div>

            {/* Quick Export Actions inside Profile view */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 rounded-2xl border border-blue-200/80">
              <div className="flex items-center gap-2 text-xs text-blue-950 font-bold">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>ឯកសារប្រវត្តិរូបសាលារៀនស្ដង់ដារ MoEYS សម្រាប់តម្កល់ទុក និងរាយការណ៍ផ្លូវការ</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportSchoolProfileToExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel ប្រវត្តិរូប</span>
                </button>
                <button
                  onClick={() => handleDownloadPdf(`កម្រងប្រវត្តិរូបសាលារៀន_${schoolProfile.nameLatin || 'School'}_${schoolProfile.academicYear}`)}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'កំពុងបង្កើត PDF...' : 'ទាញយក PDF ប្រវត្តិរូបសាលា'}</span>
                </button>
              </div>
            </div>

            {/* Section 1: Executive KPI Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between text-blue-900 mb-1">
                  <span className="text-xs font-bold">សិស្សសរុប</span>
                  <Users className="w-4 h-4 text-blue-700" />
                </div>
                <div className="text-2xl font-bold font-mono text-blue-950">
                  {students.length} <span className="text-xs font-normal text-slate-600">នាក់</span>
                </div>
                <div className="text-[11px] text-blue-800 mt-1">
                  ស្រី: <strong className="font-mono">{students.filter(s => s.gender === 'F').length}</strong> នាក់ ({students.length ? Math.round((students.filter(s => s.gender === 'F').length / students.length) * 100) : 0}%)
                </div>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-900 mb-1">
                  <span className="text-xs font-bold">បុគ្គលិកអប់រំ</span>
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-950">
                  {teachers.length} <span className="text-xs font-normal text-slate-600">រូប</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1">
                  ស្រី: <strong className="font-mono">{teachers.filter(t => t.gender === 'F').length}</strong> រូប • គ្រូបង្រៀន: <strong className="font-mono">{teachers.filter(t => t.assignedGrade).length}</strong>
                </div>
              </div>

              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
                <div className="flex items-center justify-between text-indigo-900 mb-1">
                  <span className="text-xs font-bold">កម្រិតថ្នាក់ & បន្ទប់</span>
                  <Building className="w-4 h-4 text-indigo-700" />
                </div>
                <div className="text-2xl font-bold font-mono text-indigo-950">
                  6 <span className="text-xs font-normal text-slate-600">កម្រិត</span>
                </div>
                <div className="text-[11px] text-indigo-800 mt-1">
                  បន្ទប់រៀនសរុប: <strong className="font-mono">{classrooms.length || 6}</strong> បន្ទប់
                </div>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between text-amber-900 mb-1">
                  <span className="text-xs font-bold">សិស្សងាយរងគ្រោះ</span>
                  <Heart className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-950">
                  {students.filter(s => s.livingCondition?.includes('ក្រ') || (s.orphanStatus && s.orphanStatus !== 'មិនកំព្រា') || (s.disability && s.disability !== 'មិនពិការ')).length} <span className="text-xs font-normal text-slate-600">នាក់</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1">
                  ក្រីក្រ IDPoor: <strong className="font-mono">{students.filter(s => s.livingCondition?.includes('ក្រ')).length}</strong> នាក់
                </div>
              </div>
            </div>

            {/* Section 2: General Identification & Geographical Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-moul text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <School className="w-4 h-4 text-blue-700" />
                ១. ព័ត៌មានទូទៅ និងអត្តសញ្ញាណសាលារៀន (General Identification)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">ឈ្មោះសាលារៀន (ភាសាខ្មែរ)៖</span>
                    <strong className="font-moul text-blue-950">{schoolProfile.nameKhmer}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">ឈ្មោះសាលារៀន (អក្សរឡាតាំង)៖</span>
                    <strong className="font-semibold text-slate-800">{schoolProfile.nameLatin}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">លេខកូដសាលារៀន (School Code)៖</span>
                    <strong className="font-mono text-indigo-900">{schoolProfile.schoolCode}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">ឆ្នាំបង្កើតសាលា (Established)៖</span>
                    <strong className="font-mono text-slate-800">{schoolProfile.establishedYear || '២០០០'}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">សម្ព័ន្ធសាលា (School Cluster)៖</span>
                    <strong className="text-slate-800">{schoolProfile.cluster || 'បឋមសិក្សាបង្គោល'}</strong>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">ទីតាំងភូមិ៖</span>
                    <strong className="text-slate-800">{schoolProfile.village || 'ភ្នំពំ'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">ឃុំ / សង្កាត់៖</span>
                    <strong className="text-slate-800">{schoolProfile.commune || 'រំចេក'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">ក្រុង / ស្រុក / ខណ្ឌ៖</span>
                    <strong className="text-slate-800">{schoolProfile.district}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">រាជធានី / ខេត្ត៖</span>
                    <strong className="text-slate-800">{schoolProfile.province}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">ទំនាក់ទំនងនាយកសាលា៖</span>
                    <strong className="font-mono text-slate-800">{schoolProfile.principalPhone} ({schoolProfile.principalName})</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Grade-by-Grade Student Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-moul text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Users className="w-4 h-4 text-blue-700" />
                ២. ស្ថិតិសិស្សតាមកម្រិតថ្នាក់ពីថ្នាក់ទី១ ដល់ថ្នាក់ទី៦ (Grade Breakdown)
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                      <th className="border border-slate-300 py-2 px-3">កម្រិតថ្នាក់</th>
                      <th className="border border-slate-300 py-2 px-3">បន្ទប់</th>
                      <th className="border border-slate-300 py-2 px-3">សិស្សសរុប</th>
                      <th className="border border-slate-300 py-2 px-3">ស្រី</th>
                      <th className="border border-slate-300 py-2 px-3">ប្រុស</th>
                      <th className="border border-slate-300 py-2 px-3">ក្រីក្រ (IDPoor)</th>
                      <th className="border border-slate-300 py-2 px-3">សិស្សពិការ</th>
                      <th className="border border-slate-300 py-2 px-3 text-left">គ្រូបន្ទុកថ្នាក់</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6].map(grade => {
                      const gradeStudents = students.filter(s => s.grade === grade);
                      const fCount = gradeStudents.filter(s => s.gender === 'F').length;
                      const mCount = gradeStudents.length - fCount;
                      const poorCount = gradeStudents.filter(s => s.livingCondition?.includes('ក្រ')).length;
                      const disCount = gradeStudents.filter(s => s.disability && s.disability !== 'មិនពិការ').length;
                      const teacher = teachers.find(t => t.assignedGrade === grade);

                      return (
                        <tr key={grade} className="text-center hover:bg-slate-50">
                          <td className="border border-slate-300 py-2 px-3 font-bold text-blue-950">ថ្នាក់ទី {grade}</td>
                          <td className="border border-slate-300 py-2 px-3 font-mono">១</td>
                          <td className="border border-slate-300 py-2 px-3 font-bold font-mono text-slate-900">{gradeStudents.length}</td>
                          <td className="border border-slate-300 py-2 px-3 font-mono text-pink-700">{fCount}</td>
                          <td className="border border-slate-300 py-2 px-3 font-mono text-blue-700">{mCount}</td>
                          <td className="border border-slate-300 py-2 px-3 font-mono">{poorCount}</td>
                          <td className="border border-slate-300 py-2 px-3 font-mono">{disCount}</td>
                          <td className="border border-slate-300 py-2 px-3 text-left font-medium text-slate-800">
                            {teacher?.nameKhmer || <span className="text-slate-400 italic">មិនទាន់ចាត់តាំង</span>}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold text-center text-slate-900">
                      <td className="border border-slate-300 py-2.5 px-3">សរុបរួម</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-mono">៦</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-mono text-blue-900">{students.length}</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-mono text-pink-800">{students.filter(s => s.gender === 'F').length}</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-mono text-blue-800">{students.filter(s => s.gender === 'M').length}</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-mono">{students.filter(s => s.livingCondition?.includes('ក្រ')).length}</td>
                      <td className="border border-slate-300 py-2.5 px-3 font-mono">{students.filter(s => s.disability && s.disability !== 'មិនពិការ').length}</td>
                      <td className="border border-slate-300 py-2.5 px-3 text-left">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Leadership & Educational Staff Directory */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-moul text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                ៣. រចនាសម្ព័ន្ធគណៈគ្រប់គ្រង និងបុគ្គលិកអប់រំ (School Leadership & Staff)
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800">
                      <th className="border border-slate-300 py-2 px-3 w-10 text-center">ល.រ</th>
                      <th className="border border-slate-300 py-2 px-3">អត្តលេខ</th>
                      <th className="border border-slate-300 py-2 px-3">គោត្តនាម និងនាម</th>
                      <th className="border border-slate-300 py-2 px-3 text-center">ភេទ</th>
                      <th className="border border-slate-300 py-2 px-3">មុខតំណែង / ភារកិច្ច</th>
                      <th className="border border-slate-300 py-2 px-3 text-center">ថ្នាក់ទទួលបន្ទុក</th>
                      <th className="border border-slate-300 py-2 px-3">លេខទូរស័ព្ទ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 py-1.5 px-3 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 py-1.5 px-3 font-mono font-semibold text-slate-700">{t.staffCode}</td>
                        <td className="border border-slate-300 py-1.5 px-3 font-bold text-slate-900">
                          {t.nameKhmer} <span className="text-[10px] font-normal text-slate-500">({t.nameLatin})</span>
                        </td>
                        <td className="border border-slate-300 py-1.5 px-3 text-center">
                          {t.gender === 'F' ? <span className="text-pink-700 font-medium">ស្រី</span> : <span className="text-blue-700 font-medium">ប្រុស</span>}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-3 text-slate-800 font-medium">{t.role}</td>
                        <td className="border border-slate-300 py-1.5 px-3 text-center font-semibold text-indigo-900">
                          {t.assignedGrade ? `ថ្នាក់ទី ${t.assignedGrade}` : '-'}
                        </td>
                        <td className="border border-slate-300 py-1.5 px-3 font-mono text-slate-700">{t.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: School Infrastructure, WASH & Facilities */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-moul text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Building className="w-4 h-4 text-blue-700" />
                ៤. ហេដ្ឋារចនាសម្ព័ន្ធ បណ្ណាល័យ និងបរិស្ថានអនាម័យ (Infrastructure & WASH)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-700" />
                    <span>អគារ និងបន្ទប់សិក្សា</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">អគារសិក្សាសរុប៖</span>
                    <strong className="font-mono">២ ខ្នង</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">បន្ទប់រៀនដំណើរការ៖</span>
                    <strong className="font-mono">{classrooms.length || 6} បន្ទប់</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">បន្ទប់រដ្ឋបាល/នាយក៖</span>
                    <strong className="font-mono">១ បន្ទប់</strong>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                    <span>បណ្ណាល័យ និងបច្ចេកវិទ្យា</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">បណ្ណាល័យស្ដង់ដារ៖</span>
                    <strong className="text-emerald-700 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> មានដំណើរការ</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">បន្ទប់កុំព្យូទ័រ/ICT៖</span>
                    <strong className="text-emerald-700 font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> បំពាក់ Tablet</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">ប្រព័ន្ធអ៊ីនធឺណិត៖</span>
                    <strong className="text-slate-800 font-mono">Wi-Fi School</strong>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Droplets className="w-3.5 h-3.5 text-teal-700" />
                    <span>បរិស្ថាន និងអនាម័យ (WASH)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">ប្រព័ន្ធទឹកស្អាតពិសារ៖</span>
                    <strong className="text-emerald-700 font-semibold">មានស្ដង់ដារ</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">បង្គន់អនាម័យសិស្ស៖</span>
                    <strong className="font-mono">៤ បន្ទប់ (បែងចែកស្រី/ប្រុស)</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">កន្លែងលាងដៃអនាម័យ៖</span>
                    <strong className="font-mono">២ កន្លែង</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Vision, Mission and Strategic Goals */}
            <div className="space-y-3 border border-blue-100 bg-blue-50/30 p-5 rounded-2xl">
              <h4 className="text-sm font-bold font-moul text-blue-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                ៥. ចក្ខុវិស័យ បេសកកម្ម និងទិសដៅយុទ្ធសាស្ត្ររបស់សាលារៀន
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="space-y-1">
                  <strong className="text-blue-900 font-bold block">ចក្ខុវិស័យ (Vision)៖</strong>
                  <p className="leading-relaxed">
                    កសាងសាលាបឋមសិក្សា {schoolProfile.nameKhmer} ឱ្យក្លាយជាសាលារៀនគំរូ ប្រកបដោយគុណភាពអប់រំ សមធម៌ បរិយាបន្ន និងបង្កើតបរិស្ថានសិក្សាប្រកបដោយសុវត្ថិភាព ផាសុកភាព និងការរៀនសូត្រពេញមួយជីវិត។
                  </p>
                </div>
                <div className="space-y-1">
                  <strong className="text-blue-900 font-bold block">បេសកកម្ម (Mission)៖</strong>
                  <p className="leading-relaxed">
                    ពង្រឹងគុណភាពបង្រៀននិងរៀនមុខវិជ្ជាភាសាខ្មែរ និងគណិតវិទ្យាថ្នាក់ដំបូង លើកកម្ពស់អាហារូបត្ថម្ភនិងសុខភាពសិស្ស និងពង្រឹងកិច្ចសហការយ៉ាងជិតស្និទ្ធរវាងសាលារៀន អាណាព្យាបាល និងសហគមន៍។
                  </p>
                </div>
              </div>
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

      {/* Live Webcam QR Scanner Modal */}
      {isWebcamScannerOpen && (
        <WebcamQRScannerModal onClose={() => setIsWebcamScannerOpen(false)} />
      )}

      {/* High-Resolution Individual Student ID Card Badge Export Modal */}
      {isSingleIdBadgeModalOpen && (
        <ExportStudentIdBadgeModal
          isOpen={isSingleIdBadgeModalOpen}
          onClose={() => setIsSingleIdBadgeModalOpen(false)}
          students={students}
          schoolProfile={schoolProfile}
          initialStudentId={selectedStudentForBadgeId}
          showToast={showToast}
        />
      )}
    </div>
  );
};
