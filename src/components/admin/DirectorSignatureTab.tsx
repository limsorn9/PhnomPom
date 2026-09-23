import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Upload, Trash2, Edit3, X, MousePointer2 } from 'lucide-react';

export const DirectorSignatureTab: React.FC = () => {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('directorSignatureUrl');
    if (saved) setSignatureUrl(saved);
  }, []);

  const handleDelete = () => {
    localStorage.removeItem('directorSignatureUrl');
    setSignatureUrl(null);
  };

  const handleSave = (url: string) => {
    localStorage.setItem('directorSignatureUrl', url);
    setSignatureUrl(url);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm text-center font-sans">
      <h2 className="text-lg font-bold text-slate-800 mb-1 font-kantumruy">ហត្ថលេខា</h2>
      <p className="text-xs text-slate-500 mb-6 font-kantumruy">ហត្ថលេខារបស់អ្នកនឹងបញ្ចូលក្នុងរបាយការណ៍ដែលអ្នកចុះហត្ថលេខា។</p>

      {signatureUrl ? (
        <div className="max-w-xl mx-auto mb-6">
          <div className="border-2 border-slate-200 rounded-2xl p-8 bg-slate-50/50 flex flex-col items-center justify-center relative group">
            <img src={signatureUrl} alt="Director Signature" className="h-20 object-contain" />
            <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-2xl backdrop-blur-[1px]">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition font-kantumruy"
              >
                <Edit3 className="w-4 h-4" />
                ផ្លាស់ប្ដូរ
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition font-kantumruy"
              >
                <Trash2 className="w-4 h-4" />
                លុបហត្ថលេខា
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50/50 flex flex-col items-center justify-center max-w-xl mx-auto mb-6">
          <PenTool className="w-10 h-10 text-slate-400 mb-2" />
          <p className="text-sm text-slate-500 mt-2 font-kantumruy">មិនទាន់មានហត្ថលេខានៅឡើយទេ។</p>
        </div>
      )}

      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-sm inline-flex items-center gap-2 text-sm font-kantumruy"
      >
        <PenTool className="w-4 h-4" />
        {signatureUrl ? 'ផ្លាស់ប្ដូរហត្ថលេខា' : 'បន្ថែមហត្ថលេខា'}
      </button>
      <p className="text-[11px] text-slate-400 mt-3 max-w-md mx-auto font-kantumruy leading-relaxed">
        គូរដោយប្រើកណ្តុរ ឬម្រាមដៃ ឬផ្ទុកឡើងរូបថតហត្ថលេខារបស់អ្នក។ ផ្ទៃខាងក្រោយនឹងត្រូវលុបចេញដោយស្វ័យប្រវត្តិ។
      </p>

      {isModalOpen && (
        <SignatureModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

const SignatureModal: React.FC<{ onClose: () => void, onSave: (url: string) => void }> = ({ onClose, onSave }) => {
  const [tab, setTab] = useState<'draw' | 'upload'>('draw');
  
  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && tab === 'draw') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [tab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    // Basic check if blank by comparing to empty canvas (simplified)
    onSave(dataUrl);
  };

  // Upload state
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSave(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-kantumruy text-left">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800">បន្ថែមហត្ថលេខា</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setTab('draw')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${tab === 'draw' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <MousePointer2 className="w-4 h-4" />
              ✍️ គូរហត្ថលេខា
            </button>
            <button 
              onClick={() => setTab('upload')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${tab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Upload className="w-4 h-4" />
              📤 ផ្ទុកឡើងរូបភាព
            </button>
          </div>

          {tab === 'draw' ? (
            <div>
              <div className="border border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden h-48 cursor-crosshair touch-none">
                <canvas 
                  ref={canvasRef}
                  width={450} 
                  height={190}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full block"
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-slate-500">គូរហត្ថលេខារបស់អ្នកនៅទីនេះ</p>
                <button onClick={clearCanvas} className="text-xs font-medium text-slate-500 hover:text-slate-800 underline">
                  សម្អាត (Clear)
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition relative">
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-blue-500 mb-3" />
              <p className="text-sm font-medium text-slate-700">ជ្រើសរើសរូបថតហត្ថលេខា</p>
              <p className="text-xs text-slate-500 mt-1">ទម្រង់ PNG ដែលមានផ្ទៃថ្លា (Transparent)</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition"
          >
            បោះបង់
          </button>
          {tab === 'draw' && (
            <button 
              onClick={handleSaveDraw}
              className="bg-[#2563eb] hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-sm"
            >
              រក្សាទុកហត្ថលេខា
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
