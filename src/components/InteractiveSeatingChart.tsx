import React, { useState } from 'react';
import { Student } from '../types';
import { Users, Move, RotateCcw, Check, Sparkles, AlertCircle, CalendarCheck, ShieldCheck } from 'lucide-react';

interface InteractiveSeatingChartProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAttendanceQuickMark?: (studentId: string, status: 'present' | 'absent' | 'permission') => void;
}

export const InteractiveSeatingChart: React.FC<InteractiveSeatingChartProps> = ({
  students,
  onSelectStudent,
  onAttendanceQuickMark
}) => {
  // Let's create a seating grid or draggable desk arrangement (6 rows x 4 columns = 24 desks)
  const [desks, setDesks] = useState<Array<{ id: number; row: number; col: number; studentId?: string }>>(() => {
    const initial = [];
    let studentIdx = 0;
    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= 4; c++) {
        const student = students[studentIdx];
        initial.push({
          id: (r - 1) * 4 + c,
          row: r,
          col: c,
          studentId: student ? student.id : undefined
        });
        studentIdx++;
      }
    }
    return initial;
  });

  const [draggedDeskId, setDraggedDeskId] = useState<number | null>(null);
  const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null);

  const getStudentById = (studentId?: string) => {
    if (!studentId) return null;
    return students.find(s => s.id === studentId);
  };

  const handleDragStart = (e: React.DragEvent, deskId: number) => {
    setDraggedDeskId(deskId);
    e.dataTransfer.setData('text/plain', String(deskId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDeskId: number) => {
    e.preventDefault();
    if (draggedDeskId === null || draggedDeskId === targetDeskId) return;

    setDesks(prev => {
      const newDesks = [...prev];
      const sourceIndex = newDesks.findIndex(d => d.id === draggedDeskId);
      const targetIndex = newDesks.findIndex(d => d.id === targetDeskId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const tempStudentId = newDesks[sourceIndex].studentId;
        newDesks[sourceIndex].studentId = newDesks[targetIndex].studentId;
        newDesks[targetIndex].studentId = tempStudentId;
      }
      return newDesks;
    });

    setDraggedDeskId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-battambang">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Move className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ប្លង់តុរៀបចំកៅអីអង្គុយអន្តរកម្ម (Interactive Drag-and-Drop Seating Chart)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            អូសទម្លាក់ (Drag & Drop) កៅអីដើម្បីប្តូរទីតាំងសិស្សក្នុងថ្នាក់រៀន ជួយគ្រប់គ្រងវិន័យ និងការអានបានល្អប្រសើរ
          </p>
        </div>

        <button
          onClick={() => {
            // Reset default order
            let studentIdx = 0;
            setDesks(prev => prev.map(d => {
              const student = students[studentIdx++];
              return { ...d, studentId: student ? student.id : undefined };
            }));
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>រៀបចំជាដើម</span>
        </button>
      </div>

      {/* Teacher Desk & Board indicator */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl py-2.5 text-center border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider">
          📐 តុគ្រូបង្រៀន និងក្ដារខៀន (Teacher Desk & Blackboard)
        </span>
      </div>

      {/* Seating Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {desks.map((desk) => {
          const student = getStudentById(desk.studentId);
          const isSelected = selectedDeskId === desk.id;

          return (
            <div
              key={desk.id}
              draggable={!!student}
              onDragStart={(e) => handleDragStart(e, desk.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, desk.id)}
              onClick={() => setSelectedDeskId(desk.id)}
              className={`p-3 rounded-xl border transition-all cursor-move flex flex-col justify-between min-h-[110px] ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-400/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>โต๊ะ #{desk.id}</span>
                <Move className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {student ? (
                <div className="space-y-1.5 my-1" onClick={() => onSelectStudent(student)}>
                  <div className="flex items-center gap-2">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center font-bold text-[10px]">
                        {student.nameKhmer.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {student.nameKhmer}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">អត្តលេខ: {student.code}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 italic">
                  តុទំនេរ (Empty)
                </div>
              )}

              {student && onAttendanceQuickMark && (
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onAttendanceQuickMark(student.id, 'present')}
                    title="វត្តមាន"
                    className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded"
                  >
                    វត្តមាន
                  </button>
                  <button
                    onClick={() => onAttendanceQuickMark(student.id, 'absent')}
                    title="អវត្តមាន"
                    className="px-1.5 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold rounded"
                  >
                    អត់
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ការរៀបចំកៅអីអង្គុយជួយកាត់បន្ថយការរំខាន និងបង្កើនការយកចិត្តទុកដាក់លើការសិក្សា</span>
        </span>
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
          សិស្សសរុបក្នុងប្លង់៖ {students.length} នាក់
        </span>
      </div>
    </div>
  );
};
