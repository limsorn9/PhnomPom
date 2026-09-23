import React, { useState } from 'react';
import { Laptop, Smartphone, RefreshCw, LogOut } from 'lucide-react';

interface Session {
  id: string;
  deviceType: 'desktop' | 'mobile';
  deviceInfo: string;
  isCurrent: boolean;
  appSource: string;
  ipAddress: string;
  lastActive: string;
  loggedInAt: string;
}

export const DirectorActiveSessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      deviceType: 'desktop',
      deviceInfo: 'កុំព្យូទ័រ · Chrome · Windows',
      isCurrent: true,
      appSource: 'PLP-SMS',
      ipAddress: '175.100.59.220',
      lastActive: 'អម្បាញ់មិញ',
      loggedInAt: '8/28/2026, 4:39:02 PM'
    },
    {
      id: '2',
      deviceType: 'mobile',
      deviceInfo: 'ទូរស័ព្ទ · Chrome · Android',
      isCurrent: false,
      appSource: 'PLP-SMS',
      ipAddress: '27.109.114.102',
      lastActive: '9/16/2026, 11:41:07 AM',
      loggedInAt: '8/20/2026, 5:42:08 PM'
    },
    {
      id: '3',
      deviceType: 'desktop',
      deviceInfo: 'កុំព្យូទ័រ · Chrome · Windows',
      isCurrent: false,
      appSource: 'PLP-SMS',
      ipAddress: '27.109.113.127',
      lastActive: '8/28/2026, 10:16:21 AM',
      loggedInAt: '8/21/2026, 7:05:04 AM'
    }
  ]);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRefresh = () => {
    // Simulating refresh
    setMessage({ type: 'success', text: 'បានធ្វើឱ្យទាន់សម័យដោយជោគជ័យ។' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogoutAll = () => {
    const currentSession = sessions.find(s => s.isCurrent);
    if (currentSession) {
      setSessions([currentSession]);
      setMessage({ type: 'success', text: 'បានចាកចេញពីគ្រប់ឧបករណ៍ផ្សេងទៀតដោយជោគជ័យ។' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogoutDevice = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setMessage({ type: 'success', text: 'បានចាកចេញពីឧបករណ៍ដែលបានជ្រើសរើសដោយជោគជ័យ។' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans mb-6 font-kantumruy">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">ឧបករណ៍ដែលកំពុងចូលប្រើ</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            ឧបករណ៍ដែលកំពុងចូលប្រើគណនីរបស់អ្នក។ សូមចាកចេញពីឧបករណ៍ណាដែលអ្នកមិនស្គាល់។
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            className="flex-1 sm:flex-none justify-center bg-[#1e293b] hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            ធ្វើឱ្យទាន់សម័យ
          </button>
          <button 
            onClick={handleLogoutAll}
            disabled={sessions.length <= 1}
            className="flex-1 sm:flex-none justify-center bg-[#ef4444] hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm disabled:cursor-not-allowed"
          >
            <LogOut className="w-3.5 h-3.5" />
            ចាកចេញពីគ្រប់ឧបករណ៍
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      {/* Active Device Cards */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                {session.deviceType === 'desktop' ? (
                  <Laptop className="w-5 h-5" />
                ) : (
                  <Smartphone className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-bold text-slate-800 text-sm">{session.deviceInfo}</span>
                  {session.isCurrent && (
                    <span className="bg-emerald-100 text-emerald-700 font-medium text-[11px] px-2 py-0.5 rounded-md leading-none">
                      ឧបករណ៍នេះ
                    </span>
                  )}
                  <span className="border border-slate-300 text-slate-600 text-[11px] px-2 py-0.5 rounded-md leading-none bg-white">
                    {session.appSource}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {session.ipAddress} <span className="mx-1.5 text-slate-300">•</span> 
                  សកម្មចុងក្រោយ : <span className="text-slate-600">{session.lastActive}</span> <span className="mx-1.5 text-slate-300">•</span> 
                  បានចូលប្រើ : <span className="text-slate-600">{session.loggedInAt}</span>
                </p>
              </div>
            </div>

            {!session.isCurrent && (
              <button 
                onClick={() => handleLogoutDevice(session.id)}
                className="w-full sm:w-auto justify-center bg-[#1e293b] hover:bg-slate-700 text-white text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 shadow-sm font-medium"
              >
                ចាកចេញ
                <span className="text-[10px] ml-0.5">➔</span>
              </button>
            )}
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm border border-slate-200 rounded-xl border-dashed">
            មិនមានឧបករណ៍ដែលកំពុងចូលប្រើទេ។
          </div>
        )}
      </div>

    </div>
  );
};
