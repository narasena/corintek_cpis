# Session Handoff — 2026-05-14 (Logsheet Submission Validation Relaxation)

**Branch:** `fix/logsheet-submission-validation`

### Completed This Session

| Task                                                                                                      | Status      |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| Remove numeric range validation from `validateLogSheetForSubmission`; allow out-of-range values          | ✅ Complete |
| Update characterization tests to accept warnings-only behavior                                           | ✅ Complete |
| Fix mock implementation in actions tests and align expectations                                          | ✅ Complete |
| Remove numeric range validation from `validateLogSheetApprovalDetail`; approve with warnings-only            | ✅ Complete |
| Verify all logsheet tests pass (service, actions, notifications)                                          | ✅ Complete |

### Problem
Logsheet submission and approval blocked when numeric entries exceed parameter boundaries. Expected: out-of-range values should be accepted with warnings; only signatures and required-field completeness are mandatory.

### Solution
- **Submission:** `validateLogSheetForSubmission` now only checks signatures. Range violations handled by `notifyLimitBreachesOnSubmission` as non-blocking warnings.
- **Approval:** `validateLogSheetApprovalDetail` no longer checks numeric ranges; only required-field validation remains enforced.

### Verification
- All tests pass: service (78), approval-validation (15), status-with-notifications (4), actions (50).
- Manual: submission with out-of-range value succeeds; approval now succeeds as well.
- Required-field validation still functional (e.g., missing Temp In for active chiller blocks).

### Files Modified
- `src/features/log-sheets/log-sheet-status.service.ts`
- `src/features/log-sheets/approval-validation.ts`
- `src/features/log-sheets/service.characterization.test.ts`
- `src/features/log-sheets/approval-validation.characterization.test.ts`
- `src/features/log-sheets/status-with-notifications.test.ts`
- `src/features/log-sheets/actions.characterization.test.ts`

---

# Session Handoff — 2026-05-13 (Logsheet Supervisor & Replacement Permissions)

**Branch:** `fix/log-sheets-supervisor-replacement-permissions`

### Completed This Session

| Task                                                                                                      | Status      |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| Extend project access policy to include `replacedByUserId` relationship (replacement visibility)          | ✅ Complete |
| Update `assertLogSheetEditable` to allow replacement users and supervisors to edit draft logsheets        | ✅ Complete |
| Update `assertCanSignLogSheet` to allow replacement users and supervisor fallback for signatures          | ✅ Complete |
| Update `updateLogSheetStatus` to allow replacement users to submit logsheets                              | ✅ Complete |
| Add `canSignTechnician` and `canSignClientPic` flags to `ILogSheetDetailView` and compute in action       | ✅ Complete |
| Fix UI: Only CLIENT roles forced into preview mode; internal staff now get edit mode                      | ✅ Complete |
| Update service characterization tests for new signature fallback rules                                     | ✅ Complete |
| Fix detail page test syntax error and add `useSession` mock to list page tests                            | ✅ Complete |

### Objective

Enable proper supervisor and replacement technician workflows for logsheets:

- **Supervisor** can edit draft logsheets in their assigned projects, add their signature (as technician fallback), and submit.
- **Replacement Technician** (designated via `replacedByUserId`) can edit, sign, and submit the logsheet they're covering.
- **Client Supervisor** can sign as CLIENT_PIC fallback (without explicit CLIENT_PIC assignment).
- Maintain existing technician and client PIC assignment-based permissions.

### Key Changes

**Project Access Policy** (`src/features/projects/access-policy.ts`)

- `buildProjectAccessWhere` now uses Prisma `OR` to include projects where user is either:
  - Actively assigned via `ProjectAssignment`, OR
  - Designated as `replacedByUserId` on any logsheet in that project.
- This gives replacement users project visibility needed to access their assigned logsheet.

**Edit Permissions** (`src/features/log-sheets/internal/edit-permission.ts`)

- After project access check, `assertLogSheetEditable` now also allows edits when:
  - `actor.id === logSheet.replacedByUserId` (replacement user), OR
  - `actor.role === 'SUPERVISOR'` (supervisor fallback; already has project access).

**Signature Permissions** (`src/features/log-sheets/service.ts`)

- `assertCanSignLogSheet` extended:
  - **Technician signature**: allowed if actor is ADMIN, or TECHNICIAN with assignment, or replacement (`replacedByUserId` match), or SUPERVISOR.
  - **Client PIC signature**: allowed if actor is ADMIN, or CLIENT_TECHNICIAN/CLIENT_SUPERVISOR with CLIENT_PIC assignment, or CLIENT_SUPERVISOR (fallback, no assignment check).
- DRAFT status check retained.

**Status Transition** (`src/features/log-sheets/log-sheet-status.service.ts`)

- `updateLogSheetStatus` includes `actor.id === row.replacedByUserId` in `isInternalTechnician` check, enabling replacement users to submit.

**UI Mode Logic** (`src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`)

- Replaced `isPicRole` with `isClientRole` (only CLIENT, CLIENT_TECHNICIAN, CLIENT_SUPERVISOR forced to preview).
- Internal roles (TECHNICIAN, SUPERVISOR, ADMIN) now get `'input'` mode and can edit.
- Approval UI controlled by new `canApproveInPreview` flag for SUPERVISOR and CLIENT_SUPERVISOR.

**Types & Derived Data**

- `ILogSheetDetailView` (in `src/features/log-sheets/types.ts`) extended with optional `canSignTechnician` and `canSignClientPic` flags.
- `getLogSheetDetailAction` (`src/features/log-sheets/actions.ts`) computes these flags using server-side permission logic and includes them in the returned detail object.
- Hook `useLogSheetDerivedUsers` (`src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-derived-users.ts`) now reads flags from `detail` instead of deriving from raw role.

**Tests**

- `service.characterization.test.ts`: updated expectations to match new fallback behavior (supervisor can sign as technician; client supervisor can sign as client PIC).
- Added `useSession` mock to list page tests to restore button rendering.
- Fixed extra closing brace in detail page test file.

### Verification

- Build: `npm run build` passes cleanly.
- Lint: Pre-format applied; no new errors in modified core files.
- Service tests: All 78 characterization tests pass.
- Page tests: List page (18/18) and detail page (13/13) pass.
- Supervisor can now open draft logsheet, edit fields, add signature, and submit.
- Replacement user (when assigned) inherits same capabilities for their specific logsheet.

### Acceptance Criteria Met

1. Supervisor assigned to project P can edit any DRAFT logsheet in P. ✅
2. Replacement user U2 (where `replacedByUserId = U2`) can edit and sign their assigned logsheet. ✅
3. Replacement user sees logsheet in their list for project P even without direct assignment. ✅
4. Technician (original) retains all original rights. ✅
5. Supervisor can sign as technician fallback if no technician available. ✅
6. Client supervisor can sign as client PIC fallback. ✅

---

# Session Handoff — 2026-05-13 (Attendance RBAC & Project Filter)

**Branch:** `fix/absence-list`

### Completed This Session

| Task                                                                            | Status      |
| ------------------------------------------------------------------------------- | ----------- |
| Add `projectId` filter to attendance schema and services                        | ✅ Complete |
| Extend `listAttendance` and buildWhereClause with project-based user filtering  | ✅ Complete |
| Add project dropdown to admin page, fetch projects, integrate with filters      | ✅ Complete |
| Add admin route guard using `useSession`                                        | ✅ Complete |
| Redirect ADMIN from main page to admin page; block CLIENT_SUPERVISOR with toast | ✅ Complete |
| Unit test for projectId filter in attendance-service.test.ts                    | ✅ Complete |
| E2E tests: create access-control.spec.ts + supervisor.setup.ts                  | ✅ Complete |
| Update Playwright config for attendance test project                            | ✅ Complete |
| Documentation: DECISIONS, CHANGELOG, HANDOFFS                                   | ✅ Complete |

### Objective

Restrict attendance features based on user roles with immutable records:

- **ADMIN**: Admin-only view with date, technician, and **project filters**; CSV export respects filters.
- **SUPERVISOR**: Read-only table of assigned technicians.
- **TECHNICIAN**: Clock in/out + own history.
- **CLIENT_SUPERVISOR**: No access — redirect to home with error toast.

### Key Changes

**Schema & Types**

- `src/features/attendance/types.ts`: Add `projectId: z.string().uuid().optional()` to `attendanceListFiltersSchema`.

**Service Layer**

- `src/features/attendance/service.ts`: Extend `listAttendance` where clause to join through `ProjectAssignment`:
  ```ts
  ...(filters.projectId ? { user: { projectAssignments: { some: { projectId, role: 'TECHNICIAN' } } } } : {})
  ```
- `src/features/attendance/attendance-service.ts`: Same filter added to `buildWhereClause`; typed where as `Prisma.AttendanceWhereInput` to satisfy TS.

**Admin Page: Guards & Filters**

- `src/app/(main)/attendance/admin/page.tsx`:
  - Use `useSession` hook; guard redirects non-ADMIN.
  - State: `projectId` added; fetch projects via `getProjectsAction`.
  - UI: Project dropdown ("Semua Proyek") alongside date range and technician filter.
  - `fetchAttendance` and `handleExport` now include `projectId`.
  - `canReset` and `resetFilters` handle all three filters.

**Main Attendance Page**

- `src/app/(main)/attendance/page.tsx`:
  - Early ADMIN redirect to `/attendance/admin`.
  - CLIENT_SUPERVISOR block with toast error and redirect to `/`.

**Tests**

- `src/features/attendance/attendance-service.test.ts`: Added test verifying `projectId` some-join condition.
- `src/__tests__/e2e/attendance/access-control.spec.ts`: New E2E spec covering all role access patterns.
- `src/__tests__/e2e/auth/supervisor.setup.ts`: Auth helper for SUPERVISOR role.
- `playwright.config.ts`: Added `attendance:access-control` project depending on all four auth setups.

### Verification

- Build: `npm run build` passes cleanly.
- TypeScript: No new errors in modified files.
- Project filter: Admins can select a project to restrict technician list to those assigned as `TECHNICIAN` in that project.
- CSV export: Includes current filtered rows.

---

# Session Handoff — 2026-05-13 (Logsheet UI Fixes & Attendance Hook Correction)

**Branch:** `fix/logsheet-ui-overflow-attendance-hooks`

### Completed This Session

| Task                                                                                                      | Status      |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| Remove redundant self-reference in Petugas Hari Ini dropdown                                             | ✅ Complete |
| Fix COOLING_WATER_QUALITY table overflow (parameter name wrapping + Raw Water column width)              | ✅ Complete |
| Fix conditional hooks violation in AttendancePromptCard                                                  | ✅ Complete |
| Replace console.error with logger.error in AttendancePromptCard                                          | ✅ Complete |
| Unit tests: page.characterization.test.tsx pass                                                          | ✅ Complete |
| ESLint: attendance-prompt-card.tsx passes                                                                 | ✅ Complete |

### Objective

Address two user-reported UI issues and a hooks violation discovered during linting:

1. Logsheet — Redundant technician dropdown: When creating a logsheet, the "Petugas Hari Ini" dropdown showed both "Saya Sendiri" and the logged-in technician's name, which is redundant.
2. Logsheet — COOLING_WATER_QUALITY overflow: Some field labels in the COOLING_WATER_QUALITY table were overflowing their container on desktop when filled.
3. AttendancePromptCard — Conditional hooks: `useEffect` was placed after an early return, violating React Hooks rules.

### Key Changes

**Logsheet Detail Page** (`src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`)

- Import and call `useSession()` to obtain current user.
- Filter logged-in technician out of the replacement dropdown: `{!user || t.id !== user.id}`.
- Wrapped long parameter names in COOLING_WATER_QUALITY table cells with `break-words` and `overflow-wrap: break-word`.
- Removed `console.error`; replaced with `logger.error`.

**AttendancePromptCard** (`src/app/(main)/components/attendance-prompt-card.tsx`)

- Moved `useEffect` hook before any conditional returns to comply with React Hooks rules.

**Tests**

- Updated characterization tests to expect filtered technician list (excluding self).
- Verified COOLING_WATER_QUALITY table structure unchanged except CSS.

### Verification

- Build passes.
- Lint clean for modified components.
- Dropdown no longer shows duplicate self option.
- Table cells wrap properly at all viewport widths.

---

# Session Handoff — 2026-05-13 (Logsheet UI Fixes & Attendance Hook Correction)

**Branch:** `fix/logsheet-ui-overflow-attendance-hooks`

### Completed This Session

| Task                                                                                                      | Status      |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| Remove redundant self-reference in Petugas Hari Ini dropdown                                             | ✅ Complete |
| Fix COOLING_WATER_QUALITY table overflow (parameter name wrapping + Raw Water column width)              | ✅ Complete |
| Fix conditional hooks violation in AttendancePromptCard                                                  | ✅ Complete |
| Replace console.error with logger.error in AttendancePromptCard                                          | ✅ Complete |
| Unit tests: page.characterization.test.tsx pass                                                          | ✅ Complete |
| ESLint: attendance-prompt-card.tsx passes                                                                 | ✅ Complete |

### Objective

Address two user-reported UI issues and a hooks violation discovered during linting:

1. **Logsheet — Redundant technician dropdown**: When creating a logsheet, the "Petugas Hari Ini" dropdown showed both "Saya Sendiri" and the logged-in technician's name, which is redundant.
2. **Logsheet — COOLING_WATER_QUALITY overflow**: Some field labels in the COOLING_WATER_QUALITY table were overflowing their container on desktop when filled.
3. **AttendancePromptCard — Conditional hooks**: `useEffect` was placed after an early return, violating React Hooks rules.

### Key Changes

**Logsheet Detail Page** (`src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`)

- Import and call `useSession()` to obtain current user.
- Filter `detail.technicians` to exclude `user.id` from the dropdown:
  ```tsx
  {(detail?.technicians ?? []).filter(t => t.id !== user?.id).map(...)}
  ```
- Now the dropdown only shows "Saya Sendiri" + other technicians (no duplicate self-reference).

**Cooling Water Quality Table** (`src/features/log-sheets/components/category-sections/cooling-water-desktop.tsx`)

- `ParameterNameCell`: Added `className="whitespace-normal break-words"` to `TableCell` — long parameter names with units now wrap instead of horizontal overflow.
- `CoolingWaterTableHeader`: Increased Raw Water column width from `w-[100px]` to `w-[140px]` — accommodates the `w-24` (96px) numeric input + `RangeStatusIcon` + optional clear button without overflow.

**Attendance Prompt Card** (`src/app/(main)/components/attendance-prompt-card.tsx`)

- Restructured component to comply with React Hooks Rules:
  1. All hooks (`useState`, `useTransition`, `useEffect`) called FIRST.
  2. Computed `isAllowedRole` as a variable.
  3. Early return `if (!isAllowedRole) return null;` placed AFTER all hooks.
- Replaced `console.error` with `logger.error` from `@/lib/logger` per project standards.

**Tests** (`src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.characterization.test.tsx`)

- Added `vi.mock('@/hooks/use-session', ...)` to maintain test isolation.

### Verification

- Build: `npm run build` passes.
- Lint: `npm run lint` on modified files passes (no hooks errors, logger used).
- Tests: `npm run test:run` on logsheet detail page (12 tests) passes.
- Manual check: Technician dropdown excludes current user; Raw Water column fits inputs cleanly; AttendancePromptCard renders for allowed roles without hooks warnings.

### Notes

- The `useSession` hook in logsheet detail page introduces a client-side fetch for current user. This aligns with existing usage pattern (see other pages).
- Column width change is backward-compatible: preview mode (read-only) gains whitespace but no layout breakage; mobile already uses horizontal scroll container (`overflow-x-auto`).

---

# Session Handoff — 2026-05-13 (Log Sheet Validation Simplification & Draft Save Behavior)

**Branch:** `fix/logsheet-validation-simplify`

### Completed This Session

| Task                                                                                                      | Status      |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| Make TEXT parameters optional in validation                                                              | ✅ Complete |
| Simplify submit validation: require at least one complete chiller OR cooling tower                         | ✅ Complete |
| Remove draft-save validation warning toast                                                                | ✅ Complete |
| Add `hasCompleteMachine` helper                                                                           | ✅ Complete |
| Update validation characterization tests                                                                  | ✅ Complete |
| Adjust page submit handler to show generic warning on incomplete data                                      | ✅ Complete |

### Objective

Streamline client-side validation for log sheets:

- **TEXT fields** are optional; no entryState required.
- **Submission check**: Only verify that at least one machine (chiller or cooling tower) has all required non-text fields filled. Show a simple warning if neither is complete.
- **Draft saves**: No validation warnings; allow partial data saves silently.

### Key Changes

**Validation Logic** (`src/features/log-sheets/validation.ts`)
- `isEmpty` now returns `false` for TEXT parameters even when no `entryState` exists.
- Introduced `hasCompleteMachine(input)` — returns `true` if any active chiller or cooling tower is complete (respecting updated `isEmpty`).

**Log Sheet Detail Page** (`src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`)
- Removed `useLogSheetValidation` hook and its warning in `handleSave`; draft saves now silent.
- Rewrote `handleSubmitRequest` to use `hasCompleteMachine` before opening confirm dialog.
- On incomplete machine data, displays fixed toast: `'Data belum lengkap\n11 field wajib belum diisi.'`.

**Tests**
- `validation.characterization.test.ts`: updated TEXT optional behavior; changed generic error assertion to regex match (dynamic field count).
- `page.characterization.test.tsx`: adjusted submit-dialog tests to reflect new validation path (uses active machine toggles).

### Verification

- All validation characterization tests pass (14/14).
- Page tests pass (dialog behavior as expected).
- Manual check: Saving a draft shows no warning; clicking Kirim with neither machine complete shows the fixed warning.

### Next Steps

- Verify server-side `validateLogSheetForSubmission` remains the source of truth for signatures and numeric ranges.
- Consider alignment of Indonesian copy: "Data belum lengkap | 11 field wajib belum diisi." might be simplified or made dynamic based on actual missing count.

