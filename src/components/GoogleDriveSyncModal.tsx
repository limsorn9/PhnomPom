import React, { useState, useEffect } from 'react';
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
  Lock,
  ExternalLink,
  FolderSync,
  FileText,
  Coins,
  CheckCircle2,
  Calendar,
  Layers,
  Sliders,
  Trash2,
  Share2,
  Check,
  Users,
  GraduationCap,
  Award,
  Database,
  Upload,
  BookOpen
} from 'lucide-react';
import { User } from 'firebase/auth';
import { backupSchoolDataToDrive, PRIMARY_SCHOOL_DRIVE_FOLDER_ID } from '../services/googleDrive';
import { isGoogleAuthenticated, loginWithGoogle } from '../services/googleAuth';

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
    schoolProfile,
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    attendanceRecords,
    calendarEvents,
    appUsers,
    households,
    libraryBooks,
    readingLogs,
    teacherMeetings,
    selectedAcademicYear,
    driveAutoSyncConfig,
    updateDriveAutoSyncConfig,
    driveSyncHistory,
    isDriveSyncing,
    syncMeetingToDrive,
    syncAllMeetingsToDrive,
    syncFinancialReportToDrive,
    syncStudentRosterToDrive,
    syncScoresAndRankingsToDrive,
    syncHonorRollToDrive,
    syncStaffDirectoryToDrive,
    restoreSchoolDatabaseFromDrive,
    triggerDriveAutoSyncAll,
    clearDriveSyncHistory,
    showToast
  } = useSchool();

  const targetEmail = 'limsorn9@gmail.com';
  const defaultFolderId = driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
  const defaultFolderUrl = `https://drive.google.com/drive/folders/${defaultFolderId}?usp=sharing`;

  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'finances' | 'students' | 'scores' | 'honor' | 'restore' | 'history' | 'settings'>('overview');
  const [folderIdInput, setFolderIdInput] = useState<string>(defaultFolderId);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [singleSyncingId, setSingleSyncingId] = useState<string | null>(null);
  const [restoreDriveFileId, setRestoreDriveFileId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('មករា');
  const [restoreConfirming, setRestoreConfirming] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsConnected(isGoogleAuthenticated());
      setFolderIdInput(driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID);
    }
  }, [isOpen, driveAutoSyncConfig.folderId]);

  if (!isOpen) return null;

  const handleSaveFolderId = () => {
    const trimmed = folderIdInput.trim() || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
    updateDriveAutoSyncConfig({ folderId: trimmed });
    showToast(`បានកំណត់ Folder ID: ${trimmed} សម្រាប់ Google Drive ជោគជ័យ!`, 'success');
  };

  const handleSyncMeeting = async (meetingId: string) => {
    setSingleSyncingId(meetingId);
    try {
      await syncMeetingToDrive(meetingId);
    } finally {
      setSingleSyncingId(null);
    }
  };

  const handleSyncSingleClassStudents = async (classroomId: string) => {
    setSingleSyncingId(`students-${classroomId}`);
    try {
      await syncStudentRosterToDrive(classroomId);
    } finally {
      setSingleSyncingId(null);
    }
  };

  const handleSyncSingleClassScores = async (grade: number, section: string) => {
    setSingleSyncingId(`scores-${grade}-${section}`);
    try {
      await syncScoresAndRankingsToDrive(grade, section, selectedMonth);
    } finally {
      setSingleSyncingId(null);
    }
  };

  const handleSyncSingleClassHonor = async (grade: number, section: string) => {
    setSingleSyncingId(`honor-${grade}-${section}`);
    try {
      await syncHonorRollToDrive(grade, section, selectedMonth);
    } finally {
      setSingleSyncingId(null);
    }
  };

  const handleRestoreFromDrive = async () => {
    if (!restoreDriveFileId.trim()) {
      showToast('សូមបញ្ចូល Drive File ID ឬខ្លឹមសារ JSON ជាមុនសិន', 'error');
      return;
    }
    const success = await restoreSchoolDatabaseFromDrive(restoreDriveFileId.trim());
    if (success) {
      setRestoreConfirming(false);
      setRestoreDriveFileId('');
    }
  };

  const handleFileUploadRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await restoreSchoolDatabaseFromDrive(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadFullDatabaseJson = () => {
    const fullBackup = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      schoolProfile,
      students,
      teachers,
      classrooms,
      scores,
      attendanceRecords,
      calendarEvents,
      budgetTransactions,
      teacherMeetings,
      households,
      libraryBooks,
      readingLogs,
      appUsers
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeLatinName = (schoolProfile.nameLatin || 'Phnom_Preuk').replace(/\s+/g, '_');
    link.download = `School_Database_Backup_${safeLatinName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('បានទាញយកទិន្នន័យបម្រុងទុកមូលដ្ឋានទិន្នន័យ (Full JSON Backup) ជោគជ័យ!');
  };

  const unsyncedMeetingsCount = teacherMeetings.filter(m => !m.isSyncedToGoogleDrive).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-sm">
              <HardDrive className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg font-moul">Google Drive Automated Synchronization</h3>
                <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Auto-Sync v2.5
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                សមកាលកម្មស្វ័យប្រវត្តិបញ្ជីឈ្មោះសិស្ស ពិន្ទុ កិត្តិយស កំណត់ហេតុ និងហិរញ្ញវត្ថុទៅកាន់ Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 bg-slate-50/80 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            <span>ទិដ្ឋភាពរួម & Auto-Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'students'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>បញ្ជីឈ្មោះសិស្ស ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scores')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'scores'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>ពិន្ទុ & ចំណាត់ថ្នាក់</span>
          </button>

          <button
            onClick={() => setActiveTab('honor')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'honor'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>តារាងកិត្តិយស Top 5</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'meetings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>កំណត់ត្រាការប្រជុំ ({teacherMeetings.length})</span>
            {unsyncedMeetingsCount > 0 && (
              <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {unsyncedMeetingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finances')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'finances'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>ហិរញ្ញវត្ថុ ១២ ខែ</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'restore'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-rose-600" />
            <span>ស្ដារទិន្នន័យ (Restore)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>ប្រវត្តិ ({driveSyncHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span>ការកំណត់</span>
          </button>
        </div>

        {/* Modal Body with dynamic tabs */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
          {/* Target Folder & Account Status Badge */}
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                LS
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">គណនីម្ចាស់ Drive: {targetEmail}</span>
                  <span className="bg-emerald-200 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-800" />
                    <span>ភ្ជាប់រួចរាល់</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-emerald-900">
                  <span>Folder ID:</span>
                  <code className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold text-slate-800">
                    {defaultFolderId}
                  </code>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={defaultFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-900 hover:text-emerald-950 font-bold bg-white hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
              >
                <FolderSync className="w-4 h-4 text-emerald-700" />
                <span>បើកមើល Google Drive Folder</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & AUTO-SYNC */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fade-in">
              {/* Primary Action Button */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium mb-1.5 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>ស្វ័យប្រវត្តិកម្ម Synchronization កញ្ចប់ឯកសារសំខាន់ៗ</span>
                    </div>
                    <h4 className="font-bold text-base text-amber-300">
                      ធ្វើសមកាលកម្មឯកសារសំខាន់ៗទាំងអស់ (Full Auto-Sync All)
                    </h4>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed max-w-xl">
                      ប្រព័ន្ធនឹងបង្កើត HTML ផ្លូវការសម្រាប់បញ្ជីឈ្មោះសិស្ស តារាងពិន្ទុ តារាងកិត្តិយស កំណត់ហេតុកិច្ចប្រជុំ របាយការណ៍ហិរញ្ញវត្ថុ និង Master Database Snapshot JSON រួចបង្ហោះផ្ទាល់ទៅក្នុង Folder ID: <code className="font-mono text-emerald-300">{defaultFolderId}</code>។
                    </p>
                  </div>

                  <button
                    onClick={triggerDriveAutoSyncAll}
                    disabled={isDriveSyncing}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer shrink-0 font-moul text-xs"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-950 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>{isDriveSyncing ? 'កំពុង Sync ទៅ Drive...' : 'Sync ឯកសារទាំងអស់ឥឡូវនេះ'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                    <span className="text-slate-400 text-[10px] block">សិស្សសរុប</span>
                    <span className="font-bold text-white text-sm">{students.length} នាក់</span>
                    <p className="text-[10px] text-emerald-300 mt-0.5">{classrooms.length} ថ្នាក់រៀន</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                    <span className="text-slate-400 text-[10px] block">កំណត់ត្រាការប្រជុំ</span>
                    <span className="font-bold text-white text-sm">{teacherMeetings.length} កំណត់ត្រា</span>
                    <p className="text-[10px] text-purple-300 mt-0.5">
                      ✓ {teacherMeetings.filter(m => m.isSyncedToGoogleDrive).length} បាន Sync រួច
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                    <span className="text-slate-400 text-[10px] block">ប្រតិបត្តិការហិរញ្ញវត្ថុ</span>
                    <span className="font-bold text-white text-sm">{budgetTransactions.length} កំណត់ត្រា</span>
                    <p className="text-[10px] text-emerald-300 mt-0.5">PB & SIG {selectedAcademicYear}</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
                    <span className="text-slate-400 text-[10px] block">Auto-Sync ចុងក្រោយ</span>
                    <span className="font-bold text-white text-sm font-times">
                      {driveAutoSyncConfig.lastAutoSyncTime
                        ? new Date(driveAutoSyncConfig.lastAutoSyncTime).toLocaleTimeString('km-KH')
                        : 'ទើបដំឡើង'}
                    </span>
                    <p className="text-[10px] text-emerald-300 mt-0.5">ដំណើរការល្អ</p>
                  </div>
                </div>
              </div>

              {/* Individual Category Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Students Roster */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">បញ្ជីឈ្មោះសិស្ស (Student Rosters)</h5>
                        <p className="text-slate-500 text-[11px]">{classrooms.length} ថ្នាក់រៀន • {students.length} នាក់</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    បម្លែងបញ្ជីឈ្មោះសិស្សតាមថ្នាក់នីមួយៗជា HTML ផ្លូវការដែលមានលេខកូដសិស្ស ភេទ ថ្ងៃខែឆ្នាំកំណើត និងព័ត៌មានអាណាព្យាបាល។
                  </p>
                  <button
                    onClick={() => syncStudentRosterToDrive()}
                    disabled={isDriveSyncing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync បញ្ជីឈ្មោះសិស្សគ្រប់ថ្នាក់ ({classrooms.length})</span>
                  </button>
                </div>

                {/* Scores & Rankings */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">តារាងពិន្ទុ & ចំណាត់ថ្នាក់ (Scores)</h5>
                        <p className="text-slate-500 text-[11px]">តារាងពិន្ទុប្រចាំខែ និងចំណាត់ថ្នាក់</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    បង្កើតតារាងពិន្ទុគ្រប់មុខវិជ្ជា ពិន្ទុសរុប មធ្យមភាគ និងចំណាត់ថ្នាក់តាមថ្នាក់ជាឯកសារ HTML ទៅ Google Drive។
                  </p>
                  <button
                    onClick={() => syncScoresAndRankingsToDrive(undefined, undefined, selectedMonth)}
                    disabled={isDriveSyncing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync តារាងពិន្ទុគ្រប់ថ្នាក់ (ខែ{selectedMonth})</span>
                  </button>
                </div>

                {/* Honor Roll */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">តារាងកិត្តិយស Top 5 (Honor Rolls)</h5>
                        <p className="text-slate-500 text-[11px]">វិញ្ញាបនបត្រ និងតារាងសិស្សពូកែ</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    ស្រង់បញ្ជីសិស្សឆ្នើមចំណាត់ថ្នាក់លេខ ១ ដល់លេខ ៥ តាមថ្នាក់នីមួយៗ រៀបចំជាទម្រង់ Certificate Card ផ្លូវការ។
                  </p>
                  <button
                    onClick={() => syncHonorRollToDrive(undefined, undefined, selectedMonth)}
                    disabled={isDriveSyncing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync តារាងកិត្តិយសគ្រប់ថ្នាក់ (ខែ{selectedMonth})</span>
                  </button>
                </div>

                {/* Financial Report */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">របាយការណ៍ហិរញ្ញវត្ថុ (Financial Report)</h5>
                        <p className="text-slate-500 text-[11px]">តារាងបូកសរុបចំណូល-ចំណាយ ១២ ខែ</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    បង្កើតរបាយការណ៍បូកសរុបថវិការដ្ឋ (PB), ថវិកាជំនួយអភិវឌ្ឍន៍សាលា (SIG) និងវិភាគទានសហគមន៍ រួចបង្ហោះទៅ Drive។
                  </p>
                  <button
                    onClick={() => syncFinancialReportToDrive(selectedAcademicYear)}
                    disabled={isDriveSyncing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync របាយការណ៍ហិរញ្ញវត្ថុ {selectedAcademicYear}</span>
                  </button>
                </div>

                {/* Staff Directory Report */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">បញ្ជីរាយនាមបុគ្គលិក និងលោកគ្រូ-អ្នកគ្រូ (Staff Directory)</h5>
                        <p className="text-slate-500 text-[11px]">បញ្ជីឈ្មោះ កម្រិតវប្បធម៌ មុខតំណែង និងកាតព្វកិច្ចបង្រៀន ({teachers.length} នាក់)</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    បង្កើតឯកសារ HTML ផ្លូវការនៃបញ្ជីរាយនាមបុគ្គលិកអប់រំ និងគ្រូបង្រៀនទាំងអស់ ដោយមានក្របខ័ណ្ឌ កាំប្រាក់ កម្រិតវប្បធម៌ និងថ្នាក់បន្ទុក រួចបង្ហោះផ្ទាល់ទៅ Google Drive។
                  </p>
                  <button
                    onClick={() => syncStaffDirectoryToDrive()}
                    disabled={isDriveSyncing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync បញ្ជីបុគ្គលិក ({teachers.length} នាក់) ទៅកាន់ Google Drive</span>
                  </button>
                </div>
              </div>

              {/* JSON Snapshot Backup Download */}
              <div className="flex items-center justify-between p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">ទាញយកឯកសារមូលដ្ឋានទិន្នន័យ (Full Database JSON Backup)</p>
                    <p className="text-[11px] text-slate-500">
                      រក្សាទុក Snapshot ទិន្នន័យទាំងអស់ជា File Backup ក្រៅបណ្តាញក្នុងកុំព្យូទ័រ
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadFullDatabaseJson}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  <CloudDownload className="w-4 h-4" />
                  <span>ទាញយក JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS ROSTER SYNC */}
          {activeTab === 'students' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">បញ្ជីឈ្មោះសិស្សតាមថ្នាក់សម្រាប់ Sync ទៅ Google Drive</h4>
                  <p className="text-slate-500 text-[11px]">
                    ឯកសារ HTML ផ្លូវការមានព័ត៌មានលម្អិតសិស្ស និងហត្ថលេខាលោកគ្រូ-អ្នកគ្រូបន្ទុកថ្នាក់
                  </p>
                </div>
                <button
                  onClick={() => syncStudentRosterToDrive()}
                  disabled={isDriveSyncing}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync គ្រប់ថ្នាក់ ({classrooms.length})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classrooms.map((cls) => {
                  const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
                  const isSyncingThis = singleSyncingId === `students-${cls.id}`;
                  return (
                    <div key={cls.id} className="p-4 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">ថ្នាក់ទី {cls.gradeLevel}{cls.section}</span>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {classStudents.length} នាក់
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          គ្រូបន្ទុកថ្នាក់៖ {cls.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSyncSingleClassStudents(cls.id)}
                        disabled={isSyncingThis || isDriveSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingThis ? 'animate-spin' : ''}`} />
                        <span>{isSyncingThis ? 'កំពុង Sync...' : 'Sync ទៅ Drive'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SCORES & RANKINGS */}
          {activeTab === 'scores' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">តារាងពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ</h4>
                  <p className="text-slate-500 text-[11px]">
                    បម្លែងពិន្ទុគ្រប់មុខវិជ្ជា និងចំណាត់ថ្នាក់សិស្សជាតារាងស្តង់ដារក្រសួងអប់រំ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'].map(m => (
                      <option key={m} value={m}>ខែ {m}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => syncScoresAndRankingsToDrive(undefined, undefined, selectedMonth)}
                    disabled={isDriveSyncing}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync គ្រប់ថ្នាក់ (ខែ{selectedMonth})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classrooms.map((cls) => {
                  const isSyncingThis = singleSyncingId === `scores-${cls.gradeLevel}-${cls.section}`;
                  const classStudents = students.filter(s => s.gradeLevel === cls.gradeLevel && s.section === cls.section && s.status === 'active');
                  return (
                    <div key={cls.id} className="p-4 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">ពិន្ទុថ្នាក់ទី {cls.gradeLevel}{cls.section}</span>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ខែ{selectedMonth}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          សិស្ស៖ {classStudents.length} នាក់ • គ្រូ៖ {cls.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSyncSingleClassScores(cls.gradeLevel, cls.section)}
                        disabled={isSyncingThis || isDriveSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingThis ? 'animate-spin' : ''}`} />
                        <span>{isSyncingThis ? 'កំពុង Sync...' : 'Sync ទៅ Drive'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: HONOR ROLLS */}
          {activeTab === 'honor' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">តារាងកិត្តិយស Top 5 សិស្សឆ្នើម</h4>
                  <p className="text-slate-500 text-[11px]">
                    បង្កើតវិញ្ញាបនបត្រ និងតារាងសិស្សចំណាត់ថ្នាក់លេខ ១ ដល់លេខ ៥ តាមថ្នាក់
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'].map(m => (
                      <option key={m} value={m}>ខែ {m}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => syncHonorRollToDrive(undefined, undefined, selectedMonth)}
                    disabled={isDriveSyncing}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Top 5 គ្រប់ថ្នាក់</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classrooms.map((cls) => {
                  const isSyncingThis = singleSyncingId === `honor-${cls.gradeLevel}-${cls.section}`;
                  return (
                    <div key={cls.id} className="p-4 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">កិត្តិយសថ្នាក់ទី {cls.gradeLevel}{cls.section}</span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Top 5 • ខែ{selectedMonth}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          សាលាបឋមសិក្សា {schoolProfile.nameKhmer}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSyncSingleClassHonor(cls.gradeLevel, cls.section)}
                        disabled={isSyncingThis || isDriveSyncing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingThis ? 'animate-spin' : ''}`} />
                        <span>{isSyncingThis ? 'កំពុង Sync...' : 'Sync ទៅ Drive'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: MEETINGS SYNC LIST */}
          {activeTab === 'meetings' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">បញ្ជីកំណត់ត្រាការប្រជុំគ្រូសម្រាប់ Sync ទៅ Google Drive</h4>
                  <p className="text-slate-500 text-[11px]">
                    ឯកសារនឹងត្រូវបម្លែងជា HTML ផ្លូវការដែលមានរចនាបថក្រសួងអប់រំ និងហត្ថលេខា
                  </p>
                </div>
                <button
                  onClick={syncAllMeetingsToDrive}
                  disabled={isDriveSyncing}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ទាំងអស់ ({teacherMeetings.length})</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {teacherMeetings.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    មិនទាន់មានកំណត់ត្រាកិច្ចប្រជុំនៅឡើយទេ។ សូមចូលទៅកាន់ទំព័រ «កំណត់ត្រាការប្រជុំគ្រូ» ដើម្បីបង្កើត។
                  </div>
                ) : (
                  teacherMeetings.map((meeting) => {
                    const isSynced = meeting.isSyncedToGoogleDrive;
                    return (
                      <div key={meeting.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{meeting.title}</span>
                            {meeting.meetingCode && (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                {meeting.meetingCode}
                              </span>
                            )}
                            {isSynced ? (
                              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Drive Synced</span>
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                មិនទាន់ Sync
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-purple-600" />
                              <span>កាលបរិច្ឆេទ៖ {meeting.meetingDate}</span>
                            </span>
                            <span>•</span>
                            <span>ប្រធានអង្គប្រជុំ៖ {meeting.chairpersonName || 'លោក នាយកសាលា'}</span>
                            {meeting.driveSyncedAt && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700">Sync ចុងក្រោយ៖ {new Date(meeting.driveSyncedAt).toLocaleDateString('km-KH')}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {meeting.googleDriveWebViewLink && (
                            <a
                              href={meeting.googleDriveWebViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                              title="បើកមើលក្នុង Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleSyncMeeting(meeting.id)}
                            disabled={singleSyncingId === meeting.id || isDriveSyncing}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                              isSynced
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${singleSyncingId === meeting.id ? 'animate-spin' : ''}`} />
                            <span>{singleSyncingId === meeting.id ? 'កំពុង Sync...' : isSynced ? 'Sync ឡើងវិញ' : 'Sync ទៅ Drive'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 6: FINANCIAL REPORT SYNC */}
          {activeTab === 'finances' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">របាយការណ៍ហិរញ្ញវត្ថុ ១២ ខែ (PB, SIG & Community)</h4>
                  <p className="text-slate-500 text-[11px]">
                    ប្រព័ន្ធនឹងទាញយកទិន្នន័យចំណូល-ចំណាយ ១២ ខែ រៀបចំជាតារាងស្តង់ដារក្រសួង និងបង្កើតឯកសារ HTML ទៅកាន់ Folder: {defaultFolderId}
                  </p>
                </div>
                <button
                  onClick={() => syncFinancialReportToDrive(selectedAcademicYear)}
                  disabled={isDriveSyncing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync របាយការណ៍ហិរញ្ញវត្ថុឥឡូវនេះ</span>
                </button>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">ឆ្នាំសិក្សាគោលដៅ៖</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                    {selectedAcademicYear}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">ចំនួនប្រតិបត្តិការសរុប</span>
                    <span className="font-bold text-slate-800 text-base">{budgetTransactions.length} ប្រតិបត្តិការ</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">ទម្រង់ឯកសារបង្ហោះ</span>
                    <span className="font-bold text-emerald-800 text-base">HTML ផ្លូវការ (MoEYS Style)</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">ទីតាំងរក្សាទុកលើ Cloud</span>
                    <span className="font-bold text-blue-800 text-base truncate font-mono">Folder: {defaultFolderId}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                  💡 <strong>ចំណាំ៖</strong> រាល់ពេលមានការកែប្រែប្រតិបត្តិការចំណូល-ចំណាយក្នុងប្រព័ន្ធ ប្រព័ន្ធនឹងធ្វើបច្ចុប្បន្នភាពរបាយការណ៍ហិរញ្ញវត្ថុនេះដោយស្វ័យប្រវត្តិ។
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MASTER RESTORE DATABASE */}
          {activeTab === 'restore' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">ស្ដារទិន្នន័យសាលាទាំងមូលពី Google Drive Master Backup</h4>
                    <p className="text-[11px] text-slate-600">
                      អនុញ្ញាតឱ្យលោកនាយកទាញទិន្នន័យពីឯកសារ Backup លើ Google Drive មកជំនួស ឬធ្វើបច្ចុប្បន្នភាពលើប្រព័ន្ធភ្លាមៗ
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    ជម្រើសទី ១៖ បញ្ចូល Google Drive File ID ឬ JSON Backup Content
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={restoreDriveFileId}
                      onChange={(e) => setRestoreDriveFileId(e.target.value)}
                      placeholder="បញ្ចូល Drive File ID (ឧ. 1a2b3c...)"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button
                      onClick={handleRestoreFromDrive}
                      disabled={isDriveSyncing || !restoreDriveFileId.trim()}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Database className="w-4 h-4" />
                      <span>{isDriveSyncing ? 'កំពុងទាញយក...' : 'ស្ដារទិន្នន័យ (Restore)'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-200/80">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    ជម្រើសទី ២៖ ផ្ទុកឡើងឯកសារ JSON Backup ពីកុំព្យូទ័រ
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-xl cursor-pointer text-slate-600 hover:text-rose-700 font-bold transition-all">
                    <Upload className="w-4 h-4 text-rose-600" />
                    <span>ជ្រើសរើសឯកសារ JSON (.json) ពីកុំព្យូទ័រដើម្បី Restore</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUploadRestore}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SYNC HISTORY & AUDIT LOGS */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">ប្រវត្តិសមកាលកម្ម Google Drive (Sync Activity Log)</h4>
                  <p className="text-slate-500 text-[11px]">
                    កំណត់ត្រានៃរាល់ឯកសារដែលបានបញ្ជូនទៅកាន់ Google Drive Folder ID: {defaultFolderId}
                  </p>
                </div>
                {driveSyncHistory.length > 0 && (
                  <button
                    onClick={clearDriveSyncHistory}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-50 text-[11px] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>សម្អាតប្រវត្តិ</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {driveSyncHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    មិនទាន់មានប្រវត្តិ Synchronization នៅឡើយទេ។
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {driveSyncHistory.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">{item.title}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                              {item.categoryLabelKhmer || item.category}
                            </span>
                            {item.status === 'success' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-700" />
                                <span>ជោគជ័យ</span>
                              </span>
                            ) : (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-rose-700" />
                                <span>បរាជ័យ</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[10px] font-mono">
                            <span>File: {item.fileName}</span>
                            {item.fileSizeFormatted && <span>• Size: {item.fileSizeFormatted}</span>}
                            <span>• {new Date(item.syncedAt).toLocaleString('km-KH')}</span>
                          </div>
                        </div>

                        {item.driveWebViewLink && (
                          <a
                            href={item.driveWebViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
                          >
                            <span>បើកមើល</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-fade-in">
              {/* Folder ID Config */}
              <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FolderSync className="w-4 h-4 text-emerald-700" />
                    <span>កំណត់ Google Drive Target Folder ID</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Default: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={folderIdInput}
                    onChange={(e) => setFolderIdInput(e.target.value)}
                    placeholder="បញ្ចូល Google Drive Folder ID..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSaveFolderId}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    រក្សាទុក
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  រាល់ការធ្វើសមកាលកម្មស្វ័យប្រវត្តិនឹងបញ្ជូនឯកសារ HTML និង JSON ទៅកាន់ថតនេះដោយផ្ទាល់។
                </p>
              </div>

              {/* Auto Sync Toggle & Preferences */}
              <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800 text-sm">ជម្រើសឯកសារដែលត្រូវធ្វើសមកាលកម្មស្វ័យប្រវត្តិ</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-800">បញ្ជីឈ្មោះសិស្ស (Student Rosters)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driveAutoSyncConfig.syncStudents !== false}
                      onChange={(e) => updateDriveAutoSyncConfig({ syncStudents: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-800">តារាងពិន្ទុ & ចំណាត់ថ្នាក់ (Scores)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driveAutoSyncConfig.syncScores !== false}
                      onChange={(e) => updateDriveAutoSyncConfig({ syncScores: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-slate-800">តារាងកិត្តិយស Top 5 (Honor Rolls)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driveAutoSyncConfig.syncHonorRoll !== false}
                      onChange={(e) => updateDriveAutoSyncConfig({ syncHonorRoll: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-800">កំណត់ត្រាការប្រជុំគ្រូ (Meeting Minutes)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driveAutoSyncConfig.syncMeetings}
                      onChange={(e) => updateDriveAutoSyncConfig({ syncMeetings: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">របាយការណ៍ហិរញ្ញវត្ថុ ១២ ខែ</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driveAutoSyncConfig.syncFinances}
                      onChange={(e) => updateDriveAutoSyncConfig({ syncFinances: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-slate-800">បញ្ជីបុគ្គលិកអប់រំ (Staff Directory)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driveAutoSyncConfig.syncStaffDirectory !== false}
                      onChange={(e) => updateDriveAutoSyncConfig({ syncStaffDirectory: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-800">មូលដ្ឋានទិន្នន័យទាំងមូល (Master JSON)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driveAutoSyncConfig.syncFullBackup}
                      onChange={(e) => updateDriveAutoSyncConfig({ syncFullBackup: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Drive API v3 • OAuth2 Verified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
