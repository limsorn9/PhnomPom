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
  FileDown,
  BookOpen,
  Trophy,
  Award,
  FileText,
  Palette,
  Hash,
  Barcode
} from 'lucide-react';
import { printElement } from '../utils/printUtils';

export type CardPurpose = 'general' | 'library' | 'event' | 'exam';
export type CardTheme = 'navy' | 'emerald' | 'amber' | 'ruby' | 'purple';

interface ExportStudentIdBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolProfile: SchoolProfile;
  initialStudentId?: string;
  initialPurpose?: CardPurpose;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExportStudentIdBadgeModal: React.FC<ExportStudentIdBadgeModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolProfile,
  initialStudentId,
  initialPurpose = 'general',
  showToast = (_msg: string, _type?: 'success' | 'info' | 'error') => {}
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students[0]?.id ?? '')
  );
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cardOrientation, setCardOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [cardPurpose, setCardPurpose] = useState<CardPurpose>(initialPurpose);
  const [cardTheme, setCardTheme] = useState<CardTheme>(
    initialPurpose === 'library' ? 'emerald' : initialPurpose === 'event' ? 'amber' : initialPurpose === 'exam' ? 'ruby' : 'navy'
  );
  const [customEventTitle, setCustomEventTitle] = useState<string>('');
  const [showPrincipalStamp, setShowPrincipalStamp] = useState<boolean>(true);
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const badgeCardRef = useRef<HTMLDivElement>(null);

  // Sync initialStudentId when modal opens with a specific student
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  // Adjust default theme when card purpose changes
  const handlePurposeChange = (purpose: CardPurpose) => {
    setCardPurpose(purpose);
    if (purpose === 'library') {
      setCardTheme('emerald');
      if (!customEventTitle) setCustomEventTitle('បណ្ណាល័យសាលាបឋមសិក្សា (School Library)');
    } else if (purpose === 'event') {
      setCardTheme('amber');
      if (!customEventTitle) setCustomEventTitle('ទិវាអំណានជាតិ និងមហោស្រពកុមារ');
    } else if (purpose === 'exam') {
      setCardTheme('ruby');
      if (!customEventTitle) setCustomEventTitle('ការប្រឡងឆមាស និងវាយតម្លៃសមត្ថភាព');
    } else {
      setCardTheme('navy');
      setCustomEventTitle('');
    }
  };

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
    const purposeTitle =
      cardPurpose === 'library'
        ? 'ប័ណ្ណបណ្ណាល័យ'
        : cardPurpose === 'event'
        ? 'ប័ណ្ណព្រឹត្តិការណ៍'
        : cardPurpose === 'exam'
        ? 'ប័ណ្ណប្រឡង'
        : 'ប័ណ្ណសម្គាល់ខ្លួន';

    printElement('student-id-card-badge-container', {
      pageTitle: `${purposeTitle}_${selectedStudent?.nameKhmer || 'សិស្ស'}_${selectedStudent?.code || ''}`,
      landscape: cardOrientation === 'landscape'
    });
  };

  const handleDownloadPng = async () => {
    if (!badgeCardRef.current || !selectedStudent) return;
    setIsExportingImage(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(badgeCardRef.current, {
        scale: 3, // 300 DPI equivalent
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filenamePrefix =
        cardPurpose === 'library'
          ? 'LIBRARY_CARD'
          : cardPurpose === 'event'
          ? 'EVENT_PASS'
          : cardPurpose === 'exam'
          ? 'EXAM_PASS'
          : 'STUDENT_ID';

      link.download = `${filenamePrefix}_${selectedStudent.code}_${selectedStudent.nameKhmer.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      if (showToast) {
        showToast(`បានទាញយករូបភាពប័ណ្ណកម្រិតច្បាស់ (300 DPI High-Res) ជោគជ័យ!`, 'success');
      }
    } catch (err) {
      console.error('Failed to export ID badge as image:', err);
      if (showToast) {
        showToast('បរាជ័យក្នុងការទាញយករូបភាព សូមប្រើប្រាស់ប៊ូតុងបោះពុម្ពជំនួសវិញ', 'error');
      }
    } finally {
      setIsExportingImage(false);
    }
  };

  const [qrImageUrl, setQrImageUrl] = useState<string>('');

  // Generate QR Code data url for the selected student
  useEffect(() => {
    if (!selectedStudent) return;

    let payload = '';
    if (cardPurpose === 'library') {
      payload = JSON.stringify({
        type: 'LIBRARY_PASS',
        id: selectedStudent.id,
        code: selectedStudent.code,
        name: selectedStudent.nameKhmer,
        grade: `${selectedStudent.grade}${selectedStudent.section}`,
        school: schoolProfile.code,
        validUntil: schoolProfile.academicYear
      });
    } else if (cardPurpose === 'event') {
      payload = JSON.stringify({
        type: 'EVENT_ACCESS',
        id: selectedStudent.id,
        code: selectedStudent.code,
        name: selectedStudent.nameKhmer,
        event: customEventTitle || 'School Event',
        school: schoolProfile.code
      });
    } else if (cardPurpose === 'exam') {
      payload = JSON.stringify({
        type: 'EXAM_CANDIDATE',
        id: selectedStudent.id,
        code: selectedStudent.code,
        name: selectedStudent.nameKhmer,
        grade: `${selectedStudent.grade}${selectedStudent.section}`,
        school: schoolProfile.code
      });
    } else {
      payload = buildStudentQRLoginUrl(selectedStudent, schoolProfile.code || '020401015');
    }

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    })
      .then(url => setQrImageUrl(url))
      .catch(err => console.error('Error generating badge QR code:', err));
  }, [selectedStudent, schoolProfile, cardPurpose, customEventTitle]);

  // Color theme definitions
  const themeConfig = {
    navy: {
      gradient: 'linear-gradient(180deg, #0b2545 0%, #133c55 18%, #ffffff 36%, #ffffff 100%)',
      landscapeBg: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 40%, #e0effe 100%)',
      headerBg: 'bg-blue-900',
      headerText: 'text-amber-300',
      pillBg: 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white',
      accentColor: 'text-blue-950',
      borderColor: 'border-blue-800',
      subTextColor: 'text-blue-200',
      qrLabel: 'QR ផ្ទៀងផ្ទាត់'
    },
    emerald: {
      gradient: 'linear-gradient(180deg, #064e3b 0%, #047857 18%, #ffffff 36%, #ffffff 100%)',
      landscapeBg: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 40%, #d1fae5 100%)',
      headerBg: 'bg-emerald-900',
      headerText: 'text-emerald-300',
      pillBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
      accentColor: 'text-emerald-950',
      borderColor: 'border-emerald-700',
      subTextColor: 'text-emerald-200',
      qrLabel: 'QR បណ្ណាល័យ'
    },
    amber: {
      gradient: 'linear-gradient(180deg, #78350f 0%, #d97706 18%, #ffffff 36%, #ffffff 100%)',
      landscapeBg: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 40%, #fef3c7 100%)',
      headerBg: 'bg-amber-900',
      headerText: 'text-amber-300',
      pillBg: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
      accentColor: 'text-amber-950',
      borderColor: 'border-amber-600',
      subTextColor: 'text-amber-200',
      qrLabel: 'QR ចូលរួម'
    },
    ruby: {
      gradient: 'linear-gradient(180deg, #881337 0%, #be123c 18%, #ffffff 36%, #ffffff 100%)',
      landscapeBg: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 40%, #ffe4e6 100%)',
      headerBg: 'bg-rose-950',
      headerText: 'text-rose-200',
      pillBg: 'bg-gradient-to-r from-rose-700 to-red-800 text-white',
      accentColor: 'text-rose-950',
      borderColor: 'border-rose-700',
      subTextColor: 'text-rose-200',
      qrLabel: 'QR បេក្ខជន'
    },
    purple: {
      gradient: 'linear-gradient(180deg, #3b0764 0%, #6b21a8 18%, #ffffff 36%, #ffffff 100%)',
      landscapeBg: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 40%, #f3e8ff 100%)',
      headerBg: 'bg-purple-950',
      headerText: 'text-purple-200',
      pillBg: 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white',
      accentColor: 'text-purple-950',
      borderColor: 'border-purple-700',
      subTextColor: 'text-purple-200',
      qrLabel: 'QR កិត្តិយស'
    }
  }[cardTheme];

  const getCardHeaderTitleKh = () => {
    if (cardPurpose === 'library') {
      return customEventTitle || 'បណ្ណាល័យសាលាបឋមសិក្សា';
    }
    if (cardPurpose === 'event') {
      return customEventTitle || 'ប័ណ្ណចូលរួមព្រឹត្តិការណ៍សាលា';
    }
    if (cardPurpose === 'exam') {
      return customEventTitle || 'ប័ណ្ណប្រឡង និងវាយតម្លៃសមត្ថភាព';
    }
    return schoolProfile.nameKhmer || 'សាលាបឋមសិក្សា';
  };

  const getCardPillLabel = () => {
    if (cardPurpose === 'library') return 'ប័ណ្ណបណ្ណាល័យ • LIBRARY PASS';
    if (cardPurpose === 'event') return 'ប័ណ្ណព្រឹត្តិការណ៍ • EVENT ACCESS PASS';
    if (cardPurpose === 'exam') return 'ប័ណ្ណប្រឡង • EXAM CANDIDATE PASS';
    return 'ប័ណ្ណសម្គាល់ខ្លួន • STUDENT ID CARD';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-kantumruy flex items-center gap-2 flex-wrap">
                <span>បង្កើត និងបោះពុម្ពប័ណ្ណសិស្ស (Custom Student ID & Access Cards)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-medium border border-amber-400/30">
                  A4 / ID Badge 300 DPI
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                រចនាប័ណ្ណសម្គាល់ខ្លួន ប័ណ្ណបណ្ណាល័យ និងប័ណ្ណព្រឹត្តិការណ៍សាលា ជាមួយរូបថត និង QR Code
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="បិទ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Column (Controls) + Right Column (Live Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto p-4 sm:p-6 gap-6">
          {/* Left Panel: Configuration & Student Selector */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            {/* 1. Purpose Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>គោលបំណងនៃការប្រើប្រាស់ប័ណ្ណ (Card Purpose / Usage Type)</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePurposeChange('general')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                    cardPurpose === 'general'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight truncate">ប័ណ្ណសិស្សទូទៅ</p>
                    <span className="text-[10px] text-slate-500 font-normal">Student ID Card</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePurposeChange('library')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                    cardPurpose === 'library'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs ring-1 ring-emerald-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight truncate">ប័ណ្ណបណ្ណាល័យ</p>
                    <span className="text-[10px] text-slate-500 font-normal">Library Pass</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePurposeChange('event')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                    cardPurpose === 'event'
                      ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-xs ring-1 ring-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight truncate">ព្រឹត្តិការណ៍ & កីឡា</p>
                    <span className="text-[10px] text-slate-500 font-normal">Event / Sports</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePurposeChange('exam')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                    cardPurpose === 'exam'
                      ? 'bg-rose-50 border-rose-600 text-rose-900 shadow-xs ring-1 ring-rose-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="truncate">
                    <p className="leading-tight truncate">ប័ណ្ណប្រឡង</p>
                    <span className="text-[10px] text-slate-500 font-normal">Exam Pass</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Event / Header Title Input (if not general) */}
            {cardPurpose !== 'general' && (
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700">
                  {cardPurpose === 'library'
                    ? 'ឈ្មោះបណ្ណាល័យ / កម្មវិធីអំណាន'
                    : cardPurpose === 'event'
                    ? 'ឈ្មោះព្រឹត្តិការណ៍ / ការប្រកួត'
                    : 'ឈ្មោះសម័យប្រឡង / វិញ្ញាសា'}
                </label>
                <input
                  type="text"
                  value={customEventTitle}
                  onChange={e => setCustomEventTitle(e.target.value)}
                  placeholder="វាយបញ្ចូលឈ្មោះកម្មវិធី ឬចំណងជើងប័ណ្ណ..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 2. Search & Select Student */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>ជ្រើសរើសសិស្ស (Selected Student)</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {filteredStudents.length} នាក់
                </span>
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

              {/* Student Scroll List */}
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto bg-slate-50/50">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">ពុំមានទិន្នន័យសិស្សឡើយ</div>
                ) : (
                  filteredStudents.map(st => {
                    const isSelected = st.id === selectedStudent?.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStudentId(st.id)}
                        className={`w-full p-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 text-blue-950 font-bold'
                            : 'hover:bg-slate-100/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {st.photoUrl ? (
                            <img
                              src={st.photoUrl}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {st.nameKhmer.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs truncate font-kantumruy">
                              {st.nameKhmer}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">
                                ({st.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              អត្តលេខ: <span className="font-mono">{st.code}</span> • ថ្នាក់ទី {st.grade}{st.section}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Badge Options & Theme Controls */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
              <p className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>ការរចនា និងទម្រង់ប័ណ្ណ (Card Styling)</span>
                <span className="text-[10px] text-slate-500 font-normal">CR80 Badge Size</span>
              </p>

              {/* Orientation Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCardOrientation('portrait')}
                  className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cardOrientation === 'portrait'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>បញ្ឈរ (Portrait 54x86mm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardOrientation('landscape')}
                  className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cardOrientation === 'landscape'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 rotate-90" />
                  <span>ផ្តេក (Landscape 86x54mm)</span>
                </button>
              </div>

              {/* Theme Color Palette */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-slate-500" />
                  <span>ពណ៌ស្បែកប័ណ្ណ (Theme Color)</span>
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'navy', bg: 'bg-blue-900', label: 'MoEYS Navy' },
                    { id: 'emerald', bg: 'bg-emerald-700', label: 'Library Green' },
                    { id: 'amber', bg: 'bg-amber-600', label: 'Event Gold' },
                    { id: 'ruby', bg: 'bg-rose-800', label: 'Exam Red' },
                    { id: 'purple', bg: 'bg-purple-800', label: 'Royal Purple' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setCardTheme(theme.id as CardTheme)}
                      className={`w-7 h-7 rounded-full ${theme.bg} flex items-center justify-center transition-transform cursor-pointer ${
                        cardTheme === theme.id ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={theme.label}
                    >
                      {cardTheme === theme.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrincipalStamp}
                    onChange={e => setShowPrincipalStamp(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>ត្រាសាលា/ហត្ថលេខា</span>
                </label>

                <label className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBarcode}
                    onChange={e => setShowBarcode(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>បង្ហាញ Barcode សិស្ស</span>
                </label>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrintBadge}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-99"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពប័ណ្ណ (Print Card)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExportingImage}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-101 active:scale-99"
              >
                <FileDown className="w-4 h-4" />
                <span>{isExportingImage ? 'កំពុងនាំចេញ...' : 'ទាញយក PNG (High-Res)'}</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live Badge Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-100/80 p-4 sm:p-6 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="w-full flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>គំរូប័ណ្ណកម្រិតច្បាស់ (300 DPI Live Preview)</span>
              </p>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-600">
                {cardOrientation === 'portrait' ? '54 x 86 mm' : '86 x 54 mm'}
              </span>
            </div>

            {/* Printable ID Card Container */}
            <div id="student-id-card-badge-container" className="flex justify-center p-2">
              {selectedStudent ? (
                cardOrientation === 'portrait' ? (
                  /* ================= PORTRAIT BADGE CARD (54x86mm) ================= */
                  <div
                    ref={badgeCardRef}
                    className="w-[310px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 relative text-slate-900 font-sans"
                    style={{
                      aspectRatio: '54 / 86',
                      background: themeConfig.gradient
                    }}
                  >
                    {/* Top Header */}
                    <div className="pt-3 px-3 text-center text-white relative z-10">
                      <p className="font-moul text-[9px] text-amber-300 tracking-wide">
                        ព្រះរាជាណាចក្រកម្ពុជា
                      </p>
                      <p className="font-moul text-[7.5px] text-white">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                      <div className="w-10 h-0.5 bg-amber-400 mx-auto my-1 rounded-full opacity-80" />
                      <p className="font-moul text-[10.5px] text-white leading-tight mt-0.5">
                        {getCardHeaderTitleKh()}
                      </p>
                      <p className="font-times text-[7.5px] text-blue-100 tracking-wider">
                        {schoolProfile.nameLatin || 'PRIMARY SCHOOL'}
                      </p>
                    </div>

                    {/* Badge Title Pill */}
                    <div className="mt-2.5 flex justify-center">
                      <span className={`px-3 py-0.5 ${themeConfig.pillBg} font-bold text-[9.5px] rounded-full shadow-xs tracking-wider uppercase font-kantumruy`}>
                        {getCardPillLabel()}
                      </span>
                    </div>

                    {/* Student Photo & QR Code Section */}
                    <div className="px-3.5 pt-2.5 flex items-center justify-between gap-3">
                      {/* Photo */}
                      <div className="relative">
                        <div className={`w-22 h-26 rounded-xl overflow-hidden border-2 ${themeConfig.borderColor} shadow-md bg-slate-100 flex items-center justify-center`}>
                          {selectedStudent.photoUrl ? (
                            <img
                              src={selectedStudent.photoUrl}
                              alt={selectedStudent.nameKhmer}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                              <User className="w-7 h-7 text-slate-300 mb-1" />
                              <span className="text-[8px] font-bold">រូបថតសិស្ស</span>
                            </div>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 ${themeConfig.headerBg} text-white rounded-full p-0.5 border border-white`}>
                          <ShieldCheck className="w-3 h-3 text-amber-300" />
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-xs">
                        <img
                          src={qrImageUrl}
                          alt="Student QR"
                          className="w-18 h-18 rounded-lg object-contain bg-white"
                        />
                        <span className="text-[7.5px] font-mono font-bold text-slate-600 mt-0.5">
                          {themeConfig.qrLabel}
                        </span>
                      </div>
                    </div>

                    {/* Student Info Details */}
                    <div className="px-3.5 pt-2 space-y-1 text-slate-800">
                      <div className="border-b border-slate-200 pb-1">
                        <p className={`text-[12.5px] font-bold ${themeConfig.accentColor} font-kantumruy leading-tight`}>
                          {selectedStudent.nameKhmer}
                        </p>
                        <p className="text-[9.5px] font-times font-bold text-slate-600 uppercase tracking-wide">
                          {selectedStudent.nameLatin || 'STUDENT NAME'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] pt-0.5">
                        <div>
                          <span className="text-slate-500">អត្តលេខ៖</span>{' '}
                          <span className="font-mono font-bold text-slate-900">{selectedStudent.code}</span>
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
                            {selectedStudent.grade}{selectedStudent.section}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">ឆ្នាំសិក្សា៖</span>{' '}
                          <span className="font-bold">{schoolProfile.academicYear}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">ថ្ងៃកំណើត៖</span>{' '}
                          <span className="font-bold">{selectedStudent.dob || '...'}</span>
                        </div>
                      </div>

                      {/* Barcode representation */}
                      {showBarcode && (
                        <div className="pt-1 text-center">
                          <div className="h-5 flex items-center justify-center gap-0.5 px-3 bg-slate-50 rounded border border-slate-200">
                            {[4, 2, 6, 3, 5, 2, 4, 7, 3, 2, 6, 4, 5, 2, 7, 3, 4, 6, 2].map((w, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-800 h-3.5"
                                style={{ width: `${w > 4 ? 2 : 1}px` }}
                              />
                            ))}
                          </div>
                          <span className="text-[7.5px] font-mono tracking-widest text-slate-500 font-bold">
                            *{selectedStudent.code}*
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="mt-1 pt-1.5 px-3.5 pb-2.5 border-t border-slate-200 flex items-center justify-between text-[8.5px] text-slate-600 bg-slate-50/90">
                      <div>
                        <p className="font-bold text-slate-800">នាយកសាលា / Principal</p>
                        <p className="text-[7.5px] text-slate-500">{schoolProfile.principalName || '...'}</p>
                      </div>

                      {showPrincipalStamp && (
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full border border-red-500/80 bg-red-50/60 flex flex-col items-center justify-center text-red-600 text-[5.5px] font-bold text-center leading-tight shadow-2xs">
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
                    className="w-[430px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 relative text-slate-900 font-sans p-3.5"
                    style={{
                      aspectRatio: '86 / 54',
                      background: themeConfig.landscapeBg
                    }}
                  >
                    {/* Header Strip */}
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${themeConfig.headerBg} text-white flex items-center justify-center font-moul text-xs shadow-xs`}>
                          {schoolProfile.nameKhmer.charAt(0) || 'ស'}
                        </div>
                        <div>
                          <p className={`font-moul text-[10.5px] ${themeConfig.accentColor} leading-tight`}>
                            {getCardHeaderTitleKh()}
                          </p>
                          <p className="font-times text-[7.5px] text-slate-500 uppercase tracking-wide">
                            {schoolProfile.nameLatin}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 ${themeConfig.pillBg} font-bold text-[8.5px] rounded-full shadow-2xs`}>
                          {getCardPillLabel()}
                        </span>
                        <p className="text-[7.5px] font-mono text-slate-500 mt-0.5 font-bold">
                          {schoolProfile.academicYear}
                        </p>
                      </div>
                    </div>

                    {/* Main Content: Photo + Info + QR */}
                    <div className="flex items-center gap-3">
                      {/* Photo */}
                      <div className={`w-18 h-22 rounded-xl overflow-hidden border-2 ${themeConfig.borderColor} shrink-0 bg-slate-100 flex items-center justify-center shadow-xs`}>
                        {selectedStudent.photoUrl ? (
                          <img
                            src={selectedStudent.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-7 h-7 text-slate-300" />
                        )}
                      </div>

                      {/* Info Details */}
                      <div className="flex-1 min-w-0 space-y-0.5 text-[9.5px]">
                        <div>
                          <p className={`font-bold text-[12.5px] ${themeConfig.accentColor} font-kantumruy truncate`}>
                            {selectedStudent.nameKhmer}
                          </p>
                          <p className="font-times font-bold text-[9px] text-slate-600 uppercase truncate">
                            {selectedStudent.nameLatin}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                          <div>
                            <span className="text-slate-500">អត្តលេខ:</span>{' '}
                            <span className="font-mono font-bold text-slate-900">
                              {selectedStudent.code}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">ថ្នាក់:</span>{' '}
                            <span className="font-bold text-blue-800">
                              ទី {selectedStudent.grade}{selectedStudent.section}
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

                        {showBarcode && (
                          <div className="pt-0.5">
                            <span className="text-[7.5px] font-mono tracking-widest text-slate-500 font-bold">
                              *{selectedStudent.code}*
                            </span>
                          </div>
                        )}
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
                        <img
                          src={qrImageUrl}
                          alt="QR"
                          className="w-16 h-16 rounded-md object-contain"
                        />
                        <span className="text-[7px] font-mono font-bold text-slate-500 mt-0.5">
                          {themeConfig.qrLabel}
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
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ប័ណ្ណសម្គាល់ខ្លួន និង QR Code នេះអាចស្កេនពិនិត្យប្រវត្តិរូបសិស្ស ចូលរួមកម្មវិធីសាលា ឬខ្ចីសៀវភៅបណ្ណាល័យបានភ្លាមៗ។</span>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            បិទផ្ទាំង (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
