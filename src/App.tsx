import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
import { MobileAppCenter } from './components/MobileAppCenter';
import { StudentManagement } from './components/StudentManagement';
import { TeacherManagement } from './components/TeacherManagement';
import { ClassroomScores } from './components/ClassroomScores';
import { HealthAttendance } from './components/HealthAttendance';
import { BudgetFinance } from './components/BudgetFinance';
import { ReportsAndQR } from './components/ReportsAndQR';
import { GoogleWorkspaceHub } from './components/GoogleWorkspaceHub';
import { AcademicCalendar } from './components/AcademicCalendar';
import { AccountsManagement } from './components/AccountsManagement';
import { StudentPortal } from './components/StudentPortal';
import { SecretaryDashboard } from './components/SecretaryDashboard';
import { HomeroomTeacherDashboard } from './components/HomeroomTeacherDashboard';
import { SchoolAdmin } from './components/SchoolAdmin';
import { SchoolManagement } from './components/SchoolManagement';
import { OfficialDocumentCenter } from './components/OfficialDocumentCenter';
import { StudentTransferManagement } from './components/StudentTransferManagement';
import { HouseholdCensus } from './components/HouseholdCensus';
import { LibraryManagement } from './components/LibraryManagement';
import { OtherLearningResources } from './components/OtherLearningResources';
import { RecentActivityDashboard } from './components/RecentActivityDashboard';
import { AITeacherHub } from './components/ai-teacher/AITeacherHub';
import { SchoolEquipmentLoanManager } from './components/SchoolEquipmentLoanManager';
import { TeacherDailyAgendaPanel } from './components/TeacherDailyAgendaPanel';
import { TeacherMeetingMinutesManager } from './components/TeacherMeetingMinutesManager';
import { TeachingResourceHub } from './components/TeachingResourceHub';
import { BulkDataImportExportModal } from './components/BulkDataImportExportModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { VersionMismatchModal } from './components/VersionMismatchModal';
import { QuickSearchSpotlightModal } from './components/QuickSearchSpotlightModal';
import { AuthScreen } from './components/AuthScreen';
import { StandaloneHtmlExportModal } from './components/StandaloneHtmlExportModal';
import { SchoolProfileModal } from './components/SchoolProfileModal';
import { DirectorPinModal } from './components/DirectorPinModal';
import { SuperAdminHub } from './components/SuperAdminHub';
import { TelegramBotStudio } from './components/TelegramBotStudio';
import { initAuth, googleSignIn, logout } from './services/googleAuth';
import { User } from 'firebase/auth';
import {
  MapPin,
  Facebook
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    schoolProfile,
    updateSchoolProfile,
    showToast,
    currentUser,
    canAccessTab,
    versionConflictState,
    resolveVersionConflict
  } = useSchool();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isExportHtmlOpen, setIsExportHtmlOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Global keyboard shortcut for Quick Search Spotlight (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Google Auth state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsub = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsub();
  }, []);

  const handleGoogleAuthAction = async () => {
    if (googleUser) {
      await logout();
      setGoogleUser(null);
      showToast('បានផ្ដាច់គណនី Google រួចរាល់', 'info');
    } else {
      setIsAuthLoading(true);
      try {
        const res = await googleSignIn();
        if (res) {
          setGoogleUser(res.user);
          showToast(`បានភ្ជាប់គណនី ${res.user.displayName || res.user.email} ជោគជ័យ!`);
        }
      } catch (err: any) {
        showToast(err.message || 'បរាជ័យក្នុងការភ្ជាប់ Google', 'error');
      } finally {
        setIsAuthLoading(false);
      }
    }
  };

  const handleOpenSettings = () => {
    if (currentUser?.role !== 'director' && currentUser?.role !== 'super_admin') {
      showToast('មុខងារកំណត់ព័ត៌មានសាលារៀនគឺស្ថិតនៅក្នុងប្រូហ្វាល់នាយកសាលាតែម្នាក់គត់!', 'error');
      return;
    }
    setIsSettingsOpen(true);
  };

  const handleSaveProfile = (updatedProfile: typeof schoolProfile) => {
    updateSchoolProfile(updatedProfile);
  };

  // If user is not logged in, show AuthScreen
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-battambang text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Vertical Sidebar on the Left */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isCollapsed={isDesktopCollapsed}
        setIsCollapsed={setIsDesktopCollapsed}
        onOpenSettings={handleOpenSettings}
        googleUser={googleUser}
        onGoogleAuthClick={handleGoogleAuthAction}
        isAuthLoading={isAuthLoading}
      />

      {/* Main Content Body (Right Side) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Sticky Top Header */}
        <div className={activeTab === 'dashboard' ? 'hidden lg:block' : 'block'}>
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSettings={handleOpenSettings}
          googleUser={googleUser}
          onGoogleAuthClick={handleGoogleAuthAction}
          isAuthLoading={isAuthLoading}
          onExportStandaloneHtml={() => setIsExportHtmlOpen(true)}
          onOpenBulkImport={() => setIsBulkImportOpen(true)}
          onOpenDriveSync={() => setIsDriveSyncOpen(true)}
          onOpenSpotlightSearch={() => setIsSpotlightOpen(true)}
        />
        </div>

        {/* Dynamic Main Workspace Container */}
        <main className={`flex-1 w-full mx-auto pb-20 lg:pb-8 ${activeTab === 'dashboard' ? 'p-0 lg:p-6 lg:max-w-7xl lg:space-y-6' : 'max-w-7xl p-3 sm:p-5 lg:p-6 space-y-6'}`}>
          {/* Render based on RBAC & Active Tab */}
          {activeTab === 'super_admin_hub' && canAccessTab('super_admin_hub') && <SuperAdminHub />}
          {activeTab === 'telegram_bot' && canAccessTab('telegram_bot') && <TelegramBotStudio />}
          {activeTab === 'secretary_dashboard' && canAccessTab('secretary_dashboard') && <SecretaryDashboard />}
          {activeTab === 'librarian_dashboard' && canAccessTab('librarian_dashboard') && <LibraryManagement />}
          {activeTab === 'dashboard' && canAccessTab('dashboard') && (
            <>
              <div className="hidden lg:block">
                <Dashboard />
              </div>
              <div className="block lg:hidden">
                <MobileAppCenter onOpenMenu={() => setIsMobileSidebarOpen(true)} />
              </div>
            </>
          )}
          {activeTab === 'ai_teacher' && canAccessTab('ai_teacher') && <AITeacherHub />}
          {activeTab === 'activity_logs' && canAccessTab('activity_logs') && <RecentActivityDashboard />}
          {activeTab === 'homeroom_dashboard' && canAccessTab('homeroom_dashboard') && <HomeroomTeacherDashboard />}
          {activeTab === 'teacher_agenda' && canAccessTab('teacher_agenda') && <TeacherDailyAgendaPanel />}
          {activeTab === 'equipment_loans' && canAccessTab('equipment_loans') && <SchoolEquipmentLoanManager />}
          {activeTab === 'teacher_meetings' && canAccessTab('teacher_meetings') && <TeacherMeetingMinutesManager />}
          {activeTab === 'teaching_resources' && canAccessTab('teaching_resources') && <TeachingResourceHub />}
          {activeTab === 'school_admin' && canAccessTab('school_admin') && <SchoolAdmin />}
          {activeTab === 'school_management' && canAccessTab('school_management') && <SchoolManagement />}
          {activeTab === 'official_documents' && canAccessTab('official_documents') && <OfficialDocumentCenter />}
          {activeTab === 'student_portal' && canAccessTab('student_portal') && <StudentPortal />}
          {activeTab === 'students' && canAccessTab('students') && <StudentManagement />}
          {activeTab === 'transfers' && canAccessTab('transfers') && <StudentTransferManagement />}
          {activeTab === 'household_census' && canAccessTab('household_census') && <HouseholdCensus />}
          {activeTab === 'library' && canAccessTab('library') && <LibraryManagement />}
          {activeTab === 'learning_resources' && canAccessTab('learning_resources') && <OtherLearningResources />}
          {activeTab === 'teachers' && canAccessTab('teachers') && <TeacherManagement />}
          {(activeTab === 'classrooms' || activeTab === 'scores') && canAccessTab(activeTab) && <ClassroomScores />}
          {activeTab === 'attendance_health' && canAccessTab('attendance_health') && <HealthAttendance />}
          {activeTab === 'calendar' && canAccessTab('calendar') && (
            <AcademicCalendar
              googleUser={googleUser}
              onGoogleAuthClick={handleGoogleAuthAction}
            />
          )}
          {activeTab === 'finance' && canAccessTab('finance') && <BudgetFinance />}
          {activeTab === 'reports_qr' && canAccessTab('reports_qr') && <ReportsAndQR />}
          {activeTab === 'accounts' && canAccessTab('accounts') && <AccountsManagement />}
          {activeTab === 'workspace' && canAccessTab('workspace') && <GoogleWorkspaceHub />}
        </main>

        {/* Mobile Quick Bottom Navigation */}
        <MobileBottomNav
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSettings={handleOpenSettings}
        />

        {/* Global Desktop & Tablet Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 no-print hidden sm:block">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-moul text-blue-900">{schoolProfile.nameKhmer}</span>
              <span className="text-slate-300">•</span>
              <span className="font-times">{schoolProfile.nameLatin}</span>
              <span className="text-slate-300">•</span>
              <span>ឆ្នាំសិក្សា {schoolProfile.academicYear}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 text-[11px]">
              {schoolProfile.mapUrl && (
                <a
                  href={schoolProfile.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>Google Maps</span>
                </a>
              )}
              {schoolProfile.facebookPage && (
                <a
                  href={schoolProfile.facebookPage}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1"
                >
                  <Facebook className="w-3 h-3 text-blue-600" />
                  <span>Facebook Page</span>
                </a>
              )}
              <span>នាយកសាលា: {schoolProfile.principalName} (<span className="font-times">{schoolProfile.principalPhone}</span>)</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Settings Modal (School Profile Editor with Validation) */}
      <SchoolProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialProfile={schoolProfile}
        onSave={handleSaveProfile}
        showToast={showToast}
      />

      {/* Standalone HTML Exporter Modal */}
      <StandaloneHtmlExportModal
        isOpen={isExportHtmlOpen}
        onClose={() => setIsExportHtmlOpen(false)}
      />

      {/* Bulk Data Import & Export Hub Modal */}
      <BulkDataImportExportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />

      {/* Google Drive Cloud Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={isDriveSyncOpen}
        onClose={() => setIsDriveSyncOpen(false)}
        googleUser={googleUser}
        onGoogleAuthClick={handleGoogleAuthAction}
      />

      {/* Global Quick Search Spotlight Modal (Ctrl+K) */}
      <QuickSearchSpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />

      {/* Version Mismatch Notification Modal */}
      <VersionMismatchModal
        conflictState={versionConflictState}
        onDismiss={() => resolveVersionConflict('keep_local')}
        onKeepLocal={() => resolveVersionConflict('keep_local')}
        onKeepCloud={() => resolveVersionConflict('keep_cloud', versionConflictState.cloudVersion?.snapshotData)}
      />

      {/* Global Director Secret PIN Modal */}
      <DirectorPinModal />
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
