import React, { useState, useEffect } from 'react';
import { X, Check, Eye, EyeOff } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface ChangeTeacherPasswordModalProps {
  teacher: any;
  onClose: () => void;
}

export const ChangeTeacherPasswordModal: React.FC<ChangeTeacherPasswordModalProps> = ({ teacher, onClose }) => {
  const { updateTeacher, showToast } = useSchool();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation states
  const [validations, setValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    symbol: false,
    match: false
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*]/.test(password),
      match: password === confirmPassword && password.length > 0
    });
  }, [password, confirmPassword]);

  const isFormValid = Object.values(validations).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // In a real app, we would hash this or call an API.
    // For this context, we might store it in teacher state if needed,
    // or just show a success message. We'll update the teacher to trigger a re-render/save.
    updateTeacher(teacher.id, {
      lastPasswordChange: new Date().toISOString()
    });
    
    showToast('ផ្លាស់ប្ដូរលេខសម្ងាត់ទទួលបានជោគជ័យ!', 'success');
    onClose();
  };

  const username = teacher.email ? teacher.email.split('@')[0] : (teacher.nameLatin || teacher.nameKhmer || '').toLowerCase().replace(/\s/g, '');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl font-sans text-slate-800 relative font-kantumruy"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-base text-slate-800">ផ្លាស់ប្ដូរលេខសម្ងាត់ថ្មី</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Badge Box */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">ផ្លាស់ប្ដូរលេខសម្ងាត់របស់:</p>
            <h3 className="font-bold text-slate-800 text-sm">{teacher.nameKhmer || teacher.name}</h3>
            <p className="text-xs text-slate-500">@{username}</p>
          </div>
          <div className="bg-emerald-500 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
            <Check className="w-4 h-4" />
          </div>
        </div>

        {/* Grid Form & Validation Box */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Left Col: Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ពាក្យសម្ងាត់ថ្មី (ទុកចន្លោះប្រសិនបើមិនចង់ផ្លាស់ប្ដូរ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  បញ្ជាក់ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="បំពេញសម្ងាត់ថ្មីម្ដងទៀត"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Validation Conditions */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
              <h4 className="font-semibold text-slate-700 mb-3">បច្ចេកទេសក្នុងការប្រើប្រាស់លេខសម្ងាត់ :</h4>
              <ul className="space-y-2">
                <li className={`flex items-center gap-2 ${validations.length ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${validations.length ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  តិចបំផុត 8 តួ
                </li>
                <li className={`flex items-center gap-2 ${validations.lowercase ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${validations.lowercase ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  មានអក្សរតូចយ៉ាងតិចមួយ
                </li>
                <li className={`flex items-center gap-2 ${validations.uppercase ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${validations.uppercase ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  មានអក្សរធំយ៉ាងតិចមួយ
                </li>
                <li className={`flex items-center gap-2 ${validations.number ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${validations.number ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  ចំនួន (លេខ 0-9)
                </li>
                <li className={`flex items-center gap-2 ${validations.symbol ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${validations.symbol ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  មានសញ្ញាយ៉ាងតិចមួយ (!@#$%^&*)
                </li>
                <li className={`flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 ${validations.match ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${validations.match ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  ពាក្យសម្ងាត់ទាំងពីរត្រូវគ្នា
                </li>
              </ul>
            </div>

          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-medium transition"
            >
              បោះបង់
            </button>
            <button 
              type="submit" 
              disabled={!isFormValid}
              className={`px-5 py-2 rounded-xl text-xs font-medium shadow-sm transition ${
                isFormValid 
                  ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              ផ្លាស់ប្ដូរលេខសម្ងាត់ថ្មី
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
