# Session Handoff — 2026-05-13 (Attendance Role-Based Access & Project Filter)

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

