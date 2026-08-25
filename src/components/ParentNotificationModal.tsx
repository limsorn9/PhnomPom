import React, { useState } from 'react';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import { Mail, Sparkles, Send, CheckCircle2, X, FileText, ExternalLink } from 'lucide-react';

interface ParentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  reasonType: 'attendance' | 'grades' | 'general';
  defaultNote?: string;
}

export const ParentNotificationModal: React.FC<ParentNotificationModalProps> = ({
  isOpen,
  onClose,
  student,
  reasonType,
  defaultNote = ''
}) => {
  const { schoolProfile } = useSchool();
  const [recipientEmail, setRecipientEmail] = useState('parent@gmail.com');
  const [subject, setSubject] = useState(() => {
    if (reasonType === 'attendance') return `សេចក្តីជូនដំណឹងពីវត្តមានរបស់សិស្ស ៖ ឯកឧត្តម/លោកជំទាវ/លោកគ្រូអ្នកគ្រូ អាណាព្យាបាលសិស្ស ${student.nameKhmer}`;
    if (reasonType === 'grades') return `របាយការណ៍លទ្ធផលសិក្សារបស់សិស្ស ៖ ${student.nameKhmer} (ថ្នាក់ទី ${student.grade}${student.section})`;
    return `សេចក្តីជូនដំណឹងពីសាលារៀន ${schoolProfile.nameKhmer}`;
  });

  const [messageBody, setMessageBody] = useState(() => {
    if (reasonType === 'attendance') {
      return `គោរពជូន អាណាព្យាបាលសិស្ស ${student.nameKhmer} (អត្តលេខ: ${student.code})\n\nសាលារៀនសូមជម្រាបជូនជ្រាបថា កូនរបស់លោកអ្នកមានអវត្តមានជាប់ៗគ្នាជាច្រើនថ្ងៃក្នុងសប្តាហ៍នេះ ដែលអាចប៉ះពាល់ដល់ការសិក្សារបស់កូន។\n\nសូមអាណាព្យាបាលមេត្តាអញ្ជើញមកសាកសួរព័ត៌មាន ឬទំនាក់ទំនងមកកាន់លោកគ្រូអ្នកគ្រូប្រចាំថ្នាក់តាមរយៈលេខទូរស័ព្ទសាលា។\n\nដោយក្តីគោរពពី,\nរដ្ឋបាលសាលារៀន ${schoolProfile.nameKhmer}`;
    }
    if (reasonType === 'grades') {
      return `គោរពជូន អាណាព្យាបាលសិស្ស ${student.nameKhmer} (អត្តលេខ: ${student.code})\n\nលទ្ធផលសិក្សារបស់សិស្សក្នុងមុខវិជ្ជាសំខាន់ៗមានការធ្លាក់ចុះក្រោមស្តង់ដារ isRequired ។ សាលាសូមស្នើសុំកិច្ចសហការពីអាណាព្យាបាលជួយរៀបចំពេលឱ្យសិស្សបានរៀនបន្ថែមនៅផ្ទះ។\n\nដោយក្តីគោរពពី,\nលោកគ្រូអ្នកគ្រូប្រចាំថ្នាក់ ${schoolProfile.nameKhmer}`;
    }
    return defaultNote || `សេចក្តីជូនដំណឹងទូទៅពីសាលារៀន ${schoolProfile.nameKhmer} ចំពោះសិស្ស ${student.nameKhmer}.`;
  });

  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
    window.open(mailtoUrl, '_blank');
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-battambang">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              បង្កើតសារជូនដំណឹង និងអ៊ីម៉ែលជូនអាណាព្យាបាល (Parent Notification Draft)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              បានបើកកម្មវិធីអ៊ីម៉ែល និងត្រៀមបញ្ជូនរួចរាល់!
            </h4>
            <p className="text-xs text-slate-500">សេចក្តីព្រាងសារត្រូវបានបង្កើត និងផ្ញើជូនអាណាព្យាបាលសិស្ស {student.nameKhmer} ដោយជោគជ័យ។</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                អ៊ីម៉ែលអាណាព្យាបាល (Parent Email):
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                កម្មវត្ថុ (Subject):
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ខ្លឹមសារសារជូនដំណឹង (Message Body Draft):
              </label>
              <textarea
                rows={7}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>រួមបញ្ចូលជាមួយ Google Workspace Hub</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  បោះបង់
                </button>
                <button
                  onClick={handleSendEmail}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>បើកអ៊ីម៉ែលផ្ញើ (Open Mail Client)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
