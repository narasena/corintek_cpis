## Recommendation (What to build next)
Focus on **LS-LOCK (submission locking + audit trail)** rather than full digital signatures.
- ROADMAP marks **digital signatures as deferred (P2)** and it requires a new signature-pad library.
- Client PIC assignment is already implemented at the project level, but the log sheet flow still lacks **immutable post-submit behavior** and **who-submitted/who-approved** traceability.

## Why this is the right “finish line”
- Prevents tampering after SUBMITTED/APPROVED (operationally critical).
- Aligns log sheets with the existing Work Report pattern (status transitions + lock-on-submit).
- Enables signature blocks on printouts to show correct names/dates even if the signature itself stays manual (paper).

## Implementation Plan (No new packages)
### 1) Add sign-off fields to LogSheet schema
- Update Prisma `LogSheet` model to include:
  - `submittedAt`, `submittedByUserId`
  - `approvedAt`, `approvedByUserId`
  - (optional) `lockedAt` or derive lock from status
- Create a Prisma migration.

### 2) Enforce locking in the backend (single source of truth)
- Add a shared guard (service-level preferred) like `assertLogSheetEditable(actor, logSheetId)`.
- Apply it to:
  - `updateLogSheet`
  - `upsertLogSheetEntries`
  - `upsertLogSheetPhotos`
  - `upsertLogSheetChemicalUsages`
  - `upsertLogSheetMachines`
- Admin override:
  - Allow ADMIN to edit SUBMITTED (optionally APPROVED) only via explicit override flag/path.

### 3) Record submitted/approved metadata during status transitions
- In `updateLogSheetStatus(actor, id, status)`:
  - When moving to SUBMITTED: set `submittedAt`, `submittedByUserId`.
  - When moving to APPROVED: set `approvedAt`, `approvedByUserId`.

### 4) Update UI to match locking rules
- In log sheet detail page:
  - Disable all inputs and the Save button when status != DRAFT.
  - Keep Print always available.
  - Keep Approve button only on SUBMITTED.
  - If an update is attempted while locked, show toast error with the server message.

### 5) Make the print “signature” area real (without digital drawing)
- Wire preview signature blocks to:
  - Technician/operator name from `submittedByUser` (or replacedBy if relevant).
  - Supervisor/PIC name from `approvedByUser`.
  - Optional: show Client PIC name from `ProjectAssignment` as a label-only line (still paper signature).

### 6) Quick verification checklist
- Create log sheet → edit/save works.
- Submit log sheet → entries/photos/machines/notes can no longer be changed.
- Approve log sheet → remains locked.
- Admin override (if enabled) → admin can edit as designed.
- Print preview shows correct names/dates.

## Files expected to change
- `prisma/schema/log-sheets.prisma` (+ new migration)
- `src/features/log-sheets/service.ts`
- `src/features/log-sheets/actions.ts`
- `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`
- `src/features/log-sheets/components/log-sheet-preview.tsx`

If you confirm, I’ll implement this slice end-to-end and validate the locking + print output.