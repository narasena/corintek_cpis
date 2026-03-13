# Backlog — BACKLOG.md

> CPIS — Corintek Project Information System

**Purpose:** Detailed specs for upcoming features.  
**Usage:** Reference with `@BACKLOG.md` when implementing specific scope IDs.

---

## 🚨 ACTIVE BUGS (Stabilization Phase)

> **Bug registry has been moved to a dedicated file.**  
> See [`docs/bugs.md`](./bugs.md) for all 48 bugs — organized by priority, module, and root cause.  
> All items from this section have been migrated, reworded, and supplemented with source-scan findings.

**Quick summary:**

- 🔴 **P0 Blocker (3):** Signature state loss · CLIENT_PIC RBAC mismatch · Work report photos not persisted
- 🟠 **P1 High (14):** Missing loading states · No duplicate logsheet guard · PIC approval workflow · Photo upload security gap
- 🟡 **P2 Medium (17):** Scroll-increment inputs · Laggy notes · UI layout issues · Dialog styling
- 🔵 **P3 Low (5):** Machine ownership default · Unused settings button · Client Technician role clarity

---

## SHIP-READY-001 — Feature Build Freeze Declaration

**Source:** Delivery Readiness Review (2026-03-07)  
**Priority:** 🚨 P0 (Governance)  
**Status:** ✅ Active

### Decision

CPIS is considered feature-complete for current delivery scope. Net-new feature building is paused.
All non-complete items below are treated as parked backlog until the reopen conditions are met.

### Allowed Work (Until Handover Closeout)

- [x] Stabilization and bug fixes for production risks (P1/P2)
- [x] Operational readiness artifacts (incident/release/rollback/access/change logs)
- [x] Verification evidence (lint/test/build, smoke checks, release notes)
- [x] Documentation alignment for handover and maintenance boundaries

### Not Allowed in This Phase

- [ ] New feature tracks outside approved stabilization scope
- [ ] Architecture expansion not required for incident prevention or handover
- [ ] Nice-to-have UX enhancements without operational impact

### Reopen Feature Development Only If

- [ ] Handover checklist is complete and signed off
- [ ] 30-day post-handover support review is finished
- [ ] New scope is approved as separate maintenance/addendum work

---

## DB-01 — Dashboard Recent Activity

**Source:** ROADMAP.md v0.2.0 | FSD Section 1  
**Priority:** 🟡 P1  
**Status:** Not Started

### Tasks

- [ ] Create activity feed component (`dashboard/components/activity-feed.tsx`)
- [ ] Query recent log sheets, work reports, approvals (last 7 days)
- [ ] Display timestamped activity list with icons
- [ ] Filter by project scope for non-admin roles (SUPERVISOR/TECHNICIAN/CLIENT)

---

## SR-02 — Summary Report Analytics

**Source:** ROADMAP.md v0.2.0 | FSD Section D  
**Priority:** 🟡 P1  
**Status:** Not Started

### Tasks

- [ ] Aggregate water quality data (avg/min/max per parameter per month)
- [ ] Aggregate condenser approach data (avg/min/max per unit per month)
- [ ] Create data access patterns in `summary-reports/analytics-service.ts`
- [ ] Display analytics in summary report print view

---

## LS-ADJ — Log Sheet Adjustments

**Source:** ROADMAP.md v0.2.0 | FSD Section 3  
**Priority:** 🟡 P2  
**Status:** Not Started

### Tasks

- [ ] Optional video attachment upload (before/after sections)
- [ ] Verify final A4 print fit for all log sheet variants
- [ ] Inline min/max limit warnings (lightweight form validation)
- [ ] Mandatory fields mapping review vs FSD (unit selection, notes)

---

## CG-04 — DataTable Column Filters

**Priority:** 🟡 P1  
**Status:** Not Started

**Problem:** No per-column filtering (Status, Role, Date). Standard expectation for internal tools.
**Impact:** Medium-High
**Effort:** Low-Medium (4-6 hrs)

### Tasks

- [ ] Add `getFilteredRowModel()` to DataTable
- [ ] Add filter UI per column (dropdown for enums, date picker for dates)
- [ ] Priority columns: Project Status, User Role, Attendance Date

---

## PRJ-FIELDS-02 — Work Types Multi-select

**Source:** ROADMAP.md v0.2.0 | FSD Form Project  
**Priority:** 🟢 P3  
**Status:** Not Started

### Tasks

- [ ] Evaluate operational requirement for multi-select (vs current single-select)
- [ ] If needed: Create `ProjectWorkType` junction table
- [ ] Update Project form with multi-select UI (checkboxes or multi-select dropdown)

---

## VIDEO-GEN-01 — Playwright Client Video Generator

**Source:** Client Request for App Demonstration
**Priority:** 🟡 P1
**Status:** Not Started

### Background

The client requested videos of the screen recording various scenarios (e.g., adding logsheets, checking summary reports, settings). We will automate these recordings using Playwright tests configured with `slowMo` to make the interactions human-readable.

### Tasks

- [ ] Create `playwright.video.config.ts` isolated from standard CI tests with `video: 'on'` and `slowMo: 800`.
- [ ] Create scenario script `01-admin-setup.spec.ts` for Admin CRUD and Project Creation flows.
- [ ] Create scenario script `02-technician-logsheet.spec.ts` for Technician Logsheet flows.
- [ ] Create scenario script `03-client-portal.spec.ts` for Client dashboard/report viewing flows.
- [ ] Add NPM script `record:videos` to run the new video suite.

---

## UI-UX-AUDIT — User Interface Improvements

> **Source:** UI/UX Audit Report (2026-03-14) — see `docs/UI_AUDIT.md` for full details

---

### UI-UX-001: Work Reports Page Header Misalignment

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** Header layout breaks on mobile—back button and heading share row with create dialog button, causing overflow/squishing on small screens.

**Impact:** Core workflow broken for mobile users (primary target: field technicians on Android)

**Effort:** Low (2 hrs)

### Tasks

- [ ] Refactor header in `work-report-page-client.tsx` to use responsive flex layout
- [ ] Add `flex-wrap` or `flex-col md:flex-row` for mobile/desktop breakpoints
- [ ] Test on mobile viewport (375px width)

---

### UI-UX-002: Incomplete Mobile Navigation Coverage

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** MobileNav only exposes 4 menu items (Home, Projects, Log Sheets, Absensi). Critical features like Work Reports, Lab Analyses, Reports are not accessible on mobile.

**Impact:** Mobile-first mandate violated—technicians cannot complete full workflow on primary device

**Effort:** Medium (4 hrs)

### Tasks

- [ ] Expand MobileNav with Work Reports, Lab Analyses, Reports (top 8 menu items)
- [ ] Implement expandable "More" menu for secondary features
- [ ] Test navigation flow on Android device/emulator

---

### UI-UX-003: Accessibility — Focus Management & Color Contrast

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** Focus indicators inconsistent; color contrast may not meet WCAG 4.5:1 on header, status badges, and muted text.

**Impact:** Keyboard users cannot track focus; visually impaired users cannot read content; compliance risk

**Effort:** Medium (5 hrs)

### Tasks

- [ ] Add `focus-visible:ring-2 focus-visible:ring-primary` to all interactive elements
- [ ] Audit all color combinations with axe-core or WAVE
- [ ] Fix contrast on header gradient, status badges, muted text
- [ ] Test with screen reader (NVDA/VoiceOver)

---

### UI-UX-004: Visual Inconsistency — Typography & Spacing

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Heading sizes and spacing vary across pages (text-3xl vs text-2xl, space-y-8 vs space-y-6).

**Impact:** User disorientation; maintenance burden; unprofessional appearance

**Effort:** Medium (4 hrs)

### Tasks

- [ ] Create design tokens in `src/lib/design-tokens.ts`
- [ ] Apply consistent typography and spacing across all pages
- [ ] Document in DESIGN_SYSTEM.md

---

### UI-UX-005: Loading States — Inconsistent Skeleton Usage

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Loading states vary—some use full skeleton, others use simple spinner. Skeletons don't match content layout.

**Impact:** Reduced perceived performance; unprofessional feel

**Effort:** Low (3 hrs)

### Tasks

- [ ] Create reusable skeleton components (SkeletonCard, SkeletonTable)
- [ ] Apply consistently across all pages
- [ ] Match skeleton structure to actual content

---

### UI-UX-006: Error Handling — Non-Informative Messages

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Error messages are generic ("Gagal mengambil data") with no resolution guidance.

**Impact:** User frustration; increased support tickets; trust erosion

**Effort:** Low (3 hrs)

### Tasks

- [ ] Categorize errors (network, validation, permission, server)
- [ ] Create localized error message templates
- [ ] Add retry buttons for transient errors

---

### UI-UX-007: DataTable Performance — No Virtualization

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Reports page loads all global log sheets without virtualization—thousands of DOM nodes freeze mobile devices.

**Impact:** Severe performance degradation on low-end Android; scalability blocker

**Effort:** Medium (6 hrs)

### Tasks

- [ ] Install `@tanstack/react-virtual`
- [ ] Implement virtual scrolling for DataTable
- [ ] Add pagination fallback
- [ ] Test on low-end device emulator (512MB RAM)

---

### UI-UX-008: Login Page — Mixed Language

**Priority:** 🟡 P2 (Minor)  
**Status:** Not Started

**Problem:** Login form uses mixed English ("Sign in") and Indonesian (toast messages).

**Impact:** Inconsistent localization; unprofessional appearance

**Effort:** Trivial (1 hr)

### Tasks

- [ ] Change "Sign in" to "Masuk" in login-form.tsx
- [ ] Update description to Indonesian

---

### UI-UX-009: Parameter Page — Tab Crowding

**Priority:** 🟡 P2 (Minor)  
**Status:** Not Started

**Problem:** Parameters page has 3 tabs with unrelated content—Limits + Profiles (related) mixed with Parameter CRUD (unrelated).

**Impact:** Information architecture confusion

**Effort:** Low (2 hrs)

### Tasks

- [ ] Restructure tabs: combine "Batas Default" + "Profil" into "Limit Profiles"
- [ ] Move Parameter CRUD to separate section or page

---

### UI-UX-010: Summary Reports — File Input UX

**Priority:** 🟡 P2 (Minor)  
**Status:** Not Started

**Problem:** File upload inputs use default browser styling with no preview/validation.

**Impact:** User uncertainty; error-prone; poor UX

**Effort:** Medium (4 hrs)

### Tasks

- [ ] Create custom file upload component with drag-drop
- [ ] Add file type/size validation with feedback
- [ ] Show selected file with remove button

---

### UI-UX-011: Attendance — Three Different Views

**Priority:** 🟡 P2 (Minor)  
**Status:** Not Started

**Problem:** Attendance page has 3 duplicated role-specific views with different implementations.

**Impact:** Code duplication; maintenance burden; inconsistent UX

**Effort:** Medium (5 hrs)

### Tasks

- [ ] Create unified attendance table component
- [ ] Add role-based conditional action buttons
- [ ] Consolidate duplicate code

---

## UI-UX-AUDIT-2024 — Second Opinion Findings

> **Source:** Second Opinion UI/UX Audit (2026-03-14) — Senior Product Designer Review  
> **Note:** These findings complement the initial audit above. See `docs/UI_AUDIT.md` for full details.

---

### UX-201: Missing Design System Foundation

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** No centralized design tokens. Typography, spacing, colors use ad-hoc values (12+ h1 sizes, 92 gap variations).

**Why It Matters:** Root cause of 60% of UX issues — without tokens, inconsistency ripples across all modules. Developer friction and maintenance nightmare.

**Effort:** Medium (4 hrs)

### Tasks

- [ ] Create `src/lib/design-tokens.ts` with typography, spacing, colors, animation tokens
- [ ] Define semantic tokens: `typography.h1`, `spacing.section`, `layout.cardPadding`
- [ ] Apply tokens across high-traffic pages (Dashboard, Log Sheets, Work Reports)
- [ ] Document in `docs/DESIGN_SYSTEM.md`

---

### UX-202: Work Reports Header Layout Broken on Mobile

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** Header in `work-report-page-client.tsx` uses single-row flex that breaks on 375px viewport — text truncated, button squished.

**Why It Matters:** Target users are field technicians on Android phones. Core workflow (Work Reports) used daily becomes unusable on mobile.

**Effort:** Low (2 hrs)

### Tasks

- [ ] Refactor to `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
- [ ] Use ChevronLeft icon for back button
- [ ] Test on iPhone SE (375px) viewport

---

### UX-203: Mobile Navigation — 70% of Features Hidden

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** MobileNav only exposes 4 menu items (Home, Projects, Log Sheets, Absensi). Missing Work Reports, Lab Analyses, Reports, Summary Reports, Users, Clients, Chemicals, Parameters.

**Why It Matters:** Mobile-first mandate violated. Technicians must switch to desktop to access 70% of features. ~10-15 min/day productivity loss.

**Effort:** Medium (6 hrs)

### Tasks

- [ ] Refactor MobileNav to consume `NAV_CONFIG` from `lib/constants/navigation.ts`
- [ ] Expand to 8 items: Home, Log Sheets, Absensi, Work Reports, Lab Analyses, Reports, Summary, More
- [ ] Use Sheet/hamburger menu for secondary features
- [ ] Test navigation flow on Android device/emulator

---

### UX-204: Accessibility — Systematic WCAG Violations

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** Focus indicators inconsistent (25 instances). Color contrast failures: status badges (3.2:1), muted text (2.9:1). No dark mode.

**Why It Matters:** WCAG 2.1 Level AA compliance. Visual impaired users cannot read content. Keyboard navigation broken.

**Effort:** Medium (5 hrs)

### Tasks

- [ ] Add global focus styles: `focus-visible:ring-2 focus-visible:ring-primary ring-offset-2`
- [ ] Fix status badge contrast: `bg-gray-200 text-gray-900` (12:1)
- [ ] Replace muted text: `text-slate-600` (6.1:1)
- [ ] Implement `prefers-color-scheme` detection + dark mode toggle
- [ ] Test with axe DevTools and NVDA/VoiceOver

---

### UX-205: Loading States — Inconsistent Skeleton Usage

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** Loading states vary — some use skeleton, some spinner, some none. Reports page has jarring content pop-in.

**Why It Matters:** Perceived performance 30% slower with spinners. CLS penalty. Mobile users wait 2-5 seconds on 3G.

**Effort:** Low (3 hrs)

### Tasks

- [ ] Activate skeleton variants in `app/(main)/loading.tsx`
- [ ] Create page-specific skeletons: `TableSkeleton`, `CardSkeleton`
- [ ] Add `isLoading` prop to DataTable component
- [ ] Replace all spinners with skeletons

---

### UX-206: Safe Area Insets Not Implemented

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** Mobile bottom nav doesn't account for iOS safe area — hidden behind Dynamic Island/home indicator on iPhone 14/15.

**Why It Matters:** iOS users cannot tap bottom nav items reliably. Gesture conflicts with swipe-up.

**Effort:** Low (3 hrs)

### Tasks

- [ ] Configure Tailwind for safe area: `padding-bottom: env(safe-area-inset-bottom)`
- [ ] Add viewport meta: `viewport-fit=cover`
- [ ] Test on iPhone 14 Pro, iPhone 15, Android gesture nav

---

### UX-207: Touch Target Failures (Below 44px)

**Priority:** 🔴 P0 (Critical)  
**Status:** Not Started

**Problem:** Mobile nav icons (20px), table action buttons (32px), close dialog X (16px) — all below 44px minimum.

**Why It Matters:** Apple HIG requires 44x44pt. Field technicians with gloves/dirty hands need larger targets. 30% error rate on small targets.

**Effort:** Medium (4 hrs)

### Tasks

- [ ] Increase mobile nav icons: `h-6 w-6` minimum
- [ ] Add `min-w-[44px] min-h-[44px]` to all clickable elements
- [ ] Use invisible padding for small icons
- [ ] Create touch target debugger for dev mode

---

### UX-208: Print Layout Lacks Brand Identity

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Print pages have no Corintek branding/logo, no client branding, generic table styles.

**Why It Matters:** Professional perception — clients receive printed reports. Legal compliance for official documents.

**Effort:** Medium (4 hrs)

### Tasks

- [ ] Create `<PrintHeader>` component with Corintek logo + address
- [ ] Include client logo from `project.client.logoUrl`
- [ ] Add footer with page numbers, print date, signature lines

---

### UX-209: Error Messages Don't Guide Users

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Generic error toasts ("Gagal mengambil data") without resolution guidance, retry buttons, or admin contact info.

**Why It Matters:** User frustration. Support ticket increase. Trust erosion from repeated unexplained failures.

**Effort:** Low (5 hrs)

### Tasks

- [ ] Create `src/lib/toast-helpers.ts` with categorized templates (network, validation, permission, server)
- [ ] Add retry buttons for network errors
- [ ] Add field highlighting for validation errors
- [ ] Add contact admin guidance for permission errors

---

### UX-210: No Responsive Image Strategy

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Photos uploaded at 2-5MB, displayed at 200x200px. No lazy loading, srcSet, or responsive sizes.

**Why It Matters:** Mobile data — 10 photos = 50MB on 3G = 2-3 min wait. Perceived performance slow. User frustration with limited data plans.

**Effort:** Medium (8 hrs)

### Tasks

- [ ] Add Next.js `<Image>` with `sizes`, `loading="lazy"`, `placeholder="blur"`
- [ ] Generate R2 image variants: small (400x300), medium (800x600), large (1600x1200)
- [ ] Implement progressive loading with low-quality placeholder

---

### UX-211: Typography Hierarchy Fails Scannability

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Headings use only size differentiation. No weight/color variation. Body text and metadata same styling.

**Why It Matters:** Users cannot identify page structure at a glance. Must read linearly — increases cognitive load.

**Effort:** Medium (4 hrs)

### Tasks

- [ ] Apply typography tokens with weight variation (h1: bold, h2: semibold, h3: medium)
- [ ] Add visual separators: `<Separator />` between sections
- [ ] Use overline pattern for section labels
- [ ] Implement scannable hierarchy

---

### UX-212: Animation Timing Inconsistency

**Priority:** 🟡 P2 (Minor)  
**Status:** Not Started

**Problem:** Animation durations vary (75ms, 150ms, 200ms, 300ms, 500ms) without design rationale.

**Why It Matters:** Perceptual incoherence — users subconsciously notice timing inconsistencies. Motion sickness risk on rapid interactions.

**Effort:** Medium (3 hrs)

### Tasks

- [ ] Create animation tokens: `animation.fast` (150ms), `animation.normal` (200ms), `animation.slow` (300ms)
- [ ] Standardize component transitions
- [ ] Add `prefers-reduced-motion` support

---

### UX-213: Form Validation Feedback Timing

**Priority:** 🟡 P2 (Minor)  
**Status:** Not Started

**Problem:** Forms validate on submit only, not during typing. Users don't see errors until after clicking submit.

**Why It Matters:** Slower feedback loop. More submit-retry cycles. Mobile users suffer keyboard dismissal/reopen cycles.

**Effort:** Low (3 hrs)

### Tasks

- [ ] Change react-hook-form mode: `mode: 'onTouched'`, `reValidateMode: 'onChange'`
- [ ] Create `useSmartForm` hook with optimal validation settings

---

### UX-214: No Loading States on Form Submit

**Priority:** 🟡 P2 (Minor)  
**Status:** Not Started

**Problem:** Forms don't disable inputs during submission. Double-submit possible. No visual feedback that submission is processing.

**Why It Matters:** Data integrity risk. User confusion. Can submit duplicate records.

**Effort:** Low (2 hrs)

### Tasks

- [ ] Add loading overlay during form submission
- [ ] Disable all form inputs when `isSubmitting: true`
- [ ] Show loading spinner in submit button

---

### UX-215: Chart Accessibility — No Screen Reader Support

**Priority:** 🟠 P1 (Major)  
**Status:** Not Started

**Problem:** Analytics charts have no ARIA labels, no data table alternative. Screen readers cannot describe chart content.

**Why It Matters:** WCAG 2.1 Level AA requirement. Legal compliance. Supervisors with visual impairments excluded.

**Effort:** Medium (5 hrs)

### Tasks

- [ ] Add `role="img"` with `aria-label` and `aria-describedby` to charts
- [ ] Create tabbed view: "Grafik" / "Tabel" with table alternative
- [ ] Generate text description of chart data trends

---

## Summary: Combined UI/UX Audit Priority

### P0 — Must Fix Before Next Release (13 issues)

- UI-UX-001: Work Reports header (initial)
- UI-UX-002: Mobile nav coverage (initial)
- UI-UX-003: Accessibility contrast (initial)
- UX-201: Design system foundation
- UX-202: Work Reports header mobile
- UX-203: Mobile nav 70% hidden
- UX-204: WCAG violations
- UX-205: Loading states inconsistency
- UX-206: Safe area insets
- UX-207: Touch targets below 44px
- UX-208: Print branding
- UX-209: Error message templates
- UX-210: Image optimization

### P1 — Next Sprint (6 issues)

- UI-UX-004: Typography/spacing inconsistency
- UI-UX-005: Skeleton usage
- UI-UX-006: Error handling
- UI-UX-007: DataTable virtualization
- UX-211: Typography hierarchy
- UX-215: Chart accessibility

### P2 — Backlog (8 issues)

- UI-UX-008: Login language
- UI-UX-009: Parameters tabs
- UI-UX-010: File input UX
- UI-UX-011: Attendance views
- UX-212: Animation timing
- UX-213: Form validation timing
- UX-214: Form loading states
- UX-216: Hover states (inconsistency)

### P3 — Nice to Have (3 issues)

- UI-UX-012: Dashboard decoration
- UI-UX-013: Keyboard shortcuts
- UI-UX-014: Micro-interactions
- UI-UX-015: Dark mode consideration

---

> **End of Second Opinion Audit Findings**
