import React from 'react';
import { LogOut } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export const SchoolAdminDashboard: React.FC = () => {
  const { currentUser } = useSchool();
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#07191d] text-slate-100 p-8 flex flex-col items-center justify-center font-kantumruy">
      <div className="bg-[#0d282e]/80 border border-cyan-500/30 rounded-3xl p-12 text-center max-w-2xl w-full shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl font-bold text-cyan-400 mb-4">ផ្ទាំងរដ្ឋបាលនាយកសាលា</h1>
        <p className="text-slate-400 mb-8">សូមស្វាគមន៍ {currentUser?.nameKhmer}</p>
        <button onClick={logout} className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold transition">
          <LogOut className="w-5 h-5" />
          ចាកចេញ
        </button>
      </div>
    </div>
  );
};
