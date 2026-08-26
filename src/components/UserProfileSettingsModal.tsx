import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AppUser } from '../types';
import { User, KeyRound, Shield, CheckCircle2, AlertTriangle, Eye, EyeOff, Camera, Mail, Phone, Send, X } from 'lucide-react';

interface UserProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileSettingsModal: React.FC<UserProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    updateCurrentUserProfile,
    requestPasswordApprovalFromDirector,
    updateUser,
    showToast,
    language
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile Form state
  const [nameKhmer, setNameKhmer] = useState(currentUser?.nameKhmer || '');
  const [nameLatin, setNameLatin] = useState(currentUser?.nameLatin || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Approval request state
  const [requestReason, setRequestReason] = useState<'change_password' | 'forgot_password'>('change_password');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  if (!isOpen || !currentUser) return null;

  const isStudent = currentUser.role === 'student';
  const canDirectChangePassword = currentUser.role === 'director' || isStudent;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<AppUser> = {
      nameKhmer,
      nameLatin,
      email,
      phone
    };
    if (!isStudent) {
      updated.avatarUrl = avatarUrl;
    }

    const res = updateCurrentUserProfile(updated);
    if (res.success) {
      showToast('បានកែប្រែប្រវត្តិរូបផ្ទាល់ខ្លួនជោគជ័យ!', 'success');
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handlePasswordDirectChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      showToast('ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នាទេ!', 'error');
      return;
    }
    const res = updateCurrentUserProfile({ password: newPassword });
    if (res.success) {
      showToast('បានប្តូរលេខសម្ងាត់ថ្មីដោយជោគជ័យ!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRequestDirector = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestPasswordApprovalFromDirector(requestReason, newPassword || undefined);
    if (res.success) {
      setRequestSubmitted(true);
      showToast('បានផ្ញើសារស្នើសុំទៅកាន់នាយកសាលាដោយជោគជ័យ!', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-battambang">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md font-bold text-base">
              ⚙️
            </div>
            <div>
              <h3 className="font-moul text-sm text-slate-800 dark:text-slate-100">
                ការកំណត់គណនី និងប្រវត្តិរូបផ្ទាល់ខ្លួន
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.nameKhmer} ({currentUser.role.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>ព័ត៌មានប្រវត្តិរូប និងរូបថត</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'password'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>ពាក្យសម្ងាត់ & សុវត្ថិភាព</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white font-bold text-xl flex items-center justify-center overflow-hidden shadow-md">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.nameKhmer.charAt(0)
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{currentUser.nameKhmer}</p>
                  <p className="text-slate-500 font-times">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    តួនាទី: {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>

              {!isStudent && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    តំណរូបថត (Avatar Image URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center gap-1">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">អ្នកអាចដាក់ URL រូបថតផ្ទាល់ខ្លួនរបស់អ្នកនៅទីនេះ។</p>
                </div>
              )}

              {isStudent && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>ចំពោះគណនីសិស្ស មិនអាចប្តូររូបថតបានតាមចិត្តទេ។ រូបថតត្រូវបានគ្រប់គ្រងដោយគ្រូបន្ទុកថ្នាក់។</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ឈ្មោះខ្មែរ</label>
                  <input
                    type="text"
                    value={nameKhmer}
                    onChange={e => setNameKhmer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ឈ្មោះឡាតាំង</label>
                  <input
                    type="text"
                    value={nameLatin}
                    onChange={e => setNameLatin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">អ៊ីមែល (Email)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">លេខទូរស័ព្ទ</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  រក្សាទុកការកែប្រែ
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {canDirectChangePassword ? (
                <form onSubmit={handlePasswordDirectChange} className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-xl">
                    <span>អ្នកមានសិទ្ធិកែប្រែពាក្យសម្ងាត់ដោយផ្ទាល់ក្នុងគណនីរបស់អ្នក។</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ពាក្យសម្ងាត់ថ្មី</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="វាយបញ្ជាក់ពាក្យសម្ងាត់ថ្មីម្តងទៀត..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      ប្តូរលេខសម្ងាត់ថ្មី
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-bold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600" />
                      ស្នើសុំការអនុម័តពីនាយកសាលា
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      សម្រាប់តួនាទី លេខាធិការ បណ្ណារក្ស និងគ្រូបង្រៀន ការកែប្រែ ឬស្នើសុំពាក្យសម្ងាត់ថ្មី ត្រូវដាក់ស្នើសុំដោយស្វ័យប្រវត្តិទៅកាន់នាយកសាលា ដើម្បីពិនិត្យ និងអនុម័ត។
                    </p>
                  </div>

                  {requestSubmitted ? (
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <p className="font-bold text-emerald-900 dark:text-emerald-200">បានផ្ញើសារស្នើសុំទៅកាន់នាយកសាលារួចរាល់!</p>
                      <p className="text-[11px] text-slate-500">នាយកសាលានឹងទទួលបានសេចក្តីជូនដំណឹង និងធ្វើការអនុម័តជូនលោកអ្នកក្នុងពេលឆាប់ៗ។</p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl mt-2"
                      >
                        យល់ព្រម
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestDirector} className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">មូលហេតុនៃការស្នើសុំ</label>
                        <select
                          value={requestReason}
                          onChange={e => setRequestReason(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="change_password">🔑 ស្នើសុំកែប្រែលេខសម្ងាត់ (Change Password Request)</option>
                          <option value="forgot_password">❓ ភ្លេចលេខសម្ងាត់ (Forgot Password)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ពាក្យសម្ងាត់ថ្មីដែលចង់ស្នើសុំ (បើមាន)</label>
                        <input
                          type="text"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីដែលចង់ប្រើ..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                        >
                          បោះបង់
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-4 h-4" />
                          <span>ផ្ញើសារស្នើសុំទៅនាយកសាលា</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
