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
  Sliders,
  CheckSquare,
  Square,
  Sparkles,
  Columns,
  Eye,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

export interface ColumnDefinition {
  id: string;
  labelKhmer: string;
  defaultVisible: boolean;
  category: 'core' | 'personal' | 'contact' | 'health' | 'status';
}

export const STUDENT_PRINT_COLUMNS: ColumnDefinition[] = [
  { id: 'code', labelKhmer: 'អត្តលេខ', defaultVisible: true, category: 'core' },
  { id: 'nameKhmer', labelKhmer: 'គោត្តនាម និងនាម (ខ្មែរ)', defaultVisible: true, category: 'core' },
  { id: 'nameLatin', labelKhmer: 'ឈ្មោះឡាតាំង (Latin Name)', defaultVisible: true, category: 'personal' },
  { id: 'gender', labelKhmer: 'ភេទ (Gender)', defaultVisible: true, category: 'core' },
  { id: 'dob', labelKhmer: 'ថ្ងៃខែឆ្នាំកំណើត (DOB)', defaultVisible: true, category: 'personal' },
  { id: 'grade', labelKhmer: 'កម្រិតថ្នាក់ (Grade)', defaultVisible: true, category: 'core' },
  { id: 'pob', labelKhmer: 'ទីកន្លែងកំណើត (POB)', defaultVisible: false, category: 'personal' },
  { id: 'address', labelKhmer: 'អាសយដ្ឋានបច្ចុប្បន្ន', defaultVisible: false, category: 'personal' },
  { id: 'parents', labelKhmer: 'ឈ្មោះឪពុក-ម្តាយ', defaultVisible: false, category: 'contact' },
  { id: 'guardian', labelKhmer: 'អាណាព្យាបាល', defaultVisible: true, category: 'contact' },
  { id: 'phone', labelKhmer: 'លេខទូរស័ព្ទ', defaultVisible: true, category: 'contact' },
  { id: 'status', labelKhmer: 'ស្ថានភាពជីវភាព/ក្រីក្រ', defaultVisible: true, category: 'status' },
  { id: 'scholarship', labelKhmer: 'អាហារូបករណ៍', defaultVisible: false, category: 'status' },
  { id: 'academicHistory', labelKhmer: 'ប្រវត្តិសិក្សា (ឡើង/ត្រួត)', defaultVisible: false, category: 'status' },
  { id: 'attendance', labelKhmer: 'វត្តមាន (Attendance %)', defaultVisible: false, category: 'status' },
  { id: 'bmi', labelKhmer: 'សុខភាព (BMI/កម្ពស់/ទម្ងន់)', defaultVisible: false, category: 'health' },
  { id: 'disability', labelKhmer: 'ពិការភាព/សម្គាល់ពិសេស', defaultVisible: false, category: 'health' },
  { id: 'remarks', labelKhmer: 'ផ្សេងៗ / ហត្ថលេខា', defaultVisible: true, category: 'core' }
];

interface StudentPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolProfile: SchoolProfile;
  teachers?: Teacher[];
  selectedGrade: number | 'all';
  selectedVulnerability?: string;
}

export const StudentPrintPreviewModal: React.FC<StudentPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolProfile,
  teachers = [],
  selectedGrade,
  selectedVulnerability = 'all'
}) => {
  if (!isOpen) return null;

  // Selected Columns Map
  const [selectedCols, setSelectedCols] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    STUDENT_PRINT_COLUMNS.forEach(col => {
      initial[col.id] = col.defaultVisible;
    });
    return initial;
  });

  // Print Configuration Options
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fontSize, setFontSize] = useState<'compact' | 'normal' | 'comfortable'>('normal');
  const [showStamp, setShowStamp] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'columns' | 'settings'>('preview');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Derive teacher signature
  const defaultTeacherName = useMemo(() => {
    if (selectedGrade !== 'all') {
      const match = teachers.find(t => t.assignedGrade === selectedGrade);
      if (match) return match.nameKhmer;
    }
    return teachers[0]?.nameKhmer || 'អ្នកគ្រូ ពេជ្រ ធីតា';
  }, [selectedGrade, teachers]);

  const [teacherSignName, setTeacherSignName] = useState(defaultTeacherName);
  const [principalSignName, setPrincipalSignName] = useState(schoolProfile.principalName || 'ស៊ុន ពិសិដ្ឋ');

  // Stats calculation
  const stats = useMemo(() => {
    const total = students.length;
    const female = students.filter(s => s.gender === 'F').length;
    const male = total - female;
    const repeater = students.filter(s => s.academicHistory === 'ត្រួតថ្នាក់').length;
    const idpoor = students.filter(s => s.livingCondition === 'ក្រ១' || s.livingCondition === 'ក្រ២' || s.idPoorCardNumber).length;
    const scholarship = students.filter(s => s.scholarship && s.scholarship !== 'មិនមាន').length;

    return { total, female, male, repeater, idpoor, scholarship };
  }, [students]);

  const gradeTitle = useMemo(() => {
    if (selectedGrade === 'all') return 'គ្រប់កម្រិតថ្នាក់ (ថ្នាក់ទី ១ ដល់ ទី ៦)';
    return `ថ្នាក់ទី ${selectedGrade}`;
  }, [selectedGrade]);

  const documentTitle = `បញ្ជីរាយនាមសិស្ស_${(schoolProfile.nameKhmer || 'សាលារៀន').replace(/\s+/g, '_')}_${gradeTitle.replace(/\s+/g, '_')}`;

  const toggleColumn = (id: string) => {
    // Keep at least nameKhmer and code
    if (id === 'nameKhmer') return;
    setSelectedCols(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectPreset = (preset: 'standard' | 'minimal' | 'full' | 'health') => {
    const next: Record<string, boolean> = {};
    STUDENT_PRINT_COLUMNS.forEach(c => (next[c.id] = false));

    if (preset === 'minimal') {
      next['code'] = true;
      next['nameKhmer'] = true;
      next['gender'] = true;
      next['dob'] = true;
      next['grade'] = true;
      next['remarks'] = true;
    } else if (preset === 'standard') {
      next['code'] = true;
      next['nameKhmer'] = true;
      next['nameLatin'] = true;
      next['gender'] = true;
      next['dob'] = true;
      next['grade'] = true;
      next['guardian'] = true;
      next['phone'] = true;
      next['status'] = true;
      next['remarks'] = true;
    } else if (preset === 'full') {
      STUDENT_PRINT_COLUMNS.forEach(c => (next[c.id] = true));
      setOrientation('landscape');
    } else if (preset === 'health') {
      next['code'] = true;
      next['nameKhmer'] = true;
      next['gender'] = true;
      next['dob'] = true;
      next['grade'] = true;
      next['bmi'] = true;
      next['disability'] = true;
      next['status'] = true;
      next['remarks'] = true;
    }
    setSelectedCols(next);
  };

  const handlePrint = async () => {
    await printElement('student-print-preview-modal-canvas', {
      landscape: orientation === 'landscape',
      pageTitle: `បញ្ជីរាយនាមសិស្ស ${gradeTitle} - ${schoolProfile.nameKhmer}`
    });
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadElementAsPdf('student-print-preview-modal-canvas', `${documentTitle}.pdf`, {
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

  // Font sizing definitions
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

  const selectedColCount = useMemo(() => {
    return Object.values(selectedCols).filter(Boolean).length;
  }, [selectedCols]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-battambang">
      {/* Modal Dialog Box */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-300 w-full max-w-7xl flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-moul text-sm sm:text-base text-amber-300 flex items-center gap-2">
                មើលទម្រង់បោះពុម្ពបញ្ជីសិស្ស (Print Preview & Column Customizer)
              </h2>
              <p className="text-xs text-slate-300">
                {gradeTitle} • សិស្ស {stats.total} នាក់ (ស្រី {stats.female}) • បានជ្រើសរើស {selectedColCount} ជួរឈរ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? '...' : 'PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="បិទផ្ទាំង"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar & Tab Switches */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Main Subtabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ផ្ទាំងមើលទម្រង់បោះពុម្ព (Preview)</span>
            </button>
            <button
              onClick={() => setActiveTab('columns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'columns'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>ជ្រើសរើសជួរឈរ (Columns - {selectedColCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ការកំណត់ទំព័រ (Settings)</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold hidden sm:inline">ទម្រង់គំរូ:</span>
            <button
              onClick={() => selectPreset('standard')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
            >
              ស្តង់ដារ
            </button>
            <button
              onClick={() => selectPreset('minimal')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
            >
              សង្ខេប
            </button>
            <button
              onClick={() => selectPreset('full')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
            >
              ពេញលេញ (Full)
            </button>
            <button
              onClick={() => selectPreset('health')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium transition-all cursor-pointer shadow-2xs"
            >
              សុខភាព
            </button>
          </div>
        </div>

        {/* Expandable Tab Panel (When columns or settings active) */}
        {activeTab === 'columns' && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 max-h-56 overflow-y-auto shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs">
                ចុចលើជួរឈរដើម្បីបើក ឬបិទការបង្ហាញក្នុងតារាងបោះពុម្ព៖
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => selectPreset('full')}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  ជ្រើសទាំងអស់
                </button>
                <span>•</span>
                <button
                  onClick={() => selectPreset('minimal')}
                  className="text-slate-600 hover:underline font-semibold cursor-pointer"
                >
                  កំណត់ដើម
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {STUDENT_PRINT_COLUMNS.map(col => {
                const isChecked = !!selectedCols[col.id];
                const isMandatory = col.id === 'nameKhmer';
                return (
                  <button
                    key={col.id}
                    disabled={isMandatory}
                    onClick={() => toggleColumn(col.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    } ${isMandatory ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{col.labelKhmer}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Orientation */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">ទិសដៅក្រដាស៖</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                      orientation === 'portrait'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    បញ្ឈរ (Portrait)
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                      orientation === 'landscape'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    ផ្ដេក (Landscape)
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">ទំហំអក្សរតារាង៖</span>
                <select
                  value={fontSize}
                  onChange={(e: any) => setFontSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="compact">តូចណែន (Compact - សម្រាប់សិស្សច្រើន)</option>
                  <option value="normal">ស្តង់ដារ (Standard MoEYS)</option>
                  <option value="comfortable">ធំល្មម (Comfortable)</option>
                </select>
              </div>

              {/* Signatures & Elements */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">ធាតុបន្ថែម៖</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showStamp}
                      onChange={e => setShowStamp(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ត្រាសាលា</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSignatures}
                      onChange={e => setShowSignatures(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>ហត្ថលេខា</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={e => setShowWatermark(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Watermark</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80 flex justify-center">
          <div
            id="student-print-preview-modal-canvas"
            className={`bg-white text-slate-900 shadow-xl rounded-sm p-6 sm:p-10 border border-slate-300 relative overflow-hidden transition-all ${
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
                </div>
              </div>
            </div>

            {/* Dynamic Customizable Columns Table */}
            <div className="relative z-10 overflow-x-auto">
              <table className={`w-full border-collapse border border-slate-800 text-slate-900 ${textClasses.tableText}`}>
                <thead>
                  <tr className="bg-slate-100/90 text-slate-950 font-bold border-b border-slate-800 text-center">
                    <th className={`border border-slate-800 ${textClasses.cellPadding} w-8`}>ល.រ</th>
                    
                    {selectedCols.code && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-16 whitespace-nowrap`}>អត្តលេខ</th>
                    )}
                    {selectedCols.nameKhmer && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[130px]`}>
                        គោត្តនាម និងនាម
                      </th>
                    )}
                    {selectedCols.nameLatin && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[110px]`}>
                        ឈ្មោះឡាតាំង
                      </th>
                    )}
                    {selectedCols.gender && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-12`}>ភេទ</th>
                    )}
                    {selectedCols.dob && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 whitespace-nowrap`}>
                        ថ្ងៃខែឆ្នាំកំណើត
                      </th>
                    )}
                    {selectedCols.grade && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-14`}>ថ្នាក់</th>
                    )}
                    {selectedCols.pob && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[100px]`}>
                        ទីកន្លែងកំណើត
                      </th>
                    )}
                    {selectedCols.address && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[100px]`}>
                        អាសយដ្ឋាន
                      </th>
                    )}
                    {selectedCols.parents && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[110px]`}>
                        ឪពុក - ម្តាយ
                      </th>
                    )}
                    {selectedCols.guardian && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} text-left min-w-[110px]`}>
                        អាណាព្យាបាល
                      </th>
                    )}
                    {selectedCols.phone && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-24 text-center whitespace-nowrap`}>
                        លេខទូរស័ព្ទ
                      </th>
                    )}
                    {selectedCols.status && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 text-center`}>
                        ស្ថានភាព
                      </th>
                    )}
                    {selectedCols.scholarship && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 text-center`}>
                        អាហារូបករណ៍
                      </th>
                    )}
                    {selectedCols.academicHistory && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-16 text-center`}>
                        ប្រវត្តិសិក្សា
                      </th>
                    )}
                    {selectedCols.attendance && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-18 text-center`}>
                        វត្តមាន (%)
                      </th>
                    )}
                    {selectedCols.bmi && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-16 text-center`}>
                        BMI / សុខភាព
                      </th>
                    )}
                    {selectedCols.disability && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 text-center`}>
                        ពិការភាព
                      </th>
                    )}
                    {selectedCols.remarks && (
                      <th className={`border border-slate-800 ${textClasses.cellPadding} w-20 text-center`}>
                        ផ្សេងៗ
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
                          {selectedCols.code && (
                            <td className={`border border-slate-700 text-center font-times font-semibold text-blue-900 ${textClasses.cellPadding}`}>
                              {student.code}
                            </td>
                          )}
                          {selectedCols.nameKhmer && (
                            <td className={`border border-slate-700 font-bold text-slate-950 ${textClasses.cellPadding}`}>
                              {student.nameKhmer}
                            </td>
                          )}
                          {selectedCols.nameLatin && (
                            <td className={`border border-slate-700 font-times text-slate-700 ${textClasses.cellPadding}`}>
                              {student.nameLatin || '-'}
                            </td>
                          )}
                          {selectedCols.gender && (
                            <td className={`border border-slate-700 text-center font-semibold ${textClasses.cellPadding} ${
                              student.gender === 'F' ? 'text-rose-700' : 'text-blue-800'
                            }`}>
                              {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                            </td>
                          )}
                          {selectedCols.dob && (
                            <td className={`border border-slate-700 text-center font-times ${textClasses.cellPadding}`}>
                              {student.dob}
                            </td>
                          )}
                          {selectedCols.grade && (
                            <td className={`border border-slate-700 text-center font-bold ${textClasses.cellPadding}`}>
                              {student.grade}{student.section || ''}
                            </td>
                          )}
                          {selectedCols.pob && (
                            <td className={`border border-slate-700 text-[10px] leading-tight text-slate-600 ${textClasses.cellPadding}`}>
                              {student.pob || student.pobProvince || '-'}
                            </td>
                          )}
                          {selectedCols.address && (
                            <td className={`border border-slate-700 text-[10px] leading-tight text-slate-600 ${textClasses.cellPadding}`}>
                              {student.address || student.currentVillage || '-'}
                            </td>
                          )}
                          {selectedCols.parents && (
                            <td className={`border border-slate-700 text-[10px] leading-tight text-slate-700 ${textClasses.cellPadding}`}>
                              {student.fatherName ? `ឪ៖ ${student.fatherName}` : ''}
                              {student.fatherName && student.motherName ? ' • ' : ''}
                              {student.motherName ? `ម្តាយ៖ ${student.motherName}` : ''}
                              {!student.fatherName && !student.motherName ? '-' : ''}
                            </td>
                          )}
                          {selectedCols.guardian && (
                            <td className={`border border-slate-700 text-slate-800 ${textClasses.cellPadding}`}>
                              {student.guardianName || student.fatherName || student.motherName || '-'}
                            </td>
                          )}
                          {selectedCols.phone && (
                            <td className={`border border-slate-700 text-center font-times text-[10px] ${textClasses.cellPadding}`}>
                              {student.guardianPhone || student.phone || '-'}
                            </td>
                          )}
                          {selectedCols.status && (
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
                          {selectedCols.scholarship && (
                            <td className={`border border-slate-700 text-center ${textClasses.cellPadding}`}>
                              {student.scholarship || 'មិនមាន'}
                            </td>
                          )}
                          {selectedCols.academicHistory && (
                            <td className={`border border-slate-700 text-center ${textClasses.cellPadding}`}>
                              {student.academicHistory || 'ឡើងថ្នាក់'}
                            </td>
                          )}
                          {selectedCols.attendance && (
                            <td className={`border border-slate-700 text-center font-times font-bold ${textClasses.cellPadding}`}>
                              {student.attendance && student.attendance.totalDays > 0
                                ? `${Math.round((student.attendance.present / student.attendance.totalDays) * 100)}%`
                                : '97%'}
                            </td>
                          )}
                          {selectedCols.bmi && (
                            <td className={`border border-slate-700 text-center font-times ${textClasses.cellPadding}`}>
                              {student.health?.bmi ? `BMI: ${student.health.bmi}` : '-'}
                            </td>
                          )}
                          {selectedCols.disability && (
                            <td className={`border border-slate-700 text-center ${textClasses.cellPadding}`}>
                              {student.disability || 'មិនពិការ'}
                            </td>
                          )}
                          {selectedCols.remarks && (
                            <td className={`border border-slate-700 text-center text-slate-400 ${textClasses.cellPadding}`}>
                              {student.disability && student.disability !== 'មិនពិការ' ? student.disability : ''}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={selectedColCount + 1} className="text-center py-8 text-slate-500 border border-slate-700">
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

        {/* Modal Bottom Footer Actions */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            * គន្លឹះ៖ ជ្រើសរើសជួរឈរ និងទំហំអក្សរឱ្យបានសមស្របតាមចំនួនសិស្ស មុនពេលចុចបញ្ជាបោះពុម្ព
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              បិទផ្ទាំង (Close)
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពជាផ្លូវការ (Print A4)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
