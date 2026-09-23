import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, Volume2, VolumeX, AlertCircle, Sparkles, LogIn, Upload, Loader2, QrCode } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { parseQRScanData } from '../utils/qrAuthService';

interface QRLoginScannerModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const QRLoginScannerModal: React.FC<QRLoginScannerModalProps> = ({ onClose, onSuccess }) => {
  const { loginByVerifiedIdentifier, students, teachers, appUsers, showToast } = useSchool();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraStarted, setCameraStarted] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);

  // Web Audio Beep Feedback
  const playBeep = useCallback((success = true) => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = success ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(success ? 880 : 300, audioCtx.currentTime);
      if (success) {
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
      }

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context might be restricted
    }
  }, [isMuted]);

  // Execute actual QR login
  const handlePerformQRLogin = useCallback((rawCodeOrUrl: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const payload = parseQRScanData(rawCodeOrUrl);
    if (!payload || !payload.code) {
      playBeep(false);
      showToast('⚠️ មិនអាចស្គាល់ទិន្នន័យ QR Code នេះឡើយ! សូមពិនិត្យមើលកាតឡើងវិញ។', 'error');
      setIsProcessing(false);
      return;
    }

    playBeep(true);
    setScannedResult(payload);

    // Try logging in by identifier (student code, staff code, or ID)
    const loginResult = loginByVerifiedIdentifier(payload.code);
    if (loginResult && loginResult.success) {
      showToast(`🎉 ស្កេនជោគជ័យ! បានចូលគណនី «${loginResult.user?.nameKhmer || payload.nameKhmer || payload.code}» ដោយស្វ័យប្រវត្តិ`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      // If user record wasn't found directly, try searching student or teacher array
      const matchedStudent = students.find(s => s.code.toLowerCase() === payload.code.toLowerCase() || s.id === payload.id);
      const matchedTeacher = teachers.find(t => (t.staffCode && t.staffCode.toLowerCase() === payload.code.toLowerCase()) || t.id === payload.id);

      if (matchedStudent) {
        const studentLogin = loginByVerifiedIdentifier(matchedStudent.code);
        if (studentLogin.success) {
          showToast(`🎉 ស្កេនជោគជ័យ! បានចូលគណនីសិស្ស «${matchedStudent.nameKhmer}» (${matchedStudent.code})`, 'success');
          if (onSuccess) onSuccess();
          onClose();
          return;
        }
      } else if (matchedTeacher) {
        const teacherLogin = loginByVerifiedIdentifier(matchedTeacher.staffCode || matchedTeacher.email || matchedTeacher.phone);
        if (teacherLogin.success) {
          showToast(`🎉 ស្កេនជោគជ័យ! បានចូលគណនីគ្រូ «${matchedTeacher.nameKhmer}»`, 'success');
          if (onSuccess) onSuccess();
          onClose();
          return;
        }
      }

      showToast(`រកមិនឃើញគណនីដែលត្រូវគ្នានឹងលេខកូដ «${payload.code}» ឡើយ!`, 'error');
      setIsProcessing(false);
    }
  }, [isProcessing, playBeep, loginByVerifiedIdentifier, students, teachers, showToast, onSuccess, onClose]);

  // Video scanning tick loop
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (qrCode && qrCode.data) {
      handlePerformQRLogin(qrCode.data);
      return; // Stop animation loop once recognized
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [handlePerformQRLogin]);

  // Start Camera Stream only when user has confirmed
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    if (!cameraStarted) {
      return;
    }

    const startCamera = async () => {
      try {
        setCameraError(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('ឧបករណ៍នេះមិនគាំទ្រការប្រើប្រាស់កាមេរ៉ាតាម Browser ទេ');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setHasCameraPermission(true);
          animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
        }
      } catch (err: any) {
        console.error('Camera init error:', err);
        setHasCameraPermission(false);
        setCameraError(err.message || 'មិនអាចបើកកាមេរ៉ាបានទេ! សូមពិនិត្យសិទ្ធិអនុញ្ញាតកាមេរ៉ា។');
      }
    };

    startCamera();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStarted, facingMode, scanVideoFrame]);

  // Handle uploaded QR image file
  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
          if (qrCode && qrCode.data) {
            handlePerformQRLogin(qrCode.data);
          } else {
            showToast('⚠️ រកមិនឃើញ QR Code នៅក្នុងរូបភាពនេះឡើយ!', 'error');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-moul leading-tight">ស្កេន Smart QR ដើម្បីចូលគណនី</h3>
              <p className="text-[10px] text-blue-200">សម្រាប់សិស្សានុសិស្ស និងលោកគ្រូ-អ្នកគ្រូ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        {!cameraStarted ? (
          <div className="p-6 bg-slate-50 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold font-moul text-slate-900">
                ជ្រើសរើសវិធីសាស្ត្រស្កេន QR Code
              </h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                លោកអ្នកអាចបើកកាមេរ៉ាស្កេនផ្ទាល់ ឬជ្រើសរើសស្កេនពីរូបភាពកាត QR ដែលបានរក្សាទុកក្នុងឧបករណ៍
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCameraStarted(true)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>បើកកាមេរ៉ាស្កេនផ្ទាល់ (Turn on Camera)</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleUploadImageFile}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-purple-600" />
                <span>ស្កេនរូបភាពកាត QR ពីម៉ាស៊ីន (Upload QR Image)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-bold transition-colors cursor-pointer"
              >
                បោះបង់ / ត្រឡប់ក្រោយ
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Video Viewport / Scanner */}
            <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanner Overlay Box */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-blue-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  {/* Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                  {/* Scanning laser beam animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#60a5fa] animate-bounce duration-1000 mt-20" />
                </div>
              </div>

              {/* Loading Indicator when verifying */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-20">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-xs font-bold font-moul">កំពុងផ្ទៀងផ្ទាត់ និងចូលគណនី...</p>
                </div>
              )}

              {/* Camera Error Message */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <button
                    onClick={() => setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>ព្យាយាមម្តងទៀត</span>
                  </button>
                </div>
              )}
            </div>

            {/* Controls and Upload Option */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>ប្តូរកាមេរ៉ា ({facingMode === 'environment' ? 'ក្រោយ' : 'មុខ'})</span>
                </button>

                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isMuted ? 'បិទសំឡេង' : 'បើកសំឡេង'}</span>
                </button>
              </div>

              <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImageFile}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span>បញ្ចូលរូបភាពកាត QR (Upload Image)</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500">
                💡 បង្ហាញកាតសិស្ស ឬកាតគ្រូនៅចំពោះមុខកាមេរ៉ាដើម្បីចូលប្រើភ្លាមៗដោយមិនបាច់វាយលេខសម្ងាត់ឡើយ។
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
