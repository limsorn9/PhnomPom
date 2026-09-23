import React, { useState, useMemo } from 'react';
import { Student, DailyAttendanceRecord } from '../../types';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserX,
  Printer,
  Sparkles,
  Save,
  FileSpreadsheet,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';

interface AttendanceTabProps {
  students: Student[];
  selectedGrade: number;
  selectedSection: string;
  attendanceRecords: DailyAttendanceRecord[];
  onRecordAttendance: (record: Omit<DailyAttendanceRecord, 'id'>) => void;
  onBatchRecordAttendance: (records: Array<Omit<DailyAttendanceRecord, 'id'>>) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  students,
  selectedGrade,
  selectedSection,
  attendanceRecords,
  onRecordAttendance,
  onBatchRecordAttendance
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [session, setSession] = useState<'morning' | 'afternoon'>('morning');

  // Filter students for current class
  const classStudents = (students || []).filter(
    s => s && s.grade === selectedGrade && s.section === selectedSection
  );

  // Existing attendance records for this date, grade, section, session
  const existingRecords = (attendanceRecords || []).filter(
    r =>
      r &&
      r.grade === selectedGrade &&
      r.section === selectedSection &&
      r.date === selectedDate &&
      r.session === session
  );

  // Local state for interactive editing before save
  const [localStatuses, setLocalStatuses] = useState<Record<string, 'present' | 'permission' | 'absent'>>({});
  const [localReasons, setLocalReasons] = useState<Record<string, string>>({});

  const getStudentStatus = (studentId: string): 'present' | 'permission' | 'absent' => {
    if (localStatuses[studentId]) return localStatuses[studentId];
    const rec = existingRecords.find(r => r.studentId === studentId);
    return rec?.status || 'present';
  };

  const getStudentReason = (studentId: string): string => {
    if (localReasons[studentId] !== undefined) return localReasons[studentId];
    const rec = existingRecords.find(r => r.studentId === studentId);
    return rec?.notes || '';
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'permission' | 'absent') => {
    setLocalStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setLocalReasons(prev => ({ ...prev, [studentId]: reason }));
  };

  const handleMarkAllPresent = () => {
    const nextStatuses: Record<string, 'present'> = {};
    classStudents.forEach(s => {
      nextStatuses[s.id] = 'present';
    });
    setLocalStatuses(nextStatuses);
  };

  const handleSaveAttendance = () => {
    const recordsToSave: Array<Omit<DailyAttendanceRecord, 'id'>> = classStudents.map(s => ({
      studentId: s.id,
      studentNameKhmer: s.nameKhmer,
      grade: selectedGrade,
      section: selectedSection,
      date: selectedDate,
      session,
      status: getStudentStatus(s.id),
      notes: getStudentReason(s.id)
    }));

    onBatchRecordAttendance(recordsToSave);
  };

  // Stats calculation
  const presentCount = classStudents.filter(s => getStudentStatus(s.id) === 'present').length;
  const permissionCount = classStudents.filter(s => getStudentStatus(s.id) === 'permission').length;
  const absentCount = classStudents.filter(s => getStudentStatus(s.id) === 'absent').length;

  // Students with high absence rate (>= 3 absences in records)
  const atRiskStudents = useMemo(() => {
    return classStudents.map(s => {
      const studentAbsences = (attendanceRecords || []).filter(r => r.studentId === s.id && r.status === 'absent');
      const studentPermissions = (attendanceRecords || []).filter(r => r.studentId === s.id && r.status === 'permission');
      return {
        student: s,
        absentCount: studentAbsences.length,
        permissionCount: studentPermissions.length,
        totalMissed: studentAbsences.length + studentPermissions.length
      };
    }).filter(item => item.totalMissed >= 3);
  }, [classStudents, attendanceRecords]);

  return (
    <div className="space-y-4">
      {/* Top Bar: Date, Session, 1-Click Present, Save */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">កាលបរិច្ឆេទ៖</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setSession('morning')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                session === 'morning' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600'
              }`}
            >
              វេនព្រឹក
            </button>
            <button
              onClick={() => setSession('afternoon')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                session === 'afternoon' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600'
              }`}
            >
              វេនរសៀល
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>វត្តមានទាំងអស់ (1-Click)</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>រក្សាទុកវត្តមាន</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-emerald-800">វត្តមាន (Present)</p>
            <p className="text-xl font-bold font-times text-emerald-900">{presentCount}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-amber-800">ច្បាប់ (Permission)</p>
            <p className="text-xl font-bold font-times text-amber-900">{permissionCount}</p>
          </div>
          <AlertCircle className="w-6 h-6 text-amber-500 opacity-80" />
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-rose-800">ឥតច្បាប់ (Absent)</p>
            <p className="text-xl font-bold font-times text-rose-900">{absentCount}</p>
          </div>
          <UserX className="w-6 h-6 text-rose-500 opacity-80" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-blue-800">អត្រាវត្តមានសរុប</p>
            <p className="text-xl font-bold font-times text-blue-900">
              {classStudents.length > 0 ? ((presentCount / classStudents.length) * 100).toFixed(0) : 100}%
            </p>
          </div>
          <Clock className="w-6 h-6 text-blue-500 opacity-80" />
        </div>
      </div>

      {/* Main Attendance Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>បញ្ជីស្រង់វត្តមានសិស្សប្រចាំថ្ងៃ ថ្នាក់ទី {selectedGrade} «{selectedSection}»</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-times">
            សិស្សសរុប {classStudents.length} នាក់
          </span>
        </div>

        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="p-3 text-center w-12">ល.រ</th>
                <th className="p-3">អត្តលេខ</th>
                <th className="p-3">គោត្តនាម-នាម</th>
                <th className="p-3 text-center">ភេទ</th>
                <th className="p-3 text-center">ស្ថានភាពវត្តមាន</th>
                <th className="p-3">មូលហេតុ / កំណត់សម្គាល់</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ
                  </td>
                </tr>
              ) : (
                classStudents.map((s, idx) => {
                  const currentStatus = getStudentStatus(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-center font-times text-slate-500 font-bold">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600 font-bold">
                        {s.code}
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {s.nameKhmer}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'present')}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                            }`}
                          >
                            មក
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'permission')}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                              currentStatus === 'permission'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                            }`}
                          >
                            ច្បាប់
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'absent')}
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                            }`}
                          >
                            អវត្តមាន
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="មូលហេតុ (ឧ. ឈឺ, ជាប់ធុរៈគ្រួសារ...)"
                          value={getStudentReason(s.id)}
                          onChange={e => handleReasonChange(s.id, e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (md:hidden) */}
        <div className="md:hidden divide-y divide-slate-100">
          {classStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់នេះទេ
            </div>
          ) : (
            classStudents.map((s, idx) => {
              const currentStatus = getStudentStatus(s.id);
              return (
                <div key={s.id} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-times font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{s.nameKhmer}</h4>
                        <p className="text-[11px] font-mono text-slate-500">{s.code}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                    </span>
                  </div>

                  {/* Quick Attendance Touch Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(s.id, 'present')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <span>មក</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(s.id, 'permission')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentStatus === 'permission'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-amber-50'
                      }`}
                    >
                      <span>ច្បាប់</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(s.id, 'absent')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      <span>អវត្តមាន</span>
                    </button>
                  </div>

                  {/* Note input */}
                  <input
                    type="text"
                    placeholder="មូលហេតុ (ឧ. ឈឺ, ជាប់ធុរៈគ្រួសារ...)"
                    value={getStudentReason(s.id)}
                    onChange={e => handleReasonChange(s.id, e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Early Warning Dropout / Absenteeism Risk Alerts (Shown ONLY when actual students reach 3+ absences) */}
      {atRiskStudents.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            ប្រព័ន្ធផ្ដល់ដំណឹងសិស្សអវត្តមានញឹកញាប់ & ហានិភ័យបោះបង់ការសិក្សា (Early Warning)
          </h4>
          <p className="text-[11px] text-amber-800">
            សិស្សខាងក្រោមមានអវត្តមានលើសពី ៣ ថ្ងៃក្នុងខែនេះ សូមគ្រូបន្ទុកថ្នាក់ទាក់ទងមាតាបិតា ឬចុះសួរសុខទុក្ខដល់ខ្នងផ្ទះ៖
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {atRiskStudents.map(({ student: s, absentCount: aCount, totalMissed }) => (
              <div
                key={s.id}
                className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-xs flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{s.nameKhmer}</span>
                  <span className="text-[10px] text-slate-500 ml-2">({s.code})</span>
                  <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                    អវត្តមានសរុប {totalMissed} ថ្ងៃ (ឥតច្បាប់ {aCount} ថ្ងៃ)
                  </p>
                </div>
                {s.guardianPhone && (
                  <a
                    href={`tel:${s.guardianPhone}`}
                    className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>ទូរស័ព្ទ</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
