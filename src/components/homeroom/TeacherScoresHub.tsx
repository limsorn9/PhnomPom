import React, { useState, useMemo } from 'react';
import { Student, StudentScoreRecord, MonthlySubjectScores } from '../../types';
import {
  FileSpreadsheet,
  Save,
  Download,
  Filter
} from 'lucide-react';

interface TeacherScoresHubProps {
  students: Student[];
  selectedGrade: number;
  selectedSection: string;
  scores: StudentScoreRecord[];
  onSaveScore: (scoreData: {
    studentId: string;
    monthOrSemester: string;
    academicYear: string;
    scores: MonthlySubjectScores;
    remarks?: string;
  }) => void;
}

export const TeacherScoresHub: React.FC<TeacherScoresHubProps> = ({
  students,
  selectedGrade,
  selectedSection,
  scores,
  onSaveScore
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('មករា');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const months = [
    'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា',
    'ឆមាសទី១', 'ឆមាសទី២', 'ប្រចាំឆ្នាំ'
  ];

  // Class students
  const classStudents = (students || []).filter(
    s => s && s.grade === selectedGrade && s.section === selectedSection
  );

  // Score records for class and month
  const classScores = (scores || []).filter(
    s => s && s.grade === selectedGrade && s.section === selectedSection && s.monthOrSemester === selectedMonth
  );

  // Local draft scores state for smooth editing
  const [localScores, setLocalScores] = useState<Record<string, { khmer: number; math: number; science: number; social: number; pe: number }>>({});

  const getStudentScore = (studentId: string) => {
    if (localScores[studentId]) return localScores[studentId];
    const rec = classScores.find(s => s.studentId === studentId);
    return {
      khmer: rec?.scores?.reading ?? (rec?.scores?.khmerReading ?? 0),
      math: rec?.scores?.mathematics ?? (rec?.scores?.numbers ?? 0),
      science: rec?.scores?.science ?? 0,
      social: rec?.scores?.socialStudies ?? 0,
      pe: rec?.scores?.physicalHealth ?? 0
    };
  };

  const handleScoreChange = (studentId: string, subject: 'khmer' | 'math' | 'science' | 'social' | 'pe', val: string) => {
    // Validate value between 0 and 10
    let parsedVal = parseFloat(val);
    if (isNaN(parsedVal)) parsedVal = 0;
    if (parsedVal > 10) parsedVal = 10;
    if (parsedVal < 0) parsedVal = 0;

    const current = getStudentScore(studentId);
    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        ...current,
        [subject]: parsedVal
      }
    }));
  };

  const handleSaveAll = () => {
    classStudents.forEach(s => {
      const current = getStudentScore(s.id);
      onSaveScore({
        studentId: s.id,
        monthOrSemester: selectedMonth,
        academicYear: '២០២៤ - ២០២៥',
        scores: {
          khmerReading: current.khmer,
          reading: current.khmer,
          mathematics: current.math,
          numbers: current.math,
          science: current.science,
          socialStudies: current.social,
          physicalHealth: current.pe
        }
      });
    });
    alert('រក្សាទុកទិន្នន័យដោយជោគជ័យ! (Saved locally)');
  };

  // Compute calculated table with rankings
  const studentRows = useMemo(() => {
    return classStudents.filter(Boolean).map(s => {
      const current = getStudentScore(s.id);
      const total = current.khmer + current.math + current.science + current.social + current.pe;
      const average = parseFloat((total / 5).toFixed(2));
      const mention = average >= 9 ? 'A' : average >= 8 ? 'B' : average >= 7 ? 'C' : average >= 6 ? 'D' : average >= 5 ? 'E' : 'F';
      return {
        student: s,
        scores: current,
        total,
        average,
        mention
      };
    }).sort((a, b) => b.average - a.average).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [classStudents, localScores, classScores]);

  // Statistics
  const totalStudents = classStudents.length;
  const totalEntered = studentRows.filter(r => r.total > 0).length; // naive check
  const classAvg = totalStudents > 0 ? (studentRows.reduce((acc, row) => acc + row.average, 0) / totalStudents).toFixed(2) : '0.00';
  
  const gradeCount = {
    A: studentRows.filter(r => r.mention === 'A').length,
    B: studentRows.filter(r => r.mention === 'B').length,
    CD: studentRows.filter(r => r.mention === 'C' || r.mention === 'D').length,
    EF: studentRows.filter(r => r.mention === 'E' || r.mention === 'F').length,
  };

  return (
    <div className="bg-[#07191d] min-h-screen text-slate-100 p-3 sm:p-5 md:p-8 font-sans pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Controller */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            📝 ស្រង់ពិន្ទុសិស្សប្រចាំខែ និងឆមាស
          </h2>
          <p className="text-emerald-400 font-medium text-sm">
            ថ្នាក់ទី{selectedGrade}{selectedSection} ({totalStudents} នាក់)
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            <span className="text-sm font-medium text-slate-400 whitespace-nowrap">ជ្រើសរើសខែ៖</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-[#0a2328] border border-[#164049] rounded-xl px-4 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[120px]"
            >
              {months.map(m => (
                <option key={m} value={m}>{m.includes('ឆមាស') || m.includes('ប្រចាំឆ្នាំ') ? m : `ខែ ${m}`}</option>
              ))}
            </select>
            
            <button className="bg-[#0a2328] border border-[#164049] rounded-xl px-4 py-2 text-sm font-bold text-slate-300 hover:bg-[#0f353d] transition-colors whitespace-nowrap flex items-center gap-2">
              <Filter className="w-4 h-4" /> លាក់មុខវិជ្ជា
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="w-full md:w-auto px-4 py-2.5 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-800/50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              <span>នាំចូល Excel PLP</span>
            </button>
          </div>
        </div>

        {/* Interactive Score Sheet Table */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl shadow-xl overflow-hidden flex flex-col backdrop-blur-md">
          <div className="p-4 bg-[#0a2328]/80 border-b border-[#164049]/80 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
              <span>តារាងបញ្ចូលពិន្ទុខែ {selectedMonth}</span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse min-w-[900px]">
              <thead className="bg-[#091f24] text-slate-400 text-xs uppercase font-bold">
                <tr>
                  <th className="p-3 text-center w-12 border-b border-[#164049]">ល.រ</th>
                  <th className="p-3 border-b border-[#164049]">អត្តលេខ</th>
                  <th className="p-3 border-b border-[#164049]">គោត្តនាម-នាម</th>
                  <th className="p-3 text-center border-b border-[#164049]">ភេទ</th>
                  <th className="p-3 text-center border-b border-[#164049]">ខ្មែរ (10)</th>
                  <th className="p-3 text-center border-b border-[#164049]">គណិត (10)</th>
                  <th className="p-3 text-center border-b border-[#164049]">វិទ្យា (10)</th>
                  <th className="p-3 text-center border-b border-[#164049]">សង្គម (10)</th>
                  <th className="p-3 text-center border-b border-[#164049]">អប់រំកាយ (10)</th>
                  <th className="p-3 text-center font-bold text-cyan-400 border-b border-[#164049]">សរុប (50)</th>
                  <th className="p-3 text-center font-bold text-cyan-400 border-b border-[#164049]">មធ្យមភាគ</th>
                  <th className="p-3 text-center border-b border-[#164049]">ចំណាត់ថ្នាក់</th>
                  <th className="p-3 text-center border-b border-[#164049]">និទ្ទេស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#164049]/50">
                {studentRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-slate-500">
                      មិនមានសិស្សក្នុងថ្នាក់នេះទេ
                    </td>
                  </tr>
                ) : (
                  studentRows.map(row => {
                    const s = row.student;
                    return (
                      <tr key={s.id} className="hover:bg-[#10323a]/50 transition-colors">
                        <td className="p-2 text-center text-slate-400 font-bold">{row.rank}</td>
                        <td className="p-2 font-mono text-xs text-slate-500">{s.code}</td>
                        <td className="p-2 font-bold text-slate-200">{s.nameKhmer}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            s.gender === 'female' ? 'bg-pink-900/30 text-pink-400' : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>
                        
                        {(['khmer', 'math', 'science', 'social', 'pe'] as const).map(sub => (
                          <td key={sub} className="p-1.5 text-center">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="10"
                              value={row.scores[sub] || ''}
                              onChange={e => handleScoreChange(s.id, sub, e.target.value)}
                              className="w-14 h-10 text-center bg-[#07191d] border border-[#1a4b56] rounded-lg font-bold text-emerald-400 focus:bg-[#0a2328] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                            />
                          </td>
                        ))}

                        <td className="p-2 text-center font-bold text-slate-300">{row.total.toFixed(1)}</td>
                        <td className="p-2 text-center font-bold text-cyan-400">{row.average.toFixed(2)}</td>
                        <td className="p-2 text-center text-slate-300 font-bold">#{row.rank}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                            row.mention === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                            row.mention === 'B' ? 'bg-blue-500/20 text-blue-400' :
                            row.mention === 'C' ? 'bg-teal-500/20 text-teal-400' :
                            row.mention === 'D' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {row.mention}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar with Summaries */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#07191d]/90 backdrop-blur-xl border-t border-[#164049] p-4 lg:pl-[280px] z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-thin shrink-0">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">បានបញ្ចូល</p>
              <p className="text-sm font-bold text-emerald-400">{totalEntered} / {totalStudents} នាក់</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">មធ្យមភាគថ្នាក់</p>
              <p className="text-sm font-bold text-cyan-400">{classAvg} / 10</p>
            </div>
            <div className="hidden sm:flex gap-3 ml-4">
              <div className="bg-[#0a2328] border border-[#164049] px-3 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 block">និទ្ទេស A (ល្អ)</span>
                <span className="text-sm font-bold text-emerald-400">{gradeCount.A}</span>
              </div>
              <div className="bg-[#0a2328] border border-[#164049] px-3 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 block">និទ្ទេស B</span>
                <span className="text-sm font-bold text-blue-400">{gradeCount.B}</span>
              </div>
              <div className="bg-[#0a2328] border border-[#164049] px-3 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 block">និទ្ទេស C-D</span>
                <span className="text-sm font-bold text-amber-400">{gradeCount.CD}</span>
              </div>
              <div className="bg-[#0a2328] border border-[#164049] px-3 py-1 rounded-lg">
                <span className="text-[10px] text-slate-400 block">និទ្ទេស E-F</span>
                <span className="text-sm font-bold text-rose-400">{gradeCount.EF}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSaveAll}
            className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 md:py-2.5 px-8 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all shrink-0"
          >
            <Save className="w-5 h-5" />
            <span>រក្សាទុកទិន្នន័យ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
