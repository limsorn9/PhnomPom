const fs = require('fs');

// 1. Fix SchoolContext arrays
let ctx = fs.readFileSync('src/context/SchoolContext.tsx', 'utf8');
ctx = ctx.replace(
  /if \(cloudData\.([a-zA-Z0-9_]+) && Array\.isArray\(cloudData\.[a-zA-Z0-9_]+\)\) set([a-zA-Z0-9_]+)\(cloudData\.[a-zA-Z0-9_]+\);/g,
  'if (cloudData.$1 && Array.isArray(cloudData.$1)) set$2(cloudData.$1.filter(Boolean));'
);
ctx = ctx.replace(
  /if \(Array\.isArray\(parsed\.([a-zA-Z0-9_]+)\)\) set([a-zA-Z0-9_]+)\(parsed\.[a-zA-Z0-9_]+\);/g,
  'if (Array.isArray(parsed.$1)) set$2(parsed.$1.filter(Boolean));'
);
fs.writeFileSync('src/context/SchoolContext.tsx', ctx);

// 2. Fix deepSanitize
let sync = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');
const newSanitize = `const deepSanitize = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item)).filter(item => item !== null && item !== undefined);
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = deepSanitize(value);
    }
  }
  return clean;
};`;
sync = sync.replace(/const deepSanitize = [\s\S]*?return clean;\n};/, newSanitize);
fs.writeFileSync('src/services/firestoreSync.ts', sync);

// 3. Fix OfficialDocumentCenter
let doc = fs.readFileSync('src/components/OfficialDocumentCenter.tsx', 'utf8');
doc = doc.replace(/accessibleStudents\[0\]\.id/g, 'accessibleStudents[0]?.id || ""');
fs.writeFileSync('src/components/OfficialDocumentCenter.tsx', doc);

// 4. Fix activityTracker
let track = fs.readFileSync('src/utils/activityTracker.ts', 'utf8');
track = track.replace(/if \(other\.actionType !== 'delete'\) return false;/g, "if (!other || other.actionType !== 'delete') return false;");
track = track.replace(/const logDate = new Date\(log\.timestamp\);/g, "if (!log) return anomalies;\n  const logDate = new Date(log.timestamp);");
fs.writeFileSync('src/utils/activityTracker.ts', track);

console.log('Patched arrays, sanitize, and trackers.');
