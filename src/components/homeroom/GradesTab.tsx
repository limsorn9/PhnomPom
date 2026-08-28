import React, { useState } from 'react';
import { Student, StudentScoreRecord, MonthlySubjectScores } from '../../types';
import {
  Award,
  Save,
  Printer,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Share2,
  Eye,
  EyeOff,
  Filter,
  FileSpreadsheet
} from 'lucide-react';

interface GradesTabProps {
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
  isResultReleased: (grade: number, section: string, month: string) => boolean;
  onToggleRelease: (grade: number, section: string, month: string) => void;
  onPrintScoreSheet: () => void;
}

export const GradesTab: React.FC<GradesTabProps> = ({
  students,
  selectedGrade,
  selectedSection,
  scores,
  onSaveScore,
  isResultReleased,
  onToggleRelease,
  onPrintScoreSheet
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('មករា');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const months = [
    'តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
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
      khmer: rec?.scores?.reading ?? (rec?.scores?.khmerReading ?? 7.5),
      math: rec?.scores?.mathematics ?? (rec?.scores?.numbers ?? 8.0),
      science: rec?.scores?.science ?? 7.0,
      social: rec?.scores?.socialStudies ?? 8.5,
      pe: rec?.scores?.physicalHealth ?? 9.0
    };
  };

  const handleScoreChange = (studentId: string, subject: 'khmer' | 'math' | 'science' | 'social' | 'pe', val: number) => {
    const current = getStudentScore(studentId);
    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        ...current,
        [subject]: Math.min(10, Math.max(0, val))
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
        },
        remarks: 'ការសិក្សាមានការរីកចម្រើនល្អ'
      });
    });
    setIsEditing(false);
  };

  // Compute calculated table with rankings
  const studentRows = classStudents
    .filter(Boolean)
    .map(s => {
      const current = getStudentScore(s.id);
      const total = current.khmer + current.math + current.science + current.social + current.pe;
      const average = parseFloat((total / 5).toFixed(2));
      return {
        student: s,
        scores: current,
        total,
        average
      };
    });

  // Sort descending by average to compute ranks
  studentRows.sort((a, b) => b.average - a.average);
  const rankedRows = studentRows.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

  const released = isResultReleased(selectedGrade, selectedSection, selectedMonth);

  // Top 3 students
  const topStudents = rankedRows.filter(r => r && r.student).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Top action header: Month selector, Release toggle, Edit/Save, Print */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">ជ្រើសរើសខែ/ការប្រឡង៖</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map(m => (
                <option key={m} value={m}>
                  ខែ {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onToggleRelease(selectedGrade, selectedSection, selectedMonth)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              released
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            {released ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{released ? 'បានផ្សព្វផ្សាយទៅ Student Portal (On)' : 'មិនទាន់ផ្សព្វផ្សាយ (Off)'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <button
              onClick={handleSaveAll}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>រក្សាទុកពិន្ទុ</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>កែសម្រួលពិន្ទុ (Edit Grades)</span>
            </button>
          )}

          <button
            onClick={onPrintScoreSheet}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>បោះពុម្ពតារាងពិន្ទុ</span>
          </button>
        </div>
      </div>

      {/* Honor Roll Top 3 Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {topStudents.map((s, idx) => {
          const colors = [
            'from-amber-500/10 to-yellow-500/20 border-amber-300 text-amber-900',
            'from-slate-400/10 to-slate-500/20 border-slate-300 text-slate-800',
            'from-orange-500/10 to-amber-700/20 border-orange-300 text-orange-900'
          ];
          const medals = ['🥇 លេខ ១ (កិត្តិយស)', '🥈 លេខ ២', '🥉 លេខ ៣'];

          return (
            <div
              key={s.student.id}
              className={`bg-gradient-to-br ${colors[idx]} p-3.5 rounded-xl border flex items-center justify-between shadow-xs`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  {medals[idx]}
                </span>
                <h4 className="font-bold text-sm mt-0.5">{s.student.nameKhmer}</h4>
                <p className="text-xs font-times font-bold mt-0.5">
                  មធ្យមភាគ៖ <span className="text-blue-700 text-sm">{s.average.toFixed(2)}</span>/10
                </p>
              </div>
              <Award className="w-8 h-8 opacity-80" />
            </div>
          );
        })}
      </div>

      {/* Main Score Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ {selectedMonth} ថ្នាក់ទី {selectedGrade} «{selectedSection}»</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-times">
            ពិន្ទុមធ្យមភាគថ្នាក់៖ {(studentRows.reduce((a, b) => a + b.average, 0) / (studentRows.length || 1)).toFixed(2)}/10
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="p-2.5 text-center w-12 border-b border-slate-200">ចំណាត់ថ្នាក់</th>
                <th className="p-2.5 border-b border-slate-200">អត្តលេខ</th>
                <th className="p-2.5 border-b border-slate-200">គោត្តនាម-នាម</th>
                <th className="p-2.5 text-center border-b border-slate-200">ភេទ</th>
                <th className="p-2.5 text-center border-b border-slate-200">ភាសាខ្មែរ (10)</th>
                <th className="p-2.5 text-center border-b border-slate-200">គណិតវិទ្យា (10)</th>
                <th className="p-2.5 text-center border-b border-slate-200">វិទ្យាសាស្ត្រ (10)</th>
                <th className="p-2.5 text-center border-b border-slate-200">សិក្សាសង្គម (10)</th>
                <th className="p-2.5 text-center border-b border-slate-200">អប់រំកាយ (10)</th>
                <th className="p-2.5 text-center font-bold text-blue-900 border-b border-slate-200">សរុប (50)</th>
                <th className="p-2.5 text-center font-bold text-blue-900 border-b border-slate-200">មធ្យមភាគ (10)</th>
                <th className="p-2.5 text-center border-b border-slate-200">និទ្ទេស</th>
                <th className="p-2.5 text-center border-b border-slate-200">លទ្ធផល</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedRows.map(row => {
                const s = row.student;
                const mention = row.average >= 9 ? 'A' : row.average >= 8 ? 'B' : row.average >= 7 ? 'C' : row.average >= 6 ? 'D' : row.average >= 5 ? 'E' : 'F';
                const pass = row.average >= 5.0;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center font-times font-bold text-slate-700">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        row.rank === 1 ? 'bg-amber-100 text-amber-800 font-bold' :
                        row.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        row.rank === 3 ? 'bg-orange-100 text-orange-800' : 'text-slate-600'
                      }`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-500 font-bold">{s.code}</td>
                    <td className="p-2.5 font-bold text-slate-800">{s.nameKhmer}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        s.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                      </span>
                    </td>

                    {/* Subject Score Inputs or Values */}
                    {(['khmer', 'math', 'science', 'social', 'pe'] as const).map(sub => (
                      <td key={sub} className="p-2.5 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={row.scores[sub]}
                            onChange={e => handleScoreChange(s.id, sub, parseFloat(e.target.value) || 0)}
                            className="w-14 text-center py-1 bg-blue-50/50 border border-blue-200 rounded font-times font-bold text-blue-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="font-times font-semibold text-slate-700">
                            {row.scores[sub].toFixed(1)}
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="p-2.5 text-center font-times font-bold text-slate-800">
                      {row.total.toFixed(1)}
                    </td>
                    <td className="p-2.5 text-center font-times font-bold text-blue-700 text-xs">
                      {row.average.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mention === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        mention === 'B' ? 'bg-blue-100 text-blue-800' :
                        mention === 'C' ? 'bg-teal-100 text-teal-800' :
                        mention === 'D' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {mention}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {pass ? 'ជាប់' : 'ធ្លាក់'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
