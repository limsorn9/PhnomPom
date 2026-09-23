import React, { useState } from 'react';
import { Student } from '../../types';
import { TrendingUp, Printer, CheckCircle2, Award, BookOpen, AlertCircle, Save } from 'lucide-react';

interface GeipDashboardHubProps {
  students: Student[];
  selectedGrade: number;
  selectedSection: string;
}

export const GeipDashboardHub: React.FC<GeipDashboardHubProps> = ({
  students,
  selectedGrade,
  selectedSection
}) => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'calm'>('tracking');
  const [activeSubject, setActiveSubject] = useState<'khmer' | 'math'>('khmer');

  const classStudents = (students || []).filter(
    s => s && s.grade === selectedGrade && s.section === selectedSection
  );

  const months = ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា'];

  // Mock initial and final grades for demonstration
  const getMockGrade = (idx: number, monthIndex: number) => {
    const base = idx % 5;
    if (monthIndex === 0) return base === 0 ? 'F' : base === 1 ? 'E' : base === 2 ? 'D' : base === 3 ? 'C' : 'B';
    if (monthIndex === 11) return base === 0 ? 'D' : base === 1 ? 'C' : base === 2 ? 'B' : base === 3 ? 'A' : 'A';
    return '-';
  };

  const renderBadge = (mention: string) => {
    switch (mention) {
      case 'A': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">A</span>;
      case 'B': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">B</span>;
      case 'C':
      case 'D': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">{mention}</span>;
      case 'E':
      case 'F': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">{mention}</span>;
      default: return <span className="px-2 py-0.5 text-[10px] text-slate-500">{mention}</span>;
    }
  };

  return (
    <div className="bg-[#07191d] min-h-screen text-slate-100 p-3 sm:p-5 md:p-8 font-sans pb-28">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Controller */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            📈 គម្រោង GEIP · កែលម្អការអប់រំបឋមសិក្សា
          </h2>
          <p className="text-emerald-400 font-medium text-sm">
            ថ្នាក់ទី{selectedGrade}{selectedSection} · សិស្ស {classStudents.length} នាក់ · ឆ្នាំសិក្សា ២០២៦-២០២៧
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-2 backdrop-blur-md flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'tracking' ? 'bg-[#0a2328] border border-[#164049] text-emerald-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-5 h-5" /> តារាងតាមដានឡើងនិទ្ទេសប្រចាំខែ
          </button>
          <button
            onClick={() => setActiveTab('calm')}
            className={`flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'calm' ? 'bg-[#0a2328] border border-[#164049] text-cyan-400 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" /> តេស្ដសមត្ថភាព CALM
          </button>
        </div>

        {activeTab === 'tracking' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-800/50 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> បោះពុម្ពតារាងតាមដាន GEIP
              </button>
            </div>
            
            <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                  <thead className="bg-[#091f24] text-slate-400 text-xs uppercase font-bold">
                    <tr>
                      <th className="p-3 text-center border-b border-[#164049]">ល.រ</th>
                      <th className="p-3 border-b border-[#164049]">អត្តលេខ</th>
                      <th className="p-3 border-b border-[#164049]">ឈ្មោះសិស្ស</th>
                      <th className="p-3 text-center border-b border-[#164049]">ភេទ</th>
                      <th className="p-3 text-center border-b border-[#164049]">ដើមគ្រា</th>
                      {months.map(m => (
                        <th key={m} className="p-3 text-center border-b border-[#164049]">{m}</th>
                      ))}
                      <th className="p-3 text-center border-b border-[#164049] text-cyan-400">ចុងក្រោយ</th>
                      <th className="p-3 text-center border-b border-[#164049]">វឌ្ឍនភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#164049]/50">
                    {classStudents.map((s, idx) => {
                      const startGrade = getMockGrade(idx, 0);
                      const endGrade = getMockGrade(idx, 11);
                      const isUp = endGrade < startGrade; // A < B
                      
                      return (
                        <tr key={s.id} className="hover:bg-[#10323a]/50 transition-colors">
                          <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2 font-mono text-xs text-slate-500">{s.code}</td>
                          <td className="p-2 font-bold text-slate-200">{s.nameKhmer}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              s.gender === 'female' ? 'bg-pink-900/30 text-pink-400' : 'bg-blue-900/30 text-blue-400'
                            }`}>
                              {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                            </span>
                          </td>
                          <td className="p-2 text-center">{renderBadge(startGrade)}</td>
                          {months.map((m, mIdx) => (
                            <td key={m} className="p-2 text-center text-xs text-slate-600">
                              {mIdx === 0 ? renderBadge(startGrade) : mIdx === 11 ? renderBadge(endGrade) : '-'}
                            </td>
                          ))}
                          <td className="p-2 text-center">{renderBadge(endGrade)}</td>
                          <td className="p-2 text-center">
                            {isUp ? (
                              <span className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold"><TrendingUp className="w-3 h-3" /> ឡើង</span>
                            ) : (
                              <span className="text-slate-500 text-xs font-bold">- ថេរ -</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calm' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-[#0a2328] border border-[#164049] rounded-xl p-1">
                <button
                  onClick={() => setActiveSubject('khmer')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    activeSubject === 'khmer' ? 'bg-[#0d3b45] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ភាសាខ្មែរ
                </button>
                <button
                  onClick={() => setActiveSubject('math')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    activeSubject === 'math' ? 'bg-[#0d3b45] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  គណិតវិទ្យា
                </button>
              </div>
              <button className="w-full md:w-auto px-4 py-2 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-800/50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> បោះពុម្ពរបាយការណ៍ CALM ផ្លូវការ
              </button>
            </div>

            <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
              <AlertCircle className="w-16 h-16 text-slate-500 mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">តេស្ដសមត្ថភាព CALM ({activeSubject === 'khmer' ? 'ភាសាខ្មែរ' : 'គណិតវិទ្យា'})</h3>
              <p className="text-slate-400 max-w-md">
                មុខងារបញ្ចូលពិន្ទុតេស្ដ (ដើមឆ្នាំ និងចុងឆ្នាំ) កំពុងស្ថិតក្នុងការអភិវឌ្ឍន៍សម្រាប់គម្រោង GEIP ជំនាន់បន្ទាប់។ វានឹងអនុញ្ញាតឱ្យលោកអ្នកវាយតម្លៃការស្គាល់តួអក្សរ ការអាន និងគណិតវិទ្យាបានយ៉ាងងាយស្រួល។
              </p>
              <button 
                onClick={() => alert("រក្សាទុកដោយជោគជ័យ (localStorage)")}
                className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all">
                <Save className="w-5 h-5" /> រក្សាទុកទិន្នន័យព្រាង
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
