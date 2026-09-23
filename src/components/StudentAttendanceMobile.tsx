import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Users, ExternalLink, CheckCircle, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export const StudentAttendanceMobile: React.FC = () => {
  const { students, currentUser, addAttendanceRecords, showToast, language } = useSchool();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'present' | 'absent' | 'permission' | 'late'>>({});
  const [showPlpPrompt, setShowPlpPrompt] = useState(false);

  // Get students assigned to this homeroom teacher
  const myStudents = useMemo(() => {
    if (!currentUser || currentUser.role !== 'teacher') return [];
    return students.filter(s => s.homeroomTeacherId === currentUser.id);
  }, [students, currentUser]);

  const handleMarkAllPresent = () => {
    const newAtt: typeof localAttendance = {};
    myStudents.forEach(s => {
      newAtt[s.id] = 'present';
    });
    setLocalAttendance(newAtt);
  };

  const handleSave = () => {
    if (Object.keys(localAttendance).length === 0) return;
    
    const recordsToSave = Object.entries(localAttendance).map(([studentId, status]) => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: selectedDate,
      type: 'student' as const,
      targetId: studentId,
      classId: myStudents.find(s => s.id === studentId)?.classId || '',
      status: status,
      recordedBy: currentUser?.id || 'unknown',
      timestamp: new Date().toISOString()
    }));
    
    addAttendanceRecords(recordsToSave);
    
    if (showToast) {
      showToast('success', language === 'en' ? 'Attendance saved successfully!' : 'រក្សាទុកវត្តមានជោគជ័យ!');
    }
    
    setShowPlpPrompt(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans pb-20">
      <div className="bg-white p-4 shadow-sm border-b border-slate-200 sticky top-0 z-10 space-y-4">
        {/* Header and PLP Button */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {language === 'en' ? 'Student Attendance' : 'វត្តមានសិស្ស'}
            </h2>
          </div>
          
          <a
            href="https://plp-sms.moeys.gov.kh/student-attendance-view"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl shadow-md font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            <ExternalLink className="w-4 h-4" />
            🔗 បន្តចុះវត្តមានលើ PLP-SMS
          </a>
        </div>

        {/* Date and Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold active:bg-emerald-200 whitespace-nowrap"
          >
            <CheckCircle className="w-4 h-4" />
            {language === 'en' ? 'All Present' : 'វត្តមានទាំងអស់'}
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {myStudents.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            {language === 'en' ? 'No students assigned to you.' : 'មិនមានសិស្សក្នុងបន្ទុករបស់អ្នកទេ។'}
          </div>
        ) : (
          myStudents.map(student => {
            const status = localAttendance[student.id];
            
            return (
              <div key={student.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {student.khmerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{student.khmerName}</h3>
                    <p className="text-xs text-slate-500 truncate">{student.latinName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLocalAttendance(prev => ({...prev, [student.id]: 'present'}))}
                    className={`py-2 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
                      status === 'present' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    P 🟢
                  </button>
                  <button
                    onClick={() => setLocalAttendance(prev => ({...prev, [student.id]: 'permission'}))}
                    className={`py-2 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
                      status === 'permission' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    P/A 🟡
                  </button>
                  <button
                    onClick={() => setLocalAttendance(prev => ({...prev, [student.id]: 'absent'}))}
                    className={`py-2 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${
                      status === 'absent' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    A 🔴
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Save Button */}
      {Object.keys(localAttendance).length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 pointer-events-none flex justify-center z-20">
          <button
            onClick={handleSave}
            className="pointer-events-auto flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl font-bold hover:scale-105 active:scale-95 transition-all"
          >
            <Save className="w-5 h-5" />
            {language === 'en' ? 'Save Attendance' : 'រក្សាទុកវត្តមាន'}
          </button>
        </div>
      )}

      {/* PLP Prompt Modal */}
      {showPlpPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <button onClick={() => setShowPlpPrompt(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-800">រក្សាទុកក្នុងប្រព័ន្ធជោគជ័យ!</h3>
              <p className="text-sm text-slate-600 mt-1">
                តើលោកគ្រូ/អ្នកគ្រូចង់ទៅកត់ត្រាលើ PLP-SMS បន្តដែរឬទេ?
              </p>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <a
                href="https://plp-sms.moeys.gov.kh/student-attendance-view"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPlpPrompt(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold active:bg-blue-700"
              >
                ទៅកាន់ PLP ឥឡូវនេះ
              </a>
              <button
                onClick={() => setShowPlpPrompt(false)}
                className="py-3 font-bold text-slate-500 active:bg-slate-100 rounded-xl"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
