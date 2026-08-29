const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
  `enableIndexedDbPersistence(db).catch((err) => {`,
  `// Temporarily disable persistence to debug write timeouts\n  // enableIndexedDbPersistence(db).catch((err) => {`
);

fs.writeFileSync('src/firebase.ts', content);
