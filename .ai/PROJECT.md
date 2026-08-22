# PROJECT OVERVIEW: PHNOMPOM
**Application Name:** សាលាបឋមសិក្សាភ្នំពុំ - Phnom Pom Primary School Management System
**Target Institution:** សាលាបឋមសិក្សាភ្នំពុំ (Phnom Pom Primary School)
**Location:** ភូមិអូរគល់សំយ៉ុង ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង (Ou Kol Samyong Village, Barang Thleak Commune, Phnom Proek District, Battambang Province, Cambodia)
**School Code:** 020401015
**Principal:** លោក លីម សន (Mr. Lim Sorn)
**GitHub Repository:** https://github.com/limsorn9/PhnomPom

---

## 1. Mission & Vision
PhnomPom is a specialized, database-backed web application and administrative ecosystem engineered specifically for Cambodian primary schools. It unites school administration, teacher-in-charge classroom operations, student demographics, assessment and ranking, health/BMI monitoring, digital honor badges, household census tracking, library lending, budget accounting, official Ministry of Education (MoEYS) document generation, and Google Workspace integration into a unified, high-performance platform.

---

## 2. Core Target Users
1. **School Principal / Director (នាយកសាលា):** Overall leadership, official approvals, institutional planning, budget supervision, teacher appraisal, official correspondence logbooks.
2. **Deputy Principal / Vice Director (នាយករង):** Academic coordination, class scheduling, examination supervision, discipline, model school standard auditing.
3. **Secretary / School Administrator (លេខាធិការ / រដ្ឋបាល):** Inward/outward official letters, student transfers, staff leave records, certificate generation, census records.
4. **Classroom Teacher / Teacher-in-Charge (គ្រូបន្ទុកថ្នាក់):** Daily class management, attendance, scores, monthly/semester ranking, at-risk student intervention plans, lesson plans, parent meetings, daily class logs, student digital badges.
5. **Subject Teacher (គ្រូឯកទេស):** Specific subject score entry, teaching schedule, library and learning resource collaboration.
6. **Librarian (បណ្ណារក្ស):** Book cataloging, physical and digital lending, reading progress logs, reader of the month awards.
7. **Students & Parents (សិស្ស និងមាតាបិតា):** Student portal for scorecards, attendance records, digital badge showcases, certificate downloads, leave requests, feedback submission.

---

## 3. Main System Modules
| Module | Khmer Name | Description |
|---|---|---|
| **Dashboard** | ផ្ទាំងព័ត៌មានទូទៅ | High-level statistics, gender breakdown, vulnerable student counts, recent announcements, quick actions. |
| **Teacher-in-Charge Workspace** | បន្ទប់គ្រូបន្ទុកថ្នាក់ | Comprehensive classroom management for grades 1-6 (Roster, Attendance, Grades, At-Risk Support, Lesson Plans, Parent Meetings, Class Logs, Notifications). |
| **Student Management** | គ្រប់គ្រងសិស្ស | Full student directory, detailed biodata, IDPoor/vulnerability flags, health & BMI, digital badges, PDF biodata generation. |
| **Classroom Scores & Rankings** | ពិន្ទុ & ចំណាត់ថ្នាក់ | Monthly & Semester score entry (Khmer, Math, Science, Social, Arts/PE, Life Skills), automated ranking, MoEYS grade conversion, honor certificates. |
| **Health & Attendance** | សុខភាព & វត្តមាន | Daily attendance tracking with morning/afternoon sessions, biometric BMI calculation, nutritional status categorization. |
| **Official Document Center** | មជ្ឈមណ្ឌលឯកសាររដ្ឋបាល | Print-ready MoEYS administrative forms (Study certificates, transfer letters, mission orders, leave requests, invitations, commendations). |
| **School Administration & Logbooks** | រដ្ឋបាល & សៀវភៅលិខិត | Inward/Outward letter tracking, staff leave management, school development committee, model school standards. |
| **School Asset & Strategic Management** | ផែនការ & ទ្រព្យសម្បត្តិ | Strategic 3-5 year plan, Model School Standards evaluation (5 core standards), physical asset inventory. |
| **Student Transfers** | ផ្ទេរសិស្សចេញ-ចូល | Formal student transfer requests and tracking with MoEYS transfer letter numbering. |
| **Household Census & GIS** | ជំរឿនគ្រួសារ & ផែនទី | Community census with household coordinates (GPS), IDPoor card records, family member rosters. |
| **Library Management** | បណ្ណាល័យ & អំណាន | Catalog of physical & digital books, PDF reader, student borrowing logs, reading comprehension notes. |
| **Budget & Finance** | ថវិកា & ហិរញ្ញវត្ថុ | State budget (PB), School Improvement Grants (SIG), community donations, expense tracking with category breakdowns. |
| **Digital Badges & Honors** | ផ្លាកសញ្ញា & មេដាយឌីជីថល | Gamified positive reinforcement with 5 tiers (Bronze, Silver, Gold, Platinum, Diamond) and MoEYS print certificates. |
| **Google Workspace Hub** | Google Workspace | Direct cloud synchronization with Google Drive (backup/restore), Google Sheets, Google Calendar, and Gmail. |
| **User Accounts & RBAC** | គ្រប់គ្រងគណនី | Multi-role user access management, password reset workflows, profile edit requests. |

---

## 4. Technology Stack
- **Frontend Framework:** React 19 + TypeScript (Strict mode)
- **Bundler & Build Tool:** Vite 6 + Tailwind CSS v4
- **Icons:** `lucide-react`
- **Animations & Effects:** `motion` (`motion/react`), `canvas-confetti`
- **Charts & Visualizations:** `recharts`
- **Backend & Cloud Services:** Firebase (Authentication, Firestore configuration), Google APIs (OAuth 2.0, Drive, Sheets, Calendar, Gmail)
- **Typography & Localization:** Khmer Unicode (`Battambang`, `Moul`, `Siemreap`), English support
