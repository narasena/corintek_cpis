# CPIS Bug Registry

> **Purpose:** Active bug tracking for stabilization phase.  
> **Status Legend:** `Open` · `In Progress` · `Fixed` · `Verified`  
> **Priority:** `P0` Blocker · `P1` High · `P2` Medium · `P3` Low

---

## 🔴 P0 — Blockers

| Bug ID   | Module      | Title                                                                           | Status |
| :------- | :---------- | :------------------------------------------------------------------------------ | :----- |
| BUG-001  | Logsheet    | Signature save triggers full page re-render, losing all unsaved input           | Fixed  |
| BUG-001b | Logsheet    | Signature Preview Not Updating After Save (Derived from BUG-001)                | Fixed  |
| BUG-002  | Logsheet    | CLIENT_PIC cannot add signature (unauthorized), but submission requires it      | Fixed  |
| BUG-002b | Logsheet    | Logsheet Table Actions Not RBAC-Gated                                           | Fixed  |
| BUG-002c | Work Report | CLIENT Role Can Edit Work Reports                                               | Fixed  |
| BUG-003  | Work Report | Uploaded photos are not persisted to the database after upload — lost on reload | Fixed  |
| BUG-003b | Work Report | Photos Duplicated on Each Save                                                  | Fixed  |
| BUG-003c | Work Report | Delete Photos Not Working                                                       | Fixed  |
| BUG-003d | Work Report | Work Report Photo Print Layout Issues                                           | Fixed  |
| BUG-001c | Dashboard   | Dashboard Shows "Buat Logsheet Baru" to CLIENT Role                             | Fixed  |
| BUG-002d | Work Report | CLIENT_PIC Cannot Sign Work Reports                                             | Fixed  |
| BUG-002e | Work Report | Work Report Actions Column Should Be Hidden for CLIENT                          | Fixed  |
| BUG-003e | Work Report | Work Report Photo Delete Not Persisted                                          | Fixed  |
| BUG-003g | Work Report | Edit Work Report Shows Empty Fields (Date, Time, Work Details)                  | Fixed  |
| BUG-003f | Logsheet    | Logsheet Photo Print Preview Should Show Side-by-Side Like Work Reports         | Fixed  |

### BUG-001 — Logsheet Signature Causes Full Re-render (State Loss)

**Symptom:** After submitting a signature in a logsheet, the entire page re-renders and all unsaved form input (entries, notes, chemicals) is lost.  
**Root Cause:** `saveLogSheetSignatureAction` calls `revalidatePath(...)`, which invalidates the Next.js cache and triggers a server-side re-fetch, discarding client state.  
**Impact:** Critical data loss mid-session. Users must re-enter all data.  
**Status:** Fixed

---

### BUG-002 — CLIENT_PIC Cannot Sign, But Signature is Required for Submission

**Symptom:** Logsheet submission fails because `clientPicSignatureUrl` is missing. However, CLIENT_PIC role does not have RBAC permission to call `saveLogSheetSignatureAction`.  
**Root Cause:** `validateLogSheetForSubmission` enforces both signatures as mandatory. `saveLogSheetSignatureAction` is guarded by `LOG_SHEETS: update` capability, which CLIENT role does not have.  
**Impact:** Logsheets can never be legitimately submitted unless an Admin bypasses the requirement. Core workflow is broken.  
**Related:** BUG-031 (admin as signature bypass)  
**Status:** Fixed

---

### BUG-003 — Work Report Photos Not Persisted After Upload

**Symptom:** Photos uploaded during work report creation appear in the UI but disappear after saving as draft or reloading.  
**Root Cause:** `uploadWorkReportPhotoAction` uploads the file to R2 and returns a URL, but never writes a `WorkReportPhoto` record to the database. The photo URL is lost once the component unmounts.  
**Impact:** Work report photos feature is non-functional end-to-end.  
**Status:** Fixed

---

### BUG-001b — Signature Preview Not Updating After Save (Derived from BUG-001)

**Symptom:** After signing a logsheet, the success toast appears but the signature preview doesn't change - requires hard refresh.  
**Root Cause:** The `handleSignatureUpdate` handler doesn't update the client state with the new signature URL. The optimistic update is missing.  
**Impact:** Poor UX - user thinks signature didn't save.  
**Status:** Fixed

---

### BUG-002b — Logsheet Table Actions Not RBAC-Gated

**Symptom:** Logsheet table shows action buttons (Edit, View) regardless of user role permissions. Non-technician users can see buttons they shouldn't access.  
**Root Cause:** Table action buttons are rendered without checking RBAC permissions. Also, clicking date should open preview directly.  
**Impact:** Users see buttons they cannot use; inconsistent permission model.  
**Status:** Fixed

---

### BUG-002c — CLIENT Role Can Edit Work Reports

**Symptom:** CLIENT role (non-PIC) can open assigned project work reports in edit mode, but should only have read-only access plus signature capability.  
**Root Cause:** No role-based restriction on work report edit dialog - CLIENT should only see preview mode + sign.  
**Impact:** Unauthorized modification capability.  
**Status:** Fixed

---

### BUG-003b — Photos Duplicated on Each Save

**Symptom:** Photos are being duplicated 3-4 times on each save operation.  
**Root Cause:** Photos are being added to the database multiple times, likely due to missing ID check in the save logic or photos not being properly tracked.  
**Impact:** Photo data corruption, storage bloat.  
**Status:** Fixed

---

### BUG-003c — Delete Photos Not Working

**Symptom:** Deleting photos in edit mode shows success message but photos remain.  
**Root Cause:** The delete operation likely not properly executing or not committing the delete to database.  
**Impact:** Users cannot remove unwanted photos.  
**Status:** Fixed

---

### BUG-003d — Work Report Photo Print Layout Issues

**Symptom:** Photos in print preview show one per row when large, not side-by-side before/after.  
**Root Cause:** CSS print styles not implementing side-by-side layout for before/after photos.  
**Impact:** Poor print output, excessive pages.  
**Status:** Fixed

---

### BUG-001c — Dashboard Shows "Buat Logsheet Baru" to CLIENT Role

**Symptom:** In dashboard project cards, the "Buat Logsheet Baru" button is visible to CLIENT role users who should only have read + sign access.  
**Root Cause:** Dashboard doesn't check RBAC before showing create buttons.  
**Impact:** CLIENT role sees action buttons they shouldn't have access to.  
**Status:** Fixed

---

### BUG-002d — CLIENT_PIC Can't View Work Reports

**Symptom:** CLIENT_PIC (CLIENT_SUPERVISOR) role cannot view work reports - no way to access them.  
**Root Cause:** Work report table date column not clickable, no preview action available.  
**Fix:** Made date column clickable in work report table to open preview dialog, enabling CLIENT_PIC to view work reports.  
**Status:** Fixed

---

### BUG-002e — How Do CLIENT Roles Open Work Report

**Symptom:** CLIENT role (non-PIC) needs to view assigned project work reports but no way to access them.  
**Root Cause:** No preview action available for CLIENT role - actions column hidden but no alternative access method.  
**Fix:** Made date column clickable to open preview dialog, providing CLIENT role a way to view work reports.  
**Status:** Fixed

---

### BUG-003g — Edit Work Report Shows Empty Fields + Photos Not Refreshing

**Symptom:** When clicking "Ubah" (Edit) on a work report, the form opens but shows today's date and empty fields (time, situation, work done, etc.) instead of the actual work report data. Also, deleted photos reappear after saving and reopening.

**Root Cause:** FIVE issues found through systematic debugging:

1. **Form fields not updating**: `useForm` `defaultValues` only applies on initial render, not when `effectiveData` is populated after async fetch.
2. **Dialog doesn't unmount children**: CrudDialog uses shadcn/ui Dialog which keeps children MOUNTED (just hidden with CSS) when closed. This means when reopening the edit dialog, the useEffect doesn't re-run because the component never unmounted.
3. **Stale closure in async onSubmit**: `deletedPhotoIds` state was used directly in the async `onSubmit` function. JavaScript closures capture values at function definition time, NOT execution time.
4. **RBAC permission denied**: The delete action required `'delete'` capability, but TECHNICIAN role only has `'CRU'` (no 'D'). The action was rejected with "Unauthorized" before reaching the database.
5. **Photos reappearing**: Due to #4, the delete action never executed.

**Fix:**

1. Added `useEffect` with `form.reset()` to update form fields when `effectiveData?.id` changes
2. Added `key={editingRow?.id || 'new'}` to WorkReportForm - forces React to completely REMOUNT the component when opening edit dialog
3. Added `deletedPhotoIdsRef` pattern to avoid stale closure
4. Changed RBAC from `capability: 'delete'` to `capability: 'update'` for deleteWorkReportPhotoAction - deleting photos is part of updating the work report

**Status:** Fixed

---

### BUG-003f — Logsheet Photo Print Layout Not Side-by-Side

**Symptom:** Logsheet water meter photo print preview shows one per row, not side-by-side before/after.  
**Root Cause:** Water meter photos in DocumentationSection are displayed as separate vertical items instead of side-by-side in a 2-column grid.  
**Fix:** Changed water meter photo rendering to use side-by-side grid layout with a merged "WATER METER" header spanning both columns, matching Work Report print preview pattern.  
**Status:** Fixed (improved with merged header)

---

### BUG-014 — No Attendance History Table Shown to Technician

**Symptom:** Technician attendance page only shows today's status and clock in/out - no history table visible.  
**Root Cause:** The attendance page lacked a DataTable component for viewing past attendance records. The existing `listAttendance` service required admin/supervisor role, preventing technicians from accessing their own history.

**Fix:**

1. Added `listOwnAttendance` service function in `src/features/attendance/service.ts` that fetches attendance for a specific user without admin check
2. Added `getMyAttendanceHistoryAction` in `src/features/attendance/actions.ts` for technicians to fetch their own history
3. Created columns definition in `src/app/(main)/attendance/components/columns.tsx`
4. Updated attendance page to include date range filters and DataTable showing attendance history

**Status:** Fixed

## 🟠 P1 — High Priority

| Bug ID  | Module      | Title                                                                                             | Status |
| :------ | :---------- | :------------------------------------------------------------------------------------------------ | :----- |
| BUG-004 | Logsheet    | No loading indicator when creating a logsheet (~3s delay)                                         | Fixed  |
| BUG-005 | Logsheet    | No duplicate logsheet guard — two logsheets can be created for the same project on the same day   | Fixed  |
| BUG-006 | Logsheet    | No PIC approval workflow after technician submits logsheet                                        | Fixed  |
| BUG-007 | Logsheet    | Rejected logsheet remains locked instead of unlocking for re-entry                                | Fixed  |
| BUG-008 | Logsheet    | Action buttons not sticky — require scrolling to the top on long mobile forms                     | Fixed  |
| BUG-009 | Work Report | Work report photo button overlaps with preview and overflows left                                 | Fixed  |
| BUG-010 | Summary Rpt | Technician can access summary reports (FSD: admin/client only)                                    | Fixed  |
| BUG-011 | Summary Rpt | No loading indicator when generating a summary report                                             | Fixed  |
| BUG-012 | Summary Rpt | Print preview content does not fit the page (tables overflow)                                     | Fixed  |
| BUG-013 | Attendance  | Absence input is not restricted to technician role                                                | Fixed  |
| BUG-014 | Attendance  | No attendance history table shown to technician                                                   | Fixed  |
| BUG-015 | Attendance  | No "Not checked in today" prompt or checkout button on technician dashboard                       | Fixed  |
| BUG-016 | Project     | New project can be created without assigning a CLIENT_PIC                                         | Fixed  |
| BUG-017 | Permissions | Chemicals and Parameters pages are accessible to non-admin roles (nav hidden but route unguarded) | Fixed  |

### BUG-004 — No Loading Indicator on Logsheet Creation

**Symptom:** After clicking "Create Logsheet", there is a ~3-second delay with no visual feedback. Users may click again, creating duplicate logsheets.  
**Fix:** Add `isPending` loading state to the create button or show a skeleton/spinner.  
**Status:** Fixed (Loader2 spinner added to dashboard "Buat Log Sheet Baru" button)

---

### BUG-005 — No Duplicate Logsheet Guard Per Day Per Project

**Symptom:** Two logsheets can be created for the same project on the same day.  
**Root Cause:** `createLogSheet` service does not check for an existing logsheet on the same `date` + `projectId`.  
**Fix:**

- Added `@@unique([projectId, date])` constraint to `LogSheet` model in `prisma/schema/log-sheets.prisma`
- Added pre-check in `createLogSheet` service to query for existing logsheet before creating
- Applied constraint to database via `prisma db push`

**Status:** Fixed (2026-03-12)

---

### BUG-006 & BUG-007 — Missing PIC Approval Workflow

**Symptom:** After a technician submits a logsheet, the PIC has no in-app signal or enforced action to approve it. If the PIC rejects, the logsheet stays locked rather than unlocking for technician correction.  
**Business Impact:** Logsheets are not counted until approved; this blocks reporting accuracy.

**Fix (2026-03-12):**

1. **Prisma Schema** (`prisma/schema/log-sheets.prisma`):
   - Added `rejectedAt`, `rejectedByUserId`, `rejectionReason` fields to `LogSheet` model
   - Added `rejectedBy` relation to `User` model

2. **Status Transition Logic** (`src/features/log-sheets/log-sheet-status.ts`):
   - Modified `decideLogSheetStatusTransition` to allow SUBMITTED → DRAFT transition (rejection)
   - Only `isInternalPic` (ADMIN, SUPERVISOR with PROJECT_PIC assignment) can reject

3. **Status Service** (`src/features/log-sheets/log-sheet-status.service.ts`):
   - Added `options?: { rejectionReason?: string }` parameter to `updateLogSheetStatus`
   - Added `isClientPic` check for CLIENT_SUPERVISOR role with CLIENT_PIC assignment
   - Stores rejection reason, timestamp, and user ID when transitioning to DRAFT from SUBMITTED

4. **Status Notifications** (`src/features/log-sheets/status-with-notifications.ts`):
   - Extended input type to include optional `rejectionReason`

5. **Actions** (`src/features/log-sheets/actions.ts`):
   - Added `rejectLogSheetAction` with RBAC:
     - Only CLIENT_SUPERVISOR with CLIENT_PIC assignment OR ADMIN/SUPERVISOR can reject
     - Validates project assignment for CLIENT_SUPERVISOR role
   - Returns logsheet to DRAFT status with optional rejection reason

6. **Types**:
   - Updated `ILogSheet` interface in `src/features/log-sheets/types.ts` with rejection fields
   - Updated `TDetail` in `src/app/(main)/log-sheets/[projectId]/[logSheetId]/types.ts`
   - Updated `TPrismaLogSheetFields` in `src/features/log-sheets/dto.ts`

7. **UI** (`src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`):
   - Added reject dialog with reason textarea
   - Added "Tolak" button in CLIENT_SUPERVISOR preview mode (only shows when status is SUBMITTED)
   - Shows rejection reason banner if logsheet was previously rejected

**Status:** Fixed (2026-03-12)

---

### BUG-012 — Print Preview Tables Overflow Page

**Symptom:** Print preview tables overflow the page width - Water Quality and Condenser Approach tables with 31 days of data exceed A4 landscape page width.  
**Root Cause:** No proper `@media print` CSS handling for wide tables - missing overflow handling and scaling.

**Fix:**

1. Updated `@media print` styles in `print/page.tsx`:
   - Added `overflow-x: visible` to table sections
   - Added `white-space: nowrap` to table cells to prevent line breaks
   - Added `page-break-inside: avoid` to prevent table row breaks
   - Added `.analytics-table-wrapper` with proper overflow handling
   - Set max-width constraint (277mm) for landscape A4

2. Updated `WaterQualityTable` component:
   - Added wrapper div with `print:overflow-visible` class
   - Added `analytics-table-wrapper` container with overflow handling

3. Updated `CondenserApproachTable` component:
   - Same wrapper pattern as WaterQualityTable

**Status:** Fixed

---

### BUG-013 — Absence Input Not Restricted to Technician Role

**Symptom:** Non-technician roles can mark attendance (clock in/out), which should only be allowed for TECHNICIAN role.  
**Root Cause:** `clockInAction` and `clockOutAction` only checked RBAC capability (ATTENDANCE:CRU), which allowed both TECHNICIAN and CLIENT_TECHNICIAN roles to mark attendance.

**Fix:**

1. Added role check in `src/features/attendance/actions.ts`:
   - `clockInAction`: Added check `if (actor.role !== 'TECHNICIAN') throw new Error('Unauthorized: Only technicians can mark attendance')`
   - `clockOutAction`: Added same role check

2. Updated `src/app/(main)/attendance/page.tsx`:
   - Added `useSession` hook import
   - Added `canMarkAttendance` check: `actor?.role === 'TECHNICIAN'`
   - Modified `canClockIn` and `canClockOut` to depend on `canMarkAttendance`
   - Clock-in/clock-out inputs are now hidden for non-TECHNICIAN roles

3. **SUPERVISOR (internal PIC) attendance view:**

   **Symptom:** SUPERVISOR role sees "Belum Absen Masuk" (their own attendance) instead of their assigned technicians' attendance.

   **Root Cause:** Attendance page only had special handling for CLIENT_SUPERVISOR, not for SUPERVISOR (internal PIC).

   **Fix:**
   1. Added `getTechniciansForSupervisorAction` in `src/features/attendance/actions.ts`:
      - New server action that checks for `actor.role === 'SUPERVISOR'`
      - Calls new service function `getTechniciansForSupervisor`
   2. Added `getTechniciansForSupervisor` service function in `src/features/attendance/service.ts`:
      - Gets project IDs where user has `PROJECT_PIC` assignment
      - Gets all technicians assigned to those projects
      - Returns technicians with today's attendance status
   3. Added `SupervisorAttendanceView` component in `src/app/(main)/attendance/page.tsx`:
      - Similar to `PicAttendanceView` but uses `getTechniciansForSupervisorAction`
   4. Updated `AttendancePage` to check for SUPERVISOR role:
      - Added role check: `actor?.role === 'SUPERVISOR'` returns `<SupervisorAttendanceView />`

   **Status:** Fixed

---

### BUG-016 — New Project Can Be Created Without CLIENT_PIC Assignment

**Symptom:** Users can create a project without assigning a CLIENT_PIC, then receive a generic server error without understanding what's missing.  
**Root Cause:** Server-side validation exists but client-side form doesn't display validation error to user.

**Fix (2026-03-13):**

1. **Server-side (already fixed):** Added validation in `CreateProjectSchema` (`src/features/projects/types.ts:88-100`) and `createProject` service to require at least one CLIENT_PIC assignment.

2. **Client-side (this fix):** Added visible form field error in `ProjectAssignmentsSection` component:
   - Added `assignmentsError` state to read validation errors from form state
   - Added error display below CLIENT_PIC select: `<p className="text-sm text-red-500 font-medium">{assignmentsError}</p>`
   - Error shows "Proyek harus memiliki minimal satu PIC Klien (CLIENT_PIC)" when validation fails

**Status:** Fixed

### BUG-017 — Parameters/Chemicals Routes Unguarded for Non-Admin

**Symptom:** Non-admin roles can directly navigate to `/parameters` and `/chemicals` even though the sidebar nav items are hidden.  
**Root Cause:** Nav visibility is filtered via RBAC, but the page-level `ensureAccess` check may be absent or misconfigured. Needs route-level verification.  
**Fix:** Added RBAC protection to both pages using `useSession` hook and client-side redirect for non-ADMIN users. Pages now redirect to `/` with an error toast if user role is not ADMIN.  
**Status:** Fixed

---

## 🟡 P2 — Medium Priority

| Bug ID  | Module      | Title                                                                                                              | Status |
| :------ | :---------- | :----------------------------------------------------------------------------------------------------------------- | :----- |
| BUG-018 | Input       | Number inputs (all forms) increment/decrement on scroll — unintended value changes                                 | Open   |
| BUG-019 | Logsheet    | Note field feels laggy when typing — needs debouncing or deferred save                                             | Open   |
| BUG-020 | Logsheet    | Consumption total shows negative when "after" < "before"                                                           | Fixed  |
| BUG-021 | Logsheet    | Unselected machine units are hidden on desktop (should show greyed-out)                                            | Open   |
| BUG-022 | Logsheet    | Consumption and Notes sections are visible at unit-level — misleading on mobile                                    | Open   |
| BUG-023 | Logsheet    | CT progress tracker shown regardless of data state (should only show when CT water cooling quality data exists)    | Open   |
| BUG-024 | Logsheet    | Technician view shows client signature input field (should be hidden until client signs)                           | Open   |
| BUG-025 | Logsheet    | Signature dialog shows two Submit buttons — one is non-functional                                                  | Open   |
| BUG-026 | Logsheet    | Numeric input position shifts when check icon appears after valid input                                            | Open   |
| BUG-027 | Logsheet    | Boolean checkbox position changes depending on label text length                                                   | Open   |
| BUG-028 | Logsheet    | Logsheet photo (water meter) shows before/after vertically — should be side-by-side in one row                     | Open   |
| BUG-029 | Work Report | Unit machine select dropdown cannot scroll to see all options                                                      | Fixed  |
| BUG-030 | Navigation  | Mobile sidebar remains open after navigating to another page                                                       | Fixed  |
| BUG-031 | Permissions | Admin can add client signature to bypass submission requirement (workaround)                                       | Open   |
| BUG-032 | Permissions | Admin can create logsheets and work reports without attribution tag                                                | Open   |
| BUG-033 | Permissions | Client role can see logsheet Create button (should be read-only portal)                                            | Open   |
| BUG-034 | UI          | All dialog headers should use primary background color with matching text (consistent with sidebar content header) | Fixed  |

### BUG-018 — Scroll-to-Increment on Number Inputs

**Symptom:** Scrolling while a number input is focused changes the value unintentionally — common on touchpads and scroll-wheel mice.  
**Fix:** Add `onWheel={(e) => e.currentTarget.blur()}` to all `<input type="number">` elements, or use a custom numeric input component.

---

### BUG-020 — Negative Consumption Total

**Symptom:** The calculated total consumption shows a negative value when "After" meter reading is less than "Before".  
**Fix:** Only display the calculated total when `after > before`; otherwise show `"—"` (em dash). Implement with debounced input to avoid mid-type flicker.

---

### BUG-032 — Admin Logsheet/Work Report Attribution

**Symptom:** When an admin creates a logsheet or work report on behalf of a technician, there is no visible attribution tag indicating it was admin-created.  
**Business Impact:** Internal audit trail is incomplete.

---

## 🔵 P3 — Low Priority / Clarification Needed

| Bug ID  | Module   | Title                                                                                            | Status         |
| :------ | :------- | :----------------------------------------------------------------------------------------------- | :------------- |
| BUG-035 | Project  | Machine ownership defaults to first in list — should default to CLIENT                           | Fixed          |
| BUG-036 | User     | Settings button in sidebar user-info section appears unused                                      | Open           |
| BUG-037 | User     | "Client Technician" role has no defined permissions or workflows                                 | Needs Clarity  |
| BUG-038 | Logsheet | Signature dialog cannot rotate to landscape on mobile                                            | Fixed          |
| BUG-039 | Logsheet | Logsheet signature save does not trigger optimistic update — full SSR re-fetch is too aggressive | Open (derived) |

---

## 🔬 Phase 3 — Source-Scan Derived Bugs

> These bugs were found by scanning source code and were **not** reported by the user.

| Bug ID  | Module       | Title                                                                                                                                                                                                                                                       | Severity | Status                  |
| :------ | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---------------------- |
| BUG-040 | Logsheet     | `console.log('[DEBUG]...')` remains in production action (`actions.ts:264`)                                                                                                                                                                                 | P2       | Open                    |
| BUG-041 | Work Report  | `uploadWorkReportPhotoAction` has no work-report ownership verification — any authenticated user could upload to another user's work report path                                                                                                            | P1       | Fixed                   |
| BUG-042 | Work Report  | `parseWorkReportFormData` uses unchecked `as string` casts — invalid form submissions will not throw a typed validation error                                                                                                                               | P2       | Fixed                   |
| BUG-043 | Logsheet     | `saveLogSheetEntriesAction` silently swallows notification errors — limit breach alerts may never fire without surfaced error                                                                                                                               | P2       | Fixed                   |
| BUG-044 | Projects     | `createProject` lacks server-side validation that at least one `CLIENT_PIC` assignment exists in the `assignments` payload                                                                                                                                  | P1       | Fixed (same as BUG-016) |
| BUG-045 | Logsheet     | `updateLogSheetStatusAction` can be called with `status: 'APPROVED'` by a TECHNICIAN if they have `LOG_SHEETS: update` RBAC — role-level guard not enforced in action layer                                                                                 | P1       | Fixed                   |
| BUG-046 | Auth/Session | `actionFactory.protected` wraps RBAC via capability check, but `submitLogSheetAction` and `approveLogSheetAction` both proxy through `updateLogSheetStatusAction` which has the same RBAC level — no distinction between submit-only and approve-only roles | P1       | Fixed                   |
| BUG-047 | Attendance   | No server-side guard on absence/attendance routes for non-technician access (mirrors BUG-017 pattern)                                                                                                                                                       | P2       | Fixed                   |
| BUG-048 | Summary Rpt  | `getAllLogSheetsAction` uses `RbacResource.REPORTS` but should use `RbacResource.LOG_SHEETS` — RBAC gap confirmed and fixed                                                                                                                                 | P2       | Fixed                   |

### BUG-040 — Debug `console.log` in Production Code

**Location:** `src/features/log-sheets/actions.ts:264`

```ts
console.log('[DEBUG] Checking for limit breaches...');
```

**Fix:** Replace with `logger.debug(...)` from `@/lib/logger` or remove entirely.

---

### BUG-041 — Work Report Photo Upload Lacks Ownership Verification

**Location:** `src/features/work-reports/actions.ts:uploadWorkReportPhotoAction`  
**Symptom:** The action verifies project access via `assertCanAccessProject`, but does **not** verify that the `workReportId` belongs to that project. An attacker with project access could upload files into another work report's path.  
**Fix:** Add `assertWorkReportBelongsToProject(workReportId, projectId)` before upload.

---

### BUG-045 — TECHNICIAN Can Trigger `APPROVED` Status Transition

**Location:** `src/features/log-sheets/actions.ts:approveLogSheetAction`  
**Symptom:** `approveLogSheetAction` calls `updateLogSheetStatusAction({ id, status: 'APPROVED' })`, which is guarded only by `LOG_SHEETS: update`. Since TECHNICIAN has `LOG_SHEETS: CRU`, they pass the RBAC check.  
**Fix:** Added explicit role check in `approveLogSheetAction` to ensure only CLIENT_SUPERVISOR with CLIENT_PIC assignment or ADMIN/SUPERVISOR can approve. TECHNICIAN is now blocked.  
**Status:** Fixed

---

### BUG-046 — No Role Distinction Between Submit and Approve in Action Layer

**Location:** `src/features/log-sheets/actions.ts:203–209`  
**Symptom:** `submitLogSheetAction` and `approveLogSheetAction` are thin wrappers over the same `updateLogSheetStatusAction`. Role enforcement is deferred entirely to the state machine.  
**Fix:** Added explicit role checks in `approveLogSheetAction` before passing to status update. Now only CLIENT_SUPERVISOR with CLIENT_PIC assignment or ADMIN/SUPERVISOR can approve.  
**Status:** Fixed

---

## Summary

| Category                            | Count |
| :---------------------------------- | ----: |
| P0 Blocker                          |     0 |
| P1 High                             |    14 |
| P2 Medium                           |    17 |
| P3 Low / Needs Clarity              |     5 |
| Phase 3 — Source-Scan (BUG-040–048) |     9 |
| **Total unique bugs**               |    45 |

> Note: BUG-044 is a source-level confirmation of BUG-016 (same issue, different layer) and is not counted twice.

---

## 2026-03-13 Fixes Applied

### BUG-020 — Consumption Input Debouncing

**Location:** `src/features/log-sheets/components/consumption-chemicals-section.tsx`  
**Problem:** Every keystroke triggers setEntryState, causing lag on low-end devices  
**Fix:** Added `useDebouncedValue` hook and modified `ConsumptionRow` to use local state with 300ms debounce before updating context

---

### BUG-030 — Mobile Sidebar Close Delay

**Location:** `src/components/sidebar-closer.tsx`  
**Problem:** Effect might run before route fully changes  
**Fix:** Added 100ms timeout delay to ensure navigation completes before closing sidebar

---

### BUG-034 — Dialog Headers Primary Background

**Location:** `src/components/action-cell.tsx`, `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`  
**Problem:** The class was being overridden by default styles  
**Fix:** Used more specific styling with `!important` flags and inline `style` attribute as fallback

---

### BUG-029 — Machine Select Scrolling

**Location:** `src/features/machines/components/machine-form-section.tsx`  
**Problem:** SelectContent dropdown cannot scroll to see all options  
**Fix:** Added `position="popper"` to SelectContent for proper popper positioning

---

### BUG-035 — Machine Ownership Default

**Location:** `src/features/machines/helpers.ts`  
**Problem:** Default ownership was CORINTEK, should be CLIENT  
**Fix:** Changed default ownership from `'CORINTEK'` to `'CLIENT'` in `createDefaultMachine`

---

### BUG-038 — Signature Dialog Portrait Mode

**Location:** `src/features/log-sheets/components/signature-section.tsx`  
**Problem:** Dialog not properly sized for portrait mobile  
**Fix:** Added `w-[95vw] h-[80vh] flex flex-col` classes for better mobile responsiveness

---

_Last updated: 2026-03-13 · Generated by source scan + user report_
