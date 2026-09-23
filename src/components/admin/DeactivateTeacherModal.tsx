import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface DeactivateTeacherModalProps {
  teacher: any;
  onClose: () => void;
}

export const DeactivateTeacherModal: React.FC<DeactivateTeacherModalProps> = ({ teacher, onClose }) => {
  const { updateTeacher, showToast } = useSchool();

  const handleDeactivate = () => {
    updateTeacher(teacher.id, {
      status: 'inactive'
    });
    
    showToast('បានបិទដំណើរការគណនីដោយជោគជ័យ', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl font-sans text-slate-800 text-left relative font-kantumruy"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        {/* Title & Content */}
        <h2 className="font-bold text-base text-slate-800">បិទដំណើរបុគ្គលិក</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          តើអ្នកប្រាកដថាចង់បិទដំណើរការគណនីបុគ្គលិកនេះ? គណនីនឹងមិនអាចចូលប្រើប្រាស់ប្រព័ន្ធបានទៀតទេ។
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            បោះបង់
          </button>
          <button 
            onClick={handleDeactivate}
            className="px-4 py-2 text-xs font-medium text-white bg-[#f59e0b] hover:bg-amber-600 rounded-xl transition shadow-sm"
          >
            បិទដំណើរការគណនី
          </button>
        </div>

      </div>
    </div>
  );
};
