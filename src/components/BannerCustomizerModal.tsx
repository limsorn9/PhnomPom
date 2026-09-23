import React, { useState, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  X,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Eye,
  Camera,
  Layers,
  Sun,
  Sunset,
  Landmark
} from 'lucide-react';
import { AngkorBannerArtwork, ANGKOR_PHOTO_PRESETS } from './AngkorBannerArtwork';

interface BannerCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BannerCustomizerModal: React.FC<BannerCustomizerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { schoolProfile, updateSchoolProfile, showToast } = useSchool();

  const [selectedType, setSelectedType] = useState<
    'angkor_twilight' | 'angkor_sunrise' | 'angkor_golden' | 'angkor_monument' | 'angkor_vector' | 'custom' | 'gradient'
  >(schoolProfile.bannerType || 'angkor_twilight');

  const [customUrl, setCustomUrl] = useState<string>(schoolProfile.bannerUrl || '');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(
    schoolProfile.bannerOverlayOpacity !== undefined ? schoolProfile.bannerOverlayOpacity : 80
  );
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('សូមជ្រើសរើសឯកសាររូបភាព (PNG, JPG, WebP...)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomUrl(result);
      setSelectedType('custom');
      showToast('បានបញ្ចូលរូបភាពផ្ទាំងធំដោយជោគជ័យ!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    updateSchoolProfile({
      bannerType: selectedType,
      bannerUrl: selectedType === 'custom' ? customUrl : undefined,
      bannerOverlayOpacity: overlayOpacity
    });
    showToast('បានរក្សាទុករូបភាពផ្ទាំងធំប្រាសាទអង្គរវត្តជោគជ័យ!', 'success');
    onClose();
  };

  const handleResetToAngkor = () => {
    setSelectedType('angkor_twilight');
    setCustomUrl('');
    setOverlayOpacity(80);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                កំណត់រូបភាពប្រាសាទអង្គរវត្តលើផ្ទាំងធំ (Angkor Wat Hero Banner)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ជ្រើសរើសរូបថតប្រាសាទអង្គរវត្តកំពូលស្ថាបត្យកម្មខ្មែរ ឬបញ្ចូលរូបភាពផ្ទាល់ខ្លួន
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Live Preview Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                ផ្ទាំងមើលសាកល្បងផ្ទាល់ (Live Banner Preview)
              </span>
              <span className="text-[11px] text-slate-500">
                ទំហំសមាមាត្រ Panoramic 16:9
              </span>
            </div>

            <div className="relative h-48 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md">
              <AngkorBannerArtwork
                bannerType={selectedType}
                bannerUrl={customUrl}
                overlayOpacity={overlayOpacity}
              />
              {/* Sample Content Overlay */}
              <div className="relative z-10 p-5 text-white h-full flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    ស្តង់ដារសាលាបឋមសិក្សាគំរូ
                  </span>
                  <span className="text-blue-100 text-[10px]">
                    ឆ្នាំសិក្សា {schoolProfile.academicYear}
                  </span>
                </div>
                <div>
                  <h4 className="font-moul text-lg text-white leading-tight drop-shadow-md">
                    {schoolProfile.nameKhmer}
                  </h4>
                  <p className="text-amber-200 text-xs font-times drop-shadow-sm">
                    {schoolProfile.nameLatin}
                  </p>
                </div>
                <div className="text-[11px] text-slate-200 flex items-center gap-3">
                  <span>នាយកសាលា: {schoolProfile.principalName}</span>
                  <span>•</span>
                  <span>កូដ: {schoolProfile.schoolCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Genuine Angkor Wat Photo Presets Gallery */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200">
              កម្រងរូបថតប្រាសាទអង្គរវត្តគុណភាពខ្ពស់ (Angkor Wat HD Photography)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo 1: Twilight Sunset */}
              <div
                onClick={() => setSelectedType('angkor_twilight')}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedType === 'angkor_twilight'
                    ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="h-28 relative">
                  <img
                    src={ANGKOR_PHOTO_PRESETS.angkor_twilight.url}
                    alt="Angkor Twilight"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  {selectedType === 'angkor_twilight' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="font-bold text-xs flex items-center gap-1">
                      <Sunset className="w-3.5 h-3.5 text-amber-400" />
                      អង្គរវត្តពេលថ្ងៃលិច (Sunset Twilight)
                    </p>
                    <p className="text-[10px] text-slate-300">ពន្លឺមាសថ្ងៃរៀបលិច ឆ្លុះស្រះទឹក</p>
                  </div>
                </div>
              </div>

              {/* Photo 2: Sunrise */}
              <div
                onClick={() => setSelectedType('angkor_sunrise')}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedType === 'angkor_sunrise'
                    ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="h-28 relative">
                  <img
                    src={ANGKOR_PHOTO_PRESETS.angkor_sunrise.url}
                    alt="Angkor Sunrise"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  {selectedType === 'angkor_sunrise' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="font-bold text-xs flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-rose-400" />
                      អង្គរវត្តពេលថ្ងៃរះ (Morning Sunrise)
                    </p>
                    <p className="text-[10px] text-slate-300">កំពូលទាំង៥ និងពន្លឺថ្ងៃរះត្រកាល</p>
                  </div>
                </div>
              </div>

              {/* Photo 3: Golden Hour Reflection */}
              <div
                onClick={() => setSelectedType('angkor_golden')}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedType === 'angkor_golden'
                    ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="h-28 relative">
                  <img
                    src={ANGKOR_PHOTO_PRESETS.angkor_golden.url}
                    alt="Angkor Golden"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  {selectedType === 'angkor_golden' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="font-bold text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      អង្គរវត្តពន្លឺមាសឆ្លុះទឹក (Golden Pond)
                    </p>
                    <p className="text-[10px] text-slate-300">ទិដ្ឋភាពឆ្លុះស្រះស្រង់យ៉ាងស្រស់ស្អាត</p>
                  </div>
                </div>
              </div>

              {/* Photo 4: Classic Front View */}
              <div
                onClick={() => setSelectedType('angkor_monument')}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedType === 'angkor_monument'
                    ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="h-28 relative">
                  <img
                    src={ANGKOR_PHOTO_PRESETS.angkor_monument.url}
                    alt="Angkor Panorama"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  {selectedType === 'angkor_monument' && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="font-bold text-xs flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-sky-400" />
                      ទេសភាពមុខប្រាសាទពេញលេញ (Classic Panorama)
                    </p>
                    <p className="text-[10px] text-slate-300">ស្ថាបត្យកម្មបុរាណរុងរឿងនៃមហានគរ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Options: Angkor Wat Vector Art, Custom Upload & Gradient */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setSelectedType('angkor_vector')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                selectedType === 'angkor_vector'
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/30 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs">គំនូរវិចិត្រករ SVG</p>
                  <p className="text-[10px] text-slate-500">Angkor Vector Art</p>
                </div>
              </div>
              {selectedType === 'angkor_vector' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('custom')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                selectedType === 'custom'
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/30 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs">បញ្ចូលរូបភាពផ្ទាល់ខ្លួន</p>
                  <p className="text-[10px] text-slate-500">Upload រូបពីកុំព្យូទ័រ / Link</p>
                </div>
              </div>
              {selectedType === 'custom' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('gradient')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                selectedType === 'gradient'
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/30 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs">ពណ៌ Gradient</p>
                  <p className="text-[10px] text-slate-500">ផ្ទៃខៀវ-ស្វាយចាស់</p>
                </div>
              </div>
              {selectedType === 'gradient' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          </div>

          {/* Custom Upload Box (if selected) */}
          {selectedType === 'custom' && (
            <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  ចុចទីនេះដើម្បីជ្រើសរើសរូបភាព ឬទម្លាក់រូបភាពទីនេះ
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  គាំទ្រ JPG, PNG, WebP (ទំហំដែលណែនាំ: 1600 × 500 px)
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  ឬបញ្ចូលតំណភ្ជាប់រូបភាព (Image URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {customUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomUrl('')}
                      className="px-2.5 py-1 text-slate-400 hover:text-rose-500"
                      title="សម្អាត"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Opacity and Contrast Slider */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                កម្រិតស្រមោលងងឹតលើអត្ថបទ (Text Legibility Dark Overlay): {overlayOpacity}%
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {overlayOpacity >= 80 ? 'ច្បាស់ខ្លាំង (ងាយស្រួលអាន)' : 'ស្រាល'}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              step="5"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              ស្រមោលងងឹតជួយឱ្យអក្សរឈ្មោះសាលា និងប៊ូតុងទាំងអស់លើផ្ទាំងធំពណ៌សភ្លឺច្បាស់ មិនបាំងដោយពណ៌រូបភាពខាងក្រោយ។
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={handleResetToAngkor}
            className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ប្រើរូបភាពថ្ងៃលិចដើម</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>រក្សាទុកផ្ទាំងធំ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
