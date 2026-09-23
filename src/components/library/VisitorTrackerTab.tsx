import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { LibraryVisitorLog, LibraryVisitPurpose } from '../../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const VisitorTrackerTab: React.FC = () => {
  const {
    libraryVisitors,
    addLibraryVisitor,
    updateLibraryVisitor,
    deleteLibraryVisitor,
    students,
    currentUser,
    schoolProfile,
    showToast
  } = useSchool();

  const isReadOnly = currentUser?.role === 'student' || currentUser?.role === 'parent';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [editingVisitorId, setEditingVisitorId] = useState<string | null>(null);

  // Check-In Form State
  const [formData, setFormData] = useState<{
    studentId: string;
    studentCode: string;
    studentNameKhmer: string;
    grade: number;
    section: string;
    visitDate: string;
    timeIn: string;
    timeOut: string;
    purpose: LibraryVisitPurpose;
    notes: string;
  }>({
    studentId: students[0]?.id || '',
    studentCode: students[0]?.code || '',
    studentNameKhmer: students[0]?.nameKhmer || '',
    grade: students[0]?.grade || 1,
    section: students[0]?.section || 'ក',
    visitDate: new Date().toISOString().split('T')[0],
    timeIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    timeOut: '',
    purpose: 'reading',
    notes: ''
  });

  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  const purposeLabels: Record<LibraryVisitPurpose, { label: string; color: string }> = {
    reading: { label: '📖 អានសៀវភៅ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    borrow_return: { label: '🔄 ខ្ចី ឬ សងសៀវភៅ', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    research: { label: '🔍 ស្រាវជ្រាវមេរៀន', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    homework: { label: '✍️ ធ្វើស្វ័យសិក្សា/កិច្ចការ', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    library_class: { label: '👥 ម៉ោងបណ្ណាល័យរួម', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    storytelling: { label: '🗣️ ចូលរួមស្តាប់និទានរឿង', color: 'bg-rose-100 text-rose-800 border-rose-200' }
  };

  // Filtered Visitors
  const filteredVisitors = useMemo(() => {
    return libraryVisitors.filter(v => {
      const matchG = selectedGrade === 'all' || v.grade === parseInt(selectedGrade);
      const matchD = !selectedDate || v.visitDate === selectedDate;
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        v.studentNameKhmer.toLowerCase().includes(q) ||
        (v.studentCode && v.studentCode.toLowerCase().includes(q)) ||
        (v.notes && v.notes.toLowerCase().includes(q));
      return matchG && matchD && matchQ;
    });
  }, [libraryVisitors, selectedGrade, selectedDate, searchQuery]);

  // Today's Stats
  const todayVisitsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return libraryVisitors.filter(v => v.visitDate === today).length;
  }, [libraryVisitors]);

  const handleOpenCheckIn = () => {
    setEditingVisitorId(null);
    const firstStudent = students[0];
    setFormData({
      studentId: firstStudent?.id || '',
      studentCode: firstStudent?.code || '',
      studentNameKhmer: firstStudent?.nameKhmer || '',
      grade: firstStudent?.grade || 1,
      section: firstStudent?.section || 'ក',
      visitDate: new Date().toISOString().split('T')[0],
      timeIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      timeOut: '',
      purpose: 'reading',
      notes: ''
    });
    setIsCheckInModalOpen(true);
  };

  const handleStudentSelect = (stuId: string) => {
    const stu = students.find(s => s.id === stuId);
    if (stu) {
      setFormData(prev => ({
        ...prev,
        studentId: stu.id,
        studentCode: stu.code || '',
        studentNameKhmer: stu.nameKhmer,
        grade: stu.grade || 1,
        section: stu.section || 'ក'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentNameKhmer) {
      showToast('សូមជ្រើសរើស ឬបញ្ចូលឈ្មោះសិស្ស!', 'warning');
      return;
    }

    if (editingVisitorId) {
      updateLibraryVisitor(editingVisitorId, {
        ...formData,
        librarianName: currentUser?.nameKhmer || 'បណ្ណារក្ស'
      });
    } else {
      addLibraryVisitor({
        ...formData,
        librarianName: currentUser?.nameKhmer || 'បណ្ណារក្ស'
      });
    }
    setIsCheckInModalOpen(false);
  };

  const handleSetTimeOutNow = (visitor: LibraryVisitorLog) => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    updateLibraryVisitor(visitor.id, { timeOut: now });
    showToast(`បានកត់ត្រាម៉ោងចេញសម្រាប់សិស្ស «${visitor.studentNameKhmer}» (${now})`);
  };

  const handleExportCSV = () => {
    const headers = ['កាលបរិច្ឆេទ,ម៉ោងចូល,ម៉ោងចេញ,អត្តលេខ,ឈ្មោះសិស្ស,ថ្នាក់,គោលបំណង,ចំណាំ'];
    const rows = filteredVisitors.map(v =>
      `"${v.visitDate}","${v.timeIn}","${v.timeOut || ''}","${v.studentCode || ''}","${v.studentNameKhmer}","ថ្នាក់ទី ${v.grade}${v.section}","${purposeLabels[v.purpose]?.label || v.purpose}","${v.notes || ''}"`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `វត្តមានបណ្ណាល័យ_${selectedDate || 'all'}.csv`;
    link.click();
    showToast('បានទាញយកតារាងវត្តមានបណ្ណាល័យជា CSV ជោគជ័យ!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2 border border-white/20">
            <Clock className="w-3.5 h-3.5" />
            <span>តាមដានការប្រើប្រាស់បណ្ណាល័យជាក់ស្តែង (Student Footfall)</span>
          </div>
          <h2 className="font-moul text-xl sm:text-2xl text-white">វត្តមានសិស្សចូលប្រើប្រាស់បណ្ណាល័យ</h2>
          <p className="text-xs sm:text-sm text-teal-100 font-battambang mt-1">
            កត់ត្រា និងតាមដានសកម្មភាពអាន សង-ខ្ចី និងស្វ័យសិក្សារបស់សិស្សានុសិស្សប្រចាំថ្ងៃ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>ទាញយក CSV</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={handleOpenCheckIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាវត្តមានថ្មី (Check-In)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-battambang">វត្តមានចូលថ្ងៃនេះ</p>
          <p className="text-2xl sm:text-3xl font-bold font-times text-teal-700 mt-1">
            {toKhmerNum(todayVisitsCount)} <span className="text-xs text-slate-500 font-battambang">នាក់</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-battambang">សរុបកំណត់ត្រាទាំងអស់</p>
          <p className="text-2xl sm:text-3xl font-bold font-times text-blue-700 mt-1">
            {toKhmerNum(libraryVisitors.length)} <span className="text-xs text-slate-500 font-battambang">ដង</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-battambang">សម្រាប់អានសៀវភៅ</p>
          <p className="text-2xl sm:text-3xl font-bold font-times text-emerald-700 mt-1">
            {toKhmerNum(libraryVisitors.filter(v => v.purpose === 'reading').length)}{' '}
            <span className="text-xs text-slate-500 font-battambang">ដង</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-battambang">សម្រាប់ខ្ចី ឬសង</p>
          <p className="text-2xl sm:text-3xl font-bold font-times text-amber-700 mt-1">
            {toKhmerNum(libraryVisitors.filter(v => v.purpose === 'borrow_return').length)}{' '}
            <span className="text-xs text-slate-500 font-battambang">ដង</span>
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 font-mono"
            />
          </div>

          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 font-battambang"
          >
            <option value="all">គ្រប់កម្រិតថ្នាក់ (១-៦)</option>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g}>
                ថ្នាក់ទី {toKhmerNum(g)}
              </option>
            ))}
          </select>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 underline"
            >
              បង្ហាញគ្រប់ថ្ងៃ
            </button>
          )}
        </div>
      </div>

      {/* Visitor Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-moul text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="py-3 px-4">សិស្សានុសិស្ស</th>
                <th className="py-3 px-4">ថ្នាក់</th>
                <th className="py-3 px-4">គោលបំណង</th>
                <th className="py-3 px-4">កំណត់សម្គាល់</th>
                <th className="py-3 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-battambang text-slate-700">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>មិនមានទិន្នន័យវត្តមានស្របតាមការស្វែងរកឡើយ</span>
                  </td>
                </tr>
              ) : (
                filteredVisitors.map(v => (
                  <tr key={v.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 font-mono text-xs">{v.visitDate}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono mt-0.5">
                        <Clock className="w-3 h-3 text-teal-600" />
                        <span>{v.timeIn}</span>
                        {v.timeOut ? (
                          <span className="text-slate-700 font-bold"> - {v.timeOut}</span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-1 rounded text-[10px]">កំពុងនៅ</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-900">{v.studentNameKhmer}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{v.studentCode || 'N/A'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-xs">
                        ថ្នាក់ទី {toKhmerNum(v.grade)}{v.section}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${purposeLabels[v.purpose]?.color || 'bg-slate-100'}`}
                      >
                        {purposeLabels[v.purpose]?.label || v.purpose}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">
                      {v.notes || '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!v.timeOut && !isReadOnly && (
                          <button
                            onClick={() => handleSetTimeOutNow(v)}
                            title="កត់ត្រាម៉ោងចេញឥឡូវនេះ"
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg text-xs flex items-center gap-1 font-bold"
                          >
                            <CheckCircle className="w-4 h-4 text-teal-600" />
                            <span className="hidden md:inline">ចេញ</span>
                          </button>
                        )}

                        {!isReadOnly && (
                          <button
                            onClick={() => deleteLibraryVisitor(v.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="លុបកំណត់ត្រា"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-teal-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-200" />
                <h3 className="font-moul text-sm sm:text-base">កត់ត្រាវត្តមានសិស្សចូលបណ្ណាល័យ</h3>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 font-battambang text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ជ្រើសរើសសិស្ស</label>
                <select
                  value={formData.studentId}
                  onChange={e => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameKhmer} ({s.code || 'STU'}) - ថ្នាក់ទី {toKhmerNum(s.grade || 1)}{s.section || 'ក'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">កាលបរិច្ឆេទ</label>
                  <input
                    type="date"
                    value={formData.visitDate}
                    onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ម៉ោងចូល</label>
                  <input
                    type="time"
                    value={formData.timeIn}
                    onChange={e => setFormData({ ...formData, timeIn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">គោលបំណងចូលបណ្ណាល័យ</label>
                <select
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value as LibraryVisitPurpose })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  <option value="reading">📖 អានសៀវភៅ</option>
                  <option value="borrow_return">🔄 ខ្ចី ឬ សងសៀវភៅ</option>
                  <option value="research">🔍 ស្រាវជ្រាវមេរៀន</option>
                  <option value="homework">✍️ ធ្វើស្វ័យសិក្សា/កិច្ចការ</option>
                  <option value="library_class">👥 ម៉ោងបណ្ណាល័យរួម</option>
                  <option value="storytelling">🗣️ ចូលរួមស្តាប់និទានរឿង</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">កំណត់សម្គាល់បន្ថែម</label>
                <input
                  type="text"
                  placeholder="ចំណងជើងសៀវភៅ ឬសកម្មភាពផ្សេងៗ..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow"
                >
                  កត់ត្រាវត្តមាន
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
