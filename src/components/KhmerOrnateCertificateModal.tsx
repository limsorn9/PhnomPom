import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Teacher, Student } from '../types';
import {
  Printer,
  Download,
  X,
  Sparkles,
  Award,
  Check,
  RefreshCw,
  QrCode,
  User,
  GraduationCap,
  Sliders,
  Eye,
  FileCheck,
  ShieldCheck,
  Share2,
  Calendar,
  Building2
} from 'lucide-react';
import { printElement, downloadElementAsPdf } from '../utils/printUtils';
import { getKhmerLunarDate, getKhmerSolarDate, toKhmerNumber } from './AngkorMotif';

interface KhmerOrnateCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipientName?: string;
  initialRecipientType?: 'teacher' | 'student' | 'custom';
  initialCourseTitle?: string;
}

export type CertificateTemplatePreset = 'plp_math' | 'primary_completion' | 'teacher_excellence' | 'student_honor' | 'custom_training';

export const KhmerOrnateCertificateModal: React.FC<KhmerOrnateCertificateModalProps> = ({
  isOpen,
  onClose,
  initialRecipientName,
  initialRecipientType = 'teacher',
  initialCourseTitle
}) => {
  const { schoolProfile, teachers, students, showToast } = useSchool();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Certificate Presets
  const [selectedPreset, setSelectedPreset] = useState<CertificateTemplatePreset>('plp_math');
  
  // Recipient selection
  const [recipientType, setRecipientType] = useState<'teacher' | 'student' | 'custom'>(initialRecipientType);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  
  // Certificate Fields (User explicitly requested Organization: សាលាបឋមសិក្សា ភ្នំពុំ, Signatory Title: នាយកសាលា)
  const [certificateData, setCertificateData] = useState({
    organizationName: 'សាលាបឋមសិក្សា ភ្នំពុំ',
    ministryName: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    issuerTitle: 'នាយកសាលាបឋមសិក្សា ភ្នំពុំ', // As requested by user: ឋានៈវិញត្រឹម នាយកសាលា
    statementIntro: 'សូមបញ្ជាក់ថា ៖',
    recipientName: initialRecipientName || 'លីម សន',
    recipientSubtext: '',
    activityType: 'បានចូលរួម និងបំពេញគ្រប់លក្ខខណ្ឌក្នុងវគ្គបណ្តុះបណ្តាលអនឡាញតាមថ្នាលអភិវឌ្ឍវិជ្ជាជីវៈបន្ត PLP អំពី',
    courseTitle: initialCourseTitle || 'ការណែនាំប្រើប្រាស់កញ្ចប់សម្ភារៈគណិតវិទ្យាថ្នាក់ទី២',
    closingStatement: 'វិញ្ញាបនបត្រនេះប្រគល់ជូនសាមីជនប្រើប្រាស់តាមការដែលអាចប្រើបាន។',
    lunarDate: 'ថ្ងៃសុក្រ ១០កើត ខែទុតិយាសាឍ ឆ្នាំមមែ អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០',
    solarDate: 'រាជធានីភ្នំពេញ ថ្ងៃទី២៤ ខែកក្កដា ឆ្នាំ២០២៦',
    signatoryRole: 'នាយកសាលា',
    signatoryName: schoolProfile.principalName ? schoolProfile.principalName.replace(/^លោក\s*|^លោកស្រី\s*/, '') : 'លីម សន',
    verificationPlatform: 'ថ្នាលអភិវឌ្ឍវិជ្ជាជីវៈបន្ត PLP',
    certificateId: 'TMS-PLP-2026-701744',
    showStamp: true,
    showSignature: true,
    showQrCode: true,
    goldBorderHue: 'gold' as 'gold' | 'royal_gold' | 'crimson_gold'
  });

  // Handle Preset Switching
  const applyPreset = (preset: CertificateTemplatePreset) => {
    setSelectedPreset(preset);
    if (preset === 'plp_math') {
      setCertificateData(prev => ({
        ...prev,
        organizationName: 'សាលាបឋមសិក្សា ភ្នំពុំ',
        issuerTitle: 'នាយកសាលាបឋមសិក្សា ភ្នំពុំ',
        statementIntro: 'សូមបញ្ជាក់ថា ៖',
        recipientName: 'លីម សន',
        activityType: 'បានចូលរួម និងបំពេញគ្រប់លក្ខខណ្ឌក្នុងវគ្គបណ្តុះបណ្តាលអនឡាញតាមថ្នាលអភិវឌ្ឍវិជ្ជាជីវៈបន្ត PLP អំពី',
        courseTitle: 'ការណែនាំប្រើប្រាស់កញ្ចប់សម្ភារៈគណិតវិទ្យាថ្នាក់ទី២',
        closingStatement: 'វិញ្ញាបនបត្រនេះប្រគល់ជូនសាមីជនប្រើប្រាស់តាមការដែលអាចប្រើបាន។',
        lunarDate: 'ថ្ងៃសុក្រ ១០កើត ខែទុតិយាសាឍ ឆ្នាំមមែ អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០',
        solarDate: 'រាជធានីភ្នំពេញ ថ្ងៃទី២៤ ខែកក្កដា ឆ្នាំ២០២៦',
        signatoryRole: 'នាយកសាលា',
        signatoryName: 'ហុង វ៉ាន់ណារិន',
        verificationPlatform: 'ថ្នាលអភិវឌ្ឍវិជ្ជាជីវៈបន្ត PLP',
        certificateId: 'TMS-PLP-2026-701744'
      }));
    } else if (preset === 'primary_completion') {
      setCertificateData(prev => ({
        ...prev,
        organizationName: 'សាលាបឋមសិក្សា ភ្នំពុំ',
        issuerTitle: 'នាយកសាលាបឋមសិក្សា ភ្នំពុំ',
        statementIntro: 'សូមបញ្ជាក់ថា ៖',
        recipientName: students[0]?.nameKhmer || 'សុខ វិបុល',
        activityType: 'បានបញ្ចប់ការសិក្សាដោយជោគជ័យតាមកម្មវិធីសិក្សាកម្រិតបឋមសិក្សាថ្នាក់ទី៦ នៅ',
        courseTitle: 'សាលាបឋមសិក្សា ភ្នំពុំ ឆ្នាំសិក្សា ២០២៥-២០២៦',
        closingStatement: 'វិញ្ញាបនបត្រនេះប្រគល់ជូនសាមីខ្លួនដើម្បីជាភស្តុតាងក្នុងការបន្តការសិក្សាថ្នាក់អនុវិទ្យាល័យ។',
        lunarDate: getKhmerLunarDate(),
        solarDate: getKhmerSolarDate(new Date(), 'ខេត្តបាត់ដំបង'),
        signatoryRole: 'នាយកសាលា',
        signatoryName: schoolProfile.principalName?.replace(/^លោក\s*|^លោកស្រី\s*/, '') || 'លីម សន',
        verificationPlatform: 'សាលាបឋមសិក្សា ភ្នំពុំ - MoEYS',
        certificateId: `CERT-PRI-2026-${Math.floor(100000 + Math.random() * 900000)}`
      }));
    } else if (preset === 'student_honor') {
      setCertificateData(prev => ({
        ...prev,
        organizationName: 'សាលាបឋមសិក្សា ភ្នំពុំ',
        issuerTitle: 'នាយកសាលាបឋមសិក្សា ភ្នំពុំ',
        statementIntro: 'សូមសម្តែងនូវការកោតសរសើរ និងបញ្ជាក់ថា ៖',
        recipientName: students[0]?.nameKhmer || 'ចាន់ រស្មី',
        activityType: 'ជាសិស្សឆ្នើមទទួលបានចំណាត់ថ្នាក់កិត្តិយសលេខ ១ ប្រចាំឆ្នាំសិក្សា និងមានវិន័យសីលធម៌គំរូល្អប្រសើរក្នុង',
        courseTitle: 'ការប្រឡងប្រជែងសមត្ថភាពភាសាខ្មែរ និងគណិតវិទ្យាប្រចាំសាលា',
        closingStatement: 'វិញ្ញាបនបត្រកិត្តិយសនេះប្រគល់ជូនដើម្បីជាការលើកទឹកចិត្ត និងជាគំរូល្អដល់សិស្សានុសិស្សដទៃទៀត។',
        lunarDate: getKhmerLunarDate(),
        solarDate: getKhmerSolarDate(new Date(), 'ខេត្តបាត់ដំបង'),
        signatoryRole: 'នាយកសាលា',
        signatoryName: schoolProfile.principalName?.replace(/^លោក\s*|^លោកស្រី\s*/, '') || 'លីម សន',
        verificationPlatform: 'កិត្តិយសសាលារៀនគំរូ ភ្នំពុំ',
        certificateId: `HONOR-2026-${Math.floor(100000 + Math.random() * 900000)}`
      }));
    } else if (preset === 'teacher_excellence') {
      setCertificateData(prev => ({
        ...prev,
        organizationName: 'សាលាបឋមសិក្សា ភ្នំពុំ',
        issuerTitle: 'នាយកសាលាបឋមសិក្សា ភ្នំពុំ',
        statementIntro: 'សូមបញ្ជាក់ និងកោតសរសើរថា ៖',
        recipientName: teachers[0]?.nameKhmer || 'លោក លីម សន',
        activityType: 'បានបំពេញភារកិច្ចបង្រៀនគំរូ ស្រាវជ្រាវផលិតឧបករណ៍ឧបទេស និងចូលរួមអភិវឌ្ឍវិជ្ជាជីវៈគរុកោសល្យក្នុង',
        courseTitle: 'វគ្គបណ្តុះបណ្តាលវិធីសាស្ត្របង្រៀនកុមារមេត្រី និងបច្ចេកវិទ្យាឌីជីថល',
        closingStatement: 'វិញ្ញាបនបត្រនេះប្រគល់ជូនដើម្បីជាការទទួលស្គាល់ស្នាដៃ និងការលះបង់ដើម្បីបុព្វហេតុអប់រំ។',
        lunarDate: getKhmerLunarDate(),
        solarDate: getKhmerSolarDate(new Date(), 'ខេត្តបាត់ដំបង'),
        signatoryRole: 'នាយកសាលា',
        signatoryName: schoolProfile.principalName?.replace(/^លោក\s*|^លោកស្រី\s*/, '') || 'លីម សន',
        verificationPlatform: 'ការអភិវឌ្ឍវិជ្ជាជីវៈគ្រូបង្រៀន (CPD)',
        certificateId: `CPD-PP-2026-${Math.floor(100000 + Math.random() * 900000)}`
      }));
    }
  };

  // Sync recipient change
  const handleRecipientTypeChange = (type: 'teacher' | 'student' | 'custom') => {
    setRecipientType(type);
    if (type === 'teacher') {
      const t = teachers.find(item => item.id === selectedTeacherId) || teachers[0];
      if (t) setCertificateData(prev => ({ ...prev, recipientName: t.nameKhmer }));
    } else if (type === 'student') {
      const s = students.find(item => item.id === selectedStudentId) || students[0];
      if (s) setCertificateData(prev => ({ ...prev, recipientName: s.nameKhmer }));
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    const t = teachers.find(item => item.id === teacherId);
    if (t) setCertificateData(prev => ({ ...prev, recipientName: t.nameKhmer }));
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const s = students.find(item => item.id === studentId);
    if (s) setCertificateData(prev => ({ ...prev, recipientName: s.nameKhmer }));
  };

  // Print & PDF
  const handlePrint = () => {
    if (certificateRef.current) {
      printElement(certificateRef.current, {
        landscape: true,
        pageTitle: `វិញ្ញាបនបត្រ_${certificateData.recipientName}_${certificateData.organizationName}`
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      const filename = `វិញ្ញាបនបត្រ_${certificateData.recipientName}_${certificateData.organizationName}.pdf`;
      await downloadElementAsPdf(certificateRef.current, filename, {
        landscape: true
      });
      showToast?.('ទាញយកវិញ្ញាបនបត្រជា PDF ជោគជ័យ!', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('មានបញ្ហាក្នុងការទាញយក PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-300/40 flex items-center justify-center text-amber-200 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-moul text-base text-amber-100">
                  គំរូវិញ្ញាបនបត្រផ្លូវការ (សាលាបឋមសិក្សា ភ្នំពុំ - នាយកសាលា)
                </h3>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  MoEYS Official
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-battambang">
                រចនាក្បាច់មាសខ្មែរប្រណិត ក្បាលលិខិតជាតិ ត្រាមូល និងហត្ថលេខានាយកសាលា ទំហំ A4 Landscape
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'កំពុងបង្កើត PDF...' : 'ទាញយកជា PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Customization Sidebar + High-Precision Printable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-100">
          
          {/* Left Settings Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Presets Selector */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                ជ្រើសរើសគំរូវិញ្ញាបនបត្រ (Presets)
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => applyPreset('plp_math')}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    selectedPreset === 'plp_math'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>១. វគ្គបណ្តុះបណ្តាល PLP គណិតវិទ្យា (ដូចគំរូរូបភាព)</span>
                  {selectedPreset === 'plp_math' && <Check className="w-4 h-4 text-amber-600" />}
                </button>

                <button
                  onClick={() => applyPreset('primary_completion')}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    selectedPreset === 'primary_completion'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>២. វិញ្ញាបនបត្របញ្ចប់ការសិក្សាបឋមសិក្សា (ថ្នាក់ទី៦)</span>
                  {selectedPreset === 'primary_completion' && <Check className="w-4 h-4 text-amber-600" />}
                </button>

                <button
                  onClick={() => applyPreset('teacher_excellence')}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    selectedPreset === 'teacher_excellence'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>៣. វិញ្ញាបនបត្រអភិវឌ្ឍវិជ្ជាជីវៈគ្រូបង្រៀន (CPD)</span>
                  {selectedPreset === 'teacher_excellence' && <Check className="w-4 h-4 text-amber-600" />}
                </button>

                <button
                  onClick={() => applyPreset('student_honor')}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    selectedPreset === 'student_honor'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>៤. វិញ្ញាបនបត្រកិត្តិយសសិស្សឆ្នើម & ពូកែ</span>
                  {selectedPreset === 'student_honor' && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              </div>
            </div>

            {/* Recipient & Role Customizer */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                ព័ត៌មានសាមីជនទទួលវិញ្ញាបនបត្រ
              </label>

              <div className="flex bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => handleRecipientTypeChange('teacher')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    recipientType === 'teacher' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  គ្រូបង្រៀន
                </button>
                <button
                  onClick={() => handleRecipientTypeChange('student')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    recipientType === 'student' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  សិស្សានុសិស្ស
                </button>
                <button
                  onClick={() => handleRecipientTypeChange('custom')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    recipientType === 'custom' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  វាយឈ្មោះផ្ទាល់
                </button>
              </div>

              {recipientType === 'teacher' && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">ជ្រើសរើសលោកគ្រូ-អ្នកគ្រូ</label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => handleTeacherSelect(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nameKhmer} ({t.position || 'គ្រូបង្រៀន'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientType === 'student' && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">ជ្រើសរើសសិស្ស</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => handleStudentSelect(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} (ថ្នាក់ទី {s.grade}{s.section})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">ឈ្មោះសាមីជន (បង្ហាញលើវិញ្ញាបនបត្រ)</label>
                <input
                  type="text"
                  value={certificateData.recipientName}
                  onChange={e => setCertificateData({ ...certificateData, recipientName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold font-moul text-blue-950"
                  placeholder="ឈ្មោះសាមីជន..."
                />
              </div>
            </div>

            {/* Content & Signatory Settings */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                ខ្លឹមសារ & ឋានៈអ្នកចេញ (Organ & Authority)
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">អង្គភាព (សាលារៀន)</label>
                  <input
                    type="text"
                    value={certificateData.organizationName}
                    onChange={e => setCertificateData({ ...certificateData, organizationName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">ឋានៈអ្នកចេញ (Issuer Title)</label>
                  <input
                    type="text"
                    value={certificateData.issuerTitle}
                    onChange={e => setCertificateData({ ...certificateData, issuerTitle: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">សកម្មភាព / កម្មវិធីបណ្តុះបណ្តាល</label>
                <textarea
                  rows={2}
                  value={certificateData.activityType}
                  onChange={e => setCertificateData({ ...certificateData, activityType: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">ចំណងជើងវគ្គ / មុខវិជ្ជា (អក្សរដិតធំ)</label>
                <input
                  type="text"
                  value={certificateData.courseTitle}
                  onChange={e => setCertificateData({ ...certificateData, courseTitle: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-blue-950 font-moul"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">តួនាទីអ្នកចុះហត្ថលេខា</label>
                  <input
                    type="text"
                    value={certificateData.signatoryRole}
                    onChange={e => setCertificateData({ ...certificateData, signatoryRole: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">ឈ្មោះអ្នកចុះហត្ថលេខា</label>
                  <input
                    type="text"
                    value={certificateData.signatoryName}
                    onChange={e => setCertificateData({ ...certificateData, signatoryName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold text-red-600 font-moul"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">កាលបរិច្ឆេទចន្ទគតិ</label>
                  <input
                    type="text"
                    value={certificateData.lunarDate}
                    onChange={e => setCertificateData({ ...certificateData, lunarDate: e.target.value })}
                    className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">កាលបរិច្ឆេទសុរិយគតិ</label>
                  <input
                    type="text"
                    value={certificateData.solarDate}
                    onChange={e => setCertificateData({ ...certificateData, solarDate: e.target.value })}
                    className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-1.5"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certificateData.showStamp}
                    onChange={e => setCertificateData({ ...certificateData, showStamp: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>ត្រាមូលក្រហម</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certificateData.showSignature}
                    onChange={e => setCertificateData({ ...certificateData, showSignature: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>ហត្ថលេខានាយក</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certificateData.showQrCode}
                    onChange={e => setCertificateData({ ...certificateData, showQrCode: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>QR Code ផ្ទៀងផ្ទាត់</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Live Printable Canvas Preview (8 Cols) */}
          <div className="lg:col-span-8 flex items-start justify-center overflow-x-auto pb-4">
            
            {/* The A4 Landscape Certificate Canvas */}
            <div
              ref={certificateRef}
              id="ornate-certificate-canvas"
              className="w-[297mm] min-w-[297mm] h-[210mm] min-h-[210mm] bg-white text-slate-900 p-7 relative shadow-2xl rounded-xs select-none print:shadow-none print:m-0 print:w-[297mm] print:h-[210mm] print:p-7 flex flex-col justify-between overflow-hidden"
              style={{
                fontFamily: "'Khmer OS Battambang', 'Battambang', sans-serif"
              }}
            >
              
              {/* ========================================================================= */}
              {/* 1. TRADITIONAL KHMER ORNATE GOLDEN BORDER (ស៊ុមរចនាក្បាច់មាស & ក្រហមប្រណិត) */}
              {/* ========================================================================= */}
              <div className="absolute inset-0 pointer-events-none p-3.5 z-0">
                <div className="w-full h-full border-[10px] border-double border-amber-600/90 rounded-sm relative p-2 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-600/5">
                  {/* Outer Gold Decorative Border Line */}
                  <div className="w-full h-full border-2 border-amber-500/80 p-2 relative">
                    {/* Inner Fine Gold Border Line */}
                    <div className="w-full h-full border border-amber-400/60 relative">
                      
                      {/* Four Intricate Corner Kbach Ornaments */}
                      {/* Top-Left */}
                      <div className="absolute -top-3.5 -left-3.5 w-16 h-16 text-amber-600 pointer-events-none">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full drop-shadow-xs">
                          <path d="M0 0 L45 0 C45 20 20 45 0 45 Z" fill="#d97706" />
                          <path d="M5 5 L35 5 C35 18 18 35 5 35 Z" fill="#f59e0b" />
                          <circle cx="12" cy="12" r="4" fill="#b45309" />
                          <path d="M0 0 L100 0 C90 15 75 25 60 25 C45 25 35 35 25 60 C25 75 15 90 0 100 Z" fill="#b45309" opacity="0.6" />
                        </svg>
                      </div>

                      {/* Top-Right */}
                      <div className="absolute -top-3.5 -right-3.5 w-16 h-16 text-amber-600 pointer-events-none rotate-90">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full drop-shadow-xs">
                          <path d="M0 0 L45 0 C45 20 20 45 0 45 Z" fill="#d97706" />
                          <path d="M5 5 L35 5 C35 18 18 35 5 35 Z" fill="#f59e0b" />
                          <circle cx="12" cy="12" r="4" fill="#b45309" />
                          <path d="M0 0 L100 0 C90 15 75 25 60 25 C45 25 35 35 25 60 C25 75 15 90 0 100 Z" fill="#b45309" opacity="0.6" />
                        </svg>
                      </div>

                      {/* Bottom-Left */}
                      <div className="absolute -bottom-3.5 -left-3.5 w-16 h-16 text-amber-600 pointer-events-none -rotate-90">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full drop-shadow-xs">
                          <path d="M0 0 L45 0 C45 20 20 45 0 45 Z" fill="#d97706" />
                          <path d="M5 5 L35 5 C35 18 18 35 5 35 Z" fill="#f59e0b" />
                          <circle cx="12" cy="12" r="4" fill="#b45309" />
                          <path d="M0 0 L100 0 C90 15 75 25 60 25 C45 25 35 35 25 60 C25 75 15 90 0 100 Z" fill="#b45309" opacity="0.6" />
                        </svg>
                      </div>

                      {/* Bottom-Right */}
                      <div className="absolute -bottom-3.5 -right-3.5 w-16 h-16 text-amber-600 pointer-events-none rotate-180">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full drop-shadow-xs">
                          <path d="M0 0 L45 0 C45 20 20 45 0 45 Z" fill="#d97706" />
                          <path d="M5 5 L35 5 C35 18 18 35 5 35 Z" fill="#f59e0b" />
                          <circle cx="12" cy="12" r="4" fill="#b45309" />
                          <path d="M0 0 L100 0 C90 15 75 25 60 25 C45 25 35 35 25 60 C25 75 15 90 0 100 Z" fill="#b45309" opacity="0.6" />
                        </svg>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Central Background Watermark Silhouette */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.045] z-0">
                <svg viewBox="0 0 400 200" fill="currentColor" className="w-[70%] text-blue-950">
                  <path d="M200 15 L208 45 L204 47 L212 80 L207 82 L216 125 L184 125 L193 82 L188 80 L196 47 L192 45 Z" />
                  <circle cx="200" cy="12" r="3" />
                  <path d="M150 40 L156 65 L153 67 L160 95 L156 97 L163 125 L137 125 L144 97 L140 95 L147 67 L144 65 Z" />
                  <circle cx="150" cy="37" r="2.5" />
                  <path d="M250 40 L256 65 L253 67 L260 95 L256 97 L263 125 L237 125 L244 97 L240 95 L247 67 L244 65 Z" />
                  <circle cx="250" cy="37" r="2.5" />
                  <rect x="75" y="125" width="250" height="10" rx="1" />
                  <rect x="50" y="135" width="300" height="12" rx="1" />
                  <rect x="30" y="147" width="340" height="15" rx="1" />
                  <rect x="15" y="162" width="370" height="18" rx="2" />
                </svg>
              </div>

              {/* ========================================================================= */}
              {/* 2. HEADER: ROYAL EMBLEM + MOEYS LOGO + NATION MOTTO */}
              {/* ========================================================================= */}
              <div className="relative z-10 grid grid-cols-12 items-start pt-2 px-6">
                
                {/* Left: MoEYS Official Round Emblem */}
                <div className="col-span-3 flex flex-col items-start space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-500/60 p-0.5 bg-white shadow-xs flex items-center justify-center">
                      {/* Stylized MoEYS Torch & Book Emblem */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-blue-900" fill="none">
                        <circle cx="50" cy="50" r="46" stroke="#b45309" strokeWidth="2.5" fill="#fef3c7" />
                        <circle cx="50" cy="50" r="40" stroke="#1e3a8a" strokeWidth="1.5" fill="#ffffff" />
                        {/* Torch Flame */}
                        <path d="M50 20 C46 28 42 33 46 40 C48 38 52 38 54 40 C58 33 54 28 50 20 Z" fill="#dc2626" />
                        <path d="M50 24 C48 29 46 32 48 36 C50 35 51 35 52 36 C54 32 52 29 50 24 Z" fill="#f59e0b" />
                        {/* Open Book */}
                        <path d="M30 65 C40 60 50 63 50 72 C50 63 60 60 70 65 L70 50 C60 45 50 48 50 56 C50 48 40 45 30 50 Z" fill="#1e3a8a" />
                        <line x1="50" y1="56" x2="50" y2="72" stroke="#ffffff" strokeWidth="1.5" />
                        {/* Gear/Wheel base */}
                        <path d="M42 42 L58 42 L56 50 L44 50 Z" fill="#d97706" />
                      </svg>
                    </div>
                  </div>
                  <span className="font-moul text-[11px] text-blue-900 tracking-wide">
                    {certificateData.ministryName}
                  </span>
                </div>

                {/* Center: Royal Kingdom Coat of Arms & Motto */}
                <div className="col-span-6 text-center space-y-1">
                  {/* Golden Royal Crown / Coat of Arms Icon */}
                  <div className="flex justify-center -mb-1">
                    <svg viewBox="0 0 100 60" className="w-14 h-8 text-amber-600 drop-shadow-xs" fill="currentColor">
                      {/* Royal Crown / Swords Emblem Silhouette */}
                      <path d="M50 2 L56 18 L68 12 L62 28 L78 26 L66 42 L50 36 L34 42 L22 26 L38 28 L32 12 L44 18 Z" fill="#d97706" />
                      <circle cx="50" cy="6" r="3" fill="#f59e0b" />
                      <path d="M25 46 C35 44 65 44 75 46 L78 52 C65 50 35 50 22 52 Z" fill="#b45309" />
                      <circle cx="50" cy="48" r="2.5" fill="#fef3c7" />
                    </svg>
                  </div>

                  <h1 className="font-moul text-base text-blue-950 tracking-wider">
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </h1>
                  <h2 className="font-moul text-sm text-blue-950 tracking-wide">
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </h2>

                  {/* Traditional Triple Lotus Flourish */}
                  <div className="flex items-center justify-center gap-1.5 py-0.5">
                    <div className="w-14 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-amber-600" />
                    <span className="text-amber-600 text-[10px]">❖ ៚ ❖</span>
                    <div className="w-14 h-[1.5px] bg-gradient-to-l from-transparent via-amber-500 to-amber-600" />
                  </div>
                </div>

                {/* Right Placeholder for balancing */}
                <div className="col-span-3 text-right">
                  <span className="inline-block px-2.5 py-1 rounded-md border border-amber-300 bg-amber-50/60 text-[10px] font-bold text-amber-900 font-battambang">
                    {certificateData.organizationName}
                  </span>
                </div>

              </div>

              {/* ========================================================================= */}
              {/* 3. MAIN CERTIFICATE BODY & TYPOGRAPHY */}
              {/* ========================================================================= */}
              <div className="relative z-10 text-center space-y-2.5 my-auto px-12">
                
                {/* Main Red Heading: វិញ្ញាបនបត្រ */}
                <div className="space-y-1">
                  <h2 className="font-moul text-3xl sm:text-4xl text-red-600 tracking-wider drop-shadow-xs">
                    វិញ្ញាបនបត្រ
                  </h2>
                </div>

                {/* Issuing Authority (User Requested: ឋានៈវិញត្រឹម នាយកសាលា) */}
                <div className="space-y-1 pt-1">
                  <h3 className="font-moul text-lg sm:text-xl text-blue-950 tracking-wide">
                    {certificateData.issuerTitle}
                  </h3>
                  <p className="font-moul text-sm text-blue-900 tracking-wide">
                    {certificateData.statementIntro}
                  </p>
                </div>

                {/* Recipient Name in Big Distinctive Moul Script */}
                <div className="py-1">
                  <div className="inline-flex items-baseline gap-2">
                    <span className="font-moul text-sm text-blue-950">ឈ្មោះ:</span>
                    <span className="font-moul text-2xl sm:text-3xl text-blue-950 tracking-wide px-2 border-b-2 border-dotted border-amber-400/80">
                      {certificateData.recipientName}
                    </span>
                  </div>
                </div>

                {/* Certificate Core Statement */}
                <p className="max-w-3xl mx-auto text-sm text-slate-800 leading-relaxed font-battambang font-medium">
                  {certificateData.activityType}
                </p>

                {/* Course/Achievement Title in Large Bold Accent Script */}
                <div className="py-1">
                  <h4 className="font-moul text-base sm:text-lg text-blue-950 tracking-wide max-w-3xl mx-auto px-4 py-1.5 rounded-xl bg-amber-50/50 border border-amber-200/60 shadow-xs">
                    «{certificateData.courseTitle}»
                  </h4>
                </div>

                {/* Closing Legal Clause */}
                <p className="text-xs text-slate-600 font-battambang italic">
                  {certificateData.closingStatement}
                </p>

              </div>

              {/* ========================================================================= */}
              {/* 4. FOOTER: DATES, OFFICIAL STAMP, PRINCIPAL SIGNATURE & QR CODE */}
              {/* ========================================================================= */}
              <div className="relative z-10 grid grid-cols-12 items-end px-6 pb-2">
                
                {/* Bottom Left: QR Code & Verification Info */}
                <div className="col-span-4 flex items-end gap-3">
                  {certificateData.showQrCode && (
                    <div className="bg-white p-1.5 rounded-lg border border-slate-300 shadow-xs">
                      {/* High-Contrast Crisp SVG QR Code Placeholder */}
                      <svg viewBox="0 0 100 100" className="w-16 h-16 text-slate-900">
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        {/* Position Detection Patterns */}
                        {/* Top-Left Corner Pattern */}
                        <rect x="5" y="5" width="26" height="26" fill="black" />
                        <rect x="9" y="9" width="18" height="18" fill="white" />
                        <rect x="13" y="13" width="10" height="10" fill="black" />
                        
                        {/* Top-Right Corner Pattern */}
                        <rect x="69" y="5" width="26" height="26" fill="black" />
                        <rect x="73" y="9" width="18" height="18" fill="white" />
                        <rect x="77" y="13" width="10" height="10" fill="black" />

                        {/* Bottom-Left Corner Pattern */}
                        <rect x="5" y="69" width="26" height="26" fill="black" />
                        <rect x="9" y="73" width="18" height="18" fill="white" />
                        <rect x="13" y="77" width="10" height="10" fill="black" />

                        {/* Data Modules */}
                        <rect x="36" y="10" width="6" height="6" fill="black" />
                        <rect x="46" y="10" width="6" height="6" fill="black" />
                        <rect x="56" y="10" width="6" height="6" fill="black" />
                        <rect x="36" y="24" width="6" height="6" fill="black" />
                        <rect x="48" y="24" width="8" height="6" fill="black" />

                        <rect x="10" y="36" width="6" height="6" fill="black" />
                        <rect x="22" y="36" width="6" height="6" fill="black" />
                        <rect x="36" y="36" width="8" height="8" fill="black" />
                        <rect x="50" y="36" width="6" height="6" fill="black" />
                        <rect x="62" y="36" width="6" height="6" fill="black" />
                        <rect x="76" y="36" width="8" height="8" fill="black" />

                        <rect x="36" y="50" width="6" height="6" fill="black" />
                        <rect x="48" y="50" width="6" height="6" fill="black" />
                        <rect x="60" y="50" width="8" height="6" fill="black" />
                        <rect x="76" y="50" width="6" height="6" fill="black" />

                        <rect x="36" y="66" width="8" height="6" fill="black" />
                        <rect x="50" y="66" width="6" height="6" fill="black" />
                        <rect x="62" y="66" width="6" height="6" fill="black" />
                        <rect x="76" y="66" width="8" height="6" fill="black" />

                        <rect x="36" y="78" width="6" height="8" fill="black" />
                        <rect x="48" y="78" width="8" height="8" fill="black" />
                        <rect x="62" y="78" width="6" height="8" fill="black" />
                        <rect x="76" y="78" width="6" height="8" fill="black" />
                      </svg>
                    </div>
                  )}

                  <div className="space-y-0.5 text-left">
                    <p className="font-moul text-[10px] text-blue-950 tracking-tight">
                      {certificateData.verificationPlatform}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-700">
                      {certificateData.certificateId}
                    </p>
                    <p className="text-[9px] text-slate-500 font-battambang">
                      ស្កេនដើម្បីផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវ
                    </p>
                  </div>
                </div>

                {/* Center empty space */}
                <div className="col-span-3" />

                {/* Bottom Right: Lunar/Solar Dates & Principal Signature Block */}
                <div className="col-span-5 text-center relative">
                  
                  {/* Lunar Date (កាលបរិច្ឆេទចន្ទគតិ) */}
                  <p className="text-[11px] text-blue-950 font-medium">
                    {certificateData.lunarDate}
                  </p>

                  {/* Solar Date (កាលបរិច្ឆេទសុរិយគតិ) */}
                  <p className="text-[11px] text-blue-950 font-medium">
                    {certificateData.solarDate}
                  </p>

                  {/* Principal Signatory Title (នាយកសាលា) */}
                  <p className="font-moul text-xs text-blue-900 font-bold mt-1">
                    {certificateData.signatoryRole}
                  </p>

                  {/* Stamp & Signature Space (Overlapping with Red Stamp) */}
                  <div className="relative h-20 flex items-center justify-center my-1">
                    
                    {/* Official Circular Red Stamp (ត្រាមូលក្រហម) */}
                    {certificateData.showStamp && (
                      <div className="absolute -top-3 left-4 w-28 h-28 rounded-full border-2 border-red-600/80 p-1 flex items-center justify-center pointer-events-none rotate-[-8deg] shadow-xs bg-red-50/10">
                        <div className="w-full h-full rounded-full border border-dashed border-red-500/70 p-1 flex flex-col items-center justify-between text-center text-red-600">
                          <span className="text-[6.5px] font-bold font-moul leading-tight text-red-700">
                            ក្រសួងអប់រំ យុវជន និងកីឡា
                          </span>
                          <span className="text-[7.5px] font-bold font-moul leading-tight text-red-800 px-1 my-auto">
                            {certificateData.organizationName}
                          </span>
                          <div className="flex items-center justify-center gap-1 text-[6.5px] text-red-700">
                            <span>★</span>
                            <span className="font-semibold font-battambang">បាត់ដំបង</span>
                            <span>★</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stylized Blue Wet Signature (ហត្ថលេខាខៀវ) */}
                    {certificateData.showSignature && (
                      <div className="relative z-10 translate-x-3 translate-y-1">
                        <svg viewBox="0 0 160 60" className="w-32 h-14 text-blue-800" fill="none">
                          <path
                            d="M10 40 C30 10, 45 45, 60 15 C75 -5, 80 50, 95 30 C110 10, 120 40, 145 25"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M45 42 Q85 30 135 48"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M80 15 L78 50"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}

                  </div>

                  {/* Principal Name in Red Moul Script */}
                  <p className="font-moul text-xs text-red-600 font-bold tracking-wide relative z-20">
                    {certificateData.signatoryName}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-battambang">
            💡 គំរូវិញ្ញាបនបត្រត្រូវបានកែសម្រួលដាក់ <b>អង្គភាព: {certificateData.organizationName}</b> និង <b>ឋានៈ: {certificateData.issuerTitle}</b> ស្របតាមការស្នើសុំ។
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'កំពុងបង្កើត PDF...' : 'ទាញយក PDF (A4 Landscape)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
