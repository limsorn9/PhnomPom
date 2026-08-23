import React, { useRef } from 'react';
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
  Sparkles
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

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  // BMI evaluation
  const bmiVal = student.health?.bmi || 15.5;
  const nutritionLabel =
    student.health?.nutritionStatus === 'normal'
      ? 'សមស្របធម្មតា (Normal)'
      : student.health?.nutritionStatus === 'underweight'
      ? 'ស្គម/ត្រូវការបំប៉ន (Underweight)'
      : student.health?.nutritionStatus === 'overweight'
      ? 'លើសទម្ងន់ (Overweight)'
      : 'ខ្វះអាហារូបត្ថម្ភធ្ងន់ធ្ងរ (Wasted)';

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
      eyes: 'ស្តាំ 10/10 • ឆ្វេង 10/10 (ល្អ)',
      hearing: 'ធម្មតាទាំងសងខាង',
      teeth: 'ល្អ គ្មានធ្មេញពុក',
      doctor: 'លោកគ្រូពេទ្យសាលា'
    },
    {
      date: '១៥-មករា-២០២៦',
      term: 'ពាក់កណ្តាលឆមាសទី ១',
      height: (student.health?.heightCm || 125) - 1.0,
      weight: (student.health?.weightKg || 25) - 0.5,
      bmi: Number((((student.health?.weightKg || 25) - 0.5) / Math.pow(((student.health?.heightCm || 125) - 1.0) / 100, 2)).toFixed(1)),
      eyes: 'ល្អធម្មតា',
      hearing: 'ធម្មតា',
      teeth: 'បានលាងសំអាត និងដុសធ្មេញជាប្រចាំ',
      doctor: 'មន្ត្រីសុខភាពសិក្សា'
    },
    {
      date: student.health?.lastCheckedDate || new Date().toISOString().split('T')[0],
      term: 'ការពិនិត្យបច្ចុប្បន្ន',
      height: student.health?.heightCm || 125,
      weight: student.health?.weightKg || 25,
      bmi: student.health?.bmi || 16.0,
      eyes: 'ល្អធម្មតា គ្មានបញ្ហាស្រវាំង',
      hearing: 'ល្អធម្មតា',
      teeth: 'ល្អស្អាត',
      doctor: 'គណៈកម្មការសុខភាពសាលា'
    }
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
              <p className="text-xs text-rose-100">ទម្រង់របាយការណ៍ផ្លូវការបោះពុម្ពជា PDF តាមក្បួនខ្នាតសុខភាពសិក្សា MoEYS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-rose-900 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព / ទាញយក PDF</span>
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
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div
            ref={reportRef}
            id="student-health-report-print-container"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0 print:m-0"
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
                  STUDENT HEALTH & GROWTH EXAMINATION REPORT
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

            {/* Growth and Health Examination History Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 font-moul flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>២. កំណត់ត្រាពិនិត្យសុខភាព និងការវិវត្តតាមត្រីមាស/ឆមាស (Checkup History)</span>
              </h4>

              <table className="w-full text-left border-collapse text-[11px] border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">កាលបរិច្ឆេទ / វគ្គ</th>
                    <th className="p-2 border-r border-slate-300 text-center">កម្ពស់ (cm)</th>
                    <th className="p-2 border-r border-slate-300 text-center">ទម្ងន់ (kg)</th>
                    <th className="p-2 border-r border-slate-300 text-center">BMI</th>
                    <th className="p-2 border-r border-slate-300">ចក្ខុ & សោតវិញ្ញាណ</th>
                    <th className="p-2 border-r border-slate-300">សុខភាពមាត់ធ្មេញ</th>
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
                        {cp.eyes} • {cp.hearing}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        {cp.teeth}
                      </td>
                      <td className="p-2 text-slate-700 font-medium">{cp.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Special Notes & Preventive Care Section */}
            <div className="space-y-1 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-800">៣. កត់សម្គាល់ពិសេស និងការណែនាំពីគ្រូពេទ្យ៖</h5>
              <p className="text-slate-700 leading-relaxed">
                {student.health?.notes
                  ? student.health.notes
                  : 'សិស្សានុសិស្សមានសុខភាពល្អធម្មតា មានការលូតលាស់ស្របតាមកម្រិតស្តង់ដារអាយុ និងកម្ពស់។ ណែនាំឱ្យបន្តហូបអាហារមានជីវជាតិ ផឹកទឹកស្អាត និងហាត់ប្រាណជាប្រចាំ។'}
              </p>
            </div>

            {/* Signatures Section */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="space-y-12">
                <p className="font-bold text-slate-800">អាណាព្យាបាលសិស្ស</p>
                <p className="text-slate-600 font-medium">({student.guardianName || '..........................'})</p>
              </div>

              <div className="space-y-12">
                <p className="font-bold text-slate-800">គ្រូបន្ទុកថ្នាក់</p>
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
              onClick={handlePrint}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពរបាយការណ៍</span>
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
