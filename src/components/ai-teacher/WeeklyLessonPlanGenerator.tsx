import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Clock, 
  UserCheck, 
  Sliders, 
  FileSpreadsheet, 
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Save,
  Check,
  Eye,
  Info,
  ShieldCheck
} from 'lucide-react';
import { 
  AIWeeklyLessonPlan, 
  WeeklyLessonPlanFormInput, 
  WeeklyLessonDayItem, 
  StudentLevel, 
  TeachingStyle 
} from './types';
import { generateAIWeeklyLessonPlan, saveAICreation } from '../../services/aiTeacherService';
import { useSchool } from '../../context/SchoolContext';
import { CurriculumStandardsAuditModal } from './CurriculumStandardsAuditModal';
import { validateMoEYSLessonPlan } from '../../services/curriculumValidationService';

interface Props {
  initialPlan?: AIWeeklyLessonPlan;
  onSaved?: () => void;
}

export const WeeklyLessonPlanGenerator: React.FC<Props> = ({ initialPlan, onSaved }) => {
  const { schoolProfile, showToast, currentUser } = useSchool();

  // Form State
  const [formData, setFormData] = useState<WeeklyLessonPlanFormInput>({
    subject: 'ភាសាខ្មែរ',
    grade: 5,
    weekNumber: 6,
    semester: 'semester_1',
    academicYear: '២០២៤-២០២៥',
    themeUnit: 'មេរៀនទី ៦៖ ការរស់នៅប្រកបដោយសីលធម៌ និងបរិស្ថានស្អាត',
    teachingDaysCount: 5,
    periodsPerDay: 2,
    studentLevel: 'average',
    teachingStyle: 'interactive',
    curriculumReference: 'កម្មវិធីសិក្សាលម្អិតបឋមសិក្សា ក្រសួងអប់រំ យុវជន និងកីឡា',
    coreObjectives: 'សិស្សយល់ដឹងពីខ្លឹមសារមេរៀន ចេះសរសេររៀបរាប់ និងអនុវត្តវិធានអនាម័យក្នុងជីវភាពរស់នៅ',
    materialsInClass: 'សៀវភៅពុម្ព, ក្តារខៀន, ក្តារឆ្នួន, ប័ណ្ណពាក្យ និងរូបភាពគំនូរជីវចល'
  });

  // Main Weekly Plan State
  const [weeklyPlan, setWeeklyPlan] = useState<AIWeeklyLessonPlan | null>(initialPlan || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeDayTab, setActiveDayTab] = useState<number>(0); // 0 = Day 1, or -1 = All Days
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const subjectsList = [
    'ភាសាខ្មែរ',
    'គណិតវិទ្យា',
    'វិទ្យាសាស្ត្រ',
    'សិក្សាសង្គម',
    'ភាសាអង់គ្លេស',
    'សិល្បៈ និងតន្ត្រី',
    'អប់រំកាយ និងកីឡា',
    'បំណិនជីវិត'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAIWeeklyLessonPlan(formData);
      setWeeklyPlan(generated);
      setActiveDayTab(0);
      showToast('បានបង្កើតកិច្ចតែងការប្រចាំសប្តាហ៍ដោយជោគជ័យ!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('មានបញ្ហាក្នុងការបង្កើតកិច្ចតែងការ៖ ' + (err.message || 'សូមព្យាយាមម្តងទៀត'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!weeklyPlan) return;
    saveAICreation({
      id: weeklyPlan.id,
      type: 'weekly_lesson',
      typeNameKh: 'កិច្ចតែងការប្រចាំសប្តាហ៍ (Weekly Lesson)',
      title: weeklyPlan.title,
      subject: weeklyPlan.subject,
      grade: weeklyPlan.grade,
      createdAt: weeklyPlan.createdAt,
      updatedAt: new Date().toISOString(),
      payload: weeklyPlan
    });
    showToast('បានរក្សាទុកកិច្ចតែងការក្នុងប្រវត្តិឯកសារ AI រួចរាល់!', 'success');
    if (onSaved) onSaved();
  };

  const handleDayFieldChange = (dayIndex: number, path: string, value: any) => {
    if (!weeklyPlan) return;
    const updatedDays = [...weeklyPlan.days];
    const target = { ...updatedDays[dayIndex] };

    if (path.startsWith('objectives.')) {
      const key = path.split('.')[1] as 'knowledge' | 'skills' | 'attitude';
      target.objectives = { ...target.objectives, [key]: value };
    } else if (path.startsWith('teachingSteps.')) {
      const key = path.split('.')[1] as 'step1_admin' | 'step2_review' | 'step3_newLesson' | 'step4_consolidation' | 'step5_homework';
      target.teachingSteps = { ...target.teachingSteps, [key]: value };
    } else if (path.startsWith('differentiatedSupport.')) {
      const key = path.split('.')[1] as 'slowLearners' | 'fastLearners';
      target.differentiatedSupport = { ...target.differentiatedSupport, [key]: value };
    } else {
      (target as any)[path] = value;
    }

    updatedDays[dayIndex] = target;
    setWeeklyPlan({
      ...weeklyPlan,
      days: updatedDays,
      updatedAt: new Date().toISOString()
    });
  };

  const handleExportJSON = () => {
    if (!weeklyPlan) return;
    const blob = new Blob([JSON.stringify(weeklyPlan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Weekly_Lesson_Plan_Grade_${weeklyPlan.grade}_Week_${weeklyPlan.weekNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('បានទាញយកឯកសារ JSON រួចរាល់!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-300">
                <Calendar className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                MoEYS Standard Pedagogical Sequence (គរុកោសល្យ ៥ ជំហាន)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-moul text-white">
              បង្កើតកិច្ចតែងការប្រចាំសប្តាហ៍ (AI Weekly Lesson Plan)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              រៀបចំគម្រោងបង្រៀនប្រចាំសប្តាហ៍ (ថ្ងៃចន្ទ ដល់ ថ្ងៃសុក្រ/សៅរ៍) ដោយស្វ័យប្រវត្តិតាមកម្រិតថ្នាក់ មុខវិជ្ជា និងសប្តាហ៍សិក្សាផ្លូវការ
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* MoEYS Curriculum Standards & sala.moeys.gov.kh Audit Button */}
            <button
              type="button"
              id="audit-moeys-standards-btn"
              onClick={() => setIsAuditModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ring-2 ring-amber-300/30"
              title="ផ្ទៀងផ្ទាត់ស្តង់ដារកម្មវិធីសិក្សា និងសៀវភៅពុម្ពជាតិ MoEYS & sala.moeys.gov.kh"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>ស្តង់ដារ MoEYS & sala.moeys.gov.kh</span>
            </button>

            {weeklyPlan && (
              <>
                <button
                  type="button"
                  id="print-weekly-plan-btn"
                  onClick={() => setShowPrintModal(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span>បោះពុម្ពទម្រង់ផ្លូវការ</span>
                </button>
                <button
                  type="button"
                  id="save-weekly-plan-btn"
                  onClick={handleSaveToHistory}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកក្នុងប្រព័ន្ធ</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Plan Content Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Settings Panel */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                កំណត់ប៉ារ៉ាម៉ែត្រកិច្ចតែងការ (Plan Setup)
              </h3>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">មុខវិជ្ជា</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Grade & Week */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">សប្តាហ៍សិក្សា</label>
                <select
                  value={formData.weekNumber}
                  onChange={(e) => setFormData({ ...formData, weekNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>សប្តាហ៍ទី {w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Semester & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឆមាស</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="semester_1">ឆមាសទី ១</option>
                  <option value="semester_2">ឆមាសទី ២</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឆ្នាំសិក្សា</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Days & Periods */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ចំនួនថ្ងៃបង្រៀន</label>
                <select
                  value={formData.teachingDaysCount}
                  onChange={(e) => setFormData({ ...formData, teachingDaysCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={5}>៥ ថ្ងៃ (ចន្ទ - សុក្រ)</option>
                  <option value={6}>៦ ថ្ងៃ (ចន្ទ - សៅរ៍)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ម៉ោងក្នុងមួយថ្ងៃ</label>
                <select
                  value={formData.periodsPerDay}
                  onChange={(e) => setFormData({ ...formData, periodsPerDay: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={1}>១ ម៉ោង (៤៥ នាទី)</option>
                  <option value={2}>២ ម៉ោង (៩០ នាទី)</option>
                  <option value={3}>៣ ម៉ោង</option>
                  <option value={4}>៤ ម៉ោង</option>
                </select>
              </div>
            </div>

            {/* Theme & Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ប្រធានបទធំ / មេរៀនប្រចាំសប្តាហ៍
              </label>
              <textarea
                rows={2}
                value={formData.themeUnit}
                onChange={(e) => setFormData({ ...formData, themeUnit: e.target.value })}
                placeholder="ឧ. មេរៀនទី ៦៖ ការរស់នៅប្រកបដោយសីលធម៌ និងបរិស្ថានស្អាត"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Core Objectives */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                វត្ថុបំណងចម្បងនៃសប្តាហ៍
              </label>
              <textarea
                rows={2}
                value={formData.coreObjectives}
                onChange={(e) => setFormData({ ...formData, coreObjectives: e.target.value })}
                placeholder="វត្ថុបំណងចំណេះដឹង បំណិន និងឥរិយាបថ..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Student Level & Teaching Style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតសិស្ស</label>
                <select
                  value={formData.studentLevel}
                  onChange={(e) => setFormData({ ...formData, studentLevel: e.target.value as StudentLevel })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="average">កម្រិតមធ្យម</option>
                  <option value="mixed">ចម្រុះសមត្ថភាព</option>
                  <option value="beginner">ត្រូវការជំនួយបន្ថែម</option>
                  <option value="advanced">កម្រិតខ្ពស់/ពូកែ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">វិធីសាស្ត្របង្រៀន</label>
                <select
                  value={formData.teachingStyle}
                  onChange={(e) => setFormData({ ...formData, teachingStyle: e.target.value as TeachingStyle })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="interactive">អន្តរកម្ម & សកម្ម</option>
                  <option value="visual">រូបភាព & ឧបករណ៍</option>
                  <option value="discussion">ពិភាក្សា & ក្រុម</option>
                  <option value="traditional">បែបបុរាណពន្យល់</option>
                </select>
              </div>
            </div>

            {/* Materials */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">សម្ភារឧបទេសបង្រៀន</label>
              <input
                type="text"
                value={formData.materialsInClass}
                onChange={(e) => setFormData({ ...formData, materialsInClass: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              id="generate-weekly-plan-submit-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isGenerating
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងបង្កើតកិច្ចតែងការ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ បង្កើតកិច្ចតែងការប្រចាំសប្តាហ៍</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Plan View / Editor Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {!weeklyPlan ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  សូមជ្រើសរើសមុខវិជ្ជា និងចុច "បង្កើតកិច្ចតែងការប្រចាំសប្តាហ៍"
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  ប្រព័ន្ធ AI នឹងរៀបចំកិច្ចតែងការប្រចាំថ្ងៃ ៥ ជំហាន (រដ្ឋបាល រំលឹក មេរៀនថ្មី ពង្រឹង និងកិច្ចការផ្ទះ) ពេញមួយសប្តាហ៍ជូនលោកគ្រូ-អ្នកគ្រូ
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs inline-flex items-center gap-2 shadow transition-transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>បង្កើតកិច្ចតែងការគំរូភ្លាមៗ</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              {/* Weekly Header Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                        សប្តាហ៍ទី {weeklyPlan.weekNumber}
                      </span>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full">
                        ថ្នាក់ទី {weeklyPlan.grade}
                      </span>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        {weeklyPlan.totalPeriods} ម៉ោងបង្រៀន
                      </span>
                    </div>
                    <h3 className="text-base font-bold font-moul text-blue-950 mt-1">
                      {weeklyPlan.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="ទាញយកជាឯកសារ JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrintModal(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>មើលទម្រង់បោះពុម្ព</span>
                    </button>
                  </div>
                </div>

                {/* General Objectives Triad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      🧠 ចំណេះដឹង (Knowledge)
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {weeklyPlan.generalObjectives[0]?.replace(/^ចំណេះដឹង៖\s*/, '') || 'យល់ដឹងពីទ្រឹស្តី និងក្បួនខ្នាតមេរៀន'}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                      ✍️ បំណិន (Skills)
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {weeklyPlan.generalObjectives[1]?.replace(/^បំណិន៖\s*/, '') || 'ចេះអនុវត្ត ដោះស្រាយលំហាត់ និងកិច្ចការជាក់ស្តែង'}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                      ❤️ ឥរិយាបថ (Attitude)
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {weeklyPlan.generalObjectives[2]?.replace(/^ឥរិយាបថ៖\s*/, '') || 'បណ្តុះស្មារតីឧស្សាហ៍ព្យាយាម និងសីលធម៌ល្អ'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Day Tab Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {weeklyPlan.days.map((day, idx) => (
                  <button
                    key={day.id || idx}
                    type="button"
                    onClick={() => setActiveDayTab(idx)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeDayTab === idx
                        ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-700/30'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{day.dayNameKh}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeDayTab === idx ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {day.periodsCount}h
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setActiveDayTab(-1)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeDayTab === -1
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  មើលទាំងអស់ (Full Week)
                </button>
              </div>

              {/* Day Content Rendering */}
              {activeDayTab === -1 ? (
                /* Full Week List */
                <div className="space-y-4">
                  {weeklyPlan.days.map((day, idx) => (
                    <DayPlanCard 
                      key={day.id || idx} 
                      day={day} 
                      dayIndex={idx} 
                      onChange={handleDayFieldChange} 
                    />
                  ))}
                </div>
              ) : (
                /* Single Active Day */
                weeklyPlan.days[activeDayTab] && (
                  <DayPlanCard
                    day={weeklyPlan.days[activeDayTab]}
                    dayIndex={activeDayTab}
                    onChange={handleDayFieldChange}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Official MoEYS Printable Weekly Plan Modal */}
      {showPrintModal && weeklyPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  ទម្រង់កិច្ចតែងការបង្រៀនប្រចាំសប្តាហ៍ផ្លូវការ (MoEYS Standard Format)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ព (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  បិទ
                </button>
              </div>
            </div>

            {/* Printable Paper Content */}
            <div className="space-y-6 text-slate-900 border p-6 rounded-2xl bg-white">
              {/* National Header */}
              <div className="text-center space-y-1">
                <h4 className="font-moul text-sm">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                <p className="font-moul text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="flex justify-center my-1">
                  <span className="border-b-2 border-dashed border-slate-400 w-24 block" />
                </div>
              </div>

              {/* School Header */}
              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-bold">មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្ត/រាជធានី</p>
                  <p className="font-bold">ការិយាល័យអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-bold text-blue-900">{schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពេញ'}</p>
                </div>
                <div className="text-right">
                  <p>ឆ្នាំសិក្សា៖ <span className="font-bold">{weeklyPlan.academicYear}</span></p>
                  <p>ឆមាស៖ <span className="font-bold">{weeklyPlan.semester === 'semester_1' ? 'ទី ១' : 'ទី ២'}</span></p>
                  <p>សប្តាហ៍ទី៖ <span className="font-bold">{weeklyPlan.weekNumber}</span></p>
                </div>
              </div>

              <div className="text-center py-2 bg-slate-100 rounded-xl">
                <h3 className="font-moul text-sm text-slate-900">
                  កិច្ចតែងការបង្រៀនប្រចាំសប្តាហ៍ទី {weeklyPlan.weekNumber}
                </h3>
                <p className="text-xs font-bold text-slate-700">
                  មុខវិជ្ជា៖ {weeklyPlan.subject} | ថ្នាក់ទី {weeklyPlan.grade} | ប្រធានបទ៖ {weeklyPlan.themeUnit}
                </p>
              </div>

              {/* Day-by-Day Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="border border-slate-300 p-2 w-24 text-center">ថ្ងៃ/ម៉ោង</th>
                      <th className="border border-slate-300 p-2 min-w-[140px]">ចំណងជើងមេរៀន</th>
                      <th className="border border-slate-300 p-2 min-w-[200px]">វត្ថុបំណង (ចំណេះដឹង បំណិន ឥរិយាបថ)</th>
                      <th className="border border-slate-300 p-2 min-w-[260px]">ដំណើរការបង្រៀន (៥ ជំហានគរុកោសល្យ)</th>
                      <th className="border border-slate-300 p-2 min-w-[120px]">សម្ភារ & វាយតម្លៃ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyPlan.days.map((day) => (
                      <tr key={day.id} className="align-top">
                        <td className="border border-slate-300 p-2 text-center font-bold bg-slate-50/50">
                          {day.dayNameKh}
                          <span className="block font-normal text-[10px] text-slate-500 mt-1">({day.periodsCount} ម៉ោង)</span>
                        </td>
                        <td className="border border-slate-300 p-2">
                          <p className="font-bold text-slate-900">{day.topicTitle}</p>
                          <span className="text-[10px] text-slate-600 block mt-1">{day.lessonNumber}</span>
                        </td>
                        <td className="border border-slate-300 p-2 space-y-1">
                          <p><strong className="text-emerald-800">ច/ដ៖</strong> {day.objectives.knowledge}</p>
                          <p><strong className="text-blue-800">បំណិន៖</strong> {day.objectives.skills}</p>
                          <p><strong className="text-amber-800">ឥរិយា៖</strong> {day.objectives.attitude}</p>
                        </td>
                        <td className="border border-slate-300 p-2 space-y-1.5">
                          <p className="text-[11px]"><strong>ជំហានទី១ (រដ្ឋបាល)៖</strong> {day.teachingSteps.step1_admin}</p>
                          <p className="text-[11px]"><strong>ជំហានទី២ (រំលឹក)៖</strong> {day.teachingSteps.step2_review}</p>
                          <p className="text-[11px]"><strong>ជំហានទី៣ (មេរៀនថ្មី)៖</strong> {day.teachingSteps.step3_newLesson}</p>
                          <p className="text-[11px]"><strong>ជំហានទី៤ (ពង្រឹង)៖</strong> {day.teachingSteps.step4_consolidation}</p>
                          <p className="text-[11px]"><strong>ជំហានទី៥ (កិច្ចការផ្ទះ)៖</strong> {day.teachingSteps.step5_homework}</p>
                        </td>
                        <td className="border border-slate-300 p-2 space-y-1.5">
                          <div>
                            <span className="font-bold text-[10px] text-slate-600 block">សម្ភារ៖</span>
                            <span className="text-[11px]">{day.materials.join(', ')}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[10px] text-slate-600 block">វាយតម្លៃ៖</span>
                            <span className="text-[11px]">{day.assessmentMethod}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs">
                <div>
                  <p className="font-bold">បានឃើញ និងឯកភាព</p>
                  <p className="font-moul mt-1">នាយកសាលា</p>
                  <div className="h-20" />
                  <p className="font-bold">{schoolProfile.principalName || 'នាយកសាលាបឋមសិក្សា'}</p>
                </div>
                <div>
                  <p>ថ្ងៃ...................ខែ............ឆ្នាំ.............</p>
                  <p className="font-moul mt-1">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-20" />
                  <p className="font-bold">{currentUser?.name || 'លោកគ្រូ/អ្នកគ្រូ'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MoEYS Standards & sala.moeys.gov.kh Audit Modal */}
      <CurriculumStandardsAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        lessonPlanData={{
          subject: weeklyPlan?.subject || formData.subject,
          grade: weeklyPlan?.grade || formData.grade,
          topic: weeklyPlan?.themeUnit || formData.themeUnit,
          objectives: weeklyPlan ? weeklyPlan.days.flatMap(d => [d.objectives.knowledge, d.objectives.skills, d.objectives.attitude]) : [formData.coreObjectives],
          activities: weeklyPlan ? weeklyPlan.days.map(d => ({
            stepTitle: d.topicTitle,
            teacherAction: `${d.teachingSteps.step1_admin} ${d.teachingSteps.step3_newLesson}`,
            studentAction: `${d.teachingSteps.step2_review} ${d.teachingSteps.step4_consolidation}`,
            purpose: d.teachingSteps.step5_homework
          })) : []
        }}
      />
    </div>
  );
};

/* Individual Day Plan Card Component */
interface DayCardProps {
  day: WeeklyLessonDayItem;
  dayIndex: number;
  onChange: (dayIndex: number, path: string, value: any) => void;
}

const DayPlanCard: React.FC<DayCardProps> = ({ day, dayIndex, onChange }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs">
            {day.dayNameKh}
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {day.topicTitle}
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {day.lessonNumber} • {day.periodsCount} ម៉ោង (Period {dayIndex * day.periodsCount + 1}-{dayIndex * day.periodsCount + day.periodsCount})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
        >
          {isExpanded ? 'បង្រួម' : 'ពង្រីក'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Objectives Triad */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>វត្ថុបំណងជាក់លាក់ប្រចាំថ្ងៃ (Daily Learning Objectives)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 block mb-1">🧠 ចំណេះដឹង</span>
                <textarea
                  rows={2}
                  value={day.objectives.knowledge}
                  onChange={(e) => onChange(dayIndex, 'objectives.knowledge', e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-blue-800 block mb-1">✍️ បំណិន</span>
                <textarea
                  rows={2}
                  value={day.objectives.skills}
                  onChange={(e) => onChange(dayIndex, 'objectives.skills', e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-800 block mb-1">❤️ ឥរិយាបថ</span>
                <textarea
                  rows={2}
                  value={day.objectives.attitude}
                  onChange={(e) => onChange(dayIndex, 'objectives.attitude', e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* MoEYS 5-Step Teaching Procedure */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>ដំណើរការបង្រៀនតាមគរុកោសល្យ ៥ ជំហាន (MoEYS 5 Steps)</span>
            </label>

            {/* Step 1 */}
            <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-800 block">
                ជំហានទី១៖ រដ្ឋបាលថ្នាក់ (Class Administration & Hygiene)
              </span>
              <textarea
                rows={2}
                value={day.teachingSteps.step1_admin}
                onChange={(e) => onChange(dayIndex, 'teachingSteps.step1_admin', e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-800 block">
                ជំហានទី២៖ រំលឹកមេរៀនចាស់ & ពិនិត្យកិច្ចការផ្ទះ (Review & Prior Knowledge)
              </span>
              <textarea
                rows={2}
                value={day.teachingSteps.step2_review}
                onChange={(e) => onChange(dayIndex, 'teachingSteps.step2_review', e.target.value)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-blue-900 block">
                ជំហានទី៣៖ ដំណើរការបង្រៀនមេរៀនថ្មី & សកម្មភាពសិស្ស (New Lesson & Active Learning)
              </span>
              <textarea
                rows={3}
                value={day.teachingSteps.step3_newLesson}
                onChange={(e) => onChange(dayIndex, 'teachingSteps.step3_newLesson', e.target.value)}
                className="w-full p-2 text-xs bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-emerald-900 block">
                ជំហានទី៤៖ ពង្រឹងចំណេះដឹង សំណួរ & លំហាត់ (Consolidation & Exercises)
              </span>
              <textarea
                rows={2}
                value={day.teachingSteps.step4_consolidation}
                onChange={(e) => onChange(dayIndex, 'teachingSteps.step4_consolidation', e.target.value)}
                className="w-full p-2 text-xs bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Step 5 */}
            <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-amber-900 block">
                ជំហានទី៥៖ បណ្តាំផ្ញើ អប់រំសីលធម៌ & កិច្ចការផ្ទះ (Moral Advice & Homework)
              </span>
              <textarea
                rows={2}
                value={day.teachingSteps.step5_homework}
                onChange={(e) => onChange(dayIndex, 'teachingSteps.step5_homework', e.target.value)}
                className="w-full p-2 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Differentiation & Materials Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-purple-900 block">
                💡 យុទ្ធសាស្ត្រគាំទ្រសិស្សខុសគ្នា (Differentiated Support)
              </span>
              <div>
                <span className="text-[10px] text-purple-800 font-bold block">សិស្សរៀនយឺត៖</span>
                <input
                  type="text"
                  value={day.differentiatedSupport.slowLearners}
                  onChange={(e) => onChange(dayIndex, 'differentiatedSupport.slowLearners', e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-purple-200 rounded-lg"
                />
              </div>
              <div>
                <span className="text-[10px] text-purple-800 font-bold block">សិស្សរៀនលឿន៖</span>
                <input
                  type="text"
                  value={day.differentiatedSupport.fastLearners}
                  onChange={(e) => onChange(dayIndex, 'differentiatedSupport.fastLearners', e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-purple-200 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                🎯 វិធីសាស្ត្រវាយតម្លៃ & សម្ភារឧបទេស
              </span>
              <div>
                <span className="text-[10px] text-slate-600 font-bold block">វិធីវាយតម្លៃ៖</span>
                <input
                  type="text"
                  value={day.assessmentMethod}
                  onChange={(e) => onChange(dayIndex, 'assessmentMethod', e.target.value)}
                  className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-bold block">សម្ភារប្រើប្រាស់ (ខណ្ឌដោយក្បៀស)៖</span>
                <input
                  type="text"
                  value={day.materials.join(', ')}
                  onChange={(e) => onChange(dayIndex, 'materials', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
