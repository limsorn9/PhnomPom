import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TeacherDailyTask, TaskPriority, TaskCategory, ActiveTab } from '../types';
import {
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  Calendar,
  Plus,
  Trash2,
  BellRing,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle2,
  CalendarCheck,
  Building,
  GraduationCap,
  FileSpreadsheet,
  ExternalLink,
  Filter,
  Check,
  X
} from 'lucide-react';

interface TeacherDailyTasksProps {
  compact?: boolean;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const TeacherDailyTasks: React.FC<TeacherDailyTasksProps> = ({
  compact = false,
  onNavigateTab
}) => {
  const {
    teacherDailyTasks,
    addTeacherDailyTask,
    toggleTaskCompleted,
    deleteTeacherDailyTask,
    notifications,
    calendarEvents,
    currentUser,
    setActiveTab,
    language
  } = useSchool();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'urgent' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    category: 'admin' as TaskCategory,
    priority: 'high' as TaskPriority,
    gradeSection: 'ថ្នាក់ទី៥ក',
    assignedTeacherName: currentUser?.name || 'លោកគ្រូ សុខ វិទ្យា'
  });

  const isKhmer = language === 'km';
  const todayStr = new Date().toISOString().split('T')[0];

  // Urgent notifications
  const urgentNotifications = useMemo(() => {
    return notifications
      .filter(n => n.priority === 'urgent' || n.type === 'score_deadline' || n.priority === 'high')
      .slice(0, 3);
  }, [notifications]);

  // Upcoming School Deadlines (from calendar & system)
  const upcomingDeadlines = useMemo(() => {
    const defaultDeadlines = [
      {
        id: 'dl-1',
        title: 'ថ្ងៃផុតកំណត់បញ្ចូលពិន្ទុប្រចាំខែ',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'exam_grading',
        daysLeft: 2,
        isUrgent: true,
        targetTab: 'scores' as ActiveTab
      },
      {
        id: 'dl-2',
        title: 'ផ្ញើរបាយការណ៍វត្តមាន និងស្ថិតិសិស្សទៅការិយាល័យអប់រំស្រុក',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'admin',
        daysLeft: 5,
        isUrgent: false,
        targetTab: 'reports_qr' as ActiveTab
      },
      {
        id: 'dl-3',
        title: 'កិច្ចប្រជុំគរុកោសល្យ និងត្រួតពិនិត្យកិច្ចតែងការបង្រៀន',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'meeting',
        daysLeft: 1,
        isUrgent: true,
        targetTab: 'teacher_meetings' as ActiveTab
      }
    ];

    // Merge with calendar events if any upcoming
    const calendarDeadlines = calendarEvents
      .filter(e => e.date >= todayStr)
      .slice(0, 2)
      .map(e => {
        const diffTime = new Date(e.date).getTime() - new Date(todayStr).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          id: e.id,
          title: e.title,
          dueDate: e.date,
          category: 'calendar' as any,
          daysLeft: Math.max(0, diffDays),
          isUrgent: diffDays <= 2,
          targetTab: 'calendar' as ActiveTab
        };
      });

    return [...defaultDeadlines, ...calendarDeadlines].slice(0, 4);
  }, [calendarEvents, todayStr]);

  // Priority sorting mapping
  const priorityWeight: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1
  };

  // Filtered and priority-sorted tasks
  const sortedTasks = useMemo(() => {
    return [...teacherDailyTasks]
      .filter(task => {
        if (activeFilter === 'pending') return !task.isCompleted;
        if (activeFilter === 'completed') return task.isCompleted;
        if (activeFilter === 'urgent') return !task.isCompleted && (task.priority === 'urgent' || task.priority === 'high');
        return true;
      })
      .sort((a, b) => {
        // Incomplete tasks first
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        // Then by priority descending
        const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
        if (pDiff !== 0) return pDiff;
        // Then by date ascending (soonest deadline first)
        return (a.date || '').localeCompare(b.date || '');
      });
  }, [teacherDailyTasks, activeFilter]);

  // Quick stats
  const totalCount = teacherDailyTasks.length;
  const completedCount = teacherDailyTasks.filter(t => t.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const urgentCount = teacherDailyTasks.filter(t => !t.isCompleted && (t.priority === 'urgent' || t.priority === 'high')).length;

  const handleNavigate = (tab?: ActiveTab) => {
    if (!tab) return;
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addTeacherDailyTask({
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      category: formData.category,
      priority: formData.priority,
      isCompleted: false,
      gradeSection: formData.gradeSection,
      assignedTeacherName: formData.assignedTeacherName
    });

    setFormData({
      title: '',
      description: '',
      date: todayStr,
      startTime: '08:00',
      endTime: '09:00',
      category: 'admin',
      priority: 'high',
      gradeSection: 'ថ្នាក់ទី៥ក',
      assignedTeacherName: currentUser?.name || 'លោកគ្រូ សុខ វិទ្យា'
    });
    setIsAddModalOpen(false);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400 fill-rose-500/20" />
            បន្ទាន់ខ្លាំង
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            សំខាន់ខ្ពស់
          </span>
        );
      case 'normal':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            មធ្យម
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            ទូទៅ
          </span>
        );
    }
  };

  const getCategoryLabel = (category: TaskCategory) => {
    switch (category) {
      case 'admin':
        return 'រដ្ឋបាលសាលា';
      case 'exam_grading':
        return 'ស្រង់ពិន្ទុ & ប្រឡង';
      case 'teaching':
        return 'បង្រៀន & កិច្ចតែងការ';
      case 'meeting':
        return 'កិច្ចប្រជុំគ្រូ';
      case 'attendance':
        return 'បញ្ជីវត្តមាន';
      case 'google_calendar':
        return 'Google Calendar';
      default:
        return 'ទូទៅ';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-moul leading-tight">
              {isKhmer ? 'ភារកិច្ច និងរបៀបវារៈប្រចាំថ្ងៃរបស់គ្រូ (Teacher Daily Tasks)' : 'Teacher Daily Tasks & Agenda'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKhmer ? 'បញ្ជីភារកិច្ចរដ្ឋបាលដែលនៅសល់ កាលបរិច្ឆេទកំណត់ និងសេចក្តីជូនដំណឹងបន្ទាន់' : 'Pending administrative tasks, upcoming deadlines, and urgent notifications'}
            </p>
          </div>
        </div>

        {/* Quick KPI Stats & Add Task Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400">នៅសល់:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{pendingCount}</span>
            {urgentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold rounded text-[10px]">
                {urgentCount} បន្ទាន់
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isKhmer ? 'បន្ថែមភារកិច្ច' : 'Add Task'}</span>
          </button>
        </div>
      </div>

      {/* Urgent Notifications Alert Strip (If Any) */}
      {urgentNotifications.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/60 divide-y divide-amber-200/50 dark:divide-amber-800/40">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
            <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>សេចក្តីជូនដំណឹងសាលារៀនបន្ទាន់ (Urgent Announcements)</span>
          </div>
          {urgentNotifications.map(notif => (
            <div key={notif.id} className="pt-1.5 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{notif.title}:</span>
                <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{notif.message}</span>
              </div>
              {notif.actionTab && (
                <button
                  type="button"
                  onClick={() => handleNavigate(notif.actionTab)}
                  className="text-[11px] text-blue-700 dark:text-blue-400 font-bold hover:underline flex-shrink-0 flex items-center gap-0.5 cursor-pointer"
                >
                  ពិនិត្យ <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Deadlines Highlight Box */}
      <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            កាលបរិច្ឆេទកំណត់ដែលជិតមកដល់ (Upcoming Deadlines)
          </h4>
          <span className="text-[11px] text-slate-400">ស្វ័យប្រវត្តិពីប្រព័ន្ធ</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {upcomingDeadlines.map(dl => (
            <div
              key={dl.id}
              onClick={() => handleNavigate(dl.targetTab)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                dl.daysLeft <= 2
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {dl.title}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                    dl.daysLeft <= 2
                      ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {dl.daysLeft === 0 ? 'ថ្ងៃនេះ!' : `នៅសល់ ${dl.daysLeft} ថ្ងៃ`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-mono text-[10px]">{dl.dueDate}</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-[10px] flex items-center">
                  ចូលអនុវត្ត <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            ទាំងអស់ ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('urgent')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400'
            }`}
          >
            <Flame className="w-3 h-3" />
            បន្ទាន់ ({urgentCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            មិនទាន់រួច ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            បានបញ្ចប់ ({completedCount})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          តម្រៀបតាមអាទិភាព (Urgent &rarr; High &rarr; Normal)
        </span>
      </div>

      {/* Priority-Sorted Tasks List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto max-h-[380px]">
        {sortedTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="text-sm font-semibold">{isKhmer ? 'ពុំមានភារកិច្ចក្នុងប្រភេទនេះឡើយ' : 'No tasks in this category'}</p>
            <p className="text-xs mt-1 text-slate-400">{isKhmer ? 'ចុច «បន្ថែមភារកិច្ច» ដើម្បីកត់ត្រាការងារថ្មី' : 'Click "Add Task" to record a new task'}</p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const isOverdue = !task.isCompleted && task.date < todayStr;
            const isToday = task.date === todayStr;

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3 ${
                  task.isCompleted ? 'bg-slate-50/40 dark:bg-slate-900/40 opacity-70' : ''
                }`}
              >
                {/* Checkbox toggle & Task content */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTaskCompleted(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title={task.isCompleted ? 'សម្គាល់ថាមិនទាន់រួចរាល់' : 'សម្គាល់ថាបានបញ្ចប់'}
                  >
                    {task.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${
                          task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {getCategoryLabel(task.category)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-1.5">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : isToday
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{task.date}</span>
                        {isOverdue && <span>(ហួសកំណត់)</span>}
                        {isToday && <span>(ថ្ងៃនេះ)</span>}
                      </span>

                      {task.startTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-3 h-3" />
                            {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                          </span>
                        </>
                      )}

                      {task.gradeSection && (
                        <>
                          <span>•</span>
                          <span>{task.gradeSection}</span>
                        </>
                      )}

                      {task.assignedTeacherName && (
                        <>
                          <span>•</span>
                          <span>{task.assignedTeacherName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteTeacherDailyTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="លុបភារកិច្ច"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {isKhmer ? 'បន្ថែមភារកិច្ចរដ្ឋបាលគ្រូថ្មី' : 'Add New Teacher Task'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ចំណងជើងភារកិច្ច *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ឧ. បញ្ចូលពិន្ទុប្រឡងឆមាសទី១, រៀបចំកិច្ចតែងការ..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    កម្រិតអាទិភាព
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="urgent">🔴 បន្ទាន់ខ្លាំង (Urgent)</option>
                    <option value="high">🟠 សំខាន់ខ្ពស់ (High)</option>
                    <option value="normal">🟡 មធ្យម (Normal)</option>
                    <option value="low">🟢 ទូទៅ (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ប្រភេទការងារ
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="admin">រដ្ឋបាលសាលា</option>
                    <option value="exam_grading">ស្រង់ពិន្ទុ & ប្រឡង</option>
                    <option value="teaching">បង្រៀន & កិច្ចតែងការ</option>
                    <option value="meeting">កិច្ចប្រជុំគ្រូ</option>
                    <option value="attendance">បញ្ជីវត្តមាន</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    កាលបរិច្ឆេទ
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ម៉ោងចាប់ផ្តើម
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ម៉ោងបញ្ចប់
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ការពិពណ៌នាបន្ថែម
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ព័ត៌មានលម្អិតអំពីភារកិច្ច..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  រក្សាទុកភារកិច្ច
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
