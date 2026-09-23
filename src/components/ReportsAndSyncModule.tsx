import React, { useState, useRef, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  FileSpreadsheet, Upload, Download, Search, 
  GraduationCap, Activity, UserPlus, HeartPulse, 
  Eye, FileBarChart, Users, CheckCircle, AlertTriangle 
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReportsAndSyncModule: React.FC = () => {
  const { students, teachers, currentUser, addStudent, updateStudent, language, showToast } = useSchool();
  
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scoping logic: Teachers only see their homeroom students. Principals see all.
  const isTeacher = currentUser?.role === 'teacher';
  const scopedStudents = useMemo(() => {
    if (isTeacher) {
      return students.filter(s => s.homeroomTeacherId === currentUser.id);
    }
    return students;
  }, [students, currentUser, isTeacher]);

  const reportTypes = [
    { id: 'scholarship', title: 'បញ្ជីឈ្មោះសិស្សអាហារូបករណ៍', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'disability', title: 'បញ្ជីឈ្មោះសិស្សមានពិការភាព', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-100' },
    { id: 'bmi', title: 'បញ្ជីឈ្មោះសិស្សមានទិន្នន័យ BMI', icon: HeartPulse, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'indigenous', title: 'សិស្សជាជនជាតិដើមភាគតិច', icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'vision_hearing', title: 'បញ្ជីសិស្សតេស្តភ្នែក និងត្រចៀក', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'staff', title: 'បញ្ជីឈ្មោះបុគ្គលិកសាលា', icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-100', adminOnly: true },
    { id: 'roster', title: 'បញ្ជីរាយនាមសាលា', icon: FileBarChart, color: 'text-slate-500', bg: 'bg-slate-100', adminOnly: true },
  ];

  const visibleReports = reportTypes.filter(r => !r.adminOnly || !isTeacher);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        let newCount = 0;
        let updateCount = 0;

        // Process each row
        jsonData.forEach(row => {
          // Determine key fields based on PLP-SMS header format (assuming standard headers or mapping them)
          const nameKh = row['Name_Kh'] || row['ឈ្មោះ'] || row['khmerName'];
          const code = row['Student_Code'] || row['អត្តលេខសិស្ស'] || row['code'];
          const gender = row['Gender'] || row['ភេទ'];
          
          if (!nameKh) return; // Skip invalid rows

          // Try to find existing student
          const existing = students.find(s => s.code === code || (s.khmerName === nameKh && s.gender === gender));
          
          if (existing) {
            // Update logic (merge logic can be added here)
            // For now, we update BMI if exists in the excel
            const updates: any = {};
            if (row['BMI']) updates.bmi = parseFloat(row['BMI']);
            if (Object.keys(updates).length > 0) {
              updateStudent(existing.id, updates);
            }
            updateCount++;
          } else {
            // Create new logic
            // Add minimum required fields
            const newStudent = {
              khmerName: nameKh,
              latinName: row['Name_En'] || row['Latin Name'] || '',
              gender: (gender === 'F' || gender === 'ស្រី') ? 'F' : 'M',
              dob: row['DOB'] || row['ថ្ងៃខែឆ្នាំកំណើត'] || '2015-01-01',
              pob: '',
              address: '',
              status: 'active' as const,
              classId: isTeacher ? (currentUser.id + '-class') : '', // If teacher imports, assign to their class
              enrollmentDate: new Date().toISOString().split('T')[0],
              contactPhone: '',
              academicHistory: [],
              immunizations: [],
              chronicConditions: [],
              physicalExams: [],
              familyInfo: { parents: [] }
            };
            
            // Note: addStudent needs a bit of refactoring for batch processing, but calling it in loop works for small files
            addStudent(newStudent, { skipTelegramNotification: true });
            newCount++;
          }
        });
        
        showToast && showToast('success', `បញ្ចូលថ្មី៖ ${newCount} នាក់, ធ្វើបច្ចុប្បន្នភាព៖ ${updateCount} នាក់`);
      } catch (err) {
        console.error(err);
        showToast && showToast('error', 'ការអាប់ឡូតឯកសារបរាជ័យ (Invalid format)');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    
    reader.readAsBinaryString(file);
  };

  const renderActiveReport = () => {
    let data: any[] = [];
    
    if (activeReport === 'scholarship') {
      data = scopedStudents.filter(s => s.scholarshipStatus);
    } else if (activeReport === 'bmi') {
      data = scopedStudents.filter(s => s.healthRecord?.bmi || s.physicalExams?.length > 0);
    } else if (activeReport === 'staff') {
      data = teachers;
    } else {
      data = scopedStudents; // default mock
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800">
            {reportTypes.find(r => r.id === activeReport)?.title}
          </h3>
          <button 
            onClick={() => setActiveReport(null)}
            className="text-slate-500 hover:text-slate-700 text-sm font-semibold"
          >
            បិទ (Close)
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {data.length === 0 ? (
            <div className="text-center text-slate-500 py-10 flex flex-col items-center">
              <AlertTriangle className="w-10 h-10 text-slate-300 mb-2" />
              <p>មិនមានទិន្នន័យសម្រាប់របាយការណ៍នេះទេ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                      {item.khmerName?.charAt(0) || item.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.khmerName || item.name}</h4>
                      <p className="text-xs text-slate-500">
                        {item.code ? `អត្តលេខ: ${item.code}` : (item.role ? `តួនាទី: ${item.role}` : '')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-700">{item.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans pb-20">
      {/* Header and Upload Action */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileSpreadsheet className="w-40 h-40 transform rotate-12" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2 tracking-tight">របាយការណ៍ និងនាំចូលទិន្នន័យសិស្ស</h2>
          <p className="text-blue-100 text-sm mb-6 max-w-md">
            ទាញយកទិន្នន័យពី MoEYS PLP-SMS (Excel/CSV) ហើយ Upload ចូលក្នុងប្រព័ន្ធ ដើម្បីអាប់ដេតទិន្នន័យដោយស្វ័យប្រវត្តិ។
          </p>
          
          <div className="flex flex-wrap gap-3">
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
              {isUploading ? 'កំពុងអាប់ឡូត...' : '📥 អាប់ឡូតឯកសារ Excel/CSV ពី PLP'}
            </button>
            
            <button className="flex items-center gap-2 bg-blue-900/50 hover:bg-blue-900 text-white border border-blue-500/30 px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm">
              <Download className="w-4 h-4" />
              ទាញយកទម្រង់គំរូ (Template)
            </button>
          </div>
        </div>
      </div>

      {/* Scope Indicator */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-slate-600">
            {isTeacher 
              ? `សិទ្ធិមើលទិន្នន័យ: ត្រឹមសិស្សក្នុងថ្នាក់របស់លោកគ្រូអ្នកគ្រូ (${scopedStudents.length} នាក់)`
              : `សិទ្ធិមើលទិន្នន័យ: ទូទាំងសាលា (${scopedStudents.length} នាក់)`}
          </span>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="ស្វែងរករាយការណ៍..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 transition-all focus:w-64"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleReports
          .filter(r => r.title.includes(searchQuery))
          .map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left group active:scale-[0.98] ${
              activeReport === report.id 
                ? 'bg-blue-50 border-blue-200 shadow-sm ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${report.bg} ${report.color}`}>
              <report.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug">
              {report.title}
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              ចុចដើម្បីមើល ឬទាញយក
            </p>
          </button>
        ))}
      </div>

      {/* Render Active Report details */}
      {activeReport && renderActiveReport()}
    </div>
  );
};
