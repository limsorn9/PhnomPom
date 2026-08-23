import React, { useState } from 'react';
import { PasswordPolicyConfig, AppUser } from '../types';
import {
  DEFAULT_PASSWORD_POLICY,
  getSavedPasswordPolicy
} from './PasswordStrengthIndicator';
import {
  Shield,
  ShieldCheck,
  Lock,
  History,
  Clock,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Save,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';

interface PasswordPolicyTabProps {
  currentUser: AppUser | null;
  onUpdateAllStaffForceRotation: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const PasswordPolicyTab: React.FC<PasswordPolicyTabProps> = ({
  currentUser,
  onUpdateAllStaffForceRotation,
  onShowToast
}) => {
  const [policy, setPolicy] = useState<PasswordPolicyConfig>(() => getSavedPasswordPolicy());
  const [isSaved, setIsSaved] = useState(false);

  const isDirector = currentUser?.role === 'director';

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('moeys_password_policy', JSON.stringify(policy));
      setIsSaved(true);
      onShowToast('បានរក្សាទុក និងអនុវត្តគោលការណ៍ពាក្យសម្ងាត់ថ្មី (Password Policy) ដោយជោគជ័យ!', 'success');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      onShowToast('បរាជ័យក្នុងការរក្សាទុកគោលការណ៍!', 'error');
    }
  };

  const handleResetToDefault = () => {
    setPolicy(DEFAULT_PASSWORD_POLICY);
    localStorage.setItem('moeys_password_policy', JSON.stringify(DEFAULT_PASSWORD_POLICY));
    onShowToast('បានកំណត់គោលការណ៍ពាក្យសម្ងាត់ទៅជាលំនាំដើមរបស់ក្រសួង (MoEYS Standard)!', 'info');
  };

  return (
    <div className="space-y-6 font-kantumruy">
      {/* Top Intro Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-blue-200 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ស្តង់ដារសន្តិសុខប្រព័ន្ធព័ត៌មានវិទ្យា MoEYS 2024</span>
          </div>

          <h2 className="font-moul text-lg sm:text-xl text-white">
            គោលការណ៍ពាក្យសម្ងាត់ & សុពលភាពសុវត្ថិភាព (Password Policy Enforcement)
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            កំណត់និងអនុវត្តស្តង់ដារសុវត្ថិភាពពាក្យសម្ងាត់សម្រាប់គណនីទាំងអស់ រួមមាន រយៈពេលផុតកំណត់សុពលភាព (Expiration Durations), ការទប់ស្កាត់ការប្រើពាក្យសម្ងាត់ចាស់ ៣ លើកចុងក្រោយ (Password History), និងកម្រិតស្មុគស្មាញនៃតួអក្សរ។
          </p>
        </div>
      </div>

      <form onSubmit={handleSavePolicy} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Policy Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Expiration & Rotation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    ១. រយៈពេលផុតកំណត់សុពលភាពពាក្យសម្ងាត់ (Password Expiration Duration)
                  </h3>
                  <p className="text-xs text-slate-500">
                    កំណត់កាលបរិច្ឆេទដែលគណនីត្រូវតែផ្លាស់ប្តូរពាក្យសម្ងាត់ថ្មីជាកាតព្វកិច្ច
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  សុពលភាពពាក្យសម្ងាត់ (Expiration Interval):
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { days: 30, label: '៣០ ថ្ងៃ (30 Days)', desc: 'សន្តិសុខខ្ពស់បំផុត (Strict)' },
                    { days: 60, label: '៦០ ថ្ងៃ (60 Days)', desc: 'សន្តិសុខខ្ពស់ (High)' },
                    { days: 90, label: '៩០ ថ្ងៃ (90 Days)', desc: 'ស្តង់ដារទូទៅ (Recommended)' },
                    { days: 180, label: '១៨០ ថ្ងៃ (6 Months)', desc: 'កម្រិតមធ្យម' },
                    { days: 365, label: '១ ឆ្នាំ (1 Year)', desc: 'កម្រិតបន្ធូរបន្ថយ' },
                    { days: 0, label: 'មិនកំណត់ (Never)', desc: 'មិនផុតកំណត់ (Not Recommended)' }
                  ].map(item => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => setPolicy(prev => ({ ...prev, expirationDays: item.days }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        policy.expirationDays === item.days
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{item.label}</span>
                        {policy.expirationDays === item.days && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-blue-950 text-xs flex items-start gap-2.5 mt-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] leading-relaxed">
                    នៅពេលដល់កាលកំណត់សុពលភាព ប្រព័ន្ធនឹងបង្ហាញផ្ទាំងដាស់តឿន <strong>«Password Rotation Required»</strong> និងចាក់សោទាមទារឱ្យផ្លាស់ប្តូរពាក្យសម្ងាត់មុននឹងអាចបន្តកិច្ចការបាន។
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Password History Prevention */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    ២. ទប់ស្កាត់ការប្រើពាក្យសម្ងាត់ចាស់ឡើងវិញ (Password History Prevention)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ការពារអ្នកប្រើប្រាស់មិនឱ្យប្តូរត្រឡប់ទៅប្រើពាក្យសម្ងាត់ចាស់ដែលធ្លាប់បានប្រើ
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      ចំនួនពាក្យសម្ងាត់ចុងក្រោយដែលហាមឃាត់ (History Depth):
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ប្រព័ន្ធនឹងចងចាំ និងទប់ស្កាត់ការប្រើឡើងវិញនូវពាក្យសម្ងាត់ {policy.preventRecentPasswordsCount} លើកចុងក្រោយ
                    </p>
                  </div>

                  <select
                    value={policy.preventRecentPasswordsCount}
                    onChange={e =>
                      setPolicy(prev => ({
                        ...prev,
                        preventRecentPasswordsCount: Number(e.target.value)
                      }))
                    }
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={3}>៣ ពាក្យសម្ងាត់ចុងក្រោយ (ស្តង់ដារ MoEYS)</option>
                    <option value={4}>៤ ពាក្យសម្ងាត់ចុងក្រោយ</option>
                    <option value={5}>៥ ពាក្យសម្ងាត់ចុងក្រោយ (សុវត្ថិភាពខ្ពស់)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Complexity Requirements */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    ៣. លក្ខខណ្ឌតម្រូវនៃតួអក្សរ & កម្រិតស្មុគស្មាញ (Complexity Rules)
                  </h3>
                  <p className="text-xs text-slate-500">
                    តម្រូវការចាំបាច់សម្រាប់បង្កើត និងផ្លាស់ប្តូរពាក្យសម្ងាត់
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">ប្រវែងអប្បបរមា (Minimum Length):</span>
                    <span className="text-[11px] text-slate-500">ចំនួនតួអក្សរយ៉ាងតិចបំផុត</span>
                  </div>
                  <select
                    value={policy.minLength}
                    onChange={e =>
                      setPolicy(prev => ({ ...prev, minLength: Number(e.target.value) }))
                    }
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={8}>8 តួអក្សរ (ស្តង់ដារ)</option>
                    <option value={10}>10 តួអក្សរ (សុវត្ថិភាពខ្ពស់)</option>
                    <option value={12}>12 តួអក្សរ (Very Strong)</option>
                    <option value={16}>16 តួអក្សរ (Ultra Secure)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60">
                    <span className="font-medium text-slate-800">តម្រូវឱ្យមានអក្សរធំ (A-Z)</span>
                    <input
                      type="checkbox"
                      checked={policy.requireUppercase}
                      onChange={e => setPolicy(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60">
                    <span className="font-medium text-slate-800">តម្រូវឱ្យមានអក្សរតូច (a-z)</span>
                    <input
                      type="checkbox"
                      checked={policy.requireLowercase}
                      onChange={e => setPolicy(prev => ({ ...prev, requireLowercase: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60">
                    <span className="font-medium text-slate-800">តម្រូវឱ្យមានលេខ (0-9)</span>
                    <input
                      type="checkbox"
                      checked={policy.requireNumbers}
                      onChange={e => setPolicy(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60">
                    <span className="font-medium text-slate-800">តម្រូវឱ្យមាននិមិត្តសញ្ញា (@, $, !)</span>
                    <input
                      type="checkbox"
                      checked={policy.requireSpecialChars}
                      onChange={e => setPolicy(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Policy Status & Quick Enforcement */}
          <div className="space-y-6">
            {/* Save & Reset Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>អនុវត្តគោលការណ៍ (Actions)</span>
              </h3>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaved ? 'បានរក្សាទុក!' : 'រក្សាទុក & អនុវត្តគោលការណ៍'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>កំណត់ទៅតាមលំនាំដើម MoEYS</span>
                </button>
              </div>

              {isDirector && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onUpdateAllStaffForceRotation}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>បង្ខំបុគ្គលិកទាំងអស់ប្តូរពាក្យសម្ងាត់ឥឡូវនេះ</span>
                  </button>
                  <p className="text-[10.5px] text-slate-500 text-center mt-1.5">
                    កំណត់ទង់ forcePasswordChange លើគ្រប់គណនីបុគ្គលិក
                  </p>
                </div>
              )}
            </div>

            {/* Current Policy Summary Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs text-slate-700">
              <h4 className="font-bold text-slate-800 text-[11.5px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>សេចក្តីសង្ខេបគោលការណ៍សកម្ម៖</span>
              </h4>

              <ul className="space-y-1 text-[11px]">
                <li className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">សុពលភាពពាក្យសម្ងាត់៖</span>
                  <span className="font-bold text-slate-900">
                    {policy.expirationDays > 0 ? `${policy.expirationDays} ថ្ងៃ` : 'មិនកំណត់'}
                  </span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">ទប់ស្កាត់ពាក្យសម្ងាត់ចាស់៖</span>
                  <span className="font-bold text-slate-900">{policy.preventRecentPasswordsCount} លើកចុងក្រោយ</span>
                </li>
                <li className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">ប្រវែងអប្បបរមា៖</span>
                  <span className="font-bold text-slate-900">{policy.minLength} តួអក្សរ</span>
                </li>
                <li className="flex items-center justify-between py-1">
                  <span className="text-slate-500">កម្រិតស្មុគស្មាញ៖</span>
                  <span className="font-bold text-indigo-700">A-Z, a-z, 0-9, សញ្ញាពិសេស</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
