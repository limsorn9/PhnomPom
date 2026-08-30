import React, { useState, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AppUser, UserRole, ProfileEditRequest, SecurityLoginLog } from '../types';
import { SecurityAndSessionManager } from './SecurityAndSessionManager';
import { SecurityLogsTab } from './SecurityLogsTab';
import { SecurityPatternsDashboard } from './SecurityPatternsDashboard';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { uploadProfilePhotoToDrive } from '../services/googleDrive';
import { compressImageFile, fileToBase64 } from '../services/firebaseStorage';
import {
  PasswordStrengthIndicator,
  evaluatePassword,
  checkPasswordHistoryReuse,
  getSavedPasswordPolicy
} from './PasswordStrengthIndicator';
import { SecurityHealthBadge } from './SecurityHealthBadge';
import { PasswordPolicyTab } from './PasswordPolicyTab';
import { SuspiciousAlertsBanner } from './SuspiciousAlertsBanner';
import { RolePermissionsInspectorModal } from './RolePermissionsInspectorModal';
import { RecentlyDeletedTab } from './RecentlyDeletedTab';
import { DeleteAccountModal } from './DeleteAccountModal';
import { AccountAuditLogTab } from './AccountAuditLogTab';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  KeyRound,
  Trash2,
  Lock,
  Mail,
  Phone,
  Hash,
  School,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  BookOpen,
  Building2,
  ShieldAlert,
  Edit2,
  LogIn,
  FileCheck2,
  Check,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  Laptop,
  Smartphone,
  Send,
  RotateCcw,
  Sparkles,
  BarChart3,
  RefreshCw,
  AlertOctagon,
  Sliders,
  Camera,
  Loader2,
  CloudUpload,
  Zap,
  UserX,
  Image as ImageIcon
} from 'lucide-react';

export const AccountsManagement: React.FC = () => {
  const {
    currentUser,
    appUsers,
    addUser,
    updateUser,
    deleteUser,
    deletedUsers,
    restoreUser,
    permanentlyDeleteUser,
    emptyRecentlyDeleted,
    accountAuditLogs,
    clearAccountAuditLogs,
    students,
    teachers,
    showToast,
    impersonateUser,
    profileEditRequests,
    approveProfileEditRequest,
    rejectProfileEditRequest,
    isStudentRegisteredInAccounts,
    autoGenerateStudentAccounts,
    confirmAction
  } = useSchool();

  const [activeTab, setActiveTab] = useState<
    'teachers_staff' | 'students' | 'all_accounts' | 'recently_deleted' | 'audit_logs' | 'security_sessions' | 'security_logs' | 'password_policy' | 'edit_requests'
  >('teachers_staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [studentGradeFilter, setStudentGradeFilter] = useState<number | 'all'>('all');
  const [studentSectionFilter, setStudentSectionFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AppUser | null>(null);
  const [forgotPasswordUser, setForgotPasswordUser] = useState<AppUser | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [dismiss90DayNotice, setDismiss90DayNotice] = useState(false);
  const [showBulkForceConfirmModal, setShowBulkForceConfirmModal] = useState(false);
  const [showPatternsPanel, setShowPatternsPanel] = useState(true);

  // Role Inspector and Delete Confirmation State
  const [showRoleInspectorModal, setShowRoleInspectorModal] = useState(false);
  const [inspectedUserForRole, setInspectedUserForRole] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Mandatory Force Password Update for Current User
  const [mandatoryNewPassword, setMandatoryNewPassword] = useState('');
  const [mandatoryConfirmPassword, setMandatoryConfirmPassword] = useState('');

  // Edit user state
  const [editPasswordInput, setEditPasswordInput] = useState('');
  const [isUploadingAccountPhoto, setIsUploadingAccountPhoto] = useState(false);
  const accountPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleAccountPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserForEdit) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('ទំហំរូបថតត្រូវតែតូចជាង 10MB!', 'error');
      return;
    }

    setIsUploadingAccountPhoto(true);
    try {
      const compressedBlob = await compressImageFile(file, 800, 800, 0.88);
      try {
        const result = await uploadProfilePhotoToDrive(
          compressedBlob,
          `user_avatar_${selectedUserForEdit.id}_${Date.now()}.jpg`
        );
        if (result.directPhotoUrl) {
          setSelectedUserForEdit({ ...selectedUserForEdit, avatarUrl: result.directPhotoUrl });
          showToast('បានផ្ទុកឡើងរូបថតទៅកាន់ Google Drive ជោគជ័យ!', 'success');
        }
      } catch (driveErr: any) {
        const base64Url = await fileToBase64(compressedBlob);
        setSelectedUserForEdit({ ...selectedUserForEdit, avatarUrl: base64Url });
        showToast('បានរក្សាទុករូបថតជា Base64 ជោគជ័យ!', 'info');
      }
    } catch (err: any) {
      console.error('Error processing photo:', err);
      showToast('បរាជ័យក្នុងការបញ្ចូលរូបថត: ' + (err.message || 'សូមព្យាយាមម្តងទៀត'), 'error');
    } finally {
      setIsUploadingAccountPhoto(false);
      if (accountPhotoInputRef.current) accountPhotoInputRef.current.value = '';
    }
  };

  // 90-day Password Rotation Calculation
  const calculateDaysSincePasswordChange = (user: AppUser | null): number => {
    if (!user) return 0;
    const policy = getSavedPasswordPolicy();
    const maxDays = policy.expirationDays > 0 ? policy.expirationDays : 90;
    const dateStr = user.passwordUpdatedAt || user.createdAt;
    if (!dateStr) return maxDays + 6;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return user.passwordUpdatedAt ? Math.max(days, 0) : maxDays + 6;
  };

  // Missing student accounts calculation
  const missingStudentsList = React.useMemo(() => {
    return (students || []).filter(s => !isStudentRegisteredInAccounts(s));
  }, [students, isStudentRegisteredInAccounts, appUsers]);

  const staffUsersCount = appUsers.filter(u => u.role !== 'student').length;
  const studentUsersCount = appUsers.filter(u => u.role === 'student').length;

  const handleBatchCreateMissingStudentAccounts = () => {
    if (missingStudentsList.length === 0) {
      showToast('សិស្សទាំងអស់មានគណនីរួចរាល់ហើយ!', 'info');
      return;
    }

    confirmAction({
      title: 'បង្កើតគណនីសិស្សដែលខ្វះដោយស្វ័យប្រវត្តិ',
      description: `ប្រព័ន្ធនឹងបង្កើតគណនីសិស្សថ្មីចំនួន ${missingStudentsList.length} នាក់ ដោយកំណត់ឈ្មោះចូល និងពាក្យសម្ងាត់ស្វ័យប្រវត្តិតាមអត្តលេខសិស្ស។ តើអ្នកចង់បន្តដែរឬទេ?`,
      confirmLabel: 'យល់ព្រម បង្កើតគណនី',
      cancelLabel: 'បោះបង់',
      intent: 'primary',
      onConfirm: () => {
        const res = autoGenerateStudentAccounts(missingStudentsList.map(s => s.id));
        showToast(`បានបង្កើតគណនីសិស្សថ្មីចំនួន ${res.createdCount} ដោយជោគជ័យ!`, 'success');
      }
    });
  };

  const handleResetStudentPassword = (user: AppUser) => {
    const defaultPass = user.studentCode || '12345678';
    confirmAction({
      title: 'កំណត់ពាក្យសម្ងាត់សិស្សឡើងវិញ',
      description: `តើអ្នកពិតជាចង់កំណត់ពាក្យសម្ងាត់គណនីសិស្ស «${user.nameKhmer}» ទៅជាអត្តលេខសិស្ស (${defaultPass}) ឡើងវិញមែនទេ?`,
      confirmLabel: 'យល់ព្រម កំណត់ឡើងវិញ',
      cancelLabel: 'បោះបង់',
      intent: 'primary',
      onConfirm: () => {
        updateUser(user.id, {
          password: defaultPass,
          forcePasswordChange: false,
          passwordUpdatedAt: new Date().toISOString()
        });
        showToast(`បានកំណត់ពាក្យសម្ងាត់គណនីសិស្ស «${user.nameKhmer}» ទៅជា (${defaultPass}) ដោយជោគជ័យ!`, 'success');
      }
    });
  };

  const daysSincePasswordUpdate = calculateDaysSincePasswordChange(currentUser);
  const currentPolicy = getSavedPasswordPolicy();
  const maxPolicyDays = currentPolicy.expirationDays > 0 ? currentPolicy.expirationDays : 90;
  const isPasswordRotationNeeded =
    currentPolicy.expirationDays > 0 &&
    daysSincePasswordUpdate >= maxPolicyDays &&
    !dismiss90DayNotice;

  // Review logs handler for boosting Security Health score
  const handleReviewSecurityLogs = () => {
    if (currentUser) {
      updateUser(currentUser.id, {
        lastSecurityReviewDate: new Date().toISOString()
      });
      showToast('បានត្រួតពិនិត្យកំណត់ត្រាសន្តិសុខ! ពិន្ទុ Security Health របស់អ្នកកើនឡើង +30%', 'success');
    }
    setActiveTab('security_logs');
  };

  // Aggregated security logs for the security patterns dashboard
  const allSecurityLogs: SecurityLoginLog[] = React.useMemo(() => {
    const collected: SecurityLoginLog[] = [];
    (appUsers || []).forEach(u => {
      if (u && u.securityLogs && Array.isArray(u.securityLogs)) {
        collected.push(...u.securityLogs);
      }
    });
    if (collected.length > 0) return collected;
    if (currentUser?.securityLogs && currentUser.securityLogs.length > 0) return currentUser.securityLogs;

    return [
      {
        id: 'log-1',
        userId: currentUser?.id || 'usr-01',
        userEmail: currentUser?.email || 'admin@moeys.gov.kh',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'success',
        ipAddress: '103.216.50.21',
        device: 'Windows 11 PC (Office)',
        browser: 'Microsoft Edge 122',
        os: 'Windows 11 Pro',
        location: 'Phnom Penh, Cambodia',
        method: 'password'
      },
      {
        id: 'log-2',
        userId: 'usr-04',
        userEmail: 'vuthy.chan@moeys.edu.kh',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        status: 'success',
        ipAddress: '203.144.90.12',
        device: 'Apple iPhone 15 Pro',
        browser: 'Safari Mobile 17.2',
        os: 'iOS 17.4',
        location: 'Siem Reap, Cambodia',
        method: 'mfa_totp'
      },
      {
        id: 'log-3',
        userId: 'usr-01',
        userEmail: 'admin@moeys.gov.kh',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        status: 'failed',
        ipAddress: '185.220.101.5 (Proxy/Tor)',
        device: 'Linux / Chrome Headless',
        browser: 'Chrome 119',
        os: 'Linux x86_64',
        location: 'Frankfurt, Germany',
        method: 'password'
      },
      {
        id: 'log-4',
        userId: 'usr-02',
        userEmail: 'sreymom.sim@moeys.gov.kh',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        status: 'success',
        ipAddress: '118.69.180.44',
        device: 'Samsung Galaxy Tab S9',
        browser: 'Chrome Mobile 121',
        os: 'Android 14',
        location: 'Phnom Penh, Cambodia',
        method: 'password'
      }
    ];
  }, [appUsers, currentUser]);

  // Bulk force password rotation for all staff accounts
  const handleBulkForceStaffPasswordUpdate = () => {
    let affectedCount = 0;
    appUsers.forEach(u => {
      if (u.role !== 'student') {
        updateUser(u.id, { forcePasswordChange: true });
        affectedCount++;
      }
    });
    showToast(
      `បានកំណត់ឱ្យគណនីបុគ្គលិក និងលោកគ្រូ-អ្នកគ្រូចំនួន ${affectedCount} នាក់ ត្រូវតែផ្លាស់ប្តូរពាក្យសម្ងាត់ជាកំហិត (Mandatory Password Rotation) ពេលចូលប្រើបន្ទាប់!`,
      'success'
    );
    setShowBulkForceConfirmModal(false);
  };

  // Toggle individual force password change
  const handleToggleForcePasswordChange = (user: AppUser) => {
    const nextVal = !user.forcePasswordChange;
    updateUser(user.id, { forcePasswordChange: nextVal });
    showToast(
      nextVal
        ? `បានកំណត់តម្រូវឱ្យ «${user.nameKhmer}» ផ្លាស់ប្តូរពាក្យសម្ងាត់ជាកំហិតពេលចូលប្រើបន្ទាប់!`
        : `បានដកចេញការបង្ខំឱ្យប្តូរពាក្យសម្ងាត់សម្រាប់ «${user.nameKhmer}»!`,
      'info'
    );
  };

  // Handle mandatory password rotation submission for currently logged in user
  const handleMandatoryPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (mandatoryNewPassword !== mandatoryConfirmPassword) {
      showToast('ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ! សូមផ្ទៀងផ្ទាត់ឡើងវិញ', 'error');
      return;
    }

    const policy = getSavedPasswordPolicy();
    const strength = evaluatePassword(mandatoryNewPassword, policy);
    if (!strength.isValid) {
      showToast('ពាក្យសម្ងាត់ថ្មីមិនទាន់បំពេញតាមលក្ខខណ្ឌគោលការណ៍សុវត្ថិភាពនៅឡើយទេ!', 'error');
      return;
    }

    // Check Password History Reuse (Last 3 passwords)
    const historyCheck = checkPasswordHistoryReuse(
      mandatoryNewPassword,
      currentUser,
      policy.preventRecentPasswordsCount
    );
    if (!historyCheck.isAllowed) {
      showToast(historyCheck.message, 'error');
      return;
    }

    const currentHist = currentUser.passwordHistory || [];
    const oldPassword = currentUser.password;
    const updatedHist = [oldPassword, ...currentHist]
      .filter((p, i, a): p is string => Boolean(p) && a.indexOf(p) === i)
      .slice(0, policy.preventRecentPasswordsCount || 3);

    updateUser(currentUser.id, {
      password: mandatoryNewPassword,
      passwordHistory: updatedHist,
      passwordUpdatedAt: new Date().toISOString(),
      forcePasswordChange: false
    });

    showToast('បានធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់សុវត្ថិភាពថ្មីដោយជោគជ័យ! អ្នកអាចបន្តការងារបានដោយសុវត្ថិភាព', 'success');
    setMandatoryNewPassword('');
    setMandatoryConfirmPassword('');
  };

  // New Account Form State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNameKhmer, setNewNameKhmer] = useState('');
  const [newNameLatin, setNewNameLatin] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(
    currentUser?.role === 'teacher' ? 'student' : 'secretary'
  );
  const [newPhone, setNewPhone] = useState('');
  const [newStaffCode, setNewStaffCode] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newAssignedGrade, setNewAssignedGrade] = useState<number>(
    currentUser?.role === 'teacher' ? currentUser.assignedGrade || 1 : 1
  );
  const [newAssignedSection, setNewAssignedSection] = useState<string>(
    currentUser?.role === 'teacher' ? currentUser.assignedSection || 'ក' : 'ក'
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'director':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Building2 className="w-3 h-3" />
            នាយកសាលា
          </span>
        );
      case 'secretary':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Shield className="w-3 h-3" />
            លេខាធិការ
          </span>
        );
      case 'librarian':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <BookOpen className="w-3 h-3" />
            បណ្ណារក្ស
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <User className="w-3 h-3" />
            គ្រូបង្រៀន
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <GraduationCap className="w-3 h-3" />
            សិស្ស
          </span>
        );
      default:
        return <span>{role}</span>;
    }
  };

  // Filter allowed roles for creation based on hierarchical RBAC
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isDirector = currentUser?.role === 'director' || isSuperAdmin;
  const isSecretary = currentUser?.role === 'secretary';
  const isLibrarian = currentUser?.role === 'librarian';
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  const pendingRequestsCount = profileEditRequests.filter(r => r.status === 'pending').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameKhmer || !newEmail || !newPassword) {
      showToast('សូមបំពេញព័ត៌មានចាំបាច់ឲ្យបានគ្រប់គ្រាន់', 'error');
      return;
    }

    // Role creation validation (Strict MoEYS Rule: Only Director can create accounts)
    if (!isDirector) {
      showToast('មានតែនាយកសាលាទេ ទើបមានសិទ្ធិបង្កើតគណនីគ្រូ បុគ្គលិក ឬសិស្សក្នុងប្រព័ន្ធ!', 'error');
      return;
    }

    const strength = evaluatePassword(newPassword);
    if (!strength.isValid) {
      showToast('សូមកំណត់ពាក្យសម្ងាត់ឱ្យបានរឹងមាំតាមលក្ខខណ្ឌសុវត្ថិភាព (យ៉ាងតិច ៨ តួ, អក្សរធំ-តូច, លេខ, និងនិមិត្តសញ្ញា)!', 'error');
      return;
    }

    const payload: Omit<AppUser, 'id' | 'createdAt'> = {
      username: newUsername || newEmail.split('@')[0],
      email: newEmail,
      password: newPassword,
      nameKhmer: newNameKhmer,
      nameLatin: newNameLatin,
      role: newRole,
      phone: newPhone,
      staffCode: newStaffCode,
      studentCode: newRole === 'student' ? newStudentCode : undefined,
      assignedGrade: (newRole === 'teacher' || newRole === 'student') ? newAssignedGrade : undefined,
      assignedSection: (newRole === 'teacher' || newRole === 'student') ? newAssignedSection : undefined,
      status: 'active',
      passwordUpdatedAt: new Date().toISOString()
    };

    const res = addUser(payload);
    if (res.success) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewNameKhmer('');
    setNewNameLatin('');
    setNewPhone('');
    setNewStaffCode('');
    setNewStudentCode('');
  };

  // Filter users based on activeTab, role, grade, section, and search query
  const filteredUsers = appUsers.filter(u => {
    const nameKh = u.nameKhmer || '';
    const email = u.email || '';
    const code = u.studentCode || u.staffCode || '';
    const phone = u.phone || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      nameKh.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      code.toLowerCase().includes(query) ||
      phone.includes(searchQuery);

    // Tab category check:
    if (activeTab === 'teachers_staff') {
      // Must be a teacher or staff member (director, teacher, secretary, librarian)
      if (u.role === 'student') return false;
      // "គ្រូមិនចាំបាច់បែងថេបផ្សេងគ្នាទេ": No separate sub-tabs needed for teachers, all teachers/staff appear together
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      return matchesSearch;
    }

    if (activeTab === 'students') {
      // Must be a student
      if (u.role !== 'student') return false;

      // Grade filter
      if (studentGradeFilter !== 'all' && u.assignedGrade !== studentGradeFilter) {
        return false;
      }
      // Section filter
      if (studentSectionFilter !== 'all' && u.assignedSection !== studentSectionFilter) {
        return false;
      }

      // If teacher, they only manage students in their grade
      if (isTeacher && u.assignedGrade !== currentUser?.assignedGrade) {
        return false;
      }

      return matchesSearch;
    }

    if (activeTab === 'all_accounts') {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      if (isTeacher && roleFilter === 'student') {
        return matchesSearch && matchesRole && u.assignedGrade === currentUser?.assignedGrade;
      }
      return matchesSearch && matchesRole;
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-kantumruy">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-moul text-base sm:text-lg text-slate-800">
                គ្រប់គ្រងគណនី & សិទ្ធិប្រើប្រាស់ (RBAC Center)
              </h2>
              <p className="text-xs text-slate-500">
                ការបែងចែកថេបគណនីគ្រូ/បុគ្គលិក និងគណនីសិស្សដាច់ដោយឡែកពីគ្នា ព្រមទាំងគ្រប់គ្រងសិទ្ធិប្រើប្រាស់
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Category Tabs */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl flex-wrap gap-1 border border-slate-200 shadow-xs">
            <button
              onClick={() => {
                setActiveTab('teachers_staff');
                setRoleFilter('all');
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'teachers_staff'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <User className="w-4 h-4" />
              <span>គណនីគ្រូ & បុគ្គលិក</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'teachers_staff' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {staffUsersCount}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('students');
                setRoleFilter('student');
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>គណនីសិស្សានុសិស្ស</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'students' ? 'bg-white text-purple-800' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {studentUsersCount}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('all_accounts');
                setRoleFilter('all');
              }}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all_accounts'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ទាំងអស់ ({appUsers.length})</span>
            </button>

            {/* Secondary Audit & Security Tabs */}
            <div className="h-5 w-px bg-slate-300 mx-1 hidden sm:block"></div>

            <button
              onClick={() => setActiveTab('recently_deleted')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'recently_deleted' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="ធុងសំរាម ៣០ ថ្ងៃ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ធុងសំរាម</span>
              {deletedUsers.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'recently_deleted' ? 'bg-white text-rose-700' : 'bg-rose-500 text-white'
                }`}>
                  {deletedUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit_logs')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'audit_logs' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="សវនកម្ម (Audit)"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>សវនកម្ម</span>
              {accountAuditLogs.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'audit_logs' ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {accountAuditLogs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('security_sessions')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'security_sessions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="សម័យកាល & MFA (2FA)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MFA</span>
            </button>

            <button
              onClick={() => setActiveTab('security_logs')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'security_logs' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Security Logs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('password_policy')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'password_policy' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="គោលការណ៍"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>គោលការណ៍</span>
            </button>

            <button
              onClick={() => setActiveTab('edit_requests')}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'edit_requests' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="សំណើកែប្រែ"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>សំណើកែប្រែ</span>
              {pendingRequestsCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setInspectedUserForRole(null);
              setShowRoleInspectorModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="ពិនិត្យលម្អិតសិទ្ធិប្រើប្រាស់ និងមុខងារតាមតួនាទី"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ពិនិត្យសិទ្ធិតួនាទី</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setForgotPasswordUser(currentUser);
              setShowForgotPasswordModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>Forgot Password?</span>
          </button>

          {isDirector && (
            <button
              type="button"
              onClick={() => setShowBulkForceConfirmModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              title="កំណត់ឱ្យគណនីបុគ្គលិកទាំងអស់ត្រូវតែផ្លាស់ប្តូរពាក្យសម្ងាត់ពេលចូលប្រើបន្ទាប់"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>បង្ខំប្តូរពាក្យសម្ងាត់</span>
            </button>
          )}

          {/* Create User Button */}
          {(isDirector || isSecretary || isTeacher) && (
            <button
              type="button"
              onClick={() => {
                resetForm();
                if (activeTab === 'students') {
                  setNewRole('student');
                } else if (activeTab === 'teachers_staff') {
                  setNewRole('teacher');
                }
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {activeTab === 'students'
                  ? '+ បង្កើតគណនីសិស្ស'
                  : activeTab === 'teachers_staff'
                  ? '+ បង្កើតគណនីគ្រូ/បុគ្គលិក'
                  : '+ បង្កើតគណនីថ្មី'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Suspicious Login Activity Automated Alert Banner */}
      <SuspiciousAlertsBanner
        appUsers={appUsers}
        currentUser={currentUser}
        onSuspendUser={userId => updateUser(userId, { status: 'suspended' })}
        onForcePasswordRotation={userId => updateUser(userId, { forcePasswordChange: true })}
        onViewLogs={() => setActiveTab('security_logs')}
        onShowToast={showToast}
      />

      {/* User Profile & Security Health Score Dashboard Card */}
      <SecurityHealthBadge
        user={currentUser}
        variant="card"
        onOpenMfa={() => setActiveTab('security_sessions')}
        onToggleMfa={(enabled) => {
          if (!currentUser) return;
          updateUser(currentUser.id, {
            mfaConfig: {
              enabled,
              type: 'totp',
              backupCodesCount: enabled ? 8 : undefined,
              enrolledAt: enabled ? new Date().toISOString() : undefined,
              lastVerifiedAt: enabled ? new Date().toISOString() : undefined
            }
          });
          showToast(
            enabled
              ? 'បានបើកដំណើរការ MFA / 2FA លើទិន្នន័យគណនី Firebase ដោយជោគជ័យ!'
              : 'បានបិទដំណើរការ MFA / 2FA លើគណនី Firebase!',
            enabled ? 'success' : 'info'
          );
        }}
        onChangePassword={() => {
          if (currentUser) {
            setSelectedUserForEdit(currentUser);
            setEditPasswordInput('');
          }
        }}
        onReviewSecurityLogs={handleReviewSecurityLogs}
      />

      {/* 90-Day Password Rotation Warning Alert */}
      {isPasswordRotationNeeded && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-moul text-xs sm:text-sm text-amber-950 font-bold">
                  ការដាស់តឿនសុវត្ថិភាព៖ ដល់ពេលផ្លាស់ប្តូរពាក្យសម្ងាត់ហើយ (Password Rotation Required)
                </span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-mono font-bold text-[10px] border border-rose-200">
                  {daysSincePasswordUpdate} ថ្ងៃមិនទាន់ផ្លាស់ប្តូរ
                </span>
              </div>
              <p className="text-slate-700 text-[11.5px] mt-1 leading-relaxed">
                ពាក្យសម្ងាត់គណនីរបស់អ្នកមិនទាន់ត្រូវបានផ្លាស់ប្តូរក្នុងរយៈពេលជាង <strong>៩០ ថ្ងៃ</strong> មកហើយ។ យោងតាមគោលការណ៍សុវត្ថិភាពសាលា សូមផ្លាស់ប្តូរពាក្យសម្ងាត់ជាទៀងទាត់ (Credential Rotation) ដើម្បីធានាសុវត្ថិភាព និងការពារការជ្រៀតចូល។
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  setSelectedUserForEdit(currentUser);
                  setEditPasswordInput('');
                }
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់ឥឡូវនេះ</span>
            </button>
            <button
              type="button"
              onClick={() => setDismiss90DayNotice(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-amber-100/50 rounded-xl transition-all cursor-pointer"
              title="បិទការជូនដំណឹង"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {(activeTab === 'teachers_staff' || activeTab === 'students' || activeTab === 'all_accounts') && (
        <>
          {/* TAB 1: TEACHER & STAFF ACCOUNTS VIEW */}
          {activeTab === 'teachers_staff' && (
            <div className="space-y-4">
              {/* Teacher & Staff Info Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-emerald-900 text-sm">
                    👨‍🏫 បញ្ជីគណនីលោកគ្រូ-អ្នកគ្រូ & បុគ្គលិកសិក្សាទូទាំងសាលា (Teachers & Staff Center)
                  </p>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    គណនីលោកគ្រូ-អ្នកគ្រូគ្រប់កម្រិតថ្នាក់ (មត្តេយ្យ បឋម បន្ទុកថ្នាក់ និងបង្រៀនមុខវិជ្ជា) ព្រមទាំងនាយកសាលា លេខាធិការ និងបណ្ណារក្ស ត្រូវបានដាក់បញ្ចូលគ្នាក្នុងផ្ទាំងនេះយ៉ាងងាយស្រួល <strong>ដោយមិនបាច់បែងចែកថេបរញ៉េរញ៉ៃឡើយ</strong>។
                  </p>
                </div>
              </div>

              {/* Teacher & Staff Stat Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-bold">គ្រូ & បុគ្គលិកសរុប</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{staffUsersCount} នាក់</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-emerald-600 font-bold">លោកគ្រូ-អ្នកគ្រូ</p>
                  <p className="text-xl font-bold text-emerald-800 mt-1">
                    {appUsers.filter(u => u.role === 'teacher').length} នាក់
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-blue-600 font-bold">នាយក & លេខាធិការ</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">
                    {appUsers.filter(u => u.role === 'director' || u.role === 'secretary').length} នាក់
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-amber-600 font-bold">បណ្ណារក្សសាលា</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">
                    {appUsers.filter(u => u.role === 'librarian').length} នាក់
                  </p>
                </div>
              </div>

              {/* Filter & Search Bar for Teachers/Staff */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកគ្រូតាមឈ្មោះ អ៊ីមែល អត្តលេខមន្ត្រី ឬលេខទូរស័ព្ទ..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'បុគ្គលិកទាំងអស់' },
                    { id: 'teacher', label: 'គ្រូបង្រៀន' },
                    { id: 'director', label: 'នាយកសាលា' },
                    { id: 'secretary', label: 'លេខាធិការ' },
                    { id: 'librarian', label: 'បណ្ណារក្ស' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRoleFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        roleFilter === tab.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT ACCOUNTS VIEW */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Student Accounts Info Banner */}
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 rounded-2xl p-4 text-xs text-purple-950 flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-purple-900 text-sm">
                        🎒 ផ្ទាំងគ្រប់គ្រងគណនីសិស្សានុសិស្ស (Student Accounts Hub)
                      </p>
                      <p className="text-slate-700 text-xs mt-0.5">
                        គ្រប់គ្រងគណនីចូលប្រើប្រាស់របស់សិស្សានុសិស្សទូទាំងសាលា តាមកម្រិតថ្នាក់ និងបន្ទប់សិក្សា
                      </p>
                    </div>
                    {missingStudentsList.length > 0 && (
                      <button
                        type="button"
                        onClick={handleBatchCreateMissingStudentAccounts}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>បង្កើតគណនីសិស្សដែលខ្វះ ({missingStudentsList.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Missing Student Accounts Alert Banner (if any) */}
              {missingStudentsList.length > 0 && (
                <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-amber-900">
                        រកឃើញសិស្សចំនួន {missingStudentsList.length} នាក់ ក្នុងបញ្ជីសាលាមិនទាន់មានគណនីចូលប្រើ!
                      </p>
                      <p className="text-amber-700 text-[11px]">
                        អ្នកអាចចុចបង្កើតគណនីស្វ័យប្រវត្តិដោយកំណត់ពាក្យសម្ងាត់ស្មើនឹងអត្តលេខសិស្ស។
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleBatchCreateMissingStudentAccounts}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>បង្កើតឥឡូវនេះ</span>
                  </button>
                </div>
              )}

              {/* Student Stat Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-purple-600 font-bold">គណនីសិស្សសរុប</p>
                  <p className="text-xl font-bold text-purple-700 mt-1">{studentUsersCount} នាក់</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-bold">សិស្សក្នុងបញ្ជីឈ្មោះ</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{students.length} នាក់</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-amber-600 font-bold">សិស្សខ្វះគណនី</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">{missingStudentsList.length} នាក់</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-emerald-600 font-bold">គណនីសកម្ម</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">
                    {appUsers.filter(u => u.role === 'student' && u.status === 'active').length} នាក់
                  </p>
                </div>
              </div>

              {/* Student Filter by Grade and Search */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកសិស្សតាមឈ្មោះ អត្តលេខ ឬលេខទូរស័ព្ទ..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all"
                  />
                </div>

                {/* Grade Quick Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  <button
                    type="button"
                    onClick={() => setStudentGradeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      studentGradeFilter === 'all'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ថ្នាក់ទាំងអស់
                  </button>
                  {[1, 2, 3, 4, 5, 6].map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setStudentGradeFilter(grade)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        studentGradeFilter === grade
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ថ្នាក់ទី {grade}
                    </button>
                  ))}

                  {/* Section Select */}
                  <select
                    value={studentSectionFilter}
                    onChange={e => setStudentSectionFilter(e.target.value)}
                    className="px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-purple-600 focus:outline-none ml-1"
                  >
                    <option value="all">បន្ទប់ទាំងអស់</option>
                    <option value="ក">បន្ទប់ ក</option>
                    <option value="ខ">បន្ទប់ ខ</option>
                    <option value="គ">បន្ទប់ គ</option>
                    <option value="ឃ">បន្ទប់ ឃ</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALL ACCOUNTS VIEW */}
          {activeTab === 'all_accounts' && (
            <div className="space-y-4">
              {/* Security Patterns Dashboard Collapsible Widget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPatternsPanel(!showPatternsPanel)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-700 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{showPatternsPanel ? 'លាក់ផ្ទាំងវិភាគសុវត្ថិភាព (Hide Security Analytics)' : 'បង្ហាញផ្ទាំងវិភាគសុវត្ថិភាព (Show Security Patterns & Login Analytics)'}</span>
                  </button>
                </div>

                {showPatternsPanel && (
                  <SecurityPatternsDashboard
                    logs={allSecurityLogs}
                    users={appUsers}
                    onFilterByStatus={() => {
                      setActiveTab('security_logs');
                    }}
                    onFilterByMethod={() => {
                      setActiveTab('security_logs');
                    }}
                  />
                )}
              </div>

              {/* Role Hierarchy Notification Rule Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">គោលការណ៍បង្កើតគណនីតាមឋានានុក្រម MoEYS (RBAC Policy)៖</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11.5px]">
                    <li><strong>នាយកសាលា (Director)៖</strong> មានសិទ្ធិផ្តាច់មុខក្នុងការបង្កើត និងគ្រប់គ្រងគណនីគ្រូ/បុគ្គលិកគ្រប់តួនាទី។</li>
                    <li><strong>លេខាធិការ (Secretary)៖</strong> អាចបង្កើតបានតែគណនីបណ្ណារក្ស ឬសិស្ស (មិនមានសិទ្ធិបង្កើតគណនីគ្រូបង្រៀនឡើយ)។</li>
                    <li><strong>គ្រូបន្ទុកថ្នាក់ (Homeroom Teacher)៖</strong> មានសិទ្ធិបង្កើត និងគ្រប់គ្រងគណនីសម្រាប់តែ <strong>សិស្សក្នុងបន្ទុកថ្នាក់របស់ខ្លួន</strong> ប៉ុណ្ណោះ។</li>
                  </ul>
                </div>
              </div>

              {/* Stat Cards for All Accounts */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-bold">គណនីសរុប</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{appUsers.length}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-blue-600 font-bold">នាយក & រដ្ឋបាល</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">
                    {appUsers.filter(u => u.role === 'director' || u.role === 'secretary').length}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-amber-600 font-bold">បណ្ណារក្ស</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">
                    {appUsers.filter(u => u.role === 'librarian').length}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-emerald-600 font-bold">គ្រូបង្រៀន</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">
                    {appUsers.filter(u => u.role === 'teacher').length}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <p className="text-[11px] text-purple-600 font-bold">សិស្សានុសិស្ស</p>
                  <p className="text-xl font-bold text-purple-700 mt-1">
                    {appUsers.filter(u => u.role === 'student').length}
                  </p>
                </div>
              </div>

              {/* Filter and Search Bar for All Accounts */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល ឬអត្តលេខ..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'ទាំងអស់' },
                    { id: 'director', label: 'នាយក' },
                    { id: 'secretary', label: 'លេខា' },
                    { id: 'librarian', label: 'បណ្ណារក្ស' },
                    { id: 'teacher', label: 'គ្រូបង្រៀន' },
                    { id: 'student', label: 'សិស្ស' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRoleFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        roleFilter === tab.id
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Unified Users Table for the selected view */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">#</th>
                    <th className="px-4 py-3">ឈ្មោះ & តួនាទី</th>
                    <th className="px-4 py-3">អ៊ីមែល / ឈ្មោះចូល</th>
                    <th className="px-4 py-3">
                      {activeTab === 'students' ? 'អត្តលេខ / ថ្នាក់' : 'អត្តលេខ / មុខតំណែង'}
                    </th>
                    <th className="px-4 py-3">លេខទូរស័ព្ទ</th>
                    <th className="px-4 py-3">ស្ថានភាព & សន្តិសុខ</th>
                    <th className="px-4 py-3 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        <UserX className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-500">រកមិនឃើញគណនីដែលត្រូវនឹងការស្វែងរកឡើយ</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">សូមព្យាយាមស្វែងរកពាក្យគន្លឹះផ្សេង ឬប្តូរតម្រង</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-center font-semibold text-slate-500">{idx + 1}</td>
                        
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {user.nameKhmer ? user.nameKhmer.charAt(0) : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{user.nameKhmer}</p>
                              {user.nameLatin && <p className="text-[10px] text-slate-400">{user.nameLatin}</p>}
                              <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{user.email}</p>
                          <p className="text-[11px] text-slate-400">User: {user.username}</p>
                        </td>

                        <td className="px-4 py-3">
                          {user.studentCode ? (
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              {user.studentCode} (ថ្នាក់ទី {user.assignedGrade}{user.assignedSection})
                            </span>
                          ) : user.staffCode ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {user.staffCode}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {user.phone || '-'}
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {user.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> សកម្ម
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-red-200">
                                  <AlertTriangle className="w-3 h-3" /> ផ្អាក
                                </span>
                              )}

                              <SecurityHealthBadge user={user} variant="compact" />
                            </div>

                            {user.forcePasswordChange && (
                              <span className="block text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                                🔄 ត្រូវប្តូរពាក្យសម្ងាត់
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Student Quick Password Reset Button */}
                            {user.role === 'student' && (isDirector || isTeacher || isSecretary) && (
                              <button
                                type="button"
                                onClick={() => handleResetStudentPassword(user)}
                                title={`កំណត់ពាក្យសម្ងាត់ឡើងវិញទៅជាអត្តលេខសិស្ស (${user.studentCode || '12345678'})`}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-bold border border-purple-200 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                                <span>Reset កូដ</span>
                              </button>
                            )}

                            {/* Director Impersonation Master Access */}
                            {isDirector && user.id !== currentUser?.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`តើអ្នកពិតជាចង់ចូលប្រើជាគណនី «${user.nameKhmer}» (${user.role}) ឬទេ?`)) {
                                    impersonateUser(user);
                                  }
                                }}
                                title="ចូលប្រើជាគណនីនេះ (Director Master Login)"
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <LogIn className="w-3.5 h-3.5 text-amber-600" />
                                <span>ចូលប្រើ</span>
                              </button>
                            )}

                            {/* Director Force Password Toggle Button */}
                            {isDirector && (
                              <button
                                type="button"
                                onClick={() => handleToggleForcePasswordChange(user)}
                                title={
                                  user.forcePasswordChange
                                    ? 'ដកចេញការតម្រូវឱ្យផ្លាស់ប្តូរពាក្យសម្ងាត់'
                                    : 'កំណត់ឱ្យគណនីនេះផ្លាស់ប្តូរពាក្យសម្ងាត់ជាកំហិត (Force Password Rotation)'
                                }
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  user.forcePasswordChange
                                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit permissions check */}
                            {((isDirector) ||
                              (isSecretary && user.role !== 'director') ||
                              (isLibrarian && user.id === currentUser?.id)) && (
                              <button
                                type="button"
                                onClick={() => setSelectedUserForEdit(user)}
                                title="កែប្រែ / ប្តូរពាក្យសម្ងាត់"
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setInspectedUserForRole(user);
                                setShowRoleInspectorModal(true);
                              }}
                              title="ពិនិត្យសិទ្ធិ និងមុខងារលម្អិតរបស់គណនីនេះ"
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setForgotPasswordUser(user);
                                setShowForgotPasswordModal(true);
                              }}
                              title="ផ្ញើ Password Reset Email តាម Firebase Auth"
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                            </button>

                            {/* Delete permission: ONLY DIRECTOR can delete accounts (with mandatory reason modal) */}
                            {isDirector && user.id !== currentUser?.id && (
                              <button
                                type="button"
                                onClick={() => setUserToDelete(user)}
                                title="លុបគណនី (មានតែនាយកសាលាប៉ុណ្ណោះ)"
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'recently_deleted' && (
        <RecentlyDeletedTab
          deletedUsers={deletedUsers}
          onRestore={(deletedId) => restoreUser(deletedId)}
          onPermanentDelete={(deletedId) => permanentlyDeleteUser(deletedId)}
          onEmptyTrash={() => emptyRecentlyDeleted()}
          isDirector={isDirector}
        />
      )}

      {activeTab === 'audit_logs' && (
        <AccountAuditLogTab
          logs={accountAuditLogs}
          onClearLogs={() => clearAccountAuditLogs()}
          isDirector={isDirector}
        />
      )}

      {activeTab === 'security_sessions' && (
        <SecurityAndSessionManager
          currentUser={currentUser}
          onUpdateUser={updateUser}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'security_logs' && (
        <SecurityLogsTab
          currentUser={currentUser}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'password_policy' && (
        <PasswordPolicyTab
          currentUser={currentUser}
          onUpdateAllStaffForceRotation={() => setShowBulkForceConfirmModal(true)}
          onShowToast={showToast}
          onChangePassword={() => {
            if (currentUser) {
              setSelectedUserForEdit(currentUser);
              setEditPasswordInput('');
            }
          }}
        />
      )}

      {activeTab === 'edit_requests' && (
        /* Edit Requests Approval Center */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 font-moul">
                សំណើសុំកែប្រែទិន្នន័យប្រវត្តិរូប (Approval Queue)
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              *នាយកសាលាមានសិទ្ធិពិនិត្យ ផ្ទៀងផ្ទាត់ និងអនុម័ត
            </span>
          </div>

          {profileEditRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-50" />
              <p>មិនមានសំណើសុំកែប្រែទិន្នន័យនៅឡើយទេ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profileEditRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border transition-all ${
                    req.status === 'pending'
                      ? 'bg-amber-50/40 border-amber-200'
                      : req.status === 'approved'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {req.requestedByName ? req.requestedByName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{req.requestedByName}</span>
                          <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {req.targetType === 'student' ? 'សិស្ស' : 'គ្រូ/បុគ្គលិក'}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {req.status === 'pending' ? 'រង់ចាំអនុម័ត' : req.status === 'approved' ? 'បានអនុម័ត' : 'បានបដិសេធ'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          កាលបរិច្ឆេទស្នើសុំ៖ {new Date(req.createdAt).toLocaleString('km-KH')}
                        </p>
                      </div>
                    </div>

                    {req.status === 'pending' && (isDirector || currentUser?.role === 'secretary') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveProfileEditRequest(req.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>អនុម័ត</span>
                        </button>
                        <button
                          onClick={() => rejectProfileEditRequest(req.id)}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>បដិសេធ</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs">
                    <p className="text-slate-600 font-bold mb-1">មូលហេតុស្នើសុំ៖ <span className="font-normal text-slate-800">{req.reason}</span></p>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                      <p className="text-[11px] text-slate-500 font-bold uppercase mb-1">ទិន្នន័យដែលស្នើសុំកែប្រែ (Proposed Payload):</p>
                      <pre className="text-[11px] font-mono text-slate-700 bg-slate-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(req.proposedData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm text-slate-800">
                    {isTeacher ? 'បង្កើតគណនីសិស្សថ្មី' : 'បង្កើតគណនីអ្នកប្រើប្រាស់ថ្មី'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Hierarchical Account Creation Form</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">តួនាទី (Role)</label>
                {isTeacher ? (
                  <input
                    type="text"
                    disabled
                    value="សិស្ស (Student)"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-bold"
                  />
                ) : isSecretary ? (
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="librarian">បណ្ណារក្ស (Librarian)</option>
                    <option value="student">សិស្ស (Student)</option>
                  </select>
                ) : (
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="teacher">គ្រូបង្រៀន (Teacher) • សិទ្ធិផ្តាច់មុខនាយក</option>
                    <option value="secretary">លេខាធិការ (Secretary)</option>
                    <option value="librarian">បណ្ណារក្ស (Librarian)</option>
                    <option value="student">សិស្ស (Student)</option>
                    <option value="director">នាយកសាលា (Director)</option>
                  </select>
                )}
              </div>

              {isDirector && newRole === 'teacher' && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>លោកនាយកកំពុងបង្កើតគណនីគ្រូបង្រៀនថ្មី (ប្រព័ន្ធនឹងភ្ជាប់ទិន្នន័យទៅបញ្ជីគ្រូដោយស្វ័យប្រវត្តិ)</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  គោត្តនាម និងនាម (ឈ្មោះជាភាសាខ្មែរ) *
                </label>
                <input
                  type="text"
                  value={newNameKhmer}
                  onChange={e => setNewNameKhmer(e.target.value)}
                  placeholder="ឧ. លោក សុខ សាន ឬ សិស្ស ចាន់ បុប្ផា"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">អ៊ីមែល (Email) *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="user@moeys.gov.kh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ពាក្យសម្ងាត់ (Password) *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ (ឧ. Admin@2025#)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password Strength Validator for New Account */}
              {newPassword && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <PasswordStrengthIndicator password={newPassword} />
                </div>
              )}

              {newRole === 'student' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">អត្តលេខសិស្ស</label>
                    <input
                      type="text"
                      value={newStudentCode}
                      onChange={e => setNewStudentCode(e.target.value)}
                      placeholder="STU-2024-..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
                    <select
                      value={newAssignedGrade}
                      disabled={isTeacher}
                      onChange={e => setNewAssignedGrade(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      {[1, 2, 3, 4, 5, 6].map(g => (
                        <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">បន្ទប់/កន្ទុយ</label>
                    <select
                      value={newAssignedSection}
                      disabled={isTeacher}
                      onChange={e => setNewAssignedSection(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="ក">ក</option>
                      <option value="ខ">ខ</option>
                      <option value="គ">គ</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      លេខទូរស័ព្ទ <span className="text-slate-400 font-normal">(ស្រេចចិត្ត / អាចភ្ជាប់តាម Gmail)</span>
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="012 345 678 (ឬទុកទំនេរប្រសិនបើគ្មាន)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">អត្តលេខមន្ត្រី</label>
                    <input
                      type="text"
                      value={newStaffCode}
                      onChange={e => setNewStaffCode(e.target.value)}
                      placeholder="MOEYS-10..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm"
                >
                  បង្កើតគណនី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User / Change Password */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm text-slate-800">កែប្រែគណនី & ពាក្យសម្ងាត់</h3>
                  <p className="text-[11px] text-slate-500">{selectedUserForEdit.nameKhmer} ({selectedUserForEdit.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUserForEdit(null);
                  setEditPasswordInput('');
                }}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                
                const policy = getSavedPasswordPolicy();

                // If a new password is typed, check password strength & history requirements
                if (editPasswordInput.trim()) {
                  const strength = evaluatePassword(editPasswordInput, policy);
                  if (!strength.isValid) {
                    showToast('ពាក្យសម្ងាត់ថ្មីមិនទាន់បំពេញតាមលក្ខខណ្ឌគោលការណ៍សុវត្ថិភាពនៅឡើយទេ!', 'error');
                    return;
                  }

                  const historyCheck = checkPasswordHistoryReuse(
                    editPasswordInput,
                    selectedUserForEdit,
                    policy.preventRecentPasswordsCount
                  );
                  if (!historyCheck.isAllowed) {
                    showToast(historyCheck.message, 'error');
                    return;
                  }
                }

                const updatedData: Partial<AppUser> = {
                  nameKhmer: selectedUserForEdit.nameKhmer,
                  nameLatin: selectedUserForEdit.nameLatin,
                  email: selectedUserForEdit.email,
                  phone: selectedUserForEdit.phone,
                  role: selectedUserForEdit.role,
                  status: selectedUserForEdit.status,
                  staffCode: selectedUserForEdit.staffCode,
                  studentCode: selectedUserForEdit.studentCode,
                  assignedGrade: selectedUserForEdit.assignedGrade,
                  assignedSection: selectedUserForEdit.assignedSection,
                  avatarUrl: selectedUserForEdit.avatarUrl
                };

                if (editPasswordInput.trim()) {
                  const currentHist = selectedUserForEdit.passwordHistory || [];
                  const oldPassword = selectedUserForEdit.password;
                  const updatedHist = [oldPassword, ...currentHist]
                    .filter((p, i, a): p is string => Boolean(p) && a.indexOf(p) === i)
                    .slice(0, policy.preventRecentPasswordsCount || 3);

                  updatedData.password = editPasswordInput;
                  updatedData.passwordHistory = updatedHist;
                  updatedData.passwordUpdatedAt = new Date().toISOString();
                  updatedData.forcePasswordChange = false;
                }

                updateUser(selectedUserForEdit.id, updatedData);
                showToast(
                  editPasswordInput.trim()
                    ? 'បានធ្វើបច្ចុប្បន្នភាពគណនី និងផ្លាស់ប្តូរពាក្យសម្ងាត់ថ្មីដោយជោគជ័យ!'
                    : 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនីដោយជោគជ័យ!',
                  'success'
                );
                setSelectedUserForEdit(null);
                setEditPasswordInput('');
              }}
              className="space-y-3.5"
            >
              {/* Photo Upload & Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>រូបថតប្រវត្តិរូប (Profile Photo)</span>
                  </label>
                  {selectedUserForEdit.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedUserForEdit({ ...selectedUserForEdit, avatarUrl: '' })}
                      className="text-[11px] text-red-600 hover:text-red-800"
                    >
                      លុបរូបថតចេញ
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedUserForEdit.avatarUrl ? (
                      <img
                        src={selectedUserForEdit.avatarUrl}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-blue-700 text-lg">
                        {selectedUserForEdit.nameKhmer.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={accountPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAccountPhotoChange}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isUploadingAccountPhoto}
                        onClick={() => accountPhotoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingAccountPhoto ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>កំពុងផ្ទុក...</span>
                          </>
                        ) : (
                          <>
                            <CloudUpload className="w-3 h-3" />
                            <span>ប្តូររូបថត</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={selectedUserForEdit.avatarUrl || ''}
                      onChange={e => setSelectedUserForEdit({ ...selectedUserForEdit, avatarUrl: e.target.value })}
                      placeholder="ឬបិទភ្ជាប់ URL រូបភាព..."
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះខ្មែរ</label>
                  <input
                    type="text"
                    value={selectedUserForEdit.nameKhmer}
                    onChange={e =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, nameKhmer: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះឡាតាំង</label>
                  <input
                    type="text"
                    value={selectedUserForEdit.nameLatin || ''}
                    onChange={e =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, nameLatin: e.target.value })
                    }
                    placeholder="Latin Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-sans focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-700" />
                      <span>តួនាទីក្នុងប្រព័ន្ធ (User Role & Permissions)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 font-bold text-blue-800 uppercase">
                      {selectedUserForEdit.role}
                    </span>
                  </label>
                  <select
                    value={selectedUserForEdit.role}
                    disabled={
                      // Disallow non-directors from modifying directors or super admins
                      (!isDirector && !isSuperAdmin && (selectedUserForEdit.role === 'director' || selectedUserForEdit.role === 'super_admin'))
                    }
                    onChange={e => {
                      const newR = e.target.value as UserRole;
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        role: newR
                      });
                    }}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800"
                  >
                    {isSuperAdmin && <option value="super_admin">👑 Super Administrator (គ្រប់គ្រងប្រព័ន្ធខ្ពស់បំផុត)</option>}
                    {(isDirector || isSuperAdmin) && <option value="director">🏛️ នាយកសាលា (School Director / Admin)</option>}
                    <option value="secretary">📑 លេខាធិការ (Secretary / រដ្ឋបាល)</option>
                    <option value="librarian">📚 បណ្ណារក្ស (Librarian)</option>
                    <option value="teacher">👨‍🏫 គ្រូបង្រៀន / គ្រូបន្ទុកថ្នាក់ (Teacher)</option>
                    <option value="student">🎓 សិស្សានុសិស្ស (Student)</option>
                    <option value="parent">👨‍👩‍👧 អាណាព្យាបាលសិស្ស (Parent)</option>
                  </select>
                </div>

                {/* Role Specific Assignments */}
                {selectedUserForEdit.role === 'teacher' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-blue-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ថ្នាក់ទទួលបន្ទុក</label>
                      <select
                        value={selectedUserForEdit.assignedGrade || 0}
                        onChange={e =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            assignedGrade: Number(e.target.value) || undefined
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="0">គ្មាន (បង្រៀនទូទៅ)</option>
                        {[1, 2, 3, 4, 5, 6].map(g => (
                          <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">បន្ទប់/កន្ទុយ</label>
                      <select
                        value={selectedUserForEdit.assignedSection || 'ក'}
                        onChange={e =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            assignedSection: e.target.value
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="ក">ក</option>
                        <option value="ខ">ខ</option>
                        <option value="គ">គ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">អត្តលេខមន្ត្រី</label>
                      <input
                        type="text"
                        value={selectedUserForEdit.staffCode || ''}
                        onChange={e =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            staffCode: e.target.value
                          })
                        }
                        placeholder="MOEYS-..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {selectedUserForEdit.role === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-blue-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">អត្តលេខសិស្ស</label>
                      <input
                        type="text"
                        value={selectedUserForEdit.studentCode || ''}
                        onChange={e =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            studentCode: e.target.value
                          })
                        }
                        placeholder="STU-..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
                      <select
                        value={selectedUserForEdit.assignedGrade || 1}
                        onChange={e =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            assignedGrade: Number(e.target.value)
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        {[1, 2, 3, 4, 5, 6].map(g => (
                          <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">បន្ទប់/កន្ទុយ</label>
                      <select
                        value={selectedUserForEdit.assignedSection || 'ក'}
                        onChange={e =>
                          setSelectedUserForEdit({
                            ...selectedUserForEdit,
                            assignedSection: e.target.value
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="ក">ក</option>
                        <option value="ខ">ខ</option>
                        <option value="គ">គ</option>
                      </select>
                    </div>
                  </div>
                )}

                {(selectedUserForEdit.role === 'director' || selectedUserForEdit.role === 'secretary' || selectedUserForEdit.role === 'librarian') && (
                  <div className="pt-2 border-t border-blue-200/60">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">អត្តលេខមន្ត្រី (Staff Code)</label>
                    <input
                      type="text"
                      value={selectedUserForEdit.staffCode || ''}
                      onChange={e =>
                        setSelectedUserForEdit({
                          ...selectedUserForEdit,
                          staffCode: e.target.value
                        })
                      }
                      placeholder="MOEYS-..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">អ៊ីមែល (Email)</label>
                  <input
                    type="email"
                    value={selectedUserForEdit.email}
                    onChange={e =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">លេខទូរស័ព្ទ</label>
                  <input
                    type="text"
                    value={selectedUserForEdit.phone || ''}
                    onChange={e =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, phone: e.target.value })
                    }
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ពាក្យសម្ងាត់ថ្មី (New Password)
                  </label>
                  <span className="text-[10.5px] text-slate-400">
                    (ទុកទំនេរ ប្រសិនបើមិនចង់ផ្លាស់ប្តូរ)
                  </span>
                </div>
                <input
                  type="password"
                  value={editPasswordInput}
                  onChange={e => setEditPasswordInput(e.target.value)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី (ឧ. School@2025#)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Real-time Password Strength Indicator */}
              {editPasswordInput.length > 0 && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <PasswordStrengthIndicator
                    password={editPasswordInput}
                    userForHistoryCheck={selectedUserForEdit}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ស្ថានភាពគណនី</label>
                <select
                  value={selectedUserForEdit.status}
                  onChange={e =>
                    setSelectedUserForEdit({
                      ...selectedUserForEdit,
                      status: e.target.value as 'active' | 'suspended'
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="active">សកម្ម (Active)</option>
                  <option value="suspended">ផ្អាកបណ្តោះអាសន្ន (Suspended)</option>
                </select>
              </div>

              {selectedUserForEdit.passwordUpdatedAt && (
                <div className="p-2.5 bg-blue-50 border border-blue-200/60 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    កាលបរិច្ឆេទផ្លាស់ប្តូរពាក្យសម្ងាត់ចុងក្រោយ៖{' '}
                    <strong>
                      {new Date(selectedUserForEdit.passwordUpdatedAt).toLocaleDateString('km-KH')}
                    </strong>
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserForEdit(null);
                    setEditPasswordInput('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={editPasswordInput.length > 0 && !evaluatePassword(editPasswordInput).isValid}
                  className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                    editPasswordInput.length > 0 && !evaluatePassword(editPasswordInput).isValid
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>រក្សាទុកការកែប្រែ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Forgot Password Firebase Email Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => {
          setShowForgotPasswordModal(false);
          setForgotPasswordUser(null);
        }}
        targetUser={forgotPasswordUser}
        currentUserEmail={currentUser?.email}
        onShowToast={showToast}
      />

      {/* Confirmation Modal: Director Bulk Force Password Rotation */}
      {showBulkForceConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <h3 className="font-moul text-base text-slate-900">
              បង្ខំឱ្យបុគ្គលិកទាំងអស់ប្តូរពាក្យសម្ងាត់?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              សកម្មភាពនេះនឹងកំណត់ទង់ <code className="px-1.5 py-0.5 bg-slate-100 rounded text-rose-700 font-mono">forcePasswordChange: true</code> ទៅកាន់គណនីលោកគ្រូ-អ្នកគ្រូ លេខា និងបណ្ណារក្សទាំងអស់។
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs mt-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                នៅពេលបុគ្គលិកចូលប្រើប្រព័ន្ធលើកក្រោយ ប្រព័ន្ធនឹងបង្ហាញផ្ទាំងផ្លាស់ប្តូរពាក្យសម្ងាត់ជាកំហិត (Mandatory Security Rotation) ភ្លាមៗ។
              </span>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkForceConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleBulkForceStaffPasswordUpdate}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>បញ្ជាក់ និងអនុវត្ត</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Password Change Modal for Current User if Flagged */}
      {currentUser?.forcePasswordChange && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-500/50 space-y-4">
            <div className="flex items-start gap-3.5 pb-3 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 animate-pulse">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-moul text-sm sm:text-base text-rose-950">
                    តម្រូវឱ្យផ្លាស់ប្តូរពាក្យសម្ងាត់ជាកំហិត
                  </h3>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                    Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  នាយកសាលាបានកំណត់ឱ្យគណនីរបស់អ្នកត្រូវតែផ្លាស់ប្តូរពាក្យសម្ងាត់ថ្មី (Mandatory Security Rotation) មុនពេលអាចបន្តប្រើប្រាស់មុខងារនានាក្នុងប្រព័ន្ធបាន។
                </p>
              </div>
            </div>

            <form onSubmit={handleMandatoryPasswordSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ពាក្យសម្ងាត់ថ្មី (New Password) *
                </label>
                <input
                  type="password"
                  value={mandatoryNewPassword}
                  onChange={e => setMandatoryNewPassword(e.target.value)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី..."
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Real-time Strength Indicator */}
              {mandatoryNewPassword && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <PasswordStrengthIndicator
                    password={mandatoryNewPassword}
                    userForHistoryCheck={currentUser}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm New Password) *
                </label>
                <input
                  type="password"
                  value={mandatoryConfirmPassword}
                  onChange={e => setMandatoryConfirmPassword(e.target.value)}
                  placeholder="វាយបញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត..."
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {mandatoryNewPassword && mandatoryConfirmPassword && mandatoryNewPassword !== mandatoryConfirmPassword && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ!</span>
                </p>
              )}

              <button
                type="submit"
                disabled={
                  !evaluatePassword(mandatoryNewPassword).isValid ||
                  mandatoryNewPassword !== mandatoryConfirmPassword
                }
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់ និងចូលប្រើប្រព័ន្ធ</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Role & Permissions Inspector Modal */}
      <RolePermissionsInspectorModal
        isOpen={showRoleInspectorModal}
        onClose={() => {
          setShowRoleInspectorModal(false);
          setInspectedUserForRole(null);
        }}
        targetUser={inspectedUserForRole}
      />

      {/* Delete Account Confirmation Modal with Mandatory Reason */}
      <DeleteAccountModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        user={userToDelete}
        onConfirmDelete={(userId, reason) => {
          deleteUser(userId, reason);
          showToast(`បានលុបគណនី និងផ្លាស់ទីទៅធុងសំរាម ៣០ ថ្ងៃ`, 'success');
        }}
      />
    </div>
  );
};
