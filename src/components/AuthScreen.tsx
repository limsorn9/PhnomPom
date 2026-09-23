import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  GraduationCap,
  School,
  BookOpen,
  CheckCircle2,
  KeyRound,
  Phone,
  Hash,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  Building2
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const {
    login,
    loginWithGoogle,
    schoolProfile,
    switchUserRole,
    verifyAndResetTeacherPassword,
    verifyAndResetStudentPassword,
    verifyAndResetWithGoogle,
    showToast
  } = useSchool();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Recovery Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryRole, setRecoveryRole] = useState<'teacher' | 'student' | 'google'>('teacher');
  
  // Teacher recovery form
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherSchoolCode, setTeacherSchoolCode] = useState('');
  const [teacherNewPassword, setTeacherNewPassword] = useState('');
  
  // Student recovery form
  const [studentNameKhmer, setStudentNameKhmer] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentNewPassword, setStudentNewPassword] = useState('');

  // Google recovery form
  const [googleNewPassword, setGoogleNewPassword] = useState('');

  const [recoveryResult, setRecoveryResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('សូមបញ្ចូលអ៊ីមែល/អត្តលេខ និងពាក្យសម្ងាត់');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'បរាជ័យក្នុងការចូលប្រើជាមួយ Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    switchUserRole(role);
  };

  const handleTeacherRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail || !teacherSchoolCode || !teacherNewPassword) {
      setRecoveryResult({ success: false, message: 'សូមបំពេញព័ត៌មានគ្រប់ប្រអប់!' });
      return;
    }
    const res = verifyAndResetTeacherPassword(
      teacherEmail,
      teacherPhone,
      teacherSchoolCode,
      teacherNewPassword
    );
    setRecoveryResult(res);
    if (res.success) {
      showToast(res.message, 'success');
      setTimeout(() => {
        setShowRecoveryModal(false);
        setRecoveryResult(null);
        setIdentifier(teacherEmail);
        setPassword(teacherNewPassword);
      }, 2000);
    }
  };

  const handleStudentRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNameKhmer || !studentCode || !studentNewPassword) {
      setRecoveryResult({ success: false, message: 'សូមបំពេញឈ្មោះ អត្តលេខ និងពាក្យសម្ងាត់ថ្មី!' });
      return;
    }
    const res = verifyAndResetStudentPassword(
      studentNameKhmer,
      studentCode,
      studentNewPassword
    );
    setRecoveryResult(res);
    if (res.success) {
      showToast(res.message, 'success');
      setTimeout(() => {
        setShowRecoveryModal(false);
        setRecoveryResult(null);
        setIdentifier(studentCode);
        setPassword(studentNewPassword);
      }, 2200);
    }
  };

  const handleGoogleRecovery = async () => {
    setIsGoogleLoading(true);
    setRecoveryResult(null);
    try {
      const res = await verifyAndResetWithGoogle(googleNewPassword || undefined);
      setRecoveryResult(res);
      if (res.success) {
        showToast(res.message, 'success');
        setTimeout(() => {
          setShowRecoveryModal(false);
          setRecoveryResult(null);
        }, 2200);
      }
    } catch (err: any) {
      setRecoveryResult({ success: false, message: err?.message || 'បរាជ័យក្នុងការផ្ទៀងផ្ទាត់' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-battambang">
      {/* Top Ministry Banner */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-moul text-xs shadow-md">
              អយក
            </div>
            <div>
              <p className="font-moul text-xs text-blue-900 leading-tight">
                {schoolProfile.nameKhmer}
              </p>
              <p className="text-[11px] text-slate-500 font-battambang">
                ក្រសួងអប់រំ យុវជន និងកីឡា • ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សារដ្ឋ (MoEYS RBAC)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <School className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">{schoolProfile.nameKhmer}</span>
            <span className="text-slate-400">|</span>
            <span className="font-times font-medium text-slate-500">កូដ: {schoolProfile.schoolCode}</span>
          </div>
        </div>
      </header>

      {/* Main Facebook-Style Center Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: School & System Branding */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              ប្រព័ន្ធគ្រប់គ្រងរដ្ឋបាល & សិក្សាធិការតាមស្តង់ដារ MoEYS
            </div>

            <div>
              <h1 className="font-moul text-2xl sm:text-3xl lg:text-4xl text-blue-900 leading-relaxed tracking-wide">
                {schoolProfile.nameKhmer}
              </h1>
              <p className="font-times text-base text-slate-500 font-medium mt-1">
                {schoolProfile.nameLatin} • {schoolProfile.cluster}
              </p>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              សូមស្វាគមន៍មកកាន់ប្រព័ន្ធព័ត៌មានវិទ្យាគ្រប់គ្រងសាលាបឋមសិក្សា ជាមួយការបែងចែកសិទ្ធិប្រើប្រាស់ (RBAC) 
              ការស្រង់ពិន្ទុ និងវត្តមានតាមកម្រិតថ្នាក់ ការគ្រប់គ្រងហិរញ្ញវត្ថុ និងគណនីគ្រូ-សិស្សប្រកបដោយសុវត្ថិភាពខ្ពស់។
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">សិទ្ធិប្រើប្រាស់តាមតួនាទី (RBAC)</h4>
                  <p className="text-[11px] text-slate-500">នាយក, លេខា, បណ្ណារក្ស, គ្រូ, សិស្ស</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">ស្វែងរកពាក្យសម្ងាត់ឆ្លាតវៃ</h4>
                  <p className="text-[11px] text-slate-500">Auto-Approval & ដំណឹងជូនគ្រូបន្ទុកថ្នាក់</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">ស្រង់ពិន្ទុ & ចំណាត់ថ្នាក់</h4>
                  <p className="text-[11px] text-slate-500">៦មុខវិជ្ជាស្នូល ស្របតាមស្តង់ដារក្រសួង</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">ប័ណ្ណសិស្ស QR & របាយការណ៍</h4>
                  <p className="text-[11px] text-slate-500">បោះពុម្ពប័ណ្ណសរសើរ និងបញ្ជីវត្តមាន</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Facebook-Style Login Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xl shadow-slate-200/50">
              
              {/* Form Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
                  <School className="w-7 h-7" />
                </div>
                <h2 className="font-moul text-lg text-slate-800">ចូលប្រើប្រាស់ប្រព័ន្ធ</h2>
                <p className="text-xs text-slate-500 mt-1">សូមបញ្ចូលគណនីអ៊ីមែល ឬអត្តលេខសិស្ស</p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    អ៊ីមែល / ឈ្មោះអ្នកប្រើប្រាស់ / អត្តលេខ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="ឧ. limsorn9@gmail.com ឬ STU-2024-001"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-times text-slate-800 placeholder:font-battambang"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">ពាក្យសម្ងាត់</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecoveryModal(true);
                        setRecoveryResult(null);
                      }}
                      className="text-xs text-blue-700 hover:text-blue-800 font-semibold hover:underline"
                    >
                      ភ្លេចពាក្យសម្ងាត់?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-times text-slate-800"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ចូលប្រព័ន្ធ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Google / Gmail Direct Sign In Button */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-500 font-medium">ឬ (ភ្ជាប់តាម Gmail)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>ចូលតាម Google / Gmail (គ្មានលេខទូរស័ព្ទ)</span>
                </button>

                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/70 flex items-start gap-2 text-[11px] text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>ករណីគ្មានលេខទូរស័ព្ទ៖</strong> ភ្ញៀវ មាតាបិតា ឬគ្រូបង្រៀនដែលពុំទាន់មានលេខទូរស័ព្ទក្នុងបញ្ជី អាចចុចភ្ជាប់ជាមួយ <strong>Gmail</strong> ដើម្បីចូលប្រើប្រាស់បានភ្លាមៗ!
                  </span>
                </div>
              </form>

              {/* Quick Role-based Demo Login Badges */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
                  ឬ សាកល្បងចូលតាមតួនាទី (Quick Role Demo)
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('director')}
                    className="p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-bold flex flex-col items-center gap-1 transition-all"
                  >
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>នាយកសាលា</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('secretary')}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex flex-col items-center gap-1 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>លេខាធិការ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('librarian')}
                    className="p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-bold flex flex-col items-center gap-1 transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>បណ្ណារក្ស</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('teacher')}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex flex-col items-center gap-1 transition-all"
                  >
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>គ្រូបង្រៀន</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student')}
                    className="p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 text-xs font-bold flex flex-col items-center gap-1 transition-all col-span-2 sm:col-span-1"
                  >
                    <GraduationCap className="w-4 h-4 text-purple-700" />
                    <span>សិស្ស (STU-001)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500">
        <p>© ២០២៤-២០២៥ {schoolProfile.nameKhmer} • អភិវឌ្ឍឡើងស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)</p>
      </footer>

      {/* Smart Password Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm text-slate-800">ស្វែងរកពាក្យសម្ងាត់ឆ្លាតវៃ</h3>
                  <p className="text-[11px] text-slate-500 font-battambang">Smart Recovery & Auto-Approval Rule</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Role Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-4 gap-1">
              <button
                type="button"
                onClick={() => {
                  setRecoveryRole('teacher');
                  setRecoveryResult(null);
                }}
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                  recoveryRole === 'teacher'
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                គ្រូបង្រៀន (Teacher)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryRole('student');
                  setRecoveryResult(null);
                }}
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                  recoveryRole === 'student'
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                សិស្សានុសិស្ស (Student)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryRole('google');
                  setRecoveryResult(null);
                }}
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                  recoveryRole === 'google'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                តាម Gmail (គ្មានលេខទូរស័ព្ទ)
              </button>
            </div>

            {recoveryResult && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                  recoveryResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {recoveryResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                )}
                <span>{recoveryResult.message}</span>
              </div>
            )}

            {/* Teacher Recovery Form */}
            {recoveryRole === 'teacher' ? (
              <form onSubmit={handleTeacherRecovery} className="space-y-3">
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
                  <strong>លក្ខខណ្ឌអនុម័តស្វ័យប្រវត្តិ (Auto-Approval Rule)៖</strong>
                  <p className="mt-0.5 text-blue-800">
                    បញ្ចូលលេខទូរស័ព្ទ (ឬទុកទំនេរប្រសិនបើគ្មាន) អ៊ីមែល និងលេខកូដសាលារៀន (School Code: <span className="font-times font-bold">{schoolProfile.schoolCode}</span>) ឲ្យបានត្រឹមត្រូវដើម្បីប្តូរពាក្យសម្ងាត់ភ្លាមៗ។
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    អ៊ីមែលលោកគ្រូ-អ្នកគ្រូ *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={e => setTeacherEmail(e.target.value)}
                      placeholder="ឧ. vuthy.chan@moeys.gov.kh"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លេខទូរស័ព្ទ <span className="text-slate-400 font-normal">(ស្រេចចិត្ត / ប្រសិនបើមាន)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={teacherPhone}
                      onChange={e => setTeacherPhone(e.target.value)}
                      placeholder="ឧ. 017 890 123 (ឬទុកទំនេរ)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លេខកូដសាលារៀន (School Code) *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={teacherSchoolCode}
                      onChange={e => setTeacherSchoolCode(e.target.value)}
                      placeholder={`បញ្ចូលកូដ: ${schoolProfile.schoolCode}`}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ពាក្យសម្ងាត់ថ្មី (New Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={teacherNewPassword}
                      onChange={e => setTeacherNewPassword(e.target.value)}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs"
                  >
                    ផ្ទៀងផ្ទាត់ & កំណត់ឡើងវិញភ្លាមៗ
                  </button>
                </div>
              </form>
            ) : recoveryRole === 'student' ? (
              /* Student Recovery Form */
              <form onSubmit={handleStudentRecovery} className="space-y-3">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-[11px] text-emerald-900 leading-relaxed">
                  <strong>លក្ខខណ្ឌកំណត់ពាក្យសម្ងាត់សិស្ស (Student Reset Rule)៖</strong>
                  <p className="mt-0.5 text-emerald-800">
                    បញ្ចូលឈ្មោះខ្មែរពេញ និងអត្តលេខសិស្ស (Student ID e.g. <span className="font-times font-bold">STU-2024-001</span>)។ ប្រព័ន្ធនឹងអនុញ្ញាតឲ្យប្តូរពាក្យសម្ងាត់ និងផ្ញើសារដំណឹងជូនលោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់ដោយស្វ័យប្រវត្តិ។
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    គោត្តនាម និងនាមសិស្ស (ឈ្មោះជាភាសាខ្មែរ)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={studentNameKhmer}
                      onChange={e => setStudentNameKhmer(e.target.value)}
                      placeholder="ឧ. សុខ តារា"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    អត្តលេខសិស្ស (Student ID Code)
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={studentCode}
                      onChange={e => setStudentCode(e.target.value)}
                      placeholder="ឧ. STU-2024-001"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ពាក្យសម្ងាត់ថ្មី (New Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={studentNewPassword}
                      onChange={e => setStudentNewPassword(e.target.value)}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                  >
                    ប្តូរពាក្យសម្ងាត់ & ផ្ញើដំណឹងជូនគ្រូ
                  </button>
                </div>
              </form>
            ) : (
              /* Google / Gmail Recovery Form */
              <div className="space-y-4">
                <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 text-[11px] text-indigo-900 leading-relaxed">
                  <strong>ផ្ទៀងផ្ទាត់រហ័សតាមរយៈគណនី Google / Gmail (គ្មានលេខទូរស័ព្ទ)៖</strong>
                  <p className="mt-1 text-indigo-800">
                    សម្រាប់ភ្ញៀវ មាតាបិតា ឬលោកគ្រូ-អ្នកគ្រូដែលពុំមានលេខទូរស័ព្ទ លោកអ្នកអាចចុចផ្ទៀងផ្ទាត់តាម Google OAuth Popup ដើម្បីចូលប្រើប្រាស់ ឬកំណត់ពាក្យសម្ងាត់ឡើងវិញភ្លាមៗ។
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ពាក្យសម្ងាត់ថ្មីដែលចង់កំណត់ <span className="text-slate-400 font-normal">(ស្រេចចិត្ត)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={googleNewPassword}
                      onChange={e => setGoogleNewPassword(e.target.value)}
                      placeholder="•••••••• (ស្រេចចិត្ត)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-times focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleRecovery}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-sm hover:border-slate-400 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>ផ្ទៀងផ្ទាត់ & កំណត់ឡើងវិញជាមួយ Google Account</span>
                </button>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    បិទផ្ទាំង
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
