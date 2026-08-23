import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { HouseholdRecord, FamilyMember, FamilyPovertyStatus } from '../types';
import {
  Home,
  MapPin,
  Plus,
  Search,
  Filter,
  Navigation,
  Compass,
  FileSpreadsheet,
  Printer,
  Download,
  Users,
  Eye,
  Edit2,
  Trash2,
  Phone,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  X,
  Save,
  LocateFixed,
  Map,
  Grid,
  List
} from 'lucide-react';
import { AngkorPageWatermark, MoEYSRoyalHeader } from './AngkorMotif';
import { UniversalPrintModal } from './UniversalPrintModal';

export const HouseholdCensus: React.FC = () => {
  const {
    households,
    villages,
    addHousehold,
    updateHousehold,
    deleteHousehold,
    addVillage,
    schoolProfile,
    students,
    currentUser,
    printSettings,
    showToast
  } = useSchool();

  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedPoverty, setSelectedPoverty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddVillageModalOpen, setIsAddVillageModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdRecord | null>(null);
  const [newVillageName, setNewVillageName] = useState<string>('');

  // Form state for creating / editing household
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<HouseholdRecord, 'id'>>({
    houseNumber: '',
    village: villages[0] || 'ភូមិអូរគល់សំយ៉ុង',
    commune: schoolProfile.commune || 'ឃុំបារាំងធ្លាក់',
    district: schoolProfile.district || 'ស្រុកភ្នំព្រឹក',
    province: schoolProfile.province || 'ខេត្តបាត់ដំបង',
    censusDate: new Date().toISOString().split('T')[0],
    academicYear: schoolProfile.academicYear || '២០២៤ - ២០២៥',
    lat: 13.2415,
    lng: 102.3456,
    gpsAccuracy: 5,
    housePhotoUrl: '',
    familyBookPhotoUrl: '',
    equityCardPhotoUrl: '',
    headName: '',
    headGender: 'M',
    headOccupation: 'កសិករ',
    headNationalId: '',
    spouseName: '',
    spouseGender: 'F',
    spouseOccupation: 'មេផ្ទះ',
    houseType: 'ផ្ទះឈើលើថ្មក្រោម ប្រក់ស័ង្កសី',
    currentAddress: '',
    familyStatus: 'ទូទៅ',
    equityCardNumber: '',
    phoneNumber: '',
    members: [],
    remarks: '',
    recordedBy: currentUser?.nameKhmer || 'លោកគ្រូ អ្នកគ្រូ'
  });

  // Current member being added in form
  const [tempMember, setTempMember] = useState<Omit<FamilyMember, 'id'>>({
    name: '',
    gender: 'M',
    dob: '2015-01-01',
    age: 11,
    relationship: 'កូន',
    occupation: 'សិស្ស',
    civilStatusDoc: 'សំបុត្រកំណើត',
    isStudentAtSchool: true,
    studentGrade: 5,
    studentSection: 'ក',
    studentCode: ''
  });

  // GPS auto-capture loading
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // Filtered households
  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      const matchVillage = selectedVillage === 'all' || h.village === selectedVillage;
      const matchPoverty = selectedPoverty === 'all' || h.familyStatus === selectedPoverty;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        h.headName.toLowerCase().includes(q) ||
        (h.houseNumber && h.houseNumber.toLowerCase().includes(q)) ||
        (h.phoneNumber && h.phoneNumber.includes(q)) ||
        (h.equityCardNumber && h.equityCardNumber.toLowerCase().includes(q)) ||
        h.members.some(m => m.name.toLowerCase().includes(q) || (m.studentCode && m.studentCode.toLowerCase().includes(q)));
      return matchVillage && matchPoverty && matchSearch;
    });
  }, [households, selectedVillage, selectedPoverty, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalHomes = households.length;
    let totalPeople = 0;
    let schoolAgeChildren = 0;
    let enrolledInSchool = 0;
    let poor1Count = 0;
    let poor2Count = 0;

    households.forEach(h => {
      totalPeople += h.members.length > 0 ? h.members.length : 2; // at least head + spouse
      h.members.forEach(m => {
        if (m.age && m.age >= 6 && m.age <= 12) {
          schoolAgeChildren++;
        }
        if (m.isStudentAtSchool) {
          enrolledInSchool++;
        }
      });
      if (h.familyStatus === 'ក្រ១') poor1Count++;
      if (h.familyStatus === 'ក្រ២') poor2Count++;
    });

    const enrollmentRate = schoolAgeChildren > 0 ? Math.min(100, Math.round((enrolledInSchool / schoolAgeChildren) * 100)) : 100;

    return {
      totalHomes,
      totalPeople,
      schoolAgeChildren,
      enrolledInSchool,
      enrollmentRate,
      poor1Count,
      poor2Count
    };
  }, [households]);

  // Handle GPS Capture
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      showToast('ឧបករណ៍របស់អ្នកមិនគាំទ្រប្រព័ន្ធ Geolocation ឡើយ', 'error');
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setIsGpsLoading(false);
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          gpsAccuracy: Math.round(position.coords.accuracy)
        }));
        showToast(`បានចាប់យកទីតាំង GPS ជោគជ័យ! (ភាពសុក្រឹត: ±${Math.round(position.coords.accuracy)}m)`);
      },
      error => {
        setIsGpsLoading(false);
        // Fallback default coordinates near Phnom Proek
        setFormData(prev => ({
          ...prev,
          lat: 13.2415 + (Math.random() - 0.5) * 0.01,
          lng: 102.3456 + (Math.random() - 0.5) * 0.01,
          gpsAccuracy: 10
        }));
        showToast('មិនអាចទាញយក GPS បានផ្ទាល់។ បានបញ្ចូលទីតាំងលំនាំដើមនៃភូមិអូរគល់សំយ៉ុង។', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      houseNumber: `H-${String(households.length + 1).padStart(3, '0')}`,
      village: villages[0] || 'ភូមិអូរគល់សំយ៉ុង',
      commune: schoolProfile.commune || 'ឃុំបារាំងធ្លាក់',
      district: schoolProfile.district || 'ស្រុកភ្នំព្រឹក',
      province: schoolProfile.province || 'ខេត្តបាត់ដំបង',
      censusDate: new Date().toISOString().split('T')[0],
      academicYear: schoolProfile.academicYear || '២០២៤ - ២០២៥',
      lat: 13.2415 + (Math.random() - 0.5) * 0.008,
      lng: 102.3456 + (Math.random() - 0.5) * 0.008,
      gpsAccuracy: 4,
      housePhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
      familyBookPhotoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
      equityCardPhotoUrl: '',
      headName: '',
      headGender: 'M',
      headOccupation: 'កសិករ',
      headNationalId: '',
      spouseName: '',
      spouseGender: 'F',
      spouseOccupation: 'មេផ្ទះ',
      houseType: 'ផ្ទះឈើលើថ្មក្រោម ប្រក់ស័ង្កសី',
      currentAddress: `ភូមិ${villages[0] || 'អូរគល់សំយ៉ុង'} ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង`,
      familyStatus: 'ទូទៅ',
      equityCardNumber: '',
      phoneNumber: '',
      members: [],
      remarks: '',
      recordedBy: currentUser?.nameKhmer || 'លោកគ្រូ អ្នកគ្រូ'
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (h: HouseholdRecord) => {
    setEditingId(h.id);
    setFormData({
      houseNumber: h.houseNumber,
      village: h.village,
      commune: h.commune,
      district: h.district,
      province: h.province,
      censusDate: h.censusDate,
      academicYear: h.academicYear,
      lat: h.lat,
      lng: h.lng,
      gpsAccuracy: h.gpsAccuracy,
      housePhotoUrl: h.housePhotoUrl || '',
      familyBookPhotoUrl: h.familyBookPhotoUrl || '',
      equityCardPhotoUrl: h.equityCardPhotoUrl || '',
      headName: h.headName,
      headGender: h.headGender,
      headOccupation: h.headOccupation,
      headNationalId: h.headNationalId || '',
      spouseName: h.spouseName || '',
      spouseGender: h.spouseGender || 'F',
      spouseOccupation: h.spouseOccupation || '',
      houseType: h.houseType || '',
      currentAddress: h.currentAddress || '',
      familyStatus: h.familyStatus,
      equityCardNumber: h.equityCardNumber || '',
      phoneNumber: h.phoneNumber || '',
      members: [...h.members],
      remarks: h.remarks || '',
      recordedBy: h.recordedBy || ''
    });
    setIsAddModalOpen(true);
  };

  // Add Member to Form
  const handleAddMemberToForm = () => {
    if (!tempMember.name.trim()) {
      showToast('សូមបញ្ចូលឈ្មោះសមាជិកគ្រួសារ!', 'error');
      return;
    }
    const newMember: FamilyMember = {
      ...tempMember,
      id: `mem-${Date.now()}`
    };
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    // Reset temp member
    setTempMember({
      name: '',
      gender: 'M',
      dob: '2016-01-01',
      age: 10,
      relationship: 'កូន',
      occupation: 'សិស្ស',
      civilStatusDoc: 'សំបុត្រកំណើត',
      isStudentAtSchool: false,
      studentGrade: undefined,
      studentSection: undefined,
      studentCode: ''
    });
  };

  const handleRemoveMemberFromForm = (memId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memId)
    }));
  };

  // Save Household
  const handleSaveHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headName.trim()) {
      showToast('សូមបញ្ចូលឈ្មោះមេគ្រួសារ!', 'error');
      return;
    }

    if (editingId) {
      updateHousehold(editingId, formData);
    } else {
      addHousehold(formData);
    }
    setIsAddModalOpen(false);
  };

  // Add Catchment Village
  const handleAddVillageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName.trim()) return;
    addVillage(newVillageName.trim());
    setNewVillageName('');
    setIsAddVillageModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'លេខកូដ/ខ្នងផ្ទះ',
      'ភូមិ',
      'ឃុំ',
      'ស្រុក',
      'ឈ្មោះមេគ្រួសារ',
      'ភេទ',
      'មុខរបរ',
      'លេខទូរស័ព្ទ',
      'ស្ថានភាពជីវភាព',
      'លេខប័ណ្ណសមធម៌',
      'ចំនួនសមាជិក',
      'កូអរដោនេ Latitude',
      'កូអរដោនេ Longitude'
    ];

    const rows = filteredHouseholds.map(h => [
      `"${h.houseNumber || ''}"`,
      `"${h.village}"`,
      `"${h.commune}"`,
      `"${h.district}"`,
      `"${h.headName}"`,
      `"${h.headGender === 'M' ? 'ប្រុស' : 'ស្រី'}"`,
      `"${h.headOccupation || ''}"`,
      `"${h.phoneNumber || ''}"`,
      `"${h.familyStatus}"`,
      `"${h.equityCardNumber || ''}"`,
      h.members.length,
      h.lat || '',
      h.lng || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeLatinName = (schoolProfile.nameLatin || 'Phnom_Pom').replace(/\s+/g, '_');
    link.download = `Household_Census_${safeLatinName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('បានទាញយកទិន្នន័យជំរឿនខ្នងផ្ទះជាទម្រង់ CSV ជោគជ័យ!');
  };

  const getPovertyBadge = (status: FamilyPovertyStatus) => {
    switch (status) {
      case 'ក្រ១':
        return <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-lg border border-red-200">ក្រីក្រកម្រិត១ (IDPoor 1)</span>;
      case 'ក្រ២':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg border border-amber-200">ក្រីក្រកម្រិត២ (IDPoor 2)</span>;
      case 'ងាយរងហានិភ័យ':
        return <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-lg border border-purple-200">ងាយរងហានិភ័យ</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg border border-slate-200">ជីវភាពទូទៅ</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen & Printable Watermark */}
      <AngkorPageWatermark />

      {/* Screen Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 shadow-inner">
            <Home className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 font-moul">ជំរឿនផែនទីខ្នងផ្ទះសិស្ស</h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                MoEYS Catchment Area
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ស្ថិតិ និងផែនទីទីតាំងខ្នងផ្ទះប្រជាពលរដ្ឋក្នុងភូមិតំបន់សេវា {schoolProfile.nameKhmer}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={() => setIsAddVillageModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
          >
            <Layers className="w-4 h-4 text-slate-600" />
            <span>បន្ថែមភូមិក្នុងតំបន់សេវា</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>ទាញយក CSV</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-all"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>បោះពុម្ពសៀវភៅជំរឿន</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>កត់ត្រាខ្នងផ្ទះថ្មី (New Home)</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ខ្នងផ្ទះសរុប</span>
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-moul">{stats.totalHomes} <span className="text-xs font-normal text-slate-500 font-battambang">ខ្នង</span></p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1">ក្នុង {villages.length} ភូមិតំបន់សេវា</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ប្រជាជនសរុប</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-moul">{stats.totalPeople} <span className="text-xs font-normal text-slate-500 font-battambang">នាក់</span></p>
          <span className="text-[11px] text-blue-600 font-medium mt-1">សមាជិកគ្រួសារ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">កុមារអាយុ ៦-១២</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-moul">{stats.schoolAgeChildren} <span className="text-xs font-normal text-slate-500 font-battambang">នាក់</span></p>
          <span className="text-[11px] text-purple-600 font-medium mt-1">អាយុត្រូវចូលរៀន</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">កំពុងរៀននៅសាលា</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-moul">{stats.enrolledInSchool} <span className="text-xs font-normal text-slate-500 font-battambang">នាក់</span></p>
          <span className="text-[11px] text-teal-600 font-medium mt-1">អត្រាចុះឈ្មោះ {stats.enrollmentRate}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ប័ណ្ណសមធម៌ក្រ១</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2 font-moul">{stats.poor1Count} <span className="text-xs font-normal text-slate-500 font-battambang">គ្រួសារ</span></p>
          <span className="text-[11px] text-red-600 font-medium mt-1">អាទិភាពអាហារូបករណ៍</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ប័ណ្ណសមធម៌ក្រ២</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2 font-moul">{stats.poor2Count} <span className="text-xs font-normal text-slate-500 font-battambang">គ្រួសារ</span></p>
          <span className="text-[11px] text-amber-600 font-medium mt-1">ក្រីក្រកម្រិត២</span>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        {/* Left: Village & Poverty Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Village Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">ភូមិ៖</span>
            <select
              value={selectedVillage}
              onChange={e => setSelectedVillage(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">គ្រប់ភូមិទាំងអស់ ({villages.length})</option>
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Poverty Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500">ស្ថានភាព៖</span>
            <select
              value={selectedPoverty}
              onChange={e => setSelectedPoverty(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">គ្រប់កម្រិតជីវភាព</option>
              <option value="ក្រ១">ក្រ១ (IDPoor 1)</option>
              <option value="ក្រ២">ក្រ២ (IDPoor 2)</option>
              <option value="ងាយរងហានិភ័យ">ងាយរងហានិភ័យ</option>
              <option value="ទូទៅ">ទូទៅ</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះមេគ្រួសារ លេខផ្ទះ ឬលេខប័ណ្ណ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Right: View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>កាត (Cards)</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'table' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>តារាង (Table)</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'map' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-rose-600" />
            <span>ផែនទី (Map View)</span>
          </button>
        </div>
      </div>

      {/* Main Content Presentation */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 no-print">
          {filteredHouseholds.map(h => {
            const studentCount = h.members.filter(m => m.isStudentAtSchool).length;
            const googleMapDirectLink = `https://www.google.com/maps/search/?api=1&query=${h.lat || 13.2415},${h.lng || 102.3456}`;

            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Card Top Banner with Photo & Status */}
                <div className="relative h-40 bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={h.housePhotoUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80'}
                    alt={`ផ្ទះ ${h.headName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Poverty Badge */}
                  <div className="absolute top-3 left-3">
                    {getPovertyBadge(h.familyStatus)}
                  </div>

                  {/* House Number Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                    ខ្នងផ្ទះ៖ {h.houseNumber || 'N/A'}
                  </div>

                  {/* Family Head Info Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-lg font-bold font-moul drop-shadow-sm">{h.headName}</p>
                    <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{h.village}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">សហព័ទ្ធ (ប្តី/ប្រពន្ធ)៖</span>
                      <span className="font-bold text-slate-800">{h.spouseName || 'ពុំមាន'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">មុខរបរមេគ្រួសារ៖</span>
                      <span className="font-semibold text-slate-700">{h.headOccupation || 'កសិករ'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">សមាជិកក្នុងបន្ទុក៖</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {h.members.length} នាក់ (រៀននៅសាលា {studentCount} នាក់)
                      </span>
                    </div>

                    {h.equityCardNumber && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">លេខប័ណ្ណសមធម៌៖</span>
                        <span className="font-mono font-bold text-red-600">{h.equityCardNumber}</span>
                      </div>
                    )}

                    {h.phoneNumber && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">ទូរស័ព្ទទំនាក់ទំនង៖</span>
                        <a href={`tel:${h.phoneNumber}`} className="font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {h.phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Location Coordinate Snippet & Map Link */}
                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Navigation className="w-3.5 h-3.5 text-rose-500" />
                      <span>GPS: {h.lat?.toFixed(4)}, {h.lng?.toFixed(4)}</span>
                    </div>
                    <a
                      href={googleMapDirectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                    >
                      <span>បើក Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedHousehold(h);
                        setIsDetailModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ពិនិត្យលម្អិត</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(h)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="កែសម្រួល"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យខ្នងផ្ទះរបស់ «${h.headName}» មែនទេ?`)) {
                          deleteHousehold(h.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="លុបខ្នងផ្ទះ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-center">ល.រ</th>
                  <th className="py-3 px-4 font-bold">លេខផ្ទះ</th>
                  <th className="py-3 px-4 font-bold">ឈ្មោះមេគ្រួសារ</th>
                  <th className="py-3 px-4 font-bold">ភេទ</th>
                  <th className="py-3 px-4 font-bold">ភូមិ</th>
                  <th className="py-3 px-4 font-bold">ស្ថានភាពជីវភាព</th>
                  <th className="py-3 px-4 font-bold text-center">សមាជិក</th>
                  <th className="py-3 px-4 font-bold">ទូរស័ព្ទ</th>
                  <th className="py-3 px-4 font-bold text-center">ទីតាំងផែនទី</th>
                  <th className="py-3 px-4 font-bold text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredHouseholds.map((h, idx) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{h.houseNumber || '-'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{h.headName}</td>
                    <td className="py-3 px-4">{h.headGender === 'M' ? 'ប្រុស' : 'ស្រី'}</td>
                    <td className="py-3 px-4 font-medium text-emerald-800">{h.village}</td>
                    <td className="py-3 px-4">{getPovertyBadge(h.familyStatus)}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700">
                      {h.members.length}
                    </td>
                    <td className="py-3 px-4 font-mono">{h.phoneNumber || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${h.lat || 13.2415},${h.lng || 102.3456}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Google Map</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedHousehold(h);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="មើលលម្អិត"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(h)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="កែសម្រួល"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យខ្នងផ្ទះរបស់ «${h.headName}» មែនទេ?`)) {
                              deleteHousehold(h.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="លុប"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Map View */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-4 space-y-4 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">ផែនទីទីតាំងខ្នងផ្ទះសិស្សក្នុងតំបន់សេវា ({filteredHouseholds.length} ខ្នង)</h3>
            </div>
            <a
              href="https://maps.app.goo.gl/ackTYSYsd7t54vGP6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <span>បើកទីតាំងសាលារៀនលើ Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Embedded Google Map with School & Household Pinpoints */}
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
            <iframe
              title="Google Map Phnom Pom Primary School Catchment Area"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15654.897451234!2d102.342145!3d13.241567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDE0JzI5LjYiTiAxMDLCsDIwJzMxLjciRQ!5e0!3m2!1skm!2skh!4v1700000000000!5m2!1skm!2skh"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Household Pins Overlay Legend */}
            <div className="absolute top-4 right-4 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/80 max-h-[460px] overflow-y-auto space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">បញ្ជីខ្នងផ្ទះលើផែនទី</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {filteredHouseholds.length} ទីតាំង
                </span>
              </div>

              <div className="space-y-2">
                {filteredHouseholds.map(h => (
                  <div
                    key={h.id}
                    onClick={() => {
                      setSelectedHousehold(h);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-start gap-2.5 text-xs"
                  >
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{h.headName} (ផ្ទះ {h.houseNumber || 'N/A'})</p>
                      <p className="text-[11px] text-slate-500">{h.village} • {h.members.length} នាក់</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getPovertyBadge(h.familyStatus)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official MoEYS Printable Catchment Census Report (Hidden on screen, shown in print) */}
      <div className="hidden print:block bg-white p-4 space-y-6">
        <MoEYSRoyalHeader />

        <div className="text-center space-y-1 mt-4">
          <h2 className="text-lg font-bold font-moul text-slate-900">សៀវភៅស្ថិតិជំរឿនខ្នងផ្ទះសិស្សក្នុងតំបន់សេវា</h2>
          <p className="text-xs font-bold text-slate-700">
            {schoolProfile.nameKhmer} • {selectedVillage === 'all' ? 'គ្រប់ភូមិទាំងអស់' : selectedVillage}
          </p>
          <p className="text-[11px] text-slate-600">
            ឆ្នាំសិក្សា {schoolProfile.academicYear} • ឃុំ{schoolProfile.commune} ស្រុក{schoolProfile.district} {schoolProfile.province}
          </p>
        </div>

        {/* Printable Table */}
        <table className="w-full text-[11px] border-collapse border border-slate-900 mt-4">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
              <th className="border border-slate-900 p-1.5 w-10">ល.រ</th>
              <th className="border border-slate-900 p-1.5 w-16">លេខផ្ទះ</th>
              <th className="border border-slate-900 p-1.5">ឈ្មោះមេគ្រួសារ</th>
              <th className="border border-slate-900 p-1.5 w-12">ភេទ</th>
              <th className="border border-slate-900 p-1.5">សហព័ទ្ធ</th>
              <th className="border border-slate-900 p-1.5">ភូមិ</th>
              <th className="border border-slate-900 p-1.5">ស្ថានភាព</th>
              <th className="border border-slate-900 p-1.5 w-16">សមាជិក</th>
              <th className="border border-slate-900 p-1.5 w-20">រៀននៅសាលា</th>
              <th className="border border-slate-900 p-1.5">លេខទូរស័ព្ទ</th>
            </tr>
          </thead>
          <tbody>
            {filteredHouseholds.map((h, i) => (
              <tr key={h.id} className="border-b border-slate-800 text-slate-900">
                <td className="border border-slate-900 p-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-900 p-1.5 text-center font-bold">{h.houseNumber || '-'}</td>
                <td className="border border-slate-900 p-1.5 font-bold">{h.headName}</td>
                <td className="border border-slate-900 p-1.5 text-center">{h.headGender === 'M' ? 'ប' : 'ស'}</td>
                <td className="border border-slate-900 p-1.5">{h.spouseName || '-'}</td>
                <td className="border border-slate-900 p-1.5">{h.village}</td>
                <td className="border border-slate-900 p-1.5 text-center">{h.familyStatus}</td>
                <td className="border border-slate-900 p-1.5 text-center font-bold">{h.members.length}</td>
                <td className="border border-slate-900 p-1.5 text-center font-bold text-blue-800">
                  {h.members.filter(m => m.isStudentAtSchool).length} នាក់
                </td>
                <td className="border border-slate-900 p-1.5 font-mono">{h.phoneNumber || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Printable Signatures & Stamps Footer */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-slate-900 mt-6 page-break-inside-avoid">
          <div className="text-center space-y-1">
            <p className="font-bold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
            <p className="font-bold">ប្រធានគណៈកម្មការជំរឿន / លេខាធិការ</p>
            <div className="h-20" />
            <p className="font-bold">លោក ឈិន សុផល</p>
          </div>

          <div className="text-center space-y-1 relative">
            <p>ថ្ងៃ................ខែ..........ឆ្នាំ..............ព.ស.២៥៦...</p>
            <p className="font-bold">{schoolProfile.district}, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</p>
            <p className="font-bold font-moul text-sm text-blue-950">នាយកសាលាបឋមសិក្សា</p>

            <div className="h-24 relative flex items-center justify-center">
              {/* Optional Official Stamp */}
              {printSettings.showRoundStamp && (
                <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-red-600/80 flex flex-col items-center justify-center text-red-600 p-1 opacity-90 rotate-[-8deg]">
                  <span className="text-[9px] font-bold">ក្រសួងអប់រំ យុវជន និងកីឡា</span>
                  <span className="text-[8px] font-bold text-center">★ សាលាបឋមសិក្សាភ្នំពុំ ★</span>
                  <span className="text-[7px]">បាត់ដំបង</span>
                </div>
              )}

              {/* Optional Director Signature */}
              {printSettings.showDirectorSignature && (
                <span className="font-cursive text-2xl text-blue-900 transform -rotate-6 z-10 select-none">
                  Lim Sorn
                </span>
              )}
            </div>

            {/* Director Name */}
            <p className={`font-bold font-moul text-sm ${printSettings.showDirectorRedName ? 'text-red-600' : 'text-slate-900'}`}>
              {schoolProfile.principalName}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add/Edit Household */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                  <Home className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight font-moul">
                    {editingId ? 'កែសម្រួលទិន្នន័យខ្នងផ្ទះ' : 'កត់ត្រាស្ថិតិខ្នងផ្ទះថ្មី'}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">Household Catchment Census Form</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveHousehold} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Section 1: Location & Coordinates */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>១. ទីតាំងភូមិសាស្ត្រ & កូអរដោនេ GPS</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isGpsLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>{isGpsLoading ? 'កំពុងចាប់យក GPS...' : 'ចាប់យក GPS ស្វ័យប្រវត្តិ'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">លេខខ្នងផ្ទះ (House No.)</label>
                    <input
                      type="text"
                      value={formData.houseNumber || ''}
                      onChange={e => setFormData({ ...formData, houseNumber: e.target.value })}
                      placeholder="ឧ. ០២៨"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ភូមិតំបន់សេវា *</label>
                    <select
                      value={formData.village}
                      onChange={e => setFormData({ ...formData, village: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                    >
                      {villages.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Latitude (រយៈទទឹង)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat || 13.2415}
                      onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Longitude (រយៈបណ្តោយ)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng || 102.3456}
                      onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">អាសយដ្ឋានលម្អិតបច្ចុប្បន្ន</label>
                  <input
                    type="text"
                    value={formData.currentAddress || ''}
                    onChange={e => setFormData({ ...formData, currentAddress: e.target.value })}
                    placeholder="ភូមិ... ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Section 2: Family Head & Spouse */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>២. ព័ត៌មានមេគ្រួសារ និងសហព័ទ្ធ</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ឈ្មោះមេគ្រួសារ *</label>
                    <input
                      type="text"
                      required
                      value={formData.headName}
                      onChange={e => setFormData({ ...formData, headName: e.target.value })}
                      placeholder="ឧ. សុខ ជា"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ភេទ</label>
                    <select
                      value={formData.headGender}
                      onChange={e => setFormData({ ...formData, headGender: e.target.value as 'M' | 'F' })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                    >
                      <option value="M">ប្រុស</option>
                      <option value="F">ស្រី</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">មុខរបរមេគ្រួសារ</label>
                    <input
                      type="text"
                      value={formData.headOccupation || ''}
                      onChange={e => setFormData({ ...formData, headOccupation: e.target.value })}
                      placeholder="កសិករ / អាជីវករ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ឈ្មោះសហព័ទ្ធ (ប្តី/ប្រពន្ធ)</label>
                    <input
                      type="text"
                      value={formData.spouseName || ''}
                      onChange={e => setFormData({ ...formData, spouseName: e.target.value })}
                      placeholder="ឧ. កែវ សុខា"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">មុខរបរសហព័ទ្ធ</label>
                    <input
                      type="text"
                      value={formData.spouseOccupation || ''}
                      onChange={e => setFormData({ ...formData, spouseOccupation: e.target.value })}
                      placeholder="មេផ្ទះ / កសិករ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">លេខទូរស័ព្ទទាក់ទង</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="012 334 455"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Poverty Status & Equity Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>៣. ស្ថានភាពជីវភាព និងប័ណ្ណសមធម៌ (IDPoor)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ស្ថានភាពជីវភាពគ្រួសារ *</label>
                    <select
                      value={formData.familyStatus}
                      onChange={e => setFormData({ ...formData, familyStatus: e.target.value as FamilyPovertyStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                    >
                      <option value="ទូទៅ">ទូទៅ (Non-Poor)</option>
                      <option value="ក្រ១">ក្រីក្រកម្រិត១ (IDPoor 1)</option>
                      <option value="ក្រ២">ក្រីក្រកម្រិត២ (IDPoor 2)</option>
                      <option value="ងាយរងហានិភ័យ">ងាយរងហានិភ័យ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">លេខប័ណ្ណសមធម៌ (Equity Card No.)</label>
                    <input
                      type="text"
                      value={formData.equityCardNumber || ''}
                      onChange={e => setFormData({ ...formData, equityCardNumber: e.target.value })}
                      placeholder="IDP-0204-XXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">ប្រភេទផ្ទះ / សំណង់</label>
                    <input
                      type="text"
                      value={formData.houseType || ''}
                      onChange={e => setFormData({ ...formData, houseType: e.target.value })}
                      placeholder="ផ្ទះឈើលើថ្មក្រោម..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Photo URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">តំណរូបភាពខ្នងផ្ទះ (House Photo URL)</label>
                    <input
                      type="url"
                      value={formData.housePhotoUrl || ''}
                      onChange={e => setFormData({ ...formData, housePhotoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">តំណរូបភាពសៀវភៅគ្រួសារ / ប័ណ្ណសមធម៌</label>
                    <input
                      type="url"
                      value={formData.familyBookPhotoUrl || ''}
                      onChange={e => setFormData({ ...formData, familyBookPhotoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Family Members List */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>៤. បញ្ជីសមាជិកគ្រួសារ & កូនៗកំពុងរៀន ({formData.members.length} នាក់)</span>
                  </h4>
                </div>

                {/* Current Members in Form */}
                {formData.members.length > 0 && (
                  <div className="space-y-2">
                    {formData.members.map((m, idx) => (
                      <div
                        key={m.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{m.name} ({m.gender === 'M' ? 'ប្រុស' : 'ស្រី'}, អាយុ {m.age || '-'} ឆ្នាំ)</p>
                            <p className="text-[11px] text-slate-500">
                              ត្រូវជា៖ <span className="font-semibold text-slate-700">{m.relationship}</span> • មុខរបរ៖ {m.occupation}
                              {m.isStudentAtSchool && (
                                <span className="ml-2 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                  សិស្សថ្នាក់ទី{m.studentGrade}{m.studentSection} ({m.studentCode || 'N/A'})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromForm(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-form to Add Member */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-3">
                  <p className="font-bold text-emerald-900 text-xs flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>បញ្ចូលសមាជិកបន្ថែម</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <input
                        type="text"
                        placeholder="ឈ្មោះសមាជិក..."
                        value={tempMember.name}
                        onChange={e => setTempMember({ ...tempMember, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium"
                      />
                    </div>

                    <div>
                      <select
                        value={tempMember.gender}
                        onChange={e => setTempMember({ ...tempMember, gender: e.target.value as 'M' | 'F' })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                      >
                        <option value="M">ប្រុស</option>
                        <option value="F">ស្រី</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="អាយុ..."
                        value={tempMember.age || ''}
                        onChange={e => setTempMember({ ...tempMember, age: parseInt(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div>
                      <select
                        value={tempMember.relationship}
                        onChange={e => setTempMember({ ...tempMember, relationship: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                      >
                        <option value="កូន">កូន</option>
                        <option value="ចៅ">ចៅ</option>
                        <option value="ឪពុក/ម្តាយ">ឪពុក/ម្តាយ</option>
                        <option value="បងប្អូន">បងប្អូន</option>
                        <option value="សាច់ញាតិ">សាច់ញាតិ</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={tempMember.isStudentAtSchool}
                        onChange={e => setTempMember({ ...tempMember, isStudentAtSchool: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>សិស្សកំពុងរៀននៅ {schoolProfile.nameKhmer}</span>
                    </label>

                    {tempMember.isStudentAtSchool && (
                      <div className="flex items-center gap-2">
                        <select
                          value={tempMember.studentGrade || 1}
                          onChange={e => setTempMember({ ...tempMember, studentGrade: parseInt(e.target.value) })}
                          className="px-2 py-1 rounded-lg border border-slate-300 font-bold"
                        >
                          {[1, 2, 3, 4, 5, 6].map(g => (
                            <option key={g} value={g}>ថ្នាក់ទី{g}</option>
                          ))}
                        </select>
                        <select
                          value={tempMember.studentSection || 'ក'}
                          onChange={e => setTempMember({ ...tempMember, studentSection: e.target.value })}
                          className="px-2 py-1 rounded-lg border border-slate-300 font-bold"
                        >
                          {['ក', 'ខ', 'គ'].map(s => (
                            <option key={s} value={s}>បន្ទប់{s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddMemberToForm}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all"
                    >
                      + បន្ថែមសមាជិកនេះ
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  បោះបង់ (Cancel)
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកទិន្នន័យ (Save Household)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Household Detail View */}
      {isDetailModalOpen && selectedHousehold && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden">
            {/* Detail Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                    ខ្នងផ្ទះ៖ {selectedHousehold.houseNumber || 'N/A'}
                  </span>
                  {getPovertyBadge(selectedHousehold.familyStatus)}
                </div>
                <h3 className="text-xl font-bold font-moul mt-1">{selectedHousehold.headName}</h3>
                <p className="text-xs text-emerald-200 mt-0.5">{selectedHousehold.village} ឃុំ{selectedHousehold.commune} ស្រុក{selectedHousehold.district}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detail Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Photo & GPS Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={selectedHousehold.housePhotoUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80'}
                    alt="House"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 text-emerald-700">
                      <Navigation className="w-4 h-4" />
                      <span>កូអរដោនេទីតាំងផែនទី</span>
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 font-mono">
                      Lat: {selectedHousehold.lat || 13.2415}, Lng: {selectedHousehold.lng || 102.3456}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ភាពសុក្រឹត GPS៖ ±{selectedHousehold.gpsAccuracy || 5} ម៉ែត្រ
                    </p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedHousehold.lat || 13.2415},${selectedHousehold.lng || 102.3456}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>បើកទីតាំងលើ Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">មេគ្រួសារ</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedHousehold.headName} ({selectedHousehold.headGender === 'M' ? 'ប្រុស' : 'ស្រី'})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">សហព័ទ្ធ</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedHousehold.spouseName || 'ពុំមាន'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">មុខរបរ</span>
                  <span className="font-bold text-slate-800">{selectedHousehold.headOccupation || 'កសិករ'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ទូរស័ព្ទ</span>
                  <span className="font-bold text-emerald-700 font-mono">{selectedHousehold.phoneNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ប័ណ្ណសមធម៌</span>
                  <span className="font-mono font-bold text-red-600">{selectedHousehold.equityCardNumber || 'ពុំមាន'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">កត់ត្រាដោយ</span>
                  <span className="font-semibold text-slate-700">{selectedHousehold.recordedBy || 'នាយកសាលា'}</span>
                </div>
              </div>

              {/* Members List Table */}
              <div>
                <h5 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>បញ្ជីសមាជិកគ្រួសារទាំងអស់ ({selectedHousehold.members.length} នាក់)</span>
                </h5>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center">ល.រ</th>
                        <th className="p-2.5">ឈ្មោះ</th>
                        <th className="p-2.5">ភេទ</th>
                        <th className="p-2.5">អាយុ</th>
                        <th className="p-2.5">ត្រូវជា</th>
                        <th className="p-2.5">ស្ថានភាពសិក្សានៅសាលា</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedHousehold.members.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2.5">{m.gender === 'M' ? 'ប្រុស' : 'ស្រី'}</td>
                          <td className="p-2.5 font-mono">{m.age || '-'} ឆ្នាំ</td>
                          <td className="p-2.5 font-semibold text-slate-700">{m.relationship}</td>
                          <td className="p-2.5">
                            {m.isStudentAtSchool ? (
                              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                                សិស្សថ្នាក់ទី{m.studentGrade}{m.studentSection} ({m.studentCode || 'អត្តលេខសាលា'})
                              </span>
                            ) : (
                              <span className="text-slate-400">មិនបានរៀននៅសាលា</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-medium"
              >
                បិទ (Close)
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsPrintModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពឯកសារខ្នងផ្ទះនេះ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Catchment Village */}
      {isAddVillageModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold font-moul text-sm">បន្ថែមភូមិតំបន់សេវាសាលារៀន</h3>
              <button onClick={() => setIsAddVillageModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVillageSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ឈ្មោះភូមិថ្មី (Khmer Village Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ភូមិអូរដំបង"
                  value={newVillageName}
                  onChange={e => setNewVillageName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                />
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  ភូមិដែលមានស្រាប់៖ {villages.join(', ')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVillageModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  + បន្ថែមភូមិ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Print Modal */}
      <UniversalPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        titleKhmer="សៀវភៅស្ថិតិជំរឿនខ្នងផ្ទះសិស្សក្នុងតំបន់សេវា"
        documentSubtitle={`តំបន់សេវា ${schoolProfile.nameKhmer} • ${selectedVillage === 'all' ? 'គ្រប់ភូមិទាំងអស់' : selectedVillage}`}
      />
    </div>
  );
};
