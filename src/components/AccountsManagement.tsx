import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AppUser, UserRole, ProfileEditRequest } from '../types';
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
  ArrowRight
} from 'lucide-react';

export const AccountsManagement: React.FC = () => {
  const {
    currentUser,
    appUsers,
    addUser,
    updateUser,
    deleteUser,
    students,
    teachers,
    showToast,
    impersonateUser,
    profileEditRequests,
    approveProfileEditRequest,
    rejectProfileEditRequest
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'accounts' | 'edit_requests'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AppUser | null>(null);

  // New Account Form State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
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
  const isDirector = currentUser?.role === 'director';
  const isTeacher = currentUser?.role === 'teacher';

  const pendingRequestsCount = profileEditRequests.filter(r => r.status === 'pending').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameKhmer || !newEmail || !newPassword) {
      showToast('សូមបំពេញព័ត៌មានចាំបាច់ឲ្យបានគ្រប់គ្រាន់', 'error');
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
      assignedGrade: newRole === 'teacher' || newRole === 'student' ? newAssignedGrade : undefined,
      assignedSection: newRole === 'teacher' || newRole === 'student' ? newAssignedSection : undefined,
      status: 'active'
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
    setNewPassword('password123');
    setNewNameKhmer('');
    setNewNameLatin('');
    setNewPhone('');
    setNewStaffCode('');
    setNewStudentCode('');
  };

  // Filter users based on role and search query
  const filteredUsers = appUsers.filter(u => {
    const nameKh = u.nameKhmer || '';
    const email = u.email || '';
    const code = u.studentCode || '';
    const phone = u.phone || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      nameKh.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      code.toLowerCase().includes(query) ||
      phone.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    // If teacher, they only manage students in their grade or see teachers
    if (isTeacher && roleFilter === 'student') {
      return matchesSearch && matchesRole && u.assignedGrade === currentUser?.assignedGrade;
    }

    return matchesSearch && matchesRole;
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
                បង្កើតគណនីតាមឋានានុក្រម (Hierarchical Account Creation) និងអនុម័តសំណើកែប្រែប្រវត្តិរូប
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'accounts' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              បញ្ជីគណនី ({appUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('edit_requests')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'edit_requests' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
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

          {(isDirector || isTeacher) && (
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(true);
                setNewRole(isTeacher ? 'student' : 'secretary');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {isDirector ? '+ បង្កើតគណនីថ្មី' : '+ បង្កើតគណនីសិស្ស'}
              </span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'accounts' ? (
        <>
          {/* Role Hierarchy Notification Rule Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900">គោលការណ៍បង្កើតគណនីតាមឋានានុក្រម MoEYS៖</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11.5px]">
                <li><strong>នាយកសាលា (Director)៖</strong> មានសិទ្ធិបង្កើត និងគ្រប់គ្រងគណនីគ្រប់តួនាទី និងចូលមើល Master Access បាន។</li>
                <li><strong>គ្រូបន្ទុកថ្នាក់ (Homeroom Teacher)៖</strong> មានសិទ្ធិបង្កើត និងគ្រប់គ្រងគណនីសម្រាប់តែ <strong>សិស្សក្នុងបន្ទុកថ្នាក់របស់ខ្លួន</strong> ប៉ុណ្ណោះ។</li>
                <li><strong>ការស្តារពាក្យសម្ងាត់៖</strong> Auto-verification តាមលេខកូដសាលា រីឯសិស្ស auto-reset ជូនគ្រូបន្ទុកថ្នាក់។</li>
              </ul>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] text-slate-500 font-bold">គណនីសរុប</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{appUsers.length}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] text-blue-600 font-bold">នាយក & រដ្ឋបាល</p>
              <p className="text-xl font-bold text-blue-700 mt-1">
                {appUsers.filter(u => u.role === 'director' || u.role === 'secretary').length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] text-amber-600 font-bold">បណ្ណារក្ស</p>
              <p className="text-xl font-bold text-amber-700 mt-1">
                {appUsers.filter(u => u.role === 'librarian').length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] text-emerald-600 font-bold">គ្រូបង្រៀន</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                {appUsers.filter(u => u.role === 'teacher').length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[11px] text-purple-600 font-bold">សិស្សានុសិស្ស</p>
              <p className="text-xl font-bold text-purple-700 mt-1">
                {appUsers.filter(u => u.role === 'student').length}
              </p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    roleFilter === tab.id
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">#</th>
                    <th className="px-4 py-3">ឈ្មោះ & តួនាទី</th>
                    <th className="px-4 py-3">អ៊ីមែល / ឈ្មោះចូល</th>
                    <th className="px-4 py-3">អត្តលេខ / ថ្នាក់</th>
                    <th className="px-4 py-3">លេខទូរស័ព្ទ</th>
                    <th className="px-4 py-3">ស្ថានភាព</th>
                    <th className="px-4 py-3 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-semibold text-slate-500">{idx + 1}</td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {user.nameKhmer ? user.nameKhmer.charAt(0) : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.nameKhmer}</p>
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
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> សកម្ម
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-red-200">
                            <AlertTriangle className="w-3 h-3" /> ផ្អាក
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
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
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 flex items-center gap-1 transition-colors"
                            >
                              <LogIn className="w-3.5 h-3.5 text-amber-600" />
                              <span>ចូលប្រើ</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedUserForEdit(user)}
                            title="កែប្រែ / ប្តូរពាក្យសម្ងាត់"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {isDirector && user.id !== currentUser?.id && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនី «${user.nameKhmer}» ឬទេ?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              title="លុបគណនី"
                              className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
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
                ) : (
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="secretary">លេខាធិការ (Secretary)</option>
                    <option value="librarian">បណ្ណារក្ស (Librarian)</option>
                    <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
                    <option value="student">សិស្ស (Student)</option>
                  </select>
                )}
              </div>

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
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm text-slate-800">កែប្រែគណនី & ពាក្យសម្ងាត់</h3>
                  <p className="text-[11px] text-slate-500">{selectedUserForEdit.nameKhmer}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateUser(selectedUserForEdit.id, {
                  nameKhmer: selectedUserForEdit.nameKhmer,
                  email: selectedUserForEdit.email,
                  phone: selectedUserForEdit.phone,
                  password: selectedUserForEdit.password,
                  status: selectedUserForEdit.status
                });
                setSelectedUserForEdit(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះខ្មែរ</label>
                <input
                  type="text"
                  value={selectedUserForEdit.nameKhmer}
                  onChange={e =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, nameKhmer: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ពាក្យសម្ងាត់ថ្មី (Password)</label>
                <input
                  type="password"
                  value={selectedUserForEdit.password || ''}
                  onChange={e =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, password: e.target.value })
                  }
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

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

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm"
                >
                  រក្សាទុកការកែប្រែ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
