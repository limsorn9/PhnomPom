import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Sun,
  Contrast,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface PhotoCropAndAlignModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onConfirmCrop: (blob: Blob, dataUrl: string) => void;
  title?: string;
  defaultAspectRatio?: '3:4' | '1:1' | 'free';
}

export const PhotoCropAndAlignModal: React.FC<PhotoCropAndAlignModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onConfirmCrop,
  title = 'ច្រឹប និងតម្រឹមកែសម្រួលរូបថត (Crop & Adjust)',
  defaultAspectRatio = '3:4'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [aspectRatio, setAspectRatio] = useState<'3:4' | '1:1' | 'free'>(defaultAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);

  // Dragging / Panning State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load Image
  useEffect(() => {
    if (imageSrc && isOpen) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        resetTransform();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, isOpen]);

  // Reset transforms to centered default
  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setIsFlipped(false);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
  }, []);

  // Smart Auto-Center & Fit
  const handleAutoCenter = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    // Calculate aspect difference
    const imgAspect = img.width / img.height;
    let targetAspect = 3 / 4;
    if (aspectRatio === '1:1') targetAspect = 1;

    // Slight smart zoom to fill portrait frame nicely
    if (imgAspect > targetAspect) {
      setZoom(1.15);
    } else {
      setZoom(1.05);
    }
    setPan({ x: 0, y: -img.height * 0.05 }); // slightly higher to center head
    setRotation(0);
    setIsFlipped(false);
  };

  // Render Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Target dimensions
    let outW = 600;
    let outH = 800; // 3:4
    if (aspectRatio === '1:1') {
      outW = 600;
      outH = 600;
    }

    canvas.width = outW;
    canvas.height = outH;

    // Clear
    ctx.clearRect(0, 0, outW, outH);

    // Apply Filter adjustments
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    ctx.save();
    // Center point
    ctx.translate(outW / 2 + pan.x, outH / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    if (isFlipped) {
      ctx.scale(-1, 1);
    }
    ctx.scale(zoom, zoom);

    // Calculate base draw size preserving natural ratio
    const imgAspect = img.width / img.height;
    let drawW = outW;
    let drawH = outW / imgAspect;
    if (drawH < outH) {
      drawH = outH;
      drawW = outH * imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [aspectRatio, zoom, rotation, isFlipped, pan, brightness, contrast]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse & Touch Pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ ...pan });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan({
      x: panStart.x + dx,
      y: panStart.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          onConfirmCrop(blob, dataUrl);
          onClose();
        }
      },
      'image/jpeg',
      0.9
    );
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-kantumruy">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh] animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-sm sm:text-base text-white">{title}</h3>
              <p className="text-xs text-blue-200 mt-0.5">អូសដើម្បីផ្លាស់ទី និងពង្រីក/បង្រួមតម្រឹមមុខសិស្ស</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Workspace Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950/70">
          {/* Main Visual Viewport */}
          <div className="relative flex flex-col items-center">
            {/* Canvas Container with Frame Guides */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-900 cursor-grab active:cursor-grabbing select-none touch-none flex items-center justify-center ${
                aspectRatio === '3:4' ? 'w-[280px] sm:w-[320px] h-[373px] sm:h-[426px]' : 'w-[280px] sm:w-[320px] h-[280px] sm:h-[320px]'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Passport Silhouette Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                <div className="w-[64%] h-[70%] border-2 border-dashed border-white/60 rounded-[50%/60%] relative flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
                  <div className="w-2.5 h-0.5 bg-white/60 absolute" />
                  <div className="h-2.5 w-0.5 bg-white/60 absolute" />
                </div>
              </div>

              {/* Helper tip */}
              <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                <span className="text-[10px] font-bold text-white/90 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                  អូសរូបភាពដើម្បីតម្រឹមមុខ
                </span>
              </div>
            </div>

            {/* Quick Preset Ratios & Auto Align */}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setAspectRatio('3:4')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  aspectRatio === '3:4'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                ៣:៤ (បណ្ណសិស្ស)
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  aspectRatio === '1:1'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                ១:១ (Avatar ការ៉េ)
              </button>

              <button
                type="button"
                onClick={handleAutoCenter}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>★ តម្រឹមស្វ័យប្រវត្តិ</span>
              </button>

              <button
                type="button"
                onClick={resetTransform}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1"
                title="កំណត់ឡើងវិញ"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>កំណត់ឡើងវិញ</span>
              </button>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="w-full max-w-md mt-4 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Transform Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90) % 360)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  title="បង្វិលឆ្វេង ៩០°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  title="បង្វិលស្ដាំ ៩០°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isFlipped
                      ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="ឆ្លុះផ្តេក (Flip)"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAdjustments(!showAdjustments)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  showAdjustments
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ពន្លឺ/កម្រិតពណ៌</span>
              </button>
            </div>

            {/* Brightness & Contrast Subpanel */}
            {showAdjustments && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="w-14 text-slate-600 dark:text-slate-300 font-semibold">ពន្លឺ៖</span>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <span className="w-8 text-right font-bold text-slate-700 dark:text-slate-300">{brightness}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <Contrast className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="w-14 text-slate-600 dark:text-slate-300 font-semibold">កម្រិតពណ៌៖</span>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500 cursor-pointer"
                  />
                  <span className="w-8 text-right font-bold text-slate-700 dark:text-slate-300">{contrast}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>យល់ព្រម និងរក្សាទុក (Save Crop)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
