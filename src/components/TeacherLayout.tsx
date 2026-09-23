import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TeacherNavigationTab } from './HomeroomTeacherDashboard';
import {
  Users,
  Award,
  Calendar,
  Printer,
  FileCheck2,
  ChevronDown,
  ClipboardList,
  PenTool,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  HelpCircle,
  User
} from 'lucide-react';

interface TeacherLayoutProps {
  children: React.ReactNode;
  activeTabSub: TeacherNavigationTab;
  setActiveTabSub: (tab: TeacherNavigationTab) => void;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children, activeTabSub, setActiveTabSub }) => {
  const { currentTeacher, selectedGrade, selectedSection, selectedAcademicYear, schoolProfile, logout } = useSchool();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderSidebarItem = (id: TeacherNavigationTab, icon: React.ReactNode, label: string) => {
    const isActive = activeTabSub === id;
    return (
      <button
        onClick={() => {
          setActiveTabSub(id);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-[#0d3b45] text-cyan-300 border-l-4 border-cyan-400'
            : 'text-slate-400 hover:bg-[#0a2328] hover:text-slate-200 border-l-4 border-transparent'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a2126]">
      <div className="p-5 flex-1 overflow-y-auto scrollbar-thin">
        {/* Logo / Brand */}
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-white font-moul text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            K
          </div>
          <div>
            <h1 className="text-white font-bold tracking-wide">KrouDigital 4.0</h1>
            <p className="text-[10px] text-slate-400">គ្រប់គ្រងពិន្ទុ និងថ្នាក់</p>
          </div>
        </div>

        {/* Header Profile Card */}
        <div className="flex items-center gap-3 mb-6 bg-[#081b20] p-3 rounded-xl border border-[#13373e]">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
            {currentTeacher?.nameKhmer ? currentTeacher.nameKhmer.charAt(0) : 'ល'}
          </div>
          <div className="min-w-0">
            <h3 className="font-moul text-sm text-slate-100 truncate">{currentTeacher?.nameKhmer || 'លីម សន'}</h3>
            <p className="text-[11px] text-emerald-400">គ្រូបង្រៀន</p>
          </div>
        </div>
        
        {/* Class Selector Dropdown */}
        <button className="w-full flex items-center justify-between bg-[#0e2c33] border border-[#1b4852] rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:bg-[#123942] transition-colors cursor-pointer mb-6 shadow-sm">
          <span className="truncate">ថ្នាក់ទី{selectedGrade}{selectedSection} · {selectedAcademicYear || schoolProfile.academicYear}</span>
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        </button>
        
        {/* Core Menu Items */}
        <nav className="space-y-1">
          {renderSidebarItem('overview', <LayoutDashboard className="w-5 h-5" />, 'ផ្ទាំងរបស់គ្រូ')}
          {renderSidebarItem('roster', <Users className="w-5 h-5" />, 'ថ្នាក់ និងសិស្ស')}
          {renderSidebarItem('attendance', <Calendar className="w-5 h-5" />, 'ស្រង់អវត្តមាន')}
          {renderSidebarItem('grades', <PenTool className="w-5 h-5" />, 'ស្រង់ពិន្ទុ')}
          {renderSidebarItem('lesson_plans', <ClipboardList className="w-5 h-5" />, 'គម្រោង GEIP')}
          {renderSidebarItem('ranking', <Award className="w-5 h-5" />, 'លទ្ធផលសិក្សា')}
          {renderSidebarItem('leave_requests', <FileCheck2 className="w-5 h-5" />, 'សំណើសុំច្បាប់សិស្ស')}
          {renderSidebarItem('reports', <Printer className="w-5 h-5" />, 'របាយការណ៍')}
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-[#13373e]">
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0d282e] transition-colors">
            <User className="w-4 h-4" />
            <span>ព័ត៌មានផ្ទាល់ខ្លួន</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0d282e] transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>អំពី និងជំនួយ</span>
          </button>
          <button 
            onClick={() => { if(typeof logout === 'function') logout(); }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>ចាកចេញ</span>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#07191d] font-kantumruy animate-fadeIn">
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a2126] border-b border-[#13373e] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-white font-moul text-sm shadow-sm">
            K
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide leading-tight">KrouDigital 4.0</h1>
            <p className="text-[9px] text-slate-400 leading-tight">គ្រូបង្រៀន</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-[#0d282e] text-slate-300 border border-[#164049]"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE SIDEBAR (Overlay) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[80%] h-full flex flex-col shadow-2xl animate-slideInLeft">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-[#13373e] shadow-2xl z-10 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full p-4 lg:p-8 overflow-y-auto overflow-x-hidden relative min-h-[calc(100vh-60px)] lg:min-h-screen">
        {children}
      </main>

    </div>
  );
};
