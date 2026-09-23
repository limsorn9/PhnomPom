const fs = require('fs');
let content = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');

const newSanitize = `const deepSanitize = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item)).filter(item => item !== undefined);
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = deepSanitize(value);
    }
  }
  return clean;
};

const sanitizePayload = (data: Partial<CloudSchoolData>): Record<string, any> => {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (key === 'activityLogs' && Array.isArray(value)) {
      clean[key] = deepSanitize(value.slice(0, 100));
    } else {
      clean[key] = deepSanitize(value);
    }
  }
  return clean;
};`;

content = content.replace(/const sanitizePayload = [\s\S]*?return clean;\n};\n/, newSanitize + '\n');
fs.writeFileSync('src/services/firestoreSync.ts', content);
