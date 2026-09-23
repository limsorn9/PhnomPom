import React, { useState } from 'react';
import { Student } from '../../types';
import { 
  Users, UploadCloud, PlusCircle, Printer, 
  Edit3, User, MapPin, Heart, AlertTriangle, 
  Save, X
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface TeacherClassroomHubProps {
  students: Student[];
  selectedGrade: number;
  selectedSection: string;
}

export const TeacherClassroomHub: React.FC<TeacherClassroomHubProps> = ({
  students,
  selectedGrade,
  selectedSection
}) => {
  const { addStudent, updateStudent } = useSchool();
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Filter students for this class
  const classStudents = (students || []).filter(
    s => s && s.grade === selectedGrade && s.section === selectedSection
  );
  
  const femaleCount = classStudents.filter(s => s.gender === 'female').length;

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const handleSaveProfile = () => {
    if (selectedStudent) {
      updateStudent(selectedStudent.id, selectedStudent);
      alert('រក្សាទុកប្រវត្តិរូបសិស្សជោគជ័យ! (Saved to localStorage)');
      setIsEditOpen(false);
    }
  };

  return (
    <div className="bg-[#07191d] min-h-screen text-slate-100 p-3 sm:p-5 md:p-8 font-sans pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Controller */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            👥 បញ្ជីសិស្សក្នុងថ្នាក់
          </h2>
          <p className="text-emerald-400 font-medium text-sm">
            ថ្នាក់ទី{selectedGrade}{selectedSection} · សរុប {classStudents.length} នាក់ (ស្រី {femaleCount} នាក់)
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-wrap gap-3">
          <button 
            onClick={() => setIsBulkOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 border border-indigo-800/50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span className="truncate">📥 នាំចូលសិស្ស (Excel)</span>
          </button>
          
          <button 
            onClick={() => {
              setSelectedStudent({
                id: Date.now().toString(),
                code: '',
                nameKhmer: '',
                nameLatin: '',
                gender: 'male',
                dob: '',
                grade: selectedGrade,
                section: selectedSection,
                schoolId: '02100108027'
              } as Student);
              setIsEditOpen(true);
            }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-800/50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            <PlusCircle className="w-4 h-4" />
            <span className="truncate">+ បន្ថែមសិស្សម្នាក់</span>
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none px-4 py-2.5 bg-[#0a2328] hover:bg-[#10323a] text-slate-300 border border-[#164049] rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            <Printer className="w-4 h-4" />
            <span className="truncate">🖨️ បោះពុម្ពបញ្ជីឈ្មោះ</span>
          </button>
        </div>

        {/* Touch-Friendly Student Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classStudents.map((student, index) => (
            <div 
              key={student.id} 
              className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg hover:bg-[#10323a]/90 transition-colors backdrop-blur-md"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="shrink-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">#{index + 1}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    student.gender === 'female' ? 'bg-pink-900/40 text-pink-400 border border-pink-800/50' : 'bg-blue-900/40 text-blue-400 border border-blue-800/50'
                  }`}>
                    {student.nameKhmer.charAt(0) || 'ស'}
                  </div>
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-200 truncate">{student.nameKhmer}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono text-slate-400 bg-[#0a2328] px-1.5 py-0.5 rounded border border-[#164049]">
                      {student.code || 'NO-ID'}
                    </span>
                    {student.dob && (
                      <span className="text-[10px] text-slate-500 truncate">{student.dob}</span>
                    )}
                    {(student.equityFundLevel === 'Level 1' || student.equityFundLevel === 'Level 2') && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ក្រ{student.equityFundLevel === 'Level 1' ? '១' : '២'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleEdit(student)}
                className="shrink-0 h-[38px] w-[38px] flex items-center justify-center bg-cyan-950/50 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/50 rounded-xl transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {classStudents.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-[#0d282e]/50 rounded-2xl border border-[#164049]/50">
              មិនមានសិស្សនៅក្នុងថ្នាក់នេះទេ
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Fullscreen Sheet Modal */}
      {isEditOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#07191d]/95 backdrop-blur-md overflow-y-auto">
          <div className="max-w-3xl mx-auto min-h-screen flex flex-col relative pb-24">
            
            <div className="sticky top-0 z-10 bg-[#07191d]/90 backdrop-blur-xl border-b border-[#164049] px-4 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" /> កែប្រែប្រវត្តិរូបសិស្ស
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="p-2 bg-[#0a2328] hover:bg-[#10323a] text-slate-400 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* កាត ១: ព័ត៌មានផ្ទាល់ខ្លួន */}
              <div className="bg-[#0d282e] border border-[#164049] rounded-2xl p-5 shadow-lg">
                <h4 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2 border-b border-[#164049] pb-2">
                  <User className="w-4 h-4" /> ព័ត៌មានផ្ទាល់ខ្លួន
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">គោត្តនាម-នាម</label>
                    <input 
                      type="text" 
                      value={selectedStudent.nameKhmer}
                      onChange={e => setSelectedStudent({...selectedStudent, nameKhmer: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">អក្សរឡាតាំង</label>
                    <input 
                      type="text" 
                      value={selectedStudent.nameLatin || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, nameLatin: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 uppercase" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">អត្តលេខសិស្ស</label>
                    <input 
                      type="text" 
                      value={selectedStudent.code}
                      onChange={e => setSelectedStudent({...selectedStudent, code: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ភេទ</label>
                      <select 
                        value={selectedStudent.gender}
                        onChange={e => setSelectedStudent({...selectedStudent, gender: e.target.value as 'male' | 'female'})}
                        className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="male">ប្រុស</option>
                        <option value="female">ស្រី</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ថ្ងៃខែឆ្នាំកំណើត</label>
                      <input 
                        type="date" 
                        value={selectedStudent.dob}
                        onChange={e => setSelectedStudent({...selectedStudent, dob: e.target.value})}
                        className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* កាត ២: អាសយដ្ឋាន (៤ ថ្នាក់) */}
              <div className="bg-[#0d282e] border border-[#164049] rounded-2xl p-5 shadow-lg">
                <h4 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 border-b border-[#164049] pb-2">
                  <MapPin className="w-4 h-4" /> ទីកន្លែងកំណើត និងលំនៅបច្ចុប្បន្ន
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-full">
                    <label className="block text-xs text-slate-400 mb-1">អាសយដ្ឋានលម្អិត</label>
                    <input 
                      type="text" 
                      placeholder="ភូមិអូរ, ឃុំបារាំងធ្លាក់, ស្រុកភ្នំព្រឹក, ខេត្តបាត់ដំបង"
                      value={selectedStudent.address || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, address: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                </div>
              </div>

              {/* កាត ៣: គ្រួសារ & អាណាព្យាបាល */}
              <div className="bg-[#0d282e] border border-[#164049] rounded-2xl p-5 shadow-lg">
                <h4 className="text-sm font-bold text-pink-400 mb-4 flex items-center gap-2 border-b border-[#164049] pb-2">
                  <Heart className="w-4 h-4" /> គ្រួសារ & អាណាព្យាបាល
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ឈ្មោះឪពុក</label>
                    <input 
                      type="text" 
                      value={selectedStudent.fatherName || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, fatherName: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">មុខរបរឪពុក</label>
                    <input 
                      type="text" 
                      value={selectedStudent.fatherJob || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, fatherJob: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ឈ្មោះម្តាយ</label>
                    <input 
                      type="text" 
                      value={selectedStudent.motherName || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, motherName: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">មុខរបរម្តាយ</label>
                    <input 
                      type="text" 
                      value={selectedStudent.motherJob || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, motherJob: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-xs text-slate-400 mb-1">លេខទូរស័ព្ទអាណាព្យាបាល</label>
                    <input 
                      type="tel" 
                      value={selectedStudent.guardianPhone || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, guardianPhone: e.target.value})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                </div>
              </div>

              {/* កាត ៤: ស្ថានភាពពិសេស */}
              <div className="bg-[#0d282e] border border-[#164049] rounded-2xl p-5 shadow-lg mb-8">
                <h4 className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2 border-b border-[#164049] pb-2">
                  <AlertTriangle className="w-4 h-4" /> ស្ថានភាពពិសេស
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">បណ្ណសមធម៌ក្រីក្រ</label>
                    <select 
                      value={selectedStudent.equityFundLevel || ''}
                      onChange={e => setSelectedStudent({...selectedStudent, equityFundLevel: e.target.value as any})}
                      className="w-full bg-[#0a2328] border border-[#164049] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">(គ្មាន)</option>
                      <option value="Level 1">កម្រិត ១ (ក្រ ១)</option>
                      <option value="Level 2">កម្រិត ២ (ក្រ ២)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t sm:border-t-0 sm:border-l border-[#164049] sm:pl-4">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedStudent.scholarship || false}
                        onChange={e => setSelectedStudent({...selectedStudent, scholarship: e.target.checked})}
                        className="w-5 h-5 rounded border-[#164049] bg-[#0a2328] text-cyan-500 focus:ring-cyan-500"
                      />
                      មានអាហារូបករណ៍
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedStudent.disability || false}
                        onChange={e => setSelectedStudent({...selectedStudent, disability: e.target.checked})}
                        className="w-5 h-5 rounded border-[#164049] bg-[#0a2328] text-cyan-500 focus:ring-cyan-500"
                      />
                      ពិការភាព
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#07191d]/90 backdrop-blur-xl border-t border-[#164049] z-20">
              <div className="max-w-3xl mx-auto flex gap-3">
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="px-6 py-3 rounded-xl border border-[#164049] text-slate-300 font-bold hover:bg-[#10323a] transition-colors"
                >
                  បោះបង់
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                >
                  <Save className="w-5 h-5" /> រក្សាទុកប្រវត្តិរូប
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
