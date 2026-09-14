# Graph Report - Pendaftaran  (2026-09-11)

## Corpus Check
- 112 files · ~186,768 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 638 nodes · 1425 edges · 42 communities (36 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `979f3d88`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RegistrationPage.tsx
- App.tsx
- cn
- HomePage.tsx
- Sistem Penerimaan Murid Baru (SPMB)
- dependencies
- devDependencies
- compilerOptions
- Appendix B - Canonical Sources (read these before reinventing)
- Major
- registrationSchema.ts
- spmb.ts
- AdminStudentDetailPage.tsx
- 🎓 SPMB Online — Sistem Penerimaan Murid Baru Terpadu
- components.json
- School
- 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)
- 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)
- tasteskill: Anti-Slop Frontend Skill
- compilerOptions
- Footer.tsx
- 9. AI TELLS (Forbidden Patterns)
- 11. REDESIGN PROTOCOL
- 3. DEFAULT ARCHITECTURE & CONVENTIONS
- 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS
- AdminLayout.tsx
- 0. BRIEF INFERENCE (Read the Room Before Anything Else)
- 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)
- 5. CONTEXT-AWARE PROACTIVITY
- 8. DARK MODE PROTOCOL
- 7. DIAL DEFINITIONS (Technical Reference)
- vite-env.d.ts
- vercel.json
- rules/graphify.md
- workflows/graphify.md
- ErrorBoundary
- authConfig.ts
- AdminSelectionPage.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 64 edges
2. `Button` - 39 edges
3. `Major` - 32 edges
4. `useLanguage()` - 29 edges
5. `School` - 21 edges
6. `StudentCompleteDetail` - 20 edges
7. `formatDate()` - 19 edges
8. `isSupabaseConfigured()` - 18 edges
9. `formatScore()` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `HeroSectionProps` --references--> `School`  [EXTRACTED]
  src/components/home/HeroSection.tsx → src/types/spmb.ts
- `AdminLayout()` --calls--> `useTheme()`  [EXTRACTED]
  src/components/admin/AdminLayout.tsx → src/context/ThemeContext.tsx
- `AdminSecretLoginModal()` --calls--> `isSupabaseConfigured()`  [EXTRACTED]
  src/components/admin/AdminSecretLoginModal.tsx → src/lib/supabase.ts
- `Props` --references--> `Major`  [EXTRACTED]
  src/components/admin/StudentDetail/MajorChoicesTab.tsx → src/types/spmb.ts
- `Props` --references--> `Major`  [EXTRACTED]
  src/components/admin/StudentTable.tsx → src/types/spmb.ts

## Import Cycles
- None detected.

## Communities (42 total, 6 thin omitted)

### Community 0 - "RegistrationPage.tsx"
Cohesion: 0.15
Nodes (31): AdminSecretLoginModalProps, StatusResultCard(), Alert, AlertDescription, AlertTitle, alertVariants, Badge(), BadgeProps (+23 more)

### Community 1 - "App.tsx"
Cohesion: 0.10
Nodes (16): AdminAnnouncementsPage, AdminDashboardPage, AdminMajorsPage, AdminSettingsPage, AdminSourceSchoolsPage, AdminStudentsPage, AnnouncementDetailPage, AnnouncementListPage (+8 more)

### Community 2 - "cn"
Cohesion: 0.08
Nodes (33): CardFooter, DialogDescription(), DialogFooter(), DialogHeader(), DialogProps, DialogTitle(), DropdownMenu(), DropdownMenuItem() (+25 more)

### Community 3 - "HomePage.tsx"
Cohesion: 0.11
Nodes (26): FAQSection(), AboutSection(), AdmissionRequirementsSection(), AdmissionScheduleSection(), AnnouncementsSection(), AnnouncementsSectionProps, FeatureBand(), HIGHLIGHTS_EN (+18 more)

### Community 4 - "Sistem Penerimaan Murid Baru (SPMB)"
Cohesion: 0.05
Nodes (40): 10. Non-Functional Requirements, 11. Asumsi & Keterbatasan, 12. Risiko, 1. Ringkasan Eksekutif / Executive Summary, 2. Latar Belakang / Background, 3. Tujuan Produk / Product Goals, 4.1 Calon Siswa (Public User), 4.2 Admin / Operator Sekolah (+32 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (35): class-variance-authority, clsx, html2canvas, jsbarcode, jspdf, lucide-react, dependencies, class-variance-authority (+27 more)

### Community 6 - "devDependencies"
Cohesion: 0.06
Nodes (31): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/jsbarcode, @types/node, @types/qrcode (+23 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules (+16 more)

### Community 8 - "Appendix B - Canonical Sources (read these before reinventing)"
Cohesion: 0.09
Nodes (21): APPENDICES - Real Source-Backed Reference Material, Appendix A - Install Commands per Design System, Appendix B - Canonical Sources (read these before reinventing), Appendix C - Apple Liquid Glass: Honest Web Approximation, Apple Liquid Glass (Apple platforms only), Atlassian, Bootstrap, Carbon (+13 more)

### Community 9 - "Major"
Cohesion: 0.20
Nodes (14): MajorsSectionProps, RankingSection(), LeaderboardTable(), LeaderboardTableProps, MajorTabs(), MajorTabsProps, SearchMyRank(), SearchMyRankProps (+6 more)

### Community 10 - "registrationSchema.ts"
Cohesion: 0.13
Nodes (14): achievementItemSchema, AgreementInput, agreementSchema, DocumentsInput, documentsSchema, MajorChoiceInput, majorChoiceSchema, ParentDataInput (+6 more)

### Community 11 - "spmb.ts"
Cohesion: 0.07
Nodes (44): AuthContext, AuthContextType, AuthProvider(), RegistrationStatusResult, AsyncLock, mockStoreLock, getStoragePublicUrl(), isSupabaseConfigured() (+36 more)

### Community 12 - "AdminStudentDetailPage.tsx"
Cohesion: 0.12
Nodes (28): AdminStudentDetailPage, SelectionPanel(), MajorChoicesTab(), Props, Props, StudentTable(), Props, Progress (+20 more)

### Community 13 - "🎓 SPMB Online — Sistem Penerimaan Murid Baru Terpadu"
Cohesion: 0.11
Nodes (17): 1. Prasyarat, 2. Clone / Buka Repository, 3. Instalasi Dependensi, 4. Konfigurasi Variabel Lingkungan (`.env`), 5. Jalankan Server Pengembangan, 6. Build untuk Produksi, 🛠️ Arsitektur & Teknologi, ⚡ Cara Menjalankan Proyek Secara Lokal (+9 more)

### Community 14 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 15 - "School"
Cohesion: 0.24
Nodes (12): RegistrationCardPage, AboutSectionProps, Props, RegistrationCardPDF(), Props, RegistrationSuccessCard(), exportElementToPdf(), PDFExportOptions (+4 more)

### Community 16 - "4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)"
Cohesion: 0.17
Nodes (12): 4.10 Quotes & Testimonials, 4.11 Page Theme Lock (Light / Dark Mode Consistency), 4.1 Typography, 4.2 Color Calibration, 4.3 Layout Diversification, 4.4 Materiality, Shadows, Cards, 4.5 Interactive UI States, 4.6 Data & Form Patterns (+4 more)

### Community 17 - "10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)"
Cohesion: 0.20
Nodes (10): 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know), Animation Library Choice, Cards & Containers, Galleries & Media, Hero Paradigms, Layout & Grids, Micro-Interactions & Effects, Navigation & Menus (+2 more)

### Community 18 - "tasteskill: Anti-Slop Frontend Skill"
Cohesion: 0.20
Nodes (10): 13. OUT OF SCOPE, 14. FINAL PRE-FLIGHT CHECK, 1.A Dial Inference (design read → dial values), 1.B Use-Case Presets, 1.C How the Dials Drive Output, 1. THE THREE DIALS (Core Configuration), 2.A When to reach for a real design system (use official packages), 2.B When the brief is an aesthetic, not a system (+2 more)

### Community 19 - "compilerOptions"
Cohesion: 0.20
Nodes (9): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict (+1 more)

### Community 20 - "Footer.tsx"
Cohesion: 0.21
Nodes (9): Footer(), Navbar(), PublicLayout(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme() (+1 more)

### Community 21 - "9. AI TELLS (Forbidden Patterns)"
Cohesion: 0.25
Nodes (8): 9.A Visual & CSS, 9. AI TELLS (Forbidden Patterns), 9.B Typography, 9.C Layout & Spacing, 9.D Content & Data ("Jane Doe" Effect), 9.E External Resources & Components, 9.F Production-Test Tells (banned outright), 9.G EM-DASH BAN (the single most-violated Tell)

### Community 22 - "11. REDESIGN PROTOCOL"
Cohesion: 0.29
Nodes (7): 11.A Detect the Mode (first action), 11.B Audit Before Touching, 11.C Preservation Rules, 11.D Modernisation Levers (priority order), 11.E Decision Tree: Targeted Evolution vs Full Redesign, 11.F What Never Changes Silently, 11. REDESIGN PROTOCOL

### Community 23 - "3. DEFAULT ARCHITECTURE & CONVENTIONS"
Cohesion: 0.29
Nodes (7): 3.A Stack, 3.B State, 3.C Icons, 3.D Emoji Policy, 3. DEFAULT ARCHITECTURE & CONVENTIONS, 3.E Responsiveness & Layout Mechanics, 3.F Dependency Verification (mandatory)

### Community 24 - "6. PERFORMANCE & ACCESSIBILITY GUARDRAILS"
Cohesion: 0.29
Nodes (7): 6.A Hardware Acceleration, 6.B Reduced Motion (mandatory), 6.C Dark Mode (mandatory for any consumer-facing page), 6.D Core Web Vitals Targets, 6.E DOM Cost, 6.F Z-Index Restraint, 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

### Community 25 - "AdminLayout.tsx"
Cohesion: 0.39
Nodes (5): AdminLayout(), AdminSecretLoginModal(), ProtectedRoute(), useAuth(), LoginPage()

### Community 26 - "0. BRIEF INFERENCE (Read the Room Before Anything Else)"
Cohesion: 0.40
Nodes (5): 0.A Read these signals first, 0.B Output a one-line "Design Read" before generating, 0. BRIEF INFERENCE (Read the Room Before Anything Else), 0.C If the brief is ambiguous, ask one question, do not guess, 0.D Anti-Default Discipline

### Community 27 - "12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)"
Cohesion: 0.40
Nodes (5): 12.A File Location, 12.B Required Frontmatter, 12.C Required Body Sections, 12.D Block-Library Discipline, 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)

### Community 28 - "5. CONTEXT-AWARE PROACTIVITY"
Cohesion: 0.40
Nodes (5): 5.A Sticky-Stack - Canonical Skeleton, 5.B Horizontal-Pan - Canonical Skeleton, 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative), 5. CONTEXT-AWARE PROACTIVITY, 5.D Forbidden Animation Patterns

### Community 29 - "8. DARK MODE PROTOCOL"
Cohesion: 0.40
Nodes (5): 8.A Token Strategy (pick one, stick to it), 8.B Do Not Prescribe Specific Colors Here, 8.C Default Mode, 8.D Test in Both Modes Before Finishing, 8. DARK MODE PROTOCOL

### Community 30 - "7. DIAL DEFINITIONS (Technical Reference)"
Cohesion: 0.50
Nodes (4): 7. DIAL DEFINITIONS (Technical Reference), DESIGN_VARIANCE (Level 1-10), MOTION_INTENSITY (Level 1-10), VISUAL_DENSITY (Level 1-10)

### Community 39 - "ErrorBoundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, Props, State

## Knowledge Gaps
- **273 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+268 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `RegistrationPage.tsx`, `Major`, `AdminStudentDetailPage.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `tasteskill: Anti-Slop Frontend Skill` connect `tasteskill: Anti-Slop Frontend Skill` to `Appendix B - Canonical Sources (read these before reinventing)`, `4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)`, `10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)`, `9. AI TELLS (Forbidden Patterns)`, `11. REDESIGN PROTOCOL`, `3. DEFAULT ARCHITECTURE & CONVENTIONS`, `6. PERFORMANCE & ACCESSIBILITY GUARDRAILS`, `0. BRIEF INFERENCE (Read the Room Before Anything Else)`, `12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)`, `5. CONTEXT-AWARE PROACTIVITY`, `8. DARK MODE PROTOCOL`, `7. DIAL DEFINITIONS (Technical Reference)`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Button` connect `RegistrationPage.tsx` to `App.tsx`, `cn`, `HomePage.tsx`, `ErrorBoundary`, `Major`, `spmb.ts`, `AdminStudentDetailPage.tsx`, `School`, `Footer.tsx`, `AdminLayout.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _273 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.08461538461538462 - nodes in this community are weakly interconnected._
- **Should `HomePage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10975609756097561 - nodes in this community are weakly interconnected._