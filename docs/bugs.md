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
| BUG-003e | Work Report | Work Report Photo Delete Not Persisted                                          | Open   |
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

### BUG-003e — Photo Delete Not Persisted

**Symptom:** Photos deleted in edit mode show as removed, save shows success, but on re-open the deleted photos reappear.  
**Root Cause:** The `existingPhotos` state is initialized from `effectiveData?.photos` only on initial render, but when the form is opened for a different work report date, the state isn't properly refreshed.  
**Clarification:** Cannot be fixed by simply syncing photos on data fetch - this causes another bug where opening a work report shows wrong date and empty data. Needs deeper investigation of the form's data flow architecture.  
**Status:** Open

---

### BUG-003f — Logsheet Photo Print Layout Not Side-by-Side

**Symptom:** Logsheet water meter photo print preview shows one per row, not side-by-side before/after.  
**Root Cause:** Water meter photos in DocumentationSection are displayed as separate vertical items instead of side-by-side in a 2-column grid.  
**Fix:** Changed water meter photo rendering to use side-by-side grid layout with a merged "WATER METER" header spanning both columns, matching Work Report print preview pattern.  
**Status:** Fixed (improved with merged header)

## 🟠 P1 — High Priority

| Bug ID  | Module      | Title                                                                                             | Status |
| :------ | :---------- | :------------------------------------------------------------------------------------------------ | :----- |
| BUG-004 | Logsheet    | No loading indicator when creating a logsheet (~3s delay)                                         | Open   |
| BUG-005 | Logsheet    | No duplicate logsheet guard — two logsheets can be created for the same project on the same day   | Open   |
| BUG-006 | Logsheet    | No PIC approval workflow after technician submits logsheet                                        | Open   |
| BUG-007 | Logsheet    | Rejected logsheet remains locked instead of unlocking for re-entry                                | Open   |
| BUG-008 | Logsheet    | Action buttons not sticky — require scrolling to the top on long mobile forms                     | Open   |
| BUG-009 | Work Report | Work report photo button overlaps with preview and overflows left                                 | Open   |
| BUG-010 | Summary Rpt | Technician can access summary reports (FSD: admin/client only)                                    | Open   |
| BUG-011 | Summary Rpt | No loading indicator when generating a summary report                                             | Open   |
| BUG-012 | Summary Rpt | Print preview content does not fit the page (tables overflow)                                     | Open   |
| BUG-013 | Attendance  | Absence input is not restricted to technician role                                                | Open   |
| BUG-014 | Attendance  | No attendance history table shown to technician                                                   | Open   |
| BUG-015 | Attendance  | No "Not checked in today" prompt or checkout button on technician dashboard                       | Open   |
| BUG-016 | Project     | New project can be created without assigning a CLIENT_PIC                                         | Open   |
| BUG-017 | Permissions | Chemicals and Parameters pages are accessible to non-admin roles (nav hidden but route unguarded) | Open   |

### BUG-004 — No Loading Indicator on Logsheet Creation

**Symptom:** After clicking "Create Logsheet", there is a ~3-second delay with no visual feedback. Users may click again, creating duplicate logsheets.  
**Fix:** Add `isPending` loading state to the create button or show a skeleton/spinner.

---

### BUG-005 — No Duplicate Logsheet Guard Per Day Per Project

**Symptom:** Two logsheets can be created for the same project on the same day.  
**Root Cause:** `createLogSheet` service does not check for an existing logsheet on the same `date` + `projectId`.  
**Fix:** Add unique constraint at service level or DB level (`@@unique([projectId, date])`).

---

### BUG-006 & BUG-007 — Missing PIC Approval Workflow

**Symptom:** After a technician submits a logsheet, the PIC has no in-app signal or enforced action to approve it. If the PIC rejects, the logsheet stays locked rather than unlocking for technician correction.  
**Business Impact:** Logsheets are not counted until approved; this blocks reporting accuracy.

---

### BUG-016 — Project Created Without CLIENT_PIC Assignment

**Symptom:** The project creation flow allows saving without assigning at least one CLIENT_PIC.  
**Root Cause:** `createProject` service has no validation that checks `assignments` for a `CLIENT_PIC` entry.  
**Fix:** Add server-side guard in `createProject` or `createProjectAction`.

---

### BUG-017 — Parameters/Chemicals Routes Unguarded for Non-Admin

**Symptom:** Non-admin roles can directly navigate to `/parameters` and `/chemicals` even though the sidebar nav items are hidden.  
**Root Cause:** Nav visibility is filtered via RBAC, but the page-level `ensureAccess` check may be absent or misconfigured. Needs route-level verification.

---

## 🟡 P2 — Medium Priority

| Bug ID  | Module      | Title                                                                                                              | Status |
| :------ | :---------- | :----------------------------------------------------------------------------------------------------------------- | :----- |
| BUG-018 | Input       | Number inputs (all forms) increment/decrement on scroll — unintended value changes                                 | Open   |
| BUG-019 | Logsheet    | Note field feels laggy when typing — needs debouncing or deferred save                                             | Open   |
| BUG-020 | Logsheet    | Consumption total shows negative when "after" < "before"                                                           | Open   |
| BUG-021 | Logsheet    | Unselected machine units are hidden on desktop (should show greyed-out)                                            | Open   |
| BUG-022 | Logsheet    | Consumption and Notes sections are visible at unit-level — misleading on mobile                                    | Open   |
| BUG-023 | Logsheet    | CT progress tracker shown regardless of data state (should only show when CT water cooling quality data exists)    | Open   |
| BUG-024 | Logsheet    | Technician view shows client signature input field (should be hidden until client signs)                           | Open   |
| BUG-025 | Logsheet    | Signature dialog shows two Submit buttons — one is non-functional                                                  | Open   |
| BUG-026 | Logsheet    | Numeric input position shifts when check icon appears after valid input                                            | Open   |
| BUG-027 | Logsheet    | Boolean checkbox position changes depending on label text length                                                   | Open   |
| BUG-028 | Logsheet    | Logsheet photo (water meter) shows before/after vertically — should be side-by-side in one row                     | Open   |
| BUG-029 | Work Report | Unit machine select dropdown cannot scroll to see all options                                                      | Open   |
| BUG-030 | Navigation  | Mobile sidebar remains open after navigating to another page                                                       | Open   |
| BUG-031 | Permissions | Admin can add client signature to bypass submission requirement (workaround)                                       | Open   |
| BUG-032 | Permissions | Admin can create logsheets and work reports without attribution tag                                                | Open   |
| BUG-033 | Permissions | Client role can see logsheet Create button (should be read-only portal)                                            | Open   |
| BUG-034 | UI          | All dialog headers should use primary background color with matching text (consistent with sidebar content header) | Open   |

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
| BUG-035 | Project  | Machine ownership defaults to first in list — should default to CLIENT                           | Open           |
| BUG-036 | User     | Settings button in sidebar user-info section appears unused                                      | Open           |
| BUG-037 | User     | "Client Technician" role has no defined permissions or workflows                                 | Needs Clarity  |
| BUG-038 | Logsheet | Signature dialog cannot rotate to landscape on mobile                                            | Open           |
| BUG-039 | Logsheet | Logsheet signature save does not trigger optimistic update — full SSR re-fetch is too aggressive | Open (derived) |

---

## 🔬 Phase 3 — Source-Scan Derived Bugs

> These bugs were found by scanning source code and were **not** reported by the user.

| Bug ID  | Module       | Title                                                                                                                                                                                                                                                       | Severity | Status                 |
| :------ | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :--------------------- |
| BUG-040 | Logsheet     | `console.log('[DEBUG]...')` remains in production action (`actions.ts:264`)                                                                                                                                                                                 | P2       | Open                   |
| BUG-041 | Work Report  | `uploadWorkReportPhotoAction` has no work-report ownership verification — any authenticated user could upload to another user's work report path                                                                                                            | P1       | Open                   |
| BUG-042 | Work Report  | `parseWorkReportFormData` uses unchecked `as string` casts — invalid form submissions will not throw a typed validation error                                                                                                                               | P2       | Open                   |
| BUG-043 | Logsheet     | `saveLogSheetEntriesAction` silently swallows notification errors — limit breach alerts may never fire without surfaced error                                                                                                                               | P2       | Open                   |
| BUG-044 | Projects     | `createProject` lacks server-side validation that at least one `CLIENT_PIC` assignment exists in the `assignments` payload                                                                                                                                  | P1       | Open (same as BUG-016) |
| BUG-045 | Logsheet     | `updateLogSheetStatusAction` can be called with `status: 'APPROVED'` by a TECHNICIAN if they have `LOG_SHEETS: update` RBAC — role-level guard not enforced in action layer                                                                                 | P1       | Open                   |
| BUG-046 | Auth/Session | `actionFactory.protected` wraps RBAC via capability check, but `submitLogSheetAction` and `approveLogSheetAction` both proxy through `updateLogSheetStatusAction` which has the same RBAC level — no distinction between submit-only and approve-only roles | P1       | Open                   |
| BUG-047 | Attendance   | No server-side guard on absence/attendance routes for non-technician access (mirrors BUG-017 pattern)                                                                                                                                                       | P2       | Open                   |
| BUG-048 | Summary Rpt  | `getAllLogSheetsAction` uses `RbacResource.REPORTS` but summary report actions may use a different resource key — cross-checking needed to confirm no RBAC gap                                                                                              | P2       | Open                   |

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
**Symptom:** `approveLogSheetAction` calls `updateLogSheetStatusAction({ id, status: 'APPROVED' })`, which is guarded only by `LOG_SHEETS: update`. Since TECHNICIAN has `LOG_SHEETS: CRU`, they pass the RBAC check. The state machine (`decideLogSheetStatusTransition`) should block this, but this needs explicit testing.  
**Fix:** Confirm state machine blocks `TECHNICIAN → APPROVED` and add a regression test.

---

### BUG-046 — No Role Distinction Between Submit and Approve in Action Layer

**Location:** `src/features/log-sheets/actions.ts:203–209`  
**Symptom:** `submitLogSheetAction` and `approveLogSheetAction` are thin wrappers over the same `updateLogSheetStatusAction`. Role enforcement is deferred entirely to the state machine. A missing or incorrect state machine rule could silently allow unauthorized transitions.  
**Fix:** Add explicit role checks (`actor.role !== 'TECHNICIAN' && reject`) in the approve action before passing to status update.

---

## Summary

| Category                            |  Count |
| :---------------------------------- | -----: |
| P0 Blocker                          |      1 |
| P1 High                             |     14 |
| P2 Medium                           |     17 |
| P3 Low / Needs Clarity              |      5 |
| Phase 3 — Source-Scan (BUG-040–048) |      9 |
| **Total unique bugs**               | **45** |

> Note: BUG-044 is a source-level confirmation of BUG-016 (same issue, different layer) and is not counted twice.

---

_Last updated: 2026-03-11 · Generated by source scan + user report_
