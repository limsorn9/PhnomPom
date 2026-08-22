import React, { useState } from 'react';
import { LessonPlan } from '../../types';
import {
  BookOpen,
  Plus,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Sparkles,
  X,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface LessonPlansTabProps {
  lessonPlans: LessonPlan[];
  selectedGrade: number;
  selectedSection: string;
  onAddPlan: (plan: Omit<LessonPlan, 'id' | 'createdAt'>) => void;
  onUpdatePlan: (id: string, updated: Partial<LessonPlan>) => void;
  onDeletePlan: (id: string) => void;
}

export const LessonPlansTab: React.FC<LessonPlansTabProps> = ({
  lessonPlans,
  selectedGrade,
  selectedSection,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Filter plans for current class
  const classPlans = lessonPlans.filter(
    p => p.grade === selectedGrade && p.section === selectedSection
  );

  const filteredPlans = classPlans.filter(p =>
    filterSubject === 'all' ? true : p.subject === filterSubject
  );

  // Form State for new plan
  const [formSubject, setFormSubject] = useState('ភាសាខ្មែរ');
  const [formLessonNumber, setFormLessonNumber] = useState('មេរៀនទី១');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDuration, setFormDuration] = useState(60);
  const [formKnowledge, setFormKnowledge] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formAttitude, setFormAttitude] = useState('');
  const [formAids, setFormAids] = useState('សៀវភៅពុម្ព, រូបភាពគំរូ, ក្តារខៀនតូច');
  const [step1, setStep1] = useState('ពិនិត្យអនាម័យ ឯកសណ្ឋាន និងស្រង់វត្តមានសិស្ស (៣នាទី)');
  const [step2, setStep2] = useState('សួរសំណួររំលឹកមេរៀនមុន និងកែតម្រូវកិច្ចការផ្ទះ (៧នាទី)');
  const [step3, setStep3] = useState('ពន្យល់ខ្លឹមសារមេរៀនថ្មី និងដាក់លំហាត់ឱ្យសិស្សអនុវត្តជាក្រុម (៣០នាទី)');
  const [step4, setStep4] = useState('សិស្សឡើងធ្វើបទបង្ហាញ និងគ្រូសង្ខេបចំណុចគន្លឹះ (១៥នាទី)');
  const [step5, setStep5] = useState('ដាក់កិច្ចការផ្ទះ និងដាស់តឿនសិស្សឱ្យជួយការងារឪពុកម្តាយ (៥នាទី)');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    onAddPlan({
      grade: selectedGrade,
      section: selectedSection,
      academicYear: '២០២៤ - ២០២៥',
      subject: formSubject,
      lessonNumber: formLessonNumber,
      lessonTitle: formTitle,
      teachingDate: formDate,
      durationMinutes: Number(formDuration),
      objectives: {
        knowledge: formKnowledge || 'សិស្សយល់ច្បាស់ពីខ្លឹមសារមេរៀន',
        skills: formSkills || 'សិស្សអាចអនុវត្តលំហាត់ជាក់ស្តែងបានត្រឹមត្រូវ',
        attitude: formAttitude || 'សិស្សស្រឡាញ់ការសិក្សា និងមានវិន័យល្អ'
      },
      teachingAids: formAids,
      steps: {
        step1ClassManagement: step1,
        step2ReviewOldLesson: step2,
        step3NewLesson: step3,
        step4Consolidation: step4,
        step5HomeworkAndAdvice: step5
      },
      teacherReflection: '',
      status: 'approved',
      approvedBy: 'លោក ចាន់ វុទ្ធី (នាយករង)'
    });

    setShowCreateModal(false);
    // Reset
    setFormTitle('');
  };

  const handlePrintSinglePlan = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* Top Header: Filter, Create button */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500">មុខវិជ្ជា៖</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs flex-wrap">
            {['all', 'ភាសាខ្មែរ', 'គណិតវិទ្យា', 'វិទ្យាសាស្ត្រ', 'សិក្សាសង្គម'].map(subj => (
              <button
                key={subj}
                onClick={() => setFilterSubject(subj)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  filterSubject === subj
                    ? 'bg-white shadow-xs text-blue-700'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {subj === 'all' ? 'ទាំងអស់' : subj}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតកិច្ចតែងការថ្មី (៥ ជំហាន)</span>
        </button>
      </div>

      {/* Lesson Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlans.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-400">
            មិនទាន់មានកិច្ចតែងការបង្រៀនសម្រាប់មុខវិជ្ជានេះនៅឡើយទេ
          </div>
        ) : (
          filteredPlans.map(plan => (
            <div
              key={plan.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                      {plan.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {plan.lessonNumber}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">
                    {plan.lessonTitle}
                  </h4>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  អនុម័តរួច
                </span>
              </div>

              {/* Objectives preview */}
              <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 space-y-1 border border-slate-100">
                <p>
                  <strong>ចំណេះដឹង៖</strong> {plan.objectives.knowledge}
                </p>
                <p>
                  <strong>បំណិន៖</strong> {plan.objectives.skills}
                </p>
              </div>

              {/* Meta & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-times">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {plan.teachingDate} ({plan.durationMinutes} នាទី)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition-colors"
                    title="មើលលម្អិត"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePrintSinglePlan(plan)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="បោះពុម្ពកិច្ចតែងការ"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="លុប"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: VIEW / PRINT FULL 5-STEP LESSON PLAN */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header with Close and Print */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 font-moul text-base">
                  កិច្ចតែងការបង្រៀនស្តង់ដារ MoEYS
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintSinglePlan(selectedPlan)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  បោះពុម្ព
                </button>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MoEYS Lesson Plan Layout */}
            <div className="space-y-4 text-xs text-slate-800">
              <div className="text-center space-y-1">
                <p className="font-moul text-sm text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-xs text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <p className="font-moul text-xs text-blue-800 pt-2">កិច្ចតែងការបង្រៀនប្រចាំថ្ងៃ</p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><strong>មុខវិជ្ជា៖</strong> {selectedPlan.subject}</div>
                <div><strong>ថ្នាក់ទី៖</strong> {selectedPlan.grade} «{selectedPlan.section}»</div>
                <div><strong>កាលបរិច្ឆេទ៖</strong> {selectedPlan.teachingDate}</div>
                <div><strong>រយៈពេល៖</strong> {selectedPlan.durationMinutes} នាទី</div>
              </div>

              {/* Objectives */}
              <div className="space-y-2 border border-slate-200 rounded-lg p-3">
                <h4 className="font-bold text-blue-900 font-moul">I. វត្ថុបំណងមេរៀន (Objectives)</h4>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                  <li><strong>វិស័យចំណេះដឹង៖</strong> {selectedPlan.objectives.knowledge}</li>
                  <li><strong>វិស័យបំណិន៖</strong> {selectedPlan.objectives.skills}</li>
                  <li><strong>វិស័យឥរិយាបថ៖</strong> {selectedPlan.objectives.attitude}</li>
                </ul>
              </div>

              {/* Teaching Aids */}
              <div className="border border-slate-200 rounded-lg p-3">
                <h4 className="font-bold text-blue-900 font-moul">II. សម្ភារៈឧបទេសបង្រៀន (Teaching Aids)</h4>
                <p className="pl-2 pt-1 text-slate-700">{selectedPlan.teachingAids}</p>
              </div>

              {/* 5 Steps Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <h4 className="font-bold text-blue-900 font-moul p-3 bg-slate-50 border-b border-slate-200">
                  III. ដំណើរការបង្រៀន (៥ ជំហានគរុកោសល្យ)
                </h4>
                <div className="divide-y divide-slate-200">
                  <div className="p-3">
                    <p className="font-bold text-slate-900">ជំហានទី១៖ រដ្ឋបាលថ្នាក់ (Class Management)</p>
                    <p className="pl-3 pt-1 text-slate-700">{selectedPlan.steps.step1ClassManagement}</p>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-900">ជំហានទី២៖ រំលឹកមេរៀនចាស់ (Review)</p>
                    <p className="pl-3 pt-1 text-slate-700">{selectedPlan.steps.step2ReviewOldLesson}</p>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-900">ជំហានទី៣៖ មេរៀនថ្មី (New Lesson & Activities)</p>
                    <p className="pl-3 pt-1 text-slate-700">{selectedPlan.steps.step3NewLesson}</p>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-900">ជំហានទី៤៖ ពង្រឹងចំណេះដឹង (Consolidation)</p>
                    <p className="pl-3 pt-1 text-slate-700">{selectedPlan.steps.step4Consolidation}</p>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-900">ជំហានទី៥៖ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ (Homework & Moral)</p>
                    <p className="pl-3 pt-1 text-slate-700">{selectedPlan.steps.step5HomeworkAndAdvice}</p>
                  </div>
                </div>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 pt-6 text-center text-xs">
                <div>
                  <p className="font-bold">បានឃើញ និងអនុម័ត</p>
                  <p className="text-slate-500">នាយកសាលា / នាយករង</p>
                  <div className="h-16"></div>
                  <p className="font-bold font-moul text-slate-800">លោក ចាន់ វុទ្ធី</p>
                </div>
                <div>
                  <p className="font-bold">ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២៦</p>
                  <p className="text-slate-500">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-16"></div>
                  <p className="font-bold font-moul text-slate-800">ហត្ថលេខាគ្រូបង្រៀន</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LESSON PLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 font-moul text-base">
                បង្កើតកិច្ចតែងការបង្រៀនថ្មី (MoEYS 5 Steps)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">មុខវិជ្ជា៖</label>
                  <select
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="ភាសាខ្មែរ">ភាសាខ្មែរ</option>
                    <option value="គណិតវិទ្យា">គណិតវិទ្យា</option>
                    <option value="វិទ្យាសាស្ត្រ">វិទ្យាសាស្ត្រ</option>
                    <option value="សិក្សាសង្គម">សិក្សាសង្គម</option>
                    <option value="អប់រំកាយ/សិល្បៈ">អប់រំកាយ/សិល្បៈ</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">មេរៀនទី៖</label>
                  <input
                    type="text"
                    value={formLessonNumber}
                    onChange={e => setFormLessonNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    placeholder="មេរៀនទី..."
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">កាលបរិច្ឆេទបង្រៀន៖</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ចំណងជើងមេរៀន (Lesson Title)៖</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  placeholder="ឧ. ការតែងសេចក្តីពណ៌នារូបរាងមនុស្ស..."
                  required
                />
              </div>

              {/* Objectives */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800">វត្ថុបំណង ៣ វិស័យ៖</p>
                <input
                  type="text"
                  value={formKnowledge}
                  onChange={e => setFormKnowledge(e.target.value)}
                  placeholder="ចំណេះដឹង៖ សិស្សកំណត់បាននូវ..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formSkills}
                  onChange={e => setFormSkills(e.target.value)}
                  placeholder="បំណិន៖ សិស្សអាចសរសេរ/ដោះស្រាយ..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formAttitude}
                  onChange={e => setFormAttitude(e.target.value)}
                  placeholder="ឥរិយាបថ៖ បណ្តុះស្មារតី..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              {/* 5 Steps */}
              <div className="space-y-2">
                <p className="font-bold text-slate-800">ដំណើរការបង្រៀន (៥ ជំហាន)៖</p>
                <input
                  type="text"
                  value={step1}
                  onChange={e => setStep1(e.target.value)}
                  placeholder="ជំហានទី១៖ រដ្ឋបាលថ្នាក់..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={step2}
                  onChange={e => setStep2(e.target.value)}
                  placeholder="ជំហានទី២៖ រំលឹកមេរៀនចាស់..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={step3}
                  onChange={e => setStep3(e.target.value)}
                  placeholder="ជំហានទី៣៖ មេរៀនថ្មី..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={step4}
                  onChange={e => setStep4(e.target.value)}
                  placeholder="ជំហានទី៤៖ ពង្រឹងចំណេះដឹង..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={step5}
                  onChange={e => setStep5(e.target.value)}
                  placeholder="ជំហានទី៥៖ បណ្តាំផ្ញើ និងកិច្ចការផ្ទះ..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  រក្សាទុក និងស្នើសុំអនុម័ត
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
