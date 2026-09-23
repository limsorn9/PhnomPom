import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import {
  Camera,
  QrCode,
  Search,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Award,
  Phone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  UserCheck,
  Calendar,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { parseStudentQRData } from '../utils/qrUtils';
import { soundManager } from '../utils/gameSoundEffects';

interface StudentQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students?: Student[];
  onSelectStudent: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onAwardBadge?: (student: Student) => void;
  onShowQRCard?: (student: Student) => void;
}

export const StudentQRScannerModal: React.FC<StudentQRScannerModalProps> = ({
  isOpen,
  onClose,
  students: propStudents,
  onSelectStudent,
  onEditStudent,
  onAwardBadge,
  onShowQRCard,
}) => {
  const { students: contextStudents, showToast } = useSchool();
  const students = propStudents || contextStudents;
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualQuery, setManualQuery] = useState('');
  const [scannedResult, setScannedResult] = useState<{
    student: Student | null;
    raw: string;
    matchedBy: string;
  } | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  // Focus manual input when tab switched
  useEffect(() => {
    if (activeTab === 'manual' && manualInputRef.current) {
      setTimeout(() => manualInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  // Handle successful match
  const handleScanSuccess = (student: Student, rawText: string, matchedBy: string) => {
    try {
      soundManager.playCorrect();
    } catch {
      // Audio fallback
    }
    setScannedResult({ student, raw: rawText, matchedBy });
    showToast(`រកឃើញសិស្ស៖ ${student.nameKhmer} (${student.code})!`);
  };

  // Camera stream and continuous frame decoding
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
      return;
    }

    let stream: MediaStream | null = null;
    let isSubscribed = true;

    const startCamera = async () => {
      setCameraError(null);
      setCameraActive(false);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('ឧបករណ៍របស់អ្នកមិនគាំទ្រការប្រើប្រាស់កាមេរ៉ាក្នុងកម្មវិធីរុករកនេះទេ');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!isSubscribed) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
          await videoRef.current.play();
          setCameraActive(true);
          scanFrame();
        }
      } catch (err: any) {
        console.warn('Camera start error:', err);
        setCameraError(err.message || 'មិនអាចបើកកាមេរ៉ាបានទេ។ សូមអនុញ្ញាតសិទ្ធិកាមេរ៉ា ឬជ្រើសរើសជម្រើសស្កេនផ្សេងទៀត។');
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      isSubscribed = false;
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      const parsed = parseStudentQRData(code.data, students);
      if (parsed.student) {
        handleScanSuccess(parsed.student, code.data, parsed.matchedBy);
        // Pause scanning briefly after success
        setTimeout(() => {
          if (videoRef.current) {
            animationFrameId.current = requestAnimationFrame(scanFrame);
          }
        }, 2000);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Image Upload File Scan Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const parsed = parseStudentQRData(code.data, students);
          if (parsed.student) {
            handleScanSuccess(parsed.student, code.data, parsed.matchedBy);
          } else {
            showToast(`បានអាន QR: «${code.data}» ប៉ុន្តែរកមិនឃើញសិស្សក្នុងប្រព័ន្ធទេ`, 'error');
          }
        } else {
          showToast('មិនអាចរកឃើញ QR Code ក្នុងរូបភាពនេះទេ!', 'error');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manual code or name lookup handler
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    const parsed = parseStudentQRData(manualQuery.trim(), students);
    if (parsed.student) {
      handleScanSuccess(parsed.student, manualQuery, parsed.matchedBy);
    } else {
      showToast(`រកមិនឃើញសិស្សតាមរយៈ «${manualQuery}» ឡើយ!`, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between rounded-t-3xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-moul">
                ម៉ាស៊ីនស្កេន QR & ស្វែងរកសិស្សរហ័ស
              </h3>
              <p className="text-xs text-blue-200">
                ស្កេនកាតសិស្ស ឬបញ្ចូលអត្តលេខដើម្បីទាញយកព័ត៌មានភ្លាមៗ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="p-6 pb-2">
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>កាមេរ៉ាស្កេនបន្តផ្ទាល់</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>បញ្ចូលរូបភាព QR</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>ស្វែងរកតាមអត្តលេខ / ឈ្មោះ</span>
            </button>
          </div>
        </div>

        {/* Body based on Active Tab */}
        <div className="px-6 py-4 space-y-5 flex-1">
          {/* 1. Camera View */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-video sm:aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* QR Target Frame Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-amber-400 rounded-2xl bg-amber-400/5 shadow-2xl flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                      
                      {/* Scanning animated red laser */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse absolute" />
                    </div>
                  </div>
                )}

                {/* Error / Loading fallback */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/90 space-y-3">
                    {cameraError ? (
                      <>
                        <AlertCircle className="w-10 h-10 text-rose-400" />
                        <p className="text-xs text-rose-200 max-w-sm">{cameraError}</p>
                        <button
                          onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>សាកល្បងប្តូរកាមេរ៉ា</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-300">កំពុងបើកដំណើរការកាមេរ៉ា...</p>
                      </>
                    )}
                  </div>
                )}

                {/* Camera controls floating bar */}
                {cameraActive && (
                  <div className="absolute bottom-3 right-3 z-10">
                    <button
                      onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
                      className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md border border-white/20 shadow-md transition-transform active:scale-95 cursor-pointer"
                      title="ប្តូរកាមេរ៉ាមុខ/ក្រោយ"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-slate-500">
                តម្រង់កាមេរ៉ាទៅកាន់ QR Code លើកាតសិស្ស ឬលើអេក្រង់ទូរស័ព្ទដើម្បីស្កេន
              </p>
            </div>
          )}

          {/* 2. Image Upload View */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 transition-all rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    ចុច ឬទម្លាក់រូបភាព QR Code នៅទីនេះ
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    គាំទ្រទម្រង់ PNG, JPG, JPEG ឬរូបថតកាតសិស្ស
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  ជ្រើសរើសរូបភាព
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* 3. Manual Input View */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ស្វែងរកតាមរយៈ អត្តលេខសិស្ស, ឈ្មោះ ឬតំណភ្ជាប់ QR:
                </label>
                <div className="relative">
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualQuery}
                    onChange={e => setManualQuery(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ STU-2024-001, សុខ វិបុល, ឬស្កេនដោយកាំភ្លើងបាកូដ..."
                    className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95"
                  >
                    ស្វែងរក
                  </button>
                </div>
              </div>

              {/* Fast suggested sample buttons */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  គំរូសិស្សស្វែងរករហ័ស៖
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {students.slice(0, 5).map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setManualQuery(st.code);
                        handleScanSuccess(st, st.code, 'code');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      {st.nameKhmer} ({st.code})
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Scanned Result Card Preview */}
          {scannedResult?.student && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border-2 border-emerald-500/50 shadow-md space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>រកឃើញទិន្នន័យសិស្សជោគជ័យ!</span>
                </div>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-950 font-bold px-2 py-0.5 rounded-full font-mono">
                  {scannedResult.student.code}
                </span>
              </div>

              <div className="flex items-center gap-4 bg-white/90 p-3 rounded-xl border border-emerald-200/80">
                <img
                  src={scannedResult.student.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                  alt={scannedResult.student.nameKhmer}
                  referrerPolicy="no-referrer"
                  className="w-14 h-16 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h4 className="font-bold text-sm font-moul text-slate-900 truncate">
                      {scannedResult.student.nameKhmer}
                    </h4>
                    <span className="text-xs text-slate-500 font-times">
                      {scannedResult.student.nameLatin}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px]">
                      ថ្នាក់ទី {scannedResult.student.grade}{scannedResult.student.section}
                    </span>
                    <span>ភេទ៖ {scannedResult.student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</span>
                    <span>ថ្ងៃកំណើត៖ <strong className="font-times">{scannedResult.student.dob}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>អាណាព្យាបាល៖ {scannedResult.student.guardianName || scannedResult.student.fatherName || 'N/A'} ({scannedResult.student.guardianPhone || scannedResult.student.phone || 'N/A'})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for scanned student */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                {onShowQRCard && (
                  <button
                    onClick={() => {
                      if (scannedResult?.student) {
                        stopCamera();
                        onClose();
                        onShowQRCard(scannedResult.student);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>មើលកាត QR</span>
                  </button>
                )}

                {onAwardBadge && (
                  <button
                    onClick={() => {
                      if (scannedResult?.student) {
                        stopCamera();
                        onClose();
                        onAwardBadge(scannedResult.student);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>ផ្តល់ផ្លាកសញ្ញា</span>
                  </button>
                )}

                {onEditStudent && (
                  <button
                    onClick={() => {
                      if (scannedResult?.student) {
                        stopCamera();
                        onClose();
                        onEditStudent(scannedResult.student);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>កែប្រែ</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (scannedResult?.student) {
                      stopCamera();
                      onClose();
                      onSelectStudent(scannedResult.student);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>មើលប្រវត្តិរូបពេញលេញ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between rounded-b-3xl text-xs text-slate-500">
          <span>ប្រព័ន្ធស្កេនឆ្លាតវៃគាំទ្រទម្រង់កូដ QR គ្រប់ប្រភេទ</span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
