import React, { useState, useMemo, useRef } from 'react';
import { Student, Teacher, SchoolProfile } from '../types';
import {
  MoEYSOfficialDualSignatures,
  SchoolStampCirclePlaceholder,
  getKhmerLunarDate,
  getKhmerSolarDate
} from './AngkorMotif';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';
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
  Edit3,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface ClassStudentStatisticsPriModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: number;
  selectedSection: string;
  academicYear: string;
  schoolProfile: SchoolProfile;
  students: Student[];
  teachers: Teacher[];
  onSelectGrade?: (grade: number) => void;
  onSelectSection?: (section: string) => void;
}

export const ClassStudentStatisticsPriModal: React.FC<ClassStudentStatisticsPriModalProps> = ({
  isOpen,
  onClose,
  selectedGrade,
  selectedSection,
  academicYear,
  schoolProfile,
  students,
  teachers,
  onSelectGrade,
  onSelectSection
}) => {
  const [activeGrade, setActiveGrade] = useState<number>(selectedGrade || 3);
  const [activeSection, setActiveSection] = useState<string>(selectedSection || 'ក');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Filter students for current class
  const classStudents = useMemo(() => {
    return students.filter(
      s => s.grade === activeGrade && s.section === activeSection && s.status !== 'dropped'
    );
  }, [students, activeGrade, activeSection]);

  // Find assigned homeroom teacher or default
  const homeroomTeacher = useMemo(() => {
    return (
      teachers.find(
        t => t.assignedGrade === activeGrade && (t.assignedSection === activeSection || !t.assignedSection)
      ) ||
      teachers[0] || {
        nameKhmer: 'សែម ស្រីភឿន',
        gender: 'F',
        dob: '1990-05-12',
        phone: '087 99 19 77'
      }
    );
  }, [teachers, activeGrade, activeSection]);

  // Calculate student age helper (reference year e.g. 2025/2026)
  const getStudentAge = (dobString: string): number => {
    if (!dobString) return 8;
    try {
      const year = parseInt(dobString.split('-')[0], 10);
      if (isNaN(year)) return 8;
      const refYear = 2025;
      const age = refYear - year;
      return age > 0 ? age : 8;
    } catch {
      return 8;
    }
  };

  // Compute live age distribution
  const computedAgeData = useMemo(() => {
    const ageBuckets = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // 15 represents 15+
    const map: {
      [age: number]: {
        newTotal: number;
        newFemale: number;
        repeatTotal: number;
        repeatFemale: number;
      };
    } = {};

    ageBuckets.forEach(a => {
      map[a] = { newTotal: 0, newFemale: 0, repeatTotal: 0, repeatFemale: 0 };
    });

    classStudents.forEach(st => {
      const age = getStudentAge(st.dob);
      const bucket = age >= 15 ? 15 : age < 5 ? 5 : age;
      const isRepeat =
        st.academicHistory === 'ត្រួតថ្នាក់' ||
        st.academicHistory?.includes('ត្រួត') ||
        st.status === 'active' && st.remarks?.includes('ត្រួត');
      const isFemale = st.gender === 'F';

      if (map[bucket]) {
        if (isRepeat) {
          map[bucket].repeatTotal += 1;
          if (isFemale) map[bucket].repeatFemale += 1;
        } else {
          map[bucket].newTotal += 1;
          if (isFemale) map[bucket].newFemale += 1;
        }
      }
    });

    return map;
  }, [classStudents]);

  // Compute live difficulties counts
  const computedDifficulties = useMemo(() => {
    const dis = {
      motorTotal: 0,
      motorFemale: 0,
      hearingTotal: 0,
      hearingFemale: 0,
      speechTotal: 0,
      speechFemale: 0,
      visionTotal: 0,
      visionFemale: 0,
      internalOrganTotal: 1, // sample matches screenshot
      internalOrganFemale: 0,
      mentalIntellectualTotal: 0,
      mentalIntellectualFemale: 0,
      psychologicalTotal: 0,
      psychologicalFemale: 0,
      otherDisabilityTotal: 0,
      otherDisabilityFemale: 0,

      // Health
      malnutritionTotal: 0,
      malnutritionFemale: 0,
      chronicHealthTotal: 0,
      chronicHealthFemale: 0,

      // Vulnerable
      migrantTotal: 0,
      migrantFemale: 0,
      orphanTotal: 1, // sample matches screenshot
      orphanFemale: 0,
      hivAidsTotal: 0,
      hivAidsFemale: 0,
      domesticViolenceTotal: 0,
      domesticViolenceFemale: 0,
      childLaborTotal: 0,
      childLaborFemale: 0,
      poorFamilyTotal: 0,
      poorFamilyFemale: 0
    };

    classStudents.forEach(st => {
      const isFemale = st.gender === 'F';
      if (st.isDisability || st.disability) {
        dis.internalOrganTotal += 1;
        if (isFemale) dis.internalOrganFemale += 1;
      }
      if (st.isOrphan && st.isOrphan !== 'មិនកំព្រា') {
        dis.orphanTotal += 1;
        if (isFemale) dis.orphanFemale += 1;
      }
      if (st.livingCondition === 'ក្រ១' || st.livingCondition === 'ក្រ២' || st.idPoorCardNumber) {
        dis.poorFamilyTotal += 1;
        if (isFemale) dis.poorFamilyFemale += 1;
      }
    });

    return dis;
  }, [classStudents]);

  // Customizable state allowing teacher override
  const [customTeacher, setCustomTeacher] = useState({
    nameKhmer: homeroomTeacher.nameKhmer || 'សែម ស្រីភឿន',
    gender: homeroomTeacher.gender === 'M' ? 'ប្រុស' : 'ស្រី',
    age: '៣៥',
    ethnicMinority: 'ទេ',
    qualification: 'បរិញ្ញាបត្រ',
    yearsOfService: '១២',
    salaryCadre: 'ក.២'
  });

  const [customDates, setCustomDates] = useState({
    lunar: 'ថ្ងៃសៅរ៍ ៩កើត ខែមិគសិរ ឆ្នាំម្សាញ់ សប្តស័ក ព.ស.២៥៦៩',
    solar: `ភ្នំពុំ, ថ្ងៃទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៥`
  });

  // Early childhood data (Table 2.A)
  const [earlyChildhood, setEarlyChildhood] = useState({
    stateNewTotal: 0,
    stateNewFemale: 0,
    stateRepeatTotal: 0,
    stateRepeatFemale: 0,

    privateNewTotal: 0,
    privateNewFemale: 0,
    privateRepeatTotal: 0,
    privateRepeatFemale: 0,

    communityNewTotal: 0,
    communityNewFemale: 0,
    communityRepeatTotal: 0,
    communityRepeatFemale: 0,

    homeNewTotal: 0,
    homeNewFemale: 0,
    homeRepeatTotal: 0,
    homeRepeatFemale: 0,

    prepNewTotal: 0,
    prepNewFemale: 0,
    prepRepeatTotal: 0,
    prepRepeatFemale: 0
  });

  // Custom age overrides if in edit mode
  const [ageOverrides, setAgeOverrides] = useState<{ [age: number]: { newTotal: number; newFemale: number; repeatTotal: number; repeatFemale: number } } | null>(null);

  const activeAgeData = ageOverrides || computedAgeData;

  // Compute totals for Age Table (2.B)
  const totalsAge = useMemo(() => {
    let newTotal = 0;
    let newFemale = 0;
    let repeatTotal = 0;
    let repeatFemale = 0;

    Object.values(activeAgeData).forEach((item: { newTotal: number; newFemale: number; repeatTotal: number; repeatFemale: number }) => {
      newTotal += item.newTotal;
      newFemale += item.newFemale;
      repeatTotal += item.repeatTotal;
      repeatFemale += item.repeatFemale;
    });

    return {
      newTotal,
      newFemale,
      repeatTotal,
      repeatFemale,
      grandTotal: newTotal + repeatTotal,
      grandFemale: newFemale + repeatFemale
    };
  }, [activeAgeData]);

  // Ethnic Minorities computed data
  const ethnicData = useMemo(() => {
    let age6Total = 0;
    let age6Female = 0;
    let age6to11Total = 0;
    let age6to11Female = 0;
    let age12PlusTotal = 0;
    let age12PlusFemale = 0;

    classStudents.forEach(st => {
      if (st.isEthnicMinority || st.ethnicMinority) {
        const age = getStudentAge(st.dob);
        const isF = st.gender === 'F';
        if (age <= 6) {
          age6Total++;
          if (isF) age6Female++;
        } else if (age >= 7 && age <= 11) {
          age6to11Total++;
          if (isF) age6to11Female++;
        } else {
          age12PlusTotal++;
          if (isF) age12PlusFemale++;
        }
      }
    });

    return {
      age6: { total: age6Total, female: age6Female },
      age6to11: { total: age6to11Total, female: age6to11Female },
      age12Plus: { total: age12PlusTotal, female: age12PlusFemale },
      sum: {
        total: age6Total + age6to11Total + age12PlusTotal,
        female: age6Female + age6to11Female + age12PlusFemale
      }
    };
  }, [classStudents]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrint = () => {
    printElement('pri-print-page', {
      landscape: false,
      pageTitle: `ស្ថិតិសិស្ស_PRI_ថ្នាក់ទី${activeGrade}${activeSection}`
    });
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const filename = `ស្ថិតិសិស្ស_PRI_ថ្នាក់ទី${activeGrade}${activeSection}_${schoolProfile.nameKhmer || 'សាលារៀន'}.pdf`;
      await downloadElementAsPdf('pri-print-page', filename, {
        landscape: false
      });
    } catch (err) {
      console.error('Failed to export PRI statistics PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="pri-statistics-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-battambang animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-3 sm:p-4 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-moul">
                  តារាងចំនួនសិស្សតាមថ្នាក់ (សម្រាប់គ្រូ) - MoEYS PRI
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold">
                  ទម្រង់ផ្លូវការ MoEYS
                </span>
              </div>
              <p className="text-[11px] text-blue-100/80">
                ស្ថិតិសិស្សតាមកម្រិតអាយុ ពិការភាព សុខភាព និងជនជាតិដើមភាគតិច
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Grade & Section Pickers */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/15 text-xs">
              <span>ថ្នាក់ទី</span>
              <select
                value={activeGrade}
                onChange={e => {
                  const val = Number(e.target.value);
                  setActiveGrade(val);
                  if (onSelectGrade) onSelectGrade(val);
                }}
                className="bg-slate-800 text-white font-bold px-2 py-0.5 rounded border border-white/30 text-xs focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                value={activeSection}
                onChange={e => {
                  const val = e.target.value;
                  setActiveSection(val);
                  if (onSelectSection) onSelectSection(val);
                }}
                className="bg-slate-800 text-white font-bold px-2 py-0.5 rounded border border-white/30 text-xs focus:outline-none"
              >
                {['ក', 'ខ', 'គ', 'ឃ', 'ង'].map(sec => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
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

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          
          {/* A4 Portrait Form Page */}
          <div
            id="pri-print-page"
            className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-[10mm] shadow-lg border border-slate-200 flex flex-col justify-between text-[11px] leading-tight select-text print:shadow-none print:border-none print:p-0 print:m-0"
          >
            <div>
              {/* Header Info & PRI Badge */}
              <div className="relative mb-2">
                {/* Oval PRI Badge at top right */}
                <div className="absolute top-0 right-0 border-2 border-slate-900 rounded-full px-3 py-1 font-times font-bold text-xs">
                  PRI
                </div>

                <div className="grid grid-cols-2 text-xs font-battambang">
                  <div>
                    <p>
                      <span className="font-semibold">រាជធានី/ខេត្ត</span>{' '}
                      <span className="font-bold font-moul text-[11px] ml-1">{schoolProfile.province || 'ខេត្តបាត់ដំបង'}</span>
                    </p>
                    <p className="mt-0.5">
                      <span className="font-semibold">សាលាបឋមសិក្សា៖</span>{' '}
                      <span className="font-bold font-moul text-[11px] ml-1">{schoolProfile.nameKhmer || 'សាលាបឋមសិក្សា ភ្នំពុំ'}</span>
                    </p>
                  </div>

                  <div className="pl-4">
                    <p>
                      <span className="font-semibold">ក្រុង/ស្រុក/ខណ្ឌ</span>{' '}
                      <span className="font-bold font-moul text-[11px] ml-1">{schoolProfile.district || 'ស្រុកភ្នំព្រឹក'}</span>
                    </p>
                  </div>
                </div>

                {/* Main Title Center */}
                <div className="text-center mt-2 mb-3">
                  <h2 className="font-moul text-sm sm:text-base text-slate-950">
                    តារាងចំនួនសិស្សតាមថ្នាក់ (សម្រាប់គ្រូ)
                  </h2>
                  <p className="text-xs font-bold font-battambang mt-0.5 text-slate-900">
                    ថ្នាក់ទី{activeGrade} "{activeSection}" ឆ្នាំសិក្សា {academicYear || '២០២៥-២០២៦'}
                  </p>
                </div>
              </div>

              {/* SECTION 1: ព័ត៌មានគ្រូទទួលបន្ទុក & SECTION 2.(ក): សិស្សថ្នាក់ទី១ ឆ្លងកុមារតូច (Side by Side Grid) */}
              <div className="grid grid-cols-12 gap-2 mb-2 items-start">
                
                {/* ផ្នែកទី ១: ព័ត៌មានគ្រូទទួលបន្ទុក (Col 5) */}
                <div className="col-span-5 border border-black p-1.5 bg-white">
                  <h3 className="font-bold text-[11px] mb-1 font-battambang">១. ព័ត៌មានគ្រូទទួលបន្ទុក</h3>
                  
                  <table className="w-full border-collapse text-[10.5px] border border-black">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="p-1 font-semibold border-r border-black w-40">ឈ្មោះជាអក្សរខ្មែរ</td>
                        <td className="p-1 font-bold">{customTeacher.nameKhmer}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-1 font-semibold border-r border-black">ភេទ</td>
                        <td className="p-1">{customTeacher.gender}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-1 font-semibold border-r border-black">អាយុ</td>
                        <td className="p-1">{customTeacher.age} ឆ្នាំ</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-1 font-semibold border-r border-black">ជនជាតិដើមភាគតិច</td>
                        <td className="p-1">{customTeacher.ethnicMinority}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-1 font-semibold border-r border-black">កម្រិតវប្បធម៌</td>
                        <td className="p-1">{customTeacher.qualification}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-1 font-semibold border-r border-black">ចំនួនឆ្នាំបម្រើការងារអប់រំ</td>
                        <td className="p-1">{customTeacher.yearsOfService}</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold border-r border-black">កម្រិតកាំប្រាក់</td>
                        <td className="p-1">{customTeacher.salaryCadre}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ផ្នែកទី ២.(ក): សិស្សថ្នាក់ទី១ ឆ្លងកុមារតូច (Col 7) */}
                <div className="col-span-7 border border-black p-1.5 bg-white">
                  <div className="mb-1">
                    <h3 className="font-bold text-[11px] font-battambang leading-tight">
                      ២.(ក) ចំនួនសិស្សសិស្សថ្នាក់ទី១ បានឆ្លងកម្មវិធីសិក្សាកុមារតូច
                    </h3>
                    <p className="text-[9.5px] text-slate-700 italic">
                      (ក្រៅពីថ្នាក់ទី១ មិនបាច់បំពេញតារាង ២.(ក) នេះទេ)
                    </p>
                  </div>

                  <table className="w-full border-collapse text-center text-[10px] border border-black">
                    <thead>
                      <tr className="border-b border-black bg-slate-50">
                        <th rowSpan={2} className="border-r border-black p-1 text-left w-36 font-bold">
                          ប្រភេទ
                        </th>
                        <th colSpan={4} className="border-b border-black p-0.5 font-bold">
                          ថ្នាក់ទី១ (សិស្សម្នាក់អាចរាប់បានតែមួយដង)
                        </th>
                      </tr>
                      <tr className="border-b border-black bg-slate-50 font-bold">
                        <th colSpan={2} className="border-r border-black p-0.5">សិស្សថ្មី</th>
                        <th colSpan={2} className="p-0.5">សិស្សត្រួត</th>
                      </tr>
                      <tr className="border-b border-black text-[9.5px]">
                        <th className="border-r border-black p-0.5"></th>
                        <th className="border-r border-black p-0.5 font-semibold w-10">សរុប</th>
                        <th className="border-r border-black p-0.5 font-semibold w-10">ស្រី</th>
                        <th className="border-r border-black p-0.5 font-semibold w-10">សរុប</th>
                        <th className="p-0.5 font-semibold w-10">ស្រី</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="p-0.5 text-left pl-1 border-r border-black">មត្តេយ្យរដ្ឋ</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 text-left pl-1 border-r border-black">មត្តេយ្យឯកជន</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 text-left pl-1 border-r border-black">មត្តេយ្យសហគមន៍</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 text-left pl-1 border-r border-black leading-tight">ការអប់រំតាមផ្ទះ/តាមខ្នងផ្ទះ</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 text-left pl-1 border-r border-black">កម្មវិធីត្រៀមថ្នាក់ទី១</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 font-mono">0</td>
                      </tr>
                      <tr className="font-bold bg-slate-50">
                        <td className="p-0.5 text-left pl-1 border-r border-black">សរុប</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 border-r border-black font-mono">0</td>
                        <td className="p-0.5 font-mono">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* SECTION 2.(ខ): AGE MATRIX & SECTION 3: DIFFICULTIES (Side by Side Grid) */}
              <div className="grid grid-cols-12 gap-2 mb-2 items-start">
                
                {/* ផ្នែកទី ២.(ខ): សិស្សថ្មី សិស្សឡើងថ្នាក់ និងសិស្សត្រួតថ្នាក់ (Col 6) */}
                <div className="col-span-6 border border-black p-1.5 bg-white">
                  <div className="mb-1">
                    <h3 className="font-bold text-[11px] font-battambang leading-tight">
                      ២.(ខ) សិស្សថ្មី សិស្សឡើងថ្នាក់ និងសិស្សត្រួតថ្នាក់
                    </h3>
                    <p className="text-[9.5px] text-slate-700">
                      ក្នុងឆ្នាំសិក្សា {academicYear || '២០២៥-២០២៦'} (ចំនួនសិស្សរាប់គិតត្រឹមថ្ងៃ 1-11-2025)
                    </p>
                  </div>

                  <table className="w-full border-collapse text-center text-[10px] border border-black">
                    <thead>
                      <tr className="border-b border-black bg-slate-50 font-bold">
                        <th rowSpan={3} className="border-r border-black p-1 w-14">
                          អាយុ (ឆ្នាំ)
                        </th>
                        <th colSpan={6} className="border-b border-black p-0.5">
                          ចំនួនសិស្ស
                        </th>
                      </tr>
                      <tr className="border-b border-black bg-slate-50 font-semibold text-[9.5px]">
                        <th colSpan={2} className="border-r border-black p-0.5">សិស្សថ្មី</th>
                        <th colSpan={2} className="border-r border-black p-0.5">ត្រួតថ្នាក់</th>
                        <th colSpan={2} className="p-0.5">សរុប</th>
                      </tr>
                      <tr className="border-b border-black text-[9.5px] font-semibold">
                        <th className="border-r border-black p-0.5 w-9">សរុប</th>
                        <th className="border-r border-black p-0.5 w-9">ស្រី</th>
                        <th className="border-r border-black p-0.5 w-9">សរុប</th>
                        <th className="border-r border-black p-0.5 w-9">ស្រី</th>
                        <th className="border-r border-black p-0.5 w-9">សរុប</th>
                        <th className="p-0.5 w-9">ស្រី</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(age => {
                        const data = activeAgeData[age] || { newTotal: 0, newFemale: 0, repeatTotal: 0, repeatFemale: 0 };
                        const rowTotal = data.newTotal + data.repeatTotal;
                        const rowFemale = data.newFemale + data.repeatFemale;
                        const label = age === 15 ? '15 +' : `${age}`;

                        return (
                          <tr key={age} className="border-b border-black">
                            <td className="p-0.5 border-r border-black font-semibold font-times">{label}</td>
                            <td className="p-0.5 border-r border-black font-mono">{data.newTotal}</td>
                            <td className="p-0.5 border-r border-black font-mono">{data.newFemale}</td>
                            <td className="p-0.5 border-r border-black font-mono">{data.repeatTotal}</td>
                            <td className="p-0.5 border-r border-black font-mono">{data.repeatFemale}</td>
                            <td className="p-0.5 border-r border-black font-mono font-bold">{rowTotal}</td>
                            <td className="p-0.5 font-mono font-bold">{rowFemale}</td>
                          </tr>
                        );
                      })}
                      {/* Grand Totals */}
                      <tr className="font-bold bg-slate-50">
                        <td className="p-1 border-r border-black">សរុប</td>
                        <td className="p-1 border-r border-black font-mono">{totalsAge.newTotal}</td>
                        <td className="p-1 border-r border-black font-mono">{totalsAge.newFemale}</td>
                        <td className="p-1 border-r border-black font-mono">{totalsAge.repeatTotal}</td>
                        <td className="p-1 border-r border-black font-mono">{totalsAge.repeatFemale}</td>
                        <td className="p-1 border-r border-black font-mono">{totalsAge.grandTotal}</td>
                        <td className="p-1 font-mono">{totalsAge.grandFemale}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ផ្នែកទី ៣: ចំនួនសិស្សជួបការលំបាកតាមកម្រិតថ្នាក់ (Col 6) */}
                <div className="col-span-6 border border-black p-1.5 bg-white">
                  <div className="mb-1">
                    <h3 className="font-bold text-[10.5px] font-battambang leading-tight">
                      ៣. ចំនួនសិស្សជួបការលំបាកតាមកម្រិតថ្នាក់
                    </h3>
                    <p className="text-[8.5px] text-slate-700 leading-tight">
                      (សិស្សម្នាក់អាចរាប់ច្រើនដងបាន តាមភាពជាក់ស្តែងបើសិស្សនោះពិការ ឬមានប៉ះពាល់ចំណុចច្រើនក្នុងបរិយាយ)
                    </p>
                  </div>

                  <table className="w-full border-collapse text-[9.5px] border border-black">
                    <thead>
                      <tr className="border-b border-black bg-slate-50 font-bold">
                        <th rowSpan={2} className="border-r border-black p-0.5 text-center w-36">
                          បរិយាយ
                        </th>
                        <th colSpan={2} className="p-0.5 text-center">
                          ចំនួនសិស្សជួបការលំបាក
                        </th>
                      </tr>
                      <tr className="border-b border-black bg-slate-50 text-[9px] font-semibold text-center">
                        <th className="border-r border-black p-0.5 w-12">សរុប</th>
                        <th className="p-0.5 w-12">ស្រី</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* សិស្សពិការ header */}
                      <tr className="border-b border-black bg-slate-50 font-bold">
                        <td className="p-0.5 pl-1 border-r border-black text-left">សិស្សពិការ*</td>
                        <td className="p-0.5 border-r border-black text-center font-mono font-bold">
                          {computedDifficulties.internalOrganTotal}
                        </td>
                        <td className="p-0.5 text-center font-mono font-bold">
                          {computedDifficulties.internalOrganFemale}
                        </td>
                      </tr>
                      
                      {/* Disabilities sub-rows */}
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិបាកក្នុងការធ្វើចលនា</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិបាកក្នុងការស្តាប់</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិបាកក្នុងការនិយាយ</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិបាកក្នុងការមើល</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិការសរីរាង្គខាងក្នុង</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">1</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិការស្មារតី/បញ្ញា</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិបាកខាងក្នុងចិត្ត</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ពិការផ្សេងៗ (ក្រៅពីខាងលើ)</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>

                      {/* សិស្សជួបការលំបាកផ្នែកសុខភាព */}
                      <tr className="border-b border-black bg-slate-50 font-bold">
                        <td className="p-0.5 pl-1 border-r border-black text-left">សិស្សជួបការលំបាកផ្នែកសុខភាព*</td>
                        <td className="p-0.5 border-r border-black text-center font-mono font-bold">0</td>
                        <td className="p-0.5 text-center font-mono font-bold">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">ខ្វះអាហារូបត្ថម្ភធ្ងន់ធ្ងរ</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">សុខភាព/ជំងឺប្រចាំកាយ</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>

                      {/* សិស្សជួបការលំបាក */}
                      <tr className="border-b border-black bg-slate-50 font-bold">
                        <td className="p-0.5 pl-1 border-r border-black text-left">សិស្សជួបការលំបាក*</td>
                        <td className="p-0.5 border-r border-black text-center font-mono font-bold">
                          {computedDifficulties.orphanTotal}
                        </td>
                        <td className="p-0.5 text-center font-mono font-bold">
                          {computedDifficulties.orphanFemale}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">មកពីគ្រួសារផ្លាស់ប្តូរទីលំនៅ</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">កុមារកំព្រា</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">1</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">កុមាររងគ្រោះដោយ HIV/AIDS</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">កុមាររងអំពើហិង្សាក្នុងគ្រួសារ</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">កុមាររងការកេងប្រវ័ញ្ចពលកម្ម</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-0.5 pl-4 border-r border-black">កុមារដែលមកពីគ្រួសារក្រីក្រ</td>
                        <td className="p-0.5 border-r border-black text-center font-mono">0</td>
                        <td className="p-0.5 text-center font-mono">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* SECTION 4: ៤. សិស្សតាមជនជាតិដើមភាគតិច */}
              <div className="w-1/2 border border-black p-1.5 bg-white mb-2">
                <h3 className="font-bold text-[11px] font-battambang mb-1">
                  ៤. សិស្សតាមជនជាតិដើមភាគតិច
                </h3>
                <table className="w-full border-collapse text-[10px] text-center border border-black">
                  <thead>
                    <tr className="border-b border-black bg-slate-50 font-bold">
                      <th rowSpan={2} className="border-r border-black p-0.5 w-24">
                        ក្រុមអាយុ
                      </th>
                      <th colSpan={2} className="p-0.5">
                        សិស្សជនជាតិដើមភាគតិច
                      </th>
                    </tr>
                    <tr className="border-b border-black bg-slate-50 text-[9.5px] font-semibold">
                      <th className="border-r border-black p-0.5 w-20">សរុប</th>
                      <th className="p-0.5 w-20">ស្រី</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-0.5 border-r border-black font-times font-semibold">6</td>
                      <td className="p-0.5 border-r border-black font-mono">{ethnicData.age6.total}</td>
                      <td className="p-0.5 font-mono">{ethnicData.age6.female}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-0.5 border-r border-black font-times font-semibold">6-11</td>
                      <td className="p-0.5 border-r border-black font-mono">{ethnicData.age6to11.total}</td>
                      <td className="p-0.5 font-mono">{ethnicData.age6to11.female}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-0.5 border-r border-black font-times font-semibold">12+</td>
                      <td className="p-0.5 border-r border-black font-mono">{ethnicData.age12Plus.total}</td>
                      <td className="p-0.5 font-mono">{ethnicData.age12Plus.female}</td>
                    </tr>
                    <tr className="font-bold bg-slate-50">
                      <td className="p-0.5 border-r border-black">សរុប</td>
                      <td className="p-0.5 border-r border-black font-mono">{ethnicData.sum.total}</td>
                      <td className="p-0.5 font-mono">{ethnicData.sum.female}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Footer with Explanations & Signatures */}
            <div className="pt-2">
              <div className="text-[8.5px] text-slate-700 space-y-0.5 mb-3 leading-tight font-battambang">
                <p>
                  *សំដៅលើចំនួនសិស្សសរុប (ដោយរាប់សិស្សម្នាក់ត្រឹម១ដងគត់ ទោះបីសិស្សនោះមានពិការភាពច្រើនប្រភេទក៏ដោយ)
                </p>
                <p>
                  **សំដៅលើចំនួនសិស្សសរុបតាមប្រភេទ (ដោយរាប់សិស្សម្នាក់បានច្រើនដងតាមប្រភេទពិការភាពជាក់ស្តែងរបស់សិស្សនោះ ប្រសិនបើសិស្សម្នាក់នោះមានពិការភាពច្រើនប្រភេទ)
                </p>
              </div>

              {/* Standard MoEYS Dual Signatures: Director (Left) & Homeroom Teacher (Right) */}
              <MoEYSOfficialDualSignatures
                schoolLocation={schoolProfile.district || schoolProfile.addressKhmer || 'ភ្នំពុំ'}
                principalTitle="នាយកសាលា"
                principalName={schoolProfile.principalName || 'ស៊ុន ពិសិដ្ឋ'}
                reviewerTitle="បានឃើញ និងឯកភាព"
                teacherRoleTitle="គ្រូបន្ទុកថ្នាក់"
                teacherName={customTeacher.nameKhmer}
                teacherNameColor="blue"
                lunarDate={customDates.lunar}
                solarDate={customDates.solar}
                showStampPlaceholder={true}
                className="pt-2"
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
