import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useSchool } from '../context/SchoolContext';
import { Student, Gender } from '../types';
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader2,
  Check
} from 'lucide-react';

interface BulkImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGrade: number;
  targetSection: string;
  onImportSuccess?: (count: number) => void;
}

interface ParsedPLPStudent {
  lastName: string;
  firstName: string;
  username: string;
  password?: string;
  dob: string;
  gender: string;
  phone: string;
  nationality: string;
  schoolId: string;
  academicYear: string;
  gradeLevel: string;
  classroom: string;
  address: string;
  fatherLastName: string;
  fatherFirstName: string;
  fatherPhone: string;
  fatherOccupation: string;
  fatherAddress: string;
  motherLastName: string;
  motherFirstName: string;
  motherPhone: string;
  motherOccupation: string;
  motherAddress: string;
  ethnicMinority: string;
  specialNeeds: string;
}

export const BulkImportStudentsModal: React.FC<BulkImportStudentsModalProps> = ({
  isOpen,
  onClose,
  targetGrade,
  targetSection,
  onImportSuccess
}) => {
  const { students, addStudent, updateStudent, classrooms, setClassrooms, showToast } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedData, setParsedData] = useState<ParsedPLPStudent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // PLP headers: expects a flat array of objects
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, any>[];
        
        const mappedData: ParsedPLPStudent[] = data.map(row => ({
          lastName: row['គោត្តនាម'] || row['lastName'] || '',
          firstName: row['នាម'] || row['firstName'] || '',
          username: row['ឈ្មោះអ្នកប្រើ'] || row['username'] || '',
          password: row['ពាក្យសម្ងាត់'] || row['password'] || '',
          dob: row['ថ្ងៃខែឆ្នាំកំណើត'] || row['dob'] || '',
          gender: row['ភេទ'] || row['gender'] || '',
          phone: row['លេខទូរស័ព្ទ'] || row['phone'] || '',
          nationality: row['សញ្ជាតិ'] || row['nationality'] || '',
          schoolId: row['លេខសាលា'] || row['schoolId'] || '',
          academicYear: row['ឆ្នាំសិក្សា'] || row['academicYear'] || '',
          gradeLevel: String(row['កម្រិតថ្នាក់'] || row['gradeLevel'] || targetGrade),
          classroom: row['ថ្នាក់ទី'] || row['classroom'] || targetSection,
          address: row['អាសយដ្ឋានពេញ'] || row['address'] || '',
          fatherLastName: row['គោត្តនាមឪពុក'] || row['FatherLastName'] || '',
          fatherFirstName: row['នាមឪពុក'] || row['FatherFirstName'] || '',
          fatherPhone: row['ទូរស័ព្ទឪពុក'] || row['FatherPhone'] || '',
          fatherOccupation: row['មុខរបរឪពុក'] || row['FatherOccupation'] || '',
          fatherAddress: row['អាសយដ្ឋានឪពុក'] || row['FatherAddress'] || '',
          motherLastName: row['គោត្តនាមម្តាយ'] || row['MotherLastName'] || '',
          motherFirstName: row['នាមម្តាយ'] || row['MotherFirstName'] || '',
          motherPhone: row['ទូរស័ព្ទម្តាយ'] || row['MotherPhone'] || '',
          motherOccupation: row['មុខរបរម្តាយ'] || row['MotherOccupation'] || '',
          motherAddress: row['អាសយដ្ឋានម្តាយ'] || row['MotherAddress'] || '',
          ethnicMinority: row['ជនជាតិភាគតិច'] || row['ethnicMinority'] || '',
          specialNeeds: row['លក្ខណៈពិសេស/ពិការភាព'] || row['specialNeeds'] || ''
        }));

        setParsedData(mappedData.filter(m => m.firstName || m.lastName));
      } catch (err: any) {
        setError('មានបញ្ហាក្នុងការអានឯកសារ។ សូមពិនិត្យទម្រង់ (Format) ឡើងវិញ។');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setIsProcessing(true);
    
    let successCount = 0;
    
    // Process one by one for upsert logic
    for (const record of parsedData) {
      // Find existing student by username or generating code match
      const existingStudent = students.find(s => 
        (record.username && s.code === record.username) || 
        (s.nameKhmer === `${record.lastName} ${record.firstName}`)
      );

      const parsedGrade = parseInt(record.gradeLevel, 10) || targetGrade;
      const parsedSection = record.classroom || targetSection;
      const parsedGender: Gender = (record.gender.includes('ស្រី') || record.gender.toLowerCase() === 'f') ? 'F' : 'M';

      const studentData: Partial<Student> = {
        nameKhmer: `${record.lastName} ${record.firstName}`.trim(),
        nameLatin: '', // Generated if missing
        gender: parsedGender,
        dob: record.dob || '2000-01-01',
        grade: parsedGrade,
        section: parsedSection,
        pob: record.address,
        address: record.address,
        fatherName: `${record.fatherLastName} ${record.fatherFirstName}`.trim(),
        fatherPhone: record.fatherPhone,
        fatherOccupation: record.fatherOccupation,
        motherName: `${record.motherLastName} ${record.motherFirstName}`.trim(),
        motherPhone: record.motherPhone,
        motherOccupation: record.motherOccupation,
        disability: record.specialNeeds,
        guardianName: `${record.motherLastName} ${record.motherFirstName}`.trim() || `${record.fatherLastName} ${record.fatherFirstName}`.trim(),
        guardianRelationship: 'ម្តាយ',
        guardianPhone: record.motherPhone || record.fatherPhone,
        guardianOccupation: record.motherOccupation || record.fatherOccupation,
      };

      if (existingStudent) {
        // Update
        updateStudent(existingStudent.id, studentData);
        successCount++;
      } else {
        // Insert
        addStudent(studentData as Omit<Student, 'id' | 'code'>, { skipTelegramNotification: true });
        successCount++;
      }

      // Ensure classroom exists
      const existingClass = classrooms.find(c => c.grade === parsedGrade && c.section === parsedSection);
      if (!existingClass) {
        setClassrooms(prev => [...prev, {
          id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          grade: parsedGrade,
          section: parsedSection,
          academicYear: record.academicYear || '2025-2026',
          capacity: 50,
          roomNumber: `${parsedGrade}${parsedSection}`
        }]);
      }
    }

    setIsProcessing(false);
    showToast(`បាននាំចូលសិស្សជោគជ័យចំនួន ${successCount} នាក់!`, 'success');
    if (onImportSuccess) onImportSuccess(successCount);
    onClose();
  };

  const generateTemplate = () => {
    const template = [
      {
        "គោត្តនាម": "លីម",
        "នាម": "សន",
        "ឈ្មោះអ្នកប្រើ": "stu001",
        "ពាក្យសម្ងាត់": "123456",
        "ថ្ងៃខែឆ្នាំកំណើត": "2010-01-01",
        "ភេទ": "ប្រុស",
        "លេខទូរស័ព្ទ": "012345678",
        "សញ្ជាតិ": "ខ្មែរ",
        "លេខសាលា": "021001",
        "ឆ្នាំសិក្សា": "2025-2026",
        "កម្រិតថ្នាក់": targetGrade,
        "ថ្នាក់ទី": targetSection,
        "អាសយដ្ឋានពេញ": "ភ្នំពេញ",
        "គោត្តនាមឪពុក": "មាស",
        "នាមឪពុក": "សុខ",
        "ទូរស័ព្ទឪពុក": "012345678",
        "មុខរបរឪពុក": "កសិករ",
        "អាសយដ្ឋានឪពុក": "ភ្នំពេញ",
        "គោត្តនាមម្តាយ": "សៅ",
        "នាមម្តាយ": "រី",
        "ទូរស័ព្ទម្តាយ": "012345679",
        "មុខរបរម្តាយ": "មេផ្ទះ",
        "អាសយដ្ឋានម្តាយ": "ភ្នំពេញ",
        "ជនជាតិភាគតិច": "",
        "លក្ខណៈពិសេស/ពិការភាព": ""
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PLP-SMS");
    XLSX.writeFile(wb, "PLP-SMS_Student_Template.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a2126] w-full max-w-4xl rounded-2xl border border-[#164049] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#164049]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">នាំចូលទិន្នន័យសិស្សតាម Excel/CSV</h2>
              <p className="text-emerald-400 text-sm">ទម្រង់ផ្លូវការរបស់ MoEYS PLP-SMS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#164049]/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* Instructions */}
          <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl p-4 flex gap-4">
            <div className="shrink-0 mt-1">
              <AlertCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-sm text-slate-300 space-y-2">
              <p>សូមធ្វើការអាប់ឡូតឯកសារ Excel ឬ CSV ដែលមានទម្រង់ (Format) ដូច PLP-SMS។</p>
              <ul className="list-disc pl-5 text-emerald-300/80 space-y-1">
                <li>ប្រព័ន្ធនឹងត្រួតពិនិត្យ និង <b>Update</b> សិស្សដែលមានឈ្មោះ ឬអត្តលេខរួចហើយ។</li>
                <li>ប្រសិនបើជាសិស្សថ្មី ប្រព័ន្ធនឹង <b>Insert</b> ចូលក្នុងបញ្ជីដោយស្វ័យប្រវត្តិ។</li>
              </ul>
              <button onClick={generateTemplate} className="mt-2 text-emerald-400 hover:text-emerald-300 underline font-medium inline-flex items-center gap-1">
                <Download className="w-3 h-3" /> ទាញយកឯកសារគំរូ (Template)
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#164049] hover:border-emerald-500/50 bg-[#0d282e]/50 rounded-2xl p-8 text-center cursor-pointer transition-all group"
          >
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <div className="w-16 h-16 rounded-full bg-[#164049]/50 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 mx-auto flex items-center justify-center transition-colors mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-white font-bold mb-2">ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ</h3>
            <p className="text-slate-400 text-sm">គាំទ្រឯកសារ .xlsx, .xls, ឬ .csv</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {/* Preview */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                ទិន្នន័យដែលបានអាន ({parsedData.length} នាក់)
              </h3>
              <div className="bg-[#0d282e] border border-[#164049] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-[#164049]/50">
                      <tr>
                        <th className="px-4 py-3">ឈ្មោះសិស្ស</th>
                        <th className="px-4 py-3">ភេទ</th>
                        <th className="px-4 py-3">ឈ្មោះអ្នកប្រើ</th>
                        <th className="px-4 py-3">កម្រិតថ្នាក់</th>
                        <th className="px-4 py-3">ថ្នាក់ទី</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#164049]/30">
                      {parsedData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#164049]/20">
                          <td className="px-4 py-3 font-medium text-white">{row.lastName} {row.firstName}</td>
                          <td className="px-4 py-3 text-slate-300">{row.gender}</td>
                          <td className="px-4 py-3 text-slate-300">{row.username}</td>
                          <td className="px-4 py-3 text-emerald-400">{row.gradeLevel}</td>
                          <td className="px-4 py-3 text-cyan-400">{row.classroom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 5 && (
                  <div className="p-3 text-center text-xs text-slate-400 border-t border-[#164049]/30 bg-[#0d282e]/80">
                    និង {parsedData.length - 5} នាក់ទៀត...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#164049] flex justify-end gap-3 bg-[#0a2126]">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-slate-300 font-medium hover:bg-[#164049]/50 transition"
          >
            បោះបង់
          </button>
          <button
            onClick={handleImport}
            disabled={parsedData.length === 0 || isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            យល់ព្រមនាំចូល
          </button>
        </div>
      </div>
    </div>
  );
};
