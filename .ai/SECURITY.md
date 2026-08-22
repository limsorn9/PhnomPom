# SECURITY & PRIVACY POLICY

## 1. Secrets & Credentials Management
1. **Never commit `.env` files**: All secrets, private keys, or API tokens must be strictly isolated.
2. **Environment Variables**:
   - `GEMINI_API_KEY`: Injected securely at runtime by the platform container. Never exposed to browser scripts.
   - `APP_URL`: Automated deployment URL for OAuth callbacks and reverse proxy routing.
3. **Google Workspace OAuth Tokens**:
   - Google Access Tokens are kept exclusively in **in-memory module cache** (`cachedAccessToken` in `src/services/googleAuth.ts`).
   - Tokens are **NEVER** persisted into `localStorage`, `sessionStorage`, or cookies.
   - On page refresh or logout, in-memory tokens are immediately flushed.

---

## 2. Role-Based Access Control (RBAC)
The application strictly validates user roles before rendering sensitive views:
- `director` (នាយកសាលា): Full administration, official letter logs, budget, approvals.
- `secretary` (លេខាធិការ): Student records, transfers, certificates, correspondence.
- `teacher` (គ្រូបង្រៀន): Classroom scores, attendance, lesson plans, at-risk interventions, daily logs. Restricted to assigned grade/section for sensitive modifications.
- `librarian` (បណ្ណារក្ស): Library catalog, borrowing logs, reader achievements.
- `student` / `parent` (សិស្ស / មាតាបិតា): Read-only personal student portal, scorecards, badges, attendance summaries.

---

## 3. Data Integrity & Official Document Authenticity
1. **No Fake Official Seals or Ministry Claims**: The system generates administrative school templates clearly identified as school-level documents.
2. **Deterministic Computations**: Score totals, subject averages, rankings, and BMI calculations are strictly calculated using pure mathematical formulas, eliminating manipulation or rounding artifacts.
3. **Backup & Disaster Recovery**:
   - One-click JSON data export and import for local backups.
   - Google Drive cloud snapshot syncing.
   - Single-file standalone HTML snapshot generation for offline archiving.
