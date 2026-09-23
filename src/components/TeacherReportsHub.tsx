import React, { useState, useEffect } from 'react';
import { getKhmerFullDate, toKhmerNumber } from '../utils/khmerDateHelper';
import { FileText, Filter, Calendar, Users } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function TeacherReportsHub() {
  const { kdTeacherProfile, kdSchoolInfo, kdClassInfo } = useSchool();

  const [selectedClass, setSelectedClass] = useState(kdClassInfo?.currentClass || 'ថ្នាក់ទី១ក');
  const [academicYear, setAcademicYear] = useState(kdClassInfo?.academicYear || '2026-2027');
  const [gradingType, setGradingType] = useState('A-F');
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    if (kdClassInfo) {
      setSelectedClass(kdClassInfo.currentClass);
      setAcademicYear(kdClassInfo.academicYear);
    }
  }, [kdClassInfo]);

  // ប្រើប្រាស់ Helper ដែលមានស្រាប់ ដើម្បីទាញយកថ្ងៃខែជាភាសាខ្មែរ
  const khmerDate = getKhmerFullDate(signatureDate);

  const reportCards = [
    { id: 1, title: 'បញ្ជីអវត្តមាន', icon: <Users className="w-5 h-5 text-cyan-400" /> },
    { id: 2, title: 'ពិន្ទុខែ', icon: <FileText className="w-5 h-5 text-cyan-400" /> },
    { id: 3, title: 'ពិន្ទុឆមាស', icon: <FileText className="w-5 h-5 text-cyan-400" /> },
    { id: 4, title: 'ប្រចាំឆមាស', icon: <Calendar className="w-5 h-5 text-cyan-400" /> },
    { id: 5, title: 'ប្រចាំឆ្នាំ', icon: <Calendar className="w-5 h-5 text-cyan-400" /> },
  ];

  const handleOpenReport = (title: string) => {
    // ទីនេះជាកន្លែងដែលនឹងបើក Modal ឬបញ្ជូនទៅកាន់សន្លឹកបោះពុម្ព
    alert(`កំពុងបើករបាយការណ៍: ${title}\nថ្នាក់: ${selectedClass} | ឆ្នាំសិក្សា: ${academicYear}\nកាលបរិច្ឆេទ: ${khmerDate.solarDate}\nកាលបរិច្ឆេទចន្ទគតិ: ${khmerDate.lunarDate}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-28 p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header / Title */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-cyan-400" />
            Teacher Reports Hub
          </h1>
        </div>

        {/* Header Filter */}
        <div className="bg-slate-800 rounded-xl p-4 md:p-5 border border-slate-700 shadow-lg space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">ជម្រើសទិន្នន័យ (Filters)</h2>
          </div>
          
          {/* Mobile-First: grid-cols-1 md:grid-cols-2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ថ្នាក់ */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">ថ្នាក់</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-[42px] bg-slate-900 border border-slate-600 rounded-lg px-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                <option value="ថ្នាក់ទី១ក">ថ្នាក់ទី១ក</option>
                <option value="ថ្នាក់ទី១ខ">ថ្នាក់ទី១ខ</option>
                <option value="ថ្នាក់ទី២ក">ថ្នាក់ទី២ក</option>
              </select>
            </div>

            {/* ឆ្នាំសិក្សា */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">ឆ្នាំសិក្សា</label>
              <select 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
                className="h-[42px] bg-slate-900 border border-slate-600 rounded-lg px-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>

            {/* និទ្ទេស */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">និទ្ទេស</label>
              <select 
                value={gradingType} 
                onChange={(e) => setGradingType(e.target.value)}
                className="h-[42px] bg-slate-900 border border-slate-600 rounded-lg px-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                <option value="A-F">A-F</option>
                <option value="ខ្មែរ">ខ្មែរ</option>
              </select>
            </div>

            {/* កាលបរិច្ឆេទហត្ថលេខា */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">កាលបរិច្ឆេទហត្ថលេខា</label>
              <input 
                type="date" 
                value={signatureDate}
                onChange={(e) => setSignatureDate(e.target.value)}
                className="h-[42px] bg-slate-900 border border-slate-600 rounded-lg px-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 [color-scheme:dark] transition-colors"
              />
              {/* Preview ថ្ងៃខែខ្មែរ */}
              <p className="text-xs text-slate-400 mt-1 truncate">
                {khmerDate.solarDate}
              </p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {reportCards.map((card) => (
            <div 
              key={card.id} 
              className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-md hover:shadow-lg hover:border-cyan-900 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 group-hover:border-cyan-800 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-lg font-medium text-white">{card.title}</h3>
              </div>
              <button 
                onClick={() => handleOpenReport(card.title)}
                className="w-full h-[42px] bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                បើក
              </button>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
