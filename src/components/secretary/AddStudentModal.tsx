import React, { useState, useEffect } from 'react';
import { Student, Gender, LivingCondition, AcademicHistoryStatus, OrphanStatus } from '../../types';
import { AddressSelector } from '../common/AddressSelector';
import { uploadStudentProfilePhoto } from '../../services/firebaseStorage';
import {
  UserPlus,
  Edit3,
  X,
  User,
  Calendar,
  GraduationCap,
  HeartPulse,
  Phone,
  MapPin,
  Camera,
  UploadCloud,
  Check,
  AlertCircle,
  Hash,
  ShieldCheck,
  Sparkles,
  Loader2,
  Crop,
  Video
} from 'lucide-react';
import { DirectCameraCaptureModal } from '../common/DirectCameraCaptureModal';
import { PhotoCropAndAlignModal } from '../common/PhotoCropAndAlignModal';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (studentData: any) => void;
  editingStudent?: Student | null;
  existingStudentsCount?: number;
  academicYear?: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSaveStudent,
  editingStudent = null,
  existingStudentsCount = 0,
  academicYear = '២០២៦ - ២០២៧',
  showToast
}) => {
  // Suggest next student code
  const suggestedCode = `STU${String(existingStudentsCount + 1).padStart(3, '0')}`;

  const [activeTab, setActiveTab] = useState<'general' | 'family' | 'vulnerability'>('general');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDirectCameraOpen, setIsDirectCameraOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropModalImageSrc, setCropModalImageSrc] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nameKhmer: '',
    nameLatin: '',
    gender: 'M' as Gender,
    dob: '2016-01-01',
    code: suggestedCode,
    grade: 1,
    section: 'ក',
    phone: '',
    // POB
    pobVillage: '',
    pobCommune: '',
    pobDistrict: '',
    pobProvince: 'ខេត្តបាត់ដំបង',
    // Current Address
    currentHouseNumber: '',
    currentStreetNumber: '',
    currentVillage: '',
    currentCommune: '',
    currentDistrict: '',
    currentProvince: 'ខេត្តបាត់ដំបង',
    // Family
    fatherName: '',
    fatherAlive: true,
    fatherOccupation: '',
    motherName: '',
    motherAlive: true,
    motherOccupation: '',
    guardianName: '',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '',
    guardianOccupation: '',
    // Status & Vulnerability
    academicHistory: 'ឡើងថ្នាក់' as AcademicHistoryStatus,
    livingCondition: 'ទូទៅ' as LivingCondition,
    orphanStatus: 'មិនកំព្រា' as OrphanStatus,
    disability: 'មិនពិការ',
    scholarship: 'មិនមាន',
    ethnicMinority: 'ខ្មែរ',
    specialCharacteristics: '',
    previousSchool: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'active' as const,
    avatarUrl: '',
    // Health
    heightCm: 120,
    weightKg: 22,
    bloodType: 'O+',
    vaccinated: true,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or Populate form when opened
  useEffect(() => {
    if (isOpen) {
      if (editingStudent) {
        setFormData({
          nameKhmer: editingStudent.nameKhmer || '',
          nameLatin: editingStudent.nameLatin || '',
          gender: editingStudent.gender || 'M',
          dob: editingStudent.dob || '2016-01-01',
          code: editingStudent.code || '',
          grade: editingStudent.grade || 1,
          section: editingStudent.section || 'ក',
          phone: editingStudent.phone || '',
          pobVillage: editingStudent.pobVillage || '',
          pobCommune: editingStudent.pobCommune || '',
          pobDistrict: editingStudent.pobDistrict || '',
          pobProvince: editingStudent.pobProvince || 'ខេត្តបាត់ដំបង',
          currentHouseNumber: editingStudent.currentHouseNumber || '',
          currentStreetNumber: editingStudent.currentStreetNumber || '',
          currentVillage: editingStudent.currentVillage || '',
          currentCommune: editingStudent.currentCommune || '',
          currentDistrict: editingStudent.currentDistrict || '',
          currentProvince: editingStudent.currentProvince || 'ខេត្តបាត់ដំបង',
          fatherName: editingStudent.fatherName || '',
          fatherAlive: editingStudent.fatherAlive !== false,
          fatherOccupation: editingStudent.fatherOccupation || '',
          motherName: editingStudent.motherName || '',
          motherAlive: editingStudent.motherAlive !== false,
          motherOccupation: editingStudent.motherOccupation || '',
          guardianName: editingStudent.guardianName || '',
          guardianRelationship: editingStudent.guardianRelationship || 'ឪពុក',
          guardianPhone: editingStudent.guardianPhone || '',
          guardianOccupation: editingStudent.guardianOccupation || '',
          academicHistory: editingStudent.academicHistory || 'ឡើងថ្នាក់',
          livingCondition: editingStudent.livingCondition || 'ទូទៅ',
          orphanStatus: editingStudent.orphanStatus || 'មិនកំព្រា',
          disability: editingStudent.disability || 'មិនពិការ',
          scholarship: editingStudent.scholarship || 'មិនមាន',
          ethnicMinority: editingStudent.ethnicMinority || 'ខ្មែរ',
          specialCharacteristics: editingStudent.specialCharacteristics || '',
          previousSchool: editingStudent.previousSchool || '',
          admissionDate: editingStudent.admissionDate || new Date().toISOString().split('T')[0],
          status: editingStudent.status || 'active',
          avatarUrl: editingStudent.avatarUrl || '',
          heightCm: editingStudent.heightCm || 120,
          weightKg: editingStudent.weightKg || 22,
          bloodType: editingStudent.bloodType || 'O+',
          vaccinated: editingStudent.vaccinated !== false,
          notes: editingStudent.notes || ''
        });
      } else {
        setFormData(prev => ({
          ...prev,
          nameKhmer: '',
          nameLatin: '',
          gender: 'M',
          dob: '2016-01-01',
          code: `STU${String(existingStudentsCount + 1).padStart(3, '0')}`,
          grade: 1,
          section: 'ក',
          phone: '',
          fatherName: '',
          motherName: '',
          guardianName: '',
          guardianPhone: '',
          avatarUrl: '',
          notes: ''
        }));
      }
      setErrors({});
      setActiveTab('general');
    }
  }, [isOpen, editingStudent, existingStudentsCount]);

  // Calculate age from DOB
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  // Convert number to Khmer
  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
  };

  // Handle Photo File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const identifier = formData.nameLatin || formData.nameKhmer || 'student';
      const res = await uploadStudentProfilePhoto(file, identifier);
      setFormData(prev => ({ ...prev, avatarUrl: res.downloadUrl }));
      showToast('បានផ្ទុករូបថតសិស្សជោគជ័យ!', 'success');
    } catch (err: any) {
      showToast('បរាជ័យក្នុងការផ្ទុករូបថត', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nameKhmer.trim()) {
      newErrors.nameKhmer = 'សូមបញ្ចូលគោត្តនាម និងនាមសិស្ស (ភាសាខ្មែរ)';
    }
    if (!formData.dob) {
      newErrors.dob = 'សូមជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត';
    }
    if (!formData.grade || formData.grade < 1 || formData.grade > 6) {
      newErrors.grade = 'សូមជ្រើសរើសកម្រិតថ្នាក់ (១-៦)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('សូមបំពេញព័ត៌មានចាំបាច់ឱ្យបានគ្រប់ជ្រុងជ្រោយ', 'error');
      setActiveTab('general');
      return;
    }

    const payload = {
      ...(editingStudent ? { id: editingStudent.id } : {}),
      ...formData,
      code: formData.code.trim() || suggestedCode,
      academicYear: editingStudent?.academicYear || academicYear,
      // Combine POB & Address strings for backward compatibility
      pob: [formData.pobVillage, formData.pobCommune, formData.pobDistrict, formData.pobProvince].filter(Boolean).join(' ') || 'ខេត្តបាត់ដំបង',
      currentAddress: [formData.currentVillage, formData.currentCommune, formData.currentDistrict, formData.currentProvince].filter(Boolean).join(' ') || 'ខេត្តបាត់ដំបង'
    };

    onSaveStudent(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="add-student-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="add-student-modal-container"
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              {editingStudent ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold font-moul tracking-wide">
                {editingStudent ? 'កែប្រែព័ត៌មានសិស្ស' : 'បញ្ចូលទិន្នន័យសិស្សថ្មីដោយដៃ'}
              </h3>
              <p className="text-xs text-blue-100/90">
                {editingStudent ? `អត្តលេខ៖ ${editingStudent.code || editingStudent.id}` : 'លេខាធិការដ្ឋាន • Manual Student Registration'}
              </p>
            </div>
          </div>
          <button
            id="close-add-student-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
            <span>១. ព័ត៌មានផ្ទាល់ខ្លួន & ការសិក្សា</span>
            {errors.nameKhmer || errors.dob || errors.grade ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'family'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>២. អាណាព្យាបាល & អាសយដ្ឋាន</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vulnerability')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'vulnerability'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>៣. ស្ថានភាពពិសេស & សុខភាព</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: General & Enrollment */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Photo & Quick Overview Header */}
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="relative group">
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Student"
                        className="w-20 h-24 rounded-2xl object-cover border-2 border-blue-400 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-2xl flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-xs">
                        {formData.nameKhmer ? formData.nameKhmer.slice(0, 2) : <User className="w-8 h-8 text-blue-400" />}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsDirectCameraOpen(true)}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                      title="ថតផ្ទាល់ (Webcam)"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                    <label className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer transition-colors" title="ជ្រើសរើសរូបថត (Upload)">
                      {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> : <Camera className="w-3.5 h-3.5" />}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                      />
                    </label>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCropModalImageSrc(formData.avatarUrl);
                          setIsCropModalOpen(true);
                        }}
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                        title="ច្រឹប/តម្រឹម 3x4"
                      >
                        <Crop className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">
                    {formData.nameKhmer || 'ឈ្មោះសិស្សថ្មី'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-times">
                    {formData.nameLatin || 'Student Latin Name'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                      ថ្នាក់ទី {formData.grade}{formData.section}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                      អាយុ {toKhmerNum(calculateAge(formData.dob))} ឆ្នាំ
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      {formData.code || suggestedCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Khmer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    គោត្តនាម និងនាម (ខ្មែរ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="student-name-khmer-input"
                    value={formData.nameKhmer}
                    onChange={e => {
                      setFormData({ ...formData, nameKhmer: e.target.value });
                      if (errors.nameKhmer) setErrors({ ...errors, nameKhmer: '' });
                    }}
                    placeholder="ឧ. សុខ សុវណ្ណារ៉ា"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 bg-white dark:bg-slate-800 dark:text-white ${
                      errors.nameKhmer
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.nameKhmer && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.nameKhmer}
                    </p>
                  )}
                </div>

                {/* Latin Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ឈ្មោះជាអក្សរឡាតាំង (Latin Name)
                  </label>
                  <input
                    type="text"
                    id="student-name-latin-input"
                    value={formData.nameLatin}
                    onChange={e => setFormData({ ...formData, nameLatin: e.target.value.toUpperCase() })}
                    placeholder="e.g. SOK SOVANNARA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-times focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ភេទ (Gender) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="gender-male-btn"
                      onClick={() => setFormData({ ...formData, gender: 'M' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        formData.gender === 'M'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>ប្រុស (Male)</span>
                      {formData.gender === 'M' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <button
                      type="button"
                      id="gender-female-btn"
                      onClick={() => setFormData({ ...formData, gender: 'F' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        formData.gender === 'F'
                          ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-700 dark:text-pink-300 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>ស្រី (Female)</span>
                      {formData.gender === 'F' && <Check className="w-3.5 h-3.5 text-pink-600" />}
                    </button>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ថ្ងៃខែឆ្នាំកំណើត (DOB) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="student-dob-input"
                      value={formData.dob}
                      onChange={e => {
                        setFormData({ ...formData, dob: e.target.value });
                        if (errors.dob) setErrors({ ...errors, dob: '' });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden focus:ring-2 bg-white dark:bg-slate-800 dark:text-white ${
                        errors.dob
                          ? 'border-rose-400 focus:ring-rose-400'
                          : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Enrollment Grade */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    កម្រិតថ្នាក់ (Enrollment Grade) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="student-grade-select"
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g} (Grade {g})</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    បន្ទប់ / អក្សរថ្នាក់ (Section)
                  </label>
                  <select
                    id="student-section-select"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    {['ក', 'ខ', 'គ', 'ឃ', 'ង'].map(sec => (
                      <option key={sec} value={sec}>បន្ទប់ «{sec}»</option>
                    ))}
                  </select>
                </div>

                {/* Student Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    អត្តលេខសិស្ស (Student ID / Code)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="student-code-input"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder={suggestedCode}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    លេខទូរស័ព្ទផ្ទាល់ខ្លួន (ប្រសិនបើមាន)
                  </label>
                  <input
                    type="text"
                    id="student-phone-input"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Place of Birth */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>ទីកន្លែងកំណើត (Place of Birth)</span>
                </h5>
                <AddressSelector
                  prefix="student-pob"
                  village={formData.pobVillage}
                  commune={formData.pobCommune}
                  district={formData.pobDistrict}
                  province={formData.pobProvince}
                  onVillageChange={v => setFormData({ ...formData, pobVillage: v })}
                  onCommuneChange={c => setFormData({ ...formData, pobCommune: c })}
                  onDistrictChange={d => setFormData({ ...formData, pobDistrict: d })}
                  onProvinceChange={p => setFormData({ ...formData, pobProvince: p })}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Guardian & Address */}
          {activeTab === 'family' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Father Info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>ព័ត៌មានឪពុក</span>
                  </h5>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">ឈ្មោះឪពុក</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="ឈ្មោះឪពុក"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">មុខរបរ</label>
                    <input
                      type="text"
                      value={formData.fatherOccupation}
                      onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      placeholder="មុខរបរឪពុក"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.fatherAlive}
                      onChange={e => setFormData({ ...formData, fatherAlive: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>នៅរស់ (Alive)</span>
                  </label>
                </div>

                {/* Mother Info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h5 className="text-xs font-bold text-pink-900 dark:text-pink-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-pink-600" />
                    <span>ព័ត៌មានម្តាយ</span>
                  </h5>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">ឈ្មោះម្តាយ</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="ឈ្មោះម្តាយ"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">មុខរបរ</label>
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })}
                      placeholder="មុខរបរម្តាយ"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.motherAlive}
                      onChange={e => setFormData({ ...formData, motherAlive: e.target.checked })}
                      className="rounded text-pink-600"
                    />
                    <span>នៅរស់ (Alive)</span>
                  </label>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-3">
                <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>អាណាព្យាបាលចម្បង & ទំនាក់ទំនងបន្ទាន់</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">ឈ្មោះអាណាព្យាបាល</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="ឈ្មោះអ្នកទទួលខុសត្រូវ"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">ត្រូវជា (ទំនាក់ទំនង)</label>
                    <select
                      value={formData.guardianRelationship}
                      onChange={e => setFormData({ ...formData, guardianRelationship: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    >
                      <option value="ឪពុក">ឪពុក</option>
                      <option value="ម្តាយ">ម្តាយ</option>
                      <option value="ជីដូន">ជីដូន</option>
                      <option value="ជីតា">ជីតា</option>
                      <option value="បង">បងប្អូន</option>
                      <option value="ពូ/មីង">ពូ/មីង</option>
                      <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">លេខទូរស័ព្ទអាណាព្យាបាល</label>
                    <input
                      type="text"
                      value={formData.guardianPhone}
                      onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="012 345 678"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>អាសយដ្ឋានបច្ចុប្បន្ន (Current Living Address)</span>
                </h5>
                <AddressSelector
                  prefix="student-current"
                  village={formData.currentVillage}
                  commune={formData.currentCommune}
                  district={formData.currentDistrict}
                  province={formData.currentProvince}
                  onVillageChange={v => setFormData({ ...formData, currentVillage: v })}
                  onCommuneChange={c => setFormData({ ...formData, currentCommune: c })}
                  onDistrictChange={d => setFormData({ ...formData, currentDistrict: d })}
                  onProvinceChange={p => setFormData({ ...formData, currentProvince: p })}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Vulnerability & Health */}
          {activeTab === 'vulnerability' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* IDPoor / Living Condition */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ស្ថានភាពជីវភាព / ប័ណ្ណក្រីក្រ (IDPoor)
                  </label>
                  <select
                    value={formData.livingCondition}
                    onChange={e => setFormData({ ...formData, livingCondition: e.target.value as LivingCondition })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white"
                  >
                    <option value="ទូទៅ">ទូទៅ (ធម្មតា)</option>
                    <option value="ក្រ១">ក្រីក្រកម្រិត ១ (ក្រ១ - ទីទ័លក្រ)</option>
                    <option value="ក្រ២">ក្រីក្រកម្រិត ២ (ក្រ២ - ងាយរងគ្រោះ)</option>
                    <option value="ងាយរងហានិភ័យ">ងាយរងហានិភ័យ</option>
                  </select>
                </div>

                {/* Orphan Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ស្ថានភាពកំព្រា (Orphan Status)
                  </label>
                  <select
                    value={formData.orphanStatus}
                    onChange={e => setFormData({ ...formData, orphanStatus: e.target.value as OrphanStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white"
                  >
                    <option value="មិនកំព្រា">មិនកំព្រា</option>
                    <option value="កំព្រាឪពុក">កំព្រាឪពុក</option>
                    <option value="កំព្រាម្តាយ">កំព្រាម្តាយ</option>
                    <option value="កំព្រាទាំងពីរ">កំព្រាទាំងពីរ</option>
                  </select>
                </div>

                {/* Scholarship */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    អាហារូបករណ៍ (Scholarship)
                  </label>
                  <select
                    value={formData.scholarship}
                    onChange={e => setFormData({ ...formData, scholarship: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white"
                  >
                    <option value="មិនមាន">មិនមាន</option>
                    <option value="អាហារូបករណ៍រដ្ឋ">អាហារូបករណ៍រដ្ឋ (MoEYS)</option>
                    <option value="អាហារូបករណ៍អង្គការដៃគូ">អាហារូបករណ៍អង្គការដៃគូ (NGO)</option>
                    <option value="អាហារូបករណ៍សប្បុរសជន">អាហារូបករណ៍សប្បុរសជន</option>
                  </select>
                </div>

                {/* Disability */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ពិការភាព (Disability)
                  </label>
                  <input
                    type="text"
                    value={formData.disability}
                    onChange={e => setFormData({ ...formData, disability: e.target.value })}
                    placeholder="ឧ. មិនពិការ ឬ គិតស្រវាំងភ្នែក"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Health Metrics */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ព័ត៌មានសុខភាពដំបូង</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">កម្ពស់ (cm)</label>
                    <input
                      type="number"
                      value={formData.heightCm}
                      onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">ទម្ងន់ (kg)</label>
                    <input
                      type="number"
                      value={formData.weightKg}
                      onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">ក្រុមឈាម</label>
                    <select
                      value={formData.bloodType}
                      onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                    >
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O+">O+</option>
                      <option value="Unknown">មិនទាន់ដឹង</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">វ៉ាក់សាំង</label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.vaccinated}
                        onChange={e => setFormData({ ...formData, vaccinated: e.target.checked })}
                        className="rounded text-emerald-600"
                      />
                      <span>ចាក់រួចរាល់</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  កំណត់សម្គាល់បន្ថែម
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ព័ត៌មានបន្ថែមអំពីសិស្ស..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer inside */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-rose-500">*</span> បញ្ជាក់វាលចាំបាច់ត្រូវបំពេញ
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                id="submit-save-student-btn"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{editingStudent ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលសិស្សក្នុងបញ្ជី'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Direct Webcam Camera Snapshot Modal */}
      <DirectCameraCaptureModal
        isOpen={isDirectCameraOpen}
        onClose={() => setIsDirectCameraOpen(false)}
        onCapture={(blob, dataUrl) => {
          setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
          showToast('បានថតរូបភាពសិស្សជោគជ័យ!', 'success');
        }}
        onOpenCropEditor={(dataUrl) => {
          setCropModalImageSrc(dataUrl);
          setIsCropModalOpen(true);
        }}
        title="ថតរូបសិស្សផ្ទាល់ពីកាមេរ៉ា (Camera Snapshot)"
        subtitle="ថតរូបភាពសិស្សតាមខ្នាតស្តង់ដារ 3x4 សម្រាប់បណ្ណសិស្ស និងប្រវត្តិរូប MoEYS"
      />

      {/* Photo Crop & Adjust Modal */}
      <PhotoCropAndAlignModal
        isOpen={isCropModalOpen}
        imageSrc={cropModalImageSrc}
        onClose={() => {
          setIsCropModalOpen(false);
          setCropModalImageSrc(null);
        }}
        onConfirmCrop={(blob, dataUrl) => {
          setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
          showToast('បានច្រឹប និងតម្រឹមកែសម្រួលរូបថតសិស្សជោគជ័យ!', 'success');
        }}
        title="ច្រឹប និងតម្រឹមកែសម្រួលរូបថតសិស្ស (3x4 Passport)"
      />
    </div>
  );
};
