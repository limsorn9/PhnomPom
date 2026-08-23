import React, { useState, useRef } from 'react';
import { Student, StudentScore, DailyAttendanceRecord, SchoolProfile } from '../types';
import {
  Printer,
  Download,
  X,
  Users,
  FileText,
  Award,
  Calendar,
  CheckCircle2,
  Phone,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface MultiStudentProfileSummaryPdfModalProps {
  students: Student[];
  scores: StudentScore[];
  dailyAttendance: DailyAttendanceRecord[];
  schoolProfile: SchoolProfile;
  getStudentBadges: (studentId: string) => any[];
  getStudentTotalPoints: (studentId: string) => number;
  onClose: () => void;
}

export const MultiStudentProfileSummaryPdfModal: React.FC<MultiStudentProfileSummaryPdfModalProps> = ({
  students,
  scores,
  dailyAttendance,
  schoolProfile,
  getStudentBadges,
  getStudentTotalPoints,
  onClose
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Month list in chronological order
  const monthOrder = [
    'តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មិនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី១', 'ឆមាសទី២'
  ];

  // Helper to get score history for a student
  const getStudentScoreHistory = (student: Student) => {
    return scores
      .filter(s => s.studentId === student.id || s.studentCode === student.code)
      .sort((a, b) => {
        const idxA = monthOrder.indexOf(a.monthOrSemester);
        const idxB = monthOrder.indexOf(b.monthOrSemester);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
  };

  // Helper to calculate student attendance
  const getStudentAttendanceStats = (studentId: string) => {
    let totalRecordedDays = 0;
    let presentCount = 0;
    let excusedCount = 0;
    let unexcusedCount = 0;

    (dailyAttendance || []).forEach(rec => {
      if (rec.studentId === studentId) {
        totalRecordedDays++;
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'permission') excusedCount++;
        else if (rec.status === 'absent') unexcusedCount++;
      }
    });

    const rate = totalRecordedDays > 0 ? Math.round((presentCount / totalRecordedDays) * 100) : 100;

    return {
      totalRecordedDays,
      presentCount,
      lateCount: 0,
      excusedCount,
      unexcusedCount,
      rate
    };
  };

  // Handle Multi-Page PDF Download
  const handleDownloadMultiPagePdf = async () => {
    if (!printableAreaRef.current) return;
    setIsGeneratingPdf(true);
    setPdfProgress(10);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const studentPages = printableAreaRef.current.querySelectorAll('.single-student-dossier-page');
      const totalPages = studentPages.length;

      for (let i = 0; i < totalPages; i++) {
        const pageElem = studentPages[i] as HTMLElement;
        
        // Render canvas
        const canvas = await html2canvas(pageElem, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdfWidth = 210; // A4 mm
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(297, pdfHeight));
        setPdfProgress(Math.round(((i + 1) / totalPages) * 100));
      }

      const filename = `កម្រងប្រវត្តិរូប_និងប្រវត្តិពិន្ទុសិស្ស_${students.length}នាក់_${schoolProfile.nameLatin || 'Phnom_Pom'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Multi-page PDF generation failed:', err);
      alert('មានបញ្ហាក្នុងការបង្កើតឯកសារ PDF សូមជ្រើសរើសប៊ូតុង «បោះពុម្ព» ដើម្បី Save as PDF តាម Browser');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(0);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-battambang">
      {/* Modal Box */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-moul tracking-wide text-white">
                កម្រងប្រវត្តិរូប & ប្រវត្តិពិន្ទុសិស្សច្រើនទំព័រ (Multi-Page PDF Dossier)
              </h3>
              <p className="text-xs text-blue-200">
                បានជ្រើសរើសសិស្សចំនួន <strong>{students.length}</strong> នាក់ • មួយទំព័រ A4 ក្នុងមួយសិស្ស
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>
            <button
              onClick={handleDownloadMultiPagePdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? `កំពុងបង្កើត PDF (${pdfProgress}%)...` : 'ទាញយក PDF រួម'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigator Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold">ទំព័រមើលសាកល្បង៖</span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-slate-300 font-bold font-times text-indigo-900">
              ទំព័រទី {currentPageIndex + 1} / {students.length}
            </span>
            <span className="text-slate-500">({students[currentPageIndex]?.nameKhmer})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="p-1 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-medium text-slate-500">
              សិស្សទី {currentPageIndex + 1}
            </span>
            <button
              onClick={() => setCurrentPageIndex(prev => Math.min(students.length - 1, prev + 1))}
              disabled={currentPageIndex === students.length - 1}
              className="p-1 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60">
          <div ref={printableAreaRef} className="space-y-6 max-w-4xl mx-auto">
            {students.map((student, sIdx) => {
              const studentScores = getStudentScoreHistory(student);
              const attStats = getStudentAttendanceStats(student.id);
              const badges = getStudentBadges(student.id);
              const totalPts = getStudentTotalPoints(student.id);

              return (
                <div
                  key={student.id}
                  className="single-student-dossier-page bg-white p-7 sm:p-9 rounded-xl shadow-lg border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-8"
                  style={{
                    pageBreakAfter: sIdx < students.length - 1 ? 'always' : 'auto',
                    breakAfter: sIdx < students.length - 1 ? 'page' : 'auto',
                    minHeight: '270mm'
                  }}
                >
                  {/* Official Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
                    {/* Left: Ministry Hierarchy */}
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900 font-moul text-[11px]">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                      <p className="text-slate-700 font-semibold">មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្ត{schoolProfile.province || 'បាត់ដំបង'}</p>
                      <p className="text-slate-700 font-semibold">ការិយាល័យអប់រំ ស្រុក{schoolProfile.district || 'ភ្នំព្រឹក'}</p>
                      <p className="font-bold text-blue-950 font-moul text-xs">{schoolProfile.nameKhmer}</p>
                      <p className="text-[10px] text-slate-500 font-mono">កូដសាលា៖ {schoolProfile.schoolCode}</p>
                    </div>

                    {/* Right: National Motto */}
                    <div className="text-center space-y-1">
                      <p className="font-bold font-moul text-xs text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                      <p className="font-bold font-moul text-xs text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                      <div className="flex justify-center my-1">
                        <span className="w-16 h-0.5 bg-slate-800 rounded-full block" />
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        ឆ្នាំសិក្សា៖ <span className="font-bold text-slate-900 font-times">{schoolProfile.academicYear}</span>
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-5">
                    <h2 className="font-moul text-sm sm:text-base text-slate-950 tracking-wide uppercase">
                      កម្រងប្រវត្តិរូបសង្ខេប និងប្រវត្តិលទ្ធផលសិក្សាសិស្ស
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Student Profile Dossier & Comprehensive Academic History
                    </p>
                  </div>

                  {/* Student Top ID Card Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
                    {/* Photo Box */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <img
                        src={student.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={student.nameKhmer}
                        referrerPolicy="no-referrer"
                        className="w-24 h-28 object-cover rounded-lg border-2 border-indigo-900 shadow-xs mb-2"
                      />
                      <span className="font-bold font-times text-xs text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                        {student.code}
                      </span>
                    </div>

                    {/* Main Personal Info */}
                    <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block">គោត្តនាម និងនាម៖</span>
                        <strong className="text-sm font-bold font-moul text-slate-900">{student.nameKhmer}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">ឈ្មោះឡាតាំង៖</span>
                        <strong className="text-xs font-bold font-times text-slate-800">{student.nameLatin || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">ភេទ / អាយុ៖</span>
                        <strong className="font-semibold text-slate-800">
                          {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'} {student.age ? `(${student.age} ឆ្នាំ)` : ''}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">ថ្ងៃខែឆ្នាំកំណើត៖</span>
                        <strong className="font-semibold font-times text-slate-800">{student.dob}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">កម្រិតថ្នាក់ / បន្ទប់៖</span>
                        <strong className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                          ថ្នាក់ទី {student.grade}{student.section}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">ប្រវត្តិសិក្សា៖</span>
                        <strong className="font-semibold text-slate-800">{student.academicHistory || 'ឡើងថ្នាក់'}</strong>
                      </div>

                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-[11px] text-slate-500 block">ទីកន្លែងកំណើត៖</span>
                        <span className="text-xs text-slate-800 font-medium">{student.pob || 'ខេត្តបាត់ដំបង'}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-[11px] text-slate-500 block">អាសយដ្ឋានបច្ចុប្បន្ន៖</span>
                        <span className="text-xs text-slate-800 font-medium">{student.address || 'ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Family & Vulnerability & Health */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-5">
                    {/* Family & Guardian */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <h4 className="font-bold font-moul text-[11px] text-slate-900 border-b border-slate-100 pb-1.5 mb-2">
                        ព័ត៌មានគ្រួសារ & អាណាព្យាបាល
                      </h4>
                      <div className="space-y-1.5 text-[11px]">
                        <p><strong>ឪពុក៖</strong> {student.fatherName || 'មិនបញ្ជាក់'} ({student.fatherOccupation || 'N/A'})</p>
                        <p><strong>ម្តាយ៖</strong> {student.motherName || 'មិនបញ្ជាក់'} ({student.motherOccupation || 'N/A'})</p>
                        <p><strong>អាណាព្យាបាល៖</strong> {student.guardianName || student.fatherName || student.motherName || 'អាណាព្យាបាល'}</p>
                        <p className="font-times"><strong>ទូរស័ព្ទ៖</strong> {student.guardianPhone || student.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Vulnerability & Social Status */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <h4 className="font-bold font-moul text-[11px] text-slate-900 border-b border-slate-100 pb-1.5 mb-2">
                        ស្ថានភាពជីវភាព & សង្គម
                      </h4>
                      <div className="space-y-1.5 text-[11px]">
                        <p><strong>ជីវភាព៖</strong> {student.livingCondition || 'ទូទៅ'} {student.idPoorCardNumber ? `(កាត៖ ${student.idPoorCardNumber})` : ''}</p>
                        <p><strong>អាហារូបករណ៍៖</strong> {student.scholarship || 'មិនមាន'}</p>
                        <p><strong>ស្ថានភាពកំព្រា៖</strong> {student.orphanStatus || 'មិនកំព្រា'}</p>
                        <p><strong>ពិការភាព៖</strong> {student.disability || 'មិនពិការ'}</p>
                      </div>
                    </div>

                    {/* Health & BMI */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <h4 className="font-bold font-moul text-[11px] text-slate-900 border-b border-slate-100 pb-1.5 mb-2">
                        សុខភាព & ការលូតលាស់
                      </h4>
                      <div className="space-y-1.5 text-[11px]">
                        <p className="font-times"><strong>កម្ពស់ / ទម្ងន់៖</strong> {student.health?.heightCm || 120}cm / {student.health?.weightKg || 22}kg</p>
                        <p className="font-times"><strong>សន្ទស្សន៍ BMI៖</strong> <span className="font-bold text-blue-700">{student.health?.bmi || 15.3}</span> ({student.health?.nutritionStatus === 'normal' ? 'ធម្មតា' : 'ស្គម'})</p>
                        <p><strong>ក្រុមឈាម៖</strong> {student.health?.bloodType || 'O+'} • {student.health?.vaccinated ? 'ចាក់វ៉ាក់សាំងគ្រប់' : 'មិនទាន់គ្រប់'}</p>
                        <p><strong>អត្រាវត្តមាន៖</strong> <span className="font-bold font-times text-emerald-700">{attStats.rate}%</span> (មានច្បាប់: {attStats.excusedCount}, ឥតច្បាប់: {attStats.unexcusedCount})</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Comprehensive Score History Table */}
                  <div className="mb-5">
                    <h4 className="font-bold font-moul text-xs text-slate-900 mb-2 flex items-center justify-between">
                      <span>ប្រវត្តិនៃការវាយតម្លៃលទ្ធផលសិក្សា (Comprehensive Score History)</span>
                      <span className="text-[11px] font-normal text-slate-500 font-times">
                        ពិន្ទុអតិបរមា ១០ / មធ្យមភាគប្រចាំខែ
                      </span>
                    </h4>

                    <div className="overflow-x-auto border border-slate-300 rounded-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300 text-[11px]">
                          <tr>
                            <th className="py-2 px-2.5">ខែ/ឆមាស</th>
                            <th className="py-2 px-2 text-center">ភាសាខ្មែរ</th>
                            <th className="py-2 px-2 text-center">គណិតវិទ្យា</th>
                            <th className="py-2 px-2 text-center">វិទ្យាសាស្ត្រ/សង្គម</th>
                            <th className="py-2 px-2 text-center">ពិន្ទុសរុប</th>
                            <th className="py-2 px-2 text-center">មធ្យមភាគ</th>
                            <th className="py-2 px-2 text-center">ចំណាត់ថ្នាក់</th>
                            <th className="py-2 px-2.5 text-center">និទ្ទេស</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {studentScores.length > 0 ? (
                            studentScores.map(sc => {
                              const khmer = sc.subjects.find(s => s.subject.includes('ខ្មែរ') || s.subject.includes('ភាសា'))?.score || (sc.average ? sc.average * 0.95 : 0);
                              const math = sc.subjects.find(s => s.subject.includes('គណិត'))?.score || (sc.average ? sc.average * 1.05 : 0);
                              const science = sc.subjects.find(s => s.subject.includes('វិទ្យា') || s.subject.includes('សង្គម'))?.score || sc.average || 0;
                              
                              let gradeLetter = 'ល្អប្រសើរ (A)';
                              if (sc.average < 5) gradeLetter = 'ខ្សោយ (F)';
                              else if (sc.average < 6.5) gradeLetter = 'មធ្យម (D)';
                              else if (sc.average < 8) gradeLetter = 'ល្អបង្គួរ (C)';
                              else if (sc.average < 9) gradeLetter = 'ល្អ (B)';

                              return (
                                <tr key={sc.id} className="hover:bg-slate-50">
                                  <td className="py-1.5 px-2.5 font-bold text-slate-900">{sc.monthOrSemester}</td>
                                  <td className="py-1.5 px-2 text-center font-times">{khmer.toFixed(1)}</td>
                                  <td className="py-1.5 px-2 text-center font-times">{math.toFixed(1)}</td>
                                  <td className="py-1.5 px-2 text-center font-times">{science.toFixed(1)}</td>
                                  <td className="py-1.5 px-2 text-center font-bold font-times">{sc.totalScore.toFixed(1)}</td>
                                  <td className="py-1.5 px-2 text-center font-bold font-times text-indigo-900">{sc.average.toFixed(2)}</td>
                                  <td className="py-1.5 px-2 text-center font-bold font-times text-amber-900">
                                    {sc.rank ? `លេខ ${sc.rank}` : '-'}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-center font-semibold text-[10px] text-slate-700">{gradeLetter}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-3 text-center text-slate-400">
                                មិនទាន់មានទិន្នន័យពិន្ទុផ្លូវការក្នុងប្រព័ន្ធនៅឡើយ
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 4: Gamification Badges & Accomplishments */}
                  {badges.length > 0 && (
                    <div className="mb-5 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold font-moul text-[11px] text-amber-950 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>សមិទ្ធផល & ផ្លាកសញ្ញាកិត្តិយស (Digital Badges)</span>
                        </span>
                        <span className="font-bold font-times text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                          ពិន្ទុសរុប៖ {totalPts} Pts
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {badges.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-amber-200 text-[10px] font-bold text-amber-900 shadow-xs"
                          >
                            <span>{b.badge?.icon || '🏆'}</span>
                            <span>{b.badge?.titleKhmer || 'ផ្លាកសញ្ញាឆ្នើម'}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Signatures */}
                  <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-3 text-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">ហត្ថលេខាអាណាព្យាបាល</p>
                      <div className="h-14" />
                      <p className="text-slate-500 text-[11px]">..................................</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">គ្រូបន្ទុកថ្នាក់</p>
                      <div className="h-14" />
                      <p className="text-slate-900 font-bold text-[11px]">លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">នាយកសាលា</p>
                      <div className="h-14" />
                      <p className="font-bold text-blue-950 font-moul text-[11px]">{schoolProfile.directorName || 'លោក លីម សន'}</p>
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="mt-4 text-right text-[9px] text-slate-400 font-mono">
                    ទំព័រ {sIdx + 1} នៃ {students.length} • បង្កើតចេញពីប្រព័ន្ធសាលាបឋមសិក្សាភ្នំពុំ • {new Date().toLocaleDateString('km-KH')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
