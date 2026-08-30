const fs = require('fs');
let content = fs.readFileSync('src/components/RecentlyDeletedTab.tsx', 'utf-8');

// Update search and role filter
content = content.replace(
  /const filteredList = deletedUsers.filter\(item => \{[\s\S]*?return matchesSearch && matchesRole;\n  \}\);/,
  `const filteredList = deletedUsers.filter(item => {
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
  });`
);

// Replace User Info Table Cell
content = content.replace(
  /<td className="px-4 py-3\.5">\s*<div className="flex items-center gap-3">[\s\S]*?<\/td>/,
  `<td className="px-4 py-3.5">
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
                      </td>`
);

fs.writeFileSync('src/components/RecentlyDeletedTab.tsx', content);
