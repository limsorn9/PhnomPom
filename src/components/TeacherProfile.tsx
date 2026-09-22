import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Teacher } from '../types';
import { AddressSelector } from './common/AddressSelector';
import {
  User,
  Camera,
  FileSignature,
  School,
  Award,
  Key,
  Bell,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Shield,
  Send,
  Building,
  Upload,
  Calendar,
  Phone,
  Mail,
  Hash,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const TeacherProfile: React.FC = () => {
  const {
    currentUser,
    teachers,
    updateTeacher,
    schoolProfile,
    updateSchoolProfile,
    updateUserPassword,
    showToast
  } = useSchool();

  // Find matching teacher record
  const currentTeacher = teachers.find(
    t => (currentUser?.staffCode && t.staffCode === currentUser.staffCode) ||
         (currentUser?.email && t.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
         t.nameKhmer === currentUser?.nameKhmer
  ) || teachers[0];

  // 1. Avatar & Signature States
  const [avatarUrl, setAvatarUrl] = useState<string>(
    currentUser?.avatarUrl || currentTeacher?.avatarUrl || ''
  );
  const [signatureUrl, setSignatureUrl] = useState<string>(
    currentTeacher?.signatureUrl || localStorage.getItem('teacher_signature_url') || ''
  );

  // 2. Personal & Civil Servant details
  const [lastName, setLastName] = useState<string>(() => {
    const parts = (currentTeacher?.nameKhmer || currentUser?.nameKhmer || 'លីម សន').split(/\s+/);
    return parts[0] || 'លីម';
  });
  const [firstName, setFirstName] = useState<string>(() => {
    const parts = (currentTeacher?.nameKhmer || currentUser?.nameKhmer || 'លីម សន').split(/\s+/);
    return parts.slice(1).join(' ') || 'សន';
  });
  const [gender, setGender] = useState<string>(currentTeacher?.gender || 'M');
  const [dob, setDob] = useState<string>(currentTeacher?.dob || '1985-05-15');
  const [nationality, setNationality] = useState<string>('ខ្មែរ');
  const [ethnicity, setEthnicity] = useState<string>('ខ្មែរ');
  const [disability, setDisability] = useState<string>('គ្មាន');

  // Account details
  const [email, setEmail] = useState<string>(currentUser?.email || currentTeacher?.email || 'limsorn9@gmail.com');
  const [phone, setPhone] = useState<string>(currentUser?.phone || currentTeacher?.phone || '012121212');
  const [idCardNumber, setIdCardNumber] = useState<string>(currentTeacher?.idCardNumber || '021001080');
  const [idCardExpiry, setIdCardExpiry] = useState<string>(currentTeacher?.idCardExpiryDate || '2030-12-31');

  // Employment details
  const [specialization, setSpecialization] = useState<string>(currentTeacher?.specialization || 'គរុកោសល្យបឋម');
  const [assignedGrade, setAssignedGrade] = useState<number>(currentTeacher?.assignedGrade || 6);
  const [assignedSection, setAssignedSection] = useState<string>(currentTeacher?.assignedSection || 'ក');
  const [staffCode, setStaffCode] = useState<string>(currentTeacher?.staffCode || currentUser?.staffCode || 'MOEYS-100234');
  const [startDate, setStartDate] = useState<string>(currentTeacher?.startDate || '2010-10-01');
  const [shift, setShift] = useState<string>(currentTeacher?.teachingShift || 'ពេញមួយថ្ងៃ');

  // Civil servant details
  const [civilServiceNumber, setCivilServiceNumber] = useState<string>(currentTeacher?.civilServiceNumber || '19850515001');
  const [civilServicePosition, setCivilServicePosition] = useState<string>(currentTeacher?.role || 'គ្រូបង្រៀនកម្រិតឧត្តម');
  const [civilServiceFramework, setCivilServiceFramework] = useState<string>(currentTeacher?.civilServiceFramework || 'ក្របខ័ណ្ឌគ្រូបឋមសិក្សា');
  const [salaryIndex, setSalaryIndex] = useState<string>(currentTeacher?.salaryIndex || 'ក.១.៤');
  const [appointmentRef, setAppointmentRef] = useState<string>(currentTeacher?.appointmentLetterRef || 'ប្រកាសលេខ ៤៥២ អយក.ប្រក');

  // Addresses (4 levels)
  const [pobProvince, setPobProvince] = useState<string>(currentTeacher?.pobProvince || 'បាត់ដំបង');
  const [pobDistrict, setPobDistrict] = useState<string>(currentTeacher?.pobDistrict || 'ភ្នំព្រឹក');
  const [pobCommune, setPobCommune] = useState<string>(currentTeacher?.pobCommune || 'ភ្នំព្រឹក');
  const [pobVillage, setPobVillage] = useState<string>(currentTeacher?.pobVillage || 'ភ្នំព្រឹក');

  const [currProvince, setCurrProvince] = useState<string>(currentTeacher?.currentProvince || 'បាត់ដំបង');
  const [currDistrict, setCurrDistrict] = useState<string>(currentTeacher?.currentDistrict || 'ភ្នំព្រឹក');
  const [currCommune, setCurrCommune] = useState<string>(currentTeacher?.currentCommune || 'ភ្នំព្រឹក');
  const [currVillage, setCurrVillage] = useState<string>(currentTeacher?.currentVillage || 'ភ្នំព្រឹក');

  // 3. Official Report Header Settings
  const [schoolCode, setSchoolCode] = useState<string>(schoolProfile.schoolCode || '02100108027');
  const [schoolNameKhmer, setSchoolNameKhmer] = useState<string>(schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំព្រឹក');
  const [principalName, setPrincipalName] = useState<string>(schoolProfile.principalName || 'លីម សន');
  const [provincialDoe, setProvincialDoe] = useState<string>(schoolProfile.provinceOffice || 'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង');
  const [districtPoe, setDistrictPoe] = useState<string>(schoolProfile.districtOffice || 'ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកភ្នំព្រឹក');
  const [schoolLogo, setSchoolLogo] = useState<string>(schoolProfile.logoUrl || '');
  const [schoolStamp, setSchoolStamp] = useState<string>(schoolProfile.stampUrl || '');

  // 4. Grading Scale Configuration
  const [gradingScaleType, setGradingScaleType] = useState<'khmer4' | 'intl6'>('khmer4');
  const [khmerExcellent, setKhmerExcellent] = useState<number>(80);
  const [khmerVeryGood, setKhmerVeryGood] = useState<number>(65);
  const [khmerAverage, setKhmerAverage] = useState<number>(50);

  const [intlA, setIntlA] = useState<number>(90);
  const [intlB, setIntlB] = useState<number>(80);
  const [intlC, setIntlC] = useState<number>(70);
  const [intlD, setIntlD] = useState<number>(60);
  const [intlE, setIntlE] = useState<number>(50);

  // 5. Telegram & Security
  const [isTelegramConnected, setIsTelegramConnected] = useState<boolean>(true);
  const [telegramChatId, setTelegramChatId] = useState<string>('718294829');
  const [isPasswordAccordionOpen, setIsPasswordAccordionOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Photo / Signature Upload Handlers
  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('ទំហំរូបថតត្រូវតូចជាង 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      showToast('បានផ្ទុករូបថត Profile ជោគជ័យ!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setSignatureUrl(res);
      localStorage.setItem('teacher_signature_url', res);
      showToast('បានផ្ទុកហត្ថលេខាឌីជីថល (PNG Transparent) ជោគជ័យ!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSchoolLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSchoolLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSchoolStamp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSchoolStamp(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Reset grading scale to default
  const handleResetGradingDefaults = () => {
    setKhmerExcellent(80);
    setKhmerVeryGood(65);
    setKhmerAverage(50);

    setIntlA(90);
    setIntlB(80);
    setIntlC(70);
    setIntlD(60);
    setIntlE(50);
    showToast('បានកំណត់កម្រិតនិទ្ទេសទៅតាមស្តង់ដារដើមរបស់ក្រសួង MoEYS រួចរាល់!', 'info');
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៦ តួអក្សរ!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ!', 'error');
      return;
    }
    if (currentUser) {
      updateUserPassword(currentUser.id, newPassword);
      showToast('បានផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordAccordionOpen(false);
    }
  };

  // Save All Profile Settings
  const handleSaveProfile = () => {
    const fullName = `${lastName.trim()} ${firstName.trim()}`;

    if (currentTeacher) {
      updateTeacher(currentTeacher.id, {
        nameKhmer: fullName,
        email,
        phone,
        staffCode,
        assignedGrade,
        assignedSection,
        specialization,
        teachingShift: shift,
        avatarUrl,
        signatureUrl,
        pobProvince,
        pobDistrict,
        pobCommune,
        pobVillage,
        currentProvince: currProvince,
        currentDistrict: currDistrict,
        currentCommune: currCommune,
        currentVillage: currVillage,
        civilServiceNumber,
        civilServiceFramework,
        salaryIndex,
        appointmentLetterRef: appointmentRef
      });
    }

    updateSchoolProfile({
      schoolCode,
      nameKhmer: schoolNameKhmer,
      principalName,
      provinceOffice: provincialDoe,
      districtOffice: districtPoe,
      logoUrl: schoolLogo || schoolProfile.logoUrl,
      stampUrl: schoolStamp || schoolProfile.stampUrl
    });

    // Save grading preferences in localStorage
    localStorage.setItem(
      'krou_digital_grading_scale',
      JSON.stringify({
        type: gradingScaleType,
        khmer: { excellent: khmerExcellent, veryGood: khmerVeryGood, average: khmerAverage },
        intl: { A: intlA, B: intlB, C: intlC, D: intlD, E: intlE }
      })
    );

    showToast('បានរក្សាទុកព័ត៌មាន Profile និងការកំណត់ទាំងអស់ដោយជោគជ័យ!', 'success');
  };

  return (
    <div className="space-y-6 font-battambang animate-fade-in pb-12 max-w-6xl mx-auto">
      
      {/* Page Title & Main Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl border border-blue-800/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-moul text-lg sm:text-xl">ព័ត៌មានគណនីគ្រូបង្រៀន (Teacher Profile)</h1>
            <p className="text-xs text-blue-200 mt-1">
              គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន ហត្ថលេខាឌីជីថល ព័ត៌មានមន្ត្រីរាជការ និងការកំណត់ក្បាលទំព័ររបាយការណ៍
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>✓ រក្សាទុកព័ត៌មាន</span>
        </button>
      </div>

      {/* 1. Avatar & Digital Signature */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold font-moul text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>១. រូបតំណាង Profile និងហត្ថលេខាឌីជីថល</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                រូបថតផ្ទាល់ខ្លួន (Profile Avatar)
              </h3>
              <p className="text-[11px] text-slate-500">
                ឯកសារប្រភេទ JPG, PNG (ទំហំអតិបរមា 2MB)
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <span>ប្តូររូបថត Profile</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleUploadAvatar}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Digital Signature Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-36 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm p-2">
              {signatureUrl ? (
                <img src={signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center text-slate-400">
                  <FileSignature className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-[10px] block">គ្មានហត្ថលេខា</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                ហត្ថលេខាឌីជីថល (Digital Signature)
              </h3>
              <p className="text-[11px] text-slate-500">
                ឯកសារ PNG ផ្ទៃថ្លា (Transparent) ដើម្បីបោះពុម្ពស្វ័យប្រវត្តិលើរបាយការណ៍ និងសន្លឹកពិន្ទុ
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload ហត្ថលេខា (PNG)</span>
                <input
                  type="file"
                  accept="image/png"
                  onChange={handleUploadSignature}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal & Civil Servant Details */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold font-moul text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-500" />
          <span>២. ព័ត៌មានលម្អិតគ្រូបង្រៀន និងមន្ត្រីរាជការ</span>
        </h2>

        {/* 2.1 Personal & Account Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              នាមត្រកូល (Last Name) *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              នាមខ្លួន (First Name) *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ភេទ (Gender)
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            >
              <option value="M">ប្រុស (Male)</option>
              <option value="F">ស្រី (Female)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ថ្ងៃខែឆ្នាំកំណើត (DOB)
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              អ៊ីមែល (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              លេខទូរស័ព្ទ (Phone)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              លេខអត្តសញ្ញាណប័ណ្ណ
            </label>
            <input
              type="text"
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ថ្ងៃផុតកំណត់អត្តសញ្ញាណប័ណ្ណ
            </label>
            <input
              type="date"
              value={idCardExpiry}
              onChange={(e) => setIdCardExpiry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>
        </div>

        {/* 2.2 Employment & Civil Servant Info */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block font-moul">
            ព័ត៌មានមុខតំណែង និងក្របខណ្ឌរដ្ឋ
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                អត្តលេខមន្ត្រីរាជការ
              </label>
              <input
                type="text"
                value={civilServiceNumber}
                onChange={(e) => setCivilServiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                លេខសម្គាល់គ្រូ (Staff Code)
              </label>
              <input
                type="text"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ក្របខណ្ឌ
              </label>
              <input
                type="text"
                value={civilServiceFramework}
                onChange={(e) => setCivilServiceFramework(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ថ្នាក់ និងកាំប្រាក់
              </label>
              <input
                type="text"
                value={salaryIndex}
                onChange={(e) => setSalaryIndex(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                មុខវិជ្ជាឯកទេស
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ថ្នាក់ និងបន្ទប់ទទួលបន្ទុក
              </label>
              <div className="flex gap-2">
                <select
                  value={assignedGrade}
                  onChange={(e) => setAssignedGrade(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                  ))}
                </select>
                <select
                  value={assignedSection}
                  onChange={(e) => setAssignedSection(e.target.value)}
                  className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  {['ក', 'ខ', 'គ', 'ឃ', 'ង'].map(s => (
                    <option key={s} value={s}>បន្ទប់ {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                វេនបង្រៀន
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="ពេញមួយថ្ងៃ">ពេញមួយថ្ងៃ</option>
                <option value="ព្រឹក">ព្រឹក</option>
                <option value="រសៀល">រសៀល</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                លេខ និងកាលបរិច្ឆេទប្រកាស
              </label>
              <input
                type="text"
                value={appointmentRef}
                onChange={(e) => setAppointmentRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 2.3 Addresses 4 levels */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block font-moul">
            ទីកន្លែងកំណើត និងទីលំនៅបច្ចុប្បន្ន (៤ កម្រិត)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                ទីកន្លែងកំណើត (ខេត្ត ➔ ស្រុក ➔ ឃុំ ➔ ភូមិ)
              </label>
              <AddressSelector
                prefix="teacher_pob"
                province={pobProvince}
                district={pobDistrict}
                commune={pobCommune}
                village={pobVillage}
                showSchoolSelector={false}
                onChange={(addr) => {
                  setPobProvince(addr.province);
                  setPobDistrict(addr.district);
                  setPobCommune(addr.commune);
                  setPobVillage(addr.village);
                }}
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                ទីលំនៅបច្ចុប្បន្ន (ខេត្ត ➔ ស្រុក ➔ ឃុំ ➔ ភូមិ)
              </label>
              <AddressSelector
                prefix="teacher_curr"
                province={currProvince}
                district={currDistrict}
                commune={currCommune}
                village={currVillage}
                showSchoolSelector={false}
                onChange={(addr) => {
                  setCurrProvince(addr.province);
                  setCurrDistrict(addr.district);
                  setCurrCommune(addr.commune);
                  setCurrVillage(addr.village);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Report Header Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold font-moul text-slate-900 dark:text-white flex items-center gap-2">
          <School className="w-4 h-4 text-emerald-500" />
          <span>៣. ការកំណត់ក្បាលទំព័ររបាយការណ៍ផ្លូវការ (Official Report Header)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              លេខកូដសាលា ១១ ខ្ទង់ (School Code)
            </label>
            <input
              type="text"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              placeholder="02100108027"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ឈ្មោះសាលារៀន (School Name)
            </label>
            <input
              type="text"
              value={schoolNameKhmer}
              onChange={(e) => setSchoolNameKhmer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ឈ្មោះ និងងារនាយកសាលា
            </label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត
            </label>
            <input
              type="text"
              value={provincialDoe}
              onChange={(e) => setProvincialDoe(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក
            </label>
            <input
              type="text"
              value={districtPoe}
              onChange={(e) => setDistrictPoe(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        {/* Upload Logo & Stamp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {schoolLogo ? (
                  <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <School className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Logo សាលារៀន</span>
                <span className="text-[11px] text-slate-500">PNG Transparent</span>
              </div>
            </div>
            <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer">
              Upload
              <input type="file" accept="image/png" onChange={handleUploadSchoolLogo} className="hidden" />
            </label>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {schoolStamp ? (
                  <img src={schoolStamp} alt="Stamp" className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-6 h-6 text-rose-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">ត្រាសាលារៀន (School Stamp)</span>
                <span className="text-[11px] text-slate-500">PNG Transparent</span>
              </div>
            </div>
            <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer">
              Upload
              <input type="file" accept="image/png" onChange={handleUploadSchoolStamp} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 4. Grading Scale Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold font-moul text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>៤. ការកំណត់កម្រិតពិន្ទុ និងនិទ្ទេស (Grading Scale)</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetGradingDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់ទៅស្តង់ដារដើមឡើងវិញ</span>
            </button>
          </div>
        </div>

        {/* Radio toggle */}
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="radio"
              name="gradingScale"
              checked={gradingScaleType === 'khmer4'}
              onChange={() => setGradingScaleType('khmer4')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>ខ្មែរ ៤ កម្រិត (ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ)</span>
          </label>

          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="radio"
              name="gradingScale"
              checked={gradingScaleType === 'intl6'}
              onChange={() => setGradingScaleType('intl6')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>អន្តរជាតិ ៦ កម្រិត (A, B, C, D, E, F)</span>
          </label>
        </div>

        {/* Inputs */}
        {gradingScaleType === 'khmer4' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                និទ្ទេស «ល្អ» (Excellent) ≥ (%)
              </label>
              <input
                type="number"
                value={khmerExcellent}
                onChange={(e) => setKhmerExcellent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
                និទ្ទេស «ល្អបង្គួរ» (Very Good) ≥ (%)
              </label>
              <input
                type="number"
                value={khmerVeryGood}
                onChange={(e) => setKhmerVeryGood(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                និទ្ទេស «មធ្យម» (Average) ≥ (%)
              </label>
              <input
                type="number"
                value={khmerAverage}
                onChange={(e) => setKhmerAverage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Grade A ≥ (%)</label>
              <input type="number" value={intlA} onChange={(e) => setIntlA(Number(e.target.value))} className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">Grade B ≥ (%)</label>
              <input type="number" value={intlB} onChange={(e) => setIntlB(Number(e.target.value))} className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">Grade C ≥ (%)</label>
              <input type="number" value={intlC} onChange={(e) => setIntlC(Number(e.target.value))} className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Grade D ≥ (%)</label>
              <input type="number" value={intlD} onChange={(e) => setIntlD(Number(e.target.value))} className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">Grade E ≥ (%)</label>
              <input type="number" value={intlE} onChange={(e) => setIntlE(Number(e.target.value))} className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold" />
            </div>
          </div>
        )}
      </div>

      {/* 5. Security & Notifications */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold font-moul text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span>៥. សុវត្ថិភាព និងការជូនដំណឹង (Security & Notifications)</span>
        </h2>

        {/* Telegram Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                ការភ្ជាប់ជាមួយ Telegram Bot ផ្ទាល់ខ្លួន
              </h3>
              <p className="text-[11px] text-slate-500">
                ទទួលការជូនដំណឹងស្វ័យប្រវត្តិនូវរាល់ពេលសិស្សសុំច្បាប់ វត្តមាន និងពិន្ទុ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isTelegramConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {isTelegramConnected ? '✓ បានភ្ជាប់ Telegram' : 'មិនទាន់ភ្ជាប់'}
            </span>
            <button
              onClick={() => setIsTelegramConnected(!isTelegramConnected)}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {isTelegramConnected ? 'ផ្តាច់ការតភ្ជាប់' : 'ភ្ជាប់ឥឡូវនេះ'}
            </button>
          </div>
        </div>

        {/* Password Accordion */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsPasswordAccordionOpen(!isPasswordAccordionOpen)}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់គណនី (Change Password)</span>
            </div>
            {isPasswordAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isPasswordAccordionOpen && (
            <form onSubmit={handleChangePassword} className="p-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ពាក្យសម្ងាត់ថ្មី (New Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="យ៉ាងតិច ៦ តួអក្សរ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="វាយបញ្ចូលម្តងទៀត"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  ផ្លាស់ប្តូរពាក្យសម្ងាត់
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};
