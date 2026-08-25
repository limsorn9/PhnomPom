import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { QrCode, X, CheckCircle2, Users, Calendar, Sparkles, ShieldCheck, Printer } from 'lucide-react';

interface QuickAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAttendanceModal: React.FC<QuickAttendanceModalProps> = ({ isOpen, onClose }) => {
  const { classrooms, students, batchRecordAttendance, showToast } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isScanned, setIsScanned] = useState(false);

  if (!isOpen) return null;

  const currentClass = classrooms.find(c => c.id === selectedClassId) || classrooms[0];
  const classStudents = currentClass
    ? students.filter(s => s.grade === currentClass.grade && s.section === currentClass.section)
    : students.filter(s => s.grade === 6 && s.section === 'ក');

  const handleInstantScan = () => {
    if (!currentClass) {
      showToast('សូមជ្រើសរើសថ្នាក់រៀនជាមុនសិន!', 'error');
      return;
    }

    const records = classStudents.map(s => ({
      date: selectedDate,
      grade: currentClass.grade,
      section: currentClass.section,
      studentId: s.id,
      studentNameKhmer: s.nameKhmer,
      status: 'present' as const,
      session: 'morning' as const,
      notes: 'ស្កេន QR Code រហ័សប្រចាំថ្ងៃ'
    }));

    batchRecordAttendance(records);
    setIsScanned(true);
    showToast(`ស្កេនវត្តមានជោគជ័យសម្រាប់ថ្នាក់ទី ${currentClass.grade}${currentClass.section} (${classStudents.length} នាក់)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-amber-300">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-moul tracking-wide">ប្រព័ន្ធស្កេនវត្តមានរហ័ស (Quick Attendance QR)</h3>
              <p className="text-xs text-blue-200 mt-1">
                បង្កើត QR Code ប្រចាំថ្ងៃសម្រាប់ថ្នាក់នីមួយៗ ដើម្បីឱ្យសិស្ស ឬគ្រូស្កេនចុះវត្តមានស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ជ្រើសរើសថ្នាក់រៀន</label>
              <select
                value={selectedClassId}
                onChange={e => {
                  setSelectedClassId(e.target.value);
                  setIsScanned(false);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>
                    ថ្នាក់ទី {c.grade} បន្ទប់ {c.section} (គ្រូ៖ {c.homeroomTeacherName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">កាលបរិច្ឆេទវត្តមាន</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setIsScanned(false);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* QR Code Card Display */}
          <div className="bg-gradient-to-b from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center shadow-inner relative overflow-hidden">
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>ថ្នាក់ទី {currentClass?.grade}{currentClass?.section}</span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>សិស្សសរុប {classStudents.length} នាក់</span>
            </div>

            <div className="mt-6 p-6 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
              {/* Simulated QR Code Graphic */}
              <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative">
                <div className="absolute inset-2 border-2 border-dashed border-white/40 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                  <QrCode className="w-20 h-20 text-amber-300 mb-1 animate-pulse" />
                  <span className="text-[10px] font-mono text-blue-200 tracking-wider">
                    ATT-QR-{currentClass?.grade}{currentClass?.section}-{selectedDate}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-4 max-w-md">
              ស្កេនកូដនេះដោយប្រើកាមេរ៉ាទូរស័ព្ទ ឬថេប្លេតរបស់គ្រូបន្ទុកថ្នាក់ ដើម្បីកត់ត្រាវត្តមានសិស្សស្វ័យប្រវត្តិចូលក្នុងប្រព័ន្ធមូលដ្ឋានទិន្នន័យសាលារៀន។
            </p>

            {isScanned && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm animate-in zoom-in duration-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>បានកត់ត្រាវត្តមានសិស្ស {classStudents.length} នាក់ជោគជ័យសម្រាប់ថ្ងៃទី {selectedDate}!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>បោះពុម្ព QR Code</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              បិទ
            </button>
            <button
              onClick={handleInstantScan}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ស្កេន និងកត់ត្រាវត្តមានភ្លាមៗ ({classStudents.length} សិស្ស)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
