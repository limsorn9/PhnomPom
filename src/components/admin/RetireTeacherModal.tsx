import React, { useState } from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface RetireTeacherModalProps {
  teacher: any;
  onClose: () => void;
}

export const RetireTeacherModal: React.FC<RetireTeacherModalProps> = ({ teacher, onClose }) => {
  const { updateTeacher, showToast } = useSchool();
  const [retireType, setRetireType] = useState('ចូលនិវត្តន៍');
  const [retireDate, setRetireDate] = useState(new Date().toISOString().split('T')[0]);

  const assignedClassCount = teacher.class && teacher.class !== 'មិនមានថ្នាក់' ? 1 : 0;

  const handleRetire = () => {
    updateTeacher(teacher.id, {
      status: 'retired',
      assignedGrade: null,
      assignedSection: null,
      retireType,
      retireDate
    });
    
    showToast('គ្រូបង្រៀនត្រូវបានដាក់ឱ្យចូលនិវត្តន៍ជោគជ័យ!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl font-sans text-slate-800 relative font-kantumruy"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-base text-slate-800">ចូលនិវត្តន៍គ្រូបង្រៀន</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Question */}
        <p className="text-xs text-slate-700 font-medium my-3">
          តើអ្នកប្រាកដថាចង់ឱ្យចូលនិវត្តន៍ {teacher.nameKhmer || teacher.name} ?
        </p>

        {/* Form Controls */}
        <div className="mt-4">
          <label className="text-xs text-slate-600 mb-1 block">ប្រភេទចូលនិវត្តន៍</label>
          <select 
            value={retireType}
            onChange={(e) => setRetireType(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-xs w-full focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="ចូលនិវត្តន៍">ចូលនិវត្តន៍</option>
            <option value="បាត់បង់សមត្ថភាព">បាត់បង់សមត្ថភាពការងារ</option>
            <option value="បោះបង់ការងារ">បោះបង់ការងារ</option>
          </select>
        </div>

        <div className="mt-3">
          <label className="text-xs text-slate-600 mb-1 block">កាលបរិច្ឆេទចូលនិវត្តន៍</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={retireDate}
              onChange={(e) => setRetireDate(e.target.value)}
              className="border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs w-full focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Warning Alert Box */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 my-4 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            ថ្នាក់ដែលនឹងត្រូវដោះលែង : {assignedClassCount}
          </div>
          <p className="text-amber-800 text-[11px] pl-5.5 ml-1">
            គណនីនឹងត្រូវបានបិទ ហើយពួកគេនឹងមិនអាចចូលប្រើប្រព័ន្ធបានទៀតទេ។
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs px-4 py-2 rounded-xl transition"
          >
            បោះបង់
          </button>
          <button 
            onClick={handleRetire}
            className="bg-[#ea580c] hover:bg-orange-700 text-white text-xs font-medium px-5 py-2 rounded-xl transition shadow-sm"
          >
            ចូលនិវត្តន៍
          </button>
        </div>

      </div>
    </div>
  );
};
