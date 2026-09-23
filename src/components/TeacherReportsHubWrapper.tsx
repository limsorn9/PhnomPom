import React, { useState } from 'react';
import { FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { TeacherReportsHub } from './TeacherReportsHub';
import { OfficialDocumentCenter } from './OfficialDocumentCenter';
import { ReportsAndSyncModule } from './ReportsAndSyncModule';

export const TeacherReportsHubWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'documents' | 'plp_sync'>('plp_sync');

  return (
    <div className="min-h-screen bg-[#07191d] flex flex-col font-sans">
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">របាយការណ៍ & ទម្រង់ឯកសារ</h1>
              <p className="text-xs text-slate-400">មជ្ឈមណ្ឌលឯកសារផ្លូវការ និងការបោះពុម្ព</p>
            </div>
          </div>

          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 w-full md:w-auto overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('plp_sync')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'plp_sync'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              របាយការណ៍សិស្ស (PLP)
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              របាយការណ៍ & QR កាត
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Printer className="w-4 h-4" />
              ទម្រង់ឯកសារបោះពុម្ព
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 relative">
        {activeTab === 'plp_sync' && <ReportsAndSyncModule />}
        {activeTab === 'reports' && <TeacherReportsHub />}
        {activeTab === 'documents' && <OfficialDocumentCenter />}
      </div>
    </div>
  );
};
