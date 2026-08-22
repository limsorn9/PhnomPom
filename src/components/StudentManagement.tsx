import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, Gender, LivingCondition, AcademicHistoryStatus, OrphanStatus } from '../types';
import { exportStudentsToGoogleSheets } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import { StudentSearchIndex } from '../utils/searchIndex';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
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
  Medal
} from 'lucide-react';
import {
  MoEYSRoyalHeader,
  AngkorPageWatermark
} from './AngkorMotif';
import { StudentBadgesManagementTab } from './badges/StudentBadgesManagementTab';
import { BadgeIcon } from './badges/BadgeIcon';
import { AwardBadgeModal } from './badges/AwardBadgeModal';
import { StudentBadgeShowcaseModal } from './badges/StudentBadgeShowcaseModal';
import { CertificateModal } from './badges/CertificateModal';

export const StudentManagement: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    searchQuery,
    schoolProfile,
    showToast,
    setActiveTab,
    studentBadgeAssignments,
    getStudentBadges,
    getStudentTotalPoints
  } = useSchool();

  // Mode: 'roster' | 'badges'
  const [viewMode, setViewMode] = useState<'roster' | 'badges'>('roster');
  const [selectedStudentForBadgeShowcase, setSelectedStudentForBadgeShowcase] = useState<Student | null>(null);
  const [selectedStudentForAwardBadge, setSelectedStudentForAwardBadge] = useState<Student | null>(null);
  const [selectedCertificateForView, setSelectedCertificateForView] = useState<any | null>(null);

  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all');
  const [selectedVulnerability, setSelectedVulnerability] = useState<'all' | 'idpoor' | 'scholarship' | 'orphan' | 'disability' | 'repeater'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState(false);

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
    // Health
    heightCm: 120,
    weightKg: 22,
    bloodType: 'O+',
    vaccinated: true,
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Build and memoize Fuzzy Search Index for students
  const studentSearchIndex = useMemo(() => {
    return new StudentSearchIndex(students);
  }, [students]);

  // Filter and fuzzy search students
  const filteredStudents = useMemo(() => {
    const query = (searchQuery || localSearch).trim();
    
    // Step 1: Apply Fuzzy Search Index if query exists
    let candidateStudents = students;
    if (query) {
      const searchResults = studentSearchIndex.search(query);
      candidateStudents = searchResults.map(res => res.item);
    }

    // Step 2: Apply categorical filters (Grade, Gender, Vulnerability)
    return candidateStudents.filter(student => {
      const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
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

      return matchesGrade && matchesGender && matchesVulnerability;
    });
  }, [students, studentSearchIndex, searchQuery, localSearch, selectedGrade, selectedGender, selectedVulnerability]);

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

    const pobFormatted = [formData.pobVillage && `ភូមិ${formData.pobVillage}`, formData.pobCommune && `ឃុំ${formData.pobCommune}`, formData.pobDistrict && `ស្រុក${formData.pobDistrict}`, formData.pobProvince].filter(Boolean).join(' ') || 'ខេត្តបាត់ដំបង';
    const addressFormatted = [formData.currentHouseNumber && `ផ្ទះលេខ${formData.currentHouseNumber}`, formData.currentStreetNumber && `ផ្លូវ${formData.currentStreetNumber}`, formData.currentVillage && `ភូមិ${formData.currentVillage}`, formData.currentCommune && `ឃុំ${formData.currentCommune}`, formData.currentDistrict && `ស្រុក${formData.currentDistrict}`, formData.currentProvince].filter(Boolean).join(' ') || 'ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង';

    const newStudentData: Omit<Student, 'id' | 'code'> = {
      nameKhmer: formData.nameKhmer,
      nameLatin: formData.nameLatin,
      gender: formData.gender,
      dob: formData.dob,
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
      status: formData.status,
      avatarUrl: formData.gender === 'F'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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
    } else {
      addStudent(newStudentData);
    }

    setIsAddModalOpen(false);
    setFormData(initialFormState);
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
      status: student.status,
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

      {viewMode === 'badges' ? (
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
            <button
              id="add-student-btn"
              onClick={() => {
                setEditingStudent(null);
                setFormData(initialFormState);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ បញ្ចូលសិស្សថ្មី</span>
            </button>
          </div>
        </div>

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
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
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

          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">អត្តលេខ & ឈ្មោះសិស្ស</th>
                <th className="py-3.5 px-4 text-center">ភេទ</th>
                <th className="py-3.5 px-4">ថ្ងៃកំណើត</th>
                <th className="py-3.5 px-4">ថ្នាក់/បន្ទប់</th>
                <th className="py-3.5 px-4">ស្ថានភាព & ជីវភាព</th>
                <th className="py-3.5 px-4">អាណាព្យាបាល & ទំនាក់ទំនង</th>
                <th className="py-3.5 px-4">សុខភាព (BMI)</th>
                <th className="py-3.5 px-4 text-center">ផ្លាកសញ្ញា & ពិន្ទុ</th>
                <th className="py-3.5 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const studentBadges = getStudentBadges(student.id);
                  const totalPoints = getStudentTotalPoints(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                          ថ្នាក់ទី {student.grade}{student.section}
                        </span>
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
                          <button
                            id={`award-badge-${student.id}`}
                            onClick={() => setSelectedStudentForAwardBadge(student)}
                            title="ប្រគល់ផ្លាកសញ្ញា ឬមេដាយ"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Award className="w-4 h-4" />
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
                            title="កែប្រែព័ត៌មាន"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-student-${student.id}`}
                            onClick={() => {
                              if (window.confirm(`តើអ្នកពិតជាចង់លុបសិស្ស «${student.nameKhmer}» ឬទេ?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            title="លុប"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ
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
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="បោះពុម្ពប្រវត្តិរូប"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedStudentForView(null)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-moul">
                    {editingStudent ? 'កែប្រែព័ត៌មានសិស្ស' : 'បញ្ចូលសិស្សថ្មីក្នុងប្រព័ន្ធ'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    ទម្រង់ប្រមូលទិន្នន័យសិស្សលម្អិតស្របតាមទម្រង់ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)
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
              {/* Section 1: Core Identification */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  ១. អត្តសញ្ញាណទូទៅ និងកម្រិតថ្នាក់
                </h4>
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
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
                  ៣. ទីលំនៅបច្ចុប្បន្នលម្អិត (Current Address Breakdown)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ផ្ទះលេខ / ផ្លូវលេខ</label>
                    <input
                      type="text"
                      value={formData.currentHouseNumber}
                      onChange={e => setFormData({ ...formData, currentHouseNumber: e.target.value })}
                      placeholder="ឧ. ផ្ទះលេខ ៤៥"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ភូមិបច្ចុប្បន្ន</label>
                    <input
                      type="text"
                      value={formData.currentVillage}
                      onChange={e => setFormData({ ...formData, currentVillage: e.target.value })}
                      placeholder="ឧ. អូរគល់សំយ៉ុង"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ឃុំ/សង្កាត់បច្ចុប្បន្ន</label>
                    <input
                      type="text"
                      value={formData.currentCommune}
                      onChange={e => setFormData({ ...formData, currentCommune: e.target.value })}
                      placeholder="ឧ. បារាំងធ្លាក់"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">ស្រុក & ខេត្ត</label>
                    <input
                      type="text"
                      value={formData.currentDistrict}
                      onChange={e => setFormData({ ...formData, currentDistrict: e.target.value })}
                      placeholder="ឧ. ភ្នំព្រឹក ខេត្តបាត់ដំបង"
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
    </div>
  );
};
