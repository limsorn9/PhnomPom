import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile, HealthRecord } from '../types';
import {
  Printer,
  X,
  HeartPulse,
  Download,
  CheckCircle2,
  Users,
  Search,
  Edit3,
  Sparkles,
  FileText,
  Save,
  Check,
  ChevronRight
} from 'lucide-react';
import { AngkorBorderOrnament } from './AngkorMotif';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';

interface StudentHealthBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent?: Student | null;
  students: Student[];
  schoolProfile: SchoolProfile;
  academicYear?: string;
  onSaveStudentHealth?: (studentId: string, updatedHealth: HealthRecord) => void;
}

export const StudentHealthBookletModal: React.FC<StudentHealthBookletModalProps> = ({
  isOpen,
  onClose,
  selectedStudent,
  students,
  schoolProfile,
  academicYear = '២០២៥-២០២៦',
  onSaveStudentHealth
}) => {
  // Active student selection
  const [currentStudentId, setCurrentStudentId] = useState<string>(
    selectedStudent?.id || (Array.isArray(students) && students.length > 0 ? students[0]?.id || '' : '')
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [activePageView, setActivePageView] = useState<'all' | 'page1' | 'page2' | 'page3'>('all');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Active student object
  const currentStudent = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students.filter(Boolean) : [];
    return safeStudents.find(s => s && s.id === currentStudentId) || selectedStudent || safeStudents[0] || {
      id: 'demo-1',
      code: 'STU-2024-001',
      nameKhmer: 'ខុម សុធីតា',
      nameLatin: 'KHUM SOTHIDA',
      gender: 'F',
      dob: '2018-04-02',
      grade: 3,
      section: 'ក',
      guardianName: 'ខុន សុខុម',
      guardianPhone: '0963565323',
      health: {
        heightCm: 155,
        weightKg: 34.0,
        bmi: 14.15,
        nutritionStatus: 'normal',
        vaccinated: true,
        bloodType: 'A',
        notes: 'ភ្នែកស្តាំស្រវាំងបន្តិច',
        lastCheckedDate: '2024-09-01'
      }
    } as Student;
  }, [students, currentStudentId, selectedStudent]);

  // Compute student age
  const studentAge = useMemo(() => {
    if (!currentStudent.dob) return 8;
    try {
      const birthYear = parseInt(currentStudent.dob.split('-')[0], 10);
      return 2026 - birthYear > 0 ? 2026 - birthYear : 8;
    } catch {
      return 8;
    }
  }, [currentStudent.dob]);

  // Format DOB in Khmer standard DD-MM-YYYY (e.g. ០២-០៤-២០១៨)
  const formattedDobKhmer = useMemo(() => {
    if (!currentStudent.dob) return '០២-០៤-២០១៨';
    const parts = currentStudent.dob.split('-');
    if (parts.length === 3) {
      const d = parts[2].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[0];
      return `${d}-${m}-${y}`;
    }
    return currentStudent.dob;
  }, [currentStudent.dob]);

  // State for Page 2: Disease History Checkboxes (Disease Treated at Present and Past)
  // Default values initialized to match screenshot:
  // Checked (A mark): malaria, diabetes, heart, typhoid, hepatitis, cancer, allergy, eyeDisease, worms
  const [diseaseHistory, setDiseaseHistory] = useState<{ [key: string]: boolean }>({
    dengue: false, // ជំងឺគ្រុនឈាម
    tb: false, // ជំងឺរបេង
    malaria: true, // ជំងឺគ្រុនចាញ់ (A)
    diabetes: true, // ជំងឺទឹកនោមផ្អែម (A)
    anemia: false, // ជំងឺរោគខ្វះឈាម
    polio: false, // ជំងឺស្វិតដៃជើង
    heart: true, // ជំងឺបេះដូង (A)
    typhoid: true, // ជំងឺគ្រុនពោះវៀន (A)
    hepatitis: true, // ជំងឺរលាកថ្លើម (A)
    cancer: true, // ជំងឺមហារីក (A)
    allergy: true, // ជំងឺប្រតិកម្ម (A)
    meningitis: false, // ជំងឺរលាកស្រោមខួរ
    eyeDisease: true, // ជំងឺរោគភ្នែក (A)
    worms: true, // ជំងឺដង្កូវព្រូន (A)
    deafness: false, // ជំងឺត្រចៀកថ្លង់
    hivAids: false // ជំងឺអេដស៍
  });

  const [otherDiseaseNote, setOtherDiseaseNote] = useState<string>('មានលើសពីហ្នឹងទៀត');

  // State for Page 3: Medical Examination Checkups (Dual checks)
  const [examRecords, setExamRecords] = useState({
    check1: {
      date: '02-02-2024',
      height: 155,
      weight: 34.0,
      eyeRight: 'ស្រវាំង',
      eyeLeft: 'ធម្មតា',
      hearingRight: 'ធម្មតា',
      hearingLeft: 'ធម្មតា',
      heartLung: 'ធម្មតា',
      doctorImpression: 'មិនអី',
      doctorName: 'កុក',
      guardianAgreed: 'ធម្មតា'
    },
    check2: {
      date: '01-09-2024',
      height: 156,
      weight: 35.0,
      eyeRight: 'ស្រវាំង',
      eyeLeft: 'ធម្មតា',
      hearingRight: 'ធម្មតា',
      hearingLeft: 'ធម្មតា',
      heartLung: 'ធម្មតា',
      doctorImpression: 'មិនអីទេ',
      doctorName: 'កុក',
      guardianAgreed: 'ធម្មតា'
    }
  });

  // Toggle disease checkbox
  const toggleDisease = (key: string) => {
    setDiseaseHistory(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    printElement('health-booklet-printable-container', {
      landscape: false,
      pageTitle: `សៀវភៅសុខភាព_${currentStudent?.nameKhmer || 'សិស្ស'}`
    });
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const filename = `សៀវភៅសុខភាព_${currentStudent?.nameKhmer || 'សិស្ស'}_${currentStudent?.grade || ''}${currentStudent?.section || ''}_${schoolProfile.nameKhmer || 'សាលារៀន'}.pdf`;
      await downloadElementAsPdf('health-booklet-printable-container', filename, {
        landscape: false
      });
    } catch (err) {
      console.error('Failed to export Health Booklet PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Filter student list for picker
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchGrade = filterGrade === 'all' || s.grade === filterGrade;
      const matchQuery =
        !searchQuery ||
        s.nameKhmer.includes(searchQuery) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGrade && matchQuery;
    });
  }, [students, filterGrade, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="student-health-booklet-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-battambang animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-3 sm:p-4 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-400/30">
              <HeartPulse className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-moul">
                  សៀវភៅ សុខភាព (សម្រាប់សិស្ស)
                </h3>
                <span className="px-2 py-0.5 bg-rose-500/30 text-rose-200 border border-rose-400/40 rounded-full text-[10px] font-bold">
                  ទម្រង់ ៣ ទំព័រពេញលេញ
                </span>
              </div>
              <p className="text-[11px] text-blue-100/80">
                គម្របមុខ • ប្រវត្តិជំងឺឆ្លងកាត់ • លទ្ធផលពិនិត្យសុខភាពតាមលើក
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Student Picker Trigger / Dropdown */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl border border-white/20 text-xs">
              <span className="text-blue-200">សិស្ស៖</span>
              <select
                value={currentStudentId}
                onChange={e => setCurrentStudentId(e.target.value)}
                className="bg-slate-800 text-white font-bold px-2 py-0.5 rounded border border-white/30 text-xs max-w-[150px] truncate focus:outline-none"
              >
                {students.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.nameKhmer} ({st.grade}{st.section})
                  </option>
                ))}
              </select>
            </div>

            {/* Page View Filter */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/20 text-xs">
              <button
                type="button"
                onClick={() => setActivePageView('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  activePageView === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                ៣ ទំព័រ
              </button>
              <button
                type="button"
                onClick={() => setActivePageView('page1')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  activePageView === 'page1' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                ទំព័រ ១
              </button>
              <button
                type="button"
                onClick={() => setActivePageView('page2')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  activePageView === 'page2' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                ទំព័រ ២
              </button>
              <button
                type="button"
                onClick={() => setActivePageView('page3')}
                className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  activePageView === 'page3' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                ទំព័រ ៣
              </button>
            </div>

            {/* Edit Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isEditMode
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'កំពុងកែសម្រួល' : 'កែទិន្នន័យ'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'កំពុងបង្កើត...' : 'ទាញយកជា PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ព (Print)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Scrollable Area */}
        <div
          id="health-booklet-printable-container"
          className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200 flex flex-col items-center gap-8"
        >
          
          {/* PAGE 1: គម្របមុខ (Cover Page) */}
          {(activePageView === 'all' || activePageView === 'page1') && (
            <div
              id="health-booklet-page-1"
              className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-[16mm] shadow-xl border-2 border-blue-900 rounded-sm relative flex flex-col justify-between select-text print:shadow-none print:m-0 print:border-2 print:border-blue-900 print:page-break-after-always"
              style={{ pageBreakAfter: 'always' }}
            >
              {/* Ornate Khmer Corners Frame */}
              <div className="absolute inset-2 border border-blue-800 pointer-events-none" />
              <div className="absolute inset-3 border-2 border-blue-900 pointer-events-none" />

              {/* Decorative Khmer Kbach Ornaments on 4 Corners */}
              <div className="absolute top-4 left-4 text-blue-900 text-2xl font-bold select-none leading-none">
                ❖
              </div>
              <div className="absolute top-4 right-4 text-blue-900 text-2xl font-bold select-none leading-none">
                ❖
              </div>
              <div className="absolute bottom-4 left-4 text-blue-900 text-2xl font-bold select-none leading-none">
                ❖
              </div>
              <div className="absolute bottom-4 right-4 text-blue-900 text-2xl font-bold select-none leading-none">
                ❖
              </div>

              {/* Top Header: ព្រះរាជាណាចក្រកម្ពុជា */}
              <div className="text-center pt-4 z-10">
                <h1 className="font-moul text-base sm:text-lg text-blue-950 font-bold tracking-wide">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </h1>
                <h2 className="font-moul text-sm sm:text-base text-blue-950 font-bold mt-1">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </h2>
                
                {/* Traditional Khmer divider */}
                <div className="flex items-center justify-center gap-2 my-2 text-blue-800">
                  <div className="w-16 h-[1.5px] bg-blue-700" />
                  <span className="text-xs">❖ ៚ ❖</span>
                  <div className="w-16 h-[1.5px] bg-blue-700" />
                </div>
              </div>

              {/* Center Emblem: Large Red Cross (+) */}
              <div className="my-auto text-center z-10 py-6">
                <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 text-red-600 mb-6 drop-shadow-sm">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-red-600">
                    {/* Bold Medical Red Cross (+) */}
                    <rect x="36" y="5" width="28" height="90" rx="2" />
                    <rect x="5" y="36" width="90" height="28" rx="2" />
                  </svg>
                </div>

                {/* Big Title: សៀវភៅ សុខភាព */}
                <h1 className="font-moul text-3xl sm:text-4xl text-blue-800 tracking-wider mb-2 drop-shadow-xs">
                  សៀវភៅ សុខភាព
                </h1>
                <p className="font-moul text-base sm:text-lg text-blue-950 font-bold mb-6">
                  ( សម្រាប់សិស្ស )
                </p>

                {/* School Name */}
                <h2 className="font-moul text-xl sm:text-2xl text-red-700 font-bold mt-4">
                  {schoolProfile.nameKhmer || 'សាលាបឋមសិក្សា ភ្នំពុំ'}
                </h2>
              </div>

              {/* Student Metadata Card (Large & High Contrast) */}
              <div className="z-10 pb-8 px-4 sm:px-12 text-sm sm:text-base font-battambang">
                <div className="space-y-4">
                  
                  {/* Name & Gender */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-moul text-red-700 font-bold text-base sm:text-lg">
                        ឈ្មោះ:
                      </span>
                      <span className="font-moul text-blue-950 font-bold text-lg sm:text-xl ml-2">
                        {currentStudent.nameKhmer}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-moul text-red-700 font-bold text-base sm:text-lg">
                        ភេទ:
                      </span>
                      <span className="font-moul text-blue-950 font-bold text-base sm:text-lg ml-1">
                        {currentStudent.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                      </span>
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-moul text-red-700 font-bold text-base sm:text-lg">
                      ថ្ងៃខែឆ្នាំកំណើត:
                    </span>
                    <span className="font-times font-bold text-blue-950 text-base sm:text-xl tracking-wider ml-2">
                      {formattedDobKhmer}
                    </span>
                  </div>

                  {/* Blood Type & RH */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-moul text-red-700 font-bold text-base sm:text-lg">
                        ប្រភេទឈាម:
                      </span>
                      <span className="font-times font-bold text-blue-950 text-lg sm:text-xl ml-2">
                        {currentStudent.health?.bloodType || 'A'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-times font-bold text-red-700 text-base sm:text-lg">
                        RH:
                      </span>
                      <span className="font-times font-bold text-blue-950 text-base sm:text-lg ml-1">
                        + / -
                      </span>
                    </div>
                  </div>

                  {/* Guardian Name */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-moul text-red-700 font-bold text-base sm:text-lg">
                      ឈ្មោះអាណាព្យាបាល:
                    </span>
                    <span className="font-moul text-blue-950 font-bold text-base sm:text-lg ml-2">
                      {currentStudent.guardianName || currentStudent.fatherName || 'ខុន សុខុម'}
                    </span>
                  </div>

                  {/* Guardian Phone */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-moul text-red-700 font-bold text-base sm:text-lg">
                      លេខទូរស័ព្ទ:
                    </span>
                    <span className="font-times font-bold text-blue-950 text-base sm:text-xl tracking-wider ml-2">
                      {currentStudent.guardianPhone || '0963565323'}
                    </span>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* PAGE 2: ប្រវត្តិជំងឺ (Disease Treated at Present and Past) */}
          {(activePageView === 'all' || activePageView === 'page2') && (
            <div
              id="health-booklet-page-2"
              className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-[16mm] shadow-xl border-2 border-blue-900 rounded-sm relative flex flex-col justify-between select-text print:shadow-none print:m-0 print:border-2 print:border-blue-900 print:page-break-after-always"
              style={{ pageBreakAfter: 'always' }}
            >
              {/* Outer Blue Frame */}
              <div className="absolute inset-2 border border-blue-800 pointer-events-none" />
              <div className="absolute inset-3 border-2 border-blue-900 pointer-events-none" />

              <div>
                {/* Header Title in Khmer & English */}
                <div className="text-center pt-4 mb-6 z-10">
                  <h2 className="font-moul text-base sm:text-lg text-slate-950 font-bold leading-relaxed px-4">
                    កន្លងមកបើអ្នកធ្លាប់ និងឆ្លងកាត់នូវប្រភេទជំងឺ
                    <br />
                    ណាមួយខាងក្រោមនេះសូមគូសសញ្ញា{' '}
                    <span className="text-red-600 font-times text-xl">A</span>
                  </h2>
                  <p className="font-times font-bold text-blue-900 text-sm mt-1">
                    (Disease Treated at Present and Past)
                  </p>
                </div>

                {/* 16 Diseases Table Grid (2 Columns, 8 Rows) matching Screenshot exactly */}
                <div className="border-2 border-blue-900 text-xs sm:text-sm font-battambang bg-white">
                  <div className="grid grid-cols-2 divide-x-2 divide-blue-900">
                    
                    {/* Left Column (8 Diseases) */}
                    <div className="divide-y-2 divide-blue-900">
                      
                      {/* Row 1: ជំងឺគ្រុនឈាម */}
                      <div
                        onClick={() => isEditMode && toggleDisease('dengue')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ គ្រុនឈាម</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.dengue ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 2: ជំងឺគ្រុនចាញ់ (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('malaria')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ គ្រុនចាញ់</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.malaria ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 3: ជំងឺរោគខ្វះឈាម */}
                      <div
                        onClick={() => isEditMode && toggleDisease('anemia')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ រោគខ្វះឈាម</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.anemia ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 4: ជំងឺបេះដូង (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('heart')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ បេះដូង</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.heart ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 5: ជំងឺរលាកថ្លើម (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('hepatitis')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ រលាកថ្លើម</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.hepatitis ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 6: ជំងឺប្រតិកម្ម (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('allergy')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ ប្រតិកម្ម</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.allergy ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 7: ជំងឺរោគភ្នែក (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('eyeDisease')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ រោគភ្នែក</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.eyeDisease ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 8: ជំងឺត្រចៀកថ្លង់ */}
                      <div
                        onClick={() => isEditMode && toggleDisease('deafness')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ ត្រចៀកថ្លង់</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.deafness ? 'A' : ''}
                        </div>
                      </div>

                    </div>

                    {/* Right Column (8 Diseases) */}
                    <div className="divide-y-2 divide-blue-900">
                      
                      {/* Row 1: ជំងឺរបេង */}
                      <div
                        onClick={() => isEditMode && toggleDisease('tb')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ របេង</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.tb ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 2: ជំងឺទឹកនោមផ្អែម (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('diabetes')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ ទឹកនោមផ្អែម</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.diabetes ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 3: ជំងឺស្វិតដៃជើង */}
                      <div
                        onClick={() => isEditMode && toggleDisease('polio')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ ស្វិតដៃជើង</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.polio ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 4: ជំងឺគ្រុនពោះវៀន (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('typhoid')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ គ្រុនពោះវៀន</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.typhoid ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 5: ជំងឺមហារីក (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('cancer')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ មហារីក</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.cancer ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 6: ជំងឺរលាកស្រោមខួរ */}
                      <div
                        onClick={() => isEditMode && toggleDisease('meningitis')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ រលាកស្រោមខួរ</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.meningitis ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 7: ជំងឺដង្កូវព្រូន (Checked A) */}
                      <div
                        onClick={() => isEditMode && toggleDisease('worms')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ ដង្កូវព្រូន</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.worms ? 'A' : ''}
                        </div>
                      </div>

                      {/* Row 8: ជំងឺអេដស៍ */}
                      <div
                        onClick={() => isEditMode && toggleDisease('hivAids')}
                        className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                          isEditMode ? 'cursor-pointer hover:bg-blue-50' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-950">ជំងឺ អេដស៍</span>
                        <div className="w-10 h-7 border-l-2 border-blue-900 flex items-center justify-center font-times font-bold text-lg text-red-600">
                          {diseaseHistory.hivAids ? 'A' : ''}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>

              {/* Bottom Note Box (បើអ្នកមិនធ្លាប់ជួបនូវប្រភេទជំងឺខាងលើនេះ...) */}
              <div className="z-10 pb-4">
                <div className="text-center mb-3">
                  <h3 className="font-moul text-sm sm:text-base text-slate-950 font-bold leading-relaxed">
                    បើអ្នកមិនធ្លាប់ជួបនូវប្រភេទជំងឺខាងលើនេះ
                    <br />
                    សូមសរសេរឈ្មោះជំងឺផ្សេងៗដែលអ្នកធ្លាប់ជួប។
                  </h3>
                </div>

                <div className="border-2 border-blue-900 p-8 text-center min-h-[120px] flex items-center justify-center">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={otherDiseaseNote}
                      onChange={e => setOtherDiseaseNote(e.target.value)}
                      className="w-full text-center font-moul text-base text-slate-900 border-b border-dashed border-blue-600 p-2 focus:outline-none"
                    />
                  ) : (
                    <p className="font-moul text-base sm:text-lg text-slate-900">
                      {otherDiseaseNote || 'គ្មាន'}
                    </p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* PAGE 3: លទ្ធផលពិនិត្យសុខភាព (Medical Examination Record) */}
          {(activePageView === 'all' || activePageView === 'page3') && (
            <div
              id="health-booklet-page-3"
              className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-[16mm] shadow-xl border-2 border-blue-900 rounded-sm relative flex flex-col justify-between select-text print:shadow-none print:m-0 print:border-2 print:border-blue-900"
            >
              {/* Outer Blue Frame */}
              <div className="absolute inset-2 border border-blue-800 pointer-events-none" />
              <div className="absolute inset-3 border-2 border-blue-900 pointer-events-none" />

              <div>
                {/* Top Strip Header: ថ្នាក់ទី | ឆ្នាំសិក្សា | អាយុ */}
                <div className="border-2 border-blue-900 grid grid-cols-3 text-center text-sm font-battambang font-bold mb-4 bg-slate-50/50">
                  <div className="p-2 border-r-2 border-blue-900 font-moul text-blue-950 text-xs sm:text-sm">
                    ថ្នាក់ទី{currentStudent.grade} "{currentStudent.section}"
                  </div>
                  <div className="p-2 border-r-2 border-blue-900 font-moul text-blue-950 text-xs sm:text-sm">
                    ឆ្នាំសិក្សា {academicYear}
                  </div>
                  <div className="p-2 font-moul text-blue-950 text-xs sm:text-sm">
                    អាយុ {studentAge} ឆ្នាំ
                  </div>
                </div>

                {/* Medical Examination Matrix Table */}
                <table className="w-full border-collapse border-2 border-blue-900 text-xs sm:text-sm font-battambang">
                  <thead>
                    <tr className="border-b-2 border-blue-900 text-center font-bold">
                      
                      {/* Diagonal Cell for Examination / Date */}
                      <th className="border-r-2 border-blue-900 p-2 w-48 relative h-16">
                        <div className="absolute top-2 right-3 font-times font-bold text-xs text-blue-900">
                          Date
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <svg className="w-full h-full">
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#1e3a8a" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <div className="absolute bottom-2 left-3 font-times font-bold text-xs text-blue-900">
                          Examination
                        </div>
                      </th>

                      {/* លើកទី១ */}
                      <th className="border-r-2 border-blue-900 p-2 w-40 text-center font-moul text-blue-950 text-xs sm:text-sm">
                        លើកទី១
                        <span className="block font-times text-red-600 font-bold text-xs sm:text-sm mt-1">
                          {examRecords.check1.date}
                        </span>
                      </th>

                      {/* លើកទី២ */}
                      <th className="p-2 w-40 text-center font-moul text-blue-950 text-xs sm:text-sm">
                        លើកទី២
                        <span className="block font-times text-red-600 font-bold text-xs sm:text-sm mt-1">
                          {examRecords.check2.date}
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    
                    {/* កម្ពស់ (Height) */}
                    <tr className="border-b-2 border-blue-900">
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm">
                        កម្ពស់ <span className="font-times font-normal text-xs text-slate-600">( Height )</span>
                      </td>
                      <td className="border-r-2 border-blue-900 p-2.5 text-center font-times font-bold text-slate-900">
                        {examRecords.check1.height} cm
                      </td>
                      <td className="p-2.5 text-center font-times font-bold text-slate-900">
                        {examRecords.check2.height} cm
                      </td>
                    </tr>

                    {/* ទម្ងន់ (Weight) */}
                    <tr className="border-b-2 border-blue-900">
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm">
                        ទម្ងន់ <span className="font-times font-normal text-xs text-slate-600">( Weight )</span>
                      </td>
                      <td className="border-r-2 border-blue-900 p-2.5 text-center font-times font-bold text-slate-900">
                        {examRecords.check1.weight.toFixed(2)} Kg
                      </td>
                      <td className="p-2.5 text-center font-times font-bold text-slate-900">
                        {examRecords.check2.weight.toFixed(2)} Kg
                      </td>
                    </tr>

                    {/* ភ្នែក (Eye sight) */}
                    <tr className="border-b-2 border-blue-900">
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm align-top">
                        ភ្នែក
                        <span className="block font-times font-normal text-xs text-slate-600">
                          ( Eye sight )
                        </span>
                      </td>
                      <td className="border-r-2 border-blue-900 p-0 text-center">
                        <div className="grid grid-cols-2 divide-x border-b border-blue-800 p-1">
                          <span className="font-bold text-blue-950">ស្ដាំ</span>
                          <span className="font-bold text-red-600">{examRecords.check1.eyeRight}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x p-1">
                          <span className="font-bold text-blue-950">ឆ្វេង</span>
                          <span className="font-bold text-slate-800">{examRecords.check1.eyeLeft}</span>
                        </div>
                      </td>
                      <td className="p-0 text-center">
                        <div className="grid grid-cols-2 divide-x border-b border-blue-800 p-1">
                          <span className="font-bold text-blue-950">ស្ដាំ</span>
                          <span className="font-bold text-red-600">{examRecords.check2.eyeRight}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x p-1">
                          <span className="font-bold text-blue-950">ឆ្វេង</span>
                          <span className="font-bold text-slate-800">{examRecords.check2.eyeLeft}</span>
                        </div>
                      </td>
                    </tr>

                    {/* ត្រចៀក (Hearing) */}
                    <tr className="border-b-2 border-blue-900">
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm align-top">
                        ត្រចៀក
                        <span className="block font-times font-normal text-xs text-slate-600">
                          ( Hearing )
                        </span>
                      </td>
                      <td className="border-r-2 border-blue-900 p-0 text-center">
                        <div className="grid grid-cols-2 divide-x border-b border-blue-800 p-1">
                          <span className="font-bold text-blue-950">ស្ដាំ</span>
                          <span className="font-bold text-slate-800">{examRecords.check1.hearingRight}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x p-1">
                          <span className="font-bold text-blue-950">ឆ្វេង</span>
                          <span className="font-bold text-slate-800">{examRecords.check1.hearingLeft}</span>
                        </div>
                      </td>
                      <td className="p-0 text-center">
                        <div className="grid grid-cols-2 divide-x border-b border-blue-800 p-1">
                          <span className="font-bold text-blue-950">ស្ដាំ</span>
                          <span className="font-bold text-slate-800">{examRecords.check2.hearingRight}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x p-1">
                          <span className="font-bold text-blue-950">ឆ្វេង</span>
                          <span className="font-bold text-slate-800">{examRecords.check2.hearingLeft}</span>
                        </div>
                      </td>
                    </tr>

                    {/* ពិនិត្យបេះដូង និងសួត (Medical Examination) */}
                    <tr className="border-b-2 border-blue-900">
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm">
                        ពិនិត្យបេះដូង និងសួត
                        <span className="block font-times font-normal text-xs text-slate-600">
                          ( Medical Examination )
                        </span>
                      </td>
                      <td className="border-r-2 border-blue-900 p-2.5 text-center font-bold text-slate-800">
                        {examRecords.check1.heartLung}
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-800">
                        {examRecords.check2.heartLung}
                      </td>
                    </tr>

                    {/* មតិរបស់គ្រូពេទ្យ (Doctor's Impression) */}
                    <tr className="border-b-2 border-blue-900">
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm">
                        មតិរបស់គ្រូពេទ្យ
                        <span className="block font-times font-normal text-xs text-slate-600">
                          ( Doctor's Impression )
                        </span>
                      </td>
                      <td className="border-r-2 border-blue-900 p-2.5 text-center font-bold text-blue-900">
                        {examRecords.check1.doctorImpression}
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-900">
                        {examRecords.check2.doctorImpression}
                      </td>
                    </tr>

                    {/* ឈ្មោះគ្រូពេទ្យ (Name of Doctor) */}
                    <tr className="border-b-2 border-blue-900">
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm">
                        ឈ្មោះគ្រូពេទ្យ
                        <span className="block font-times font-normal text-xs text-slate-600">
                          ( Name of Doctor )
                        </span>
                      </td>
                      <td className="border-r-2 border-blue-900 p-2.5 text-center font-bold font-moul text-blue-950">
                        {examRecords.check1.doctorName}
                      </td>
                      <td className="p-2.5 text-center font-bold font-moul text-blue-950">
                        {examRecords.check2.doctorName}
                      </td>
                    </tr>

                    {/* ការឯកភាពរបស់មាតាបិតា ឬអាណាព្យាបាល */}
                    <tr>
                      <td className="border-r-2 border-blue-900 p-2.5 font-bold font-moul text-blue-950 text-xs sm:text-sm">
                        ការឯកភាពរបស់មាតា
                        <br />
                        បិតា ឬអាណាព្យាបាល
                      </td>
                      <td className="border-r-2 border-blue-900 p-4 text-center">
                        <div className="h-12 flex items-center justify-center text-slate-400 text-xs italic">
                          (ស្នាមមេដៃ / ហត្ថលេខា)
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="h-12 flex items-center justify-center text-slate-400 text-xs italic">
                          (ស្នាមមេដៃ / ហត្ថលេខា)
                        </div>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Bottom footer footnote */}
              <div className="text-center pt-4 text-slate-500 text-xs font-battambang">
                *កំណត់ត្រាសុខភាពផ្លូវការសម្រាប់តាមដានការលូតលាស់ និងសុខុមាលភាពសិស្សក្នុងសាលាបឋមសិក្សា
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
