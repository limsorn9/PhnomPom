import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Presentation, 
  Printer, 
  Download, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Layers, 
  Palette,
  Eye,
  Sliders
} from 'lucide-react';
import { 
  AILessonPlan, 
  LessonPlanFormInput, 
  AISlideDeck, 
  SlideTheme, 
  SlideItem,
  StudentLevel,
  TeachingStyle
} from './types';
import { generateAILessonPlan, generateAISlideDeck, saveAICreation } from '../../services/aiTeacherService';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  initialLesson?: AILessonPlan;
  onSaved?: () => void;
}

export const LessonSlideGenerator: React.FC<Props> = ({ initialLesson, onSaved }) => {
  const { showToast } = useSchool();

  // Active View Mode: 'form' | 'lesson_view' | 'slides_view' | 'slides_presenter'
  const [viewMode, setViewMode] = useState<'form' | 'lesson_view' | 'slides_view' | 'slides_presenter'>(
    initialLesson ? 'lesson_view' : 'form'
  );

  // Form State
  const [formData, setFormData] = useState<LessonPlanFormInput>({
    subject: 'ភាសាខ្មែរ',
    grade: 5,
    topic: 'វិធីតែងសេចក្តីពណ៌នាអំពីមនុស្ស និងសីលធម៌រស់នៅ',
    durationMinutes: 45,
    language: 'khmer',
    studentLevel: 'average',
    learningObjective: 'សិស្សយល់ដឹងពីប្លង់តែងសេចក្តី និងចេះសរសេររៀបរាប់បានត្រឹមត្រូវ',
    studentCount: 32,
    teachingStyle: 'interactive',
    materialsInClass: 'សៀវភៅពុម្ព, ក្តារខៀន, ប័ណ្ណរូបភាពគំរូ, ផ្ទាំងសន្លឹកកិច្ចការ',
    includeWarmup: true,
    includeActivities: true,
    includeQuestions: true,
    includeExercises: true,
    includeHomework: true,
    includeAssessment: true,
    includeSummary: true
  });

  // Generated Content
  const [lessonPlan, setLessonPlan] = useState<AILessonPlan | null>(initialLesson || null);
  const [slideDeck, setSlideDeck] = useState<AISlideDeck | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<SlideTheme>('modern_blue');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Loading & Edit states
  const [isGeneratingLesson, setIsGeneratingLesson] = useState<boolean>(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState<boolean>(false);
  const [isEditingSlide, setIsEditingSlide] = useState<boolean>(false);
  const [editingSlideData, setEditingSlideData] = useState<SlideItem | null>(null);

  // Subjects & Grades presets
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

  // Handlers
  const handleGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    try {
      const generated = await generateAILessonPlan(formData);
      setLessonPlan(generated);
      setViewMode('lesson_view');
      showToast('✨ បានបង្កើតកិច្ចតែងការបង្រៀនដោយ AI ជោគជ័យ!');
      
      // Auto save to history
      saveAICreation({
        id: generated.id,
        type: 'lesson',
        typeNameKh: 'កិច្ចតែងការបង្រៀន (Lesson Plan)',
        title: generated.title,
        subject: generated.subject,
        grade: generated.grade,
        createdAt: generated.createdAt,
        updatedAt: generated.updatedAt,
        payload: generated
      });
      if (onSaved) onSaved();
    } catch (err: any) {
      showToast('⚠️ មិនអាចបង្កើតមាតិកាបាននៅពេលនេះទេ។ សូមសាកល្បងម្តងទៀត។');
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (!lessonPlan) return;
    setIsGeneratingSlides(true);
    try {
      const slides = await generateAISlideDeck(
        lessonPlan.topic,
        lessonPlan.subject,
        lessonPlan.grade,
        selectedTheme,
        lessonPlan
      );
      setSlideDeck(slides);
      setActiveSlideIndex(0);
      setViewMode('slides_view');
      showToast('🎨 បានបង្កើត Slide Deck ដោយ AI ជោគជ័យ!');

      // Save to history
      saveAICreation({
        id: slides.id,
        type: 'slide',
        typeNameKh: 'ស្លាយបង្រៀន (Slide Deck)',
        title: slides.title,
        subject: slides.subject,
        grade: slides.grade,
        createdAt: slides.createdAt,
        updatedAt: slides.updatedAt,
        payload: slides
      });
      if (onSaved) onSaved();
    } catch (err) {
      showToast('⚠️ មានបញ្ហាក្នុងការបង្កើតស្លាយ។');
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleThemeChange = (theme: SlideTheme) => {
    setSelectedTheme(theme);
    if (slideDeck) {
      setSlideDeck({ ...slideDeck, theme });
    }
  };

  const getThemeClasses = (theme: SlideTheme) => {
    switch (theme) {
      case 'forest_emerald':
        return {
          bg: 'bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white',
          card: 'bg-emerald-900/60 border-emerald-600/40 text-emerald-50',
          accent: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
      case 'warm_amber':
        return {
          bg: 'bg-gradient-to-br from-amber-700 via-orange-800 to-amber-950 text-white',
          card: 'bg-amber-900/60 border-amber-600/40 text-amber-50',
          accent: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'royal_purple':
        return {
          bg: 'bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-950 text-white',
          card: 'bg-purple-900/60 border-purple-600/40 text-purple-50',
          accent: 'text-purple-300',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        };
      case 'slate_dark':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white',
          card: 'bg-slate-800/80 border-slate-700 text-slate-100',
          accent: 'text-sky-400',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
        };
      case 'clean_minimal':
        return {
          bg: 'bg-slate-50 text-slate-900',
          card: 'bg-white border-slate-200 text-slate-800 shadow-sm',
          accent: 'text-blue-700',
          badge: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'modern_blue':
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white',
          card: 'bg-blue-900/50 border-blue-500/30 text-blue-50',
          accent: 'text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        };
    }
  };

  // ----------------------------------------------------
  // RENDER FULLSCREEN PRESENTER
  // ----------------------------------------------------
  if (viewMode === 'slides_presenter' && slideDeck) {
    const currentSlide = slideDeck.slides[activeSlideIndex] || slideDeck.slides[0];
    const themeStyle = getThemeClasses(slideDeck.theme);

    return (
      <div className={`fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-12 ${themeStyle.bg} transition-colors duration-300 select-none`}>
        {/* Top Presenter Bar */}
        <div className="flex items-center justify-between text-xs opacity-75">
          <div className="flex items-center gap-3">
            <span className="font-moul">{slideDeck.subject} ថ្នាក់ទី{slideDeck.grade}</span>
            <span>•</span>
            <span className="font-medium">{slideDeck.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>ស្លាយ {activeSlideIndex + 1} / {slideDeck.slides.length}</span>
            <button
              onClick={() => setViewMode('slides_view')}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-all cursor-pointer"
            >
              ចាកចេញពី Presenter (ESC)
            </button>
          </div>
        </div>

        {/* Slide Main Display */}
        <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto w-full my-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-moul tracking-wide mb-4 leading-relaxed">
            {currentSlide.title}
          </h1>
          {currentSlide.subtitle && (
            <p className={`text-lg md:text-xl mb-8 font-medium ${themeStyle.accent}`}>
              {currentSlide.subtitle}
            </p>
          )}

          {/* Slide Content Points */}
          <div className="w-full space-y-4 max-w-3xl text-left">
            {currentSlide.contentPoints.map((point, idx) => (
              <div 
                key={idx} 
                className={`p-4 md:p-5 rounded-2xl border ${themeStyle.card} backdrop-blur-xs flex items-start gap-4 transition-all`}
              >
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </span>
                <p className="text-base md:text-xl font-medium leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Question Display if Present */}
          {currentSlide.interactiveQuestion && (
            <div className={`mt-6 w-full max-w-3xl p-5 rounded-2xl border ${themeStyle.card} text-left`}>
              <div className="font-bold text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{currentSlide.interactiveQuestion.question}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentSlide.interactiveQuestion.options.map((opt, oIdx) => (
                  <div key={oIdx} className="p-3 bg-white/10 rounded-xl text-sm font-medium">
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between">
          <button
            disabled={activeSlideIndex === 0}
            onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> មុន
          </button>
          
          {/* Slide dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md px-2">
            {slideDeck.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === activeSlideIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            disabled={activeSlideIndex === slideDeck.slides.length - 1}
            onClick={() => setActiveSlideIndex(prev => Math.min(slideDeck.slides.length - 1, prev + 1))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm transition-all"
          >
            បន្ទាប់ <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'form' 
                ? 'bg-blue-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ទម្រង់បញ្ចូលទិន្នន័យ (Input Form)</span>
          </button>
          
          <button
            disabled={!lessonPlan}
            onClick={() => setViewMode('lesson_view')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              viewMode === 'lesson_view' 
                ? 'bg-blue-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>កិច្ចតែងការបង្រៀន {lessonPlan && '✓'}</span>
          </button>

          <button
            disabled={!slideDeck && !lessonPlan}
            onClick={() => {
              if (!slideDeck && lessonPlan) {
                handleGenerateSlides();
              } else {
                setViewMode('slides_view');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              viewMode === 'slides_view' 
                ? 'bg-blue-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>ស្លាយមេរៀន (Slides Deck) {slideDeck && '✓'}</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {lessonPlan && viewMode === 'lesson_view' && (
            <>
              <button
                onClick={handleGenerateSlides}
                disabled={isGeneratingSlides}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-medium shadow-xs transition-all"
              >
                <Presentation className={`w-4 h-4 ${isGeneratingSlides ? 'animate-spin' : ''}`} />
                <span>{isGeneratingSlides ? 'កំពុងបង្កើតស្លាយ...' : '🎨 បង្កើតស្លាយដោយ AI'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
                title="បោះពុម្ពកិច្ចតែងការ"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">បោះពុម្ព</span>
              </button>
            </>
          )}

          {slideDeck && viewMode === 'slides_view' && (
            <button
              onClick={() => setViewMode('slides_presenter')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-medium shadow-xs transition-all"
            >
              <Maximize2 className="w-4 h-4" />
              <span>ចាក់ស្លាយបង្រៀន (Fullscreen)</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. INPUT FORM */}
      {/* ========================================================================= */}
      {viewMode === 'form' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold font-moul text-blue-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>ទម្រង់បង្កើតកិច្ចតែងការបង្រៀន និងស្លាយដោយ AI</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              សូមបំពេញព័ត៌មានលម្អិតខាងក្រោម ដើម្បីឱ្យ AI រៀបចំកិច្ចតែងការ និងស្លាយបង្រៀនស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា។
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                មុខវិជ្ជា <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              >
                {subjectsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                កម្រិតថ្នាក់ <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.grade}
                onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>ថ្នាក់ទី {g} {g <= 6 ? '(បឋមសិក្សា)' : '(មធ្យមសិក្សា)'}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                រយៈពេលបង្រៀន (នាទី) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.durationMinutes}
                onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              >
                <option value={30}>៣០ នាទី</option>
                <option value={40}>៤០ នាទី</option>
                <option value={45}>៤៥ នាទី (១ ម៉ោងសិក្សា)</option>
                <option value={50}>៥០ នាទី</option>
                <option value={90}>៩០ នាទី (២ ម៉ោងជាប់)</option>
              </select>
            </div>

            {/* Topic - Full Width */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ប្រធានបទមេរៀន (Lesson Topic) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="ឧ. វិធីបូក និងដកប្រភាគ, ការអភិរក្សព្រៃឈើ, បរិស្ថានជុំវិញខ្លួន..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              />
            </div>

            {/* Learning Objective */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                គោលបំណងសិក្សា (រំពឹងទុក)
              </label>
              <input
                type="text"
                value={formData.learningObjective}
                onChange={e => setFormData({ ...formData, learningObjective: e.target.value })}
                placeholder="ឧ. សិស្សអាចកំណត់និយមន័យ និងដោះស្រាយលំហាត់បានត្រឹមត្រូវ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              />
            </div>

            {/* Student Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ចំនួនសិស្សក្នុងថ្នាក់ (នាក់)
              </label>
              <input
                type="number"
                min={5}
                max={80}
                value={formData.studentCount}
                onChange={e => setFormData({ ...formData, studentCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              />
            </div>

            {/* Student Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                កម្រិតសមត្ថភាពសិស្ស
              </label>
              <select
                value={formData.studentLevel}
                onChange={e => setFormData({ ...formData, studentLevel: e.target.value as StudentLevel })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              >
                <option value="beginner">កម្រិតមូលដ្ឋាន / សិស្សរៀនយឺត (Beginner)</option>
                <option value="average">កម្រិតមធ្យម / ទូទៅ (Average)</option>
                <option value="advanced">កម្រិតខ្ពស់ / សិស្សពូកែ (Advanced)</option>
                <option value="mixed">ចម្រុះគ្រប់កម្រិត (Mixed Ability)</option>
              </select>
            </div>

            {/* Teaching Style */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                វិធីសាស្ត្របង្រៀន (Teaching Style)
              </label>
              <select
                value={formData.teachingStyle}
                onChange={e => setFormData({ ...formData, teachingStyle: e.target.value as TeachingStyle })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              >
                <option value="interactive">សកម្មភាពអន្តរកម្ម & សំណួរចម្លើយ (Interactive)</option>
                <option value="visual">រូបភាព & គំនូសតាង (Visual & Media)</option>
                <option value="discussion">ពិភាក្សាដេញដោលជាក្រុម (Discussion & Debate)</option>
                <option value="project_based">ផ្អែកលើគម្រោង & បញ្ហាជាក់ស្តែង (Project-based)</option>
                <option value="game_based">ផ្អែកលើល្បែងសិក្សា (Game-based Learning)</option>
                <option value="traditional">បែបប្រពៃណី / ពន្យល់ផ្ទាល់ (Direct Lecture)</option>
              </select>
            </div>

            {/* Materials in Classroom */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                សម្ភារៈឧបទេសដែលមានស្រាប់
              </label>
              <input
                type="text"
                value={formData.materialsInClass}
                onChange={e => setFormData({ ...formData, materialsInClass: e.target.value })}
                placeholder="ក្តារខៀន, សៀវភៅពុម្ព, ផ្ទាំងរូបភាព..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Component Checkboxes */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-700 mb-3">
              សមាសភាគដែលត្រូវដាក់បញ្ចូលក្នុងកិច្ចតែងការ៖
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { key: 'includeWarmup', label: 'កិច្ចចាប់ផ្តើម (Warm-up)' },
                { key: 'includeActivities', label: 'សកម្មភាពក្នុងថ្នាក់ & ក្រុម' },
                { key: 'includeQuestions', label: 'សំណួរឆ្លើយតបជំរុញការគិត' },
                { key: 'includeExercises', label: 'លំហាត់អនុវត្តផ្ទាល់ខ្លួន' },
                { key: 'includeAssessment', label: 'ការវាយតម្លៃរហ័ស (Assessment)' },
                { key: 'includeSummary', label: 'សង្ខេបគន្លឹះមេរៀន' },
                { key: 'includeHomework', label: 'កិច្ចការផ្ទះ (Homework)' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 text-xs font-medium text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={(formData as any)[item.key]}
                    onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })}
                    className="w-4 h-4 text-blue-900 rounded-sm border-slate-300 focus:ring-blue-800"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerateLesson}
              disabled={isGeneratingLesson || !formData.topic.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-5 h-5 text-amber-400 ${isGeneratingLesson ? 'animate-spin' : ''}`} />
              <span>{isGeneratingLesson ? '🤖 AI កំពុងរៀបចំកិច្ចតែងការ...' : '✨ បង្កើតកិច្ចតែងការដោយ AI'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LESSON PLAN VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'lesson_view' && lessonPlan && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Header Info */}
          <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs">
                  {lessonPlan.subject}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-900 font-bold rounded-lg text-xs">
                  ថ្នាក់ទី {lessonPlan.grade}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {lessonPlan.durationMinutes} នាទី
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-moul text-blue-950">
                {lessonPlan.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('form')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>កែប្រែទម្រង់</span>
              </button>
              <button
                onClick={handleGenerateLesson}
                disabled={isGeneratingLesson}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingLesson ? 'animate-spin' : ''}`} />
                <span>បង្កើតឡើងវិញ</span>
              </button>
            </div>
          </div>

          {/* Section A: Learning Objectives */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
            <h4 className="font-bold text-sm text-blue-950 font-moul mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-800" />
              <span>I. គោលបំណងសិក្សា (Learning Objectives)</span>
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
              {lessonPlan.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section B: Teaching Materials */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h4 className="font-bold text-sm text-slate-900 font-moul mb-2.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>II. សម្ភារៈឧបទេស និងឧបករណ៍បង្រៀន (Teaching Materials)</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {lessonPlan.materialsList.map((mat, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-2xs">
                  📦 {mat}
                </span>
              ))}
            </div>
          </div>

          {/* Section C: Lesson Activities Breakdown (Table / Steps) */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 font-moul flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-900" />
              <span>III. សកម្មភាពបង្រៀន និងរៀនជាជំហានៗ (Lesson Activities)</span>
            </h4>

            <div className="space-y-3">
              {lessonPlan.activities.map((act) => (
                <div 
                  key={act.stepNumber} 
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
                        {act.stepNumber}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-blue-950">
                        {act.phaseNameKh}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold">
                      ⏱️ {act.durationMinutes} នាទី
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <span className="font-bold text-blue-900 block mb-1">👨‍🏫 សកម្មភាពគ្រូ & ស្គ្រីបពន្យល់៖</span>
                      <p className="text-slate-700 leading-relaxed">{act.teacherScript}</p>
                    </div>
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-900 block mb-1">👩‍🎓 សកម្មភាពសិស្សត្រូវធ្វើ៖</span>
                      <p className="text-slate-700 leading-relaxed">{act.studentActivity}</p>
                    </div>
                  </div>

                  {act.teachingTools && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      🛠️ ឧបករណ៍ប្រើប្រាស់៖ <span className="font-medium text-slate-700">{act.teachingTools}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Assessment & Homework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assessment Rubric */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h5 className="font-bold text-xs font-moul text-slate-900">
                IV. លក្ខណៈវិនិច្ឆ័យវាយតម្លៃ (Assessment Rubric)
              </h5>
              <div className="space-y-1.5">
                {lessonPlan.assessmentRubric.map((rub, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{rub.criteria}</span>
                      <p className="text-[11px] text-slate-500">{rub.description}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-lg text-[10px]">
                      {rub.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Homework */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
              <h5 className="font-bold text-xs font-moul text-amber-950">
                V. កិច្ចការផ្ទះ (Homework Assignment)
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed">
                {lessonPlan.homework.task}
              </p>
              <div className="flex items-center gap-3 pt-2 text-[11px] text-amber-900 font-medium">
                <span>📅 ថ្ងៃប្រគល់៖ ក្រោយ {lessonPlan.homework.submissionDays} ថ្ងៃ</span>
                <span>•</span>
                <span>💡 {lessonPlan.homework.gradingGuide}</span>
              </div>
            </div>
          </div>

          {/* Section E: Teacher Reflection Notes */}
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl text-xs text-purple-950">
            <span className="font-bold font-moul block mb-1">VI. កំណត់សម្គាល់បន្ថែម និងការឆ្លុះបញ្ចាំងរបស់គ្រូ</span>
            <p className="leading-relaxed text-slate-700">{lessonPlan.summaryNotes}</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SLIDES VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'slides_view' && slideDeck && (
        <div className="space-y-5">
          {/* Slide Deck Top Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">រចនាបថស្លាយ (Theme)៖</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'modern_blue', name: 'Blue Ocean', color: 'bg-blue-900' },
                  { id: 'forest_emerald', name: 'Forest', color: 'bg-emerald-800' },
                  { id: 'warm_amber', name: 'Amber', color: 'bg-amber-700' },
                  { id: 'royal_purple', name: 'Purple', color: 'bg-purple-900' },
                  { id: 'slate_dark', name: 'Dark Mode', color: 'bg-slate-900' },
                  { id: 'clean_minimal', name: 'Light Minimal', color: 'bg-slate-200 border border-slate-300' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id as SlideTheme)}
                    title={t.name}
                    className={`w-6 h-6 rounded-full ${t.color} cursor-pointer transition-all ${
                      selectedTheme === t.id ? 'ring-2 ring-blue-600 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newSlide: SlideItem = {
                    id: `s-${Date.now()}`,
                    slideNumber: slideDeck.slides.length + 1,
                    title: 'ចំណងជើងស្លាយថ្មី',
                    subtitle: 'ខ្លឹមសាររង',
                    layout: 'bullets',
                    contentPoints: ['ចំណុចទី១...', 'ចំណុចទី២...']
                  };
                  setSlideDeck({
                    ...slideDeck,
                    slides: [...slideDeck.slides, newSlide]
                  });
                  setActiveSlideIndex(slideDeck.slides.length);
                  showToast('បានបន្ថែមស្លាយថ្មីជោគជ័យ!');
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមស្លាយ</span>
              </button>
              <button
                onClick={() => setViewMode('slides_presenter')}
                className="flex items-center gap-1 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>បញ្ចាំងស្លាយ</span>
              </button>
            </div>
          </div>

          {/* Main Slide Preview & Side Thumbnails */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Slide Thumbnails Column */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-3 space-y-2 max-h-[600px] overflow-y-auto">
              <div className="text-xs font-bold text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span>បញ្ជីស្លាយ ({slideDeck.slides.length})</span>
                <span className="text-[10px] text-slate-400">ចុចដើម្បីជ្រើស</span>
              </div>
              {slideDeck.slides.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    idx === activeSlideIndex 
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-blue-950">ស្លាយ {idx + 1}</span>
                    {idx === activeSlideIndex && <span className="text-blue-600 font-bold text-[10px]">កំពុងមើល</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">{s.title}</p>
                </div>
              ))}
            </div>

            {/* Active Slide Stage */}
            <div className="lg:col-span-3 space-y-4">
              {slideDeck.slides[activeSlideIndex] && (() => {
                const s = slideDeck.slides[activeSlideIndex];
                const theme = getThemeClasses(slideDeck.theme);

                return (
                  <div className={`p-8 md:p-12 rounded-3xl min-h-[420px] flex flex-col justify-between ${theme.bg} shadow-lg relative overflow-hidden`}>
                    {/* Slide Top Info */}
                    <div className="flex items-center justify-between text-xs opacity-75">
                      <span className="font-moul">{slideDeck.subject} • ថ្នាក់ទី{slideDeck.grade}</span>
                      <span>ស្លាយ {activeSlideIndex + 1} / {slideDeck.slides.length}</span>
                    </div>

                    {/* Main Slide Content */}
                    <div className="my-6 text-center max-w-2xl mx-auto w-full">
                      <h2 className="text-2xl md:text-3xl font-bold font-moul mb-3 leading-relaxed">
                        {s.title}
                      </h2>
                      {s.subtitle && (
                        <p className={`text-sm md:text-base font-medium mb-6 ${theme.accent}`}>
                          {s.subtitle}
                        </p>
                      )}

                      <div className="space-y-3 text-left">
                        {s.contentPoints.map((pt, pIdx) => (
                          <div key={pIdx} className={`p-3.5 rounded-xl border ${theme.card} flex items-start gap-3`}>
                            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {pIdx + 1}
                            </span>
                            <span className="text-sm md:text-base font-medium leading-relaxed">{pt}</span>
                          </div>
                        ))}
                      </div>

                      {s.interactiveQuestion && (
                        <div className={`mt-4 p-4 rounded-xl border ${theme.card} text-left text-xs`}>
                          <p className="font-bold mb-2">❓ {s.interactiveQuestion.question}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {s.interactiveQuestion.options.map((opt, oIdx) => (
                              <div key={oIdx} className="p-2 bg-white/10 rounded-lg">{opt}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slide Controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <button
                        disabled={activeSlideIndex === 0}
                        onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" /> មុន
                      </button>

                      {/* Delete Slide Button */}
                      {slideDeck.slides.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = slideDeck.slides.filter((_, idx) => idx !== activeSlideIndex);
                            setSlideDeck({ ...slideDeck, slides: updated });
                            setActiveSlideIndex(prev => Math.min(prev, updated.length - 1));
                            showToast('បានលុបស្លាយជោគជ័យ!');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 text-rose-100 rounded-xl text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> លុបស្លាយនេះ
                        </button>
                      )}

                      <button
                        disabled={activeSlideIndex === slideDeck.slides.length - 1}
                        onClick={() => setActiveSlideIndex(prev => Math.min(slideDeck.slides.length - 1, prev + 1))}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        បន្ទាប់ <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
