import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  Mic,
  MicOff,
  Volume2,
  Globe
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

  // Voice-to-Text (Speech Recognition) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<'km-KH' | 'en-US'>('km-KH');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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

  // Quick phrase suggestions for busy clinic hours
  const quickPhrases = [
    'សិស្សមានអាការៈក្តៅខ្លួន បានឱ្យសម្រាក និងវាស់កម្តៅឡើងវិញ',
    'ឈឺពោះក្រោយម៉ោងសម្រាក បានផ្តល់ទឹកក្តៅអ៊ុនៗ',
    'ដួលរលាត់ជង្គង់ពេលលេងកីឡា បានលាងរបួស និងបិទបង់រួចរាល់',
    'ឈឺក្បាលវិលមុខ បានទូរស័ព្ទជូនដំណឹងអាណាព្យាបាលមកទទួល',
    'ឈឺធ្មេញពុក ណែនាំឱ្យជួបទន្តពេទ្យជំនាញ'
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setCareNote(prev => {
              const prefix = prev.trim() ? `${prev.trim()} ` : '';
              return `${prefix}${transcriptPiece.trim()}`;
            });
          } else {
            currentTranscript += transcriptPiece;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('សូមអនុញ្ញាតសិទ្ធិប្រើប្រាស់មីក្រូហ្វូន (Microphone permission required)');
        } else if (event.error === 'no-speech') {
          // Keep listening or ignore
        } else {
          setSpeechError(`បញ្ហាសំឡេង៖ ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to init speech recognition:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [speechLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('កម្មវិធីរុករកនេះមិនទាន់គាំទ្រមុខងារសំឡេង Web Speech API ឡើយ។');
      return;
    }

    setSpeechError(null);
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = speechLanguage;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
        setIsListening(false);
      }
    }
  };

  const toggleTag = (tagLabel: string) => {
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter(t => t !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };

  const handleAppendPhrase = (phrase: string) => {
    setCareNote(prev => {
      const prefix = prev.trim() ? `${prev.trim()}. ` : '';
      return `${prefix}${phrase}`;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-moul tracking-wide">
                កត់សម្គាល់សុខភាពរហ័ស (Care Observation)
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                កត់ត្រាការពិនិត្យ អាការៈ និងការថែទាំសុខភាពបន្ទាន់ ជាមួយ Voice-to-Text
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
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs shrink-0">
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

          {/* Detailed Note Textarea with Voice-to-Text Integration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>ការកត់សម្គាល់លម្អិត & ដំណោះស្រាយថែទាំ (Detailed Care Notes):</span>
              </label>

              {/* Voice-to-Text Button Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSpeechLanguage(speechLanguage === 'km-KH' ? 'en-US' : 'km-KH')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                  title="ប្តូរភាសាសំឡេង (ភាសាខ្មែរ / អង់គ្លេស)"
                >
                  <Globe className="w-3 h-3 text-slate-500" />
                  <span>{speechLanguage === 'km-KH' ? 'ខ្មែរ (km)' : 'EN (en)'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-300'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                  title="ចុចដើម្បីនិយាយ និងបំលែងសំឡេងជាអត្ថបទ (Voice Dictation)"
                >
                  {isListening ? (
                    <>
                      <Mic className="w-3.5 h-3.5 animate-bounce" />
                      <span>កំពុងស្តាប់... (ចុចបិទ)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-indigo-600" />
                      <span>និយាយសំឡេង (Voice)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message if Mic not allowed */}
            {speechError && (
              <div className="mb-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={3}
                value={careNote}
                onChange={(e) => setCareNote(e.target.value)}
                placeholder="ឧ. សិស្សមានអាការៈក្តៅខ្លួនបន្តិចបន្ទាប់ពីរត់លេង បានឱ្យសម្រាកញ៉ាំទឹកក្តៅអ៊ុនៗ និងទូរស័ព្ទប្រាប់ម្តាយ... (អាចចុចប៊ូតុង 'និយាយសំឡេង' ខាងលើដើម្បីសូត្រអត្ថបទ)"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none ${
                  isListening ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-400' : 'border-slate-200'
                }`}
              />
              {isListening && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>កំពុងកត់ត្រាសំឡេង...</span>
                </div>
              )}
            </div>

            {/* Quick Phrase Chips for Rapid Logging */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">
                ឃ្លារហ័សសម្រាប់គិលានុបដ្ឋាក (Quick Clinical Templates):
              </span>
              <div className="flex flex-wrap gap-1">
                {quickPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendPhrase(phrase)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-lg text-[10px] text-left transition-colors cursor-pointer"
                  >
                    + {phrase.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
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
