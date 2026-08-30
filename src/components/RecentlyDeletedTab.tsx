import React, { useState } from 'react';
import { DeletedAppUser, UserRole } from '../types';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  ShieldAlert,
  UserX,
  UserCheck,
  Calendar,
  Info,
  AlertOctagon,
  ArrowRight,
  Filter
} from 'lucide-react';

interface RecentlyDeletedTabProps {
  deletedUsers: DeletedAppUser[];
  onRestore: (deletedId: string) => void;
  onPermanentDelete: (deletedId: string) => void;
  onEmptyTrash: () => void;
  isDirector: boolean;
}

export const RecentlyDeletedTab: React.FC<RecentlyDeletedTabProps> = ({
  deletedUsers,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  isDirector
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedRecordForPurge, setSelectedRecordForPurge] = useState<DeletedAppUser | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  const calculateDaysRemaining = (expiresAtStr: string): number => {
    const exp = new Date(expiresAtStr).getTime();
    const now = Date.now();
    const diff = exp - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(days, 0);
  };

  const formatKhmerDate = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('km-KH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'director':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">នាយក</span>;
      case 'teacher':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">គ្រូបង្រៀន</span>;
      case 'secretary':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">លេខាធិការ</span>;
      case 'librarian':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">បណ្ណារក្ស</span>;
      case 'student':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">សិស្ស</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{role}</span>;
    }
  };

  const filteredList = deletedUsers.filter(item => {
    const name = item.user?.nameKhmer || item.studentProfileBackup?.nameKhmer || item.teacherProfileBackup?.nameKhmer || '';
    const email = item.user?.email || item.teacherProfileBackup?.email || '';
    const phone = item.user?.phone || item.teacherProfileBackup?.phone || '';
    const code = item.user?.staffCode || item.teacherProfileBackup?.staffCode || item.studentProfileBackup?.code || '';
    
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (email && email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (phone && phone.includes(searchQuery)) ||
      (code && code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const targetRole = item.entityType === 'student' ? 'student' : (item.user?.role || (item.entityType === 'teacher' ? 'teacher' : ''));
    const matchesRole = roleFilter === 'all' || targetRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-moul text-sm sm:text-base text-rose-950">
                ធុងសំរាមគណនី (Recently Deleted - 30-Day Retention)
              </h3>
              <span className="bg-rose-200 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {deletedUsers.length} គណនី
              </span>
            </div>
            <p className="text-xs text-rose-800/90 mt-1 max-w-2xl leading-relaxed">
              រាល់គណនីដែលបានលុប នឹងត្រូវបានរក្សាទុកសុវត្ថិភាពរយៈពេល <b>៣០ ថ្ងៃ</b> មុនពេលប្រព័ន្ធធ្វើការលុបជាស្ថាពរដោយស្វ័យប្រវត្តិ។ អ្នកគ្រប់គ្រងអាចស្តារ (Restore) គណនី និងទិន្នន័យបង្រៀនឡើងវិញបានគ្រប់ពេល។
            </p>
          </div>
        </div>

        {deletedUsers.length > 0 && isDirector && (
          <button
            type="button"
            onClick={() => setShowEmptyConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>សម្អាតធុងសំរាមទាំងអស់</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល លេខទូរស័ព្ទ ឬមូលហេតុលុប..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">គ្រប់តួនាទី (All Roles)</option>
            <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
            <option value="director">នាយកសាលា (Director)</option>
            <option value="secretary">លេខាធិការ (Secretary)</option>
            <option value="librarian">បណ្ណារក្ស (Librarian)</option>
            <option value="student">សិស្ស (Student)</option>
          </select>
        </div>
      </div>

      {/* Deleted Users Table / Cards */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">គ្មានគណនីក្នុងធុងសំរាមឡើយ</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            មិនមានគណនីដែលត្រូវបានលុបក្នុងរយៈពេល ៣០ ថ្ងៃចុងក្រោយនេះទេ។ រាល់គណនីគ្រូ និងបុគ្គលិកទាំងអស់កំពុងដំណើរការជាធម្មតា។
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ព័ត៌មានគណនី</th>
                  <th className="px-4 py-3">កាលបរិច្ឆេទលុប</th>
                  <th className="px-4 py-3">សុពលភាពរក្សាទុក</th>
                  <th className="px-4 py-3">អ្នកលុប & មូលហេតុ</th>
                  <th className="px-4 py-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredList.map((record) => {
                  const daysLeft = calculateDaysRemaining(record.expiresAt);
                  return (
                    <tr key={record.id} className="hover:bg-rose-50/30 transition-colors">
                      {/* User Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={record.user?.avatarUrl || record.studentProfileBackup?.photoUrl || record.teacherProfileBackup?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                            alt="Profile"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 grayscale-30"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-sm">
                                {record.user?.nameKhmer || record.studentProfileBackup?.nameKhmer || record.teacherProfileBackup?.nameKhmer}
                              </span>
                              {getRoleBadge(record.entityType === 'student' ? 'student' as any : (record.user?.role || 'teacher' as any))}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                              {record.user?.email || record.teacherProfileBackup?.email ? <span>📧 {record.user?.email || record.teacherProfileBackup?.email}</span> : null}
                              {record.user?.phone || record.teacherProfileBackup?.phone ? <span>📱 {record.user?.phone || record.teacherProfileBackup?.phone}</span> : null}
                            </div>
                            
                            {record.teacherProfileBackup && (
                              <span className="inline-flex mt-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                📎 មានប្រវត្តិរូបគ្រូ (Code: {record.teacherProfileBackup.staffCode})
                              </span>
                            )}
                            {record.studentProfileBackup && (
                              <span className="inline-flex mt-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                📎 មានប្រវត្តិរូបសិស្ស (Code: {record.studentProfileBackup.code})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Deleted Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatKhmerDate(record.deletedAt)}</span>
                        </div>
                      </td>

                      {/* Retention Countdown */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          daysLeft <= 5
                            ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                            : daysLeft <= 15
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>នៅសល់ {daysLeft} ថ្ងៃ</span>
                        </span>
                      </td>

                      {/* Deleted By & Reason */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-[11px] font-bold text-slate-800">
                          ដោយ: {record.deletedBy.nameKhmer}
                        </p>
                        <p className="text-[11px] text-slate-600 italic mt-0.5 line-clamp-2">
                          «{record.reason}»
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onRestore(record.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                          title="ស្តារគណនី និងប្រវត្តិរូបគ្រូឡើងវិញ"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ស្តារឡើងវិញ</span>
                        </button>

                        {isDirector && (
                          <button
                            type="button"
                            onClick={() => setSelectedRecordForPurge(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-all cursor-pointer"
                            title="លុបជាស្ថាពរចេញពីប្រព័ន្ធ"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Permanent Delete of Single Record */}
      {selectedRecordForPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-moul text-sm text-slate-800">បញ្ជាក់ការលុបជាស្ថាពរ (Permanent Purge)</h4>
                <p className="text-xs text-rose-600 font-bold">សកម្មភាពនេះមិនអាចស្តារឡើងវិញបានឡើយ!</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              តើលោកអ្នកពិតជាចង់លុបគណនីរបស់ «<b>{selectedRecordForPurge.user?.nameKhmer || selectedRecordForPurge.studentProfileBackup?.nameKhmer || selectedRecordForPurge.teacherProfileBackup?.nameKhmer}</b>» ចេញពីប្រព័ន្ធជាស្ថាពរមែនទេ? ទិន្នន័យទាំងអស់នឹងត្រូវសម្អាតទាំងស្រុង។
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRecordForPurge(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  onPermanentDelete(selectedRecordForPurge.id);
                  setSelectedRecordForPurge(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                លុបជាស្ថាពរ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Empty Trash */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-moul text-sm text-slate-800">សម្អាតធុងសំរាមទាំងអស់ (Empty Trash)</h4>
                <p className="text-xs text-rose-600 font-bold">លុបគណនីទាំងអស់ចំនួន {deletedUsers.length} ជាស្ថាពរ</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              តើលោកអ្នកពិតជាចង់សម្អាតធុងសំរាមទាំងមូលមែនទេ? រាល់គណនី និងទិន្នន័យប្រវត្តិរូបដែលបានលុបនឹងត្រូវលុបជាស្ថាពរដោយមិនអាចទាញយកមកវិញបានឡើយ។
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEmptyConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={() => {
                  onEmptyTrash();
                  setShowEmptyConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                យល់ព្រមសម្អាត
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
