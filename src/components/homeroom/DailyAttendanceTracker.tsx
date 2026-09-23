import React, { useState } from 'react';
import { Student, DailyAttendanceRecord } from '../../types';
import {
  Calendar,
  CheckCircle2,
  Save
} from 'lucide-react';

interface DailyAttendanceTrackerProps {
  students: Student[];
  selectedGrade: number;
  selectedSection: string;
  attendanceRecords: DailyAttendanceRecord[];
  onRecordAttendance: (record: Omit<DailyAttendanceRecord, 'id'>) => void;
  onBatchRecordAttendance: (records: Array<Omit<DailyAttendanceRecord, 'id'>>) => void;
}

export const DailyAttendanceTracker: React.FC<DailyAttendanceTrackerProps> = ({
  students,
  selectedGrade,
  selectedSection,
  attendanceRecords,
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

  // Existing attendance records
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

  const getStudentStatus = (studentId: string): 'present' | 'permission' | 'absent' => {
    if (localStatuses[studentId]) return localStatuses[studentId];
    const rec = existingRecords.find(r => r.studentId === studentId);
    return rec?.status || 'present'; // default present if not explicitly saved before
  };

  const handleStatusChange = (studentId: string, status: 'present' | 'permission' | 'absent') => {
    setLocalStatuses(prev => ({ ...prev, [studentId]: status }));
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
      notes: '' // Skipping notes to keep mobile UI clean and fast
    }));

    onBatchRecordAttendance(recordsToSave);
    alert('រក្សាទុកទិន្នន័យដោយជោគជ័យ! (Saved locally)');
  };

  // Stats calculation
  const presentCount = classStudents.filter(s => getStudentStatus(s.id) === 'present').length;
  const permissionCount = classStudents.filter(s => getStudentStatus(s.id) === 'permission').length;
  const absentCount = classStudents.filter(s => getStudentStatus(s.id) === 'absent').length;

  return (
    <div className="bg-[#07191d] min-h-screen text-slate-100 p-3 sm:p-5 md:p-8 font-sans pb-28 relative">
      
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header Controller */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            📅 ស្រង់អវត្តមានសិស្ស
          </h2>
          <p className="text-emerald-400 font-medium text-sm">
            ថ្នាក់ទី{selectedGrade}{selectedSection} ({classStudents.length} នាក់)
          </p>
        </div>

        {/* Date & Session Picker Card */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto bg-[#0a2328] border border-[#164049] rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex bg-[#0a2328] border border-[#164049] rounded-xl p-1 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setSession('morning')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  session === 'morning' ? 'bg-[#0d3b45] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ព្រឹក
              </button>
              <button
                onClick={() => setSession('afternoon')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  session === 'afternoon' ? 'bg-[#0d3b45] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                រសៀល
              </button>
            </div>
          </div>
          
          <button
            onClick={handleMarkAllPresent}
            className="w-full md:w-auto px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>វត្តមានទាំងអស់ (✓)</span>
          </button>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-emerald-300/70 mb-1">វត្តមាន</p>
            <p className="text-xl font-bold text-emerald-400">{presentCount}</p>
          </div>
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-amber-300/70 mb-1">ច្បាប់ (P)</p>
            <p className="text-xl font-bold text-amber-400">{permissionCount}</p>
          </div>
          <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-rose-300/70 mb-1">អវត្តមាន (A)</p>
            <p className="text-xl font-bold text-rose-400">{absentCount}</p>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3 pb-8">
          {classStudents.map((s, idx) => {
            const currentStatus = getStudentStatus(s.id);
            return (
              <div key={s.id} className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                {/* Info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0a2328] border border-[#164049] flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-base">{s.nameKhmer}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        s.gender === 'female' ? 'bg-pink-900/30 text-pink-400 border border-pink-800/50' : 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                      }`}>
                        {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500">{s.code}</p>
                  </div>
                </div>

                {/* Touch-Friendly Action Buttons */}
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto h-11">
                  <button
                    onClick={() => handleStatusChange(s.id, 'present')}
                    className={`h-full px-2 sm:px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-[#0a2328] text-slate-500 border border-[#164049] hover:bg-[#0f353d]'
                    }`}
                  >
                    មក
                  </button>
                  <button
                    onClick={() => handleStatusChange(s.id, 'permission')}
                    className={`h-full px-2 sm:px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                      currentStatus === 'permission'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-[#0a2328] text-slate-500 border border-[#164049] hover:bg-[#0f353d]'
                    }`}
                  >
                    ច្បាប់
                  </button>
                  <button
                    onClick={() => handleStatusChange(s.id, 'absent')}
                    className={`h-full px-2 sm:px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                      currentStatus === 'absent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.2)]'
                        : 'bg-[#0a2328] text-slate-500 border border-[#164049] hover:bg-[#0f353d]'
                    }`}
                  >
                    អវត្តមាន
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#07191d]/90 backdrop-blur-xl border-t border-[#164049] p-4 lg:pl-[280px] z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 w-full sm:w-auto text-center sm:text-left">
            វត្តមាន: {presentCount} | ច្បាប់: {permissionCount} | អវត្តមាន: {absentCount}
          </p>
          <button
            onClick={handleSaveAttendance}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 sm:py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            <Save className="w-5 h-5" />
            <span>រក្សាទុកទិន្នន័យ</span>
          </button>
        </div>
      </div>

    </div>
  );
};
