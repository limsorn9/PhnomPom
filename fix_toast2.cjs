const fs = require('fs');
let content = fs.readFileSync('src/context/SchoolContext.tsx', 'utf8');

content = content.replace(
`      const success = await syncSchoolDataToFirestore(payload, true);
      if (success) {`,
`      const result = await syncSchoolDataToFirestore(payload, true);
      if (result.success) {`
);

content = content.replace(
`        showToast('មិនអាចរក្សាទុកទៅកាន់ Cloud បានទេ (Error Code 1)', 'error');`,
`        showToast('មិនអាចរក្សាទុកទៅកាន់ Cloud បានទេ: ' + result.error, 'error');`
);

// also fix the initialization call
content = content.replace(
`syncSchoolDataToFirestore(getFullSchoolPayload(), true).catch(console.warn);`,
`syncSchoolDataToFirestore(getFullSchoolPayload(), true).catch(console.warn);`
);

fs.writeFileSync('src/context/SchoolContext.tsx', content);
