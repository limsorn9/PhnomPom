import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  BookmarkPlus,
  RefreshCw,
  Info,
  Trash2
} from 'lucide-react';
import { LearningResourceItem, ResourceTag } from '../../data/learningResourcesData';

interface BulkCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newResources: LearningResourceItem[]) => void;
  existingResources: LearningResourceItem[];
}

interface ParsedCsvRow {
  index: number;
  titleKhmer: string;
  titleEnglish?: string;
  url: string;
  grade?: number;
  subject?: 'khmer' | 'math' | 'all';
  descriptionKhmer: string;
  tags: ResourceTag[];
  category?: 'primary_platform' | 'digital_school' | 'grade_video';
  totalLessons?: number;
  status: 'valid' | 'invalid';
  errorMessage?: string;
}

export const BulkCsvImportModal: React.FC<BulkCsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingResources
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'template'>('upload');
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Sample CSV data for download/copy
  const sampleCsvData = `titleKhmer,titleEnglish,url,grade,subject,descriptionKhmer,tags,category,totalLessons
"បណ្ណាល័យឌីជីថលកុមារ","Children Digital Library","https://childrenslibrary.org",1,"all","បណ្តុំសៀវភៅរឿងគំនូររូបភាព និងអំណានភាសាខ្មែរសម្រាប់កុមារ","Reading,Interactive","digital_school",20
"វីដេអូពិសោធន៍វិទ្យាសាស្ត្របឋម","Elementary STEM Experiments","https://stem.moeys.gov.kh",3,"all","វីដេអូពិសោធន៍វិទ្យាសាស្ត្រ និងសកម្មភាព STEM ងាយៗក្នុងថ្នាក់រៀន","Video,Interactive","grade_video",15
"លំហាត់គណិតរហ័ស ថ្នាក់ទី៤","Fast Math Drills Grade 4","https://mathdrills.example.com",4,"math","លំហាត់អនុវត្តការគិតលេខរហ័ស និងប្រមាណវិធីគុណចែក","Math Practice,Worksheet","grade_video",24
"វិញ្ញាសាត្រៀមប្រឡងឆមាស ភាសាខ្មែរ","Khmer Semester Exam Prep","https://exam.moeys.gov.kh/khmer",6,"khmer","បណ្តុំវិញ្ញាសាគំរូ និងលំហាត់តែងសេចក្តីត្រៀមប្រឡង","Exam Prep,Worksheet","grade_video",18`;

  const downloadSampleCsv = () => {
    const blob = new Blob(['\uFEFF' + sampleCsvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'គំរូ_បញ្ជីធនធាន_MoEYS_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvContent = (content: string) => {
    setParseError(null);
    if (!content.trim()) {
      setParsedRows([]);
      return;
    }

    try {
      const lines = content
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .filter(l => l.trim().length > 0);

      if (lines.length <= 1) {
        setParseError('ឯកសារ CSV ត្រូវមានយ៉ាងហោចណាស់ជួរក្បាលតារាង (Header) និងជួរទិន្នន័យ ១ ជួរ។');
        setParsedRows([]);
        return;
      }

      // Simple CSV line parser respecting quotes
      const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim().replace(/^["']|["']$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim().replace(/^["']|["']$/g, ''));
        return result;
      };

      const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_-]/g, ''));
      
      const rows: ParsedCsvRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        if (values.length === 0 || (values.length === 1 && !values[0])) continue;

        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });

        // Extract key fields with fallback column names
        const titleKhmer =
          rowObj['titlekhmer'] ||
          rowObj['title'] ||
          rowObj['name'] ||
          rowObj['ឈ្មោះ'] ||
          rowObj['ចំណងជើង'] ||
          values[0] ||
          '';

        const titleEnglish =
          rowObj['titleenglish'] ||
          rowObj['english'] ||
          rowObj['title_en'] ||
          values[1] ||
          titleKhmer;

        const url =
          rowObj['url'] ||
          rowObj['link'] ||
          rowObj['website'] ||
          rowObj['តំណភ្ជាប់'] ||
          values[2] ||
          '';

        const gradeStr = rowObj['grade'] || rowObj['ថ្នាក់'] || rowObj['level'] || values[3] || '';
        let grade: number | undefined = parseInt(gradeStr, 10);
        if (isNaN(grade) || grade < 1 || grade > 6) {
          grade = undefined;
        }

        const subStr = (rowObj['subject'] || rowObj['មុខវិជ្ជា'] || values[4] || '').toLowerCase();
        let subject: 'khmer' | 'math' | 'all' = 'all';
        if (subStr.includes('khmer') || subStr.includes('ខ្មែរ')) subject = 'khmer';
        else if (subStr.includes('math') || subStr.includes('គណិត')) subject = 'math';

        const descriptionKhmer =
          rowObj['descriptionkhmer'] ||
          rowObj['description'] ||
          rowObj['desc'] ||
          rowObj['ការពិពណ៌នា'] ||
          values[5] ||
          'ធនធានសិក្សាជំនួយសម្រាប់គ្រូ និងសិស្ស';

        const tagsRaw = rowObj['tags'] || rowObj['tag'] || rowObj['ស្លាក'] || values[6] || '';
        const validTags: ResourceTag[] = ['Interactive', 'Video', 'Worksheet', 'Reading', 'Math Practice', 'Exam Prep'];
        const matchedTags: ResourceTag[] = [];
        
        validTags.forEach(t => {
          if (tagsRaw.toLowerCase().includes(t.toLowerCase()) || tagsRaw.includes(t)) {
            matchedTags.push(t);
          }
        });
        if (matchedTags.length === 0) {
          matchedTags.push(url.includes('video') || url.includes('youtube') || url.includes('link.moeys') ? 'Video' : 'Interactive');
        }

        const catRaw = (rowObj['category'] || values[7] || '').toLowerCase();
        let category: 'primary_platform' | 'digital_school' | 'grade_video' = 'grade_video';
        if (catRaw.includes('platform') || catRaw.includes('ថ្នាល')) category = 'primary_platform';
        else if (catRaw.includes('digital') || catRaw.includes('សាលា')) category = 'digital_school';

        const totalLessonsStr = rowObj['totallessons'] || rowObj['lessons'] || rowObj['មេរៀន'] || values[8] || '';
        const totalLessons = parseInt(totalLessonsStr, 10) || (category === 'grade_video' ? 24 : 30);

        // Validation
        let status: 'valid' | 'invalid' = 'valid';
        let errorMessage: string | undefined = undefined;

        if (!titleKhmer) {
          status = 'invalid';
          errorMessage = 'ខ្វះឈ្មោះ/ចំណងជើងធនធាន (Title Khmer)';
        } else if (!url || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('www.'))) {
          status = 'invalid';
          errorMessage = 'តំណភ្ជាប់ URL មិនត្រឹមត្រូវ (ត្រូវចាប់ផ្តើមដោយ https:// ឬ http://)';
        }

        rows.push({
          index: i,
          titleKhmer,
          titleEnglish,
          url: url.startsWith('www.') ? `https://${url}` : url,
          grade,
          subject,
          descriptionKhmer,
          tags: matchedTags,
          category,
          totalLessons,
          status,
          errorMessage
        });
      }

      setParsedRows(rows);
    } catch (err: any) {
      setParseError(`មានបញ្ហាក្នុងការវិភាគឯកសារ CSV: ${err?.message || 'ទម្រង់មិនត្រឹមត្រូវ'}`);
      setParsedRows([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsvContent(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    parseCsvContent(text);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) return;

    setIsProcessing(true);

    const newItems: LearningResourceItem[] = validRows.map((row, idx) => {
      const uniqueId = `custom-res-${Date.now()}-${idx}`;
      
      let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
      let gradientBg = 'from-blue-50/90 via-white to-indigo-50/30';
      let iconBg = 'bg-blue-600 text-white';

      if (row.subject === 'khmer') {
        badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
        gradientBg = 'from-rose-50/90 via-white to-pink-50/30';
        iconBg = 'bg-rose-600 text-white';
      } else if (row.category === 'primary_platform') {
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        gradientBg = 'from-emerald-50/90 via-white to-teal-50/40';
        iconBg = 'bg-emerald-600 text-white';
      } else if (row.category === 'digital_school') {
        badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
        gradientBg = 'from-indigo-50/90 via-white to-blue-50/40';
        iconBg = 'bg-indigo-600 text-white';
      }

      return {
        id: uniqueId,
        type: row.category === 'grade_video' ? 'video' : 'platform',
        grade: row.grade,
        subject: row.subject,
        titleKhmer: row.titleKhmer,
        titleEnglish: row.titleEnglish || row.titleKhmer,
        subjectNameKhmer: row.subject === 'khmer' ? 'ភាសាខ្មែរ' : row.subject === 'math' ? 'គណិតវិទ្យា' : 'គ្រប់មុខវិជ្ជា',
        url: row.url,
        descriptionKhmer: row.descriptionKhmer,
        badgeColor,
        gradientBg,
        iconBg,
        category: row.category || 'grade_video',
        tags: row.tags,
        totalLessons: row.totalLessons || 20,
        isCustomImported: true
      };
    });

    setTimeout(() => {
      onImportSuccess(newItems);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const invalidCount = parsedRows.filter(r => r.status === 'invalid').length;

  return (
    <div
      id="bulk-csv-import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="bulk-csv-import-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">នាំចូលធនធានសិក្សាជាដុំពីឯកសារ CSV (Bulk CSV Import)</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                បញ្ចូលបញ្ជីឯកសារ និងតំណភ្ជាប់សិក្សាដែលលោកគ្រូ-អ្នកគ្រូមានស្រាប់ទៅក្នុង «Saved Resources» ភ្លាមៗ
              </p>
            </div>
          </div>
          <button
            id="close-bulk-csv-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/25 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-t-xl font-medium text-xs sm:text-sm flex items-center gap-2 border-t-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-blue-700 border-blue-600 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            ផ្ទុកឯកសារ CSV (Upload File)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 rounded-t-xl font-medium text-xs sm:text-sm flex items-center gap-2 border-t-2 transition-all ${
              activeTab === 'paste'
                ? 'bg-white text-blue-700 border-blue-600 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            ចម្លងបញ្ចូលអត្ថបទ (Paste Text)
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`px-4 py-2.5 rounded-t-xl font-medium text-xs sm:text-sm flex items-center gap-2 border-t-2 transition-all ${
              activeTab === 'template'
                ? 'bg-white text-blue-700 border-blue-600 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4" />
            គំរូទម្រង់ (CSV Template)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-blue-50/40 hover:bg-blue-50/80 transition-all cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 group-hover:bg-blue-200 text-blue-700 flex items-center justify-center mb-3 transition-colors">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                  {fileName ? `ឯកសារជ្រើសរើស៖ ${fileName}` : 'ចុចទីនេះ ឬទម្លាក់ឯកសារ CSV របស់អ្នក'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">គាំទ្រឯកសារ .csv ដែលមានទម្រង់ UTF-8</p>
                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    បានផ្ទុកឯកសាររួចរាល់
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                បិទភ្ជាប់ (Paste) ទិន្នន័យ CSV នៅទីនេះ៖
              </label>
              <textarea
                value={csvText}
                onChange={handleTextChange}
                placeholder={`titleKhmer,url,grade,subject,descriptionKhmer,tags\n"បណ្ណាល័យកុមារ","https://example.com",1,"khmer","រឿងនិទានកុមារ","Reading,Interactive"`}
                rows={6}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
              />
            </div>
          )}

          {activeTab === 'template' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">គំរូទម្រង់ក្បាលតារាង (Header Columns)</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    តារាង CSV ត្រូវមានជួរឈរដូចខាងក្រោម ៖
                  </p>
                </div>
                <button
                  onClick={downloadSampleCsv}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  ទាញយកគំរូ (.CSV)
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 bg-white rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2 text-left border-b">ជួរឈរ (Column)</th>
                      <th className="p-2 text-left border-b">ប្រភេទ</th>
                      <th className="p-2 text-left border-b">ឧទាហរណ៍</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    <tr>
                      <td className="p-2 font-bold text-blue-700">titleKhmer *</td>
                      <td className="p-2">អក្សរ</td>
                      <td className="p-2">"វីដេអូបង្រៀនរូបវិទ្យា"</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-700">url *</td>
                      <td className="p-2">តំណភ្ជាប់</td>
                      <td className="p-2">"https://youtube.com/..."</td>
                    </tr>
                    <tr>
                      <td className="p-2">grade</td>
                      <td className="p-2">លេខ (1-6)</td>
                      <td className="p-2">1, 2, 3...</td>
                    </tr>
                    <tr>
                      <td className="p-2">subject</td>
                      <td className="p-2">khmer / math / all</td>
                      <td className="p-2">khmer</td>
                    </tr>
                    <tr>
                      <td className="p-2">tags</td>
                      <td className="p-2">ស្លាក (ក្បៀស)</td>
                      <td className="p-2">Video, Reading, Worksheet</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parse Errors */}
          {parseError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{parseError}</p>
                <p className="mt-0.5 text-rose-600">សូមពិនិត្យមើលទម្រង់ CSV របស់អ្នក ឬទាញយកគំរូទម្រង់ដើម្បីផ្ទៀងផ្ទាត់។</p>
              </div>
            </div>
          )}

          {/* Preview of Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                  <span>ផ្ទៀងផ្ទាត់ទិន្នន័យ (Data Preview)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    ត្រឹមត្រូវ: {validCount}
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                      មិនត្រឹមត្រូវ: {invalidCount}
                    </span>
                  )}
                </h4>
                <button
                  onClick={() => {
                    setParsedRows([]);
                    setCsvText('');
                    setFileName(null);
                  }}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  សម្អាត
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2.5">ស្ថានភាព</th>
                      <th className="p-2.5">ចំណងជើង</th>
                      <th className="p-2.5">កម្រិត / មុខវិជ្ជា</th>
                      <th className="p-2.5">ស្លាក</th>
                      <th className="p-2.5">តំណភ្ជាប់ URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.status === 'valid' ? 'hover:bg-blue-50/30' : 'bg-rose-50/40 hover:bg-rose-50/70'}
                      >
                        <td className="p-2.5 whitespace-nowrap">
                          {row.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              ត្រឹមត្រូវ
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-medium"
                              title={row.errorMessage}
                            >
                              <AlertCircle className="w-3 h-3" />
                              {row.errorMessage || 'មិនត្រឹមត្រូវ'}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-medium text-slate-900 max-w-[180px] truncate">
                          {row.titleKhmer}
                        </td>
                        <td className="p-2.5 text-slate-600 whitespace-nowrap">
                          {row.grade ? `ថ្នាក់ទី${row.grade}` : 'ទូទៅ'} •{' '}
                          {row.subject === 'khmer' ? 'ភាសាខ្មែរ' : row.subject === 'math' ? 'គណិត' : 'ទូទៅ'}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          <div className="flex gap-1 flex-wrap">
                            {row.tags.slice(0, 2).map((t, tidx) => (
                              <span key={tidx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-400 font-mono text-[11px] max-w-[150px] truncate">
                          {row.url}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>ធនធានដែលនាំចូលនឹងត្រូវបញ្ចូលដោយស្វ័យប្រវត្តិទៅក្នុង «Saved Resources»</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              id="confirm-bulk-csv-import-btn"
              disabled={validCount === 0 || isProcessing}
              onClick={handleExecuteImport}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  កំពុងនាំចូល...
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  នាំចូល {validCount} ធនធាន (Import Now)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
