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
