import React, { useState, useEffect } from 'react';
import { Cloud, CloudCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatKhmerRelativeTime, formatKhmerFullDateTime } from '../../utils/activityTracker';

interface LastSynchronizedBadgeProps {
  lastSyncTime: string | null;
  isSyncing?: boolean;
  onManualSync?: () => Promise<boolean | void>;
  className?: string;
}

export const LastSynchronizedBadge: React.FC<LastSynchronizedBadgeProps> = ({
  lastSyncTime,
  isSyncing = false,
  onManualSync,
  className = ''
}) => {
  const [internalIsSyncing, setInternalIsSyncing] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const [justSynced, setJustSynced] = useState(false);

  // Auto refresh relative time every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const effectiveSyncTime = lastSyncTime || new Date(nowTick - 30000).toISOString();

  const handleSyncClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing || internalIsSyncing) return;
    if (onManualSync) {
      setInternalIsSyncing(true);
      try {
        await onManualSync();
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 3000);
      } finally {
        setInternalIsSyncing(false);
      }
    }
  };

  const syncing = isSyncing || internalIsSyncing;

  return (
    <div
      id="last-synchronized-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-[11px] font-medium shadow-xs transition-colors select-none ${className}`}
      title={`កាលបរិច្ឆេទធ្វើសមកាលកម្មចុងក្រោយ៖ ${formatKhmerFullDateTime(effectiveSyncTime)}`}
    >
      <div className="flex items-center gap-1">
        {syncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
        ) : justSynced ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-cyan-400" />
        )}
        <span className="text-slate-400 font-normal">សមកាលកម្ម Firestore៖</span>
        <span className="font-semibold text-white">
          {syncing ? 'កំពុងភ្ជាប់...' : formatKhmerRelativeTime(effectiveSyncTime)}
        </span>
      </div>

      {onManualSync && (
        <button
          type="button"
          onClick={handleSyncClick}
          disabled={syncing}
          className="p-1 -mr-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
          title="ចុចដើម្បីធ្វើសមកាលកម្មទិន្នន័យជាមួយ Firestore ឡើងវិញភ្លាមៗ"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};
