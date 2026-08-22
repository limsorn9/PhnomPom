# ARCHITECTURAL & PRODUCT DECISIONS LOG

### Decision 001: GitHub is the Permanent Source of Truth
- **Date:** 2026-08-22
- **Context:** AI Studio accounts, chat sessions, or agent instances may change or reach usage limits.
- **Decision:** All project knowledge, requirements, specifications, and handoff notes must reside inside the `.ai/` directory within the Git repository.
- **Consequences:** Any AI assistant or human developer can pick up immediately from `.ai/HANDOFF.md` without loss of context.

---

### Decision 002: Teacher-in-Charge Workspace is a First-Class System Module
- **Date:** 2026-08-22
- **Context:** The legacy primary school operational workflow relies heavily on the Teacher-in-Charge (គ្រូបន្ទុកថ្នាក់) managing attendance, multi-competency scoring, at-risk remedial tracking, lesson planning, parent committee coordination, and daily shift logs.
- **Decision:** Provide a dedicated, tabbed `HomeroomTeacherDashboard` with 8 specialized sub-modules specifically mapped from the operational Excel workbook (`Pri_Sco`, `Sco_M`, `Rank`, `F_Book`, `Review_Class`, `Class_Com`, `Action_Plan`).
- **Consequences:** Teachers have an integrated, purpose-built workspace instead of fragmented forms.

---

### Decision 003: In-Memory OAuth Token Isolation for Google Workspace
- **Date:** 2026-08-22
- **Context:** Security mandates require that OAuth tokens are never leaked or persisted in browser local storage.
- **Decision:** Google OAuth Access Tokens are stored solely in memory (`cachedAccessToken` in `googleAuth.ts`) and cleared on logout or page refresh.
- **Consequences:** Complies with highest security standards while maintaining seamless single-session Google Drive/Sheets/Calendar/Gmail synchronization.

---

### Decision 004: Dual Khmer-First Scoring & Grade Conversion Engine
- **Date:** 2026-08-22
- **Context:** Cambodian primary schools use both qualitative honor rankings (ល្អណាស់, ល្អ, ល្អបង្គួរ, មធ្យម, ខ្សោយ) and standard letter grades (A, B, C, D, E, F).
- **Decision:** `SchoolContext` supports both scoring paradigms with automated rank calculations, pass/fail thresholds (average >= 5.0), and letter grade assignment.
- **Consequences:** Fully backward and forward compatible with official MoEYS assessment directives.
