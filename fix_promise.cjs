const fs = require('fs');
let content = fs.readFileSync('src/services/firestoreSync.ts', 'utf8');

content = content.replace(
  `await Promise.race([Promise.all(writePromises), timeoutPromise]);`,
  `const results = await Promise.race([Promise.allSettled(writePromises), timeoutPromise]) as PromiseSettledResult<any>[];
    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      console.error('Some partitions failed to sync:', errors);
      throw new Error('Partition write failed: ' + errors.map((e: any) => e.reason?.message || 'Unknown').join(', '));
    }`
);
fs.writeFileSync('src/services/firestoreSync.ts', content);
