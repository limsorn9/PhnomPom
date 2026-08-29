const fs = require('fs');
let content = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');

const newWrite = `    const writePromises = [
      setDoc(doc(db, 'schools', CLOUD_DOCS.MAIN), partitions.main, { merge: true }).then(() => console.log('MAIN synced')).catch(e => { console.error('MAIN error', e); throw e; }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.STUDENTS), partitions.students, { merge: true }).then(() => console.log('STUDENTS synced')).catch(e => { console.error('STUDENTS error', e); throw e; }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.ACADEMICS), partitions.academics, { merge: true }).then(() => console.log('ACADEMICS synced')).catch(e => { console.error('ACADEMICS error', e); throw e; }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.RESOURCES), partitions.resources, { merge: true }).then(() => console.log('RESOURCES synced')).catch(e => { console.error('RESOURCES error', e); throw e; }),
      setDoc(doc(db, 'schools', CLOUD_DOCS.STAFF_USERS), partitions.staffUsers, { merge: true }).then(() => console.log('STAFF_USERS synced')).catch(e => { console.error('STAFF_USERS error', e); throw e; })
    ];`;

content = content.replace(/const writePromises = \[[\s\S]*?\];/m, newWrite);
fs.writeFileSync('src/services/firestoreSync.ts', content);
