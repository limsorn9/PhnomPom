const fs = require('fs');
const path = 'src/context/SchoolContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add state to Context Type
content = content.replace(
  "  isGoogleDriveSyncEnabled: boolean;",
  "  isGoogleDriveSyncEnabled: boolean;\n  isSuperAdminHub: boolean;\n  setIsSuperAdminHub: (isHub: boolean) => void;"
);

// Add to Provider
content = content.replace(
  "  const [isGoogleDriveSyncEnabled, setIsGoogleDriveSyncEnabled] = useState(false);",
  "  const [isGoogleDriveSyncEnabled, setIsGoogleDriveSyncEnabled] = useState(false);\n  const [isSuperAdminHub, setIsSuperAdminHub] = useState(true);"
);

// Add to returned context
content = content.replace(
  "    setIsGoogleDriveSyncEnabled",
  "    setIsGoogleDriveSyncEnabled,\n    isSuperAdminHub,\n    setIsSuperAdminHub"
);

fs.writeFileSync(path, content, 'utf8');
console.log('SchoolContext updated');
