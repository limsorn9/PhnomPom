import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { Student, DailyAttendanceRecord, QRScanVerificationLog } from '../types';
import { useSchool } from '../context/SchoolContext';
import { cacheStudentProgressReport } from '../services/offlineSyncService';
import { parseAndVerifyPrincipalSignatureQR } from '../utils/reportCardSignatureQR';
import {
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Users,
  Award,
  Phone,
  Eye,
  ShieldCheck,
  Check,
  FileCheck,
  AlertTriangle,
  QrCode,
  Laptop
} from 'lucide-react';

interface WebcamQRScannerModalProps {
  onClose: () => void;
  onSelectStudentForDetail?: (student: Student) => void;
}

interface ScannedHistoryItem {
  student: Student;
  scannedAt: string;
  attendanceStatus: 'present' | 'late' | 'excused';
}

export const WebcamQRScannerModal: React.FC<WebcamQRScannerModalProps> = ({
  onClose,
  onSelectStudentForDetail
}) => {
  const {
    students,
    dailyAttendance,
    markDailyAttendance,
    schoolProfile,
    showToast,
    addActivityLog,
    currentUser,
    getStudentBadges,
    getStudentTotalPoints,
    addQRScanVerificationLog
  } = useSchool();

  // Video & Stream State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isMuted, setIsMuted] = useState(false);
  const [autoTakeAttendance, setAutoTakeAttendance] = useState(true);

  // Scan detection state
  const [isScanning, setIsScanning] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [currentScannedStudent, setCurrentScannedStudent] = useState<Student | null>(null);
  const [signatureVerificationResult, setSignatureVerificationResult] = useState<{
    log: Omit<QRScanVerificationLog, 'id' | 'scannedAt'>;
    isExpired: boolean;
    isValid: boolean;
    rawPayload?: any;
  } | null>(null);
  const [scanCooldown, setScanCooldown] = useState(false);
  const [recentScans, setRecentScans] = useState<ScannedHistoryItem[]>([]);

  // Web Audio Beep Feedback
  const playBeep = useCallback((success = true) => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = success ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(success ? 880 : 300, audioCtx.currentTime); // A5 or Low Error
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
      console.warn('Audio feedback failed:', e);
    }
  }, [isMuted]);

  // Start Webcam Stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setHasCameraPermission(true);
      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to access webcam:', err);
      setHasCameraPermission(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'សូមផ្តល់សិទ្ធិប្រើប្រាស់ Camera (Webcam Permission) ក្នុង Browser របស់អ្នកដើម្បីស្កេន QR Code'
          : 'មិនអាចបើក Camera បានទេ សូមពិនិត្យមើលឧបករណ៍ភ្ជាប់ ឬជ្រើសរើស Camera ផ្សេង'
      );
    }
  }, [facingMode]);

  // Stop Webcam Stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Handle successful match of student
  const handleStudentFound = useCallback((student: Student, rawCode: string) => {
    setCurrentScannedStudent(student);
    setLastScannedCode(rawCode);
    playBeep(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('km-KH');

    if (autoTakeAttendance) {
      // Rapid Check-in Attendance
      markDailyAttendance(
        student.grade,
        student.section,
        todayStr,
        student.id,
        'present',
        `ស្កេនតាម QR Badge (${nowTimeStr})`
      );

      // Audit Log
      addActivityLog({
        domain: 'student',
        actionType: 'attendance',
        title: `សិស្ស ${student.nameKhmer} បាន Check-in វត្តមានតាម QR`,
        description: `ស្កេន QR Code អត្តលេខ ${student.code} • ថ្នាក់ទី ${student.grade}${student.section} វេលាម៉ោង ${nowTimeStr}`,
        entityId: student.id,
        entityCode: student.code,
        entityName: student.nameKhmer,
        actorName: currentUser?.nameKhmer || 'ប្រព័ន្ធស្កេន QR ស្វ័យប្រវត្តិ',
        actorRole: currentUser?.role === 'director' ? 'នាយកសាលា' : 'គ្រូបង្រៀន',
        tags: ['QR Scanner', 'វត្តមានស្វ័យប្រវត្តិ']
      });

      // Add to session history
      setRecentScans(prev => [
        {
          student,
          scannedAt: nowTimeStr,
          attendanceStatus: 'present'
        },
        ...prev.slice(0, 19)
      ]);

      showToast(`សិស្ស ${student.nameKhmer} (ថ្នាក់ទី ${student.grade}${student.section}) បានកត់ត្រាវត្តមាន «វត្តមាន» ជោគជ័យ!`);
    } else {
      // Just preview
      showToast(`បានស្វែងរកឃើញសិស្ស៖ ${student.nameKhmer} (${student.code})`);
    }

    // Cooldown to avoid multi-trigger on same frame
    setScanCooldown(true);
    setTimeout(() => {
      setScanCooldown(false);
    }, 1800);
  }, [autoTakeAttendance, markDailyAttendance, addActivityLog, currentUser, playBeep, showToast]);

  // Scan frame loop using jsQR
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && !scanCooldown) {
        const raw = code.data.trim();

        // Check if raw is a Principal Digital Signature QR
        const isSigPayload =
          raw.includes('MOEYS-SIG-') ||
          raw.includes('report_card_signature') ||
          raw.includes('principalSignature') ||
          raw.includes('sigRef') ||
          raw.includes('moeys_sig');

        if (isSigPayload) {
          const verification = parseAndVerifyPrincipalSignatureQR(raw, students, schoolProfile);
          addQRScanVerificationLog({
            ...verification.logEntry,
            verifierName: currentUser?.nameKhmer || 'អ្នកប្រើប្រាស់បច្ចុប្បន្ន',
            verifierRole: currentUser?.role === 'director' ? 'នាយកសាលា' : 'គ្រូបង្រៀន/បុគ្គលិក',
            scanMethod: 'webcam_scanner'
          });

          setSignatureVerificationResult({
            log: verification.logEntry,
            isExpired: verification.isExpired,
            isValid: verification.isValid,
            rawPayload: verification.payload
          });

          if (verification.student) {
            setCurrentScannedStudent(verification.student);
          }

          if (verification.isValid) {
            playBeep(true);
            showToast(`QR ហត្ថលេខានាយកមានសុពលភាពត្រឹមត្រូវ (${verification.logEntry.studentNameKhmer})`, 'success');
          } else if (verification.isExpired) {
            playBeep(false);
            showToast(`ការព្រមាន៖ QR ហត្ថលេខានេះបានផុតកំណត់សុពលភាពហើយ!`, 'error');
          } else {
            playBeep(false);
            showToast(`ការព្រមាន៖ QR ហត្ថលេខាមិនត្រឹមត្រូវ ឬមានការកែប្រែទិន្នន័យ!`, 'error');
          }

          setScanCooldown(true);
          setTimeout(() => setScanCooldown(false), 2500);
          return;
        }

        // 1. Try to find student by direct code (e.g. STU-2024-001 or 101)
        let found = students.find(
          s => s.code.toLowerCase() === raw.toLowerCase() || s.id === raw
        );

        // 2. If raw data is JSON, parse and match
        if (!found && (raw.startsWith('{') || raw.startsWith('['))) {
          try {
            const parsed = JSON.parse(raw);
            const targetCode = parsed.code || parsed.studentCode || parsed.id;
            if (targetCode) {
              found = students.find(
                s => s.code.toLowerCase() === String(targetCode).toLowerCase() || s.id === targetCode
              );
            }
          } catch (e) {
            // Not json, ignore
          }
        }

        if (found) {
          handleStudentFound(found, raw);
        } else {
          // Unrecognized code
          playBeep(false);
          setScanCooldown(true);
          showToast(`QR Code «${raw}» មិនត្រូវគ្នានឹងទិន្នន័យសិស្សណាម្នាក់ក្នុងសាលាទេ!`, 'error');
          setTimeout(() => setScanCooldown(false), 2000);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  }, [isScanning, scanCooldown, students, schoolProfile, currentUser, addQRScanVerificationLog, handleStudentFound, playBeep, showToast]);

  // Lifecycle
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (hasCameraPermission && isScanning) {
      animationFrameRef.current = requestAnimationFrame(scanLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasCameraPermission, isScanning, scanLoop]);

  // Manual Attendance Action for Current Student
  const handleManualAttendance = (status: 'present' | 'late' | 'absent_permission') => {
    if (!currentScannedStudent) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('km-KH');

    markDailyAttendance(
      currentScannedStudent.grade,
      currentScannedStudent.section,
      todayStr,
      currentScannedStudent.id,
      status,
      `កត់ត្រាផ្ទាល់ (${nowTimeStr})`
    );

    setRecentScans(prev => [
      {
        student: currentScannedStudent,
        scannedAt: nowTimeStr,
        attendanceStatus: status === 'absent_permission' ? 'excused' : status
      },
      ...prev.filter(i => i?.student?.id && i.student.id !== currentScannedStudent.id).slice(0, 19)
    ]);

    showToast(`បានកត់ត្រាវត្តមានសិស្ស ${currentScannedStudent.nameKhmer}៖ ${status === 'present' ? 'វត្តមាន' : status === 'late' ? 'មកយឺត' : 'សុំច្បាប់'}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-battambang">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-moul tracking-wide text-white">
                  ម៉ាស៊ីនស្កេន QR កាតសិស្ស & កត់ត្រាវត្តមាន (Webcam QR Scanner)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Camera
                </span>
              </div>
              <p className="text-xs text-blue-200">
                ស្កេនប័ណ្ណសិស្ស QR លើកាត ឬតារាងក្រឡា ដើម្បី Check-in វត្តមាន និងផ្ទៀងផ្ទាត់ព័ត៌មានភ្លាមៗ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              title={isMuted ? 'បើកសំឡេង Beep' : 'បិទសំឡេង Beep'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
              }}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              title="ប្តូរមុខកាមេរ៉ា (Front/Back)"
            >
              <RefreshCw className="w-4 h-4 text-blue-300" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50">
          {/* Left Column: Camera Viewfinder */}
          <div className="lg:col-span-7 space-y-4">
            {/* Camera Box */}
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-xl aspect-4/3 flex items-center justify-center border-4 border-slate-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Target Frame */}
                <div
                  className={`w-64 h-64 sm:w-72 sm:h-72 border-2 rounded-3xl relative transition-all duration-300 ${
                    scanCooldown
                      ? 'border-emerald-400 scale-105 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                      : 'border-blue-400/80'
                  }`}
                >
                  {/* Corner brackets */}
                  <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

                  {/* Laser Sweeper Animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_12px_#38bdf8] top-1/2 -translate-y-1/2" />
                </div>

                <p className="mt-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                  ដាក់ QR Code កាតសិស្សក្នុងប្រអប់ដើម្បីស្កេន
                </p>
              </div>

              {/* Permission / Error Banner */}
              {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center text-white space-y-3 z-20">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold font-moul text-sm">មិនអាចភ្ជាប់ Camera បានទេ</h4>
                  <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                    {cameraError || 'សូមពិនិត្យមើលសិទ្ធិប្រើប្រាស់ Camera ក្នុងកម្មវិធីរុករក Browser'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    ព្យាយាមភ្ជាប់ម្តងទៀត
                  </button>
                </div>
              )}
            </div>

            {/* Quick Mode Toggles */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-900">របៀប Check-in ស្វ័យប្រវត្តិកំពូលលឿន៖</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoTakeAttendance(true)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    autoTakeAttendance
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  បើកស្វ័យប្រវត្តិ (Auto-Take)
                </button>
                <button
                  type="button"
                  onClick={() => setAutoTakeAttendance(false)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    !autoTakeAttendance
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ផ្ទៀងផ្ទាត់ដោយដៃ (Manual)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Scanned Student Details, Digital Signature Seal, & Session History */}
          <div className="lg:col-span-5 space-y-4">
            {/* Digital Signature QR Verification Box */}
            {signatureVerificationResult && (
              <div
                className={`rounded-3xl p-5 border-2 shadow-lg relative overflow-hidden ${
                  signatureVerificationResult.isValid
                    ? 'bg-gradient-to-b from-emerald-50/90 to-white border-emerald-300 shadow-emerald-500/10'
                    : signatureVerificationResult.isExpired
                    ? 'bg-gradient-to-b from-amber-50/90 to-white border-amber-300 shadow-amber-500/10'
                    : 'bg-gradient-to-b from-rose-50/90 to-white border-rose-300 shadow-rose-500/10'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        signatureVerificationResult.isValid
                          ? 'bg-emerald-600 text-white'
                          : signatureVerificationResult.isExpired
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold font-moul text-xs text-slate-900">
                        ផ្ទៀងផ្ទាត់ហត្ថលេខាឌីជីថល
                      </h4>
                      <p className="text-[10px] text-slate-500 font-times">
                        {signatureVerificationResult.log.signatureRef}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      signatureVerificationResult.isValid
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : signatureVerificationResult.isExpired
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {signatureVerificationResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        សុពលភាពត្រឹមត្រូវ
                      </>
                    ) : signatureVerificationResult.isExpired ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        ផុតកំណត់សុពលភាព
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        មិនត្រឹមត្រូវ / ក្លែងបន្លំ
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-2xl border border-slate-200/60 mb-3">
                  {signatureVerificationResult.log.statusReason}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">នាយកសាលាចុះហត្ថលេខា៖</span>
                    <span className="font-bold text-slate-800">{signatureVerificationResult.log.principalName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ថ្ងៃចេញ / ថ្ងៃផុតកំណត់៖</span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {signatureVerificationResult.log.issueDate} ➔{' '}
                      <span className={signatureVerificationResult.isExpired ? 'text-rose-600 font-black' : 'text-emerald-700'}>
                        {signatureVerificationResult.log.expiresAt}
                      </span>
                    </span>
                  </div>
                  {signatureVerificationResult.log.averageScore !== undefined && (
                    <div>
                      <span className="text-[10px] text-slate-400 block">ពិន្ទុមធ្យមភាគ / ចំណាត់ថ្នាក់៖</span>
                      <span className="font-bold text-indigo-700">
                        {signatureVerificationResult.log.averageScore.toFixed(2)} ពិន្ទុ (លេខ {signatureVerificationResult.log.rank || '-'})
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 block">ឧបករណ៍ស្កេន៖</span>
                    <span className="font-semibold text-slate-600 text-[11px] flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-slate-400" />
                      {signatureVerificationResult.log.deviceInfo.deviceType} ({signatureVerificationResult.log.deviceInfo.browser})
                    </span>
                  </div>
                </div>

                {signatureVerificationResult.isExpired && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">តម្រូវការបង្កើតឯកសារឡើងវិញ៖</span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        ព្រឹត្តិបត្រពិន្ទុចាស់នេះបានផុតកំណត់ដើម្បីការពារសុវត្ថិភាព។ សូមចូលទៅកាន់ទំព័រ «ព្រឹត្តិបត្រពិន្ទុ & QR» ដើម្បីជ្រើសរើសសិស្ស និងបោះពុម្ពជាថ្មីជាមួយនឹងកាលបរិច្ឆេទសុពលភាពថ្មី។
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Student Profile Card */}
            {currentScannedStudent ? (
              <div className="bg-white rounded-3xl p-5 border-2 border-indigo-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ស្កេនជោគជ័យ
                  </span>
                  <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {currentScannedStudent.code}
                  </span>
                </div>

                <div className="flex gap-4 items-start">
                  <img
                    src={currentScannedStudent.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                    alt={currentScannedStudent.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-18 h-22 object-cover rounded-2xl border-2 border-slate-200 shadow-xs flex-shrink-0"
                  />

                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold font-moul text-base text-slate-900">
                      {currentScannedStudent.nameKhmer}
                    </h4>
                    <p className="text-xs font-times text-slate-600">
                      {currentScannedStudent.nameLatin || 'N/A'} • ភេទ {currentScannedStudent.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                    </p>
                    <div className="pt-1 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded font-bold">
                        ថ្នាក់ទី {currentScannedStudent.grade}{currentScannedStudent.section}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-times">
                        {currentScannedStudent.dob}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Info Box */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">អាណាព្យាបាល៖</span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {currentScannedStudent.guardianName || currentScannedStudent.fatherName || 'អាណាព្យាបាល'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ទូរស័ព្ទ៖</span>
                    <span className="font-bold font-times text-slate-800 text-[11px]">
                      {currentScannedStudent.guardianPhone || currentScannedStudent.phone || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => handleManualAttendance('present')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>វត្តមាន</span>
                  </button>
                  <button
                    onClick={() => handleManualAttendance('late')}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>មកយឺត</span>
                  </button>
                  <button
                    onClick={() => handleManualAttendance('absent_permission')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all"
                  >
                    ច្បាប់
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold font-moul text-sm text-slate-800">
                  មិនទាន់មានទិន្នន័យស្កេននៅឡើយ
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  សូមលើកប័ណ្ណ QR កាតសិស្ស ឬតារាង QR មកជិត Camera ដើម្បីពិនិត្យ ឬ Check-in វត្តមាន
                </p>
              </div>
            )}

            {/* Session Scanned History */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold font-moul text-xs text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>ប្រវត្តិស្កេនក្នុងវគ្គនេះ ({recentScans.length})</span>
                </h4>
                {recentScans.length > 0 && (
                  <button
                    onClick={() => setRecentScans([])}
                    className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold"
                  >
                    សម្អាតបញ្ជី
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {recentScans.length > 0 ? (
                  recentScans.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.student.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                          alt={item.student.nameKhmer}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-300 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.student.nameKhmer}</p>
                          <p className="text-[10px] text-slate-500 font-times">
                            {item.student.code} • ថ្នាក់ទី {item.student.grade}{item.student.section}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.attendanceStatus === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.attendanceStatus === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.attendanceStatus === 'present' ? 'វត្តមាន' : item.attendanceStatus === 'late' ? 'មកយឺត' : 'ច្បាប់'}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-times mt-0.5">{item.scannedAt}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-xs text-slate-400">
                    មិនទាន់មានកំណត់ត្រាស្កេនក្នុងវគ្គនេះទេ
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
