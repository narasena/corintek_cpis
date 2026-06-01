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
| BUG-018 | Input       | Number inputs (all forms) increment/decrement on scroll — unintended value changes                | Open   |
| BUG-050 | Project     | Personnel assignments ignored on project creation                                                  | Fixed  |
| BUG-051 | Logsheet    | Logsheet submission blocked by strict numeric range validation — out-of-range values should be warnings-only | Fixed  |
| BUG-052 | Logsheet    | Logsheet approval blocked by strict numeric range validation — out-of-range values should be warnings-only on approval as well | Fixed  |

### BUG-017 — Parameters/Chemicals Routes Unguarded for Non-Admin

**Symptom:** Non-admin roles can directly navigate to `/parameters` and `/chemicals` even though the sidebar nav items are hidden.  
**Root Cause:** Nav visibility is filtered via RBAC, but the page-level `ensureAccess` check may be absent or misconfigured. Needs route-level verification.  
**Fix:** Added RBAC protection to both pages using `useSession` hook and client-side redirect for non-ADMIN users. Pages now redirect to `/` with an error toast if user role is not ADMIN.  
**Status:** Fixed

---

### BUG-018 — React Hooks Rules Violation (CRITICAL PATTERN)

**Symptom:** Runtime error: "Rendered more hooks than during the previous render" on Parameters and Chemicals pages.  
**Root Cause:** **Hooks called AFTER early return** — violates React's Rules of Hooks.

```tsx
// ❌ WRONG - hooks after early return
export default function Page() {
  const { user, isLoading } = useSession();

  if (isLoading) return null;  // Early return - no hooks called here

  const [state, setState] = useState([]);   // ERROR: Hook called after conditional!
  const handleEdit = () => {...};
  const columns = useMemo(...);              // ERROR: Hook called after conditional!
}
```

When `isLoading` is `true`, hooks are skipped. When it becomes `false`, hooks are called — **different order = crash**.

**Fix:** Move ALL hooks **before** the early return:

```tsx
// ✅ CORRECT - all hooks before early return
export default function Page() {
  const { user, isLoading } = useSession();

  // React hooks (useState, useEffect, useCallback, useMemo)
  const [state, setState] = useState([]);
  const fetchData = useCallback(async () => {...}, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  // Regular functions that hooks depend on
  const handleEdit = () => {...};

  // useMemo AFTER functions it depends on, but BEFORE early return
  const columns = useMemo(() => {...}, [fetchData]);

  // Early return at the END
  if (isLoading || !user) return null;

  return (...);
}
```

**Correct Hook Order:**

1. React/Next.js hooks (`useRouter`, `useSearchParams`, `useSession`)
2. All `useState` calls
3. All `useCallback` calls
4. All `useEffect` calls
5. Regular functions that hooks depend on
6. `useMemo` calls (functions it references must be defined first)
7. Early return `if` statement
8. Render

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

### BUG-050 — Project Personnel Assignments Not Persisted on Creation

**Symptom:** When creating a project, the personnel assignment fields (PIC Project, Teknisi, PIC Klien) are displayed and can be filled, but the data is completely ignored upon submission. The assignments are not saved to the database. Users must edit the project again after creation to add assignments, causing significant UX friction.

**Root Cause:** In `createProject()` service function, the `assignments` array was validated but then destructured out and discarded during project creation. No code persisted the assignments to the `ProjectAssignment` table.

**Fix:** Modified `src/features/projects/service.ts:createProject()` to persist assignments within the same transaction. After creating the project (and machines), the code now calls `applyProjectAssignmentsTransaction(tx, newProject.id, data.assignments)` to create assignment records. Existing validation ensures at least one CLIENT_PIC is present.

**Additional Changes:** Date formatting in project table columns corrected to "12 Sep 2026" format; minor UI polish in project form layout and sticky headers.

**Status:** Fixed

---

### BUG-051 — Logsheet Submission Blocked by Strict Numeric Range Validation

**Symptom:** Logsheet submission fails when numeric entry values exceed defined parameter boundaries. The server returns errors like "Temperature: Nilai 105 di atas maksimum 100".

**Root Cause:** `validateLogSheetForSubmission` (src/features/log-sheets/log-sheet-status.service.ts) incorrectly enforced numeric range checks as hard blocking errors. Business rule: out-of-range values should be accepted with warnings (notifications) on submission; only missing signatures block.

**Fix:** Removed numeric range validation loop from `validateLogSheetForSubmission`. Range violations are now handled solely by `notifyLimitBreachesOnSubmission` in log-sheet-notifications.ts, which creates warning notifications without blocking. Signature checks remain mandatory.

**Files Modified:**
- `src/features/log-sheets/log-sheet-status.service.ts` — removed range validation loop; cleaned unused import.
- `src/features/log-sheets/service.characterization.test.ts` — updated 3 test cases to accept out-of-range values.
- `src/features/log-sheets/status-with-notifications.test.ts` — corrected expectations to include `undefined` options argument.
- `src/features/log-sheets/actions.characterization.test.ts` — updated mock to use real implementation; fixed call expectations.

**Verification:**
- All 78 service characterization tests pass.
- All 4 status-with-notifications tests pass.
- All 50 actions characterization tests pass.
- Manual: Submitting logsheet with temperature 150°C (max 100) succeeds with warning toast.
- Approval validation still enforces range checks (unchanged).

**Status:** Fixed

---

### BUG-052 — Logsheet Approval Blocked by Strict Numeric Range Validation

**Symptom:** Logsheet approval fails when numeric entry values exceed parameter boundaries, even though submission now accepts such values. This creates an inconsistency where submittable data cannot be approved.

**Root Cause:** `validateLogSheetApprovalDetail` in `approval-validation.ts` still enforces numeric range checks as hard errors via `collectApprovalRangeErrors`. Business rule: range violations are warnings only and should not block approval.

**Fix:** Removed numeric range validation from approval flow. Deleted `collectApprovalRangeErrors` function and its call. Required field checks remain enforced.

**Files Modified:**
- `src/features/log-sheets/approval-validation.ts`

**Verification:**
- All logsheet tests pass.
- Approval with out-of-range numeric values now succeeds.
- Required field validation still functional.

---

### BUG-053 — Supabase Keep-Alive Workflow Fails Silently (Env-Scoped Secrets Not Attached)

**Location:** `.github/workflows/supabase-keep-alive.yaml` (deleted)  
**Symptom:** The scheduled (Mon/Thu 00:00 UTC) and `workflow_dispatch` runs of "Keep Supabase Alive" exit with code 3 (`curl: (3) URL rejected: No host part in the URL`). Rendered curl command shows `apikey:` and `Authorization: Bearer` headers with empty values. The intended Supabase REST API ping never happened, so the free-tier inactivity-pause guard was non-functional.  
**Root Cause:** `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured in GitHub `Preview` environment(s), not at the repository level. The `ping` job had no `environment:` field, so env-scoped secrets did not propagate to the run context and rendered as empty strings.  
**Fix:** Two-step:
1. (interim) Added `environment: Preview` to the `ping` job. Verified by push to `staging` retriggering the workflow — run `26758920652` concluded `success`. (commit `3aff6c8`)
2. (final) Replaced the entire GHA mechanism with Supabase's built-in `pg_cron` (in-DB scheduler). Deleted `.github/workflows/supabase-keep-alive.yaml`. Each project (UAT `igrnumqjyffzirwzklch` and main preview `krzxfiofhvvsildjgi`) gets its own `cron.schedule('keep-alive', '0 0 * * 1,4', $$ SELECT 1 $$)` job.  
**Verification (2026-06-01):** User ran the per-minute self-test in ≥1 project:
```sql
SELECT cron.schedule('keep-alive-probe', '* * * * *', $$ SELECT 1 $$);
-- waited 2-3 min
SELECT start_time, status FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'keep-alive-probe')
ORDER BY start_time DESC LIMIT 5;
SELECT cron.unschedule('keep-alive-probe');
```
Result: 2 rows with `status='succeeded'`. pg_cron scheduler is operational in the tested project.  
**Why P3:** does not block dev or affect app data; defeats a keep-alive guard for the free-tier Supabase project only. Cron failure went unnoticed because GHA schedules do not page on failure.  
**Status:** Verified

**Status:** Fixed

---

## 🟠 P1 — High Priority

| Bug ID  | Module       | Title                                                                                                                                                                                                                                                       | Status |
| :------ | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| BUG-018 | Input        | Number inputs (all forms) increment/decrement on scroll — unintended value changes                                                                                                                                                                          | Open   |
| BUG-019 | Logsheet     | Note field feels laggy when typing — needs debouncing or deferred save                                                                                                                                                                                      | Open   |
| BUG-020 | Logsheet     | Consumption total shows negative when "after" < "before"                                                                                                                                                                                                     | Fixed  |
| BUG-021 | Logsheet     | Unselected machine units are hidden on desktop (should show greyed-out)                                                                                                                                                                                     | Open   |
| BUG-022 | Logsheet     | Consumption and Notes sections are visible at unit-level — misleading on mobile                                                                                                                                                                             | Open   |
| BUG-023 | Logsheet     | CT progress tracker shown regardless of data state (should only show when CT water cooling quality data exists)                                                                                                                                             | Open   |
| BUG-024 | Logsheet     | Technician view shows client signature input field (should be hidden until client signs)                                                                                                                                                                     | Open   |
| BUG-025 | Logsheet     | Signature dialog shows two Submit buttons — one is non-functional                                                                                                                                                                                            | Open   |
| BUG-026 | Logsheet     | Numeric input position shifts when check icon appears after valid input                                                                                                                                                                                      | Open   |
| BUG-027 | Logsheet     | Boolean checkbox position changes depending on label text length                                                                                                                                                                                             | Open   |
| BUG-028 | Logsheet     | Logsheet photo (water meter) shows before/after vertically — should be side-by-side in one row                                                                                                                                                               | Open   |
| BUG-029 | Work Report  | Unit machine select dropdown cannot scroll to see all options                                                                                                                                                                                               | Fixed  |
| BUG-030 | Navigation   | Mobile sidebar remains open after navigating to another page                                                                                                                                                                                                | Fixed  |
| BUG-031 | Permissions  | Admin can add client signature to bypass submission requirement (workaround)                                                                                                                                                                                 | Open   |
| BUG-032 | Permissions  | Admin can create logsheets and work reports without attribution tag                                                                                                                                                                                         | Open   |
| BUG-033 | Permissions  | Client role can see logsheet Create button (should be read-only portal)                                                                                                                                                                                     | Open   |
| BUG-034 | UI           | All dialog headers should use primary background color with matching text (consistent with sidebar content header)                                                                                                                                          | Fixed  |
| BUG-WR-001 | Work Report | Stale `existingPhotos` state after signature refresh prevents form submission. Form's local photo state not synchronized with updated `photos` prop from parent after signature-triggered refetch, causing "Failed to upload photos" error on submit.       | Fixed  |
| BUG-WR-002 | Work Report | CLIENT_TECHNICIAN can sign as client PIC without active `CLIENT_PIC` assignment — authorization bypass. Should require assignment like TECHNICIAN role.                                                                                                      | Fixed  |
| BUG-WR-003 | Work Report | SUPERVISOR fallback for technician signature missing — supervisor should be able to sign as technician when no technician assigned, mirroring logsheet policy.                                                                                              | Fixed  |
| BUG-WR-004 | Work Report | CLIENT_SUPERVISOR fallback for client PIC signature missing — should sign without explicit assignment.                                                                                                                                                      | Fixed  |
| BUG-WR-005 | Work Report | Work report SUBMITTED status transition allowed without both signatures. Missing guard in `updateWorkReportStatus`.                                                                                                                                         | Fixed  |

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
| BUG-053 | CI       | Supabase keep-alive workflow fails silently — env-scoped secrets not attached to job | Verified |

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
| BUG-049 | Logsheet     | Water meter camera capture can save black image when stream is stopped before canvas copies current frame                                                                                                                                                   | P1       | Fixed                   |

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

### BUG-049 — Water Meter Camera Capture Saves Black Image

**Location:** `src/components/camera-input.tsx:capturePhoto`  
**Symptom:** Logsheet water meter camera preview is visible, but captured photo is black, especially on first attempt on mobile/Vercel production.  
**Root Cause:** `capturePhoto()` stopped the `MediaStream` before `processImagePipeline(video, ...)` copied pixels from the live `<video>` into canvas. On mobile browsers, stopping tracks can blank the hardware-backed video surface immediately, so `canvas.drawImage(video, ...)` reads black.  
**Fix:** Capture/compress from active video first, then stop camera after canvas processing succeeds. Remove forced readiness fallback that can enable capture before a drawable frame exists.  
**Status:** Fixed

---

## Summary

| Category                            | Count |
| :---------------------------------- | ----: |
| P0 Blocker                          |     0 |
| P1 High                             |    20 |
| P2 Medium                           |    17 |
| P3 Low / Needs Clarity              |     6 |
| Phase 3 — Source-Scan (BUG-040–049) |    10 |
| **Total unique bugs**               |    53 |

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

### BUG-038 — Signature Dialog Layout

**Location:** `src/features/log-sheets/components/signature-section.tsx`, `signature-pad.tsx`  
**Problem:** Dialog too small, canvas not visible, buttons not aligned, not responsive to portrait/landscape  
**Fix (2026-03-13):**

| Issue               | Fix                                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Dialog too small    | Changed to `w-screen max-w-none h-screen sm:h-[85vh] sm:w-[95vw] sm:max-w-2xl` - fullscreen on mobile, responsive on desktop |
| Canvas not visible  | Changed `min-h-[150px]` to `min-h-[200px]`, simplified container flex layout                                                 |
| Buttons not aligned | Moved "Ulangi" button from SignaturePad to inline with "Batal/Simpan" using `flex justify-between`                           |
| Portrait/landscape  | Full viewport on mobile (`w-screen h-screen`), constrained on desktop (`sm:` breakpoints)                                    |

**Status:** Fixed

---

_Last updated: 2026-06-01 · Generated by source scan + user report_
