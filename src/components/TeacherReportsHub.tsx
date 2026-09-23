import React, { useState } from 'react';
import { 
  FileText, Printer, Calendar, Award, CheckCircle2, 
  X, Download, Eye, Layers, ChevronRight, School, UserCheck
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { getKhmerFullDate, toKhmerNumber } from '../utils/khmerDateHelper';

export const TeacherReportsHub: React.FC = () => {
  const { currentTeacher, schoolInfo, currentClass, academicYear, students } = useSchool();

  // State ការកំណត់ក្បាលលើ
  const [selectedMonth, setSelectedMonth] = useState<string>('កញ្ញា');
  const [gradeType, setGradeType] = useState<'letter' | 'khmer'>('letter');
  const [signDate, setSignDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // State សម្រាប់គ្រប់គ្រង Preview Modal
  const [previewDoc, setPreviewDoc] = useState<{ title: string; category: string } | null>(null);

  const months = ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា'];

  const handlePrint = () => {
    window.print();
  };

  const khmerFullDateString = getKhmerFullDate ? getKhmerFullDate(signDate) : `ថ្ងៃទី ${toKhmerNumber ? toKhmerNumber(23) : '២៣'} ខែកញ្ញា ឆ្នាំ២០២៦`;

  return (
    <div className="min-h-screen bg-[#07191d] text-slate-100 p-3 sm:p-5 md:p-8 font-sans pb-28">
      
      {/* ================= របារបញ្ជាក្បាលលើ (Header Filter Bar) ================= */}
      <div className="bg-[#0d282e]/90 backdrop-blur-md border border-[#164049]/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#164049]/60">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              របាយការណ៍ផ្លូវការ
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">រកកាតតាមរយៈពេល → បើកឯកសារបោះពុម្ព</p>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-3 py-1 bg-[#0a2126] rounded-xl border border-[#164049] font-medium text-slate-200">
              ថ្នាក់: <strong className="text-cyan-400">{currentClass || 'ថ្នាក់ទី១ក'}</strong>
            </span>
            <span className="px-3 py-1 bg-[#0a2126] rounded-xl border border-[#164049] font-medium text-slate-200">
              ឆ្នាំ: <strong className="text-cyan-400">{academicYear || '២០២៦-២០២៧'}</strong>
            </span>
            <span className="px-3 py-1 bg-[#0a2126] rounded-xl border border-[#164049] font-medium text-slate-200">
              សិស្ស: <strong className="text-emerald-400">{students?.length || 27} នាក់</strong>
            </span>
          </div>
        </div>

        {/* ជម្រើសកំណត់: និទ្ទេស, កាលបរិច្ឆេទហត្ថលេខា និងខែ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">និទ្ទេស</label>
            <select
              value={gradeType}
              onChange={(e) => setGradeType(e.target.value as any)}
              className="w-full bg-[#0a2126] border border-[#164049] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="letter">អក្សរ A–F</option>
              <option value="khmer">និទ្ទេសខ្មែរ (ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">កាលបរិច្ឆេទហត្ថលេខា (ទទេ = ថ្ងៃនេះ)</label>
            <input
              type="date"
              value={signDate}
              onChange={(e) => setSignDate(e.target.value)}
              className="w-full bg-[#0a2126] border border-[#164049] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">ខែដែលត្រូវបោះពុម្ព</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-[#0a2126] border border-[#164049] rounded-xl px-3 py-2 text-cyan-400 font-medium focus:outline-none focus:border-cyan-400"
            >
              {months.map((m) => (
                <option key={m} value={m}>ខែ{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= កាតរបាយការណ៍ធំៗទាំង ៥ (Grid 1 Col លើ Mobile, 2 Cols លើ Desktop) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

        {/* ១. បញ្ជីអវត្តមាន */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  បញ្ជីអវត្តមាន
                </h2>
                <p className="text-[11px] text-slate-400">ប្រចាំខែ ៣១ ថ្ងៃ · សរុបប្រចាំឆ្នាំ</p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-[#0a2126] text-cyan-400 border border-[#164049] rounded-lg">
                ខែ{selectedMonth}
              </span>
            </div>

            <div className="space-y-2 text-xs mt-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a2126]/60 border border-[#164049]/50 hover:bg-[#0f353d] transition">
                <span>បញ្ជីវត្តមានប្រចាំខែ ({selectedMonth})</span>
                <button
                  onClick={() => setPreviewDoc({ title: `បញ្ជីវត្តមានប្រចាំខែ (${selectedMonth})`, category: 'អវត្តមាន' })}
                  className="flex items-center gap-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-400 border border-cyan-700/60 px-3.5 py-1.5 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  <Eye className="w-3.5 h-3.5" /> បើក
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a2126]/60 border border-[#164049]/50 hover:bg-[#0f353d] transition">
                <span>សរុបអវត្តមានប្រចាំឆ្នាំ</span>
                <button
                  onClick={() => setPreviewDoc({ title: 'សរុបអវត្តមានប្រចាំឆ្នាំ', category: 'អវត្តមាន' })}
                  className="flex items-center gap-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-400 border border-cyan-700/60 px-3.5 py-1.5 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  <Eye className="w-3.5 h-3.5" /> បើក
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ២. ពិន្ទុខែ */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                ពិន្ទុខែ
              </h2>
              <p className="text-[11px] text-slate-400">តារាងដែលចេញពីពិន្ទុប្រចាំខែ</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-[#0a2126] text-emerald-400 border border-[#164049] rounded-lg">
              ខែ{selectedMonth}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {[
              'តារាងស្រង់ពិន្ទុ',
              'តារាងចំណាត់ថ្នាក់',
              'តារាងនិទ្ទេស ភាសាខ្មែរ និងគណិតវិទ្យា',
              'តារាងកិត្តិយស',
              'សៀវភៅតាមដានការសិក្សា',
              'ស្ថិតិនិទ្ទេសតាមមុខវិជ្ជា',
              'របាយការណ៍ប្រចាំខែរបស់ថ្នាក់',
              'ព្រឹត្តិបត្រពិន្ទុ'
            ].map((title) => (
              <div key={title} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a2126]/60 border border-[#164049]/50 hover:bg-[#0f353d] transition">
                <span className="truncate pr-2">{title}</span>
                <button
                  onClick={() => setPreviewDoc({ title: `${title} (ខែ${selectedMonth})`, category: 'ពិន្ទុខែ' })}
                  className="flex-shrink-0 flex items-center gap-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-400 border border-cyan-700/60 px-3.5 py-1.5 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  <Eye className="w-3.5 h-3.5" /> បើក
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ៣. ពិន្ទុឆមាស */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              ពិន្ទុឆមាស
            </h2>
            <p className="text-[11px] text-slate-400">ស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ឆមាស</p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              'តារាងស្រង់ពិន្ទុឆមាសទី ១',
              'តារាងចំណាត់ថ្នាក់ឆមាសទី ១',
              'តារាងស្រង់ពិន្ទុឆមាសទី ២',
              'តារាងចំណាត់ថ្នាក់ឆមាសទី ២'
            ].map((title) => (
              <div key={title} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a2126]/60 border border-[#164049]/50 hover:bg-[#0f353d] transition">
                <span className="truncate pr-2">{title}</span>
                <button
                  onClick={() => setPreviewDoc({ title, category: 'ឆមាស' })}
                  className="flex-shrink-0 flex items-center gap-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-400 border border-cyan-700/60 px-3.5 py-1.5 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  <Eye className="w-3.5 h-3.5" /> បើក
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ៤. ប្រចាំឆមាស */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                ប្រចាំឆមាស
              </h2>
              <p className="text-[11px] text-slate-400">ការវាយតម្លៃលទ្ធផលរួមតាមឆមាស</p>
            </div>

            <div className="space-y-2 text-xs mt-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a2126]/60 border border-[#164049]/50 hover:bg-[#0f353d] transition">
                <span className="truncate pr-2">របាយការណ៍បូកសរុបការវាយតម្លៃលទ្ធផលសិក្សាប្រចាំឆមាស</span>
                <button
                  onClick={() => setPreviewDoc({ title: 'របាយការណ៍បូកសរុបការវាយតម្លៃលទ្ធផលសិក្សាប្រចាំឆមាស', category: 'ប្រចាំឆមាស' })}
                  className="flex-shrink-0 flex items-center gap-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-400 border border-cyan-700/60 px-3.5 py-1.5 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  <Eye className="w-3.5 h-3.5" /> បើក
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ៥. ប្រចាំឆ្នាំ (លាតពេញ ២ ជួរឈរលើ Desktop) */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 sm:p-5 shadow-xl md:col-span-2">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              ប្រចាំឆ្នាំ
            </h2>
            <p className="text-[11px] text-slate-400">លទ្ធផល · សៀវភៅ · ដំណាច់ឆ្នាំសិក្សា</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              'តារាងចំណាត់ថ្នាក់ដំណាច់ឆ្នាំ',
              'បញ្ជីឈ្មោះសិស្សឡើងថ្នាក់',
              'បញ្ជីឈ្មោះសិស្សត្រួតថ្នាក់',
              'បញ្ជីឈ្មោះសិស្សបោះបង់ការសិក្សា',
              'ព្រឹត្តិបត្រពិន្ទុប្រចាំឆ្នាំ',
              'តារាងស្រង់ពិន្ទុផ្នែកសម្បទា'
            ].map((title) => (
              <div key={title} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a2126]/60 border border-[#164049]/50 hover:bg-[#0f353d] transition">
                <span className="truncate pr-2">{title}</span>
                <button
                  onClick={() => setPreviewDoc({ title, category: 'ប្រចាំឆ្នាំ' })}
                  className="flex-shrink-0 flex items-center gap-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-400 border border-cyan-700/60 px-3.5 py-1.5 rounded-lg active:scale-95 transition min-h-[38px]"
                >
                  <Eye className="w-3.5 h-3.5" /> បើក
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= ផ្ទាំង PREVIEW & PRINT MODAL (សន្លឹក A4 ផ្លូវការ) ================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto">
          
          {/* ក្បាល Action Bar ខាងលើ Modal */}
          <div className="w-full max-w-4xl bg-[#0a2126] border-b sm:border border-[#164049] sm:rounded-t-2xl p-3 sm:p-4 flex items-center justify-between text-white shadow-2xl">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                {previewDoc.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">បោះពុម្ព</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* សន្លឹកក្រដាស A4 Preview ពណ៌ស */}
          <div className="w-full max-w-4xl bg-white text-slate-900 p-6 sm:p-10 font-print sm:rounded-b-2xl shadow-2xl overflow-x-auto max-h-[80vh] print:m-0 print:p-0 print:shadow-none">
            
            {/* ក្បាលលិខិតជាតិ */}
            <div className="text-center font-moul text-xs sm:text-sm space-y-1 mb-6">
              <p>ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p>ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <p className="tracking-widest font-normal text-slate-600">3 3 3</p>
            </div>

            {/* ព័ត៌មានស្ថាប័ន */}
            <div className="flex justify-between items-start text-[11px] sm:text-xs mb-6 leading-relaxed">
              <div>
                <p>មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង</p>
                <p>ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកភ្នំព្រឹក</p>
                <p className="font-bold">សាលាបឋមសិក្សាភ្នំពុំ</p>
                <p className="text-slate-600">លេខកូដសាលា: {schoolInfo?.code || '02100108027'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">ថ្នាក់ទី: {currentClass || 'ថ្នាក់ទី១ក'}</p>
                <p>ឆ្នាំសិក្សា: {academicYear || '២០២៦-២០២៧'}</p>
                <p>សិស្សសរុប: {toKhmerNumber ? toKhmerNumber(students?.length || 27) : 27} នាក់</p>
              </div>
            </div>

            {/* ចំណងជើងឯកសារ */}
            <div className="text-center my-6">
              <h3 className="font-moul text-sm sm:text-base text-slate-900">
                {previewDoc.title}
              </h3>
            </div>

            {/* តារាងសិស្សគំរូផ្លូវការ */}
            <table className="w-full border-collapse border border-slate-400 text-[11px] sm:text-xs text-center mb-8">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-400 py-1.5 px-1 w-10">ល.រ</th>
                  <th className="border border-slate-400 py-1.5 px-2">អត្តលេខ</th>
                  <th className="border border-slate-400 py-1.5 px-3 text-left">គោត្តនាម និងនាម</th>
                  <th className="border border-slate-400 py-1.5 px-1 w-12">ភេទ</th>
                  <th className="border border-slate-400 py-1.5 px-2">មធ្យមភាគ</th>
                  <th className="border border-slate-400 py-1.5 px-2">ចំណាត់ថ្នាក់</th>
                  <th className="border border-slate-400 py-1.5 px-2">និទ្ទេស</th>
                </tr>
              </thead>
              <tbody>
                {(students && students.length > 0 ? students.slice(0, 5) : [
                  { id: '1', studentId: '001', name: 'ហុង លីហ៊ាង', gender: 'ប្រុស', average: '8.50', rank: '1', grade: 'A' },
                  { id: '2', studentId: '002', name: 'ចាន់ ស្រីនីត', gender: 'ស្រី', average: '8.20', rank: '2', grade: 'A' },
                  { id: '3', studentId: '003', name: 'សុខ វិបុល', gender: 'ប្រុស', average: '7.80', rank: '3', grade: 'B' },
                ]).map((s: any, idx: number) => (
                  <tr key={s.id || idx} className="hover:bg-slate-50">
                    <td className="border border-slate-400 py-1">{toKhmerNumber ? toKhmerNumber(idx + 1) : idx + 1}</td>
                    <td className="border border-slate-400 py-1">{s.studentId || '---'}</td>
                    <td className="border border-slate-400 py-1 px-3 text-left font-medium">{s.name}</td>
                    <td className="border border-slate-400 py-1">{s.gender}</td>
                    <td className="border border-slate-400 py-1">{s.average || '---'}</td>
                    <td className="border border-slate-400 py-1 font-bold">{s.rank || '---'}</td>
                    <td className="border border-slate-400 py-1">{s.grade || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ប្លុកកាលបរិច្ឆេទ & ហត្ថលេខា */}
            <div className="grid grid-cols-2 gap-4 text-center text-xs mt-10">
              <div>
                <p className="font-bold">បានឃើញ និងឯកភាព</p>
                <p className="font-medium mt-0.5">នាយកសាលាបឋមសិក្សាភ្នំពុំ</p>
                <div className="h-16 flex items-center justify-center">
                  {schoolInfo?.stampUrl && (
                    <img src={schoolInfo.stampUrl} alt="Stamp" className="h-14 object-contain opacity-90" />
                  )}
                </div>
                <p className="font-moul font-bold">{schoolInfo?.directorName || 'លោក លីម សន'}</p>
              </div>

              <div>
                <p className="italic text-[11px] text-slate-700">{khmerFullDateString}</p>
                <p className="font-medium mt-0.5">គ្រូបន្ទុកថ្នាក់</p>
                <div className="h-16 flex items-center justify-center">
                  {currentTeacher?.signatureUrl && (
                    <img src={currentTeacher.signatureUrl} alt="Signature" className="h-12 object-contain" />
                  )}
                </div>
                <p className="font-moul font-bold">{currentTeacher?.fullName || 'ជា សុភា'}</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
