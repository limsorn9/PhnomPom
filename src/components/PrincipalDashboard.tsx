import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, LogOut, ChevronDown, User, Users, School, MapPin, Activity, LayoutDashboard, QrCode, ClipboardList, BookOpen, UserCheck, Shield } from 'lucide-react';

export const PrincipalDashboard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useSchool();
  const { logout } = useAuth();

  const handleNavigation = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    } else {
      console.log('Navigate to:', tabId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-kantumruy">
      
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-moul text-blue-800 text-sm hidden sm:block">ប្រព័ន្ធព័ត៌មានអ្នកប្រើប្រាស់</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកទំព័រ ឬមុខងារ... ⌘K"
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 relative group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">{currentUser?.nameKhmer || 'លីម សន'}</p>
            <p className="text-xs text-slate-500">នាយកសាលារៀន</p>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
            {currentUser?.photoUrl ? (
              <img src={currentUser.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-2">
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                <LogOut className="w-4 h-4" />
                ចាកចេញ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* 2. School Hero Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">សាលាបឋមសិក្សាភ្នំពុំ</h1>
              <p className="text-sm text-slate-500">សូមស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រង</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">លេខកូដសាលារៀន</p>
              <p className="text-sm font-semibold text-slate-700">02100108027</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">ប្រភេទសាលារៀន</p>
              <p className="text-sm font-semibold text-slate-700">សាលារដ្ឋ</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">ប្រភេទគម្រោង</p>
              <p className="text-sm font-semibold text-slate-700">សាលារៀនទូទៅ</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-1">ទីកន្លែង</p>
                <p className="text-sm font-semibold text-slate-700">បារាំងធ្លាក់, ភ្នំព្រឹក, ខេត្តបាត់ដំបង</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Stats Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Students & Classes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center items-center">
              <p className="text-slate-500 font-medium mb-2">ថ្នាក់រៀនសរុប</p>
              <p className="text-4xl font-bold text-slate-800">6</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center items-center">
              <p className="text-slate-500 font-medium mb-2">សិស្សសរុប</p>
              <p className="text-4xl font-bold text-slate-800">169</p>
              <div className="mt-2 text-sm text-pink-600 bg-pink-50 px-3 py-1 rounded-full font-medium">
                ស្រី : 79
              </div>
            </div>
          </div>

          {/* Right: Staff Stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-8">
            <div className="text-center sm:text-left">
              <p className="text-slate-500 font-medium mb-2">បុគ្គលិកសរុប</p>
              <p className="text-4xl font-bold text-slate-800 mb-2">7</p>
              <div className="text-sm text-pink-600 bg-pink-50 px-3 py-1 rounded-full font-medium inline-block">
                ស្រី : 5
              </div>
            </div>
            <div className="h-px w-full sm:w-px sm:h-full bg-slate-100"></div>
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  នាយក
                </div>
                <span className="font-bold text-slate-700">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  គ្រូបង្រៀន
                </div>
                <span className="font-bold text-slate-700">5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  បណ្ណារក្ស
                </div>
                <span className="font-bold text-slate-700">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Quick Access (8 Buttons) */}
        <h2 className="text-lg font-bold text-slate-800 mb-4">ការចូលប្រើរហ័ស</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button onClick={() => handleNavigation('teacher_profile')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white transition shadow-sm group">
            <User className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">វត្តមានផ្ទាល់ខ្លួន</span>
          </button>
          <button onClick={() => handleNavigation('classrooms')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#10b981] hover:bg-emerald-700 text-white transition shadow-sm group">
            <School className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">ថ្នាក់</span>
          </button>
          <button onClick={() => handleNavigation('students')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#f97316] hover:bg-orange-700 text-white transition shadow-sm group">
            <Users className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">ការគ្រប់គ្រងសិស្ស</span>
          </button>
          <button onClick={() => handleNavigation('attendance_health')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#8b5cf6] hover:bg-purple-700 text-white transition shadow-sm group">
            <Activity className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">តាមដានស្ថានភាពសិស្ស</span>
          </button>
          <button onClick={() => handleNavigation('teachers')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#0d9488] hover:bg-teal-700 text-white transition shadow-sm group">
            <UserCheck className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">គ្រូបង្រៀន</span>
          </button>
          <button onClick={() => handleNavigation('reports_qr')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#db2777] hover:bg-pink-700 text-white transition shadow-sm group">
            <ClipboardList className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">របាយការណ៍</span>
          </button>
          <button onClick={() => handleNavigation('reports_qr')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 text-white transition shadow-sm group">
            <QrCode className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">គ្រប់គ្រង QR Code</span>
          </button>
          <button onClick={() => handleNavigation('attendance_health')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#ef4444] hover:bg-red-700 text-white transition shadow-sm group">
            <ClipboardList className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">វត្តមានគ្រូបង្រៀន</span>
          </button>
        </div>

      </main>

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="text-center text-slate-400 text-sm">
          នាយកដ្ឋានបឋមសិក្សា © ២០២៦
        </div>
      </footer>
    </div>
  );
};
