import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';
import {
  setupOfflineAutoSync,
  syncPendingReportsToFirestore,
  getPendingReportsCount,
  getCachedProgressReports
} from '../services/offlineSyncService';
import { StudentProgressReport } from '../types';
import { useSchool } from '../context/SchoolContext';

export const OfflineSyncStatusBadge: React.FC = () => {
  const { showToast } = useSchool();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [cachedReports, setCachedReports] = useState<StudentProgressReport[]>([]);

  // Update counts
  const refreshStatus = async () => {
    try {
      const count = await getPendingReportsCount();
      setPendingCount(count);
      const reports = await getCachedProgressReports();
      setCachedReports(reports);
    } catch {
      // IndexedDB might not be available in SSR
    }
  };

  useEffect(() => {
    // Initial status
    refreshStatus();

    // Auto-sync listener setup
    const cleanup = setupOfflineAutoSync((synced) => {
      showToast(`បានធ្វើសមកាលកម្មដោយស្វ័យប្រវត្តិចំនួន ${synced} របាយការណ៍ទៅកាន់ Firestore ជោគជ័យ!`, 'success');
      refreshStatus();
    });

    const handleCustomStatus = (e: any) => {
      if (e.detail) {
        setIsOnline(e.detail.isOnline);
        setPendingCount(e.detail.pendingCount);
      }
    };

    window.addEventListener('offline-sync-status-change', handleCustomStatus);

    return () => {
      cleanup();
      window.removeEventListener('offline-sync-status-change', handleCustomStatus);
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      showToast('ឧបករណ៍កំពុងស្ថិតក្នុងស្ថានភាពគ្មានអ៊ីនធឺណិត (Offline)', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const { syncedCount, errorCount } = await syncPendingReportsToFirestore();
      await refreshStatus();
      if (syncedCount > 0) {
        showToast(`បានធ្វើសមកាលកម្ម ${syncedCount} របាយការណ៍ទៅកាន់ Firestore ជោគជ័យ!`, 'success');
      } else if (errorCount > 0) {
        showToast(`មាន ${errorCount} របាយការណ៍មិនទាន់ជោគជ័យ សូមព្យាយាមម្ដងទៀត`, 'error');
      } else {
        showToast('ទិន្នន័យទាំងអស់បានធ្វើសមកាលកម្មរួចរាល់ហើយ', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការធ្វើសមកាលកម្ម', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          id="offline-sync-badge-btn"
          onClick={() => {
            refreshStatus();
            setIsModalOpen(true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shadow-2xs border cursor-pointer ${
            !isOnline
              ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
              : pendingCount > 0
              ? 'bg-blue-50 text-blue-900 border-blue-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title={
            !isOnline
              ? 'កំពុងដំណើរការក្រៅបណ្ដាញ (Offline Mode) - រក្សាទុកក្នុង IndexedDB'
              : pendingCount > 0
              ? `មាន ${pendingCount} របាយការណ៍រង់ចាំ Sync ទៅ Firestore`
              : 'បានភ្ជាប់អ៊ីនធឺណិត & Sync រួចរាល់'
          }
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">Offline (IndexedDB)</span>
              {pendingCount > 0 && (
                <span className="bg-amber-600 text-white px-1.5 py-0.2 text-[10px] rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </>
          ) : pendingCount > 0 ? (
            <>
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">រង់ចាំ Sync</span>
              <span className="bg-blue-600 text-white px-1.5 py-0.2 text-[10px] rounded-full font-bold">
                {pendingCount}
              </span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline text-[11px] text-emerald-700">Online Sync</span>
            </>
          )}
        </button>

        {isOnline && pendingCount > 0 && (
          <button
            id="quick-manual-sync-btn"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="ធ្វើសមកាលកម្មទៅ Firestore ឥឡូវនេះ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Offline Sync & IndexedDB Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-moul">
                    ស្ថានភាពប្រព័ន្ធ និងការរក្សាទុកទិន្នន័យក្រៅបណ្ដាញ (Offline Sync)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Phnom Pom IndexedDB Local Cache & Firestore Auto-Sync Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                    <span>ស្ថានភាពអ៊ីនធឺណិត៖</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isOnline ? 'ភ្ជាប់អ៊ីនធឺណិត (Online)' : 'គ្មានអ៊ីនធឺណិត (Offline Mode)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isOnline
                      ? 'ប្រព័ន្ធនឹងធ្វើសមកាលកម្មទិន្នន័យដោយស្វ័យប្រវត្តិទៅកាន់ Cloud Firestore'
                      : 'ទិន្នន័យត្រូវបានរក្សាទុកយ៉ាងមានសុវត្ថិភាពក្នុង IndexedDB លើឧបករណ៍របស់អ្នក'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing || !isOnline}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'កំពុង Sync...' : 'ធ្វើសមកាលកម្មឥឡូវនេះ'}</span>
                </button>
              </div>
            </div>

            {/* Cached Reports List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  បញ្ជីរបាយការណ៍វឌ្ឍនភាពសិស្សក្នុង IndexedDB ({cachedReports.length})
                </h4>
                <span className="text-xs text-slate-500">
                  រង់ចាំ Sync: <strong className="text-blue-600">{pendingCount}</strong>
                </span>
              </div>

              {cachedReports.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <Database className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">មិនទាន់មានរបាយការណ៍ក្នុង Cache ក្រៅបណ្ដាញនៅឡើយទេ</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    នៅពេលអ្នកបញ្ចូលរបាយការណ៍សិស្សក្នុងស្ថានភាព Offline ប្រព័ន្ធនឹងរក្សាទុកទីនេះដោយស្វ័យប្រវត្តិ
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {cachedReports.map(report => (
                    <div key={report.id} className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{report.nameKhmer}</span>
                          <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {report.studentCode}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ថ្នាក់ទី {report.grade}{report.section} • ខែ {report.month}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                          {report.teacherFeedback || 'ពិន្ទុសរុប៖ ' + (report.totalScore || 0) + ' | ចំណាត់ថ្នាក់៖ ' + (report.ranking || '-')}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>កាលបរិច្ឆេទ៖ {new Date(report.updatedAt).toLocaleString('km-KH')}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {report.syncStatus === 'synced' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Synced</span>
                          </span>
                        ) : report.syncStatus === 'error' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Error</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Pending Sync</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>IndexedDB ObjectStore: <code>PhnomPomOfflineDB/progress_reports</code></span>
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
