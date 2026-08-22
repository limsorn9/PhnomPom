# AI INSTRUCTIONS & PERMANENT OPERATING RULES
**Project:** PhnomPom — Cambodian Primary School Administration & Management Web Application
**Repository:** https://github.com/limsorn9/PhnomPom

Every future AI coding assistant, agent, or developer MUST strictly follow these rules:

---

## 1. Core Continuity Directives
1. **Never start the project from scratch**: This is an existing, evolving production system for Phnom Pom Primary School (សាលាបឋមសិក្សាភ្នំពុំ). Do NOT rewrite or scaffold a new codebase.
2. **Inspect existing code before modifying**: Always read the relevant files in `src/` and documentation in `.ai/` before making changes.
3. **Preserve working features**: Never delete, comment out, or break existing working functionality (e.g. Student Management, Homeroom Dashboard, Health & BMI, Badges & Honors, Scores & Ranking, Google Workspace Hub, Official Document Center).
4. **Avoid unnecessary rewrites**: Make targeted, modular, incremental additions. Refactor only when there is a strong architectural or performance reason.
5. **No duplicate functionality**: Reuse existing UI components (`AngkorMotif`, `UniversalPrintModal`, `BadgeIcon`, etc.) and state hooks (`useSchool`) instead of creating redundant parallel copies.
6. **Preserve database & state architecture**: Do not change database schemas or state interfaces without documenting the rationale in `.ai/DECISIONS.md` and `.ai/DATABASE.md`.
7. **No unmigrated data deletions**: Do not delete existing data keys without backward-compatible defaults in `SchoolContext.tsx` or `initialData.ts`.
8. **Test before completion**: Run `lint_applet` (`tsc --noEmit`) and `compile_applet` (`vite build`) to verify there are zero build or type errors.
9. **Update documentation after every significant milestone**: Always update `.ai/CURRENT_STATE.md`, `.ai/HANDOFF.md`, `.ai/CHANGELOG.md`, and `.ai/TASKS.md`.
10. **Handoff readiness**: Keep `HANDOFF.md` updated so any new AI agent can pick up immediately from the exact state without needing previous chat history.

---

## 2. Official Document & MoEYS Compliance Rules
1. **Never fabricate official government seals, signatures, or certifications**: Maintain a clear distinction between:
   - *Verified official forms* (forms matching Cambodian Ministry of Education, Youth and Sport (MoEYS) standards)
   - *School administrative forms* (internal administrative and operational records)
   - *System-generated reports* (statistical summaries, charts, QR cards)
   - *Custom internal forms* (classroom logbooks, intervention sheets)
2. **Never claim a document is officially approved unless verified**: Label official template mockups as administrative templates or system-generated documents.
3. **Print-first layout design**: Printable forms must use standard paper sizes (A4, Letter), clean margins, high-contrast monochrome/duotone styling, MoEYS royal headers where applicable, page breaks, and signature blocks.

---

## 3. Security & Environment Rules
1. **Never expose secrets or private keys**: Keep all API keys and secrets in environment variables on the server side or safe client config.
2. **Never commit `.env` or private credentials**: Only update `.env.example` to declare required keys.
3. **In-memory token security**: Google Workspace OAuth tokens must remain in-memory and never be dumped into unencrypted `localStorage` or `sessionStorage`.

---

## 4. Khmer-First UX & Typography Rules
1. **Khmer Unicode compliance**: Use standard Khmer Unicode fonts (`Battambang`, `Moul`, `Siemreap`, `Khmer OS Siemreap`) paired with standard numeral and Latin fonts.
2. **Bilingual localization**: Support Khmer as the default primary language, alongside English support.
3. **Clean contrast & responsive layouts**: Ensure all interactive tables, cards, and modal dialogs are fully accessible across desktop, tablet, and mobile viewports.
