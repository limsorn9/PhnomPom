import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, Gender } from '../types';
import { AdministrativeAddressSelect, AddressState } from './common/AdministrativeAddressSelect';
import {
  X,
  UserPlus,
  Camera,
  Check,
  Calendar,
  Phone,
  MapPin,
  HeartPulse,
  BookOpen,
  ShieldAlert,
  Users,
  Sparkles,
  Upload,
  Info
} from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: number;
  defaultSection?: string;
  onStudentAdded?: (student: Student) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  defaultGrade = 1,
  defaultSection = 'ក',
  onStudentAdded
}) => {
  const { addStudent, students, selectedAcademicYear, showToast } = useSchool();

  // 1. Basic Student Info
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [studentCode, setStudentCode] = useState(() => {
    return `STU-${String(students.length + 1).padStart(3, '0')}`;
  });
  const [academicRecordNumber, setAcademicRecordNumber] = useState('');
  const [grade, setGrade] = useState<number>(defaultGrade);
  const [section, setSection] = useState<string>(defaultSection);
  const [gender, setGender] = useState<Gender>('M');
  const [dob, setDob] = useState('2016-01-01');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('ខ្មែរ');
  const [ethnicity, setEthnicity] = useState('ខ្មែរ');
  const [status, setStatus] = useState<string>('កំពុងសិក្សា');
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // 2. Addresses (4 levels)
  const [pobProvince, setPobProvince] = useState('');
  const [pobDistrict, setPobDistrict] = useState('');
  const [pobCommune, setPobCommune] = useState('');
  const [pobVillage, setPobVillage] = useState('');

  const [currProvince, setCurrProvince] = useState('');
  const [currDistrict, setCurrDistrict] = useState('');
  const [currCommune, setCurrCommune] = useState('');
  const [currVillage, setCurrVillage] = useState('');
  const [specialCharacteristics, setSpecialCharacteristics] = useState('');

  // 3. Academic & Special Support
  const [previousGrade, setPreviousGrade] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [disabilityType, setDisabilityType] = useState('គ្មាន');
  const [supportReadingKit, setSupportReadingKit] = useState(false);
  const [supportMathKit, setSupportMathKit] = useState(false);
  const [supportKhmerBook, setSupportKhmerBook] = useState(false);

  // 4. STS Equity Indicators
  const [isPoorFamily, setIsPoorFamily] = useState<'yes' | 'no' | 'unasked'>('no');
  const [hasEquityCard, setHasEquityCard] = useState<'yes' | 'no' | 'unasked'>('no');

  // 5. Parents Info
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [fatherAddress, setFatherAddress] = useState('');

  const [motherName, setMotherName] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [motherAddress, setMotherAddress] = useState('');

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('ទំហំរូបថតត្រូវតែតូចជាង ឬស្មើ 3MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Mock fetch info from Academic Record Number
  const handleFetchStudentRecord = () => {
    if (!academicRecordNumber.trim()) {
      showToast('សូមបញ្ចូលលេខប្រវត្តិសិក្សាជាមុនសិន', 'warning');
      return;
    }
    showToast(`កំពុងទាញទិន្នន័យពីប្រព័ន្ធ MoEYS សម្រាប់លេខ ${academicRecordNumber}...`, 'info');
    setTimeout(() => {
      showToast('បានទាញទិន្នន័យសិស្សពីបណ្ណសារ MoEYS ដោយជោគជ័យ', 'success');
      setNationality('ខ្មែរ');
      setEthnicity('ខ្មែរ');
      setPreviousGrade('ថ្នាក់មត្តេយ្យ');
    }, 800);
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lastName.trim() || !firstName.trim()) {
      showToast('សូមបញ្ចូល «គោត្តនាម» និង «នាម» សិស្សជាចាំបាច់!', 'error');
      return;
    }

    const fullPob = [pobVillage, pobCommune, pobDistrict, pobProvince].filter(Boolean).join(' ') || 'ភ្នំព្រឹក បាត់ដំបង';
    const fullCurr = [currVillage, currCommune, currDistrict, currProvince].filter(Boolean).join(' ') || 'ភ្នំព្រឹក បាត់ដំបង';

    const specialSupportItems: string[] = [];
    if (supportReadingKit) specialSupportItems.push('កញ្ចប់សម្ភារអំណាន');
    if (supportMathKit) specialSupportItems.push('សម្ភារគណិត');
    if (supportKhmerBook) specialSupportItems.push('សៀវភៅជំនួយភាសាខ្មែរ');

    const newStudent: Student = {
      id: `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: studentCode,
      nameKhmer: `${lastName.trim()} ${firstName.trim()}`,
      lastNameKhmer: lastName.trim(),
      firstNameKhmer: firstName.trim(),
      nameLatin: '',
      gender,
      dob,
      grade,
      section,
      pob: fullPob,
      pobProvince,
      pobDistrict,
      pobCommune,
      pobVillage,
      address: fullCurr,
      phone,
      fatherName,
      fatherOccupation,
      motherName,
      motherOccupation,
      guardianName: fatherName || motherName || `${lastName.trim()} អាណាព្យាបាល`,
      guardianRelationship: fatherName ? 'ឪពុក' : (motherName ? 'ម្តាយ' : 'អាណាព្យាបាល'),
      guardianPhone: phone || fatherPhone || motherPhone || '',
      guardianOccupation: fatherOccupation || motherOccupation || 'កសិករ',
      livingCondition: isPoorFamily === 'yes' ? 'ក្រ១' : 'ទូទៅ',
      status: status as any,
      academicYear: selectedAcademicYear,
      avatarUrl: avatarPreview || undefined,
      specialNotes: [
        specialCharacteristics,
        specialSupportItems.length > 0 ? `ជំនួយ៖ ${specialSupportItems.join(', ')}` : '',
        hasEquityCard === 'yes' ? 'មានបណ្ណសមធម៌ (អាហារូបករណ៍ សន្លឹក ៦២)' : ''
      ].filter(Boolean).join(' | ')
    };

    addStudent(newStudent);
    showToast(`បានបញ្ចូលសិស្ស «${newStudent.nameKhmer}» ទៅក្នុងថ្នាក់ទី ${grade} «${section}» ដោយជោគជ័យ!`, 'success');
    if (onStudentAdded) onStudentAdded(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs font-battambang animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-base sm:text-lg">បន្ថែមសិស្សថ្មី (Add Student)</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                ទម្រង់ស្តង់ដារ MoEYS STS សម្រាប់ថ្នាក់ទី {grade} «{section}» · ឆ្នាំសិក្សា {selectedAcademicYear}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* SECTION 1: PHOTO & CORE IDENTITY */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-moul flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>១. រូបថតសិស្ស និងព័ត៌មានអត្តសញ្ញាណស្នូល</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Photo Upload Box */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-28 h-36 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-xs group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Student Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                      <span className="text-[10px] block">រូបថត (Avatar)</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-opacity">
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[10px] text-slate-500 text-center">JPG/PNG/WEBP ≤ 3MB</span>
              </div>

              {/* Identity Fields Grid */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    គោត្តនាម (Last Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="ឧ. សុខ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    នាម (First Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="ឧ. ចន្ថា"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខសម្គាល់សិស្ស (Student ID)
                  </label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Grade & Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    កម្រិតថ្នាក់ & បន្ទប់
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map(g => (
                        <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                      ))}
                    </select>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                    >
                      {['ក', 'ខ', 'គ', 'ឃ', 'ង'].map(s => (
                        <option key={s} value={s}>បន្ទប់ {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ភេទ (Gender) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('M')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        gender === 'M'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      ប្រុស
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('F')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        gender === 'F'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      ស្រី
                    </button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ថ្ងៃខែឆ្នាំកំណើត (DOB)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Academic Record Number with Fetch button */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខប្រវត្តិសិក្សា (សម្រាប់សិស្សផ្ទេរ)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={academicRecordNumber}
                      onChange={(e) => setAcademicRecordNumber(e.target.value)}
                      placeholder="ឧ. 02100108027-2024-0012"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleFetchStudentRecord}
                      className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold hover:bg-indigo-100 cursor-pointer shrink-0"
                    >
                      ទាញព័ត៌មាន
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ស្ថានភាពសិស្ស
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                  >
                    <option value="កំពុងសិក្សា">កំពុងសិក្សា</option>
                    <option value="ផ្ទេរចូល">ផ្ទេរចូល</option>
                    <option value="ផ្ទេរចេញ">ផ្ទេរចេញ</option>
                    <option value="ឈប់រៀន">ឈប់រៀន</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: 4-LEVEL ADDRESSES & SPECIAL CHARACTERISTICS */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-moul flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>២. ទីកន្លែងកំណើត និងអាសយដ្ឋានបច្ចុប្បន្ន (៤ កម្រិត)</span>
            </h4>

            {/* Birthplace Selector */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                ទីកន្លែងកំណើត (ខេត្ត/ក្រុង ➔ ស្រុក/ខណ្ឌ ➔ ឃុំ/សង្កាត់ ➔ ភូមិ)
              </label>
              <AdministrativeAddressSelect
                value={{
                  province: pobProvince,
                  district: pobDistrict,
                  commune: pobCommune,
                  village: pobVillage
                }}
                onChange={(addr: AddressState) => {
                  setPobProvince(addr.province);
                  setPobDistrict(addr.district);
                  setPobCommune(addr.commune);
                  setPobVillage(addr.village);
                }}
              />
            </div>

            {/* Current Address Selector */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                អាសយដ្ឋានបច្ចុប្បន្ន (ខេត្ត/ក្រុង ➔ ស្រុក/ខណ្ឌ ➔ ឃុំ/សង្កាត់ ➔ ភូមិ)
              </label>
              <AdministrativeAddressSelect
                value={{
                  province: currProvince,
                  district: currDistrict,
                  commune: currCommune,
                  village: currVillage
                }}
                onChange={(addr: AddressState) => {
                  setCurrProvince(addr.province);
                  setCurrDistrict(addr.district);
                  setCurrCommune(addr.commune);
                  setCurrVillage(addr.village);
                }}
              />
            </div>

            {/* Special Characteristics */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ប្រអប់ «លក្ខណៈពិសេស» (ចំណុចសម្គាល់ផ្ទាល់ខ្លួន / អាឡែកហ្ស៊ី)
              </label>
              <input
                type="text"
                value={specialCharacteristics}
                onChange={(e) => setSpecialCharacteristics(e.target.value)}
                placeholder="ឧ. មានស្លាកស្នាមពីកំណើត / អាឡែកហ្ស៊ីថ្នាំពេទ្យ"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 3: ACADEMIC & SPECIAL SUPPORT */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-moul flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>៣. ព័ត៌មានសិក្សា និងការគាំទ្រពិសេស (Academic & Special Support)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ថ្នាក់រៀនឆ្នាំមុន
                </label>
                <input
                  type="text"
                  value={previousGrade}
                  onChange={(e) => setPreviousGrade(e.target.value)}
                  placeholder="ឧ. មត្តេយ្យកុមារដ្ឋាន"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ថ្ងៃចុះឈ្មោះចូលរៀន
                </label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ប្រភេទពិការភាព
                </label>
                <select
                  value={disabilityType}
                  onChange={(e) => setDisabilityType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none"
                >
                  <option value="គ្មាន">គ្មាន</option>
                  <option value="គិតឃើញយឺត/ខ្សោយបញ្ញា">គិតឃើញយឺត / ខ្សោយបញ្ញា</option>
                  <option value="ពិការគំហើញ">ពិការគំហើញ (ភ្នែក)</option>
                  <option value="ពិការសោតវិញ្ញាណ">ពិការសោតវិញ្ញាណ (ត្រចៀក)</option>
                  <option value="ពិការអវយវៈ">ពិការអវយវៈ (ដៃ/ជើង)</option>
                </select>
              </div>
            </div>

            {/* Assistance Kits Checkboxes */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                កញ្ចប់សម្ភារជំនួយសិក្សា (MoEYS Learning Kits)៖
              </label>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportReadingKit}
                    onChange={(e) => setSupportReadingKit(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>កញ្ចប់សម្ភារអំណាន (Early Grade Reading)</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportMathKit}
                    onChange={(e) => setSupportMathKit(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>សម្ភារគណិត (Early Grade Math)</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportKhmerBook}
                    onChange={(e) => setSupportKhmerBook(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>សៀវភៅជំនួយភាសាខ្មែរ</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 4: STS EQUITY INDICATORS */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-moul flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-500" />
              <span>៤. ទិន្នន័យសមធម៌ STS MoEYS (Equity Indicators)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Poor Family Selector */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    «មកពីគ្រួសារក្រីក្រ» (STS ជួរឈរ ២៣)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['yes', 'no', 'unasked'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIsPoorFamily(opt)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isPoorFamily === opt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {opt === 'yes' ? 'មាន' : opt === 'no' ? 'គ្មាន' : 'មិនទាន់សួរ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equity Card Selector */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    «មានបណ្ណសមធម៌» (អាហារូបករណ៍ សន្លឹក ៦២)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['yes', 'no', 'unasked'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHasEquityCard(opt)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        hasEquityCard === opt
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {opt === 'yes' ? 'មាន' : opt === 'no' ? 'គ្មាន' : 'មិនទាន់សួរ'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: FATHER & MOTHER INFO */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-moul flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>៥. ព័ត៌មានឪពុក និងម្តាយ (Father & Mother Info)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block border-b border-slate-100 dark:border-slate-700 pb-1">
                  ព័ត៌មានឪពុក
                </span>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">ឈ្មោះឪពុកពេញ</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="ឧ. សុខ គង់"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">មុខរបរ</label>
                    <input
                      type="text"
                      value={fatherOccupation}
                      onChange={(e) => setFatherOccupation(e.target.value)}
                      placeholder="ឧ. កសិករ"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">លេខទូរស័ព្ទ</label>
                    <input
                      type="text"
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      placeholder="012345678"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Mother */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block border-b border-slate-100 dark:border-slate-700 pb-1">
                  ព័ត៌មានម្តាយ
                </span>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">ឈ្មោះម្តាយពេញ</label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="ឧ. អ៊ុំ ម៉ាលី"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">មុខរបរ</label>
                    <input
                      type="text"
                      value={motherOccupation}
                      onChange={(e) => setMotherOccupation(e.target.value)}
                      placeholder="ឧ. កសិករ"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">លេខទូរស័ព្ទ</label>
                    <input
                      type="text"
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      placeholder="098765432"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/50 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>✓ រក្សាទុកសិស្ស</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
