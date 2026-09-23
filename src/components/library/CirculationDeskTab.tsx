import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { LibraryBook, LibraryReadingLog } from '../../types';
import {
  BookMarked,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Star,
  Printer,
  FileSpreadsheet,
  Trash2,
  Check,
  BookOpen,
  User,
  ArrowRight
} from 'lucide-react';

interface CirculationDeskTabProps {
  onOpenLendModal: () => void;
}

export const CirculationDeskTab: React.FC<CirculationDeskTabProps> = ({ onOpenLendModal }) => {
  const {
    readingLogs,
    libraryBooks,
    updateReadingLog,
    deleteReadingLog,
    currentUser,
    showToast
  } = useSchool();

  const isReadOnly = currentUser?.role === 'student' || currentUser?.role === 'parent';

  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowed' | 'overdue' | 'returned'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Return Modal State
  const [selectedLogForReturn, setSelectedLogForReturn] = useState<LibraryReadingLog | null>(null);
  const [returnFormData, setReturnFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    pagesRead: 20,
    summaryOrImpression: '',
    rating: 5,
    conditionOnReturn: 'good' as 'good' | 'damaged' | 'lost'
  });

  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  // Helper to calculate overdue days
  const getOverdueDays = (dueDateStr: string, status: string) => {
    if (status === 'returned') return 0;
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filtered reading logs
  const filteredLogs = useMemo(() => {
    return readingLogs.filter(log => {
      const isOverdue = log.status === 'overdue' || (log.status === 'borrowed' && getOverdueDays(log.dueDate, log.status) > 0);
      
      let matchStatus = true;
      if (statusFilter === 'borrowed') {
        matchStatus = log.status === 'borrowed' && !isOverdue;
      } else if (statusFilter === 'overdue') {
        matchStatus = isOverdue;
      } else if (statusFilter === 'returned') {
        matchStatus = log.status === 'returned';
      }

      const matchGrade = gradeFilter === 'all' || (log.grade || log.studentGrade) === parseInt(gradeFilter);

      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        log.studentNameKhmer.toLowerCase().includes(q) ||
        (log.studentCode && log.studentCode.toLowerCase().includes(q)) ||
        log.bookTitle.toLowerCase().includes(q) ||
        (log.bookCode && log.bookCode.toLowerCase().includes(q));

      return matchStatus && matchGrade && matchQ;
    });
  }, [readingLogs, statusFilter, gradeFilter, searchQuery]);

  // Statistics
  const circulationStats = useMemo(() => {
    const total = readingLogs.length;
    let borrowed = 0;
    let overdue = 0;
    let returned = 0;

    readingLogs.forEach(l => {
      if (l.status === 'returned') {
        returned += 1;
      } else if (l.status === 'overdue' || getOverdueDays(l.dueDate, l.status) > 0) {
        overdue += 1;
      } else {
        borrowed += 1;
      }
    });

    return { total, borrowed, overdue, returned };
  }, [readingLogs]);

  const handleOpenReturnModal = (log: LibraryReadingLog) => {
    setSelectedLogForReturn(log);
    setReturnFormData({
      returnDate: new Date().toISOString().split('T')[0],
      pagesRead: log.pagesRead || 20,
      summaryOrImpression: log.summaryOrImpression || log.readingSummary || '',
      rating: log.rating || 5,
      conditionOnReturn: 'good'
    });
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogForReturn) return;

    updateReadingLog(selectedLogForReturn.id, {
      status: 'returned',
      returnDate: returnFormData.returnDate,
      pagesRead: returnFormData.pagesRead,
      summaryOrImpression: returnFormData.summaryOrImpression,
      readingSummary: returnFormData.summaryOrImpression,
      rating: returnFormData.rating,
      conditionOnReturn: returnFormData.conditionOnReturn
    });

    setSelectedLogForReturn(null);
    showToast(`បានទទួលសៀវភៅ «${selectedLogForReturn.bookTitle}» ពីសិស្ស «${selectedLogForReturn.studentNameKhmer}» រួចរាល់!`, 'success');
  };

  const handleExportCSV = () => {
    const headers = ['អត្តលេខសិស្ស,ឈ្មោះសិស្ស,ថ្នាក់,កូដសៀវភៅ,ចំណងជើងសៀវភៅ,ថ្ងៃខ្ចី,ថ្ងៃត្រូវសង,ថ្ងៃបានសង,ស្ថានភាព,ទំព័រអាន,ចំណាត់ថ្នាក់ផ្កាយ'];
    const rows = filteredLogs.map(l =>
      `"${l.studentCode || ''}","${l.studentNameKhmer}","ថ្នាក់ទី ${l.grade || l.studentGrade || 1}${l.section || l.studentSection || 'ក'}","${l.bookCode || ''}","${l.bookTitle}","${l.borrowDate}","${l.dueDate}","${l.returnDate || ''}","${l.status}","${l.pagesRead || 0}","${l.rating || ''}"`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `កំណត់ត្រាខ្ចី_សងសៀវភៅ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('បានទាញយកតារាងខ្ចី-សងសៀវភៅជា CSV ជោគជ័យ!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-200 mb-2 border border-white/20">
            <BookMarked className="w-3.5 h-3.5" />
            <span>តុបញ្ជរចរាចរណ៍សៀវភៅ (Library Circulation Desk)</span>
          </div>
          <h2 className="font-moul text-xl sm:text-2xl text-white">ត្រួតពិនិត្យការខ្ចី-សងសៀវភៅ</h2>
          <p className="text-xs sm:text-sm text-purple-100 font-battambang mt-1">
            កត់ត្រាការខ្ចី តាមដានថ្ងៃត្រូវសង គ្រប់គ្រងសៀវភៅហួសកំណត់ និងកត់ត្រាការយល់ដឹងរបស់សិស្ស
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-300" />
            <span>ទាញយក CSV</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={onOpenLendModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាការខ្ចីថ្មី (New Loan)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Status Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-battambang">ទាំងអស់ (All Logs)</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold font-times text-slate-800 mt-1">
            {toKhmerNum(circulationStats.total)}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('borrowed')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'borrowed'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-battambang">កំពុងខ្ចី (Active Loans)</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-times text-blue-700 mt-1">
            {toKhmerNum(circulationStats.borrowed)}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('overdue')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'overdue'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-600 font-battambang font-bold">ហួសកាលកំណត់ (Overdue)</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-times text-rose-700 mt-1">
            {toKhmerNum(circulationStats.overdue)}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('returned')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'returned'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-battambang">បានសងរួចរាល់ (Returned)</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-times text-emerald-700 mt-1">
            {toKhmerNum(circulationStats.returned)}
          </p>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះសិស្ស, ចំណងជើងសៀវភៅ, កូដ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 font-battambang"
          >
            <option value="all">គ្រប់កម្រិតថ្នាក់ (១-៦)</option>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g}>
                ថ្នាក់ទី {toKhmerNum(g)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Circulation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-moul text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">សិស្សានុសិស្ស</th>
                <th className="py-3 px-4">សៀវភៅដែលខ្ចី</th>
                <th className="py-3 px-4">កាលបរិច្ឆេទ (ខ្ចី - ត្រូវសង)</th>
                <th className="py-3 px-4">ស្ថានភាព</th>
                <th className="py-3 px-4">ទំព័រ & ចំណាប់អារម្មណ៍</th>
                <th className="py-3 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-battambang text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>មិនមានកំណត់ត្រាខ្ចី-សងស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const overdueDays = getOverdueDays(log.dueDate, log.status);
                  const isOverdue = log.status === 'overdue' || (log.status === 'borrowed' && overdueDays > 0);

                  return (
                    <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-950">{log.studentNameKhmer}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {log.studentCode || 'N/A'} • ថ្នាក់ទី {toKhmerNum(log.grade || log.studentGrade || 1)}{log.section || log.studentSection || 'ក'}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-800 line-clamp-1">{log.bookTitle}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {log.bookCode || 'BK-Code'} • {log.bookCategory || 'សៀវភៅទូទៅ'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs font-mono">
                          <span className="text-slate-500">ខ្ចី៖ </span>
                          <span className="font-bold">{log.borrowDate}</span>
                        </div>
                        <div className="text-xs font-mono mt-0.5">
                          <span className="text-slate-500">សង៖ </span>
                          <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                            {log.dueDate}
                          </span>
                        </div>
                        {log.returnDate && (
                          <div className="text-[11px] font-mono text-emerald-600 mt-0.5">
                            បានសង៖ {log.returnDate}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {log.status === 'returned' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>បានសងរួច</span>
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>ហួស {toKhmerNum(overdueDays)} ថ្ងៃ</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3" />
                            <span>កំពុងខ្ចី</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-xs font-bold text-slate-700">
                          អានបាន {toKhmerNum(log.pagesRead || 0)} ទំព័រ
                          {log.rating && (
                            <span className="ml-1.5 text-amber-500">
                              {'★'.repeat(log.rating)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                          {log.summaryOrImpression || log.readingSummary || '-'}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {log.status !== 'returned' && !isReadOnly && (
                            <button
                              onClick={() => handleOpenReturnModal(log)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                              title="ទទួលសៀវភៅសង"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>ទទួលសង</span>
                            </button>
                          )}

                          {!isReadOnly && (
                            <button
                              onClick={() => deleteReadingLog(log.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              title="លុបកំណត់ត្រា"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Return Modal */}
      {selectedLogForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-emerald-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                <h3 className="font-moul text-sm sm:text-base">កត់ត្រាការសងសៀវភៅបណ្ណាល័យ</h3>
              </div>
              <button
                onClick={() => setSelectedLogForReturn(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-5 space-y-4 font-battambang text-xs sm:text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">
                  សិស្ស៖ <span className="text-blue-900 font-moul text-xs">{selectedLogForReturn.studentNameKhmer}</span> ({selectedLogForReturn.studentCode})
                </p>
                <p className="text-slate-600">
                  សៀវភៅ៖ <span className="font-bold text-slate-800">{selectedLogForReturn.bookTitle}</span>
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  កាលបរិច្ឆេទខ្ចី៖ {selectedLogForReturn.borrowDate} • ថ្ងៃត្រូវសង៖ {selectedLogForReturn.dueDate}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ថ្ងៃសងជាក់ស្តែង</label>
                  <input
                    type="date"
                    value={returnFormData.returnDate}
                    onChange={e => setReturnFormData({ ...returnFormData, returnDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ចំនួនទំព័រអានបាន</label>
                  <input
                    type="number"
                    min="1"
                    value={returnFormData.pagesRead}
                    onChange={e => setReturnFormData({ ...returnFormData, pagesRead: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ស្ថានភាពសៀវភៅពេលសង</label>
                  <select
                    value={returnFormData.conditionOnReturn}
                    onChange={e => setReturnFormData({ ...returnFormData, conditionOnReturn: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="good">✨ គង់វង្សល្អ</option>
                    <option value="damaged">⚠️ មានការរហែក/ខូចខាត</option>
                    <option value="lost">❌ បាត់បង់</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ការពេញចិត្តរបស់សិស្ស</label>
                  <select
                    value={returnFormData.rating}
                    onChange={e => setReturnFormData({ ...returnFormData, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (ល្អឥតខ្ចោះ)</option>
                    <option value={4}>⭐⭐⭐⭐ (ល្អណាស់)</option>
                    <option value={3}>⭐⭐⭐ (ល្អបង្គួរ)</option>
                    <option value={2}>⭐⭐ (មធ្យម)</option>
                    <option value={1}>⭐ (មិនសូវចូលចិត្ត)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ចំណាប់អារម្មណ៍ ឬសេចក្តីសង្ខេបខ្លឹមសារ</label>
                <textarea
                  rows={3}
                  placeholder="សិស្សបានសង្ខេបខ្លឹមសារ ឬរៀបរាប់អំពីចំណុចល្អ និងការអប់រំដែលទទួលបាន..."
                  value={returnFormData.summaryOrImpression}
                  onChange={e => setReturnFormData({ ...returnFormData, summaryOrImpression: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedLogForReturn(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>បញ្ជាក់ការទទួលសង</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
