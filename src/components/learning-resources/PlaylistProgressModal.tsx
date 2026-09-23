import React, { useState, useEffect } from 'react';
import {
  Video,
  PlayCircle,
  CheckCircle2,
  Circle,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  Minus,
  CheckCheck
} from 'lucide-react';
import { LearningResourceItem, ResourceProgressTracker } from '../../data/learningResourcesData';

interface PlaylistProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: LearningResourceItem | null;
  currentProgress?: ResourceProgressTracker;
  onSaveProgress: (progress: ResourceProgressTracker) => void;
}

export const PlaylistProgressModal: React.FC<PlaylistProgressModalProps> = ({
  isOpen,
  onClose,
  resource,
  currentProgress,
  onSaveProgress
}) => {
  const totalLessons = resource?.totalLessons || 30;
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [completedLessonNumbers, setCompletedLessonNumbers] = useState<number[]>([]);
  const [lastTopicCovered, setLastTopicCovered] = useState<string>('');

  useEffect(() => {
    if (resource) {
      if (currentProgress) {
        setCompletedCount(currentProgress.completedCount || 0);
        setCompletedLessonNumbers(
          currentProgress.completedLessonNumbers ||
            Array.from({ length: currentProgress.completedCount || 0 }, (_, i) => i + 1)
        );
        setLastTopicCovered(currentProgress.lastTopicCovered || '');
      } else {
        setCompletedCount(0);
        setCompletedLessonNumbers([]);
        setLastTopicCovered('');
      }
    }
  }, [resource, currentProgress, isOpen]);

  if (!isOpen || !resource) return null;

  const percentage = Math.round((completedCount / totalLessons) * 100);

  const toggleLesson = (lessonNum: number) => {
    let updatedNumbers: number[];
    if (completedLessonNumbers.includes(lessonNum)) {
      updatedNumbers = completedLessonNumbers.filter(n => n !== lessonNum);
    } else {
      updatedNumbers = [...completedLessonNumbers, lessonNum].sort((a, b) => a - b);
    }
    setCompletedLessonNumbers(updatedNumbers);
    setCompletedCount(updatedNumbers.length);

    // Auto-update last covered topic if lesson list exists
    const lessonMeta = resource.lessonsList?.find(l => l.number === lessonNum);
    if (lessonMeta && !completedLessonNumbers.includes(lessonNum)) {
      setLastTopicCovered(`មេរៀនទី${lessonNum}: ${lessonMeta.title}`);
    }
  };

  const handleIncrement = () => {
    if (completedCount < totalLessons) {
      const nextCount = completedCount + 1;
      setCompletedCount(nextCount);
      if (!completedLessonNumbers.includes(nextCount)) {
        setCompletedLessonNumbers([...completedLessonNumbers, nextCount].sort((a, b) => a - b));
      }
      const lessonMeta = resource.lessonsList?.find(l => l.number === nextCount);
      if (lessonMeta) {
        setLastTopicCovered(`មេរៀនទី${nextCount}: ${lessonMeta.title}`);
      }
    }
  };

  const handleDecrement = () => {
    if (completedCount > 0) {
      const nextCount = completedCount - 1;
      setCompletedCount(nextCount);
      setCompletedLessonNumbers(completedLessonNumbers.filter(n => n <= nextCount));
    }
  };

  const handleMarkAll = () => {
    const all = Array.from({ length: totalLessons }, (_, i) => i + 1);
    setCompletedCount(totalLessons);
    setCompletedLessonNumbers(all);
    setLastTopicCovered(`បានបញ្ចប់គ្រប់ ${totalLessons} មេរៀន`);
  };

  const handleReset = () => {
    setCompletedCount(0);
    setCompletedLessonNumbers([]);
    setLastTopicCovered('');
  };

  const handleSave = () => {
    const progressData: ResourceProgressTracker = {
      resourceId: resource.id,
      totalLessons,
      completedCount,
      completedLessonNumbers,
      lastTopicCovered: lastTopicCovered.trim() || undefined,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    onSaveProgress(progressData);
    onClose();
  };

  return (
    <div
      id="playlist-progress-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="playlist-progress-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">តាមដានវឌ្ឍនភាពមេរៀន (Playlist Progress)</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
                  {percentage}%
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5 max-w-md truncate">
                {resource.titleKhmer}
              </p>
            </div>
          </div>
          <button
            id="close-playlist-progress-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Progress Overview Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-4 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">វឌ្ឍនភាពបង្រៀនសរុប</span>
                <h4 className="text-2xl font-bold text-emerald-950 font-mono">
                  {completedCount} <span className="text-sm font-normal text-slate-500 font-sans">/ {totalLessons} មេរៀន</span>
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">ភាគរយសម្រេច</span>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {percentage}%
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percentage >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : percentage >= 50
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>មេរៀន ០</span>
                <span>មេរៀនពាក់កណ្តាល ({Math.round(totalLessons / 2)})</span>
                <span>មេរៀនទី {totalLessons}</span>
              </div>
            </div>

            {/* Quick Step Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-emerald-100/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={completedCount === 0}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                  -១ មេរៀន
                </button>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={completedCount >= totalLessons}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +១ មេរៀន
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  សម្គាល់ចប់ទាំងអស់
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  កំណត់ឡើងវិញ
                </button>
              </div>
            </div>
          </div>

          {/* Last Covered Topic Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              ប្រធានបទ/មេរៀនដែលបានបង្រៀនចុងក្រោយ (Last Covered Topic)
            </label>
            <input
              type="text"
              value={lastTopicCovered}
              onChange={e => setLastTopicCovered(e.target.value)}
              placeholder="ឧ. មេរៀនទី១២: ស្រៈផ្សំ អៀ អឿ អួ, ការបូកលេខដល់ ២០"
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          {/* Detailed Lesson Grid / Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                ជ្រើសរើសមេរៀនដែលបានបង្រៀនជាក់ស្តែង ({completedLessonNumbers.length} បានជ្រើស)
              </label>
              <span className="text-[11px] text-slate-400">ចុចលើលេខមេរៀនដើម្បីធីក (Check/Uncheck)</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
              {Array.from({ length: totalLessons }, (_, i) => i + 1).map(num => {
                const isCompleted = completedLessonNumbers.includes(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleLesson(num)}
                    className={`h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-all border ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
                    }`}
                    title={`មេរៀនទី ${num}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> : null}
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special celebration if 100% */}
          {percentage >= 100 && (
            <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-900 text-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold">អបអរសាទរ! លោកគ្រូ-អ្នកគ្រូបានបញ្ចប់គ្រប់មេរៀនក្នុងវីដេអូនេះហើយ 🎉</p>
                <p className="text-emerald-700 mt-0.5">សិស្សានុសិស្សទទួលបានចំណេះដឹងពេញលេញតាមកម្មវិធីសិក្សា។</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            បោះបង់ (Cancel)
          </button>
          <button
            id="save-playlist-progress-btn"
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            រក្សាទុកវឌ្ឍនភាព (Save Progress)
          </button>
        </div>
      </div>
    </div>
  );
};
