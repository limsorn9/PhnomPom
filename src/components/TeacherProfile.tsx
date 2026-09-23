import React, { useState } from 'react';
import { User, Upload, RotateCcw, Check, Lock } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export const TeacherProfile: React.FC = () => {
  const { currentTeacher, selectedGrade, selectedSection } = useSchool();
  
  const [khmerGrades, setKhmerGrades] = useState([
    { label: 'ល្អ', min: 80, range: '80 ដល់ 100', disabled: false },
    { label: 'ល្អបង្គួរ', min: 65, range: '65 ដល់ 79.99', disabled: false },
    { label: 'មធ្យម', min: 50, range: '50 ដល់ 64.99', disabled: false },
    { label: 'ខ្សោយ', min: 0, range: '0 ដល់ 49.99', disabled: true },
  ]);

  const [englishGrades, setEnglishGrades] = useState([
    { label: 'A', min: 90, range: '90 ដល់ 100', disabled: false },
    { label: 'B', min: 80, range: '80 ដល់ 89.99', disabled: false },
    { label: 'C', min: 70, range: '70 ដល់ 79.99', disabled: false },
    { label: 'D', min: 60, range: '60 ដល់ 69.99', disabled: false },
    { label: 'E', min: 50, range: '50 ដល់ 59.99', disabled: false },
    { label: 'F', min: 0, range: '0 ដល់ 49.99', disabled: true },
  ]);

  const handleKhmerGradeChange = (index: number, value: number) => {
    const newGrades = [...khmerGrades];
    newGrades[index].min = value;
    setKhmerGrades(newGrades);
  };

  const handleEnglishGradeChange = (index: number, value: number) => {
    const newGrades = [...englishGrades];
    newGrades[index].min = value;
    setEnglishGrades(newGrades);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('kroudigital_khmer_grades', JSON.stringify(khmerGrades));
    localStorage.setItem('kroudigital_english_grades', JSON.stringify(englishGrades));
    alert('រក្សាទុកជោគជ័យ!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* ព័ត៌មានគណនីគ្រូ (Top Section) */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">ព័ត៌មានគណនីគ្រូ</h2>
        <p className="text-slate-400 text-sm">គ្រប់គ្រងប្រវត្តិរូប និងហត្ថលេខាឌីជីថល</p>
      </div>

      <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 md:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Avatar & Signature */}
          <div className="flex flex-col items-center gap-6 md:w-1/3 shrink-0">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-[#07191d] rounded-full border-4 border-[#164049] flex items-center justify-center overflow-hidden mb-3">
                <User className="w-12 h-12 text-slate-500" />
              </div>
              <button className="px-4 py-2 bg-[#164049] hover:bg-[#1c505b] text-slate-200 rounded-lg text-sm transition flex items-center gap-2">
                <Upload className="w-4 h-4" />
                ប្ដូររូបថត
              </button>
            </div>
            
            <div className="w-full h-px bg-[#164049]"></div>
            
            <div className="flex flex-col items-center w-full">
              <p className="text-slate-300 text-sm font-bold mb-3">ហត្ថលេខាឌីជីថល</p>
              <div className="w-full h-24 bg-white/5 border-2 border-dashed border-[#164049] rounded-xl flex items-center justify-center mb-3">
                <span className="text-slate-500 text-xs">មិនទាន់មានហត្ថលេខា</span>
              </div>
              <button className="px-4 py-2 bg-[#164049] hover:bg-[#1c505b] text-slate-200 rounded-lg text-sm transition flex items-center gap-2">
                <Upload className="w-4 h-4" />
                បញ្ចូលហត្ថលេខា
              </button>
              <p className="text-slate-500 text-[10px] mt-2 text-center leading-relaxed">សម្រាប់ប្រើក្នុងរបាយការណ៍បោះពុម្ពស្វ័យប្រវត្តិ</p>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 space-y-6">
            <h3 className="text-lg font-bold text-emerald-400 border-b border-[#164049] pb-2">ព័ត៌មានទូទៅ</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">ឈ្មោះពេញ (ខ្មែរ)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0a2126] border border-[#164049] text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-400"
                  value={currentTeacher?.nameKhmer || 'លោក លីម សន'}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">ឈ្មោះពេញ (ឡាតាំង)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0a2126] border border-[#164049] text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-400"
                  value={currentTeacher?.nameLatin || 'Lim Sorn'}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">ភេទ</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0a2126] border border-[#164049] text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-400"
                  value="ប្រុស"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">អត្តលេខមន្ត្រី (Staff ID)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0a2126] border border-[#164049] text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-400"
                  value={currentTeacher?.staffCode || 'MOEYS-001'}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">មុខវិជ្ជាឯកទេស</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0a2126] border border-[#164049] text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-400"
                  value={currentTeacher?.qualification || 'គ្រូបង្រៀនកម្រិតបឋម'}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">ថ្នាក់បន្ទុកបច្ចុប្បន្ន</label>
                <input 
                  type="text" 
                  className="w-full bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 rounded-xl px-3.5 py-2 text-sm font-bold focus:outline-none focus:border-cyan-400"
                  value={`ថ្នាក់ទី ${selectedGrade}${selectedSection}`}
                  readOnly
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition">
                រក្សាទុកការផ្លាស់ប្តូរ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ប្លុក «ភាគរយនិទ្ទេស» (Grade Thresholds Section) */}
      <div className="mt-8">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">ភាគរយនិទ្ទេស</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-3xl leading-relaxed">
          ភាគរយស្តង់ដារត្រូវប្រើសម្រាប់សាលាទាំងអស់។ សាលា ឬគ្រូអាចកែលេខទាំងនេះតាមតម្រូវការរបស់ខ្លួន។ ការកែនឹងប្រើទាំង លើអេក្រង់ និង លើឯកសារបោះពុម្ព។
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* កាត ១៖ និទ្ទេសខ្មែរ */}
          <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 shadow-xl flex flex-col">
            <h4 className="text-emerald-400 font-bold mb-4">និទ្ទេសខ្មែរ (បួនថ្នាក់ - ស្តង់ដារ)</h4>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 border-b border-[#164049]">
                    <th className="pb-3 font-medium">និទ្ទេស</th>
                    <th className="pb-3 font-medium px-4">ចាប់ពី (%)</th>
                    <th className="pb-3 font-medium text-right">គ្របដណ្ដប់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#164049]/50">
                  {khmerGrades.map((g, idx) => (
                    <tr key={idx} className="hover:bg-[#10323a]/50 transition-colors">
                      <td className="py-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="font-bold text-slate-200">{g.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="number"
                          className="w-20 bg-[#0a2126] border border-[#164049] text-slate-100 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-400 text-center"
                          value={g.min}
                          disabled={g.disabled}
                          onChange={(e) => handleKhmerGradeChange(idx, Number(e.target.value))}
                        />
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {g.range}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#164049]/50">
              <button 
                onClick={() => setKhmerGrades([
                  { label: 'ល្អ', min: 80, range: '80 ដល់ 100', disabled: false },
                  { label: 'ល្អបង្គួរ', min: 65, range: '65 ដល់ 79.99', disabled: false },
                  { label: 'មធ្យម', min: 50, range: '50 ដល់ 64.99', disabled: false },
                  { label: 'ខ្សោយ', min: 0, range: '0 ដល់ 49.99', disabled: true },
                ])}
                className="px-4 py-2 border border-[#164049] text-slate-300 hover:bg-[#164049]/50 hover:text-white rounded-xl text-sm transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                ត្រឡប់ទៅស្តង់ដារ
              </button>
              <button 
                onClick={saveToLocalStorage}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                រក្សាទុក
              </button>
            </div>
          </div>

          {/* កាត ២៖ និទ្ទេសអង់គ្លេស */}
          <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 shadow-xl flex flex-col">
            <h4 className="text-cyan-400 font-bold mb-4">និទ្ទេសអង់គ្លេស (ប្រាំមួយថ្នាក់ - ស្តង់ដារ)</h4>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 border-b border-[#164049]">
                    <th className="pb-3 font-medium">និទ្ទេស</th>
                    <th className="pb-3 font-medium px-4">ចាប់ពី (%)</th>
                    <th className="pb-3 font-medium text-right">គ្របដណ្ដប់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#164049]/50">
                  {englishGrades.map((g, idx) => (
                    <tr key={idx} className="hover:bg-[#10323a]/50 transition-colors">
                      <td className="py-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        <span className="font-bold text-slate-200">{g.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <input 
                          type="number"
                          className="w-20 bg-[#0a2126] border border-[#164049] text-slate-100 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-400 text-center"
                          value={g.min}
                          disabled={g.disabled}
                          onChange={(e) => handleEnglishGradeChange(idx, Number(e.target.value))}
                        />
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {g.range}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#164049]/50">
              <button 
                onClick={() => setEnglishGrades([
                  { label: 'A', min: 90, range: '90 ដល់ 100', disabled: false },
                  { label: 'B', min: 80, range: '80 ដល់ 89.99', disabled: false },
                  { label: 'C', min: 70, range: '70 ដល់ 79.99', disabled: false },
                  { label: 'D', min: 60, range: '60 ដល់ 69.99', disabled: false },
                  { label: 'E', min: 50, range: '50 ដល់ 59.99', disabled: false },
                  { label: 'F', min: 0, range: '0 ដល់ 49.99', disabled: true },
                ])}
                className="px-4 py-2 border border-[#164049] text-slate-300 hover:bg-[#164049]/50 hover:text-white rounded-xl text-sm transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                ត្រឡប់ទៅស្តង់ដារ
              </button>
              <button 
                onClick={saveToLocalStorage}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ៣. ប៊ូតុងបាតក្រោមគេបង្អស់ (Bottom Action) */}
      <div className="flex justify-center mt-12 mb-8 border-t border-[#164049]/40 pt-8">
        <button className="bg-[#0a2328] border border-[#164049] hover:bg-[#0f353d] px-5 py-3 rounded-xl text-sm font-medium text-slate-200 transition flex items-center gap-2 shadow-sm">
          <Lock className="w-4 h-4" />
          ប្ដូរលេខសម្ងាត់ចូលប្រព័ន្ធ ▼
        </button>
      </div>

    </div>
  );
};
