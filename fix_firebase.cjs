const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
`  // Temporarily disable persistence to debug write timeouts
  // enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.');
    }
  });`,
`  // Temporarily disable persistence to debug write timeouts
`
);

fs.writeFileSync('src/firebase.ts', content);
