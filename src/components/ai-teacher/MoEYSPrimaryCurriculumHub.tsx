import React, { useState } from 'react';
import { 
  MOEYS_MODEL_SCHOOL_STANDARDS, 
  MOEYS_PRIMARY_CURRICULUM_DATABASE, 
  MOEYS_PRIMARY_SUBJECTS,
  getMoEYSSubjectCurriculum,
  MoEYSTextbookLesson
} from '../../data/moeysPrimaryCurriculum';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  Download, 
  Layers, 
  ChevronRight, 
  Search, 
  FileText, 
  Gamepad2, 
  HelpCircle, 
  Calendar,
  School,
  Sliders,
  Flame,
  ShieldCheck,
  Check,
  Globe,
  ExternalLink,
  Laptop,
  Video,
  Library,
  GraduationCap,
  BookmarkCheck,
  Compass
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';
import { useSchool } from '../../context/SchoolContext';
import { 
  MoEYSRoyalHeader, 
  AngkorPageWatermark, 
  SchoolStampCirclePlaceholder, 
  MoEYSOfficialDualSignatures 
} from '../AngkorMotif';
import { AITeacherSubTab } from './types';

interface Props {
  onNavigateToTab?: (tab: AITeacherSubTab, payload?: any) => void;
}

export const MoEYSPrimaryCurriculumHub: React.FC<Props> = ({ onNavigateToTab }) => {
  const { schoolProfile, showToast } = useSchool();

  // Active Hub View: 'curriculum_explorer' vs 'model_school_assessment' vs 'official_pedagogy_guide' vs 'sala_digital_portal'
  const [activeView, setActiveView] = useState<'curriculum_explorer' | 'model_school_assessment' | 'official_pedagogy_guide' | 'sala_digital_portal'>('curriculum_explorer');

  // Curriculum Filter State
  const [selectedSubject, setSelectedSubject] = useState<string>('ភាសាខ្មែរ');
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [selectedLesson, setSelectedLesson] = useState<MoEYSTextbookLesson | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Model School Assessment State: Map indicator id to score (1 to 5)
  const [indicatorScores, setIndicatorScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    MOEYS_MODEL_SCHOOL_STANDARDS.forEach(std => {
      std.indicators.forEach(ind => {
        initial[ind.id] = 4; // default good rating
      });
    });
    return initial;
  });

  const [assessmentNotes, setAssessmentNotes] = useState<Record<string, string>>({});
  const [isAssessmentPrintModalOpen, setIsAssessmentPrintModalOpen] = useState<boolean>(false);

  // Active Curriculum Data
  const currentCurriculum = getMoEYSSubjectCurriculum(selectedSubject, selectedGrade);

  // Filter lessons based on search
  const filteredChapters = currentCurriculum?.chapters.map(ch => ({
    ...ch,
    lessons: ch.lessons.filter(l => 
      !searchQuery.trim() || 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.keyConcepts.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(ch => ch.lessons.length > 0) || [];

  // Model School Score Calculations
  const totalIndicatorsCount = MOEYS_MODEL_SCHOOL_STANDARDS.reduce((acc, s) => acc + s.indicators.length, 0); // 27
  const maxPossibleScore = totalIndicatorsCount * 5; // 135 points

  const totalCalculatedScore = (Object.values(indicatorScores) as number[]).reduce((acc: number, sc: number) => acc + (Number(sc) || 0), 0);
  const scorePercentage = maxPossibleScore > 0 ? Math.round((totalCalculatedScore / maxPossibleScore) * 100) : 0;

  // Qualification Status according to MoEYS standards
  const getModelSchoolStatus = (pct: number) => {
    if (pct >= 85) return { label: 'សាលាបឋមសិក្សាគំរូ ឆ្នើម (កម្រិត៣)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (pct >= 70) return { label: 'សាលាបឋមសិក្សាគំរូ កម្រិតមធ្យម (កម្រិត២)', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (pct >= 50) return { label: 'សាលាបឋមសិក្សា កម្រិតមូលដ្ឋាន (កម្រិត១)', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { label: 'មិនទាន់ឆ្លងផុតស្ដង់ដាគំរូ (ត្រូវការកែលម្អ)', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  const statusInfo = getModelSchoolStatus(scorePercentage);

  const handlePrintAssessment = () => {
    printElement('moeys-model-school-assessment-print-area');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/40 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> ស្តង់ដាររដ្ឋបាល & គរុកោសល្យ MoEYS
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-200 text-xs rounded-full border border-blue-400/30">
                ថ្នាក់ទី១ ដល់ ទី៦
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-battambang text-white tracking-tight">
              មជ្ឈមណ្ឌលស្ដង់ដារបឋមសិក្សាគំរូ & កម្មវិធីសិក្សារដ្ឋ
            </h1>
            <p className="text-blue-200 text-sm max-w-3xl leading-relaxed">
              ប្រព័ន្ធណែនាំ AI អំពីកម្មវិធីសិក្សាគោល សៀវភៅពុម្ពផ្លូវការក្រសួង គរុកោសល្យ ៥ ជំហាន និងរបាយការណ៍ស្ដង់ដារសាលាបឋមសិក្សាគំរូ ៥ ស្តង់ដារ ២៧ សូចនាករ។
            </p>
          </div>

          {/* Quick Action Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-blue-400/20">
            <button
              onClick={() => setActiveView('curriculum_explorer')}
              className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeView === 'curriculum_explorer'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" /> សៀវភៅពុម្ព & កម្មវិធីសិក្សា
            </button>
            <button
              onClick={() => setActiveView('model_school_assessment')}
              className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeView === 'model_school_assessment'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4" /> ស្តង់ដារសាលាគំរូ (២៧ សូចនាករ)
            </button>
            <button
              onClick={() => setActiveView('official_pedagogy_guide')}
              className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeView === 'official_pedagogy_guide'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> គោលការណ៍គរុកោសល្យរដ្ឋ
            </button>
            <button
              onClick={() => setActiveView('sala_digital_portal')}
              className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeView === 'sala_digital_portal'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 font-bold'
                  : 'text-sky-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-4 h-4 text-sky-300" /> សាលាឌីជីថល MoEYS (sala.moeys.gov.kh)
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: OFFICIAL CURRICULUM & TEXTBOOK EXPLORER */}
      {activeView === 'curriculum_explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls: Subject & Grade Selection */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-blue-600" /> ជ្រើសរើសមុខវិជ្ជា & កម្រិតថ្នាក់
              </h2>

              {/* Grade Selector (1-6) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">កម្រិតថ្នាក់បឋមសិក្សា</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedGrade(g);
                        setSelectedLesson(null);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        selectedGrade === g
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      ថ្នាក់ទី {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">មុខវិជ្ជាផ្លូវការក្រសួង</label>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {MOEYS_PRIMARY_SUBJECTS.map(subj => (
                    <button
                      key={subj}
                      onClick={() => {
                        setSelectedSubject(subj);
                        setSelectedLesson(null);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                        selectedSubject === subj
                          ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold'
                          : 'hover:bg-slate-50 text-slate-700 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        {subj}
                      </span>
                      {selectedSubject === subj && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search in Curriculum */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">ស្វែងរកមេរៀន ឬពាក្យគន្លឹះ</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ឧ. ព្យញ្ជនៈ, គុណនាម, ប្រភាគ, អង្គរ..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Selected Subject Overview Card */}
            {currentCurriculum && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                      សៀវភៅសិក្សាគោល MoEYS
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{currentCurriculum.textbookTitle}</h3>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-white/80 p-3 rounded-xl border border-blue-100/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ម៉ោងបង្រៀនសរុបប្រចាំឆ្នាំ:</span>
                    <span className="font-bold text-slate-800">{currentCurriculum.totalAnnualHours} ម៉ោង</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ម៉ោងបង្រៀនក្នុងមួយសប្តាហ៍:</span>
                    <span className="font-bold text-slate-800">{currentCurriculum.periodsPerWeek} ម៉ោង/សប្តាហ៍</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">សមត្ថភាពស្នូល (Core Competency)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-blue-100/50">
                    {currentCurriculum.coreCompetency}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Content: Chapters & Lessons Navigator */}
          <div className="lg:col-span-8 space-y-6">
            {filteredChapters.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-base">មិនមានមេរៀនដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬជ្រើសរើសមុខវិជ្ជា និងកម្រិតថ្នាក់ផ្សេងទៀត។
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChapters.map((ch) => (
                  <div key={ch.chapterNumber} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {ch.chapterNumber}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm">{ch.chapterTitle}</h3>
                      </div>
                      <span className="text-xs text-slate-500">{ch.lessons.length} មេរៀន</span>
                    </div>

                    <div className="divide-y divide-slate-100 p-2">
                      {ch.lessons.map((lesson) => {
                        const isSelected = selectedLesson?.id === lesson.id;
                        return (
                          <div 
                            key={lesson.id}
                            className={`p-4 rounded-xl transition-all ${
                              isSelected ? 'bg-blue-50/60 ring-2 ring-blue-500/20' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                                    មេរៀនទី {lesson.lessonNumber}
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md font-mono">
                                    {lesson.pageRange}
                                  </span>
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md">
                                    {lesson.recommendedPeriods} ម៉ោងបង្រៀន
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                  {lesson.title}
                                </h4>
                                
                                {/* Triad Objectives Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 text-xs">
                                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="font-bold text-blue-700 block mb-0.5">🧠 ចំណេះដឹង:</span>
                                    <p className="text-slate-600 text-[11px] leading-relaxed">{lesson.objectives.knowledge}</p>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="font-bold text-emerald-700 block mb-0.5">🛠️ បំណិន:</span>
                                    <p className="text-slate-600 text-[11px] leading-relaxed">{lesson.objectives.skills}</p>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="font-bold text-amber-700 block mb-0.5">❤️ ឥរិយាបថ:</span>
                                    <p className="text-slate-600 text-[11px] leading-relaxed">{lesson.objectives.attitude}</p>
                                  </div>
                                </div>

                                {/* Key concepts tags */}
                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                  <span className="text-[11px] text-slate-500 font-medium">ពាក្យគន្លឹះ:</span>
                                  {lesson.keyConcepts.map((k, ki) => (
                                    <span key={ki} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-full">
                                      #{k}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Quick Generation Action Buttons */}
                              <div className="flex sm:flex-col items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                                <button
                                  onClick={() => {
                                    if (onNavigateToTab) {
                                      onNavigateToTab('weekly_lesson', {
                                        subject: selectedSubject,
                                        grade: selectedGrade,
                                        topic: lesson.title,
                                        materialsInClass: lesson.suggestedMaterials.join(', ')
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                  title="បង្កើតកិច្ចតែងការ ៥ ជំហានតាមស្តង់ដារក្រសួង"
                                >
                                  <Calendar className="w-3.5 h-3.5" /> កិច្ចតែងការ ៥ ជំហាន
                                </button>
                                <button
                                  onClick={() => {
                                    if (onNavigateToTab) {
                                      onNavigateToTab('educational_game', {
                                        subject: selectedSubject,
                                        grade: selectedGrade,
                                        topic: lesson.title,
                                        gameType: lesson.suggestedGameTemplate || 'classroom_competition'
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                  title="បង្កើតល្បែងសិក្សាស្របតាមមេរៀននេះ"
                                >
                                  <Gamepad2 className="w-3.5 h-3.5" /> ល្បែងសិក្សា
                                </button>
                                <button
                                  onClick={() => {
                                    if (onNavigateToTab) {
                                      onNavigateToTab('test_generator', {
                                        subject: selectedSubject,
                                        grade: selectedGrade,
                                        topic: lesson.title
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                  title="បង្កើតវិញ្ញាសាតេស្តស្របតាមមេរៀននេះ"
                                >
                                  <FileText className="w-3.5 h-3.5" /> វិញ្ញាសាតេស្ត
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MOEYS MODEL PRIMARY SCHOOL ASSESSMENT (5 STANDARDS & 27 INDICATORS) */}
      {activeView === 'model_school_assessment' && (
        <div className="space-y-6">
          {/* Assessment Header & Score Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                  តារាងស្ទង់មតិ & វាយតម្លៃស្វ័យប្រវត្តិ
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 font-battambang">
                ការវាយតម្លៃស្ដង់ដារសាលាបឋមសិក្សាគំរូ (៥ ស្ដង់ដារ ២៧ សូចនាករ)
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                ផ្អែកតាមសេចក្តីណែនាំស្តីពីការអនុវត្តស្តង់ដារសាលាបឋមសិក្សាគំរូ របស់ក្រសួងអប់រំ យុវជន និងកីឡា។ ពិន្ទុអតិបរមា ១៣៥ ពិន្ទុ (សូចនាករនីមួយៗពិន្ទុពី ១ ដល់ ៥)។
              </p>
            </div>

            {/* Score Metric Circle */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                  {totalCalculatedScore} <span className="text-sm font-normal text-slate-400">/ {maxPossibleScore}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-500">ពិន្ទុសរុប ({scorePercentage}%)</div>
              </div>

              <button
                onClick={handlePrintAssessment}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" /> បោះពុម្ពរបាយការណ៍ផ្លូវការ
              </button>
            </div>
          </div>

          {/* 5 Standards Expansion List */}
          <div className="space-y-6">
            {MOEYS_MODEL_SCHOOL_STANDARDS.map((standard) => {
              const standardScore = standard.indicators.reduce((sum, ind) => sum + (indicatorScores[ind.id] || 0), 0);
              const maxStdScore = standard.indicators.length * 5;
              const stdPct = Math.round((standardScore / maxStdScore) * 100);

              return (
                <div key={standard.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Standard Card Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-500/30 text-blue-200 text-xs font-bold rounded-full">
                          {standard.titleEn}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold font-battambang mt-1">
                        {standard.titleKh}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">{standard.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold text-amber-400">
                        {standardScore} / {maxStdScore}
                      </div>
                      <div className="text-[10px] text-slate-300">ពិន្ទុស្តង់ដារ ({stdPct}%)</div>
                    </div>
                  </div>

                  {/* Indicators Table */}
                  <div className="divide-y divide-slate-100">
                    {standard.indicators.map((ind) => {
                      const currentScore = indicatorScores[ind.id] || 4;

                      return (
                        <div key={ind.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md">
                                  {ind.indicatorNumber}
                                </span>
                                <h4 className="font-bold text-slate-800 text-sm">
                                  {ind.indicatorTitle}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{ind.description}</p>

                              {/* Criteria levels description */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 text-[11px]">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                                  <span className="font-bold text-amber-700 block">កម្រិត១ (១-២ ពិន្ទុ):</span>
                                  <p className="text-slate-600 mt-0.5">{ind.criteriaLevel1}</p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                                  <span className="font-bold text-blue-700 block">កម្រិត២ (៣-៤ ពិន្ទុ):</span>
                                  <p className="text-slate-600 mt-0.5">{ind.criteriaLevel2}</p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                                  <span className="font-bold text-emerald-700 block">កម្រិត៣ (៥ ពិន្ទុ - ឆ្នើម):</span>
                                  <p className="text-slate-600 mt-0.5">{ind.criteriaLevel3}</p>
                                </div>
                              </div>

                              {/* Evidence requirements */}
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[10px] font-bold text-slate-500">ភស្តុតាងចាំបាច់:</span>
                                {ind.evidenceRequired.map((ev, evi) => (
                                  <span key={evi} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] rounded-full">
                                    ✓ {ev}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Score selector buttons 1 to 5 */}
                            <div className="shrink-0 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                              <label className="block text-[10px] font-bold text-slate-600">ពិន្ទុវាយតម្លៃ</label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((pts) => (
                                  <button
                                    key={pts}
                                    onClick={() => {
                                      setIndicatorScores(prev => ({ ...prev, [ind.id]: pts }));
                                      showToast(`បានដាក់ពិន្ទុ ${pts}/5 សម្រាប់ ${ind.indicatorNumber}`);
                                    }}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                                      currentScore === pts
                                        ? pts === 5
                                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                                          : pts >= 3
                                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                                          : 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    {pts}
                                  </button>
                                ))}
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500 block">
                                {currentScore === 5 ? 'កម្រិត៣ (ឆ្នើម)' : currentScore >= 3 ? 'កម្រិត២ (មធ្យម)' : 'កម្រិត១ (មូលដ្ឋាន)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: OFFICIAL PEDAGOGY GUIDELINES (គរុកោសល្យ ៥ ជំហាន និង ៩ ជំហាន) */}
      {activeView === 'official_pedagogy_guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: 5-Step Lesson Plan Structure */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                ៥
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">កិច្ចតែងការបង្រៀន ៥ ជំហាន (ស្តង់ដាររដ្ឋបឋមសិក្សា)</h3>
                <p className="text-xs text-slate-500">គំរូផ្លូវការសម្រាប់គ្រូបង្រៀនប្រចាំថ្ងៃ និងប្រចាំសប្តាហ៍</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">ជំហានទី១៖ រដ្ឋបាលថ្នាក់ (Class Administration)</span>
                <p className="text-slate-600">ពិនិត្យវត្តមាន អនាម័យ សម្លៀកបំពាក់ តុ កៅអី និងពង្រឹងវិន័យស្មារតីសិស្សមុនចូលរៀន។</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">ជំហានទី២៖ រំលឹកមេរៀនចាស់ (Reviewing Previous Lesson)</span>
                <p className="text-slate-600">សួរនាំមេរៀនពីមុន កែកិច្ចការផ្ទះ និងភ្ជាប់ទំនាក់ទំនងទៅនឹងមេរៀនថ្មី។</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">ជំហានទី៣៖ ដំណើរការបង្រៀនមេរៀនថ្មី (New Lesson Delivery)</span>
                <p className="text-slate-600">សកម្មភាពគ្រូ-សិស្ស ពន្យល់ទ្រឹស្តី ប្រើសម្ភារឧបទេស ពិភាក្សាជាក្រុម និងល្បែងសិក្សា។</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">ជំហានទី៤៖ ពង្រឹងពុទ្ធិ (Consolidation & Assessment)</span>
                <p className="text-slate-600">សំណួរវាស់ការយល់ដឹង លំហាត់អនុវត្តលើក្តារឆ្នួន និងការសង្ខេបចំណុចគន្លឹះ។</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">ជំហានទី៥៖ បណ្តាំផ្ញើ & កិច្ចការផ្ទះ (Moral Guidance & Homework)</span>
                <p className="text-slate-600">អប់រំសីលធម៌ អនាម័យ ការការពារខ្លួន និងដាក់កិច្ចការផ្ទះឱ្យសិស្សអនុវត្ត។</p>
              </div>
            </div>
          </div>

          {/* Card 2: Triad Objectives & Differentiated Learning */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
                🎯
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">គោលបំណងត្រីវិមាត្រ & ការគាំទ្រសិស្ស</h3>
                <p className="text-xs text-slate-500">ស្តង់ដារកំណត់គោលបំណង និងការបង្រៀនសិស្សរៀនយឺត</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-800 block mb-1">១. វិជ្ជាសម្បទា (ចំណេះដឹង - Knowledge)</span>
                <p className="text-slate-600">កំណត់នូវអ្វីដែលសិស្សត្រូវដឹង ស្គាល់ ចងចាំ និងយល់ច្បាស់ក្រោយរៀនចប់។</p>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-800 block mb-1">២. បំណិនសម្បទា (បំណិន - Skills)</span>
                <p className="text-slate-600">កំណត់នូវអ្វីដែលសិស្សអាចធ្វើបាន គណនាបាន សរសេរបាន គូរបាន និងអនុវត្តជាក់ស្តែង។</p>
              </div>
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-800 block mb-1">៣. ចរិយាសម្បទា (ឥរិយាបថ - Attitude)</span>
                <p className="text-slate-600">បណ្តុះស្មារតីស្រឡាញ់ជាតិ សីលធម៌ សាមគ្គីភាព ការគោរពវិន័យ និងបរិស្ថាន។</p>
              </div>
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-800 block mb-1">៤. ការគាំទ្រសិស្សរៀនយឺត (Differentiated Support)</span>
                <p className="text-slate-600">គ្រូត្រូវមានវិធីសាស្ត្រជួយសិស្សយឺតដោយប្រើប័ណ្ណរូបភាព សម្ភាររូបី និងការបំប៉នបន្ថែម។</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MOEYS SALA DIGITAL PORTAL (sala.moeys.gov.kh) INTEGRATION */}
      {activeView === 'sala_digital_portal' && (
        <div className="space-y-6">
          {/* Main Hero Card for Sala Digital */}
          <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-sky-600/30 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full border border-sky-400/30 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> គេហទំព័រផ្លូវការរដ្ឋ (Official Portal)
                  </span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30">
                    ក្រសួងអប់រំ យុវជន និងកីឡា
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold font-battambang text-white tracking-tight">
                  សាលាឌីជីថល (Sala Digital - sala.moeys.gov.kh)
                </h2>
                
                <p className="text-sky-100/90 text-sm leading-relaxed font-normal">
                  វេទិកាឌីជីថលជាតិរបស់ក្រសួងអប់រំ យុវជន និងកីឡា ដែលជាបណ្តុំធនធានបណ្ណាល័យសៀវភៅពុម្ពអេឡិចត្រូនិក 
                  សៀវភៅណែនាំគ្រូ វីដេអូបង្រៀនគំរូ វគ្គបណ្តុះបណ្តាលស្វ័យសិក្សា និងការណែនាំពីការប្រើប្រាស់បញ្ញាសិប្បនិម្មិត (AI) 
                  សម្រាប់គណៈគ្រប់គ្រងសាលា លោកគ្រូ-អ្នកគ្រូ និងសិស្សានុសិស្សទូទាំងប្រទេសកម្ពុជា។
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <a
                    href="https://sala.moeys.gov.kh/index.php"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-sky-600/30 hover:scale-[1.02]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>បើកគេហទំព័រ sala.moeys.gov.kh ផ្ទាល់</span>
                  </a>

                  <a
                    href="https://moeys.gov.kh"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-sky-100 font-semibold rounded-xl text-xs sm:text-sm transition-all border border-white/15"
                  >
                    <School className="w-4 h-4" />
                    <span>គេហទំព័រក្រសួង moeys.gov.kh</span>
                  </a>
                </div>
              </div>

              {/* Quick Key Metrics / Features Badge */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 min-w-[280px]">
                <h4 className="text-xs font-bold text-sky-200 uppercase tracking-wider flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-sky-400" /> មាតិកាសំខាន់ៗក្នុងប្រព័ន្ធ
                </h4>
                <ul className="text-xs text-sky-100 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>សៀវភៅពុម្ព និងសៀវភៅណែនាំគ្រូគ្រប់ថ្នាក់</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>វីដេអូបង្រៀនគំរូ E-Learning MoEYS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>មេរៀនស្វ័យសិក្សា និងការប្រើប្រាស់ AI ក្នុងការបង្រៀន</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>ឯកសារស្តង់ដារសាលារៀនគំរូ និងគរុកោសល្យ</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4 Pillars of MoEYS Sala Digital Ecosystem */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1: E-Textbooks */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Library className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">បណ្ណាល័យសៀវភៅពុម្ពរដ្ឋ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ឯកសារសៀវភៅសិក្សាគោល សៀវភៅណែនាំគ្រូ និងកម្រងលំហាត់បឋមសិក្សា (ថ្នាក់ទី១ ដល់ ទី៦) និងមធ្យមសិក្សា ស្របតាមកម្មវិធីជាតិ។
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setActiveView('curriculum_explorer')}
                  className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
                >
                  <span>ពិនិត្យកម្មវិធីសិក្សាក្នុងប្រព័ន្ធ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pillar 2: Video Lessons & E-Learning */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">វីដេអូបង្រៀន E-Learning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                វីដេអូមេរៀនគំរូ ផលិតដោយគ្រូឧទ្ទេស និងនាយកដ្ឋានជំនាញនៃក្រសួងអប់រំ យុវជន និងកីឡា សម្រាប់គាំទ្រការបង្រៀន និងរៀន។
              </p>
              <div className="pt-1">
                <a
                  href="https://sala.moeys.gov.kh/index.php"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-700 font-bold hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>ចូលមើលមេរៀនវីដេអូ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Pillar 3: AI for Teachers Guidelines */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">ការប្រើ AI ក្នុងការបង្រៀន</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ការណែនាំពីការប្រើប្រាស់បញ្ញាសិប្បនិម្មិតប្រកបដោយក្រមសីលធម៌ និងប្រសិទ្ធភាពខ្ពស់ ជួយរៀបចំកិច្ចតែងការ ស្លាយ និងលំហាត់។
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigateToTab?.('weekly_lesson')}
                  className="text-xs text-purple-700 font-bold hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>សាកល្បងបង្កើតកិច្ចតែងការ AI</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pillar 4: Model School Standards */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">ស្តង់ដារសាលារៀនគំរូ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ក្របខ័ណ្ឌវាយតម្លៃ ៥ ស្តង់ដារ ២៧ សូចនាករ នៃសាលាបឋមសិក្សាគំរូ និងយន្តការគ្រប់គ្រងគុណភាពអប់រំតាមទិសដៅក្រសួង។
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setActiveView('model_school_assessment')}
                  className="text-xs text-amber-700 font-bold hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>វាយតម្លៃ ២៧ សូចនាករ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Guide on how Phnom Pom AI integrates with MoEYS Sala */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Compass className="w-5 h-5 text-sky-600" /> ការផ្សារភ្ជាប់ប្រព័ន្ធសាលាបឋមសិក្សាភ្នំពុំ ជាមួយប្រព័ន្ធ Sala MoEYS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ១. ស្របតាមកម្មវិធីសិក្សាជាតិ
                </span>
                <p className="text-slate-600 leading-relaxed">
                  រាល់ទិន្នន័យមុខវិជ្ជា ជំពូក មេរៀន និងលំហាត់ដែលដំណើរការដោយ AI ត្រូវបានផ្ទៀងផ្ទាត់ផ្ទាល់ជាមួយសៀវភៅពុម្ព និងបណ្ណាល័យឌីជីថល MoEYS Sala។
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> ២. គរុកោសល្យ ៥ ជំហាន
                </span>
                <p className="text-slate-600 leading-relaxed">
                  កិច្ចតែងការបង្រៀនទោល និងកិច្ចតែងការប្រចាំសប្តាហ៍ អនុវត្តតាមទម្រង់គំរូ ៥ ជំហានផ្លូវការរបស់ក្រសួង ធានាភាពងាយស្រួលក្នុងការត្រួតពិនិត្យរបស់នាយក និងការិយាល័យអប់រំស្រុក។
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" /> ៣. វាយតម្លៃស្វ័យប្រវត្តិតាមស្ដង់ដារ
                </span>
                <p className="text-slate-600 leading-relaxed">
                  ប្រព័ន្ធផ្តល់ជូននូវតារាងស្វ័យវាយតម្លៃ ២៧ សូចនាករ និងអាចបោះពុម្ពជារបាយការណ៍ផ្លូវការដែលមានត្រា និងហត្ថលេខារួចជាស្រេច។
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT AREA FOR OFFICIAL MOEYS MODEL PRIMARY SCHOOL REPORT */}
      <div className="hidden">
        <div id="moeys-model-school-assessment-print-area" className="p-8 bg-white text-black font-battambang relative">
          <AngkorPageWatermark />
          <MoEYSRoyalHeader schoolName={schoolProfile?.schoolNameKh || 'សាលាបឋមសិក្សាគំរូ'} />

          <div className="text-center my-6 space-y-1">
            <h2 className="text-lg font-extrabold uppercase tracking-wide">
              របាយការណ៍វាយតម្លៃស្វ័យប្រវត្តិតាមស្ដង់ដារសាលាបឋមសិក្សាគំរូ
            </h2>
            <p className="text-xs text-gray-700">
              (ផ្អែកតាមក្របខ័ណ្ឌស្តង់ដារសាលាបឋមសិក្សាគំរូ ៥ ស្តង់ដារ ២៧ សូចនាករ នៃក្រសួងអប់រំ យុវជន និងកីឡា)
            </p>
            <p className="text-xs font-semibold text-gray-800">
              ឆ្នាំសិក្សា៖ ២០២៤-២០២៥ | កាលបរិច្ឆេទវាយតម្លៃ៖ {new Date().toLocaleDateString('km-KH')}
            </p>
          </div>

          {/* School Profile Summary Box */}
          <div className="border border-black p-3 mb-4 text-xs grid grid-cols-2 gap-2">
            <div><strong>ឈ្មោះសាលារៀន៖</strong> {schoolProfile?.schoolNameKh || 'សាលាបឋមសិក្សារដ្ឋ'}</div>
            <div><strong>កូដសាលា (EMIS Code)៖</strong> {schoolProfile?.schoolCode || '---'}</div>
            <div><strong>រាជធានី/ខេត្ត៖</strong> {schoolProfile?.province || '---'}</div>
            <div><strong>ក្រុង/ស្រុក/ខណ្ឌ៖</strong> {schoolProfile?.district || '---'}</div>
          </div>

          {/* Score & Status Summary Table */}
          <table className="w-full text-xs border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-12">ល.រ</th>
                <th className="border border-black p-2 text-left">ឈ្មោះស្តង់ដារទាំង ៥</th>
                <th className="border border-black p-2 text-center w-24">ចំនួនសូចនាករ</th>
                <th className="border border-black p-2 text-center w-24">ពិន្ទុអតិបរមា</th>
                <th className="border border-black p-2 text-center w-24">ពិន្ទុទទួលបាន</th>
                <th className="border border-black p-2 text-center w-24">ភាគរយ (%)</th>
              </tr>
            </thead>
            <tbody>
              {MOEYS_MODEL_SCHOOL_STANDARDS.map((std, idx) => {
                const stdScore = std.indicators.reduce((sum, ind) => sum + (indicatorScores[ind.id] || 0), 0);
                const maxStd = std.indicators.length * 5;
                const pct = Math.round((stdScore / maxStd) * 100);
                return (
                  <tr key={std.id}>
                    <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-2 font-bold">{std.titleKh}</td>
                    <td className="border border-black p-2 text-center">{std.indicators.length}</td>
                    <td className="border border-black p-2 text-center">{maxStd}</td>
                    <td className="border border-black p-2 text-center font-bold">{stdScore}</td>
                    <td className="border border-black p-2 text-center font-bold">{pct}%</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-100 font-extrabold">
                <td colSpan={2} className="border border-black p-2 text-center">ពិន្ទុសរុបរួម & ចំណាត់ថ្នាក់</td>
                <td className="border border-black p-2 text-center">២៧</td>
                <td className="border border-black p-2 text-center">១៣៥</td>
                <td className="border border-black p-2 text-center text-sm">{totalCalculatedScore}</td>
                <td className="border border-black p-2 text-center text-sm">{scorePercentage}%</td>
              </tr>
            </tbody>
          </table>

          {/* Classification result box */}
          <div className="border border-black p-3 mb-6 text-xs bg-gray-50 text-center">
            <strong>សេចក្តីសន្និដ្ឋានអំពីចំណាត់ថ្នាក់សាលារៀន៖</strong>{' '}
            <span className="font-bold text-sm underline">{statusInfo.label}</span>
          </div>

          {/* Dual Signatures */}
          <MoEYSOfficialDualSignatures />
        </div>
      </div>
    </div>
  );
};
