import React, { useEffect, useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { HomeroomTeacherDashboard } from './components/HomeroomTeacherDashboard';
import { LoginPage } from './components/LoginPage';
import { VersionMismatchModal } from './components/VersionMismatchModal';
import { DirectorPinModal } from './components/DirectorPinModal';
import { initAuth, googleSignIn, logout } from './services/googleAuth';
import { User } from 'firebase/auth';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    versionConflictState,
    resolveVersionConflict,
    showToast
  } = useSchool();

  // Google Auth state (if needed later)
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsub();
  }, []);

  // If user is not logged in, show LoginPage
  if (!currentUser) {
    return <LoginPage />;
  }

  // Pure KrouDigital 4.0 Teacher Layout (Bypassing old bloat)
  return (
    <>
      <HomeroomTeacherDashboard />
      
      {/* Version Mismatch Notification Modal */}
      <VersionMismatchModal
        conflictState={versionConflictState}
        onDismiss={() => resolveVersionConflict('keep_local')}
        onKeepLocal={() => resolveVersionConflict('keep_local')}
        onKeepCloud={() => resolveVersionConflict('keep_cloud', versionConflictState.cloudVersion?.snapshotData)}
      />

      {/* Global Director Secret PIN Modal */}
      <DirectorPinModal />
    </>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
