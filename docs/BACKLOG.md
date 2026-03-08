# Backlog — BACKLOG.md

> CPIS — Corintek Project Information System

**Purpose:** Detailed specs for upcoming features.  
**Usage:** Reference with `@BACKLOG.md` when implementing specific scope IDs.

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

## PARAM-CAT-01 — Parameter Limit Profile Refactor

**Source:** ROADMAP.md v0.2.0  
**Priority:** 🚨 P0 (Critical)  
**Status:** ✅ Complete

### Background

Current implementation stores global limits directly on `Parameter` model. FSD Section 7.1 requires reusable limit categories (profiles) that can be assigned per-project.

### Schema Changes (COMPLETED)

- [x] Renamed `ParameterLimitCategory` → `ParameterLimitProfile` (clearer naming)
- [x] Renamed table `parameter_limit_categories` → `parameter_limit_profiles`
- [x] Removed `minValue`, `maxValue`, `rawWaterMinValue`, `rawWaterMaxValue` from `Parameter` model
- [x] All limits now stored in `ParameterLimit` table linked to `ParameterLimitProfile`
- [x] Added `parameterLimitProfileId` to `Project` schema

### Implementation Complete

- [x] Run `npm run prisma:migrate` to apply schema to database
- [x] Fix TypeScript build errors in all affected files
- [x] Recreate tabs UI for Parameters page:
  - Tab 1: Parameter List
  - Tab 2: Limit Defaults (per-parameter master defaults)
  - Tab 3: Profiles (profile management with tabs)
- [x] Profile dialog with tabs (Info | Limits):
  - Info tab: Edit profile metadata (name, description, isDefault)
  - Limits tab: Manage per-parameter limits for this profile
  - "Batas" button in table opens dialog directly to Limits tab
- [x] "Salin dari Master" button to seed limits from master defaults
- [x] Grouped by category with accordion (mobile-friendly)
- [x] Tested: Existing projects continue to work with profile system

### Acceptance Criteria

- [x] All existing projects continue to work after migration
- [x] New "Standard" profile created as default
- [x] Project form includes profile selection dropdown
- [x] Log sheets resolve limits from assigned profile (or override)

---

## QA — Browser UI Tests (MP-01, CP-01)

**Source:** ROADMAP.md v0.2.0  
**Priority:** 🟢 P1  
**Status:** ✅ Complete

### My Profile (MP-01) Test Cases

- [x] Avatar upload displays preview before save
- [x] Form submission updates user profile
- [x] Role-based fields hidden for CLIENT users
- [x] Validation errors show inline (not toast)

### Client Portal (CP-01) Test Cases

- [x] CLIENT user sees only assigned projects in dashboard
- [x] CLIENT user cannot access admin routes (URL guessing returns 403/redirect)
- [x] CLIENT user has read-only access (no edit buttons on Log Sheets)
- [x] Navigation shows only permitted items

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

## CLIENT-FIELDS — Client Data Completeness

**Source:** ROADMAP.md v0.2.0 | FSD Form Data Klien  
**Priority:** 🟢 P3  
**Status:** ✅ Completed

### Tasks

- [x] Add `website` field to `Client` schema
- [x] Update Client form UI with website input
- [x] Update Client list columns to show website

---

## USER-FIELDS — User Data Completeness

**Source:** ROADMAP.md v0.2.0 | FSD Form User  
**Priority:** 🟢 P3  
**Status:** ✅ Completed

### Tasks

- [x] Add `company` field to `User` schema (for client accounts) — Using linked Client name via `clientId`
- [x] Add `address` field to `User` schema
- [x] Update User form UI
- [x] Update User list columns

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

# Critical Gap Analysis — From `docs/CRITICAL_GAP_ANALYSIS.md`

## CG-01 — DataTable Global Search

**Priority:** 🚨 P0 (Critical)  
**Status:** ✅ Completed

**Problem:** DataTable has sorting + pagination only. Zero search/filter. Users must scroll to find records.
**Impact:** Critical — tables become unusable as data grows
**Effort:** Low (2-4 hrs)

### Tasks

- [x] Add `getFilteredRowModel()` to DataTable
- [x] Add global search `<Input>` to DataTable toolbar
- [x] Create `useDebouncedValue` hook (see CG-06)
- [x] Create `useDataTableSearch` hook
- [x] Add fuzzy matching with Levenshtein distance
- [x] Add search result ranking
- [x] Add `HighlightText` component with custom renderers

---

## CG-02 — Server-Side Pagination

**Priority:** 🟡 P1  
**Status:** ✅ Completed

**Problem:** All list queries use `findMany()` without `take`/`skip`. Entire datasets loaded into memory.
**Impact:** High — will degrade with 40 users generating daily records
**Effort:** Medium (8-12 hrs)

### Tasks

- [x] Core pagination types (`IPaginationParams`, `IPaginatedResponse`)
- [x] Pagination helpers (`calculateOffset`, `buildPaginationMeta`)
- [x] Error classes (`InvalidPaginationError`, `PageOutOfBoundsError`)
- [x] React hooks (`useServerPagination`, `usePaginatedData`)
- [x] Service layer with DI (`AttendanceService`, `LogSheetService`, `WorkReportService`)
- [x] Actions with pagination (`getAttendanceListPaginatedAction`, etc.)
- [x] DataTable server pagination support (`serverPagination` prop)
- [x] DI container for clean dependency management
- [x] Resilience patterns (retry, circuit breaker, rate limiter)
- [x] Observability (structured logging)
- [x] Comprehensive test coverage (100+ tests)

---

## CG-03 — Loading & Error Boundaries

**Priority:** 🚨 P0 (Critical)  
**Status:** ✅ Completed

**Problem:** Zero `loading.tsx` or `error.tsx` files. Users see blank screens and unhandled crashes.
**Impact:** High — terrible UX, no error recovery
**Effort:** Low (2-3 hrs)

### Tasks

- [x] Create shared `Loading` component (spinner/skeleton)
- [x] Create shared `ErrorBoundary` component
- [x] Create `ErrorHandlerService` class
- [x] Add `loading.tsx` to (main) route group
- [x] Add `error.tsx` to (main) route group

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

## CG-05 — Next.js Data Caching

**Priority:** 🟢 P2  
**Status:** Not Started

**Problem:** No `unstable_cache`, `cacheTag`, or `revalidateTag`. Every page load hits DB fresh.
**Impact:** Medium — wasteful; matters if client portal scales
**Effort:** Medium (4-6 hrs)

### Tasks

- [ ] Add `unstable_cache` to read-heavy services (dashboard, parameters, clients)
- [ ] Add `revalidateTag` to mutation actions

---

## CG-06 — useDebouncedValue Hook

**Priority:** 🟡 P1  
**Status:** ✅ Completed

**Problem:** No debounce anywhere. Search inputs need debouncing to prevent excessive re-renders.
**Impact:** Medium — coupled to CG-01
**Effort:** Low (~1 hr)

### Tasks

- [x] Create `useDebouncedValue` hook in `hooks/use-debounced-value.ts`
- [x] Use in CG-01 (DataTable search)

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
