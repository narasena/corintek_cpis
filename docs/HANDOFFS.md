# Session Handoff — 2026-05-14 (Parameters Category Filter)

**Branch:** `feat/parameters-category-filter`

### Completed This Session

| Task                                                                                                      | Status      |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| Fix FilterSelect handleValueChange blocking bug                                                          | ✅ Complete |
| Create centralized constants (CATEGORY_LABELS, CATEGORY_OPTIONS)                                          | ✅ Complete |
| Update limits table category column to display human-readable labels                                      | ✅ Complete |
| Add category filter to Parameters tab                                                                     | ✅ Complete |
| Add category filter to Limits tab                                                                         | ✅ Complete |
| Remove duplicate categoryLabels from parameter-form.tsx and columns.tsx                                   | ✅ Complete |

### Objective

Add category filter to both tabs on Parameters page and fix critical FilterSelect bug that disabled all Select-based filters app-wide.

### Key Changes

**FilterSelect** (`src/components/filter-controls.tsx`)
- Implement `handleValueChange` to pass value (or `undefined` for "all").
- Use `value ?? ''` to bind Select value; empty string maps to "all".

**Constants** (`src/features/parameters/constants.ts`)
- New file with `CATEGORY_LABELS` (Record<TParameterCategory, string>) and `CATEGORY_OPTIONS` (including empty "Semua").

**Parameters columns** (`src/app/(main)/parameters/components/columns.tsx`)
- Replace local `categoryLabels` with imported `CATEGORY_LABELS`.
- Add import `TParameterCategory` for type-safe indexing.

**Parameter form** (`src/features/parameters/components/parameter-form.tsx`)
- Replace local `categoryLabels` with imported `CATEGORY_LABELS`.
- Add import `CATEGORY_LABELS`.

**Limits columns** (`src/features/parameter-limit-profiles/components/columns.tsx`)
- Import `CATEGORY_LABELS` and `TParameterCategory`.
- Render category cell with label lookup.

**Parameters page** (`src/app/(main)/parameters/page.tsx`)
- Import `IColumnFilterConfig` and `CATEGORY_OPTIONS`.
- Define `filterConfigs` with category select.
- Pass `columnFilters={true}`, `filterConfigs={filterConfigs}`, `persistFiltersInUrl={true}` to DataTable.

**Limits content** (`src/features/parameter-limit-profiles/components/parameter-limits-content.tsx`)
- Import `IColumnFilterConfig`, `CATEGORY_OPTIONS`, and `useMemo`.
- Define `filterConfigs` with category select.
- Pass filter props to DataTable.

### Verification

- TypeScript: clean on all modified files.
- Lint: Prettier formatted; no new errors introduced.
- Filters: Category dropdown appears on both tabs; selecting a category filters the table client-side; "Semua" clears filter; URL sync enabled.

---

# Session Handoff — 2026-05-14 (Work Report Signature Authorization & Storage)

**Branch:** `feat/work-reports/signature-authorization-fixes`

### Completed This Session

| Task                                                                                                      | Status      |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| Extend WorkReportRow with signature columns (technician/client signatures, timestamps, signer IDs)        | ✅ Complete |
| Add role field to WorkReportSignatureSchema for policy enforcement                                        | ✅ Complete |
| Rewrite saveWorkReportSignature: R2 storage, project access assert, role-based authorization              | ✅ Complete |
| Enforce signature presence before SUBMITTED in updateWorkReport and updateWorkReportStatus               | ✅ Complete |
| WorkReportSignatureSection UI: separate technician vs client viewer roles                                 | ✅ Complete |
| WorkReportForm: integrate signature section with refreshTrigger; split draft/submit callbacks            | ✅ Complete |
| Fix photo state synchronization to prevent stale existingPhotos error on submit                           | ✅ Complete |
| WorkReportCreateDialog: two-step draft creation with ID storage; pending photos uploaded after draft     | ✅ Complete |
| WorkReportPageClient: block all client roles (CLIENT, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN) from create/edit | ✅ Complete |
| Add service unit tests for authorization matrix (5 tests)                                                 | ✅ Complete |
| Update signature section tests; all work-report tests pass (44/44)                                        | ✅ Complete |
| TypeScript clean; build passes                                                                           | ✅ Complete |

### Objective

Implement robust signature authorization, storage, and UI role handling for work reports:

- **Storage Policy:** Replace photo-based signatures with direct column storage (`technicianSignatureUrl`, `clientPicSignatureUrl`, `technicianSignedAt`, `clientPicSignedAt`, `technicianSignedByUserId`, `clientPicSignedByUserId`) using R2.
- **Authorization:** Enforce role-based signing rights mirroring log sheet policy:
  - CLIENT_SUPERVISOR: can sign as CLIENT_PIC without explicit assignment (fallback).
  - CLIENT_TECHNICIAN: requires active `CLIENT_PIC` assignment on the project.
  - TECHNICIAN: requires active `TECHNICIAN` assignment.
  - SUPERVISOR: can sign as technician fallback without assignment.
  - ADMIN: bypasses all checks.
- **UI Separation:** Technician roles see "Tanda Tangan Teknisi" button; client roles see "Tanda Tangan PIC Klien" button only. Preview visibility respects viewer roles.
- **Workflow Guard:** Both signatures required before status can transition to SUBMITTED.
- **Client Restrictions:** All client roles (CLIENT, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN) prohibited from creating or editing work reports.

### Key Changes

**Types** (`src/features/work-reports/types.ts`)

- Extended `WorkReportRow` with signature columns and metadata fields.
- Extended `WorkReportSignatureSchema` with `role` discriminator.

**Service Layer** (`src/features/work-reports/service.ts`)

- `saveWorkReportSignature`: complete rewrite
  - Accepts `reportId`, `role`, `signatureUrl`, `userId`.
  - Asserts project access via `assertCanAccessProject`.
  - Enforces DRAFT-only mutation.
  - Authorization matrix:
    - CLIENT_SUPERVISOR → allowed (no assignment check).
    - CLIENT_TECHNICIAN → allowed only if user has `ProjectAssignment` with role `CLIENT_PIC` on the project.
    - TECHNICIAN → allowed only if user has `ProjectAssignment` with role `TECHNICIAN` on the project.
    - SUPERVISOR → allowed (no assignment check; fallback signing).
    - ADMIN → bypasses all checks.
  - Updates correct column based on `role` (`technicianSignatureUrl` / `clientPicSignatureUrl`) along with timestamp and `signedByUserId`.
  - Uploads signature image to R2 using `uploadWorkReportSignature` with signed URL.
- `updateWorkReport` and `updateWorkReportStatus`: added validation to prevent transition to SUBMITTED unless both `technicianSignatureUrl` and `clientPicSignatureUrl` are present.

**Actions** (`src/features/work-reports/actions.ts`)

- `saveWorkReportSignatureAction`: wrapper passing `session.user` to service.

**UI Components**

- `WorkReportSignatureSection` (`src/features/work-reports/components/work-report-signature-section.tsx`):
  - Split `technicianViewerRoles` (`['TECHNICIAN','SUPERVISOR']`) and `clientViewerRoles` (`['CLIENT_TECHNICIAN','CLIENT_SUPERVISOR']`).
  - CLIENT_TECHNICIAN sees only client signature button; preview respects viewer roles.
- `WorkReportForm` (`src/features/work-reports/components/work-report-form.tsx`):
  - Import `useSession` to obtain current user for signature section.
  - Add `refreshTrigger` prop to `WorkReportSignatureSection` connected to `refreshKey` state.
  - Split submit handler: `handleSubmitDraft` vs `handleSubmitSubmitted` to support post-draft photo upload.
  - Fixed `existingPhotos` state: reset to empty on `reportId` change; sync when `photos` prop changes — prevents stale state blocking submission.
- `WorkReportCreateDialog` (`src/app/(main)/work-reports/[projectId]/components/work-report-create-dialog.tsx`):
  - Two-step flow: create draft without photos first; after receiving `reportId`, upload pending photos then refresh report.
- `WorkReportPageClient` (`src/app/(main)/work-reports/[projectId]/components/work-report-page-client.tsx`):
  - `canEdit` function: excludes `CLIENT`, `CLIENT_SUPERVISOR`, `CLIENT_TECHNICIAN`.
  - `canCreate`: hides create button for all client roles.
  - `isViewOnly`: enforced at page-level with "Hanya bisa membaca" toast.

**Tests**

- New `src/features/work-reports/save-work-report-signature-service.test.ts`:
  - 5 unit tests covering authorization scenarios: CLIENT_SUPERVISOR fallback allowed; CLIENT_TECHNICIAN allowed only with assignment; TECHNICIAN requires assignment; SUPERVISOR allowed; ADMIN bypasses.
- Updated `work-report-signature-section.test.tsx`: role mapping changes.
- All work-report tests pass: **44/44**.

### Verification

- Build: `npm run build` passes cleanly.
- Lint: Pre-commit format applied; no new errors in modified files.
- Tests: `npm run test:run` reports all work-report tests passing (service, actions, components).
- Authorization: CLIENT_SUPERVISOR can sign without assignment; CLIENT_TECHNICIAN blocked when no `CLIENT_PIC` assignment exists; TECHNICIAN blocked without `TECHNICIAN` assignment.
- UI: Role-based button visibility confirmed; client roles cannot access create/edit dialogs.
- Photo upload: pending photos correctly attached after draft creation; no stale state errors on submit.

### Acceptance Criteria Met

1. Supervisor can sign work report as technician fallback without explicit assignment. ✅
2. Client supervisor can sign as client PIC without explicit CLIENT_PIC assignment. ✅
3. Client technician requires active CLIENT_PIC assignment to sign; blocked otherwise. ✅
4. Technician requires active TECHNICIAN assignment to sign. ✅
5. Both signatures present before status SUBMITTED allowed. ✅
6. CLIENT, CLIENT_SUPERVISOR, CLIENT_TECHNICIAN cannot create or edit work reports. ✅
7. Signature stored in dedicated columns, not as photos. ✅
8. R2 storage used for signature image upload. ✅
9. UI shows correct signature button based on role. ✅
10. Preview visibility respects viewer role. ✅

---

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
