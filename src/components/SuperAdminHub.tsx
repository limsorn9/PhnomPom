                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Building2, UserPlus, ChevronRight, School, ChevronDown, Trash2 } from 'lucide-react';
import { SchoolProfile } from '../types';

interface SchoolEntry extends Partial<SchoolProfile> {
  id: string;
}

const LEVEL_LABELS = {
  primary: 'បឋមសិក្សា',
  secondary: 'អនុវិទ្យាល័យ',
  high_school: 'វិទ្យាល័យ'
} as const;

const LEVEL_COLORS = {
  primary: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  secondary: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  high_school: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
} as const;

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

  // Expanded levels
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load from local storage or set default
    const saved = localStorage.getItem('kroudigital_multi_schools_v5');
    if (saved) {
      setSchools(JSON.parse(saved));
    } else {
      const defaultSchools: SchoolEntry[] = [
        {
          id: 'phnom_pom_primary',
          nameKhmer: 'សាលាបឋមសិក្សាភ្នំពុំ',
          schoolCode: '02100108027',
          level: 'primary',
          principalName: 'លោកគ្រូ លីម សន'
        }
      ];
      setSchools(defaultSchools);
      localStorage.setItem('kroudigital_multi_schools_v5', JSON.stringify(defaultSchools));
    }
  }, []);

  const handleAddSchool = () => {
    if (!newSchoolName || !newSchoolCode) {
      showToast('សូមបញ្ចូលឈ្មោះ និងលេខកូដសាលា', 'error');
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
    localStorage.setItem('kroudigital_multi_schools_v5', JSON.stringify(updated));
    setShowAddModal(false);
    showToast('បានបន្ថែមសាលាថ្មីដោយជោគជ័យ!', 'success');
    
    // Reset form
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewPrincipalName('');
  };

  const handleSwitchSchool = (school: SchoolEntry) => {
    // Save the active school code to dynamically change LOCAL_STORAGE_KEY
    localStorage.setItem('kroudigital_active_school_code', school.schoolCode || school.id);
    
    // Seed the target school's profile directly in localStorage before reloading
    const targetKey = `kroudigital_school_${school.schoolCode || school.id}_profile`;
    const existingTargetProfile = localStorage.getItem(targetKey);
    const parsedProfile = existingTargetProfile ? JSON.parse(existingTargetProfile) : {};
    
    localStorage.setItem(targetKey, JSON.stringify({
      ...parsedProfile,
      nameKhmer: school.nameKhmer,
      schoolCode: school.schoolCode,
      level: school.level,
      principalName: school.principalName
    }));

    // Turn off the hub view so it boots straight into AdminLayout
    localStorage.setItem('is_super_admin_hub', 'false');
    
    showToast(`កំពុងចូលមើលសាលា: ${school.nameKhmer}`, 'success');
    
    // Force reload to completely swap out LOCAL_STORAGE_KEY in SchoolContext
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const handleDeleteSchool = (id: string, name: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបសាលា "${name}" នេះចេញពីប្រព័ន្ធមែនទេ?`)) {
      const updated = schools.filter(s => s.id !== id);
      setSchools(updated);
      localStorage.setItem('kroudigital_multi_schools_v5', JSON.stringify(updated));
      showToast('សាលាត្រូវបានលុបដោយជោគជ័យ', 'info');
    }
  };


  const handleResetData = () => {
    if (window.confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យសាលាឡើងវិញមែនទេ? ទិន្នន័យនេះនឹងលុបសាលាទាំងអស់ដែលបានបញ្ចូល ហើយត្រឡប់ទៅសាលាដើមវិញ។')) {
      const defaultSchools: SchoolEntry[] = [
        {
          id: 'phnom_pom_primary',
          nameKhmer: 'សាលាបឋមសិក្សាភ្នំពុំ',
          schoolCode: '02100108027',
          level: 'primary',
          principalName: 'លោកគ្រូ លីម សន'
        }
      ];
      setSchools(defaultSchools);
      localStorage.setItem('kroudigital_multi_schools_v5', JSON.stringify(defaultSchools));
      showToast('ទិន្នន័យត្រូវបានកំណត់ឡើងវិញ!', 'success');
    }
  };

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // Group schools by level
  const groupedSchools = {
    primary: schools.filter(s => s.level === 'primary'),
    secondary: schools.filter(s => s.level === 'secondary'),
    high_school: schools.filter(s => s.level === 'high_school'),
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
            <h1 className="text-lg font-bold text-white leading-tight">ប្រព័ន្ធគ្រប់គ្រងសាលារៀនកម្រិត Super Admin</h1>
            <p className="text-purple-400 text-xs">ទិដ្ឋភាពទូទៅនៃសាលារៀនទាំងអស់ (Central Dashboard)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleResetData} className="flex items-center gap-2 px-4 py-2 bg-[#164049] hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 rounded-lg text-sm font-bold transition">
            <span className="hidden sm:inline">កំណត់ឡើងវិញ</span>
          </button>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-[#164049] hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-bold transition">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">ចាកចេញ</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 mt-4">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-[#0d282e]/50 p-4 rounded-2xl border border-[#164049]/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <School className="w-5 h-5 text-purple-400" />
            បណ្តាញសាលារៀនសរុប ({schools.length})
          </h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-purple-900/20"
          >
            <Plus className="w-4 h-4" />
            បន្ថែមសាលាថ្មី
          </button>
        </div>

        {/* Schools Grouped By Level */}
        <div className="space-y-4">
          {(['primary', 'secondary', 'high_school'] as const).map((level) => (
            <div key={level} className="bg-[#0d282e] border border-[#164049] rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleLevel(level)}
                className="w-full flex items-center justify-between p-6 hover:bg-[#10323a] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${LEVEL_COLORS[level]}`}>
                    <School className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-1">{LEVEL_LABELS[level]}</h3>
                    <p className="text-sm text-slate-400">ចំនួនសាលាសរុប: <span className="font-bold text-white">{groupedSchools[level].length}</span></p>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full bg-[#164049] flex items-center justify-center transition-transform duration-300 ${expandedLevels[level] ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-slate-300" />
                </div>
              </button>

              {expandedLevels[level] && (
                <div className="p-6 pt-0 border-t border-[#164049]/50 bg-[#0a1e23]">
                  {groupedSchools[level].length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      មិនទាន់មានសាលាក្នុងកម្រិតនេះទេ
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {groupedSchools[level].map(school => (
                        <div key={school.id} className="bg-[#0d282e] border border-[#164049]/80 rounded-xl p-5 hover:border-purple-500/50 transition-colors group">
                          <h4 className="text-lg font-bold text-white mb-3">{school.nameKhmer}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4 bg-[#0a1e23] p-2 rounded-lg border border-[#164049]/50">
                            <UserPlus className="w-4 h-4 text-cyan-400" />
                            <span className="truncate">នាយក: <span className="font-bold text-slate-200">{school.principalName}</span></span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleSwitchSchool(school)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#164049] group-hover:bg-purple-600 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                              ចូលផ្ទាំងគ្រប់គ្រងនាយក <ChevronRight className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteSchool(school.id, school.nameKhmer || ''); }}
                              className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors border border-red-500/20"
                              title="លុបសាលានេះ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-[#0d282e] rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-[#164049] overflow-hidden">
            <div className="bg-purple-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white">បន្ថែមសាលាថ្មីចូលប្រព័ន្ធ</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1.5">ឈ្មោះសាលារៀន *</label>
                <input 
                  type="text" 
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  className="w-full bg-[#0a1e23] border border-[#164049] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="ឧ. វិទ្យាល័យ ហ៊ុនសែន"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1.5">លេខកូដសាលា *</label>
                <input 
                  type="text" 
                  value={newSchoolCode}
                  onChange={e => setNewSchoolCode(e.target.value)}
                  className="w-full bg-[#0a1e23] border border-[#164049] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="ឧ. HIG-002"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1.5">ឈ្មោះនាយកសាលា</label>
                <input 
                  type="text" 
                  value={newPrincipalName}
                  onChange={e => setNewPrincipalName(e.target.value)}
                  className="w-full bg-[#0a1e23] border border-[#164049] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="ឧ. លោកគ្រូ កង សុវណ្ណ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1.5">កម្រិតសិក្សា *</label>
                <select 
                  value={newSchoolLevel}
                  onChange={e => setNewSchoolLevel(e.target.value as any)}
                  className="w-full bg-[#0a1e23] border border-[#164049] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                >
                  <option value="primary">បឋមសិក្សា</option>
                  <option value="secondary">អនុវិទ្យាល័យ</option>
                  <option value="high_school">វិទ្យាល័យ</option>
                </select>
              </div>
            </div>
            
            <div className="bg-[#0a1e23] border-t border-[#164049] px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-slate-300 hover:bg-[#164049] rounded-xl font-bold transition"
              >
                បោះបង់
              </button>
              <button 
                onClick={handleAddSchool}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-lg shadow-purple-900/20"
              >
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
