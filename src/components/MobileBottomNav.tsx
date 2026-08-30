import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ActiveTab } from '../types';
import {
  Home,
  Layers,
  Wallet,
  User,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu, onOpenSettings }) => {
  const { activeTab, setActiveTab } = useSchool();

  const quickTabs: { id: ActiveTab | 'all_apps'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'ទំព័រដើម', icon: Home },
    { id: 'all_apps', label: 'ទាំងអស់', icon: Layers },
    { id: 'finance', label: 'ថវិកា', icon: Wallet },
    { id: 'account' as any, label: 'គណនី', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-2 py-2 shadow-2xl no-print">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {quickTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (tab.id === 'all_apps' || tab.id === 'account') ? false : activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'all_apps') {
                  onOpenMobileMenu();
                } else if (tab.id === 'account') {
                  onOpenSettings();
                } else {
                  setActiveTab(tab.id as ActiveTab);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1.5 rounded-2xl ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
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
