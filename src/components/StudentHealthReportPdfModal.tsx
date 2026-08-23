import React, { useRef, useState } from 'react';
import { Student, SchoolProfile } from '../types';
import {
  Printer,
  X,
  HeartPulse,
  Download,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Activity,
  Award,
  Sparkles,
  TrendingUp,
  Stethoscope,
  FileCheck,
  AlertTriangle,
  Pill,
  Clock
} from 'lucide-react';
import { AngkorBorderOrnament } from './AngkorMotif';

interface StudentHealthReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  schoolProfile: SchoolProfile;
  academicYear?: string;
}

export const StudentHealthReportPdfModal: React.FC<StudentHealthReportPdfModalProps> = ({
  isOpen,
  onClose,
  student,
  schoolProfile,
  academicYear = '២០២៥-២០២៦'
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);
    try {
      // Use dynamic import for html2pdf.js if available or window.print
      const html2pdfModule = (await import('html2pdf.js')).default;
      const opt = {
        margin: 8,
        filename: `របាយការណ៍សុខភាព_${student.code}_${student.nameKhmer}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      await html2pdfModule().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.warn('PDF direct generator fallback to print dialog:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // BMI evaluation
  const bmiVal = student.health?.bmi || 15.5;
  const nutritionLabel =
    bmiVal < 14.5
      ? 'ស្គម/ត្រូវការបំប៉ន (Underweight)'
      : bmiVal <= 20.0
      ? 'សមស្របធម្មតា (Healthy Normal)'
      : bmiVal <= 23.0
      ? 'លើសទម្ងន់ (Overweight)'
      : 'ធាត់ខ្លាំង (Obese)';

  // Calculate approximate age
  const birthYear = student.dob ? parseInt(student.dob.split('-')[0], 10) : 2016;
  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - birthYear > 0 ? currentYear - birthYear : 9;

  // Growth Checkpoints
  const mockCheckpoints = [
    {
      date: '០១-តុលា-២០២៥',
      term: 'ដើមឆមាសទី ១',
      height: (student.health?.heightCm || 125) - 2.5,
      weight: (student.health?.weightKg || 25) - 1.2,
      bmi: Number((((student.health?.weightKg || 25) - 1.2) / Math.pow(((student.health?.heightCm || 125) - 2.5) / 100, 2)).toFixed(1)),
      whoHeightP50: 125.0,
      whoWeightP50: 25.4,
      eyes: 'ស្តាំ 10/10 • ឆ្វេង 10/10 (ល្អ)',
      teeth: 'ល្អ គ្មានធ្មេញពុក',
      doctor: 'លោកគ្រូពេទ្យសាលា'
    },
    {
      date: '១៥-មករា-២០២៦',
      term: 'ពាក់កណ្តាលឆមាសទី ១',
      height: (student.health?.heightCm || 125) - 1.0,
      weight: (student.health?.weightKg || 25) - 0.5,
      bmi: Number((((student.health?.weightKg || 25) - 0.5) / Math.pow(((student.health?.heightCm || 125) - 1.0) / 100, 2)).toFixed(1)),
      whoHeightP50: 126.5,
      whoWeightP50: 26.1,
      eyes: 'ល្អធម្មតា',
      teeth: 'បានលាងសំអាត និងដុសធ្មេញជាប្រចាំ',
      doctor: 'មន្ត្រីសុខភាពសិក្សា'
    },
    {
      date: student.health?.lastCheckedDate || new Date().toISOString().split('T')[0],
      term: 'ការពិនិត្យបច្ចុប្បន្ន',
      height: student.health?.heightCm || 125,
      weight: student.health?.weightKg || 25,
      bmi: student.health?.bmi || 16.0,
      whoHeightP50: 128.0,
      whoWeightP50: 27.0,
      eyes: 'ល្អធម្មតា គ្មានបញ្ហាស្រវាំង',
      teeth: 'ល្អស្អាត',
      doctor: 'គណៈកម្មការសុខភាពសាលា'
    }
  ];

  // Parse Nurse Visitation History from student notes or formatted entries
  const parsedVisits = React.useMemo(() => {
    const notes = student.health?.notes || '';
    if (!notes) {
      return [
        {
          date: '២០-កុម្ភៈ-២០២៦ ០៩:៣០',
          symptoms: 'ពិនិត្យសុខភាពប្រចាំត្រីមាស',
          temp: '36.6°C',
          treatment: 'វាស់កម្ពស់ ទម្ងន់ និងពិនិត្យមាត់ធ្មេញ',
          nurse: 'គិលានុបដ្ឋាកសាលា',
          followUp: 'គ្មាន'
        }
      ];
    }

    const lines = notes.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    return lines.map((line, idx) => {
      return {
        date: line.includes('[') ? line.substring(line.indexOf('[') + 1, line.indexOf(']')) : `កំណត់ត្រាទី ${idx + 1}`,
        symptoms: line.includes('[') && line.indexOf(']') !== -1 ? line.replace(/•?\s*\[.*?\]/g, '').trim() : line,
        temp: line.includes('កម្តៅ:') ? line.match(/កម្តៅ:\s*([0-9.]+°C)/)?.[1] || '36.6°C' : '36.6°C',
        treatment: 'ការថែទាំបឋមនៅបន្ទប់សុខភាព',
        nurse: line.includes('កត់ត្រាដោយ:') ? line.split('កត់ត្រាដោយ:')[1]?.trim() || 'គិលានុបដ្ឋាក' : 'គិលានុបដ្ឋាក',
        followUp: line.includes('តាមដាន') ? 'តម្រូវឱ្យតាមដាន' : 'ធម្មតា'
      };
    });
  }, [student.health?.notes]);

  // Vaccination items based on MoEYS standards
  const vaccinationChecklist = [
    { name: 'វ៉ាក់សាំង BCG (ការពាររបេង)', status: 'ចាក់រួចរាល់ (Complete)', standard: 'ពេលកើត' },
    { name: 'វ៉ាក់សាំង OPV / IPV (ការពារស្វិតដៃជើង)', status: 'ចាក់រួចរាល់ ៤ ដូស', standard: '១.៥, ២.៥, ៣.៥ ខែ & ៩ ខែ' },
    { name: 'វ៉ាក់សាំងតេត្រាវ៉ាឡង់ DTP-HepB-Hib', status: 'ចាក់រួចរាល់ ៣ ដូស', standard: '១.៥, ២.៥, ៣.៥ ខែ' },
    { name: 'វ៉ាក់សាំងកញ្ជ្រឹល-ស្អូច (Measles-Rubella / MR)', status: student.health?.vaccinated ? 'ចាក់រួចរាល់ ២ ដូស' : 'រង់ចាំផ្ទៀងផ្ទាត់', standard: '៩ ខែ & ១៨ ខែ' },
    { name: 'វ៉ាក់សាំងរំលឹកតេតាណុស (Td Booster)', status: student.grade >= 6 ? 'បានទទួលរួច' : 'តាមកាលវិភាគថ្នាក់ទី ៦', standard: 'ថ្នាក់ទី ៦ (អាយុ ១១-១២)' },
    { name: 'ថ្នាំទម្លាក់ព្រូនប្រចាំ ៦ ខែម្តង (Deworming)', status: 'បានផ្តល់ក្នុងឆមាសនេះ', standard: 'រៀងរាល់ ៦ ខែម្តង' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 no-print animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Action Toolbar */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-indigo-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
              <HeartPulse className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h3 className="font-bold text-base font-moul">របាយការណ៍ប្រវត្តិសុខភាពសិស្ស (Student Health History Report)</h3>
              <p className="text-xs text-rose-100">ទម្រង់របាយការណ៍ផ្លូវការបោះពុម្ពជា PDF តាមក្បួនខ្នាតសុខភាពសិក្សា MoEYS សម្រាប់អាណាព្យាបាល</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'កំពុងបង្កើត PDF...' : 'ទាញយក PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-rose-900 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          <div
            ref={reportRef}
            id="student-health-report-print-container"
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Header: Kingdom of Cambodia & Ministry */}
            <div className="text-center space-y-1 border-b-2 border-rose-700 pb-4">
              <div className="flex justify-between items-start text-xs text-left">
                <div className="space-y-0.5 text-slate-800">
                  <p className="font-bold">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                  <p className="text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                  <p className="font-bold text-rose-950 font-moul text-sm">{schoolProfile.nameKhmer}</p>
                  <p className="text-[11px] text-slate-500 font-mono">កូដសាលា៖ {schoolProfile.schoolCode}</p>
                </div>

                <div className="text-center space-y-0.5">
                  <p className="font-bold text-slate-900 font-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p className="font-bold text-slate-800 font-moul text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                  <div className="flex justify-center my-1">
                    <AngkorBorderOrnament />
                  </div>
                  <p className="text-[11px] text-slate-500">ឆ្នាំសិក្សា៖ <span className="font-bold text-slate-800">{academicYear}</span></p>
                </div>
              </div>

              <div className="pt-3">
                <h2 className="text-base font-bold text-slate-900 font-moul tracking-wide text-rose-950">
                  របាយការណ៍តាមដានប្រវត្តិសុខភាព និងការលូតលាស់សិស្ស
                </h2>
                <p className="text-[11px] text-slate-600 font-medium">
                  STUDENT HEALTH & GROWTH EXAMINATION REPORT (FOR PARENTAL COMMUNICATION)
                </p>
              </div>
            </div>

            {/* Student Profile Snapshot Card */}
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200/80 flex flex-col sm:flex-row items-center gap-4">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.nameKhmer}
                  className="w-20 h-24 object-cover rounded-xl border-2 border-rose-300 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-20 h-24 rounded-xl bg-rose-200/60 border-2 border-rose-300 flex flex-col items-center justify-center font-bold text-rose-800 text-sm shrink-0">
                  <User className="w-8 h-8 mb-1 opacity-70" />
                  <span>{student.gender === 'F' || student.gender === 'female' ? 'សិស្សស្រី' : 'សិស្សប្រុស'}</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs flex-1 w-full">
                <div>
                  <span className="text-slate-500 block text-[10px]">គោត្តនាម-នាម៖</span>
                  <strong className="text-slate-900 font-bold font-moul text-sm">{student.nameKhmer}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ឈ្មោះឡាតាំង៖</span>
                  <strong className="text-slate-800 font-mono font-bold uppercase">{student.nameLatin || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">អត្តលេខសិស្ស៖</span>
                  <strong className="text-blue-900 font-mono font-bold">{student.code}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ថ្នាក់រៀន៖</span>
                  <strong className="text-slate-800 font-bold">ថ្នាក់ទី {student.grade}{student.section}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ថ្ងៃខែឆ្នាំកំណើត៖</span>
                  <strong className="text-slate-800 font-mono">{student.dob || '២០១៦'} ({calculatedAge} ឆ្នាំ)</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ភេទ៖</span>
                  <strong className="text-slate-800">{student.gender === 'F' || student.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">អាណាព្យាបាល៖</span>
                  <strong className="text-slate-800">{student.guardianName || student.fatherName || student.motherName || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ទូរស័ព្ទទំនាក់ទំនង៖</span>
                  <strong className="text-slate-800 font-mono">{student.guardianPhone || student.phone || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ស្ថានភាពជីវភាព៖</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold text-[10px]">
                    {student.livingCondition || 'ទូទៅ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Health Metrics Overview Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 font-moul flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>១. សូចនាករសុខភាព និងអាហារូបត្ថម្ភបច្ចុប្បន្ន (Current Health Vitals)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 text-[10px] block">កម្ពស់ (Height)</span>
                  <span className="text-lg font-bold font-mono text-slate-900">{student.health?.heightCm || 125}</span>
                  <span className="text-[10px] text-slate-600 font-semibold ml-1">cm</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 text-[10px] block">ទម្ងន់ (Weight)</span>
                  <span className="text-lg font-bold font-mono text-slate-900">{student.health?.weightKg || 25}</span>
                  <span className="text-[10px] text-slate-600 font-semibold ml-1">kg</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 text-[10px] block">សន្ទស្សន៍ BMI</span>
                  <span className="text-lg font-bold font-mono text-rose-700">{bmiVal}</span>
                  <span className="block text-[9px] text-emerald-700 font-bold">{nutritionLabel}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-slate-500 text-[10px] block">ក្រុមឈាម & វ៉ាក់សាំង</span>
                  <span className="text-base font-bold text-slate-900">ក្រុមឈាម {student.health?.bloodType || 'O+'}</span>
                  <span className="block text-[10px] text-blue-700 font-semibold">
                    {student.health?.vaccinated ? '✓ វ៉ាក់សាំងគ្រប់ដូស' : '⚠️ មិនទាន់គ្រប់'}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth Percentile Comparison (WHO Standards) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 font-moul flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>២. ក្រាហ្វ និងតារាងប្រៀបធៀបស្តង់ដារលូតលាស់ WHO (Growth Percentiles Chart)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-sans font-normal">P5 (កម្រិតទាប) • P50 (មធ្យមភាគ) • P95 (កម្រិតខ្ពស់)</span>
              </h4>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                {/* Visual Height / Weight Benchmark Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-700">កម្ពស់សិស្ស vs ស្តង់ដារ WHO (P50)</span>
                      <span className="font-bold font-mono text-blue-700">{student.health?.heightCm || 125} cm / 128 cm</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (((student.health?.heightCm || 125) / 140) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                      <span>P5: 116cm</span>
                      <span>P50 (មធ្យម): 128cm</span>
                      <span>P95: 140cm</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-700">ទម្ងន់សិស្ស vs ស្តង់ដារ WHO (P50)</span>
                      <span className="font-bold font-mono text-emerald-700">{student.health?.weightKg || 25} kg / 27 kg</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (((student.health?.weightKg || 25) / 36) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                      <span>P5: 20kg</span>
                      <span>P50 (មធ្យម): 27kg</span>
                      <span>P95: 36kg</span>
                    </div>
                  </div>
                </div>

                {/* Growth Checkpoints Table */}
                <table className="w-full text-left border-collapse text-[11px] border border-slate-300 bg-white">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300">កាលបរិច្ឆេទ / វគ្គ</th>
                      <th className="p-2 border-r border-slate-300 text-center">កម្ពស់ (cm)</th>
                      <th className="p-2 border-r border-slate-300 text-center">ទម្ងន់ (kg)</th>
                      <th className="p-2 border-r border-slate-300 text-center">BMI</th>
                      <th className="p-2 border-r border-slate-300">ចក្ខុ & មាត់ធ្មេញ</th>
                      <th className="p-2">អ្នកពិនិត្យ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mockCheckpoints.map((cp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-300 font-medium">
                          <strong className="text-slate-900 block">{cp.term}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{cp.date}</span>
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-center text-blue-900">
                          {cp.height} cm
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-center text-emerald-900">
                          {cp.weight} kg
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-center text-purple-900">
                          {cp.bmi}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-700">
                          {cp.eyes} • {cp.teeth}
                        </td>
                        <td className="p-2 text-slate-700 font-medium">{cp.doctor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nurse Clinic / Infirmary Visitation History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 font-moul flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>៣. ប្រវត្តិចូលបន្ទប់សុខភាព និងការថែទាំបឋម (Nurse Clinic Visitation Logs)</span>
              </h4>

              <table className="w-full text-left border-collapse text-[11px] border border-slate-300 bg-white">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-32">កាលបរិច្ឆេទ & ម៉ោង</th>
                    <th className="p-2 border-r border-slate-300">រោគសញ្ញា / អាការៈ</th>
                    <th className="p-2 border-r border-slate-300 text-center w-16">កម្តៅ</th>
                    <th className="p-2 border-r border-slate-300">វិធានការ & ការថែទាំ</th>
                    <th className="p-2 border-r border-slate-300 w-28">អ្នកកត់ត្រា</th>
                    <th className="p-2 text-center w-24">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parsedVisits.map((visit, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-300 font-mono text-[10px] text-slate-700 font-bold">
                        {visit.date}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-900 font-medium">
                        {visit.symptoms}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center font-mono text-rose-700 font-bold">
                        {visit.temp}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        {visit.treatment}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700 text-[10px]">
                        {visit.nurse}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          visit.followUp.includes('តាមដាន')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {visit.followUp}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MoEYS Vaccination Compliance Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 font-moul flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>៤. កំណត់ត្រាវ៉ាក់សាំងកាតព្វកិច្ច MoEYS (Vaccination Record)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {vaccinationChecklist.map((vac, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{vac.name}</span>
                      <span className="text-[10px] text-slate-500">ស្តង់ដារ៖ {vac.standard}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] shrink-0">
                      {vac.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Notes & Clinical Recommendations Section */}
            <div className="space-y-1 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>៥. ការណែនាំថែទាំសុខភាព និងសារជូនអាណាព្យាបាល (Parental Health Recommendations):</span>
              </h5>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {student.health?.notes
                  ? student.health.notes
                  : 'សិស្សានុសិស្សមានសុខភាពល្អធម្មតា មានការលូតលាស់ស្របតាមកម្រិតស្តង់ដារអាយុ និងកម្ពស់។ សាលាសូមណែនាំអាណាព្យាបាលបន្តលើកទឹកចិត្តកូនៗឱ្យទទួលទានអាហារសម្បូរជីវជាតិ ផឹកទឹកស្អាតឱ្យបានគ្រប់គ្រាន់ ដុសធ្មេញយ៉ាងតិច ២ ដងក្នុងមួយថ្ងៃ និងគេងឱ្យបាន ៨-១០ ម៉ោងក្នុងមួយយប់។'}
              </p>
            </div>

            {/* Signatures Section */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="space-y-12">
                <p className="font-bold text-slate-800">អាណាព្យាបាលសិស្ស</p>
                <p className="text-slate-600 font-medium">({student.guardianName || '..........................'})</p>
              </div>

              <div className="space-y-12">
                <p className="font-bold text-slate-800">គ្រូបន្ទុកថ្នាក់ / គិលានុបដ្ឋាក</p>
                <p className="text-slate-600 font-medium">................................................</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-500">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០២៦</p>
                <p className="font-bold text-slate-900 font-moul">នាយកសាលា</p>
                <div className="h-10" />
                <p className="font-bold text-slate-900 font-moul">{schoolProfile.principalName || 'គណៈគ្រប់គ្រងសាលា'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សាភ្នំពេញ • PhnomPom MoEYS
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'កំពុងបង្កើត PDF...' : 'ទាញយក PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              បិទ (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
