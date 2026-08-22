import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { PrintSettings } from '../types';
import {
  Printer,
  X,
  CheckSquare,
  Square,
  FileText,
  Sliders,
  Sparkles,
  ShieldCheck,
  Feather
} from 'lucide-react';
import { AngkorPageWatermark, MoEYSRoyalHeader } from './AngkorMotif';

interface UniversalPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleKhmer: string;
  documentSubtitle?: string;
  onConfirmPrint?: () => void;
}

export const UniversalPrintModal: React.FC<UniversalPrintModalProps> = ({
  isOpen,
  onClose,
  titleKhmer,
  documentSubtitle,
  onConfirmPrint
}) => {
  const { printSettings, setPrintSettings, schoolProfile, currentUser } = useSchool();

  if (!isOpen) return null;

  const handleToggle = (key: keyof PrintSettings) => {
    setPrintSettings(prev => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };
      if (key === 'showRoundStamp' || key === 'includeRoundStamp') {
        updated.showRoundStamp = nextVal;
        updated.includeRoundStamp = nextVal;
      }
      if (key === 'showDirectorSignature' || key === 'includeDirectorSignature') {
        updated.showDirectorSignature = nextVal;
        updated.includeDirectorSignature = nextVal;
      }
      if (key === 'showDirectorRedName' || key === 'redDirectorName') {
        updated.showDirectorRedName = nextVal;
        updated.redDirectorName = nextVal;
      }
      if (key === 'showWatermark') {
        updated.showWatermark = nextVal;
      }
      return updated;
    });
  };

  const handleTriggerPrint = () => {
    if (onConfirmPrint) {
      onConfirmPrint();
    } else {
      window.print();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
              <Printer className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight font-moul">ជម្រើសកំណត់ការបោះពុម្ពឯកសារ</h3>
              <p className="text-xs text-blue-100 mt-0.5">Universal MoEYS Print Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Document Target Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-800 text-sm">{titleKhmer}</p>
              {documentSubtitle && <p className="text-slate-600">{documentSubtitle}</p>}
              <p className="text-slate-500">{schoolProfile.nameKhmer} • ឆ្នាំសិក្សា៖ {schoolProfile.academicYear}</p>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              ត្រាផ្លូវការ និងហត្ថលេខានាយក (Official Seal & Signatures)
            </h4>

            {/* Option 1: Round Stamp */}
            <div
              onClick={() => handleToggle('showRoundStamp')}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                printSettings.showRoundStamp
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {printSettings.showRoundStamp ? (
                  <CheckSquare className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">ត្រាមូលសាលារៀន (Official School Round Stamp)</p>
                  <p className="text-xs text-slate-500">បោះត្រាមូលពណ៌ក្រហមក្រសួងអប់រំ យុវជន និងកីឡា</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-rose-500/40 flex items-center justify-center text-rose-700 font-bold text-[10px]">
                ត្រា
              </div>
            </div>

            {/* Option 2: Director Signature */}
            <div
              onClick={() => handleToggle('showDirectorSignature')}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                printSettings.showDirectorSignature
                  ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {printSettings.showDirectorSignature ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">ហត្ថលេខានាយកសាលា (Director's Signature)</p>
                  <p className="text-xs text-slate-500">ហត្ថលេខា និងការអនុម័តផ្លូវការរបស់លោកនាយកសាលា</p>
                </div>
              </div>
              <Feather className="w-5 h-5 text-blue-600 shrink-0" />
            </div>

            {/* Option 3: Red Name */}
            <div
              onClick={() => handleToggle('showDirectorRedName')}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                printSettings.showDirectorRedName
                  ? 'bg-red-50/70 border-red-300 text-red-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {printSettings.showDirectorRedName ? (
                  <CheckSquare className="w-5 h-5 text-red-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">ឈ្មោះនាយកពណ៌ក្រហម (Director's Name in Red Ink)</p>
                  <p className="text-xs text-slate-500">បង្ហាញឈ្មោះ «{schoolProfile.principalName}» ជាទឹកថ្នាំពណ៌ក្រហម MoEYS</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">ក្រហម</span>
            </div>

            {/* Option 4: Watermark & Header */}
            <div
              onClick={() => handleToggle('showWatermark')}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                printSettings.showWatermark
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {printSettings.showWatermark ? (
                  <CheckSquare className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">ក្បូរក្បាច់ និងរូបសញ្ញាអង្គរវត្ត (Angkor Motif Watermark)</p>
                  <p className="text-xs text-slate-500">បន្ថែមផ្ទៃខាងក្រោយរំលេចក្បាច់ប្រាសាទបុរាណខ្មែរលើក្រដាស</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-medium"
          >
            បោះបង់ (Cancel)
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពឥឡូវនេះ (Print Now)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
