import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  KeyRound,
  Info,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Volume2
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
    dispatchSchoolEventAlert
  } = useSchool();

  const [activeFilter, setActiveFilter] = useState<'all' | 'score_deadline' | 'password_reset' | 'school_event' | 'alert'>('all');
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState<boolean>(false);

  // Broadcast Form State
  const [broadcastType, setBroadcastType] = useState<'score_deadline' | 'school_event' | 'alert' | 'info'>('score_deadline');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastGrade, setBroadcastGrade] = useState<number | 0>(0);
  const [broadcastDeadline, setBroadcastDeadline] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'high' | 'urgent'>('high');

  useEffect(() => {
    if (isOpen) {
      setIsPushEnabled(isPushNotificationGranted());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const result = await requestPushNotificationPermission();
    if (result === 'granted') {
      setIsPushEnabled(true);
      showBrowserPushNotification(
        '🔔 ប្រព័ន្ធសារដំណឹងបានបើកជោគជ័យ!',
        'លោកគ្រូ-អ្នកគ្រូនឹងទទួលបានការរំលឹកកាលបរិច្ឆេទបញ្ចូលពិន្ទុ និងដំណឹងបន្ទាន់ពីសាលា។'
      );
    }
  };

  const handleSendTestPush = () => {
    showBrowserPushNotification(
      '⏰ សាកល្បងសាររំលឹកកាលបរិច្ឆេទពិន្ទុ',
      'នេះជាសារដំណឹង Push Notification គំរូសម្រាប់រំលឹកការបញ្ចូលពិន្ទុប្រចាំខែ។'
    );
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
        'សាលាបឋមសិក្សាភ្នំពេញ/ភ្នំដី'
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

    // Reset Form
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
    if (currentUser.role === 'director' || currentUser.role === 'secretary') return true;
    return false;
  });

  const filteredNotifications = userNotifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const canBroadcast = currentUser?.role === 'director' || currentUser?.role === 'secretary';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-battambang">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-moul text-sm text-slate-800">សារដំណឹង និងការរំលឹក (Notifications)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {userNotifications.filter(n => !n.read).length} ថ្មី
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">ការរំលឹកកាលបរិច្ឆេទពិន្ទុ ប្តូរលេខសម្ងាត់សិស្ស & ដំណឹងសាលា</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              title="អានទាំងអស់"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-blue-100/60 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">អានទាំងអស់</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center text-base transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Push Notification Banner */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isPushEnabled ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-500 ring-4 ring-amber-100'}`} />
            <div>
              <p className="text-xs font-bold text-slate-800">
                {isPushEnabled ? 'បានភ្ជាប់ Push Notifications លើឧបករណ៍រួចរាល់' : 'បើក Push Notifications លើកុំព្យូទ័រ/ទូរស័ព្ទ'}
              </p>
              <p className="text-[11px] text-slate-500">ទទួលការរំលឹកទាន់ពេល ពេលដល់ថ្ងៃកំណត់បញ្ចូលពិន្ទុ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPushEnabled ? (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>បើកដំណឹង</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendTestPush}
                className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                សាកល្បង Test
              </button>
            )}
            {canBroadcast && (
              <button
                type="button"
                onClick={() => setShowBroadcastForm(!showBroadcastForm)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showBroadcastForm
                    ? 'bg-slate-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showBroadcastForm ? 'បិទផ្ញើដំណឹង' : 'ផ្សព្វផ្សាយដំណឹងថ្មី'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Broadcast Form for Director / Secretary */}
        {showBroadcastForm && (
          <form onSubmit={handleSendBroadcast} className="p-4 bg-indigo-50/50 border-b border-indigo-100 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                ផ្ញើសារដំណឹង ឬរំលឹកកាលបរិច្ឆេទទៅកាន់លោកគ្រូ-អ្នកគ្រូ
              </span>
              <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full font-bold">
                សិទ្ធិរដ្ឋបាល/នាយក
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ប្រភេទដំណឹង</label>
                <select
                  value={broadcastType}
                  onChange={e => setBroadcastType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="score_deadline">⏰ រំលឹកកាលបរិច្ឆេទពិន្ទុ</option>
                  <option value="school_event">📅 កម្មវិធី ឬកិច្ចប្រជុំសាលា</option>
                  <option value="alert">⚠️ សារព្រមានបន្ទាន់</option>
                  <option value="info">ℹ️ ព័ត៌មានទូទៅ</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">កម្រិតថ្នាក់</label>
                <select
                  value={broadcastGrade}
                  onChange={e => setBroadcastGrade(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>គ្រប់កម្រិតថ្នាក់ (ថ្នាក់ទី១-៦)</option>
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">កាលបរិច្ឆេទផុតកំណត់</label>
                <input
                  type="date"
                  value={broadcastDeadline}
                  onChange={e => setBroadcastDeadline(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">ចំណងជើងសារ</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="ឧ. ការរំលឹកបញ្ចូលពិន្ទុប្រឡងខែកុម្ភៈ ២០២៦..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">ខ្លឹមសារលម្អិត</label>
              <textarea
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="សរសេរខ្លឹមសាររំលឹក ឬការណែនាំជូនលោកគ្រូ-អ្នកគ្រូ..."
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBroadcastForm(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-200 transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ផ្ញើសារដំណឹងឥឡូវនេះ</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs bg-slate-50/50">
          {[
            { id: 'all', label: 'ទាំងអស់' },
            { id: 'score_deadline', label: '⏰ កាលបរិច្ឆេទពិន្ទុ' },
            { id: 'password_reset', label: '🔑 ប្តូរលេខសម្ងាត់' },
            { id: 'school_event', label: '📅 កម្មវិធីសាលា' },
            { id: 'alert', label: '⚠️ សារព្រមាន' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notif => {
              const isScoreDeadline = notif.type === 'score_deadline';
              const isPasswordReset = notif.type === 'password_reset';
              const isSchoolEvent = notif.type === 'school_event';
              const isAlert = notif.type === 'alert';

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    notif.read
                      ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      : 'bg-blue-50/80 border-blue-200 text-slate-900 shadow-xs'
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 animate-pulse" />
                  )}

                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                        isScoreDeadline
                          ? 'bg-amber-500 text-white'
                          : isPasswordReset
                          ? 'bg-blue-600 text-white'
                          : isSchoolEvent
                          ? 'bg-emerald-600 text-white'
                          : isAlert
                          ? 'bg-rose-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isScoreDeadline ? (
                        <Flame className="w-4.5 h-4.5" />
                      ) : isPasswordReset ? (
                        <KeyRound className="w-4.5 h-4.5" />
                      ) : isSchoolEvent ? (
                        <Calendar className="w-4.5 h-4.5" />
                      ) : isAlert ? (
                        <ShieldAlert className="w-4.5 h-4.5" />
                      ) : (
                        <Info className="w-4.5 h-4.5" />
                      )}
                    </div>

                    <div className="flex-1 pr-6 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                        {notif.priority === 'urgent' && (
                          <span className="px-2 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200">
                            បន្ទាន់ (Urgent)
                          </span>
                        )}
                        {notif.priority === 'high' && (
                          <span className="px-2 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                            សំខាន់
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                      {/* Deadline Tag if exists */}
                      {notif.deadlineDate && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold font-times">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>ផុតកំណត់៖ {notif.deadlineDate}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-times">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notif.timestamp}
                          </span>
                          {notif.meta?.studentName && (
                            <span className="flex items-center gap-1 font-battambang font-medium text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                              <User className="w-3 h-3" />
                              សិស្ស: {notif.meta.studentName}
                            </span>
                          )}
                        </div>

                        {/* Action Tab Navigation Button */}
                        {notif.actionTab && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationRead(notif.id);
                              setActiveTab(notif.actionTab!);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-100/80 hover:bg-blue-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>
                              {notif.actionTab === 'scores'
                                ? 'ទៅកាន់ទំព័រពិន្ទុ'
                                : notif.actionTab === 'calendar'
                                ? 'ពិនិត្យប្រតិទិន'
                                : 'ពិនិត្យមើល'}
                            </span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notif.id);
                      }}
                      title="លុបសារនេះ"
                      className="text-slate-300 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-bold text-slate-700">ពុំមានសារដំណឹងក្នុងផ្នែកនេះឡើយ</p>
              <p className="text-slate-400">អ្នកបានអាន និងដោះស្រាយគ្រប់សារដំណឹងទាំងអស់រួចរាល់</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>អ្នកប្រើប្រាស់៖ <strong className="text-slate-800">{currentUser?.nameKhmer}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};

