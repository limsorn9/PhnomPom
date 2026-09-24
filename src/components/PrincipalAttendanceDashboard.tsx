import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { BarChart3, ExternalLink, Download, Calendar as CalendarIcon, Filter, Users, UserCheck, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export const PrincipalAttendanceDashboard: React.FC = () => {
  const { attendanceRecords, students, teachers, language } = useSchool();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Get records for the selected date
  const todaysRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  const studentRecords = todaysRecords.filter(r => r.type === 'student');
  const staffRecords = todaysRecords.filter(r => r.type === 'staff');

  const presentStudents = studentRecords.filter(r => r.status === 'present').length;
  const totalStudents = students.length;
  const studentPresentRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

  const presentStaff = staffRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const totalStaff = teachers.length;
  const staffPresentRate = totalStaff > 0 ? Math.round((presentStaff / totalStaff) * 100) : 0;

  const handleExport = () => {
    // In a real app, generate CSV here
    alert('Downloading CSV...');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {language === 'en' ? 'School Attendance Overview' : 'ស្ថិតិវត្តមានទូទាំងសាលា'}
            </h2>
            <p className="text-sm text-slate-500">
              {format(new Date(selectedDate), 'EEEE, dd MMM yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <a
            href="https://plp-sms.moeys.gov.kh/teacher-attendance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl shadow-md font-semibold text-sm active:scale-[0.98] transition-transform flex-1 md:flex-none"
          >
            <ExternalLink className="w-4 h-4" />
            🔗 PLP: វត្តមានគ្រូ
          </a>
          
          <div className="relative flex-1 md:flex-none md:w-40">
            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button onClick={handleExport} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors" title="Export Excel">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student Stats Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <Users className="w-5 h-5 text-blue-500" />
              {language === 'en' ? 'Student Attendance' : 'វត្តមានសិស្ស'}
            </div>
            <span className="text-2xl font-black text-slate-800">{studentPresentRate}%</span>
          </div>
          
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${studentPresentRate}%` }} />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Present: <strong className="text-slate-800">{presentStudents}</strong></span>
            <span className="text-slate-500">Total: <strong className="text-slate-800">{totalStudents}</strong></span>
          </div>
        </div>

        {/* Staff Stats Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              {language === 'en' ? 'Staff Attendance' : 'វត្តមានគ្រូ'}
            </div>
            <span className="text-2xl font-black text-slate-800">{staffPresentRate}%</span>
          </div>
          
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${staffPresentRate}%` }} />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Present: <strong className="text-slate-800">{presentStaff}</strong></span>
            <span className="text-slate-500">Total: <strong className="text-slate-800">{totalStaff}</strong></span>
          </div>
        </div>
      </div>
      
      {/* Detail list can be added here in the future */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Filter className="w-8 h-8 text-slate-300" />
        <p>{language === 'en' ? 'Select a class filter to view detailed list' : 'ជ្រើសរើសថ្នាក់ដើម្បីមើលបញ្ជីលម្អិត'}</p>
      </div>
    </div>
  );
};
