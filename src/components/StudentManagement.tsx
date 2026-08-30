import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import { useSchool } from '../context/SchoolContext';
import { Student, Gender, LivingCondition, AcademicHistoryStatus, OrphanStatus } from '../types';
import { AddressSelector } from './common/AddressSelector';
import { exportStudentsToGoogleSheets } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import { StudentSearchIndex } from '../utils/searchIndex';
import {
  UserPlus,
  UserCheck,
  ShieldAlert,
  Check,
  Search,
  Filter,
  Eye,
  Edit2,
  Key,
  Trash2,
  QrCode,
  HeartPulse,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  X,
  Plus,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  GraduationCap,
  ExternalLink,
  RefreshCw,
  Award,
  AlertTriangle,
  Users,
  Sparkles,
  ArrowRightLeft,
  Printer,
  Trophy,
  Medal,
  Camera,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  TrendingUp,
  BarChart3,
  Lock,
  CalendarDays,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { uploadStudentProfilePhoto } from '../services/firebaseStorage';
import {
  MoEYSRoyalHeader,
  AngkorPageWatermark
} from './AngkorMotif';
import { StudentBadgesManagementTab } from './badges/StudentBadgesManagementTab';
import { BadgeIcon } from './badges/BadgeIcon';
import { AwardBadgeModal } from './badges/AwardBadgeModal';
import { StudentBadgeShowcaseModal } from './badges/StudentBadgeShowcaseModal';
import { CertificateModal } from './badges/CertificateModal';
import { useFormAutoSave } from '../hooks/useFormAutoSave';
import { FormAutoSaveIndicator } from './common/FormAutoSaveIndicator';
import { ConfirmDeleteDialog } from './common/ConfirmDeleteDialog';
import { StudentProgressTrendChart } from './StudentProgressTrendChart';
import { MultiStudentProfileSummaryPdfModal } from './MultiStudentProfileSummaryPdfModal';
import { StudentProfilePdfModal } from './StudentProfilePdfModal';
import { getStudentRiskAlert, getAllStudentRiskAlerts } from '../utils/studentRiskAlerts';
import { StudentAnalyticsDashboard } from './StudentAnalyticsDashboard';
import { MoEYSStudentRecordMasterModal } from './MoEYSStudentRecordMasterModal';
import { splitName, calculateStudentAge, formatStudentToMoEYSRow } from '../utils/studentMoeyHelpers';

export const StudentManagement: React.FC = () => {
  const {
    currentUser,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteAllStudents,
    pullStudentsToClass,
    searchQuery,
    schoolProfile,
    showToast,
    setActiveTab,
    scores,
    attendanceRecords,
    studentBadgeAssignments,
    getStudentBadges,
    getStudentTotalPoints,
    verifyAndResetStudentPassword,
    canAccessStudentDashboard,
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear
  } = useSchool();

  const isDirector = currentUser?.role === 'director' || currentUser?.role === 'super_admin';
  const isSecretary = currentUser?.role === 'secretary';
  const isTeacher = currentUser?.role === 'teacher';
  const teacherGrade = currentUser?.assignedGrade || 1;
  const teacherSection = currentUser?.assignedSection || 'ក';

  // Academic Year Filter for Student Management ('all' or specific year like '២០២៤ - ២០២៥')
  const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] = useState<string>(selectedAcademicYear || 'all');

  // Keep filter synced when user switches global year if currently viewing a single year
  useEffect(() => {
    if (selectedAcademicYear && selectedAcademicYearFilter !== 'all' && selectedAcademicYearFilter !== selectedAcademicYear) {
      setSelectedAcademicYearFilter(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  // Base list of students accessible by the current user
  const accessibleStudents = useMemo(() => {
    if (isTeacher) {
      return students.filter(s => s.grade === teacherGrade && s.section === teacherSection);
    }
    return students;
  }, [students, isTeacher, teacherGrade, teacherSection]);

  // Pull Students To Class State (for Teacher)
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [selectedPullStudentIds, setSelectedPullStudentIds] = useState<string[]>([]);
  const [pullSearchQuery, setPullSearchQuery] = useState('');
  const [pullGradeFilter, setPullGradeFilter] = useState<number | 'all'>('all');

  // Mode: 'roster' | 'badges' | 'analytics'
  const [viewMode, setViewMode] = useState<'roster' | 'badges' | 'analytics'>('roster');
  const [selectedStudentForAnalyticsId, setSelectedStudentForAnalyticsId] = useState<string | null>(null);
  const [selectedStudentForBadgeShowcase, setSelectedStudentForBadgeShowcase] = useState<Student | null>(null);
  const [selectedStudentForAwardBadge, setSelectedStudentForAwardBadge] = useState<Student | null>(null);
  const [selectedCertificateForView, setSelectedCertificateForView] = useState<any | null>(null);

  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>(isTeacher ? teacherGrade : 'all');
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all');
  const [selectedVulnerability, setSelectedVulnerability] = useState<'all' | 'idpoor' | 'scholarship' | 'orphan' | 'disability' | 'repeater'>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'at_risk' | 'consecutive_absent' | 'score_drop' | 'normal'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isSingleDeleteDialogOpen, setIsSingleDeleteDialogOpen] = useState(false);
  const [isMoeyMasterModalOpen, setIsMoeyMasterModalOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStudentForPdfPrint, setSelectedStudentForPdfPrint] = useState<Student | null>(null);

  // Generate QR Code when viewing a student
  useEffect(() => {
    if (selectedStudentForView) {
      setTimeout(() => {
        const canvas = document.getElementById(`student-qr-canvas-${selectedStudentForView.id}`) as HTMLCanvasElement;
        if (canvas) {
          const qrData = JSON.stringify({
            id: selectedStudentForView.id,
            code: selectedStudentForView.code,
            name: selectedStudentForView.nameKhmer,
            grade: `${selectedStudentForView.grade}${selectedStudentForView.section}`,
            school: schoolProfile.nameKhmer,
            phone: selectedStudentForView.phone || selectedStudentForView.guardianPhone || 'N/A'
          });
          QRCode.toCanvas(canvas, qrData, { width: 112, margin: 1 }, (error) => {
            if (error) console.error('QR generation error:', error);
          });
        }
      }, 100);
    }
  }, [selectedStudentForView]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isMultiPdfModalOpen, setIsMultiPdfModalOpen] = useState(false);

  // Profile Photo Upload State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDragOverPhoto, setIsDragOverPhoto] = useState(false);
  const [photoUploadSource, setPhotoUploadSource] = useState<'firebase' | 'base64' | 'url' | null>(null);

  // Handle Photo File Upload to Firebase Storage
  const handlePhotoFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ (JPG, PNG, WebP)', 'error');
      return;
    }
    
    if (file.size > 12 * 1024 * 1024) {
      showToast('ទំហំរូបភាពធំពេក សូមជ្រើសរើសរូបក្រោម 12MB', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const studentIdentifier = formData.nameLatin || formData.nameKhmer || 'student';
      const result = await uploadStudentProfilePhoto(file, studentIdentifier);
      setFormData(prev => ({ ...prev, avatarUrl: result.downloadUrl }));
      setPhotoUploadSource(result.isFirebaseStorage ? 'firebase' : 'base64');
      if (result.isFirebaseStorage) {
        showToast('បាន Upload រូបថតសិស្សទៅកាន់ Firebase Storage ជោគជ័យ!', 'success');
      } else {
        showToast('បានរក្សាទុក និង Compress រូបថតសិស្សដោយជោគជ័យ!', 'success');
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      showToast('មានបញ្ហាក្នុងការ Upload រូបថត', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // New Student Form State
  const initialFormState = {
    nameKhmer: '',
    nameLatin: '',
    gender: 'M' as Gender,
    dob: '2015-01-01',
    grade: 1,
    section: 'ក',
    phone: '',
    // POB breakdown
    pobVillage: '',
    pobCommune: '',
    pobDistrict: '',
    pobProvince: 'ខេត្តបាត់ដំបង',
    // Current Address breakdown
    currentHouseNumber: '',
    currentStreetNumber: '',
    currentVillage: '',
    currentCommune: '',
    currentDistrict: '',
    currentProvince: 'ខេត្តបាត់ដំបង',
    // Family breakdown
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
    notes: '',
    academicYear: selectedAcademicYear || schoolProfile.academicYear || '២០២៤ - ២០២៥'
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
  } = useFormAutoSave('phnom_pom_draft_student_registration', initialFormState, {
    enabled: isAddModalOpen && !editingStudent
  });

  // Build and memoize Fuzzy Search Index for students (scoped to accessibleStudents)
  const studentSearchIndex = useMemo(() => {
    return new StudentSearchIndex(accessibleStudents);
  }, [accessibleStudents]);

  // Compute Risk Alerts Map for accessible students (>3 consecutive absences or score drop)
  const studentAlertsMap = useMemo(() => {
    return getAllStudentRiskAlerts(accessibleStudents, scores, attendanceRecords || []);
  }, [accessibleStudents, scores, attendanceRecords]);

  const atRiskCount = useMemo(() => {
    let count = 0;
    studentAlertsMap.forEach(alert => {
      if (alert.hasConsecutiveAbsenceAlert || alert.hasScoreDropAlert) count++;
    });
    return count;
  }, [studentAlertsMap]);

  const absenceAlertCount = useMemo(() => {
    let count = 0;
    studentAlertsMap.forEach(alert => {
      if (alert.hasConsecutiveAbsenceAlert) count++;
    });
    return count;
  }, [studentAlertsMap]);

  const scoreDropAlertCount = useMemo(() => {
    let count = 0;
    studentAlertsMap.forEach(alert => {
      if (alert.hasScoreDropAlert) count++;
    });
    return count;
  }, [studentAlertsMap]);

  // Filter and fuzzy search students
  const filteredStudents = useMemo(() => {
    const query = (searchQuery || localSearch).trim();
    
    // Step 1: Apply Fuzzy Search Index if query exists
    let candidateStudents = accessibleStudents;
    if (query) {
      const searchResults = studentSearchIndex.search(query);
      candidateStudents = searchResults.map(res => res.item);
    }

    // Step 2: Apply categorical filters (Grade, Gender, Vulnerability, Risk Alerts)
    return candidateStudents.filter(student => {
      const matchesGrade = isTeacher
        ? (student.grade === teacherGrade && student.section === teacherSection)
        : (selectedGrade === 'all' || student.grade === selectedGrade);
      const matchesGender = selectedGender === 'all' || student.gender === selectedGender;

      let matchesVulnerability = true;
      if (selectedVulnerability === 'idpoor') {
        matchesVulnerability = student.livingCondition === 'ក្រ១' || student.livingCondition === 'ក្រ២' || Boolean(student.idPoorCardNumber);
      } else if (selectedVulnerability === 'scholarship') {
        matchesVulnerability = Boolean(student.scholarship && student.scholarship !== 'មិនមាន');
      } else if (selectedVulnerability === 'orphan') {
        matchesVulnerability = Boolean(student.orphanStatus && student.orphanStatus !== 'មិនកំព្រា');
      } else if (selectedVulnerability === 'disability') {
        matchesVulnerability = Boolean(student.disability && student.disability !== 'មិនពិការ');
      } else if (selectedVulnerability === 'repeater') {
        matchesVulnerability = student.academicHistory === 'ត្រួតថ្នាក់';
      }

      let matchesRisk = true;
      const alert = studentAlertsMap.get(student.id);
      if (selectedRiskFilter === 'at_risk') {
        matchesRisk = Boolean(alert && (alert.hasConsecutiveAbsenceAlert || alert.hasScoreDropAlert));
      } else if (selectedRiskFilter === 'consecutive_absent') {
        matchesRisk = Boolean(alert && alert.hasConsecutiveAbsenceAlert);
      } else if (selectedRiskFilter === 'score_drop') {
        matchesRisk = Boolean(alert && alert.hasScoreDropAlert);
      } else if (selectedRiskFilter === 'normal') {
        matchesRisk = !alert || (!alert.hasConsecutiveAbsenceAlert && !alert.hasScoreDropAlert);
      }

      // Academic Year Filter: 'all' matches all, otherwise matches student.academicYear or default school academicYear
      const matchesAcademicYear = selectedAcademicYearFilter === 'all'
        ? true
        : (student.academicYear ? student.academicYear === selectedAcademicYearFilter : selectedAcademicYearFilter === schoolProfile.academicYear);

      return matchesGrade && matchesGender && matchesVulnerability && matchesRisk && matchesAcademicYear;
    });
  }, [accessibleStudents, isTeacher, teacherGrade, teacherSection, studentSearchIndex, searchQuery, localSearch, selectedGrade, selectedGender, selectedVulnerability, selectedRiskFilter, studentAlertsMap, selectedAcademicYearFilter, schoolProfile.academicYear]);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameKhmer.trim()) {
      showToast('សូមបញ្ចូលឈ្មោះសិស្សជាភាសាខ្មែរ!', 'error');
      return;
    }

    // Calculate BMI
    const heightInMeters = (formData.heightCm || 120) / 100;
    const bmi = Number(((formData.weightKg || 22) / (heightInMeters * heightInMeters)).toFixed(1));
    let nutritionStatus: 'normal' | 'underweight' | 'overweight' | 'wasted' = 'normal';
    if (bmi < 14) nutritionStatus = 'underweight';
    else if (bmi > 20) nutritionStatus = 'overweight';

    // MoEYS Standard Validation
    const errors: string[] = [];

    // 1. Khmer Name Validation (Required, at least 2 chars, Khmer script preferred)
    if (!formData.nameKhmer || formData.nameKhmer.trim().length < 2) {
      errors.push('សូមបញ្ចូលគោត្តនាម និងនាមសិស្សជាភាសាខ្មែរ (យ៉ាងហោចណាស់ ២ តួអក្សរ)');
    }

    // 2. Date of Birth & MoEYS Primary School Age Validation (Normally 5 to 16 years old)
    if (editingStudent) {
      if (!formData.dob) {
      errors.push('សូមជ្រើសរើសថ្ងៃខែឆ្នាំកំណើតរបស់សិស្ស');
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errors.push('ថ្ងៃខែឆ្នាំកំណើតមិនត្រឹមត្រូវតាមទម្រង់');
      } else {
        const ageInYears = today.getFullYear() - birthDate.getFullYear();
        if (birthDate > today) {
          errors.push('ថ្ងៃខែឆ្នាំកំណើតមិនអាចលើសពីថ្ងៃបច្ចុប្បន្នបានទេ');
        } else if (ageInYears < 5) {
          errors.push(`អាយុសិស្សតូចពេកសម្រាប់បឋមសិក្សា (អាយុ ${ageInYears} ឆ្នាំ - ស្តង់ដារក្រសួងគឺចាប់ពី ៦ ឆ្នាំឡើង)`);
        } else if (ageInYears > 18) {
          errors.push(`អាយុសិស្សលើសពី ១៨ ឆ្នាំ សូមពិនិត្យមើលថ្ងៃខែឆ្នាំកំណើតឡើងវិញ`);
        }
      }
    }
    }

    // 3. Grade & Section Validation
    if (!formData.grade || formData.grade < 1 || formData.grade > 6) {
      errors.push('សូមជ្រើសរើសកម្រិតថ្នាក់ពី ថ្នាក់ទី១ ដល់ ថ្នាក់ទី៦');
    }

    if (!formData.section || formData.section.trim().length === 0) {
      errors.push('សូមបញ្ជាក់បន្ទប់/ផ្នែក (ឧ. ក, ខ, គ)');
    }

    // 4. Guardian / Parent Contact Validation
    const contactPhone = formData.guardianPhone || formData.phone;
    if (contactPhone && contactPhone.trim()) {
      // Basic phone format check: digits, spaces, dashes (8-12 digits)
      const cleanPhone = contactPhone.replace(/[\s\-\.]/g, '');
      if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
        errors.push('លេខទូរស័ព្ទទាក់ទងមិនត្រឹមត្រូវតាមទម្រង់ (ឧ. 012 345 678)');
      }
    }

    // If validation errors exist, notify user and prevent saving
    if (errors.length > 0) {
      showToast(`⚠️ សូមបំពេញទិន្នន័យឱ្យបានត្រឹមត្រូវតាមស្តង់ដារក្រសួង៖\n• ${errors.join('\n• ')}`, 'error');
      return;
    }

    const pobFormatted = [formData.pobVillage && `ភូមិ${formData.pobVillage}`, formData.pobCommune && `ឃុំ${formData.pobCommune}`, formData.pobDistrict && `ស្រុក${formData.pobDistrict}`, formData.pobProvince].filter(Boolean).join(' ') || 'ខេត្តបាត់ដំបង';
    const addressFormatted = [formData.currentHouseNumber && `ផ្ទះលេខ${formData.currentHouseNumber}`, formData.currentStreetNumber && `ផ្លូវ${formData.currentStreetNumber}`, formData.currentVillage && `ភូមិ${formData.currentVillage}`, formData.currentCommune && `ឃុំ${formData.currentCommune}`, formData.currentDistrict && `ស្រុក${formData.currentDistrict}`, formData.currentProvince].filter(Boolean).join(' ') || 'ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង';

    const newStudentData: Omit<Student, 'id' | 'code'> = {
      nameKhmer: formData.nameKhmer,
      nameLatin: formData.nameLatin,
      gender: formData.gender,
      dob: formData.dob || '2015-01-01',
      pob: pobFormatted,
      pobVillage: formData.pobVillage,
      pobCommune: formData.pobCommune,
      pobDistrict: formData.pobDistrict,
      pobProvince: formData.pobProvince,
      currentHouseNumber: formData.currentHouseNumber,
      currentStreetNumber: formData.currentStreetNumber,
      currentVillage: formData.currentVillage,
      currentCommune: formData.currentCommune,
      currentDistrict: formData.currentDistrict,
      currentProvince: formData.currentProvince,
      phone: formData.phone,
      grade: Number(formData.grade),
      section: formData.section || 'ក',
      // Family details
      fatherName: formData.fatherName,
      fatherAlive: formData.fatherAlive,
      fatherOccupation: formData.fatherOccupation,
      motherName: formData.motherName,
      motherAlive: formData.motherAlive,
      motherOccupation: formData.motherOccupation,
      guardianName: formData.guardianName || formData.fatherName || formData.motherName || 'អាណាព្យាបាល',
      guardianRelationship: formData.guardianRelationship,
      guardianPhone: formData.guardianPhone || formData.phone,
      guardianOccupation: formData.guardianOccupation || formData.fatherOccupation || formData.motherOccupation,
      address: addressFormatted,
      // Status & Vulnerability
      academicHistory: formData.academicHistory,
      livingCondition: formData.livingCondition,
      orphanStatus: formData.orphanStatus,
      disability: formData.disability,
      scholarship: formData.scholarship,
      ethnicMinority: formData.ethnicMinority,
      specialCharacteristics: formData.specialCharacteristics,
      previousSchool: formData.previousSchool,
      admissionDate: formData.admissionDate,
      academicYear: formData.academicYear || selectedAcademicYear || schoolProfile.academicYear,
      status: formData.status,
      avatarUrl: formData.avatarUrl && formData.avatarUrl.trim() !== ''
        ? formData.avatarUrl
        : (formData.gender === 'F'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
      health: {
        heightCm: Number(formData.heightCm) || 120,
        weightKg: Number(formData.weightKg) || 22,
        bmi,
        nutritionStatus,
        vaccinated: formData.vaccinated,
        bloodType: formData.bloodType,
        notes: formData.notes,
        lastCheckedDate: new Date().toISOString().split('T')[0]
      },
      attendance: editingStudent ? editingStudent.attendance : { present: 0, absentWithPermission: 0, absentWithoutPermission: 0, totalDays: 0 }
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, newStudentData);
      setEditingStudent(null);
      resetForm(initialFormState);
    } else {
      addStudent(newStudentData);
      resetForm(initialFormState);
    }

    setIsAddModalOpen(false);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nameKhmer: student.nameKhmer,
      nameLatin: student.nameLatin || '',
      gender: student.gender,
      dob: student.dob,
      grade: student.grade,
      section: student.section,
      phone: student.phone || '',
      pobVillage: student.pobVillage || '',
      pobCommune: student.pobCommune || '',
      pobDistrict: student.pobDistrict || '',
      pobProvince: student.pobProvince || 'ខេត្តបាត់ដំបង',
      currentHouseNumber: student.currentHouseNumber || '',
      currentStreetNumber: student.currentStreetNumber || '',
      currentVillage: student.currentVillage || '',
      currentCommune: student.currentCommune || '',
      currentDistrict: student.currentDistrict || '',
      currentProvince: student.currentProvince || 'ខេត្តបាត់ដំបង',
      fatherName: student.fatherName || '',
      fatherAlive: student.fatherAlive !== undefined ? student.fatherAlive : true,
      fatherOccupation: student.fatherOccupation || '',
      motherName: student.motherName || '',
      motherAlive: student.motherAlive !== undefined ? student.motherAlive : true,
      motherOccupation: student.motherOccupation || '',
      guardianName: student.guardianName || '',
      guardianRelationship: student.guardianRelationship || 'ឪពុក',
      guardianPhone: student.guardianPhone || '',
      guardianOccupation: student.guardianOccupation || '',
      academicHistory: student.academicHistory || 'ឡើងថ្នាក់',
      livingCondition: student.livingCondition || 'ទូទៅ',
      orphanStatus: student.orphanStatus || 'មិនកំព្រា',
      disability: student.disability || 'មិនពិការ',
      scholarship: student.scholarship || 'មិនមាន',
      ethnicMinority: student.ethnicMinority || 'ខ្មែរ',
      specialCharacteristics: student.specialCharacteristics || '',
      previousSchool: student.previousSchool || '',
      admissionDate: student.admissionDate,
      academicYear: student.academicYear || schoolProfile.academicYear || selectedAcademicYear,
      status: student.status,
      avatarUrl: student.avatarUrl || '',
      heightCm: student.health.heightCm,
      weightKg: student.health.weightKg,
      bloodType: student.health.bloodType,
      vaccinated: student.health.vaccinated,
      notes: student.health.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const exportStudentsToCSV = () => {
    const headers = [
      'អត្តលេខ',
      'ឈ្មោះខ្មែរ',
      'ឈ្មោះឡាតាំង',
      'ភេទ',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'ថ្នាក់',
      'ស្ថានភាពសិក្សា',
      'ស្ថានភាពរស់នៅ',
      'អាហារូបករណ៍',
      'អាណាព្យាបាល',
      'លេខទូរស័ព្ទ',
      'អាសយដ្ឋាន'
    ];
    const rows = filteredStudents.map(s => [
      s.code,
      s.nameKhmer,
      s.nameLatin || '',
      s.gender === 'F' ? 'ស្រី' : 'ប្រុស',
      s.dob,
      `ថ្នាក់ទី ${s.grade}${s.section}`,
      s.academicHistory || 'ឡើងថ្នាក់',
      s.livingCondition || 'ទូទៅ',
      s.scholarship || 'មិនមាន',
      s.guardianName || '',
      s.guardianPhone || '',
      `"${s.address || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `បញ្ជីឈ្មោះសិស្ស_MoEYS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportToGoogleSheets = async () => {
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
      const label = selectedGrade === 'all' ? 'សិស្សទាំងអស់' : `ថ្នាក់ទី${selectedGrade}`;
      const res = await exportStudentsToGoogleSheets(schoolProfile, filteredStudents, label);
      showToast(`បានបង្កើត Google Sheet «${res.title}» ដោយជោគជ័យ!`);
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការនាំចេញទៅ Google Sheet', 'error');
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="space-y-6 font-battambang">
      {/* Top Main Mode Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('roster')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'roster'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>បញ្ជីឈ្មោះសិស្ស (Student Roster)</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${viewMode === 'roster' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('badges')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'badges'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className={`w-4 h-4 ${viewMode === 'badges' ? 'text-slate-950' : 'text-amber-500'}`} />
            <span>ផ្លាកសញ្ញា & មេដាយឌីជីថល (Digital Badges)</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${viewMode === 'badges' ? 'bg-slate-900 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
              {studentBadgeAssignments.length}
            </span>
          </button>

          {canAccessStudentDashboard().allowed && (
            <button
              type="button"
              onClick={() => {
                setSelectedStudentForAnalyticsId(null);
                setViewMode('analytics');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-300" />
              <span>ផ្ទាំងវិភាគសមិទ្ធផល (Analytics)</span>
            </button>
          )}
        </div>

        {viewMode === 'roster' && (
          <button
            type="button"
            onClick={() => {
              setSelectedStudentForAwardBadge(null);
            }}
            className="hidden md:flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>ប្រគល់ផ្លាកសញ្ញាលើកទឹកចិត្ត</span>
          </button>
        )}
      </div>

      {viewMode === 'analytics' ? (
        <StudentAnalyticsDashboard
          onBackToRoster={() => setViewMode('roster')}
          initialStudentId={selectedStudentForAnalyticsId || undefined}
        />
      ) : viewMode === 'badges' ? (
        <StudentBadgesManagementTab onBackToStudents={() => setViewMode('roster')} />
      ) : (
        <>
          {/* Header & Controls */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-moul">គ្រប់គ្រងបញ្ជីឈ្មោះសិស្ស</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  សរុប {filteredStudents.length} នាក់
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្សលម្អិត៖ ជីវប្រវត្តិ គ្រួសារ អាសយដ្ឋាន សុខភាព (BMI) និងស្ថានភាពងាយរងគ្រោះស្របតាមស្តង់ដារក្រសួង
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="open-moeys-master-modal-btn"
              onClick={() => setIsMoeyMasterModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ring-2 ring-amber-300/60"
              title="មើល និងបោះពុម្ពតារាងប្រវត្តិសិស្សស្តង់ដារក្រសួងអប់រំ ១២ ជួរឈរពេញលេញ (MoEYS Master Student Roster Table)"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>តារាងប្រវត្តិសិស្សស្តង់ដារក្រសួង (MoEYS)</span>
            </button>
            <button
              id="export-multi-student-pdf-btn"
              onClick={() => {
                if (selectedStudentIds.length === 0 && filteredStudents.length > 0) {
                  setSelectedStudentIds(filteredStudents.map(s => s.id));
                }
                setIsMultiPdfModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer ring-2 ring-indigo-400/30"
              title="បង្កើតឯកសារ PDF សង្ខេបលទ្ធផល និងប្រវត្តិពិន្ទុសិស្សច្រើននាក់ក្នុងឯកសារតែមួយ"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-200" />
              <span>PDF សង្ខេបពិន្ទុជាក្រុម {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''}</span>
            </button>
            <button
              id="export-students-sheets-btn"
              onClick={handleExportToGoogleSheets}
              disabled={isExportingSheets}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isExportingSheets ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>{isExportingSheets ? 'កំពុងនាំចេញ...' : 'នាំចេញទៅ Google Sheets'}</span>
            </button>
            <button
              id="export-students-csv-btn"
              onClick={exportStudentsToCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>CSV ឯកសារ</span>
            </button>
            <button
              id="print-students-list-btn"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
              title="បោះពុម្ពបញ្ជីរាយនាមសិស្សផ្លូវការ"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>បោះពុម្ពបញ្ជី</span>
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-600" />
              <span>ផ្ទេរសិស្សចេញ/ចូល</span>
            </button>
            {(isDirector || isSecretary) && students.length > 0 && (
              <button
                id="delete-all-students-btn"
                type="button"
                onClick={() => setIsDeleteAllModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                title="លុបទិន្នន័យឈ្មោះសិស្សទាំងអស់ចេញពីប្រព័ន្ធ"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>លុបសិស្សទាំងអស់</span>
              </button>
            )}
            {(isDirector || isSecretary) ? (
              <button
                id="add-student-btn"
                onClick={() => {
                  setEditingStudent(null);
                  setFormData(initialFormState);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ring-2 ring-blue-300"
                title="ចុះឈ្មោះបង្កើតសិស្សថ្មីក្នុងប្រព័ន្ធ"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ ចុះឈ្មោះសិស្សថ្មី (MoEYS)</span>
              </button>
            ) : isTeacher ? (
              <button
                id="pull-students-to-class-btn"
                onClick={() => {
                  setSelectedPullStudentIds([]);
                  setPullSearchQuery('');
                  setPullGradeFilter('all');
                  setIsPullModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ring-2 ring-blue-300"
                title={`ទាញសិស្សពីថ្នាក់ផ្សេង ឬសិស្សមិនទាន់មានថ្នាក់ ចូលមកថ្នាក់ទី ${teacherGrade}«${teacherSection}» របស់ខ្ញុំ`}
              >
                <UserCheck className="w-4 h-4" />
                <span>📥 ទាញសិស្សចូលថ្នាក់ {teacherGrade}{teacherSection}</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Role Privileges Banner for Teachers */}
        {isTeacher && (
          <div className="mt-4 p-3.5 bg-blue-50/90 border border-blue-200/90 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-blue-950">
                  សិទ្ធិរបស់លោកគ្រូ-អ្នកគ្រូ (បន្ទុកថ្នាក់ទី {teacherGrade}«${teacherSection}»)
                </p>
                <p className="text-blue-700 mt-0.5">
                  លោកគ្រូ-អ្នកគ្រូមានសិទ្ធិ <span className="font-bold text-blue-950">កែសម្រួលប្រវត្តិរូបសិស្ស</span> និង <span className="font-bold text-blue-950">ទាញសិស្សចូលមកថ្នាក់របស់ខ្លួន</span> (ការបង្កើតសិស្សថ្មីជាសិទ្ធិផ្តាច់មុខរបស់នាយកសាលា)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPullStudentIds([]);
                setPullSearchQuery('');
                setPullGradeFilter('all');
                setIsPullModalOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg whitespace-nowrap shadow-xs active:scale-95 flex items-center gap-1.5 text-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ទាញសិស្សចូលថ្នាក់ខ្ញុំ</span>
            </button>
          </div>
        )}

        {/* Quick Vulnerability Filter Chips */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">តម្រងពិសេស៖</span>
          <button
            onClick={() => setSelectedVulnerability('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedVulnerability === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            សិស្សទាំងអស់
          </button>
          <button
            onClick={() => setSelectedVulnerability('idpoor')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedVulnerability === 'idpoor'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            សិស្សក្រ១ & ក្រ២ (IDPoor)
          </button>
          <button
            onClick={() => setSelectedVulnerability('scholarship')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedVulnerability === 'scholarship'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            សិស្សអាហារូបករណ៍
          </button>
          <button
            onClick={() => setSelectedVulnerability('orphan')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedVulnerability === 'orphan'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            សិស្សកំព្រា
          </button>
          <button
            onClick={() => setSelectedVulnerability('disability')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedVulnerability === 'disability'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            សិស្សមានពិការភាព
          </button>
          <button
            onClick={() => setSelectedVulnerability('repeater')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedVulnerability === 'repeater'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            សិស្សត្រួតថ្នាក់
          </button>
        </div>

        {/* Early Warning & Academic Risk Notification Banner */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-200/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-moul">
                    ប្រព័ន្ធជូនដំណឹង & តាមដានសិស្សប្រឈម (Early Warning Alerts)
                  </h4>
                  {atRiskCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                      រកឃើញ {atRiskCount} នាក់
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ត្រួតពិនិត្យសិស្សដែលមានអវត្តមានលើសពី ៣ ថ្ងៃជាប់គ្នា ឬមានពិន្ទុមធ្យមភាគធ្លាក់ចុះធៀបនឹងខែមុន
                </p>
              </div>
            </div>

            {/* Quick Risk Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRiskFilter('all')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedRiskFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                }`}
              >
                ទាំងអស់ ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskFilter('at_risk')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedRiskFilter === 'at_risk'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>សិស្សប្រឈមសរុប ({atRiskCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskFilter('consecutive_absent')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedRiskFilter === 'consecutive_absent'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                }`}
              >
                <span>🚫 អវត្តមាន ៣+ ថ្ងៃ ({absenceAlertCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskFilter('score_drop')}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedRiskFilter === 'score_drop'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>📉 ពិន្ទុធ្លាក់ចុះ ({scoreDropAlertCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Academic Year Selection & History Archive Control Bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 border-b border-indigo-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 flex-shrink-0 shadow-inner">
                <CalendarDays className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white font-moul">ឆ្នាំសិក្សា & បណ្ណសារប្រវត្តិសិស្ស</h4>
                  {selectedAcademicYearFilter === 'all' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      📁 គ្រប់ជំនាន់ទាំងអស់
                    </span>
                  ) : selectedAcademicYearFilter === schoolProfile.academicYear ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>★ ឆ្នាំសិក្សាសកម្ម</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40 flex items-center gap-1">
                      <History className="w-3 h-3 text-amber-300" />
                      <span>បណ្ណសារប្រវត្តិ ({selectedAcademicYearFilter})</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  ត្រួតពិនិត្យ និងស្វែងរកសិស្សានុសិស្សតាមឆ្នាំសិក្សាពី ២០១៦-២០១៧ ដល់ ២០៥០
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Quick Navigation Stepper */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = academicYears.indexOf(selectedAcademicYearFilter);
                  if (currentIndex > 0) {
                    setSelectedAcademicYearFilter(academicYears[currentIndex - 1]);
                  }
                }}
                disabled={selectedAcademicYearFilter === 'all' || selectedAcademicYearFilter === academicYears[0]}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="ថយទៅឆ្នាំសិក្សាមុន"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                id="student-academic-year-selector"
                value={selectedAcademicYearFilter}
                onChange={(e) => setSelectedAcademicYearFilter(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                <option value="all">📁 គ្រប់ឆ្នាំសិក្សាទាំងអស់ (All Years)</option>
                {academicYears.map((yr) => {
                  const isCurrent = yr === schoolProfile.academicYear;
                  return (
                    <option key={yr} value={yr}>
                      {yr} {isCurrent ? '★ (ឆ្នាំសកម្ម)' : ''}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => {
                  const currentIndex = academicYears.indexOf(selectedAcademicYearFilter);
                  if (currentIndex !== -1 && currentIndex < academicYears.length - 1) {
                    setSelectedAcademicYearFilter(academicYears[currentIndex + 1]);
                  }
                }}
                disabled={selectedAcademicYearFilter === 'all' || selectedAcademicYearFilter === academicYears[academicYears.length - 1]}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="ទៅឆ្នាំសិក្សាបន្ទាប់"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Year Shortcuts */}
            <button
              type="button"
              onClick={() => setSelectedAcademicYearFilter(schoolProfile.academicYear)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAcademicYearFilter === schoolProfile.academicYear
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              ឆ្នាំបច្ចុប្បន្ន
            </button>
            <button
              type="button"
              onClick={() => setSelectedAcademicYearFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAcademicYearFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              គ្រប់ឆ្នាំ ({accessibleStudents.length})
            </button>
          </div>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="student-search-input"
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះខ្មែរ ឡាតាំង អត្តលេខ ឬទូរស័ព្ទ (Fuzzy Search)..."
              className="w-full pl-9 pr-16 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {localSearch && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-md">
                  {filteredStudents.length}
                </span>
                <button
                  onClick={() => setLocalSearch('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                  title="សម្អាតការស្វែងរក"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isTeacher ? (
              <div className="px-3.5 py-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>ថ្នាក់ទី {teacherGrade}«{teacherSection}»</span>
              </div>
            ) : (
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់កម្រិតថ្នាក់</option>
                <option value="1">ថ្នាក់ទី១</option>
                <option value="2">ថ្នាក់ទី២</option>
                <option value="3">ថ្នាក់ទី៣</option>
                <option value="4">ថ្នាក់ទី៤</option>
                <option value="5">ថ្នាក់ទី៥</option>
                <option value="6">ថ្នាក់ទី៦</option>
              </select>
            )}

            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value as Gender | 'all')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">គ្រប់ភេទ</option>
              <option value="M">ប្រុស</option>
              <option value="F">ស្រី</option>
            </select>
          </div>
        </div>

        {/* Student Data Table */}
        <div className="overflow-x-auto">
          {/* Official Ministry Heading shown only on Print */}
          <div className="hidden print:block p-6 mb-4 border-b border-slate-300">
            <div className="flex justify-between items-start text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                <p className="text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                <p className="font-bold text-blue-950 font-moul text-sm">{schoolProfile.nameKhmer}</p>
                <p className="text-[10px] text-slate-500 font-mono">កូដសាលា: {schoolProfile.schoolCode}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-xs text-slate-900 font-moul">ស្តង់ដារសាលាបឋមសិក្សាគំរូ</p>
                <p className="text-xs text-slate-700">ឆ្នាំសិក្សា៖ <span className="font-bold">{schoolProfile.academicYear}</span></p>
                <p className="text-[10px] text-slate-500">កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}</p>
              </div>
            </div>
            <div className="text-center mt-4">
              <h2 className="font-moul text-base text-slate-950">
                បញ្ជីរាយនាមសិស្សានុសិស្ស {selectedGrade === 'all' ? 'គ្រប់កម្រិតថ្នាក់' : `ថ្នាក់ទី ${selectedGrade}`}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                ចំនួនសិស្សសរុប៖ <strong>{filteredStudents.length}</strong> នាក់ (ស្រី <strong>{filteredStudents.filter(s => s.gender === 'F').length}</strong> នាក់)
              </p>
            </div>
          </div>

          {/* Floating Batch Action Bar */}
          {selectedStudentIds.length > 0 && (
            <div className="no-print p-3 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl shadow-lg border border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold">
                  បានជ្រើសរើសសិស្សចំនួន <strong className="text-blue-300 font-mono text-sm px-1.5 py-0.5 bg-white/10 rounded">{selectedStudentIds.length}</strong> នាក់
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsMultiPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-blue-400/40"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>បង្កើតឯកសារ PDF សង្ខេបពិន្ទុ & ប្រវត្តិរូប ({selectedStudentIds.length} ទំព័រ A4)</span>
                </button>
                <button
                  onClick={() => setSelectedStudentIds(filteredStudents.map(s => s.id))}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
                >
                  ជ្រើសរើសទាំងអស់ ({filteredStudents.length})
                </button>
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-medium rounded-xl transition-colors"
                >
                  លុបការជ្រើសរើស
                </button>
              </div>
            </div>
          )}

          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3 text-center no-print w-10">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onChange={() => {
                      if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
                        setSelectedStudentIds([]);
                      } else {
                        setSelectedStudentIds(filteredStudents.map(s => s.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    title="ជ្រើសរើសទាំងអស់"
                  />
                </th>
                <th className="py-3.5 px-4">អត្តលេខ & ឈ្មោះសិស្ស</th>
                <th className="py-3.5 px-4 text-center">ភេទ</th>
                <th className="py-3.5 px-4">ថ្ងៃកំណើត</th>
                <th className="py-3.5 px-4">ថ្នាក់/បន្ទប់</th>
                <th className="py-3.5 px-4">ស្ថានភាព & ជីវភាព</th>
                <th className="py-3.5 px-4">អាណាព្យាបាល & ទំនាក់ទំនង</th>
                <th className="py-3.5 px-4">សុខភាព (BMI)</th>
                <th className="py-3.5 px-4 text-center">ផ្លាកសញ្ញា & ពិន្ទុ</th>
                <th className="py-3.5 px-4 text-center no-print">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const studentBadges = getStudentBadges(student.id);
                  const totalPoints = getStudentTotalPoints(student.id);
                  const isSelected = selectedStudentIds.includes(student.id);
                  const riskAlert = studentAlertsMap.get(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center no-print" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedStudentIds(prev =>
                              prev.includes(student.id)
                                ? prev.filter(id => id !== student.id)
                                : [...prev, student.id]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                            alt={student.nameKhmer}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{student.nameKhmer}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                              {student.nameLatin && <span className="font-times">{student.nameLatin}</span>}
                              <span>•</span>
                              <span className="font-times text-blue-600 font-semibold">{student.code}</span>
                            </div>

                            {/* Risk Alert Badges */}
                            {riskAlert && (riskAlert.hasConsecutiveAbsenceAlert || riskAlert.hasScoreDropAlert) && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {riskAlert.hasConsecutiveAbsenceAlert && (
                                  <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold"
                                    title={`អវត្តមាន ${riskAlert.consecutiveAbsenceCount} ថ្ងៃជាប់គ្នា៖ ${riskAlert.consecutiveAbsenceDates.join(', ')}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                    <span>🚫 អវត្តមាន {riskAlert.consecutiveAbsenceCount} ថ្ងៃជាប់គ្នា</span>
                                  </span>
                                )}
                                {riskAlert.hasScoreDropAlert && (
                                  <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold"
                                    title={`ពិន្ទុធ្លាក់ចុះ -${riskAlert.scoreDropAmount} (ពី ${riskAlert.previousPeriodScore?.period} ${riskAlert.previousPeriodScore?.average} មក ${riskAlert.latestPeriodScore?.period} ${riskAlert.latestPeriodScore?.average})`}
                                  >
                                    <span>📉 ធ្លាក់ពិន្ទុ (-{riskAlert.scoreDropAmount})</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            student.gender === 'F'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-times">
                        {student.dob}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                            ថ្នាក់ទី {student.grade}{student.section}
                          </span>
                          {(selectedAcademicYearFilter === 'all' || student.academicYear !== schoolProfile.academicYear) && (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                              {student.academicYear || schoolProfile.academicYear}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 items-center">
                          {student.livingCondition === 'ក្រ១' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">ក្រ១</span>
                          )}
                          {student.livingCondition === 'ក្រ២' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">ក្រ២</span>
                          )}
                          {student.scholarship && student.scholarship !== 'មិនមាន' && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">អាហារូបករណ៍</span>
                          )}
                          {student.orphanStatus && student.orphanStatus !== 'មិនកំព្រា' && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">{student.orphanStatus}</span>
                          )}
                          {student.academicHistory === 'ត្រួតថ្នាក់' && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">ត្រួតថ្នាក់</span>
                          )}
                          {(!student.livingCondition || student.livingCondition === 'ទូទៅ') && (!student.scholarship || student.scholarship === 'មិនមាន') && (
                            <span className="text-[11px] text-slate-500">ទូទៅ</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{student.guardianName || student.fatherName || student.motherName || 'អាណាព្យាបាល'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-times">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.guardianPhone || student.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              student.health.nutritionStatus === 'normal'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            BMI: {student.health.bmi} ({student.health.nutritionStatus === 'normal' ? 'ធម្មតា' : 'ស្គម'})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForBadgeShowcase(student)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/90 hover:bg-amber-100 border border-amber-200 text-slate-800 transition-all group cursor-pointer active:scale-95 shadow-2xs"
                          title="ចុចដើម្បីមើលលិខិតសរសើរ និងផ្លាកសញ្ញាទាំងអស់"
                        >
                          <div className="flex -space-x-1 items-center">
                            {studentBadges.slice(0, 3).map((b, idx) => (
                              <div key={idx} className="scale-75 origin-center -mr-1">
                                <BadgeIcon iconName={b.badge.iconName} tier={b.badge.tier} size="sm" showGlow={false} />
                              </div>
                            ))}
                            {studentBadges.length === 0 && (
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                            )}
                          </div>
                          <span className="font-bold text-xs text-amber-950">
                            {studentBadges.length > 0 ? `${studentBadges.length}` : '0'}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-times">
                            {totalPoints} pts
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {canAccessStudentDashboard(student).allowed && (
                            <button
                              id={`analytics-student-${student.id}`}
                              onClick={() => {
                                setSelectedStudentForAnalyticsId(student.id);
                                setViewMode('analytics');
                              }}
                              title="មើលផ្ទាំងវិភាគសមិទ្ធផល & ក្រាហ្វិកពិន្ទុ"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <TrendingUp className="w-4 h-4 text-indigo-600" />
                            </button>
                          )}
                          <button
                            id={`award-badge-${student.id}`}
                            onClick={() => setSelectedStudentForAwardBadge(student)}
                            title="ប្រគល់ផ្លាកសញ្ញា ឬមេដាយ"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                          {isTeacher && (student.grade !== teacherGrade || student.section !== teacherSection) && (
                            <button
                              id={`pull-row-student-${student.id}`}
                              onClick={() => {
                                pullStudentsToClass([student.id], teacherGrade, teacherSection);
                              }}
                              title={`ទាញសិស្ស «${student.nameKhmer}» ចូលថ្នាក់ទី ${teacherGrade}«${teacherSection}» របស់ខ្ញុំ`}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 transition-colors whitespace-nowrap"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>ទាញចូលថ្នាក់ {teacherGrade}{teacherSection}</span>
                            </button>
                          )}
                          <button
                            id={`print-student-${student.id}`}
                            onClick={() => setSelectedStudentForPdfPrint(student)}
                            title="បោះពុម្ពប្រវត្តិរូបសិស្សជាទម្រង់ A4 PDF ស្តង់ដារ"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            id={`view-student-${student.id}`}
                            onClick={() => setSelectedStudentForView(student)}
                            title="មើលប្រវត្តិរូបលម្អិត"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`edit-student-${student.id}`}
                            onClick={() => handleEditClick(student)}
                            title="កែប្រែព័ត៌មាន (លោកគ្រូ-អ្នកគ្រូ និងនាយកអាចកែសម្រួលបាន)"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const newPass = prompt(`សូមបញ្ចូលពាក្យសម្ងាត់ថ្មីសម្រាប់សិស្ស «${student.nameKhmer}» (អត្តលេខ ${student.code}):`, student.code);
                              if (newPass) {
                                const res = verifyAndResetStudentPassword(student.nameKhmer, student.code, newPass);
                                if (res.success) {
                                  showToast('ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ!', 'success');
                                } else {
                                  showToast(res.message, 'error');
                                }
                              }
                            }}
                            title="ប្តូរពាក្យសម្ងាត់សិស្ស"
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {(isDirector || isSecretary) && (
                            <button
                              id={`delete-student-${student.id}`}
                              onClick={() => {
                                setStudentToDelete(student);
                                setIsSingleDeleteDialogOpen(true);
                              }}
                              title="លុបទិន្នន័យ (មានការបញ្ជាក់សុវត្ថិភាព)"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3.5 shadow-xs">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">
                        {students.length === 0 ? 'មិនទាន់មានទិន្នន័យសិស្សក្នុងប្រព័ន្ធនៅឡើយទេ' : 'មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                        {students.length === 0
                          ? 'លោកអ្នកអាចចុះឈ្មោះសិស្សថ្មីម្តងម្នាក់តាមស្តង់ដារក្រសួង MoEYS ឬនាំចូលទិន្នន័យសិស្សពី Excel/CSV'
                          : 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះស្វែងរក ឬជម្រើសចម្រោះកម្រិតថ្នាក់'}
                      </p>
                      {students.length === 0 && isDirector && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStudent(null);
                            setFormData(initialFormState);
                            setIsAddModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ ចុះឈ្មោះសិស្សដំបូង (MoEYS)</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Official Signatures Footer on Print */}
          <div className="hidden print:flex justify-between items-end mt-8 text-xs text-slate-800 pt-6">
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
      </div>

      {/* View Student Details Modal */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-slate-200 flex-shrink-0">
                  <img
                    src={selectedStudentForView.avatarUrl}
                    alt={selectedStudentForView.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-moul">{selectedStudentForView.nameKhmer}</h3>
                  <p className="text-xs text-blue-100">
                    {selectedStudentForView.nameLatin && `${selectedStudentForView.nameLatin} • `}
                    <span className="font-times">{selectedStudentForView.code}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudentForPdfPrint(selectedStudentForView)}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="បោះពុម្ពប្រវត្តិរូបសិស្សជាទម្រង់ A4 PDF ស្តង់ដារ"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">បោះពុម្ព A4 PDF</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForView(null)}
                  className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                  <p className="font-moul text-blue-950 text-sm mt-2">ប្រវត្តិរូបសង្ខេបសិស្សានុសិស្ស</p>
                </div>
                <div className="w-16 h-20 border border-slate-300 rounded overflow-hidden bg-slate-100 flex items-center justify-center text-[10px]">
                  <img
                    src={selectedStudentForView.avatarUrl}
                    alt={selectedStudentForView.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Student Risk & Early Warning Assessment Box (if any) */}
              {(() => {
                const modalRiskAlert = getStudentRiskAlert(selectedStudentForView, scores, attendanceRecords || []);
                if (!modalRiskAlert.hasConsecutiveAbsenceAlert && !modalRiskAlert.hasScoreDropAlert) return null;

                return (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-rose-900 font-bold font-moul text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                      <span>ការជូនដំណឹងពីហានិភ័យសិក្សា & អវត្តមាន (Early Warning Alert)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      {modalRiskAlert.hasConsecutiveAbsenceAlert && (
                        <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs space-y-1">
                          <p className="font-bold text-rose-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-600" />
                            អវត្តមានជាប់គ្នា ៖ {modalRiskAlert.consecutiveAbsenceCount} ថ្ងៃ
                          </p>
                          <p className="text-[11px] text-slate-600">
                            កាលបរិច្ឆេទអវត្តមាន៖ {modalRiskAlert.consecutiveAbsenceDates.join(', ')}
                          </p>
                          <p className="text-[10px] text-rose-600 italic">
                            * តម្រូវឱ្យគ្រូបន្ទុកថ្នាក់ទាក់ទងទៅកាន់អាណាព្យាបាលជាបន្ទាន់
                          </p>
                        </div>
                      )}
                      {modalRiskAlert.hasScoreDropAlert && (
                        <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                          <p className="font-bold text-amber-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-600" />
                            ធ្លាក់ចុះពិន្ទុមធ្យមភាគ ៖ -{modalRiskAlert.scoreDropAmount} ពិន្ទុ
                          </p>
                          <p className="text-[11px] text-slate-600">
                            ពិន្ទុខែមុន ({modalRiskAlert.previousPeriodScore?.period}) ៖ <strong className="text-slate-800">{modalRiskAlert.previousPeriodScore?.average}</strong> ➔ ពិន្ទុខែនេះ ({modalRiskAlert.latestPeriodScore?.period}) ៖ <strong className="text-rose-700">{modalRiskAlert.latestPeriodScore?.average}</strong>
                          </p>
                          <p className="text-[10px] text-amber-700 italic">
                            * ណែនាំឱ្យមានការបំប៉នបន្ថែម ឬពិភាក្សាជាមួយអាណាព្យាបាល
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Core Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-1">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">កម្រិតថ្នាក់</span>
                  <strong className="text-sm text-slate-900 font-bold">
                    ថ្នាក់ទី {selectedStudentForView.grade}{selectedStudentForView.section}
                  </strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">ភេទ</span>
                  <strong className="text-sm text-slate-900 font-bold">
                    {selectedStudentForView.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                  </strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">ថ្ងៃខែឆ្នាំកំណើត</span>
                  <strong className="text-sm text-slate-900 font-bold font-times">
                    {selectedStudentForView.dob}
                  </strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-xs">ស្ថានភាពសិក្សា</span>
                  <strong className="text-sm text-blue-900 font-bold">
                    {selectedStudentForView.academicHistory || 'ឡើងថ្នាក់'}
                  </strong>
                </div>
              </div>

              {/* Place of Birth & Current Residence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    ទីកន្លែងកំណើត (Place of Birth)
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {selectedStudentForView.pob || `${selectedStudentForView.pobVillage ? `ភូមិ${selectedStudentForView.pobVillage} ` : ''}${selectedStudentForView.pobCommune ? `ឃុំ${selectedStudentForView.pobCommune} ` : ''}${selectedStudentForView.pobDistrict ? `ស្រុក${selectedStudentForView.pobDistrict} ` : ''}${selectedStudentForView.pobProvince || 'ខេត្តបាត់ដំបង'}`}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    ទីលំនៅបច្ចុប្បន្ន (Current Address)
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {selectedStudentForView.address || `${selectedStudentForView.currentHouseNumber ? `ផ្ទះលេខ${selectedStudentForView.currentHouseNumber} ` : ''}${selectedStudentForView.currentStreetNumber ? `ផ្លូវ${selectedStudentForView.currentStreetNumber} ` : ''}${selectedStudentForView.currentVillage ? `ភូមិ${selectedStudentForView.currentVillage} ` : ''}${selectedStudentForView.currentCommune ? `ឃុំ${selectedStudentForView.currentCommune} ` : ''}${selectedStudentForView.currentDistrict ? `ស្រុក${selectedStudentForView.currentDistrict} ` : ''}${selectedStudentForView.currentProvince || 'ខេត្តបាត់ដំបង'}`}
                  </p>
                </div>
              </div>

              {/* Family & Guardian Information */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  ព័ត៌មានឪពុកម្តាយ និងអាណាព្យាបាល
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block">ព័ត៌មានឪពុក</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedStudentForView.fatherName || 'មិនបញ្ជាក់'}</p>
                    <p className="text-xs text-slate-600 mt-0.5">មុខរបរ៖ {selectedStudentForView.fatherOccupation || 'N/A'}</p>
                    <p className="text-[11px] text-slate-500">ស្ថានភាព៖ {selectedStudentForView.fatherAlive !== false ? 'នៅរស់' : 'ទទួលមរណភាព'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block">ព័ត៌មានម្តាយ</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedStudentForView.motherName || 'មិនបញ្ជាក់'}</p>
                    <p className="text-xs text-slate-600 mt-0.5">មុខរបរ៖ {selectedStudentForView.motherOccupation || 'N/A'}</p>
                    <p className="text-[11px] text-slate-500">ស្ថានភាព៖ {selectedStudentForView.motherAlive !== false ? 'នៅរស់' : 'ទទួលមរណភាព'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-xs block">អាណាព្យាបាលផ្ទាល់</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {selectedStudentForView.guardianName || selectedStudentForView.fatherName || selectedStudentForView.motherName || 'អាណាព្យាបាល'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">ត្រូវជា៖ {selectedStudentForView.guardianRelationship || 'ឪពុកម្តាយ'}</p>
                    <p className="text-xs text-blue-700 font-times font-semibold mt-0.5">
                      {selectedStudentForView.guardianPhone || selectedStudentForView.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vulnerability & Social Support */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  ស្ថានភាពសង្គម និងការគាំទ្រ (Vulnerability & Equity)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                    <span className="text-purple-700 block">ស្ថានភាពជីវភាព</span>
                    <strong className="text-purple-950 font-bold text-sm">{selectedStudentForView.livingCondition || 'ទូទៅ'}</strong>
                  </div>
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                    <span className="text-purple-700 block">អាហារូបករណ៍</span>
                    <strong className="text-purple-950 font-bold text-sm">{selectedStudentForView.scholarship || 'មិនមាន'}</strong>
                  </div>
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                    <span className="text-purple-700 block">ស្ថានភាពកំព្រា</span>
                    <strong className="text-purple-950 font-bold text-sm">{selectedStudentForView.orphanStatus || 'មិនកំព្រា'}</strong>
                  </div>
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                    <span className="text-purple-700 block">ពិការភាព</span>
                    <strong className="text-purple-950 font-bold text-sm">{selectedStudentForView.disability || 'មិនពិការ'}</strong>
                  </div>
                </div>
              </div>

              {/* Health & BMI Section */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  ទិន្នន័យសុខភាព និងអាហារូបត្ថម្ភ (BMI)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-rose-50/40 p-4 rounded-xl border border-rose-200">
                  <div>
                    <span className="text-slate-500 block text-xs">កម្ពស់</span>
                    <strong className="text-slate-900 font-bold font-times">{selectedStudentForView.health.heightCm} cm</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">ទម្ងន់</span>
                    <strong className="text-slate-900 font-bold font-times">{selectedStudentForView.health.weightKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">សន្ទស្សន៍ BMI</span>
                    <strong className="text-blue-700 font-bold font-times">{selectedStudentForView.health.bmi}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">ស្ថានភាពអាហារូបត្ថម្ភ</span>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                      {selectedStudentForView.health.nutritionStatus === 'normal' ? 'ធម្មតា' : 'ស្គម'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-xs">ក្រុមឈាម & វ៉ាក់សាំង</span>
                    <strong className="text-slate-800">
                      ឈាម {selectedStudentForView.health.bloodType} • {selectedStudentForView.health.vaccinated ? 'បានចាក់វ៉ាក់សាំងគ្រប់ដូស' : 'មិនទាន់គ្រប់'}
                    </strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-xs">សម្គាល់សុខភាព</span>
                    <strong className="text-slate-800">{selectedStudentForView.health.notes || 'គ្មាន'}</strong>
                  </div>
                </div>
              </div>

              {/* Student Identity Card QR Code Generator Section */}
              <div className="border-t border-slate-200 pt-4">
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>អត្តសញ្ញាណប័ណ្ណសិស្សឌីជីថល (Student ID Card QR)</span>
                    </div>
                    <h4 className="font-bold font-moul text-sm sm:text-base">{selectedStudentForView.nameKhmer}</h4>
                    <p className="text-xs text-blue-100">
                      អត្តលេខសិស្ស៖ <span className="font-times font-bold">{selectedStudentForView.code}</span> • ថ្នាក់ទី {selectedStudentForView.grade}{selectedStudentForView.section}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      សាលា៖ {schoolProfile.nameKhmer}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-md flex flex-col items-center gap-2">
                    <canvas id={`student-qr-canvas-${selectedStudentForView.id}`} className="w-28 h-28" />
                    <span className="text-[10px] text-slate-700 font-bold font-moul">ស្កេនពិនិត្យព័ត៌មាន</span>
                  </div>
                </div>
              </div>

              {/* Recharts Progress Trend Line Chart Section */}
              <div className="border-t border-slate-200 pt-4">
                <StudentProgressTrendChart
                  student={selectedStudentForView}
                  scores={scores}
                  dailyAttendance={attendanceRecords}
                />
              </div>

              {/* Digital Badges & Achievements Section */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    ផ្លាកសញ្ញា និងមេដាយកិត្តិយសឌីជីថល (Digital Badges)
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForAwardBadge(selectedStudentForView)}
                      className="px-2.5 py-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>+ ប្រគល់ផ្លាកសញ្ញា</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForBadgeShowcase(selectedStudentForView)}
                      className="px-2.5 py-1 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5 text-blue-600" />
                      <span>មើលផ្ទាំងកិត្តិយស</span>
                    </button>
                  </div>
                </div>

                {(() => {
                  const studentBadges = getStudentBadges(selectedStudentForView.id);
                  const totalPts = getStudentTotalPoints(selectedStudentForView.id);

                  if (studentBadges.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500">
                        <p className="text-xs">សិស្សនេះមិនទាន់ទទួលបានផ្លាកសញ្ញាកិត្តិយសនៅឡើយទេ។</p>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForAwardBadge(selectedStudentForView)}
                          className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                        >
                          ចុចទីនេះដើម្បីប្រគល់ផ្លាកសញ្ញាលើកទឹកចិត្តដំបូង
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-amber-950">
                            ទទួលបានផ្លាកសញ្ញាសរុប {studentBadges.length} និងពិន្ទុកិត្តិយសសរុប {totalPts} ពិន្ទុ
                          </span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-times">
                          {totalPts} PTS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {studentBadges.map(item => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/20 transition-all flex items-start gap-2.5"
                          >
                            <BadgeIcon
                              iconName={item.badge.iconName}
                              tier={item.badge.tier}
                              size="md"
                              showGlow={false}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="font-bold text-xs text-slate-900 truncate">
                                  {item.badge.titleKhmer}
                                </h5>
                                <span className="text-[10px] font-bold text-amber-700 font-times whitespace-nowrap">
                                  +{item.badge.points} pts
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.reasonOrEvidence || item.badge.description}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                                <span className="font-times">{item.awardedDate}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCertificateForView(item)}
                                  className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                                >
                                  បោះពុម្ពលិខិតសរសើរ
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster Mode End */}
      </>
      )}

      {/* Individual Student Profile A4 PDF Modal */}
      {selectedStudentForPdfPrint && (
        <StudentProfilePdfModal
          student={selectedStudentForPdfPrint}
          scores={scores}
          dailyAttendance={attendanceRecords}
          schoolProfile={schoolProfile}
          badges={getStudentBadges(selectedStudentForPdfPrint.id)}
          totalBadgePoints={getStudentTotalPoints(selectedStudentForPdfPrint.id)}
          onClose={() => setSelectedStudentForPdfPrint(null)}
        />
      )}

      {/* Student Badge Showcase Modal */}
      {selectedStudentForBadgeShowcase && (
        <StudentBadgeShowcaseModal
          student={selectedStudentForBadgeShowcase}
          onClose={() => setSelectedStudentForBadgeShowcase(null)}
        />
      )}

      {/* Award Badge Modal */}
      {selectedStudentForAwardBadge && (
        <AwardBadgeModal
          targetStudent={selectedStudentForAwardBadge}
          isOpen={true}
          onClose={() => setSelectedStudentForAwardBadge(null)}
        />
      )}

      {/* Certificate Modal */}
      {selectedCertificateForView && (
        <CertificateModal
          assignment={selectedCertificateForView}
          schoolProfile={schoolProfile}
          onClose={() => setSelectedCertificateForView(null)}
        />
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-moul">
                    {editingStudent ? 'កែប្រែព័ត៌មានសិស្ស' : 'ទម្រង់ចុះឈ្មោះសិស្សថ្មី (MoEYS Standard)'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    ទម្រង់ប្រមូលទិន្នន័យសិស្សលម្អិតស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា (មានការផ្ទៀងផ្ទាត់ Validation ស្វ័យប្រវត្តិ)
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
            <form onSubmit={handleCreateStudent} className="p-6 space-y-6 text-xs sm:text-sm">
              {/* Auto-Save Draft Indicator */}
              <FormAutoSaveIndicator
                hasSavedDraft={hasSavedDraft}
                lastSavedTime={lastSavedTime}
                isSaving={isSaving}
                onDiscardDraft={discardDraft}
                isEditing={!!editingStudent}
              />

              {!editingStudent ? (
                 <div className="space-y-4">
                    <p className="text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm leading-relaxed">
                      <span className="font-bold">📝 បញ្ចូលតែព័ត៌មានចាំបាច់សិនបានហើយ។</span><br/>
                      ពេលបញ្ចូលរួច ប្រព័ន្ធនឹងបង្កើតគណនី និងពាក្យសម្ងាត់ជូនសិស្សដោយស្វ័យប្រវត្តិ (អត្តលេខសិស្ស = Username & Password)។ ចាំគ្រូបន្ទុកថ្នាក់ជាអ្នកបំពេញព័ត៌មានលម្អិតតាមក្រោយ។
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">គោត្តនាម និងនាម <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.nameKhmer}
                          onChange={(e) => setFormData(prev => ({ ...prev, nameKhmer: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold"
                          placeholder="ឧ. សុខ សាន្ត"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">ភេទ <span className="text-red-500">*</span></label>
                        <select
                          required
                          value={formData.gender}
                          onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-bold bg-white"
                        >
                          <option value="M">ប្រុស (M)</option>
                          <option value="F">ស្រី (F)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">ថ្នាក់ទី <span className="text-red-500">*</span></label>
                        <select
                          required
                          value={formData.grade}
                          onChange={(e) => setFormData(prev => ({ ...prev, grade: Number(e.target.value) }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-bold bg-white"
                        >
                          <option value={0} disabled>ជ្រើសរើសថ្នាក់</option>
                          {[1, 2, 3, 4, 5, 6].map((g) => (
                            <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">បន្ទប់ <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.section}
                          onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold"
                          placeholder="ឧ. ក"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-bold mb-1.5">លេខទូរស័ព្ទអាណាព្យាបាល</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-left"
                          placeholder="ឧ. 012345678"
                          dir="ltr"
                        />
                      </div>
                    </div>
                 </div>
              ) : (
              <>
              {/* Section 1: Core Identification */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    ១. អត្តសញ្ញាណទូទៅ និងរូបថតសិស្ស (Student Photo & Identity)
                  </h4>
                </div>

                {/* Student Photo Upload & Preview Bar */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverPhoto(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOverPhoto(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverPhoto(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      handlePhotoFileUpload(file);
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    isDragOverPhoto
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  } flex flex-col sm:flex-row items-center gap-4`}
                >
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-blue-200 bg-white flex items-center justify-center flex-shrink-0 shadow-xs group">
                    {isUploadingPhoto ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-blue-600">
                        <Loader2 className="w-6 h-6 animate-spin mb-1 text-blue-600" />
                        <span className="text-[10px] font-semibold">កំពុង Upload...</span>
                      </div>
                    ) : formData.avatarUrl ? (
                      <>
                        <img
                          src={formData.avatarUrl}
                          alt="រូបថតសិស្ស"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer text-white p-1 hover:text-blue-200">
                            <Camera className="w-5 h-5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoFileUpload(file);
                              }}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400 text-[10px]">
                        <Users className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                        <span className="font-medium">គ្មានរូបថត</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          រូបថតសិស្ស (Firebase Storage Profile Photo)
                        </label>
                        {photoUploadSource === 'firebase' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                            Cloud Storage
                          </span>
                        )}
                      </div>
                      {formData.avatarUrl && !isUploadingPhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, avatarUrl: '' });
                            setPhotoUploadSource(null);
                          }}
                          className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold transition-colors"
                        >
                          លុបរូបថតចេញ
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label
                        className={`cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 border rounded-lg text-xs font-semibold shadow-2xs transition-all ${
                          isUploadingPhoto
                            ? 'opacity-60 pointer-events-none border-slate-200 text-slate-400'
                            : 'border-blue-300 text-blue-700 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                          <Camera className="w-4 h-4 text-blue-600" />
                        )}
                        <span>{isUploadingPhoto ? 'កំពុងផ្ទុកឡើង Firebase...' : 'ជ្រើសរើសរូបថត (Upload)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingPhoto}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoFileUpload(file);
                          }}
                        />
                      </label>

                      <div className="relative">
                        <input
                          type="url"
                          value={formData.avatarUrl || ''}
                          onChange={(e) => {
                            setFormData({ ...formData, avatarUrl: e.target.value });
                            setPhotoUploadSource(e.target.value ? 'url' : null);
                          }}
                          placeholder="ឬបិទភ្ជាប់ Image URL (Google Drive / Web)..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>💡</span>
                      <span>
                        អ្នកអាចចុច Upload ជ្រើសរើសរូបថត ឬទាញទម្លាក់ (Drag & Drop) ចូលទីនេះ។ រូបភាពនឹងត្រូវផ្ទុកឡើង <strong>Firebase Storage</strong> ដោយស្វ័យប្រវត្តិ។
                      </span>
                    </p>
                  </div>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះសិស្សជាភាសាខ្មែរ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameKhmer}
                      onChange={e => setFormData({ ...formData, nameKhmer: e.target.value })}
                      placeholder="ឧ. សុខ វាសនា"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះជាអក្សរឡាតាំង
                    </label>
                    <input
                      type="text"
                      value={formData.nameLatin}
                      onChange={e => setFormData({ ...formData, nameLatin: e.target.value })}
                      placeholder="e.g. Sok Veasna"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ភេទ *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="M">ប្រុស (Male)</option>
                      <option value="F">ស្រី (Female)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ថ្ងៃខែឆ្នាំកំណើត *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឆ្នាំសិក្សា *
                    </label>
                    <select
                      value={formData.academicYear || selectedAcademicYear || schoolProfile.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    >
                      {academicYears.map((yr) => {
                        const isCurrent = yr === schoolProfile.academicYear;
                        return (
                          <option key={yr} value={yr}>
                            {yr} {isCurrent ? '★ (បច្ចុប្បន្ន)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      កម្រិតថ្នាក់ *
                    </label>
                    <select
                      value={formData.grade}
                      onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
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
                      បន្ទប់/ផ្នែក *
                    </label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={e => setFormData({ ...formData, section: e.target.value })}
                      placeholder="ឧ. ក"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      លេខទូរស័ព្ទផ្ទាល់/សិស្ស
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="ឧ. 012 345 678"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Place of Birth Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  ២. ទីកន្លែងកំណើតលម្អិត (Place of Birth Breakdown)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ភូមិកំណើត</label>
                    <input
                      type="text"
                      value={formData.pobVillage}
                      onChange={e => setFormData({ ...formData, pobVillage: e.target.value })}
                      placeholder="ឧ. អូរគល់សំយ៉ុង"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ឃុំ/សង្កាត់កំណើត</label>
                    <input
                      type="text"
                      value={formData.pobCommune}
                      onChange={e => setFormData({ ...formData, pobCommune: e.target.value })}
                      placeholder="ឧ. បារាំងធ្លាក់"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ស្រុក/ខណ្ឌកំណើត</label>
                    <input
                      type="text"
                      value={formData.pobDistrict}
                      onChange={e => setFormData({ ...formData, pobDistrict: e.target.value })}
                      placeholder="ឧ. ភ្នំព្រឹក"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ខេត្ត/រាជធានីកំណើត</label>
                    <input
                      type="text"
                      value={formData.pobProvince}
                      onChange={e => setFormData({ ...formData, pobProvince: e.target.value })}
                      placeholder="ឧ. ខេត្តបាត់ដំបង"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Current Residence Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  ៣. ទីលំនៅបច្ចុប្បន្នលម្អិត (ខេត្ត ➔ ស្រុក ➔ ឃុំ ➔ ភូមិ ➔ សាលារៀន)
                </h4>
                <AddressSelector
                  province={formData.currentProvince || 'ខេត្តបាត់ដំបង'}
                  district={formData.currentDistrict || 'ស្រុកភ្នំព្រឹក'}
                  commune={formData.currentCommune || ''}
                  village={formData.currentVillage || ''}
                  showSchoolSelector={false}
                  onChange={(addr) => {
                    setFormData({
                      ...formData,
                      currentProvince: addr.province,
                      currentDistrict: addr.district,
                      currentCommune: addr.commune,
                      currentVillage: addr.village
                    });
                  }}
                />
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ផ្ទះលេខ</label>
                    <input
                      type="text"
                      value={formData.currentHouseNumber}
                      onChange={e => setFormData({ ...formData, currentHouseNumber: e.target.value })}
                      placeholder="ឧ. ផ្ទះលេខ ៤៥"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ផ្លូវលេខ</label>
                    <input
                      type="text"
                      value={formData.currentStreetNumber}
                      onChange={e => setFormData({ ...formData, currentStreetNumber: e.target.value })}
                      placeholder="ឧ. ផ្លូវលេខ ២០"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Family Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  ៤. ព័ត៌មានឪពុក ម្តាយ និងអាណាព្យាបាល
                </h4>
                {/* Father */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ឈ្មោះឪពុក</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="ឧ. សុខុម ចាន់"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">មុខរបរឪពុក</label>
                    <input
                      type="text"
                      value={formData.fatherOccupation}
                      onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      placeholder="ឧ. កសិករ"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ស្ថានភាពឪពុក</label>
                    <select
                      value={formData.fatherAlive ? 'true' : 'false'}
                      onChange={e => setFormData({ ...formData, fatherAlive: e.target.value === 'true' })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="true">នៅរស់</option>
                      <option value="false">ទទួលមរណភាព</option>
                    </select>
                  </div>
                </div>

                {/* Mother */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ឈ្មោះម្តាយ</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="ឧ. ហេង ធីតា"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">មុខរបរម្តាយ</label>
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })}
                      placeholder="ឧ. មេផ្ទះ"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ស្ថានភាពម្តាយ</label>
                    <select
                      value={formData.motherAlive ? 'true' : 'false'}
                      onChange={e => setFormData({ ...formData, motherAlive: e.target.value === 'true' })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="true">នៅរស់</option>
                      <option value="false">ទទួលមរណភាព</option>
                    </select>
                  </div>
                </div>

                {/* Guardian Direct Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ឈ្មោះអាណាព្យាបាល</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="ឧ. សុខុម ចាន់"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ត្រូវជា</label>
                    <select
                      value={formData.guardianRelationship}
                      onChange={e => setFormData({ ...formData, guardianRelationship: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ឪពុក">ឪពុក</option>
                      <option value="ម្តាយ">ម្តាយ</option>
                      <option value="ជីដូន">ជីដូន</option>
                      <option value="ជីតា">ជីតា</option>
                      <option value="បងប្អូន">បងប្អូន</option>
                      <option value="មីង/ពូ">មីង/ពូ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទអាណាព្យាបាល *</label>
                    <input
                      type="text"
                      value={formData.guardianPhone}
                      onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="ឧ. 012 998 877"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Vulnerability & Social Tags */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  ៥. ស្ថានភាពសិក្សា ជីវភាព និងសមធម៌សង្គម
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ស្ថានភាពសិក្សា</label>
                    <select
                      value={formData.academicHistory}
                      onChange={e => setFormData({ ...formData, academicHistory: e.target.value as AcademicHistoryStatus })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ឡើងថ្នាក់">ឡើងថ្នាក់ (Promoted)</option>
                      <option value="ត្រួតថ្នាក់">ត្រួតថ្នាក់ (Repeater)</option>
                      <option value="ចូលរៀនឡើងវិញ">ចូលរៀនឡើងវិញ (Re-enrolled)</option>
                      <option value="ផ្ទេរចូល">ផ្ទេរចូល (Transferred in)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ស្ថានភាពជីវភាព (IDPoor)</label>
                    <select
                      value={formData.livingCondition}
                      onChange={e => setFormData({ ...formData, livingCondition: e.target.value as LivingCondition })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ទូទៅ">ទូទៅ (General)</option>
                      <option value="ក្រ១">ក្រ១ (IDPoor 1)</option>
                      <option value="ក្រ២">ក្រ២ (IDPoor 2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ស្ថានភាពកំព្រា</label>
                    <select
                      value={formData.orphanStatus}
                      onChange={e => setFormData({ ...formData, orphanStatus: e.target.value as OrphanStatus })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="មិនកំព្រា">មិនកំព្រា</option>
                      <option value="កំព្រាឪពុក">កំព្រាឪពុក</option>
                      <option value="កំព្រាម្តាយ">កំព្រាម្តាយ</option>
                      <option value="កំព្រាទាំងពីរ">កំព្រាទាំងពីរ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ពិការភាព</label>
                    <select
                      value={formData.disability}
                      onChange={e => setFormData({ ...formData, disability: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="មិនពិការ">មិនពិការ</option>
                      <option value="ពិការភ្នែក">ពិការភ្នែក</option>
                      <option value="គថ្លង់">គថ្លង់</option>
                      <option value="ពិការអវយវៈ">ពិការអវយវៈ</option>
                      <option value="បញ្ញាស្មារតី">បញ្ញាស្មារតី</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">អាហារូបករណ៍</label>
                    <input
                      type="text"
                      value={formData.scholarship}
                      onChange={e => setFormData({ ...formData, scholarship: e.target.value })}
                      placeholder="ឧ. អាហារូបករណ៍រដ្ឋ (MoEYS)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ជនជាតិ</label>
                    <input
                      type="text"
                      value={formData.ethnicMinority}
                      onChange={e => setFormData({ ...formData, ethnicMinority: e.target.value })}
                      placeholder="ឧ. ខ្មែរ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">សាលារៀនចាស់ (បើផ្ទេរចូល)</label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={e => setFormData({ ...formData, previousSchool: e.target.value })}
                      placeholder="ឧ. សាលាបឋមសិក្សាវត្តគរ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Health & Nutrition */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  ៦. ទិន្នន័យសុខភាព និងអាហារូបត្ថម្ភ (BMI)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">កម្ពស់ (cm)</label>
                    <input
                      type="number"
                      value={formData.heightCm}
                      onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ទម្ងន់ (kg)</label>
                    <input
                      type="number"
                      value={formData.weightKg}
                      onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ក្រុមឈាម</label>
                    <select
                      value={formData.bloodType}
                      onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">វ៉ាក់សាំងកុមារ</label>
                    <select
                      value={formData.vaccinated ? 'true' : 'false'}
                      onChange={e => setFormData({ ...formData, vaccinated: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="true">បានចាក់គ្រប់ដូស</option>
                      <option value="false">មិនទាន់គ្រប់ដូស</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">កំណត់សម្គាល់សុខភាព/អាហារូបត្ថម្ភ</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ឧ. សុខភាពមាំមួនល្អ គ្មានជំងឺប្រចាំកាយ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              </>
              )}

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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingStudent ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលសិស្ស'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Student Profile & Score History Multi-Page PDF Modal */}
      {isMultiPdfModalOpen && (
        <MultiStudentProfileSummaryPdfModal
          students={
            selectedStudentIds.length > 0
              ? students.filter(s => selectedStudentIds.includes(s.id))
              : filteredStudents
          }
          scores={scores}
          dailyAttendance={attendanceRecords}
          schoolProfile={schoolProfile}
          getStudentBadges={getStudentBadges}
          getStudentTotalPoints={getStudentTotalPoints}
          onClose={() => setIsMultiPdfModalOpen(false)}
        />
      )}

      {/* MoEYS Standard Student Record Master Table Modal (12 Columns & Official Print) */}
      {isMoeyMasterModalOpen && (
        <MoEYSStudentRecordMasterModal
          students={students}
          schoolProfile={schoolProfile}
          initialGrade={selectedGrade === 'all' ? 'all' : selectedGrade}
          onClose={() => setIsMoeyMasterModalOpen(false)}
        />
      )}

      {/* Pull Students To Class Modal (for Teacher) */}
      {isPullModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-moul">ទាញសិស្សចូលមកថ្នាក់ទី {teacherGrade}«{teacherSection}» របស់ខ្ញុំ</h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    ជ្រើសរើសសិស្សដែលមិនទាន់មានថ្នាក់ ឬពីថ្នាក់ផ្សេង ដើម្បីទាញចូលមកក្នុងបញ្ជីថ្នាក់របស់លោកគ្រូ-អ្នកគ្រូ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPullModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pullSearchQuery}
                  onChange={e => setPullSearchQuery(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ អត្តលេខ ឬលេខទូរស័ព្ទអាណាព្យាបាល..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">មកពីកម្រិតថ្នាក់៖</span>
                <select
                  value={pullGradeFilter}
                  onChange={e => setPullGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">ថ្នាក់ផ្សេងៗទាំងអស់</option>
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                  ))}
                </select>
              </div>

              {/* Quick Select All */}
              {(() => {
                const pullableCandidates = students.filter(s => {
                  if (s.grade === teacherGrade && s.section === teacherSection) return false;
                  if (pullGradeFilter !== 'all' && s.grade !== pullGradeFilter) return false;
                  if (pullSearchQuery.trim()) {
                    const q = pullSearchQuery.toLowerCase();
                    const matchName = s.nameKhmer.toLowerCase().includes(q) || (s.nameLatin && s.nameLatin.toLowerCase().includes(q));
                    const matchCode = s.code.toLowerCase().includes(q);
                    const matchPhone = (s.guardianPhone && s.guardianPhone.includes(q)) || (s.phone && s.phone.includes(q));
                    if (!matchName && !matchCode && !matchPhone) return false;
                  }
                  return true;
                });

                const isAllSelected = pullableCandidates.length > 0 && pullableCandidates.every(s => selectedPullStudentIds.includes(s.id));

                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (isAllSelected) {
                        setSelectedPullStudentIds([]);
                      } else {
                        setSelectedPullStudentIds(pullableCandidates.map(s => s.id));
                      }
                    }}
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className={`w-3.5 h-3.5 ${isAllSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{isAllSelected ? 'ដកការជ្រើសរើសទាំងអស់' : 'ជ្រើសរើសទាំងអស់'}</span>
                  </button>
                );
              })()}
            </div>

            {/* Students Candidate List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
              {(() => {
                const pullableCandidates = students.filter(s => {
                  if (s.grade === teacherGrade && s.section === teacherSection) return false;
                  if (pullGradeFilter !== 'all' && s.grade !== pullGradeFilter) return false;
                  if (pullSearchQuery.trim()) {
                    const q = pullSearchQuery.toLowerCase();
                    const matchName = s.nameKhmer.toLowerCase().includes(q) || (s.nameLatin && s.nameLatin.toLowerCase().includes(q));
                    const matchCode = s.code.toLowerCase().includes(q);
                    const matchPhone = (s.guardianPhone && s.guardianPhone.includes(q)) || (s.phone && s.phone.includes(q));
                    if (!matchName && !matchCode && !matchPhone) return false;
                  }
                  return true;
                });

                if (pullableCandidates.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-600">មិនមានសិស្សដែលអាចទាញចូលបានតាមលក្ខខណ្ឌនេះឡើយ</p>
                      <p className="text-xs text-slate-400 mt-1">សិស្សទាំងអស់ប្រហែលជាស្ថិតក្នុងថ្នាក់ទី {teacherGrade}«{teacherSection}» រួចរាល់ហើយ ឬពុំត្រូវនឹងពាក្យស្វែងរក</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {pullableCandidates.map(s => {
                      const isSelected = selectedPullStudentIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedPullStudentIds(prev =>
                              prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                            );
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                              {s.gender === 'F' ? '👧' : '👦'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate">{s.nameKhmer}</p>
                              <p className="text-[11px] text-slate-500 truncate">{s.code} • ថ្នាក់បច្ចុប្បន្ន៖ <span className="font-semibold text-slate-700">ថ្នាក់ទី {s.grade}{s.section}</span></p>
                              {s.guardianPhone && (
                                <p className="text-[10px] text-slate-400 truncate">អាណាព្យាបាល៖ {s.guardianName || 'N/A'} ({s.guardianPhone})</p>
                              )}
                            </div>
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isSelected ? 'បានជ្រើសរើស' : 'ចុចដើម្បីរើស'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-600 font-medium">
                បានជ្រើសរើសសិស្ស៖ <span className="font-bold text-blue-700 text-sm">{selectedPullStudentIds.length} នាក់</span>
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPullModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  disabled={selectedPullStudentIds.length === 0}
                  onClick={() => {
                    pullStudentsToClass(selectedPullStudentIds, teacherGrade, teacherSection);
                    setSelectedPullStudentIds([]);
                    setIsPullModalOpen(false);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>ទាញសិស្ស ({selectedPullStudentIds.length}) ចូលថ្នាក់ទី {teacherGrade}«{teacherSection}»</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Students Confirmation Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-center text-slate-900 font-moul mb-2">
              បញ្ជាក់ការលុបទិន្នន័យសិស្សទាំងអស់
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mb-6 leading-relaxed">
              តើលោកអ្នកពិតជាចង់លុបទិន្នន័យឈ្មោះសិស្សទាំងអស់ (<span className="font-bold text-red-600">{students.length} នាក់</span>) ចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះនឹងសម្អាតបញ្ជីសិស្សទាំងអស់ ហើយមិនអាចត្រឡប់វិញបានឡើយ។
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAllStudents();
                  setIsDeleteAllModalOpen(false);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>លុបទាំងអស់</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Single Student Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isSingleDeleteDialogOpen}
        onClose={() => {
          setIsSingleDeleteDialogOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudent(studentToDelete.id);
            setIsSingleDeleteDialogOpen(false);
            setStudentToDelete(null);
          }
        }}
        title="បញ្ជាក់ការលុបទិន្នន័យសិស្ស"
        student={studentToDelete}
        warningMessage="តើលោកអ្នកពិតជាចង់លុបទិន្នន័យសិស្សរូបនេះចេញពីប្រព័ន្ធមែនឬទេ? ការលុបនេះនឹងលុបចេញជាអចិន្ត្រៃយ៍ ដើម្បីការពារការបាត់បង់ទិន្នន័យដោយអចេតនា។"
      />
    </div>
  );
};
