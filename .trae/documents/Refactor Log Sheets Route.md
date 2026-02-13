## Progress

- Slice 1 completed: deduplicated preview/header usage for log sheet detail page; deleted app-local duplicates; detail page uses shared `makeEntryKey`.
- Slice 2 completed: extracted log sheet detail page orchestration into route-local hooks; moved large mobile entry card into a component; kept behavior stable.
- Slice 3 completed: fixed revalidation paths to include `projectId`; consolidated empty-entry detection and `makeEntryKey` usage into feature utils.

## Scope (One Module)

- Target: `src/app/(main)/log-sheets/**` (UI) and `src/features/log-sheets/**` (shared UI + actions/service).
- Goal: Remove spaghetti by separating concerns (UI vs state/orchestration), eliminate duplication, and standardize error/refresh behavior.

## Invariants (Must Not Change)

- Routes and behavior: `/log-sheets`, `/log-sheets/[projectId]`, `/log-sheets/[projectId]/[logSheetId]`.
- Data model + Prisma schema untouched.
- Server boundary: UI calls Server Actions; Actions validate + RBAC + service calls.
- Print output stays single-page A4 layout and identical content.
- No new npm packages.

## Current Flow (Baseline)

- List pages (`/log-sheets`, `/log-sheets/[projectId]`) are client components that fetch via actions on mount and render `DataTable`.
- Detail page (`/log-sheets/[projectId]/[logSheetId]`) is the main hotspot:
  - Fetches detail via `getLogSheetDetailAction` and normalizes entries into `entryState` keyed by `parameterId:machineId:role`.
  - Owns: validation, upload orchestration, saving entries/chemicals/machines, submit/approve transitions, mobile+desktop rendering, print/preview.
- Duplication existed between app route components and feature slice:
  - Preview + header components were duplicated.
  - `makeEntryKey` was duplicated in multiple places.

## Refactor Slices (Small, Safe, User-Visible)

### Slice 1 — Kill Duplication (Low Risk, High ROI) (DONE)

**Outcome:** Same UI/print output, fewer files, single source of truth.

- Replace app-local duplicates and import from feature slice:
  - Detail page uses feature preview: [log-sheet-preview.tsx](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/components/log-sheet-preview.tsx)
  - Detail page uses shared key helper: [utils.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/utils.ts)
- Deleted app-local duplicates under `src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/` to prevent drift.
- Rollback: revert imports in the detail page and restore deleted files.

### Slice 2 — Detail Page: Move Logic Into Hooks (Main Spaghetti Fix) (DONE)

**Outcome:** Detail page becomes mostly JSX; orchestration lives in hooks; large inline UI blocks become components.

- Hooks introduced (no behavior change):
  - `useLogSheetDetailData(logSheetId)`
  - `useLogSheetTechnicians()`
  - `useLogSheetDraftState(detail)`
  - `useLogSheetDerived(...)`
  - `useLogSheetValidation(...)`
  - `useLogSheetDraftSaver(...)`
  - `useLogSheetActiveMachines(...)`
- Presentational components:
  - `mobile-entry-card.tsx`
- Type cleanup:
  - Extracted route-local types into `types.ts`.

### Slice 3 — Feature Layer DRY + Correctness (DONE)

**Outcome:** Less duplication and fewer stale refreshes.

- Fixed revalidation-path mismatch in server actions (detail path now includes `projectId` + `logSheetId`).
- Consolidated duplicated “empty entry” detection (actions vs service) into one helper: `isLogSheetEntryEmpty`.
- Made service import `makeEntryKey` from feature `utils.ts` to remove local copies.

### Slice 4 — Minor Cleanup (Optional) (TODO)

- Rename misleading controlled props like `initialUsages` -> `usages` in `ChemicalUsageSection`.
- Improve date handling in `LogSheetForm` to avoid timezone drift.
- Standardize Indonesian date formatting.

## Risk Notes

- Slice 2 is highest risk: regressions in keying, machine-dependent rendering, or save/upload ordering.
- Print preview must remain A4 single-page; DOM structure changes can affect layout.

## Verification Gates (Manual)

- List pages:
  - `/log-sheets` loads projects and navigation works.
  - `/log-sheets/[projectId]` list loads; create/delete works.
- Detail page:
  - Toggle active machines; inputs appear/disappear.
  - Save draft persists values and photos; preview matches; print opens browser print and fits A4.
  - Submit/approve transitions still work.
