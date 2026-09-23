import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab } from '../types';
import {
  Home,
  Layers,
  Wallet,
  GraduationCap,
  Award,
  BookOpenCheck,
  CalendarCheck,
  Users,
  Calendar,
  BookOpen
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
  onOpenSettings?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu, onOpenSettings }) => {
  const { activeTab, setActiveTab, currentUser, canAccessTab } = useSchool();

  type NavItem = { id: ActiveTab | 'all_apps' | 'account_modal'; label: string; icon: React.ComponentType<{ className?: string }> };

  const isStudent = currentUser?.role === 'student' || currentUser?.role === 'parent';
  const isTeacher = currentUser?.role === 'teacher';

  const quickTabs: NavItem[] = isStudent
    ? [
        { id: 'student_portal', label: 'លទ្ធផល', icon: GraduationCap },
        { id: 'calendar', label: 'ប្រតិទិន', icon: Calendar },
        { id: 'library', label: 'បណ្ណាល័យ', icon: BookOpen },
        { id: 'all_apps', label: 'ម៉ឺនុយ', icon: Layers },
      ]
    : isTeacher
    ? [
        { id: 'homeroom_dashboard', label: 'បន្ទុកថ្នាក់', icon: Award },
        { id: 'scores', label: 'ពិន្ទុ', icon: BookOpenCheck },
        { id: 'attendance_health', label: 'វត្តមាន', icon: CalendarCheck },
        { id: 'teacher_agenda', label: 'កិច្ចការ', icon: Calendar },
        { id: 'all_apps', label: 'ម៉ឺនុយ', icon: Layers },
      ]
    : [
        { id: 'dashboard', label: 'ទំព័រដើម', icon: Home },
        { id: 'students', label: 'សិស្ស', icon: Users },
        { id: 'scores', label: 'ពិន្ទុ', icon: BookOpenCheck },
        { id: 'finance', label: 'ថវិកា', icon: Wallet },
        { id: 'all_apps', label: 'ម៉ឺនុយ', icon: Layers },
      ];

  const visibleTabs = quickTabs.filter(tab => {
    if (tab.id === 'all_apps' || tab.id === 'account_modal') return true;
    return canAccessTab(tab.id as ActiveTab);
  });

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-1.5 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] no-print">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (tab.id === 'all_apps' || tab.id === 'account_modal') ? false : activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'all_apps') {
                  onOpenMobileMenu();
                } else if (tab.id === 'account_modal') {
                  if (typeof onOpenSettings === 'function') {
                    onOpenSettings();
                  } else {
                    setActiveTab('accounts');
                  }
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shadow-2xs scale-105' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight whitespace-nowrap transition-colors ${
                isActive ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

