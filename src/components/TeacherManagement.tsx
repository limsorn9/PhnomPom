import React, { useState, useMemo, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Teacher, Gender } from '../types';
import { exportTeachersToGoogleSheets } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import { TeacherSearchIndex } from '../utils/searchIndex';
import { uploadProfilePhotoToDrive } from '../services/googleDrive';
import { compressImageFile, fileToBase64 } from '../services/firebaseStorage';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  X,
  Award,
  BookOpen,
  CheckCircle2,
  Briefcase,
  FileSpreadsheet,
  RefreshCw,
  Building,
  CreditCard,
  MapPin,
  Heart,
  Users,
  Eye,
  Printer,
  Sparkles,
  Camera,
  Upload,
  Loader2,
  CloudUpload,
  Image as ImageIcon
} from 'lucide-react';
import {
  MoEYSRoyalHeader,
  AngkorPageWatermark
} from './AngkorMotif';
import { useFormAutoSave } from '../hooks/useFormAutoSave';
import { FormAutoSaveIndicator } from './common/FormAutoSaveIndicator';
import { BatchStudentAttendanceModal } from './BatchStudentAttendanceModal';

export const TeacherManagement: React.FC = () => {
  const {
    teachers, selectedAcademicYear, appUsers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    searchQuery,
    schoolProfile,
    showToast,
    currentUser,
    recordTeacherQuickCheckIn,
    getTeacherCheckInStatus
  } = useSchool();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTeacherForSchedule, setSelectedTeacherForSchedule] = useState<Teacher | null>(null);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [isBatchAttendanceOpen, setIsBatchAttendanceOpen] = useState(false);
  const [batchModalGrade, setBatchModalGrade] = useState<number>(1);
  const [batchModalSection, setBatchModalSection] = useState<string>('ក');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const teacherPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleTeacherPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('ទំហំរូបថតត្រូវតែតូចជាង 10MB!', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressedBlob = await compressImageFile(file, 800, 800, 0.88);
      try {
        const result = await uploadProfilePhotoToDrive(
          compressedBlob,
          `staff_avatar_${Date.now()}.jpg`
        );
        if (result.directPhotoUrl) {
          setFormData(prev => ({ ...prev, avatarUrl: result.directPhotoUrl }));
          showToast('បានផ្ទុកឡើងរូបថតបុគ្គលិកទៅកាន់ Google Drive ជោគជ័យ!', 'success');
        }
      } catch (driveErr: any) {
        const base64Url = await fileToBase64(compressedBlob);
        setFormData(prev => ({ ...prev, avatarUrl: base64Url }));
        showToast('បានរក្សាទុករូបថតបុគ្គលិកជា Base64 ជោគជ័យ!', 'info');
      }
    } catch (err: any) {
      console.error('Error processing staff photo:', err);
      showToast('បរាជ័យក្នុងការបញ្ចូលរូបថត: ' + (err.message || 'សូមព្យាយាមម្តងទៀត'), 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (teacherPhotoInputRef.current) teacherPhotoInputRef.current.value = '';
    }
  };

  // Form State with comprehensive fields
  const initialForm = {
    nameKhmer: '',
    nameLatin: '',
    gender: 'F' as Gender,
    dob: '1988-05-12',
    phone: '',
    email: '',
    nationalId: '',
    staffCode: '',
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
    // Professional details
    framework: 'ក្របខណ្ឌគ្រូបង្រៀនកម្រិតមូលដ្ឋាន',
    qualification: 'បរិញ្ញាបត្រគរុកោសល្យ',
    specialization: 'គរុកោសល្យបឋមសិក្សា',
    role: 'គ្រូបន្ទុកថ្នាក់',
    assignedGrade: 1,
    assignedSection: 'ក',
    assignedGrade2: '' as unknown as number,
    assignedSection2: '',
    teachingSubject: 'ភាសាខ្មែរ-គណិតវិទ្យា',
    yearsOfService: 6,
    startDate: '2018-10-01',
    civilServiceEntryDate: '2019-10-01',
    // Banking / Payroll
    bankName: 'ធនាគារ អេស៊ីលីដា (ACLEDA Bank)',
    bankAccountNumber: '',
    // Family
    maritalStatus: 'រៀបការរួច',
    spouseName: '',
    spouseOccupation: '',
    childrenCount: 1,
    status: 'active' as const,
    avatarUrl: ''
  };

  const {
    formData,
    setFormData,
    resetForm,
    clearDraft,
    discardDraft,
    hasSavedDraft,
    lastSavedTime,
    isSaving
  } = useFormAutoSave('phnom_pom_draft_teacher_registration', initialForm, {
    enabled: isAddModalOpen && !editingTeacher
  });

  // Build and memoize Fuzzy Search Index for teachers
  const teacherSearchIndex = useMemo(() => {
    return new TeacherSearchIndex(teachers);
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const query = (searchQuery || localSearch).trim();

    // Step 1: Apply Fuzzy Search Index if query exists
    let candidateTeachers = teachers.filter(t => !t.academicYear || t.academicYear === selectedAcademicYear);
    if (query) {
      const searchResults = teacherSearchIndex.search(query);
      candidateTeachers = searchResults.map(res => res.item);
    }

    // Step 2: Filter by Role
    return candidateTeachers.filter(teacher => {
      return selectedRole === 'all' || teacher.role.includes(selectedRole);
    });
  }, [teachers, selectedAcademicYear, appUsers, teacherSearchIndex, searchQuery, localSearch, selectedRole]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameKhmer.trim()) {
      showToast('សូមបញ្ចូលឈ្មោះលោកគ្រូ/អ្នកគ្រូជាភាសាខ្មែរ!', 'error');
      return;
    }

    const pobFormatted = [formData.pobVillage && `ភូមិ${formData.pobVillage}`, formData.pobCommune && `ឃុំ${formData.pobCommune}`, formData.pobDistrict && `ស្រុក${formData.pobDistrict}`, formData.pobProvince].filter(Boolean).join(' ') || 'ខេត្តបាត់ដំបង';
    const addressFormatted = [formData.currentHouseNumber && `ផ្ទះលេខ${formData.currentHouseNumber}`, formData.currentStreetNumber && `ផ្លូវ${formData.currentStreetNumber}`, formData.currentVillage && `ភូមិ${formData.currentVillage}`, formData.currentCommune && `ឃុំ${formData.currentCommune}`, formData.currentDistrict && `ស្រុក${formData.currentDistrict}`, formData.currentProvince].filter(Boolean).join(' ') || 'ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង';

    const teacherData: Omit<Teacher, 'id' | 'staffCode'> = {
      nameKhmer: formData.nameKhmer,
      nameLatin: formData.nameLatin,
      gender: formData.gender,
      dob: formData.dob,
      phone: formData.phone,
      email: formData.email || `${(formData.nameLatin || 'teacher').toLowerCase().replace(/\s+/g, '.')}@moeys.gov.kh`,
      nationalId: formData.nationalId,
      pob: pobFormatted,
      pobVillage: formData.pobVillage,
      pobCommune: formData.pobCommune,
      pobDistrict: formData.pobDistrict,
      pobProvince: formData.pobProvince,
      currentAddress: addressFormatted,
      currentHouseNumber: formData.currentHouseNumber,
      currentStreetNumber: formData.currentStreetNumber,
      currentVillage: formData.currentVillage,
      currentCommune: formData.currentCommune,
      currentDistrict: formData.currentDistrict,
      currentProvince: formData.currentProvince,
      framework: formData.framework,
      qualification: formData.qualification,
      specialization: formData.specialization,
      teachingSubject: formData.teachingSubject,
      role: formData.role,
      assignedGrade: Number(formData.assignedGrade),
      assignedSection: formData.assignedSection || 'ក',
      assignedGrade2: formData.assignedGrade2 ? Number(formData.assignedGrade2) : undefined,
      assignedSection2: formData.assignedSection2 || undefined,
      yearsOfService: Number(formData.yearsOfService) || 1,
      startDate: formData.startDate,
      civilServiceEntryDate: formData.civilServiceEntryDate,
      bankName: formData.bankName,
      bankAccountNumber: formData.bankAccountNumber,
      maritalStatus: formData.maritalStatus,
      spouseName: formData.spouseName,
      spouseOccupation: formData.spouseOccupation,
      childrenCount: Number(formData.childrenCount) || 0,
      status: formData.status,
      avatarUrl: formData.avatarUrl && formData.avatarUrl.trim() !== '' ? formData.avatarUrl : formData.gender === 'F'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      schedule: editingTeacher?.schedule || [
        { day: 'ចន្ទ', subject: formData.teachingSubject || 'ភាសាខ្មែរ', timeSlot: '07:30 - 09:00', gradeClass: `${formData.assignedGrade}${formData.assignedSection}` },
        { day: 'អង្គារ', subject: 'គណិតវិទ្យា', timeSlot: '07:30 - 08:30', gradeClass: `${formData.assignedGrade}${formData.assignedSection}` },
        { day: 'ពុធ', subject: 'វិទ្យាសាស្ត្រ', timeSlot: '08:30 - 09:30', gradeClass: `${formData.assignedGrade}${formData.assignedSection}` },
        { day: 'ព្រហស្បតិ៍', subject: 'សិក្សាសង្គម', timeSlot: '07:30 - 08:30', gradeClass: `${formData.assignedGrade}${formData.assignedSection}` },
        { day: 'សុក្រ', subject: 'សីលធម៌-ពលរដ្ឋ', timeSlot: '08:30 - 09:30', gradeClass: `${formData.assignedGrade}${formData.assignedSection}` }
      ],
      academicYear: selectedAcademicYear
    };

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, teacherData);
      setEditingTeacher(null);
      resetForm(initialForm);
    } else {
      addTeacher(teacherData);
      resetForm(initialForm);
    }

    setIsAddModalOpen(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nameKhmer: teacher.nameKhmer,
      nameLatin: teacher.nameLatin || '',
      gender: teacher.gender,
      dob: teacher.dob,
      phone: teacher.phone,
      email: teacher.email,
      nationalId: teacher.nationalId || '',
      staffCode: teacher.staffCode,
      pobVillage: teacher.pobVillage || '',
      pobCommune: teacher.pobCommune || '',
      pobDistrict: teacher.pobDistrict || '',
      pobProvince: teacher.pobProvince || 'ខេត្តបាត់ដំបង',
      currentHouseNumber: teacher.currentHouseNumber || '',
      currentStreetNumber: teacher.currentStreetNumber || '',
      currentVillage: teacher.currentVillage || '',
      currentCommune: teacher.currentCommune || '',
      currentDistrict: teacher.currentDistrict || '',
      currentProvince: teacher.currentProvince || 'ខេត្តបាត់ដំបង',
      framework: teacher.framework || 'ក្របខណ្ឌគ្រូបង្រៀនកម្រិតមូលដ្ឋាន',
      qualification: teacher.qualification,
      specialization: teacher.specialization || 'គរុកោសល្យបឋមសិក្សា',
      teachingSubject: teacher.teachingSubject || 'ភាសាខ្មែរ-គណិតវិទ្យា',
      role: teacher.role,
      assignedGrade: teacher.assignedGrade || 1,
      assignedSection: teacher.assignedSection || 'ក',
      assignedGrade2: teacher.assignedGrade2 || ('' as unknown as number),
      assignedSection2: teacher.assignedSection2 || '',
      yearsOfService: teacher.yearsOfService,
      startDate: teacher.startDate,
      civilServiceEntryDate: teacher.civilServiceEntryDate || teacher.startDate,
      bankName: teacher.bankName || 'ធនាគារ អេស៊ីលីដា (ACLEDA Bank)',
      bankAccountNumber: teacher.bankAccountNumber || '',
      maritalStatus: teacher.maritalStatus || 'រៀបការរួច',
      spouseName: teacher.spouseName || '',
      spouseOccupation: teacher.spouseOccupation || '',
      childrenCount: teacher.childrenCount || 0,
      status: teacher.status,
      avatarUrl: teacher.avatarUrl || ''
    });
    setIsAddModalOpen(true);
  };

  const handleExportTeachersToSheets = async () => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        } else {
          return;
        }
      } catch (err: any) {
        showToast(err.message || 'សូមភ្ជាប់គណនី Google ដើម្បីនាំចេញ', 'error');
        return;
      }
    }

    if (!token) return;

    setIsExportingSheets(true);
    try {
      const res = await exportTeachersToGoogleSheets(schoolProfile, filteredTeachers);
      showToast(`បានបង្កើត Google Sheet «${res.title}» ដោយជោគជ័យ!`);
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការនាំចេញបញ្ជីគ្រូបង្រៀន', 'error');
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="space-y-6 font-battambang">
      {/* Header & Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-moul">គ្រូបង្រៀន និងបុគ្គលិករដ្ឋបាល</h2>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  សរុប {teachers.length} រូប
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                គ្រប់គ្រងទិន្នន័យគ្រូបង្រៀន៖ អត្តលេខមន្ត្រីរាជការ ក្របខណ្ឌ កម្រិតបណ្តុះបណ្តាល គណនីបើកប្រាក់បៀវត្សរ៍ និងកាលវិភាគបង្រៀន
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Batch Student Attendance Check-in Action Button */}
            <button
              id="open-batch-attendance-modal-btn"
              onClick={() => {
                const myTeacher = teachers.find(t => t.nameKhmer === currentUser.nameKhmer);
                if (myTeacher && myTeacher.assignedGrade) {
                  setBatchModalGrade(myTeacher.assignedGrade);
                  setBatchModalSection(myTeacher.assignedSection || 'ក');
                } else {
                  setBatchModalGrade(1);
                  setBatchModalSection('ក');
                }
                setIsBatchAttendanceOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer ring-2 ring-emerald-400/30"
              title="កត់ត្រាវត្តមានសិស្សជាក្រុមក្នុងពេលតែមួយ (Bulk Attendance Check-in)"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              <span>កត់ត្រាវត្តមានជាក្រុម (Batch Check-in)</span>
            </button>

            <button
              id="export-teachers-sheets-btn"
              onClick={handleExportTeachersToSheets}
              disabled={isExportingSheets}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isExportingSheets ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>{isExportingSheets ? 'កំពុងនាំចេញ...' : 'នាំចេញទៅ Google Sheet'}</span>
            </button>
            <button
              id="print-teachers-list-btn"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
              title="បោះពុម្ពបញ្ជីបុគ្គលិកអប់រំ និងគ្រូបង្រៀន"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>បោះពុម្ពបញ្ជីគ្រូ</span>
            </button>
            {currentUser.role === 'director' && (
              <button
                id="add-teacher-modal-btn"
                onClick={() => {
                  setEditingTeacher(null);
                  setFormData(initialForm);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ បន្ថែមគ្រូបង្រៀនថ្មី</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="teacher-search-input"
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ស្វែងរកគ្រូ តាមឈ្មោះ អត្តលេខ ឬទូរស័ព្ទ (Fuzzy)..."
              className="w-full pl-9 pr-16 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
            />
            {localSearch && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md">
                  {filteredTeachers.length}
                </span>
                <button
                  onClick={() => setLocalSearch('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                  title="សម្អាតការស្វែងរក"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">គ្រប់មុខងារ/តួនាទីទាំងអស់ (គ្រូបង្រៀន & បុគ្គលិក)</option>
              <option value="គ្រូបន្ទុកថ្នាក់">គ្រូបន្ទុកថ្នាក់</option>
              <option value="នាយក">គណៈគ្រប់គ្រង (នាយក/នាយករង)</option>
              <option value="លេខាធិការ">លេខាធិការ (Secretary / បុគ្គលិករដ្ឋបាល)</option>
              <option value="បណ្ណារក្ស">បណ្ណារក្ស</option>
              <option value="មន្ត្រីទីចាត់ការ">មន្ត្រីទីចាត់ការ</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-slate-500 font-medium px-2">
            <span>គ្រូបង្រៀនសកម្ម៖ <strong className="text-slate-900 font-bold">{filteredTeachers.filter(t => t.status === 'active').length}</strong> រូប</span>
          </div>
        </div>

        {/* Quick Check-in Summary & Batch Action Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-indigo-50/50 -mx-4 -mb-4 p-3 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700">វត្តមានថ្ងៃនេះ ({new Date().toISOString().split('T')[0]})៖</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              {filteredTeachers.filter(t => getTeacherCheckInStatus(t.id)?.status === 'present').length} / {filteredTeachers.filter(t => t.status === 'active').length} បាន Check-in
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const activeOnes = filteredTeachers.filter(t => t.status === 'active');
                activeOnes.forEach(t => recordTeacherQuickCheckIn(t.id, 'present'));
                showToast(`បាន Check-in គ្រូបង្រៀនសកម្មទាំងអស់ចំនួន ${activeOnes.length} នាក់ជោគជ័យ!`);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              title="Check-in គ្រូសកម្មទាំងអស់ក្នុងពេលតែមួយ"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check-in គ្រូទាំងអស់ថ្ងៃនេះ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map(teacher => {
          const checkInRecord = getTeacherCheckInStatus(teacher.id);
          const isCheckedIn = checkInRecord?.status === 'present';

          return (
          <div
            key={teacher.id}
            className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              isCheckedIn ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200/80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                    alt={teacher.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm md:text-base">{teacher.nameKhmer}</h3>
                    <p className="text-xs text-slate-500 font-times">{teacher.nameLatin || teacher.staffCode}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                      {teacher.role}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      teacher.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {teacher.status === 'active' ? 'សកម្ម' : 'ផ្អាក'}
                  </span>
                </div>
              </div>

              {/* Quick Check-in Toggle Widget */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'}`} />
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">
                      {isCheckedIn ? 'វត្តមាន៖ បាន Check-in' : 'វត្តមាន៖ មិនទាន់ Check-in'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isCheckedIn && checkInRecord?.notes ? checkInRecord.notes : 'ចុច Toggle ដើម្បីកត់ត្រាវត្តមាន'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    recordTeacherQuickCheckIn(teacher.id, isCheckedIn ? 'absent' : 'present');
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    isCheckedIn ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isCheckedIn}
                  title={isCheckedIn ? 'ចុចដើម្បីប្តូរទៅអវត្តមាន' : 'ចុច Quick Check-in វត្តមាន'}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isCheckedIn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Badges & Details */}
              <div className="mt-3 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">អត្តលេខមន្ត្រីរាជការ៖</span>
                  <span className="font-times font-bold text-indigo-900">{teacher.staffCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">បន្ទុកថ្នាក់៖</span>
                  <span className="font-bold text-slate-800">
                    {teacher.assignedGrade ? `ថ្នាក់ទី ${teacher.assignedGrade}${teacher.assignedSection || 'ក'}` : 'គ្មាន'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">កម្រិតបណ្តុះបណ្តាល៖</span>
                  <span className="font-medium text-slate-700 truncate max-w-[150px]">{teacher.qualification}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">ទំនាក់ទំនង៖</span>
                  <span className="font-times text-slate-700">{teacher.phone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedTeacherForProfile(teacher)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                  title="មើលប្រវត្តិរូបពេញលេញ"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-[11px]">ប្រវត្តិរូប</span>
                </button>
                <button
                  onClick={() => setSelectedTeacherForSchedule(teacher)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                  title="កាលវិភាគបង្រៀន"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px]">កាលវិភាគ</span>
                </button>
              </div>

              {currentUser.role === 'director' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="កែប្រែ"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យលោកគ្រូ/អ្នកគ្រូ «${teacher.nameKhmer}» ឬទេ?`)) {
                        deleteTeacher(teacher.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="លុប"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Official MoEYS Teacher Registry Table (Print Only) */}
      <div className="hidden print:block p-6 bg-white font-battambang relative overflow-hidden">
        <AngkorPageWatermark opacity={0.035} />

        <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-4 mb-4 relative z-1">
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p className="text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
            <p className="text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
            <p className="font-bold text-blue-950 font-moul text-sm pt-0.5">{schoolProfile.nameKhmer}</p>
            <p className="text-[10px] text-slate-500 font-mono">កូដសាលា: {schoolProfile.schoolCode}</p>
          </div>

          <div className="text-center">
            <MoEYSRoyalHeader />
          </div>

          <div className="text-right space-y-1">
            <p className="font-bold text-xs text-slate-900 font-moul">ស្តង់ដារសាលាបឋមសិក្សាគំរូ</p>
            <p className="text-xs text-slate-700">ឆ្នាំសិក្សា៖ <span className="font-bold font-times">{schoolProfile.academicYear}</span></p>
            <p className="text-[10px] text-slate-500 font-times">កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}</p>
          </div>
        </div>

        <div className="text-center my-4 relative z-1">
          <h2 className="font-moul text-base text-slate-950">
            បញ្ជីរាយនាមបុគ្គលិកអប់រំ និងគ្រូបង្រៀន
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            ចំនួនបុគ្គលិកសរុប៖ <strong className="font-times">{teachers.length}</strong> នាក់ (ស្រី <strong className="font-times">{teachers.filter(t => t.gender === 'F').length}</strong> នាក់)
          </p>
        </div>

        <table className="w-full text-left text-xs border-collapse border border-slate-300 relative z-1">
          <thead>
            <tr className="bg-slate-100 font-bold text-slate-800">
              <th className="border border-slate-300 py-2 px-2 text-center">ល.រ</th>
              <th className="border border-slate-300 py-2 px-3">អត្តលេខ</th>
              <th className="border border-slate-300 py-2 px-3">គោត្តនាម-នាម</th>
              <th className="border border-slate-300 py-2 px-2 text-center">ភេទ</th>
              <th className="border border-slate-300 py-2 px-3">មុខតំណែង / តួនាទី</th>
              <th className="border border-slate-300 py-2 px-3 text-center">បន្ទុកថ្នាក់</th>
              <th className="border border-slate-300 py-2 px-3">កម្រិតបណ្តុះបណ្តាល</th>
              <th className="border border-slate-300 py-2 px-3">លេខទូរស័ព្ទ</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, idx) => (
              <tr key={t.id} className="border-b border-slate-200">
                <td className="border border-slate-300 py-2 px-2 text-center">{idx + 1}</td>
                <td className="border border-slate-300 py-2 px-3 font-mono font-bold text-slate-800">{t.staffCode}</td>
                <td className="border border-slate-300 py-2 px-3 font-bold">{t.nameKhmer}</td>
                <td className="border border-slate-300 py-2 px-2 text-center">{t.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</td>
                <td className="border border-slate-300 py-2 px-3">{t.role}</td>
                <td className="border border-slate-300 py-2 px-3 text-center font-bold">
                  {t.assignedGrade ? `ថ្នាក់ទី ${t.assignedGrade}${t.assignedSection || 'ក'}` : '-'}
                </td>
                <td className="border border-slate-300 py-2 px-3">{t.qualification}</td>
                <td className="border border-slate-300 py-2 px-3 font-mono">{t.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-8 text-xs text-slate-800 pt-6">
          <div className="text-center">
            <p>បានឃើញ និងឯកភាព</p>
            <strong className="block mt-1 font-moul text-slate-900">នាយិកាសាលា</strong>
            <div className="h-16" />
            <p className="font-bold">{schoolProfile.principalName}</p>
          </div>

          <div className="text-center">
            <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ២០២៤</p>
            <strong className="block mt-1 font-moul text-slate-900">អ្នករៀបចំបញ្ជី</strong>
            <div className="h-16" />
            <p className="font-bold">អ្នកគ្រូ ពេជ្រ ធីតា</p>
          </div>
        </div>
      </div>

      {/* Teacher Full Profile Modal */}
      {selectedTeacherForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-5 text-white flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-slate-200 flex-shrink-0">
                  <img
                    src={selectedTeacherForProfile.avatarUrl}
                    alt={selectedTeacherForProfile.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-moul">{selectedTeacherForProfile.nameKhmer}</h3>
                  <p className="text-xs text-indigo-100">
                    {selectedTeacherForProfile.nameLatin && `${selectedTeacherForProfile.nameLatin} • `}
                    <span className="font-times">{selectedTeacherForProfile.staffCode}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="បោះពុម្ពប្រវត្តិរូប"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedTeacherForProfile(null)}
                  className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs sm:text-sm relative overflow-hidden font-battambang">
              <AngkorPageWatermark opacity={0.035} />

              {/* Official Ministry Header on Print */}
              <div className="hidden print:flex justify-between items-start border-b border-slate-300 pb-4 mb-4 relative z-1">
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold text-slate-800">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-semibold text-slate-700">មន្ទីរអប់រំ {schoolProfile.province}</p>
                  <p className="font-semibold text-slate-700">ការិយាល័យអប់រំ {schoolProfile.district}</p>
                  <p className="font-bold text-blue-900 font-moul text-sm pt-0.5">{schoolProfile.nameKhmer}</p>
                  <p className="text-[11px] text-slate-500 font-times">លេខកូដសាលា: {schoolProfile.schoolCode}</p>
                </div>
                <div className="text-center">
                  <MoEYSRoyalHeader />
                  <p className="font-moul text-blue-950 text-sm mt-2">ប្រវត្តិរូបសង្ខេបគ្រូបង្រៀន និងបុគ្គលិកអប់រំ</p>
                </div>
                <div className="w-16 h-20 border border-slate-300 rounded overflow-hidden bg-slate-100 flex items-center justify-center text-[10px]">
                  <img
                    src={selectedTeacherForProfile.avatarUrl}
                    alt={selectedTeacherForProfile.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Professional Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">តួនាទី / មុខងារ</span>
                  <strong className="text-sm text-slate-900 font-bold">{selectedTeacherForProfile.role}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">បន្ទុកថ្នាក់</span>
                  <strong className="text-sm text-indigo-900 font-bold">
                    {selectedTeacherForProfile.assignedGrade ? `ថ្នាក់ទី ${selectedTeacherForProfile.assignedGrade}${selectedTeacherForProfile.assignedSection || 'ក'}` : 'គ្មាន'}
                    {selectedTeacherForProfile.assignedGrade2 && ` និងទី ${selectedTeacherForProfile.assignedGrade2}${selectedTeacherForProfile.assignedSection2 || 'ខ'}`}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">ថ្ងៃខែឆ្នាំកំណើត</span>
                  <strong className="text-sm text-slate-900 font-bold font-times">{selectedTeacherForProfile.dob}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">អតីតភាពការងារ</span>
                  <strong className="text-sm text-slate-900 font-bold">{selectedTeacherForProfile.yearsOfService} ឆ្នាំ</strong>
                </div>
              </div>

              {/* Civil Service & Qualifications */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  ព័ត៌មានក្របខណ្ឌ និងគរុកោសល្យ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-1">
                    <p className="text-slate-700"><strong>ក្របខណ្ឌ៖</strong> {selectedTeacherForProfile.framework || 'ក្របខណ្ឌគ្រូបង្រៀនកម្រិតមូលដ្ឋាន'}</p>
                    <p className="text-slate-700"><strong>កម្រិតបណ្តុះបណ្តាល៖</strong> {selectedTeacherForProfile.qualification}</p>
                    <p className="text-slate-700"><strong>ឯកទេសបង្រៀន៖</strong> {selectedTeacherForProfile.specialization || selectedTeacherForProfile.teachingSubject || 'គរុកោសល្យបឋមសិក្សា'}</p>
                  </div>
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-1">
                    <p className="text-slate-700"><strong>ថ្ងៃចូលបម្រើការងារ៖</strong> <span className="font-times">{selectedTeacherForProfile.startDate}</span></p>
                    <p className="text-slate-700"><strong>ថ្ងៃតាំងស៊ប់ក្នុងក្របខណ្ឌ៖</strong> <span className="font-times">{selectedTeacherForProfile.civilServiceEntryDate || selectedTeacherForProfile.startDate}</span></p>
                    <p className="text-slate-700"><strong>លេខអត្តសញ្ញាណប័ណ្ណ៖</strong> <span className="font-times font-bold">{selectedTeacherForProfile.nationalId || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Banking & Payroll */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  ព័ត៌មានបើកប្រាក់បៀវត្សរ៍ (Payroll / Banking)
                </h4>
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-xs block">ឈ្មោះធនាគារដៃគូ</span>
                    <strong className="text-emerald-950 font-bold">{selectedTeacherForProfile.bankName || 'ធនាគារ អេស៊ីលីដា (ACLEDA Bank)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">លេខគណនីធនាគារ</span>
                    <strong className="text-emerald-950 font-bold font-times text-base">{selectedTeacherForProfile.bankAccountNumber || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Address Breakdown */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  ទីកន្លែងកំណើត និងទីលំនៅបច្ចុប្បន្ន
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block">ទីកន្លែងកំណើត</span>
                    <p className="font-medium text-slate-800 mt-1">{selectedTeacherForProfile.pob || 'ខេត្តបាត់ដំបង'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block">ទីលំនៅបច្ចុប្បន្ន</span>
                    <p className="font-medium text-slate-800 mt-1">{selectedTeacherForProfile.currentAddress || 'ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង'}</p>
                  </div>
                </div>
              </div>

              {/* Family and Spouse */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  ស្ថានភាពគ្រួសារ និងប្តី/ប្រពន្ធ
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 text-xs block">ស្ថានភាពគ្រួសារ</span>
                    <strong className="text-slate-900">{selectedTeacherForProfile.maritalStatus || 'រៀបការរួច'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">ឈ្មោះប្តី/ប្រពន្ធ</span>
                    <strong className="text-slate-900">{selectedTeacherForProfile.spouseName || 'មិនមាន'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">ចំនួនកូនក្នុងបន្ទុក</span>
                    <strong className="text-slate-900">{selectedTeacherForProfile.childrenCount || 0} នាក់</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Schedule Modal */}
      {selectedTeacherForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-800 to-blue-800 p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold font-moul">កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍</h3>
                <p className="text-xs text-indigo-100">
                  {selectedTeacherForSchedule.nameKhmer} • ថ្នាក់ទី {selectedTeacherForSchedule.assignedGrade}{selectedTeacherForSchedule.assignedSection || 'ក'}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeacherForSchedule(null)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">ថ្ងៃ</th>
                      <th className="p-3">ម៉ោងបង្រៀន</th>
                      <th className="p-3">មុខវិជ្ជា</th>
                      <th className="p-3 text-center">ថ្នាក់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTeacherForSchedule.schedule && selectedTeacherForSchedule.schedule.length > 0 ? (
                      selectedTeacherForSchedule.schedule.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-800">{s.day}</td>
                          <td className="p-3 font-times text-slate-600">{s.timeSlot}</td>
                          <td className="p-3 font-semibold text-indigo-900">{s.subject}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold text-xs">
                              {s.gradeClass}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-400">
                          មិនទាន់មានកាលវិភាគបង្រៀនលម្អិតនៅឡើយទេ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-5 text-white flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-moul">
                    {editingTeacher ? 'កែប្រែព័ត៌មានគ្រូបង្រៀន' : 'បន្ថែមគ្រូបង្រៀនថ្មី'}
                  </h3>
                  <p className="text-xs text-indigo-100">
                    ទម្រង់ទិន្នន័យមន្ត្រីរាជការអប់រំ និងគ្រូបង្រៀនបឋមសិក្សា (MoEYS Standard)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 text-xs sm:text-sm">
              {/* Auto-Save Draft Indicator */}
              <FormAutoSaveIndicator
                hasSavedDraft={hasSavedDraft}
                lastSavedTime={lastSavedTime}
                isSaving={isSaving}
                onDiscardDraft={discardDraft}
                isEditing={!!editingTeacher}
              />

              {/* Identification */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  ១. អត្តសញ្ញាណ និងតួនាទី
                </h4>

                {/* Profile Photo Uploader for Director / Admin */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>រូបថតប្រវត្តិរូបគ្រូ / បុគ្គលិក (Profile Photo)</span>
                    </label>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                        className="text-[11px] text-red-600 hover:text-red-800 font-medium cursor-pointer"
                      >
                        លុបរូបថតចេញ
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-100 border-2 border-indigo-200 overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt="Teacher Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck className="w-8 h-8 text-indigo-400" />
                      )}
                    </div>

                    {/* Action Buttons & Input */}
                    <div className="flex-1 space-y-2 w-full">
                      {/* Hidden File Inputs */}
                      <input
                        ref={teacherPhotoInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/jpg"
                        onChange={handleTeacherPhotoFileChange}
                        className="hidden"
                      />
                      <input
                        id="camera-staff-photo-capture"
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleTeacherPhotoFileChange}
                        className="hidden"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={isUploadingPhoto}
                          onClick={() => teacherPhotoInputRef.current?.click()}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isUploadingPhoto ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>កំពុងផ្ទុកឡើង...</span>
                            </>
                          ) : (
                            <>
                              <CloudUpload className="w-3.5 h-3.5" />
                              <span>ជ្រើសរូបថត (Gallery/Files)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isUploadingPhoto}
                          onClick={() => {
                            const cam = document.getElementById('camera-staff-photo-capture') as HTMLInputElement;
                            cam?.click();
                          }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>ថតរូបផ្ទាល់ (Camera)</span>
                        </button>
                      </div>

                      <input
                        type="url"
                        value={formData.avatarUrl}
                        onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                        placeholder="ឬបញ្ចូលតំណភ្ជាប់រូបភាពផ្ទាល់ (URL / Google Drive Link)..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះជាភាសាខ្មែរ (ជ្រើសរើសពីគណនី) *
                    </label>
                    <select
                      required
                      value={formData.nameKhmer}
                      onChange={e => {
                        const selectedName = e.target.value;
                        const matchingUser = appUsers?.find(u => u.nameKhmer === selectedName);
                        setFormData({ 
                          ...formData, 
                          nameKhmer: selectedName,
                          ...(matchingUser?.nameLatin ? { nameLatin: matchingUser.nameLatin } : {}),
                          ...(matchingUser?.phone ? { phone: matchingUser.phone } : {}),
                          ...(matchingUser?.email ? { email: matchingUser.email } : {}),
                          ...(matchingUser?.avatarUrl ? { avatarUrl: matchingUser.avatarUrl } : {})
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="">-- សូមជ្រើសរើសគណនីគ្រូ --</option>
                      {appUsers
                        ?.filter(u => ['teacher', 'director', 'deputy_director', 'secretary', 'librarian'].includes(u.role))
                        .map(user => (
                          <option key={user.id} value={user.nameKhmer}>
                            {user.nameKhmer} ({user.role})
                          </option>
                      ))}
                      {/* Allow keeping existing name if it doesn't match an account */}
                      {formData.nameKhmer && !appUsers?.some(u => u.nameKhmer === formData.nameKhmer) && (
                        <option value={formData.nameKhmer}>{formData.nameKhmer} (គ្មានគណនី)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះជាអក្សរឡាតាំង
                    </label>
                    <input
                      type="text"
                      value={formData.nameLatin}
                      onChange={e => setFormData({ ...formData, nameLatin: e.target.value })}
                      placeholder="e.g. Sous Chantha"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ភេទ *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="F">ស្រី (Female)</option>
                      <option value="M">ប្រុស (Male)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ថ្ងៃខែឆ្នាំកំណើត
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      លេខអត្តសញ្ញាណប័ណ្ណ
                    </label>
                    <input
                      type="text"
                      value={formData.nationalId}
                      onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                      placeholder="ឧ. 020145899"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      លេខទូរស័ព្ទ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="ឧ. 012 345 678"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      អ៊ីមែល
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@moeys.gov.kh"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Framework & Teaching Assignment */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  ២. ព័ត៌មានក្របខណ្ឌ និងភារកិច្ចបង្រៀន
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      តួនាទី / មុខងារ *
                    </label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="គ្រូបន្ទុកថ្នាក់">គ្រូបន្ទុកថ្នាក់</option>
                      <option value="មន្ត្រីទីចាត់ការ">មន្ត្រីទីចាត់ការ</option>
                      <option value="នាយកសាលា">នាយកសាលា</option>
                      <option value="នាយករង">នាយករង</option>
                      <option value="បណ្ណារក្ស">បណ្ណារក្ស</option>
                      <option value="លេខាធិការ">លេខាធិការ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      បន្ទុកថ្នាក់ទី១ (ឧ. ព្រឹក)
                    </label>
                    <select
                      value={formData.assignedGrade || ''}
                      onChange={e => setFormData({ ...formData, assignedGrade: e.target.value ? Number(e.target.value) : ('' as unknown as number), assignedSection: e.target.value ? (formData.assignedSection || 'ក') : '' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">គ្មានថ្នាក់</option>
                      <option value="1">ថ្នាក់ទី១</option>
                      <option value="2">ថ្នាក់ទី២</option>
                      <option value="3">ថ្នាក់ទី៣</option>
                      <option value="4">ថ្នាក់ទី៤</option>
                      <option value="5">ថ្នាក់ទី៥</option>
                      <option value="6">ថ្នាក់ទី៦</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      បន្ទប់/ផ្នែក (ថ្នាក់ទី១)
                    </label>
                    <input
                      type="text"
                      value={formData.assignedSection || ''}
                      disabled={!formData.assignedGrade}
                      onChange={e => setFormData({ ...formData, assignedSection: e.target.value })}
                      placeholder={formData.assignedGrade ? "ឧ. ក" : "គ្មានថ្នាក់កាន់"}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Second Class Assignment (e.g. Afternoon shift) - Only show if Grade 1 is assigned */}
                {formData.assignedGrade ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-900 mb-1">
                      បន្ទុកថ្នាក់ទី២ បន្ថែម (ឧ. រសៀល - បើមាន)
                    </label>
                    <select
                      value={formData.assignedGrade2 || ''}
                      onChange={e => setFormData({ ...formData, assignedGrade2: e.target.value ? Number(e.target.value) : ('' as unknown as number) })}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="">-- គ្មានថ្នាក់ទី២ --</option>
                      <option value="1">ថ្នាក់ទី១</option>
                      <option value="2">ថ្នាក់ទី២</option>
                      <option value="3">ថ្នាក់ទី៣</option>
                      <option value="4">ថ្នាក់ទី៤</option>
                      <option value="5">ថ្នាក់ទី៥</option>
                      <option value="6">ថ្នាក់ទី៦</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-900 mb-1">
                      បន្ទប់/ផ្នែក (ថ្នាក់ទី២)
                    </label>
                    <input
                      type="text"
                      value={formData.assignedSection2 || ''}
                      onChange={e => setFormData({ ...formData, assignedSection2: e.target.value })}
                      placeholder="ឧ. ខ"
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ប្រភេទក្របខណ្ឌ
                    </label>
                    <input
                      type="text"
                      value={formData.framework}
                      onChange={e => setFormData({ ...formData, framework: e.target.value })}
                      placeholder="ឧ. ក្របខណ្ឌគ្រូបង្រៀនកម្រិតមូលដ្ឋាន"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      កម្រិតបណ្តុះបណ្តាល
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="ឧ. បរិញ្ញាបត្រគរុកោសល្យ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឯកទេស / មុខវិជ្ជា
                    </label>
                    <input
                      type="text"
                      value={formData.teachingSubject}
                      onChange={e => setFormData({ ...formData, teachingSubject: e.target.value })}
                      placeholder="ឧ. ភាសាខ្មែរ-គណិតវិទ្យា"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Banking & Payroll */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  ៣. ព័ត៌មានបើកប្រាក់បៀវត្សរ៍ (Payroll / Banking)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះធនាគារ
                    </label>
                    <select
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="ធនាគារ អេស៊ីលីដា (ACLEDA Bank)">ធនាគារ អេស៊ីលីដា (ACLEDA Bank)</option>
                      <option value="ធនាគារ កាណាឌីយ៉ា (Canadia Bank)">ធនាគារ កាណាឌីយ៉ា (Canadia Bank)</option>
                      <option value="ធនាគារ វីង (Wing Bank)">ធនាគារ វីង (Wing Bank)</option>
                      <option value="ធនាគារ ស្ថាបនា (Sathapana Bank)">ធនាគារ ស្ថាបនា (Sathapana Bank)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      លេខគណនីធនាគារ
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      placeholder="ឧ. 0102-3344-5566-77"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingTeacher ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលគ្រូបង្រៀន'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Student Attendance Modal */}
      {isBatchAttendanceOpen && (
        <BatchStudentAttendanceModal
          isOpen={isBatchAttendanceOpen}
          onClose={() => setIsBatchAttendanceOpen(false)}
          defaultGrade={batchModalGrade}
          defaultSection={batchModalSection}
        />
      )}
    </div>
  );
};
