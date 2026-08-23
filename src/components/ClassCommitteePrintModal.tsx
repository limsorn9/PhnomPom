import React, { useState, useRef } from 'react';
import {
  ClassManagementCommitteeMember,
  ClassManagementCommitteeDoc,
  SchoolProfile,
  Teacher,
  Student
} from '../types';
import {
  Printer,
  X,
  FileSpreadsheet,
  Download,
  Users,
  Award,
  Layers,
  Image as ImageIcon,
  Edit3,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Phone,
  Building2,
  Upload,
  UserCheck
} from 'lucide-react';
import {
  AngkorWatSilhouette,
  AngkorPageWatermark,
  MoEYSRoyalHeader,
  SchoolOfficialStamp,
  SchoolStampCirclePlaceholder,
  MoEYSOfficialDualSignatures,
  KhmerKbachCorner
} from './AngkorMotif';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';

interface ClassCommitteePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: number;
  selectedSection: string;
  selectedAcademicYear?: string;
  schoolProfile: SchoolProfile;
  homeroomTeacher?: Teacher;
  classStudents?: Student[];
}

// Initial Default Template Data matching the official sample screenshots
const defaultMembersData: ClassManagementCommitteeMember[] = [
  {
    id: 'cm-1',
    order: 1,
    honorific: 'លោកស្រី',
    fullName: 'ហៀម ម៉ុំ',
    gender: 'ស្រី',
    workplace: 'ភូមិភ្នំពុំ',
    occupation: 'កសិករ',
    role: 'president',
    roleTitleKhmer: 'ប្រធាន',
    phone: '097 538 5753',
    gradeSection: '3ក',
    livelihoodStatus: 'ជីវភាពមធ្យម',
    occupationCategory: 'កសិករ',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cm-2',
    order: 2,
    honorific: 'លោកស្រី',
    fullName: 'មាស សុខុម',
    gender: 'ស្រី',
    workplace: 'ភូមិភ្នំពុំ',
    occupation: 'កសិករ',
    role: 'deputy_president_1',
    roleTitleKhmer: 'អនុប្រធាន',
    phone: '097 5555 001',
    gradeSection: '3ក',
    livelihoodStatus: 'ជីវភាពមធ្យម',
    occupationCategory: 'កសិករ',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cm-3',
    order: 3,
    honorific: 'លោកស្រី',
    fullName: 'លៀវ សុខណា',
    gender: 'ស្រី',
    workplace: 'ភូមិភ្នំពុំ',
    occupation: 'កសិករ',
    role: 'deputy_president_2',
    roleTitleKhmer: 'អនុប្រធាន',
    phone: '070 314 043',
    gradeSection: '3ក',
    livelihoodStatus: 'ជីវភាពមធ្យម',
    occupationCategory: 'កសិករ',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cm-4',
    order: 4,
    honorific: 'លោកស្រី',
    fullName: 'ផន យាន',
    gender: 'ស្រី',
    workplace: 'ភូមិភ្នំពុំ',
    occupation: 'កសិករ',
    role: 'member',
    roleTitleKhmer: 'សមាជិក',
    phone: '012 889 921',
    gradeSection: '3ក',
    livelihoodStatus: 'ជីវភាពមធ្យម',
    occupationCategory: 'កសិករ',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cm-5',
    order: 5,
    honorific: 'លោក',
    fullName: 'ឃី ចាន់ថា',
    gender: 'ប្រុស',
    workplace: 'ភូមិភ្នំពុំ',
    occupation: 'កសិករ',
    role: 'member',
    roleTitleKhmer: 'សមាជិក',
    phone: '015 298 995',
    gradeSection: '3ក',
    livelihoodStatus: 'ជីវភាពមធ្យម',
    occupationCategory: 'កសិករ',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cm-6',
    order: 6,
    honorific: 'លោកស្រី',
    fullName: 'លាប ឡៃ',
    gender: 'ស្រី',
    workplace: 'ភូមិភ្នំពុំ',
    occupation: 'កសិករ',
    role: 'member',
    roleTitleKhmer: 'សមាជិក',
    phone: '015 445 573',
    gradeSection: '3ក',
    livelihoodStatus: 'ជីវភាពមធ្យម',
    occupationCategory: 'កសិករ',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cm-7',
    order: 7,
    honorific: 'ក្រុមប្រឹក្សាកុមារ',
    fullName: 'ផៃ សំអាត',
    gender: 'ស្រី',
    workplace: 'ភូមិភ្នំពុំ',
    occupation: 'សិស្ស',
    role: 'member',
    roleTitleKhmer: 'សមាជិក',
    phone: '096 272 0170',
    gradeSection: '3ក',
    livelihoodStatus: 'ជីវភាពមធ្យម',
    occupationCategory: 'សិស្ស',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  }
];

export const ClassCommitteePrintModal: React.FC<ClassCommitteePrintModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  selectedSection,
  selectedAcademicYear = '២០២៥-២០២៦',
  schoolProfile,
  homeroomTeacher,
  classStudents = []
}) => {
  // Active View Tab: 'table' (Landscape Table) vs 'tree' (Portrait Org Chart Tree) vs 'editor' (Edit Data)
  const [activeTab, setActiveTab] = useState<'table' | 'tree' | 'editor'>('table');

  // Committee Members State
  const [members, setMembers] = useState<ClassManagementCommitteeMember[]>(() => {
    return defaultMembersData.map(m => ({
      ...m,
      gradeSection: `${selectedGrade}${selectedSection}`
    }));
  });

  // Document Info State
  const [districtOffice, setDistrictOffice] = useState('ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុកភ្នំព្រឹក');
  const [schoolName, setSchoolName] = useState(schoolProfile.nameKhmer || 'សាលាបឋមសិក្សា ភ្នំពុំ');
  const [lunarDate, setLunarDate] = useState('ថ្ងៃអង្គារ ១៣កើត ខែចេត្រ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩');
  const [solarDate, setSolarDate] = useState('ភ្នំពុំ, ថ្ងៃទី៣១ ខែមីនា ឆ្នាំ២០២៦');
  const [teacherName, setTeacherName] = useState(homeroomTeacher?.nameKhmer || 'សែម ស្រីអឿន');
  const [principalName, setPrincipalName] = useState(schoolProfile.principalName || 'គង់ សុភ័ក្រ');

  // Customization Options
  const [showHeader, setShowHeader] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showStamp, setShowStamp] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Photo Upload for a member
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, photoUrl: result } : m));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to default sample screenshot template
  const handleResetToTemplate = () => {
    setMembers(defaultMembersData.map(m => ({
      ...m,
      gradeSection: `${selectedGrade}${selectedSection}`
    })));
    setDistrictOffice('ការិយាល័យអប់រំ យុវជន និងកីឡានៃរដ្ឋបាលស្រុកភ្នំព្រឹក');
    setSchoolName(schoolProfile.nameKhmer || 'សាលាបឋមសិក្សា ភ្នំពុំ');
    setLunarDate('ថ្ងៃអង្គារ ១៣កើត ខែចេត្រ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩');
    setSolarDate('ភ្នំពុំ, ថ្ងៃទី៣១ ខែមីនា ឆ្នាំ២០២៦');
  };

  // Auto-fill from class students & parents
  const handleAutofillFromClass = () => {
    if (classStudents.length === 0) return;
    const updated = members.map((m, idx) => {
      const stu = classStudents[idx % classStudents.length];
      if (!stu) return m;
      const isKidCouncil = idx === 6;
      return {
        ...m,
        honorific: isKidCouncil ? 'ក្រុមប្រឹក្សាកុមារ' : (stu.gender === 'female' ? 'លោកស្រី' : 'លោក'),
        fullName: isKidCouncil ? stu.nameKhmer : (stu.guardianName || stu.fatherName || stu.nameKhmer),
        gender: isKidCouncil ? (stu.gender === 'female' ? 'ស្រី' : 'ប្រុស') : (stu.gender === 'female' ? 'ស្រី' : 'ប្រុស'),
        phone: stu.guardianPhone || stu.phone || m.phone,
        workplace: stu.village || schoolProfile.village || 'ភ្នំពុំ',
        occupation: isKidCouncil ? 'សិស្ស' : (stu.guardianOccupation || 'កសិករ'),
        occupationCategory: isKidCouncil ? 'សិស្ស' : 'កសិករ',
        gradeSection: `${selectedGrade}${selectedSection}`
      };
    });
    setMembers(updated);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Trigger Print & PDF
  const handlePrint = async () => {
    const targetId = activeTab === 'tree' ? 'committee-print-tree-canvas' : 'committee-print-table-canvas';
    setIsPrinting(true);
    try {
      await printElement(targetId, {
        landscape: activeTab !== 'tree',
        pageTitle: `គណៈកម្មការគ្រប់គ្រងថ្នាក់_ថ្នាក់ទី${selectedGrade}${selectedSection}`
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPdf = async () => {
    const targetId = activeTab === 'tree' ? 'committee-print-tree-canvas' : 'committee-print-table-canvas';
    setIsExportingPdf(true);
    try {
      const typeLabel = activeTab === 'tree' ? 'រចនាសម្ព័ន្ធរូបថត' : 'តារាងសមាសភាព';
      const filename = `គណៈកម្មការគ្រប់គ្រងថ្នាក់_${typeLabel}_ថ្នាក់ទី${selectedGrade}${selectedSection}_${schoolProfile.nameKhmer || 'សាលារៀន'}.pdf`;
      await downloadElementAsPdf(targetId, filename, {
        landscape: activeTab !== 'tree',
        scale: 2
      });
    } catch (err) {
      console.error('Failed to export Committee PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Get specific members by roles
  const president = members.find(m => m.role === 'president') || members[0];
  const deputy1 = members.find(m => m.role === 'deputy_president_1') || members[1];
  const deputy2 = members.find(m => m.role === 'deputy_president_2') || members[2];
  const committeeMembers = members.filter(m => m.role === 'member');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* MODAL CONTROL HEADER (Hidden when printing) */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-moul text-sm sm:text-base text-blue-950">
                ឯកសារគណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន (គ.ក.ថ.)
              </h2>
              <p className="text-xs text-slate-500 font-battambang">
                ទម្រង់ផ្លូវការស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>១. តារាងសមាសភាព (Landscape)</span>
            </button>

            <button
              onClick={() => setActiveTab('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tree'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>២. រចនាសម្ព័ន្ធរូបថត (Portrait)</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>កែសម្រួលទិន្នន័យ</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls for Print Preview */}
            <div className="hidden lg:flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-xs text-xs">
              <span className="text-slate-500 text-[11px] font-medium mr-1">ពង្រីក/បង្រួម:</span>
              <button
                onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold"
                title="បង្រួម"
              >
                -
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-1.5 py-0.5 rounded text-[11px] font-bold text-blue-700 hover:bg-blue-50"
                title="ទំហំដើម ១០០%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold"
                title="ពង្រីក"
              >
                +
              </button>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="ទាញយកឯកសារជាទម្រង់ PDF គ្មានជាប់របារអូស"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'កំពុងបង្កើត PDF...' : 'ទាញយកជា PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="បើកផ្ទាំងបោះពុម្ព (Print Preview Dialog)"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'កំពុងដំណើរការ...' : 'បោះពុម្ព (Print)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="បិទផ្ទាំង"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR OPTIONS (Hidden on print) */}
        <div className="px-4 py-2.5 bg-blue-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHeader}
                onChange={e => setShowHeader(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>ក្បាលលិខិតជាតិ</span>
            </label>

            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={e => setShowWatermark(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>រូបសញ្ញាប្រាសាទអង្គរវត្ត (Watermark)</span>
            </label>

            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showStamp}
                onChange={e => setShowStamp(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>ត្រាក្រហមរដ្ឋបាលសាលា</span>
            </label>

            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={e => setShowSignatures(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>ហត្ថលេខានាយក និងគ្រូបន្ទុក</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutofillFromClass}
              className="px-2.5 py-1 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="ទាញទិន្នន័យពីបញ្ជីសិស្ស និងអាណាព្យាបាលក្នុងថ្នាក់"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>បំពេញស្វ័យប្រវត្តពីថ្នាក់រៀន</span>
            </button>

            <button
              onClick={handleResetToTemplate}
              className="px-2.5 py-1 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="កំណត់ទិន្នន័យទៅតាមគំរូសាលាបឋមសិក្សា ភ្នំពុំ"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>គំរូដើម ភ្នំពុំ</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (Scrollable on screen, Full width on print) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible bg-slate-100/60 print:bg-white flex justify-center">
          
          {/* ======================================================== */}
          {/* VIEW 1: LANDSCAPE TABLE (តារាងសមាសភាពគណៈកម្មការ) */}
          {/* ======================================================== */}
          {activeTab === 'table' && (
            <div
              id="committee-print-table-canvas"
              style={{ zoom: `${zoomLevel}%` }}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-[1100px] print:max-w-none print:w-full print:shadow-none print:border-none print:p-4 print-landscape-mode relative transition-transform"
            >
              {/* Background Watermark */}
              {showWatermark && <AngkorPageWatermark opacity={0.04} />}

              {/* Document Header */}
              {showHeader && (
                <div className="relative z-10 space-y-2 mb-4">
                  <div className="flex justify-between items-start">
                    {/* Left: Administrative Hierarchy */}
                    <div className="text-left space-y-0.5 text-xs text-slate-900 font-battambang">
                      <p className="font-semibold">{districtOffice}</p>
                      <p className="font-moul text-blue-950 font-bold text-xs">{schoolName}</p>
                    </div>

                    {/* Center: Kingdom of Cambodia Royal Header */}
                    <div className="text-center">
                      <MoEYSRoyalHeader />
                    </div>

                    {/* Right spacer for balance */}
                    <div className="w-32 hidden sm:block"></div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="text-center relative z-10 my-3 space-y-1">
                <h1 className="font-moul text-base sm:text-lg text-blue-950 tracking-wide">
                  សមាសភាពគណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន ( គ.ក.ថ. )
                </h1>
                <p className="text-xs font-semibold text-slate-700 font-battambang">
                  ថ្នាក់ទី {selectedGrade}«{selectedSection}» ឆ្នាំសិក្សា {selectedAcademicYear}
                </p>
              </div>

              {/* Table Matching Screenshot 1 with zero-scrollbar styling */}
              <div className="relative z-10 overflow-x-auto print:overflow-visible no-scrollbar mt-4">
                <table className="w-full text-[11px] sm:text-xs text-left border-collapse border border-slate-900">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 text-center font-battambang">
                      <th className="border border-slate-900 p-1.5 w-8">ល.រ</th>
                      <th className="border border-slate-900 p-1.5 w-20">នាមស័ព្ទ</th>
                      <th className="border border-slate-900 p-1.5 min-w-28">នាមត្រកូល និងនាមខ្លួន</th>
                      <th className="border border-slate-900 p-1.5 w-12">ភេទ</th>
                      <th className="border border-slate-900 p-1.5 min-w-24">អង្គភាពឬស្ថាប័ន<br/><span className="text-[10px] font-normal">( ទីកន្លែងធ្វើការ )</span></th>
                      <th className="border border-slate-900 p-1.5 min-w-20">មុខរបរបច្ចុប្បន្ន</th>
                      <th className="border border-slate-900 p-1.5 min-w-24">តួនាទីក្នុង<br/>គណៈកម្មការ</th>
                      <th className="border border-slate-900 p-1.5 min-w-24">លេខទូរស័ព្ទ</th>
                      <th className="border border-slate-900 p-1.5 w-14">ថ្នាក់ទី</th>
                      <th className="border border-slate-900 p-1.5 min-w-24">ស្ថានភាពជីវភាព</th>
                      <th className="border border-slate-900 p-1.5 min-w-28">សូមជ្រើសរើសមុខរបរ<br/><span className="text-[10px] font-normal">( បើមាន )</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="border border-slate-900 p-1.5 text-center font-times font-semibold">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-medium">
                          {m.honorific}
                        </td>
                        <td className="border border-slate-900 p-1.5 font-bold font-moul text-slate-950 text-xs">
                          {m.fullName}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center">
                          {m.gender}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center">
                          {m.workplace}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-medium">
                          {m.occupation}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-bold text-blue-950">
                          {m.roleTitleKhmer}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-times font-bold text-slate-900">
                          {m.phone || '#N/A'}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center font-semibold">
                          {m.gradeSection || `${selectedGrade}${selectedSection}`}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center">
                          {m.livelihoodStatus}
                        </td>
                        <td className="border border-slate-900 p-1.5 text-center">
                          {m.occupationCategory}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dual Signatures & Dates (Bottom) */}
              {showSignatures && (
                <MoEYSOfficialDualSignatures
                  schoolLocation={districtOffice || 'ភ្នំពុំ'}
                  principalTitle="នាយកសាលា"
                  principalName={principalName}
                  reviewerTitle="បានឃើញ និងឯកភាព"
                  teacherRoleTitle="គ្រូបន្ទុកថ្នាក់"
                  teacherName={teacherName}
                  teacherNameColor="blue"
                  lunarDate={lunarDate}
                  solarDate={solarDate}
                  showStampPlaceholder={showStamp}
                  className="mt-8 pt-4 border-t border-slate-200"
                />
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: PORTRAIT ORG CHART (រចនាសម្ព័ន្ធរូបថត គ.ក.ថ.) */}
          {/* ======================================================== */}
          {activeTab === 'tree' && (
            <div
              id="committee-print-tree-canvas"
              style={{ zoom: `${zoomLevel}%` }}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-[850px] print:max-w-none print:w-full print:shadow-none print:border-none print:p-4 relative transition-transform"
            >
              {/* Background Watermark */}
              {showWatermark && <AngkorPageWatermark opacity={0.04} />}

              {/* Document Header */}
              {showHeader && (
                <div className="relative z-10 space-y-2 mb-4">
                  <div className="flex justify-between items-start">
                    {/* Left: Administrative Hierarchy */}
                    <div className="text-left space-y-0.5 text-xs text-slate-900 font-battambang">
                      <p className="font-semibold">{districtOffice}</p>
                      <p className="font-moul text-blue-950 font-bold text-xs">{schoolName}</p>
                    </div>

                    {/* Center: Kingdom of Cambodia Royal Header */}
                    <div className="text-center">
                      <MoEYSRoyalHeader />
                    </div>

                    {/* Right spacer for balance */}
                    <div className="w-24 hidden sm:block"></div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="text-center relative z-10 my-3 space-y-1">
                <h1 className="font-moul text-base sm:text-lg text-blue-950 tracking-wide">
                  រចនាសម្ព័ន្ធគណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន( គ.ក.ថ. )
                </h1>
                <p className="text-xs font-semibold text-slate-700 font-battambang">
                  ថ្នាក់ទី {selectedGrade}«{selectedSection}» ឆ្នាំសិក្សា {selectedAcademicYear}
                </p>
              </div>

              {/* ==================================================== */}
              {/* ORG CHART HIERARCHY TREE (Matching Screenshot 2) */}
              {/* ==================================================== */}
              <div className="relative z-10 my-6 flex flex-col items-center select-none">
                
                {/* ---------------- LEVEL 1: PRESIDENT ---------------- */}
                <div className="flex flex-col items-center">
                  <div className="bg-white border-2 border-slate-800 rounded-lg p-2 shadow-xs w-44 sm:w-48 text-center flex flex-col items-center">
                    {/* Portrait Photo with Classic Blue Background */}
                    <div className="w-20 h-24 sm:w-24 sm:h-28 bg-[#1e40af] border border-slate-300 rounded overflow-hidden flex items-center justify-center mb-1.5 shadow-inner">
                      {president.photoUrl ? (
                        <img
                          src={president.photoUrl}
                          alt={president.fullName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Users className="w-10 h-10 text-white/70" />
                      )}
                    </div>
                    <p className="font-moul text-xs text-blue-950 font-bold leading-tight">
                      {president.honorific} {president.fullName}
                    </p>
                    <p className="text-xs font-bold text-slate-800 font-battambang mt-0.5">
                      ( {president.roleTitleKhmer} )
                    </p>
                    <p className="text-[11px] font-times font-bold text-slate-900 mt-0.5">
                      {president.phone}
                    </p>
                  </div>

                  {/* Vertical Line from President */}
                  <div className="w-0.5 h-6 bg-slate-800"></div>
                </div>

                {/* ---------------- TREE BRANCH CONNECTOR 1 ---------------- */}
                <div className="w-[60%] sm:w-[65%] border-t-2 border-slate-800 relative">
                  {/* Left drop line to Deputy 1 */}
                  <div className="absolute left-0 top-0 w-0.5 h-6 bg-slate-800"></div>
                  {/* Right drop line to Deputy 2 */}
                  <div className="absolute right-0 top-0 w-0.5 h-6 bg-slate-800"></div>
                </div>

                {/* ---------------- LEVEL 2: 2 DEPUTY PRESIDENTS ---------------- */}
                <div className="w-full flex justify-between items-start px-2 sm:px-8 mt-6">
                  
                  {/* Deputy 1 (Left branch) */}
                  <div className="flex flex-col items-center w-1/2">
                    <div className="bg-white border-2 border-slate-800 rounded-lg p-2 shadow-xs w-40 sm:w-44 text-center flex flex-col items-center">
                      <div className="w-18 h-22 sm:w-20 sm:h-26 bg-[#1e40af] border border-slate-300 rounded overflow-hidden flex items-center justify-center mb-1.5 shadow-inner">
                        {deputy1.photoUrl ? (
                          <img
                            src={deputy1.photoUrl}
                            alt={deputy1.fullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-white/70" />
                        )}
                      </div>
                      <p className="font-moul text-[11px] text-blue-950 font-bold leading-tight">
                        {deputy1.honorific} {deputy1.fullName}
                      </p>
                      <p className="text-[11px] font-bold text-slate-800 font-battambang mt-0.5">
                        ( {deputy1.roleTitleKhmer} )
                      </p>
                      <p className="text-[10px] font-times font-bold text-slate-900 mt-0.5">
                        {deputy1.phone}
                      </p>
                    </div>

                    {/* Vertical Line from Deputy 1 to Members */}
                    <div className="w-0.5 h-6 bg-slate-800"></div>

                    {/* Sub-branch for 2 left members */}
                    <div className="w-full sm:w-72 border-t-2 border-slate-800 relative">
                      <div className="absolute left-0 top-0 w-0.5 h-6 bg-slate-800"></div>
                      <div className="absolute right-0 top-0 w-0.5 h-6 bg-slate-800"></div>
                    </div>
                  </div>

                  {/* Deputy 2 (Right branch) */}
                  <div className="flex flex-col items-center w-1/2">
                    <div className="bg-white border-2 border-slate-800 rounded-lg p-2 shadow-xs w-40 sm:w-44 text-center flex flex-col items-center">
                      <div className="w-18 h-22 sm:w-20 sm:h-26 bg-[#1e40af] border border-slate-300 rounded overflow-hidden flex items-center justify-center mb-1.5 shadow-inner">
                        {deputy2.photoUrl ? (
                          <img
                            src={deputy2.photoUrl}
                            alt={deputy2.fullName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-white/70" />
                        )}
                      </div>
                      <p className="font-moul text-[11px] text-blue-950 font-bold leading-tight">
                        {deputy2.honorific} {deputy2.fullName}
                      </p>
                      <p className="text-[11px] font-bold text-slate-800 font-battambang mt-0.5">
                        ( {deputy2.roleTitleKhmer} )
                      </p>
                      <p className="text-[10px] font-times font-bold text-slate-900 mt-0.5">
                        {deputy2.phone}
                      </p>
                    </div>

                    {/* Vertical Line from Deputy 2 to Members */}
                    <div className="w-0.5 h-6 bg-slate-800"></div>

                    {/* Sub-branch for 2 right members */}
                    <div className="w-full sm:w-72 border-t-2 border-slate-800 relative">
                      <div className="absolute left-0 top-0 w-0.5 h-6 bg-slate-800"></div>
                      <div className="absolute right-0 top-0 w-0.5 h-6 bg-slate-800"></div>
                    </div>
                  </div>
                </div>

                {/* ---------------- LEVEL 3: 4 MEMBERS ---------------- */}
                <div className="w-full grid grid-cols-4 gap-2 sm:gap-4 mt-6">
                  {committeeMembers.slice(0, 4).map((member, idx) => (
                    <div key={member.id || idx} className="flex flex-col items-center">
                      <div className="bg-white border-2 border-slate-800 rounded-lg p-1.5 shadow-xs w-full max-w-[170px] text-center flex flex-col items-center">
                        <div className="w-14 h-18 sm:w-16 sm:h-22 bg-[#1e40af] border border-slate-300 rounded overflow-hidden flex items-center justify-center mb-1 shadow-inner">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.fullName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-white/70" />
                          )}
                        </div>
                        <p className="font-moul text-[10px] text-blue-950 font-bold leading-tight truncate w-full">
                          {member.honorific ? `${member.honorific} ` : ''}{member.fullName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-800 font-battambang mt-0.5">
                          ( {member.roleTitleKhmer} )
                        </p>
                        <p className="text-[9.5px] font-times font-bold text-slate-900 mt-0.5">
                          {member.phone || '#N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Dual Signatures & Dates (Bottom) */}
              {showSignatures && (
                <MoEYSOfficialDualSignatures
                  schoolLocation={districtOffice || 'ភ្នំពុំ'}
                  principalTitle="នាយកសាលា"
                  principalName={principalName}
                  reviewerTitle="បានឃើញ និងឯកភាព"
                  teacherRoleTitle="គ្រូបន្ទុកថ្នាក់"
                  teacherName={teacherName}
                  teacherNameColor="blue"
                  lunarDate={lunarDate}
                  solarDate={solarDate}
                  showStampPlaceholder={showStamp}
                  className="mt-8 pt-4 border-t border-slate-200"
                />
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: DATA EDITOR (កែសម្រួលទិន្នន័យគណៈកម្មការ) */}
          {/* ======================================================== */}
          {activeTab === 'editor' && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 w-full max-w-4xl space-y-6">
              <div>
                <h3 className="font-moul text-base text-blue-950 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  កែសម្រួលទិន្នន័យគណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន
                </h3>
                <p className="text-xs text-slate-500 font-battambang mt-1">
                  អ្នកអាចបញ្ចូល ឬកែប្រែព័ត៌មានសមាសភាព រូបថត លេខទូរស័ព្ទ និងកាលបរិច្ឆេទសម្រាប់ឯកសារបោះពុម្ព
                </p>
              </div>

              {/* Document Metadata Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ស្ថាប័នថ្នាក់លើ (District Office):</label>
                  <input
                    type="text"
                    value={districtOffice}
                    onChange={e => setDistrictOffice(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ឈ្មោះសាលារៀន (School Name):</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">កាលបរិច្ឆេទចន្ទគតិ (Lunar Date):</label>
                  <input
                    type="text"
                    value={lunarDate}
                    onChange={e => setLunarDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">កាលបរិច្ឆេទសុរិយគតិ (Solar Date):</label>
                  <input
                    type="text"
                    value={solarDate}
                    onChange={e => setSolarDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ឈ្មោះនាយកសាលា (Principal Name):</label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={e => setPrincipalName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ឈ្មោះគ្រូបន្ទុកថ្នាក់ (Teacher Name):</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Members List Editor */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800">
                  បញ្ជីសមាជិកទាំង ៧ រូប (Members Information):
                </h4>

                <div className="space-y-3">
                  {members.map((member, idx) => (
                    <div
                      key={member.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      {/* Photo Thumbnail + Upload Button */}
                      <div className="flex items-center gap-3">
                        <div className="relative group w-14 h-16 bg-[#1e40af] rounded border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-white/70" />
                          )}
                          <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px]">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handlePhotoUpload(e, member.id)}
                            />
                          </label>
                        </div>

                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            ល.រ {idx + 1} - {member.roleTitleKhmer}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 mt-0.5">
                            {member.honorific} {member.fullName}
                          </h5>
                          <p className="text-xs text-slate-500 flex items-center gap-1 font-times">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {member.phone || 'គ្មានលេខ'} • {member.occupation}
                          </p>
                        </div>
                      </div>

                      {/* Quick Inline Inputs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs w-full sm:w-auto">
                        <div>
                          <label className="block text-[10px] text-slate-500">នាមស័ព្ទ:</label>
                          <input
                            type="text"
                            value={member.honorific}
                            onChange={e => {
                              const val = e.target.value;
                              setMembers(prev => prev.map(m => m.id === member.id ? { ...m, honorific: val } : m));
                            }}
                            className="p-1.5 bg-white border border-slate-300 rounded w-20"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500">ឈ្មោះ:</label>
                          <input
                            type="text"
                            value={member.fullName}
                            onChange={e => {
                              const val = e.target.value;
                              setMembers(prev => prev.map(m => m.id === member.id ? { ...m, fullName: val } : m));
                            }}
                            className="p-1.5 bg-white border border-slate-300 rounded w-28 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500">លេខទូរស័ព្ទ:</label>
                          <input
                            type="text"
                            value={member.phone}
                            onChange={e => {
                              const val = e.target.value;
                              setMembers(prev => prev.map(m => m.id === member.id ? { ...m, phone: val } : m));
                            }}
                            className="p-1.5 bg-white border border-slate-300 rounded w-28 font-times"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500">មុខរបរ:</label>
                          <input
                            type="text"
                            value={member.occupation}
                            onChange={e => {
                              const val = e.target.value;
                              setMembers(prev => prev.map(m => m.id === member.id ? { ...m, occupation: val, occupationCategory: val } : m));
                            }}
                            className="p-1.5 bg-white border border-slate-300 rounded w-24"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setActiveTab('table')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  មើលតារាងសមាសភាព
                </button>
                <button
                  onClick={() => setActiveTab('tree')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  មើលរចនាសម្ព័ន្ធរូបថត
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
