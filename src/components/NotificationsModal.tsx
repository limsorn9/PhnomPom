import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../context/SchoolContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  KeyRound,
  Info,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Volume2,
  RefreshCw,
  X,
  MapPin,
  Check
} from 'lucide-react';
import {
  requestPushNotificationPermission,
  isPushNotificationGranted,
  showBrowserPushNotification
} from '../services/fcmNotificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    setActiveTab,
    dispatchNotification,
    dispatchScoreDeadlineAlert,
    dispatchSchoolEventAlert,
    approveDirectorPasswordRequest,
    syncRealSchoolNotifications,
    showToast
  } = useSchool();

  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'score_deadline' | 'password_reset' | 'school_event' | 'alert'>('all');
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Broadcast Form State
  const [broadcastType, setBroadcastType] = useState<'score_deadline' | 'school_event' | 'alert' | 'info'>('score_deadline');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastGrade, setBroadcastGrade] = useState<number | 0>(0);
  const [broadcastDeadline, setBroadcastDeadline] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'high' | 'urgent'>('high');

  // Format relative time into clean, natural Khmer
  const formatKhmerRelativeTime = (timestamp: string): string => {
    if (!timestamp) return 'អម្បាញ់មិញ';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return 'អម្បាញ់មិញ';
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'អម្បាញ់មិញ';
      if (diffMin < 60) return `${diffMin} នាទីមុន`;
      if (diffHour < 24) return `${diffHour} ម៉ោងមុន`;
      if (diffDay === 1) return 'ម្សិលមិញ';
      if (diffDay < 7) return `${diffDay} ថ្ងៃមុន`;
      return date.toLocaleDateString('km-KH', { day: 'numeric', month: 'short' });
    } catch {
      return timestamp;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsPushEnabled(isPushNotificationGranted());
      if (syncRealSchoolNotifications) {
        syncRealSchoolNotifications();
      }
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (syncRealSchoolNotifications) {
      syncRealSchoolNotifications();
    }
    setTimeout(() => {
      setIsRefreshing(false);
      showToast?.('បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យដំណឹងជាក់ស្តែង!', 'info');
    }, 400);
  };

  const handleEnablePush = async () => {
    const result = await requestPushNotificationPermission();
    if (result === 'granted') {
      setIsPushEnabled(true);
      showBrowserPushNotification(
        '🔔 ប្រព័ន្ធសារដំណឹងបានបើកជោគជ័យ!',
        'លោកគ្រូ-អ្នកគ្រូនឹងទទួលបានការរំលឹកកាលបរិច្ឆេទបញ្ចូលពិន្ទុ និងដំណឹងបន្ទាន់ពីសាលា។'
      );
      showToast?.('បានបើក Browser Push Notifications ជោគជ័យ!', 'success');
    } else {
      showToast?.('ឧបករណ៍មិនអនុញ្ញាត ឬបានបិទ Notification ក្នុង Browser', 'error');
    }
  };

  const handleSendTestPush = () => {
    showBrowserPushNotification(
      '⏰ សាកល្បងសាររំលឹកកាលបរិច្ឆេទពិន្ទុ',
      'នេះជាសារដំណឹង Push Notification ជាក់ស្តែងសម្រាប់រំលឹកការបញ្ចូលពិន្ទុប្រចាំខែ។'
    );
    showToast?.('បានផ្ញើសារ Push សាកល្បងទៅកាន់ឧបករណ៍!', 'info');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    if (broadcastType === 'score_deadline') {
      dispatchScoreDeadlineAlert(
        broadcastTitle,
        broadcastDeadline || new Date().toISOString().split('T')[0],
        broadcastGrade > 0 ? broadcastGrade : undefined
      );
    } else if (broadcastType === 'school_event') {
      dispatchSchoolEventAlert(
        broadcastTitle,
        broadcastDeadline || new Date().toISOString().split('T')[0],
        'សាលាបឋមសិក្សាភ្នំព្រឹក'
      );
    } else {
      dispatchNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        type: broadcastType,
        targetRole: 'all',
        targetTeacherGrade: broadcastGrade > 0 ? broadcastGrade : undefined,
        priority: broadcastPriority,
        deadlineDate: broadcastDeadline || undefined,
        actionTab: broadcastType === 'score_deadline' ? 'scores' : 'calendar'
      });
    }

    setBroadcastTitle('');
    setBroadcastMessage('');
    setShowBroadcastForm(false);
  };

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter(n => {
    if (!currentUser) return false;
    if (n.targetRole === 'all') return true;
    if (n.targetRole === currentUser.role) {
      if (currentUser.role === 'teacher' && n.targetTeacherGrade && currentUser.assignedGrade) {
        return (
          n.targetTeacherGrade === currentUser.assignedGrade &&
          (!n.targetTeacherSection || n.targetTeacherSection === currentUser.assignedSection)
        );
      }
      return true;
    }
    if (currentUser.role === 'director' || currentUser.role === 'secretary' || currentUser.role === 'super_admin') return true;
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const filteredNotifications = userNotifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.type === activeFilter;
  });

  const handleClearAllRead = () => {
    userNotifications.filter(n => n.read).forEach(n => clearNotification(n.id));
    showToast?.('បានសម្អាតសារដែលបានអានរួចរាល់!', 'info');
  };

  const canBroadcast = currentUser?.role === 'director' || currentUser?.role === 'secretary' || currentUser?.role === 'super_admin';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center font-battambang">
      {/* Dimmed Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Bottom Sheet / Centered Card */}
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[88vh] sm:h-[650px] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-250">
        
        {/* Mobile Pull Handle Indicator */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden bg-slate-50 dark:bg-slate-850 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-850/95 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Title & Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-moul text-sm sm:text-base text-slate-800 dark:text-slate-100">
                    សារដំណឹង & ការរំលឹក
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                      {unreadCount} ថ្មី
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  ទិន្នន័យជាក់ស្តែងពីសាលា • កាលបរិច្ឆេទពិន្ទុ & វត្តមាន
                </p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Refresh */}
              <button
                type="button"
                onClick={handleManualRefresh}
                title="ធ្វើបច្ចុប្បន្នភាព"
                className="w-8 h-8 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  title="អានទាំងអស់"
                  className="h-8 px-2 rounded-xl text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">អានទាំងអស់</span>
                </button>
              )}

              {/* Close Modal */}
              <button
                type="button"
                onClick={onClose}
                title="បិទ"
                className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Clean, Non-Crowded Push & Broadcast Utility Bar */}
        <div className="bg-slate-100/80 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          {/* Push Status Pill / Button */}
          <div className="flex items-center gap-2">
            {!isPushEnabled ? (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>បើក Push សារដំណឹង</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Push Notification បានបើក
                </span>
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  className="ml-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  តេស្ត
                </button>
              </div>
            )}
          </div>

          {/* Director / Secretary Broadcast Button */}
          {canBroadcast && (
            <button
              type="button"
              onClick={() => setShowBroadcastForm(!showBroadcastForm)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 ${
                showBroadcastForm
                  ? 'bg-slate-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>{showBroadcastForm ? 'បិទផ្ញើ' : '📢 ផ្សព្វផ្សាយដំណឹង'}</span>
            </button>
          )}
        </div>

        {/* Collapsible Broadcast Form */}
        {showBroadcastForm && (
          <form onSubmit={handleSendBroadcast} className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 space-y-2.5 animate-in fade-in duration-150 shrink-0 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                ផ្សព្វផ្សាយដំណឹង ឬរំលឹកកាលបរិច្ឆេទ
              </span>
              <span className="text-[10px] text-indigo-700 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                សិទ្ធិនាយក/រដ្ឋបាល
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">ប្រភេទដំណឹង</label>
                <select
                  value={broadcastType}
                  onChange={e => setBroadcastType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="score_deadline">⏰ រំលឹកកាលបរិច្ឆេទពិន្ទុ</option>
                  <option value="school_event">📅 កម្មវិធី ឬកិច្ចប្រជុំសាលា</option>
                  <option value="alert">⚠️ សារព្រមានបន្ទាន់</option>
                  <option value="info">ℹ️ ព័ត៌មានទូទៅ</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">កម្រិតថ្នាក់គោលដៅ</label>
                <select
                  value={broadcastGrade}
                  onChange={e => setBroadcastGrade(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>គ្រប់កម្រិតថ្នាក់ (ថ្នាក់ទី១-៦)</option>
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">កាលបរិច្ឆេទផុតកំណត់</label>
                <input
                  type="date"
                  value={broadcastDeadline}
                  onChange={e => setBroadcastDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="ចំណងជើងសារដំណឹង..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <textarea
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="ខ្លឹមសារលម្អិតសម្រាប់ជូនដំណឹង..."
                rows={2}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBroadcastForm(false)}
                className="px-3 py-1 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>ផ្ញើចេញភ្លាមៗ</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills with Horizontal Touch Scroll */}
        <div className="px-4 py-2 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs shrink-0">
          {[
            { id: 'all', label: 'ទាំងអស់', count: userNotifications.length },
            { id: 'unread', label: 'មិនទាន់អាន', count: unreadCount },
            { id: 'score_deadline', label: '⏰ ពិន្ទុ' },
            { id: 'school_event', label: '📅 កម្មវិធីសាលា' },
            { id: 'alert', label: '⚠️ វត្តមាន' },
            { id: 'password_reset', label: '🔑 លេខសម្ងាត់' }
          ].map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer text-xs flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-2.5">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notif => {
              const isScoreDeadline = notif.type === 'score_deadline';
              const isPasswordReset = notif.type === 'password_reset';
              const isSchoolEvent = notif.type === 'school_event';
              const isAlert = notif.type === 'alert';
              const isUrgent = notif.priority === 'urgent';
              const isHigh = notif.priority === 'high';

              const accentBorder = isScoreDeadline
                ? 'border-l-amber-500'
                : isAlert
                ? 'border-l-rose-500'
                : isSchoolEvent
                ? 'border-l-emerald-500'
                : isPasswordReset
                ? 'border-l-blue-600'
                : 'border-l-indigo-500';

              const iconBg = isScoreDeadline
                ? 'bg-amber-500 text-white'
                : isAlert
                ? 'bg-rose-500 text-white'
                : isSchoolEvent
                ? 'bg-emerald-600 text-white'
                : isPasswordReset
                ? 'bg-blue-600 text-white'
                : 'bg-indigo-600 text-white';

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative border-l-4 ${accentBorder} ${
                    notif.read
                      ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      : 'bg-blue-50/70 dark:bg-blue-950/25 border-blue-200 dark:border-blue-900/60 shadow-xs'
                  }`}
                >
                  {/* Card Header: Type Badge + Priority + Time + Delete */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className={`w-5.5 h-5.5 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                        {isScoreDeadline ? (
                          <Flame className="w-3.5 h-3.5" />
                        ) : isPasswordReset ? (
                          <KeyRound className="w-3.5 h-3.5" />
                        ) : isSchoolEvent ? (
                          <Calendar className="w-3.5 h-3.5" />
                        ) : isAlert ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : (
                          <Info className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {isScoreDeadline
                          ? 'កាលបរិច្ឆេទពិន្ទុ'
                          : isSchoolEvent
                          ? 'កម្មវិធីសាលា'
                          : isPasswordReset
                          ? 'ប្តូរពាក្យសម្ងាត់'
                          : isAlert
                          ? 'សារព្រមាន'
                          : 'ព័ត៌មានទូទៅ'}
                      </span>

                      {isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                          បន្ទាន់
                        </span>
                      )}
                      {isHigh && !isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                          សំខាន់
                        </span>
                      )}

                      {!notif.read && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                          ថ្មី
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {formatKhmerRelativeTime(notif.timestamp)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notif.id);
                        }}
                        title="លុបសារដំណឹង"
                        className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {notif.title}
                  </h4>

                  {/* Message */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-battambang mt-1">
                    {notif.message}
                  </p>

                  {/* Metadata Chips */}
                  {(notif.deadlineDate || notif.meta?.studentName || notif.meta?.location) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {notif.deadlineDate && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 text-[11px] font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>ផុតកំណត់៖ {notif.deadlineDate}</span>
                        </div>
                      )}
                      {notif.meta?.studentName && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold">
                          <User className="w-3 h-3 text-blue-600" />
                          <span>សិស្ស៖ {notif.meta.studentName}</span>
                        </div>
                      )}
                      {notif.meta?.location && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{notif.meta.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(notif.actionTab || (isPasswordReset && currentUser?.role === 'director')) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                      {isPasswordReset && currentUser?.role === 'director' && notif.meta?.requesterUserId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveDirectorPasswordRequest(notif.id);
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>អនុម័តពាក្យសម្ងាត់ (Approve)</span>
                        </button>
                      )}

                      {notif.actionTab && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationRead(notif.id);
                            setActiveTab(notif.actionTab!);
                            onClose();
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/90 hover:bg-blue-200/90 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 px-3.5 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          <span>
                            {notif.actionTab === 'scores'
                              ? '👉 ទៅកាន់ទំព័រពិន្ទុ'
                              : notif.actionTab === 'calendar'
                              ? '👉 ពិនិត្យប្រតិទិនសាលា'
                              : notif.actionTab === 'attendance_health'
                              ? '👉 ពិនិត្យវត្តមានសិស្ស'
                              : notif.actionTab === 'students'
                              ? '👉 ពិនិត្យសំណើទិន្នន័យ'
                              : '👉 ពិនិត្យមើលលម្អិត'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-14 px-4 text-center flex flex-col items-center justify-center space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                ពុំមានសារដំណឹងក្នុងផ្នែកនេះឡើយ
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                រាល់សារដំណឹងសាលា និងកាលបរិច្ឆេទសំខាន់ៗត្រូវបានអាន ឬដោះស្រាយរួចរាល់។
              </p>
              <button
                type="button"
                onClick={handleManualRefresh}
                className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ទាញយកទិន្នន័យដំណឹងថ្មីៗឡើងវិញ</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            {userNotifications.some(n => n.read) && (
              <button
                type="button"
                onClick={handleClearAllRead}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>សម្អាតដែលបានអាន</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer active:scale-95"
          >
            បិទ
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
