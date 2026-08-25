import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Building2,
  Copy,
  Check,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { AngkorWatSilhouette, KhmerKbachCorner, MoEYSRoyalHeader } from './AngkorMotif';

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

  // Login Form States
  const [activeTab, setActiveTab] = useState<'staff' | 'student' | 'google'>('staff');
  const [identifier, setIdentifier] = useState('limsorn9@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Recovery Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryRole, setRecoveryRole] = useState<'teacher' | 'student' | 'google'>('teacher');

  // Teacher recovery form
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherSchoolCode, setTeacherSchoolCode] = useState(schoolProfile.schoolCode || '020401015');
  const [teacherNewPassword, setTeacherNewPassword] = useState('');

  // Student recovery form
  const [studentNameKhmer, setStudentNameKhmer] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentNewPassword, setStudentNewPassword] = useState('');

  // Google recovery form
  const [googleNewPassword, setGoogleNewPassword] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<{ success: boolean; message: string } | null>(null);

  // Live Current Date
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // Sync default input based on selected tab
  const handleTabChange = (tab: 'staff' | 'student' | 'google') => {
    setActiveTab(tab);
    setErrorMessage('');
    if (tab === 'staff') {
      setIdentifier('limsorn9@gmail.com');
      setPassword('password123');
    } else if (tab === 'student') {
      setIdentifier('STU-2024-001');
      setPassword('password123');
    } else if (tab === 'google') {
      setIdentifier('');
      setPassword('');
    }
  };

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
      } else {
        showToast(`ចូលប្រើប្រាស់ជោគជ័យ! សូមស្វាគមន៍មកកាន់ ${schoolProfile.nameKhmer}`, 'success');
      }
    }, 450);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        showToast('ចូលប្រើប្រាស់តាម Google បានជោគជ័យ!', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'បរាជ័យក្នុងការចូលប្រើជាមួយ Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    showToast(`កំពុងចូលប្រើប្រាស់ជាតួនាទី «${getRoleLabel(role)}»...`, 'info');
    switchUserRole(role);
  };

  const handleFillCredentials = (id: string, pass: string, tab: 'staff' | 'student') => {
    setActiveTab(tab);
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage('');
    showToast(`បានបញ្ចូលគណនីគំរូ៖ ${id}`, 'info');
  };

  const handleCopySchoolCode = () => {
    navigator.clipboard.writeText(schoolProfile.schoolCode);
    setCopiedCode(true);
    showToast(`បានចម្លងកូដសាលា៖ ${schoolProfile.schoolCode}`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'director':
        return 'នាយកសាលា';
      case 'secretary':
        return 'លេខាធិការ';
      case 'librarian':
        return 'បណ្ណារក្ស';
      case 'teacher':
        return 'គ្រូបង្រៀន';
      case 'student':
        return 'សិស្សានុសិស្ស';
      default:
        return role;
    }
  };

  // Recovery Handlers
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
        setActiveTab('staff');
        setIdentifier(teacherEmail);
        setPassword(teacherNewPassword);
      }, 1800);
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
        setActiveTab('student');
        setIdentifier(studentCode);
        setPassword(studentNewPassword);
      }, 1800);
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
        }, 1800);
      }
    } catch (err: any) {
      setRecoveryResult({ success: false, message: err?.message || 'បរាជ័យក្នុងការផ្ទៀងផ្ទាត់' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex flex-col justify-between font-battambang relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Background Angkor Silhouette & Decorative Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        
        {/* Centered Large Angkor Wat Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035]">
          <AngkorWatSilhouette className="w-[850px] h-[450px] text-white" />
        </div>

        {/* Traditional Khmer Corner Flairs */}
        <div className="hidden lg:block">
          <KhmerKbachCorner position="top-left" className="absolute top-2 left-2 w-28 h-28 opacity-20" color="#f59e0b" />
          <KhmerKbachCorner position="top-right" className="absolute top-2 right-2 w-28 h-28 opacity-20" color="#f59e0b" />
          <KhmerKbachCorner position="bottom-left" className="absolute bottom-2 left-2 w-28 h-28 opacity-20" color="#f59e0b" />
          <KhmerKbachCorner position="bottom-right" className="absolute bottom-2 right-2 w-28 h-28 opacity-20" color="#f59e0b" />
        </div>
      </div>

      {/* Top Header: Official MoEYS & School Info Bar */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Royal Emblem & School Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-blue-950 flex items-center justify-center font-moul text-sm shadow-md shadow-amber-500/20 font-bold border border-amber-200">
              អយក
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-700/50 px-2 py-0.5 rounded-md">
                  MoEYS • RBAC 2.0
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  ក្រសួងអប់រំ យុវជន និងកីឡា
                </span>
              </div>
              <h1 className="font-moul text-sm sm:text-base text-white leading-snug mt-0.5">
                {schoolProfile.nameKhmer}
              </h1>
            </div>
          </div>

          {/* Right: Academic Year, School Code & Help */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* School Code Pill */}
            <button
              type="button"
              onClick={handleCopySchoolCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 transition-all cursor-pointer group shadow-2xs"
              title="ចុចដើម្បីចម្លងកូដសាលា"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-slate-200 font-bold text-[11px]">{schoolProfile.schoolCode}</span>
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              )}
            </button>

            {/* Academic Year */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/70 border border-blue-800/60 text-xs text-blue-200">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>ឆ្នាំសិក្សា៖ <strong>{schoolProfile.academicYear}</strong></span>
            </div>

            {/* Help Button */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ជំនួយបច្ចេកទេស</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Center Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN: School Identity, Highlights & Quick Role Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* MoEYS Royal Emblem Header */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-200 text-xs font-bold mb-3 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សារដ្ឋឆ្លាតវៃ</span>
              </div>

              <h2 className="font-moul text-xl sm:text-2xl lg:text-3xl text-amber-400 leading-relaxed tracking-wide">
                {schoolProfile.nameKhmer}
              </h2>
              <p className="font-times text-sm sm:text-base text-slate-300 font-medium mt-1">
                {schoolProfile.nameLatin} • {schoolProfile.cluster}
              </p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                ទីតាំង៖ {schoolProfile.village} {schoolProfile.commune} {schoolProfile.district} {schoolProfile.province}
              </p>

              {/* 4 Feature Badges in 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
                <div className="p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">សិទ្ធិប្រើប្រាស់ RBAC</h4>
                    <p className="text-[11px] text-slate-400">នាយក, គ្រូ, លេខា, បណ្ណារក្ស, សិស្ស</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">ស្រង់ពិន្ទុ & វត្តមាន</h4>
                    <p className="text-[11px] text-slate-400">៦មុខវិជ្ជាស្នូល ស្របតាម MoEYS</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">ប័ណ្ណសិស្ស QR & កិត្តិយស</h4>
                    <p className="text-[11px] text-slate-400">បោះពុម្ពប័ណ្ណសរសើរស្វ័យប្រវត្តិ</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600/30 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">ស្តារពាក្យសម្ងាត់ឆ្លាតវៃ</h4>
                    <p className="text-[11px] text-slate-400">Auto-Approval & ជូនដំណឹងគ្រូ</p>
                  </div>
                </div>
              </div>
            </div>


          </motion.div>

          {/* RIGHT COLUMN: The High-End Modern Authentication Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-blue-950/40 relative overflow-hidden">
              
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500" />

              {/* Card Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3 border border-blue-400/30">
                  <School className="w-7 h-7" />
                </div>
                <h3 className="font-moul text-lg sm:text-xl text-white">ចូលប្រើប្រាស់ប្រព័ន្ធ</h3>
                <p className="text-xs text-slate-400 mt-1">
                  សូមជ្រើសរើសប្រភេទគណនី ឬចូលតាម Google / Gmail
                </p>
              </div>

              {/* 3 Main Login Mode Tabs */}
              <div className="flex rounded-2xl bg-slate-950/80 p-1.5 mb-5 border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => handleTabChange('staff')}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'staff'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>បុគ្គលិក / គ្រូ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('student')}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>សិស្សានុសិស្ស</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('google')}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'google'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                  <span>Google</span>
                </button>
              </div>

              {/* Error Message Display */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-950/80 border border-red-800/80 rounded-2xl text-red-200 text-xs flex items-start gap-2.5"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-300">បញ្ហាក្នុងការចូល៖</p>
                      <p className="mt-0.5">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Standard Email / Username / Password Form */}
              {activeTab !== 'google' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {activeTab === 'student' ? 'អត្តលេខសិស្ស (Student ID Code)' : 'អ៊ីមែល ឬ ឈ្មោះអ្នកប្រើប្រាស់'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        {activeTab === 'student' ? <Hash className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder={
                          activeTab === 'student'
                            ? 'ឧ. STU-2024-001 ឬ STU-2024-002'
                            : 'ឧ. limsorn9@gmail.com ឬ vuthy.chan@moeys.gov.kh'
                        }
                        className="w-full pl-10 pr-3 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs sm:text-sm focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder:text-slate-500 font-battambang"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300">ពាក្យសម្ងាត់</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRecoveryModal(true);
                          setRecoveryResult(null);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer"
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
                        className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs sm:text-sm focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder:text-slate-500 font-sans"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Auto-Fill Sample Chips */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-md bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span>ចងចាំការចូលប្រើប្រាស់</span>
                    </label>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span>គំរូ៖</span>
                      {activeTab === 'staff' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleFillCredentials('limsorn9@gmail.com', 'password123', 'staff')}
                            className="text-blue-400 hover:underline cursor-pointer"
                          >
                            នាយក
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleFillCredentials('vuthy.chan@moeys.gov.kh', 'password123', 'staff')}
                            className="text-emerald-400 hover:underline cursor-pointer"
                          >
                            គ្រូ៦ក
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleFillCredentials('STU-2024-001', 'password123', 'student')}
                            className="text-purple-400 hover:underline cursor-pointer"
                          >
                            STU-001
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleFillCredentials('STU-2024-002', 'password123', 'student')}
                            className="text-purple-400 hover:underline cursor-pointer"
                          >
                            STU-002
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>ចូលប្រព័ន្ធគ្រប់គ្រង</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Google Direct Login Tab Content */
                <div className="space-y-4 py-2">
                  <div className="p-4 bg-blue-950/70 border border-blue-800/70 rounded-2xl text-xs text-blue-200 leading-relaxed">
                    <p className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      ចូលប្រើប្រាស់ដោយផ្ទាល់តាមគណនី Google / Gmail
                    </p>
                    <p className="text-slate-300">
                      សម្រាប់លោកគ្រូ-អ្នកគ្រូ មាតាបិតា ឬភ្ញៀវកិត្តិយសដែលពុំទាន់មានគណនីក្នុងបញ្ជី ឬពុំមានលេខទូរស័ព្ទ លោកអ្នកអាចភ្ជាប់តាមរយៈ <strong>Gmail</strong> បានភ្លាមៗដោយសុវត្ថិភាព។
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-sm rounded-2xl border border-slate-300 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                  >
                    {isGoogleLoading ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                        <span>ចូលតាមរយៈ Google Account</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Bottom Quick Help Contact */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ទូរស័ព្ទនាយក៖ <strong>{schoolProfile.principalPhone}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-blue-400 hover:underline cursor-pointer"
                >
                  ព័ត៌មានបន្ថែម
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950/80 border-t border-slate-800/80 py-3 px-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© ២០២៤-២០២៥ {schoolProfile.nameKhmer} • អភិវឌ្ឍឡើងស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>សុវត្ថិភាពទិន្នន័យ RBAC</span>
            <span>•</span>
            <span>Cloud Sync</span>
          </div>
        </div>
      </footer>

      {/* 1. Smart Password Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 text-slate-100 relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm sm:text-base text-white">ស្វែងរកពាក្យសម្ងាត់ឆ្លាតវៃ</h3>
                  <p className="text-[11px] text-slate-400 font-battambang">Smart Recovery & Auto-Approval Rule</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Role Tabs */}
            <div className="flex rounded-2xl bg-slate-950 p-1.5 mb-4 gap-1 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRecoveryRole('teacher');
                  setRecoveryResult(null);
                }}
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  recoveryRole === 'teacher'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  recoveryRole === 'student'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  recoveryRole === 'google'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                តាម Gmail
              </button>
            </div>

            {recoveryResult && (
              <div
                className={`mb-4 p-3 rounded-2xl text-xs flex items-start gap-2.5 border ${
                  recoveryResult.success
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                    : 'bg-red-950/80 border-red-800 text-red-200'
                }`}
              >
                {recoveryResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                )}
                <span>{recoveryResult.message}</span>
              </div>
            )}

            {/* Teacher Recovery Form */}
            {recoveryRole === 'teacher' ? (
              <form onSubmit={handleTeacherRecovery} className="space-y-3">
                <div className="bg-blue-950/60 border border-blue-800/60 rounded-2xl p-3 text-[11px] text-blue-200 leading-relaxed">
                  <strong>លក្ខខណ្ឌអនុម័តស្វ័យប្រវត្តិ (Auto-Approval Rule)៖</strong>
                  <p className="mt-0.5 text-slate-300">
                    បញ្ចូលលេខទូរស័ព្ទ (ឬទុកទំនេរប្រសិនបើគ្មាន) អ៊ីមែល និងលេខកូដសាលារៀន (School Code: <span className="font-mono text-amber-400 font-bold">{schoolProfile.schoolCode}</span>) ឲ្យបានត្រឹមត្រូវដើម្បីប្តូរពាក្យសម្ងាត់ភ្លាមៗ។
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    អ៊ីមែលលោកគ្រូ-អ្នកគ្រូ *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={e => setTeacherEmail(e.target.value)}
                      placeholder="ឧ. vuthy.chan@moeys.gov.kh"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      លេខទូរស័ព្ទ <span className="text-slate-500 font-normal">(ស្រេចចិត្ត)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={teacherPhone}
                        onChange={e => setTeacherPhone(e.target.value)}
                        placeholder="017 890 123"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      លេខកូដសាលារៀន *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={teacherSchoolCode}
                        onChange={e => setTeacherSchoolCode(e.target.value)}
                        placeholder={`កូដ: ${schoolProfile.schoolCode}`}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ពាក្យសម្ងាត់ថ្មី (New Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={teacherNewPassword}
                      onChange={e => setTeacherNewPassword(e.target.value)}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer"
                  >
                    ផ្ទៀងផ្ទាត់ & កំណត់ឡើងវិញភ្លាមៗ
                  </button>
                </div>
              </form>
            ) : recoveryRole === 'student' ? (
              /* Student Recovery Form */
              <form onSubmit={handleStudentRecovery} className="space-y-3">
                <div className="bg-purple-950/60 border border-purple-800/60 rounded-2xl p-3 text-[11px] text-purple-200 leading-relaxed">
                  <strong>លក្ខខណ្ឌកំណត់ពាក្យសម្ងាត់សិស្ស (Student Reset Rule)៖</strong>
                  <p className="mt-0.5 text-slate-300">
                    បញ្ចូលឈ្មោះខ្មែរពេញ និងអត្តលេខសិស្ស (ឧ. <span className="font-mono text-purple-300 font-bold">STU-2024-001</span>)។ ប្រព័ន្ធនឹងអនុញ្ញាតឲ្យប្តូរពាក្យសម្ងាត់ និងផ្ញើសារដំណឹងជូនលោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់ដោយស្វ័យប្រវត្តិ។
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    គោត្តនាម និងនាមសិស្ស (ឈ្មោះជាភាសាខ្មែរ)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={studentNameKhmer}
                      onChange={e => setStudentNameKhmer(e.target.value)}
                      placeholder="ឧ. សុខ តារា"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    អត្តលេខសិស្ស (Student ID Code)
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={studentCode}
                      onChange={e => setStudentCode(e.target.value)}
                      placeholder="ឧ. STU-2024-001"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ពាក្យសម្ងាត់ថ្មី (New Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={studentNewPassword}
                      onChange={e => setStudentNewPassword(e.target.value)}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md cursor-pointer"
                  >
                    ប្តូរពាក្យសម្ងាត់ & ផ្ញើដំណឹងជូនគ្រូ
                  </button>
                </div>
              </form>
            ) : (
              /* Google Recovery Form */
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-[11px] text-slate-300 leading-relaxed">
                  <strong>ផ្ទៀងផ្ទាត់រហ័សតាមរយៈ Google Account៖</strong>
                  <p className="mt-1 text-slate-400">
                    សម្រាប់អ្នកប្រើប្រាស់ដែលពុំមានលេខទូរស័ព្ទ ឬភ្លេចពាក្យសម្ងាត់ លោកអ្នកអាចចុចផ្ទៀងផ្ទាត់តាម Google OAuth Popup ដើម្បីចូលប្រើប្រាស់ ឬកំណត់ពាក្យសម្ងាត់ឡើងវិញភ្លាមៗ។
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ពាក្យសម្ងាត់ថ្មីដែលចង់កំណត់ <span className="text-slate-500 font-normal">(ស្រេចចិត្ត)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={googleNewPassword}
                      onChange={e => setGoogleNewPassword(e.target.value)}
                      placeholder="•••••••• (ស្រេចចិត្ត)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleRecovery}
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-2xl border border-slate-300 shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
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
                  <span>ផ្ទៀងផ្ទាត់ & កំណត់ឡើងវិញជាមួយ Google</span>
                </button>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    បិទផ្ទាំង
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* 2. Technical Support & Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-moul text-sm text-white">ព័ត៌មាន & ជំនួយបច្ចេកទេស</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <p className="font-bold text-white">សាលាបឋមសិក្សាភ្នំពុំ (MoEYS)</p>
                <p className="text-slate-400">លេខកូដសាលា៖ <span className="font-mono text-amber-400 font-bold">{schoolProfile.schoolCode}</span></p>
                <p className="text-slate-400">នាយកសាលា៖ {schoolProfile.principalName} ({schoolProfile.principalPhone})</p>
                <p className="text-slate-400">អ៊ីមែល៖ {schoolProfile.email}</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/60 border border-blue-800/60 space-y-1 text-blue-200">
                <p className="font-bold text-blue-300">គណនីសាកល្បងលំនាំដើម (Default Demo Credentials)៖</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                  <li>នាយកសាលា៖ <code className="text-amber-300">limsorn9@gmail.com</code> / <code className="text-slate-300">password123</code></li>
                  <li>គ្រូបង្រៀន៖ <code className="text-emerald-300">vuthy.chan@moeys.gov.kh</code> / <code className="text-slate-300">password123</code></li>
                  <li>សិស្សានុសិស្ស៖ <code className="text-purple-300">STU-2024-001</code> / <code className="text-slate-300">password123</code></li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                យល់ព្រម
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
