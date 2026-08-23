import React, { useState } from 'react';
import { Student } from '../types';
import {
  Stethoscope,
  X,
  Check,
  Clock,
  User,
  AlertCircle,
  Phone,
  Pill,
  HeartPulse,
  Sparkles,
  FileText
} from 'lucide-react';

interface QuickCareObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSaveObservation: (studentId: string, updatedNotes: string, observationTag?: string) => void;
}

export const QuickCareObservationModal: React.FC<QuickCareObservationModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveObservation
}) => {
  if (!isOpen) return null;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [careNote, setCareNote] = useState<string>('');
  const [caregiverName, setCaregiverName] = useState<string>('គ្រូបន្ទុកថ្នាក់ / គិលានុបដ្ឋាក');
  const [requiresFollowUp, setRequiresFollowUp] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<string>('36.8');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const quickObservationTags = [
    { id: 'fever', label: 'ក្តៅខ្លួន / គ្រុនក្តៅ', icon: '🌡️', color: 'bg-rose-50 border-rose-200 text-rose-700' },
    { id: 'headache', label: 'ឈឺក្បាល / វិលមុខ', icon: '🤕', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { id: 'stomach', label: 'ឈឺពោះ / ចង្អោរ', icon: '🤢', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { id: 'tooth', label: 'ឈឺធ្មេញ', icon: '🦷', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
    { id: 'injury', label: 'ដួលរលាត់ / របួសស្រាល', icon: '🩹', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'eye', label: 'រលាកភ្នែក / ភ្នែកក្រហម', icon: '👁️', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { id: 'first_aid', label: 'បានផ្តល់ថ្នាំបឋមនៅសាលា', icon: '💊', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { id: 'infirmary', label: 'សម្រាកបន្ទប់សុខភាពសាលា', icon: '🛏️', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'parent_call', label: 'បានទូរស័ព្ទជូនដំណឹងអាណាព្យាបាល', icon: '📞', color: 'bg-teal-50 border-teal-200 text-teal-700' },
    { id: 'sent_home', label: 'អនុញ្ញាតឱ្យត្រឡប់ទៅផ្ទះ', icon: '🏠', color: 'bg-slate-100 border-slate-300 text-slate-700' }
  ];

  const toggleTag = (tagLabel: string) => {
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter(t => t !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });

    // Format entry
    const tagSummary = selectedTags.length > 0 ? `[${selectedTags.join(', ')}]` : '';
    const tempSummary = temperature ? `[កម្តៅ: ${temperature}°C]` : '';
    const followUpSummary = requiresFollowUp ? '(ត្រូវការតាមដានបន្ត)' : '';
    const newEntry = `• [${todayStr} ${timeStr}] ${tagSummary} ${tempSummary} ${careNote.trim()} - កត់ត្រាដោយ: ${caregiverName} ${followUpSummary}`.trim();

    const currentNotes = student.health?.notes || '';
    const updatedNotes = currentNotes ? `${newEntry}\n${currentNotes}` : newEntry;

    onSaveObservation(student.id, updatedNotes, selectedTags[0]);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-moul tracking-wide">
                កត់សម្គាល់សុខភាពរហ័ស (Care Observation)
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                កត់ត្រាការពិនិត្យ អាការៈ និងការថែទាំសុខភាពបន្ទាន់
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Mini Profile Summary */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
              {student.gender === 'F' ? 'ស' : 'ប'}
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm font-kantumruy">{student.nameKhmer}</span>
              <span className="text-slate-500 font-mono block text-[11px]">
                {student.code} • ថ្នាក់ទី {student.grade}{student.section}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
              ក្រុមឈាម {student.health?.bloodType || 'O+'}
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5 font-mono">
              BMI: {student.health?.bmi || '-'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Quick Tags Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>ជ្រើសរើសស្លាកអាការៈ និងការថែទាំរហ័ស (Quick Observation Tags):</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickObservationTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer text-xs font-semibold ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : `${tag.color} hover:shadow-xs`
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span className="truncate">{tag.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature and Caregiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                សីតុណ្ហភាពវាស់កម្តៅ (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="34.0"
                  max="42.0"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  placeholder="36.8"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-mono">°C</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                អ្នកកត់ត្រា / គិលានុបដ្ឋាក
              </label>
              <input
                type="text"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                placeholder="ឈ្មោះគ្រូ/គិលានុបដ្ឋាក"
              />
            </div>
          </div>

          {/* Detailed Note Textarea */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>ការកត់សម្គាល់លម្អិត & ដំណោះស្រាយថែទាំ (Detailed Care Notes):</span>
            </label>
            <textarea
              rows={3}
              value={careNote}
              onChange={(e) => setCareNote(e.target.value)}
              placeholder="ឧ. សិស្សមានអាការៈក្តៅខ្លួនបន្តិចបន្ទាប់ពីរត់លេង បានឱ្យសម្រាកញ៉ាំទឹកក្តៅអ៊ុនៗ និងទូរស័ព្ទប្រាប់ម្តាយ..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Follow-up Checkbox */}
          <div className="flex items-center gap-2.5 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
            <input
              type="checkbox"
              id="followup-check"
              checked={requiresFollowUp}
              onChange={(e) => setRequiresFollowUp(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="followup-check" className="text-xs font-semibold text-amber-900 cursor-pointer">
              តម្រូវឱ្យមានការតាមដានបន្តនៅថ្ងៃស្អែក ឬសប្តាហ៍ក្រោយ (Requires Clinical Follow-up)
            </label>
          </div>

          {/* Previous Notes View */}
          {student.health?.notes && (
            <div className="pt-2 border-t border-slate-200/80">
              <label className="block font-bold text-slate-600 mb-1 text-[11px]">
                កំណត់ត្រាសុខភាពកន្លងមក (Previous Care Logs):
              </label>
              <div className="bg-slate-100/80 p-2.5 rounded-xl max-h-20 overflow-y-auto font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-tight">
                {student.health.notes}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>បានរក្សាទុក!</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  <span>រក្សាទុកកំណត់ត្រាសុខភាព</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
