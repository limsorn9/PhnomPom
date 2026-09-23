import React, { useState } from 'react';
import { X, UploadCloud, Plus, Trash2 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface EditDirectorProfileModalProps {
  onClose: () => void;
}

export const EditDirectorProfileModal: React.FC<EditDirectorProfileModalProps> = ({ onClose }) => {
  const { currentUser } = useSchool();
  
  // Local state for dynamic children
  const [childrenList, setChildrenList] = useState([
    { id: '1', name: 'ផល លីនាង', status: 'កំពុងរៀន' },
    { id: '2', name: 'ផល ពុទ្ធិរាជ្យ', status: 'កំពុងរៀន' },
    { id: '3', name: 'ផល ចរិយា', status: 'កំពុងរៀន' },
  ]);

  const handleSave = () => {
    // Save logic goes here (mock for now)
    // using updateSchoolProfile or a similar context function to persist to localStorage
    console.log('Saved profile data locally');
    onClose();
  };

  const removeChild = (id: string) => {
    setChildrenList(prev => prev.filter(c => c.id !== id));
  };

  const addChild = () => {
    setChildrenList(prev => [...prev, { id: Date.now().toString(), name: '', status: 'កំពុងរៀន' }]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-kantumruy">
      <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-slate-50/50">
          
          {/* 1. Profile Picture Upload */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">១. រូបភាព Profile</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden relative">
                {currentUser?.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-slate-50 transition cursor-pointer">
                <UploadCloud className="w-10 h-10 text-blue-500 mb-3" />
                <p className="text-sm text-slate-600 font-medium">Drag and drop your file here ឬចុចដើម្បីជ្រើសរើសពីឧបករណ៍របស់អ្នក</p>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP (Max: 5MB)</p>
              </div>
            </div>
          </section>

          {/* 2. Personal Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">២. ព័ត៌មានផ្ទាល់ខ្លួន</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">នាមត្រកូល <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="លីម" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">នាមខ្លួន <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="សន" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ភេទ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ប្រុស</option>
                  <option>ស្រី</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ថ្ងៃកំណើត</label>
                <input type="date" defaultValue="1989-10-11" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">សញ្ជាតិ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ខ្មែរ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ជនជាតិ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ជនជាតិខ្មែរ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ប្រភេទពិការភាព</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>មិនមាន</option>
                  <option>ពិការភ្នែក</option>
                  <option>ពិការអវយវៈ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">អ៊ីមែល</label>
                <input type="email" defaultValue="limsorn9@gmail.com" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">លេខទូរស័ព្ទ</label>
                <input type="tel" defaultValue="068966677" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ប្រភេទអត្តសញ្ញាណប័ណ្ណ</label>
                <div className="flex gap-4 items-center h-10">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="id_type" defaultChecked className="w-4 h-4 text-blue-600" />
                    មានសុពលភាព
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="id_type" className="w-4 h-4 text-blue-600" />
                    អចិន្ត្រៃយ៍
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">លេខអត្តសញ្ញាណប័ណ្ណ</label>
                <input type="text" defaultValue="170762903" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ថ្ងៃផុតកំណត់</label>
                <input type="date" defaultValue="2033-05-30" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
            </div>
          </section>

          {/* 3. Work Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">៣. ព័ត៌មានការងារ & មន្ត្រីរាជការ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">កម្រិតថ្នាក់</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ជ្រើសរើសកម្រិតថ្នាក់</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ថ្ងៃចូលបម្រើការ</label>
                <input type="date" defaultValue="2010-10-01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ប្រភេទនៃការបង្រៀន</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>1 វេន</option>
                  <option>2 វេន</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">វេន</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>វេនព្រឹក</option>
                  <option>វេនរសៀល</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ចម្ងាយទៅសាលា</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>10គ.ម - ៣០គ.ម</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">អត្តលេខមន្ត្រីរាជការ</label>
                <input type="text" defaultValue="1890100037" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">តួនាទី</label>
                <input type="text" defaultValue="នាយកសាលារៀន" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-100" readOnly />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ប្រភេទការងារ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ក្របខណ្ឌ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ក្របខណ្ឌ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>បឋម</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">កាំប្រាក់</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>គ.3</option>
                </select>
              </div>
              <div className="flex items-center gap-4 h-10 mt-6">
                <span className="text-xs font-medium text-slate-600">ការតែងតាំង:</span>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="appoint" defaultChecked className="w-4 h-4 text-blue-600"/> មាន</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="appoint" className="w-4 h-4 text-blue-600"/> មិនមាន</label>
              </div>
              <div className="flex items-center gap-4 h-10 mt-6">
                <span className="text-xs font-medium text-slate-600">បន្ទុក:</span>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="duty" className="w-4 h-4 text-blue-600"/> មាន</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="duty" defaultChecked className="w-4 h-4 text-blue-600"/> មិនមាន</label>
              </div>
            </div>
          </section>

          {/* 4. Training */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">៤. ព័ត៌មានការបណ្តុះបណ្តាល</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">កម្រិតវប្បធម៌</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>បរិញ្ញាបត្រ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">កម្រិតបណ្តុះបណ្តាល</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>9+2</option>
                </select>
              </div>
            </div>
          </section>

          {/* 5. Family (Wife) */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">៥. ព័ត៌មានគ្រួសារ (ភរិយា)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ស្ថានភាពគ្រួសារ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>រៀបការ</option>
                  <option>នៅលីវ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ឈ្មោះប្ដី/ប្រពន្ធ</label>
                <input type="text" defaultValue="ស៊ីវ ពិសិដ្ឋ" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">មុខរបរ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>គ្រូបង្រៀន</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ទូរស័ព្ទ</label>
                <input type="tel" defaultValue="016991988" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ទីកន្លែងកំណើត</label>
                <input type="text" defaultValue="ព្រៃព្រាល,ព្រៃស្វាយ,មោងឫស្សី,បាត់ដំបង" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ចំនួនកូន</label>
                <input type="number" defaultValue="3" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
              </div>
            </div>
          </section>

          {/* 6. Children Dynamic Inputs */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">៦. ព័ត៌មានកូនៗ</h3>
              <button onClick={addChild} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition border border-blue-200">
                <Plus className="w-3.5 h-3.5" />
                បន្ថែមសំណុំទិន្នន័យ
              </button>
            </div>
            
            <div className="space-y-3">
              {childrenList.map((child, index) => (
                <div key={child.id} className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">ឈ្មោះកូនទី {index + 1}</label>
                      <input type="text" defaultValue={child.name} placeholder="ឈ្មោះកូន..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">ស្ថានភាព</label>
                      <select defaultValue={child.status} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option>កំពុងរៀន</option>
                        <option>មិនទាន់រៀន</option>
                        <option>ធ្វើការ</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeChild(child.id)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0 self-end sm:self-auto border border-red-100 mt-2 sm:mt-0"
                    title="លុប"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {childrenList.length === 0 && (
                <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                  មិនមានទិន្នន័យកូន
                </div>
              )}
            </div>
          </section>

          {/* 7. Current Address */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">៧. ទីកន្លែងស្នាក់នៅបច្ចុប្បន្ន</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ខេត្ត/រាជធានី</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ខេត្តបាត់ដំបង</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ស្រុក/ខណ្ឌ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ភ្នំព្រឹក</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ឃុំ/សង្កាត់</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ភ្នំព្រឹក</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ភូមិ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ស្រឡៅ</option>
                </select>
              </div>
            </div>
          </section>

          {/* 8. Birthplace */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">៨. ទីកន្លែងកំណើត</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ខេត្ត/រាជធានី</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>ខេត្តបន្ទាយមានជ័យ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ស្រុក/ខណ្ឌ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>សិរីសោភ័ណ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ឃុំ/សង្កាត់</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>អូរអំបិល</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">ភូមិ</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                  <option>សែសិន</option>
                </select>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white shrink-0">
          <button 
            onClick={onClose}
            className="bg-[#1e293b] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
          >
            បោះបង់
          </button>
          <button 
            onClick={handleSave}
            className="bg-[#2563eb] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
          >
            កែប្រែ
          </button>
        </div>

      </div>
    </div>
  );
};
