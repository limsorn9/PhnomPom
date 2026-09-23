import React from 'react';
import { X, Filter } from 'lucide-react';
import { SCHOOL_STAFF_ROLES } from '../../data/schoolStaffRoles';

interface TeacherFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (filters: any) => void;
}

export const TeacherFilterDrawer: React.FC<TeacherFilterDrawerProps> = ({ isOpen, onClose, filters, setFilters }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[101] flex flex-col font-sans font-kantumruy transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-800">តម្រង</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-2">តួនាទី/មុខតំណែង</label>
            <select 
              value={filters.role || 'ALL'} 
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {SCHOOL_STAFF_ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-2">ស្ថានភាព</label>
            <select 
              value={filters.status || 'ALL'} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">ស្ថានភាពទាំងអស់</option>
              <option value="active">ដំណើរការ</option>
              <option value="inactive">ផ្អាកដំណើរការ</option>
              <option value="retired">ចូលនិវត្តន៍</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
          <button 
            onClick={() => {
              setFilters({ role: 'ALL', status: 'ALL' });
            }}
            className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium py-2 rounded-xl text-xs hover:bg-slate-50 transition"
          >
            សម្អាត
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-xl text-xs hover:bg-blue-700 transition shadow-sm"
          >
            អនុវត្ត
          </button>
        </div>
      </div>
    </>
  );
};
