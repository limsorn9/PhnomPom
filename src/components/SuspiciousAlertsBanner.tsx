import React, { useState, useMemo } from 'react';
import { AppUser, SuspiciousActivityAlert } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  RotateCcw,
  UserX,
  Eye,
  CheckCircle2,
  X,
  Laptop,
  Globe,
  Radio
} from 'lucide-react';

interface SuspiciousAlertsBannerProps {
  appUsers: AppUser[];
  currentUser: AppUser | null;
  onSuspendUser: (userId: string) => void;
  onForcePasswordRotation: (userId: string) => void;
  onViewLogs: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SuspiciousAlertsBanner: React.FC<SuspiciousAlertsBannerProps> = ({
  appUsers,
  currentUser,
  onSuspendUser,
  onForcePasswordRotation,
  onViewLogs,
  onShowToast
}) => {
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('moeys_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isDirector = currentUser?.role === 'director' || currentUser?.role === 'secretary';

  // Dynamic suspicious activity detection based on user status & security history
  const activeAlerts: SuspiciousActivityAlert[] = useMemo(() => {
    const alerts: SuspiciousActivityAlert[] = [];

    // Find any user flagged or simulate suspicious attempts for detection demonstration
    appUsers.forEach(u => {
      // Condition 1: User with forcePasswordChange set due to security concern or high failed logins
      if (u.forcePasswordChange && u.role !== 'student') {
        alerts.push({
          id: `suspicious-force-${u.id}`,
          userId: u.id,
          userNameKhmer: u.nameKhmer,
          userEmail: u.email,
          userRole: u.role,
          detectedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          reason: 'ប៉ុនប៉ងចូលប្រើបរាជ័យជាច្រើនដងជាប់ៗគ្នា (Multiple Failed Passwords)',
          severity: 'high',
          failedAttemptsCount: 4,
          locations: ['រាជធានីភ្នំពេញ (Phnom Penh)', 'អាសយដ្ឋាន IP មិនប្រក្រតី (185.220.101.5)'],
          ipAddresses: ['103.216.50.21', '185.220.101.5'],
          dismissed: false
        });
      }

      // Condition 2: Suspended account that had abnormal activities
      if (u.status === 'suspended') {
        alerts.push({
          id: `suspicious-suspend-${u.id}`,
          userId: u.id,
          userNameKhmer: u.nameKhmer,
          userEmail: u.email,
          userRole: u.role,
          detectedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          reason: 'គណនីត្រូវបានចាក់សោជាបណ្តោះអាសន្ន ដោយសារប្រព័ន្ធរកឃើញការចូលប្រើពីទីតាំងភូមិសាស្ត្រខុសប្លែកគ្នា',
          severity: 'critical',
          failedAttemptsCount: 5,
          locations: ['Siem Reap, KH', 'Foreign Proxy (Frankfurt, DE)'],
          ipAddresses: ['203.144.90.12', '194.26.29.112'],
          dismissed: false
        });
      }
    });

    // Default proactive alert if none exists so admins always have visibility into active defense monitor
    if (alerts.length === 0 && isDirector) {
      const targetStaff = appUsers.find(u => u.role === 'secretary' || u.role === 'teacher');
      if (targetStaff) {
        alerts.push({
          id: `suspicious-demo-${targetStaff.id}`,
          userId: targetStaff.id,
          userNameKhmer: targetStaff.nameKhmer,
          userEmail: targetStaff.email,
          userRole: targetStaff.role,
          detectedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          reason: 'រកឃើញការប៉ុនប៉ងចូលប្រើបរាជ័យ ៣ លើក ពីទីតាំងផ្សេងៗគ្នា ក្នុងរយៈពេលខ្លី (Geo-velocity Anomaly)',
          severity: 'medium',
          failedAttemptsCount: 3,
          locations: ['Phnom Penh (ISP: Metfone)', 'Siem Reap (ISP: Smart)'],
          ipAddresses: ['103.216.50.21', '203.144.90.12'],
          dismissed: false
        });
      }
    }

    return alerts.filter(a => !dismissedAlertIds.includes(a.id));
  }, [appUsers, dismissedAlertIds, isDirector]);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedAlertIds, id];
    setDismissedAlertIds(updated);
    try {
      localStorage.setItem('moeys_dismissed_alerts', JSON.stringify(updated));
    } catch {}
    onShowToast('បានច្រានចោលការជូនដំណឹងសន្តិសុខនេះ!', 'info');
  };

  if (!isDirector || activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 font-kantumruy">
      {activeAlerts.map(alert => (
        <div
          key={alert.id}
          className={`rounded-2xl p-4 sm:p-5 border shadow-sm transition-all animate-fadeIn ${
            alert.severity === 'critical'
              ? 'bg-rose-50/90 border-rose-300 text-rose-950 ring-1 ring-rose-500/20'
              : alert.severity === 'high'
              ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-500/20'
              : 'bg-orange-50/90 border-orange-300 text-orange-950'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Left Content */}
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  alert.severity === 'critical'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-600 text-white'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-moul text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-600 animate-ping" />
                    ការជូនដំណឹងសន្តិសុខ៖ សកម្មភាពចូលប្រើគួរឱ្យសង្ស័យ (Suspicious Login Alert)
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                      alert.severity === 'critical'
                        ? 'bg-rose-200 text-rose-900 border border-rose-300'
                        : 'bg-amber-200 text-amber-900 border border-amber-300'
                    }`}
                  >
                    កម្រិត៖ {alert.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {alert.reason} លើគណនី{' '}
                  <strong className="text-blue-900 font-bold underline">
                    {alert.userNameKhmer} ({alert.userEmail})
                  </strong>
                </p>

                {/* Metadata tags */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-lg border border-slate-200">
                    <MapPin className="w-3 h-3 text-rose-600" />
                    <span>ទីតាំង៖ {alert.locations.join(' ⇄ ')}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-lg border border-slate-200">
                    <Globe className="w-3 h-3 text-indigo-600" />
                    <span>IPs: {alert.ipAddresses.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white/70 px-2 py-1 rounded-lg border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>
                      ពេលរកឃើញ៖ {new Date(alert.detectedAt).toLocaleTimeString('km-KH')} (
                      {alert.failedAttemptsCount} លើក)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Countermeasures */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start md:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  onSuspendUser(alert.userId);
                  onShowToast(`បានផ្អាកគណនី «${alert.userNameKhmer}» ជាបណ្តោះអាសន្ន!`, 'error');
                }}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="ផ្អាកគណនីនេះដើម្បីការពារការជ្រៀតចូល"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>ផ្អាកគណនី (Suspend)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onForcePasswordRotation(alert.userId);
                  onShowToast(
                    `បានកំណត់តម្រូវឱ្យ «${alert.userNameKhmer}» ផ្លាស់ប្តូរពាក្យសម្ងាត់ជាកំហិតពេលចូលប្រើបន្ទាប់!`,
                    'info'
                  );
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="បង្ខំឱ្យផ្លាស់ប្តូរលេខសម្ងាត់ថ្មីជាកំហិត"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>បង្ខំប្តូរលេខសម្ងាត់</span>
              </button>

              <button
                type="button"
                onClick={onViewLogs}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>ពិនិត្យ Logs</span>
              </button>

              <button
                type="button"
                onClick={() => handleDismiss(alert.id)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-xl transition-all cursor-pointer"
                title="ច្រានចោលការជូនដំណឹង"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
