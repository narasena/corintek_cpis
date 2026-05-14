## [Unreleased] — Dashboard Project Filter (2026-05-14)

### New Features

- [DB-04] Added project selector dropdown to dashboard: displays "Semua Proyek" + accessible projects list; updates `projectId` URL query parameter on change.
- Implemented role-based project fetching: scoped roles (SUPERVISOR, TECHNICIAN, CLIENT, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN) use `getDashboardProjectsAction`; others use `getProjectsAction`.
- Added loading spinner and disabled states; handles empty project lists gracefully.

### Technical Changes

- New client component: `src/app/(main)/_components/project-selector.tsx`.
- Uses shadcn/ui `Select` with Tailwind styling (`w-[240px]`).
- Integrates `next/navigation` router and search params for URL sync.
- Error handling via `logger.error` with `[CPIS-ERROR]` prefix.
- Follows client-component pattern; calls server actions directly.

### Files Modified
- `src/app/(main)/_components/project-selector.tsx` (new)
- `src/app/(main)/_components/analytics-dashboard.tsx`
- `src/app/(main)/page.tsx

### Integration
- AnalyticsDashboard server component updated:
  - Accepts optional `projectId` prop; passes to metrics and photos actions.
  - Renders `ProjectSelector` for all users (no role condition).
  - Layout: selector + time range in flex row; removed unused date vars.
- Main page (`src/app/(main)/page.tsx`) updated:
  - Reads `projectId` from `searchParams`.
  - Forwards `projectId` to `AnalyticsDashboard` and `RecentActivitySection` in both render paths.
- RecentActivitySection already supported `projectId`; no change required.
- This feature enables project-scoped data across all dashboard visuals and activity feed.

---

## [Unreleased] — Parameters Category Filter (2026-05-14)

### New Features

- [PARAM-FILTER-001] Added category dropdown filter to Parameters and Limits tabs, using client-side DataTable filtering with optional URL persistence.
- [PARAM-FIX-002] Fixed critical FilterSelect component: `handleValueChange` now correctly forwards value; empty selection maps to `undefined` to clear filter.
- [PARAM-REFACTOR-003] Centralized category labels and options into `src/features/parameters/constants.ts`; removed duplicate definitions in `parameter-form.tsx` and `parameters/components/columns.tsx`.

### Technical Changes

- **FilterSelect** (`src/components/filter-controls.tsx`): bind value as `value ?? ''`; caller-provided options must include empty entry for "all".
- **Parameters page** (`src/app/(main)/parameters/page.tsx`): added `filterConfigs` with category select; enabled `columnFilters` and `persistFiltersInUrl`.
- **Limits content** (`src/features/parameter-limit-profiles/components/parameter-limits-content.tsx`): added `filterConfigs` and DataTable filter props; imported `useMemo`.
- **Limits columns** (`src/features/parameter-limit-profiles/components/columns.tsx`): render category labels using `CATEGORY_LABELS`.
- **Removed unused import** `DataTableEmpty` from parameters page.

### Tests & Verification

- TypeScript: no errors in modified files.
- Lint: Prettier formatting applied; no new errors introduced.
- Manual: Category dropdown appears and filters tables correctly; "Semua" clears filter; URL sync functional.

**Files Modified:**
- `src/components/filter-controls.tsx`
- `src/features/parameters/constants.ts` (new)
- `src/app/(main)/parameters/components/columns.tsx`
- `src/features/parameters/components/parameter-form.tsx`
- `src/features/parameter-limit-profiles/components/columns.tsx`
- `src/app/(main)/parameters/page.tsx`
- `src/features/parameter-limit-profiles/components/parameter-limits-content.tsx`

---

## [Unreleased] — Work Report Signature & UI Fixes (2026-05-14)

### Bug Fixes

- [WR-SIGN-001] Fixed signature authorization to mirror logsheet policy: internal technicians require active assignment; client roles (CLIENT_TECHNICIAN, CLIENT_SUPERVISOR) can sign as CLIENT_PIC without assignment; SUPERVISOR can sign as technician fallback.
- [WR-UI-002] Fixed photo upload error on submit caused by stale `existingPhotos` state after signature refresh.
- [WR-UI-003] Blocked all client roles (CLIENT, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN) from editing/creating work reports.
- [WR-FLOW-004] Enabled photo upload during create flow; pending photos now uploaded after draft creation using returned reportId.
- [WR-ROLE-005] Corrected UI role mapping: CLIENT_TECHNICIAN now sees client signature button (not technician); preview visibility adjusted accordingly.

### Technical Changes

- Split photo state effects in WorkReportForm: reset pending on id change; sync existing on photos change.
- Extended `WorkReportRow` with signature columns (`technicianSignatureUrl`, `clientPicSignatureUrl`, timestamps, signer IDs). Extended `WorkReportSignatureSchema` with `role` field.
- Hardened `saveWorkReportSignature` service: project access assertion, role-based authorization, R2 storage upload, direct column update (no longer creates `WorkReportPhoto`).
- Updated `canEdit`/`canCreate` in work-report-page-client to exclude all client roles.
- Adjusted signature visibility: `technicianViewerRoles` = `['TECHNICIAN','SUPERVISOR']`; `clientViewerRoles` = `['CLIENT_TECHNICIAN','CLIENT_SUPERVISOR']`.
- `updateWorkReport` and `updateWorkReportStatus` now enforce both signatures present before allowing SUBMITTED transition.

### Tests & Verification

- Added `save-work-report-signature-service.test.ts` with 5 unit tests covering authorization matrix.
- Updated `work-report-signature-section.test.tsx` for new role mapping (16 tests).
- All work-report tests pass: **44/44**.
- TypeScript clean; build passes.

**Files Modified:**
- `src/features/work-reports/types.ts`
- `src/features/work-reports/service.ts`
- `src/features/work-reports/actions.ts`
- `src/features/work-reports/components/work-report-form.tsx`
- `src/app/(main)/work-reports/[projectId]/components/work-report-create-dialog.tsx`
- `src/app/(main)/work-reports/[projectId]/components/work-report-page-client.tsx`
- `src/features/work-reports/components/work-report-signature-section.tsx`
- `src/features/work-reports/components/work-report-signature-section.test.tsx`
- `src/features/work-reports/save-work-report-signature-action.test.ts`
- New: `src/features/work-reports/save-work-report-signature-service.test.ts`

---

## [Unreleased] — Logsheet Validation Relaxation (2026-05-14)

### Bug Fixes

- [LOG-051] Relaxed numeric range validation on logsheet submission: out-of-range values now generate warnings instead of blocking.
  - `validateLogSheetForSubmission` no longer checks numeric ranges; only signatures are mandatory.
  - Range breaches still reported via `notifyLimitBreachesOnSubmission` as warning notifications.
- [LOG-052] Relaxed numeric range validation on logsheet approval: out-of-range values no longer block approval.
  - `validateLogSheetApprovalDetail` no longer checks numeric ranges; required-field validation remains enforced.
  - This aligns approval behavior with submission; range issues are warnings only.
- Updated all affected characterization tests (service, approval, actions, status).

**Files Modified:**
- `src/features/log-sheets/log-sheet-status.service.ts`
- `src/features/log-sheets/approval-validation.ts`
- `src/features/log-sheets/service.characterization.test.ts`
- `src/features/log-sheets/approval-validation.characterization.test.ts`
- `src/features/log-sheets/status-with-notifications.test.ts`
- `src/features/log-sheets/actions.characterization.test.ts`

---

## [Unreleased] — Supervisor/Replacement Logsheet Permissions & Attendance Fixes (2026-05-13)

### New Features

- **[LOG-004] Supervisor and replacement signature workflow**  
  **Branch:** `fix/log-sheets-supervisor-replacement-permissions`  
  Supervisors can edit draft logsheets in assigned projects, add technician signature (fallback), and submit. Replacement technicians (via `replacedByUserId`) can edit, sign, and submit their assigned logsheet. Client supervisors can sign as CLIENT_PIC fallback.  
  **Files Modified:**  
  - `src/features/projects/access-policy.ts`  
  - `src/features/log-sheets/internal/edit-permission.ts`  
  - `src/features/log-sheets/service.ts`  
  - `src/features/log-sheets/log-sheet-status.service.ts`  
  - `src/features/log-sheets/actions.ts`  
  - `src/features/log-sheets/types.ts`  
  - `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`  
  - `src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-derived-users.ts`  
  - `src/app/(main)/log-sheets/[projectId]/[logSheetId]/types.ts`  
  - Test files: `service.characterization.test.ts`, `page.characterization.test.tsx`.

### Technical Changes

- **Project Access:** Extended `buildProjectAccessWhere` to include `replacedByUserId` OR condition, enabling replacement users to see projects they're covering.
- **Signature Flags:** Added `canSignTechnician` and `canSignClientPic` to detail view; computed server-side for UI consistency.
- **UI Mode:** Changed preview-only restriction to apply only to CLIENT roles; internal staff now get input mode.

### Bug Fixes

- [LOG-001] Petugas Hari Ini dropdown: removed redundant self-reference.
- [LOG-002] COOLING_WATER_QUALITY table overflow: parameter names wrap; Raw Water column widened.
- [ATT-001] AttendancePromptCard: fixed conditional hooks violation; replaced console.error with logger.error.
- [LOG-003] Simplified log sheet validation: TEXT parameters optional; submission requires at least one complete machine; draft save warnings removed.

**Files Modified (cumulative this session):**

- `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`
- `src/features/log-sheets/components/category-sections/cooling-water-desktop.tsx`
- `src/app/(main)/components/attendance-prompt-card.tsx`
- `src/features/log-sheets/validation.ts`
- Plus all permission-related files listed above.

---

## [Unreleased] — Attendance RBAC & Project Filter + Logsheet UI Fixes (2026-05-13)

# Changelog — CHANGELOG.md

> CPIS — Corintek Project Information System

**Format:** Newest first. One section per milestone.

---

## v0.7.4.1 — ActionCell Delete Dialog Bug Fix (2026-05-11)

**Branch:** `staging`

### Bug Fixes

- [x] **ActionCell customDescription:** Fixed "Sudah ada undefined log sheet" message caused by nullish coalescing misuse in the projects table's delete confirmation dialog. Now correctly shows no message when count is 0, and "Sudah ada {count} logsheet tersimpan di database." when count > 0.

**Files Modified:**

- `src/app/(main)/projects/components/columns.tsx`

---

## v0.7.4 — Project Personnel Assignment & UI Fixes (2026-05-11)

**Branch:** `fix/project-creation-no-personel`

### Bug Fixes & Improvements

- [x] **Persist Personnel Assignments on Project Creation:** Fixed bug where assignment fields (PIC Project, Teknisi, PIC Klien) were ignored during project creation. Assignments are now saved within the same transaction via `applyProjectAssignmentsTransaction`.
- [x] **Date Display Format:** Corrected project table date columns to display in "12 Sep 2026" format using `toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })`.
- [x] **UI Polish:** Responsive layout adjustments in project form, machine section sticky header padding, and dialog height consistency.

**Files Modified:**

- `src/features/projects/service.ts` (core fix)
- `src/features/projects/service.test.ts` (test coverage)
- `src/app/(main)/projects/components/columns.tsx` (date format fix + lint)
- `src/features/projects/components/project-form.tsx` (responsive layout)
- `src/features/projects/components/project-meta-section.tsx` (responsive layout)
- `src/features/machines/components/machine-form-section.tsx` (responsive sticky)
- `src/components/crud-dialog.tsx` (height)
- `src/app/(main)/projects/page.tsx` (unused import cleanup)

---

## v0.7.3 — Admin Password Reset (2026-05-11)

**Branch:** `fix/password-change-by-admin`

### Security & Administration

- [x] **Admin-Only Password Reset:** Administrators can now reset passwords for other users via the user edit dialog. The dialog shows "New Password" and "Confirm Password" fields when the current user is an admin editing a different user. Admins cannot reset their own password via this UI—those cases require developer intervention. Password match validation activates only when a new password is entered.
- [x] **Schema Update:** Added optional `confirmPassword` field to `userUpdateSchema` with a conditional refine that enforces matching only when a password is provided.
- [x] **Server Action Adjustment:** `updateUserAction` now strips `confirmPassword` before passing data to the service layer (consistent with create action).
- [x] **UI Propagation:** Actor role and target user ID flow through `UsersPage → UserDialog → UserForm → UserSecurityFields`, showing password fields only when `canResetPassword` is true (admin editing another user).

**Files Modified:**

- `src/@types/user.type.ts`
- `src/features/users/actions.ts`
- `src/app/(main)/users/page.tsx`
- `src/features/users/components/user-dialog.tsx`
- `src/features/users/components/user-form.tsx`
- `src/features/users/components/form-sections/UserSecurityFields.tsx`

---

## v0.7.2 — Log Sheet Optional Machine-Type Validation (2026-04-29)

**Branch:** `development_v2`

### Validation & Flexibility Improvements

- [x] **Optional Machine-Type Requirement:** Technicians can now submit logsheets with only chillers _or_ only cooling towers populated. Previously both types had to be fully filled regardless of active selection.
- [x] **Raw Water Conditional:** Raw water quality check is now enforced only when at least one cooling tower is active (previously always required).
- [x] **General Condition Note Enforcement:** Fixed approval validation to correctly require the `GENERAL_CONDITION` note field (previously excluded by mistake).
- [x] **Cross-Type Guard:** Added explicit validation to ensure at least one machine type (chillers or CTs) is active before submission.
- [x] **Test Coverage:** Added 10 new characterization tests covering chiller-only, CT-only, both-inactive, raw-water skip, and note enforcement scenarios.
- [x] **Data Accuracy:** Fixed CT-only test data (removed duplicate `boolValue`, added missing `RAW_WATER` entry for cycle of concentration).

**Files Modified:**

- `src/features/log-sheets/validation.ts` (3 changes)
- `src/features/log-sheets/validation.characterization.test.ts` (7 tests)
- `src/features/log-sheets/approval-validation.ts` (2 changes)
- `src/features/log-sheets/approval-validation.characterization.test.ts` (3 tests + data fix)

---

## v0.7.1 — Log Sheet Transaction Timeout Fix (2026-04-29)

**Branch:** `fix/log-sheets/transaction-timeout`

### Bug Fixes

- [x] **Transaction timeout on Vercel:** Fixed `P2028` error when saving logsheet entries with many rows. Parallelized entry processing with `Promise.all()` and increased transaction timeout from 5s to 30s.
  - Modified `src/features/log-sheets/log-sheet-entries.service.ts`
  - Root cause: Sequential `for...await` loop accumulated network RTT beyond 5s on Vercel's remote DB
  - All characterization tests pass (78/78)

---

## v0.7.0 — Dashboard Analytics Refinement (2026-03-10)

**Branch:** `feat/dashboard/analytics-refinement`

### Dashboard & Analytics

- [x] **Multi-Time Range Support:** Added 7d, 30d, and 90d toggle for analytics charts.
- [x] **Data Wiring Fix:** Correctly wired `ampere_evap` parameter to the Ampere Chart.
- [x] **Missing Data Visibility:** Investigated and resolved issues with data outside the default 30-day window via the new 90-day range.
- [x] **Draft Exclusion:** Confirmed analytics strictly exclude draft logsheets for data integrity.
- [x] **Layout Polish:** Standardized height and alignment for activity feed and analytics sections.
- [x] **Seed Data Update:** Added missing `ampere_evap` to master parameter seed.

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
