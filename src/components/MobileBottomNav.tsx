import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab } from '../types';
import {
  Home,
  Layers,
  Wallet,
  User,
  GraduationCap,
  Award,
  BookOpenCheck,
  CalendarCheck
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu, onOpenSettings }) => {
  const { activeTab, setActiveTab, currentUser } = useSchool();

  type NavItem = { id: ActiveTab | 'all_apps' | 'account_modal'; label: string; icon: React.ComponentType<{ className?: string }> };

  const isStudent = currentUser?.role === 'student' || currentUser?.role === 'parent';
  const isTeacher = currentUser?.role === 'teacher';

  const quickTabs: NavItem[] = isStudent
    ? [
        { id: 'student_portal', label: 'លទ្ធផលសិក្សា', icon: GraduationCap },
        { id: 'all_apps', label: 'ម៉ឺនុយសិស្ស', icon: Layers },
      ]
    : isTeacher
    ? [
        { id: 'homeroom_dashboard', label: 'បន្ទុកថ្នាក់', icon: Award },
        { id: 'scores', label: 'ពិន្ទុ', icon: BookOpenCheck },
        { id: 'attendance_health', label: 'វត្តមាន', icon: CalendarCheck },
        { id: 'student_portal', label: 'ផ្ទាំងសិស្ស', icon: GraduationCap },
        { id: 'all_apps', label: 'ទាំងអស់', icon: Layers },
      ]
    : [
        { id: 'dashboard', label: 'ទំព័រដើម', icon: Home },
        { id: 'all_apps', label: 'ទាំងអស់', icon: Layers },
        { id: 'finance', label: 'ថវិកា', icon: Wallet },
        { id: 'account_modal', label: 'គណនី', icon: User },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 py-2 shadow-2xl no-print">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {quickTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (tab.id === 'all_apps' || tab.id === 'account_modal') ? false : activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'all_apps') {
                  onOpenMobileMenu();
                } else if (tab.id === 'account_modal') {
                  onOpenSettings();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-2xl ${isActive ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : ''}`}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] mt-1 leading-none whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
