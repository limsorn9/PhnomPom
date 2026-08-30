import React, { useState, useEffect, useMemo } from 'react';
import { SchoolProfile, GradingScaleType } from '../types';
import { useSchool } from '../context/SchoolContext';
import {
  X,
  Save,
  MapPin,
  Facebook,
  Phone,
  Mail,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Globe,
  Sliders,
  Image as ImageIcon,
  Sun,
  Moon,
  Shield,
  Database,
  Download,
  Lock,
  Clock,
  HardDrive,
  Check
} from 'lucide-react';

interface SchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: SchoolProfile;
  onSave: (updatedProfile: SchoolProfile) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface FormErrors {
  nameKhmer?: string;
  nameLatin?: string;
  schoolCode?: string;
  principalPhone?: string;
  email?: string;
  mapUrl?: string;
  facebookPage?: string;
  academicYear?: string;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onSave,
  showToast
}) => {
  const {
    isDarkMode,
    toggleDarkMode,
    students,
    scores,
    attendanceRecords,
    dailyHealthChecks,
    teachers,
    studentBadgeAssignments,
    activityLogs,
    transfers,
    currentUser
  } = useSchool();
  const [formData, setFormData] = useState<SchoolProfile>(initialProfile);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'contact' | 'links' | 'settings' | 'security'>('general');
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);

  // Check role: strictly director or super_admin
  const isAuthorized = currentUser?.role === 'director' || currentUser?.role === 'super_admin';

  // Reset form when modal opens with fresh initialProfile
  useEffect(() => {
    if (isOpen) {
      setFormData(initialProfile);
      setErrors({});
      setTouched({});
      setActiveTab('general');
    }
  }, [isOpen, initialProfile]);

  // Validation functions
  const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
    if (!phone || phone.trim() === '') {
      return { isValid: true }; // Optional field, but if provided must match
    }
    // Strip spaces, hyphens, dots, parentheses
    const cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
    
    // Check if starts with 0 (9-10 digits) or +855 / 855 (11-12 digits)
    const khmerPhonePattern = /^(0[1-9]\d{7,8}|\+?855[1-9]\d{7,8})$/;
    
    if (!khmerPhonePattern.test(cleaned)) {
      return {
        isValid: false,
        message: 'ទ្រង់ទ្រាយលេខទូរស័ព្ទមិនត្រឹមត្រូវ (ឧទាហរណ៍៖ 087 99 19 77, 012 345 678 ឬ +855 87 991 977)'
      };
    }
    return { isValid: true };
  };

  const validateGoogleMapsUrl = (url: string): { isValid: boolean; message?: string } => {
    if (!url || url.trim() === '') {
      return { isValid: true }; // Optional field
    }

    const trimmed = url.trim();

    // Check basic URL protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      return {
        isValid: false,
        message: 'តំណភ្ជាប់ត្រូវតែចាប់ផ្ដើមដោយ https:// ឬ http:// (ឧទាហរណ៍៖ https://maps.app.goo.gl/...)'
      };
    }

    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.toLowerCase();

      const isGoogleMaps =
        host === 'maps.google.com' ||
        host === 'maps.app.goo.gl' ||
        host === 'goo.gl' ||
        host.includes('google.com') && (parsed.pathname.startsWith('/maps') || parsed.pathname.includes('/place/')) ||
        host.endsWith('.google.com');

      if (!isGoogleMaps) {
        return {
          isValid: false,
          message: 'តំណភ្ជាប់ត្រូវតែជា Google Maps ត្រឹមត្រូវ (ឧទាហរណ៍៖ https://maps.app.goo.gl/... ឬ https://www.google.com/maps/...)'
        };
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        message: 'តំណភ្ជាប់ URL មិនត្រឹមត្រូវតាមទម្រង់ស្តង់ដារ'
      };
    }
  };

  const validateFacebookUrl = (url: string): { isValid: boolean; message?: string } => {
    if (!url || url.trim() === '') {
      return { isValid: true }; // Optional field
    }

    const trimmed = url.trim();

    // Check basic URL protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      return {
        isValid: false,
        message: 'តំណភ្ជាប់ត្រូវតែចាប់ផ្ដើមដោយ https:// ឬ http:// (ឧទាហរណ៍៖ https://facebook.com/...)'
      };
    }

    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.toLowerCase();

      const isFacebook =
        host === 'facebook.com' ||
        host === 'www.facebook.com' ||
        host === 'web.facebook.com' ||
        host === 'm.facebook.com' ||
        host === 'fb.com' ||
        host === 'fb.me' ||
        host.endsWith('.facebook.com');

      if (!isFacebook) {
        return {
          isValid: false,
          message: 'តំណភ្ជាប់ត្រូវតែជាទំព័រ Facebook ត្រឹមត្រូវ (ឧទាហរណ៍៖ https://facebook.com/your-page ឬ https://web.facebook.com/...)'
        };
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        message: 'តំណភ្ជាប់ URL មិនត្រឹមត្រូវតាមទម្រង់ស្តង់ដារ'
      };
    }
  };

  const validateEmail = (email: string): { isValid: boolean; message?: string } => {
    if (!email || email.trim() === '') {
      return { isValid: true }; // Optional field
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.trim())) {
      return {
        isValid: false,
        message: 'ទម្រង់អ៊ីម៉ែលមិនត្រឹមត្រូវ (ឧទាហរណ៍៖ phnompom.primary@moeys.gov.kh)'
      };
    }
    return { isValid: true };
  };

  const validateKhmerName = (name: string): { isValid: boolean; message?: string } => {
    if (!name || name.trim() === '') {
      return { isValid: false, message: 'សូមបញ្ចូលឈ្មោះសាលារៀនជាភាសាខ្មែរ (មិនអាចទុកទទេបានទេ)' };
    }
    if (name.trim().length < 3) {
      return { isValid: false, message: 'ឈ្មោះសាលាត្រូវមានយ៉ាងតិច ៣ តួអក្សរ' };
    }
    return { isValid: true };
  };

  // Perform full validation check
  const runValidation = (dataToValidate: SchoolProfile): FormErrors => {
    const newErrors: FormErrors = {};

    const khmerNameRes = validateKhmerName(dataToValidate.nameKhmer);
    if (!khmerNameRes.isValid) newErrors.nameKhmer = khmerNameRes.message;

    const phoneRes = validatePhoneNumber(dataToValidate.principalPhone || '');
    if (!phoneRes.isValid) newErrors.principalPhone = phoneRes.message;

    const emailRes = validateEmail(dataToValidate.email || '');
    if (!emailRes.isValid) newErrors.email = emailRes.message;

    const mapRes = validateGoogleMapsUrl(dataToValidate.mapUrl || '');
    if (!mapRes.isValid) newErrors.mapUrl = mapRes.message;

    const fbRes = validateFacebookUrl(dataToValidate.facebookPage || '');
    if (!fbRes.isValid) newErrors.facebookPage = fbRes.message;

    if (!dataToValidate.academicYear || dataToValidate.academicYear.trim() === '') {
      newErrors.academicYear = 'សូមបញ្ជាក់ឆ្នាំសិក្សា (ឧទាហរណ៍៖ ២០២៤ - ២០២៥)';
    }

    return newErrors;
  };

  // Live validate single field on change/blur
  const handleFieldChange = (field: keyof SchoolProfile, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Run selective validation
    const currentErrors = runValidation(updated);
    setErrors(currentErrors);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const currentErrors = runValidation(formData);
    setErrors(currentErrors);
  };

  // Auto-fix URL helpers
  const handleAutoFixUrl = (field: 'mapUrl' | 'facebookPage') => {
    let val = formData[field] || '';
    val = val.trim();
    if (val && !/^https?:\/\//i.test(val)) {
      val = `https://${val}`;
      handleFieldChange(field, val);
      showToast('បានបន្ថែម https:// ដោយស្វ័យប្រវត្តិ', 'info');
    }
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthorized) {
      showToast('មុខងារកំណត់ព័ត៌មានសាលារៀនគឺស្ថិតនៅក្នុងប្រូហ្វាល់នាយកសាលាតែម្នាក់គត់!', 'error');
      onClose();
      return;
    }

    // Mark all as touched
    setTouched({
      nameKhmer: true,
      nameLatin: true,
      schoolCode: true,
      principalPhone: true,
      email: true,
      mapUrl: true,
      facebookPage: true,
      academicYear: true
    });

    const validationErrors = runValidation(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const errorCount = Object.keys(validationErrors).length;
      showToast(`មានទិន្នន័យមិនត្រឹមត្រូវចំនួន ${errorCount} កន្លែង! សូមពិនិត្យមើលសារក្រហមខាងក្រោម។`, 'error');

      // Auto-switch to tab containing error
      if (validationErrors.nameKhmer || validationErrors.academicYear) {
        setActiveTab('general');
      } else if (validationErrors.principalPhone || validationErrors.email) {
        setActiveTab('contact');
      } else if (validationErrors.mapUrl || validationErrors.facebookPage) {
        setActiveTab('links');
      }
      return;
    }

    // Success: save
    onSave(formData);
    onClose();
    showToast('បានរក្សាទុក និងផ្ទៀងផ្ទាត់ព័ត៌មានសាលារៀនដោយជោគជ័យ!', 'success');
  };

  const handleTriggerDatabaseSnapshot = () => {
    setIsExportingSnapshot(true);
    try {
      const nowIso = new Date().toISOString();
      const snapshotData = {
        exportedAt: nowIso,
        system: 'ប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សាភ្នំពុំ (MoEYS Primary School Management System)',
        schoolProfile: {
          ...formData,
          lastDatabaseBackup: nowIso
        },
        statistics: {
          totalStudents: students.length,
          totalScores: scores.length,
          totalAttendanceRecords: attendanceRecords.length,
          totalHealthCheckRecords: dailyHealthChecks.length,
          totalTeachers: teachers.length,
          totalBadgeAssignments: studentBadgeAssignments.length,
          totalActivityLogs: activityLogs.length,
          totalTransfers: transfers.length
        },
        data: {
          students,
          scores,
          attendanceRecords,
          dailyHealthChecks,
          teachers,
          studentBadgeAssignments,
          activityLogs,
          transfers
        }
      };

      const jsonStr = JSON.stringify(snapshotData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `phnom_pom_school_full_snapshot_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const updatedProfile = {
        ...formData,
        lastDatabaseBackup: nowIso
      };
      setFormData(updatedProfile);
      onSave(updatedProfile);
      showToast('បានទាញយក និងរក្សាទុកទិន្នន័យបម្រុងទុក (Full Database Snapshot) ដោយជោគជ័យ!', 'success');
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការទាញយកទិន្នន័យបម្រុងទុក', 'error');
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  if (!isOpen) return null;
  if (!isAuthorized) return null;

  return (
    <div
      id="school-profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-battambang"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Building2 className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-moul">កែប្រែ និងផ្ទៀងផ្ទាត់ព័ត៌មានសាលា</h3>
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold">
                  Validation Active
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                ប្រព័ន្ធត្រួតពិនិត្យភាពត្រឹមត្រូវនៃលេខទូរស័ព្ទ អ៊ីម៉ែល Google Maps និង Facebook URL
              </p>
            </div>
          </div>
          <button
            id="close-school-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="បិទ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex gap-1 overflow-x-auto shrink-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2 rounded-t-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ព័ត៌មានទូទៅ</span>
            {errors.nameKhmer && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`px-3.5 py-2 rounded-t-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'location'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>ទីតាំងរដ្ឋបាល</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-t-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-indigo-600" />
            <span>គណៈគ្រប់គ្រង & ទំនាក់ទំនង</span>
            {(errors.principalPhone || errors.email) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`px-3.5 py-2 rounded-t-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'links'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>ផែនទី & Facebook</span>
            {(errors.mapUrl || errors.facebookPage) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-t-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>ស្តង់ដារពិន្ទុ & Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-t-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-blue-900 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            <span>សុវត្ថិភាព & បម្រុងទុក</span>
          </button>
        </div>

        {/* Global Error Alert Banner */}
        {hasErrors && (touched.nameKhmer || touched.principalPhone || touched.mapUrl || touched.facebookPage) && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs text-rose-800 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold">
                មានកំហុសទម្រង់ទិន្នន័យមួយចំនួន៖ សូមពិនិត្យផ្ទៀងផ្ទាត់ឡើងវិញមុនរក្សាទុក។
              </span>
            </div>
            <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded-full font-bold text-[10px]">
              {Object.keys(errors).length} កំហុស
            </span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form id="school-profile-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in">
              {/* School Name Khmer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-800 font-bold">
                    ឈ្មោះសាលារៀនជាភាសាខ្មែរ <span className="text-rose-500">*</span>
                  </label>
                  {!errors.nameKhmer && formData.nameKhmer && (
                    <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ត្រឹមត្រូវ
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={formData.nameKhmer}
                  onChange={(e) => handleFieldChange('nameKhmer', e.target.value)}
                  onBlur={() => handleBlur('nameKhmer')}
                  placeholder="ឧ. សាលាបឋមសិក្សាភ្នំពុំ"
                  className={`w-full px-3.5 py-2.5 rounded-xl font-moul text-sm transition-all focus:outline-none ${
                    errors.nameKhmer && touched.nameKhmer
                      ? 'bg-rose-50 border-2 border-rose-400 focus:ring-2 focus:ring-rose-400 text-rose-900'
                      : 'bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {errors.nameKhmer && touched.nameKhmer ? (
                  <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.nameKhmer}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    ឈ្មោះផ្លូវការសម្រាប់បង្ហាញលើបឋមកថា ឯកសាររដ្ឋបាល និងតារាងពិន្ទុ
                  </p>
                )}
              </div>

              {/* School Name Latin */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  ឈ្មោះសាលាជាអក្សរឡាតាំង (Latin Name)
                </label>
                <input
                  type="text"
                  value={formData.nameLatin || ''}
                  onChange={(e) => handleFieldChange('nameLatin', e.target.value)}
                  placeholder="e.g. Phnom Pom Primary School"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-times text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* School ID / Code */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    កូដសាលា (School ID Code)
                  </label>
                  <input
                    type="text"
                    value={formData.schoolCode || ''}
                    onChange={(e) => handleFieldChange('schoolCode', e.target.value)}
                    placeholder="ឧ. 020401015"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-times focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">កូដអត្តសញ្ញាណ ៩ ខ្ទង់របស់ក្រសួង</p>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    ឆ្នាំសិក្សា (Academic Year) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                    placeholder="២០២៤ - ២០២៥"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Established Year */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    ឆ្នាំបង្កើតសាលា (Established Year)
                  </label>
                  <input
                    type="text"
                    value={formData.establishedYear || ''}
                    onChange={(e) => handleFieldChange('establishedYear', e.target.value)}
                    placeholder="ឧ. ២០០៥"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Cluster */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    កម្រងសាលា (School Cluster)
                  </label>
                  <input
                    type="text"
                    value={formData.cluster || ''}
                    onChange={(e) => handleFieldChange('cluster', e.target.value)}
                    placeholder="កម្រងសាលាបឋមសិក្សាភ្នំព្រឹក"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEOGRAPHIC LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-slate-700 text-xs flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>កំណត់ដែនដីរដ្ឋបាលភូមិសាស្ត្រសម្រាប់ការស្រង់ទិន្នន័យ ជំរឿន និងរបាយការណ៍ MoEYS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">ខេត្ត / រាជធានី (Province)</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleFieldChange('province', e.target.value)}
                    placeholder="ខេត្តបាត់ដំបង"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">ក្រុង / ស្រុក / ខណ្ឌ (District)</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleFieldChange('district', e.target.value)}
                    placeholder="ស្រុកភ្នំព្រឹក"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">ឃុំ / សង្កាត់ (Commune)</label>
                  <input
                    type="text"
                    value={formData.commune}
                    onChange={(e) => handleFieldChange('commune', e.target.value)}
                    placeholder="ឃុំបារាំងធ្លាក់"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">ភូមិ (Village)</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => handleFieldChange('village', e.target.value)}
                    placeholder="ភូមិអូរគល់សំយ៉ុង"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & LEADERSHIP */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Principal Name */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">ឈ្មោះនាយកសាលា (Principal Name)</label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => handleFieldChange('principalName', e.target.value)}
                    placeholder="លោក លីម សន"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Principal Phone with Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-800 font-bold">
                      លេខទូរស័ព្ទនាយក (Phone Number)
                    </label>
                    {formData.principalPhone && !errors.principalPhone && (
                      <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> លេខទូរស័ព្ទត្រឹមត្រូវ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.principalPhone}
                      onChange={(e) => handleFieldChange('principalPhone', e.target.value)}
                      onBlur={() => handleBlur('principalPhone')}
                      placeholder="087 99 19 77 ឬ 012 345 678"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl font-times text-sm transition-all focus:outline-none ${
                        errors.principalPhone && touched.principalPhone
                          ? 'bg-rose-50 border-2 border-rose-400 focus:ring-2 focus:ring-rose-400 text-rose-900'
                          : 'bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500'
                      }`}
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.principalPhone && touched.principalPhone ? (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.principalPhone}
                    </p>
                  ) : (
                    <p className="mt-1 text-[10px] text-slate-500">
                      ទទួលស្គាល់ទម្រង់ក្នុងស្រុក (០៨៧ ៩៩ ១៩ ៧៧) ឬអន្តរជាតិ (+855 87 991 977)
                    </p>
                  )}
                </div>

                {/* Deputy Principal Name */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    ឈ្មោះនាយករងសាលា (Deputy Principal)
                  </label>
                  <input
                    type="text"
                    value={formData.deputyPrincipalName || ''}
                    onChange={(e) => handleFieldChange('deputyPrincipalName', e.target.value)}
                    placeholder="លោក ឈិន សុផល"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* School Email with Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-800 font-bold">អ៊ីម៉ែលផ្លូវការ (School Email)</label>
                    {formData.email && !errors.email && (
                      <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> អ៊ីម៉ែលត្រឹមត្រូវ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="phnompom.primary@moeys.gov.kh"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl font-times text-xs transition-all focus:outline-none ${
                        errors.email && touched.email
                          ? 'bg-rose-50 border-2 border-rose-400 focus:ring-2 focus:ring-rose-400 text-rose-900'
                          : 'bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE MAPS & FACEBOOK VALIDATION */}
          {activeTab === 'links' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 text-slate-700 text-xs">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  ការផ្ទៀងផ្ទាត់តំណភ្ជាប់ទីតាំង & បណ្ដាញសង្គម
                </p>
                <p className="text-[11px] text-indigo-900">
                  សូមបញ្ចូលតំណភ្ជាប់ URL ផ្លូវការ។ អ្នកអាចចុចប៊ូតុង <strong>"សាកល្បងបើកមើល"</strong> ដើម្បីធានាថាតំណភ្ជាប់ដំណើរការត្រឹមត្រូវមុននឹងរក្សាទុក។
                </p>
              </div>

              {/* Google Maps URL Field */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>តំណភ្ជាប់ Google Maps Location</span>
                  </label>
                  {formData.mapUrl && !errors.mapUrl && (
                    <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> តំណភ្ជាប់ត្រឹមត្រូវ
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.mapUrl || ''}
                    onChange={(e) => handleFieldChange('mapUrl', e.target.value)}
                    onBlur={() => handleBlur('mapUrl')}
                    placeholder="https://maps.app.goo.gl/ackTYSYsd7t54vGP6"
                    className={`flex-1 px-3 py-2 rounded-xl font-times text-xs transition-all focus:outline-none ${
                      errors.mapUrl && touched.mapUrl
                        ? 'bg-rose-50 border-2 border-rose-400 focus:ring-2 focus:ring-rose-400 text-rose-900'
                        : 'bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  {formData.mapUrl && !errors.mapUrl && (
                    <a
                      href={formData.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold flex items-center gap-1 transition-colors shrink-0"
                      title="សាកល្បងបើក Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>សាកល្បងបើក</span>
                    </a>
                  )}
                </div>

                {errors.mapUrl && touched.mapUrl ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.mapUrl}
                    </p>
                    {formData.mapUrl && !/^https?:\/\//i.test(formData.mapUrl) && (
                      <button
                        type="button"
                        onClick={() => handleAutoFixUrl('mapUrl')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer"
                      >
                        👉 ចុចទីនេះដើម្បីបន្ថែម https:// ដោយស្វ័យប្រវត្តិ
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    គំរូ៖ https://maps.app.goo.gl/... ឬ https://www.google.com/maps/place/...
                  </p>
                )}
              </div>

              {/* Facebook Page URL Field */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span>តំណភ្ជាប់ទំព័រ Facebook Page</span>
                  </label>
                  {formData.facebookPage && !errors.facebookPage && (
                    <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> តំណភ្ជាប់ត្រឹមត្រូវ
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.facebookPage || ''}
                    onChange={(e) => handleFieldChange('facebookPage', e.target.value)}
                    onBlur={() => handleBlur('facebookPage')}
                    placeholder="https://web.facebook.com/PhnomPom-Primary-School"
                    className={`flex-1 px-3 py-2 rounded-xl font-times text-xs transition-all focus:outline-none ${
                      errors.facebookPage && touched.facebookPage
                        ? 'bg-rose-50 border-2 border-rose-400 focus:ring-2 focus:ring-rose-400 text-rose-900'
                        : 'bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  {formData.facebookPage && !errors.facebookPage && (
                    <a
                      href={formData.facebookPage}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold flex items-center gap-1 transition-colors shrink-0"
                      title="សាកល្បងបើក Facebook"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>សាកល្បងបើក</span>
                    </a>
                  )}
                </div>

                {errors.facebookPage && touched.facebookPage ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.facebookPage}
                    </p>
                    {formData.facebookPage && !/^https?:\/\//i.test(formData.facebookPage) && (
                      <button
                        type="button"
                        onClick={() => handleAutoFixUrl('facebookPage')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer"
                      >
                        👉 ចុចទីនេះដើម្បីបន្ថែម https:// ដោយស្វ័យប្រវត្តិ
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    គំរូ៖ https://web.facebook.com/... ឬ https://facebook.com/your-school-page
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GRADING SCALE, THEME & LOGO */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Dark Mode / Theme Settings Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-slate-900 dark:text-white font-bold text-xs">
                      ទម្រង់ផ្ទៃកម្មវិធី (Theme & Display Mode)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      កំណត់រចនាប័ទ្មពណ៌ទូទៅរបស់ប្រព័ន្ធ និងរក្សាទុកក្នុងកុំព្យូទ័រ/ឧបករណ៍របស់អ្នក (Local Storage)
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isDarkMode
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    <span>{isDarkMode ? 'ទម្រង់ងងឹត (Dark)' : 'ទម្រង់ពន្លឺ (Light)'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    id="theme-toggle-light"
                    onClick={() => {
                      if (isDarkMode) toggleDarkMode();
                      showToast('បានប្តូរទៅប្រើទម្រង់ពន្លឺធម្មតា (Light Mode)', 'info');
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      !isDarkMode
                        ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20 text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">ទម្រង់ពន្លឺធម្មតា (Light Mode)</p>
                      <p className="text-[11px] text-slate-500">ផ្ទៃពណ៌ស ភ្លឺច្បាស់ ងាយស្រួលមើលពេលថ្ងៃ</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="theme-toggle-dark"
                    onClick={() => {
                      if (!isDarkMode) toggleDarkMode();
                      showToast('បានប្តូរទៅប្រើទម្រង់ងងឹត (Dark Mode)', 'info');
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isDarkMode
                        ? 'bg-slate-900 border-blue-500 shadow-sm ring-2 ring-blue-500/20 text-white'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 shadow-xs border border-indigo-800">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">ទម្រង់ងងឹត (Dark Mode)</p>
                      <p className="text-[11px] text-slate-500">ផ្ទៃងងឹតកាត់បន្ថយចំណាំងពន្លឺ ថែរក្សាភ្នែក</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Grading Scale */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-slate-800 font-bold mb-1.5">
                  ទម្រង់ស្តង់ដារចំណាត់ថ្នាក់ពិន្ទុ (Grading Scale System)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.gradingScaleType === 'khmer_term' || !formData.gradingScaleType
                        ? 'bg-blue-50 border-blue-400 text-blue-950 ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gradingScaleType"
                      checked={formData.gradingScaleType === 'khmer_term' || !formData.gradingScaleType}
                      onChange={() => handleFieldChange('gradingScaleType', 'khmer_term')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-xs">ភាសាខ្មែរ (ស្តង់ដារជាតិ)</p>
                      <p className="text-[11px] text-slate-500">ល្អណាស់, ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.gradingScaleType === 'letter'
                        ? 'bg-blue-50 border-blue-400 text-blue-950 ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gradingScaleType"
                      checked={formData.gradingScaleType === 'letter'}
                      onChange={() => handleFieldChange('gradingScaleType', 'letter')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-xs">អក្សរឡាតាំង (Letter Grade)</p>
                      <p className="text-[11px] text-slate-500">A, B, C, D, E, F</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  តំណភ្ជាប់រូបភាព Logo សាលារៀន (School Logo Image URL)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-times text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  បង្ហាញលើប័ណ្ណសរសើរ កាតសិស្ស និងក្បាលលិខិតផ្លូវការ
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY, BACKUP & SESSION PERSISTENCE */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Full Database Snapshot Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-800 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-indigo-300 flex-shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm font-moul text-indigo-100">
                        ទាញយកទិន្នន័យបម្រុងទុកពេញលេញ (Full Database Snapshot)
                      </h4>
                      <p className="text-[11px] text-indigo-200/80 mt-0.5">
                        នាំចេញទិន្នន័យសាលាទាំងស្រុងជាឯកសារ JSON រួមមានសិស្ស ពិន្ទុ វត្តមាន ពិនិត្យសុខភាព គ្រូបង្រៀន និងកំណត់ត្រាផ្សេងៗ
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="trigger-db-backup-btn"
                    onClick={handleTriggerDatabaseSnapshot}
                    disabled={isExportingSnapshot}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingSnapshot ? 'កំពុងដំណើរការ...' : 'ទាញយក Backup ឥឡូវនេះ'}</span>
                  </button>
                </div>

                {/* Database Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-indigo-200 text-[10px] block">ទិន្នន័យសិស្ស</span>
                    <strong className="text-sm font-bold font-times text-white">{students.length} នាក់</strong>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-indigo-200 text-[10px] block">កំណត់ត្រាពិន្ទុ</span>
                    <strong className="text-sm font-bold font-times text-white">{scores.length} កំណត់ត្រា</strong>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-indigo-200 text-[10px] block">កំណត់ត្រាវត្តមាន</span>
                    <strong className="text-sm font-bold font-times text-white">{attendanceRecords.length} ថ្ងៃ</strong>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-indigo-200 text-[10px] block">ពិនិត្យសុខភាពប្រចាំថ្ងៃ</span>
                    <strong className="text-sm font-bold font-times text-white">{dailyHealthChecks.length} កំណត់ត្រា</strong>
                  </div>
                </div>

                {/* Last Backup Info */}
                <div className="flex items-center gap-2 text-[11px] text-indigo-300 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    កាលបរិច្ឆេទចម្លងទិន្នន័យចុងក្រោយ៖{' '}
                    <strong className="text-white font-times">
                      {formData.lastDatabaseBackup
                        ? new Date(formData.lastDatabaseBackup).toLocaleString('km-KH')
                        : 'មិនទាន់ធ្លាប់បានបម្រុងទុកដោយដៃ'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Session Persistence & Remember Me Settings Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      សុពលភាពចងចាំគណនីចូលប្រព័ន្ធ (Session "Remember Me" Persistence)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      កំណត់រយៈពេលរក្សាវត្តមានចូលប្រើប្រាស់ប្រព័ន្ធដោយស្វ័យប្រវត្តិកុំឱ្យទាមទារ Password ញឹកញាប់
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {[
                    { days: 1, label: '១ ថ្ងៃ (1 Day)', desc: 'ទាមទារចូលរាល់ថ្ងៃ សុវត្ថិភាពខ្ពស់' },
                    { days: 7, label: '៧ ថ្ងៃ (1 Week)', desc: 'រក្សាទុក ១ សប្តាហ៍' },
                    { days: 14, label: '១៤ ថ្ងៃ (2 Weeks)', desc: 'រក្សាទុក ២ សប្តាហ៍' },
                    { days: 30, label: '៣០ ថ្ងៃ (1 Month)', desc: 'ជម្រើសណែនាំទូទៅ (Default)' },
                    { days: 365, label: '១ ឆ្នាំ (Permanent)', desc: 'រក្សាទុកយូរអង្វែងលើកុំព្យូទ័រផ្ទាល់ខ្លួន' }
                  ].map(item => {
                    const isSelected = (formData.sessionRememberDays || 30) === item.days;
                    return (
                      <label
                        key={item.days}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-950 ring-1 ring-blue-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="sessionRememberDays"
                          checked={isSelected}
                          onChange={() => handleFieldChange('sessionRememberDays', item.days)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-bold text-xs">{item.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Persistence Strategy Note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">ស្តង់ដារសុវត្ថិភាពទិន្នន័យ (MoEYS Dual-Storage Persistence)</p>
                  <p className="text-amber-800 mt-0.5">
                    ប្រព័ន្ធដំណើរការស្របគ្នាលើ Local Storage (កុំព្យូទ័រអ្នក) និងពពកទិន្នន័យ Google Cloud Firestore ដោយស្វ័យប្រវត្តិ។ ការទាញយក Snapshot ដោយដៃជួយការពារទិន្នន័យបន្ថែមនៅពេលប្តូរឧបករណ៍ ឬដំឡើង Windows ថ្មី។
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="font-bold text-[11px] text-slate-600 mb-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              ទិដ្ឋភាពសង្ខេបបឋមកថាសាលា (Live Header Preview)
            </p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-moul text-blue-900 text-sm">{formData.nameKhmer || 'ឈ្មោះសាលារៀន'}</p>
                <p className="font-times text-slate-500 text-[11px]">{formData.nameLatin || 'School Latin Name'}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {formData.village && `${formData.village}, `}
                  {formData.commune && `${formData.commune}, `}
                  {formData.district && `${formData.district}, `}
                  {formData.province}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-600 space-y-0.5 border-t sm:border-t-0 pt-1 sm:pt-0">
                <p>
                  <span className="font-bold">នាយក៖</span> {formData.principalName || '...'}
                </p>
                <p className="font-times font-bold text-slate-800">
                  {formData.principalPhone || '...'}
                </p>
                <div className="flex items-center justify-end gap-2 text-[10px] text-blue-600">
                  {formData.mapUrl && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5 text-red-500" /> Maps</span>}
                  {formData.facebookPage && <span className="flex items-center gap-0.5"><Facebook className="w-2.5 h-2.5" /> Facebook</span>}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setFormData(initialProfile);
              setErrors({});
              setTouched({});
              showToast('បានកំណត់ទិន្នន័យដើមឡើងវិញ', 'info');
            }}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>កំណត់ទិន្នន័យដើម</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              id="cancel-school-profile-btn"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors text-xs cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="button"
              id="save-school-profile-btn"
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95 text-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>រក្សាទុកព័ត៌មាន</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
