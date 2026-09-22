import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useSchool } from '../context/SchoolContext';
import { Student, Gender } from '../types';
import {
  X,
  FileSpreadsheet,
  ClipboardList,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Trash2,
  Sparkles,
  Check,
  Info
} from 'lucide-react';

interface BulkImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGrade: number;
  targetSection: string;
  onImportSuccess?: (count: number) => void;
}

interface ParsedStudentItem {
  id: string;
  lastName: string;
  firstName: string;
  gender: Gender;
  dob: string;
  code?: string;
  phone?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherJob?: string;
  motherName?: string;
  motherPhone?: string;
  motherJob?: string;
  pob?: string;
  currentAddress?: string;
  ethnicity?: string;
  disability?: string;
}

export const BulkImportStudentsModal: React.FC<BulkImportStudentsModalProps> = ({
  isOpen,
  onClose,
  targetGrade,
  targetSection,
  onImportSuccess
}) => {
  const { addStudent, students, showToast, selectedAcademicYear } = useSchool();
  const [activeTab, setActiveTab] = useState<'paste' | 'excel'>('paste');

  // Tab 2: Paste State
  const [pasteText, setPasteText] = useState<string>('');
  
  // Tab 1: Excel Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [excelParsedStudents, setExcelParsedStudents] = useState<ParsedStudentItem[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // SMART PARSER: Tab-separated or Plain Text List
  // -------------------------------------------------------------
  const parsePasteList = (raw: string): ParsedStudentItem[] => {
    if (!raw.trim()) return [];
    const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsed: ParsedStudentItem[] = [];

    lines.forEach((line, index) => {
      // Check if tab-separated (from Excel / Spreadsheet copy-paste)
      if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        const lastName = parts[0] || '';
        const firstName = parts[1] || '';
        const rawGender = parts[2] || '';
        const code = parts[3] || '';
        const phone = parts[4] || '';
        const fatherName = parts[5] || '';
        const fatherPhone = parts[6] || '';
        const motherName = parts[7] || '';
        const motherPhone = parts[8] || '';

        const isFemale = rawGender === 'ស្រី' || rawGender.toLowerCase() === 'f' || rawGender.toLowerCase() === 'female';
        const gender: Gender = isFemale ? 'F' : 'M';

        if (lastName || firstName) {
          parsed.push({
            id: `paste-${Date.now()}-${index}`,
            lastName,
            firstName,
            gender,
            dob: '2016-01-01',
            code: code || `STU-${String(students.length + index + 1).padStart(3, '0')}`,
            phone,
            fatherName,
            fatherPhone,
            motherName,
            motherPhone
          });
        }
      } else {
        // Plain text list: e.g. "សុខ ចន្ថា"
        const cleanLine = line.replace(/^\d+[\.\)\-]\s*/, '').trim(); // Remove leading numbering
        const words = cleanLine.split(/\s+/).filter(w => w.length > 0);
        if (words.length > 0) {
          const lastName = words[0];
          const firstName = words.slice(1).join(' ') || words[0];
          parsed.push({
            id: `paste-${Date.now()}-${index}`,
            lastName,
            firstName,
            gender: 'M', // Default, teacher can toggle
            dob: '2016-01-01',
            code: `STU-${String(students.length + index + 1).padStart(3, '0')}`
          });
        }
      }
    });

    return parsed;
  };

  const parsedPastedStudents = parsePasteList(pasteText);

  // -------------------------------------------------------------
  // DOWNLOAD EXCEL TEMPLATE (SheetJS / XLSX)
  // -------------------------------------------------------------
  const handleDownloadTemplate = () => {
    try {
      const headers = [
        ['គំរូឯកសារបញ្ចូលទិន្នន័យសិស្ស - KrouDigital 4.0'],
        ['កម្រិតថ្នាក់៖', `ថ្នាក់ទី ${targetGrade} «${targetSection}»`, 'ឆ្នាំសិក្សា៖', selectedAcademicYear],
        [],
        [
          'គោត្តនាម',
          'នាម',
          'ភេទ',
          'ថ្ងៃខែឆ្នាំកំណើត',
          'លេខកូដសិស្ស',
          'ឈ្មោះឪពុក',
          'ទូរស័ព្ទឪពុក',
          'ឈ្មោះម្តាយ',
          'ទូរស័ព្ទម្តាយ',
          'អាសយដ្ឋាន'
        ],
        ['សុខ', 'ចន្ថា', 'ស្រី', '15/03/2016', 'STU-001', 'សុខ គង់', '012345678', 'អ៊ុំ ម៉ាលី', '098765432', 'ភូមិ១ ឃុំ២ ស្រុក៣ ខេត្តបាត់ដំបង'],
        ['ចាន់', 'ដារ៉ា', 'ប្រុស', '20/07/2016', 'STU-002', 'ចាន់ ផល', '012111222', 'ហេង ស្រីពៅ', '015333444', 'ភូមិស្វាយ ស្រុកកណ្តាល ខេត្តកណ្តាល'],
        ['រស់', 'សុភាព', 'ស្រី', '10/11/2015', 'STU-003', 'រស់ សារ៉េត', '017555666', 'កែវ សោភា', '088777888', 'សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក ភ្នំពេញ']
      ];

      const ws = XLSX.utils.aoa_to_sheet(headers);
      
      // Auto column widths
      ws['!cols'] = [
        { wch: 14 },
        { wch: 14 },
        { wch: 8 },
        { wch: 16 },
        { wch: 14 },
        { wch: 16 },
        { wch: 14 },
        { wch: 16 },
        { wch: 14 },
        { wch: 32 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'បញ្ជីសិស្ស');

      XLSX.writeFile(wb, `sample_students_template_G${targetGrade}${targetSection}.xlsx`);
      showToast('បានទាញយកឯកសារគំរូ Excel ដោយជោគជ័យ', 'success');
    } catch (err) {
      console.error(err);
      showToast('មិនអាចបង្កើតឯកសារ Excel បានទេ', 'error');
    }
  };

  // -------------------------------------------------------------
  // PLP-SMS & STANDARD EXCEL PARSER
  // -------------------------------------------------------------
  const parseExcelFile = (file: File) => {
    setIsParsingExcel(true);
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to rows array (array of arrays)
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rows || rows.length === 0) {
          showToast('ឯកសារ Excel គ្មានទិន្នន័យទេ', 'error');
          setIsParsingExcel(false);
          return;
        }

        const parsed: ParsedStudentItem[] = [];

        // Check if this is MoEYS PLP-SMS format:
        // Rows 1-7 are administrative headers.
        // Row 8 (0-indexed 7) has headers: 'គោត្តនាម និងនាម' or 'គោត្តនាម', 'ភេទ', etc.
        let headerRowIdx = -1;
        let isPlpFormat = false;

        for (let i = 0; i < Math.min(rows.length, 15); i++) {
          const rowStr = rows[i].join(' ');
          if (rowStr.includes('គោត្តនាម') || rowStr.includes('ឈ្មោះ') || rowStr.includes('ភេទ')) {
            headerRowIdx = i;
            if (i >= 5 || rowStr.includes('គោត្តនាម និងនាម') || rowStr.includes('PLP') || rowStr.includes('SMS')) {
              isPlpFormat = true;
            }
            break;
          }
        }

        if (headerRowIdx === -1) {
          headerRowIdx = 0; // fallback to row 1
        }

        setDetectedFormat(isPlpFormat ? 'ទម្រង់ក្រសួង MoEYS PLP-SMS' : 'ទម្រង់គំរូទូទៅ (Standard Template)');

        // Parse starting after header row
        for (let r = headerRowIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          // Check if row has valid content (not empty, not footer totals)
          const rowText = row.join(' ').trim();
          if (!rowText || rowText.includes('សរុប') || rowText.includes('Total') || rowText.includes('គណៈកម្មការ')) {
            continue;
          }

          let lastName = '';
          let firstName = '';
          let gender: Gender = 'M';
          let dob = '2016-01-01';
          let pob = '';
          let fatherName = '';
          let fatherJob = '';
          let motherName = '';
          let motherJob = '';
          let currentAddress = '';
          let ethnicity = 'ខ្មែរ';
          let disability = 'គ្មាន';

          if (isPlpFormat) {
            // MoEYS PLP-SMS Column Mapping:
            // Column 0: No. (លេខរៀង)
            // Column 1 (B): គោត្តនាម និងនាម
            // Column 2 (C): ភេទ ('ប្រុស' or 'ស្រី')
            // Column 3 (D): ថ្ងៃខែឆ្នាំកំណើត (DD/MM/YYYY or date serial)
            // Column 4 (E): ទីកន្លែងកំណើត
            // Column 5 (F): ឈ្មោះឪពុក
            // Column 6 (G): មុខរបរឪពុក
            // Column 7 (H): ឈ្មោះម្តាយ
            // Column 8 (I): មុខរបរម្តាយ
            // Column 9 (J): លំនៅដ្ឋានបច្ចុប្បន្ន
            // Column 10 (K): ក្រុមជនជាតិ
            // Column 11 (L): ពិការភាព

            const fullName = String(row[1] || '').trim();
            if (!fullName) continue;

            const nameParts = fullName.split(/\s+/);
            lastName = nameParts[0] || '';
            firstName = nameParts.slice(1).join(' ') || nameParts[0];

            const rawGender = String(row[2] || '').trim();
            gender = (rawGender === 'ស្រី' || rawGender.toLowerCase() === 'f' || rawGender.toLowerCase() === 'female') ? 'F' : 'M';

            // DOB
            const rawDob = row[3];
            dob = parseRawExcelDate(rawDob);

            pob = String(row[4] || '').trim();
            fatherName = String(row[5] || '').trim();
            fatherJob = String(row[6] || '').trim();
            motherName = String(row[7] || '').trim();
            motherJob = String(row[8] || '').trim();
            currentAddress = String(row[9] || '').trim();
            ethnicity = String(row[10] || 'ខ្មែរ').trim();
            disability = String(row[11] || 'គ្មាន').trim();
          } else {
            // Standard template:
            // Col 0: គោត្តនាម, Col 1: នាម, Col 2: ភេទ, Col 3: DOB, Col 4: Code, Col 5: Father, Col 6: FPhone, Col 7: Mother, Col 8: MPhone, Col 9: Addr
            lastName = String(row[0] || '').trim();
            firstName = String(row[1] || '').trim();
            if (!lastName && !firstName) continue;

            const rawGender = String(row[2] || '').trim();
            gender = (rawGender === 'ស្រី' || rawGender.toLowerCase() === 'f' || rawGender.toLowerCase() === 'female') ? 'F' : 'M';

            const rawDob = row[3];
            dob = parseRawExcelDate(rawDob);

            fatherName = String(row[5] || '').trim();
            motherName = String(row[7] || '').trim();
            currentAddress = String(row[9] || '').trim();
          }

          if (lastName || firstName) {
            parsed.push({
              id: `excel-${Date.now()}-${r}`,
              lastName,
              firstName,
              gender,
              dob,
              code: `STU-${String(students.length + parsed.length + 1).padStart(3, '0')}`,
              pob,
              fatherName,
              fatherJob,
              motherName,
              motherJob,
              currentAddress,
              ethnicity,
              disability
            });
          }
        }

        setExcelParsedStudents(parsed);
        setIsParsingExcel(false);

        if (parsed.length > 0) {
          const femaleCount = parsed.filter(p => p.gender === 'F').length;
          showToast(`បានទាញទិន្នន័យសិស្ស ${parsed.length} នាក់ (ស្រី ${femaleCount} នាក់) ដោយជោគជ័យ`, 'success');
        } else {
          showToast('រកមិនឃើញទិន្នន័យសិស្សក្នុងឯកសារនេះទេ', 'warning');
        }
      } catch (err) {
        console.error(err);
        showToast('មានបញ្ហាក្នុងការអានឯកសារ Excel', 'error');
        setIsParsingExcel(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Helper for date conversion
  const parseRawExcelDate = (val: any): string => {
    if (!val) return '2016-01-01';
    if (typeof val === 'number') {
      // Excel serial date number
      const parsedDate = XLSX.SSF.parse_date_code(val);
      if (parsedDate) {
        const y = String(parsedDate.y);
        const m = String(parsedDate.m).padStart(2, '0');
        const d = String(parsedDate.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    const str = String(val).trim();
    // DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const d = dmyMatch[1].padStart(2, '0');
      const m = dmyMatch[2].padStart(2, '0');
      const y = dmyMatch[3];
      return `${y}-${m}-${d}`;
    }
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    return '2016-01-01';
  };

  // -------------------------------------------------------------
  // COMMIT IMPORT TO STATE / DB
  // -------------------------------------------------------------
  const handleCommitImport = () => {
    const targetList = activeTab === 'paste' ? parsedPastedStudents : excelParsedStudents;
    if (targetList.length === 0) {
      showToast('គ្មានទិន្នន័យសិស្សសម្រាប់នាំចូលទេ', 'warning');
      return;
    }

    let addedCount = 0;
    targetList.forEach((item, idx) => {
      const fullName = `${item.lastName} ${item.firstName}`.trim();
      const newStudent: Student = {
        id: `stu_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        code: item.code || `STU-${String(students.length + idx + 1).padStart(3, '0')}`,
        nameKhmer: fullName,
        lastNameKhmer: item.lastName,
        firstNameKhmer: item.firstName,
        nameLatin: '',
        gender: item.gender,
        dob: item.dob || '2016-01-01',
        grade: targetGrade,
        section: targetSection,
        pob: item.pob || 'សាលាបឋមសិក្សាភ្នំព្រឹក',
        fatherName: item.fatherName || '',
        fatherOccupation: item.fatherJob || '',
        motherName: item.motherName || '',
        motherOccupation: item.motherJob || '',
        guardianName: item.fatherName || item.motherName || `${fullName} អាណាព្យាបាល`,
        guardianRelationship: item.fatherName ? 'ឪពុក' : (item.motherName ? 'ម្តាយ' : 'អាណាព្យាបាល'),
        guardianPhone: item.fatherPhone || item.motherPhone || item.phone || '',
        guardianOccupation: item.fatherJob || item.motherJob || 'កសិករ',
        address: item.currentAddress || '',
        livingCondition: 'ទូទៅ',
        status: 'active',
        academicYear: selectedAcademicYear,
        specialNotes: item.disability ? `ពិការភាព៖ ${item.disability}` : ''
      };

      addStudent(newStudent);
      addedCount++;
    });

    showToast(`បាននាំចូលសិស្សចំនួន ${addedCount} នាក់ ទៅក្នុងថ្នាក់ទី ${targetGrade} «${targetSection}» ដោយជោគជ័យ!`, 'success');
    if (onImportSuccess) onImportSuccess(addedCount);
    onClose();
  };

  const activeCount = activeTab === 'paste' ? parsedPastedStudents.length : excelParsedStudents.length;
  const activeFemaleCount = (activeTab === 'paste' ? parsedPastedStudents : excelParsedStudents).filter(s => s.gender === 'F').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs font-battambang animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-moul text-base sm:text-lg">នាំចូលបញ្ជីសិស្សរហ័ស (Bulk Import)</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                  ថ្នាក់ទី {targetGrade} «{targetSection}»
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                គាំទ្រទាំងការបិទភ្ជាប់ឈ្មោះរហ័ស និងឯកសារ MoEYS PLP-SMS Excel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>📋 បិទភ្ជាប់បញ្ជីឈ្មោះ (Fast Paste)</span>
            </button>

            <button
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📁 ឯកសារ Excel (MoEYS / Template)</span>
            </button>
          </div>

          {activeCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>សរុប {activeCount} នាក់ (ស្រី {activeFemaleCount} នាក់)</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ======================================================== */}
          {/* TAB 1: FAST PASTE LIST */}
          {/* ======================================================== */}
          {activeTab === 'paste' && (
            <div className="space-y-4 animate-fade-in">
              {/* 9 Column Badges */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/70 dark:border-blue-900/50">
                <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>លំដាប់ជួរឈរទាំង ៩ ពី Excel (ករណី Copy ទាំងជួរមកបិទភ្ជាប់)៖</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold">1. គោត្តនាម *</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold">2. នាម *</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold">3. ភេទ *</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">4. លេខសិស្ស</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">5. ទូរស័ព្ទ</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">6. ឈ្មោះឪពុក</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">7. ទូរស័ព្ទឪពុក</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">8. ឈ្មោះម្តាយ</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">9. ទូរស័ព្ទម្តាយ</span>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    បិទភ្ជាប់បញ្ជីឈ្មោះសិស្សនៅទីនេះ (មួយឈ្មោះក្នុងមួយបន្ទាត់)៖
                  </label>
                  {pasteText && (
                    <button
                      onClick={() => setPasteText('')}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>សម្អាត</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`ឧទាហរណ៍ទី ១ (ឈ្មោះសុទ្ធ មួយក្នុងមួយបន្ទាត់)៖
សុខ ចន្ថា
ចាន់ ដារ៉ា
រស់ សុភាព

ឧទាហរណ៍ទី ២ (Copy ពី Excel មាន Tab-Separated)៖
សុខ	ចន្ថា	ស្រី	STU-001	012345678	សុខ គង់	012345678	អ៊ុំ ម៉ាលី	098765432`}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Live Parsed Preview Table */}
              {parsedPastedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>ផ្ទៀងផ្ទាត់បញ្ជីដែលកាត់បាន ({parsedPastedStudents.length} នាក់)</span>
                    <span className="text-[11px] text-slate-500">ចុចប្តូរភេទ [ប្រុស / ស្រី] បើចាំបាច់</span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-center w-12">ល.រ</th>
                          <th className="px-3 py-2">គោត្តនាម</th>
                          <th className="px-3 py-2">នាម</th>
                          <th className="px-3 py-2 text-center w-24">ភេទ</th>
                          <th className="px-3 py-2">លេខកូដសិស្ស</th>
                          <th className="px-3 py-2">ឪពុក / ម្តាយ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedPastedStudents.map((st, idx) => (
                          <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="px-3 py-1.5 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-1.5 font-bold text-slate-900 dark:text-white">{st.lastName}</td>
                            <td className="px-3 py-1.5 font-bold text-blue-600 dark:text-blue-400">{st.firstName}</td>
                            <td className="px-3 py-1.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                st.gender === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {st.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-mono text-slate-500">{st.code}</td>
                            <td className="px-3 py-1.5 text-slate-500 text-[11px] truncate max-w-[150px]">
                              {st.fatherName || st.motherName ? `${st.fatherName || ''} / ${st.motherName || ''}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: EXCEL FILE (MoEYS PLP-SMS / TEMPLATE) */}
          {/* ======================================================== */}
          {activeTab === 'excel' && (
            <div className="space-y-4 animate-fade-in">
              {/* Instructions and Download Template Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ការណែនាំអំពីការបញ្ចូលឯកសារ Excel៖</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-200">
                    ជំហានទី ១៖ ទាញយកគំរូ → បំពេញព័ត៌មានសិស្សតាមគំរូ → upload ត្រឡប់មកវិញ ។ សូមកុំប្តូរ ឬលុបជួរក្បាល (header)។
                  </p>
                  <p className="text-[10.5px] text-emerald-700 dark:text-emerald-400 font-bold">
                    ★ ប្រព័ន្ធស្គាល់ដោយស្វ័យប្រវត្តិនូវឯកសារចេញពីប្រព័ន្ធក្រសួង MoEYS PLP-SMS ដោយមិនចាំបាច់កែប្រែជួរឈរឡើយ!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>📄 ទាញយកគំរូ Excel</span>
                </button>
              </div>

              {/* Drag & Drop File Upload Box */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    parseExcelFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      parseExcelFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div>
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {uploadedFile ? uploadedFile.name : 'អូសទម្លាក់ឯកសារ Excel (.xlsx) មកទីនេះ ឬចុចដើម្បីជ្រើសរើស'}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">
                    {uploadedFile
                      ? `ទំហំឯកសារ៖ ${(uploadedFile.size / 1024).toFixed(1)} KB`
                      : 'គាំទ្រឯកសារ .xlsx, .xls ឬ .csv ពីប្រព័ន្ធ MoEYS PLP'}
                  </p>
                </div>

                {detectedFormat && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>ទម្រង់ដែលស្គាល់៖ {detectedFormat}</span>
                  </span>
                )}
              </div>

              {/* Parsed Excel Preview Table */}
              {excelParsedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>លទ្ធផលអានឯកសារ Excel (រកឃើញសរុប {excelParsedStudents.length} នាក់ · ស្រី {activeFemaleCount} នាក់)</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto max-h-56 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-3 py-2 text-center w-12">ល.រ</th>
                          <th className="px-3 py-2">គោត្តនាម-នាម</th>
                          <th className="px-3 py-2 text-center w-20">ភេទ</th>
                          <th className="px-3 py-2">ថ្ងៃកំណើត</th>
                          <th className="px-3 py-2">ទីកន្លែងកំណើត</th>
                          <th className="px-3 py-2">ឪពុក (មុខរបរ)</th>
                          <th className="px-3 py-2">ម្តាយ (មុខរបរ)</th>
                          <th className="px-3 py-2">អាសយដ្ឋាន</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {excelParsedStudents.map((st, idx) => (
                          <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td className="px-3 py-1.5 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="px-3 py-1.5 font-bold text-slate-900 dark:text-white">
                              {st.lastName} {st.firstName}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                st.gender === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {st.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-mono text-slate-600 dark:text-slate-400">{st.dob}</td>
                            <td className="px-3 py-1.5 text-slate-500 text-[11px] truncate max-w-[120px]">{st.pob || '-'}</td>
                            <td className="px-3 py-1.5 text-slate-500 text-[11px] truncate max-w-[120px]">
                              {st.fatherName ? `${st.fatherName} (${st.fatherJob || 'កសិករ'})` : '-'}
                            </td>
                            <td className="px-3 py-1.5 text-slate-500 text-[11px] truncate max-w-[120px]">
                              {st.motherName ? `${st.motherName} (${st.motherJob || 'កសិករ'})` : '-'}
                            </td>
                            <td className="px-3 py-1.5 text-slate-500 text-[11px] truncate max-w-[140px]">{st.currentAddress || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            បោះបង់
          </button>

          <button
            type="button"
            onClick={handleCommitImport}
            disabled={activeCount === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
              activeCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {activeCount > 0
                ? `នាំចូល ${activeCount} នាក់ (ស្រី ${activeFemaleCount} នាក់)`
                : 'នាំចូលសិស្ស'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
