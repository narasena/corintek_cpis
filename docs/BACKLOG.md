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
