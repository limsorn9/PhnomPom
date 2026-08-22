# UI & UX DESIGN SYSTEM GUIDELINES

## 1. Typography & Font Hierarchy
- **Khmer Heading Display Font:** `font-moul` (Khmer OS Moul / Moul) for official titles, certificates, royal headers, and main dashboard headers.
- **Khmer Body Text:** `font-battambang` (Battambang / Khmer OS Siemreap) with line-height 1.5–1.7 and proper baseline tracking.
- **Latin & Numerical Text:** Clear legible sans-serif for numbers, timestamps, codes, and scores (`font-times` or `font-sans`).
- **No Text Truncation in Pills or Badges**: Badges, status chips, and buttons must display unbroken text with appropriate horizontal padding (2x vertical padding).

---

## 2. Color Palette & Theming
- **Primary Institutional Blue:** `blue-900` / `blue-950` (Trustworthy, formal Cambodian educational identity).
- **Official Accent Gold/Amber:** `amber-500` / `amber-600` (Certificates, honors, Angkor decorative motifs).
- **Backgrounds:** Clean crisp neutral light slate (`bg-slate-100` / `bg-slate-50`) with high contrast containers (`bg-white`).
- **Dark Mode Support:** Respects system and user dark-mode preferences where enabled.

---

## 3. Printable Document Standards
All printable documents (`OfficialDocumentCenter`, `CertificateModal`, `UniversalPrintModal`) must obey:
1. Standard paper sizing: A4 (210mm x 297mm) or Letter, portrait or landscape.
2. Official Cambodian headers (`ព្រះរាជាណាចក្រកម្ពុជា ជាតិ សាសនា ព្រះមហាក្សត្រ` with `MoEYS` royal header format).
3. Watermarks: Light decorative motifs (`AngkorPageWatermark`).
4. Signature and stamp containers with accurate alignment for Teacher, Director, and Parents.
5. `@media print` CSS rules hiding sidebar, top header, buttons, and navigation elements.
