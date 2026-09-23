import React, { useRef, useState } from 'react';
import { Student, SchoolProfile } from '../types';
import {
  Printer,
  Download,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Eye,
  Camera
} from 'lucide-react';
import { formatStudentToMoEYSRow, MoEYSStudentRecordRow } from '../utils/studentMoeyHelpers';
import { MoEYSRoyalHeader } from './AngkorMotif';

interface MoEYSStudentRecordMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolProfile: SchoolProfile;
  selectedGrade?: number | 'all';
  selectedSection?: string | 'all';
}

export const MoEYSStudentRecordMasterModal: React.FC<MoEYSStudentRecordMasterModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolProfile,
  selectedGrade: initialGrade = 'all',
  selectedSection: initialSection = 'all'
}) => {
  const [filterGrade, setFilterGrade] = useState<number | 'all'>(initialGrade);
  const [filterSection, setFilterSection] = useState<string | 'all'>(initialSection);
  const [filterGender, setFilterGender] = useState<'all' | 'M' | 'F'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter students
  const filteredStudents = students.filter(student => {
    if (filterGrade !== 'all' && student.grade !== filterGrade) return false;
    if (filterSection !== 'all' && student.section !== filterSection) return false;
    if (filterGender !== 'all' && student.gender !== filterGender) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = student.nameKhmer?.toLowerCase().includes(q) ||
        student.nameLatin?.toLowerCase().includes(q) ||
        student.code?.toLowerCase().includes(q) ||
        student.guardianPhone?.includes(q) ||
        student.pobProvince?.toLowerCase().includes(q);
      if (!matchName) return false;
    }
    return true;
  });

  const formattedRows: MoEYSStudentRecordRow[] = filteredStudents.map((st, idx) =>
    formatStudentToMoEYSRow(st, idx + 1)
  );

  const totalFemale = formattedRows.filter(r => r.gender === 'F').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'ល.រ',
      'អត្តលេខ',
      'គោត្តនាម_ខ្មែរ',
      'នាម_ខ្មែរ',
      'គោត្តនាម_ឡាតាំង',
      'នាម_ឡាតាំង',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'អាយុ',
      'ភូមិកំណើត',
      'ឃុំ/សង្កាត់កំណើត',
      'ស្រុក/ខណ្ឌកំណើត',
      'រាជធានីខេត្តកំណើត',
      'ឪពុក_គោត្តនាម',
      'ឪពុក_នាម',
      'ឪពុក_មុខរបរ',
      'ម្តាយ_គោត្តនាម',
      'ម្តាយ_នាម',
      'ម្តាយ_មុខរបរ',
      'អាណាព្យាបាល_គោត្តនាម',
      'អាណាព្យាបាល_នាម',
      'អាណាព្យាបាល_មុខរបរ',
      'ភូមិបច្ចុប្បន្ន',
      'ឃុំ/សង្កាត់បច្ចុប្បន្ន',
      'ស្រុក/ខណ្ឌបច្ចុប្បន្ន',
      'រាជធានីខេត្តបច្ចុប្បន្ន',
      'ប្រវត្តិសិក្សា',
      'ស្ថានភាពជីវភាព',
      'កំព្រា',
      'ពិការភាព',
      'អាហារូបករណ៍',
      'ជនជាតិដើមភាគតិច',
      'លក្ខណៈពិសេស',
      'លេខទូរស័ព្ទ',
      'ស្ថានភាពបោះបង់',
      'ផ្សេងៗ'
    ];

    const rows = formattedRows.map(r => [
      r.index,
      `"${r.code}"`,
      `"${r.khmerLastName}"`,
      `"${r.khmerFirstName}"`,
      `"${r.latinLastName}"`,
      `"${r.latinFirstName}"`,
      `"${r.genderLabel}"`,
      `"${r.dob}"`,
      r.age,
      `"${r.pobVillage}"`,
      `"${r.pobCommune}"`,
      `"${r.pobDistrict}"`,
      `"${r.pobProvince}"`,
      `"${r.fatherLastName}"`,
      `"${r.fatherFirstName}"`,
      `"${r.fatherOccupation}"`,
      `"${r.motherLastName}"`,
      `"${r.motherFirstName}"`,
      `"${r.motherOccupation}"`,
      `"${r.guardianLastName}"`,
      `"${r.guardianFirstName}"`,
      `"${r.guardianOccupation}"`,
      `"${r.currentVillage}"`,
      `"${r.currentCommune}"`,
      `"${r.currentDistrict}"`,
      `"${r.currentProvince}"`,
      `"${r.academicHistory}"`,
      `"${r.livingCondition}"`,
      `"${r.isOrphan}"`,
      `"${r.disability}"`,
      `"${r.scholarship}"`,
      `"${r.ethnicMinority}"`,
      `"${r.specialCharacteristics}"`,
      `"${r.phone}"`,
      `"${r.dropoutLabel}"`,
      `"${r.remarks}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `តារាងប្រវត្តិសិស្សស្តង់ដារក្រសួង_${schoolProfile.nameKhmer}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-[98vw] xl:max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
        
        {/* Top Header Controls (Hidden on Print) */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-moul">តារាងប្រវត្តិសិស្សស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/40 text-blue-200 text-xs font-semibold border border-blue-400/30">
                  MoEYS Standard Master Roster
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                {schoolProfile.nameKhmer} • ឆ្នាំសិក្សា៖ {schoolProfile.academicYear} • សិស្សសរុប៖ <strong>{formattedRows.length} នាក់ (ស្រី {totalFemale} នាក់)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="ទាញយកជា Excel/CSV ស្តង់ដារ"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ទាញយក CSV/Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="បោះពុម្ពជាទម្រង់ A4/A3 Landscape"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពតារាង (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="បិទ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar (Hidden on Print) */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកឈ្មោះ, អត្តលេខ, អាសយដ្ឋាន..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-56 sm:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">គ្រប់កម្រិតថ្នាក់ (១-៦)</option>
              <option value={1}>ថ្នាក់ទី១</option>
              <option value={2}>ថ្នាក់ទី២</option>
              <option value={3}>ថ្នាក់ទី៣</option>
              <option value={4}>ថ្នាក់ទី៤</option>
              <option value={5}>ថ្នាក់ទី៥</option>
              <option value={6}>ថ្នាក់ទី៦</option>
            </select>

            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">គ្រប់បន្ទប់ (ក, ខ, គ...)</option>
              <option value="ក">បន្ទប់ ក</option>
              <option value="ខ">បន្ទប់ ខ</option>
              <option value="គ">បន្ទប់ គ</option>
            </select>

            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">ភេទទាំងអស់</option>
              <option value="F">ស្រី</option>
              <option value="M">ប្រុស</option>
            </select>
          </div>

          <div className="text-slate-600 font-medium">
            បង្ហាញសិស្ស <strong className="text-blue-900">{formattedRows.length}</strong> / {students.length} នាក់
          </div>
        </div>

        {/* Scrollable Printable MoEYS Master Table Area */}
        <div ref={tableRef} className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Printable MoEYS Kingdom Header */}
          <div className="mb-4 text-center">
            <div className="flex justify-between items-start mb-2">
              <div className="text-left text-xs">
                <p className="font-moul text-slate-800">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="font-semibold text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                <p className="font-semibold text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                <p className="font-bold text-blue-900">{schoolProfile.nameKhmer}</p>
              </div>

              <div className="text-center">
                <p className="font-moul text-sm text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-xs text-slate-800">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="w-24 h-0.5 bg-slate-800 mx-auto mt-1" />
              </div>
            </div>

            <h2 className="font-moul text-base sm:text-lg text-slate-900 mt-2 uppercase tracking-wide">
              តារាងបញ្ជីប្រវត្តិរូបសិស្សានុសិស្ស
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {filterGrade !== 'all' ? `កម្រិតថ្នាក់ទី ${filterGrade}${filterSection !== 'all' ? filterSection : ''}` : 'គ្រប់កម្រិតថ្នាក់'} • ឆ្នាំសិក្សា៖ {schoolProfile.academicYear} • សរុប៖ <strong>{formattedRows.length} នាក់ (ស្រី {totalFemale} នាក់)</strong>
            </p>
          </div>

          {/* Master Table with 100% Exact Matching Headers from the user's MoEYS Image */}
          <div className="overflow-x-auto border border-blue-900 shadow-sm rounded-lg bg-white">
            <table className="w-full text-left border-collapse text-[11px]">
              {/* Header Level 1 (Top Category Groupings in Blue as in image) */}
              <thead>
                <tr className="bg-blue-800 text-white font-bold text-center border-b border-blue-950">
                  <th rowSpan={3} className="p-2 border-r border-blue-700 w-10 text-center">ល.រ</th>
                  <th colSpan={2} className="p-2 border-r border-blue-700">ភាសាខ្មែរ</th>
                  <th colSpan={2} className="p-2 border-r border-blue-700">អក្សរឡាតាំង</th>
                  <th rowSpan={3} className="p-2 border-r border-blue-700 w-12">ភេទ</th>
                  <th rowSpan={3} className="p-2 border-r border-blue-700 w-24">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th rowSpan={3} className="p-2 border-r border-blue-700 w-12">អាយុ</th>
                  <th colSpan={4} className="p-2 border-r border-blue-700">ទីកន្លែងកំណើត</th>
                  <th colSpan={3} className="p-2 border-r border-blue-700">ឈ្មោះឪពុក</th>
                  <th colSpan={3} className="p-2 border-r border-blue-700">ឈ្មោះម្តាយ</th>
                  <th colSpan={3} className="p-2 border-r border-blue-700">ឈ្មោះអាណាព្យាបាល</th>
                  <th colSpan={4} className="p-2 border-r border-blue-700">អាសយដ្ឋានបច្ចុប្បន្ន</th>
                  <th colSpan={5} className="p-2 border-r border-blue-700">ប្រវត្តិសិក្សា</th>
                  <th colSpan={6} className="p-2">ស្ថានភាពសិស្ស</th>
                </tr>

                {/* Header Level 2 (Sub-headers exactly as in image) */}
                <tr className="bg-blue-700 text-white font-bold text-center border-b border-blue-900 text-[10px]">
                  {/* ភាសាខ្មែរ */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">គោត្តនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">និងនាម</th>
                  {/* អក្សរឡាតាំង */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">គោត្តនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">និងនាម</th>
                  {/* ទីកន្លែងកំណើត */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[75px]">ភូមិ</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">ឃុំ/សង្កាត់</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">ស្រុក/ខ័ណ្ឌ</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">រាជធានីខេត្ត</th>
                  {/* ឈ្មោះឪពុក */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">គោត្តនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">និងនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">មុខរបរ</th>
                  {/* ឈ្មោះម្តាយ */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">គោត្តនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">និងនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">មុខរបរ</th>
                  {/* ឈ្មោះអាណាព្យាបាល */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">គោត្តនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">និងនាម</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">មុខរបរ</th>
                  {/* អាសយដ្ឋានបច្ចុប្បន្ន */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[75px]">ភូមិ</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">ឃុំ/សង្កាត់</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[80px]">ស្រុក/ខ័ណ្ឌ</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">រាជធានីខេត្ត</th>
                  {/* ប្រវត្តិសិក្សា */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[75px]">ប្រវត្តិសិក្សា</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[75px]">ស្ថានភាពជីវភាព</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[75px]">កំព្រា</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[75px]">ពិការភាព</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[85px]">អាហារូបករណ៍</th>
                  {/* ស្ថានភាពសិស្ស */}
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">ជនជាតិដើមភាគតិច</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">លក្ខណៈពិសេស</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[90px]">លេខទូរសព្ទ</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[60px]">រូបថត</th>
                  <th className="p-1.5 border-r border-blue-600 min-w-[65px]">បោះបង់</th>
                  <th className="p-1.5 min-w-[80px]">ផ្សេងៗ</th>
                </tr>
              </thead>

              {/* Table Data Rows */}
              <tbody className="divide-y divide-slate-200 font-sans">
                {formattedRows.length > 0 ? (
                  formattedRows.map((r, idx) => (
                    <tr
                      key={r.id || idx}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                      }`}
                    >
                      <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-700">
                        {r.index}
                      </td>
                      {/* 1. ភាសាខ្មែរ */}
                      <td className="p-2 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                        {r.khmerLastName || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                        {r.khmerFirstName || r.khmerFullName || '-'}
                      </td>
                      {/* 2. អក្សរឡាតាំង */}
                      <td className="p-2 border-r border-slate-200 font-medium text-slate-700 font-times whitespace-nowrap">
                        {r.latinLastName || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-medium text-slate-700 font-times whitespace-nowrap">
                        {r.latinFirstName || r.latinFullName || '-'}
                      </td>
                      {/* 3. ភេទ */}
                      <td className="p-2 border-r border-slate-200 text-center whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            r.gender === 'F' ? 'text-pink-700 font-semibold' : 'text-blue-700'
                          }`}
                        >
                          {r.genderLabel}
                        </span>
                      </td>
                      {/* 4. ថ្ងៃខែឆ្នាំកំណើត */}
                      <td className="p-2 border-r border-slate-200 text-center text-slate-700 font-times whitespace-nowrap">
                        {r.dob || '-'}
                      </td>
                      {/* 5. អាយុ */}
                      <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-800 font-times">
                        {r.age}
                      </td>
                      {/* 6. ទីកន្លែងកំណើត */}
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.pobVillage || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.pobCommune || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.pobDistrict || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.pobProvince || '-'}</td>
                      {/* 7. ឈ្មោះឪពុក */}
                      <td className="p-2 border-r border-slate-200 text-slate-800 whitespace-nowrap">{r.fatherLastName || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-800 whitespace-nowrap">{r.fatherFirstName || r.fatherFullName || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-600 whitespace-nowrap">{r.fatherOccupation || '-'}</td>
                      {/* 8. ឈ្មោះម្តាយ */}
                      <td className="p-2 border-r border-slate-200 text-slate-800 whitespace-nowrap">{r.motherLastName || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-800 whitespace-nowrap">{r.motherFirstName || r.motherFullName || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-600 whitespace-nowrap">{r.motherOccupation || '-'}</td>
                      {/* 9. ឈ្មោះអាណាព្យាបាល */}
                      <td className="p-2 border-r border-slate-200 text-slate-800 whitespace-nowrap">{r.guardianLastName || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-800 whitespace-nowrap">{r.guardianFirstName || r.guardianFullName || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-600 whitespace-nowrap">{r.guardianOccupation || '-'}</td>
                      {/* 10. អាសយដ្ឋានបច្ចុប្បន្ន */}
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.currentVillage || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.currentCommune || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.currentDistrict || '-'}</td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">{r.currentProvince || '-'}</td>
                      {/* 11. ប្រវត្តិសិក្សា */}
                      <td className="p-2 border-r border-slate-200 text-center whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{r.academicHistory}</span>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.livingCondition === 'ក្រ១' ? 'bg-rose-100 text-rose-800' :
                          r.livingCondition === 'ក្រ២' ? 'bg-amber-100 text-amber-800' : 'text-slate-600'
                        }`}>
                          {r.livingCondition}
                        </span>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-700 whitespace-nowrap">
                        {r.isOrphan}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-700 whitespace-nowrap">
                        {r.disability}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-700 whitespace-nowrap">
                        {r.scholarship}
                      </td>
                      {/* 12. ស្ថានភាពសិស្ស */}
                      <td className="p-2 border-r border-slate-200 text-center text-slate-700 whitespace-nowrap">
                        {r.ethnicMinority}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                        {r.specialCharacteristics || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-700 font-times whitespace-nowrap">
                        {r.phone || '-'}
                      </td>
                      <td className="p-1 border-r border-slate-200 text-center">
                        {r.photoUrl ? (
                          <div className="w-8 h-9 mx-auto rounded overflow-hidden border border-slate-300">
                            <img
                              src={r.photoUrl}
                              alt={r.khmerFullName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400">គ្មាន</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.isDroppedOut ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.dropoutLabel}
                        </span>
                      </td>
                      <td className="p-2 text-slate-700 whitespace-nowrap">
                        {r.remarks || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={33} className="text-center py-12 text-slate-500 text-sm">
                      ពុំមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌចម្រាញ់នេះឡើយ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Official Signatures Footer on Print */}
          <div className="hidden print:flex justify-between items-end mt-8 text-xs text-slate-900 pt-6 px-4">
            <div className="text-center">
              <p>បានឃើញ និងឯកភាព</p>
              <strong className="block mt-1 font-moul text-slate-900">នាយកសាលា</strong>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[ហត្ថលេខា និងត្រា]</span>
              </div>
              <p className="font-bold">{schoolProfile.principalName}</p>
            </div>

            <div className="text-center">
              <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ {new Date().getFullYear()}</p>
              <strong className="block mt-1 font-moul text-slate-900">អ្នករៀបចំបញ្ជី</strong>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[ហត្ថលេខា]</span>
              </div>
              <p className="font-bold">{schoolProfile.principalName || 'លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់'}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden text-xs">
          <div className="text-slate-500">
            💡 ព័ត៌មានលម្អិតទាំង ១២ ជួរឈរត្រូវបានរៀបចំស្របតាមទម្រង់ក្រសួងអប់រំ យុវជន និងកីឡា ១០០%
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
