import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab } from '../types';
import {
  Users,
  BookOpen,
  CalendarCheck,
  HeartPulse,
  Library,
  CircleDollarSign,
  PieChart,
  Grid,
  ChevronRight,
  Menu
} from 'lucide-react';

export const MobileAppCenter: React.FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const { currentUser, setActiveTab, canAccessTab } = useSchool();

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'director': return 'នាយកសាលា';
      case 'secretary': return 'លេខាធិការ';
      case 'teacher': return 'គ្រូបង្រៀន';
      case 'student': return 'សិស្ស';
      default: return 'អ្នកប្រើប្រាស់';
    }
  };

  const apps = [
    { id: 'students', label: 'សិស្ស', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100', bgIcon: 'bg-blue-500' },
    { id: 'scores', label: 'ពិន្ទុ', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100', bgIcon: 'bg-purple-500' },
    { id: 'attendance_health', label: 'វត្តមាន', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-100', bgIcon: 'bg-emerald-500' },
    { id: 'health', label: 'សុខភាព', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-100', bgIcon: 'bg-rose-500' },
    { id: 'library', label: 'បណ្ណាល័យ', icon: Library, color: 'text-amber-500', bg: 'bg-amber-100', bgIcon: 'bg-amber-500' },
    { id: 'finance', label: 'ថវិកា', icon: CircleDollarSign, color: 'text-teal-500', bg: 'bg-teal-100', bgIcon: 'bg-teal-500' },
    { id: 'reports', label: 'របាយការណ៍', icon: PieChart, color: 'text-indigo-500', bg: 'bg-indigo-100', bgIcon: 'bg-indigo-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-battambang pb-20 lg:hidden">
      {/* Top Header Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 pt-10 pb-20 px-6 rounded-b-[40px] relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden">
              {currentUser?.avatarUrl ? (
                 <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                   {currentUser?.nameKhmer ? currentUser.nameKhmer.charAt(0) : 'U'}
                 </div>
              )}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight uppercase font-moul tracking-wide">
                {currentUser?.nameKhmer || 'អ្នកប្រើប្រាស់'}
              </h2>
              <button className="flex items-center text-blue-100 text-xs mt-0.5 hover:text-white transition-colors" onClick={() => setActiveTab('school_admin')}>
                View Profile <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
          {/* Flag */}
          <div className="w-8 h-8 rounded-full overflow-hidden shadow-md border-2 border-white/20">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg" alt="Cambodia" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 -mt-14 relative z-20">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-5 text-white shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30">
            {/* Simple abstract shapes instead of complex SVGs for banner */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-md"></div>
            <div className="absolute right-10 bottom-0 w-16 h-16 bg-white/20 rounded-full blur-md"></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1 max-w-[70%] leading-tight font-moul">School Features in One Place!</h3>
            <p className="text-xs text-blue-100 max-w-[70%]">Explore, Use, and Manage - All in the App Center.</p>
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  if (canAccessTab(app.id as ActiveTab)) {
                    setActiveTab(app.id as ActiveTab);
                  } else {
                    alert('អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់មុខងារនេះទេ!');
                  }
                }}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${app.bgIcon} shadow-md group-hover:scale-105 transition-transform duration-200`}>
                  <app.icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                  {app.label}
                </span>
              </button>
            ))}
            
            {/* More Button */}
            <button
              onClick={onOpenMenu}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-500 shadow-sm border border-slate-200 group-hover:bg-slate-200 group-hover:scale-105 transition-all duration-200">
                <Grid className="w-6 h-6 stroke-[1.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                More
              </span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
            Tap "More" or "Swipe up" to see all apps
          </p>
        </div>
      </div>
    </div>
  );
};
