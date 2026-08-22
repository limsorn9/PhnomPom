# SYSTEM REQUIREMENTS & FUNCTIONAL SPECIFICATION

## 1. Functional Scope & Operational Modules

### 1.1 Teacher-in-Charge / Class Teacher Workflow
- Dedicated workspace organized by Grade (1-6) and Section (ក, ខ, គ).
- **Sub-Workspaces**:
  1. *My Class (បញ្ជីសិស្សក្នុងថ្នាក់)*: Roster, age/gender breakdown, vulnerability filters, quick contact, class council leaders.
  2. *Attendance (វត្តមានប្រចាំថ្ងៃ/ខែ)*: Quick batch attendance (Present, Permission, Absent), session selector (Morning/Afternoon), monthly attendance rate calculation.
  3. *Grades & Ranking (ពិន្ទុ & ចំណាត់ថ្នាក់)*: Entry for monthly assessments and semester examinations across all primary competencies, automatic total, average, letter grade, and rank computation.
  4. *At-Risk Students & Remedial Support (សិស្សរៀនយឺត & ជំនួយបំប៉ន)*: Categorization (reading difficulty, math, attendance risk), intervention strategies, target metrics, progress logs.
  5. *Daily Class Logs (សៀវភៅតាមដានប្រចាំថ្ងៃ)*: Shift logs, classroom atmosphere, discipline/hygiene incidents, parent contacts, inspection visits.
  6. *Lesson Plans (កិច្ចតែងការបង្រៀន)*: 5-step MoEYS lesson structure, objectives (knowledge, skills, attitude), teaching aids, teacher reflection.
  7. *Parent Meetings & Requests (កិច្ចប្រជុំមាតាបិតា)*: Parent committee elections, meeting minutes, resolution records, leave requests, feedback tracking.
  8. *Notifications & Honors*: Real-time alerts for student achievements, password resets, and system broadcasts.

### 1.2 Excel/VBA Macro Reverse Engineering Alignment
The system replaces and modernizes the legacy Cambodian primary school Excel workbook (.xlsm) containing the following functional sheets:
- `Pri_Sco`, `Sco_M1` through `Sco_M12`: Monthly subject score calculation sheets.
- `Sco_S1`, `Sco_S2`: Semester 1 and Semester 2 consolidated exam records.
- `Rank`: Automated ranking and ranking distribution calculation.
- `F_BookAM1`, `F_BookAM2`, `F_BookS`, `F_BookBS`, `F_BookAllY`: Full-year student scorebook and report card formats.
- `Review_Class`: Classroom academic diagnostics and pass/fail summary.
- `CLASS_PLAN`, `1Y_Plan`, `3M_Plan`, `1Y_3mPlan`: Annual, quarterly, and weekly instructional plans.
- `Class_Com`, `Structure`: Classroom committee leadership hierarchy and student seating charts.
- `Agreement`, `Guar_Agree`: Parent guarantee agreements and student discipline compacts.
- `INVITATION`, `MEETING`, `The_Log`: Parent meeting invitations, agenda, and official minutes.
- `INSPECTION`, `ACTION_PLAN`: Administrative classroom inspection checklists and improvement actions.
- `Personal`, `Certi`: Student biodata sheets and print-ready honor certificates.

### 1.3 Official MoEYS Document Generation & Printing System
- Structured HTML/CSS print templates with exact page margins, typography (`Moul` headers, `Battambang` body), watermarks, and signature blocks.
- Real-time print preview, custom field overrides, and one-click PDF printing.
- Standard forms supported:
  1. *Certificate of Study (លិខិតបញ្ជាក់ការសិក្សា)*
  2. *Student Transfer Letter (លិខិតផ្ទេរការសិក្សាសិស្ស)*
  3. *Staff Mission Order (លិខិតបញ្ជាបេសកកម្ម)*
  4. *Staff Leave Request (ពាក្យសុំច្បាប់ឈប់សម្រាក)*
  5. *Parent Meeting Invitation (លិខិតអញ្ជើញមាតាបិតា)*
  6. *Letter of Commendation & Honor Certificate (លិខិតសរសើរ & ប័ណ្ណកិត្តិយស)*
  7. *Model School Standard Audit Report (របាយការណ៍វាយតម្លៃស្តង់ដាសាលារៀនគំរូ)*
  8. *School Asset & Property Inventory (តារាងស្ថិតិ និងសារពើភណ្ឌទ្រព្យសម្បត្តិ)*
  9. *Employment & Service Certificate (លិខិតបញ្ជាក់ការងារ)*

### 1.4 Digital Badges & Positive Reinforcement System
- 8 Core Categories (Academic Excellence, Attendance, Behavior, Leadership, Sports/Arts, Eco/Hygiene, Reading, Improvement).
- 5 Tiers: Bronze (+10 pts), Silver (+25 pts), Gold (+50 pts), Platinum (+100 pts), Diamond (+200 pts).
- Individual student honor showcases and printable certificates of recognition.

### 1.5 Cloud & Google Workspace Integration
- Google Drive automated backup and JSON snapshot restoration.
- Google Sheets export and sync.
- Google Calendar sync for academic milestones and holidays.
- In-app Gmail dispatch for official communications.
- Standalone single-file HTML offline export.
