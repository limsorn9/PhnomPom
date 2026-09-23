import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Newspaper,
  Calendar,
  Bell,
  Clock,
  Pin,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  CheckCircle2,
  CalendarDays,
  FileText,
  Users,
  Award,
  AlertCircle,
  Tag,
  Share2,
  Bookmark
} from 'lucide-react';
import { AcademicCalendarEvent } from '../types';

export interface SchoolAnnouncement {
  id: string;
  title: string;
  category: 'announcement' | 'event' | 'exam' | 'holiday' | 'meeting' | 'health_sport';
  content: string;
  publishDate: string; // YYYY-MM-DD
  dueDateOrEventDate?: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  isPinned?: boolean;
  isUrgent?: boolean;
  author: string;
  authorRole: string;
  imageUrl?: string;
  attachmentsCount?: number;
}

const DEFAULT_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'សេចក្តីជូនដំណឹងស្តីពីការរៀបចំកិច្ចប្រជុំមាតាបិតាសិស្សដើមឆមាស',
    category: 'meeting',
    content:
      'គណៈគ្រប់គ្រងសាលាបឋមសិក្សាភ្នំពុំ សូមគោរពអញ្ជើញមាតាបិតា ឬអាណាព្យាបាលសិស្សគ្រប់កម្រិតថ្នាក់ (ទី១ ដល់ ទី៦) ចូលរួមក្នុងកិច្ចប្រជុំពិភាក្សាអំពីការសិក្សា វិន័យ និងការចូលរួមគាំទ្រការអាននៅផ្ទះរបស់កូនៗ នៅថ្ងៃអាទិត្យ ទី១៥ វេលាម៉ោង ០៨:០០ ព្រឹក នៅសាលប្រជុំធំ។',
    publishDate: '2025-01-10',
    dueDateOrEventDate: '2025-01-15',
    targetAudience: 'parents',
    isPinned: true,
    isUrgent: true,
    author: 'លោកស្រី ម៉ៅ សុផានី',
    authorRole: 'នាយិកាសាលា'
  },
  {
    id: 'ann-2',
    title: 'យុទ្ធនាការ «បណ្ណាល័យបៃតង និងទិវាអំណានជាតិ» ប្រចាំឆ្នាំសិក្សា',
    category: 'announcement',
    content:
      'ដើម្បីលើកកម្ពស់វប្បធម៌អំណាន និងពង្រឹងសមត្ថភាពអក្ខរកម្ម បណ្ណាល័យសាលាបានបន្ថែមសៀវភៅរឿងនិទានគំនូរថ្មីៗចំនួន ៣៥០ ក្បាល។ សិស្សានុសិស្សទាំងអស់អាចមកខ្ចីអាន និងចូលរួមប្រកួតប្រជែងសង្ខេបរឿងដើម្បីឈ្នះរង្វាន់ជ័យលាភីប្រចាំខែ។',
    publishDate: '2025-01-08',
    dueDateOrEventDate: '2025-01-30',
    targetAudience: 'students',
    isPinned: true,
    isUrgent: false,
    author: 'អ្នកគ្រូ កែវ សុគន្ធា',
    authorRole: 'បណ្ណារក្ស'
  },
  {
    id: 'ann-3',
    title: 'ការត្រួតពិនិត្យសុខភាព អាហារូបត្ថម្ភ និងការផ្តល់ថ្នាំទម្លាក់ព្រូនជុំទី១',
    category: 'health_sport',
    content:
      'ក្រុមគ្រូពេទ្យនៃមណ្ឌលសុខភាពឃុំបារាំងធ្លាក់ នឹងចុះមកពិនិត្យសុខភាពទូទៅ វាស់កម្ពស់ ទម្ងន់ (BMI) ពិនិត្យសុខភាពមាត់ធ្មេញ និងផ្តល់ថ្នាំទម្លាក់ព្រូនជូនសិស្សានុសិស្សគ្រប់រូបដោយឥតគិតថ្លៃ។ សូមមាតាបិតាជួយណែនាំកូនៗឱ្យទទួលទានអាហារពេលព្រឹកឱ្យបានត្រឹមត្រូវ។',
    publishDate: '2025-01-05',
    dueDateOrEventDate: '2025-01-18',
    targetAudience: 'all',
    isPinned: false,
    isUrgent: false,
    author: 'គណៈកម្មការសុខភាពសាលារៀន',
    authorRole: 'ផ្នែកសុខភាពសិក្សា'
  }
];

export const SchoolNews: React.FC = () => {
  const { calendarEvents, setActiveTab, currentUser, showToast } = useSchool();

  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('phnom_pom_school_announcements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<SchoolAnnouncement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Announcement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SchoolAnnouncement['category']>('announcement');
  const [newContent, setNewContent] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTarget, setNewTarget] = useState<SchoolAnnouncement['targetAudience']>('all');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newIsUrgent, setNewIsUrgent] = useState(false);

  const saveAnnouncements = (updated: SchoolAnnouncement[]) => {
    setAnnouncements(updated);
    try {
      localStorage.setItem('phnom_pom_school_announcements', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('សូមបំពេញចំណងជើង និងខ្លឹមសារសេចក្តីជូនដំណឹង!', 'error');
      return;
    }

    const item: SchoolAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      publishDate: new Date().toISOString().split('T')[0],
      dueDateOrEventDate: newDueDate || undefined,
      targetAudience: newTarget,
      isPinned: newIsPinned,
      isUrgent: newIsUrgent,
      author: currentUser?.nameKhmer || 'គណៈគ្រប់គ្រងសាលា',
      authorRole: currentUser?.role === 'director' ? 'នាយកសាលា' : 'រដ្ឋបាលសាលា'
    };

    const updated = [item, ...announcements];
    saveAnnouncements(updated);
    showToast('បានបង្កើតសេចក្តីជូនដំណឹងថ្មីដោយជោគជ័យ!', 'success');

    // Reset Form
    setNewTitle('');
    setNewContent('');
    setNewDueDate('');
    setNewCategory('announcement');
    setNewTarget('all');
    setNewIsPinned(false);
    setNewIsUrgent(false);
    setIsAddModalOpen(false);
  };

  // Get upcoming calendar events from context (next 4 upcoming events)
  const upcomingEvents = [...calendarEvents]
    .filter(evt => evt.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);

  // Filtered announcements
  const filteredAnnouncements = announcements.filter(item => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'pinned') return item.isPinned;
    if (filterCategory === 'urgent') return item.isUrgent;
    return item.category === filterCategory;
  });

  const getCategoryBadge = (category: SchoolAnnouncement['category']) => {
    switch (category) {
      case 'meeting':
        return {
          label: 'កិច្ចប្រជុំ',
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
        };
      case 'exam':
        return {
          label: 'ការប្រឡង',
          className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
        };
      case 'holiday':
        return {
          label: 'ឈប់សម្រាក',
          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
        };
      case 'health_sport':
        return {
          label: 'សុខភាព & កីឡា',
          className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
        };
      case 'event':
        return {
          label: 'ព្រឹត្តិការណ៍',
          className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
        };
      default:
        return {
          label: 'សេចក្តីជូនដំណឹង',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40'
        };
    }
  };

  const getAudienceLabel = (target: SchoolAnnouncement['targetAudience']) => {
    switch (target) {
      case 'students':
        return 'សិស្សានុសិស្ស';
      case 'teachers':
        return 'លោកគ្រូ-អ្នកគ្រូ';
      case 'parents':
        return 'មាតាបិតា & អាណាព្យាបាល';
      default:
        return 'ទូទៅ (ទាំងអស់)';
    }
  };

  const getEventTypeLabel = (type: AcademicCalendarEvent['type']) => {
    switch (type) {
      case 'exam':
        return { label: 'សម័យប្រឡង', bg: 'bg-rose-500 text-white' };
      case 'holiday':
        return { label: 'បុណ្យជាតិ', bg: 'bg-emerald-600 text-white' };
      case 'vacation':
        return { label: 'វិស្សមកាល', bg: 'bg-amber-500 text-white' };
      case 'meeting':
        return { label: 'កិច្ចប្រជុំ', bg: 'bg-purple-600 text-white' };
      default:
        return { label: 'សកម្មភាព', bg: 'bg-blue-600 text-white' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-kantumruy flex items-center gap-2">
              <span>ព័ត៌មាន & ព្រឹត្តិការណ៍សាលារៀន</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-sans">
                {announcements.length} ដំណឹង
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              សេចក្តីជូនដំណឹងផ្លូវការ កាលវិភាគប្រឡង និងកម្មវិធីសំខាន់ៗរបស់សាលាបឋមសិក្សា
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="school-news-add-btn"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតដំណឹងថ្មី</span>
          </button>
          <button
            id="school-news-view-calendar-btn"
            type="button"
            onClick={() => setActiveTab('calendar')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>មើលប្រតិទិនពេញ</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Left 2 Columns for Announcements Cards, Right 1 Column for Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Recent Announcements Feed in Card Layout */}
        <div className="lg:col-span-2 space-y-3.5">
          {/* Category Tabs / Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ទាំងអស់ ({announcements.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('pinned')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                filterCategory === 'pinned'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>ដំណឹងសំខាន់ៗ</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('meeting')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'meeting'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              កិច្ចប្រជុំ
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('health_sport')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'health_sport'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              សុខភាព & សកម្មភាព
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredAnnouncements.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <Newspaper className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  មិនមានសេចក្តីជូនដំណឹងក្នុងផ្នែកនេះទេ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  លោកអ្នកអាចចុច «បង្កើតដំណឹងថ្មី» ដើម្បីផ្សព្វផ្សាយព័ត៌មានទៅកាន់សិស្ស និងមាតាបិតា។
                </p>
              </div>
            ) : (
              filteredAnnouncements.map(ann => {
                const badge = getCategoryBadge(ann.category);
                return (
                  <div
                    key={ann.id}
                    className={`relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 hover:shadow-md ${
                      ann.isPinned
                        ? 'border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/20 bg-amber-50/20 dark:bg-amber-950/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Row: Badges, Date & Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ann.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-700">
                            <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                            <span>ដំណឹងសំខាន់</span>
                          </span>
                        )}
                        {ann.isUrgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold border border-rose-300 dark:border-rose-800 animate-pulse">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>បន្ទាន់</span>
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{ann.publishDate}</span>
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        សម្រាប់: <strong className="text-slate-700 dark:text-slate-300">{getAudienceLabel(ann.targetAudience)}</strong>
                      </span>
                    </div>

                    {/* Announcement Title */}
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-kantumruy leading-snug mb-1.5">
                      {ann.title}
                    </h4>

                    {/* Content Snippet */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
                      {ann.content}
                    </p>

                    {/* Card Footer: Due Date, Author & Read More Button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {ann.author}
                        </span>
                        <span>•</span>
                        <span className="text-[11px]">{ann.authorRole}</span>
                        {ann.dueDateOrEventDate && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <Calendar className="w-3 h-3" />
                              <span>កាលបរិច្ឆេទ: {ann.dueDateOrEventDate}</span>
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer ml-auto"
                      >
                        <span>អានលម្អិត</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming School Events Card */}
        <div className="space-y-3.5">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-amber-300 border border-blue-400/30">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-kantumruy text-white">ព្រឹត្តិការណ៍ & កាលវិភាគខាងមុខ</h4>
                  <p className="text-[11px] text-slate-300 font-sans">Upcoming Key Events</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className="text-[11px] text-amber-300 hover:text-amber-200 font-bold hover:underline cursor-pointer"
              >
                ទាំងអស់
              </button>
            </div>

            {/* List of upcoming events */}
            <div className="space-y-2.5">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">មិនទាន់មានព្រឹត្តិការណ៍ក្នុងប្រតិទិននៅឡើយ</p>
              ) : (
                upcomingEvents.map((evt, idx) => {
                  const typeInfo = getEventTypeLabel(evt.type);
                  return (
                    <div
                      key={evt.id || idx}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors backdrop-blur-xs flex items-start gap-2.5"
                    >
                      {/* Date Badge */}
                      <div className="shrink-0 w-11 text-center bg-white/10 rounded-lg p-1 border border-white/10">
                        <span className="block text-[10px] uppercase font-bold text-amber-300">
                          {evt.startDate.slice(5, 7)}
                        </span>
                        <span className="block text-sm font-bold text-white leading-tight font-mono">
                          {evt.startDate.slice(8, 10)}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded leading-tight ${typeInfo.bg}`}
                          >
                            {typeInfo.label}
                          </span>
                          {evt.targetGrades && (
                            <span className="text-[10px] text-slate-300 truncate">
                              {evt.targetGrades}
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-white font-kantumruy leading-snug truncate">
                          {evt.titleKhmer}
                        </h5>
                        {evt.description && (
                          <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-light">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="w-full mt-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>គ្រប់គ្រងប្រតិទិនសិក្សា MoEYS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Notice Card for Homeroom & Parents */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/60 border border-blue-200/80 dark:border-slate-700 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white font-kantumruy">
                ការទំនាក់ទំនងមាតាបិតា & អាណាព្យាបាល
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                លោកគ្រូ-អ្នកគ្រូអាចផ្ញើសេចក្តីជូនដំណឹង ឬតាមដានសំណើសុំច្បាប់របស់អាណាព្យាបាលក្នុងផ្ទាំងបន្ទុកថ្នាក់។
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('homeroom_dashboard')}
                className="mt-2 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>ចូលទៅកាន់ផ្ទាំងគ្រូបន្ទុកថ្នាក់</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                  getCategoryBadge(selectedAnnouncement.category).className
                }`}
              >
                {getCategoryBadge(selectedAnnouncement.category).label}
              </span>
              {selectedAnnouncement.isPinned && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                  សំខាន់
                </span>
              )}
              {selectedAnnouncement.isUrgent && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
                  បន្ទាន់
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-kantumruy leading-snug mb-3">
              {selectedAnnouncement.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800 mb-4 font-sans">
              <div>
                កាលបរិច្ឆេទចេញផ្សាយ: <strong>{selectedAnnouncement.publishDate}</strong>
              </div>
              {selectedAnnouncement.dueDateOrEventDate && (
                <div>
                  កាលបរិច្ឆេទកម្មវិធី: <strong className="text-blue-600 dark:text-blue-400">{selectedAnnouncement.dueDateOrEventDate}</strong>
                </div>
              )}
              <div>
                អ្នកផ្សព្វផ្សាយ: <strong>{selectedAnnouncement.author} ({selectedAnnouncement.authorRole})</strong>
              </div>
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 whitespace-pre-line font-sans">
              {selectedAnnouncement.content}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                គោលដៅ: {getAudienceLabel(selectedAnnouncement.targetAudience)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Announcement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-kantumruy">
                  បង្កើតសេចក្តីជូនដំណឹងថ្មី
                </h3>
                <p className="text-xs text-slate-500">
                  ផ្សព្វផ្សាយដំណឹង ឬព្រឹត្តិការណ៍ទៅកាន់លោកគ្រូអ្នកគ្រូ សិស្ស និងមាតាបិតា
                </p>
              </div>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ចំណងជើងសេចក្តីជូនដំណឹង <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សេចក្តីជូនដំណឹងស្តីពី..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ប្រភេទដំណឹង
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as SchoolAnnouncement['category'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="announcement">សេចក្តីជូនដំណឹងទូទៅ</option>
                    <option value="meeting">កិច្ចប្រជុំ</option>
                    <option value="exam">ការប្រឡង</option>
                    <option value="holiday">ឈប់សម្រាកបុណ្យ</option>
                    <option value="health_sport">សុខភាព និងកីឡា</option>
                    <option value="event">ព្រឹត្តិការណ៍ពិសេស</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    មុខសញ្ញាទទួលដំណឹង
                  </label>
                  <select
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value as SchoolAnnouncement['targetAudience'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">ទាំងអស់ (ទូទៅ)</option>
                    <option value="students">សិស្សានុសិស្ស</option>
                    <option value="teachers">លោកគ្រូ-អ្នកគ្រូ</option>
                    <option value="parents">មាតាបិតា & អាណាព្យាបាល</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  កាលបរិច្ឆេទអនុវត្ត ឬថ្ងៃកម្មវិធី (បើមាន)
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ខ្លឹមសារសេចក្តីជូនដំណឹង <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="រៀបរាប់ខ្លឹមសារលម្អិត..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPinned}
                    onChange={e => setNewIsPinned(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>ដាក់ជាដំណឹងសំខាន់ (Pin)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsUrgent}
                    onChange={e => setNewIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>ដំណឹងបន្ទាន់ (Urgent)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  ចុះផ្សាយដំណឹង
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
