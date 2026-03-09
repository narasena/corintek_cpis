# Changelog — CHANGELOG.md

> CPIS — Corintek Project Information System

**Format:** Newest first. One section per milestone.

---

## v0.6.2 — Machine Section Layout Polish (2026-03-09)

**Branch:** `feat/ui-dialog-refinement`

### Machine List UX

- [x] **Responsive Header:** Refactored machine section sticky header to stack on mobile (`flex-col`).
- [x] **Concise Button Labels:** Shortened labels to "CT Baru", etc., to prevent overflow.
- [x] **Clipping Fixes:** Removed problematic negative margins.

---

## v0.6.1 — Uniform Widths & Floating Mobile UI (2026-03-09)

**Branch:** `feat/ui-dialog-refinement`

### UX Polish & Dialog Refinement

- [x] **Uniform Input Widths:** Standardized `SelectTrigger` to `w-full`, ensuring all dropdowns (Status, Profile, Client) align perfectly with text inputs in the project form.
- [x] **Floating Mobile Dialogs:** Implemented a modern "Floating Full Screen" design with a subtle border margin on small screens to create a layered aesthetic.
- [x] **Dual-Scroll Extension:** Refined the independent scrolling areas for metadata (5/12) and machines (7/12) with improved layout spacing.
- [x] **Code Quality:** Removed unnecessary `any` type casting in `ProjectForm`.

---

## v0.6.0 — Project Form Dual-Scroll & Themed Headers (2026-03-09)

**Branch:** `feat/ui-dialog-refinement`

### Project Form UX

- [x] **Dual-Scrollable Layout:** Implemented independent scroll areas for Project Metadata and Machine Units.
- [x] **Responsive Column Widths:** Adjusted Project Info column to `lg:col-span-5` (v0.5.1 was ~col-span-4) to prevent label overlap.
- [x] **Themed Dialog Headers:** Upgraded `CrudDialog` to support primary gradient backgrounds and high-contrast close buttons.
- [x] **Dialog Sizing:** Introduced `size="2xl"` for complex data-entry scenarios like the Project Form.

---

**Branch:** `feat/ui-ux-refinement-v2`

### Form & Dialog Refinement

- [x] **Sticky Dialog Actions:** Upgraded `CrudDialog` with a sticky bottom action bar and improved padding.
- [x] **Parameter Profile Tabs:** Refactored overwhelming list of parameter inputs into a clean Vertical Tabs layout.
- [x] **Input Modernization:** Replaced primitive checkboxes/selects with `Switch`, `Combobox`, and `DatePicker`.
- [x] **Empty State UI:** Added `DataTableEmpty` with custom illustrations/actions for Projects, Users, and Clients.
- [x] **Indonesian Localization:** Scanned and fixed all form placeholders/labels to use Indonesian language.
- [x] **Layout Grouping:** Grouped User and Client form fields into logical `Card` sections.

---

## v0.5.0 — Form UX Standards & Sticky Action Protocol (2026-03-09)

**Branch:** `feat/ui-dialog-refinement`

### Form & Dialog Refinement

- [x] **Sticky Action Footer:** Established `CrudDialog` as the source of truth for all form containers, implementing a sticky bottom action bar.
- [x] **Card-Based Sectioning:** Large forms broken into focused `Card` components (e.g., "Personal Data", "Account Access").
- [x] **Vertical Navigation for Dense Data:** High-density forms use `Tabs` with `orientation="vertical"`.
- [x] **Premium primitives:** Switched strictly to `shadcn/ui` based Switch, DatePicker, and Combobox.

---

## v0.4.1 — Real-time Dashboard Stats & Premium Header (2026-03-09)

**Branch:** `feat/ui-dialog-refinement`

### Dashboard Integration

- [x] **Dashboard Stats Integration:** Connected KPI cards to live database counts via `getAdminDashboardStats` server action.
- [x] **Premium Header:** Upgraded to blue gradient theme (`bg-gradient-to-r from-primary via-primary to-primary/95`) with 80px height.
- [x] **Typography & Proportions:** Established "Hero Title vs Small Date" hierarchy.
- [x] **Layout Spacing:** Aligned header padding with content margins.

---

## v0.4.0 — UI/UX Aesthetic Overhaul & Automated Video Generation (2026-03-09)

### Part A: UI/UX Aesthetic Overhaul

**Branch:** `feat/ui/ux-overhaul`

### Design Refinement

- [x] **Sidebar Upgrade:** Pill-shaped navigation, better visual separation, and premium active states.
- [x] **Sticky Header:** Added backdrop blur, refined padding/hierarchy, and responsive horizontal title/subtitle layout.
- [x] **Dashboard Overhaul:**
  - Admin/Director Dashboard: Replaced empty blocks with Welcome Banner + KPI Metric cards.
  - Scoped Dashboard: Enhanced project cards with gradients, better role badges, and improved empty state.
- [x] **Data Table UX:**
  - Integrated Search + Filter toolbar with blurred background.
  - Revamped pagination with "Showing X-Y of Z" info and rounded controls.
  - Fixed Tailwind v4 lint warnings across modified components.

### Part B: Automated Video Suite

**Branch:** `feat/client-video-generator` (merged)

- [x] Created `playwright.video.config.ts` for automated recording
- [x] High-Resolution output: Forced 1920x1080 (Desktop) and native Pixel 5 (Mobile)
- [x] Implemented `scripts/record-videos.ts` to orchestrate 20 demo scenarios
- [x] Authored 10 comprehensive test scenarios covering all user roles (Admin, Technician, Client)
- [x] **Bug Fix:** Patched `NotificationBell` crash (`undefined.length` error)
- [x] **Docs:** Comprehensive step-by-step walkthrough in `docs/video-workflows.md`

---

## v0.3.0 — Caching Layer (2026-03-08)

**Branch:** `feat/caching/nextjs-cache-components` (merged)

### Next.js 16 Cache Components (CG-05)

- [x] Enable `cacheComponents` in Next.js config
- [x] Create cache infrastructure: `ECacheTag` enum, TTL profiles
- [x] Implement cached service wrappers for 5 domains:
  - [x] Parameters (`CachedParameterService`)
  - [x] Clients (`CachedClientService`)
  - [x] Projects (`CachedProjectService`)
  - [x] Users (`CachedUserService`)
  - [x] Dashboard (`CachedDashboardService`)
- [x] Refactor all actions to use cached services
- [x] Add tag-based invalidation (`revalidateTag()`) on all mutations
- [x] Implement helper function pattern (Next.js 16 requires `'use cache'` outside class methods)
- [x] Add Suspense boundaries to layout and pages to handle uncached async calls
- [x] **Testing:** Integration test suite (22 tests) + metrics telemetry
- [x] **Invalidation fixes:** Completed coverage across all mutation actions:
  - Projects: `upsertProjectParameterOverrideAction` now invalidates `PROJECTS` and `PROJECTS_DASHBOARD`
  - Parameters: `deleteParameterAction` now invalidates `PARAMETERS_LIMITS`
  - Work Reports: photo/signature actions now invalidate `WORK_REPORTS` and `DASHBOARD_ACTIVITIES`
- [x] Build passes: `npm run build` succeeds (32 pages, TypeScript clean)
- [x] **Deployment:** Ready for QA/staging (see `docs/PHASE_4_DEPLOYMENT.md`)

**Technical Details:**

- Cache strategy: tag-based invalidation with graduated TTL profiles
- Build-time cache Components enabled (`cacheComponents: true` in next.config)
- All read-heavy service methods cached; writes bypass cache
- Metrics collection available via `NEXT_PUBLIC_CACHE_METRICS=true`
- Rollback available via config flag (`cacheComponents: false`)

---

## v0.3.0 — Shared Components & Infrastructure Baseline (2026-03-08)

**Branch:** `refactor/global`

### M-03: Foundation Characterization & Planning

- [x] **Baseline Analysis:** Inventoried 12,688 LOC across 124 files in M-03.
- [x] **Characterization Suite:** Implemented comprehensive logic lock for RBAC, Search, DataTable, and Image Pipelines.
- [x] **Test Infrastructure:** Standardized `ResizeObserver` and `PointerEvent` mocks in global setup.
- [x] **Coverage Improvements:** Increased coverage for `MultiSelect` (90%+) and `VirtualList` (100%).
- [x] **Planning:** Identified structural inversion in DI and memory leaks in ObjectURL handling.
- [x] **Artifacts:** Generated Baseline, Findings, Map, Risk, and Refactoring Plan documents.

---

## v0.2.0 — Client Portal & Notifications (2026-02-25)

**Branch:** `feat/client-portal-cp01` (merged to `development_v2`)

### CLIENT Role & Portal (CP-01)

- [x] Added `CLIENT` to `UserRole` enum in Prisma schema
- [x] Implemented read-only CLIENT role in RBAC matrix
- [x] Created `requireActor()`, `getActorOrNull()`, `AuthenticationError` in `auth-helpers.ts`
- [x] Created `TActionResponse<T>` alias and `unauthorized()` helper in `action-helpers.ts`
- [x] Added shared Prisma select objects (`prisma-selects.ts`)
- [x] **Tests:** 46 passing (auth-helpers: 19, action-helpers: 11, rbac: 16)

**CLIENT Permissions:**

- ✅ Access: Dashboard, Summary Reports, Log Sheets, Work Reports, Reports, Projects List
- ❌ No access: Lab Analyses, Attendance, Users Admin, Projects Admin, Master Data

### My Profile (MP-01)

**Branch:** `feat/users/my-profile-mp01`

- [x] `getCurrentUserProfile`, `updateCurrentUserProfile` in `users/service.ts`
- [x] Profile actions + avatar upload in `users/actions.ts`
- [x] Profile form component + `/my-profile/page.tsx`
- [x] **Tests:** 25 passing (service: 11, actions: 14)

### RBAC & Project Scoping (RBAC-02)

- [x] `ProjectAssignment` model linking users to projects
- [x] Resource-level permissions in `ROLE_MATRIX`
- [x] Project-scoped access for SUPERVISOR/TECHNICIAN/CLIENT roles
- [x] `assertCanAccessProject` helper in Service layer
- [x] URL-guessing protection for Log Sheets, Work Reports, Lab Analyses, Summary Reports
- [x] Assignment Management UI in Project edit dialog

### Notifications System (NT-02/03)

- [x] Notification persistence and Service layer
- [x] Limit Evaluation Adapter for Log Sheets
- [x] Notifications integrated into Log Sheet submission flow
- [x] UI: Header Bell/Dropdown for notifications

---

## v0.1.5 — Log Sheet Stabilization (2026-02-20)

**Branch:** `refactor/log-sheet-stabilization` (LS-STAB)

### Refactoring Stats

- [x] Log Sheet Detail page: **-65%** lines (437 → ~150)
- [x] Service layer: **-32%** duplication removed
- [x] Tests: **+161%** coverage added

### Option A Mobile Layout

- [x] Unit-based mobile entry view with `UnitOverviewList` and `UnitEntryScreen`
- [x] Consumption section with camera input for water meters
- [x] Removed legacy mobile components (`CoolingWaterQualityMobile`, `GeneralCategoryMobile`)

### Print Preview

- [x] `log-sheet-preview.tsx` component for A4 print layout
- [x] Log sheets fit single A4 page via CSS `@media print` / Tailwind `print:` modifiers

---

## v0.1.0 — MVP Foundation (2026-02-01)

### Core Domains

- [x] **Auth:** Login/session management with NextAuth
- [x] **Clients:** Full CRUD with DataTable
- [x] **Users:** Full CRUD, roles (ADMIN, MANAGER, SUPERVISOR, TECHNICIAN, CLIENT), soft delete
- [x] **Parameters:** Master data with categories + global limits
- [x] **Projects:** Full CRUD with status, personnel assignments
- [x] **Machines:** Nested in Projects form (chillers, cooling towers)
- [x] **Chemicals:** Master CRUD + Usage tracking in Log Sheets
- [x] **Attendance:** Clock in/out + Photo validation
- [x] **Lab Analysis:** Results tracking per project
- [x] **Work Reports:** Ad-hoc technician reports + digital signatures
- [x] **Summary Reports:** Monthly project sign-off

### Infrastructure

- [x] Next.js 15 + React 19 + TypeScript 5.9
- [x] Prisma 7 + PostgreSQL schema
- [x] Tailwind 4 + shadcn component system
- [x] Server Actions architecture (no REST API for internal)
- [x] Cloudflare Worker (R2) for file uploads
- [x] Sonner toast protocol for all user feedback

(End of file - total 220 lines)
