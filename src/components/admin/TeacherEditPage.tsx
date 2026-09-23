import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { AdministrativeAddressSelect } from '../common/AdministrativeAddressSelect';
import { SCHOOL_STAFF_ROLES } from '../../data/schoolStaffRoles';

interface TeacherEditPageProps {
  teacherId: string;
  onBack: () => void;
}

export const TeacherEditPage: React.FC<TeacherEditPageProps> = ({ teacherId, onBack }) => {
  const { teachers, updateTeacher } = useSchool();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      // Split name for form
      const nameParts = teacher.nameKhmer ? teacher.nameKhmer.split(' ') : [];
      const lastName = nameParts[0] || '';
      const firstName = nameParts.slice(1).join(' ') || '';

      setFormData({
        ...teacher,
        lastName,
        firstName,
        idCardType: 'មានសុពលភាព',
        idCardNumber: '',
        idCardExpiry: '',
        username: teacher.email ? teacher.email.split('@')[0] : (teacher.nameLatin || '').toLowerCase().replace(/\s/g, ''),
        password: '',
        maritalStatus: 'នៅលីវ',
        spouseName: '',
        spouseOccupation: '',
        spousePhone: '',
        spousePob: '',
        childrenCount: '0',
        children: [],
        materials: {
          reading: false,
          flashcards: false,
          math: false
        }
      });
    }
  }, [teacherId, teachers]);

  if (!formData) {
    return <div className="p-8 text-center text-slate-500">កំពុងផ្ទុកទិន្នន័យ...</div>;
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Merge names back
    const fullNameKhmer = `${formData.lastName} ${formData.firstName}`.trim();
    
    // Update context
    updateTeacher(teacherId, {
      nameKhmer: fullNameKhmer,
      gender: formData.gender,
      dob: formData.dob,
      phone: formData.phone,
      email: formData.email,
      framework: formData.framework,
      assignedGrade: formData.assignedGrade,
      status: formData.status
    });

    onBack(); // Return to list after save
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans p-4 sm:p-6 md:p-8 font-kantumruy">
      {/* Header Navigation */}
      <div className="max-w-5xl mx-auto mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          ត្រឡប់ក្រោយ
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-5xl mx-auto space-y-8">
        
        {/* 1. ព័ត៌មានផ្ទាល់ខ្លួន */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. ព័ត៌មានផ្ទាល់ខ្លួន</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">នាមត្រកូល <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required 
                value={formData.lastName} 
                onChange={e => handleChange('lastName', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">នាមខ្លួន <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required 
                value={formData.firstName} 
                onChange={e => handleChange('firstName', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ភេទ <span className="text-red-500">*</span></label>
              <select 
                required 
                value={formData.gender}
                onChange={e => handleChange('gender', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="M">ប្រុស</option>
                <option value="F">ស្រី</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ថ្ងៃកំណើត <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                required 
                value={formData.dob} 
                onChange={e => handleChange('dob', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">សញ្ជាតិ <span className="text-red-500">*</span></label>
              <input type="text" required defaultValue="ខ្មែរ" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ជនជាតិ</label>
              <input type="text" defaultValue="ខ្មែរ" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ប្រភេទពិការភាព</label>
              <select className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="none">មិនមាន</option>
                <option value="visual">ពិការភ្នែក</option>
                <option value="physical">ពិការកាយ</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. អត្តសញ្ញាណប័ណ្ណ */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">2. អត្តសញ្ញាណប័ណ្ណ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">ប្រភេទអត្តសញ្ញាណប័ណ្ណ</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input type="radio" name="idType" value="មានសុពលភាព" checked={formData.idCardType === 'មានសុពលភាព'} onChange={e => handleChange('idCardType', e.target.value)} className="text-blue-600 focus:ring-blue-500" />
                  មានសុពលភាព
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input type="radio" name="idType" value="អចិន្ត្រៃយ៍" checked={formData.idCardType === 'អចិន្ត្រៃយ៍'} onChange={e => handleChange('idCardType', e.target.value)} className="text-blue-600 focus:ring-blue-500" />
                  អចិន្ត្រៃយ៍
                </label>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">លេខអត្តសញ្ញាណប័ណ្ណ</label>
              <input type="text" value={formData.idCardNumber} onChange={e => handleChange('idCardNumber', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ថ្ងៃផុតកំណត់</label>
              <input type="date" value={formData.idCardExpiry} onChange={e => handleChange('idCardExpiry', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        {/* 3. ព័ត៌មានការងារ */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">3. ព័ត៌មានការងារ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">កម្រិតថ្នាក់</label>
              <select value={formData.assignedGrade || ''} onChange={e => handleChange('assignedGrade', e.target.value ? Number(e.target.value) : null)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="">មិនមានថ្នាក់</option>
                {[1,2,3,4,5,6].map(g => <option key={g} value={g}>ថ្នាក់ទី {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ថ្ងៃចូលបម្រើការ <span className="text-red-500">*</span></label>
              <input type="date" required value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ប្រភេទបង្រៀន</label>
              <select className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option>1 វេន</option>
                <option>2 វេន</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ស្ថានភាពគ្រូ</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="active">ដំណើរការ</option>
                <option value="inactive">ផ្អាក</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. ព័ត៌មានមន្រ្តីរាជការ */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">4. ព័ត៌មានមន្រ្តីរាជការ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">អត្តលេខ</label>
              <input type="text" value={formData.staffCode || ''} readOnly className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">តួនាទី</label>
              <select 
                value={formData.role || 'TEACHER'} 
                onChange={e => handleChange('role', e.target.value)} 
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {SCHOOL_STAFF_ROLES.filter(r => r.value !== 'ALL').map(role => (
                  <option key={role.value} value={role.label}>{role.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ប្រភេទការងារ</label>
              <select value={formData.framework || 'កិច្ចសន្យា'} onChange={e => handleChange('framework', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="បឋម">បឋម</option>
                <option value="កិច្ចសន្យា">កិច្ចសន្យា</option>
                <option value="កិច្ចព្រមព្រៀង">កិច្ចព្រមព្រៀង</option>
              </select>
            </div>
          </div>
        </section>

        {/* 5. ព័ត៌មានការបណ្ដុះបណ្ដាល */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">5. ព័ត៌មានការបណ្ដុះបណ្ដាល</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">កម្រិតវប្បធម៌</label>
              <select className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option>មធ្យមសិក្សាទុតិយភូមិ</option>
                <option>បរិញ្ញាបត្រ</option>
                <option>បរិញ្ញាបត្រជាន់ខ្ពស់</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">កម្រិតបណ្ដុះបណ្ដាល</label>
              <select className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option>គរុកោសល្យបឋមភូមិ</option>
                <option>បរិញ្ញាបត្រគរុកោសល្យ</option>
              </select>
            </div>
          </div>
        </section>

        {/* 6. ព័ត៌មានគ្រួសារ & កូន */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">6. ព័ត៌មានគ្រួសារ & កូន</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ស្ថានភាពគ្រួសារ</label>
              <select value={formData.maritalStatus} onChange={e => handleChange('maritalStatus', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="នៅលីវ">នៅលីវ</option>
                <option value="រៀបការ">រៀបការ</option>
              </select>
            </div>
            {formData.maritalStatus === 'រៀបការ' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ឈ្មោះប្ដី/ប្រពន្ធ</label>
                  <input type="text" value={formData.spouseName} onChange={e => handleChange('spouseName', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">មុខរបរ</label>
                  <input type="text" value={formData.spouseOccupation} onChange={e => handleChange('spouseOccupation', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ទូរស័ព្ទ</label>
                  <input type="text" value={formData.spousePhone} onChange={e => handleChange('spousePhone', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                </div>
              </>
            )}
          </div>
        </section>

        {/* 7. កញ្ចប់សម្ភារៈសម្រាប់ជួយសិស្ស */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">7. កញ្ចប់សម្ភារៈសម្រាប់ជួយសិស្ស</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={formData.materials.reading} onChange={e => handleChange('materials', {...formData.materials, reading: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
              កញ្ចប់សម្ភារៈអំណាន
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={formData.materials.flashcards} onChange={e => handleChange('materials', {...formData.materials, flashcards: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
              ប័ណ្ឌរូបភាព
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={formData.materials.math} onChange={e => handleChange('materials', {...formData.materials, math: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
              គណិតវិទ្យាថ្នាក់ដំបូង
            </label>
          </div>
        </section>

        {/* 8. ជ្រើសរើសសៀវភៅសម្រាប់គ្រូ */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">8. ជ្រើសរើសសៀវភៅសម្រាប់គ្រូ</h3>
          <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl text-xs transition">
            [ជ្រើសរើសសៀវភៅ]
          </button>
        </section>

        {/* 9. គណនី */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">9. គណនី</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ឈ្មោះអ្នកប្រើប្រាស់ <span className="text-red-500">*</span></label>
              <input type="text" required value={formData.username} onChange={e => handleChange('username', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ពាក្យសម្ងាត់ថ្មី</label>
              <input type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} placeholder="ទុកទទេបើមិនចង់ប្តូរ" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">អ៊ីមែល <span className="text-red-500">*</span></label>
              <input type="email" required value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">លេខទូរស័ព្ទ <span className="text-red-500">*</span></label>
              <input type="tel" required value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        {/* 10. ទីកន្លែងស្នាក់នៅ & ទីកន្លែងកំណើត */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">10. ទីកន្លែងស្នាក់នៅ & ទីកន្លែងកំណើត</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-3">ទីលំនៅបច្ចុប្បន្ន</label>
              <AdministrativeAddressSelect 
                onChange={(addr) => console.log('Current Address:', addr)}
                placeholder="ជ្រើសរើសទីលំនៅ"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-3">ទីកន្លែងកំណើត</label>
              <AdministrativeAddressSelect 
                onChange={(addr) => console.log('POB Address:', addr)}
                placeholder="ជ្រើសរើសទីកន្លែងកំណើត"
              />
            </div>
          </div>
        </section>

        {/* 11. ប៊ូតុង Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onBack}
            className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2.5 rounded-xl text-xs font-medium transition"
          >
            បោះបង់
          </button>
          <button 
            type="submit" 
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            កែប្រែគ្រូ
          </button>
        </div>

      </form>
    </div>
  );
};
