import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AcademicCalendarEvent, CalendarEventType } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Download,
  CalendarCheck,
  Award,
  BookOpen,
  Coffee,
  Users,
  Flag,
  Sparkles,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  X,
  Share2
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  createGoogleCalendarEvent,
  batchSyncEventsToGoogleCalendar,
  generateGoogleCalendarWebUrl,
  exportToICalendarFile
} from '../services/googleCalendar';
import { googleSignIn } from '../services/googleAuth';

interface AcademicCalendarProps {
  googleUser: User | null;
  onGoogleAuthClick: () => void;
}

const MONTH_NAMES_KH = [
  'មករា (January)',
  'កុម្ភៈ (February)',
  'មីនា (March)',
  'មេសា (April)',
  'ឧសភា (May)',
  'មិថុនា (June)',
  'កក្កដា (July)',
  'សីហា (August)',
  'កញ្ញា (September)',
  'តុលា (October)',
  'វិច្ឆិកា (November)',
  'ធ្នូ (December)'
];

const DAY_NAMES_KH = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  googleUser,
  onGoogleAuthClick
}) => {
  const {
    schoolProfile,
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    markEventSynced,
    showToast
  } = useSchool();

  // View modes: 'grid' (Month Calendar) or 'agenda' (List / Timeline)
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2025, 1, 1)); // Default Feb 2025 in academic year
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected event modal
  const [selectedEvent, setSelectedEvent] = useState<AcademicCalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formState, setFormState] = useState<Omit<AcademicCalendarEvent, 'id'>>({
    titleKhmer: '',
    titleLatin: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'academic',
    description: '',
    targetGrades: 'ថ្នាក់ទី១ ដល់ ទី៦',
    isOfficialHoliday: false,
    location: schoolProfile.nameKhmer
  });

  // Sync state
  const [isSyncingAll, setIsSyncAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; title: string } | null>(null);
  const [syncingEventId, setSyncingEventId] = useState<string | null>(null);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter(event => {
      const matchesType = selectedTypeFilter === 'all' || event.type === selectedTypeFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        event.titleKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.titleLatin && event.titleLatin.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.targetGrades && event.targetGrades.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [calendarEvents, selectedTypeFilter, searchQuery]);

  // Next upcoming key events
  const upcomingEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return [...calendarEvents]
      .filter(e => e.endDate >= todayStr || e.startDate >= '2025-01-01')
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 4);
  }, [calendarEvents]);

  // Calendar Grid Computations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    return { totalDays, firstDayIndex };
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper for event style by type
  const getEventBadgeStyle = (type: CalendarEventType) => {
    switch (type) {
      case 'exam':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badgeBg: 'bg-rose-600 text-white',
          dot: 'bg-rose-500',
          border: 'border-l-4 border-l-rose-500',
          label: 'ការប្រឡង',
          icon: Award
        };
      case 'holiday':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-500 text-white',
          dot: 'bg-amber-500',
          border: 'border-l-4 border-l-amber-500',
          label: 'បុណ្យជាតិ',
          icon: Flag
        };
      case 'vacation':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-600 text-white',
          dot: 'bg-emerald-500',
          border: 'border-l-4 border-l-emerald-500',
          label: 'វិស្សមកាល',
          icon: Coffee
        };
      case 'meeting':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-900',
          badgeBg: 'bg-blue-600 text-white',
          dot: 'bg-blue-500',
          border: 'border-l-4 border-l-blue-500',
          label: 'កិច្ចប្រជុំ',
          icon: Users
        };
      case 'ceremony':
        return {
          bg: 'bg-purple-50 border-purple-200 text-purple-900',
          badgeBg: 'bg-purple-600 text-white',
          dot: 'bg-purple-500',
          border: 'border-l-4 border-l-purple-500',
          label: 'ពិធីបុណ្យ/កម្មវិធី',
          icon: Sparkles
        };
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          badgeBg: 'bg-indigo-600 text-white',
          dot: 'bg-indigo-500',
          border: 'border-l-4 border-l-indigo-500',
          label: 'សិក្សាធិការ',
          icon: BookOpen
        };
    }
  };

  // Get events on a specific day in the current month
  const getEventsForDay = (dayNumber: number) => {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    return calendarEvents.filter(
      event => formattedDay >= event.startDate && formattedDay <= event.endDate
    );
  };

  // Handle open create/edit modal
  const handleOpenCreateModal = (dateStr?: string) => {
    setIsEditing(false);
    setFormState({
      titleKhmer: '',
      titleLatin: '',
      startDate: dateStr || new Date().toISOString().split('T')[0],
      endDate: dateStr || new Date().toISOString().split('T')[0],
      type: 'academic',
      description: '',
      targetGrades: 'ថ្នាក់ទី១ ដល់ ទី៦',
      isOfficialHoliday: false,
      location: schoolProfile.nameKhmer
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (event: AcademicCalendarEvent) => {
    setIsEditing(true);
    setSelectedEvent(event);
    setFormState({
      titleKhmer: event.titleKhmer,
      titleLatin: event.titleLatin || '',
      startDate: event.startDate,
      endDate: event.endDate,
      type: event.type,
      description: event.description || '',
      targetGrades: event.targetGrades || 'ថ្នាក់ទី១ ដល់ ទី៦',
      isOfficialHoliday: event.isOfficialHoliday || false,
      location: event.location || schoolProfile.nameKhmer
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.titleKhmer.trim()) {
      showToast('សូមបញ្ចូលចំណងជើងកម្មវិធី/ការប្រឡង', 'error');
      return;
    }
    if (formState.endDate < formState.startDate) {
      showToast('កាលបរិច្ឆេទបញ្ចប់មិនអាចមុនកាលបរិច្ឆេទចាប់ផ្តើមបានទេ', 'error');
      return;
    }

    if (isEditing && selectedEvent) {
      updateCalendarEvent(selectedEvent.id, formState);
    } else {
      addCalendarEvent(formState);
    }
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('តើលោកអ្នកពិតជាចង់លុបព្រឹត្តិការណ៍នេះចេញពីប្រតិទិនសាលាមែនទេ?')) {
      deleteCalendarEvent(id);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
    }
  };

  // Single event sync to Google Calendar
  const handleSyncSingleEvent = async (event: AcademicCalendarEvent) => {
    setSyncingEventId(event.id);
    try {
      let authUser = googleUser;
      if (!authUser) {
        const authRes = await googleSignIn();
        if (!authRes) {
          setSyncingEventId(null);
          return;
        }
      }

      const res = await createGoogleCalendarEvent(event, schoolProfile);
      if (res.success) {
        markEventSynced(event.id, res.eventId);
        showToast(`បានបញ្ចូល «${event.titleKhmer}» ទៅ Google Calendar ជោគជ័យ!`);
      }
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការ Sync ទៅ Google Calendar', 'error');
    } finally {
      setSyncingEventId(null);
    }
  };

  // Batch sync all calendar events to Google Calendar
  const handleBatchSyncAll = async () => {
    if (calendarEvents.length === 0) {
      showToast('ពុំមានព្រឹត្តិការណ៍សម្រាប់ Sync ទេ', 'info');
      return;
    }

    let authUser = googleUser;
    if (!authUser) {
      try {
        const authRes = await googleSignIn();
        if (!authRes) return;
      } catch (err: any) {
        showToast(err.message || 'សូមភ្ជាប់គណនី Google ជាមុនសិន', 'error');
        return;
      }
    }

    setIsSyncAll(true);
    setSyncProgress({ current: 0, total: calendarEvents.length, title: 'កំពុងចាប់ផ្តើម...' });

    try {
      const res = await batchSyncEventsToGoogleCalendar(
        calendarEvents,
        schoolProfile,
        (current, total, title) => {
          setSyncProgress({ current, total, title });
        }
      );

      res.results.forEach(r => {
        if (r.success) {
          markEventSynced(r.id);
        }
      });

      if (res.failedCount === 0) {
        showToast(`បានធ្វើសមកាលកម្មព្រឹត្តិការណ៍ទាំង ${res.syncedCount} ទៅ Google Calendar ជោគជ័យ!`);
      } else {
        showToast(`បាន Sync ជោគជ័យ ${res.syncedCount} និងបរាជ័យ ${res.failedCount}`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងដំណើរការ Sync', 'error');
    } finally {
      setIsSyncAll(false);
      setSyncProgress(null);
    }
  };

  // Export to .ics file
  const handleDownloadICS = () => {
    try {
      exportToICalendarFile(filteredEvents, schoolProfile);
      showToast('បានទាញយកឯកសារ iCalendar (.ics) ដោយជោគជ័យ!');
    } catch (err: any) {
      showToast('បរាជ័យក្នុងការទាញយកឯកសារ', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Academic Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-300" />
              <span>ប្រតិទិនសិក្សាធិការ និងសម័យប្រឡងផ្លូវការ (MoEYS Academic Calendar)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-moul text-amber-300 drop-shadow-sm tracking-wide">
              ប្រតិទិនសិក្សា {schoolProfile.nameKhmer}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-battambang leading-relaxed">
              កាលវិភាគនៃការប្រឡងឆមាសទី១-ទី២ ថ្ងៃឈប់សម្រាកបុណ្យជាតិ វិស្សមកាលតូច-ធំ និងការធ្វើសមកាលកម្មដោយផ្ទាល់ជាមួយ <span className="font-times font-bold text-white">Google Calendar</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមកម្មវិធី</span>
            </button>

            <button
              onClick={handleBatchSyncAll}
              disabled={isSyncingAll}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 shadow-md ${
                isSyncingAll
                  ? 'bg-amber-600 text-white opacity-80 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title="Sync events to Google Calendar"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'កំពុង Sync...' : 'Sync ទៅ Google Calendar'}</span>
            </button>

            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 border border-white/20 text-sm font-medium transition-colors"
              title="ទាញយកឯកសារ iCalendar (.ics) សម្រាប់ដាក់ក្នុងទូរស័ព្ទដៃ"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline font-times">.ICS</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 border border-white/20 text-sm font-medium transition-colors"
              title="បោះពុម្ពប្រតិទិនសិក្សា"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar for Batch Sync */}
        {isSyncingAll && syncProgress && (
          <div className="mt-5 p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-blue-200">
              <span className="font-battambang">
                កំពុង Sync ព្រឹត្តិការណ៍៖ <strong className="text-white">{syncProgress.title}</strong>
              </span>
              <span className="font-times font-bold">
                {syncProgress.current} / {syncProgress.total}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Highlights Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 no-print">
        {upcomingEvents.map((evt) => {
          const style = getEventBadgeStyle(evt.type);
          const Icon = style.icon;
          return (
            <div
              key={evt.id}
              onClick={() => handleOpenEditModal(evt)}
              className={`p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${style.border}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.bg}`}>
                    <Icon className="w-3 h-3" />
                    <span>{style.label}</span>
                  </span>
                  {evt.isSyncedToGoogle && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-times">
                      <CheckCircle2 className="w-3 h-3" /> Google Sync
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {evt.titleKhmer}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {evt.description || evt.targetGrades}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-times">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} ដល់ ${evt.endDate}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* View Switcher & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ប្រតិទិនប្រចាំខែ (Grid)
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              តារាងកាលវិភាគ (Agenda)
            </button>
          </div>

          {viewMode === 'grid' && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                title="ខែមុន"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-moul text-xs text-blue-900 px-2 min-w-[140px] text-center">
                {MONTH_NAMES_KH[month]} <span className="font-times">{year}</span>
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                title="ខែបន្ទាប់"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={jumpToToday}
                className="ml-1 text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-colors font-times"
              >
                Today
              </button>
            </div>
          )}
        </div>

        {/* Filter categories & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 font-battambang font-medium cursor-pointer"
            >
              <option value="all">គ្រប់ប្រភេទព្រឹត្តិការណ៍ (All)</option>
              <option value="exam">ការប្រឡង (Exams)</option>
              <option value="holiday">ថ្ងៃឈប់សម្រាកបុណ្យជាតិ (Holidays)</option>
              <option value="vacation">វិស្សមកាល (Vacations)</option>
              <option value="academic">សិក្សាធិការ (Academic)</option>
              <option value="meeting">កិច្ចប្រជុំ (Meetings)</option>
              <option value="ceremony">ពិធីបុណ្យ/កម្មវិធី (Ceremony)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកកម្មវិធី ឬការប្រឡង..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Main Calendar Views */}
      {viewMode === 'grid' ? (
        /* Month Grid Calendar */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Day Headers (Sun - Sat) */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-semibold text-slate-700">
            {DAY_NAMES_KH.map((d, idx) => (
              <div key={d} className={`${idx === 0 ? 'text-rose-600 font-bold' : ''}`}>
                <span>{d}</span>
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {/* Previous month empty trailing days */}
            {Array.from({ length: daysInMonth.firstDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[100px] sm:min-h-[120px] bg-slate-50/50 p-1.5 opacity-40"></div>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth.totalDays }).map((_, index) => {
              const dayNum = index + 1;
              const dayEvents = getEventsForDay(dayNum);
              const isSunday = (index + daysInMonth.firstDayIndex) % 7 === 0;
              const today = new Date();
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === dayNum;

              const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleOpenCreateModal(formattedDateStr)}
                  className={`min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors hover:bg-blue-50/30 cursor-pointer group relative ${
                    isToday ? 'bg-blue-50/60 ring-2 ring-blue-500 ring-inset z-10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-times text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white font-bold'
                          : isSunday
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-times hidden sm:inline">
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const style = getEventBadgeStyle(evt.type);
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(evt);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium truncate flex items-center gap-1 border hover:scale-[1.02] transition-transform ${style.bg}`}
                          title={`${evt.titleKhmer} (${evt.startDate} to ${evt.endDate})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`}></span>
                          <span className="truncate">{evt.titleKhmer}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-blue-600 font-semibold px-1">
                        + {dayEvents.length - 3} ទៀត
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Timeline View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-medium font-battambang">ពុំមានព្រឹត្តិការណ៍ ឬកាលបរិច្ឆេទប្រឡងត្រូវគ្នានឹងការស្វែងរកឡើយ</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const style = getEventBadgeStyle(evt.type);
              const Icon = style.icon;
              const webUrl = generateGoogleCalendarWebUrl(evt, schoolProfile.nameKhmer, evt.location);

              return (
                <div
                  key={evt.id}
                  className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${style.bg}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.badgeBg}`}>
                          {style.label}
                        </span>
                        {evt.isOfficialHoliday && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                            ឈប់សម្រាកផ្លូវការ
                          </span>
                        )}
                        {evt.targetGrades && (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {evt.targetGrades}
                          </span>
                        )}
                        {evt.isSyncedToGoogle && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-times font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Synced to Google
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {evt.titleKhmer}
                        {evt.titleLatin && (
                          <span className="font-times font-normal text-xs text-slate-400 ml-2">
                            ({evt.titleLatin})
                          </span>
                        )}
                      </h3>

                      {evt.description && (
                        <p className="text-xs text-slate-600 font-battambang leading-relaxed max-w-3xl">
                          {evt.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-times">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.startDate}</span>
                          {evt.startDate !== evt.endDate && (
                            <>
                              <span className="text-slate-400">→</span>
                              <span>{evt.endDate}</span>
                            </>
                          )}
                        </div>
                        {evt.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-battambang">{evt.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this event */}
                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 no-print">
                    <button
                      onClick={() => handleSyncSingleEvent(evt)}
                      disabled={syncingEventId === evt.id}
                      className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                      title="Sync ព្រឹត្តិការណ៍នេះទៅ Google Calendar ផ្ទាល់ខ្លួន"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingEventId === evt.id ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>

                    <a
                      href={webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors inline-flex items-center"
                      title="បើកក្នុង Google Calendar Web"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleOpenEditModal(evt)}
                      className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                      title="កែប្រែ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                      title="លុប"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Official Print Header (Visible only when printing) */}
      <div className="print-only hidden space-y-6 pt-4">
        <div className="flex justify-between items-start text-xs font-battambang border-b border-slate-300 pb-4">
          <div>
            <p>ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p>មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
            <p>ការិយាល័យអប់រំ ស្រុក{schoolProfile.district}</p>
            <p className="font-bold text-sm text-blue-950 font-moul mt-1">{schoolProfile.nameKhmer}</p>
          </div>
          <div className="text-right">
            <p>ឆ្នាំសិក្សា៖ <span className="font-times font-bold">{schoolProfile.academicYear}</span></p>
            <p>អត្តលេខសាលា៖ <span className="font-times font-bold">{schoolProfile.schoolCode}</span></p>
            <p className="text-[10px] text-slate-500 mt-1">កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}</p>
          </div>
        </div>

        <div className="text-center py-2">
          <h2 className="font-moul text-base text-slate-900">
            ប្រតិទិនសិក្សាធិការ សម័យប្រឡង និងថ្ងៃឈប់សម្រាកផ្លូវការ
          </h2>
        </div>

        <table className="w-full text-xs border-collapse border border-slate-800 font-battambang">
          <thead>
            <tr className="bg-slate-100 text-slate-900">
              <th className="border border-slate-800 p-2 text-center w-12 font-times">ល.រ</th>
              <th className="border border-slate-800 p-2 text-left">កម្មវិធី / ខ្លឹមសារ</th>
              <th className="border border-slate-800 p-2 text-center w-36 font-times">កាលបរិច្ឆេទ</th>
              <th className="border border-slate-800 p-2 text-center w-24">ប្រភេទ</th>
              <th className="border border-slate-800 p-2 text-left w-48">ចំណាំ / ថ្នាក់</th>
            </tr>
          </thead>
          <tbody>
            {calendarEvents.map((evt, idx) => (
              <tr key={evt.id}>
                <td className="border border-slate-800 p-2 text-center font-times">{idx + 1}</td>
                <td className="border border-slate-800 p-2 font-bold">{evt.titleKhmer}</td>
                <td className="border border-slate-800 p-2 text-center font-times">
                  {evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} ដល់ ${evt.endDate}`}
                </td>
                <td className="border border-slate-800 p-2 text-center">
                  {getEventBadgeStyle(evt.type).label}
                </td>
                <td className="border border-slate-800 p-2">{evt.description || evt.targetGrades}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center pt-8 text-xs font-battambang">
          <div className="text-center">
            <p>បានឃើញ និងឯកភាព</p>
            <p className="font-bold pt-1">ប្រធានការិយាល័យអប់រំ យុវជន និងកីឡា</p>
          </div>
          <div className="text-center">
            <p>{schoolProfile.district}, ថ្ងៃទី...... ខែ...... ឆ្នាំ២០២៥</p>
            <p className="font-moul pt-1">{schoolProfile.nameKhmer}</p>
            <p className="font-bold pt-8">{schoolProfile.principalName}</p>
          </div>
        </div>
      </div>

      {/* Modal for Add / Edit Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-moul text-blue-900">
                {isEditing ? 'កែប្រែព័ត៌មានប្រតិទិន' : 'បញ្ចូលព្រឹត្តិការណ៍ / ការប្រឡងថ្មី'}
              </h3>
              <button
                onClick={() => {
                  setIsEventModalOpen(false);
                  setSelectedEvent(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ចំណងជើងជាភាសាខ្មែរ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.titleKhmer}
                  onChange={(e) => setFormState({ ...formState, titleKhmer: e.target.value })}
                  placeholder="ឧ. ការប្រឡងឆមាសទី១, ពិធីបុណ្យចូលឆ្នាំថ្មី..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-battambang"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-times">
                    Title in Latin (Optional)
                  </label>
                  <input
                    type="text"
                    value={formState.titleLatin}
                    onChange={(e) => setFormState({ ...formState, titleLatin: e.target.value })}
                    placeholder="e.g. Semester 1 Exam"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-times"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ប្រភេទព្រឹត្តិការណ៍ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formState.type}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value as CalendarEventType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-battambang"
                  >
                    <option value="exam">ការប្រឡង (Exams)</option>
                    <option value="holiday">ថ្ងៃឈប់សម្រាកបុណ្យជាតិ (National Holiday)</option>
                    <option value="vacation">វិស្សមកាលសិក្សា (Vacation)</option>
                    <option value="academic">សិក្សាធិការទូទៅ (Academic Event)</option>
                    <option value="meeting">កិច្ចប្រជុំគណៈគ្រប់គ្រង (Meeting)</option>
                    <option value="ceremony">ពិធីបុណ្យ/កម្មវិធីសាលា (Ceremony)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-times">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.startDate}
                    onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-times"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 font-times">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.endDate}
                    onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-times"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    កម្រិតថ្នាក់គោលដៅ
                  </label>
                  <input
                    type="text"
                    value={formState.targetGrades}
                    onChange={(e) => setFormState({ ...formState, targetGrades: e.target.value })}
                    placeholder="ឧ. ថ្នាក់ទី១ ដល់ ទី៦, ថ្នាក់ទី៦ក..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-battambang"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ទីតាំងប្រារព្ធ / បន្ទប់
                  </label>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    placeholder={schoolProfile.nameKhmer}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-battambang"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ការពិពណ៌នាលម្អិត / សេចក្តីណែនាំ
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="ព័ត៌មានលម្អិតអំពីសម័យប្រឡង កាលវិភាគ ឬកម្មវិធី..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-battambang"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isOfficialHoliday"
                  checked={formState.isOfficialHoliday}
                  onChange={(e) => setFormState({ ...formState, isOfficialHoliday: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isOfficialHoliday" className="text-slate-700 font-medium cursor-pointer">
                  ជាថ្ងៃឈប់សម្រាកផ្លូវការរបស់រដ្ឋ/ក្រសួងអប់រំ (Official Public Holiday)
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {isEditing && selectedEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>លុបចោល</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEventModalOpen(false);
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {isEditing ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលកម្មវិធី'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
