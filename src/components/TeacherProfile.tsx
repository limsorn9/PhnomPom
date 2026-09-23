import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  User, 
  Camera, 
  Save, 
  Shield, 
  Upload, 
  Calendar, 
  Phone, 
  Mail, 
  Hash,
  BookOpen,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { AddressSelector } from './common/AddressSelector';
import { getKhmerFullDate } from '../utils/khmerDateHelper';

export const TeacherProfile: React.FC = () => {
  const {
    currentUser,
    teachers,
    updateTeacher,
    schoolProfile,
    updateSchoolProfile,
    updateUserPassword,
    showToast,
    syncSchoolDataToFirestore,
    getFullSchoolPayload
  } = useSchool();

  // Find matching teacher record
  const currentTeacher = teachers.find(
    t => (currentUser?.staffCode && t.staffCode === currentUser.staffCode) ||
         (currentUser?.email && t.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
         t.nameKhmer === currentUser?.nameKhmer
  ) || teachers[0];

  // ============================================
  // 1. Avatar & Signature States
  // ============================================
  const [avatarUrl, setAvatarUrl] = useState<string>(
    currentUser?.avatarUrl || currentTeacher?.avatarUrl || ''
  );
  const [signatureUrl, setSignatureUrl] = useState<string>(
    currentTeacher?.signatureUrl || localStorage.getItem('teacher_signature_url') || ''
  );

  // ============================================
  // 2. Personal Information
  // ============================================
  const [lastName, setLastName] = useState<string>(currentTeacher?.lastNameKhmer || 'លីម');
  const [firstName, setFirstName] = useState<string>(currentTeacher?.firstNameKhmer || 'សន');
  const [gender, setGender] = useState<string>(currentTeacher?.gender || 'M');
  const [dob, setDob] = useState<string>(currentTeacher?.dob || '1985-05-15');
  const [nationality, setNationality] = useState<string>(currentTeacher?.nationality || 'ខ្មែរ');
  const [ethnicity, setEthnicity] = useState<string>(currentTeacher?.ethnicity || 'ខ្មែរ');
  const [disabilityType, setDisabilityType] = useState<string>(currentTeacher?.disabilityType || 'គ្មាន');

  // ============================================
  // 3. Account Information
  // ============================================
  const [email, setEmail] = useState<string>(currentUser?.email || currentTeacher?.email || 'limsorn9@gmail.com');
  const [phone, setPhone] = useState<string>(currentUser?.phone || currentTeacher?.phone || '012121212');
  const [idCardType, setIdCardType] = useState<'valid' | 'permanent'>(currentTeacher?.idCardType || 'valid');
  const [idCardNumber, setIdCardNumber] = useState<string>(currentTeacher?.nationalIdNumber || '021001080');
  const [idCardExpiry, setIdCardExpiry] = useState<string>(currentTeacher?.nationalIdExpiryDate || '2030-12-31');

  // ============================================
  // 4. Job & Civil Servant Information
  // ============================================
  const [teachingSubject, setTeachingSubject] = useState<string>(currentTeacher?.teachingSubject || 'គរុកោសល្យបឋម');
  const [gradeLevel, setGradeLevel] = useState<string>(currentTeacher?.assignedGrade?.toString() || '6');
  const [teacherId, setTeacherId] = useState<string>(currentTeacher?.teacherId || 'MOEYS-100234');
  const [joinDate, setJoinDate] = useState<string>(currentTeacher?.schoolPostingDate || '2010-10-01');
  const [teachingType, setTeachingType] = useState<string>(currentTeacher?.teachingType || 'ក្របខណ្ឌ');
  const [shift, setShift] = useState<string>(currentTeacher?.teachingShift || 'ពេញមួយថ្ងៃ');
  const [teacherStatus, setTeacherStatus] = useState<string>(currentTeacher?.status || 'active');
  
  const [civilId, setCivilId] = useState<string>(currentTeacher?.civilId || '19850515001');
  const [position, setPosition] = useState<string>(currentTeacher?.role || 'នាយកសាលា');
  const [functionRole, setFunctionRole] = useState<string>(currentTeacher?.functionRole || 'នាយកសាលា');
  const [jobType, setJobType] = useState<string>(currentTeacher?.jobType || 'គ្រូបង្រៀន');
  const [cadre, setCadre] = useState<string>(currentTeacher?.cadre || 'ក្របខ័ណ្ឌគ្រូបឋមសិក្សា');
  const [salaryGrade, setSalaryGrade] = useState<string>(currentTeacher?.salaryGrade || 'ក.១.៤');
  const [rankType, setRankType] = useState<string>(currentTeacher?.rankType || 'ថ្នាក់លេខ១');
  const [decreeNumber, setDecreeNumber] = useState<string>(currentTeacher?.decreeNumber || '៤៥២ អយក.ប្រក');
  const [decreeDate, setDecreeDate] = useState<string>(currentTeacher?.decreeDate || '2010-09-15');

  // ============================================
  // 5. Family & Address Information
  // ============================================
  const [maritalStatus, setMaritalStatus] = useState<string>(currentTeacher?.maritalStatus || 'រៀបការ');
  const [spouseName, setSpouseName] = useState<string>(currentTeacher?.spouseName || '');
  const [spouseJob, setSpouseJob] = useState<string>(currentTeacher?.spouseOccupation || '');
  const [spousePhone, setSpousePhone] = useState<string>(currentTeacher?.spousePhone || '');
  const [childrenCount, setChildrenCount] = useState<number>(currentTeacher?.childrenCount || 0);

  const [pobProvince, setPobProvince] = useState<string>(currentTeacher?.pobProvince || 'បាត់ដំបង');
  const [pobDistrict, setPobDistrict] = useState<string>(currentTeacher?.pobDistrict || 'ភ្នំព្រឹក');
  const [pobCommune, setPobCommune] = useState<string>(currentTeacher?.pobCommune || 'ភ្នំព្រឹក');
  const [pobVillage, setPobVillage] = useState<string>(currentTeacher?.pobVillage || 'ភ្នំព្រឹក');

  const [currProvince, setCurrProvince] = useState<string>(currentTeacher?.currentProvince || 'បាត់ដំបង');
  const [currDistrict, setCurrDistrict] = useState<string>(currentTeacher?.currentDistrict || 'ភ្នំព្រឹក');
  const [currCommune, setCurrCommune] = useState<string>(currentTeacher?.currentCommune || 'ភ្នំព្រឹក');
  const [currVillage, setCurrVillage] = useState<string>(currentTeacher?.currentVillage || 'ភ្នំព្រឹក');

  // ============================================
  // 6. School Information
  // ============================================
  const [schoolCode, setSchoolCode] = useState<string>(schoolProfile.schoolCode || '02100108027');
  const [schoolNameKhmer, setSchoolNameKhmer] = useState<string>(schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ');
  const [directorTitle, setDirectorTitle] = useState<string>(schoolProfile.directorTitle || 'នាយកសាលា');
  const [directorName, setDirectorName] = useState<string>(schoolProfile.principalName || 'លោក លីម សន');
  const [directorPhone, setDirectorPhone] = useState<string>(schoolProfile.principalPhone || '087 99 19 77');
  const [poeOffice, setPoeOffice] = useState<string>(schoolProfile.poeOffice || 'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង');
  const [doeOffice, setDoeOffice] = useState<string>(schoolProfile.doeOffice || 'ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកភ្នំព្រឹក');
  
  const [schoolLogo, setSchoolLogo] = useState<string>(schoolProfile.logoUrl || '');
  const [schoolStamp, setSchoolStamp] = useState<string>(schoolProfile.principalStampUrl || '');

  // ============================================
  // 7. Grading Thresholds
  // ============================================
  const [khmerExcellent, setKhmerExcellent] = useState<number>(80);
  const [khmerVeryGood, setKhmerVeryGood] = useState<number>(65);
  const [khmerAverage, setKhmerAverage] = useState<number>(50);
  const [khmerPoor, setKhmerPoor] = useState<number>(0);

  const [intlA, setIntlA] = useState<number>(90);
  const [intlB, setIntlB] = useState<number>(80);
  const [intlC, setIntlC] = useState<number>(70);
  const [intlD, setIntlD] = useState<number>(60);
  const [intlE, setIntlE] = useState<number>(50);

  // ============================================
  // Image Upload Handlers
  // ============================================
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, successMsg: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('ទំហំរូបភាពត្រូវតូចជាង 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
      showToast(successMsg, 'success');
    };
    reader.readAsDataURL(file);
  };

  // ============================================
  // Save Handler
  // ============================================
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const fullName = `${lastName.trim()} ${firstName.trim()}`;

    // Update Teacher Record
    if (currentTeacher) {
      updateTeacher(currentTeacher.id, {
        nameKhmer: fullName,
        lastNameKhmer: lastName,
        firstNameKhmer: firstName,
        gender: gender as any,
        dob,
        nationality,
        ethnicity,
        disabilityType,
        
        email,
        phone,
        idCardType,
        nationalIdNumber: idCardNumber,
        nationalIdExpiryDate: idCardExpiry,
        
        teachingSubject,
        assignedGrade: parseInt(gradeLevel) || 6,
        teacherId,
        schoolPostingDate: joinDate,
        teachingType,
        teachingShift: shift,
        status: teacherStatus as any,
        
        civilId,
        role: position,
        functionRole,
        jobType,
        cadre,
        salaryGrade,
        rankType,
        decreeNumber,
        decreeDate,

        maritalStatus,
        spouseName,
        spouseOccupation: spouseJob,
        spousePhone,
        childrenCount,

        pobProvince,
        pobDistrict,
        pobCommune,
        pobVillage,
        currentProvince: currProvince,
        currentDistrict: currDistrict,
        currentCommune: currCommune,
        currentVillage: currVillage,

        avatarUrl,
        signatureUrl,
      });
    }

    // Update School Profile
    updateSchoolProfile({
      schoolCode,
      nameKhmer: schoolNameKhmer,
      directorTitle,
      principalName: directorName,
      principalPhone: directorPhone,
      poeOffice,
      doeOffice,
      logoUrl: schoolLogo,
      principalStampUrl: schoolStamp
    });

    // Save Grading Preferences
    localStorage.setItem(
      'krou_digital_grading_scale',
      JSON.stringify({
        khmer: { excellent: khmerExcellent, veryGood: khmerVeryGood, average: khmerAverage, poor: khmerPoor },
        intl: { A: intlA, B: intlB, C: intlC, D: intlD, E: intlE }
      })
    );

    try {
      // Manual Sync to Firestore
      const payload = getFullSchoolPayload();
      const res = await syncSchoolDataToFirestore(payload, true);
      if (res.success) {
        showToast('បានរក្សាទុក និងបញ្ជូនទិន្នន័យទៅកាន់ Cloud ដោយជោគជ័យ!', 'success');
      } else {
        showToast('រក្សាទុកបានតែក្នុងម៉ាស៊ីន (Offline)។ បញ្ហា Cloud: ' + res.error, 'info');
      }
    } catch (e) {
      showToast('រក្សាទុកបានតែក្នុងម៉ាស៊ីន (Offline)។', 'info');
    }
    
    setIsSaving(false);
  };

  // Input Class (Kantumruy Pro & Glassmorphism)
  const inputClass = "w-full font-kantumruy bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition placeholder:text-slate-500";
  const labelClass = "block text-xs font-kantumruy text-slate-400 mb-1.5";

  return (
    <div className="bg-[#0b1329] text-slate-100 min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto pb-28">
      
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10 bg-[#0b1329]/90 backdrop-blur-md py-4 border-b border-slate-800">
        <div>
          <h1 className="font-moul text-xl text-white">កំណត់ត្រាព័ត៌មានគ្រូបង្រៀន</h1>
          <p className="text-sm font-kantumruy text-slate-400 mt-1">រៀបចំ និងគ្រប់គ្រងទិន្នន័យផ្ទាល់ខ្លួនសម្រាប់ការបោះពុម្ពរបាយការណ៍</p>
        </div>
        
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-kantumruy text-sm font-bold transition shadow-lg shadow-cyan-900/30 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកទិន្នន័យ'}</span>
        </button>
      </div>

      {/* TOP CARDS: AVATAR & SIGNATURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AVATAR CARD */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-700/30 border border-emerald-500/50 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-emerald-500" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full cursor-pointer shadow-lg transition">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/jpeg, image/png" onChange={e => handleUploadImage(e, setAvatarUrl, 'បានផ្ទុករូបថត Profile ជោគជ័យ!')} />
            </label>
          </div>
          <div>
            <h3 className="font-kantumruy font-bold text-slate-200">រូបថត Profile</h3>
            <p className="text-xs text-slate-400 mt-1">ទំហំគួរប៉ុនរូបថតកាត (4x6) ត្រឹមត្រូវ។ ទទួលយក JPG/PNG (Max 2MB)</p>
          </div>
        </div>

        {/* SIGNATURE CARD */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-6 justify-between">
          <div>
            <h3 className="font-kantumruy font-bold text-slate-200">ហត្ថលេខាគ្រូ</h3>
            <p className="text-xs text-slate-400 mt-1 mb-3">សម្រាប់បង្ហាញលើបាតរបាយការណ៍បោះពុម្ព។ (PNG ផ្ទៃថ្លាល្អបំផុត)</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl cursor-pointer text-sm font-kantumruy border border-slate-700 transition">
              <Upload className="w-4 h-4" />
              <span>ផ្ទុករូបហត្ថលេខា</span>
              <input type="file" className="hidden" accept="image/png" onChange={e => handleUploadImage(e, setSignatureUrl, 'បានផ្ទុកហត្ថលេខាជោគជ័យ!')} />
            </label>
          </div>
          <div className="w-32 h-16 border border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-800/50 overflow-hidden shrink-0">
            {signatureUrl ? (
              <img src={signatureUrl} alt="Signature" className="h-full object-contain" />
            ) : (
              <span className="text-xs text-slate-500 font-kantumruy">គ្មានទិន្នន័យ</span>
            )}
          </div>
        </div>
      </div>

      {/* FORM CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: PERSONAL INFO */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="font-moul text-sm text-slate-200">ព័ត៌មានផ្ទាល់ខ្លួន</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>នាមត្រកូល</label>
              <input type="text" className={inputClass} value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>នាមខ្លួន</label>
              <input type="text" className={inputClass} value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ភេទ</label>
              <select className={inputClass} value={gender} onChange={e => setGender(e.target.value)}>
                <option value="M">ប្រុស</option>
                <option value="F">ស្រី</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>ថ្ងៃខែឆ្នាំកំណើត</label>
              <input type="date" className={inputClass} value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>សញ្ជាតិ</label>
              <input type="text" className={inputClass} value={nationality} onChange={e => setNationality(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ជនជាតិ</label>
              <input type="text" className={inputClass} value={ethnicity} onChange={e => setEthnicity(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>ស្ថានភាពពិការភាព</label>
              <input type="text" className={inputClass} value={disabilityType} onChange={e => setDisabilityType(e.target.value)} />
            </div>
          </div>
        </div>

        {/* CARD 2: ACCOUNT INFO */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="font-moul text-sm text-slate-200">ព័ត៌មានគណនី</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>អ៊ីមែល</label>
              <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>លេខទូរស័ព្ទ</label>
              <input type="text" className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>ប្រភេទអត្តសញ្ញាណប័ណ្ណ</label>
              <select className={inputClass} value={idCardType} onChange={e => setIdCardType(e.target.value as any)}>
                <option value="valid">មានសុពលភាព</option>
                <option value="permanent">ប្រើបានមួយជីវិត</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>លេខអត្តសញ្ញាណប័ណ្ណ</label>
              <input type="text" className={inputClass} value={idCardNumber} onChange={e => setIdCardNumber(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ថ្ងៃផុតកំណត់</label>
              <input type="date" className={inputClass} value={idCardExpiry} onChange={e => setIdCardExpiry(e.target.value)} />
            </div>
          </div>
        </div>

        {/* CARD 3: JOB & CIVIL SERVANT */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="font-moul text-sm text-slate-200">ព័ត៌មានការងារ & មន្ត្រីរាជការ</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>មុខវិជ្ជាបង្រៀន</label>
              <input type="text" className={inputClass} value={teachingSubject} onChange={e => setTeachingSubject(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>កម្រិតថ្នាក់</label>
              <input type="text" className={inputClass} value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>អត្តលេខគ្រូ (Teacher ID)</label>
              <input type="text" className={inputClass} value={teacherId} onChange={e => setTeacherId(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ថ្ងៃចូលបម្រើការ</label>
              <input type="date" className={inputClass} value={joinDate} onChange={e => setJoinDate(e.target.value)} />
            </div>
            
            <div className="col-span-4 border-t border-slate-800 my-2"></div>

            <div>
              <label className={labelClass}>អត្តលេខមន្ត្រីរាជការ</label>
              <input type="text" className={inputClass} value={civilId} onChange={e => setCivilId(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>តួនាទី</label>
              <input type="text" className={inputClass} value={position} onChange={e => setPosition(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ឋានៈ (Rank)</label>
              <input type="text" className={inputClass} value={rankType} onChange={e => setRankType(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ក្របខណ្ឌ</label>
              <input type="text" className={inputClass} value={cadre} onChange={e => setCadre(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>កាំប្រាក់</label>
              <input type="text" className={inputClass} value={salaryGrade} onChange={e => setSalaryGrade(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>លេខប្រកាស</label>
              <input type="text" className={inputClass} value={decreeNumber} onChange={e => setDecreeNumber(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ថ្ងៃខែប្រកាស</label>
              <input type="date" className={inputClass} value={decreeDate} onChange={e => setDecreeDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>វេនបង្រៀន</label>
              <select className={inputClass} value={shift} onChange={e => setShift(e.target.value)}>
                <option value="ព្រឹក">ព្រឹក</option>
                <option value="រសៀល">រសៀល</option>
                <option value="ពេញមួយថ្ងៃ">ពេញមួយថ្ងៃ</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 4: FAMILY & ADDRESS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-pink-400" />
            <h2 className="font-moul text-sm text-slate-200">ព័ត៌មានគ្រួសារ & អាសយដ្ឋាន</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>ស្ថានភាពគ្រួសារ</label>
              <select className={inputClass} value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)}>
                <option value="នៅលីវ">នៅលីវ</option>
                <option value="រៀបការ">រៀបការរួច</option>
                <option value="ពោះម៉ាយ">ពោះម៉ាយ</option>
                <option value="មេម៉ាយ">មេម៉ាយ</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>ឈ្មោះប្តី/ប្រពន្ធ</label>
              <input type="text" className={inputClass} value={spouseName} onChange={e => setSpouseName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>មុខរបរប្តី/ប្រពន្ធ</label>
              <input type="text" className={inputClass} value={spouseJob} onChange={e => setSpouseJob(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>ចំនួនកូន</label>
              <input type="number" className={inputClass} value={childrenCount} onChange={e => setChildrenCount(parseInt(e.target.value) || 0)} />
            </div>

            <div className="col-span-2 md:col-span-4 border-t border-slate-800 my-2"></div>
            
            <div className="col-span-2">
              <label className={labelClass}>ទីកន្លែងកំណើត</label>
              <AddressSelector 
                province={pobProvince} setProvince={setPobProvince}
                district={pobDistrict} setDistrict={setPobDistrict}
                commune={pobCommune} setCommune={setPobCommune}
                village={pobVillage} setVillage={setPobVillage}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>ទីកន្លែងស្នាក់នៅបច្ចុប្បន្ន</label>
              <AddressSelector 
                province={currProvince} setProvince={setCurrProvince}
                district={currDistrict} setDistrict={setCurrDistrict}
                commune={currCommune} setCommune={setCurrCommune}
                village={currVillage} setVillage={setCurrVillage}
              />
            </div>
          </div>
        </div>

        {/* CARD 5: SCHOOL INFO (For Print Headers) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              <h2 className="font-moul text-sm text-slate-200">ព័ត៌មានសាលា (បង្ហាញលើក្បាលរបាយការណ៍)</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>លេខកូដសាលា (១១ ខ្ទង់)</label>
                <input type="text" className={inputClass} value={schoolCode} onChange={e => setSchoolCode(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>ឈ្មោះសាលា</label>
                <input type="text" className={inputClass} value={schoolNameKhmer} onChange={e => setSchoolNameKhmer(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>ងារនាយក</label>
                  <input type="text" className={inputClass} value={directorTitle} onChange={e => setDirectorTitle(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>ឈ្មោះនាយក</label>
                  <input type="text" className={inputClass} value={directorName} onChange={e => setDirectorName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>មន្ទីរអប់រំ យុវជន និងកីឡា (ខេត្ត)</label>
                <input type="text" className={inputClass} value={poeOffice} onChange={e => setPoeOffice(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>ការិយាល័យអប់រំ (ស្រុក)</label>
                <input type="text" className={inputClass} value={doeOffice} onChange={e => setDoeOffice(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="block font-kantumruy font-bold text-slate-300 text-sm mb-2">ស្លាកសញ្ញាសាលា (Logo)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    {schoolLogo ? <img src={schoolLogo} alt="Logo" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-slate-500">គ្មាន Logo</span>}
                  </div>
                  <label className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs cursor-pointer transition">
                    <Upload className="w-3 h-3 inline mr-1" /> ផ្ទុកថ្មី
                    <input type="file" className="hidden" accept="image/png" onChange={e => handleUploadImage(e, setSchoolLogo, 'ផ្ទុក Logo ជោគជ័យ')} />
                  </label>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="block font-kantumruy font-bold text-slate-300 text-sm mb-2">ត្រានាយកសាលា (Stamp)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    {schoolStamp ? <img src={schoolStamp} alt="Stamp" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-slate-500">គ្មានត្រា</span>}
                  </div>
                  <label className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs cursor-pointer transition">
                    <Upload className="w-3 h-3 inline mr-1" /> ផ្ទុកថ្មី
                    <input type="file" className="hidden" accept="image/png" onChange={e => handleUploadImage(e, setSchoolStamp, 'ផ្ទុកត្រាជោគជ័យ')} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 6: GRADING THRESHOLDS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <h2 className="font-moul text-sm text-slate-200">ភាគរយនិទ្ទេស (Grading Thresholds)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* KHMER GRADING */}
            <div>
              <h3 className="font-kantumruy font-bold text-slate-300 mb-3 pb-2 border-b border-slate-800">និទ្ទេសខ្មែរ (៤ ថ្នាក់)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">ល្អ (Excellent) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={khmerExcellent} onChange={e => setKhmerExcellent(Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">ល្អបង្គួរ (Very Good) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={khmerVeryGood} onChange={e => setKhmerVeryGood(Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">មធ្យម (Average) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={khmerAverage} onChange={e => setKhmerAverage(Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">ខ្សោយ (Poor) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={khmerPoor} onChange={e => setKhmerPoor(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* INTL GRADING */}
            <div>
              <h3 className="font-kantumruy font-bold text-slate-300 mb-3 pb-2 border-b border-slate-800">និទ្ទេសអង់គ្លេស (A-F)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">A (Excellent) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={intlA} onChange={e => setIntlA(Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">B (Very Good) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={intlB} onChange={e => setIntlB(Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">C (Good) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={intlC} onChange={e => setIntlC(Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">D (Satisfactory) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={intlD} onChange={e => setIntlD(Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-kantumruy text-slate-400">E (Pass) ≥</span>
                  <input type="number" className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-200" value={intlE} onChange={e => setIntlE(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
