import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TeacherDailyTask } from '../types';
import {
  fetchGoogleCalendarEvents,
  createTeacherDailyTaskEvent
} from '../services/googleCalendar';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Tag,
  Flame,
  CheckSquare,
  Square,
  BookOpen,
  Users,
  Award,
  BellRing,
  X
} from 'lucide-react';

interface TeacherDailyAgendaPanelProps {
  compact?: boolean;
}

export const TeacherDailyAgendaPanel: React.FC<TeacherDailyAgendaPanelProps> = ({ compact = false }) => {
  const {
    teacherDailyTasks,
    addTeacherDailyTask,
    toggleTaskCompleted,
    deleteTeacherDailyTask,
    schoolProfile,
    currentUser,
    teachers,
    showToast
  } = useSchool();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([]);

  // Task form state
  const initialForm = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    category: 'teaching' as 'teaching' | 'grading' | 'meeting' | 'admin' | 'health_check' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    gradeSection: 'ថ្នាក់ទី៥ក',
    syncToGoogleCalendar: true
  };
  const [formData, setFormData] = useState(initialForm);

  // Load Google Calendar Events on Mount
  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      setIsSyncingCalendar(true);
      const events = await fetchGoogleCalendarEvents(10);
      setGoogleCalendarEvents(events);
    } catch (err) {
      console.warn('Cannot fetch Google Calendar events without login', err);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleSyncWithGoogleCalendar = async () => {
    setIsSyncingCalendar(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        }
      }

      if (!token) {
        showToast('សូមចូលប្រើប្រាស់ Google ជាមុនសិន!', 'error');
        setIsSyncingCalendar(false);
        return;
      }

      const events = await fetchGoogleCalendarEvents(15);
      setGoogleCalendarEvents(events);
      showToast('បានធ្វើសមកាលកម្ម Google Calendar ជោគជ័យ!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'មានបញ្ហាក្នុងការទាញទិន្នន័យពី Google Calendar', 'error');
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('សូមបញ្ចូលចំណងជើងភារកិច្ច!', 'error');
      return;
    }

    let gCalEventId: string | undefined = undefined;

    const taskPayload = {
      teacherId: currentUser?.id || 't1',
      teacherName: currentUser?.name || 'អ្នកគ្រូ ពេជ្រ ធីតា',
      title: formData.title.trim(),
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      category: formData.category,
      priority: formData.priority,
      gradeSection: formData.gradeSection,
      isCompleted: false,
      syncedToGoogleCalendar: false
    };

    // Optional sync to Google Calendar
    if (formData.syncToGoogleCalendar) {
      try {
        const token = await getAccessToken();
        if (token) {
          const res = await createTeacherDailyTaskEvent(
            { ...taskPayload, id: 'temp_' + Date.now(), createdAt: new Date().toISOString() },
            schoolProfile.nameKhmer
          );
          gCalEventId = res.eventId;
        }
      } catch (err) {
        console.warn('Could not sync to Google Calendar automatically', err);
      }
    }

    addTeacherDailyTask({
      ...taskPayload,
      googleCalendarEventId: gCalEventId,
      syncedToGoogleCalendar: !!gCalEventId
    });

    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
            <Flame className="w-3 h-3 text-rose-600" />
            <span>បន្ទាន់បំផុត</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            <span>អាទិភាពខ្ពស់</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
            <span>ធម្មតា</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-600">
            <span>ទូទៅ</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'teaching':
        return { label: 'បង្រៀន', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      case 'grading':
        return { label: 'ដាក់ពិន្ទុ', icon: Award, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'meeting':
        return { label: 'ប្រជុំ', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'health_check':
        return { label: 'សុខភាព', icon: BellRing, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      default:
        return { label: 'រដ្ឋបាល', icon: Tag, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = teacherDailyTasks.filter(t => t.date === todayStr);
  const filteredTasks = teacherDailyTasks.filter(t => {
    return filterCategory === 'all' || t.category === filterCategory;
  });

  const completedCount = teacherDailyTasks.filter(t => t.isCompleted).length;
  const pendingCount = teacherDailyTasks.filter(t => !t.isCompleted).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>របៀបវារៈ និងភារកិច្ចប្រចាំថ្ងៃរបស់គ្រូ</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {pendingCount} កំពុងរង់ចាំ
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              កាលវិភាគ និងភារកិច្ចបង្រៀនភ្ជាប់ជាមួយ Google Calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncWithGoogleCalendar}
            disabled={isSyncingCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm text-xs font-medium transition-colors"
            title="ធ្វើសមកាលកម្មជាមួយ Google Calendar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Calendar</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>បន្ថែមភារកិច្ច</span>
          </button>
        </div>
      </div>

      {/* Progress & Category Filter */}
      <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-600">
          <span>សម្រេចបាន៖ <strong className="text-emerald-600 font-bold">{completedCount}</strong>/{teacherDailyTasks.length}</span>
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${teacherDailyTasks.length > 0 ? (completedCount / teacherDailyTasks.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'teaching', 'grading', 'meeting', 'admin'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' && 'ទាំងអស់'}
              {cat === 'teaching' && 'បង្រៀន'}
              {cat === 'grading' && 'ដាក់ពិន្ទុ'}
              {cat === 'meeting' && 'ប្រជុំ'}
              {cat === 'admin' && 'រដ្ឋបាល'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-2.5 max-h-96 overflow-y-auto divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm">មិនមានភារកិច្ចក្នុងប្រភេទនេះទេ</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const catInfo = getCategoryLabel(task.category);
            const CatIcon = catInfo.icon;

            return (
              <div
                key={task.id}
                className={`pt-2.5 first:pt-0 flex items-start justify-between gap-3 group transition-opacity ${
                  task.isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                  >
                    {task.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold text-slate-800 ${
                          task.isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${catInfo.color}`}>
                        <CatIcon className="w-2.5 h-2.5" />
                        <span>{catInfo.label}</span>
                      </span>
                      {task.gradeSection && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {task.gradeSection}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.date}</span>
                      </span>
                      {task.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.startTime} - {task.endTime || ''}</span>
                        </span>
                      )}
                      {task.syncedToGoogleCalendar && (
                        <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Google Cal</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTeacherDailyTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 rounded transition-all flex-shrink-0"
                  title="លុបភារកិច្ច"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Google Calendar Live Events Quick Strip */}
      {googleCalendarEvents.length > 0 && (
        <div className="p-3 bg-blue-50/60 border-t border-blue-100 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>ព្រឹត្តិការណ៍ផ្ទាល់ពី Google Calendar</span>
            </span>
            <span className="text-[11px] text-blue-600">{googleCalendarEvents.length} ព្រឹត្តិការណ៍</span>
          </div>
          <div className="space-y-1">
            {googleCalendarEvents.slice(0, 3).map((event, idx) => (
              <div key={event.id || idx} className="flex items-center justify-between text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-100/50">
                <span className="font-medium line-clamp-1">{event.summary || 'ព្រឹត្តិការណ៍គ្មានចំណងជើង'}</span>
                <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                  {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (event.start?.date || '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">បន្ថែមភារកិច្ចថ្មីក្នុងរបៀបវារៈ</h3>
                  <p className="text-xs text-slate-500">កត់ត្រាការងារ និង sync ទៅ Google Calendar</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ចំណងជើងភារកិច្ច *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ឧ. បង្រៀនគណិតវិទ្យា មេរៀនប្រភាគ, ដាក់ពិន្ទុខែ..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  សេចក្តីពិពណ៌នា / ចំណាំ
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="ព័ត៌មានលម្អិតបន្ថែម..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ប្រភេទភារកិច្ច
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="teaching">ការបង្រៀន</option>
                    <option value="grading">ការដាក់ពិន្ទុ</option>
                    <option value="meeting">កិច្ចប្រជុំ</option>
                    <option value="admin">ការងាររដ្ឋបាល</option>
                    <option value="health_check">ពិនិត្យសុខភាព</option>
                    <option value="other">ផ្សេងៗ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កម្រិតអាទិភាព
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">ធម្មតា (Low)</option>
                    <option value="medium">មធ្យម (Medium)</option>
                    <option value="high">ខ្ពស់ (High)</option>
                    <option value="urgent">បន្ទាន់ (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កាលបរិច្ឆេទ
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ម៉ោងចាប់ផ្តើម
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ម៉ោងបញ្ចប់
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ថ្នាក់រៀនពាក់ព័ន្ធ
                </label>
                <input
                  type="text"
                  value={formData.gradeSection}
                  onChange={e => setFormData({ ...formData, gradeSection: e.target.value })}
                  placeholder="ឧ. ថ្នាក់ទី៥ក"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-semibold text-blue-900">Sync ទៅ Google Calendar</p>
                  <p className="text-blue-600 text-[11px]">បង្កើត event លើ Calendar ដោយស្វ័យប្រវត្តិ</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.syncToGoogleCalendar}
                  onChange={e => setFormData({ ...formData, syncToGoogleCalendar: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>រក្សាទុកភារកិច្ច</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Quick Meeting Minute Logging */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setFormData({
              ...initialForm,
              category: 'meeting',
              title: 'កត់ត្រាកំណត់ហេតុប្រជុំរដ្ឋបាលសាលា',
              description: 'កំណត់ហេតុប្រជុំគរុកោសល្យ និងការងាររដ្ឋបាលប្រចាំថ្ងៃ'
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-white/30"
          title="កត់ត្រាកំណត់ហេតុប្រជុំរហ័ស (Quick Meeting Minute)"
        >
          <BookOpen className="w-5 h-5 text-amber-300 animate-bounce" />
          <span className="text-xs sm:text-sm font-moul">កត់ត្រាកំណត់ហេតុប្រជុំ</span>
        </button>
      </div>
    </div>
  );
};
