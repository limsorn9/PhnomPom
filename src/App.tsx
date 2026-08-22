import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Dashboard } from './components/Dashboard';
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
import { HomeroomTeacherDashboard } from './components/HomeroomTeacherDashboard';
import { SchoolAdmin } from './components/SchoolAdmin';
import { SchoolManagement } from './components/SchoolManagement';
import { OfficialDocumentCenter } from './components/OfficialDocumentCenter';
import { StudentTransferManagement } from './components/StudentTransferManagement';
import { HouseholdCensus } from './components/HouseholdCensus';
import { LibraryManagement } from './components/LibraryManagement';
import { BulkDataImportExportModal } from './components/BulkDataImportExportModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { AuthScreen } from './components/AuthScreen';
import { StandaloneHtmlExportModal } from './components/StandaloneHtmlExportModal';
import { initAuth, googleSignIn, logout } from './services/googleAuth';
import { User } from 'firebase/auth';
import {
  X,
  Save,
  MapPin,
  Facebook,
  Phone,
  ExternalLink
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    schoolProfile,
    updateSchoolProfile,
    showToast,
    currentUser,
    canAccessTab
  } = useSchool();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [profileForm, setProfileForm] = useState(schoolProfile);
  const [isExportHtmlOpen, setIsExportHtmlOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState(false);

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
    setProfileForm(schoolProfile);
    setIsSettingsOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(profileForm);
    setIsSettingsOpen(false);
    showToast('បានរក្សាទុកព័ត៌មានសាលារៀនដោយជោគជ័យ!');
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
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSettings={handleOpenSettings}
          googleUser={googleUser}
          onGoogleAuthClick={handleGoogleAuthAction}
          isAuthLoading={isAuthLoading}
          onExportStandaloneHtml={() => setIsExportHtmlOpen(true)}
          onOpenBulkImport={() => setIsBulkImportOpen(true)}
          onOpenDriveSync={() => setIsDriveSyncOpen(true)}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-20 lg:pb-8 space-y-6">
          {/* Render based on RBAC & Active Tab */}
          {activeTab === 'dashboard' && canAccessTab('dashboard') && <Dashboard />}
          {activeTab === 'homeroom_dashboard' && canAccessTab('homeroom_dashboard') && <HomeroomTeacherDashboard />}
          {activeTab === 'school_admin' && canAccessTab('school_admin') && <SchoolAdmin />}
          {activeTab === 'school_management' && canAccessTab('school_management') && <SchoolManagement />}
          {activeTab === 'official_documents' && canAccessTab('official_documents') && <OfficialDocumentCenter />}
          {activeTab === 'student_portal' && canAccessTab('student_portal') && <StudentPortal />}
          {activeTab === 'students' && canAccessTab('students') && <StudentManagement />}
          {activeTab === 'transfers' && canAccessTab('transfers') && <StudentTransferManagement />}
          {activeTab === 'household_census' && canAccessTab('household_census') && <HouseholdCensus />}
          {activeTab === 'library' && canAccessTab('library') && <LibraryManagement />}
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
        <MobileBottomNav onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

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

      {/* Settings Modal (School Profile Editor) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-battambang">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold font-moul">កែប្រែព័ត៌មានសាលារៀន</h3>
                <p className="text-xs text-blue-100">
                  កំណត់ឈ្មោះសាលា ទីតាំងភូមិសាស្ត្រ នាយកសាលា និងតំណភ្ជាប់បណ្ដាញសង្គម
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ឈ្មោះសាលារៀនជាភាសាខ្មែរ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.nameKhmer}
                  onChange={(e) => setProfileForm({ ...profileForm, nameKhmer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-moul text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ឈ្មោះសាលាជាអក្សរឡាតាំង
                </label>
                <input
                  type="text"
                  value={profileForm.nameLatin}
                  onChange={(e) => setProfileForm({ ...profileForm, nameLatin: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-times focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">កូដសាលា (School ID)</label>
                  <input
                    type="text"
                    value={profileForm.schoolCode}
                    onChange={(e) => setProfileForm({ ...profileForm, schoolCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-times focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ឆ្នាំសិក្សា</label>
                  <input
                    type="text"
                    value={profileForm.academicYear}
                    onChange={(e) => setProfileForm({ ...profileForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Geographic Location */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  ទីតាំងភូមិសាស្ត្ររដ្ឋបាល
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ខេត្ត / រាជធានី</label>
                    <input
                      type="text"
                      value={profileForm.province}
                      onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ក្រុង / ស្រុក / ខណ្ឌ</label>
                    <input
                      type="text"
                      value={profileForm.district}
                      onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ឃុំ / សង្កាត់</label>
                    <input
                      type="text"
                      value={profileForm.commune}
                      onChange={(e) => setProfileForm({ ...profileForm, commune: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ភូមិ</label>
                    <input
                      type="text"
                      value={profileForm.village}
                      onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Leadership Contact */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  គណៈគ្រប់គ្រង និងទំនាក់ទំនង
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ឈ្មោះនាយកសាលា</label>
                    <input
                      type="text"
                      value={profileForm.principalName}
                      onChange={(e) => setProfileForm({ ...profileForm, principalName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">លេខទូរស័ព្ទនាយក</label>
                    <input
                      type="text"
                      value={profileForm.principalPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, principalPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-times focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* External Links: Google Maps and Facebook */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  តំណភ្ជាប់ទីតាំង និងបណ្ដាញសង្គម
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">តំណភ្ជាប់ Google Maps Location</label>
                    <input
                      type="url"
                      value={profileForm.mapUrl || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, mapUrl: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-times text-[11px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ទំព័រ Facebook Page</label>
                    <input
                      type="url"
                      value={profileForm.facebookPage || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, facebookPage: e.target.value })}
                      placeholder="https://web.facebook.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-times text-[11px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  រក្សាទុកព័ត៌មាន
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
