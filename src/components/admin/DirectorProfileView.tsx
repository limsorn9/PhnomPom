import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Edit2, QrCode, Download, CheckCircle2, User, Phone, MapPin, Briefcase, GraduationCap, Users } from 'lucide-react';
import { EditDirectorProfileModal } from './EditDirectorProfileModal';

export const DirectorProfileView: React.FC = () => {
  const { currentUser } = useSchool();
  const [activeTab, setActiveTab] = useState('personal_info');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'personal_info', label: 'ផ្លាស់ប្ដូរព័ត៌មានផ្ទាល់ខ្លួន' },
    { id: 'signature', label: 'ហត្ថលេខា' },
    { id: 'account_info', label: 'ព័ត៌មានគណនី' },
    { id: '2fa_security', label: 'សុវត្ថិភាពពីរជាន់' },
    { id: 'active_devices', label: 'ឧបករណ៍ដែលកំពុងចូលប្រើ' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* 1. Theme & Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-kantumruy">ព័ត៌មានផ្ទាល់ខ្លួន</h1>
            <p className="text-sm text-slate-500 font-kantumruy">ធ្វើបច្ចុប្បន្នភាពនៃព័ត៌មានរបស់លោកអ្នក</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm font-kantumruy shrink-0"
          >
            <Edit2 className="w-4 h-4" />
            កែប្រែ
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 mb-8 pb-px no-scrollbar font-kantumruy">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6 font-kantumruy">
          {/* 2. Profile Header & Progress (Grid 2 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Identity Card */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full border-4 border-blue-100 overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 text-slate-400 relative">
                  {currentUser?.photoUrl ? (
                    <img src={currentUser.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                  <div className="absolute inset-0 border border-blue-500/20 rounded-full pointer-events-none"></div>
                </div>
                
                {/* Info */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">{currentUser?.nameKhmer || 'លីម សន'}</h2>
                      <p className="text-sm text-slate-500 mb-0.5">@{currentUser?.username || 'limsorn2'}</p>
                      <p className="text-sm font-medium text-blue-600 mb-0.5">នាយកសាលារៀន</p>
                      <p className="text-sm text-slate-500">{currentUser?.email || 'limsorn9@gmail.com'}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                        <QrCode className="w-4 h-4 text-slate-600" />
                        កាត QR របស់ខ្ញុំ
                      </button>
                      <button className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition">
                        <Download className="w-4 h-4" />
                        ទាញ QR Code
                      </button>
                    </div>
                  </div>
                  
                  {/* Bottom details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-slate-100 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">ភេទ</p>
                      <p className="font-medium text-slate-800">ប្រុស</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">ថ្ងៃកំណើត</p>
                      <p className="font-medium text-slate-800">10/11/1989</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">សញ្ជាតិ</p>
                      <p className="font-medium text-slate-800">ខ្មែរ</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">ជនជាតិ</p>
                      <p className="font-medium text-slate-800">ខ្មែរ</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">ប្រភេទពិការភាព</p>
                      <p className="font-medium text-slate-800">មិនមាន</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Progress Circular Gauge */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset="0" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">100%</span>
                  <span className="text-[10px] text-slate-500 font-medium">បានបំពេញ</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">ការបំពេញព័ត៌មានផ្ទាល់ខ្លួន</h3>
              <p className="text-sm text-slate-500 mb-4">ព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកពេញលេញ!</p>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                បំពេញទិន្នន័យបានគ្រប់
              </div>
            </div>

          </div>

          {/* 3. Work Info & Training */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-5 h-5 text-blue-600" />
                ព័ត៌មានការងារ
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">កម្រិតថ្នាក់</p>
                  <p className="font-medium text-slate-800">-</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">អត្តលេខមន្ត្រីរាជការ</p>
                  <p className="font-medium text-slate-800">1890100037</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">ថ្ងៃចូលបម្រើការងារ</p>
                  <p className="font-medium text-slate-800">10/1/2010</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">ស្ថានភាពគ្រូបង្រៀន</p>
                  <p className="font-medium text-slate-800">មិនមាន</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">ប្រភេទនៃការបង្រៀន</p>
                  <p className="font-medium text-slate-800">1 វេន</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">ប្រភេទក្របខណ្ឌ</p>
                  <p className="font-medium text-slate-800">ក្របខណ្ឌ - បឋម</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">កាំប្រាក់ និងឋានន្តរស័ក្តិ</p>
                  <p className="font-medium text-slate-800">គ.3</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">ការតែងតាំង / បន្ទុក</p>
                  <p className="font-medium text-slate-800">តែងតាំង</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                ព័ត៌មានការបណ្តុះបណ្តាល
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">កម្រិតវប្បធម៌</p>
                  <p className="font-medium text-slate-800">បរិញ្ញាបត្រ</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">កម្រិតបណ្តុះបណ្តាល</p>
                  <p className="font-medium text-slate-800">9+2</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Address & Birthplace */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-orange-500" />
              ទីកន្លែងស្នាក់នៅ & ទីកន្លែងកំណើត
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">ទីកន្លែងស្នាក់នៅបច្ចុប្បន្ន</p>
                <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  ខេត្តបាត់ដំបង, ភ្នំព្រឹក, ភ្នំព្រឹក, ស្រឡៅ
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">ទីកន្លែងកំណើត</p>
                <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  ខេត្តបន្ទាយមានជ័យ, សិរីសោភ័ណ, អូរអំបិល, សែសិន
                </p>
              </div>
            </div>
          </div>

          {/* 5. Family & Children */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-teal-600" />
              ព័ត៌មានគ្រួសារ & កូនៗ
            </h3>
            
            <div className="mb-6">
              <h4 className="font-bold text-slate-700 mb-3 text-sm">ព័ត៌មានភរិយា</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-500 text-xs mb-1">ឈ្មោះ</p>
                  <p className="font-medium text-slate-800">ស៊ីវ ពិសិដ្ឋ</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">មុខរបររបស់ប្ដី/ប្រពន្ធ</p>
                  <p className="font-medium text-slate-800">គ្រូបង្រៀន</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-slate-500 text-xs mb-1">លេខទូរស័ព្ទ</p>
                    <p className="font-medium text-slate-800">016991988</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center justify-between">
                ព័ត៌មានកូនៗ
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">សរុប: ៣ នាក់</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'ផល លីនាង', status: 'កំពុងរៀន' },
                  { name: 'ផល ពុទ្ធិរាជ្យ', status: 'កំពុងរៀន' },
                  { name: 'ផល ចរិយា', status: 'កំពុងរៀន' },
                ].map((child, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm hover:border-blue-300 transition">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm mb-0.5">{child.name}</p>
                      <p className="text-xs text-slate-500">ស្ថានភាពកូន • <span className="text-emerald-600 font-medium">{child.status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="text-center text-slate-400 text-sm font-kantumruy">
          នាយកដ្ឋានបឋមសិក្សា © ២០២៦
        </div>
      </footer>

      {isEditing && (
        <EditDirectorProfileModal onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
};
