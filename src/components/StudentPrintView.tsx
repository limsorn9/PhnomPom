import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile, Teacher } from '../types';
import {
  AngkorPageWatermark,
  MoEYSRoyalHeader,
  SchoolStampCirclePlaceholder,
  getKhmerSolarDate,
  getKhmerLunarDate,
  toKhmerNumber
} from './AngkorMotif';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';
import {
  Printer,
  X,
  Download,
  FileText,
  Sliders,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Layout,
  Maximize2,
  FileSpreadsheet,
  CheckCircle2,
  Phone,
  MapPin,
  Heart
} from 'lucide-react';

interface StudentPrintViewProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  teachers?: Teacher[];
  selectedGrade: number | 'all';
  selectedVulnerability?: string;
  onClose: () => void;
}

export const StudentPrintView: React.FC<StudentPrintViewProps> = ({
  students,
  schoolProfile,
  teachers = [],
  selectedGrade,
  selectedVulnerability = 'all',
  onClose
}) => {
  // Print Configuration Options
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fontSize, setFontSize] = useState<'compact' | 'normal' | 'comfortable'>('normal');
  const [showLatinName, setShowLatinName] = useState(true);
  const [showDob, setShowDob] = useState(true);
  const [showPob, setShowPob] = useState(orientation === 'landscape');
  const [showAddress, setShowAddress] = useState(orientation === 'landscape');
  const [showGuardian, setShowGuardian] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showStatus, setShowStatus] = useState(true);
  const [showHealthBmi, setShowHealthBmi] = useState(false);
  const [showRemarks, setShowRemarks] = useState(true);
  const [showStamp, setShowStamp] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Derive default homeroom teacher if single grade is selected
  const defaultTeacherName = useMemo(() => {
    if (selectedGrade !== 'all') {
      const match = teachers.find(t => t.assignedGrade === selectedGrade);
      if (match) return match.nameKhmer;
    }
    return teachers[0]?.nameKhmer || 'អ្នកគ្រូ ពេជ្រ ធីតា';
  }, [selectedGrade, teachers]);

  const [teacherSignName, setTeacherSignName] = useState(defaultTeacherName);
  const [principalSignName, setPrincipalSignName] = useState(schoolProfile.principalName || 'ស៊ុន ពិសិដ្ឋ');

  // Statistics calculation
  const stats = useMemo(() => {
    const total = students.length;
    const female = students.filter(s => s.gender === 'F').length;
    const male = total - female;
    const repeater = students.filter(s => s.academicHistory === 'ត្រួតថ្នាក់').length;
    const promoted = total - repeater;
    const idpoor = students.filter(s => s.livingCondition === 'ក្រ១' || s.livingCondition === 'ក្រ២' || s.idPoorCardNumber).length;
    const scholarship = students.filter(s => s.scholarship && s.scholarship !== 'មិនមាន').length;
    const disability = students.filter(s => s.disability && s.disability !== 'មិនពិការ').length;
    const orphan = students.filter(s => s.orphanStatus && s.orphanStatus !== 'មិនកំព្រា').length;

    return { total, female, male, repeater, promoted, idpoor, scholarship, disability, orphan };
  }, [students]);

  const gradeTitle = useMemo(() => {
    if (selectedGrade === 'all') return 'គ្រប់កម្រិតថ្នាក់ (ថ្នាក់ទី ១ ដល់ ទី ៦)';
    return `ថ្នាក់ទី ${selectedGrade}`;
  }, [selectedGrade]);

  const documentTitle = `បញ្ជីរាយនាមសិស្ស_${(schoolProfile.nameKhmer || 'សាលារៀន').replace(/\s+/g, '_')}_${gradeTitle.replace(/\s+/g, '_')}`;

  const handlePrint = async () => {
    await printElement('student-print-sheet-container', {
      landscape: orientation === 'landscape',
      pageTitle: `បញ្ជីរាយនាមសិស្ស ${gradeTitle} - ${schoolProfile.nameKhmer}`
    });
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadElementAsPdf('student-print-sheet-container', `${documentTitle}.pdf`, {
        landscape: orientation === 'landscape',
        format: 'a4',
        scale: 2
      });
    } catch (e) {
      console.error('PDF Export Error:', e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Font and sizing classes
  const textClasses = {
    compact: {
      tableText: 'text-[10px] leading-tight',
      cellPadding: 'py-1 px-1.5',
      headingSize: 'text-sm',
      subHeading: 'text-[11px]'
    },
    normal: {
      tableText: 'text-[11px] sm:text-xs leading-normal',
      cellPadding: 'py-1.5 px-2',
      headingSize: 'text-base sm:text-lg',
      subHeading: 'text-xs sm:text-sm'
    },
    comfortable: {
      tableText: 'text-xs sm:text-sm leading-relaxed',
      cellPadding: 'py-2 px-2.5',
      headingSize: 'text-lg sm:text-xl',
      subHeading: 'text-sm sm:text-base'
    }
  }[fontSize];

  return (
    <div className="min-h-screen bg-slate-200/90 py-4 sm:py-6 px-2 sm:px-4 font-battambang print:p-0 print:m-0 print:bg-white">
      {/* Top Floating Controls Bar (Hidden during printing) */}
      <div className="max-w-6xl mx-auto mb-4 no-print">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-300 space-y-4">
          {/* Main Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ត្រឡប់ទៅបញ្ជីទូទៅ</span>
              </button>
              <div>
                <h3 className="font-moul text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600 inline" />
                  ទម្រង់បោះពុម្ពបញ្ជីរាយនាមសិស្ស A4
                </h3>
                <p className="text-xs text-slate-500">
                  {gradeTitle} • សរុប {stats.total} នាក់ (ស្រី {stats.female} នាក់) • ឆ្នាំសិក្សា {schoolProfile.academicYear}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                title="បោះពុម្ពឯកសារចេញទៅម៉ាស៊ីនបោះពុម្ព"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពភ្លាមៗ (Print A4)</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                title="ទាញយកជាឯកសារ PDF"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPdf ? 'កំពុងបង្កើត PDF...' : 'ទាញយកជា PDF'}</span>
              </button>

              <button
                onClick={() => setShowControls(!showControls)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>{showControls ? 'លាក់ជម្រើសកំណត់' : 'ជម្រើសកំណត់បោះពុម្ព'}</span>
              </button>
            </div>
          </div>

          {/* Expandable Customization Settings */}
          {showControls && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs text-slate-700">
              {/* Orientation & Sizing */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">ទម្រង់ក្រដាស & ទំហំអក្សរ៖</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setOrientation('portrait');
                      setShowPob(false);
                      setShowAddress(false);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                      orientation === 'portrait'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    📄 បញ្ឈរ (Portrait)
                  </button>
                  <button
                    onClick={() => {
                      setOrientation('landscape');
                      setShowPob(true);
                      setShowAddress(true);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                      orientation === 'landscape'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    📃 ផ្ដេក (Landscape)
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-slate-500 whitespace-nowrap">ទំហំអក្សរ:</span>
                  <select
                    value={fontSize}
                    onChange={(e: any) => setFontSize(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800"
                  >
                    <option value="compact">តូចណែន (Compact - សម្រាប់សិស្សច្រើន)</option>
                    <option value="normal">ស្តង់ដារ (Standard MoEYS)</option>
                    <option value="comfortable">ធំល្មម (Comfortable)</option>
                  </select>
                </div>
              </div>

              {/* Column Visibility Toggles */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">ជ្រើសរើសជួរឈរ (Columns)៖</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showLatinName}
                      onChange={e => setShowLatinName(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ឈ្មោះឡាតាំង</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showDob}
                      onChange={e => setShowDob(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ថ្ងៃខែឆ្នាំកំណើត</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPob}
                      onChange={e => setShowPob(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ទីកន្លែងកំណើត</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showAddress}
                      onChange={e => setShowAddress(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>អាសយដ្ឋានបច្ចុប្បន្ន</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showGuardian}
                      onChange={e => setShowGuardian(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>អាណាព្យាបាល</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPhone}
                      onChange={e => setShowPhone(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>លេខទូរស័ព្ទ</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showStatus}
                      onChange={e => setShowStatus(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ស្ថានភាព/ជីវភាព</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showRemarks}
                      onChange={e => setShowRemarks(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ផ្សេងៗ / សម្គាល់</span>
                  </label>
                </div>
              </div>

              {/* Administrative Details & Signatures */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">ហត្ថលេខា & ត្រារដ្ឋបាល៖</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-slate-500 mb-0.5">នាយក/នាយិកាសាលា:</label>
                    <input
                      type="text"
                      value={principalSignName}
                      onChange={e => setPrincipalSignName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">គ្រូបន្ទុកថ្នាក់/អ្នករៀបចំ:</label>
                    <input
                      type="text"
                      value={teacherSignName}
                      onChange={e => setTeacherSignName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showStamp}
                      onChange={e => setShowStamp(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>រង្វង់ត្រាសាលា</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={e => setShowWatermark(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>រូបសញ្ញាអង្គរវត្ត Watermark</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Printable A4 Canvas Container */}
      <div className="flex justify-center">
        <div
          id="student-print-sheet-container"
          className={`bg-white text-slate-900 shadow-2xl rounded-sm p-6 sm:p-10 border border-slate-300 relative overflow-hidden transition-all ${
            orientation === 'landscape' ? 'w-full max-w-[297mm]' : 'w-full max-w-[210mm]'
          }`}
          style={{ minHeight: orientation === 'landscape' ? '210mm' : '297mm' }}
        >
          {/* Subtle Angkor Watermark Background */}
          {showWatermark && <AngkorPageWatermark opacity={0.035} />}

          {/* Official Ministry & Kingdom Header */}
          <div className="relative z-10 mb-4 pb-3 border-b-2 border-slate-800">
            <div className="flex justify-between items-start gap-4">
              {/* Left Institution Block */}
              <div className="text-left space-y-0.5">
                <p className="font-bold text-xs sm:text-sm text-slate-900 tracking-wide">
                  ក្រសួងអប់រំ យុវជន និងកីឡា
                </p>
                <p className="text-[11px] sm:text-xs text-slate-800">
                  មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province || 'ខេត្តបាត់ដំបង'}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-800">
                  ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district || 'ស្រុកភ្នំព្រឹក'}
                </p>
                <p className="font-moul text-xs sm:text-sm text-blue-950 pt-0.5">
                  {schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ'}
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  កូដសាលា: {schoolProfile.schoolCode || '02040501'}
                </p>
              </div>

              {/* Right Kingdom & Motto Header */}
              <div className="text-center space-y-0.5">
                <MoEYSRoyalHeader />
                <p className="text-[10px] text-slate-500 font-battambang mt-1">
                  ស្តង់ដារសាលាបឋមសិក្សាគំរូ
                </p>
              </div>
            </div>

            {/* Document Main Heading */}
            <div className="text-center mt-3 pt-2">
              <h1 className={`font-moul text-slate-950 leading-tight ${textClasses.headingSize}`}>
                បញ្ជីរាយនាមសិស្សានុសិស្ស {gradeTitle}
              </h1>
              <p className="font-bold text-xs sm:text-sm text-slate-700 mt-0.5">
                ឆ្នាំសិក្សា ៖ <span className="font-times">{schoolProfile.academicYear || '២០២៥-២០២៦'}</span>
              </p>
            </div>

            {/* Statistics Summary Chips Strip */}
            <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700 bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  សរុប៖ <strong className="font-times font-bold text-slate-900">{toKhmerNumber(stats.total)}</strong> នាក់
                </span>
                <span>•</span>
                <span>
                  ស្រី៖ <strong className="font-times font-bold text-rose-700">{toKhmerNumber(stats.female)}</strong> នាក់
                </span>
                <span>•</span>
                <span>
                  ប្រុស៖ <strong className="font-times font-bold text-blue-700">{toKhmerNumber(stats.male)}</strong> នាក់
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-[11px]">
                {stats.repeater > 0 && (
                  <span className="text-slate-600">
                    ត្រួតថ្នាក់: <strong>{toKhmerNumber(stats.repeater)}</strong>
                  </span>
                )}
                {stats.idpoor > 0 && (
                  <span className="text-amber-800">
                    ក្រ១/ក្រ២: <strong>{toKhmerNumber(stats.idpoor)}</strong>
                  </span>
                )}
                {stats.scholarship > 0 && (
                  <span className="text-purple-800">
                    អាហារូបករណ៍: <strong>{toKhmerNumber(stats.scholarship)}</strong>
                  </span>
                )}
                {stats.disability > 0 && (
                  <span className="text-teal-800">
                    ពិការភាព: <strong>{toKhmerNumber(stats.disability)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Formatted A4 Student Data Table */}
          <div className="relative z-10 overflow-x-auto">
            <table className={`w-full border-collapse border border-slate-800 text-slate-900 ${textClasses.tableText}`}>
              <thead>
                <tr className="bg-slate-100/90 text-slate-950 font-bold border-b border-slate-800 text-center">
                  <th className={`border border-slate-800 ${textClasses.cellPadding} w-8`}>ល.រ</th>
                  <th className={`border border-slate-800 ${textClasses.cellPadding} w-16 whitespace-nowrap`}>អត្តលេខ</th>
                  <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[130px]`}>
                    គោត្តនាម និងនាម
                  </th>
                  {showLatinName && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[110px]`}>
                      ឈ្មោះឡាតាំង
                    </th>
                  )}
                  <th className={`border border-slate-800 ${textClasses.cellPadding} w-12`}>ភេទ</th>
                  {showDob && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 whitespace-nowrap`}>
                      ថ្ងៃខែឆ្នាំកំណើត
                    </th>
                  )}
                  <th className={`border border-slate-800 ${textClasses.cellPadding} w-16`}>ថ្នាក់</th>
                  {showPob && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[100px]`}>
                      ទីកន្លែងកំណើត
                    </th>
                  )}
                  {showAddress && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[100px]`}>
                      អាសយដ្ឋាន
                    </th>
                  )}
                  {showGuardian && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[110px]`}>
                      អាណាព្យាបាល
                    </th>
                  )}
                  {showPhone && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} w-24 text-center whitespace-nowrap`}>
                      លេខទូរស័ព្ទ
                    </th>
                  )}
                  {showStatus && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 text-center`}>
                      ស្ថានភាព
                    </th>
                  )}
                  {showHealthBmi && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} w-16 text-center`}>
                      BMI
                    </th>
                  )}
                  {showRemarks && (
                    <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 text-center`}>
                      ផ្សេងៗ / សម្គាល់
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student, idx) => {
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={student.id}
                        className={`${isEven ? 'bg-slate-50/60' : 'bg-white'} border-b border-slate-700 hover:bg-blue-50/30`}
                      >
                        <td className={`border border-slate-700 text-center font-times ${textClasses.cellPadding}`}>
                          {idx + 1}
                        </td>
                        <td className={`border border-slate-700 text-center font-times font-semibold text-blue-900 ${textClasses.cellPadding}`}>
                          {student.code}
                        </td>
                        <td className={`border border-slate-700 font-bold text-slate-950 ${textClasses.cellPadding}`}>
                          {student.nameKhmer}
                        </td>
                        {showLatinName && (
                          <td className={`border border-slate-700 font-times text-slate-700 ${textClasses.cellPadding}`}>
                            {student.nameLatin || '-'}
                          </td>
                        )}
                        <td className={`border border-slate-700 text-center font-semibold ${textClasses.cellPadding} ${
                          student.gender === 'F' ? 'text-rose-700' : 'text-blue-800'
                        }`}>
                          {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                        </td>
                        {showDob && (
                          <td className={`border border-slate-700 text-center font-times ${textClasses.cellPadding}`}>
                            {student.dob}
                          </td>
                        )}
                        <td className={`border border-slate-700 text-center font-bold ${textClasses.cellPadding}`}>
                          {student.grade}{student.section || ''}
                        </td>
                        {showPob && (
                          <td className={`border border-slate-700 text-[10px] leading-tight text-slate-600 ${textClasses.cellPadding}`}>
                            {student.pob || student.pobProvince || '-'}
                          </td>
                        )}
                        {showAddress && (
                          <td className={`border border-slate-700 text-[10px] leading-tight text-slate-600 ${textClasses.cellPadding}`}>
                            {student.address || student.currentVillage || '-'}
                          </td>
                        )}
                        {showGuardian && (
                          <td className={`border border-slate-700 text-slate-800 ${textClasses.cellPadding}`}>
                            {student.guardianName || student.fatherName || student.motherName || '-'}
                          </td>
                        )}
                        {showPhone && (
                          <td className={`border border-slate-700 text-center font-times text-[10px] ${textClasses.cellPadding}`}>
                            {student.guardianPhone || student.phone || '-'}
                          </td>
                        )}
                        {showStatus && (
                          <td className={`border border-slate-700 text-center ${textClasses.cellPadding}`}>
                            {student.livingCondition === 'ក្រ១' && (
                              <span className="font-bold text-rose-700">ក្រ១</span>
                            )}
                            {student.livingCondition === 'ក្រ២' && (
                              <span className="font-bold text-amber-700">ក្រ២</span>
                            )}
                            {student.scholarship && student.scholarship !== 'មិនមាន' && (
                              <span className="font-bold text-purple-700 block text-[10px]">អាហារូបករណ៍</span>
                            )}
                            {student.academicHistory === 'ត្រួតថ្នាក់' && (
                              <span className="font-bold text-slate-800 block text-[10px]">ត្រួតថ្នាក់</span>
                            )}
                            {(!student.livingCondition || student.livingCondition === 'ទូទៅ') &&
                              (!student.scholarship || student.scholarship === 'មិនមាន') &&
                              student.academicHistory !== 'ត្រួតថ្នាក់' && (
                                <span className="text-slate-500">ទូទៅ</span>
                              )}
                          </td>
                        )}
                        {showHealthBmi && (
                          <td className={`border border-slate-700 text-center font-times ${textClasses.cellPadding}`}>
                            {student.health?.bmi || '-'}
                          </td>
                        )}
                        {showRemarks && (
                          <td className={`border border-slate-700 text-center text-slate-400 ${textClasses.cellPadding}`}>
                            {student.disability && student.disability !== 'មិនពិការ' ? student.disability : ''}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={14} className="text-center py-8 text-slate-500 border border-slate-700">
                      មិនមានទិន្នន័យសិស្សត្រូវបង្ហាញទេ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Official Signatures and Seals Section */}
          {showSignatures && (
            <div className="relative z-10 mt-8 pt-4 flex justify-between items-start text-xs text-slate-900 page-break-inside-avoid">
              {/* Left: School Director Approval */}
              <div className="text-center w-64 space-y-1">
                <p className="font-semibold text-slate-800">បានឃើញ និងឯកភាព</p>
                <p className="font-moul text-xs sm:text-sm text-blue-950">នាយិកាសាលា</p>
                
                {/* Stamp circle placeholder */}
                {showStamp ? (
                  <div className="py-2 flex justify-center">
                    <SchoolStampCirclePlaceholder size="sm" label="ទីតាំងបោះត្រាសាលា" />
                  </div>
                ) : (
                  <div className="h-16" />
                )}

                <p className="font-moul text-xs sm:text-sm text-red-600 font-bold">
                  {principalSignName}
                </p>
              </div>

              {/* Right: Teacher / List Compiler */}
              <div className="text-center w-72 space-y-1">
                <p className="text-[11px] text-slate-600 font-battambang">
                  {getKhmerLunarDate(new Date())}
                </p>
                <p className="text-xs text-slate-800 font-battambang font-medium">
                  {getKhmerSolarDate(new Date(), schoolProfile.district || 'ភ្នំព្រឹក')}
                </p>
                <p className="font-moul text-xs sm:text-sm text-blue-950 pt-0.5">
                  គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំបញ្ជី
                </p>
                
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[10px] text-slate-400 font-times italic">(ហត្ថលេខា)</span>
                </div>

                <p className="font-moul text-xs sm:text-sm text-blue-950 font-bold">
                  {teacherSignName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
