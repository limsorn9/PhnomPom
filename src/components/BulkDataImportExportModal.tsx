import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, StudentScore } from '../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  HelpCircle,
  Database,
  ArrowDownToLine,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface BulkDataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkDataImportExportModal: React.FC<BulkDataImportExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    students,
    addStudent,
    scores,
    saveStudentScore,
    classrooms,
    schoolProfile,
    showToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'import_students' | 'import_scores' | 'export_all'>('import_students');
  const [importText, setImportText] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate Sample Student CSV Template
  const handleDownloadStudentTemplate = () => {
    const csvContent =
      '\uFEFF' +
      'ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ (M/F),ថ្ងៃខែឆ្នាំកំណើត (YYYY-MM-DD),ទីកន្លែងកំណើត,ថ្នាក់ទី (1-6),បន្ទប់ (ក/ខ/គ),ឈ្មោះឪពុក,មុខរបរឪពុក,ឈ្មោះម្តាយ,មុខរបរម្តាយ,លេខទូរស័ព្ទ,ស្ថានភាពជីវភាព (ទូទៅ/ក្រ១/ក្រ២/ងាយរងហានិភ័យ)\n' +
      'សាន់ វណ្ណា,SANN VANNA,M,2015-04-12,បាត់ដំបង,5,ក,សាន់ វិចិត្រ,កសិករ,ម៉ៅ ស្រីនាង,មេផ្ទះ,012334455,ទូទៅ\n' +
      'កែវ សុខនី,KEO SOKNY,F,2015-08-20,បាត់ដំបង,5,ក,កែវ ពិសិដ្ឋ,កម្មករ,លឹម សុភា,កសិករ,098765432,ក្រ១\n' +
      'ហេង ចាន់រិទ្ធ,HENG CHANRITH,M,2015-01-15,បាត់ដំបង,5,ក,ហេង ចាន់ថន,អាជីវករ,អ៊ុក សុជាតា,អាជីវករ,077112233,ទូទៅ';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_MoEYS_Student_Registration_${schoolProfile.academicYear.replace(/\s+/g, '_')}.csv`;
    link.click();
    showToast('បានទាញយកគំរូ CSV ចុះឈ្មោះសិស្ស MoEYS ជោគជ័យ!');
  };

  // Generate Sample Scores CSV Template
  const handleDownloadScoresTemplate = () => {
    const csvContent =
      '\uFEFF' +
      'អត្តលេខសិស្ស (Code),ឈ្មោះសិស្ស,ខែ (Month),ឆ្នាំសិក្សា,តែងសេចក្តី (10),សរសេរតាមអាន (10),អំណាន (10),វេយ្យាករណ៍ (10),គណិតវិទ្យា (10),វិទ្យាសាស្ត្រ (10),សិក្សាសង្គម (10),សីលធម៌ពលរដ្ឋ (10),អប់រំកាយ/សិល្បៈ (10)\n' +
      'STU-2024-001,សាន់ វណ្ណា,វិច្ឆិកា,២០២៤ - ២០២៥,8.5,9.0,8.5,8.0,9.5,8.5,9.0,9.0,9.5\n' +
      'STU-2024-002,កែវ សុខនី,វិច្ឆិកា,២០២៤ - ២០២៥,9.0,9.5,9.0,9.0,10.0,9.0,9.5,9.5,9.5\n' +
      'STU-2024-003,ហេង ចាន់រិទ្ធ,វិច្ឆិកា,២០២៤ - ២០២៥,7.0,8.0,7.5,7.0,8.5,7.5,8.0,8.5,9.0';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_MoEYS_Exam_Scores_${schoolProfile.academicYear.replace(/\s+/g, '_')}.csv`;
    link.click();
    showToast('បានទាញយកគំរូ CSV ស្រង់ពិន្ទុប្រឡង MoEYS ជោគជ័យ!');
  };

  // Parse Student CSV/Text
  const handleParseStudents = (rawText: string) => {
    setParseError(null);
    try {
      const lines = rawText.trim().split('\n');
      if (lines.length < 2) {
        setParseError('ឯកសារគ្មានទិន្នន័យ ឬខ្វះជួរក្បាលតារាង');
        return;
      }
      const parsed: any[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 4) {
          parsed.push({
            nameKhmer: cols[0] || 'សិស្សថ្មី',
            nameLatin: cols[1] || '',
            gender: (cols[2] === 'F' || cols[2] === 'ស្រី' ? 'F' : 'M') as 'M' | 'F',
            dob: cols[3] || '2015-01-01',
            pob: cols[4] || 'ខេត្តបាត់ដំបង',
            grade: parseInt(cols[5]) || 1,
            section: cols[6] || 'ក',
            fatherName: cols[7] || '',
            fatherOccupation: cols[8] || '',
            motherName: cols[9] || '',
            motherOccupation: cols[10] || '',
            phone: cols[11] || '',
            familyStatus: (cols[12] || 'ទូទៅ') as any,
            currentAddress: `ភូមិ... ឃុំ${schoolProfile.commune} ស្រុក${schoolProfile.district}`,
            guardianName: cols[7] || cols[9] || '',
            guardianPhone: cols[11] || '',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'active',
            bloodType: 'O',
            allergies: 'គ្មាន',
            chronicConditions: 'គ្មាន',
            weightKg: 28,
            heightCm: 125
          });
        }
      }
      setParsedPreview(parsed);
      showToast(`បានត្រួតពិនិត្យទិន្នន័យសិស្ស ${parsed.length} នាក់ ត្រឹមត្រូវ!`);
    } catch (e: any) {
      setParseError(e.message || 'កំហុសក្នុងការអានទិន្នន័យ CSV');
    }
  };

  // Commit Students Import
  const handleCommitStudents = () => {
    if (parsedPreview.length === 0) return;
    parsedPreview.forEach(s => {
      addStudent(s);
    });
    showToast(`បានបញ្ចូលសិស្សចំនួន ${parsedPreview.length} នាក់ ទៅក្នុងប្រព័ន្ធដោយជោគជ័យ!`);
    setParsedPreview([]);
    setImportText('');
    onClose();
  };

  // Handle File Upload Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setImportText(content);
      handleParseStudents(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
              <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-moul">នាំចូល និងនាំចេញទិន្នន័យធំ (Bulk Data Hub)</h3>
              <p className="text-xs text-blue-100 mt-0.5">MoEYS Standard CSV / Excel Batch Import & Export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('import_students');
              setParsedPreview([]);
              setImportText('');
            }}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'import_students'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            នាំចូលបញ្ជីសិស្ស (Import Students)
          </button>

          <button
            onClick={() => {
              setActiveTab('import_scores');
              setParsedPreview([]);
              setImportText('');
            }}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'import_scores'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            នាំចូលពិន្ទុប្រឡង (Import Scores)
          </button>

          <button
            onClick={() => setActiveTab('export_all')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'export_all'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ទាញយកគំរូ & Backup (Templates & Export)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: Import Students */}
          {activeTab === 'import_students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">គំរូទម្រង់ឯកសារចុះឈ្មោះសិស្ស MoEYS</h4>
                    <p className="text-[11px] text-slate-600">ទាញយកឯកសារគំរូ CSV បំពេញទិន្នន័យ ហើយ Upload ត្រឡប់មកវិញ</p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadStudentTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយក Template</span>
                </button>
              </div>

              {/* Upload Input */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">ជ្រើសរើសឯកសារ CSV ឬទម្លាក់ឯកសារទីនេះ</label>
                <input
                  type="file"
                  accept=".csv, .txt"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-300 rounded-2xl p-2"
                />
              </div>

              {/* Or Paste Text Area */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">ឬចម្លងទិន្នន័យ (CSV Raw Text) ដាក់ក្នុងប្រអប់នេះ</label>
                <textarea
                  rows={4}
                  placeholder="ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ,ថ្ងៃខែឆ្នាំកំណើត,ទីកន្លែងកំណើត,ថ្នាក់ទី,បន្ទប់..."
                  value={importText}
                  onChange={e => {
                    setImportText(e.target.value);
                    if (e.target.value) handleParseStudents(e.target.value);
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      ផ្ទៀងផ្ទាត់ទិន្នន័យមុននឹងបញ្ចូល ({parsedPreview.length} នាក់)
                    </span>
                    <button
                      onClick={handleCommitStudents}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                    >
                      ✓ យល់ព្រមបញ្ចូលសិស្សទាំងអស់
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2">ល.រ</th>
                          <th className="p-2">ឈ្មោះខ្មែរ</th>
                          <th className="p-2">ឈ្មោះឡាតាំង</th>
                          <th className="p-2">ភេទ</th>
                          <th className="p-2">ថ្ងៃខែឆ្នាំកំណើត</th>
                          <th className="p-2">ថ្នាក់</th>
                          <th className="p-2">ឪពុក/ម្តាយ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {parsedPreview.map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-500 font-bold">{i + 1}</td>
                            <td className="p-2 font-bold text-slate-900">{s.nameKhmer}</td>
                            <td className="p-2 text-slate-600">{s.nameLatin}</td>
                            <td className="p-2">{s.gender === 'M' ? 'ប្រុស' : 'ស្រី'}</td>
                            <td className="p-2 font-mono">{s.dob}</td>
                            <td className="p-2 font-bold text-blue-700">ថ្នាក់ទី{s.grade}{s.section}</td>
                            <td className="p-2 text-slate-600">{s.fatherName || s.motherName || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Import Scores */}
          {activeTab === 'import_scores' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-purple-50 p-4 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">គំរូទម្រង់ស្រង់ពិន្ទុប្រឡង MoEYS</h4>
                    <p className="text-[11px] text-slate-600">គំរូស្រង់ពិន្ទុមុខវិជ្ជាស្នូលតាមក្បួនខ្នាតក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadScoresTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយក Template</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">ការណែនាំស្តីពីការបញ្ចូលពិន្ទុ៖</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>អត្តលេខសិស្ស (Code) ត្រូវតែត្រឹមត្រូវស្របតាមទិន្នន័យសិស្សក្នុងប្រព័ន្ធ (ឧ. STU-2024-001)។</li>
                  <li>ពិន្ទុត្រូវគិតលើមាត្រដ្ឋាន ០ ដល់ ១០ សម្រាប់មុខវិជ្ជានីមួយៗ។</li>
                  <li>ប្រព័ន្ធនឹងគណនាពិន្ទុសរុប មធ្យមភាគ និងចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ។</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Export All */}
          {activeTab === 'export_all' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">ទាញយកបញ្ជីសិស្សទាំងអស់ (CSV)</h4>
                  <p className="text-[11px] text-slate-500 mt-1">ទិន្នន័យសិស្សានុសិស្ស {students.length} នាក់ រួមទាំងព័ត៌មានលម្អិត</p>
                </div>
                <button
                  onClick={handleDownloadStudentTemplate}
                  className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយក CSV សិស្ស</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">ទាញយកពិន្ទុប្រឡងទាំងអស់ (CSV)</h4>
                  <p className="text-[11px] text-slate-500 mt-1">ទិន្នន័យពិន្ទុប្រចាំខែ និងឆមាសគ្រប់ថ្នាក់រៀន</p>
                </div>
                <button
                  onClick={handleDownloadScoresTemplate}
                  className="flex items-center justify-center gap-1.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយក CSV ពិន្ទុ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
