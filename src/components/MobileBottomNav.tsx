import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CircleDollarSign,
  Menu,
  HardDrive
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu }) => {
  const { activeTab, setActiveTab } = useSchool();

  const quickTabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'ផ្ទាំងដើម', icon: LayoutDashboard },
    { id: 'students', label: 'សិស្ស', icon: Users },
    { id: 'scores', label: 'ពិន្ទុ', icon: BookOpen },
    { id: 'finance', label: 'ថវិកា', icon: CircleDollarSign },
    { id: 'workspace', label: 'Drive/Sheet', icon: HardDrive },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg no-print">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {quickTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}

        {/* Menu drawer trigger button */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="បើកម៉ឺនុយទាំងអស់"
        >
          <div className="p-1 rounded-lg hover:bg-slate-100">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 leading-none">ម៉ឺនុយ</span>
        </button>
      </div>
    </nav>
  );
};
