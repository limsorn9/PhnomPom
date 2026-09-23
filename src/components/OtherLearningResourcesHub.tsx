import React, { useState } from 'react';
import { Tv, FolderKanban } from 'lucide-react';
import { OtherLearningResources } from './OtherLearningResources';
import { TeachingResourceHub } from './TeachingResourceHub';

export const OtherLearningResourcesHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'moeys' | 'drive'>('moeys');

  return (
    <div className="min-h-screen bg-[#07191d] flex flex-col font-sans">
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Tv className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">បណ្ណាល័យឌីជីថល & MoEYS</h1>
              <p className="text-xs text-slate-400">ធនធានបង្រៀន និងរៀនពីក្រសួងអប់រំ និង Google Drive</p>
            </div>
          </div>

          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-full sm:w-auto overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('moeys')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'moeys'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Tv className="w-4 h-4" />
              ធនធាន MoEYS
            </button>
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'drive'
                  ? 'bg-sky-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              ធនធាន Drive
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#07191d]">
        {activeTab === 'moeys' && <OtherLearningResources />}
        {activeTab === 'drive' && <TeachingResourceHub />}
      </div>
    </div>
  );
};
