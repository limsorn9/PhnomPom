import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Info, KeyRound } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const DirectorAccountTab: React.FC = () => {
  const { currentUser } = useSchool();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.username) {
      setUsername(currentUser.username);
    } else {
      setUsername('limsorn2'); // default mock if not found
    }
  }, [currentUser]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only alphanumeric, no spaces or special chars
    if (/^[a-zA-Z0-9]*$/.test(val)) {
      setUsername(val);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validations
    if (username.length < 3 || username.length > 50) {
      setError('ឈ្មោះអ្នកប្រើត្រូវមានចន្លោះពី ៣ ទៅ ៥០ តួអក្សរ។');
      return;
    }
    if (/^\d+$/.test(username)) {
      setError('ឈ្មោះអ្នកប្រើមិនអាចជាលេខសុទ្ធបានទេ។');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('ពាក្យសម្ងាត់ថ្មីមិនផ្ទៀងផ្ទាត់ទេ។');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ។');
      return;
    }
    if (!currentPassword) {
      setError('សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្នដើម្បីបញ្ជាក់។');
      return;
    }

    // Mock save to context / local storage
    if (currentUser) {
      // Typically we'd call a context method here like updateAccount(username, newPassword, currentPassword)
      // Since we don't have that exact method, we'll mock the success
      console.log('Saved account data:', { username, newPassword, currentPassword });
      setSuccess('បានរក្សាទុកការផ្លាស់ប្ដូរដោយជោគជ័យ។');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans font-kantumruy">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-1">ព័ត៌មានគណនី</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            ប្ដូរឈ្មោះអ្នកប្រើ ពាក្យសម្ងាត់ ឬទាំងពីរ។ សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្នដើម្បីបញ្ជាក់។
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ឈ្មោះអ្នកប្រើប្រាស់</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
                  placeholder="ឧ. limsorn2"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                ឈ្មោះអ្នកប្រើត្រូវមាន 3–50 តួ ជាអក្សរអង់គ្លេស ឬលេខប៉ុណ្ណោះ (គ្មានសញ្ញា) និងមិនមែនតែលេខសុទ្ធ
              </p>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* New Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                ពាក្យសម្ងាត់ថ្មី 
                <span className="text-xs font-normal text-slate-400">( ស្រេចចិត្ត )</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
                  placeholder="ទុកចន្លោះប្រសិនបើមិនចង់ផ្លាស់ប្ដូរ"
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">បំពេញសម្ងាត់ថ្មីម្ដងទៀត</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
                  placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ពាក្យសម្ងាត់បច្ចុប្បន្ន <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
                  placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្នដើម្បីបញ្ជាក់"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium px-6 py-2.5 rounded-xl text-sm transition shadow-sm inline-block mt-4"
            >
              រក្សាទុកការផ្លាស់ប្ដូរ
            </button>
          </form>
        </div>

        {/* Instruction Column */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-4 h-full">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm mb-4">
              <Info className="w-4 h-4 text-blue-500" /> 
              សេចក្ដីណែនាំ
            </h3>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">ឈ្មោះអ្នកប្រើប្រាស់</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-500 leading-relaxed">
                <li>ចាប់ពី 3 ដល់ 50 តួអក្សរ</li>
                <li>ប្រើតែអក្សរអង់គ្លេស (A–Z, a–z) និងលេខ (0–9) ប៉ុណ្ណោះ</li>
                <li>មិនអនុញ្ញាតដកឃ្លា ឬសញ្ញាដូចជា _ - . @</li>
                <li>មិនអាចជាលេខសុទ្ធបានទេ</li>
                <li>មិនត្រូវជាន់ជាមួយគណនីផ្សេង (អក្សរធំ និងអក្សរតូចរាប់ថាដូចគ្នា)</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <h4 className="font-semibold text-slate-700">ពាក្យសម្ងាត់ថ្មី (ទុកចន្លោះប្រសិនបើមិនចង់ផ្លាស់ប្ដូរ)</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-500 leading-relaxed">
                <li>យ៉ាងហោចណាស់ 8 តួអក្សរ</li>
                <li>អក្សរអង់គ្លេស លេខ និងសញ្ញាដូចជា ! @ # $ %</li>
                <li>មិនអនុញ្ញាតដកឃ្លា និងអក្សរខ្មែរ</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
