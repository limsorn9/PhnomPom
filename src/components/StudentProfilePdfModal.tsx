import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { buildStudentQRLoginUrl } from '../utils/qrAuthService';
import { Student, StudentScore, DailyAttendanceRecord, SchoolProfile } from '../types';
import {
  Printer,
  Download,
  X,
  User,
  MapPin,
  Phone,
  Calendar,
  ShieldCheck,
  Award,
  HeartPulse,
  Sparkles,
  BookOpen,
  TrendingUp,
  Clock,
  FileCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MoEYSRoyalHeader, AngkorPageWatermark } from './AngkorMotif';

interface StudentProfilePdfModalProps {
  student: Student;
  scores?: StudentScore[];
  dailyAttendance?: DailyAttendanceRecord[];
  schoolProfile: SchoolProfile;
  badges?: any[];
  totalBadgePoints?: number;
  isOpen?: boolean;
  onClose: () => void;
}

export const StudentProfilePdfModal: React.FC<StudentProfilePdfModalProps> = ({
  student,
  scores = [],
  dailyAttendance = [],
  schoolProfile,
  badges = [],
  totalBadgePoints = 0,
  isOpen = true,
  onClose
}) => {
  if (!isOpen && isOpen !== undefined) return null;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Generate QR code for student profile and smart login
  useEffect(() => {
    const qrLoginUrl = buildStudentQRLoginUrl(student, schoolProfile.code || '020401015');
    QRCode.toDataURL(qrLoginUrl, { width: 140, margin: 1, errorCorrectionLevel: 'M' })
      .then(url => setQrCodeDataUrl(url))
      .catch(() => {});
  }, [student, schoolProfile]);

  // Month list for score sorting
  const monthOrder = [
    'តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មិនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី១', 'ឆមាសទី២'
  ];

  // Student Score records sorted
  const studentScores = scores
    .filter(s => s.studentId === student.id || s.studentCode === student.code)
    .sort((a, b) => {
      const idxA = monthOrder.indexOf(a.monthOrSemester);
      const idxB = monthOrder.indexOf(b.monthOrSemester);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

  // Attendance Calculations
  let totalDays = 0;
  let presentDays = 0;
  let permissionDays = 0;
  let absentDays = 0;

  (dailyAttendance || []).forEach(rec => {
    if (rec.studentId === student.id) {
      totalDays++;
      if (rec.status === 'present') presentDays++;
      else if (rec.status === 'permission') permissionDays++;
      else if (rec.status === 'absent') absentDays++;
    }
  });

  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // PDF Export Function (A4 Compliant)
  const handleDownloadPdf = async () => {
    if (!printContainerRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(printContainerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      pdf.save(`ប្រវត្តិរូបសិស្ស_${student.nameKhmer}_ថ្នាក់ទី${student.grade}${student.section}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200">
        {/* Header Toolbar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-moul text-white">
                បោះពុម្ពប្រវត្តិរូបសិស្ស A4 (Student Profile & Academic Dossier)
              </h3>
              <p className="text-xs text-blue-200">
                {student.nameKhmer} ({student.nameLatin || 'N/A'}) • អត្តលេខ៖ <span className="font-times">{student.code}</span> • ថ្នាក់ទី {student.grade}{student.section}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'កំពុងទាញយក...' : 'ទាញយក PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80">
          {/* Printable A4 Container */}
          <div
            ref={printContainerRef}
            id="printable-student-profile-a4"
            className="bg-white max-w-[210mm] mx-auto p-8 sm:p-10 rounded-xl shadow-md border border-slate-300 relative text-slate-900 font-battambang print:shadow-none print:border-none print:m-0 print:p-8"
            style={{ minHeight: '277mm' }}
          >
            <AngkorPageWatermark opacity={0.03} />

            {/* Ministry Official Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4 relative z-1">
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-slate-900 font-moul text-[11px]">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="text-slate-700 font-semibold">មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្ត{schoolProfile.province || 'បាត់ដំបង'}</p>
                <p className="text-slate-700 font-semibold">ការិយាល័យអប់រំ ស្រុក{schoolProfile.district || 'ភ្នំព្រឹក'}</p>
                <p className="font-bold text-blue-950 font-moul text-xs pt-0.5">{schoolProfile.nameKhmer}</p>
                <p className="text-[10px] text-slate-500 font-times">លេខកូដសាលា៖ {schoolProfile.schoolCode}</p>
              </div>

              <div className="text-center">
                <MoEYSRoyalHeader />
                <div className="mt-2 inline-block border-b-2 border-blue-900 pb-0.5">
                  <h2 className="font-moul text-blue-950 text-sm sm:text-base tracking-wide">
                    ប្រវត្តិរូប និងកំណត់ត្រាការសិក្សាសិស្ស
                  </h2>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-times">
                  STUDENT OFFICIAL DOSSIER & ACADEMIC RECORD
                </p>
              </div>

              {/* Photo & QR Box */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-20 h-24 border-2 border-slate-400 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shadow-xs">
                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.nameKhmer}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-[10px] text-slate-400 p-1">
                      <User className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                      <span>រូបថត 4x6</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-times font-bold text-slate-600">
                  ID: {student.code}
                </span>
              </div>
            </div>

            {/* Section 1: General Information */}
            <div className="space-y-3 mb-4 relative z-1">
              <div className="flex items-center gap-2 bg-blue-50/80 px-3 py-1 rounded-md border border-blue-200">
                <FileCheck className="w-3.5 h-3.5 text-blue-800" />
                <h4 className="font-bold font-moul text-xs text-blue-950">
                  ១. ព័ត៌មានទូទៅរបស់សិស្ស (General Information)
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">គោត្តនាម និងនាម</span>
                  <strong className="text-slate-900 font-moul text-xs">{student.nameKhmer}</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">អក្សរឡាតាំង</span>
                  <strong className="text-slate-900 font-times text-xs">{student.nameLatin || '-'}</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ភេទ / ថ្ងៃខែឆ្នាំកំណើត</span>
                  <strong className="text-slate-900 font-times text-xs">
                    {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'} • {student.dob}
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ថ្នាក់ទី / អត្តលេខ</span>
                  <strong className="text-blue-900 font-bold text-xs">
                    ថ្នាក់ទី {student.grade}{student.section} (កូដ: {student.code})
                  </strong>
                </div>

                <div className="col-span-2 p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ទីកន្លែងកំណើត</span>
                  <p className="text-slate-800 font-medium text-xs leading-snug">
                    {student.pob || `${student.pobVillage ? `ភូមិ${student.pobVillage} ` : ''}${student.pobCommune ? `ឃុំ${student.pobCommune} ` : ''}${student.pobDistrict ? `ស្រុក${student.pobDistrict} ` : ''}${student.pobProvince || 'ខេត្តបាត់ដំបង'}`}
                  </p>
                </div>
                <div className="col-span-2 p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ទីលំនៅបច្ចុប្បន្ន</span>
                  <p className="text-slate-800 font-medium text-xs leading-snug">
                    {student.address || `${student.currentHouseNumber ? `ផ្ទះលេខ${student.currentHouseNumber} ` : ''}${student.currentStreetNumber ? `ផ្លូវ${student.currentStreetNumber} ` : ''}${student.currentVillage ? `ភូមិ${student.currentVillage} ` : ''}${student.currentCommune ? `ឃុំ${student.currentCommune} ` : ''}${student.currentDistrict ? `ស្រុក${student.currentDistrict} ` : ''}${student.currentProvince || 'ខេត្តបាត់ដំបង'}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Family & Social Vulnerability */}
            <div className="space-y-3 mb-4 relative z-1">
              <div className="flex items-center gap-2 bg-indigo-50/80 px-3 py-1 rounded-md border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-800" />
                <h4 className="font-bold font-moul text-xs text-indigo-950">
                  ២. ព័ត៌មានគ្រួសារ និងស្ថានភាពសង្គម (Family & Equity)
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ឪពុក</span>
                  <p className="font-bold text-slate-900">{student.fatherName || 'មិនបញ្ជាក់'}</p>
                  <p className="text-[10px] text-slate-600">មុខរបរ៖ {student.fatherOccupation || '-'}</p>
                  <p className="text-[9px] text-slate-500">ស្ថានភាព៖ {student.fatherAlive !== false ? 'នៅរស់' : 'ទទួលមរណភាព'}</p>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ម្តាយ</span>
                  <p className="font-bold text-slate-900">{student.motherName || 'មិនបញ្ជាក់'}</p>
                  <p className="text-[10px] text-slate-600">មុខរបរ៖ {student.motherOccupation || '-'}</p>
                  <p className="text-[9px] text-slate-500">ស្ថានភាព៖ {student.motherAlive !== false ? 'នៅរស់' : 'ទទួលមរណភាព'}</p>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">អាណាព្យាបាល / ទំនាក់ទំនង</span>
                  <p className="font-bold text-slate-900">{student.guardianName || student.fatherName || student.motherName || 'អាណាព្យាបាល'}</p>
                  <p className="text-[10px] text-slate-600">ត្រូវជា៖ {student.guardianRelationship || 'ឪពុកម្តាយ'}</p>
                  <p className="text-[10px] text-blue-700 font-times font-bold">{student.guardianPhone || student.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">ស្ថានភាពជីវភាព</span>
                  <span className="font-bold text-slate-800">{student.livingCondition || 'ទូទៅ'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ស្ថានភាពកំព្រា</span>
                  <span className="font-bold text-slate-800">{student.orphanStatus || 'មិនកំព្រា'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ស្ថានភាពពិការភាព</span>
                  <span className="font-bold text-slate-800">{student.disability || 'មិនពិការ'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">អាហារូបករណ៍</span>
                  <span className="font-bold text-purple-900">{student.scholarship || 'មិនមាន'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Academic Records & Grades History */}
            <div className="space-y-2 mb-4 relative z-1">
              <div className="flex items-center justify-between bg-emerald-50/80 px-3 py-1 rounded-md border border-emerald-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                  <h4 className="font-bold font-moul text-xs text-emerald-950">
                    ៣. លទ្ធផលសិក្សា និងពិន្ទុប្រឡង (Academic Records)
                  </h4>
                </div>
                <span className="text-[10px] text-emerald-800 font-times font-bold">
                  ឆ្នាំសិក្សា {schoolProfile.academicYear || '2023-2024'}
                </span>
              </div>

              {studentScores.length === 0 ? (
                <div className="p-3 text-center bg-slate-50 rounded border border-dashed border-slate-300 text-xs text-slate-500">
                  មិនទាន់មានកំណត់ត្រាពិន្ទុប្រឡងសម្រាប់សិស្សនេះនៅឡើយទេ។
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-300 rounded-lg">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="py-1.5 px-2.5 text-center">ខែ/ឆមាស</th>
                        <th className="py-1.5 px-2.5 text-center">ពិន្ទុសរុប</th>
                        <th className="py-1.5 px-2.5 text-center">មធ្យមភាគ</th>
                        <th className="py-1.5 px-2.5 text-center">ចំណាត់ថ្នាក់</th>
                        <th className="py-1.5 px-2.5 text-center">និទ្ទេស</th>
                        <th className="py-1.5 px-2.5 text-center">លទ្ធផល</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {studentScores.map((score, sIndex) => (
                        <tr key={sIndex} className={sIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="py-1 px-2.5 text-center font-bold text-slate-900">{score.monthOrSemester}</td>
                          <td className="py-1 px-2.5 text-center font-times">{score.totalScore.toFixed(1)}</td>
                          <td className="py-1 px-2.5 text-center font-times font-bold text-blue-900">{score.averageScore.toFixed(2)}</td>
                          <td className="py-1 px-2.5 text-center font-times font-bold text-amber-900">
                            {score.rank ? `លេខ ${score.rank}` : '-'}
                          </td>
                          <td className="py-1 px-2.5 text-center font-times font-bold">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100">{score.gradeLetter || 'C'}</span>
                          </td>
                          <td className="py-1 px-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              score.resultStatus === 'ធ្លាក់' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {score.resultStatus || (score.averageScore >= 5 ? 'ជាប់' : 'ធ្លាក់')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 4: Attendance & Health/Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-1">
              {/* Attendance Box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 font-moul text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    វត្តមានសរុប
                  </span>
                  <span className="font-bold text-blue-700 font-times">{attendanceRate}% វត្តមាន</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center pt-1 text-[11px]">
                  <div className="bg-emerald-50 p-1 rounded border border-emerald-200">
                    <span className="text-emerald-800 text-[10px] block">មក</span>
                    <strong className="font-times text-emerald-900">{presentDays} ថ្ងៃ</strong>
                  </div>
                  <div className="bg-amber-50 p-1 rounded border border-amber-200">
                    <span className="text-amber-800 text-[10px] block">ច្បាប់</span>
                    <strong className="font-times text-amber-900">{permissionDays} ថ្ងៃ</strong>
                  </div>
                  <div className="bg-rose-50 p-1 rounded border border-rose-200">
                    <span className="text-rose-800 text-[10px] block">ឥតច្បាប់</span>
                    <strong className="font-times text-rose-900">{absentDays} ថ្ងៃ</strong>
                  </div>
                </div>
              </div>

              {/* Badges & Health Box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 font-moul text-[11px]">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    កិត្តិយស & សុខភាព
                  </span>
                  <span className="font-bold text-amber-800 font-times">{totalBadgePoints} PTS</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-1 pt-1">
                  <p>• ទទួលបានផ្លាកសញ្ញាកិត្តិយស៖ <strong>{badges.length}</strong> មេដាយ</p>
                  <p>• កម្ពស់ {student.health?.heightCm || 120}cm • ទម្ងន់ {student.health?.weightKg || 22}kg (BMI: {student.health?.bmi || 15.3})</p>
                  <p>• ក្រុមឈាម៖ {student.health?.bloodType || 'O+'} • វ៉ាក់សាំង៖ {student.health?.vaccinated ? 'បានចាក់គ្រប់ដូស' : 'មិនទាន់គ្រប់'}</p>
                </div>
              </div>
            </div>

            {/* Official Signatures & QR Code Footer */}
            <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-end text-xs relative z-1">
              <div className="text-center space-y-1">
                <p className="font-semibold text-slate-700">បានឃើញ និងបញ្ជាក់</p>
                <p className="font-bold font-moul text-slate-900 text-xs">នាយកសាលា</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="font-moul text-[11px] text-slate-800">
                    {schoolProfile.principalNameKhmer || 'គណៈគ្រប់គ្រងសាលា'}
                  </span>
                </div>
              </div>

              {/* Digital QR Verification Stamp */}
              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-300 rounded-lg">
                {qrCodeDataUrl && (
                  <img src={qrCodeDataUrl} alt="QR Verification" className="w-16 h-16" />
                )}
                <span className="text-[8px] font-times text-slate-500 font-semibold mt-0.5">
                  VERIFIED MOEYS QR
                </span>
              </div>

              <div className="text-center space-y-1">
                <p className="text-slate-600 text-[11px]">
                  ថ្ងៃទី......... ខែ......... ឆ្នាំ២០២...
                </p>
                <p className="font-bold font-moul text-slate-900 text-xs">គ្រូបន្ទុកថ្នាក់</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="text-[11px] text-slate-500 italic">
                    (ហត្ថលេខា និងឈ្មោះ)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
