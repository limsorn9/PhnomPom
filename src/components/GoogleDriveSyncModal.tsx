import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  HardDrive,
  Cloud,
  CloudUpload,
  CloudDownload,
  CheckCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  FileCode,
  Sparkles,
  Lock
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: User | null;
  onGoogleAuthClick: () => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  onGoogleAuthClick
}) => {
  const {
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    attendanceRecords,
    calendarEvents,
    appUsers,
    schoolProfile,
    households,
    libraryBooks,
    readingLogs,
    showToast
  } = useSchool();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('ទើបតែធ្វើសមកាលកម្មមុននេះបន្តិច');
  const [syncInterval, setSyncInterval] = useState<'realtime' | 'daily' | 'weekly'>('realtime');
  const [restoreText, setRestoreText] = useState<string>('');

  if (!isOpen) return null;

  const targetEmail = 'limsorn9@gmail.com';

  const handleTriggerDriveSync = async () => {
    setIsSyncing(true);
    // Simulate real cloud transmission payload
    const snapshotData = {
      backupDate: new Date().toISOString(),
      school: schoolProfile,
      studentsCount: students.length,
      teachersCount: teachers.length,
      classroomsCount: classrooms.length,
      scoresCount: scores.length,
      householdsCount: households.length,
      libraryBooksCount: libraryBooks.length,
      readingLogsCount: readingLogs.length,
      syncedBy: googleUser?.email || targetEmail,
      status: 'success'
    };

    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString('km-KH'));
      showToast(`បានធ្វើសមកាលកម្មទិន្នន័យទៅ Google Drive គណនី ${targetEmail} ជោគជ័យ!`);
    }, 1200);
  };

  const handleDownloadFullDatabaseJson = () => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      schoolProfile,
      students,
      teachers,
      classrooms,
      scores,
      attendanceRecords,
      calendarEvents,
      budgetTransactions,
      households,
      libraryBooks,
      readingLogs,
      appUsers
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeLatinName = (schoolProfile.nameLatin || 'Phnom_Pom').replace(/\s+/g, '_');
    link.download = `School_Database_Backup_${safeLatinName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('បានទាញយកទិន្នន័យបម្រុងទុកមូលដ្ឋានទិន្នន័យ (Full JSON Backup) ជោគជ័យ!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-sm">
              <HardDrive className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-moul">Google Drive Cloud Sync</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                សមកាលកម្មទិន្នន័យសាលារៀនស្វ័យប្រវត្តិជាមួយ Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Target Account Status Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                LS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">{schoolProfile.principalName}</span>
                  <span className="bg-emerald-200 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    ម្ចាស់គណនី Google
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-mono font-medium mt-0.5">{targetEmail}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-xl">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>បានភ្ជាប់សកម្ម</span>
              </span>
            </div>
          </div>

          {/* Sync Trigger Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">សមកាលកម្មទិន្នន័យឥឡូវនេះ (Instant Sync)</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  ពេលវេលាសមកាលកម្មចុងក្រោយ៖ <span className="font-semibold text-slate-700">{lastSyncTime}</span>
                </p>
              </div>

              <button
                onClick={handleTriggerDriveSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'កំពុង Sync...' : 'Sync ទៅ Google Drive'}</span>
              </button>
            </div>

            {/* Sync Scope Summary */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">សិស្ស & គ្រូ</span>
                <span className="font-bold text-slate-800">{students.length} សិស្ស / {teachers.length} គ្រូ</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">ពិន្ទុ & វត្តមាន</span>
                <span className="font-bold text-slate-800">{scores.length} កំណត់ត្រា</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">ជំរឿន & បណ្ណាល័យ</span>
                <span className="font-bold text-slate-800">{households.length} ផ្ទះ / {libraryBooks.length} សៀវភៅ</span>
              </div>
            </div>
          </div>

          {/* Sync Frequency Preference */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">ជម្រើសប្រេកង់នៃការបម្រុងទុកស្វ័យប្រវត្តិ (Auto-Backup Schedule)</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSyncInterval('realtime')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  syncInterval === 'realtime'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>ពេលមានការផ្លាស់ប្តូរ</span>
                <span className="block text-[10px] text-slate-400 font-normal">Real-time</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncInterval('daily')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  syncInterval === 'daily'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>រៀងរាល់ថ្ងៃ</span>
                <span className="block text-[10px] text-slate-400 font-normal">Daily at 5:00 PM</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncInterval('weekly')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  syncInterval === 'weekly'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>រៀងរាល់សប្តាហ៍</span>
                <span className="block text-[10px] text-slate-400 font-normal">Every Friday</span>
              </button>
            </div>
          </div>

          {/* Download Full Snapshot Backup */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-2.5">
              <FileCode className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-bold text-slate-800">ទាញយកឯកសារមូលដ្ឋានទិន្នន័យ (Full Database JSON)</p>
                <p className="text-[11px] text-slate-500">រក្សាទុកជា File Backup ក្រៅបណ្តាញក្នុងកុំព្យូទ័រ</p>
              </div>
            </div>

            <button
              onClick={handleDownloadFullDatabaseJson}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              <CloudDownload className="w-4 h-4" />
              <span>ទាញយក JSON</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
