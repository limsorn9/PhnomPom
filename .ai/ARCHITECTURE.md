# APPLICATION ARCHITECTURE
**Project:** PhnomPom Primary School Management Web Application
**Architecture Paradigm:** Client-Centric React SPA + Context-Driven State Machine + Firebase/Google Cloud Services

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|  [Sidebar / Nav]  [Header & Controls]  [Role-Based Dynamic Workspace Renderers]   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                             REACT COMPONENT LAYER                                 |
|  • Dashboard (Analytics)         • Homeroom Dashboard (Teacher Workspace)         |
|  • Student Management (Roster)   • Classroom Scores & Ranking                     |
|  • Official Document Center      • School Admin & Strategic Management            |
|  • Digital Badges & Certificates • Household Census & GIS Map                     |
|  • Library Management            • Budget & Finance Accounting                    |
|  • Google Workspace Hub          • Accounts Management & RBAC                     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        APPLICATION CONTEXT & STATE ENGINE                         |
|                                SchoolContext.tsx                                  |
|  • In-Memory Observable Store (Students, Teachers, Scores, Badges, Census, etc.)  |
|  • LocalStorage Persistence Adapter with Initial Seed Fallback                    |
|  • CRUD Reducers, Batch Operations, Filter Predicates & Rank Calculators          |
|  • Notification Dispatcher & Role-Based Access Control (RBAC) Enforcer            |
+-----------------------------------------------------------------------------------+
                     |                                       |
                     v                                       v
+------------------------------------+  +-------------------------------------------+
|      EXTERNAL GOOGLE SERVICES      |  |           FIREBASE INFRASTRUCTURE         |
|  • Google Auth (OAuth 2.0 In-Mem)  |  |  • Firebase App Instance (firebase-config)|
|  • Google Drive (Cloud Backup/Sync)|  |  • Firebase Authentication                |
|  • Google Sheets & Calendar Sync   |  |  • Firestore Database Integration Ready   |
|  • Gmail Messaging API             |  |                                           |
+------------------------------------+  +-------------------------------------------+
```

---

## 1. Directory Structure & Modular Breakdown
- `/src/App.tsx`: Top-level application layout, routing/tab orchestrator, modal container, auth state bridge.
- `/src/types.ts`: Universal TypeScript type definitions, domain models, enum constants, and interfaces.
- `/src/context/SchoolContext.tsx`: Core state provider containing reactive hooks, storage synchronization, and business logic.
- `/src/data/initialData.ts`: Default seed data reflecting Phnom Pom Primary School's operational profile, faculty, and student body.
- `/src/components/`: Modular UI views (e.g., `StudentManagement.tsx`, `HomeroomTeacherDashboard.tsx`, `OfficialDocumentCenter.tsx`, `SchoolManagement.tsx`).
  - `/src/components/homeroom/`: Teacher-in-charge subcomponents (`MyClassTab`, `AttendanceTab`, `GradesTab`, `AtRiskStudentsTab`, `DailyClassLogsTab`, `LessonPlansTab`, `ParentMeetingsTab`, `HomeroomNotificationsTab`).
  - `/src/components/badges/`: Digital badge showcase, awarding modals, certificate generation, tier styling.
- `/src/services/`: Cloud and API integration services (`googleAuth.ts`, `googleDrive.ts`, `googleSheets.ts`, `googleCalendar.ts`, `gmail.ts`).
- `/src/utils/`: Formatting helpers, Khmer date converters, translations (`translations.ts`).

---

## 2. State Management & Data Flow
1. The entire state is encapsulated in `SchoolContext`, exposing state variables and mutator methods via the `useSchool()` custom hook.
2. Changes to state immediately reflect in the local storage cache (`phnom_pom_primary_school_data_v2`), ensuring offline resilience and multi-session persistence.
3. Google Drive synchronization enables manual or periodic JSON state snapshots directly into the school's authorized Google Drive repository.

---

## 3. Role-Based Access Control (RBAC) Matrix
| Module / Tab | Director (នាយក) | Secretary (លេខា) | Teacher / Homeroom (គ្រូ) | Librarian (បណ្ណារក្ស) | Student / Parent (សិស្ស) |
|---|---|---|---|---|---|
| Dashboard | Full | Full | Read/Class | Read/Summary | Student View |
| Homeroom Dashboard | Full | Read | Assigned Class | None | None |
| Student Management | Full | Full | Read/Class Edit | Read | Profile Only |
| Classroom Scores | Full | Full | Full (Assigned) | None | Scorecard |
| Official Documents | Full | Full | Class Templates | None | None |
| School Admin & Logs | Full | Full | None | None | None |
| Budget & Finance | Full | Full | None | None | None |
| Library Management | Full | Full | Read/Borrow | Full | Book Catalog |
| Digital Badges | Full | Full | Full (Class) | View | Personal Badges |
| Google Workspace Hub | Full | Full | None | None | None |
| User Accounts | Full | View | None | None | None |
