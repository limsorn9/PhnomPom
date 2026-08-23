import React, { useState } from 'react';
import { Student, ClassCouncil, ClassCouncilOfficer } from '../../types';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Award,
  Phone,
  MapPin,
  HeartPulse,
  Plus,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface MyClassTabProps {
  students: Student[];
  selectedGrade: number;
  selectedSection: string;
  classCouncil?: ClassCouncil;
  onUpdateCouncil: (council: Partial<ClassCouncil>) => void;
  onSelectStudent: (student: Student) => void;
}

export const MyClassTab: React.FC<MyClassTabProps> = ({
  students,
  selectedGrade,
  selectedSection,
  classCouncil,
  onUpdateCouncil,
  onSelectStudent
}) => {
  const [viewMode, setViewMode] = useState<'roster' | 'council' | 'seating'>('roster');
  const [subView, setSubView] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all');
  const [showCouncilModal, setShowCouncilModal] = useState(false);

  // Filter students for current class
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  const filteredStudents = classStudents.filter(s => {
    const nameKh = s.nameKhmer || '';
    const code = s.code || '';
    const nameLat = s.nameLatin || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      nameKh.toLowerCase().includes(query) ||
      code.toLowerCase().includes(query) ||
      nameLat.toLowerCase().includes(query);
    const matchesGender =
      filterGender === 'all'
        ? true
        : filterGender === 'female'
        ? s.gender === 'female'
        : s.gender === 'male';
    return matchesSearch && matchesGender;
  });

  // Default officers if none
  const officers = classCouncil?.officers || [];

  const getOfficerByRole = (roleKey: string) => {
    return officers.find(o => o.role === roleKey);
  };

  return (
    <div className="space-y-4">
      {/* Sub navigation buttons & Search bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left tabs: Roster, Council, Seating layout */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg self-start">
          <button
            onClick={() => setViewMode('roster')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'roster'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>បញ្ជីឈ្មោះសិស្ស ({classStudents.length})</span>
          </button>

          <button
            onClick={() => setViewMode('council')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'council'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>គណៈកម្មការសិស្សថ្នាក់</span>
          </button>

          <button
            onClick={() => setViewMode('seating')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'seating'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ប្លង់តុ និងក្រុមសិក្សា</span>
          </button>
        </div>

        {/* Search & Gender filter for Roster */}
        {viewMode === 'roster' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setFilterGender('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  filterGender === 'all' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-600'
                }`}
              >
                ទាំងអស់
              </button>
              <button
                onClick={() => setFilterGender('female')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  filterGender === 'female' ? 'bg-white shadow-xs text-rose-700 font-bold' : 'text-slate-600'
                }`}
              >
                សិស្សស្រី ({classStudents.filter(s => s.gender === 'female').length})
              </button>
            </div>

            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setSubView('table')}
                className={`p-1.5 ${subView === 'table' ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-400'}`}
                title="ទិដ្ឋភាពតារាង"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSubView('grid')}
                className={`p-1.5 ${subView === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-400'}`}
                title="ទិដ្ឋភាពកាត"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: ROSTER TABLE OR GRID */}
      {viewMode === 'roster' && (
        <>
          {subView === 'table' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">ល.រ</th>
                      <th className="py-3 px-3">អត្តលេខ</th>
                      <th className="py-3 px-3">គោត្តនាម និងនាម</th>
                      <th className="py-3 px-3 text-center">ភេទ</th>
                      <th className="py-3 px-3">ថ្ងៃខែឆ្នាំកំណើត</th>
                      <th className="py-3 px-3">អាណាព្យាបាល / ទំនាក់ទំនង</th>
                      <th className="py-3 px-3">អាសយដ្ឋានបច្ចុប្បន្ន</th>
                      <th className="py-3 px-3 text-center">សុខភាព (BMI)</th>
                      <th className="py-3 px-3 text-right">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s, idx) => (
                        <tr
                          key={s.id}
                          onClick={() => onSelectStudent(s)}
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center text-slate-500 font-medium font-times">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-blue-700">
                            {s.code}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                                {s.nameKhmer ? s.nameKhmer.charAt(0) : 'ស'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{s.nameKhmer}</p>
                                {s.nameLatin && (
                                  <p className="text-[10px] text-slate-400 font-times uppercase">
                                    {s.nameLatin}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                s.gender === 'female'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-times">
                            {s.dob || '—'}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="text-slate-700 font-medium">{s.guardianName || 'ឪពុកម្តាយ'}</p>
                            {s.guardianPhone ? (
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 font-times">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                {s.guardianPhone}
                              </p>
                            ) : (
                              <span className="text-[10px] text-slate-400">គ្មានលេខ</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">
                            {s.address || s.village || 'ភូមិអូរគល់សំយ៉ុង'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                              ទម្ងន់ {s.weight || 25}kg
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectStudent(s);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded text-xs font-semibold transition-colors"
                            >
                              ព័ត៌មានលម្អិត
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredStudents.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => onSelectStudent(s)}
                  className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-2.5 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {s.nameKhmer ? s.nameKhmer.charAt(0) : 'ស'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{s.nameKhmer}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{s.code}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.gender === 'female'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">ថ្ងៃកំណើត៖</span>
                      <span className="font-times font-medium text-slate-700">{s.dob || '—'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">អាណាព្យាបាល៖</span>
                      <span className="font-medium text-slate-700">{s.guardianName || 'ឪពុកម្តាយ'}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">ទូរស័ព្ទ៖</span>
                      <span className="font-times text-blue-700 font-semibold">{s.guardianPhone || '—'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: CLASS COUNCIL (គណៈកម្មការសិស្សថ្នាក់) */}
      {viewMode === 'council' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-moul flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                គណៈកម្មការសិស្សស្វ័យគ្រប់គ្រងប្រចាំថ្នាក់ទី {selectedGrade} «{selectedSection}»
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                រៀបចំរចនាសម្ព័ន្ធសិស្សស្វ័យគ្រប់គ្រងតាមស្តង់ដារសាលារៀនកុមារមេត្រី និងក្រសួងអប់រំ យុវជន និងកីឡា
              </p>
            </div>
            <button
              onClick={() => setShowCouncilModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start"
            >
              <Edit2 className="w-3.5 h-3.5" />
              កែសម្រួលសមាសភាព
            </button>
          </div>

          {/* Officers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* President */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-xl p-4 border border-amber-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                  ប្រធានថ្នាក់
                </span>
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mt-2">
                {getOfficerByRole('president')?.studentNameKhmer || 'សុខ វិបុល'}
              </h4>
              <p className="text-xs text-slate-500">
                ទទួលបន្ទុកដឹកនាំរួម ទំនាក់ទំនងជាមួយគ្រូបន្ទុកថ្នាក់ និងសម្របសម្រួលសកម្មភាព
              </p>
              <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 font-medium">
                {getOfficerByRole('president')?.responsibilities || 'គ្រប់គ្រងវិន័យរួម និងសម្របសម្រួលក្នុងម៉ោងស្វ័យសិក្សា'}
              </div>
            </div>

            {/* Vice President */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-xl p-4 border border-blue-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                  អនុប្រធានថ្នាក់
                </span>
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mt-2">
                {getOfficerByRole('vice_president')?.studentNameKhmer || 'ចាន់ រស្មី'}
              </h4>
              <p className="text-xs text-slate-500">
                ជួយការងារប្រធានថ្នាក់ និងទទួលបន្ទុកពេលប្រធានថ្នាក់អវត្តមាន
              </p>
              <div className="pt-2 border-t border-blue-200/60 text-[11px] text-blue-900 font-medium">
                {getOfficerByRole('vice_president')?.responsibilities || 'ជួយស្រង់វត្តមាន និងរៀបចំសម្ភារៈបង្រៀន'}
              </div>
            </div>

            {/* Discipline Officer */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-xl p-4 border border-emerald-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                  ប្រធានផ្នែកវិន័យ & សណ្តាប់ធ្នាប់
                </span>
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mt-2">
                {getOfficerByRole('discipline')?.studentNameKhmer || 'ហេង ពិសិដ្ឋ'}
              </h4>
              <p className="text-xs text-slate-500">
                តាមដានការស្លៀកពាក់ឯកសណ្ឋាន និងសណ្តាប់ធ្នាប់ពេលគោរពទង់ជាតិ
              </p>
              <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                {getOfficerByRole('discipline')?.responsibilities || 'តាមដានការមកទាន់ពេល និងសណ្តាប់ធ្នាប់ក្នុងថ្នាក់'}
              </div>
            </div>

            {/* Sanitation & Health */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50/40 rounded-xl p-4 border border-teal-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-600 text-white shadow-xs">
                  ប្រធានផ្នែកអនាម័យ & បរិស្ថាន
                </span>
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mt-2">
                {getOfficerByRole('sanitation')?.studentNameKhmer || 'លឹម គឹមសាន'}
              </h4>
              <p className="text-xs text-slate-500">
                ដឹកនាំក្រុមវេនបោសសម្អាតថ្នាក់ ធុងសំរាម និងលាងដៃសាប៊ូ
              </p>
              <div className="pt-2 border-t border-teal-200/60 text-[11px] text-teal-900 font-medium">
                {getOfficerByRole('sanitation')?.responsibilities || 'ពិនិត្យវេនបោសសម្អាតបន្ទប់រៀន និងលាងដៃមុនពេលញ៉ាំអាហារ'}
              </div>
            </div>

            {/* Study & Library */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50/40 rounded-xl p-4 border border-purple-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-600 text-white shadow-xs">
                  ប្រធានផ្នែកសិក្សា & បណ្ណាល័យ
                </span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mt-2">
                {getOfficerByRole('study')?.studentNameKhmer || 'អ៊ុក ម៉ាលី'}
              </h4>
              <p className="text-xs text-slate-500">
                ជំរុញការអានសៀវភៅ ជួយសិស្សរៀនយឺត និងចែកសៀវភៅពុម្ព
              </p>
              <div className="pt-2 border-t border-purple-200/60 text-[11px] text-purple-900 font-medium">
                {getOfficerByRole('study')?.responsibilities || 'ជួយមិត្តភក្តិអានសៀវភៅនៅជ្រុងអាន និងកត់ត្រាការខ្ចីសៀវភៅ'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SEATING & STUDY GROUPS */}
      {viewMode === 'seating' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-moul flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                ប្លង់តុរៀបចំជាក្រុម និងវេនសកម្មភាពប្រចាំសប្តាហ៍
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                រៀបចំជា ៤ ក្រុមសិក្សាចម្រុះសមត្ថភាព (សិស្សពូកែជួយសិស្សរៀនយឺត តាមគោលការណ៍ Peer Learning)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'ក្រុមទី១ «ផ្កាឈូក»', leader: 'សុខ វិបុល', count: 7, cleanDay: 'ថ្ងៃចន្ទ', color: 'border-blue-300 bg-blue-50/40' },
              { name: 'ក្រុមទី២ «រំដួល»', leader: 'ចាន់ រស្មី', count: 8, cleanDay: 'ថ្ងៃអង្គារ', color: 'border-emerald-300 bg-emerald-50/40' },
              { name: 'ក្រុមទី៣ «ចំប៉ី»', leader: 'ហេង ពិសិដ្ឋ', count: 7, cleanDay: 'ថ្ងៃពុធ', color: 'border-amber-300 bg-amber-50/40' },
              { name: 'ក្រុមទី៤ «កុលាប»', leader: 'លឹម គឹមសាន', count: 8, cleanDay: 'ថ្ងៃព្រហស្បតិ៍', color: 'border-purple-300 bg-purple-50/40' }
            ].map((group, gIdx) => (
              <div key={gIdx} className={`rounded-xl p-4 border ${group.color} shadow-xs space-y-3`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">{group.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                    វេនសម្អាត៖ {group.cleanDay}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>ប្រធានក្រុម៖</strong> {group.leader}</p>
                  <p><strong>សមាជិក៖</strong> {group.count} នាក់</p>
                  <p className="text-[11px] text-slate-500 italic">
                    សកម្មភាព៖ ពិភាក្សាជាក្រុមក្នុងម៉ោងភាសាខ្មែរ និងគណិតវិទ្យា
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Council Edit Modal */}
      {showCouncilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base font-moul">
                កែសម្រួលគណៈកម្មការសិស្សថ្នាក់
              </h3>
              <button
                onClick={() => setShowCouncilModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ជ្រើសរើសសិស្សទទួលបន្ទុកតួនាទីផ្សេងៗក្នុងថ្នាក់រៀន៖
            </p>

            <div className="space-y-3">
              {[
                { role: 'president', label: 'ប្រធានថ្នាក់' },
                { role: 'vice_president', label: 'អនុប្រធានថ្នាក់' },
                { role: 'discipline', label: 'ប្រធានផ្នែកវិន័យ' },
                { role: 'sanitation', label: 'ប្រធានផ្នែកអនាម័យ' },
                { role: 'study', label: 'ប្រធានផ្នែកសិក្សា' }
              ].map(item => (
                <div key={item.role} className="flex items-center justify-between gap-3 text-xs">
                  <label className="font-bold text-slate-700 w-36">{item.label}៖</label>
                  <select
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    defaultValue={classStudents[0]?.nameKhmer || ''}
                  >
                    {classStudents.map(s => (
                      <option key={s.id} value={s.nameKhmer}>
                        {s.nameKhmer} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCouncilModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                បោះបង់
              </button>
              <button
                onClick={() => {
                  setShowCouncilModal(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
              >
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
