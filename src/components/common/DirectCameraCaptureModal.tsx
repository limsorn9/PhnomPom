import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCw,
  FlipHorizontal,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Crop,
  Timer,
  Zap,
  CheckCircle2,
  VideoOff
} from 'lucide-react';

interface DirectCameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob, dataUrl: string) => void;
  onOpenCropEditor?: (dataUrl: string) => void;
  title?: string;
  subtitle?: string;
  aspectRatio?: '3:4' | '1:1';
}

export const DirectCameraCaptureModal: React.FC<DirectCameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onOpenCropEditor,
  title = 'ថតរូបផ្ទាល់ពីកាមេរ៉ា (Camera Snapshot)',
  subtitle = 'ថតរូបភាពសិស្ស/គ្រូតាមខ្នាតស្តង់ដារ 3x4 សម្រាប់បណ្ណសិស្ស និងប្រវត្តិរូប',
  aspectRatio = '3:4'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isMirror, setIsMirror] = useState<boolean>(true);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [hasPermissionError, setHasPermissionError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [useCountdownTimer, setUseCountdownTimer] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Stop camera stream cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId?: string) => {
    setIsInitializing(true);
    setHasPermissionError(false);
    setErrorMessage('');
    stopStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }

      // Enumerate devices if not already done
      try {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devList.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
        if (!deviceId && videoDevs.length > 0) {
          const currentTrack = mediaStream.getVideoTracks()[0];
          const settings = currentTrack.getSettings();
          if (settings.deviceId) {
            setSelectedDeviceId(settings.deviceId);
          }
        }
      } catch (devErr) {
        console.warn('Cannot enumerate devices:', devErr);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermissionError(true);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('លោកអ្នកមិនទាន់បានអនុញ្ញាត (Allow) ឱ្យកម្មវិធីប្រើប្រាស់កាមេរ៉ាឡើយ។ សូមចុចលើរូបសោរនៅរបារ Browser ដើម្បីអនុញ្ញាត Camera។');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('រកមិនឃើញកាមេរ៉ា ឬ Webcam ភ្ជាប់ជាមួយឧបករណ៍នេះឡើយ។');
      } else {
        setErrorMessage('មិនអាចបើកកាមេរ៉ាបានទេ: ' + (err.message || 'កំហុសមិនស្គាល់'));
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  // Initialize camera on modal open
  useEffect(() => {
    if (isOpen) {
      setCapturedPhotoUrl(null);
      setCapturedBlob(null);
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Switch camera device
  const handleDeviceChange = (devId: string) => {
    setSelectedDeviceId(devId);
    startCamera(devId);
  };

  // Perform instant capture from video frame
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Determine 3:4 crop from video
    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 480;

    let targetW = 600;
    let targetH = 800; // 3:4
    if (aspectRatio === '1:1') {
      targetW = 600;
      targetH = 600;
    }

    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop calculation
    let srcW = videoW;
    let srcH = videoW * (targetH / targetW);
    if (srcH > videoH) {
      srcH = videoH;
      srcW = videoH * (targetW / targetH);
    }

    const srcX = (videoW - srcW) / 2;
    const srcY = (videoH - srcH) / 2;

    ctx.save();
    if (isMirror) {
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedBlob(blob);
        setCapturedPhotoUrl(dataUrl);
      }
    }, 'image/jpeg', 0.92);
  };

  // Trigger Snapshot with optional 3-second countdown
  const triggerCapture = () => {
    if (!useCountdownTimer) {
      takeSnapshot();
      return;
    }

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    if (!stream) {
      startCamera(selectedDeviceId);
    }
  };

  const handleConfirm = () => {
    if (capturedBlob && capturedPhotoUrl) {
      onCapture(capturedBlob, capturedPhotoUrl);
      stopStream();
      onClose();
    }
  };

  const handleOpenCrop = () => {
    if (capturedPhotoUrl && onOpenCropEditor) {
      stopStream();
      onOpenCropEditor(capturedPhotoUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-kantumruy">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden flex flex-col max-h-[95vh] animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-sm sm:text-base text-white">{title}</h3>
              <p className="text-xs text-blue-200 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950/60">
          {hasPermissionError ? (
            <div className="max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-center shadow-lg space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <VideoOff className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-base">
                  មិនអាចបើកកាមេរ៉ាបានទេ
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(selectedDeviceId)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ព្យាយាមម្ដងទៀត (Retry)</span>
                </button>
              </div>
            </div>
          ) : capturedPhotoUrl ? (
            /* Snapshot Preview Mode */
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-emerald-500 bg-black aspect-[3/4] max-h-[380px] w-auto">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ថតបានជោគជ័យ</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 text-center font-medium">
                រូបភាពត្រូវបានតម្រឹមតាមខ្នាតស្តង់ដារ 3x4 រួចរាល់។ លោកអ្នកអាចច្រឹបបន្ថែម ឬយល់ព្រមប្រើប្រាស់ភ្លាមៗ។
              </p>
            </div>
          ) : (
            /* Live Camera Stream Mode */
            <div className="relative flex flex-col items-center w-full">
              {/* Camera Frame Container with 3:4 Aspect Ratio Guide */}
              <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-slate-700 group flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isMirror ? 'scale-x-[-1]' : ''}`}
                />

                {/* 3:4 Passport Head/Face Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* Face Oval Silhouette */}
                  <div className="w-[62%] h-[68%] border-2 border-dashed border-white/70 rounded-[50%/60%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] relative flex items-center justify-center">
                    {/* Crosshair Center */}
                    <div className="w-3 h-0.5 bg-white/60 absolute" />
                    <div className="h-3 w-0.5 bg-white/60 absolute" />
                    {/* Eye line reference */}
                    <div className="w-full h-0.5 border-t border-dotted border-white/40 absolute top-[40%]" />
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    សូមដាក់ផ្ទៃមុខឱ្យចំរង្វង់រាងពងក្រពើ
                  </span>
                </div>

                {/* Countdown display */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-extrabold shadow-2xl animate-ping">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Loading indicator during start */}
                {isInitializing && (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white space-y-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="text-xs font-bold">កំពុងបើកកាមេរ៉ា...</span>
                  </div>
                )}
              </div>

              {/* Camera Controls bar */}
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap w-full">
                {/* Mirror Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMirror(!isMirror)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isMirror
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="ឆ្លុះរូបភាព (Mirror)"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>ឆ្លុះ (Mirror)</span>
                </button>

                {/* 3s Timer Toggle */}
                <button
                  type="button"
                  onClick={() => setUseCountdownTimer(!useCountdownTimer)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    useCountdownTimer
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="កំណត់ម៉ោងរាប់ថយក្រោយ ៣ វិនាទី"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>រាប់ ៣វិ.</span>
                </button>

                {/* Device Selector */}
                {devices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    {devices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId}>
                        {dev.label || `កាមេរ៉ា ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {capturedPhotoUrl ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ថតឡើងវិញ (Retake)</span>
              </button>

              <div className="flex items-center gap-2">
                {onOpenCropEditor && (
                  <button
                    type="button"
                    onClick={handleOpenCrop}
                    className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                  >
                    <Crop className="w-4 h-4" />
                    <span className="hidden sm:inline">ច្រឹប/តម្រឹម</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>យល់ព្រមប្រើប្រាស់រូបនេះ</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                បោះបង់
              </button>

              <button
                type="button"
                disabled={hasPermissionError || isInitializing || countdown !== null}
                onClick={triggerCapture}
                className="flex-1 max-w-xs mx-auto py-3 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <Camera className="w-5 h-5" />
                <span>{useCountdownTimer ? 'ចាប់ផ្ដើមរាប់ថត (Snap in 3s)' : 'ចុចថតរូបភ្លាមៗ (Capture)'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
