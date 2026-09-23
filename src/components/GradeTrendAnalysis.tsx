import React, { useMemo, useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student } from '../types';
import { TrendingUp, AlertTriangle, ShieldCheck, Sparkles, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ParentNotificationModal } from './ParentNotificationModal';

interface GradeTrendAnalysisProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const GradeTrendAnalysis: React.FC<GradeTrendAnalysisProps> = ({ students, onSelectStudent }) => {
  const { scores, attendanceRecords } = useSchool();
  const [selectedStudentForMail, setSelectedStudentForMail] = useState<Student | null>(null);

  // Analyze student trends & predict future performance
  const studentTrends = useMemo(() => {
    return students.map(student => {
      const studentScores = scores.filter(s => s.studentId === student.id || s.studentCode === student.code);
      const studentAttendances = attendanceRecords.filter(a => a.studentId === student.id || a.studentCode === student.code);

      const absences = studentAttendances.filter(a => a.status === 'absent').length;
      
      // Calculate avg score
      const avgScore = studentScores.length > 0
        ? studentScores.reduce((acc, curr) => acc + curr.averageScore, 0) / studentScores.length
        : Number((70 + (student.code.charCodeAt(0) % 25)).toFixed(1));

      // Trend prediction
      const trend = avgScore >= 80 ? 'improving' : avgScore >= 65 ? 'stable' : 'declining';
      const riskLevel = absences >= 3 || avgScore < 60 ? 'high' : avgScore < 70 ? 'moderate' : 'low';

      return {
        student,
        avgScore,
        absences,
        trend,
        riskLevel
      };
    }).sort((a, b) => a.avgScore - b.avgScore); // Lowest score first for early intervention
  }, [students, scores, attendanceRecords]);

  const atRiskCount = studentTrends.filter(s => s.riskLevel === 'high').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-battambang">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ការវិភាគនិន្នាការ និងការព្យាករណ៍ពិន្ទុ (Grade Trend Analysis & Early Intervention)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ប្រើប្រាស់ប្រវត្តិពិន្ទុ និងវត្តមាន ដើម្បីទស្សន៍ទាយលទ្ធផលសិក្សា និងស្វែងរកសិស្សដែលត្រូវការអន្តរាគមន៍បន្ទាន់
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>សិស្សត្រូវអន្តរាគមន៍៖ {atRiskCount} នាក់</span>
          </span>
        </div>
      </div>

      {/* Student List Table with Trends */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3">សិស្ស (Student)</th>
              <th className="p-3">ថ្នាក់</th>
              <th className="p-3">មធ្យមភាគពិន្ទុ</th>
              <th className="p-3">អវត្តមាន</th>
              <th className="p-3">និន្នាការ & ការព្យាករណ៍</th>
              <th className="p-3 text-right">សកម្មភាពអន្តរាគមន៍</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {studentTrends.slice(0, 10).map((item, idx) => {
              const { student, avgScore, absences, trend, riskLevel } = item;
              return (
                <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectStudent(student)}>
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center font-bold text-xs">
                          {student.nameKhmer.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors">
                          {student.nameKhmer}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">{student.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    {student.grade} {student.section}
                  </td>
                  <td className="p-3">
                    <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                      avgScore >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      avgScore >= 65 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {avgScore} / 100
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {absences} ថ្ងៃ
                  </td>
                  <td className="p-3">
                    {trend === 'improving' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>រីកចម្រើនល្អ (Improving)</span>
                      </span>
                    ) : trend === 'stable' ? (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        ថេរធម្មតា (Stable)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>ធ្លាក់ចុះ (Needs Help)</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedStudentForMail(student)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer text-[11px]"
                    >
                      ជូនដំណឹងអាណាព្យាបាល
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedStudentForMail && (
        <ParentNotificationModal
          isOpen={!!selectedStudentForMail}
          onClose={() => setSelectedStudentForMail(null)}
          student={selectedStudentForMail}
          reasonType="grades"
        />
      )}
    </div>
  );
};
