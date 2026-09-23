import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { X, Building2, User, GraduationCap, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface NewClassroomWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClassroomWizardModal: React.FC<NewClassroomWizardModalProps> = ({ isOpen, onClose }) => {
  const { teachers, addClassroom, schoolProfile, showToast } = useSchool();

  const [step, setStep] = useState<number>(1);
  const [grade, setGrade] = useState<number>(6);
  const [section, setSection] = useState<string>('ក');
  const [roomName, setRoomName] = useState<string>('បន្ទប់ទី ១០');
  const [teacherId, setTeacherId] = useState<string>(teachers[0]?.id || '');
  const [maxStudents, setMaxStudents] = useState<number>(40);

  if (!isOpen) return null;

  const selectedTeacher = teachers.find(t => t.id === teacherId) || teachers[0];

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!section || !roomName) {
      showToast('សូមបំពេញព័ត៌មានបន្ទប់ និងអក្សរខណ្ឌឱ្យបានគ្រប់គ្រាន់!', 'error');
      return;
    }

    addClassroom({
      grade,
      section,
      roomName,
      homeroomTeacherId: selectedTeacher?.id || 't-1',
      homeroomTeacherName: selectedTeacher?.nameKhmer || 'លោកគ្រូ/អ្នកគ្រូ',
      academicYear: schoolProfile.academicYear,
      studentCount: 0
    });

    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-amber-300">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-moul tracking-wide">បង្កើតថ្នាក់រៀនថ្មី (New Classroom Setup Wizard)</h3>
              <p className="text-xs text-blue-200 mt-1">
                ជំហានទី {step} នៃ ៣ • កំណត់កម្រិតថ្នាក់ គ្រូបន្ទុក និងទីតាំងបន្ទប់រៀន
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinish} className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>១. កំណត់កម្រិតថ្នាក់ និងខណ្ឌ (Grade & Section)</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">កម្រិតថ្នាក់សិក្សា</label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                        grade === g
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ថ្នាក់ទី {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">អក្សរខណ្ឌ (Section)</label>
                  <input
                    type="text"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    placeholder="ឧ. ក, ខ, គ"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ឈ្មោះបន្ទប់រៀន / អគារ</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    placeholder="ឧ. បន្ទប់ ១០១ អគារ A"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>២. ជ្រើសរើសគ្រូបន្ទុកថ្នាក់ (Homeroom Teacher)</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">គ្រូបង្រៀនប្រចាំថ្នាក់</label>
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nameKhmer} ({t.nameLatin}) - ទូរស័ព្ទ៖ {t.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ចំនួនសិស្សអតិបរមាដែលអាចទទួល</label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={e => setMaxStudents(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>៣. ពិនិត្យឡើងវិញ និងបញ្ជាក់ការបង្កើតថ្នាក់</span>
              </h4>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">កម្រិតថ្នាក់៖</span>
                  <span className="font-bold text-slate-800">ថ្នាក់ទី {grade} បន្ទប់ {section}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">បន្ទប់រៀន៖</span>
                  <span className="font-bold text-slate-800">{roomName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">គ្រូបន្ទុកថ្នាក់៖</span>
                  <span className="font-bold text-slate-800">{selectedTeacher?.nameKhmer || 'មិនទាន់កំណត់'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ឆ្នាំសិក្សា៖</span>
                  <span className="font-bold text-blue-600">{schoolProfile.academicYear}</span>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ថយក្រោយ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                បោះបង់
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <span>បន្ទាប់</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>បង្កើតថ្នាក់រៀនឥឡូវនេះ</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
