import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student, SchoolProfile } from '../types';
import { buildStudentQRLoginUrl } from '../utils/qrAuthService';
import {
  X,
  Printer,
  Download,
  QrCode,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  GraduationCap,
  ShieldCheck,
  Building,
  User,
  Image as ImageIcon,
  Check,
  Layers,
  FileDown
} from 'lucide-react';
import { printElement } from '../utils/printUtils';

interface ExportStudentIdBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolProfile: SchoolProfile;
  initialStudentId?: string;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExportStudentIdBadgeModal: React.FC<ExportStudentIdBadgeModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolProfile,
  initialStudentId,
  showToast
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students[0]?.id ?? '')
  );
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cardOrientation, setCardOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showPrincipalStamp, setShowPrincipalStamp] = useState<boolean>(true);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const badgeCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filtered student list for selector
  const filteredStudents = students.filter(st => {
    if (gradeFilter !== 'all' && st.grade !== Number(gradeFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName =
        st.nameKhmer.toLowerCase().includes(q) ||
        (st.nameLatin && st.nameLatin.toLowerCase().includes(q));
      const matchCode = st.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handlePrintBadge = () => {
    printElement('student-id-card-badge-container', {
      pageTitle: `ប័ណ្ណសម្គាល់ខ្លួន_${selectedStudent?.nameKhmer || 'សិស្ស'}_${selectedStudent?.code || ''}`,
      landscape: cardOrientation === 'landscape'
    });
  };

  const handleDownloadPng = async () => {
    if (!badgeCardRef.current || !selectedStudent) return;
    setIsExportingImage(true);
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(badgeCardRef.current, {
        scale: 3, // High DPI (300 DPI equivalent)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ID_CARD_${selectedStudent.code}_${selectedStudent.nameKhmer.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      showToast(`បានទាញយករូបភាពប័ណ្ណសិស្សកម្រិតច្បាស់ (High-Res) ជោគជ័យ!`);
    } catch (err) {
      console.error('Failed to export ID badge as image:', err);
      showToast('បរាជ័យក្នុងការទាញយករូបភាព សូមប្រើប្រាស់ប៊ូតុងបោះពុម្ពជំនួសវិញ', 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  const [qrImageUrl, setQrImageUrl] = useState<string>('');

  // Generate QR Code data url for the selected student
  useEffect(() => {
    if (!selectedStudent) return;
    const qrUrl = buildStudentQRLoginUrl(selectedStudent, schoolProfile.code || '020401015');
    QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    })
      .then(url => setQrImageUrl(url))
      .catch(err => console.error('Error generating badge QR code:', err));
  }, [selectedStudent, schoolProfile]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-kantumruy flex items-center gap-2">
                <span>បង្កើត និងនាំចេញប័ណ្ណសម្គាល់ខ្លួនសិស្ស (Student ID Card Badge)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-medium border border-amber-400/30">
                  High-Resolution
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                រចនាប័ទ្មស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា ជាមួយ QR Code ផ្ទៀងផ្ទាត់កម្រិតខ្ពស់
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Column (Student Selection & Config) + Right Column (Live High-Res Badge Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto p-4 sm:p-6 gap-6">
          {/* Left Panel: Search & Select Student */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                ជ្រើសរើសសិស្សដែលត្រូវបង្កើតប័ណ្ណ (Select Student)
              </label>

              {/* Filters */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <select
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">គ្រប់កម្រិតថ្នាក់</option>
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>
                        ថ្នាក់ទី {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-7 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ឈ្មោះសិស្ស ឬអត្តលេខ..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-slate-50/50">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">ពុំមានទិន្នន័យសិស្សឡើយ</div>
              ) : (
                filteredStudents.map(st => {
                  const isSelected = st.id === selectedStudent?.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`w-full p-2.5 text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-blue-50/90 text-blue-950 font-bold'
                          : 'hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {st.photoUrl ? (
                          <img
                            src={st.photoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {st.nameKhmer.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs truncate font-kライム">
                            {st.nameKhmer}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              ({st.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            អត្តលេខ: <span className="font-mono">{st.code}</span> • ថ្នាក់ទី
                            {st.grade}
                            {st.section}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Badge Options & Orientation */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-800">ការកំណត់ទម្រង់ប័ណ្ណ (Card Styling)</p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCardOrientation('portrait')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    cardOrientation === 'portrait'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>បញ្ឈរ (Portrait)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardOrientation('landscape')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    cardOrientation === 'landscape'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 rotate-90" />
                  <span>ផ្តេក (Landscape)</span>
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={showPrincipalStamp}
                  onChange={e => setShowPrincipalStamp(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>បង្ហាញត្រាសាលា និងហត្ថលេខានាយក (Official Stamp & Seal)</span>
              </label>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handlePrintBadge}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពប័ណ្ណ (Print Card)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExportingImage}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                <span>{isExportingImage ? 'កំពុងនាំចេញ...' : 'ទាញយកជារូបភាព (PNG)'}</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live Badge Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-100/70 p-4 sm:p-6 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5 self-start">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>គំរូប័ណ្ណសិស្សកម្រិតច្បាស់ (300 DPI High-Resolution Card Preview)</span>
            </p>

            {/* Printable ID Card Container */}
            <div id="student-id-card-badge-container" className="flex justify-center p-2">
              {selectedStudent ? (
                cardOrientation === 'portrait' ? (
                  /* ================= PORTRAIT BADGE CARD (54x86mm) ================= */
                  <div
                    ref={badgeCardRef}
                    className="w-[320px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 relative text-slate-900 font-sans"
                    style={{
                      aspectRatio: '54 / 86',
                      background: 'linear-gradient(180deg, #0f2b5c 0%, #1e40af 12%, #ffffff 28%, #ffffff 100%)'
                    }}
                  >
                    {/* Top MoEYS & Royal Emblem Header */}
                    <div className="pt-3 px-3 text-center text-white relative z-10">
                      <p className="font-moul text-[9px] text-amber-300 tracking-wide">
                        ព្រះរាជាណាចក្រកម្ពុជា
                      </p>
                      <p className="font-moul text-[8px] text-white">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                      <div className="w-12 h-0.5 bg-amber-400 mx-auto my-1 rounded-full opacity-80" />
                      <p className="font-moul text-[11px] text-white leading-tight mt-1">
                        {schoolProfile.nameKhmer || 'សាលាបឋមសិក្សា'}
                      </p>
                      <p className="font-times text-[8px] text-blue-200 tracking-wider">
                        {schoolProfile.nameLatin || 'PRIMARY SCHOOL'}
                      </p>
                    </div>

                    {/* Badge Title Pill */}
                    <div className="mt-3 flex justify-center">
                      <span className="px-3 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[10px] rounded-full shadow-xs tracking-wider uppercase">
                        ប័ណ្ណសម្គាល់ខ្លួនសិស្ស (STUDENT ID)
                      </span>
                    </div>

                    {/* Student Photo & QR Code Section */}
                    <div className="px-4 pt-3 flex items-center justify-between gap-3">
                      {/* Photo */}
                      <div className="relative">
                        <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-blue-800 shadow-md bg-slate-100 flex items-center justify-center">
                          {selectedStudent.photoUrl ? (
                            <img
                              src={selectedStudent.photoUrl}
                              alt={selectedStudent.nameKhmer}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                              <User className="w-8 h-8 text-slate-300 mb-1" />
                              <span className="text-[9px] font-bold">រូបថតសិស្ស</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-blue-700 text-white rounded-full p-0.5 border border-white">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-xs">
                        <img
                          src={qrImageUrl}
                          alt="Student QR"
                          className="w-20 h-20 rounded-lg object-contain bg-white"
                        />
                        <span className="text-[8px] font-mono font-bold text-slate-600 mt-1">
                          SCAN TO VERIFY
                        </span>
                      </div>
                    </div>

                    {/* Student Info Details */}
                    <div className="px-4 pt-3 space-y-1 text-slate-800">
                      <div className="border-b border-slate-200 pb-1">
                        <p className="text-[13px] font-bold text-blue-950 font-kantumruy leading-tight">
                          {selectedStudent.nameKhmer}
                        </p>
                        <p className="text-[10px] font-times font-bold text-slate-600 uppercase tracking-wide">
                          {selectedStudent.nameLatin || 'STUDENT NAME'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] pt-1">
                        <div>
                          <span className="text-slate-500">អត្តលេខ៖</span>{' '}
                          <span className="font-mono font-bold text-blue-900">{selectedStudent.code}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">ភេទ៖</span>{' '}
                          <span className="font-bold">
                            {selectedStudent.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">ថ្នាក់ទី៖</span>{' '}
                          <span className="font-bold text-blue-800">
                            {selectedStudent.grade}
                            {selectedStudent.section}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">ឆ្នាំសិក្សា៖</span>{' '}
                          <span className="font-bold">{schoolProfile.academicYear}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">ថ្ងៃខែឆ្នាំកំណើត៖</span>{' '}
                          <span className="font-bold">{selectedStudent.dob || '...'}</span>
                        </div>
                        {selectedStudent.phone && (
                          <div className="col-span-2">
                            <span className="text-slate-500">អាណាព្យាបាល៖</span>{' '}
                            <span className="font-bold">{selectedStudent.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer with Official Stamp / Signature */}
                    <div className="mt-2 pt-2 px-4 pb-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-600 bg-slate-50/80">
                      <div>
                        <p className="font-bold text-slate-800">នាយកសាលា</p>
                        <p className="text-[8px] text-slate-500">{schoolProfile.principalName || '...'}</p>
                      </div>

                      {showPrincipalStamp && (
                        <div className="relative">
                          <div className="w-11 h-11 rounded-full border border-red-500/80 bg-red-50/50 flex flex-col items-center justify-center text-red-600 text-[6px] font-bold text-center leading-tight shadow-2xs">
                            <span>ត្រាផ្លូវការ</span>
                            <span className="text-[5px]">MoEYS</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ================= LANDSCAPE BADGE CARD (86x54mm) ================= */
                  <div
                    ref={badgeCardRef}
                    className="w-[440px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 relative text-slate-900 font-sans p-4"
                    style={{
                      aspectRatio: '86 / 54',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%)'
                    }}
                  >
                    {/* Header Strip */}
                    <div className="flex items-center justify-between border-b border-blue-800/30 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-moul text-xs">
                          {schoolProfile.nameKhmer.charAt(0) || 'ស'}
                        </div>
                        <div>
                          <p className="font-moul text-[11px] text-blue-950 leading-tight">
                            {schoolProfile.nameKhmer}
                          </p>
                          <p className="font-times text-[8px] text-slate-500 uppercase">
                            {schoolProfile.nameLatin}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-blue-700 text-white font-bold text-[9px] rounded-full">
                          កាតសិស្ស • STUDENT ID
                        </span>
                        <p className="text-[8px] font-mono text-slate-500 mt-0.5 font-bold">
                          {schoolProfile.academicYear}
                        </p>
                      </div>
                    </div>

                    {/* Main Content: Photo + Info + QR */}
                    <div className="flex items-center gap-3.5">
                      {/* Photo */}
                      <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-blue-700 shrink-0 bg-slate-100 flex items-center justify-center shadow-sm">
                        {selectedStudent.photoUrl ? (
                          <img
                            src={selectedStudent.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      {/* Info Details */}
                      <div className="flex-1 min-w-0 space-y-1 text-[10px]">
                        <div>
                          <p className="font-bold text-sm text-blue-950 font-kantumruy truncate">
                            {selectedStudent.nameKhmer}
                          </p>
                          <p className="font-times font-bold text-[10px] text-slate-600 uppercase truncate">
                            {selectedStudent.nameLatin}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                          <div>
                            <span className="text-slate-500">អត្តលេខ:</span>{' '}
                            <span className="font-mono font-bold text-blue-900">
                              {selectedStudent.code}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">ថ្នាក់:</span>{' '}
                            <span className="font-bold">
                              ទី {selectedStudent.grade}
                              {selectedStudent.section}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">ភេទ:</span>{' '}
                            <span className="font-bold">
                              {selectedStudent.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">កំណើត:</span>{' '}
                            <span className="font-bold">{selectedStudent.dob || '...'}</span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
                        <img
                          src={qrImageUrl}
                          alt="QR"
                          className="w-16 h-16 rounded-md object-contain"
                        />
                        <span className="text-[7px] font-mono font-bold text-slate-500 mt-0.5">
                          VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            ប័ណ្ណសម្គាល់ខ្លួននេះអាចប្រើប្រាស់សម្រាប់ស្កេនកត់ត្រាវត្តមាន ឬផ្ទៀងផ្ទាត់បញ្ជីឈ្មោះសិស្ស។
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            បិទផ្ទាំង (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
