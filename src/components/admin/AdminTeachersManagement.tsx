import React, { useState } from 'react';
import { Search, Plus, SlidersHorizontal, MoreVertical, Edit2, KeyRound, ArrowRightLeft, Ban, CheckCircle2 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const AdminTeachersManagement: React.FC = () => {
  const { teachers } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');

  const displayData = teachers
    .filter(t => 
      t.nameKhmer.includes(searchTerm) || 
      (t.email || '').includes(searchTerm) || 
      (t.nameLatin || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(t => ({
      id: t.id,
      name: t.nameKhmer,
      username: t.email ? '@' + t.email.split('@')[0] : '@' + (t.nameLatin || t.nameKhmer).toLowerCase().replace(/\s/g, ''),
      gradeLevel: t.assignedGrade ? `ថ្នាក់ទី${t.assignedGrade}` : '-',
      gender: t.gender === 'F' ? 'ស្រី' : 'ប្រុស',
      framework: t.framework || 'កិច្ចសន្យា',
      role: t.role,
      class: t.assignedGrade && t.assignedSection ? `ថ្នាក់ទី ${t.assignedGrade}-${t.assignedSection}` : 'មិនមានថ្នាក់',
      status: t.status
    }));

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans p-4 sm:p-6 font-kantumruy">
      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ការគ្រប់គ្រងគ្រូ</h1>
          <p className="text-xs text-slate-500 mt-1">គ្រប់គ្រងទិន្នន័យគ្រូ</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-[#10b981] hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition shadow-sm">
            <Plus className="w-4 h-4" />
            បន្ថែមគ្រូ ∨
          </button>
          <button className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-xl text-sm flex items-center gap-1.5 transition shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            តម្រង (1)
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="ស្វែងរកគ្រូ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <button className="absolute inset-y-0 right-0 px-3 bg-[#2563eb] hover:bg-blue-700 text-white rounded-r-xl transition flex items-center justify-center">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex items-center">
            <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              តម្រងបានជ្រើសរើស : <span className="font-semibold text-slate-800">ស្ថានភាព : ដំណើរការ</span>
            </span>
          </div>
        </div>
      </div>

      {/* Staff Master Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">ឈ្មោះ</th>
                <th className="px-4 py-3 whitespace-nowrap">កម្រិតថ្នាក់</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">ភេទ</th>
                <th className="px-4 py-3 whitespace-nowrap">ប្រភេទក្របខ័ណ្ឌ</th>
                <th className="px-4 py-3 whitespace-nowrap">តួនាទី/មុខតំណែង</th>
                <th className="px-4 py-3 whitespace-nowrap">ថ្នាក់</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map((staff, index) => (
                <tr key={staff.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{staff.name}</div>
                        <div className="text-[11px] text-slate-500">{staff.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{staff.gradeLevel}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">{staff.gender}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                      {staff.framework}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{staff.role}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {staff.class !== 'មិនមានថ្នាក់' ? (
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-100">
                        {staff.class}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">{staff.class}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center relative">
                    <button 
                      onClick={() => toggleDropdown(staff.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeDropdown === staff.id && (
                      <div className="absolute right-8 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1.5 overflow-hidden text-left">
                        <button className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition">
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                          កែប្រែព័ត៌មានគ្រូ
                        </button>
                        <button className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition">
                          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                          កំណត់លេខសម្ងាត់ឡើងវិញ
                        </button>
                        <button className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500" />
                          ប្ដូរបន្ទុកថ្នាក់
                        </button>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition">
                          <Ban className="w-3.5 h-3.5" />
                          ផ្អាកដំណើរការ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    រកមិនឃើញទិន្នន័យដែលអ្នកស្វែងរកទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
