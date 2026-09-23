import React, { useState } from 'react';
import { Users, UserCircle, BarChart3 } from 'lucide-react';
import { StudentManagement } from './StudentManagement';
import { StudentPortal } from './StudentPortal';
import { StudentStatsAndRoster } from './StudentStatsAndRoster';

export const StudentManagementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'portal' | 'stats'>('students');

  return (
    <div className="min-h-screen bg-[#07191d] flex flex-col font-sans">
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">គ្រប់គ្រងសិស្ស & អាណាព្យាបាល</h1>
              <p className="text-xs text-slate-400">មជ្ឈមណ្ឌលគ្រប់គ្រងព័ត៌មានសិស្ស និងគណនី</p>
            </div>
          </div>

          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-full sm:w-auto overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              បញ្ជីសិស្សានុសិស្ស
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'portal'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              គណនីសិស្ស & អាណាព្យាបាល
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              ស្ថិតិ & បញ្ជីសិស្សបញ្ជូលដោយដៃ
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-slate-50">
        {activeTab === 'students' && <StudentManagement />}
        {activeTab === 'portal' && <StudentPortal />}
        {activeTab === 'stats' && <StudentStatsAndRoster />}
      </div>
    </div>
  );
};
