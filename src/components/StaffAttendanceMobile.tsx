import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { LogIn, ExternalLink, CheckCircle, Save, X, Calendar as CalendarIcon, LogOut, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const StaffAttendanceMobile: React.FC = () => {
  const { currentUser, addAttendanceRecords, showToast, language } = useSchool();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showPlpPrompt, setShowPlpPrompt] = useState(false);

  const handleCheckInOut = (status: 'present' | 'late' | 'permission') => {
    if (!currentUser) return;
    
    const recordsToSave = [{
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: selectedDate,
      type: 'staff' as const,
      targetId: currentUser.id,
      status: status,
      recordedBy: currentUser.id,
      timestamp: new Date().toISOString()
    }];
    
    addAttendanceRecords(recordsToSave);
    
    if (showToast) {
      showToast('success', language === 'en' ? 'Attendance logged!' : 'កត់ត្រាវត្តមានជោគជ័យ!');
    }
    
    setShowPlpPrompt(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="bg-white p-4 shadow-sm border-b border-slate-200 space-y-4">
        {/* Header and PLP Button */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              {language === 'en' ? 'My Attendance' : 'វត្តមានផ្ទាល់ខ្លួន'}
            </h2>
          </div>
          
          <a
            href="https://plp-sms.moeys.gov.kh/my-attendance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl shadow-md font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            <ExternalLink className="w-4 h-4" />
            🔗 បន្តចុះវត្តមានលើ PLP-SMS
          </a>
        </div>

        {/* Date Selector */}
        <div className="relative">
          <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center gap-6">
        <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner relative mb-4">
          <Clock className="w-16 h-16 text-indigo-500" />
          <div className="absolute -bottom-2 bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
            {format(new Date(), 'HH:mm')}
          </div>
        </div>
        
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => handleCheckInOut('present')}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <LogIn className="w-6 h-6" />
            {language === 'en' ? 'Check In (On Time)' : 'ចូលបម្រើការងារ (ទាន់ពេល)'}
          </button>
          
          <button
            onClick={() => handleCheckInOut('late')}
            className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <LogOut className="w-6 h-6" />
            {language === 'en' ? 'Check In (Late)' : 'ចូលបម្រើការងារ (យឺត)'}
          </button>
          
          <button
            onClick={() => handleCheckInOut('permission')}
            className="w-full py-4 rounded-2xl bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform mt-6"
          >
            <CheckCircle className="w-6 h-6" />
            {language === 'en' ? 'Request Leave' : 'សុំច្បាប់ឈប់សម្រាក'}
          </button>
        </div>
      </div>

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
                href="https://plp-sms.moeys.gov.kh/my-attendance"
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
