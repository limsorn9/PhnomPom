const fs = require('fs');
let content = fs.readFileSync('src/context/SchoolContext.tsx', 'utf8');

content = content.replace(
`        showToast('មិនអាចរក្សាទុកទៅកាន់ Cloud បានទេ', 'error');`,
`        showToast('មិនអាចរក្សាទុកទៅកាន់ Cloud បានទេ (Error Code 1)', 'error');`
);
content = content.replace(
`      console.error('Cloud upload error:', e);
      showToast('មានបញ្ហាក្នុងការតភ្ជាប់ Cloud', 'error');`,
`      console.error('Cloud upload error:', e);
      showToast('មានបញ្ហាក្នុងការតភ្ជាប់ Cloud: ' + (e.message || e), 'error');`
);

fs.writeFileSync('src/context/SchoolContext.tsx', content);
