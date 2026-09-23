const fs = require('fs');
let content = fs.readFileSync('src/context/SchoolContext.tsx', 'utf-8');

const oldUpdate = `  const updateCurrentUserProfile = (updatedFields: Partial<AppUser>) => {
    if (!currentUser) return { success: false, message: 'មិនមានអ្នកប្រើប្រាស់កំពុងចូលស្ថាប័នទេ' };

    const finalUpdates = { ...updatedFields };
    if (currentUser.role === 'student') {
      delete finalUpdates.avatarUrl; // Students cannot freely change photo
    }

    const updatedUser = { ...currentUser, ...finalUpdates };
    setCurrentUser(updatedUser);
    setAppUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    localStorage.setItem(\`\${LOCAL_STORAGE_KEY}_current_user\`, JSON.stringify(updatedUser));

    return { success: true, message: 'បានកែប្រែប្រវត្តិរូបផ្ទាល់ខ្លួនជោគជ័យ!' };
  };`;

const newUpdate = `  const updateCurrentUserProfile = (updatedFields: Partial<AppUser>) => {
    if (!currentUser) return { success: false, message: 'មិនមានអ្នកប្រើប្រាស់កំពុងចូលស្ថាប័នទេ' };

    const finalUpdates = { ...updatedFields };
    // Only directors can freely change photos
    if (currentUser.role !== 'director') {
      delete finalUpdates.avatarUrl; 
    }

    const updatedUser = { ...currentUser, ...finalUpdates };
    setCurrentUser(updatedUser);
    setAppUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    localStorage.setItem(\`\${LOCAL_STORAGE_KEY}_current_user\`, JSON.stringify(updatedUser));

    return { success: true, message: 'បានកែប្រែប្រវត្តិរូបផ្ទាល់ខ្លួនជោគជ័យ!' };
  };`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('src/context/SchoolContext.tsx', content);
