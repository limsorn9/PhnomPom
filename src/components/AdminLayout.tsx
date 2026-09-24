import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from '../context/SchoolContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { PrincipalDashboard } from './admin/PrincipalDashboard';
import { DirectorProfileView } from './admin/DirectorProfileView';
import { MobileAppCenter } from './MobileAppCenter';
import { StudentManagementHub } from './StudentManagementHub';
import { AdminTeachersManagement } from './admin/AdminTeachersManagement';
import { ClassroomScores } from './ClassroomScores';
import { BudgetFinance } from './BudgetFinance';
import { ReportsAndQR } from './ReportsAndQR';
import { TeacherReportsHubWrapper } from './TeacherReportsHubWrapper';
import { GoogleWorkspaceHub } from './GoogleWorkspaceHub';
import { AcademicCalendar } from './AcademicCalendar';
import { AccountsManagement } from './AccountsManagement';
import { HomeroomTeacherDashboard } from './HomeroomTeacherDashboard';
import { MyClasses } from './MyClasses';
import { TeacherProfile } from './TeacherProfile';
import { SchoolAdmin } from './SchoolAdmin';
import { SchoolManagement } from './SchoolManagement';
import { StudentTransferManagement } from './StudentTransferManagement';
import { HouseholdCensus } from './HouseholdCensus';
import { LibraryManagement } from './LibraryManagement';
import { OtherLearningResourcesHub } from './OtherLearningResourcesHub';
import { RecentActivityDashboard } from './RecentActivityDashboard';
import { AITeacherHub } from './ai-teacher/AITeacherHub';
import { SchoolEquipmentLoanManager } from './SchoolEquipmentLoanManager';
import { TeacherDailyAgendaPanel } from './TeacherDailyAgendaPanel';
import { TeacherMeetingMinutesManager } from './TeacherMeetingMinutesManager';
import { BulkDataImportExportModal } from './BulkDataImportExportModal';
import { GoogleDriveSyncModal } from './GoogleDriveSyncModal';
import { VersionMismatchModal } from './VersionMismatchModal';
import { QuickSearchSpotlightModal } from './QuickSearchSpotlightModal';

import { StandaloneHtmlExportModal } from './StandaloneHtmlExportModal';
import { SchoolProfileModal } from './SchoolProfileModal';
import { DirectorPinModal } from './DirectorPinModal';
import { SuperAdminHub } from './SuperAdminHub';

import { initAuth, googleSignIn, logout } from '../services/googleAuth';
import { User } from 'firebase/auth';
import {
  MapPin,
  Facebook
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
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
      showToast('ß₧öß₧╢ß₧ôß₧òßƒÆß₧èß₧╢ß₧àßƒïß₧éß₧Äß₧ôß₧╕ Google ß₧Üß₧╜ß₧àß₧Üß₧╢ß₧¢ßƒï', 'info');
    } else {
      setIsAuthLoading(true);
      try {
        const res = await googleSignIn();
        if (res) {
          setGoogleUser(res.user);
          showToast(`ß₧öß₧╢ß₧ôß₧ùßƒÆß₧çß₧╢ß₧ößƒïß₧éß₧Äß₧ôß₧╕ ${res.user.displayName || res.user.email} ß₧çßƒäß₧éß₧çßƒÉß₧Ö!`);
        }
      } catch (err: any) {
        showToast(err.message || 'ß₧öß₧Üß₧╢ß₧çßƒÉß₧Öß₧ÇßƒÆß₧ôß₧╗ß₧äß₧Çß₧╢ß₧Üß₧ùßƒÆß₧çß₧╢ß₧ößƒï Google', 'error');
      } finally {
        setIsAuthLoading(false);
      }
    }
  };

  const handleOpenSettings = () => {
    if (currentUser?.role !== 'director' && currentUser?.role !== 'super_admin') {
      showToast('ß₧ÿß₧╗ß₧üß₧äß₧╢ß₧Üß₧Çßƒåß₧Äß₧Åßƒïß₧ûßƒÉß₧Åßƒîß₧ÿß₧╢ß₧ôß₧ƒß₧╢ß₧¢ß₧╢ß₧ÜßƒÇß₧ôß₧éß₧║ß₧ƒßƒÆß₧Éß₧╖ß₧Åß₧ôßƒàß₧ÇßƒÆß₧ôß₧╗ß₧äß₧ößƒÆß₧Üß₧╝ß₧áßƒÆß₧£ß₧╢ß₧¢ßƒïß₧ôß₧╢ß₧Öß₧Çß₧ƒß₧╢ß₧¢ß₧╢ß₧Åßƒéß₧ÿßƒÆß₧ôß₧╢ß₧Çßƒïß₧éß₧Åßƒï!', 'error');
      return;
    }
    setIsSettingsOpen(true);
  };

  const handleSaveProfile = (updatedProfile: typeof schoolProfile) => {
    updateSchoolProfile(updatedProfile);
  };



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
        {activeTab !== 'dashboard' && (
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
        )}

        {/* Dynamic Main Workspace Container */}
        <main className={`flex-1 w-full mx-auto ${activeTab === 'dashboard' ? '' : 'pb-20 lg:pb-8 max-w-7xl p-3 sm:p-5 lg:p-6 space-y-6'}`}>
          {/* Render based on RBAC & Active Tab */}
          
          
                    {activeTab === 'librarian_dashboard' && canAccessTab('librarian_dashboard') && <LibraryManagement />}
          {activeTab === 'dashboard' && canAccessTab('dashboard') && (
            <PrincipalDashboard 
              onNavigate={setActiveTab} 
              onOpenBulkImport={() => setIsBulkImportOpen(true)}
              onOpenSettings={handleOpenSettings}
            />
          )}
          {activeTab === 'director_profile' && <DirectorProfileView />}
          {activeTab === 'ai_teacher' && canAccessTab('ai_teacher') && <AITeacherHub />}
          {activeTab === 'activity_logs' && canAccessTab('activity_logs') && <RecentActivityDashboard />}
          {activeTab === 'homeroom_dashboard' && canAccessTab('homeroom_dashboard') && <HomeroomTeacherDashboard />}
          {activeTab === 'my_classes' && canAccessTab('my_classes') && <MyClasses />}
          {activeTab === 'teacher_profile' && canAccessTab('teacher_profile') && <TeacherProfile />}
          {activeTab === 'teacher_agenda' && canAccessTab('teacher_agenda') && <TeacherDailyAgendaPanel />}
          {activeTab === 'equipment_loans' && canAccessTab('equipment_loans') && <SchoolEquipmentLoanManager />}
          {activeTab === 'teacher_meetings' && canAccessTab('teacher_meetings') && <TeacherMeetingMinutesManager />}
                    {activeTab === 'school_admin' && canAccessTab('school_admin') && <SchoolAdmin />}
          {activeTab === 'school_management' && canAccessTab('school_management') && <SchoolManagement />}
                              {activeTab === 'students' && canAccessTab('students') && <StudentManagementHub />}
          {activeTab === 'transfers' && canAccessTab('transfers') && <StudentTransferManagement />}
          {activeTab === 'household_census' && canAccessTab('household_census') && <HouseholdCensus />}
          {activeTab === 'library' && canAccessTab('library') && <LibraryManagement />}
          {activeTab === 'learning_resources' && canAccessTab('learning_resources') && <OtherLearningResourcesHub />}
          {activeTab === 'teachers' && canAccessTab('teachers') && <AdminTeachersManagement />}
          {(activeTab === 'classrooms' || activeTab === 'scores') && canAccessTab(activeTab) && <ClassroomScores />}
                    {activeTab === 'calendar' && canAccessTab('calendar') && (
            <AcademicCalendar
              googleUser={googleUser}
              onGoogleAuthClick={handleGoogleAuthAction}
            />
          )}
          {activeTab === 'finance' && canAccessTab('finance') && <BudgetFinance />}
          {activeTab === 'reports_qr' && canAccessTab('reports_qr') && <TeacherReportsHubWrapper />}
          {activeTab === 'accounts' && canAccessTab('accounts') && <AccountsManagement />}
          {activeTab === 'workspace' && canAccessTab('workspace') && <GoogleWorkspaceHub />}
        </main>

        {/* Mobile Quick Bottom Navigation */}
        {!isMobileSidebarOpen && (
          <MobileBottomNav
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
            onOpenSettings={handleOpenSettings}
          />
        )}

        {/* Global Desktop & Tablet Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 no-print hidden sm:block">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-moul text-blue-900">{schoolProfile.nameKhmer}</span>
              <span className="text-slate-300">ΓÇó</span>
              <span className="font-times">{schoolProfile.nameLatin}</span>
              <span className="text-slate-300">ΓÇó</span>
              <span>ß₧åßƒÆß₧ôß₧╢ßƒåß₧ƒß₧╖ß₧ÇßƒÆß₧ƒß₧╢ {schoolProfile.academicYear}</span>
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
              <span>ß₧ôß₧╢ß₧Öß₧Çß₧ƒß₧╢ß₧¢ß₧╢: {schoolProfile.principalName} (<span className="font-times">{schoolProfile.principalPhone}</span>)</span>
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
      <AdminLayout />
    </SchoolProvider>
  );
}
