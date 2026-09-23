import React from 'react';
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
  CheckCircle2
} from 'lucide-react';

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
    clearNotification
  } = useSchool();

  if (!isOpen) return null;

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
    if (currentUser.role === 'director') return true;
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-battambang">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-moul text-sm text-slate-800">សារដំណឹងប្រព័ន្ធ (Notifications)</h3>
              <p className="text-[11px] text-slate-500 font-battambang">ដំណឹងប្តូរលេខសម្ងាត់សិស្ស & កិច្ចការរដ្ឋបាល</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              title="អានទាំងអស់"
              className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>អានទាំងអស់</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userNotifications.length > 0 ? (
            userNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  notif.read
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-2xs'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === 'password_reset'
                        ? 'bg-amber-100 text-amber-700'
                        : notif.type === 'alert'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {notif.type === 'password_reset' ? (
                      <KeyRound className="w-4 h-4" />
                    ) : notif.type === 'alert' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                    <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    
                    <div className="flex items-center gap-3 mt-2 text-[10.5px] text-slate-400 font-times">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.timestamp}
                      </span>
                      {notif.meta?.studentName && (
                        <span className="flex items-center gap-1 font-battambang font-medium text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                          <User className="w-3 h-3" />
                          សិស្ស: {notif.meta.studentName}
                        </span>
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
                    className="text-slate-300 hover:text-red-600 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
              <p>ពុំមានសារដំណឹងថ្មីសម្រាប់អ្នកឡើយ</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>អ្នកប្រើប្រាស់៖ <strong className="text-slate-800">{currentUser?.nameKhmer}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
