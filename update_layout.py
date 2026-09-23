import re

with open('src/components/HomeroomTeacherDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'TeacherLayout' not in content:
    # the file imports React, useState, useEffect from 'react'
    content = re.sub(r"import React", "import React", content, count=1)
    # let's just insert it after the first import
    content = content.replace("import { useSchool } from '../context/SchoolContext';", "import { useSchool } from '../context/SchoolContext';\nimport { TeacherLayout } from './TeacherLayout';")

# Find where renderSidebarItem starts
start_idx = content.find("  const renderSidebarItem = (id: TeacherNavigationTab, icon: React.ReactNode, label: string) => {")
# Find where main content area ends
end_str = '      <main className="flex-1 w-full p-4 lg:p-8 overflow-y-auto overflow-x-hidden relative h-screen">'
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_str)
    
    new_code = "  return (\n    <TeacherLayout activeTabSub={activeTabSub} setActiveTabSub={setActiveTabSub}>"
    content = content[:start_idx] + new_code + content[end_idx:]
else:
    print("Could not find start or end for sidebar removal")

# Now remove the closing tags at the very end
end_pattern = r'      </main>\s*</div>\s*\);\s*};\s*'
content = re.sub(end_pattern, '    </TeacherLayout>\n  );\n};\n', content)

# But wait, there is also the MOBILE TOP BAR NAVIGATION block right after <main...> that needs to go away?
# Let's check what's after <main...>
# It has MOBILE TOP BAR NAVIGATION and then {activeTabSub === 'overview' && ...}
# Let's see if we can find the MOBILE TOP BAR NAVIGATION block and remove it too, since we added Mobile Header to TeacherLayout

mobile_top_bar_start = content.find('{/* MOBILE TOP BAR NAVIGATION (Fallback for mobile) */}')
mobile_top_bar_end = content.find('{/* VIEW A: HOME OVERVIEW (ផ្ទាំងរបស់គ្រូ) */}')

if mobile_top_bar_start != -1 and mobile_top_bar_end != -1:
    content = content[:mobile_top_bar_start] + content[mobile_top_bar_end:]

with open('src/components/HomeroomTeacherDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
