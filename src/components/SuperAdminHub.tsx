import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  Server, 
  Activity, 
  Database, 
  Settings, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  Lock, 
  RefreshCw, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Save, 
  Download, 
  Upload,
  Send,
  UserCheck,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Layers
} from 'lucide-react';
import { GroupManagement } from './GroupManagement';

export const SuperAdminHub: React.FC = () => {
  const { 
    currentUser, 
    appUsers, 
    setAppUsers, 
    schoolProfile, 
    updateSchoolProfile, 
    showToast, 
    activityLogs,
    schoolGroups
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'directors' | 'groups' | 'system_config' | 'audit_logs'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingDirector, setIsAddingDirector] = useState(false);

  // Form state for new director
  const [newDirForm, setNewDirForm] = useState({
    nameKhmer: '',
    nameLatin: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    schoolName: '',
    province: 'ខេត្តបាត់ដំបង',
    district: 'ស្រុកភ្នំព្រឹក'
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalAcademicYear, setGlobalAcademicYear] = useState(schoolProfile.academicYear || '២០២៤ - ២០២៥');

  // Verify Super Admin
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.username === 'limsorn';

  const directorsList = (appUsers || []).filter(u => u.role === 'director' || u.role === 'super_admin');

  const handleCreateDirector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirForm.nameKhmer || !newDirForm.username || !newDirForm.password) {
      showToast('សូមបំពេញព័ត៌មានសំខាន់ៗឱ្យបានគ្រប់គ្រាន់', 'error');
      return;
    }

    const newUser = {
      id: `dir-${Date.now()}`,
      username: newDirForm.username,
      email: newDirForm.email || `${newDirForm.username}@school.edu.kh`,
      password: newDirForm.password,
      nameKhmer: newDirForm.nameKhmer,
      nameLatin: newDirForm.nameLatin || newDirForm.username,
      role: 'director' as const,
      phone: newDirForm.phone || '012 345 678',
      staffCode: `MOEYS-DIR-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active' as const
    };

    setAppUsers(prev => [...prev, newUser]);
    showToast(`បានបង្កើតគណនីនាយកសាលា "${newDirForm.nameKhmer}" ជោគជ័យ!`, 'success');
    setIsAddingDirector(false);
    setNewDirForm({
      nameKhmer: '',
      nameLatin: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      schoolName: '',
      province: 'ខេត្តបាត់ដំបង',
      district: 'ស្រុកភ្នំព្រឹក'
    });
  };

  const handleResetPassword = (userId: string, userName: string) => {
    const newPass = prompt(`បញ្ចូលពាក្យសម្ងាត់ថ្មីសម្រាប់ ${userName}:`, '123456');
    if (newPass) {
      setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
      showToast(`បានកំណត់ពាក្យសម្ងាត់ថ្មីសម្រាប់ ${userName} រួចរាល់!`, 'success');
    }
  };

  const handleToggleStatus = (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
    setAppUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus as any } : u));
    showToast(`បានប្តូរស្ថានភាពគណនីទៅជា "${nextStatus === 'active' ? 'ដំណើរការ' : 'បិទដំណើរការ'}"`, 'info');
  };

  return (
    <div className="space-y-6 pb-12 font-battambang">
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ប្រព័ន្ធគ្រប់គ្រងកម្រិតខ្ពស់สุด (Super Administrator Hub)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-moul tracking-wide text-white">
              ការគ្រប់គ្រងស្ថាប័ន និងនាយកសាលាទូទាំងប្រទេស
            </h1>
            <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
              ស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រងកម្រិតខ្ពស់របស់ <span className="font-bold text-white">{currentUser?.nameKhmer || 'លោក លីម សន'}</span> (Telegram ID: <span className="text-amber-300 font-mono">240224709</span> / @limsorn)។ លោកអ្នកមានសិទ្ធិគ្រប់គ្រងលើគ្រប់នាយកសាលា ស្តង់ដាប្រព័ន្ធ និងសវនកម្មសុវត្ថិភាព។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-indigo-200">សាលាគំរូសរុប</div>
              <div className="text-xl font-bold text-white">5 ស្ថាប័ន</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-indigo-200">នាយកសាលា</div>
              <div className="text-xl font-bold text-emerald-400">{directorsList.length} នាក់</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-indigo-200">ស្ថានភាពប្រព័ន្ធ</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ដំណើរការល្អ (99.9%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          ផ្ទាំងវាស់វែងសុខភាពប្រព័ន្ធ (Platform Health)
        </button>
        <button
          onClick={() => setActiveSubTab('directors')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'directors'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          គ្រប់គ្រងនាយកសាលា & ស្ថាប័ន ({directorsList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'groups'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          គ្រប់គ្រងក្រុម & ក្លឹបសិក្សា ({schoolGroups.length})
        </button>
        <button
          onClick={() => setActiveSubTab('system_config')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'system_config'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          ការកំណត់ប្រព័ន្ធទូទាំងវេប (Global Config)
        </button>
        <button
          onClick={() => setActiveSubTab('audit_logs')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'audit_logs'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Server className="w-4 h-4" />
          សវនកម្មប្រព័ន្ធ & ឯកសារ (Audit & Logs)
        </button>
      </div>

      {/* Tab Content 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">សាលារៀនពាក់ព័ន្ធ</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">៥ សាលា</h3>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ធ្វើសមកាលកម្មរួចរាល់
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">នាយកសាលាសរុប</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{directorsList.length} នាក់</h3>
                <p className="text-xs text-indigo-600 mt-1">គ្រប់គ្រងស្ថាប័នផ្ទាល់</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Telegram Bot ID</p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">240224709</h3>
                <p className="text-xs text-emerald-600 mt-1">@limsorn (Active)</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Cloud Firestore DB</p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">Connected</h3>
                <p className="text-xs text-emerald-600 mt-1">Secure & Encrypted</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* School Instances Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              ស្ថានភាពស្ថាប័ន និងសាលារៀនក្រោមការគ្រប់គ្រង
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">សាលាបឋមសិក្សាភ្នំព្រឹក</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">ដំណើរការ</span>
                </div>
                <p className="text-xs text-slate-500">ខេត្តបាត់ដំបង ស្រុកភ្នំព្រឹក ឃុំភ្នំព្រឹក</p>
                <div className="text-xs font-semibold text-indigo-600 pt-2 border-t border-slate-200">
                  នាយក៖ លោក លីម សន (Super Admin)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">សាលាបឋមសិក្សាសៀមរាប</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">ដំណើរការ</span>
                </div>
                <p className="text-xs text-slate-500">ខេត្តសៀមរាប ក្រុងសៀមរាប</p>
                <div className="text-xs font-semibold text-indigo-600 pt-2 border-t border-slate-200">
                  នាយក៖ លោក នួន សុខា (Director)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">សាលាបឋមសិក្សាចតុមុខ</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-bold">ដំណើរការ</span>
                </div>
                <p className="text-xs text-slate-500">រាជធានីភ្នំពេញ ខណ្ឌដូនពេញ</p>
                <div className="text-xs font-semibold text-indigo-600 pt-2 border-t border-slate-200">
                  នាយក៖ លោកស្រី កែវ មុន្នី (Director)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Directors Management */}
      {activeSubTab === 'directors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកឈ្មោះនាយកសាលា ឬអ៊ីម៉ែល..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <button
              onClick={() => setIsAddingDirector(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              បន្ថែមនាយកសាលាថ្មី
            </button>
          </div>

          {/* Add Director Modal / Inline Form */}
          {isAddingDirector && (
            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-lg space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  ចុះឈ្មោះគណនីនាយកសាលាថ្មី
                </h3>
                <button onClick={() => setIsAddingDirector(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDirector} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ឈ្មោះជាភាសាខ្មែរ *</label>
                  <input
                    type="text"
                    required
                    value={newDirForm.nameKhmer}
                    onChange={e => setNewDirForm({ ...newDirForm, nameKhmer: e.target.value })}
                    placeholder="លោក នាយក..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ឈ្មោះឡាតាំង</label>
                  <input
                    type="text"
                    value={newDirForm.nameLatin}
                    onChange={e => setNewDirForm({ ...newDirForm, nameLatin: e.target.value })}
                    placeholder="Director Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ឈ្មោះអ្នកប្រើប្រាស់ (Username) *</label>
                  <input
                    type="text"
                    required
                    value={newDirForm.username}
                    onChange={e => setNewDirForm({ ...newDirForm, username: e.target.value })}
                    placeholder="director_siemreap"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ពាក្យសម្ងាត់ (Password) *</label>
                  <input
                    type="text"
                    required
                    value={newDirForm.password}
                    onChange={e => setNewDirForm({ ...newDirForm, password: e.target.value })}
                    placeholder="123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">លេខទូរស័ព្ទ</label>
                  <input
                    type="text"
                    value={newDirForm.phone}
                    onChange={e => setNewDirForm({ ...newDirForm, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">អ៊ីម៉ែល</label>
                  <input
                    type="email"
                    value={newDirForm.email}
                    onChange={e => setNewDirForm({ ...newDirForm, email: e.target.value })}
                    placeholder="director@school.edu.kh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddingDirector(false)}
                    className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm"
                  >
                    រក្សាទុកនាយកសាលា
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Directors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-4">ល.រ</th>
                    <th className="p-4">ឈ្មោះនាយកសាលា</th>
                    <th className="p-4">ឈ្មោះគណនី (Username)</th>
                    <th className="p-4">លេខទូរស័ព្ទ & អ៊ីម៉ែល</th>
                    <th className="p-4">តួនាទី</th>
                    <th className="p-4">ស្ថានភាព</th>
                    <th className="p-4 text-center">សកម្មភាពគ្រប់គ្រង</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {directorsList
                    .filter(u => 
                      u.nameKhmer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.username.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((dir, idx) => (
                      <tr key={dir.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500">{idx + 1}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{dir.nameKhmer}</div>
                          <div className="text-xs text-slate-400 font-times">{dir.nameLatin}</div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-indigo-600">{dir.username}</td>
                        <td className="p-4">
                          <div className="text-slate-800">{dir.phone || 'គ្មាន'}</div>
                          <div className="text-xs text-slate-400">{dir.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            dir.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {dir.role === 'super_admin' ? '👑 Super Admin' : 'នាយកសាលា'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            dir.status !== 'inactive' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dir.status !== 'inactive' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {dir.status !== 'inactive' ? 'សកម្ម' : 'បិទដំណើរការ'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleResetPassword(dir.id, dir.nameKhmer)}
                              title="ប្តូរពាក្យសម្ងាត់"
                              className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors border border-indigo-200"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(dir.id, dir.status)}
                              title="ប្តូរស្ថានភាពគណនី"
                              className={`p-2 rounded-lg transition-colors border ${
                                dir.status !== 'inactive' 
                                  ? 'hover:bg-rose-50 text-rose-600 border-rose-200' 
                                  : 'hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                              }`}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: School Groups & Clubs */}
      {activeSubTab === 'groups' && (
        <div className="space-y-6">
          <GroupManagement />
        </div>
      )}

      {/* Tab Content 3: System Configuration */}
      {activeSubTab === 'system_config' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            ការកំណត់ប្រព័ន្ធទូទាំងវេប (Global System Configuration)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-700">ឆ្នាំសិក្សាស្ដង់ដា (Global Academic Year)</h4>
              <p className="text-xs text-slate-500">កំណត់ឆ្នាំសិក្សាសំខាន់សម្រាប់ស្ថាប័នទាំងអស់ក្នុងប្រព័ន្ធ (ចាប់ពី ២០១៦-២០១៧ រហូតដល់ ២០៥០)</p>
              <select
                value={globalAcademicYear}
                onChange={e => {
                  setGlobalAcademicYear(e.target.value);
                  updateSchoolProfile({ ...schoolProfile, academicYear: e.target.value });
                  showToast('បានកែប្រែឆ្នាំសិក្សាស្ដង់ដាទូទាំងប្រព័ន្ធជោគជ័យ!', 'success');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
              >
                {Array.from({ length: 35 }, (_, i) => {
                  const startY = 2016 + i;
                  const endY = startY + 1;
                  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
                  const toKhmerNum = (n: number) => String(n).split('').map(d => khmerDigits[parseInt(d)] || d).join('');
                  const yrStr = `${toKhmerNum(startY)} - ${toKhmerNum(endY)}`;
                  return <option key={startY} value={yrStr}>{yrStr}</option>;
                })}
              </select>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-700">របៀបថែទាំប្រព័ន្ធ (Maintenance Mode)</h4>
              <p className="text-xs text-slate-500">បើកមុខងារនេះពេលដែលត្រូវការអាប់ដេតប្រព័ន្ធ ឬ Database សំខាន់ៗ</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-slate-700">ស្ថានភាពថែទាំប្រព័ន្ធ៖</span>
                <button
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    showToast(maintenanceMode ? 'បានបិទ Maintenance Mode' : 'បានបើក Maintenance Mode', 'info');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    maintenanceMode ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {maintenanceMode ? 'កំពុងថែទាំ (Maintenance ON)' : 'ដំណើរការធម្មតា (Normal)'}
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2">
              <h4 className="font-bold text-slate-700">Telegram Bot & Notification Integration</h4>
              <p className="text-xs text-slate-500">តភ្ជាប់ Telegram Bot ID <span className="font-mono font-bold text-indigo-600">240224709</span> (@limsorn) សម្រាប់ទទួលស្វ័យប្រវត្តិគ្រប់ការស្នើសុំពាក្យសម្ងាត់ និងរបាយការណ៍សាលា</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  readOnly
                  value="Telegram ID: 240224709 | Username: @limsorn | Status: Connected"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono bg-white text-emerald-700 font-semibold"
                />
                <button
                  onClick={() => showToast('បានផ្ញើសារេសត (Test Telegram Notification) ទៅកាន់ @limsorn ជោគជ័យ!', 'success')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold whitespace-nowrap"
                >
                  តេស្តផ្ញើសារ Telegram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Audit Logs */}
      {activeSubTab === 'audit_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              កំណត់ត្រាសវនកម្មប្រព័ន្ធទូទាំងស្ថាប័ន (System Audit Trails)
            </h3>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full">
              សរុប {activityLogs.length} កំណត់ត្រា
            </span>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 15).map(log => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{log.actionKhmer || log.description}</div>
                  <div className="text-xs text-slate-500">ដោយ៖ <span className="font-semibold text-indigo-600">{log.userName || 'អ្នកប្រើប្រាស់'}</span> ({log.userRole || 'Admin'})</div>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString('km-KH')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
