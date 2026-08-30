const fs = require('fs');
let content = fs.readFileSync('src/context/SchoolContext.tsx', 'utf-8');

const oldRestore = `  const restoreUser = (deletedId: string) => {
    const deletedRecord = deletedUsers.find(d => d.id === deletedId);
    if (!deletedRecord) {
      return { success: false, message: 'រកមិនឃើញទិន្នន័យដែលបានលុបនេះឡើយ' };
    }

    // Restore to appUsers
    const restoredUser: AppUser = {
      ...deletedRecord.user,
      status: 'active'
    };

    setAppUsers(prev => {
      const filtered = prev.filter(u => u.id !== restoredUser.id && u.email?.toLowerCase() !== restoredUser.email?.toLowerCase());
      return [restoredUser, ...filtered];
    });

    // Restore teacher profile if backup exists
    if (deletedRecord.teacherProfileBackup) {
      const restoredTeacher = deletedRecord.teacherProfileBackup;
      setTeachers(prev => {
        const filtered = prev.filter(t => t.id !== restoredTeacher.id && t.staffCode !== restoredTeacher.staffCode);
        return [restoredTeacher, ...filtered];
      });
    }

    // Remove from deletedUsers
    setDeletedUsers(prev => prev.filter(d => d.id !== deletedId));

    // Audit log
    addAccountAuditLog({
      eventType: 'restore',
      targetUserId: restoredUser.id,
      targetUserName: restoredUser.nameKhmer,
      targetUserRole: restoredUser.role,
      targetUserEmail: restoredUser.email,
      actorName: currentUser?.nameKhmer || 'ប្រព័ន្ធ',
      actorRole: currentUser?.role || 'system',
      details: 'បានស្តារគណនីពីធុងសំរាមឡើងវិញ'
    });

    return { success: true, message: 'បានស្តារគណនីឡើងវិញដោយជោគជ័យ' };
  };`;

const newRestore = `  const restoreUser = (deletedId: string) => {
    const deletedRecord = deletedUsers.find(d => d.id === deletedId);
    if (!deletedRecord) {
      return { success: false, message: 'រកមិនឃើញទិន្នន័យដែលបានលុបនេះឡើយ' };
    }

    // Restore to appUsers if it exists
    let targetName = 'ទិន្នន័យ';
    let targetRole = 'unknown';

    if (deletedRecord.user) {
      const restoredUser: AppUser = {
        ...deletedRecord.user,
        status: 'active'
      };
      
      targetName = restoredUser.nameKhmer;
      targetRole = restoredUser.role;

      setAppUsers(prev => {
        const filtered = prev.filter(u => u.id !== restoredUser.id && (u.email && restoredUser.email ? u.email.toLowerCase() !== restoredUser.email.toLowerCase() : true));
        return [restoredUser, ...filtered];
      });
    }

    // Restore teacher profile if backup exists
    if (deletedRecord.teacherProfileBackup) {
      const restoredTeacher = deletedRecord.teacherProfileBackup;
      targetName = restoredTeacher.nameKhmer;
      targetRole = 'teacher';
      setTeachers(prev => {
        const filtered = prev.filter(t => t.id !== restoredTeacher.id && t.staffCode !== restoredTeacher.staffCode);
        return [restoredTeacher, ...filtered];
      });
    }

    // Restore student profile if backup exists
    if (deletedRecord.studentProfileBackup) {
      const restoredStudent = deletedRecord.studentProfileBackup;
      targetName = restoredStudent.nameKhmer;
      targetRole = 'student';
      setStudents(prev => {
        const filtered = prev.filter(s => s.id !== restoredStudent.id && s.code !== restoredStudent.code);
        return [restoredStudent, ...filtered];
      });
    }

    // Remove from deletedUsers
    setDeletedUsers(prev => prev.filter(d => d.id !== deletedId));

    // Audit log
    addAccountAuditLog({
      eventType: 'restore',
      targetUserId: deletedRecord.user?.id || deletedRecord.studentProfileBackup?.id || deletedRecord.teacherProfileBackup?.id || deletedId,
      targetUserName: targetName,
      targetUserRole: targetRole,
      targetUserEmail: deletedRecord.user?.email || '',
      actorName: currentUser?.nameKhmer || 'ប្រព័ន្ធ',
      actorRole: currentUser?.role || 'system',
      details: 'បានស្តារទិន្នន័យពីធុងសំរាមឡើងវិញ'
    });

    return { success: true, message: 'បានស្តារទិន្នន័យឡើងវិញដោយជោគជ័យ' };
  };`;

content = content.replace(oldRestore, newRestore);
fs.writeFileSync('src/context/SchoolContext.tsx', content);
