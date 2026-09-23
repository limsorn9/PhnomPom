import React, { useState, useMemo } from 'react';
import {
  Upload,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Search,
  Crop,
  Trash2,
  Sparkles,
  Loader2,
  Filter,
  FileImage,
  ArrowRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { PhotoCropAndAlignModal } from './PhotoCropAndAlignModal';
import { compressImageFile } from '../../services/firebaseStorage';

interface BatchStudentPhotoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PhotoMatchItem {
  id: string;
  file: File;
  previewUrl: string;
  fileName: string;
  matchedStudent: Student | null;
  matchType: 'code' | 'khmer_name' | 'latin_name' | 'manual' | null;
  status: 'matched' | 'unmatched';
}

export const BatchStudentPhotoImportModal: React.FC<BatchStudentPhotoImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { students, classrooms, updateStudent, showToast, logActivity, currentUser } = useSchool();

  const [items, setItems] = useState<PhotoMatchItem[]>([]);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatusText, setProgressStatusText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Individual Crop Modal State
  const [cropItemIndex, setCropItemIndex] = useState<number | null>(null);

  // Filter students based on grade filter for easier manual selection
  const filteredStudents = useMemo(() => {
    if (selectedGradeFilter === 'all') return students;
    const [gradeStr, sectionStr] = selectedGradeFilter.split('-');
    return students.filter(
      (s) => s.grade === parseInt(gradeStr) && (!sectionStr || s.section === sectionStr)
    );
  }, [students, selectedGradeFilter]);

  // Clean strings for matching
  const cleanString = (str: string) => {
    return str
      .toLowerCase()
      .replace(/\.(jpg|jpeg|png|webp|gif|bmp)$/i, '')
      .replace(/[_\-\s\.\(\)\[\]]+/g, ' ')
      .trim();
  };

  // Match a single file to the best student
  const findMatchingStudent = (fileName: string, candidatePool: Student[]): { student: Student | null; matchType: PhotoMatchItem['matchType'] } => {
    const cleaned = cleanString(fileName);
    const rawNoExt = fileName.replace(/\.[^/.]+$/, '').trim();

    // 1. Exact Student Code Match (e.g., STU-2024-001 or 001)
    for (const s of candidatePool) {
      if (s.code) {
        const cleanCode = cleanString(s.code);
        if (cleanCode === cleaned || cleaned.includes(cleanCode) || s.code.toLowerCase() === rawNoExt.toLowerCase()) {
          return { student: s, matchType: 'code' };
        }
        // Match numbers e.g. "01" or "001"
        const numInCode = s.code.replace(/\D/g, '');
        const numInFile = cleaned.replace(/\D/g, '');
        if (numInCode && numInFile && numInCode.length >= 2 && numInCode === numInFile) {
          return { student: s, matchType: 'code' };
        }
      }
    }

    // 2. Exact Khmer Name Match
    for (const s of candidatePool) {
      if (s.nameKhmer) {
        const cleanName = cleanString(s.nameKhmer);
        if (cleanName && (cleaned === cleanName || cleaned.includes(cleanName) || cleanName.includes(cleaned))) {
          return { student: s, matchType: 'khmer_name' };
        }
      }
    }

    // 3. Exact or Partial Latin Name Match
    for (const s of candidatePool) {
      if (s.nameLatin) {
        const cleanLatin = cleanString(s.nameLatin);
        if (cleanLatin && (cleaned === cleanLatin || cleaned.includes(cleanLatin) || cleanLatin.includes(cleaned))) {
          return { student: s, matchType: 'latin_name' };
        }
      }
    }

    return { student: null, matchType: null };
  };

  // Process incoming files
  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      showToast('សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ (JPG, PNG, WebP)', 'error');
      return;
    }

    const newItems: PhotoMatchItem[] = fileArray.map((file) => {
      const { student, matchType } = findMatchingStudent(file.name, filteredStudents);
      const previewUrl = URL.createObjectURL(file);
      return {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        previewUrl,
        fileName: file.name,
        matchedStudent: student,
        matchType,
        status: student ? 'matched' : 'unmatched'
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    showToast(`បានបញ្ចូល ${newItems.length} រូបថតសម្រាប់ត្រួតពិនិត្យ!`, 'success');
  };

  // Drag & Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Manual student select override
  const handleSelectStudentForPhoto = (index: number, studentId: string) => {
    const targetStudent = students.find((s) => s.id === studentId) || null;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              matchedStudent: targetStudent,
              matchType: 'manual',
              status: targetStudent ? 'matched' : 'unmatched'
            }
          : item
      )
    );
  };

  // Remove photo item
  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  // Clear all
  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setItems([]);
  };

  // Re-run matching algorithm when filter changes
  const handleReMatchAll = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.matchType === 'manual') return item;
        const { student, matchType } = findMatchingStudent(item.fileName, filteredStudents);
        return {
          ...item,
          matchedStudent: student,
          matchType,
          status: student ? 'matched' : 'unmatched'
        };
      })
    );
    showToast('បានផ្គូផ្គងទិន្នន័យឡើងវិញរួចរាល់!', 'success');
  };

  // Execute Batch Save & Update Students
  const handleExecuteBatchSave = async () => {
    const matchedItems = items.filter((item) => item.matchedStudent !== null);
    if (matchedItems.length === 0) {
      showToast('ពុំមានរូបថតណាមួយត្រូវបានផ្គូផ្គងជាមួយសិស្សឡើយ!', 'error');
      return;
    }

    setIsProcessingBatch(true);
    setProgressPercent(0);
    setProgressStatusText('កំពុងចាប់ផ្ដើមបង្រួម និងផ្ទុករូបថត...');

    let successCount = 0;
    const total = matchedItems.length;

    for (let i = 0; i < total; i++) {
      const item = matchedItems[i];
      const student = item.matchedStudent!;

      setProgressPercent(Math.round(((i + 1) / total) * 100));
      setProgressStatusText(`កំពុងរក្សាទុករូបថតទី ${i + 1}/${total}: ${student.nameKhmer}...`);

      try {
        // Compress to optimized high quality JPEG
        const compressedBlob = await compressImageFile(item.file, 600, 800, 0.9);
        
        // Convert to dataUrl for instant base64 storage
        const reader = new FileReader();
        const dataUrlPromise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedBlob);
        });
        const finalPhotoUrl = await dataUrlPromise;

        // Update Student in Context & State
        updateStudent(student.id, {
          avatarUrl: finalPhotoUrl,
          photoUrl: finalPhotoUrl
        } as any);

        successCount++;
      } catch (err) {
        console.error(`Failed to process photo for student ${student.nameKhmer}:`, err);
      }
    }

    logActivity({
      action: 'BATCH_STUDENT_PHOTO_IMPORT',
      details: `បាន Upload និងធ្វើបច្ចុប្បន្នភាពរូបថតសិស្សចំនួន ${successCount}/${total} នាក់ព្រមគ្នា។`,
      userName: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង'
    });

    setIsProcessingBatch(false);
    showToast(`🎉 ជោគជ័យ! បាន Upload និងធ្វើបច្ចុប្បន្នភាពរូបថតសិស្ស ${successCount} នាក់រួចរាល់!`, 'success');
    handleClearAll();
    onClose();
  };

  // Counts
  const matchedCount = items.filter((i) => i.status === 'matched').length;
  const unmatchedCount = items.filter((i) => i.status === 'unmatched').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-kantumruy">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-sm sm:text-base text-white">
                Upload រូបថតសិស្សច្រើននាក់ព្រមគ្នា (Batch Photo Import)
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                ផ្គូផ្គងស្វ័យប្រវត្តិតាម «អត្តលេខសិស្ស» ឬ «ឈ្មោះសិស្ស» ដោយចុចតែម្តង
              </p>
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

        {/* Top Filter & Dropzone Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Grade/Class Target Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                កំណត់ថ្នាក់គោលដៅ៖
              </span>
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់ថ្នាក់ទាំងអស់ ({students.length} នាក់)</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={`${c.grade}-${c.section}`}>
                    ថ្នាក់ទី {c.grade}«{c.section}» ({students.filter((s) => s.grade === c.grade && s.section === c.section).length} នាក់)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Match / Re-scan button */}
            {items.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReMatchAll}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>ផ្គូផ្គងឡើងវិញ</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-all"
                >
                  សម្អាតទាំងអស់
                </button>
              </div>
            )}
          </div>

          {/* Multi-file Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? 'bg-blue-50/80 border-blue-500 dark:bg-blue-950/50'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shadow-xs">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                អូសទម្លាក់រូបថតសិស្សច្រើននាក់ចូលទីនេះ ឬជ្រើសរើសឯកសារ
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                គន្លឹះ៖ ដាក់ឈ្មោះរូបថតជា <strong className="text-blue-600">អត្តលេខសិស្ស (ឧ. STU-001.jpg)</strong> ឬ <strong className="text-blue-600">ឈ្មោះសិស្ស (ឧ. សុខា.png)</strong> ដើម្បីឱ្យប្រព័ន្ធផ្គូផ្គងដោយស្វ័យប្រវត្តិ
              </p>
            </div>
            <label className="mt-1 cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              <span>ជ្រើសរើសរូបថត (Select Multiple Photos)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesAdded(e.target.files);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Content Body: Table of Items */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto bg-slate-100 dark:bg-slate-950/50 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                មិនទាន់មានរូបថតណាមួយត្រូវបានជ្រើសរើសនៅឡើយទេ
              </p>
              <p className="text-xs text-slate-400">
                សូមជ្រើសរើសរូបថត ឬអូសទម្លាក់ចូលប្រអប់ខាងលើ ដើម្បីចាប់ផ្ដើម
              </p>
            </div>
          ) : (
            <>
              {/* Statistics Chips */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                    សរុប៖ <strong>{items.length}</strong> រូប
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ផ្គូផ្គងស្គាល់៖ <strong>{matchedCount}</strong></span>
                  </span>
                  {unmatchedCount > 0 && (
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 shadow-2xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>មិនទាន់ស្គាល់៖ <strong>{unmatchedCount}</strong></span>
                    </span>
                  )}
                </div>
              </div>

              {/* Items Grid/List */}
              <div className="grid grid-cols-1 gap-2.5">
                {items.map((item, index) => {
                  const student = item.matchedStudent;
                  const isMatched = Boolean(student);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
                        isMatched
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/80'
                      }`}
                    >
                      {/* Left: Image Thumbnail & Filename */}
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-14 h-18 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black shrink-0 aspect-[3/4] shadow-xs">
                          <img
                            src={item.previewUrl}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[200px]" title={item.fileName}>
                            {item.fileName}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {isMatched ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {item.matchType === 'code'
                                  ? 'ស្គាល់តាមអត្តលេខ'
                                  : item.matchType === 'khmer_name'
                                  ? 'ស្គាល់តាមឈ្មោះខ្មែរ'
                                  : item.matchType === 'latin_name'
                                  ? 'ស្គាល់តាមឈ្មោះឡាតាំង'
                                  : 'រើសដោយដៃ'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                មិនទាន់ផ្គូផ្គង
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Matched Student Profile or Manual Selector */}
                      <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
                        
                        <div className="flex-1">
                          {isMatched && student ? (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                                  {student.nameKhmer.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>{student.nameKhmer}</span>
                                    <span className="text-[11px] font-semibold text-slate-400 font-mono">({student.nameLatin})</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                    ថ្នាក់ទី {student.grade}«{student.section}» • អត្តលេខ៖ <strong className="font-mono text-blue-600">{student.code}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Change match select button */}
                              <select
                                value={student.id}
                                onChange={(e) => handleSelectStudentForPhoto(index, e.target.value)}
                                className="text-[11px] font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200"
                              >
                                {filteredStudents.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.nameKhmer} ({s.code} - ថ្នាក់{s.grade}{s.section})
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            /* Unmatched: Manual search dropdown */
                            <div className="flex items-center gap-2">
                              <select
                                value=""
                                onChange={(e) => handleSelectStudentForPhoto(index, e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-amber-400 focus:border-blue-500 rounded-xl text-xs font-bold text-slate-800 dark:text-white shadow-xs"
                              >
                                <option value="">-- ចុចជ្រើសរើសឈ្មោះសិស្សសម្រាប់រូបនេះ --</option>
                                {filteredStudents.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.nameKhmer} ({s.nameLatin}) • ថ្នាក់ទី {s.grade}«{s.section}» • {s.code}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions (Crop & Delete) */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setCropItemIndex(index)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl text-xs font-semibold transition-colors"
                          title="ច្រឹប និងតម្រឹមរូបនេះ"
                        >
                          <Crop className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                          title="លុបរូបនេះចេញពីបញ្ជី"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Processing Progress Overlay */}
        {isProcessingBatch && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/80 border-t border-blue-200 dark:border-blue-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                {progressStatusText}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={isProcessingBatch}
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            បិទ
          </button>

          <button
            type="button"
            disabled={isProcessingBatch || matchedCount === 0}
            onClick={handleExecuteBatchSave}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4" />
            <span>
              រក្សាទុក និង Update រូបថតទាំងអស់ ({matchedCount} នាក់)
            </span>
          </button>
        </div>
      </div>

      {/* Individual Photo Crop Modal */}
      {cropItemIndex !== null && items[cropItemIndex] && (
        <PhotoCropAndAlignModal
          isOpen={true}
          imageSrc={items[cropItemIndex].previewUrl}
          onClose={() => setCropItemIndex(null)}
          onConfirmCrop={(newBlob, newDataUrl) => {
            const index = cropItemIndex;
            setItems((prev) =>
              prev.map((item, idx) =>
                idx === index
                  ? {
                      ...item,
                      file: new File([newBlob], item.fileName, { type: 'image/jpeg' }),
                      previewUrl: newDataUrl
                    }
                  : item
              )
            );
            setCropItemIndex(null);
            showToast('បានច្រឹប និងតម្រឹមរូបថតជោគជ័យ!', 'success');
          }}
        />
      )}
    </div>
  );
};
