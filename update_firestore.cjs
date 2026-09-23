const fs = require('fs');
let content = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');

content = content.replace(
`export const syncSchoolDataToFirestore = async (data: Partial<CloudSchoolData>, force = false): Promise<boolean> => {`,
`export const syncSchoolDataToFirestore = async (data: Partial<CloudSchoolData>, force = false): Promise<{success: boolean, error?: string}> => {`
);

content = content.replace(/return true;/g, 'return { success: true };');
content = content.replace(/return false;/g, 'return { success: false, error: error?.message || String(error) };');

fs.writeFileSync('src/services/firestoreSync.ts', content);
