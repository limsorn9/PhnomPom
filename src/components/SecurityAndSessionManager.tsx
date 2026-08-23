import React, { useState } from 'react';
import { AppUser, UserSessionInfo, UserMfaConfig, SecurityLoginLog } from '../types';
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  PhoneCall,
  Clock,
  Sparkles,
  Lock,
  RefreshCw,
  Trash2,
  Copy,
  Check
} from 'lucide-react';

interface SecurityAndSessionManagerProps {
  currentUser: AppUser | null;
  onUpdateUser: (userId: string, updated: Partial<AppUser>) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SecurityAndSessionManager: React.FC<SecurityAndSessionManagerProps> = ({
  currentUser,
  onUpdateUser,
  onShowToast
}) => {
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaType, setMfaType] = useState<'sms' | 'totp'>('totp');
  const [mfaPhone, setMfaPhone] = useState(currentUser?.phone || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [totpStep, setTotpStep] = useState<'setup' | 'verify'>('setup');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Inactivity Session Timeout Configuration (Admin policy)
  const [timeoutEnabled, setTimeoutEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('moeys_session_timeout_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [timeoutDuration, setTimeoutDuration] = useState<number>(() => {
    const saved = localStorage.getItem('moeys_session_timeout_minutes');
    return saved ? Number(saved) : 30;
  });
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  const isDirector = currentUser?.role === 'director';

  const handleSaveTimeoutPolicy = () => {
    setIsSavingPolicy(true);
    localStorage.setItem('moeys_session_timeout_enabled', JSON.stringify(timeoutEnabled));
    localStorage.setItem('moeys_session_timeout_minutes', String(timeoutDuration));
    setTimeout(() => {
      setIsSavingPolicy(false);
      onShowToast(
        timeoutEnabled
          ? `បានរក្សាទុកគោលការណ៍កំណត់ពេល Inactivity Session Timeout: ${timeoutDuration} នាទីសម្រាប់គណនីបុគ្គលិកទាំងអស់!`
          : 'បានបិទមុខងារ Inactivity Session Timeout សម្រាប់គណនីបុគ្គលិក!',
        'success'
      );
    }, 400);
  };

  // Fallback initial sessions if none exists
  const currentSessionId = 'sess-current-local';
  const sessions: UserSessionInfo[] = currentUser?.activeSessions && currentUser.activeSessions.length > 0
    ? currentUser.activeSessions
    : [
        {
          id: currentSessionId,
          deviceId: 'dev-win-edge-01',
          deviceName: 'Windows 11 PC (ឧបករណ៍បច្ចុប្បន្ន)',
          browser: 'Microsoft Edge 122',
          os: 'Windows 11 Pro',
          ipAddress: '103.216.50.21 (ភ្នំពេញ, កម្ពុជា)',
          location: 'Phnom Penh, Cambodia',
          lastActive: 'កំពុងប្រើប្រាស់ឥឡូវនេះ (Active now)',
          createdAt: '2024-03-01 08:30',
          isCurrent: true
        },
        {
          id: 'sess-mobile-ios',
          deviceId: 'dev-iphone-15',
          deviceName: 'Apple iPhone 15 Pro',
          browser: 'Safari Mobile 17.2',
          os: 'iOS 17.4',
          ipAddress: '203.144.90.12 (សៀមរាប, កម្ពុជា)',
          location: 'Siem Reap, Cambodia',
          lastActive: '២ ម៉ោងមុន (2 hours ago)',
          createdAt: '2024-02-28 14:15',
          isCurrent: false
        },
        {
          id: 'sess-tab-android',
          deviceId: 'dev-samsung-tab',
          deviceName: 'Samsung Galaxy Tab S9 (បន្ទប់រៀន)',
          browser: 'Chrome Mobile 121',
          os: 'Android 14',
          ipAddress: '118.69.180.44 (ភ្នំពេញ, កម្ពុជា)',
          location: 'Phnom Penh, Cambodia',
          lastActive: 'ម្សិលមិញ (Yesterday 16:45)',
          createdAt: '2024-02-20 09:00',
          isCurrent: false
        }
      ];

  const handleSignOutFromAllOtherDevices = () => {
    if (!currentUser) return;
    const onlyCurrentSession = sessions.filter(s => s.isCurrent || s.id === currentSessionId);
    
    // Create security log for session purge
    const newLog: SecurityLoginLog = {
      id: 'log-' + Date.now(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      timestamp: new Date().toISOString(),
      status: 'success',
      ipAddress: '103.216.50.21',
      device: 'Windows 11 PC',
      browser: 'Microsoft Edge 122',
      os: 'Windows 11',
      location: 'Phnom Penh, Cambodia',
      method: 'password'
    };

    onUpdateUser(currentUser.id, {
      activeSessions: onlyCurrentSession,
      securityLogs: [newLog, ...(currentUser.securityLogs || [])]
    });

    onShowToast('បានចាកចេញពីគ្រប់ឧបករណ៍ផ្សេងៗទៀត (Sign out all other devices) ដោយជោគជ័យ!', 'success');
  };

  const handleTerminateSession = (sessionId: string) => {
    if (!currentUser) return;
    const updated = sessions.filter(s => s.id !== sessionId);
    onUpdateUser(currentUser.id, { activeSessions: updated });
    onShowToast('បានផ្តាច់សម័យកាល (Session terminated) ជោគជ័យ!', 'info');
  };

  const handleDirectMfaToggle = (enabled: boolean) => {
    if (!currentUser) return;
    onUpdateUser(currentUser.id, {
      mfaConfig: {
        enabled,
        type: 'totp',
        backupCodesCount: enabled ? 8 : undefined,
        enrolledAt: enabled ? new Date().toISOString() : undefined,
        lastVerifiedAt: enabled ? new Date().toISOString() : undefined
      }
    });
    onShowToast(
      enabled
        ? 'បានបើកដំណើរការ MFA / 2FA លើទិន្នន័យគណនី Firebase ដោយជោគជ័យ!'
        : 'បានបិទដំណើរការ MFA / 2FA លើគណនី Firebase!',
      enabled ? 'success' : 'info'
    );
  };

  const handleToggleMfa = () => {
    if (currentUser?.mfaConfig?.enabled) {
      if (window.confirm('តើអ្នកប្រាកដជាចង់បិទការផ្ទៀងផ្ទាត់ ២ ជាន់ (MFA/2FA) មែនទេ?')) {
        handleDirectMfaToggle(false);
      }
    } else {
      setShowMfaModal(true);
      setTotpStep('setup');
      setVerificationCode('');
    }
  };

  const handleConfirmEnableMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!verificationCode || verificationCode.length < 6) {
      onShowToast('សូមបញ្ចូលលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ឱ្យបានត្រឹមត្រូវ!', 'error');
      return;
    }

    const newMfaConfig: UserMfaConfig = {
      enabled: true,
      type: mfaType,
      phoneNumber: mfaType === 'sms' ? mfaPhone : undefined,
      backupCodesCount: 8,
      enrolledAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString()
    };

    onUpdateUser(currentUser.id, {
      mfaConfig: newMfaConfig
    });

    setShowMfaModal(false);
    onShowToast('បានបើកដំណើរការការផ្ទៀងផ្ទាត់ ២ ជាន់ (MFA/2FA) ដោយជោគជ័យ!', 'success');
  };

  const copyTotpSecret = () => {
    navigator.clipboard.writeText('MOEYS-SEC-KHMER-8849-2024');
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    onShowToast('បានចម្លង Security Secret Key រួចរាល់!', 'info');
  };

  const isMfaActive = !!currentUser?.mfaConfig?.enabled;

  return (
    <div className="space-y-6">
      {/* MFA Security Protection Banner & Setup */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold text-blue-200 border border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Firebase Multi-Factor Authentication (MFA/2FA)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isMfaActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isMfaActive ? '● បានការពារ (Enabled)' : '○ មិនទាន់បើក (Disabled)'}
              </span>
            </div>

            <h3 className="font-moul text-base sm:text-lg text-white">
              ការផ្ទៀងផ្ទាត់ពីរកត្តាការពារគណនី (Two-Factor Authentication)
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              បង្កើនសុវត្ថិភាពគណនីរដ្ឋបាលសាលា ដោយតម្រូវឱ្យបញ្ចូលលេខកូដពីកម្មវិធីផ្ទៀងផ្ទាត់ (Google Authenticator / Microsoft Authenticator) ឬសារ SMS នៅពេលចូលប្រើពីឧបករណ៍ថ្មី។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Simple Direct Enable MFA Toggle */}
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
              <span className="text-xs font-bold text-white">Enable MFA:</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMfaActive}
                  onChange={e => handleDirectMfaToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <button
              type="button"
              onClick={handleToggleMfa}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isMfaActive
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/30'
              }`}
            >
              {isMfaActive ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-300" />
                  <span>បិទដំណើរការ 2FA</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>រៀបចំ Authenticator (TOTP)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MFA Active Info Badges */}
        {isMfaActive && (
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
              <span className="text-blue-200 text-[10px] block">វិធីសាស្ត្រផ្ទៀងផ្ទាត់ (MFA Method)</span>
              <span className="font-bold text-white mt-0.5 block">
                {currentUser?.mfaConfig?.type === 'totp' ? 'Authenticator App (TOTP)' : 'សារ SMS តាមទូរស័ព្ទ'}
              </span>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
              <span className="text-blue-200 text-[10px] block">កាលបរិច្ឆេទបើកដំណើរការ</span>
              <span className="font-bold text-white mt-0.5 block font-mono">
                {currentUser?.mfaConfig?.enrolledAt
                  ? new Date(currentUser.mfaConfig.enrolledAt).toLocaleDateString('km-KH')
                  : 'ថ្មីៗនេះ'}
              </span>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
              <span className="text-blue-200 text-[10px] block">កូដបម្រុង (Backup Codes)</span>
              <span className="font-bold text-emerald-300 mt-0.5 block">
                {currentUser?.mfaConfig?.backupCodesCount || 8} កូដនៅសល់
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Admin Policy: Inactivity Session Timeout Setting */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-moul text-sm sm:text-base text-slate-800">
                  កំណត់ពេលចាកចេញស្វ័យប្រវត្តិ (Inactivity Session Timeout)
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                  {isDirector ? 'សិទ្ធិគ្រប់គ្រង (Admin Policy)' : 'គោលការណ៍សាលា'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                កំណត់រយៈពេលដែលប្រព័ន្ធនឹងកាត់ផ្តាច់សម័យកាល (Auto-Logout) ពេលបុគ្គលិកទុកចោលមិនប្រើប្រាស់
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={timeoutEnabled}
                disabled={!isDirector}
                onChange={e => setTimeoutEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              <span className="ml-2.5 text-xs font-bold text-slate-700">
                {timeoutEnabled ? 'បើកដំណើរការ (Active)' : 'បិទ (Disabled)'}
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              រយៈពេលទុកចោលមុនពេលចាកចេញ (Inactivity Timeout Duration)
            </label>
            <p className="text-[11.5px] text-slate-500">
              អនុវត្តចំពោះគណនីបុគ្គលិកទាំងអស់ (Staff Accounts) ដូចជា លេខាធិការ, បណ្ណារក្ស, និងលោកគ្រូ-អ្នកគ្រូ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeoutDuration}
              disabled={!timeoutEnabled || !isDirector}
              onChange={e => setTimeoutDuration(Number(e.target.value))}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
            >
              <option value={15}>១៥ នាទី (15 Minutes - សុវត្ថិភាពខ្ពស់)</option>
              <option value={30}>៣០ នាទី (30 Minutes - ស្តង់ដារការិយាល័យ)</option>
              <option value={60}>៦០ នាទី (1 Hour)</option>
              <option value={120}>១២០ នាទី (2 Hours)</option>
              <option value={240}>២៤០ នាទី (4 Hours)</option>
              <option value={480}>៤៨០ នាទី (8 Hours)</option>
            </select>

            {isDirector && (
              <button
                type="button"
                onClick={handleSaveTimeoutPolicy}
                disabled={isSavingPolicy}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingPolicy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>រក្សាទុក</span>
              </button>
            )}
          </div>
        </div>

        {!isDirector && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
            * គោលការណ៍នេះត្រូវបានគ្រប់គ្រង និងកំណត់ដោយនាយកសាលា (Administrator Only)។
          </div>
        )}
      </div>

      {/* Active Sessions Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-moul text-sm sm:text-base text-slate-800">
                  ការគ្រប់គ្រងសម័យកាល (Active Sessions)
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                  {sessions.length} ឧបករណ៍
                </span>
              </div>
              <p className="text-xs text-slate-500">
                បញ្ជីឧបករណ៍ទាំងអស់ដែលកំពុងចូលប្រើគណនីរបស់អ្នក ជាមួយជម្រើសចាកចេញពីចម្ងាយ
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOutFromAllOtherDevices}
            disabled={sessions.filter(s => !s.isCurrent).length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              sessions.filter(s => !s.isCurrent).length > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>ចាកចេញពីគ្រប់ឧបករណ៍ផ្សេងទៀត (Sign out all other devices)</span>
          </button>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-4">ឧបករណ៍ & កម្មវិធីរុករក (Device & Browser)</th>
                <th className="p-4">ទីតាំង & អាសយដ្ឋាន IP (Location & IP)</th>
                <th className="p-4">សកម្មភាពចុងក្រោយ (Last Active)</th>
                <th className="p-4">ស្ថានភាព (Status)</th>
                <th className="p-4 text-right">សកម្មភាព (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sessions.map(sess => (
                <tr
                  key={sess.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    sess.isCurrent ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          sess.isCurrent
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sess.os.toLowerCase().includes('ios') || sess.os.toLowerCase().includes('android') ? (
                          sess.deviceName.toLowerCase().includes('tab') ? (
                            <Tablet className="w-4 h-4" />
                          ) : (
                            <Smartphone className="w-4 h-4" />
                          )
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sess.deviceName}</span>
                          {sess.isCurrent && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold border border-blue-200">
                              ឧបករណ៍បច្ចុប្បន្ន
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {sess.browser} • {sess.os}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-mono text-slate-800">{sess.ipAddress}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>📍 {sess.location}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sess.lastActive}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                      ចូលដំបូង: {sess.createdAt}
                    </span>
                  </td>

                  <td className="p-4">
                    {sess.isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        កំពុងប្រើប្រាស់ (Active)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 font-medium text-[11px] rounded-full">
                        ឈរជើង (Standby)
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    {sess.isCurrent ? (
                      <span className="text-[11px] text-slate-400 font-medium italic">
                        ឧបករណ៍របស់អ្នក
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTerminateSession(sess.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-all border border-rose-200/60 flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ផ្តាច់ (Disconnect)</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MFA Setup Modal */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm sm:text-base text-slate-800">
                    ដំឡើងការផ្ទៀងផ្ទាត់ ២ ជាន់ (2FA / MFA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ការពារគណនីរបស់អ្នកពីការលួចចូលដោយគ្មានការអនុញ្ញាត
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMfaModal(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmEnableMfa} className="space-y-4">
              {/* Select 2FA Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  ជ្រើសរើសវិធីសាស្ត្រផ្ទៀងផ្ទាត់ (Authentication Method)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMfaType('totp')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      mfaType === 'totp'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span>Authenticator App</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Google/Microsoft Authenticator (ណែនាំបំផុត)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMfaType('sms')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      mfaType === 'sms'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <PhoneCall className="w-4 h-4 text-indigo-600" />
                      <span>សារ SMS ទូរស័ព្ទ</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      ផ្ញើលេខកូដ OTP ៦ ខ្ទង់តាមលេខទូរស័ព្ទ
                    </p>
                  </button>
                </div>
              </div>

              {mfaType === 'totp' ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-center space-y-2">
                    <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-slate-200 mx-auto flex items-center justify-center shadow-sm">
                      {/* Stylized QR Code placeholder representation */}
                      <div className="w-full h-full bg-slate-900 rounded-xl p-2.5 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-white rounded-md p-1">
                            <div className="w-full h-full bg-slate-900 rounded-sm" />
                          </div>
                          <div className="w-6 h-6 bg-white rounded-md p-1">
                            <div className="w-full h-full bg-slate-900 rounded-sm" />
                          </div>
                        </div>
                        <div className="text-center font-mono font-black text-white text-[10px] tracking-widest">
                          MOEYS-MFA
                        </div>
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-white rounded-md p-1">
                            <div className="w-full h-full bg-slate-900 rounded-sm" />
                          </div>
                          <div className="w-6 h-6 bg-indigo-400 rounded-md" />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">
                      ១. ស្កេន QR Code នេះដោយប្រើ Google Authenticator
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Secret Key (បញ្ចូលដោយដៃ)</span>
                      <span className="font-mono font-bold text-slate-800">MOEYS-SEC-KHMER-8849-2024</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyTotpSecret}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecret ? 'ចម្លងរួច' : 'ចម្លង'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">
                    លេខទូរស័ព្ទទទួលកូដ OTP *
                  </label>
                  <input
                    type="tel"
                    value={mfaPhone}
                    onChange={e => setMfaPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    ប្រព័ន្ធនឹងផ្ញើសារ OTP ទៅកាន់លេខនេះរាល់ពេលចូលប្រើប្រាស់។
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ២. បញ្ចូលលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMfaModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>បញ្ជាក់ និងបើកដំណើរការ MFA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
