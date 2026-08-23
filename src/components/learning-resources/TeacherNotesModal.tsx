import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Save,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  Lightbulb,
  BookOpen,
  Plus,
  Copy,
  Check,
  Tag,
  Share2,
  Printer
} from 'lucide-react';
import { LearningResourceItem, TeacherPrivateNote } from '../../data/learningResourcesData';

interface TeacherNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: LearningResourceItem | null;
  currentNote?: TeacherPrivateNote;
  onSaveNote: (note: TeacherPrivateNote) => void;
  onDeleteNote: (resourceId: string) => void;
}

export const TeacherNotesModal: React.FC<TeacherNotesModalProps> = ({
  isOpen,
  onClose,
  resource,
  currentNote,
  onSaveNote,
  onDeleteNote
}) => {
  const [title, setTitle] = useState('');
  const [strategyCategory, setStrategyCategory] = useState<
    'វិធីសាស្ត្របង្រៀន' | 'សកម្មភាពសិស្ស' | 'កិច្ចការផ្ទះ & រង្វាយតម្លៃ' | 'ការសម្រួលសិស្សខ្សោយ' | 'ទូទៅ'
  >('វិធីសាស្ត្របង្រៀន');
  const [noteContent, setNoteContent] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [nextLessonDate, setNextLessonDate] = useState('');
  const [actionItemInput, setActionItemInput] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (resource) {
      if (currentNote) {
        setTitle(currentNote.title || `ផែនការបង្រៀន៖ ${resource.titleKhmer}`);
        setStrategyCategory(currentNote.strategyCategory || 'វិធីសាស្ត្របង្រៀន');
        setNoteContent(currentNote.noteContent || '');
        setTargetClass(currentNote.targetClass || (resource.grade ? `ថ្នាក់ទី ${resource.grade}` : ''));
        setNextLessonDate(currentNote.nextLessonDate || '');
        setActionItems(currentNote.keyPoints || []);
      } else {
        setTitle(`ផែនការបង្រៀន៖ ${resource.titleKhmer}`);
        setStrategyCategory('វិធីសាស្ត្របង្រៀន');
        setNoteContent('');
        setTargetClass(resource.grade ? `ថ្នាក់ទី ${resource.grade}` : '');
        setNextLessonDate('');
        setActionItems([]);
      }
    }
  }, [resource, currentNote, isOpen]);

  if (!isOpen || !resource) return null;

  const handleAddActionItem = () => {
    if (!actionItemInput.trim()) return;
    setActionItems([...actionItems, actionItemInput.trim()]);
    setActionItemInput('');
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, idx) => idx !== index));
  };

  const insertFormat = (before: string, after: string = '') => {
    const textarea = document.getElementById('teacher-note-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousValue = textarea.value;
    const selectedText = previousValue.substring(start, end);
    const newValue =
      previousValue.substring(0, start) +
      before +
      selectedText +
      after +
      previousValue.substring(end);

    setNoteContent(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 50);
  };

  const insertTemplate = (templateType: string) => {
    let templateText = '';
    if (templateType === 'group') {
      templateText = `\n• បែងចែកសិស្សជា ៤ ក្រុម (ក្រុម ក, ខ, គ, ឃ)\n• ឱ្យសិស្សមើលវីដេអូ/ខ្លឹមសារ រួចពិភាក្សារកចម្លើយគន្លឹះ\n• ប្រធានក្រុមនីមួយៗឡើងរាយការណ៍ និងសង្ខេប`;
    } else if (templateType === 'game') {
      templateText = `\n• ល្បែងឆ្លើយលឿន៖ ឆ្លើយត្រូវទទួលបាន ១ ពិន្ទុសម្រាប់ក្រុម\n• សិស្សប្រើប្រាស់កាតពាក្យ ឬក្តារខៀនតូចលើកបង្ហាញចម្លើយ\n• បូកសរុបពិន្ទុ និងលើកទឹកចិត្តដោយការទះដៃរួម`;
    } else if (templateType === 'slow_learner') {
      templateText = `\n• ផ្ដោតលើសិស្សរៀនយឺត ២-៣ នាក់ក្នុងថ្នាក់\n• ពន្យល់យឺតៗតាមរូបភាព និងឧទាហរណ៍ជាក់ស្តែង\n• ផ្គូផ្គងជាមួយមិត្តជួយមិត្ត (សិស្សពូកែជួយសិស្សយឺត)`;
    }

    setNoteContent(prev => prev + templateText);
  };

  const handleSave = () => {
    const updatedNote: TeacherPrivateNote = {
      resourceId: resource.id,
      title: title.trim() || `កំណត់ត្រា៖ ${resource.titleKhmer}`,
      strategyCategory,
      noteContent: noteContent.trim(),
      targetClass: targetClass.trim(),
      nextLessonDate,
      keyPoints: actionItems,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    onSaveNote(updatedNote);
    onClose();
  };

  const handleCopy = () => {
    const text = `📌 ${title}\n🎯 យុទ្ធសាស្ត្រ៖ ${strategyCategory}\n🏫 ថ្នាក់៖ ${targetClass || 'ទូទៅ'}\n📅 កាលបរិច្ឆេទ៖ ${nextLessonDate || 'មិនទាន់កំណត់'}\n\n📝 ខ្លឹមសារកំណត់ត្រា៖\n${noteContent}\n\n✅ កិច្ចការត្រូវរៀបចំ៖\n${actionItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="teacher-notes-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="teacher-notes-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">កំណត់ត្រាផ្ទាល់ខ្លួនរបស់គ្រូ (Teacher Notes)</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
                  ឯកជន (Private)
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5 max-w-md truncate">
                សម្រាប់ធនធាន៖ {resource.titleKhmer}
              </p>
            </div>
          </div>
          <button
            id="close-teacher-notes-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Note Title & Strategy Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">ចំណងជើងកំណត់ត្រា (Note Title)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="ឧ. ផែនការបង្រៀនមេរៀនស្រៈនិស្ស័យ..."
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">ប្រភេទយុទ្ធសាស្ត្រ</label>
              <select
                value={strategyCategory}
                onChange={e => setStrategyCategory(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white font-medium text-slate-800"
              >
                <option value="វិធីសាស្ត្របង្រៀន">វិធីសាស្ត្របង្រៀន</option>
                <option value="សកម្មភាពសិស្ស">សកម្មភាពសិស្ស</option>
                <option value="កិច្ចការផ្ទះ & រង្វាយតម្លៃ">កិច្ចការផ្ទះ & រង្វាយតម្លៃ</option>
                <option value="ការសម្រួលសិស្សខ្សោយ">ការសម្រួលសិស្សខ្សោយ</option>
                <option value="ទូទៅ">ទូទៅ</option>
              </select>
            </div>
          </div>

          {/* Class & Planned Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                ថ្នាក់អនុវត្តជាក់ស្តែង (Target Class)
              </label>
              <input
                type="text"
                value={targetClass}
                onChange={e => setTargetClass(e.target.value)}
                placeholder="ឧ. ថ្នាក់ទី ១ក, ថ្នាក់ទី ៦ខ"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                កាលបរិច្ឆេទបង្រៀនគ្រោងទុក (Lesson Date)
              </label>
              <input
                type="date"
                value={nextLessonDate}
                onChange={e => setNextLessonDate(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Rich-Text Formatting Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                ខ្លឹមសារកំណត់ត្រា និងយុទ្ធសាស្ត្របង្រៀន (Rich-text Notes)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertTemplate('group')}
                  className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-medium transition-colors"
                >
                  + គំរូជាក្រុម
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('game')}
                  className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-medium transition-colors"
                >
                  + គំរូល្បែង
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('slow_learner')}
                  className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-medium transition-colors"
                >
                  + គំរូសិស្សខ្សោយ
                </button>
              </div>
            </div>

            {/* Quick formatting buttons */}
            <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-t-xl border border-b-0 border-slate-200">
              <button
                type="button"
                onClick={() => insertFormat('**', '**')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs"
                title="អក្សរដិត (Bold)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormat('*', '*')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 italic text-xs shadow-xs"
                title="អក្សរទ្រេត (Italic)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormat('• ')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs shadow-xs"
                title="សញ្ញាចុច (Bullet Point)"
              >
                • បញ្ជី
              </button>
              <button
                type="button"
                onClick={() => insertFormat('👉 ')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs shadow-xs"
                title="សញ្ញាព្រួញ (Point)"
              >
                👉 ចំណុចសំខាន់
              </button>
              <button
                type="button"
                onClick={() => insertFormat('⭐ ')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-xs shadow-xs"
                title="ផ្កាយ (Highlight)"
              >
                ⭐ ផ្កាយ
              </button>
            </div>

            <textarea
              id="teacher-note-textarea"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="សរសេរយុទ្ធសាស្ត្រ ជំហានបង្រៀន សំណួរគន្លឹះ ឬចំណុចដែលត្រូវប្រុងប្រយ័ត្នក្នុងថ្នាក់រៀន..."
              rows={6}
              className="w-full text-xs leading-relaxed p-3 rounded-b-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          {/* Action Checklist Items */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>បញ្ជីកិច្ចការត្រូវរៀបចំ (Action Items / Preparation Checklist)</span>
              <span className="text-[11px] text-slate-500 font-normal">{actionItems.length} កិច្ចការ</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={actionItemInput}
                onChange={e => setActionItemInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddActionItem())}
                placeholder="ឧ. បោះពុម្ពសន្លឹកកិច្ចការ ១៥ ច្បាប់, ត្រៀមកាតពាក្យ..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                បន្ថែម
              </button>
            </div>

            {actionItems.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-800">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentNote && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('តើអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?')) {
                    onDeleteNote(resource.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                លុបកំណត់ត្រា
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'បានចម្លង!' : 'ចម្លងកំណត់ត្រា'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              id="save-teacher-note-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              រក្សាទុកកំណត់ត្រា (Save Note)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
