import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, Teacher, SignatureQRStyle, QRScanVerificationLog } from '../types';
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
  Square,
  Camera,
  ScanLine,
  ToggleLeft,
  ToggleRight,
  Stamp,
  Clock,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  Laptop,
  Smartphone,
  History,
  FileStack,
  Trash2,
  RotateCcw,
  CheckCheck,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';
import { WebcamQRScannerModal } from './WebcamQRScannerModal';
import { ExportStudentIdBadgeModal } from './ExportStudentIdBadgeModal';
import {
  PrincipalSignatureQRSlot,
  PrincipalSignaturePlaceholderGraphic,
  generateUniqueSignatureCode,
  calculateSignatureExpiry,
  isSignatureExpired,
  PrincipalSignatureQRParams
} from '../utils/reportCardSignatureQR';
import { MoEYSReportCardSignatures, AngkorPageWatermark, MoEYSRoyalHeader } from './AngkorMotif';
import { MoEYSStudentRecordMasterModal } from './MoEYSStudentRecordMasterModal';

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
    getFormattedGrade,
    printSettings,
    setPrintSettings,
    addActivityLog,
    currentUser,
    qrScanVerificationLogs = [],
    deleteQRScanVerificationLog,
    clearQRScanVerificationLogs
  } = useSchool();

  const [activeReportType, setActiveReportType] = useState<
    'census' | 'score_sheet' | 'finance' | 'student_qr_cards' | 'student_qr_grid' | 'staff_qr_cards' | 'school_profile' | 'report_cards' | 'scan_history'
  >('census');

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('ក');
  const [selectedMonth, setSelectedMonth] = useState<string>('មករា');
  const [cardsPerA4, setCardsPerA4] = useState<6 | 8 | 12>(8);
  const [gridDensityPerA4, setGridDensityPerA4] = useState<12 | 16 | 20 | 24 | 30>(24);
  const [selectedStudentBatchIds, setSelectedStudentBatchIds] = useState<string[]>([]);
  const [batchGradeFilter, setBatchGradeFilter] = useState<string>('all');
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');

  // Report Card Mode: Single Student vs Batch Concatenated PDF
  const [reportCardMode, setReportCardMode] = useState<'single' | 'batch_concatenated'>('single');
  const [selectedBatchReportCardStudentIds, setSelectedBatchReportCardStudentIds] = useState<string[]>([]);
  const [batchReportCardGradeFilter, setBatchReportCardGradeFilter] = useState<string>('all');
  const [batchReportCardSectionFilter, setBatchReportCardSectionFilter] = useState<string>('all');
  const [batchReportCardSearch, setBatchReportCardSearch] = useState<string>('');
  
  // Custom renewal timestamp map for re-generating expired signature QR codes
  const [signatureRenewalTimestamps, setSignatureRenewalTimestamps] = useState<Record<string, string>>({});

  // Scan History Filter & Search
  const [scanHistoryStatusFilter, setScanHistoryStatusFilter] = useState<'all' | 'valid' | 'expired' | 'tampered' | 'invalid'>('all');
  const [scanHistorySearch, setScanHistorySearch] = useState<string>('');
  const [isMoeyMasterModalOpen, setIsMoeyMasterModalOpen] = useState<boolean>(false);

  // Filter students for active class
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  // Filter students for batch report cards
  const filteredBatchReportCardStudents = students.filter(st => {
    if (batchReportCardGradeFilter !== 'all') {
      if (st.grade !== Number(batchReportCardGradeFilter)) return false;
    }
    if (batchReportCardSectionFilter !== 'all') {
      if (st.section !== batchReportCardSectionFilter) return false;
    }
    if (batchReportCardSearch.trim()) {
      const q = batchReportCardSearch.toLowerCase().trim();
      const matchName = st.nameKhmer.toLowerCase().includes(q) || (st.nameLatin && st.nameLatin.toLowerCase().includes(q));
      const matchCode = st.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  // Students to render in concatenated report cards PDF
  const studentsForConcatenatedReportCards = selectedBatchReportCardStudentIds.length > 0
    ? students.filter(st => selectedBatchReportCardStudentIds.includes(st.id))
    : (classStudents.length > 0 ? classStudents : students.slice(0, 10));

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
  const [selectedStudentForReportCard, setSelectedStudentForReportCard] = useState<Student | null>(null);

  const logReportCardGenerationOrPrint = (student: Student, action: 'generated' | 'printed' | 'exported_pdf') => {
    if (!addActivityLog) return;
    const actionText = action === 'printed' ? 'បោះពុម្ព' : (action === 'exported_pdf' ? 'ទាញយកជា PDF' : 'បង្កើត/ពិនិត្យមើល');
    const signatureCode = generateUniqueSignatureCode({
      studentId: student.id,
      studentCode: student.code,
      studentNameKhmer: student.nameKhmer,
      grade: student.grade,
      section: student.section,
      academicYear: schoolProfile.academicYear,
      monthOrSemester: selectedMonth,
      schoolCode: schoolProfile.schoolCode,
      schoolNameKhmer: schoolProfile.nameKhmer,
      principalName: schoolProfile.principalName
    });

    addActivityLog({
      domain: 'academic',
      actionType: 'document',
      title: `${actionText}ព្រឹត្តិបត្រពិន្ទុជាមួយ QR ហត្ថលេខាឌីជីថល`,
      description: `បាន${actionText}ព្រឹត្តិបត្រពិន្ទុផ្លូវការភ្ជាប់ QR Code ហត្ថលេខាឌីជីថលនាយកសាលា (${signatureCode}) សម្រាប់សិស្ស «${student.nameKhmer}» (អត្តលេខ: ${student.code}) ថ្នាក់ទី ${student.grade}${student.section}`,
      entityId: student.id,
      entityCode: student.code,
      entityName: student.nameKhmer,
      actorName: currentUser?.nameKhmer || 'លោកនាយកសាលា',
      actorRole: currentUser?.role || 'principal',
      targetTab: 'reports_qr',
      tags: ['report_card', 'principal_qr_signature', 'moeys_verification', action],
      details: {
        studentId: student.id,
        studentName: student.nameKhmer,
        studentCode: student.code,
        grade: student.grade,
        section: student.section,
        monthOrSemester: selectedMonth,
        academicYear: schoolProfile.academicYear,
        signatureCode,
        action,
        hasPrincipalSignatureQR: printSettings?.showPrincipalSignatureQR !== false,
        timestamp: new Date().toISOString()
      }
    });
  };

  const getReportTitle = () => {
    switch (activeReportType) {
      case 'census': return `ស្ថិតិសិស្សដើមឆ្នាំ_${schoolProfile.academicYear}`;
      case 'score_sheet': return `តារាងពិន្ទុ_ថ្នាក់ទី${selectedGrade}${selectedSection}_ខែ${selectedMonth}`;
      case 'finance': return `របាយការណ៍ហិរញ្ញវត្ថុ_${schoolProfile.academicYear}`;
      case 'student_qr_cards': return `កាតសិស្ស_ថ្នាក់ទី${selectedGrade}${selectedSection}`;
      case 'student_qr_grid': return `តារាងក្រឡា_QR_Code_សិស្ស_${schoolProfile.academicYear}`;
      case 'staff_qr_cards': return `ប័ណ្ណសម្គាល់បុគ្គលិក_${schoolProfile.academicYear}`;
      case 'school_profile': return `កម្រងប្រវត្តិរូបសាលារៀន_${schoolProfile.nameLatin || 'School_Profile'}_${schoolProfile.academicYear}`;
      case 'report_cards': return `ព្រឹត្តិបត្រពិន្ទុ_សិស្ស_${schoolProfile.academicYear}`;
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
            {/* MoEYS Standard Master Student Roster Action Button */}
            <button
              id="open-reports-moeys-master-modal-btn"
              onClick={() => setIsMoeyMasterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-amber-300/40"
              title="មើល និងបោះពុម្ពតារាងប្រវត្តិសិស្សស្តង់ដារក្រសួងអប់រំ ១២ ជួរឈរពេញលេញ (MoEYS Master Student Roster)"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>តារាងប្រវត្តិសិស្សក្រសួង (MoEYS)</span>
            </button>

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
            id="tab-report-cards-signature-qr-btn"
            onClick={() => {
              setActiveReportType('report_cards');
              const st = selectedStudentForReportCard || classStudents[0] || students[0];
              if (st) {
                setSelectedStudentForReportCard(st);
                logReportCardGenerationOrPrint(st, 'generated');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReportType === 'report_cards'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm ring-2 ring-emerald-500/40'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>៨. ព្រឹត្តិបត្រពិន្ទុ & QR ហត្ថលេខាឌីជីថល (Report Cards)</span>
          </button>

          <button
            id="tab-webcam-qr-scanner-btn"
            onClick={() => setIsWebcamScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xs hover:from-indigo-600 hover:to-blue-700 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 animate-pulse" />
            <span>៩. ស្កេន QR តាម Webcam (Live Scanner)</span>
          </button>

          <button
            id="tab-scan-verification-history-btn"
            onClick={() => setActiveReportType('scan_history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeReportType === 'scan_history'
                ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-sm ring-2 ring-indigo-500/40'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>១០. ប្រវត្តិស្កេនផ្ទៀងផ្ទាត់ QR ({qrScanVerificationLogs.length})</span>
          </button>
        </div>

        {/* User-Controlled Print & QR Signature Settings Control Panel (no-print) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">
                ការកំណត់ហត្ថលេខា & QR Code លើឯកសារបោះពុម្ព (Print & Signature Security Settings):
              </span>
              <span className="text-[11px] text-slate-500">
                កែប្រែម៉ូត QR, កាលបរិច្ឆេទផុតកំណត់ស្វ័យប្រវត្តិ និងសុវត្ថិភាពហត្ថលេខាឌីជីថលនាយកសាលា
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* QR Code Style Selector */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500 font-medium text-[11px]">ម៉ូត QR:</span>
              <select
                id="signature-qr-style-select"
                value={printSettings?.signatureQRStyle || 'rounded_modern'}
                onChange={(e) => {
                  const newStyle = e.target.value as SignatureQRStyle;
                  setPrintSettings(prev => ({
                    ...prev,
                    signatureQRStyle: newStyle
                  }));
                  showToast(
                    `បានប្តូរម៉ូត QR ហត្ថលេខាឌីជីថលទៅជា៖ ${
                      newStyle === 'classic_square'
                        ? 'ការ៉េស្តង់ដារ (Classic Square)'
                        : newStyle === 'rounded_modern'
                        ? 'ជ្រុងមូលទំនើប (Rounded Modern)'
                        : newStyle === 'dot_pattern'
                        ? 'លំនាំចំណុចមូល (Dot Pattern)'
                        : newStyle === 'framed_seal'
                        ? 'ស៊ុមត្រាសុវត្ថិភាព (Security Seal)'
                        : 'ស៊ុមត្រាក្រសួង MoEYS'
                    }`
                  );
                }}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="classic_square">ការ៉េស្តង់ដារ (Square)</option>
                <option value="rounded_modern">ជ្រុងមូលទំនើប (Rounded)</option>
                <option value="dot_pattern">លំនាំចំណុចមូល (Dots)</option>
                <option value="framed_seal">ស៊ុមត្រាសុវត្ថិភាព (Seal)</option>
                <option value="bordered_moeys">ស៊ុមត្រាក្រសួង (MoEYS)</option>
              </select>
            </div>

            {/* Signature Expiry Duration Selector */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-500 font-medium text-[11px]">សុពលភាព QR:</span>
              <select
                id="signature-expiry-days-select"
                value={printSettings?.signatureExpiryDays || 90}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  setPrintSettings(prev => ({
                    ...prev,
                    signatureExpiryDays: days
                  }));
                  showToast(`បានកំណត់សុពលភាព QR Code ហត្ថលេខានាយកសាលា៖ ${days} ថ្ងៃ`);
                }}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value={30}>៣០ ថ្ងៃ (១ ខែ)</option>
                <option value={60}>៦០ ថ្ងៃ (២ ខែ)</option>
                <option value={90}>៩០ ថ្ងៃ (៣ ខែ - ត្រីមាស)</option>
                <option value={180}>១៨០ ថ្ងៃ (៦ ខែ - ឆមាស)</option>
                <option value={365}>៣៦៥ ថ្ងៃ (១ ឆ្នាំ)</option>
              </select>
            </div>

            {/* Toggle Principal Signature QR Visibility */}
            <button
              id="toggle-principal-signature-qr-btn"
              type="button"
              onClick={() => {
                const nextVal = !printSettings?.showPrincipalSignatureQR;
                setPrintSettings(prev => ({
                  ...prev,
                  showPrincipalSignatureQR: nextVal
                }));
                showToast(
                  nextVal
                    ? 'បានបើកបង្ហាញ QR Code ហត្ថលេខាឌីជីថលនាយកសាលាលើព្រឹត្តិបត្រពិន្ទុ និងឯកសារផ្លូវការ'
                    : 'បានបិទការបង្ហាញ QR Code ហត្ថលេខាឌីជីថលលើឯកសារបោះពុម្ព',
                  'info'
                );
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                printSettings?.showPrincipalSignatureQR !== false
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
              }`}
              title="បិទ/បើក ការបង្ហាញ QR Code ហត្ថលេខាឌីជីថលរបស់នាយកសាលាលើព្រឹត្តិបត្រពិន្ទុ និងឯកសារផ្លូវការ"
            >
              {printSettings?.showPrincipalSignatureQR !== false ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                  <span>QR ហត្ថលេខា: <strong>បើក</strong></span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>QR ហត្ថលេខា: <strong>បិទ</strong></span>
                </>
              )}
            </button>

            {/* Stamp visibility toggle */}
            <button
              id="toggle-round-stamp-btn"
              type="button"
              onClick={() => {
                const nextVal = !printSettings?.showRoundStamp;
                setPrintSettings(prev => ({
                  ...prev,
                  showRoundStamp: nextVal
                }));
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                printSettings?.showRoundStamp !== false
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>ត្រាមូល: {printSettings?.showRoundStamp !== false ? 'បើក' : 'បិទ'}</span>
            </button>
          </div>
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

        {/* 8. Student Report Cards with Principal's Digital Signature QR Code (Single & Batch Concatenated PDF) */}
        {activeReportType === 'report_cards' && (
          <div className="space-y-6">
            {/* Mode Selector & Control Panel (no-print) */}
            <div className="no-print bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
                <div>
                  <h4 className="text-sm font-bold font-moul text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>ការបង្កើត និងបោះពុម្ពព្រឹត្តិបត្រពិន្ទុផ្លូវការ MoEYS</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    គាំទ្រការបោះពុម្ពព្រឹត្តិបត្រសិស្សម្នាក់ៗ ឬជ្រើសរើសសិស្សច្រើននាក់ដើម្បីទាញយកជាឯកសារ PDF រួមតែមួយ (Concatenated PDF)
                  </p>
                </div>

                {/* Mode Toggle Buttons */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
                  <button
                    id="mode-single-report-card-btn"
                    type="button"
                    onClick={() => setReportCardMode('single')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reportCardMode === 'single'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>សិស្សម្នាក់ៗ (Single)</span>
                  </button>

                  <button
                    id="mode-batch-report-card-btn"
                    type="button"
                    onClick={() => setReportCardMode('batch_concatenated')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reportCardMode === 'batch_concatenated'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>បោះពុម្ពរួមជាក្រុម (Batch PDF)</span>
                  </button>
                </div>
              </div>

              {/* Controls for Single Student Mode */}
              {reportCardMode === 'single' && (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">ជ្រើសរើសសិស្ស៖</label>
                    <select
                      id="select-report-card-student"
                      value={selectedStudentForReportCard?.id || (classStudents[0]?.id || '')}
                      onChange={(e) => {
                        const st = students.find(s => s.id === e.target.value) || null;
                        setSelectedStudentForReportCard(st);
                        if (st) {
                          logReportCardGenerationOrPrint(st, 'generated');
                        }
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[220px]"
                    >
                      {classStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nameKhmer} ({s.code}) - {s.gender === 'F' ? 'ស្រី' : 'ប្រុស'} - ថ្នាក់ទី {s.grade}{s.section}
                        </option>
                      ))}
                      {classStudents.length === 0 && students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nameKhmer} ({s.code}) - ថ្នាក់ទី {s.grade}{s.section}
                        </option>
                      ))}
                    </select>

                    {/* Signature Expiry & Renewal Quick Indicator */}
                    {(() => {
                      const curSt = selectedStudentForReportCard || classStudents[0] || students[0];
                      if (!curSt) return null;
                      const customTs = signatureRenewalTimestamps[curSt.id];
                      const expiryDays = printSettings?.signatureExpiryDays || 90;
                      const expiryDate = calculateSignatureExpiry(customTs || undefined, expiryDays);
                      const isExpired = customTs ? isSignatureExpired(customTs, expiryDays) : false;

                      return (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 ${
                              isExpired
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {isExpired ? 'QR ផុតកំណត់' : `សុពលភាព QR: ${expiryDays} ថ្ងៃ (ដល់ ${new Date(expiryDate).toLocaleDateString('km-KH')})`}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const nowIso = new Date().toISOString();
                              setSignatureRenewalTimestamps(prev => ({
                                ...prev,
                                [curSt.id]: nowIso
                              }));
                              showToast(`បានបង្កើត និងធ្វើបច្ចុប្បន្នភាព QR ហត្ថលេខាឌីជីថលថ្មីសម្រាប់ «${curSt.nameKhmer}» ជោគជ័យ!`);
                              logReportCardGenerationOrPrint(curSt, 'generated');
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="ចុចដើម្បីបង្កើត QR Code ហត្ថលេខាឌីជីថលឡើងវិញភ្លាមៗ (Refresh & Extend Security Period)"
                          >
                            <RefreshCw className="w-3 h-3 text-amber-700" />
                            <span>បង្កើតហត្ថលេខាឡើងវិញ</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="print-single-report-card-btn"
                      onClick={() => {
                        const currentSt = selectedStudentForReportCard || classStudents[0] || students[0];
                        if (currentSt) {
                          logReportCardGenerationOrPrint(currentSt, 'printed');
                        }
                        handlePrint();
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>បោះពុម្ពព្រឹត្តិបត្រពិន្ទុ</span>
                    </button>

                    <button
                      id="download-single-report-card-pdf-btn"
                      onClick={() => {
                        const currentSt = selectedStudentForReportCard || classStudents[0] || students[0];
                        if (currentSt) {
                          logReportCardGenerationOrPrint(currentSt, 'exported_pdf');
                        }
                        handleDownloadPdf(`ព្រឹត្តិបត្រពិន្ទុ_${selectedStudentForReportCard?.nameKhmer || 'សិស្ស'}_${selectedMonth}`);
                      }}
                      disabled={isExportingPdf}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isExportingPdf ? 'កំពុងបង្កើត...' : 'ទាញយក PDF'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Controls for Batch Concatenated PDF Mode */}
              {reportCardMode === 'batch_concatenated' && (
                <div className="space-y-4">
                  {/* Filter & Selection Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      {/* Grade Filter */}
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700">ថ្នាក់៖</span>
                        <select
                          value={batchReportCardGradeFilter}
                          onChange={(e) => setBatchReportCardGradeFilter(e.target.value)}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="all">ទាំងអស់ (គ្រប់កម្រិត)</option>
                          {[1, 2, 3, 4, 5, 6].map(g => (
                            <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                          ))}
                        </select>
                      </div>

                      {/* Section Filter */}
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700">បន្ទប់៖</span>
                        <select
                          value={batchReportCardSectionFilter}
                          onChange={(e) => setBatchReportCardSectionFilter(e.target.value)}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="all">ទាំងអស់</option>
                          {['ក', 'ខ', 'គ', 'ឃ'].map(sec => (
                            <option key={sec} value={sec}>បន្ទប់ {sec}</option>
                          ))}
                        </select>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={batchReportCardSearch}
                          onChange={(e) => setBatchReportCardSearch(e.target.value)}
                          placeholder="ស្វែងរកតាមឈ្មោះ/អត្តលេខ..."
                          className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-44 focus:w-56 focus:bg-white transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Bulk Selection Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allFilteredIds = filteredBatchReportCardStudents.map(s => s.id);
                          setSelectedBatchReportCardStudentIds(allFilteredIds);
                          showToast(`បានជ្រើសរើសសិស្សទាំងអស់ (${allFilteredIds.length} នាក់)`);
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        ជ្រើសទាំងអស់ ({filteredBatchReportCardStudents.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBatchReportCardStudentIds([]);
                          showToast('បានលុបការជ្រើសរើសទាំងអស់');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        ដោះលែងទាំងអស់
                      </button>

                      <span className="px-3 py-1 bg-indigo-100 text-indigo-900 font-bold rounded-lg text-xs">
                        បានជ្រើសរើស៖ {selectedBatchReportCardStudentIds.length > 0 ? selectedBatchReportCardStudentIds.length : `${studentsForConcatenatedReportCards.length} (ថ្នាក់បច្ចុប្បន្ន)`} នាក់
                      </span>
                    </div>
                  </div>

                  {/* Student Multi-Select Checkbox Chips */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {filteredBatchReportCardStudents.map((st) => {
                        const isSelected = selectedBatchReportCardStudentIds.includes(st.id);
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedBatchReportCardStudentIds(prev => prev.filter(id => id !== st.id));
                              } else {
                                setSelectedBatchReportCardStudentIds(prev => [...prev, st.id]);
                              }
                            }}
                            className={`flex items-center gap-1.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-2xs'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by button onClick
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 pointer-events-none"
                            />
                            <div className="truncate">
                              <p className="truncate">{st.nameKhmer}</p>
                              <span className="text-[10px] text-slate-500 font-normal">ថ្នាក់ {st.grade}{st.section} • {st.code}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Batch Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        ព្រឹត្តិបត្រនីមួយៗនឹងត្រូវបំបែកទំព័រ (Page Break) ដោយស្វ័យប្រវត្តិកាលណាអ្នកបោះពុម្ព ឬទាញយកជា PDF រួម
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="print-batch-report-cards-btn"
                        onClick={() => {
                          studentsForConcatenatedReportCards.forEach(st => {
                            logReportCardGenerationOrPrint(st, 'printed');
                          });
                          handlePrint();
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>បោះពុម្ពព្រឹត្តិបត្ររួម ({studentsForConcatenatedReportCards.length} សន្លឹក)</span>
                      </button>

                      <button
                        id="download-batch-concatenated-pdf-btn"
                        onClick={() => {
                          studentsForConcatenatedReportCards.forEach(st => {
                            logReportCardGenerationOrPrint(st, 'exported_pdf');
                          });
                          handleDownloadPdf(`កម្រងព្រឹត្តិបត្រពិន្ទុរួម_ថ្នាក់ទី${selectedGrade}${selectedSection}_${studentsForConcatenatedReportCards.length}នាក់`);
                        }}
                        disabled={isExportingPdf}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isExportingPdf ? 'កំពុងបង្កើត...' : `ទាញយក PDF រួម (${studentsForConcatenatedReportCards.length} សន្លឹក)`}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Document Render Area (Supports Single or Concatenated Multi-Student Flow) */}
            {reportCardMode === 'single' ? (
              /* Single Student Document */
              (() => {
                const currentSt = selectedStudentForReportCard || classStudents[0] || students[0];
                if (!currentSt) {
                  return (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold">មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ</p>
                    </div>
                  );
                }

                const stScore = activeScores.find(s => s.studentId === currentSt.id);
                const subjects = stScore?.subjects || {};
                const average = stScore?.average || 0;
                const total = stScore?.totalScore || 0;
                const rank = stScore?.rank || 1;
                const teacherName = teachers.find(t => t.assignedGrade === currentSt.grade)?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់';

                const customTs = signatureRenewalTimestamps[currentSt.id];
                const expiryDays = printSettings?.signatureExpiryDays || 90;
                const expiryDate = calculateSignatureExpiry(customTs || undefined, expiryDays);

                const qrSignatureParams: PrincipalSignatureQRParams = {
                  studentId: currentSt.id,
                  studentCode: currentSt.code,
                  studentNameKhmer: currentSt.nameKhmer,
                  studentNameLatin: currentSt.nameLatin,
                  grade: currentSt.grade,
                  section: currentSt.section,
                  academicYear: schoolProfile.academicYear,
                  monthOrSemester: selectedMonth,
                  schoolCode: schoolProfile.schoolCode,
                  schoolNameKhmer: schoolProfile.nameKhmer,
                  principalName: schoolProfile.principalName,
                  averageScore: average,
                  rank: rank,
                  totalStudents: classStudents.length || students.length,
                  signatureImageUrl: schoolProfile.principalSignatureUrl,
                  customCreatedAt: customTs,
                  expiryDate: expiryDate
                };

                return (
                  <div className="border-2 border-slate-800 p-6 sm:p-8 rounded-2xl bg-white space-y-6 relative overflow-hidden shadow-sm">
                    {/* Angkor Watermark */}
                    <AngkorPageWatermark opacity={0.03} />

                    {/* Header */}
                    <div className="text-center space-y-1 relative z-1">
                      <p className="font-moul text-blue-950 text-sm sm:text-base">ព្រះរាជាណាចក្រកម្ពុជា</p>
                      <p className="font-moul text-blue-950 text-xs sm:text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                      <div className="w-24 h-0.5 bg-blue-900 mx-auto my-2 opacity-60"></div>
                      <h3 className="text-base sm:text-lg font-bold font-moul text-blue-900 pt-1">
                        ព្រឹត្តិបត្រពិន្ទុសិស្សប្រចាំខែ {selectedMonth}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        ឆ្នាំសិក្សា {schoolProfile.academicYear} • {schoolProfile.nameKhmer}
                      </p>
                    </div>

                    {/* Student Identity Card Box */}
                    <div className="bg-slate-50/90 border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs relative z-1">
                      <div className="flex items-center gap-4">
                        {currentSt.photoUrl ? (
                          <img
                            src={currentSt.photoUrl}
                            alt={currentSt.nameKhmer}
                            referrerPolicy="no-referrer"
                            className="w-16 h-20 object-cover rounded-lg border-2 border-slate-300 shadow-2xs"
                          />
                        ) : (
                          <div className="w-16 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                            <Users className="w-6 h-6 mb-1" />
                            <span className="text-[9px]">រូបថត</span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-sm font-bold font-moul text-blue-950">
                            {currentSt.nameKhmer}
                          </p>
                          <p className="font-mono text-slate-600 text-xs uppercase font-semibold">
                            {currentSt.nameLatin || 'STUDENT'}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700 text-[11px] pt-1">
                            <span>អត្តលេខ៖ <strong className="font-mono">{currentSt.code}</strong></span>
                            <span>ភេទ៖ <strong>{currentSt.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</strong></span>
                            <span>ថ្ងៃកំណើត៖ <strong>{currentSt.dob || '---'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-300 sm:pl-6 space-y-1">
                        <p className="text-slate-600">ថ្នាក់ទី៖ <strong className="font-mono text-blue-900 text-sm">{currentSt.grade}{currentSt.section}</strong></p>
                        <p className="text-slate-600">គ្រូបន្ទុក៖ <strong className="text-slate-900">{teacherName}</strong></p>
                        <div className="inline-block bg-blue-900 text-white px-3 py-1 rounded-full text-xs font-bold font-mono mt-1">
                          ចំណាត់ថ្នាក់ទី {rank} / {classStudents.length || students.length}
                        </div>
                      </div>
                    </div>

                    {/* Academic Scores Breakdown Table */}
                    <div className="overflow-x-auto relative z-1">
                      <table className="w-full text-center border-collapse border border-slate-400 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold">
                            <th className="border border-slate-400 p-2 text-left w-12">ល.រ</th>
                            <th className="border border-slate-400 p-2 text-left">មុខវិជ្ជា / សមត្ថភាពសិក្សា</th>
                            <th className="border border-slate-400 p-2 w-24">ពិន្ទុពេញ</th>
                            <th className="border border-slate-400 p-2 w-28">ពិន្ទុទទួលបាន</th>
                            <th className="border border-slate-400 p-2 w-28">និទ្ទេស</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 p-2 font-mono">១</td>
                            <td className="border border-slate-300 p-2 text-left font-semibold">ភាសាខ្មែរ (អំណាន សំណេរ ស្តាប់ និយាយ)</td>
                            <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                            <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                              {subjects.khmerReading !== undefined ? (Number(subjects.khmerReading) + Number(subjects.khmerWriting || 0)) / 2 : (subjects.reading || 8.0)}
                            </td>
                            <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អ</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-2 font-mono">២</td>
                            <td className="border border-slate-300 p-2 text-left font-semibold">គណិតវិទ្យា (ចំនួន រង្វាស់រង្វាល់ ធរណីមាត្រ)</td>
                            <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                            <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                              {subjects.mathematics !== undefined ? subjects.mathematics : (subjects.numbers || 8.5)}
                            </td>
                            <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អ</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-2 font-mono">៣</td>
                            <td className="border border-slate-300 p-2 text-left font-semibold">វិទ្យាសាស្ត្រ និងការសិក្សាសង្គម</td>
                            <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                            <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                              {subjects.scienceSocial !== undefined ? subjects.scienceSocial : (subjects.science || 7.5)}
                            </td>
                            <td className="border border-slate-300 p-2 font-bold text-blue-700">ល្អបង្គួរ</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-2 font-mono">៤</td>
                            <td className="border border-slate-300 p-2 text-left font-semibold">សីលធម៌-ពលរដ្ឋវិជ្ជា និងបំណិនជីវិត</td>
                            <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                            <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                              {subjects.moralCivics || 9.0}
                            </td>
                            <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អណាស់</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-2 font-mono">៥</td>
                            <td className="border border-slate-300 p-2 text-left font-semibold">អប់រំកាយ សុខភាព និងសិល្បៈ</td>
                            <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                            <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                              {subjects.physicalHealth || 8.5}
                            </td>
                            <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អ</td>
                          </tr>
                          <tr className="bg-slate-100/80 font-bold">
                            <td colSpan={2} className="border border-slate-400 p-2 text-right">សរុបពិន្ទុ និងមធ្យមភាគ៖</td>
                            <td className="border border-slate-400 p-2 font-mono">៥០.០</td>
                            <td className="border border-slate-400 p-2 font-mono text-indigo-950 font-bold text-sm">
                              {total > 0 ? total.toFixed(1) : '41.5'} (ម.ភាគ: {average > 0 ? average.toFixed(2) : '8.30'})
                            </td>
                            <td className="border border-slate-400 p-2 font-bold text-blue-950 font-moul">
                              {getFormattedGrade(average || 8.3)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* MoEYS Official 3-Column Signatures with Dedicated QR Slot */}
                    <div className="relative z-1 pt-2">
                      <MoEYSReportCardSignatures
                        guardianName={currentSt.guardianName || '...............................'}
                        teacherName={teacherName}
                        principalName={schoolProfile.principalName}
                        schoolLocation={schoolProfile.district || schoolProfile.province}
                        currentMonthName={selectedMonth}
                        signatureQRParams={qrSignatureParams}
                        showSignatureQR={printSettings?.showPrincipalSignatureQR !== false}
                        signatureQRStyle={printSettings?.signatureQRStyle || 'rounded_modern'}
                      />
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Concatenated Batch Report Cards List (Printed as consecutive A4 pages) */
              <div className="batch-report-cards-container space-y-10 print:space-y-0">
                {studentsForConcatenatedReportCards.map((st, index) => {
                  const stScore = scores.find(
                    s => s.studentId === st.id && s.monthOrSemester === selectedMonth
                  ) || scores.find(s => s.studentId === st.id);

                  const subjects = stScore?.subjects || {};
                  const average = stScore?.average || 8.25;
                  const total = stScore?.totalScore || 41.25;
                  const rank = stScore?.rank || (index + 1);
                  const teacherName = teachers.find(t => t.assignedGrade === st.grade)?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់';

                  const customTs = signatureRenewalTimestamps[st.id];
                  const expiryDays = printSettings?.signatureExpiryDays || 90;
                  const expiryDate = calculateSignatureExpiry(customTs || undefined, expiryDays);

                  const qrSignatureParams: PrincipalSignatureQRParams = {
                    studentId: st.id,
                    studentCode: st.code,
                    studentNameKhmer: st.nameKhmer,
                    studentNameLatin: st.nameLatin,
                    grade: st.grade,
                    section: st.section,
                    academicYear: schoolProfile.academicYear,
                    monthOrSemester: selectedMonth,
                    schoolCode: schoolProfile.schoolCode,
                    schoolNameKhmer: schoolProfile.nameKhmer,
                    principalName: schoolProfile.principalName,
                    averageScore: average,
                    rank: rank,
                    totalStudents: studentsForConcatenatedReportCards.length,
                    signatureImageUrl: schoolProfile.principalSignatureUrl,
                    customCreatedAt: customTs,
                    expiryDate: expiryDate
                  };

                  return (
                    <div
                      key={st.id}
                      className="border-2 border-slate-800 p-6 sm:p-8 rounded-2xl bg-white space-y-6 relative overflow-hidden shadow-sm print:shadow-none print:border-2 print:border-slate-900 print:p-8 print:m-0 print:rounded-none print:break-after-page print:page-break-after-always"
                      style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
                    >
                      {/* Angkor Watermark */}
                      <AngkorPageWatermark opacity={0.03} />

                      {/* Header */}
                      <div className="text-center space-y-1 relative z-1">
                        <p className="font-moul text-blue-950 text-sm sm:text-base">ព្រះរាជាណាចក្រកម្ពុជា</p>
                        <p className="font-moul text-blue-950 text-xs sm:text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                        <div className="w-24 h-0.5 bg-blue-900 mx-auto my-2 opacity-60"></div>
                        <h3 className="text-base sm:text-lg font-bold font-moul text-blue-900 pt-1">
                          ព្រឹត្តិបត្រពិន្ទុសិស្សប្រចាំខែ {selectedMonth}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          ឆ្នាំសិក្សា {schoolProfile.academicYear} • {schoolProfile.nameKhmer}
                        </p>
                      </div>

                      {/* Student Identity Card Box */}
                      <div className="bg-slate-50/90 border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs relative z-1">
                        <div className="flex items-center gap-4">
                          {st.photoUrl ? (
                            <img
                              src={st.photoUrl}
                              alt={st.nameKhmer}
                              referrerPolicy="no-referrer"
                              className="w-16 h-20 object-cover rounded-lg border-2 border-slate-300 shadow-2xs"
                            />
                          ) : (
                            <div className="w-16 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                              <Users className="w-6 h-6 mb-1" />
                              <span className="text-[9px]">រូបថត</span>
                            </div>
                          )}

                          <div className="space-y-1">
                            <p className="text-sm font-bold font-moul text-blue-950">
                              {st.nameKhmer}
                            </p>
                            <p className="font-mono text-slate-600 text-xs uppercase font-semibold">
                              {st.nameLatin || 'STUDENT'}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700 text-[11px] pt-1">
                              <span>អត្តលេខ៖ <strong className="font-mono">{st.code}</strong></span>
                              <span>ភេទ៖ <strong>{st.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</strong></span>
                              <span>ថ្ងៃកំណើត៖ <strong>{st.dob || '---'}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:border-slate-300 sm:pl-6 space-y-1">
                          <p className="text-slate-600">ថ្នាក់ទី៖ <strong className="font-mono text-blue-900 text-sm">{st.grade}{st.section}</strong></p>
                          <p className="text-slate-600">គ្រូបន្ទុក៖ <strong className="text-slate-900">{teacherName}</strong></p>
                          <div className="inline-block bg-blue-900 text-white px-3 py-1 rounded-full text-xs font-bold font-mono mt-1">
                            ចំណាត់ថ្នាក់ទី {rank} / {studentsForConcatenatedReportCards.length}
                          </div>
                        </div>
                      </div>

                      {/* Academic Scores Breakdown Table */}
                      <div className="overflow-x-auto relative z-1">
                        <table className="w-full text-center border-collapse border border-slate-400 text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold">
                              <th className="border border-slate-400 p-2 text-left w-12">ល.រ</th>
                              <th className="border border-slate-400 p-2 text-left">មុខវិជ្ជា / សមត្ថភាពសិក្សា</th>
                              <th className="border border-slate-400 p-2 w-24">ពិន្ទុពេញ</th>
                              <th className="border border-slate-400 p-2 w-28">ពិន្ទុទទួលបាន</th>
                              <th className="border border-slate-400 p-2 w-28">និទ្ទេស</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-slate-300 p-2 font-mono">១</td>
                              <td className="border border-slate-300 p-2 text-left font-semibold">ភាសាខ្មែរ (អំណាន សំណេរ ស្តាប់ និយាយ)</td>
                              <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                              <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                                {subjects.khmerReading !== undefined ? (Number(subjects.khmerReading) + Number(subjects.khmerWriting || 0)) / 2 : (subjects.reading || 8.0)}
                              </td>
                              <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អ</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 p-2 font-mono">២</td>
                              <td className="border border-slate-300 p-2 text-left font-semibold">គណិតវិទ្យា (ចំនួន រង្វាស់រង្វាល់ ធរណីមាត្រ)</td>
                              <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                              <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                                {subjects.mathematics !== undefined ? subjects.mathematics : (subjects.numbers || 8.5)}
                              </td>
                              <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អ</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 p-2 font-mono">៣</td>
                              <td className="border border-slate-300 p-2 text-left font-semibold">វិទ្យាសាស្ត្រ និងការសិក្សាសង្គម</td>
                              <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                              <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                                {subjects.scienceSocial !== undefined ? subjects.scienceSocial : (subjects.science || 7.5)}
                              </td>
                              <td className="border border-slate-300 p-2 font-bold text-blue-700">ល្អបង្គួរ</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 p-2 font-mono">៤</td>
                              <td className="border border-slate-300 p-2 text-left font-semibold">សីលធម៌-ពលរដ្ឋវិជ្ជា និងបំណិនជីវិត</td>
                              <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                              <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                                {subjects.moralCivics || 9.0}
                              </td>
                              <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អណាស់</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 p-2 font-mono">៥</td>
                              <td className="border border-slate-300 p-2 text-left font-semibold">អប់រំកាយ សុខភាព និងសិល្បៈ</td>
                              <td className="border border-slate-300 p-2 font-mono">១០.០</td>
                              <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                                {subjects.physicalHealth || 8.5}
                              </td>
                              <td className="border border-slate-300 p-2 font-bold text-emerald-700">ល្អ</td>
                            </tr>
                            <tr className="bg-slate-100/80 font-bold">
                              <td colSpan={2} className="border border-slate-400 p-2 text-right">សរុបពិន្ទុ និងមធ្យមភាគ៖</td>
                              <td className="border border-slate-400 p-2 font-mono">៥០.០</td>
                              <td className="border border-slate-400 p-2 font-mono text-indigo-950 font-bold text-sm">
                                {total > 0 ? total.toFixed(1) : '41.5'} (ម.ភាគ: {average > 0 ? average.toFixed(2) : '8.30'})
                              </td>
                              <td className="border border-slate-400 p-2 font-bold text-blue-950 font-moul">
                                {getFormattedGrade(average || 8.3)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* MoEYS Official 3-Column Signatures with Dedicated QR Slot */}
                      <div className="relative z-1 pt-2">
                        <MoEYSReportCardSignatures
                          guardianName={st.guardianName || '...............................'}
                          teacherName={teacherName}
                          principalName={schoolProfile.principalName}
                          schoolLocation={schoolProfile.district || schoolProfile.province}
                          currentMonthName={selectedMonth}
                          signatureQRParams={qrSignatureParams}
                          showSignatureQR={printSettings?.showPrincipalSignatureQR !== false}
                          signatureQRStyle={printSettings?.signatureQRStyle || 'rounded_modern'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 10. Audit History of Scanned QR Code Verifications */}
        {activeReportType === 'scan_history' && (
          <div className="space-y-6">
            {/* Header and Statistics KPIs */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-md no-print">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base font-bold font-moul text-white">
                      ប្រវត្តិស្កេន និងផ្ទៀងផ្ទាត់ហត្ថលេខាឌីជីថល (QR Audit Logs)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    តាមដានកាលបរិច្ឆេទ ឧបករណ៍ស្កេន ភាពត្រឹមត្រូវ និងសុពលភាពនៃព្រឹត្តិបត្រពិន្ទុដែលត្រូវបានស្កេនផ្ទៀងផ្ទាត់
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWebcamScannerOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 animate-pulse" />
                    <span>បើកម៉ាស៊ីនស្កេន Camera</span>
                  </button>

                  <button
                    onClick={() => {
                      if (qrScanVerificationLogs.length === 0) {
                        showToast('មិនទាន់មានប្រវត្តិស្កេនសម្រាប់នាំចេញទេ', 'info');
                        return;
                      }
                      let csv = 'កាលបរិច្ឆេទ,ម៉ោង,ស្ថានភាព,អត្តលេខសិស្ស,ឈ្មោះខ្មែរ,ថ្នាក់,កូដហត្ថលេខា,ឧបករណ៍ស្កេន,ប្រព័ន្ធប្រតិបត្តិការ\n';
                      qrScanVerificationLogs.forEach(l => {
                        csv += `"${new Date(l.scannedAt).toLocaleDateString('km-KH')}","${new Date(l.scannedAt).toLocaleTimeString('km-KH')}",${l.status === 'valid' ? 'ត្រឹមត្រូវ' : l.status === 'expired' ? 'ផុតកំណត់' : 'មិនត្រឹមត្រូវ'},"${l.studentCode || ''}","${l.studentName || ''}",${l.grade || ''}${l.section || ''},"${l.signatureCode || ''}","${l.deviceInfo.browser || ''}","${l.deviceInfo.os || ''}"\n`;
                      });
                      downloadExcelFile(`MoEYS_QR_Scan_Audit_Logs_${new Date().toISOString().slice(0, 10)}`, csv);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>នាំចេញ Excel</span>
                  </button>

                  {qrScanVerificationLogs.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('តើអ្នកពិតជាចង់សម្អាតប្រវត្តិស្កេន QR ទាំងអស់មែនទេ?')) {
                          clearQRScanVerificationLogs();
                          showToast('បានសម្អាតប្រវត្តិស្កេនទាំងអស់ជោគជ័យ');
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      title="សម្អាតកំណត់ត្រាទាំងអស់"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>សម្អាតទាំងអស់</span>
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Status Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">ស្កេនសរុប</p>
                    <p className="text-lg font-bold font-mono">{qrScanVerificationLogs.length} ដង</p>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">ហត្ថលេខាត្រឹមត្រូវ</p>
                    <p className="text-lg font-bold font-mono text-emerald-400">
                      {qrScanVerificationLogs.filter(l => l.status === 'valid').length}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">ហត្ថលេខាផុតកំណត់</p>
                    <p className="text-lg font-bold font-mono text-amber-400">
                      {qrScanVerificationLogs.filter(l => l.status === 'expired').length}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">មិនត្រឹមត្រូវ/ក្លែងបន្លំ</p>
                    <p className="text-lg font-bold font-mono text-rose-400">
                      {qrScanVerificationLogs.filter(l => l.status === 'tampered' || l.status === 'invalid').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar (no-print) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600">ត្រងតាមស្ថានភាព៖</span>
                {(['all', 'valid', 'expired', 'tampered', 'invalid'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setScanHistoryStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      scanHistoryStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' && `ទាំងអស់ (${qrScanVerificationLogs.length})`}
                    {st === 'valid' && `ត្រឹមត្រូវ (${qrScanVerificationLogs.filter(l => l.status === 'valid').length})`}
                    {st === 'expired' && `ផុតកំណត់ (${qrScanVerificationLogs.filter(l => l.status === 'expired').length})`}
                    {st === 'tampered' && `កែប្រែក្លែងបន្លំ (${qrScanVerificationLogs.filter(l => l.status === 'tampered').length})`}
                    {st === 'invalid' && `មិនត្រឹមត្រូវ (${qrScanVerificationLogs.filter(l => l.status === 'invalid').length})`}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={scanHistorySearch}
                  onChange={(e) => setScanHistorySearch(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, កូដ, ឧបករណ៍..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-60 focus:w-72 focus:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Audit Logs Table / List */}
            {(() => {
              const filteredLogs = qrScanVerificationLogs.filter(log => {
                if (scanHistoryStatusFilter !== 'all' && log.status !== scanHistoryStatusFilter) {
                  return false;
                }
                if (scanHistorySearch.trim()) {
                  const q = scanHistorySearch.toLowerCase().trim();
                  const matchStudent = (log.studentName && log.studentName.toLowerCase().includes(q)) ||
                                       (log.studentCode && log.studentCode.toLowerCase().includes(q));
                  const matchSig = log.signatureCode && log.signatureCode.toLowerCase().includes(q);
                  const matchDevice = (log.deviceInfo.browser && log.deviceInfo.browser.toLowerCase().includes(q)) ||
                                      (log.deviceInfo.os && log.deviceInfo.os.toLowerCase().includes(q)) ||
                                      (log.deviceInfo.deviceType && log.deviceInfo.deviceType.toLowerCase().includes(q));
                  if (!matchStudent && !matchSig && !matchDevice) return false;
                }
                return true;
              });

              if (filteredLogs.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                    <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">មិនមានកំណត់ត្រាស្កេនផ្ទៀងផ្ទាត់ QR ទេ</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      នៅពេលមានការស្កេន QR Code លើព្រឹត្តិបត្រពិន្ទុតាម Webcam Scanner ឬកម្មវិធីផ្ទៀងផ្ទាត់ ប្រព័ន្ធនឹងកត់ត្រាព័ត៌មានឧបករណ៍ កាលបរិច្ឆេទ និងស្ថានភាពសុពលភាពនៅទីនេះដោយស្វ័យប្រវត្តិ។
                    </p>
                    <button
                      onClick={() => setIsWebcamScannerOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>សាកល្បងស្កេនឥឡូវនេះ</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="py-3 px-4">កាលបរិច្ឆេទ & ម៉ោង</th>
                          <th className="py-3 px-4">ស្ថានភាពផ្ទៀងផ្ទាត់</th>
                          <th className="py-3 px-4">សិស្ស / ម្ចាស់ឯកសារ</th>
                          <th className="py-3 px-4">ថ្នាក់ / មធ្យមភាគ</th>
                          <th className="py-3 px-4">កូដហត្ថលេខាឌីជីថល</th>
                          <th className="py-3 px-4">ឧបករណ៍ & Browser</th>
                          <th className="py-3 px-4 text-right">សកម្មភាព</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLogs.map(log => {
                          const dateObj = new Date(log.scannedAt);
                          const formattedDate = dateObj.toLocaleDateString('km-KH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                          const formattedTime = dateObj.toLocaleTimeString('km-KH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });

                          return (
                            <tr key={log.id} className="hover:bg-slate-50/70 transition-all">
                              {/* Scanned Timestamp */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <p className="font-bold text-slate-800">{formattedDate}</p>
                                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {formattedTime}
                                </span>
                              </td>

                              {/* Verification Status */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {log.status === 'valid' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>ត្រឹមត្រូវផ្លូវការ</span>
                                  </span>
                                )}
                                {log.status === 'expired' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[11px]">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>ហត្ថលេខាផុតកំណត់</span>
                                  </span>
                                )}
                                {log.status === 'tampered' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full font-bold text-[11px]">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>កែប្រែក្លែងបន្លំ</span>
                                  </span>
                                )}
                                {log.status === 'invalid' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-bold text-[11px]">
                                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                                    <span>QR មិនត្រឹមត្រូវ</span>
                                  </span>
                                )}
                              </td>

                              {/* Student info */}
                              <td className="py-3 px-4">
                                {log.studentName ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                                      {log.studentName.slice(0, 1)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{log.studentName}</p>
                                      <span className="text-[11px] text-slate-500 font-mono">អត្តលេខ: {log.studentCode || '---'}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">មិនមានឈ្មោះសិស្ស</span>
                                )}
                              </td>

                              {/* Grade & Score */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {log.grade ? (
                                  <div>
                                    <span className="font-semibold text-slate-800">ថ្នាក់ទី {log.grade}{log.section}</span>
                                    {log.averageScore !== undefined && (
                                      <p className="text-[11px] text-indigo-700 font-bold font-mono">
                                        ម.ភាគ: {log.averageScore.toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">---</span>
                                )}
                              </td>

                              {/* Signature Code & Principal */}
                              <td className="py-3 px-4">
                                {log.signatureCode ? (
                                  <div>
                                    <code className="text-[11px] font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                      {log.signatureCode}
                                    </code>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      នាយក: {log.principalName || schoolProfile.principalName}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">---</span>
                                )}
                              </td>

                              {/* Device & Browser info */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5 text-[11px] text-slate-600">
                                  <div className="flex items-center gap-1 font-medium text-slate-800">
                                    <Laptop className="w-3 h-3 text-slate-500" />
                                    <span>{log.deviceInfo.deviceType || 'Device'} • {log.deviceInfo.browser || 'Browser'}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500">
                                    {log.deviceInfo.os} ({log.deviceInfo.screenResolution})
                                  </p>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* If student exists, offer quick report card regeneration */}
                                  {log.studentId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const targetSt = students.find(s => s.id === log.studentId);
                                        if (targetSt) {
                                          setSelectedStudentForReportCard(targetSt);
                                          // Refresh signature timestamp
                                          const nowIso = new Date().toISOString();
                                          setSignatureRenewalTimestamps(prev => ({
                                            ...prev,
                                            [targetSt.id]: nowIso
                                          }));
                                          setActiveReportType('report_cards');
                                          showToast(`បានបើកព្រឹត្តិបត្រពិន្ទុ និងបង្កើត QR ហត្ថលេខាថ្មីសម្រាប់ «${targetSt.nameKhmer}»`);
                                        }
                                      }}
                                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all cursor-pointer"
                                      title="បង្កើតព្រឹត្តិបត្រពិន្ទុឡើងវិញជាមួយ QR ថ្មី (Re-generate fresh document)"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Delete Log item */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteQRScanVerificationLog(log.id);
                                      showToast('បានលុបកំណត់ត្រាស្កេននេះជោគជ័យ');
                                    }}
                                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                                    title="លុបកំណត់ត្រានេះ"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Official Signature Footer for Standard Reports (Census, Scores, Finance, Staff, Profile) */}
        {activeReportType !== 'report_cards' && activeReportType !== 'scan_history' && (
          <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-300 text-xs">
            <div className="text-center">
              <p>បានពិនិត្យ និងឯកភាព</p>
              <p className="font-bold text-slate-800 mt-1">ប្រធានការិយាល័យអប់រំ ក្រុង/ស្រុក</p>
              <div className="h-16" />
              <p className="text-slate-400">................................................</p>
            </div>

            <div className="text-center flex flex-col items-center">
              <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ២០២៤</p>
              <p className="font-bold font-moul text-slate-900 mt-1">នាយិកាសាលា</p>
              
              {/* QR Code / Placeholder Digital Seal */}
              <div className="min-h-16 my-2 flex items-center justify-center">
                {printSettings?.showPrincipalSignatureQR !== false ? (
                  <PrincipalSignatureQRSlot
                    params={{
                      studentId: 'OFFICIAL_REPORT',
                      studentCode: schoolProfile.schoolCode,
                      studentNameKhmer: schoolProfile.nameKhmer,
                      grade: selectedGrade,
                      section: selectedSection,
                      academicYear: schoolProfile.academicYear,
                      monthOrSemester: selectedMonth,
                      schoolCode: schoolProfile.schoolCode,
                      schoolNameKhmer: schoolProfile.nameKhmer,
                      principalName: schoolProfile.principalName,
                      signatureImageUrl: schoolProfile.principalSignatureUrl
                    }}
                    size={64}
                    showBorder={true}
                    showVerificationText={true}
                    styleType={printSettings?.signatureQRStyle || 'rounded_modern'}
                  />
                ) : (
                  <div className="h-16" />
                )}
              </div>

              <p className="font-bold text-slate-900">{schoolProfile.principalName}</p>
            </div>
          </div>
        )}
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

      {/* MoEYS Standard Master Student Record Modal */}
      {isMoeyMasterModalOpen && (
        <MoEYSStudentRecordMasterModal
          students={students}
          schoolProfile={schoolProfile}
          initialGrade={selectedGrade}
          onClose={() => setIsMoeyMasterModalOpen(false)}
        />
      )}
    </div>
  );
};
