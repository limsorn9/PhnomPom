import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Building2, UserPlus, ChevronRight, School, Save, X } from 'lucide-react';
import { SchoolProfile } from '../types';

interface SchoolEntry extends Partial<SchoolProfile> {
  id: string;
}

export const SuperAdminHub: React.FC = () => {
  const { currentUser, updateSchoolProfile, showToast, setIsSuperAdminHub } = useSchool();
  const { logout } = useAuth();
  
  // Manage list of schools
  const [schools, setSchools] = useState<SchoolEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolLevel, setNewSchoolLevel] = useState<'primary' | 'secondary' | 'high_school'>('primary');
  const [newPrincipalName, setNewPrincipalName] = useState('');

  useEffect(() => {
    // Load from local storage or set default
    const saved = localStorage.getItem('kroudigital_multi_schools');
    if (saved) {
      setSchools(JSON.parse(saved));
    } else {
      const defaultSchool: SchoolEntry = {
        id: '1',
        nameKhmer: 'សាលាបឋមសិក្សាភ្នំពុំ',
        schoolCode: '02100108027',
        level: 'primary',
        principalName: 'លោក លីម សន'
      };
      setSchools([defaultSchool]);
      localStorage.setItem('kroudigital_multi_schools', JSON.stringify([defaultSchool]));
    }
  }, []);

  const handleAddSchool = () => {
    if (!newSchoolName || !newSchoolCode) {
      showToast('សូមបំពេញឈ្មោះសាលា និងកូដសាលា', 'error');
      return;
    }
    
    const newSchool: SchoolEntry = {
      id: Date.now().toString(),
      nameKhmer: newSchoolName,
      schoolCode: newSchoolCode,
      level: newSchoolLevel,
      principalName: newPrincipalName || 'មិនទាន់មាននាយក'
    };
    
    const updated = [...schools, newSchool];
    setSchools(updated);
    localStorage.setItem('kroudigital_multi_schools', JSON.stringify(updated));
    setShowAddModal(false);
    showToast('បង្កើតសាលាថ្មីបានជោគជ័យ!', 'success');
    
    // Reset form
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewPrincipalName('');
  };

  const handleSwitchSchool = (school: SchoolEntry) => {
    updateSchoolProfile({
      nameKhmer: school.nameKhmer,
      schoolCode: school.schoolCode,
      level: school.level,
      principalName: school.principalName
    });
    showToast(`បានប្តូរទៅកាន់: ${school.nameKhmer}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#06171b] text-slate-100 font-kantumruy pb-20">
      
      {/* Top Header */}
      <div className="bg-[#0a2126] border-b border-[#164049] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">ផ្ទាំងគ្រប់គ្រង Super Admin</h1>
            <p className="text-purple-400 text-xs">ម្ចាស់ប្រព័ន្ធពហុសាលា (Multi-School System)</p>
          </div>
        </div>
        
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-[#164049] hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-bold transition">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">ចាកចេញ</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-400" />
            បញ្ជីសាលារៀនក្នុងប្រព័ន្ធ ({schools.length})
          </h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-purple-900/20"
          >
            <Plus className="w-4 h-4" />
            បន្ថែមសាលាថ្មី
          </button>
        </div>

        {/* Schools List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map(school => (
            <div key={school.id} className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col hover:border-purple-500/50 transition group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#07191d] rounded-xl flex items-center justify-center border border-[#164049] group-hover:border-purple-500/30">
                  <School className={`w-6 h-6 ${school.level === 'high_school' ? 'text-pink-400' : school.level === 'secondary' ? 'text-blue-400' : 'text-emerald-400'}`} />
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${school.level === 'high_school' ? 'bg-pink-500/20 text-pink-400' : school.level === 'secondary' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {school.level === 'high_school' ? 'វិទ្យាល័យ' : school.level === 'secondary' ? 'អនុវិទ្យាល័យ' : 'បឋមសិក្សា'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1">{school.nameKhmer}</h3>
              <p className="text-slate-400 text-sm mb-4">កូដ: {school.schoolCode}</p>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-[#0a2126] px-3 py-2 rounded-lg border border-[#164049]/50">
                  <UserPlus className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">នាយក: {school.principalName}</span>
                </div>
                
                <button 
                  onClick={() => handleSwitchSchool(school)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#164049] hover:bg-purple-600 text-white rounded-xl text-sm font-bold transition"
                >
                  ចូលមើលសាលានេះ <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d282e] border border-[#164049] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#164049] flex items-center justify-between bg-[#0a2126]">
              <h3 className="text-lg font-bold text-white">បន្ថែមសាលារៀនថ្មី</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">ឈ្មោះសាលា (Khmer)</label>
                <input 
                  type="text" 
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full bg-[#07191d] border border-[#164049] text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  placeholder="ឧ. វិទ្យាល័យបាត់ដំបង"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">កូដសាលា (School Code)</label>
                <input 
                  type="text" 
                  value={newSchoolCode}
                  onChange={(e) => setNewSchoolCode(e.target.value)}
                  className="w-full bg-[#07191d] border border-[#164049] text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  placeholder="ឧ. 02100100000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">កម្រិតសាលា (Level)</label>
                <select 
                  value={newSchoolLevel}
                  onChange={(e) => setNewSchoolLevel(e.target.value as any)}
                  className="w-full bg-[#07191d] border border-[#164049] text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 appearance-none"
                >
                  <option value="primary">បឋមសិក្សា (Primary)</option>
                  <option value="secondary">អនុវិទ្យាល័យ (Secondary)</option>
                  <option value="high_school">វិទ្យាល័យ (High School)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">ឈ្មោះនាយកសាលា</label>
                <input 
                  type="text" 
                  value={newPrincipalName}
                  onChange={(e) => setNewPrincipalName(e.target.value)}
                  className="w-full bg-[#07191d] border border-[#164049] text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500"
                  placeholder="ឧ. លោក សុខ សាន"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-[#164049] flex justify-end gap-3 bg-[#0a2126]">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-300 hover:text-white transition"
              >
                បោះបង់
              </button>
              <button 
                onClick={handleAddSchool}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
