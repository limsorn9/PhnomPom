import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Classroom } from '../types';
import {
  GraduationCap,
  Plus,
  Users,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  School,
  ArrowRight,
  ClipboardList,
  Award,
  Layers,
  X
} from 'lucide-react';

interface MyClassesProps {
  onSelectClass?: (grade: number, section: string, action?: 'students' | 'scores' | 'attendance') => void;
}

export const MyClasses: React.FC<MyClassesProps> = ({ onSelectClass }) => {
  const {
    classrooms,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    students,
    currentUser,
    selectedAcademicYear,
    setActiveTab,
    showToast
  } = useSchool();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);

  // Form states
  const [formGrade, setFormGrade] = useState<number>(1);
  const [formSection, setFormSection] = useState<string>('ក');
  const [formShift, setFormShift] = useState<string>('ពេញមួយថ្ងៃ');
  const [formRoomNumber, setFormRoomNumber] = useState<string>('បន្ទប់ ១០១');
  const [formCapacity, setFormCapacity] = useState<number>(45);

  // Filter classrooms if current user is teacher with assigned class
  const displayedClassrooms = classrooms.filter(c => {
    if (currentUser?.role === 'teacher' && currentUser.assignedGrade && currentUser.assignedSection) {
      // Teachers can see their assigned class plus others if they teach multiple
      return true; // allow seeing all or assigned
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingClass(null);
    setFormGrade(1);
    setFormSection('ក');
    setFormShift('ពេញមួយថ្ងៃ');
    setFormRoomNumber('បន្ទប់ ១០១');
    setFormCapacity(45);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (cls: Classroom) => {
    setEditingClass(cls);
    setFormGrade(cls.grade);
    setFormSection(cls.section);
    setFormRoomNumber(cls.roomNumber || '');
    setFormCapacity(cls.capacity || 45);
    setIsCreateModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClass) {
      updateClassroom(editingClass.id, {
        grade: formGrade,
        section: formSection,
        roomNumber: formRoomNumber,
        capacity: formCapacity,
        academicYear: selectedAcademicYear
      });
      showToast(`បានកែសម្រួលព័ត៌មានថ្នាក់ទី ${formGrade} «${formSection}» ជោគជ័យ!`, 'success');
    } else {
      // Check duplicate
      const exists = classrooms.some(
        c => c.grade === formGrade && c.section === formSection && c.academicYear === selectedAcademicYear
      );
      if (exists) {
        showToast(`ថ្នាក់ទី ${formGrade} «${formSection}» ឆ្នាំសិក្សា ${selectedAcademicYear} មានរួចរាល់ហើយ!`, 'warning');
        return;
      }

      addClassroom({
        grade: formGrade,
        section: formSection,
        roomNumber: formRoomNumber,
        capacity: formCapacity,
        academicYear: selectedAcademicYear,
        homeroomTeacherId: currentUser?.id || 't-default',
        homeroomTeacherName: currentUser?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'
      });
      showToast(`បានបង្កើតថ្នាក់ទី ${formGrade} «${formSection}» ដោយជោគជ័យ!`, 'success');
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteClass = (cls: Classroom) => {
    const classStudentsCount = students.filter(s => s.grade === cls.grade && s.section === cls.section).length;
    if (classStudentsCount > 0) {
      if (!window.confirm(`ថ្នាក់នេះមានសិស្សចំនួន ${classStudentsCount} នាក់។ តើលោកគ្រូ/អ្នកគ្រូពិតជាចង់លុបថ្នាក់នេះមែនទេ?`)) {
        return;
      }
    }
    deleteClassroom(cls.id);
  };

  const handleNavigate = (grade: number, section: string, action: 'students' | 'scores' | 'attendance') => {
    if (onSelectClass) {
      onSelectClass(grade, section, action);
    } else {
      if (action === 'students') setActiveTab('students');
      else if (action === 'scores') setActiveTab('scores');
      else if (action === 'attendance') setActiveTab('homeroom_dashboard');
    }
  };

  return (
    <div className="space-y-6 font-battambang animate-fade-in pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl border border-blue-800/40">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-moul text-lg sm:text-xl">ថ្នាក់របស់ខ្ញុំ</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  សរុប {displayedClassrooms.length} ថ្នាក់
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                គ្រប់គ្រងថ្នាក់រៀន សិស្សានុសិស្ស ស្រង់ពិន្ទុ និងវត្តមាន · ឆ្នាំសិក្សា {selectedAcademicYear}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ បង្កើតថ្នាក់</span>
        </button>
      </div>

      {/* 2. Empty State View */}
      {displayedClassrooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-14 text-center flex flex-col items-center justify-center gap-5 shadow-xs">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center shadow-inner">
            <School className="w-10 h-10" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="font-moul text-lg sm:text-xl text-slate-800 dark:text-slate-100">
              បង្កើតថ្នាក់ដំបូងរបស់អ្នក
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ចាប់ផ្ដើមដោយបង្កើតថ្នាក់ → បន្ថែមសិស្ស → ស្រង់ពិន្ទុ → បោះពុម្ពសន្លឹកពិន្ទុ
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/50 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ បង្កើតថ្នាក់ដំបូង</span>
          </button>
        </div>
      ) : (
        /* 4. Class Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedClassrooms.map((cls) => {
            const classStudents = students.filter(s => s.grade === cls.grade && s.section === cls.section);
            const femaleCount = classStudents.filter(s => s.gender === 'F').length;

            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col group"
              >
                {/* Card Top Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white">
                      {cls.grade}{cls.section}
                    </div>
                    <div>
                      <h3 className="font-moul text-base text-white">
                        ថ្នាក់ទី {cls.grade} «{cls.section}»
                      </h3>
                      <span className="text-[11px] text-blue-200">
                        {cls.roomNumber || 'បន្ទប់ទូទៅ'} · ឆ្នាំ {cls.academicYear || selectedAcademicYear}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown / Edit Button */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(cls)}
                      title="កែប្រែព័ត៌មានថ្នាក់"
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      title="លុបថ្នាក់រៀន"
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body Stats */}
                <div className="p-4 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                      <div className="text-xl font-bold font-mono text-blue-700 dark:text-blue-400">
                        {classStudents.length}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        សិស្សសរុប (នាក់)
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                      <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                        {femaleCount}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        សិស្សស្រី (នាក់)
                      </div>
                    </div>
                  </div>

                  <div className="text-[11.5px] text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>គ្រូបន្ទុកថ្នាក់៖</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {cls.homeroomTeacherName || currentUser?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ចំណុះអតិបរមា៖</span>
                      <span className="font-mono">{cls.capacity || 45} នាក់</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Shortcuts */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleNavigate(cls.grade, cls.section, 'students')}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>បញ្ជីសិស្ស</span>
                  </button>

                  <button
                    onClick={() => handleNavigate(cls.grade, cls.section, 'scores')}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    <span>ស្រង់ពិន្ទុ</span>
                  </button>

                  <button
                    onClick={() => handleNavigate(cls.grade, cls.section, 'attendance')}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>វត្តមាន</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 3. Create / Edit Class Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs font-battambang animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <School className="w-5 h-5 text-blue-300" />
                <h3 className="font-moul text-base">
                  {editingClass ? 'កែសម្រួលព័ត៌មានថ្នាក់រៀន' : 'បង្កើតថ្នាក់រៀនថ្មី'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    កម្រិតថ្នាក់ (Grade Level)
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    បន្ទប់ / អក្សរ (Section)
                  </label>
                  <select
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                  >
                    {['ក', 'ខ', 'គ', 'ឃ', 'ង', 'A', 'B', 'C'].map(s => (
                      <option key={s} value={s}>បន្ទប់ {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    វេនសិក្សា (Teaching Shift)
                  </label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                  >
                    <option value="ពេញមួយថ្ងៃ">ពេញមួយថ្ងៃ (Full day)</option>
                    <option value="ព្រឹក">វេនព្រឹក (Morning)</option>
                    <option value="រសៀល">វេនរសៀល (Afternoon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឆ្នាំសិក្សា (Academic Year)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedAcademicYear}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខបន្ទប់ (Room Number)
                  </label>
                  <input
                    type="text"
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(e.target.value)}
                    placeholder="បន្ទប់ ១០១"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ចំណុះសិស្សអតិបរមា
                  </label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  បោះបង់
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/50 cursor-pointer"
                >
                  {editingClass ? 'រក្សាទុកការកែប្រែ' : '+ បង្កើតថ្នាក់'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
