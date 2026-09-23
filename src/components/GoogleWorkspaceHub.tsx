import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../services/googleAuth';
import {
  exportStudentsToGoogleSheets,
  exportScoresToGoogleSheets,
  exportTeachersToGoogleSheets,
  exportFinanceToGoogleSheets,
  readSpreadsheetValues,
  getSpreadsheetMetadata,
  CreatedSheetResult
} from '../services/googleSheets';
import {
  listDriveFiles,
  createDriveFolder,
  uploadFileToDrive,
  deleteDriveItem,
  backupSchoolDataToDrive,
  DriveItem
} from '../services/googleDrive';
import {
  FileSpreadsheet,
  HardDrive,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  Download,
  FolderPlus,
  Folder,
  FileText,
  File,
  Image,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  LogOut,
  Sparkles,
  Database,
  Eye,
  FileDown,
  Info,
  Calendar,
  Layers,
  Users,
  GraduationCap,
  CircleDollarSign,
  ArrowRight,
  Mail
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GmailManager } from './GmailManager';

export const GoogleWorkspaceHub: React.FC = () => {
  const {
    schoolProfile,
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    attendanceRecords,
    calendarEvents,
    addStudent,
    setActiveTab,
    showToast
  } = useSchool();

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active workspace sub-tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'sheets' | 'drive' | 'gmail' | 'backup'>('sheets');

  // Sheets Export State
  const [exportType, setExportType] = useState<'students' | 'scores' | 'teachers' | 'finance'>('students');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('ក');
  const [selectedMonth, setSelectedMonth] = useState<string>('តុលា');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<CreatedSheetResult | null>(null);

  // Sheets Reader / Importer State
  const [importSpreadsheetId, setImportSpreadsheetId] = useState('');
  const [importRange, setImportRange] = useState('A1:L25');
  const [isReadingSheet, setIsReadingSheet] = useState(false);
  const [sheetPreviewData, setSheetPreviewData] = useState<any[][] | null>(null);
  const [sheetMetadata, setSheetMetadata] = useState<any | null>(null);

  // Drive State
  const [driveFiles, setDriveFiles] = useState<DriveItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderHistory, setFolderHistory] = useState<{ id: string | undefined; name: string }[]>([
    { id: undefined, name: 'Drive របស់ខ្ញុំ (Root)' }
  ]);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('លិខិតរដ្ឋបាល');
  const [isUploading, setIsUploading] = useState(false);

  // Deletion Confirmation Modal State (MANDATORY)
  const [itemToDelete, setItemToDelete] = useState<DriveItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Backup State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupFile, setLastBackupFile] = useState<DriveItem | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch drive files when authenticated and tab is drive or sheets
  useEffect(() => {
    if (hasToken && currentUser) {
      loadDriveFiles();
    }
  }, [hasToken, currentUser, currentFolderId]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        showToast(`បានភ្ជាប់គណនី Google «${res.user.displayName || res.user.email}» ដោយជោគជ័យ!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'បរាជ័យក្នុងការភ្ជាប់ Google', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setHasToken(false);
      setDriveFiles([]);
      showToast('បានផ្ដាច់គណនី Google រួចរាល់', 'info');
    } catch (err: any) {
      showToast('មានបញ្ហាក្នុងការចាកចេញ', 'error');
    }
  };

  const loadDriveFiles = async () => {
    setIsLoadingDrive(true);
    try {
      const files = await listDriveFiles(currentFolderId, driveSearchQuery);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Export to Google Sheets
  const handleExportSheets = async () => {
    if (!hasToken) {
      showToast('សូមភ្ជាប់គណនី Google ជាមុនសិន', 'error');
      return;
    }

    setIsExporting(true);
    try {
      let result: CreatedSheetResult;
      if (exportType === 'students') {
        const filtered = students.filter(
          s => (selectedGrade === 0 || s.grade === selectedGrade) && (!selectedSection || s.section === selectedSection)
        );
        const label = selectedGrade === 0 ? 'សិស្សទាំងអស់' : `ថ្នាក់ទី${selectedGrade}${selectedSection}`;
        result = await exportStudentsToGoogleSheets(schoolProfile, filtered.length > 0 ? filtered : students, label);
      } else if (exportType === 'scores') {
        const matchedScores = scores.filter(
          s => s.grade === selectedGrade && s.section === selectedSection && s.monthOrSemester === selectedMonth
        );
        result = await exportScoresToGoogleSheets(schoolProfile, selectedGrade, selectedSection, selectedMonth, matchedScores);
      } else if (exportType === 'teachers') {
        result = await exportTeachersToGoogleSheets(schoolProfile, teachers);
      } else {
        result = await exportFinanceToGoogleSheets(schoolProfile, budgetTransactions);
      }

      setLastExportResult(result);
      showToast(`បានបង្កើត Google Sheet «${result.title}» ដោយជោគជ័យ!`);
      // Reload drive list so user sees their new sheet
      loadDriveFiles();
    } catch (err: any) {
      console.error('Export error:', err);
      showToast(err.message || 'បរាជ័យក្នុងការនាំចេញទៅ Google Sheets', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Read Google Sheet Values
  const handleReadSheet = async () => {
    if (!importSpreadsheetId.trim()) {
      showToast('សូមបញ្ចូល Google Spreadsheet ID ឬ Link', 'error');
      return;
    }

    // Extract ID if full URL pasted
    let cleanId = importSpreadsheetId.trim();
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }

    setIsReadingSheet(true);
    setSheetPreviewData(null);
    try {
      const meta = await getSpreadsheetMetadata(cleanId);
      setSheetMetadata(meta);
      const firstSheetName = meta.sheets?.[0]?.properties?.title || 'Sheet1';
      const rangeToFetch = importRange.includes('!') ? importRange : `'${firstSheetName}'!${importRange}`;
      const values = await readSpreadsheetValues(cleanId, rangeToFetch);
      setSheetPreviewData(values);
      showToast(`បានអានទិន្នន័យចំនួន ${values.length} ជួរដេកពី Google Sheet ជោគជ័យ!`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'បរាជ័យក្នុងការអាន Google Sheet', 'error');
    } finally {
      setIsReadingSheet(false);
    }
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const folder = await createDriveFolder(newFolderName.trim(), currentFolderId);
      showToast(`បានបង្កើតថត «${folder.name}» ដោយជោគជ័យ!`);
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadDriveFiles();
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការបង្កើត Folder', 'error');
    }
  };

  // Upload File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFileToDrive(
          file,
          file.name,
          file.type || 'application/octet-stream',
          currentFolderId,
          `ឯកសារប្រភេទ៖ ${uploadCategory} | ផ្ទុកឡើងដោយសាលា ${schoolProfile.nameKhmer}`
        );
      }
      showToast(`បានផ្ទុកឡើងឯកសារ ${files.length} ទៅកាន់ Google Drive ដោយជោគជ័យ!`);
      loadDriveFiles();
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការផ្ទុកឯកសារ', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Confirm and Delete Drive Item
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDriveItem(itemToDelete.id);
      showToast(`បានលុប «${itemToDelete.name}» ចេញពី Google Drive រួចរាល់!`, 'info');
      setItemToDelete(null);
      loadDriveFiles();
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការលុបឯកសារ', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Backup Full School Data
  const handleBackupSchoolData = async () => {
    if (!hasToken) {
      showToast('សូមភ្ជាប់គណនី Google ជាមុនសិន', 'error');
      return;
    }

    setIsBackingUp(true);
    try {
      const fullSchoolPayload = {
        exportedAt: new Date().toISOString(),
        schoolProfile,
        students,
        teachers,
        classrooms,
        scores,
        budgetTransactions,
        attendanceRecords,
        calendarEvents
      };

      const result = await backupSchoolDataToDrive(fullSchoolPayload, schoolProfile.nameKhmer);
      setLastBackupFile(result);
      showToast(`បានបម្រុងទុកទិន្នន័យសាលាទាំងស្រុងទៅ Google Drive ដោយជោគជ័យ!`);
      loadDriveFiles();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'បរាជ័យក្នុងការបម្រុងទុកទិន្នន័យ', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Helper for folder navigation
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderHistory(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const target = folderHistory[index];
    setCurrentFolderId(target.id);
    setFolderHistory(prev => prev.slice(0, index + 1));
  };

  // Helper to format file size
  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-500 fill-amber-100" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('word')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType.includes('image')) {
      return <Image className="w-5 h-5 text-purple-600" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const months = ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី១', 'ឆមាសទី២'];

  return (
    <div className="space-y-6">
      {/* Top Banner: Google Workspace Status */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ប្រព័ន្ធសមាហរណកម្ម Google Workspace ផ្លូវការ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-moul tracking-wide text-white">
              Google Sheets & Google Drive សាលារៀន
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              ភ្ជាប់ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សាជាមួយ Google Cloud ដើម្បីនាំចេញបញ្ជីឈ្មោះសិស្ស តារាងពិន្ទុប្រចាំខែ បញ្ជីបុគ្គលិក និងរក្សាទុកឯកសាររដ្ឋបាលក្នុង Google Drive ប្រកបដោយសុវត្ថិភាព។
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            {hasToken && currentUser ? (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-400">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Connected" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white leading-snug">
                      {currentUser.displayName || 'គណនី Google សាលា'}
                    </span>
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      ភ្ជាប់រួចរាល់
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate max-w-[200px]">
                    {currentUser.email}
                  </p>
                  <p className="text-[11px] text-blue-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Google Sheets & Drive បានបើក
                  </p>
                </div>
                <button
                  id="google-signout-button"
                  onClick={handleSignOut}
                  className="ml-auto sm:ml-2 p-2 hover:bg-white/20 rounded-xl text-rose-300 hover:text-rose-200 transition-colors"
                  title="ផ្ដាច់គណនី (Sign out)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center sm:text-left space-y-3 w-full">
                <div>
                  <h4 className="text-xs font-bold text-white">ចូលប្រើប្រាស់ជាមួយ Google</h4>
                  <p className="text-[11px] text-slate-300">
                    ដើម្បីអនុញ្ញាតឱ្យប្រព័ន្ធនាំចេញទិន្នន័យទៅ Sheets & Drive
                  </p>
                </div>

                {/* Google Sign-in Button */}
                <button
                  id="google-signin-button"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'កំពុងភ្ជាប់...' : 'ចូលគណនីជាមួយ Google (Sign in)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="tab-btn-sheets"
          onClick={() => setActiveWorkspaceTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeWorkspaceTab === 'sheets'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>សន្លឹកកិច្ចការ Google Sheets</span>
        </button>

        <button
          id="tab-btn-drive"
          onClick={() => setActiveWorkspaceTab('drive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeWorkspaceTab === 'drive'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>ឃ្លាំងឯកសារ Google Drive</span>
        </button>

        <button
          id="tab-btn-gmail"
          onClick={() => setActiveWorkspaceTab('gmail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeWorkspaceTab === 'gmail'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>ប្រព័ន្ធសារ Gmail (School Email)</span>
        </button>

        <button
          id="tab-btn-backup"
          onClick={() => setActiveWorkspaceTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeWorkspaceTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>បម្រុងទុកទិន្នន័យសាលា (Full Cloud Backup)</span>
        </button>
      </div>

      {/* VIEW 1: Google Sheets Management */}
      {activeWorkspaceTab === 'sheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Export Engine */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-moul">
                      នាំចេញទិន្នន័យទៅ Google Sheets
                    </h3>
                    <p className="text-xs text-slate-500">
                      បង្កើតឯកសារ Google Sheets ស្វ័យប្រវត្តិតាមទម្រង់ក្រសួងអប់រំ
                    </p>
                  </div>
                </div>
              </div>

              {/* Select Export Category */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  ជ្រើសរើសប្រភេទរបាយការណ៍ដែលត្រូវនាំចេញ៖
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportType('students')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                      exportType === 'students'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">បញ្ជីឈ្មោះសិស្ស</div>
                      <div className="text-[11px] text-slate-500 font-normal">{students.length} នាក់</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportType('scores')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                      exportType === 'scores'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">តារាងពិន្ទុប្រចាំខែ</div>
                      <div className="text-[11px] text-slate-500 font-normal">៦ មុខវិជ្ជា + ចំណាត់ថ្នាក់</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportType('teachers')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                      exportType === 'teachers'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">បញ្ជីគ្រូបង្រៀន & បុគ្គលិក</div>
                      <div className="text-[11px] text-slate-500 font-normal">{teachers.length} នាក់</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportType('finance')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                      exportType === 'finance'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">ថវិកា & ហិរញ្ញវត្ថុ</div>
                      <div className="text-[11px] text-slate-500 font-normal">{budgetTransactions.length} ប្រតិបត្តិការ</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Filters for students / scores */}
              {(exportType === 'students' || exportType === 'scores') && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">កម្រិតថ្នាក់</label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      {exportType === 'students' && <option value={0}>សិស្សគ្រប់ថ្នាក់ (១-៦)</option>}
                      {[1, 2, 3, 4, 5, 6].map(g => (
                        <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">បន្ទប់ / ស្លាក</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      {['ក', 'ខ', 'គ', 'ឃ'].map(sec => (
                        <option key={sec} value={sec}>បន្ទប់ «{sec}»</option>
                      ))}
                    </select>
                  </div>

                  {exportType === 'scores' && (
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ខែ / ឆមាស</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      >
                        {months.map(m => (
                          <option key={m} value={m}>ខែ {m}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                id="btn-execute-sheet-export"
                onClick={handleExportSheets}
                disabled={isExporting}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងបង្កើត និងសរសេរទិន្នន័យចូល Google Sheet...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>នាំចេញ និងបង្កើត Google Sheet ឥឡូវនេះ</span>
                  </>
                )}
              </button>

              {/* Success Card with Link */}
              {lastExportResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>បានបង្កើត Google Sheet ជោគជ័យ!</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    ចំណងជើង៖ <span className="font-semibold text-slate-900">{lastExportResult.title}</span>
                  </p>
                  <a
                    href={lastExportResult.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors"
                  >
                    <span>បើកមើលក្នុង Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Google Sheet Reader / Importer */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-moul">
                      អាន និងទាញយកទិន្នន័យពី Google Sheet
                    </h3>
                    <p className="text-xs text-slate-500">
                      បញ្ចូល Spreadsheet ID ឬ Link ដើម្បីទាញយកទិន្នន័យមកមើលក្នុងប្រព័ន្ធ
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Spreadsheet Link ឬ ID
                  </label>
                  <input
                    type="text"
                    value={importSpreadsheetId}
                    onChange={(e) => setImportSpreadsheetId(e.target.value)}
                    placeholder="ឧ. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms ឬ Paste URL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ជួរក្រឡាទិន្នន័យ (Cell Range)
                  </label>
                  <input
                    type="text"
                    value={importRange}
                    onChange={(e) => setImportRange(e.target.value)}
                    placeholder="ឧ. A1:L25 ឬ 'Sheet1'!A1:Z50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                  />
                </div>

                <button
                  id="btn-read-sheet-data"
                  onClick={handleReadSheet}
                  disabled={isReadingSheet || !hasToken}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isReadingSheet ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>កំពុងទាញយកទិន្នន័យ...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>ទាញយក និងបង្ហាញតារាងទិន្នន័យ</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview Table */}
              {sheetPreviewData && sheetPreviewData.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      ទិន្នន័យទាញយកបាន ({sheetPreviewData.length} ជួរដេក)
                    </span>
                    {sheetMetadata && (
                      <span className="text-slate-500 font-medium">
                        {sheetMetadata.properties?.title}
                      </span>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-60">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <tbody>
                        {sheetPreviewData.slice(0, 10).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={rIdx === 0 ? 'bg-slate-100 font-bold text-slate-800' : 'border-t border-slate-100 hover:bg-slate-50'}
                          >
                            {row.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="p-2 border-r border-slate-100 whitespace-nowrap">
                                {String(cell || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {sheetPreviewData.length > 10 && (
                    <p className="text-[11px] text-slate-400 text-center">
                      ...និងទិន្នន័យ {sheetPreviewData.length - 10} ជួរដេកផ្សេងទៀត
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Google Drive File Manager */}
      {activeWorkspaceTab === 'drive' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-moul flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <span>ឃ្លាំងឯកសារឌីជីថល Google Drive</span>
              </h3>
              <p className="text-xs text-slate-500">
                រក្សាទុក ស្វែងរក និងគ្រប់គ្រងឯកសារសាលារៀនលើ Google Cloud
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-open-create-folder"
                onClick={() => setShowNewFolderModal(true)}
                disabled={!hasToken}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                <FolderPlus className="w-4 h-4 text-amber-600" />
                <span>បង្កើតថតថ្មី</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'កំពុងផ្ទុកឡើង...' : 'ផ្ទុកឯកសារឡើង (Upload)'}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={!hasToken || isUploading}
                  className="hidden"
                />
              </label>

              <button
                onClick={loadDriveFiles}
                disabled={!hasToken || isLoadingDrive}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
                title="ទាញយកបញ្ជីឡើងវិញ (Refresh)"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto text-slate-600 font-medium">
              {folderHistory.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400">/</span>}
                  <button
                    onClick={() => navigateToBreadcrumb(idx)}
                    className={`hover:text-blue-600 whitespace-nowrap ${
                      idx === folderHistory.length - 1 ? 'font-bold text-slate-900' : ''
                    }`}
                  >
                    {item.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={driveSearchQuery}
                onChange={(e) => setDriveSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDriveFiles()}
                placeholder="ស្វែងរកក្នុង Drive..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Drive Files Table */}
          {!hasToken ? (
            <div className="text-center py-12 space-y-3">
              <HardDrive className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">សូមភ្ជាប់គណនី Google ជាមុនសិន</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ចុចប៊ូតុង «ចូលគណនីជាមួយ Google» ខាងលើដើម្បីមើល និងគ្រប់គ្រងឯកសារក្នុង Google Drive
              </p>
            </div>
          ) : isLoadingDrive ? (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">កំពុងទាញយកបញ្ជីឯកសារពី Google Drive...</p>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Folder className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">គ្មានឯកសារក្នុងថតនេះទេ</h4>
              <p className="text-xs text-slate-500">
                អ្នកអាចបង្កើត Folder ថ្មី ឬផ្ទុកឡើងឯកសាររដ្ឋបាលសាលារៀនបានគ្រប់ពេល
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ឈ្មោះឯកសារ</th>
                      <th className="py-3 px-4">ទំហំ</th>
                      <th className="py-3 px-4">កែប្រែចុងក្រោយ</th>
                      <th className="py-3 px-4 text-right">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {driveFiles.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      return (
                        <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              {getFileIcon(file.mimeType)}
                              {isFolder ? (
                                <button
                                  onClick={() => navigateToFolder(file.id, file.name)}
                                  className="font-bold text-slate-800 hover:text-blue-600 text-left transition-colors"
                                >
                                  {file.name}
                                </button>
                              ) : (
                                <span className="font-medium text-slate-800">{file.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px] font-mono">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('km-KH') : '-'}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="បើកមើលក្នុង Google Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => setItemToDelete(file)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="លុបឯកសារ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Full School Cloud Backup */}
      {activeWorkspaceTab === 'backup' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-moul">
                បម្រុងទុកទិន្នន័យសាលាទាំងមូល (Full School Cloud Backup)
              </h3>
              <p className="text-xs text-slate-500">
                រក្សាទុកទិន្នន័យសិស្ស គ្រូបង្រៀន ពិន្ទុ វត្តមាន និងថវិកាទាំងអស់ជាឯកសារ JSON ទៅកាន់ Google Drive ដោយផ្ទាល់
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">ចំនួនទិន្នន័យសិស្ស</span>
              <div className="text-xl font-bold text-slate-900 font-mono">{students.length} នាក់</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">ចំនួនទិន្នន័យគ្រូបង្រៀន</span>
              <div className="text-xl font-bold text-slate-900 font-mono">{teachers.length} នាក់</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">កំណត់ត្រាពិន្ទុ & វត្តមាន</span>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {scores.length + attendanceRecords.length} កំណត់ត្រា
              </div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-indigo-950">
                ចុចដើម្បីបង្កើតឯកសារបម្រុងទុក (Instant Cloud Sync)
              </h4>
              <p className="text-xs text-indigo-700">
                ឯកសារនឹងត្រូវរក្សាទុកក្នុង Google Drive របស់អ្នកដោយសុវត្ថិភាពខ្ពស់
              </p>
            </div>
            <button
              id="btn-trigger-full-backup"
              onClick={handleBackupSchoolData}
              disabled={isBackingUp || !hasToken}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 flex-shrink-0"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>កំពុងបម្រុងទុកទៅ Google Drive...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>បម្រុងទុកទិន្នន័យទៅ Google Drive</span>
                </>
              )}
            </button>
          </div>

          {lastBackupFile && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    បានបម្រុងទុកដោយជោគជ័យ!
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    {lastBackupFile.name}
                  </div>
                </div>
              </div>
              {lastBackupFile.webViewLink && (
                <a
                  href={lastBackupFile.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5"
                >
                  <span>ពិនិត្យក្នុង Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Gmail Email Manager */}
      {activeWorkspaceTab === 'gmail' && (
        <GmailManager />
      )}

      {/* MANDATORY CONFIRMATION MODAL FOR DELETIONS */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-moul">បញ្ជាក់ការលុបឯកសារ</h3>
                <p className="text-xs text-slate-500">ការលុបនេះនឹងដកចេញពី Google Drive របស់អ្នក</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="text-slate-600">តើអ្នកពិតជាចង់លុបឯកសារខាងក្រោមនេះមែនទេ?</p>
              <p className="font-bold text-slate-900 font-mono break-all">{itemToDelete.name}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                បោះបង់
              </button>
              <button
                type="button"
                id="btn-confirm-delete-drive-item"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'កំពុងលុប...' : 'យល់ព្រមលុប'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Folder */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-moul">បង្កើតថតថ្មីក្នុង Drive</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះថត (Folder Name)
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="ឧ. ឯកសាររដ្ឋបាល ២០២៤-២០២៥"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  បង្កើតថត
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
