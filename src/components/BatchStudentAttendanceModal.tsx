import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, DailyAttendanceRecord } from '../types';
import {
  X,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
  Search,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  Save,
  CheckSquare,
  Square,
  Filter
} from 'lucide-react';

interface BatchStudentAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: number;
  defaultSection?: string;
}

export const BatchStudentAttendanceModal: React.FC<BatchStudentAttendanceModalProps> = ({
  isOpen,
  onClose,
  defaultGrade = 1,
  defaultSection = 'ក'
}) => {
  const {
    students,
    teachers,
    classrooms,
    batchRecordAttendance,
    getAttendanceForDateAndClass,
    showToast,
    currentUser
  } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedGrade, setSelectedGrade] = useState<number>(defaultGrade);
  const [selectedSection, setSelectedSection] = useState<string>(defaultSection);
  const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon'>('morning');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selected students for bulk status update
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Filter students for the selected classroom
  const classStudents = useMemo(() => {
    return students.filter(
      s => s.grade === selectedGrade && s.section === selectedSection
    );
  }, [students, selectedGrade, selectedSection]);

  // Existing attendance for the selected date & classroom
  const existingAttendance = useMemo(() => {
    return getAttendanceForDateAndClass(selectedDate, selectedGrade, selectedSection);
  }, [getAttendanceForDateAndClass, selectedDate, selectedGrade, selectedSection]);

  // Local state map for attendance statuses: studentId -> { status: 'present' | 'permission' | 'absent', notes: string }
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: 'present' | 'permission' | 'absent'; notes: string }>
  >({});

  // Initialize or re-populate attendanceMap whenever classStudents or existingAttendance changes
  React.useEffect(() => {
    const map: Record<string, { status: 'present' | 'permission' | 'absent'; notes: string }> = {};
    classStudents.forEach(st => {
      const existing = existingAttendance.find(
        r => r.studentId === st.id && r.session === selectedSession
      );
      if (existing) {
        map[st.id] = { status: existing.status, notes: existing.notes || '' };
      } else {
        // Default to 'present'
        map[st.id] = { status: 'present', notes: '' };
      }
    });
    setAttendanceMap(map);
    setSelectedStudentIds([]);
  }, [classStudents, existingAttendance, selectedSession]);

  if (!isOpen) return null;

  // Search filtered class students
  const filteredClassStudents = classStudents.filter(st => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      st.nameKhmer.toLowerCase().includes(q) ||
      (st.nameLatin && st.nameLatin.toLowerCase().includes(q)) ||
      st.code.toLowerCase().includes(q)
    );
  });

  // Bulk status update handlers
  const handleSetSelectedStatus = (status: 'present' | 'permission' | 'absent') => {
    if (selectedStudentIds.length === 0) {
      showToast('សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់', 'info');
      return;
    }
    setAttendanceMap(prev => {
      const next = { ...prev };
      selectedStudentIds.forEach(id => {
        next[id] = {
          ...next[id],
          status
        };
      });
      return next;
    });
    showToast(`បានកំណត់វត្តមាន «${status === 'present' ? 'វត្តមាន' : status === 'permission' ? 'ច្បាប់' : 'ឥតច្បាប់'}» ជូនសិស្ស ${selectedStudentIds.length} នាក់`);
  };

  const handleSetAllStatus = (status: 'present' | 'permission' | 'absent') => {
    setAttendanceMap(prev => {
      const next = { ...prev };
      classStudents.forEach(st => {
        next[st.id] = {
          ...next[st.id],
          status
        };
      });
      return next;
    });
    showToast(`បានកំណត់ស្ថានភាព «${status === 'present' ? 'វត្តមានទាំងអស់' : status === 'permission' ? 'ច្បាប់ទាំងអស់' : 'ឥតច្បាប់ទាំងអស់'}» (${classStudents.length} នាក់)`);
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredClassStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredClassStudents.map(st => st.id));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleIndividualStatusChange = (
    studentId: string,
    status: 'present' | 'permission' | 'absent'
  ) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleIndividualNoteChange = (studentId: string, notes: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  // Submit all attendance in bulk
  const handleSubmitBatch = async () => {
    if (classStudents.length === 0) {
      showToast('ពុំមានទិន្នន័យសិស្សក្នុងថ្នាក់នេះដើម្បីកត់ត្រាវត្តមានឡើយ', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      const recordsToSave: Array<Omit<DailyAttendanceRecord, 'id'>> = classStudents.map(st => {
        const item = attendanceMap[st.id] || { status: 'present', notes: '' };
        return {
          date: selectedDate,
          grade: selectedGrade,
          section: selectedSection,
          studentId: st.id,
          studentNameKhmer: st.nameKhmer,
          status: item.status,
          session: selectedSession,
          notes: item.notes ? `${item.notes} (កត់ត្រាពេល: ${new Date().toLocaleTimeString('km-KH')})` : undefined
        };
      });

      batchRecordAttendance(recordsToSave);
      showToast(`បានកត់ត្រាវត្តមានថ្នាក់ទី ${selectedGrade}${selectedSection} ចំនួន ${recordsToSave.length} នាក់ និងរក្សាទុកក្នុង Firestore ជោគជ័យ!`);
      onClose();
    } catch (err) {
      console.error('Batch attendance save failed:', err);
      showToast('បរាជ័យក្នុងការកត់ត្រាវត្តមានជាក្រុម', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary statistics
  const attendanceItems = Object.values(attendanceMap) as Array<{ status: 'present' | 'permission' | 'absent'; notes: string }>;
  const presentCount = attendanceItems.filter(a => a.status === 'present').length;
  const permissionCount = attendanceItems.filter(a => a.status === 'permission').length;
  const absentCount = attendanceItems.filter(a => a.status === 'absent').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-kantumruy flex items-center gap-2">
                <span>កត់ត្រាវត្តមានសិស្សជាក្រុម (Batch Attendance Check-in)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-medium border border-emerald-400/30">
                  Bulk 1-Click Update
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                ជ្រើសរើសសិស្សច្រើននាក់ក្នុងពេលតែមួយ និងរក្សាទុកដោយស្វ័យប្រវត្តិក្នង Firestore ជាមួយកាលបរិច្ឆេទ និង Timestamp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          {/* Grade Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              កម្រិតថ្នាក់ (Grade)
            </label>
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map(g => (
                <option key={g} value={g}>
                  ថ្នាក់ទី {g}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              បន្ទប់/កម្រង (Section)
            </label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['ក', 'ខ', 'គ', 'ឃ'].map(s => (
                <option key={s} value={s}>
                  បន្ទប់ {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>កាលបរិច្ឆេទ (Date)</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Session (Morning / Afternoon) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>វេនសិក្សា (Session)</span>
            </label>
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value as 'morning' | 'afternoon')}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">វេនព្រឹក (Morning)</option>
              <option value="afternoon">វេនរសៀល (Afternoon)</option>
            </select>
          </div>
        </div>

        {/* Quick Batch Actions Toolbar & Stats */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">ប្រតិបត្តិការរហ័ស (Quick Bulk Actions):</span>
            <button
              type="button"
              onClick={() => handleSetAllStatus('present')}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>វត្តមានទាំងអស់ (All Present)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetSelectedStatus('present')}
              disabled={selectedStudentIds.length === 0}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
            >
              <span>ដាក់វត្តមាន ({selectedStudentIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetSelectedStatus('permission')}
              disabled={selectedStudentIds.length === 0}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
            >
              <span>ដាក់ច្បាប់ ({selectedStudentIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetSelectedStatus('absent')}
              disabled={selectedStudentIds.length === 0}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
            >
              <span>ដាក់អវត្តមាន ({selectedStudentIds.length})</span>
            </button>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              សរុប៖ {classStudents.length} នាក់
            </span>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
              វត្តមាន៖ {presentCount}
            </span>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
              ច្បាប់៖ {permissionCount}
            </span>
            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md border border-rose-200">
              ឥតច្បាប់៖ {absentCount}
            </span>
          </div>
        </div>

        {/* Student Table & Selection */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                {selectedStudentIds.length === filteredClassStudents.length && filteredClassStudents.length > 0 ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>ដោះការជ្រើសរើសទាំងអស់</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-500" />
                    <span>ជ្រើសរើសទាំងអស់ ({filteredClassStudents.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Student Attendance List */}
          {filteredClassStudents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              ពុំមានទិន្នន័យសិស្សក្នុងថ្នាក់ទី {selectedGrade}{selectedSection} ឡើយ
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedStudentIds.length === filteredClassStudents.length &&
                          filteredClassStudents.length > 0
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-3 w-12 text-center">ល.រ</th>
                    <th className="p-3">អត្តលេខ</th>
                    <th className="p-3">គោត្តនាម និងនាមសិស្ស</th>
                    <th className="p-3 text-center">ភេទ</th>
                    <th className="p-3 text-center">ស្ថានភាពវត្តមាន (Status)</th>
                    <th className="p-3">ចំណាំ (Notes)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClassStudents.map((st, idx) => {
                    const isSelected = selectedStudentIds.includes(st.id);
                    const currentStatus = attendanceMap[st.id]?.status || 'present';
                    const currentNotes = attendanceMap[st.id]?.notes || '';

                    return (
                      <tr
                        key={st.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(st.id)}
                            className="rounded text-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-blue-900">{st.code}</td>
                        <td className="p-3 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            {st.photoUrl ? (
                              <img
                                src={st.photoUrl}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover border border-slate-300 shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {st.nameKhmer.charAt(0)}
                              </div>
                            )}
                            <span>{st.nameKhmer}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-slate-600">
                          {st.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleIndividualStatusChange(st.id, 'present')}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              វត្តមាន
                            </button>

                            <button
                              type="button"
                              onClick={() => handleIndividualStatusChange(st.id, 'permission')}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                currentStatus === 'permission'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              ច្បាប់
                            </button>

                            <button
                              type="button"
                              onClick={() => handleIndividualStatusChange(st.id, 'absent')}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              ឥតច្បាប់
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={currentNotes}
                            onChange={e => handleIndividualNoteChange(st.id, e.target.value)}
                            placeholder="បញ្ជាក់មូលហេតុ..."
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              ទិន្នន័យវត្តមាននឹងត្រូវបានធ្វើសមកាលកម្មឡើង Firestore ជាមួយ Timestamp ម៉ោង {new Date().toLocaleTimeString('km-KH')}។
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              បោះបង់ (Cancel)
            </button>

            <button
              type="button"
              id="submit-batch-attendance-btn"
              onClick={handleSubmitBatch}
              disabled={isSubmitting || classStudents.length === 0}
              className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកវត្តមានទាំងអស់ (Batch Timestamp)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
